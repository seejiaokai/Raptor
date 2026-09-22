/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, survey.
   What the war already holds before anything is touched: which periods exist,
   which one the tab opens on, whether the everything-Saturday is even inside
   it, and every man's OIL figure as a BASELINE. Round 1 of this change never
   opened this tab at all, so nothing here may be assumed. */
import { open, go, shot, STATE, SHOTS } from './lib.mjs'

const ISO = '2026-07-18'
const { browser, page, errors } = await open({ state: STATE })

await go(page, 'leavewar')
await page.waitForTimeout(2000)

const wars = await page.evaluate(() => {
  const s = document.querySelector('[data-testid="war-picker"]')
  if (!s) return 'NO PICKER'
  return { value: s.value, options: [...s.options].map(o => ({ v: o.value, t: o.text })) }
})
console.log('PERIOD PICKER:', JSON.stringify(wars, null, 1))

const strip = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid^="month-"]')].map(b => b.textContent.trim()))
console.log('MONTH STRIP:', strip.join(' '))

/* Is the Saturday even drawn? A cell that is not drawn and a cell that says
   nothing look the same from a distance; only one of them is a finding. */
const drawn = await page.evaluate(d => ({
  cellsForDate: document.querySelectorAll(`[data-testid$="-${d}"]`).length,
  anyHead: !!document.querySelector(`[data-testid="head-${d}"]`),
}), ISO)
console.log('SATURDAY DRAWN:', JSON.stringify(drawn))

const roster = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 80).map(r => {
    const id = r.getAttribute('data-testid').slice(4)
    const n = r.querySelector('[data-testid^="person-"]')
    return { id, cs: (n ? n.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 24) }
  }))
console.log('ROSTER (' + roster.length + '):', roster.map(r => r.cs + '=' + r.id).join(', '))

await shot(page, 'LW-00-grid-as-found')

/* The OIL tracker, opened through its own control. */
await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1200)
const bal = await page.evaluate(() => {
  const out = []
  for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) {
    const id = r.getAttribute('data-oilrow')
    const b = r.querySelector(`[data-testid="oil-bal-${id}"]`)
    const nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
    out.push({ id, cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 20), bal: b ? b.textContent.trim() : null,
      entries: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60)) })
  }
  return out
})
console.log('\nOIL BALANCES (baseline):')
for (const b of bal) console.log(' ', b.cs.padEnd(22), b.bal, b.entries.length ? '| ' + b.entries.join(' ;; ').slice(0, 160) : '')
await shot(page, 'LW-01-oil-tracker-baseline')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
