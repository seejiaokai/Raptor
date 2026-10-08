/* WALKER G — X-01 and X-02 (a shared input on a published day; moved and deleted) */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x0102')
const { browser, p, errors } = await G.world({ who: 'a' })
const IDS = ['dj', 'nact', 'prowler'] // Ace, Warden, Hunter
const HEAD = async (di, label, pic = true) => {
  await L.go(p, 'editsched'); await W.showDay(p, di)
  const h = await W.head(p, di)
  const f = pic ? await G.shot(p, `${label}-head-di${di}`) : null
  return { h, f }
}
const fig = h => `ver=${h.tag} chip="${h.pending}" signs=[${h.signs.join('|')}] line="${h.signed}" nys="${h.nys}" publishBtn=${h.beak}/${h.alpub}`

/* ---------------- setup: publish 23 July (Thu, day 3 of the week of 20 Jul), four sign-offs ---------------- */
await G.toWeek(p, '20/07/2026'); await L.go(p, 'editsched'); await W.showDay(p, 3)
const h0 = await W.head(p, 3)
const s = await W.signDay(p, 3)
const pubr = await W.publishDay(p, 3)
await sleep(600)
await G.reload(p); await G.toWeek(p, '20/07/2026')
let { h: h1, f: f1 } = await HEAD(3, 'x01-published-clean')
console.log('X01 setup: before', fig(h0), '| signed', JSON.stringify(s), '| publish', JSON.stringify(pubr), '| after reload', fig(h1))
const viewBefore = await G.viewDayText(p, 3)
await G.shot(p, 'x01-viewonly-before')
await L.go(p, 'editsched'); await W.showDay(p, 3)
await L.go(p, 'editsched'); await W.showDay(p, 3)
const chg0 = await G.readChanges(p, 3, 'x01-before').catch(e => ({ err: String(e) }))
console.log('X01 changes window before (clean):', JSON.stringify(chg0).slice(0, 700))

/* ---------------- X-01 action: file ONE shared input for three people on the published day ---------------- */
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
const had = await G.iidsNow(p)
await G.openDay(p, '2026-07-23')
const f2 = await G.shot(p, 'x01-day-before-filing')
await G.plusInput(p)
await G.fillShared(p, { type: 'Meeting', ids: IDS, allday: false, start: '10:00', end: '11:00', remarks: 'X01 shared brief' })
const f3 = await G.shot(p, 'x01-editor-filled')
await p.click('#inpEditSave'); await sleep(900)
const oilSaid = await G.answerOil(p, 'yes')
await sleep(500)
const made = await G.inputsAfter(p, had)
console.log('X01 made', JSON.stringify(made))
const f4 = await G.shot(p, 'x01-inputs-month-after')
const bars = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /X01|Meeting/.test(t)))
const barsWith2 = await p.locator('#inpCal .ib-bar').filter({ hasText: '+2' }).count()
console.log('X01 bars', JSON.stringify(bars), 'with +2:', barsWith2)
// the opened day
await G.openDay(p, '2026-07-23')
const dayLines = await p.locator('[data-testid="idy-row-' + (made[0] ? '' : '') + '"]').count().catch(() => 0)
const dayText = await p.locator('[data-testid="win-inputsday"]').innerText()
const f5 = await G.shot(p, 'x01-opened-day-after')
console.log('X01 opened day:', dayText.replace(/\s+/g, ' ').slice(0, 600))
// the Edit Schedule side
const A = await HEAD(3, 'x01-working-copy-after')
console.log('X01 working copy after:', fig(A.h))
const chg1 = await G.readChanges(p, 3, 'x01-after')
console.log('X01 changes window after:', JSON.stringify(chg1, null, 0).slice(0, 2500))
const viewAfter = await G.viewDayText(p, 3)
await G.shot(p, 'x01-viewonly-after')
console.log('X01 view-only face unchanged:', viewBefore === viewAfter, viewBefore === viewAfter ? '' : '\nBEFORE: ' + viewBefore.slice(0, 600) + '\nAFTER: ' + viewAfter.slice(0, 600))
// reload checkpoint + sign out/in
await G.reload(p); await G.toWeek(p, '20/07/2026')
const R1 = await HEAD(3, 'x01-after-reload')
console.log('X01 after reload:', fig(R1.h))
const AL = { }
await W.signDay(p, 3)
const pubAL = await W.publishAL(p, 3); await sleep(700)
const hAL = await HEAD(3, 'x01-after-AL')
console.log('X01 publish AL:', JSON.stringify(pubAL), fig(hAL.h))
await G.reload(p); await G.toWeek(p, '20/07/2026')
const hALr = await HEAD(3, 'x01-after-AL-reload')
console.log('X01 after AL + reload:', fig(hALr.h))
const viewAL = await G.viewDayText(p, 3)
await G.shot(p, 'x01-viewonly-after-AL')
console.log('X01 view-only after AL differs from before (should now carry the meeting):', viewAL !== viewBefore, '| mentions X01/Meeting?', /X01|Meeting/i.test(viewAL))
G.row('X-01',
  'Published Thu 23 Jul (four sign-offs), reloaded; Inputs month > 23 Jul > + Input > Several people (Ace, Warden, Hunter) > Meeting 10:00-11:00 > Add; read Edit Schedule day head, changes window, View-only Sched; reload; Publish AL',
  `clean: ${fig(h1)} | after filing: Inputs bars ${JSON.stringify(bars)} (+2 bar count ${barsWith2}); records made ${made.length} grp=${made.map(m => m.grp).join(',')}; working copy ${fig(A.h)}; changes tabs ${JSON.stringify(chg1.tabs)}; view-only unchanged=${viewBefore === viewAfter}; after reload ${fig(R1.h)}; after AL ${fig(hAL.h)}`,
  (made.length === 3 && barsWith2 === 1 && /^3 pending/.test(A.h.pending) && A.h.nys === 'Not yet signed' && viewBefore === viewAfter && (chg1.Allchanges_item || []).some(t => /Meeting . 3 people/.test(t)) && (chg1.TogooutAL || []).filter(t => /Meeting$/.test(t)).length === 3 && !/pending/.test(hAL.h.pending)) ? 'PASS' : 'FAIL', [f1, f2, f3, f4, f5, A.f, ...(chg1.pics || []), R1.f, hAL.f], { clean: h1, after: A.h, afterReload: R1.h, afterAL: hAL.h, tabs: chg1.tabs, changes: chg1, made, bars, viewUnchanged: viewBefore === viewAfter })
G.saveRows('x0102-part1')

/* ---------------- X-02: move and delete a published shared input ---------------- */
G.setTag('x02')
// the clean destination day: Wed 22 (day 2), published with four sign-offs
await L.go(p, 'editsched'); await W.showDay(p, 2)
const d2h0 = await W.head(p, 2)
await W.signDay(p, 2); await W.publishDay(p, 2); await sleep(600)
const D2 = await HEAD(2, 'x02-dest-published')
const D3 = await HEAD(3, 'x02-source-published')
console.log('X02 baseline: dest(22)', fig(D2.h), '| source(23)', fig(D3.h))
// drag the shared bar from 23 to 22
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
const bar = p.locator('#inpCal .ib-bar').filter({ hasText: '+2' }).first()
await bar.scrollIntoViewIfNeeded()
const bb = await bar.boundingBox()
const cell = async iso => { const r = await p.locator(`[data-icday="${iso}"]`).boundingBox(); return r }
const c22 = await cell('2026-07-22')
const sx = bb.x + bb.width / 2, sy = bb.y + bb.height / 2
const tx = c22.x + c22.width / 2
await p.mouse.move(sx, sy); await p.mouse.down()
await p.mouse.move(sx - 12, sy + 3, { steps: 4 })
const midway = await G.shot(p, 'x02-drag-midway')
await p.mouse.move(tx, sy + 4, { steps: 10 }); await sleep(200)
const midway2 = await G.shot(p, 'x02-drag-over-22')
await p.mouse.up(); await sleep(1000)
const after = await p.evaluate(() => window.INPUTS.filter(x => x.grp && /X01/.test(x.remarks || '')).map(x => ({ p: x.person, date: x.date })))
console.log('X02 records after the drag', JSON.stringify(after))
const fM = await G.shot(p, 'x02-month-after-drag')
const S3 = await HEAD(3, 'x02-source-after-move')
const S2 = await HEAD(2, 'x02-dest-after-move')
console.log('X02 after move: source(23)', fig(S3.h), '| dest(22)', fig(S2.h))
await L.go(p, 'editsched'); await W.showDay(p, 3)
const c3 = await G.readChanges(p, 3, 'x02-src-move')
await W.showDay(p, 2)
const c2 = await G.readChanges(p, 2, 'x02-dst-move')
console.log('X02 changes src:', JSON.stringify({ tabs: c3.tabs, out: c3.Togoout }), '\nX02 changes dst:', JSON.stringify({ tabs: c2.tabs, out: c2.Togoout }))
// Undo
const un = await G.undo(p)
console.log('X02 undo:', JSON.stringify(un))
const U3 = await HEAD(3, 'x02-source-after-undo'), U2 = await HEAD(2, 'x02-dest-after-undo')
console.log('X02 after Undo: source(23)', fig(U3.h), '| dest(22)', fig(U2.h))
const afterUndo = await p.evaluate(() => window.INPUTS.filter(x => x.grp && /X01/.test(x.remarks || '')).map(x => ({ p: x.person, date: x.date })))
console.log('X02 records after undo', JSON.stringify(afterUndo))
// delete with confirmation, from the opened day 23
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
await G.openDay(p, '2026-07-23')
const line = p.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').filter({ hasText: 'Meeting' })
const nLines = await line.count()
console.log('X02 meeting lines on 23rd', nLines)
// pick the shared line (+2)
const shared = p.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').filter({ hasText: '+2' }).first()
await shared.focus(); await p.keyboard.press('Delete'); await sleep(500)
const askText = await p.locator('[data-testid="idy-ask"]').innerText().catch(() => 'NO ASK')
const fAsk = await G.shot(p, 'x02-delete-ask')
console.log('X02 delete ask:', askText.replace(/\s+/g, ' '))
await p.locator('[data-testid="idy-del-yes"]').click(); await sleep(900)
const gone = await p.evaluate(() => window.INPUTS.filter(x => x.grp && /X01/.test(x.remarks || '')).length)
const fDel = await G.shot(p, 'x02-month-after-delete')
const X3 = await HEAD(3, 'x02-source-after-delete'), X2 = await HEAD(2, 'x02-dest-after-delete')
console.log('X02 after delete: source(23)', fig(X3.h), '| dest(22)', fig(X2.h), '| records left', gone)
await L.go(p, 'editsched'); await W.showDay(p, 3)
const cd = await G.readChanges(p, 3, 'x02-src-delete')
console.log('X02 changes after delete:', JSON.stringify({ tabs: cd.tabs, out: cd.TogooutAL }))
const nonePend = h => !/pending/.test(h.pending) && h.nys === ''
const same = (a, b) => JSON.stringify(a.signs) === JSON.stringify(b.signs) && a.line === b.line && a.tag === b.tag
const okMove = /^3 pending/.test(S3.h.pending) && /^3 pending/.test(S2.h.pending) && (c3.TogooutAL || []).filter(t => /Meeting$/.test(t)).length === 3 && (c2.TogooutAL || []).filter(t => /Meeting$/.test(t)).length === 3
const okUndo = nonePend(U3.h) && nonePend(U2.h) && same(U3.h, D3.h) && same(U2.h, D2.h)
const okDel = /^3 pending/.test(X3.h.pending) && nonePend(X2.h) && gone === 0 && (cd.TogooutAL || []).filter(t => /Meeting$/.test(t)).length === 3
G.row('X-02', 'Published 22 Jul clean and 23 Jul (with the 3-person meeting via AL1); Inputs month: real mouse drag of the shared bar from 23 to 22; read both days; Undo (top bar); then 23 Jul opened day > Delete key on the shared line > confirm "Delete this input for all 3 people?"',
  `baseline src(23) ${fig(D3.h)}; dest(22) ${fig(D2.h)} | MOVE: records now on ${JSON.stringify(after)}; src ${fig(S3.h)} ; dest ${fig(S2.h)} ; src To-go-out lines ${JSON.stringify(c3.TogooutAL)} ; dest To-go-out lines ${JSON.stringify(c2.TogooutAL)} | UNDO ('${un.title}'): src ${fig(U3.h)} ; dest ${fig(U2.h)} ; records ${JSON.stringify(afterUndo)} | DELETE ask "${askText.replace(/\s+/g, ' ')}": src ${fig(X3.h)} ; dest ${fig(X2.h)} ; records left ${gone} ; To-go-out ${JSON.stringify(cd.TogooutAL)}`,
  (okMove && okUndo && okDel) ? 'PASS' : 'FAIL', ['x02-dk-023', 'x02-dk-024', 'x02-dk-025', 'x02-dk-026', 'x02-dk-027', 'x02-dk-028', 'x02-dk-029', 'x02-dk-034', 'x02-dk-039', 'x02-dk-040', 'x02-dk-041', 'x02-dk-042', 'x02-dk-044', 'x02-dk-050'].map(x => x),
  { okMove, okUndo, okDel })
G.saveRows('x0102-part2')
console.log('errors', JSON.stringify(errors))
await browser.close()
