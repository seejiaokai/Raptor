/* TEMPORARY — [TAP-JUMP-SWEEP]: the Leave War windows' other lines that appear after a press. Not committed. */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, lwView, openLeaveWar } from '../../e2e/app'

const OUT = process.env.PICS_OUT!

async function drag(page: Page, fromId: string, toId: string) {
  const a = (await page.getByTestId(fromId).boundingBox())!
  const b = (await page.getByTestId(toId).boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 })
  await page.mouse.up()
}

async function measure(page: Page, btn: string, name: string) {
  const b0 = (await page.getByTestId(btn).boundingBox())!
  await page.screenshot({ path: `${OUT}/${name}-a.png` })
  await page.mouse.click(b0.x + b0.width / 2, b0.y + b0.height / 2)
  await page.waitForTimeout(500)
  const b1 = await page.getByTestId(btn).boundingBox().catch(() => null)
  await page.screenshot({ path: `${OUT}/${name}-b.png` })
  const under = await page.evaluate(p => { const e = document.elementFromPoint(p.x, p.y); return e ? `${e.tagName}#${e.getAttribute('data-testid') || ''}:${(e.textContent || '').trim().slice(0, 40)}` : '' }, { x: b0.x + b0.width / 2, y: b0.y + b0.height / 2 })
  const notes = await page.locator('.bidsheet .note').allTextContents()
  console.log(`MEASURE ${name}: ${btn} y ${b0.y} -> ${b1 ? b1.y : 'gone'} x ${b0.x} -> ${b1 ? b1.x : 'gone'}; under the finger now: ${under}; notes: ${JSON.stringify(notes)}`)
}

test('asks: drag window Delete, decide', async ({ page }) => {
  test.skip(test.info().project.name !== 'pc')
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-01-06"]')].map(e => e.getAttribute('data-testid')!))
  const from = ids[0]!, to = ids[2]!.replace('2026-01-06', '2026-01-08')
  await drag(page, from, to)
  await expect(page.getByTestId('select-sheet')).toBeVisible()
  await page.getByTestId('sel-approve-tick').click().catch(() => {})
  await page.getByTestId('sel-LL').click()
  await page.waitForTimeout(400)
  if (await page.getByTestId('sel-note').isVisible().catch(() => false)) await page.getByTestId('sel-LL').click()
  await page.waitForTimeout(500)
  if (await page.getByTestId('select-sheet').isVisible().catch(() => false)) await page.getByTestId('sel-cancel').click()
  await drag(page, from, to)
  await expect(page.getByTestId('select-sheet')).toBeVisible()
  console.log('BUTTONS', JSON.stringify(await page.locator('[data-testid="select-sheet"] button').evaluateAll(bs => bs.map(b => b.getAttribute('data-testid')))))
  if (await page.getByTestId('sel-approve').isVisible().catch(() => false)) {
    await measure(page, 'sel-approve', 'drag-approve')
    if (!await page.getByTestId('select-sheet').isVisible().catch(() => false)) { await drag(page, from, to); await expect(page.getByTestId('select-sheet')).toBeVisible() }
  }
  if (await page.getByTestId('sel-delete').isVisible().catch(() => false)) await measure(page, 'sel-delete', 'drag-delete')
})

test('asks: one-day window Delete and decide', async ({ page }) => {
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  const n = test.info().project.name
  const cell = (await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="-2026-02-11"]')].map(e => e.getAttribute('data-testid')!)))[0]!
  await page.getByTestId(cell).click()
  await expect(page.getByTestId('bid-picker')).toBeVisible()
  await page.getByTestId('bid-LL').click()
  await page.waitForTimeout(400)
  if (await page.getByTestId('span-note').isVisible().catch(() => false)) await page.getByTestId('bid-LL').click()
  await page.waitForTimeout(500)
  if (!await page.getByTestId('bid-picker').isVisible().catch(() => false)) await page.getByTestId(cell).click()
  await expect(page.getByTestId('bid-picker')).toBeVisible()
  console.log('BUTTONS', JSON.stringify(await page.locator('[data-testid="bid-picker"] button').evaluateAll(bs => bs.map(b => b.getAttribute('data-testid')))))
  for (const b of ['decide-approve', 'decide-refuse', 'bid-clear']) {
    if (!await page.getByTestId('bid-picker').isVisible().catch(() => false)) { await page.getByTestId(cell).click(); await page.waitForTimeout(400) }
    if (await page.getByTestId(b).isVisible().catch(() => false)) await measure(page, b, `${n}-oneday-${b}`)
  }
  void lwView
})
