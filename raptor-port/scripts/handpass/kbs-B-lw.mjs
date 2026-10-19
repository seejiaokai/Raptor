// Walker B — the Leave War boxes: B3, B3b, B4, B5 (credit days + bid-sheet OIL days), B5b. VERSION 1
import { launch, runBox, runControl, prevFocusable, sel, addedOk } from './kbs-B-lib.mjs'
import { appendFileSync } from 'node:fs'
import { RES } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
const only = process.argv[3] || ''
console.log('kbs-B-lw VERSION 1', size, only)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(1200)
const T = id => page.locator(`[data-testid="${id}"]`)
const vis = async id => (await T(id).count()) > 0 && (await T(id).first().isVisible().catch(() => false))
let cn = 0
const row = (id, box, step, did, expected, shown, result, pics, note) => { const r = { id, box, size, step, did, expected, shown, result, pics: pics || [], note: note || '' }; appendFileSync(RES, JSON.stringify(r) + '\n'); console.log(`  [${id} ${size} s${step}] ${result} — shown ${JSON.stringify(shown)}${note ? ' — ' + note : ''}`) }

// ---------- the counter form ----------
const openForm = async (team) => {
  if (!(await vis('counter-form'))) {
    if (!(await vis('settings-sheet'))) { await A.tap(T('settings-open')); await page.waitForTimeout(500) }
    await A.tap(T('counter-add')); await page.waitForTimeout(500)
  }
  if (team) { await A.tap(T('cform-mode-team')); await page.waitForTimeout(400) }
}
const closeSheets = async () => {
  for (const id of ['cform-cancel', 'thresh-close']) if (await vis(id)) await A.tap(T(id)).catch(() => {})
  for (let i = 0; i < 3; i++) { const x = page.locator('.bidsheet button.x:visible').first(); if (await x.count()) await x.click().catch(() => {}); await page.waitForTimeout(250) }
}
const saveCounterThenRead = async (which) => {
  // save the form's counter, then open its Manning sheet and read the threshold
  const nm = 'W' + (++cn) + String(Date.now()).slice(-3)
  await T('cform-name').fill(nm)
  await A.tap(T('cform-save')); await page.waitForTimeout(700)
  await closeSheets()
  if (!(await page.locator('.mwho:visible').count())) { await A.tap(T('counts-toggle')); await page.waitForTimeout(400) }
  const who = page.locator('.mwho', { hasText: nm }).first()
  await who.scrollIntoViewIfNeeded(); await A.tap(who); await page.waitForTimeout(600)
  const v = await A.val(T(which))
  const pic = await A.shot(`B3-persist-${which}`)
  await closeSheets()
  return { v, pic }
}

if (!only || only === 'B3') {
  await openForm(false)
  for (const [slug, nm, tid, nameTxt] of [['amber', 'Amber below', 'cform-amber'], ['red', 'Red below', 'cform-red']]) {
    let pers = null
    await runBox(A, {
      id: 'B3', slug: slug, name: `Leave War ⚙ → ＋ Counter → ${nm}`,
      ensure: async A => { await openForm(false) },
      loc: A => T(tid), prev: A => prevFocusable(T(tid)),
      prior: '0', typed: '3',
      expectText1: 'box holds only "3" (not "03" / "30")',
      expectLeave: '3', expectText2: 'still "3" after leaving (no other normalising)',
      persist: async A => { const r = await saveCounterThenRead(tid.replace('cform', 'thresh')); return r.v },
      persistDid: 'pressed "Add counter", then opened that counter in the Manning list and read its threshold box',
      expectTextPersist: 'the counter\'s Manning sheet shows 3',
      expectPersist: v => v === '3',
    })
    await closeSheets()
  }
  // slot 1's count (Sets / teams)
  await closeSheets()
  await runBox(A, {
    id: 'B3', slug: 'slot1', name: 'Leave War ⚙ → ＋ Counter (Sets / teams) → Slot 1 count',
    ensure: async A => { await openForm(false); if (!(await vis('s0-count'))) { await A.tap(T('cform-mode-team')); await page.waitForTimeout(400) } },
    loc: A => T('s0-count'), prev: A => prevFocusable(T('s0-count')),
    prior: '1', typed: '3',
    expectText1: 'box holds only "3" (not "13" / "31")',
    expectLeave: '3', expectText2: 'still "3" after leaving',
  })
  await closeSheets()
}

// ---------- B3b: a press on the WORDS of the label ----------
if (!only || only === 'B3b') {
  await closeSheets(); await openForm(false)
  const lab = page.locator('[data-testid="counter-form"] >> text=/^\\s*Amber below\\s*$/i').first()
  const labCount = await lab.count()
  if (!labCount) row('B3b', 'Counter form → label "Amber below"', 1, 'find the label words', 'label present', '', 'NOT REACHED', [], 'no element with the label words found')
  else {
    for (const [step, did, act, expected, ok] of [
      [1, 'press the WORDS "Amber below" (not the box), then typed 3', async () => { await page.keyboard.type('3', { delay: 45 }) }, 'box holds only "3" (replaced, as a press on the box does)', v => v === '3'],
    ]) {
      await T('cform-amber').fill('0'); await T('cform-amber').evaluate(e => e.blur()); await page.waitForTimeout(750)
      await lab.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
      await A.pressEl(lab)
      const foc = await A.active()
      await act()
      const v = await A.val(T('cform-amber'))
      const pic = await A.shot('B3b-label-press')
      row('B3b', 'Counter form → label words "Amber below"', step, did, expected, v, ok(v) ? 'PASS' : 'FAIL', [pic], `focus after the press: ${foc}`)
    }
    // press on label then Backspace
    await T('cform-amber').fill('0'); await T('cform-amber').evaluate(e => e.blur()); await page.waitForTimeout(750)
    await A.pressEl(lab); await page.keyboard.press('Backspace'); await page.waitForTimeout(150)
    const v4 = await A.val(T('cform-amber'))
    row('B3b', 'Counter form → label words "Amber below"', 4, 'press the WORDS, then Backspace', 'box is empty', v4, v4 === '' ? 'PASS' : 'FAIL', [await A.shot('B3b-label-backspace')])
  }
  await closeSheets()
}

// ---------- B4: the Manning counter's threshold sheet ----------
if (!only || only === 'B4') {
  await closeSheets(); await openForm(false)
  const nm = 'MAN' + String(Date.now()).slice(-3)
  await T('cform-name').fill(nm); await A.tap(T('cform-save')); await page.waitForTimeout(700); await closeSheets()
  const openManning = async () => {
    if (await vis('manning-sheet')) return
    await closeSheets()
    if (!(await page.locator('.mwho:visible').count())) { await A.tap(T('counts-toggle')); await page.waitForTimeout(400) }
    const who = page.locator('.mwho', { hasText: nm }).first()
    await who.evaluate(e => e.scrollIntoView({ block: 'center' })); await A.tap(who); await page.waitForTimeout(600)
  }
  for (const [slug, tid, label] of [['amber', 'thresh-amber', 'Amber below'], ['red', 'thresh-red', 'Red below']]) {
    await runBox(A, {
      id: 'B4', slug, name: `Leave War → Manning → the counter's sheet → ${label}`,
      ensure: openManning,
      loc: A => T(tid), prev: A => prevFocusable(T(tid)),
      prior: '0', typed: '2',
      expectText1: 'box holds only "2"',
      expectLeave: '2', expectText2: 'still "2" after leaving',
      persist: async A => { await A.tap(page.locator('[data-testid="manning-sheet"] button:has-text("Save")').first()); await page.waitForTimeout(500); await closeSheets(); await openManning(); return await A.val(T(tid)) },
      persistDid: 'pressed Save on the Manning sheet, closed it and opened it again',
      expectTextPersist: 'still "2"',
    })
  }
  await closeSheets()
}

// ---------- B5: the OIL tracker's credit days ----------
if (!only || only === 'B5') {
  await closeSheets()
  const openCredit = async () => {
    if (await vis('oil-amt')) return
    await closeSheets()
    if (!(await vis('oil-sheet'))) { await A.tap(T('oil-tracker')); await page.waitForTimeout(700) }
    await A.tap(page.locator('[data-testid="oil-list"] >> text=Reaper').first()); await page.waitForTimeout(500)
  }
  await runBox(A, {
    id: 'B5', slug: 'credit-days', name: "Leave War → OIL tracker → a person's credit → days box",
    ensure: openCredit,
    loc: A => T('oil-amt'), prev: A => prevFocusable(T('oil-amt')),
    prior: '1', typed: '2',
    expectText1: 'box holds only "2" (type 2 over 1)',
    expectLeave: '2', expectText2: 'still "2" after leaving',
  })
  // close the tracker
  if (await vis('oil-close')) await A.tap(T('oil-close'))
  await page.waitForTimeout(400)
  // the bid sheet's OIL days (admin, a weekend day)
  const openBidOil = async () => {
    if (await vis('oil-days')) return
    await closeSheets()
    if (await vis('oil-close')) await A.tap(T('oil-close'))
    await A.tap(T('month-FEB')); await page.waitForTimeout(900)
    const c = T('cell-stiff-2026-02-07'); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    await A.tap(c); await page.waitForTimeout(600)
    await A.tap(T('bid-oil')); await page.waitForTimeout(500)
  }
  await runBox(A, {
    id: 'B5', slug: 'bid-oil-days', name: "Leave War → a weekend day's sheet (admin) → +OIL → days box",
    ensure: openBidOil,
    loc: A => T('oil-days'), prev: A => prevFocusable(T('oil-days')),
    prior: '1', typed: '2',
    expectText1: 'box holds only "2" (type 2 over 1)',
    expectLeave: '2', expectText2: 'still "2" after leaving',
  })
  await closeSheets()
}

// ---------- B5b: the figures sheet's balance Set ----------
if (!only || only === 'B5b') {
  await closeSheets()
  const openSet = async () => {
    await closeSheets()
    await A.tap(page.locator('[data-testid="person-stiff"]').first()); await page.waitForTimeout(600)
  }
  await openSet()
  const setBtn = T('lve-edit')
  const box = T('lve-input')
  // 1: one press on Set, then type 6
  await A.pressEl(setBtn); await page.waitForTimeout(500)
  const foc = await A.active()
  const s1 = await box.count() ? await sel(box) : null
  await page.keyboard.type('6', { delay: 45 }); await page.waitForTimeout(120)
  let v = await A.val(box)
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', 1, 'one press on "Set", then typed 6 (box held 0)', 'box holds only "6"', v, v === '6' ? 'PASS' : 'FAIL', [await A.shot('B5b-set-typed')], `focus after the press: ${foc}; selection ${s1 && s1.s}-${s1 && s1.e} of ${s1 && s1.len}`)
  // 2: leave with Tab, then Save and look at the figure
  await page.keyboard.press('Tab'); await page.waitForTimeout(400)
  v = await A.val(box)
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', 2, 'left the box with Tab', 'still "6"', v, v === '6' ? 'PASS' : 'FAIL', [await A.shot('B5b-set-left')])
  const save = page.locator('[data-testid="pfig-lve"] button:has-text("Save")').first()
  if (await save.count()) { await A.tap(save); await page.waitForTimeout(600) }
  const shown = await page.locator('[data-testid="pfig-lve"] .fb').first().innerText().catch(() => '')
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', '2b', 'pressed Save, read the LVE figure in the sheet', 'LVE figure shows 6', shown, shown.trim() === '6' ? 'PASS' : 'FAIL', [await A.shot('B5b-saved')])
  // 3: press Set again, then press the box (second press), type 7
  await closeSheets(); await openSet()
  await A.pressEl(setBtn); await page.waitForTimeout(700); await A.pressEl(box)
  await page.keyboard.type('7', { delay: 45 }); await page.waitForTimeout(120)
  v = await A.val(box)
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', 3, 'pressed Set, waited, pressed the box again, typed 7 (box held 6)', '"7" added to "6" ("67" or "76")', v, addedOk('6', v, '7') ? 'PASS' : 'FAIL', [await A.shot('B5b-second-press')])
  // 4: Set then Backspace
  await closeSheets(); await openSet()
  await A.pressEl(setBtn); await page.waitForTimeout(500); await page.keyboard.press('Backspace'); await page.waitForTimeout(150)
  v = await A.val(box)
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', 4, 'one press on Set, then Backspace', 'box is empty', v, v === '' ? 'PASS' : 'FAIL', [await A.shot('B5b-backspace')])
  row('B5b', 'Leave War → person sheet → LVE balance "Set" box', 5, 'Tab into the box from the box before it', 'added', '', 'NOT REACHED', [], 'the box does not exist until "Set" is pressed (and pressing is what opens and focuses it), so there is no way to Tab into it from another box')
  await closeSheets()
}
// ---------- B10: a Required P cell (desktop: its own box in the cell; phone: the app's pad) ----------
if (!only || only === 'B10') {
  await closeSheets()
  await A.tap(T('month-FEB')); await page.waitForTimeout(900)
  const cell = T('req-p-2026-02-10')
  const cellTxt = async () => (await page.evaluate(() => { const e = document.querySelector('[data-testid="req-p-2026-02-10"]'); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return 'cell: ' + e.innerText.trim() + ' | what is drawn at the cell: ' + (top ? top.innerText.trim() : '') }))
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  const BOX = 'Leave War → a Required P cell (10 Feb)'
  if (!A.S.touch) {
    await A.pressEl(cell); await page.waitForTimeout(500)
    await page.keyboard.type('3', { delay: 45 })
    const v3 = await A.val(T('fly-edit-input'))
    row('B10', BOX, '0', 'pressed the cell, typed 3 (baseline)', 'box holds 3', v3, v3 === '3' ? 'PASS' : 'FAIL', [await A.shot('B10-first-3')])
    await page.keyboard.press('Enter'); await page.waitForTimeout(400); await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    const saved = await cellTxt()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    await A.pressEl(cell); await page.waitForTimeout(500)
    const before = await A.val(T('fly-edit-input'))
    await page.keyboard.type('5', { delay: 45 }); await page.waitForTimeout(150)
    const v5 = await A.val(T('fly-edit-input'))
    row('B10', BOX, 1, `the cell held "${saved}"; pressed it again (box opened holding "${before}"), typed 5`, 'the digit replaces: box holds only "5"', v5, v5 === '5' ? 'PASS' : 'FAIL', [await A.shot('B10-second-5')])
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  } else {
    await A.pressEl(cell); await page.waitForTimeout(600)
    await A.pressEl(T('fly-pad-3')); await page.waitForTimeout(300)
    const c3 = await cellTxt()
    row('B10', BOX, '0', 'tapped the cell (the pad opens), tapped pad 3 (baseline)', 'cell shows 3', c3, /drawn at the cell: 3/.test(c3) ? 'PASS' : 'FAIL', [await A.shot('B10-pad-3')])
    await A.pressEl(page.locator('[data-testid="fly-pad"] button:has-text("Done")').first()); await page.waitForTimeout(500)
    const saved = await cellTxt()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    await A.pressEl(cell); await page.waitForTimeout(600)
    await A.pressEl(T('fly-pad-5')); await page.waitForTimeout(300)
    const c5 = await cellTxt()
    row('B10', BOX, 1, `the cell held "${saved}"; tapped it again, tapped pad 5`, 'the first pad digit replaces: cell shows 5', c5, /drawn at the cell: 5/.test(c5) ? 'PASS' : 'FAIL', [await A.shot('B10-pad-5')])
    await A.pressEl(page.locator('[data-testid="fly-pad"] button:has-text("Done")').first()); await page.waitForTimeout(400)
  }
}
console.log('errors', A.errors)
await A.close()
