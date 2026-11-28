// ra-sheets - walker a's look sheets: each run's deciding pictures side by side, so every one is opened. Reads the pictures, writes
// one sheet per run under rewalk/a/sheets/.
import { chromium } from '@playwright/test'
import { readdirSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
console.log('ra-sheets v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../../../docs/handpass/2026-11-24-msq-night-check/rewalk/a'), OUT = resolve(ROOT, 'sheets')
mkdirSync(OUT, { recursive: true })
const want = (process.argv[2] || '').split(',').filter(Boolean)
const skip = /^(t1|ra-00|ra-02|ra-03|ra-04|sheets)|-lvert$|^ra-01-(discard|save)-d-|^ra-01-clean-(d|pc)-lend$/
const runs = readdirSync(ROOT).filter(n => !skip.test(n) && (!want.length || want.some(w => n.startsWith(w))))
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 900 } })
for (const r of runs) {
  const dir = resolve(ROOT, r); if (!existsSync(dir)) continue
  const all = readdirSync(dir).filter(f => f.endsWith('.png') && !/justtapped/.test(f)).sort()
  const pick = /^ra-01/.test(r) ? all.filter(f => /^(02|03|04|05|07)-/.test(f)) : all
  const phone = /-pc(-|$)/.test(r)
  const w = phone ? Math.min(250, Math.floor(1540 / Math.max(pick.length, 1)) - 6) : (pick.length > 4 ? 505 : 760)
  const cells = pick.map(f => `<figure><figcaption>${f.replace('.png', '')}</figcaption><img style="width:${w}px" src="data:image/png;base64,${readFileSync(resolve(dir, f)).toString('base64')}"></figure>`).join('')
  await p.setContent(`<!doctype html><style>body{margin:6px;background:#222;color:#fff;font:13px sans-serif}h1{font-size:14px;margin:2px 0 6px}div{display:flex;flex-wrap:wrap;gap:6px}figure{margin:0}figcaption{padding:2px 0}img{display:block}</style><h1>${r}</h1><div>${cells}</div>`, { waitUntil: 'load' })
  await p.screenshot({ path: resolve(OUT, r + '.png'), fullPage: true })
}
await b.close(); console.log('sheets', runs.length, runs.join(' '))
