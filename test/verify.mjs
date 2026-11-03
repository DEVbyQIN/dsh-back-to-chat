import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {domFixture,TestContext} from './dom-fixture.mjs';
const source=readFileSync(new URL('../lib/client.js',import.meta.url),'utf8');
function fixture(active='plugins',kind='plugins') {
  const d=domFixture();
  const page=d.doc.createElement('section');if(kind==='schedules')page.setAttribute('data-testid','task-manager-page');
  else if(kind==='dsh-context')page.className='lc-ov-page';
  else page.setAttribute('data-plugin-panel','');d.main.append(page);
  d.center.getBoundingClientRect=()=>({left:280,top:0});
  d.window.getComputedStyle=()=>({getPropertyValue:()=>d.clearance||'0'});
  const subscribers=new Set(),state={activePanelId:active},calls=[];
  const layout={panelInfo:{getSnapshot:()=>state,subscribe:fn=>{subscribers.add(fn);return()=>subscribers.delete(fn);}},selectPanel:id=>{calls.push(id);state.activePanelId=id;subscribers.forEach(fn=>fn());}};
  let reg;d.window.__ModuleLoader__={load:r=>reg=r};
  vm.runInNewContext(source,{...d.extra,ResizeObserver:d.extra.MutationObserver,requestAnimationFrame:d.extra.setTimeout,cancelAnimationFrame:d.extra.clearTimeout});
  const plugin=reg.factory();const ctx=new TestContext({layout},plugin.inject);plugin.apply(ctx);
  const button=()=>d.doc.querySelector('[data-dsh-back-to-chat]');
  return {...d,page,button,plugin,ctx,state,calls,subscribers,reg,change(id){state.activePanelId=id;subscribers.forEach(fn=>fn());d.flush();}};
}
test('real factory declares its layout service and matching loader ID',()=>{
 const f=fixture();assert.equal(f.reg.id,'dsh-back-to-chat');assert.deepEqual([...f.plugin.inject],['layout']);f.ctx.dispose();
});
test('button uses native panel selection, preserving the session and draft',()=>{
 const f=fixture();assert.equal(f.button().hidden,false);assert.equal(f.button().getAttribute('aria-label'),'返回当前会话');assert.equal(f.button().style.left,'292px');
 f.button().click();f.flush();assert.deepEqual(f.calls,[null]);assert.equal(f.button().hidden,true);f.ctx.dispose();
});
test('unrelated panels stay unchanged and stale clicks do nothing',()=>{
 const f=fixture(null);assert.equal(f.button().hidden,true);f.button().click();assert.equal(f.calls.length,0);
 f.change('settings');assert.equal(f.button().hidden,true);f.change('plugins');assert.equal(f.button().hidden,false);f.ctx.dispose();
});
test('language and collapsed-window clearance update on native notifications',()=>{
 const f=fixture();f.doc.documentElement.lang='en';f.window.getComputedStyle=()=>({getPropertyValue:()=> '160px'});f.change('plugins');assert.equal(f.button().getAttribute('aria-label'),'Back to chat');assert.equal(f.button().style.left,'452px');f.ctx.dispose();
});
test('loading and remounting the plugin page does not lose or duplicate the control',()=>{
 const f=fixture();f.page.remove();f.change('plugins');assert.equal(f.button().hidden,true);
 f.main.append(f.page);f.change('plugins');assert.equal(f.button().hidden,false);f.plugin.apply(f.ctx);assert.equal(f.doc.querySelectorAll('[data-dsh-back-to-chat]').length,1);f.ctx.dispose();
});
test('disposal removes listeners, observers, styles, marker and pending frames',()=>{
 const f=fixture();f.change('plugins');f.ctx.dispose();assert.equal(f.button(),null);assert.equal(f.window.__dshBackToChat,undefined);assert.equal(f.subscribers.size,0);assert.equal(f.page.hasAttribute('data-dsh-back-to-chat-page'),false);assert.equal(f.doc.querySelectorAll('[data-plugin-css]').length,0);assert.ok(f.observers.every(o=>o.stopped));assert.equal(f.timers.size,0);
});
test('desktop control excludes dragging and provides keyboard focus styling without hashed selectors',()=>{
 assert.match(source,/-webkit-app-region:no-drag/);assert.match(source,/:focus-visible/);assert.doesNotMatch(source,/[A-Za-z0-9]{6}_(page|centerCol)/);
});

for(const panel of ['schedules','dsh-context']) {
 test(panel+' shows the same return control and selects the retained chat',()=>{
  const f=fixture(panel,panel);assert.equal(f.button().hidden,false);assert.equal(f.page.hasAttribute('data-dsh-back-to-chat-page'),true);
  assert.equal(f.button().style.left,'292px');f.button().click();f.flush();assert.deepEqual(f.calls,[null]);assert.equal(f.button().hidden,true);f.ctx.dispose();
 });
 test(panel+' tolerates loading, remounting and unrelated panels',()=>{
  const f=fixture(panel,panel);f.page.remove();f.change(panel);assert.equal(f.button().hidden,true);
  f.main.append(f.page);f.change(panel);assert.equal(f.button().hidden,false);f.change('settings');f.button().click();assert.equal(f.calls.length,0);assert.equal(f.page.hasAttribute('data-dsh-back-to-chat-page'),false);f.ctx.dispose();
 });
}
