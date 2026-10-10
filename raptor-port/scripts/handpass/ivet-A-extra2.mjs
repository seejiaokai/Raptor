// WALKER A — an extra look: which control lets the lit row go? One fresh world per case (desktop, Saber)
import * as L from './ivet-A-lib.mjs'
const { WIN } = L
const lit = p => p.evaluate(() => document.querySelectorAll('#inBody tr.innew').length)
const cases = {
  'A heading Start, no filter': { pre: async () => {}, fn: async p => { await p.locator('#intbl thead th[data-sort="start"]').click() } },
  'B heading Name, no filter': { pre: async () => {}, fn: async p => { await p.locator('#intbl thead th[data-sort="name"]').click() } },
  'C person filter Wisp set before, then changed to Everyone': { pre: async p => { await p.selectOption('#inFPerson', await L.csId(p, 'Wisp')) }, fn: async p => { await p.selectOption('#inFPerson', 'all') } },
  'D type filter LL set before, then changed to All types': { pre: async p => { await p.selectOption('#inFType', 'LL') }, fn: async p => { await p.selectOption('#inFType', 'all') } },
  'E search zzz set before, then cleared': { pre: async p => { await p.fill('#inFSearch', 'zzz') }, fn: async p => { await p.fill('#inFSearch', '') } },
  'F no filter, then Person set to Wisp': { pre: async () => {}, fn: async p => { await p.selectOption('#inFPerson', await L.csId(p, 'Wisp')) } },
  'G no filter, then search typed': { pre: async () => {}, fn: async p => { await p.fill('#inFSearch', 'q') } },
  'H no filter, then Type set to LL': { pre: async () => {}, fn: async p => { await p.selectOption('#inFType', 'LL') } }
}
const out = {}
for (const [name, c] of Object.entries(cases)) {
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false)
  await L.toList(page, false)
  await c.pre(page)
  await L.plus(page, false)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-22', false); await page.fill('#inpEditRmk', 'extra2')
  await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' }); await page.waitForTimeout(400)
  const l0 = await lit(page)
  await c.fn(page); await page.waitForTimeout(500)
  const l1 = await lit(page)
  out[name] = { litBefore: l0, litAfter: l1 }
  await ctx.close()
}
console.log(JSON.stringify(out, null, 1))
await L.browser.close()
