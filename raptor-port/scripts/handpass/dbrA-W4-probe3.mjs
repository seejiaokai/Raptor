/* W4 probe 3 (30 Sep 26) — read-only: each day's board, its Personal Inputs panel and the take-off (Undo) buttons. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const L = await import('./dbrA-lib.mjs')
const H = await import('./am/am-lib.mjs')
const b = await L.launch()
const ctx = await L.context(b)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'editsched')
for (const di of [0, 1, 2]) {
  await H.board(p, di)
  const n = await H.openInputs(p, di)
  console.log('DAY', di, n, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-acc]')].filter(e => e.offsetWidth).map(e => `${e.dataset.acc}|d${e.dataset.accd}|${e.dataset.acck}|${(e.innerText || '').trim()}`))))
  if (di === 0) await L.shot(p, '_probe3-board0')
}
console.log('SIGN', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard select[data-sign]')].map(s => s.getAttribute('data-sign') + ':' + s.getAttribute('data-signday') + ':' + s.options.length + ':' + (s.offsetWidth > 0)))))
console.log('ERR', errors)
await b.close()
