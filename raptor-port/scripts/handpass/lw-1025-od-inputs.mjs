// OD AND UNA, ON THE LEAVE WAR AND ON THE INPUTS PAGE (25 Oct 26) — his question: "can u show me the comparison of OD and
// UNA on leave war, and inputs" / "Can u show me how OD look like on inputs". Pictures of the REAL built bundle, each cut to
// its area, the OD marked with a dashed cyan box and a short label on the picture. "Today" pictures inject nothing but the
// mark and the label; the one "Drawn" picture paints UNA in grey (a) through the app's own colour recipe, exactly as
// lw-1025-una-grey.mjs draws it (--h 184,190,198, fill 1, dark words).
//   1. the Leave War today: Drifter 14–18 Dec — OD · whole-day UNA (teal) · refused LL · morning UNA · approved LL
//   2. the same, drawn: UNA in grey (a) beside the OD's slate
//   3. the Inputs calendar's month: the OD's bar on 14 Dec (and the approved LL's on 18 Dec) — no UNA (D1338)
//   4. the Inputs calendar's day opened: 14 Dec (the OD's entry) and 15 Dec (the whole-day UNA's day — nothing)
//   5. the Inputs list: the OD's row (desktop table) / card (phone)
// Each OD's colours measured as painted (fill over what it sits on, edge, words) and set against grey (a)'s.
// Fixtures through the app's own controls, as admin (Saber), on Drifter; each asserts it landed.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-od-inputs.mjs   [LW_PORT=4180] [SIZES=phone,desk]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/od-inputs'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-od-inputs', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

/* GREY (a) — lw-1025-una-grey.mjs's own: a light neutral grey box, dark words, through the kind recipe */
const GREY_A = { h: '184, 190, 198', ink: '#0b1116', fill: 1, name: 'light grey, dark words' }
const greyCss = g => `.c.k-una, .tchip.lv.k-una { --h: ${g.h} !important; --ink: ${g.ink} !important; --fill: ${g.fill} !important; }`
const setGrey = (P, on) => P.evaluate(css => {
  let st = document.getElementById('mock-una-grey')
  if (!css) { st?.remove(); return }
  if (!st) { st = document.createElement('style'); st.id = 'mock-una-grey'; document.head.appendChild(st) }
  st.textContent = css
}, on ? greyCss(GREY_A) : '')

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const measures = []

const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
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

/* THE MARK AND THE LABEL, then the picture cut to them (lw-1025-una-grey.mjs's frame(), unchanged) */
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
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* ---- colour arithmetic (lw-1025-una-grey.mjs's): what the eye gets, a box composited over what it sits on ---- */
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
/* any element as painted: its fill over the backgrounds behind it, its edge (inset shadow, else a drawn border), its words */
const rawOf = (P, sel) => P.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!el) return null
  const chain = []
  for (let e = el.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; chain.push(c); if (/^rgb\(/.test(c) || /rgba\([^)]*,\s*1\)$/.test(c)) break }
  const cs = getComputedStyle(el)
  return { chain, cls: String(el.className), text: el.textContent.trim().slice(0, 60), bg: cs.backgroundColor, color: cs.color, shadow: cs.boxShadow, border: parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none' ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : null, deco: cs.textDecorationLine }
}, sel)
function paintedEl(raw) {
  let under = { r: 0, g: 0, b: 0, a: 1 }
  for (const c of [...raw.chain].reverse()) { const p = parse(c); if (p && p.a > 0) under = over(p, under) }
  const fill = over(parse(raw.bg) || { r: 0, g: 0, b: 0, a: 0 }, under)
  const edgeRaw = (raw.shadow && raw.shadow !== 'none' && parse(raw.shadow)) || (raw.border && parse(raw.border))
  const edge = edgeRaw ? over(edgeRaw, fill) : null
  const words = over(parse(raw.color), fill)
  return { under: hex(under), fill: hex(fill), edge: edge ? hex(edge) : 'none', words: hex(words), contrast: Math.round(contrast(words, fill) * 10) / 10, struck: raw.deco.includes('line-through'), text: raw.text, cls: raw.cls, _fill: fill, _edge: edge || fill, _words: words, _under: under }
}
const clean = o => o && Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')))
const dE = (x, y) => Math.round(de2000(x, y) * 10) / 10
const cmp = (x, y) => ({ fillDE: dE(x._fill, y._fill), edgeDE: dE(x._edge, y._edge), wordsDE: dE(x._words, y._words) })

/* put a person's first day of interest just right of the frozen names, the row in the screen's middle (una-grey's own) */
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

/* a press on a date of the Inputs calendar — on its own space, never on a bar (a bar opens the input, not the day) */
async function pressDay(w, iso) {
  const P = w.page
  const pt = await P.evaluate(iso => {
    const c = document.querySelector(`[data-icday="${iso}"]`)
    if (!c) return null
    c.scrollIntoView({ block: 'center' })
    const r = c.getBoundingClientRect()
    for (let y = r.top + 3; y < r.bottom - 2; y += 3) for (const fx of [0.85, 0.5, 0.15]) { const x = r.left + r.width * fx; const e = document.elementFromPoint(x, y); if (e && e.closest('[data-icday]') === c) return { x, y } }
    return null
  }, iso)
  if (!pt) throw new Error(`no free point on the date ${iso}`)
  if (w.phone) await L.finger(w, pt.x, pt.y)
  else await P.mouse.click(pt.x, pt.y)
  await P.waitForTimeout(600)
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
  const days = { od: '2026-12-14', una: '2026-12-15', ref: '2026-12-16', unaAm: '2026-12-17', ll: '2026-12-18' }
  const M = { size }

  /* ============ the five days on the Leave War, then pictures 1 and 2 ============ */
  let fixtures = false
  await sc('leavewar', async () => {
    for (const d of Object.values(days)) { const k = await kinds(w, who, d); if (k.length) throw new Error(`${d} is not empty: ${JSON.stringify(k)}`) }
    await L.openCellR(w, who, days.od); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
    await L.openCellR(w, who, days.una); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    await placeLL(w, who, days.ref, { approve: false })
    await L.openCellR(w, who, days.ref); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500); await L.closeAny(w)
    await L.openCellR(w, who, days.unaAm); await L.press(w, T('portion-am')); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    await placeLL(w, who, days.ll, { approve: true })
    await L.closeAny(w)
    const got = {}
    for (const [k, d] of Object.entries(days)) got[k] = await kinds(w, who, d)
    note('leavewar', size, 'the five days: ' + JSON.stringify(got))
    const want = { od: /k-od\|s-a\|whole/, una: /k-una\|s-a\|whole/, ref: /k-ll\|s-r/, unaAm: /k-una\|s-a\|top/, ll: /k-ll\|s-a\|whole/ }
    for (const [k, re] of Object.entries(want)) if (!got[k].some(x => re.test(x))) throw new Error(`${k} (${days[k]}) did not land: ${JSON.stringify(got[k])}`)
    fixtures = true
    await P.waitForTimeout(6500)   // the just-added ring gone before the pictures
    const besideNames = await alignGrid(P, who, days.od)
    const cells = Object.values(days).map(d => T(L.cellId(who, d)))
    const nameCell = await P.evaluate(([who, iso]) => { document.querySelectorAll('[data-qname]').forEach(e => e.removeAttribute('data-qname')); const r = document.querySelector(`[data-testid="cell-${who}-${iso}"]`).getBoundingClientRect(); const e = document.elementFromPoint(30, r.top + r.height / 2)?.closest('td.who'); if (!e) return null; e.dataset.qname = '1'; return '[data-qname="1"]' }, [who, days.od])
    if (!nameCell) throw new Error('no name drawn beside the row')
    const around = besideNames ? [nameCell, ...cells] : [T(L.cellId(who, '2026-12-13')), ...cells, T(L.cellId(who, '2026-12-19'))]
    const marks = [T(L.cellId(who, days.od)), T(L.cellId(who, days.una)), T(L.cellId(who, days.unaAm))]
    const boxSel = iso => `[data-testid="cell-${who}-${iso}"] .c`
    await setGrey(P, false)
    const odLw = paintedEl(await rawOf(P, boxSel(days.od))), unaTeal = paintedEl(await rawOf(P, boxSel(days.una))), refLw = paintedEl(await rawOf(P, boxSel(days.ref)))
    M.lwOD = odLw; M.lwUNAteal = unaTeal; M.lwRefused = refLw
    note('leavewar', size, `OD fill ${odLw.fill} edge ${odLw.edge} words ${odLw.words} (${odLw.contrast}:1) · UNA teal fill ${unaTeal.fill} edge ${unaTeal.edge} words ${unaTeal.words} · ΔE OD–UNA teal ${dE(odLw._fill, unaTeal._fill)}`)
    await frame(w, '1-leavewar-today', { marks, around, label: 'Today, Drifter 14–18 Dec: OD (slate) · UNA (teal) · refused LL · UNA morning · LL — the OD and the UNAs boxed', pad: 6 })
    await setGrey(P, true); await P.waitForTimeout(150)
    const unaGrey = paintedEl(await rawOf(P, boxSel(days.una))), unaAmGrey = paintedEl(await rawOf(P, boxSel(days.unaAm)))
    if (!/184,\s*190,\s*198/.test((await rawOf(P, boxSel(days.una))).bg)) throw new Error('the grey is not on the UNA box')
    M.lwUNAgreyA = unaGrey; M.lwUNAamGreyA = unaAmGrey
    note('leavewar', size, `grey (a) UNA fill ${unaGrey.fill} edge ${unaGrey.edge} words ${unaGrey.words} (${unaGrey.contrast}:1) · ΔE OD–grey(a) fill ${dE(odLw._fill, unaGrey._fill)}, edge ${dE(odLw._edge, unaGrey._edge)}, words ${dE(odLw._words, unaGrey._words)} · ΔE grey(a)–refused fill ${dE(unaGrey._fill, refLw._fill)}`)
    await frame(w, '2-leavewar-drawn-grey-a', { marks, around, label: `Drawn: UNA in grey (a) — the OD's slate ${odLw.fill} beside the grey UNA ${unaGrey.fill}`, pad: 6,
      check: async () => /184,\s*190,\s*198/.test((await rawOf(P, boxSel(days.una))).bg) ? null : 'the grey is gone' })
    await setGrey(P, false)
  })

  /* ============ the Inputs page: the calendar's month ============ */
  let odKey = null
  await sc('inputs-cal', async () => {
    if (!fixtures) throw new Error('the Leave War fixtures did not land')
    await P.evaluate(() => window.scrollTo(0, 0))
    await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
    if (await L.vis(P, '#inCalBtn') && (await P.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') { await L.press(w, '#inCalBtn'); await P.waitForTimeout(600) }
    await P.waitForSelector(T('ib-grid'), { timeout: 5000 })
    for (let i = 0; i < 14; i++) {
      const mon = await P.evaluate(() => document.querySelector('.ic-mon')?.getAttribute('aria-label'))
      if (/December 2026/.test(mon || '')) break
      await L.press(w, '#icNext'); await P.waitForTimeout(400)
    }
    const mon = await P.evaluate(() => document.querySelector('.ic-mon')?.getAttribute('aria-label'))
    if (!/December 2026/.test(mon || '')) throw new Error('the calendar did not reach December 2026: ' + mon)
    /* every bar over 14–18 Dec, and which are Drifter's */
    const wk = await P.evaluate(days => {
      const cell = document.querySelector(`[data-icday="${days.od}"]`)
      const week = cell?.closest('.ib-week')
      if (!week) return null
      const bars = [...week.querySelectorAll('.ib-bar')].map(b => ({ key: b.dataset.iid, cls: b.className, text: b.textContent.trim(), title: b.getAttribute('title') || '' }))
      return { week: week.dataset.testid, bars }
    }, days)
    if (!wk) throw new Error('no week holds 14 Dec')
    note('inputs-cal', size, `${wk.week}: ${wk.bars.length} bars — ${wk.bars.map(b => `[${b.text} | ${b.cls.replace(/\bib-bar\b\s*/, '')} | ${b.title.slice(0, 70)}]`).join(' ')}`)
    const dr = wk.bars.filter(b => /Drifter/.test(b.title + ' ' + b.text))
    const od = dr.find(b => /\bk-od\b/.test(b.cls))
    if (!od) throw new Error('no OD bar of Drifter in that week: ' + JSON.stringify(dr))
    odKey = od.key
    const ll = dr.find(b => /\bk-ll\b/.test(b.cls))
    note('inputs-cal', size, `Drifter's bars: ${dr.map(b => b.text + ' (' + (b.cls.match(/k-\w+/) || ['?'])[0] + ')').join(', ')} · his approved LL ${ll ? 'shown' : 'NOT shown'} · a UNA bar of his: ${dr.some(b => /una/i.test(b.cls + b.text + b.title)) ? 'SHOWN (wrong)' : 'none, as ruled'}`)
    const barSel = `[data-testid="ib-bar-${odKey}"]`
    const odIn = paintedEl(await rawOf(P, barSel))
    M.inCalOD = odIn
    if (ll) M.inCalLL = paintedEl(await rawOf(P, `[data-testid="ib-bar-${ll.key}"]`))
    note('inputs-cal', size, `OD bar: words "${odIn.text}" fill ${odIn.fill} edge ${odIn.edge} words ${odIn.words} (${odIn.contrast}:1) over ${odIn.under}`)
    await P.locator(barSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(250)
    await frame(w, '3-inputs-calendar', { marks: [barSel], around: [`[data-testid="${wk.week}"]`], label: 'Today: an overseas duty on the Inputs calendar — UNA is never shown here', pad: 6 })
  })

  /* ============ the Inputs calendar's day opened: 14 Dec, then 15 Dec ============ */
  await sc('inputs-day', async () => {
    if (!odKey) throw new Error('no OD bar found on the calendar')
    await pressDay(w, days.od)
    await P.waitForSelector(T('win-inputsday'), { timeout: 5000 })
    await P.waitForTimeout(500)
    const d14 = await P.evaluate(() => {
      const win = document.querySelector('[data-testid="win-inputsday"]')
      document.querySelectorAll('[data-qod]').forEach(e => e.removeAttribute('data-qod'))
      const cards = [...win.querySelectorAll('.icard')]
      const od = cards.find(c => /Drifter/.test(c.querySelector('.icard-who')?.textContent || '') && /^(OD|overseas)/i.test((c.querySelector('.icard-kind')?.textContent || '').trim()))
      if (od) od.dataset.qod = '1'
      return { title: win.querySelector('.fw-title, h2, header')?.textContent?.trim() || '', cards: cards.map(c => c.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)), found: !!od }
    })
    note('inputs-day', size, `14 Dec opened: ${d14.cards.length} cards — ${d14.cards.join(' || ')}`)
    if (!d14.found) throw new Error('no OD card of Drifter in the opened day')
    const card = paintedEl(await rawOf(P, '[data-qod="1"]')), sq = paintedEl(await rawOf(P, '[data-qod="1"] .icard-sq')), kindW = paintedEl(await rawOf(P, '[data-qod="1"] .icard-kind'))
    M.inDayCard = card; M.inDaySquare = sq; M.inDayKindWords = kindW
    note('inputs-day', size, `the OD card: box ${card.fill} edge ${card.edge} · its small square ${sq.fill} · kind words "${kindW.text}" ${kindW.words} (${kindW.contrast}:1)`)
    await P.locator('[data-qod="1"]').first().evaluate(e => e.scrollIntoView({ block: 'nearest' })); await P.waitForTimeout(200)
    /* cut from the window's bar (its date) to the card — a phone's day stands nearly full height, and a label over its bar
       hid the date */
    await frame(w, '4a-inputs-day-14dec', { marks: ['[data-qod="1"]'], around: [`${T('win-inputsday')} .win-bar`], label: 'Today: 14 Dec opened on the Inputs calendar — Drifter\'s overseas duty, boxed', pad: 6 })
    /* 15 Dec — the day of his whole-day UNA */
    await P.keyboard.press('Escape'); await P.waitForTimeout(400)
    if (await L.vis(P, T('win-inputsday'))) note('inputs-day', size, 'Escape left the day open; pressing 15 Dec over it')
    await pressDay(w, days.una)
    await P.waitForSelector(T('win-inputsday'), { timeout: 5000 })
    await P.waitForTimeout(500)
    const d15 = await P.evaluate(() => {
      const win = document.querySelector('[data-testid="win-inputsday"]')
      const cards = [...win.querySelectorAll('.icard')]
      return { head: win.innerText.split('\n').slice(0, 2).join(' | '), cards: cards.map(c => c.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)), empty: win.querySelector('[data-testid="idy-empty"]')?.textContent?.trim() || null, drifter: cards.some(c => /Drifter/.test(c.textContent)), una: /\bUNA\b/.test(win.innerText) }
    })
    note('inputs-day', size, `15 Dec opened: head "${d15.head}" · ${d15.cards.length} cards ${d15.cards.join(' || ')} · empty line: ${d15.empty} · a Drifter card: ${d15.drifter} · the word UNA anywhere: ${d15.una}`)
    if (d15.drifter || d15.una) throw new Error('15 Dec shows Drifter or a UNA — not as ruled: ' + JSON.stringify(d15))
    if (!/15/.test(d15.head)) throw new Error('the day window is not on 15 Dec: ' + d15.head)
    await frame(w, '4b-inputs-day-15dec', { marks: [T('idy-empty')], around: [`${T('win-inputsday')} .win-bar`], label: 'Today: 15 Dec opened — Drifter\'s whole-day UNA is not on the Inputs page (UNA lives on the Leave War only)', pad: 6 })
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  })

  /* ============ the Inputs list ============ */
  await sc('inputs-list', async () => {
    if (!fixtures) throw new Error('the Leave War fixtures did not land')
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.press(w, '#inListBtn'); await P.waitForTimeout(700)
    await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400)
    await L.press(w, '#inRangeAll'); await P.waitForTimeout(700)
    const row = await P.evaluate(phone => {
      document.querySelectorAll('[data-qod]').forEach(e => e.removeAttribute('data-qod'))
      const rows = phone ? [...document.querySelectorAll('#inList .icard')] : [...document.querySelectorAll('#intbl tbody tr')]
      /* a phone's card carries no date — its day heading above it does */
      const dayOf = r => { if (!phone) return r.innerText; for (let e = r.previousElementSibling; e; e = e.previousElementSibling) if (e.dataset.testid === 'inl-day') return e.dataset.iso === '2026-12-14' ? '14 Dec' : ''; return '' }
      const mine = rows.filter(r => /Drifter/.test(r.innerText) && /14 Dec/.test(dayOf(r)))
      const od = mine.find(r => phone ? /^(OD|overseas)/i.test((r.querySelector('.icard-kind')?.textContent || '').trim()) : /(^|\s)(OD|Overseas)(\s|$)/i.test(r.innerText))
      if (!od) return { mine: mine.map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 120)) }
      od.dataset.qod = '1'
      const prev = phone ? od.previousElementSibling : od.previousElementSibling, next = od.nextElementSibling
      if (prev) prev.dataset.qod = 'p'; if (next) next.dataset.qod = 'n'
      od.scrollIntoView({ block: 'center' })
      const pills = [...od.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e); return c.backgroundColor !== 'rgba(0, 0, 0, 0)' && e.getBoundingClientRect().width > 0 }).map(e => e.className)
      return { text: od.innerText.replace(/\s+/g, ' ').slice(0, 160), pills, prev: !!prev, next: !!next, una: rows.some(r => /Drifter/.test(r.innerText) && /(^|\s)UNA(\s|$)/.test(r.innerText)) }
    }, w.phone)
    if (!row.text) throw new Error('no OD row of Drifter on 14 Dec in the list: ' + JSON.stringify(row))
    note('inputs-list', size, `the OD's ${w.phone ? 'card' : 'row'}: "${row.text}" · coloured parts: ${row.pills.join(', ') || 'none'} · a UNA of Drifter in the list: ${row.una}`)
    await P.waitForTimeout(300)
    if (w.phone) {
      const card = paintedEl(await rawOf(P, '[data-qod="1"]')), sq = paintedEl(await rawOf(P, '[data-qod="1"] .icard-sq')), kindW = paintedEl(await rawOf(P, '[data-qod="1"] .icard-kind'))
      M.inListCard = card; M.inListSquare = sq; M.inListKindWords = kindW
      note('inputs-list', size, `card box ${card.fill} edge ${card.edge} · square ${sq.fill} · kind words "${kindW.text}" ${kindW.words}`)
    } else {
      const tr = paintedEl(await rawOf(P, '[data-qod="1"] td'))
      M.inListRow = tr
      /* the coloured edge down the row's left — whichever of the row and its first cell draws it */
      const stripe = await P.evaluate(() => { const r = document.querySelector('[data-qod="1"]'); return [r, r.firstElementChild].map(e => { const c = getComputedStyle(e); const b = getComputedStyle(e, '::before'); return { el: e.tagName + '.' + e.className, borderLeft: `${c.borderLeftWidth} ${c.borderLeftStyle} ${c.borderLeftColor}`, shadow: c.boxShadow, before: b.content === 'none' ? null : `${b.width} ${b.backgroundColor}` } }) })
      M.inListStripe = stripe
      note('inputs-list', size, `the row's left edge: ${JSON.stringify(stripe)}`)
      const tag = await rawOf(P, '[data-qod="1"] .intag')
      if (tag) { M.inListTag = paintedEl(tag); note('inputs-list', size, `row ${tr.fill} words ${tr.words} · type pill "${M.inListTag.text}" fill ${M.inListTag.fill} edge ${M.inListTag.edge} words ${M.inListTag.words}`) }
      else note('inputs-list', size, `row ${tr.fill} words ${tr.words} · no type pill`)
    }
    const around = ['[data-qod="1"]']
    if (row.prev) around.push('[data-qod="p"]'); if (row.next) around.push('[data-qod="n"]')
    if (w.phone) { const dh = await P.evaluate(() => { const h = [...document.querySelectorAll('[data-testid="inl-day"]')].find(e => e.dataset.iso === '2026-12-14'); if (!h) return false; h.dataset.qodh = '1'; return true }); if (dh) around.push('[data-qodh="1"]') }
    await frame(w, '5-inputs-list', { marks: ['[data-qod="1"]'], around, label: 'Today: the Inputs list — Drifter\'s overseas duty on 14 Dec, boxed', pad: 6 })
  })

  /* the comparisons that answer "do they read apart" */
  const pairs = {}
  const pr = (a, b) => (M[a] && M[b]) ? (pairs[`${a}_vs_${b}`] = cmp(M[a], M[b])) : null
  pr('lwOD', 'lwUNAgreyA'); pr('lwOD', 'lwUNAteal'); pr('lwUNAgreyA', 'lwRefused'); pr('inCalOD', 'lwUNAgreyA'); pr('inCalOD', 'lwOD'); pr('inCalOD', 'inCalLL')
  note('compare', size, JSON.stringify(pairs))
  measures.push({ size, ...Object.fromEntries(Object.entries(M).map(([k, v]) => [k, typeof v === 'object' ? clean(v) : v])), pairs })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ greyA: GREY_A, log, pics, measures }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
