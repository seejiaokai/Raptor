// RX3-3: a swap from a flying seat onto Ranger's lone Training puck on a published day = 2 pending..
import * as L from './or-RX3-lib.mjs'
import { writeFileSync } from 'node:fs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const tr = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: L.ISO, to: L.ISO, timed: ['17:00', '18:00'], title: 'Range drill' }))[0]
const iid = tr.iid
console.log('filed', j(tr))
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))
out.c0 = await L.counts(p, { noBoard: true }); console.log('COUNTS 0', L.fmt(out.c0))
await L.toWeek(p)
// the flying seats of Wed with a man in them
const seats = await p.evaluate(() => {
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2]
  return [...d.querySelectorAll('[data-slot]')].filter(s => /^2\.\d+\.\d+\.\d+\.[pw]$/.test(s.getAttribute('data-slot')) && s.querySelector('.puck .nm')).map(s => ({ slot: s.getAttribute('data-slot'), who: s.querySelector('.puck .nm').textContent.trim() }))
})
console.log('Wed flying seats with a man:', j(seats))
out.seats = seats
const rid = await L.csId(p, 'Ranger')
let done = null
for (const st of seats) {
  if (st.who === 'Ranger') continue
  await L.toWeek(p)
  const src = L.day(p).locator(`[data-slot="${st.slot}"] .puck`).first()
  await src.scrollIntoViewIfNeeded(); await p.waitForTimeout(250)
  // Ranger's lone puck on the Training row
  const ri = await L.rowIdx(p, L.DI, iid)
  const tgt = L.day(p).locator(`[data-fill="g:${L.DI}.${ri}.+"] [data-person="${rid}"]`).first()
  // both must be on screen: scroll so the target is visible, then drag across (the page scrolls with the mouse near an edge, so use two attempts)
  const sb = await src.boundingBox(); const tb0 = await tgt.boundingBox()
  console.log('try seat', st.slot, st.who, 'src y', Math.round(sb.y), 'tgt y', Math.round(tb0.y))
  const m = await L.toastMark(p)
  await L.dragFar(p, src, tgt)
  const t = await p.evaluate(m => (window.__toasts || []).slice(m).map(x => x.text).join(' || '), m)
  const after = await L.inputOf(p, iid)
  console.log('  toasts:', t, '| input now:', j(after.people))
  if (after.people.join() !== 'Ranger') { done = { seat: st, toast: t, now: after.people }; break }
}
out.swap = done
console.log('SWAP RESULT', j(done), '| input:', j(await L.inputOf(p, iid)))
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx3-3-1-week-after-swap')
out.c1 = await L.counts(p, { keepWin: true }); console.log('COUNTS after swap', L.fmt(out.c1))
await L.shot(p, 'rx3-3-2-to-go-out')
out.togo = await L.winRead(p)
// tap each line, say where the ring lands
out.taps = []
const n = await p.locator('.chgwin .cw-out .pl-item').count()
for (let i = 0; i < n; i++) {
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500)
  const l = p.locator('.chgwin .cw-out .pl-item').nth(i)
  const txt = (await l.innerText()).replace(/\s+/g, ' ')
  const m2 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(300)
  const f = await L.flash(p)
  await p.waitForTimeout(250)
  const nm = await L.shot(p, 'rx3-3-3-tap-line' + i)
  const t = await L.toastsSince(p, m2)
  // which row / seat is under the ring: report the focused/lit element
  const lit = await p.evaluate(() => [...document.querySelectorAll('.ring, .hl, .sel, .pulse, [class*=ring]')].filter(e => e.getClientRects().length && e.closest('#eWeek')).map(e => e.className.toString().slice(0, 30) + ' @ ' + (e.closest('[data-slot]')?.getAttribute('data-slot') || e.closest('[data-fill]')?.getAttribute('data-fill') || '') + ' ' + (e.closest('.puck') || e).innerText.replace(/\s+/g, ' ').slice(0, 40)).slice(0, 8))
  console.log(`TAP line ${i} "${txt}" -> toast="${t}" flash=${j(f)} lit=${j(lit)}`)
  out.taps.push({ txt, toast: t, flash: f, lit, pic: nm })
}
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
// the seat Ranger now sits in
const where = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2]; return [...d.querySelectorAll('[data-slot]')].filter(s => /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(s.getAttribute('data-slot')) && /Ranger/.test(s.innerText)).map(s => s.getAttribute('data-slot')) })
out.rangerSeats = where; console.log('Ranger now in flying seat(s):', j(where), '| training:', j(await L.inputOf(p, iid)))
// publish the amendment
out.pub2 = await L.signAndPublish(p, L.DI); console.log('PUBLISH AMENDMENT', j(out.pub2))
out.c2 = await L.counts(p, { noBoard: true }); console.log('COUNTS after amendment', L.fmt(out.c2))
await L.toView(p)
const vtext = await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; return d ? d.innerText.replace(/\s+/g, ' ') : 'no day' })
out.view = { ranger: [...vtext.matchAll(/.{60}Ranger.{60}/g)].map(m => m[0]), training: (vtext.match(/.{80}RANGE DRILL.{120}/i) || [''])[0] }
console.log('VIEW-ONLY SCHED Wed:', j(out.view))
await p.locator('#vWeek .day:not(.peek)').nth(2).scrollIntoViewIfNeeded()
await L.shot(p, 'rx3-3-4-view-only-top')
const rowV = await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; return [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) })
out.viewGround = rowV; console.log('VIEW ground rows:', j(rowV))
const rangerView = await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; return [...d.querySelectorAll('[data-slot], .seat')].filter(s => /Ranger/.test(s.innerText)).map(s => (s.getAttribute('data-slot') || '') + ' ' + (s.closest('.pl-row, .wave, .fline, tr')?.innerText || '').replace(/\s+/g, ' ').slice(0, 100)) })
out.rangerView = rangerView; console.log('VIEW Ranger places:', j(rangerView))
await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; const r = [...d.querySelectorAll('.puck')].find(x => /Ranger/.test(x.innerText)); if (r) r.scrollIntoView({ block: 'center' }) })
await L.shot(p, 'rx3-3-5-view-only-ranger')
const trainRow = p.locator('#vWeek .day:not(.peek)').nth(2).locator('.sec-grnd .pl-row', { hasText: /range drill/i }).first()
if (await trainRow.count()) { await trainRow.scrollIntoViewIfNeeded(); await L.shot(p, 'rx3-3-5b-view-only-training') }
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('3', out)
await ctx.close(); await L.browser.close()
