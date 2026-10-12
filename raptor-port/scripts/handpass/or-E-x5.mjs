import { world, sleep, browser, PHONE } from './or-E-lib.mjs'
const w = await world({ size: PHONE, touch: true, who: 'ad', pass: 'a', tag: 'x5' })
const { page, press } = w
const people = () => page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Wed Z'); return r ? r.people.map(e => (window.PEOPLE[e.p] || {}).cs) : null })
await w.fileIt({ pick: ['Ranger', 'Hex', 'Anvil'], title: 'Wed Z', from: '09:00', to: '10:00', kind: 'Training' })
console.log('filed', JSON.stringify(await people()))
// (1) real sign-in as Ranger
await w.signOut(); await w.signIn('us', 'us')
await page.evaluate(() => window.go('inputs')); await sleep(400)
const takeOut = async (who) => {
  await w.toMonth(); await w.openDay('2026-07-15')
  const rec = await w.rec('Wed Z')
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${rec.iid}"]`).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(500)
  const to = page.locator('[data-testid="inped-takeout"]').first()
  console.log(who, 'take-out button', await to.count())
  if (await to.count()) { await to.scrollIntoViewIfNeeded(); await press(to); await sleep(800) }
  console.log(who, 'after press: toast', await w.note(), '| people', JSON.stringify(await people()), '| window still open', await page.locator('#inpEditPop:visible').count(), '| dialogs', await page.evaluate(() => [...document.querySelectorAll('[role=dialog],[data-testid$=conf]')].filter(e => e.offsetParent).map(e => e.getAttribute('data-testid') || e.className).join(',')))
  await w.shot('x5-' + who)
  if (await page.locator('#inpEditPop:visible').count()) { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(250) } }
  await w.closeDay().catch(() => {})
}
await takeOut('ranger')
// (2) Hex in place
const hid = await w.csId('Hex')
await w.signOut(); await w.signIn('ad', 'a')
await page.evaluate(id => { window.raptorMe(id); window.raptorRole('member') }, hid); await sleep(500)
await page.evaluate(() => window.go('inputs')); await sleep(400)
await takeOut('hex-in-place')
console.log('errors', JSON.stringify(w.errors))
await browser.close()
