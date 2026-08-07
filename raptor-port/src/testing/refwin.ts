/* Booting the untouched reference app in jsdom, for the parity tests.
   NOT a test file itself — vitest fails a *.test.ts that declares no tests, so
   this deliberately sits outside that glob. Nothing in the app imports it, so
   it never reaches a bundle.

   The reference is the read-only spec for existing behaviour, and the parity
   tests byte-compare against it. Where the port has deliberately diverged, the
   house idiom is to excise the divergence from BOTH strings and pin it
   positively — never to weaken the comparison.

   This helper removes one whole class of divergence at the source. The seed
   INPUTS no longer match: the port dropped "Office" / "Available fly" /
   "Available duty" and gained "Detachment" (owner decision, Aug 26). Rather
   than excising every row those types touch, push the port's INPUTS into the
   reference so both engines compute from IDENTICAL input data, leaving only the
   structural divergences for the tests themselves to handle.

   The push is filtered through inputFlags (owner, Aug 26): the port's
   validator no longer sees an un-actioned personal input, and the reference
   has no accept gate of its own, so it must be fed only what the port's
   validator would see or its warnings diverge. filter() preserves order, so
   day.input still compares byte-for-byte. */
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { INPUTS, inputFlags } from '../engine/inputs'

export async function refWindow(): Promise<any> {
  const html = rering(rebrief(relead(rematrix(remap(retier(readFileSync('reference/scheduler.html', 'utf8')))))))
  const vc = new VirtualConsole()
  vc.on('jsdomError', () => {})
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true })
  const w: any = dom.window
  w.URL.createObjectURL = () => 'blob:x'
  w.HTMLElement.prototype.scrollIntoView = () => {}
  await new Promise(r => setTimeout(r, 300))
  syncInputs(w)
  w.eval('validate()')
  return w
}

/* `w.INPUTS = [...]` does NOT work. The reference declares `let INPUTS` at the
   top level of a classic script, which is a global LEXICAL binding, not a
   property of window — assigning to w.INPUTS just creates a shadowing property
   the page never reads. An indirect eval resolves the real binding.

   Mutated in place rather than reassigned, because the reference's own history
   restore does `INPUTS.length=0; …push(…)` and holds references to the array. */
export function syncInputs(w: any) {
  w.eval('INPUTS.length=0;INPUTS.push.apply(INPUTS,JSON.parse('
    + JSON.stringify(JSON.stringify(INPUTS.filter(inputFlags))) + '))')
}

/* Second structural divergence, closed the same way as the INPUTS push — at
   the source, before boot. NO_BRIEF, SIM_BRIEF and DT_SUM are amber in the
   port (owner, 4 Aug 26); the reference bakes 'hard' into those three call
   sites as string literals. Patch the in-memory copy so both engines carry
   the same tiers and every byte-comparison (WARN, dayHTML markup, banner
   counts) stays exact — the file on disk is never touched. Each replacement
   must hit exactly once: if the reference text ever shifts, this throws
   rather than silently comparing the un-patched behaviour. */
function retier(html: string): string {
  const swaps: Array<[string, string]> = [
    ["markChip(di,id,'NB');markRing(di,id,'hard');\n          add('hard','NO_BRIEF'",
     "markChip(di,id,'NB');markRing(di,id,'adv');\n          add('adv','NO_BRIEF'"],
    ["markChip(di,id,'SB');markRing(di,id,'hard');\n          add('hard','SIM_BRIEF'",
     "markChip(di,id,'SB');markRing(di,id,'adv');\n          add('adv','SIM_BRIEF'"],
    ["add('hard','DT_SUM'", "add('adv','DT_SUM'"],
  ]
  for (const [from, to] of swaps) {
    const n = html.split(from).length - 1
    if (n !== 1) throw new Error(`refwin retier: expected exactly 1 match, got ${n} for: ${from.slice(0, 40)}…`)
    html = html.replace(from, to)
  }
  return html
}

/* Third structural divergence, closed the same way. The port's CAT ladder is
   OCU→D→C→B→A→IW→IP→IR→FI (owner, Aug 5 '26): the generic I tier and the
   standalone `ip` flag are gone, instructor-ness lives solely in CAT. The
   reference still carries I/CI + ip:true, so patch the in-memory copy to the
   same world before boot:
     · ladder tables (QCHIP/QCLASS/QCOLOR/LEVELNAME/QORDER) → the port's, byte
       for byte, so migrated CATs resolve to identical chips and tooltips
     · isInstr → the four-CAT body
     · the puck builder loses its p.ip override, the tooltip its ' · IP'
     · PEOPLE literals migrate: FCP I/CI → IP, RCP I → IW, Bane's A+ip → IP.
       ip:true stays on the reference records — harmless, because after the
       migration every read of it (`p.ip||isInstr(p.q)` in hasIP/anyIP and the
       boot seeding) is true exactly when the patched isInstr is true, and
       quals.instr is compared nowhere
     · the two QUAL message literals and the legend swatch take the port's
       wording, so IF they render they render identically
   The port-only rules (NO_IR, the IW-in-FCP guard) fire nowhere on the seed,
   so WARN stays byte-equal without patching them in. Multi-hit swaps carry
   their expected count; a drifted count throws, same as retier. */
function remap(html: string): string {
  const swaps: Array<[string, string, number?]> = [
    ["{OCU:'O',D:'D',C:'C',B:'B',A:'A',I:'I',CI:'CI',IR:'IR'}",
     "{OCU:'O',D:'D',C:'C',B:'B',A:'A',IW:'IW',IP:'IP',IR:'IR',FI:'FI'}"],
    ["{OCU:'q-ocu',D:'q-d',C:'q-c',B:'q-b',A:'q-a',I:'q-ins',CI:'q-ins',IR:'q-ins'}",
     "{OCU:'q-ocu',D:'q-d',C:'q-c',B:'q-b',A:'q-a',IW:'q-ins',IP:'q-ins',IR:'q-ins',FI:'q-ins'}"],
    ["{OCU:'#8A6ED0',D:'#3B7DF0',C:'#3BC6E8',B:'#E5A83B',A:'#F0555F',I:'#A64DE8',CI:'#A64DE8',IR:'#A64DE8'}",
     "{OCU:'#8A6ED0',D:'#3B7DF0',C:'#3BC6E8',B:'#E5A83B',A:'#F0555F',IW:'#A64DE8',IP:'#A64DE8',IR:'#A64DE8',FI:'#A64DE8'}"],
    ["{OCU:'OCU (ab-initio)',D:'D · wingman',C:'C · ops wingman',B:'B · 2-ship FL',A:'A · 4-ship FL',I:'I · instructor',CI:'CI · C-cat instr',IR:'IR · instr rating exmr'}",
     "{OCU:'OCU (ab-initio)',D:'D · wingman',C:'C · ops wingman',B:'B · 2-ship FL',A:'A · 4-ship FL',IW:'IW · instructor WSO',IP:'IP · instructor pilot',IR:'IR · instrument rating exmr',FI:'FI · fighter wing instructor'}"],
    ["const isInstr=q=>q==='I'||q==='CI'||q==='IR';",
     "const isInstr=q=>q==='IW'||q==='IP'||q==='IR'||q==='FI';"],
    ["{OCU:0,D:1,C:2,B:3,A:4,I:5,CI:6,IR:7}",
     "{OCU:0,D:1,C:2,B:3,A:4,IW:5,IP:6,IR:7,FI:8}"],
    ["const chipTxt=p.ip?'I':QCHIP[p.q], chipCls=p.ip?'q-ins':QCLASS[p.q];",
     "const chipTxt=QCHIP[p.q], chipCls=QCLASS[p.q];"],
    ["LEVELNAME[p.q]+(p.ip?' · IP':'')+", "LEVELNAME[p.q]+"],
    ["is a pilot, not IP — only IP may fly RCP (",
     "is a pilot, not an instructor — only IP / IR / FI may fly RCP ("],
    ["is a pilot, not IP — only IP may take the back seat (",
     "is a pilot, not an instructor — only IP / IR / FI may take the back seat ("],
    [`<span><span class="qk" style="background:var(--q-ins)">I</span>IP / instr</span>`,
     `<span><span class="qk" style="background:var(--q-ins)">IW</span>IWSO</span>\n    <span><span class="qk" style="background:var(--q-ins)">IP</span>IP</span>\n    <span><span class="qk" style="background:var(--q-ins)">IR</span>IR exmr</span>\n    <span><span class="qk" style="background:var(--q-ins)">FI</span>FWI</span>`],
    ["seat:'FCP',q:'I',ip:true", "seat:'FCP',q:'IP',ip:true", 8],
    ["seat:'FCP',q:'CI',ip:true", "seat:'FCP',q:'IP',ip:true", 6],
    ["seat:'RCP',q:'I',ip:true", "seat:'RCP',q:'IW',ip:true", 7],
    ["q:'A',ip:true", "q:'IP',ip:true", 1],
  ]
  for (const [from, to, want] of swaps) {
    const n = html.split(from).length - 1
    if (n !== (want ?? 1)) throw new Error(`refwin remap: expected ${want ?? 1} match(es), got ${n} for: ${from.slice(0, 50)}…`)
    html = html.split(from).join(to)
  }
  return html
}

/* Fourth structural divergence, closed the same way. The port grades every
   properly-seated non-instructor crew through the F-15SG combination matrix
   (Table 1.5-2, owner Aug 5 '26); the reference only knows the old two-OCU
   hard rule, and the matrix DOES fire on the seed week (Mon bapster+nick is
   now the crew-solo advisory, Wed krait+wrangler and pike+badger want CO
   approval, Thu bapster+badger is an unauthorised combination). So the rule
   itself is patched into the in-memory reference at the exact call site the
   two-OCU line occupied — same insertion order, byte-identical messages —
   and WCODE gains the two new labels so dayHTML renders them identically.
   Runs AFTER remap: the injected code leans on the patched four-CAT isInstr;
   isInstrPilot has no reference equivalent, so it is inlined. */
function rematrix(html: string): string {
  const swaps: Array<[string, string]> = [
    ["TURN:'Tight turn',ILLEGAL_CREW:'Illegal aircrew combination',OCU_NO_IP:",
     "TURN:'Tight turn',ILLEGAL_CREW:'Illegal aircrew combination',CREW_SOLO:'Crew solo — only allowed under syllabus',CO_APPROVAL:'Crew combination — CO approval required',OCU_NO_IP:"],
    /* The crew-pairing chip (renamed from CC, owner ask 5 Aug 26). The
       reference's RANK has no CP/CPH, and markChip compares
       `RANK[c] > RANK[current]` — with an unranked code that is
       `undefined > n`, i.e. false — so the reference would keep whichever
       crew-pairing chip landed FIRST and drop every later one, while the port
       ranks them properly. The whole literal is replaced rather than appended
       to, so the two tables are identical and the comparison cannot drift.
       (The reference has no RUN either; it is carried in for the same reason
       — one table, not two that happen to agree on this week.) */
    ["const RANK={LD:0,DT:1,TT:2,A:3,SD:4,SB:5,DB:6,NB:7,CR:8,C:9,Q:10}",
     "const RANK={LD:0,DT:1,TT:2,A:3,SD:4,SB:5,DB:6,NB:7,CP:8,CR:9,RUN:10,CPH:11,C:12,Q:13}"],
    /* The chip also has to RENDER identically, and the reference's puck builder
       falls back to the raw code for both the glyph and the tooltip
       (`CHIP_TEXT[flag]||flag`, `CHIP_LABEL[flag]||flag`). Left unpatched, CPH
       would print the literal "CPH" against the port's "CP", and every CP puck
       would carry the code as its title instead of the label — so the dayHTML
       byte-comparison in html.test.ts fails on the markup, not on the rule. */
    ["const CHIP_TEXT={DT:'DT',TT:'TT',C:'C',A:'A',Q:'Q',CR:'R',NB:'B',SB:'B',DB:'D',SD:'D',LD:'L'}",
     "const CHIP_TEXT={DT:'DT',TT:'TT',C:'C',A:'A',Q:'Q',CR:'R',NB:'B',SB:'B',DB:'D',SD:'D',LD:'L',CP:'CP',CPH:'CP'}"],
    ["SD:'No time for the sim debrief',LD:'Long work day (>{longDay})'};",
     "SD:'No time for the sim debrief',LD:'Long work day (>{longDay})',"
     + "CP:'Crew pairing — this pairing needs approval',CPH:'Crew pairing — not an authorised pairing'};"],
    ["if(p&&w&&isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');add('hard','ILLEGAL_CREW',[ac.p,ac.w],`Two OCU in one aircraft (${f.label})`);}",
     "if(p&&w&&p.seat==='FCP'&&w.seat==='RCP'&&!(p.q==='IP'||p.q==='IR'||p.q==='FI')&&!isInstr(w.q)){"
     + "if(isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CREW_SOLO',[ac.p,ac.w],`${p.cs} (OCU pilot) with ${w.cs} (OCU WSO) in ${f.label} — a crew solo, only allowed under the Basic Course Syllabus`);}"
     + "else if(isOcu(p.q)||isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');markChip(di,ac.p,'CPH');markChip(di,ac.w,'CPH');add('hard','ILLEGAL_CREW',[ac.p,ac.w],isOcu(p.q)?`OCU pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} — not an authorised combination (${f.label})`:`OCU WSO ${w.cs} with CAT ${p.q} pilot ${p.cs} — not an authorised combination (${f.label})`);}"
     + "else if((p.q==='D'&&(w.q==='C'||w.q==='D'))||(p.q==='C'&&w.q==='D')){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CO_APPROVAL',[ac.p,ac.w],`CAT ${p.q} pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} in ${f.label} — CO approval required`);}"
     + "}"],
    /* OCU_NO_IP exists in BOTH engines, so unlike NO_IR it cannot be left to
       diverge on the strength of "it does not fire on this week" — that is luck,
       not parity. Same code, same chip, both sides. */
    ["if(ocuAll.length&&!anyIP){ocuAll.forEach(id=>markRing(di,id,'adv'));",
     "if(ocuAll.length&&!anyIP){ocuAll.forEach(id=>{markRing(di,id,'adv');markChip(di,id,'CP');});"],
    /* The ALL AVAIL sentinel fix (owner scenario run, 5 Aug 26): crewAll used to
       be `.filter(Boolean)`, so the sentinel flowed into ocuAll/anyIP here and
       into NO_IR (port-only, never patched into the reference). OCU_NO_IP DOES
       fire on the seed and IS patched above, so the reference's copy of this
       line needs the identical fix or a sentinel could pick up a ring/chip on
       one side and not the other — the same crewAll line lives at
       reference/scheduler.html:3140, read-only, patched here in memory only. */
    ["const crewAll=[...new Set(f.acs.reduce((a,x)=>a.concat([x.p,x.w]),[]).filter(Boolean))];",
     "const crewAll=[...new Set(f.acs.reduce((a,x)=>a.concat([x.p,x.w]),[]).filter(id=>id&&PEOPLE[id]&&!isSpecial(id)))];"],
  ]
  for (const [from, to] of swaps) {
    const n = html.split(from).length - 1
    if (n !== 1) throw new Error(`refwin rematrix: expected exactly 1 match, got ${n} for: ${from.slice(0, 50)}…`)
    html = html.replace(from, to)
  }
  return html
}

/* The remark-driven OFT brief lead (owner, 5 Aug 26): a row whose rmks name a
   brief time ("BRIEF 30 PRIOR", "30 mins prior") briefs THAT long, epBrief
   only when it says nothing. The seed EP-4s carry "BRIEF 30 PRIOR" on both
   builds, so parity needs the identical parse in the reference's simwin push —
   same regexes, same 0–240 bound as the port's briefLeadOf. Note the swap
   strings are TS string literals: the \\b below reaches the page as \b. */
function relead(html: string): string {
  const from = "simwin.push({ids,label:'OFT '+(s.label||'sim'),bs:st-VCONF.epBrief,be:st,ds:en,de:en+VCONF.simDebrief}); });"
  const to = "const _r=String(s.rmks||''),_m=_r.match(/\\bbrief\\s*[-:]?\\s*(\\d{1,3})\\b/i)||_r.match(/\\b(\\d{1,3})\\s*(?:min(?:ute)?s?\\s*)?prior\\b/i);"
    + "const _bl=_m&&+_m[1]>0&&+_m[1]<=240?+_m[1]:null;"
    + "simwin.push({ids,label:'OFT '+(s.label||'sim'),bs:st-(_bl!=null?_bl:VCONF.epBrief),be:st,ds:en,de:en+VCONF.simDebrief}); });"
  const n = html.split(from).length - 1
  if (n !== 1) throw new Error(`refwin relead: expected exactly 1 match, got ${n}`)
  return html.replace(from, to)
}

/* The INDICATED brief time (owner, 6 Aug 26). The port lets a scheduler type a
   B per formation and every brief-driven rule follows it, falling back to
   VCONF.briefLead when the line has none; the reference only ever computes the
   fallback. The seed week types no B, so both engines agree today — but "they
   agree on this week" is luck, not parity, exactly as the OCU_NO_IP note in
   rematrix says, and the first test to set f.br would silently compare a typed
   port against an untyped reference. Two swaps, mirroring events.ts and
   validate.ts: the brief itself, and the crew-rest anchor (which must read the
   leg's own brief rather than recompute it, plus the late-show exemption off
   the aircraft remarks). */
function rebrief(html: string): string {
  const swaps: Array<[string, string]> = [
    /* carry showLead in too, so a test that edits the latest-show rule moves
       both engines rather than leaving the reference on the hard-coded 60 */
    ["const VCONF={briefLead:140,", "const VCONF={showLead:60, briefLead:140,"],
    /* the dashed-ring store the CREW_REST patch below writes into, and its
       publication on WARN — the reference has neither */
    ["const ev=collectEvents(), all=[], byDay=[], sev={}, chip={};",
     "const ev=collectEvents(), all=[], byDay=[], sev={}, chip={}, dash={};"],
    ["WARN={all,byDay,sev,chip};", "WARN={all,byDay,sev,chip,dash};"],
    ["const briefM=shiftLine?null:toM-VCONF.briefLead;",
     "const _bt=shiftLine?null:parseHM(f.br);const briefM=shiftLine?null:(_bt!=null?_bt:toM-VCONF.briefLead);"],
    ["const insOf=e=>e.shift?e.to:Math.min(e.intime!=null?e.intime:Infinity,e.to-VCONF.briefLead);",
     "const _bo=e=>e.brief!=null?e.brief:e.to-VCONF.briefLead;"
     + "const insOf=e=>e.shift?e.to:Math.min(e.intime!=null?e.intime:Infinity,_bo(e));"],
    /* The crew-rest breach itself (owner, 6 Aug 26): the port names the
       LEAVE-BY time in the message and carries prevDi/leaveBy/dashed on the
       warning, so the previous day can be traced from a click. The reference
       says none of that, and parity compares the message text — so mirror the
       whole add, dashed ring included. `add` there takes no extras argument,
       so they are attached to the pushed warning by patching the message
       first and the object after; keep both sides' field ORDER identical or
       the deep-equal compares unequal objects that print the same. */
    ["          markChip(di,id,'CR');markRing(di,id,'hard');\n"
     + "          add('hard','CREW_REST',[id],\n"
     + "            (onShift?`Crew rest breach — ${legs.filter(e=>e.shift).map(e=>e.label)[0]} starts ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `\n"
     + "                   :`Crew rest breach — told to report ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `)+tail);",
     "          const _bl=legs.reduce((m,e)=>insOf(e)<insOf(m)?e:m);"
     + "const _lv=hm24(instructed+1440-VCONF.crewRest);"
     + "const _mk=!_bl.shift&&earliest<=_bl.to-(VCONF.showLead!=null?VCONF.showLead:60);"
     + "const _da=!!_bl.lateShow&&_mk;"
     + "markChip(di,id,'CR');markRing(di,id,'hard');if(_da){dash[di]=dash[di]||{};dash[di][id]=true;}\n"
     + "          add('hard','CREW_REST',[id],\n"
     + "            (onShift?`Crew rest breach — ${legs.filter(e=>e.shift).map(e=>e.label)[0]} starts ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `\n"
     + "                   :`Crew rest breach — told to report ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `)"
     + "+(_da?`Late show — he still makes the ${hm24(_bl.to-(VCONF.showLead!=null?VCONF.showLead:60))} show. `"
     + ":(_bl.lateShow?`Late show cannot save it — rest clears ${hm24(earliest)}, after the ${hm24(_bl.to-(VCONF.showLead!=null?VCONF.showLead:60))} latest show. `:''))"
     + "+tail+`, so he had to leave by ${_lv}`);"
     + "{const _w=ws[ws.length-1];_w.prevDi=idx-1>=0?ev[idx-1].di:null;_w.leaveBy=_lv;_w.dashed=_da;}"],
    /* the reference's fly.push has no lateShow, so _bo's exemption could never
       fire there — carry the same remark parse onto its legs */
    ["fly.push({id,seat,brief:briefM,to:toM,ld:ldM,step:stepM,dekit:dekitM,report,intime,",
     "fly.push({id,seat,brief:briefM,to:toM,ld:ldM,step:stepM,dekit:dekitM,report,intime,"
     + "lateShow:!shiftLine&&/\\b(?:late\\s*show|show\\s*(?:at|@)\\s*brief|brief\\s*show)\\b/i.test(String(a.rmks||'')),"],
  ]
  for (const [from, to] of swaps) {
    const n = html.split(from).length - 1
    if (n !== 1) throw new Error(`refwin rebrief: expected exactly 1 match, got ${n} for: ${from.slice(0, 50)}…`)
    html = html.replace(from, to)
  }
  return html
}

/* The tight-turn chip loses its ring (owner, 7 Aug 26). Both builds chip DT
   and the same-day TT bare, and both ring the crew-rest TT amber — so the same
   glyph meant "ringed problem" in one place and "unringed note" in another.
   The port drops that one ring; the reference has to drop it too or every
   byte-comparison of a seed day's markup fails on the ring class rather than
   on the rule. Chip and warning are untouched on both sides — this removes a
   mark, nothing else. */
function rering(html: string): string {
  const from = "markChip(di,id,'TT');markRing(di,id,'adv');"
  const n = html.split(from).length - 1
  if (n !== 1) throw new Error(`refwin rering: expected exactly 1 match, got ${n}`)
  return html.replace(from, "markChip(di,id,'TT');")
}

/* One divergence the sync CANNOT close: the reference's `isOffer` is a `const`,
   so it cannot be patched out, and the reference still treats "Fly" as an offer
   that clashes with nothing. The inputFlags filter shrinks the exposure — an
   UN-ACTIONED Fly input no longer reaches either engine — but a Fly input
   filed under Unavailable ('u') would pass the filter and the engines really
   would disagree (the port clashes it, the reference exempts it). The seed
   accepts nothing, so this stays invisible; if a future seed does that, the
   parity tests go red here, correctly, and the seed needs re-thinking. */
