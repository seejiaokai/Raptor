/* WALKER G — the Inputs / SANS calendar check (8 Oct 26): shared helpers. Built on the older drivers (dbrA-lib: launch,
   context, page, settle; dbrA-W1-lib: signDay, publishDay, publishAL, head). Every fixture goes through the app's own
   controls; window.* is read to GET to a place and to READ state only (brief, hard rules). */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
process.env.HP_URL = 'http://localhost:4213'
const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
export const SHOTS = ROOT + '/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/G'
export const OUTJSON = ROOT + '/docs/handpass/parts/cal-G.json'
process.env.HP_SHOTS = SHOTS
process.env.HP_OUT = OUTJSON
mkdirSync(SHOTS, { recursive: true })
export const L = await import('./dbrA-lib.mjs')
export const W = await import('./dbrA-W1-lib.mjs')
export const sleep = L.sleep
export const BASE = 'http://localhost:4213'

/* ---------- the table + pictures ---------- */
export const TABLE = []
let N = 0
let TAG = 'x'
export const setTag = t => { TAG = t }
export const PICS = { saved: 0, opened: 0 }
export async function shot(p, name) {
  const f = `${TAG}-${PHONE ? 'ph' : 'dk'}-${String(++N).padStart(3, '0')}-${name}.png`
  await p.screenshot({ path: `${SHOTS}/${f}` }).catch(() => {})
  PICS.saved++
  return f
}
export function row(id, did, saw, verdict, pics = [], figures = null) {
  const r = { id, did, saw, verdict, pics, figures }
  TABLE.push(r)
  console.log(`== ${verdict}  ${id}\n   did: ${did}\n   saw: ${String(saw).slice(0, 1500)}`)
  return r
}
export function saveRows(tag) {
  let all = {}
  if (existsSync(OUTJSON)) { try { all = JSON.parse(readFileSync(OUTJSON, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[tag + (PHONE ? '-ph' : '')] = { at: new Date().toISOString(), base: BASE, table: TABLE, pics: { ...PICS } }
  writeFileSync(OUTJSON, JSON.stringify(all, null, 1))
  console.log('saved', tag, '->', OUTJSON, 'pictures', JSON.stringify(PICS))
}

/* ---------- a world ---------- */
export const PHONE = !!process.env.G_PHONE
export async function world({ who = 'a', phone = PHONE, fresh = false } = {}) {
  const browser = await L.launch()
  const ctx = await L.context(browser, { phone })
  const errors = []
  const p = await L.page(ctx, errors)
  await p.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  await L.signIn(p, who, { goto: false })
  return { browser, ctx, p, errors }
}

/* ---------- the Inputs page ---------- */
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function toInputsCal(p) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.locator('#inpCal').waitFor({ timeout: 10000 })
}
export async function monthTo(p, y, m0) {
  const at = async () => { const [m, yy] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +yy * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = y * 12 + m0 - await at()
  for (; d > 0; d--) { await p.locator('#icNext').click(); await sleep(120) }
  for (; d < 0; d++) { await p.locator('#icPrev').click(); await sleep(120) }
  await sleep(300)
}
export async function openDay(p, iso) {
  if (await p.locator(`[data-icday="${iso}"].is-open`).count() && await p.locator('[data-testid="win-inputsday"]').count()) { await sleep(200); return }
  await p.locator(`[data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
  await p.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 5000 })
  await sleep(300)
}
/* on the open day: "+ Input" */
export async function plusInput(p) {
  await p.locator('#icPopAdd').click()
  await p.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 })
  await sleep(300)
}
/* in the editor window: several people (ids), type, all-day or hours, remarks; then Add/Save. Returns the new iids. */
export async function fillShared(p, { type, ids, allday = true, start, end, remarks = '' }) {
  if (type) await p.selectOption('#inpEditType', type)
  await sleep(150)
  const pk = p.locator('#inpEditPop [data-testid="pp"]')
  if (ids.length > 1) {
    await pk.locator('[data-testid="pp-several"]').click(); await sleep(200)
    for (const id of ids) { const b = pk.locator(`[data-pp="${id}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') { await b.click(); await sleep(80) } }
    // the picker starts with the signed-in person lit: take off whoever was not asked for
    const lit = await pk.locator('[data-pp][aria-pressed="true"]').evaluateAll(es => es.map(e => e.getAttribute('data-pp')))
    for (const id of lit) if (!ids.includes(id)) { await pk.locator(`[data-pp="${id}"]`).click(); await sleep(80) }
  } else {
    await p.selectOption('#inpEditPerson', ids[0])
  }
  if (await p.locator('#inpEditAllday').count()) {
    const cur = await p.locator('#inpEditAllday').isChecked()
    if (cur !== allday) await p.locator('#inpEditAllday').click()
  }
  if (!allday && start) { await p.locator('#inpEditStart').fill(start); await p.locator('#inpEditEnd').fill(end); await p.locator('#inpEditEnd').blur() }
  if (remarks) await p.fill('#inpEditRmk', remarks)
  await sleep(200)
}
export async function iidsNow(p) { return p.evaluate(() => window.INPUTS.map(x => x.iid)) }
export async function inputsAfter(p, had) {
  return p.evaluate(h => window.INPUTS.filter(x => !h.includes(x.iid)).map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate, grp: x.grp, grpBy: x.grpBy, allday: x.allday, oil: x.oil, oilDays: x.oilDays, remarks: x.remarks, acc: x.acc })), had)
}
/* answer an OIL question sheet if one is up: choice 'yes' | 'no'; returns what it said */
export async function answerOil(p, choice) {
  const conf = p.locator('[data-testid="oilconf"]:visible')
  await sleep(500)
  if (!(await conf.count())) return null
  const said = (await conf.first().innerText()).replace(/\s+/g, ' ').trim().slice(0, 400)
  const btn = choice === 'yes' ? 'oil-yes' : 'oil-no'
  if (await conf.locator(`[data-testid="${btn}"]`).count()) await conf.locator(`[data-testid="${btn}"]`).click()
  else await conf.locator(`[data-testid="${choice === 'yes' ? 'oil-all' : 'oil-none'}"]`).click()
  await sleep(200)
  await conf.locator('[data-testid="oilconf-save"]').click()
  await sleep(700)
  return said
}

/* ---------- the schedule: publish a day, read its head ---------- */
export async function toEdit(p) { await W.toEdit(L, p) }
export async function dayHead(p, di) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
  await W.showDay(p, di)
  return W.head(p, di)
}
export const pend = h => h ? h.pending : null

/* ---------- OIL: the Leave War cell and the tracker row, per man ---------- */
export async function lwOil(p, ids, iso) {
  await L.go(p, 'leavewar'); await sleep(1200)
  const mon = new Date(iso + 'T12:00:00').toLocaleString('en', { month: 'short' }).toUpperCase()
  const mb = p.locator(`[data-testid="month-${mon}"]`)
  if (await mb.count()) { await mb.first().click(); await sleep(1200) }
  const cells = await p.evaluate(([i, d]) => {
    const P = window.PEOPLE, o = {}
    for (const id of i) {
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      o[id] = { cs: (P[id] && P[id].cs) || id, cell: c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL DRAWN' }
    }
    return o
  }, [ids, iso])
  await p.locator('[data-testid="oil-tracker"]').click(); await sleep(1500)
  const bal = await p.evaluate(i => {
    const out = {}
    for (const id of i) {
      const r = document.querySelector(`[data-testid="oil-row-${id}"]`) || document.querySelector(`[data-oilrow="${id}"]`)
      if (!r) { out[id] = { row: 'NO ROW' }; continue }
      const b = r.querySelector(`[data-testid="oil-bal-${id}"]`), a = r.querySelector(`[data-testid="oil-arch-${id}"]`)
      out[id] = { bal: b ? b.textContent.trim().replace('−', '-') : null, arch: a ? (a.innerText || '').trim() : '',
        ents: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
    }
    return out
  }, ids)
  const out = {}
  for (const id of ids) out[cells[id].cs] = { cell: cells[id].cell, bal: bal[id].bal, arch: bal[id].arch, ents: bal[id].ents, row: bal[id].row }
  return out
}
export async function closeOilTracker(p) {
  const x = p.locator('[data-testid="oil-tracker-close"], [data-testid="oil-close"]').first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
}

/* ---------- the changes window of a day (Edit Schedule): every tab, grouped by Item and by Who ---------- */
export async function readChanges(p, di, label) {
  const out = { opened: false }
  const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (!(await chip.count())) return out
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await chip.click(); await sleep(700)
  const win = p.locator('.chgwin:not([hidden])').first()
  if (!(await win.count())) return out
  out.opened = true
  const tabs = await win.locator('.win-tab').allInnerTexts()
  out.tabs = tabs.map(t => t.replace(/\s+/g, ' ').trim())
  out.pics = []
  const body = async () => (await win.locator('.cw-body').first().innerText().catch(() => '')).split(/\n/).map(t => t.trim()).filter(Boolean)
  for (let i = 0; i < tabs.length; i++) {
    await win.locator('.win-tab').nth(i).click(); await sleep(350)
    const nm = out.tabs[i].replace(/[^A-Za-z]+/g, '').slice(0, 10)
    out[nm] = await body()
    if (i < 2) {
      // the grouping: Item (default) and Who
      const whoBtn = win.locator('.cw-g-btn', { hasText: 'Who' }).first()
      out[nm + '_item'] = out[nm]
      if (await whoBtn.count()) {
        out.pics.push(await shot(p, `${label}-chg-${nm}-item`))
        await whoBtn.click(); await sleep(300)
        out[nm + '_who'] = await body()
        out.pics.push(await shot(p, `${label}-chg-${nm}-who`))
        await win.locator('.cw-g-btn', { hasText: 'Item' }).first().click(); await sleep(250)
      }
    } else out.pics.push(await shot(p, `${label}-chg-${nm}`))
  }
  const x = win.locator('.win-x').first()
  await x.click().catch(() => {}); await sleep(300)
  return out
}
/* what the issued (View-only Sched) face of a day says */
export async function viewDayText(p, di) {
  await L.go(p, 'viewsched')
  await W.showDay(p, di, '#vWeek')
  return p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); return d ? d.innerText.replace(/\s+/g, ' ').trim() : null }, di)
}
export async function toWeek(p, wk) { await p.evaluate(w => window.loadWeek(w), wk); await sleep(900) }
export async function undo(p) {
  const b = p.locator('#undoBtn:visible').first()
  const dis = await b.isDisabled(), title = await b.getAttribute('title')
  if (dis) return { pressed: false, title }
  await b.click(); await sleep(900)
  return { pressed: true, title }
}
export async function redo(p) {
  const b = p.locator('#redoBtn:visible').first()
  const dis = await b.isDisabled(), title = await b.getAttribute('title')
  if (dis) return { pressed: false, title }
  await b.click(); await sleep(900)
  return { pressed: true, title }
}
export async function reload(p, who = 'a') { await L.settle(p); await p.reload(); await L.signIn(p, who, { goto: false }) }
