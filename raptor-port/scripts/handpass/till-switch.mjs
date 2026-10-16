// D952 (17 Oct 26): every input gets a SWITCH for its "till <date>" — on by default, except a one-day duty or other
// commitment; the default follows the dates; the person can still turn it. Drawn on the BUILT app before it is built
// (D853, D541): the real new-input window as it is today, then the switch drawn in two ways — A, the grey date itself
// is the switch (the reading as first written), B, a tick box before the date, cloned from the window's own "all day"
// tick. Nothing in the app is changed; the drawn frames change the page's own nodes (mockups-on-the-real-app.md).
//
//   node scripts/handpass/till-switch.mjs [out dir]        (LOOK_URL=http://localhost:4191/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('till-switch v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-till-switch')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4191/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = []
const facts = {}

const MARK_CSS = `[data-wpn]{outline:2px solid #ff2d55 !important;outline-offset:2px;border-radius:3px;position:relative}
[data-wpn].wp-new{outline-color:#34c759 !important}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:-4px;top:-19px;background:#ff2d55;color:#fff;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn].wp-new::before{background:#34c759;color:#05210f}
[data-wpn].wp-left::before{left:auto;right:-4px}`
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  return items.map(it => { const e = document.querySelector(it.sel); if (!e) return it.n + ': MISSING'
    /* a cell that clips its overflow would cut the label off: a floating label on the page, above the outline */
    if (it.float) { const r = e.getBoundingClientRect(), l = document.createElement('div'); l.className = 'wp-float'
      l.textContent = it.n; l.style.cssText = `position:fixed;z-index:99999;top:${r.top - 24}px;left:${Math.max(2, r.left - 4)}px;background:${it.new ? '#34c759' : '#ff2d55'};color:${it.new ? '#05210f' : '#fff'};font:700 11px/15px system-ui;padding:0 5px;border-radius:3px;white-space:nowrap`
      document.body.append(l); e.style.outline = `2px solid ${it.new ? '#34c759' : '#ff2d55'}`; e.style.outlineOffset = '2px'; e.dataset.wpf = '1'; return it.n + ': ok' }
    e.setAttribute('data-wpn', it.n); if (it.new) e.classList.add('wp-new'); if (it.left) e.classList.add('wp-left'); return it.n + ': ok' })
}, [items, MARK_CSS])
const unmark = page => page.evaluate(() => { document.querySelectorAll('[data-wpn]').forEach(e => { e.removeAttribute('data-wpn'); e.classList.remove('wp-new', 'wp-left') })
  document.querySelectorAll('.wp-float').forEach(e => e.remove()); document.querySelectorAll('[data-wpf]').forEach(e => { e.style.outline = ''; delete e.dataset.wpf }) })

async function signIn(page) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(800)
}
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
/* the window, framed from its top to just below the Remarks row (the calendar under it is not what is asked about) */
const winClip = page => page.evaluate(() => {
  const e = document.getElementById('inpEditRmk'); let w = e; while (w && w.parentElement && !/dialog|modal|sheet|win|pop/i.test(w.className + ' ' + (w.getAttribute('role') || '') + ' ' + (w.id || ''))) w = w.parentElement
  const r = (w || e).getBoundingClientRect(), rr = e.closest('.inped-f').getBoundingClientRect()
  const bottom = Math.min(r.bottom, rr.bottom + 40)
  return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4 + scrollY), width: Math.min(innerWidth - Math.max(0, r.left - 4), r.width + 8), height: bottom - r.top + 8 }
})
const typeRemark = (page, text) => page.evaluate(text => {
  const i = document.getElementById('inpEditRmk'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(i, text); i.dispatchEvent(new Event('input', { bubbles: true }))
}, text)
const setType = async (page, t) => { await page.selectOption('#inpEditType', t).catch(e => errs.push('type ' + t + ': ' + String(e).slice(0, 80))); await page.waitForTimeout(250) }
const realTill = page => page.$eval('[data-testid="inped-till"]', e => e.textContent).catch(() => 'NONE')

/* DRAWN: the switch. `how` 'A' — the grey date itself, struck through when off; 'B' — the window's own "all day" tick,
   cloned, with the date as its label. The app's own grey date is hidden while a drawn one stands in its place. */
const drawSwitch = (page, how, on, date) => page.evaluate(([how, on, date]) => {
  document.getElementById('wp-sw')?.remove()
  const real = document.querySelector('[data-testid="inped-till"]'); if (!real) return 'NO TILL'
  real.style.display = 'none'
  let sw
  if (how === 'A') {
    sw = document.createElement('span'); sw.id = 'wp-sw'; sw.className = 'inped-till'
    sw.setAttribute('role', 'switch'); sw.style.cursor = 'pointer'
    const t = document.createElement('span'); t.textContent = date; sw.append(t)   // the fade on the words, not the marker
    if (!on) { t.style.textDecoration = 'line-through'; t.style.opacity = '.55' }
  } else {
    /* a leave's window has no "all day" tick of its own — the Meeting's, kept from the first frame, is used there */
    const ad = document.querySelector('label.inped-ad') || window.__wpTick; if (!ad) return 'NO ALL DAY TICK'
    if (!window.__wpTick) window.__wpTick = ad.cloneNode(true)
    sw = ad.cloneNode(true); sw.id = 'wp-sw'; sw.style.flex = 'none'; sw.style.whiteSpace = 'nowrap'
    const box = sw.querySelector('input'); box.removeAttribute('id'); box.checked = on
    ;[...sw.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove())
    const t = document.createElement('span'); t.textContent = date; t.className = 'inped-till'; t.style.padding = '0'
    if (!on) { t.style.textDecoration = 'line-through'; t.style.opacity = '.55' }
    sw.append(t)
  }
  real.after(sw)
  return how + (on ? ' on ' : ' off ') + date
}, [how, on, date])
const clearDrawn = page => page.evaluate(() => { document.getElementById('wp-sw')?.remove(); const r = document.querySelector('[data-testid="inped-till"]'); if (r) r.style.display = '' })

for (const size of [{ tag: 'phone', viewport: { width: 390, height: 844 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 1000 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  const T = size.tag
  await signIn(page)
  facts[T + ' opened'] = await openDay(page, 20)
  facts[T + ' types'] = await page.$$eval('#inpEditType option', os => os.map(o => o.value).join(', ')).catch(() => 'NONE')
  const shot = async (n, items) => { await mark(page, items); await page.screenshot({ path: join(OUT, `${T}-${n}.png`), clip: await winClip(page) }); await unmark(page) }

  /* 1 — TODAY (real): a one-day Meeting, "Brief" typed — the grey date repeats the day it stands on */
  await setType(page, 'Meeting'); await typeRemark(page, 'Brief')
  const d1 = await realTill(page); facts[T + ' 1 real till'] = d1
  await shot('1-today', [{ n: 'Today: always printed', sel: '[data-testid="inped-till"]', left: true }])

  /* 2 — B (recommended): the tick box, OFF by default for a one-day duty or other commitment */
  facts[T + ' 2'] = await drawSwitch(page, 'B', false, d1)
  await shot('2-B-oneday-off', [{ n: 'B: off by default (one day)', sel: '#wp-sw', new: true, left: true }])
  /* 3 — B: the same Meeting stretched to a second day — the tick turns on by itself */
  const d2 = d1.replace(/\d+/, m => String(+m + 1))
  facts[T + ' 3'] = await drawSwitch(page, 'B', true, d2)
  await shot('3-B-twoday-on', [{ n: 'B: on by itself (two days)', sel: '#wp-sw', new: true, left: true }])
  /* 4 — B: a one-day LEAVE keeps its date, ticked */
  await clearDrawn(page); await setType(page, 'LL'); await typeRemark(page, 'Bangkok')
  const d4 = await realTill(page); facts[T + ' 4 real till (leave)'] = d4
  facts[T + ' 4'] = await drawSwitch(page, 'B', true, d4)
  await shot('4-B-leave-on', [{ n: 'B: leave, on by default', sel: '#wp-sw', new: true, left: true }])
  /* 5 — A (as first written): the grey date itself is the switch, struck through when off */
  await clearDrawn(page); await setType(page, 'Meeting'); await typeRemark(page, 'Brief')
  facts[T + ' 5'] = await drawSwitch(page, 'A', false, d1)
  await shot('5-A-oneday-off', [{ n: 'A: tap the date (off)', sel: '#wp-sw', new: true, left: true }])

  /* 6, 7 — READING 3: with the switch off no screen prints the date. A saved input's printed remark on the Inputs
     page as it is today (real), then the same with its date taken off (drawn). */
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (await page.$('#inpEditRmk')) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(1200)
  /* View-only Sched's week, where "Desk / staff work till 13 Jul" — a one-day commitment — is printed */
  await page.evaluate(() => { const e = [...document.querySelectorAll('.ntx')].find(e => /^Desk \/ staff work till/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (e) e.scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(400)
  const found = await page.evaluate(() => {
    const re = /till \d{1,2} [A-Z][a-z]{2}/
    const els = [...document.querySelectorAll('.ntx')].filter(e => {
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.top < 80 || r.bottom > innerHeight) return false
      return [...e.childNodes].some(n => n.nodeType === 3 && re.test(n.textContent))
    })
    const e = els.find(e => /^Desk \/ staff/.test(e.textContent.trim())) || els[0]; if (!e) return null
    e.id = e.id || 'wp-printed'
    /* the day column's block around it: its own row, widened to the column, framed with room for the marker's label */
    const col = e.closest('.day') || e.parentElement, cr = col.getBoundingClientRect(), r = e.getBoundingClientRect()
    const x = Math.max(0, Math.min(cr.left, r.left - 40) - 6), right = Math.min(innerWidth, Math.max(cr.right, r.right + 40) + 6)
    const y = Math.max(0, r.top - 90), bottom = Math.min(innerHeight, r.bottom + 70)
    return { text: e.textContent.trim().slice(0, 80), sel: '#' + e.id, clip: { x, y, width: right - x, height: bottom - y } }
  })
  facts[T + ' 6 printed'] = found ? found.text : 'NONE FOUND'
  if (found) {
    await mark(page, [{ n: 'Today: printed with its date', sel: found.sel, float: true }])
    await page.screenshot({ path: join(OUT, `${T}-6-printed-today.png`), clip: found.clip }); await unmark(page)
    facts[T + ' 7 drawn'] = await page.evaluate(sel => { const e = document.querySelector(sel); for (const n of e.childNodes) if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s*till \d{1,2} [A-Z][a-z]{2}/, ''); return e.textContent.trim() }, found.sel)
    await mark(page, [{ n: 'Switch off: no date', sel: found.sel, new: true, float: true }])
    await page.screenshot({ path: join(OUT, `${T}-7-printed-off.png`), clip: found.clip }); await unmark(page)
  }
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log(JSON.stringify(facts, null, 1))
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
