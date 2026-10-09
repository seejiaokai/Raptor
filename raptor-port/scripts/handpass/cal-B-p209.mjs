/* P2-09 — the two counter-delete doors deliberately differ (D676, D677). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const NODRAG = process.argv[3] === 'nodrag'
const w = await B.world(size)
const p = w.page, S = w.key + (NODRAG ? '-nodrag' : '')
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const short = o => o.map(x => x.replace('fly-row-', '').replace('count-', '#')).join(' > ')
const dialogs = () => p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.getAttribute('data-testid')))
const paint = id => B.tid(w, id).evaluate(el => { const c = getComputedStyle(el); return { bg: c.backgroundColor, ink: c.color, edge: c.borderTopColor } })
const redish = c => { const m = (c.match(/[\d.]+/g) || []).map(Number); return m[0] > 180 && m[1] < 200 && m[2] < 200 && m[0] - m[1] > 40 }
await B.makeCounter(w, 'Delta', { seat: 'pilot', amber: 5, red: 3 })
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
/* put Delta between Required W and Available P */
const hold = async (id, onto, half) => {
  const g = await B.tid(w, `manning-drag-${id}`).boundingBox()
  const t = await B.tid(w, onto).locator('td.who').first().boundingBox()
  const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }, b = { x: t.x + Math.min(t.width / 2, 30), y: half === 'upper' ? t.y + 3 : t.y + t.height - 3 }
  if (w.phone) { const c = await B.cdp(w); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] }); for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
  else { await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x, a.y + 4, { steps: 2 }); await p.mouse.move(b.x, b.y, { steps: 6 }); await p.mouse.up() }
  await B.sleep(500)
}
if (!NODRAG) await hold('delta', 'fly-row-avail-p', 'upper')
const before = short(await B.blockOrder(w))
note('1 order with Delta between Required W and Available P', before)
chk(NODRAG ? 'Delta stands above Required P (made, never dragged)' : 'Delta sits between Required W and Available P', NODRAG ? /^#delta > req-p/.test(before) : /req-w > #delta > avail-p/.test(before), before)
const crossPaint = await paint('manning-delete-delta')
note('cross paint', JSON.stringify(crossPaint))
pics.push(await B.pic(p, `P2-09-${S}-1-before-cross`))
chk('the cross is red (ink or edge)', redish(crossPaint.ink) || redish(crossPaint.edge), JSON.stringify(crossPaint))
/* the cross: one press deletes at once */
await B.press(w, B.tid(w, 'manning-delete-delta')); await B.sleep(500)
const firstTapWorked = !(await B.blockOrder(w)).includes('count-delta')
note('2a first tap on the cross after the placing drag deleted it', String(firstTapWorked))
chk('the FIRST tap on the cross after the drag deletes the counter', firstTapWorked, firstTapWorked ? '' : 'first tap did nothing (counter still on the grid)')
if (!firstTapWorked) { pics.push(await B.pic(p, `P2-09-${S}-1b-first-tap-did-nothing`)); await B.press(w, B.tid(w, 'manning-delete-delta')); await B.sleep(500) }
const afterX = short(await B.blockOrder(w)); const dlg = await dialogs()
const bodyAsk = await p.evaluate(() => /really delete|are you sure|confirm/i.test(document.body.innerText))
note('2 after one press on the cross', `${afterX} | dialogs ${JSON.stringify(dlg)} | any "really/sure" text ${bodyAsk}`)
pics.push(await B.pic(p, `P2-09-${S}-2-after-cross`))
chk('the cross deletes at once and asks nothing', !/delta/.test(afterX) && dlg.length === 0 && !bodyAsk, `${afterX} | ${JSON.stringify(dlg)} | ask=${bodyAsk}`)
/* Undo */
await B.undo(w)
const afterUndo = short(await B.blockOrder(w))
note('3 after Undo', afterUndo)
chk('Undo restores the counter in the same place', afterUndo === before, afterUndo)
/* its definition: open its window */
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(400)
const openWin = async () => { await B.press(w, B.tid(w, 'manning-info-delta')); await B.sleep(300); await B.press(w, B.tid(w, 'counter-edit-open')); await B.sleep(400) }
await openWin()
const def = await p.evaluate(() => ({ name: document.querySelector('[data-testid="cform-name"]').value, amber: document.querySelector('[data-testid="cform-amber"]').value, red: document.querySelector('[data-testid="cform-red"]').value, seatOn: [...document.querySelectorAll('[data-testid^="cf-seat-"]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.innerText) }))
note('4 definition after Undo', JSON.stringify(def))
pics.push(await B.pic(p, `P2-09-${S}-3-window`))
chk('definition restored whole (name Delta, amber 5, red 3, Pilots)', def.name === 'Delta' && def.amber === '5' && def.red === '3' && def.seatOn.join() === 'Pilots', JSON.stringify(def))
/* colours of the three buttons (H-04 reads the same) */
const pS = await paint('cform-save'), pC = await paint('cform-cancel'), pD = await paint('cform-delete')
note('button paints', JSON.stringify({ save: pS, cancel: pC, delete: pD }))
/* the window's Delete asks first; Cancel keeps */
await B.press(w, B.tid(w, 'cform-delete')); await B.sleep(250)
const askTxt = await B.txt(B.tid(w, 'cform-delete'))
const stillThere = (await B.blockOrder(w)).includes('count-delta')
note('5 window Delete pressed once', `button reads "${askTxt}"; counter still on grid: ${stillThere}`)
pics.push(await B.pic(p, `P2-09-${S}-4-really-delete`))
chk('window Delete asks first ("Really delete?") and deletes nothing yet', /really/i.test(askTxt) && stillThere, `${askTxt} / ${stillThere}`)
await B.press(w, B.tid(w, 'cform-cancel')); await B.sleep(400)
const afterCancel = short(await B.blockOrder(w))
chk('Cancel preserves the counter', afterCancel === before, afterCancel)
/* confirm */
await openWin()
await B.press(w, B.tid(w, 'cform-delete')); await B.sleep(200); await B.press(w, B.tid(w, 'cform-delete')); await B.sleep(500)
const afterConfirm = short(await B.blockOrder(w))
note('6 confirmed delete', afterConfirm)
chk('confirming deletes the counter', !/delta/.test(afterConfirm), afterConfirm)
await B.undo(w)
const afterUndo2 = short(await B.blockOrder(w))
chk('Undo of the window delete restores it complete in place', afterUndo2 === before, afterUndo2)
pics.push(await B.pic(p, `P2-09-${S}-5-after-undo-of-window-delete`))
const bad = checks.filter(c => !c[1])
B.row('P2-09', S, 'Counter Delta (pilots, amber 5 red 3) placed between Required W and Available P by drag; red cross in Rearrange; Undo; window: Delete counter, Cancel, confirm; Undo',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | ') + ' || ' + log.join(' || '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p209-' + S, w.errors)
await B.close(w)
