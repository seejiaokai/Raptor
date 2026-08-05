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
  const html = rematrix(remap(retier(readFileSync('reference/scheduler.html', 'utf8'))))
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
    ["if(p&&w&&isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');add('hard','ILLEGAL_CREW',[ac.p,ac.w],`Two OCU in one aircraft (${f.label})`);}",
     "if(p&&w&&p.seat==='FCP'&&w.seat==='RCP'&&!(p.q==='IP'||p.q==='IR'||p.q==='FI')&&!isInstr(w.q)){"
     + "if(isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');add('adv','CREW_SOLO',[ac.p,ac.w],`${p.cs} (OCU pilot) with ${w.cs} (OCU WSO) in ${f.label} — a crew solo, only allowed under the Basic Course Syllabus`);}"
     + "else if(isOcu(p.q)||isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');add('hard','ILLEGAL_CREW',[ac.p,ac.w],isOcu(p.q)?`OCU pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} — not an authorised combination (${f.label})`:`OCU WSO ${w.cs} with CAT ${p.q} pilot ${p.cs} — not an authorised combination (${f.label})`);}"
     + "else if((p.q==='D'&&(w.q==='C'||w.q==='D'))||(p.q==='C'&&w.q==='D')){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');add('adv','CO_APPROVAL',[ac.p,ac.w],`CAT ${p.q} pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} in ${f.label} — CO approval required`);}"
     + "}"],
  ]
  for (const [from, to] of swaps) {
    const n = html.split(from).length - 1
    if (n !== 1) throw new Error(`refwin rematrix: expected exactly 1 match, got ${n} for: ${from.slice(0, 50)}…`)
    html = html.replace(from, to)
  }
  return html
}

/* One divergence the sync CANNOT close: the reference's `isOffer` is a `const`,
   so it cannot be patched out, and the reference still treats "Fly" as an offer
   that clashes with nothing. The inputFlags filter shrinks the exposure — an
   UN-ACTIONED Fly input no longer reaches either engine — but a Fly input
   filed under Unavailable ('u') would pass the filter and the engines really
   would disagree (the port clashes it, the reference exempts it). The seed
   accepts nothing, so this stays invisible; if a future seed does that, the
   parity tests go red here, correctly, and the seed needs re-thinking. */
