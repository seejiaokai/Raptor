import * as L from './ivet-B-lib.mjs'
const { WIN, sleep } = L
const browser = await L.launch()
const SET = '[data-testid="win-inputsset"]'
const hint = p => p.evaluate(() => document.querySelector('[data-testid="win-inputedit"] .inped-hint')?.textContent ?? null)
const ticked = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp][aria-pressed="true"]')].map(b => b.textContent.trim().replace(/[A-Z]{1,3}$/, '')))

/* ===== 63 · phone · member Ranger ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', fresh: true, touch: true })
  const T = true
  L.scn(63, 'phone 390x844 (touch)', 'member Ranger (shared inputs he filed himself; the demo four-person one is another man\'s)')
  await L.guard(async () => {
    await L.toList(page, T)
    const one = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-21', rmk: 'S63 one' }))[0]
    await page.locator(`[data-testid="inl-row-${one.iid}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor()
    const h1 = await hint(page), paras = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] p')].map(e => e.textContent.trim()))
    await L.shot(page, 's63-one-person')
    L.chk('an editable one-person input: no instruction paragraph', h1 === null && paras.length === 0, JSON.stringify({ h1, paras }))
    await page.locator('[data-testid="win-inputedit-x"]').tap(); await sleep(300)
    // the demo's four-person meeting is another man's: read-only for Ranger — what does its window say?
    const demo = await page.evaluate(() => window.INPUTS.find(r => r.grp && r.type === 'Meeting' && /Flight safety/.test(r.remarks || ''))?.iid)
    await page.locator(`[data-testid^="inl-row-"][data-iid="${demo}"] [data-testid="inl-open"], [data-testid="inl-row-${demo}"] [data-testid="inl-open"]`).first().tap().catch(() => {})
    await sleep(500)
    if (await page.locator(WIN).count()) { L.info('the demo four-person Meeting (another man\'s) in Ranger\'s window', 'hint: ' + JSON.stringify(await hint(page)) + ' editable save button: ' + (await page.locator('#inpEditSave').count())); await L.shot(page, 's63-demo-shared-readonly'); await page.locator('[data-testid="win-inputedit-x"]').tap(); await sleep(300) }
    // his own four
    const g = await L.fileInput(page, T, { type: 'Meeting', people: ['Echo', 'Ace', 'Wisp'], d1: '2026-07-29', rmk: 'S63 four' })
    const open = async () => { await L.toList(page, T, false); const iids = await page.evaluate(gr => window.INPUTS.filter(r => r.grp === gr).map(r => r.iid), g[0].grp); await page.locator(iids.map(i => `[data-testid="inl-row-${i}"] [data-testid="inl-open"]`).join(', ')).first().tap(); await page.locator(WIN).waitFor() }
    await open()
    const h4 = await hint(page); await L.shot(page, 's63-four')
    L.chk('saved four-person input: "Date changes apply to all 4."', h4 === 'Date changes apply to all 4.', String(h4))
    await page.locator(`${WIN} [data-pp="${await L.csId(page, 'Blade')}"]`).tap()
    const hp = await hint(page)
    L.info('with Blade ticked but NOT yet saved the line reads', String(hp))
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
    await open(); const h5 = await hint(page); await L.shot(page, 's63-five')
    L.chk('after one is added and saved: "…all 5."', h5 === 'Date changes apply to all 5.', String(h5))
    for (const cs of ['Ace', 'Wisp']) await page.locator(`${WIN} [data-pp="${await L.csId(page, cs)}"]`).tap()
    const hq = await hint(page); L.info('with Ace and Wisp unticked but NOT yet saved the line reads', String(hq))
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
    await open(); const h3 = await hint(page); await L.shot(page, 's63-three')
    L.chk('after two are removed and saved: "…all 3."', h3 === 'Date changes apply to all 3.', String(h3))
    await page.locator('[data-testid="win-inputedit-x"]').tap(); await sleep(300)
    // reduce to one in a separate run
    const g2 = await L.fileInput(page, T, { type: 'Meeting', people: ['Echo'], d1: '2026-07-30', rmk: 'S63 two' })
    await L.toList(page, T, false)
    const ii = await page.evaluate(gr => window.INPUTS.filter(r => r.grp === gr).map(r => r.iid), g2[0].grp)
    await page.locator(ii.map(i => `[data-testid="inl-row-${i}"] [data-testid="inl-open"]`).join(', ')).first().tap(); await page.locator(WIN).waitFor()
    const ha = await hint(page)
    await page.locator(`${WIN} [data-pp="${await L.csId(page, 'Echo')}"]`).tap()
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
    const left = await page.evaluate(gr => window.INPUTS.filter(r => r.grp === gr).map(r => window.PEOPLE[r.person].cs), g2[0].grp)
    const rest = await page.evaluate(() => window.INPUTS.find(r => r.remarks === 'S63 two' && window.PEOPLE[r.person].cs === 'Ranger')?.iid)
    await page.locator(`[data-testid="inl-row-${rest}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor()
    const hz = await hint(page); await L.shot(page, 's63-one-left')
    L.chk('two people reduced to one: the shared line "…all 2." before, and none once one person remains', ha === 'Date changes apply to all 2.' && hz === null, JSON.stringify({ ha, hz, left }))
    await page.locator('[data-testid="win-inputedit-x"]').tap()
  })
  await ctx.close()
}

/* ===== 67 · phone · admin Saber, then member Ranger for the effect ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { touch: true, fresh: false })
  const T = true
  L.scn(67, 'phone 390x844 (touch)', 'admin Saber, then member Ranger', 'a persisting world, signed in again after a saved change')
  await L.guard(async () => {
    await L.toCal(page, T)
    const gear = async () => { await L.press(T, page.locator('#inGear')); await page.locator(SET).waitFor() }
    const vals = () => page.evaluate(() => ({ lead: document.querySelector('[data-testid="iset-lead"]')?.value, mf: document.querySelector('[data-testid="iset-memberfile"]')?.checked, mode: document.querySelector('[data-testid="iset-mode-days"]')?.getAttribute('aria-pressed') || document.querySelector('[data-testid="iset-mode-days"]')?.className }))
    const base = await (async () => { await gear(); const v = await vals(); await L.shot(page, 's67-gear-open'); return v })()
    L.info('settings as first opened', JSON.stringify(base))
    // cancel route
    const change = async () => { await page.fill('[data-testid="iset-lead"]', '9'); await page.locator('[data-testid="iset-memberfile"]').evaluate(e => e.click()) }
    await change(); await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    await gear(); const vC = await vals()
    L.chk('Cancel keeps the previous saved settings', JSON.stringify(vC) === JSON.stringify(base), JSON.stringify(vC))
    // X route
    await change(); await L.press(T, page.locator('[data-testid="win-inputsset-x"]')); await sleep(300)
    await gear(); const vX = await vals()
    L.chk('closing by the X keeps the previous saved settings', JSON.stringify(vX) === JSON.stringify(base), JSON.stringify(vX))
    // Escape route
    await change(); await page.keyboard.press('Escape'); await sleep(300)
    const stillOpen = await page.locator(SET).count()
    if (stillOpen) { await page.keyboard.press('Escape'); await sleep(200) }
    await gear().catch(async () => { await sleep(300) }); const vE = await vals()
    L.chk('Escape keeps the previous saved settings', JSON.stringify(vE) === JSON.stringify(base), JSON.stringify({ vE, stillOpen }))
    // valid save
    await page.fill('[data-testid="iset-lead"]', '9'); await page.locator('[data-testid="iset-memberfile"]').evaluate(e => e.click())
    await L.shot(page, 's67-before-save')
    await L.press(T, page.locator('[data-testid="iset-save"]')); await sleep(500)
    await gear(); const vS = await vals()
    L.chk('a valid save is there when reopened (cut-off 9, member filing flipped)', vS.lead === '9' && vS.mf === !base.mf, JSON.stringify(vS))
    // invalid cutoff with the checkbox flipped back
    await page.fill('[data-testid="iset-lead"]', 'abc'); await page.locator('[data-testid="iset-memberfile"]').evaluate(e => e.click())
    await L.press(T, page.locator('[data-testid="iset-save"]')); await sleep(400)
    const msg = await L.toast(page), still = await page.locator(SET).count()
    await L.shot(page, 's67-invalid')
    const hintTxt = await page.evaluate(() => document.querySelector('[data-testid="win-inputsset"]')?.innerText.replace(/\s+/g, ' ').slice(0, 400))
    L.info('after the invalid save', JSON.stringify({ toast: msg, windowStillOpen: still, hintTxt }))
    if (still) await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    await gear(); const vI = await vals()
    L.chk('an invalid cut-off is explained and does NOT quietly save the checkbox change', (!!msg || still === 1) && vI.lead === '9' && vI.mf === vS.mf, JSON.stringify({ msg, still, vI }))
    await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    // undo the two separately
    await L.press(T, page.locator('#undoBtn')); await sleep(400)
    await gear(); const u1 = await vals(); await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    await L.press(T, page.locator('#undoBtn')); await sleep(400)
    await gear(); const u2 = await vals(); await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    L.info('Undo once, Undo twice (the cut-off and the member switch)', JSON.stringify({ afterSave: vS, u1, u2, base }))
    L.chk('the cut-off and the member switch undo as separate steps (one Undo reverses one of them, the second the other)', (u1.lead !== vS.lead) !== (u1.mf !== vS.mf) && JSON.stringify(u2) === JSON.stringify(base), JSON.stringify({ u1, u2 }))
    // redo both so the saved state is "9 / flipped" again, for the member's effect
    await L.press(T, page.locator('#redoBtn')); await sleep(300); await L.press(T, page.locator('#redoBtn')); await sleep(400)
    await gear(); const r2 = await vals(); await L.press(T, page.locator('[data-testid="iset-cancel"]')); await sleep(300)
    L.info('after Redo twice', JSON.stringify(r2))
    // make the member switch OFF for the effect check
    await gear(); const cur = await vals()
    if (cur.mf) { await page.locator('[data-testid="iset-memberfile"]').evaluate(e => e.click()); await L.press(T, page.locator('[data-testid="iset-save"]')); await sleep(500) } else await L.press(T, page.locator('[data-testid="iset-cancel"]'))
    // one saved input change, then sign in as Ranger
    await L.toList(page, T)
    await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-21', rmk: 'S67 saved change' })
    await L.signOut(page); await L.signIn(page, 'us', 'us')
    await L.toList(page, T, false); await L.plus(page, T)
    await page.selectOption('#inpEditType', 'Duty')
    const eff = await page.evaluate(() => ({ sel: document.querySelector('#inpEditPerson')?.options.length ?? 0, fixed: document.querySelector('#inpEditPersonFixed')?.textContent || null, several: document.querySelectorAll('[data-testid="win-inputedit"] [data-testid="pp-several"]').length, gear: document.querySelectorAll('#inGear').length }))
    await L.shot(page, 's67-ranger-switch-off')
    L.chk('with member filing OFF, Ranger\'s Duty is for himself only (a fixed name, no list, no "Several people")', eff.sel <= 1 && eff.several === 0 && (eff.fixed === 'Ranger' || eff.sel === 1), JSON.stringify(eff))
    await page.locator('#inpEditCancel').tap()
    await L.signOut(page); await L.signIn(page, 'ad', 'a')
    await L.toCal(page, T); await gear(); await page.locator('[data-testid="iset-memberfile"]').evaluate(e => e.click()); await L.press(T, page.locator('[data-testid="iset-save"]')); await sleep(500)
    await L.signOut(page); await L.signIn(page, 'us', 'us')
    await L.toList(page, T, false); await L.plus(page, T); await page.selectOption('#inpEditType', 'Duty')
    const eff2 = await page.evaluate(() => ({ sel: document.querySelector('#inpEditPerson')?.options.length ?? 0, several: document.querySelectorAll('[data-testid="win-inputedit"] [data-testid="pp-several"]').length }))
    await L.shot(page, 's67-ranger-switch-on')
    L.chk('with it back ON, Ranger\'s Duty offers other people (a list and "Several people")', eff2.sel > 5 && eff2.several === 1, JSON.stringify(eff2))
  })
  await ctx.close()
}

/* ===== 68 · desktop · admin Saber, then member Ranger ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { fresh: false })
  const T = false
  L.scn(68, 'desktop 1440x900', 'admin Saber, then member Ranger')
  await L.guard(async () => {
    await L.toCal(page, T)
    await page.locator('#inGear').click(); await page.locator(SET).waitFor()
    const viaGear = await page.locator(SET).innerText().then(t => t.replace(/\s+/g, ' '))
    await L.shot(page, 's68-gear')
    await page.keyboard.press('Escape'); await sleep(300)
    if (await page.locator(SET).count()) await page.locator('[data-testid="iset-cancel"]').click()
    await page.evaluate(() => window.go('logic')); await sleep(800)
    const rows = await page.evaluate(() => [...document.querySelectorAll('#page-logic .lgopen')].map(b => ({ text: b.textContent.trim(), row: b.closest('div,section,li')?.parentElement?.innerText.replace(/\s+/g, ' ').slice(0, 260) })))
    L.info('Logic rows with the settings button', JSON.stringify(rows))
    L.chk('the Logic page offers the Inputs settings button on its rows', rows.filter(r => /^Inputs calendar settings/.test(r.text)).length >= 1, JSON.stringify(rows.map(r => r.text)))
    const btns = page.locator('#page-logic .lgopen')
    const outs = []
    for (let i = 0; i < await btns.count(); i++) {
      if (!/^Inputs calendar settings/.test(await btns.nth(i).innerText())) continue
      await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await sleep(500)
      const open = await page.locator(SET).count()
      const txt = open ? (await page.locator(SET).innerText()).replace(/\s+/g, ' ') : null
      if (i === 0) await L.shot(page, 's68-logic-opened')
      outs.push({ i, open, same: txt === viaGear })
      if (open) { await page.keyboard.press('Escape'); await sleep(250); if (await page.locator(SET).count()) await page.locator('[data-testid="iset-cancel"]').click(); await sleep(250) }
    }
    L.chk('every Logic row opens the same settings window with the same words as the gear', outs.length >= 1 && outs.every(o => o.open === 1 && o.same), JSON.stringify(outs))
    L.chk('the shortened helper lines are there through the Logic route', /Day, night or no-fly dates, and holidays\./.test(viaGear) && /Later than this is LATE\. Medical is never late\./.test(viaGear) && /Never leave, medical or SANS\./.test(viaGear), viaGear.slice(0, 300))
    // Calendar…
    await L.toCal(page, T)
    await page.locator('#inGear').click(); await page.locator(SET).waitFor()
    await page.locator('[data-testid="iset-days"]').click(); await sleep(700)
    const after = await page.evaluate(() => ({ wins: [...document.querySelectorAll('[data-testid^="win-"]')].map(w => w.dataset.testid), setOpen: !!document.querySelector('[data-testid="win-inputsset"]'), ttl: [...document.querySelectorAll('[data-testid^="win-"] .win-ttl')].map(t => t.textContent) }))
    await L.shot(page, 's68-calendar-config')
    L.chk('"Calendar…" opens the calendar configuration window', after.wins.length > 0 && after.wins.some(w => /day/i.test(w)), JSON.stringify(after))
    await page.keyboard.press('Escape'); await sleep(300)
    for (let k = 0; k < 3 && await page.locator('[data-testid^="win-"]').count(); k++) { await page.keyboard.press('Escape'); await sleep(250) }
    const back = await page.locator(SET).count()
    L.info('after closing the calendar window the settings window is', back ? 'still there (return works)' : 'gone')
    // a saved change, then Ranger
    await L.toList(page, T); await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-21', rmk: 'S68 saved change' })
    await L.signOut(page); await L.signIn(page, 'us', 'us')
    await L.toCal(page, T)
    const g = await page.locator('#inGear').count()
    await page.evaluate(() => window.go('logic')).catch(() => {}); await sleep(800)
    const lg = await page.evaluate(() => ({ page: document.querySelector('#page-logic')?.getBoundingClientRect().width > 0, btns: document.querySelectorAll('#page-logic .lgopen').length }))
    let opened = null
    if (lg.btns) { await page.locator('#page-logic .lgopen').first().click().catch(() => {}); await sleep(500); opened = await page.locator(SET).count(); await L.shot(page, 's68-ranger-logic'); if (opened) { opened = { save: await page.locator('[data-testid="iset-save"]').count(), words: (await page.locator(SET).innerText()).replace(/\s+/g, ' ').slice(0, 200) } } }
    L.chk('Ranger has no Inputs gear', g === 0, String(g))
    L.chk('Ranger has no working admin settings route through Logic (no Logic buttons, or the window opens without a Save)', lg.btns === 0 || !opened || opened.save === 0 || opened === 0, JSON.stringify({ lg, opened }))
  })
  await ctx.close()
}

/* ===== 69 · phone · guest ===== */
{
  const ctx = await browser.newContext({ viewport: L.PHONE, isMobile: true, hasTouch: true }); const page = await ctx.newPage()
  L.scn(69, 'phone 390x844', 'guest')
  await L.guard(async () => {
    await page.goto(L.BASE + '?fresh=1'); await sleep(800)
    const card = await page.evaluate(() => ({ buttons: [...document.querySelectorAll('button, a')].filter(b => b.offsetParent).map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 40)), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) }))
    await L.shot(page, 's69-card')
    L.notRun('the guest / view-only boundary', 'the sign-in card offers no guest route — only username, password and "Sign in" (' + JSON.stringify(card.buttons) + '); no account was created and no unknown name was tried')
  })
  await ctx.close()
}
await browser.close()
L.save('s63-69')
