/* w3 item 3 — the phone's halves (R66, owner's iPhone 7 Sep 26): below
   ~1050px only ONE half shows — the Flow chart or the Info panel, never both —
   also after leaving the tab and coming back, after using another Raptor page,
   and after any Raptor refresh. */
import { open, shot, save, log, PHONE } from './trk-lib.mjs'
import { sleep, halves } from './trk-w3-lib.mjs'

const L = log()
const one = h => h.flow !== h.info
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const drawerTo = async (page, id) => { await tapSel(page, '#burger'); await sleep(250); await tapSel(page, `#drawerNav a[data-page="${id}"]`); await page.waitForFunction(p => window.CURPAGE === p, id); await sleep(400) }

{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  let h = await halves(page)
  L.ok('phone: on arrival ONE half (Flow)', one(h) && h.flow, JSON.stringify(h))
  await tapSel(page, '#viewtabs [data-view="info"]')
  h = await halves(page); L.ok('phone: Info tab → the panel alone', one(h) && h.info, JSON.stringify(h))
  await drawerTo(page, 'leavewar'); await shot(page, 'w3-03-phone-leavewar')
  await drawerTo(page, 'tracker')
  h = await halves(page); L.ok('phone: Leave War and back → still ONE half (Info kept)', one(h) && h.info, JSON.stringify(h))
  await shot(page, 'w3-03-phone-back-from-leavewar')
  /* a Raptor refresh while ON the Tracker: pick another View-as person in the drawer */
  await tapSel(page, '#burger'); await sleep(250)
  const va = page.locator('#drawerViewAs button:not(.on)').nth(3)
  const vaName = await va.innerText()
  const vb = await va.boundingBox(); await page.touchscreen.tap(vb.x + vb.width / 2, vb.y + vb.height / 2); await sleep(500)
  h = await halves(page); L.ok(`phone: a Raptor refresh on the Tracker (View as ${vaName}) → still ONE half`, one(h) && h.info && await page.evaluate(() => window.CURPAGE) === 'tracker', JSON.stringify(h))
  await drawerTo(page, 'inputs'); await drawerTo(page, 'tracker')
  h = await halves(page); L.ok('phone: Inputs and back → ONE half', one(h), JSON.stringify(h))
  await tapSel(page, '#viewtabs [data-view="flow"]')
  await drawerTo(page, 'editsched'); await shot(page, 'w3-03-phone-editsched')
  await drawerTo(page, 'tracker')
  h = await halves(page); L.ok('phone: Flow, Edit Schedule and back → ONE half (Flow kept)', one(h) && h.flow, JSON.stringify(h))
  /* the admin's role flip — a Raptor refresh that ALSO changes the Tracker (the File menu goes) */
  await tapSel(page, '#burger'); await sleep(250)
  /* the switch sits at the foot of a long drawer — a person scrolls the drawer to it */
  await page.locator('#drawerRole').scrollIntoViewIfNeeded(); await sleep(200)
  await tapSel(page, '#drawerRole'); await sleep(600)
  h = await halves(page)
  L.ok('phone: "View as member" while on the Tracker → still ONE half, File menu gone', one(h) && !(await page.locator('#fileMenuBtn').isVisible().catch(() => false)), JSON.stringify(h) + ' page ' + await page.evaluate(() => window.CURPAGE))
  await shot(page, 'w3-03-phone-after-role-flip')
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* the breakpoint itself, in a desktop browser narrowed and widened */
{
  const { browser, page, errors } = await open({ size: { width: 1000, height: 800 }, who: 'a' })
  let h = await halves(page); L.ok('1000px wide: ONE half, with the Flow/Info tabs', one(h) && h.tabs, JSON.stringify(h))
  await shot(page, 'w3-03-1000px')
  await page.setViewportSize({ width: 1100, height: 800 }); await sleep(500)
  h = await halves(page); L.ok('1100px wide: both columns, no tabs', h.flow && h.info && !h.tabs, JSON.stringify(h))
  await shot(page, 'w3-03-1100px')
  await page.setViewportSize({ width: 1040, height: 800 }); await sleep(500)
  h = await halves(page); L.ok('1040px wide: back to ONE half', one(h), JSON.stringify(h))
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-03-halves', { rows: L.rows })
