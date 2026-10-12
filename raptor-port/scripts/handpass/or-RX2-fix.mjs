// RX2 — fixture helpers: the "unanswered" input of ONE and of TWO, made by real drags (the brief's route).
import { toBoard, toWeek, csId, shot, toast, toastMark, toastsSince, inputsOf, sleep, fileInput } from './or-RX2-lib.mjs'
import { drag2, rosterPuckOf, rowIdx, boardRowEl, centre as centreEl } from './or-B-lib2.mjs'

export const oilSheet = async p => {
  const s = p.locator('[data-testid="oilconf"]')
  if (!(await s.count())) return null
  return (await s.innerText()).replace(/\s+/g, ' ').slice(0, 400)
}
/* press Cancel/close on the OIL question */
export async function cancelOil(p) {
  const s = p.locator('[data-testid="oilconf"]')
  if (!(await s.count())) return false
  const c = s.locator('button.x[aria-label="Close"], #oilConfirmClose, [data-testid="oil-close"], [data-testid="oilconf-cancel"], [data-testid="oilconf-close"]').first()
  if (await c.count()) await c.click(); else await p.keyboard.press('Escape')
  await p.waitForTimeout(500)
  return true
}
/* answer the open question */
export async function answerYes(p) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator('[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
  await ((await one.count()) ? one : many).first().click()
  await sheet.locator('[data-testid="oilconf-save"]').click()
  await p.waitForTimeout(500)
}
export const brief = (p, iid) => p.evaluate(iid => {
  const r = window.INPUTS.find(x => x.iid === iid); if (!r) return null
  const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'))
  return { type: r.type, title: r.title || '', date: r.date, t: f(r.s) + '-' + f(r.e), people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs || e.p) + (e.oil != null ? `(oil=${e.oil})` : '')), person: window.PEOPLE[r.person]?.cs, by: r.by, oil: r.oil ?? null, nIn: window.INPUTS.length }
}, iid)

/* Sat 18 Jul Training 09:00-12:00 for Ranger alone as Saber (Yes); board: Tally dropped ONTO Ranger's puck, question Cancelled.
   If `two`, then Ranger dragged onto the row's "+ add" and Cancelled again. Returns {iid, log}. */
export async function makeUnanswered(p, { two = true, title = 'OIL ask', timed = ['09:00', '12:00'], joins = null, rmk = null } = {}) {
  const log = {}
  const made = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed, title, ...(rmk != null ? { rmk } : {}), oil: 'yes' })
  const iid = made[0]?.iid; log.filed = made
  await toBoard(p, 5)
  const ri = await rowIdx(p, 5, iid)
  let row = boardRowEl(p, 5, ri); await centreEl(row); await sleep(300)
  let m = await toastMark(p)
  await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.puck').first())
  await sleep(500)
  log.q1 = await oilSheet(p); log.q1toast = await toastsSince(p, m)
  await shot(p, 'fix-q1-' + title.replace(/\W+/g, '') + '-' + timed[0].slice(0, 2) + '-tally-replaces')
  log.cancel1 = await cancelOil(p)
  log.after1 = await brief(p, iid)
  for (const who of (joins || (two ? ['Ranger'] : []))) {
    row = boardRowEl(p, 5, ri); await centreEl(row); await sleep(300)
    m = await toastMark(p)
    await drag2(p, await rosterPuckOf(p, '#sbRoster', who), row.locator('.addz').first())
    await sleep(500);
    (log.joins ||= []).push({ who, q: await oilSheet(p), toast: await toastsSince(p, m) })
    await shot(p, 'fix-q2-' + title.replace(/\W+/g, '') + '-' + timed[0].slice(0, 2) + '-' + who + '-joins')
    await cancelOil(p)
    log.after2 = await brief(p, iid)
  }
  return { iid, log }
}

/* ---- shared by the later scripts ---- */
import { become, bellRead, toMonth as _toMonth, openDay as _openDay, closeDay as _closeDay, dayCardText as _dayCardText, press as _press } from './or-RX2-lib.mjs'
/* declare one public holiday through the Inputs gear > Calendar… > Holidays > + Add (real clicks) — copied from or-A-hol.mjs */
export async function declareHoliday(page, iso, name = 'Test holiday') {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inGear').click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="iset-days"]').click(); await page.waitForTimeout(600)
  await page.locator('[data-testid="days-tab-holidays"]').click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="hol-add"]').click(); await page.waitForTimeout(500)
  await page.locator('[data-testid="hol-kind-ph"]').click()
  await page.locator('[data-testid="hol-name"]').fill(name)
  for (let i = 0; i < 24 && !(await page.locator(`[data-testid="holcal-day-${iso}"]`).count()); i++) await page.locator('[data-testid="holcal-next-month"]').click()
  await page.locator(`[data-testid="holcal-day-${iso}"]`).click(); await page.waitForTimeout(200)
  let r = await page.locator('[data-testid="hol-dates"]').evaluate(e => [e.getAttribute('data-from'), e.getAttribute('data-to')])
  if (!r[1]) { await page.locator(`[data-testid="holcal-day-${iso}"]`).click(); await page.waitForTimeout(200); r = await page.locator('[data-testid="hol-dates"]').evaluate(e => [e.getAttribute('data-from'), e.getAttribute('data-to')]) }
  await page.locator('[data-testid="hol-save"]').click(); await page.waitForTimeout(700)
  const said = await page.evaluate(() => ({ saved: (document.querySelector('[data-testid="hol-saved"]') || {}).textContent || null, err: (document.querySelector('[data-testid="hol-err"]') || {}).textContent || null, winOpen: !!document.querySelector('[data-testid="win-holiday"]') }))
  if (said.winOpen) await page.locator('[data-testid="hol-cancel"], [data-testid="win-holiday-x"]').first().click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('[data-testid="win-days-x"]').click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('[data-testid="win-inputsset-x"]').click().catch(() => {})
  await page.waitForTimeout(300)
  return { range: r, ...said }
}
/* what Inputs surfaces say about the "OIL?" sign for one input as the person now signed in: opened day card (tag) and desktop List row (button) */
export async function oilSigns(p, iid, iso) {
  const o = {}
  await _toMonth(p, iso); await _openDay(p, iso)
  o.dayCard = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? { tag: /OIL\?/.test(c.innerText), text: c.innerText.replace(/\s+/g, ' ') } : 'NO CARD' }, iid)
  await _closeDay(p)
  await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
  if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').click()
  await p.locator('#inRangeAll').click(); await p.waitForTimeout(500)
  o.listRow = await p.evaluate(iid => { const tr = document.querySelector(`tr[data-iid="${iid}"]`); if (!tr) return 'NO ROW'; return { text: tr.innerText.replace(/\s+/g, ' '), buttons: [...tr.querySelectorAll('td.inact button')].map(b => b.textContent.trim()) } }, iid)
  await p.locator('#inCalBtn').click().catch(() => {}); await p.waitForTimeout(300)
  return o
}
