// The morning page — desktop pictures (1536, ×2), as Saber unless named, by presses: the Schedules menu (a1), a person's row
// and the filter (a2; q-a, q-b, q-c, q-j, q-p), "+ New squadron" (a3), a place's hover text (q-g), Squadron config · 149
// (a9), the board's number and day chips (a6, q-h), a Leave War window's shade (q-d), an Inputs settings window across a
// pick (q-k), two Undo bubbles (q-l, q-o), the Tracker's cover (a7, q-e).
import { serve, stop, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText } from '../walk/w1-view.mjs'
import { step, press, vis } from '../rewalk/rlib.mjs'
import { newPage, ringShot, byText, saveManifest } from './mlib.mjs'

const T = id => `[data-testid="${id}"]`
const EDIT = '#page-admin .acc-edit'
async function board(s) {
  await navTo(s, 'Edit Schedule'); await s.page.waitForSelector('#page-editsched.on #eWeek .day', { timeout: 20000 }); await s.page.waitForTimeout(600)
  await s.page.locator('#eWeek .day:not(.peek) [data-sbday="0"]').first().click()
  await s.page.waitForSelector('#schedBoard:not([hidden]) .sb-sqn', { timeout: 15000 }); await s.page.waitForTimeout(800)
}

await serve()
try {
  const s = await newPage('d')
  await signIn(s, 'ad', 'a')
  await step('a1 menu', async () => {
    await press(s, '#sqnMenuBtn:visible')
    await ringShot(s, 'a1-schedules-menu-desktop.png', { ring: ['#sqnMenu'], clip: ['#sqnMenuBtn', '#sqnMenu'], pad: 24, what: 'The Schedules menu opened from "142 ▾" at the top left: 142 "Your squadron" ticked, 149 "Full access" (Saber, a master admin).' })
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
  })
  await step('a2 row, roles, q-a q-c q-p', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'prowler')
    await ringShot(s, 'a2-users-person-row.png', { ring: [T('acc-sq')], clip: [EDIT], what: "Admin → Users, Hunter's row opened: Sign-in and Role, then a line per squadron — 142 \"Home squadron\", 149 None · View · Plan." })
    await ringShot(s, 'q-p-users-row-opened-desktop.png', { ring: [EDIT], clip: [EDIT], pad: 28, what: "Question (p): an opened person's row on Admin → Users on the desktop — today Escape does not close it; Cancel (bottom right of the row) does." })
    await press(s, `${T('acc-roles')} summary`); await s.page.waitForTimeout(300)
    const cell = s.page.locator(`${T('acc-roles')} tbody tr`).filter({ has: s.page.locator('th', { hasText: /^Admin$/ }) }).locator('td').nth(2)
    facts['q-a-cell'] = (await cell.count()) ? await cell.innerText() : null
    await ringShot(s, 'q-a-roles-table-view-admin-cell.png', { ring: [cell], clip: [`${T('acc-roles')} table`], what: 'Question (a): "What each role allows" opened under Hunter\'s row — the ringed cell is the Admin page\'s row under the View column, drawn "—" (cannot open).' })
    await ringShot(s, 'q-c-roles-table-two-lines.png', { rings: [[`${T('acc-roles')} .acc-rt-lab`], [`${T('acc-roles')} .acc-rt-key`]], clip: [T('acc-roles')], what: 'Question (c): the roles table\'s two lines of words, ringed — "View and Plan give access to another squadron." above it and "✓ can change · read: can see, not change · — cannot open" under it.' })
    await press(s, '#accEdCancel')
  })
  await step('a2 filter, q-b, q-j', async () => {
    await press(s, '#accFilter')
    await ringShot(s, 'a2-users-filter-open.png', { ring: ['#accFilterPanel'], clip: ['#accFilter', '#accFilterPanel'], what: 'Admin → Users, the Filter opened beside the search: tick chips for Seat, CAT, Role and (a master admin\'s) Squadron.' })
    const plans = byText(s, '#accFilterPanel button, #accFilterPanel [data-ftick]', /^Plans 142$/)
    facts['q-b-chip'] = await plans.count()
    await ringShot(s, 'q-b-filter-role-plans-142.png', { ring: [plans], clip: ['#accFilterPanel'], what: 'Question (b): the Filter\'s Role chips on 142\'s list — the ringed chip reads "Plans 142".' })
    const t149 = byText(s, '#accFilterPanel button, #accFilterPanel [data-ftick]', /^149$/)
    if (await t149.count()) { await t149.click(); await s.page.waitForTimeout(400) }
    const t149on = byText(s, '#accFilterPanel button, #accFilterPanel [data-ftick]', /^\W*149$/)   // ticked, it reads "✓ 149"
    const head = byText(s, '#page-admin h4, #page-admin .adm-sub', /People/)
    facts['q-j-head'] = (await head.count()) ? await head.innerText() : null
    await ringShot(s, 'q-j-filter-149-people-10.png', { rings: [[head], [t149on]], clip: ['#accFilterPanel', '#accFilter', head], what: 'Question (j): Saber on 142\'s Admin → Users ticks the Filter\'s Squadron "149" — the heading then reads "People · 10" (both ringed).' })
    if (await vis(s, '#accFilterClear')) await press(s, '#accFilterClear')
    await press(s, '#accFilter')
  })
  await step('a3, q-g', async () => {
    await adminCat(s, 'Squadrons')
    const place = s.page.locator('#sqList [data-unit="u142"] button').first()
    facts['q-g-title'] = (await place.count()) ? await place.getAttribute('title') : null
    await ringShot(s, 'q-g-hover-change-142-place.png', { ring: [place], clip: ['#sqList'], what: `Question (g): Admin → Squadrons — the ringed row is the button whose hover text reads "${facts['q-g-title']}" (the hover text itself is drawn by the browser and does not show in a picture).` })
    await press(s, '#sqNew')
    await ringShot(s, 'a3-squadrons-new-squadron-open.png', { ring: ['[data-new-sqn]'], clip: ['#sqList', '[data-new-sqn]', '#sqNewSave'], what: 'Admin → Squadrons with "+ New squadron" opened: Number, Place (or "+ New place…"), First admin, its note, Save and Cancel.' })
    await press(s, '#sqNewCancel')
  })
  await step('a9 config 149', async () => {
    await pick(s, '149'); await adminCat(s, 'Squadron config')
    const t = byText(s, '#page-admin h2, #page-admin h3, #page-admin .adm-pane-t', /Squadron config · 149/)
    await ringShot(s, 'a9-squadron-config-149.png', { ring: [t], clip: [t, '#page-admin .adm-cat'], pad: 20, what: 'Admin → Squadron config with 149 picked: its heading reads "Squadron config · 149".' })
    await pick(s, '142')
  })
  await step('q-h, a6 board', async () => {
    await board(s)
    await ringShot(s, 'q-h-board-day-chips-start.png', { ring: ['#sbDays'], clip: ['#schedBoard .sb-title', '#sbDays'], pad: 12, what: "Question (h): the day board's top on the desktop — the ringed day chips start 32px further right than the drawing (the day title's box widened so the full day name and the squadron number always fit)." })
    await press(s, '#sbDone'); await pick(s, '149'); await board(s)
    await ringShot(s, 'a6-board-squadron-number.png', { ring: ['#schedBoard .sb-sqn'], clip: ['#schedBoard .sb-title'], pad: 12, what: "The day board (Edit Schedule, a day opened) with 149 picked: the grey squadron number \"149\" after the day's title." })
    await press(s, '#sbDone'); await pick(s, '142')
  })
  await step('q-d war window', async () => {
    await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    const c = s.page.locator(T('cell-bane-2026-11-25')).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(300)
    await c.click(); await s.page.waitForTimeout(700)
    facts['q-d-window'] = await vis(s, T('bid-picker'))
    await ringShot(s, 'q-d-war-window-shade-over-142.png', { ring: ['#sqnMenuBtn'], whole: true, what: 'Question (d): a Leave War day window open (Ranger, Wed 25 Nov) — its shade lies over the top bar, so the ringed "142 ▾" cannot be pressed until the window is closed.' })
    await press(s, T('bid-cancel'))
  })
  await step('q-k inputs settings', async () => {
    await navTo(s, 'Inputs'); await press(s, '#inGear:visible'); await s.page.waitForTimeout(500)
    const win = s.page.locator('.floatwin, [role=dialog]').filter({ visible: true }).last()
    await ringShot(s, 'q-k-inputs-settings-before-pick.png', { ring: [win], whole: true, what: 'Question (k), before: the Inputs page\'s settings window (⚙) open on 142.' })
    let picked = false
    try { await s.page.locator('#sqnMenuBtn:visible').first().click({ timeout: 4000 }); await s.page.waitForTimeout(300); const r = s.page.locator('#sqnMenu .sqm-row', { hasText: '149' }).first(); await r.click({ timeout: 4000 }); picked = true; await s.page.waitForTimeout(800) } catch (e) { note('q-k pick: ' + String(e).split('\n')[0]) }
    facts['q-k-picked'] = picked; facts['q-k-window-after'] = await win.isVisible().catch(() => false)
    await ringShot(s, 'q-k-inputs-settings-after-pick.png', { ring: ['#inGear:visible'], whole: true, what: 'Question (k), after: 149 picked from "142 ▾" — the settings window has closed (ringed: the ⚙ it opened from).' })
    if (await win.isVisible().catch(() => false)) await s.page.keyboard.press('Escape')
    if (picked) await pick(s, '142')
  })
  await step('q-l master undo', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'prowler')
    await s.page.selectOption('#accEdRole', 'master'); await press(s, '#accEdSave')
    await press(s, '#undoBtn:visible'); facts['q-l-toast'] = await toastText(s)
    await ringShot(s, 'q-l-undo-master-mark.png', { ring: ['#toastEl'], clip: ['#toastEl'], pad: 60, what: `Question (l): the Undo bubble after Saber made Hunter a master admin and pressed Undo — "${facts['q-l-toast']}".` })
  })
  await step('q-o rename + plan undo', async () => {
    await s.page.waitForTimeout(2500)
    await openRow(s, 'prowler'); await press(s, lineBtn('149', 'plan')); await s.page.fill('#accEdName', 'hunter.m@mail'); await press(s, '#accEdSave')
    await press(s, '#undoBtn:visible'); facts['q-o-toast'] = await toastText(s)
    await ringShot(s, 'q-o-undo-rename-and-plan.png', { ring: ['#toastEl'], clip: ['#toastEl'], pad: 60, what: `Question (o): the Undo bubble after one Save that changed Hunter's sign-in and gave him Plan of 149 — "${facts['q-o-toast']}" (the sign-in went back too).` })
  })
  await step('a7, q-e Tracker cover', async () => {
    await navTo(s, 'Tracker'); await s.page.waitForSelector('#page-tracker #board', { state: 'attached', timeout: 30000 }); await s.page.waitForTimeout(2000)
    await pick(s, '149'); await s.page.waitForTimeout(1000)
    const band = T('trk-cover-band')
    facts['a7-band'] = (await s.page.locator(band).count()) ? await s.page.locator(band).first().innerText() : null
    await ringShot(s, 'a7-tracker-cover-after-pick.png', { ring: [band], whole: true, what: `The Tracker after a pick: Saber opened it on 142, then picked 149 — the page under a veil, read only, its band: "${(facts['a7-band'] || '').replace(/\s+/g, ' ')}".` })
    await ringShot(s, 'q-e-tracker-cover-words-master.png', { ring: [`${band} b`, `${band} .sv-rest`], clip: ['#sqnMenuBtn'], pad: 12, what: 'Question (e): the Tracker cover\'s words for a master admin whose Tracker holds his home (142) while 149 is picked — "To open 149\'s, sign out and in." does not fit him.' })
  })
  await s.ctx.close()
} finally { saveManifest('m1'); save('m1'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
