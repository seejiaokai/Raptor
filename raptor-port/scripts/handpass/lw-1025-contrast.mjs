// THE LIT APPROVE / REFUSE, DRAWN STRONGER (25 Oct 26 — his D1348, with D1355): three options for how a lit Approve or
// Refuse — the entry's STATE — stands out from the unlit buttons beside it, drawn on the built bundle.
//   Today: an approved leave's one-day window (Approve lit as built), a refused bid's (nothing lit), the day's list of a
//   day holding an approved morning and a refused afternoon.
//   A — solid: the lit button filled solid in its own colour, words dark, edge the same colour; the rest unchanged.
//   B — the rest step back: as A, and the OTHER decision button wears Move's grey (still pressable — only its colour goes).
//   C — the word says it: as A, and the lit button's word becomes the state, "✓ Approved" / "✕ Refused".
// In every refused drawing the refused leave's button wears the app's own lit ring (the `.lit` class an approved leave's
// button wears — D1355). "Today" pictures are real: nothing injected but the mark and the label. "Drawn" pictures change
// the app's own nodes in place (inline styles, the app's own class, the word) — the method:
// .claude/skills/brainstorming/mockups-on-the-real-app.md. Each window is closed and opened again between options, so
// one option's changes never survive into the next.
// Measured in the page for every picture: each decision button's fill composited on what really stands behind it (the
// window's own background, read from the page), its relative luminance, the luminance ratio between the lit fill and
// the unlit decision button beside it, and the words' contrast on the lit fill (WCAG).
// Fixtures through the app's own controls, on a fresh store; each asserts it landed. Copied from lw-r2r3-questions.mjs
// (its frame(), placeLL(), setSwitch(), kinds()).
// Usage (from raptor-port/): [LW_PORT=4180] [SIZES=phone,desk] [DL_OPTS=B,C] node scripts/handpass/lw-1025-contrast.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/contrast'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-contrast', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const DL_OPTS = (process.env.DL_OPTS || 'B,C').split(',').filter(Boolean)
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}.`))) unlinkSync(path.join(L.OUT, f))

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const measures = []

/* ---- the options' looks: exact values, written into the README ---- */
const GREEN = '#57C97A'   // rgba(87, 201, 122) — the Approve chip's own green, solid (bidpicker.css .dchip.approve)
const RED = '#F0555F'     // rgba(240, 85, 95) — the Refuse chip's own red, solid (the armed Delete's fill, .creset.cf-del.arm)
const INK = '#0b1116'     // dark words on the solid fill
const SOLID = { approve: { background: GREEN, color: INK, borderColor: GREEN }, refuse: { background: RED, color: INK, borderColor: RED } }
const WORD = { approve: '✓ Approved', refuse: '✕ Refused' }

const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
/* the passing notes never in a picture */
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important; }' })
const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'

/* a leave placed through the one-day window, the switch as asked; asserts it landed */
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

/* ---- the measure: each button's fill composited on what stands behind it, its words on that fill ---- */
const readRow = (P, sels) => P.evaluate(sels => {
  const parse = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } }
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 })
  const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  /* what really stands behind an element: its ancestors' backgrounds, composited from the first opaque one up */
  const backdrop = el => {
    const layers = []; const imgs = []
    for (let e = el.parentElement; e; e = e.parentElement) {
      const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') imgs.push(`${e.className || e.tagName}: ${cs.backgroundImage.slice(0, 60)}`)
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push({ c, who: (e.dataset?.testid || e.className || e.tagName).toString().slice(0, 40) }); if (c.a >= 1) break }
    }
    let base = { r: 0, g: 0, b: 0, a: 1 }
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i].c, base)
    return { c: base, layers: layers.map(l => `${l.who} rgba(${l.c.r},${l.c.g},${l.c.b},${l.c.a})`), imgs }
  }
  return sels.map(sel => {
    const el = document.querySelector(sel); if (!el) return { sel, missing: true }
    const cs = getComputedStyle(el)
    const bd = backdrop(el)
    const fill = over(parse(cs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 }, bd.c)
    const ink = over(parse(cs.color), fill)
    const rg = document.createRange(); rg.selectNodeContents(el)
    const textW = rg.getBoundingClientRect().width
    const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    return { sel, text: el.textContent.trim(), cls: el.className, raw: { bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, weight: cs.fontWeight }, backdrop: hex(bd.c), backdropLayers: bd.layers, backdropImgs: bd.imgs, fill: hex(fill), ink: hex(ink), w: Math.round(el.getBoundingClientRect().width * 10) / 10, h: Math.round(el.getBoundingClientRect().height * 10) / 10, textW: Math.round(textW * 10) / 10, avail: Math.round(avail * 10) / 10, cut: el.scrollWidth > el.clientWidth }
  })
}, sels)
const lum = h => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100 }
const r3 = x => Math.round(x * 1000) / 1000
/* one row of the README's measure table: the lit button against the unlit decision button beside it */
async function measure(w, id, { lit, other, move }) {
  const [L1, O, M] = await readRow(w.page, [lit, other, move])
  if (L1.missing || O.missing) throw new Error(`${id}: a button to measure is missing`)
  const m = { id, size: w.size, backdrop: L1.backdrop, backdropLayers: L1.backdropLayers, backdropImgs: L1.backdropImgs,
    lit: { text: L1.text, fill: L1.fill, L: r3(lum(L1.fill)), ink: L1.ink, raw: L1.raw, w: L1.w, h: L1.h, textW: L1.textW, avail: L1.avail, cut: L1.cut },
    other: { text: O.text, fill: O.fill, L: r3(lum(O.fill)), raw: O.raw, h: O.h },
    move: M && !M.missing ? { fill: M.fill, L: r3(lum(M.fill)), h: M.h } : null,
    litVsOther: ratio(L1.fill, O.fill), wordsOnLit: ratio(L1.ink, L1.fill) }
  measures.push(m)
  note(id, w.size, `lit "${m.lit.text}" fill ${m.lit.fill} (L ${m.lit.L}) vs "${m.other.text}" ${m.other.fill} (L ${m.other.L}) → ${m.litVsOther}:1; words ${m.lit.ink} on lit ${m.wordsOnLit}:1; behind: ${m.backdrop}; text ${m.lit.textW}/${m.lit.avail} px${m.lit.cut ? ' CUT' : ''}; heights ${m.lit.h}/${m.other.h}/${m.move?.h}`)
  return m
}

/* ---- drawing an option on the open window (or a list entry) ---- */
/* `nodes`: { lit, other, move, ring } selectors; `state`: 'approve' | 'refuse' (which button is lit) */
const draw = (P, opt, state, nodes, wide = false) => P.evaluate(({ opt, state, nodes, SOLID, WORD, wide }) => {
  const lit = document.querySelector(nodes.lit), other = document.querySelector(nodes.other), move = document.querySelector(nodes.move)
  if (!lit || !other) return 'a button to draw is missing'
  lit.classList.add('lit'); lit.dataset.drawn = `${opt}-lit`
  Object.assign(lit.style, SOLID[state])
  if (opt === 'B') {
    if (!move) return 'no Move to copy the grey from'
    const m = getComputedStyle(move)
    Object.assign(other.style, { background: m.backgroundColor, color: m.color, borderColor: m.borderTopColor, borderStyle: m.borderTopStyle, borderWidth: m.borderTopWidth })
    other.dataset.drawn = 'B-grey'
  }
  if (opt === 'C') {
    lit.textContent = WORD[state]
    /* letters a seventh wider, as an iPhone's may be: the same words, spread to 1.14 of their width */
    if (wide) { const rg = document.createRange(); rg.selectNodeContents(lit); const tw = rg.getBoundingClientRect().width; lit.style.letterSpacing = `calc(.04em + ${(0.14 * tw / WORD[state].length).toFixed(2)}px)`; lit.dataset.wide = '1' }
  }
  if (nodes.ring) { const r = document.querySelector(nodes.ring); if (!r) return 'no leave button to ring'; r.classList.add('lit'); r.dataset.drawn = 'ring' }
  return null
}, { opt, state, nodes, SOLID, WORD, wide })
const drawnCheck = (P, opt, nodes) => async () => P.evaluate(({ opt, nodes }) => {
  const lit = document.querySelector(nodes.lit)
  if (!lit || lit.dataset.drawn !== `${opt}-lit`) return 'the drawn lit button is gone'
  if (opt === 'B' && document.querySelector(nodes.other)?.dataset.drawn !== 'B-grey') return 'the grey other button is gone'
  if (nodes.ring && getComputedStyle(document.querySelector(nodes.ring)).outlineStyle !== 'solid') return 'the leave ring is not drawn'
  return null
}, { opt, nodes })

/* C's fit without its mark: the plain state word in the lit button, measured only (no picture) */
const fits = []
async function fitProbe(w, id, sel, word) {
  const r = await w.page.evaluate(([sel, word]) => {
    const el = document.querySelector(sel); if (!el) return null
    el.textContent = word
    const cs = getComputedStyle(el), rg = document.createRange(); rg.selectNodeContents(el)
    return { word, textW: Math.round(rg.getBoundingClientRect().width * 10) / 10, avail: Math.round((el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * 10) / 10, inner: el.clientWidth }
  }, [sel, word])
  if (!r) throw new Error(id + ': nothing to probe')
  r.wide = Math.round(r.textW * 1.14 * 10) / 10
  fits.push({ id, size: w.size, ...r })
  note(id, w.size, `fit "${word}": ${r.textW} px (a seventh wider ${r.wide}) in ${r.avail} px between the padding, ${r.inner} px inside the edge`)
}

const LABEL = {
  A: { approve: 'Drawn A: Approve lit solid green, dark words', refuse: 'Drawn A: Refuse lit solid red, dark words; LL ringed' },
  B: { approve: 'Drawn B: Approve lit solid; Refuse grey like Move', refuse: 'Drawn B: Refuse lit solid; Approve grey like Move; LL ringed' },
  C: { approve: 'Drawn C: lit solid, the word reads “✓ Approved”', refuse: 'Drawn C: lit solid, the word reads “✕ Refused”; LL ringed' },
}

for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  await L.signIn(w, 'admin'); await hideTransient(P)
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  console.log(size, 'Drifter =', who)
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 300)); await L.closeAny(w); await P.keyboard.press('Escape').catch(() => {}) } }
  const WIN = { marks: [T('bid-actions'), T('bid-leave-grid')], around: [T('bid-picker')] }
  const reopen = async (iso, want = 'bid-picker') => { await L.closeAny(w); await L.openCellR(w, who, iso); await P.waitForTimeout(250); const s = await sheetOf(P); if (s !== want) throw new Error(`${iso} opened ${s}, not ${want}`) }

  /* ============ 1. an approved leave's one-day window (Fri 6 Nov) ============ */
  await sc('approved', async () => {
    const d = '2026-11-06'
    await placeLL(w, who, d, { approve: false })
    await L.openCellR(w, who, d); await L.press(w, T('decide-approve')); await P.waitForTimeout(500)
    const k = await kinds(w, who, d)
    if (!k.some(x => /k-ll\|s-a/.test(x))) throw new Error('6 Nov not approved: ' + JSON.stringify(k))
    await reopen(d)
    const now = await P.evaluate(() => ({ approveLit: document.querySelector('[data-testid="decide-approve"]').classList.contains('lit'), llLit: document.querySelector('[data-testid="bid-LL"]')?.classList.contains('lit') }))
    if (!now.approveLit) throw new Error('the approved leave\'s window shows Approve unlit')
    note('approved', size, `6 Nov window: Approve lit ${now.approveLit}, LL ringed ${now.llLit}`)
    const nodes = { lit: T('decide-approve'), other: T('decide-refuse'), move: T('decide-shift'), ring: null }
    await measure(w, 'today-approved', nodes)
    await frame(w, '1-today-approved', { ...WIN, label: 'Today: an approved leave — Approve lit as built' })
    for (const opt of ['A', 'B', 'C']) {
      await reopen(d)
      const why = await draw(P, opt, 'approve', nodes); if (why) throw new Error(`${opt}: ${why}`)
      await measure(w, `${opt}-approved`, nodes)
      await frame(w, `4-${opt.toLowerCase()}-approved`, { ...WIN, label: LABEL[opt].approve, check: drawnCheck(P, opt, nodes) })
    }
    if (w.phone) {
      await reopen(d)
      const why = await draw(P, 'C', 'approve', nodes, true); if (why) throw new Error(`C wide: ${why}`)
      await measure(w, 'C-approved-wide', nodes)
      await frame(w, '4-c-approved-wideletters', { ...WIN, label: 'Drawn C, letters a seventh wider (as an iPhone’s may be)', check: drawnCheck(P, 'C', nodes) })
    }
    await reopen(d); await fitProbe(w, 'fit-approved', nodes.lit, 'Approved')
    await L.closeAny(w)
  })

  /* ============ 2. a refused bid's one-day window (Wed 4 Nov) ============ */
  await sc('refused', async () => {
    const d = '2026-11-04'
    await placeLL(w, who, d, { approve: false })
    await L.openCellR(w, who, d); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500)
    const k = await kinds(w, who, d)
    if (!k.some(x => /k-ll\|s-r/.test(x))) throw new Error('4 Nov not refused: ' + JSON.stringify(k))
    await reopen(d)
    const now = await P.evaluate(() => ({ lit: [...document.querySelectorAll('[data-testid="bid-picker"] .lit')].map(e => e.dataset.testid), refusePressed: document.querySelector('[data-testid="decide-refuse"]')?.getAttribute('aria-pressed') }))
    note('refused', size, `4 Nov window: lit ${JSON.stringify(now.lit)}, Refuse aria-pressed ${now.refusePressed}`)
    const nodes = { lit: T('decide-refuse'), other: T('decide-approve'), move: T('decide-shift'), ring: T('bid-LL') }
    await measure(w, 'today-refused', nodes)
    await frame(w, '2-today-refused', { ...WIN, label: now.lit.length ? `Today: a refused bid — lit: ${now.lit.join(', ')}` : 'Today: a refused bid — nothing lit' })
    for (const opt of ['A', 'B', 'C']) {
      await reopen(d)
      const why = await draw(P, opt, 'refuse', nodes); if (why) throw new Error(`${opt}: ${why}`)
      await measure(w, `${opt}-refused`, nodes)
      await frame(w, `5-${opt.toLowerCase()}-refused`, { ...WIN, label: LABEL[opt].refuse, check: drawnCheck(P, opt, nodes) })
    }
    if (w.phone) {
      await reopen(d)
      const why = await draw(P, 'C', 'refuse', nodes, true); if (why) throw new Error(`C wide: ${why}`)
      await measure(w, 'C-refused-wide', nodes)
      await frame(w, '5-c-refused-wideletters', { ...WIN, label: 'Drawn C, letters a seventh wider (as an iPhone’s may be)', check: drawnCheck(P, 'C', nodes) })
    }
    await reopen(d); await fitProbe(w, 'fit-refused', nodes.lit, 'Refused')
    await L.closeAny(w)
  })

  /* ============ 3. the day's list: an approved morning and a refused afternoon (Thu 5 Nov) ============ */
  await sc('daylist', async () => {
    const d = '2026-11-05'
    await placeLL(w, who, d, { approve: true, portion: 'am' })
    await L.openCellR(w, who, d)
    if (!(await L.vis(P, T('portion-pm')))) throw new Error('the window on an approved morning offers no PM')
    await L.press(w, T('portion-pm')); await setSwitch(w, false)
    if (!(await L.placeLeave(w, 'LL'))) throw new Error('the afternoon LL was not placed: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
    await reopen(d, 'daylist-sheet')
    /* the entries' ids, read off the list: the approved one wears Approve lit, the pending one does not */
    const idsOf = () => P.evaluate(() => {
      const ap = [...document.querySelectorAll('[data-testid="daylist-sheet"] [data-testid^="dl-approve-"]')]
      const lit = ap.find(b => b.classList.contains('lit')), un = ap.find(b => !b.classList.contains('lit'))
      return { appr: lit?.dataset.testid.slice(11) ?? null, other: un?.dataset.testid.slice(11) ?? null }
    })
    const e0 = await idsOf()
    if (!e0.appr || !e0.other) throw new Error('the list does not hold an approved and a pending entry: ' + JSON.stringify(e0))
    await L.press(w, T(`dl-refuse-${e0.other}`)); await P.waitForTimeout(500)
    if (!(await L.vis(P, T('daylist-sheet')))) await L.openCellR(w, who, d)
    const k = await kinds(w, who, d)
    const e = await idsOf()
    if (!k.some(x => /k-ll\|s-a/.test(x)) || !k.some(x => /k-ll\|s-r/.test(x))) throw new Error('5 Nov is not approved morning + refused afternoon: ' + JSON.stringify(k))
    const pressed = await P.getAttribute(T(`dl-refuse-${e.other}`), 'aria-pressed')
    note('daylist', size, `5 Nov: ${JSON.stringify(k)}; approved ${e.appr}, refused ${e.other} (Refuse aria-pressed ${pressed})`)
    const rowOf = id => `li:has([data-testid="dl-approve-${id}"]) .bp-acts`
    const DL = { marks: [rowOf(e.appr), rowOf(e.other)], around: [T('daylist-sheet')] }
    const nA = { lit: T(`dl-approve-${e.appr}`), other: T(`dl-refuse-${e.appr}`), move: T(`dl-move-${e.appr}`), ring: null }
    const nR = { lit: T(`dl-refuse-${e.other}`), other: T(`dl-approve-${e.other}`), move: T(`dl-move-${e.other}`), ring: null }
    await measure(w, 'today-daylist-approved', nA)
    await measure(w, 'today-daylist-refused', nR)
    await frame(w, '3-today-daylist', { ...DL, label: 'Today: the day’s list — approved morning, refused afternoon' })
    for (const opt of DL_OPTS) {
      await reopen(d, 'daylist-sheet')
      for (const [nodes, st] of [[nA, 'approve'], [nR, 'refuse']]) { const why = await draw(P, opt, st, nodes); if (why) throw new Error(`${opt}: ${why}`) }
      await measure(w, `${opt}-daylist-approved`, nA)
      await measure(w, `${opt}-daylist-refused`, nR)
      const both = async () => (await drawnCheck(P, opt, nA)()) || (await drawnCheck(P, opt, nR)())
      await frame(w, `6-${opt.toLowerCase()}-daylist`, { ...DL, label: `Drawn ${opt} in the day’s list — both entries`, check: both })
    }
    await L.closeAny(w)
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ log, pics, measures, fits, values: { GREEN, RED, INK, WORD } }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
