/* TEMPORARY — side-by-side pictures of sweep findings: the press marked before and after. Not committed. */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync } from 'node:fs'
const [S, OUT, ...picks] = process.argv.slice(2)
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
for (const pick of picks) {
  const [name, ref] = pick.split('=')
  const [dir, id] = ref.split('/')
  const j = readFileSync(`${S}/${dir}/findings.jsonl`, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).find(x => x.id === id)
  const img = n => 'data:image/jpeg;base64,' + readFileSync(`${S}/${dir}/${id}-${n}.jpg`).toString('base64')
  const phone = dir.endsWith('phone')
  const w = phone ? 390 : 1536
  const ring = (x, y, c, label) => `<div style="position:absolute;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border:3px solid ${c};border-radius:50%;box-sizing:border-box"></div><div style="position:absolute;left:${Math.min(w - 150, Math.max(0, x - 60))}px;top:${y + 26}px;font:700 13px Arial;color:${c};background:#000c;padding:2px 6px;border-radius:4px;white-space:nowrap">${label}</div>`
  const [x, y] = j.at
  const html = `<body style="margin:0;background:#111;display:flex;gap:16px;padding:12px;width:max-content">
  <div><div style="font:700 15px Arial;color:#fff;padding:0 0 6px">Before the tap</div><div style="position:relative;width:${w}px"><img src="${img('a')}" style="width:${w}px;display:block">${ring(x, y, '#3ddc84', 'tap here')}</div></div>
  <div><div style="font:700 15px Arial;color:#fff;padding:0 0 6px">After the tap</div><div style="position:relative;width:${w}px"><img src="${img('b')}" style="width:${w}px;display:block">${ring(x, y, '#ff5252', 'finger is still here')}${j.kind === 'moved' ? ring(x + j.dx, y + j.dy, '#ffd54f', 'the control went here') : ''}</div></div></body>`
  const p = await b.newPage({ viewport: { width: phone ? 860 : 1600, height: 900 }, deviceScaleFactor: phone ? 1.5 : 1 })
  await p.setContent(html)
  await p.locator('body').screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 72 })
  await p.close()
  console.log(name, j.kind, j.dx, j.dy, j.txt)
}
await b.close()
