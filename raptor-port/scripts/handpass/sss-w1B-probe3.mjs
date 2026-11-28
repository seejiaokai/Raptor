// sss-w1B-probe3 — the phone board's sim row with both seats taken: which element is the "+" extra place (chat 182, walker B)
// Run: SZ=p SSSB_RUN=probe3 node scripts/handpass/sss-w1B-probe3.mjs
import './sss-w1B-env.mjs'
const Z = await import('./sss-w1B-lib.mjs')
const { T, L, W5, Y, J, sleep, place, idOf, OUT } = Z
const SZ = process.env.SZ || 'p'
console.log('VERSION sss-w1B-probe3 1 · size', SZ)
await T.run('p3', SZ, Y.scene(async (p, W) => {
  const m = await W5.addSim(p, W, 6, 'amt', 'B AMT', '', '')
  const ace = await idOf(p, 'Ace'), bas = await idOf(p, 'Basher')
  const s1 = await place(p, W, 6, `[data-slot="s:6.amt.${m.ri}.p"]`, 'p3-a', ace), s2 = await place(p, W, 6, `[data-slot="s:6.amt.${m.ri}.w"]`, 'p3-b', bas)
  W.rec('seats', 'both taken', 'REC', J([s1.placed, s2.placed]))
  await L.openBoard(p, W, 6)
  const d = await p.evaluate(ri => {
    const z = document.querySelector(`#schedBoard [data-fill="s:6.amt.${ri}.+"]`)
    if (!z) return 'no zone'
    const box = e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` }
    return { zone: box(z), html: z.outerHTML.slice(0, 1500), kids: [...z.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName}.${e.className} ${JSON.stringify(e.dataset)} «${(e.textContent || '').trim().slice(0, 12)}» ${box(e)}`) }
  }, m.ri)
  W.rec('dump', 'the zone', 'REC', J(d))
  await W.pic(p, 'p3-row')
}))
