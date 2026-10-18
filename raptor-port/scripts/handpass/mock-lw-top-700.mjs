/* Pictures for D1000 (18 Oct 26): "On screens up to about 700 wide the Leave War's top takes the phone's shorter
   two-line layout (D678), not the tallest one; the top only, the grid unchanged; drawn for him at 440 and 600 wide
   before it is built." NOTHING HERE IS BUILT — the "proposed" pictures are the app's OWN phone layout switched on at a
   wider width in the live page, never a restyle by eye:
     1. the words: the Leave War asks one question, "is this a phone?" (`src/leavewar/ui/phone.ts` PHONE_QUERY,
        '(max-width: 430px)'); an init script answers that exact query as if it read '(max-width: 700px)';
     2. the layout: the built stylesheet's phone block for the TOP (chrome.css's `@media (max-width: 430px)`, found in
        the built sheet as the 430 block holding `.warnew`) is copied rule for rule into a style tag under
        `(max-width: 700px)` — except its two rules that are not the top (`.stage`, the grid card's padding; and
        `.card-hd .rtlbl`, the words beside the grid card's buttons), so the grid is the same as today's.
   The script prints how many rules it copied (zero means the "proposed" is not real) and which it left out.
   The top area (the Period line and the Stage line, above the grid card) is ringed red on every picture.
   Prints, per picture, where the grid's first row starts and how many roster rows are on screen; at 600 proposed it
   also checks nothing in the top runs past the screen and the grid's columns are the same widths as today's.
   Phone sizes by touch (isMobile + hasTouch), deviceScaleFactor 2, the built app.
   Run (the app built and served already): SPF_URL=http://localhost:4174 node scripts/handpass/mock-lw-top-700.mjs
   Out: docs/img/handpass/2026-10-18-lw-top-700/ */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-lw-top-700')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('mock-lw-top-700 →', OUT)

const PHONE_QUERY = '(max-width: 430px)'           // phone.ts, read 18 Oct 26
const WIDER = '(max-width: 700px)'

/* the words: answer the Leave War's "is this a phone?" as if the phone ran to 700 */
const wordsInit = ({ q, w }) => {
  const orig = window.matchMedia.bind(window)
  window.matchMedia = query => orig(query === q ? w : query)
}

/* the layout: copy the top's phone block out of the built Leave War sheet, raised to 700 */
const injectLayout = (shortWords) => {
  const out = { copied: 0, skipped: [], blocks430: 0, sheet: '' }
  let css = ''
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules } catch { continue }
    for (const r of rules) {
      if (!(r instanceof CSSMediaRule)) continue
      const c = r.conditionText.replace(/\s/g, '')
      if (c !== '(width<=430px)' && c !== '(max-width:430px)') continue
      out.blocks430++
      if (!r.cssText.includes('.warnew')) continue                 // only chrome.css's block: the top
      out.sheet = (sh.href || 'inline').split('/').pop()
      for (const inner of r.cssRules) {
        const sel = inner.selectorText || ''
        if (/(^|,|\s)#page-leavewar \.stage(\s*$|,)/.test(sel) || (sel.includes('.card-hd') && !shortWords)) { out.skipped.push(sel); continue }
        css += inner.cssText + '\n'; out.copied++
      }
    }
  }
  const st = document.createElement('style'); st.id = 'mockTop700'
  st.textContent = `@media (max-width: 700px) {\n${css}}`
  document.head.appendChild(st)
  return out
}

/* the top area: the Leave War's own rows above the grid card */
async function ring(page) {
  await page.evaluate(() => {
    document.getElementById('mockRing')?.remove()
    const pg = document.querySelector('#page-leavewar')
    const els = [pg.querySelector(':scope > .topbar'), pg.querySelector(':scope > .filters')].filter(Boolean)
    const rs = els.map(e => e.getBoundingClientRect()).filter(r => r.height)
    const l = Math.max(2, Math.min(...rs.map(r => r.left))), t = Math.min(...rs.map(r => r.top))
    const rr = Math.min(innerWidth - 2, Math.max(...rs.map(r => r.right))), b = Math.max(...rs.map(r => r.bottom))
    const d = document.createElement('div'); d.id = 'mockRing'
    Object.assign(d.style, { position: 'fixed', left: (l) + 'px', top: (t - 1) + 'px', width: (rr - l) + 'px', height: (b - t + 2) + 'px', border: '3px solid #FF3B30', borderRadius: '12px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
    document.body.appendChild(d)
  })
}

const measureInPage = () => {
    const pg = document.querySelector('#page-leavewar')
    const rows = [...pg.querySelectorAll('[data-testid^="row-"]')].filter(r => r.getBoundingClientRect().height)
    const seen = rows.filter(r => r.getBoundingClientRect().bottom <= innerHeight).length
    const tb = pg.querySelector(':scope > .topbar'), fl = pg.querySelector(':scope > .filters')
    /* sideways: every control in the top inside the screen, and neither line scrolling */
    const offs = [...(tb?.querySelectorAll('*') || []), ...(fl?.querySelectorAll('*') || [])]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 0.5 || r.left < -0.5) })
      .map(e => (e.getAttribute('data-testid') || e.className || e.tagName) + '')
    const cut = [...(tb?.querySelectorAll('*') || []), ...(fl?.querySelectorAll('*') || [])]
      .filter(e => e.children.length === 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible')
      .map(e => `${e.getAttribute('data-testid') || e.className} "${(e.textContent || '').trim()}"`)
    /* the grid's columns: the first roster row's first 40 cells (the name, the figures, the days) and their left edges */
    const head = rows[0]
    const cols = head ? [...head.children].slice(0, 40).map(c => { const b = c.getBoundingClientRect(); return `${Math.round(b.left * 10) / 10}+${Math.round(b.width * 10) / 10}` }) : []
    const trs = [tb, fl].filter(Boolean).map(e => e.getBoundingClientRect()).filter(r => r.height)
    const tr = { t: Math.min(...trs.map(r => r.top)), b: Math.max(...trs.map(r => r.bottom)) }
    return {
      gridTop: Math.round(pg.querySelector('.mx-outer').getBoundingClientRect().top),
      firstRow: rows[0] ? Math.round(rows[0].getBoundingClientRect().top) : -1,
      seen, topH: Math.round(tr.b - tr.t),
      lines: { tb: tb ? Math.round(tb.getBoundingClientRect().height) : 0, fl: fl ? Math.round(fl.getBoundingClientRect().height) : 0 },
      over: { tb: tb ? tb.scrollWidth - tb.clientWidth : 0, fl: fl ? fl.scrollWidth - fl.clientWidth : 0, page: document.documentElement.scrollWidth - document.documentElement.clientWidth },
      offs, cut, cols, whoW: getComputedStyle(pg).getPropertyValue('--who-w').trim(),
      stagePad: getComputedStyle(pg.querySelector('.stage')).padding,
      card: Math.round(pg.querySelector('.card').getBoundingClientRect().width),
      edges: { top: Math.round(Math.min(...[...(tb?.querySelectorAll('button, select, .lab') || [])].map(e => e.getBoundingClientRect()).filter(r => r.width).map(r => r.left))), card: Math.round(pg.querySelector('.card').getBoundingClientRect().left) },
      phoneWords: !pg.querySelector('[data-testid="period-label"]'),
    }
}

async function shoot(name, viewport, proposed, shortWords = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  if (proposed) await ctx.addInitScript(wordsInit, { q: PHONE_QUERY, w: WIDER })
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(e.message))
  await page.goto(BASE + '/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.locator('#loginForm button[type=submit]').tap()
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  await sleep(500)
  /* a counter and the running figures, as the earlier Leave War top pictures had (lw-phone-head-mock.mjs) */
  await page.evaluate(() => {
    if (window.setFlyRun) window.setFlyRun('2026-01-02', { p: 16, w: 16 })
    if (window.lwSaveManningRule) window.lwSaveManningRule({ id: 'sc-d', label: 'SC D', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 0, red: 0 } })
  })
  await sleep(400)
  let inj = null
  if (proposed) {
    inj = await page.evaluate(injectLayout, shortWords)
    console.log(`  ${name}: copied ${inj.copied} rules from ${inj.sheet} (of ${inj.blocks430} phone blocks there); left out: ${inj.skipped.join(' | ')}`)
    if (!inj.copied) throw new Error('no phone rules copied — the proposed picture would not be real')
    await sleep(400)
  }
  /* premise check: the words really are the phone's in a proposed picture, and the desktop's in a wide "today" */
  const mm = await page.evaluate(() => {
    const pg = document.querySelector('#page-leavewar')
    return { phoneWords: !pg.querySelector('[data-testid="period-label"]'), style: !!document.getElementById('mockTop700') }
  })
  if (proposed && !(mm.phoneWords && mm.style)) throw new Error(`${name}: the proposed premise is gone (${JSON.stringify(mm)})`)
  await ring(page)
  const r = await page.evaluate(measureInPage)
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  if (errs.length) console.log(`  ${name}: page errors: ${errs.join(' / ')}`)
  await ctx.close()
  return r
}

const SETS = [
  ['1-390-today', { width: 390, height: 844 }, false],
  ['2-440-today', { width: 440, height: 956 }, false],
  ['3-440-proposed', { width: 440, height: 956 }, true],
  ['4-600-today', { width: 600, height: 960 }, false],
  ['5-600-proposed', { width: 600, height: 960 }, true],
  /* his follow-up the same evening: the 440 proposed top AND the grid card's button row given the phone's short words
     (the `.card-hd .rtlbl` rule: "Rearrange" and "OIL tracker" read as their icons) so "−" and "+" stay on line one;
     the card's outer padding (`.stage`) is still left out */
  ['6-440-proposed-short-words', { width: 440, height: 956 }, true, true],
]
const res = {}
for (const [name, vp, prop, short] of SETS) {
  const r = await shoot(name, vp, prop, short)
  res[name] = r
  console.log(`${name}.png — top ${r.topH}px tall (Period line ${r.lines.tb}, Stage line ${r.lines.fl}); grid card at ${r.gridTop}px, first roster row at ${r.firstRow}px; ${r.seen} roster rows wholly on screen; phone words: ${r.phoneWords}; sideways overflow top/stage/page ${r.over.tb}/${r.over.fl}/${r.over.page}; name column ${r.whoW}; card ${r.card}px; grid card padding ${r.stagePad}; left edge of the top's first control ${r.edges.top}px, of the grid card ${r.edges.card}px`)
  if (r.offs.length) console.log(`  off the screen sideways: ${r.offs.join(', ')}`)
  if (r.cut.length) console.log(`  cut words: ${r.cut.join(', ')}`)
}
for (const [t, p] of [['2-440-today', '3-440-proposed'], ['4-600-today', '5-600-proposed'], ['2-440-today', '6-440-proposed-short-words']]) {
  const a = res[t], b = res[p]
  const same = a.cols.length === b.cols.length && a.cols.every((w, i) => w === b.cols[i]) && a.whoW === b.whoW && a.card === b.card && a.stagePad === b.stagePad
  console.log(`${p}: first row ${a.firstRow - b.firstRow}px higher than today, ${b.seen - a.seen} more roster rows on screen; grid columns the same as today: ${same} (${a.cols.length} cells of the first roster row compared)`)
  if (!same) console.log(`  today ${JSON.stringify(a.cols.slice(0, 12))} ${a.whoW} / proposed ${JSON.stringify(b.cols.slice(0, 12))} ${b.whoW}`)
}
await browser.close()
