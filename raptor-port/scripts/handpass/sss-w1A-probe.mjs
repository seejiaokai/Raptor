// sss-w1A-probe — walker A proves the borrowed helpers' first steps on today's build: the bundle, the roster's SANS men,
// + Wave → SC / AVALON / BB on Fri 17 (its boxes, its Flies buttons, its seats), an OFT row with no times (its places),
// a seat armed with Ranger posted out. Run from raptor-port/: SSSA_RUN=probe SZ=d node scripts/handpass/sss-w1A-probe.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { L, W5, Z, RANGER, sleep, J, run, addLine, crewAll, say1, sayAll } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION sss-w1A-probe 1 · ${SZ} · ${process.env.W2_URL} · out ${X.OUT}`)
await run('PR', SZ, async (p, W) => {
  const bundle = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(' '))
  W.rec('bundle', 'the page serves index-CRvIUIHo.js', /index-CRvIUIHo\.js/.test(bundle), bundle)
  const sans = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, q]) => q.san || q.sanFrom).map(([k, q]) => `${k}:${q.cs}:${q.seat || q.role || ''}:${q.sanFrom || ''}`))
  W.rec('sans', 'SANS people in the seed', null, J(sans))
  const r = await Z.post(p, W, RANGER, X.D[17], 'set.post')
  W.rec('post', 'Ranger posted out SANS from Fri 17', null, J(r))
  const days = await p.evaluate(() => window.DAYS.map((d, i) => `${i}:${d.dt}:waves ${d.waves.length} [${d.waves.map(w => w.label + '/' + (w.kind || '')).join(',')}] oft ${(d.sims.oft || []).length} amt ${(d.sims.amt || []).length}`))
  W.rec('days', 'the week', null, J(days))
  const menu = await Z.waveMenu ? null : null
  for (const kind of ['SC', 'AVALON', 'BB']) {
    const a = await addLine(p, W, 4, { kind })
    const wv = await p.evaluate(([i, w]) => JSON.parse(JSON.stringify(window.DAYS[i].waves[w])), [4, a.wi])
    W.rec('wave-' + kind, `+ Wave → ${kind} on Fri 17`, a.wi >= 0, J(wv).slice(0, 1500))
    const dom = await p.evaluate(w => ({
      bfld: [...document.querySelectorAll(`#schedBoard [data-bfld*="4.${w}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.bfld + '=' + (e.value || '') + (e.placeholder ? '(' + e.placeholder + ')' : '')),
      safly: [...document.querySelectorAll(`#schedBoard [data-safly^="4.${w}."]`)].map(e => e.dataset.safly + ':' + e.getAttribute('aria-pressed') + ':' + (e.textContent || '').trim()),
      slots: [...document.querySelectorAll(`#schedBoard [data-slot^="4.${w}."]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.slot),
      other: [...document.querySelectorAll('#schedBoard [data-wv], #schedBoard [data-wvi]')].length,
    }), a.wi)
    W.rec('dom-' + kind, `${kind}: its boxes, Flies buttons, seats`, null, J(dom))
    await W.pic(p, 'wave-' + kind)
  }
  const o = await X.addSimRow(p, W, 4, 'oft', 'PRB OFT')
  W.rec('oft', 'an OFT row, no times', o.ri >= 0, J(o))
  const z = await X.simZones(p, 4, 'oft', o.ri)
  W.rec('oft-zones', 'its places on the board', null, J(z))
  const fl = await p.evaluate(ri => [...document.querySelectorAll(`#schedBoard [data-bfld^="sr:4.oft.${ri}."]`)].map(e => e.dataset.bfld), o.ri)
  W.rec('oft-boxes', 'its boxes', null, J(fl))
  for (const zz of z) {
    const r = await X.armAt(p, W, 4, X.zsel(zz), 'oft-' + zz.replace(/\W+/g, ''))
    W.rec('arm-' + zz, 'armed: Ranger / Jester', null, `armed ${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)} · Jester ${say1(r.c, 'ipman')}`, await W.pic(p, 'arm-' + zz.replace(/\W+/g, '')))
    await X.disarm(p, W)
  }
  await W.pic(p, 'end')
})
X.saveRaw('probe-' + SZ)
process.exit(0)
