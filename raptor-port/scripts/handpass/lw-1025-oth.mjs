// OTH IN PLACE OF UNA (25 Oct 26) — his question: could the Inputs page's own "Other" kind (OTH), made admin-only, replace the
// Leave War's UNA, so one entry shows on the Leave War, under the schedule's Unavailable (with its remarks) and on the Inputs page?
// Pictures of the REAL built bundle, each cut to its area, the thing marked with a dashed cyan box and a short label on the
// picture. "Today" pictures inject nothing but the mark and the label. The only DOM changes are named here:
//   - 1a: the Type list is shown open as a list (the select's size), exactly what its drop-down holds;
//   - 5b: a real UNA box placed through the bid window's UNA button, its letters "UNA" read "OTH" on the page (text only).
// Every fixture is made through the app's own controls (sign-in, the Inputs page's "+ Input" window, the schedule's own
// Reject and "→ Unavail" buttons, the bid window's UNA button) and each step asserts it landed.
//   1. today-inputs-kinds   a MEMBER's "+ Input" window — its kinds, "Other" marked (and the "?" list of what each means)
//   2. today-schedule       an Other filed for Drifter on Tue 14 Jul: where it lands on Edit Schedule and on View-only Sched
//   3. drawn-unavail        the same Other moved with the app's own "→ Unavail": Unavailable on Edit Schedule, then View-only
//   4. inputs-page          the Inputs calendar's bar and the opened day
//   5. leavewar             today (no OTH on the war) and the drawing (UNA read as OTH, Available P down by one)
// Usage (from raptor-port/): node scripts/handpass/lw-1025-oth.mjs   [LW_PORT=4180] [SIZES=phone,desk]
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-drawings/oth'
const L = await import('./lw-r3-lib.mjs')
const path = await import('node:path')
const { readdirSync, unlinkSync, writeFileSync } = await import('node:fs')
console.log('lw-1025-oth', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const T = L.T
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && SIZES.some(s => f.includes(`-${s}`))) unlinkSync(path.join(L.OUT, f))

const WHO_CS = 'Drifter'
const REMARKS = 'Under investigation'
const DAY = '2026-07-14'       // Tuesday of the week Edit Schedule opens on (Mon 13 – Sun 19 Jul 26)
const DAY_DI = 1               // its day index in that week
const UNA_DAY = '2026-07-15'   // the next free weekday for Drifter on the Leave War
const NEAR = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17']

const log = []
const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
const pics = []
const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband, [data-testid="manning-bubble"], [data-testid="manning-bubble-foot"] { visibility: hidden !important; }' })

/* THE MARK AND THE LABEL, then the picture cut to them (lw-1025-od-inputs.mjs's frame(), unchanged) */
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

/* ---- small helpers over the app's own controls ---- */
const wins = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"], [data-testid="upconf"], [data-testid="medconf"], [data-testid="win-inputedit"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))
/* a save may be followed by a document ask (never a hard stop — D1150) or an OIL question; answer them as a person with nothing to attach would */
async function answerAsks(w, tag) {
  const P = w.page
  for (let i = 0; i < 3; i++) {
    const open = (await wins(P)).filter(t => t !== 'win-inputedit')
    if (!open.length) return
    note(tag, w.size, `a question opened after the save: ${open.join(', ')}`)
    if (open.includes('docconf')) await L.press(w, T('docconf-nodoc'))
    else if (open.includes('oilconf')) { const no = await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button')].map(b => (b.dataset.testid || '') + ':' + b.innerText.trim())); note(tag, w.size, 'OIL question buttons: ' + no.join(' | ')); throw new Error('an OIL question opened — answer it by hand') }
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
/* the day's section on Edit Schedule / View-only Sched, and a row of it by who and what it says */
const dayScope = (page, di = DAY_DI) => `${page === 'editsched' ? '#eWeek' : '#vWeek'} section.day[data-day="${di}"]`
async function tagRow(P, scope, secCls, attr) {
  return P.evaluate(([scope, secCls, attr]) => {
    document.querySelectorAll(`[${attr}]`).forEach(e => e.removeAttribute(attr))
    const root = document.querySelector(scope)
    if (!root) return { noScope: true }
    const rows = [...root.querySelectorAll(`.${secCls} .pl-row`)]
    const r = rows.find(r => /Drifter/i.test(r.innerText) && /investigation|other/i.test(r.innerText))
    if (!r) return { rows: rows.map(x => x.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)), sec: !!root.querySelector(`.${secCls}`) }
    r.setAttribute(attr, '1')
    return { text: r.innerText.replace(/\s+/g, ' ').trim(), btns: [...r.querySelectorAll('.accb')].map(b => b.textContent.trim()), allRows: rows.length }
  }, [scope, secCls, attr])
}
/* bring the marked things to the middle of the screen (the horizontal week included) */
async function centreOn(P, sels) {
  await P.locator(sels[0]).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const dy = await P.evaluate(sels => { const rs = sels.map(s => document.querySelector(s)?.getBoundingClientRect()).filter(Boolean); if (!rs.length) return 0; const t = Math.min(...rs.map(r => r.top)), b = Math.max(...rs.map(r => r.bottom)); return (t + b) / 2 - innerHeight / 2 }, sels)
  if (Math.abs(dy) > 4) { await P.evaluate(dy => window.scrollBy(0, dy), dy); await P.waitForTimeout(300) }
}
const inputOther = P => P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Other').map(r => ({ iid: r.iid, people: (r.people || []).map(x => x.p), date: r.date, endDate: r.endDate || '', acc: r.acc, rmk: r.remarks, allday: r.allday, s: r.s, e: r.e })))

/* what the Leave War shows of Drifter's week: his cells' boxes and Available P */
async function lwSnap(w, who) {
  const P = w.page
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector(T(`row-${who}`), { timeout: 8000 })
  await P.waitForTimeout(500)
  await L.reachCell(w, who, DAY)
  if (!(await L.vis(P, T(`avail-p-${UNA_DAY}`)))) { await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, T('counts-toggle')); await P.waitForTimeout(700); await L.reachCell(w, who, DAY) }
  const avail = await P.evaluate(days => Object.fromEntries(days.map(d => [d, document.querySelector(`[data-testid="avail-p-${d}"]`)?.textContent?.trim()])), NEAR)
  const cells = {}
  for (const d of NEAR) { const c = await L.cellInfo(P, who, d); cells[d] = (c?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}`) }
  const counts = await P.evaluate(days => Object.fromEntries(days.map(d => [d, Object.fromEntries([...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)].map(e => [e.dataset.testid.slice(6, -11), e.textContent.trim()]))])), [DAY, UNA_DAY])
  return { avail, cells, counts }
}

/* put a person's first day of interest just right of the frozen names (lw-1025-od-inputs.mjs's own) */
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
/* then the vertical: the date heading just under the page's bars, so the dates, the Manning rows and the man's row are in one screen */
async function dateHeadUnderBars(P, iso, top) {
  const dy = await P.evaluate(([iso, top]) => { const h = [...document.querySelectorAll(`[data-testid="head-${iso}"]`)].find(e => e.getBoundingClientRect().width > 0); if (!h) return null; return h.getBoundingClientRect().top - top }, [iso, top])
  if (dy === null) throw new Error('no date heading for ' + iso)
  if (Math.abs(dy) > 3) { await P.evaluate(dy => window.scrollBy(0, dy), dy); await P.waitForTimeout(400) }
}

/* a press on a date of the Inputs calendar — on its own space, never on a bar */
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

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

for (const size of SIZES) {
  console.log(`\n===== ${size} =====`)
  const R = {}   // what was seen, for the report
  const results = []
  const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { note(id, size, 'NOT DONE — ' + String(e).slice(0, 400)); results.push({ id, ok: false }); return false } results.push({ id, ok: true }); return true }

  /* ============ SET 1 — a MEMBER's "+ Input" window: the kinds, "Other" marked ============ */
  await sc('1-member-kinds', async () => {
    const w = await L.newCtx(size)
    try {
      const P = w.page
      await L.signInPlain(w, 'member')
      await hideTransient(P)
      await openInputsList(w)
      await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
      const k = await P.evaluate(() => {
        const sel = document.querySelector('#inpEditType')
        return { kinds: [...sel.querySelectorAll('option')].map(o => (o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label + ' > ' : '') + o.value), person: document.querySelector('#inpEditPersonFixed')?.textContent || document.querySelector('#inpEditPerson')?.value || null }
      })
      R.memberKinds = k.kinds
      note('1-member-kinds', size, `a member is offered ${k.kinds.length} kinds: ${k.kinds.join(' · ')} — person fixed to ${k.person}`)
      if (!k.kinds.some(x => /> Other$/.test(x))) throw new Error('"Other" is not among a member\'s kinds')
      /* 1a — the Type list open as a list: its select shown at full length (the drop-down's own options), nothing added */
      await P.evaluate(() => {
        const sel = document.querySelector('#inpEditType')
        sel.size = sel.querySelectorAll('option, optgroup').length
        sel.style.height = 'auto'
        const o = [...sel.querySelectorAll('option')].find(o => o.value === 'Other'); if (o) o.selected = true
        sel.scrollIntoView({ block: 'center' })
      })
      await P.waitForTimeout(400)
      const optRect = await P.evaluate(() => { const o = [...document.querySelectorAll('#inpEditType option')].find(o => o.value === 'Other'); const r = o.getBoundingClientRect(); const s = document.querySelector('#inpEditType').getBoundingClientRect(); return { r: [r.left, r.top, r.width, r.height].map(Math.round), s: [s.left, s.top, s.width, s.height].map(Math.round) } })
      note('1-member-kinds', size, `Other's row in the list: ${JSON.stringify(optRect)}`)
      let mark = { x: optRect.r[0], y: optRect.r[1], width: optRect.r[2], height: optRect.r[3] }
      if (optRect.r[2] < 2 || optRect.r[3] < 2) {   // a browser that draws no box for an option: the list's rows are equal, so its place is counted
        const idx = await P.evaluate(() => [...document.querySelectorAll('#inpEditType option, #inpEditType optgroup')].findIndex(o => o.tagName === 'OPTION' && o.value === 'Other'))
        const n = await P.evaluate(() => document.querySelectorAll('#inpEditType option, #inpEditType optgroup').length)
        const s = optRect.s
        mark = { x: s[0] + 2, y: s[1] + 2 + (s[3] - 4) * idx / n, width: s[2] - 4, height: (s[3] - 4) / n }
        note('1-member-kinds', size, 'the option has no box of its own here; its place is counted: ' + JSON.stringify(mark))
      }
      await frame(w, '1a-today-inputs-kinds', { marks: [mark], around: ['#inpEditType', '[data-testid="win-inputedit"] .inped-f'], label: 'Today: a member can file "Other"', pad: 6 })
      /* put the select back, then 1b — the "?" list of what each kind means, "Other" marked */
      await P.evaluate(() => { const sel = document.querySelector('#inpEditType'); sel.size = 0; sel.removeAttribute('size'); sel.style.height = '' })
      await L.press(w, '#inTypeHelp'); await P.waitForSelector('#inTypePop', { timeout: 4000 }); await P.waitForTimeout(400)
      const meaning = await P.evaluate(() => {
        document.querySelectorAll('[data-qoth]').forEach(e => e.removeAttribute('data-qoth'))
        const rows = [...document.querySelectorAll('#inTypePop .tylegend-r')]
        const r = rows.find(r => r.querySelector('b')?.textContent.trim() === 'Other')
        const grp = r?.closest('.tylegend-g')
        if (r) { r.setAttribute('data-qoth', '1'); grp.setAttribute('data-qgrp', '1'); grp.scrollIntoView({ block: 'nearest' }) }
        return { text: r ? r.innerText.replace(/\s+/g, ' ').trim() : null, group: grp?.querySelector('.tylegend-gt')?.textContent, groupRule: grp?.querySelector('.tylegend-gr')?.textContent }
      })
      note('1-member-kinds', size, `the "?" list says of Other: "${meaning.text}" (group ${meaning.group}: ${meaning.groupRule})`)
      if (meaning.text) await frame(w, '1b-today-inputs-kinds-legend', { marks: ['[data-qoth="1"]'], around: ['[data-qgrp="1"]'], label: 'Today: what "Other" means in the list a member sees', pad: 6 })
      else throw new Error('the "?" list has no Other row')
    } finally { if (w.errs.length) note('1-member-kinds', size, 'errors: ' + w.errs.slice(0, 6).join(' || ')); await w.ctx.close() }
  })

  /* ============ the ADMIN's world: file the Other, then the pictures that follow it ============ */
  const w = await L.newCtx(size)
  const P = w.page
  const asAdmin = async page => { await L.signInPlain(w, 'admin'); await hideTransient(P); if (page) { await P.evaluate(p => window.go(p), page); await P.waitForTimeout(1500) } }
  const asMember = async page => { await L.signInPlain(w, 'member'); await hideTransient(P); await P.evaluate(p => window.go(p), page); await P.waitForTimeout(1500) }
  await asAdmin()
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids[WHO_CS]
  console.log(size, WHO_CS, '=', who)
  let filed = null
  let before = null

  /* the Leave War before anything is filed: Drifter's days empty, Available P as it stands */
  await sc('0-baseline', async () => {
    before = await lwSnap(w, who)
    note('0-baseline', size, `before filing — Available P ${JSON.stringify(before.avail)} · Drifter's boxes ${JSON.stringify(before.cells)}`)
    for (const d of [DAY, UNA_DAY]) if (before.cells[d].length) throw new Error(`${d} is not empty for ${WHO_CS}: ${JSON.stringify(before.cells[d])}`)
    R.before = before
  })

  /* the Other, filed through the Inputs page's own "+ Input" window */
  await sc('file-other', async () => {
    await openInputsList(w)
    await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
    await P.locator('#inpEditPerson').selectOption({ label: WHO_CS })
    await P.locator('#inpEditType').selectOption('Other'); await P.waitForTimeout(400)
    const dflt = await P.evaluate(() => ({ title: document.querySelector('#inpEditOwnTitle')?.value, allday: document.querySelector('#inpEditAllday')?.checked, start: document.querySelector('#inpEditStart')?.value, end: document.querySelector('#inpEditEnd')?.value }))
    R.otherDefaults = dflt
    note('file-other', size, `a new Other opens with title "${dflt.title}", all day ${dflt.allday}, times ${dflt.start}–${dflt.end}`)
    if (!dflt.allday) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(300) }
    if (!(await P.evaluate(() => document.querySelector('#inpEditAllday').checked))) throw new Error('"all day" would not tick')
    await P.locator('#inpEditRmk').fill(REMARKS)
    await L.press(w, `[data-testid="inpEdCal-day-${DAY}"]`); await P.waitForTimeout(500)
    await L.press(w, '#inpEditSave'); await P.waitForTimeout(1000)
    await answerAsks(w, 'file-other')
    await P.waitForTimeout(500)
    const rec = (await inputOther(P)).filter(r => r.people.includes(who))
    note('file-other', size, 'filed: ' + JSON.stringify(rec))
    if (rec.length !== 1 || !/Jul 14/.test(rec[0].date) || rec[0].rmk !== REMARKS || !rec[0].allday) throw new Error('the Other did not land as asked: ' + JSON.stringify(rec))
    filed = rec[0]
    R.filedAcc = filed.acc
  })
  if (!filed) { note('abort', size, 'no Other was filed — the schedule, Inputs and Leave War sets cannot be taken'); if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || ')); await w.ctx.close(); continue }

  /* ============ SET 5a — the Leave War TODAY: the Other is not on it ============ */
  await sc('5a-leavewar-today', async () => {
    const after = await lwSnap(w, who)
    note('5a-leavewar-today', size, `after filing — Available P ${JSON.stringify(after.avail)} · Drifter's boxes ${JSON.stringify(after.cells)}`)
    if (after.cells[DAY].length) throw new Error(`an Other shows on the Leave War: ${JSON.stringify(after.cells[DAY])}`)
    if (after.avail[DAY] !== before.avail[DAY]) throw new Error(`Available P on ${DAY} moved ${before.avail[DAY]} → ${after.avail[DAY]} with an Other`)
    R.afterOther = after
    await P.waitForTimeout(500)
    const besideNames = await alignGrid(P, who, '2026-07-13')
    await dateHeadUnderBars(P, DAY, 112)
    const names = `${T('row-' + who)} td.who`
    const around = [T('head-2026-07-13'), T('head-2026-07-17'), T('avail-p-2026-07-17'), names, ...NEAR.map(d => T(L.cellId(who, d)))]
    await frame(w, '5a-today-leavewar', { marks: [T(L.cellId(who, DAY)), T(`avail-p-${DAY}`)], around, label: `Today: an Other is not on the Leave War (Drifter, Tue 14 Jul). Available P stays ${after.avail[DAY]}.`, pad: 6 })
  })

  /* ============ SET 2a — Edit Schedule: where the Other lands TODAY ============ */
  await sc('2a-today-schedule-edit', async () => {
    await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
    const D = dayScope('editsched')
    await P.waitForSelector(D, { timeout: 8000 })
    const hdr = await P.evaluate(D => document.querySelector(D)?.innerText.replace(/\s+/g, ' ').slice(0, 40), D)
    note('2a-today-schedule-edit', size, `the day card: "${hdr}"`)
    /* Personal Inputs folds by default: open it the app's own way, a press on its heading */
    if (await L.vis(P, `${D} [data-pitog="${DAY_DI}"]`)) { await L.press(w, `${D} [data-pitog="${DAY_DI}"]`); await P.waitForTimeout(700) }
    const g = await tagRow(P, D, 'sec-grnd', 'data-qg'), p = await tagRow(P, D, 'sec-inp', 'data-qp')
    note('2a-today-schedule-edit', size, `Ground Programme row: ${JSON.stringify(g)} · Personal Inputs row: ${JSON.stringify(p)}`)
    R.groundRow = g; R.personalRow = p
    if (!g.text) throw new Error('no Other row on the Ground Programme: ' + JSON.stringify(g))
    const marks = ['[data-qg="1"]'], around = [`${D} .sec-grnd`]
    if (p.text) { marks.push('[data-qp="1"]'); around.push(`${D} .sec-inp`) }
    await centreOn(P, marks)
    await frame(w, '2a-today-schedule-edit', { marks, around, label: 'Today: an Other lands as a commitment he is doing', pad: 6 })
  })

  /* ============ SET 2b — View-only Sched, as a MEMBER (a fresh sign-in, the Other already filed) ============ */
  await sc('2b-today-schedule-view', async () => {
    await asMember('viewsched')
    const D = dayScope('viewsched')
    await P.waitForSelector(D, { timeout: 8000 })
    const g = await tagRow(P, D, 'sec-grnd', 'data-qg')
    const secs = await P.evaluate(D => [...document.querySelectorAll(`${D} .sec, ${D} .sub`)].map(s => s.className.replace(/\s+/g, '.') + ' :: ' + s.innerText.replace(/\s+/g, ' ').slice(0, 50)), D)
    note('2b-today-schedule-view', size, `member's View-only Sched, Tue 14 Jul — Ground Programme row: ${JSON.stringify(g)} · sections: ${secs.join(' || ')}`)
    R.viewGround = g
    if (!g.text) {   // not shown to a member: say so on the section the row would be in
      const has = await P.evaluate(D => !!document.querySelector(`${D} .sec-grnd`), D)
      note('2b-today-schedule-view', size, `the Other is NOT on the member's Ground Programme (section there: ${has})`)
      if (has) { await centreOn(P, [`${D} .sec-grnd`]); await frame(w, '2b-today-schedule-view', { marks: [`${D} .sec-grnd`], around: [`${D} .sec-grnd`], label: 'Today, as a member sees it: no Other on the Ground Programme', pad: 6 }) }
      return
    }
    await centreOn(P, ['[data-qg="1"]'])
    await frame(w, '2b-today-schedule-view', { marks: ['[data-qg="1"]'], around: [`${D} .sec-grnd`], label: 'Today: an Other lands as a commitment he is doing', pad: 6 })
  })

  /* ============ SET 3a — "→ Unavail" on Edit Schedule (Reject first, as the app's own buttons offer) ============ */
  let moved = false
  await sc('3a-drawn-unavail-edit', async () => {
    await asAdmin('editsched')
    const D = dayScope('editsched')
    await P.waitForSelector(D, { timeout: 8000 })
    if (await L.vis(P, `${D} [data-pitog="${DAY_DI}"]`)) { await L.press(w, `${D} [data-pitog="${DAY_DI}"]`); await P.waitForTimeout(700) }
    const btns = async () => P.evaluate(([D, iid]) => [...document.querySelectorAll(`${D} .accb[data-acck="${iid}"]`)].map(b => b.dataset.acc + ':' + b.textContent.trim()), [D, filed.iid])
    note('3a-drawn-unavail-edit', size, 'buttons on the Other before: ' + (await btns()).join(', '))
    await L.press(w, `${D} .sec-inp .accb[data-acc="x"][data-acck="${filed.iid}"]`); await P.waitForTimeout(800)
    const b2 = await btns()
    note('3a-drawn-unavail-edit', size, 'after Reject, the Other offers: ' + b2.join(', '))
    if (!b2.some(x => x.startsWith('u:'))) throw new Error('no "→ Unavail" offered after Reject: ' + b2.join(', '))
    await L.press(w, `${D} .sec-inp .accb[data-acc="u"][data-acck="${filed.iid}"]`); await P.waitForTimeout(1000)
    const asks = (await wins(P)).filter(t => t !== 'win-inputedit')
    note('3a-drawn-unavail-edit', size, asks.length ? `"→ Unavail" opened: ${asks.join(', ')}` : '"→ Unavail" asked no OIL question (nothing opened)')
    R.unavailAsk = asks
    if (asks.includes('oilconf')) throw new Error('an OIL question opened on → Unavail — answer No by hand')
    const rec = (await inputOther(P)).find(r => r.iid === filed.iid)
    note('3a-drawn-unavail-edit', size, 'the Other is now: ' + JSON.stringify(rec))
    if (rec?.acc !== 'u') throw new Error('the Other is not filed under Unavailable: ' + JSON.stringify(rec))
    moved = true
    const u = await tagRow(P, D, 'sec-unav', 'data-qu')
    note('3a-drawn-unavail-edit', size, `Unavailable row: ${JSON.stringify(u)}`)
    R.unavailRow = u
    if (!u.text) throw new Error('no row of Drifter under Unavailable: ' + JSON.stringify(u))
    await centreOn(P, ['[data-qu="1"]', `${D} .sec-unav`])
    await frame(w, '3a-drawn-unavail-edit', { marks: ['[data-qu="1"]'], around: [`${D} .sec-unav`], label: 'Your OTH: under Unavailable, its remarks shown to everyone', pad: 6 })
  })

  /* ============ SET 3b — View-only Sched's Unavailable, as a MEMBER ============ */
  await sc('3b-drawn-unavail-view', async () => {
    if (!moved) throw new Error('the Other was not moved under Unavailable')
    await asMember('viewsched')
    const D = dayScope('viewsched')
    await P.waitForSelector(D, { timeout: 8000 })
    const u = await tagRow(P, D, 'sec-unav', 'data-qu')
    note('3b-drawn-unavail-view', size, `member's Unavailable row: ${JSON.stringify(u)}`)
    R.viewUnavail = u
    if (!u.text) throw new Error('no row of Drifter in the member\'s Unavailable: ' + JSON.stringify(u))
    const g = await tagRow(P, D, 'sec-grnd', 'data-qg2')
    note('3b-drawn-unavail-view', size, `member's Ground Programme still holds an Other: ${!!g.text}`)
    await centreOn(P, ['[data-qu="1"]', `${D} .sec-unav`])
    await frame(w, '3b-drawn-unavail-view', { marks: ['[data-qu="1"]'], around: [`${D} .sec-unav`], label: 'Your OTH: under Unavailable, its remarks shown to everyone', pad: 6 })
  })

  /* ============ SET 4 — the Inputs page: the calendar's bar and the opened day ============ */
  let barKey = null
  await sc('4a-inputs-calendar', async () => {
    await asAdmin('inputs')
    await P.evaluate(() => window.scrollTo(0, 0))
    if (await L.vis(P, '#inCalBtn') && (await P.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') { await L.press(w, '#inCalBtn'); await P.waitForTimeout(700) }
    await P.waitForSelector(T('ib-grid'), { timeout: 5000 })
    for (let i = 0; i < 14; i++) {
      const mon = ((await P.evaluate(() => document.querySelector('.ic-mon')?.getAttribute('aria-label'))) || '').toLowerCase()
      const m = mon.match(/([a-z]+)\s+(\d{4})/)
      if (!m) throw new Error('no month label: ' + mon)
      const diff = (2026 * 12 + 6) - (+m[2] * 12 + MONTHS.indexOf(m[1]))   // July 2026 is month index 6
      if (diff === 0) break
      await L.press(w, diff > 0 ? '#icNext' : '#icPrev'); await P.waitForTimeout(450)
    }
    const mon = await P.evaluate(() => document.querySelector('.ic-mon')?.getAttribute('aria-label'))
    if (!/July 2026/i.test(mon || '')) throw new Error('the calendar did not reach July 2026: ' + mon)
    const wk = await P.evaluate(day => {
      const cell = document.querySelector(`[data-icday="${day}"]`)
      const week = cell?.closest('.ib-week')
      if (!week) return null
      return { week: week.dataset.testid, bars: [...week.querySelectorAll('.ib-bar')].map(b => ({ key: b.dataset.iid, cls: b.className, text: b.textContent.trim(), title: b.getAttribute('title') || '' })) }
    }, DAY)
    if (!wk) throw new Error('no week holds ' + DAY)
    note('4a-inputs-calendar', size, `${wk.week}: ${wk.bars.length} bars — ${wk.bars.map(b => `[${b.text} | ${b.cls.replace(/\bib-bar\b\s*/, '')} | ${b.title.slice(0, 60)}]`).join(' ')}`)
    const bar = wk.bars.find(b => b.key === filed.iid) || wk.bars.find(b => /Drifter/.test(b.title + ' ' + b.text) && /other|investigation/i.test(b.title + ' ' + b.text))
    if (!bar) throw new Error('no bar of the Other in that week')
    barKey = bar.key
    note('4a-inputs-calendar', size, `the Other's bar: words "${bar.text}" · class "${bar.cls}" · hover "${bar.title}"`)
    R.calBar = bar
    const barSel = `[data-testid="ib-bar-${barKey}"]`
    await P.locator(barSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await P.waitForTimeout(300)
    await frame(w, '4a-inputs-calendar', { marks: [barSel], around: [`[data-testid="${wk.week}"]`], label: 'On the Inputs page: shown as today', pad: 6 })
  })
  await sc('4b-inputs-day', async () => {
    if (!barKey) throw new Error('no bar found on the calendar')
    await pressDay(w, DAY)
    await P.waitForSelector(T('win-inputsday'), { timeout: 5000 })
    await P.waitForTimeout(600)
    const d = await P.evaluate(() => {
      const win = document.querySelector('[data-testid="win-inputsday"]')
      document.querySelectorAll('[data-qcard]').forEach(e => e.removeAttribute('data-qcard'))
      const cards = [...win.querySelectorAll('.icard')]
      const c = cards.find(c => /Drifter/.test(c.innerText) && /investigation|other/i.test(c.innerText))
      if (c) c.dataset.qcard = '1'
      return { cards: cards.map(c => c.innerText.replace(/\s+/g, ' ').trim().slice(0, 100)), found: !!c }
    })
    note('4b-inputs-day', size, `the day opened: ${d.cards.length} cards — ${d.cards.join(' || ')}`)
    if (!d.found) throw new Error('no card of the Other in the opened day')
    await P.locator('[data-qcard="1"]').first().evaluate(e => e.scrollIntoView({ block: 'nearest' })); await P.waitForTimeout(250)
    await frame(w, '4b-inputs-day', { marks: ['[data-qcard="1"]'], around: [`${T('win-inputsday')} .win-bar`], label: 'On the Inputs page: shown as today', pad: 6 })
    await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  })

  /* ============ SET 5b — the Leave War DRAWN: a UNA box read as OTH, Available P down by one ============ */
  await sc('5b-leavewar-drawn', async () => {
    await asAdmin('leavewar')
    await P.waitForSelector(T(`row-${who}`), { timeout: 8000 })
    const pre = await lwSnap(w, who)
    if (pre.cells[UNA_DAY].length) throw new Error(`${UNA_DAY} is not free: ${JSON.stringify(pre.cells[UNA_DAY])}`)
    await L.openCellR(w, who, UNA_DAY)
    await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await L.press(w, T('bid-una')); await P.waitForTimeout(800)
    await L.closeAny(w)
    const post = await lwSnap(w, who)
    note('5b-leavewar-drawn', size, `UNA placed on ${UNA_DAY}: Drifter's boxes ${JSON.stringify(post.cells)} · Available P ${JSON.stringify(pre.avail)} → ${JSON.stringify(post.avail)}`)
    if (!post.cells[UNA_DAY].some(x => /k-una/.test(x))) throw new Error('the UNA did not land: ' + JSON.stringify(post.cells[UNA_DAY]))
    if (+post.avail[UNA_DAY] !== +pre.avail[UNA_DAY] - 1) throw new Error(`Available P on ${UNA_DAY} did not drop by one: ${pre.avail[UNA_DAY]} → ${post.avail[UNA_DAY]}`)
    const fell = Object.keys(post.counts[UNA_DAY]).filter(k => post.counts[UNA_DAY][k] !== pre.counts[UNA_DAY][k]).map(k => ({ id: k, from: pre.counts[UNA_DAY][k], to: post.counts[UNA_DAY][k] }))
    note('5b-leavewar-drawn', size, `Manning counters on ${UNA_DAY} that changed with the UNA: ${JSON.stringify(fell)} (Drifter's Other on ${DAY} changed none: ${JSON.stringify(pre.counts[DAY]) === JSON.stringify(before.counts[DAY])})`)
    R.una = { before: pre.avail[UNA_DAY], after: post.avail[UNA_DAY], counters: fell }
    await P.waitForTimeout(6500)   // the just-added ring gone before the picture
    await alignGrid(P, who, '2026-07-13')
    await dateHeadUnderBars(P, DAY, 112)
    /* the DRAWING: the box's letters read OTH — a text change on the page, nothing stored */
    const swapped = await P.evaluate(([who, d]) => { let n = 0; for (const e of document.querySelectorAll(`[data-testid="cell-${who}-${d}"] .c.k-una`)) for (const t of [...e.childNodes]) if (t.nodeType === 3 && /UNA/.test(t.textContent)) { t.textContent = t.textContent.replace('UNA', 'OTH'); n++ } return n }, [who, UNA_DAY])
    note('5b-leavewar-drawn', size, `letters changed on ${swapped} box(es); the box reads "${await P.evaluate(([who, d]) => document.querySelector(`[data-testid="cell-${who}-${d}"] .c`)?.textContent, [who, UNA_DAY])}"`)
    if (!swapped) throw new Error('no UNA letters to change to OTH')
    const names = `${T('row-' + who)} td.who`
    const around = [T('head-2026-07-13'), T('head-2026-07-17'), T('avail-p-2026-07-17'), names, ...NEAR.map(d => T(L.cellId(who, d)))]
    await frame(w, '5b-drawn-leavewar', { marks: [T(L.cellId(who, UNA_DAY)), T(`avail-p-${UNA_DAY}`), ...fell.map(f => T(`count-${f.id}-${UNA_DAY}`))], around, label: `Drawn: on the Leave War it reads OTH and takes him out of the manning (Available P ${pre.avail[UNA_DAY]} → ${post.avail[UNA_DAY]}${fell.length ? '; ' + fell.map(f => `${f.id.toUpperCase()} ${f.from} → ${f.to}`).join(', ') : ''})`, pad: 6,
      check: async () => (await P.evaluate(([who, d]) => /OTH/.test(document.querySelector(`[data-testid="cell-${who}-${d}"] .c`)?.textContent || ''), [who, UNA_DAY])) ? null : 'the letters went back to UNA' })
  })

  if (w.errs.length) note('errors', size, w.errs.slice(0, 8).join(' || '))
  else note('errors', size, 'none (console, page, 4xx)')
  await w.ctx.close()
  note('summary', size, JSON.stringify(R))
  note('results', size, results.map(r => `${r.id}:${r.ok ? 'ok' : 'NOT DONE'}`).join(' '))
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `run-${SIZES.join('-')}.json`), JSON.stringify({ log, pics }, null, 1))
console.log('DONE', pics.length, 'pictures;', log.filter(l => /NOT DONE/.test(l.said)).length, 'not done')
