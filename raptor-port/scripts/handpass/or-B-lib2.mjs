// Walker B: surfaces and navigation (all READ-ONLY except the navigation presses)
import { csId, MONTHS } from './or-B-lib.mjs'
export * from './or-B-lib.mjs'

export async function toWeek(p) {
  if (await p.evaluate(() => window.SBDAY != null) && await p.locator('#sbDone:visible').count()) { await p.locator('#sbDone:visible').first().click(); await p.waitForTimeout(400) }
  await p.evaluate(() => window.go('editsched'))
  await p.locator('#eWeek .day').first().waitFor()
  await p.waitForTimeout(400)
}
export async function openBoard(p, di) {
  const cur = await p.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) { await p.locator('#sbDone').click(); await p.waitForTimeout(400) }
  await p.evaluate(() => window.go('editsched'))
  await p.locator('#eWeek .day').first().waitFor()
  await p.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await p.waitForSelector('#schedBoard'); await p.waitForTimeout(500)
}
export async function oilOn(p, on = true) {
  const isOn = await p.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]'))
  if (isOn !== on) { await p.locator('#sbOil').click(); await p.waitForTimeout(700) }
}
/* scroll a roster's own list (never the page) so one puck shows */
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
const nameOf = `(e) => { const pp = e.getAttribute('data-person'); const nm = (e.querySelector('.nm') || e).textContent.trim().replace(/\\s+/g, ' '); return (window.PEOPLE[pp] ? window.PEOPLE[pp].cs : nm) + (e.classList.contains('warn') ? '(warn-ring)' : '') }`
export const weekRowNames = (p, di, ri) => p.evaluate(([di, ri, nameOfSrc]) => {
  const nameOf = eval(nameOfSrc)
  const t = document.querySelector(`#eWeek .day:not(.peek) [data-txt="gr:${di}.${ri}.prog"]`); if (!t) return null
  const row = t.closest('.pl-row')
  return { names: [...row.querySelectorAll('.puck')].map(nameOf), title: t.textContent.trim(), s: (row.querySelector(`[data-txt="gr:${di}.${ri}.str"]`) || {}).textContent, e: (row.querySelector(`[data-txt="gr:${di}.${ri}.end"]`) || {}).textContent, rmk: (row.querySelector(`[data-txt="gr:${di}.${ri}.rmks"]`) || {}).textContent, cls: row.className, late: !!row.querySelector('.latetag') }
}, [di, ri, nameOf])
export const boardRowNames = (p, di, ri) => p.evaluate(([di, ri, nameOfSrc]) => {
  const nameOf = eval(nameOfSrc)
  const t = [...document.querySelectorAll(`#schedBoard [data-bfld="gr:${di}.${ri}.prog"]`)].find(e => e.offsetParent); if (!t) return null
  const row = t.closest('.sb-arow')
  return { names: [...row.querySelectorAll('.puck')].map(nameOf), title: t.value, s: (row.querySelector(`[data-bfld="gr:${di}.${ri}.str"]`) || {}).value, e: (row.querySelector(`[data-bfld="gr:${di}.${ri}.end"]`) || {}).value, rmk: (row.querySelector(`[data-bfld="gr:${di}.${ri}.rmks"]`) || {}).value, cls: row.className }
}, [di, ri, nameOf])
export async function weekLines(p, di) {
  const fold = p.locator(`#eWeek .day:not(.peek) .sec-inp .pl-fold[data-pitog="${di}"]`).first()
  if (await fold.count() && !(await p.locator('#eWeek .day:not(.peek) .sec-inp .pl-row').count())) { await fold.scrollIntoViewIfNeeded(); await fold.click(); await p.waitForTimeout(300) }
  return p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek) .sec-inp .pl-row')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' {' + [...e.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()).join(',') + '}'))
}
export async function boardLines(p, di) {
  const bf = p.locator(`#schedBoard .pinp .pl-fold[data-pitog="${di}"]`).first()
  if (await bf.count() && !(await p.locator('#schedBoard .pinp .sb-arow').count())) { await bf.click(); await p.waitForTimeout(300) }
  return p.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' {' + [...e.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()).join(',') + '}'))
}
export async function inputsSurf(p, iid, iso) {
  await p.evaluate(() => window.go('inputs'))
  await p.locator('#inpCal, #inListBtn').first().waitFor()
  const out = {}
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') { await p.locator('#inCalBtn').click(); await p.waitForTimeout(300) }
  const at = async () => { const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  const [yy, mm] = iso.split('-').map(Number)
  let d = yy * 12 + (mm - 1) - await at()
  for (; d > 0; d--) await p.locator('#icNext').click()
  for (; d < 0; d++) await p.locator('#icPrev').click()
  await p.waitForSelector(`[data-icday="${iso}"]`)
  out.bar = await p.evaluate(iid => [...document.querySelectorAll(`.ib-bar[data-iid="${iid}"]`)].map(e => e.textContent.trim() + ' | ' + (e.getAttribute('title') || '').replace(/\s+/g, ' ')), iid)
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
  out.card = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`); return c ? c.innerText.replace(/\s+/g, ' ').trim() : '(no card)' }, iid)
  return out
}
export async function closeDayWin(p) { const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await p.waitForTimeout(250) } }
export async function listRow(p, iid) {
  await closeDayWin(p)
  await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
  if (await p.locator('#inRangeAll').count() === 0) await p.locator('#inRangeBtn').click()
  await p.locator('#inRangeAll').click(); await p.waitForTimeout(400)
  const t = await p.evaluate(iid => [...document.querySelectorAll(`[data-iid="${iid}"]`)].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim()), iid)
  await p.locator('#inCalBtn').click(); await p.waitForTimeout(300)
  return t
}
export const oilPeople = (p, iid) => p.evaluate(iid => { const o = {}; for (const e of document.querySelectorAll(`#schedBoard [data-oilp][data-oilitem="i:${iid}"]`)) { if (!e.offsetParent) continue; const k = (window.PEOPLE[e.getAttribute('data-oilp')] || {}).cs || e.getAttribute('data-oilp'); o[k] = e.classList.contains('on') ? 'on' : 'off' } return o }, iid)
export const oilBannerText = p => p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard *')].find(e => e.offsetParent && /OIL EARN/i.test(e.textContent) && e.children.length > 0 && e.textContent.length < 300 && !/Calendar/.test(e.textContent)); return e ? e.innerText.replace(/\s+/g, ' ') : null })
/* one call: everything the schedule side shows of one input row (board must be open for the board part) */
export async function schedSurf(p, di, iid, ri) {
  const o = {}
  const onBoard = await p.evaluate(() => !!document.querySelector('#schedBoard'))
  if (onBoard) { o.board = await boardRowNames(p, di, ri); o.boardLines = await boardLines(p, di) }
  else { o.week = await weekRowNames(p, di, ri); o.weekLines = await weekLines(p, di) }
  return o
}

/* drag without scrolling the page: both ends must already be in view */
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
/* centre a board/week element in the viewport (page scroll) */
export const centre = (loc) => loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
/* the board row of an input: its first puck locator (visible) */
export const boardRowEl = (p, di, ri) => p.locator(`#schedBoard [data-bfld="gr:${di}.${ri}.prog"]:visible`).first().locator('xpath=ancestor::div[contains(@class,"sb-arow")][1]')
export const weekRowEl = (p, di, ri) => p.locator(`#eWeek .day:not(.peek) [data-txt="gr:${di}.${ri}.prog"]`).first().locator('xpath=ancestor::div[contains(@class,"pl-row")][1]')
/* open an input's own window from the opened day's card and read it; closes it again */
export async function windowRead(p, iid) {
  const card = p.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  await card.click(); await p.waitForSelector('#inpEditPop', { timeout: 5000 }); await p.waitForTimeout(400)
  const o = await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); const sel = w.querySelector('#inpEditPerson'); return { person: sel ? [...sel.options].filter(o => o.selected).map(o => o.textContent.trim()) : null, head: (w.querySelector('.airpop-head, .win-bar') || {}).innerText, text: w.innerText.replace(/\s+/g, ' ').replace(/PERSON ALL AVAIL.*?Zulu/, 'PERSON <list>').slice(0, 500), pressed: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => (window.PEOPLE[b.getAttribute('data-pp')] || {}).cs || b.getAttribute('data-pp')), ph: [...w.querySelectorAll('[data-ph][aria-pressed="true"]')].map(b => b.getAttribute('data-ph')) } })
  return o
}
export async function closeWindow(p) { const x = p.locator('#inpEditCancel, #inpEditClose').first(); if (await x.count()) { await x.click({ force: true }).catch(() => {}); await p.waitForTimeout(300) } }

/* a real drag with the mouse wheel rolled mid-drag until the target is in view. to: locator or {x,y} */
export async function drag3(p, fromLoc, to, { steps = 14, wait = 150, lo = 150, hi = 780 } = {}) {
  await fromLoc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await p.waitForTimeout(250)
  const fb = await fromLoc.boundingBox()
  if (!fb) throw new Error('drag3: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  const target = async () => { if (to.x != null) return { x: to.x, y: to.y }; const tb = await to.boundingBox(); if (!tb) throw new Error('drag3: no box for target'); return { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  for (let k = 0; k < 40; k++) {
    const t = await target()
    if (t.y > lo && t.y < hi) break
    await p.mouse.wheel(0, t.y < lo ? -300 : 300); await p.waitForTimeout(160)
    await p.mouse.move(fx + 8 + (k % 2), fy + 8)
  }
  const t = await target()
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(700)
}
