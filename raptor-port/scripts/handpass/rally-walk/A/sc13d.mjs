import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bType, rlBox, rec, errors, bf, bAddFlyingWave } from './lib.mjs'
console.log('sc13d v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, '13d')
await buildSat(p)
await bType(p, rlBox(5, 0, 0), '08:30')
await bAddFlyingWave(p, 5)
await bType(p, bf(5, 1, 0, 'cs'), 'RU'); await bType(p, bf(5, 1, 0, 'to'), '15:00'); await bType(p, bf(5, 1, 0, 'ld'), '16:00')
const grip = await p.evaluate(() => { const l = document.querySelector('#schedBoard [data-bfld="ff:5.0.0.rl"]').closest('.sb-line, .sb-row, tr, div[class*=line]'); const g = l && [...l.querySelectorAll('*')].find(e => /⠿/.test(e.textContent) && e.children.length === 0); return g ? g.outerHTML : (l ? l.outerHTML.slice(0, 300) : 'none') })
console.log('grip', grip)
const pos = await p.evaluate(() => {
  const l = document.querySelector('#schedBoard [data-bfld="ff:5.0.0.rl"]').closest('.sb-line, .sb-row, tr, div[class*=line]')
  const g = [...l.querySelectorAll('*')].find(e => /⠿/.test(e.textContent) && e.children.length === 0)
  const t = document.querySelector('#schedBoard [data-bfld="ff:5.1.0.cs"]').closest('.sb-go, .sb-wave')
  const gb = g.getBoundingClientRect(); const tb = t.getBoundingClientRect()
  return { gx: gb.x + gb.width / 2, gy: gb.y + gb.height / 2, tx: tb.x + 300, ty: document.querySelector('#schedBoard [data-bfld="ff:5.1.0.cs"]').getBoundingClientRect().y + 70 }
})
console.log(JSON.stringify(pos))
await p.mouse.move(pos.gx, pos.gy); await p.mouse.down(); await sleep(150)
for (let i = 1; i <= 12; i++) { await p.mouse.move(pos.gx + (pos.tx - pos.gx) * i / 12, pos.gy + (pos.ty - pos.gy) * i / 12); await sleep(40) }
await p.mouse.move(pos.tx + 5, pos.ty + 6); await sleep(300); await shot(p, 'A13d-dragging'); await p.mouse.up(); await sleep(800)
const w = await p.evaluate(() => window.DAYS[5].waves.map(w => w.formations.map(f => f.cs + ':' + f.rl)))
rec('13', 'desk', 'drag the VL line (R 08:30) from wave 1 to wave 2', 'R goes with the line: VL:08:30 in wave 2', w, JSON.stringify(w).includes('VL:08:30') && w[1] && w[1].some(x => x === 'VL:08:30') ? 'PASS' : 'RECORD', await shot(p, 'A13d-dropped'))
console.log('errors', JSON.stringify(errors)); await b.close()
