/* RE-WALK W1 probe (26 Sep 26): in rw-w1-05 a quick sideways finger FLICK that started on a chip left that chip's edit
   window OPEN (the first walk's same step opened nothing — then the browser cancelled the sideways finger). Is it the
   flick? Fresh phone world, a finger, the app's own chips; for each flick: which pointer / touch / click events arrive,
   whether the edit window opens, the month, and whether any input changed. Diagnosis only.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w1-15-probe-flick.mjs */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 390, height: 844, who: 'a', dpr: 3 })
const cdp = await L.touchOn(page)
await L.calOpen(page, '2026-07')
await page.evaluate(() => {
  window.__ev = []
  for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'touchstart', 'touchend', 'touchcancel'])
    window.addEventListener(t, e => { if (t === 'pointermove' && window.__ev.length && window.__ev[window.__ev.length - 1].startsWith('pointermove')) return; window.__ev.push(`${t}${e.pointerType ? ':' + e.pointerType : ''}@${Math.round(e.clientX ?? (e.changedTouches?.[0]?.clientX) ?? -1)}${e.target && e.target.id ? '#' + e.target.id : e.target && e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''}`) }, true)
  const pop = document.getElementById('inpEditPop')
  new MutationObserver(() => window.__ev.push('DIALOG ' + (pop.hidden ? 'closed' : 'open'))).observe(pop, { attributes: true, attributeFilter: ['hidden'] })
})
const out = []
const snap = () => page.evaluate(() => JSON.stringify(window.INPUTS.map(x => x.iid + x.date + (x.endDate || '') + x.remarks)))
async function flick(label, day, dx, { steps = 6, stepMs = 12, holdMs = 0, dy = 4 } = {}) {
  if ((await L.calMonth(page)) !== 'July 2026') await L.calOpen(page, '2026-07')
  const iid = await page.evaluate(d => document.querySelector(`#inpCal [data-icday="${d}"] [data-iid]`)?.getAttribute('data-iid'), day)
  const a = await L.chipAt(page, iid, day)
  const n0 = await snap()
  await page.evaluate(() => { window.__ev = [] })
  const g = await L.finger(page, cdp, a, { x: a.x + dx, y: a.y + dy }, { holdMs, steps, stepMs })
  await page.waitForTimeout(500)
  const d = await L.addDialog(page), m = await L.calMonth(page)
  const ev = await page.evaluate(() => window.__ev)
  const n1 = await snap()
  await L.shot(page, `rw-w1-15-${label}`)
  out.push({ label, day, from: { x: Math.round(a.x), y: Math.round(a.y) }, to: Math.round(a.x + dx), dialog: d.open ? d.title : 'closed', month: m, changed: n0 !== n1, ghostInFlight: g.inFlight.ghosts, events: ev.join(' | ') })
  if (d.open) { await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(300) }
}
await flick('mon-chip-left-offscreen', '2026-07-20', -130)          // what rw-w1-05 FLICK-CHIP did (ends off the screen)
await flick('thu-chip-left-onscreen', '2026-07-16', -130)           // ends on the screen
await flick('tue-chip-right', '2026-07-14', 130)
await flick('thu-chip-left-slow', '2026-07-16', -150, { steps: 14, stepMs: 30 })
await flick('thu-chip-left-short60', '2026-07-16', -60)
for (const o of out) console.log(JSON.stringify(o))
console.log('errors', JSON.stringify(errors))
await browser.close()
