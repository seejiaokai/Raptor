// Walker B's helpers (an input's own title, 9 Oct 26) - every fixture through the app's own controls.
// Reads of window.INPUTS / window.DAYS only READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = (process.env.LOOK_URL || 'http://localhost:4232/').replace(/\/$/, '')
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-input-title-check/B'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ROWS = []
export const ERRS = []
export function row(n, size, role, verdict, said, pics = []) { ROWS.push({ n, size, role, verdict, said, pics }); console.log(`[${n} ${size}] ${verdict} :: ${said}`) }
export function saveRows(tag) {
  writeFileSync(`C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/it-B-rows-${tag}.json`, JSON.stringify({ rows: ROWS, errs: [...new Set(ERRS)] }, null, 1))
}

export async function newWorld({ width = 1440, height = 900, who = 'ad', pass = 'a', mobile = false, fresh = true } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, ...(mobile ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => ERRS.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') ERRS.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) ERRS.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/' + (fresh ? '?fresh=1' : ''))
  await signIn(page, who, pass)
  return { browser, ctx, page, mobile, who, pass }
}
export async function signIn(page, who = 'ad', pass = 'a') {
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(300)
}
export async function reload(W) {
  await W.page.reload(); await sleep(700)
  if (await W.page.locator('#luser').count()) await signIn(W.page, W.who, W.pass)
  await W.page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
}
export const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })
export const press = (W, loc) => W.mobile ? loc.tap() : loc.click()
export const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await sleep(500) }

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('calendar never reached month')
}
export const win = p => p.locator('[data-testid="win-inputedit"]')
export const DAYWIN = '[data-testid="win-inputsday"]'
export async function openNew(W, iso) {
  const p = W.page
  await go(p, 'inputs')
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await sleep(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (W.mobile) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await press(W, p.locator('#icPopAdd'))
  await win(p).waitFor()
}
/* save the open window; answer the OIL question if it comes. returns the question heading or '' */
export async function saveWin(W, oil) {
  const p = W.page
  await press(W, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let head = ''
  if (await sheet.waitFor({ timeout: oil ? 4000 : 900 }).then(() => true, () => false)) {
    head = (await sheet.locator('.airpop-head').innerText()).replace(/\s+/g, ' ').trim()
    await press(W, sheet.locator(`[data-testid="oil-${oil || 'no'}"]`)); await press(W, sheet.locator('[data-testid="oilconf-save"]'))
  }
  await sleep(450)
  return head
}
export async function closeWins(p) { for (let i = 0; i < 3; i++) { await p.keyboard.press('Escape'); await sleep(150) } }
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const recBy = (p, f) => p.evaluate(f => { const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k])); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, acc: r.acc, hasTitle: 'title' in r } : null }, f)
/* file an input through the calendar window: {iso, type, person, s, e, title, rmk, oil, endIso} */
export async function fileInput(W, f) {
  const p = W.page
  await openNew(W, f.iso)
  if (f.type) await p.selectOption('#inpEditType', f.type)
  if (f.person) await p.selectOption('#inpEditPerson', f.person)
  if (f.s) await p.fill('#inpEditStart', f.s).catch(() => {})
  if (f.e) await p.fill('#inpEditEnd', f.e).catch(() => {})
  if (f.title != null) await p.fill('#inpEditTitle', f.title)
  if (f.rmk != null) await p.fill('#inpEditRmk', f.rmk)
  const head = await saveWin(W, f.oil)
  await closeWins(p)
  return head
}
/* open a saved input's window from the month: click its bar, then the card's open control if the day card shows */
export async function openSaved(W, iid, iso) {
  const p = W.page
  await go(p, 'inputs')
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await sleep(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (W.mobile) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await sleep(300)
  const c = p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`)
  await press(W, c)
  await win(p).waitFor()
}
/* retitle a saved input through its window; title '' empties */
export async function retitle(W, iid, iso, title, oil) {
  const p = W.page
  await openSaved(W, iid, iso)
  await p.fill('#inpEditTitle', title)
  const head = await saveWin(W, oil)
  await closeWins(p)
  return head
}

/* ---------- the schedule ---------- */
export async function editWeek(p) { await closeBoard(p); if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await go(p, 'editsched') }
export async function closeBoard(p) {
  if (!(await p.locator('#schedBoard:visible').count())) return
  const x = p.locator('#sbDone:visible, #sbClose:visible').first()
  if (await x.count()) { await x.click(); await sleep(600) } else { await p.keyboard.press('Escape'); await sleep(500) }
}
export async function showDay(p, di, surf = '#eWeek') {
  await p.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`)
    if (!d) return
    const sc = d.closest('.week') || d.parentElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0)
    window.scrollTo(0, 0)
  }, [surf, di])
  await sleep(350)
}
export let TAP = false
export const setTap = v => { TAP = v }
const pressDay = async (p, attr, di) => {
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = p.locator(`${r} [${attr}="${di}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'absent' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled: ' + (await b.getAttribute('title')) }
  const label = (await b.innerText()).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (TAP) await b.tap(); else await b.click()
  await sleep(900)
  return { pressed: true, label }
}
export async function signDay(p, di, pick = 0) {
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = p.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)])
    await sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
export const publishDay = (p, di) => pressDay(p, 'data-beak', di)
export const publishAL = (p, di) => pressDay(p, 'data-alpub', di)
/* sign all four and publish (first issue, else an amendment) on the edit week */
export async function pubDay(W, di) {
  const p = W.page
  await editWeek(p); await showDay(p, di)
  const sg = await signDay(p, di, 0)
  let r = await publishDay(p, di)
  let kind = 'ORIG'
  if (!r.pressed) { r = await publishAL(p, di); kind = 'AL' }
  await sleep(500)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(700) }
  return { sg, r, kind }
}
/* what the edit week says about day di */
export async function face(p, di) {
  await editWeek(p); await showDay(p, di)
  return p.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`)
    if (!d) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const pend = [...d.querySelectorAll('.dpend:not(.dnew):not(.dchg)')].map(t)
    const signs = [...d.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '')
    const rows = [...d.querySelectorAll('.pl-row.gr-frominput')].map(r => ({ name: t(r.querySelector(':scope > .nm .ntx')), kind: t(r.querySelector(':scope > .nm .nm-kind')) }))
    const unav = ((d, t) => [...d.querySelectorAll('.sec-unav .pl-row > .nm')].map(n => ({ name: t(n.querySelector('.ntx')), kind: t(n.querySelector('.nm-kind')) })).filter(x => x.name))(d, t)
    return { tag: t(d.querySelector('.verchip')), pend, nys: t(d.querySelector('.nysmark')), signs: signs.map(s => /name/i.test(s) ? '·' : s), signed: signs.filter(s => s && !/name/i.test(s)).length, rows, unav, signedLn: t(d.querySelector('.signedln')) }
  }, di)
}
/* the changes window ("To go out") for day di: the pending-list button on the edit week */
export async function toGoOut(p, di) {
  await editWeek(p); await showDay(p, di)
  const b = p.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return '(no pending button)'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
  const t = await p.evaluate(() => { const e = document.querySelector('.chgwin .cw-out') || document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(window not found)' })
  return t
}
export const closeTop = async p => { await p.keyboard.press('Escape'); await sleep(250) }
/* what View-only Sched says about day di (issued face) */
export async function viewFace(p, di) {
  await go(p, 'viewsched'); await showDay(p, di, '#vWeek')
  return p.evaluate(i => {
    const d = document.querySelector(`#vWeek .day[data-day="${i}"]`)
    if (!d) return null
    const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const sel = d.querySelector('select[data-vwork], select[data-dver]')
    return {
      tag: t(d.querySelector('.verchip')), pend: [...d.querySelectorAll('.dpend:not(.dnew):not(.dchg)')].map(t), nys: t(d.querySelector('.nysmark')),
      unav: ((d, t) => [...d.querySelectorAll('.sec-unav .pl-row > .nm')].map(n => ({ name: t(n.querySelector('.ntx')), kind: t(n.querySelector('.nm-kind')) })).filter(x => x.name))(d, t),
      rows: [...d.querySelectorAll('.pl-row.gr-frominput')].map(r => ({ name: t(r.querySelector(':scope > .nm .ntx')), kind: t(r.querySelector(':scope > .nm .nm-kind')) })),
      picker: sel ? { attr: sel.hasAttribute('data-vwork') ? 'vwork' : 'dver', opts: [...sel.options].map(o => (o.selected ? '*' : '') + o.text) } : null,
      signedLn: t(d.querySelector('.signedln')),
    }
  }, di)
}
export async function viewPick(p, di, value) {
  const sel = p.locator(`#vWeek select[data-vwork="${di}"]:visible, #vWeek select[data-dver="${di}"]:visible`).first()
  if (!(await sel.count())) return false
  await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sel.selectOption(value); await sleep(600); return true
}
export async function undoRedo(p, dir) {
  const sels = dir === 'undo' ? ['#undoBtn', '#sbUndo'] : ['#redoBtn', '#sbRedo']
  for (const s of sels) {
    const b = p.locator(`${s}:visible`).first()
    if (await b.count()) {
      if (await b.isDisabled()) return { pressed: false, why: 'disabled', title: await b.getAttribute('title') }
      const title = await b.getAttribute('title'); await b.click(); await sleep(900); return { pressed: true, title }
    }
  }
  return { pressed: false, why: 'no button' }
}
export const rec = (p, iid) => p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { person: r.person, type: r.type, title: r.title, date: r.date, endDate: r.endDate, remarks: r.remarks } : null }, iid)
export const dayGround = (p, di) => p.evaluate(i => window.DAYS[i].ground.map(g => ({ prog: g.prog, src: g.src, srcType: g.srcType })), di)

/* ---------- shared scenario helpers ---------- */
export const SIZES = { desk: { width: 1440, height: 900, mobile: false }, phone: { width: 390, height: 844, mobile: true } }
export async function mk(size, o = {}) {
  const S = SIZES[size]
  const W = await newWorld({ ...S, fresh: false, ...o })
  setTap(S.mobile)
  W.size = size
  return W
}
/* the changes window: close it (its own X, else Escape) */
export async function closeChg(p) {
  if (!(await p.locator('.chgwin').count())) return
  const x = p.locator('.chgwin .win-x, .chgwin button[aria-label^="Close"]').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(300) }
  if (await p.locator('.chgwin').count()) { await p.keyboard.press('Escape'); await sleep(300) }
}
/* one reading of day di: the edit week, View-only Sched, and (when something is pending) "To go out" */
export async function snap(W, di, { togo = true, pic = null, focus = null } = {}) {
  const p = W.page
  const f = await face(p, di)
  if (focus) await focusName(p, "#eWeek", di, focus)
  if (pic) await shot(p, pic + "-edit")
  let t = null
  if (togo && f && f.pend.length) { t = await toGoOut(p, di); if (pic) await shot(p, pic + '-togo'); await closeChg(p) }
  const v = await viewFace(p, di)
  if (focus) await focusName(p, "#vWeek", di, focus)
  if (pic) await shot(p, pic + '-view')
  return { f, v, togo: t }
}
export const nm = s => (s && s.rows ? s.rows.map(r => r.name + (r.kind ? '[' + r.kind + ']' : '')).join('|') : '(none)')
export const un = s => (s && s.unav ? s.unav.map(r => r.name + (r.kind ? '[' + r.kind + ']' : '')).join('|') : '(none)')
export const brief = S => `edit{pend:${S.f.pend.join(',') || '0'} nys:${S.f.nys ? 'YES' : 'no'} rows:${nm(S.f)} unav:${un(S.f)} signedLn:${S.f.signedLn ? 'stands' : 'none'}} view{rows:${nm(S.v)} unav:${un(S.v)} pend:${S.v.pend.join(',') || '0'}}${S.togo ? ' togo{' + S.togo.replace(/^.*?Waiting to go out/, 'Waiting to go out').slice(0, 220) + '}' : ''}`
export async function undo(W) { return L_undo(W.page, 'undo') }
export async function redo(W) { return L_undo(W.page, 'redo') }
const L_undo = async (p, d) => { await editWeek(p); return undoRedo(p, d) }
/* bring the first name in day di that matches re (a string) to the middle of the window, for the picture */
export async function focusName(p, root, di, re) {
  await p.evaluate(([root, di, re]) => {
    const d = document.querySelector(`${root} .day[data-day="${di}"]`); if (!d) return
    const rx = new RegExp(re, 'i')
    const el = [...d.querySelectorAll('.nm .ntx')].find(e => rx.test(e.textContent))
    if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' })
  }, [root, di, re])
  await sleep(350)
}

/* the checkpoint after a title change: Undo -> (Redo -> reload) | (reload). read(tag) returns {s, text, pics}; applied/reverted judge s. */
export async function checkpoint(W, variant, { n, tag, role = 'admin', read, applied, reverted }) {
  const size = W.size
  const u = await undo(W)
  const r2 = await read(tag + '-2undo')
  const ok2 = u.pressed && reverted(r2.s)
  row(n, size, role, ok2 ? 'PASS' : 'FAIL', `[${variant}] after Undo${u.pressed ? '' : ' (undo not pressable: ' + u.why + ')'}: ${r2.text}`, r2.pics)
  if (variant === 'A') {
    const rd = await redo(W)
    const r3 = await read(tag + '-3redo')
    row(n, size, role, rd.pressed && applied(r3.s) ? 'PASS' : 'FAIL', `[A] after Redo${rd.pressed ? '' : ' (redo not pressable)'}: ${r3.text}`, r3.pics)
    await reload(W)
    const r4 = await read(tag + '-4reload')
    row(n, size, role, applied(r4.s) ? 'PASS' : 'FAIL', `[A] after reload: ${r4.text}`, r4.pics)
  } else {
    await reload(W)
    const r4 = await read(tag + '-4reload')
    row(n, size, role, reverted(r4.s) ? 'PASS' : 'FAIL', `[B] Undo then reload: ${r4.text}`, r4.pics)
  }
}

/* the Scheduler Board of day di (opened from the week's own day button) */
export async function openBoard(W, di) {
  const p = W.page
  await closeBoard(p)
  await go(p, 'editsched'); await showDay(p, di)
  const b = p.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (W.mobile) await b.tap(); else await b.click()
  await p.waitForSelector('#schedBoard'); await sleep(600)
}
export async function boardRows(p) {
  return p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].map(r => {
    const f = r.querySelector('[data-bfld$=".prog"]'); const k = r.querySelector('.nm-kind')
    return { name: f ? (f.value || f.textContent || '').trim() : '', kind: k ? k.textContent.trim() : '' }
  }).filter(x => x.name))
}
export async function boardFocus(p, re) {
  await p.evaluate(re => { const rx = new RegExp(re, 'i'); const r = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].find(r => { const f = r.querySelector('[data-bfld$=".prog"]'); return f && rx.test(f.value || f.textContent || '') }); if (r) r.scrollIntoView({ block: 'center' }) }, re)
  await sleep(300)
}

/* View-only Sched: pick the version whose label matches re, then read the day */
export async function viewVersion(p, di, re) {
  await go(p, 'viewsched'); await showDay(p, di, '#vWeek')
  const sel = p.locator(`#vWeek select[data-vwork="${di}"]:visible, #vWeek select[data-dver="${di}"]:visible`).first()
  if (!(await sel.count())) return { missing: true }
  const val = await sel.evaluate((s, re) => { const o = [...s.options].find(o => new RegExp(re, 'i').test(o.text)); return o ? o.value : null }, re)
  if (val === null) return { missing: true, opts: await sel.evaluate(s => [...s.options].map(o => o.text)) }
  await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sel.selectOption(val); await sleep(700)
  return viewFace(p, di)
}
