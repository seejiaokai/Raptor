/* The IT flow guide's screenshots ([IT-FLOW-GUIDE], D410) — taken from the RUNNING app, so the deck can be
   re-shot after a screen changes: build, serve on PORT (default 4185), then
     node scripts/itflow/capture.mjs <outDir> [journey,journey…]
   writes <outDir>/<id>.jpg (2x, cropped) and <outDir>/manifest.json — for each shot its crop and the marks as
   fractions of the picture, which deck.mjs lays over it as editable shapes. Each journey is one file under
   `j/` (its default export takes the shared toolkit from lib.mjs); it starts from a fresh sign-in on `?fresh=1`,
   so no journey leans on another's leftovers. Name journeys (the file names) to re-shoot only those. */
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { open } from './lib.mjs'

const OUT = process.argv[2] || 'itflow-shots'
const ONLY = process.argv[3] ? process.argv[3].split(',') : null
const here = dirname(fileURLToPath(import.meta.url))
const kit = await open(OUT)

for (const f of readdirSync(join(here, 'j')).filter(f => f.endsWith('.mjs')).sort()) {
  const name = f.replace(/\.mjs$/, '')
  if (ONLY && !ONLY.includes(name)) continue
  process.stdout.write(`${name} … `)
  const run = (await import(pathToFileURL(join(here, 'j', f)).href)).default
  await run(kit)
  console.log('ok')
}

/* The manifest is MERGED, so re-shooting one journey keeps every other journey's entries. */
const mf = join(OUT, 'manifest.json')
const prev = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : {}
writeFileSync(mf, JSON.stringify({ ...prev, ...kit.manifest }, null, 1))
console.log('page errors:', kit.errors.length, kit.errors.slice(0, 3))
await kit.close()
