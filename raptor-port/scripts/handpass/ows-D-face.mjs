/* a close picture of the published face's green OIL edge (View-only Sched), full day then half day */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, W, P, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
await D.flyingWave(p, SAT, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: 'bane' })
await A.publishNew(p, SAT); await A.closeBoard(p)
async function zoom(tag) {
  await A.toWeek(p); await L.go(p, 'viewsched'); await sleep(600); await W.showDay(p, SAT, '#vWeek')
  const info = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const pk = [...d.querySelectorAll('[data-person="bane"]')].find(e => e.offsetParent !== null); if (!pk) return null; pk.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = pk.getBoundingClientRect(); const cs = getComputedStyle(pk); return { cls: pk.className, x: r.x, y: r.y, w: r.width, h: r.height, shadow: cs.boxShadow.slice(0, 120), border: cs.borderLeft } }, SAT)
  await sleep(300)
  const r = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const pk = [...d.querySelectorAll('[data-person="bane"]')].find(e => e.offsetParent !== null); const q = pk.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height } }, SAT)
  const dir = process.env.HP_SHOTS
  const f = `${dir}/dk-zoom-${tag}.png`
  await p.screenshot({ path: f, clip: { x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 20), width: Math.min(300, 1400 - r.x), height: 70 } })
  console.log(tag, JSON.stringify(info))
  D.pics.saved++
  await L.go(p, 'editsched'); await sleep(300)
  return f
}
await zoom('published-fullday')
await A.logicSet(p, 'reportLead', '2h30')
await A.publishAm(p, SAT); await A.closeBoard(p)
await zoom('amended-halfday')
console.log('ERR', JSON.stringify(errors))
await browser.close()
