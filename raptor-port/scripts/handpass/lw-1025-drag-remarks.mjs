// THE DRAG WINDOW LISTS EACH ENTRY'S REMARK (his D1347, 25 Oct 26; D1339, D1341) — drawn on the built bundle for him.
// D1347: over two or more separate entries with different remarks, the drag window lists each entry's remark read only —
// one grey line each, with its dates — above the Remarks box, and words typed there replace them all (D1341); the entries
// stay separate. D1339: where the dragged days share one remark, the box shows it.
// Each picture is cut to what its question is about, the place MARKED (a dashed cyan box) and a short label drawn on it.
// "Today" pictures are real; "Drawn" ones change the app's own nodes on the page and say "Drawn:".
//   A. a drag over 8 Dec "Wedding" and 9–10 Dec "Family trip" (two separate pending bids): today the box is empty; drawn,
//      two grey lines above it — "8 Dec · Wedding", "9–10 Dec · Family trip" — in the windows' own line of small grey text
//      (`.note`, the sheets' muted line), the dates written as the window's own title writes them (BidBits compactSpan).
//   B. a drag over the one entry 9–10 Dec "Family trip": today the box is empty; drawn, the box shows "Family trip".
//   C. a drag over 8–11 Dec, 11 Dec a third bid with NO remark: drawn, only the two remarks listed (11 Dec not listed).
// Fixtures through the app's own controls, as admin (Saber), on Drifter; each asserts it landed.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-drag-remarks.mjs   [LW_PORT=4180] [SIZES=phone,desk]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/drag-remarks'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-drag-remarks', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []

const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}`)
/* the war's own records of a man on a day, as saved (read only) */
const recsOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:leavewar/rec:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v.pid === who && v.date === iso) out.push(v) } catch { }
  }
  return out
}, [who, iso])
const reqOf = async (P, who, iso) => ((await recsOf(P, who, iso)) || []).find(r => r.kind === 'request')
async function dragCells(w, [p1, a], [p2, z]) {
  const P = w.page
  await L.reachCell(w, p1, a)
  await P.locator(T(L.cellId(p1, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(L.cellId(p1, a))).first().boundingBox(), bZ = await P.locator(T(L.cellId(p2, z))).first().boundingBox()
  if (!bA || !bZ) throw new Error('no box for the drag')
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: (A.y + Z.y) / 2 }, Z])
  else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await P.waitForTimeout(500)
  return L.vis(P, T('select-sheet'))
}
async function placeLL(w, who, iso, { approve, remarks = null }) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await setSwitch(w, approve)
  if (remarks) { await L.press(w, T('bid-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  const closed = await L.placeLeave(w, 'LL')
  if (!closed) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`LL on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  return kinds(w, who, iso)
}
/* the drag window's dates as its own title writes them (BidBits.tsx compactSpan, copied) */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function compactSpan(from, to) {
  const d = iso => Number(iso.slice(8, 10)), m = iso => MONTHS[Number(iso.slice(5, 7)) - 1]
  if (from === to) return `${d(from)} ${m(from)}`
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${d(from)} ${m(from)} ${from.slice(2, 4)} – ${d(to)} ${m(to)} ${to.slice(2, 4)}`
  if (from.slice(0, 7) === to.slice(0, 7)) return `${d(from)}–${d(to)} ${m(to)}`
  return `${d(from)} ${m(from)} – ${d(to)} ${m(to)}`
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

/* DRAWN: the entries' remarks as read-only grey lines, one per entry, above the Remarks row — a row of the window's own
   kind (`.bidsheet-row`) holding one `.note` per entry (the sheets' line of small grey text), each its own line */
const drawList = (P, lines) => P.evaluate(lines => {
  document.querySelector('[data-drawn="rmk-list"]')?.remove()
  const row = document.querySelector('[data-testid="sel-rmk-row"]')
  if (!row) return null
  const list = document.createElement('div')
  list.className = 'bidsheet-row'; list.dataset.drawn = 'rmk-list'; list.setAttribute('role', 'group'); list.setAttribute('aria-label', 'Remarks on these days')
  for (const t of lines) { const s = document.createElement('span'); s.className = 'note'; s.style.flex = '1 1 100%'; s.textContent = t; list.appendChild(s) }
  row.before(list)
  const box = document.querySelector('[data-testid="sel-remarks"]')
  const c = getComputedStyle(list.firstElementChild)
  return { lines: [...list.children].map(e => ({ t: e.textContent, top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) })), font: `${c.fontSize} ${c.color}`, boxValue: box.value, placeholder: box.placeholder }
}, lines)
const sel = {
  hd: '[data-testid="select-sheet"] .bidsheet-hd',
  row: T('sel-rmk-row'),
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
  const D8 = '2026-12-08', D9 = '2026-12-09', D10 = '2026-12-10', D11 = '2026-12-11'
  let fixtures = false

  await sc('fixtures', async () => {
    for (const d of [D8, D9, D10, D11]) { const k = await kinds(w, who, d); if (k.length) throw new Error(`${d} is not empty: ${JSON.stringify(k)}`) }
    /* 8 Dec: a pending LL, "Wedding", from the one-day window */
    await placeLL(w, who, D8, { approve: false, remarks: 'Wedding' })
    /* 9–10 Dec: ONE entry over two days — a drag over them, "Family trip" typed in the drag window, LL pressed there */
    if (!(await dragCells(w, [who, D9], [who, D10]))) throw new Error('no drag window over 9–10 Dec')
    await setSwitch(w, false, 'sel')
    await L.press(w, T('sel-remarks')); await P.keyboard.type('Family trip'); await P.waitForTimeout(150)
    await L.press(w, T('sel-LL')); await P.waitForTimeout(500)
    if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(500) }
    await L.closeAny(w)
    /* 11 Dec: a pending LL with no remark */
    await placeLL(w, who, D11, { approve: false })
    const got = {}
    for (const d of [D8, D9, D10, D11]) { const r = await reqOf(P, who, d); got[d] = { k: await kinds(w, who, d), state: r?.state, remarks: r?.remarks ?? '' } }
    note('fixtures', size, JSON.stringify(got))
    const pend = d => got[d].k.some(x => /k-ll\|s-w/.test(x))
    if (!pend(D8) || got[D8].remarks !== 'Wedding') throw new Error('8 Dec fixture: ' + JSON.stringify(got[D8]))
    if (!pend(D9) || !pend(D10) || got[D9].remarks !== 'Family trip' || got[D10].remarks !== 'Family trip') throw new Error('9–10 Dec fixture: ' + JSON.stringify([got[D9], got[D10]]))
    if (!pend(D11) || got[D11].remarks) throw new Error('11 Dec fixture: ' + JSON.stringify(got[D11]))
    fixtures = true
  })
  if (!fixtures) { await w.ctx.close(); continue }

  /* ============ A. two separate entries, different remarks ============ */
  await sc('A', async () => {
    if (!(await dragCells(w, [who, D8], [who, D10]))) throw new Error('no drag window over 8–10 Dec')
    const head = await L.txt(P, T('sel-span'))
    const v0 = await P.locator(T('sel-remarks')).inputValue()
    note('A', size, `drag window "${head}"; its Remarks box holds "${v0}"`)
    await frame(w, 'a1-today-two', { marks: [sel.row], around: [sel.hd, sel.row], label: v0 ? `Today, over 8 Dec “Wedding” and 9–10 Dec “Family trip”: the box holds “${v0}”` : 'Today, over 8 Dec “Wedding” and 9–10 Dec “Family trip”: the Remarks box is empty' })
    const lines = [`${compactSpan(D8, D8)} · Wedding`, `${compactSpan(D9, D10)} · Family trip`]
    const d = await drawList(P, lines)
    if (!d) throw new Error('no Remarks row to draw above')
    note('A', size, `drawn: ${JSON.stringify(d)}`)
    const ok = async () => P.evaluate(() => { const l = document.querySelector('[data-drawn="rmk-list"]'); return l && l.getBoundingClientRect().height > 0 && document.querySelector('[data-testid="sel-remarks"]').value === '' ? null : 'the drawn lines are gone or the box is not empty' })
    await frame(w, 'a2-drawn-two', { marks: [['[data-drawn="rmk-list"]', sel.row]], around: [sel.hd, sel.row], label: 'Drawn: each entry’s remark, read only, above an empty box — words typed there replace both', check: ok })
    await L.closeAny(w)
  })

  /* ============ B. one entry, one shared remark ============ */
  await sc('B', async () => {
    if (!(await dragCells(w, [who, D9], [who, D10]))) throw new Error('no drag window over 9–10 Dec')
    const head = await L.txt(P, T('sel-span'))
    const v0 = await P.locator(T('sel-remarks')).inputValue()
    note('B', size, `drag window "${head}"; its Remarks box holds "${v0}"`)
    await frame(w, 'b1-today-one', { marks: [sel.row], around: [sel.hd, sel.row], label: v0 ? `Today, over 9–10 Dec “Family trip”: the box holds “${v0}”` : 'Today, over 9–10 Dec “Family trip”: the Remarks box is empty' })
    await P.evaluate(() => { const t = document.querySelector('[data-testid="sel-remarks"]'); t.value = 'Family trip'; t.dataset.drawn = 'words' })
    await frame(w, 'b2-drawn-one', { marks: [sel.row], around: [sel.hd, sel.row], label: 'Drawn: the days share one remark — the box shows it, no grey lines',
      check: async () => (await P.locator('[data-drawn="words"]').inputValue()) === 'Family trip' && !(await P.locator('[data-drawn="rmk-list"]').count()) ? null : 'the words are gone' })
    await L.closeAny(w)
  })

  /* ============ C. an entry with no remark among them ============ */
  await sc('C', async () => {
    if (!(await dragCells(w, [who, D8], [who, D11]))) throw new Error('no drag window over 8–11 Dec')
    const head = await L.txt(P, T('sel-span'))
    const v0 = await P.locator(T('sel-remarks')).inputValue()
    note('C', size, `drag window "${head}"; its Remarks box holds "${v0}"`)
    const d = await drawList(P, [`${compactSpan(D8, D8)} · Wedding`, `${compactSpan(D9, D10)} · Family trip`])
    if (!d) throw new Error('no Remarks row to draw above')
    await frame(w, 'c1-drawn-noremark', { marks: [['[data-drawn="rmk-list"]', sel.row]], around: [sel.hd, sel.row], label: 'Drawn, over 8–11 Dec: 11 Dec has no remark, so it is not listed',
      check: async () => (await P.locator('[data-drawn="rmk-list"] .note').count()) === 2 ? null : 'the drawn lines are gone' })
    await L.closeAny(w)
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ log, pics }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
