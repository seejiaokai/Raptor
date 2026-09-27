/* RE-WALK probe (W2, 26 Sep 26) — why the SECOND palette drag onto the Unavailable row put up no sheet in the desktop
   re-walk (rw-w2-01 A3d, rounds 2+), where the first did. Read-only survey: drives the drag twice with a Cancel between,
   reading the arm state, the drawer, the puck's box and the sheet each time. Usage: node …/rw-w2-00-probe-a3d.mjs */
process.env.AB_WHO = 'rewalk/w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
const ac = await W.fileMed(page, { person: 'snap', type: 'ATT C', from: JUL(16), to: JUL(17), remarks: 'probe Cinch' })
await W.fileMed(page, { person: 'slipway', type: 'HL', from: JUL(17), to: JUL(18), remarks: 'probe Drifter' })
const state = () => page.evaluate(() => ({ arm: (window.ARM && (window.ARM.key || JSON.stringify(window.ARM))) || null, rosOpen: document.body.classList.contains('ros-open'),
  sheet: !!document.querySelector('[data-testid="medclash"]'), sel: document.querySelectorAll('.armed, .sel, .picked').length }))
for (let round = 1; round <= 3; round++) {
  const u = await W.unavRow(page, 4, ac.iid)
  await u.seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const rp = page.locator('.rpuck[data-person="slipway"]:visible').first()
  const n = await rp.count()
  if (!n) { console.log(round, 'NO PUCK', await state()); continue }
  await rp.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await page.waitForTimeout(200)
  const a = await rp.boundingBox(), b = await u.seat.boundingBox()
  const hitA = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${String(e.className).slice(0, 40)}[${e.dataset?.person || ''}]` : null }, [a.x + a.width / 2, a.y + a.height / 2])
  const hitB = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${String(e.className).slice(0, 40)}[${e.dataset?.inpseat || ''}]` : null }, [b.x + b.width / 2, b.y + b.height / 2])
  const s0 = await state()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 8, a.y + a.height / 2 + 4, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 }); await page.waitForTimeout(150)
  const mid = await page.evaluate(() => ({ ghost: document.querySelectorAll('.drag-ghost, .ghost, [class*="ghost"]').length, dragging: document.body.className.slice(0, 120) }))
  await page.mouse.up(); await page.waitForTimeout(800)
  const s1 = await state(), t = await toasts(page)
  await shot(page, `rw-w2-00-probe-a3d-round${round}`)
  console.log(JSON.stringify({ round, a, b, hitA, hitB, s0, mid, s1, toasts: t }))
  if (s1.sheet) await W.confirmCancel(page)
  console.log(JSON.stringify({ round, afterCancel: await state() }))
}
console.log('errors', JSON.stringify(errors.slice(0, 5)))
await browser.close()
