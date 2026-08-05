import { VCONF } from './rules'
/* =====================================================================
   142 SQN Flying Programme — prototype (single file, vanilla JS)
   Qual ladder: OCU → D → C → B → A → IW → IP → IR → FI
   CI ("C-cat instructor") was removed from the ladder (owner, Aug 5): every
   pilot who held it also carried the IP flag, so the instructor half was
   already recorded, and the six who held it became I.
   The generic I tier and the standalone `ip` flag are gone too (owner,
   Aug 5 '26): instructor-ness now lives solely in CAT, as four categories —
     IW  instructor WSO (IWSO) — WSO-only, sits RCP only
     IP  instructor pilot      — may fly FCP or RCP
     IR  instrument rating examiner — pilot only, seats like an IP; the old
         IR ("instr rating exmr") holders keep the letters, new meaning
     FI  fighter wing instructor — pilot or WSO; a pilot FI seats like an IP,
         a WSO FI like an IW
   Every I-or-ip holder was migrated: FCP → IP, RCP → IW (Bane dropped his A
   for IP — a CAT can only be one value). That also retired a latent bug: the
   quals-grid IP tick wrote p.quals.instr while every rule read p.ip.
   ===================================================================== */

/* ---- qual system ---- */
export const QCHIP:any={OCU:'O',D:'D',C:'C',B:'B',A:'A',IW:'IW',IP:'IP',IR:'IR',FI:'FI'};        // chip text — letters, not ship numbers
export const QCLASS:any={OCU:'q-ocu',D:'q-d',C:'q-c',B:'q-b',A:'q-a',IW:'q-ins',IP:'q-ins',IR:'q-ins',FI:'q-ins'};
export const QCOLOR:any={OCU:'#8A6ED0',D:'#3B7DF0',C:'#3BC6E8',B:'#E5A83B',A:'#F0555F',IW:'#A64DE8',IP:'#A64DE8',IR:'#A64DE8',FI:'#A64DE8'};
export const LEVELNAME:any={OCU:'OCU (ab-initio)',D:'D · wingman',C:'C · ops wingman',B:'B · 2-ship FL',A:'A · 4-ship FL',IW:'IW · instructor WSO',IP:'IP · instructor pilot',IR:'IR · instrument rating exmr',FI:'FI · fighter wing instructor'};
export const isLead=(q:any)=>q==='A'||q==='B';
export const isInstr=(q:any)=>q==='IW'||q==='IP'||q==='IR'||q==='FI';
/* rear-seat privilege for an FCP person: only these instructor CATs may fly
   RCP. IW is deliberately absent (WSO-only category) and a WSO FI never
   reaches this test — seat rules ask it about pilots alone. */
export const isInstrPilot=(q:any)=>q==='IP'||q==='IR'||q==='FI';
export const isOcu=(q:any)=>q==='OCU';
export const QORDER:any={OCU:0,D:1,C:2,B:3,A:4,IW:5,IP:6,IR:7,FI:8};

/* ---- people (real callsigns / quals from the LoX screenshots) ---- */
/* seat: FCP=pilot RCP=wso · q=level · flight · sxo/opsSup extra quals · dt=downchit chip */
export const PEOPLE:any={
  // ---- pilots (FCP) ----
  bane:{cs:'Bane',seat:'FCP',q:'IP',sxo:true},
  stiff:{cs:'Stiff',seat:'FCP',q:'IP',sxo:true},
  slipway:{cs:'Slipway',seat:'FCP',q:'A',sxo:true},
  dj:{cs:'DJ',seat:'FCP',q:'A'},
  nact:{cs:'Nact',seat:'FCP',q:'IP',sxo:true},
  prowler:{cs:'Prowler',seat:'FCP',q:'IP'},
  pump:{cs:'Pump',seat:'FCP',q:'IP',sxo:true},
  slash:{cs:'Slash',seat:'FCP',q:'IP'},
  harpoon:{cs:'Harpoon',seat:'FCP',q:'IP'},
  snap:{cs:'Snap',seat:'FCP',q:'IP',sxo:true},
  taipan:{cs:'Taipan',seat:'FCP',q:'IP'},
  mamba:{cs:'Mamba',seat:'FCP',q:'IP',sxo:true},
  shaft:{cs:'Shaft',seat:'FCP',q:'IP',sxo:true},
  chaps:{cs:'Chaps',seat:'FCP',q:'IP'},
  boosh:{cs:'Boosh',seat:'FCP',q:'IP'},
  beams:{cs:'Beams',seat:'FCP',q:'IP'},
  dice:{cs:'Dice',seat:'FCP',q:'IR',sxo:true},
  split:{cs:'Split',seat:'FCP',q:'IP'},
  ignite:{cs:'Ignite',seat:'FCP',q:'C'},
  bruise:{cs:'Bruise',seat:'FCP',q:'C'},
  casper:{cs:'Casper',seat:'FCP',q:'C'},
  razer:{cs:'Razer',seat:'FCP',q:'C',sxo:true},
  vinci:{cs:'Vinci',seat:'FCP',q:'C'},
  yeti:{cs:'Yeti',seat:'FCP',q:'C'},
  pike:{cs:'Pike',seat:'FCP',q:'C'},
  romeo:{cs:'Romeo',seat:'FCP',q:'B'},
  salsa:{cs:'Salsa',seat:'FCP',q:'B'},
  ipman:{cs:'Ipman',seat:'FCP',q:'B'},
  fantom:{cs:'Fantom',seat:'FCP',q:'D'},
  vegas:{cs:'Vegas',seat:'FCP',q:'D'},
  krait:{cs:'Krait',seat:'FCP',q:'D'},
  bapster:{cs:'Bapster',seat:'FCP',q:'OCU'},
  haowen:{cs:'Hao Wen',seat:'FCP',q:'OCU'},
  prism:{cs:'Prism',seat:'FCP',q:'OCU'},
  // ---- WSOs (RCP) ----
  freak:{cs:'Freak',seat:'RCP',q:'IW',sxo:true},
  wolf:{cs:'Wolf',seat:'RCP',q:'IW'},
  dirty:{cs:'Dirty',seat:'RCP',q:'IW'},
  stuff:{cs:'Stuff',seat:'RCP',q:'IW'},
  glass:{cs:'Glass',seat:'RCP',q:'IW',sxo:true},
  drill:{cs:'Drill',seat:'RCP',q:'IW'},
  nasty:{cs:'Nasty',seat:'RCP',q:'IW'},
  pain:{cs:'Pain',seat:'RCP',q:'B'},
  ammo:{cs:'Ammo',seat:'RCP',q:'B'},
  rocky:{cs:'Rocky',seat:'RCP',q:'C'},
  divot:{cs:'Divot',seat:'RCP',q:'C'},
  spaceman:{cs:'Spaceman',seat:'RCP',q:'C'},
  riddler:{cs:'Riddler',seat:'RCP',q:'C'},
  shrek:{cs:'Shrek',seat:'RCP',q:'C'},
  xray:{cs:'X-Ray',seat:'RCP',q:'C'},
  psy:{cs:'Psy',seat:'RCP',q:'C'},
  plasma:{cs:'Plasma',seat:'RCP',q:'C'},
  sufa:{cs:'Sufa',seat:'RCP',q:'C'},
  cards:{cs:'Cards',seat:'RCP',q:'A'},
  wrangler:{cs:'Wrangler',seat:'RCP',q:'D'},
  badger:{cs:'Badger',seat:'RCP',q:'D'},
  waldo:{cs:'Waldo',seat:'RCP',q:'D'},
  nick:{cs:'Nick',seat:'RCP',q:'OCU'},
  bullet:{cs:'Bullet',seat:'RCP',q:'OCU'},
  /* ---- sentinel bodies: not real aircrew. `special` keeps them out of every
     validation / availability path; `archived` keeps them out of every roster
     column, quals table and view-as list. They still resolve through PEOPLE[id]
     so puck(), lSeat(), slotVal() and setSlotVal() work unchanged. ---- */
  allavail:{cs:'ALL AVAIL',seat:'FCP',q:'A',special:true,archived:true},
};

/* derive LoX qualification flags from level (editable later) */
export function deriveQuals(p:any){
  const q=p.q, o=QORDER[q];
  p.quals=Object.assign({
    sxo:!!p.sxo,
    imc:o>=1, nvg:o>=1,
    /* TF (terrain following) is granted, never derived — it arrived as a new
       qualification with nobody signed off for it (owner, 5 Aug 26), so it
       starts false for everyone and is ticked by hand on the Quals page.
       `dnif` was here; it went with its column — a downchit is an INPUT with
       dates (isDownchit), which is what every rule actually reads. */
    tf:!!p.tf, san:!!p.san,
    /* Scheduler is an APPOINTMENT, not a flying qualification — it is ticked on
       the Quals page and it is what puts someone in the SKED CK, PLANNED BY and
       APPROVED BY drop-downs. Nothing derives it; it is granted. */
    sched:!!p.sched,
    /* SC currency, granted not derived. SC DAY may be planned on an SC shift
       that sits wholly inside 07:00–19:00; SC NIGHT covers any SC shift that
       reaches outside it. Someone can hold both. */
    scDay:!!p.scDay, scNight:!!p.scNight,
    /* Air-to-air refuelling, front seat only — a WSO holds no AAR currency at
       all. NAAR cannot be held without DAAR: night is signed off after day. */
    daar:!!p.daar, naar:!!p.naar
  }, p.quals||{});
}
/* ---- SANS (Staff-Assigned & NS aircrew) ----
   SANS fly to a different requirement from active aircrew (everyone else):
     • 3 sorties / quarter  → earn Flying Allowance
     • 6 sorties / quarter  → maintain Proficiency
   Carry-over rules:
     • a SHORTFALL rolls forward: fly 3 this qtr (3 short of 6) → need 6+3 = 9 next qtr
     • EXCESS does NOT roll: fly 7 this qtr → still need 6 next qtr (extra is lost)
     • miss proficiency for MORE THAN 2 quarters → taken OFF flying  (MOST SEVERE)
   Demo per-person quarter data lives in p.sanQ = {flown, carry} (carry = shortfall
   brought in from last qtr, missedQtrs = consecutive quarters proficiency missed). */
export const SANS_IDS=['vinci','yeti','ipman','romeo','nick','waldo','bullet','cards','badger','wrangler','krait'];
SANS_IDS.forEach((id:any)=>{ if(PEOPLE[id]){PEOPLE[id].san=true; PEOPLE[id].sanQ=PEOPLE[id].sanQ||{flown:0,carry:0,missedQtrs:0}; } });
/* demo quarter progress (flown this qtr, shortfall carried in, consecutive missed qtrs) */
Object.assign((PEOPLE.nick.sanQ),   {flown:5,carry:0,missedQtrs:0});
Object.assign((PEOPLE.waldo.sanQ),  {flown:2,carry:3,missedQtrs:1});   // needs 6+3=9, at 2 → short
Object.assign((PEOPLE.bullet.sanQ), {flown:7,carry:0,missedQtrs:0});   // excess doesn't roll
Object.assign((PEOPLE.cards.sanQ),  {flown:1,carry:6,missedQtrs:2});   // >2 qtrs short if misses again → OUT
Object.assign((PEOPLE.badger.sanQ), {flown:3,carry:0,missedQtrs:0});   // allowance met, proficiency not
Object.assign((PEOPLE.vinci.sanQ),  {flown:6,carry:0,missedQtrs:0});
Object.assign((PEOPLE.yeti.sanQ),   {flown:0,carry:0,missedQtrs:1});
/* Proficiency status for a SANS member. Deliberately unwired: the rule is
   recorded and regression-tested so the highlighting can be switched on when
   the squadron asks for it, but nothing calls it yet. Not dead code — parked. */
export function sanStatus(id:any){
  const p=PEOPLE[id]; if(!p||!p.san)return null;
  const q=p.sanQ||{flown:0,carry:0,missedQtrs:0};
  const needProf=6+(q.carry||0), needAllow=3+(q.carry||0), flown=q.flown||0;
  const allowanceMet=flown>=needAllow, proficiencyMet=flown>=needProf;
  const missed=(q.missedQtrs||0)+(proficiencyMet?0:1);      // this qtr counts if not yet met
  const outOfFlying=missed>2;                                // >2 consecutive missed → off flying
  const sev = outOfFlying?'out' : (!proficiencyMet?(!allowanceMet?'hard':'warn'):'ok');
  return {flown,needProf,needAllow,allowanceMet,proficiencyMet,missedQtrs:missed,outOfFlying,sev};
}
Object.values(PEOPLE).forEach(deriveQuals);
/* Who is currently appointed to the scheduling cell. Everyone SXO-qualified,
   plus the flight leads who run the board. Tick or untick anyone on the Quals
   page — the Scheduler column — and the sign-off drop-downs follow. */
['bane','stiff','harpoon','razer','yeti','pump','wolf','glass','snap','chaps']
  .forEach((id:any)=>{if(PEOPLE[id])PEOPLE[id].quals.sched=true;});
Object.keys(PEOPLE).forEach((id:any)=>{if(PEOPLE[id].quals&&PEOPLE[id].quals.sxo)PEOPLE[id].quals.sched=true;});
/* SC currency as it stands today: the experienced hands hold both, the rest hold
   day only, and OCU hold neither until they are signed off. Tick or untick on the
   Quals page — SC DAY / SC NIGHT. */
Object.keys(PEOPLE).forEach((id:any)=>{const p=PEOPLE[id]; if(p.special||!p.quals)return;
  if(isOcu(p.q))return;
  p.quals.scDay=true;
  if(isInstr(p.q)||p.q==='A'||p.q==='B')p.quals.scNight=true;});
/* AAR currency as it stands: front seat only, day first and night after — the
   more experienced hands hold both, the C and D pilots hold day only. */
Object.keys(PEOPLE).forEach((id:any)=>{const p=PEOPLE[id]; if(p.special||!p.quals)return;
  if(p.seat!=='FCP'||isOcu(p.q))return;
  p.quals.daar=true;
  if(isInstr(p.q)||p.q==='A'||p.q==='B')p.quals.naar=true;});
/* the invariants, enforced once at boot as well as on every tick: night is
   signed off after day, never before it — for AAR and for SC alike */
Object.keys(PEOPLE).forEach((id:any)=>{const q=PEOPLE[id].quals; if(!q)return;
  if(q.naar&&!q.daar)q.naar=false;
  if(q.scNight&&!q.scDay)q.scNight=false;});
export const ID_BY_CS:any={}; Object.keys(PEOPLE).forEach((id:any)=>ID_BY_CS[PEOPLE[id].cs.toLowerCase()]=id);
/* sentinel bodies (ALL AVAIL) occupy slots but are not people: no conflicts,
   no crew rest, no qual rules, never counted as busy or engaged. */
export function isSpecial(id:any){return !!(PEOPLE[id]&&PEOPLE[id].special);}
export function realP(id:any){const p=PEOPLE[id];return (p&&!p.special)?p:null;}
export const SPECIALS=Object.keys(PEOPLE).filter((id:any)=>PEOPLE[id].special);
export function nameToId(nm:any){return ID_BY_CS[(nm||'').toLowerCase().trim()];}
/* ---------------------------------------------------------------------------
   AAR from the remarks
   A line's remarks say whether it is refuelling. Remarks are written in seat
   segments — "1A: …" or "A: …" is the FRONT seat, "1B:" / "B:" the rear — and
   the leading digit is that line's own aircraft number, so only the letter is
   read. A rear-seat segment is ignored outright: a WSO holds no AAR currency.
     AAR   → day or night decided by the clock (see below)
     DAAR  → day
     NAAR  → night
     NO AAR / NO DAAR / NO NAAR (with or without a seat tag) → nothing required
   A bare "AAR" is NIGHT if the wave is a night wave or the sortie runs past
   19:00 from take-off to landing, otherwise DAY.
   --------------------------------------------------------------------------- */
export function aarNeed(rmks:any,night:any){
  const t=String(rmks||'').toUpperCase();
  if(!/AAR/.test(t))return null;
  /* split into seat segments; anything before the first tag belongs to the
     front seat, since AAR only ever concerns the pilot */
  const segs:any[]=[]; const re=/(\d*)\s*([AB])\s*:/g;
  let last=0,seat=null,m;
  while((m=re.exec(t))){segs.push({seat,txt:t.slice(last,m.index)});seat=m[2];last=re.lastIndex;}
  segs.push({seat,txt:t.slice(last)});
  let need:any=null;
  segs.forEach((sg:any)=>{
    if(sg.seat==='B')return;                                   // rear seat — no AAR currency exists
    /* strike out the negated mentions first, so "NO DAAR / NAAR" still asks
       for NAAR rather than being dismissed wholesale */
    const txt=sg.txt.replace(/\bNO\s*[-–]?\s*[DN]?AAR\b/g,' ');
    if(!/AAR/.test(txt))return;
    if(/\bNAAR\b/.test(txt))need='NAAR';
    else if(/\bDAAR\b/.test(txt)){if(need!=='NAAR')need='DAAR';}
    else if(/\bAAR\b/.test(txt)){const w2=night?'NAAR':'DAAR'; if(need!=='NAAR')need=w2;}
  });
  return need;
}
export function aarOK(id:any,need:any){
  const p=PEOPLE[id]; if(!p||!p.quals||!need)return true;
  return need==='NAAR'?!!p.quals.naar:!!p.quals.daar;
}
export function scShiftKind(s:any,e:any){
  if(s==null||e==null)return null;
  return (s>=VCONF.scDayFrom&&e<=VCONF.scDayTo)?'day':'night';
}
export function scQualOK(id:any,kind:any){
  const p=PEOPLE[id]; if(!p||!p.quals||!kind)return true;
  return kind==='day'?!!p.quals.scDay:!!p.quals.scNight;
}
export function isScheduler(id:any){const p=PEOPLE[id];return !!(p&&p.quals&&p.quals.sched);}
