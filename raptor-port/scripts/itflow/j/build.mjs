/* J2 — make a schedule (admin), step by step (D412, D416): the two editing modes; then a BARE day (the week of
   Mon 27 Jul has seven empty days) built on the scheduler board in the order a scheduler works — a template,
   the programme, a wave and its line, a duty block, sims, the ground programme — and finally the issues. */
import { go } from '../lib.mjs'

export default async function ({ fresh, shot, boardTo, around, span, FULL }) {
  let page = await fresh()
  await go(page, 'editsched')
  // the two modes: the week (all seven days) and the board (one day, every tool)
  await shot(page, 'modes-week', FULL, [{ n: 1, sel: '#eWeek [data-sbday="0"]', pos: 'b' }])
  await page.click('#eWeek [data-sbday="0"]'); await page.waitForTimeout(900)
  await shot(page, 'modes-board', FULL, [{ n: 2, sel: '#sbDone', pos: 'b' }])
  await page.click('#sbDone'); await page.waitForTimeout(500)

  // a bare day: the week of 27 Jul
  await page.locator('button.wk[data-wk="27/07/2026"]:visible').first().click(); await page.waitForTimeout(900)
  await page.click('#eWeek [data-sbday="0"]'); await page.waitForTimeout(900)
  await page.click('#sbTpl'); await page.waitForTimeout(400)
  await shot(page, 'build-1', await around(page, '#sbTpl', 560, 420, 0.3, 0.12), [
    { n: 1, sel: '#sbTpl', pos: 'b' }, { see: true, sel: '.wavemenu' },
  ])
  await page.mouse.click(700, 880); await page.waitForTimeout(300)

  await boardTo(page, '[data-padd="0"]', 'mid')
  await page.click('[data-padd="0"]'); await page.waitForTimeout(400)
  const prog = page.locator('[data-bfld="ap:0.0.prog"]').first()
  await prog.fill('MASS BRIEF'); await prog.press('Tab')
  await page.waitForTimeout(300)
  await shot(page, 'build-2', await span(page, [prog, '[data-padd="0"]']), [
    { n: 2, sel: '[data-padd="0"]', pos: 'b' }, { n: 3, sel: prog },
  ])

  await boardTo(page, '[data-wvadd="0"]', 'mid')
  await page.click('[data-wvadd="0"]'); await page.waitForTimeout(400)
  await shot(page, 'build-3', await around(page, '.wavemenu', 700, 525, 0.55, 0.45), [
    { n: 4, sel: '[data-wvadd="0"]' }, { n: 5, sel: '.wavemenu [data-wmkind=""]' },
  ])
  await page.click('.wavemenu [data-wmkind=""]'); await page.waitForTimeout(600)
  const cs = page.locator('[data-bfld="ff:0.0.0.cs"]').first()
  await cs.fill('VL'); await cs.press('Tab'); await page.waitForTimeout(300)
  await boardTo(page, '[data-gline="0.0"]', 'mid')
  await shot(page, 'build-4', await span(page, ['[data-gline="0.0"]', cs]), [
    { n: 6, sel: '[data-gline="0.0"]', pos: 'b' }, { n: 7, sel: cs },
  ])

  await boardTo(page, '[data-dwadd="0"]', 'mid')
  await page.click('[data-dwadd="0"]'); await page.waitForTimeout(400)
  await shot(page, 'build-5', await around(page, '.wavemenu', 700, 525, 0.55, 0.45), [
    { n: 1, sel: '[data-dwadd="0"]' }, { n: 2, sel: '.wavemenu [data-blktpl="std"]' },
  ])
  await page.click('.wavemenu [data-blktpl="std"]'); await page.waitForTimeout(600)
  await boardTo(page, '[data-dwadd="0"]', 'mid')
  const role = page.locator('[data-bfld^="dl:0."]').first()
  await shot(page, 'build-6', await span(page, ['[data-dradd]', role]), [
    { n: 3, sel: '[data-dradd]', pos: 'b' }, { see: true, sel: role },
  ])

  await boardTo(page, '[data-sblkadd]', 'mid')
  await page.locator('[data-sblkadd]').first().click(); await page.waitForTimeout(500)
  await shot(page, 'build-7', await around(page, '[data-sblkadd]', 900, 675, 0.8, 0.3), [
    { n: 4, sel: '[data-sblkadd]', pos: 'b' },
  ])

  await boardTo(page, '[data-gradd="0"]', 'mid')
  await shot(page, 'build-8', await around(page, '[data-gradd="0"]', 900, 675, 0.8, 0.3), [
    { n: 5, sel: '[data-gradd="0"]', pos: 'b' }, { n: 6, sel: '[data-inpadd="0.g"]', pos: 'b' },
  ])
  await page.click('#sbDone'); await page.waitForTimeout(400)
  await page.context().close()

  // the issues: the week's bar opens a list; a tap on one takes you to the puck
  page = await fresh()
  await go(page, 'editsched')
  await page.click('#eWeek [data-daywarn="0"]'); await page.waitForTimeout(400)
  await shot(page, 'issues-1', { x: 0, y: 330, w: 560, h: 420 }, [
    { n: 1, sel: '#eWeek [data-daywarn="0"]', pos: 'b' }, { see: true, sel: '#eWeek [data-wdi="0"][data-wix="0"]' },
  ])
  await page.click('#eWeek [data-wdi="0"][data-wix="0"]'); await page.waitForTimeout(900)
  const lit = page.locator('#eWeek .seat.warnsel, #eWeek .seat.wsel, #eWeek .seat.hl-warn').first()
  const litCrop = (await lit.count()) ? await around(page, lit, 560, 420) : { x: 0, y: 330, w: 560, h: 420 }
  await shot(page, 'issues-2', litCrop, (await lit.count()) ? [{ see: true, sel: lit }] : [])
  await page.click('#eWeek [data-sbday="0"]'); await page.waitForTimeout(900)
  await shot(page, 'issues-3', { x: 840, y: 60, w: 600, h: 450 }, [])
  await page.context().close()
}
