// B7 — leave to a seat; move between inputs; join from a seat
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, openBoard, centre, weekRowEl, weekRowNames, weekLines, drag3 } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 3
const cs = id => p.evaluate(id => (window.PEOPLE[id] || {}).cs || id || '', id)
const seatMan = async (s) => p.evaluate(s => { const a = window.DAYS[3].waves[0].formations[0].aircraft[0]; return (window.PEOPLE[a[s]] || {}).cs || null }, null).catch(() => null)
const seats = () => p.evaluate(() => { const a = window.DAYS[3].waves[0].formations[0].aircraft[0]; const c = id => (window.PEOPLE[id] || {}).cs || id || null; return { p: c(a.p), w: c(a.w) } })
const deskMan = () => p.evaluate(() => { const r = window.DAYS[3].dutywaves[0].rows[0]; return (window.PEOPLE[r.id] || {}).cs || r.id || null })
await toWeek(p)
say('seats before', await seats())
/* free the two seats of Thu wave 1 VL aircraft 1, by right-click on each puck */
for (const s of ['p', 'w']) {
  const pk = p.locator(`#eWeek .day:not(.peek) [data-slot="3.0.0.0.${s}"] .puck`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(300)
  await pk.click({ button: 'right' }); await p.waitForTimeout(600)
}
say('seats after right-click', await seats())
say('toast', await toastNow(p))
/* the inputs */
const mt = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-16', to: '2026-07-16', timed: ['20:00', '21:00'], title: 'Kit check' })
const tr = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['17:00', '18:00'] })
const mid = mt[0].iid, tid = tr[0].iid
say('filed', [mt, tr])
await toWeek(p)
let rm = await rowIdx(p, DI, mid), rt = await rowIdx(p, DI, tid)
say('rows', [rm, rt])
const st = async tag => { rm = await rowIdx(p, DI, mid); rt = await rowIdx(p, DI, tid); const o = { meeting: (await inputOf(p, mid)).people, training: (await inputOf(p, tid)).people, mRow: rm >= 0 ? (await weekRowNames(p, DI, rm))?.names : null, tRow: rt >= 0 ? (await weekRowNames(p, DI, rt))?.names : null, seats: await seats(), desk: await deskMan() }; say(tag, o); return o }
await st('start')
const pkOf = (ri, name) => weekRowEl(p, DI, ri).locator('.puck', { hasText: name }).first()
/* (a) Hunter -> empty seat p */
await centre(weekRowEl(p, DI, rm)); await shot(p, 's07-1-before-a')
let m = await toastMark(p)
await drag3(p, pkOf(rm, 'Hunter'), p.locator(`#eWeek .day:not(.peek) [data-slot="3.0.0.0.p"]`).first())
say('a toasts', await toastsSince(p, m))
const a1 = await st('a after')
await p.locator(`#eWeek .day:not(.peek) [data-slot="3.0.0.0.p"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await shot(p, 's07-2-after-a')
await undoRedo(p, 'undo'); say('a undo toast', await toastNow(p)); await st('a after ONE undo')
await undoRedo(p, 'redo'); say('a redo toast', await toastNow(p)); await st('a after redo')
/* (b) lone Ranger from Training -> empty seat w */
rt = await rowIdx(p, DI, tid)
const b0 = await st('b before')
m = await toastMark(p)
await drag3(p, pkOf(rt, 'Ranger'), p.locator(`#eWeek .day:not(.peek) [data-slot="3.0.0.0.w"]`).first())
say('b toasts', await toastsSince(p, m)); say('b toast now', await toastNow(p))
const b1 = await st('b after')
say('b unchanged', JSON.stringify(b0) === JSON.stringify(b1))
await shot(p, 's07-3-after-b')
/* (c) Drifter Meeting row -> Training row */
rm = await rowIdx(p, DI, mid); rt = await rowIdx(p, DI, tid)
await centre(weekRowEl(p, DI, rm)); await p.waitForTimeout(200)
m = await toastMark(p)
await drag3(p, pkOf(rm, 'Drifter'), pkOf(rt, 'Ranger'))
say('c toasts', await toastsSince(p, m))
await st('c after')
await shot(p, 's07-4-after-c')
await undoRedo(p, 'undo'); say('c undo toast', await toastNow(p)); await st('c after ONE undo')
await undoRedo(p, 'redo'); say('c redo toast', await toastNow(p)); await st('c after redo')
/* (d) Ridge from the duty desk -> Meeting row */
rm = await rowIdx(p, DI, mid)
const desk = p.locator(`#eWeek .day:not(.peek) [data-slot="d:3.0.0"] .puck`).first()
say('desk puck', await desk.count())
say('desk man before', await deskMan())
await centre(weekRowEl(p, DI, rm)); await p.waitForTimeout(200)
m = await toastMark(p)
await drag3(p, desk, pkOf(rm, 'Ranger').or(weekRowEl(p, DI, rm).locator('.puck').first()).first())
say('d toasts', await toastsSince(p, m))
await st('d after')
await shot(p, 's07-5-after-d')
await undoRedo(p, 'undo'); say('d undo toast', await toastNow(p)); await st('d after undo')
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B7 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
