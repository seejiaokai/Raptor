// Re-walk item 8: desktop Inputs page: the top row stays one line (calendar and list); the type list offers the three families.
// usage: node lw-m3-rewalk-r8.mjs [width]
import * as L from './lw-m3-rewalk-lib.mjs'
const width = Number(process.argv[2] || 1440)
const tag = `r8-dk${width}`
console.log('lw-m3-rewalk-r8 v1', width, tag)
L.clearPrefix(tag)
const w = await L.newCtx('desktop', 'chromium')
const P = w.page
await P.setViewportSize({ width, height: 900 })
await L.signInPlain(w, 'admin')
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
const geom = () => P.evaluate(() => {
  const q = s => document.querySelector(s)
  const ids = { tabs: '#page-inputs .ib-top, #page-inputs .inputs-tabs', prev: '#icPrev', next: '#icNext', today: '#icToday', cal: '#inCalBtn', list: '#inListBtn', ftype: '#inFType', everyone: '#inFWho, #inFPerson', search: '#inFSearch', gear: '[data-testid="in-gear"]' }
  const out = {}
  for (const [k, s] of Object.entries(ids)) { const e = q(s); if (!e) { out[k] = null; continue }; const r = e.getBoundingClientRect(); out[k] = { x: Math.round(r.left), y: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 && r.height > 0 } }
  return out
})
async function check(view) {
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  const g = await geom()
  const ctl = Object.entries(g).filter(([k, v]) => v && v.vis && k !== 'tabs')
  const tops = ctl.map(([k, v]) => v.y), bots = ctl.map(([k, v]) => v.b)
  // one line = every control's vertical centre inside the tallest control's span
  const centres = ctl.map(([k, v]) => (v.y + v.b) / 2)
  const spread = Math.max(...centres) - Math.min(...centres)
  const maxH = Math.max(...ctl.map(([k, v]) => v.h))
  const oneLine = spread < maxH / 2
  console.log(view, 'controls', JSON.stringify(Object.fromEntries(ctl.map(([k, v]) => [k, `${v.x},${v.y} ${v.w}x${v.h}`]))), 'centre spread', spread.toFixed(1), 'tallest', maxH, 'missing/hidden', JSON.stringify(Object.entries(g).filter(([k, v]) => !v || !v.vis).map(([k]) => k)))
  await L.shot(w, `${tag}-${view}-top`)
  return { oneLine, spread, maxH, ctl: ctl.map(([k]) => k) }
}
await L.press(w, '#inCalBtn'); await P.waitForTimeout(800)
const c = await check('calendar')
L.rec(`8 desktop ${width}: top row one line, Calendar view`, 'desktop', c.oneLine ? 'PASS' : 'FAIL', `controls read: ${c.ctl.join(', ')}; their centres differ by ${c.spread.toFixed(1)} px, the tallest is ${c.maxH} px`, [`${tag}-calendar-top`])
await L.press(w, '#inListBtn'); await P.waitForTimeout(800)
const l = await check('list')
L.rec(`8 desktop ${width}: top row one line, List view`, 'desktop', l.oneLine ? 'PASS' : 'FAIL', `controls read: ${l.ctl.join(', ')}; centres differ by ${l.spread.toFixed(1)} px, the tallest is ${l.maxH} px`, [`${tag}-list-top`])
// the type list
const opts = await P.evaluate(() => [...document.querySelectorAll('#inFType option, #inFType optgroup')].map(o => (o.tagName === 'OPTGROUP' ? '[' + o.label + ']' : o.textContent.trim() + '=' + o.value)))
console.log('type options', JSON.stringify(opts))
const have = ['All leave', 'All medical', 'All duty & commitments'].map(t => opts.some(o => o.startsWith(t + '=')))
await P.locator('#inFType').focus()
await P.screenshot({ path: L.OUT + '/' + tag + '-type-select.png', clip: { x: 0, y: 40, width: Math.min(width, 1200), height: 220 } })
L.rec(`8 desktop ${width}: type list offers the three families`, 'desktop', have.every(Boolean) ? 'PASS' : 'FAIL', `options: ${opts.join(' | ')}`, [`${tag}-type-select`])
// choose each and check what the list shows is not empty (a quick sanity)
for (const [t, v] of [['All leave', 'grp:leave'], ['All medical', 'grp:med'], ['All duty & commitments', 'grp:other']]) {
  await P.locator('#inFType').selectOption(v); await P.waitForTimeout(500)
  const n = await P.evaluate(() => document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs .icard[data-iid]').length)
  console.log(t, 'rows', n)
}
await P.locator('#inFType').selectOption('grp:leave'); await P.waitForTimeout(500)
const cl = await check('list-filtered')
L.rec(`8 desktop ${width}: top row still one line with a type chosen`, 'desktop', cl.oneLine ? 'PASS' : 'FAIL', `centres differ by ${cl.spread.toFixed(1)} px; tallest ${cl.maxH} px`, [`${tag}-list-filtered-top`])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
