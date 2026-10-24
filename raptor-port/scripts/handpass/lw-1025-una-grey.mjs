// UNA GREY, INTO THE ⋯, WITH GRANT OIL IN ITS PLACE (his D1349, 25 Oct 26) — drawn on the built bundle for him to answer.
// His words: "I was thinking of making UNA grey too. And move it to ... and +OIL is swapping places with UNA since +OIL is
// commonly used." Each picture is cut to what its question is about, the place MARKED (a dashed cyan box) and a short label
// drawn on it. "Today" pictures are real: nothing injected but the mark and the label. "Drawn" pictures change the app's
// own nodes and classes on the page (.claude/skills/brainstorming/mockups-on-the-real-app.md) and say "Drawn:".
//   1. the admin's one-day bid window: the row under the leaves (CSE · OD · UNA · ⋯) and the ⋯ menu — today and drawn
//      (CSE · OD · Grant OIL · ⋯; the menu UNA, Post out, Post in). Grant OIL keeps the label the app gives it in the
//      menu ("Grant OIL") and OIL given's green — the FO and HO boxes' own class, `k-oil` (D1320).
//   2. UNA grey on the grid: a whole-day UNA and a morning UNA beside a refused bid, an overseas duty and a leave — today
//      (teal) and two candidate greys, each measured against the refused bid and the OD as the page paints them.
//   3. the Legend's UNA swatch, today and in each grey (the Legend's boxes are the grid's own classes).
// Fixtures through the app's own controls, as admin (Saber), on Drifter; each asserts it landed.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-una-grey.mjs   [LW_PORT=4180] [SIZES=phone,desk]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/una-grey'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-una-grey', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

/* THE TWO CANDIDATE GREYS — through the app's own recipe for a kind (matrix.css: a filled box is rgba(--h, --fill) with a
   1px edge of rgba(--h, .85) and --ink words), so the grid, the Legend and any button wear them alike.
   (a) light neutral grey, dark words: the box filled solid near #B8BEC6, words #0b1116.
   (b) dark neutral grey, light words, a distinct light edge: a light grey hue at a low fill, so the box sits dark (near
       #33373C over the grid) and its 1px edge at .85 stands out light round it; words #EEF0F3. */
const GREYS = {
  a: { h: '184, 190, 198', ink: '#0b1116', fill: 1, name: 'light grey, dark words' },
  b: { h: '170, 174, 180', ink: '#EEF0F3', fill: 0.22, name: 'dark grey, light words, light edge' },
}
const greyCss = g => `.c.k-una, .tchip.lv.k-una { --h: ${g.h} !important; --ink: ${g.ink} !important; --fill: ${g.fill} !important; }`
const setGrey = (P, key) => P.evaluate(css => {
  let st = document.getElementById('mock-una-grey')
  if (!css) { st?.remove(); return }
  if (!st) { st = document.createElement('style'); st.id = 'mock-una-grey'; document.head.appendChild(st) }
  st.textContent = css
}, key ? greyCss(GREYS[key]) : '')

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const measures = []

/* the passing notes never in a picture — the manning bubble included here (it goes at the next tap: a passing note) */
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'
async function placeLL(w, who, iso, { approve, portion = null }) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await setSwitch(w, approve)
  if (portion) await L.press(w, T(`portion-${portion}`))
  const closed = await L.placeLeave(w, 'LL')
  if (!closed) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`LL on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  return kinds(w, who, iso)
}

/* THE MARK AND THE LABEL, then the picture cut to them (copied from lw-r2r3-questions.mjs) */
async function frame(w, name, { marks = [], around = [], label, pad = 8, check = null }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad }) => {
    for (const e of document.querySelectorAll('.qmk')) e.remove()
    const one = s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
    const uni = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; return { l: Math.min(...rs.map(r => r.l)), t: Math.min(...rs.map(r => r.t)), r: Math.max(...rs.map(r => r.r)), b: Math.max(...rs.map(r => r.b)) } }
    const rectOf = t => typeof t === 'string' ? one(t) : Array.isArray(t) ? uni(t.map(rectOf)) : { l: t.x, t: t.y, r: t.x + t.width, b: t.y + t.height }
    const missing = []
    const mr = marks.map(m => { const r = rectOf(m); if (!r) missing.push(JSON.stringify(m)); return r }).filter(Boolean)
    const ar = around.map(a => { const r = rectOf(a); if (!r) missing.push(JSON.stringify(a)); return r }).filter(Boolean)
    if (missing.length) return { missing }
    const CY = 'rgba(59,198,232,.9)'
    const body = document.body
    const box = (r, cls) => { const d = document.createElement('div'); d.className = 'qmk ' + cls; Object.assign(d.style, { position: 'fixed', left: `${r.l}px`, top: `${r.t}px`, width: `${r.r - r.l}px`, height: `${r.b - r.t}px`, zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' }); body.appendChild(d); return d }
    const inflated = mr.map(r => ({ l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 }))
    inflated.forEach(r => { const d = box(r, 'qmk-box'); d.style.border = `2px dashed ${CY}`; d.style.borderRadius = '7px' })
    let c = uni([...ar, ...inflated])
    c = { l: c.l - pad, t: c.t - pad, r: c.r + pad, b: c.b + pad }
    const panelEl = document.querySelector('.bidsheet') || document.querySelector('#page-leavewar') || body
    const cs = getComputedStyle(panelEl)
    const bg = cs.getPropertyValue('--panel-2').trim() || cs.getPropertyValue('--panel').trim() || '#1d232c'
    const ink = cs.getPropertyValue('--ink').trim() || '#e9eef5'
    const tag = document.createElement('div'); tag.className = 'qmk qmk-label'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', background: bg, color: ink, font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${CY}`, whiteSpace: 'normal', maxWidth: `${Math.min(innerWidth - 8, Math.max(c.r - c.l - 4, 240))}px`, boxSizing: 'border-box', boxShadow: 'none' })
    body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.t - th - 6 >= 2) { ty = c.t - th - 6; c.t = ty - 4 }
    else if (c.b + th + 6 <= innerHeight - 2) { ty = c.b + 4; c.b = ty + th + 4 }
    else { ty = Math.max(2, c.t + 2); tx = Math.max(4, c.r - tw - 6) }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t), boxes: inflated.length }
  }, { marks, around, label, pad })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the drawn premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* ---- colour arithmetic: what the eye gets, the boxes composited over the cell they sit in ---- */
const parse = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 })
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
const contrast = (x, y) => { const a = lum(x), b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }
const lab = c => {
  const R = lin(c.r), G = lin(c.g), B = lin(c.b)
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047, Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B, Z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]
}
const rad = d => d * Math.PI / 180
/* CIEDE2000 — how different two colours look; about 2 is "just noticeable", 10+ plainly different side by side */
function de2000(c1, c2) {
  const [L1, a1, b1] = lab(c1), [L2, a2, b2] = lab(c2)
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2)
  const hue = (a, b) => { if (a === 0 && b === 0) return 0; const x = Math.atan2(b, a) * 180 / Math.PI; return x < 0 ? x + 360 : x }
  const h1p = hue(a1p, b1), h2p = hue(a2p, b2)
  const dLp = L2 - L1, dCp = C2p - C1p
  let dhp = 0
  if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360 }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2))
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2
  let hbp
  if (C1p * C2p === 0) hbp = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2
  else hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2
  const Tt = 1 - 0.17 * Math.cos(rad(hbp - 30)) + 0.24 * Math.cos(rad(2 * hbp)) + 0.32 * Math.cos(rad(3 * hbp + 6)) - 0.20 * Math.cos(rad(4 * hbp - 63))
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2))
  const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2)
  const SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * Tt
  const RT = -Math.sin(rad(2 * dTheta)) * RC
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH))
}
const rgbDist = (x, y) => Math.hypot(x.r - y.r, x.g - y.g, x.b - y.b)
/* the boxes in a person's cells as painted: fill, edge and words, over the cell's own background */
const paintOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
  if (!td) return null
  const chain = []
  for (let e = td; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; chain.push(c); if (/^rgb\(/.test(c) || /rgba\([^)]*,\s*1\)$/.test(c)) break }
  return { chain, boxes: [...td.querySelectorAll('.c')].map(c => { const cs = getComputedStyle(c); return { cls: c.className, text: c.textContent, bg: cs.backgroundColor, color: cs.color, shadow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineColor}`, deco: cs.textDecorationLine } }) }
}, [who, iso])
function painted(raw, boxIdx = 0) {
  let under = { r: 0, g: 0, b: 0, a: 1 }
  for (const c of [...raw.chain].reverse()) { const p = parse(c); if (p && p.a > 0) under = over(p, under) }
  const b = raw.boxes[boxIdx]
  const fill = over(parse(b.bg) || { r: 0, g: 0, b: 0, a: 0 }, under)
  const edgeRaw = parse(b.shadow) || parse(b.outline)
  const edge = edgeRaw ? over(edgeRaw, fill) : fill
  const words = over(parse(b.color), fill)
  return { cell: hex(under), fill: hex(fill), edge: hex(edge), words: hex(words), contrast: Math.round(contrast(words, fill) * 10) / 10, lum: Math.round(lum(fill) * 1000) / 1000, struck: b.deco.includes('line-through'), _fill: fill, _edge: edge, _words: words, _cell: under, cls: b.cls, text: b.text }
}
const cmp = (x, y) => ({ fillDE: Math.round(de2000(x._fill, y._fill) * 10) / 10, fillRGB: Math.round(rgbDist(x._fill, y._fill)), edgeDE: Math.round(de2000(x._edge, y._edge) * 10) / 10, wordsDE: Math.round(de2000(x._words, y._words) * 10) / 10 })
const clean = o => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')))

/* put a person's first day of interest just right of the frozen names (two cells' gap), the row in the screen's middle */
async function alignGrid(P, who, iso) {
  await P.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  /* the frozen part is every sticky cell at the row's left (the name and its LVE figure); a few rounds, since the grid's
     window of months may redraw under a scroll; asserted by what the page draws at each cell's middle */
  let last = null
  for (let i = 0; i < 5; i++) {
    last = await P.evaluate(([who, iso]) => {
      const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
      const tr = td.parentElement
      /* a desktop freezes the name and LVE cells in place (sticky); a phone draws them as an overlay of their own (frozen-cols) */
      const frozenRight = Math.max(0, ...[...tr.children].filter(c => getComputedStyle(c).position === 'sticky').map(c => c.getBoundingClientRect().right), ...[...document.querySelectorAll('[data-testid="frozen-cols"] td')].filter(c => c.getBoundingClientRect().width > 0).map(c => c.getBoundingClientRect().right))
      let sc = td.parentElement
      while (sc && !(sc.scrollWidth > sc.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowX))) sc = sc.parentElement
      const r = td.getBoundingClientRect()
      const delta = r.left - (frozenRight + 1.5 * r.width)
      if (Math.abs(delta) > 2) { if (sc) sc.scrollLeft += delta; else window.scrollBy(delta, 0) }
      return { frozenRight: Math.round(frozenRight), left: Math.round(r.left), w: Math.round(r.width), delta: Math.round(delta), sc: sc ? (sc.className || sc.tagName) : 'window' }
    }, [who, iso])
    await P.waitForTimeout(400)
    if (Math.abs(last.delta) <= 2) break
  }
  const hit = await P.evaluate(([who, iso]) => { const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); const r = td.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && (e === td || td.contains(e))) }, [who, iso])
  console.log('   alignGrid', JSON.stringify(last), 'cell on top:', hit)
  if (!hit) throw new Error('the first day sits under something else: ' + JSON.stringify(last))
  /* near the year's end a desktop cannot scroll the day to the names (the grid ends at 31 Dec): then the name is left out */
  return Math.abs(last.delta) <= 2
}

for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  await L.signInPlain(w, 'admin')
  await hideTransient(P)
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  console.log(size, 'Drifter =', who)
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 300)); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }

  /* ============ 1. the row under the leaves and its ⋯ menu ============ */
  await sc('row', async () => {
    const d = '2026-12-02'
    if ((await kinds(w, who, d)).length) throw new Error(`2 Dec is not empty: ${JSON.stringify(await kinds(w, who, d))}`)
    await L.openCellR(w, who, d)
    if ((await sheetOf(P)) !== 'bid-picker') throw new Error('2 Dec opened ' + await sheetOf(P))
    const row0 = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-extra-row"] > *')].map(e => e.querySelector('button')?.textContent?.trim() || e.textContent.trim()))
    note('row', size, `today the row reads: ${row0.join(' · ')}`)
    if (row0.join('|') !== 'CSE|OD|UNA|⋯') throw new Error('the row is not CSE · OD · UNA · ⋯: ' + row0.join(' · '))
    const area = [T('bid-leave-grid'), T('bid-extra-row')]
    await frame(w, '1a-today-row', { marks: [T('bid-extra-row')], around: area, label: 'Today, the admin\'s bid window: CSE · OD · UNA · ⋯ under the leaves' })
    await L.press(w, T('bid-more')); await P.waitForTimeout(350)
    const menu0 = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-more-menu"] button')].map(b => b.textContent.trim()))
    note('row', size, `today the ⋯ menu holds: ${menu0.join(' · ')}`)
    if (!menu0.length) throw new Error('the ⋯ menu did not open')
    await frame(w, '1b-today-menu', { marks: [T('bid-more-menu')], around: [...area, T('bid-more-menu')], label: `Today: the ⋯ opens ${menu0.join(', ')}` })
    await L.press(w, T('bid-more')); await P.waitForTimeout(300)   // the ⋯ again closes its menu

    /* DRAWN: Grant OIL takes UNA's third place — a clone of the UNA button (its size, its look), given OIL given's own class
       (k-oil, the FO and HO boxes' green — D1320) and the label the app gives it in the menu; UNA itself hidden */
    const g = await P.evaluate(() => {
      const row = document.querySelector('[data-testid="bid-extra-row"]')
      const una = row.querySelector('[data-testid="bid-una"]'), od = row.querySelector('[data-testid="bid-file-OD"]')
      const b = una.cloneNode(true)
      b.removeAttribute('data-testid'); b.dataset.drawn = 'grant'
      b.className = b.className.replace(/\bk-una\b/, 'k-oil')
      b.querySelector('.lv-code').textContent = 'Grant OIL'
      b.title = 'Grant OIL — a day or half a day off in lieu, for any reason'
      una.before(b); una.style.display = 'none'; una.dataset.drawn = 'hidden'
      const r = b.getBoundingClientRect(), o = od.getBoundingClientRect(), c = getComputedStyle(b)
      return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, odW: Math.round(o.width * 10) / 10, odH: Math.round(o.height * 10) / 10, over: b.scrollWidth - b.clientWidth, top: Math.round(r.top), odTop: Math.round(o.top), bg: c.backgroundColor, color: c.color, edge: c.boxShadow, fs: c.fontSize }
    })
    note('row', size, `drawn Grant OIL: ${JSON.stringify(g)}`)
    if (Math.abs(g.w - g.odW) > 0.6 || Math.abs(g.h - g.odH) > 0.6 || g.top !== g.odTop) throw new Error('Grant OIL is not the size of its neighbours: ' + JSON.stringify(g))
    if (g.over > 0) note('row', size, `NOTE: "Grant OIL" runs ${g.over}px past its button`)
    const rowOk = async () => P.evaluate(() => { const b = document.querySelector('[data-drawn="grant"]'); return b && b.getBoundingClientRect().height > 0 && getComputedStyle(document.querySelector('[data-testid="bid-una"]')).display === 'none' ? null : 'the drawn row is gone' })
    await frame(w, '1c-drawn-row', { marks: [T('bid-extra-row')], around: area, label: 'Drawn: CSE · OD · Grant OIL · ⋯ — Grant OIL in OIL given\'s green, UNA into the ⋯', check: rowOk })

    /* DRAWN: the ⋯ menu holds UNA, Post out, Post in — UNA a menu line cloned from Post out's (the menu's own plain look),
       first, where Grant OIL stood; Grant OIL's line hidden */
    await L.press(w, T('bid-more')); await P.waitForTimeout(350)
    const m = await P.evaluate(() => {
      const menu = document.querySelector('[data-testid="bid-more-menu"]')
      if (!menu) return null
      const oil = menu.querySelector('[data-testid="bid-oil"]')
      const model = menu.querySelector('[data-testid="bid-postout"]') || [...menu.querySelectorAll('button')].find(b => b !== oil)
      const u = model.cloneNode(true); u.removeAttribute('data-testid'); u.dataset.drawn = 'una-item'; u.textContent = 'UNA'
      u.title = 'UNA: unavailable, out of the manning — placed at once'
      ;(oil || model).before(u); if (oil) { oil.style.display = 'none'; oil.dataset.drawn = 'hidden' }
      return [...menu.querySelectorAll('button')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.textContent.trim())
    })
    if (!m) throw new Error('the ⋯ menu did not open over the drawn row')
    note('row', size, `drawn menu: ${m.join(' · ')}`)
    const menuOk = async () => P.evaluate(() => document.querySelector('[data-drawn="una-item"]') && document.querySelector('[data-drawn="grant"]') ? null : 'the drawn menu is gone')
    await frame(w, '1d-drawn-menu', { marks: [T('bid-more-menu')], around: [...area, T('bid-more-menu')], label: `Drawn: the ⋯ opens ${m.join(', ')}`, check: menuOk })
    await L.press(w, T('bid-more')); await P.waitForTimeout(300)
    await L.closeAny(w)
  })

  /* ============ 2. UNA grey on the grid ============ */
  const days = { od: '2026-12-14', una: '2026-12-15', ref: '2026-12-16', unaAm: '2026-12-17', ll: '2026-12-18' }
  let gridOk = false
  await sc('grid', async () => {
    for (const d of Object.values(days)) { const k = await kinds(w, who, d); if (k.length) throw new Error(`${d} is not empty: ${JSON.stringify(k)}`) }
    /* Mon 14: an overseas duty, filed from the window */
    await L.openCellR(w, who, days.od); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
    /* Tue 15: a whole-day UNA */
    await L.openCellR(w, who, days.una); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    /* Wed 16: a bid, then refused from its window */
    await placeLL(w, who, days.ref, { approve: false })
    await L.openCellR(w, who, days.ref); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500); await L.closeAny(w)
    /* Thu 17: a morning UNA */
    await L.openCellR(w, who, days.unaAm); await L.press(w, T('portion-am')); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    /* Fri 18: an approved local leave */
    await placeLL(w, who, days.ll, { approve: true })
    await L.closeAny(w)
    const got = {}
    for (const [k, d] of Object.entries(days)) got[k] = await kinds(w, who, d)
    note('grid', size, 'the five days: ' + JSON.stringify(got))
    const want = { od: /k-od\|s-a\|whole/, una: /k-una\|s-a\|whole/, ref: /k-ll\|s-r/, unaAm: /k-una\|s-a\|top/, ll: /k-ll\|s-a\|whole/ }
    for (const [k, re] of Object.entries(want)) if (!got[k].some(x => re.test(x))) throw new Error(`${k} (${days[k]}) did not land: ${JSON.stringify(got[k])}`)
    gridOk = true
    await P.waitForTimeout(6500)   // any just-added ring gone (about six seconds) before the pictures
    const besideNames = await alignGrid(P, who, days.od)
    const cells = Object.values(days).map(d => T(L.cellId(who, d)))
    /* the name the eye reads at that row: whatever is drawn at the frozen column's left at the row's middle (a phone's overlay) */
    const nameCell = await P.evaluate(([who, iso]) => { document.querySelectorAll('[data-qname]').forEach(e => e.removeAttribute('data-qname')); const r = document.querySelector(`[data-testid="cell-${who}-${iso}"]`).getBoundingClientRect(); const e = document.elementFromPoint(30, r.top + r.height / 2)?.closest('td.who'); if (!e) return null; e.dataset.qname = '1'; return '[data-qname="1"]' }, [who, days.od])
    if (!nameCell) throw new Error('no name drawn beside the row')
    const around = besideNames ? [nameCell, ...cells] : [T(L.cellId(who, '2026-12-13')), ...cells, T(L.cellId(who, '2026-12-19'))]
    const unaMarks = [T(L.cellId(who, days.una)), T(L.cellId(who, days.unaAm))]
    const measure = async variant => {
      const out = {}
      for (const [k, d] of Object.entries(days)) { const raw = await paintOf(P, who, d); out[k] = painted(raw, 0) }
      const row = { size, variant, boxes: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, clean(v)])), una_vs_od: cmp(out.una, out.od), una_vs_refused: cmp(out.una, out.ref), unaAm_vs_od: cmp(out.unaAm, out.od), una_vs_emptyCell: Math.round(de2000(out.una._fill, out.una._cell) * 10) / 10, od_vs_refused: cmp(out.od, out.ref) }
      measures.push(row)
      note('grid', size, `${variant}: UNA fill ${out.una.fill} edge ${out.una.edge} words ${out.una.words} (${out.una.contrast}:1) · OD fill ${out.od.fill} edge ${out.od.edge} · refused cell ${out.ref.fill} edge ${out.ref.edge} words ${out.ref.words} · ΔE UNA–OD ${row.una_vs_od.fillDE}, UNA–refused fill ${row.una_vs_refused.fillDE} edge ${row.una_vs_refused.edgeDE} words ${row.una_vs_refused.wordsDE}`)
      return out
    }
    await setGrey(P, null)
    await measure('today-teal')
    await frame(w, '2a-today-grid', { marks: unaMarks, around, label: 'Today, Drifter 14–18 Dec: OD · UNA · refused LL · UNA (AM) · LL — UNA in deep teal', pad: 6 })
    for (const key of ['a', 'b']) {
      await setGrey(P, key)
      await P.waitForTimeout(150)
      const o = await measure(`grey-${key}`)
      const want = GREYS[key]
      const check = async () => { const raw = await paintOf(P, who, days.una); return raw.boxes[0].bg.includes(want.h.split(',')[0].trim()) ? null : 'the grey is not on the UNA box: ' + raw.boxes[0].bg }
      await frame(w, `2${key === 'a' ? 'b' : 'c'}-drawn-grid-grey-${key}`, { marks: unaMarks, around, label: `Drawn (${key}): UNA ${want.name} — box ${o.una.fill}`, pad: 6, check })
    }
    await setGrey(P, null)
  })

  /* ============ 3. the Legend's UNA swatch ============ */
  await sc('legend', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    await L.press(w, T('legend-open')); await P.waitForSelector(T('legend'), { timeout: 4000 })
    const has = await P.evaluate(() => !!document.querySelector('[data-testid="legend"] .leg-row .c.k-una'))
    if (!has) throw new Error('the Legend lists no UNA')
    await P.evaluate(() => { const r = document.querySelector('[data-testid="legend"] .leg-row:has(.c.k-od)'); r.scrollIntoView({ block: 'nearest' }) })
    await P.waitForTimeout(200)
    const rowU = '[data-testid="legend"] .leg-row:has(.c.k-una)'
    const legArea = ['[data-testid="legend"] .leg-row:has(.c.k-cse)', '[data-testid="legend"] .leg-row:has(.c.s-r)']
    const visible = await P.evaluate(() => { const r = document.querySelector('[data-testid="legend"] .leg-row:has(.c.s-r)').getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0 })
    if (!visible) await P.evaluate(() => document.querySelector('[data-testid="legend"] .leg-row:has(.c.s-r)').scrollIntoView({ block: 'nearest' }))
    const legWords = await P.evaluate(() => document.querySelector('[data-testid="legend"] .leg-row:has(.c.k-una)').innerText.replace(/\s+/g, ' ').trim())
    note('legend', size, `the Legend's UNA row reads: ${legWords}`)
    await setGrey(P, null)
    await frame(w, '3a-today-legend', { marks: [rowU], around: legArea, label: 'Today, the Legend: UNA in deep teal, beside OD and the refused box' })
    for (const key of ['a', 'b']) {
      await setGrey(P, key); await P.waitForTimeout(150)
      await frame(w, `3${key === 'a' ? 'b' : 'c'}-drawn-legend-grey-${key}`, { marks: [rowU], around: legArea, label: `Drawn (${key}): the Legend's UNA ${GREYS[key].name}`,
        check: async () => (await P.evaluate(() => getComputedStyle(document.querySelector('[data-testid="legend"] .leg-row .c.k-una')).backgroundColor)).includes(GREYS[key].h.split(',')[0].trim()) ? null : 'the grey is not on the swatch' })
    }
    await setGrey(P, null)
    await P.keyboard.press('Escape'); await P.waitForTimeout(200)
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ greys: GREYS, log, pics, measures }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
