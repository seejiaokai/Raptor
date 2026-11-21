/* msq-rs-lib v1 (21 Nov 26) — the multi-squadron reshape's FULL-check walk (chat 131, branch claude/multi-sqn-b1-107):
   the one shared library of walkers W1–W5. Brief: docs/superpowers/briefs/2026-11-21-msq-reshape-walk-brief.md.
   Built from msq-lib.mjs / msq-fr17-lib.mjs (sign-in, own world) and scripts/drawcheck/specs/msq-midnight-band.mjs (a move
   written as SETUP at the sign-in card, the clock run past midnight, a phone's tap).

   What it gives a walk script (each takes the world `w` that world() returns):
     world({ origin, size, user, now, moves, rights })  a fresh browser + context: its own storage, the page clock installed
                         at `now` (Perth/Singapore time, +08:00) and left RUNNING, the time zone pinned to Asia/Singapore (no
                         second midnight), SETUP moves and rights written at the sign-in card, then a reload, then `user`
                         signed in. size 'd' = desktop 1536×864 Chromium; 'p' = iPhone 402×874 WebKit, touch, 3x.
     signIn(w, user) / signOut(w)        through the sign-in card and the app's own Sign out (the phone's menu first).
     saveMove(w, { pid, from, to, day }) SETUP ONLY (no screen saves a move): home rows as units.ts stores them —
                         `raptor:settings/home:<h…>` {id, pid, unit, from} — his old home from 1 Jan if he has no row yet,
                         the new from `day`; then a reload, and his sign-in again if the card came back.
     giveRight(w, { account, unit, level, from }) SETUP ONLY (no screen gives one): `raptor:settings/grant:<g…>`
                         {id, account, unit, level: 'admin' (Plan) | 'view', from}; then a reload, as above.
     clockTo(w, iso)     run the page clock forward to `iso` (+08:00), the app's own timers firing on the way; never back.
     nav(w, name)        a page by its tab (phone: ☰ Menu first): editsched viewsched inputs quals logic leavewar tracker
                         help admin, and the Inputs page's own tabs: sans, medical.
     tap(w, target)      a tap on the phone, a click on the desktop (target: a locator or a selector).
     shot(w, name, { clip })     <out>/<name>-<d|p>.png; clip = a locator or {x,y,width,height}; a clip off the screen is
                         pictured as the whole screen and said OFFSCREEN (the subject is never scrolled into view for you).
     pressShot(w, target, name)  the press, a picture within about 100 ms of the lift (<name>-press), then the settled one
                         (<name>) — §7.10 of the bug-check order; on the desktop the mouse is left where it pressed.
     errors(w)           console errors, page errors, failed requests, and whether a failed-save band shows now.
     note(w)             the passing note's words now ('' when none shows).
     row(w, …) / table(w)  the result table: row(w, scenario, step, verdict, saw, pics); table(w) writes
                         <out>/results-<d|p>.json and prints the counts.
     ids: ACCT (sign-in → account id), PID (sign-in → person id), CS (sign-in → callsign), U142, U149.

   Settings, read once: RS_SHARE (w1 … w5, the picture sub-folder), RS_OUT (a whole picture folder, overrides),
   RS_BUNDLE (the served bundle's file name — the run refuses another). Run from raptor-port/: node scripts/handpass/msq/<script>. */
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const VERSION = 'msq-rs-lib v1 (21 Nov 26)'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const SHARE = process.env.RS_SHARE || 'host'
export const OUT = process.env.RS_OUT || resolve(ROOT, 'docs/img/handpass/2026-11-21-msq-reshape', SHARE)
const BUNDLE = process.env.RS_BUNDLE || ''

/* the seeded sign-ins (state/accounts.ts SEED and SEED_PASS; engine/people.ts and state/demoseed.ts for the callsigns) */
export const PASS = { ad: 'a', us: 'us', ad2: 'a2', ad9: 'a9', us9: 'us9' }
export const ACCT = { ad: 'acad', us: 'acus', ad2: 'acad2', ad9: 'acad9', us9: 'acus9' }
export const PID = { ad: 'stiff', us: 'bane', ad2: 'prowler', ad9: 'kes9', us9: 'osp9' }
export const CS = { ad: 'Saber', us: 'Ranger', ad2: 'Hunter', ad9: 'Kestrel', us9: 'Osprey' }
export const U142 = 'u142', U149 = 'u149'

export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const nrm = s => String(s ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()   // the app's no-break space before "›"
/* a time with no zone of its own is Perth's (+08:00), the seeded place's, as the drawing check reads it */
export const T = s => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : s + '+08:00')
mkdirSync(OUT, { recursive: true })
const LOG = resolve(OUT, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
say(VERSION, '— share', SHARE, '— pictures', OUT)

/** a fresh world. moves: [{ pid, from, to, day }], rights: [{ account, unit, level, from }] — SETUP written before anyone
    signs in (the established order: drawing check, Plan audit). user: the first sign-in, or null to stay on the card. */
export async function world({ origin, size = 'd', user = null, now = '2026-07-15T09:00:00', moves = [], rights = [] } = {}) {
  if (!origin) throw new Error('world(): no origin — the host gives the port in your prompt')
  const phone = size === 'p'
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    timezoneId: 'Asia/Singapore', locale: 'en-GB',
    ...(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
      : { viewport: { width: 1536, height: 864 } }),
  })
  await ctx.clock.install({ time: T(now) })
  const page = await ctx.newPage()
  const w = { browser, ctx, page, phone, P: phone ? 'p' : 'd', size, origin, user: null, errs: [], rows: [], loads: 0 }
  page.on('console', m => { if (m.type() === 'error') w.errs.push(m.text()) })
  page.on('pageerror', e => w.errs.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) w.errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('load', () => { w.loads++ })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser', { timeout: 20000 })
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (BUNDLE && !js.includes(BUNDLE)) throw new Error('not the frozen bundle: ' + js + ' (expected ' + BUNDLE + ')')
  say('world', size, 'clock', now, 'bundle', js.split('/').pop())
  if (moves.length || rights.length) {
    for (const m of moves) await writeHome(page, m)
    for (const r of rights) await writeGrant(page, r)
    await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await sleep(600)
  }
  if (user) await signIn(w, user)
  return w
}

const QUIET = '*{scroll-behavior:auto !important}'
/** sign in through the card; waits for the week. opts.week:false for a sign-in that lands elsewhere (a waiting screen) */
export async function signIn(w, user, { pass, week = true } = {}) {
  const p = w.page
  await p.waitForSelector('#luser', { timeout: 20000 })
  await p.fill('#luser', user); await p.fill('#lpass', pass ?? PASS[user] ?? user)
  await p.click('#loginForm button[type=submit]')
  if (week) await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  else await sleep(2500)
  await sleep(700)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
  w.user = user
  say('signed in as', user, CS[user] || '')
}
/** Sign out through the app's own control (on a phone the ☰ Menu first); waits for the sign-in card */
export async function signOut(w) {
  const p = w.page
  if (w.phone && await p.locator('#burger:visible').count()) { await p.locator('#burger').tap(); await sleep(600) }
  const b = p.getByRole('button', { name: /sign out|log ?out/i }).first()
  await b.waitFor({ state: 'visible', timeout: 8000 })
  if (w.phone) await b.tap(); else await b.click()
  await p.waitForSelector('#luser', { timeout: 20000 }); await sleep(800)
  say('signed out', w.user); w.user = null
}

async function writeHome(page, { pid, from, to, day }) {
  return page.evaluate(m => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
    const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
    const id = s => 'h' + (Date.now() + s).toString(36) + Math.random().toString(36).slice(2, 6)
    if (!has) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })) }
    const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day }))
    return b
  }, { pid, from, to, day })
}
async function writeGrant(page, { account, unit, level = 'admin', from = '2026-01-01' }) {
  return page.evaluate(g => {
    const id = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    localStorage.setItem('raptor:settings/grant:' + id, JSON.stringify({ id, account: g.account, unit: g.unit, level: g.level, from: g.from }))
    return id
  }, { account, unit, level, from })
}
async function reloadKeep(w) {
  const p = w.page, who = w.user
  await p.reload(); await sleep(1500)
  if (who && await p.locator('#luser:visible').count()) await signIn(w, who)
  else await p.addStyleTag({ content: QUIET }).catch(() => {})
}
/** SETUP: a move of squadron (no screen saves one). day = his first day in `to`, e.g. '2026-07-16' */
export async function saveMove(w, m) { const id = await writeHome(w.page, m); say('SETUP move', JSON.stringify(m), id); await reloadKeep(w); return id }
/** SETUP: a right in another squadron (no screen gives one). level 'admin' = Plan, 'view' = View */
export async function giveRight(w, g) { const id = await writeGrant(w.page, g); say('SETUP right', JSON.stringify(g), id); await reloadKeep(w); return id }

/** the page clock forward to iso (+08:00); the app's timers fire on the way. A step back needs a fresh world. */
export async function clockTo(w, iso) {
  const now = await w.page.evaluate(() => Date.now())
  const ms = T(iso).getTime() - now
  if (ms < 0) throw new Error('clockTo: ' + iso + ' is behind the page clock — start a fresh world')
  await w.page.clock.fastForward(ms)
  await sleep(1200)
  say('clock', iso)
}

export const loc = (w, t) => (typeof t === 'string' ? w.page.locator(t).first() : t)
export async function tap(w, t) { const l = loc(w, t); if (w.phone) await l.tap(); else await l.click() }

const SUB = { sans: '#inSansMode', medical: '#inMedBtn' }
/** a page by its own tab; 'sans' and 'medical' are the Inputs page's tabs */
export async function nav(w, name) {
  const p = w.page, pg = SUB[name] ? 'inputs' : name
  if (w.phone) { await p.locator('#burger').tap(); await sleep(600) }
  await tap(w, p.locator(`${w.phone ? '#drawerNav' : '#topnav'} a[data-page="${pg}"]:visible`).first())
  await p.waitForFunction(x => window.CURPAGE === x, pg, { timeout: 10000 }).catch(() => say('nav: CURPAGE never read', pg))
  await sleep(1400)
  if (SUB[name]) { await tap(w, SUB[name]); await sleep(1000) }
}

/** <out>/<name>-<d|p>.png. clip: a locator or a rect */
export async function shot(w, name, { clip } = {}) {
  const file = resolve(OUT, `${name}-${w.P}.png`)
  let rect = null, off = false
  if (clip && typeof clip.boundingBox === 'function') rect = await clip.boundingBox().catch(() => null)
  else if (clip) rect = clip
  const vp = w.page.viewportSize()
  if (rect && vp) {
    const x = Math.max(0, rect.x), y = Math.max(0, rect.y)
    const r = { x, y, width: Math.min(vp.width, rect.x + rect.width) - x, height: Math.min(vp.height, rect.y + rect.height) - y }
    if (r.width < 4 || r.height < 4) { off = true; rect = null } else rect = r
  } else if (clip) off = true
  await w.page.screenshot(rect ? { path: file, clip: rect } : { path: file })
  if (off) say('OFFSCREEN', name, '— pictured the whole screen')
  return file.split(/[\\/]/).pop()
}
/** a press with its picture right after the lift (about 100 ms), then the settled one (§7.10) */
export async function pressShot(w, t, name, { settle = 900, clip } = {}) {
  const l = loc(w, t)
  if (w.phone) await l.tap()
  else { const b = await l.boundingBox(); if (b) { await w.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await w.page.mouse.down(); await w.page.mouse.up() } else await l.click() }
  await sleep(60)
  const a = await shot(w, name + '-press', { clip })
  await sleep(settle)
  const b = await shot(w, name, { clip })
  return [a, b]
}

/** what went wrong in the page so far, and whether a failed-save band shows now (the midnight band is not one) */
export async function errors(w) {
  const failedSave = await w.page.evaluate(() => [...document.querySelectorAll('.saveband:not(.moveband)')]
    .filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim())).catch(() => [])
  return { console: [...w.errs], failedSave }
}
/** the passing note's words, or '' */
export const note = w => w.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const cs = getComputedStyle(t); return cs.opacity === '0' || cs.display === 'none' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')

/** one result line. verdict: PASS | FAIL | RECORDED | NOT WALKED */
export function row(w, scenario, step, verdict, saw, pics = []) {
  const r = { scenario, size: w.P, step, verdict, saw: nrm(saw).slice(0, 600), pics: [].concat(pics) }
  w.rows.push(r)
  say(`ROW ${verdict} | ${scenario} | ${w.P} | ${step} | ${r.saw}`)
}
export async function table(w, { close = true } = {}) {
  const e = await errors(w)
  writeFileSync(resolve(OUT, `results-${w.P}.json`), JSON.stringify({ version: VERSION, share: SHARE, rows: w.rows, errors: e }, null, 1))
  const n = v => w.rows.filter(r => r.verdict === v).length
  say(`DONE ${n('PASS')} PASS ${n('FAIL')} FAIL ${n('RECORDED')} RECORDED ${n('NOT WALKED')} NOT WALKED — errors ${e.console.length}`)
  if (close) await w.browser.close().catch(() => {})
}
