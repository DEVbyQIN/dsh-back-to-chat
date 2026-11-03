// The host keeps the main session retained while a utility panel is open.
// Selecting the conversation panel restores that same session and draft.
window.__ModuleLoader__.load({
  id: 'dsh-back-to-chat',
  factory: () => {
    var KEY = '__dshBackToChat';
    var PAGES = new Map([
      ['plugins', '[data-plugin-panel]'],
      ['schedules', '[data-testid="task-manager-page"]'],
      ['dsh-context', '.lc-ov-page']
    ]);
    var CSS = `
[data-dsh-back-to-chat]{position:fixed;z-index:21;display:inline-flex;align-items:center;gap:6px;height:32px;width:auto;padding:0 10px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-secondary,#626773);font:500 13px/20px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;-webkit-app-region:no-drag;white-space:nowrap}
[data-dsh-back-to-chat][hidden]{display:none}
[data-dsh-back-to-chat]:hover{background:var(--dsw-alias-interactive-bg-hover,#f0f1f3);color:var(--dsw-alias-label-primary,#181a1f)}
[data-dsh-back-to-chat]:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4b7bec);outline-offset:2px}
[data-dsh-back-to-chat] svg{width:16px;height:16px;flex:none}
html:not([data-platform="darwin"]) [data-dsh-back-to-chat-page]{box-sizing:border-box;padding-top:40px}
`;
    function install(ctx) {
      var alive = true, frame = null, observed = null, marked = null;
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-dsh-back-to-chat', '');
      button.hidden = true;
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 6l-6 6 6 6M8 12h12"/></svg>';
      var label = document.createElement('span');
      button.appendChild(label);
      var style = document.createElement('style');
      style.setAttribute('data-plugin', 'dsh-back-to-chat');
      style.setAttribute('data-plugin-css', 'dsh-back-to-chat/style');
      style.textContent = CSS;
      document.head.appendChild(style);
      document.body.appendChild(button);
      function back() {
        if (alive && PAGES.has(ctx.layout.panelInfo.getSnapshot().activePanelId)) {
          ctx.layout.selectPanel(null);
        }
      }
      button.addEventListener('click', back);
      function sync() {
        if (!alive) return;
        frame = null;
        var selector = PAGES.get(ctx.layout.panelInfo.getSnapshot().activePanelId);
        var page = selector ? document.querySelector(selector) : null;
        button.hidden = !page;
        if (marked !== page) {
          marked?.removeAttribute('data-dsh-back-to-chat-page');
          marked = page;
          marked?.setAttribute('data-dsh-back-to-chat-page', '');
        }
        var main = page?.closest('[data-slot="main"]');
        var target = main?.parentElement || page;
        if (target !== observed) {
          resize?.disconnect();
          observed = target;
          if (target) resize?.observe(target);
        }
        if (!page) return;
        var rect = target.getBoundingClientRect();
        var clearance = parseFloat(window.getComputedStyle(target).getPropertyValue('--dsh-frame-leading-clearance')) || 0;
        var text = String(document.documentElement.lang || navigator.language || 'en').startsWith('zh') ? '返回当前会话' : 'Back to chat';
        if (label.textContent !== text) label.textContent = text;
        button.setAttribute('aria-label', text);
        button.title = text;
        button.style.left = (rect.left + clearance + 12) + 'px';
        button.style.top = (rect.top + 8) + 'px';
      }
      function schedule() {
        if (alive && frame === null) frame = requestAnimationFrame(sync);
      }
      var resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
      var observer = new MutationObserver(records => {
        if (records.some(r => r.target === document.documentElement ||
          [...(r.addedNodes || []), ...(r.removedNodes || [])].some(n =>
            n.nodeType === 1 && [...PAGES.values()].some(selector => n.matches?.(selector) || n.querySelector?.(selector))))) schedule();
      });
      observer.observe(document.body, {childList:true, subtree:true});
      observer.observe(document.documentElement, {attributes:true, attributeFilter:['lang','data-fullscreen','data-platform']});
      var unsubscribe = ctx.layout.panelInfo.subscribe(schedule);
      window.addEventListener('resize', schedule);
      sync();
      var api = {dispose};
      window[KEY] = api;
      function dispose() {
        if (!alive) return;
        alive = false;
        if (frame !== null) cancelAnimationFrame(frame);
        unsubscribe();
        observer.disconnect();
        resize?.disconnect();
        window.removeEventListener('resize', schedule);
        button.removeEventListener('click', back);
        button.remove();
        style.remove();
        marked?.removeAttribute('data-dsh-back-to-chat-page');
        if (window[KEY] === api) delete window[KEY];
      }
      return dispose;
    }
    function apply(ctx) {
      if (window[KEY]) return;
      ctx.effect(() => install(ctx), 'dsh-back-to-chat: return button');
    }
    return {apply, inject:['layout']};
  }
});
