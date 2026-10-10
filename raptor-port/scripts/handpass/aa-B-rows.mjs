/* board row helpers for walker B */
import { sleep, tid, go, openBoard, oilOn, openCount, tabTo, winState, seatTap, closeWin } from './aa-B-lib.mjs'
import { put } from './lib.mjs'

/** the index N of the Ground Programme row of the input with this remark: slot g:<di>.N */
export async function groundIdx(page, rmk) {
  return page.evaluate(r => {
    const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r))
    if (!row) return null
    const s = row.querySelector('[data-slot^="g:"]')
    return s ? s.dataset.slot : null
  }, rmk)
}
/** how many pucks of this person the row's people cell holds */
export async function nPucks(page, slot, pid) {
  return page.evaluate(([sl, p]) => { const z = document.querySelector('#schedBoard [data-fill="' + sl + '.+"]'); return z ? z.querySelectorAll('.puck[data-person="' + p + '"]').length : -1 }, [slot, pid])
}
/** type a person under the row's "+ add" (extras) — ONE armed-seat pick from the crew palette, no retry (a retry would seat him twice) */
export async function putExtra(page, slot, pid) {
  const before = await nPucks(page, slot, pid)
  const z = page.locator(`#schedBoard [data-fill="${slot}.+"] .addz`).first()
  await z.scrollIntoViewIfNeeded(); const zb = await z.boundingBox(); await page.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await sleep(250)
  const armed = await page.evaluate(() => window.ARM && window.ARM.key)
  if (!armed) return 'FAILED not armed'
  const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  if (!(await p.count())) { await page.keyboard.press('Escape'); return 'FAILED not offered in the palette' }
  await p.scrollIntoViewIfNeeded(); await p.click(); await sleep(450)
  const after = await nPucks(page, slot, pid)
  return after > before ? pid : 'FAILED not seated (before ' + before + ', after ' + after + ')'
}
export async function putMain(page, slot, pid) {
  const has = await page.locator(`#schedBoard [data-slot="${slot}"]:visible`).count()
  if (has) return put(page, `[data-slot="${slot}"]`, [pid])
  return putExtra(page, slot, pid)
}
/** names on the row, read off its pucks */
export async function rowPucks(page, rmk) {
  return page.evaluate(r => {
    const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r))
    if (!row) return null
    return [...row.querySelectorAll('.puck')].map(p => (p.dataset.person || '') + ':' + (p.querySelector('.nm') || {}).textContent + ':' + (p.className.match(/oil\w+(-\w+)?/g) || []).join('+'))
  }, rmk)
}
export async function boardBtn(page, name) {
  const b = page.locator('#schedBoard').getByRole('button', { name }).first()
  await b.click(); await sleep(600)
}

/** the OIL switch of a man typed on a row — class (on/off/inert), title; read off the row's own seat */
export async function rowSeat(page, rmk, pid) {
  return page.evaluate(([r, p]) => {
    const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r))
    const s = row && row.querySelector(`.seat.oilpk[data-oilp="${p}"]`)
    return s ? { cls: ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?', title: s.title } : null
  }, [rmk, pid])
}
export async function tapRowSeat(page, rmk, pid) {
  await page.evaluate(r => { document.querySelectorAll('[data-aa-row]').forEach(e => e.removeAttribute('data-aa-row')); const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); if (row) row.setAttribute('data-aa-row', '1') }, rmk)
  const loc = page.locator(`[data-aa-row] .seat.oilpk[data-oilp="${pid}"]`).first()
  await loc.scrollIntoViewIfNeeded(); await loc.click(); await sleep(450)
}

/** add a Ground Programme row through "+ Item" and type its name, times and remark; returns its slot g:<di>.N */
export async function addGroundRow(page, di, name, s, e, rmk) {
  const before = await page.evaluate(d => [...document.querySelectorAll(`#schedBoard [data-bfld^="gr:${d}."][data-bfld$=".prog"]`)].map(x => x.dataset.bfld), di)
  await page.locator(`#schedBoard [data-gradd="${di}"]`).first().click(); await sleep(600)
  const after = await page.evaluate(d => [...document.querySelectorAll(`#schedBoard [data-bfld^="gr:${d}."][data-bfld$=".prog"]`)].map(x => x.dataset.bfld), di)
  const mine = after.find(x => !before.includes(x))
  if (!mine) throw new Error('no new row appeared')
  const base = mine.replace(/\.prog$/, '')
  const typeIn = async (suffix, v) => { const l = page.locator(`#schedBoard [data-bfld="${base}.${suffix}"]`).first(); await l.click(); await l.fill(v); await l.blur(); await sleep(350) }
  if (rmk != null) await typeIn('rmks', rmk)
  if (s != null) await typeIn('str', s)
  if (e != null) await typeIn('end', e)
  if (name != null) await typeIn('prog', name)
  return base.replace(/^gr:/, 'g:')
}
/** find the slot of a ground row by its remark text (works for an empty row too) */
export async function slotByRmk(page, rmk) {
  return page.evaluate(r => {
    const t = [...document.querySelectorAll('#schedBoard textarea[data-bfld^="gr:"][data-bfld$=".rmks"]')].find(x => x.value === r)
    return t ? t.dataset.bfld.replace(/^gr:/, 'g:').replace(/.rmks$/, '') : null
  }, rmk)
}

/** drag a puck of a row off its seat, onto an empty part of the page (the "off its seat = gone" gesture) — a real mouse drag */
export async function dragOff(page, rmk, pid, toX = 700, toY = 120) {
  await page.evaluate(r => { document.querySelectorAll('[data-aa-row]').forEach(e => e.removeAttribute('data-aa-row')); const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); if (row) row.setAttribute('data-aa-row', '1') }, rmk)
  const loc = page.locator(`[data-aa-row] .puck[data-person="${pid}"]`).first()
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  for (let i = 1; i <= 14; i++) { await page.mouse.move(b.x + b.width / 2 + (toX - b.x) * i / 14, b.y + b.height / 2 + (toY - b.y) * i / 14); await sleep(25) }
  await page.mouse.up(); await sleep(700)
}
