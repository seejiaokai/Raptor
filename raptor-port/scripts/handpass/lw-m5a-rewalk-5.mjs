// M5a re-walk 5 — the code read's finding 3: an AM LL (approved) and a PM CL (pending) on one day; the CL re-typed → only that line dotted.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r5'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, vis, txt, pwRead, closePw, shotD } = R
console.log('[lw-m5a-rewalk-5 v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
const DAY = '2026-04-21'
const ids = () => P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /^(bid-|decide-|portion-|day-|dl-|daylist)/.test(e.dataset.testid)).map(e => e.dataset.testid).join(' '))
try {
  await L.signIn(w, 'admin')
  await L.openGrid(w); await press(w, T('month-APR')); await P.waitForTimeout(1000)
  await L.openCell(w, 'bane', DAY)
  await L.approveWhatIEnter(w, true)
  await press(w, T('portion-am')); await P.waitForTimeout(250)
  const a = await L.placeLeave(w, 'LL'); await L.closeWin(w)
  await L.openCell(w, 'bane', DAY)
  await L.approveWhatIEnter(w, false)
  const lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="portion-"]')].map(e => e.dataset.testid + ':' + (e.getAttribute('aria-pressed') ?? e.className.includes('on'))).join(' '))
  await press(w, T('portion-pm')); await P.waitForTimeout(250)
  const b = await L.placeLeave(w, 'CL'); await L.closeWin(w)
  await shotD(w, '01-both-halves')
  note('X0 Saber places LL AM (approved) and CL PM (pending) on Tue 21 Apr for Ranger', S, ok(a && b), `LL AM placed ${a}; CL PM placed ${b}; portion buttons at the second opening: ${lit}`, ['01-both-halves'])
  // Ranger's visit
  await L.switchTo(w, 'member'); await L.openGrid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(700)
  const p0 = await pwRead(P)
  await closePw(w)
  note('X1 Ranger opens his window: both halves of 21 Apr listed, no dots', S, ok(p0.lines.filter(l => /Tue 21 Apr/.test(l.text)).length === 2 && !p0.lines.some(l => l.dot)), p0.lines.filter(l => /21 Apr/.test(l.text)).map(l => l.text).join(' | '), [])
  // Saber re-types the CL
  await L.switchTo(w, 'admin'); await L.openGrid(w); await press(w, T('month-APR')); await P.waitForTimeout(1000)
  await L.reachCell(w, 'bane', DAY)
  await press(w, T(`cell-bane-${DAY}`)); await P.waitForTimeout(800)
  console.log('what opened:', await ids())
  await shotD(w, '02-day-opened')
  const bidOpen = await vis(P, T('bid-picker'))
  let retyped = false, how = ''
  if (bidOpen) {
    const pm = P.locator(T('portion-pm')); if (await pm.count()) { await press(w, T('portion-pm')); await P.waitForTimeout(250) }
    await shotD(w, '03-bid-window-pm')
    retyped = await L.placeLeave(w, 'FCL'); how = 'the bid window, PM lit, FCL pressed'
    await L.closeWin(w)
  } else {
    /* the day's list has Approve / Refuse / Move / Delete per entry and no re-type: try the drag window over Tue 21 - Wed 22 Apr, PM lit */
    await press(w, T('daylist-close')); await P.waitForTimeout(400)
    await L.reachCell(w, 'bane', DAY)
    const aB = await P.locator(T(`cell-bane-${DAY}`)).first().boundingBox(), bB = await P.locator(T('cell-bane-2026-04-22')).first().boundingBox()
    await P.mouse.move(aB.x + aB.width / 2, aB.y + aB.height / 2); await P.mouse.down()
    await P.mouse.move(bB.x + bB.width / 2, bB.y + bB.height / 2, { steps: 12 }); await P.waitForTimeout(300); await P.mouse.up(); await P.waitForTimeout(800)
    await shotD(w, '03-drag-window')
    console.log('drag opened:', await vis(P, T('sel-span')), await txt(P, T('sel-span')))
    console.log('drag ids:', await P.evaluate(() => [...document.querySelectorAll('[data-testid^="sel-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid).join(' ')))
    if (await vis(P, T('sel-span'))) {
      const pmSel = P.locator('[data-testid^="portion-pm"], [data-testid="sel-portion-pm"]')
      if (await pmSel.count()) { await pmSel.first().click(); await P.waitForTimeout(300) }
      await shotD(w, '03b-drag-window-pm')
      if (await P.locator(T('sel-FCL')).count()) {
        await press(w, T('sel-FCL')); await P.waitForTimeout(700)
        if (await vis(P, T('sel-span'))) { await press(w, T('sel-FCL')); await P.waitForTimeout(700) }
        retyped = !(await vis(P, T('sel-span'))); how = 'the drag window over 21-22 Apr, PM lit, FCL pressed'
      }
      if (await vis(P, T('sel-span'))) await press(w, T('sel-cancel')).catch(() => {})
    }
    if (!retyped) how = 'the tap opened the day\'s list (no re-type there); the drag window did not give a re-type: ' + how
  }
  await shotD(w, '04-after-retype')
  note('X2 Saber re-types the CL half to FCL', S, retyped ? 'PASS' : 'NOT WALKED', how, ['02-day-opened', '03-bid-window-pm', '04-after-retype'])
  // Ranger opens his window again
  await L.switchTo(w, 'member'); await L.openGrid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  const p1 = await pwRead(P); await shotD(w, '05-ranger-after')
  const l21 = p1.lines.filter(l => /21 Apr/.test(l.text))
  const fcl = l21.find(l => /FCL/.test(l.text)), ll = l21.find(l => /LL/.test(l.text))
  await P.locator('[data-testid="pw-line-2026-04-21"]').first().scrollIntoViewIfNeeded().catch(() => {}); await P.waitForTimeout(400); await shotD(w, '06b-ranger-scrolled-to-21-apr'); await P.screenshot({ path: `${L.OUT}/06-ranger-after-crop.png`, clip: { x: 940, y: 380, width: 590, height: 470 } }).catch(() => {})
  note('X3 Ranger\'s window: the FCL line dotted ("changed from CL by Saber"), the untouched LL line NOT dotted', S, ok(!!fcl && fcl.dot && !!ll && !ll.dot), `lines for 21 Apr: ${l21.map(l => `${l.text} [dot ${l.dot}] "${l.who}"`).join(' || ')}; all dotted: ${p1.lines.filter(l => l.dot).map(l => l.text).join(' | ')}`, ['05-ranger-after', '06-ranger-after-crop'])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r5')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
