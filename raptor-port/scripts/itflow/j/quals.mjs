/* J8 — update quals (Quals, everyone): a member edits only his own row (Ranger is `bane`); another row refuses;
   an admin edits any row and can add a qualification column. */
import { go } from '../lib.mjs'

export default async function ({ fresh, shot }) {
  const F = { x: 0, y: 30, w: 1160, h: 870 }
  let page = await fresh('us')
  await go(page, 'quals')
  await shot(page, 'quals-1', { x: 0, y: 40, w: 700, h: 525 }, [{ n: 1, sel: '#qEdit', pos: 'b' }, { see: true, sel: '#qViewP' }])
  await page.click('#qEdit'); await page.waitForTimeout(400)
  const mine = '#qtbl td[data-q="bane|san"]'
  await page.locator(mine).scrollIntoViewIfNeeded()
  await page.click(mine); await page.waitForTimeout(300)
  const r = await page.locator(mine).boundingBox()
  const C2 = { x: 0, y: Math.max(0, Math.min(r.y - 420, 900 - 630)), w: 840, h: 630 }
  await shot(page, 'quals-2', C2, [{ n: 2, sel: mine, pos: 'r' }, { n: 3, sel: '#qtbl select[data-lvl="bane"]' }])
  await page.click('#qtbl td[data-q="dj|san"]'); await page.waitForTimeout(250)
  await shot(page, 'quals-3', { x: 300, y: 500, w: 840, h: 400 }, [{ see: true, sel: '#toastEl' }])
  await page.context().close()
  page = await fresh()
  await go(page, 'quals')
  await page.click('#qEdit'); await page.waitForTimeout(300)
  await page.click('#qEditQuals'); await page.waitForTimeout(300)
  await page.fill('#qNewQual', 'LOW LEVEL')
  await shot(page, 'quals-4', { x: 0, y: 30, w: 840, h: 630 }, [
    { n: 4, sel: '#qEditQuals', pos: 'b' }, { n: 5, sel: '#qNewQual' }, { n: 6, sel: '#qAddQualBtn', pos: 'r' },
  ])
  await page.context().close()
}
