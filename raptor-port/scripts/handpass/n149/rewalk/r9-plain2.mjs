// Re-walk round 2 — the plain-user round (D1557) over the Leave War (Grid, Approvals, Balances, OIL) and Admin's panels,
// as Saber, 142 then 149 picked: every tab pressed, every opener and closer pressed each way it closes; the tabs read for
// whose people they show after each pick. By presses only.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat } from '../walk/w1-view.mjs'
import { step, press, pageOn, adminPanel, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const T = id => `[data-testid="${id}"]`
const P149 = ['kes9', 'osp9', 'mer9', 'har9', 'fal9', 'her9', 'rav9', 'shr9', 'con9', 'gan9']
const whose = s => s.page.evaluate(P149 => {
  const v = e => e.getBoundingClientRect().height > 0
  const ids = [...document.querySelectorAll('#page-leavewar [data-testid^="row-"], [data-testid^="bal-row-"], [data-testid^="oil-row-"], [data-testid^="appr-line-"]')].filter(v).map(e => e.dataset.testid.replace(/^(row|bal-row|oil-row|appr-line)-/, ''))
  return { n: ids.length, of149: ids.filter(i => P149.includes(i)).length, of142: ids.filter(i => !P149.includes(i)).length }
}, P149)
const shown = (s, id) => vis(s, T(id))
async function outside(s) { const W = s.page.viewportSize().width; if (s.desk) await s.page.mouse.click(W - 20, 820); else await s.page.touchscreen.tap(W - 12, 840); await s.page.waitForTimeout(400) }
async function cellPress(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first(); if (!(await l.count())) return false
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(300)
  const b = await l.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(600); return true
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r9-${sz}`
    await signIn(s, 'ad', 'a')
    for (const sq of ['142', '149']) {
      await step(`Leave War tabs ${sq}`, async () => {
        await navTo(s, 'View-only Sched'); await pick(s, sq); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
        for (const t of ['lw-tab-grid', 'lw-tab-approvals', 'lw-tab-balances', 'oil-tracker']) {
          await press(s, T(t), `${P}-${sq}-${t}`); await s.page.waitForTimeout(700)
          facts[`${P}-${sq}-${t}`] = await whose(s)
          await shot(s, `${P}-${sq}-${t}.png`)
          if (t === 'oil-tracker') await press(s, T('oil-close'))
        }
      })
    }
    await step('Grid: a day window, closed by ✕, the shade and Escape', async () => {
      await press(s, T('lw-tab-grid')); await s.page.waitForTimeout(600)
      const pid = 'kes9', d = '2026-12-16'
      await cellPress(s, pid, d); facts[`${P}-day-open`] = await shown(s, 'bid-picker'); await shot(s, `${P}-g1-day-window.png`)
      await press(s, T('bid-cancel')); facts[`${P}-day-closed-x`] = !(await shown(s, 'bid-picker'))
      if (s.desk) {   // on the phone the day window is a whole page: no shade beside it, ✕ closes it
        await cellPress(s, pid, d); if (await vis(s, T('sheet-scrim'))) { await press(s, T('sheet-scrim')) } else await outside(s)
        facts[`${P}-day-closed-shade`] = !(await shown(s, 'bid-picker'))
      }
      if (s.desk) { await cellPress(s, pid, d); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-day-closed-escape`] = !(await shown(s, 'bid-picker')) }
      if (await shown(s, 'bid-picker')) await press(s, T('bid-cancel'))
    })
    await step('Grid: Legend, period picker, ⚙, My leave', async () => {
      await press(s, T('legend-open'), `${P}-g2-legend`); facts[`${P}-legend-open`] = await shown(s, 'legend')
      // a tap beside the Legend's box (the shade's centre lies under the box itself, so it is tapped at its edge)
      if (s.desk) { if (await vis(s, T('legend-scrim'))) await press(s, T('legend-scrim')); else await press(s, T('legend-open')) }
      else { await s.page.touchscreen.tap(20, 760); await s.page.waitForTimeout(400) }
      facts[`${P}-legend-closed`] = !(await shown(s, 'legend'))
      await press(s, T('war-picker'), `${P}-g3-period`); facts[`${P}-period-open`] = await s.page.evaluate(() => document.querySelector('[data-testid="war-picker"]')?.getAttribute('aria-expanded'))
      await shot(s, `${P}-g3-period-open.png`)
      if (s.desk) await s.page.keyboard.press('Escape'); else await outside(s)
      await s.page.waitForTimeout(300); facts[`${P}-period-closed`] = await s.page.evaluate(() => document.querySelector('[data-testid="war-picker"]')?.getAttribute('aria-expanded'))
      await press(s, T('settings-open'), `${P}-g4-settings`); facts[`${P}-settings-open`] = await shown(s, 'settings-sheet')
      await shot(s, `${P}-g4-settings-open.png`)
      if (await vis(s, T('settings-close'))) await press(s, T('settings-close')); else await s.page.keyboard.press('Escape')
      facts[`${P}-settings-closed`] = !(await shown(s, 'settings-sheet'))
      facts[`${P}-my-leave-shown`] = await vis(s, T('my-leave'))   // a member's; read only
    })
    await step('Balances: search and its view switch', async () => {
      await press(s, T('lw-tab-balances')); await s.page.waitForTimeout(600)
      if (!(await vis(s, T('bal-search')))) { await press(s, T('bal-search-open'), `${P}-b0-search-open`); facts[`${P}-bal-search-opened`] = await vis(s, T('bal-search')) }   // the phone's ⌕
      await s.page.locator(T('bal-search')).first().fill('Osp'); await s.page.waitForTimeout(300); facts[`${P}-bal-search`] = await whose(s)
      await s.page.locator(T('bal-search')).first().fill(''); await s.page.waitForTimeout(300); facts[`${P}-bal-cleared`] = await whose(s)
      await press(s, T('bal-view-taken')); facts[`${P}-bal-taken`] = await s.page.evaluate(() => document.querySelector('[data-testid="bal-view-taken"]')?.getAttribute('aria-pressed'))
      await shot(s, `${P}-b1-balances-taken.png`)
      await press(s, T('bal-view-bal'))
    })
    await step('OIL: a credit form opened and cancelled, ? and ⚙', async () => {
      await press(s, T('oil-tracker')); await s.page.waitForTimeout(600)
      const nm = s.page.locator(T('oil-name-kes9')).first(); if (s.desk) await nm.click(); else await nm.tap(); await s.page.waitForTimeout(400)
      facts[`${P}-oil-form-open`] = await shown(s, 'oil-credit-panel'); await shot(s, `${P}-o1-oil-form.png`)
      // the short form has no Cancel: the name pressed again lets him go
      if (s.desk) await nm.click(); else await nm.tap(); await s.page.waitForTimeout(400)
      facts[`${P}-oil-form-closed`] = !(await shown(s, 'oil-credit-panel'))
      await press(s, T('oil-legend')); facts[`${P}-oil-legend`] = await s.page.evaluate(() => document.querySelector('[data-testid="oil-legend"]')?.getAttribute('aria-expanded'))
      await press(s, T('oil-legend')); facts[`${P}-oil-legend-2`] = await s.page.evaluate(() => document.querySelector('[data-testid="oil-legend"]')?.getAttribute('aria-expanded'))
      await press(s, T('oil-settings')); facts[`${P}-oil-settings`] = await shown(s, 'oil-settings-done'); await shot(s, `${P}-o2-oil-settings.png`)
      await press(s, T('oil-settings-done')); facts[`${P}-oil-settings-back`] = !(await shown(s, 'oil-settings-done')) && await shown(s, 'oil-row-kes9')
      // the OIL tracker is a window over the whole page: closed by its ✕, and (desktop) by Escape
      await press(s, T('oil-close')); facts[`${P}-oil-closed-x`] = !(await shown(s, 'oil-row-kes9'))
      if (s.desk) { await press(s, T('oil-tracker')); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(400); facts[`${P}-oil-closed-escape`] = !(await shown(s, 'oil-row-kes9')); if (!facts[`${P}-oil-closed-escape`]) await press(s, T('oil-close')) }
    })
    await step("Admin's panels, 149 picked then 142", async () => {
      for (const sq of ['149', '142']) {
        if (sq === '142') await pick(s, '142')
        for (const c of ['Users', 'Squadrons', 'Squadron config', 'Data']) {
          await adminCat(s, c); facts[`${P}-adm-${sq}-${c}`] = { panel: await adminPanel(s), title: await s.page.evaluate(() => [...document.querySelectorAll('#page-admin h2, #page-admin h3, #page-admin .adm-pane-t')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 2)) }
          await shot(s, `${P}-adm-${sq}-${c.replace(/\W+/g, '')}.png`)
        }
        if (!s.desk) { facts[`${P}-adm-back-${sq}`] = await vis(s, '.adm-back'); if (facts[`${P}-adm-back-${sq}`]) { await press(s, '.adm-back:visible'); facts[`${P}-adm-list-${sq}`] = await vis(s, '#page-admin button.adm-cat') } }
      }
    })
    await s.ctx.close()
  }
} finally { save('r9'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
