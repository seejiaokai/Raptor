/* D581/D582 narrow actual-app walk. Authoring is not execution or approval.
 * Host must freeze build and assign heavy lock. Fresh OUT; preserve every failure.
 * Fixtures use native form writers; window reads/navigation only. No source/state writes.
 * Real browser zoom is not emulated: H04 is 320 CSS-pixel reflow, not a zoom PASS.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const req=createRequire(path.join(ROOT,'package.json'));
const {chromium,expect}=req('@playwright/test');
if(process.env.SANS_FROZEN!=='1'||process.env.SANS_LOCK_HELD!=='1')throw Error('Explicit host freeze and assigned lock required');
const OUT=process.env.SANS_OUT;
if(!OUT)throw Error('Set SANS_OUT to a fresh private result directory');
if(fs.existsSync(path.join(OUT,'results.json')))throw Error('Never overwrite prior results');
fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.HP_URL||'http://localhost:4192';
const selected=(process.env.SANS_ONLY||'').split(',').filter(Boolean);
const results=[],pictures=[];
const exe=process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium';
const browser=await chromium.launch(fs.existsSync(exe)?{executablePath:exe}:{});
const iso='2026-10-11';
const cell=p=>p.locator(`[data-icday="${iso}"]`);
async function shot(p,name){const file=path.join(OUT,name+'.png');await p.screenshot({path:file});pictures.push(file);}
async function login(p){await p.goto(BASE);await p.fill('#luser','ad');await p.fill('#lpass','a');await p.click('#loginForm button[type=submit]');await p.locator('#vWeek .day').first().waitFor({state:'attached'});await p.evaluate(()=>window.go('inputs'));await p.locator('#inpCal').waitFor();}
async function closeDay(p){if(await p.locator('#icPopClose').isVisible())await p.click('#icPopClose');}
async function openDay(p){await closeDay(p);await cell(p).click({position:{x:8,y:8}});await p.locator('#icPopAdd').waitFor();}
async function sans(p){await p.click('#inSansMode');await expect(p.locator('#inSansMode')).toHaveAttribute('aria-pressed','true');}
async function counts(p,expected,day=false){for(const [k,n] of Object.entries(expected)){const el=(day?p.locator('#sansDayPop'):cell(p)).locator(`[data-sans-count="${k}"]`);await expect(el).toHaveCount(1);await expect(el).toHaveAttribute('data-count',String(n));await expect(el).toContainText(new RegExp(`^${day?({f:'Fly',o:'OFT',a:'AMT'}[k]):k.toUpperCase()} ${n}(?:\\s|$)`));}}
async function fixture(p){await sans(p);await openDay(p);await p.click('#icPopAdd');await p.locator('#inpEditSave').waitFor();const opts=await p.locator('#inpEditPerson option').evaluateAll(es=>es.filter(e=>e.value).map(e=>({id:e.value,label:e.textContent})));assert(opts.length);await p.selectOption('#inpEditPerson',opts[0].id);for(const name of ['Fly','OFT','AMT'])await p.locator('#inpEditSans').getByLabel(name,{exact:true}).check();await p.fill('#inpEditRmk','HEADER synthetic all activities');await p.click('#inpEditSave');await expect(p.locator('#inpEditPop')).toBeHidden();await counts(p,{f:1,o:1,a:1},true);await closeDay(p);return opts[0];}
async function intentionalFilters(p){await expect(p.locator('#inFiltersBtn')).toBeVisible();await expect(p.locator('#inFiltersBtn')).toHaveAttribute('aria-expanded','false');await p.click('#inFiltersBtn');await expect(p.locator('#inFiltersBtn')).toHaveAttribute('aria-expanded','true');await expect(p.locator('#inFPerson')).toBeVisible();}
async function collapsed(p){await expect(p.locator('#inFiltersBtn')).toHaveAttribute('aria-expanded','false');await expect(p.locator('#inFPerson')).toBeHidden();await expect(p.locator('#inFSearch')).toBeHidden();assert.equal(await p.locator('#inFPerson').evaluate(el=>el.getClientRects().length),0,'Collapsed native controls must have no visible box');}
async function geometry(p,selectors){const measurements={};for(const s of selectors){await p.locator(s).scrollIntoViewIfNeeded();measurements[s]=await p.locator(s).evaluate(el=>{const b=el.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {x:b.x,y:b.y,w:b.width,h:b.height,hit:!!hit&&(hit===el||el.contains(hit)),inside:b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight}});assert(measurements[s].h>=44&&measurements[s].hit&&measurements[s].inside,s+JSON.stringify(measurements[s]));}assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page has horizontal overflow');return measurements;}
async function sameCalendar(p){await expect(p.locator('#inpCal')).toBeVisible();await expect(p.locator('#inCalBtn')).toHaveAttribute('aria-pressed','true');await expect(p.locator('#inSansMode')).toHaveAttribute('aria-pressed','true');}
async function openColours(p){await p.click('#sansColours');await expect(p.locator('#sansColourForm')).toBeVisible();}
async function values(p){return [await p.inputValue('#sansAmber'),await p.inputValue('#sansRed')];}
async function escapePopup(p){await p.keyboard.press('Escape');await expect(p.locator('#sansColourForm')).toBeHidden();await expect(p.locator('#sansColours')).toBeFocused();await sameCalendar(p);}
async function popupContract(p,name){
  await openColours(p);const saved=await values(p),legend=await p.locator('.sans-legend').innerText();
  await p.fill('#sansAmber','8');await p.fill('#sansRed','9');
  // Capture actual browser pointer/click targets, without intercepting any event.
  await p.evaluate(()=>{window.__headerEvents=[];for(const type of ['pointerdown','pointerup','click','keydown'])document.addEventListener(type,e=>window.__headerEvents.push({type,key:e.key||'',target:e.target.id||e.target.tagName,capture:true}),true);});
  const next=p.locator('#icNext');await next.scrollIntoViewIfNeeded();const b=await next.boundingBox();assert(b);
  const before=await p.locator('[data-icday]').first().getAttribute('data-icday');
  await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();
  await expect(p.locator('#sansColourForm')).toBeHidden(); // pointerdown, BEFORE pointerup/click
  await p.mouse.up();await expect.poll(()=>p.locator('[data-icday]').first().getAttribute('data-icday')).not.toBe(before);
  await p.click('#icPrev');await openColours(p);assert.deepEqual(await values(p),saved);assert.equal(await p.locator('.sans-legend').innerText(),legend);
  // Start text selection INSIDE, release OUTSIDE: no outside pointerdown occurred.
  const text=p.locator('#sansColourForm strong');await text.scrollIntoViewIfNeeded();const tb=await text.boundingBox();assert(tb);
  const outside=await p.evaluate(()=>{const w=document.querySelector('.sans-colour-control');return [{x:2,y:2},{x:innerWidth-2,y:2},{x:2,y:innerHeight-2},{x:innerWidth-2,y:innerHeight-2}].find(q=>{const e=document.elementFromPoint(q.x,q.y);return e&&!w.contains(e)});});assert(outside,'Need a genuinely outside release point');
  await p.mouse.move(tb.x+5,tb.y+tb.height/2);await p.mouse.down();await p.mouse.move(outside.x,outside.y,{steps:8});await p.mouse.up();await expect(p.locator('#sansColourForm')).toBeVisible();
  await p.click('#sansColours');await expect(p.locator('#sansColourForm')).toBeHidden();await openColours(p);
  await p.fill('#sansAmber','2');await p.fill('#sansRed','2');await p.click('#sansColourSave');await expect(p.locator('#sansColourForm')).toBeVisible();assert.equal(await p.locator('.sans-legend').innerText(),legend);
  await p.locator('#sansColourForm').getByRole('button',{name:'Cancel',exact:true}).click();await openColours(p);assert.deepEqual(await values(p),saved);
  await p.fill('#sansAmber','2');await p.fill('#sansRed','4');await p.click('#sansColourSave');await expect(p.locator('#sansColourForm')).toBeHidden();await openColours(p);assert.deepEqual(await values(p),['2','4']);
  await shot(p,name+'-colour-popup');await escapePopup(p);
  await p.keyboard.press('Escape');await expect(p.locator('#inListBtn')).toHaveAttribute('aria-pressed','true');await expect(p.locator('#inpCal')).toBeHidden();
  return {saved,validSaved:['2','4'],events:await p.evaluate(()=>window.__headerEvents)};
}
async function run(name,size,fn){if(selected.length&&!selected.includes(name))return;const errors=[];const ctx=await browser.newContext({viewport:size,hasTouch:size.width<760,isMobile:size.width<760,timezoneId:'Asia/Singapore'});const p=await ctx.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});p.on('response',r=>{if(r.status()>=400)errors.push('network:'+r.status()+' '+r.url())});try{await p.clock.setFixedTime(new Date('2026-10-11T09:00:00+08:00'));await login(p);const detail=await fn(p,ctx);assert.deepEqual(errors,[]);results.push({name,status:'PASS',detail});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',message:e.stack,errors});await shot(p,'FAIL-'+name).catch(()=>{});console.log('FAIL',name,e.message);}finally{await ctx.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({base:BASE,results,pictures,inspection:'OWED: independently open every original PNG'},null,2));}}
try{
  for(const [name,size] of [['H01-phone',{width:390,height:844}],['H02-short-phone',{width:390,height:568}],['H03-desktop',{width:1440,height:900}]])await run(name,size,async p=>{
    const phone=size.width<760;
    await expect(p.locator('#inMemberMode')).toHaveAttribute('aria-pressed','true');
    if(phone){await collapsed(p);const a=await p.locator('#inMemberMode').boundingBox(),b=await p.locator('#inSansMode').boundingBox();assert(a&&b);assert(Math.abs(a.width-b.width)<=1&&Math.abs(a.y-b.y)<=1,'Primary modes must be equal-width same-row tabs');assert(a.width+b.width>=size.width-70,'Primary tabs must span the phone content width');}else{await expect(p.locator('#inFPerson')).toBeVisible();await expect(p.locator('#inFSearch')).toBeVisible();}
    await sans(p);await counts(p,{f:0,o:0,a:0});
    const hit=await geometry(p,['#inMemberMode','#inSansMode','#inCalBtn','#inListBtn','#inMedBtn','#icPrev','#icNext','#icToday','#icSelectDates','#sansColours',...(phone?['#inFiltersBtn']:[])]);
    await p.locator('#inMemberMode').scrollIntoViewIfNeeded();await shot(p,name+'-default-header');
    return {hit,popup:await popupContract(p,name)};
  });
  await run('H04-320-reflow',{width:320,height:720},async p=>{await collapsed(p);await fixture(p);const hit=await geometry(p,['#inMemberMode','#inSansMode','#inCalBtn','#inListBtn','#inMedBtn','#inFiltersBtn','#icSelectDates','#sansColours']);await p.locator('#inMemberMode').scrollIntoViewIfNeeded();await shot(p,'320-reflow-counts');await intentionalFilters(p);await p.fill('#inFSearch','HEADER');await p.click('#inFiltersBtn');await collapsed(p);await expect(p.locator('#inFilterSummary')).toContainText('HEADER');await expect(p.locator('#inFiltersClear')).toBeVisible();return {hit,limitation:'320 CSS-pixel viewport; real browser 200% zoom remains a manual check, not claimed here'};});
  await run('H05-phone-filter-memory-clear',{width:390,height:844},async p=>{
    await intentionalFilters(p);await p.selectOption('#inFType','LL');await p.fill('#inFSearch','MEMBER_KEEP');await p.click('#inFiltersBtn');await sans(p);await collapsed(p);
    const person=await fixture(p);const fixtureIID=await p.evaluate(()=>window.INPUTS.find(r=>r.remarks==='HEADER synthetic all activities')?.iid);assert(fixtureIID,'Actual native saved fixture IID required');await intentionalFilters(p);assert.equal(await p.inputValue('#inFSearch'),'');await p.selectOption('#inFPerson',person.id);await p.fill('#inFSearch','NO_MATCH_HEADER');await p.click('#inFiltersBtn');await collapsed(p);await expect(p.locator('#inFilterSummary')).toContainText('NO_MATCH_HEADER');await expect(p.locator('#inFilterSummary')).toContainText(person.label.trim());await expect(p.locator('#inFiltersBtn')).toContainText('2');await counts(p,{f:1,o:1,a:1});await openDay(p);await expect(p.locator('#sansDayPop [data-popiid]')).toHaveCount(0);await counts(p,{f:1,o:1,a:1},true);await closeDay(p);
    await p.click('#inListBtn');await expect(p.locator('#inRangeBtn')).toBeVisible();await p.click('#inRangeBtn');await p.click('#inRangeAll');const range=await p.locator('#inRangeBtn').innerText();await expect(p.locator('#inExport')).toBeVisible();
    await p.click('#inFiltersClear');await collapsed(p);assert.equal(await p.locator('#inRangeBtn').innerText(),range,'Clear filters must preserve List date window');const expectedIIDs=await p.evaluate(()=>window.INPUTS.filter(r=>r.type==='SANS Availability').map(r=>r.iid).sort());await expect.poll(()=>p.locator('#inBody tr[data-iid]').evaluateAll(es=>es.map(e=>e.dataset.iid).sort())).toEqual(expectedIIDs);assert(expectedIIDs.includes(fixtureIID),'Clearing filters must include actual newly saved offer');await expect(p.locator('#inFiltersClear')).toBeHidden();
    await intentionalFilters(p);assert.equal(await p.inputValue('#inFPerson'),'all');assert.equal(await p.inputValue('#inFSearch'),'');await p.click('#inFiltersBtn');await p.click('#inMemberMode');await intentionalFilters(p);assert.equal(await p.inputValue('#inFType'),'LL');assert.equal(await p.inputValue('#inFSearch'),'MEMBER_KEEP');await shot(p,'phone-applied-filters-expanded');
    await p.click('#inFiltersClear');assert.equal(await p.inputValue('#inFType'),'all');assert.equal(await p.inputValue('#inFSearch'),'');await p.click('#inFiltersBtn');await p.click('#inSansMode');await p.click('#inCalBtn');await counts(p,{f:1,o:1,a:1});await openDay(p);await counts(p,{f:1,o:1,a:1},true);await shot(p,'phone-three-activity-day');return {person,range,totals:[1,1,1],independentModeMemory:true};
  });
  await run('H06-popup-repaint-and-editor-layers',{width:1440,height:900},async p=>{
    await sans(p);await openColours(p);const old=await values(p);await p.fill('#sansAmber','2');await p.fill('#sansRed','4');await p.click('#sansColourSave');await expect(p.locator('#sansColourForm')).toBeHidden();await openColours(p);
    // Keyboard activation is a genuine Undo command, no pointerdown and no state bypass.
    await p.locator('#undoBtn').focus();await p.keyboard.press('Enter');await expect(p.locator('#sansColourForm')).toBeVisible();await expect(p.locator('.sans-legend')).toContainText(`Amber: ${old[0]}`);await escapePopup(p);
    await openColours(p);await p.locator('#redoBtn').focus();await p.keyboard.press('Enter');await expect(p.locator('#sansColourForm')).toBeVisible();await expect(p.locator('.sans-legend')).toContainText('Amber: 2');await escapePopup(p);
    await openColours(p);await p.locator('#sansAmber').focus();
    const traversal=[];async function tabTo(selector){for(let i=0;i<120;i++){const state=await p.evaluate(sel=>({match:!!document.activeElement?.matches(sel),id:document.activeElement?.id,day:document.activeElement?.getAttribute('data-icday')}),selector);traversal.push(state);if(state.match)return true;await p.keyboard.press('Tab');}return false;}
    const dateReached=await tabTo(`[data-icday="${iso}"]`);let overlap='not reachable through 120 native Tab steps';
    if(dateReached){await p.keyboard.press('Enter');await expect(p.locator('#sansDayPop')).toBeVisible();await expect(p.locator('#sansColourForm')).toBeVisible();const addReached=await tabTo('#icPopAdd');assert(addReached,'Day opened but Add was not keyboard reachable');await p.keyboard.press('Enter');await expect(p.locator('#inpEditPop')).toBeVisible();await expect(p.locator('#sansColourForm')).toBeVisible();await shot(p,'desktop-keyboard-editor-over-colours');await p.keyboard.press('Escape');await expect(p.locator('#inpEditPop')).toBeHidden();await expect(p.locator('#sansColourForm')).toBeVisible();await escapePopup(p);await expect(p.locator('#sansDayPop')).toBeVisible();await p.keyboard.press('Escape');await expect(p.locator('#sansDayPop')).toBeHidden();await sameCalendar(p);overlap='naturally reached: editor then colours then day';}else await escapePopup(p);
    await p.keyboard.press('Escape');await expect(p.locator('#inListBtn')).toHaveAttribute('aria-pressed','true');return {old,repaintOrders:['normal open','existing Undo notify','existing Redo notify'],overlap,traversal};
  });
  await run('H07-role-withdrawal',{width:1440,height:900},async p=>{
    await fixture(p);await openColours(p);const saved=await values(p);await p.fill('#sansAmber','8');await p.fill('#sansRed','9');await expect(p.locator('#roleBadge')).toBeVisible();await p.locator('#roleBadge').focus();await expect(p.locator('#roleBadge')).toBeFocused();await p.keyboard.press('Enter');await expect(p.locator('#sansColours')).toHaveCount(0);await expect(p.locator('#sansColourForm')).toHaveCount(0);await p.setViewportSize({width:390,height:844});await expect(p.locator('#sansColours')).toHaveCount(0);await expect(p.locator('#sansColourForm')).toHaveCount(0);await counts(p,{f:1,o:1,a:1});await openDay(p);await counts(p,{f:1,o:1,a:1},true);await expect(p.locator('#sansRequired')).toHaveCount(0);await shot(p,'member-three-activity-day');await closeDay(p);await p.keyboard.press('Escape');await expect(p.locator('#inListBtn')).toHaveAttribute('aria-pressed','true');await p.setViewportSize({width:1440,height:900});await expect(p.locator('#roleBadge')).toBeVisible();await p.locator('#roleBadge').focus();await expect(p.locator('#roleBadge')).toBeFocused();await p.keyboard.press('Enter');await p.click('#inCalBtn');await openColours(p);assert.deepEqual(await values(p),saved,'Withdrawn admin draft must not persist');await escapePopup(p);return {saved,memberTotals:[1,1,1],noStaleEscapeCapture:true};
  });
}finally{await browser.close();fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({base:BASE,results,pictures,inspection:'OWED: independently open every original PNG'},null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;console.log(JSON.stringify({results,pictures},null,2));}
