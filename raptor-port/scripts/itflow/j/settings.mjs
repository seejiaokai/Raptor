/* J14 — squadron settings and rules (admin): Admin → Squadron config (the default arrangement, the three template
   editors), the Logic page's Edit rules, and the "RULES MODIFIED" stamp it leaves on the schedule; then the three
   other doors to the same template editors, from Edit Schedule and the scheduler board. */
import { go } from '../lib.mjs'

export default async function ({ fresh, shot, around }) {
  let page = await fresh()
  await go(page, 'admin')
  await page.click('.adm-rail .adm-cat:has-text("Squadron config")'); await page.waitForTimeout(500)
  await page.click('#admSecDefault [data-adefrow="sims"] button[aria-label$="up"]'); await page.waitForTimeout(300)
  await shot(page, 'settings-1', { x: 270, y: 60, w: 900, h: 675 }, [
    { n: 1, sel: '.adm-rail .adm-cat:has-text("Squadron config")' },
    { n: 2, sel: '#admSecDefault [data-adefrow="sims"] button[aria-label$="up"]', pos: 'r' },
    { n: 3, sel: '#admDutyTpl' },
  ])
  await page.click('#admDutyTpl'); await page.waitForSelector('#tplModal')
  await page.waitForTimeout(300)
  await shot(page, 'settings-2', { x: 420, y: 200, w: 600, h: 450 }, [{ see: true, sel: '#tplModal' }])
  await page.click('#tplClose'); await page.waitForTimeout(300)
  await go(page, 'logic')
  await page.fill('#lgSearch', 'crew rest')
  await page.click('#lgEdit'); await page.waitForTimeout(300)
  const cell = page.locator('#lgBody input.lgin[data-lgset="crewRest"]').first()
  await cell.fill('11h'); await cell.press('Enter'); await page.waitForTimeout(400)
  await cell.scrollIntoViewIfNeeded()
  await shot(page, 'settings-3', { x: 0, y: 90, w: 1040, h: 780 }, [
    { n: 4, sel: '#lgSearch' }, { n: 5, sel: '#lgEdit:visible, #lgDone:visible', pos: 'b' }, { n: 6, sel: cell },
    { see: true, sel: '#lgOff' },
  ])
  await page.click('#lgDone'); await page.waitForTimeout(300)
  await go(page, 'viewsched')
  await shot(page, 'settings-4', await around(page, '#vBanner', 640, 480, 0.4, 0.2), [{ see: true, sel: '#vBanner.rules-off' }])
  await page.context().close()

  // the other doors to the same editors
  page = await fresh()
  await go(page, 'editsched')
  await page.click('[data-daytplopen="0"]'); await page.waitForTimeout(400)
  await shot(page, 'settings-w2', { x: 0, y: 220, w: 560, h: 420 }, [
    { n: 1, sel: '[data-daytplopen="0"]' }, { n: 2, sel: '.wavemenu [data-daytpledit]' },
  ])
  await page.mouse.click(1300, 800); await page.waitForTimeout(300)
  await page.click('.sb-open[data-sbday="0"]'); await page.waitForTimeout(800)
  const blk = page.locator('[data-dwadd="0"]').first()
  await blk.scrollIntoViewIfNeeded(); await blk.click(); await page.waitForTimeout(400)
  let b = await page.locator('.wavemenu').first().boundingBox()
  await shot(page, 'settings-w3', { x: Math.max(0, Math.min(b.x - 200, 880)), y: Math.max(0, Math.min(b.y - 120, 480)), w: 560, h: 420 }, [
    { n: 1, sel: blk }, { n: 2, sel: '.wavemenu [data-blkedit]', pos: 'r' },
  ])
  await page.mouse.click(40, 860); await page.waitForTimeout(300)
  const wv = page.locator('[data-wvadd="0"]').first()
  await wv.scrollIntoViewIfNeeded(); await wv.click(); await page.waitForTimeout(400)
  b = await page.locator('.wavemenu').first().boundingBox()
  await shot(page, 'settings-w4', { x: Math.max(0, Math.min(b.x - 200, 820)), y: Math.max(0, Math.min(b.y - 120, 435)), w: 620, h: 465 }, [
    { n: 1, sel: wv }, { n: 2, sel: '.wavemenu [data-wvedit]', pos: 'r' },
  ])
  await page.context().close()
}
