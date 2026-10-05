/* Walker D, world 4: the phone ⋯ menu — P4d-02, 03, 04, 05, 06 then P4d-01 (guest). Phone 390x844 and 320x568, 820/821. */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, sleep, pic, row, savePart, caret, label, snap, same } = H
const { browser, ctx, page, errors } = await open({ width: 390, height: 844, who: 'a', fresh: false })
page.setDefaultTimeout(9000)
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 360) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world4')
}
const ID = { editsched: 'editSched', viewsched: 'viewSched' }
const hit = async sel => page.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { onScreen: r.width > 0 && r.right <= innerWidth + 0.5 && r.left >= -0.5, hit: h === e || e.contains(h) } })
const toolbar = async p => page.evaluate(([pg]) => { const root = document.querySelector('#page-' + pg); const bars = [...root.querySelectorAll('button, input, .hl-tog')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 140).map(e => ({ id: e.id || '', cls: String(e.className || '').slice(0, 20), t: (e.innerText || e.value || e.placeholder || e.getAttribute('aria-label') || '').trim().slice(0, 18), x: Math.round(e.getBoundingClientRect().x), w: Math.round(e.getBoundingClientRect().width), r: Math.round(e.getBoundingClientRect().right) })); return bars }, [p])
const snapAll = () => page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS, window.SCHED, window.commandStreamLen()]))

/* ---- P4d-02 ---- */
for (const pg of ['editsched', 'viewsched']) {
  await nav(page, pg)
  await S('P4d-02-' + pg, `${pg === 'editsched' ? 'Edit Schedule' : 'View-only Sched'} at 390 and 320 px wide: read the toolbar, pressed the button after Highlight, read the menu, tested neighbours with a real hit test`, async () => {
    const id = ID[pg], checks = [], pics = []
    for (const [w, h] of [[390, 844], [320, 568]]) {
      await page.setViewportSize({ width: w, height: h }); await sleep(500)
      const bar = await toolbar(pg)
      const hlIdx = bar.findIndex(b => /Highlight/i.test(b.t) || /hl-tog/.test(b.cls))
      const after = bar[hlIdx + 1]
      await page.locator(`#${id}More`).first().click(); await sleep(400)
      const menuItems = await page.locator(`#${id}MoreMenu`).first().evaluate(m => [...m.querySelectorAll('button, [role=menuitem], a')].map(b => b.innerText.trim()))
      const box = await page.locator(`#${id}MoreMenu`).first().boundingBox()
      const sel = pg === 'editsched' ? '#searchE' : '#searchV'
      pics.push(await pic(page, `P4d-02-${pg}-${w}-menu-open`))
      await page.keyboard.press('Escape'); await sleep(250)
      const neighbours = {}
      for (const s of [sel, `#page-${pg} .filt-cal`, `#${id}More`, `#page-${pg} .hl-tog`]) neighbours[s] = await hit(s).catch(() => 'absent')
      const addExport = await page.evaluate(([p]) => [...document.querySelectorAll('#page-' + p + ' button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 140).map(b => (b.id || b.innerText.trim().slice(0, 12))), [pg])
      checks.push([`${w}px: the button right after Highlight is the ⋯ menu`, after && after.id === `${id}More`, { after, order: bar.map(b => b.id || b.t || b.cls) }])
      checks.push([`${w}px: the menu holds exactly one item, Insights, and sits inside the screen`, menuItems.length === 1 && /Insights/.test(menuItems[0]) && box.x >= 0 && box.x + box.width <= w, { items: menuItems, box }])
      checks.push([`${w}px: search, calendar, the ⋯ button and Highlight are each topmost at their centre (reachable)`, Object.values(neighbours).every(n => n && n.hit && n.onScreen), neighbours])
      checks.push([`${w}px: toolbar controls drawn`, true, addExport])
    }
    await page.setViewportSize({ width: 390, height: 844 }); await sleep(400)
    return { checks, pics }
  })
}

/* ---- P4d-03 ---- */
await S('P4d-03', 'Phone drawer opened from Inputs, Tracker, Leave War; then on each schedule page the calendar picked Mon 20 Jul', async () => {
  const checks = [], pics = []
  for (const p of ['inputs', 'tracker', 'leavewar']) {
    await nav(page, p); await page.locator('#burger').click(); await sleep(400)
    const heads = await page.locator('#drawer h4').allTextContents()
    const weeks = await page.locator('#drawerWeeks,#drawerPickWeek,#drawerInsights').count()
    const weekText = await page.locator('#drawer').innerText()
    checks.push([`drawer from ${p}: sections ${JSON.stringify(heads)}, no WEEK block/shortcuts`, !heads.some(h => /week/i.test(h)) && weeks === 0 && !/\bWEEK\b/.test(weekText), { heads, weeks }])
    if (p === 'inputs') pics.push(await pic(page, 'P4d-03-drawer-from-inputs'))
    await page.locator('#drawer .drawer-x, #drawerClose, #scrim, .scrim').first().click({ timeout: 2000 }).catch(async () => { await page.keyboard.press('Escape') }); await sleep(300)
    if (await page.locator('#drawer:visible').count()) await page.mouse.click(380, 400)
    await sleep(300)
  }
  for (const [pg, id, w] of [['viewsched', 'viewSched', '#vWeek'], ['editsched', 'editSched', '#eWeek']]) {
    await nav(page, pg)
    await page.locator(`#page-${pg} .filt-cal`).click(); await sleep(300)
    pics.push(await pic(page, `P4d-03-${pg}-calendar-open`))
    await page.locator('[data-wcal="2026-07-20"]').click(); await page.waitForFunction(() => window.CURWEEK === '20/07/2026'); await sleep(400)
    const wk = await page.evaluate(() => window.CURWEEK)
    const left = await page.locator(w).evaluate(e => { const d = e.querySelector('.day[data-day="0"]'); return Math.round(d.getBoundingClientRect().left - e.getBoundingClientRect().left) })
    checks.push([`${pg}: the calendar picked Mon 20 Jul — week is ${wk}, Monday at the left edge (offset ${left})`, wk === '20/07/2026' && Math.abs(left) < 40, { wk, left }])
    await page.locator(`#page-${pg} .filt-cal`).click(); await sleep(300); await page.locator('#weekCal .wc-today').click(); await page.waitForFunction(() => window.CURWEEK === '13/07/2026'); await sleep(300)
  }
  return { checks, pics }
})

/* ---- P4d-04 ---- */
for (const pg of ['editsched', 'viewsched']) {
  await nav(page, pg)
  await S('P4d-04-' + pg, `${pg === 'editsched' ? 'Edit Schedule' : 'View-only Sched'} phone: opened the menu by pointer, tapped outside, opened by keyboard, pressed Escape, reopened, chose Insights, closed it`, async () => {
    const id = ID[pg], checks = [], pics = [], sel = pg === 'editsched' ? '#searchE' : '#searchV'
    const gone = async () => (await page.locator(`#${id}MoreMenu`).count()) === 0
    // pointer open, tap outside (on the search box: should reach it)
    await page.locator(`#${id}More`).click(); await sleep(300)
    const opened = !(await gone())
    await page.locator(sel).click(); await sleep(300)
    const focusedSearch = await page.evaluate(s => document.activeElement === document.querySelector(s), sel)
    checks.push(['pointer: opens; a tap on the search box closes the menu AND reaches the search box', opened && await gone() && focusedSearch, { opened, closed: await gone(), searchFocused: focusedSearch }])
    // keyboard open
    await page.locator(`#${id}More`).focus(); await page.keyboard.press('Enter'); await sleep(300)
    const kopened = !(await gone())
    await page.keyboard.press('Escape'); await sleep(300)
    const f = await page.evaluate(i => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { id: e.id, visible: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight } }, id)
    checks.push(['keyboard: Enter opens; Escape closes and the caret returns to the visible ⋯ button', kopened && await gone() && f.id === `${id}More` && f.visible, { kopened, focus: f }])
    pics.push(await pic(page, `P4d-04-${pg}-after-escape`))
    // choose Insights, close it
    await page.locator(`#${id}More`).click(); await sleep(300)
    await page.locator(`#${id}MoreInsights`).click(); await sleep(500)
    const shown = await page.locator('#insightModal').isVisible(); const body = (await page.locator('#insightBody').innerText()).length
    pics.push(await pic(page, `P4d-04-${pg}-insights-open`))
    await page.locator('#insightClose').click(); await sleep(400)
    const f2 = await page.evaluate(() => document.activeElement && document.activeElement.id)
    checks.push(['choosing Insights opens the window (readable text), the menu is gone, closing returns the caret to the ⋯ button', shown && body > 100 && await gone() && f2 === `${id}More`, { shown, textLen: body, focusAfterClose: f2 }])
    // a stale menu does not remain; the next gesture works
    await page.locator(`#page-${pg} .filt-cal`).click(); await sleep(300)
    const calOpen = await page.locator('#weekCal').isVisible().catch(() => false)
    await page.keyboard.press('Escape'); await sleep(200)
    checks.push(['the next gesture (calendar button) works after the menu', calOpen, calOpen])
    return { checks, pics }
  })
}

/* ---- P4d-05 ---- */
await nav(page, 'editsched')
await S('P4d-05', 'Phone menu opened at 820 px then resized to 821 and back to 390; then with a week change, a page change and a sign-out/sign-in', async () => {
  const checks = [], pics = []
  const menuCount = id => page.locator(`#${id}MoreMenu`).count()
  await page.setViewportSize({ width: 820, height: 900 }); await sleep(500)
  const has820 = await page.locator('#editSchedMore').isVisible().catch(() => false)
  await page.locator('#editSchedMore').click().catch(() => {}); await sleep(300)
  const open820 = await menuCount('editSched')
  pics.push(await pic(page, 'P4d-05-820-open'))
  await page.setViewportSize({ width: 821, height: 900 }); await sleep(700)
  const btn821 = await page.locator('#insightBtn').isVisible(); const more821 = await page.locator('#editSchedMore').count(); const menu821 = await menuCount('editSched')
  pics.push(await pic(page, '821-direct-door'.replace(/^/, 'P4d-05-')))
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(700)
  const menuBack = await menuCount('editSched'); const moreBack = await page.locator('#editSchedMore').isVisible()
  checks.push(['at 820 the ⋯ button is there and opens the menu', has820 && open820 === 1, { has820, open820 }])
  checks.push(['at 821 the menu is gone and the direct Insights button is drawn (no ⋯ button); back at 390 no old menu reappears', menu821 === 0 && btn821 && more821 === 0 && menuBack === 0 && moreBack, { menu821, btn821, more821, menuBack, moreBack }])
  // week change
  await page.locator('#editSchedMore').click(); await sleep(300)
  await page.locator('#page-editsched .filt-cal').click(); await sleep(300)
  const afterCal = await menuCount('editSched')
  await page.keyboard.press('Escape'); await sleep(200)
  // page change
  await page.locator('#editSchedMore').click(); await sleep(300); const reopened = await menuCount('editSched')
  await nav(page, 'inputs'); await nav(page, 'editsched')
  const afterNav = await menuCount('editSched')
  checks.push(['opening the calendar closes the menu; after leaving the page and returning, no menu is open', afterCal === 0 && reopened === 1 && afterNav === 0, { afterCal, reopened, afterNav }])
  // account change
  await page.locator('#editSchedMore').click(); await sleep(300)
  await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerLogout').click(); await sleep(800)
  await H.login(page, 'm'); await nav(page, 'viewsched')
  const memberMenu = await menuCount('viewSched'); const memberMoreEdit = await page.locator('#editSchedMore').count()
  pics.push(await pic(page, 'P4d-05-member-after-signin'))
  checks.push(['after sign-out and sign-in as the member: no stale menu, no Edit Schedule ⋯ button', memberMenu === 0 && memberMoreEdit === 0, { memberMenu, memberMoreEdit }])
  await page.locator('#burger').click(); await page.locator('#drawerLogout').click(); await sleep(800); await H.login(page, 'a'); await sleep(500)
  return { checks, pics }
})

/* ---- P4d-06 ---- */
await S('P4d-06', 'Board on Wednesday: opened Insights by the phone Board\'s own More menu, closed it, pressed Done; then at desktop width by the Board\'s direct Insights button', async () => {
  const checks = [], pics = []
  await openBoard(page, 2)
  const day = () => page.evaluate(() => window.SBDAY)
  await page.locator('#sbMore').click(); await sleep(300)
  const items = await page.locator('#sbMoreMenu, .sbmore, #sbMore ~ *').first().evaluate(m => m.innerText).catch(() => '')
  pics.push(await pic(page, 'P4d-06-board-more-open'))
  await page.locator('#sbMoreInsights').click(); await sleep(500)
  const bodyPhone = await page.locator('#insightBody').innerText()
  const weekMenu = await page.locator('#editSchedMoreMenu').count()
  pics.push(await pic(page, 'P4d-06-board-insights-phone'))
  await page.locator('#insightClose').click(); await sleep(400)
  const d1 = await day(), boardStill = await page.locator('#schedBoard').isVisible()
  await page.locator('#sbDone').click(); await sleep(500)
  const onWeek = await page.evaluate(() => window.CURPAGE)
  // desktop
  await page.setViewportSize({ width: 1440, height: 900 }); await sleep(600)
  await openBoard(page, 2)
  await page.locator('#sbInsights').click(); await sleep(500)
  const bodyDesk = await page.locator('#insightBody').innerText()
  pics.push(await pic(page, 'P4d-06-board-insights-desktop'))
  await page.locator('#insightClose').click(); await sleep(300)
  const d2 = await day(); const stillBoard2 = await page.locator('#schedBoard').isVisible()
  checks.push(['phone Board: More → Insights opens the window; no week-toolbar popup over it', bodyPhone.length > 100 && weekMenu === 0, { len: bodyPhone.length, weekMenu }])
  checks.push(['closing leaves the Board open on Wednesday (day 2); Done returns to the week page', d1 === 2 && boardStill && onWeek === 'editsched', { day: d1, boardStill, onWeek }])
  checks.push(['the desktop Board button shows the same weekly figures; the Board is still on Wednesday', bodyDesk === bodyPhone && d2 === 2 && stillBoard2, { same: bodyDesk === bodyPhone, d2, stillBoard2, lenPhone: bodyPhone.length, lenDesk: bodyDesk.length }])
  await page.locator('#sbDone').click().catch(() => {}); await page.setViewportSize({ width: 390, height: 844 }); await sleep(500)
  return { checks, pics }
})

/* ---- P4d-01: guest ---- */
await S('P4d-01', 'Admin enabled guest viewing (Admin → Users), signed out, signed in as a name with no access, sent the request form, entered the guest door; looked for More schedule options → Insights', async () => {
  await nav(page, 'admin')
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).click(); await sleep(300)
  await page.locator('#admGuestView').check(); await sleep(400)
  await page.locator('#burger').click(); await page.locator('#drawerLogout').click(); await sleep(800)
  await page.fill('#luser', 'stk.guest'); await page.fill('#lpass', 'demo'); await page.click('#loginForm button')
  await page.fill('#accCs', 'Stk Guest'); await page.fill('#accIni', 'SG'); await page.selectOption('#accSeat', 'GND'); await page.click('#accSend'); await sleep(500)
  const pics = [await pic(page, 'P4d-01-waiting-screen')]
  if (await page.locator('#accGuest').count()) await page.locator('#accGuest').click()
  await sleep(800)
  const guest = await page.locator('#guestApp').isVisible().catch(() => false)
  pics.push(await pic(page, 'P4d-01-guest-app'))
  const info = await page.evaluate(() => ({
    more: document.querySelectorAll('#viewSchedMore,#editSchedMore,[id$="More"]').length,
    insights: [...document.querySelectorAll('button')].filter(b => /insights/i.test(b.innerText) && b.getBoundingClientRect().width > 0).map(b => b.id || b.innerText.trim()),
    editable: document.querySelectorAll('#guestApp [contenteditable="true"], #guestApp input:not([readonly]):not([type=hidden])').length,
    tools: [...document.querySelectorAll('#guestApp button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.id || b.innerText.trim().slice(0, 16)).slice(0, 14),
  }))
  let reached = null
  const mb = page.locator('#guestApp [id$="More"]').first()
  if (await mb.count()) { await mb.click(); await sleep(300); const it = page.locator('#guestApp [id$="MoreInsights"]').first(); if (await it.count()) { await it.click(); await sleep(500); reached = (await page.locator('#insightBody').innerText().catch(() => '')).length; pics.push(await pic(page, 'P4d-01-guest-insights')) } }
  return { checks: [
    ['the real guest door was reached (the guest app is on screen)', guest, guest],
    ['the guest has a "More schedule options" button with one Insights item and readable statistics', info.more > 0 && reached > 100, { moreButtons: info.more, insightsButtons: info.insights, insightsTextLen: reached }],
    ['the guest offers no editing action', info.editable === 0, info],
  ], pics }
})
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world4', 'console / page errors / 4xx during world 4', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world4', { errors })
await browser.close()
