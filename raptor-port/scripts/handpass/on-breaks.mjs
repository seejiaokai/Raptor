// THE BREAK TESTS of [OIL-ASK-NOTIFY] (the checking order's §8.4: for every wire the roll-call marks as wired, break it
// once on purpose and watch a NAMED test go red; if nothing goes red, that wire has no test, by proof). Each break is
// one exact text swap in one source file; the named test files are run; the file is put back. Nothing is left changed:
// it refuses to start on a tree with changes under src/. A file with Windows line endings is matched in its own.
//
//   node scripts/handpass/on-breaks.mjs [only-regex] > breaks.log      (from raptor-port/; about half an hour)
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const sh = (c) => execSync(c, { encoding: 'utf8' })
if (sh('git status --porcelain -- src').trim()) { console.log('REFUSED: src/ has uncommitted changes — commit first, so every break can be put back from git'); process.exit(2) }

const DOOR = ['src/ui/oilwait.test.tsx', 'src/ui/reqdoor.test.tsx']
const SIB = ['src/ui/oilconfirm.test.tsx', 'src/ui/caldrag.test.tsx', 'src/ui/oilwait.test.tsx']
const HOL = ['src/leavewar/holnotice.test.tsx']
const R = 'src/ui/reqdoor.ts', W = 'src/ui/oilwait.ts', V = 'src/state/view.ts', D = 'src/ui/drag.ts', IE = 'src/ui/inputedit.tsx'
const CD = 'src/ui/caldrag.ts', SH = 'src/ui/OilWaitSheet.tsx', SY = 'src/leavewar/sync.ts', LS = 'src/leavewar/state/store.ts'
const N = 'src/state/notices.ts', TB = 'src/ui/topbits.tsx', OD = 'src/ui/oilday.ts', OL = 'src/ui/OilDayList.tsx'

const BREAKS = [
  /* ---- the row's door (R1–R8) ---- */
  ['B1 the row\'s door asks nothing — the change is made at once (R1, R2)', R,
    "  if (!g || g.kind !== 'ask') return o.make()\n", "  return o.make()\n", DOOR],
  ['B2 a change that would be refused is asked its question first (no try)', R,
    "  try { good = dryRun(() => o.make() === 'done') } finally { TRYING = false }\n", "  good = true; TRYING = false\n", DOOR],
  ['B3 the answer given is not written with the change (join, swap, move)', R,
    "const opts = (oil?: Oil) => (oil ? { sched: true, oil } : { sched: true })", "const opts = (_oil?: Oil) => ({ sched: true })", DOOR],
  ['B4 a swap is asked of the FIRST man\'s answer, not the new holder (R1)', R,
    "oilGate(swap ? { ...draftOf(q.inp), person: pid } : draftOf(q.inp), q.inp)", "oilGate(draftOf(q.inp), q.inp)", DOOR],
  ['B5 a move does not wait (R7)', R,
    "    gate: () => { const e = ends(); return e ? oilGate(draftOf(e[1].inp), e[1].inp) : null },\n", "    gate: () => null,\n", DOOR],
  ['B6 an add does not wait (R4, R8)', R,
    "    gate: () => { const q = here(); return q ? oilGate(swap ? { ...draftOf(q.inp), person: pid } : draftOf(q.inp), q.inp) : null },\n",
    "    gate: () => { const q = here(); return q && swap ? oilGate({ ...draftOf(q.inp), person: pid }, q.inp) : null },\n", DOOR],
  ['B7 a crew-list man on the only puck is said as a swap of two seats (R3)', R,
    "lead: swap ? (seat ? `Swapping ${csOf(pid)} and ${csOf(at)}` : `Putting ${csOf(pid)} in place of ${csOf(at)}`)", "lead: swap ? (`Swapping ${csOf(pid)} and ${csOf(at)}`)", DOOR],
  ['B8 "Answer OIL" takes a row whose man has changed', R,
    "return q && iidOf(q) === iid && q.at === at ? q : null }", "return q && iidOf(q) === iid ? q : null }", DOOR],
  ['B9 the seat he came from is not found again by who sits on it', R,
    "return k && String(whoId(slotVal(k)) || '') === pid ? k : null }", "return k || null }", DOOR],
  ['B10 what flashes when not answered: the seat he came from is left out', R,
    "    places: [ridWriteKey(`g:${p.di}.${p.ri}${at ? p.rest : ''}`, DAYS), ...(F ? [F] : [])],\n", "    places: [ridWriteKey(`g:${p.di}.${p.ri}${at ? p.rest : ''}`, DAYS)],\n", DOOR],
  /* ---- answered / not answered ---- */
  ['B11 not answered leaves no bar', W, "  setOilBar({ text: WAIT_WORDS[w.kind].not, wait: w })\n", "", DOOR],
  ['B12 not answered: nothing flashes', W, "  flash(w.places)\n", "", DOOR],
  ['B13 the answer does not reach the door', W, "  const a = w.redo(oil)\n", "  const a = w.redo({})\n", DOOR],
  ['B14 the gesture\'s own ending is not run when the answer comes', W,
    "  if (a === 'done') { if (w.post) w.post(pre, w.landed ?? null) }\n  else if (a !== 'refused') HOOKS.toast(CHANGED[w.kind], 'warn')\n  notify()\n  return a === 'done'\n",
    "  if (a !== 'done' && a !== 'refused') HOOKS.toast(CHANGED[w.kind], 'warn')\n  notify()\n  return a === 'done'\n", DOOR],
  ['B15 "Answer OIL" does not ask the door again', W, "  const a = w.ask()\n", "  const a: string = 'refused'\n", DOOR],
  ['B16 a row that has changed says nothing at "Answer OIL"', W,
    "  else if (a !== 'refused') HOOKS.toast(CHANGED[w.kind], 'warn')\n  notify()\n}\n", "  notify()\n}\n", DOOR],
  ['B17 the bar\'s OK does not close it', W,
    "export function oilBarOk(): void { if (OILBAR) { setOilBar(null); notify() } }", "export function oilBarOk(): void { }", DOOR],
  ['B18 the answer is taken while the question still stands (the wait is not cleared)', W,
    "  if (!w) return false\n  setOilWait(null)\n", "  if (!w) return false\n", DOOR],
  /* ---- the armed tap, the resets (R5, R6) ---- */
  ['B19 the armed tap does not know the fourth answer (R5)', V, "    if(a==='asked'){\n", "    if(false){\n", DOOR],
  ['B20 a page change keeps the waiting change and the bar', V, "  if(p!==CURPAGE){ OILWAIT=null; OILBAR=null; }\n", "", DOOR],
  ['B21 a week change or a sign-in keeps the waiting change', V, "  { name:'OILWAIT', scopes:['session','week'], reset:()=>setOilWait(null) },\n", "", [...DOOR, 'src/state/view.test.ts']],
  ['B22 a week change or a sign-in keeps the bar', V, "  { name:'OILBAR',  scopes:['session','week'], reset:()=>setOilBar(null) },\n", "", [...DOOR, 'src/state/view.test.ts']],
  /* ---- the drag's four sites (R1–R4, R7) ---- */
  ['B23 the drop on a puck: \'asked\' falls through to the old write (swap, crew list)', D, "      if (put === 'asked') return held(aimed)\n", "", DOOR],
  ['B24 the drop on a puck: a move\'s \'asked\' falls through', D, "      if (mv === 'asked') return held(aimed)\n", "", DOOR],
  ['B25 the drop on "+ add": a move\'s \'asked\' falls through', D, "      if (mv === 'asked') return held(moving)\n", "", DOOR],
  ['B26 the drop on "+ add": \'asked\' falls through', D, "      if (put === 'asked') return held(moving)\n", "", DOOR],
  ['B27 the landing flash is not handed to the wait by the drag', D,
    "      if (view.armedKey() === landed) view.disarmSlot()\n      markLand(landSel(landed))\n", "      if (view.armedKey() === landed) view.disarmSlot()\n", DOOR],
  /* ---- the save tried and thrown away ---- */
  ['B28 the tried save is KEPT', 'src/state/store.ts', "    passed = true\n    throw new CmdRefused(TRIED)\n", "    passed = true\n", [...DOOR, ...SIB.slice(0, 2)]],
  ['B29 the swap\'s answer is not written by the input\'s own save', IE, "    if (opts && opts.oil) r.oil = { ...opts.oil }\n", "", [...DOOR, 'src/ui/oilconfirm.test.tsx']],
  /* ---- the two sibling doors (R9, R10) ---- */
  ['B30 the sibling doors ask nothing — the change is made at once', IE, "  if (!g || g.kind !== 'ask') return run() === 'done'\n", "  return run() === 'done'\n", SIB],
  ['B31 a sibling door\'s refused change is asked its question first', IE, "  if (!dryRun(() => run() === 'done')) {\n", "  if (false) {\n", SIB],
  ['B32 the Unavailable row, one man: no wait (R9)', IE,
    "    gate: x => oilGate({ ...draftOf(x), person: personId }, x),\n", "    gate: () => ({ kind: 'none' } as any),\n", SIB],
  ['B33 the Unavailable row, an input of several: no wait (R9)', IE,
    "      gate: x => oilGate(draftOf(x), x),\n", "      gate: () => ({ kind: 'none' } as any),\n", SIB],
  ['B34 the Unavailable row, several: the answer is not written', IE, "          if (oil) x.oil = { ...oil }\n", "", SIB],
  ['B35 the Unavailable row: "Answer OIL" takes a row whose man has changed', IE,
    "    same: x => idsOf(x).length === 1 && holds(x, from),\n", "    same: () => true,\n", SIB],
  ['B36 the Inputs calendar\'s drag: no wait (R10)', CD,
    "    gate: x => oilGate(whole ? d : { ...d, person: idsOf(x)[0] }, x),\n", "    gate: () => ({ kind: 'none' } as any),\n", SIB],
  ['B37 the Inputs calendar\'s drag: the answer is not written', CD,
    "commitInput(x, d, idsOf(x), oil ? { oil } : undefined) : commitInputEdit(x, d, undefined, undefined, oil ? { oil } : undefined)",
    "commitInput(x, d, idsOf(x), undefined) : commitInputEdit(x, d, undefined, undefined, undefined)", SIB],
  ['B38 the Inputs calendar\'s drag: nothing flashes when not answered (R10)', CD,
    "    places: [`sel:#inpCal [data-iid=\"${String(r.iid)}\"]`],\n", "    places: [],\n", SIB],
  ['B39 the Inputs calendar\'s drag: no landing flash when the answer comes', CD,
    "      else if (to && to !== entry.fromIso && OILWAIT) oilWaitThen(() => null, () => markLand(landing))\n", "", SIB],
  ['B40 the Inputs calendar\'s drag: "Answer OIL" takes an input that has moved since', CD,
    "    same: x => idsOf(x).map(String).join(',') === people && x.date === date0 && (x.endDate || '') === end0,\n", "    same: () => true,\n", SIB],
  /* ---- the sheet and the bar (R14) ---- */
  ['B41 the question has no first line and no words of its own', SH, "    lead={w.lead} noLabel={words.no} yesLabel={words.yes}\n", "", DOOR],
  /* (B42 is NOT caught, and is left as a belt: the bar is cleared whenever a question is held — ui/oilwait.ts holdForOil,
     oilBarAgain — so the two never stand together and this guard decides nothing today) */
  ['B42 the bar shows while the question is up', SH, "  if (!b || OILWAIT) return null\n", "  if (!b) return null\n", DOOR],
  ['B43 the bar\'s "Answer OIL" does nothing', SH, "onClick={oilBarAgain}", "onClick={() => {}}", DOOR],
  ['B44 the question\'s left button does not leave the change', SH, "onCancel={leaveOilWait}", "onCancel={() => {}}", DOOR],
  ['B45 the question draws no first line', 'src/ui/OilConfirm.tsx',
    "          {lead && <div className=\"oilconf-what oilconf-lead\" data-testid=\"oilconf-lead\"><b>{lead}</b></div>}\n", "", DOOR],
  /* ---- what the one list holds (R16) ---- */
  ['B46 the list holds an input taken off the programme', SY,
    "    if (!row || !row.iid || !oilAsks(row.type) || row.acc === 'r') continue\n    const plan = oilAskPlan(row)\n    if (!plan.length) continue\n    const answered",
    "    if (!row || !row.iid || !oilAsks(row.type)) continue\n    const plan = oilAskPlan(row)\n    if (!plan.length) continue\n    const answered", HOL],
  ['B47 the list holds a kind that never asks', SY,
    "    if (!row || !row.iid || !oilAsks(row.type) || row.acc === 'r') continue\n    const plan = oilAskPlan(row)\n    if (!plan.length) continue\n    const answered",
    "    if (!row || !row.iid || row.acc === 'r') continue\n    const plan = oilAskPlan(row)\n    if (!plan.length) continue\n    const answered", HOL],
  ['B48 the list holds an input already answered', SY, "p.iso <= hi && answered[p.iso] == null && !isoProt(p.iso)", "p.iso <= hi && !isoProt(p.iso)", HOL],
  ['B49 the list holds a day of a locked week', SY, "p.iso <= hi && answered[p.iso] == null && !isoProt(p.iso)", "p.iso <= hi && answered[p.iso] == null", HOL],
  ['B50 the list holds an input\'s days outside the run', SY, "plan.filter(p => p.iso >= from && p.iso <= hi && ", "plan.filter(p => ", HOL],
  /* ---- who is told, and how (R18–R21) ---- */
  ['B51 a member with a sign-in is told as a scheduler (R21)', SY, "ACCOUNTS_LIST.filter(a => isAdminAccount(a) && a.on && !!a.pid)", "ACCOUNTS_LIST.filter(a => a.on && !!a.pid)", HOL],
  ['B52 a switched-off admin is told', SY, "ACCOUNTS_LIST.filter(a => isAdminAccount(a) && a.on && !!a.pid)", "ACCOUNTS_LIST.filter(a => isAdminAccount(a) && !!a.pid)", [...HOL, 'src/state/accounts.test.ts']],
  ['B53 a holiday with nothing to answer tells and opens', SY, "  const todo = runs.filter(r => oilOpenOn(r.from, r.to).length > 0).map(", "  const todo = runs.map(", HOL],
  ['B54 no notice is written — silent', SY,
    "  commitInputs(SCHED_TYPES.inputsWrite, () => { for (const h of todo) noticeHoliday(to, by != null ? String(by) : null, h.name, h.from, h.to) })\n", "", HOL],
  ['B55 the list does not open by itself (R16)', SY,
    "  cmdDeferEffect(() => { setOilList({ from: first.from, to: first.to, name: first.name, fresh: true }); raptorNotify() })\n", "", HOL],
  ['B56 it opens without "is now a public holiday"', SY, "name: first.name, fresh: true })", "name: first.name, fresh: false })", HOL],
  ['B57 the count on the bell is never read again', SY,
    "  if (LEFT.v !== v || LEFT.wf !== wf || LEFT.n !== n) LEFT = { v, wf, n, m: new Map() }\n", "  if (LEFT.v < 0) LEFT = { v, wf, n, m: new Map() }\n", HOL],
  ['B58 the holiday\'s teller is not installed', SY, "  setHolidayTell(tellHoliday)\n", "", HOL],
  ['B59 the bell\'s counter is not installed', SY, "  setHolidayLeft(holidayLeft)\n", "", HOL],
  /* ---- every door that makes a holiday (R16, R17) ---- */
  ['B60 the Holidays list\'s end does not tell', LS,
    "      tellHolidays(before)                       // [OIL-ASK-NOTIFY]: inside this command — its Undo takes the notices too\n", "", HOL],
  ['B61 the Event row\'s end does not tell (R17)', LS,
    "      tellHolidays(before)                       // [OIL-ASK-NOTIFY]: the Event row's writers, a band, an event type — this end\n", "", HOL],
  ['B62 a day that was already a holiday tells again', LS,
    "      if (!isNonWorkingDay(d.date, b.day, before.eventDefs, b.bands)) dates.push(d.date)\n", "      dates.push(d.date)\n", HOL],
  ['B63 an event type re-tagged as a holiday is not seen', LS, "  const defsMoved = before.eventDefs !== after.eventDefs\n", "  const defsMoved = false\n", HOL],
  ['B64 days in a row are not one run', LS, "    if (last && (d === last.to || d === addDays(last.to, 1))) last.to = d\n", "    if (false) last.to = d\n", HOL],
  /* ---- the bell's line (R18–R20) ---- */
  ['B65 a line with nothing left is still listed', N, "  if (noticeLeft(n) <= 0) return false\n", "", HOL],
  ['B66 a holiday made twice shows two lines', N,
    "    if (o && o.a === h.a && o.b === h.b && (x.at > n.at || (x.at === n.at && x.id > n.id))) return false\n", "", HOL],
  ['B67 the bell\'s list does not leave a dead line out', N, "NOTICES.filter(n => n.to === pid && noticeLive(n))", "NOTICES.filter(n => n.to === pid)", HOL],
  ['B68 "1 inputs need an OIL answer"', N, "what: left === 1 ? '1 input needs an OIL answer' : `${left} inputs need an OIL answer`", "what: `${left} inputs need an OIL answer`", HOL],
  ['B69 the holiday line covers every date for the bell\'s tap', N, "if (h && h.a <= iso && iso <= h.b && noticeLive(n)) return n", "if (h && noticeLive(n)) return n", HOL],
  ['B70 a dead holiday line lights the bell', 'src/state/noticeseen.ts', "  if (!noticeLive(n)) return false\n", "", HOL],
  ['B71 a scheduler\'s own input on the holiday takes the bell\'s tap', TB,
    "oilPendingFor(mine).find(h => !(sched && holidayLineOn(mine, h.iso))) || null : null", "oilPendingFor(mine)[0] || null : null", HOL],
  /* (B72 — "a MEMBER whose input a line covers is sent to the list too": the bell's own `sched &&` decided nothing once a
     holiday's line was made live for a scheduler only — B89 — and was removed; the member view is pinned by B89's test) */
  ['B73 a tap on the line does not open the list', TB,
    "    setOilList({ from: String(hol.a), to: String(hol.b || hol.a), name: n.name, fresh: false })\n", "", HOL],
  ['B74 a tap on the line does not read it', TB, "    markNoticeRead(n.id)\n    setBellList(false)\n", "    setBellList(false)\n", HOL],
  ['B75 a tap on the line leaves the bell\'s list open', TB, "    markNoticeRead(n.id)\n    setBellList(false)\n", "    markNoticeRead(n.id)\n", HOL],
  /* ---- the list's Save and the window (R16) ---- */
  ['B76 anyone saves from the list', OD, "  if (!canEditSched()) { HOOKS.toast('Only a scheduler answers from this list', 'warn'); return -1 }\n", "", HOL],
  ['B77 a No is written as a Yes', OD, "oil[iso] = picks[o.iid] === 'y' ? o.amt : 0", "oil[iso] = o.amt", HOL],
  ['B78 the list\'s answer is not stamped', OD, "      stampChanged(r)\n", "", HOL],
  ['B79 the list answers the input\'s days outside the run too', OD, "      for (const iso of o.days) oil[iso] = ", "      for (const iso of [...o.days, o.last]) oil[iso] = ", HOL],
  ['B80 a member is shown the list', OL, "  const refused = !!o && !canEditSched()\n", "  const refused = false\n", HOL],
  ['B81 a second press does not un-pick', OL, "[iid]: p[iid] === v ? undefined : v", "[iid]: v", HOL],
  ['B82 "is now a public holiday" shows from the bell too', OL, "      {fresh && <p className=\"odl-lead\"", "      {true && <p className=\"odl-lead\"", HOL],
  ['B83 Later saves', OL, "data-testid=\"odl-later\" onClick={close}", "data-testid=\"odl-later\" onClick={save}", HOL],
  ['B84 the cards are in filing order, not the day\'s', OL,
    "  const rows = found.slice().sort((x, y) => order.indexOf(x.r) - order.indexOf(y.r))\n", "  const rows = found\n", HOL],
  ['B85 Save is live with nothing picked', OL, "disabled={!done}", "disabled={false}", HOL],
  ['B86 a card\'s name does not open the input', OL, "onOpen={() => openInput(r)}", "onOpen={() => {}}", HOL],
  ['B87 "Yes to all" picks nothing', OL, "onClick={() => all('y')}", "onClick={() => {}}", HOL],
  ['B88 the card\'s own buttons are not drawn', 'src/ui/InputCard.tsx', "          {action && <span className=\"icard-act\">{action}</span>}\n", "", HOL],
  /* ---- the walk's fixes (13 Oct 26) ---- */
  ['B89 the admin\'s member view shows the holiday line (the walk\'s E8)', N, "  if (!mayEditSched()) return false\n", "", HOL],
  ['B90 "Mark all read" reads a line that is not shown', 'src/state/noticeseen.ts', "(noticeLive(x) || cur.ids.includes(x.id))", "(true)", HOL],
  ['B91 a passing note lands on the bar that stays (the walk\'s C3)', 'src/ui/toast.ts',
    "t.style.bottom=up?'auto':bar?`${18+(bar.offsetHeight||50)+8}px`:'26px';", "t.style.bottom=up?'auto':'26px';", DOOR],
  ['B92 a note already showing is left on the bar when it arrives', SH, "  useEffect(() => { if (up) placeToast() }, [up])\n", "", DOOR],
  ['B93 the Unavailable row: the seat he was dragged from does not flash (the walk\'s C2)', D,
    "    if (DRAG.kind === 'slot' && view.OILWAIT && view.OILWAIT !== waited) oilWaitAlso(DRAG.key)\n", "", DOOR],
]

let red = 0, green = 0, skip = 0
const ONLY = process.argv[2] ? new RegExp(process.argv[2]) : null   // e.g. "^B(8|9|26) " — run only these
for (const [name, file, from0, to0, tests] of BREAKS) {
  if (ONLY && !ONLY.test(name)) continue
  const src = readFileSync(file, 'utf8')
  const crlf = src.includes('\r\n')
  const from = crlf ? from0.replace(/\n/g, '\r\n') : from0, to = crlf ? to0.replace(/\n/g, '\r\n') : to0
  if (src.split(from).length !== 2) { console.log(`SKIP   ${name} — the text to break is there ${src.split(from).length - 1} times in ${file}`); skip++; continue }
  writeFileSync(file, src.replace(from, () => to))
  let r
  try { r = spawnSync('npx', ['vitest', 'run', ...tests], { encoding: 'utf8', shell: true, timeout: 300000 }) }
  finally { writeFileSync(file, src) }
  const out = ((r.stdout || '') + (r.stderr || '')).replace(/\x1b\[[0-9;]*m/g, '')
  const failed = /Tests\s+\d+ failed/.test(out) || /Test Files\s+\d+ failed/.test(out)
  const n = (out.match(/Tests\s+(\d+) failed/) || [])[1] || '?'
  const which = (out.match(/^\s*(?:×|✗|FAIL) .*$/gm) || []).slice(0, 1).map(s => s.trim().slice(0, 200)).join(' | ')
  if (failed) { red++; console.log(`RED    ${name} — ${n} failed: ${which}`) }
  else { green++; console.log(`GREEN  ${name} — NOTHING went red in ${tests.join(', ')}: this wire has no test`) }
}
console.log(`\n${red} of ${red + green} breaks caught · ${green} not caught · ${skip} skipped`)
if (sh('git status --porcelain -- src').trim()) console.log('WARNING: src/ is not as it was — check `git status`')
process.exit(green || skip ? 1 : 0)
