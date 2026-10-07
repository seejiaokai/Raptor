/* Walker P re-walk: the phone ⋯ menu — P4d-02, 03, 04, 05, 06, 01. Phone 390x844 (and 320x568, 820/821); each scenario in a fresh world. */
import * as R from './stk2-P-run.mjs'
const { S, finish, nav, openBoard, sleep, pic } = R
const PH = { width: 390, height: 844 }
const ID = { editsched: 'editSched', viewsched: 'viewSched' }
const hit = (page, sel) => page.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { onScreen: r.width > 0 && r.right <= innerWidth + 0.5 && r.left >= -0.5, hit: h === e || e.contains(h) } })
const toolbar = (page, p) => page.evaluate(([pg]) => { const root = document.querySelector('#page-' + pg); return [...root.querySelectorAll('button, input, .hl-tog')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 140).map(e => ({ id: e.id || '', cls: String(e.className || '').slice(0, 20), t: (e.innerText || e.value || e.placeholder || e.getAttribute('aria-label') || '').trim().slice(0, 18), x: Math.round(e.getBoundingClientRect().x), w: Math.round(e.getBoundingClientRect().width), r: Math.round(e.getBoundingClientRect().right) })) }, [p])
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const PART = 'phone' + (ONLY ? '-' + ONLY.join('+') : '')

for (const pg of ['editsched', 'viewsched']) {
  if (!want('P4d-02')) break
  await S(PART, 'P4d-02-' + pg, `${pg === 'editsched' ? 'Edit Schedule' : 'View-only Sched'} at 390 and 320 px wide: read the toolbar, pressed the button after Highlight, read the menu, tested neighbours with a real hit test`, { width: PH.width, height: PH.height }, async page => {
    await nav(page, pg)
    const id = ID[pg], checks = [], pics = []
    for (const [w, h] of [[390, 844], [320, 568]]) {
      await page.setViewportSize({ width: w, height: h }); await sleep(500)
      const bar = await toolbar(page, pg)
      const hlIdx = bar.findIndex(b => /Highlight/i.test(b.t) || /hl-tog/.test(b.cls))
      const after = bar[hlIdx + 1]
      await page.locator(`#${id}More`).first().click(); await sleep(400)
      const menuItems = await page.locator(`#${id}MoreMenu`).first().evaluate(m => [...m.querySelectorAll('button, [role=menuitem], a')].map(b => b.innerText.trim()))
      const box = await page.locator(`#${id}MoreMenu`).first().boundingBox()
      const sel = pg === 'editsched' ? '#searchE' : '#searchV'
      pics.push(await pic(page, `P4d-02-${pg}-${w}-menu-open`))
      await page.keyboard.press('Escape'); await sleep(250)
      const neighbours = {}
      for (const s of [sel, `#page-${pg} .filt-cal`, `#${id}More`, `#page-${pg} .hl-tog`]) neighbours[s] = await hit(page, s).catch(() => 'absent')
      const addExport = await page.evaluate(([p]) => [...document.querySelectorAll('#page-' + p + ' button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 140).map(b => (b.id || b.innerText.trim().slice(0, 12))), [pg])
      checks.push([`${w}px: the button right after Highlight is the ⋯ menu`, after && after.id === `${id}More`, { after, order: bar.map(b => b.id || b.t || b.cls) }])
      checks.push([`${w}px: the menu holds exactly one item, Insights, and sits inside the screen`, menuItems.length === 1 && /Insights/.test(menuItems[0]) && box.x >= 0 && box.x + box.width <= w, { items: menuItems, box }])
      checks.push([`${w}px: search, calendar, the ⋯ button and Highlight are each topmost at their centre (reachable)`, Object.values(neighbours).every(n => n && n.hit && n.onScreen), neighbours])
      checks.push([`${w}px: toolbar controls drawn (for the record)`, true, addExport])
    }
    return { checks, pics }
  })
}

if (want('P4d-03')) await S(PART, 'P4d-03', 'Phone drawer opened from Inputs, Tracker, Leave War; then on each schedule page the calendar picked Mon 20 Jul', { width: PH.width, height: PH.height }, async page => {
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
  for (const [pg, w] of [['viewsched', '#vWeek'], ['editsched', '#eWeek']]) {
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

for (const pg of ['editsched', 'viewsched']) {
  if (!want('P4d-04')) break
  await S(PART, 'P4d-04-' + pg, `${pg === 'editsched' ? 'Edit Schedule' : 'View-only Sched'} phone: opened the menu by pointer, tapped outside, opened by keyboard, pressed Escape, reopened, chose Insights, closed it`, { width: PH.width, height: PH.height }, async page => {
    await nav(page, pg)
    const id = ID[pg], checks = [], pics = [], sel = pg === 'editsched' ? '#searchE' : '#searchV'
    const gone = async () => (await page.locator(`#${id}MoreMenu`).count()) === 0
    await page.locator(`#${id}More`).click(); await sleep(300)
    const opened = !(await gone())
    await page.locator(sel).click(); await sleep(300)
    const focusedSearch = await page.evaluate(s => document.activeElement === document.querySelector(s), sel)
    checks.push(['pointer: opens; a tap on the search box closes the menu AND reaches the search box', opened && await gone() && focusedSearch, { opened, closed: await gone(), searchFocused: focusedSearch }])
    await page.locator(`#${id}More`).focus(); await page.keyboard.press('Enter'); await sleep(300)
    const kopened = !(await gone())
    await page.keyboard.press('Escape'); await sleep(300)
    const f = await page.evaluate(i => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { id: e.id, visible: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight } }, id)
    checks.push(['keyboard: Enter opens; Escape closes and the caret returns to the visible ⋯ button', kopened && await gone() && f.id === `${id}More` && f.visible, { kopened, focus: f }])
    pics.push(await pic(page, `P4d-04-${pg}-after-escape`))
    await page.locator(`#${id}More`).click(); await sleep(300)
    await page.locator(`#${id}MoreInsights`).click(); await sleep(500)
    const shown = await page.locator('#insightModal').isVisible(); const body = (await page.locator('#insightBody').innerText()).length
    pics.push(await pic(page, `P4d-04-${pg}-insights-open`))
    await page.locator('#insightClose').click(); await sleep(400)
    const f2 = await page.evaluate(() => document.activeElement && document.activeElement.id)
    checks.push(['choosing Insights opens the window (readable text), the menu is gone, closing returns the caret to the ⋯ button', shown && body > 100 && await gone() && f2 === `${id}More`, { shown, textLen: body, focusAfterClose: f2 }])
    await page.locator(`#page-${pg} .filt-cal`).click(); await sleep(300)
    const calOpen = await page.locator('#weekCal').isVisible().catch(() => false)
    await page.keyboard.press('Escape'); await sleep(200)
    checks.push(['the next gesture (calendar button) works after the menu', calOpen, calOpen])
    return { checks, pics }
  })
}

if (want('P4d-05')) await S(PART, 'P4d-05', 'Phone menu opened at 820 px then resized to 821 and back to 390; then with a week change, a page change and a sign-out/sign-in as the member', { width: PH.width, height: PH.height }, async page => {
  await nav(page, 'editsched')
  const checks = [], pics = []
  const menuCount = id => page.locator(`#${id}MoreMenu`).count()
  await page.setViewportSize({ width: 820, height: 900 }); await sleep(500)
  const has820 = await page.locator('#editSchedMore').isVisible().catch(() => false)
  await page.locator('#editSchedMore').click().catch(() => {}); await sleep(300)
  const open820 = await menuCount('editSched')
  pics.push(await pic(page, 'P4d-05-820-open'))
  await page.setViewportSize({ width: 821, height: 900 }); await sleep(700)
  const btn821 = await page.locator('#insightBtn').isVisible(); const more821 = await page.locator('#editSchedMore').count(); const menu821 = await menuCount('editSched')
  pics.push(await pic(page, 'P4d-05-821-direct-door'))
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(700)
  const menuBack = await menuCount('editSched'); const moreBack = await page.locator('#editSchedMore').isVisible()
  checks.push(['at 820 the ⋯ button is there and opens the menu', has820 && open820 === 1, { has820, open820 }])
  checks.push(['at 821 the menu is gone and the direct Insights button is drawn (no ⋯ button); back at 390 no old menu reappears', menu821 === 0 && btn821 && more821 === 0 && menuBack === 0 && moreBack, { menu821, btn821, more821, menuBack, moreBack }])
  await page.locator('#editSchedMore').click(); await sleep(300)
  await page.locator('#page-editsched .filt-cal').click(); await sleep(300)
  const afterCal = await menuCount('editSched')
  await page.keyboard.press('Escape'); await sleep(200)
  await page.locator('#editSchedMore').click(); await sleep(300); const reopened = await menuCount('editSched')
  await nav(page, 'inputs'); await nav(page, 'editsched')
  const afterNav = await menuCount('editSched')
  checks.push(['opening the calendar closes the menu; after leaving the page and returning, no menu is open', afterCal === 0 && reopened === 1 && afterNav === 0, { afterCal, reopened, afterNav }])
  await page.locator('#editSchedMore').click(); await sleep(300)
  await page.locator('#burger').click(); await sleep(300); await page.locator('#drawerLogout').click(); await sleep(800)
  await R.login(page, 'm'); await nav(page, 'viewsched')
  const memberMenu = await menuCount('viewSched'); const memberMoreEdit = await page.evaluate(() => { const e = document.querySelector('#editSchedMore'); if (!e) return 0; const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return 0; const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return (h === e || e.contains(h)) ? 1 : 0 })
  pics.push(await pic(page, 'P4d-05-member-after-signin'))
  checks.push(['after sign-out and sign-in as the member: no stale menu, no Edit Schedule ⋯ button drawn on screen (a finger would land on it)', memberMenu === 0 && memberMoreEdit === 0, { memberMenu, memberMoreEdit }])
  await page.locator('#burger').click(); await page.locator('#drawerLogout').click(); await sleep(800); await R.login(page, 'a'); await sleep(500)
  await nav(page, 'editsched')
  const adminMenu = await menuCount('editSched'); const adminMore = await page.locator('#editSchedMore').isVisible().catch(() => false)
  checks.push(['signed back in as the admin: no menu left open, the ⋯ button is back', adminMenu === 0 && adminMore, { adminMenu, adminMore }])
  return { checks, pics }
})

if (want('P4d-06')) await S(PART, 'P4d-06', 'Board on Wednesday: opened Insights by the phone Board\'s own More menu, closed it, pressed Done; then at desktop width by the Board\'s direct Insights button', { width: PH.width, height: PH.height }, async page => {
  const checks = [], pics = []
  await openBoard(page, 2)
  const day = () => page.evaluate(() => window.SBDAY)
  await page.locator('#sbMore').click(); await sleep(300)
  pics.push(await pic(page, 'P4d-06-board-more-open'))
  await page.locator('#sbMoreInsights').click(); await sleep(500)
  const bodyPhone = await page.locator('#insightBody').innerText()
  const weekMenu = await page.locator('#editSchedMoreMenu').count()
  pics.push(await pic(page, 'P4d-06-board-insights-phone'))
  await page.locator('#insightClose').click(); await sleep(400)
  const d1 = await day(), boardStill = await page.locator('#schedBoard').isVisible()
  await page.locator('#sbDone').click(); await sleep(500)
  const onWeek = await page.evaluate(() => window.CURPAGE)
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
  return { checks, pics }
})

if (want('P4d-01')) await S(PART, 'P4d-01', 'RECORD ONLY: Admin enabled guest viewing (Admin → Users), signed out, signed in as a name with no access, sent the request form, entered the guest door; looked for More schedule options → Insights', { width: PH.width, height: PH.height }, async page => {
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
    more: [...document.querySelectorAll('#guestApp [id$="More"]')].map(e => e.id),
    insights: [...document.querySelectorAll('button')].filter(b => /insights/i.test(b.innerText) && b.getBoundingClientRect().width > 0).map(b => b.id || b.innerText.trim()),
    editable: document.querySelectorAll('#guestApp [contenteditable="true"], #guestApp input:not([readonly]):not([type=hidden])').length,
    tools: [...document.querySelectorAll('#guestApp button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.id || b.innerText.trim().slice(0, 16)).slice(0, 14),
  }))
  let reached = null, items = null
  const mb = page.locator('#guestApp [id$="More"]').first()
  if (await mb.count()) { await mb.click(); await sleep(300); items = await page.locator('#guestApp [id$="MoreMenu"]').first().innerText().catch(() => null); const it = page.locator('#guestApp [id$="MoreInsights"]').first(); if (await it.count()) { await it.click(); await sleep(500); reached = (await page.locator('#insightBody').innerText().catch(() => '')).length; pics.push(await pic(page, 'P4d-01-guest-insights')) } }
  return { verdict: 'RECORDED', checks: [
    ['the real guest door was reached (the guest app is on screen)', guest, guest],
    ['RECORD: the guest\'s "More schedule options" button and its menu items', true, { moreButtons: info.more, menuItems: items, insightsButtons: info.insights, insightsTextLen: reached }],
    ['RECORD: editing actions the guest is offered (editable boxes) and the guest\'s buttons', true, { editable: info.editable, tools: info.tools }],
  ], pics }
})
await finish(PART)
