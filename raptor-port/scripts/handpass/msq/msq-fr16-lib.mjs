/* msq-fr16-lib v1 (20 Nov 26) — fix read 16 bridge walk: shared helpers. Own world per run, real storage, frozen dist served from
   inside the test browser (msq-lib's route), the page clock set to 17 Jul 2026 09:00 and left RUNNING.
   Settings: FR16_PHONE=1 for the iPhone; FR16_SC = the scenario folder name (w1 …). */
process.env.MSQ_DIST = 'C:/Users/User/projects/Raptor-msq/raptor-port/dist'
process.env.MSQ_BUNDLE = 'index-B2SwfURa.js'
process.env.MSQ_WHO = process.env.FR16_SC || 'w'
process.env.MSQ_RUN = (process.env.FR16_PHONE === '1' ? 'phone' : 'desktop') + (process.env.FR16_TAG ? '-' + process.env.FR16_TAG : '')
process.env.MSQ_IMGDIR = '2026-11-20-multi-sqn-b1-fixread16'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
export const { X, U, say, sleep, row, swap, bellClose } = H
export const phone = process.env.FR16_PHONE === '1'
export const size = phone ? 'iPhone' : 'desktop'
const req = createRequire('C:/Users/User/projects/Raptor-msq/raptor-port/package.json')
const { chromium, webkit, devices } = req('@playwright/test')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }
export const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
export const NOW = '2026-07-17T09:00:00'

/** a fresh world with the clock on 17 Jul 2026 09:00 (running); the first sign-in as `user` */
export async function openAt(user) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone ? { ...devices['iPhone 15'], viewport: { width: 402, height: 874 } } : { viewport: { width: 1536, height: 864 } })
  await ctx.clock.install({ time: new Date(NOW) })
  await ctx.route(X.BASE + '/**', async route => {
    const u = new URL(route.request().url()); const p = decodeURIComponent(u.pathname)
    let f = join(X.DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(X.DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  let loads = 0
  page.on('load', () => { loads++ })
  await page.goto(X.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (user) await X.login(page, user)
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (!js.includes(X.BUNDLE)) throw new Error('not the frozen bundle: ' + js)
  return { browser, ctx, page, errors, phone, P: phone ? 'p' : 'd', get loads() { return loads } }
}

/** write each man's squadron move into storage (no screen saves one): his old home from 1 Jan, the new from `from`. Then reload. */
export async function putMoves(w, moves) {
  await w.page.evaluate(ms => {
    let n = 0
    for (const m of ms) {
      const a = 'h' + (Date.now() + (n++)).toString(36) + 'a', b = 'h' + (Date.now() + (n++)).toString(36) + 'b'
      localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.old, from: '2026-01-01' }))
      localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.from }))
    }
  }, moves)
  await w.page.reload(); await sleep(1500)
}

export const pidOf = (page, cs) => page.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0] || null, cs)

/** the bell: badge before, open, lines (NEW/read), picture; stays open */
export async function bell(w, name) {
  const p = w.page
  const b = p.locator('#notifyBell:visible').first()
  const badge = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); const e = document.querySelector('#notifyBell'); return { dot: d ? getComputedStyle(d).display : 'no dot', text: (e?.innerText || '').replace(/\s+/g, ' ').trim(), aria: e?.getAttribute('aria-label') || '' } })
  await tapIt(b); await sleep(120)
  await X.pic(w, name + '-press')
  await sleep(800)
  const lines = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' ')) : null })
  await X.pic(w, name)
  const list = p.locator('[data-testid="bell-list"]').first()
  if (await list.count()) await X.pic(w, name + '-list', list).catch(() => {})
  return { badge, lines }
}
export async function closeBell(w) {
  const p = w.page
  if (await p.locator('[data-testid="bell-list"]:visible').count()) { await tapIt(p.locator('#notifyBell:visible').first()); await sleep(120); await X.pic(w, 'x-close-press').catch(() => {}); await sleep(500) }
}

export const FIND = H.FIND

/** file an LL for `who` on the Inputs page: a day label (and optional end label), remark; answers the document question */
export async function fileLL(w, who, day, remark, endDay) {
  const p = w.page
  await openInputs(w)
  await tapIt(p.locator('#inNew')); await sleep(1400)
  await p.selectOption('#inpEditPerson', { label: who })
  await p.selectOption('#inpEditType', { label: 'LL' }); await sleep(600)
  if (remark) await p.fill('#inpEditRmk', remark)
  await monthTo(p, /July 2026/)
  await pickDay(p, day)
  if (endDay) await pickDay(p, endDay)
  await X.pic(w, 'fileLL-filled')
  await tapIt(p.locator('#inpEditSave')); await sleep(1600)
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await tapIt(nd); await sleep(1200) }
}
/** the Inputs list rows (visible) as text */
export const inputRows = p => p.evaluate(() => [...document.querySelectorAll('#page-inputs [data-iid]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
/** open the Inputs row containing all of the words */
export async function openRow(w, words) {
  const p = w.page
  let loc = p.locator('#page-inputs [data-iid]:visible')
  for (const t of words) loc = loc.filter({ hasText: t })
  await tapIt(loc.first()); await sleep(1200)
}
export async function saveEdit(w) {
  const p = w.page
  await tapIt(p.locator('#inpEditSave')); await sleep(1500)
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await tapIt(nd); await sleep(1200) }
}
export const notices = p => p.evaluate(() => { try { return JSON.stringify((window.NOTICES || []).map(n => ({ ...n })).slice(-12)).slice(0, 1800) } catch (e) { return 'err ' + e.message } })

/** Inputs page: add a leave (LL) for `who` (callsign) from d1 to d2 (aria-label starts, e.g. 'Thu 23 Jul 2026'), with remark text */
export async function openInputs(w) {
  const p = w.page
  await X.L.go(p, 'inputs'); await sleep(1400)
  if (!(await p.locator('#inNew:visible').count())) { await tapIt(p.locator('#inListBtn')); await sleep(800) }
}
export async function monthTo(p, re) {
  for (let i = 0; i < 12; i++) {
    const t = await p.evaluate(() => (document.querySelector('.inped-win .dcal-title')?.textContent || '').replace(/\s+/g, ' ').trim())
    if (re.test(t)) return t
    await tapIt(p.locator('.inped-win .dcal-nav[aria-label="Next month"]').first()); await sleep(500)
  }
  throw new Error('month not reached')
}
export async function pickDay(p, label) {
  const d = p.locator(`.inped-win .dcal-d[aria-label^="${label}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(400)
  await tapIt(d); await sleep(500)
}
