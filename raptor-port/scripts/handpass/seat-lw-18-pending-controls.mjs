/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 16: what causes the
   phantom amendment. Four publications of the SAME Saturday, differing only in
   what is put on the new row, each reopened from a saved world:
     1  nothing added                      — the baseline
     2  a new duty desk with a NAMED man   — is it the row?
     3  a new duty desk with ALL AVAIL     — the new surface this change built
     4  a new GROUND row with ALL AVAIL    — the surface that already worked
   Whichever come back "1 pending" name the cause, and comparing 3 against 4
   says whether the change introduced it or inherited it. */
import { open, board, publish, shot, closeBoard, tap, type, STATE } from './lib.mjs'
import { handPut } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const TMP = OUT + '/state-lw-tmp2.json'
const DI = 5
const read = (page, di) => page.evaluate(i => ({
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() : 'none' })(),
}), di)

async function trial(label, build) {
  const a = await open({ state: STATE })
  await board(a.page, DI)
  if (build) await build(a.page)
  const pub = await publish(a.page, DI)
  const straight = await read(a.page, DI)
  await closeBoard(a.page); await a.page.waitForTimeout(600)
  await a.page.context().storageState({ path: TMP })
  await a.browser.close()
  const b = await open({ state: TMP })
  await board(b.page, DI)
  const reloaded = await read(b.page, DI)
  await shot(b.page, 'LW-40-' + label)
  await b.browser.close()
  console.log(label.padEnd(30), '| published', pub.version, '| straight after:', straight.pending,
    '| AFTER RELOAD:', reloaded.pending, '(' + reloaded.al + ')')
}

await trial('1-nothing-added', null)
await trial('2-desk-with-a-named-man', async page => {
  await tap(page, `[data-dradd="${DI}.0"]`)
  await type(page, `[data-bfld="dr:${DI}.0.3.role"]`, 'SAT DESK')
  await type(page, `[data-bfld="dr:${DI}.0.3.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${DI}.0.3.end"]`, '18:00')
  await handPut(page, `d:${DI}.0.3.+`, 'pump')
})
await trial('3-desk-with-ALL-AVAIL', async page => {
  await tap(page, `[data-dradd="${DI}.0"]`)
  await type(page, `[data-bfld="dr:${DI}.0.3.role"]`, 'SAT DESK')
  await type(page, `[data-bfld="dr:${DI}.0.3.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${DI}.0.3.end"]`, '18:00')
  await handPut(page, `d:${DI}.0.3.+`, 'allavail')
})
await trial('4-ground-row-with-ALL-AVAIL', async page => {
  await tap(page, `[data-gradd="${DI}"]`)
  await type(page, `[data-bfld="gr:${DI}.5.prog"]`, 'HANGAR')
  await type(page, `[data-bfld="gr:${DI}.5.str"]`, '08:00')
  await type(page, `[data-bfld="gr:${DI}.5.end"]`, '18:00')
  await handPut(page, `g:${DI}.5.+`, 'allavail')
})
