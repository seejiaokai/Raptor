// QUESTIONS FOR HIM, ROUND 2 AND ROUND 3 OF THE LEAVE WAR'S BID WINDOWS (24 Oct 26) — the pictures, on the built bundle.
// Each picture is cut to what its question is about, the place MARKED (a dashed cyan box) and a short label drawn on it.
// "Today" pictures are real: nothing injected but the mark and the label. "Drawn" pictures clone the app's own nodes and
// classes (the method: .claude/skills/brainstorming/mockups-on-the-real-app.md) and say "Drawn:" on the picture.
//   Q1 (round 3) a refused bid's window names nothing          Q2 (round 3) his approved leave's window, his closed day
//   Q3 (round 3) the drag window's words over bids already there
//   R1 (round 2) an OD or a course is filed whole whatever Duration shows
//   R2 (round 2) does filing raise the manning bubble a bid does? R3 (round 2) UNA and the SANS calendar's still-needed figure
// Fixtures through the app's own controls, on real storage (a sign-out and sign-in keeps them); each asserts it landed.
// Usage: LW_PORT=4180 LW_OUT=2026-10-24-lw-r2/questions [SIZES=phone,desk] [ONLY=Q1,R1] node scripts/handpass/lw-r2r3-questions.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs'
console.log('lw-r2r3-questions', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(id)
const T = L.T
/* one run, one folder (walk-scripts §5): this run's sizes' pictures go first */
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`)) && (!ONLY || [...ONLY].some(o => f.startsWith(o.toLowerCase() + '-')))) unlinkSync(path.join(L.OUT, f))
for (const f of readdirSync(L.OUT)) if (f.startsWith('probe-')) unlinkSync(path.join(L.OUT, f))

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []

async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
/* the passing notes never in a picture; the manning bubble (a role=status too) is not one of them */
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important; }' })
async function signInAs(w, who) {
  const P = w.page
  if (who === 'admin') { await L.signInPlain(w, 'admin') } else {
    await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(800)
  }
  await hideTransient(P)
}
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
async function availP(w, iso) {
  const P = w.page, sel = `[data-testid="avail-p-${iso}"]`
  await L.reachCell(w, 'bane', iso)
  if (!(await L.vis(P, sel))) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200); await L.press(w, T('counts-toggle')); await P.waitForTimeout(600); await L.reachCell(w, 'bane', iso) }
  if (!(await P.locator(sel).count())) return null
  return (await P.locator(sel).first().innerText()).trim()
}
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
/* a leave placed through the one-day window, the switch as asked; asserts it landed */
async function placeLL(w, who, iso, { approve, portion = null, remarks = null }) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await setSwitch(w, approve)
  if (portion) await L.press(w, T(`portion-${portion}`))
  if (remarks) { await L.press(w, T('bid-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  const closed = await L.placeLeave(w, 'LL')
  if (!closed) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`LL on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  return kinds(w, who, iso)
}

/* THE MARK AND THE LABEL, then the picture cut to them. `marks`: what is marked (a selector — its first drawn element —, a
   list of selectors — their union —, or a box); `around`: what else the picture must hold. The label stands in a band
   above the subject (below where there is no room), never over what is marked. `check`: the drawn part's premise,
   asserted right before the picture (the method's trap: the app owns its DOM). */
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
    /* a mark given as a LINE (where a row was taken away) is a dashed rule across that place, not a box over its neighbours */
    const isLine = marks.map(m => !!(m && typeof m === 'object' && !Array.isArray(m) && m.line))
    const inflated = mr.map((r, i) => isLine[i] ? { l: r.l, t: r.t, r: r.r, b: r.b } : { l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 })
    inflated.forEach((r, i) => { const d = box(r, 'qmk-box'); if (isLine[i]) d.style.borderTop = `3px dashed ${CY}`; else { d.style.border = `2px dashed ${CY}`; d.style.borderRadius = '7px' } })
    let c = uni([...ar, ...inflated])
    c = { l: c.l - pad, t: c.t - pad, r: c.r + pad, b: c.b + pad }
    /* the label: the app's dark panel, light words, a cyan edge tying it to the mark */
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
/* which window is open, by the windows' own ids (sheetDump's last match can be a list inside a window) */
const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'

for (const size of SIZES) {
  const w = await L.newCtx(size)
  const P = w.page
  await signInAs(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter, me = ids.Ranger, ridge = ids.Ridge
  console.log(size, 'Drifter =', who, 'Ranger =', me, 'Ridge =', ridge)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 300)); await L.closeAny(w); await P.keyboard.press('Escape').catch(() => {}) } }

  /* ============ Q1 — a refused bid's window names nothing ============ */
  await sc('Q1', async () => {
    /* the lit look, read off a real approved leave's window: a pending LL on 6 Nov, approved from its window */
    await placeLL(w, who, '2026-11-06', { approve: false })
    await L.openCellR(w, who, '2026-11-06'); await L.press(w, T('decide-approve')); await P.waitForTimeout(500)
    const k6 = await kinds(w, who, '2026-11-06')
    if (!k6.some(k => /k-ll\|s-a/.test(k))) throw new Error('6 Nov not approved: ' + JSON.stringify(k6))
    await L.openCellR(w, who, '2026-11-06')
    const look = await P.evaluate(() => {
      const a = document.querySelector('[data-testid="decide-approve"]'), r = document.querySelector('[data-testid="decide-refuse"]'), ll = document.querySelector('[data-testid="bid-LL"]')
      const s = e => { const c = getComputedStyle(e); return { cls: e.className, bg: c.backgroundColor, color: c.color, border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, outline: `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor} +${c.outlineOffset}` } }
      return { approve: a && s(a), refuse: r && s(r), ll: ll && s(ll) }
    })
    note('Q1', size, 'an approved leave\'s window: ' + JSON.stringify(look))
    await frame(w, 'q1-ref-approved', { marks: [T('bid-actions'), T('bid-leave-grid')], around: [T('bid-picker')], label: 'Today, an approved leave: Approve lit, LL ringed' })
    await L.closeAny(w)

    /* the refused bid: a pending LL on 4 Nov, refused from its window, the window opened again */
    await placeLL(w, who, '2026-11-04', { approve: false })
    await L.openCellR(w, who, '2026-11-04'); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500)
    const k4 = await kinds(w, who, '2026-11-04')
    if (!k4.some(k => /k-ll\|s-r/.test(k))) throw new Error('4 Nov not refused: ' + JSON.stringify(k4))
    await L.openCellR(w, who, '2026-11-04')
    if ((await sheetOf(P)) !== 'bid-picker') throw new Error('4 Nov opened ' + await sheetOf(P))
    const now = await P.evaluate(() => ({
      lit: [...document.querySelectorAll('[data-testid="bid-picker"] .lit')].map(e => e.dataset.testid),
      refusePressed: document.querySelector('[data-testid="decide-refuse"]')?.getAttribute('aria-pressed'),
      refuseLook: (e => e && getComputedStyle(e).backgroundColor)(document.querySelector('[data-testid="decide-refuse"]')),
    }))
    note('Q1', size, `the refused bid's window: lit ${JSON.stringify(now.lit)}; Refuse aria-pressed ${now.refusePressed}, fill ${now.refuseLook}; cell ${JSON.stringify(k4)}`)
    await frame(w, 'q1-today-refused', { marks: [T('bid-actions'), T('bid-leave-grid')], around: [T('bid-picker')], label: now.lit.length ? `Today: lit — ${now.lit.join(', ')}` : 'Today: a refused bid — nothing is lit' })
    /* DRAWN: Refuse given Approve-lit's recipe in its own red (Approve lit's fill alpha, a solid edge, near-white words);
       LL wears the app's own lit ring (the class the approved leave's LL wears) */
    const alpha0 = Number((look.approve.bg.match(/^rgba\([^)]*,\s*([\d.]+)\)/) || [])[1])
    const alpha = alpha0 > 0 && alpha0 <= 1 ? alpha0 : 0.45
    await P.evaluate(alpha => {
      const r = document.querySelector('[data-testid="decide-refuse"]')
      r.dataset.drawn = 'refuse-lit'
      Object.assign(r.style, { background: `rgba(240, 85, 95, ${alpha})`, color: '#FFF2F3', borderColor: 'rgba(240, 85, 95, 1)' })
      const ll = document.querySelector('[data-testid="bid-LL"]'); ll.classList.add('lit'); ll.dataset.drawn = 'll-lit'
    }, alpha)
    const check = async () => P.evaluate(() => {
      const r = document.querySelector('[data-drawn="refuse-lit"]'), ll = document.querySelector('[data-drawn="ll-lit"]')
      if (!r || !ll) return 'drawn node missing'
      return getComputedStyle(ll).outlineStyle === 'solid' ? null : 'LL ring not drawn'
    })
    await frame(w, 'q1-drawn-refused', { marks: [T('bid-actions'), T('bid-leave-grid')], around: [T('bid-picker')], label: 'Drawn: Refuse lit, LL ringed', check })
    await L.closeAny(w)

    /* the day's list: an approved morning LL, then a pending afternoon LL refused from the list (only if the window
       lets the afternoon be placed beside the morning) */
    const d = '2026-11-05'
    await placeLL(w, who, d, { approve: true, portion: 'am' })
    await L.openCellR(w, who, d)
    if (!(await L.vis(P, T('portion-pm')))) { note('Q1', size, 'day list NOT DONE — the window on an approved morning offers no PM'); await L.closeAny(w); return }
    await L.press(w, T('portion-pm')); await setSwitch(w, false)
    const placed = await L.placeLeave(w, 'LL')
    if (!placed) { note('Q1', size, 'day list NOT DONE — the afternoon LL was not placed: ' + (await L.sheetDump(P))?.text?.slice(0, 200)); await L.closeAny(w); return }
    const k5 = await kinds(w, who, d)
    await L.openCellR(w, who, d)
    if (!(await L.vis(P, T('daylist-sheet')))) { note('Q1', size, `day list NOT DONE — 5 Nov (${JSON.stringify(k5)}) opened ${await sheetOf(P)}`); await L.closeAny(w); return }
    const bidRec = ((await recsOf(P, who, d)) || []).find(r => r.kind === 'request')
    if (!bidRec) throw new Error('no request saved on 5 Nov')
    await L.press(w, T(`dl-refuse-${bidRec.id}`)); await P.waitForTimeout(500)
    if (!(await L.vis(P, T('daylist-sheet')))) await L.openCellR(w, who, d)
    const k5b = await kinds(w, who, d)
    const line = await L.txt(P, T(`dl-${(await P.evaluate(id => document.querySelector(`[data-testid="dl-refuse-${id}"]`)?.closest('li')?.dataset.testid?.slice(3) ?? '', bidRec.id))}`))
    note('Q1', size, `5 Nov: ${JSON.stringify(k5b)}; the refused line reads: ${line}`)
    const liSel = `li:has([data-testid="dl-refuse-${bidRec.id}"])`
    /* a measure (seen in the first pictures): do the list's rows stand inside the window's content edge, as the title's ✕ does? */
    const fit = await P.evaluate(() => {
      const s = document.querySelector('[data-testid="daylist-sheet"]'), x = document.querySelector('[data-testid="daylist-close"]')
      const r = e => e && Math.round(e.getBoundingClientRect().right)
      const hd = s.querySelector('.bidsheet-hd'), li = s.querySelector('li'), acts = s.querySelector('li .bp-acts, li .dl-acts'), words = s.querySelector('li .bp-words')
      const cs = getComputedStyle(s)
      return { sheetRight: r(s), sheetPadR: cs.paddingRight, headRight: r(hd), closeRight: r(x), liRight: r(li), actsRight: r(acts), actsScroll: acts && acts.scrollWidth - acts.clientWidth, wordsRight: r(words), lastBtnRight: acts && r([...acts.querySelectorAll('button')].pop()), sheetScroll: s.scrollWidth - s.clientWidth,
        liLeft: Math.round(li.getBoundingClientRect().left), actsLeft: acts && Math.round(acts.getBoundingClientRect().left), actsCss: acts && (c => `${c.width} m ${c.marginLeft}/${c.marginRight} box ${c.boxSizing}`)(getComputedStyle(acts)), ulCss: (c => `${c.width} pad ${c.paddingLeft}/${c.paddingRight} m ${c.marginLeft}/${c.marginRight}`)(getComputedStyle(s.querySelector('ul'))), liCss: (c => `${c.width} pad ${c.paddingLeft}/${c.paddingRight}`)(getComputedStyle(li)) }
    })
    note('Q1', size, 'the day list, right edges: ' + JSON.stringify(fit))
    /* SEEN, not asked: where the entries' rows run past the line the title's ✕ and the entry itself end on, a picture of it */
    if (fit.actsRight > fit.liRight + 1) {
      const over = await P.evaluate(() => {
        const s = document.querySelector('[data-testid="daylist-sheet"]'), rows = [...s.querySelectorAll('li .bp-acts, li .bp-words')]
        const li = s.querySelector('li').getBoundingClientRect(), t = Math.min(...rows.map(r => r.getBoundingClientRect().top)), b = Math.max(...rows.map(r => r.getBoundingClientRect().bottom)), r = Math.max(...rows.map(r => r.getBoundingClientRect().right))
        return { x: li.right, y: t, width: Math.max(2, r - li.right), height: b - t }
      })
      await frame(w, 'q1-seen-daylist-edge', { marks: [over, T('daylist-close')], around: [T('daylist-sheet')], label: `Seen: the entries' rows end ${fit.actsRight - fit.liRight} px past the line the ✕ and the entries end on` })
    }
    await frame(w, 'q1-today-daylist', { marks: [liSel], around: [T('daylist-sheet')], label: 'Today: the refused bid in the day\'s list — Refuse not lit' })
    await P.evaluate(([id, alpha]) => { const r = document.querySelector(`[data-testid="dl-refuse-${id}"]`); r.dataset.drawn = 'refuse-lit'; Object.assign(r.style, { background: `rgba(240, 85, 95, ${alpha})`, color: '#FFF2F3', borderColor: 'rgba(240, 85, 95, 1)' }) }, [bidRec.id, alpha])
    await frame(w, 'q1-drawn-daylist', { marks: [liSel], around: [T('daylist-sheet')], label: 'Drawn: Refuse lit in the day\'s list', check: async () => (await P.locator('[data-drawn="refuse-lit"]').count()) ? null : 'drawn Refuse gone' })
    await L.closeAny(w)
  })

  /* ============ R1 — an OD or a course is filed as whole days whatever Duration shows ============ */
  await sc('R1', async () => {
    /* what OD does on such a day, read first on a scratch day (27 Nov), so the window's label states what was seen */
    await placeLL(w, who, '2026-11-27', { approve: true, portion: 'am' })
    await L.openCellR(w, who, '2026-11-27'); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
    const k27 = await kinds(w, who, '2026-11-27')
    const odWhole = k27.some(k => /k-od\|s-a\|(whole|left|right)$/.test(k))
    note('R1', size, `scratch day 27 Nov after OD: ${JSON.stringify(k27)}`)
    const d = '2026-11-30'
    const k0 = await placeLL(w, who, d, { approve: true, portion: 'am' })
    if (!k0.some(k => /k-ll\|s-a\|top/.test(k))) throw new Error('30 Nov morning not approved: ' + JSON.stringify(k0))
    await L.openCellR(w, who, d)
    const am = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="portion-"]')].map(b => `${b.dataset.testid}:${b.getAttribute('aria-pressed')}`))
    note('R1', size, `30 Nov window, Duration: ${am.join(' ')}`)
    const amLit = am.includes('portion-am:true')
    await frame(w, 'r1-today-window', { marks: ['.bidsheet .bp-dur', T('bid-file-OD')], around: [T('bid-picker')], label: `Today: ${amLit ? 'AM lit' : 'AM not lit'}, ${odWhole ? 'OD files the whole day' : 'OD — see the next picture'}` })
    await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
    const k1 = await kinds(w, who, d)
    note('R1', size, `30 Nov after OD: ${JSON.stringify(k1)}`)
    const cell = T(L.cellId(who, d))
    await P.locator(cell).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
    const nm = T(`row-${who}`)
    const words = k1.map(k => { const [t, kind, , place] = k.split('|'); return `${/^(top|right-am)$/.test(place) ? 'morning' : /^(bot|right-pm)$/.test(place) ? 'afternoon' : 'whole-day'} ${t}` }).join(' + ')
    /* the cell on a phone only: at the desktop's real density (1x) the day's cell is ~20 px — the phone's picture (3x) shows the
       same two boxes */
    if (w.phone) await frame(w, 'r1-today-cell', { marks: [cell], around: [cell, T(L.cellId(who, '2026-11-29')), T(L.cellId(who, '2026-12-01'))], label: `Today: Drifter 30 Nov — ${words}`, pad: 6 })
  })

  /* ============ Q3 — the drag window's words over bids already there ============ */
  await sc('Q3', async () => {
    const a = '2026-12-08', z = '2026-12-09'
    const ka = await placeLL(w, who, a, { approve: false, remarks: 'Wedding' })
    const kz = await placeLL(w, who, z, { approve: false })
    const ra = ((await recsOf(P, who, a)) || []).find(r => r.kind === 'request')
    if (!ka.some(k => /k-ll\|s-w/.test(k)) || !kz.some(k => /k-ll\|s-w/.test(k)) || ra?.remarks !== 'Wedding') throw new Error(`fixture: ${JSON.stringify(ka)} ${JSON.stringify(kz)} words ${ra?.remarks}`)
    if (!(await dragCells(w, [who, a], [who, z]))) throw new Error('no drag window')
    const v0 = await P.locator(T('sel-remarks')).inputValue()
    note('Q3', size, `drag window over 8–9 Dec opened; its Remarks box holds "${v0}"; the 8 Dec bid says "${ra.remarks}"`)
    await frame(w, 'q3-today-empty', { marks: [T('sel-rmk-row')], around: [T('select-sheet')], label: v0 ? `Today: the row holds “${v0}”` : 'Today: Remarks empty — the 8 Dec bid says “Wedding”' })
    await L.press(w, T('sel-remarks')); await P.keyboard.type('Exercise'); await P.waitForTimeout(200)
    const v1 = await P.locator(T('sel-remarks')).inputValue()
    await frame(w, 'q3-today-typed', { marks: [T('sel-rmk-row')], around: [T('select-sheet')], label: `Today: “${v1}” typed in the drag window` })
    await L.press(w, T('sel-cancel')); await P.waitForTimeout(300)
    const after = ((await recsOf(P, who, a)) || []).find(r => r.kind === 'request')
    note('Q3', size, `after the window closed, the 8 Dec bid's words: "${after?.remarks}"`)
    /* DRAWN A: the row's box speaks for the bids there — their own words */
    if (!(await dragCells(w, [who, a], [who, z]))) throw new Error('no drag window (drawn A)')
    await P.evaluate(() => { const t = document.querySelector('[data-testid="sel-remarks"]'); t.value = 'Wedding'; t.dataset.drawn = 'words' })
    await frame(w, 'q3-drawn-a', { marks: [T('sel-rmk-row')], around: [T('select-sheet')], label: 'Drawn A: the row shows the bids’ own words', check: async () => (await P.locator('[data-drawn="words"]').inputValue()) === 'Wedding' ? null : 'the words are gone' })
    /* DRAWN B: the row not drawn at all — marked where it stood */
    const gap = await P.evaluate(() => {
      const row = document.querySelector('[data-testid="sel-rmk-row"]'); const r = row.getBoundingClientRect()
      row.style.display = 'none'; row.dataset.drawn = 'hidden'
      const prev = row.previousElementSibling?.getBoundingClientRect(), next = row.nextElementSibling?.getBoundingClientRect()
      const top = prev ? prev.bottom : r.top, bot = next ? next.top : top + 6
      return { x: r.left, y: Math.round((top + bot) / 2) - 1, width: r.width, height: 3, line: true }
    })
    await frame(w, 'q3-drawn-b', { marks: [gap], around: [T('select-sheet')], label: 'Drawn B: no Remarks row — nothing new to place', check: async () => (await P.locator(T('sel-rmk-row')).isVisible()) ? 'the row is back' : null })
    await L.closeAny(w)
  })

  /* ============ R2 — filing raises no manning bubble (phone) ============ */
  if (w.phone) await sc('R2', async () => {
    const d1 = '2026-12-15', d2 = '2026-12-17'
    const a0 = await availP(w, d1)
    const req = await L.setRequired(w, 'p', d1, Number(a0))
    await L.openCellR(w, who, d1)
    const bub0 = { mid: await L.vis(P, T('manning-bubble')), foot: await L.vis(P, T('manning-bubble-foot')) }
    await L.press(w, T('bid-file-OD')); await P.waitForTimeout(800)
    const bub = { mid: await L.vis(P, T('manning-bubble')), foot: await L.vis(P, T('manning-bubble-foot')) }
    bub.words = bub.mid ? await L.txt(P, T('manning-bubble')) : bub.foot ? await L.txt(P, T('manning-bubble-text')) : null
    note('R2', size, `bubble with the window open, before OD: ${JSON.stringify(bub0)}`)
    const k = await kinds(w, who, d1)
    if (!k.some(x => /k-od/.test(x))) throw new Error('no OD on 15 Dec: ' + JSON.stringify(k))
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    await P.locator(T(`avail-p-${d1}`)).first().evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await P.waitForTimeout(300)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    const a1 = (await P.locator(T(`avail-p-${d1}`)).first().innerText()).trim()
    const lv = await P.evaluate(d => document.querySelector(`[data-testid="avail-p-${d}"]`)?.className, d1)
    note('R2', size, `15 Dec: Required P set ${req}; Available P ${a0} → ${a1} (${lv}); bubble after the OD: ${JSON.stringify(bub)}`)
    const bsel = bub.mid ? T('manning-bubble') : bub.foot ? T('manning-bubble-foot') : T('counts-toggle')
    await frame(w, 'r2-today-od', { marks: [bsel, T(`avail-p-${d1}`)], around: [T('counts-toggle'), T(`avail-p-${d1}`)], label: bub.words ? `Today, an OD filed (15 Dec): Available P ${a0} → ${a1}, and the bubble: “${bub.words}”` : `Today, an OD filed (15 Dec): Available P ${a0} → ${a1}, no bubble` })
    /* the comparison: a bid on a second weekday set up the same way, for Ridge (the row under Drifter) */
    const b0 = await availP(w, d2)
    await L.setRequired(w, 'p', d2, Number(b0))
    await L.openCellR(w, ridge, d2); await P.waitForSelector(T('bid-picker')); await setSwitch(w, false)
    const placed = await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
    if (!placed) throw new Error('Ridge\'s LL not placed: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
    const mid = await L.vis(P, T('manning-bubble')), foot = await L.vis(P, T('manning-bubble-foot'))
    const words = mid ? await L.txt(P, T('manning-bubble')) : foot ? await L.txt(P, T('manning-bubble-text')) : null
    note('R2', size, `17 Dec, Ridge's pending LL: bubble ${mid ? 'under the Manning button' : foot ? 'at the foot' : 'none'} — ${words}`)
    if (foot) {
      await frame(w, 'r2-today-bid', { marks: [T('manning-bubble-foot')], around: [T('manning-bubble-foot'), T(L.cellId(ridge, d2))], label: 'Today, for a bid: the bubble', pad: 6 })
    } else if (mid) {
      await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
      await frame(w, 'r2-today-bid', { marks: [T('manning-bubble')], around: [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${d2}`)], label: 'Today, for a bid: the bubble' })
    } else note('R2', size, 'the bid raised no bubble — no comparison picture')
  })

  /* ============ R3 — UNA and the SANS calendar ============ */
  await sc('R3', async () => {
    const d = '2026-12-10'
    const a0 = await availP(w, d)
    const req = await L.setRequired(w, 'p', d, Number(a0) + 2)
    note('R3', size, `10 Dec: Available P ${a0}, Required P set ${req}`)
    const toSans = async () => {
      await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
      await L.press(w, '#inSansMode'); await P.waitForSelector(T('sanscal'), { timeout: 5000 })
      for (let i = 0; i < 14; i++) {
        const m = await P.locator(T('sc-month')).getAttribute('aria-label')
        if (m === 'December 2026') break
        await L.press(w, T(m && /2027/.test(m) ? 'sc-prev' : 'sc-next')); await P.waitForTimeout(350)
      }
      const m = await P.locator(T('sc-month')).getAttribute('aria-label')
      if (m !== 'December 2026') throw new Error('SANS calendar on ' + m)
      await P.locator(T(`sc-day-${d}`)).first().scrollIntoViewIfNeeded(); await P.waitForTimeout(250)
      return L.txt(P, T(`sc-need-${d}`))
    }
    const need0 = await toSans()
    note('R3', size, `SANS calendar, 10 Dec still needed: ${need0}`)
    const week = [T('sc-day-2026-12-07'), T('sc-day-2026-12-13')]
    await frame(w, 'r3-today-before', { marks: [T(`sc-need-${d}`)], around: week, label: `Today: Thu 10 Dec — pilots still needed: ${String(need0).split(/\s+/)[0]}` })
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-stiff"]'); await P.waitForTimeout(700)
    await L.openCellR(w, who, d); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    const k = await kinds(w, who, d)
    if (!k.some(x => /k-una/.test(x))) throw new Error('no UNA on 10 Dec: ' + JSON.stringify(k))
    const a1 = await availP(w, d)
    const need1 = await toSans()
    note('R3', size, `after Drifter's UNA: Available P ${a0} → ${a1}; still needed ${need0} → ${need1}`)
    await frame(w, 'r3-today-after', { marks: [T(`sc-need-${d}`)], around: week, label: `Today, after a UNA on Drifter — pilots still needed: ${String(need1).split(/\s+/)[0]}` })
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-stiff"]'); await P.waitForTimeout(700)
  })

  /* ============ Q2 — his own approved leave and a closed day (fixtures as admin, pictures as the member) ============ */
  await sc('Q2', async () => {
    const kn = await placeLL(w, me, '2026-11-10', { approve: true, remarks: 'Wedding' })
    const ko = await placeLL(w, me, '2026-10-21', { approve: false })
    if (!kn.some(k => /k-ll\|s-a/.test(k)) || !ko.some(k => /k-ll\|s-w/.test(k))) throw new Error(`fixture: 10 Nov ${JSON.stringify(kn)}, 21 Oct ${JSON.stringify(ko)}`)
    /* December opened for bidding, for the member's bid window the drawing clones */
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
    if ((await P.locator(T('od-month-2026-12')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-12')); await P.waitForTimeout(500) }
    const decState = await P.locator(T('od-month-2026-12')).getAttribute('aria-label')
    await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
    note('Q2', size, `December: ${decState}; the chip reads "${await L.txt(P, T('open-chip'))}"`)
    await signOut(P); await signInAs(w, 'member')

    /* TODAY (a): his tap on his approved leave */
    await L.openCellR(w, me, '2026-11-10')
    const sa = await sheetOf(P)
    if (sa !== 'remarks-sheet') throw new Error('his approved leave opened ' + sa)
    const rmk = await P.locator(T('remarks-field')).inputValue()
    note('Q2', size, `(a) his tap on 10 Nov opens ${sa}; its box holds "${rmk}"`)
    const boxA = await P.evaluate(() => { const t = document.querySelector('[data-testid="remarks-field"]'); const c = getComputedStyle(t); return { h: Math.round(t.getBoundingClientRect().height), bg: c.backgroundColor, lh: c.lineHeight } })
    note('Q2', size, `(a) its Remarks box: ${JSON.stringify(boxA)}`)
    await frame(w, 'q2-today-a', { marks: [[T('remarks-doc-row'), '.bidsheet .rmk-row'], T('remarks-save')], around: [T('remarks-sheet')], label: `Today: labelled rows, a light ${boxA.h > 44 ? 'tall' : 'one-line'} box, its own Save` })
    await L.closeAny(w)
    /* TODAY (b): his tap on 21 Oct, closed for him, holding his pending bid */
    await L.openCellR(w, me, '2026-10-21')
    const sb = await sheetOf(P)
    if (sb !== 'closed-note') throw new Error('21 Oct opened ' + sb)
    const till21 = await L.txt(P, T('closed-tilldate'))
    note('Q2', size, `(b) his tap on 21 Oct opens ${sb}: ${(await L.sheetDump(P))?.text?.slice(0, 220)}`)
    await frame(w, 'q2-today-b', { marks: [[T('closed-doc-row'), T('closed-rmk-row')]], around: [T('closed-note')], label: 'Today: labelled Document and Remarks rows' })
    await L.closeAny(w)
    /* the bid window's one row, as HIS bid window draws it on an open December day */
    await L.openCellR(w, me, '2026-12-14')
    const sd = await sheetOf(P)
    if (sd !== 'bid-picker') throw new Error('14 Dec opened ' + sd)
    const row = await P.evaluate(() => { const r = document.querySelector('[data-testid="bid-rmk-row"]'); return r ? { html: r.outerHTML, till: document.querySelector('[data-testid="bid-tilldate"]')?.textContent ?? '' } : null })
    if (!row) throw new Error('no one row in his bid window')
    note('Q2', size, `his bid window on 14 Dec: the one row's till reads "${row.till}"`)
    await frame(w, 'q2-ref-bidrow', { marks: [T('bid-rmk-row')], around: [T('bid-picker')], label: 'Today, his bid window on an open day: the one row' })
    await L.press(w, T('bid-cancel')); await P.waitForTimeout(300)
    const tillFor = (iso) => row.till.replace(/\d{1,2} [A-Z][a-z]{2}/, `${Number(iso.slice(8, 10))} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(iso.slice(5, 7)) - 1]}`)
    /* the clone: its test ids renamed, the words and till of the window it lands in */
    const inject = (html, words, till, where) => P.evaluate(([html, words, till, where]) => {
      const box = document.createElement('div'); box.innerHTML = html.replace(/data-testid="bid-/g, 'data-testid="drawn-')
      const row = box.firstElementChild; row.dataset.drawn = 'row'
      const ta = row.querySelector('textarea'); ta.value = words; ta.textContent = words; ta.style.height = ''
      const tl = row.querySelector('.inped-till'); if (tl) tl.textContent = till
      const cb = row.querySelector('input[type=checkbox]'); if (cb) cb.checked = true
      const anchor = document.querySelector(where.anchor)
      if (where.before) anchor.before(row); else anchor.after(row)
      for (const s of where.hide) for (const e of document.querySelectorAll(s)) e.style.display = 'none'
      /* the box grows with its words as the real one does (useGrow) */
      ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight + (ta.offsetHeight - ta.clientHeight)}px`
      return { till: tl?.textContent, words: ta.value }
    }, [html, words, till, where])
    const drawnOk = async () => P.evaluate(() => { const r = document.querySelector('[data-drawn="row"]'); return r && r.getBoundingClientRect().height > 0 ? null : 'the drawn row is gone' })
    /* DRAWN (a) */
    await L.openCellR(w, me, '2026-11-10')
    if ((await sheetOf(P)) !== 'remarks-sheet') throw new Error('10 Nov did not open its window again')
    const ia = await inject(row.html, rmk, tillFor('2026-11-10'), { anchor: '[data-testid="remarks-sheet"] .bidsheet-hd', before: false, hide: ['[data-testid="remarks-doc-row"]', '[data-testid="remarks-sheet"] .rmk-row', '[data-testid="remarks-sheet"] .rmk-actions'] })
    note('Q2', size, `drawn (a): ${JSON.stringify(ia)}`)
    await frame(w, 'q2-drawn-a', { marks: ['[data-drawn="row"]'], around: [T('remarks-sheet')], label: 'Drawn: the bid window’s one row, no Save', check: drawnOk })
    await L.press(w, T('remarks-cancel')); await P.waitForTimeout(300)
    /* DRAWN (b) */
    await L.openCellR(w, me, '2026-10-21')
    if ((await sheetOf(P)) !== 'closed-note') throw new Error('21 Oct did not open its window again')
    const ib = await inject(row.html, await P.locator(T('closed-remarks')).inputValue(), till21 || tillFor('2026-10-21'), { anchor: T('closed-doc-row'), before: true, hide: [T('closed-doc-row'), T('closed-rmk-row')] })
    note('Q2', size, `drawn (b): ${JSON.stringify(ib)}`)
    await frame(w, 'q2-drawn-b', { marks: ['[data-drawn="row"]'], around: [T('closed-note')], label: 'Drawn: the bid window’s one row, Delete kept', check: drawnOk })
    await L.press(w, T('closed-note-close')); await P.waitForTimeout(300)
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('-') : ''}.json`), JSON.stringify({ log, pics }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
