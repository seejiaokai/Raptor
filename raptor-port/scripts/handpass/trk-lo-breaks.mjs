/* The Tracker leftovers' BREAK TESTS (bug-check order §8.4, 28 Sep 26): for every wire the
   roll-call marks as built, break it ONCE on purpose, run the test that names it, and require
   RED; then put the line back and require the file byte-identical. A surface whose break stays
   green has no test, by proof. Runs vitest on ONE file per break (no PC lock needed).

     node scripts/handpass/trk-lo-breaks.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const T = 'src/tracker/leftovers.test.tsx'
const BREAKS = [
  ['B1 the queue', 'src/tracker/app/core.js', 'if (dlg || _dlgQueue.length) { _dlgQueue.push({ shape, res }); return; }', '', 'WAITS for it'],
  ['B1 the end of a session cancels the waiting', 'src/tracker/app/core.js', 'for (const q of waiting) q.res(_dlgCancelled(q.shape));', '', 'none reaches the next person'],
  ['B1 the door (inert)', 'src/tracker/components/Modals.jsx', "el.setAttribute('inert', ''); marked.push(el);", '', 'door behind the question'],
  ['B1 the Tab wrap', 'src/tracker/components/Modals.jsx', "e.preventDefault(); (e.shiftKey ? last : first).focus();", '', 'door behind the question'],
  ['B2 the text box', 'src/tracker/components/Modals.jsx', "if (e.key === 'Enter' && !isComposing(e)) ok();", "if (e.key === 'Enter') ok();", 'text box: a composing'],
  ['B2 the + Add search', 'src/tracker/components/Modals.jsx', "if (e.key !== 'Enter' || isComposing(e)) return;", "if (e.key !== 'Enter') return;", 'composing Enter neither picks'],
  ['B2 the Find box', 'src/tracker/components/Header.jsx', "if (e.key === 'Enter' && !isComposing(e)) {", "if (e.key === 'Enter') {", 'Find event box'],
  ['B2 Show All', 'src/tracker/components/ShowAllPanel.jsx', "(e.ctrlKey || e.metaKey) && !isComposing(e)", '(e.ctrlKey || e.metaKey)', 'Show All'],
  ['C5 the date box commits on leaving', 'src/tracker/components/DateBox.jsx', "onChange={e => { setWarn(''); setDraft(e.target.value); }}", "onChange={e => { setWarn(''); setDraft(e.target.value); onCommit(e.target.value); }}", 'saves only the 17th'],
  ['C5 the side panel uses it (Last Flown)', 'src/tracker/components/SidePanel.jsx', "<DateBox key={s + ':lastSyll'} id=\"lastSyll\" value={core.dates[s].lastSyll || ''} onCommit={v => core.setLastSyll(s, v)} />", "<input type=\"date\" id=\"lastSyll\" value={core.dates[s].lastSyll || ''} onChange={e => core.setLastSyll(s, e.target.value)} />", 'the roll-call: each side-panel'],
  ['C5 no step for the same day', 'src/tracker/app/core.js', "export async function setUpchit(s, v) { if (((dates[s] && dates[s].upchit) || '') === (v || '')) return;", 'export async function setUpchit(s, v) {', 'once per day typed'],
  ['C5 the pop-up re-dates on leaving', 'src/tracker/app/core.js', "  if (graded && popDoneDate !== doneDate(s, popId)) await setDoneDate(s, popId, popDoneDate);\n  return '';", "  return '';", 'slowly typed day re-dates'],
  ['D374 Last Flown refuses', 'src/tracker/app/core.js', "export async function setLastCurr(s, v) {\n  if (afterToday(v)) return NOT_YET;", 'export async function setLastCurr(s, v) {', 'both Last Flown boxes refuse'],
  ['D374 a grade on a future day', 'src/tracker/app/core.js', "  if (DONE.has(v)) { const p = popDayProblem(popDoneDate, popDonePartial); if (p) { popMsg = { where: 'done', text: p }; notify(); return; } }\n", '', 'a grade pressed on a future'],
  /* the walk's findings, walker b (28 Sep 26): a refused day is never recorded as today */
  ['F-b1 a refused Done on stays in its box', 'src/tracker/app/core.js', "    if (graded) { popDoneDate = doneDate(s, popId) || isoToday(); popDonePartial = false; }", "    popDoneDate = (graded && doneDate(s, popId)) || isoToday(); popDonePartial = false;", 'F-b1'],
  ['F-b2 a + on a refused Failed on', 'src/tracker/app/core.js', "  if (delta > 0) { const p = popDayProblem(popFailDate, popFailPartial); if (p) { popMsg = { where: 'fail', text: p }; notify(); return; } }\n", '', 'F-b2'],
  ['F-b3 a day not finished', 'src/tracker/app/core.js', "  if (partial || (v && !isWholeDay(v))) return NOT_WHOLE;\n", '', 'F-b3 — a half-typed'],
  ['F-b3 the part-typed flag read on leaving', 'src/tracker/app/core.js', "  if (partial) popDonePartial = true;   /* as popFailCommit */\n", '', 'caught as it is LEFT'],
  ['F-b4 the line goes with its day', 'src/tracker/components/DateBox.jsx', "  useEffect(() => { setWarn(''); }, [saved]);\n", '', 'F-b4'],
  ['F-b5 the N.A. words in the pop-up', 'src/tracker/app/core.js', "flashHint(t); popMsg = { where: 'fail', text: t }; notify(); return;", 'flashHint(t); return;', 'F-b5'],
  ['D374 a failure re-dated to the future', 'src/tracker/app/core.js', "if (!s || !marks[s] || !marks[s][id]) return;\n  if (afterToday(iso)) return NOT_YET;", 'if (!s || !marks[s] || !marks[s][id]) return;', 'failure re-dated to a day'],
  /* the order has ONE place, sortFails: read and every write go through it, so breaking one caller alone is
     masked by the others; break the place */
  ['D371 the order of the days', 'src/tracker/app/core.js', "    .sort((a, b) => (a.d && b.d) ? (a.d < b.d ? -1 : a.d > b.d ? 1 : a.i - b.i) : a.d ? -1 : b.d ? 1 : a.i - b.i)\n", '', 'the earlier DAY is the plain code'],
  ['D371 − takes the latest day', 'src/tracker/app/core.js', "let at = fd.length - 1; while (at >= 0 && !fd[at]) at--;", 'let at = fd.length - 1;', 'never takes the undated first'],
  ['D370 the card', 'src/tracker/components/SidePanel.jsx', ".filter(x => x.n > 0 && core.gradeOf(s, x.id) !== 'na')", '.filter(x => x.n > 0)', 'N.A. event’s failures'],
  ['D372 the pace is a step', 'src/tracker/app/core.js', "pushMarkUndo(s, 'the pace', 'epw'); ", '', 'pace change takes back the pace'],
  ['D372 a lull is a step', 'src/tracker/app/core.js', "  pushMarkUndo(s, 'the lull periods');   /* a period set or changed is one step (D372) */\n", '', 'lull period set, changed and removed'],
  ['D372 Copy to is one step', 'src/tracker/app/core.js', "  pushGroupUndo(picked, 'the lull periods');   /* ONE step for every student ticked (D372) */\n", '', 'Copy to… is ONE step'],
  ['D376 the pick is per person', 'src/tracker/app/core.js', "export function pickKey(k) { const w = whoamiId(); return w ? 'who:' + w + ':' + k : k; }", 'export function pickKey(k) { return k; }', 'admin’s pick is his'],
  ['D376 nobody with no session', 'src/tracker/peoplewire.ts', "if (HOOKS.whoami() === 'Unknown') return ''", '', 'NOBODY'],
  ['D376 no press while reloading', 'src/tracker/app/core.js', '  if (resuming) return;\n  /* a red failure tick', '  /* a red failure tick', 'grades nobody'],
  ['D376 + Add remembers', 'src/tracker/app/core.js', "    if (active) prefSet(pickKey('lastCrew:' + course), active);\n", '', 'Add remembers the student'],
  ['D376 an unsaved edit waits', 'src/tracker/app/core.js', '  if (sylDirty) return false;\n  resuming = true;', '  resuming = true;', 'unsaved chart edit is never replaced'],
  ['C6 the tick picks its student', 'src/tracker/app/core.js', "ev.target.closest('.wedge, .ftick')", "ev.target.closest('.wedge')", 'red failure tick picks'],
  ['C7 a new period opens on this month', 'src/tracker/app/core.js', '  else { const [y, m] = isoToday().split(\'-\').map(Number); calView = new Date(y, m - 1, 1); }', '', 'opens on THIS month'],
  ['C11 the list is live', 'src/tracker/components/Modals.jsx', 'const src = d && (d.listFn ? d.listFn() : d.list);', 'const src = d && d.list;', 'follows the roster'],
  ['C14 no words beside Save', 'src/tracker/app/core.js', "if (sylDirty && saveStat.cls !== 'err') return { text: '', title: '', cls: '' };", '', 'step aside'],
  ['D373 the fold row', 'src/tracker/components/ArrangeTools.jsx', "const then = f => () => { core.setToolsOpen(false); f(); };", 'const then = f => () => { f(); };', 'folded tool row'],
  /* the re-walk (28 Sep 26): the editing canvas follows its box — the turn re-fits it (walker c F1) and it is never taller than the box */
  ['D373 the canvas never taller than its box', 'src/tracker/app/core.js', 'h: Math.max(100, board.clientHeight - 24)', 'h: Math.max(300, board.clientHeight - 24)', 'never taller than its chart box'],
  ['D373 a redraw while editing sizes the canvas by the same rule', 'src/tracker/app/core.js', '  if (arrangeMode) { const cv = canvasSize(board); svgW = cv.w; svgH = cv.h; }', '  if (arrangeMode) { svgW = Math.max(300, board.clientWidth - 24); svgH = Math.max(300, board.clientHeight - 24); }', 'never taller than its chart box'],
  ['D373 a turn re-fits the canvas', 'src/tracker/app/core.js', '      ta = setTimeout(refitArrange, 150);', '', 'never taller than its chart box'],
  ['D373 Escape closes the set first', 'src/tracker/app/core.js', '  if (toolsOpen) { e.preventDefault(); toolsOpen = false; notify(); return; }\n', '', 'folded tool row'],
  ['E the bake keeps details off the base table', 'scripts/tracker/bake-lib.mjs', "for (const k of Object.keys(merged)) if ((merged[k] || '') !== (base[k] || '')) prof[k] = merged[k]", 'for (const k of Object.keys(merged)) prof[k] = merged[k]; Object.assign(out.EVENT_INFO, { [eid]: merged })', 'baking an exported chart'],
  ['E the bake refuses a student name', 'scripts/tracker/bake-lib.mjs', "if (leaked.length) throw new Error(", "if (false) throw new Error(", 'baking an exported chart'],
  /* the two final code reads (Fable and Astra, 28 Sep 26) */
  ['Fable F1 an undo closes the lull calendar', 'src/tracker/app/core.js', '  lullPick = null; lullCopy = null;\n  if (active !== s)', '  if (active !== s)', 'Fable F1'],
  ['Fable F1 no write past the end of the list', 'src/tracker/app/core.js', 'if (lullPick.index >= 0 && lullPick.index < lulls[s].length) lulls[s][lullPick.index]', 'if (lullPick.index >= 0) lulls[s][lullPick.index]', 'Fable F1'],
  ['Fable F2 each person’s own chart', 'src/tracker/app/core.js', '  if (__mySyl && sylSource(__mySyl)) plan.sylId = __mySyl;\n  else if (__lastS && restoreLastSyllabus) {', '  if (__lastS && restoreLastSyllabus) {', 'Fable F2'],
  ['Fable F2 the chart on screen is the saved chart', 'src/tracker/app/core.js', '  if (plan.sylId !== __storedSyl) await savePlan();\n', '', 'Fable F2'],
  ['Fable F3 Done on reads the box live', 'src/tracker/app/core.js', 'popDonePartial = !!partial;   /* the live reading, as popFailCommit */', 'if (partial) popDonePartial = true;', 'Fable F3'],
  ['Fable F3 Failed on reads the box live', 'src/tracker/app/core.js', '  popFailPartial = !!partial;\n', '  if (partial) popFailPartial = true;\n', 'Fable F3'],
  ['Fable F4 a pace never set is removed, not stored empty', 'src/tracker/app/core.js', '(pace[s] ? savePace(s) : delKey(kPace(course, s)))', 'savePace(s)', 'Fable F4'],
  ['Fable F5 the keyboard is not a turn', 'src/tracker/app/core.js', '      if (w === lastW && typing) return;\n', '', 'Fable F5'],
  ['Fable F6 an import stops when its session ends', 'src/tracker/app/core.js', '      if (ended()) return;   /* the session ended under a question: nothing more is asked (F6) */\n', '', 'Fable F6'],
  ['Astra F3 a draft resolved moves the person to their own place', 'src/tracker/app/core.js', '  if (ready && !bootError && whoamiId() !== pickOwner) resumeForPerson();\n', '', 'unsaved chart edit is never replaced'],
  ['Astra F1 the bake prunes a deleted ball’s details', 'scripts/tracker/bake-lib.mjs', "      for (const eid of Object.keys(kept)) if (!onChart.has(eid)) delete kept[eid]\n", '', 'a later bake'],
]
/* -t takes a REGULAR EXPRESSION: a plus sign or a bracket in a filter silently matches nothing, or crashes */
/* ONLY="name, name" runs just those (a re-check after a fix) */
const ONLY = (process.env.ONLY || '').split(',').map(x => x.trim()).filter(Boolean)
const rows = []
for (const [name, file, from, to, filter] of BREAKS) {
  if (ONLY.length && !ONLY.some(o => name.includes(o))) continue
  const p = resolve(ROOT, file)
  const before = readFileSync(p, 'utf8')
  const n = before.split(from).length - 1
  if (n !== 1) { rows.push({ name, pass: false, said: `the line to break is there ${n} times, not once` }); console.log(' SKIP  ' + name + ' — anchor x' + n); continue }
  writeFileSync(p, before.replace(from, to))
  let red = false, said = ''
  try {
    const r = spawnSync(process.execPath, [resolve(ROOT, 'node_modules/vitest/vitest.mjs'), 'run', T, '-t', filter], { cwd: ROOT, encoding: 'utf8' })
    const out = (r.stdout || '') + (r.stderr || '')
    const m = out.match(/Tests\s+([^\n]+)/)
    red = r.status !== 0 && /failed/.test(m ? m[1] : out)
    said = m ? m[1].trim() : out.slice(-300)
  } finally { writeFileSync(p, before) }
  const back = readFileSync(p, 'utf8') === before
  rows.push({ name, pass: red && back, said: (red ? 'RED: ' : 'STAYED GREEN: ') + said + (back ? '' : ' — FILE NOT RESTORED') })
  console.log((red && back ? ' PASS  ' : ' FAIL  ') + name + ' — ' + said)
}
mkdirSync(resolve(ROOT, 'docs/handpass/parts/trk-leftovers/walk'), { recursive: true })
writeFileSync(resolve(ROOT, 'docs/handpass/parts/trk-leftovers/walk/lo-breaks' + (ONLY.length ? '-recheck' : '') + '.json'), JSON.stringify(rows, null, 2))
const bad = rows.filter(r => !r.pass)
console.log(bad.length ? `\n${bad.length} not proven` : '\nEVERY WIRE HAS A RED TEST')
process.exit(bad.length ? 1 : 0)
