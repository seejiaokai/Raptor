import * as F from './fx.mjs'
const { L } = F
console.log('w1 c12-explore v1')
const w = await L.world('phone', { who: ['us', 'us'] })
const p = w.page
try {
  const r = await F.publishSat(w, { crew: true })
  console.log('pub', JSON.stringify(await p.evaluate(() => { const g = window.signOf(5); return { appr: g.appr, cur: g.cur, approved: typeof window.isDayApproved === 'function' ? window.isDayApproved(5) : 'n/a', keys: Object.keys(window).filter(k => /^lw|Approved|signOf/.test(k)) } })))
  await F.toWar(w)
  const a = await p.evaluate(d => window.lwSetCell('plasma', d, 'LL'), F.SAT)
  console.log('member set', a)
  console.log('role fns', await p.evaluate(() => typeof window.lwSetRole))
  await p.evaluate(() => window.lwSetRole('admin')); await L.sleep(500)
  const b = await p.evaluate(d => [window.lwSetCell('plasma', d, 'LL'), window.lwSetCell('bane', d, 'OL')], F.SAT)
  console.log('as admin set', JSON.stringify(b))
  await L.sleep(700)
  console.log('admin sees', await p.evaluate(() => document.querySelectorAll('[data-testid="sync-clashes"]').length))
  await p.evaluate(() => window.lwSetRole('member')); await L.sleep(600)
  console.log('member sees', await p.evaluate(() => document.querySelectorAll('[data-testid="sync-clashes"]').length), 'viewing', await p.evaluate(() => document.querySelector('[data-testid="lw-viewing"]').textContent))
} finally { await L.close(w) }
