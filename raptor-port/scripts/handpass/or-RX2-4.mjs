// RX2-4 (+ RX2-5 LATE part): clock after the cut-off (10 Jul 26); unanswered inputs of two and of six, LATE, phone.
import { open, shot, errs, browser, saveRes, toMonth, openDay, closeDay, dayCardText, sleep, toast } from './or-RX2-lib.mjs'
import { makeUnanswered, brief } from './or-RX2-fix.mjs'
const R = {}
const ISO = '2026-07-18'
const CLOCK = '2026-07-10T09:00:00'
const PHONE = { width: 390, height: 844 }
const d0 = await open('ad', 'a', { fresh: false, dsf: 2, clock: CLOCK })
const two = await makeUnanswered(d0.page, { two: true, title: 'Range brief', timed: ['09:00', '12:00'], rmk: 'Bring your kit' })
const six = await makeUnanswered(d0.page, { two: false, title: 'Range brief', timed: ['13:00', '16:00'], rmk: 'Bring your kit', joins: ['Ranger', 'Sidewinder', 'Talisman', 'Trident', 'Wildcard'] })
R.two = two.log; R.six = six.log
R.inputs = { two: await brief(d0.page, two.iid), six: await brief(d0.page, six.iid) }
R.lateFlags = await d0.page.evaluate(([a, b]) => [a, b].map(id => { const r = window.INPUTS.find(x => x.iid === id); return { late: r.late ?? null, keys: Object.keys(r).join(',') } }), [two.iid, six.iid])
const state = await d0.ctx.storageState({ indexedDB: true })
await d0.ctx.close()

const ph = await open('ad', 'a', { fresh: false, viewport: PHONE, touch: true, dsf: 2, clock: CLOCK, state })
const p = ph.page
const measure = (p, sel) => p.evaluate(sel => {
  const c = document.querySelector(sel); if (!c) return { missing: sel }
  const bx = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) } }
  const tagEl = [...c.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 'OIL?')
  const late = c.querySelector('.sd-late'), hrs = c.querySelector('.icard-hrs'), who = c.querySelector('.icard-who'), kind = c.querySelector('.icard-kind')
  const R = { card: bx(c), late: bx(late), lateText: late ? late.textContent.trim() : null, tag: bx(tagEl), hours: bx(hrs), who: bx(who), kind: bx(kind), whoLines: who ? who.getClientRects().length : null }
  const items = { late: R.late, tag: R.tag, hours: R.hours }
  const inter = (a, b) => a && b && a.x < b.r - .5 && b.x < a.r - .5 && a.y < b.b - .5 && b.y < a.b - .5
  R.overlaps = { lateTag: inter(R.late, R.tag), tagHours: inter(R.tag, R.hours), lateHours: inter(R.late, R.hours), whoTag: inter(R.who && { x: R.who.x, r: R.who.r, y: R.who.y, b: R.who.y + 18 }, R.tag) }
  R.order = R.late && R.tag && R.hours ? (R.late.x < R.tag.x && R.tag.x < R.hours.x ? 'LATE < OIL? < hours (left to right)' : 'WRONG ORDER') : 'missing a part'
  R.sameLine = R.late && R.tag && R.hours ? { lateTagDy: +Math.abs(R.late.y - R.tag.y).toFixed(1), tagHoursDy: +Math.abs(R.tag.y - R.hours.y).toFixed(1) } : null
  const cb = R.card
  const inside = e => e && e.x >= cb.x - .5 && e.r <= cb.r + .5 && e.y >= cb.y - .5 && e.b <= cb.b + .5
  R.inside = { late: inside(R.late), tag: inside(R.tag), hours: inside(R.hours), who: inside(R.who), kind: inside(R.kind), cardInViewport: cb.x >= 0 && cb.r <= innerWidth, scrollW: document.documentElement.scrollWidth, vw: innerWidth }
  R.text = c.innerText.replace(/\s+/g, ' ')
  R.tagTop = tagEl ? 'class=' + tagEl.className : null
  return R
}, sel)
const crop = async (name, sel, pad) => {
  const loc = p.locator(sel).first(); await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const b = await loc.boundingBox()
  const x = Math.max(0, Math.floor(b.x - pad[3])), y = Math.max(0, Math.floor(b.y - pad[0]))
  await shot(p, name, { x, y, width: Math.min(PHONE.width, Math.ceil(b.x + b.width + pad[1])) - x, height: Math.ceil(b.y + b.height + pad[2]) - y })
}
await toMonth(p, ISO); await openDay(p, ISO)
R.dayCards = await dayCardText(p)
await shot(p, 'rx2-4-1-dayopen')
const dc = id => `[data-testid="win-inputsday"] .icard[data-popiid="${id}"]`
R.dayTwo = await measure(p, dc(two.iid)); R.daySix = await measure(p, dc(six.iid))
await crop('rx2-4-2-two-crop', dc(two.iid), [3, 10, 3, 10])
await crop('rx2-4-3-six-crop', dc(six.iid), [3, 10, 3, 10])
// both together, as the mock's crop of the pair
await closeDay(p)
await p.locator('#inListBtn').tap(); await sleep(450)
if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').tap()
await p.locator('#inRangeAll').tap(); await sleep(500)
const lc = id => `.icard[data-iid="${id}"]`
R.listTwo = await measure(p, lc(two.iid)); R.listSix = await measure(p, lc(six.iid))
await crop('rx2-4-4-list-two', lc(two.iid), [34, 10, 12, 10])
await crop('rx2-4-5-list-six', lc(six.iid), [34, 10, 12, 10])
R.errs = errs.slice()
await ph.ctx.close()
saveRes('RX2-4', R)
console.log(JSON.stringify(R, null, 1))
await browser.close()
