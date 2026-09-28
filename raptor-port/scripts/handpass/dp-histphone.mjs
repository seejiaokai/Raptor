/* [DRAFT-PENDING] — mock-up for the owner's phone question (28 Sep 26): "it is not intuitive to know that the bubble function
   … is enabled because the window … blocks the view on the schedule". Real app, phone width. TODAY: the changes window's
   panel over the schedule. PROPOSED (drawn onto the real page for the picture — not built): the panel's header gains a
   "hide" (▾) that shrinks it to the slim bar; the bar says History is on; every detail with a history wears a small gold
   dot; a tap on one opens its bubble with the schedule in view. His own idea, the same hour: "Maybe when it hides on a
   phone it goes to the bottom of the screen". */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending') + '/histphone'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage()
const wait = ms => page.waitForTimeout(ms)
const shot = n => page.screenshot({ path: `${OUT}/${n}.png` })
await page.goto(BASE + '/?fresh=1')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await wait(400)
await page.evaluate(() => window.go('editsched')); await wait(500)

/* a few changes on Monday: a duty desk and two flying seats */
await page.evaluate(() => {
  const w = window
  const d = w.DAYS[0].dutywaves[0].rows; const ri = d.findIndex(r => r && r.id)
  if (ri >= 0) w.setSlotVal(`d:0.0.${ri}`, d[ri].id === 'mamba' ? 'pump' : 'mamba')
  w.setSlotVal('0.0.0.0.p', 'casper'); w.setSlotVal('0.0.1.0.w', 'static')
  w.afterSchedMutate()
})
await wait(400)
const top = () => page.evaluate(() => { const h = document.querySelector('#eWeek .day[data-day="0"] .day-head'); h && h.scrollIntoView({ block: 'start' }); window.scrollBy(0, 150) })

/* TODAY — the clock icon opens the window; the panel covers the lower half of the schedule */
await top(); await wait(200)
await page.click('#histBtn'); await wait(500)
await page.click('.chgwin .win-tab:has-text("All changes")'); await wait(300)
await shot('1-today')

/* PROPOSED — 2: the panel's header gains a hide (▾) and a hint line */
await page.evaluate(() => {
  const w = document.querySelector('.chgwin'); if (!w) return
  const x = w.querySelector('.win-x')
  /* a WORD on the button, not ▾ alone — his question (28 Sep 26): "how does one know that the action is to minimise?" */
  const b = document.createElement('button'); b.textContent = 'Hide ▾'; b.className = x.className; b.style.cssText = 'margin-right:6px;width:auto;padding:0 10px;font-weight:700;font-size:13px'; b.title = 'Hide the list — see the schedule'
  x.parentElement.insertBefore(b, x)
  const hint = document.createElement('div'); hint.id = 'mock-hint'
  hint.textContent = 'History on — tap a gold dot to see who changed it.'   // fewer words — his D339 correction
  hint.style.cssText = 'margin:6px 12px 0;padding:6px 10px;border-radius:8px;background:rgba(229,194,74,.12);border:1px solid rgba(229,194,74,.4);color:#F2D699;font-size:12.5px'
  const bar = w.querySelector('.win-bar'); bar && bar.after(hint)
})
await wait(200); await shot('2-proposed-panel')

/* PROPOSED — 3: ▾ shrinks it to the bar (drawn here with the app's own bar — a tap on a line gives it); the changed details
   wear a gold dot */
await page.addStyleTag({ content: `
  .mock-hist{position:relative}
  .mock-hist::after{content:'';position:absolute;right:-3px;bottom:-3px;width:8px;height:8px;border-radius:50%;background:#E5C24A;box-shadow:0 0 0 2px #10161d;z-index:5;pointer-events:none}
  input.mock-hist,textarea.mock-hist{box-shadow:inset 0 -2px 0 #E5C24A}` })
const applyMock = () => page.evaluate(() => {
  const w = window
  const cells = document.querySelectorAll('#eWeek [data-slot],#eWeek [data-bfld],#eWeek [data-txt],#eWeek [data-area],#eWeek [data-atime]')
  for (const el of cells) {
    const d = el.dataset, k = d.slot || d.bfld || d.txt || (d.area ? 'ar:' + d.area : d.atime ? 'at:' + d.atime : '')
    if (k && w.elogFor && w.elogFor(k)) el.classList.add('mock-hist')
  }
  const h = document.getElementById('mock-hint'); if (h) h.remove()
  document.querySelectorAll('.chgwin.bar .win-x').forEach((x, i) => { if (i > 0) x.remove() })
  const b = document.querySelector('.chgwin.bar .cw-barbtn')
  if (b) b.innerHTML = 'History on <span style="color:#9aa7b4;font-weight:600">· 5 changes</span> <span style="margin-left:8px;padding:3px 10px;border:1px solid #3a4b5c;border-radius:7px;white-space:nowrap">Show ▴</span>'; b.style.whiteSpace = 'nowrap'
})
await page.click('.chgwin .win-tab:has-text("All changes")'); await wait(300)
await page.locator('.chgwin button.cw-l').first().click(); await wait(500)
await applyMock(); await wait(100)
await page.evaluate(() => { const c = document.querySelector('#eWeek .day[data-day="0"] [data-slot="0.0.0.0.p"]'); c && c.scrollIntoView({ block: 'center' }) })
await wait(250); await applyMock(); await wait(150)
await shot('3-proposed-bar-dots')

/* PROPOSED — 4: a tap on a dotted detail opens its bubble, the schedule in full view */
const target = page.locator('#eWeek .day[data-day="0"] .mock-hist').first()
await target.scrollIntoViewIfNeeded(); await wait(150)
await target.tap().catch(() => target.click()); await wait(450)
await applyMock(); await wait(150)
await shot('4-proposed-bubble')
console.log('done → ' + OUT)
await browser.close()
