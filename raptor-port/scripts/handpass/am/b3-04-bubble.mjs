/* b3-04 — ITEM 10 (D105): the History bubble stays, and a long one scrolls inside itself. One detail edited 13 times on
   the board, then History on:
     desktop — hover shows the whole story; the pointer can travel from the cell INTO the bubble and wheel-scroll its
               list without the bubble vanishing; leaving puts it down;
     phone   — a tap shows the last lines and "all N changes"; that expands it; a FINGER scrolls the list; and the tap
               still arms a seat / focuses a field underneath (the History contract).
   Walker B3, 25 Sep 26. Usage (from raptor-port/): node scripts/handpass/am/b3-04-bubble.mjs [desktop|phone] */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, login, check, note, summary, STATE, DESK, PHONE, RESULTS, BASE } = L
import { writeFileSync, existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
const SH = process.env.HP_SHOTS
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const DI = 4, N = 13

/* a phone that really touches: isMobile + hasTouch, so a finger scroll can be synthesised */
async function openTouch() {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ ...PHONE, deviceScaleFactor: 3, isMobile: true, hasTouch: true, storageState: STATE })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, 'a')
  return { browser, ctx, page, errors }
}
const bub = page => page.evaluate(() => {
  const b = document.querySelector('.histbub'); if (!b || !b.isConnected) return null
  const r = b.getBoundingClientRect(), ol = b.querySelector('.hb-all'), lr = ol && ol.getBoundingClientRect()
  return { vis: getComputedStyle(b).visibility, rows: b.querySelectorAll('.hb-all li').length, scroll: !!(ol && ol.classList.contains('scroll')),
    more: (b.querySelector('[data-histmore]') || {}).innerText || '', top: ol ? Math.round(ol.scrollTop) : null, sh: ol ? ol.scrollHeight : 0, ch: ol ? ol.clientHeight : 0,
    box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
    list: lr ? { x: Math.round(lr.left), y: Math.round(lr.top), w: Math.round(lr.width), h: Math.round(lr.height) } : null,
    last: ((b.querySelector('.hb-all li:last-child') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 60) }
})
async function histOn(page) {
  const b = page.locator('#schedBoard #sbHist:visible').first()
  if (!(await b.count())) return 'NO HISTORY BUTTON'
  if (!(await b.evaluate(e => e.classList.contains('on')))) { await b.click(); await page.waitForTimeout(400) }
  return (await b.evaluate(e => e.classList.contains('on'))) ? 'on' : 'off'
}

for (const w of which) {
  const P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### item 10 — ${w} #####`)
  /* the phone runs as every other phone walk does (390 wide, DPR 3, taps as clicks): a Playwright isMobile context
     widened the layout past the app's 820px phone line (measured in b3-04c: matchMedia said "not a phone"), so it
     would have walked the DESKTOP bubble. Touch input is switched on over CDP for the finger scroll alone. */
  const { browser, page, errors } = w === 'phone' ? await openHi({ ...PHONE, state: STATE, dpr: 3 }) : await openHi({ ...DESK, state: STATE, dpr: 1 })
  await editWeek(page); await board(page, DI)
  const key = await page.evaluate(i => { const e = [...document.querySelectorAll(`#schedBoard [data-bfld^="ap:${i}."][data-bfld$=".str"]`)].find(x => x.offsetWidth); return e ? e.dataset.bfld : null }, DI)
  const sel = `#schedBoard [data-bfld="${key}"]:visible`
  /* edit ONE detail 13 times, through the box itself */
  for (let k = 1; k <= N; k++) {
    const el = page.locator(sel).first()
    await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await el.click({ force: true }); await el.fill(''); await el.type(`07${String(k).padStart(2, '0')}`, { delay: 5 })
    await el.evaluate(e => e.blur()); await page.waitForTimeout(150)
  }
  const val = await page.locator(sel).first().inputValue()
  check(`${P}.H0 one detail (${key}) edited ${N} times through its own box`, val === `07:${String(N).padStart(2, '0')}`, val)
  note(`${P}.H0 History`, await histOn(page))
  const el = page.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const cb = await el.boundingBox()

  if (w === 'desktop') {
    await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.waitForTimeout(400)
    let b = await bub(page)
    check('d.H1 hover shows the story — every change, the newest last', b && b.rows >= N && /07:13/.test(b.last), JSON.stringify(b && { rows: b.rows, last: b.last }))
    check('d.H1 a long story is capped and scrolls inside itself (D105)', b && b.scroll && b.sh > b.ch, JSON.stringify(b && { sh: b.sh, ch: b.ch, scroll: b.scroll }))
    await page.screenshot({ path: `${SH}/d-H1-hover-long-story.png` })
    /* travel from the cell into the list, the way a hand moves a mouse: several paths, each fresh */
    const results = []
    for (const steps of [1, 6, 20]) {
      await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.waitForTimeout(350)
      b = await bub(page)
      if (!b || !b.list) { results.push({ steps, start: 'NO BUBBLE' }); continue }
      const tx = b.list.x + b.list.w / 2, ty = b.list.y + b.list.h / 2
      await page.mouse.move(tx, ty, { steps }); await page.waitForTimeout(500)
      const inside = await bub(page)
      let scrolled = null
      if (inside) {
        const t0 = inside.top
        await page.mouse.wheel(0, -150); await page.waitForTimeout(350)
        const after = await bub(page)
        scrolled = after ? { from: t0, to: after.top, still: true } : { from: t0, still: false }
      }
      results.push({ steps, reached: !!inside, scrolled })
      if (steps === 20 && inside) await page.screenshot({ path: `${SH}/d-H2-pointer-in-bubble-scrolled.png` })
    }
    note('d.H2 cell → list, by path length', JSON.stringify(results))
    check('d.H2 the pointer can move from the cell INTO the bubble without it vanishing (a hand-like path, 6 and 20 steps)', results.filter(r => r.steps > 1).every(r => r.reached), JSON.stringify(results))
    check('d.H2 …and the wheel scrolls the bubble\'s own list, the bubble staying up', results.filter(r => r.steps > 1).every(r => r.scrolled && r.scrolled.still && r.scrolled.to < r.scrolled.from), JSON.stringify(results))
    /* leaving the bubble for the page puts it down */
    await page.mouse.move(700, 870, { steps: 8 }); await page.waitForTimeout(600)
    b = await bub(page)
    check('d.H3 leaving the bubble for elsewhere puts it down', !b, JSON.stringify(b))
    /* the click still edits underneath: with History on, a click in the box focuses it */
    await el.click(); await page.waitForTimeout(200)
    const foc = await page.evaluate(() => (document.activeElement || {}).dataset?.bfld || '')
    check('d.H4 with History on, a click on the detail still focuses it for editing', foc === key, foc)
  } else {
    /* the phone: a TAP (touch) on the detail */
    await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.waitForTimeout(500)
    let b = await bub(page)
    const foc = await page.evaluate(() => (document.activeElement || {}).dataset?.bfld || '')
    check('p.H1 a tap shows the bubble with the last lines and "all N changes"', b && b.rows === 3 && new RegExp(`all ${N} changes`).test(b.more), JSON.stringify(b && { rows: b.rows, more: b.more }))
    check('p.H1 …and the same tap still focuses the detail underneath (History does not take the tap)', foc === key, foc)
    await page.screenshot({ path: `${SH}/p-H1-tap-bubble.png` })
    /* expand */
    const more = page.locator('.histbub [data-histmore]').first()
    if (await more.count()) { const mb = await more.boundingBox(); await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await page.waitForTimeout(500) }
    b = await bub(page)
    check('p.H2 "all N changes" expands the whole story', b && b.rows >= N, JSON.stringify(b && { rows: b.rows }))
    check('p.H2 the expanded list is capped and scrolls inside itself', b && b.scroll && b.sh > b.ch, JSON.stringify(b && { sh: b.sh, ch: b.ch }))
    await page.screenshot({ path: `${SH}/p-H2-expanded.png` })
    /* a finger drag on the list */
    if (b && b.list) {
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
      const x = Math.round(b.list.x + b.list.w / 2), y = Math.round(b.list.y + b.list.h / 2)
      const tries = []
      /* 1: Chromium's own synthetic touch scroll */
      let t0 = (await bub(page)).top
      await cdp.send('Input.synthesizeScrollGesture', { x, y, yDistance: 160, gestureSourceType: 'touch', speed: 600 })
      await page.waitForTimeout(500)
      let a = await bub(page); tries.push({ how: 'synthesizeScrollGesture touch', from: t0, to: a && a.top, up: !!a })
      /* 2: a raw finger drag, touchStart → moves → touchEnd, downwards (to reveal the older lines above) */
      t0 = a ? a.top : t0
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y - 60 }] })
      for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 60 + i * 18 }] }); await page.waitForTimeout(16) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await page.waitForTimeout(500)
      a = await bub(page); tries.push({ how: 'dispatchTouchEvent drag', from: t0, to: a && a.top, up: !!a })
      /* 3: control — a mouse wheel over the same list (not a finger) */
      t0 = a ? a.top : t0
      await page.mouse.move(x, y); await page.mouse.wheel(0, -120); await page.waitForTimeout(400)
      a = await bub(page); tries.push({ how: 'mouse wheel (control)', from: t0, to: a && a.top, up: !!a })
      note('p.H3 scrolling the expanded list', JSON.stringify(tries))
      const finger = tries.slice(0, 2).some(t => t.up && t.to != null && t.to < t.from)
      check('p.H3 a finger scrolls the expanded list, and the bubble stays up', finger, JSON.stringify(tries))
      await page.screenshot({ path: `${SH}/p-H3-finger-scrolled.png` })
    }
    /* the tap still acts underneath, History on: an EMPTY seat arms (the crew list opens for it) */
    await page.mouse.click(5, 400); await page.waitForTimeout(300)
    const emptyKey = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-boardwrap [data-slot]')].find(s => s.offsetWidth && !s.querySelector('[data-person]') && !s.dataset.person); return e ? e.dataset.slot : null })
    const seat = page.locator(`#schedBoard [data-slot="${emptyKey}"]:visible`).first()
    await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
    const sb = await seat.boundingBox()
    await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.waitForTimeout(500)
    const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || '')
    check(`p.H4 with History on, a tap on an empty seat (${emptyKey}) still ARMS it (the History contract)`, armed === emptyKey, armed)
    await page.screenshot({ path: `${SH}/p-H4-seat-armed-history-on.png` })
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  }
  check(`${P}.H: no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
const fl = summary('b3-04-bubble')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-04.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = fl ? 1 : 0
