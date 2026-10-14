/* [GUIDE-NO-GLOW] question 6's third look, asked by him (15 Oct 26 — "better to use glow for toggle on and off?"): the
   Leave War's Rearrange button while on, wearing the app's own "on" look for a switch — the filter chip's (`.fchip.on`:
   a pale blue fill, blue words, a blue edge) — with no glow. Nothing in the app is changed; one style override.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-noglow-places node scripts/handpass/noglow-onlook.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk'
const w = await L.world(SIZE), p = w.page
const FILL = '.rtbtn.on{background:rgba(59,198,232,.16) !important;color:var(--accent) !important;border-color:rgba(59,198,232,.6) !important;box-shadow:none !important}'
try {
  await L.go(w, 'leavewar'); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(700)
  await w.press('[data-testid="roster-arrange"]'); await L.sleep(500)
  await p.evaluate(() => { const e = document.querySelector('.rtbtn.on[data-testid="roster-arrange"]'); e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'center', inline: 'center' }); const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  await p.addStyleTag({ content: FILL }); await L.sleep(150)
  await L.pic(w, `N6-rearrange-on-filled-${SIZE}`, { around: '[data-mk="a"]', pad: 22 })
  /* the same button off, for comparison: what "on" has to stand apart from */
  await w.press('[data-testid="roster-arrange"]'); await L.sleep(400)
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await L.sleep(150)
  await L.pic(w, `N6-rearrange-off-${SIZE}`, { around: '[data-testid="roster-arrange"]', pad: 22 })
} finally { await L.close(w) }
