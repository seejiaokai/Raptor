/* walker Q — list the exact pixels that differ between two saved pictures (H-02's second pass), with both colours. */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { PNG } = require('playwright-core/lib/utilsBundle')
const D = process.env.HP_SHOTS
for (const [a, b] of [['j2-01-h02b-board-1-unanswered', 'j2-04-h02b-board-2-red'], ['j2-04-h02b-board-2-red', 'j2-07-h02b-board-3-blue'], ['j2-02-h02b-week-1-unanswered', 'j2-05-h02b-week-2-red'], ['j2-05-h02b-week-2-red', 'j2-08-h02b-week-3-blue']]) {
  const A = PNG.sync.read(readFileSync(`${D}/${a}.png`)), B = PNG.sync.read(readFileSync(`${D}/${b}.png`))
  const out = []
  for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
    const i = (y * A.width + x) * 4
    const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2])
    if (d > 12) out.push(`(${x},${y}) rgb(${A.data[i]},${A.data[i + 1]},${A.data[i + 2]}) -> rgb(${B.data[i]},${B.data[i + 1]},${B.data[i + 2]})`)
  }
  console.log(a, 'vs', b, out.length, 'pixels', out.slice(0, 14).join(' | '))
}
