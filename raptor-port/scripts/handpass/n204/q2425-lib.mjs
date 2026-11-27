// q2425-lib - section 1 (the guard rail), chat 204, 27 Nov 26: the drawings for questions 24 and 25 (brief
// docs/superpowers/briefs/2026-11-27-msq-s1-q24-25-draw-brief.md). The app is the BUILT one in dist, served at 4741,
// never rebuilt here; nothing here writes the app's code. The shape of q-lib.mjs (the 19-20 drawer's) without its probe:
// no note is raised here - every state is the app's own, reached by real presses; the one exception is 25(c), a drawing
// of a band the app does not draw yet, added by an overlay in the page (said so in its script and caption).
//   mk({ clock })    a desktop browser 1536x864 at 2x, Chromium (the repo's own fallback), the time zone pinned to
//                    Asia/Singapore; `clock` (an ISO time, +08:00) installs the page clock there and leaves it RUNNING.
//   clockTo(s, iso)  the page clock run forward to `iso`, the app's timers firing on the way, then the window's focus
//                    event (as the tests' pastMidnight sends it).
//   world()          three squadrons and Hunter's Plan of 149, made by Saber's presses (Admin -> Squadrons -> "+ New
//                    squadron" 150, first admin Kestrel; Admin -> Users -> Hunter's row -> Access to 149: Plan -> Save),
//                    the saved data copied into each picture's fresh browser (Playwright's storage copy).
//   tring / sshot    the teal dashed ring (2px #0D9488, 4px clear) and the picture pair <name>.png + <name>-crop.png.
import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const URL_ = 'http://localhost:4741/'
export const OUT = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/q24-25'); mkdirSync(OUT, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n204-q24-25'); mkdirSync(TMP, { recursive: true })
export const TEAL = '#0D9488'
export const W = 1536, H = 864
export const T = s => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : s + '+08:00')
console.log('q2425-lib v1 (27 Nov 26)')

/* THE PASSING NOTE, RAISED BY THE APP'S OWN CODE (25-1 only): the note the orchestrator's change asks for is not built,
   so its draft words are raised through the app's own toast(msg, 'warn') - its look and its place the app's - by one line
   added to the served chunk that holds it in this browser only: `window.__n204t = <toast>`, the name read off the built file by
   its shape (its first lines: `if (BATCH) { BATCH.push({ msg: String(...` ). Nothing else of the app is touched. */
let PATCH = null
function patched() {
  if (PATCH) return PATCH
  /* the toast sits in whichever built chunk the bundler put it (this build: a shared chunk, not the index) */
  const dir = resolve(ROOT, 'dist/assets'), ID = '[A-Za-z_$][A-Za-z0-9_$]*'
  const RE = new RegExp(`function (${ID})\\((${ID}),(${ID}),(${ID})\\)\\{if\\((${ID})\\)\\{\\5\\.push\\(\\{msg:String\\(`)
  let file = null, src = null, m = null
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) { const t = readFileSync(resolve(dir, f), 'utf8'); const x = RE.exec(t); if (x) { file = f; src = t; m = x; break } }
  if (!m) throw new Error('the probe could not find the app\'s toast in dist/assets')
  FACT('probe', { chunk: file, toast: m[1] })
  PATCH = { file, body: src + `\n;window.__n204t=${m[1]};\n` }
  return PATCH
}
/* the app's own passing note, its fade held off (opacity only - its place is the app's) */
export async function sayNote(s, words, kind = 'warn') {
  const r = await s.page.evaluate(([w, k]) => {
    window.__n204t(w, k)
    const t = document.querySelector('#toastEl'); t.getAnimations?.().forEach(a => a.finish())
    const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }
    put(); window.__n204hold?.disconnect(); window.__n204hold = new MutationObserver(put); window.__n204hold.observe(t, { attributes: true, attributeFilter: ['style'] })
    return t.textContent.replace(/\s+/g, ' ').trim()
  }, [words, kind])
  await wait(s, 500)
  FACT('note', { words: r, box: await boxOf(s, '#toastEl') })
  if (r !== words) throw new Error('the note drew other words: ' + r)
  return boxOf(s, '#toastEl')
}
/* a small plain label beside a ring - "Draft words" - for a drawing whose words are not yet his */
export const tag = (s, b, text) => s.page.evaluate(([b, text, c]) => {
  const d = document.createElement('div'); d.className = '__n204ring'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 26) + 'px', padding: '2px 8px', background: c, color: '#fff', font: '600 12px system-ui, sans-serif', borderRadius: '6px', zIndex: 2147483647, pointerEvents: 'none' })
  document.body.appendChild(d); const r = d.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }
}, [b, text, TEAL])

let browser = null
export async function mk({ clock = null, storageState = undefined, probe = false } = {}) {
  if (!browser) browser = await chromium.launch(LAUNCH)
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, timezoneId: 'Asia/Singapore', storageState })
  if (probe) { const p = patched(); await ctx.route(`**/assets/${p.file}`, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: p.body })) }
  if (clock) await ctx.clock.install({ time: T(clock) })
  const page = await ctx.newPage()
  const s = { ctx, page, desk: true, W, H, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} ${r.url().slice(0, 120)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
export async function closeAll() { if (browser) await browser.close().catch(() => {}); browser = null }
export function FACT(k, v) { console.log(`FACT ${k}=${JSON.stringify(v)}`) }
export const wait = (s, ms) => s.page.waitForTimeout(ms)
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function run(key, fn, opts = {}) {
  const s = await mk(opts)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { FACT(`${key}.errs`, s.errs); await s.ctx.close().catch(() => {}) }
}
export async function signIn(s, u, p) {
  const { page } = s
  if (!(await page.locator('#luser').count())) { await page.goto(URL_) }
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(700)
}
export async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await l.click({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
export const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }
}, sel)
export const barSq = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 }
  const m = [...document.querySelectorAll('.topbar .mark, .drawer-sqn .mark')].find(shown)
  return m ? m.textContent.replace(/\s+/g, ' ').trim() : null
})
export const badge = s => s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent.replace(/\s+/g, ' ').trim() ?? null)
export const toastNow = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const c = getComputedStyle(t); return c.opacity === '0' || c.display === 'none' || c.visibility === 'hidden' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')
export const words = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
export const curPage = s => s.page.evaluate(() => window.CURPAGE ?? null)
export async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 600); return }
  await hit(s, '#burger', 350)
  await hit(s, `#drawerNav a[data-page="${name}"]`, 600)
}
export async function adminCat(s, label) {
  if (await curPage(s) !== 'admin') { await go(s, 'admin'); await wait(s, 700) }
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + label) }).first(), 700)
}
/* the squadron picked by the top bar's picker, as a person picks it */
export async function pick(s, num) {
  await hit(s, '#sqnMenuBtn', 400)
  const row = vis(s, '#sqnMenu .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: new RegExp('^' + num + '$') }) }).first()
  await hit(s, row, 900)
  FACT('picked', { want: num, bar: await barSq(s) })
}
/* THE THIRD SQUADRON (his D2630: three squadrons in the picker), as n191 / the 19-20 drawer made it */
export async function make150(s, k) {
  const { page } = s
  await adminCat(s, 'Squadrons')
  await hit(s, '#sqNew', 500)
  await page.fill('#sqNewNum', '150'); await page.selectOption('#sqNewPlace', 'p1').catch(() => {})
  await page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' })
  await hit(s, '#sqNewSave', 1000)
  FACT(`${k}.made150`, { list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200), formClosed: !(await vis(s, '#sqNewSave').count()) })
}
const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
export async function give(s, pid, num, line) {
  const { page } = s
  await adminCat(s, 'Users')
  const r = page.locator(`[data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click()
  await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn(num, line)); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 800)
  return toastNow(s)
}
const WORLD = resolve(TMP, 'state-world.json')
export async function world() {
  if (existsSync(WORLD) && !process.env.FRESH) return WORLD
  const s = await mk()
  try {
    await signIn(s, 'ad', 'a')
    await make150(s, 'world')
    FACT('world.hunterPlan149', await give(s, 'prowler', '149', 'plan'))
    await go(s, 'viewsched'); await wait(s, 600)
    writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
    FACT('world.errs', s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
export async function clockTo(s, iso) {
  const now = await s.page.evaluate(() => Date.now())
  const ms = T(iso).getTime() - now
  if (ms < 0) throw new Error('clockTo: ' + iso + ' is behind the page clock')
  await s.page.clock.fastForward(ms)
  await s.page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await wait(s, 1500)
  FACT('clock', { to: iso, page: await s.page.evaluate(() => new Date().toString()) })
}
/* the mark of this round: what is new in the app - a teal dashed ring, 2px, 4px clear */
export const tring = (s, b, tag = '') => s.page.evaluate(([b, c, tag]) => {
  const d = document.createElement('div'); d.className = '__n204ring'; d.dataset.tag = tag
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, outlineOffset: '0', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d); return { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }
}, [b, TEAL, tag])
export const untring = s => s.page.evaluate(() => document.querySelectorAll('.__n204ring').forEach(e => e.remove()))
export async function sshot(s, name, rects, pad = 14, whole = true) {
  const { page } = s
  await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  if (whole) await page.screenshot({ path: `${OUT}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), Tp = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, Tp - pad)
    const clip = { x, y, width: Math.max(20, Math.min(W, R + pad) - x), height: Math.max(20, Math.min(H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + name + (whole ? '.png' : '') + (rects.length ? ' + -crop' : ''))
}
