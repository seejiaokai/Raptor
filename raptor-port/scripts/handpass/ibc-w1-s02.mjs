// W1 — S02 (the Calendar window after a page change, desktop + phone) and S21 (every door to the Calendar window). v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, mark, unmark, row, act, wins, rect, hitOf } = L
console.log('ibc-w1-s02 v1')
L.startRun('keep')
L.SIZES.d1536 = { viewport: { width: 1536, height: 864 } }
L.SIZES.d2560 = { viewport: { width: 2560, height: 1300 } }
const browser = await L.launch()
const inter = (a, b) => (a && b) ? Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)) : null
const inView = (r, vw, vh) => !!r && r.l >= 0 && r.t >= 0 && r.r <= vw && r.b <= vh
const toEdit = async (w) => {
  if (!w.touch) { await w.page.locator('#topnav >> text=Edit Schedule').first().click(); await sleep(600) } else await L.go(w.page, 'editsched')
  await sleep(300)
}
const sig = async w => ({ page: await w.page.evaluate(() => window.CURPAGE), wins: await wins(w.page), days: await rect(w.page, '[data-testid="win-days"]') })

async function s02(size) {
  const w = await L.session(browser, size)
  const p = w.page
  const vp = L.SIZES[size].viewport
  const T = `S02-${size}`
  try {
    const doors = [
      ['Inputs gear', async () => { await L.inputsCal(w, 2026, 7); await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300); await press(w, tid(p, 'iset-days')) }, 'inputs'],
      ['SANS gear', async () => { await L.toSans(w, 2026, 7); await press(w, tid(p, 'sc-gear')); await tid(p, 'win-sansset').waitFor(); await sleep(300); await press(w, tid(p, 'sset-days')) }, 'sans'],
      ['SANS day', async () => { await L.toSans(w, 2026, 7); await L.openSansDay(w, '2026-07-14'); await press(w, tid(p, 'sd-days')) }, 'sans'],
    ]
    let n = 0
    for (const [name, open, back] of doors) {
      n++
      await L.closeWins(w)
      await open(); await tid(p, 'win-days').waitFor(); await sleep(500)
      const a = await sig(w)
      await shot(p, `${T}-${n}-opened-${name.replace(/ /g, '')}`)
      await toEdit(w)
      const b = await sig(w)
      const onView = b.days && inView(b.days, vp.width, vp.height)
      row(`S02.${n}`, `${size}: Calendar window opened from ${name}; press the Edit Schedule tab`, 'RECORD (F8: a window about a page nobody is on)', { before: a, after: b, calendarWindowOnScreen: !!onView }, 'RECORDED', `${T}-${n}-after-page-change-${name.replace(/ /g, '')}.png`)
      await shot(p, `${T}-${n}-after-page-change-${name.replace(/ /g, '')}`)
      /* go back to Inputs: still there, in sight? */
      await L.go(p, 'inputs'); await sleep(500)
      const c = await sig(w)
      let top = null
      if (c.days) top = await hitOf(p, '[data-testid="win-days"]')
      row(`S02.${n}b`, `${size}: back to the Inputs page`, 'RECORD (is the Calendar window still there, in sight?)', { state: c, hit: top }, 'RECORDED', `${T}-${n}-back-on-inputs-${name.replace(/ /g, '')}.png`)
      await shot(p, `${T}-${n}-back-on-inputs-${name.replace(/ /g, '')}`)
      await L.closeWins(w)
      /* leave via the page so the next door starts clean */
      if (back === 'sans') { /* toSans does go('inputs') then clicks the SANS tab */ }
    }
    /* settings: typed cut-off then page change */
    await L.closeWins(w)
    await L.inputsCal(w, 2026, 7)
    await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
    const box = p.locator('[data-testid="win-inputsset"] input[inputmode="numeric"]').first()
    if (await box.count()) {
      const v0 = await box.inputValue()
      await box.fill('9'); await sleep(200)
      await toEdit(w)
      await L.go(p, 'inputs'); await sleep(400)
      await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
      const v1 = await p.locator('[data-testid="win-inputsset"] input[inputmode="numeric"]').first().inputValue()
      row('S02.6', `${size}: type 9 into the cut-off box (was ${v0}), do not Save, change page and come back, reopen settings`, 'RECORD (a typed cut-off not saved is lost)', { typed: '9', before: v0, reopened: v1 }, 'RECORDED')
      await L.closeWins(w)
    } else row('S02.6', `${size}: typed cut-off then page change`, 'RECORD', 'no numeric box found', 'NOT WALKED premise')
  } catch (e) { L.say(`ERROR s02 ${size}: ${e.stack}`); await shot(p, `s02-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}
if (process.env.ONLY !== 's21') await s02('desktop')
if (process.env.ONLY !== 's21') await s02('phone')

/* ===== S21 — every door to the Calendar window, at 1440, 1536, 2560 ===== */
async function s21(size) {
  let w = await L.session(browser, size)
  let p = w.page
  const vp = L.SIZES[size].viewport
  const T = `S21-${size}`
  try {
    await L.toSans(w, 2026, 7)
    await L.openSansDay(w, '2026-07-14')
    const dayBefore = await rect(p, '[data-testid="win-sansday"]')
    await press(w, tid(p, 'sd-days')); await tid(p, 'win-days').waitFor(); await sleep(600)
    const day = await rect(p, '[data-testid="win-sansday"]'), cal = await rect(p, '[data-testid="win-days"]')
    const xd = await hitOf(p, '[data-testid="win-sansday-x"]'), xc = await hitOf(p, '[data-testid="win-days-x"]')
    row(`S21.1-${size}`, `${size}: SANS day at its own place -> Calendar...`, 'opens LEFT of the day, neither window\'s cross covered', { dayBefore, day, cal, overlapPx2: inter(day, cal), leftOfDay: cal && day ? cal.r <= day.l + 1 : null, dayCross: xd, calCross: xc }, (xd && xd.own && xc && xc.own && cal && day && cal.r <= day.l + 1) ? 'PASS' : 'FAIL', `${T}-1-calendar-beside-day.png`)
    await shot(p, `${T}-1-calendar-beside-day`)
    /* close each way: its cross, Escape, Close button if any */
    await tid(p, 'win-days-x').click({ force: true }); await sleep(300)
    const a1 = await wins(p)
    row(`S21.1x-${size}`, `${size}: close Calendar by its cross`, 'Calendar closes, day stays', a1, (!a1.includes('win-days') && a1.includes('win-sansday')) ? 'PASS' : 'FAIL')
    await press(w, tid(p, 'sd-days')); await tid(p, 'win-days').waitFor(); await sleep(400)
    await p.keyboard.press('Escape'); await sleep(400)
    const a2 = await wins(p)
    row(`S21.1e-${size}`, `${size}: Escape (keys: ${JSON.stringify(await act(p))}) with Calendar in front of SANS day`, 'Calendar closes, day stays', a2, (!a2.includes('win-days') && a2.includes('win-sansday')) ? 'PASS' : 'FAIL')
    await L.closeWins(w)
    if (size === 'desktop') {
      /* SANS day dragged to the far left, then Calendar... */
      await L.openSansDay(w, '2026-07-14')
      const bar = await tid(p, 'win-sansday').locator('.win-bar').boundingBox()
      await p.mouse.move(bar.x + 30, bar.y + bar.height / 2); await p.mouse.down(); await p.mouse.move(40, bar.y + bar.height / 2 + 10, { steps: 12 }); await p.mouse.up(); await sleep(400)
      const dl = await rect(p, '[data-testid="win-sansday"]')
      await press(w, tid(p, 'sd-days')); await tid(p, 'win-days').waitFor(); await sleep(600)
      const day2 = await rect(p, '[data-testid="win-sansday"]'), cal2 = await rect(p, '[data-testid="win-days"]')
      const xd2 = await hitOf(p, '[data-testid="win-sansday-x"]'), xc2 = await hitOf(p, '[data-testid="win-days-x"]')
      row('S21.2', 'SANS day dragged to the far left, then Calendar...', 'RECORD (fallback corner: does it cover the day?)', { dayDragged: dl, day: day2, cal: cal2, overlapPx2: inter(day2, cal2), shareOfDayCovered: day2 && cal2 ? +(inter(day2, cal2) / (day2.w * day2.h)).toFixed(2) : null, dayCross: xd2, calCross: xc2 }, 'RECORDED', `${T}-2-day-far-left-calendar.png`)
      await shot(p, `${T}-2-day-far-left-calendar`)
      await L.closeWins(w)
      /* Calendar already open from settings -> SANS day's Calendar... */
      await press(w, '#inSansMode').catch(() => {})
      await L.inputsCal(w, 2026, 7)
      await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
      await press(w, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
      const c3 = await rect(p, '[data-testid="win-days"]'), s3 = await rect(p, '[data-testid="win-inputsset"]')
      const xs3 = await hitOf(p, '[data-testid="win-inputsset-x"]'), xc3 = await hitOf(p, '[data-testid="win-days-x"]')
      row('S21.3', 'Inputs settings -> Calendar... (no beside request)', 'RECORD: where it lands; does it cover the settings window\'s cross?', { cal: c3, settings: s3, overlapPx2: inter(c3, s3), settingsCross: xs3, calCross: xc3 }, 'RECORDED', `${T}-3-calendar-from-inputs-settings.png`)
      await shot(p, `${T}-3-calendar-from-inputs-settings`)
      await w.ctx.close(); w = await L.session(browser, size); p = w.page /* fresh world: the dragged SANS day must not leave its place behind */
      await L.inputsCal(w, 2026, 7)
      await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
      await press(w, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
      const f3c = await rect(p, '[data-testid="win-days"]'), f3s = await rect(p, '[data-testid="win-inputsset"]')
      row('S21.3f', 'fresh world: Inputs settings -> Calendar...', 'RECORD: lands where; covers the cross of the settings window?', { cal: f3c, settings: f3s, overlapPx2: inter(f3c, f3s), settingsCross: await hitOf(p, '[data-testid="win-inputsset-x"]'), calCross: await hitOf(p, '[data-testid="win-days-x"]') }, 'RECORDED', `${T}-3f-fresh-calendar-from-inputs-settings.png`)
      await shot(p, `${T}-3f-fresh-calendar-from-inputs-settings`)
      await L.closeWins(w)
      /* Calendar open from settings, then a SANS day's Calendar... */
      await L.inputsCal(w, 2026, 7)
      await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
      await press(w, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
      const cOpen = await rect(p, '[data-testid="win-days"]')
      await press(w, '#inSansMode'); await tid(p, 'sanscal').waitFor(); await sleep(400)
      const afterTab = { wins: await wins(p), cal: await rect(p, '[data-testid="win-days"]') }
      row('S21.4a', 'Calendar open from Inputs settings; press the SANS tab', 'RECORD', { before: cOpen, after: afterTab }, 'RECORDED')
      await L.closeWins(w)
      await L.openSansDay(w, '2026-07-14')
      /* open it from the SANS gear first, then the day's button */
      await press(w, tid(p, 'sc-gear')); await tid(p, 'win-sansset').waitFor(); await sleep(300)
      await press(w, tid(p, 'sset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
      const c4 = await rect(p, '[data-testid="win-days"]')
      const covered = await hitOf(p, '[data-testid="sd-days"]')
      const dayNow = await rect(p, '[data-testid="win-sansday"]')
      row('S21.4pre', 'fresh world: SANS day open, SANS gear -> Calendar... (from the settings window)', 'RECORD: does this Calendar window cover the SANS day or its Calendar... button?', { day: dayNow, cal: c4, overlapPx2: inter(dayNow, c4), dayButtonHit: covered, dayCross: await hitOf(p, '[data-testid="win-sansday-x"]') }, 'RECORDED', `${T}-4pre-calendar-from-sans-settings-day-open.png`)
      await shot(p, `${T}-4pre-calendar-from-sans-settings-day-open`)
      await p.evaluate(() => document.querySelector('[data-testid="sd-days"]').click()); await sleep(600)
      const c5 = await rect(p, '[data-testid="win-days"]')
      const day5 = await rect(p, '[data-testid="win-sansday"]')
      const xd5 = await hitOf(p, '[data-testid="win-sansday-x"]')
      row('S21.4', 'Calendar already open (from SANS settings), then the SANS day\'s Calendar...', 'RECORD (does it come forward, move?)', { calBefore: c4, calAfter: c5, moved: JSON.stringify(c4) !== JSON.stringify(c5), day: day5, dayCross: xd5, wins: await wins(p), keys: await act(p) }, 'RECORDED', `${T}-4-already-open.png`)
      await shot(p, `${T}-4-already-open`)
      await L.closeWins(w)
      /* close Calendar, open it from Inputs settings: where (stale beside request)? */
      await L.inputsCal(w, 2026, 7)
      await press(w, '#inGear'); await tid(p, 'win-inputsset').waitFor(); await sleep(300)
      await press(w, tid(p, 'iset-days')); await tid(p, 'win-days').waitFor(); await sleep(500)
      const c6 = await rect(p, '[data-testid="win-days"]')
      row('S21.5', 'after the SANS-day door was used, Calendar... from Inputs settings', 'RECORD: where it lands (stale beside request?)', { cal: c6, earlierFromInputsSettings: await Promise.resolve(null) }, 'RECORDED', `${T}-5-calendar-from-inputs-after-sans-use.png`)
      await shot(p, `${T}-5-calendar-from-inputs-after-sans-use`)
      /* Close buttons: Calendar's own Close? */
      const closeBtn = await tid(p, 'win-days').locator('button', { hasText: /^Close$/ }).count()
      row('S21.6', 'is there a "Close" button in the Calendar window', 'RECORD', { closeButton: closeBtn }, 'RECORDED')
      await L.closeWins(w)
    }
  } catch (e) { L.say(`ERROR s21 ${size}: ${e.stack}`); await shot(p, `s21-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}
await s21('desktop')
if (process.env.ONLY !== 's21') await s21('d1536')
if (process.env.ONLY !== 's21') await s21('d2560')
await browser.close()
L.finishRun('s02')
