/* His find, 15 Oct 26 (on his iPhone, the preview): "it's much hard to activate the rearrange on the manning counter.
   Compared to the pucks below". Measures, at a phone's size and a desktop's, how much of the screen around each
   Rearrange grip actually starts a drag — a counter row's (the Manning block) beside a man's row's: the grip's own box,
   and a grid of points round the glyph read by `elementFromPoint` (is the point on the grip, or on what?). A counter is
   made first with the war's own ⚙ "+ Counter" form (the demo war comes with none).
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-lw-landing-line/grip node scripts/handpass/grip-reach.mjs */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
for (const size of ['phone', 'desk']) {
  const w = await L.world(size)
  try {
    await L.go(w, 'leavewar'); await w.page.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(800)
    /* a counter, by the war's own form */
    await w.press('[data-testid="settings-open"]'); await L.sleep(500)
    await w.press('[data-testid="counter-add"]'); await L.sleep(500)
    await w.page.locator('[data-testid="cform-name"]').fill('T')
    await w.press('[data-testid="cf-qual-sxo"]'); await L.sleep(150)
    await w.press('[data-testid="cform-save"]'); await L.sleep(700)
    if (await w.page.locator('[data-testid="settings-sheet"]').count()) { await w.page.keyboard.press('Escape'); await L.sleep(300) }
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(700)
    const r = await w.page.evaluate(() => {
      const probe = grip => {
        if (!grip) return null
        const b = grip.getBoundingClientRect()
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2
        const pts = []
        for (let dy = -16; dy <= 16; dy += 4) for (let dx = -16; dx <= 16; dx += 4) {
          const el = document.elementFromPoint(cx + dx, cy + dy)
          pts.push(el === grip || grip.contains(el) ? 'G' : '.')
        }
        const rowsOf = []; for (let i = 0; i < 9; i++) rowsOf.push(pts.slice(i * 9, i * 9 + 9).join(''))
        const onTop = document.elementFromPoint(cx, cy)
        return { box: [Math.round(b.x), Math.round(b.y), +b.width.toFixed(1), +b.height.toFixed(1)], hitsOf81: pts.filter(p => p === 'G').length, map: rowsOf, centreIs: onTop ? (onTop.getAttribute('data-testid') || onTop.className || onTop.tagName) : null, row: grip.closest('tr')?.getBoundingClientRect().height }
      }
      return {
        counter: probe(document.querySelector('#page-leavewar [data-testid^="manning-drag-"]')),
        man: probe(document.querySelector('#page-leavewar .mx-wrap [data-testid^="drag-"]')),
      }
    })
    console.log(`\n[${size}]`, JSON.stringify(r, null, 1))
    await L.pic(w, `grip-${size}`, { around: '#page-leavewar tbody.counts' })
  } catch (e) { console.log('FAIL', String(e).slice(0, 300)) } finally { await L.close(w) }
}
