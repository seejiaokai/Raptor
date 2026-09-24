/* The ring-fix designs for [AMEND-MARK-RING-CLASH], as the build would write them, and the switch that lays one over
   the live page — shared by mk-seat-marks.mjs (the three single examples) and mk-seat-marks-busy.mjs (the busy day), so
   both draw exactly the same fix.
     C — the fix (owner, D92, 24 Sep 26: "why dont u just a do solid AL3 chip and not box up the whole puck?"): an
         amendment on a puck is a TAG in the seat's corner and never a ring — solid once it has gone out (today's tag,
         kept), hollow and dotted while it waits — so the puck's edge carries only its warnings.
     A — the first mock-up's idea (the waiting mark moved out onto the seat), kept only for the page's "why not" box.
   (Design B — keep the waiting dotted line except where a warning ring competes — was shown on 24 Sep 26 and
   superseded the same day by D92; git history has it.)
   design(page, 'today') puts the app's own rules back exactly where they were; any other name lays that design on. */
export const C_CSS = `
#eWeek .seat[data-aln]::after,#schedBoard .seat[data-aln]::after{
  content:'AL' attr(data-aln);position:absolute;top:-5px;right:-3px;z-index:4;
  font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;
  padding:0 2px;border-radius:4px;background:#14181D;color:var(--alc);border:1px dotted var(--alc);pointer-events:none}`
export const A_CSS = `
#eWeek .seat[data-aln],#schedBoard .seat[data-aln]{outline:1.5px dotted var(--alc);outline-offset:3px;border-radius:5px}`
/* which of the app's own rules each design takes out: the waiting mark drawn on the puck (the edit surfaces'
   dotted line) and the published mark drawn on the puck (the ring in the AL's colour) */
export const DESIGNS = {
  today: { drop: [], css: '' },
  A: { drop: ['waiting'], css: A_CSS },
  C: { drop: ['waiting', 'published'], css: C_CSS },
}
export async function design(page, name) {
  await page.evaluate(({ drop, css }) => {
    const RULES = { waiting: /#eWeek \.seat\[data-aln\] \.puck/, published: /^\.seat\[data-alc\] \.puck$/ }
    /* 1. put back whatever an earlier design took out, last-out first, at the very index it came from, so "today"
          is the app's own stylesheet in its own order — a rule re-added at the end would change who wins a tie */
    const del = window.__mkDeleted = window.__mkDeleted || []
    while (del.length) { const e = del.pop(); e.sheet.insertRule(e.text, e.index) }
    /* 2. take out the rules this design replaces (never from our own sheet) */
    for (const sh of document.styleSheets) {
      if (sh.ownerNode && sh.ownerNode.id === 'mk-design') continue
      let rules; try { rules = sh.cssRules } catch { continue }
      for (let i = rules.length - 1; i >= 0; i--) {
        const r = rules[i]
        if (r.selectorText && drop.some(k => RULES[k].test(r.selectorText))) { del.push({ sheet: sh, index: i, text: r.cssText }); sh.deleteRule(i) }
      }
    }
    let st = document.getElementById('mk-design')
    if (!st) { st = document.createElement('style'); st.id = 'mk-design'; document.head.appendChild(st) }
    st.textContent = css
  }, DESIGNS[name])
  await page.waitForTimeout(120)
}
