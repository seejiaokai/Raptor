// lwdl-walk-more.mjs — walks the rest of the decided look: whole leave, held Approve, ranges, the member, every door, remarks. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — the rest: the whole leave (Fable 18 · Astra 8), Approve held by a medical (Fable 12 · Astra 12),
// picked ranges and the drag window (Fable 17 · Astra 9, 10, 11), the member (Fable 20 · Astra 16, 17), the roll-call sweep
// (Fable 25 · Astra 21), remarks pressed on the mark (Astra 18), every door (Fable 24), windows near the edge (Astra 20).
import { run, signIn, press, openCell, isOpen, closeWin, place, cellState, readDecide, pic, T, sleep, closeBrowsers, BASE, gotoMonth } from './lwdl-lib.mjs'
const sh = d => d.map(b => `${b.tid}:"${b.words}" ${b.cls.replace(/dchip |dec /g, '')} dis=${b.disabled} op=${b.opacity} col=${b.color} mark=${b.mark ? b.mark.w : 'none'} title`)
const anyWin = page => page.evaluate(() => ['bid-picker', 'daylist', 'raptor-sheet', 'sel-actions'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) || 'none')
const winSel = w => w === 'sel-actions' ? '.bidsheet' : T(w)

/* the whole leave: Ranger 19–21 Jan, approved */
await run('WHOLE', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  S.note('cells ' + [await cellState(page, 'bane', '2026-01-19'), await cellState(page, 'bane', '2026-01-20'), await cellState(page, 'bane', '2026-01-21')].join(' '))
  await openCell(S, 'bane', '2026-01-20')
  const scope = await page.evaluate(() => ['scope-all', 'scope-day', 'span-range'].map(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e ? t + '=' + e.innerText.trim() + (e.getAttribute('aria-pressed') === 'true' ? '[on]' : '') : t + '=absent' }))
  S.note('scope chips: ' + scope.join(' '))
  let d = await readDecide(page, T('bid-picker')); console.log('     ' + sh(d).join(' || '))
  S.data.all = d.map(b => [b.words, b.cls])
  S.note('whole approved leave opened whole: ' + JSON.stringify(S.data.all))
  await pic(S, '1-all-days', [T('bid-picker')])
  if (await page.locator(T('scope-day')).count()) {
    await press(S, T('scope-day')); await sleep(page, 500)
    d = await readDecide(page, T('bid-picker')); S.data.day = d.map(b => [b.words, b.cls])
    S.note('one day picked: ' + JSON.stringify(S.data.day))
    await pic(S, '2-one-day', [T('bid-picker')])
    S.check(/lit/.test(d[0].cls) && /dec-off/.test(d[1].cls), 'the tapped day alone: Approved lit and ringed, Refuse grey', S.data.day)
    await press(S, T('decide-refuse')); await sleep(page, 700)
    const cs = [await cellState(page, 'bane', '2026-01-19'), await cellState(page, 'bane', '2026-01-20'), await cellState(page, 'bane', '2026-01-21')]
    S.check(cs[1].endsWith(':r') && cs[0].endsWith(':a') && cs[2].endsWith(':a'), 'grey Refuse on the one day refuses only that day', cs)
    await pic(S, '3-grid-after-one-day-refuse', [T('cell-bane-2026-01-19'), T('cell-bane-2026-01-21')], { pad: 30 })
    await closeWin(S)
    for (const dd of ['2026-01-19', '2026-01-20', '2026-01-21']) {
      await openCell(S, 'bane', dd)
      const x = await readDecide(page, T('bid-picker'))
      S.note(`reopen ${dd}: ` + JSON.stringify(x.map(b => [b.words, b.cls.replace(/dchip |dec /g, '')])))
      await pic(S, '4-reopen-' + dd.slice(8), [T('bid-picker')])
      await closeWin(S)
    }
  }
})

/* Approve held by a medical */
await run('HELD', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway', D = '2026-02-19'
  await place(page, P, [D], 'LL')
  const filed = await page.evaluate(() => { try { window.fileInput({ person: 'slipway', date: 'Feb 19', yr: 2026, type: 'OML', remarks: '', allday: true }); return 'ok' } catch (e) { return String(e) } })
  await sleep(page, 600)
  S.note('OML filed: ' + filed + '; cell ' + await cellState(page, P, D))
  await gotoMonth(S, D); await sleep(page, 400)
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-${D}`))
  await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900)
  let w = await anyWin(page); S.note('window: ' + w)
  let d = await readDecide(page, winSel(w)); console.log('     ' + sh(d).join(' || '))
  const ap = d.find(b => /approve/.test(b.tid))
  const title = ap ? await page.evaluate(t => document.querySelector(`[data-testid="${t}"]`)?.title, ap.tid) : null
  S.check(ap && ap.disabled, 'Approve held by the medical: not pressable', ap && [ap.disabled, ap.opacity])
  S.note('held Approve: opacity ' + ap?.opacity + ' title "' + title + '" mark ' + JSON.stringify(ap?.mark))
  await pic(S, '1-held-waiting', [winSel(w)])
  await pic(S, '1-held-waiting-row', [`${winSel(w)} .bp-acts, ${winSel(w)} .dl-acts`], { pad: 10 })
  if (ap) { await page.locator(T(ap.tid)).click({ force: true }).catch(() => {}); await sleep(page, 500) }
  S.check((await cellState(page, P, D)).includes('LL:w'), 'pressing the held Approve does nothing', await cellState(page, P, D))
  const rf = d.find(b => /refuse/.test(b.tid))
  await press(S, T(rf.tid)); await sleep(page, 700)
  S.note('after Refuse: ' + await cellState(page, P, D))
  if ((await anyWin(page)) === 'none') { await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900) }
  w = await anyWin(page)
  d = await readDecide(page, winSel(w)); console.log('     ' + sh(d).join(' || '))
  S.data.heldRefused = d.map(b => ({ t: b.words, cls: b.cls, dis: b.disabled, op: b.opacity, col: b.color, edge: b.edge }))
  const ap2 = d.find(b => /approve/.test(b.tid)), rf2 = d.find(b => /refuse/.test(b.tid))
  S.check(ap2.disabled && /lit/.test(rf2.cls) && /dec-ring/.test(rf2.cls), 'refused: Refuse lit and ringed, the held Approve still not pressable', [ap2.cls, ap2.disabled, rf2.cls])
  S.note('held Approve beside a lit Refused: ' + JSON.stringify(S.data.heldRefused[0]))
  await pic(S, '2-held-refused-row', [`${winSel(w)} .bp-acts, ${winSel(w)} .dl-acts`], { pad: 10 })
  await pic(S, '2-held-refused', [winSel(w)])
})

/* picked ranges: drag window over one man's days, a two-man block, "Pick a range" from a decided day */
await run('RANGE', ['desk'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway'
  const days = ['2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20']
  await place(page, P, ['2026-02-16', '2026-02-17', '2026-02-18', '2026-02-20'], 'LL')
  await openCell(S, P, '2026-02-17'); await press(S, T('decide-approve')); await sleep(page, 600); await closeWin(S)
  await openCell(S, P, '2026-02-18'); await press(S, T('decide-refuse')); await sleep(page, 600); await closeWin(S)
  S.note('cells ' + (await Promise.all(days.map(d => cellState(page, P, d)))).join(' '))
  const drag = async (a, b) => {
    const A = await page.locator(T(a)).boundingBox(), B = await page.locator(T(b)).boundingBox()
    await page.mouse.move(A.x + A.width / 2, A.y + A.height / 2); await page.mouse.down()
    await page.mouse.move(B.x + B.width / 2, B.y + B.height / 2, { steps: 10 }); await page.mouse.up(); await sleep(page, 700)
  }
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-2026-02-18`)); await sleep(page, 300)
  await drag(`cell-${P}-2026-02-16`, `cell-${P}-2026-02-20`)
  let w = await anyWin(page); S.note('after a drag over five days: ' + w + ' ' + await page.locator(T('sel-span')).innerText().catch(() => ''))
  let d = await readDecide(page, '.bidsheet'); console.log('     ' + sh(d).join(' || '))
  S.check(d.length === 2 && d.every(b => b.outline === 'none' && !/lit|dec-off|dec-ring/.test(b.cls) && b.mark), 'mixed range: both waiting, marks drawn, nothing lit, grey or ringed', d.map(b => [b.words, b.cls, !!b.mark]))
  await pic(S, '1-mixed-range', ['.bidsheet', T(`cell-${P}-2026-02-16`), T(`cell-${P}-2026-02-20`)])
  await press(S, T('sel-approve')); await sleep(page, 800)
  const after = await Promise.all(days.map(dd => cellState(page, P, dd)))
  S.note('after the sheet Approve: ' + after.join(' '))
  S.check(after[3] === 'empty', 'the empty day gains no leave', after[3])
  await closeWin(S)
  await pic(S, '2-grid-after-approve', [T(`cell-${P}-2026-02-16`), T(`cell-${P}-2026-02-20`)], { pad: 30 })
  await openCell(S, P, '2026-02-16')
  d = await readDecide(page, T('bid-picker'))
  S.check(/lit/.test(d[0].cls) && /dec-ring/.test(d[0].cls), 'one of those days reopened alone: Approved lit and ringed', d.map(b => b.cls))
  await pic(S, '3-reopen-one', [T('bid-picker')])
  await closeWin(S)
  /* all-approved range */
  await drag(`cell-${P}-2026-02-16`, `cell-${P}-2026-02-17`)
  d = await readDecide(page, '.bidsheet'); S.note('all-approved range: ' + JSON.stringify(d.map(b => [b.words, b.cls])))
  S.check(d.every(b => !/lit|dec-off|dec-ring/.test(b.cls)), 'an all-approved range: still waiting look (the build reading — for his call per Astra 10)', d.map(b => b.cls))
  await pic(S, '4-all-approved-range', ['.bidsheet'])
  await closeWin(S)
  /* two men's block */
  await drag(`cell-${P}-2026-02-16`, `cell-razer-2026-02-18`)
  w = await anyWin(page); S.note('two-row drag: ' + w + ' ' + await page.locator(T('sel-who')).innerText().catch(() => '') + ' ' + await page.locator(T('sel-span')).innerText().catch(() => ''))
  d = await readDecide(page, '.bidsheet'); S.note('two-man sheet: ' + JSON.stringify(d.map(b => [b.words, b.cls, !!b.mark, b.padL, b.padR])))
  await pic(S, '5-two-men', ['.bidsheet'])
  await closeWin(S)
  /* Pick a range from a decided day */
  await openCell(S, P, '2026-02-17')
  if (await page.locator(T('span-range')).count()) {
    await press(S, T('span-range')); await sleep(page, 600)
    d = await readDecide(page, T('bid-picker')); S.note('after Pick a range on an approved day: ' + JSON.stringify(d.map(b => [b.words, b.cls])))
    await pic(S, '6-pick-range', [T('bid-picker')])
    S.check(d.every(b => !/lit|dec-off|dec-ring/.test(b.cls)), 'Pick a range: the day’s ring and grey do not carry over to the range', d.map(b => b.cls))
  } else S.note('no Pick a range chip on that day')
})

/* phone drag: a long press and drag over one man's days (Chromium touch at 402 — WebKit cannot drive it) */
await run('RANGE-PH', ['c402'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway'
  await place(page, P, ['2026-02-16', '2026-02-17', '2026-02-18'], 'LL')
  await gotoMonth(S, '2026-02-17')
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-2026-02-17`)); await sleep(page, 400)
  const A = await page.locator(T(`cell-${P}-2026-02-16`)).boundingBox(), B = await page.locator(T(`cell-${P}-2026-02-18`)).boundingBox()
  const cdp = await page.context().newCDPSession(page)
  const tp = (x, y) => [{ x, y, id: 1 }]
  for (const [label, hold, steps] of [['slow', 700, 12], ['ordinary', 450, 5]]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(A.x + A.width / 2, A.y + A.height / 2) })
    await sleep(page, hold)
    for (let i = 1; i <= steps; i++) { const x = A.x + A.width / 2 + (B.x - A.x) * i / steps; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(x, A.y + A.height / 2) }); await sleep(page, 30) }
    await sleep(page, 90)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(page, 900)
    const w = await anyWin(page)
    S.note(`${label} hold-and-drag: window ${w} ${await page.locator(T('sel-span')).innerText().catch(() => '')}`)
    if (w !== 'none') {
      const d = await readDecide(page, winSel(w)); S.note('buttons ' + JSON.stringify(d.map(b => [b.words, b.cls, !!b.mark, b.padL, b.padR])))
      S.check(d.every(b => !/lit|dec-off|dec-ring/.test(b.cls) && b.mark && b.padL >= 2 && b.padR >= 2), `${label}: waiting look, marks inside the edge`, d.map(b => [b.cls, b.padL, b.padR]))
      await pic(S, `1-drag-${label}`, [winSel(w)])
      await closeWin(S)
    } else await pic(S, `1-drag-${label}-nothing`, [], { full: true })
  }
})

/* the member: nothing to decide anywhere */
await run('MEMBER', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S, 'member')
  const tabs = await page.$$eval('[data-testid^="lw-tab-"]', es => es.map(e => e.dataset.testid))
  S.check(!tabs.includes('lw-tab-approvals'), 'no Approvals tab for a member', tabs)
  for (const [d, what] of [['2026-01-29', 'pending AM'], ['2026-02-02', 'refused'], ['2026-01-20', 'approved 3-day'], ['2026-02-12', 'pending 2-day']]) {
    await gotoMonth(S, d)
    await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-bane-${d}`)); await sleep(page, 300)
    await press(S, T(`cell-bane-${d}`)); await sleep(page, 900)
    const w = await anyWin(page)
    const n = await page.evaluate(() => ({ dec: document.querySelectorAll('.dchip.dec, .appr-ok, .appr-no').length, marks: document.querySelectorAll('svg.dec-ic').length, ring: document.querySelectorAll('.dec-ring, .dec-off').length, words: [...document.querySelectorAll('.bidsheet button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.replace(/\s+/g, ' ').trim()).slice(0, 14) }))
    S.check(n.dec === 0 && n.marks === 0 && n.ring === 0, `member, his ${what} (${d}): no Approve/Refuse, no mark, no ring/grey`, n)
    S.data[d] = { w, ...n }
    await pic(S, `1-${d.slice(5)}-${what.replace(/\W+/g, '')}`, w === 'none' ? [] : [winSel(w)], { full: w === 'none' })
    await closeWin(S)
  }
  // another man's day (Blade 2 Feb pending)
  await gotoMonth(S, '2026-02-02'); await press(S, T('cell-slash-2026-02-02')).catch(() => {}); await sleep(page, 800)
  const n2 = await page.evaluate(() => ({ dec: document.querySelectorAll('.dchip.dec').length, marks: document.querySelectorAll('svg.dec-ic').length }))
  S.check(n2.dec === 0 && n2.marks === 0, 'member on another man’s bid: nothing to decide', n2)
  await pic(S, '2-other-man', [], { full: true }); await closeWin(S)
  if (await page.locator(T('my-leave')).count()) { await press(S, T('my-leave')); await sleep(page, 900)
    const n3 = await page.evaluate(() => ({ dec: document.querySelectorAll('.dchip.dec, .appr-ok, .appr-no').length, marks: document.querySelectorAll('svg.dec-ic').length }))
    S.check(n3.dec === 0 && n3.marks === 0, 'member: My leave shows no decide buttons', n3); await pic(S, '3-my-leave', [], { full: true }); await page.keyboard.press('Escape') }
})

/* member and admin in turn, in the same tab, on real storage (Astra 17) */
await run('TURNS', ['desk'], async S => {
  const page = S.page
  const login = async (u, p) => { await page.waitForSelector('#luser', { timeout: 30000 }); await page.evaluate(() => window.lwSetMemberToday('2026-01-02')); await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 }); await page.evaluate(() => window.lwSetMemberToday('2026-01-02')); await page.evaluate(() => window.go('leavewar')); await sleep(page, 1500) }
  const logout = async () => { await closeWin(S); await page.keyboard.press('Escape'); await page.locator('#logout').click({ timeout: 5000 }).catch(async e => { S.note('Logout press: ' + e.message.split('\n')[0]); await page.evaluate(() => document.getElementById('logout').click()) }); await sleep(page, 900) }
  await page.goto(BASE, { waitUntil: 'commit' })
  await login('us', 'us')
  const D = '2026-02-23'
  S.note('member day before: ' + await cellState(page, 'bane', D))
  await gotoMonth(S, D); await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-bane-${D}`))
  await press(S, T(`cell-bane-${D}`)); await sleep(page, 800)
  await press(S, T('bid-LL')).catch(e => S.note('bid-LL: ' + e.message.split('\n')[0])); await sleep(page, 700)
  if (await isOpen(page)) { await press(S, T('bid-LL')).catch(() => {}); await sleep(page, 700) }
  await closeWin(S)
  S.check((await cellState(page, 'bane', D)) === 'LL:w', 'member placed a pending LL', await cellState(page, 'bane', D))
  const steps = [['decide-approve', 'LL:a'], ['decide-refuse', 'LL:r'], ['decide-refuse', 'LL:w']]
  let i = 0
  for (const [btn, want] of steps) {
    await logout(); await login('ad', 'a'); await page.evaluate(() => window.lwSetViewer(null)); await sleep(page, 300)
    await openCell(S, 'bane', D); await press(S, T(btn)); await sleep(page, 700); await closeWin(S)
    S.check((await cellState(page, 'bane', D)) === want, `admin: ${btn} → ${want}`, await cellState(page, 'bane', D))
    await logout(); await login('us', 'us')
    await gotoMonth(S, D)
    const cs = await cellState(page, 'bane', D)
    S.check(cs === want, `member sees ${want} on the grid`, cs)
    await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-bane-${D}`))
    await press(S, T(`cell-bane-${D}`)); await sleep(page, 800)
    const n = await page.evaluate(() => ({ dec: document.querySelectorAll('.dchip.dec').length, marks: document.querySelectorAll('svg.dec-ic').length }))
    S.check(n.dec === 0 && n.marks === 0, 'no decide buttons left for the member', n)
    await pic(S, `${++i}-member-after-${want.replace(':', '')}`, [], { full: true })
    await closeWin(S)
  }
})

/* roll-call sweep: the header Auto-approve switch above a ringed Approved, Grant OIL, the Legend, the cells */
await run('SWEEP', ['p402', 'desk'], async S => {
  const page = S.page
  await signIn(S)
  await place(page, 'slipway', ['2026-02-17'], 'LL')
  await openCell(S, 'slipway', '2026-02-17'); await press(S, T('decide-approve')); await sleep(page, 700)
  if (!(await isOpen(page))) await openCell(S, 'slipway', '2026-02-17')
  const sw = await page.evaluate(() => { const e = document.querySelector('[data-testid="bid-approve-tick"]'); if (!e) return null; const c = getComputedStyle(e); return { aria: e.getAttribute('aria-checked'), text: e.closest('label,div')?.innerText.slice(0, 30), outline: c.outlineStyle } })
  S.note('header Auto-approve switch: ' + JSON.stringify(sw))
  await pic(S, '1-switch-and-ring', [T('bid-picker')])
  const oil = page.locator('[data-testid="bid-oil"]')
  if (await oil.count()) { await press(S, oil); await sleep(page, 600); await pic(S, '2-grant-oil-open', [T('bid-picker')])
    const fo = await page.evaluate(() => [...document.querySelectorAll('.bidsheet button')].filter(b => /Give|FO/.test(b.innerText) && b.getBoundingClientRect().width > 0).map(b => b.innerText.replace(/\s+/g, ' ') + ' ' + b.className + ' ring=' + getComputedStyle(b).outlineStyle + ' mark=' + !!b.querySelector('.dec-ic')))
    S.note('OIL panel buttons: ' + JSON.stringify(fo))
    S.check(fo.every(x => /mark=false/.test(x)), 'Grant OIL / Give FO wear no decide mark', fo)
    await page.keyboard.press('Escape').catch(() => {}); await sleep(page, 300) } else S.note('no Grant OIL button in this window')
  await closeWin(S)
  const lg = page.locator(T('legend-open'))
  if (await lg.count()) { await press(S, lg); await sleep(page, 600); await pic(S, '3-legend', [], { full: true }); await page.keyboard.press('Escape'); await sleep(page, 300) }
  await pic(S, '4-cells', [T('cell-slipway-2026-02-17'), T('cell-bane-2026-02-02')], { pad: 40 })
})

/* remarks typed, then the mark itself pressed with no blur (Astra 18) */
await run('RMK', ['desk', 'p402', 'p390'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway', D = '2026-02-17'
  await place(page, P, [D], 'LL')
  await openCell(S, P, D)
  const box = page.locator(T('bid-remarks'))
  S.check(await box.count() === 1, 'the Remarks box', await box.count())
  await box.click(); await page.keyboard.type('walk A18 tick')
  const m = await page.locator(`${T('decide-approve')} svg.dec-ic`).boundingBox()
  S.note('the tick: ' + JSON.stringify(m))
  if (S.touch) await page.touchscreen.tap(m.x + m.width / 2, m.y + m.height / 2); else await page.mouse.click(m.x + m.width / 2, m.y + m.height / 2)
  await sleep(page, 800)
  S.check((await cellState(page, P, D)) === 'LL:a', 'a press on the tick approves, as the word does', await cellState(page, P, D))
  if (!(await isOpen(page))) await openCell(S, P, D)
  const v = await page.locator(T('bid-remarks')).inputValue().catch(() => '?')
  S.check(v === 'walk A18 tick', 'the remark survives', v)
  await pic(S, '1-after-tick', [T('bid-picker')])
  /* the cross on the grey Refuse, with a new remark typed */
  await page.locator(T('bid-remarks')).click(); await page.keyboard.press('End'); await page.keyboard.type(' cross')
  const c = await page.locator(`${T('decide-refuse')} svg.dec-ic`).boundingBox()
  if (S.touch) await page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2); else await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2)
  await sleep(page, 800)
  S.check((await cellState(page, P, D)) === 'LL:r', 'a press on the grey cross refuses in one press', await cellState(page, P, D))
  if (!(await isOpen(page))) await openCell(S, P, D)
  const v2 = await page.locator(T('bid-remarks')).inputValue().catch(() => '?')
  S.check(v2 === 'walk A18 tick cross', 'the longer remark survives', v2)
  await pic(S, '2-after-cross', [T('bid-picker')])
})

/* every door to the same approved leave's window (Fable 24) */
await run('DOORS', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  const looks = {}
  const read = async k => { const w = await anyWin(page); const d = w === 'none' ? [] : await readDecide(page, winSel(w)); looks[k] = d.map(b => [b.words, b.cls, b.outline, b.color]); S.note(k + ': ' + w + ' ' + JSON.stringify(looks[k])); await pic(S, k, w === 'none' ? [] : [winSel(w)], { full: w === 'none' }) }
  await openCell(S, 'bruise', '2026-01-08'); await read('1-grid'); await closeWin(S)
  // Approvals' dates → the slim bar → the same cell: first approve a pending line of the same man (Gambit 23 Jan) so a door from Approvals reaches a decided entry
  await press(S, T('lw-tab-approvals')); await sleep(page, 800)
  const idx = await page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].findIndex(l => /23 Jan/.test(l.innerText)))
  await page.locator('[data-testid^="appr-line-"]').nth(idx).locator(T('appr-approve')).click().catch(async () => page.locator('[data-testid^="appr-line-"]').nth(idx).locator(T('appr-approve')).tap())
  await sleep(page, 500)
  await page.locator('[data-testid^="appr-line-"]').nth(idx).locator(T('appr-dates')).click().catch(async () => page.locator('[data-testid^="appr-line-"]').nth(idx).locator(T('appr-dates')).tap())
  await sleep(page, 1200)
  await press(S, T('cell-bruise-2026-01-23')); await sleep(page, 900); await read('2-from-approvals-slim')
  await closeWin(S)
  await openCell(S, 'bruise', '2026-01-23'); await read('3-same-from-grid'); await closeWin(S)
  S.check(JSON.stringify(looks['2-from-approvals-slim']) === JSON.stringify(looks['3-same-from-grid']), 'the same decided entry looks the same from Approvals’ door and the grid', [looks['2-from-approvals-slim'], looks['3-same-from-grid']])
})
await closeBrowsers()
