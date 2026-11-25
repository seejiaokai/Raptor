// sss-w1B-probe2 — more route proofs (chat 182, walker B): the duty block's "+ Row" menu, every cancel button a standby
// wave draws, a typed B on SC AM and what changes, an SC MAIN seat armed with B typed (Ranger, Jester read).
// Run: SZ=d|p SSSB_RUN=probe2 node scripts/handpass/sss-w1B-probe2.mjs
import './sss-w1B-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./sns-w1B-lib.mjs')
const { T, L, A, RANGER, IPMAN, J, sleep, scene, postR, OUT, path, listOf, meSay } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sss-w1B-probe2 1 · size', SZ)
const SC = {}
SC.p2 = async (p, W) => {
  await postR(p, W, 'p2.post')
  const sc = await A.addLine(p, W, 5, { kind: 'SC' })
  const av = await A.addLine(p, W, 5, { kind: 'AVALON' })
  const cxs = await p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.getBoundingClientRect().width > 0).flatMap(e => Object.keys(e.dataset).filter(k => /cx|del|fly|sa/i.test(k)).map(k => `${k}=${e.dataset[k]} «${(e.textContent || '').trim().slice(0, 14)}» title="${(e.getAttribute('title') || '').slice(0, 50)}"`)))
  W.rec('cx', 'every cx/del/fly button on the board', 'REC', J([...new Set(cxs)].slice(0, 80)))
  /* the duty block's add */
  const dr = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-dradd], #schedBoard [data-dwadd], #schedBoard [data-dutyadd]')].filter(e => e.getBoundingClientRect().width > 0).map(e => JSON.stringify(e.dataset) + ' «' + (e.textContent || '').trim() + '»'))
  W.rec('dradd', 'duty add controls', 'REC', J(dr))
  /* SC MAIN FCP armed with nothing typed (standing by) */
  const r0 = await Y.armB(p, W, 5, `5.${sc.wi}.0.0.p`, 'p2-scmain')
  W.rec('sc0', 'SC MAIN FCP standing by: Ranger / Jester', 'REC', `armed ${r0.armed} · R ${meSay(r0.l)} · J ${meSay(await listOf(p, '#schedBoard', IPMAN))} · ${r0.l && r0.l.head}`, r0.pic)
  await Y.disarm(p, W)
  /* type B on SC AM */
  await L.typeBox(p, W, `[data-bfld="ff:5.${sc.wi}.0.br"]`, '06:30')
  const f = await p.evaluate(w => { const x = window.DAYS[5].waves[w].formations[0]; return JSON.stringify({ br: x.br, rl: x.rl, keys: Object.keys(x) }) }, sc.wi)
  W.rec('br', 'B 06:30 typed on SC AM', 'REC', f, await W.pic(p, 'p2-br'))
  const fl = await p.evaluate(w => [...document.querySelectorAll(`#schedBoard [data-safly^="5.${w}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.dataset.safly}:${e.getAttribute('aria-pressed')}:${e.className}`), sc.wi)
  W.rec('fl', 'SC FLIES buttons after B', 'REC', J(fl))
  const r1 = await Y.armB(p, W, 5, `5.${sc.wi}.0.0.p`, 'p2-scmain-b')
  W.rec('sc1', 'SC MAIN FCP with B typed: Ranger / Jester', 'REC', `armed ${r1.armed} · R ${meSay(r1.l)} · J ${meSay(await listOf(p, '#schedBoard', IPMAN))} · ${r1.l && r1.l.head}`, r1.pic)
  await Y.disarm(p, W)
  const r2 = await Y.armB(p, W, 5, `5.${sc.wi}.0.2.p`, 'p2-scspare-b')
  W.rec('sc2', 'SC SPARE FCP with B typed', 'REC', `armed ${r2.armed} · R ${meSay(r2.l)} · J ${meSay(await listOf(p, '#schedBoard', IPMAN))}`, r2.pic)
  await Y.disarm(p, W)
  /* the + Row menu of the duty block */
  const b = p.locator(L.B('[data-dradd]')).first()
  if (await b.count()) { await W.press(p, b, 'dradd'); await sleep(500); W.rec('drmenu', 'after + Row', 'REC', await p.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves).slice(0, 600)), await W.pic(p, 'p2-dradd')) }
  /* the duty wave add, if any */
  const menu = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.getBoundingClientRect().width > 0 && /duty|desk/i.test(e.textContent || '')).map(e => (e.textContent || '').trim() + ' ' + JSON.stringify(e.dataset)))
  W.rec('dmenu', 'duty buttons', 'REC', J(menu))
}
for (const n of ['p2']) await T.run(n, SZ, scene(SC[n]))
writeFileSync(path.join(OUT, `probe2-${SZ}.json`), JSON.stringify(L.results, null, 1))
