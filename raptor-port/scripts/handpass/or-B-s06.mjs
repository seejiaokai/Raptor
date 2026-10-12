// B6 — people and marks survive the X
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, weekLines, weekRowNames, drag2, rosterPuckOf, inputsSurf, closeDayWin, listRow } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
const f = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Gear brief' })
const iid = f[0].iid
say('filed', f)
await openBoard(p, DI)
let ri = await rowIdx(p, DI, iid)
/* Tally from the schedule */
{ const row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
  const pk = await rosterPuckOf(p, '#sbRoster', 'Tally'); const m = await toastMark(p)
  await drag2(p, pk, row.locator('.puck', { hasText: 'Hunter' }).first()); say('Tally toast', await toastsSince(p, m)) }
const marks = async () => p.evaluate(([di, id]) => { const g = window.DAYS[di].ground.find(g => g.src === id); if (!g) return null; const x = window.INPUTS.find(i => i.iid === id); const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => e.offsetParent && e.querySelector(`[data-grflag]`) && e.querySelector('[data-bfld$=".prog"]')?.value?.toUpperCase().startsWith('GEAR BRIEF')); return { gKeys: Object.keys(g).join(','), info: g.info, flag: g.flag, red: g.red, box: g.box, cx: g.cx, inpKeys: Object.keys(x).join(','), inpInfo: x.info, inpFlag: x.flag, inpRed: x.red, rowCls: row ? row.className : null, btns: row ? [...row.querySelectorAll('.lctl button')].map(b => b.className + '|' + b.getAttribute('aria-pressed')) : null } }, [DI, iid])
say('marks 0', await marks())
say('board row (3 + Tally)', await boardRowNames(p, DI, ri))
/* red box and information only */
for (const sel of ['grflag', 'grinfo']) {
  await centre(boardRowEl(p, DI, ri)); const b = p.locator(`#schedBoard [data-${sel}="${DI}.${ri}"]:visible`).first()
  const m = await toastMark(p); await b.click(); await p.waitForTimeout(600); say(sel + ' toast', await toastsSince(p, m))
  say('marks after ' + sel, await marks())
}
const st = async tag => { ri = await rowIdx(p, DI, iid); const o = { ri, input: (await inputOf(p, iid)).people, row: ri >= 0 ? (await boardRowNames(p, DI, ri)).names : null, marks: await marks() }; say(tag, o); return o }
await centre(boardRowEl(p, DI, ri)); await shot(p, 's06-1-marks-set')
const s0 = await st('state before X')
/* X, then Accept */
await p.locator(`#schedBoard [data-grdel="${DI}.${ri}"]:visible`).first().click(); await p.waitForTimeout(700)
say('X toast', await toastNow(p))
await st('state after X')
say('lines after X', await boardLines(p, DI))
await p.locator('#schedBoard .pinp').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await shot(p, 's06-2-after-x')
const acc = p.locator('#schedBoard .pinp .accb:visible, #schedBoard .pinp button:has-text("Accept"):visible').first()
await acc.click(); await p.waitForTimeout(700)
say('accept toast', await toastNow(p))
const s1 = await st('state after Accept')
ri = await rowIdx(p, DI, iid); await centre(boardRowEl(p, DI, ri)); await shot(p, 's06-3-after-accept')
say('week row', (await toWeek(p), await weekRowNames(p, DI, ri)))
/* U/R of the X */
await openBoard(p, DI)
ri = await rowIdx(p, DI, iid)
await p.locator(`#schedBoard [data-grdel="${DI}.${ri}"]:visible`).first().click(); await p.waitForTimeout(700)
await st('2nd X')
const u = await undoRedo(p, 'undo'); say('undo toast', await toastNow(p))
const su = await st('after undo of X'); await centre(boardRowEl(p, DI, ri)); await shot(p, 's06-4-after-undo')
const rd = await undoRedo(p, 'redo'); say('redo toast', await toastNow(p))
await st('after redo of X')
say('lines after redo', await boardLines(p, DI))
/* accept again to leave it as before */
await p.locator('#schedBoard .pinp .accb:visible, #schedBoard .pinp button:has-text("Accept"):visible').first().click(); await p.waitForTimeout(700)
await st('final')
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B6 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
