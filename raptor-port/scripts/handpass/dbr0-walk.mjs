/* [DB-READINESS] group A, phase 0 — the walk of what phase 0 changes (30 Sep 26).
   Drives the production bundle (`npm run build && npx vite preview --port 4173`) in a real Chromium on the
   BROWSER backend. Every step asserts the RIGHT behaviour, so re-running it on a fixed build is the re-walk.
     1. a brand-new browser boots; the store is stamped as ONE object, started (`initialized`);
     2. the Leave War's saved demo sits on the ROSTER's people (SLIPWAY, WOLF …), never the vendored seed's
        invented callsigns (ramp, splice …) — and still does after a reload (the defect fixed in phase 0);
     3. a store stamped the old way (a bare number) boots as before and is upgraded to the object;
     4. a store written by a NEWER build is refused with "RAPTOR has been updated", and nothing is written.
   Pictures: docs/img/handpass/2026-09-30-dbr-phase0/. */
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
const SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbr-phase0'
mkdirSync(SHOTS, { recursive: true })

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }

async function signIn(page) {
  await page.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
  if (await page.locator('#luser').count()) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
const ls = (page, k) => page.evaluate(key => localStorage.getItem(key), k)
const schema = async page => { const r = await ls(page, 'raptor:settings/schema'); try { return JSON.parse(r) } catch { return r } }
const warPeople = async page => {
  const raw = await ls(page, 'raptor:leavewar/wars')
  const wars = JSON.parse(raw || '[]')
  return [...new Set(wars.flatMap(w => Object.keys(w.recs || {})))].sort()
}
const SEED_NAMES = ['ramp', 'splice', 'jaguar', 'asics', 'miles', 'cross', 'reset', 'dusk']
async function leaveWarShot(page, name) {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('#page-leavewar .mx', { state: 'visible' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOTS}/${name}.png` })
}

const browser = await chromium.launch({ headless: true, ...launchOptions })
const errors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })

  // 1 — a brand-new browser
  await page.goto(BASE + '/')
  await signIn(page)
  await page.waitForTimeout(800)                 // the save queue's 300 ms wait
  const s1 = await schema(page)
  check('first boot: the stamp is one object, started', !!s1 && typeof s1 === 'object' && s1.initialized === true && s1.dataFormatVersion === 5 && s1.stage === 1, JSON.stringify(s1))
  const p1 = await warPeople(page)
  check('first boot: the saved demo leave sits on the roster\'s people', p1.includes('slipway') && !p1.some(n => SEED_NAMES.includes(n)), p1.join(','))
  await leaveWarShot(page, '01-first-boot-leavewar')

  // 2 — the reload (the sign-in reloads the page too)
  await page.reload()
  await signIn(page)
  const p2 = await warPeople(page)
  check('after a reload: still on the roster\'s people', p2.includes('slipway') && !p2.some(n => SEED_NAMES.includes(n)), p2.join(','))
  await leaveWarShot(page, '02-after-reload-leavewar')
  /* what the grid DRAWS, not only what is stored: WOLF's demo leave bid on 8 Jan (the seed's `splice`) */
  const wolf = await page.evaluate(() => { const c = document.querySelector('[data-testid="cell-wolf-2026-01-08"]'); return c ? (c.innerText || '').trim() : 'NO CELL DRAWN' })
  check('after a reload: the grid draws WOLF\'s demo leave on 8 Jan', /LL/.test(wolf), wolf)
  /* the picture must SHOW it (anti-pattern 21): bring WOLF's 8 Jan cell to the middle of the grid and take it */
  await page.evaluate(() => document.querySelector('[data-testid="cell-wolf-2026-01-08"]')?.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${SHOTS}/02b-after-reload-wolf-8jan.png` })

  // 3 — a store stamped the old way
  await page.evaluate(() => localStorage.setItem('raptor:settings/schema', '5'))
  await page.reload()
  await signIn(page)
  await page.waitForTimeout(800)
  const s3 = await schema(page)
  check('a bare-number store boots, and is upgraded to the object', !!s3 && typeof s3 === 'object' && s3.initialized === true && s3.dataFormatVersion === 5, JSON.stringify(s3))
  const p3 = await warPeople(page)
  check('…with its saved world untouched', p3.join(',') === p2.join(','), p3.join(','))
  await page.screenshot({ path: `${SHOTS}/03-legacy-stamp-booted.png` })

  // 4 — a store written by a newer build
  const ahead = JSON.stringify({ stage: 1, dataFormatVersion: 99, initialized: true, appliedAt: 'x', minClient: 99 })
  const before = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
  await page.evaluate(a => localStorage.setItem('raptor:settings/schema', a), ahead)
  const errsBefore = errors.length
  await page.reload()
  await page.waitForSelector('.bootfail', { state: 'visible' })
  const text = await page.locator('.bootfail').innerText()
  check('a newer store: "RAPTOR has been updated", with a Reload button', /RAPTOR has been updated/.test(text) && /Reload/.test(text), text.replace(/\s+/g, ' '))
  await page.screenshot({ path: `${SHOTS}/04-store-ahead.png` })
  const after = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
  const changed = Object.keys({ ...before, ...after }).filter(k => k !== 'raptor:settings/schema' && before[k] !== after[k])
  check('…and nothing else in storage was touched', changed.length === 0, changed.join(','))
  errors.splice(errsBefore, errors.length - errsBefore, ...errors.slice(errsBefore).filter(e => !/could not load its data/.test(e)))   // the refused boot's own log line is expected

  // a phone-width look at the first-boot Leave War, on a second fresh browser
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const pp = await phone.newPage()
  pp.on('pageerror', e => errors.push('PAGEERROR(phone) ' + e.message))
  await pp.goto(BASE + '/')
  await signIn(pp)
  await pp.reload()
  await signIn(pp)
  const pp2 = await warPeople(pp)
  check('phone, fresh browser, after a reload: the demo leave on the roster\'s people', pp2.includes('slipway') && !pp2.some(n => SEED_NAMES.includes(n)), pp2.join(','))
  await leaveWarShot(pp, '05-phone-after-reload-leavewar')
} finally {
  await browser.close()
}
check('no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} PASS`)
process.exit(failed ? 1 : 0)
