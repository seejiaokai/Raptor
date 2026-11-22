// sud-w6-lib — walker w6's helpers for the D2338 walk (his SANS-days bell line, its life and its tap), 23 Nov 26, chat 147.
// Built on asp-w2-lib (the clock, the sign-in, the board, the Post out sheet, Admin → Users) and cal-A-lib2's SANS calendar
// recipe. window.* is only READ here (and window.go, the recipes' own page switch). Import './sud-w6-env.mjs' first.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import * as L from './asp-w2-lib.mjs'
export * from './asp-w2-lib.mjs'
const { sleep, HEX } = L

export const STATE_DIR = 'D:/raptor-work/c147-walk/w6'
mkdirSync(STATE_DIR, { recursive: true })
export const tid = (p, id) => p.locator(`[data-testid="${id}"]`)
const clean = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()

/* a fresh browser context — optionally reopening a saved world (built through the app's controls by `build`) */
export async function world2(sz, W, when, stateFile) {
  const b = await sz.eng.launch(sz.launch)
  const ctx = await b.newContext({ ...sz.opts, ...(stateFile ? { storageState: stateFile } : {}) })
  await ctx.clock.install({ time: new Date(when) })
  const p = await ctx.newPage()
  p.on('pageerror', e => W.errs.push('PAGEERROR ' + e.message))
  p.on('console', m => { if (m.type() === 'error') W.errs.push('CONSOLE ' + m.text().slice(0, 200)) })
  p.on('response', r => { if (r.status() >= 400) W.errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  p.on('requestfailed', r => W.errs.push('REQFAIL ' + r.url()))
  await p.goto(L.URL_)
  return { b, ctx, p }
}
/* sign in as a user from whatever screen: signed out first if anyone is in */
export async function as(p, W, user, pass = 'x') {
  await p.waitForSelector('#luser:visible, #vWeek .day, #eWeek .day, #shell', { timeout: 20000 }).catch(() => {})
  await sleep(300)
  if (!(await p.locator('#luser:visible').count())) await L.signOut(p, W)
  await L.signIn(p, user, pass)
  return p.evaluate(() => { const b = document.querySelector('#roleBadge'); return b ? (b.textContent || '').replace(/\s+/g, ' ').trim() : '' })
}
/* the clock moved (Playwright's setSystemTime) and the page reloaded; signed in again as `user` if the reload asks */
export async function moveTo(p, W, when, user, pass = 'x') {
  await p.clock.setSystemTime(new Date(when))
  await p.reload(); await sleep(1400)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, user, pass)
  await p.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached', timeout: 15000 }).catch(() => {})
  return L.today(p)
}
export async function reload(p, user, pass = 'x') {
  await p.reload(); await sleep(1400)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, user, pass)
}

/* ---- the bell ---- */
export const readBellLines = p => p.evaluate(() => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  if (!list) return null
  const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
  return [...list.querySelectorAll('.bl-line')].map(e => {
    const r = e.getBoundingClientRect()
    return { id: (e.dataset.testid || '').replace('bell-line-', ''), unread: e.classList.contains('unread'), name: t(e.querySelector('.bl-name')), nameBold: (() => { const n = e.querySelector('.bl-name'); return n ? n.tagName + '/' + getComputedStyle(n).fontWeight : '' })(), day: t(e.querySelector('.bl-day')), struck: t(e.querySelector('.bl-struck')), what: t(e.querySelector('.bl-what')), ago: t(e.querySelector('.bl-ago')), h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.x), right: Math.round(r.right) }
  })
})
export const bellLit = p => p.evaluate(() => { const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : 'no bell' })
export async function bellOpen(p, W, tag) {
  const lit = await bellLit(p)
  if (!(await readBellLines(p))) await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 }).catch(() => {})
  await sleep(300)
  const lines = (await readBellLines(p)) || []
  const pic = tag ? await W.pic(p, tag + '-bell') : ''
  return { lit, lines, sans: lines.filter(l => /SANS availability/.test(l.name)), pic }
}
export async function bellClose(p, W, how = 'escape') {
  if (!(await readBellLines(p))) return 'was closed'
  if (how === 'escape') await p.keyboard.press('Escape')
  else if (how === 'bell') await W.press(p, '.bellbtn:visible', 'bell-again')
  else { // a tap outside it, at the screen's lower left
    const vp = p.viewportSize()
    if (W.isPhone) await p.touchscreen.tap(20, vp.height - 30); else await p.mouse.click(20, vp.height - 30)
  }
  await sleep(400)
  return (await readBellLines(p)) ? 'still open' : 'closed'
}
export const sansWords = l => l ? `${l.unread ? '[unread] ' : '[read] '}"${l.name}" · "${l.day}" · ${l.struck ? 'struck "' + l.struck + '" · ' : ''}"${l.what}"` : 'no line'
export const active = b => b.sans.filter(l => !l.struck)
export const struck = b => b.sans.filter(l => !!l.struck)

/* the line tapped: what it opened (the page, the SANS tab, its month, the day window and its title) */
export async function bellTap(p, W, lineId, tag) {
  const l = p.locator(`[data-testid="bell-line-${lineId}"]`).first()
  await l.waitFor({ state: 'visible', timeout: 6000 })
  const bb = await l.boundingBox()
  const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2
  if (W.isPhone) { await p.touchscreen.tap(x, y); await sleep(60); await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${tag}-line-now-phone.png`) }) }
  else await p.mouse.click(x, y)
  await sleep(1100)
  const got = await readSansPage(p)
  const pic = await W.pic(p, tag + '-tapped')
  return { ...got, pic }
}
export const readSansPage = p => p.evaluate(() => {
  const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const win = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(vis)
  let winInfo = null
  if (win) {
    const r = win.getBoundingClientRect()
    const mx = r.x + r.width / 2, my = r.y + Math.min(r.height / 2, 60)
    const top = document.elementFromPoint(mx, my)
    const add = win.querySelector('[data-testid="sd-add"]')
    winInfo = { head: t(win).slice(0, 60), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], inScreen: r.top >= -1 && r.left >= -1 && r.top < innerHeight - 40, topIsWin: !!(top && win.contains(top)), add: add ? (add.disabled ? 'disabled' : 'enabled') : 'none', addwhy: t(win.querySelector('[data-testid="sd-addwhy"]')), list: t(win.querySelector('[data-testid="sd-list"]')).slice(0, 160) }
  }
  const tab = document.querySelector('#inSansMode')
  return { page: window.CURPAGE, sansTab: tab ? (tab.classList.contains('on') || tab.getAttribute('aria-selected') === 'true' || tab.getAttribute('aria-pressed') === 'true') : null, cal: vis(document.querySelector('[data-testid="sanscal"]')), month: t(document.querySelector('[data-testid="sc-month"]')), win: winInfo, bellOpen: !!document.querySelector('[data-testid="bell-list"]') }
})

/* ---- the SANS calendar (cal-A-lib2's recipe) ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function openSans(p, W) {
  await L.go(p, 'inputs')
  await p.waitForSelector('#inSansMode', { timeout: 10000 })
  await W.press(p, '#inSansMode', 'sans-tab')
  await tid(p, 'sanscal').first().waitFor({ timeout: 8000 }); await sleep(300)
}
export async function sansGoto(p, W, iso) {
  const at = async () => { const [m, y] = clean(await tid(p, 'sc-month').first().textContent()).toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m.slice(0, 3))) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) { await W.press(p, tid(p, 'sc-next').first(), 'sc-next'); await sleep(300) }
  for (; d < 0; d++) { await W.press(p, tid(p, 'sc-prev').first(), 'sc-prev'); await sleep(300) }
  await sleep(350)
  return clean(await tid(p, 'sc-month').first().textContent())
}
export async function sansClose(p, W, how = 'x') {
  if (!(await tid(p, 'win-sansday').count())) return 'none open'
  if (how === 'x') { const x = tid(p, 'win-sansday-x').first(); if (await x.count()) await W.press(p, x, 'sansday-x'); else await p.keyboard.press('Escape') }
  else await p.keyboard.press('Escape')
  await sleep(400)
  return (await tid(p, 'win-sansday').count()) ? 'still open' : 'closed'
}
export async function sansOpenDay(p, W, iso) {
  if (await tid(p, 'win-sansday').count()) await sansClose(p, W)
  await sansGoto(p, W, iso)
  const c = tid(p, 'sc-day-' + iso).first()
  await c.scrollIntoViewIfNeeded()
  if (W.isPhone) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await tid(p, 'win-sansday').first().waitFor({ timeout: 6000 }); await sleep(500)
}
/* "+ Commitment" on the day window already open (or opened): who (a callsign — the Person box only where it is offered),
   OFT ticked, Fly and AMT off, All day as it comes; Add. Reads back the input made (by the difference of ids). */
export async function sansFileOpen(p, W, iso, who = 'Hex', flags = { o: true }) {
  const before = await p.evaluate(() => (window.INPUTS || []).map(i => i.iid))
  const add = tid(p, 'sd-add').first()
  const dis = await add.isDisabled().catch(() => true)
  if (dis) return { ok: false, why: 'the + Commitment button is greyed: ' + clean(await tid(p, 'sd-addwhy').first().textContent().catch(() => '')) }
  await W.press(p, add, 'sd-add')
  await p.waitForSelector('#inpEditSave', { timeout: 6000 }); await sleep(300)
  let person = 'no Person box'
  if (await p.locator('#inpEditPerson:visible').count()) {
    await p.selectOption('#inpEditPerson', { label: who }).catch(async () => { await p.selectOption('#inpEditPerson', { label: new RegExp(who) }) })
    person = await p.$eval('#inpEditPerson', s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '?')
  }
  const set = async (label, on) => {
    const box = p.locator('#inpEditSans label', { hasText: label }).locator('input').first()
    if (!(await box.count())) return
    if ((await box.isChecked()) !== on) { if (W.isPhone) await box.tap(); else await box.click() ; await sleep(150) }
  }
  await set('Fly', !!flags.f); await set('AMT', !!flags.a); await set('OFT', !!flags.o)
  const allday = await p.locator('#inpEditAllday').isChecked().catch(() => null)
  const formPic = await W.pic(p, `file-${iso}-form`)
  await W.press(p, '#inpEditSave', 'inp-add'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(500) }
  const err = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [role="alert"], [data-testid="win-inputedit"] .inped-err, [data-testid="win-inputedit"] .inped-bad')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).join(' | '))
  const made = await p.evaluate(b => (window.INPUTS || []).filter(i => !b.includes(i.iid)).map(i => ({ iid: i.iid, person: i.person || (JSON.stringify(i.people || []).includes('rocky') ? 'rocky' : JSON.stringify(i.people || []).slice(0, 80)), type: i.type, date: i.date, yr: i.yr, sans: i.sans, allday: i.allday })), before)
  const still = await tid(p, 'win-inputedit').first().isVisible().catch(() => false)
  if (still) { const x = tid(p, 'win-inputedit-x').first(); if (await x.count()) await W.press(p, x, 'inpedit-x') }
  return { ok: made.length === 1 && made[0].person === 'rocky', person, allday, made, err, formPic }
}
export async function sansFile(p, W, iso, who = 'Hex', flags = { o: true }) {
  await sansOpenDay(p, W, iso)
  return sansFileOpen(p, W, iso, who, flags)
}

/* ---- the week shown on Edit Schedule: by the week strip on a desktop, by "Jump to a date" on a phone ---- */
export async function gotoWeek(p, W, mondayIso) {
  await L.go(p, 'editsched')
  const wk = `${mondayIso.slice(8, 10)}/${mondayIso.slice(5, 7)}/${mondayIso.slice(0, 4)}`
  if ((await p.evaluate(() => window.CURWEEK)) === wk) return wk
  const seg = p.locator(`#weekSegE [data-wk="${wk}"]:visible`).first()
  if (await seg.count()) await W.press(p, seg, 'wk-' + mondayIso)
  else {
    await W.press(p, p.locator('.filt-cal:visible, .wk-cal:visible').first(), 'jump-cal')
    await tid(p, 'wcal').first().waitFor({ timeout: 6000 })
    for (let i = 0; i < 24; i++) {
      const m = await tid(p, 'wcal').first().getAttribute('data-month')
      const diff = (+mondayIso.slice(0, 4) * 12 + +mondayIso.slice(5, 7)) - (+m.slice(0, 4) * 12 + +m.slice(5, 7))
      if (!diff) break
      await W.press(p, tid(p, diff > 0 ? 'wcal-next' : 'wcal-prev').first(), 'wcal-step'); await sleep(300)
    }
    await W.press(p, tid(p, 'wcal-day-' + mondayIso).first(), 'wcal-day')
  }
  await sleep(1200)
  return p.evaluate(() => window.CURWEEK)
}

/* what Hex holds on a day of the loaded week (read only): the sections and rows naming him */
export const hexOn = (p, di, id = HEX) => p.evaluate(([di, id]) => {
  const d = (window.DAYS || [])[di]; if (!d) return 'no day'
  const out = []
  const walk = (o, path) => {
    if (o == null) return
    if (typeof o === 'string') { if (o === id) out.push(path); return }
    if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return }
    if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k)
  }
  walk(d, '')
  return d.dt + ': ' + (out.join(' ') || 'nothing')
}, [di, id])

/* ---- the Leave War posting sheet for Hex (the bid window's ⋯ → Post out, or the posted-out sheet straight away) ---- */
export async function postSheet(p, W, iso, tag) {
  const c = (await L.lwCell(p, W, HEX, iso)).cell
  if (!c) return { kind: 'NO CELL' }
  await W.press(p, c, 'cell-' + iso); await sleep(400)
  let kind = 'none'
  if (await p.locator('[data-testid="postout-sheet"]:visible').count()) kind = 'posted-out sheet'
  else if (await p.locator('[data-testid="bid-more"]:visible').count()) {
    await W.press(p, '[data-testid="bid-more"]:visible', 'more')
    await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    kind = (await p.locator('[data-testid="postout-sheet"]:visible').count()) ? 'bid window → ⋯ → Post out → posted-out sheet' : 'bid window → ⋯ → Post out (new posting sheet)'
  }
  const line = clean(await p.locator('[data-testid="postout-line"]:visible, [data-testid="po-line"]:visible').first().textContent().catch(() => ''))
  const pic = await W.pic(p, tag + '-sheet')
  return { kind, line, pic }
}
export async function sheetClose(p, W) {
  for (const s of ['[data-testid="postout-cancel"]:visible', '[data-testid="bid-cancel"]:visible']) if (await p.locator(s).count()) { await W.press(p, s, 'sheet-x'); break }
  await sleep(400)
}
export const hexRec = p => p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived, deleted: !!q.deleted } : 'no record' }, HEX)
export const hexNotices = p => p.evaluate(id => (window.NOTICES || []).filter(n => n.to === id).map(n => ({ id: n.id, name: n.name, day: n.day, k: (n.what || []).map(w => w.k).join(',') })), HEX)

/* ---- the base world: Wed 15 Jul as Saber — Hex posted out as SANS from Fri 17 Jul; BRIEF 08:00–09:00 naming him on Fri 17,
   Sat 18 and Tue 21 (the next week), and a second item on Sat 18 (TALK 13:00–14:00); the week of 13 Jul loaded at the end.
   His own demo flights (read first): Thu 16 wave 2, Mon 20 wave 1, Wed 22 wave 1; Fri 17, Sat 18, Sun 19, Tue 21 clear. */
export async function build(p, W, opts = {}) {
  const facts = {}
  const po = await L.postOut(p, W, HEX, opts.po || '2026-07-17', 'F01')
  facts.po = { line: po.line, after: po.after }
  W.rec('F01', `Leave War: Hex's ${opts.po || '17 Jul'} cell → ⋯ → Post out → SANS → Post out`, /becomes SANS/.test(po.line), `sheet line "${po.line}" · record ${L.J(po.after)}`, po.pic)
  const rows = opts.rows || [[4, 'BRIEF', '08:00', '09:00'], [5, 'BRIEF', '08:00', '09:00'], [5, 'TALK', '13:00', '14:00']]
  for (const [di, name, a, b] of rows) {
    await L.openBoard(p, W, di)
    const g = await L.groundRow(p, W, di, name, a, b, HEX)
    const ok = !!(g.row && L.J(g.row.who || '').includes(HEX))
    W.rec(`F-${di}-${name}`, `day ${di} of the week of 13 Jul: Ground Programme ${name} ${a}–${b} naming Hex (read back)`, ok, L.J(g.row), await W.pic(p, `F02-${di}-${name}`))
    if (!ok) return { ok: false }
  }
  await L.closeBoard(p, W)
  for (const [wk, di, name, a, b] of (opts.next || [['2026-07-20', 1, 'BRIEF', '08:00', '09:00']])) {
    const cw = await gotoWeek(p, W, wk)
    W.rec(`F-wk-${wk}`, `Edit Schedule moved to the week of ${wk} (read: CURWEEK)`, cw === `${wk.slice(8, 10)}/${wk.slice(5, 7)}/${wk.slice(0, 4)}`, cw)
    facts['before-' + wk] = await hexOn(p, di)
    await L.openBoard(p, W, di)
    const g = await L.groundRow(p, W, di, name, a, b, HEX)
    const ok = !!(g.row && L.J(g.row.who || '').includes(HEX))
    W.rec(`F-${wk}-${di}-${name}`, `week of ${wk}, day ${di}: ${name} ${a}–${b} naming Hex (read back; before: ${facts['before-' + wk]})`, ok, L.J(g.row), await W.pic(p, `F03-${wk}-${di}`))
    await L.closeBoard(p, W)
    if (!ok) return { ok: false }
  }
  const back = await gotoWeek(p, W, opts.home || '2026-07-13')
  facts.home = back
  facts.hex = []
  for (let di = 0; di < 7; di++) facts.hex.push(await hexOn(p, di))
  W.rec('F-home', 'back on the week of 13 Jul; what Hex holds each day (read)', back === (opts.homeWk || '13/07/2026'), facts.hex.join(' | '))
  return { ok: true, facts }
}
export function saveJson(name, o) { writeFileSync(path.join(STATE_DIR, name), JSON.stringify(o, null, 1)) }
