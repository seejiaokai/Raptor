// B7(d) — join from a duty desk onto a row of several
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, centre, weekRowEl, weekRowNames, drag3 } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 3
const deskMan = () => p.evaluate(() => { const r = window.DAYS[3].dutywaves[0].rows[0]; return (window.PEOPLE[r.id] || {}).cs || r.id || null })
const mt = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-16', to: '2026-07-16', timed: ['20:00', '21:00'], title: 'Kit check' })
const mid = mt[0].iid
await toWeek(p)
let rm = await rowIdx(p, DI, mid)
const st = async tag => { const o = { meeting: (await inputOf(p, mid)).people, mRow: (await weekRowNames(p, DI, rm))?.names, desk: await deskMan() }; say(tag, o); return o }
await st('start')
const desk = p.locator(`#eWeek .day:not(.peek) [data-slot="d:3.0.0"] .puck`).first()
await centre(weekRowEl(p, DI, rm)); await shot(p, 's07b-1-before')
let m = await toastMark(p)
await drag3(p, desk, weekRowEl(p, DI, rm).locator('.puck', { hasText: 'Hunter' }).first())
say('d toasts', await toastsSince(p, m))
await st('d after')
await centre(weekRowEl(p, DI, rm)); await shot(p, 's07b-2-after')
say('desk puck still drawn', await p.locator(`#eWeek .day:not(.peek) [data-slot="d:3.0.0"] .puck`).count())
await undoRedo(p, 'undo'); say('undo toast', await toastNow(p)); await st('after undo')
await undoRedo(p, 'redo'); say('redo toast', await toastNow(p)); await st('after redo')
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B7b = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
