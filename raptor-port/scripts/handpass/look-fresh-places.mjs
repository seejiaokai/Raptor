/* LOOK — [KEYBOARD-SCROLL] (D1048, D1047, 19 Oct 26): pictures of the four places suggested for "one tap then typing
   replaces", put to him before anything is built there (D852, D853). Nothing is changed by this script. At his
   iPhone's width (402, three times its density, dark), signed in as the admin: (1) the duty and wave templates' time
   boxes (Admin → Duty templates…, Wave templates…); (2) the Leave War's typed numbers — a Required P cell's pad and a
   counter's warning levels (⚙ → + Counter); (3) the SANS settings' and the late cut-off's number boxes; (4) the Logic
   page's settings. Each place is marked with a dashed orange box.
   Run: HP_URL=http://localhost:4332 node scripts/handpass/look-fresh-places.mjs
   Pictures: docs/img/handpass/2026-10-19-keyboard-scroll/look/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4332'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-keyboard-scroll/look')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errors = []

const MARK = () => {
  window.__mk = {
    clear() { document.querySelectorAll('.mk-mark').forEach(n => n.remove()) },
    mark(r, label, pad = 3) {
      const color = '#FF8A00'
      const d = document.createElement('div'); d.className = 'mk-mark'
      Object.assign(d.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px', border: `2px dashed ${color}`, borderRadius: '5px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
      if (label) {
        const l = document.createElement('div'); l.textContent = label
        Object.assign(l.style, { position: 'absolute', left: '-2px', bottom: '100%', marginBottom: '2px', background: color, color: '#000', font: '700 10px system-ui', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' })
        d.appendChild(l)
      }
      document.body.appendChild(d)
    },
    /* one box round every element matched (visible ones only), the label on the first */
    all(sel, label) {
      const els = [...document.querySelectorAll(sel)].filter(e => e.offsetWidth && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight)
      els.forEach((e, i) => window.__mk.mark(e.getBoundingClientRect(), i ? '' : label))
      return els.length
    },
  }
}

async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'dark' })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await p.evaluate(MARK)
  return { ctx, p }
}
const shot = (p, name) => p.screenshot({ path: resolve(OUT, name + '.png') })
const go = (p, page) => p.evaluate(pg => window.go(pg), page)

const browser = await chromium.launch(LAUNCH)
try {
  const { p } = await open(browser)

  /* 1 — the templates' time boxes */
  await go(p, 'admin'); await sleep(700)
  await p.click('#admDutyTpl'); await sleep(600)
  console.log('duty boxes', await p.evaluate(() => __mk.all('#tplModal input.tm', 'start / end times')))
  await shot(p, '1a-duty-template-times')
  await p.keyboard.press('Escape'); await sleep(300)
  await p.evaluate(() => document.querySelectorAll('#tplModal .x, #tplModal [aria-label="Close"]').forEach(b => b.click())); await sleep(300)
  await p.evaluate(() => __mk.clear())
  await p.click('#admWaveTpl'); await sleep(600)
  /* a template with a flying line, so its T/O and LD boxes show */
  const wv = await p.evaluate(() => __mk.all('input.tm', 'T/O and LD times'))
  console.log('wave boxes', wv)
  await shot(p, '1b-wave-template-times')
  await p.keyboard.press('Escape'); await sleep(300)
  await p.evaluate(() => __mk.clear())

  /* 3 — the SANS settings and the late cut-off, opened from the Logic page's doors; 4 — the Logic page */
  await go(p, 'logic'); await sleep(800)
  await p.evaluate(() => document.querySelector('input.lgin')?.scrollIntoView({ block: 'center' })); await sleep(300)
  console.log('logic boxes', await p.evaluate(() => __mk.all('input.lgin', 'Logic settings')))
  await shot(p, '4-logic-settings')
  await p.evaluate(() => __mk.clear())
  await p.evaluate(() => document.querySelector('[data-lgopen="sans"]')?.click()); await sleep(700)
  console.log('sans boxes', await p.evaluate(() => __mk.all('input.sset-num', 'number boxes')))
  await shot(p, '3a-sans-settings')
  await p.keyboard.press('Escape'); await sleep(400)
  await p.evaluate(() => __mk.clear())
  await p.evaluate(() => document.querySelector('[data-lgopen="inputs"]')?.click()); await sleep(700)
  console.log('cut-off boxes', await p.evaluate(() => __mk.all('input.sset-num', 'days before')))
  await shot(p, '3b-late-cutoff')
  await p.keyboard.press('Escape'); await sleep(400)
  await p.evaluate(() => __mk.clear())

  /* 2 — the Leave War: a Required P cell's pad, then a counter's warning levels */
  await go(p, 'leavewar'); await sleep(2500)
  const cell = await p.evaluate(() => {
    const c = [...document.querySelectorAll('[data-testid^="req-p-"]')].find(e => e.offsetWidth && e.getBoundingClientRect().left > 100)
    return c ? c.getAttribute('data-testid') : null
  })
  console.log('req cell', cell)
  if (cell) {
    await p.tap(`[data-testid="${cell}"]`); await sleep(700)
    console.log('pad', await p.evaluate(() => __mk.all('.flypad-keys, [data-testid="fly-edit-input"]', 'the pad')))
    await shot(p, '2a-leavewar-required-pad')
    await p.keyboard.press('Escape'); await sleep(400)
    await p.evaluate(() => __mk.clear())
  }
  await p.tap('[data-testid="settings-open"]'); await sleep(700)
  await p.evaluate(() => [...document.querySelectorAll('button')].find(b => /Counter/.test(b.textContent || '') && b.closest('[data-testid="settings-sheet"]'))?.click()); await sleep(800)
  await p.evaluate(() => document.querySelector('[data-testid="cform-amber"]')?.scrollIntoView({ block: 'center' })); await sleep(300)
  console.log('counter boxes', await p.evaluate(() => __mk.all('[data-testid="cform-amber"], [data-testid="cform-red"], [data-testid$="-count"]', 'counter numbers')))
  await shot(p, '2b-leavewar-counter-numbers')
} finally {
  console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no console errors')
  await browser.close()
}
