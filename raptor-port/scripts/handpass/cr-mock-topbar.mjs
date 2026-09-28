/* D347 mock-up (28 Sep 26) — "all undo and redo buttons should be at the top bar … standardised … Like how the edit
   schedule is" · "Review both desktop and mobile too". Pictures of the REAL built app, BEFORE and AFTER, at desktop and
   phone. AFTER is made by moving the app's own buttons in the page (the same markup and stylesheet the build will use):
   Edit Schedule's pair (`.tb-hist` — Undo, Redo) is put in the same place of the top bar on every other page that
   changes something the one Undo takes back; the Leave War's pair leaves its Period row; the Tracker's own pair leaves
   its header. Nothing is saved; the page is thrown away. HP_URL (default http://localhost:4173), HP_SHOTS. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4173'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-change-recording') + '/mock'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })

async function run(tag, W, H) {
  const phone = W < 700
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, ...(phone ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  const go = async (p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await page.waitForTimeout(900) }
  /* the top bar's own height, so each picture shows the bar and a little of the page under it */
  const clip = async () => {
    const h = await page.evaluate(() => { const t = document.querySelector('.topbar'); return t ? t.getBoundingClientRect().bottom : 120 })
    return { x: 0, y: 0, width: W, height: Math.min(H, Math.ceil(h) + (phone ? 360 : 240)) }
  }
  const shot = async (name) => page.screenshot({ path: `${OUT}/${tag}-${name}.png`, clip: await clip() })

  /* Edit Schedule — the model the others follow */
  await go('editsched')
  const pair = await page.evaluate(() => {
    const h = document.querySelector('.tb-hist')
    if (!h) return null
    const c = h.cloneNode(true)
    c.querySelector('#histBtn')?.remove()   // the changes clock stays Edit Schedule's own (D171, D338 (9))
    c.querySelectorAll('[id]').forEach(e => e.id = e.id + 'Mock')
    return c.outerHTML
  })
  await shot('00-editsched')

  const addPair = async () => page.evaluate((html) => {
    const sp = document.querySelector('.topbar .spring')
    if (!sp || sp.querySelector('.tb-hist')) return
    sp.insertAdjacentHTML('afterbegin', html)
    /* as on Edit Schedule's phone bar (scheduler.css `.topbar.editing .fastsync #syncLbl`): the sync chip shrinks to its
       dot, so the bar's right end reads the same on every page — dot · bell · Undo · Redo */
    if (window.innerWidth <= 820) {
      const l = document.getElementById('syncLbl'); if (l) l.style.display = 'none'
      const f = document.getElementById('fastSync'); if (f) f.style.padding = '6px 8px'
    }
  }, pair)

  for (const p of ['inputs', 'quals', 'logic', 'admin']) {
    await go(p)
    await shot(`${p}-before`)
    await addPair(); await page.waitForTimeout(200)
    await shot(`${p}-after`)
  }

  await go('leavewar')
  await page.waitForTimeout(1200)
  await shot('leavewar-before')
  await addPair()
  await page.evaluate(() => { const h = document.querySelector('[data-testid="lw-hist"]'); if (h) h.style.display = 'none' })
  await page.waitForTimeout(200)
  await shot('leavewar-after')

  await go('tracker')
  await page.waitForTimeout(2500)
  await shot('tracker-before')
  await addPair()
  await page.evaluate(() => { for (const id of ['trUndoBtn', 'trRedoBtn']) { const b = document.getElementById(id); if (b) b.style.display = 'none' } })
  await page.waitForTimeout(200)
  await shot('tracker-after')

  /* the board — its own top bar (it covers the app's) */
  await go('editsched')
  await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(900)
  const bh = await page.evaluate(() => { const t = document.querySelector('#schedBoard .sb-top'); return t ? t.getBoundingClientRect().bottom : 140 })
  await page.screenshot({ path: `${OUT}/${tag}-board-before.png`, clip: { x: 0, y: 0, width: W, height: Math.min(H, Math.ceil(bh) + 160) } })
  await ctx.close()
}

await run('desktop', 1440, 900)
await run('phone', 390, 844)
await browser.close()
console.log('mock pictures in', OUT)
