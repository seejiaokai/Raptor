/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 19: is the phantom an
   OIL one? A weekday earns no OIL at all, so if a published WEEKDAY also comes
   back asking for an amendment, the phantom has nothing to do with this change;
   if only the weekend days do, it belongs to the OIL block.
   Monday is the other everything-day (nine ground rows, ten programme rows),
   so it is the fair comparison for the Saturday. */
import { open, board, publish, shot, closeBoard, STATE } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const read = (page, di) => page.evaluate(i => ({
  version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() : 'none' })(),
}), di)

for (const [di, what] of [[0, 'MONDAY  — a weekday, the other everything-day'],
                          [4, 'FRIDAY  — a quiet weekday'],
                          [5, 'SATURDAY — earns OIL'],
                          [6, 'SUNDAY  — earns OIL, almost empty']]) {
  const TMP = OUT + `/state-lw-wk${di}.json`
  const a = await open({ state: STATE })
  await board(a.page, di)
  const p = await publish(a.page, di)
  const straight = await read(a.page, di)
  await closeBoard(a.page); await a.page.waitForTimeout(600)
  await a.page.context().storageState({ path: TMP }); await a.browser.close()
  const b = await open({ state: TMP })
  await board(b.page, di)
  const reloaded = await read(b.page, di)
  await shot(b.page, `LW-44-reload-day${di}`)
  await b.browser.close()
  console.log(what.padEnd(46), '| published:', String(p.version || p.why).padEnd(6),
    '| straight after:', straight.pending.padEnd(16), '| AFTER RELOAD:', reloaded.pending, '(' + reloaded.al + ')')
}
