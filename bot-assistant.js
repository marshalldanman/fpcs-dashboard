/**
 * FPCS Bot Assistant — Floating cartoon face chat bubble
 * Include on any page: <script src="bot-assistant.js"></script>
 * Auto-initializes on DOMContentLoaded
 */
(function(){
  'use strict';

  // Config per page
  var PAGE_CONFIG = {
    'index.html':      { name: 'Sarge', greeting: "Commander! What's the mission?", context: 'Tax HQ' },
    'bots.html':       { name: 'Sarge', greeting: "Bot fleet reporting for duty!", context: 'Bot HQ' },
    'deductions.html': { name: 'Penny', greeting: "Let's find those write-offs!", context: 'Deductions' },
    'memory.html':     { name: 'Sarge', greeting: "Memory banks online.", context: 'Memory Bank' },
    'japster.html':    { name: 'Japster', greeting: "Inter-AI comms ready!", context: 'Japster Hub' },
    'helpdesk.html':   { name: 'Sarge', greeting: "Tickets are my thing!", context: 'Helpdesk' },
    'income.html':     { name: 'Cruncher', greeting: "Numbers don't lie. Let's drill down!", context: 'Income' }
  };

  var page = location.pathname.split('/').pop() || 'index.html';
  var cfg = PAGE_CONFIG[page] || PAGE_CONFIG['index.html'];

  // Quick replies per context
  var QUICK_REPLIES = {
    'Tax HQ': ['Show progress', 'What\'s next?', 'Deadline status', 'Missing items'],
    'Bot HQ': ['Bot status', 'Deploy a bot', 'Run DDBOT', 'Fleet report'],
    'Deductions': ['Top deductions', 'Unmatched items', 'Review needed', 'COGS breakdown'],
    'Memory Bank': ['Recent changes', 'Key numbers', 'Data gaps', 'Session log'],
    'Japster Hub': ['Start chat', 'AI status', 'Sheet link', 'New topic'],
    'Helpdesk': ['Open tickets', 'New ticket', 'Priority list', 'Overdue items'],
    'Income': ['Missing income', 'Client list', 'QBO status', 'Reconciliation']
  };

  // Bot responses (lightweight local responses)
  var RESPONSES = {
    'show progress': 'Overall progress: 80% data collected, 60% tax prep, 0% filing. We need to focus on bank statements and Amazon orders next!',
    'what\'s next?': 'Priority items: 1) Add $870 Arlene Harris missing income to QBO, 2) Full tech ledger reconciliation, 3) Bank statement cross-reference, 4) Amazon order classification.',
    'deadline status': 'Deadline: April 10, 2026 (USPS Certified Mail). Oregon 3-year statute expires April 15, 2026. We have ~47 days!',
    'missing items': 'Missing: $870 Arlene Harris (3 jobs), $280 Kelley Haganauer (Trello), plus 562 unmatched ledger entries. Bank statements & Amazon orders not started.',
    'missing income': 'Found $1,150 in missing 2022 income: Arlene Harris $870 (3 jobs, NOT in QBO) + Kelley Haganauer $280 (Trello). Full ledger reconciliation may reveal more.',
    'client list': 'Email clients: AGT Mortgage ($2K confirmed), Heidi Ostrom ($916.50), Angie Herrmann ($130), Arlene Harris ($870 MISSING). American Restoration ($730 UNPAID).',
    'qbo status': 'QBO has $3,046.50 confirmed 2022 income from email clients. $870 Arlene Harris income is NOT in QBO and needs to be added.',
    'reconciliation': 'Cross-reference complete for email sources. 4 items confirmed in QBO, 3 items missing (Arlene Harris), 1 unpaid (American Restoration). Full ledger recon pending.',
    'top deductions': 'Top deductions: Supplies $14,339 | COGS $10,725 | Equipment $5,150 | Car/Truck $3,118 | Total: $42,024.74',
    'key numbers': 'QBO Gross: $17,097 | Deductions: $42,025 | Net Loss: -$24,928 | Missing income: $1,150 | 1,185 clean rows after dedup.',
    'default': "I'm tracking that. For detailed answers, check the relevant dashboard section or ask Commander for clarification!"
  };

  function getResponse(msg) {
    var lower = msg.toLowerCase().trim();
    for (var key in RESPONSES) {
      if (key !== 'default' && lower.indexOf(key) !== -1) return RESPONSES[key];
    }
    // Fuzzy match
    if (lower.indexOf('progress') !== -1) return RESPONSES['show progress'];
    if (lower.indexOf('next') !== -1 || lower.indexOf('todo') !== -1) return RESPONSES['what\'s next?'];
    if (lower.indexOf('deadline') !== -1 || lower.indexOf('date') !== -1) return RESPONSES['deadline status'];
    if (lower.indexOf('missing') !== -1) return RESPONSES['missing income'];
    if (lower.indexOf('client') !== -1) return RESPONSES['client list'];
    if (lower.indexOf('deduct') !== -1) return RESPONSES['top deductions'];
    if (lower.indexOf('number') !== -1 || lower.indexOf('stats') !== -1) return RESPONSES['key numbers'];
    return RESPONSES['default'];
  }

  function createBot() {
    // Inject styles
    var style = document.createElement('style');
    style.textContent = [
      '.bot-float{position:fixed;bottom:24px;right:24px;z-index:9998;font-family:"Segoe UI",system-ui,sans-serif}',
      '.bot-bubble{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#0f172a);border:3px solid #38bdf8;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(56,189,248,.3);transition:all .3s;position:relative}',
      '.bot-bubble:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(56,189,248,.5)}',
      '.bot-bubble.has-msg::after{content:"";position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#f87171;border-radius:50%;border:2px solid #0f172a;animation:bot-pulse 2s infinite}',
      '@keyframes bot-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}',

      /* Face SVG styles */
      '.bot-face{width:48px;height:48px}',
      '.bot-face .head{fill:#1e293b;stroke:#38bdf8;stroke-width:1.5}',
      '.bot-face .eye{fill:#38bdf8}',
      '.bot-face .eye-pupil{fill:#0f172a}',
      '.bot-face .mouth{fill:none;stroke:#4ade80;stroke-width:2;stroke-linecap:round}',
      '.bot-face .antenna{fill:#38bdf8}',
      '.bot-face .cheek{fill:rgba(244,114,182,.3)}',

      /* Blink animation */
      '@keyframes bot-blink{0%,45%,55%,100%{ry:4.5}50%{ry:0.5}}',
      '.bot-face .eye{animation:bot-blink 4s infinite}',

      /* Chat panel */
      '.bot-panel{position:absolute;bottom:76px;right:0;width:340px;max-height:480px;background:#0f172a;border:1px solid #334155;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden}',
      '.bot-panel.open{display:flex}',
      '.bot-panel-header{padding:14px 18px;background:linear-gradient(135deg,#1e3a5f,#0f172a);border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center}',
      '.bot-panel-header h3{color:#38bdf8;font-size:15px;margin:0;display:flex;align-items:center;gap:8px}',
      '.bot-panel-header .ctx{font-size:11px;color:#94a3b8;background:rgba(56,189,248,.1);padding:2px 8px;border-radius:8px}',
      '.bot-panel-close{background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:4px}',
      '.bot-panel-close:hover{color:#f87171}',

      '.bot-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;max-height:300px;min-height:120px}',
      '.bot-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word}',
      '.bot-msg.bot{background:#1e293b;color:#e2e8f0;align-self:flex-start;border-bottom-left-radius:4px}',
      '.bot-msg.user{background:rgba(56,189,248,.15);color:#e2e8f0;align-self:flex-end;border-bottom-right-radius:4px}',
      '.bot-msg .sender{font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:600}',

      '.bot-quick{padding:8px 14px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid #334155}',
      '.bot-quick-btn{padding:6px 12px;border-radius:16px;border:1px solid #334155;background:rgba(30,41,59,.6);color:#94a3b8;font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap}',
      '.bot-quick-btn:hover{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,.08)}',

      '.bot-input-row{display:flex;padding:10px;border-top:1px solid #334155;gap:8px}',
      '.bot-input{flex:1;padding:8px 12px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:13px;outline:none}',
      '.bot-input::placeholder{color:#64748b}',
      '.bot-input:focus{border-color:#38bdf8}',
      '.bot-send{padding:8px 14px;border-radius:8px;border:none;background:#38bdf8;color:#0f172a;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s}',
      '.bot-send:hover{background:#7dd3fc}',

      /* Typing indicator */
      '.bot-typing{display:flex;gap:4px;padding:10px 14px;align-self:flex-start}',
      '.bot-typing span{width:6px;height:6px;background:#38bdf8;border-radius:50%;animation:bot-typing-dot 1.4s infinite}',
      '.bot-typing span:nth-child(2){animation-delay:.2s}',
      '.bot-typing span:nth-child(3){animation-delay:.4s}',
      '@keyframes bot-typing-dot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}'
    ].join('\n');
    document.head.appendChild(style);

    // Create DOM
    var container = document.createElement('div');
    container.className = 'bot-float';
    container.innerHTML = [
      '<div class="bot-panel" id="botPanel">',
      '  <div class="bot-panel-header">',
      '    <h3><span style="font-size:18px">&#129302;</span> ' + cfg.name + ' <span class="ctx">' + cfg.context + '</span></h3>',
      '    <button class="bot-panel-close" onclick="window._botToggle()">&times;</button>',
      '  </div>',
      '  <div class="bot-messages" id="botMessages"></div>',
      '  <div class="bot-quick" id="botQuick"></div>',
      '  <div class="bot-input-row">',
      '    <input class="bot-input" id="botInput" placeholder="Ask ' + cfg.name + ' anything..." onkeydown="if(event.key===\'Enter\')window._botSend()">',
      '    <button class="bot-send" onclick="window._botSend()">Send</button>',
      '  </div>',
      '</div>',
      '<div class="bot-bubble has-msg" id="botBubble" onclick="window._botToggle()">',
      '  <svg class="bot-face" viewBox="0 0 48 48">',
      '    <circle cx="24" cy="6" r="3" class="antenna"/>',
      '    <line x1="24" y1="9" x2="24" y2="14" stroke="#38bdf8" stroke-width="2"/>',
      '    <rect x="6" y="14" width="36" height="28" rx="10" class="head"/>',
      '    <ellipse cx="17" cy="28" rx="4.5" ry="4.5" class="eye"/>',
      '    <ellipse cx="31" cy="28" rx="4.5" ry="4.5" class="eye"/>',
      '    <circle cx="17" cy="28" r="2" class="eye-pupil"/>',
      '    <circle cx="31" cy="28" r="2" class="eye-pupil"/>',
      '    <circle cx="10" cy="32" r="3" class="cheek"/>',
      '    <circle cx="38" cy="32" r="3" class="cheek"/>',
      '    <path d="M18 36 Q24 40 30 36" class="mouth"/>',
      '  </svg>',
      '</div>'
    ].join('\n');

    document.body.appendChild(container);

    // Initialize quick replies
    var quickDiv = document.getElementById('botQuick');
    var replies = QUICK_REPLIES[cfg.context] || QUICK_REPLIES['Tax HQ'];
    replies.forEach(function(r){
      var btn = document.createElement('button');
      btn.className = 'bot-quick-btn';
      btn.textContent = r;
      btn.onclick = function(){ sendMessage(r); };
      quickDiv.appendChild(btn);
    });

    // Add greeting
    addBotMessage(cfg.greeting);
  }

  function addBotMessage(text) {
    var div = document.getElementById('botMessages');
    var msg = document.createElement('div');
    msg.className = 'bot-msg bot';
    msg.innerHTML = '<div class="sender">' + cfg.name + '</div>' + text;
    div.appendChild(msg);
    div.scrollTop = div.scrollHeight;
  }

  function addUserMessage(text) {
    var div = document.getElementById('botMessages');
    var msg = document.createElement('div');
    msg.className = 'bot-msg user';
    msg.innerHTML = '<div class="sender">Commander</div>' + text;
    div.appendChild(msg);
    div.scrollTop = div.scrollHeight;
  }

  function showTyping() {
    var div = document.getElementById('botMessages');
    var typing = document.createElement('div');
    typing.className = 'bot-typing';
    typing.id = 'botTyping';
    typing.innerHTML = '<span></span><span></span><span></span>';
    div.appendChild(typing);
    div.scrollTop = div.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('botTyping');
    if (el) el.remove();
  }

  function sendMessage(text) {
    if (!text || !text.trim()) return;
    addUserMessage(text.trim());
    document.getElementById('botInput').value = '';

    showTyping();
    setTimeout(function(){
      hideTyping();
      addBotMessage(getResponse(text));
    }, 600 + Math.random() * 400);
  }

  // Global functions
  window._botToggle = function() {
    var panel = document.getElementById('botPanel');
    var bubble = document.getElementById('botBubble');
    panel.classList.toggle('open');
    bubble.classList.remove('has-msg');
  };

  window._botSend = function() {
    sendMessage(document.getElementById('botInput').value);
  };

  // Wait for auth (don't show bot until dashboard is visible)
  function waitForDash() {
    var dash = document.getElementById('dashContent');
    if (!dash) { createBot(); return; }
    var observer = new MutationObserver(function(){
      if (dash.style.display === 'block' || dash.style.display === '') {
        createBot();
        observer.disconnect();
      }
    });
    observer.observe(dash, { attributes: true, attributeFilter: ['style'] });
    // Also check immediately
    if (dash.style.display === 'block') { createBot(); observer.disconnect(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDash);
  } else {
    waitForDash();
  }
})();
