import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, sleep } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const r = await p.evaluate(() => {
  const out = []
  for (const [id, v] of Object.entries(window.PEOPLE)) {
    if (!['Reaper', 'Anvil', 'Cinch', 'Piston', 'Ranger', 'Saber', 'Sidewinder', 'Warden', 'Drifter', 'Ridge', 'Basher', 'Echo', 'Blade', 'Comet', 'Havoc'].includes(v.cs)) continue
    const ev = d => { try { return window.dayEvents(d, id).length } catch (e) { return 'err' } }
    out.push(`${v.cs}=${id} tue:${ev(1)} sat:${ev(5)} sun:${ev(6)} mon:${ev(0)}`)
  }
  return out
})
console.log(r.join('\n'))
await browser.close()
