/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 18: does it ever stop?
   A published Saturday that reopens asking for an amendment nobody made is a
   nuisance. A published Saturday that asks again after every amendment is a
   treadmill: the scheduler re-signs four roles and issues a new version of the
   squadron's schedule, for nothing, every time he opens the app.
   So: publish, reload, publish the amendment it asks for, reload, and count. */
import { open, board, publish, shot, closeBoard, STATE } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const TMP = OUT + '/state-lw-loop.json'
const DI = 5
const read = (page, di) => page.evaluate(i => ({
  version: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() : 'none' })(),
}), di)
async function publishAmendment(page, di) {
  const sels = page.locator(`#sbSignBar select[data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const o = await sels.nth(i).locator('option').evaluateAll(os => os.map(x => x.value).filter(Boolean))
    if (o.length) await sels.nth(i).selectOption(o[Math.min(i, o.length - 1)])
    await page.waitForTimeout(180)
  }
  const b = page.locator(`#sbSignBar [data-alpub="${di}"]`).first()
  if (!await b.count()) return 'no AL button'
  if (await b.isDisabled()) return 'locked'
  const l = (await b.innerText()).trim(); await b.click(); await page.waitForTimeout(1200)
  return l
}

/* round 0 — the first publication */
let a = await open({ state: STATE })
await board(a.page, DI)
await publish(a.page, DI)
console.log('round 0, straight after Publish day:', JSON.stringify(await read(a.page, DI)))
await closeBoard(a.page); await a.page.waitForTimeout(600)
await a.page.context().storageState({ path: TMP }); await a.browser.close()

for (let round = 1; round <= 3; round++) {
  const p = await open({ state: TMP })
  await board(p.page, DI)
  const onOpen = await read(p.page, DI)
  console.log(`\nround ${round} — reopened:`, JSON.stringify(onOpen))
  if (onOpen.pending === 'nothing pending') { console.log('  → clean. The treadmill stops here.'); await p.browser.close(); break }
  const pressed = await publishAmendment(p.page, DI)
  await p.page.waitForTimeout(800)
  console.log(`  pressed: ${pressed} ->`, JSON.stringify(await read(p.page, DI)))
  await shot(p.page, `LW-43-loop-round${round}`)
  await closeBoard(p.page); await p.page.waitForTimeout(600)
  await p.page.context().storageState({ path: TMP })
  await p.browser.close()
}
console.log('\n(each round is one morning: he opens the app, the day asks to be amended, he signs four roles and issues a version.)')
