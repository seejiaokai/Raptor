// Builds index.html: round 3's head and style (lines 1–258 of ../2026-11-26-rulings-round3/index.html, its title changed),
// this round's body.html, then round 3's picture viewer and its script — so the two rounds look alike.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const r3 = readFileSync(path.join(HERE, '..', '2026-11-26-rulings-round3', 'index.html'), 'utf8').split('\n')
const end = r3.findIndex(l => l.trim() === '</style>')
const head = r3.slice(0, end + 1).join('\n').replace('<title>Rulings Check Round 3</title>', () => '<title>Rulings Check Round 4</title>')
const lbAt = r3.findIndex(l => l.startsWith('<div class="lb"'))
const tail = r3.slice(lbAt).join('\n')
const body = readFileSync(path.join(HERE, 'body.html'), 'utf8')
writeFileSync(path.join(HERE, 'index.html'), head + '\n\n' + body + '\n\n' + tail)
console.log('index.html written', head.length, body.length, tail.length)
