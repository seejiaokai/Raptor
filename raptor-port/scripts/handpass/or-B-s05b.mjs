// B5 follow-up — right-click refusal read fresh; an input holding ALL AVAIL alone; the week's line after the X
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, saveJson, loadJson, errs,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, weekLines, drag2 } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText + ' [opacity ' + t.style.opacity + ']' : '' })
const waitQuiet = async p => { for (let i = 0; i < 30; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.opacity : '0' }); if (o !== '1') return; await p.waitForTimeout(500) } }
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
const f = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-17', to: '2026-07-17', timed: ['17:00', '18:00'] })
const iid = f[0].iid
await openBoard(p, DI)
let ri = await rowIdx(p, DI, iid)
await centre(boardRowEl(p, DI, ri)); await waitQuiet(p)
say('toast before right-click', await toastNow(p))
await boardRowEl(p, DI, ri).locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500)
say('b toast after right-click', await toastNow(p))
say('b input', (await inputOf(p, iid)).people)
await shot(p, 's05b-1-rightclick-refused')
/* the X, then the week's line */
await waitQuiet(p)
await p.locator(`#schedBoard [data-grdel="${DI}.${ri}"]:visible`).first().click(); await p.waitForTimeout(600)
await toWeek(p)
await weekLines(p, DI)
const ln = p.locator('#eWeek .day:not(.peek) .sec-inp .pl-row:visible').first()
await ln.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(300)
await shot(p, 's05b-2-week-line-after-x')
say('week line text', await ln.innerText().then(t => t.replace(/\s+/g, ' ')))
/* ALL AVAIL alone */
const g = await fileInput(p, { type: 'Meeting', people: [], ph: 'allavail', from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Crowd only' })
const jid = g[0].iid
say('filed', g)
await openBoard(p, DI)
const rj = await rowIdx(p, DI, jid)
const rowj = () => boardRowEl(p, DI, rj)
await centre(rowj()); await p.waitForTimeout(300)
await waitQuiet(p)
let m = await toastMark(p)
await rowj().locator('.puck', { hasText: 'Saber' }).first().click({ button: 'right' }); await p.waitForTimeout(600)
say('saber out toast', await toastsSince(p, m))
say('input now', (await inputOf(p, jid)).people)
say('row now', (await boardRowNames(p, DI, rj)).names)
await waitQuiet(p)
await centre(rowj()); await p.waitForTimeout(200)
m = await toastMark(p)
await drag2(p, rowj().locator('.puck').first(), { x: 420, y: 26 })
say('allavail drag-off toasts', await toastsSince(p, m)); say('toast now', await toastNow(p))
say('input after', (await inputOf(p, jid)).people)
say('row after', (await boardRowNames(p, DI, rj)).names)
await shot(p, 's05b-3-allavail-alone-refused')
/* and right-click on it too */
await waitQuiet(p)
m = await toastMark(p)
await rowj().locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500)
say('allavail right-click toast', await toastNow(p))
say('input after rc', (await inputOf(p, jid)).people)
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B5b = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
