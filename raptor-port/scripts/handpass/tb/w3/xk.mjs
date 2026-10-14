/* xk — W3: K1 (phone: the line of small capitals at the top of the date calendar's card, from each box) and K2 (desk: no such line).
   node xk.mjs phone|desk */
import { L, inputsCal, rowOut, part } from './lib.mjs'
import { calSays, drawn } from '../../dl-check.mjs'
const size = process.argv[2] || 'phone'
console.log('xk.mjs - W3 K1 K2 - ' + size)
const S = `[${size}]`
const w = await L.world(size); const p = w.page
const cardUp = () => p.locator('[data-testid="dcal-card"]').count()
const closeCal = async () => { if (!(await cardUp())) return; if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape'); await L.sleep(450) }
const clear = async () => { await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(200) }
const hideToast = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
const rows = []
/** open the card from `boxSel` (already on screen), read the name line and the card's geometry */
async function readCard(key, expected, boxSel, pic) {
  const box = typeof boxSel === 'string' ? p.locator(boxSel).first() : boxSel
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
  await w.press(box); await p.waitForSelector('[data-testid="dcal-card"]', { timeout: 6000 }); await L.sleep(500); await clear()
  const name = await drawn(w, '[data-testid="dcal-name"]'), title = await drawn(w, '[data-testid="dcal-title"]'), card = await drawn(w, '[data-testid="dcal-card"]')
  const shown = name ? (name.transform === 'uppercase' ? name.text.toUpperCase() : name.text) : null
  const saw = name ? `line "${shown}" (typed "${name.text}", ${name.transform}), ${name.w}×${name.h} at ${name.x},${name.y}; the month's title starts at y ${title ? title.y : '?'} (line ends y ${name.b}); card ${card ? `${card.w}×${card.h} at ${card.x},${card.y}` : '?'}; the line sits ${card ? Math.round((name.y - card.y) * 10) / 10 : '?'}px under the card's top; one line: ${!name.cut && name.h <= 20}` : 'no name line on the card'
  const ok = !!name && shown === expected && !!title && name.b <= title.y + 0.5 && !name.cut && name.h <= 20
  rowOut(`K1 ${key} ${S}`, 'the card names its box', `${expected} — one line, above the month's title`, saw, ok)
  rows.push({ key, h: name && name.h, off: name && card ? Math.round((name.y - card.y) * 10) / 10 : null })
  await hideToast(true); await L.pic(w, pic); await hideToast(false)
  return { name, card }
}
try {
  if (w.phone) {
    /* the Calendar window: a weekday's heading → Every <weekday> → From, and Until → A date */
    await part(w, `K1 Calendar window ${S}`, 'From / Until', 'FROM, UNTIL', async () => {
      await L.openCalendarWindow(w)
      await w.press('[data-testid="days-wd-3"]'); await p.waitForSelector('[data-testid="win-every"]'); await L.sleep(300)
      await readCard('From (Calendar window → Every Thursday)', 'FROM', '[data-testid="every-from"]', 'k01-phone-from')
      await closeCal()
      if (!(await p.locator('[data-testid="every-until"]').count())) { await w.press('[data-testid="every-until-date"]'); await L.sleep(300) }
      await readCard('Until (Every Thursday → A date)', 'UNTIL', '[data-testid="every-until"]', 'k01-phone-until')
      await closeCal()
    })
    /* Admin → Users → add a person → Post in */
    await part(w, `K1 Post in ${S}`, 'Post in', 'POST IN', async () => {
      await p.evaluate(() => { document.querySelectorAll('[data-testid$="-x"]').forEach(b => b.click()) }); await L.sleep(300)
      await L.adminPanel(w, 'Users')
      const sel = '#accAddPostIn'
      if (!(await p.locator(sel).count())) throw new Error('no Post in box on Admin → Users (looked for #accAddPostIn)')
      await readCard('Post in (Admin → Users → Add a person)', 'POST IN', sel, 'k01-phone-post-in')
      await closeCal()
    })
    /* a medical input's Upchit date: the pending card's Upchit button */
    await part(w, `K1 Upchit date (medical input) ${S}`, 'Upchit date', 'UPCHIT DATE', async () => {
      await L.go(w, 'inputs')
      await w.press('#inMedBtn'); await p.waitForSelector('#medView .medsec', { state: 'attached' }); await L.sleep(400)
      const card = p.locator('.medsec.med-pend .medcard').first()
      await card.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
      await w.press(card); await p.waitForSelector('#docViewPop:not([hidden])'); await L.sleep(400)
      await w.press('#docViewUpchit'); await p.waitForSelector('#inpEditUpDate', { timeout: 8000 }); await L.sleep(500)
      await readCard('Upchit date (a medical input, Upchit form)', 'UPCHIT DATE', '#inpEditUpDate', 'k01-phone-upchit-date-medical')
      await closeCal()
      await p.locator('#inpEditCancel').click().catch(() => {}); await L.sleep(300)
      await p.evaluate(() => { document.querySelectorAll('[data-testid$="-x"]').forEach(b => b.click()) }); await L.sleep(300)
    })
    /* the Tracker */
    await part(w, `K1 Tracker boxes ${S}`, 'side panel', 'LAST FLOWN (SYLLABUS), UPCHIT DATE, END DATE A', async () => {
      await L.go(w, 'tracker'); await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 })
      const info = p.locator('#page-tracker button[data-view="info"]'); if (await info.count()) { await info.tap(); await L.sleep(400) }
      await readCard("Last Flown (Syllabus) (Tracker's side panel)", 'LAST FLOWN (SYLLABUS)', '#lastSyll', 'k01-phone-last-flown-syllabus'); await closeCal()
      await readCard("Upchit Date (Tracker's side panel)", 'UPCHIT DATE', '#upchit', 'k01-phone-tracker-upchit-date'); await closeCal()
      await readCard("End date A (Tracker's side panel)", 'END DATE A', '#targetIn', 'k01-phone-end-date-a'); await closeCal()
    })
    await part(w, `K1 Tracker marking pop-up ${S}`, 'Done on / Failed on', 'DONE ON, FAILED ON', async () => {
      const flow = p.locator('#page-tracker button[data-view="flow"]'); if (await flow.count()) { await flow.tap(); await L.sleep(400) }
      const ball = p.locator('#flowSvg .ball').first()
      await ball.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
      const bb = await ball.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await L.sleep(700)
      if (!(await p.locator('#popDoneDate').count())) throw new Error('a tap on an event did not open the marking pop-up')
      await readCard('Done on (Tracker marking pop-up)', 'DONE ON', '#popDoneDate', 'k01-phone-done-on'); await closeCal()
      await readCard('Failed on (Tracker marking pop-up)', 'FAILED ON', '#popFailDate', 'k01-phone-failed-on'); await closeCal()
    })
    const hs = [...new Set(rows.map(r => r.h))], offs = [...new Set(rows.map(r => r.off))]
    rowOut(`K1 same height on every card ${S}`, 'the line is the same height on every card', 'the same height on every card', `line heights seen: ${hs.join(', ')}; the line's distance from the card's top, per card: ${rows.map(r => `${r.key.split(' (')[0]}=${r.off}`).join(', ')}`, rows.length >= 2 && hs.length === 1 && offs.length === 1)
  } else {
    /* K2 — a desktop: the small panel hangs under its own box and carries no name line */
    await part(w, `K2 desk ${S}`, 'From', 'no name line; the panel hangs under its own box', async () => {
      await L.openCalendarWindow(w)
      await w.press('[data-testid="days-wd-3"]'); await p.waitForSelector('[data-testid="win-every"]'); await L.sleep(300)
      const box = p.locator('[data-testid="every-from"]')
      await w.press(box); await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(500); await clear()
      const name = await drawn(w, '[data-testid="dcal-name"]'), card = await drawn(w, '[data-testid="dcal-card"]'), bx = await box.boundingBox()
      rowOut(`K2 desk ${S}`, 'From on a desktop', 'No name line: the small panel hangs under its own box', `name line: ${name ? '"' + name.text + '"' : 'none'}; the box ${Math.round(bx.x)},${Math.round(bx.y)} ${Math.round(bx.width)}×${Math.round(bx.height)} (bottom ${Math.round(bx.y + bx.height)}); the panel ${card ? `${card.x},${card.y} ${card.w}×${card.h}` : 'not found'} — its top is ${card ? Math.round((card.y - (bx.y + bx.height)) * 10) / 10 : '?'}px under the box's bottom`, !name && !!card && card.y >= bx.y + bx.height - 1 && card.y <= bx.y + bx.height + 40)
      await L.pic(w, 'k02-desk-from-panel', { around: '[data-testid="win-every"]', pad: 40 })
      await closeCal()
    })
  }
} finally { await L.close(w) }
