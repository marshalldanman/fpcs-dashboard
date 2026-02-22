/* ============================================================
   FPCS Auth Gate — 3-Tier Access System + Onboarding + Boot
   Part of TRAILS: Technology · Robotics · AI · Language · Skills

   ACCESS TIERS:
   Tier 1 (admin)  — full access, manage allow-list, skip onboarding
   Tier 2 (member) — project access, onboarding, personal page, 5-bot team
   Tier 3 (guest)  — personal page only, journal/files/bookmarks, NO project data

   FEATURES:
   - SHA-256 email whitelist with 3-tier roles
   - Guest access for unknown emails (tracked & logged)
   - First-login onboarding for members (data sharing + contribution survey)
   - Guest welcome with personal workspace setup
   - Post-login boot progress bar with LED status indicators
   - Per-user preferences in localStorage (→ Firebase RTDB Phase 2)
   - window.FPCS_USER global for all scripts to read

   USAGE: Each page sets config before this script loads:
   <script>
     window.FPCS_PAGE = {
       name: 'Bot HQ',
       theme: 'theme-bots',
       onAuthed: function(user) {}
     };
   </script>
   <script src="js/auth.js"></script>
   ============================================================ */
(function () {
  'use strict';

  // --- Firebase Config ---
  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyBgYAPO_0cEvhPzfU6GZykJVUnF55LEzXQ',
    authDomain: 'fpcs-dashboard-63b25.firebaseapp.com',
    projectId: 'fpcs-dashboard-63b25',
    storageBucket: 'fpcs-dashboard-63b25.firebasestorage.app',
    messagingSenderId: '377879797743',
    appId: '1:377879797743:web:61a56f9bf69f2df9eba01a'
  };

  // --- Allow-List: Authorized Users (SHA-256 hashed emails + roles) ---
  // admin  = Tier 1: full access, manage users, skip onboarding
  // member = Tier 2: project access, onboarding, personal bot team
  // (unlisted emails) = Tier 3: guest, personal workspace only
  var AUTH_USERS = [
    { hash: '2cf3a7d6f68c22e431d35aec11129074f9bb677598de0fe85df3ba3c0f513365', role: 'admin',  label: 'Commander' },
    { hash: 'e12a8bb46e8823a5fd6e6c997c573b4088ff4dbe09ec3ee3da994d33a810a674', role: 'member', label: 'Judith Marshall' },
    { hash: 'e48e3b564e4c384c6215fcf3215abac1c95df04e5e7f862d5d1d8c91ff977cba', role: 'member', label: 'Friendly Sales' }
  ];

  // --- Onboarding options for MEMBERS (Tier 2) ---
  var MEMBER_ONBOARD = [
    { key: 'view_only',  icon: '&#128065;',  label: 'View dashboard data (read-only)',  desc: 'Browse reports, stats, and summaries' },
    { key: 'email',      icon: '&#128231;',  label: 'Share email data',                 desc: 'Import receipts and invoices from Gmail' },
    { key: 'drive',      icon: '&#128193;',  label: 'Share Google Drive documents',      desc: 'Access spreadsheets, PDFs, records' },
    { key: 'calendar',   icon: '&#128197;',  label: 'Share calendar events',             desc: 'Track meetings, deadlines, appointments' },
    { key: 'contacts',   icon: '&#128101;',  label: 'Share contacts',                    desc: 'Client and vendor contact lookup' },
    { key: 'edit_data',  icon: '&#9999;',    label: 'Contribute data & edits',           desc: 'Add transactions, notes, corrections' }
  ];

  // --- Contribution survey for MEMBERS (what they bring to the table) ---
  var CONTRIB_OPTIONS = [
    { key: 'bookkeeping', icon: '&#128218;', label: 'Bookkeeping & accounting',   desc: 'Financial records, ledger management' },
    { key: 'data_entry',  icon: '&#9000;',   label: 'Data entry & organization',  desc: 'Entering, sorting, cleaning data' },
    { key: 'research',    icon: '&#128270;',  label: 'Research & investigation',   desc: 'Finding documents, verifying info' },
    { key: 'review',      icon: '&#9989;',    label: 'Review & verification',      desc: 'Double-checking, cross-referencing' },
    { key: 'documents',   icon: '&#128196;',  label: 'Document collection',        desc: 'Gathering receipts, statements, forms' },
    { key: 'other',       icon: '&#128161;',  label: 'Other skills',               desc: 'Something unique you bring' }
  ];

  // --- Boot sequence steps ---
  var BOOT_STEPS = [
    { key: 'auth',       icon: '&#128274;', label: 'Authentication',     color: '#4ade80' },
    { key: 'profile',    icon: '&#128100;', label: 'Loading profile',    color: '#38bdf8' },
    { key: 'data',       icon: '&#128202;', label: 'Syncing data',       color: '#fbbf24' },
    { key: 'bots',       icon: '&#129302;', label: 'Waking up bots',     color: '#a78bfa' },
    { key: 'nav',        icon: '&#128736;', label: 'Building interface', color: '#fb923c' },
    { key: 'ready',      icon: '&#9989;',   label: 'Dashboard ready',    color: '#4ade80' }
  ];

  var BOOT_STEPS_GUEST = [
    { key: 'auth',       icon: '&#128274;', label: 'Authentication',         color: '#4ade80' },
    { key: 'profile',    icon: '&#128100;', label: 'Setting up workspace',   color: '#38bdf8' },
    { key: 'tools',      icon: '&#128736;', label: 'Preparing your tools',   color: '#fb923c' },
    { key: 'ready',      icon: '&#9989;',   label: 'Workspace ready',        color: '#4ade80' }
  ];

  // --- Page Config ---
  var pageConfig = window.FPCS_PAGE || { name: 'FPCS Dashboard' };
  if (pageConfig.theme) {
    document.body.classList.add(pageConfig.theme);
  }

  // --- SHA-256 Hash ---
  function hashEmail(email) {
    if (!crypto.subtle) return Promise.resolve('');
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  // --- Find user in allow-list (returns null for guests) ---
  function findUser(email) {
    return hashEmail(email.toLowerCase()).then(function (hash) {
      var match = null;
      AUTH_USERS.forEach(function (u) {
        if (u.hash === hash) match = u;
      });
      return match;
    });
  }

  // --- Preference storage ---
  function getUserPrefs(uid) {
    try {
      var raw = localStorage.getItem('fpcs_prefs_' + uid);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setUserPrefs(uid, prefs) {
    try {
      localStorage.setItem('fpcs_prefs_' + uid, JSON.stringify(prefs));
    } catch (e) { console.error('[FPCS Auth] Storage error:', e); }
  }

  // --- Login audit log (localStorage, → Firebase RTDB Phase 2) ---
  function logLogin(user, role) {
    try {
      var log = JSON.parse(localStorage.getItem('fpcs_login_log') || '[]');
      log.push({
        email: user.email,
        name: user.displayName,
        uid: user.uid,
        role: role,
        ts: Date.now(),
        page: pageConfig.name || 'unknown'
      });
      // Keep last 100 entries
      if (log.length > 100) log = log.slice(-100);
      localStorage.setItem('fpcs_login_log', JSON.stringify(log));
    } catch (e) { /* silent */ }
  }

  // --- Load external script ---
  function loadScript(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = callback;
    s.onerror = function () { console.error('[FPCS Auth] Failed to load:', src); };
    document.head.appendChild(s);
  }

  // --- Inject Auth Gate HTML ---
  function injectAuthGate() {
    var gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML = [
      '<div class="lock-icon">&#128274;</div>',
      '<h1>' + (pageConfig.name || 'TRAILS Dashboard') + '</h1>',
      '<div class="auth-sub">Sign in with Google to continue</div>',
      '<button class="g-btn" id="googleSignIn" onclick="doGoogleSignIn()">',
      '  <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
      '  Sign in with Google',
      '</button>',
      '<div class="auth-err" id="authErr"></div>',
      '<div class="auth-loading" id="authLoading"></div>'
    ].join('\n');
    document.body.insertBefore(gate, document.body.firstChild);
  }

  // --- Build onboarding HTML (for members) ---
  function buildOnboardingHTML(displayName) {
    var sharingRows = MEMBER_ONBOARD.map(function (opt) {
      return buildCheckboxRow(opt, 'fpcs_onboard', opt.key === 'view_only');
    }).join('\n');

    var contribRows = CONTRIB_OPTIONS.map(function (opt) {
      return buildCheckboxRow(opt, 'fpcs_contrib', false);
    }).join('\n');

    return [
      '<div class="onboard-modal" id="onboardModal">',
      '  <div class="onboard-card">',
      '    <div class="onboard-header">',
      '      <span class="onboard-welcome-icon">&#128075;</span>',
      '      <h2>Welcome, ' + (displayName || 'friend') + '!</h2>',
      '      <p>Let\'s set up your workspace. What would you like to do?</p>',
      '    </div>',
      '    <div class="onboard-body">',
      '      <div class="onboard-section-title">&#128272; Data Access</div>',
      sharingRows,
      '      <div class="onboard-section-title" style="margin-top:16px">&#128170; What can you contribute?</div>',
      contribRows,
      '    </div>',
      '    <div class="onboard-footer">',
      '      <div class="onboard-hint">You can change these anytime in Settings</div>',
      '      <button class="onboard-btn" id="onboardConfirm">&#128640; Let\'s Go!</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  // --- Build guest welcome HTML ---
  function buildGuestWelcomeHTML(displayName) {
    return [
      '<div class="onboard-modal" id="onboardModal">',
      '  <div class="onboard-card">',
      '    <div class="onboard-header">',
      '      <span class="onboard-welcome-icon">&#127775;</span>',
      '      <h2>Welcome, ' + (displayName || 'friend') + '!</h2>',
      '      <p>You\'re visiting as a guest. Here\'s what you get:</p>',
      '    </div>',
      '    <div class="onboard-body">',
      buildInfoRow('&#128221;', 'Personal Journal', 'Write notes, capture ideas, track your thoughts'),
      buildInfoRow('&#128193;', 'File Storage', 'Upload and organize your own documents'),
      buildInfoRow('&#128278;', 'Bookmarks', 'Save and label important links'),
      buildInfoRow('&#127991;', 'Smart Labels', 'Custom tagging system to organize everything'),
      buildInfoRow('&#128274;', 'Private & Secure', 'Your data is yours alone — no one else can see it'),
      '    </div>',
      '    <div class="onboard-footer">',
      '      <div class="onboard-hint">Want full project access? Ask an admin to add you to the allow-list</div>',
      '      <button class="onboard-btn" id="onboardConfirm">&#128640; Set Up My Space!</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function buildCheckboxRow(opt, name, checked) {
    return (
      '<label class="onboard-option">' +
      '  <input type="checkbox" name="' + name + '" value="' + opt.key + '"' +
           (checked ? ' checked' : '') + '>' +
      '  <span class="onboard-icon">' + opt.icon + '</span>' +
      '  <span class="onboard-text">' +
      '    <span class="onboard-label">' + opt.label + '</span>' +
      '    <span class="onboard-desc">' + opt.desc + '</span>' +
      '  </span>' +
      '  <span class="onboard-led"></span>' +
      '</label>'
    );
  }

  function buildInfoRow(icon, label, desc) {
    return (
      '<div class="onboard-option" style="cursor:default">' +
      '  <span class="onboard-icon">' + icon + '</span>' +
      '  <span class="onboard-text">' +
      '    <span class="onboard-label">' + label + '</span>' +
      '    <span class="onboard-desc">' + desc + '</span>' +
      '  </span>' +
      '  <span class="onboard-led" style="background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,0.5)"></span>' +
      '</div>'
    );
  }

  // --- Build boot progress bar HTML ---
  function buildBootHTML(steps) {
    var stepHTML = steps.map(function (step, i) {
      return (
        '<div class="boot-step" id="boot-' + step.key + '" data-index="' + i + '">' +
        '  <span class="boot-led" style="--led-color:' + step.color + '"></span>' +
        '  <span class="boot-icon">' + step.icon + '</span>' +
        '  <span class="boot-label">' + step.label + '</span>' +
        '  <span class="boot-status">waiting</span>' +
        '</div>'
      );
    }).join('\n');

    return [
      '<div class="boot-screen" id="bootScreen">',
      '  <div class="boot-card">',
      '    <h2>&#9889; Powering Up TRAILS</h2>',
      '    <div class="boot-progress-wrap">',
      '      <div class="boot-progress-bar" id="bootProgressBar"></div>',
      '    </div>',
      '    <div class="boot-percent" id="bootPercent">0%</div>',
      '    <div class="boot-steps">',
      stepHTML,
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  // --- Run boot animation ---
  function runBootSequence(steps, callback) {
    var bootEl = document.getElementById('bootScreen');
    var barEl = document.getElementById('bootProgressBar');
    var pctEl = document.getElementById('bootPercent');
    if (!bootEl) { callback(); return; }

    var total = steps.length;
    var current = 0;

    function activateStep() {
      if (current >= total) {
        setTimeout(function () {
          bootEl.style.opacity = '0';
          setTimeout(function () { bootEl.remove(); callback(); }, 400);
        }, 600);
        return;
      }

      var step = steps[current];
      var stepEl = document.getElementById('boot-' + step.key);
      if (stepEl) {
        stepEl.classList.add('active');
        stepEl.querySelector('.boot-status').textContent = 'running...';
      }

      var delay = 250 + Math.random() * 350;
      setTimeout(function () {
        if (stepEl) {
          stepEl.classList.remove('active');
          stepEl.classList.add('done');
          stepEl.querySelector('.boot-status').textContent = 'done';
        }
        current++;
        var pct = Math.round((current / total) * 100);
        barEl.style.width = pct + '%';
        pctEl.textContent = pct + '%';
        activateStep();
      }, delay);
    }

    bootEl.style.display = 'flex';
    activateStep();
  }

  // ============================================================
  //  TIER ROUTING — The core 3-tier flow
  // ============================================================

  // --- TIER 1 (Admin): Boot straight to dashboard ---
  function handleAdmin(user, gate, dash, onComplete) {
    injectBootScreen(BOOT_STEPS);
    gate.style.display = 'none';
    runBootSequence(BOOT_STEPS, function () {
      dash.style.display = 'block';
      onComplete();
    });
  }

  // --- TIER 2 (Member): Onboard on first login, then boot ---
  function handleMember(user, userRecord, gate, dash, onComplete) {
    var prefs = getUserPrefs(user.uid);

    if (!prefs || !prefs.onboarded) {
      // First login — show onboarding
      var onboardDiv = document.createElement('div');
      onboardDiv.innerHTML = buildOnboardingHTML(user.displayName || user.email.split('@')[0]);
      document.body.appendChild(onboardDiv.firstElementChild);
      injectBootScreen(BOOT_STEPS);
      gate.style.display = 'none';

      document.getElementById('onboardConfirm').addEventListener('click', function () {
        var sharing = collectChecked('fpcs_onboard');
        var contrib = collectChecked('fpcs_contrib');
        var prefs = {
          sharing: sharing,
          contributions: contrib,
          role: 'member',
          onboarded: true,
          ts: Date.now()
        };
        setUserPrefs(user.uid, prefs);
        console.log('[FPCS Auth] Member onboarding complete:', prefs);

        fadeRemove('onboardModal', function () {
          runBootSequence(BOOT_STEPS, function () {
            dash.style.display = 'block';
            onComplete();
          });
        });
      });
    } else {
      // Returning member — boot then dashboard
      injectBootScreen(BOOT_STEPS);
      gate.style.display = 'none';
      runBootSequence(BOOT_STEPS, function () {
        dash.style.display = 'block';
        onComplete();
      });
    }
  }

  // --- TIER 3 (Guest): Welcome, then personal workspace ---
  function handleGuest(user, gate, dash, onComplete) {
    var prefs = getUserPrefs(user.uid);

    if (!prefs || !prefs.onboarded) {
      // First guest login — show welcome
      var welcomeDiv = document.createElement('div');
      welcomeDiv.innerHTML = buildGuestWelcomeHTML(user.displayName || user.email.split('@')[0]);
      document.body.appendChild(welcomeDiv.firstElementChild);
      injectBootScreen(BOOT_STEPS_GUEST);
      gate.style.display = 'none';

      document.getElementById('onboardConfirm').addEventListener('click', function () {
        var prefs = {
          sharing: [],
          contributions: [],
          role: 'guest',
          onboarded: true,
          ts: Date.now()
        };
        setUserPrefs(user.uid, prefs);
        console.log('[FPCS Auth] Guest onboarding complete');

        fadeRemove('onboardModal', function () {
          runBootSequence(BOOT_STEPS_GUEST, function () {
            dash.style.display = 'block';
            onComplete();
          });
        });
      });
    } else {
      // Returning guest
      injectBootScreen(BOOT_STEPS_GUEST);
      gate.style.display = 'none';
      runBootSequence(BOOT_STEPS_GUEST, function () {
        dash.style.display = 'block';
        onComplete();
      });
    }
  }

  // --- Helpers ---
  function injectBootScreen(steps) {
    var bootDiv = document.createElement('div');
    bootDiv.innerHTML = buildBootHTML(steps);
    document.body.appendChild(bootDiv.firstElementChild);
  }

  function collectChecked(name) {
    var result = [];
    document.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (cb) {
      result.push(cb.value);
    });
    return result;
  }

  function fadeRemove(id, callback) {
    var el = document.getElementById(id);
    if (!el) { callback(); return; }
    el.style.opacity = '0';
    setTimeout(function () { el.remove(); callback(); }, 300);
  }

  // ============================================================
  //  INIT
  // ============================================================
  function initAuth() {
    firebase.initializeApp(FIREBASE_CONFIG);
    var auth = firebase.auth();
    var gate = document.getElementById('authGate');
    var dash = document.getElementById('dashContent');
    var errEl = document.getElementById('authErr');
    var loadEl = document.getElementById('authLoading');

    if (!gate || !dash) {
      console.error('[FPCS Auth] Missing #authGate or #dashContent');
      return;
    }

    auth.onAuthStateChanged(function (user) {
      if (user) {
        findUser(user.email).then(function (userRecord) {
          var role = userRecord ? userRecord.role : 'guest';
          var label = userRecord ? userRecord.label : 'Guest';

          // Log every login
          logLogin(user, role);
          console.log('[FPCS Auth] ' + role.toUpperCase() + ': ' + user.email + ' (' + label + ')');

          // Set global user info for all scripts
          window.FPCS_USER = {
            email: user.email,
            name: user.displayName,
            uid: user.uid,
            photo: user.photoURL,
            role: role,
            label: label,
            prefs: getUserPrefs(user.uid)
          };

          var onComplete = function () {
            if (typeof pageConfig.onAuthed === 'function') {
              pageConfig.onAuthed(user);
            }
          };

          // Route to appropriate tier
          if (role === 'admin') {
            handleAdmin(user, gate, dash, onComplete);
          } else if (role === 'member') {
            handleMember(user, userRecord, gate, dash, onComplete);
          } else {
            handleGuest(user, gate, dash, onComplete);
          }
        });
      } else {
        gate.style.display = 'flex';
        dash.style.display = 'none';
        window.FPCS_USER = null;
      }
    });

    // Global sign-in function
    window.doGoogleSignIn = function () {
      errEl.textContent = '';
      loadEl.textContent = 'Signing in...';
      document.getElementById('googleSignIn').disabled = true;

      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      auth.signInWithPopup(provider).then(function () {
        loadEl.textContent = '';
      }).catch(function (error) {
        loadEl.textContent = '';
        document.getElementById('googleSignIn').disabled = false;
        errEl.textContent = error.message || 'Sign-in failed';
        console.error('[FPCS Auth] Error:', error);
      });
    };

    // Global sign-out function — allows switching Google accounts
    window.doFPCSLogout = function () {
      auth.signOut().then(function () {
        console.log('[FPCS Auth] Signed out successfully');
        window.FPCS_USER = null;
        // Force Google account chooser on next sign-in
        // by clearing the cached credential
        window.location.reload();
      }).catch(function (error) {
        console.error('[FPCS Auth] Sign-out error:', error);
      });
    };

    // Inject logout button into dashboard (top-right corner)
    function injectLogoutButton() {
      var existing = document.getElementById('fpcs-logout-btn');
      if (existing) return;

      var btn = document.createElement('button');
      btn.id = 'fpcs-logout-btn';
      btn.innerHTML = '&#128682; Switch Account';
      btn.title = 'Sign out and switch Google account';
      btn.style.cssText = 'position:fixed;top:12px;right:16px;z-index:9998;' +
        'background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);' +
        'border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;' +
        'color:#f87171;cursor:pointer;font-family:inherit;transition:all 0.15s;';
      btn.onmouseenter = function () {
        btn.style.background = 'rgba(248,113,113,0.25)';
        btn.style.borderColor = 'rgba(248,113,113,0.5)';
      };
      btn.onmouseleave = function () {
        btn.style.background = 'rgba(248,113,113,0.12)';
        btn.style.borderColor = 'rgba(248,113,113,0.3)';
      };
      btn.onclick = function () {
        if (confirm('Sign out and switch to a different Google account?')) {
          window.doFPCSLogout();
        }
      };
      document.body.appendChild(btn);
    }

    // Show logout button once user is authenticated
    auth.onAuthStateChanged(function (user) {
      if (user) {
        injectLogoutButton();
      } else {
        var logoutBtn = document.getElementById('fpcs-logout-btn');
        if (logoutBtn) logoutBtn.remove();
      }
    });
  }

  // --- Boot ---
  injectAuthGate();
  loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js', function () {
    loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js', initAuth);
  });
})();
