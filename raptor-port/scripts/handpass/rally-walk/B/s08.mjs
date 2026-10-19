console.log('B s08 v1 (phone, first-press fix: change a box, then press at once)')
import { launch, open, sleep, shot, elShot, tap, rec, wk, bfld, ceState, inState, model, finish } from './lib.mjs'
const b = await launch()
const goWeek = async p => { await p.evaluate(() => window.go('editsched')); await sleep(800) }
const goBoard = async (p, d) => { await goWeek(p); await p.evaluate(x => window.openScheduler(x), d); await p.waitForSelector('#schedBoard'); await sleep(900) }
const changeWeek = async p => { const R = wk(p, 3, 'ff:3.0.0.rl'); await tap(p, R); await p.keyboard.type('0930'); await sleep(150) }
const changeBoard = async p => { const R = bfld(p, 'ff:3.0.0.rl'); await tap(p, R); await p.keyboard.type('0930'); await sleep(150) }
const W = '#eWeek .day[data-day="3"]'
const nIt = p => p.evaluate(() => window.DAYS[3].waves[0].intimes.length)
const nForm = p => p.evaluate(() => window.DAYS[3].waves[0].formations.length)
const nWave = p => p.evaluate(() => window.DAYS[3].waves.length)
let ctx, p
const run = async (id, label, where, press, measure, verdictFn, expected) => {
  ;({ ctx, p } = await open(b)); where === 'week' ? await goWeek(p) : await goBoard(p, 3)
  const before = await measure(p)
  where === 'week' ? await changeWeek(p) : await changeBoard(p)
  const pre = await model(p, 3, 0, 0)
  const boxBefore = where === 'week' ? await ceState(wk(p, 3, 'ff:3.0.0.rl')) : await inState(bfld(p, 'ff:3.0.0.rl'))
  const pressNote = await press(p)
  await sleep(500)
  const after = await measure(p); const m = await model(p, 3, 0, 0)
  const pic = await shot(p, `B08-${id}`)
  rec(id, label, expected, { before, after, rlAfter: m.rl, rlBeforePress: pre.rl, boxBeforePress: boxBefore.text ?? boxBefore.value, note: pressNote }, verdictFn(before, after, m) ? 'PASS' : 'FAIL', pic)
  await ctx.close()
}
/* week */
await run('W1', 'week: change R, then "+ In-time"', 'week', p => tap(p, p.locator(`${W} [data-itadd]`).first()), nIt, (a, z, m) => z === a + 1 && m.rl === '09:30', 'one in-time line added on the first press, R saved 09:30')
await run('W2', 'week: change R, then an in-time line X', 'week', p => tap(p, p.locator(`${W} [data-itdel]`).first()), nIt, (a, z, m) => z === a - 1 && m.rl === '09:30', 'exactly one line removed, R saved 09:30')
await run('W3', 'week: change R, then Undo', 'week', p => tap(p, p.locator('#undoBtn'), { block: 'nearest' }), async p => (await model(p, 3, 0, 0)).rl || '', (a, z, m) => !m.rl, 'Undo takes back the R just typed (R empty); one press')
await run('W4', 'week: change R, then Templates button', 'week', async p => { await tap(p, p.locator(`${W} [data-daytplopen]`).first()); return await p.evaluate(() => [...document.querySelectorAll('[role=menu],.menu,.pop,.sheet,.modal,[class*=tpl]')].filter(e => e.offsetParent !== null).map(e => e.className.toString().slice(0, 30)).slice(0, 4)) }, nIt, (a, z, m) => m.rl === '09:30', 'the button acts on the first press (a menu/sheet opens), R saved')
await run('W5', 'week: change R, then the change-history clock', 'week', async p => { await tap(p, p.locator('#histBtn'), { block: 'nearest' }); return await p.evaluate(() => [...document.querySelectorAll('[class*=hist],[id*=hist]')].filter(e => e.offsetParent !== null && e.id !== 'histBtn').map(e => e.id || e.className.toString().slice(0, 30)).slice(0, 4)) }, nIt, (a, z, m) => m.rl === '09:30', 'history window opens on the first press, R saved')
/* focused but unchanged then press */
;({ ctx, p } = await open(b)); await goWeek(p)
const t0 = await nIt(p)
await tap(p, wk(p, 3, 'ff:3.0.0.to'))
await tap(p, p.locator(`${W} [data-itadd]`).first())
await sleep(500)
const t1 = await nIt(p)
rec('W6', 'week: tap TO (focus, no change), then "+ In-time"', 'exactly one line added', { before: t0, after: t1 }, t1 === t0 + 1 ? 'PASS' : 'FAIL', await shot(p, 'B08-W6'))
await ctx.close()
/* board */
await run('B1', 'board: change R, then "+ Line"', 'board', p => tap(p, p.locator('#sbBoard [data-gline]').first(), { block: 'nearest' }), nForm, (a, z, m) => z === a + 1 && m.rl === '09:30', 'exactly one line added, R saved')
await run('B2', 'board: change R, then "+ In-time"', 'board', p => tap(p, p.locator('#sbBoard [data-itadd]').first(), { block: 'nearest' }), nIt, (a, z, m) => z === a + 1 && m.rl === '09:30', 'exactly one in-time added, R saved')
await run('B3', 'board: change R, then an in-time line X', 'board', p => tap(p, p.locator('#sbBoard [data-itdel]').first(), { block: 'nearest' }), nIt, (a, z, m) => z === a - 1 && m.rl === '09:30', 'exactly one removed, R saved')
await run('B4', 'board: change R, then "+ Wave"', 'board', p => tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }), nWave, (a, z, m) => z === a + 1 && m.rl === '09:30', 'exactly one wave added, R saved')
await run('B5', 'board: change R, then the dots menu then Sort all', 'board', async p => { await tap(p, p.locator('#sbMore'), { block: 'nearest' }); const vis = await p.locator('#sbSortAll').isVisible(); if (vis) await tap(p, p.locator('#sbSortAll'), { block: 'nearest' }); return { sortAllVisibleAfterMore: vis } }, nWave, (a, z, m) => m.rl === '09:30', 'the dots menu opens on the first press, Sort all runs, R saved')
await run('B6', 'board: change R, then Undo', 'board', p => tap(p, p.locator('#sbUndo'), { block: 'nearest' }), async p => (await model(p, 3, 0, 0)).rl || '', (a, z, m) => !m.rl, 'Undo takes back the R just typed, in one press')
await run('B7', 'board: change R, then Next day', 'board', async p => { await tap(p, p.locator('#sbNextDay'), { block: 'nearest' }); return { day: await p.locator('#sbDay').innerText() } }, p => p.locator('#sbDay').innerText(), (a, z, m) => z !== a && m.rl === '09:30', 'the day advances once (Thu to Fri), R saved on Thu')
await run('B8', 'board: change R, then Done', 'board', async p => { await tap(p, p.locator('#sbDone'), { block: 'nearest' }); return { boardOpen: await p.locator('#schedBoard').isVisible().catch(() => false) } }, p => p.locator('#schedBoard').isVisible().catch(() => false), (a, z, m) => z === false && m.rl === '09:30', 'the board closes on the first press, R saved')
/* placed (not typed) then Done and then Enter */
;({ ctx, p } = await open(b)); await goBoard(p, 3)
await tap(p, bfld(p, 'ff:3.0.0.rl'))
await tap(p, p.locator('#sbDone'), { block: 'nearest' }); await sleep(600)
const md = await model(p, 3, 0, 0)
rec('B9', 'board: tap R (placed 09:45 only, nothing typed), then Done', 'closes; placed rally saved (leaving saves it)', { boardOpen: await p.locator('#schedBoard').isVisible().catch(() => false), rl: md.rl }, md.rl === '09:45' ? 'PASS' : 'FAIL', await shot(p, 'B08-B9'))
await ctx.close()
;({ ctx, p } = await open(b)); await goBoard(p, 3)
await tap(p, bfld(p, 'ff:3.0.0.rl')); await p.keyboard.press('Enter'); await sleep(300)
await tap(p, p.locator('#sbDone'), { block: 'nearest' }); await sleep(600)
const md2 = await model(p, 3, 0, 0)
rec('B10', 'board: tap R (placed only), Enter, then Done', 'RECORD whether the placed rally is saved', { rl: md2.rl, boardOpen: await p.locator('#schedBoard').isVisible().catch(() => false) }, 'RECORD', await shot(p, 'B08-B10'))
await ctx.close()
await b.close()
await finish('s08')
