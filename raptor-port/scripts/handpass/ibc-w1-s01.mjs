// W1 — S01 / T1: Escape with the keyboard on a DATE and another window in front (desktop 1440). v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, mark, unmark, row, act, wins, focusDate } = L
console.log('ibc-w1-s01 v1')
L.startRun('keep')
const browser = await L.launch()
const w = await L.session(browser, 'desktop')
const page = w.page
const esc = async () => { await page.keyboard.press('Escape'); await sleep(400) }
const snap = async () => ({ wins: await wins(page), active: await act(page) })
try {
  await L.toInputsCal(w, 2026, 7)
  /* keyboard onto 15 Jul, Enter opens the day */
  await focusDate(page, '2026-07-15'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft')
  const a0 = await act(page)
  await page.keyboard.press('Enter'); await tid(page, 'win-inputsday').waitFor(); await sleep(400)
  row('S01-0', 'keyboard on 15 Jul (arrows), Enter', 'the day window opens', { active_before_enter: a0, now: await snap() }, 'RECORDED')
  /* settings in front, with the mouse */
  await press(w, '#inGear'); await tid(page, 'win-inputsset').waitFor(); await sleep(400)
  const s1 = await snap()
  row('S01-1', 'press the month gear with the mouse', 'Inputs settings opens in front of the day', s1, s1.wins.includes('win-inputsset') && s1.wins.includes('win-inputsday') ? 'PASS' : 'NOT WALKED premise')
  /* keyboard to a date by Tab/Shift+Tab (no click) */
  let landed = null, presses = 0
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Shift+Tab'); presses++
    const a = await act(page)
    if (a && a.icday) { landed = a; break }
  }
  if (!landed) {
    for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); presses++; const a = await act(page); if (a && a.icday) { landed = a; break } }
  }
  if (!landed) { await focusDate(page, '2026-07-16'); landed = await act(page); row('S01-2', 'Tab/Shift+Tab to a date', 'keyboard on a date', { note: 'tab order did not reach a date in 120 presses; focused programmatically', landed }, 'RECORDED') }
  else row('S01-2', `Shift+Tab/Tab ${presses} presses to a date`, 'keyboard on a date', landed, 'RECORDED')
  await shot(page, 'S01-a-before-escape')
  const pre = await snap()
  await esc()
  const post1 = await snap()
  row('S01-3', 'Escape once (keys on a date, settings in front, day behind)', 'settings closes; the 15 Jul day stays open', { pre, post1 },
    !post1.wins.includes('win-inputsset') && post1.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S01-b-after-escape1.png')
  await shot(page, 'S01-b-after-escape1')
  await esc()
  const post2 = await snap()
  row('S01-4', 'Escape a second time', 'the day closes', post2, !post2.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S01-c-after-escape2.png')
  await shot(page, 'S01-c-after-escape2')
  await L.closeWins(w)

  /* variant (a): front window = Calendar window opened from settings */
  await focusDate(page, '2026-07-15'); await page.keyboard.press('Enter'); await tid(page, 'win-inputsday').waitFor(); await sleep(300)
  await press(w, '#inGear'); await tid(page, 'win-inputsset').waitFor(); await sleep(300)
  await press(w, tid(page, 'iset-days')); await tid(page, 'win-days').waitFor(); await sleep(400)
  await focusDate(page, '2026-07-16')
  const va = await snap()
  await shot(page, 'S01-va-before-escape')
  await esc()
  const va1 = await snap()
  row('S01a', 'day + settings + Calendar window in front; keys on 16 Jul; Escape', 'the Calendar window (front) closes; settings and the day stay', { before: va, after: va1 },
    !va1.wins.includes('win-days') && va1.wins.includes('win-inputsset') && va1.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S01-va-after-escape.png')
  await shot(page, 'S01-va-after-escape')
  await L.closeWins(w)

  /* variant (c): the input window in front; Tab back to a date */
  await focusDate(page, '2026-07-15'); await page.keyboard.press('Enter'); await tid(page, 'win-inputsday').waitFor(); await sleep(300)
  const open = page.locator('[data-testid="idy-open"]').first()
  const hasInput = (await open.count()) > 0
  if (!hasInput) { row('S01c', 'open an input from the day card', 'input window opens', 'no input card on 15 Jul', 'NOT WALKED premise — no card') }
  else {
    await open.click(); await tid(page, 'win-inputedit').waitFor().catch(() => {}); await sleep(400)
    const ow = await wins(page)
    if (!ow.includes('win-inputedit')) row('S01c', 'open an input from the day card', 'input window opens', ow, 'NOT WALKED premise — input window did not open')
    else {
      await focusDate(page, '2026-07-16')
      const c0 = await snap()
      await shot(page, 'S01-vc-before-escape')
      await esc()
      const c1 = await snap()
      row('S01c', 'day + input window (clean) in front; keys on 16 Jul; Escape', 'the input window closes; the day stays', { before: c0, after: c1 },
        !c1.wins.includes('win-inputedit') && c1.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S01-vc-after-escape.png')
      await shot(page, 'S01-vc-after-escape')
      /* typed variant */
      await L.closeWins(w)
      await page.locator('[data-testid="idy-open"]').first().click().catch(() => {}); await sleep(400)
      if (!(await wins(page)).includes('win-inputedit')) { if (!(await wins(page)).includes('win-inputsday')) { await focusDate(page, '2026-07-15'); await page.keyboard.press('Enter'); await sleep(400) } await page.locator('[data-testid="idy-open"]').first().click(); await sleep(500) }
      const rmk = page.locator('#inpEdit #inpEditRmk, #inpEditPop #inpEditRmk, #inpEditRmk').first()
      if (await rmk.count()) {
        await rmk.fill('typed by walker'); await sleep(200)
        await focusDate(page, '2026-07-16')
        const t0 = await snap()
        await esc()
        const t1 = await snap()
        const ask = await tid(page, 'inped-escask').count()
        row('S01c2', 'input window with typing in front; keys on a date; Escape', 'RECORD (the question appears, or the window closes)', { before: t0, after: t1, escAskUp: ask }, 'RECORDED', 'S01-vc2-after-escape.png')
        await shot(page, 'S01-vc2-after-escape')
      } else row('S01c2', 'type into Remarks of the input window', 'a box', 'no #inpEditRmk found', 'NOT WALKED premise')
    }
  }
  await L.closeWins(w)
  /* the question may be up: clear */
  if (await tid(page, 'inped-escask-go').count()) await tid(page, 'inped-escask-go').click()
  await sleep(300)
  /* variant (d): arrows move to 16 Jul first, then the settings in front */
  await L.closeWins(w)
  await focusDate(page, '2026-07-15'); await page.keyboard.press('Enter'); await tid(page, 'win-inputsday').waitFor(); await sleep(300)
  await page.keyboard.press('ArrowRight'); await sleep(200)
  const d0 = await act(page)
  row('S01d-0', 'with the day open, ArrowRight on the date', 'RECORD where the keys go', { active: d0, wins: await wins(page) }, 'RECORDED')
  await press(w, '#inGear'); await tid(page, 'win-inputsset').waitFor(); await sleep(300)
  await focusDate(page, '2026-07-16'); await page.keyboard.press('ArrowRight'); await sleep(200)
  const d1 = await snap()
  await esc()
  const d2 = await snap()
  row('S01d', 'settings in front; arrows moved the keys on dates; Escape', 'settings closes; the day stays', { before: d1, after: d2 }, !d2.wins.includes('win-inputsset') && d2.wins.includes('win-inputsday') ? 'PASS' : 'FAIL', 'S01-vd-after-escape.png')
  await shot(page, 'S01-vd-after-escape')
} catch (e) { L.say(`ERROR s01: ${e.stack}`); await shot(page, 's01-error').catch(() => {}) }
await w.ctx.close(); await browser.close()
L.finishRun('s01')
