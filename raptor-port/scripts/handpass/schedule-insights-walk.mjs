/* D558 independent MENU01–07 scenario execution. Real controls only; private pictures. */
import { chromium, expect } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { login, readDay } from './lib.mjs'
import { buildSaturday } from './fixture.mjs'
import { verify } from './schedule-insights-evidence.mjs'
const base=process.env.HP_URL||'http://localhost:4220',out=process.env.MENU_OUT,frozen=process.env.MENU_FREEZE
if(!out||!frozen||existsSync(out))throw new Error('New private MENU_OUT and existing MENU_FREEZE required')
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local built bundle only')
mkdirSync(out,{recursive:true})
const result={started:new Date().toISOString(),identity:await verify(frozen,base),steps:[],images:[],errors:[],limits:['Chromium emulation does not prove physical iPhone Safari/hardware keyboard.','No unrelated page-body or whole mission-mix recalculation audit; no IT-guide reshoot.']}
const save=()=>writeFileSync(resolve(out,'result.json'),JSON.stringify(result,null,2))
const browser=await chromium.launch({headless:true});let page,ctx,scene
async function start(name,width=390,height=844,who='a'){
  if(ctx)await ctx.close();scene=name;ctx=await browser.newContext({viewport:{width,height}});page=await ctx.newPage()
  page.on('console',m=>{if(m.type()==='error')result.errors.push({scene,message:m.text()})});page.on('pageerror',e=>result.errors.push({scene,message:e.message}));page.on('response',r=>{if(r.status()>=400)result.errors.push({scene,message:r.status()+' '+r.url()})})
  await page.goto(base);await login(page,who)
}
async function shot(name){const path=resolve(out,`${scene}-${name}.png`);await page.screenshot({path});result.images.push({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});save()}
async function step(name,fn){const row={scene,name};try{row.result=await fn();row.pass=true;console.log('PASS '+scene+' '+name)}catch(e){row.pass=false;row.error=String(e);await shot('FAIL-'+name);throw e}finally{result.steps.push(row);save()}}
async function nav(p){if(await page.locator('#schedBoard:visible').count())await page.locator('#sbDone').click()
  const link=page.locator(`.nav [data-page="${p}"]`);if(await link.isVisible())await link.click();else{await page.locator('#burger').click();await page.locator(`#drawerNav [data-page="${p}"]`).click()}
  await page.waitForFunction(p=>window.CURPAGE===p,p)
}
const snapshot=()=>page.evaluate(()=>JSON.stringify([window.DAYS,window.INPUTS,window.SCHED,window.commandStreamLen(),window.ELOG.rows,localStorage]))
async function hit(s){expect(await page.locator(s).evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h===e||e.contains(h)})).toBe(true)}
async function menu(id){await page.locator(`#${id}More`).click();await hit(`#${id}MoreInsights`)}
async function insights(id){await menu(id);await page.locator(`#${id}MoreInsights`).click();await expect(page.locator('#insightModal')).toBeVisible();return page.locator('#insightBody').innerText()}
async function close(id){await page.locator('#insightClose').click();if(id)await expect(page.locator(`#${id}More`)).toBeFocused()}
try{
  await start('phone')
  for(const [p,id] of [['viewsched','viewSched'],['editsched','editSched']])await step('MENU01-02-'+p,async()=>{
    await nav(p);const before=await snapshot();await menu(id);await shot(p+'-menu');await page.keyboard.press('Escape');await expect(page.locator(`#${id}More`)).toBeFocused()
    const body=await insights(id);expect(body.length).toBeGreaterThan(100);await shot(p+'-insights');await close(id);expect(await snapshot()).toBe(before)
    await menu(id);await page.locator(`#search${p==='viewsched'?'V':'E'}`).click();await expect(page.locator(`#${id}MoreMenu`)).toHaveCount(0)
    return {body,noStoredWrites:true}
  })
  await step('MENU03-06-dirty-blur-and-context',async()=>{
    await nav('editsched');const f=page.locator('#eWeek [data-txt="ff:0.0.0.cs"]'),n=await page.evaluate(()=>window.commandStreamLen())
    await f.fill('MENU WALK');await menu('editSched');expect(await page.evaluate(()=>window.commandStreamLen())).toBe(n+1);expect(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs)).toBe('MENU WALK')
    await page.keyboard.press('Escape');await f.fill('ESC CANCEL');await f.press('Escape');await expect(f).toHaveText('MENU WALK');await f.focus();await f.press('Tab');await expect(page.locator('#eWeek [data-txt="ff:0.0.0.msn"]')).toBeFocused()
    await menu('editSched');await nav('inputs');await nav('editsched');await expect(page.locator('#editSchedMoreMenu')).toHaveCount(0)
    await menu('editSched');await page.locator('#eWeek [data-sbday="0"]').first().click();await expect(page.locator('#editSchedMoreMenu')).toHaveCount(0);await page.locator('#sbDone').click();return {commandsAdded:1,tab:'Mission',escapeRestored:true}
  })
  await step('MENU01-03-narrow-highlight-resize',async()=>{
    await page.setViewportSize({width:320,height:568});await menu('editSched');const box=await page.locator('#editSchedMoreMenu').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);await shot('320-edit-menu');await page.keyboard.press('Escape')
    await page.locator('#page-editsched .hl-tog').click();await menu('editSched');await shot('320-highlight-menu');await page.setViewportSize({width:821,height:568});await expect(page.locator('#editSchedMoreMenu')).toHaveCount(0);await page.setViewportSize({width:390,height:844});await expect(page.locator('#editSchedMoreMenu')).toHaveCount(0);await page.locator('#page-editsched .hl-tog').click();return {box,desktopReset:true}
  })
  await step('MENU07-calendar-both-pages',async()=>{
    for(const [p,id,w] of [['viewsched','viewSched','#vWeek'],['editsched','editSched','#eWeek']]){
      await nav(p);await menu(id);await page.locator(`#page-${p} .filt-cal`).click();await page.locator('[data-wcal="2026-07-22"]').click();await page.waitForFunction(()=>window.CURWEEK==='20/07/2026');await expect(page.locator(`#${id}MoreMenu`)).toHaveCount(0)
      await expect.poll(()=>page.locator(w).evaluate(e=>Math.abs(e.querySelector('.day[data-day="2"]').getBoundingClientRect().left-e.getBoundingClientRect().left))).toBeLessThan(30)
      await page.locator(`#page-${p} .filt-cal`).click();await page.locator('#weekCal .wc-today').click();await page.waitForFunction(()=>window.CURWEEK==='13/07/2026')
    }return {exactDay:'Wed22Jul',today:'Mon13Jul'}
  })
  await step('MENU04-admin-drawer',async()=>{await page.locator('#burger').click();expect(await page.locator('#drawer h4').allTextContents()).toEqual(['Menu','Account']);await expect(page.locator('#drawerWeeks,#drawerPickWeek,#drawerInsights')).toHaveCount(0);await shot('drawer-admin');await page.locator('#drawerRole').click();await page.locator('#burger').click();await expect(page.locator('#drawerNav [data-page="editsched"]')).toHaveCount(0);await shot('drawer-admin-member');await page.locator('#drawerRole').click();return {weekShortcuts:0,accountActions:true}})
  await step('MENU04-drawer-other-tabs',async()=>{
    for(const p of ['inputs','leavewar','tracker']){await nav(p);await page.locator('#burger').click();await expect(page.locator('#drawerWeeks,#drawerPickWeek,#drawerInsights')).toHaveCount(0);await expect(page.locator('#drawerAcct')).toBeVisible();await page.locator('#drawerNav [data-page="viewsched"]').click();await insights('viewSched');await close('viewSched')}
    return {tabs:['Inputs','Leave War','Tracker'],scheduleDoor:true}
  })
  await start('member',390,844,'user')
  await step('MENU04-member',async()=>{await insights('viewSched');await close('viewSched');await page.locator('#burger').click();await expect(page.locator('#drawerNav [data-page="editsched"]')).toHaveCount(0);await expect(page.locator('#drawerRole')).toHaveCount(0);await shot('drawer');await page.locator('#drawerLogout').click();await expect(page.locator('#loginForm')).toBeVisible();await login(page);await expect(page.locator('#viewSchedMoreMenu')).toHaveCount(0);return {viewInsights:true,editingDoors:0,logoutReset:true}})
  await step('MENU04-actual-guest-separate-tree',async()=>{
    await nav('admin');await page.locator('.adm-cat').filter({hasText:'Users'}).click();await page.locator('#admGuestView').check()
    await page.locator('#burger').click();await page.locator('#drawerLogout').click();await page.fill('#luser','menu.guest');await page.fill('#lpass','demo');await page.click('#loginForm button')
    await page.fill('#accCs','Menu Guest');await page.fill('#accIni','MG');await page.selectOption('#accSeat','GND');await page.click('#accSend')
    await expect.poll(async()=>await page.locator('#guestApp,#accGuest').count()).toBeGreaterThan(0);if(await page.locator('#accGuest').count())await page.locator('#accGuest').click()
    await expect(page.locator('#guestApp')).toBeVisible();await expect(page.locator('#shell,#viewSchedMore,#editSchedMore,#drawer,#insightModal')).toHaveCount(0);await expect(page.locator('#vWeek [contenteditable="true"]')).toHaveCount(0);await shot('guest-tree');return {guestFromRealRequest:true,newDoors:0,readonly:true}
  })
  await start('issued',1440,1000)
  await step('MENU05-build-everything-Saturday',async()=>{await nav('editsched');await page.locator('#eWeek [data-sbday="5"]').first().click();const f=await buildSaturday(page);expect(f.every(r=>!r.includes('FAILED'))).toBe(true);return {fixture:f,day:await readDay(page,5)}})
  await step('MENU05-issued-pending-shared-doors',async()=>{
    const signs=page.locator('#schedBoard select[data-sign]:visible');expect(await signs.count()).toBe(4)
    for(let i=0;i<4;i++){const s=signs.nth(i),values=await s.locator('option').evaluateAll(os=>os.filter(o=>!o.disabled&&o.value).map(o=>o.value));expect(values.length).toBeGreaterThan(0);await s.selectOption(values[Math.min(i,values.length-1)])}
    await page.locator('#schedBoard [data-beak="5"]').click();await page.waitForFunction(()=>!!window.dayCurVer(5));const ver=await page.evaluate(()=>window.dayCurVer(5))
    const f=page.locator('#sbBoard [data-bfld="ff:5.0.0.cs"]').first();await f.fill('PENDING MENU');await f.press('Tab');expect(await page.evaluate(()=>window.pendCount(5))).toBeGreaterThan(0)
    // The fixture's signed/published/pending writes use the existing300ms
    // coalescing saver. Establish Saved before attributing writes to navigation.
    await expect(page.locator('.savestat')).toHaveCount(0)
    const before=await snapshot();await page.locator('#sbInsights').click();const expected=await page.locator('#insightBody').innerText();await close();await page.locator('#sbDone').click()
    await page.locator('#insightBtn').click();expect(await page.locator('#insightBody').innerText()).toBe(expected);await shot('desktop-insights');await close();await shot('desktop-toolbar')
    await page.setViewportSize({width:390,height:568});expect(await insights('editSched')).toBe(expected);await shot('phone-pending-insights');await close('editSched');await nav('viewsched');expect(await insights('viewSched')).toBe(expected)
    const all=page.locator('#insightBody [data-insights-all]');if(await all.count()){const rows=await page.locator('#insightBody .ibar').count();await all.click();await expect(all).toHaveText('Show less ↑');expect(await page.locator('#insightBody .ibar').count()).toBeGreaterThan(rows)}await close('viewSched')
    await nav('editsched');await page.locator('#eWeek [data-sbday="5"]').first().click();await page.locator('#sbMore').click();await page.locator('#sbMoreInsights').click();expect(await page.locator('#insightBody').innerText()).toBe(expected);await close();await shot('board-preserved')
    expect(await snapshot()).toBe(before);return {ver,context:'issued Saturday + pending edit',allFourDoorsMatch:true,noStoredWrites:true,body:expected}
  })
  await step('MENU01-landscape',async()=>{await page.locator('#sbDone').click();await page.setViewportSize({width:844,height:390});await expect(page.locator('#editSchedMore')).toHaveCount(0);await expect(page.locator('#insightBtn')).toBeVisible();await shot('844-landscape');return {desktopDoor:true}})
  result.endingIdentity=await verify(frozen,base);expect(result.errors).toEqual([]);result.pass=true
}finally{save();await browser.close()}
