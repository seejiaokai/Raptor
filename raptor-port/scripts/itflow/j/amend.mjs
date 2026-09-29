/* J4 — amend a published day; J5 — alternate plans; J16 — undo, redo and the change history (admin, Edit Schedule,
   Monday 13 Jul). Each starts by publishing Monday, in the same page. */
import { go } from '../lib.mjs'

const SODB_END = '#eWeek .day[data-day="0"] [data-txt="ap:0.0.end"]'

async function setTime(page, sel, v) {
  const el = page.locator(sel).first()
  await el.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v)
  await page.mouse.click(1300, 880); await page.waitForTimeout(500)
}

export default async function ({ fresh, shot, publishDay, span, around, drag }) {
  // J4 — amend
  let page = await fresh()
  await go(page, 'editsched')
  await publishDay(page, 0)
  const C = { x: 0, y: 225, w: 560, h: 420 }
  await shot(page, 'amend-1', C, [{ see: true, sel: '#eWeek .day[data-day="0"] .dhver' }, { see: true, sel: '#eWeek .day[data-day="0"] button.dunpub' }])
  await setTime(page, SODB_END, '08:30')
  const C2 = await span(page, [SODB_END, '#eWeek .day[data-day="0"] .dpend', '#eWeek .day[data-day="0"] .nysmark'], { pad: 40 })
  await shot(page, 'amend-2', C2, [
    { n: 1, sel: SODB_END, pos: 'r' }, { see: true, sel: '#eWeek .day[data-day="0"] .dpend' },
    { see: true, sel: '#eWeek .day[data-day="0"] .nysmark' },
  ])
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const s = `select[data-sign="${k}"][data-signday="0"]`
    const v = await page.$eval(s, el => [...el.options].find(o => o.value)?.value)
    await page.selectOption(s, v); await page.waitForTimeout(200)
  }
  const AL = '#eWeek .day[data-day="0"] button[data-alpub="0"]'
  await shot(page, 'amend-3', await span(page, [AL, 'select[data-sign="appr"][data-signday="0"]'], { pad: 40 }), [
    { n: 2, sel: '#eWeek [data-signbar="0"]', pos: 'b' }, { n: 3, sel: AL, pos: 'r' },
  ])
  await page.click(AL); await page.waitForTimeout(900)
  await shot(page, 'amend-4', C, [{ see: true, sel: '#eWeek .day[data-day="0"] .dhver' }, { n: 4, sel: '#eWeek .day[data-day="0"] button.dunpub', pos: 'b' }])
  await page.context().close()

  // J5 — alternate plans: the plan menu, + Alt Plan, switch between plans, look at an issued version
  page = await fresh()
  await go(page, 'editsched')
  await publishDay(page, 0)
  const PM = '#eWeek [data-planmenu="0"]'
  await page.click(PM); await page.waitForTimeout(400)
  await shot(page, 'plans-1', await span(page, [PM, '.wavemenu'], { pad: 30 }), [
    { n: 1, sel: PM, pos: 'r' }, { n: 2, sel: '.wavemenu [data-plandup]', pos: 'r' }, { see: true, sel: '.wavemenu [data-planpv]' },
  ])
  await page.click('.wavemenu [data-plandup]'); await page.waitForTimeout(700)
  await setTime(page, SODB_END, '08:30')
  await page.click(PM); await page.waitForTimeout(400)
  await shot(page, 'plans-2', await span(page, [PM, '.wavemenu'], { pad: 30 }), [
    { n: 3, sel: '.wavemenu [data-plansel]', pos: 'r' }, { see: true, sel: '.wavemenu [data-plangolive]' },
  ])
  await page.click('.wavemenu [data-plansel]'); await page.waitForTimeout(700)
  await shot(page, 'plans-3', C, [{ see: true, sel: '#eWeek .day[data-day="0"] .planselbtn, ' + PM }])
  await page.click(PM); await page.waitForTimeout(400)
  await page.click('.wavemenu [data-planpv]'); await page.waitForTimeout(700)
  await shot(page, 'plans-4', await span(page, ['#eWeek [data-golive="0"]', '#eWeek [data-restore="0"]'], { pad: 60 }), [
    { n: 4, sel: '#eWeek [data-golive="0"]', pos: 'b' }, { n: 5, sel: '#eWeek [data-restore="0"]', pos: 'b' },
  ])
  await page.context().close()

  // J16 — undo, redo, the change history
  page = await fresh()
  await go(page, 'editsched')
  await drag(page, '#eRoster .rpuck[data-person="beams"]', '#eWeek [data-fill="a:1.0.+"]')
  const H = { x: 560, y: 0, w: 880, h: 660 }
  await shot(page, 'hist-1', H, [{ n: 1, sel: '#undoBtn', pos: 'b' }, { n: 2, sel: '#redoBtn', pos: 'b' },
    { see: true, sel: '#eWeek [data-fill="a:1.0.+"] [data-person="beams"], #eWeek .day[data-day="1"] .puck[data-person="beams"]' }])
  await page.click('#histBtn'); await page.waitForTimeout(700)
  const all = page.locator('.chgwin .win-tab:has-text("All changes")').first()
  if (await all.count()) { await all.click(); await page.waitForTimeout(400) }
  const who = page.locator('.chgwin .cw-g-btn:has-text("Who")').first()
  await shot(page, 'hist-2', await span(page, ['#histBtn', '.chgwin'], { pad: 20 }), [
    { n: 3, sel: '#histBtn', pos: 'b' }, { n: 4, sel: all }, { n: 5, sel: who, pos: 'b' },
  ])
  const line = page.locator('.chgwin button.cw-l').first()
  await line.click(); await page.waitForTimeout(700)
  await shot(page, 'hist-3', await around(page, '.chgwin', 900, 675, 0.5, 0.4), [{ n: 6, sel: line, pos: 'l' }])
  await page.context().close()
}
