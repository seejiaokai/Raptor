/* THE HOST'S WALK OF "SWITCH TO THIS PLAN" SAYING WHAT IT LEFT TO ANSWER (owner D865; `[OIL-PLAN-SWITCH-UNASKED]`).
   Assertions of the RIGHT behaviour on the built app, with pictures; every fixture made by the app's own controls.
     P0 the fixture: Friday — "+ Alt Plan" first (Plan A, without the input), an input filed onto the live Plan B with no
        question (a working day), Friday published, then made a public holiday (its one list: "Later")
     P1 to Plan A by the plans menu: "Friday is now "Plan A". 2 differences from the Original are pending." (the holiday
        declared after publication is one — D2 — the row taken away the other); no list; the input is unfiled
     P2 back to Plan B by the plans menu: the note ends "1 input needs an OIL answer."; the day's one list opens with that
        input, headed as a public holiday, reachable; the input is on the programme again
     P3 the same two switches by the plan editor's "Select" (✎ in the plans menu): the same note; where the list opens,
        the editor closes so the list is in front and reachable (v2 — the first run found it under the editor's backdrop)
     P4 answered in the list; away and back again: no tail, no list
   Each door is walked from the week on a desktop and from the Scheduler Board on a phone (where the board covers the page).
   usage: DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-15-oil-plan-switch node scripts/handpass/ps-walk.mjs [phone|desk] */
import { L, rowOut, part, FRI, FRI_ISO, noteNow, rec, board, closeBoard, list, file, makeHoliday, closeWindows } from './ou-lib.mjs'
import { publish } from './lib.mjs'

console.log('ps-walk v2')
const SIZE = process.argv[2] === 'desk' ? 'desk' : 'phone', T = SIZE
const J = x => JSON.stringify(x)
const plans = p => p.evaluate(di => ({ live: window.curDraftId(di), all: window.dayDrafts(di).map(t => ({ id: t.id, name: t.name })) }), FRI)

const w = await L.world(SIZE), p = w.page, S = `P ${T}`
/* the door this size walks: the week's day head on a desktop, the Scheduler Board's sign strip on a phone */
const where = w.phone ? 'board' : 'week', scope = where === 'board' ? '#schedBoard' : '#eWeek'
const openMenu = async () => {
  if (where === 'board') await board(w, FRI)
  else { await closeBoard(w); if (await p.evaluate(() => window.CURPAGE) !== 'editsched') await L.go(w, 'editsched') }
  await p.locator(`${scope} [data-planmenu="${FRI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await L.sleep(400)
}
/** switch by the plans menu: tap the plan's own row */
const viaMenu = async id => { await openMenu(); await p.locator(`[data-plansel="${id}"]`).first().evaluate(e => e.click()); await L.sleep(700) }
/** switch by the plan editor: ✎ beside the plan in the menu, then "Select" — the editor stays open until "Done" */
const viaEditor = async id => {
  await openMenu()
  await p.locator(`[data-planedit="${id}"]`).first().evaluate(e => e.click()); await L.sleep(500)
  const sel = p.locator('#draftsModal button', { hasText: /^Select$/ }).first()
  if (!(await sel.count())) throw new Error('the plan editor offers no "Select"')
  await sel.evaluate(e => e.click()); await L.sleep(700)
}
const doneEditor = async () => { const d = p.locator('#draftsModal button', { hasText: /^Done$/ }); if (await d.count()) { await d.first().evaluate(e => e.click()); await L.sleep(300) } }

try {
  let A, B, X
  await part(w, S, 'P0 the fixture', '"+ Alt Plan" makes Plan A (live: Plan B); the input lands on Plan B with no question; Friday published; made a holiday, its list opens with the input', async () => {
    await openMenu()
    await p.locator('[data-plandup="1"]').first().evaluate(e => e.click()); await L.sleep(700)
    const pl = await plans(p)
    B = pl.live; A = (pl.all.find(t => t.id !== B) || {}).id
    X = await file(w, FRI_ISO, 'bane', 'Range brief')
    await board(w, FRI)
    const pub = await publish(p, FRI); await L.sleep(600)
    await closeBoard(w)
    const h = await makeHoliday(w, FRI_ISO)
    await L.pic(w, `P0-holiday-list-${T}`)
    if (await list(p)) { await w.press('[data-testid="odl-later"]'); await L.sleep(300) }
    await closeWindows(w)
    const x = await rec(p, X.id)
    rowOut(S, 'P0 the fixture', '"+ Alt Plan" makes Plan A (live: Plan B); the input lands on Plan B with no question; Friday published; made a holiday, its list opens with the input',
      `plans ${J(pl)}; asked at the filing: ${X.asked}; publish ${J(pub)}; the holiday's list ${J(h.list)}; the input ${J(x)}`,
      !!A && !!B && !X.asked && pub.published && !!h.list && h.list.ids.includes(X.id) && x.acc === 'g' && !x.oil)
  })
  await part(w, S, `P1 to Plan A by the plans menu (${where})`, 'the note "Friday is now "Plan A". 2 differences from the Original are pending." (the late holiday and the row); no list; the input unfiled', async () => {
    await viaMenu(A)
    const note = await noteNow(p), l = await list(p), x = await rec(p, X.id), pl = await plans(p)
    await L.pic(w, `P1-to-plan-a-${where}-${T}`)
    rowOut(S, `P1 to Plan A by the plans menu (${where})`, 'the note "Friday is now "Plan A". 2 differences from the Original are pending." (the late holiday and the row); no list; the input unfiled',
      `note "${note}"; a list: ${J(l)}; the input ${J(x)}; live ${pl.live}`,
      note === 'Friday is now "Plan A". 2 differences from the Original are pending.' && !l && x.acc !== 'g' && pl.live === A)
  })
  await part(w, S, `P2 back to Plan B by the plans menu (${where})`, 'the note ends "1 input needs an OIL answer."; the day\'s one list opens with that input, headed as a public holiday, reachable; the input on the programme again', async () => {
    await viaMenu(B)
    const note = await noteNow(p), l = await list(p), x = await rec(p, X.id)
    await L.pic(w, `P2-back-to-plan-b-${where}-${T}`)
    rowOut(S, `P2 back to Plan B by the plans menu (${where})`, 'the note ends "1 input needs an OIL answer."; the day\'s one list opens with that input, headed as a public holiday, reachable; the input on the programme again',
      `note "${note}"; the list ${J(l)}; the input ${J(x)}`,
      note === 'Friday is now "Plan B". 1 difference from the Original is pending. 1 input needs an OIL answer.' && !!l && l.ids.includes(X.id) && /Public holiday/.test(l.head) && l.reach === true && x.acc === 'g')
    if (l && l.noteOver) rowOut(S, 'P2b the note and the list\'s buttons', 'the passing note is not over the list\'s buttons', 'the note overlaps a button of the list while it shows', false)
    if (l) { await w.press('[data-testid="odl-later"]'); await L.sleep(300) }
    await closeWindows(w)
  })
  await part(w, S, `P3 the same by the plan editor's "Select" (${where})`, 'to Plan A: the pending sentence, no list, the editor stays; back to Plan B: the OIL tail, the list opens and the editor closes, the list reachable', async () => {
    const edOpen = () => p.evaluate(() => { const m = document.querySelector('#draftsModal'); return !!m && !m.hidden && !!m.getClientRects().length })
    await viaEditor(A)
    const n1 = await noteNow(p), l1 = await list(p), ed1 = await edOpen()
    await doneEditor()
    await viaEditor(B)
    const n2 = await noteNow(p), l2 = await list(p), ed2 = await edOpen()
    await L.pic(w, `P3-editor-select-${where}-${T}`)
    await doneEditor()
    rowOut(S, `P3 the same by the plan editor's "Select" (${where})`, 'to Plan A: the pending sentence, no list, the editor stays; back to Plan B: the OIL tail, the list opens and the editor closes, the list reachable',
      `to A: note "${n1}", a list ${J(l1)}, the editor open ${ed1}; to B: note "${n2}", the list ${J(l2)}, the editor open ${ed2}`,
      / 2 differences from the Original are pending\.$/.test(n1) && !l1 && ed1 && / 1 input needs an OIL answer\.$/.test(n2) && !!l2 && l2.ids.includes(X.id) && l2.reach === true && !ed2)
  })
  await part(w, S, 'P4 answered in the list; away and back again', 'the answer is written from the list; the switch back says nothing of OIL and opens no list', async () => {
    await w.press(`[data-testid="odl-yes-${X.id}"]`); await L.sleep(150)
    await w.press('[data-testid="odl-save"]'); await L.sleep(600)
    const gone = !(await list(p)), x1 = await rec(p, X.id)
    await closeWindows(w)
    await viaMenu(A)
    await viaMenu(B)
    const note = await noteNow(p), l = await list(p), x2 = await rec(p, X.id)
    await L.pic(w, `P4-answered-back-${where}-${T}`)
    rowOut(S, 'P4 answered in the list; away and back again', 'the answer is written from the list; the switch back says nothing of OIL and opens no list',
      `the list closed on Save: ${gone}; the input ${J(x1)}; back on Plan B: note "${note}", a list ${J(l)}; the input ${J(x2)}`,
      gone && !!x1.oil && x1.oil[FRI_ISO] != null && note === 'Friday is now "Plan B". 1 difference from the Original is pending.' && !l && x2.acc === 'g')
  })
} finally { await L.close(w) }
