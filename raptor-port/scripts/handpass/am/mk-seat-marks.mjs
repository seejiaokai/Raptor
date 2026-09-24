/* THE MOCK-UP for [AMEND-MARK-RING-CLASH] (24 Sep 26, rebuilt the same day at his ask "Can u show me the examples
   of the fix") — pictures of the REAL app (the production build, the everything-week, the app's own stylesheet),
   today beside the fix, from situations the app itself produces:
     1. Monday's night RU line: Piston and Outlaw swap seats (an amendment on a published day). Outlaw's late
        landing breaks his Tuesday crew rest (the dotted red ring, "this day causes it"); Piston is double-booked
        on Monday (the solid red ring).
     2. Bolt comes off Monday's SXO desk at 20:30 (it ended 21:30) and flies Tuesday's 09:40 RU line on a LATE
        SHOW: a crew-rest breach the scheduler sanctioned (the dashed red ring).
     3. A WSO put on Tuesday's afternoon RU line: an everyday change with no warning, to show it is untouched
        (the script picks the first WSO who lands there with no warning of any kind).
   The fix drawn here is design B: a red ring keeps the puck's edge, and a pending change on a ringed puck says
   so with a hollow "ALn" tag in the corner where an issued change keeps its solid one. Design A (the first
   mock-up: the mark moved out onto the seat) is drawn once, for the page's "why not" box.
   The first version of this file drew a mark for a man taken off a seat; he declined it (D91) — git history.
   Usage, with the build served on :4173:
     node mk-seat-marks.mjs desktop 1   the desktop pictures at real size
     node mk-seat-marks.mjs desktop 4   the same, enlarged (the edit week's crew only)
     node mk-seat-marks.mjs phone 3     the phone pictures */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const ZOOM = W === 'desktop' && DPR > 1
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/amend-seat-marks'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishAL, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: DPR })
const TAG = ZOOM ? 'zoom' : W

/* ---- the two designs, as the build would write them ------------------------------------------------------ */
const RINGED = '.puck:is(.boxred,.boxdash,.boxdot)'
const B_CSS = `
#eWeek .seat[data-aln] .puck:not(.boxred):not(.boxdash):not(.boxdot),
#schedBoard .seat[data-aln] .puck:not(.boxred):not(.boxdash):not(.boxdot){box-shadow:none;outline:1.5px dotted var(--alc);outline-offset:1px}
#eWeek .seat[data-aln]:has(>${RINGED})::after,#schedBoard .seat[data-aln]:has(>${RINGED})::after{
  content:'AL' attr(data-aln);position:absolute;top:-5px;right:-3px;z-index:4;
  font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;
  padding:0 2px;border-radius:4px;background:#14181D;color:var(--alc);border:1px dotted var(--alc);pointer-events:none}`
const A_CSS = `
#eWeek .seat[data-aln],#schedBoard .seat[data-aln]{outline:1.5px dotted var(--alc);outline-offset:3px;border-radius:5px}`
async function design(css) {
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
const DESIGNS = { today: null, fix: B_CSS }

/* ---- the situations, made through the app's own write path (the same one a drop or a typed box uses) ---- */
await editWeek(page)
const made = await page.evaluate(() => {
  const D = window.DAYS, P = window.PEOPLE, byCs = cs => Object.keys(P).find(id => P[id].cs === cs)
  const ru = D[0].waves[1].formations[1]
  const piston = ru.aircraft[0].p, outlaw = ru.aircraft[1].p
  window.setSlotVal('0.1.1.0.p', outlaw); window.setSlotVal('0.1.1.1.p', piston)      // 1: the swap
  const bolt = byCs('Bolt')
  window.txtSet('dr:0.1.1.end', '2030')                                              // 2: off the desk at 20:30 …
  window.setSlotVal('1.0.1.0.p', bolt)                                              //    … on Tuesday's 09:40 line
  window.txtSet('fr:1.0.1.0', '1A: NO AAR // LATE SHOW')                            //    … on a sanctioned late show
  /* 3: an everyday change — the first WSO who lands on Tuesday afternoon's RU line with no warning of any kind */
  const was = D[1].waves[1].formations[1].aircraft[1].w
  let hex = null
  for (const id of Object.keys(P)) {
    const q = P[id]; if (q.special || q.pers || q.seat !== 'RCP' || id === was) continue
    window.setSlotVal('1.1.1.1.w', id); window.validate()
    const w = window.WARN, day = k => (w[k] && w[k][1]) || {}
    if (!day('chip')[id] && !day('trace')[id] && !(w.sev && w.sev[1] && w.sev[1][id])) { hex = id; break }
  }
  window.afterSchedMutate()
  return { piston, outlaw, bolt, hex }
})
await page.waitForTimeout(700)
const check = await page.evaluate((m) => {
  const W = window.WARN, cs = id => window.PEOPLE[id].cs
  const seat = k => { const s = document.querySelector(`#eWeek .seat[data-slot="${k}"]`); return s ? `${cs(s.querySelector('.puck').dataset.person)} aln=${s.dataset.aln || '-'} ${s.querySelector('.puck').className}` : 'none' }
  return { outlawTrace: !!(W.trace[0] || {})[m.outlaw], pistonChip: (W.chip[0] || {})[m.piston], boltDash: !!(W.dash[1] || {})[m.bolt],
    boltChip: (W.chip[1] || {})[m.bolt], hex: m.hex && cs(m.hex), hexChip: (W.chip[1] || {})[m.hex] || 'none',
    seats: ['0.1.1.0.p', '0.1.1.1.p', '1.0.1.0.p', '1.1.1.1.w'].map(seat) }
}, made)
console.log(JSON.stringify(check, null, 1))
if (!check.outlawTrace || !check.pistonChip || !check.boltDash || check.hexChip !== 'none') console.log('!! a situation did not come out as intended')

/* ---- the pictures ----------------------------------------------------------------------------------------- */
const CLIPS = {                         // each picture: the seats it is about, and the day they sit on
  mon: { di: 0, keys: ['0.1.1.0.p', '0.1.1.0.w', '0.1.1.1.p', '0.1.1.1.w'] },
  tueam: { di: 1, keys: ['1.0.1.0.p', '1.0.1.0.w', '1.0.1.1.p', '1.0.1.1.w'] },
  tuepm: { di: 1, keys: ['1.1.1.0.p', '1.1.1.0.w', '1.1.1.1.p', '1.1.1.1.w'] },
}
async function shoot(name, scope, keys) {
  const box = await page.evaluate(([scope, keys, zoom]) => {
    const seats = keys.map(k => document.querySelector(`${scope} .seat[data-slot="${k}"]`)).filter(Boolean)
    if (!seats.length) return null
    /* the crew alone when enlarged; the whole line (callsign, times, remarks) at real size */
    const els = zoom ? seats : [...new Set(seats.map(s => s.closest('.form') || s.closest('.sb-line')))]
    els[0].scrollIntoView({ block: 'center', inline: 'center' })
    const rs = els.map(e => e.getBoundingClientRect())
    return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
  }, [scope, keys, ZOOM])
  if (!box) { console.log('NO SEATS', name); return }
  const pad = ZOOM ? 9 : 6
  const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
  const width = Math.min(SIZE.width - x, box.r - box.x + 2 * pad), height = Math.min(SIZE.height - y, box.b - box.y + 2 * pad)
  await page.screenshot({ path: `${OUT}/${TAG}-${name}.png`, clip: { x, y, width, height } })
  console.log('shot', `${TAG}-${name}`)
}
async function weekShots(prefix) {
  for (const [c, { di, keys }] of Object.entries(CLIPS)) {
    for (const [d, css] of Object.entries(DESIGNS)) { await design(css); await shoot(`${prefix}-${c}-${d}`, `#eWeek .day[data-day="${di}"]`, keys) }
  }
}
await weekShots('week')
if (!ZOOM) {
  for (const di of [0, 1]) {
    await board(page, di)
    for (const [c, { di: cd, keys }] of Object.entries(CLIPS)) {
      if (cd !== di) continue
      for (const [d, css] of Object.entries(DESIGNS)) { await design(css); await shoot(`board-${c}-${d}`, '#schedBoard', keys) }
    }
    await closeBoard(page); await editWeek(page)
  }
}
/* design A, for the "why not" box: Outlaw and Piston on the week */
await design(A_CSS); await shoot('week-mon-a', '#eWeek .day[data-day="0"]', CLIPS.mon.keys)
/* once Monday's amendment goes out: the issued marks, which the fix does not touch */
if (!ZOOM) {
  await design(null)
  await editWeek(page)
  await signDay(page, 0)
  console.log('publish', JSON.stringify(await publishAL(page, 0)))
  await editWeek(page)
  await shoot('week-mon-issued', '#eWeek .day[data-day="0"]', CLIPS.mon.keys)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
