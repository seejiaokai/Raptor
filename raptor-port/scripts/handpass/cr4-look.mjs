/* [UI-CONSISTENCY-LOOK] round 4 (D1124, D1508, D1509) — the pictures put to him: each place ringed on the real app, and
   beside it the recommended look DRAWN on the running app (marks swapped or a style changed in the page, nothing saved).
   Desktop 1536 × 864 (his PC), phone 402 × 874 (his iPhone, touch); finding 15 at 1366 and 1300 wide. Every picture is
   real except the ones named "-new". Rings are outlines on the element itself (mockups-on-the-real-app.md, step 3).
     q1 (finding 10, D1509, D1508) the settings gears — the Leave War's drawn gear in cyan, the other five the typed ⚙ in
        white — and the OIL tracker's 📅; drawn: the one drawn gear, in the ordinary buttons' white, and Edit Schedule's
        line calendar
     q2 (finding 12) the four legends: Edit Schedule's fold, the Leave War's and the Tracker's Legend buttons, the Inputs
        and SANS calendars' key in the row — closed and open
     q3 (finding 15) the Inputs calendar's top row at 1366 (the gear alone on a second line) and 1300; drawn: the filters
        and the gear move as one group, and under 1440 wide the search box is 170 → its words still whole
     q4 (finding 17 and the sweep of 5 Nov 26) the typed marks on the Scheduler Board (⇅ Sort all, ▤ Templates, ◧ OIL Earn,
        ⇅ Auto sort, the phone menu's 📱 / 🖥) and the Leave War (⚙ Settings' ⇅ Rearrange the grid and ↺ Reset order, the
        grid's ⇅ Done); drawn: line icons — the Tracker's own reorder mark, the Leave War's OIL clock, and three new marks
        in the same line style (templates, reset, phone / desktop)
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr4-look.mjs → <folder>/
        CR4_ONLY=q1,q3 redoes only those questions' pictures. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go, board } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = process.env.CR4_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const made = [], measured = {}

/* ---- the marks drawn in, all in the app's line style (24-unit box, stroke 2, round ends — ui/icons.tsx) ---- */
const svg = (inner, size, grey = false) => `<svg class="zz-ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-0.15em;flex:0 0 auto${grey ? ';color:var(--ink-2)' : ''}">${inner}</svg>`
const ICON = {
  /* the Leave War's gear, copied from its top row (leavewar/ui/Chrome.tsx GearGlyph) */
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  /* Edit Schedule's calendar (ui/icons.tsx CalIcon) */
  cal: '<path d="M8 2v4M16 2v4M3 9.5h18"/><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>',
  /* the Tracker's reorder mark (tracker/components/Glyphs.jsx ReorderGlyph) */
  reorder: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  /* the Leave War's OIL tab mark (leavewar/ui/Chrome.tsx ClockGlyph) */
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  /* NEW, in the same style: templates (a page of blocks), reset (an arrow turning back), phone, desktop */
  tpl: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><rect x="3" y="14" width="9" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  desk: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  /* the Tracker's own (tracker/components/Glyphs.jsx): copy, delete, ✕, list */
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  /* NEW, in the same style, for the chart-layout tools: a hand (move), a dashed box (select), a line, a curve between two
     points (edit lines), two lines joining (merge), a line hopping another (unmerge), an arrow, an arrowhead, fit */
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  select: '<path d="M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1"/>',
  line: '<path d="M5 19 19 5"/>',
  editlines: '<circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M5 17A12 12 0 0 1 17 5"/>',
  merge: '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.2 2.9L4 22"/><path d="m20 22-5-5"/>',
  unmerge: '<path d="M3 15h5.5a3.5 3.5 0 0 1 7 0H21"/><path d="M12 4v7M12 18v3"/>',
  arrowr: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  head: '<path d="M5 19 19 5"/><path d="M10 5h9v9"/>',
  fit: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/>',
  /* after his D1700 (OIL Earn's clock is History's): an OIL mark of its own — a ticket, a day off held — for OIL Earn and
     the Leave War's OIL tab alike, so a clock means History only */
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  /* the fresh reader's look-alikes: Connect two points joined (not an arrow beside Arrow); Select all the dashed box
     with a tick (not Select's box again) */
  connect: '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 12h9"/>',
  selectall: '<path d="M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1"/><path d="m8 12 3 3 5-6"/>',
}

async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGE ERROR', e.message))
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '.toast,.snack,[role=status].toast{display:none!important} *{scroll-behavior:auto!important} .zz-ring{outline:3px solid #ffb020!important;outline-offset:3px!important;border-radius:7px}' })
  return { ctx, page }
}
const visAll = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length, sel)
async function ring(page, sels) {
  await page.evaluate(sels => {
    document.querySelectorAll('.zz-ring').forEach(e => e.classList.remove('zz-ring'))
    for (const sel of sels) {
      const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
      if (!els.length) throw new Error('ring: nothing at ' + sel)
      els.forEach(e => e.classList.add('zz-ring'))
    }
  }, sels)
}
const unring = page => page.evaluate(() => document.querySelectorAll('.zz-ring').forEach(e => e.classList.remove('zz-ring')))
const boxOf = (page, sel) => page.evaluate(sel => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sel)
async function strip(page, name, y, h, vp, x = 0, w = vp.width) {
  let X = Math.max(0, Math.round(x)); const Y = Math.max(0, Math.round(y))
  if (X + Math.round(w) > vp.width) X = Math.max(0, vp.width - Math.round(w))
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: X, y: Y, width: Math.min(Math.round(w), vp.width - X), height: Math.min(Math.round(h), vp.height - Y) } })
  made.push(name)
}
/* a picture of the region round the selectors, padded; `wide` makes it the full width of the screen */
async function around(page, name, sel, vp, { pad = 22, padX = null, wide = false, minW = 0 } = {}) {
  const b = await boxOf(page, sel); if (!b) throw new Error('around: nothing at ' + sel)
  let px = padX == null ? pad : padX
  if (minW && b.r - b.x + px * 2 < minW) px = (minW - (b.r - b.x)) / 2
  if (wide) return strip(page, name, b.y - pad, b.b - b.y + pad * 2, vp)
  await strip(page, name, b.y - pad, b.b - b.y + pad * 2, vp, b.x - px, b.r - b.x + px * 2)
}
const press = async (page, sel, touch) => { const l = page.locator(sel).filter({ visible: true }).first(); if (touch) await l.tap(); else await l.click(); await sleep(500) }
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.message.split('\n')[0]) } }
/* tap a neutral heading so no control keeps a touched or focused look (mockups-on-the-real-app.md, traps) */
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })

/* swap a typed mark for a drawn one: inside each visible match, the text node holding `sym` loses it and the svg stands
   in its place; a match whose whole text is the mark (a button holding only ⚙) is emptied first */
const swapMark = (page, sel, sym, inner, size, grey = false) => page.evaluate(([sel, sym, svgHtml]) => {
  let n = 0
  for (const e of document.querySelectorAll(sel)) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
    const hits = []; while (walker.nextNode()) if (walker.currentNode.nodeValue.includes(sym)) hits.push(walker.currentNode)
    for (const t of hits) {
      const [a, b] = t.nodeValue.split(sym)
      const tpl = document.createElement('template'); tpl.innerHTML = svgHtml
      const frag = document.createDocumentFragment()
      if (a) frag.appendChild(document.createTextNode(a))
      frag.appendChild(tpl.content.firstChild)
      if (b) frag.appendChild(document.createTextNode(b))
      t.replaceWith(frag); n++
    }
  }
  return n
}, [sel, sym, svg(inner, size, grey)])
const dropMark = (page, sel, sym) => page.evaluate(([sel, sym]) => {
  let n = 0
  for (const e of document.querySelectorAll(sel)) { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const hits = []; while (w.nextNode()) if (w.currentNode.nodeValue.includes(sym)) hits.push(w.currentNode); for (const t of hits) { t.nodeValue = t.nodeValue.replace(sym + ' ', '').replace(sym, ''); n++ } }
  return n
}, [sel, sym])
async function mustSwap(page, sel, sym, inner, size) {
  const n = await swapMark(page, sel, sym, inner, size)
  if (!n) throw new Error(`swap: no ${sym} in ${sel}`)
  return n
}
/* the one gear, drawn, in the ordinary buttons' white (the colour every other gear has today) */
async function gearize(page) {
  let n = 0
  for (const [sel, size] of [['#inGear', 18], ['.sc-gear', 18], ['.oil-gear', 16], ['#flexBtn', 16], ['.wm-mng', 14]]) n += await swapMark(page, sel, '⚙', ICON.gear, size)
  return n
}

/* ================= Q1 — the gears, and the OIL tracker's calendar ================= */
async function q1(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const pair = async (name, ringSel, frameSel, opts) => {
    await settle(page); await ring(page, [ringSel]); await around(page, `q1-${tag}-${name}`, frameSel, vp, opts)
    await unring(page); const n = await gearize(page); await page.evaluate(() => 0)
    await settle(page); await ring(page, [ringSel]); await around(page, `q1-${tag}-${name}-new`, frameSel, vp, opts); await unring(page)
    return n
  }
  // the Inputs and SANS calendars
  await tryQ(`q1 ${tag} inputs`, async () => {
    await go(page, 'inputs'); await sleep(600)
    await pair('inputs', '#inGear', '#inGear', { pad: 14, padX: tag === 'pc' ? 260 : 150 })
  })
  await tryQ(`q1 ${tag} sans`, async () => {
    await page.getByRole('tab', { name: /^SANS/ }).first().click(); await sleep(700)
    await pair('sans', '.sc-gear', '.sc-gear', { pad: 14, padX: tag === 'pc' ? 260 : 150 })
  })
  // the Tracker's flex settings
  await tryQ(`q1 ${tag} tracker`, async () => {
    await go(page, 'tracker'); await sleep(900)
    await pair('tracker', '#flexBtn', '#flexBtn', { pad: 14, padX: tag === 'pc' ? 200 : 120 })
  })
  // the Scheduler Board's flying-waves menu (+ Wave), framed whole
  await tryQ(`q1 ${tag} waves`, async () => {
    await board(page, 0); await sleep(500)
    await press(page, '#schedBoard [data-wvadd]', touch); await sleep(500)
    if (!(await visAll(page, '.wm-mng'))) throw new Error('the waves menu did not open')
    await page.evaluate(() => { const g = [...document.querySelectorAll('.wm-mng')].find(e => e.getBoundingClientRect().width); const h = g.closest('.wm-hpen'); (h || g).classList.add('zz-wvhead') })
    await pair('waves', '.wm-mng', '.zz-wvhead', { pad: 16, padX: 16 })
    await page.keyboard.press('Escape'); await sleep(300)
  })
  // the Leave War's own gear — the one D1509 keeps, unchanged
  await tryQ(`q1 ${tag} leavewar`, async () => {
    if (await page.locator('#schedBoard').count()) { await page.keyboard.press('Escape'); await sleep(300) }
    await go(page, 'leavewar'); await sleep(600)
    measured[`q1-${tag}-lwgear`] = await page.evaluate(() => { const g = document.querySelector('.lw-gear'); const r = g.getBoundingClientRect(); const v = g.querySelector('svg'); return { w: Math.round(r.width), h: Math.round(r.height), button: getComputedStyle(g).color, drawn: v && getComputedStyle(v).color } })
    await settle(page); await ring(page, ['.lw-gear']); await around(page, `q1-${tag}-lw`, '.lw-gear', vp, { pad: 14, padX: tag === 'pc' ? 260 : 150 }); await unring(page)
  })
  // the OIL tracker — its gear, and its RANGE button's 📅, each apart
  await tryQ(`q1 ${tag} oil`, async () => {
    await page.getByRole('tab', { name: /OIL/ }).first().click(); await sleep(800)
    await page.evaluate(() => { const c = [...document.querySelectorAll('.ci')].find(e => e.getBoundingClientRect().width); c.closest('button, .tchip, [role=button]').classList.add('zz-range') })
    for (const [nm, sel] of [['oilgear', '.oil-gear'], ['oilrange', '.zz-range']]) { await settle(page); await ring(page, [sel]); await around(page, `q1-${tag}-${nm}`, sel, vp, { pad: 14, padX: 60 }) }
    await unring(page)
    await gearize(page); await mustSwap(page, '.ci', '📅', ICON.cal, 15)
    for (const [nm, sel] of [['oilgear', '.oil-gear'], ['oilrange', '.zz-range']]) { await settle(page); await ring(page, [sel]); await around(page, `q1-${tag}-${nm}-new`, sel, vp, { pad: 14, padX: 60 }) }
    await unring(page)
    // Edit Schedule's own calendar button, the one the drawing copies, for the side-by-side
    await go(page, 'editsched'); await sleep(600)
    await settle(page); await ring(page, ['.wk-cal']); await around(page, `q1-${tag}-escal`, '.wk-cal', vp, { pad: 14, padX: 60 }); await unring(page)
  })
  await ctx.close()
}

/* ================= Q2 — the legends ================= */
async function q2(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  const pad = { pad: 12, padX: tag === 'pc' ? 30 : 12 }
  await tryQ(`q2 ${tag} schedule`, async () => {
    await go(page, 'editsched'); await sleep(600)
    await settle(page); await ring(page, ['#vEdit .legend-sum, .legend-sum']); await around(page, `q2-${tag}-sched`, '.legend-sum', vp, { pad: 16, wide: true })
    await unring(page); await press(page, '.legend-sum', touch); await sleep(400); await settle(page)
    const lb = await boxOf(page, '.legend-sum')
    await strip(page, `q2-${tag}-sched-open`, lb.y - 10, tag === 'pc' ? 300 : 520, vp)
    measured[`q2-${tag}-sched-open-h`] = await page.evaluate(() => { const s = [...document.querySelectorAll('.legend-sum')].find(e => e.getBoundingClientRect().height); const d = s && s.closest('details'); return d ? Math.round(d.getBoundingClientRect().height) : null })
  })
  await tryQ(`q2 ${tag} leavewar`, async () => {
    await go(page, 'leavewar'); await sleep(700)
    await settle(page); await ring(page, ['.legkey']); await around(page, `q2-${tag}-lw`, '.legkey', vp, { pad: 14, padX: tag === 'pc' ? 300 : 150 })
    await unring(page); await press(page, '.legkey', touch); await sleep(500); await settle(page)
    await page.screenshot({ path: `${OUT}/q2-${tag}-lw-open.png` }); made.push(`q2-${tag}-lw-open`)
    await page.keyboard.press('Escape'); await sleep(300)
  })
  await tryQ(`q2 ${tag} tracker`, async () => {
    await go(page, 'tracker'); await sleep(900)
    await settle(page); await ring(page, ['#legendBtn']); await around(page, `q2-${tag}-trk`, '#legendBtn', vp, { pad: 14, padX: tag === 'pc' ? 300 : 150 })
    await unring(page); await press(page, '#legendBtn', touch); await sleep(500); await settle(page)
    await page.screenshot({ path: `${OUT}/q2-${tag}-trk-open.png` }); made.push(`q2-${tag}-trk-open`)
    await page.keyboard.press('Escape'); await sleep(300)
  })
  await tryQ(`q2 ${tag} inputs`, async () => {
    await go(page, 'inputs'); await sleep(600)
    await settle(page); await ring(page, ['.ib-legend']); await around(page, `q2-${tag}-inputs`, '.ib-legend', vp, { pad: 14, padX: tag === 'pc' ? 300 : 150 })
    await page.getByRole('tab', { name: /^SANS/ }).first().click(); await sleep(700)
    await settle(page); await ring(page, ['.sc-legend']); await around(page, `q2-${tag}-sans`, '.sc-legend', vp, { pad: 14, padX: tag === 'pc' ? 200 : 40 })
    await unring(page)
  })
  await ctx.close()
}

/* ================= Q3 — the Inputs calendar's top row at a narrow desktop ================= */
const Q3_CSS = '@media (min-width:1340px) and (max-width:1439px){.inputs-top .inputs-filterfields label.inputs-search{flex-basis:170px}} .inputs-top .inputs-filterfields{margin-left:auto}'
async function q3() {
  for (const w of [1366, 1300, 1280]) {
    for (const drawn of [false, true]) {
      const vp = { width: w, height: 768 }
      const { ctx, page } = await world(vp, false)
      await go(page, 'inputs'); await sleep(600)
      if (drawn) {
        await page.addStyleTag({ content: Q3_CSS })
        // the filters and the gear as ONE group: the gear moved into the filters' own row, so the two wrap together
        await page.evaluate(() => { const g = document.querySelector('#inGear'), f = document.querySelector('.inputs-top .inputs-filterfields'); f.appendChild(g) })
        await sleep(300)
      }
      // first with no window open, so nothing covers the row (his question, 5 Nov 26: "2 what's the difference")
      await settle(page); await ring(page, ['#inGear']); await strip(page, `q3-${w}-closed${drawn ? '-new' : ''}`, 56, 220, vp)
      await strip(page, `q3-${w}-zoom${drawn ? '-new' : ''}`, 56, 150, vp, w - 560, 560); await unring(page)
      await page.getByText('Quill · OML').first().click(); await sleep(700); await settle(page)
      const m = await page.evaluate(() => {
        const q = s => document.querySelector(s)?.getBoundingClientRect()
        const g = q('#inGear'), t = q('.inputs-top'), s = q('#inFSearch'), c = q('.ic-grid, .icgrid, [data-testid=ic-grid]')
        return { gearTop: Math.round(g.top), gearLeft: Math.round(g.left), rowH: t && Math.round(t.height), searchW: Math.round(s.width) }
      })
      measured[`q3-${w}${drawn ? '-new' : ''}`] = m
      await ring(page, ['#inGear'])
      await strip(page, `q3-${w}${drawn ? '-new' : ''}`, 56, 200, vp)
      await ctx.close()
    }
  }
}

/* ================= Q4 — the typed marks on the Scheduler Board and the Leave War ================= */
async function q4(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  await tryQ(`q4 ${tag} board`, async () => {
    await board(page, 0); await sleep(600)
    if (tag === 'pc') {
      await page.evaluate(() => { for (const b of document.querySelectorAll('#schedBoard .abtn:has(.bi)')) if (/[⇅▤◧]/.test(b.querySelector('.bi').textContent) && b.getBoundingClientRect().width) b.classList.add('zz-typed') })
      const sel = '.zz-typed'
      measured['q4-pc-board-buttons'] = await page.evaluate(sel => [...document.querySelectorAll('#schedBoard .abtn:has(.bi)')].filter(e => e.getBoundingClientRect().width).map(e => e.textContent.trim()), sel)
      await settle(page); await ring(page, [sel]); await around(page, 'q4-pc-board', sel, vp, { pad: 12, padX: 40 })
      await unring(page)
      await swapMark(page, sel, '⇅', ICON.reorder, 14); await swapMark(page, sel, '▤', ICON.tpl, 14); await swapMark(page, sel, '◧', ICON.clock, 14)
      await settle(page); await ring(page, [sel]); await around(page, 'q4-pc-board-new', sel, vp, { pad: 12, padX: 40 }); await unring(page)
      // a section's own ⇅ Auto sort
      const ss = '#schedBoard [data-sortsec]'
      if (await visAll(page, ss)) {
        await page.locator(ss).filter({ visible: true }).first().scrollIntoViewIfNeeded(); await sleep(300)
        await page.evaluate(ss => { const e = [...document.querySelectorAll(ss)].find(x => x.getBoundingClientRect().width); e.classList.add('zz-one') }, ss)
        await settle(page); await ring(page, ['.zz-one']); await around(page, 'q4-pc-autosort', '.zz-one', vp, { pad: 14, padX: 160 })
        await unring(page); await mustSwap(page, '.zz-one', '⇅', ICON.reorder, 13)
        await settle(page); await ring(page, ['.zz-one']); await around(page, 'q4-pc-autosort-new', '.zz-one', vp, { pad: 14, padX: 160 }); await unring(page)
      } else console.log('q4: no Auto sort button in view')
      await board(page, 5); await sleep(700)
      if (await visAll(page, '#sbOil')) {
        await page.evaluate(() => { for (const b of document.querySelectorAll('#schedBoard .abtn:has(.bi)')) if (b.getBoundingClientRect().width && /Templates|OIL Earn|Sort all|History/.test(b.textContent)) b.classList.add('zz-bar') })
        const frame = { pad: 12, padX: 24 }
        await settle(page); await ring(page, ['#sbOil', '.zz-bar:has(.bl)']).catch(() => {}); await unring(page)
        await ring(page, ['#sbOil']); await around(page, 'q4-pc-oilbar', '.zz-bar', vp, frame); await unring(page)
        await swapMark(page, '.zz-bar', '⇅', ICON.reorder, 14); await swapMark(page, '.zz-bar', '▤', ICON.tpl, 14)
        await page.evaluate(() => { const b = document.querySelector('#sbOil .bi'); b.dataset.keep = b.innerHTML; b.style.display = 'none' })
        await settle(page); await ring(page, ['#sbOil']); await around(page, 'q4-pc-oilbar-a', '.zz-bar', vp, frame); await unring(page)
        await page.evaluate(() => { const b = document.querySelector('#sbOil .bi'); b.style.display = '' })
        await mustSwap(page, '#sbOil', '◧', ICON.ticket, 14)
        await settle(page); await ring(page, ['#sbOil']); await around(page, 'q4-pc-oilbar-b', '.zz-bar', vp, frame); await unring(page)
      } else console.log('q4: no OIL Earn on Saturday either')
    } else {
      // the phone's ⋯ menu: Sort all and the Phone / Desktop layout
      await press(page, '#schedBoard [aria-label^="More"]', touch); await sleep(400); await settle(page)
      await page.evaluate(() => { for (const b of document.querySelectorAll('.sb-moreitem')) if (/[⇅📱🖥]/u.test(b.textContent) && b.getBoundingClientRect().width) b.classList.add('zz-typed') })
      const sel = '.zz-typed'
      await ring(page, [sel]); await around(page, 'q4-ph-more', '.sb-moreitem', vp, { pad: 14, padX: 30 })
      await unring(page)
      await swapMark(page, sel, '⇅', ICON.reorder, 15); await swapMark(page, sel, '📱', ICON.phone, 15); await swapMark(page, sel, '🖥', ICON.desk, 15)
      await settle(page); await ring(page, [sel]); await around(page, 'q4-ph-more-new', '.sb-moreitem', vp, { pad: 14, padX: 30 }); await unring(page)
    }
  })
  await tryQ(`q4 ${tag} leavewar`, async () => {
    if (await page.locator('#schedBoard').count()) await page.keyboard.press('Escape')
    await go(page, 'leavewar'); await sleep(700)
    await press(page, '.lw-gear', touch); await sleep(600)
    const sel = '[data-testid=settings-rearrange], [data-testid=roster-reset-order]'
    await page.locator('[data-testid=settings-rearrange]').scrollIntoViewIfNeeded(); await sleep(300); await settle(page)
    await ring(page, [sel]); await around(page, `q4-${tag}-lwset`, sel, vp, { pad: 16, padX: 30 })
    await unring(page)
    await mustSwap(page, '[data-testid=settings-rearrange]', '⇅', ICON.reorder, 14); await mustSwap(page, '[data-testid=roster-reset-order]', '↺', ICON.reset, 14)
    await settle(page); await ring(page, [sel]); await around(page, `q4-${tag}-lwset-new`, sel, vp, { pad: 16, padX: 30 }); await unring(page)
    // the Leave War's OIL tab — today's plain clock, and the ticket of the OIL Earn drawing (B)
    await page.keyboard.press('Escape'); await sleep(300)
    await page.evaluate(() => { const t = [...document.querySelectorAll('[role=tab]')].find(e => /^OIL/.test(e.textContent.trim()) && e.getBoundingClientRect().width); t.classList.add('zz-oiltab'); t.closest('[role=tablist]').classList.add('zz-tabs') })
    await settle(page); await ring(page, ['.zz-oiltab']); await around(page, `q4-${tag}-lwoil`, '.zz-tabs', vp, { pad: 10, padX: 10 }); await unring(page)
    await page.evaluate(svgHtml => { const v = document.querySelector('.zz-oiltab svg'); const t = document.createElement('template'); t.innerHTML = svgHtml; const n = t.content.firstChild; n.setAttribute('class', v.getAttribute('class') || ''); v.replaceWith(n) }, svg(ICON.ticket, 16))
    await settle(page); await ring(page, ['.zz-oiltab']); await around(page, `q4-${tag}-lwoil-b`, '.zz-tabs', vp, { pad: 10, padX: 10 }); await unring(page)
    // into Rearrange: the grid's ⇅ Done
    await page.reload(); await login(page, 'a').catch(() => {}); await go(page, 'leavewar'); await sleep(700)
    await press(page, '.lw-gear', touch); await sleep(500)
    await press(page, '[data-testid=settings-rearrange]', touch); await sleep(700); await settle(page)
    const d = '[data-testid=roster-arrange]'
    await ring(page, [d]); await around(page, `q4-${tag}-lwdone`, d, vp, { pad: 14, padX: tag === 'pc' ? 220 : 120 })
    await unring(page); await mustSwap(page, d, '⇅', ICON.reorder, 14)
    await settle(page); await ring(page, [d]); await around(page, `q4-${tag}-lwdone-new`, d, vp, { pad: 14, padX: tag === 'pc' ? 220 : 120 }); await unring(page)
  })
  await ctx.close()
}

/* ================= Q5 — the Tracker's typed marks (finding 18): the lull's ⧉ Copy to… and ×, the chart-layout tools ===== */
const TRK = [['⧉', 'copy'], ['✋', 'hand'], ['▣', 'select'], ['→', 'arrowr'], ['🗑', 'trash'], ['╱', 'line'], ['❐', 'editlines'], ['✕', 'merge'], ['⌢', 'unmerge'], ['➤', 'head'], ['⤢', 'fit'], ['↺', 'reset'], ['📋', 'list']]
async function q5(tag, vp, touch) {
  const { ctx, page } = await world(vp, touch)
  await go(page, 'tracker'); await sleep(1000)
  await tryQ(`q5 ${tag} lull`, async () => {
    const sel = '#copyLullBtn'
    await page.locator(sel).scrollIntoViewIfNeeded(); await sleep(400)
    await page.evaluate(() => { const b = document.querySelector('#copyLullBtn'); b.closest('div').parentElement.classList.add('zz-lull') })
    await settle(page); await ring(page, [sel]); await around(page, `q5-${tag}-lull`, '.zz-lull', vp, { pad: 10, padX: 10 })
    await unring(page); await mustSwap(page, sel, '⧉', ICON.copy, 13); await swapMark(page, '.lullchip .x', '×', ICON.x, 12)
    await settle(page); await ring(page, [sel]); await around(page, `q5-${tag}-lull-new`, '.zz-lull', vp, { pad: 10, padX: 10 }); await unring(page)
  })
  await tryQ(`q5 ${tag} arrange`, async () => {
    await page.locator('#trkTop, body').first().evaluate(() => window.scrollTo(0, 0))
    await press(page, 'button[title^="Edit the syllabus"]', touch); await sleep(400)
    await press(page, '#arrangeBtn', touch); await sleep(900)
    if (tag === 'ph' && await visAll(page, '#foldTool')) { await press(page, '#foldTool', touch); await sleep(500) }
    const marks = await page.evaluate(() => [...document.querySelectorAll('.arrwrap button')].filter(b => b.getBoundingClientRect().width && /[✋▣→🗑╱❐✕⌢➤⤢↺📋]/u.test(b.textContent)).map(b => { b.classList.add('zz-tool'); return b.textContent.trim() }))
    measured[`q5-${tag}-tools`] = marks
    if (!marks.length) throw new Error('no chart-layout tools in view')
    await settle(page); await ring(page, ['.zz-tool']); await around(page, `q5-${tag}-tools`, '.arrwrap', vp, { pad: 8, wide: true })
    await unring(page)
    await page.evaluate(() => { for (const b of document.querySelectorAll('.zz-tool')) if (/Select all/.test(b.textContent)) b.classList.add('zz-selall') })
    await swapMark(page, '.zz-selall', '▣', ICON.selectall, 13)
    await dropMark(page, '.zz-tool', '✕'); await dropMark(page, '.zz-tool', '⌢')
    for (const [sym, k] of TRK) await swapMark(page, '.zz-tool', sym, ICON[k === 'arrowr' ? 'connect' : k], 13)
    await settle(page); await ring(page, ['.zz-tool']); await around(page, `q5-${tag}-tools-new`, '.arrwrap', vp, { pad: 8, wide: true }); await unring(page)
  })
  await ctx.close()
}

if (want('q1')) { await q1('pc', PC, false); await q1('ph', PHONE, true) }
if (want('q2')) { await q2('pc', PC, false); await q2('ph', PHONE, true) }
if (want('q3')) await q3()
if (want('q4')) { await q4('pc', PC, false); await q4('ph', PHONE, true) }
if (want('q5')) { await q5('pc', PC, false); await q5('ph', PHONE, true) }
writeFileSync(`${OUT}/cr4-measured.json`, JSON.stringify({ made, measured }, null, 1))
console.log('made', made.length, made.join(' '))
console.log(JSON.stringify(measured, null, 1))
await browser.close()
