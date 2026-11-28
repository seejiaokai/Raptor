// k0p-p1-keys - Part 1 item 9: the phone with the keys up. The test browser has no on-screen keyboard, so after the tap on
// the callsign box the keys are STOOD IN by shrinking the screen's height by an iPhone keyboard's 336 points (844 → 508),
// the way a browser that resizes for its keys behaves. This is NOT his iPhone's own measure (walk-scripts §3: the iPhone
// pans the visible screen instead), so it answers "can Add person and Cancel be scrolled to" and "does the page itself
// jump", not how his iPhone glides.
import { mk, signIn, pick, usersTab, FACT, closeAll, world, wait, ERRS, shot, boxOf, hit } from './k0p-lib.mjs'
console.log('k0p-p1-keys v1')
try {
  const s = await mk('p', { storageState: await world() })
  await signIn(s, 'hunter'); await pick(s, 149); await usersTab(s); await wait(s, 500)
  await hit(s, '#accAddOpen', 600)
  const before = { scrollY: await s.page.evaluate(() => scrollY), cs: await boxOf(s, '#accAddCs'), add: await boxOf(s, '#accAdd') }
  const l = s.page.locator('#accAddCs'); const b = await l.boundingBox()
  await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 80)
  await shot(s, 'p1-9-tap-now-p'); await wait(s, 500)
  const tapped = { focus: await s.page.evaluate(() => document.activeElement?.id), scrollY: await s.page.evaluate(() => scrollY), cs: await boxOf(s, '#accAddCs') }
  await s.page.setViewportSize({ width: 390, height: 508 }); await wait(s, 700)
  const keys = { focus: await s.page.evaluate(() => document.activeElement?.id), scrollY: await s.page.evaluate(() => scrollY), cs: await boxOf(s, '#accAddCs'), add: await boxOf(s, '#accAdd'), cancel: await boxOf(s, '#accAddCancel'), innerH: await s.page.evaluate(() => innerHeight), topbar: await boxOf(s, '.topbar') }
  await shot(s, 'p1-9-keys-up-p')
  /* scroll the page until Add person is in view, by the page's own scroll (a finger swipe stand-in: scrollBy) */
  await s.page.evaluate(() => document.querySelector('#accAdd').scrollIntoView({ block: 'nearest' })); await wait(s, 400)
  const reach = { scrollY: await s.page.evaluate(() => scrollY), add: await boxOf(s, '#accAdd'), cancel: await boxOf(s, '#accAddCancel'), focusStill: await s.page.evaluate(() => document.activeElement?.id), addFree: await s.page.evaluate(() => { const e = document.querySelector('#accAdd'), r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) }) }
  await shot(s, 'p1-9-keys-up-scrolled-p', [reach.add, reach.cancel], 30)
  FACT('p1.9', { before, tapped, keys, reach, errs: s.errs })
  await s.ctx.close()
} finally { FACT('errors', ERRS); await closeAll() }
