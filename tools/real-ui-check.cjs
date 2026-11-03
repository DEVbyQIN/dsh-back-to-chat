// Dedicated real-host UI check; only the isolated QA profile may be used here.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const log=fs.readFileSync('/private/tmp/dsh-back-to-chat-qa/server.log','utf8');
 const url=log.match(/http:\/\/127\.0\.0\.1:3098\/\?token=\S+/)?.[0];
 assert.ok(url,'Isolated server must be ready');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);
 await page.waitForFunction(()=>!!window.__dshBackToChat,{timeout:20000});
 await page.waitForFunction(()=>window.__DSH_MODELS_ONBOARDING__?.credentialOnboarding===false);
 console.log('Isolated onboarding disabled');
 if(await page.getByRole('button',{name:'继续',exact:true}).isVisible()) await page.getByRole('button',{name:'继续',exact:true}).click();
 console.log('Plugin loaded in actual DSH');
 const editor=page.locator('[contenteditable="true"]').first();
 await editor.fill('返回按钮验证草稿');
 await page.getByRole('button',{name:/^(Plugins|插件)$/}).click();
 const button=page.locator('[data-dsh-back-to-chat]');await button.waitFor({state:'visible'});
 await page.locator('[data-plugin-panel][aria-busy="false"]').waitFor();
 // Reproduce the desktop platform clearance using the same host CSS.
 await page.locator('html').evaluate(el=>{el.setAttribute('data-platform','darwin');el.lang='zh';});
 await page.waitForFunction(()=>document.querySelector('[data-dsh-back-to-chat]').getAttribute('aria-label')==='返回当前会话');
 const box=await button.boundingBox();assert.ok(box.width>=110&&box.height===32);
 const heading=await page.locator('[data-plugin-panel] h1').boundingBox();assert.ok(box.y+box.height<heading.y,'Button must occupy the empty upper-left header area');
 const out=path.resolve(__dirname,'../docs');fs.mkdirSync(out,{recursive:true});
 await page.screenshot({path:path.join(out,'plugins-light.png')});
 await button.click();await page.waitForFunction(()=>!document.querySelector('[data-plugin-panel]'));
 assert.equal(await button.isVisible(),false);
 assert.equal(await editor.innerText(),'返回按钮验证草稿');
 console.log('Return to chat with unchanged draft passed');
 await page.getByRole('button',{name:/^(Plugins|插件)$/}).click();await button.waitFor({state:'visible'});
 await page.locator('body').evaluate(el=>el.setAttribute('data-ds-dark-theme',''));
 await page.setViewportSize({width:900,height:700});
 await page.screenshot({path:path.join(out,'plugins-dark.png')});
 await button.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('[data-plugin-panel]'));
 console.log('Dark/narrow/keyboard return passed');
 const addedChecks=[];
 for(const panel of [{name:'自动化任务',key:'schedules',selector:'[data-testid="task-manager-page"]'}, {name:'上下文洞察',key:'context-insights',selector:'.lc-ov-page'}]) {
   await page.setViewportSize({width:1440,height:900});
   await page.locator('body').evaluate(el=>el.removeAttribute('data-ds-dark-theme'));
   await page.getByRole('button',{name:panel.name,exact:true}).click();
   await page.locator(panel.selector).waitFor();await button.waitFor({state:'visible'});
   const b=await button.boundingBox(),h=await page.locator(panel.selector+' h1').boundingBox();
   assert.ok(b.y+b.height<h.y,panel.name+' must leave heading clear');
   await page.screenshot({path:path.join(out,panel.key+'-light.png')});
   await button.click();await page.locator(panel.selector).waitFor({state:'detached'});
   assert.equal(await editor.innerText(),'返回按钮验证草稿');
   await page.getByRole('button',{name:panel.name,exact:true}).click();
   await button.waitFor({state:'visible'});
   await page.locator('body').evaluate(el=>el.setAttribute('data-ds-dark-theme',''));
   await page.setViewportSize({width:900,height:700});
   await page.screenshot({path:path.join(out,panel.key+'-dark.png')});
   await button.focus();await page.keyboard.press('Enter');await page.locator(panel.selector).waitFor({state:'detached'});
   assert.equal(await editor.innerText(),'返回按钮验证草稿');
   addedChecks.push(panel.name+' light/dark/position/click/keyboard/retained draft');
   console.log(panel.name+' passed');
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({host:'DSH 0.2.0-rc.2 isolated real WebUI',checks:[...addedChecks,'loaded via actual host','plugins button visible','desktop top clearance','click returns to native chat with unchanged draft','dark/narrow','Enter activation'],errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
