/* ============================================================
   Subdomain Router — Routes *.justout.today to the right page
   Must load BEFORE any other script. Redirects via client-side
   if the hostname doesn't match the current page.

   All subdomains point to the same Firebase Hosting site.
   This script maps hostname → page file.
   ============================================================ */
(function () {
  'use strict';

  var ROUTES = {
    'dashboard':    '/index.html',
    'bots':         '/bots.html',
    'library':      '/library.html',
    'stats':        '/stats-board.html',
    'sentry':       '/sentrylion.html',
    'japster':      '/japster.html',
    'tokenmaster':  '/token-master.html',
    'income':       '/income.html',
    'admin':        '/admin.html',
    'memory':       '/memory.html',
    'realbotville': '/realbotville.html'
    // helpdesk is separate (helpdesk.justout.today has its own deployment)
  };

  var host = window.location.hostname;
  var path = window.location.pathname;

  // Extract subdomain: "tokenmaster.justout.today" → "tokenmaster"
  var parts = host.split('.');
  if (parts.length < 3) return; // Not a subdomain, skip routing

  var sub = parts[0];
  var target = ROUTES[sub];

  if (!target) return; // Unknown subdomain, let it load normally

  // Redirect to dashboard.justout.today with the correct page path.
  // This ensures Firebase Auth works (only dashboard.justout.today is authorized).
  // Subdomain URLs still work as friendly entry points — they just bounce here.
  if (sub !== 'dashboard') {
    window.location.replace(
      'https://dashboard.justout.today' + target +
      window.location.search + window.location.hash
    );
    return;
  }

  // For dashboard subdomain: route to correct page if needed
  var currentPage = path === '/' ? '/index.html' : path;
  if (currentPage !== target) {
    window.location.replace(target + window.location.search + window.location.hash);
  }
})();
