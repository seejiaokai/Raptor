/* [OIL-CONFIRM-DAYGRID] walk, 17 Oct 26 — a look at the demo world: which inputs the OIL question would ask about over
   several days, and which of them carry no answer yet (the route to the question that waits before a change). */
import { fileURLToPath } from 'node:url'
process.env.HP_SHOTS ||= fileURLToPath(new URL('../../../docs/img/handpass/2026-10-17-oil-confirm-daygrid/', import.meta.url))
const L = await import('../lib.mjs')
const { browser, page } = await L.open({ fresh: true })
const r = await page.evaluate(() => {
  const w = window
  return (w.INPUTS || []).map(x => ({ iid: x.iid, type: x.type, title: x.title, date: x.date, endDate: x.endDate, yr: x.yr, people: (x.people || []).map(p => p.p || p).join('+') || x.person, oil: x.oil ? JSON.stringify(x.oil) : '', cx: !!x.cx, acc: x.acc }))
})
console.log(r.length, 'inputs; several-day ones:')
console.log(JSON.stringify(r.filter(x => x.endDate && x.endDate !== x.date)).slice(0, 5000))
await browser.close()
