import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad/orF'
const out = { walker: 'F', share: 'F — the published day, the counts (desktop 1440x900)', build: 'http://localhost:4186/', cases: {} }
for (const f of readdirSync(SCR).filter(f => /^F\d.*\.json$/.test(f))) out.cases[f.replace('.json', '')] = JSON.parse(readFileSync(`${SCR}/${f}`, 'utf8'))
out.errors = []
for (const f of readdirSync(SCR).filter(f => /^errs-/.test(f))) out.errors.push({ run: f, errs: JSON.parse(readFileSync(`${SCR}/${f}`, 'utf8')) })
writeFileSync('docs/handpass/parts/or-F.json', JSON.stringify(out, null, 1))
console.log(Object.keys(out.cases).join(' '))
