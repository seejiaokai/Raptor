/* B52 — editable thresholds on the Logic tab: live, bounded, persisted, admin-only. */
const {chromium}=require('playwright');
const boot=async(ctx,who)=>{const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('  PAGEERR',e.message));
  await p.goto('file:///home/claude/scheduler.html');
  await p.fill('#luser',who);await p.fill('#lpass',who);
  await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
  await p.evaluate(()=>go('logic'));await p.waitForTimeout(600);
  return p;};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0;
const T=(n,got,want)=>{const ok=String(got)===String(want);ok?pass++:fail++;
  console.log(`${ok?' ok  ':'FAIL '} ${n.padEnd(56)} want ${want} · got ${got}`);};
const ctx=await b.newContext({viewport:{width:1500,height:950}});
const p=await boot(ctx,'a');

T('admin sees the edit button',await p.evaluate(()=>!document.getElementById('lgEdit').hidden),true);
await p.click('#lgEdit');await p.waitForTimeout(300);
T('editing shows input fields',await p.evaluate(()=>document.querySelectorAll('#lgBody [data-lgset]').length>10),true);
T('and toggles for the clash grading',await p.evaluate(()=>document.querySelectorAll('#lgBody [data-lgkind]').length),6);

/* a threshold change must reach the ENGINE, not just the page */
console.log('\n crew rest 12h → 14h');
console.log(await p.evaluate(async()=>{
  const set=(k,v)=>{const i=document.querySelector(`[data-lgset="${k}"]`);
    i.value=v; i.dispatchEvent(new Event('change',{bubbles:true}));};
  const n=()=>validate().all.filter(x=>x.code==='CREW_REST').length;
  const a=n(); set('crewRest','14h'); const c=n();
  return `   CREW_REST flags ${a} → ${c} · VCONF.crewRest=${VCONF.crewRest} · off standard=${rulesOffCount()}`;}));
T('the engine re-runs on the new value',await p.evaluate(()=>VCONF.crewRest),840);
T('the page marks it as changed',await p.evaluate(()=>document.querySelectorAll('#lgBody .lgmod').length>0),true);
T('and says so above the list',await p.evaluate(()=>!document.getElementById('lgOff').hidden),true);
T('the banner is stamped too',await p.evaluate(()=>document.body.classList.contains('page-rules-off')),true);

/* bounds */
console.log(await p.evaluate(()=>{
  const i=document.querySelector('[data-lgset="crewRest"]');
  i.value='3h'; i.dispatchEvent(new Event('change',{bubbles:true}));    // below the floor
  const held=VCONF.crewRest, bad=i.classList.contains('bad');
  i.value='banana'; i.dispatchEvent(new Event('change',{bubbles:true}));
  return `\n bounds: "3h" rejected=${held===840} field flagged=${bad} · "banana" → VCONF.crewRest still ${VCONF.crewRest}`;}));
T('a value outside its bounds is not written',await p.evaluate(()=>VCONF.crewRest),840);

/* the formats a scheduler would actually type */
T('accepts 90',await p.evaluate(()=>{const i=document.querySelector('[data-lgset="tightTurn"]');
  i.value='90'; i.dispatchEvent(new Event('change',{bubbles:true})); return VCONF.tightTurn;}),90);
T('accepts 2h20',await p.evaluate(()=>{const i=document.querySelector('[data-lgset="briefLead"]');
  i.value='2h20'; i.dispatchEvent(new Event('change',{bubbles:true})); return VCONF.briefLead;}),140);
T('a time field takes a clock time',await p.evaluate(()=>{const i=document.querySelector('[data-lgset="scDayFrom"]');
  i.value='0600'; i.dispatchEvent(new Event('change',{bubbles:true})); return VCONF.scDayFrom;}),360);

/* the clash grading toggle changes the tier the engine raises */
console.log(await p.evaluate(()=>{
  const c=document.querySelector('[data-lgkind="ground"]');
  c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true}));
  return `\n ground graded hard: SHIFT_HARD.ground=${SHIFT_HARD.ground}`;}));
T('a graded kind can be promoted to a Warning',await p.evaluate(()=>SHIFT_HARD.ground),true);

/* persistence across a reload, and reset */
const off=await p.evaluate(()=>rulesOffCount());
await p.reload();await p.waitForTimeout(400);
await p.fill('#luser','a');await p.fill('#lpass','a');
await p.click('#loginForm button[type=submit]');await p.waitForTimeout(900);
await p.evaluate(()=>go('logic'));await p.waitForTimeout(500);
T('the overrides survive a reload',await p.evaluate(()=>`${VCONF.crewRest}/${SHIFT_HARD.ground}`),'840/true');
T('and the count is the same',await p.evaluate(()=>rulesOffCount()),off);
await p.click('#lgReset');await p.waitForTimeout(400);
T('reset puts everything back to standard',await p.evaluate(()=>
  `${VCONF.crewRest}/${VCONF.tightTurn}/${VCONF.briefLead}/${VCONF.scDayFrom}/${SHIFT_HARD.ground}/${rulesOffCount()}`),
  '720/120/140/420/false/0');
T('and the warning strip goes away',await p.evaluate(()=>document.getElementById('lgOff').hidden),true);
await p.close();

/* a squadron member may look but not touch */
const p2=await boot(await b.newContext({viewport:{width:1500,height:950}}),'user');
T('a member sees no edit button',await p2.evaluate(()=>document.getElementById('lgEdit').hidden),true);
T('and no input fields',await p2.evaluate(()=>document.querySelectorAll('#lgBody [data-lgset]').length),0);
T('and cannot force edit mode',await p2.evaluate(()=>{lgSetEdit(true);
  return document.querySelectorAll('#lgBody [data-lgset]').length;}),0);
await p2.close();

console.log(`\n${pass} passed · ${fail} failed`);
await b.close();console.log('rules done');})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
