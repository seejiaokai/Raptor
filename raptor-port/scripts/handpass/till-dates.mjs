// [TILL-FROM-DATES] (owner D946, 16 Oct 26): the new-input window, drawn on the BUILT app — as it opens today (a day
// already picked, Remarks empty, no "till") beside the proposal: Remarks holds only what a person types, and "till <date>"
// is a fixed grey tag after the box, read from the dates. Nothing in the app is changed; the "after" pictures change the
// page's own nodes (mockups-on-the-real-app.md). Same marking as words-r1b.mjs.
//
//   node scripts/handpass/till-dates.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('till-dates v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-till-dates')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}

const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}`
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  return items.map(it => { const e = document.querySelector(it.sel); if (!e) return it.n + ': MISSING'; e.setAttribute('data-wpn', it.n); if (it.new) e.classList.add('wp-new'); return it.n + ': ok' })
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new') }))

/* the proposal: the box keeps only the typed words; the date is a grey tag after it, from the window's own dates */
const tagAfter = ([typed, till]) => {
  const inp = document.getElementById('inpEditRmk'); if (!inp) return 'NO BOX'
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(inp, typed); inp.dispatchEvent(new Event('input', { bubbles: true }))
  inp.value = typed
  let row = document.getElementById('wp-till-row')
  if (!row) {
    row = document.createElement('div'); row.id = 'wp-till-row'
    row.style.cssText = 'display:flex;align-items:center;gap:8px'
    inp.parentNode.insertBefore(row, inp); row.append(inp)
    inp.style.flex = '1 1 auto'; inp.style.minWidth = '0'
    const tag = document.createElement('span'); tag.id = 'wp-till'
    tag.style.cssText = 'flex:none;white-space:nowrap;color:var(--mute,#8b95a5);font-size:14px;padding:0 4px'
    row.append(tag)
  }
  document.getElementById('wp-till').textContent = till
  return 'tag: ' + till
}

async function signIn(page) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(800)
}
/* a day on the month: tap it, then the day's "+ Input" — the door he used */
async function openDay(page, n) {
  const box = await page.evaluate(n => {
    const els = [...document.querySelectorAll('#page-inputs *')].filter(e => e.children.length === 0 && e.textContent.trim() === String(n))
    const e = els.find(e => e.getBoundingClientRect().top > 250); if (!e) return null
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 + 10, y: r.top + r.height / 2 + 20 }
  }, n)
  if (!box) { errs.push('no day ' + n); return false }
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(500)
  if (!(await page.$('#inpEditRmk'))) { const add = await page.$('#icPopAdd'); if (add) { await add.click(); await page.waitForTimeout(500) } }
  return !!(await page.$('#inpEditRmk'))
}
const winClip = page => page.evaluate(() => {
  const e = document.getElementById('inpEditRmk'); let w = e; while (w && w.parentElement && !/dialog|modal|sheet|win/i.test(w.className + ' ' + (w.getAttribute('role') || ''))) w = w.parentElement
  const r = (w || e).getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4 + scrollY), width: Math.min(innerWidth, r.width + 8), height: r.height + 8 }
})

for (const size of [{ tag: 'phone', viewport: { width: 390, height: 844 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 1000 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  const T = size.tag
  await signIn(page)
  facts[T + ' opened'] = await openDay(page, 20)
  facts[T + ' remark on open'] = await page.$eval('#inpEditRmk', e => e.value).catch(() => 'NONE')
  facts[T + ' title'] = await page.evaluate(() => (document.querySelector('[class*="inped"] h2, [class*="inped"] .title, .dlg-h, .win-h')?.textContent || '').trim().slice(0, 60))
  await mark(page, [{ n: 'Remarks: no "till" on open', sel: '#inpEditRmk' }])
  await page.screenshot({ path: join(OUT, `${T}-1-today-open.png`), clip: await winClip(page) })
  await unmark(page)
  /* today, after typing in front of the token: what he has to do now */
  await page.evaluate(() => { const i = document.getElementById('inpEditRmk'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'till 20 Oct'); i.dispatchEvent(new Event('input', { bubbles: true })) })
  await mark(page, [{ n: 'Today: your words must go in front of this', sel: '#inpEditRmk' }])
  await page.screenshot({ path: join(OUT, `${T}-2-today-token.png`), clip: await winClip(page) })
  await unmark(page)
  /* the proposal: empty box, the tag after it, at once on open */
  facts[T + ' after empty'] = await page.evaluate(tagAfter, ['', 'till 20 Oct'])
  await mark(page, [{ n: 'Your words only', sel: '#inpEditRmk', new: true }, { n: 'From the dates', sel: '#wp-till', new: true }])
  await page.screenshot({ path: join(OUT, `${T}-3-after-empty.png`), clip: await winClip(page) })
  await unmark(page)
  facts[T + ' after typed'] = await page.evaluate(tagAfter, ['Las Vegas', 'till 20 Oct'])
  await mark(page, [{ n: 'Typed', sel: '#inpEditRmk', new: true }, { n: 'Stays after', sel: '#wp-till', new: true }])
  await page.screenshot({ path: join(OUT, `${T}-4-after-typed.png`), clip: await winClip(page) })
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
