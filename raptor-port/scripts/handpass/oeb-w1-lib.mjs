// W1 walk helpers for the OIL Earn board walk (8 Nov 26). Route copied from scripts/drawcheck/specs/oil-earn-board.mjs.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
export { chromium, webkit, LAUNCH, serveDist }

const HERE = dirname(fileURLToPath(import.meta.url))
export const PORT_DIR = join(HERE, '..', '..')
export const DIST = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/dist-a827307a5'
export const OUT = join(PORT_DIR, 'docs', 'img', 'handpass', '2026-11-08-oil-earn-board', 'w1')
mkdirSync(OUT, { recursive: true })
export const STATE_SAT = join(PORT_DIR, 'docs', 'handpass', 'state-sat.json')
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const SAT = 5
export const BAR = '#schedBoard .daybar'

export const SIZES = {
  phone: { browser: webkit, opts: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
  pc: { browser: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 } },
}

export async function launch(size, { saved = false } = {}) {
  const s = SIZES[size]
  const browser = await s.browser.launch(size === 'pc' ? LAUNCH : {})
  const origin = saved ? 'http://localhost:4173' : 'http://localhost:4381'
  const opts = { ...s.opts }
  if (saved) opts.storageState = STATE_SAT
  const ctx = await browser.newContext(opts)
  await serveDist(ctx, origin, DIST)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  const W = { browser, ctx, page, origin, phone: size === 'phone', size, errs }
  return W
}
export async function closeAll(W) { try { await W.ctx.close() } catch {} try { await W.browser.close() } catch {} }

export async function open(W, di = SAT, { signin = true, user = 'ad', pass = 'a', fresh = true } = {}) {
  const { page, origin } = W
  if (fresh) await page.context().clock.install({ time: new Date('2026-07-13T09:00:00') })
  await page.goto(origin + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
  if (di != null) await openBoard(W, di)
}
export async function openBoard(W, di) {
  const { page } = W
  await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(400)
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard'); await sleep(800)
}
export const press = async (W, sel, opts = {}) => {
  const l = (typeof sel === 'string' ? W.page.locator(sel) : sel).filter({ visible: true }).first()
  if (W.phone) await l.tap(opts); else await l.click(opts)
}
export async function oilOn(W) {
  const { page } = W
  await press(W, (await page.locator('#sbOil').filter({ visible: true }).count()) ? '#sbOil' : '#schedBoard [data-oilmode]')
  await sleep(700)
  if (!(await page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon')))) throw new Error('OIL Earn did not come on')
}
export const oilIsOn = page => page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon'))
export const swChecked = page => page.evaluate(() => { const i = document.querySelector('#schedBoard .daybar input[data-oilblank]'); return i ? i.checked : null })
export const selCount = page => page.evaluate(() => document.querySelectorAll('#schedBoard .puck.sel').length)
export const toastText = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); const s = getComputedStyle(t); return { text: t.innerText.trim(), shown: r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0, op: s.opacity, cls: t.className } })
export const noteText = page => page.evaluate(() => { const n = document.querySelector('#schedBoard .daybar .daybar-note'); if (!n) return null; const r = n.getBoundingClientRect(); return r.width > 0 ? n.innerText.trim() : null })
export const standAt = (page, sel, y) => page.evaluate(([sel, y]) => {
  const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0)
  if (!e) return
  let s = e.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  s = s || document.scrollingElement
  s.scrollTop += e.getBoundingClientRect().top - y
}, [sel, y])
export const blur = page => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
export async function toTop(W) {
  // bring the day bar into view below the board's top strip
  if (W.phone) { const tb = await W.page.evaluate(() => document.querySelector('.sb-top').getBoundingClientRect().bottom); await standAt(W.page, BAR, tb + 40) }
  else await standAt(W.page, BAR, 120)
  await sleep(250)
}
export const SW = `${BAR} label.lgmix`
export async function pic(W, name, { clip, sel, pad = 12, full = false } = {}) {
  const f = join(OUT, name + '.png')
  if (sel) {
    const b = await W.page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().height > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }, sel)
    if (b) { const vw = W.page.viewportSize(); const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad); clip = { x, y, width: Math.min(vw.width - x, b.w + 2 * pad), height: Math.min(vw.height - y, b.h + 2 * pad) } }
  }
  await W.page.screenshot({ path: f, ...(clip && !full ? { clip } : {}) })
  return name + '.png'
}
export function mkReport() {
  const rows = []; const fails = []; const odd = []
  return { rows, fails, odd,
    add(r) { rows.push(r); if (r.res === 'FAIL') fails.push(r); console.log(`[${r.sc}/${r.size}] ${r.res}: ${r.said}`) },
    note(s) { odd.push(s); console.log('ODD: ' + s) } }
}
import { writeFileSync, appendFileSync, existsSync } from 'node:fs'
export function saveRows(rep, tag) {
  const f = join(PORT_DIR, 'scripts', 'handpass', `.oeb-w1-${tag}.json`)
  writeFileSync(f, JSON.stringify({ rows: rep.rows, odd: rep.odd }, null, 1))
}
