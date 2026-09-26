/* W1 probe (26 Sep 26): two finger results to explain before they are reported —
   (1) a finger swipe on empty calendar space did not page the month: which pointer events arrive (a pointercancel means
       the browser took the gesture as a page scroll);
   (2) a finger tap on a chip did not open its edit: does the edit open and close again in the same tap?
   Logged for the phone by finger and the desktop by mouse, same build. Diagnosis only; the assertions live in w1-05. */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const W = process.argv[2] || 'phone'
const PH = W === 'phone'
const { browser, page, errors } = await openHi({ width: PH ? 390 : 1440, height: PH ? 844 : 900, who: 'a', dpr: PH ? 3 : 1 })
const cdp = PH ? await L.touchOn(page) : null
await L.calOpen(page, '2026-07')
await page.evaluate(() => {
  window.__ev = []
  const g = document.querySelector('#inpCal .ic-grid')
  for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'touchstart', 'touchend', 'touchcancel'])
    window.addEventListener(t, e => { if (t === 'pointermove' && window.__ev.length && window.__ev[window.__ev.length - 1].startsWith('pointermove')) return; window.__ev.push(`${t}${e.pointerType ? ':' + e.pointerType : ''}@${Math.round(e.clientX ?? (e.changedTouches?.[0]?.clientX) ?? -1)}${e.target && e.target.id ? '#' + e.target.id : e.target && e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''}`) }, true)
  const pop = document.getElementById('inpEditPop')
  new MutationObserver(() => window.__ev.push('DIALOG ' + (pop.hidden ? 'closed' : 'open'))).observe(pop, { attributes: true, attributeFilter: ['hidden'] })
  window.__ta = getComputedStyle(g).touchAction + ' / cell ' + getComputedStyle(document.querySelector('#inpCal [data-icday]')).touchAction
})
console.log('touch-action', await page.evaluate(() => window.__ta))
/* (1) the swipe */
const p = await L.emptyAt(page, '2026-07-08')
if (PH) await L.finger(page, cdp, p, { x: Math.max(8, p.x - 150), y: p.y + 6 }, { steps: 8, stepMs: 16 })
else await L.mouseGesture(page, p, { x: p.x - 150, y: p.y + 6 }, { steps: 8 })
console.log('SWIPE month after:', await L.calMonth(page))
console.log('SWIPE events:', (await page.evaluate(() => { const a = window.__ev; window.__ev = []; return a })).join(' | '))
/* (2) the chip tap: the first chip on 13 Jul */
if ((await L.calMonth(page)) !== 'July 2026') await L.calOpen(page, '2026-07')
const iid = await page.evaluate(() => document.querySelector('#inpCal [data-icday="2026-07-13"] [data-iid]').getAttribute('data-iid'))
/* as w1-05 did: a tap on empty space first (the popover), closed through its own close, THEN the chip */
const e = await L.emptyAt(page, '2026-07-10')
if (PH) await L.finger(page, cdp, e, null, { holdMs: 60 }); else { await page.mouse.click(e.x, e.y); await page.waitForTimeout(500) }
console.log('POP', JSON.stringify(await L.popover(page)))
await page.locator('#icPopClose').click(); await page.waitForTimeout(300)
await page.evaluate(() => { window.__ev = [] })
const c = await L.chipAt(page, iid, '2026-07-13')
if (PH) await L.finger(page, cdp, c, null, { holdMs: 60 })
else { await page.mouse.click(c.x, c.y); await page.waitForTimeout(600) }
console.log('TAP dialog now:', JSON.stringify(await L.addDialog(page)))
console.log('TAP events:', (await page.evaluate(() => { const a = window.__ev; window.__ev = []; return a })).join(' | '))
await L.shot(page, `w1-06-probe-tap-${W}`)
console.log('errors', errors)
await browser.close()
