/* [DB-READINESS] group A, phase 5 — a LOOK at a shared store's first boot (30 Sep 26), before the group's FULL walk.
   Drives a production bundle BUILT WITH THE BLANK POLICY — the setting IT will use:
     VITE_SEED_DEMO=false VITE_BOOTSTRAP_ADMIN='{"principal":"boss@unit.example","person":{"cs":"Boss","ini":"BS","seat":"FCP","cat":"A"}}' \
       npx vite build --outDir dist-blank && npx vite preview --outDir dist-blank --port 4191
   in a real Chromium on the BROWSER backend. Every step asserts the RIGHT behaviour, so re-running it is the re-look:
     1. a brand-new browser: the sign-in card; no demo account signs in (ad / a lands on "Request access");
     2. the first admin signs in; the schedule is blank; the Leave War says "No leave period yet" and offers him
        "Create the first period" (the New-war sheet opens); the Tracker says "No course yet" with its two ways in;
     3. storage holds only the stamp, his person, his account, the change log and the Tracker's own bookkeeping —
        no request, week, planning note, Leave War record, course or student;
     4. the same two empty pages at phone width.
   Pictures: docs/img/handpass/2026-09-30-dbr-phase5/. */
import { mkdirSync, existsSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4191'
const SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbr-phase5'
mkdirSync(SHOTS, { recursive: true })

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }

async function signIn(page, user, pass) {
  await page.waitForSelector('#luser', { state: 'visible' })
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
}
async function go(page, p) {
  await page.evaluate(x => window.go(x), p)
  await page.waitForFunction(x => window.CURPAGE === x, p)
}
const keys = page => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:')).sort())

const browser = await chromium.launch({ headless: true, ...launchOptions })
const errors = []
try {
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport })
    const page = await ctx.newPage()
    page.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
    page.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
    page.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
    await page.goto(BASE + '/')

    if (label === 'desktop') {
      // 1 — no demo account signs in
      await signIn(page, 'ad', 'a')
      await page.waitForTimeout(800)
      const shell = await page.locator('#shell').count()
      check('a demo sign-in (ad / a) does not open the app', shell === 0)
      await page.screenshot({ path: `${SHOTS}/1-demo-signin-refused.png` })
      await page.evaluate(() => { localStorage.removeItem('raptor:session') })
      await page.goto(BASE + '/')
    }

    // 2 — the first admin
    await signIn(page, 'boss@unit.example', 'anything')
    await page.waitForSelector('#shell', { state: 'visible' })
    await page.waitForTimeout(800)
    await go(page, 'editsched')
    await page.waitForTimeout(600)
    /* the days only — the crew sidebar beside them lists everyone on the roster (him and the two placeholder pucks); on
       the days he is the one person, so each day's available-crew list holds him alone (`.me` — his own puck) */
    const others = await page.locator('#page-editsched section.day .puck:not(.me)').count()
    const him = await page.locator('#page-editsched section.day .puck.me').count()
    check(`${label}: the first admin is in; the schedule holds nobody but him`, others === 0 && him > 0, `${others} other pucks, him on ${him} days`)
    await page.screenshot({ path: `${SHOTS}/2-${label}-edit-schedule-blank.png` })

    await go(page, 'leavewar')
    await page.waitForSelector('#page-leavewar [data-testid="lw-empty"]', { state: 'visible' })
    const lwText = await page.locator('#page-leavewar [data-testid="lw-empty"]').innerText()
    check(`${label}: the Leave War says there is no leave period yet`, /no leave period yet/i.test(lwText))
    check(`${label}: … and offers the admin "Create the first period"`, await page.locator('[data-testid="lw-first-war"]').isVisible())
    await page.screenshot({ path: `${SHOTS}/3-${label}-leavewar-empty.png` })
    if (label === 'desktop') {
      await page.click('[data-testid="lw-first-war"]')
      await page.waitForSelector('[data-testid="war-sheet"]', { state: 'visible' })
      check('desktop: the New-war sheet opens from it', true)
      await page.screenshot({ path: `${SHOTS}/4-desktop-leavewar-new-sheet.png` })
      await page.click('[data-testid="war-cancel"]')
    }

    await go(page, 'tracker')
    await page.waitForSelector('#page-tracker [data-testid="trk-nocourse"]', { state: 'visible', timeout: 20000 })
    const trText = await page.locator('#page-tracker [data-testid="trk-nocourse"]').innerText()
    check(`${label}: the Tracker says there is no course yet`, /no course yet/i.test(trText))
    check(`${label}: … with Add a course and Import a file`, await page.locator('[data-testid="trk-first-course"]').isVisible() && await page.locator('[data-testid="trk-first-import"]').isVisible())
    await page.screenshot({ path: `${SHOTS}/5-${label}-tracker-nocourse.png` })

    if (label === 'desktop') {
      // 3 — what storage holds
      await page.waitForTimeout(800)
      const k = await keys(page)
      const bad = k.filter(x => /^raptor:(inputs|weeks|plan|leavewar)\//.test(x) || /STUDENT|26ABSG/.test(x))
      const people = k.filter(x => x.startsWith('raptor:people/'))
      const accounts = k.filter(x => x.startsWith('raptor:settings/account:'))
      check('storage: no request, week, planning note or Leave War record', bad.length === 0, bad.join(', '))
      check('storage: one person and one account — his', people.length === 1 && accounts.length === 1, `${people.length} person, ${accounts.length} account`)
      const trk = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/')).map(k => k + '=' + localStorage.getItem(k)).join('\n'))
      check('storage: the Tracker names no course and no student', !/26ABSG|STUDENT/.test(trk))
      console.log('stored keys:\n  ' + k.join('\n  '))
    }
    await ctx.close()
  }
} finally {
  await browser.close()
}
check('no console error, page error or failed request', errors.length === 0, errors.join(' | '))
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
