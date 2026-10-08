/* WALKER F — keep only the pictures the LATEST run of each walk saved (plus the few the small look scripts saved); report the counts. */
import { readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const j = JSON.parse(readFileSync(resolve(HERE, '../../docs/handpass/parts/cal-F.json'), 'utf8'))
const DIR = resolve(HERE, '../../docs/img/handpass/2026-10-08-inputs-sans-calendar-check/F')
const keep = new Set()
for (const part of Object.values(j.parts)) for (const f of part.pics) keep.add(f)
const lookKeep = /^\d+-(r4|r5|r6|r7|c|single|group|p605c)-/
const files = readdirSync(DIR).filter(f => f.endsWith('.png'))
let del = 0
for (const f of files) { if (!keep.has(f) && !lookKeep.test(f)) { unlinkSync(resolve(DIR, f)); del++ } }
console.log({ before: files.length, deleted: del, after: files.length - del, latestRunsListed: keep.size })
