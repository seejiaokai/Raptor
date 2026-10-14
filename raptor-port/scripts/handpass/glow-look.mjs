/* THE OTHER PLACES THAT GLOW, DRAWN FOR HIS LOOK (owner D866; `[GLOW-PLACES-LOOK]`). Nothing in the app is changed.
   Each place is drawn on the real Scheduler Board with the app's OWN class on a real element (the state the app itself
   puts it in), its moving part held still at its brightest; then the SAME frame with only the glow taken off — one
   style override per place, printed below. Close-ups at the device's own density, and one wider frame per place with
   a dashed amber box marking where it is (the box is drawn in; it is not the app).
     G1 the landing flash after a drag or an Undo (`.lift-land`) — on a puck's seat and on a whole flying line
     G2 the picked-up look while a row is dragged (`.lift`) — the same glow as G1 (one setting, `--lift-box`)
     G3 the keyboard's ring (`:focus-visible`) — no glow in it today; drawn so he can see that
     G4 a puck lit by a tapped warning (`.puck.wfoc`) — red, amber and grey
     G5 a puck earning OIL in OIL Earn (`.puck.oilglow`)
     G6 a flying line's time boxes lit by its warning (`.badtm.wfoc`)
   usage: DL_BASE=http://localhost:4180 DL_SHOTS=docs/mock/2026-10-15-glow-places node scripts/handpass/glow-look.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { board } from './ou-lib.mjs'

console.log('glow-look v1')
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
const MON = 0

/* the glow taken off, each as ONE override of the app's own rule — the rest of each mark kept as it is */
const NOGLOW = {
  lift: ':root{--lift-box:inset 0 0 0 2px var(--accent)}',
  wfoc: '.puck.wfoc,.puck.wfoc.advf,.puck.wfoc.notef{box-shadow:0 0 0 1px #0B0D10 !important}',
  oil: '.puck.oilglow{box-shadow:0 0 0 2px var(--oil) !important}',
  badtm: '.badtm.wfoc{box-shadow:inset 0 0 0 2px var(--hard) !important}',
}
let sheet = null
const noGlow = async css => { await p.evaluate(c => { let s = document.getElementById('mk-noglow'); if (!s) { s = document.createElement('style'); s.id = 'mk-noglow'; document.head.appendChild(s) } s.textContent = c || '' }, css) }
/* hold every landing flash at its brightest (its first quarter is full strength) */
const HOLD = '.lift-land::after{animation-play-state:paused !important;animation-delay:0s !important}'
/* tag a real element for the frame; returns false when the board has none */
const tag = (sel, n = 0, k = 'a') => p.evaluate(([sel, n, k]) => { const e = document.querySelectorAll(sel)[n]; if (!e) return false; e.setAttribute('data-mk', k); e.scrollIntoView({ block: 'center', inline: 'center' }); return true }, [sel, n, k])
const cls = (k, add, rm = []) => p.evaluate(([k, add, rm]) => document.querySelectorAll(`[data-mk="${k}"]`).forEach(e => { rm.forEach(c => e.classList.remove(c)); add.forEach(c => e.classList.add(c)) }), [k, add, rm])
const untag = () => p.evaluate(() => document.querySelectorAll('[data-mk]').forEach(e => { e.classList.remove('lift-land', 'lift', 'wfoc', 'advf', 'notef', 'oilglow', 'badtm'); e.removeAttribute('data-mk') }))
/* the wider frame's marker: a dashed amber box round the tagged element, drawn in */
const marker = on => p.evaluate(on => {
  document.getElementById('mk-box')?.remove(); if (!on) return
  const r = document.querySelector('[data-mk]').getBoundingClientRect()
  const b = document.createElement('div'); b.id = 'mk-box'
  Object.assign(b.style, { position: 'fixed', left: (r.left - 8) + 'px', top: (r.top - 8) + 'px', width: (r.width + 16) + 'px', height: (r.height + 16) + 'px', border: '2px dashed #FFB020', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none' })
  document.body.appendChild(b)
}, on)
const hideNote = () => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
async function shots(name, glowCss, pad = 28) {
  await hideNote()
  await noGlow(''); await L.sleep(120)
  await L.pic(w, `${name}-today-${T}`, { around: '[data-mk="a"]', pad })
  await noGlow(glowCss); await L.sleep(120)
  await L.pic(w, `${name}-noglow-${T}`, { around: '[data-mk="a"]', pad })
  await noGlow('')
  await marker(true); await L.pic(w, `${name}-where-${T}`); await marker(false)
  /* what the frame shows, measured, so the page can say it in numbers */
  return p.evaluate(() => { const e = document.querySelector('[data-mk="a"]'); const s = getComputedStyle(e), a = getComputedStyle(e, '::after'); return { shadow: s.boxShadow, outline: `${s.outlineWidth} ${s.outlineStyle}`, after: a.content !== 'none' ? a.boxShadow : '' } })
}

try {
  await board(w, MON)
  await p.addStyleTag({ content: HOLD })
  const out = {}
  /* G1 a seat that holds a puck, landed */
  if (await tag('#schedBoard .sb-line [data-slot]:has(.puck)')) { await cls('a', ['lift-land']); out.G1seat = await shots('G1-landing-seat', NOGLOW.lift); await untag() }
  /* G1 a whole flying line, landed (a row moved, or put back by Undo) */
  if (await tag('#schedBoard .sb-line')) { await cls('a', ['lift-land']); out.G1row = await shots('G1-landing-row', NOGLOW.lift, 14); await untag() }
  /* G2 the same line, picked up */
  if (await tag('#schedBoard .sb-line')) { await cls('a', ['lift']); out.G2 = await shots('G2-picked-up', NOGLOW.lift, 14); await untag() }
  /* G3 the keyboard on a button (the app's own focus, shown as the keyboard shows it) */
  if (await tag('#schedBoard .mbtn, #schedBoard .abtn')) {
    await p.evaluate(() => document.querySelector('[data-mk="a"]').focus({ focusVisible: true }))
    out.G3 = await shots('G3-keyboard-ring', '', 18)
    await p.evaluate(() => document.activeElement && document.activeElement.blur()); await untag()
  }
  /* G4 a puck lit by a tapped warning: red (a clash), amber (an advisory), grey (a note) */
  for (const [k, add] of [['red', ['wfoc']], ['amber', ['wfoc', 'advf']], ['grey', ['wfoc', 'notef']]]) {
    if (await tag('#schedBoard .sb-line .puck')) { await cls('a', add); out['G4' + k] = await shots(`G4-warning-${k}`, NOGLOW.wfoc, 22); await untag() }
  }
  /* G5 a puck earning OIL, as OIL Earn draws it */
  if (await tag('#schedBoard .sb-line .puck', 1)) { await cls('a', ['oilglow']); out.G5 = await shots('G5-oil-earn', NOGLOW.oil, 22); await untag() }
  /* G6 a flying line's take-off and landing boxes lit by their warning */
  if (await tag('#schedBoard input.tm[data-bfld$=".to"]')) {
    await p.evaluate(() => { const a = document.querySelector('[data-mk="a"]'); const b = a.parentElement.querySelector('input.tm[data-bfld$=".ld"]'); if (b) b.setAttribute('data-mk', 'b') })
    await cls('a', ['badtm', 'wfoc']); await cls('b', ['badtm', 'wfoc'])
    out.G6 = await shots('G6-time-boxes', NOGLOW.badtm, 40); await untag()
  }
  console.log(JSON.stringify(out, null, 1))
} finally { await L.close(w) }
