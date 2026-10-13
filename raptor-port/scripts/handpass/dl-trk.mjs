/* THE DESIGN LOOK — the Tracker's date boxes (the ✕ inside the box; the marking pop-up's Done on / Failed on), and the
   "Until" calendar's faint dates, pictured as built at both sizes, with what a keyboard can do.
   node scripts/handpass/dl-trk.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
const K = size

/* 0 — "Until": a date before From may not be picked — the faint dates */
await L.openCalendarWindow(w)
await w.press('[data-testid="days-wd-3"]')
await p.waitForSelector('[data-testid="win-every"]')
await w.press('[data-testid="every-until-date"]')
await p.waitForSelector('[data-testid="every-until"]')
await w.press('[data-testid="every-until"]')
await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(350)
await L.pic(w, `cal-${K}-7-until-faint-dates`, w.phone ? {} : { around: '[data-testid="dcal-card"]', pad: 60 })
if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape')
await L.sleep(300)
await p.evaluate(() => { document.querySelectorAll('[data-testid$="-x"]').forEach(b => b.click()) })

/* 1 — the side panel's boxes */
await L.go(w, 'tracker')
await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 })
if (w.phone) { await p.locator('#page-tracker button[data-view="info"]').tap(); await L.sleep(400) }
const up = p.locator('#upchit')
await up.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
await L.pic(w, `trk-${K}-1-side-panel-boxes`)
/* give Upchit a date so its ✕ shows */
await w.press('#upchit')
await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(300)
await L.pic(w, `trk-${K}-2-calendar-over-tracker`)
const today = await p.locator('[data-testid="dcal"]').getAttribute('data-today')
await w.press(`[data-testid="dcal-day-${today}"]`)
await L.sleep(500)
await up.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
await L.pic(w, `trk-${K}-3-box-with-cross`, { around: '#upchit', pad: w.phone ? 90 : 70 })
const boxes = await p.evaluate(() => [...document.querySelectorAll('#page-tracker .datebox')].map(b => { const r = b.getBoundingClientRect(); const x = b.parentElement.querySelector('.trdate-x'); const xr = x && x.getBoundingClientRect(); return { id: b.id, w: Math.round(r.width), h: Math.round(r.height), text: b.textContent.trim(), x: xr ? `${Math.round(xr.width)}×${Math.round(xr.height)}` : 'none' } }))
console.log('BOXES', JSON.stringify(boxes))

if (!w.phone) {
  /* the keyboard on the box and its ✕ */
  await up.focus()
  L.row("Tracker's date box", 'Tab onto the box', 'a visible ring', await L.focusOf(w), 'look')
  await p.keyboard.press('Tab')
  const onX = await L.focusOf(w)
  L.row("Tracker's date box", 'Tab again', 'the ✕ that takes the date off, with a ring', onX, /trdate-x|Take/.test(onX) ? (/NO RING/.test(onX) ? 'GAP — reached, but no ring' : 'works') : 'GAP — the ✕ is not the next stop')
  await L.pic(w, `trk-${K}-4-keyboard-on-cross`, { around: '#upchit', pad: 70 })
  await up.focus()
  const v0 = await up.getAttribute('data-value')
  await p.keyboard.press('Delete'); await L.sleep(400)
  const v1 = await up.getAttribute('data-value')
  L.row("Tracker's date box", 'Delete or Backspace on the box', 'takes the date off (a way to clear ON THE BOX)', `${v0} → "${v1}"`, v1 === '' ? 'works' : 'GAP — nothing happens; only the ✕ clears')
  if (v1 !== '') {
    const x = up.locator('xpath=..').locator('.trdate-x'); await x.focus(); await p.keyboard.press('Enter'); await L.sleep(400)
    L.row("Tracker's date box", 'Enter on the ✕', 'takes the date off; the keyboard stays near the box', `"${await up.getAttribute('data-value')}" · keyboard on ${await L.focusOf(w)}`, (await up.getAttribute('data-value')) === '' ? 'works' : 'GAP')
  }
}

/* 2 — the marking pop-up: a tap on a ball */
if (w.phone) { const fl = p.locator('#page-tracker button[data-view="flow"]'); if (await fl.count()) { await fl.tap(); await L.sleep(400) } }
const ball = p.locator('#flowSvg .ball').first()
await ball.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
const bb = await ball.boundingBox()
if (w.phone) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
await L.sleep(600)
const pop = p.locator('#popDoneDate')
if (await pop.count()) {
  await L.pic(w, `trk-${K}-5-marking-pop-up`)
  if (!w.phone) {
    L.row("Tracker's marking pop-up", 'opens with the keyboard on…', 'something inside the pop-up', await L.focusOf(w), 'look')
    const stops = []
    for (let i = 0; i < 10; i++) { await p.keyboard.press('Tab'); stops.push((await L.focusOf(w)).split(' · ')[0]) }
    const inside = await p.evaluate(() => { const e = document.activeElement; return !!(e && e.closest('.pop, #pop, [class*="pop"]')) })
    L.row("Tracker's marking pop-up", 'Tab, ten times', 'goes round INSIDE the pop-up', stops.join('  |  ') + ` · still inside: ${inside}`, 'look')
    await pop.focus(); await p.keyboard.press('Enter'); await L.sleep(350)
    const calUp = await p.locator('[data-testid="dcal-card"]').count()
    await L.pic(w, `trk-${K}-6-pop-up-calendar`)
    await p.keyboard.press('Escape'); await L.sleep(300)
    const calGone = !(await p.locator('[data-testid="dcal-card"]').count()), popStill = await p.locator('#popDoneDate').count()
    L.row("Tracker's marking pop-up", 'Enter on "Done on", then Escape', 'the calendar opens; Escape closes the calendar only', `opened ${!!calUp}; after Escape: calendar ${calGone ? 'closed' : 'OPEN'}, pop-up ${popStill ? 'still open' : 'CLOSED'}; keyboard on ${(await L.focusOf(w)).split(' · ')[0]}`, calUp && calGone && popStill ? 'works' : 'GAP')
    await p.keyboard.press('Escape'); await L.sleep(300)
    L.row("Tracker's marking pop-up", 'Escape again', 'closes the pop-up; the keyboard returns to the event that opened it', `pop-up ${(await p.locator('#popDoneDate').count()) ? 'OPEN' : 'closed'}; keyboard on ${await L.focusOf(w)}`, 'look')
  } else {
    await w.press('#popDoneDate'); await L.sleep(400)
    await L.pic(w, `trk-${K}-6-pop-up-calendar`)
  }
} else console.log('   (the marking pop-up did not open)')
await L.close(w)
