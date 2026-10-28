// Walker D's helpers (M5a walk). Copied from the host's probe (lw-m5a-probe.mjs) — not imported, importing runs it.
// Set LW_OUT and LW_TODAY BEFORE importing this file (each on its own line).
const L = await import('./lw-m4-lib.mjs')
export { L }
const { T, press, shot, vis, txt } = L
console.log('[lw-m5a-walk-d-lib v1]')

export const tabRow = page => page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0)
  return tabs.map(t => ({ id: t.dataset.testid, sel: t.getAttribute('aria-selected') }))
})
export const balRow = (page, pid) => page.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  if (!row) return null
  const val = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = { app: val(`bal-LVE-${pid}`), cf: val(`bal-cf-${pid}`), pend: val(`bal-pend-${pid}`), war: val(`bal-war-${pid}`), oil: val(`bal-oil-${pid}`), grade: (row.querySelector(`[data-testid="bal-grade-${pid}"]`) || row.querySelector('.bp-rogd,.bp-gd'))?.textContent.replace(/\s+/g, ' ').trim() ?? null }
  for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) r[k] = val(`bal-${k}-${pid}`) + (val(`bal-opd-${k}-${pid}`) ? ' ' + val(`bal-opd-${k}-${pid}`) : '')
  r.boxes = row.querySelectorAll('input').length
  r.readOnly = [...row.querySelectorAll('.bp-ro')].map(e => e.textContent.trim())
  return r
}, pid)
export const pwRead = page => page.evaluate(() => {
  const pw = document.querySelector('[data-testid="person-window"]')
  if (!pw || !pw.getBoundingClientRect().width) return null
  const q = id => pw.querySelector(`[data-testid="${id}"]`)
  const v = id => { const e = q(id); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = pw.getBoundingClientRect()
  const yr = q('pw-year')
  return {
    name: v('pw-name'), taken: v('pw-taken'), lve: v('pw-tile-LVE'), app: v('pw-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'),
    oil: v('pw-oil'), med: v('pw-med'), lock: v('pw-lock'),
    other: Object.fromEntries(['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, v(`pw-${k}`) + (v(`pw-${k}-pend`) ? ' pend ' + v(`pw-${k}-pend`) : '') + (v(`pw-${k}-war`) ? ' war ' + v(`pw-${k}-war`) : '')])),
    boxes: pw.querySelectorAll('input').length,
    year: yr ? { value: yr.value, options: [...yr.options].map(o => o.textContent) } : null,
    lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid.replace('pw-line-', ''), text: e.innerText.replace(/\s+/g, ' ').trim(), dot: !!e.querySelector('.m5-dot') })),
    box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) },
    vh: innerHeight, closeY: Math.round(q('pw-close')?.getBoundingClientRect().top ?? -1),
  }
})
export const onScreen = pw => !!pw && pw.box.top < pw.vh - 40 && pw.box.bottom > 0 && pw.closeY > 0 && pw.closeY < pw.vh
export async function closePw(w) {
  const pw = await pwRead(w.page)
  if (!pw) return 'none open'
  if (onScreen(pw)) { await press(w, T('pw-close')); await w.page.waitForTimeout(400); return '✕' }
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); return 'Escape (✕ off the screen)'
}
export async function openBalances(w) {
  await press(w, T('lw-tab-balances'))
  await w.page.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 })
  await w.page.waitForTimeout(500)
}
export async function typeInBox(w, sel, figure, enter = true) {
  await press(w, sel)
  await w.page.waitForTimeout(w.phone ? 650 : 150)
  await w.page.keyboard.press('Control+A')
  await w.page.keyboard.type(String(figure), { delay: 30 })
  if (enter) await w.page.keyboard.press('Enter')
  await w.page.waitForTimeout(500)
}
export const where = page => page.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return { top: s ? Math.round(s.scrollTop) : null, left: s ? Math.round(s.scrollLeft) : null, win: Math.round(window.scrollY) } })

export async function lockViaBridge(w, on) {
  return w.page.evaluate(async on => {
    const url = performance.getEntriesByType('resource').map(e => e.name).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
      || [...document.querySelectorAll('link[rel="modulepreload"]')].map(l => l.href).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
    if (!url) return { ok: false, why: 'no store module among the loaded scripts' }
    const m = await import(url)
    const fns = Object.values(m).filter(f => typeof f === 'function')
    const setLock = fns.find(f => String(f).includes('lw.balLock'))
    if (!setLock) return { ok: false, why: 'no lock writer in ' + url }
    if (typeof window.lwSetRole !== 'function' || typeof window.raptorRole !== 'function') return { ok: false, why: 'the bridge role switches are missing' }
    window.raptorRole('admin'); window.lwSetRole('admin')
    let res
    try { res = setLock(on) } finally { window.lwSetRole('member'); window.raptorRole('member') }
    return { ok: true, wrote: res }
  }, on)
}
/* reload and pin the war's today again; a reload signs him out — sign in again after */
export async function reloadAt(w, iso) {
  await w.page.reload()
  await w.page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  const signedOut = await w.page.locator('#luser').isVisible().catch(() => false)
  await w.page.evaluate(t => window.lwSetMemberToday(t), iso)
  return signedOut
}
export const setToday = async (w, iso) => { await w.page.evaluate(t => window.lwSetMemberToday(t), iso); await w.page.waitForTimeout(300) }
/* reload keeps the world; sign in as who; set today; open the war */
export async function reloadAs(w, who, iso) {
  const out = await reloadAt(w, iso)
  if (out) { await L.signIn(w, who) } else { await L.openWar(w, who) }
  await setToday(w, iso)
}
/* a fresh redraw of the Balances page: the grid then the tab */
export async function freshBal(w) { await L.openGrid(w); await openBalances(w) }

/* the grid's figure beside a name ([data-testid="bal-<pid>"]) and the two small lines */
export const gridFig = (page, pid) => page.evaluate(pid => { const e = document.querySelector(`[data-testid="bal-${pid}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, pid)
export const myLeave = page => txt(page, T('my-leave'))
export const histTail = (page, n = 3) => page.evaluate(n => { const l = window.raptorHistory ? window.raptorHistory() : null; return l }, n)
/* every passing note on screen */
export const notes = page => page.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [role="alert"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))

/* Approvals: find one line of a person by the dates text, return its text */
export async function apprLinesFull(w) { return L.apprLines(w.page) }
export const lineLoc = (page, dates) => page.locator('.appr-line', { has: page.locator('.appr-dlink', { hasText: dates }) }).first()
export async function pressLoc(w, loc, quickName = null) {
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box')
  await L.finger(w, b.x + b.width / 2, b.y + b.height / 2, quickName)
}
/* place ONE leave on a cell by whoever is signed in. portion 'full' | 'am' | 'pm'. approve: true/false for an admin */
export async function placeBid(w, who, iso, type = 'LL', portion = 'full', opts = {}) {
  const P = w.page
  await L.openCell(w, who, iso)
  if (!(await vis(P, T('bid-picker')))) { console.log(`   !! no bid window for ${who} ${iso}`); return false }
  if (opts.approve !== undefined) await L.approveWhatIEnter(w, opts.approve)
  if (portion !== 'full') { await press(w, T('portion-' + portion)); await P.waitForTimeout(250) }
  const ok = await L.placeLeave(w, type)
  if (!ok) { console.log(`   !! the window stayed open after ${type} on ${iso}`); await L.closeWin(w) }
  return ok
}
export const keyOf = x => x

/* ---- v2: Approvals buttons by person + dates; every surface for one person; results helper ---- */
export const lineOf = (page, pid, dates) => page.locator(`[data-testid="appr-line-${pid}"]`, { has: page.locator('.appr-dlink', { hasText: dates }) }).first()
export async function apprPress(w, pid, dates, which /* 'approve' | 'refuse' */) {
  await L.openApprovals(w)
  const loc = lineOf(w.page, pid, dates).locator(`[data-testid="appr-${which}"]`)
  if (!(await loc.count())) throw new Error(`no ${which} on ${pid} ${dates}`)
  await pressLoc(w, loc)
  await w.page.waitForTimeout(600)
}
/* a person's lines on Approvals as drawn: text of each */
export async function openAppr(w) {
  for (let i = 0; i < 3; i++) {
    await w.page.waitForTimeout(700)
    await press(w, T('lw-tab-approvals')); await w.page.waitForTimeout(700)
    if (await vis(w.page, T('approvals-page'))) return true
    console.log('   .. Approvals did not open, again; covered by:', await w.page.evaluate(() => { const e = document.querySelector('[data-testid="lw-tab-approvals"]').getBoundingClientRect(); const h = document.elementFromPoint(e.x + e.width / 2, e.y + e.height / 2); return h ? h.tagName + '.' + String(h.className).slice(0, 40) + '#' + (h.dataset.testid || '') + ' ' + (h.innerText || '').slice(0, 40) : null }))
  }
  return false
}
export async function apprOf(w, pid) {
  await openAppr(w)
  return (await L.apprLines(w.page)).filter(l => l.who === pid).map(l => l.text)
}
/* open a person's window from the Balances page, read, close */
export async function winOf(w, pid, keepOpen = false, shotName = null) {
  await openBalances(w)
  await press(w, T('bal-name-' + pid)); await w.page.waitForTimeout(600)
  const r = await pwRead(w.page)
  if (shotName) await shot(w, shotName)
  if (!keepOpen) await closePw(w)
  return r
}
/* every desktop surface of one person's LVE figure; shotBase names the pictures */
export async function surfaces(w, pid, shotBase = null) {
  const P = w.page
  const out = {}
  out.appr = await apprOf(w, pid)
  out.win = await winOf(w, pid, true, shotBase ? shotBase + '-bal-win' : null)
  out.row = await balRow(P, pid)
  await closePw(w)
  await L.openGrid(w)
  out.grid = await gridFig(P, pid)
  if (shotBase) await shot(w, shotBase + '-grid')
  return out
}
export const brief = s => `${s.row ? `Bal row ${s.row.app}/incl ${s.row.cf}/pend ${s.row.pend}/war ${s.row.war}` : 'no row'} · window tile "${s.win ? `App ${s.win.app} incl ${s.win.cf} pend ${s.win.pend} war ${s.win.war} · ${s.win.taken}` : 'none'}" · grid fig "${s.grid}" · Approvals: ${s.appr.map(t => t.replace(/^\S+ \S+ /, '')).join(' // ')}`
/* the member's My leave for a person: sign in as him, read, sign back in as the admin; (today stays pinned by signIn) */
export async function myLeaveAsMember(w) {
  await L.switchTo(w, 'member')
  await L.openGrid(w)
  const t = await myLeave(w.page)
  await L.switchTo(w, 'admin')
  return t
}
/* the table of results for the report */
export const R = []
export function note(id, size, verdict, said, pics = []) { R.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
import { writeFileSync } from 'node:fs'
import path from 'node:path'
export function dumpResults(name) { writeFileSync(path.join(L.OUT, name + '.json'), JSON.stringify(R, null, 1)) }
export const eq = (a, b) => String(a).replace(/[−–]/g, '-').replace(/\s+/g, '') === String(b).replace(/[−–]/g, '-').replace(/\s+/g, '')

/* the window on an existing entry: press one of its actions (decide-approve, decide-refuse, decide-shift, bid-clear); says what the buttons read */
export async function cellAct(w, pid, iso, testid, opts = {}) {
  const P = w.page
  await L.openGrid(w)
  await L.openCell(w, pid, iso)
  if (!(await vis(P, T('bid-picker')))) { console.log(`   !! no window for ${pid} ${iso}`); return null }
  const before = await txt(P, T('bid-actions'))
  await press(w, T(testid)); await P.waitForTimeout(700)
  const still = await vis(P, T('bid-picker'))
  const after = still ? await txt(P, T('bid-actions')) : null
  if (still && !opts.keepOpen) await L.closeWin(w)
  return { before, after, stillOpen: still }
}

/* file a leave on the Inputs page (List view → + Input): person (callsign label), kind label, dates (iso strings: a first and an optional last), */
export async function fileInput(w, person, kindLabel, from, to = null) {
  const P = w.page
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  const lst = P.locator('text=List').first(); await lst.click(); await P.waitForTimeout(600)
  await P.locator('[data-testid="in-new"]').click(); await P.waitForTimeout(700)
  const win = P.locator('[data-testid="win-inputedit-x"]').locator('xpath=ancestor::*[contains(@class,"sheet") or @role="dialog" or contains(@class,"win")][1]')
  await P.selectOption('[data-testid="pp"] select', { label: person })
  const picked = await P.evaluate(label => {
    const s = [...document.querySelectorAll('select')].find(s => s.getBoundingClientRect().width > 0 && s.options[0] && s.options[0].textContent.trim() !== 'All types' && [...s.options].some(o => o.textContent.trim() === 'OL') && [...s.options].some(o => o.textContent.trim() === 'LL'))
    if (!s) return null
    const o = [...s.options].find(o => o.textContent.trim() === label); if (!o) return 'no option'
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value)
    s.dispatchEvent(new Event('change', { bubbles: true })); return 'set ' + label
  }, kindLabel)
  console.log('   kind:', picked); await P.waitForTimeout(300)
  const goTo = async iso => {
    const [y, m] = iso.split('-').map(Number)
    for (let i = 0; i < 40 && !(await P.locator(`[data-testid="inpEdCal-day-${iso}"]`).count()); i++) {
      const cur = await txt(P, T('inpEdCal-title'))
      const d = new Date(`1 ${cur.replace('›', '').trim()}`)
      const diff = (y - d.getFullYear()) * 12 + (m - 1 - d.getMonth())
      await P.locator(`[data-testid="inpEdCal-${diff > 0 ? 'next' : 'prev'}"]`).click(); await P.waitForTimeout(150)
    }
  }
  await goTo(from)
  await P.locator(`[data-testid="inpEdCal-day-${from}"]`).click(); await P.waitForTimeout(250)
  if (to) { await goTo(to); await P.locator(`[data-testid="inpEdCal-day-${to}"]`).click(); await P.waitForTimeout(250) }
  await shot(w, `input-${person}-${from}`)
  await P.locator('button', { hasText: /^Add$/ }).last().click(); await P.waitForTimeout(1200)
  const nd = P.locator('button', { hasText: /^No document$/ }); if (await nd.count()) { await nd.first().click(); await P.waitForTimeout(1200) }
  await shot(w, `input-${person}-${from}-after`)
  return { added: !(await P.locator('[data-testid="win-inputedit-x"]').isVisible().catch(() => false)) }
}
