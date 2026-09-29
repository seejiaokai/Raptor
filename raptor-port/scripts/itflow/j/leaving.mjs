/* J13 — post out, archive, delete. A posting out is made on the LEAVE WAR (tap a day on his row, then PO); Archive,
   Restore and Delete are on his row in Admin → Users. */
export default async function ({ fresh, go, shot, find }) {
  let page = await fresh()
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-rocky"]')
  await page.click('[data-testid="month-OCT"]'); await page.waitForTimeout(800)
  await page.click('[data-testid="cell-rocky-2026-10-15"]')
  await page.click('[data-testid="bid-postout"]')
  await page.fill('[data-testid="po-date"]', '2026-10-20'); await page.waitForTimeout(300)
  await shot(page, 'leaving-1', { x: 430, y: 530, w: 590, h: 370 }, [
    { n: 1, sel: '[data-testid="po-date"]' }, { n: 2, sel: '[data-testid="po-overseas"]' }, { n: 3, sel: '[data-testid="po-confirm"]' },
    { see: true, sel: '[data-testid="po-line"]' },
  ])
  await page.context().close()
  page = await fresh()
  await go(page, 'admin'); await find(page, 'hex')
  await page.click('#accList [data-person="rocky"] .acc-tap')
  await shot(page, 'leaving-2', { x: 540, y: 190, w: 640, h: 360 }, [
    { n: 4, sel: '#accList [data-person="rocky"] .acc-tap', pos: 'tr' }, { n: 5, sel: '#accEdArchive' },
  ])
  await page.click('#accEdArchive'); await page.waitForTimeout(400)
  await page.click('#accArchList [data-person="rocky"] .acc-tap')
  await page.fill('#accArPostIn', '2026-10-19')
  await shot(page, 'leaving-3', { x: 540, y: 190, w: 640, h: 390 }, [
    { n: 6, sel: '#accArPostIn' }, { n: 7, sel: '#accArRestore' }, { see: true, sel: '[data-testid="arch-line-rocky"]' },
  ])
  await page.click('#accArRestore'); await page.waitForTimeout(300)
  await find(page, 'ace')
  await page.click('#accList [data-person="dj"] .acc-tap'); await page.click('#accEdDel'); await page.waitForTimeout(300)
  await shot(page, 'leaving-4', { x: 540, y: 190, w: 640, h: 360 }, [
    { n: 8, sel: '#accEdDel' }, { see: true, sel: '#accEdDelNote' },
  ])
  await page.context().close()
}
