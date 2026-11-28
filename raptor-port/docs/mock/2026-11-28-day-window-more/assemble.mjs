// Builds index.html (chat 199, 28 Nov 26): round 3's questions page head and style (../2026-11-26-rulings-round3/index.html up to </style>, its title changed),
// this page's body.html, then round 3's picture viewer and its script — so the question pages look alike.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const r3 = readFileSync(path.join(HERE, '..', '2026-11-26-rulings-round3', 'index.html'), 'utf8').split('\n')
const end = r3.findIndex(l => l.trim() === '</style>')
const head = r3.slice(0, end + 1).join('\n').replace('<title>Rulings Check Round 3</title>', () => '<title>Day Window Questions</title>')
const lbAt = r3.findIndex(l => l.startsWith('<div class="lb"'))
const tail = r3.slice(lbAt).join('\n')
const body = readFileSync(path.join(HERE, 'body.html'), 'utf8')
writeFileSync(path.join(HERE, 'index.html'), head + '\n\n' + body + '\n\n' + tail)
console.log('index.html written', head.length, body.length, tail.length)
