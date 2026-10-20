/* lk-walk part A: windows W1-W11 ([FLOATWIN-TWO-LINE-BAR]) — the walker's script, 21 Oct 26 */
process.env.HP_URL ||= 'http://localhost:4295'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/docs/img/handpass/2026-10-21-look-keys/walk'
console.log('lk-walk-a v2')
const { go, board, publish, closeBoard } = await import('./lib.mjs')
const W = await import('./lk-walk-lib.mjs')
const rec = W.recorder('a')
const fmt = (m) => m.open ? `win left ${m.left} right ${m.right} top ${m.top} foot ${m.foot} (vw ${m.vw} vh ${m.vh}) · bar H ${m.barH} bottom ${m.barBottom} · bar's last 3px: ${m.underBarFoot} · bar controls under the window's column: ${m.ctlUnder.length}, own-target misses: ${m.ctlMissed.length ? m.ctlMissed.join(',') : 'none'}` : 'NOT OPEN'
const near = (a, b, t = 1) => Math.abs(a - b) <= t
const allErrors = []
const pause = (page, ms = 350) => page.waitForTimeout(ms)

const measure = (page, sel) => page.evaluate(W.WINMEASURE, sel)
async function pics(page, name, sel, m, extra = []) {
  /* full picture with the window and the bar's foot marked, plus a crop of the window's top-left corner against the bar */
  const win = await W.rectOf(page, sel)
  const marks = [win, { x: Math.max(0, win.x - 24), y: m.barBottom - 3, w: win.w + 48, h: 3 }, ...extra]
  await W.mark(page, marks)
  const full = await W.snap(page, `${name}`)
  const vw = m.vw, vh = m.vh
  const cx = Math.max(0, win.x - 60), cy = Math.max(0, m.barBottom - 70)
  const crop = await W.snap(page, `${name}-crop`, { x: cx, y: cy, width: Math.min(vw - cx, Math.min(win.w + 120, 420)), height: 150 })
  await W.unmark(page)
  return [full, crop]
}
async function openChg(page) { await page.click('#histBtn'); await page.waitForSelector('.chgwin:not([hidden])'); await pause(page) }
async function openAvail(page, where = '#eWeek', which = 0) {
  const chip = page.locator(`${where} [data-oilsent]:visible`).nth(which)
  await chip.scrollIntoViewIfNeeded(); await chip.click()
  await page.waitForSelector('.availwin:not([hidden])'); await pause(page)
}
async function closeWin(page, sel) { await page.click(`${sel} .win-x`).catch(() => {}); await pause(page, 250) }

/* a case: open → measure → judge against the bar-bottom+8 rule (or a fixed top) */
async function winCase(page, id, size, label, sel, opener, expectTop /* null = bar bottom + 8 */, picName) {
  try {
    await opener()
    const m = await measure(page, sel)
    if (!m.open) { rec(id, size, label, 'window did not open', 'NOT WALKED'); return null }
    const want = expectTop == null ? m.barBottom + 8 : expectTop
    const ok = near(m.top, want) && (expectTop != null || (m.underBarFoot === 'the top bar' && m.ctlMissed.length === 0))
    const p = await pics(page, picName, sel, m)
    rec(id, size, label, `expected top ${want}${expectTop == null ? ' (bar bottom + 8)' : ''}; ${fmt(m)}`, ok ? 'PASS' : 'FAIL', p)
    return m
  } catch (e) { rec(id, size, label, 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') ; return null }
}

/* ---------------- the shared world: 1200x800, admin ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1200, height: 800 })
  await go(page, 'editsched')
  console.log('world: bar', JSON.stringify(await page.evaluate(W.BARHEIGHT)))
  /* W1 */
  let m = await winCase(page, 'W1', '1200x800', 'Edit Schedule: pressed the top bar clock (changes window)', '.chgwin', () => openChg(page), null, 'w01-chg-1200')
  if (m) rec('W1b', '1200x800', 'top bar height', `bar H ${m.barH} (expected > 90)`, m.barH > 90 ? 'PASS' : 'FAIL')
  await closeWin(page, '.chgwin')
  /* the world: ALL AVAIL on day 0's first Common Programme row (unpublished day) */
  const p0 = await W.putAt(page, 'week', 'a:0.0.+')
  console.log('put day0', p0)
  await pause(page)
  /* W2 */
  await winCase(page, 'W2', '1200x800', 'Edit Schedule: ALL AVAIL on day 0 row 0 (' + p0 + '), pressed its count on the week', '.availwin', () => openAvail(page), null, 'w02-avail-1200')
  await closeWin(page, '.availwin')

  /* W3: 1024x768 */
  await page.setViewportSize({ width: 1024, height: 768 }); await pause(page, 500)
  await go(page, 'editsched')
  await winCase(page, 'W3a', '1024x768', 'Edit Schedule: changes window from the clock', '.chgwin', () => openChg(page), null, 'w03-chg-1024')
  await closeWin(page, '.chgwin')
  await winCase(page, 'W3b', '1024x768', 'Edit Schedule: ALL AVAIL window from the count', '.availwin', () => openAvail(page), null, 'w03-avail-1024')
  await closeWin(page, '.availwin')

  /* W4: 1440x900 */
  await page.setViewportSize({ width: 1440, height: 900 }); await pause(page, 500)
  await go(page, 'editsched')
  await winCase(page, 'W4a', '1440x900', 'Edit Schedule: changes window from the clock', '.chgwin', () => openChg(page), 96, 'w04-chg-1440')
  await closeWin(page, '.chgwin')
  await winCase(page, 'W4b', '1440x900', 'Edit Schedule: ALL AVAIL window from the count', '.availwin', () => openAvail(page), 96, 'w04-avail-1440')
  await closeWin(page, '.availwin')
  rec('W4c', '1440x900', 'top bar height', `bar ${JSON.stringify(await page.evaluate(W.BARHEIGHT))}`, 'RECORD')

  /* publish day 2 through the board, then put ALL AVAIL on its first row (a pending amendment on a published day) */
  await page.setViewportSize({ width: 1200, height: 800 }); await pause(page, 500)
  await go(page, 'editsched')
  await board(page, 2)
  const pub = await publish(page, 2)
  console.log('publish day 2', JSON.stringify(pub))
  await page.click('#sbDone').catch(() => {}); await pause(page, 500)
  await go(page, 'editsched')
  const approved = await page.evaluate(() => window.dayApproved(2))
  console.log('day 2 approved', approved)
  const p2 = approved ? await W.putAt(page, 'week', 'a:2.0.+') : 'skip'
  console.log('put day2', p2)
  await pause(page)

  /* W8: View-only Sched as the admin, 1200x800 */
  await go(page, 'viewsched'); await pause(page, 500)
  const dpend = await page.evaluate(() => [...document.querySelectorAll('.day-head .dpend')].filter(e => e.offsetWidth).length)
  console.log('dpend chips on View-only Sched:', dpend)
  if (dpend) {
    await winCase(page, 'W8a', '1200x800', 'View-only Sched (admin): pressed a day head count chip (.dpend) → changes window', '.chgwin',
      async () => { const c = page.locator('.day-head .dpend:visible').first(); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForSelector('.chgwin:not([hidden])'); await pause(page) }, null, 'w08-chg-viewonly-1200')
    await closeWin(page, '.chgwin')
  } else rec('W8a', '1200x800', 'View-only Sched day head count chip', `no .dpend chip visible (day 2 approved=${approved}, put=${p2})`, 'NOT WALKED')
  await winCase(page, 'W8b', '1200x800', 'View-only Sched (admin): pressed the ALL AVAIL count of day 0 row 0 → ALL AVAIL window', '.availwin',
    () => openAvail(page, '#vWeek .day[data-day="0"]'), null, 'w08-avail-viewonly-1200')
  await closeWin(page, '.availwin')

  /* W9: the Inputs page at 1200x800 */
  await go(page, 'inputs'); await pause(page, 500)
  const ib = await page.evaluate(W.BARHEIGHT)
  await page.click('#inListBtn'); await pause(page, 300)
  const expectIn = ib.h > 90 ? null : 96
  rec('W9a', '1200x800', 'Inputs page top bar', `bar ${JSON.stringify(ib)} → expected window top ${expectIn == null ? 'bar bottom + 8' : '96'}`, 'RECORD')
  await winCase(page, 'W9b', '1200x800', 'Inputs: pressed #inGear (settings window)', '.floatwin', async () => { await page.click('#inGear'); await page.waitForSelector('.floatwin:not([hidden])'); await pause(page) }, expectIn, 'w09-gear-1200')
  await closeWin(page, '.floatwin'); await pause(page, 300)
  await winCase(page, 'W9c', '1200x800', 'Inputs: pressed "+ Input" (the input window)', '.floatwin', async () => { await page.click('#inNew'); await page.waitForSelector('.floatwin:not([hidden])'); await pause(page, 500) }, expectIn, 'w09-new-1200')
  await closeWin(page, '.floatwin'); await pause(page, 300)

  /* W10: the Scheduler Board over day 0 */
  await go(page, 'editsched'); await pause(page, 300)
  try {
    await board(page, 0)
    const sbTop = await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard .sb-top')].find(e => e.offsetWidth); if (!b) return null; const r = b.getBoundingClientRect(); return { bottom: Math.round(r.bottom * 10) / 10, top: Math.round(r.top * 10) / 10, h: Math.round(r.height) } })
    const chip = page.locator('#schedBoard [data-oilsent]:visible').first()
    if (!(await chip.count())) { rec('W10', '1200x800', 'board day 0 count', 'no [data-oilsent] chip on the board', 'NOT WALKED') }
    else {
      await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForSelector('.availwin:not([hidden])'); await pause(page)
      const m10 = await measure(page, '.availwin')
      const cov = await page.evaluate(() => {
        const win = [...document.querySelectorAll('.availwin')].find(w => !w.hidden && w.offsetWidth)
        const bar = [...document.querySelectorAll('#schedBoard .sb-top')].find(e => e.offsetWidth)
        const label = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || (e.textContent || '').trim() || e.id || e.className).toString().replace(/\s+/g, ' ').slice(0, 30)
        const out = []
        for (const c of bar.querySelectorAll('button, select, input, a, [role=button]')) {
          if (!c.offsetWidth || !c.offsetHeight) continue
          const b = c.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2
          const h = document.elementFromPoint(cx, cy)
          out.push({ label: label(c), id: c.id, centre: `${Math.round(cx)},${Math.round(cy)}`, covered: !!h && win.contains(h), hitIsOwn: !!h && (c === h || c.contains(h)) })
        }
        return out
      })
      const covered = cov.filter(c => c.covered)
      const wr = await W.rectOf(page, '.availwin')
      const pcs = await pics(page, 'w10-board-avail-1200', '.availwin', m10, covered.length ? [] : [])
      /* second picture: the board bar's covered right end marked */
      const barR = await W.rectOf(page, '#schedBoard .sb-top')
      await W.mark(page, [wr, { x: Math.max(0, wr.x - 10), y: barR.y, w: Math.min(1200, wr.w + 20), h: barR.h }])
      const f2 = await W.snap(page, 'w10-board-bar-covered-1200', { x: 700, y: 0, width: 500, height: Math.min(300, 800) })
      await W.unmark(page)
      rec('W10', '1200x800', 'Scheduler Board day 0: pressed the count on the board → ALL AVAIL window',
        `expected top 96; ${fmt(m10)} · board bar bottom ${sbTop && sbTop.bottom} (top ${sbTop && sbTop.top}, H ${sbTop && sbTop.h}) · board-bar controls with centre under the window: ${covered.length ? covered.map(c => c.label + ' @' + c.centre).join('; ') : 'none'} (of ${cov.length} controls)`,
        near(m10.top, 96) ? 'PASS' : 'FAIL', [...pcs, f2])
      rec('W10b', '1200x800', 'RECORD for the owner: board-bar controls missed under the window', covered.length ? covered.map(c => c.label).join(' | ') : 'none missed', 'RECORD')
      await closeWin(page, '.availwin')
    }
    await page.click('#sbDone').catch(() => {})
  } catch (e) { rec('W10', '1200x800', 'board', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('shared world: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W5: resize with the window open ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await openChg(page)
    let m = await measure(page, '.chgwin')
    const a = m.top
    await page.setViewportSize({ width: 1200, height: 800 }); await pause(page, 800)
    const m2 = await measure(page, '.chgwin')
    const p2 = await pics(page, 'w05-chg-resized-1200', '.chgwin', m2)
    await page.setViewportSize({ width: 1440, height: 900 }); await pause(page, 800)
    const m3 = await measure(page, '.chgwin')
    const p3 = await pics(page, 'w05-chg-back-1440', '.chgwin', m3)
    rec('W5', '1440 → 1200 → 1440', 'opened the changes window at 1440, resized the viewport with it open',
      `at 1440: top ${a} (expected 96); at 1200x800: top ${m2.top} bar bottom ${m2.barBottom} (expected ${m2.barBottom + 8}); back at 1440: top ${m3.top} (expected 96)`,
      (near(a, 96) && near(m2.top, m2.barBottom + 8) && near(m3.top, 96)) ? 'PASS' : 'FAIL', [...p2, ...p3])
  } catch (e) { rec('W5', '1440/1200', 'resize', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W5: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W6: a moved window stays where he put it ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await openChg(page)
    const m0 = await measure(page, '.chgwin')
    const g = await W.rectOf(page, '.chgwin .win-grip')
    const gx = g.x + g.w / 2, gy = g.y + g.h / 2
    await page.mouse.move(gx, gy); await page.mouse.down()
    for (let i = 1; i <= 12; i++) { await page.mouse.move(gx - 25 * i, gy + (200 / 12) * i); await page.waitForTimeout(20) }
    await page.waitForTimeout(100); await page.mouse.up(); await pause(page, 400)
    const m1 = await measure(page, '.chgwin')
    await closeWin(page, '.chgwin')
    await openChg(page)
    const m2 = await measure(page, '.chgwin')
    const pa = await pics(page, 'w06-chg-reopened-1440', '.chgwin', m2)
    await page.setViewportSize({ width: 1200, height: 800 }); await pause(page, 800)
    const m3 = await measure(page, '.chgwin')
    const pb = await pics(page, 'w06-chg-moved-then-1200', '.chgwin', m3)
    const moved = near(m1.left, m0.left - 300, 3) && near(m1.top, m0.top + 200, 3)
    const reopen = near(m2.left, m1.left, 2) && near(m2.top, m1.top, 2)
    const stays = near(m3.top, m2.top, 2) && m3.top < m3.barBottom + 8 + 150 && !near(m3.top, m3.barBottom + 8, 1)
    rec('W6', '1440 → 1200', 'dragged the changes window by its grip 300px left, 200px down; closed; reopened; then resized to 1200x800',
      `before drag left ${m0.left} top ${m0.top}; after drag left ${m1.left} top ${m1.top} (drag landed as asked: ${moved}); reopened left ${m2.left} top ${m2.top} (expected ${m1.left},${m1.top} ±2: ${reopen}); at 1200x800 left ${m3.left} top ${m3.top} bar bottom ${m3.barBottom} (stays at his place, not lowered to ${m3.barBottom + 8}: ${stays})`,
      (moved && reopen && near(m3.top, m2.top, 2)) ? 'PASS' : 'FAIL', [...pa, ...pb])
  } catch (e) { rec('W6', '1440', 'drag', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W6: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W6b: a moved window that stays OPEN through a resize stays at his place ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await openChg(page)
    const g = await W.rectOf(page, '.chgwin .win-grip')
    const gx = g.x + g.w / 2, gy = g.y + g.h / 2
    await page.mouse.move(gx, gy); await page.mouse.down()
    for (let i = 1; i <= 12; i++) { await page.mouse.move(gx - 25 * i, gy + (200 / 12) * i); await page.waitForTimeout(20) }
    await page.waitForTimeout(100); await page.mouse.up(); await pause(page, 400)
    const m1 = await measure(page, '.chgwin')
    await page.setViewportSize({ width: 1200, height: 800 }); await pause(page, 800)
    const m2 = await measure(page, '.chgwin')
    const pb = await pics(page, 'w06b-moved-open-resized-1200', '.chgwin', m2)
    rec('W6b', '1440 → 1200', 'dragged the changes window 300 left / 200 down, left it OPEN, resized the viewport to 1200x800',
      `after drag left ${m1.left} top ${m1.top}; after resize left ${m2.left} top ${m2.top} (bar bottom ${m2.barBottom}, a lowered window would be ${m2.barBottom + 8}) — stays at his place`,
      near(m2.top, m1.top, 2) ? 'PASS' : 'FAIL', pb)
  } catch (e) { rec('W6b', '1440', 'drag+resize', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W6b: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W7: the first edit makes Undo/Redo appear ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1400, height: 900 })
  try {
    await go(page, 'editsched')
    const b0 = await page.evaluate(W.BARHEIGHT)
    await openChg(page)
    const m0 = await measure(page, '.chgwin')
    const undoBefore = await page.evaluate(() => { const u = document.querySelector('#undoBtn, [aria-label="Undo"], [title^="Undo"]'); return u ? { vis: !!u.offsetWidth, dis: !!u.disabled } : null })
    const put = await W.putAt(page, 'week', 'a:0.0.+')
    await pause(page, 700)
    const b1 = await page.evaluate(W.BARHEIGHT)
    const m1 = await measure(page, '.chgwin')
    const undoAfter = await page.evaluate(() => { const u = document.querySelector('#undoBtn, [aria-label="Undo"], [title^="Undo"]'); return u ? { vis: !!u.offsetWidth, dis: !!u.disabled } : null })
    const pa = await pics(page, 'w07-before-edit-1400', '.chgwin', m0).catch(() => [])
    const pb = m1.open ? await pics(page, 'w07-after-edit-1400', '.chgwin', m1) : []
    const wentTwo = b1.h > b0.h + 20
    let verdict, why
    if (!m1.open) { verdict = 'NOT WALKED'; why = 'the changes window closed on the edit' }
    else if (wentTwo) { verdict = near(m1.top, m1.barBottom + 8) ? 'PASS' : 'FAIL'; why = `bar went to two lines; window top ${m1.top} vs new bar bottom ${m1.barBottom} + 8` }
    else { verdict = 'RECORD'; why = 'bar stayed one line (no change expected)' }
    rec('W7', '1400x900', 'fresh sign-in; opened the changes window; made one edit (' + put + ')',
      `bar before ${JSON.stringify(b0)}, window top ${m0.top} (bar bottom ${m0.barBottom}); undo ${JSON.stringify(undoBefore)}; after edit bar ${JSON.stringify(b1)}, window top ${m1.top}; undo ${JSON.stringify(undoAfter)} — ${why}`, verdict, [...pa, ...pb])
  } catch (e) { rec('W7', '1400', 'edit', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W7: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W11: the phone, by touch ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 390, height: 844, touch: true })
  try {
    await go(page, 'editsched'); await pause(page, 400)
    const put = await W.putAt(page, 'week', 'a:0.0.+')
    console.log('phone put', put)
    await pause(page, 400)
    const chip = page.locator('#eWeek [data-oilsent]:visible').first()
    if (!(await chip.count())) rec('W11a', '390x844 touch', 'ALL AVAIL count on the week', `no count visible (put: ${put})`, 'NOT WALKED')
    else {
      await chip.scrollIntoViewIfNeeded(); await chip.tap(); await page.waitForSelector('.availwin:not([hidden])'); await pause(page)
      const m = await measure(page, '.availwin')
      const okA = near(m.left, 12, 1.5) && near(m.vw - m.right, 12, 1.5) && m.foot >= m.vh - 60
      const p = await pics(page, 'w11-avail-phone', '.availwin', m)
      rec('W11a', '390x844 touch', 'tapped the ALL AVAIL count on the week', `win left ${m.left} right ${m.right} (screen edges ${m.left} / ${Math.round(m.vw - m.right)}) top ${m.top} foot ${m.foot} (vh ${m.vh}) width ${m.width}`, okA ? 'PASS' : 'FAIL', p)
      await page.locator('.availwin .win-x').tap().catch(() => {}); await pause(page, 300)
    }
    /* the changes window by touch */
    let opened = false
    const hb = page.locator('#histBtn:visible')
    if (await hb.count()) { await hb.tap(); opened = true }
    else { const bg = page.locator('#burger'); if (await bg.count()) { await bg.tap(); await pause(page, 300); const h2 = page.locator('#histBtn:visible'); if (await h2.count()) { await h2.tap(); opened = true } } }
    if (!opened) rec('W11b', '390x844 touch', 'the changes window', 'no clock button reachable (top bar nor ☰ menu)', 'NOT WALKED')
    else {
      await page.waitForSelector('.chgwin:not([hidden])', { timeout: 4000 }).catch(() => {})
      await pause(page)
      const m = await measure(page, '.chgwin')
      if (!m.open) rec('W11b', '390x844 touch', 'tapped the clock', 'changes window did not open', 'NOT WALKED')
      else {
        const okB = near(m.left, 12, 1.5) && near(m.vw - m.right, 12, 1.5) && m.foot >= m.vh - 60
        const p = await pics(page, 'w11-chg-phone', '.chgwin', m)
        rec('W11b', '390x844 touch', 'tapped the top bar clock', `win left ${m.left} right ${m.right} (screen edges ${m.left} / ${Math.round(m.vw - m.right)}) top ${m.top} foot ${m.foot} (vh ${m.vh}) width ${m.width}`, okB ? 'PASS' : 'FAIL', p)
      }
    }
  } catch (e) { rec('W11', '390 touch', 'phone', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W11: ' + W.consoleBlock(errors))
  await browser.close()
}
console.log('CONSOLE', allErrors.join(' || '))
console.log('DONE a')
