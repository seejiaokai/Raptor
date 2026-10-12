// D7 — short and sideways: the input's window, the picker and the OIL question at 390x568 and 844x390
import { open, fileInput, shot, sleep, log, errs, browser, press, csId, WIN, pick, swipeIn, inputsOf, goWeek, unfoldWeek, popInfo, toastBox, tapCdp, settleScroll } from './or-D-lib.mjs'

const SIZES = [{ width: 390, height: 568 }, { width: 844, height: 390 }]
const tag = v => `${v.width}x${v.height}`

/* every button / select / input of a root, scrolled to by the root's own scroll, then: is it on screen and does a finger land on it? */
async function reach(page, rootSel, V) {
  return page.evaluate(async ([rootSel, VW, VH]) => {
    const root = document.querySelector(rootSel); if (!root) return { error: 'no root ' + rootSel }
    const vw = VW, vh = VH, innerW = window.innerWidth, innerH = window.innerHeight
    const rr = root.getBoundingClientRect()
    const els = [...root.querySelectorAll('button, select, input, textarea, [role=button]')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.disabled })
    const bad = []
    for (const e of els) {
      e.scrollIntoView({ block: 'center', inline: 'nearest' })
      await new Promise(r => setTimeout(r, 20))
      const b = e.getBoundingClientRect(), x = b.x + b.width / 2, y = b.y + b.height / 2
      const inView = b.left >= 0 && b.right <= vw && b.top >= 0 && b.bottom <= vh
      const top = document.elementFromPoint(x, y)
      const lands = !!top && (top === e || e.contains(top) || top.contains(e) || e.closest('label') === top.closest('label'))
      if (!inView || !lands) bad.push((e.id || e.getAttribute('data-testid') || e.getAttribute('data-pp') || e.getAttribute('data-ph') || e.tagName) + (inView ? '' : ' [not fully on screen]') + (lands ? '' : ' [covered by ' + (top ? top.tagName + '#' + top.id : 'nothing') + ']'))
    }
    root.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })
    return { screen: [vw, vh], pageInnerSize: [innerW, innerH], rootRect: [rr.x, rr.y, rr.width, rr.height].map(Math.round), insideScreen: rr.left >= 0 && rr.right <= vw && rr.top >= 0 && rr.bottom <= vh, controls: els.length, bad }
  }, [rootSel, V.width, V.height])
}
const scrollers = page => page.evaluate(() => { const out = {}; for (const e of document.querySelectorAll('*')) { if (e.scrollTop > 0 && !e.closest('[data-testid="win-inputedit"],#inpEditPop,[data-testid="oilconf"]')) out[(e.id || e.className.toString().slice(0, 24) || e.tagName)] = Math.round(e.scrollTop) } out.winY = Math.round(window.scrollY); out.winX = Math.round(window.scrollX); return JSON.stringify(out) })
async function behind(page, label, x, y) {
  const before = await scrollers(page)
  for (const dy of [-300, -300, -300, 300, 300, 300, 300]) await swipeIn(page, x, y, dy)
  await sleep(3000)
  const after = await scrollers(page)
  log(`D7 ${label}: page behind before = ${before} | after seven swipes inside it (up x3, down x4) = ${after} | unchanged: ${before === after}`)
}

const { ctx, page } = await open({ viewport: { width: 390, height: 844 } })
await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Blade'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
for (const V of SIZES) {
  await page.setViewportSize(V); await sleep(1200)
  const T = tag(V)
  log(`D7 ${T} layout before any window:`, JSON.stringify(await page.evaluate(() => ({ iw: window.innerWidth, ih: window.innerHeight, sw: document.documentElement.scrollWidth }))))
  // ---- the Inputs page's own window: "+ Input"
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(300) }
  await press(page.locator('#inNew')); await page.locator(WIN).waitFor(); await sleep(500)
  await shot(page, `D7-${T}-01-window-top`)
  log(`D7 ${T} "+ Input" window:`, JSON.stringify(await reach(page, WIN, V)))
  // Several people (the picker)
  await press(page.locator(`${WIN} [data-testid="pp-several"]`)); await sleep(400)
  await shot(page, `D7-${T}-02-picker`)
  log(`D7 ${T} picker open (window):`, JSON.stringify(await reach(page, WIN, V)))
  await page.locator(`${WIN} [data-ppgroup="ph"]`).evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await shot(page, `D7-${T}-03-picker-placeholders`)
  await behind(page, `${T} "+ Input" window`, V.width / 2, V.height / 2)
  await shot(page, `D7-${T}-04-after-swipes`)
  await press(page.locator('#inpEditCancel')).catch(async () => { await swipeIn(page, V.width / 2, V.height * 0.7, -700); await press(page.locator('#inpEditCancel')) }); await sleep(400)

  // ---- the OIL question: a Duty on Sat 18 Jul for Ranger, Add, the question opens
  await press(page.locator('#inNew')); await page.locator(WIN).waitFor(); await sleep(400)
  await page.selectOption('#inpEditType', 'Duty')
  await page.selectOption('#inpEditPerson', await csId(page, V.width === 390 ? 'Ranger' : 'Hunter'))
  await pick(page, '2026-07-18')
  await page.locator('#inpEditAllday').isChecked().then(async c => { if (c) await press(page.locator('#inpEditAllday')) }).catch(() => {})
  await page.fill('#inpEditStart', '09:00'); await page.fill('#inpEditEnd', '12:00')
  await page.fill('#inpEditOwnTitle', 'Sat duty ' + T).catch(() => {})
  await press(page.locator('#inpEditSave'), 4000).catch(async e => { log(`D7 ${T} could NOT tap Add:`, String(e).slice(0, 300), '| rect', JSON.stringify(await page.evaluate(() => { const b = document.getElementById('inpEditSave').getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round) }))); await page.evaluate(() => document.getElementById('inpEditSave').click()) }); await sleep(900)
  const q = page.locator('[data-testid="oilconf"]')
  log(`D7 ${T} OIL question opened:`, await q.count())
  if (await q.count()) {
    await shot(page, `D7-${T}-05-oil-question`)
    log(`D7 ${T} OIL question:`, JSON.stringify(await reach(page, '[data-testid="oilconf"]', V)), '| text:', (await q.innerText()).replace(/\s+/g, ' ').slice(0, 260))
    await behind(page, `${T} OIL question`, V.width / 2, V.height * 0.3)
    await shot(page, `D7-${T}-06-oil-after-swipes`)
    const yes = q.locator('button', { hasText: /^Yes/ }).first()
    log('D7 OIL sheet buttons before the answer:', JSON.stringify(await q.evaluate(e => [...e.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || b.id || b.innerText) + (b.disabled ? ':dis' : ':en') + ':' + Math.round(b.getBoundingClientRect().y))))); await yes.tap(); await sleep(400); log('D7 after tapping Yes:', JSON.stringify(await q.evaluate(e => [...e.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || b.id || b.innerText) + (b.disabled ? ':dis' : ':en') + ':' + b.className))))
    await q.locator('[data-testid="oilconf-save"]').tap(); await sleep(900)
    log(`D7 ${T} after answering Yes and Save: question open?`, await q.count(), '| filed:', JSON.stringify((await inputsOf(page, 'Sat duty ' + T)).map(r => ({ who: r.who, s: r.s, oil: r.oil }))))
  }
  if (await page.locator(WIN).count()) { await press(page.locator('#inpEditCancel')).catch(() => {}); await sleep(300) }

  // ---- the window from the schedule (an existing input's window), Wed
  await goWeek(page); await unfoldWeek(page)
  const il = page.locator('#page-editsched .day:not(.peek) .sec-inp .pl-row', { hasText: 'Range brief' }).first()
  await il.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await il.locator('.inpedit').tap(); await sleep(900)
  await shot(page, `D7-${T}-07-sched-window-top`)
  const pi = await popInfo(page)
  log(`D7 ${T} window from the schedule: box`, JSON.stringify({ box: pi.box, gapTop: pi.gapTop, gapBottom: pi.gapBottom, vh: pi.vh, content: pi.content, shown: pi.shown }))
  log(`D7 ${T} window from the schedule:`, JSON.stringify(await reach(page, '#inpEditPop .airpop-box', V)))
  await behind(page, `${T} window from the schedule`, V.width / 2, V.height / 2)
  await shot(page, `D7-${T}-08-sched-after-swipes`)
  log(`D7 ${T} errs so far:`, JSON.stringify(errs))
}
await ctx.close()
log('D7 errs', errs)
await browser.close()
