/* WALKER G — X-04: a subject's own OIL answer changes only his entitlement. Starts from X-03's saved browser world
   (the Sat 18 Jul all-day shared duty, published, FO for Ranger, Piston, Blade). */
import * as G from './cal-G-lib.mjs'
import * as P6 from './p6-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
const { L, W, sleep } = G
G.setTag('x04')
const S = process.env.G_SCRATCH
const browser = await L.launch()
const ctx = await L.context(browser, { phone: G.PHONE, storageState: S + (G.PHONE ? '/x03-state-ph.json' : '/x03-state.json') })
const errors = []
const p = await L.page(ctx, errors)
await p.goto(G.BASE + '/')
await L.signIn(p, 'm', { goto: false })   // Ranger, a member
const IDS = ['bane', 'pump', 'slash']
const ALL = [...IDS, 'stiff']
const fmt = o => Object.entries(o).map(([k, v]) => `${k}: cell="${v.cell}" bal=${v.bal}`).join(' | ')
const recs = () => p.evaluate(() => window.INPUTS.filter(x => /X03 all-day/.test(x.remarks || '')).map(x => ({ who: window.PEOPLE[x.person].cs, oil: x.oil || null, acc: x.acc, grp: !!x.grp })))
console.log('start recs', JSON.stringify(await recs()))
const base = await G.lwOil(p, ALL, '2026-07-18'); await G.closeOilTracker(p)
console.log('BASE (as Ranger)', fmt(base))

/* ---- (a) the subject (Ranger, signed in as himself) declines his own claim ---- */
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
// a member sees everyone? make sure the 18th shows the entry
await G.openDay(p, '2026-07-18')
const f1 = await G.shot(p, 'ranger-opened-day')
const line = p.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').filter({ hasText: '+2' }).first()
console.log('lines on day', await p.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').allInnerTexts())
await line.click(); await p.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 }); await sleep(500)
const own = await p.locator('[data-testid="win-inputedit"] .inped-own').innerText().catch(() => 'NO OWN BOX')
const ro = await p.locator('[data-testid="inped-ro"]').innerText().catch(() => 'no ro')
const f2 = await G.shot(p, 'ranger-editor-own-oil')
console.log('RANGER editor own:', own.replace(/\s+/g, ' '), '| ro:', ro)
await p.locator('[data-testid="oil-revise-own"]').click(); await sleep(600)
const f3 = await G.shot(p, 'ranger-oil-sheet')
const said = await G.answerOil(p, 'no')
console.log('RANGER OIL sheet said:', said)
await sleep(500)
const f4 = await G.shot(p, 'ranger-after-no')
const recsA = await recs()
console.log('after Ranger No', JSON.stringify(recsA))
// close editor if still up
if (await p.locator('[data-testid="win-inputedit"]').count()) { const c = p.locator('#inpEditCancel'); if (await c.count()) { await c.click(); await sleep(300) } }
const afterNoLW = await G.lwOil(p, ALL, '2026-07-18'); const f5 = await G.shot(p, 'tracker-after-ranger-no-before-reissue'); await G.closeOilTracker(p)
console.log('LW after Ranger No, before any reissue (as Ranger)', fmt(afterNoLW))

/* ---- (b) the scheduler (Saber) looks at the day, re-signs, reissues ---- */
await W2.signOut(p); await L.signIn(p, 'a', { goto: false })
await G.toWeek(p, '13/07/2026'); await L.go(p, 'editsched'); await W.showDay(p, 5)
const h1 = await W.head(p, 5)
const f6 = await G.shot(p, 'sat-head-after-ranger-no')
console.log('SAT head after Ranger No', JSON.stringify(h1))
const lwPre = await G.lwOil(p, ALL, '2026-07-18'); await G.closeOilTracker(p)
console.log('LW (admin) before reissue', fmt(lwPre))
let h1b = null, f7 = null, lw1 = null, f8 = null
if (/pending/.test(h1.pending)) {
  await L.go(p, 'editsched'); await W.showDay(p, 5)
  const chg = await G.readChanges(p, 5, 'ranger-no')
  console.log('changes', JSON.stringify({ tabs: chg.tabs, out: chg.TogooutAL || chg.Togoout }))
  await W.signDay(p, 5); const pr = await W.publishAL(p, 5); await sleep(800)
  h1b = await W.head(p, 5); f7 = await G.shot(p, 'sat-head-after-AL1')
  console.log('AL publish', JSON.stringify(pr), JSON.stringify(h1b))
}
lw1 = await G.lwOil(p, ALL, '2026-07-18'); f8 = await G.shot(p, 'tracker-after-AL1'); await G.closeOilTracker(p)
console.log('LW after reissue 1', fmt(lw1))

/* ---- (c) the scheduler refuses ANOTHER person's credit (Piston) in OIL Earn mode ---- */
await L.go(p, 'editsched'); await W.showDay(p, 5)
await p.evaluate(() => window.openScheduler(5)); await p.waitForSelector('#schedBoard'); await sleep(800)
console.log('OIL btn', await P6.oilButton(L, p))
const pk = await P6.oilPucks(p)
console.log('OIL pucks', JSON.stringify(pk))
const f9 = await G.shot(p, 'board-oil-earn-mode')
const pu = pk.filter(x => x.who === 'pump')
let refused = null
if (pu.length) { console.log('tap', await P6.oilTap(L, p, 'pump', pu[0].item)); refused = await P6.oilPucks(p) ; console.log('after tap', JSON.stringify(refused.filter(x => x.who === 'pump' || x.who === 'bane' || x.who === 'slash'))) }
const f10 = await G.shot(p, 'board-oil-after-refuse')
await W.boardOff(p)
await L.go(p, 'editsched'); await W.showDay(p, 5)
const h2 = await W.head(p, 5); const f11 = await G.shot(p, 'sat-head-after-refuse')
console.log('SAT head after scheduler refusal', JSON.stringify(h2))
const recsB = await recs(); console.log('recs after refuse', JSON.stringify(recsB))
let h2b = null, lw2 = null, f12 = null
if (/pending/.test(h2.pending)) {
  await W.signDay(p, 5); const pr = await W.publishAL(p, 5); await sleep(800)
  h2b = await W.head(p, 5); console.log('AL2', JSON.stringify(pr), JSON.stringify(h2b))
}
lw2 = await G.lwOil(p, ALL, '2026-07-18'); f12 = await G.shot(p, 'tracker-after-refuse-AL2'); await G.closeOilTracker(p)
console.log('LW after refusal (+AL)', fmt(lw2))

/* ---- (d) the filer (Saber) answers Yes again for the whole entry ---- */
await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
await G.openDay(p, '2026-07-18')
await p.locator('[data-testid="win-inputsday"] [data-testid="idy-open"]').filter({ hasText: '+2' }).first().click()
await p.locator('[data-testid="win-inputedit"]').waitFor(); await sleep(500)
const f13 = await G.shot(p, 'saber-editor-before-yes')
console.log('SABER editor OIL box:', (await p.locator('[data-testid="win-inputedit"] .inped-oil').allInnerTexts()).join(' // ').replace(/\s+/g, ' '))
await p.locator('[data-testid="oil-revise"]').click(); await sleep(600)
const f14 = await G.shot(p, 'saber-oil-sheet')
const said2 = await G.answerOil(p, 'yes'); console.log('SABER OIL sheet said', said2)
await sleep(600)
if (await p.locator('[data-testid="win-inputedit"]').count()) { const sv = p.locator('#inpEditSave'); if (await sv.count()) { await sv.click(); await sleep(700); await G.answerOil(p, 'yes') } }
const f15 = await G.shot(p, 'saber-after-yes')
const recsC = await recs(); console.log('recs after filer Yes', JSON.stringify(recsC))
await L.go(p, 'editsched'); await W.showDay(p, 5)
const h3 = await W.head(p, 5); const f16 = await G.shot(p, 'sat-head-after-filer-yes')
console.log('SAT head after filer Yes', JSON.stringify(h3))
let h3b = null
if (/pending/.test(h3.pending)) {
  await W.signDay(p, 5); const pr = await W.publishAL(p, 5); await sleep(800)
  h3b = await W.head(p, 5); console.log('AL3', JSON.stringify(pr), JSON.stringify(h3b))
}
const lw3 = await G.lwOil(p, ALL, '2026-07-18'); const f17 = await G.shot(p, 'tracker-after-filer-yes'); await G.closeOilTracker(p)
const f17b = await G.shot(p, 'lw-grid-after-filer-yes')
console.log('LW after filer Yes (+AL)', fmt(lw3))
await G.reload(p)
const lw3r = await G.lwOil(p, ALL, '2026-07-18'); await G.closeOilTracker(p)
console.log('LW after reload', fmt(lw3r))
G.saveRows('x04-raw')
console.log('RESULT recs', JSON.stringify({ start: 'all 1', A: recsA, B: recsB, C: recsC }))
console.log('errors', JSON.stringify(errors))
await browser.close()
