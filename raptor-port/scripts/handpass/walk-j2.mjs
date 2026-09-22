/* JOB 2 (22 Sep 26) — a MULTI-DAY request must pay on every day it was
   ANSWERED for, not only the one day its single row lands on.

   Filed from the Inputs page: the board's form has no date field (finding 18).
   The form's calendar takes TWO clicks to make a range. The OIL question's own
   per-day picker is a CALENDAR too — `.rc-d`, with only the askable days
   carrying `oc-ask`.

   Friday 17 → Sunday 19, answered for the SATURDAY only. The row lands on the
   FRIDAY, so the Saturday is a day the request covers and never lands on —
   which is exactly the day that used to pay nothing. */
import { open, go, board, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }

await go(page, 'inputs')
await page.selectOption('#inPerson', 'shaft')          /* Anvil */
await page.selectOption('#inType', 'Training')
await page.click('[data-cal="2026-07-17"]'); await page.waitForTimeout(250)
await page.click('[data-cal="2026-07-19"]'); await page.waitForTimeout(400)
await shot(page, 'j2-01-range-fri-to-sun')
await page.click('#inAdd'); await page.waitForTimeout(1100)

const oil = page.locator('[data-testid="oilconf"]')
S('the multi-day question', (await oil.innerText()).replace(/\s+/g, ' ').trim().slice(0, 190))
await shot(page, 'j2-02-question-multiday')
await oil.getByRole('button', { name: /Only some days/ }).click(); await page.waitForTimeout(500)
S('days it offers', await oil.locator('.rc-d.oc-ask').evaluateAll(ds => ds.map(d => d.innerText.trim())))
await oil.locator('.rc-d.oc-ask', { hasText: /^18$/ }).click(); await page.waitForTimeout(400)
await shot(page, 'j2-03-saturday-only')
await oil.getByRole('button', { name: /^Save$/ }).click(); await page.waitForTimeout(1300)

const rec = await page.evaluate(() => {
  const r = window.INPUTS.find(x => x.person === 'shaft' && x.type === 'Training')
  return r && { iid: r.iid, acc: r.acc, oil: r.oil }
})
S('THE ANSWER STORED', rec)

/* ---- does the SATURDAY pay? the day the row does NOT land on ----------- */
for (const [label, di] of [['Friday 17 (the anchor)', 4], ['Saturday 18 (answered)', 5], ['Sunday 19 (refused)', 6]]) {
  await board(page, di)
  const paid = await page.evaluate(() => {
    const figs = window.oilDayFigures(window.SBDAY)
    return { anvilEarns: figs['shaft'] || 'NOTHING', menPaid: Object.keys(figs).length }
  })
  S(label, paid)
  await shot(page, 'j2-04-day' + di)
}
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
