// swd-w14c-pics — copies every picture that decides a PASS / FAIL / RECORDED row of the cited runs into the repo's
// picture folder, cropped to what matters: a bell read to the bell's panel (desktop: the top-right 720×440; phone: the top
// 1206×1000 device pixels), an armed-puck or warning-list clip as it is (already cut round its subject), anything else whole.
// Read only on the runs; writes only docs/img/handpass/2026-11-24-sans-words/w14c/. Uses ffmpeg (on his PC).
import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('VERSION swd-w14c-pics 3')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEST = path.resolve(HERE, '../../docs/img/handpass/2026-11-24-sans-words/w14c')
const ROOT = 'D:/raptor-work/c174-walk/w14c'
const CITED = JSON.parse(process.env.W14C_CITED)
mkdirSync(DEST, { recursive: true })
let n = 0
const done = new Set()
for (const [, list] of Object.entries(CITED)) for (const [dir, only] of list) {
  const d = path.join(ROOT, dir)
  if (!existsSync(d)) continue
  for (const f of readdirSync(d).filter(f => /^results-.*-(desktop|phone)\.json$/.test(f) && !/results-all/.test(f))) {
    const rs = JSON.parse(readFileSync(path.join(d, f), 'utf8'))
    if (!rs.length || (only && !only.includes(rs[0].scn))) continue
    for (const r of rs) {
      if (!(r.ok === true || r.ok === false || r.ok === 'REC') || /^set-up/.test(r.what || '') || ['errors', 'today'].includes(r.id)) continue
      const all = String(r.pics || '').split(', ').filter(Boolean)
      /* where a row carries a clip cut round its subject, the whole-screen picture beside it stays on D: only */
      const hasClip = all.some(x => /-clip-/.test(x))
      for (const pic of all) {
        if (hasClip && !/-clip-/.test(pic) && !/tapped|taps\//.test(pic)) continue
        const src = path.join(d, pic)
        const out = path.join(DEST, dir + '__' + path.basename(pic))
        if (done.has(out) || !existsSync(src)) continue
        done.add(out)
        const bellRead = /^lit /.test(String(r.note || '')) && !/-clip-|tapped|taps\//.test(pic)
        if (bellRead) {
          const crop = /-phone\.png$/.test(pic) ? 'crop=1206:1000:0:0' : 'crop=720:440:816:0'
          execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', crop, out])
        } else copyFileSync(src, out)
        n++
      }
    }
  }
}
console.log(`copied ${n} pictures to ${DEST}`)
