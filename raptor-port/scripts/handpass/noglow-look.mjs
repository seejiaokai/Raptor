/* THE NINE PLACES THAT STILL GLOW, DRAWN FOR HIS LOOK (owner D880; `[GUIDE-NO-GLOW]`,
   docs/superpowers/specs/2026-10-15-guide-no-glow-draft.md). Nothing in the app is changed.
   Each place is drawn in the real app in the state the app itself puts it in — by a real press where one is cheap
   (a puck picked on Edit Schedule, Rearrange pressed, a Tracker search typed), else by the app's OWN class on a real
   element (the Leave War row being dragged over, held still) — then the SAME frame with only the glow taken off: one
   style override per place, printed below. A close-up, and one wider frame with a dashed amber box marking where it
   is (the box is drawn in; it is not the app). The model: glow-look.mjs.
     N1 the green "can take this seat" ring (`.oktake`)          N2 the Leave War's open-bidding box (`.lw-bidbox`)
     N3 the Leave War's "this row is you" seat bar (`tr.me .cs`)   N4 the Tracker's gold and turquoise rings (`.avail`, `.found`)
     N5 today's day card on the week (`.day.today`)               N6 the Leave War's Rearrange button while on (`.rtbtn.on`)
     N7 a SANS puck's purple stripe (`.puck.san::after`)          N8 the Leave War's landing line while a row is dragged
     N9 the Inputs page's old Calendar button (`.title .calview`) — counted only: nothing draws it any more
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-noglow-places node scripts/handpass/noglow-look.mjs [phone|desk] */
import * as L from './dl-lib.mjs'

console.log('noglow-look v7')
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page

/* the glow taken off, each as ONE override of the app's own rule — the rest of each mark kept as it is */
const NOGLOW = {
  oktake: '.oktake{box-shadow:none !important}',
  bidbox: '.mx-wrap .lw-bidbox{box-shadow:none !important}',
  me: '.mx tbody tr.me .who .whoedit .cs{box-shadow:inset 0 0 0 1px var(--accent) !important}',
  trk: '#page-tracker .avail,#page-tracker .found{filter:none !important}',
  today: '.day.today{box-shadow:none !important}',
  rt: '.rtbtn.on{box-shadow:none !important}',
  san: '.puck.san::after{box-shadow:inset 0 0 1px #fff !important}',
  drag: '.mx tbody tr.dragover .who{box-shadow:inset 0 3px 0 var(--accent) !important}',
}
const noGlow = css => p.evaluate(c => { let s = document.getElementById('mk-noglow'); if (!s) { s = document.createElement('style'); s.id = 'mk-noglow'; document.head.appendChild(s) } s.textContent = c || '' }, css)
/* the n-th VISIBLE match — the week is built for more than one page, and a hidden copy has no box to picture */
const tag = (sel, n = 0) => p.evaluate(([sel, n]) => { const e = [...document.querySelectorAll(sel)].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 })[n]; if (!e) return false; e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'center', inline: 'center' }); return true }, [sel, n])
const untag = () => p.evaluate(() => document.querySelectorAll('[data-mk]').forEach(e => e.removeAttribute('data-mk')))
const marker = on => p.evaluate(on => {
  document.getElementById('mk-box')?.remove(); if (!on) return
  const r = document.querySelector('[data-mk]').getBoundingClientRect()
  const b = document.createElement('div'); b.id = 'mk-box'
  Object.assign(b.style, { position: 'fixed', left: (r.left - 8) + 'px', top: (r.top - 8) + 'px', width: (r.width + 16) + 'px', height: (r.height + 16) + 'px', border: '2px dashed #FFB020', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none' })
  document.body.appendChild(b)
}, on)
const hideNote = () => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
async function shots(name, glowCss, pad = 28, clip = null) {
  await hideNote()
  const at = clip ? { clip } : { around: '[data-mk="a"]', pad }
  await noGlow(''); await L.sleep(150)
  await L.pic(w, `${name}-today-${T}`, at)
  await noGlow(glowCss); await L.sleep(150)
  await L.pic(w, `${name}-noglow-${T}`, at)
  await noGlow('')
  await marker(true); await L.pic(w, `${name}-where-${T}`); await marker(false)
  return p.evaluate(() => { const e = document.querySelector('[data-mk="a"]'); const s = getComputedStyle(e); return { shadow: s.boxShadow, filter: s.filter } })
}
const out = {}
async function place(k, fn) { try { out[k] = await fn() } catch (e) { out[k] = 'NOT DRAWN — ' + String(e.message || e).slice(0, 160) } await untag() }

try {
  /* EDIT SCHEDULE: N5 today's card, N7 a SANS puck, N1 the green ring after a real pick */
  await L.go(w, 'editsched')
  /* the card is taller than the screen and its light falls below it: the close-up is the card's foot */
  await place('N5', async () => {
    if (!await tag('.day.today')) throw new Error('no today card on the week')
    const r = await p.evaluate(async () => {
      const e = document.querySelector('[data-mk="a"]'); const sc = e.closest('.week') || document.scrollingElement
      e.scrollIntoView({ block: 'end' }); await new Promise(f => setTimeout(f, 300))
      window.scrollBy(0, e.getBoundingClientRect().bottom - innerHeight * 0.6); await new Promise(f => setTimeout(f, 300))
      const b = e.getBoundingClientRect(); return { x: b.left, w: b.width, bottom: b.bottom }
    })
    const cw = Math.min(w.S.w, r.w + 60), cx = Math.max(0, r.x - 30), cy = Math.max(0, r.bottom - 120)
    return shots('N5-today-card', NOGLOW.today, 0, { x: cx, y: cy, width: Math.min(cw, w.S.w - cx), height: Math.min(w.S.h - cy, 200) })
  })
  await place('N7', async () => { if (!await tag('.puck.san')) throw new Error('no SANS puck'); return shots('N7-sans-stripe', NOGLOW.san, 18) })
  await place('N1', async () => {
    if (!await tag('.puck:not(.san):not(.warn):not(.me)')) throw new Error('no plain puck to pick')
    await w.press('[data-mk="a"]'); await untag(); await L.sleep(500)
    if (!await tag('.oktake')) throw new Error('no seat ringed after the pick')
    const r = await shots('N1-can-take-seat', NOGLOW.oktake, 40)
    await p.keyboard.press('Escape'); await L.sleep(300)
    return r
  })
  out.N9 = { drawnOnSchedule: await p.evaluate(() => document.querySelectorAll('.title .calview').length) }
  await L.go(w, 'inputs'); out.N9.drawnOnInputs = await p.evaluate(() => document.querySelectorAll('.title .calview').length)

  /* LEAVE WAR: N2 the bidding box, N3 his own row's seat bar, N6 Rearrange pressed, N8 a row dragged over */
  await L.go(w, 'leavewar'); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(700)
  /* the box runs the full height of the open days, so its close-up is its top: the dates and the first rows */
  await place('N2', async () => {
    const r = await p.evaluate(async () => {
      const e = document.querySelector('.mx-wrap .lw-bidbox'); if (!e) return null
      e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'start', inline: 'center' })
      await new Promise(f => setTimeout(f, 300))
      window.scrollBy(0, e.getBoundingClientRect().top - 160); await new Promise(f => setTimeout(f, 300))
      const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }
    })
    if (!r) throw new Error('no bidding box')
    /* the box spans every open month, wider than the screen: the close-up is its top edge where the day columns begin
       (its left end sits under the frozen name columns) */
    const left = await p.evaluate(() => { const h = document.querySelector('#page-leavewar .mx thead th:not(.who)'); const c = document.querySelector('#page-leavewar .mx tbody td.who'); return c ? c.getBoundingClientRect().right : 0 })
    const cw = Math.min(w.S.w, w.phone ? 260 : 420), cx = Math.max(0, Math.min(w.S.w - cw, Math.max(r.x, left) - 30)), cy = Math.max(0, r.y - 40)
    return shots('N2-bidding-box', NOGLOW.bidbox, 0, { x: cx, y: cy, width: cw, height: Math.min(w.S.h - cy, 150) })
  })
  await place('N3', async () => { if (!await tag('.mx tbody tr.me .who .whoedit .cs')) throw new Error('no own row'); return shots('N3-own-row', NOGLOW.me, 26) })
  await place('N8', async () => {
    const ok = await p.evaluate(() => { const rows = [...document.querySelectorAll('#page-leavewar .mx tbody tr:not(.me):not(.grp)')].filter(r => r.querySelector('.who')); const r = rows[3] || rows[0]; if (!r) return false; r.classList.add('dragover'); const c = r.querySelector('.who'); c.setAttribute('data-mk', 'a'); c.scrollIntoView({ block: 'center' }); return true })
    if (!ok) throw new Error('no row to drag over')
    const r = await shots('N8-landing-line', NOGLOW.drag, 26)
    await p.evaluate(() => document.querySelectorAll('.mx tbody tr.dragover').forEach(r => r.classList.remove('dragover')))
    return r
  })
  await place('N6', async () => {
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(500)
    if (!await tag('.rtbtn.on[data-testid="roster-arrange"]')) throw new Error('Rearrange did not turn on')
    const r = await shots('N6-rearrange-on', NOGLOW.rt, 22)
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(400)
    return r
  })

  /* TRACKER: N4 the gold "can fly next" ring, and the turquoise ring a real search draws */
  await L.go(w, 'tracker'); await L.sleep(1200)
  await place('N4', async () => {
    const label = await p.evaluate(() => { const c = document.querySelector('#flowSvg .avail'); const g = c && c.closest('g'); const t = g && g.querySelector('text'); return t ? t.textContent.trim() : '' })
    /* on a phone the search box sits behind a tab the chart does not show; there only the gold ring is pictured */
    const box = p.locator('#page-tracker input[placeholder="Find event…"]').first()
    if (label && await box.isVisible()) { await box.fill(label); await p.keyboard.press('Enter'); await L.sleep(700) }
    const hasFound = await p.evaluate(() => document.querySelectorAll('#flowSvg .found').length)
    const sel = hasFound ? '#flowSvg .found' : '#flowSvg .avail'
    const ok = await p.evaluate(sel => { const c = document.querySelector(sel); if (!c) return false; const g = c.closest('g'); g.setAttribute('data-mk', 'a'); g.scrollIntoView({ block: 'center', inline: 'center' }); return true }, sel)
    if (!ok) throw new Error('no ring on the chart')
    const r = await shots('N4-tracker-rings', NOGLOW.trk, 60)
    return { searched: label, foundRing: hasFound, ...r }
  })
  console.log(JSON.stringify(out, null, 1))
} finally { await L.close(w) }
