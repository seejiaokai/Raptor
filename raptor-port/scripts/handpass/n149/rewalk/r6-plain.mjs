// Re-walk — the plain-user round (D1557) over what the fixes touched: the ☰ menu, Admin → Squadrons, Admin → Users, the
// bell with its Show row, the Leave War's Approvals. Each area's everyday task end to end, every control that opens or
// closes pressed each way it closes, and every other place that should show the result looked at. As Saber unless named.
import { serve, stop, newPage, signIn, pick, menuRows, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, bellOpen, bellLines, bellClose } from '../walk/w1-view.mjs'
import { step, as, press, drawerOpen, drawerItems, drawerCloseOutside, pageOn, adminPanel, sqRows, bellChips, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const T = id => `[data-testid="${id}"]`
const DAY = '2026-12-10'
const bellShown = s => vis(s, '[data-testid="bell-list"]')
async function tapOutside(s) { const W = s.page.viewportSize().width; if (s.desk) await s.page.mouse.click(W / 2, 700); else await s.page.touchscreen.tap(W / 2, 760); await s.page.waitForTimeout(400) }
async function cell(s, pid, d) {
  const l = s.page.locator(T(`cell-${pid}-${d}`)).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(350)
  const b = await l.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(600)
}
const cellText = (s, pid, d) => s.page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? (c.textContent.trim() + ' | ' + c.className) : null }, [pid, d])

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r6-${sz}`
    await signIn(s, 'ad', 'a')
    await step('☰ menu: open and close every way', async () => {
      if (s.desk) await s.page.setViewportSize({ width: 860, height: 864 })
      await s.page.waitForTimeout(400); facts[`${P}-menu-btn`] = await vis(s, '#burger')
      await drawerOpen(s, `${P}-m1-open`); facts[`${P}-menu-open1`] = await vis(s, '#drawer.open'); await shot(s, `${P}-m1-menu-open.png`)
      facts[`${P}-menu-closed-shade`] = await drawerCloseOutside(s)
      if (s.desk) { await drawerOpen(s); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-menu-closed-escape`] = !(await vis(s, '#drawer.open')) }
      await drawerOpen(s); const a = s.page.locator('#drawerNav a', { hasText: 'Admin' }).first()
      if (s.desk) await a.click(); else await a.tap()
      await s.page.waitForTimeout(600); facts[`${P}-menu-pick-admin`] = { page: await pageOn(s), open: await vis(s, '#drawer.open') }
      await shot(s, `${P}-m2-menu-picked-admin.png`)
      if (s.desk) { await s.page.setViewportSize({ width: 1536, height: 864 }); await s.page.waitForTimeout(400) }
    })
    await step('bell: open and close every way', async () => {
      await press(s, '#notifyBell:visible', `${P}-b1-open`); facts[`${P}-bell-open`] = await bellShown(s)
      await press(s, '#notifyBell:visible', `${P}-b1-close-btn`); facts[`${P}-bell-closed-by-button`] = !(await bellShown(s))
      await press(s, '#notifyBell:visible'); await tapOutside(s); facts[`${P}-bell-closed-outside`] = !(await bellShown(s))
      if (s.desk) { await press(s, '#notifyBell:visible'); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-bell-closed-escape`] = !(await bellShown(s)) }
    })
    await step('Squadrons: + New squadron opened and cancelled', async () => {
      await adminCat(s, 'Squadrons')
      await press(s, '#sqNew', `${P}-s1-new`); facts[`${P}-sq-form-open`] = await vis(s, '#sqNewNum')
      await s.page.fill('#sqNewNum', '151')
      await press(s, '#sqNewCancel', `${P}-s1-cancel`); facts[`${P}-sq-form-closed`] = !(await vis(s, '#sqNewNum')); facts[`${P}-sq-rows-after-cancel`] = await sqRows(s)
      await press(s, '#sqNew'); facts[`${P}-sq-form-reopened-num`] = await s.page.evaluate(() => document.querySelector('#sqNewNum')?.value ?? null)
      await press(s, '#sqNewCancel')
    })
    await step('Squadrons: make 150, then every place that shows it', async () => {
      await press(s, '#sqNew'); await s.page.fill('#sqNewNum', '150'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      await press(s, '#sqNewSave', `${P}-s2-save`); facts[`${P}-sq150-toast`] = await toastText(s); facts[`${P}-sq150-rows`] = await sqRows(s)
      await shot(s, `${P}-s2-150-made.png`)
      facts[`${P}-sq150-menu`] = await menuRows(s)
      await bellOpen(s); facts[`${P}-sq150-bell-show`] = await bellChips(s); await bellClose(s)
      await adminCat(s, 'Users'); await openRow(s, 'prowler'); facts[`${P}-sq150-hunter-lines`] = await text(s, '[data-testid="acc-sq"]')
      await shot(s, `${P}-s3-hunter-row-150.png`, ['[data-testid="acc-sq"]'])
      await press(s, '#accEdCancel'); facts[`${P}-row-closed-cancel`] = !(await vis(s, '[data-testid="acc-sq"]'))
    })
    await as(s, 'ad2', 'a2')
    await step('Hunter sees 150', async () => {
      facts[`${P}-hunter-menu-150`] = await menuRows(s)
      await bellOpen(s); facts[`${P}-hunter-bell-150`] = await bellLines(s); await shot(s, `${P}-s4-hunter-bell-150.png`, ['[data-testid="bell-list"]']); await bellClose(s)
    })
    await as(s, 'ad', 'a')
    await step('Users: search, filter open and closed, a row opened and closed', async () => {
      await adminCat(s, 'Users')
      await s.page.fill('#accFind', 'Kes'); await s.page.waitForTimeout(300)
      facts[`${P}-u-find`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-person]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.getAttribute('data-person')))
      await s.page.fill('#accFind', ''); await s.page.waitForTimeout(300)
      await press(s, '#accFilter', `${P}-u1-filter`); facts[`${P}-u-filter-open`] = await vis(s, '#accFilterPanel')
      await shot(s, `${P}-u1-filter-open.png`, ['#accFilterPanel', '#accFilter'])
      await press(s, '#accFilter'); facts[`${P}-u-filter-closed-btn`] = !(await vis(s, '#accFilterPanel'))
      await press(s, '#accFilter'); await tapOutside(s); facts[`${P}-u-filter-closed-outside`] = !(await vis(s, '#accFilterPanel'))
      if (s.desk) { await press(s, '#accFilter'); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-u-filter-closed-escape`] = !(await vis(s, '#accFilterPanel')) }
      await openRow(s, 'bane'); facts[`${P}-u-row-open`] = await vis(s, '[data-testid="acc-sq"]')
      if (s.desk) { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-u-row-closed-escape`] = !(await vis(s, '[data-testid="acc-sq"]')) }
      if (await vis(s, '#accEdCancel')) await press(s, '#accEdCancel')
    })
    await step('Squadrons: Undo 150 (clean)', async () => {
      await adminCat(s, 'Squadrons'); await press(s, '#undoBtn:visible'); facts[`${P}-undo150`] = { toast: await toastText(s), panel: await adminPanel(s), rows: await sqRows(s) }
    })
    await step('Leave War: December opened, Approvals pressed through', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
      await s.page.keyboard.press('Escape').catch(() => {}); await s.page.waitForTimeout(300)
      await press(s, T('lw-tab-approvals'))
    })
    await as(s, 'us', 'us')
    await step('Ranger bids 10 Dec', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await cell(s, 'bane', DAY)
      await press(s, T('bid-LL')); await s.page.waitForTimeout(400)
      facts[`${P}-ranger-cell-placed`] = await cellText(s, 'bane', DAY)
      await press(s, '#notifyBell:visible'); facts[`${P}-ranger-bell-before`] = await bellLines(s); await bellClose(s)
    })
    await as(s, 'ad', 'a')
    await step('Approvals: New, All, Pick dates open and closed, Approve', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      await press(s, T('lw-tab-approvals'), `${P}-a1-tab`); await s.page.waitForTimeout(500)
      facts[`${P}-a-tab`] = await text(s, T('lw-tab-approvals'))
      await press(s, T('appr-new'), `${P}-a1-new`); facts[`${P}-a-new-lines`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.dataset.testid))
      await shot(s, `${P}-a1-new-only.png`)
      await press(s, T('appr-all')); facts[`${P}-a-all-count`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0).length)
      await press(s, T('appr-pick'), `${P}-a2-pick`); facts[`${P}-a-pick-open`] = await s.page.evaluate(() => document.querySelector('[data-testid="appr-pick"]')?.getAttribute('aria-expanded'))
      await shot(s, `${P}-a2-pick-open.png`)
      await press(s, T('appr-pick')); facts[`${P}-a-pick-closed-btn`] = await s.page.evaluate(() => document.querySelector('[data-testid="appr-pick"]')?.getAttribute('aria-expanded'))
      if (s.desk) { await press(s, T('appr-pick')); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); facts[`${P}-a-pick-closed-escape`] = await s.page.evaluate(() => document.querySelector('[data-testid="appr-pick"]')?.getAttribute('aria-expanded')) }
      const line = s.page.locator('[data-testid="approvals-page"] [data-testid="appr-line-bane"]').filter({ hasText: '10 Dec' }).first()
      facts[`${P}-a-ranger-line`] = (await line.count()) ? (await line.innerText()).replace(/\s+/g, ' ').slice(0, 80) : null
      if (await line.count()) { const b = line.locator('[data-testid="appr-approve"]'); if (s.desk) await b.click(); else await b.tap(); await s.page.waitForTimeout(700) }
      facts[`${P}-a-after-approve`] = { toast: await toastText(s), line: (await line.count()) ? (await line.innerText()).replace(/\s+/g, ' ').slice(0, 80) : null, tab: await text(s, T('lw-tab-approvals')) }
      await shot(s, `${P}-a3-approved.png`)
      await press(s, T('lw-tab-grid')); await s.page.waitForTimeout(800)
      facts[`${P}-a-grid-cell`] = await cellText(s, 'bane', DAY)
      await s.page.locator(T(`cell-bane-${DAY}`)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(300)
      await shot(s, `${P}-a4-grid-approved.png`)
    })
    await as(s, 'us', 'us')
    await step('Ranger sees it approved', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
      facts[`${P}-ranger-cell-after`] = await cellText(s, 'bane', DAY)
      await press(s, '#notifyBell:visible'); facts[`${P}-ranger-bell-after`] = await bellLines(s)
      await shot(s, `${P}-a5-ranger-bell.png`, ['[data-testid="bell-list"]']); await bellClose(s)
    })
    await s.ctx.close()
  }
} finally { save('r6'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
