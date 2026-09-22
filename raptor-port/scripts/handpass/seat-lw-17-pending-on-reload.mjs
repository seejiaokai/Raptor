/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 15: the phantom, found.
   Publishing leaves nothing pending. The saved world, reopened, shows one
   pending change on the same day. So the difference is the RELOAD — which is
   what a scheduler does every morning. Three reloads, so the answer cannot be
   a one-off: publish the plainest possible weekend day, save, reopen, read;
   then the same with a placeholder crowd on it; then reopen a second time. */
import { open, board, publish, shot, closeBoard, STATE } from './lib.mjs'
import { tap, type } from './lib.mjs'
import { handPut } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const TMP = OUT + '/state-lw-tmp.json'
const read = (page, di) => page.evaluate(i => ({
  version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  sign: (document.querySelector('#sbSignBar .so-state') || {}).innerText || '',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() + (b.disabled ? ' (locked)' : '') : 'none' })(),
}), di)

async function cycle(label, di, build) {
  const a = await open({ state: STATE })
  await board(a.page, di)
  if (build) await build(a.page, di)
  const pub = await publish(a.page, di)
  await a.page.waitForTimeout(700)
  const straightAfter = await read(a.page, di)
  await closeBoard(a.page)
  await a.page.waitForTimeout(700)
  await a.page.context().storageState({ path: TMP })
  await a.browser.close()

  const b = await open({ state: TMP })
  await board(b.page, di)
  const afterReload = await read(b.page, di)
  await shot(b.page, 'LW-39-' + label + '-after-reload')
  /* what does it think changed? */
  const what = await b.page.evaluate(() => {
    const c = document.querySelector('#schedBoard .dpend')
    return c ? { chip: c.innerText.replace(/\s+/g, ' ').trim(), title: c.title } : null
  })
  await closeBoard(b.page)
  await b.page.waitForTimeout(500)
  await b.page.context().storageState({ path: TMP })
  await b.browser.close()

  const c = await open({ state: TMP })
  await board(c.page, di)
  const secondReload = await read(c.page, di)
  await c.browser.close()

  console.log('\n--- ' + label + ' (day ' + di + ')')
  console.log('   publish:          ', JSON.stringify(pub))
  console.log('   straight after:   ', JSON.stringify(straightAfter))
  console.log('   AFTER ONE RELOAD: ', JSON.stringify(afterReload), what ? '· chip says: ' + what.title : '')
  console.log('   after a second:   ', JSON.stringify(secondReload))
}

await cycle('plain-sunday', 6, null)
await cycle('saturday-with-crowd', 5, async (page, di) => {
  await tap(page, `[data-dradd="${di}.0"]`)
  await type(page, `[data-bfld="dr:${di}.0.3.role"]`, 'SAT DESK')
  await type(page, `[data-bfld="dr:${di}.0.3.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${di}.0.3.end"]`, '18:00')
  await handPut(page, `d:${di}.0.3.+`, 'allavail')
})
