/* [TRK-REORDER-FINGER-DRAG] (owner D922, D924), 15 Oct 26: the Tracker's ⇅ Reorder rows dragged by a finger on a phone
   (by the ⠿ grip only) and by a mouse on a desktop (anywhere on the row) — one look: the carried row ringed, ONE landing
   line in the gap, the landed row flashing; "Drag a row, or use ▲/▼." gone.
     R — the Syllabus order window: down, up, one line a gap, the last row's foot, its own place, Cancel, Save order
         (read back from the Syllabus dropdown), the ▲ ▼ beside the drag, a finger elsewhere on the row, Escape.
     E — the Crew order window made long by the app's own "+ Add" (students picked from the squadron roster): a row carried
         to the list's foot scrolls it and lands out of the first view; a finger elsewhere scrolls the list.
   By REAL input — a mouse on the desktop, Chromium's own touch events (CDP) on a phone. Assertions of the RIGHT behaviour
   (a PASS means correct), so a re-run is the re-walk.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-trk-reorder-drag/walk node scripts/handpass/trd-walk.mjs [desk|phone] */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

console.log('trd-walk v2')
mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }
const SIZES = process.argv[2] ? [process.argv[2]] : ['desk', 'phone']

/* one pointer, the way a person moves it — a finger rests ~90ms before it lifts (walk-scripts §4) */
async function hand(w) {
  const p = w.page
  if (!w.phone) {
    let at = { x: 0, y: 0 }
    return {
      down: async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); at = { x, y }; await L.sleep(60) },
      to: async (x, y, steps = 10) => { for (let i = 1; i <= steps; i++) { await p.mouse.move(at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(20) } at = { x, y }; await L.sleep(60) },
      up: async () => { await p.mouse.up(); await L.sleep(60) },
    }
  }
  const cdp = await w.ctx.newCDPSession(p)
  let at = { x: 0, y: 0 }
  const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  return {
    down: async (x, y) => { await t('touchStart', x, y); at = { x, y }; await L.sleep(60) },
    to: async (x, y, steps = 10) => { for (let i = 1; i <= steps; i++) { await t('touchMove', at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(20) } at = { x, y }; await L.sleep(90) },
    up: async () => { await t('touchEnd'); await L.sleep(60) },
  }
}
const names = p => p.evaluate(() => [...document.querySelectorAll('#ordList .ordrow .onm')].map(e => e.textContent))
const marks = p => p.evaluate(() => [...document.querySelectorAll('#ordList .ordrow')].map((r, i) => ({ i, dragging: r.classList.contains('dragging'), over: r.classList.contains('dragover'), after: r.classList.contains('after'), land: r.classList.contains('lift-land'), shadow: getComputedStyle(r).boxShadow })))
const lineOn = async p => (await marks(p)).filter(m => m.over).map(m => m.i + (m.after ? ' foot' : ' top'))
/* the point a carry starts from: a phone's grip, a desktop's row name */
const startOf = (p, i, phone) => p.evaluate(({ i, phone }) => {
  const r = document.querySelectorAll('#ordList .ordrow')[i]; if (!r) return null
  const el = phone ? r.querySelector('.grip') : r.querySelector('.onm'); const b = el.getBoundingClientRect()
  return { x: phone ? b.x + b.width / 2 : b.x + 20, y: b.y + b.height / 2 }
}, { i, phone })
/* a point inside row i at a fraction of its height, on its name */
const rowAt = (p, i, frac) => p.evaluate(({ i, frac }) => {
  const r = document.querySelectorAll('#ordList .ordrow')[i]; if (!r) return null
  const b = r.getBoundingClientRect(); return { x: b.x + 60, y: b.y + b.height * frac }
}, { i, frac })

async function openSyl(w) {
  const p = w.page
  await w.press('#sylMenuBtn'); await L.sleep(250)
  await w.press('#ordSyl'); await p.waitForSelector('#ordModal #ordList .ordrow'); await L.sleep(300)
  return p.evaluate(() => document.querySelector('#ordModal').getAttribute('data-ord'))
}
const closeOrd = async w => { if (await w.page.locator('#ordModal').count()) { await w.press('#ordCancel'); await L.sleep(250) } }
const sylOptions = p => p.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => o.textContent.trim()).filter(Boolean))

async function sylWalk(w, size) {
  const p = w.page
  const H = await hand(w)
  const mode = await openSyl(w)
  ok(size, 'R0: ⇅ Reorder syllabi opens the Syllabus order window', mode === 'syllabus', `data-ord=${mode}`)
  const grips = await p.evaluate(() => [...document.querySelectorAll('#ordList .ordrow .grip')].map(g => g.textContent))
  ok(size, 'R1: every row\'s grip is ⠿', grips.length > 1 && grips.every(g => g === '⠿'), grips.join(' '))
  const note = await p.evaluate(() => document.querySelector('#ordModal .mini').textContent)
  ok(size, 'R1: "Drag a row, or use ▲/▼." is gone; the window\'s own sentence stays', !/Drag a row/.test(note) && /sets the order of the Syllabus dropdown/.test(note), note)
  const draggable = await p.evaluate(() => document.querySelectorAll('#ordList [draggable="true"]').length)
  ok(size, 'R1: no row is a browser drag (the old box cannot appear)', draggable === 0, `draggable rows: ${draggable}`)
  if (w.phone) {
    const gb = await p.evaluate(() => { const g = document.querySelector('#ordList .ordrow .grip'), r = g.closest('.ordrow').getBoundingClientRect(), b = g.getBoundingClientRect(), cs = getComputedStyle(g); return { w: Math.round(b.width), h: Math.round(b.height), inside: b.top >= r.top - 0.5 && b.bottom <= r.bottom + 0.5, ta: cs.touchAction } })
    ok(size, 'R1: the grip\'s touch area is a thumb\'s (about 22 x 36), inside its own row, and takes the finger (touch-action none)', gb.w >= 20 && gb.h >= 34 && gb.inside && gb.ta === 'none', JSON.stringify(gb))
  }
  const n0 = await names(p)
  await L.pic(w, `R1-open-${size}`, { around: '#ordModal' })

  /* R2 — row 1 carried down over row 3's upper half: ring on row 1, ONE line on row 3's top */
  let s = await startOf(p, 0, w.phone)
  await H.down(s.x, s.y)
  let t = await rowAt(p, 2, .25); await H.to(t.x, t.y)
  let m = await marks(p)
  ok(size, 'R2: the carried row wears the lift ring', m[0].dragging && /inset/.test(m[0].shadow), m[0].shadow)
  ok(size, 'R2: ONE landing line, on the third row\'s top edge', JSON.stringify(await lineOn(p)) === JSON.stringify(['2 top']), (await lineOn(p)).join(','))
  ok(size, 'R2: the line is the accent, 2px at the top (inset 0 2px)', /rgb\(59, 198, 232\) 0px 2px 0px 0px inset/.test(m[2].shadow), m[2].shadow)
  await L.pic(w, `R2-carrying-${size}`, { around: '#ordModal' })
  /* R3 — the second row's lower half: the same gap, the same single line */
  t = await rowAt(p, 1, .8); await H.to(t.x, t.y)
  ok(size, 'R3: the second row\'s lower half draws the SAME line (third row\'s top), not a second one', JSON.stringify(await lineOn(p)) === JSON.stringify(['2 top']), (await lineOn(p)).join(','))
  t = await rowAt(p, 2, .25); await H.to(t.x, t.y)
  await H.up()
  const n1 = await names(p)
  const landed = await p.evaluate(() => [...document.querySelectorAll('#ordList .ordrow')].map(r => r.classList.contains('lift-land')))
  ok(size, 'R4: let go — it lands just above the third row', JSON.stringify(n1) === JSON.stringify([n0[1], n0[0], ...n0.slice(2)]), n1.join(' | '))
  ok(size, 'R4: the landed row flashes the landing mark', landed[1] === true && landed.filter(Boolean).length === 1, landed.join(','))
  await L.pic(w, `R4-landed-${size}`, { around: '#ordModal' })
  await L.sleep(700)
  m = await marks(p)
  ok(size, 'R4: nothing is left marked after the flash', m.every(x => !x.dragging && !x.over && !x.land), JSON.stringify(m.map(x => [x.dragging, x.over, x.land])))

  /* R5 — carried UP from the last row to above the first */
  const n = n1.length
  s = await startOf(p, n - 1, w.phone); await H.down(s.x, s.y)
  t = await rowAt(p, 0, .2); await H.to(t.x, t.y)
  ok(size, 'R5: carried up, the line is on the first row\'s top', JSON.stringify(await lineOn(p)) === JSON.stringify(['0 top']), (await lineOn(p)).join(','))
  await H.up()
  const n2 = await names(p)
  ok(size, 'R5: it lands first', JSON.stringify(n2) === JSON.stringify([n1[n - 1], ...n1.slice(0, n - 1)]), n2.join(' | '))
  await L.sleep(700)

  /* R6 — the last row's foot: the line on its foot, the row goes last */
  s = await startOf(p, 0, w.phone); await H.down(s.x, s.y)
  t = await rowAt(p, n - 1, .8); await H.to(t.x, t.y)
  ok(size, 'R6: under the last row, the line is on its foot', JSON.stringify(await lineOn(p)) === JSON.stringify([`${n - 1} foot`]), (await lineOn(p)).join(','))
  await L.pic(w, `R6-last-foot-${size}`, { around: '#ordModal' })
  await H.up()
  const n3 = await names(p)
  ok(size, 'R6: it goes last', JSON.stringify(n3) === JSON.stringify([...n2.slice(1), n2[0]]), n3.join(' | '))
  await L.sleep(700)

  /* R7 — its own place: no line over itself or the gap it fills; a release moves nothing and flashes it in place */
  s = await startOf(p, 1, w.phone); await H.down(s.x, s.y)
  t = await rowAt(p, 1, .3); await H.to(t.x, t.y)
  const self1 = await lineOn(p)
  t = await rowAt(p, 0, .8); await H.to(t.x, t.y)
  const self2 = await lineOn(p)
  const carried = (await marks(p))[1].dragging
  ok(size, 'R7: over its own row and the gap it fills, no line — and it IS being carried', carried && !self1.length && !self2.length, `carried=${carried} lines=[${self1}] [${self2}]`)
  await H.up()
  const n4 = await names(p)
  const inPlace = await p.evaluate(() => document.querySelectorAll('#ordList .ordrow')[1].classList.contains('lift-land'))
  ok(size, 'R7: let go there, nothing moves and it flashes in place', JSON.stringify(n4) === JSON.stringify(n3) && inPlace, `same=${JSON.stringify(n4) === JSON.stringify(n3)} flash=${inPlace}`)
  await L.sleep(700)

  /* R8 — the ▲ ▼ still move a row, and a press on them is no drag */
  const before8 = await names(p)
  await w.press('#ordList .ordrow:nth-child(1) button[title="Move down"]'); await L.sleep(200)
  const after8 = await names(p)
  ok(size, 'R8: ▼ still moves a row down one', JSON.stringify(after8) === JSON.stringify([before8[1], before8[0], ...before8.slice(2)]), after8.join(' | '))
  ok(size, 'R8: and leaves nothing carried', (await marks(p)).every(x => !x.dragging && !x.over), 'no marks')

  if (w.phone) {
    /* R9 — a finger on a row's NAME is not a carry (it scrolls the list) */
    const b9 = await names(p)
    const a = await rowAt(p, 0, .5), b = await rowAt(p, 2, .5)
    await H.down(a.x, a.y); await H.to(b.x, b.y)
    const carriedByName = (await marks(p)).some(x => x.dragging)
    await H.up(); await L.sleep(300)
    ok(size, 'R9: a finger on a row\'s name does not carry it', !carriedByName && JSON.stringify(await names(p)) === JSON.stringify(b9), `carried=${carriedByName}`)
  } else {
    /* R9 — Escape mid-carry ends the carry, not the window; the release after it moves nothing */
    const b9 = await names(p)
    s = await startOf(p, 0, false); await H.down(s.x, s.y)
    t = await rowAt(p, 2, .25); await H.to(t.x, t.y)
    const wasCarrying = (await marks(p))[0].dragging
    await p.keyboard.press('Escape'); await L.sleep(150)
    const still = await p.locator('#ordModal').count()
    const left = (await marks(p)).some(x => x.dragging || x.over)
    await H.up()
    ok(size, 'R9: Escape mid-carry ends the carry and leaves the window open; nothing moves', wasCarrying && still === 1 && !left && JSON.stringify(await names(p)) === JSON.stringify(b9), `carrying=${wasCarrying} window=${still} marks=${left}`)
    /* R9b — a plain click on a row is no drag */
    const c = await rowAt(p, 1, .5); await p.mouse.click(c.x, c.y); await L.sleep(150)
    ok(size, 'R9b: a click on a row carries nothing', (await marks(p)).every(x => !x.dragging && !x.over) && JSON.stringify(await names(p)) === JSON.stringify(b9), 'no marks')
  }

  /* R10 — Cancel: the dropdown is as it was. Then a carry and Save order: the dropdown takes the new order */
  const optsBefore = await sylOptions(p)
  await closeOrd(w)
  ok(size, 'R10: Cancel leaves the Syllabus dropdown as it was', JSON.stringify(await sylOptions(p)) === JSON.stringify(optsBefore), (await sylOptions(p)).join(' | '))
  await openSyl(w)
  const n10 = await names(p)
  s = await startOf(p, 0, w.phone); await H.down(s.x, s.y)
  t = await rowAt(p, 2, .25); await H.to(t.x, t.y); await H.up(); await L.sleep(200)
  const want = await names(p)
  await w.press('#ordSave'); await L.sleep(500)
  const optsAfter = await sylOptions(p)
  ok(size, 'R10: Save order after a carry: the dropdown lists the new order', JSON.stringify(optsAfter) === JSON.stringify(want) && JSON.stringify(want) !== JSON.stringify(n10), `${n10.join(' | ')} → ${optsAfter.join(' | ')}`)
  ok(size, 'R10: the window closed on Save order', await p.locator('#ordModal').count() === 0, 'closed')
}

/* E — the Crew order window, made long through the app's own "+ Add" */
async function crewWalk(w, size) {
  const p = w.page
  const H = await hand(w)
  if (w.phone && !(await p.locator('#addStu').first().isVisible().catch(() => false))) {
    const info = p.getByRole('button', { name: /Info/ }).first()
    if (await info.count()) { await info.tap(); await L.sleep(400) }
  }
  for (let k = 0; k < 16; k++) {
    await w.press('#addStu'); await p.waitForSelector('#dlgModal', { timeout: 5000 })
    const opt = p.locator('#dlgList [role="option"]').nth(k)
    if (!(await opt.count())) { ok(size, 'E0: the roster offers people to add', false, 'no option'); return }
    if (w.phone) await opt.tap(); else await opt.click()
    await L.sleep(250)
    while (await p.locator('#dlgModal').count()) { await p.keyboard.press('Enter'); await L.sleep(200) }   // any closing question
  }
  await w.press('#ordCrew'); await p.waitForSelector('#ordModal[data-ord="crew"] #ordList .ordrow'); await L.sleep(300)
  const geo = await p.evaluate(() => { const b = document.querySelector('#ordList'); return { rows: b.children.length, scrolls: b.scrollHeight > b.clientHeight + 1, top: b.scrollTop } })
  ok(size, 'E0: the Crew order list is longer than its box', geo.scrolls, JSON.stringify(geo))
  if (!geo.scrolls) return
  const n0 = await names(p)
  /* E1 — the first row carried to the list's foot and held: the list runs down; then let go on a row out of the first view */
  const s = await startOf(p, 0, w.phone)
  await H.down(s.x, s.y)
  const box = await p.evaluate(() => { const r = document.querySelector('#ordList').getBoundingClientRect(); return { b: r.bottom, x: r.x + 80 } })
  await H.to(box.x, box.b - 8)
  await L.sleep(1500)
  const top1 = await p.evaluate(() => document.querySelector('#ordList').scrollTop)
  const line = await lineOn(p)
  ok(size, 'E1: held at the list\'s foot, the list runs down under the carried row', top1 > 0, `scrollTop ${top1}`)
  ok(size, 'E1: still ONE landing line while it runs', line.length === 1, line.join(','))
  await L.pic(w, `E1-edge-${size}`, { around: '#ordModal' })
  await H.up(); await L.sleep(200)
  const n1 = await names(p)
  const where = n1.indexOf(n0[0])
  ok(size, 'E1: let go, the row lands far down the list (out of the first view)', where > 8, `now at ${where + 1} of ${n1.length}`)
  if (w.phone) {
    /* E2 — a finger on the names scrolls the list (it is not carried) */
    await p.evaluate(() => { document.querySelector('#ordList').scrollTop = 0 })
    const a = await rowAt(p, 6, .5), b = await rowAt(p, 1, .5)
    await H.down(a.x, a.y); await H.to(b.x, b.y, 14); await H.up(); await L.sleep(400)
    const top2 = await p.evaluate(() => document.querySelector('#ordList').scrollTop)
    ok(size, 'E2: a finger on the names scrolls the list, carrying nothing', top2 > 0 && JSON.stringify(await names(p)) === JSON.stringify(n1), `scrollTop ${top2}`)
  }
  await closeOrd(w)
}

for (const size of SIZES) {
  const w = await L.world(size)
  try {
    await L.go(w, 'tracker'); await L.sleep(600)
    try { await sylWalk(w, size) } catch (e) { ok(size, 'R: the syllabus walk ran to its end', false, String(e).slice(0, 300)) }
    try { await closeOrd(w); await crewWalk(w, size) } catch (e) { ok(size, 'E: the crew walk ran to its end', false, String(e).slice(0, 300)) }
    ok(size, 'no page or console errors', w.errors.length === 0, w.errors.slice(0, 3).join(' / ') || 'none')
  } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length}/${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
