/* The SC formation draws ONE switch on every aircraft row it holds — including
   the empty SPARE rows. Does pressing the one beside an EMPTY row stop the men
   on the MAIN row earning, and does the day admit that anything changed? */
import { open, board, publish, oilMode, go, shot, tap, closeBoard, readDay, lwCell, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await publish(page, di); await page.waitForTimeout(600)
const R = {}

const bars = async () => (await readDay(page, di)).pucks
  .filter(p => ['Piston', 'Basher', 'Cobra', 'Ledger', 'Fable'].includes(p.who))
  .map(p => `${p.who}:${p.bar || '-'}`)
const week = async () => { await closeBoard(page); await go(page, 'editsched'); await page.waitForTimeout(600)
  const r = await page.evaluate(i => { const c = document.querySelectorAll('#eWeek .day')[i]
    return { changes: (c.innerText.match(/(\d+)\s+changes?/) || [])[0] || 'none', ver: (c.querySelector('.verchip') || {}).innerText || '' } }, di)
  await board(page, di); return r }

R.barsBefore = await bars()
R.weekBefore = await week()
R.moneyBefore = await lwCell(page, ['pump', 'glass', 'taipan'], '2026-07-18')
await board(page, di)

/* find the switch that sits on an SC row with NOBODY on it */
await oilMode(page, true)
const target = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const items = [...b.querySelectorAll('[data-oilitem]')]
  for (let i = 0; i < items.length; i++) {
    const e = items[i]
    const row = e.closest('.sb-line, .sb-arow')
    if (!row) continue
    if (row.querySelectorAll('[data-oilp]').length !== 0) continue
    const nm = (e.innerText || '').split('\n')[0].trim()
    if (nm !== 'SC') continue
    /* is this the SAME item key as a row that DOES have earners on it? */
    const twin = items.find(o => o !== e && o.dataset.oilitem === e.dataset.oilitem &&
      o.closest('.sb-line, .sb-arow') && o.closest('.sb-line, .sb-arow').querySelectorAll('[data-oilp]').length > 0)
    return { idx: i, key: e.dataset.oilitem, sharesKeyWithAnEarningRow: !!twin,
      earnersUnderThatKey: twin ? [...twin.closest('.sb-line, .sb-arow').querySelectorAll('[data-oilp]')].map(p => (p.innerText || '').split('\n')[0]) : [] }
  }
  return null
})
R.target = target
if (target) {
  await tap(page, '[data-oilitem]', target.idx)
  await page.waitForTimeout(800)
  R.afterTap = await page.evaluate(i => {
    const e = document.querySelectorAll('#schedBoard [data-oilitem]')[i]
    return { title: e.getAttribute('title'), cls: (e.className || '').toString() }
  }, target.idx)
  await shot(page, 'A7-sc-empty-row-switch-off')
  await oilMode(page, false); await page.waitForTimeout(700)
  R.barsAfter = await bars()
  R.weekAfter = await week()
  R.moneyAfter = await lwCell(page, ['pump', 'glass', 'taipan'], '2026-07-18')
}
R.errors = errors.slice(0, 6)
console.log(JSON.stringify(R, null, 1))
await browser.close()
