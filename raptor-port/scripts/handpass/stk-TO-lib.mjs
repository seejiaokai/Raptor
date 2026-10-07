/* walker TO (the Codex stack check, 5 Oct 26) — helpers on top of ins-a-lib (wh-b-lib, wh-lib, dbrA-lib, dbrA-W1-lib).
   Every gesture is the app's own control: the board's "+ Wave" → "Flying wave", "+ Line", the formation boxes, a drag
   from the crew list, the "+ In-time / Rally" button and its lines (typed with the real keyboard), the ✕ on a line,
   Logic's "Edit rules" boxes, the Insights window. window.* only to get to a place and to READ what the app holds. */
import * as B from './ins-a-lib.mjs'
export * from './ins-a-lib.mjs'
const { L, W } = B
export const sleep = L.sleep
export const SURF = { week: '#eWeek', board: '#sbBoard' }
export const idOf = (p, cs) => p.evaluate(c => (Object.entries(window.PEOPLE).find(([, v]) => v.cs === c) || [])[0] || null, cs)

/* ---------- building a wave on the open board ---------- */
export async function addWave(p, di) {
  await W.boardOn(p, di)
  const n0 = await p.evaluate(i => window.DAYS[i].waves.length, di)
  const b = p.locator(`#schedBoard [data-wvadd="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await b.click(); await sleep(450)
  await p.locator('button:visible', { hasText: /^Flying wave$/ }).first().click(); await sleep(700)
  const n1 = await p.evaluate(i => window.DAYS[i].waves.length, di)
  if (n1 !== n0 + 1) throw new Error(`"+ Wave" → "Flying wave" did not add a wave (${n0} → ${n1})`)
  return n1 - 1
}
export async function addLine(p, di, gi) {
  const n0 = await p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi])
  const b = p.locator(`#schedBoard [data-gline="${di}.${gi}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await b.click(); await sleep(600)
  const n1 = await p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi])
  if (n1 !== n0 + 1) throw new Error(`"+ Line" did not add a formation (${n0} → ${n1})`)
  return n1 - 1
}
/* a box on the open board: clicked, cleared, typed with the keyboard, left with Tab */
export async function box(p, key, value) {
  const el = p.locator(`#sbBoard [data-bfld="${key}"]:visible`).first()
  if (!(await el.count())) throw new Error('no board box ' + key)
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete')
  if (value !== '') await p.keyboard.type(String(value), { delay: 8 })
  await p.keyboard.press('Tab'); await sleep(350)
  return p.locator(`#sbBoard [data-bfld="${key}"]:visible`).first().inputValue().catch(() => null)
}
export async function form(p, di, gi, li, f) {
  const out = {}
  for (const k of ['cs', 'msn', 'br', 'to', 'ld']) if (f[k] !== undefined) out[k] = await box(p, `ff:${di}.${gi}.${li}.${k}`, f[k])
  return out
}
/* seat by callsign from the board's crew list (a drag on a desktop; the AIRCREW drawer on a phone) */
export async function seat(p, slot, cs) {
  const id = await idOf(p, cs); if (!id) return { err: 'no such person ' + cs }
  if (!B.PHONE) { const r = await B.seatPut(p, slot, id); return { ...r, cs, id } }
  /* a phone: tap the empty seat (it arms and the AIRCREW drawer slides in), then tap the name in the drawer */
  const holds = () => p.evaluate(s => { const [di, gi, li, ai, k] = s.split('.'); return window.DAYS[+di].waves[+gi].formations[+li].aircraft[+ai][k] || '' }, slot)
  const before = await holds()
  const st = p.locator(`#schedBoard [data-slot="${slot}"]:visible`).first()
  await st.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await st.click(); await sleep(550)
  const rp = p.locator(`#sbRoster .rpuck[data-person="${id}"]`).first()
  await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  const onScreen = await rp.evaluate(e => { const b = e.getBoundingClientRect(); return b.x >= 0 && b.right <= innerWidth && b.width > 0 })
  if (!onScreen) { await p.keyboard.press('Escape'); return { before, after: await holds(), took: false, err: 'the crew drawer did not open on the seat tap', cs, id } }
  await rp.click({ timeout: 4000 }); await sleep(650)
  const after = await holds()
  return { before, after, took: after === id, cs, id }
}
/* a whole formation in a NEW wave or as a new line */
export async function newForm(p, di, gi, f, crew) {
  const li = gi.li !== undefined ? gi.li : 0
  const g = gi.gi !== undefined ? gi.gi : gi
  const typed = await form(p, di, g, li, f)
  const seats = []
  if (crew && crew[0]) seats.push(await seat(p, `${di}.${g}.${li}.0.p`, crew[0]))
  if (crew && crew[1]) seats.push(await seat(p, `${di}.${g}.${li}.0.w`, crew[1]))
  return { typed, seats, ok: seats.every(s => s.took) }
}

/* ---------- the In-time / Rally lines ---------- */
const root = surf => SURF[surf]
/* everything a wave's reporting box SHOWS on a surface: each line's words, the feedback under them (words, colour,
   drawn or not), the "+ In-time / Rally" button, and (board) the wave header's own words */
export async function itRead(p, surf, di, gi) {
  return p.evaluate(([r, di, gi]) => {
    const R = document.querySelector(r); if (!R || !R.offsetWidth) return { err: 'surface not on screen: ' + r, lines: [], fb: '' }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const boxEl = R.querySelector(`[data-intimes="${di}|${gi}"]`)
    const lines = [...R.querySelectorAll(`[data-itline^="${di}|${gi}|"]`)].map(e => ({ key: e.dataset.itline, text: t(e), bold: t(e.querySelector('b')), title: e.getAttribute('title') || '', cls: e.className }))
    const fbs = [...R.querySelectorAll(`[data-reporting-feedback][data-warnkey="it:${di}.${gi}"]`)].map(e => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return { text: t(e), raw: (e.textContent || '').trim(), color: cs.color, shown: cs.display !== 'none' && b.width > 0 && b.height > 0 } })
    const add = R.querySelector(`[data-itadd="${di}|${gi}"]`)
    let hdr = ''
    if (add) { let e = add; for (let i = 0; i < 5 && e; i++) { e = e.parentElement; if (e && /\d+ ac\b/.test(t(e))) { const m = /In-time \/ Rally[^·]*· \d+ ac/.exec(t(e)); hdr = m ? m[0] : t(e).slice(0, 160); break } } }
    return { lines: lines.map(l => l.text), detail: lines, fb: fbs.filter(f => f.shown).map(f => f.text).join(' | '), fbColor: (fbs.find(f => f.shown) || {}).color || '', fbAll: fbs, addBtn: add ? t(add) : null, hdr, boxText: t(boxEl).slice(0, 400), boxCls: boxEl ? boxEl.className : null }
  }, [root(surf), di, gi])
}
/* press "+ In-time / Rally" on a surface; returns what the new line reads and where the caret is */
export async function itAdd(p, surf, di, gi) {
  const b = p.locator(`${root(surf)} [data-itadd="${di}|${gi}"]:visible`).first()
  if (!(await b.count())) return { err: `no "+ In-time / Rally" button on the ${surf} for wave ${gi + 1}`, lines: [] }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  const top = await b.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
  const label = (await b.innerText()).trim()
  await b.click(); await sleep(600)
  const r = await itRead(p, surf, di, gi)
  const caret = await p.evaluate(() => { const a = document.activeElement; return a ? { it: a.dataset ? a.dataset.itline || null : null, text: (a.innerText || a.value || '').slice(0, 80), tag: a.tagName } : null })
  return { label, top, lines: r.lines, added: r.lines[r.lines.length - 1], caret, fb: r.fb }
}
/* retype line i of a wave: click it, select all, type, leave with Tab (the app's own commit) */
export async function itType(p, surf, di, gi, i, text, { leave = 'Tab' } = {}) {
  const el = p.locator(`${root(surf)} [data-itline="${di}|${gi}|${i}"]:visible`).first()
  if (!(await el.count())) return { err: `no line ${i} on the ${surf}`, lines: [], fb: '' }
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete')
  if (text !== '') await p.keyboard.type(text, { delay: 8 })
  if (leave === 'blur') await el.evaluate(e => e.blur()); else await p.keyboard.press(leave)
  await sleep(550)
  return itRead(p, surf, di, gi)
}
export async function itDel(p, surf, di, gi, i) {
  const b = p.locator(`${root(surf)} [data-itdel="${di}|${gi}|${i}"]:visible`).first()
  if (!(await b.count())) return { err: 'no ✕ on that line', lines: [], fb: '' }
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(150); await b.click(); await sleep(500)
  return itRead(p, surf, di, gi)
}
/* bring a wave's reporting box to the middle of the window for the picture */
export async function itShow(p, surf, di, gi) {
  await p.evaluate(([r, di, gi]) => { const e = document.querySelector(`${r} [data-intimes="${di}|${gi}"]`) || document.querySelector(`${r} [data-itadd="${di}|${gi}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [root(surf), di, gi])
  await sleep(250)
}

/* ---------- Insights' work hours, whichever door this width has ---------- */
export async function insDoor(p) {
  if (await p.locator('#insightModal:not([hidden]) #insightBody').count()) return { how: 'already open' }
  const doors = [['#sbInsights', 'the board\'s Insights'], ['#insightBtn', 'top bar Insights']]
  for (const [sel, how] of doors) { const b = p.locator(sel + ':visible').first(); if (await b.count()) { await b.click(); await sleep(550); if (await p.locator('#insightBody').count()) return { how } } }
  const menus = [['#sbMore', '#sbMoreInsights', 'the board\'s ⋯ → Insights'], ['#editSchedMore', '#editSchedMoreMenu button, #editSchedMoreMenu [role="menuitem"]', 'Edit Schedule\'s ⋯ → Insights'], ['#viewSchedMore', '#viewSchedMoreMenu button, #viewSchedMoreMenu [role="menuitem"]', 'View-only Sched\'s ⋯ → Insights']]
  for (const [m, it, how] of menus) { const b = p.locator(m + ':visible').first(); if (await b.count()) { await b.click(); await sleep(350); const x = p.locator(it).filter({ hasText: /Insights/ }).first(); if (await x.count()) { await x.click(); await sleep(550); if (await p.locator('#insightBody').count()) return { how } } else await p.keyboard.press('Escape') } }
  /* a phone without those: the ☰ drawer's own Insights row */
  const bg = p.locator('#burger:visible').first()
  if (await bg.count()) {
    await bg.click(); await sleep(450)
    const d = p.locator('#drawerInsights:visible').first()
    if (await d.count()) { const label = (await d.innerText()).replace(/\s+/g, ' ').trim(); await d.click(); await sleep(600); if (await p.locator('#insightBody').count()) return { how: `☰ → "${label}"` } }
    else await p.keyboard.press('Escape')
  }
  return { err: 'no way into Insights found at this width' }
}
/* the Work-hours figures of the named people (as the window prints them), the bar's painted width, and every row */
export async function hours(p, names) {
  const o = await insDoor(p); if (o.err) return { err: o.err, fig: {}, rows: [], neg: [] }
  await sleep(200)
  const r = await p.evaluate(names => {
    const b = document.querySelector('#insightBody'); const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const hs = [...b.querySelectorAll('.isec-h')]; const h = hs.find(e => /Work hours/i.test(e.innerText))
    const rows = []; let e = h
    while (e && (e = e.nextElementSibling) && !e.classList.contains('isec-h')) { const bars = e.matches('.ibar') ? [e] : [...e.querySelectorAll('.ibar')]; for (const x of bars) { const tr = x.querySelector('.track'), fl = x.querySelector('.fill'); rows.push({ nm: t(x.querySelector('.nm')), v: t(x.querySelector('.v')), vt: (x.querySelector('.v') || {}).title || '', pct: tr && fl ? Math.round(100 * fl.getBoundingClientRect().width / Math.max(1, tr.getBoundingClientRect().width)) : null }) } }
    const out = {}; for (const n of names) { const x = rows.find(r => r.nm === n); out[n] = x ? x.v : '(not listed)' }
    const neg = rows.filter(r => /-/.test(r.v))
    return { head: t(h), fig: out, rows, neg, n: rows.length, title: t(document.querySelector('#insightModal .modal-head b')) }
  }, names)
  r.how = o.how
  return r
}
export async function insShut(p) { const x = p.locator('#insightClose:visible').first(); if (await x.count()) { await x.click(); await sleep(300) } }
/* a picture of the open window with one man's Work-hours bar in the middle */
export async function insPicAt(p, name, cs) {
  if (!(await p.locator('#insightBody').count())) return B.pic(p, name + '-NO-INSIGHTS-WINDOW')
  await p.evaluate(c => { const hs = [...document.querySelectorAll('#insightBody .isec-h')]; const h = hs.find(e => /Work hours/i.test(e.innerText)); if (!h) return; let e = h, hit = null; while (e && (e = e.nextElementSibling) && !e.classList.contains('isec-h')) { for (const x of (e.matches('.ibar') ? [e] : e.querySelectorAll('.ibar'))) { const nm = x.querySelector('.nm'); if (nm && nm.innerText.trim() === c) hit = x } } (hit || h).scrollIntoView({ block: 'center' }) }, cs)
  await sleep(250)
  return B.pic(p, name)
}
/* "7h10" / "28h" / "45 min" → minutes (null when it does not read as a length; a minus anywhere makes it negative) */
export const mins = s => { if (!s) return null; const m = /^(-)?\s*(?:(\d+)h)?\s*-?(\d+)?(?:\s*min)?$/.exec(String(s).trim()); if (!m || (m[2] === undefined && m[3] === undefined)) return null; const v = (+(m[2] || 0)) * 60 + (+(m[3] || 0)); return /-/.test(String(s)) ? -v : v }
export const hm = n => n == null ? '?' : `${n < 0 ? '-' : ''}${Math.floor(Math.abs(n) / 60)}h${String(Math.abs(n) % 60).padStart(2, '0')}`
/* a man not listed has no work that week: zero */
const m0 = (h, n) => h.fig[n] === '(not listed)' ? 0 : mins(h.fig[n])
export const dmin = (a, b, n) => { const x = m0(a, n), y = m0(b, n); return x == null || y == null ? null : y - x }
export const delta = (a, b, n) => { const d = dmin(a, b, n); return d == null ? `${a.fig[n]} → ${b.fig[n]}` : `${a.fig[n]} → ${b.fig[n]} (${d >= 0 ? '+' : ''}${hm(d)})` }

/* what the app HOLDS for a man's day (read only — recorded beside what the screen says, never instead of it) */
export async function held(p, di, cs) {
  return p.evaluate(([di, c]) => { const id = (Object.entries(window.PEOPLE).find(([, v]) => v.cs === c) || [])[0]
    const f = n => { if (n == null) return null; const m = ((n % 1440) + 1440) % 1440; return `${n < 0 ? 'prev-day ' : ''}${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}${n >= 1440 ? ' next-day' : ''}` }
    try { return (window.dayEvents(di, id) || []).map(e => `${e.kind} ${String(e.label || '').trim()}: s ${f(e.s)} e ${f(e.e)}${e.report != null ? ' report ' + f(e.report) + ' (' + e.report + ')' : ' (no report held)'}${e.brief != null ? ' brief ' + f(e.brief) : ''}`).join(' ; ') || '(nothing)' } catch (e) { return 'unreadable: ' + e } }, [di, cs])
}

/* ---------- Logic ---------- */
export async function logicRead(p, name = 'reportLead') {
  await B.toPage(p, 'logic')
  return p.evaluate(n => { const pg = document.querySelector('#page-logic'); const lab = { reportLead: 'Nominal report before T/O', briefLead: 'Flight brief before T/O', debrief: 'Flight debrief after land' }[n] || n
    const inp = pg.querySelector(`[data-lgset="${n}"]`); if (inp) return inp.value
    const all = [...pg.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.innerText || '').trim() === lab); const e = all[0]; if (!e) return '(label not found)'
    return ((e.nextElementSibling || e.parentElement.nextElementSibling || {}).innerText || '').trim() }, name)
}
export async function logicSet(p, name, value) {
  await B.toPage(p, 'logic')
  const ed = p.locator('#lgEdit:visible').first(); if (await ed.count()) { await ed.click(); await sleep(350) }
  const inp = p.locator(`#page-logic [data-lgset="${name}"]:visible`).first()
  if (!(await inp.count())) return { err: 'no box for ' + name }
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const before = await inp.inputValue()
  await inp.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 10 }); await p.keyboard.press('Tab'); await sleep(450)
  const after = await p.locator(`#page-logic [data-lgset="${name}"]`).first().inputValue()
  return { before, after }
}
export async function logicDone(p) { const d = p.locator('#lgDone:visible').first(); if (await d.count()) { await d.click(); await sleep(300) } }

/* ---------- the day's warning list, read on the week ---------- */
export async function listOf(p, di, surf = '#eWeek') {
  if (surf === '#eWeek') await B.toEdit(p); else await B.toPage(p, 'viewsched')
  const ok = await B.openList(p, surf, di)
  const l = await B.readList(p, surf, di)
  return { ok, bar: l.bar, lines: (l.lines || []).map(x => `${x.sev === 'hard' ? 'RED' : x.sev === 'adv' ? 'amber' : x.sev}${x.struck ? ' STRUCK' : ''}: ${x.text}`), raw: l }
}
export const has = (list, re) => (list.lines || []).filter(x => re.test(x))
/* full text of the lines that match (readList trims to 110 characters), with the colour each is painted in */
export async function linesFull(p, di, re, surf = '#eWeek') {
  return p.evaluate(([s, i, src]) => { const r = new RegExp(src, 'i'); return [...document.querySelectorAll(`${s} .day[data-day="${i}"] [data-dwbox="${i}"] .witem`)].map(e => { const cs = getComputedStyle(e); return { text: e.innerText.replace(/\s+/g, ' ').trim(), sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)) || '', border: cs.borderLeftColor, bg: cs.backgroundColor } }).filter(x => r.test(x.text)) }, [surf, di, re.source])
}
export const fullStr = ls => ls.map(m => (m.sev === 'hard' ? 'RED ' : m.sev === 'adv' ? 'amber ' : m.sev + ' ') + m.text).join(' | ') || '(none)'
/* the list's line brought to the middle for a picture */
export async function listShow(p, di, re, surf = '#eWeek') {
  await p.evaluate(([s, i, src]) => { const r = new RegExp(src, 'i'); const e = [...document.querySelectorAll(`${s} .day[data-day="${i}"] [data-dwbox="${i}"] .witem`)].find(x => r.test(x.innerText)); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [surf, di, re.source])
  await sleep(250)
}
/* open the board on a day at this width (the bridge only gets there); says whether a phone shows it in Desktop layout */
export async function boardAt(p, di) { await B.toEdit(p); await W.boardOn(p, di); await sleep(350); return p.evaluate(() => ({ day: window.SBDAY, wide: document.querySelector('#schedBoard').classList.contains('sb-wide') })) }
