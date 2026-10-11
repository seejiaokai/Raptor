// W3 scenarios 10-extra, 11, 12 (desktop)   node scripts/handpass/gi-w3d.mjs 10x 11 12
import * as L from './gi-w3-lib.mjs'
const { world, open, fileInput, counts, fmt, shot, shotSec, shotHead, shotWin, save, undoOnce, redoOnce, reload, toWeek, toBoard, press, errs, DESK, ritual, csId } = L
const only = process.argv.slice(2)
const want = k => !only.length || only.includes(k)
const log = (...a) => console.log(...a)
const is = (c, v) => c.n.every(x => x === v) && c.agree
const SATISO = '2026-07-18', SATDI = 5
const togo = async (p, label, rec, opts = {}) => { const c = await counts(p, { di: SATDI, ...opts }); rec.counts.push([label, fmt(c)]); log('  ', label, fmt(c)); rec.lines[label] = c.lines; return c }
const satRow = (p, name) => p.locator('#eWeek .day:not(.peek)').nth(SATDI).locator('.sec-grnd .pl-row', { hasText: 'RANGE DUTY' }).locator('.puck', { hasText: name }).first()
const satPucks = p => p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][5]; return [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => [...r.querySelectorAll('.seat')].map(s => s.querySelector('.puck .nm')?.textContent.trim() + (s.dataset.alp ? '[alp]' : ''))) })
async function satWorld() {
  const { ctx, page } = await open(DESK)
  const f = await fileInput(page, { type: 'Duty', people: ['Drifter', 'Ranger'], from: SATISO, to: SATISO, timed: ['09:00', '12:00'], title: 'Range duty', oil: 'yes' })
  return { ctx, page, filed: f.length }
}

async function s10x() {
  const rec = { n: '10x', note: 'probe: the same drop, but the man taken off is Drifter (the first man of the row)', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false)
  await toWeek(page)
  await L.dragNameOnto(page, 'ALL AVAIL', 'Hunter')
  const pub1 = await L.signAndPublish(page, L.DI); rec.did.push('dropped ALL AVAIL on Hunter, signed and published AL1')
  await toWeek(page)
  await L.rowPuckLoc(page, 'Drifter').click({ button: 'right' }); await page.waitForTimeout(900)
  rec.toast = await L.toastText(page); rec.row = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks); log('  after Drifter off:', rec.toast, rec.row)
  const c = await counts(page, { keepWin: true }); rec.counts.push(['Drifter taken off', fmt(c)]); log('  ', fmt(c)); rec.lines.drifter = c.lines
  rec.pics.push(await shotWin(page, 's10x-desk-togo').catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {})
  rec.pics.push(await shotSec(page, 's10x-desk-row', 'week'))
  save('s10x', { rec, c }); await ctx.close()
}

async function s11() {
  const rec = { n: 11, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, filed } = await satWorld()
  rec.did.push('filed Range duty for Drifter and Ranger on Sat 18 Jul 09:00-12:00, OIL answered Yes')
  const pubS = await L.signAndPublish(page, SATDI); rec.did.push('signed and published Saturday (so the day counts for OIL): ' + JSON.stringify(pubS))
  const c0 = await togo(page, 'Saturday published', rec)
  await toBoard(page, SATDI)
  await page.locator('#sbOil').click(); await page.waitForTimeout(1000); rec.did.push('pressed OIL Earn on the board')
  const rowInfo = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map(r => ({ val: r.querySelector('textarea.ain, input.ain')?.value, pucks: [...r.querySelectorAll('.seat')].map(s => ({ who: s.querySelector('.puck .nm')?.textContent.trim(), oilpk: s.classList.contains('oilpk'), on: s.classList.contains('on'), seatCls: s.className.replace(/\s+/g, '.'), puckCls: s.querySelector('.puck')?.className.replace(/\s+/g, '.'), mark: s.querySelector('.puck')?.innerText.replace(/\s+/g, ' ') })) })))
  rec.rows0 = await rowInfo(); log('  OIL Earn rows:', JSON.stringify(rec.rows0))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-row', 'board'))
  // switch Drifter off by tapping HIS puck on the row
  const pk = (nm) => page.locator('#schedBoard .sb-panel.grnd .sb-arow .seat.oilpk', { hasText: nm }).first()
  await pk('Drifter').scrollIntoViewIfNeeded(); await pk('Drifter').click(); await page.waitForTimeout(800); rec.did.push('tapped Drifter\'s puck on the row (his switch)')
  rec.toast1 = await L.toastText(page); rec.rows1 = await rowInfo(); log('  after Drifter off:', rec.toast1, JSON.stringify(rec.rows1))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-drifter-off', 'board'))
  // try a drag of a name onto the row inside the mode
  const row = page.locator('#schedBoard .sb-panel.grnd .sb-arow').first()
  const src = page.locator('#sbRoster .rpuck[data-person="' + await csId(page, 'Hunter') + '"]').first()
  await row.scrollIntoViewIfNeeded(); await src.scrollIntoViewIfNeeded().catch(() => {})
  const sb = await src.boundingBox(), tb = await pk('Ranger').boundingBox()
  if (sb && tb) { await L.mouseDrag(page, L.centre(sb), L.centre(tb)); rec.did.push('dragged Hunter from the crew list onto Ranger\'s puck inside the mode') } else rec.did.push('COULD NOT find boxes for the drag: ' + JSON.stringify({ sb, tb }))
  rec.toast2 = await L.toastText(page); rec.rows2 = await rowInfo(); log('  after drag attempt:', rec.toast2, JSON.stringify(rec.rows2.map(r => r.pucks.map(p => p.who))))
  rec.hunterInInput = await page.evaluate(() => window.INPUTS.filter(i => i.title === 'Range duty').map(i => window.PEOPLE[i.person].cs))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-after-drag', 'board'))
  // Undo / Redo inside the mode (the board's own pair), reading the row after each
  rec.undo = await undoOnce(page); await page.waitForTimeout(900); rec.rowsU = await rowInfo(); log('  UNDO ->', rec.undo, JSON.stringify(rec.rowsU[0]?.pucks.map(p => p.who + ':' + p.on)))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-after-undo', 'board'))
  rec.redo = await redoOnce(page); await page.waitForTimeout(900); rec.rowsR = await rowInfo(); log('  REDO ->', rec.redo, JSON.stringify(rec.rowsR[0]?.pucks.map(p => p.who + ':' + p.on)))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-after-redo', 'board'))
  const c1 = await togo(page, 'Drifter off (after Undo + Redo)', rec)
  await reload(page); await toBoard(page, SATDI); await page.locator('#sbOil').click(); await page.waitForTimeout(1000)
  rec.rowsX = await rowInfo(); log('  RELOAD ->', JSON.stringify(rec.rowsX[0]?.pucks.map(p => p.who + ':' + p.on + ':' + p.puckCls)))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-after-reload', 'board'))
  // switch him back on (still inside the mode after the reload)
  await pk('Drifter').scrollIntoViewIfNeeded(); await pk('Drifter').click(); await page.waitForTimeout(800); rec.did.push('tapped Drifter\'s puck again (switched back on)')
  rec.rowsBack = await rowInfo(); log('  back on:', JSON.stringify(rec.rowsBack[0]?.pucks.map(p => p.who + ':' + p.on)))
  rec.pics.push(await shotSec(page, 's11-desk-oil-earn-drifter-back', 'board'))
  const cb = await togo(page, 'Drifter back on', rec)
  const cx = c1
  save('s11', { rec, c0, c1, cx, cb }); await ctx.close()
}

async function s12() {
  const rec = { n: 12, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page } = await satWorld()
  rec.did.push('filed Range duty for Drifter and Ranger on Sat 18 Jul 09:00-12:00, OIL answered Yes')
  await toWeek(page)
  await L.dragNameOnto(page, 'Hunter', satRow(page, 'Drifter'))
  rec.did.push('dragged Hunter from the crew list onto Drifter\'s puck on the Saturday row')
  rec.toast = await L.toastText(page); rec.question = await page.locator('[data-testid="oilconf"]').count(); rec.row = JSON.stringify(await satPucks(page))
  rec.records = await page.evaluate(() => window.INPUTS.filter(i => i.title === 'Range duty').map(i => window.PEOPLE[i.person].cs + ':' + JSON.stringify(i.oil)))
  log('  after drop:', rec.toast, 'question sheets:', rec.question, rec.row, JSON.stringify(rec.records))
  rec.pics.push(await shotSec(page, 's12-desk-row-hunter-added', 'week', SATDI))
  const pubS = await L.signAndPublish(page, SATDI); rec.did.push('signed and published Saturday: ' + JSON.stringify(pubS))
  const c1 = await togo(page, 'Saturday published', rec)
  // the Leave War and its OIL tracker
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
  const ids = await Promise.all(['Drifter', 'Hunter', 'Ranger'].map(c => csId(page, c)))
  const cells = () => page.evaluate(([ids, d]) => Object.fromEntries(ids.map(id => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return [window.PEOPLE[id].cs, c ? { text: c.innerText.trim(), cls: c.className.slice(0, 60) } : 'NO CELL'] })), [ids, SATISO])
  rec.cells = await cells(); log('  Leave War cells at 18 Jul:', JSON.stringify(rec.cells))
  rec.pics.push(await shot(page, 's12-desk-leavewar-grid'))
  await page.locator('[data-testid="oil-tracker"]').first().click(); await page.waitForTimeout(1200); rec.did.push('opened the Leave War\'s OIL tracker')
  rec.trackerRows = {}
  for (const nm of ['Drifter', 'Hunter', 'Ranger']) {
    rec.trackerRows[nm] = await page.evaluate(nm => {
      const w = [...document.querySelectorAll('.oil-name .who')].find(e => e.textContent.trim() === nm)
      if (!w) return 'no name cell found'
      w.scrollIntoView({ block: 'center' })
      const row = w.closest('tr.oil-row')
      return row ? row.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'no row'
    }, nm)
    log('  tracker row', nm, ':', rec.trackerRows[nm])
    await page.waitForTimeout(300)
    rec.pics.push(await shot(page, 's12-desk-oil-tracker-' + nm.toLowerCase()))
  }
  // Undo once / Redo / reload — with the Saturday's five counts and the Leave War's cells for the three men read after each
  const lwRead = async () => { await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500); const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(1200) } return cells() }
  await toWeek(page)
  rec.undo = await undoOnce(page); const u = await togo(page, 'Undo once', rec); rec.undoCells = await lwRead(); log('  UNDO ->', rec.undo, JSON.stringify(rec.undoCells))
  await toWeek(page)
  rec.redo = await redoOnce(page); const r = await togo(page, 'Redo', rec); rec.redoCells = await lwRead(); log('  REDO ->', rec.redo, JSON.stringify(rec.redoCells))
  await reload(page); const x = await togo(page, 'after reload', rec); rec.reloadCells = await lwRead(); log('  RELOAD ->', JSON.stringify(rec.reloadCells))
  rec.verdict = rec.question === 0 && /Hunter.*HO|HO.*Hunter/.test(JSON.stringify(rec.cells)) && rec.cells.Hunter?.text?.startsWith('HO') ? 'PASS' : 'CHECK'
  save('s12', { rec, c1 }); await ctx.close()
}

const run = async (k, f) => { if (!want(k)) return; try { await f() } catch (e) { console.log('SCENARIO', k, 'CRASHED', String(e.stack || e).split('\n').slice(0, 6).join(' | ')) } }
await run('10x', s10x); await run('11', s11); await run('12', s12)
console.log('errs', errs)
process.exit(0)
