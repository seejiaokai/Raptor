/* The pictures round (chat 3, the night of 7–8 Nov 26 — D1747), group "board": four of the backlog's small questions,
   each pictured on the real app today and each fix drawn ON the running app (DOM and style changes in the page,
   nothing saved — every world is a fresh browser context, thrown away at the end). Brief:
   docs/superpowers/briefs/2026-11-07-pictures-round-brief.md; method: .claude/skills/brainstorming/mockups-on-the-real-app.md.
     q1 [BOARD-SIDEWAYS-KEYS] a phone on its side (874 × 402, touch) with the keys up — the board's top against what is
        left; the keyboard stood in (a stand-in visual viewport 200px shorter, kbscroll.ts's own test method); drawn: the
        top folded to its one bar (the day strip and title gone), at rest scrolled and with the keys up
     q2 [BOARD-NARROW-DESKTOP-REMARKS] the desktop board at 821, 900, 1000 and 1100 wide — a jet's line and its remarks
        today; drawn: A the phone's own line from 821 to 1099 (times stacked, pucks and remarks on rows of their own),
        B the remarks and the line's buttons on a row of their own (the times kept in one line), C B with the times
        stacked; every option measured (line height, remarks width, whether the line's end is cut off) at each width
     q3 [OIL-EARN-DAY-SWITCH-WORDS] OIL Earn's "Nothing today earns" on Saturday 18 Jul, off and on, desktop and phone;
        drawn: A the app's own sliding switch (the Logic page's) labelled "No OIL this day", B a button worded as its
        action whose words turn ("Stop OIL for this day" / "Let this day earn again")
     q4 [OIL-INERT-TAP-SILENT] a puck that cannot earn: Saturday's SDO desk with its END box cleared through the board's
        own box (the app's "no OIL worked out — this row has no end time" case, D360); a tap today picks it in blue and
        says nothing; drawn: A the app's passing note says why, nothing picked; B the same words in the grey "Blocked:" note
   Rings are outlines on the element itself; each carries a tag (its own ::before) naming the point; drawn pictures
   say "Drawn:". Measurements go to pr-board-measured.json beside the pictures.
   Run from raptor-port/: HP_URL=http://localhost:4291 HP_SHOTS=docs/img/handpass/2026-11-07-pictures-round node scripts/handpass/pr-board.mjs
        PRB_ONLY=q1,q3 redoes only those questions' pictures. */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }, SIDE = { width: 874, height: 402 }
const ONLY = process.env.PRB_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const made = []
const MEASURED = `${OUT}/pr-board-measured.json`
const measured = existsSync(MEASURED) ? JSON.parse(readFileSync(MEASURED, 'utf8')) : {}

/* the marks: a ring on the element itself (an outline takes no room) and a tag naming the point in the element's own
   ::before — amber words on the app's dark. `data-zz-at` places the tag: top (default), bottom, right, inright, below */
const MARK_CSS = `
*{scroll-behavior:auto!important}
.zz-ring{outline:3px solid #ffb020!important;outline-offset:2px!important}
.zz-ring-in{outline:3px solid #ffb020!important;outline-offset:-3px!important}
[data-zz-tag]::before{content:attr(data-zz-tag);position:absolute;z-index:9999;left:0;top:-26px;background:#0E141B;color:#ffb020;
  border:1.5px solid #ffb020;font:700 12.5px/1.25 -apple-system,system-ui,Segoe UI,sans-serif;letter-spacing:0;text-transform:none;
  padding:2px 6px;border-radius:5px;white-space:nowrap;pointer-events:none;writing-mode:horizontal-tb;transform:none;text-align:left;
  width:auto;height:auto;margin:0;opacity:1;display:block}
[data-zz-at=bottom]::before{top:auto;bottom:-26px}
[data-zz-at=right]::before{left:auto;right:0}
[data-zz-at=rbottom]::before{left:auto;right:0;top:auto;bottom:-26px}
[data-zz-at=inright]::before{left:auto;right:4px;top:50%;transform:translateY(-50%)}
[data-zz-at=inleft]::before{left:4px;top:50%;transform:translateY(-50%)}
[data-zz-at=wrap]::before{white-space:normal;width:max-content;max-width:330px}
`
const HIDE_TOAST = '#toastEl{display:none!important}'

async function world(vp, touch, { stub = false, day = null, toasts = false } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  /* the stand-in keyboard (kbscroll.ts: Chromium cannot raise an iPhone's keys): a visual viewport the script can shorten */
  if (stub) await ctx.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
  })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => { errs.push(e.message); console.log('PAGE ERROR', e.message) })
  await page.goto(BASE + '/'); await login(page, 'a')
  if (stub) await page.evaluate(() => { const v = window.__vv; v.width = innerWidth; v.height = innerHeight })
  await page.addStyleTag({ content: MARK_CSS })
  if (!toasts) await page.addStyleTag({ content: HIDE_TOAST })
  if (day != null) await openBoard(page, day)
  return { ctx, page, errs, touch, vp }
}
async function openBoard(page, di) {
  await go(page, 'editsched')
  await page.evaluate(d => window.openScheduler(d), di)
  await page.waitForSelector('#schedBoard')
  await sleep(800)
}
const visEls = `els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })`
const unmark = page => page.evaluate(() => {
  document.querySelectorAll('.zz-ring,.zz-ring-in').forEach(e => e.classList.remove('zz-ring', 'zz-ring-in'))
  document.querySelectorAll('[data-zz-tag]').forEach(e => { e.removeAttribute('data-zz-tag'); e.removeAttribute('data-zz-at'); if (e.dataset.zzPos) { e.style.position = ''; delete e.dataset.zzPos } })
})
/* ring the n-th VISIBLE match of sel; tag it (a static box is made relative so the tag can hang from it) */
const mark = (page, sel, tag = '', { at = '', inside = false, n = 0, ring = true } = {}) => page.evaluate(([sel, tag, at, inside, n, ring]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const e = els[n]; if (!e) throw new Error('mark: nothing at ' + sel + ' #' + n)
  if (ring) e.classList.add(inside ? 'zz-ring-in' : 'zz-ring')
  if (tag) {
    if (getComputedStyle(e).position === 'static') { e.style.position = 'relative'; e.dataset.zzPos = '1' }
    e.setAttribute('data-zz-tag', tag); if (at) e.setAttribute('data-zz-at', at)
  }
  return true
}, [sel, tag, at, inside, n, ring])
const boxOf = (page, sel, n = null) => page.evaluate(([sel, n]) => {
  let els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (n != null) els = els[n] ? [els[n]] : []
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, [sel, n])
async function shot(page, name, vp, clip = null) {
  if (!clip) { await page.screenshot({ path: `${OUT}/${name}.png` }); made.push(name); return }
  let { x, y, w, h } = clip
  x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y))
  w = Math.min(Math.round(w), vp.width - x); h = Math.min(Math.round(h), vp.height - y)
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x, y, width: w, height: h } })
  made.push(name)
}
const settle = page => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
/* an element stood at y on the screen: its nearest scrolling panel scrolled (the board's list, or the page) */
const standAt = (page, sel, y) => page.evaluate(([sel, y]) => {
  const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0)
  let s = e.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  s = s || document.scrollingElement
  s.scrollTop += e.getBoundingClientRect().top - y
  return Math.round(e.getBoundingClientRect().top)
}, [sel, y])
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.message.split('\n')[0]) } }

/* ======================================================================================================== q1 */
async function q1() {
  const m = measured.q1 = {}
  /* the board's top at rest: each item of the bar's flex-wrap row and the line it sits on */
  const topItems = page => page.evaluate(() => {
    const top = document.querySelector('.sb-top'); const tr = top.getBoundingClientRect()
    /* the bar's flex items: its children, a display:contents wrapper (the day strip's .sb-nav) counted by its own children */
    const items = []; const walk = el => { for (const e of el.children) { if (getComputedStyle(e).display === 'contents') walk(e); else items.push(e) } }; walk(top)
    return { top: Math.round(tr.top), h: Math.round(tr.height), items: items.filter(e => e.getBoundingClientRect().height > 0).map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 40), id: e.id, t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), w: Math.round(r.width) } }) }
  })
  const listInfo = page => page.evaluate(() => {
    const top = document.querySelector('.sb-top').getBoundingClientRect()
    const vv = window.visualViewport
    const a = document.activeElement, ar = a && a.getBoundingClientRect()
    return { topBottom: Math.round(top.bottom), visBottom: Math.round(vv.offsetTop + vv.height), listShown: Math.round(vv.offsetTop + vv.height - top.bottom), box: a && a.tagName === 'INPUT' ? { t: Math.round(ar.top), b: Math.round(ar.bottom), fld: a.dataset.bfld || '' } : null }
  })
  /* the stand-in keys: the visible screen 200 shorter; a dark block where the keys would stand, named as a stand-in */
  const keysUp = async page => {
    await page.evaluate(k => { const v = window.__vv; v.height = innerHeight - k; v.dispatchEvent(new Event('resize')) }, 200)
    await sleep(900)
  }
  const keysBlock = (page, said) => page.evaluate(said => {
    const k = document.createElement('div'); k.id = 'zzKeys'
    k.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:200px;z-index:9998;background:#2a2f36;border-top:1px solid #4a5260;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;color:#ffb020;font:700 13px/1.3 -apple-system,system-ui,Segoe UI,sans-serif'
    const a = document.createElement('div'); a.textContent = said; a.style.fontSize = '15px'
    const b = document.createElement('div'); b.textContent = 'Stand-in for the keyboard, 200 px: a test browser cannot raise an iPhone’s keys'; b.style.cssText = 'font-weight:600;color:#c9b27a'
    k.append(a, b); document.body.appendChild(k)
  }, said)
  /* the one transform of the drawing: every item of the bar above its last line leaves the top (measured first, then
     hidden, so the reflow cannot carry a later item up into the cut) */
  const foldTop = lastT => {
    const items = []; const walk = el => { for (const e of el.children) { if (getComputedStyle(e).display === 'contents') walk(e); else items.push(e) } }
    walk(document.querySelector('.sb-top'))
    const hit = items.filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && Math.round(r.top) < lastT - 4 })
    /* the bar's line break (an empty item that only starts a new line) goes with them, or it leaves an empty line */
    const brk = [...document.querySelectorAll('.sb-top .sb-break')]
    ;[...hit, ...brk].forEach(e => { e.dataset.zzGone = '1'; e.style.display = 'none' })
    return hit.map(e => (String(e.className).slice(0, 30) || e.tagName) + (e.id ? '#' + e.id : ''))
  }
  /* the n-th time box of the list, scrolled to stand at y (the board's own list scrolls; the page is held), then tapped */
  const tapBoxAt = async (page, n, y) => {
    const box = page.locator('#schedBoard input.tm').filter({ visible: true }).nth(n)
    await box.evaluate((e, y) => { const s = e.closest('.sb-boardwrap'); s.scrollTop += e.getBoundingClientRect().top - y }, y); await sleep(400)
    const bb = await box.boundingBox()
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(500)
    return bb
  }
  const tapBox = async (page, n) => {
    const box = page.locator('#schedBoard input.tm').filter({ visible: true }).nth(n)
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(300)
    const bb = await box.boundingBox()
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(500)
    return bb
  }

  /* --- today, at rest --- */
  {
    const w = await world(SIDE, true, { stub: true, day: 0 })
    const { page } = w
    m.rest = await topItems(page)
    const t = m.rest
    await mark(page, '.sb-top', `The board’s top: ${t.h} px of the 402`, { at: 'bottom', inside: true })
    await page.evaluate(() => { const e = document.querySelector('.sb-top'); e.style.overflow = 'visible' })
    await settle(page)
    await shot(page, 'q-sideways-today-rest', SIDE)
    await w.ctx.close()
  }
  /* --- today, keys up: a take-off box brought to just above where the keys will stand first, so the picture is the
     same on his iPhone (a box already in sight: Safari pans nothing) and in the stand-in --- */
  {
    const w = await world(SIDE, true, { stub: true, day: 0 })
    const { page } = w
    await tapBoxAt(page, 3, 168)
    await keysUp(page)
    const li = await listInfo(page)
    m.keys = li
    await keysBlock(page, `Today: the top keeps ${li.topBottom} px; ${li.listShown} px left to see the list`)
    await mark(page, '.sb-top', '', { inside: true })
    await page.evaluate(() => document.activeElement && document.activeElement.classList.add('zz-ring'))
    await shot(page, 'q-sideways-today-keys', SIDE)
    await w.ctx.close()
  }
  /* --- drawn: the top folded to its one bar (the calendar, the title and the day strip gone), keys up --- */
  {
    const w = await world(SIDE, true, { stub: true, day: 0 })
    const { page } = w
    const before = await topItems(page)
    /* the transform: the items above the bar's last line leave the top (they scroll with the list, or fold away) */
    const lastRowTop = Math.max(...before.items.map(i => i.t))
    const gone = await page.evaluate(foldTop, lastRowTop)
    await sleep(300)
    m.fold = { hidden: gone, after: await topItems(page) }
    /* the same take-off box, at the same place on the screen as today's picture, so the gain shows above it */
    await tapBoxAt(page, 3, 168)
    await keysUp(page)
    const li = await listInfo(page)
    m.fold.keys = li
    await keysBlock(page, `Drawn: the top folded to its one bar, ${li.topBottom} px; ${li.listShown} px left to see the list`)
    await mark(page, '.sb-top', '', { inside: true })
    await page.evaluate(() => document.activeElement && document.activeElement.classList.add('zz-ring'))
    await shot(page, 'q-sideways-fold-keys', SIDE)
    await w.ctx.close()
  }
  /* --- drawn: B, keys down, the list scrolled — the title and day strip scrolled away with it, the bar staying --- */
  {
    const w = await world(SIDE, true, { stub: true, day: 0 })
    const { page } = w
    const before = await topItems(page)
    const lastRowTop = Math.max(...before.items.map(i => i.t))
    m.foldHidden = await page.evaluate(foldTop, lastRowTop)
    await page.evaluate(() => { const s = document.querySelector('.sb-boardwrap'); if (s) s.scrollTop = 120 })
    await sleep(300)
    const t = await topItems(page)
    m.foldScrolled = t
    await mark(page, '.sb-top', `Drawn: scrolled down, the day strip and title scroll away; the bar stays, ${t.h} px`, { at: 'bottom', inside: true })
    await page.evaluate(() => { const e = document.querySelector('.sb-top'); e.style.overflow = 'visible' })
    await settle(page)
    await shot(page, 'q-sideways-b-scrolled', SIDE)
    await w.ctx.close()
  }
}

if (want('q1')) await tryQ('q1', q1)

/* ======================================================================================================== q2 */
/* the narrow desktop board's range: 821 (one past the phone) to 1099 (the next band of rules starts at 1100) */
const RANGE = '(min-width:821px) and (max-width:1099px)'
const N = '.schedboard:not(.sb-wide)'
/* B: the remarks and the line's buttons take a row of their own under the line; the times stay in one line (D1029) */
const B_CSS = `@media ${RANGE}{
 ${N} .sb-lcols,${N} .sb-line{grid-template-columns:18px 56px 64px 48px 48px 48px 48px 1fr 1fr}
 ${N} .sb-line>.sb-grip{grid-row:1}
 ${N} .sb-line>.sb-rcell{grid-column:2 / 9;grid-row:2}
 ${N} .sb-line>.lctl{grid-column:9 / -1;grid-row:2;align-self:center}
 ${N} .sb-lcols>:nth-child(8),${N} .sb-lcols>:nth-child(9){display:none}
}`
/* C: B, with R over B and TO over LD as on a phone (the phone's own rules for the two stacked cells and their headings) */
const C_CSS = `@media ${RANGE}{
 ${N} .sb-lcols,${N} .sb-line{grid-template-columns:18px 56px 64px 48px 48px 1fr 1fr}
 ${N} .sb-line>.sb-rb,${N} .sb-line>.sb-tl{display:flex;flex-direction:column;justify-content:flex-end;gap:4px}
 ${N} .sb-lcols>.sb-hrb,${N} .sb-lcols>.sb-htl{display:block;line-height:1.25}
 ${N} .sb-lcols>.sb-hrb>span,${N} .sb-lcols>.sb-htl>span{display:block}
 ${N} .sb-line>.sb-grip{grid-row:1}
 ${N} .sb-line>.sb-rcell{grid-column:2 / 7;grid-row:2}
 ${N} .sb-line>.lctl{grid-column:7 / -1;grid-row:2;align-self:center}
 ${N} .sb-lcols>:nth-child(8),${N} .sb-lcols>:nth-child(9){display:none}
}`
/* A: the phone's own line, every phone rule that draws a jet's line or its headings, copied into the range (the copy
   keeps each rule's words; each selector is narrowed to the stacked board as the phone's own are) */
const applyA = page => page.evaluate(range => {
  let n = 0; const out = []
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules } catch { continue }
    for (const r of rules) { if (!(r instanceof CSSMediaRule) || r.conditionText.trim() !== '(width <= 820px)') continue
      for (const st of r.cssRules) { if (!(st instanceof CSSStyleRule)) continue
        const parts = st.selectorText.split(',').map(x => x.trim()).filter(x => /sb-line|sb-lcols/.test(x)).map(x => x.startsWith('.schedboard') ? x : '.schedboard:not(.sb-wide) ' + x)
        if (!parts.length) continue
        out.push(parts.join(',') + '{' + st.style.cssText + '}'); n++ } } }
  const el = document.createElement('style'); el.id = 'zzA'; el.textContent = `@media ${range}{${out.join('\n')}}`; document.head.appendChild(el)
  return n
}, RANGE)
const lineMeasure = page => page.evaluate(() => {
  const ls = [...document.querySelectorAll('#sbBoard .sb-line')].filter(e => e.getBoundingClientRect().height > 0)
  const l = ls[0]; const go = l.closest('.sb-go'); const gr = go.getBoundingClientRect()
  const n = l.querySelector('.nts'), nr = n.getBoundingClientRect()
  const lc = l.querySelector('.lctl').getBoundingClientRect()
  const slots = [...l.querySelectorAll('.sb-slot')].map(e => e.getBoundingClientRect())
  const far = Math.max(...[...l.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect().right))
  return {
    lineH: Math.round(l.getBoundingClientRect().height), lineW: Math.round(l.getBoundingClientRect().width),
    lineHs: ls.slice(0, 6).map(x => Math.round(x.getBoundingClientRect().height)),
    rmkW: Math.round(nr.width), rmkSeen: Math.round(Math.max(0, Math.min(nr.right, gr.right) - Math.max(nr.left, gr.left))),
    ctlInside: lc.right <= gr.right + 0.5, rcpInside: slots[1] ? slots[1].right <= gr.right + 0.5 : null,
    cutPx: Math.max(0, Math.round(far - gr.right)), sideL: Math.round((document.querySelector('.sb-side') || { getBoundingClientRect: () => ({ left: innerWidth }) }).getBoundingClientRect().left)
  }
})
const q2tag = (pre, x) => {
  const said = [`${pre}each jet's line ${x.lineH} px tall`]
  if (x.rmkSeen) said.push(`remarks ${x.rmkSeen} px wide`)
  const cut = []
  if (!x.rcpInside) cut.push('the back seat')
  if (!x.rmkSeen) cut.push('remarks')
  if (!x.ctlInside) cut.push('buttons')
  if (cut.length) said.push((cut.length > 1 ? cut.slice(0, -1).join(', ') + ' and ' + cut[cut.length - 1] : cut[0]) + ' cut off')
  let t = said.join('; ')
  /* a long tag would run past the wave's panel at 821 and be clipped by it: the shorter words, the same numbers */
  if (t.length > 72) t = t.replace("each jet's line", 'line').replace(' px wide', ' px').replace(/the back seat/, 'back seat')
  return t.charAt(0).toUpperCase() + t.slice(1)
}
async function q2() {
  const m = process.env.PRB_NOMEASURE ? measured.q2 : (measured.q2 = { today: {}, A: {}, B: {}, C: {} })
  const apply = async (page, opt) => {
    if (opt === 'A') return applyA(page)
    if (opt === 'B') await page.addStyleTag({ content: B_CSS })
    if (opt === 'C') await page.addStyleTag({ content: C_CSS })
  }
  /* the numbers, every option at every width (no pictures); 874 is a phone on its side */
  if (!process.env.PRB_NOMEASURE) for (const W of [821, 874, 900, 950, 1000, 1020, 1040, 1060, 1080, 1099, 1100]) {
    for (const opt of ['today', 'A', 'B', 'C']) {
      if (opt !== 'today' && W >= 1100) continue
      if (opt !== 'today' && ![821, 874, 900, 1000, 1099].includes(W)) continue
      const w = await world({ width: W, height: 900 }, false, { day: 0 })
      await apply(w.page, opt); await sleep(300)
      m[opt][W] = await lineMeasure(w.page)
      await w.ctx.close()
    }
  }
  /* the pictures: the first formation's headings and two lines, cut at the crew panel's edge */
  const pics = [['today', [821, 900, 1000, 1100]], ['A', [821, 1000]], ['B', [821, 1000]], ['C', [821, 1000]]]
  for (const [opt, widths] of pics) for (const W of widths) {
    const vp = { width: W, height: 900 }
    const w = await world(vp, false, { day: 0 })
    const { page } = w
    await apply(page, opt); await sleep(300)
    const l = page.locator('#sbBoard .sb-line').filter({ visible: true }).first()
    await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
    const x = await lineMeasure(page)
    const pre = opt === 'today' ? '' : `Drawn ${opt}: `
    await mark(page, '#sbBoard .sb-line', '', { inside: true })
    await mark(page, '#sbBoard .sb-lcols', q2tag(pre, x), { ring: false })
    if (x.rmkSeen) await mark(page, '#sbBoard .sb-line .nts', '', { inside: true })
    await settle(page)
    const hb = await boxOf(page, '#sbBoard .sb-lcols', 0)
    const l2 = await boxOf(page, '#sbBoard .sb-line', 1)
    await shot(page, `q-narrow-${opt === 'today' ? 'today' : opt.toLowerCase()}-${W}`, vp, { x: 0, y: hb.y - 44, w: x.sideL, h: l2.b - hb.y + 56 })
    await w.ctx.close()
  }
}
if (want('q2')) await tryQ('q2', q2)

/* ======================================================================================================== q3 */
/* OIL Earn on for the open day: the board's own OIL Earn button, else the day bar's */
async function oilOn(w) {
  const { page, touch } = w
  const sel = (await boxOf(page, '#sbOil')) ? '#sbOil' : '#schedBoard [data-oilmode]'
  const l = page.locator(sel).filter({ visible: true }).first()
  if (touch) await l.tap(); else await l.click()
  await sleep(700)
  if (!(await page.evaluate(() => !!document.querySelector('#schedBoard .daybar.oilon')))) throw new Error('OIL Earn did not come on')
}
const SAT = 5
/* the one transform of each option, on the bar's "Nothing today earns" button (data-oilblank) */
const drawSwitch = (page, on) => page.evaluate(on => {
  const b = document.querySelector('#schedBoard [data-oilblank]')
  /* the Logic page's own switch (01-logic.css .lgmix — a label holding a checkbox drawn as a switch) */
  const lab = document.createElement('label'); lab.className = 'lgmix zz-new'
  const inp = document.createElement('input'); inp.type = 'checkbox'; inp.setAttribute('role', 'switch'); inp.checked = on
  lab.append(inp, document.createTextNode('No OIL this day'))
  /* the Logic page's letters, measured there (Inter Tight 12px, regular, no capitals): inside the bar's heading row the
     label would otherwise take the heading's capitals and spacing */
  lab.style.cssText = 'margin-right:8px;font-family:"Inter Tight",system-ui,sans-serif;font-size:12px;font-weight:400;text-transform:none;letter-spacing:-0.065px'
  b.replaceWith(lab)
}, on)
const drawAction = (page, on) => page.evaluate(on => {
  const b = document.querySelector('#schedBoard [data-oilblank]')
  b.textContent = on ? 'Let this day earn again' : 'Stop OIL for this day'
  if (on) { const n = document.querySelector('#schedBoard .daybar-note'); n.textContent = 'Nothing on this day earns OIL. The marks underneath are kept and come back when you let the day earn again.'; n.classList.add('zz-new-note') }
}, on)
async function q3() {
  const m = measured.q3 = {}
  for (const [dev, vp, touch] of [['desk', PC, false], ['phone', PHONE, true]]) {
    for (const opt of ['today', 'a', 'b']) for (const on of [false, true]) {
      const w = await world(vp, touch, { day: SAT })
      const { page } = w
      await oilOn(w)
      if (on) { const l = page.locator('#schedBoard [data-oilblank]').filter({ visible: true }).first(); if (touch) await l.tap(); else await l.click(); await sleep(600) }
      const real = await page.evaluate(() => { const b = document.querySelector('#schedBoard [data-oilblank]'); const n = document.querySelector('#schedBoard .daybar-note'); return { words: b.textContent, title: b.title, lit: b.classList.contains('on'), note: n && n.textContent } })
      if (opt === 'a') await drawSwitch(page, on)
      if (opt === 'b') await drawAction(page, on)
      await sleep(200)
      const target = opt === 'a' ? '#schedBoard .daybar label.lgmix' : '#schedBoard [data-oilblank]'
      const tb = await boxOf(page, target)
      m[`${dev}-${opt}-${on ? 'on' : 'off'}`] = { ...real, control: tb && { x: Math.round(tb.x), y: Math.round(tb.y), w: Math.round(tb.r - tb.x), h: Math.round(tb.b - tb.y) } }
      const tag = {
        today: on ? 'Pressed: the same words, lit' : 'A switch that reads like the day’s state',
        a: on ? 'Drawn A: the switch on' : 'Drawn A: the app’s own switch, off',
        b: on ? 'Drawn B: pressed, the words turn round' : 'Drawn B: the button says what it does',
      }[opt]
      /* the bar is a panel that clips what overflows its rounded corners (.sb-panel overflow:hidden): let the tag out —
         nothing inside the bar overflows, so nothing else shows */
      await page.evaluate(() => { const b = document.querySelector('#schedBoard .daybar'); b.style.overflow = 'visible' })
      await mark(page, target, tag, { at: touch ? '' : 'right' })
      if (opt === 'b' && on) await mark(page, '#schedBoard .daybar-note', '', { inside: true })
      /* the man who plainly earns on this day: Fable on the SDO desk, FO — in the picture where it fits */
      if (touch) { const tb = await boxOf(page, '.sb-top'); await standAt(page, '#schedBoard .daybar', tb.b + 40); await sleep(300) }
      const bar = await boxOf(page, '#schedBoard .daybar')
      const fable = await boxOf(page, '#schedBoard .oilpk', 0)
      m[`${dev}-puckBelowBar`] = fable && Math.round(fable.b - bar.y)
      let clip = { x: 0, y: bar.y - 34, w: vp.width, h: bar.b - bar.y + 34 + 12 }
      if (fable && fable.b - bar.y < (touch ? 600 : 640)) {
        if (!on) await mark(page, '#schedBoard .oilpk.on', 'Fable earns OIL here: FO', { at: 'bottom', n: 0 })
        clip.h = fable.b - bar.y + 34 + 36
      }
      if (!touch) { clip.x = Math.max(0, bar.x - 8); clip.w = Math.min(vp.width - clip.x, bar.r - bar.x + 16) }
      await settle(page)
      await shot(page, `q-oilswitch-${opt}-${on ? 'on' : 'off'}-${dev}`, vp, clip)
      await w.ctx.close()
    }
  }
}
if (want('q3')) await tryQ('q3', q3)

/* ======================================================================================================== q4 */
/* the inert puck, made through the board's own box: Saturday's SDO desk (Fable, 08:00–18:00) loses its END time — the
   app's own "no OIL worked out — this row has no end time" case (D360) */
async function makeInert(w) {
  const { page, touch } = w
  const sel = '[data-bfld="dr:5.0.0.end"]'
  const box = page.locator(sel).filter({ visible: true }).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  if (touch) {
    /* never typed into on an emulated phone (the method's traps): the value set and the board's own events sent */
    await box.evaluate(e => { e.focus(); e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() })
  } else {
    /* one click then Backspace clears a time box (D1047); Tab leaves it, which saves */
    await box.click(); await page.keyboard.press('Backspace'); await page.keyboard.press('Tab')
  }
  await sleep(600)
  const end = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].end)
  if (end !== '') throw new Error('the SDO end was not cleared: ' + JSON.stringify(end))
}
async function q4() {
  const m = measured.q4 = {}
  const INERT = '#schedBoard .oilpk.inert'
  for (const [dev, vp, touch] of [['phone', PHONE, true], ['desk', PC, false]]) {
    for (const opt of ['today', 'a', 'b']) {
      const w = await world(vp, touch, { day: SAT, toasts: true })
      const { page } = w
      await makeInert(w)
      await oilOn(w)
      await page.addStyleTag({ content: HIDE_TOAST })
      const info = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); return e && { title: e.title, cls: e.className } }, INERT)
      if (!info) throw new Error('no inert puck on Saturday')
      m.title = info.title
      const y = await standAt(page, INERT, touch ? 640 : 640)
      await sleep(300)
      /* the toast shows from here on, so a note the press raises is seen */
      await page.evaluate(() => document.querySelectorAll('style').forEach(s => { if (s.textContent === '#toastEl{display:none!important}') s.remove() }))
      await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.opacity = '0' })
      let said = ''
      const why = info.title.replace(/^[^—]+—\s*/, '')
      const cs = info.title.split(' — ')[0]
      if (opt === 'today') {
        const l = page.locator(INERT).filter({ visible: true }).first()
        if (touch) await l.tap(); else await l.click()
        await sleep(350)
        said = await page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent : '' })
        m[`${dev}-today`] = { said, picked: await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel, #schedBoard .sel')].filter(e => e.getBoundingClientRect().height > 0).length) }
      }
      if (opt === 'a') { said = `${cs}: ${why}`; await page.evaluate(s => window.toast(s), said) }
      if (opt === 'b') { said = `Blocked: ${why}`; await page.evaluate(s => window.toast(s, 'blocked'), said) }
      if (opt !== 'today') m[`${dev}-${opt}`] = { said }
      await sleep(300)
      const tag = {
        today: touch ? 'Tapped: picked in blue; nothing says why' : `Clicked: picked in blue; the reason only on hover: “${info.title}”`,
        a: touch ? 'Drawn A: a tap says why; nothing is picked' : 'Drawn A: a click says why in the passing note; nothing is picked',
        b: touch ? 'Drawn B: the grey “Blocked:” note' : 'Drawn B: the same words in the grey “Blocked:” note; nothing is picked',
      }[opt]
      /* the tag below the puck, so the row above it (its END box, now empty) stays in sight */
      await mark(page, INERT, tag, { at: 'bottom' })
      await mark(page, '[data-bfld="dr:5.0.0.end"]', '', { inside: true })
      if (opt !== 'today') await mark(page, '#toastEl', '', {})
      await page.mouse.move(2, 2)
      const pb = await boxOf(page, INERT)
      const top = pb.y - (touch ? 150 : 120)
      await shot(page, `q-inert-${opt}-${dev}`, vp, { x: 0, y: top, w: vp.width, h: vp.height - top })
      await w.ctx.close()
    }
  }
}
if (want('q4')) await tryQ('q4', q4)

writeFileSync(MEASURED, JSON.stringify(measured, null, 1))
console.log('MADE', made.join(' '))
await browser.close()
