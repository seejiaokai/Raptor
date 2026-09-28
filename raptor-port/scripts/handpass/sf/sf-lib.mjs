/* [SMALL-FIXES] the batch's walk helpers (28 Sep 26). Every walk script here is written as an ASSERTION OF THE RIGHT
   BEHAVIOUR (bug-check order §5, the re-walk): run on `main` it FAILS where the defect is, run on the fixed build it
   passes — so re-running it IS the re-walk. Built on ../am/w2-lib.mjs (open / board / menus / previews / check / note /
   summary). The world is the everything-week (../am/am-fixture.mjs) saved against the port the build is served on.
   Set HP_URL and HP_SHOTS (per walk) BEFORE importing this file: the shared lib reads them at import. */
export * from '../am/w2-lib.mjs'
export const SF_STATE = process.env.SF_STATE
  || 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-trk-smoke-add-race-bug-007eed/ec5a2f8c-43fe-42aa-9bca-0d8136599ee7/scratchpad/sf/week-main.json'
export const SHORT = { width: 1440, height: 700 }
/** the walk's picture folder under this checkout's docs/img/handpass/2026-09-28-small-fixes/<name> */
export const shots = (name) => new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${name}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')

/** Is each button of the board's preview bar reachable — what a finger at its centre lands on? */
export async function barButtons(page) {
  return page.evaluate(() => {
    const bar = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => x.offsetWidth)
    if (!bar) return { bar: null, buttons: [] }
    const r = bar.getBoundingClientRect()
    return { bar: [r.left, r.top, r.right, r.bottom].map(Math.round), buttons: [...bar.querySelectorAll('button')].map(b => {
      const q = b.getBoundingClientRect(); const at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
      return { text: b.innerText.trim(), ok: !!at && (at === b || b.contains(at)),
        by: at && at.closest('.availwin') ? 'the ALL AVAIL window' : at && at.closest('.chgwin') ? 'the changes window' : (at ? String(at.className).slice(0, 40) : 'nothing') }
    }) }
  })
}
/** The shown rect of a floating window ('.availwin' or '.chgwin'), or null. */
export async function winRect(page, sel) {
  return page.evaluate(s => {
    const w = [...document.querySelectorAll(s)].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); if (!w) return null
    const r = w.getBoundingClientRect()
    return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), vh: innerHeight, vw: innerWidth }
  }, sel)
}
