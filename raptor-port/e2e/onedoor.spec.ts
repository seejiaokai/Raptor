/* [ONE-DOOR] (27 Sep 26) — THE ROUND TRIP IN A REAL BROWSER, desktop and phone.
   D309 / D310 (Admin → Users is the one door; Archive also suspends the sign-in; Restore brings both back), D323 (Archive
   is "posted out from today" on the Leave War, his past kept), D308 + D320 (Restore asks the post-in date; the months
   between read away), D305 (his first sign-in after Restore: "Welcome back — check your quals and CAT", Check my quals
   opens his own row). The calendar is fixed at 27 Sep 26 so the dates below are the demo war's. */
import { expect, test, type Page } from '@playwright/test'
import { login } from './app'

const TODAY = new Date(2026, 8, 27, 9, 0, 0)
const VIEWS = [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]] as const

async function goPage(page: Page, to: string) {
  await page.evaluate(p => (window as any).go(p), to)
  await page.waitForFunction(p => (window as any).CURPAGE === p, to)
  await page.waitForTimeout(350)
}
async function users(page: Page, phone: boolean) {
  await goPage(page, 'admin')
  if (phone) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(250) }
  await page.waitForSelector('#accList')
}
async function warMonth(page: Page, mon: string) {
  await goPage(page, 'leavewar')
  await page.waitForSelector('[data-testid="row-rocky"]')
  await page.locator(`[data-testid="month-${mon}"]`).click()
  await page.waitForTimeout(700)
}
const cellClass = (page: Page, d: string) => page.locator(`[data-testid="cell-rocky-${d}"]`).getAttribute('class')
async function signOut(page: Page) {
  for (const s of ['#logout']) { const l = page.locator(s); if (await l.count() && await l.isVisible()) { await l.click(); await page.waitForSelector('#luser'); return } }
  await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForSelector('#luser')
}

for (const [label, vp] of VIEWS) {
  test(`[ONE-DOOR] ${label}: Archive → away on the war → Restore from a later post-in → his welcome back → his own Quals row`, async ({ page }) => {
    await page.clock.setFixedTime(TODAY)
    await page.setViewportSize(vp)
    await login(page)
    const phone = label === 'phone'

    /* Archive, one tap (D310, D322) */
    await users(page, phone)
    await page.locator('#accList [data-person="rocky"] .acc-tap').click()
    await page.click('#accEdArchive')
    await expect(page.locator('#accList [data-person="rocky"]')).toHaveCount(0)
    await expect(page.locator('#accArchToggle')).toContainText('Archived · 1')

    /* the war: here until yesterday, away from today (D323) */
    await warMonth(page, 'SEP')
    expect(await cellClass(page, '2026-09-25')).not.toContain('gone')
    expect(await cellClass(page, '2026-09-28')).toContain('gone')

    /* Restore with a post-in date three weeks on (D308, D320) */
    await users(page, phone)
    await page.click('#accArchToggle')
    await page.locator('#accArchList [data-person="rocky"] .acc-tap').click()
    await page.fill('#accArPostIn', '2026-10-19')
    await page.click('#accArRestore')
    await expect(page.locator('#accList [data-person="rocky"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="dot-signin-rocky"]')).toHaveAttribute('aria-label', 'Can sign in')

    /* the months between read away; his earlier months stand; he counts again from the post-in */
    await warMonth(page, 'OCT')
    await expect(page.locator('[data-testid="cell-rocky-2026-10-05"]')).toHaveText('PO')
    expect(await cellClass(page, '2026-10-05')).toContain('gone')
    expect(await cellClass(page, '2026-10-19')).not.toContain('gone')

    /* his first sign-in after Restore (D305) */
    await signOut(page)
    await page.fill('#luser', 'hex'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
    await expect(page.locator('#welcomeBack')).toContainText('Welcome back, Hex — check your quals and CAT.')
    await page.click('#welcomeCheck')
    await page.waitForFunction(() => (window as any).CURPAGE === 'quals')
    await expect(page.locator('#welcomeBack')).toHaveCount(0)
    await expect(page.locator('#qtbl tr.back-hl td.qname[data-person="rocky"]')).toHaveCount(1)
  })
}
