// r4wf-m-look v1 — the merge round's pictures for his look (chat 183, 25 Nov 26): the walk's own pictures, each cut to
// what it is about, main's build beside the merged build, the place ringed and named in plain words. Nothing is
// re-walked here — it only frames pictures the walk already saved. Run from raptor-port/:
//   node scripts/handpass/r4wf-m-look.mjs
import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
console.log('r4wf-m-look v1')
const M = 'docs/img/handpass/2026-11-25-r4-walk-faults/merge'
const OUT = `${M}/look`; mkdirSync(OUT, { recursive: true })
const url = f => 'file:///' + resolve(M, f).replace(/\\/g, '/')
const CSS = `body{margin:0;background:#0b0d12;color:#e8eaf0;font:15px/1.35 system-ui,Segoe UI,Arial,sans-serif;padding:18px}
h1{font-size:18px;margin:0 0 4px}p{margin:0 0 14px;color:#aab1c0}
.pair{display:flex;gap:18px;align-items:flex-start}.col{display:flex;flex-direction:column;gap:14px}
.card{background:#141821;border:1px solid #2a3040;border-radius:10px;padding:10px}
.tag{font-weight:700;font-size:13px;letter-spacing:.04em;margin:0 0 8px}.tag.old{color:#f0b24a}.tag.new{color:#57d08a}
.crop{position:relative;overflow:hidden;border-radius:6px}.crop img{display:block;position:absolute;left:0;top:0}
.ring{position:absolute;border:2px solid #57d08a;border-radius:8px;box-shadow:0 0 0 2px rgba(0,0,0,.6)}.ring.bad{border-color:#f0b24a}
.cap{font-size:13px;color:#c9cfdb;margin:8px 0 0}`
// one framed picture: file, shown width (css px), the crop's height, the picture's vertical offset, rings [x,y,w,h,bad?]
const shot = (f, w, h, top = 0, rings = []) => `<div class="crop" style="width:${w}px;height:${h}px"><img src="${url(f)}" style="width:${w}px;top:${-top}px">${rings.map(r => `<div class="ring${r[4] ? ' bad' : ''}" style="left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px"></div>`).join('')}</div>`
const card = (cls, tag, body, cap) => `<div class="card"><p class="tag ${cls}">${tag}</p>${body}<p class="cap">${cap}</p></div>`
const pages = {
  '1-shared-leave-phone': [`One man's row of a shared leave, at your iPhone's size`, `A leave shared by Ranger and Hex, 08:00–10:00. On Ranger's row: start 0900, end 1100, a remark "own hours". Each change must stay on Ranger's leave.`, 'pair',
    card('old', 'LIVE TODAY (pull request 845 is in)', shot('w3-main-1993bed86-phone-webkit/w3-phone-webkit-caret-left.png', 374, 208, 0, [[18, 76, 340, 62], [18, 145, 340, 60]]), 'Ranger 09:00–11:00 "own hours". Hex still 08:00–10:00, no remark.')
    + card('new', 'THIS BRANCH, WITH MAIN BROUGHT IN', shot('w3-merged-0ff30dbdf-phone-webkit/w3-phone-webkit-caret-left.png', 374, 208, 0, [[18, 76, 340, 62], [18, 145, 340, 60]]), 'The same: Ranger 09:00–11:00 "own hours". Hex untouched.')],
  '2-shared-leave-desktop': [`The same three changes on a desktop`, `Ranger's row of the shared leave on the Scheduler Board's Unavailable list.`, 'col',
    card('old', 'LIVE TODAY', shot('w3-main-1993bed86-desk-chromium/w3-desk-chromium-caret-left.png', 1108, 132, 0, [[36, 68, 900, 30], [36, 99, 900, 30]]), 'Ranger 09:00–11:00 "own hours"; Hex 08:00–10:00.')
    + card('new', 'THIS BRANCH, WITH MAIN BROUGHT IN', shot('w3-merged-0ff30dbdf-desk-chromium/w3-desk-chromium-caret-left.png', 1108, 132, 0, [[36, 68, 900, 30], [36, 99, 900, 30]]), 'The same on the merged build.')],
  '3-other-sections-keep-up': [`What this branch adds: the rest of the Board keeps up while you type`, `An ALL AVAIL meeting 10:00–11:00. Ranger's leave start is changed to 11:30, so he is free for it — and the caret is still in his row.`, 'col',
    card('old', 'LIVE TODAY — the count is one change behind', shot('r4wf-mb/m1-main-desk-chromium/003-m1-2-row-caret-in-ranger.png', 1108, 264, 0, [[548, 134, 30, 26, 1]]), 'Still 35 until you click away from the box.')
    + card('new', 'THIS BRANCH', shot('r4wf-mb/m1-merged-desk-chromium/003-m1-2-row-caret-in-ranger.png', 1108, 264, 0, [[548, 134, 30, 26]]), '36 at once — Ranger counted in, while you are still typing.')],
  '4-long-word-note': [`What this branch adds: a long word stays inside the note`, `Sixty letters with no space typed into a time box on a phone.`, 'col',
    card('old', 'LIVE TODAY — the word runs past the border', shot('r4wf-ma/x10-main-phone-webkit/003-X10-1-note.png', 394, 66, 0, [[340, 14, 54, 26, 1]]), 'The letters run off the right edge.')
    + card('new', 'THIS BRANCH', shot('r4wf-ma/x10-merged-phone-webkit/003-X10-1-note.png', 394, 66, 0, [[330, 14, 46, 26]]), 'The word breaks and stays inside.')],
}
const b = await chromium.launch()
for (const [name, [h, p, lay, body]] of Object.entries(pages)) {
  const ctx = await b.newContext({ viewport: { width: lay === 'pair' ? 850 : 1180, height: 600 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const file = resolve(OUT, name + '.html')
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div id="w" style="display:inline-block"><h1>${h}</h1><p>${p}</p><div class="${lay}">${body}</div></div>`)
  await page.goto('file:///' + file.replace(/\\/g, '/'))
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0))
  await page.locator('#w').screenshot({ path: `${OUT}/${name}.png` })
  console.log('wrote', `${OUT}/${name}.png`)
  await ctx.close()
}
await b.close()
