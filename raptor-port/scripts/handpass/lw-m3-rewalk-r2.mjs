// Re-walk item 2: the one-day window on the phone beside the drawing r9-remarks-bid-phone.png. Row heights measured.
// usage: node lw-m3-rewalk-r2.mjs <phone|desktop> <member|admin>
import * as L from './lw-m3-rewalk-lib.mjs'
const size = process.argv[2] || 'phone', who = process.argv[3] || 'member'
const red = process.argv[4] === 'red'
const tag = `r2-${size === 'phone' ? 'ph' : 'dk'}-${who}${red ? '-red' : ''}`
console.log('lw-m3-rewalk-r2 v1', size, who, tag)
L.clearPrefix(tag)
const w = await L.newCtx(size, 'chromium')
const P = w.page
if (red) { await L.signInPlain(w, 'admin'); console.log('Required P typed through its cell reads', await L.setRequired(w, 'p', '2026-02-20', 28)) }
if (who === 'member') await L.signInPlain(w, 'member', '2026-02-15'); else await L.signInPlain(w, 'admin')
await L.openCellR(w, who === 'member' ? 'bane' : 'bane', '2026-02-20', w.phone ? tag + '-01-celltap-q' : null)
await P.waitForTimeout(400)
await L.shot(w, tag + '-02-window')
const m = await P.evaluate(() => {
  const s = document.querySelector('[data-testid="bid-picker"]')
  const sb = s.getBoundingClientRect()
  const kids = [...s.children].map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { cls: (e.className || '').toString().slice(0, 30), tid: e.dataset.testid || '', y: Math.round(r.top - sb.top), h: Math.round(r.height * 10) / 10, w: Math.round(r.width), border: cs.borderTopWidth + ' ' + cs.borderTopStyle, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 45) } })
  const dl = document.querySelector('[data-testid="bid-dayline"]'); const dlr = dl.getBoundingClientRect(); const dcs = getComputedStyle(dl)
  const grid = document.querySelector('[data-testid="bid-leave-grid"]').getBoundingClientRect()
  const ll = document.querySelector('[data-testid="bid-LL"]').getBoundingClientRect(), fcl = document.querySelector('[data-testid="bid-FCL"]').getBoundingClientRect()
  // the "Which leave" label
  const lab = [...s.querySelectorAll('*')].filter(e => e.children.length === 0 && /^which leave$/i.test(e.textContent.trim()))[0]
  const lr = lab ? lab.getBoundingClientRect() : null
  return { win: { x: Math.round(sb.left), y: Math.round(sb.top), w: Math.round(sb.width), h: Math.round(sb.height) }, kids, dayline: { x: Math.round(dlr.left - sb.left), w: Math.round(dlr.width), h: Math.round(dlr.height), border: dcs.borderTopWidth + ' ' + dcs.borderTopStyle + ' ' + dcs.borderTopColor, radius: dcs.borderTopLeftRadius, bg: dcs.backgroundColor, pad: dcs.padding }, grid: { x: Math.round(grid.left - sb.left), w: Math.round(grid.width), h: Math.round(grid.height) }, row1: { y: Math.round(ll.top), h: Math.round(ll.height), x: Math.round(ll.left), w: Math.round(ll.width) }, row2: { y: Math.round(fcl.top), h: Math.round(fcl.height) }, label: lr && { x: Math.round(lr.left - sb.left), right: Math.round(lr.right - sb.left), y: Math.round(lr.top), h: Math.round(lr.height), text: lab.textContent.trim() }, vp: [innerWidth, innerHeight] }
})
console.log(JSON.stringify(m, null, 1))
// a crop of the window alone for the side-by-side
await P.locator('[data-testid="bid-picker"]').screenshot({ path: L.OUT + '/' + tag + '-03-window-only.png' })
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
