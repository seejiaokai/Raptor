/* THE DESIGN LOOK — the one date calendar (step one), pictured as built at both sizes, and what a keyboard can do in it.
   node scripts/handpass/dl-cal.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
const K = size

/* 1 — "Every Thursday": the two date boxes, and the calendar over both windows */
await L.openCalendarWindow(w)
await w.press('[data-testid="days-wd-3"]')
await p.waitForSelector('[data-testid="win-every"]')
await L.sleep(300)
await L.pic(w, `cal-${K}-1-every-form`)
await w.press('[data-testid="every-from"]')
await p.waitForSelector('[data-testid="dcal-card"]')
await L.sleep(350)
await L.pic(w, `cal-${K}-2-calendar-open`)
if (!w.phone) await L.pic(w, `cal-${K}-2c-calendar-close-up`, { around: '[data-testid="dcal-card"]', pad: 60 })

if (!w.phone) {
  /* THE KEYBOARD, on the desktop — every key is pressed for real and what it did is read off the page */
  const month = () => p.locator('[data-testid="dcal"]').getAttribute('data-month')
  const at = () => p.evaluate(() => document.activeElement?.getAttribute('data-iso') || '')
  L.row('Date calendar', 'opens with the keyboard on…', 'the picked date, or today', await L.focusOf(w), 'look')
  const a0 = await at()
  await p.keyboard.press('ArrowRight'); const a1 = await at()
  await p.keyboard.press('ArrowDown'); const a2 = await at()
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp'); const a3 = await at()
  L.row('Date calendar', 'Arrow keys', 'a day left / right, a week up / down', `${a0} → right ${a1} → down ${a2} → left, up ${a3}`, a1 > a0 && a2 > a1 && a3 === a0 ? 'works' : 'GAP')
  await L.pic(w, `cal-${K}-3-keyboard-on-a-date`, { around: '[data-testid="dcal-card"]', pad: 24 })
  const m0 = await month()
  await p.keyboard.press('PageDown'); const m1 = await month(); const f1 = await at()
  await p.keyboard.press('PageUp'); const m2 = await month()
  L.row('Date calendar', 'Page Up / Page Down', 'the month before / after', `${m0} → PageDown ${m1} (on ${f1}) → PageUp ${m2}`, m1 > m0 && m2 === m0 ? 'works' : 'GAP')
  const h0 = await at()
  await p.keyboard.press('Home'); const h1 = await at()
  await p.keyboard.press('End'); const h2 = await at()
  L.row('Date calendar', 'Home / End', 'the first / last day of the week', `on ${h0}: Home → ${h1}, End → ${h2}`, h1 !== h0 || h2 !== h0 ? 'works' : 'GAP — nothing moves')
  await p.keyboard.press('Shift+PageDown'); const y1 = await month()
  L.row('Date calendar', 'Shift + Page Down (a year on)', 'the same month next year (the usual pattern)', `${m2} → ${y1}`, y1.slice(0, 4) !== m2.slice(0, 4) ? 'works' : 'GAP — goes one month only')
  if (y1 !== m2) { await p.keyboard.press('PageUp') }
  /* the Tab order inside the card */
  const stops = []
  for (let i = 0; i < 7; i++) { await p.keyboard.press('Tab'); stops.push(await L.focusOf(w)) }
  L.row('Date calendar', 'Tab, seven times', 'round inside the card: the dates → the title → Today → the two arrows → the dates', stops.map(s => s.split(' · ')[0]).join('  |  '), 'look')
  /* a key to "today" */
  await p.locator('[data-testid="dcal-grid"] button[tabindex="0"]').focus()
  const t0 = await at(); await p.keyboard.press('t'); const t1 = await at()
  L.row('Date calendar', 'a key for today', 'none is required — the Today button is one Tab away', `"t" on ${t0} → ${t1}`, 'by the Today button only')
  /* the lists */
  await p.locator('[data-testid="dcal-title"]').focus()
  await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="dcal-lists"]')
  await L.sleep(300)
  const afterOpen = await L.focusOf(w)
  L.row('Month-and-year lists', 'Enter on the title', 'the lists open and the keyboard goes INTO the month list', afterOpen, /dcal-months/.test(afterOpen) ? 'works' : 'GAP — the keyboard stays on the title; Tab is needed to reach a list')
  await L.pic(w, `cal-${K}-4-lists-open`, { around: '[data-testid="dcal-card"]', pad: 24 })
  await p.locator('[data-testid="dcal-months"]').focus()
  const mm0 = await month(); await p.keyboard.press('ArrowDown'); await L.sleep(450); const mm1 = await month()
  await p.keyboard.press('ArrowUp'); await L.sleep(450)
  L.row('Month-and-year lists', 'Arrow Up / Down in a list', 'the month or year before / after', `${mm0} → down ${mm1}`, mm1 !== mm0 ? 'works' : 'GAP')
  await L.pic(w, `cal-${K}-5-lists-keyboard`, { around: '[data-testid="dcal-card"]', pad: 24 })
  const hm0 = await month(); await p.keyboard.press('End'); await L.sleep(450); const hm1 = await month(); await p.keyboard.press('PageDown'); await L.sleep(450); const hm2 = await month()
  L.row('Month-and-year lists', 'Home / End / Page keys in a list', 'the ends of the year, or several rows at once', `${hm0} → End ${hm1} → PageDown ${hm2}`, hm1 !== hm0 || hm2 !== hm1 ? 'works' : 'GAP — only the arrows move the list')
  await p.keyboard.press('Enter'); await L.sleep(300)
  const listsStill = await p.locator('[data-testid="dcal-lists"]').count()
  L.row('Month-and-year lists', 'Enter in a list', 'closes the lists and shows the dates of the month chosen', listsStill ? 'the lists stay open' : 'the lists close', listsStill ? 'GAP — the only way back to the dates is the title button' : 'works')
  if (listsStill) { await p.locator('[data-testid="dcal-title"]').focus(); await p.keyboard.press('Enter'); await L.sleep(300) }
  /* Escape closes the calendar first, the window second; the keyboard returns to the box */
  await p.keyboard.press('Escape'); await L.sleep(300)
  const calGone = !(await p.locator('[data-testid="dcal-card"]').count()), winStill = await p.locator('[data-testid="win-every"]').count()
  L.row('Date calendar', 'Escape', 'closes the calendar only; the window behind stays; the keyboard is back on the box', `calendar ${calGone ? 'closed' : 'OPEN'}, window ${winStill ? 'still open' : 'CLOSED'}, keyboard on ${await L.focusOf(w)}`, calGone && winStill ? 'works' : 'GAP')
  /* open by keyboard, pick by keyboard */
  await p.locator('[data-testid="every-from"]').focus()
  await p.keyboard.press('Space'); await L.sleep(300)
  const opened = await p.locator('[data-testid="dcal-card"]').count()
  const v0 = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await L.sleep(300)
  const v1 = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
  L.row('Date box', 'Space / Enter on the box, then Enter on a date', 'opens; picks; closes; the keyboard is back on the box', `opened ${!!opened}; ${v0} → ${v1}; keyboard on ${await L.focusOf(w)}`, opened && v1 !== v0 ? 'works' : 'GAP')
  await L.pic(w, `cal-${K}-6-box-focused`, { around: '[data-testid="win-every"]', pad: 12 })
} else {
  /* the phone: the lists */
  await w.press('[data-testid="dcal-title"]')
  await p.waitForSelector('[data-testid="dcal-lists"]')
  await L.sleep(400)
  await L.pic(w, `cal-${K}-4-lists-open`)
  await w.press('[data-testid="dcal-title"]')
  await L.sleep(300)
  await p.touchscreen.tap(8, 8); await L.sleep(300)
}

/* 2 — "Until", where earlier dates may not be picked: the faint dates */
const until = p.locator('[data-testid="every-until"]')
if (await until.count()) {
  const dis = await until.isDisabled().catch(() => false)
  if (dis) { const d = p.locator('[data-testid="win-every"]').getByText('A date', { exact: false }).first(); if (await d.count()) await w.press(d) ; await L.sleep(250) }
  if (!(await until.isDisabled().catch(() => true))) {
    await w.press('[data-testid="every-until"]')
    await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(350)
    await L.pic(w, `cal-${K}-7-until-faint-dates`, w.phone ? {} : { around: '[data-testid="dcal-card"]', pad: 60 })
    if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape')
    await L.sleep(300)
  } else console.log('   (Until stayed switched off — no picture 7)')
}

/* 3 — Admin → Data: the run of dates drawn inside its form */
await p.evaluate(() => { document.querySelectorAll('[data-testid$="-x"]').forEach(b => b.click()) })
await L.adminPanel(w, 'Data')
await p.locator('#admWipeDate').scrollIntoViewIfNeeded()
await p.selectOption('#admWipeMode', 'range')
await p.waitForSelector('#admWipeRun')
const mon = await p.evaluate(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}` })
await w.press(`[data-testid="admWipeRun-day-${mon}-09"]`); await w.press(`[data-testid="admWipeRun-day-${mon}-14"]`)
await L.sleep(300)
await p.locator('#admWipeRun').evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
await L.pic(w, `cal-${K}-8-admin-run-in-form`, w.phone ? {} : { around: '#admWipeRun', pad: 110 })

await L.close(w)
