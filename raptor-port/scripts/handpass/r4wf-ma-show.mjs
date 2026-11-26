// r4wf-ma-show — print a walker-A result file's steps briefly: step, store, screen, caret (and any extra keys named)
//   node scripts/handpass/r4wf-ma-show.mjs <result json> [key,key]
import { readFileSync } from 'node:fs'
console.log('r4wf-ma-show v1')
const f = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const extra = (process.argv[3] || '').split(',').filter(Boolean)
for (const r of f.results) {
  console.log(`### ${r.id} ${r.tag} ${r.build}: ${r.verdict}`)
  const w = typeof r.what === 'string' ? { text: r.what } : r.what
  for (const [k, v] of Object.entries(w)) if (k !== 'steps') console.log(`  ${k}: ${JSON.stringify(v).slice(0, 700)}`)
  for (const s of (w.steps || [])) console.log(`  - ${s.step}\n      store ${JSON.stringify(s.store)}\n      screen ${JSON.stringify(s.screen)} caret ${s.caret}${s.note ? ' note "' + s.note + '"' : ''}${extra.map(k => s[k] !== undefined ? `\n      ${k} ${JSON.stringify(s[k]).slice(0, 600)}` : '').join('')}`)
  console.log('  pics', r.pics.join(', '))
}
console.log('errors', JSON.stringify(f.errors))
