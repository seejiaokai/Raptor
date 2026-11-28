// swd-w14a-lib — walker w14a's helpers ("what counts as planned": C1–C11 — D2564, D2565, D2568, D2560), chat 174,
// the night of 24–25 Nov 26. Built on the passing recipes swd-w11-lib / swd-w12-lib (the bell reader, the words, the posting,
// the sim box), asp-w2-lib (board, arm-and-pick, ground and programme rows), sud-w5-lib (+ Wave, crew lists). Copied, never
// edited. window.* is only READ here (and window.go, the recipes' own page switch). Every staging step is the app's own controls.
import './swd-w14a-env.mjs'
import path from 'node:path'
const Z = await import('./swd-w12-lib.mjs')
export const { K, X, T, L, RANGER, HEX, CASPER, D, ISO, DI, WK1, WK2, WORDS, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, post, file, tick, filings, scene, sleep, plan, planSim, remDays, remSay } = Z
export const W5 = T.W5
export const J = L.J
export const wkOf = d => (+d >= 20 ? WK2 : WK1)

/* the board's day open, the + Wave menu's choices read (the names on its buttons) */
export async function waveMenu(p, W, di) {
  await L.openBoard(p, W, di)
  await W.press(p, L.B(`[data-wvadd="${di}"]`), 'wvadd'); await sleep(400)
  return p.evaluate(() => [...document.querySelectorAll('button, [role="menuitem"]')].filter(e => e.getBoundingClientRect().width > 0 && /wave|^SC|AVALON|^BB/i.test((e.textContent || '').trim()) && (e.textContent || '').trim().length < 30).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()))
}
/* + Wave → <kind> on the open board ('Flying wave' default); times typed only when given; returns the new wave's index and
   its first formation's aircraft count */
export async function addLine(p, W, di, o = {}) {
  await L.openBoard(p, W, di)
  const n0 = await p.evaluate(i => window.DAYS[i].waves.length, di)
  await W.press(p, L.B(`[data-wvadd="${di}"]`), 'wvadd'); await sleep(300)
  await W.press(p, p.getByRole('button', { name: o.kind || 'Flying wave', exact: true }).first(), 'wave-kind'); await sleep(700)
  const wi = await p.evaluate(i => window.DAYS[i].waves.length - 1, di)
  if (wi !== n0) return { wi: -1, n0 }
  if (o.cs) await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.cs"]`, o.cs).catch(() => {})
  if (o.to) await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.to"]`, o.to)
  if (o.ld) await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.ld"]`, o.ld)
  const f = await p.evaluate(([i, w]) => { const wv = window.DAYS[i].waves[w]; const x = wv.formations[0]; return { label: wv.label, kind: wv.kind || '', standalone: !!wv.standalone, cs: x.cs, to: x.to, ld: x.ld, n: x.aircraft.length } }, [di, wi])
  return { wi, f }
}
/* type a line's times later (C7) */
export async function lineTimes(p, W, di, wi, to, ld) {
  await L.openBoard(p, W, di)
  await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  await L.typeBox(p, W, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  return p.evaluate(([i, w]) => { const x = window.DAYS[i].waves[w].formations[0]; return { to: x.to, ld: x.ld } }, [di, wi])
}
/* arm a seat (its own empty box) on the open board, read Ranger's crew-list puck while armed; then pick him (or not) */
export async function armSeat(p, W, key, tag, pick = true, id = RANGER) {
  const z = p.locator(L.B(`[data-slot="${key}"]`)).first()
  if (!(await z.count())) return { armed: null, c: null, pic: await W.pic(p, tag + '-noseat') }
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  if (W.isPhone) { await z.tap(); await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) } else await z.click()
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await W5.boardDrawer(p, W, true)
  const c = await W5.crewOf(p, '#schedBoard', id)
  const pc = await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first(), tag + '-armed')
  const full = await W.pic(p, tag + '-armed')
  let placed = null
  if (pick && armed) {
    await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'pick-' + id); await sleep(500)
    placed = await p.evaluate(([k, id]) => { const [di, wi, fi, ai, s] = k.split('.'); const a = window.DAYS[+di].waves[+wi].formations[+fi].aircraft[+ai]; return a ? a[s] === id : false }, [key, id])
  } else if (armed) { await p.keyboard.press('Escape'); await sleep(300) }
  await W5.boardDrawer(p, W, false)
  return { armed, c, placed, pic: [pc, full].filter(Boolean).join(', '), toast: await L.toastSaid(p) }
}
/* a sim box's seat armed and read the same way (no pick) */
export async function armZone(p, W, sel, tag, id = RANGER) {
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) return { armed: null, c: null, pic: await W.pic(p, tag + '-nozone') }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null, zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await zone.tap({ position: pos }); await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${tag}-arm-now-phone.png`) }).catch(() => {}) } else await zone.click({ position: pos })
  await sleep(500)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await W5.boardDrawer(p, W, true)
  const c = await W5.crewOf(p, '#schedBoard', id)
  const pc = await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first(), tag + '-armed')
  const full = await W.pic(p, tag + '-armed')
  if (armed) { await p.keyboard.press('Escape'); await sleep(300) }
  await W5.boardDrawer(p, W, false)
  return { armed, c, pic: [pc, full].filter(Boolean).join(', ') }
}
/* where Ranger's crew puck stands, struck or not, its hover title, any printed reason */
export const crewSay = c => c && c.pucks ? c.pucks.filter(x => x.shown).map(x => `[${x.where}${x.struck ? ', STRUCK' : ', not struck'}] title "${x.title}"${x.printed ? ` printed "${x.printed}"` : ' (no reason printed)'}`).join(' + ') || 'not shown' : J(c)
export const struckSans = c => !!(c && c.pucks && c.pucks.some(x => x.shown && x.struck && x.where === 'SANS Avail'))
export const printedAny = c => !!(c && c.pucks && c.pucks.some(x => x.shown && x.printed))
/* the warning list of the open board's day (#sbWarn), read from its drawn rows */
export async function warns(p, W, di, tag) {
  await L.openBoard(p, W, di)
  const tog = p.locator('#sbWarn [data-sbwtog]').first()
  if (W.isPhone && await tog.count() && !(await p.evaluate(() => !!document.querySelector('#sbWarn .sbwrap.open')))) { await W.press(p, tog, 'warn-open'); await sleep(300) }
  const r = await p.evaluate(() => {
    const w = document.querySelector('#sbWarn'); if (!w) return { head: 'no #sbWarn', rows: [] }
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const head = t(w.querySelector('.wh'))
    const wrap = w.querySelector('.sbwrap')
    const rows = wrap ? [...wrap.children].filter(e => !e.classList.contains('wh')).map(t).filter(Boolean) : []
    return { head, rows }
  })
  const pic = tag ? await W5.clip(p, W, '#sbWarn', tag + '-warn', 20) : ''
  return { ...r, sans: r.rows.filter(x => /SANS/.test(x)), ranger: r.rows.filter(x => /Ranger/.test(x)), pic }
}
export const warnSay = w => `head "${w.head}" · ${w.rows.length} row(s) · Ranger's: ${w.ranger.join(' | ') || 'none'} · SANS: ${w.sans.join(' | ') || 'none'}`
/* the line's CX: cancel (with a reason) or un-cancel, through the board's own CX button and its window */
export async function cx(p, W, di, btnSel, on, tag) {
  await L.openBoard(p, W, di)
  const b = p.locator(L.B(btnSel)).first()
  if (!(await b.count())) return { ok: false, why: 'no CX button ' + btnSel }
  await W.press(p, b, 'cx'); await sleep(400)
  const open = await p.evaluate(() => { const x = document.querySelector('#cxPop'); return !!x && !x.hidden })
  if (!open) return { ok: false, why: 'the CX window did not open' }
  if (on) { const i = p.locator('#cxPop input:visible, #cxPop textarea:visible').first(); if (await i.count()) await i.fill('WX'); await W.press(p, '#cxSave:visible', 'cx-save') }
  else await W.press(p, '#cxUn:visible', 'cx-un')
  await sleep(600)
  return { ok: true, pic: await W.pic(p, tag + (on ? '-cx' : '-uncx')) }
}
