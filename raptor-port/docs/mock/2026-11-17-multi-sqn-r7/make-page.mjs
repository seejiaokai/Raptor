// Round 7's page (chat 102): page-src.html + round 6's styles → page.html. Each {{pics:ID|caption}} becomes the desktop
// and phone pictures in img/ whose names start "ID-" (…-d-… and …-p-…). A marker with no picture prints a warning and
// a visible "picture missing" box, so a gap is never silent.
// Run from this folder:  node make-page.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const r6 = readFileSync('../2026-11-17-multi-sqn-r6/page.html', 'utf8')
let head = r6.slice(0, r6.indexOf('<div class="wrap">'))
head = head.replace(/<title>[^<]*<\/title>/, '<title>Two Squadrons · Round 7</title>')
head = head.replace('</style>', `.tag{display:inline-block;font:700 11px/16px system-ui,'Segoe UI',sans-serif;padding:0 6px;border-radius:8px;color:#fff;vertical-align:1px}
.tb{background:#0e7fa6}.tp{background:#ff2d95}
.key{margin:0 0 10px;color:var(--mute);font-size:13.5px}
.other{color:var(--mute);font-weight:600}
.pair{display:grid;grid-template-columns:minmax(0,2.3fr) minmax(0,1fr);gap:10px;margin-top:10px;align-items:start}
.pair.one{grid-template-columns:minmax(0,1fr)}
.miss{border:2px dashed var(--mark);border-radius:8px;padding:10px;color:var(--mark);margin-top:10px}
@media (max-width:640px){.pair{grid-template-columns:1fr}}
</style>`)
const src = readFileSync('page-src.html', 'utf8')
const tail = r6.slice(r6.indexOf('<div id="zoom"'))
const files = readdirSync('img')
let missing = 0
const body = src.replace(/\{\{pics:([^|}]+)\|([^}]*)\}\}/g, (_, id, cap) => {
  const mine = files.filter(f => f.startsWith(id + '-') && f.endsWith('.png')).sort()
  const d = mine.filter(f => /-d-/.test(f)), p = mine.filter(f => /-p-/.test(f))
  if (!d.length && !p.length) { missing++; console.warn('MISSING', id); return `<div class="miss">Picture ${id} missing: ${cap}</div>` }
  const fig = (f, dev) => {
    const today = /today/.test(f)
    return `<figure><img src="img/${f}" alt="${cap}, ${dev}"><figcaption><b>${cap}${today ? ' (today)' : ''}</b> · ${dev}</figcaption></figure>`
  }
  const out = []
  const n = Math.max(d.length, p.length)
  for (let i = 0; i < n; i++) {
    const parts = [d[i] && fig(d[i], 'desktop'), p[i] && fig(p[i], 'phone')].filter(Boolean)
    out.push(`<div class="pair${parts.length === 1 ? ' one' : ''}">${parts.join('')}</div>`)
  }
  return out.join('\n')
})
writeFileSync('page.html', head + body + '\n' + tail)
console.log('page.html written;', missing, 'missing')
