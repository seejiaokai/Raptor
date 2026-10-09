/* P2-08 — counters sit between the fixed rows without moving the fixed order (D665, D674). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size, { fresh: false })
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const FIXED = ['fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w']
const short = o => o.map(x => x.replace('fly-row-', '').replace('count-', '#'))
const above = (o, id) => o.slice(0, o.indexOf(id)).filter(x => FIXED.includes(x)).length
await B.makeCounter(w, 'Alpha', { seat: 'pilot' })
await B.makeCounter(w, 'Bravo', { seat: 'wso' })
let o = await B.blockOrder(w)
note('start order', short(o))
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(600)
pics.push(await B.pic(p, `P2-08-${S}-1-rearrange`))
const noGripOnFixed = await p.evaluate(() => document.querySelectorAll('.mx tbody.counts tr.flyrow .drag, .mx tbody.counts tr.flyrow .mrow-btn').length)
chk('in Rearrange the four fixed rows carry no grip and no cross', noGripOnFixed === 0, 'grips/crosses on fixed rows: ' + noGripOnFixed)
const hold = async (id, onto, half) => {
  await B.tid(w, `manning-drag-${id}`).scrollIntoViewIfNeeded().catch(() => {})
  const g = await B.tid(w, `manning-drag-${id}`).boundingBox()
  const t = await B.tid(w, onto).locator('td.who').first().boundingBox()
  const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }
  const b = { x: t.x + Math.min(t.width / 2, 30), y: half === 'upper' ? t.y + 3 : t.y + t.height - 3 }
  if (w.phone) {
    const c = await B.cdp(w)
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
    for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] })
  } else {
    await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x, a.y + 4, { steps: 2 }); await p.mouse.move(b.x, b.y, { steps: 6 })
  }
}
const release = async () => { if (w.phone) await (await B.cdp(w)).send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await p.mouse.up(); await B.sleep(500) }
/* slots: k fixed rows above the counter */
const SLOTS = [
  { k: 0, onto: 'fly-row-req-p', half: 'upper', say: 'above Required P' },
  { k: 1, onto: 'fly-row-req-w', half: 'upper', say: 'between Required P and W' },
  { k: 2, onto: 'fly-row-avail-p', half: 'upper', say: 'between Required W and Available P' },
  { k: 3, onto: 'fly-row-avail-w', half: 'upper', say: 'between Available P and W' },
  { k: 4, onto: 'fly-row-avail-w', half: 'lower', say: 'below Available W' },
]
let pic = 0
for (const id of ['count-alpha', 'count-bravo']) {
  const cid = id.replace('count-', '')
  /* order the slots so each is a real move: go 4,2,0,3,1 */
  for (const k of [4, 2, 0, 3, 1]) {
    const s = SLOTS[k]
    await hold(cid, s.onto, s.half)
    const barRow = await p.evaluate(sel => { const e = document.querySelector(`[data-testid="${sel}"]`); return e ? e.className : null }, s.onto)
    await release()
    o = await B.blockOrder(w)
    const fixedOrder = o.filter(x => FIXED.includes(x))
    const where = above(o, id)
    chk(`${cid} dropped ${s.say}: ${where} fixed rows above it, fixed order kept`, where === s.k && JSON.stringify(fixedOrder) === JSON.stringify(FIXED), short(o).join(' > ') + ' | landing row class while held: ' + barRow)
    if (k === 2 || k === 4 || (k === 1 && cid === 'bravo')) { pics.push(await B.pic(p, `P2-08-${S}-2-${cid}-slot${k}`)) }
  }
}
/* both counters in different slots; leave Rearrange, check; reload and check persists */
await hold('alpha', 'fly-row-avail-w', 'lower'); await release()
await hold('bravo', 'fly-row-req-w', 'upper'); await release()
o = await B.blockOrder(w); const expectOrder = short(o).join(' > ')
note('final order before leaving Rearrange', expectOrder)
pics.push(await B.pic(p, `P2-08-${S}-3-final-rearrange`))
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(600)
const afterExit = short(await B.blockOrder(w)).join(' > ')
chk('leaving Rearrange keeps the order', afterExit === expectOrder, afterExit)
pics.push(await B.pic(p, `P2-08-${S}-4-after-exit`))
await B.sleep(1200)
await p.reload(); await p.waitForSelector('#luser', { timeout: 8000 }).then(async () => { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }, () => {})
await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await B.sleep(500)
await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="row-slipway"]'); await B.sleep(900)
const afterReload = short(await B.blockOrder(w)).join(' > ')
chk('a reload keeps the order', afterReload === expectOrder, afterReload)
pics.push(await B.pic(p, `P2-08-${S}-5-after-reload`))
/* fixed rows cannot be dragged: try to drag a fixed row's name in Rearrange */
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
const beforeTry = (await B.blockOrder(w)).join()
const nm = await B.tid(w, 'fly-row-req-p').locator('td.who').first().boundingBox()
if (w.phone) { const c = await B.cdp(w); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: nm.x + 10, y: nm.y + nm.height / 2 }] }); await B.sleep(300); for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: nm.x + 10, y: nm.y + nm.height / 2 + i * 14 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
else { await p.mouse.move(nm.x + 10, nm.y + nm.height / 2); await p.mouse.down(); await p.mouse.move(nm.x + 10, nm.y + nm.height / 2 + 6, { steps: 2 }); await p.mouse.move(nm.x + 10, nm.y + nm.height / 2 + 90, { steps: 8 }); await p.mouse.up() }
await B.sleep(500)
const afterTry = (await B.blockOrder(w)).join()
chk('dragging a fixed row by its name moves nothing', beforeTry === afterTry, short(await B.blockOrder(w)).join(' > '))
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(400)
const bad = checks.filter(c => !c[1])
B.row('P2-08', S, 'Made two counters via ⚙ + Counter; Rearrange; dragged each (real mouse / finger over CDP) above, between and below the four fixed rows (5 slots each); left Rearrange; reload; tried to drag a fixed row',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p208-' + S, w.errors)
await B.close(w)
