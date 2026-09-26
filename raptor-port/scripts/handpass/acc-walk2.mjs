/* [ACCOUNTS] walk 2 (26 Sep 26) — the plan's §Orders to walk that walk 1 (acc-walk.mjs) did
   not drive: renames and relinks, the last admin, a posted-out (archived) callsign, the guest
   switch turned back off, what the next person inherits (a window left open), a member against
   another person's input / Leave War row, "Your reports" across a rename, the SCHEDULER tick's
   consequence in the sign-off boxes, the board's "this is you" puck, a reload mid-session.
   Plus the scenarios Fable designed (docs/handpass/2026-09-26-accounts-fable-scenarios.md),
   marked F<n>. Every step ASSERTS the right behaviour (PASS = correct), so a re-run IS the
   re-walk. Real production bundle, real Chromium, desktop and phone, pictures to disk.
   Run: node scripts/handpass/acc-walk2.mjs   (HP_SHOTS / HP_OUT override the folders) */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts/walk2'
const lib = await import('./lib.mjs')
const w4 = await import('./am/w4-lib.mjs')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS
const OUT = process.env.HP_OUT || SHOTS + '/walk.json'
mkdirSync(SHOTS, { recursive: true })

const results = []
let shotN = 0
const errorsAll = []

async function world(width, height) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return { browser, page, errors }
}
async function shot(page, name) {
  const f = `${String(++shotN).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: `${SHOTS}/${f}`, fullPage: false })
  return f
}
async function step(page, id, what, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = r === true || !!(r && r.ok === true); if (typeof r === 'string') note = r; else if (r && r.note) note = r.note } catch (e) { note = String(e && e.message || e).slice(0, 300) }
  const pic = await shot(page, id).catch(() => '')
  results.push({ id, what, ok, note, pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${note ? ' :: ' + note : ''}`)
}
async function signOut(page) {
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = page.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await page.waitForTimeout(500); break }
  }
  if (await page.locator('#luser').count() === 0) {
    const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForTimeout(500) }
  }
  await page.waitForSelector('#luser')
}
async function signIn(page, name, pass = 'x') {
  if (await page.locator('#luser').count() === 0) await signOut(page)
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(700)
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent()) || '').replace(/\s+/g, ' ').trim()
const cs = (page, id) => page.evaluate(i => window.PEOPLE[i].cs, id)
async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(500) }
async function users(page) {
  await go(page, 'admin')
  if (!await page.locator('#admUsers').isVisible()) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(300) }
}
async function editAccount(page, id, fn) {
  await users(page)
  await page.click(`[data-acct="${id}"] .acc-tap`); await page.waitForTimeout(250)
  await fn(); await page.waitForTimeout(400)
}

/* ======================= DESKTOP ======================= */
{
  const { browser, page, errors } = await world(1440, 900)
  await signIn(page, 'ad', 'a')
  /* make one write before anything reloads (order §7.7): the guest switch on and off */
  await users(page); await page.check('#admGuestView'); await page.uncheck('#admGuestView'); await page.waitForTimeout(200)

  /* ---- the board's "this is you" puck (roll-call 19) ---- */
  await lib.board(page, 1)
  await step(page, 'd-board-me-puck', 'the scheduler board draws the admin\'s own puck as "this is you" (Saber), nobody else\'s', async () => {
    const ps = await page.$$eval('#schedBoard .puck.me', els => [...new Set(els.map(e => e.getAttribute('data-person')))])
    return ps.length > 0 && ps.every(p => p === 'stiff') ? true : `me pucks: ${ps.join(',') || 'none'}`
  })
  await lib.closeBoard(page)

  /* ---- a member (roll-call 5, 7, 22) ---- */
  await signIn(page, 'us', 'us')

  /* ---- "Your reports" across a rename (roll-call 22) ---- */
  await go(page, 'help')
  await page.fill('#bugText', 'walk2 — the week header overlaps on my phone')
  await page.click('#bugSend'); await page.waitForTimeout(400)
  await step(page, 'd-member-report', 'a member files a report; "Your reports" lists it', async () =>
    (await text(page, '#bugMine')).includes('walk2') ? true : 'not listed')

  /* ---- the Leave War as a member: own row only, no admin doors, his own undo (roll-call 13–15; Fable S8, S16) ---- */
  await go(page, 'leavewar'); await page.waitForTimeout(1500)
  await step(page, 'd-member-lw-doors', 'the Leave War as a member: no "New war", no stage button', async () => {
    const n = await page.locator('[data-testid="war-new"], [data-testid="stage-advance"]').count()
    return n === 0 ? true : `${n} admin doors drawn`
  })
  const iso = '2026-02-14'
  const other = await w4.lwTap(page, 'stiff', iso)
  await w4.lwCloseSheet(page).catch(() => {})
  await step(page, 'd-member-lw-other', 'a tap on another person\'s day opens nothing for a member', async () =>
    other.opened === 'nothing' ? true : `opened ${other.opened}`)
  const bid = await w4.lwBid(page, 'bane', iso, 'LL')
  await step(page, 'd-member-lw-own', 'a member bids LL on his own Saturday (14 Feb, inside the bidding window)', async () =>
    bid.placed ? true : `not placed: ${bid.why}`)
  await step(page, 'd-member-lw-undo', 'his own bid lights the Leave War\'s Undo (the member\'s undo door)', async () =>
    await page.locator('[data-testid="lw-undo"]').isEnabled() ? true : 'Undo not lit')
  /* a leave filed over his own undecided bid: it saves, and the message says "your" (Fable S2, plan §8) */
  const filed = await w4.fileInput(page, { type: 'LL', from: iso })
  await step(page, 'd-member-own-bid-replaced', 'he files leave on the Inputs page over his own bid: it saves, and the message says "your" bid', async () =>
    filed.added === 1 && /your/i.test(filed.toast) && !/Ranger's/i.test(filed.toast) ? { ok: true, note: filed.toast.slice(0, 140) } : `added ${filed.added}, toast "${filed.toast.slice(0, 160)}"`)
  /* his own input inside the Inputs page's default window */
  const soon = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10)   // inside the Inputs page's default window (today → two weeks, real clock)
  const july = await w4.fileInput(page, { type: 'LL', from: soon, remarks: 'walk2 own leave' })
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(300)
  await step(page, 'd-member-inputs-rows', 'Inputs as a member (filter: Everyone): he files his own leave; ✎ and ✕ sit on his own rows only', async () => {
    const mineCs = await cs(page, 'bane')
    const r = await page.evaluate(() => [...document.querySelectorAll('[data-edit]')].map(e => (e.closest('tr') || {}).innerText || ''))
    const bad = r.filter(t => !t.includes(mineCs))
    return july.added === 1 && r.length > 0 && bad.length === 0 ? { ok: true, note: `${r.length} editable, all his` } : `added ${july.added}; ${r.length} editable rows, ${bad.length} not his`
  })
  /* the next person inherits no undo (Fable S8; D148) */
  await signIn(page, 'outlaw')
  await go(page, 'leavewar'); await page.waitForTimeout(1200)
  await step(page, 'd-next-member-undo', 'another member signs in on the same browser: the Leave War\'s Undo is dark', async () =>
    await page.locator('[data-testid="lw-undo"]').isDisabled() ? true : 'Undo lit for the next person')
  await go(page, 'inputs')
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(300)
  await step(page, 'd-next-member-rows', 'and on Inputs (filter: Everyone), Ranger\'s leave is listed but carries no ✎ ✕ for him', async () => {
    const rows = await page.evaluate(() => [...document.querySelectorAll('tr')].filter(t => (t.innerText || '').includes('walk2 own leave')).map(t => t.querySelectorAll('[data-edit], .rmx').length))
    return rows.length === 1 && rows[0] === 0 ? true : `rows ${JSON.stringify(rows)}`
  })
  /* the medical view as a member: another's document reads in full, no Edit / Upchit (D211; Fable S15) */
  await page.click('#inMedBtn').catch(() => {}); await page.waitForTimeout(500)
  const card = page.locator('.medcard').first()
  const hasCard = await card.count()
  if (hasCard) { await card.click(); await page.waitForTimeout(500) }
  await step(page, 'd-member-medical-view', 'the medical view as a member: another person\'s card opens read-only (no Edit input, no Upchit)', async () => {
    if (!hasCard) return 'no medical card listed'
    const open = await page.locator('#docViewPop:not([hidden])').count()
    const edit = await page.locator('#docViewEdit, #docViewUpchit').count()
    return open === 1 && edit === 0 ? { ok: true, note: await text(page, '#docViewTitle') } : `open ${open}, edit doors ${edit}`
  })
  await page.click('#docViewClose').catch(() => {})
  await page.click('#medClose').catch(() => {}); await page.waitForTimeout(300)   // the medical view fills the screen, by design
  await signIn(page, 'us', 'us')

  /* ---- rename his callsign (admin, Quals) → the account list, the badge, "Your reports" follow ---- */
  await signIn(page, 'ad', 'a')
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(300)
  const box = page.locator('#qtbl input[data-cs="bane"]')
  await box.scrollIntoViewIfNeeded(); await box.fill('Rangr'); await box.press('Tab'); await page.waitForTimeout(400)
  await page.click('#qSave').catch(() => {}); await page.waitForTimeout(300)
  await users(page)
  await step(page, 'd-rename-users', 'renamed on Quals: Admin → Users shows the new callsign on his account', async () =>
    (await text(page, '[data-acct="acus"]')).includes('Rangr') ? true : `row reads "${await text(page, '[data-acct="acus"]')}"`)
  await signIn(page, 'us', 'us')
  await step(page, 'd-rename-badge', 'renamed: he signs in as "Rangr · Member"', async () =>
    (await text(page, '#roleBadge')) === 'Rangr · Member' ? true : `badge "${await text(page, '#roleBadge')}"`)
  await go(page, 'help')
  await step(page, 'd-rename-reports', 'renamed: "Your reports" still lists his report', async () =>
    (await text(page, '#bugMine')).includes('walk2') ? true : 'his report is gone')
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(300)
  await step(page, 'd-member-no-rename', 'a member with editing on: his callsign reads as text — only an admin renames (D218)', async () =>
    (await page.locator('#qtbl input[data-cs="bane"]').count()) === 0 && (await page.locator('#qtbl input[data-init="bane"]').count()) === 1 ? true : 'his callsign box is drawn')
  await page.click('#qSave').catch(() => {}); await page.waitForTimeout(300)
  /* the admin puts his callsign back */
  await signIn(page, 'ad', 'a')
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(300)
  const backBox = page.locator('#qtbl input[data-cs="bane"]')
  await backBox.scrollIntoViewIfNeeded(); await backBox.fill('Ranger'); await backBox.press('Tab'); await page.waitForTimeout(400)
  await page.click('#qSave').catch(() => {}); await page.waitForTimeout(300)
  await signIn(page, 'us', 'us')
  await step(page, 'd-member-renamed-back', 'the admin renames him back on Quals: he signs in as "Ranger · Member"', async () =>
    (await text(page, '#roleBadge')) === 'Ranger · Member' ? true : `badge "${await text(page, '#roleBadge')}"`)

  /* ---- relink an account to another callsign → the next sign-in is the new person ---- */
  await signIn(page, 'ad', 'a')
  await editAccount(page, 'achex', async () => { await page.selectOption('#accEdPid', 'pike'); await page.click('#accEdSave') })
  const nomad = await cs(page, 'pike')
  await signIn(page, 'hex')
  await step(page, 'd-relink', 'relinked: "hex" signs in as the callsign the admin picked', async () =>
    (await text(page, '#roleBadge')) === `${nomad} · Member` ? true : `badge "${await text(page, '#roleBadge')}"`)

  /* ---- the last admin: a second admin demotes the first; the only admin cannot touch his own ---- */
  await signIn(page, 'ad', 'a')
  await editAccount(page, 'acoutlaw', async () => { await page.selectOption('#accEdRole', 'admin'); await page.click('#accEdSave') })
  await signIn(page, 'outlaw')
  await step(page, 'd-second-admin', 'promoted: "outlaw" signs in as an admin (the Admin tab shows)', async () =>
    (await text(page, '#roleBadge')).endsWith('· Admin') && await page.locator('.nav a[data-page="admin"]').isVisible() ? true : `badge "${await text(page, '#roleBadge')}"`)
  await editAccount(page, 'acad', async () => { await page.selectOption('#accEdRole', 'main'); await page.click('#accEdSave') })
  await users(page)
  await step(page, 'd-only-admin-own', 'now the only admin: his own account still reads "you" and cannot be opened (no way to lock everyone out)', async () =>
    await page.locator('[data-acct="acoutlaw"] .acc-tap').isDisabled() ? true : 'his own account opens')
  await signIn(page, 'ad', 'a')
  await step(page, 'd-demoted', 'demoted: "ad" signs in as a member (no Admin tab)', async () =>
    (await text(page, '#roleBadge')).endsWith('· Member') && !(await page.locator('.nav a[data-page="admin"]').isVisible()) ? true : `badge "${await text(page, '#roleBadge')}"`)
  await signIn(page, 'outlaw')
  await editAccount(page, 'acad', async () => { await page.selectOption('#accEdRole', 'admin'); await page.click('#accEdSave') })
  await signIn(page, 'ad', 'a')
  await editAccount(page, 'acoutlaw', async () => { await page.selectOption('#accEdRole', 'main'); await page.click('#accEdSave') })
  await step(page, 'd-restored', 'back as it was: "ad" is admin again, "outlaw" a member', async () =>
    (await text(page, '[data-acct="acoutlaw"]')).includes('Member') || (await text(page, '[data-acct="acoutlaw"]')).toLowerCase().includes('member') ? true : `outlaw row "${await text(page, '[data-acct="acoutlaw"]')}"`)

  /* ---- a sign-in renamed onto a waiting name answers the request (Fable S1) ---- */
  await signIn(page, 'wren@mail'); await page.fill('#accCs', 'Wren'); await page.fill('#accIni', 'W'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signIn(page, 'ad', 'a')
  await editAccount(page, 'achex', async () => { await page.fill('#accEdName', 'wren@mail'); await page.click('#accEdSave') })
  await users(page)
  await step(page, 'd-rename-onto-request', 'an account renamed to a name that is waiting: the request is answered, the count goes', async () => {
    const req = await page.locator('#admWaiting [data-req]').count()
    const badge = await page.locator('#admWaitBadge').count()
    return req === 0 && badge === 0 ? true : `requests ${req}, badge ${badge}`
  })
  await editAccount(page, 'achex', async () => { await page.fill('#accEdName', 'hex'); await page.click('#accEdSave') })

  /* ---- collisions say why (Fable S18) ---- */
  await users(page)
  const accBefore = await page.locator('#accList [data-acct]').count()
  await page.fill('#accAddName', 'US'); await page.selectOption('#accAddPid', { index: 1 }); await page.click('#accAdd'); await page.waitForTimeout(400)
  const said1 = await page.evaluate(() => (document.getElementById('toastEl') || {}).textContent || '')
  await step(page, 'd-add-duplicate-name', 'adding "US" (an existing sign-in, any case) is refused and says why', async () =>
    (await page.locator('#accList [data-acct]').count()) === accBefore && /already has an account/.test(said1) ? { ok: true, note: said1 } : `accounts ${accBefore}→${await page.locator('#accList [data-acct]').count()}, said "${said1}"`)
  const offered = await page.$$eval('#accAddPid option', os => os.map(o => o.value))
  await step(page, 'd-picker-free-only', 'the callsign picker never offers a person who already has an account', async () => {
    const bad = ['stiff', 'bane', 'casper', 'pike'].filter(p => offered.includes(p))
    return bad.length === 0 ? true : `offers ${bad.join(',')}`
  })

  /* ---- the waiting count follows every answer (Fable S19) ---- */
  for (const n of ['a1@mail', 'a2@mail']) { await signIn(page, n); await page.fill('#accCs', n.slice(0, 2)); await page.fill('#accIni', n); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(250) }
  await signIn(page, 'ad', 'a')
  const c2 = await text(page, '#admWaitBadge')
  await users(page)
  await page.locator('#admWaiting [data-decline]').first().click(); await page.waitForTimeout(300)
  const c1 = await text(page, '#admWaitBadge')
  await page.locator('#admWaiting [data-approve]').first().click(); await page.waitForTimeout(200)
  await page.selectOption('#apvPid', { index: 1 }); await page.click('#apvGo'); await page.waitForTimeout(300)
  await step(page, 'd-badge-counts', 'two waiting → "2"; one declined → "1"; the other approved → the count goes, at once', async () =>
    c2 === '2' && c1 === '1' && (await page.locator('#admWaitBadge').count()) === 0 ? true : `${c2} → ${c1} → ${await page.locator('#admWaitBadge').count()}`)

  /* ---- the bell for bug reports: the admin's, never another member's (Fable S14) ---- */
  await step(page, 'd-admin-bell-reports', 'the member\'s report lights the admin\'s bell', async () =>
    (await page.locator('#notifyBell.on').count()) === 1 ? true : 'bell dark')
  await signIn(page, 'outlaw')
  await go(page, 'help')
  await step(page, 'd-member-no-others-reports', 'another member sees no one else\'s report under "Your reports"', async () =>
    (await page.locator('#bugMine').count()) === 0 ? true : `"Your reports" shows ${await text(page, '#bugMine')}`)
  await signIn(page, 'ad', 'a')


  /* ---- reloads mid-way lose nothing and invent nothing (Fable S11) ---- */
  await signIn(page, 'kite2@mail'); await page.fill('#accCs', 'K2'); await page.fill('#accIni', 'K'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(250)
  await signIn(page, 'kite3@mail'); await page.fill('#accCs', 'K3'); await page.fill('#accIni', 'TBNS')
  await page.reload(); await page.waitForTimeout(800)
  await signIn(page, 'ad', 'a'); await users(page)
  await page.locator('#admWaiting [data-approve]').first().click(); await page.waitForTimeout(200)
  await page.reload(); await page.waitForTimeout(800)
  await signIn(page, 'ad', 'a'); await users(page)
  await step(page, 'd-reload-mid', 'reloads mid-way: the sent request is still there; the one typed but never sent never became one', async () => {
    const t = await text(page, '#admWaiting')
    return t.includes('kite2@mail') && !t.includes('kite3@mail') ? true : `waiting reads "${t.slice(0, 120)}"`
  })
  await page.locator('#admWaiting [data-decline]').first().click(); await page.waitForTimeout(200)

  /* ---- a posted-out (archived) callsign keeps its account ---- */
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {})
  /* the ✕ in the Archive column (the table is redrawn under a held pointer, so the click is
     dispatched on the element the table's own handler reads — the same route a tap takes) */
  if (await page.locator('#qEdit').isVisible()) { await page.click('#qEdit'); await page.waitForTimeout(300) }   // the ✕ answers only with editing on
  const archOk = await page.evaluate(() => { const el = document.querySelector('#qtbl [data-arch="pike"]'); if (!el) return 'no ✕ drawn for the row'; el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true })
  await page.waitForTimeout(400)
  await step(page, 'd-archive', 'the admin archives the callsign "hex" belongs to, with the row\'s ✕', async () =>
    archOk === true && await page.evaluate(() => !!window.PEOPLE.pike.archived) ? true : String(archOk))
  await users(page)
  await step(page, 'd-archived-list', 'archived on Quals: the account stays on Admin → Users', async () =>
    (await page.locator('[data-acct="achex"]').count()) === 1 ? { ok: true, note: await text(page, '[data-acct="achex"]') } : 'the account is gone')
  await signIn(page, 'hex')
  await step(page, 'd-archived-signin', 'archived: "hex" still signs in, as his callsign', async () =>
    (await page.locator('#shell').count()) === 1 ? { ok: true, note: await text(page, '#roleBadge') } : 'he cannot sign in')

  /* ---- the guest switch turned back OFF → the next sign-in is the waiting screen ---- */
  await signIn(page, 'kite@mail'); await page.fill('#accCs', 'Kite'); await page.fill('#accIni', 'K'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signIn(page, 'ad', 'a'); await users(page); await page.check('#admGuestView'); await page.waitForTimeout(200)
  await signIn(page, 'kite@mail')
  await step(page, 'd-guest-on', 'guest switch on: the waiting person sees the guest view', async () => (await page.locator('#guestApp').count()) === 1)
  /* D221 — someone asking while the switch is on: one tap from the waiting screen */
  await signIn(page, 'kite9@mail'); await page.fill('#accCs', 'K9'); await page.fill('#accIni', 'K'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  const hasBtn = await page.locator('#accGuest').count()
  if (hasBtn) { await page.click('#accGuest'); await page.waitForTimeout(500) }
  await step(page, 'd-guest-button', 'asking while guest access is on: the waiting screen offers "View the schedule", one tap into the guest view (D221)', async () =>
    hasBtn === 1 && (await page.locator('#guestApp').count()) === 1 ? true : `button ${hasBtn}, guest view ${await page.locator('#guestApp').count()}`)
  await signIn(page, 'kite@mail')
  const wks = page.locator('#guestApp [data-wk]')
  const nw = await wks.count()
  if (nw > 1) { await wks.nth(nw - 1).click(); await page.waitForTimeout(700); await wks.first().click(); await page.waitForTimeout(700) }
  await step(page, 'd-guest-weeks', 'the guest moves weeks with the week chips: every day drawn as members see it, nothing else opens (Fable S5, D215)', async () => {
    const shell = await page.locator('#shell, .modal:not([hidden])').count()
    const days = await page.locator('#guestApp .day').count()
    return nw > 1 && days > 0 && shell === 0 && (await page.locator('#guestApp').count()) === 1 ? true : `chips ${nw} days ${days} shell/modal ${shell}`
  })
  await signIn(page, 'ad', 'a'); await users(page); await page.uncheck('#admGuestView'); await page.waitForTimeout(200)
  await signIn(page, 'kite@mail')
  await step(page, 'd-guest-off', 'guest switch off: his next sign-in shows the waiting screen again', async () =>
    (await page.locator('#accessWaiting').count()) === 1 && (await page.locator('#guestApp').count()) === 0)

  /* ---- what the next person inherits: a window left open (roll-call 30) ----
     On desktop the Edit history window covers the top bar, so no Logout is reachable while
     it is open (by design, a modal); the phone walk below signs out with the BOARD open,
     and ui/pops.test.ts closes every window flag at the session reset. */
  await signIn(page, 'ad', 'a'); await go(page, 'editsched')
  await page.click('#histBtn'); await page.waitForTimeout(400)
  await step(page, 'd-window-covers-logout', 'Edit history open: it covers the top bar, so signing out means closing it first (a modal, by design)', async () => {
    const open = await page.locator('#histModal:not([hidden])').count()
    const hit = await page.evaluate(() => { const b = document.getElementById('logout').getBoundingClientRect(); const e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!e && (e.id === 'logout' || !!e.closest('#logout')) })
    return open === 1 && !hit ? true : `open ${open}, Logout reachable ${hit}`
  })
  await page.click('#histClose').catch(() => {}); await page.waitForTimeout(200)

  /* ---- the SCHEDULER tick on his own row puts a member in the sign-off boxes (D149's consequence) ---- */
  await signIn(page, 'outlaw')
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {}); await page.click('#qEdit'); await page.waitForTimeout(300)
  const had = await page.evaluate(() => !!(window.PEOPLE.casper.quals || {}).sched)
  if (!had) { const c = page.locator('#qtbl td[data-q="casper|sched"]'); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(300) }
  await page.click('#qSave').catch(() => {})
  await signIn(page, 'ad', 'a')
  const outlawCs = await cs(page, 'casper')
  await lib.board(page, 2)
  await step(page, 'd-scheduler-tick', 'a member who ticks SCHEDULER on his own row is offered in the sign-off boxes (on the look card)', async () => {
    const opts = await page.$$eval('#schedBoard select', ss => ss.flatMap(s => [...s.options].map(o => o.textContent)))
    return opts.some(o => (o || '').includes(outlawCs)) ? { ok: true, note: `${outlawCs} is offered` } : `${outlawCs} not offered`
  })
  await lib.closeBoard(page)

  /* ---- a reload mid-session lands on the sign-in; the accounts stay ---- */
  await page.reload(); await page.waitForTimeout(800)
  await step(page, 'd-reload-session', 'a reload signs you out (as today) and keeps every account', async () => {
    const card = await page.locator('#luser').count()
    await signIn(page, 'hex')
    return card === 1 && (await page.locator('#shell').count()) === 1 ? true : `sign-in card ${card}`
  })

  errorsAll.push(...errors.map(e => 'desktop: ' + e))
  await browser.close()
}

/* ======================= PHONE ======================= */
{
  const { browser, page, errors } = await world(390, 844)
  await signIn(page, 'us', 'us')
  await page.click('#burger'); await page.waitForTimeout(400)
  await step(page, 'p-member-drawer', 'phone, member: the drawer reads "Signed in as Ranger · Member" and has no Admin', async () => {
    const acct = await text(page, '#drawerAcct')
    const admin = await page.locator('#drawerNav a', { hasText: 'Admin' }).count()
    return acct.includes('Ranger') && acct.includes('Member') && admin === 0 ? true : `"${acct}" admin entries ${admin}`
  })
  await page.click('#drawerLogout'); await page.waitForTimeout(400)
  await signIn(page, 'ad', 'a')
  /* sign out in the middle of the board (Fable S12): on a phone the board fills the screen,
     so the menu (and its Logout) is not reachable until the board is closed — by design */
  await lib.board(page, 1)
  await step(page, 'p-board-covers-menu', 'phone: with the board open the menu button is covered, so signing out means closing the board first', async () => {
    const hit = await page.evaluate(() => { const m = document.getElementById('burger'); if (!m) return 'no menu'; const b = m.getBoundingClientRect(); const e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!e && (e.id === 'burger' || !!e.closest('#burger')) })
    return hit === false ? true : `menu reachable: ${hit}`
  })
  await lib.closeBoard(page)
  await users(page)
  await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(300)
  await step(page, 'p-account-editor', 'phone: an account\'s editor (name, callsign, role, Switch off) fits the screen', async () => {
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    return (await page.locator('#accEdSave').isVisible()) && !over ? true : `overflow ${over}`
  })
  await page.click('#accEdOnOff'); await page.waitForTimeout(300)
  await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForTimeout(300)
  await signIn(page, 'hex')
  await step(page, 'p-switched-off', 'phone: the switched-off card', async () => (await page.locator('#accessOff').count()) === 1)
  errorsAll.push(...errors.map(e => 'phone: ' + e))
  await browser.close()
}

const pass = results.filter(r => r.ok).length
writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, errors: errorsAll }, null, 1))
console.log(`\n${pass}/${results.length} PASS · ${errorsAll.length} console/page errors`)
for (const e of errorsAll.slice(0, 20)) console.log('  ERR', e.slice(0, 200))
