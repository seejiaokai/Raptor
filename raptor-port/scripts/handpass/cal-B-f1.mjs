/* Finding F1 — on a phone, the first tap after a finger-drag of a counter row in Rearrange does nothing. */
import * as B from './cal-B-lib.mjs'
const w = await B.world('phone')
const p = w.page
const pics = [], log = []
const note = (k, v) => { log.push(`${k}: ${v}`); console.log('  >', k, v) }
await B.makeCounter(w, 'Delta', { seat: 'pilot' })
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
const hold = async (id, onto, half) => {
  const g = await B.tid(w, `manning-drag-${id}`).boundingBox()
  const t = await B.tid(w, onto).locator('td.who').first().boundingBox()
  const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }, b = { x: t.x + Math.min(t.width / 2, 30), y: half === 'upper' ? t.y + 3 : t.y + t.height - 3 }
  const c = await B.cdp(w); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] }); for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await B.sleep(500)
}
const arranging = () => p.evaluate(() => /\bon\b/.test(document.querySelector('[data-testid="roster-arrange"]').className))
note('Rearrange on before the drag', String(await arranging()))
await hold('delta', 'fly-row-avail-p', 'upper')
note('order after the finger drag', (await B.blockOrder(w)).join(' > '))
pics.push(await B.pic(p, 'F1-1-after-drag'))
/* tap 1 on the Rearrange button (a real finger tap, the button's own centre) */
const b = await B.tid(w, 'roster-arrange').boundingBox()
await B.touchTap(w, b.x + b.width / 2, b.y + b.height / 2); await B.sleep(500)
const afterTap1 = await arranging()
note('Rearrange still on after the FIRST tap on it', String(afterTap1))
pics.push(await B.pic(p, 'F1-2-after-first-tap'))
await B.touchTap(w, b.x + b.width / 2, b.y + b.height / 2); await B.sleep(500)
const afterTap2 = await arranging()
note('Rearrange on after the SECOND tap', String(afterTap2))
pics.push(await B.pic(p, 'F1-3-after-second-tap'))
/* control: no drag, one tap works */
const w2 = await B.world('phone')
const arranging2 = () => w2.page.evaluate(() => /\bon\b/.test(document.querySelector('[data-testid="roster-arrange"]').className))
const b2 = await B.tid(w2, 'roster-arrange').boundingBox()
await B.touchTap(w2, b2.x + b2.width / 2, b2.y + b2.height / 2); await B.sleep(500)
note('control (no drag first): Rearrange on after ONE tap', String(await arranging2()))
await B.close(w2)
B.row('F1', 'phone', 'A fresh world, ⚙ + Counter, Rearrange on, one real finger drag of the counter row (grip -> upper half of Available P), then ONE real finger tap on the Rearrange button',
  log.join(' || '), afterTap1 && !afterTap2 ? 'FINDING (first tap after a drag is ignored)' : 'not reproduced', pics)
B.noteErrors('f1', w.errors)
await B.close(w)
