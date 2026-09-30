/* [DB-READINESS] group A FULL walk — walker W3, the Leave War (30 Sep 26). Helpers on top of the shared driver
   (dbrA-lib.mjs). Everything a step DOES goes through the app's own controls (the grid's boxes, its sheets, the stage
   control, ⚙ Settings, the war picker, the top bar's Undo / Redo); reads of window.* and localStorage are for the
   evidence table only. The Leave War keeps no state the driver's `L.state` reads, so "a reload gives it back" is also
   judged on the grid boxes a step touched (their words and class) and on the war's own rows (`leavewar/*`).

   Each script sets HP_OUT (its own part file) BEFORE importing this file; the port and the picture folder are fixed
   here for W3. */
import { fileURLToPath } from 'node:url'
export const ROOT = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL ||= 'http://localhost:4203'
process.env.HP_SHOTS ||= `${ROOT}/docs/img/handpass/2026-09-30-dbrA/W3`
process.env.HP_OUT ||= `${ROOT}/docs/handpass/parts/dbrA-W3.json`
export const L = await import('./dbrA-lib.mjs')
const { sleep } = L

/* ---------- the evidence table (step · width · what · after the reload · rows · PASS/FAIL · pictures) ---------- */
export const TABLE = []
let lastPics = []
/** a picture, remembered for the step's table line */
export async function pic(page, name) { await L.shot(page, name); lastPics.push(name + '.png'); return name + '.png' }
export function row(o) { TABLE.push({ ...o, pics: o.pics || lastPics }); lastPics = [] }
export const rowsSummary = a => `put ${a.put.length}${a.put.length ? ' [' + a.put.join(', ') + ']' : ''}${a.del.length ? ` · del ${a.del.length} [${a.del.join(', ')}]` : ''} · batches ${a.batches.map(b => `${b.type}/${b.n}`).join(' ') || 'none'}`

/* ---------- a page whose native dialogs we can accept when a gesture asks one ---------- */
export async function newPage(ctx, errors, label = 'p') {
  const p = await ctx.newPage()
  p.__accept = false
  p.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
  p.on('dialog', d => {
    if (p.__accept) { errors.push(`${label}: (accepted) NATIVE DIALOG ${d.message()}`); d.accept().catch(() => {}) }
    else { errors.push(`${label}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) }
  })
  return p
}

/* ---------- the Leave War ---------- */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
/** Open the war and bring a date's month on screen through the month strip's own button. */
export async function lwOpen(page, iso) {
  if (await page.locator('#schedBoard:visible').count()) {
    const x = page.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
    if (await x.count()) { await x.click(); await sleep(500) }
  }
  if ((await page.evaluate(() => window.CURPAGE)) !== 'leavewar') await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await sleep(400)
  const bar = page.locator('[data-testid="figures-toggle"]:visible').first()
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  if (!iso) return
  const lab = MON[+iso.slice(5, 7) - 1]
  let b = page.locator(`[data-testid="month-${lab}"]:visible`).first()
  if (!(await b.count())) b = page.locator(`[data-testid="month-${lab}-${iso.slice(2, 4)}"]:visible`).first()
  if (await b.count()) {
    try { await b.click({ timeout: 5000 }) } catch {
      const r = await b.boundingBox()
      const touch = await page.evaluate(() => navigator.maxTouchPoints > 0)
      if (r && touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
      else if (r) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
    }
    await sleep(800)
  }
  await page.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await sleep(300)
}

/** Whichever Leave War sheet is open: its name, words, every button a person could press, the day list's lines. */
export async function sheetNow(page) {
  return page.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth || e.offsetHeight)
    if (!d.length) return { open: 'nothing' }
    const s = d[d.length - 1]
    return {
      open: s.getAttribute('data-testid'), label: s.getAttribute('aria-label'),
      text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 900),
      buttons: [...s.querySelectorAll('button')].filter(b => b.offsetWidth || b.offsetHeight)
        .map(b => `${b.getAttribute('data-testid') || '?'}:${(b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30)}${b.disabled ? '(off)' : ''}`),
      lines: [...s.querySelectorAll('[data-testid="daylist"] li')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
      lineIds: [...s.querySelectorAll('[data-testid="daylist"] li')].map(e => e.getAttribute('data-testid')),
    }
  })
}
/** Tap a man's day box where a person would (checking the box itself is what sits there), report what opened. */
export async function tapCell(page, id, iso, { finger = false } = {}) {
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await lwOpen(page, iso)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { open: 'NO CELL DRAWN' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? `${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
  if (!at.ok) return { open: 'COVERED', over: at.over }
  if (finger) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(600)
  return sheetNow(page)
}
/** Press a button inside the open sheet by its testid (or its words). */
export async function sheetPress(page, which, { finger = false } = {}) {
  const s = page.locator('.bidsheet[role="dialog"]:visible').last()
  const b = which instanceof RegExp ? s.locator('button').filter({ hasText: which }).first() : s.locator(`[data-testid="${which}"]`).first()
  if (!(await b.count())) return { pressed: false, why: 'no ' + which, sheet: await sheetNow(page) }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', sheet: await sheetNow(page) }
  if (finger) await b.tap(); else await b.click()
  await sleep(600)
  return { pressed: true, sheet: await sheetNow(page) }
}
/** Close whatever sheet is open through its own ✕ (then Escape). */
export async function closeSheets(page) {
  for (let i = 0; i < 4; i++) {
    const x = page.locator('.bidsheet[role="dialog"] button.x:visible').last()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(350); continue }
    if (await page.locator('[data-testid="sheet-scrim"]').count()) { await page.keyboard.press('Escape'); await sleep(300); continue }
    break
  }
}
/** Place a bid through the bid sheet (a second press of the same leave is the "below zero" yes). */
export async function bidOn(page, id, iso, code = 'LL', { portion = 'full', finger = false } = {}) {
  const t = await tapCell(page, id, iso, { finger })
  if (t.open !== 'bid-picker') { await closeSheets(page); return { placed: false, why: 'opened ' + t.open, tap: t } }
  if (portion !== 'full') await sheetPress(page, `portion-${portion}`, { finger })
  const r = await sheetPress(page, `bid-${code}`, { finger })
  let s = await sheetNow(page)
  let asked = null
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { asked = s.text; await sheetPress(page, `bid-${code}`, { finger }); s = await sheetNow(page) }
  const placed = s.open === 'nothing'
  if (!placed) await closeSheets(page)
  return { placed, pressed: r.pressed, asked, why: placed ? '' : (s.text || '').slice(0, 300) }
}

/** The boxes as drawn: words, class, corner mark — the "screen after the reload" evidence. */
export async function cells(page, pairs) {
  return page.evaluate(ps => {
    const o = {}
    for (const [p, d] of ps) {
      const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
      const m = document.querySelector(`[data-testid="mark-${p}-${d}"]`)
      o[`${p}@${d}`] = c ? { text: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: String(c.className).trim(), mark: m ? (m.innerText || '').trim() : '' } : 'NO CELL'
    }
    return o
  }, pairs)
}
/* classes on a box that are only the pointer's or the moment's (hover, a landing preview, a just-tapped flash) — never
   something a person saved; left out of the before/after comparison, and the list says so */
const TRANSIENT = /^(hov|hover|flash|pressed|sel|selected|mvland|mvsrc|landing|focus|tapped|armed)$/
const stable = c => c === 'NO CELL' ? c : { text: c.text, mark: c.mark, cls: c.cls.split(/\s+/).filter(x => !TRANSIENT.test(x)).sort().join(' ') }

/** The war's own saved rows. */
export const lwOnly = r => Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('leavewar/')))
/** The records stored for one man on one date (any war), in the order the war reads them (ord, recId). */
export function recsAt(r, pid, date) {
  const out = []
  for (const [k, v] of Object.entries(r)) {
    if (!k.startsWith('leavewar/rec:')) continue
    let o; try { o = JSON.parse(v) } catch { continue }
    if (o.pid === pid && o.date === date) out.push({ key: k, ...o })
  }
  return out.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0) || String(a.id).localeCompare(String(b.id)))
}

/** The stage the war on screen shows; press the stage control. */
export async function stageNow(page) { const s = page.locator('[data-testid="stage-now"]:visible').first(); return (await s.count()) ? (await s.innerText()).trim() : '?' }
export async function stageGo(page, dir = 'advance') {
  const b = page.locator(`[data-testid="stage-${dir}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  const label = (await b.innerText()).trim()
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', label }
  await b.click(); await sleep(900)
  return { pressed: true, label, now: await stageNow(page) }
}
/** The war picker's options and its chosen one; pick one by name. */
export async function warPick(page, name) {
  const sel = page.locator('[data-testid="war-picker"]:visible').first()
  if (!(await sel.count())) return { opts: [], value: null }
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })))
  const value = await sel.inputValue()
  if (!name) return { opts, value }
  const o = opts.find(x => x.v === name || x.t === name || new RegExp(name).test(x.t))
  if (!o) return { picked: false, opts, value }
  if (o.v !== value) { await sel.selectOption(o.v); await sleep(1200) }
  return { picked: true, to: o.t, v: o.v, opts }
}
/** The top bar's Undo / Redo — the one timeline (D347). */
export async function topHist(page, which = 'undo') {
  const b = page.locator(`#${which}Btn:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'no button' }
  const title = await b.getAttribute('title'), disabled = await b.isDisabled()
  if (disabled) return { pressed: false, title, disabled }
  await b.click(); await sleep(800)
  return { pressed: true, title }
}

/* THE ONE THING SET ASIDE when the app's state is compared across a load (the brief: "a field legitimately recomputed at
   load, NOT something the person made — say so, narrowly"): the hidden row ids (`rid`) of the LOADED WEEK's rows, and
   only while that week has NO stored row at all. The Leave War walk never edits the schedule, so the demo week on screen
   (Mon 13 Jul 26) is never saved; the app re-seeds an unsaved week at every load and mints its rows' hidden ids afresh
   (seen on the first run of part A: every difference was a `.hist.d.<day>.<…>.rid`). The moment the week is saved —
   any `weeks/<wk>` row — nothing is set aside, and a changed id is a finding. It is stripped BEFORE the comparison
   (the driver's diff stops at 40 differences, so filtering after it could hide a real one behind forty ids). */
function weekSaved(rows, wk) { return wk != null && Object.keys(rows).some(k => k === `weeks/${wk}` || k.startsWith(`weeks/${wk}#`) || k.startsWith(`weeks/${wk}:`)) }
function stripRids(x) {
  if (Array.isArray(x)) return x.map(stripRids)
  if (x && typeof x === 'object') { const o = {}; for (const [k, v] of Object.entries(x)) if (k !== 'rid') o[k] = stripRids(v); return o }
  return x
}
export function normState(s, rows) {
  if (!s || !s.hist || weekSaved(rows, s.week)) return { s, set: false }
  return { s: { ...s, hist: { ...s.hist, d: stripRids(s.hist.d) } }, set: true }
}
/** The driver's reloadCompare, with the one set-aside above: reload, sign in again, the same week, the page; the app's
    state the same; the reload wrote nothing. */
export async function reloadCompare(p, name, who = 'a', { page: pg = null } = {}) {
  const s1 = await L.state(p)
  const r1 = await L.rows(p)
  await p.reload()
  await L.signIn(p, who, { goto: false })
  if (s1.week != null) {
    const wk = await p.evaluate(() => window.CURWEEK)
    if (wk !== s1.week) { await p.evaluate(w => window.loadWeek(w), s1.week); await sleep(700) }
  }
  if (pg) await L.go(p, pg)
  await L.settle(p, 700)
  const s2 = await L.state(p)
  const r2 = await L.rows(p)
  const n1 = normState(s1, r1), n2 = normState(s2, r2)
  const d = L.stateDiff(n1.s, n2.s)
  L.check(`${name} — a reload gives back exactly what was there`, !d.length, d.length ? d.slice(0, 12).join(' || ') : `week ${s2.week}${n1.set ? ' (the unsaved demo week\'s hidden row ids set aside)' : ''}`)
  const rd = L.diff(r1, r2)
  L.check(`${name} — the reload wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put.slice(0, 12), del: rd.del.slice(0, 12) } : 'no row changed')
  return { s1, s2, d }
}

/** A RELOAD (reloadCompare above — the app's own state and "the reload wrote nothing"), then the war brought back
    to the same period and month through its own picker and month strip, and the boxes this step touched compared, words
    and class. Returns { ok, before, after }. */
export async function lwReload(page, name, who, pairs) {
  const war = (await warPick(page)).value
  const b1 = pairs.length ? await cells(page, pairs) : {}
  const r = await reloadCompare(page, name, who, { page: 'leavewar' })
  await lwOpen(page)
  /* the war the app opens on after a load (the stage rule: open → closed → published → draft), read BEFORE we bring
     back the one we were on through the picker */
  const bootWar = (await warPick(page)).value
  if (war && bootWar !== war) await warPick(page, war)
  if (pairs.length) await lwOpen(page, pairs[0][1])
  const b2 = pairs.length ? await cells(page, pairs) : {}
  const bad = []
  for (const k of Object.keys(b1)) if (JSON.stringify(stable(b1[k])) !== JSON.stringify(stable(b2[k]))) bad.push(`${k}: ${JSON.stringify(b1[k])} → ${JSON.stringify(b2[k])}`)
  L.check(`${name} — the war's boxes read the same after the reload`, !bad.length, bad.length ? bad.join(' || ') : JSON.stringify(Object.fromEntries(Object.entries(b2).map(([k, v]) => [k, v.text ?? v]))))
  return { ok: !bad.length && !r.d.length, before: b1, after: b2, d: r.d, bootWar }
}

/** TWO TABS, both reloaded. Before the reload each tab lacks the OTHER's change by design (the app never re-reads
    storage while open), so "the same as before" is the wrong test here; the right one: after reloading both, the two
    tabs read the SAME state (week, requests, roster, history) and the same boxes, and the reloads wrote nothing. The
    caller then checks both changes are there. */
export async function reloadBoth(A, whoA, B, whoB, name, pairs) {
  const r0 = await L.rows(A)
  for (const [p, who] of [[A, whoA], [B, whoB]]) {
    await p.reload(); await L.signIn(p, who, { goto: false })
    await L.settle(p, 700)
  }
  const sA = await L.state(A), sB = await L.state(B)
  if (sA.week !== sB.week) await B.evaluate(w => window.loadWeek(w), sA.week)
  for (const p of [A, B]) { await lwOpen(p); if (pairs.length) await lwOpen(p, pairs[0][1]) }
  const rA = await L.rows(A), rB = await L.rows(B)
  const sB2 = await L.state(B)
  const d = L.stateDiff(normState(sA, rA).s, normState(sB2, rB).s)
  L.check(`${name} — after reloading both, the two tabs read the same`, !d.length, d.length ? d.slice(0, 10).join(' || ') : 'same')
  const rd = L.diff(r0, rB)
  L.check(`${name} — reloading both tabs wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put, del: rd.del } : 'no row changed')
  const cA = await cells(A, pairs), cB = await cells(B, pairs)
  /* `act` marks a box THIS viewer may act on (Matrix: `actionable`) — an admin may act on every row, a member only on
     his own — so between an admin's tab and a member's it differs by role, not by what is saved */
  const roleFree = c => { const s = stable(c); return whoA !== whoB && s !== 'NO CELL' ? { ...s, cls: s.cls.split(' ').filter(x => x !== 'act').join(' ') } : s }
  const bad = Object.keys(cA).filter(k => JSON.stringify(roleFree(cA[k])) !== JSON.stringify(roleFree(cB[k])))
  L.check(`${name} — both tabs draw the same boxes`, !bad.length, bad.length ? bad.map(k => `${k}: A ${JSON.stringify(cA[k])} B ${JSON.stringify(cB[k])}`).join(' || ') : JSON.stringify(Object.fromEntries(Object.entries(cA).map(([k, v]) => [k, v.text ?? v]))))
  return { cA, cB, rows: rB }
}
/** "Feb 3" — how the Inputs page keeps a request's date (with `yr`) */
export const inpDate = iso => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`

/** A second page in the SAME browser (the same storage) opened fresh — what a reload would read — without touching the
    first page (so its Undo list survives for a Redo). Compares the app's state, the boxes, and that opening it wrote
    nothing. */
export async function peerRead(ctx, pageA, name, who, pairs, errors) {
  const sA = await L.state(pageA)
  const war = (await warPick(pageA)).value
  const cA = pairs.length ? await cells(pageA, pairs) : {}
  const r1 = await L.rows(pageA)
  const b = await newPage(ctx, errors, 'peer')
  await L.signIn(b, who)
  if (sA.week != null) { const wk = await b.evaluate(() => window.CURWEEK); if (wk !== sA.week) { await b.evaluate(w => window.loadWeek(w), sA.week); await sleep(700) } }
  await lwOpen(b)
  if (war) { const w = await warPick(b); if (w.value !== war) await warPick(b, war) }
  if (pairs.length) await lwOpen(b, pairs[0][1])
  await L.settle(b, 700)
  const sB = await L.state(b)
  const cB = pairs.length ? await cells(b, pairs) : {}
  const r2 = await L.rows(b)
  const d = L.stateDiff(normState(sA, r1).s, normState(sB, r2).s)
  L.check(`${name} — a fresh page reads back exactly what was there`, !d.length, d.length ? d.slice(0, 12).join(' || ') : `week ${sB.week}`)
  const rd = L.diff(r1, r2)
  L.check(`${name} — opening the fresh page wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put, del: rd.del } : 'no row changed')
  const bad = []
  for (const k of Object.keys(cA)) if (JSON.stringify(stable(cA[k])) !== JSON.stringify(stable(cB[k]))) bad.push(`${k}: ${JSON.stringify(cA[k])} → ${JSON.stringify(cB[k])}`)
  L.check(`${name} — the fresh page's boxes read the same`, !bad.length, bad.length ? bad.join(' || ') : JSON.stringify(Object.fromEntries(Object.entries(cB).map(([k, v]) => [k, v.text ?? v]))))
  await b.close()
  return { ok: !d.length && !bad.length && !rd.put.length && !rd.del.length, before: cA, after: cB }
}

/** A real mouse drag from one man's day to another's (a block selection). */
export async function dragRect(page, a, isoA, b, isoB, { steps = 14 } = {}) {
  if (!(await page.locator(`[data-testid="cell-${a}-${isoA}"]`).count())) await lwOpen(page, isoA)
  await page.locator(`[data-testid="cell-${a}-${isoA}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(350)
  const bx = async (id, iso) => page.locator(`[data-testid="cell-${id}-${iso}"]`).first().boundingBox()
  const b1 = await bx(a, isoA), b2 = await bx(b, isoB)
  if (!b1 || !b2) return { open: 'NO BOX', b1, b2 }
  const x1 = b1.x + b1.width / 2, y1 = b1.y + b1.height / 2, x2 = b2.x + b2.width / 2, y2 = b2.y + b2.height / 2
  await page.mouse.move(x1, y1); await page.mouse.down()
  await page.mouse.move(x1 + 6, y1 + 1, { steps: 3 }); await page.mouse.move(x2, y2, { steps })
  await page.mouse.up(); await sleep(700)
  return sheetNow(page)
}
/** Where a box is now (no scrolling), and whether it is what sits under a finger there. */
export async function at(page, testid) {
  return page.locator(`[data-testid="${testid}"]`).first().evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } }).catch(() => null)
}
export async function banner(page) {
  const b = page.locator('[data-testid="move-banner"]:visible')
  return (await b.count()) ? (await b.innerText()).replace(/\s+/g, ' ').trim() : ''
}
