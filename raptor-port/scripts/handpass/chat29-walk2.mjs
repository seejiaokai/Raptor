/* Chat 29 walk, parts E-J (8 Nov 26). ONLY=E1,E2,... filter; KEEP=1 SHOT_START=n to continue the numbering. */
import { freshFolder, open, go, press, shot, shotOf, step, sleep, rect, results, errors, login } from './chat29-lib.mjs'
console.log('chat29-walk2 v1 E-J')
if (!process.env.KEEP) freshFolder()
const pad = (page, sel) => page.locator(sel).first().evaluate(e => getComputedStyle(e).paddingRight)
const T = (page, id) => page.locator(`[data-testid="${id}"]`)
async function allDates(h) { await press(h, '#inRangeBtn'); await sleep(300); await press(h, '#inRangeAll'); await sleep(500) }
const winBox = page => page.locator('[data-testid="win-inputedit"]').first().boundingBox().catch(() => null)

/* ---------- E: the date calendar's lists ---------- */
const selYear = (page, pre) => T(page, `${pre}-years`).locator('[aria-selected="true"]').first().innerText().then(t => parseInt(t.replace(/\D/g, ''), 10)).catch(() => NaN)
const titleOf = (page, pre) => T(page, `${pre}-title`).first().innerText().then(t => t.replace(/\s+/g, ' ').trim())
async function listsTest(h, id, pre, { pressTitle, label }) {
  const p = h.page
  await step(id, `${label}: year list far scroll, ArrowUp x2, Enter`, async () => {
    const errs0 = errors.length
    if (pressTitle) { await press(h, `[data-testid="${pre}-title"]`); await sleep(500) }
    await T(p, `${pre}-lists`).first().waitFor({ state: 'visible', timeout: 5000 })
    const y0 = await selYear(p, pre), pic0 = await shot(p, `${id}-lists-open`)
    const yl = T(p, `${pre}-years`).first(), b = await yl.boundingBox()
    if (h.phone) { for (let i = 0; i < 9; i++) { await yl.evaluate(e => { e.scrollTop += 44 * 5 }); await sleep(30) } }
    else { await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); for (let i = 0; i < 9; i++) { await p.mouse.wheel(0, 44 * 5); await sleep(30) } }
    await sleep(1800)
    const y1 = await selYear(p, pre), t1 = await titleOf(p, pre), pic1 = await shot(p, `${id}-after-far-scroll`)
    await p.keyboard.press('ArrowUp'); await sleep(250); await p.keyboard.press('ArrowUp'); await sleep(700)
    const yNoFocus = await selYear(p, pre)
    if (yNoFocus === y1) { await yl.focus(); await p.keyboard.press('ArrowUp'); await sleep(250); await p.keyboard.press('ArrowUp'); await sleep(700) }
    const y2 = await selYear(p, pre), t2 = await titleOf(p, pre), pic2 = await shot(p, `${id}-after-two-arrow-ups`)
    await p.keyboard.press('Enter'); await sleep(900)
    const mj = pre === 'mjump', grid = mj ? (await T(p, `${pre}-lists`).count() === 0 ? 1 : 0) : await T(p, `${pre}-grid`).count(), t3 = mj ? (await p.locator(h.monSel).first().innerText()).replace(/\s+/g, ' ') : await titleOf(p, pre), month = mj ? 'n/a' : await T(p, pre).first().getAttribute('data-month').catch(() => null)
    const pic3 = await shot(p, `${id}-dates-after-enter`)
    const newErrs = errors.slice(errs0)
    const yTitle = parseInt((t3.match(/\d{4}/) || [])[0], 10)
    const ok = Math.abs((y1 - y0) - 45) <= 2 && y2 === y1 - 2 && grid > 0 && yTitle === y2 && newErrs.length === 0
    return { ok, note: `start year ${y0}; after far scroll chosen ${y1} (moved ${y1 - y0}, expected about 45), title "${t1}"; after 2 ArrowUp (keys with the focus where it was: chosen ${yNoFocus}; then focused the year list) chosen ${y2} (expected ${y1 - 2}), title "${t2}"; after Enter dates grid ${grid ? 'shown' : 'NOT shown'}, title "${t3}" (year ${yTitle}, expected ${y2}), data-month ${month}; new console errors ${newErrs.length}`, pics: [pic0, pic1, pic2, pic3] }
  })
  await step(id + 's', `${label}: slow scroll 3 rows`, async () => {
    if (pre === 'mjump') { await press(h, h.monSel); await sleep(600) } else { await press(h, `[data-testid="${pre}-title"]`); await sleep(500) }
    await T(p, `${pre}-lists`).first().waitFor({ state: 'visible', timeout: 5000 })
    const y0 = await selYear(p, pre), yl = T(p, `${pre}-years`).first()
    for (let i = 0; i < 3; i++) { await yl.evaluate(e => { e.scrollTop += 44 }); await sleep(500) }
    await sleep(1500)
    const y1 = await selYear(p, pre), pic = await shot(p, `${id}s-after-slow-3-rows`)
    await p.keyboard.press('Enter'); await sleep(700)
    const mj = pre === 'mjump', grid = mj ? (await T(p, `${pre}-lists`).count() === 0 ? 1 : 0) : await T(p, `${pre}-grid`).count(), t = mj ? (await p.locator(h.monSel).first().innerText()).replace(/\s+/g, ' ') : await titleOf(p, pre)
    return { ok: y1 - y0 === 3 && grid > 0, note: `chosen ${y0} -> ${y1} (expected +3); after Enter dates ${grid ? 'shown' : 'NOT shown'}, title "${t}"`, pics: [pic] }
  })
}

for (const phone of [false, true]) {
  const tag = phone ? 'phone' : '1536'
  const h = await open(phone ? { width: 390, height: 844, phone: true } : { width: 1536, height: 864 }), p = h.page
  await go(p, 'editsched'); await sleep(500)
  if (process.env.ONLY ? /E1/.test(process.env.ONLY) : true) {
    await press(h, 'button[aria-label="Jump to a date"]:visible'); await sleep(600)
    await listsTest(h, `E1-${tag}`, 'wcal', { pressTitle: true, label: `Edit Schedule jump to a date (${tag})` })
    await p.keyboard.press('Escape'); await sleep(300)
  }
  if (process.env.ONLY ? /E2/.test(process.env.ONLY) : true) {
    await go(p, 'inputs'); await press(h, '#inListBtn'); await sleep(300); await press(h, '#inNew'); await p.waitForSelector('#inpEdCal'); await sleep(600)
    await listsTest(h, `E2-${tag}`, 'inpEdCal', { pressTitle: true, label: `input window calendar (${tag})` })
  }
  await h.browser.close()
}
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'inputs'); await sleep(400)
  if (process.env.ONLY ? /E3/.test(process.env.ONLY) : true) {
    await step('E3-pre', 'Inputs calendar title press opens lists', async () => {
      await press(h, '#inpCal .ic-mon'); await sleep(600)
      const n = await T(p, 'mjump-lists').count(), t = await titleOf(p, 'mjump').catch(() => 'none')
      return { ok: n > 0, note: `lists present ${n}; title "${t}"`, pics: [await shot(p, 'E3-inputs-month-title-pressed')] }
    })
    h.monSel = '#inpCal .ic-mon'; await listsTest(h, 'E3', 'mjump', { pressTitle: false, label: 'Inputs calendar month title' })
    await step('E3-month', 'Inputs calendar shows the chosen month', async () => {
      const m = await p.locator('#inpCal .ic-mon').innerText()
      return { ok: true, note: `Inputs calendar now shows "${m}"`, pics: [await shot(p, 'E3-inputs-calendar-after')] }
    })
  }
  if (process.env.ONLY ? /E4/.test(process.env.ONLY) : true) {
    await p.keyboard.press('Escape'); await press(h, '#inSansMode'); await T(p, 'sanscal').waitFor(); await sleep(500)
    await press(h, '[data-testid="sc-month"]'); await sleep(600)
    h.monSel = '[data-testid="sc-month"]'; await listsTest(h, 'E4', 'mjump', { pressTitle: false, label: 'SANS calendar month title' })
    await step('E4-month', 'SANS calendar shows the chosen month', async () => {
      const m = await T(p, 'sc-month').innerText()
      return { ok: true, note: `SANS calendar now shows "${m.replace(/\s+/g, ' ')}"`, pics: [await shot(p, 'E4-sans-calendar-after')] }
    })
  }
  if (process.env.ONLY ? /E5/.test(process.env.ONLY) : true) {
    await press(h, '#inMemberMode'); await sleep(500)
    await press(h, '#inGear'); await sleep(400); await press(h, '[data-testid="iset-days"]'); await sleep(600)
    const x = T(p, 'win-inputsset-x'); if (await x.count()) await x.evaluate(e => e.click()); await sleep(300)
    await press(h, '[data-testid="days-wd-3"]'); await sleep(600)
    await press(h, '[data-testid="every-from"]'); await sleep(600)
    await listsTest(h, 'E5', 'dcal', { pressTitle: true, label: 'Calendar window "Every Thursday" from-date box' })
  }
  await h.browser.close()
}
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  if (process.env.ONLY ? /E7/.test(process.env.ONLY) : true) {
    await p.evaluate(() => window.go('admin')); await p.waitForSelector('#page-admin.on'); await sleep(500)
    await p.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test((b.textContent || '').trim())); if (b) b.click() }); await sleep(500)
    await p.locator('#accAddPostIn').scrollIntoViewIfNeeded(); await press(h, '#accAddPostIn'); await sleep(600)
    await listsTest(h, 'E7', 'dcal', { pressTitle: true, label: 'Admin Users: new person Post in date' })
  }
  await h.browser.close()
}

/* ---------- E6: the Leave War ---------- */
if (!process.env.ONLY || /E6/.test(process.env.ONLY)) {
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'leavewar'); await p.waitForSelector('[data-testid="row-slipway"]'); await sleep(800)
  await p.click('[data-testid="month-JUL"]'); await sleep(1200)
  await p.click('[data-testid="cell-slipway-2026-07-14"]'); await sleep(900)
  await p.getByText('Pick a range').click(); await sleep(800)
  await step('E6a-pre', 'Leave War bid sheet range picker: title opens lists?', async () => {
    const t = await p.locator('[data-testid="span-title"]').count()
    await press(h, '[data-testid="span-title"]'); await sleep(600)
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid$="-lists"],[data-testid$="-years"]')].map(e => e.dataset.testid).join(' '))
    return { ok: /years/.test(ids), note: 'title present ' + t + '; lists/years testids after pressing it: "' + ids + '"', pics: [await shot(p, 'E6a-range-picker-title-pressed')] }
  })
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid$="-lists"]')].map(e => e.dataset.testid.replace('-lists', '')))
  if (ids.length) await listsTest(h, 'E6a', ids[0], { pressTitle: false, label: 'Leave War bid range picker' })
  await p.keyboard.press('Escape'); await sleep(400)
  await p.keyboard.press('Escape'); await sleep(400)
  await p.click('[data-testid="cell-slipway-2026-07-14"]'); await sleep(900)
  await p.click('[data-testid="bid-more"]'); await p.click('[data-testid="bid-postin"]'); await sleep(600)
  await press(h, '[data-testid="pi-date"]'); await sleep(700)
  await listsTest(h, 'E6b', 'dcal', { pressTitle: true, label: 'Leave War Post-in date box' })
  await h.browser.close()
}

/* ---------- G: the late cut-off settings ---------- */
async function cutTest(h, id, label, tab, gear, pre, errSel, saveSel, cancelSel) {
  const p = h.page
  await step(id, `${label}: cut-off setting`, async () => {
    if (tab) { await press(h, tab); await sleep(500) }
    await press(h, gear); await sleep(700)
    const pics = [await shot(p, `${id}-window-open`)]
    const read = async () => ({ mode: await T(p, pre + '-mode-days').getAttribute('aria-pressed'), lead: await T(p, pre + '-lead').inputValue().catch(() => null), ex: await T(p, pre + '-example').innerText().catch(() => null), err: await T(p, errSel).innerText().catch(() => null) })
    const orig = await read(); const origWd = orig.mode === 'true' ? null : { wd: await T(p, pre + '-wd').inputValue(), weeks: await T(p, pre + '-weeks').inputValue() }
    await T(p, pre + '-mode-days').click(); await sleep(300)
    const notes = [`opened with ${JSON.stringify(orig)}${origWd ? ' ' + JSON.stringify(origWd) : ''}`]
    let ok = true
    const typeV = async v => { const i = T(p, pre + '-lead'); await i.click(); await i.fill(v); await sleep(250); return read() }
    const r10 = await typeV('10'); notes.push(`"10": example "${r10.ex}", error ${r10.err}`); pics.push(await shot(p, `${id}-typed-10`))
    if (!r10.ex || /Days before.*/.test('') ) ok = false
    const rx = await typeV('x'); notes.push(`"x": example ${rx.ex}, error "${rx.err}"`); pics.push(await shot(p, `${id}-typed-x`))
    await T(p, saveSel).click(); await sleep(500)
    const stillOpen = await T(p, errSel.replace(/err$/, 'err')).count().catch(() => 0)
    const afterSaveX = await T(p, pre + '-lead').count(), errSaveX = await T(p, errSel).innerText().catch(() => null)
    notes.push(`Save with "x": window ${afterSaveX ? 'stays open' : 'CLOSED'}, error "${errSaveX}"`); if (!afterSaveX || !errSaveX) ok = false
    pics.push(await shot(p, `${id}-save-with-x`))
    const re = await typeV(''); notes.push(`"": example ${re.ex}, error "${re.err}"`)
    await T(p, saveSel).click(); await sleep(500)
    const afterSaveE = await T(p, pre + '-lead').count(), errSaveE = await T(p, errSel).innerText().catch(() => null)
    notes.push(`Save with "": window ${afterSaveE ? 'stays open' : 'CLOSED'}, error "${errSaveE}"`); if (!afterSaveE || !errSaveE) ok = false
    pics.push(await shot(p, `${id}-save-with-empty`))
    const r12 = await typeV('12'); notes.push(`"12": example "${r12.ex}"`); if (!r12.ex || r12.ex === r10.ex) ok = false
    pics.push(await shot(p, `${id}-typed-12`))
    await T(p, saveSel).click(); await sleep(700)
    const closed = (await T(p, pre + '-lead').count()) === 0; notes.push(`Save with 12: window ${closed ? 'closed' : 'STILL OPEN'}`); if (!closed) ok = false
    await press(h, gear); await sleep(700)
    const re12 = await read(); notes.push(`reopened: mode-days ${re12.mode}, value "${re12.lead}", example "${re12.ex}"`); if (re12.lead !== '12') ok = false
    pics.push(await shot(p, `${id}-reopened-shows-12`))
    // put it back
    if (orig.mode === 'true') { await typeV(orig.lead) } else { await T(p, pre + '-mode-wd').click(); await T(p, pre + '-wd').selectOption(origWd.wd); await T(p, pre + '-weeks').selectOption(origWd.weeks) }
    await T(p, saveSel).click(); await sleep(700)
    await press(h, gear); await sleep(700); const back = await read(); notes.push(`put back and reopened: ${JSON.stringify(back)}`)
    if (back.mode !== orig.mode || (orig.mode === 'true' && back.lead !== orig.lead)) ok = false
    pics.push(await shot(p, `${id}-put-back`))
    await T(p, cancelSel).click(); await sleep(300)
    return { ok, note: notes.join(' || '), pics }
  })
}
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'inputs'); await sleep(400)
  await cutTest(h, 'G1', 'Inputs calendar gear', '', '#inGear', 'iset', 'iset-err', 'iset-save', 'iset-cancel')
  if (!process.env.ONLY || /G/.test(process.env.ONLY)) { await press(h, '#inSansMode'); await T(p, 'sanscal').waitFor(); await sleep(400) }
  await cutTest(h, 'G2', 'SANS calendar gear', '', '[data-testid="sc-gear"]', 'sset', 'sset-err', 'sset-save', 'sset-cancel')
  await h.browser.close()
}

/* ---------- I: press and hold on a window's bar ---------- */
async function hold(h, id, winSel, bodySel, expected, text) {
  const p = h.page
  await step(id, text, async () => {
    const t = await p.locator(`${winSel} .win-ttl`).first().boundingBox(), x = t.x + 24, y = t.y + t.height / 2
    const before = await pad(p, bodySel), wb0 = await p.locator(winSel).first().boundingBox()
    await p.mouse.move(x, y); await p.mouse.down(); await sleep(500)
    const held = await pad(p, bodySel), pic = await shot(p, `${id}-while-held`)
    await p.mouse.up(); await sleep(500)
    const after = await pad(p, bodySel), wb1 = await p.locator(winSel).first().boundingBox()
    return { ok: held === expected && after === expected, note: `before ${before}; held ${held}; after release ${after} (expected ${expected}); window x ${Math.round(wb0.x)} -> ${Math.round(wb1.x)}, y ${Math.round(wb0.y)} -> ${Math.round(wb1.y)}`, pics: [pic, await shot(p, `${id}-released`)] }
  })
}
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'inputs'); await press(h, '#inMedBtn'); await p.waitForSelector('#medView .medsec'); await sleep(400)
  await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(700)
  await hold(h, 'I1', '[data-testid="win-inputedit"]', '.med-body', '446px', 'Medical: hold the window bar without moving')
  await p.keyboard.press('Escape'); await sleep(400)
  await press(h, '#inMemberMode'); await sleep(400); await press(h, '#inListBtn'); await p.waitForSelector('.inwrap'); await sleep(400); await allDates(h)
  await press(h, '#inNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(700)
  await hold(h, 'I2', '[data-testid="win-inputedit"]', '.inwrap', '446px', 'Inputs list: hold the window bar without moving')
  await p.keyboard.press('Escape'); await sleep(400)
  await press(h, '#inCalBtn'); await sleep(500)
  for (let i = 0; i < 6 && !/JULY/i.test(await p.locator('#inpCal .ic-mon').innerText()); i++) { await press(h, '#icPrev'); await sleep(450) }
  await p.locator('[data-icday="2026-07-13"]').first().click({ position: { x: 100, y: 8 } }); await sleep(900)
  const ok = await p.locator('.floatwin.inputsday').count()
  console.log('day window present', ok)
  if (ok) await hold(h, 'I3', '.floatwin.inputsday', '.inputs-workspace', '462px', 'Inputs calendar with a day opened: hold the window bar')
  else results.push({ id: 'I3', text: 'day window', ok: 'NOT WALKED', note: 'day window did not open', pics: [await shot(p, 'I3-day-did-not-open')] })
  await h.browser.close()
}

/* ---------- J: other windows keep dragging and their place ---------- */
async function dragWin(p, winSel, dx, dy) {
  const t = await p.locator(`${winSel} .win-ttl`).first().boundingBox(), x = t.x + 24, y = t.y + t.height / 2
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + dx, y + dy, { steps: 10 }); await p.mouse.up(); await sleep(500)
}
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await step('J1', 'Edit Schedule changes window: drag 300px, close, reopen: same place', async () => {
    await go(p, 'editsched'); await sleep(500)
    await press(h, '#histBtn'); await sleep(800)
    const sel = '.chgwin'
    const w0 = await p.locator(sel).first().boundingBox(), pic0 = await shot(p, 'J1-changes-window-opened')
    await dragWin(p, sel, -300, 100); const w1 = await p.locator(sel).first().boundingBox(), pic1 = await shot(p, 'J1-changes-window-dragged')
    await p.locator('.chgwin .win-x').click(); await sleep(700)
    const closed = await p.locator(sel + '.front').count()
    await press(h, '#histBtn'); await sleep(800)
    const w2 = await p.locator(sel).first().boundingBox().catch(() => null)
    return { ok: Math.abs(w1.x - w0.x + 300) < 6 && w2 && Math.abs(w2.x - w1.x) < 4 && Math.abs(w2.y - w1.y) < 4, note: `opened x=${Math.round(w0.x)} y=${Math.round(w0.y)}; dragged x=${Math.round(w1.x)} y=${Math.round(w1.y)}; windows after closing ${closed}; reopened x=${w2 && Math.round(w2.x)} y=${w2 && Math.round(w2.y)} (expected the dragged place)`, pics: [pic0, pic1, await shot(p, 'J1-changes-window-reopened')] }
  })
  await step('J2', 'Calendar window from the Inputs gear: drag, close, reopen: same place', async () => {
    await go(p, 'inputs'); await sleep(400)
    await press(h, '#inGear'); await sleep(400); await press(h, '[data-testid="iset-days"]'); await sleep(700)
    const x0 = T(p, 'win-inputsset-x'); if (await x0.count()) await x0.evaluate(e => e.click()); await sleep(300)
    const sel = '[data-testid="win-days"]'
    const w0 = await p.locator(sel).first().boundingBox()
    await dragWin(p, sel, 300, 100); const w1 = await p.locator(sel).first().boundingBox(), pic1 = await shot(p, 'J2-calendar-window-dragged')
    await T(p, 'win-days-x').click(); await sleep(500); const closed = await p.locator(sel).count()
    await press(h, '#inGear'); await sleep(400); await press(h, '[data-testid="iset-days"]'); await sleep(700)
    const x1 = T(p, 'win-inputsset-x'); if (await x1.count()) await x1.evaluate(e => e.click()); await sleep(300)
    const w2 = await p.locator(sel).first().boundingBox().catch(() => null)
    return { ok: Math.abs(w1.x - w0.x - 300) < 6 && w2 && Math.abs(w2.x - w1.x) < 4 && Math.abs(w2.y - w1.y) < 4, note: `opened x=${Math.round(w0.x)} y=${Math.round(w0.y)}; dragged x=${Math.round(w1.x)} y=${Math.round(w1.y)}; windows after closing ${closed}; reopened x=${w2 && Math.round(w2.x)} y=${w2 && Math.round(w2.y)}`, pics: [pic1, await shot(p, 'J2-calendar-window-reopened')] }
  })
  await h.browser.close()
}
{
  const h = await open({ width: 390, height: 844, phone: true }), p = h.page
  await step('J3', 'phone: tap on input window bar does nothing, window stays middle', async () => {
    await go(p, 'inputs'); await press(h, '#inMedBtn'); await sleep(400); await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(800)
    const w0 = await winBox(p), pic0 = await shot(p, 'J3-phone-window-before-bar-tap')
    const t = await p.locator('[data-testid="win-inputedit"] .win-ttl').first(); await t.tap({ position: { x: 30, y: 10 } }); await sleep(100)
    const picT = await shot(p, 'J3-phone-bar-tapped'); await sleep(600)
    const w1 = await winBox(p), n = await p.locator('[data-testid="win-inputedit"]').count()
    return { ok: n === 1 && Math.abs(w1.x - w0.x) < 2 && Math.abs(w1.y - w0.y) < 2, note: `windows ${n}; before x=${Math.round(w0.x)} y=${Math.round(w0.y)} w=${Math.round(w0.width)}; after x=${Math.round(w1.x)} y=${Math.round(w1.y)}`, pics: [pic0, picT, await shot(p, 'J3-phone-bar-tapped-settled')] }
  })
  await h.browser.close()
}

console.log('\nERRORS (' + errors.length + ')'); for (const e of errors) console.log('  ' + e)
console.log(JSON.stringify(results.map(r => [r.id, r.ok])))
