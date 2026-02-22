/* ============================================================

   FPCS Design Mode Toggle — Admin-Only Visual Development Tool

   Part of TRAILS: Technology · Robotics · AI · Language · Skills



   Provides a floating toggle for admin users to switch between

   clean presentation view and design/development overlay mode.



   FEATURES:

   - Admin-only floating toggle (bottom-right corner)

   - Persistent state via localStorage (fpcs_design_mode)

   - .design-only elements revealed when active

   - .design-outline elements get dashed border overlay

   - .under-construction components get construction-stripe overlay

   - .chili-building animated sparkle border for ChiliGBot activity

   - Top-of-page DESIGN MODE banner when active

   - Waits for auth completion before injecting



   USAGE: Include after auth.js on any page:

   <script src="js/designmode.js"></script>



   Built by DanielZ — Realbotville Background Dev

   ============================================================ */

(function () {

  'use strict';



  // --- Constants ---

  var STORAGE_KEY = 'fpcs_design_mode';

  var BODY_CLASS = 'design-mode';

  var AUTH_POLL_INTERVAL = 300;

  var AUTH_FALLBACK_MS = 3000;

  var BANNER_ID = 'fpcs-design-banner';

  var TOGGLE_ID = 'fpcs-design-toggle';

  var STYLE_ID = 'fpcs-design-styles';



  // --- State ---

  var isActive = false;

  var toggleBtn = null;

  var bannerEl = null;



  // ============================================================

  //  STYLES — Injected inline, no external CSS dependency

  // ============================================================



  function getStyleSheet() {

    return [

      // --- Toggle Button ---

      '#' + TOGGLE_ID + ' {',

      '  position: fixed;',

      '  bottom: 20px;',

      '  right: 20px;',

      '  z-index: 9999;',

      '  background: rgba(167,139,250,0.15);',

      '  border: 1px solid rgba(167,139,250,0.4);',

      '  border-radius: 8px;',

      '  padding: 8px 16px;',

      '  font-size: 13px;',

      '  color: #a78bfa;',

      '  cursor: pointer;',

      '  font-family: inherit;',

      '  line-height: 1.4;',

      '  transition: all 0.2s ease;',

      '  user-select: none;',

      '  -webkit-user-select: none;',

      '}',

      '#' + TOGGLE_ID + ':hover {',

      '  background: rgba(167,139,250,0.3);',

      '  border-color: rgba(167,139,250,0.6);',

      '  box-shadow: 0 0 12px rgba(167,139,250,0.2);',

      '}',

      '#' + TOGGLE_ID + '.active {',

      '  background: rgba(167,139,250,0.25);',

      '  border-color: rgba(167,139,250,0.6);',

      '  box-shadow: 0 0 16px rgba(167,139,250,0.25);',

      '}',



      // --- Design Mode Banner ---

      '#' + BANNER_ID + ' {',

      '  position: fixed;',

      '  top: 0;',

      '  left: 0;',

      '  right: 0;',

      '  z-index: 9998;',

      '  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);',

      '  color: #fff;',

      '  text-align: center;',

      '  font-size: 11px;',

      '  font-weight: 700;',

      '  letter-spacing: 2px;',

      '  text-transform: uppercase;',

      '  padding: 4px 0;',

      '  font-family: inherit;',

      '  box-shadow: 0 2px 8px rgba(124,58,237,0.3);',

      '  opacity: 0;',

      '  transform: translateY(-100%);',

      '  transition: all 0.3s ease;',

      '  pointer-events: none;',

      '}',

      '#' + BANNER_ID + '.visible {',

      '  opacity: 1;',

      '  transform: translateY(0);',

      '}',



      // --- Design-Only Elements (hidden by default, shown in design mode) ---

      '.design-only {',

      '  display: none !important;',

      '}',

      'body.' + BODY_CLASS + ' .design-only {',

      '  display: block !important;',

      '}',

      'body.' + BODY_CLASS + ' .design-only[data-display="flex"] {',

      '  display: flex !important;',

      '}',

      'body.' + BODY_CLASS + ' .design-only[data-display="inline"] {',

      '  display: inline !important;',

      '}',

      'body.' + BODY_CLASS + ' .design-only[data-display="inline-block"] {',

      '  display: inline-block !important;',

      '}',

      'body.' + BODY_CLASS + ' .design-only[data-display="grid"] {',

      '  display: grid !important;',

      '}',



      // --- Design-Hidden Elements (visible by default, hidden in design mode) ---

      'body.' + BODY_CLASS + ' .design-hidden {',

      '  display: none !important;',

      '}',



      // --- Design Outline (dashed border overlay in design mode) ---

      'body.' + BODY_CLASS + ' .design-outline {',

      '  outline: 2px dashed rgba(167,139,250,0.5) !important;',

      '  outline-offset: 2px;',

      '}',



      // --- Under Construction Overlay ---

      'body.' + BODY_CLASS + ' .under-construction {',

      '  position: relative;',

      '  overflow: hidden;',

      '}',

      'body.' + BODY_CLASS + ' .under-construction::after {',

      '  content: "\1F6A7 Under Construction";',

      '  position: absolute;',

      '  top: 0;',

      '  left: 0;',

      '  right: 0;',

      '  bottom: 0;',

      '  display: flex;',

      '  align-items: center;',

      '  justify-content: center;',

      '  font-size: 14px;',

      '  font-weight: 700;',

      '  color: #000;',

      '  text-shadow: 0 0 4px rgba(255,255,255,0.8);',

      '  z-index: 10;',

      '  pointer-events: none;',

      '  background: repeating-linear-gradient(',

      '    -45deg,',

      '    rgba(255,204,0,0.35),',

      '    rgba(255,204,0,0.35) 10px,',

      '    rgba(0,0,0,0.25) 10px,',

      '    rgba(0,0,0,0.25) 20px',

      '  );',

      '}',



      // --- ChiliGBot Active Building (sparkle border animation) ---

      '@keyframes fpcs-sparkle-border {',

      '  0%   { border-color: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,0.4); }',

      '  25%  { border-color: #fbbf24; box-shadow: 0 0 10px rgba(251,191,36,0.5); }',

      '  50%  { border-color: #4ade80; box-shadow: 0 0 14px rgba(74,222,128,0.5); }',

      '  75%  { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56,189,248,0.5); }',

      '  100% { border-color: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,0.4); }',

      '}',

      '.chili-building {',

      '  border: 2px solid #a78bfa !important;',

      '  animation: fpcs-sparkle-border 1.5s ease-in-out infinite;',

      '}'

    ].join('\n');

  }



  // ============================================================

  //  DOM CREATION

  // ============================================================



  /** Inject the <style> block for design mode rules */

  function injectStyles() {

    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');

    style.id = STYLE_ID;

    style.textContent = getStyleSheet();

    document.head.appendChild(style);

  }



  /** Create the floating toggle button */

  function createToggleButton() {

    var btn = document.createElement('button');

    btn.id = TOGGLE_ID;

    btn.type = 'button';

    btn.setAttribute('aria-label', 'Toggle Design Mode');

    btn.textContent = isActive ? '\uD83C\uDFA8 Design ON' : '\uD83D\uDD27 Design Mode';

    btn.addEventListener('click', toggle);

    document.body.appendChild(btn);

    return btn;

  }



  /** Create the top-of-page design mode banner */

  function createBanner() {

    var banner = document.createElement('div');

    banner.id = BANNER_ID;

    banner.textContent = 'DESIGN MODE';

    document.body.appendChild(banner);

    return banner;

  }



  // ============================================================

  //  STATE MANAGEMENT

  // ============================================================



  /** Read persisted state from localStorage */

  function readState() {

    try {

      return localStorage.getItem(STORAGE_KEY) === 'true';

    } catch (e) {

      return false;

    }

  }



  /** Write state to localStorage */

  function writeState(val) {

    try {

      localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');

    } catch (e) {

      console.error('[FPCS DesignMode] Storage error:', e);

    }

  }



  /** Apply the current isActive state to the DOM */

  function applyState() {

    // Body class

    if (isActive) {

      document.body.classList.add(BODY_CLASS);

    } else {

      document.body.classList.remove(BODY_CLASS);

    }



    // Toggle button text and active class

    if (toggleBtn) {

      toggleBtn.textContent = isActive ? '\uD83C\uDFA8 Design ON' : '\uD83D\uDD27 Design Mode';

      if (isActive) {

        toggleBtn.classList.add('active');

      } else {

        toggleBtn.classList.remove('active');

      }

    }



    // Banner visibility

    if (bannerEl) {

      if (isActive) {

        bannerEl.classList.add('visible');

      } else {

        bannerEl.classList.remove('visible');

      }

    }



    console.log('[FPCS DesignMode] ' + (isActive ? 'ON' : 'OFF'));

  }



  /** Toggle design mode on/off */

  function toggle() {

    isActive = !isActive;

    writeState(isActive);

    applyState();

  }



  // ============================================================

  //  INITIALIZATION

  // ============================================================



  /** Main init — called once admin auth is confirmed */

  function init() {

    // Read persisted state

    isActive = readState();



    // Inject all DOM elements

    injectStyles();

    toggleBtn = createToggleButton();

    bannerEl = createBanner();



    // Apply initial state (restores from localStorage)

    applyState();



    console.log('[FPCS DesignMode] Initialized for admin — state: ' + (isActive ? 'ON' : 'OFF'));

  }



  /** Check if current user is admin and initialize if so */

  function checkAndInit() {

    var user = window.FPCS_USER;

    if (user && user.role === 'admin') {

      init();

      return true;

    }

    return false;

  }



  // ============================================================

  //  AUTH WAIT STRATEGY

  //  1. Listen for custom fpcs-authed event (future-proof)

  //  2. On DOMContentLoaded, poll window.FPCS_USER

  //  3. Fallback timeout at 3 seconds

  // ============================================================



  var initialized = false;



  function safeInit() {

    if (initialized) return;

    if (checkAndInit()) {

      initialized = true;

    }

  }



  // Strategy 1: Listen for custom auth event (future-proof hook)

  window.addEventListener('fpcs-authed', function () {

    safeInit();

  });



  // Strategy 2 + 3: Poll on DOMContentLoaded with fallback timeout

  function startPolling() {

    // Immediate check in case auth already resolved

    safeInit();

    if (initialized) return;



    // Poll every AUTH_POLL_INTERVAL ms until AUTH_FALLBACK_MS

    var elapsed = 0;

    var interval = setInterval(function () {

      elapsed += AUTH_POLL_INTERVAL;

      safeInit();

      if (initialized || elapsed >= AUTH_FALLBACK_MS) {

        clearInterval(interval);

        // Final attempt at fallback deadline

        if (!initialized) {

          safeInit();

          if (!initialized) {

            console.log('[FPCS DesignMode] No admin user detected — design mode not available');

          }

        }

      }

    }, AUTH_POLL_INTERVAL);

  }



  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', startPolling);

  } else {

    startPolling();

  }



})();

