import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const j = JSON.parse(readFileSync(resolve(HERE, '../../docs/handpass/parts/cal-F.json'), 'utf8'))
for (const [name, part] of Object.entries(j.parts)) {
  console.log(`\n### ${name}  (${part.at})  errors: ${part.errors.length}  pics: ${part.pics.length}`)
  for (const r of part.table) {
    const bad = r.saw.split(' · ').filter(x => x.startsWith('NO ')).map(x => x.slice(0, 260))
    console.log(`- ${r.verdict}  ${r.id}${bad.length ? '\n    FAILED CHECKS: ' + bad.join(' || ') : ''}`)
  }
  if (part.errors.length) console.log('  ERRORS: ' + part.errors.slice(0, 5).join(' | '))
}
