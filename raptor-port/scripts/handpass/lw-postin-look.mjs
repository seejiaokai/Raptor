// Chat 208 — HIS LOOK at pull request 857 on his own PC (27 Nov 26, through coordinator 206): a real browser WINDOW opened
// on his screen at the local build, the world already staged — Pelican added on Admin → Users (posted in today, a sign-in,
// nothing typed) and one pending LL of his on Tue 1 Dec (Auto-approve off) — left signed in as the admin on the Leave War
// grid. The window stays open until he closes it; nothing here is saved anywhere but that window's own browser.
// Run from this folder: PORT=<port> node lw-postin-look.mjs
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T } = L
import { chromium } from '@playwright/test'
const P_URL = L.PLAIN
const b = await chromium.launch({ ...L.launchOptions, headless: false, args: ['--start-maximized'] })
const ctx = await b.newContext({ viewport: null })
const page = await ctx.newPage()
const click = async sel => { await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.locator(sel).first().click(); await page.waitForTimeout(400) }
try {
  await page.goto(P_URL); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
  await page.locator('#accAddBlock').scrollIntoViewIfNeeded()
  if (await page.locator('#accAddModeNew').count()) await page.click('#accAddModeNew')
  await page.fill('#accAddCs', 'Pelican'); await page.fill('#accAddIni', 'PN')
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'OCU')
  await page.fill('#accAddName', 'pelican@mail')
  await page.click('#accAdd'); await page.waitForTimeout(900)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
  await click(T('lw-tab-balances')); await page.waitForSelector(T('balances-page'), { state: 'visible' }); await page.waitForTimeout(500)
  const pid = await page.evaluate(() => { for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith('Pelican')) return e.dataset.testid.slice(9); return null })
  if (!pid) throw new Error('Pelican not on the Balances page')
  await click(T('lw-tab-grid')); await page.waitForTimeout(500)
  await L.reachCell({ page }, pid, '2026-12-01')
  await click(T(L.cellId(pid, '2026-12-01'))); await page.waitForSelector(T('bid-picker'), { state: 'visible' })
  await L.approveWhatIEnter({ page }, false)
  await L.placeLeave({ page }, 'LL'); await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  console.log('READY — Pelican', pid, 'staged; the window is his until he closes it')
  await page.waitForEvent('close', { timeout: 0 })
} catch (e) {
  console.log('STOPPED:', e.message)
  await page.waitForEvent('close', { timeout: 0 }).catch(() => {})
} finally { await b.close().catch(() => {}) }
