// sud-w5-move-a3 — moves the first A3 attempt's pictures and results out of the cited final folder into its own labelled
// sub-folder (walk-scripts §5: an earlier attempt is never mixed into the cited run). Prints what it moved.
import { readdirSync, renameSync, mkdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('sud-w5-move-a3 v2')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const F = path.join(HERE, '../../docs/img/handpass/2026-11-23-sans-unfiled/w5/final')
const D = path.join(F, 'a3-attempt1-superseded')
mkdirSync(path.join(D, 'taps'), { recursive: true })
let n = 0
/* files only — the attempt folders' own names start with "a3-" too */
for (const f of readdirSync(F)) if ((/^a3-.*\.png$/.test(f) || f === 'results-a3-a3d_a3p.json') && statSync(path.join(F, f)).isFile()) { renameSync(path.join(F, f), path.join(D, f)); n++ }
if (existsSync(path.join(F, 'taps'))) for (const f of readdirSync(path.join(F, 'taps'))) if (/^a3-/.test(f)) { renameSync(path.join(F, 'taps', f), path.join(D, 'taps', f)); n++ }
console.log('moved', n)
