import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
await p.locator('#page-editsched [data-wk="20/07/2026"]:visible').click(); await sleep(1000)
console.log(await p.evaluate(() => {
  const out = []
  for (const [id, v] of Object.entries(window.PEOPLE)) {
    if (!['Reaper', 'Anvil', 'Cinch', 'Piston', 'Ranger', 'Saber', 'Sidewinder', 'Warden'].includes(v.cs)) continue
    const ev = d => { try { return window.dayEvents(d, id).map(e => `${e.k || e.kind}:${e.s}-${e.e}`).join(',') } catch (e) { return 'err' } }
    out.push(`${v.cs}=${id} mon:[${ev(0)}] tue:[${ev(1)}] wed:[${ev(2)}]`)
  }
  return out.join('\n')
}))
await browser.close()
