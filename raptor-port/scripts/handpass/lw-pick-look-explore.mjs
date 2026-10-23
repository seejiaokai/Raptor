// lw-pick-look-explore v1 — the drawings of [LW-PICK-HELD-MARK] (his D1289, D1290 and his two questions, 24 Oct 26):
// first look at the one-day bid window's parts and the bubble's markup on the real build, before anything is drawn in.
import * as L from './lw-m3-rewalk-lib.mjs'
console.log('lw-pick-look-explore v1')
const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
console.log('ids', JSON.stringify({ Drifter: ids.Drifter, Saber: ids.Saber, Ranger: ids.Ranger }))
await L.openCellR(w, ids.Drifter, '2026-11-02')
const parts = await P.evaluate(() => {
  const win = document.querySelector('[data-testid="bid-picker"]')
  if (!win) return null
  const box = win.closest('.floatwin, .sheet, [role=dialog]') || win
  const r = box.getBoundingClientRect()
  const rows = [...win.querySelectorAll(':scope > *, :scope > * > *')].slice(0, 40).map(e => { const b = e.getBoundingClientRect(); return `${e.tagName}.${String(e.className).slice(0, 40)} [${e.getAttribute('data-testid') || ''}] y${Math.round(b.top)} h${Math.round(b.height)}` })
  return { box: `${box.tagName}.${String(box.className).slice(0, 60)} y${Math.round(r.top)} h${Math.round(r.height)}`, rows, scrollY: window.scrollY, vh: innerHeight }
})
console.log(JSON.stringify(parts, null, 1))
await P.screenshot({ path: 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-lw-phone-pinch-zoom-3fc08a/84f89913-b550-4648-8408-0f7a9aea102e/scratchpad/morning/explore-1.png', scale: 'css' })
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
