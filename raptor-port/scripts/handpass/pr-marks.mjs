/* The pictures round, group "marks" (chat 3, the night of 7–8 Nov 26 — D1747; the shared brief
   docs/superpowers/briefs/2026-11-07-pictures-round-brief.md). Every picture is the real app, served from main, except the
   ones whose name ends "-drawn": those are the same running app with the proposed change drawn into the page (DOM and
   style only, nothing saved). Rings are outlines on the element itself, each with a small amber tag in its own ::before
   (or ::after where the app already uses ::before) naming the problem.
     trkpop   [TRK-ROUND-SEEN] point (2): on a phone, an event's marking pop-up opened in the middle of the chart (where a
              Find or a crew pick lands it, D984) flips above the event and covers the Tracker bar and the Flow chart /
              Info / Show All tabs. Drawn A: the chart slides the event up under the tabs, the pop-up whole below it.
              Drawn B: nothing moves, the pop-up held under the tabs, its foot scrolling inside itself.
     trkfind  [TRK-ROUND-SEEN] point (3): on a phone Find's strip sits over the tabs, and its ✕ only empties the box (the
              strip stays, the keyboard comes back). Drawn A: ✕ puts Find away (the state Escape gives today). Drawn C:
              the strip opens under the tabs.
     r5a..e   [UI-CONSISTENCY-LOOK] round 5: (a) the 👁 of a look at an issued version, (b) the Inputs calendar's ⤢ / ⤡,
              (c) the Tracker Reorder window's ↺ Restore, (d) the warning lines' ✕ / ↺ on the board and Edit Schedule,
              (e) the phone day bar's Templates and OIL Earn in words alone. Each drawn with a mark from round 4's set
              (cr4-look.mjs ICON, ui/icons.tsx, ui/glyphs.ts) or the app's own eye (ui/WaveTplModal.tsx EyeOn).
   Desktop 1536 × 864 (his PC), phone 402 × 874 (his iPhone, touch), both at 2× so they are sharp on his phone.
   Run from raptor-port/: HP_URL=http://localhost:4291 HP_SHOTS=docs/img/handpass/2026-11-07-pictures-round
        node scripts/handpass/pr-marks.mjs        PRM_ONLY=trkpop,r5a redoes only those sections. */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go, board, closeBoard, publish } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
/* the numbers read, kept outside the repo (the notes quote them) */
const MEAS = process.env.PRM_MEAS || join(tmpdir(), 'pr-marks-measured.json')
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = process.env.PRM_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const made = []
let measured = {}
try { measured = JSON.parse(readFileSync(MEAS, 'utf8')) } catch { measured = {} }

/* ---- the marks, in the app's line style (a 24-unit box, a 2-wide line, round ends — ui/icons.tsx) ---- */
const svg = (inner, size, extra = '') => `<svg class="zz-ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.15em;flex:0 0 auto;${extra}">${inner}</svg>`
const ICON = {
  /* the app's own eye (ui/WaveTplModal.tsx EyeOn — the wave templates window's "shown" mark) */
  eye: '<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7S19 19 12 19 1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/>',
  /* round 4's reset — an arrow turning back, "put back" (ui/glyphs.ts RESET_INNER; the Tracker's ResetGlyph is the same) */
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  /* History's clock (ui/icons.tsx HistIcon), only to stand beside the reset arrow for lesson 92 */
  hist: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l3.5 2"/>',
  /* round 4's templates and OIL ticket (ui/glyphs.ts TEMPLATES_INNER, TICKET_INNER) */
  tpl: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><rect x="3" y="14" width="9" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  /* NEW to the app, in the same style (Lucide's maximize-2 / minimize-2): every input shown — two arrows out to the
     corners; the month compact — two arrows in from them */
  expand: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
  compact: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
}

const RING_CSS = `#toastEl,.toast,.snack,[role=status].toast{display:none!important} *{scroll-behavior:auto!important}
.zz-ring{outline:3px solid #ffb020!important;outline-offset:3px!important;border-radius:7px}
.zz-tb::before,.zz-ta::after{content:attr(data-zz-tag)!important;position:absolute!important;left:-3px;top:calc(100% + 9px);bottom:auto;right:auto;
  z-index:2147483000!important;display:block!important;width:max-content!important;max-width:none!important;height:auto!important;
  background:#0b0f14!important;color:#ffb020!important;border:1px solid #ffb020!important;border-radius:6px!important;
  font:700 12.5px/1.3 -apple-system,'Segoe UI',system-ui,sans-serif!important;letter-spacing:0!important;text-transform:none!important;
  text-align:left!important;white-space:nowrap!important;padding:3px 7px!important;margin:0!important;pointer-events:none!important;
  opacity:1!important;transform:none!important;text-decoration:none!important;box-shadow:none!important}
.zz-up.zz-tb::before,.zz-up.zz-ta::after{top:auto;bottom:calc(100% + 9px)}
.zz-in.zz-tb::before,.zz-in.zz-ta::after{top:auto;bottom:6px;left:6px}
.zz-rt.zz-tb::before,.zz-rt.zz-ta::after{left:auto;right:-3px}`

async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGE ERROR', e.message))
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: RING_CSS })
  return { ctx, page }
}
const vis = 'e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }'
/* ring every visible match of each selector; the FIRST visible match of `tagSel` (default: the first selector) carries
   the tag. opts.pos: 'below' (default) | 'up' | 'in'; opts.rt: hang it from the right edge */
async function ring(page, sels, tag = null, opts = {}) {
  await page.evaluate(([sels, tag, opts]) => {
    const isVis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    for (const sel of sels) {
      const els = [...document.querySelectorAll(sel)].filter(isVis)
      if (!els.length) throw new Error('ring: nothing at ' + sel)
      els.forEach(e => e.classList.add('zz-ring'))
    }
    if (!tag) return
    const els = [...document.querySelectorAll(opts.tagSel || sels[0])].filter(isVis)
    const e = els[opts.nth || 0]; if (!e) throw new Error('tag: nothing at ' + (opts.tagSel || sels[0]))
    const used = p => { const c = getComputedStyle(e, p).content; return c && c !== 'none' && c !== 'normal' }
    const cls = !used('::before') ? 'zz-tb' : !used('::after') ? 'zz-ta' : null
    if (!cls) throw new Error('tag: both pseudo-elements in use at ' + (opts.tagSel || sels[0]))
    if (getComputedStyle(e).position === 'static') { e.style.position = 'relative'; e.dataset.zzPos = '1' }
    e.dataset.zzTag = tag; e.classList.add(cls)
    if (opts.pos === 'up') e.classList.add('zz-up'); if (opts.pos === 'in') e.classList.add('zz-in'); if (opts.rt) e.classList.add('zz-rt')
    if (opts.css) { const st = document.createElement('style'); st.id = 'zz-x'; st.textContent = '.zz-x.zz-tb::before,.zz-x.zz-ta::after{' + opts.css + '}'; document.head.appendChild(st); e.classList.add('zz-x') }
    if (opts.vis) { e.dataset.zzOv = e.style.overflowY || '-'; e.style.overflowY = 'visible' }
    /* a box that clips its overflow both ways would clip its own tag: opened for the picture, put back by unring */
    if (opts.open) { e.dataset.zzOa = e.style.overflow || '-'; e.style.overflow = 'visible' }
  }, [sels, tag, opts])
}
const unring = page => page.evaluate(() => {
  document.querySelectorAll('.zz-ring').forEach(e => e.classList.remove('zz-ring'))
  document.querySelectorAll('[data-zz-tag]').forEach(e => { e.classList.remove('zz-tb', 'zz-ta', 'zz-up', 'zz-in', 'zz-rt', 'zz-x'); delete e.dataset.zzTag; if (e.dataset.zzPos) { e.style.position = ''; delete e.dataset.zzPos } if (e.dataset.zzOv) { e.style.overflowY = e.dataset.zzOv === '-' ? '' : e.dataset.zzOv; delete e.dataset.zzOv } if (e.dataset.zzOa) { e.style.overflow = e.dataset.zzOa === '-' ? '' : e.dataset.zzOa; delete e.dataset.zzOa } })
  const st = document.getElementById('zz-x'); if (st) st.remove()
})
const boxOf = (page, sel) => page.evaluate(sel => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sel)
const R = (page, sel) => page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!e) return null; const r = e.getBoundingClientRect()
  return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) }
}, sel)
async function strip(page, name, y, h, vp, x = 0, w = vp.width) {
  let X = Math.max(0, Math.round(x)); const Y = Math.max(0, Math.round(y))
  if (X + Math.round(w) > vp.width) X = Math.max(0, vp.width - Math.round(w))
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: X, y: Y, width: Math.min(Math.round(w), vp.width - X), height: Math.min(Math.round(h), vp.height - Y) } })
  made.push(name)
}
async function around(page, name, sel, vp, { pad = 22, padX = null, padT = null, padB = null, wide = false, minW = 0 } = {}) {
  const b = await boxOf(page, sel); if (!b) throw new Error('around: nothing at ' + sel)
  let px = padX == null ? pad : padX
  const pt = padT == null ? pad : padT, pb = padB == null ? pad : padB
  if (minW && b.r - b.x + px * 2 < minW) px = (minW - (b.r - b.x)) / 2
  if (wide) return strip(page, name, b.y - pt, b.b - b.y + pt + pb, vp)
  await strip(page, name, b.y - pt, b.b - b.y + pt + pb, vp, b.x - px, b.r - b.x + px * 2)
}
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.message.split('\n')[0]) } }
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
const press = async (page, sel, touch) => { const l = page.locator(sel).filter({ visible: true }).first(); if (touch) await l.tap(); else await l.click(); await sleep(500) }
const pressText = async (page, sel, re, touch) => { const l = page.locator(sel).filter({ visible: true, hasText: re }).first(); if (touch) await l.tap(); else await l.click(); await sleep(500) }
/* swap a typed mark for a drawn one: the text node holding `sym` loses it (and an emoji's variation selector after it),
   the svg stands in its place */
const swapMark = (page, sel, sym, svgHtml) => page.evaluate(([sel, sym, svgHtml]) => {
  let n = 0
  for (const e of document.querySelectorAll(sel)) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
    const hits = []; while (w.nextNode()) if (w.currentNode.nodeValue.includes(sym)) hits.push(w.currentNode)
    for (const t of hits) {
      let [a, ...rest] = t.nodeValue.split(sym); let b = rest.join(sym)
      if (b.startsWith('️')) b = b.slice(1)
      const tpl = document.createElement('template'); tpl.innerHTML = svgHtml
      const frag = document.createDocumentFragment()
      if (a) frag.appendChild(document.createTextNode(a))
      frag.appendChild(tpl.content.firstChild)
      if (b) frag.appendChild(document.createTextNode(b))
      t.replaceWith(frag); n++
    }
  }
  return n
}, [sel, sym, svgHtml])
async function mustSwap(page, sel, sym, svgHtml) { const n = await swapMark(page, sel, sym, svgHtml); if (!n) throw new Error(`swap: no ${sym} in ${sel}`); return n }
/* his iPhone draws the typed 👁 as a coloured emoji; this test browser draws it plain, as a grey text eye, so a "today"
   picture taken as it is shows him nothing of the problem (the design read of 8 Nov 26). For the "today" pictures only, the
   eye is set in the emoji fonts with its emoji selector: the PC's own colour eye stands in for the one his iPhone draws.
   swapMark then still finds the 👁 (it drops the selector after it), so the drawn picture swaps the same eye. */
const colourEye = (page, sel) => page.evaluate(sel => {
  let n = 0
  for (const e of document.querySelectorAll(sel)) {
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const hits = []
    while (w.nextNode()) if (w.currentNode.nodeValue.includes('\u{1F441}') && !w.currentNode.parentElement.classList.contains('zz-emoji')) hits.push(w.currentNode)
    for (const t of hits) {
      const parts = t.nodeValue.split('\u{1F441}'); const frag = document.createDocumentFragment()
      parts.forEach((p, i) => {
        const q = i > 0 && p.startsWith('️') ? p.slice(1) : p
        if (q) frag.appendChild(document.createTextNode(q))
        if (i < parts.length - 1) {
          const s = document.createElement('span'); s.className = 'zz-emoji'
          s.textContent = '\u{1F441}'; frag.appendChild(s); n++
        }
      })
      t.replaceWith(frag)
    }
  }
  /* each eye keeps the room its plain eye took, so no line wraps differently from the app's own (the colour eye is a
     little wider here, and his iPhone's width is not known): only its look changes */
  for (const s of document.querySelectorAll(sel.split(',').map(x => x.trim() + ' .zz-emoji:not([data-w])').join(','))) {
    const w = s.getBoundingClientRect().width; s.dataset.w = String(Math.round(w * 10) / 10)
    s.style.cssText = `display:inline-flex;justify-content:center;width:${w}px;white-space:nowrap;font-family:'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif`
    s.textContent = '\u{1F441}️'
  }
  return n
}, sel)
/* back to the app's own plain eye before a drawing, so the drawn mark stands where the typed one stood, nothing else */
const plainEye = page => page.evaluate(() => { for (const s of document.querySelectorAll('.zz-emoji')) s.replaceWith(document.createTextNode('\u{1F441}')) })
/* every visible text holding a mark, for the roll of what shows where */
const marksOf = (page, sym) => page.evaluate(sym => {
  const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) { const t = w.currentNode; if (!t.nodeValue.includes(sym)) continue; const e = t.parentElement; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
    out.push({ el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''), txt: e.textContent.trim().slice(0, 90), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), col: getComputedStyle(e).color, fs: getComputedStyle(e).fontSize }) }
  return out
}, sym)

/* ================= the Tracker on a phone ================= */
/* the pop-up is 210 wide and scrolls inside itself, so its tag hangs OUTSIDE it, to its left, wrapped (the pop-up is set
   overflow-visible for the picture only when nothing in it overflows — so nothing it shows changes) */
const LEFT_TAG = (top, w) => `left:auto!important;right:calc(100% + 10px)!important;top:${top}px!important;bottom:auto!important;white-space:normal!important;width:${w}px!important`
const noHover = page => page.mouse.move(2, 870).catch(() => {})
async function trkOpen(page) {
  await go(page, 'tracker'); await page.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 }); await sleep(1200)
}
const trkGeo = page => page.evaluate(() => {
  const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height) } }
  return { header: R('#page-tracker header'), tabs: R('#viewtabs'), board: R('#board'), pop: (() => { const p = document.getElementById('pop'); if (!p || getComputedStyle(p).display === 'none') return null; return R('#pop') })(), find: (() => { const p = document.getElementById('hSearchPanel'); return p && p.classList.contains('on') ? R('#hSearchPanel') : null })(), focus: document.activeElement && document.activeElement.id, q: (document.getElementById('hSearch') || {}).value, boardTop: (document.getElementById('board') || {}).scrollTop }
})
const ballAt = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null; const r = g.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), t: Math.round(r.top), b: Math.round(r.bottom), found: !!g.querySelector('.found') } }, id)
/* type into Find the way a phone does — the box's own setter and an input event, never page.type (the method's trap) */
async function findType(page, q) {
  await page.evaluate(q => { const i = document.getElementById('hSearch'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, q); i.dispatchEvent(new Event('input', { bubbles: true })) }, q)
  await sleep(700)
}

async function trkpop() {
  const vp = PHONE
  const { ctx, page } = await world(vp, true)
  await trkOpen(page)
  const M = measured.trkpop = { landing: await trkGeo(page) }
  // the real way an event comes to the middle of the chart: Find it (D984 centres it), pick it from the list
  await press(page, '#hSearchBtn', true); await sleep(400)
  await findType(page, 'ACG-09')
  const rows = await page.locator('#hSearchList .findrow').count()
  M.findRows = rows
  if (rows) { await page.locator('#hSearchList .findrow').first().tap(); await sleep(1400) }
  else { await page.keyboard.press('Enter'); await sleep(1400) }
  M.afterFind = await trkGeo(page)
  const ball = await ballAt(page, 'ACG-09'); M.ball = ball
  if (!ball) throw new Error('no ACG-09 ball')
  // tap the event itself: the tap outside Find's strip puts the strip away, the event's pop-up opens
  await page.touchscreen.tap(ball.x, ball.y); await sleep(900)
  M.pop = await trkGeo(page); M.ballThen = await ballAt(page, 'ACG-09')
  if (!M.pop.pop) throw new Error('no pop-up opened')
  M.coversTabs = M.pop.pop.t < M.pop.tabs.b; M.coversBar = M.pop.pop.t < M.pop.header.b
  console.log('trkpop', JSON.stringify(M))
  if (!M.coversTabs) throw new Error('premise: the pop-up does not cover the tabs here — ' + JSON.stringify(M.pop.pop))
  await settle(page); await noHover(page)
  // the real picture: the pop-up over the app's top bar, the Tracker bar and the tabs
  M.popOverflows = await page.evaluate(() => { const p = document.getElementById('pop'); return p.scrollHeight > p.clientHeight + 1 })
  await ring(page, ['#pop'], 'It covers the top bar, the Tracker bar and the Flow chart, Info and Show All tabs', { css: LEFT_TAG(190, 150), vis: !M.popOverflows })
  const bot = Math.max(M.pop.pop.b, M.ballThen.b) + 26
  await strip(page, 'q-trkpop-ph-today', 0, bot, vp)
  await unring(page)
  // the band where it happens: walk the board so each ball centre sits at y, open its pop-up, read where it lands
  // (measured on ACG-09 itself, scrolling the board — the pop-up's own placement does the rest)
  await page.locator('#pop button', { hasText: /Close/ }).first().tap().catch(() => page.keyboard.press('Escape')); await sleep(500)
  const band = []
  for (const y of [200, 260, 320, 380, 440, 470, 500, 530, 560, 600, 640, 700, 760]) {
    const b0 = await ballAt(page, 'ACG-09')
    await page.evaluate(d => { const bd = document.getElementById('board'); bd.scrollTop += d }, b0.y - y); await sleep(350)
    const b1 = await ballAt(page, 'ACG-09')
    await page.touchscreen.tap(b1.x, b1.y); await sleep(600)
    const g = await trkGeo(page)
    band.push({ ballY: b1.y, popT: g.pop && g.pop.t, popB: g.pop && g.pop.b, overTabs: !!(g.pop && g.pop.t < g.tabs.b), overBall: !!(g.pop && g.pop.t < b1.b && g.pop.b > b1.t) })
    if (g.pop) { await page.locator('#pop button', { hasText: /Close/ }).first().tap().catch(() => {}); await sleep(400) }
  }
  M.band = band; console.log('band', JSON.stringify(band))
  // DRAWN A: the chart slides the event up to just under the tabs; the pop-up, placed by its own rule, opens whole below it
  {
    const tabs = await R(page, '#viewtabs')
    const b0 = await ballAt(page, 'ACG-09')
    const target = tabs.b + 37
    await page.evaluate(d => { const bd = document.getElementById('board'); bd.scrollTop += d }, b0.y - target); await sleep(500)
    const b1 = await ballAt(page, 'ACG-09')
    await page.touchscreen.tap(b1.x, b1.y); await sleep(900)
    const g = await trkGeo(page); M.drawnA = { ball: b1, pop: g.pop, tabs: g.tabs }
    if (!g.pop || g.pop.t < g.tabs.b) throw new Error('drawn A: the pop-up still over the tabs ' + JSON.stringify(g.pop))
    await settle(page); await noHover(page)
    await ring(page, ['#pop'], 'Drawn: the chart slides the event up under the tabs, and the pop-up opens whole below it', { css: LEFT_TAG(120, 150), vis: true })
    await strip(page, 'q-trkpop-ph-A-drawn', 0, Math.max(g.pop.b, b1.b) + 26, vp)
    await unring(page)
    await page.locator('#pop button', { hasText: /Close/ }).first().tap().catch(() => {}); await sleep(400)
  }
  // DRAWN B: nothing moves; the pop-up held just under the tabs, as tall as the room above the event, its foot scrolling
  {
    const b0 = await ballAt(page, 'ACG-09')
    await page.evaluate(d => { const bd = document.getElementById('board'); bd.scrollTop += d }, b0.y - M.ballThen.y); await sleep(500)
    const b1 = await ballAt(page, 'ACG-09')
    await page.touchscreen.tap(b1.x, b1.y); await sleep(900)
    const g0 = await trkGeo(page)
    const top = g0.tabs.b + 4, maxH = b1.t - 8 - top
    await page.evaluate(([top, maxH]) => {
      const p = document.getElementById('pop'); p.style.top = top + 'px'; p.style.maxHeight = 'none'; p.style.overflowY = 'visible'
      const pad = parseFloat(getComputedStyle(p).paddingTop) + parseFloat(getComputedStyle(p).paddingBottom) + 2
      const w = document.createElement('div'); w.style.maxHeight = (maxH - pad) + 'px'; w.style.overflowY = 'auto'
      while (p.firstChild) w.appendChild(p.firstChild); p.appendChild(w)
    }, [top, maxH])
    await sleep(300)
    const g = await trkGeo(page); M.drawnB = { ball: b1, pop: g.pop, maxH, popFull: g0.pop && g0.pop.h }
    await settle(page); await noHover(page)
    await ring(page, ['#pop'], 'Drawn: nothing moves; the pop-up is held under the tabs and its lower part scrolls inside it', { css: LEFT_TAG(60, 150) })
    await strip(page, 'q-trkpop-ph-B-drawn', 0, Math.max(g.pop.b, b1.b) + 26, vp)
    await unring(page)
  }
  await ctx.close()
  // the desktop, for comparison: the same event found and tapped
  {
    const { ctx, page } = await world(PC, false)
    await trkOpen(page)
    await findType(page, 'ACG-09'); await page.keyboard.press('Escape').catch(() => {}); await sleep(200)
    await findType(page, 'ACG-09')
    const rows = await page.locator('#hSearchList .findrow').count()
    if (rows) { await page.locator('#hSearchList .findrow').first().click(); await sleep(1400) }
    const b = await ballAt(page, 'ACG-09')
    await page.mouse.click(b.x, b.y); await sleep(800)
    const g = await trkGeo(page); M.desktop = { ball: b, pop: g.pop, header: g.header, tabs: g.tabs, coversBar: !!(g.pop && g.pop.t < g.header.b) }
    console.log('trkpop desktop', JSON.stringify(M.desktop))
    if (M.desktop.coversBar) {
      await settle(page); await page.mouse.move(1500, 850)
      await ring(page, ['#pop'], 'On a desktop too: it covers the top bar and the Tracker bar', { css: LEFT_TAG(250, 200), vis: true })
      await strip(page, 'q-trkpop-pc-today', 0, Math.max(g.pop.b, b.b) + 24, PC, g.pop.l - 300, g.pop.r - g.pop.l + 560)
      await unring(page)
    }
    await ctx.close()
  }
}

async function trkfind() {
  const vp = PHONE
  const { ctx, page } = await world(vp, true)
  await trkOpen(page)
  const M = measured.trkfind = {}
  await press(page, '#hSearchBtn', true); await sleep(500)
  M.open = await trkGeo(page)
  if (!M.open.find) throw new Error('Find did not open')
  M.coversTabs = M.open.find.t < M.open.tabs.b && M.open.find.b > M.open.tabs.t
  M.fontSize = await page.evaluate(() => getComputedStyle(document.getElementById('hSearch')).fontSize)
  console.log('find open', JSON.stringify(M.open))
  await ring(page, ['#hSearchPanel'], 'Find sits over the Flow chart, Info and Show All tabs')
  await strip(page, 'q-trkfind-ph-open', 0, 250, vp)
  await unring(page)
  // a pick from the list puts the strip away by itself (measured: the pick removes the list before the tap-outside
  // check runs, so the strip closes); typing and the keyboard's Search key (Enter) keep it up
  await findType(page, 'ACG-09')
  await page.locator('#hSearchList .findrow').first().tap(); await sleep(1200)
  M.afterPick = await trkGeo(page)
  await press(page, '#hSearchBtn', true); await sleep(400)
  await findType(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1200)
  M.afterEnter = await trkGeo(page); M.afterEnterBall = await ballAt(page, 'ACG-09')
  M.stat = await page.evaluate(() => document.getElementById('hSearchStat').textContent)
  console.log('find after pick', JSON.stringify(M.afterPick), 'after enter', JSON.stringify(M.afterEnter), M.stat)
  if (!M.afterEnter.find) throw new Error('premise: the strip went away after Enter')
  // ✕: the box empties, the found ring goes, the strip stays, the keyboard comes back (the box takes focus again)
  await press(page, '#hSearchClear', true); await sleep(500)
  M.afterX = await trkGeo(page); M.afterXBall = await ballAt(page, 'ACG-09')
  console.log('find after x', JSON.stringify(M.afterX), JSON.stringify(M.afterXBall))
  if (!M.afterX.find) throw new Error('premise: the strip went away after ✕')
  await ring(page, ['#hSearchClear'], '✕ only empties the box. Find stays over the tabs, and the keyboard comes back up', { tagSel: '#hSearchPanel', css: 'white-space:normal!important;width:340px!important' })
  await strip(page, 'q-trkfind-ph-after-x', 0, 250, vp)
  await unring(page)
  // DRAWN A: one ✕ puts Find away — the state Escape gives in the box today (emptied, the strip gone, the keyboard down)
  await findType(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1000)
  await page.keyboard.press('Escape'); await sleep(600)
  M.drawnA = await trkGeo(page)
  if (M.drawnA.find) throw new Error('drawn A: the strip is still open')
  await settle(page)
  await ring(page, ['#viewtabs'], 'Drawn: one ✕ puts Find away, and the tabs are back')
  await strip(page, 'q-trkfind-ph-A-drawn', 0, 250, vp)
  await unring(page)
  // DRAWN C: the strip opens under the tabs (its top at the tabs' foot + 4), the ✕ as today
  await press(page, '#hSearchBtn', true); await sleep(500)
  const tabs = await R(page, '#viewtabs')
  await page.evaluate(top => { document.getElementById('hSearchPanel').style.top = top + 'px' }, tabs.b + 4); await sleep(200)
  M.drawnC = await trkGeo(page)
  await ring(page, ['#hSearchPanel'], 'Drawn: Find opens under the tabs, over the top of the chart')
  await strip(page, 'q-trkfind-ph-C-drawn', 0, 290, vp)
  await unring(page)
  await ctx.close()
}

/* ================= round 5 (a): the 👁 of a look at an issued version ================= */
async function r5a(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const M = measured['r5a-' + tag] = {}
  await board(page, 0); await sleep(500)
  M.publish = await publish(page, 0)
  await closeBoard(page); await sleep(500)
  if (await page.locator('#schedBoard').count()) { await closeBoard(page); await sleep(500) }
  await go(page, 'editsched'); await sleep(700)
  await press(page, '#eWeek [data-planmenu="0"]', touch); await sleep(400)
  await press(page, '[data-planpv]', touch); await sleep(800)
  M.week = await marksOf(page, '\u{1F441}')
  console.log('r5a', tag, 'week', JSON.stringify(M.week))
  if (!M.week.length) throw new Error('premise: no 👁 on the week')
  const fr = '#eWeek .planselbtn.pv, #eWeek .dprev-bar'
  await settle(page)
  M.weekColoured = await colourEye(page, fr)
  /* the tag hangs under the selector, on the day's signatures: under the bar it covered the issue count, and above the
     selector the day's name (the design read, 8 Nov 26) */
  const UP = { tagSel: '#eWeek .planselbtn.pv', open: true }
  await ring(page, ['#eWeek .planselbtn.pv', '#eWeek .dprev-bar'], 'Typed 👁: a colour emoji (your iPhone draws its own)', UP)
  await around(page, `q-r5a-${tag}-week`, fr, vp, { pad: 14, padX: 14 })
  await unring(page)
  await plainEye(page)
  await mustSwap(page, '#eWeek .planselbtn.pv .psl', '\u{1F441}', svg(ICON.eye, 11, 'vertical-align:-1.5px'))
  await mustSwap(page, '#eWeek .dprev-bar', '\u{1F441}', svg(ICON.eye, 12, 'vertical-align:-2px'))
  await ring(page, ['#eWeek .planselbtn.pv', '#eWeek .dprev-bar'], 'Drawn: the app’s own line eye', UP)
  await around(page, `q-r5a-${tag}-week-drawn`, fr, vp, { pad: 14, padX: 14 })
  await unring(page)
  // the board's own look at the version: back to the live copy first (a look at a version keeps the board's door on the
  // week shut), the board opened, then the board's own selector → the same Original
  await tryQ(`r5a ${tag} board`, async () => {
    await press(page, '#eWeek [data-golive="0"]', touch); await sleep(700)
    await board(page, 0); await sleep(700)
    await press(page, '#schedBoard [data-planmenu="0"]', touch); await sleep(400)
    await press(page, '[data-planpv]', touch); await sleep(900)
    const eyes = await marksOf(page, '\u{1F441}')
    M.board = eyes; console.log('r5a', tag, 'board', JSON.stringify(eyes))
    if (!eyes.length) throw new Error('no 👁 on the board')
    const bsel = ['#schedBoard .planselbtn.pv', '#schedBoard .dprev-bar']
    const have = []
    for (const s of bsel) if (await boxOf(page, s)) have.push(s)
    await settle(page)
    for (const s of have) await colourEye(page, s)
    /* on a desktop the board's selector (top left) and its bar (the side panel, right) are a screen apart: one picture each */
    const shots = tag === 'pc' ? have.map(s => [s, s.includes('planselbtn') ? '-sel' : '-bar']) : [[have.join(', '), '']]
    /* where each tag hangs: above the selector (on the day's signatures); on the desktop's side panel, whose top clips,
       under the issue bar beneath the look's bar, so the issue count stays readable (the design read, 8 Nov 26) */
    const below = 58
    const where = sfx => sfx === '-bar'
      ? [{ css: `top:calc(100% + ${below}px)!important;bottom:auto!important;white-space:normal!important;max-width:250px!important` }, { pad: 12, padX: 12, padB: below + 52 }]
      : [{ pos: 'up', open: true }, { pad: 12, padX: sfx === '-sel' ? 150 : 12, padT: 46 }]
    for (const [s, sfx] of shots) {
      const one = s.split(', '); const [t, c] = where(sfx)
      await ring(page, one, 'Typed 👁: a colour emoji (your iPhone draws its own)', { tagSel: one[0], ...t })
      await around(page, `q-r5a-${tag}-board${sfx}`, s, vp, c)
      await unring(page)
    }
    await plainEye(page)
    for (const s of have) await swapMark(page, s, '\u{1F441}', svg(ICON.eye, s.includes('planselbtn') ? 11 : 12, s.includes('planselbtn') ? 'vertical-align:-1.5px' : 'vertical-align:-2px'))
    for (const [s, sfx] of shots) {
      const one = s.split(', '); const [t, c] = where(sfx)
      await ring(page, one, 'Drawn: the app’s own line eye', { tagSel: one[0], ...t })
      await around(page, `q-r5a-${tag}-board${sfx}-drawn`, s, vp, c)
      await unring(page)
    }
  })
  await ctx.close()
}

/* ================= round 5 (b): the Inputs calendar's ⤢ / ⤡ ================= */
async function r5b(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const M = measured['r5b-' + tag] = {}
  await go(page, 'inputs'); await sleep(900)
  const B = '[data-testid=ib-expand]'
  if (!(await boxOf(page, B))) throw new Error('premise: no ⤢ on the Inputs calendar')
  M.btn = await R(page, B)
  M.label = await page.evaluate(B => { const b = document.querySelector(B); return { txt: b.textContent, aria: b.getAttribute('aria-label'), title: b.title, pressed: b.getAttribute('aria-pressed'), fs: getComputedStyle(b).fontSize, col: getComputedStyle(b).color } }, B)
  // the row's other marks, for lesson 92
  M.row = await page.evaluate(B => { const b = document.querySelector(B); const row = b.closest('.ib-sub') || b.parentElement; return [...row.querySelectorAll('button, summary, .abtn')].filter(e => e.getBoundingClientRect().width).map(e => ({ t: e.textContent.trim().slice(0, 40), svg: !!e.querySelector('svg'), aria: e.getAttribute('aria-label') })) }, B)
  console.log('r5b', tag, JSON.stringify(M))
  const frame = async name => {
    const b = await boxOf(page, B)
    const w = tag === 'pc' ? 560 : vp.width
    await strip(page, name, b.y - 14, b.b - b.y + 46, vp, b.r - w + 14, w)
  }
  await settle(page)
  await ring(page, [B], 'Typed ⤢: "Show every input"', { rt: true })
  await frame(`q-r5b-${tag}-compact`)
  await unring(page)
  await press(page, B, touch); await sleep(600)
  M.pressed = await page.evaluate(B => document.querySelector(B).textContent, B)
  await settle(page)
  await ring(page, [B], 'Typed ⤡: "Show the month compact"', { rt: true })
  await frame(`q-r5b-${tag}-every`)
  await unring(page)
  // drawn, in the same two states: the arrows in from the corners while every input shows …
  await mustSwap(page, B, '⤡', svg(ICON.compact, 16, 'vertical-align:middle'))
  await ring(page, [B], 'Drawn: arrows in, "Show the month compact"', { rt: true })
  await frame(`q-r5b-${tag}-every-drawn`)
  await unring(page)
  // … and out to the corners while the month is compact (the page opened afresh, so the button is the app's own again)
  await go(page, 'editsched'); await go(page, 'inputs'); await sleep(800)
  const now = await page.evaluate(B => document.querySelector(B).textContent, B)
  if (now.includes('⤡')) { await press(page, B, touch); await sleep(600) }
  await mustSwap(page, B, '⤢', svg(ICON.expand, 16, 'vertical-align:middle'))
  await settle(page)
  await ring(page, [B], 'Drawn: arrows out, "Show every input"', { rt: true })
  await frame(`q-r5b-${tag}-compact-drawn`)
  await unring(page)
  await ctx.close()
}

/* ================= round 5 (c): the Tracker Reorder window's ↺ Restore ================= */
async function r5c(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const M = measured['r5c-' + tag] = {}
  await trkOpen(page)
  await page.selectOption('#sylSel', { label: 'Tx 2026' }); await sleep(900)
  await press(page, '#sylMenuBtn', touch); await sleep(300)
  await pressText(page, '.menupanel button', /Delete syllabus/, touch); await sleep(500)
  await press(page, '#dlgOk', touch); await sleep(900)
  await press(page, '#sylMenuBtn', touch); await sleep(300)
  await pressText(page, '.menupanel button', /Reorder syllabi/, touch); await sleep(700)
  const RB = '#ordHidden .ordrow button'
  if (!(await boxOf(page, RB))) throw new Error('premise: no Restore in the Reorder window')
  M.window = await page.evaluate(() => [...document.querySelectorAll('#ordModal button, #ordModal .grip')].filter(e => e.getBoundingClientRect().width).map(e => e.textContent.trim()))
  M.restore = await page.evaluate(RB => { const b = document.querySelector(RB); return { txt: b.textContent, fs: getComputedStyle(b).fontSize, col: getComputedStyle(b).color } }, RB)
  console.log('r5c', tag, JSON.stringify(M))
  await settle(page)
  /* the list of deleted ones scrolls inside itself, so the tag sits in the row, to the button's left (over "deleted") */
  const IN_ROW = 'left:auto!important;right:calc(100% + 8px)!important;top:2px!important;bottom:auto!important'
  await ring(page, [RB], 'Typed ↺', { css: IN_ROW })
  await around(page, `q-r5c-${tag}-restore`, '#ordModal', vp, { pad: 8 })
  await unring(page)
  await mustSwap(page, RB, '↺', svg(ICON.reset, 15, 'vertical-align:-3px;margin-right:1px'))
  await ring(page, [RB], 'Drawn: the Reset arrow', { css: IN_ROW })
  await around(page, `q-r5c-${tag}-restore-drawn`, '#ordModal', vp, { pad: 8 })
  await unring(page)
  // the Tracker's own Reset layout beside it, for one look (it wears the same drawn arrow since round 4)
  await ctx.close()
}

/* ================= round 5 (d): the warning lines' ✕ / ↺ ================= */
/* two marks from one page side by side, each cut from it at its own size at 2× (the same scale), each named under it */
async function sideBySide(page, name, parts, title) {
  const shots = []
  for (const [sel, label] of parts) {
    /* a part is a selector cut from the page now, or a cut taken earlier: History's button is cut before the hide, while
       the page still stands as its own picture shows it (cut after the hide, the phone's top bar came out shifted) */
    let buf = sel
    if (typeof sel === 'string') {
      const r = await R(page, sel); if (!r) throw new Error('side by side: nothing at ' + sel)
      buf = await page.screenshot({ clip: { x: r.l, y: r.t, width: r.w, height: r.h } })
    }
    shots.push({ b64: buf.toString('base64'), w: buf.readUInt32BE(16) / 2, label })
  }
  const ctx2 = await browser.newContext({ viewport: { width: 402, height: 400 }, deviceScaleFactor: 2 })
  const p2 = await ctx2.newPage()
  const fig = x => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:9px"><img src="data:image/png;base64,${x.b64}" style="width:${x.w}px;display:block"><figcaption>${x.label}</figcaption></figure>`
  await p2.setContent(`<body style="margin:0;background:#0b0f14"><div id="sbs" style="display:inline-flex;flex-direction:column;gap:14px;padding:14px 18px 16px;font:700 12.5px/1.3 -apple-system,'Segoe UI',system-ui,sans-serif;color:#ffb020">`
    + `<div style="align-self:flex-start;border:1px solid #ffb020;border-radius:6px;padding:3px 7px">${title}</div>`
    + `<div style="display:flex;gap:36px;align-items:flex-end;justify-content:center">${shots.map(fig).join('')}</div></div></body>`)
  await sleep(200)
  await p2.locator('#sbs').screenshot({ path: `${OUT}/${name}.png` }); made.push(name)
  await ctx2.close()
}
async function r5d(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const M = measured['r5d-' + tag] = {}
  /* History's button wherever it stands on the page — its clock and arrow (ui/icons.tsx HistIcon), never a warning's own */
  const HIST = 'button:not(.wln-mute):not(.witem-mute):has(svg path[d^="M3 3v5h5"])'
  /* the passing note after a hide ("Warning hidden: …") is the app's #toastEl, hidden for every picture by RING_CSS */
  // the Scheduler Board's warning list
  await tryQ(`r5d ${tag} board`, async () => {
    await board(page, 0); await sleep(700)
    if (!(await boxOf(page, '#sbWarn .wln-mute'))) {
      const head = page.locator('#sbWarn .sbw-car').first()
      if (await head.count()) { if (touch) await head.tap(); else await head.click(); await sleep(500) }
    }
    if (!(await boxOf(page, '#sbWarn .wln-mute'))) throw new Error('premise: no ✕ on the board’s warning lines')
    M.boardLines = await page.evaluate(() => document.querySelectorAll('#sbWarn .wln').length)
    M.boardHistory = await R(page, HIST)
    // History on the same board, for lesson 92 (on a desktop it stands on the board's bar, in the list's own picture)
    if (tag === 'ph') {
      if (!M.boardHistory) {
        const more = page.locator('#schedBoard button', { hasText: '⋯' }).filter({ visible: true }).first()
        if (await more.count()) { await more.tap(); await sleep(500); M.boardHistory = await R(page, HIST); M.historyInMenu = !!M.boardHistory }
      }
      if (M.boardHistory) {
        await settle(page)
        await ring(page, [HIST], 'History, on the same board', { css: 'left:auto!important;right:calc(100% + 8px)!important;top:4px!important;bottom:auto!important' })
        await around(page, `q-r5d-${tag}-board-history`, HIST, vp, { pad: 10, padX: 90, padB: 36 })
        await unring(page)
        /* the History button on top: Edit Schedule's own, covered by the board, also matches and stands a little apart */
        const h = await page.evaluate(sel => {
          const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) })
          if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }
        }, HIST)
        M.boardHistoryTop = h && { l: Math.round(h.l), t: Math.round(h.t), w: Math.round(h.w) }
        if (h) M.histCut = await page.screenshot({ clip: { x: h.l, y: h.t, width: h.w, height: h.h } })
      }
      if (M.historyInMenu) { await page.keyboard.press('Escape').catch(() => {}); await sleep(400) }
    }
    // hide the first warning: its line stays struck, its ✕ becomes ↺
    await press(page, '#sbWarn .wln-mute', touch); await sleep(700)
    M.boardMute = await page.evaluate(() => [...document.querySelectorAll('#sbWarn .wln-mute')].filter(e => e.getBoundingClientRect().width).slice(0, 3).map(e => ({ t: e.textContent, fs: getComputedStyle(e).fontSize, w: Math.round(e.getBoundingClientRect().width), col: getComputedStyle(e).color, op: getComputedStyle(e).opacity })))
    console.log('r5d', tag, 'board', JSON.stringify(M.boardMute), 'history', JSON.stringify(M.boardHistory))
    const w = await boxOf(page, '#sbWarn')
    /* where each tag hangs: on a line of the list's head it covered the issue count (the design read, 8 Nov 26). On a phone,
       above the list's box at its right, the room above cut wide enough for two lines; on a desktop the top bar's History
       (ringed there) stands above the box, so the tag lies at the left of the list's fifth and sixth lines, clear of
       their ✕ */
    const top = tag === 'pc' ? 0 : w.y - 58, h = tag === 'pc' ? w.y + 300 : 318
    const fifth = tag === 'pc' ? await page.evaluate(() => { const b = document.querySelector('#sbWarn').getBoundingClientRect(); const l = [...document.querySelectorAll('#sbWarn .wln')].filter(e => e.getBoundingClientRect().height)[4]; return l ? Math.round(l.getBoundingClientRect().top - b.top) : 190 }) : 0
    const TAG = tag === 'pc'
      ? { tagSel: '#sbWarn', open: true, css: `top:${fifth}px!important;bottom:auto!important;left:20px!important;right:auto!important;white-space:normal!important;max-width:240px!important` }
      : { tagSel: '#sbWarn', pos: 'up', rt: true, open: true, css: 'white-space:normal!important;max-width:290px!important' }
    const shoot = async name => { if (tag === 'pc') await strip(page, name, top, h, vp, w.x - 40, w.r - w.x + 60); else await strip(page, name, top, h, vp) }
    await settle(page)
    await ring(page, ['#sbWarn .wln.hid .wln-mute', '#sbWarn .wln:not(.hid) .wln-mute'], 'Typed ↺ flags it again, ✕ hides it', TAG)
    if (tag === 'pc' && M.boardHistory) await ring(page, [HIST, '#sbWarn .wln.hid .wln-mute', '#sbWarn .wln:not(.hid) .wln-mute'])
    await shoot(`q-r5d-${tag}-board`)
    await unring(page)
    await mustSwap(page, '#sbWarn .wln.hid .wln-mute', '↺', svg(ICON.reset, 13, 'vertical-align:-2px'))
    await ring(page, ['#sbWarn .wln.hid .wln-mute'], 'Drawn: the hidden line’s arrow becomes the Reset arrow; ✕ stays', TAG)
    if (tag === 'pc' && M.boardHistory) await ring(page, [HIST, '#sbWarn .wln.hid .wln-mute'])
    await shoot(`q-r5d-${tag}-board-drawn`)
    await unring(page)
    /* lesson 92 at a glance: History's clock and the drawn arrow, each cut from this same page at the same scale */
    if (tag === 'ph' && M.histCut) await sideBySide(page, `q-r5d-${tag}-history-vs-reset`, [[M.histCut, 'History'], ['#sbWarn .wln.hid .wln-mute', 'Flag this again (drawn)']], 'History · Flag this again (drawn)')
    delete M.histCut
  })
  // Edit Schedule's warning list on the week (the board's hide shows here too — one set of hides)
  await tryQ(`r5d ${tag} week`, async () => {
    if (await page.locator('#schedBoard').count()) await closeBoard(page)
    await go(page, 'editsched'); await sleep(700)
    await press(page, '#eWeek [data-daywarn="0"]', touch); await sleep(600)
    if (!(await boxOf(page, '#eWeek .witem-mute'))) throw new Error('premise: no ✕ / ↺ on the week’s list')
    M.weekMute = await page.evaluate(() => [...document.querySelectorAll('#eWeek .witem-mute')].filter(e => e.getBoundingClientRect().width).slice(0, 3).map(e => ({ t: e.textContent, fs: getComputedStyle(e).fontSize, col: getComputedStyle(e).color })))
    M.weekHistory = await R(page, HIST)
    console.log('r5d', tag, 'week', JSON.stringify(M.weekMute), 'history', JSON.stringify(M.weekHistory))
    const hid = await boxOf(page, '#eWeek .witem.hid .witem-mute')
    const box = await boxOf(page, '#eWeek .dwbox[data-dwbox="0"]')
    const shoot = name => strip(page, name, box.y - 58, 318, vp, box.x - 10, box.r - box.x + 20)
    const TAG = { tagSel: '#eWeek .dwbox[data-dwbox="0"]', pos: 'up', rt: true, open: true, css: 'white-space:normal!important;max-width:290px!important' }
    await settle(page)
    await ring(page, ['#eWeek .witem-mute'], hid ? 'Typed ↺ flags it again, ✕ hides it' : 'Typed ✕ hides it', TAG)
    await shoot(`q-r5d-${tag}-week`)
    await unring(page)
    if (hid) {
      await mustSwap(page, '#eWeek .witem.hid .witem-mute', '↺', svg(ICON.reset, 13, 'vertical-align:-2px'))
      await ring(page, ['#eWeek .witem.hid .witem-mute'], 'Drawn: the hidden line’s arrow becomes the Reset arrow; ✕ stays', TAG)
      await shoot(`q-r5d-${tag}-week-drawn`)
      await unring(page)
    }
    // the top bar's Changes clock on the same page, for lesson 92
    if (M.weekHistory) {
      await settle(page)
      await ring(page, [HIST], 'History, on the same page', tag === 'ph' ? { css: 'left:auto!important;right:calc(100% + 8px)!important;top:4px!important;bottom:auto!important' } : { rt: true })
      await around(page, `q-r5d-${tag}-week-history`, HIST, vp, { pad: 10, padX: 150, padB: 36 })
      await unring(page)
    }
  })
  await ctx.close()
}

/* ================= round 5 (e): the phone day bar's Templates and OIL Earn ================= */
async function r5e() {
  // the desktop's two, as they stand (round 4): the mark, then the words
  {
    const { ctx, page } = await world(PC, false)
    await board(page, 5); await sleep(700)
    const M = measured['r5e-pc'] = await page.evaluate(() => [...document.querySelectorAll('#sbTpl, #sbOil')].filter(e => e.getBoundingClientRect().width).map(b => ({ id: b.id, txt: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), gap: getComputedStyle(b).gap, disp: getComputedStyle(b).display, svg: (b.querySelector('svg') || {}).getBoundingClientRect ? Math.round(b.querySelector('svg').getBoundingClientRect().width) : null, fs: getComputedStyle(b).fontSize })))
    console.log('r5e pc', JSON.stringify(M))
    await ring(page, ['#sbTpl', '#sbOil'], 'The desktop’s two wear their marks')
    await around(page, 'q-r5e-pc-desktop', '#sbTpl, #sbOil', PC, { pad: 12, padX: 40, padB: 36 })
    await unring(page)
    await ctx.close()
  }
  const vp = PHONE
  const { ctx, page } = await world(vp, true)
  const M = measured['r5e-ph'] = {}
  await board(page, 5); await sleep(800)
  const BAR = '#schedBoard .daybar'
  if (!(await boxOf(page, BAR))) throw new Error('premise: no day bar on the phone board')
  const measure = () => page.evaluate(() => {
    const bar = document.querySelector('#schedBoard .daybar'); const ph = bar.querySelector('.sb-ph'); const g = bar.querySelector('.gctl')
    const btns = [...g.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), l: Math.round(r.left), r: Math.round(r.right), sw: b.scrollWidth, cw: b.clientWidth } })
    const pr = ph.getBoundingClientRect(), br = bar.getBoundingClientRect()
    return { bar: { w: Math.round(br.width), h: Math.round(br.height), l: Math.round(br.left), r: Math.round(br.right) }, row: { w: Math.round(pr.width), h: Math.round(pr.height), sw: ph.scrollWidth, cw: ph.clientWidth }, head: (() => { const h = ph.querySelector('.daybar-h'); const r = h.getBoundingClientRect(); return { t: h.textContent, w: Math.round(r.width), r: Math.round(r.right) } })(), btns, oneLine: new Set(btns.map(b => b.top)).size === 1 && btns.every(b => b.h < 30), room: Math.round(pr.right - Math.max(...btns.map(b => b.r))) }
  })
  M.today = await measure()
  console.log('r5e ph today', JSON.stringify(M.today))
  await settle(page)
  // the day bar clips its own overflow: opened for the pictures only, so the tag can stand above it
  await page.evaluate(() => { document.querySelector('#schedBoard .daybar').style.overflow = 'visible' })
  await ring(page, [BAR + ' .gctl'], 'Words alone here, while the desktop’s two wear marks', { pos: 'up', rt: true, tagSel: BAR })
  await around(page, 'q-r5e-ph-today', BAR, vp, { pad: 10, padT: 34, wide: true })
  await unring(page)
  // DRAWN: the desktop's marks before the words, in the button's own colour, scaled to the phone's letters (the desktop:
  // a 14px mark beside 12px words; here 10.5px words, so a 12px mark), a 5px gap
  await page.evaluate(([tpl, ticket]) => {
    for (const b of document.querySelectorAll('#schedBoard .daybar .gctl button')) {
      const t = b.textContent.trim(); const inner = /^Templates/.test(t) ? tpl : /^OIL Earn/.test(t) ? ticket : null; if (!inner) continue
      b.style.display = 'inline-flex'; b.style.alignItems = 'center'; b.style.gap = '5px'
      b.insertAdjacentHTML('afterbegin', `<svg class="zz-ico" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">${inner}</svg>`)
    }
  }, [ICON.tpl, ICON.ticket])
  await sleep(200)
  M.drawn = await measure()
  console.log('r5e ph drawn', JSON.stringify(M.drawn))
  await settle(page)
  await ring(page, [BAR + ' .gctl'], M.drawn.oneLine ? 'Drawn: the same marks, still one row' : 'Drawn: the same marks, and the row breaks', { pos: 'up', rt: true, tagSel: BAR })
  await around(page, 'q-r5e-ph-drawn', BAR, vp, { pad: 10, padT: 34, wide: true })
  await unring(page)
  // an iPhone's letters, about a seventh wider than this browser's: the buttons' words at 12px for 10.5px
  await page.evaluate(() => { for (const b of document.querySelectorAll('#schedBoard .daybar .gctl button, #schedBoard .daybar .daybar-h')) b.style.fontSize = (parseFloat(getComputedStyle(b).fontSize) * 1.14).toFixed(2) + 'px' })
  await sleep(200)
  M.wider = await measure()
  console.log('r5e ph wider', JSON.stringify(M.wider))
  await settle(page)
  await ring(page, [BAR + ' .gctl'], M.wider.oneLine ? 'Drawn, iPhone-wide letters: still one row' : 'Drawn, iPhone-wide letters: the row breaks', { pos: 'up', rt: true, tagSel: BAR })
  await around(page, 'q-r5e-ph-drawn-wide', BAR, vp, { pad: 10, padT: 34, wide: true })
  await unring(page)
  await ctx.close()
}

if (want('trkpop')) await tryQ('trkpop', trkpop)
if (want('trkfind')) await tryQ('trkfind', trkfind)
if (want('r5a')) { await tryQ('r5a pc', () => r5a('pc', PC, false)); await tryQ('r5a ph', () => r5a('ph', PHONE, true)) }
if (want('r5b')) { await tryQ('r5b pc', () => r5b('pc', PC, false)); await tryQ('r5b ph', () => r5b('ph', PHONE, true)) }
if (want('r5c')) { await tryQ('r5c pc', () => r5c('pc', PC, false)); await tryQ('r5c ph', () => r5c('ph', PHONE, true)) }
if (want('r5d')) { await tryQ('r5d pc', () => r5d('pc', PC, false)); await tryQ('r5d ph', () => r5d('ph', PHONE, true)) }
if (want('r5e')) await tryQ('r5e', r5e)
writeFileSync(MEAS, JSON.stringify(measured, null, 1))
console.log('made', made.length, made.join(' '))
await browser.close()
