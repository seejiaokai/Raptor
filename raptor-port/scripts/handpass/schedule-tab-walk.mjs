/* Native keyboard walk on frozen production bytes. Setup/fixtures use normal
   controls; browser model probes are read-only. D499 shares identical lifecycle
   proof but repeats each distinct editor, width, mode and focus mechanism. */
import { mkdirSync, existsSync, writeFileSync, appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect } from '@playwright/test'
import { open, readDay, login } from './lib.mjs'
import { buildSaturday, fileInputFromBoard } from './fixture.mjs'
import { root, verify } from './schedule-tab-evidence.mjs'
const base = process.env.HP_URL || 'http://localhost:4220'
const frozen = process.env.TAB_FREEZE
if (!frozen) throw new Error('TAB_FREEZE is required')
const out = resolve(root,'docs/img/handpass/2026-10-04-schedule-tab',process.env.TAB_RUN || 'walk-1')
if (existsSync(out)) throw new Error('Keep previous walk evidence; choose a new TAB_RUN')
mkdirSync(out,{recursive:true})
const R={base,freeze:frozen,started:new Date().toISOString(),steps:[],images:[],errors:[],limits:['Chromium widths/keyboard events do not prove physical iPhone Safari or hardware keyboard.','The fresh demo offers admin/member, not a dedicated scheduler/guest account.','No direct model/storage/command writes in page.evaluate.']}
R.identity=await verify(resolve(frozen),base)
let page, ctx, browser, errors, scene
const save=()=>writeFileSync(resolve(out,'result.json'),JSON.stringify(R,null,2))
const log=s=>{console.log(s);appendFileSync(resolve(out,'walk.log'),s+'\n')}
const assert=(v,msg)=>{if(!v)throw new Error(msg)}
const loc=s=>page.locator(s)
const sleep=()=>page.waitForTimeout(50)
async function shot(name){const path=resolve(out,`${scene}-${name}.png`);await page.screenshot({path});R.images.push(path);save()}
async function step(name,fn){const row={scene,name};try{row.result=await fn();row.pass=true;log('PASS '+scene+' '+name)}catch(e){row.pass=false;row.error=String(e);await shot('FAIL-'+name);log('FAIL '+scene+' '+name+' '+e.message);throw e}finally{R.steps.push(row);save()}}
async function start(name,width=1440,height=1000,who='a'){
  // A new isolated context has empty browser storage. Avoid ?fresh=1, whose
  // deliberately memory-only backend cannot prove a reload/persistence claim.
  scene=name;({page,ctx,browser,errors}=await open({width,height,who,fresh:false}));page.setDefaultTimeout(7000)
}
async function end(){R.errors.push(...errors.map(message=>({scene,message})));await browser.close();save()}
async function nav(to){
  if(await loc('#schedBoard:visible').count())await loc('#sbDone').click()
  const direct=loc('.nav [data-page="'+to+'"]')
  if(await direct.isVisible())await direct.click()
  else {await loc('#burger').click();await loc('#drawerNav [data-page="'+to+'"]').click()}
  await page.waitForFunction(p=>window.CURPAGE===p,to)
}
async function board(di=0){
  if(await loc('#schedBoard:visible').count()){if(await page.evaluate(()=>window.SBDAY)===di)return;await loc('#sbDone').click()}
  await nav('editsched');await loc('#eWeek [data-sbday="'+di+'"]').first().click();await expect(loc('#schedBoard')).toBeVisible()
}
const scope=(kind,di=0)=>kind==='board'?'#sbBoard':`#eWeek > .day[data-day="${di}"]`
const typing='[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
async function snapshot(){return page.evaluate(()=>({d:JSON.stringify(window.DAYS),i:JSON.stringify(window.INPUTS),s:JSON.stringify(window.SCHED),seq:window.commandStreamLen(),last:window.lastEnvelope(),history:window.ELOG.rows.length}))}
async function usable(handle){return handle.evaluate(e=>{
  const r=e.getBoundingClientRect(),left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom),x=(left+right)/2,y=(top+bottom)/2,hit=right>left&&bottom>top?document.elementFromPoint(x,y):null,cs=getComputedStyle(e)
  return {active:document.activeElement===e,connected:e.isConnected,rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:hit===e||e.contains(hit),visible:cs.visibility!=='hidden'&&cs.display!=='none'}
})}
async function tour(kind,di=0,photo=true){
  const s=scope(kind,di), all=await loc(s).locator(typing).elementHandles(),fields=[]
  for(const el of all)if(await el.isVisible()&&await el.evaluate(e=>(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)?!e.disabled&&!e.readOnly:e.getAttribute('contenteditable')==='true'))fields.push(el)
  assert(fields.length>10,'Tour must contain real fields')
  const before=await snapshot(), stops=[];await fields[0].focus()
  for(let i=0;i<fields.length;i++){
    if(i)await page.keyboard.press('Tab')
    const m=await usable(fields[i]);assert(m.active&&m.connected&&m.visible,'Lost typing stop '+i)
    // Focus reveal/hit is a separate real-browser assertion, not a CSS-class claim.
    assert(m.hit,'Focused box is covered/offscreen at stop '+i+' '+JSON.stringify(m.rect))
    stops.push(await fields[i].evaluate(e=>({key:e.dataset.txt||e.dataset.bfld||e.dataset.inp||e.dataset.ifld||e.dataset.itline||e.dataset.bombs||e.dataset.area||e.dataset.atime,section:e.closest('[data-secmove]')?.getAttribute('data-secmove')})))
    if(photo&&i===Math.min(25,fields.length-1))await shot(kind+'-typing')
  }
  // Reverse proves every adjacency, preserving empty/heading/input echoes.
  for(let i=fields.length-2;i>=0;i--){await page.keyboard.press('Shift+Tab');assert((await usable(fields[i])).active,'Reverse stop '+i)}
  const after=await snapshot();assert(before.d===after.d&&before.i===after.i&&before.s===after.s&&before.seq===after.seq,'Unchanged tour wrote data/history')
  return {kind,di,count:fields.length,stops}
}
async function text(kind,key,value,di=0){
  const el=loc(`${scope(kind,di)} [${kind==='board'?'data-bfld':'data-txt'}="${key}"]`).first()
  await el.fill(value);await page.keyboard.press('Tab');await sleep();return el
}
async function publish(di){
  await page.keyboard.press('Tab');await sleep()
  const signs=loc('#schedBoard select[data-sign]:visible');assert(await signs.count()===4,'Four signer controls required')
  for(let i=0;i<4;i++){const s=signs.nth(i),values=await s.locator('option').evaluateAll(os=>os.filter(o=>!o.disabled&&o.value).map(o=>o.value));assert(values.length,'No eligible signer');await s.selectOption(values[Math.min(i,values.length-1)]);await sleep()}
  await loc(`#schedBoard [data-beak="${di}"],#schedBoard [data-alpub="${di}"]`).first().click()
  await page.waitForFunction(i=>!!window.dayCurVer(i),di);return page.evaluate(i=>window.dayCurVer(i),di)
}
async function preview(ver){await loc('#schedBoard [data-planmenu]').first().click();await loc(`.wavemenu [data-planpv="${ver}"]`).click();await expect(loc('#sbBoard .pv-frozen')).toBeVisible()}
async function live(di){await loc(`#schedBoard [data-golive="${di}"]`).click();await expect(loc('#sbBoard .pv-frozen')).toHaveCount(0)}
try{
  await start('desktop')
  await nav('editsched')
  await step('week-all-families-forward-reverse-no-op',()=>tour('week'))
  await step('week-saved-TO-unchanged-Landing-Enter-settles-derived-display',async()=>{
    const to=loc('#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.to"]'),area=loc('#eWeek .day[data-day="0"] [data-atime="0.0.0"]'),before=await snapshot()
    await to.fill('1255');await page.keyboard.press('Tab');await page.waitForTimeout(100);await page.keyboard.press('Enter')
    await expect(to).toHaveText('12:55');await expect(area).toHaveText('1255-1405')
    assert((await snapshot()).seq===before.seq+1,'Exit duplicated time save')
    assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].atime??null)===null,'Derived time acquired override')
    await area.scrollIntoViewIfNeeded();await shot('week-derived-settled');const saved=await snapshot()
    await to.fill('1240');await page.keyboard.press('Tab');await page.waitForTimeout(100);await page.keyboard.press('Enter');await expect(area).toHaveText('1240-1405')
    return {saved,restored:await snapshot()}
  })
  await step('week-schedule-stores-area-input-writers',async()=>{
    const cases=[['ff:0.0.0.cs','TAB FLIGHT'],['ap:0.0.prog','TAB COMMON'],['dr:0.0.0.rmks','TAB DUTY'],['sr:0.amt.0.rmks','TAB SIM'],['gr:0.0.rmks','TAB GROUND'],['pn:0','TAB NOTES']]
    for(const [key,value]of cases){const b=await snapshot();await text('week',key,value);assert(await page.evaluate(([k,v])=>window.txtGet(k)===v,[key,value]),'Text writer '+key);assert((await snapshot()).seq===b.seq+1,'Duplicate text save '+key)}
    for(const [attr,value]of [['data-bombs','TAB STORES'],['data-area','TAB AREA'],['data-atime','1300-1400']]){await loc(`#eWeek .day[data-day="0"] [${attr}="0.0.0${attr==='data-bombs'?'.0':''}"]`).fill(value);await page.keyboard.press('Tab')}
    const input=loc('#eWeek .day[data-day="0"] [data-inp$=".rmks"]').first(),address=await input.getAttribute('data-inp');await input.fill('TAB INPUT');await page.keyboard.press('Tab');assert(await page.evaluate(a=>window.INPUTS.find(i=>i.iid===a.split('.')[0]).remarks==='TAB INPUT',address),'Input writer')
    await shot('week-writer-saved');return {cases,address,snapshot:await snapshot()}
  })
  await board()
  await step('board-all-families-and-open-inputs',async()=>{const toggle=loc('#sbBoard [data-pitog="0"]');if((await toggle.innerText()).includes('show'))await toggle.click();return tour('board')})
  await step('board-native-save-undo-redo-reload',async()=>{
    const old=await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs),before=await snapshot()
    await text('board','ff:0.0.0.cs','TAB BOARD');assert((await snapshot()).seq===before.seq+1,'Native change duplicated')
    await loc('#sbUndo').click();assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs)===old,'Undo')
    await loc('#sbRedo').click();assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs)==='TAB BOARD','Redo')
    await page.waitForFunction(()=>Object.values(localStorage).some(raw=>raw.includes('TAB BOARD')))
    // Session sign-in is intentionally transient; don't replay ?fresh=1 seed.
    await page.goto(base+'/');await login(page);await board();await expect(loc('#sbBoard [data-bfld="ff:0.0.0.cs"]').nth(1)).toHaveValue('TAB BOARD');await loc('#sbBoard [data-pitog="0"]').click();await shot('board-reloaded');return {old,after:await snapshot()}
  })
  await step('input-owned-ground-time-remarks-undo-redo-reload',async()=>{
    const original=await page.evaluate(()=>{
      const row=window.DAYS[0].ground.find(row=>row.src&&window.INPUTS.some(i=>i.iid===row.src&&i.acc==='g'))
      return structuredClone(window.INPUTS.find(i=>i.iid===row?.src))
    })
    assert(original,'Accepted Ground input required');const id=original.iid
    const read=()=>page.evaluate(id=>structuredClone(window.INPUTS.find(i=>i.iid===id)),id)
    const start=loc('#sbBoard [data-ifld="'+id+'.str"]').first(),remarks=loc('#sbBoard [data-ifld="'+id+'.rmks"]').first()
    const groundIndex=()=>page.evaluate(id=>window.DAYS[0].ground.findIndex(row=>row.src===id),id)
    assert(await groundIndex()>=0&&await loc('#sbBoard [data-ifld="'+id+'.str"]').count()>=1,'Accepted Ground and open Personal Input required')
    const before=await snapshot();await start.fill('10:15');await page.keyboard.press('Tab')
    assert((await read()).s===615&&(await snapshot()).seq===before.seq+1,'Input time save once')
    await loc('#sbUndo').click();assert((await read()).s===original.s,'Input time Undo')
    await loc('#sbRedo').click();assert((await read()).s===615,'Input time Redo')
    const timeSaved=await snapshot();await remarks.fill('TAB INPUT DURABLE');await page.keyboard.press('Tab')
    assert((await read()).remarks==='TAB INPUT DURABLE'&&(await snapshot()).seq===timeSaved.seq+1,'Input Remarks save once')
    await loc('#sbUndo').click();assert((await read()).remarks===original.remarks,'Input Remarks Undo')
    await loc('#sbRedo').click();assert((await read()).remarks==='TAB INPUT DURABLE','Input Remarks Redo')
    await page.waitForFunction(()=>Object.values(localStorage).some(raw=>raw.includes('TAB INPUT DURABLE')))
    await page.goto(base+'/');await login(page);await board()
    const toggle=loc('#sbBoard [data-pitog="0"]');if((await toggle.innerText()).includes('show'))await toggle.click()
    const persisted=await read();assert(persisted.s===615&&persisted.remarks==='TAB INPUT DURABLE','Input did not survive reload')
    for(const suffix of ['str','rmks']){
      const echoes=loc('#sbBoard [data-ifld="'+id+'.'+suffix+'"]');assert(await echoes.count()>=1,'Reloaded Personal Input echo missing')
      for(let i=0;i<await echoes.count();i++)await expect(echoes.nth(i)).toHaveValue(suffix==='str'?'10:15':'TAB INPUT DURABLE')
    }
    const gi=await groundIndex();assert(gi>=0,'Accepted Ground row missing after reload')
    await expect(loc('#sbBoard [data-bfld="gr:0.'+gi+'.str"]')).toHaveValue('10:15')
    await expect(loc('#sbBoard [data-bfld="gr:0.'+gi+'.rmks"]')).toHaveValue('TAB INPUT DURABLE')
    await loc('#sbBoard [data-bfld="gr:0.'+gi+'.rmks"]').scrollIntoViewIfNeeded();await shot('input-durable-ground-echo')
    return {id,original,persisted,ground:await page.evaluate(gi=>window.DAYS[0].ground[gi],gi),after:await snapshot()}
  })
  await step('input-times-refusal-and-accepted-ground-relink',async()=>{
    const rows=await page.evaluate(()=>window.INPUTS.filter(i=>i.acc&&i.acc!=='r'&&i.iid).map(i=>({iid:i.iid,s:i.s,e:i.e,person:i.person,acc:i.acc})))
    let timed=loc('#sbBoard [data-ifld$=".str"]').first()
    for(const row of rows)if(await loc('#sbBoard [data-ifld="'+row.iid+'.str"]').count()){timed=loc('#sbBoard [data-ifld="'+row.iid+'.str"]');break}
    const address=await timed.getAttribute('data-ifld'),id=address.split('.')[0]
    const read=()=>page.evaluate(id=>({input:window.INPUTS.find(i=>i.iid===id),day:window.DAYS[0],events:window.dayEvents(0,window.INPUTS.find(i=>i.iid===id).person),oil:window.dayOilSpans(window.DAYS[0])}),id)
    const before=await snapshot();await timed.fill('2570');await page.keyboard.press('Tab');assert((await snapshot()).i===before.i&&(await snapshot()).seq===before.seq,'Unreadable input time saved')
    await timed.fill('10:15');await page.keyboard.press('Tab');const accepted=await read();assert(accepted.input.s===615,'Input start did not save')
    const end=loc('#sbBoard [data-ifld="'+id+'.end"]');const valid=await snapshot();await end.fill('10:15');await page.keyboard.press('Tab');assert((await snapshot()).i===valid.i&&(await snapshot()).seq===valid.seq,'Equal endpoints saved')
    await end.fill('09:15');await page.keyboard.press('Tab');const overnight=await read();assert(overnight.input.e===555,'Existing overnight acceptance lost');await shot('input-refusal-and-save')
    return {rows,accepted,overnight}
  })
  await step('board-time-refusal-and-existing-enter-escape',async()=>{
    const key='ff:0.0.0.to',old=await page.evaluate(k=>window.txtGet(k),key),before=await snapshot()
    await text('board',key,'2570');assert(await page.evaluate(k=>window.txtGet(k),key)===old,'Invalid schedule time saved');assert((await snapshot()).seq===before.seq,'Refused schedule write logged')
    const cs=loc('#sbBoard [data-bfld="ff:0.0.0.cs"]').first();await cs.fill('ENTER BOARD');await page.keyboard.press('Enter');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs)==='ENTER BOARD','Enter changed')
    await cs.fill('ESCAPE UNSAVED');await page.keyboard.press('Escape');assert(await page.evaluate(()=>window.DAYS[0].waves[0].formations[0].cs)==='ENTER BOARD','Escape changed');return {old,after:await snapshot()}
  })
  await step('board-first-and-last-in-time-delete-and-reverse',async()=>{
    const lines=loc('#sbBoard [data-itline^="0|0|"]');assert(await lines.count()===2,'Two seeded lines required')
    await lines.first().fill('');await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement?.getAttribute('data-itline'))==='0|0|0','Surviving line focus/address')
    await loc('#sbBoard [data-itline="0|0|0"]').fill('11:00 TAB RALLY');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.activeElement?.getAttribute('data-itline'))==='0|0|0','Reverse after deletion')
    await loc('#sbBoard [data-itline="0|0|0"]').fill('');await page.keyboard.press('Tab');assert(await page.evaluate(()=>window.DAYS[0].waves[0].intimes.length)===0,'Last line not cleared')
    await loc('#sbUndo').click();await loc('#sbUndo').click();await loc('#sbUndo').click();assert(await page.evaluate(()=>window.DAYS[0].waves[0].intimes.length)===2,'Delete/edit Undo order');return {after:await snapshot()}
  })
  await step('reorder-section-through-real-grip',async()=>{
    const order=()=>loc('#sbBoard [data-secmove]').evaluateAll(es=>es.map(e=>e.getAttribute('data-secmove'))),before=await order()
    await loc('#sbBoard [data-secmove="0.prog"] .secgrip').scrollIntoViewIfNeeded()
    const a=await loc('#sbBoard [data-secmove="0.prog"] .secgrip').boundingBox(),b=await loc('#sbBoard [data-secmove="0.notes"]').boundingBox();assert(a&&b,'Visible grip/target')
    await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+6,{steps:10});await page.mouse.up();await sleep()
    const after=await order();assert(JSON.stringify(after)!==JSON.stringify(before),'Reorder did not move section');const route=await tour('board',0,false);await shot('board-reordered');return {before,after,route}
  })
  await step('desktop-700-height-visible-focus',async()=>{
    await page.setViewportSize({width:1440,height:700});const route=await tour('board',0,false);await shot('short-desktop');await page.setViewportSize({width:1440,height:1000});return route
  })
  await step('reordered-last-section-exits-to-real-control',async()=>{
    // Finish the unchanged typing tour through the existing Escape gesture.
    // Grips intentionally prevent focus change; model reorder can otherwise
    // stay unpainted while that native text box still owns the caret.
    await page.keyboard.press('Escape');await sleep()
    const readOrder=()=>loc('#sbBoard [data-secmove]').evaluateAll(es=>es.map(e=>e.getAttribute('data-secmove')))
    let order=await readOrder()
    // Adjacent real carries keep the grip and destination heading on screen;
    // never change the scroller underneath a held drag through a test API.
    for(let moves=0;order.at(-1)!=='0.notes'&&moves<10;moves++){
      const index=order.indexOf('0.notes'),next=order[index+1],grip=loc('#sbBoard [data-secmove="0.notes"] .secgrip'),target=loc('#sbBoard [data-secmove="'+next+'"] .sb-ph,#sbBoard [data-secmove="'+next+'"] .ap-h').first()
      await grip.evaluate(e=>e.scrollIntoView({block:'center'}));const a=await grip.boundingBox(),b=await target.boundingBox();assert(a&&b,'Adjacent grip/heading absent')
      await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+80,b.y+b.height/2,{steps:10});await page.mouse.up();await sleep()
      const after=await readOrder();assert(after.indexOf('0.notes')>index,'Adjacent section carry did not land');order=after
    }
    assert(order.at(-1)==='0.notes','Notes did not move last')
    const last=loc('#sbBoard [data-secmove="0.notes"] [data-bfld]').last(),before=await snapshot();await last.focus();await page.keyboard.press('Tab')
    const active=await page.evaluate(()=>({section:document.activeElement?.closest('[data-secmove]')?.getAttribute('data-secmove'),tag:document.activeElement?.tagName,title:document.activeElement?.getAttribute('title')}));assert(active.section==='0.notes'&&active.tag==='BUTTON','Final box missed its following ordinary note control');assert((await snapshot()).seq===before.seq,'Boundary activated a control');return {order,active}
  })
  await step('mission-offer-after-own-edit-keeps-next-caret',async()=>{
    await nav('logic');await loc('#lgEdit').click();await loc('#lgMissionMix').check();await board()
    await text('board','ff:0.0.0.msn','ACM');if(await loc('[data-role-side="later"]').count())await loc('[data-role-side="later"]').click()
    await text('board','fr:0.0.0.0','DS FOR TAB BOARD');await expect(loc('.mission-role-question')).toBeVisible()
    assert(await page.evaluate(()=>document.activeElement?.matches('[data-bombs="0.0.0.0"]')),'Offer stole next caret');await shot('role-offer-caret')
    await loc('[data-role-side="later"]').click();await loc('#sbDone').click();return {after:await snapshot()}
  })
  await end()

  await start('phone',390,844);await nav('editsched')
  await step('phone-week-and-board-wrap',async()=>{const week=await tour('week');await board();const boardRoute=await tour('board');await shot('board-wrap');return {week,board:boardRoute}})
  await step('phone-boundary-stays-day',async()=>{
    await loc('#sbBoard [data-ifld$=".rmks"]').last().focus();await page.keyboard.press('Tab')
    const active=await page.evaluate(()=>({day:window.SBDAY,tag:document.activeElement?.tagName,x:document.activeElement?.getBoundingClientRect().x,roster:!!document.activeElement?.closest('#sbRoster')}));assert(active.day===0&&!active.roster,'Boundary entered closed drawer');await shot('last-box-exit');return active
  })
  await step('accepted-phone-desktop-mode-and-short-reach',async()=>{
    await loc('#sbMore').click();await loc('#sbMoreWide').click();await expect(loc('#schedBoard')).toHaveClass(/sb-wide/)
    const route=await tour('board',0,false);await shot('wide-typing')
    await page.setViewportSize({width:390,height:568});await loc('#sbBoard [data-bfld="ff:0.0.0.cs"]').first().focus();await page.keyboard.press('Tab');const m=await usable(await loc('#sbBoard [data-bfld="ff:0.0.0.msn"]').first().elementHandle());assert(m.active&&m.hit,'Short phone focus unreachable');await shot('short-phone')
    await page.setViewportSize({width:844,height:390});await loc('#sbBoard [data-bfld="ff:0.0.0.msn"]').first().focus();await page.keyboard.press('Tab');const landscape=await usable(await loc('#sbBoard [data-bfld="ff:0.0.0.br"]').first().elementHandle());assert(landscape.active&&landscape.hit,'Landscape focus unreachable');await shot('landscape')
    return {route,short:m,landscape}
  })
  await end()

  await start('published')
  await board(5);await step('build-everything-Saturday',async()=>{const fixture=await buildSaturday(page);assert(fixture.every(row=>!row.includes('FAILED')),'Incomplete everything fixture');await shot('everything-day');return {fixture,day:await readDay(page,5)}})
  await step('everything-shapes-board-and-week',async()=>{const boardRoute=await tour('board',5,false);await loc('#sbDone').click();const week=await tour('week',5,false);await board(5);return {board:boardRoute,week}})
  let publishedInput
  await step('input-edit-tab-before-publish',async()=>{
    const fixture=await fileInputFromBoard(page,5,{person:'ignite',type:'Training',st:'11:00',en:'12:00',oil:'yes'});assert(fixture.added===1,'Input fixture not saved')
    publishedInput=await page.evaluate(()=>window.INPUTS[0].iid)
    const input=loc('#sbBoard [data-ifld="'+publishedInput+'.rmks"]');if(!await input.count())await loc('#sbBoard [data-pitog="5"]').click();await input.fill('BEFORE ISSUE');await page.keyboard.press('Tab');assert(await page.evaluate(id=>window.INPUTS.find(i=>i.iid===id).remarks==='BEFORE ISSUE',publishedInput),'Before-issue input save');return {fixture,id:publishedInput}
  })
  await step('publish-before-edit-and-issued-freeze',async()=>{
    const ver=await publish(5),issued=await page.evaluate(([di,v])=>JSON.stringify(window.daySnapOf(di,v)),[5,ver])
    await text('board','ff:5.0.0.cs','TAB ISSUED');assert(await page.evaluate(([di,v])=>JSON.stringify(window.daySnapOf(di,v)),[5,ver])===issued,'Working edit changed issued snapshot')
    const input=loc('#sbBoard [data-ifld="'+publishedInput+'.rmks"]');if(!await input.count())await loc('#sbBoard [data-pitog="5"]').click();await input.fill('AFTER ISSUE');await page.keyboard.press('Tab');assert(await page.evaluate(id=>window.INPUTS.find(i=>i.iid===id).remarks==='AFTER ISSUE',publishedInput),'After-issue input save');assert(await page.evaluate(([di,v])=>JSON.stringify(window.daySnapOf(di,v)),[5,ver])===issued,'Input edit changed issued snapshot')
    const working=await snapshot();await preview(ver);assert(await loc('#sbBoard [contenteditable="true"],#sbBoard input:not([disabled]):not([readonly]),#sbBoard textarea:not([disabled]):not([readonly])').count()===0,'Issued preview editable');await shot('issued-readonly')
    await live(5);await loc('#sbUndo').click();await loc('#sbRedo').click();await expect(loc('#sbBoard [data-bfld="ff:5.0.0.cs"]').first()).toHaveValue('TAB ISSUED')
    const next=await publish(5);assert(next!==ver,'No amendment issued');await shot('amendment');await loc('#sbOil').click();assert(await loc('#sbBoard [contenteditable="true"],#sbBoard input:not([disabled]):not([readonly]),#sbBoard textarea:not([disabled]):not([readonly])').count()===0,'OIL mode editable');await shot('oil-readonly');await loc('#sbOil').click();return {ver,next,working,day:await readDay(page,5)}
  })
  await end()

  await start('member',390,844,'user')
  await step('actual-member-readonly',async()=>{await loc('#burger').click();assert(await loc('#drawerNav [data-page="editsched"]:visible,.nav [data-page="editsched"]:visible').count()===0,'Member editing door');await loc('#drawerNav [data-page="viewsched"]').click();assert(await loc('#vWeek [contenteditable="true"]').count()===0,'Member typing field');await shot('readonly');return {editorDoors:0}})
  await end()
  assert(R.errors.length===0,'Browser errors: '+JSON.stringify(R.errors));R.pass=true
}catch(e){R.pass=false;R.failure=String(e);if(browser)await browser.close();throw e}finally{R.finished=new Date().toISOString();save()}
