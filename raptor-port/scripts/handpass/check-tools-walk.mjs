// Walk of the checking tools' own job ([DRAW-MARK-HELPER] and the rule check's one-rule ids), 14 Nov 26, overnight job 3.
// Drives the built app (HP_URL, default http://localhost:4321) with the marking helper and writes pictures to HP_SHOTS.
//   HP_URL=http://localhost:4321 HP_SHOTS=docs/img/handpass/2026-11-14-check-tools node scripts/handpass/check-tools-walk.mjs
// Steps 1-4 and 7 of the evidence sheet docs/handpass/2026-11-14-check-tools.md (5 and 6 are shell runs).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { open, login, go, board, closeBoard } from './lib.mjs'
import { drawMarks } from './drawmark.mjs'

console.log('check-tools-walk v1')
const OUT = process.env.HP_SHOTS || 'docs/img/handpass/2026-11-14-check-tools'
mkdirSync(OUT, { recursive: true })
const LOG = join(OUT, 'drawmark-log.txt'); writeFileSync(LOG, '')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const R = []   // results, written as JSON for the sheet
const note = (k, v) => { R.push([k, v]); console.log(k, '=>', typeof v === 'string' ? v : JSON.stringify(v)) }
const boxOf = (page, sel) => page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(n => Math.round(n * 10) / 10).join(',') }, sel)
const snap = async (dm, page, name) => { const p = join(OUT, name + '.png'); await dm.shot({ path: p }); return p }
const tryDo = async (label, fn) => { try { return await fn() } catch (e) { note(label + ' (threw)', e.message); return null } }

async function openBell(page) {
  const b = page.locator('.bellbtn').filter({ visible: true }).first()
  await b.click(); await page.waitForSelector('[data-testid="bell-list"]'); await sleep(400)
}
async function closeBell(page) { await page.keyboard.press('Escape'); await sleep(300); if (await page.locator('[data-testid="bell-list"]').count()) { await page.mouse.click(5, 400); await sleep(300) } }

for (const dev of [{ n: 'pc', w: 1536, h: 864 }, { n: 'ph', w: 402, h: 874 }]) {
  const { browser, page, errors } = await open({ width: dev.w, height: dev.h })
  const dm = await drawMarks(page, { logFile: LOG })
  // ---- step 1: a fixed list
  await tryDo(`1 ${dev.n}`, async () => {
    await openBell(page)
    const pos = await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="bell-list"]')).position)
    const sel = '[data-testid="bell-list"]'
    const before = await boxOf(page, sel)
    const m = await dm.mark(sel, { tag: 'the bell list' })
    const after = await boxOf(page, sel)
    note(`1 ${dev.n} bell list position`, pos); note(`1 ${dev.n} mark result`, m); note(`1 ${dev.n} box before/after`, { before, after, same: before === after })
    const p = await snap(dm, page, `s1-${dev.n}-bell-list`); note(`1 ${dev.n} picture`, p)
    await dm.clear(); await closeBell(page)
  })
  if (dev.n === 'pc') {
    // ---- step 2: a part inside a panel that hides its overflow (the board's OIL Earn bar), Saturday
    await tryDo('2 pc', async () => {
      await board(page, 5); await sleep(600)
      await page.waitForSelector('#sbOil', { state: 'visible' })
      const clip = await page.evaluate(() => { const out = []; for (let a = document.querySelector('#sbOil').parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== 'visible' || s.overflowY !== 'visible') out.push(a.tagName + (a.id ? '#' + a.id : '') + '.' + String(a.className).split(' ')[0] + ' ' + s.overflowX + '/' + s.overflowY) } return out })
      note('2 pc clipping ancestors of #sbOil', clip)
      const before = await boxOf(page, '#sbOil')
      const m = await dm.mark('#sbOil', { tag: 'OIL Earn' })
      note('2 pc unpinned mark result', m); note('2 pc box before/after', { before, after: await boxOf(page, '#sbOil') })
      note('2 pc unpinned picture', await snap(dm, page, 's2-pc-oil-unpinned'))
      await dm.clear()
      const lax = await drawMarks(page, { logFile: LOG, strict: false })
      const r = await lax.mark('#sbOil', { tag: 'OIL Earn', place: 'above' })
      note('2 pc pinned above, strict:false result', r)
      const edge = []
      for (let n = 0; n < 6; n++) { await lax.clear(); const q = await lax.mark('#schedBoard button', { tag: 'edge ' + n, place: 'above', nth: n }); edge.push({ nth: n, ok: q.ok, place: q.place, faults: q.faults, tagsLeft: await page.locator('[data-drawmark-tag]').count() }) }
      note('2 pc pinned above on the board first buttons, strict:false', edge)
      note('2 pc tags left after refusal', await page.locator('[data-drawmark-tag]').count())
      await page.screenshot({ path: join(OUT, 's2-pc-oil-pinned-refused.png') })
      note('2 pc pinned picture (plain screenshot, no mark)', join(OUT, 's2-pc-oil-pinned-refused.png'))
      await lax.clear()
    })
    // ---- step 3: the app redraws a marked part, then the picture is refused; clear leaves nothing
    await tryDo('3 pc', async () => {
      await dm.mark('#sbOil', { tag: 'OIL Earn' })
      await page.locator('#sbOil').filter({ visible: true }).first().click(); await sleep(700)   // the app redraws the bar
      let msg = 'NO REFUSAL'
      try { await dm.shot({ path: join(OUT, 's3-pc-mark-survives-press.png') }) } catch (e) { msg = e.message }
      note('3 pc picture after redraw', msg)
      note('3 pc picture file exists (must be false)', existsSync(join(OUT, 's3-pc-mark-survives-press.png')))
      await page.screenshot({ path: join(OUT, 's3-pc-after-redraw-plain.png') })
      await dm.clear()
      note('3 pc [data-drawmark-tag] count after clear', await page.locator('[data-drawmark-tag]').count())
      note('3 pc [data-drawmark-ring] count after clear', await page.locator('[data-drawmark-ring]').count())
      await page.locator('#sbOil').filter({ visible: true }).first().click(); await sleep(600)   // press something: app still works
      note('3 pc app still works: OIL Earn pressed again, bar oilon', await page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon')))
      await page.screenshot({ path: join(OUT, 's3-pc-app-still-works.png') })
      // a second way to redraw: close the board and reopen
      await dm.mark('#sbOil', { tag: 'OIL' }); await closeBoard(page); await board(page, 5); await sleep(500)
      let msg2 = 'NO REFUSAL'
      try { await dm.shot({ path: join(OUT, 's3-should-not-exist-2.png') }) } catch (e) { msg2 = e.message }
      note('3 pc picture after reopen', msg2)
      await dm.clear()
      note('3 pc count after second clear', await page.locator('[data-drawmark-tag]').count())
    })
    // ---- step 4: a page error is printed and written to the log
    await tryDo('4 pc', async () => {
      await page.evaluate(() => setTimeout(() => { throw new Error('walk-probe') }))
      await sleep(600)
      note('4 pc helper errors', dm.errors)
      note('4 pc log file has probe', readFileSync(LOG, 'utf8').includes('walk-probe'))
    })
    // ---- step 7: the plain-user round
    await tryDo('7 pc', async () => {
      await closeBoard(page)
      await openBell(page); await page.screenshot({ path: join(OUT, 's7-pc-bell.png') }); await closeBell(page)
      await go(page, 'editsched'); await page.screenshot({ path: join(OUT, 's7-pc-editsched.png') })
      await board(page, 5); await page.screenshot({ path: join(OUT, 's7-pc-board.png') }); await closeBoard(page)
      await go(page, 'leavewar'); await sleep(800); await page.screenshot({ path: join(OUT, 's7-pc-leavewar.png') })
      await go(page, 'week').catch(() => {})
      await page.locator('#logout').filter({ visible: true }).first().click(); await sleep(700)
      note('7 pc signed out (login form shown)', await page.locator('#luser').count() > 0)
      await page.screenshot({ path: join(OUT, 's7-pc-signed-out.png') })
    })
  }
  note(`page errors ${dev.n}`, errors.filter(e => !/walk-probe/.test(e)))
  await browser.close()
}
writeFileSync(join(OUT, 'walk-results.json'), JSON.stringify(R, null, 1))
