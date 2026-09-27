/* [DRAFT-PENDING] first look (28 Sep 26): another scheduler's changes, then Saber opens the changes window.
   Hex signs in (a seeded member account, any password) and is given the admin role in place through the localhost
   bridge (§7.7 — the role only, not the world), makes changes on Tuesday (not yet published) and Monday (published),
   then signs out; Saber signs in and looks. Pictures to HP_SHOTS. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending/look'
const W = +(process.env.HP_W || 1440), H = +(process.env.HP_H || 900)
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: W, height: H } })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
const tag = W < 700 ? 'phone' : 'desktop'
const shot = async (n, loc) => { const p = `${SHOTS}/${tag}-${n}.png`; await (loc || page).screenshot({ path: p }); console.log('shot', p) }
const signIn = async (u, p) => {
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
const signOut = async () => { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Logout|Sign out/.test(x.textContent || '')); b && b.click() }); await page.waitForTimeout(600) }

await page.goto(BASE + '/?fresh=1')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await signIn('hex', 'x')
await page.evaluate(() => { window.raptorRole('admin') })
await page.waitForTimeout(300)
await page.evaluate(() => window.go('editsched'))
await page.waitForTimeout(600)
/* Hex puts two men on Tuesday's first line and moves one from a programme row — the app's own write funnel */
const r = await page.evaluate(() => {
  const out = []
  const tue = 1
  const f = window.DAYS[tue].waves[0].formations[0]
  const k1 = `${tue}.0.0.0.p`, k2 = `${tue}.0.0.0.w`
  out.push(['fill', k1, window.fillSlot(k1, 'casper')])
  out.push(['fill', k2, window.fillSlot(k2, 'bane')])
  window.afterSchedMutate()
  return { out, f: f.cs }
})
console.log('edits', JSON.stringify(r))
await page.waitForTimeout(400)
await shot('01-hex-edited')
await signOut()
await signIn('ad', 'a')
await page.evaluate(() => window.go('editsched'))
await page.waitForTimeout(800)
await shot('02-saber-editweek')
const chip = await page.$$eval('#eWeek .day-head .dpend', els => els.map(e => e.textContent + ' [' + e.className + ']'))
console.log('chips', JSON.stringify(chip))
const icon = await page.$eval('#histBtn', e => e.textContent + ' | ' + e.getAttribute('title')).catch(() => 'no icon')
console.log('icon', icon)
const og = await page.$$eval('#eWeek [data-og]', els => els.map(e => e.getAttribute('data-slot')))
console.log('og', JSON.stringify(og))
{ const box = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left - 20, y: r.top - 20, width: 360, height: 70 } })
  await page.waitForTimeout(300)
  const b2 = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => { const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left - 20), y: Math.max(0, r.top - 20), width: 360, height: 70 } })
  await page.screenshot({ path: `${SHOTS}/${tag}-02z-og-tags.png`, clip: b2 })
  const paint = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => { const s = getComputedStyle(e, '::after'); return s.content + ' ' + s.borderTopStyle + ' ' + s.color })
  console.log('og painted', paint) }
/* open the window from Tuesday's chip */
await page.click('#eWeek .day[data-day="1"] .dpend.dpendbtn')
await page.waitForTimeout(500)
await shot('03-window-tue')
const win = await page.$eval('.chgwin', e => e.innerText.slice(0, 600)).catch(() => 'no window')
console.log('window', JSON.stringify(win))
/* tap the first line: the window stays, the schedule goes there */
const line = await page.$('.chgwin .cw-l')
if (line) { await line.click(); await page.waitForTimeout(800); await shot('04-after-tap') }
console.log('window still open', await page.$('.chgwin:not([hidden])') != null)
/* Group by Where, All changes, the week */
await page.click('.chgwin .cw-g-btn:nth-of-type(2)').catch(() => {})
await page.click('.chgwin .win-tab:nth-of-type(2)').catch(() => {})
await page.waitForTimeout(300)
await shot('05-where-all')
await page.click('.chgwin .cw-day').catch(() => {})
await page.waitForTimeout(300)
await shot('06-week')
/* mark all as seen */
await page.click('.chgwin .win-tab:nth-of-type(1)').catch(() => {})
await page.click('.chgwin .cw-seen').catch(() => {})
await page.waitForTimeout(400)
await shot('07-seen')
console.log('chips after seen', JSON.stringify(await page.$$eval('#eWeek .day-head .dpend', els => els.map(e => e.textContent))))
console.log('og after seen', JSON.stringify(await page.$$eval('#eWeek [data-og]', els => els.length)))
console.log('errors', JSON.stringify(errors))
await browser.close()
