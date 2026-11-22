// w1 — S1 on the phone, pictured where the eye is: the board's AIRCREW drawer opened and Hex's crew-list puck and row puck
// brought into view on Sat 18 Jul and Mon 20 Jul (the first phone run read them but its pictures showed the day's top).
// node scripts/handpass/sfd-w1-phonepics.mjs
import path from 'node:path'
import { SIZES, mk, world, signIn, openBoard, closeBoard, boardStep, typeBox, groundRowWith, postOutSans, readBoard, B, sleep, J, log, OUT } from './sfd-w1-lib.mjs'
log('sfd-w1-phonepics v1')
const sz = SIZES.p, W = mk('s1pp', sz)
const { b, p } = await world(sz, W, '2026-07-22T09:00:00')
const HEX = 'rocky', SAT = 5
await signIn(p, 'ad', 'a')
await openBoard(p, W, SAT)
await W.press(p, B(`[data-padd="${SAT}"]`), 'add-item')
const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, SAT)
await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.prog"]`, 'SQN EVENT')
await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.str"]`, '0800')
await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.end"]`, '1500')
await W.press(p, B(`[data-fill="a:${SAT}.${ri}.+"]`), 'arm-cmn')
await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail'); await sleep(500)
log('sat ground', J((await groundRowWith(p, W, SAT, HEX)).row))
await boardStep(p, W, 1); await boardStep(p, W, 1)
log('mon ground', J((await groundRowWith(p, W, 0, HEX)).row))
await closeBoard(p, W)
log('posting', J((await postOutSans(p, W, HEX, '2026-07-20', 'pp')).after))
/* back to the demo week */
await openBoard(p, W, 0); await boardStep(p, W, -1); await closeBoard(p, W)

async function shoot(tag) {
  /* the row puck: scroll it to the screen's middle, picture */
  const row = p.locator(`#schedBoard .seat .puck[data-person="${HEX}"], #schedBoard [data-slot] .puck[data-person="${HEX}"]`).first()
  if (await row.count()) { await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400); await W.pic(p, `${tag}-row`) }
  /* the AIRCREW drawer: its tab, then his crew-list puck in view */
  const tab = p.locator('#schedBoard .ros-tab').first()
  const before = await p.evaluate(() => { const r = document.querySelector('#schedBoard .ros-tab'); return r ? r.getBoundingClientRect().left : null })
  if (await tab.count()) await W.press(p, tab, 'aircrew-tab')
  await sleep(500)
  const crew = p.locator(`#schedBoard .rpuck[data-person="${HEX}"]`).first()
  await crew.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(400)
  const box = await crew.boundingBox().catch(() => null)
  const r = await readBoard(p, HEX)
  log(tag, 'tab left before', before, 'crew box', J(box), J(r.pucks.map(x => [x.where, x.san])))
  await W.pic(p, `${tag}-crew`)
  if (box) await p.screenshot({ path: path.join(OUT, `s1pp-${tag}-crew-closeup-phone.png`), clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 40), width: Math.min(400, box.width + 120), height: box.height + 80 } })
  if (await tab.count()) await W.press(p, tab, 'aircrew-tab-close')
}
await openBoard(p, W, SAT); await shoot('sat')
await boardStep(p, W, 1); await boardStep(p, W, 1); await shoot('mon20')
await closeBoard(p, W)
log('errors', J(W.errs))
await b.close()
