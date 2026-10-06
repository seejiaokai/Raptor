import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, ID, CSN, TUE, sleep } = T
const dump = (p, di) => p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return 'no day'
  const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
  const head = d.querySelector('.dhead, .day-head') || d.firstElementChild
  return { head: t(head).slice(0, 260), dpend: [...d.querySelectorAll('.dpend')].map(e => ({ cls: e.className, t: t(e), vis: e.offsetParent !== null })), verchip: [...d.querySelectorAll('.verchip')].map(t), nys: [...d.querySelectorAll('.nysmark')].map(t) } }, di)
const { browser, p, errors } = await K.fresh()
try {
  await Q.seatDays(p, [0, 1])
  console.log('before publish Mon', JSON.stringify(await (async () => { await B.toEdit(p); await W.showDay(p, 0); return dump(p, 0) })()))
  const x = await B.pubOrig(p, 1)
  console.log('published Tue', JSON.stringify(x.r))
  await B.toEdit(p)
  for (const di of [0, 1]) { await W.showDay(p, di); console.log('day', di, JSON.stringify(await dump(p, di)), JSON.stringify(await B.head(p, di))) }
  await T.file(p, { type: 'LL', di: 0, toDi: 1, allday: true, remarks: 'x' })
  await B.toEdit(p)
  for (const di of [0, 1]) { await W.showDay(p, di); console.log('after LL day', di, JSON.stringify(await dump(p, di)), JSON.stringify(await B.head(p, di))) }
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
