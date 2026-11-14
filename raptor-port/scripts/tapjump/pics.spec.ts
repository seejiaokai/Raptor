/* TEMPORARY — the after-pictures for D2030; not committed (run with the scratch config). */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, lwView, openLeaveWar } from '../../e2e/app'

const OUT = process.env.PICS_OUT!

async function shots(page: Page, sheet: string, btn: string, note: string, name: string) {
  const b0 = (await page.getByTestId(btn).boundingBox())!
  await page.mouse.click(b0.x + b0.width / 2, b0.y + b0.height / 2)
  await expect(page.getByTestId(note)).toHaveText(/go ahead/)
  const s1 = (await page.getByTestId(sheet).boundingBox())!
  const b1 = (await page.getByTestId(btn).boundingBox())!
  const vp = page.viewportSize()!
  const clip = { x: Math.max(0, s1.x - 14), y: Math.max(0, s1.y - 40), width: Math.min(vp.width, s1.width + 28), height: Math.min(vp.height - Math.max(0, s1.y - 40), s1.height + 54) }
  await page.screenshot({ path: `${OUT}/${name}-2-line-shown.png`, clip })
  console.log(`MEASURE ${name}: button y before ${b0.y} after ${b1.y}; note text: ${await page.getByTestId(note).textContent()}`)
  /* the same scene before the tap: take the line away by pressing How much again (clears nothing on screen but the ask stays) —
     simpler: reload is costly, so the "before" is taken by the caller first */
  return clip
}

test('pics: several people, a PC', async ({ page }) => {
  test.skip(test.info().project.name !== 'pc')
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-01-06"]')].map(e => e.getAttribute('data-testid')!))
  const from = ids[0]!, to = ids[6]!.replace('2026-01-06', '2026-01-18')
  const a = (await page.getByTestId(from).boundingBox())!
  const b = (await page.getByTestId(to).boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(page.getByTestId('select-sheet')).toBeVisible()
  await page.screenshot({ path: `${OUT}/pc-several-0-whole-before.png` })
  const clip = await shots(page, 'select-sheet', 'sel-FCL', 'sel-note', 'pc-several')
  await page.screenshot({ path: `${OUT}/pc-several-3-whole-after.png` })
  void clip
})

test('pics: one day', async ({ page }) => {
  await openLeaveWar(page)
  await lwView(page, 'slipway')
  await page.getByTestId('cell-slipway-2026-02-11').click()
  await expect(page.getByTestId('bid-picker')).toBeVisible()
  const n = test.info().project.name
  await page.screenshot({ path: `${OUT}/${n}-oneday-0-whole-before.png` })
  await shots(page, 'bid-picker', 'bid-FCL', 'span-note', `${n}-oneday`)
  await page.screenshot({ path: `${OUT}/${n}-oneday-3-whole-after.png` })
})
