// RX3-2 follow-up: which pucks wear the hollow AL1 tag when Tally is added to a published row (zoomed picture + each seat's markup)
import * as L from './or-RX3-lib.mjs'
const { j } = L
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
await L.signAndPublish(p, L.DI)
await L.toWeek(p)
const seats = async tag => {
  const ri = await L.rowIdx(p, L.DI, iid)
  const r = await p.evaluate(([ri, di]) => {
    const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    const f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`)
    return [...f.querySelectorAll('.seat')].map(s => ({ who: (s.querySelector('.puck .nm')?.textContent || '').trim(), attrs: [...s.attributes].filter(a => a.name !== 'class').map(a => a.name + '=' + a.value.slice(0, 70)).join(' | '), cls: s.className, tagEls: [...s.children].filter(c => !c.classList.contains('puck')).map(c => c.className + ':' + c.textContent.trim()).join(',') }))
  }, [ri, L.DI])
  console.log(tag, j(r))
  return r
}
await seats('pub')
const zoom = async name => { const ri = await L.rowIdx(p, L.DI, iid); await L.toWeek(p); await L.scrollToSec(p, 'ground'); const f = L.day(p).locator(`[data-fill="g:${L.DI}.${ri}.+"]`).first(); const bb = await f.boundingBox(); await p.screenshot({ path: L.OUT + '/' + name + '.png', clip: { x: Math.max(0, bb.x - 20), y: Math.max(0, bb.y - 24), width: bb.width + 260, height: bb.height + 40 } }) }
console.log(await L.takeOffRow(p, 'Drifter', iid))
await seats('drifterOff')
console.log(await L.addOntoRow(p, 'Drifter', iid))
await L.scrollToSec(p, 'ground'); await seats('drifterBack'); await zoom('rx3-2-1d-row-zoom-drifter-back-nopend')
console.log(await L.addOntoRow(p, 'Tally', iid))
await L.scrollToSec(p, 'ground'); await seats('tallyIn-noReload'); await zoom('rx3-2-1e-row-zoom-tally-in-noreload')
console.log(await L.takeOffRow(p, 'Tally', iid))
await seats('tallyOut'); await zoom('rx3-2-1f-row-zoom-tally-out')
await L.reload(p)
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await seats('afterReload'); await zoom('rx3-2-1g-row-zoom-after-reload')
console.log(await L.addOntoRow(p, 'Tally', iid))
await L.scrollToSec(p, 'ground'); await seats('tallyIn-afterReload'); await zoom('rx3-2-1h-row-zoom-tally-in-after-reload')
console.log('ERRORS', L.errs.join(' | ') || 'none')
await ctx.close(); await L.browser.close()
