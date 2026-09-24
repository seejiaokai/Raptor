/* The ring-fix designs for [AMEND-MARK-RING-CLASH], as the build would write them, and the switch that lays one over
   the live page — shared by mk-seat-marks.mjs (the three examples) and mk-seat-marks-busy.mjs (the busy day), so both
   draw exactly the same fix. B (a warning ring — red solid, dashed or dotted, amber or grey — keeps the puck's edge; a
   waiting change on a ringed puck gets a hollow ALn tag) is the fix; A (the mark moved out onto the seat) is kept only for the page's "why not" box.
   design(page, null) puts today's rule back; design(page, B_CSS) lays the fix on. */
export const RINGED = '.puck:is(.warn,.boxred,.boxdash,.boxdot)'
export const B_CSS = `
#eWeek .seat[data-aln] .puck:not(.warn):not(.boxred):not(.boxdash):not(.boxdot),
#schedBoard .seat[data-aln] .puck:not(.warn):not(.boxred):not(.boxdash):not(.boxdot){box-shadow:none;outline:1.5px dotted var(--alc);outline-offset:1px}
#eWeek .seat[data-aln]:has(>${RINGED})::after,#schedBoard .seat[data-aln]:has(>${RINGED})::after{
  content:'AL' attr(data-aln);position:absolute;top:-5px;right:-3px;z-index:4;
  font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;
  padding:0 2px;border-radius:4px;background:#14181D;color:var(--alc);border:1px dotted var(--alc);pointer-events:none}`
export const A_CSS = `
#eWeek .seat[data-aln],#schedBoard .seat[data-aln]{outline:1.5px dotted var(--alc);outline-offset:3px;border-radius:5px}`
export async function design(page, css) {
  await page.evaluate((css) => {
    /* take out today's rule — the pending mark drawn on the puck — keeping it to put back for "today" */
    for (const sh of document.styleSheets) {
      if (sh.ownerNode && sh.ownerNode.id === 'mk-design') continue    // our own sheet, never the app's rule
      let rules; try { rules = sh.cssRules } catch { continue }
      for (let i = rules.length - 1; i >= 0; i--) {
        const r = rules[i]
        if (r.selectorText && /#eWeek \.seat\[data-aln\] \.puck/.test(r.selectorText)) { window.__todayRule = window.__todayRule || r.cssText; sh.deleteRule(i) }
      }
    }
    let st = document.getElementById('mk-design')
    if (!st) { st = document.createElement('style'); st.id = 'mk-design'; document.head.appendChild(st) }
    st.textContent = css == null ? (window.__todayRule || '') : css
  }, css)
  await page.waitForTimeout(120)
}
