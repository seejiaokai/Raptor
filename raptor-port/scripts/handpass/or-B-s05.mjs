// B5 — the last one
import { launch, openWorld, fileInput, shot, rowIdx, rowData, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs, csId,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, weekLines, weekRowNames, drag2, inputsSurf, closeDayWin, listRow } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
const f = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-17', to: '2026-07-17', timed: ['17:00', '18:00'] })
const iid = f[0].iid
say('filed', f)
await openBoard(p, DI)
let ri = await rowIdx(p, DI, iid)
const snap = async (tag) => { const s = { input: (await inputOf(p, iid))?.people, row: (await boardRowNames(p, DI, ri))?.names }; say(tag, s); return s }
const row = () => boardRowEl(p, DI, ri)
await centre(row()); await p.waitForTimeout(300)
const b0 = await snap('start')
/* a — drag Ranger's puck to empty space */
let m = await toastMark(p)
await drag2(p, row().locator('.puck').first(), { x: 420, y: 26 })
say('a toasts', await toastsSince(p, m)); say('a toast now', await toastNow(p))
const a1 = await snap('a after drag-off'); say('a changed', JSON.stringify(b0) !== JSON.stringify(a1))
await shot(p, 's05-1-dragoff-refused')
/* b — right-click */
await centre(row()); await p.waitForTimeout(300)
m = await toastMark(p)
await row().locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(600)
say('b toasts', await toastsSince(p, m)); say('b toast now', await toastNow(p))
const b1 = await snap('b after right-click'); say('b changed', JSON.stringify(b0) !== JSON.stringify(b1))
await shot(p, 's05-2-rightclick-refused')
/* c — the row's X */
m = await toastMark(p)
const x = p.locator(`#schedBoard [data-grdel="${DI}.${ri}"]:visible`).first()
say('x count', await x.count())
await centre(x); await x.click(); await p.waitForTimeout(700)
say('c toasts', await toastsSince(p, m)); say('c toast now', await toastNow(p))
say('c ground rows for input', await p.evaluate(([di, id]) => window.DAYS[di].ground.filter(g => g.src === id).length, [DI, iid]))
say('c input', await inputOf(p, iid))
say('c board lines', await boardLines(p, DI))
await p.locator('#schedBoard .pinp').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
await shot(p, 's05-3-after-x-board-line')
await toWeek(p)
say('c week lines', await weekLines(p, DI));
const fo = p.locator(`#eWeek .day:not(.peek) .sec-inp`).nth(DI); await centre(fo.first()).catch(() => {}); await shot(p, 's05-4-after-x-week-line')
const sf = await inputsSurf(p, iid, '2026-07-17'); say('c card', sf); await shot(p, 's05-5-card-after-x')
await closeDayWin(p)
say('c list', await listRow(p, iid))
/* d — Accept */
await openBoard(p, DI)
await boardLines(p, DI)
const acc = p.locator('#schedBoard .pinp [data-acc="a"], #schedBoard .pinp .accb:visible, #schedBoard .pinp button:has-text("Accept"):visible').first()
say('accept count', await acc.count())
say('accept text', await acc.innerText().catch(() => null))
await centre(acc); m = await toastMark(p)
await acc.click(); await p.waitForTimeout(700)
say('d toasts', await toastsSince(p, m))
ri = await rowIdx(p, DI, iid)
say('d ri', ri)
say('d row', ri >= 0 ? await boardRowNames(p, DI, ri) : null)
say('d input', await inputOf(p, iid))
if (ri >= 0) { await centre(row()); await shot(p, 's05-6-after-accept') }
/* e — an input holding ALL AVAIL alone */
const g = await fileInput(p, { type: 'Meeting', people: [], ph: 'allavail', from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Crowd only' })
say('e filed', g)
const jid = g[0] && g[0].iid
if (jid) {
  await openBoard(p, DI)
  const rj = await rowIdx(p, DI, jid)
  say('e row idx', rj)
  say('e input', await inputOf(p, jid))
  const rowj = boardRowEl(p, DI, rj); await centre(rowj); await p.waitForTimeout(300)
  say('e row', await boardRowNames(p, DI, rj))
  m = await toastMark(p)
  await drag2(p, rowj.locator('.puck').first(), { x: 420, y: 26 })
  say('e toasts', await toastsSince(p, m)); say('e toast now', await toastNow(p))
  say('e input after', await inputOf(p, jid))
  say('e row after', await boardRowNames(p, DI, rj))
  await shot(p, 's05-7-allavail-alone-refused')
}
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B5 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
