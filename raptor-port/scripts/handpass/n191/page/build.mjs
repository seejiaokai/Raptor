// build.mjs — assembles one section's mock-up page (chat 191, 26 Nov 26; D2656, D2657) and stages it for publishing.
//   node build.mjs <N>      N = 1..4
// Reads head.html, tail.html and body-s<N>.html here; writes raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/section-<N>.html
// and stages it with every picture it references into the scratch folder given by PUB (default ./pub-s<N>), printing the
// list of published paths. [[cut src|W|H|x0|y0|w|h|alt]] cuts a wide picture to the part that matters (as round 6's build.py).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const N = process.argv[2]
const META = {
  1: ['The guard rail', 'msq-s1-differently', 'Section 1: go, as recommended'],
  2: ['Admin → Users across squadrons', 'msq-s2-differently', 'Section 2: go, as recommended'],
  3: ['The bell, colours and Display', 'msq-s3-differently', 'Section 3: go, as recommended'],
  4: ['The Leave War posting sheet', 'msq-s4-differently', 'Section 4: go, as recommended'],
}[N]
if (!META) throw new Error('section 1..4')
const q3 = path.resolve(here, '../../../../docs/mock/2026-11-25-msq-pick-guard-q3')
const rd = f => fs.readFileSync(path.join(here, f), 'utf8').replace(/\r\n/g, '\n')
const cut = (_, a) => {
  const [src, W, H, x0, y0, w, h, alt] = a.split('|').map(s => s.trim())
  const n = [W, H, x0, y0, w, h].map(Number)
  if (n[2] + n[4] > n[0] + 0.5 || n[3] + n[5] > n[1] + 0.5) throw new Error('cut outside ' + src)
  const st = `width:${(n[0] / n[4] * 100).toFixed(2)}%;margin-left:-${(n[2] / n[4] * 100).toFixed(2)}%;margin-top:-${(n[3] / n[4] * 100).toFixed(2)}%`
  return `<span class="cut" style="aspect-ratio:${n[4]}/${n[5]}"><img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" style="${st}"></span>`
}
let body = rd(`body-s${N}.html`).replace(/\[\[cut ([^\]]+)\]\]/g, cut)
if (body.includes('[[') || body.includes('@@')) throw new Error('unfilled marker in body')
const fill = s => s.split('@@TITLE@@').join(META[0]).split('@@KEY@@').join(META[1]).split('@@SAY@@').join(META[2])
const page = fill(rd('head.html')) + '\n' + body + fill(rd('tail.html'))
const out = path.join(q3, `section-${N}.html`)
fs.writeFileSync(out, page)
// checks: every picture exists, every in-page link has its target
const refs = [...new Set([...page.matchAll(/(?:src|poster)="([^"#]+)(?:#[^"]*)?"/g)].map(m => m[1]).filter(s => !s.startsWith('http')))]
const miss = refs.filter(r => !fs.existsSync(path.join(q3, r)))
const ids = new Set([...page.matchAll(/ id="([^"]+)"/g)].map(m => m[1]))
const dead = [...page.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(h => !ids.has(h))
console.log('bytes', Buffer.byteLength(page), 'pictures', refs.length, 'missing', miss, 'dead links', dead)
if (miss.length || dead.length) process.exitCode = 1
const pub = process.env.PUB || path.join(here, `pub-s${N}`)
fs.rmSync(pub, { recursive: true, force: true }); fs.mkdirSync(pub, { recursive: true })
fs.writeFileSync(path.join(pub, 'page.html'), page)
for (const r of refs) { fs.mkdirSync(path.dirname(path.join(pub, r)), { recursive: true }); if (fs.existsSync(path.join(q3, r))) fs.copyFileSync(path.join(q3, r), path.join(pub, r)) }
fs.writeFileSync(path.join(pub, 'files.json'), JSON.stringify(Object.fromEntries(refs.map(r => [r, r]))))
console.log('staged', pub)
