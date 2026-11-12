/* W2 fixtures shared by the scenario scripts */
import { L, sleep, press, setF, addWave, addGround, warnList, ring, shot, openWarnFold } from './rcf-w2-lib.mjs'

export const DI = 5   // Saturday (a weekend, no conflicts of its own)

/* a flying line on a new wave: cs, msn, to, ld; man in the front seat */
export async function sortie(page, { cs = 'VL', msn = 'BFM', to = '1200', ld = '1300', who = null, wave = null } = {}) {
  const gi = wave ?? (await addWave(page, DI, ''))
  if (gi < 0) throw new Error('no wave made')
  await setF(page, `ff:${DI}.${gi}.0.cs`, cs)
  await setF(page, `ff:${DI}.${gi}.0.msn`, msn)
  if (to) await setF(page, `ff:${DI}.${gi}.0.to`, to)
  if (ld) await setF(page, `ff:${DI}.${gi}.0.ld`, ld)
  let r = null
  if (who) r = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [who])
  return { gi, put: r }
}
/* a ground row: prog, str, end, man */
export async function ground(page, { prog = 'BRIEFING', str = '1200', end = '1230', who = null } = {}) {
  const ri = await addGround(page, DI)
  if (ri < 0) throw new Error('no ground row made')
  await setF(page, `gr:${DI}.${ri}.prog`, prog)
  if (str) await setF(page, `gr:${DI}.${ri}.str`, str)
  if (end) await setF(page, `gr:${DI}.${ri}.end`, end)
  let r = null
  if (who) r = await L.put(page, `[data-fill="g:${DI}.${ri}.+"]`, [who])
  return { ri, put: r }
}
export const toastText = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').replace(/\s+/g, ' ').trim() + (t.classList.contains('show') || t.classList.contains('on') ? ' [shown]' : ' [' + t.className + ']') : '(no toast element)' })
/* replace the man in an already-filled seat: arm the seat, press a roster puck, read the toast at once */
export async function swapIn(page, armSel, id, { wait = 60 } = {}) {
  await L.tap(page, armSel); await sleep(220)
  const armed = await page.evaluate(() => !!(window.ARM && window.ARM.key))
  const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
  await p.click()
  await sleep(wait)
  const toast = await toastText(page)
  await sleep(400)
  return { armed, toast }
}
/* everything a person reads, on the board's list and on the (covered) week behind it */
export async function readAll(page, id, label) {
  const board = await warnList(page)
  const bRing = await ring(page, id, '#schedBoard')
  const wRing = await ring(page, id, '#eWeek .day[data-day="' + DI + '"]')
  const wCount = await page.evaluate(d => { const e = document.querySelector(`#eWeek .day[data-day="${d}"] .daywarn`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(none)' }, DI)
  const o = {
    label, head: board.head,
    lines: board.lines.map(l => `${l.ix}:${l.hid ? 'HID' : 'live'}${l.struck ? '+struck' : ''}:${l.btn}: ${l.text}` + (process.env.SEV ? ' {' + l.cls + '}' : '')),
    boardRings: bRing.map(r => `${r.where}${ringWord(r)}`),
    weekRings: wRing.map(r => `${r.where}${ringWord(r)}`), weekCount: wCount,
  }
  console.log('READ', JSON.stringify(o))
  return o
}
const ringWord = r => { const c = r.cls.split(' '); return c.includes('hard') ? ' RED' : c.includes('note') ? ' note' : r.warn ? ' AMBER' : ' plain' }
export const clashLine = (o, re = /clash/i) => o.lines.find(l => re.test(l) && !/not published/.test(l))

/* a real mouse drag from one box to a point/box; reads the toast ~60ms after the drop */
export async function dragBox(page, from, to, { wait = 60 } = {}) {
  const a = await from.boundingBox(); if (!a) throw new Error('drag: no source box')
  const b = typeof to.x === 'number' ? to : await to.boundingBox()
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2, bx = b.x + (b.width || 0) / 2, by = b.y + (b.height || 0) / 2
  await page.mouse.move(ax, ay); await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(ax + (bx - ax) * i / 12, ay + (by - ay) * i / 12); await sleep(25) }
  await sleep(150); await page.mouse.up(); await sleep(wait)
  const t1 = await toastText(page)
  await sleep(450)
  return t1
}
/* take the man off a seat by dragging his puck into empty space (letting go removes him) */
export async function unseat(page, seatSel) {
  const gp = page.locator(`#schedBoard ${seatSel} .puck:visible`).first()
  const nb = await page.locator('#schedBoard .sb-warn').first().boundingBox()
  return dragBox(page, gp, { x: nb.x + 40, y: nb.y + nb.height + 6 })
}
/* arm an EMPTY seat and press the man in the crew list; the toast read ~wait ms after the press */
export async function seatIn(page, armSel, id, { wait = 60 } = {}) {
  await L.tap(page, armSel); await sleep(220)
  const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
  await p.click(); await sleep(wait)
  const t1 = await toastText(page)
  await sleep(400)
  return t1
}

/* unseat, verified: tries a main-area drop, then the side panel's foot; returns { ok, toast } */
export async function unseat2(page, seatSel) {
  const has = () => page.locator(`#schedBoard ${seatSel} .puck:visible`).count()
  if (!(await has())) return { ok: true, toast: '(already empty)' }
  const gp = page.locator(`#schedBoard ${seatSel} .puck:visible`).first()
  await gp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const a = await gp.boundingBox()
  let toast = ''
  toast = await unseat(page, seatSel)
  if (!(await has())) return { ok: true, toast }
  for (const [dx, dy] of [[60, 110], [-30, 110], [200, -60]]) {
    const gp2 = page.locator(`#schedBoard ${seatSel} .puck:visible`).first()
    const a2 = await gp2.boundingBox()
    toast = await dragBox(page, gp2, { x: a2.x + a2.width / 2 + dx, y: a2.y + a2.height / 2 + dy })
    if (!(await has())) return { ok: true, toast }
  }
  return { ok: !(await has()), toast }
}
