/* WALKER F — filing helpers through the app's own controls (the Inputs month's day window, "+ Input", the editor). */
import * as F from './cal-F-lib.mjs'
export * from './cal-F-lib.mjs'
const { sleep } = F

export const ids = (p, names) => Promise.all(names.map(n => F.pidOf(p, n)))
export const rowsNow = p => p.evaluate(() => window.INPUTS.map(r => ({ iid: r.iid, person: r.person, type: r.type, date: r.date, endDate: r.endDate || '', allday: !!r.allday, s: r.s, e: r.e, remarks: r.remarks || '', grp: r.grp || null, grpBy: r.grpBy || null, by: r.by ?? null, oil: r.oil ?? null, mod: r.mod ?? null, byAt: r.byAt ?? null, chAt: r.chAt ?? null, keys: Object.keys(r) })))
export const iidSet = p => p.evaluate(() => window.INPUTS.map(r => r.iid))
export async function newRows(p, had) { const now = await rowsNow(p); return now.filter(r => !had.includes(r.iid)) }

/** open the editor window for a NEW input from a date (month view): returns when the editor is up */
export async function openNew(p, iso, { phone = false } = {}) {
  if (!(await p.locator('#inpCal').count())) { await F.go(p, 'inputs') }
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7)
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) { const x = p.locator('[data-testid="win-inputsday-x"]'); if (phone) await x.tap(); else await x.click(); await sleep(300) }
  await F.month(p, y, m, phone ? (l => l.tap()) : null)
  const c = F.cell(p, iso)
  if (phone) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await p.waitForSelector('[data-testid="win-inputsday"]'); await sleep(300)
  if (phone) await p.locator('#icPopAdd').tap(); else await p.locator('#icPopAdd').click()
  await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(300)
}
export const press = (p, phone) => loc => phone ? loc.tap() : loc.click()
/** switch to Several people, and make the picked set exactly `want` (ids) */
export async function pickSeveral(p, want, { phone = false } = {}) {
  const P = loc => (phone ? loc.tap() : loc.click())
  const sw = p.locator('#inpEditPop [data-testid="pp-several"]')
  if ((await sw.getAttribute('aria-checked')) !== 'true') await P(sw)
  await sleep(200)
  const on = async () => p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => e.dataset.pp))
  for (const id of want) { if (!(await on()).includes(id)) { const b = p.locator(`#inpEditPop [data-pp="${id}"]`); await b.scrollIntoViewIfNeeded(); await P(b); await sleep(80) } }
  for (const id of await on()) if (!want.includes(id)) { const b = p.locator(`#inpEditPop [data-pp="${id}"]`); await b.scrollIntoViewIfNeeded(); await P(b); await sleep(80) }
  return on()
}
export async function setWhen(p, { allday = null, start = null, end = null, remarks = null } = {}) {
  if (allday != null && await p.locator('#inpEditAllday').count()) { const c = p.locator('#inpEditAllday'); if ((await c.isChecked()) !== allday) await c.click(); await sleep(100) }
  if (start != null) { await p.locator('#inpEditStart').fill(start); await p.locator('#inpEditStart').blur() }
  if (end != null) { await p.locator('#inpEditEnd').fill(end); await p.locator('#inpEditEnd').blur() }
  if (remarks != null) await p.locator('#inpEditRmk').fill(remarks)
}
/** click date cells in the editor's own range calendar (from, then to if different) */
export async function pickDates(p, from, to = null) {
  const cal = '#inpEdCal'
  const MONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const walk = async d => {
    for (let i = 0; i < 40 && !(await p.locator(`${cal} [data-cal="${d}"]`).count()); i++) {
      const [m, y] = (await p.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3).toLowerCase()) + 1).padStart(2, '0')}`
      await p.locator(`${cal} button[aria-label="${at < d.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click(); await sleep(80)
    }
    await p.locator(`${cal} [data-cal="${d}"]`).first().click(); await sleep(120)
  }
  const pre = await p.evaluate(() => { const e = document.querySelector('#inpEdCal .rc-d.s'); return e ? e.getAttribute('data-cal') : '' })
  if (pre !== from) await walk(from)
  if (to && to !== from) await walk(to)
}
/** what is on screen as the save's follow-up: the OIL question, a document ask, a refusal toast */
export async function followUps(p) {
  return p.evaluate(() => {
    const vis = e => e && e.offsetParent !== null
    const oil = document.querySelector('[data-testid="oilconf"]')
    const toasts = [...document.querySelectorAll('.toast, #toast, [role=status], [role=alert], .tst')].filter(vis).map(e => e.innerText.trim()).filter(Boolean)
    const dialogs = [...document.querySelectorAll('[role=dialog], .modal, .airpop')].filter(vis).map(e => e.dataset.testid || e.id || e.className).slice(0, 6)
    return { oil: vis(oil) ? oil.innerText.replace(/\s+/g, ' ').slice(0, 400) : null, toasts, dialogs }
  })
}
/** answer the OIL question if it is up: 'yes' | 'no'; then Save. Returns what it asked. */
export async function answerOil(p, ans, { phone = false } = {}) {
  const P = loc => (phone ? loc.tap() : loc.click())
  const conf = p.locator('[data-testid="oilconf"]')
  for (let i = 0; i < 12 && !(await conf.count()); i++) await sleep(150)
  if (!(await conf.count())) return null
  const asked = (await conf.innerText()).replace(/\s+/g, ' ')
  if (ans) { await P(p.locator(`[data-testid="oil-${ans}"]`)); await sleep(150) }
  await P(p.locator('[data-testid="oilconf-save"]')); await sleep(600)
  return asked
}
export async function toastText(p) {
  return p.evaluate(() => { const a = [...document.querySelectorAll('[class*=toast], #toast, [role=status]')].filter(e => e.offsetParent !== null).map(e => e.innerText.trim()).filter(Boolean); return a.join(' | ') })
}
/** capture toasts as they fly by (they vanish): install once per page */
export async function toastSpy(p) {
  await p.evaluate(() => {
    if (window.__f_ts) return
    window.__f_ts = []
    new MutationObserver(() => { const el = document.getElementById('toastEl'); if (!el) return; const t = (el.textContent || '').trim(); if (t && window.__f_ts[window.__f_ts.length - 1] !== t) window.__f_ts.push(t) }).observe(document.body, { childList: true, subtree: true, characterData: true })
  }).catch(() => {})
}
export const toasts = p => p.evaluate(() => { const a = window.__f_ts || []; window.__f_ts = []; return a }).catch(() => [])
