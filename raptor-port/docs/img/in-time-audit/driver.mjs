import {writeFileSync,mkdirSync} from 'node:fs'
import assert from 'node:assert/strict'
const out='C:/Users/User/.codex/visualizations/2026/10/02/01a0fab0-9850-7130-8da0-de797da4a3ba/in-time-audit'
mkdirSync(out,{recursive:true})
process.env.HP_URL='http://127.0.0.1:4234';process.env.HP_SHOTS=out
const {open,go,board,publish}=await import('file:///C:/Users/User/.codex/worktrees/8c06/Raptor/raptor-port/scripts/handpass/lib.mjs')
const results=[]; const observations=[];let failure=null
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]) {
 // A new context is isolated already. ?fresh=1 chooses memory-only storage and cannot prove reload persistence.
 const {browser,page,errors}=await open({width,height})
 const di=1,gi=0
 const edit=async(ix,value,key='itline')=>{
  const sel=key==='itline'?`#schedBoard [data-itline="${di}|${gi}|${ix}"]:visible`:`#schedBoard [data-bfld="${ix}"]:visible`
  const el=page.locator(sel).first();await el.evaluate(e=>e.scrollIntoView({block:'center'}));await el.fill(value);await el.press('Enter');await page.waitForTimeout(120)
 }
 const read=async()=>page.evaluate(([d,g])=>{
  const day=window.collectEvents()[d]; const f=day.fly.filter(x=>x.key.startsWith(`${d}.${g}.`));
  const byCS={};for(const x of f){const cs=x.label.split(' ')[0];byCS[cs]={intime:x.intime,report:x.report,brief:x.brief,to:x.to,ld:x.ld,step:x.step}}
  return {byCS,lines:window.DAYS[d].waves[g].intimes,header:document.querySelector('#schedBoard .sb-go .asd')?.textContent,signs:[...document.querySelectorAll('#schedBoard .sb-sign select')].map(e=>e.value),pending:Object.keys(window.SCHED.pending)}
 },[di,gi])
 const check=async(label,fn)=>{await fn();results.push({width:name,label,status:'PASS'})}
 const pair=async(a,b)=>{await edit(0,a);await edit(1,b);return await read()}
 const close=async()=>{await page.locator('#sbDone').click();await page.locator('#schedBoard').waitFor({state:'hidden'})}
 const insight=async()=>{await page.locator('#insightBtn:visible').click();const text=await page.locator('#insightBody').innerText();await page.locator('#insightClose').click();return text}
 try {
  await go(page,'editsched');await board(page,di)
  if(name==='desktop') {
   await check('specific instruction overrides earlier wave-wide instruction',async()=>{
    const r=await pair('07:00 IN TIME + WX/NOTAMS','08:00H: FIRST WAVE VL IN TIME + WX/NOTAMS');
    assert.equal(r.byCS.VL.report,480);assert.equal(r.byCS.RU.report,420);assert.match(r.header,/07:00/);observations.push({case:'specific-wide',...r})
   })
   await page.screenshot({path:out+'/desktop-specific-wide.png'})
   await check('last named instruction wins even when labelled Rally; reversing lines changes it',async()=>{
    let r=await pair('07:00 VL IN TIME','08:00 VL RALLY');assert.equal(r.byCS.VL.report,480);observations.push({case:'named-stages-last-line',...r});
    r=await pair('08:00 VL RALLY','07:00 VL IN TIME');assert.equal(r.byCS.VL.report,420)
   })
   await check('callsign in a remark scopes the line; unknown name falls back wave-wide',async()=>{
    let r=await pair('07:00 IN TIME — coordinate with VL','25:90 TIME TBD');assert.equal(r.byCS.VL.report,420);assert.equal(r.byCS.RU.intime,null);observations.push({case:'incidental-name',...r});
    r=await pair('07:00 UNKNOWN IN TIME','25:90 TIME TBD');assert.equal(r.byCS.VL.report,420);assert.equal(r.byCS.RU.report,420)
   })
   await check('first clock supplies both named formations; prose does not pair clocks and names',async()=>{
    const r=await pair('RU 07:00, VL 08:00','25:90 TIME TBD');assert.equal(r.byCS.VL.report,420);assert.equal(r.byCS.RU.report,420);observations.push({case:'two-names-two-clocks',...r})
   })
   await check('first note clock is used; invalid instructions use step fallback',async()=>{
    let r=await pair('07:00 reference note; report 08:00','25:90 TIME TBD');assert.equal(r.byCS.VL.report,420);observations.push({case:'note-clock',...r});
    r=await pair('25:90 VL IN TIME','IN TIME TBD');assert.equal(r.byCS.VL.intime,null);assert.equal(r.byCS.VL.report,r.byCS.VL.step);assert.equal(r.byCS.RU.report,r.byCS.RU.step);observations.push({case:'invalid-fallback',...r})
   })
   await check('previous-evening interpretation exists, but multiple wide lines choose raw clock minimum',async()=>{
    await edit('ff:1.0.0.to','01:30','bfld');await edit('ff:1.0.0.ld','03:00','bfld');
    let r=await pair('23:00 IN TIME','25:90 TIME TBD');assert.equal(r.byCS.VL.report,-60);observations.push({case:'previous-evening',...r});
    r=await pair('23:00 IN TIME','01:00 RALLY');assert.equal(r.byCS.VL.report,60);assert.match(r.header,/01:00/);observations.push({case:'raw-clock-minimum',...r});
    await edit('ff:1.0.0.to','08:40','bfld');await edit('ff:1.0.0.ld','10:05','bfld')
   })
   await pair('07:00 VL IN TIME + WX/NOTAMS','08:00 RU IN TIME')
   await close();const draftBefore=await insight();await board(page,di);await edit(0,'07:30 VL IN TIME + WX/NOTAMS');await close();const draftAfter=await insight();
   await check('editing an unpublished in-time updates visible Insights',async()=>assert.notEqual(draftAfter,draftBefore))
   await board(page,di);const p=await publish(page,di);assert.equal(p.published,true);await close();const issued=await insight();await board(page,di);await edit(0,'07:45 VL IN TIME + WX/NOTAMS');
   await check('pending in-time amendment clears signatures and updates working report',async()=>{const r=await read();assert.equal(r.byCS.VL.report,465);assert.deepEqual(r.signs,['','','','']);observations.push({case:'pending-amendment',...r})})
   await close();const pending=await insight();await check('pending in-time amendment leaves visible Insights on issued copy',async()=>assert.equal(pending,issued))
   await go(page,'viewsched');const issuedLine=page.locator('#vWeek .itline, #vWeek .intimes span').filter({hasText:'07:30H'});
   await check('view schedule keeps issued in-time while working copy differs',async()=>{const text=await page.locator('#vWeek').innerText();assert.match(text,/07:30(?:H)?:? VL IN TIME/);assert.ok(!text.includes('07:45 VL IN TIME'))})
   await page.screenshot({path:out+'/desktop-issued-pending.png'})
   await go(page,'editsched');await board(page,di);assert.equal((await publish(page,di)).published,true);await close();const amended=await insight();await check('publishing amendment updates visible Insights',async()=>assert.notEqual(amended,issued))
   await page.reload();await page.waitForSelector('#luser');await page.fill('#luser','ad');await page.fill('#lpass','a');await page.click('#loginForm button[type=submit]');await page.waitForSelector('#vWeek .day');await go(page,'editsched');await board(page,di)
   await check('reload preserves amended in-time and issued content',async()=>{const r=await read();assert.equal(r.byCS.VL.report,465);const s=await page.evaluate(i=>window.daySnapOf(i,window.dayCurVer(i)).d.waves[0].intimes[0],di);assert.match(s,/07:45/)})
  } else {
   await edit(0,'07:30H: FIRST WAVE VL IN TIME + WX/NOTAMS');
   await check('phone line editing uses existing free text and reaches VL only',async()=>{const r=await read();assert.equal(r.byCS.VL.report,450);assert.equal(r.byCS.RU.report,420)})
   await page.locator('#schedBoard [data-itadd="1|0"]:visible').click();await edit(2,'07:15 RU RALLY');
   await check('phone add line is editable and updates named report',async()=>assert.equal((await read()).byCS.RU.report,435))
   await page.locator('#schedBoard [data-itdel="1|0|2"]:visible').click();await check('phone remove line keeps remaining lines',async()=>assert.equal((await read()).lines.length,2))
   await page.screenshot({path:out+'/phone-edited.png'});await close();await page.reload();await page.waitForSelector('#luser');await page.fill('#luser','ad');await page.fill('#lpass','a');await page.click('#loginForm button[type=submit]');await page.waitForSelector('#vWeek .day');await go(page,'editsched');await board(page,di)
   await check('phone draft reload retains reporting line',async()=>assert.equal((await read()).byCS.VL.report,450))
  }
  assert.deepEqual(errors,[]);results.push({width:name,label:'browser errors',status:'PASS'})
 } catch(e) {failure={width:name,message:e.message,stack:e.stack};console.error(e);break}
 finally {await browser.close();writeFileSync(out+'/walk-results.json',JSON.stringify({results,observations,failure},null,2))}
}
console.log(JSON.stringify({checks:results.length,results,failure},null,2));if(failure)process.exitCode=1
