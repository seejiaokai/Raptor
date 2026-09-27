/* RE-WALK W1 — W1-F3 on the PHONE, by finger (26 Sep 26). The first walk found W1-F3 on the desktop only (its member
   phone walk was not done — sheet §d). Register §12: "A member's calendar does not lift another man's chip, and an
   input he may not change opens READ ONLY — no Delete, no Save, 'Only {callsign} or an admin can change this.'"
   (D166). The member (us = Ranger, person bane) at 390 x 844: widen the Inputs filter to everyone, hold Tally's chip
   on 24 Jul 260 ms and carry it to 27 Jul; tap it; the control — his OWN input (the demo's Appointment on 16 Jul)
   opens with Delete and Save. Written as the RIGHT behaviour (a FAIL is a finding).
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w1-13-member-phone.mjs */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, resultBook, ROOT, toastSpy, toasts, calOpen, chipDays, chipAt, dragLeft, touchOn, finger, fingerDragChip, addDialog } = L
const R = resultBook('RW-W1-13-member-phone', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w1-13-member-phone.txt`)
const { browser, page, errors } = await openHi({ width: 390, height: 844, who: 'm', dpr: 3 })
const cdp = await touchOn(page)
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `rw-w1-13-THREW-${name}`).catch(() => {}) } }
const noGhost = d => d.ghosts === 0 && !d.lit.length && !d.dragging
const dialogRead = () => page.evaluate(() => ({
  ro: (document.querySelector('#inpEditPop [data-testid="inped-ro"]')?.innerText || '').trim(),
  inert: !!document.querySelector('#inpEditPop .inped-body[inert]'),
  buttons: [...document.querySelectorAll('#inpEditPop button')].filter(e => e.offsetWidth || e.offsetHeight).map(e => e.id || (e.innerText || '').trim()),
}))
const closeDialog = async () => { if (await page.locator('#inpEditCancel:visible').count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(300) } }

await step('OTHER-phone', async () => {
  await L.inputsView(page, 'list')
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(400)
  await calOpen(page, '2026-07')
  await shot(page, 'rw-w1-13-member-phone-july')
  const iid = await page.evaluate(() => document.querySelector('#inpCal [data-icday="2026-07-24"] [data-iid]')?.getAttribute('data-iid'))
  const who = await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r && window.PEOPLE[r.person].cs + ' (' + r.person + ')' }, iid)
  const cs = who && who.split(' (')[0]
  await toasts(page)
  const g = await fingerDragChip(page, cdp, iid, '2026-07-24', '2026-07-27', { mid: 'rw-w1-13-other-finger-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, iid)
  R.ck('OTHER-phone-no-lift', g.dragged && g.inFlight.ghosts === 0 && !g.inFlight.lit.length, `${cs}'s chip does not lift under the member's finger (no ghost, no lit day in flight)`, { who, inFlight: g.inFlight })
  R.ck('OTHER-phone-not-moved', days.join() === '2026-07-24' && noGhost(g.after) && !t.some(x => /Moved/.test(x)), 'it stays on 24 Jul; nothing left on screen', { days, after: g.after, t })
  /* a finger TAP on it */
  const c = await chipAt(page, iid, '2026-07-24')
  await finger(page, cdp, c, null, { holdMs: 60 })
  const d = await addDialog(page), r = await dialogRead()
  await shot(page, 'rw-w1-13-other-finger-tap')
  R.ck('OTHER-phone-tap-readonly', d.open && !r.buttons.includes('inpEditDel') && !r.buttons.includes('inpEditSave') && r.ro === `Only ${cs} or an admin can change this.` && r.inert,
    `a finger tap opens ${cs}'s input READ ONLY — no Delete, no Save, "Only ${cs} or an admin can change this."`, { d, r })
  await page.waitForTimeout(600)
  R.ck('OTHER-phone-tap-stays', (await addDialog(page)).open, 'and it stays open (the tap\'s own click does not shut it — W1-F2)', await addDialog(page))
  await closeDialog()
})

await step('OWN-phone', async () => {
  const own = await page.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && /^Jul 1[3-9]$/.test(x.date)).map(x => ({ iid: x.iid, date: x.date, type: x.type })))
  R.note('OWN-demo', own)
  if (!own.length) { R.ck('OWN-phone', false, 'his own July input found', own); return }
  const iso = `2026-07-${own[0].date.slice(4).padStart(2, '0')}`
  await calOpen(page, '2026-07')
  const c = await chipAt(page, own[0].iid, iso)
  await finger(page, cdp, c, null, { holdMs: 60 })
  const d = await addDialog(page), r = await dialogRead()
  await shot(page, 'rw-w1-13-own-finger-tap')
  R.ck('OWN-phone-editable', d.open && r.buttons.includes('inpEditDel') && r.buttons.includes('inpEditSave') && !r.ro && !r.inert, 'the control: a finger tap on his OWN chip opens it with Delete and Save', { d, r })
  await closeDialog()
})

R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
