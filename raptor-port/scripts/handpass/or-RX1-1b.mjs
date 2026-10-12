// RX1-1b — the desktop Inputs List picture for RX1-1's input of three
import { launch, openWorld, fileX, shotX, errs, log } from './or-RX1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
const r = await fileX(p, { type: 'Personal', people: ['Ranger', 'Hex', 'Hunter'], from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] })
const iid = r.made[0].iid
await p.evaluate(() => window.go('inputs'))
await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
await p.locator('#inRangeBtn').click(); await p.locator('#inRangeAll').click(); await p.waitForTimeout(500)
const row = p.locator(`[data-iid="${iid}"]`).first()
await row.scrollIntoViewIfNeeded()
log('rows with iid', await p.evaluate(iid => [...document.querySelectorAll(`[data-iid="${iid}"]`)].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim()), iid))
log('count of list rows for the 3-input', await p.locator(`[data-iid="${iid}"]:visible`).count())
await shotX(p, 'rx1-1-7b-list-desktop')
log('errs', errs)
await browser.close()
