/* Same test, measured the way the board itself reports a pending amendment:
   the Publish button turns from "Publish day" into "Publish AL1". */
import { open, board, publish, oilMode, shot, tap, readDay, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await publish(page, di); await page.waitForTimeout(700)
const R = {}
const beak = () => page.evaluate(i => {
  const b = document.querySelector('#schedBoard')
  const e = b.querySelector('.dbeak')
  const sign = [...b.querySelectorAll('*')].find(x => /Not yet signed|not yet signed/i.test(x.innerText || '') && (x.innerText || '').length < 60)
  return { label: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO BUTTON', locked: e ? e.disabled : null,
    cls: e ? (e.className || '').toString() : '', notSigned: !!sign,
    ver: (b.querySelector('.verchip') || {}).innerText || '' }
}, di)
const bars = async () => (await readDay(page, di)).pucks
  .filter(p => ['Piston', 'Basher', 'Cobra', 'Ledger'].includes(p.who)).map(p => `${p.who}:${p.bar || '-'}`)

R.beak0 = await beak(); R.bars0 = await bars()

/* 1. the control test — deny ONE man, which everyone agrees is an amendment */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Fable' }).first().click()
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(600)
R.beakAfterDenyingAMan = await beak()
/* put him back so the next step starts clean */
await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Fable' }).first().click()
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(600)
R.beakAfterUndoingThat = await beak()

/* 2. the real test — press the switch beside an EMPTY spare row */
await oilMode(page, true)
const t = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const items = [...b.querySelectorAll('[data-oilitem]')]
  for (let i = 0; i < items.length; i++) {
    const e = items[i], row = e.closest('.sb-line, .sb-arow')
    if (!row || row.querySelectorAll('[data-oilp]').length) continue
    if ((e.innerText || '').split('\n')[0].trim() !== 'SC') continue
    return { idx: i, key: e.dataset.oilitem }
  }
  return null
})
R.target = t
await tap(page, '[data-oilitem]', t.idx)
await page.waitForTimeout(800)
await shot(page, 'A7-sc-spare-switch-mode')
await oilMode(page, false); await page.waitForTimeout(700)
R.barsAfterSpareSwitch = await bars()
R.beakAfterSpareSwitch = await beak()
await shot(page, 'A7-sc-spare-switch-board')
R.errors = errors.slice(0, 6)
console.log(JSON.stringify(R, null, 1))
await browser.close()
