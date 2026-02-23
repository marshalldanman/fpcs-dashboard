/**
 * FPCS Bot Assistant — Floating cartoon face chat bubble
 * Now with Letta-inspired memory integration!
 *
 * Include on any page (AFTER memory-blocks.js):
 *   <script src="js/memory-blocks.js"></script>
 *   <script src="bot-assistant.js"></script>
 *
 * Auto-initializes on DOMContentLoaded
 *
 * Memory features (via FPCSMemory):
 *   - Conversations tracked in RecallMemory (persists across page loads)
 *   - User facts auto-learned ("my name is...", "remember that...")
 *   - Core memory blocks always available for context
 *   - Inner monologue logs bot reasoning (not shown to user)
 *   - Session summaries compress old conversations
 *   - Special commands: /memory, /stats, /forget, /learn, /recall
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
    'Memory Bank': ['Memory stats', 'Key numbers', 'Data gaps', 'Session log'],
    'Japster Hub': ['Start chat', 'AI status', 'Sheet link', 'New topic'],
    'Helpdesk': ['Open tickets', 'New ticket', 'Priority list', 'Overdue items'],
    'Income': ['Missing income', 'Client list', 'QBO status', 'Reconciliation']
  };

  // ============================================================
  //  RESPONSE ENGINE — Memory-aware response generation
  // ============================================================

  // Static responses (baseline knowledge)
  var RESPONSES = {
    'show progress': 'Overall progress: 80% data collected, 60% tax prep, 0% filing. We need to focus on bank statements and Amazon orders next!',
    'what\'s next?': 'Priority items: 1) Add $870 Arlene Harris missing income to QBO, 2) Full tech ledger reconciliation, 3) Bank statement cross-reference, 4) Amazon order classification.',
    'deadline status': 'Deadline: April 10, 2026 (USPS Certified Mail). Oregon 3-year statute expires April 15, 2026.',
    'missing items': 'Missing: $870 Arlene Harris (3 jobs), $280 Kelley Haganauer (Trello), plus 562 unmatched ledger entries. Bank statements & Amazon orders not started.',
    'missing income': 'Found $1,150 in missing 2022 income: Arlene Harris $870 (3 jobs, NOT in QBO) + Kelley Haganauer $280 (Trello). Full ledger reconciliation may reveal more.',
    'client list': 'Email clients: AGT Mortgage ($2K confirmed), Heidi Ostrom ($916.50), Angie Herrmann ($130), Arlene Harris ($870 MISSING). American Restoration ($730 UNPAID).',
    'qbo status': 'QBO has $3,046.50 confirmed 2022 income from email clients. $870 Arlene Harris income is NOT in QBO and needs to be added.',
    'reconciliation': 'Cross-reference complete for email sources. 4 items confirmed in QBO, 3 items missing (Arlene Harris), 1 unpaid (American Restoration). Full ledger recon pending.',
    'top deductions': 'Top deductions: Supplies $14,339 | COGS $10,725 | Equipment $5,150 | Car/Truck $3,118 | Total: $42,024.74',
    'key numbers': 'QBO Gross: $17,097 | Deductions: $42,025 | Net Loss: -$24,928 | Missing income: $1,150 | 1,185 clean rows after dedup.'
  };

  // ============================================================
  //  MEMORY-AWARE RESPONSE SYSTEM
  // ============================================================

  /**
   * Check if memory system is available
   */
  function hasMemory() {
    return window.FPCSMemory && window.FPCSMemory.isReady();
  }

  /**
   * Handle special /commands
   * @param {string} msg - User message
   * @returns {string|null} - Response if command handled, null if not a command
   */
  function handleCommand(msg) {
    var lower = msg.toLowerCase().trim();

    // /memory or /mem — Show memory status
    if (lower === '/memory' || lower === '/mem') {
      if (!hasMemory()) return 'Memory system not loaded yet. Refresh and try again.';
      var stats = window.FPCSMemory.stats();
      return '<strong>Memory Status</strong><br>' +
        'Core blocks: ' + stats.coreBlocks + ' (' + stats.coreChars + ' chars)<br>' +
        'Recall messages: ' + stats.recallMessages + '<br>' +
        'Session summaries: ' + stats.summaryCount + '<br>' +
        'Session: ' + stats.sessionId + '<br>' +
        '<span style="color:#94a3b8;font-size:11px">Letta-inspired memory system active</span>';
    }

    // /stats — Show key project stats from core memory
    if (lower === '/stats' || lower === 'memory stats') {
      if (!hasMemory()) return 'Memory not ready.';
      var facts = window.FPCSMemory.core.get('project_facts') || 'No project facts stored.';
      return '<strong>Project Facts (from memory)</strong><br>' + facts.replace(/\n/g, '<br>');
    }

    // /recall — Show recent conversation from memory
    if (lower === '/recall' || lower === 'session log') {
      if (!hasMemory()) return 'Memory not ready.';
      var recent = window.FPCSMemory.recall.recent(8);
      if (recent.length === 0) return 'No conversation history in this session.';
      var lines = ['<strong>Recent Conversation</strong> (' + recent.length + ' msgs)'];
      for (var i = 0; i < recent.length; i++) {
        var m = recent[i];
        var who = m.role === 'user' ? 'You' : cfg.name;
        var time = new Date(m.timestamp).toLocaleTimeString();
        var preview = m.content.length > 60 ? m.content.substring(0, 60) + '...' : m.content;
        lines.push('<span style="color:#64748b;font-size:10px">' + time + '</span> <strong>' + who + '</strong>: ' + preview);
      }
      return lines.join('<br>');
    }

    // /learn X — Manually add a fact to user memory
    if (lower.indexOf('/learn ') === 0) {
      if (!hasMemory()) return 'Memory not ready.';
      var fact = msg.substring(7).trim();
      if (!fact) return 'Usage: /learn [fact to remember]';
      window.FPCSMemory.core.append('user_info', '\nNote: ' + fact);
      window.FPCSMemory.monologue.think('User manually taught me: ' + fact);
      return 'Got it! I\'ll remember: "' + fact + '"';
    }

    // /forget — Clear user_info memory block
    if (lower === '/forget' || lower === '/forget all') {
      if (!hasMemory()) return 'Memory not ready.';
      window.FPCSMemory.core.set('user_info', '');
      return 'User info cleared. I\'m starting fresh on what I know about you.';
    }

    // /think — Show recent inner monologue (debug)
    if (lower === '/think' || lower === '/thoughts') {
      if (!hasMemory()) return 'Memory not ready.';
      var thoughts = window.FPCSMemory.monologue.recent(5);
      if (thoughts.length === 0) return 'No inner thoughts recorded yet.';
      var tLines = ['<strong>Recent Inner Monologue</strong>'];
      for (var t = 0; t < thoughts.length; t++) {
        var time2 = new Date(thoughts[t].timestamp).toLocaleTimeString();
        tLines.push('<span style="color:#64748b;font-size:10px">' + time2 + '</span> ' + thoughts[t].thought);
      }
      return tLines.join('<br>');
    }

    // /export — Export all memory as JSON (for debugging)
    if (lower === '/export') {
      if (!hasMemory()) return 'Memory not ready.';
      var data = window.FPCSMemory.export();
      console.log('[FPCS Bot] Memory export:', data);
      return 'Memory exported to browser console (F12 to view). ' + data.recall.messages.length + ' messages, ' + Object.keys(data.core).length + ' core blocks.';
    }

    // /help — Show available commands
    if (lower === '/help' || lower === '/commands') {
      return '<strong>Bot Commands</strong><br>' +
        '/memory - Memory system status<br>' +
        '/stats - Project facts from memory<br>' +
        '/recall - Recent conversation history<br>' +
        '/learn [fact] - Teach me something<br>' +
        '/forget - Clear user info memory<br>' +
        '/think - Show inner monologue<br>' +
        '/export - Dump memory to console<br>' +
        '/help - This list';
    }

    return null; // Not a command
  }

  /**
   * Generate a memory-aware response
   * @param {string} msg - User message
   * @returns {string} response text
   */
  function getResponse(msg) {
    var lower = msg.toLowerCase().trim();

    // 1. Check for /commands first
    var cmdResponse = handleCommand(msg);
    if (cmdResponse) return cmdResponse;

    // 2. Memory-aware: try to answer from core memory blocks
    if (hasMemory()) {
      // Inner monologue — bot thinks about the question
      window.FPCSMemory.monologue.think('User asked: "' + msg + '" on ' + cfg.context + ' page');

      // Check if user is asking about something in project_facts
      var facts = window.FPCSMemory.core.get('project_facts') || '';
      if (lower.indexOf('deadline') !== -1 && facts.indexOf('Deadline') !== -1) {
        var deadlineMatch = facts.match(/Deadline: (.+)/);
        if (deadlineMatch) {
          // Calculate days remaining
          var daysInfo = _getDaysToDeadline();
          window.FPCSMemory.monologue.think('Answering deadline from core memory block');
          return 'Deadline: ' + deadlineMatch[1] + (daysInfo ? ' (' + daysInfo + ')' : '');
        }
      }

      // Check if asking about user info we've learned
      if (lower.indexOf('what do you know') !== -1 || lower.indexOf('about me') !== -1) {
        var userInfo = window.FPCSMemory.core.get('user_info') || '';
        if (userInfo.trim()) {
          return '<strong>What I know about you:</strong><br>' + userInfo.replace(/\n/g, '<br>');
        }
        return 'I don\'t know much about you yet. Tell me something! (e.g., "My name is..." or "Remember that...")';
      }

      // Check if asking about memory/recall
      if (lower.indexOf('how many message') !== -1 || lower.indexOf('conversation count') !== -1) {
        var count = window.FPCSMemory.recall.count();
        return 'We\'ve exchanged ' + count + ' messages in this session so far.';
      }
    }

    // 3. Static response matching (existing behavior)
    for (var key in RESPONSES) {
      if (lower.indexOf(key) !== -1) return RESPONSES[key];
    }

    // 4. Fuzzy keyword matching
    if (lower.indexOf('progress') !== -1) return RESPONSES['show progress'];
    if (lower.indexOf('next') !== -1 || lower.indexOf('todo') !== -1) return RESPONSES['what\'s next?'];
    if (lower.indexOf('deadline') !== -1 || lower.indexOf('date') !== -1) return RESPONSES['deadline status'];
    if (lower.indexOf('missing') !== -1) return RESPONSES['missing income'];
    if (lower.indexOf('client') !== -1) return RESPONSES['client list'];
    if (lower.indexOf('deduct') !== -1) return RESPONSES['top deductions'];
    if (lower.indexOf('number') !== -1 || lower.indexOf('stats') !== -1) return RESPONSES['key numbers'];

    // 5. Memory-based context-aware fallback
    if (hasMemory()) {
      // Search recall memory for relevant past answers
      var searchResults = window.FPCSMemory.recall.search(lower.split(' ')[0]);
      if (searchResults.length > 2) {
        window.FPCSMemory.monologue.think('Found ' + searchResults.length + ' related messages in recall. Using fallback.');
      }
    }

    // 6. Default response
    return "I'm tracking that. For detailed answers, check the relevant dashboard section or try /help for commands!";
  }

  /**
   * Calculate days to deadline
   */
  function _getDaysToDeadline() {
    try {
      var deadline = new Date('2026-04-10');
      var now = new Date();
      var diff = deadline - now;
      var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days > 0) return days + ' days remaining';
      if (days === 0) return 'TODAY!';
      return Math.abs(days) + ' days overdue';
    } catch (e) { return null; }
  }

  // ============================================================
  //  UI — Chat bubble, panel, messages
  // ============================================================

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
      '.bot-panel-header .mem-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-left:4px}',
      '.bot-panel-close{background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:4px}',
      '.bot-panel-close:hover{color:#f87171}',

      '.bot-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;max-height:300px;min-height:120px}',
      '.bot-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word}',
      '.bot-msg.bot{background:#1e293b;color:#e2e8f0;align-self:flex-start;border-bottom-left-radius:4px}',
      '.bot-msg.user{background:rgba(56,189,248,.15);color:#e2e8f0;align-self:flex-end;border-bottom-right-radius:4px}',
      '.bot-msg.system{background:rgba(74,222,128,.08);color:#4ade80;align-self:center;border-radius:8px;font-size:11px;font-style:italic;max-width:95%;text-align:center}',
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

    // Memory LED indicator color
    var memColor = hasMemory() ? '#4ade80' : '#64748b';
    var memTitle = hasMemory() ? 'Memory active' : 'Memory offline';

    // Create DOM
    var container = document.createElement('div');
    container.className = 'bot-float';
    container.innerHTML = [
      '<div class="bot-panel" id="botPanel">',
      '  <div class="bot-panel-header">',
      '    <h3><span style="font-size:18px">&#129302;</span> ' + cfg.name + ' <span class="ctx">' + cfg.context + '</span><span class="mem-dot" id="memDot" title="' + memTitle + '" style="background:' + memColor + '"></span></h3>',
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

    // Greeting — personalized if we have memory
    var greeting = cfg.greeting;
    if (hasMemory()) {
      var summaryCount = window.FPCSMemory.summaries.all().length;
      var recallCount = window.FPCSMemory.recall.count();
      if (recallCount > 0) {
        greeting += ' Picking up where we left off (' + recallCount + ' messages in memory).';
      } else if (summaryCount > 0) {
        greeting += ' I remember our past conversations (' + summaryCount + ' sessions on file).';
      }
    }
    addBotMessage(greeting);

    // Update memory LED when memory becomes ready
    if (!hasMemory()) {
      document.addEventListener('fpcs-authed', function () {
        setTimeout(function () {
          var dot = document.getElementById('memDot');
          if (dot && hasMemory()) {
            dot.style.background = '#4ade80';
            dot.title = 'Memory active';
          }
        }, 500);
      });
    }
  }

  // ============================================================
  //  MESSAGE DISPLAY
  // ============================================================

  function addBotMessage(text) {
    var div = document.getElementById('botMessages');
    if (!div) return;
    var msg = document.createElement('div');
    msg.className = 'bot-msg bot';
    msg.innerHTML = '<div class="sender">' + cfg.name + '</div>' + text;
    div.appendChild(msg);
    div.scrollTop = div.scrollHeight;
  }

  function addUserMessage(text) {
    var div = document.getElementById('botMessages');
    if (!div) return;
    var msg = document.createElement('div');
    msg.className = 'bot-msg user';
    msg.innerHTML = '<div class="sender">Commander</div>' + text;
    div.appendChild(msg);
    div.scrollTop = div.scrollHeight;
  }

  function addSystemMessage(text) {
    var div = document.getElementById('botMessages');
    if (!div) return;
    var msg = document.createElement('div');
    msg.className = 'bot-msg system';
    msg.textContent = text;
    div.appendChild(msg);
    div.scrollTop = div.scrollHeight;
  }

  function showTyping() {
    var div = document.getElementById('botMessages');
    if (!div) return;
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

  // ============================================================
  //  MESSAGE HANDLING — Memory-integrated send/receive
  // ============================================================

  function sendMessage(text) {
    if (!text || !text.trim()) return;
    text = text.trim();
    addUserMessage(text);
    document.getElementById('botInput').value = '';

    // Record in recall memory
    if (hasMemory()) {
      window.FPCSMemory.recall.add('user', text, { page: cfg.context, botName: cfg.name });

      // Run learning engine — detect facts, preferences, corrections
      var learned = window.FPCSMemory.learning.processUserMessage(text);
      if (learned) {
        // Show a subtle acknowledgment that something was learned
        setTimeout(function () {
          var ack = '';
          switch (learned.type) {
            case 'name': ack = 'Noted! I\'ll remember your name.'; break;
            case 'fact': ack = 'Got it, stored in memory.'; break;
            case 'preference': ack = 'Preference noted.'; break;
            case 'deadline': ack = 'Deadline updated in memory.'; break;
            default: ack = 'Learned something new.';
          }
          addSystemMessage(ack);
        }, 300);
      }
    }

    showTyping();
    setTimeout(function(){
      hideTyping();
      var response = getResponse(text);
      addBotMessage(response);

      // Record bot response in recall memory
      if (hasMemory()) {
        window.FPCSMemory.recall.add('bot', response.replace(/<[^>]+>/g, ''), { page: cfg.context, botName: cfg.name });
      }
    }, 600 + Math.random() * 400);
  }

  // ============================================================
  //  GLOBAL FUNCTIONS
  // ============================================================

  window._botToggle = function() {
    var panel = document.getElementById('botPanel');
    var bubble = document.getElementById('botBubble');
    panel.classList.toggle('open');
    bubble.classList.remove('has-msg');
  };

  window._botSend = function() {
    sendMessage(document.getElementById('botInput').value);
  };

  // ============================================================
  //  INIT — Wait for auth, then create bot
  // ============================================================

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
