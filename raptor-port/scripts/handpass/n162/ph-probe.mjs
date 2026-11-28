// ph-probe - survey: Saber on 149's Inputs page; every input row, and the height of the window each one opens.
//   node raptor-port/scripts/handpass/n162/ph-probe.mjs <size>
import { mk, signIn, go, pickSq, closeAll, note, press, pic } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const s = await mk(SZ); const { page } = s
try {
  await signIn(s, 'ad', 'a')
  await pickSq(s, '149'); await go(s, 'inputs'); await page.waitForTimeout(800)
  note('listBtn', await page.locator('#inListBtn').count(), await page.locator('#inListBtn').first().getAttribute('aria-pressed').catch(() => null))
  note('cal bars', await page.locator('.ib-bar[data-iid]').count())
  await pic(s, `ph-probe-${SZ}-cal`)
  if (await page.locator('#inListBtn[aria-pressed="false"]').filter({ visible: true }).count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn', { must: false })
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) await press(s, '#inRangeBtn')
  const rows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].map(r => r.dataset.iid + '|' + r.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)))
  note('rows', rows.length); for (const r of rows) note(r)
  await pic(s, `ph-probe-${SZ}-list`)
  for (const r of rows.slice(0, 40)) {
    const iid = r.split('|')[0]
    const row = page.locator(`#inBody tr[data-iid="${iid}"], #inList [data-iid="${iid}"]`).first()
    await row.scrollIntoViewIfNeeded().catch(() => {})
    const o = row.locator('[data-testid="in-open"]')
    await press(s, (await o.count()) ? o.first() : row)
    await page.waitForTimeout(400)
    const m = await page.evaluate(() => {
      const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
      const w = r ? (r.closest('.floatwin') || r.closest('.airpop')) : document.querySelector('.floatwin')
      if (!w) return null
      const b = w.getBoundingClientRect()
      return { cls: w.className.slice(0, 40), h: Math.round(b.height), scrollH: w.scrollHeight, rmk: !!r, head: w.innerText.split('\n').slice(0, 2).join(' / ').slice(0, 60) }
    })
    note(iid, JSON.stringify(m))
    if (await page.locator('#inpEditClose').filter({ visible: true }).count()) await press(s, '#inpEditClose')
    if (await page.locator('[data-testid="inped-xask"], #dlgModal').filter({ visible: true }).count()) await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
  }
} finally { await closeAll() }
