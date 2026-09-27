/* [DRAFT-PENDING] — pictures for the look card's question 10 (28 Sep 26): a MEMBER on View-only Sched taps a change about a
   published day whose issued face does not carry it. A — as built: the day switches to its Working draft and rings the
   change. B — the alternative put to him: the day stays on its issued face and says so. Phone width by default.
   The world, through the app: Saber signs and publishes Monday; Hex (given admin in place) hands Monday's SDO desk to
   someone else after publication, and puts a man on Tuesday; Ranger (a member) looks. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const W = +(process.env.HP_W || 390), H = +(process.env.HP_H || 844)
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending') + '/q10'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const phone = W < 700
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(phone ? { hasTouch: true, isMobile: true } : {}) })
const page = await ctx.newPage()
const wait = ms => page.waitForTimeout(ms)
const signIn = async (u, p) => {
  await page.waitForSelector('#luser'); await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await wait(500)
}
const signOut = async () => {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Logout|Sign out/.test(x.textContent || '')); b && b.click() })
  await page.waitForSelector('#luser')
}
const go = async (p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await wait(500) }

await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })

/* the world */
await signIn('ad', 'a')
await go('editsched')
await page.evaluate(d => window.openScheduler(d), 0); await page.waitForSelector('#schedBoard'); await wait(500)
{
  const sels = page.locator('#schedBoard [data-sign]:visible')
  const k = await sels.count()
  for (let i = 0; i < k; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await wait(150)
  }
  const beak = page.locator('#schedBoard [data-beak="0"]:visible').first()
  if (await beak.count() && !(await beak.isDisabled())) { await beak.click(); await wait(900) }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await wait(900) }
}
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await wait(400)
await signOut()
await signIn('hex', 'x')
await page.evaluate(() => window.raptorRole('admin'))
await go('editsched')
await page.evaluate(() => {
  const w = window, d0 = w.DAYS[0].dutywaves[0].rows
  const sdo = d0.findIndex(r => r && r.id)
  if (sdo >= 0) w.fillSlot(`d:0.0.${sdo}`, d0[sdo].id === 'mamba' ? 'pump' : 'mamba')
  /* …and a change on Tuesday (not published), so the member has a count to open the window from — with only Monday
     changed, a member on the issued view has no door at all until he picks Working draft (question 10's first half) */
  w.fillSlot('1.0.0.0.p', 'casper')
  w.afterSchedMutate()
})
await signOut()

/* Ranger (a member), View-only Sched */
await signIn('us', 'us')
await go('viewsched')
const dutyRow = async () => page.evaluate(() => {
  const day = document.querySelector('#vWeek .day[data-day="0"]')
  const el = day && [...day.querySelectorAll('*')].find(e => /^SDO$/.test((e.textContent || '').trim()))
  if (el) el.scrollIntoView({ block: 'center' })
  return !!el
})
const shot = async (name) => page.screenshot({ path: `${OUT}/${name}.png` })

/* 1 — Monday as issued: no count on its heading (it never reads pending), the SDO desk as it went out */
await page.selectOption('#vWeek .day[data-day="0"] select[data-vwork]', 'issued').catch(() => {}); await wait(300)
await page.evaluate(() => { const h = document.querySelector('#vWeek .day[data-day="0"] .day-head'); h && h.scrollIntoView({ block: 'start' }) })
await wait(200); await shot('1-monday-as-issued')
await dutyRow(); await wait(200); await shot('1b-monday-as-issued-sdo')

/* 2 — the changes window, opened from Tuesday's count, on Monday: the line about the SDO desk */
await page.click('#vWeek .day[data-day="1"] .day-head .dpend.dpendbtn'); await wait(400)
if (await page.locator('.chgwin.bar').count()) { await page.click('.chgwin.bar .cw-barbtn'); await wait(300) }
await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Mon")'); await wait(300)
await shot('2-window-monday-line')

/* 3A — as built: tap the line → Monday turns to its Working draft, the change ringed, the message */
const line = page.locator('.chgwin button.cw-l', { hasText: 'Hex' }).first()
await line.click(); await wait(450)
await shot('3a-as-built-working-draft')
/* …and Monday's heading now reads the Working draft — not issued */
await page.evaluate(() => { const h = document.querySelector('#vWeek .day[data-day="0"] .day-head'); h && h.scrollIntoView({ block: 'start' }) })
await wait(250); await shot('3a2-as-built-heading')

/* 3B — the alternative: back on the issued face, the window put away, the message instead */
await page.selectOption('#vWeek .day[data-day="0"] select[data-vwork]', 'issued').catch(() => {}); await wait(400)
await page.click('.chgwin .win-x').catch(() => {}); await wait(200)
await dutyRow(); await wait(200)
await page.evaluate(() => window.toast('That change isn’t on the issued schedule yet — pick Working draft to see it', 'warn'))
await wait(350)
await shot('3b-alternative-stays-issued')

console.log('done → ' + OUT)
await browser.close()
