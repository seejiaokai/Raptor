/* MOCK-UP — [STANDBY-WEEK-B] (his question, 20 Oct 26: "why does SC not have B on edit schedule? Brief. Can u check BB
   and Avalon as well"). The real app: Monday's week on Edit Schedule with an SC, an AVALON and a BB wave added, SC's AM
   MAIN B box typed on the Scheduler Board (05:45 — SC's in-time, D1041), everything else as the app makes it.
   TODAY: the week as built — SHIFT · R over START · END; the B typed on the board is not shown (ringed red).
   PROPOSED — ONE transform, drawn in: on each standby wave the heading reads R over B and START over END, as a flying
   wave's R over B and TO over LD; in each shift line the START box moves under END's column, above END, as a flying line's
   TO sits above its LD, and a B box — cloned from a flying line's own B box — sits under R, showing the line's own B
   (the board's value) or, empty, the faint grey dash of D1065. Orange dashed boxes mark what is new.
   Pictures 5 and 6: the same, the third heading TO over LD (a flying wave's, and the board's on these lines) — on a
   phone START does not fit the third column (it runs under FCP / RCP in picture 2).
   Run: HP_URL=http://localhost:4183 node scripts/handpass/mock-standby-week-b.mjs
   Pictures: docs/img/handpass/2026-10-20-standby-week-b/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('mock-standby-week-b v4')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4183'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-standby-week-b')
mkdirSync(OUT, { recursive: true })
const DI = 0
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []

async function login(ctx) {
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(BASE + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{display:none !important}' })
  return p
}

/* SC, AVALON and BB added to Monday, a few men seated, as a scheduler would */
async function setUp(p) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  const gis = await p.evaluate((DI) => {
    for (const k of ['sc', 'avalon', 'bb']) window.addWave(DI, k)
    const ws = window.DAYS[DI].waves
    const gi = k => ws.findIndex(w => w.kind === k)
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special)
    const used = new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    const sc = gi('sc'), av = gi('avalon')
    ;[[sc, 0, 0], [sc, 0, 2], [sc, 1, 0], [av, 0, 0]].forEach(([g, li, ai]) => { window.fillSlot(`${DI}.${g}.${li}.${ai}.p`, pick('FCP')); window.fillSlot(`${DI}.${g}.${li}.${ai}.w`, pick('RCP')) })
    return { sc, av, bb: gi('bb') }
  }, DI)
  /* SC's AM B typed where the app lets it be typed today: the Scheduler Board */
  await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
  const b = p.locator(`#sbBoard [data-bfld="ff:${DI}.${gis.sc}.0.br"]:visible`).first()
  await b.evaluate(e => { e.focus({ preventScroll: true }); e.value = '05:45'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() })
  await p.waitForTimeout(600)
  const br = await p.evaluate(({ DI, g }) => window.DAYS[DI].waves[g].formations[0].br, { DI, g: gis.sc })
  if (!/05:?45/.test(String(br))) throw new Error('SC B not saved from the board: ' + br)
  await p.evaluate(() => window.closeScheduler ? window.closeScheduler() : document.querySelector('#sbDone')?.click()); await p.waitForTimeout(900)
  return gis
}

/* in the page: the day card and its three standby waves */
function waves({ DI, gis }) {
  const day = document.querySelectorAll('#page-editsched .day')[DI]
  const go = g => day.querySelector(`[data-move="mv:w.${DI}.${g}"]`)
  return { day, list: [gis.sc, gis.av, gis.bb].map(go) }
}

/* the mark is an outline on the element itself (v3's overlays on the page drifted when the desktop week moved after them) */
function markBox(e, colour, dashed) {
  e.classList.add('mock-mark'); e.style.outline = `2px ${dashed ? 'dashed' : 'solid'} ${colour}`; e.style.outlineOffset = '1px'; e.style.borderRadius = '4px'
}

/* TODAY: ring the two time headings and the empty place where SC's typed B is missing */
function ringToday(arg) {
  const { list } = waves(arg)
  let n = 0
  for (const go of list) {
    const hs = go.querySelector('.cols.formcols').children
    markBox(hs[1], '#ff3b3b'); markBox(hs[2], '#ff3b3b'); n++
  }
  return n
}

/* PROPOSED: the one transform */
function draw(arg) {
  const { DI } = arg
  const { day, list } = waves(arg)
  const fly = day.querySelector('.go:not(.sa) .form')
  const brSrc = fly.querySelector('.bto [data-txt$=".br"]'), toSrc = fly.querySelector('.ld [data-txt$=".to"]')
  if (!brSrc || !toSrc) throw new Error('no flying line to clone from')
  let n = 0
  for (const go of list) {
    const hs = go.querySelector('.cols.formcols').children
    hs[1].innerHTML = 'R<br>B'; hs[2].innerHTML = arg.h3 || 'START<br>END'
    hs[1].classList.add('mock-new'); hs[2].classList.add('mock-new')
    for (const form of go.querySelectorAll('.form')) {
      const bto = form.querySelector('.fcell.bto'), ld = form.querySelector('.fcell.ld')
      const toEl = bto.querySelector('[data-txt$=".to"]')
      const path = toEl.getAttribute('data-txt').replace(/\.to$/, '.br')
      const [g, li] = path.slice(3).split('.').slice(1).map(Number)
      const v = window.DAYS[DI].waves[g].formations[li].br
      const b = brSrc.cloneNode(false)
      b.classList.remove('sugbox'); b.removeAttribute('data-ph'); b.setAttribute('data-txt', path)
      b.textContent = v ? window.fmtHM ? window.fmtHM(v) : String(v) : ''
      if (!b.textContent) b.setAttribute('data-ph', '–')
      b.classList.add('mock-new')
      bto.insertBefore(b, toEl.nextSibling)
      toEl.className = toSrc.className
      ld.insertBefore(toEl, ld.firstChild)
      n++
    }
  }
  for (const e of day.querySelectorAll('.mock-new')) markBox(e, '#ff9a3c', true)
  return n
}

async function shoot(p, gis, name, fn, phone, h3) {
  await p.evaluate(() => document.querySelectorAll('.mock-mark').forEach(m => { m.style.outline = ''; m.classList.remove('mock-mark') }))
  await p.evaluate(({ DI, gis }) => {
    const day = document.querySelectorAll('#page-editsched .day')[DI]
    const sc = day.querySelector(`[data-move="mv:w.${DI}.${gis.sc}"]`)
    sc.scrollIntoView({ block: 'start', inline: 'start' })
    window.scrollBy(0, -140)
  }, { DI, gis })
  /* the desktop week glides to the day: draw only once the day card has stopped moving (v2's today rings were drawn mid-glide) */
  let last = null
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(150)
    const at = await p.evaluate(DI => { const r = document.querySelectorAll('#page-editsched .day')[DI].getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)}` }, DI)
    if (at === last) break
    last = at
  }
  await p.addScriptTag({ content: `window.waves=${waves.toString()};window.markBox=${markBox.toString()};` })
  if (fn) { const n = await p.evaluate(fn, { DI, gis, h3 }); if (!n) throw new Error(name + ': drew nothing — premise gone'); console.log(name, 'drawn', n) }
  await p.waitForTimeout(150)
  const box = await p.evaluate(({ DI, gis }) => {
    const day = document.querySelectorAll('#page-editsched .day')[DI]
    const a = day.querySelector(`[data-move="mv:w.${DI}.${gis.sc}"]`).getBoundingClientRect()
    const z = day.querySelector(`[data-move="mv:w.${DI}.${gis.bb}"]`).getBoundingClientRect()
    const d = day.getBoundingClientRect()
    return { x: d.left + scrollX, y: a.top + scrollY, w: d.width, h: z.bottom - a.top }
  }, { DI, gis })
  const vw = p.viewportSize().width
  const clip = phone
    ? { x: 0, y: Math.max(0, box.y - 70), width: vw, height: box.h + 90 }
    : { x: Math.max(0, box.x - 16), y: Math.max(0, box.y - 70), width: Math.min(box.w + 32, vw), height: box.h + 90 }
  await p.screenshot({ path: resolve(OUT, name), clip, fullPage: true })
}

try {
  {
    const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: false, hasTouch: true, colorScheme: 'dark' })
    const p = await login(ctx); const gis = await setUp(p)
    await shoot(p, gis, '1-phone-week-today.png', ringToday, true)
    await shoot(p, gis, '2-phone-week-proposed.png', draw, true)
    await ctx.close()
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: false, hasTouch: true, colorScheme: 'dark' })
    const p = await login(ctx); const gis = await setUp(p)
    await shoot(p, gis, '5-phone-week-proposed-to-ld.png', draw, true, 'TO<br>LD')
    await ctx.close()
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    const p = await login(ctx); const gis = await setUp(p)
    await shoot(p, gis, '3-desktop-week-today.png', ringToday, false)
    await shoot(p, gis, '4-desktop-week-proposed.png', draw, false)
    await ctx.close()
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    const p = await login(ctx); const gis = await setUp(p)
    await shoot(p, gis, '6-desktop-week-proposed-to-ld.png', draw, false, 'TO<br>LD')
    await ctx.close()
  }
} finally {
  await browser.close()
  console.log('page errors', errors.length, errors.slice(0, 3).join(' | '))
}
