// THE QUESTIONS PAGE, VERSION 7 (25 Oct 26) — C1, C2, Q1, Q2, drawn on the built bundle for him to answer.
// The plan: raptor-port/docs/superpowers/briefs/2026-10-25-lw-questions-v7.md. Each picture is cut to its question, the place
// MARKED (a dashed cyan box) and a short label on it. "Today" pictures inject nothing but the mark and the label; "Drawn"
// pictures change the app's own nodes and classes on the page (.claude/skills/brainstorming/mockups-on-the-real-app.md) and
// say "Drawn" on the picture. Every fixture is made through the app's own controls and each step asserts it landed.
//   C1  an Other's colour on the Leave War: Drifter, Mon 14 – Fri 18 Dec — OD · Other whole day · refused LL · Other (AM) ·
//       approved LL. The Other is not on the war yet: a UNA is placed through the bid window's own UNA button and its letters
//       read OTH on the page. Look A: the Inputs calendar's outlined commitment look (D1321 — the bar's exact fill, edge and
//       words); look B: his D1349 light grey (the una-grey drawing's (a)). Each measured (lw-1025-una-grey.mjs's arithmetic).
//   C2  a tap on a day holding a half-day Other: the window on the free half. Today (for comparison): beside a morning leave
//       filed on the Inputs page (filed through the test bridge, the shape the Inputs page writes). Drawn, admin and member:
//       the held morning named by its box in C1's look A and its remarks, changed on the Inputs page; the row under the
//       leaves as ruled (CSE · OD · Grant OIL · ⋯, D1349 / D1356) for the admin.
//   Q1  the Inputs page's window for an Other (admin, Drifter, "Under investigation"): today; drawn A — a "Goes to" row,
//       Ground Programme · Unavailable (the window's own Duration buttons' classes), with a grey line that follows the pick;
//       drawn B — his tick "War manning reduced" (a clone of the window's "all day" tick) as the only control; drawn B2 — the
//       tick beside A's choice, showing how the two can disagree.
//   Q2  a course (CSE) filed for Drifter on Thu 16 Jul through the Inputs page's own window: where it lands on Edit Schedule
//       today, and under Unavailable — moved with the schedule's own Reject then "→ Unavail" where the app offers them.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-q7.mjs   [LW_PORT=4180] [SIZES=phone,desk] [SETS=c1,c2,q1,q2]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/q7'
const { mkdirSync } = await import('node:fs')
const path0 = await import('node:path')
const here0 = path0.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
mkdirSync(path0.resolve(here0, '../../docs/img/handpass', process.env.LW_OUT), { recursive: true })
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-q7', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const SETS = (process.env.SETS || 'c1,c2,q1,q2').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`)) && SETS.some(s => f.toLowerCase().startsWith(s))) unlinkSync(path.join(L.OUT, f))

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const measures = []
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'
const setSwitch = async (w, on) => { const s = w.page.locator(T('bid-approve-tick')); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T('bid-approve-tick')); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }

/* THE TWO LOOKS FOR AN OTHER ON THE WAR. A is the Inputs calendar's outlined bar for a duty or other commitment (D1321,
   `.ib-bar.duty` in 25-inputs-calendar.css: fill rgba(232,237,242,.05), edge 1.5px rgba(200,212,228,.78), words #E8EDF2),
   put on the war's box as it is. B is his D1349 grey through the war's own recipe for a kind (matrix.css). */
const LOOKS = {
  A: { name: 'outlined, as the Inputs calendar draws a commitment', css: '.c.k-una.s-a, .tchip.lv.k-una.s-a { background: rgba(232,237,242,.05) !important; box-shadow: inset 0 0 0 1.5px rgba(200,212,228,.78) !important; color: #E8EDF2 !important; }' },
  B: { name: 'light grey, dark words (your UNA grey)', css: '.c.k-una, .tchip.lv.k-una { --h: 184, 190, 198 !important; --ink: #0b1116 !important; --fill: 1 !important; }' },
}
const setLook = (P, key) => P.evaluate(css => {
  let st = document.getElementById('mock-oth-look')
  if (!css) { st?.remove(); return }
  if (!st) { st = document.createElement('style'); st.id = 'mock-oth-look'; document.head.appendChild(st) }
  st.textContent = css
}, key ? LOOKS[key].css : '')
/* the UNA boxes' letters read OTH — a text change on the page, nothing stored */
const unaToOth = P => P.evaluate(() => { let n = 0; for (const e of document.querySelectorAll('.c.k-una, .tchip.lv.k-una')) for (const t of [...e.childNodes]) if (t.nodeType === 3 && /UNA/.test(t.textContent)) { t.textContent = t.textContent.replace('UNA', 'OTH'); n++ } return n })

/* THE MARK AND THE LABEL, then the picture cut to them (lw-1025-una-tap.mjs's frame(), unchanged but its name) */
async function frame(w, name, { marks = [], around = [], label, pad = 8, check = null, flush = false }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad, flush }) => {
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
    c = { l: c.l - pad, t: c.t - (flush ? 0 : pad), r: c.r + pad, b: c.b + pad }
    const panelEl = document.querySelector('.bidsheet') || document.querySelector('#page-leavewar') || body
    const cs = getComputedStyle(panelEl)
    const bg = cs.getPropertyValue('--panel-2').trim() || cs.getPropertyValue('--panel').trim() || '#1d232c'
    const ink = cs.getPropertyValue('--ink').trim() || '#e9eef5'
    const tag = document.createElement('div'); tag.className = 'qmk qmk-label'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', background: bg, color: ink, font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${CY}`, whiteSpace: 'normal', maxWidth: `${Math.min(innerWidth - 8, Math.max(c.r - c.l - 4, 240))}px`, boxSizing: 'border-box', boxShadow: 'none' })
    body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.t - th - 6 >= 2) { ty = c.t - th - (flush ? 0 : 6); c.t = ty - 4 }
    else if (c.b + th + 6 <= innerHeight - 2) { ty = c.b + 4; c.b = ty + th + 4 }
    else { ty = Math.max(2, c.t + 2); tx = Math.max(4, c.r - tw - 6) }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t), boxes: inflated.length }
  }, { marks, around, label, pad, flush })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the drawn premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* ---- colour arithmetic (lw-1025-una-grey.mjs's, unchanged) ---- */
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
  return { cell: hex(under), fill: hex(fill), edge: hex(edge), words: hex(words), contrast: Math.round(contrast(words, fill) * 10) / 10, struck: b.deco.includes('line-through'), _fill: fill, _edge: edge, _words: words, _cell: under, text: b.text }
}
const r1 = x => Math.round(x * 10) / 10
const cmp = (x, y) => ({ fillDE: r1(de2000(x._fill, y._fill)), edgeDE: r1(de2000(x._edge, y._edge)), wordsDE: r1(de2000(x._words, y._words)) })
const clean = o => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')))

/* put a person's first day of interest just right of the frozen names (lw-1025-una-grey.mjs's own) */
async function alignGrid(P, who, iso) {
  await P.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  let last = null
  for (let i = 0; i < 5; i++) {
    last = await P.evaluate(([who, iso]) => {
      const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
      const tr = td.parentElement
      const frozenRight = Math.max(0, ...[...tr.children].filter(c => getComputedStyle(c).position === 'sticky').map(c => c.getBoundingClientRect().right), ...[...document.querySelectorAll('[data-testid="frozen-cols"] td')].filter(c => c.getBoundingClientRect().width > 0).map(c => c.getBoundingClientRect().right))
      let sc = td.parentElement
      while (sc && !(sc.scrollWidth > sc.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowX))) sc = sc.parentElement
      const r = td.getBoundingClientRect()
      const delta = r.left - (frozenRight + 1.5 * r.width)
      if (Math.abs(delta) > 2) { if (sc) sc.scrollLeft += delta; else window.scrollBy(delta, 0) }
      return { frozenRight: Math.round(frozenRight), left: Math.round(r.left), w: Math.round(r.width), delta: Math.round(delta) }
    }, [who, iso])
    await P.waitForTimeout(400)
    if (Math.abs(last.delta) <= 2) break
  }
  const hit = await P.evaluate(([who, iso]) => { const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); const r = td.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && (e === td || td.contains(e))) }, [who, iso])
  if (!hit) throw new Error('the first day sits under something else: ' + JSON.stringify(last))
  return Math.abs(last.delta) <= 2
}

/* ---- the Inputs page and the schedule (lw-1025-oth.mjs's helpers) ---- */
const wins = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"], [data-testid="upconf"], [data-testid="medconf"], [data-testid="win-inputedit"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))
async function answerAsks(w, tag) {
  const P = w.page
  for (let i = 0; i < 3; i++) {
    const open = (await wins(P)).filter(t => t !== 'win-inputedit')
    if (!open.length) return
    note(tag, w.size, `a question opened after the save: ${open.join(', ')}`)
    if (open.includes('docconf')) await L.press(w, T('docconf-nodoc'))
    else throw new Error('a question opened that this script does not answer: ' + open.join(', '))
    await P.waitForTimeout(600)
  }
}
const openInputsList = async w => {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
  await P.waitForSelector(T('in-new'), { timeout: 5000 })
}
async function newInputWindow(w, who, type) {
  const P = w.page
  await openInputsList(w)
  await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  await P.locator('#inpEditPerson').selectOption({ label: who })
  await P.locator('#inpEditType').selectOption(type); await P.waitForTimeout(400)
}
const dayScope = (page, di) => `${page === 'editsched' ? '#eWeek' : '#vWeek'} section.day[data-day="${di}"]`
async function tagRow(P, scope, secCls, attr, re) {
  return P.evaluate(([scope, secCls, attr, re]) => {
    document.querySelectorAll(`[${attr}]`).forEach(e => e.removeAttribute(attr))
    const root = document.querySelector(scope)
    if (!root) return { noScope: true }
    const rows = [...root.querySelectorAll(`.${secCls} .pl-row`)]
    const r = rows.find(r => /Drifter/i.test(r.innerText) && new RegExp(re, 'i').test(r.innerText))
    if (!r) return { rows: rows.map(x => x.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)), sec: !!root.querySelector(`.${secCls}`) }
    r.setAttribute(attr, '1')
    return { text: r.innerText.replace(/\s+/g, ' ').trim(), btns: [...r.querySelectorAll('.accb')].map(b => b.textContent.trim()), allRows: rows.length }
  }, [scope, secCls, attr, re])
}
async function centreOn(P, sels) {
  await P.locator(sels[0]).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const dy = await P.evaluate(sels => { const rs = sels.map(s => document.querySelector(s)?.getBoundingClientRect()).filter(Boolean); if (!rs.length) return 0; const t = Math.min(...rs.map(r => r.top)), b = Math.max(...rs.map(r => r.bottom)); return (t + b) / 2 - innerHeight / 2 }, sels)
  if (Math.abs(dy) > 4) { await P.evaluate(dy => window.scrollBy(0, dy), dy); await P.waitForTimeout(300) }
}

for (const size of SIZES) {
  console.log(`\n===== ${size} =====`)
  const fresh = async (who = 'admin') => { const w = await L.newCtx(size); await L.signInPlain(w, who); await hideTransient(w.page); return w }
  const sc = async (id, w, fn) => { console.log(`-- ${id} [${size}]`); try { await fn(); return true } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 400)); await w.page.keyboard.press('Escape').catch(() => {}); await L.closeAny(w).catch(() => {}); return false } }

  /* ================= C1 — an Other's colour on the Leave War ================= */
  if (SETS.includes('c1')) {
    const w = await fresh(); const P = w.page
    const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
    const days = { od: '2026-12-14', oth: '2026-12-15', ref: '2026-12-16', othAm: '2026-12-17', ll: '2026-12-18' }
    await sc('c1', w, async () => {
      for (const d of Object.values(days)) { const k = await kinds(w, who, d); if (k.length) throw new Error(`${d} is not empty: ${JSON.stringify(k)}`) }
      await L.openCellR(w, who, days.od); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
      await L.openCellR(w, who, days.oth); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
      await L.openCellR(w, who, days.ref); await setSwitch(w, false); if (!(await L.placeLeave(w, 'LL'))) throw new Error('refused LL not placed')
      await L.openCellR(w, who, days.ref); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500); await L.closeAny(w)
      await L.openCellR(w, who, days.othAm); await L.press(w, T('portion-am')); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
      await L.openCellR(w, who, days.ll); await setSwitch(w, true); if (!(await L.placeLeave(w, 'LL'))) throw new Error('approved LL not placed')
      await L.closeAny(w)
      const got = {}; for (const [k, d] of Object.entries(days)) got[k] = await kinds(w, who, d)
      note('c1', size, 'the five days: ' + JSON.stringify(got))
      const want = { od: /k-od\|s-a\|whole/, oth: /k-una\|s-a\|whole/, ref: /k-ll\|s-r/, othAm: /k-una\|s-a\|top/, ll: /k-ll\|s-a\|whole/ }
      for (const [k, re] of Object.entries(want)) if (!got[k].some(x => re.test(x))) throw new Error(`${k} (${days[k]}) did not land: ${JSON.stringify(got[k])}`)
      await P.waitForTimeout(6500)   // the just-added ring gone before the pictures
      const besideNames = await alignGrid(P, who, days.od)
      const cells = Object.values(days).map(d => T(L.cellId(who, d)))
      const nameCell = await P.evaluate(([who, iso]) => { document.querySelectorAll('[data-qname]').forEach(e => e.removeAttribute('data-qname')); const r = document.querySelector(`[data-testid="cell-${who}-${iso}"]`).getBoundingClientRect(); const e = document.elementFromPoint(30, r.top + r.height / 2)?.closest('td.who'); if (!e) return null; e.dataset.qname = '1'; return '[data-qname="1"]' }, [who, days.od])
      if (!nameCell) throw new Error('no name drawn beside the row')
      const around = besideNames ? [nameCell, ...cells] : [T(L.cellId(who, '2026-12-13')), ...cells, T(L.cellId(who, '2026-12-19'))]
      const marks = [T(L.cellId(who, days.oth)), T(L.cellId(who, days.othAm))]
      const swapped = await unaToOth(P)
      if (swapped < 2) throw new Error('the letters did not change on both boxes: ' + swapped)
      for (const key of ['A', 'B']) {
        await setLook(P, key); await P.waitForTimeout(150)
        const out = {}; for (const [k, d] of Object.entries(days)) out[k] = painted(await paintOf(P, who, d), 0)
        const row = { size, look: key, boxes: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, clean(v)])), oth_vs_od: cmp(out.oth, out.od), oth_vs_refused: cmp(out.oth, out.ref), oth_vs_emptyCell: r1(de2000(out.oth._fill, out.oth._cell)) }
        measures.push(row)
        note('c1', size, `${key}: OTH fill ${out.oth.fill} edge ${out.oth.edge} words ${out.oth.words} (${out.oth.contrast}:1) · OD fill ${out.od.fill} edge ${out.od.edge} · refused ${out.ref.fill}/${out.ref.edge}/${out.ref.words} · ΔE OTH–OD fill ${row.oth_vs_od.fillDE} edge ${row.oth_vs_od.edgeDE} · OTH–refused fill ${row.oth_vs_refused.fillDE} edge ${row.oth_vs_refused.edgeDE} words ${row.oth_vs_refused.wordsDE} · OTH–empty cell ${row.oth_vs_emptyCell}`)
        const check = async () => (await P.evaluate(([who, d]) => /OTH/.test(document.querySelector(`[data-testid="cell-${who}-${d}"] .c`)?.textContent || '') && !!document.getElementById('mock-oth-look'), [who, days.oth])) ? null : 'the OTH letters or the look are gone'
        await frame(w, `c1-${key.toLowerCase()}-grid`, { marks, around, pad: 6, check,
          label: key === 'A' ? 'Drawn A (recommended): Other outlined, as the Inputs calendar draws a commitment. Drifter 14–18 Dec: OD · OTH · refused LL · OTH (AM) · LL'
            : 'Drawn B: Other in your light grey. Drifter 14–18 Dec: OD · OTH · refused LL · OTH (AM) · LL' })
      }
      await setLook(P, null)
    })
    if (w.errs.length) note('c1-errors', size, w.errs.slice(0, 6).join(' || '))
    await w.ctx.close()
  }

  /* ================= C2 — a tap on a day holding a half-day Other ================= */
  if (SETS.includes('c2')) {
    const DAY = '2026-11-12', MD = 'Nov 12', YR = 2026, WORDS = 'Board of inquiry'
    const w = await fresh(); const P = w.page
    const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
    const who = ids.Drifter, me = ids.Ranger
    let gridHtml = {}
    const opened = await sc('c2-fixtures', w, async () => {
      for (const p of [who, me]) { const k = await kinds(w, p, DAY); if (k.length) throw new Error(`${p} ${DAY} is not empty: ${JSON.stringify(k)}`) }
      await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
      await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
      if ((await P.locator(T('od-month-2026-11')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-11')); await P.waitForTimeout(500) }
      await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
      /* the leave buttons with nothing charged on the day (an Other charges no leave) — read before the morning is filed */
      await L.openCellR(w, who, DAY)
      if ((await sheetOf(P)) !== 'bid-picker') throw new Error(`${DAY} opened ${await sheetOf(P)}`)
      gridHtml.admin = await P.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="bid-leave-grid"]')?.outerHTML)
      await L.closeAny(w)
      if (await P.evaluate(() => typeof window.fileInput) !== 'function') throw new Error('no test bridge on this build')
      for (const p of [who, me]) {
        await P.evaluate(([p, md, y, r]) => window.fileInput({ person: p, date: md, yr: y, type: 'LL', allday: false, half: 'am', s: 0, e: 720, remarks: r }), [p, MD, YR, WORDS])
        await P.waitForTimeout(600)
        const k = await kinds(w, p, DAY)
        note('c2', size, `${p} ${DAY} after the morning filed on the Inputs page: ${JSON.stringify(k)}`)
        if (!k.some(x => /k-ll\|s-a\|top/.test(x))) throw new Error(`${p}: no morning box: ${JSON.stringify(k)}`)
      }
    })
    /* the drawing: the held-half line becomes the Other's own line — its box in look A, "Morning", its remarks read only, and
       where it is changed; the box cloned from the grid's own `.c` (in the Legend's frame, `.leg-box`, so it wears the grid's
       recipe), the words in the window's own `note` style */
    const drawHeld = (asAdmin) => P.evaluate(({ words, css, asAdmin, grid }) => {
      const s = document.querySelector('[data-testid="bid-picker"]')
      const hh = s.querySelector('[data-testid="bid-heldhalf"]')
      if (!hh) return 'no held-half line'
      let st = document.getElementById('mock-oth-look'); if (!st) { st = document.createElement('style'); st.id = 'mock-oth-look'; document.head.appendChild(st) }
      st.textContent = css + ' [data-drawn="held"] { display:flex; align-items:center; gap:8px; flex-wrap:wrap; } [data-drawn="held"] .leg-box { display:inline-flex; width:40px; height:22px; position:relative; flex:none; } [data-drawn="held"] .leg-box .c { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; border-radius:4px; } [data-drawn="held"] .hw { color: var(--ink, #e9eef5); font-style: normal; }'
      hh.dataset.drawn = 'held'
      hh.innerHTML = '<span class="leg-box"><span class="c k-una s-a whole">OTH</span></span><span>Morning</span><span class="hw">“' + words + '”</span><span>· change it on the Inputs page</span>'
      if (grid) { const g = s.querySelector('[data-testid="bid-leave-grid"]'); const box = document.createElement('div'); box.innerHTML = grid; const ng = box.firstElementChild; ng.dataset.drawn = 'grid'; g.replaceWith(ng) }
      if (asAdmin) {
        const row = s.querySelector('[data-testid="bid-extra-row"]'), una = row?.querySelector('[data-testid="bid-una"]')
        if (una) { const b = una.cloneNode(true); b.removeAttribute('data-testid'); b.dataset.drawn = 'grant'; b.className = b.className.replace(/\bk-una\b/, 'k-oil'); b.querySelector('.lv-code').textContent = 'Grant OIL'; una.before(b); una.style.display = 'none' }
      }
      const r = hh.getBoundingClientRect()
      return { h: Math.round(r.height), w: Math.round(r.width), text: hh.innerText.replace(/\s+/g, ' ') }
    }, { words: WORDS, css: LOOKS.A.css.replace(/k-una\.s-a/g, 'k-una.s-a'), asAdmin, grid: asAdmin ? gridHtml.admin : gridHtml.member })
    const heldOk = () => P.evaluate(() => { const h = document.querySelector('[data-drawn="held"]'); return h && h.getBoundingClientRect().height > 0 && /OTH/.test(h.textContent) ? null : 'the drawn line is gone' })
    if (opened) await sc('c2-admin', w, async () => {
      await L.openCellR(w, who, DAY)
      if ((await sheetOf(P)) !== 'bid-picker') throw new Error(`${DAY} opened ${await sheetOf(P)}`)
      const held = await L.txt(P, T('bid-heldhalf'))
      note('c2', size, `today the window's held-half line: "${held}"`)
      if (!/morning is LL/.test(held || '')) throw new Error('not the free-half window: ' + held)
      await frame(w, 'c2-today-leave', { marks: ['[data-testid="bid-picker"] .bp-dur'], around: [T('bid-picker')], flush: true, label: 'Today, for comparison: beside a morning leave filed on the Inputs page, the window opens on PM' })
      const d = await drawHeld(true)
      note('c2', size, 'drawn, admin: ' + JSON.stringify(d))
      if (typeof d === 'string') throw new Error(d)
      await frame(w, 'c2-drawn-admin', { marks: ['[data-drawn="held"]'], around: [T('bid-picker')], flush: true, check: heldOk, label: 'Drawn, as admin: the window on PM; the morning Other named by its box and remarks, changed on the Inputs page' })
      await L.closeAny(w)
    })
    if (opened) {
      await w.ctx.close()
    }
    /* the member: a fresh world, Ranger's own day */
    if (opened) {
      const m = await fresh('member'); const MP = m.page
      await sc('c2-member', m, async () => {
        /* an admin opens November in this world first: sign in as admin, open, then as Ranger */
        await L.signInPlain(m, 'admin'); await hideTransient(MP)
        await MP.evaluate(() => window.scrollTo(0, 0))
        await L.press(m, T('open-chip')); await MP.waitForSelector(T('open-dates'))
        if ((await MP.locator(T('od-month-2026-11')).getAttribute('aria-pressed')) !== 'true') { await L.press(m, T('od-month-2026-11')); await MP.waitForTimeout(500) }
        await L.press(m, T('open-dates-close')); await MP.waitForTimeout(300)
        await L.signInPlain(m, 'member'); await hideTransient(MP)
        await L.openCellR(m, me, DAY)
        if ((await sheetOf(MP)) !== 'bid-picker') throw new Error(`his ${DAY} opened ${await sheetOf(MP)}`)
        gridHtml.member = await MP.evaluate(() => document.querySelector('[data-testid="bid-picker"] [data-testid="bid-leave-grid"]')?.outerHTML)
        await L.closeAny(m)
        await MP.evaluate(([p, md, y, r]) => window.fileInput({ person: p, date: md, yr: y, type: 'LL', allday: false, half: 'am', s: 0, e: 720, remarks: r }), [me, MD, YR, WORDS])
        await MP.waitForTimeout(600)
        await L.openCellR(m, me, DAY)
        const held = await L.txt(MP, T('bid-heldhalf'))
        if (!/morning is LL/.test(held || '')) throw new Error('not his free-half window: ' + held)
        const d = await MP.evaluate(({ words, css, grid }) => {
          const s = document.querySelector('[data-testid="bid-picker"]')
          const hh = s.querySelector('[data-testid="bid-heldhalf"]')
          let st = document.getElementById('mock-oth-look'); if (!st) { st = document.createElement('style'); st.id = 'mock-oth-look'; document.head.appendChild(st) }
          st.textContent = css + ' [data-drawn="held"] { display:flex; align-items:center; gap:8px; flex-wrap:wrap; } [data-drawn="held"] .leg-box { display:inline-flex; width:40px; height:22px; position:relative; flex:none; } [data-drawn="held"] .leg-box .c { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; border-radius:4px; } [data-drawn="held"] .hw { color: var(--ink, #e9eef5); font-style: normal; }'
          hh.dataset.drawn = 'held'
          hh.innerHTML = '<span class="leg-box"><span class="c k-una s-a whole">OTH</span></span><span>Morning</span><span class="hw">“' + words + '”</span><span>· change it on the Inputs page</span>'
          if (grid) { const g = s.querySelector('[data-testid="bid-leave-grid"]'); const box = document.createElement('div'); box.innerHTML = grid; const ng = box.firstElementChild; ng.dataset.drawn = 'grid'; g.replaceWith(ng) }
          const r = hh.getBoundingClientRect()
          return { h: Math.round(r.height), text: hh.innerText.replace(/\s+/g, ' ') }
        }, { words: WORDS, css: LOOKS.A.css, grid: gridHtml.member })
        note('c2', size, 'drawn, member: ' + JSON.stringify(d))
        await frame(m, 'c2-drawn-member', { marks: ['[data-drawn="held"]'], around: [T('bid-picker')], flush: true, label: 'Drawn, as Ranger: his window on PM; his morning Other named the same way, read only',
          check: () => MP.evaluate(() => document.querySelector('[data-drawn="held"]') ? null : 'the drawn line is gone') })
        await L.closeAny(m)
      })
      if (m.errs.length) note('c2-errors', size, m.errs.slice(0, 6).join(' || '))
      await m.ctx.close()
    } else await w.ctx.close()
  }

  /* ================= Q1 — his "War manning reduced" tick, on the Inputs page's window for an Other ================= */
  if (SETS.includes('q1')) {
    const w = await fresh(); const P = w.page
    await sc('q1', w, async () => {
      await newInputWindow(w, 'Drifter', 'Other')
      await P.locator('#inpEditRmk').fill('Under investigation')
      const has = await P.evaluate(() => ({ allday: !!document.querySelector('#inpEditAllday'), span: !!document.querySelector('#inpEditSpan') }))
      note('q1', size, 'the Other window has: ' + JSON.stringify(has))
      if (!has.allday) throw new Error('no "all day" tick on the Other window')
      if (!(await P.evaluate(() => document.querySelector('#inpEditAllday').checked))) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(300) }
      const typeRow = '[data-testid="win-inputedit"] .inped-f:has(#inpEditType)'
      const whenRow = '[data-testid="win-inputedit"] .inped-f:has(#inpEditAllday)'
      const area = [typeRow, '[data-testid="win-inputedit"] .inped-f:has(#inpEditRmk)']
      await P.locator(typeRow).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(300)
      await frame(w, 'q1-today', { marks: [typeRow], around: area, label: 'Today: an Other has no choice of where it goes (it lands on the Ground Programme)' })
      /* DRAWN A: a "Goes to" row under Type — two buttons in the Duration buttons' own classes, Unavailable picked, a grey
         line under it that follows the pick */
      const addGoes = (pick) => P.evaluate(({ typeRow, pick }) => {
        document.querySelectorAll('[data-drawn^="q1"]').forEach(e => e.remove())
        const tr = document.querySelector(typeRow)
        const row = document.createElement('div'); row.className = 'inped-f'; row.dataset.drawn = 'q1-goes'
        const lines = { g: 'Still counted in the Leave War’s manning', u: 'Counted as away on the Leave War' }
        row.innerHTML = '<span class="inped-k">Goes to</span><div style="display:grid;gap:4px;min-width:0"><div class="spanpick" role="group" aria-label="Goes to">'
          + `<button type="button" class="spanbtn${pick === 'g' ? ' on' : ''}" aria-pressed="${pick === 'g'}">Ground Programme</button>`
          + `<button type="button" class="spanbtn${pick === 'u' ? ' on' : ''}" aria-pressed="${pick === 'u'}">Unavailable</button></div>`
          + `<span class="inped-hint" style="color:var(--mut,#8b97a5);font-size:12px">${lines[pick]}</span></div>`
        tr.after(row)
        /* his D1367: the two buttons wear the schedule's own colours for those lists (04-pucks-sections.css — Ground
           Programme #E5A83B, Unavailable #F0555F); at rest grey with the words in the colour, the picked one solid with dark
           words, as the lit Approve and Refuse (D1361) */
        const col = ['229,168,59', '240,85,95']
        row.querySelectorAll('.spanbtn').forEach((btn, i) => {
          const on = btn.classList.contains('on')
          Object.assign(btn.style, on
            ? { background: `rgb(${col[i]})`, color: '#0b1116', borderColor: `rgb(${col[i]})` }
            : { background: 'rgba(255,255,255,.04)', color: `rgb(${col[i]})`, borderColor: 'rgba(255,255,255,.12)' })
        })
        return row.getBoundingClientRect().height
      }, { typeRow, pick })
      const goesOk = () => P.evaluate(() => document.querySelector('[data-drawn="q1-goes"]') ? null : 'the drawn row is gone')
      for (const pick of ['u', 'g']) {
        const h = await addGoes(pick)
        note('q1', size, `drawn A (${pick}): the row is ${Math.round(h)} tall`)
        await frame(w, `q1-a-${pick === 'u' ? 'unavail' : 'ground'}`, { marks: ['[data-drawn="q1-goes"]'], around: area, check: goesOk,
          label: pick === 'u' ? 'Drawn A, your colours: "Goes to", Unavailable picked (red) — the grey line says what the Leave War does' : 'Drawn A, your colours: Ground Programme picked (amber) — the line follows the pick' })
      }
      /* DRAWN B: his tick alone — a clone of the window's "all day" tick, on its own row */
      const addTick = (withGoes) => P.evaluate(({ typeRow, whenRow, withGoes }) => {
        document.querySelectorAll('[data-drawn="q1-tick"]').forEach(e => e.remove())
        if (!withGoes) document.querySelectorAll('[data-drawn="q1-goes"]').forEach(e => e.remove())
        const model = document.querySelector(`${whenRow} label.inped-ad`)
        const row = document.createElement('div'); row.className = 'inped-f'; row.dataset.drawn = 'q1-tick'
        const k = document.createElement('span'); k.className = 'inped-k'; k.textContent = 'Leave War'
        const t = model.cloneNode(true); t.removeAttribute('id'); const cb = t.querySelector('input'); cb.removeAttribute('id'); cb.checked = true
        for (const n of [...t.childNodes]) if (n.nodeType === 3) n.remove()
        t.append(' War manning reduced')
        row.append(k, t)
        ;(document.querySelector('[data-drawn="q1-goes"]') || document.querySelector(typeRow)).after(row)
        return row.getBoundingClientRect().height
      }, { typeRow, whenRow, withGoes })
      await addTick(false)
      await frame(w, 'q1-b-tick', { marks: ['[data-drawn="q1-tick"]'], around: area, check: () => P.evaluate(() => document.querySelector('[data-drawn="q1-tick"]') ? null : 'gone'),
        label: 'Drawn B: your tick as the only control — it says the war\'s effect, not that it goes under Unavailable' })
      await addGoes('g'); await addTick(true)
      await frame(w, 'q1-b2-clash', { marks: ['[data-drawn="q1-goes"]', '[data-drawn="q1-tick"]'], around: area, check: () => P.evaluate(() => document.querySelector('[data-drawn="q1-tick"]') && document.querySelector('[data-drawn="q1-goes"]') ? null : 'gone'),
        label: 'Drawn: the tick beside the choice can disagree — Ground Programme, yet "manning reduced"' })
      await P.evaluate(() => document.querySelectorAll('[data-drawn^="q1"]').forEach(e => e.remove()))
    })
    if (w.errs.length) note('q1-errors', size, w.errs.slice(0, 6).join(' || '))
    await w.ctx.close()
  }

  /* ================= Q1n — "can make it nicer" (his /impeccable, 25 Oct 26): the Goes to choice redrawn =================
     A is the drawing he saw (solid, the Duration buttons' capitals). B (recommended): the window's own picked look — a tint
     of the colour with an edge of it, as the Duration buttons show a pick in blue (14-input-editors.css .spanbtn.on) — in
     amber or red, the words in ordinary letters, the unpicked one's words in its colour. C: solid as A, ordinary letters.
     Same 36px height as the Duration buttons; the grey line kept. Contrast of the words on each button measured. */
  if (SETS.includes('q1n')) {
    const w = await fresh(); const P = w.page
    await sc('q1n', w, async () => {
      await newInputWindow(w, 'Drifter', 'Other')
      await P.locator('#inpEditRmk').fill('Under investigation')
      if (!(await P.evaluate(() => document.querySelector('#inpEditAllday').checked))) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(300) }
      const typeRow = '[data-testid="win-inputedit"] .inped-f:has(#inpEditType)'
      const area = [typeRow, '[data-testid="win-inputedit"] .inped-f:has(#inpEditAllday)']
      await P.locator(typeRow).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(300)
      const draw = (look, pick) => P.evaluate(({ typeRow, look, pick }) => {
        document.querySelectorAll('[data-drawn^="q1"]').forEach(e => e.remove())
        const tr = document.querySelector(typeRow)
        const row = document.createElement('div'); row.className = 'inped-f'; row.dataset.drawn = 'q1-goes'
        const lines = { g: 'Still counted in the Leave War’s manning', u: 'Counted as away on the Leave War' }
        row.innerHTML = '<span class="inped-k">Goes to</span><div style="display:grid;gap:4px;min-width:0"><div class="spanpick" role="group" aria-label="Goes to">'
          + `<button type="button" class="spanbtn${pick === 'g' ? ' on' : ''}" aria-pressed="${pick === 'g'}">Ground Programme</button>`
          + `<button type="button" class="spanbtn${pick === 'u' ? ' on' : ''}" aria-pressed="${pick === 'u'}">Unavailable</button></div>`
          + `<span class="inped-hint" style="color:var(--mut,#8b97a5);font-size:12px">${lines[pick]}</span></div>`
        tr.after(row)
        const col = ['229,168,59', '240,85,95'], hi = ['#F0BE5E', '#F57C85']
        const btns = [...row.querySelectorAll('.spanbtn')]
        btns.forEach((btn, i) => {
          const on = btn.classList.contains('on')
          const type = look === 'A' ? {} : { textTransform: 'none', letterSpacing: '0', fontFamily: "'Inter Tight', 'Segoe UI', system-ui, sans-serif", fontSize: '14px', fontWeight: on ? '700' : '600' }
          let paint
          if (look === 'B') paint = on ? { background: `rgba(${col[i]},.18)`, borderColor: `rgba(${col[i]},.7)`, color: hi[i] } : { background: 'var(--panel-2)', borderColor: 'var(--edge)', color: `rgba(${col[i]},.8)` }
          else paint = on ? { background: `rgb(${col[i]})`, borderColor: `rgb(${col[i]})`, color: '#0b1116' } : { background: 'rgba(255,255,255,.04)', color: `rgb(${col[i]})`, borderColor: 'rgba(255,255,255,.12)' }
          Object.assign(btn.style, type, paint)
        })
        /* the picked one owns both its edges (the window's own rule for .spanbtn.on + .spanbtn) */
        if (pick === 'g') btns[1].style.borderLeftColor = btns[0].style.borderColor
        /* contrast of each button's words on its own fill, over the window behind it */
        const rgb = s => (s.match(/[d.]+/g) || []).map(Number)
        const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
        const L = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
        const under = rgb(getComputedStyle(row.closest('.win') || document.querySelector('[data-testid="win-inputedit"]')).backgroundColor)
        const mix = (top, bot) => { const a = top.length > 3 ? top[3] : 1; return [0, 1, 2].map(k => top[k] * a + bot[k] * (1 - a)) }
        const out = btns.map(b => { const cs = getComputedStyle(b); const fill = mix(rgb(cs.backgroundColor), under.length >= 3 ? under : [22, 27, 34]); const ink = mix(rgb(cs.color), fill); const x = L(ink), y = L(fill); return { text: b.textContent, on: b.classList.contains('on'), ratio: Math.round((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) * 10) / 10, h: Math.round(b.getBoundingClientRect().height), overflow: b.scrollWidth > b.clientWidth } })
        return out
      }, { typeRow, look, pick })
      const ok = () => P.evaluate(() => document.querySelector('[data-drawn="q1-goes"]') ? null : 'gone')
      for (const [look, pick, label] of [
        ['B', 'u', 'Drawn B: a tint of the colour and its edge, as the window shows a pick; ordinary letters. Unavailable picked'],
        ['B', 'g', 'Drawn B: Ground Programme picked'],
        ['C', 'u', 'Drawn C (recommended): solid as before, ordinary letters. Unavailable picked'],
        ['C', 'g', 'Drawn C: Ground Programme picked'],
      ]) {
        const m = await draw(look, pick)
        note('q1n', size, `${look}/${pick}: ${JSON.stringify(m)}`)
        measures.push({ size, set: 'q1n', look, pick, buttons: m })
        await frame(w, `q1n-${look.toLowerCase()}-${pick === 'u' ? 'unavail' : 'ground'}`, { marks: ['[data-drawn="q1-goes"]'], around: area, check: ok, label })
      }
    })
    if (w.errs.length) note('q1n-errors', size, w.errs.slice(0, 6).join(' || '))
    await w.ctx.close()
  }

  /* ================= Q2 — a course under Unavailable ================= */
  if (SETS.includes('q2')) {
    const DAY = '2026-07-16', DI = 3
    const w = await fresh(); const P = w.page
    await sc('q2', w, async () => {
      const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
      await newInputWindow(w, 'Drifter', 'CSE')
      const kindsOffered = await P.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value))
      note('q2', size, 'the course kind picked; window rows: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · ')))
      if (!kindsOffered.includes('CSE')) throw new Error('no CSE kind: ' + kindsOffered.join(','))
      await P.locator('#inpEditRmk').fill('Instructor course')
      await L.press(w, `[data-testid="inpEdCal-day-${DAY}"]`); await P.waitForTimeout(500)
      await L.press(w, '#inpEditSave'); await P.waitForTimeout(1000)
      await answerAsks(w, 'q2')
      const rec = await P.evaluate(who => (window.INPUTS || []).filter(r => r.type === 'CSE' && (r.people || []).some(x => x.p === who)).map(r => ({ iid: r.iid, date: r.date, acc: r.acc, ground: r.ground })), who)
      note('q2', size, 'filed: ' + JSON.stringify(rec))
      if (rec.length !== 1) throw new Error('the course did not land once: ' + JSON.stringify(rec))
      const iid = rec[0].iid
      await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
      const D = dayScope('editsched', DI)
      await P.waitForSelector(D, { timeout: 8000 })
      if (await L.vis(P, `${D} [data-pitog="${DI}"]`)) { await L.press(w, `${D} [data-pitog="${DI}"]`); await P.waitForTimeout(700) }
      const g = await tagRow(P, D, 'sec-grnd', 'data-qg', 'course|instructor|CSE')
      const u0 = await tagRow(P, D, 'sec-unav', 'data-qu0', 'course|instructor|CSE')
      const p = await tagRow(P, D, 'sec-inp', 'data-qp', 'course|instructor|CSE')
      note('q2', size, `today — Ground Programme: ${JSON.stringify(g)} · Unavailable: ${JSON.stringify(u0)} · Personal Inputs: ${JSON.stringify(p)}`)
      const where = g.text ? '[data-qg="1"]' : u0.text ? '[data-qu0="1"]' : null
      if (!where) throw new Error('the course is on neither list')
      const sec = g.text ? `${D} .sec-grnd` : `${D} .sec-unav`
      await centreOn(P, [where])
      await frame(w, 'q2-today', { marks: [where], around: [sec], pad: 6, label: g.text ? 'Today: a course lands on the Ground Programme, as something he is doing' : 'Today: a course lands under Unavailable' })
      if (!g.text) { note('q2', size, 'the course already lands under Unavailable — nothing to draw'); return }
      /* the schedule offers a course only Reject (then Accept back) — no "→ Unavail" (checked on this build): so the drawing
         moves the course's own Ground Programme row, whole, to the foot of the Unavailable list, the original hidden */
      const mv = await P.evaluate(D => {
        const row = document.querySelector('[data-qg="1"]'), list = [...document.querySelectorAll(`${D} .sec-unav .pl-row`)].pop()
        if (!row || !list) return null
        const c = row.cloneNode(true); c.removeAttribute('data-qg'); c.dataset.drawn = 'q2'
        list.after(c); row.style.display = 'none'
        return c.innerText.replace(/\s+/g, ' ').trim()
      }, D)
      note('q2', size, 'drawn: the course row under Unavailable reads ' + JSON.stringify(mv))
      if (!mv) throw new Error('could not move the row')
      await P.evaluate(() => document.querySelector('[data-drawn="q2"]').setAttribute('data-qu', '1'))
      await centreOn(P, ['[data-qu="1"]', `${D} .sec-unav`])
      await frame(w, 'q2-unavail', { marks: ['[data-qu="1"]'], around: [`${D} .sec-unav`], pad: 6, label: 'Drawn (recommended): a course lands under Unavailable by itself, as an overseas duty does', check: () => P.evaluate(() => document.querySelector('[data-drawn="q2"]') ? null : 'gone') })
    })
    if (w.errs.length) note('q2-errors', size, w.errs.slice(0, 6).join(' || '))
    await w.ctx.close()
  }
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}-${SETS.join('-')}.json`), JSON.stringify({ looks: LOOKS, log, pics, measures }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
