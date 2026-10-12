// RX4 fixture helpers (copied from or-RX2-fix / or-B-lib2 so nothing is written into another walker's folder).
import * as L from './or-RX4-lib.mjs'
const { toBoard, csId, shot, toast, toastMark, toastsSince, fileInput, rowIdx } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function rosterShow(p, rosterSel, id) {
  return p.evaluate(([rs, id]) => {
    const el = document.querySelector(`${rs} .rpuck[data-person="${id}"]`); if (!el) return false
    let a = el.parentElement
    while (a && a !== document.body) { const o = getComputedStyle(a).overflowY; if ((o === 'auto' || o === 'scroll') && a.scrollHeight > a.clientHeight) break; a = a.parentElement }
    if (a && a !== document.body) { const r = el.getBoundingClientRect(), ar = a.getBoundingClientRect(); a.scrollTop += (r.top - ar.top) - ar.height / 2 }
    return true
  }, [rosterSel, id])
}
export async function rosterPuckOf(p, rosterSel, who) {
  const id = who === 'ALL AVAIL' ? 'allavail' : who === 'ALL' ? 'all' : await csId(p, who)
  await rosterShow(p, rosterSel, id); await p.waitForTimeout(150)
  return p.locator(`${rosterSel} .rpuck[data-person="${id}"]:visible`).first()
}
export async function drag2(p, fromLoc, to, { steps = 16, wait = 150 } = {}) {
  const fb = await fromLoc.boundingBox()
  if (!fb) throw new Error('drag2: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  let t
  if (to.x != null) t = { x: to.x, y: to.y }
  else { const tb = await to.boundingBox(); if (!tb) throw new Error('drag2: no box for target'); t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(700)
}
export const centreEl = loc => loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
export const boardRowEl = (p, di, ri) => p.locator(`#schedBoard [data-bfld="gr:${di}.${ri}.prog"]:visible`).first().locator('xpath=ancestor::div[contains(@class,"sb-arow")][1]')
export const oilSheet = async p => { const s = p.locator('[data-testid="oilconf"]'); if (!(await s.count())) return null; return (await s.innerText()).replace(/\s+/g, ' ').slice(0, 400) }
export async function cancelOil(p) {
  const s = p.locator('[data-testid="oilconf"]')
  if (!(await s.count())) return false
  const c = s.locator('button.x[aria-label="Close"], #oilConfirmClose, [data-testid="oil-close"], [data-testid="oilconf-cancel"], [data-testid="oilconf-close"]').first()
  if (await c.count()) await c.click(); else await p.keyboard.press('Escape')
  await p.waitForTimeout(500)
  return true
}
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
  return { type: r.type, title: r.title || '', date: r.date, t: f(r.s) + '-' + f(r.e), people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs || e.p) + (e.oil != null ? `(oil=${JSON.stringify(e.oil)})` : '')), by: window.PEOPLE[r.by]?.cs || r.by, oil: r.oil ?? null, cx: r.cx || null, cxr: r.cxr || null }
}, iid)
/* Sat 18 Jul Training 09:00-12:00 for Ranger alone as Saber (Yes); board: Tally dropped ONTO Ranger's puck, question Cancelled; then Ranger dragged onto "+ add", Cancelled again. */
export async function makeUnanswered(p, { two = true, title = 'OIL ask', timed = ['09:00', '12:00'] } = {}) {
  const log = {}
  const made = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed, title, oil: 'yes' })
  const iid = made[0]?.iid; log.filed = made
  await toBoard(p, 5)
  const ri = await rowIdx(p, 5, iid)
  let row = boardRowEl(p, 5, ri); await centreEl(row); await sleep(300)
  let m = await toastMark(p)
  await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.puck').first())
  await sleep(500)
  log.q1 = await oilSheet(p); log.q1toast = await toastsSince(p, m)
  log.cancel1 = await cancelOil(p)
  log.after1 = await brief(p, iid)
  if (two) {
    row = boardRowEl(p, 5, ri); await centreEl(row); await sleep(300)
    m = await toastMark(p)
    await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Ranger'), row.locator('.addz').first())
    await sleep(500)
    log.q2 = await oilSheet(p); log.q2toast = await toastsSince(p, m)
    await cancelOil(p)
    log.after2 = await brief(p, iid)
  }
  return { iid, log, ri }
}
