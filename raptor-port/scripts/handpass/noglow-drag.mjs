/* [GUIDE-NO-GLOW] place 8 by a REAL drag: the Leave War's landing line while a man's row is dragged in Rearrange
   (noglow-look.mjs held the class still and the line did not show on a man's row — this checks what a person sees).
   Desktop, a real mouse: Rearrange on, press a man's grip, move over another man's row, picture it held, put it back.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-noglow-places node scripts/handpass/noglow-drag.mjs */
import * as L from './dl-lib.mjs'
const w = await L.world('desk'), p = w.page
const NOGLOW = '.mx tbody tr.dragover .who{box-shadow:inset 0 3px 0 var(--accent) !important}.mx tbody tr.dragover.after .who{box-shadow:inset 0 -3px 0 var(--accent) !important}'
const noGlow = css => p.evaluate(c => { let s = document.getElementById('mk-noglow'); if (!s) { s = document.createElement('style'); s.id = 'mk-noglow'; document.head.appendChild(s) } s.textContent = c || '' }, css)
try {
  await L.go(w, 'leavewar'); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(700)
  await w.press('[data-testid="roster-arrange"]'); await L.sleep(600)
  /* the grip: the element in a man's name cell that starts a drag — found by what it is, not by guessing a class */
  const pts = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('#page-leavewar .mx tbody tr')].filter(r => r.querySelector('.who .whoedit .cs') && !r.classList.contains('me'))
    const grip = r => [...r.querySelectorAll('.who *')].find(e => /⠿|⋮⋮|::/.test(e.textContent.trim()) && e.children.length === 0) || [...r.querySelectorAll('.who *')].find(e => getComputedStyle(e).cursor === 'grab')
    const a = rows[2], b = rows[6]; if (!a || !b) return null
    const g = grip(a); if (!g) return { err: 'no grip', html: a.querySelector('.who').innerHTML.slice(0, 300) }
    b.scrollIntoView({ block: 'center' })
    const gr = g.getBoundingClientRect(), br = b.querySelector('.who').getBoundingClientRect()
    b.querySelector('.who').setAttribute('data-mk', 'a')
    return { gx: gr.x + gr.width / 2, gy: gr.y + gr.height / 2, bx: br.x + br.width / 2, by: br.y + br.height * 0.3, name: a.querySelector('.cs').textContent, over: b.querySelector('.cs').textContent }
  })
  console.log(JSON.stringify(pts))
  if (!pts || pts.err) throw new Error('no drag: ' + JSON.stringify(pts))
  await p.mouse.move(pts.gx, pts.gy); await p.mouse.down(); await L.sleep(120)
  for (let i = 1; i <= 12; i++) { await p.mouse.move(pts.gx + (pts.bx - pts.gx) * i / 12, pts.gy + (pts.by - pts.gy) * i / 12); await L.sleep(40) }
  await L.sleep(400)
  const st = await p.evaluate(() => { const t = document.querySelector('.mx tbody tr.dragover'); const c = t && t.querySelector('.who'); return t ? { cls: t.className, who: getComputedStyle(c).boxShadow } : 'NO ROW MARKED dragover' })
  console.log('mid-drag:', JSON.stringify(st))
  const tr = await p.evaluate(() => { const t = document.querySelector('.mx tbody tr.dragover'); if (!t) return null; t.setAttribute('data-mk2', 'b'); const r = t.getBoundingClientRect(); return { x: r.x, y: r.y, h: r.height } })
  const clip = tr ? { x: Math.max(0, tr.x), y: Math.max(0, tr.y - 50), width: 640, height: 110 } : null
  await L.pic(w, 'N8-landing-line-today-desk', clip ? { clip } : {})
  await noGlow(NOGLOW); await L.sleep(150)
  await L.pic(w, 'N8-landing-line-noglow-desk', clip ? { clip } : {})
  await noGlow('')
  await L.pic(w, 'N8-landing-line-where-desk')
  /* put it back: Escape, then let go where it started */
  await p.keyboard.press('Escape'); await p.mouse.move(pts.gx, pts.gy); await p.mouse.up(); await L.sleep(300)
} finally { await L.close(w) }
