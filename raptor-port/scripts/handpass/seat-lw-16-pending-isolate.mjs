/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 14: where the phantom
   amendment comes from. Both published days read "1 pending · Publish AL1"
   with the four signatures cleared although nobody had touched them since
   publishing. The register says in as many words: "No amendment nobody made."

   Three publications from the SAME untouched world, so the only difference is
   what is on the day:
     A  the Saturday exactly as it comes, nothing added at all
     B  the Saturday with a placeholder crowd on a new duty desk
     C  the Sunday, which starts almost empty, nothing added
   Whichever of them comes back pending is where the phantom lives. */
import { open, board, tap, type, publish, shot, closeBoard, STATE } from './lib.mjs'
import { handPut } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const after = (page, di) => page.evaluate(i => ({
  version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  pendTitle: (document.querySelector('#schedBoard .dpend') || {}).title || '',
  sign: (document.querySelector('#sbSignBar .so-state') || {}).innerText || '',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() : 'none' })(),
}), di)

async function run(label, di, build) {
  const { browser, page, errors } = await open({ state: STATE })
  await board(page, di)
  if (build) await build(page, di)
  const before = await after(page, di)
  const p = await publish(page, di)
  await page.waitForTimeout(800)
  const now = await after(page, di)
  console.log('\n--- ' + label)
  console.log('   before publishing:', JSON.stringify(before))
  console.log('   publish said:', JSON.stringify(p))
  console.log('   straight after:  ', JSON.stringify(now))
  await shot(page, 'LW-38-' + label.replace(/[^a-z0-9]+/gi, '-').toLowerCase())
  console.log('   errors:', errors.slice(0, 4))
  await browser.close()
  return now
}

await run('A-saturday-untouched', 5, null)
await run('B-saturday-with-a-crowd', 5, async (page, di) => {
  await tap(page, `[data-dradd="${di}.0"]`)
  await type(page, `[data-bfld="dr:${di}.0.3.role"]`, 'SAT DESK')
  await type(page, `[data-bfld="dr:${di}.0.3.str"]`, '08:00')
  await type(page, `[data-bfld="dr:${di}.0.3.end"]`, '18:00')
  const r = await handPut(page, `d:${di}.0.3.+`, 'allavail')
  console.log('   (crowd placed:', r.took, ')')
})
await run('C-sunday-untouched', 6, null)
