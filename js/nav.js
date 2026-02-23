/* ============================================================
   FPCS Nav Rail — Shared navigation sidebar injection
   Part of TRAILS: Technology · Robotics · AI · Language · Skills

   USAGE: Each page sets nav config before this script loads:

   <script>
     window.FPCS_NAV = {
       active: 'bots',   // Which page is active (matches key below)
       sections: [        // In-page section links (optional)
         { icon: '&#128101;', label: 'Bot Roster', href: '#sec-roster' },
         { icon: '&#127968;', label: 'Realbotville', href: '#sec-village' }
       ]
     };
   </script>
   <script src="js/nav.js"></script>
   ============================================================ */
(function () {
  'use strict';

  // --- Page Registry ---
  var PAGES = [
    { key: 'tax',        icon: '&#128202;', label: 'Tax HQ (Page 1)',   href: 'index.html',      color: '' },
    { key: 'bots',       icon: '&#129302;', label: 'Bot HQ (Page 2)',   href: 'bots.html',       color: '' },
    { key: 'deductions', icon: '&#128269;', label: 'Deductions (Page 3)', href: 'deductions.html', color: 'var(--green)' },
    { key: 'income',     icon: '&#128176;', label: 'Income (Page 4)',    href: 'income.html',     color: '' },
    { key: 'memory',     icon: '&#128218;', label: 'Memory Bank (Page 5)', href: 'memory.html',   color: '' },
    { key: 'japster',    icon: '&#128172;', label: 'Japster Hub (Page 6)', href: 'japster.html',  color: '#22d3ee' },
    { key: 'helpdesk',   icon: '&#127915;', label: 'Helpdesk (Page 7)',  href: 'helpdesk.html',   color: 'var(--orange)' },
    { key: 'admin',      icon: '&#128274;', label: 'Admin HQ (Page 8)', href: 'admin.html',      color: 'var(--purple)' },
    { key: 'village',    icon: '&#127968;', label: 'Realbotville (Page 9)', href: 'realbotville.html', color: '#38bdf8' },
    { key: 'library',   icon: '&#128218;', label: 'Library (Page 10)',     href: 'library.html',      color: '#f59e0b' }
  ];

  // --- Read page config ---
  var navConfig = window.FPCS_NAV || {};
  var activeKey = navConfig.active || '';
  var sections = navConfig.sections || [];

  // --- Build nav HTML ---
  function buildNav() {
    var html = [];

    // Main page link (Tax HQ — always first)
    html.push(buildLink(PAGES[0]));
    html.push('<div class="nav-sep"></div>');

    // Active page link (if not Tax HQ)
    if (activeKey && activeKey !== 'tax') {
      var activePage = PAGES.find(function (p) { return p.key === activeKey; });
      if (activePage) {
        html.push(buildLink(activePage, true));
      }
    }

    // In-page section links — handles multiple config formats:
    //   { icon, label, href }    ← full format (admin, bots, deductions, japster, index)
    //   { id, icon, label }      ← memory format (auto-generates href)
    //   { id, label }            ← income format (auto-generates icon + href)
    //   'section-id'             ← string shorthand (auto-generates everything)
    sections.forEach(function (sec) {
      // Normalize: if sec is a plain string, wrap it
      if (typeof sec === 'string') {
        sec = { id: sec, label: sec.replace(/^sec-/, '').replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }) };
      }
      var href = sec.href || (sec.id ? '#' + sec.id : '#');
      var icon = sec.icon || '&#9654;';
      var label = sec.label || sec.id || 'Section';
      html.push(
        '<a class="nav-link" href="' + href + '">' +
        '<span class="nav-icon">' + icon + '</span>' +
        '<span class="nav-label">' + label + '</span>' +
        '</a>'
      );
    });

    // Separator before other pages
    if (sections.length > 0) {
      html.push('<div class="nav-sep"></div>');
    }

    // Other page links
    PAGES.forEach(function (page) {
      if (page.key === activeKey || page.key === 'tax') return; // Already shown above
      html.push(buildLink(page));
    });

    // Back to Tax HQ at bottom
    html.push('<div class="nav-sep"></div>');
    html.push(
      '<a class="nav-link" href="index.html" style="color:var(--accent)">' +
      '<span class="nav-icon">&#8592;</span>' +
      '<span class="nav-label">Back to Tax HQ</span>' +
      '</a>'
    );

    return html.join('\n');
  }

  // --- Build single nav link ---
  function buildLink(page, isActive) {
    var cls = 'nav-link' + (isActive ? ' active' : '');
    var style = page.color ? ' style="color:' + page.color + '"' : '';
    return (
      '<a class="' + cls + '" href="' + page.href + '"' + style + '>' +
      '<span class="nav-icon">' + page.icon + '</span>' +
      '<span class="nav-label">' + page.label + '</span>' +
      '</a>'
    );
  }

  // --- Inject nav rail into dashContent ---
  function injectNav() {
    var dashContent = document.getElementById('dashContent');
    if (!dashContent) {
      console.error('[FPCS Nav] Missing #dashContent element');
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'nav-rail';
    nav.innerHTML = buildNav();

    // Insert as first child of dashContent
    dashContent.insertBefore(nav, dashContent.firstChild);
  }

  // --- Init ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
