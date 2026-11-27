// sa208-wB-probe4 — walker B: the sim places drawn on Wed's and Mon's boards (read only), to find the seed OFT EP-4's seat.
// Run from raptor-port/:  SZ=d SA208B_RUN=probe node scripts/handpass/sa208-wB-probe4.mjs
import './sa208-wB-env.mjs'
const B = await import('./scc-w1B-lib.mjs')
const { Z, T, L, J } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wB-probe4 1 · size', SZ)
await T.run('probe4', SZ, Z.scene(async (p, W) => {
  for (const di of [2, 3]) {
    await L.openBoard(p, W, di)
    const s = await p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-slot^="s:${i}."], #schedBoard [data-fill^="s:${i}."]`)].map(e => (e.dataset.slot || e.dataset.fill) + (e.getBoundingClientRect().width > 0 ? '' : '(hidden)') + ' ' + e.className), di)
    W.rec('sims' + di, 'sim places on the board of day ' + di, 'REC', J(s))
    const r = await p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-bfld^="sr:${i}."]`)].map(e => e.dataset.bfld + '=' + e.value + (e.disabled ? '(disabled)' : '') + (e.readOnly ? '(ro)' : '')), di)
    W.rec('boxes' + di, 'sim boxes', 'REC', J(r))
    await L.closeBoard(p, W)
  }
}))
console.log('DONE')
process.exit(0)
