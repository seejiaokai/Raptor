/* [BLANK-TIMES-ABSENCE] walk, WALKER C — shared helpers. Everything a step DOES goes through the app's own controls. */
import './bta-env.mjs'
import * as C from './rbl-C-lib.mjs'
export * from './rbl-C-lib.mjs'
const { B, K, W, ID, CSN, SEAT, MON, TUE, pic, sleep } = C
export const WED = 2
export const COBRA = 'taipan'

/* Monday flight 21:00–22:30 with X seated (he lands 22:30 → clear 12:30 Tuesday) */
export async function mondayLate(p, { to = '21:00', ld = '22:30' } = {}) {
  const m = await K.addFlyWave(p, MON)
  await K.ff(p, MON, m.gi, 0, 'cs', 'ZM'); await K.ff(p, MON, m.gi, 0, 'msn', 'BFM')
  await K.ff(p, MON, m.gi, 0, 'to', to); await K.ff(p, MON, m.gi, 0, 'ld', ld)
  const s = await K.seat(p, MON, m.gi, 0, 0, SEAT, ID)
  return { gi: m.gi, took: s.took }
}
/* Tuesday SC wave: shift start/end/B typed (null = leave as the wave comes up), Cobra in the first MAIN row's front seat */
export async function scTuesday(p, { to = '13:00', ld = '19:00', br = '05:00', cobra = true, di = TUE } = {}) {
  const sc = await K.addStandby(p, di, 'sc')
  if (to !== null) await K.ff(p, di, sc.gi, 0, 'to', to)
  if (ld !== null) await K.ff(p, di, sc.gi, 0, 'ld', ld)
  if (br !== null) await K.ff(p, di, sc.gi, 0, 'br', br)
  let sib = null
  if (cobra) sib = await K.seat(p, di, sc.gi, 0, 0, 'p', COBRA)
  return { gi: sc.gi, label: sc.label, sib: sib && sib.took }
}
export const shiftNow = (p, di, gi) => p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g].formations[0]; return `B "${x.br || ''}" start "${x.to}" end "${x.ld}" · rows ${x.aircraft.map(a => (a.spare ? 'SPARE' : 'MAIN') + ':' + (a.p || '-') + '/' + (a.w || '-')).join(' ')}` }, [di, gi])
export const key = (di, gi, fi, ai, seat = SEAT) => `${di}.${gi}.${fi}.${ai}.${seat}`

/* arm a seat and read what the crew list says about X, as painted; the seat stays armed */
export async function readArmed(p, k, tag) {
  const di = Number(k.split('.')[0])
  await K.boardTo(p, di)
  const armed = await C.armSeat(p, k)
  const r = await C.rosterX(p); const row = await C.crewListRow(p)
  await p.evaluate(who => { const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${who}"]`)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center' }) }, ID); await sleep(250)
  const shot = tag ? await pic(p, tag) : null
  return { armed, r, row, shot, said: `${C.sayRoster(r)}${row ? ' · row "' + row.slice(0, 160) + '"' : ''}` }
}
export async function disarm(p) { await p.keyboard.press('Escape'); await sleep(200) }
export const reasonOf = a => (a.r.own + ' ' + a.r.title + ' ' + (a.row || '')).replace(/\s+/g, ' ')

/* a real pointer drag of X's name from the crew list to a seat; reads the bubble under the ghost mid-flight, then drops (or not) */
export async function dragFromList(p, dstKey, tag, { id = ID, drop = true } = {}) {
  const di = Number(dstKey.split('.')[0])
  await K.boardTo(p, di)
  const dst = p.locator(`#schedBoard [data-slot="${dstKey}"]:visible, #schedBoard [data-fill="${dstKey}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const src = p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible .puck, #sbRoster .rpuck[data-person="${id}"]:visible`).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await sleep(200)
  const a = await src.boundingBox(); const b = await dst.boundingBox()
  if (!a || !b) return { err: `no box src ${!!a} dst ${!!b}` }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 16 })
  await sleep(500)
  const bubble = await p.evaluate(() => { const g = document.querySelector('.dragimg, .tdghost'); const w = g && g.querySelector('.dwhy'); return { ghost: !!g, why: w ? w.textContent.trim() : null, over: document.querySelectorAll('.dragover-why').length } })
  const shot = await pic(p, tag)
  if (drop) { await p.mouse.up(); await sleep(700) } else { await p.mouse.move(5, 5, { steps: 4 }); await p.mouse.up(); await sleep(400) }
  const toast = await C.toastNow(p)
  return { bubble, shot, toast }
}
/* a seat-to-seat drag (a puck on a seat carried to another seat) on the open board; reads the bubble mid-flight */
export async function dragSeat(p, srcKey, dstKey, tag, { drop = true, id = ID, root = '#schedBoard' } = {}) {
  const di = Number(dstKey.split('.')[0])
  if (root === '#schedBoard') await K.boardTo(p, di)
  const dst = p.locator(`${root} [data-slot="${dstKey}"]:visible, ${root} [data-fill="${dstKey}"]:visible`).first()
  const src = p.locator(`${root} [data-slot="${srcKey}"]:visible .puck[data-person="${id}"], ${root} [data-fill="${srcKey}"]:visible .puck[data-person="${id}"]`).first()
  if (!(await src.count())) return { err: 'no source puck on ' + srcKey }
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
  await src.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); await sleep(200)
  const vp = p.viewportSize()
  const inV = r => r && r.x >= 0 && r.y >= 0 && r.x + r.width <= vp.width && r.y + r.height <= vp.height
  const a = await src.boundingBox(); const b = await dst.boundingBox()
  if (!inV(a) || !inV(b)) return { err: `source or target not both on screen (src ${JSON.stringify(a)} dst ${JSON.stringify(b)})`, shot: await pic(p, tag + '-offscreen') }
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 16 })
  await sleep(500)
  const bubble = await p.evaluate(() => { const g = document.querySelector('.dragimg, .tdghost'); const w = g && g.querySelector('.dwhy'); return { ghost: !!g, why: w ? w.textContent.trim() : null } })
  const shot = await pic(p, tag)
  if (drop) { await p.mouse.up(); await sleep(700) } else { await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2, { steps: 10 }); await sleep(200); await p.mouse.up(); await sleep(500) }
  const toast = await C.toastNow(p)
  return { bubble, shot, toast }
}
export const holds = (p, k) => p.evaluate(kk => { const a = kk.split('.'); const ac = window.DAYS[+a[0]].waves[+a[1]].formations[+a[2]].aircraft[+a[3]]; return ac ? ac[a[4]] || '' : '(no such row)' }, k)
export const restWarns = async (p, di, id = ID) => (await C.fullWarnsX(p, di, id)).filter(w => /REST|TURN/i.test(w.code) || /rest/i.test(w.msg))
export const shortWarns = ws => JSON.stringify(ws.map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg.slice(0, 200)}`))
