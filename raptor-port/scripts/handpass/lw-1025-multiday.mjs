// A LEAVE OVER SEVERAL DAYS READS AS ONE ENTRY ON THE GRID (his D1340, 25 Oct 26) — drawn on the built bundle for him to pick.
// His words: "how does 1 know that range of date is 1 combined input? Perhaps a faint grey box or white box or black box over
// the range of the single input? … But when I drag and select the cyan boxes still shows yeah".
// Fixtures, through the app's own controls (an admin, Drifter's row, November 2026), each checked in the saved records:
//   (1) 2–4 Nov  a pending LL placed by ONE drag — one bid (its three days share one set of words: store.ts reqRunKey)
//   (2) 5 Nov, 6 Nov  two pending LL placed one by one, "Wedding" and "Family" — two bids (different words; two next-door
//       bids with the SAME words already act as one, D1346 — so the pair needs words of its own to be two)
//   (3) 9–11 Nov an approved LL placed by one drag with "Approve what I enter" on — one leave (one input on the Inputs page)
//   (4) 12–13 Nov an overseas duty filed by one drag — one input
// Pictures (phone 402×874 @3x and desktop 1440×900 @1x), each cut to those days of Drifter's row, two rows above and below
// and the date row, a dashed cyan mark round the row's days and a label:
//   md1 Today · md2 his grey box · md3 his white box · md4 his black box · md5 the agent's joined bar
//   md6-<opt> the option with a real drag-selection held over 10–11 Nov (the cyan the app paints today), DRAG=grey,bar
// The drawing: classes on the cells the row already draws (no node added), one injected stylesheet. A run's first day wears
// `mrun mrun-s`, its middle days `mrun mrun-m`, its last `mrun mrun-e`; the option is `data-mrun` on the grid's table.
// Every option steps aside on a day the drag has selected (`:not(.selcell)`), so the cyan shows exactly as today there.
// Usage (from raptor-port/): node scripts/handpass/lw-1025-multiday.mjs   [SIZES=phone,desk] [DRAG=grey,bar]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/multi-day'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-multiday', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const DRAG = (process.env.DRAG || 'grey,bar').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.endsWith(`-${s}.png`))) unlinkSync(path.join(L.OUT, f))

const log = []
const note = (size, said) => { log.push({ size, said }); console.log(`   [${size}] ${said}`) }
const pics = []
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}`)
const recsOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:leavewar/rec:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v.pid === who && v.date === iso) out.push(v) } catch { }
  }
  return out
}, [who, iso])
/* the Inputs page's records of a man that touch November (read only) */
const inputsOf = (P, who) => P.evaluate(who => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:inputs/')) continue
    try {
      const v = JSON.parse(localStorage.getItem(k))
      const ppl = (v.people || []).map(x => x.p).concat(v.person ? [v.person] : [])
      if (ppl.includes(who) && /^Nov /.test(v.date || '')) out.push({ iid: v.iid, type: v.type, date: v.date, endDate: v.endDate ?? null, yr: v.yr, lw: v.lw ?? null })
    } catch { }
  }
  return out
}, who)

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
/* press a leave or filing button in the drag window; a below-zero ask takes the same press again (D418) */
async function selPress(w, tid) {
  await L.press(w, T(tid)); await w.page.waitForTimeout(500)
  if (await L.vis(w.page, T('select-sheet'))) { await L.press(w, T(tid)); await w.page.waitForTimeout(600) }
  return !(await L.vis(w.page, T('select-sheet')))
}
async function placeLL(w, who, iso, { approve, remarks = null }) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await setSwitch(w, approve)
  if (remarks) { await L.press(w, T('bid-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  const closed = await L.placeLeave(w, 'LL')
  if (!closed) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`LL on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
}

/* THE MARK AND THE LABEL, then the picture cut to them — lw-r2r3-questions.mjs's frame(), unchanged but for the folder */
async function frame(w, name, { marks = [], around = [], label, pad = 8, check = null, inflate = 7 }) {
  const P = w.page
  const tg = `${name}-${w.size}`
  const clip = await P.evaluate(({ marks, around, label, pad, inflate }) => {
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
    const inflated = mr.map(r => ({ l: r.l - inflate, t: r.t - inflate, r: r.r + inflate, b: r.b + inflate }))
    inflated.forEach(r => { const d = box(r, 'qmk-box'); d.style.border = `2px dashed ${CY}`; d.style.borderRadius = '7px' })
    let c = uni([...ar, ...inflated])
    c = { l: c.l - pad, t: c.t - pad, r: c.r + pad, b: c.b + pad }
    const panelEl = document.querySelector('#page-leavewar') || body
    const cs = getComputedStyle(panelEl)
    const bg = cs.getPropertyValue('--panel-2').trim() || cs.getPropertyValue('--panel').trim() || '#1d232c'
    const ink = cs.getPropertyValue('--ink').trim() || '#e9eef5'
    const tag = document.createElement('div'); tag.className = 'qmk qmk-label'; tag.textContent = label
    Object.assign(tag.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', background: bg, color: ink, font: '600 12px/16px -apple-system, "Segoe UI", system-ui, sans-serif', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${CY}`, whiteSpace: 'normal', maxWidth: `${Math.min(innerWidth - 8, Math.max(c.r - c.l - 4, 240))}px`, boxSizing: 'border-box', boxShadow: 'none' })
    body.appendChild(tag)
    const tw = tag.offsetWidth, th = tag.offsetHeight
    let tx = Math.max(4, Math.min(c.l + 2, innerWidth - tw - 4)), ty
    if (c.b + th + 6 <= innerHeight - 2) { ty = c.b + 4; c.b = ty + th + 4 }
    else if (c.t - th - 6 >= 2) { ty = c.t - th - 6; c.t = ty - 4 }
    else { ty = Math.max(2, c.t + 2); tx = Math.max(4, c.r - tw - 6) }
    tag.style.left = `${tx}px`; tag.style.top = `${ty}px`
    c.l = Math.min(c.l, tx - 4); c.r = Math.max(c.r, tx + tw + 4)
    c = { l: Math.max(0, c.l), t: Math.max(0, c.t), r: Math.min(innerWidth, c.r), b: Math.min(innerHeight, c.b) }
    return { x: Math.round(c.l), y: Math.round(c.t), width: Math.round(c.r - c.l), height: Math.round(c.b - c.t), boxes: inflated.length }
  }, { marks, around, label, pad, inflate })
  if (clip.missing) throw new Error(`${tg}: nothing drawn for ${clip.missing.join(', ')}`)
  if (check) { const why = await check(); if (why) throw new Error(`${tg}: the drawn premise is gone — ${why}`) }
  const n = await P.evaluate(() => document.querySelectorAll('.qmk-box').length)
  if (n !== clip.boxes) throw new Error(`${tg}: ${n} marks on the page, ${clip.boxes} drawn`)
  await P.screenshot({ path: path.join(L.OUT, tg + '.png'), clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, scale: 'device' })
  await P.evaluate(() => { for (const e of document.querySelectorAll('.qmk')) e.remove() })
  pics.push({ file: tg + '.png', label })
  console.log(`   picture ${tg}.png — ${label}`)
}

/* THE OPTIONS. Values are in the grid's own units (the phone's 0.8 zoom applies to them as to everything in the grid).
   A frame option draws one pseudo-element per run day (`::before`, under the day's box in paint order), filling the cell
   to its edges — the 2px the box leaves round itself — and reaching over the day line on its right to the next day, so the
   run's top and bottom edges run unbroken; the first day carries the left edge, the last the right. Inside the row's own
   height: top 0, bottom 0 of the cell (the day's bottom grid line stays). */
const OPTS = {
  grey: { edge: 'rgba(190, 200, 212, .70)', fill: 'rgba(170, 182, 196, .10)', w: '1px' },
  white: { edge: 'rgba(255, 255, 255, .92)', fill: 'transparent', w: '1px' },
  black: { edge: 'rgba(0, 0, 0, 1)', fill: 'rgba(0, 0, 0, .62)', w: '1px' },
}
const css = bw => `
#page-leavewar .mx[data-mrun] td.mrun:not(.selcell)::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; right: 0; box-sizing: border-box; pointer-events: none;
  border-top: var(--mr-w) solid var(--mr-edge); border-bottom: var(--mr-w) solid var(--mr-edge); background: var(--mr-fill); }
#page-leavewar .mx[data-mrun] td.mrun-s:not(.selcell)::before { border-left: var(--mr-w) solid var(--mr-edge); border-radius: 5px 0 0 5px; right: -${bw}; }
#page-leavewar .mx[data-mrun] td.mrun-m:not(.selcell)::before { right: -${bw}; }
#page-leavewar .mx[data-mrun] td.mrun-e:not(.selcell)::before { border-right: var(--mr-w) solid var(--mr-edge); border-radius: 0 5px 5px 0; }
${Object.entries(OPTS).map(([k, o]) => `#page-leavewar .mx[data-mrun="${k}"] { --mr-edge: ${o.edge}; --mr-fill: ${o.fill}; --mr-w: ${o.w}; }`).join('\n')}
/* THE JOINED BAR (the agent's): the run's day boxes reach over the day lines between them and touch — square where they
   meet, rounded only at the run's two ends — their edge drawn only round the outside; the code once, on the first day
   (the other days keep their letters for a screen reader, drawn transparent). No pseudo-element, no node: classes only. */
#page-leavewar .mx[data-mrun="bar"] td.mrun-s:not(.selcell) .c { right: -${bw}; border-radius: 4px 0 0 4px; }
#page-leavewar .mx[data-mrun="bar"] td.mrun-m:not(.selcell) .c { left: 0; right: -${bw}; border-radius: 0; color: transparent; }
#page-leavewar .mx[data-mrun="bar"] td.mrun-e:not(.selcell) .c { left: 0; border-radius: 0 4px 4px 0; color: transparent; }
#page-leavewar .mx[data-mrun="bar"] td.mrun:not(.selcell) .c.s-w { outline: none; border: 1px dashed rgba(var(--h), .95); }
#page-leavewar .mx[data-mrun="bar"] td.mrun-s:not(.selcell) .c.s-w { border-right: 0; }
#page-leavewar .mx[data-mrun="bar"] td.mrun-m:not(.selcell) .c.s-w { border-left: 0; border-right: 0; }
#page-leavewar .mx[data-mrun="bar"] td.mrun-e:not(.selcell) .c.s-w { border-left: 0; }
#page-leavewar .mx[data-mrun="bar"] td.mrun-s:not(.selcell) .c.s-a { box-shadow: inset 1px 0 0 0 rgba(var(--h), .85), inset 0 1px 0 0 rgba(var(--h), .85), inset 0 -1px 0 0 rgba(var(--h), .85); }
#page-leavewar .mx[data-mrun="bar"] td.mrun-m:not(.selcell) .c.s-a { box-shadow: inset 0 1px 0 0 rgba(var(--h), .85), inset 0 -1px 0 0 rgba(var(--h), .85); }
#page-leavewar .mx[data-mrun="bar"] td.mrun-e:not(.selcell) .c.s-a { box-shadow: inset -1px 0 0 0 rgba(var(--h), .85), inset 0 1px 0 0 rgba(var(--h), .85), inset 0 -1px 0 0 rgba(var(--h), .85); }
/* the left-edge marks a box can wear (filed on the Inputs page; moved) belong to the entry, so the bar wears them once, at its start */
#page-leavewar .mx[data-mrun="bar"] td:is(.mrun-m, .mrun-e):not(.selcell) .c:is(.raptor, .moved)::before { display: none; }
`
/* put the run classes on the cells and the option on the table; returns what it found, for the check */
const draw = (P, who, runs, opt) => P.evaluate(({ who, runs, opt, css }) => {
  let st = document.getElementById('mock-mrun'); if (!st) { st = document.createElement('style'); st.id = 'mock-mrun'; document.head.appendChild(st) } st.textContent = css
  for (const e of document.querySelectorAll('td.mrun')) e.classList.remove('mrun', 'mrun-s', 'mrun-m', 'mrun-e')
  const mx = document.querySelector(`[data-testid="cell-${who}-${runs[0][0]}"]`)?.closest('table')
  for (const t of document.querySelectorAll('table.mx[data-mrun]')) t.removeAttribute('data-mrun')
  if (!opt) return { ok: true }
  let n = 0
  for (const run of runs) run.forEach((iso, i) => {
    const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
    if (!td) return
    td.classList.add('mrun', i === 0 ? 'mrun-s' : i === run.length - 1 ? 'mrun-e' : 'mrun-m'); n++
  })
  mx.setAttribute('data-mrun', opt)
  return { ok: true, n }
}, { who, runs, opt, css: css(BW) })
let BW = '1px'
const drawnOk = (P, who, runs, opt) => async () => P.evaluate(({ who, runs, opt }) => {
  const want = runs.flat().length
  const got = runs.flat().filter(iso => document.querySelector(`[data-testid="cell-${who}-${iso}"]`)?.classList.contains('mrun')).length
  if (got !== want) return `${got} of ${want} run days carry the class`
  const tbl = document.querySelector(`[data-testid="cell-${who}-${runs[0][0]}"]`).closest('table')
  if (tbl.getAttribute('data-mrun') !== opt) return 'the option is gone from the grid'
  if (opt !== 'bar') { const b = getComputedStyle(document.querySelector(`[data-testid="cell-${who}-${runs[0][0]}"]`), '::before'); if (b.content === 'none') return 'no frame drawn' }
  else { const c = document.querySelector(`[data-testid="cell-${who}-${runs[0][1]}"] .c`); if (getComputedStyle(c).color !== 'rgba(0, 0, 0, 0)') return 'the middle day still prints its code' }
  return null
}, { who, runs, opt })

for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  /* a new browser context is a clean store (the demo world on its first boot); the plain address keeps the browser's own
     storage, so the saved records below can be read to prove each fixture is one entry or two */
  await L.signInPlain(w, 'admin')
  await hideTransient(P)
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  const above = [ids.Sidewinder, ids.Warden], below = [ids.Ridge, ids.Basher]
  const D = d => `2026-11-${String(d).padStart(2, '0')}`
  const RUNS = [[D(2), D(3), D(4)], [D(9), D(10), D(11)], [D(12), D(13)]]
  const ALL = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13].map(D)
  await L.reachCell(w, who, D(2))
  const empty = []
  for (const iso of ALL) { const k = await kinds(w, who, iso); if (k.length) empty.push(`${iso} ${k}`) }
  if (empty.length) throw new Error('Drifter\'s November days are not empty: ' + empty.join('; '))

  /* (1) one drag, a pending LL over 2–4 Nov */
  if (!(await dragCells(w, [who, D(2)], [who, D(4)]))) throw new Error('no drag window over 2–4 Nov')
  await setSwitch(w, false, 'sel')
  if (!(await selPress(w, 'sel-LL'))) throw new Error('2–4 Nov not placed: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
  /* (2) two single days placed one by one, words of their own */
  await placeLL(w, who, D(5), { approve: false, remarks: 'Wedding' })
  await placeLL(w, who, D(6), { approve: false, remarks: 'Family' })
  /* (3) one drag, an approved LL over 9–11 Nov */
  if (!(await dragCells(w, [who, D(9)], [who, D(11)]))) throw new Error('no drag window over 9–11 Nov')
  await setSwitch(w, true, 'sel')
  if (!(await selPress(w, 'sel-LL'))) throw new Error('9–11 Nov not placed: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
  /* (4) one drag, an overseas duty filed over 12–13 Nov */
  if (!(await dragCells(w, [who, D(12)], [who, D(13)]))) throw new Error('no drag window over 12–13 Nov')
  if (!(await selPress(w, 'sel-file-OD'))) throw new Error('12–13 Nov not filed: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
  await P.waitForTimeout(600)

  /* WHAT THE APP HOLDS: the grid's boxes, the war's bids (their words = what makes a run one bid) and the Inputs */
  const cells = {}
  for (const iso of ALL) cells[iso.slice(8)] = (await kinds(w, who, iso)).join(' + ')
  note(size, 'Drifter\'s boxes: ' + JSON.stringify(cells))
  const bidKey = r => JSON.stringify([r.code, r.state, r.remarks ?? '', r.till ?? null, r.docIds ?? []])
  const bids = {}
  for (const iso of [2, 3, 4, 5, 6].map(D)) bids[iso.slice(8)] = ((await recsOf(P, who, iso)) || []).filter(r => r.kind === 'request').map(bidKey).join(' | ')
  note(size, 'the war\'s bids, by what makes them one run: ' + JSON.stringify(bids))
  const runA = new Set([bids['02'], bids['03'], bids['04']]).size === 1 && bids['02'] !== ''
  const twoB = bids['05'] && bids['06'] && bids['05'] !== bids['06'] && bids['05'] !== bids['04']
  const inputs = await inputsOf(P, who)
  note(size, 'the Inputs page\'s November records of Drifter: ' + JSON.stringify(inputs))
  const llIn = inputs.filter(i => i.type === 'LL' && i.date === 'Nov 9' && i.endDate === 'Nov 11')
  const odIn = inputs.filter(i => i.type === 'OD' && i.date === 'Nov 12' && i.endDate === 'Nov 13')
  const fx = { 'one bid 2–4': runA, 'two bids 5, 6': !!twoB, 'one approved LL input 9–11': llIn.length === 1, 'one OD input 12–13': odIn.length === 1 }
  note(size, 'fixtures: ' + JSON.stringify(fx))
  if (!runA || !twoB || llIn.length !== 1) throw new Error('a leave fixture is not what it should be: ' + JSON.stringify(fx))
  const runs = odIn.length === 1 ? RUNS : RUNS.slice(0, 2)
  if (odIn.length !== 1) note(size, 'NOT DONE — the overseas duty did not land as one input over 12–13 Nov; drawn without it')

  /* THE VIEW: November from its first day at the frozen edge, Drifter two rows under the stuck date row */
  await L.gotoMonth(w, 'NOV'); await P.waitForTimeout(500)
  /* the date row sticks to the top as a fixed copy once the page is scrolled past it (`sticky-head`, the grid's own) */
  const stuckBottom = () => P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="sticky-head"]')].find(e => e.getBoundingClientRect().height > 0); if (e) return Math.round(e.getBoundingClientRect().bottom); const h = document.querySelector('[data-testid="head-2026-11-02"]'); return Math.round(h.getBoundingClientRect().height + (h.closest('.mx-wrap, .mx-outer')?.getBoundingClientRect().top ?? 0)) })
  for (let i = 0; i < 4; i++) {
    const hb = await stuckBottom()
    const dy = await P.evaluate(([top, hb]) => Math.round(document.querySelector(`[data-testid="row-${top}"]`).getBoundingClientRect().top - hb), [above[0], hb])
    if (Math.abs(dy) < 2) break
    await P.evaluate(dy => window.scrollBy(0, dy), dy); await P.waitForTimeout(400)
  }
  const geo = await P.evaluate(({ who, top }) => {
    const td = document.querySelector(`[data-testid="cell-${who}-2026-11-03"]`), r = td.getBoundingClientRect(), c = td.querySelector('.c').getBoundingClientRect()
    const cs = getComputedStyle(td)
    const head = ([...document.querySelectorAll('[data-testid="sticky-head"]')].find(e => e.getBoundingClientRect().height > 0) || document.querySelector('[data-testid="head-2026-11-02"]')).getBoundingClientRect()
    const row = document.querySelector(`[data-testid="row-${top}"]`).getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y)
    return { cellW: +r.width.toFixed(2), cellH: +r.height.toFixed(2), boxW: +c.width.toFixed(2), boxH: +c.height.toFixed(2), border: cs.borderRightWidth, zoom: getComputedStyle(td.closest('table')).zoom, headTop: Math.round(head.top), headH: Math.round(head.height), headBottom: Math.round(head.bottom), firstRowTop: Math.round(row.top), hitOk: !!hit && (hit === td || td.contains(hit)), dpr: devicePixelRatio, bg: getComputedStyle(document.querySelector('#page-leavewar') || document.body).backgroundColor }
  }, { who, top: above[0] })
  note(size, 'the grid here: ' + JSON.stringify(geo))
  BW = geo.border
  if (!geo.hitOk) note(size, 'warning: the 3 Nov cell is covered at its centre (a sticky bar over it?)')

  const sel = s => T(L.cellId(who, s))
  const mark = [[sel(D(2)), sel(D(13))]]
  /* the dates: the stuck date row over these days (its copy carries no test ids, so its box is given) */
  const c1 = await P.locator(sel(D(1))).first().boundingBox()
  const lastD = w.phone ? D(13) : D(14)
  const around = [{ x: c1.x, y: geo.headTop, width: 1, height: geo.headH }, T(L.cellId(above[0], D(1))), T(L.cellId(below[1], lastD)), `${T('row-' + who)} td.who`]
  const what = odIn.length === 1 ? '2–4 Nov is one bid, 5 and 6 Nov two bids, 9–11 Nov one approved leave, 12–13 Nov one OD' : '2–4 Nov is one bid, 5 and 6 Nov two bids, 9–11 Nov one approved leave'
  const LBL = {
    today: `Today: ${what}. Nothing on the grid says which days go together.`,
    grey: 'Drawn: a faint grey box round each entry of several days',
    white: 'Drawn: a thin white box round each entry of several days',
    black: 'Drawn: a black box round each entry of several days',
    bar: 'Drawn: each entry of several days is one bar with its code once; separate entries keep their gaps',
  }
  await draw(P, who, runs, null)
  await frame(w, 'md1-today', { marks: mark, around, label: LBL.today })
  const order = ['grey', 'white', 'black', 'bar']
  const num = { grey: 2, white: 3, black: 4, bar: 5 }
  for (const opt of order) {
    await draw(P, who, runs, opt)
    await frame(w, `md${num[opt]}-${opt}`, { marks: mark, around, label: LBL[opt], check: drawnOk(P, who, runs, opt) })
  }

  /* 6 — A REAL DRAG held over 10–11 Nov (the approved run's last two days), the picture taken while the finger or the
     mouse button is still down, so the cyan is the app's own; then let go and the drag window is cancelled */
  for (const opt of DRAG) {
    await draw(P, who, runs, opt)
    const a = await P.locator(sel(D(10))).first().boundingBox(), z = await P.locator(sel(D(11))).first().boundingBox()
    const A = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, Z = { x: z.x + z.width / 2, y: z.y + z.height / 2 }
    if (w.phone) {
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: A.x, y: A.y, id: 1 }] })
      await P.waitForTimeout(340)
      for (const f of [0.5, 1]) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (Z.x - A.x) * f, y: A.y, id: 1 }] }); await P.waitForTimeout(60) }
    } else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 8 }) }
    await P.waitForTimeout(250)
    const held = await P.evaluate(who => ({ selecting: !!document.querySelector('.mx-wrap.selecting'), cells: [...document.querySelectorAll('td.selcell')].map(e => e.dataset.testid?.replace(`cell-${who}-`, '')) }), who)
    note(size, `drag held (${opt}): ${JSON.stringify(held)}`)
    let err = null
    try {
      if (held.cells.join() !== `${D(10)},${D(11)}`) throw new Error('the drag does not hold 10–11 Nov: ' + JSON.stringify(held))
      await frame(w, `md6-${opt}-drag`, { marks: mark, around, label: `Drawn: ${opt === 'bar' ? 'the one bar' : `the ${opt} box`}, with 10–11 Nov being dragged: the cyan shows as today`, check: async () => (await drawnOk(P, who, runs, opt)()) ?? (await P.evaluate(() => document.querySelectorAll('td.selcell').length === 2 ? null : 'the selection is gone')) })
    } catch (e) { err = e }
    if (w.phone) await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    else await P.mouse.up()
    await P.waitForTimeout(500)
    await L.closeAny(w); await P.waitForTimeout(300)
    if (err) note(size, `md6-${opt} NOT DONE — ${String(err).slice(0, 240)}`)
  }
  await draw(P, who, runs, null)
  if (w.errs.length) note(size, 'errors: ' + w.errs.slice(0, 8).join(' || '))
  else note(size, 'errors: none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ log, pics }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
