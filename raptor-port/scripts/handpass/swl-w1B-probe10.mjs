// swl-w1B-probe10 — walker B (chat 203): the Legend's door on Edit Schedule (read only). SWLB_RUN=probe10 SZ=d|p node scripts/handpass/swl-w1B-probe10.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, J } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe10 1 · size', SZ)
await T.run('probe10', SZ, async (p, W) => {
  await L.go(p, 'editsched')
  const r = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => /legend/i.test(e.textContent || '') && [...e.children].every(c => !/legend/i.test(c.textContent || ''))).map(e => { const b = e.getBoundingClientRect(); return `${e.tagName}#${e.id}.${String(e.className).slice(0, 40)} [${(e.textContent || '').trim().slice(0, 40)}] ${Math.round(b.width)}x${Math.round(b.height)} at ${Math.round(b.left)},${Math.round(b.top)} attrs ${[...e.attributes].map(a => a.name).join(',')}` }))
  W.rec('legend', 'every element whose own words name the Legend', 'REC', r.join(' || '))
})
