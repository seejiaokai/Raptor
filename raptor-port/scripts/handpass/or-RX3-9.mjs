// RX3-9: PHONE 390x844 - RX3-3's "2 pending" list in the changes window. The fixture (a published Wed, Training for Ranger, a man from a flying seat dragged onto his puck) is made on a DESKTOP context
// through the real controls; its saved browser storage is then opened in a PHONE context (390x844, touch) - the phone is only used to LOOK, the same way the owner's phone looks at the same saved data.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
const d = await L.open('ad', 'a')
const p = d.page
const tr = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: L.ISO, to: L.ISO, timed: ['17:00', '18:00'], title: 'Range drill' }))[0]
const iid = tr.iid
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))
await L.toWeek(p)
const seatSlot = '2.0.0.0.p'
const rid = await L.csId(p, 'Ranger')
const src = L.day(p).locator(`[data-slot="${seatSlot}"] .puck`).first()
await src.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
const ri = await L.rowIdx(p, L.DI, iid)
const tgt = L.day(p).locator(`[data-fill="g:${L.DI}.${ri}.+"] [data-person="${rid}"]`).first()
await L.dragFar(p, src, tgt)
out.inputDesk = await L.inputOf(p, iid); console.log('after swap (desktop): input', j(out.inputDesk))
out.cDesk = await L.counts(p, { noBoard: true }); console.log('desktop counts', L.fmt(out.cDesk))
const state = await d.ctx.storageState()
await d.ctx.close()
// phone
const { ctx, page: q } = await L.open('ad', 'a', { phone: true, storageState: state })
console.log('phone signed in; viewport', j(q.viewportSize()), '| inputs on the phone:', j(await L.inputOf(q, iid)))
await q.evaluate(() => window.go('editsched')); await q.waitForTimeout(900)
await L.shot(q, 'rx3-9-1-phone-edit-schedule')
// find Wednesday's chip
const chipInfo = await q.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')].map((d, i) => ({ i, head: (d.querySelector('.day-head')?.innerText || '').replace(/\s+/g, ' ').slice(0, 40), chip: (d.querySelector('.dstat .dpend')?.textContent || '').trim(), vis: !!d.querySelector('.dstat .dpend')?.offsetParent })))
console.log('day chips on the phone:', j(chipInfo))
out.chips = chipInfo
const day = q.locator('#eWeek .day:not(.peek)').nth(L.DI)
await day.scrollIntoViewIfNeeded().catch(() => {})
const chip = day.locator('.dstat .dpend').first()
await chip.scrollIntoViewIfNeeded(); await q.waitForTimeout(300)
await L.shot(q, 'rx3-9-2-phone-wed-chip')
out.chipText = (await chip.innerText()).trim(); console.log('Wed chip on phone:', out.chipText)
await chip.tap(); await q.waitForTimeout(900)
out.win = await L.winRead(q); console.log('window:', j(out.win))
await L.shot(q, 'rx3-9-3-phone-window-open')
const tog = q.locator('.chgwin .win-tab', { hasText: /To go out/ })
if (await tog.count()) { await tog.first().tap(); await q.waitForTimeout(600) }
out.togo = await q.evaluate(() => ({ head: (document.querySelector('.chgwin .cw-out .pl-head')?.innerText || '').replace(/\s+/g, ' ').trim(), lines: [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()) }))
console.log('TO GO OUT (phone):', j(out.togo))
await L.shot(q, 'rx3-9-4-phone-to-go-out')
// measure: window box, each line box, inside the 390 x 844 screen?
out.boxes = await q.evaluate(() => {
  const vw = innerWidth, vh = innerHeight
  const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return { err: 'no window' }
  const bx = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) } }
  const items = [...w.querySelectorAll('.cw-out .pl-item')].map(i => ({ text: i.innerText.replace(/\s+/g, ' ').trim().slice(0, 80), box: bx(i), scrollW: i.scrollWidth, clientW: i.clientWidth, inside: i.getBoundingClientRect().left >= 0 && i.getBoundingClientRect().right <= vw && i.getBoundingClientRect().bottom <= vh, textCut: i.scrollWidth > i.clientWidth + 1 }))
  const kids = [...w.querySelectorAll('.cw-out .pl-item *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className + ':' + e.textContent.trim().slice(0, 30))
  return { viewport: { vw, vh }, window: bx(w), items, clippedChildren: kids, pageScrollW: document.documentElement.scrollWidth }
})
console.log('BOXES:', j(out.boxes))
// tap each line: where does the view go (after a tap the phone folds the window to a small bar; "Show" brings the list back)
out.taps = []
const n = await q.locator('.chgwin .cw-out .pl-item').count()
for (let i = 0; i < n; i++) {
  if (!(await q.locator('.chgwin .cw-out .pl-item').count())) {
    const show = q.getByRole('button', { name: /^Show/ }).first()
    out.showBar = out.showBar || (await q.evaluate(() => [...document.querySelectorAll('.chgwin, .histbar, [class*=histbar], [class*=chgbar]')].filter(e => e.offsetParent).map(e => e.className.toString().slice(0, 30) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)).slice(0, 4)))
    if (await show.count()) { await show.tap(); await q.waitForTimeout(700) }
    const tg = q.locator('.chgwin .win-tab', { hasText: /To go out/ })
    if (await tg.count()) { await tg.first().tap(); await q.waitForTimeout(500) }
  }
  const l = q.locator('.chgwin .cw-out .pl-item').nth(i)
  const txt = (await l.innerText()).replace(/\s+/g, ' ')
  const m2 = await L.toastMark(q)
  await l.tap(); await q.waitForTimeout(500)
  const f = await L.flash(q)
  await L.shot(q, 'rx3-9-5-phone-tap-line' + i)
  out.taps.push({ txt, toast: await L.toastsSince(q, m2), toastNow: await L.toast(q), flash: f })
  console.log('TAP', i, j(out.taps[i]))
}
console.log('fold bar:', j(out.showBar))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('9', out)
await ctx.close(); await L.browser.close()
