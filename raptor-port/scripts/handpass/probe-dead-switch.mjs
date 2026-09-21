/* Does tapping the "stop this item earning" switch on a row that has NOBODY on
   it cost a real amendment? */
import { open, board, publish, oilMode, go, shot, tap, closeBoard, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await publish(page, di); await page.waitForTimeout(600)

const beak = () => page.evaluate(i => {
  const b = document.querySelector('#schedBoard')
  const e = b.querySelector(`[data-beak="${i}"]`)
  return { label: e ? e.innerText.trim() : null, locked: e ? e.disabled : null, ver: (b.querySelector('.verchip') || {}).innerText || '' }
}, di)
const weekChip = async () => { await closeBoard(page); await go(page, 'editsched'); await page.waitForTimeout(600);
  return page.evaluate(i => {
    const card = document.querySelectorAll('#eWeek .day')[i]
    const t = card ? card.innerText : ''
    return { changes: (t.match(/(\d+)\s+changes?/) || [])[0] || 'none', ver: (card.querySelector('.verchip') || {}).innerText || '' }
  }, di) }

const R = {}
R.beakBefore = await beak()
R.weekBefore = await weekChip()

await board(page, di)
await oilMode(page, true)
/* an empty SC line — nobody is on it, so nobody can earn from it */
const dead = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const items = [...b.querySelectorAll('[data-oilitem]')]
  for (const e of items) {
    const row = e.closest('.sb-line, .sb-arow')
    if (!row) continue
    const people = row.querySelectorAll('[data-oilp]').length
    const nm = (e.innerText || '').split('\n')[0].trim()
    if (people === 0 && nm && nm.length < 12) return { key: e.dataset.oilitem, name: nm, idx: items.indexOf(e) }
  }
  return null
})
R.dead = dead
if (dead) {
  await tap(page, '[data-oilitem]', dead.idx)
  await page.waitForTimeout(800)
  R.afterTapTitle = await page.evaluate(i => {
    const e = document.querySelectorAll('#schedBoard [data-oilitem]')[i]
    return e ? { title: e.getAttribute('title'), cls: (e.className || '').toString(), text: (e.innerText || '').split('\n')[0] } : null
  }, dead.idx)
  await shot(page, 'A7-dead-switch-off')
  await oilMode(page, false); await page.waitForTimeout(600)
  R.beakAfter = await beak()
  R.weekAfter = await weekChip()
}
R.errors = errors.slice(0, 6)
console.log(JSON.stringify(R, null, 1))
await browser.close()
