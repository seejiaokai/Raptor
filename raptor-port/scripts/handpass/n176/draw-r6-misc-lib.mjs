// draw-r6-misc-lib - round 6's misc drawings (chat 188, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-misc-draw-brief.md):
// shared helpers over ./draw-r5b-lib.mjs. Nothing here writes the app's code.
//  vring      THE ROUND-6 MARK: what is new since round 5, a violet dashed ring - 2px #8B5CF6, 4px clear of the part (the
//             ring's inner edge 4px from the part's box), fixed to the screen, drawn just before the picture.
//  form6      the "+ Add a person" form drawn as round 5 draws it (draw-r5b-form's `form`): the button cloned from Filter in
//             the app's "on" look, the page's own form moved under the People row, its foot the app's own row-foot pair
//             (Save · Cancel measured on an opened row of the page in hand, draw-r5b-lib's rowFootRef / footLikeRow).
//  pairLike   a pair of buttons laid as that measured pair: each button given the measured PLAIN button's metrics (Cancel's),
//             the measured gap between them, tops and baselines on one line.
import { as, W, FACT, wait, usersTab, addButton, openFormInPlace, typeInto, hit, rowFootRef, footLikeRow } from './draw-r5b-lib.mjs'
export * from './draw-r5b-lib.mjs'
export { W6 } from './words-r6-misc.mjs'
export const VIOLET = '#8B5CF6'
export const vring = (s, b, tag = '') => s.page.evaluate(([b, c, tag]) => {
  const d = document.createElement('div'); d.className = '__m6ring'; d.dataset.tag = tag
  Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px dashed ${c}`, outlineOffset: '0', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' })
  document.body.appendChild(d); return { ring: { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }, around: b }
}, [b, VIOLET, tag])
export const unring = s => s.page.evaluate(() => document.querySelectorAll('.__m6ring').forEach(e => e.remove()))
/* the union of boxes */
export const union = (...bs) => { bs = bs.filter(Boolean); const L = Math.min(...bs.map(b => b.x)), T = Math.min(...bs.map(b => b.y)), R = Math.max(...bs.map(b => b.x + b.w)), B = Math.max(...bs.map(b => b.y + b.h)); return { x: L, y: T, w: R - L, h: B - T } }
export const headInView = s => s.page.evaluate(desk => { if (desk) { scrollTo(0, 0); return } const h = document.querySelector('.od-head').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, h.top - bar.bottom - 10) }, s.desk)
export let REF = null
export async function form6(s, who, cs) {
  await as(s, who); await usersTab(s); await wait(s, 400)
  REF = await rowFootRef(s, hit, who === 'kestrel' ? 'osp9' : 'bane'); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
  await addButton(s, W); await openFormInPlace(s, W)
  await s.page.evaluate(() => document.querySelector('#n176add').classList.add('on'))
  const typed = await typeInto(s, '#accAddCs', cs)
  await s.page.evaluate(() => document.activeElement?.blur?.())
  FACT('foot.laid', await footLikeRow(s, REF))
  await headInView(s); await wait(s, 300)
  return typed
}
/* lay the buttons of `sel` (a row of buttons) as the measured plain pair: Cancel's box metrics on each, the gap between */
export const pairLike = (s, sel, ref) => s.page.evaluate(([sel, ref]) => {
  const row = document.querySelector(sel); const bs = [...row.querySelectorAll('button')]
  for (const b of bs) { Object.assign(b.style, ref.cancel); b.style.margin = '0' }
  Object.assign(row.style, { display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: ref.gapBetween + 'px' })
  const base = e => { const sp = document.createElement('span'); sp.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; e.appendChild(sp); const y = Math.round(sp.getBoundingClientRect().top * 10) / 10; sp.remove(); return y }
  return bs.map(b => { const q = b.getBoundingClientRect(); return { words: b.textContent, x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), baseline: base(b), font: getComputedStyle(b).fontSize + ' ' + getComputedStyle(b).fontWeight } })
}, [sel, ref])
/* the box of an element found by a function of the page */
export const boxIn = (s, fn, arg) => s.page.evaluate(([src, arg]) => { const e = (new Function('arg', 'return (' + src + ')(arg)'))(arg); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, [fn.toString(), arg])
