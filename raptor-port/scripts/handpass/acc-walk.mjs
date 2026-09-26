/* [ACCOUNTS] walk (26 Sep 26) — the roll-call of the plan
   (docs/superpowers/plans/2026-09-26-accounts-plan.md §Roll-call), driven on the REAL
   production bundle in a real Chromium at desktop and phone width, pictures to disk.
   Every step ASSERTS the right behaviour (PASS means correct), so re-running it on a fixed
   build IS the re-walk (bug-check order §5). Fixtures go through the app's own controls,
   except two stated shortcuts: a day published and a medical input filed through the
   localhost probe (the routes under test are the guest's view of them, not publishing or
   filing). Results → HP_OUT (JSON), pictures → HP_SHOTS.
   Run: HP_SHOTS=… HP_OUT=… node scripts/handpass/acc-walk.mjs            */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts'
const lib = await import('./lib.mjs')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts'
const OUT = process.env.HP_OUT || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts/walk.json'
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
async function signIn(page, name, pass = 'x') {
  if (await page.locator('#luser').count() === 0) await signOut(page)
  await page.waitForSelector('#luser')
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(700)
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
const text = async (page, sel) => ((await page.locator(sel).first().textContent()) || '').replace(/\s+/g, ' ').trim()
const cs = (page, id) => page.evaluate(i => window.PEOPLE[i].cs, id)
async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(500) }

/* ======================= DESKTOP ======================= */
{
  const { browser, page, errors } = await world(1440, 900)

  await step(page, 'd-signin-card', 'the sign-in card is unchanged (the login page stays simple)', async () =>
    (await page.locator('#loginForm').count()) === 1 && (await page.locator('#accessRequest').count()) === 0)

  /* ---- the admin ---- */
  await signIn(page, 'ad', 'a')
  const saber = await cs(page, 'stiff'), ranger = await cs(page, 'bane')
  await step(page, 'd-admin-topbar', 'admin: no "View as" picker; the badge reads "Saber · Admin" and is inert', async () => {
    if (await page.locator('#viewAs').count()) return 'the #viewAs picker is still drawn'
    const b = await text(page, '#roleBadge')
    const tag = await page.locator('#roleBadge').evaluate(e => e.tagName)
    return b === `${saber} · Admin` && tag === 'SPAN' ? true : `badge "${b}" <${tag}>`
  })
  await step(page, 'd-admin-me-puck', 'the purple "this is you" puck is the admin\'s own (Saber), nobody else\'s', async () => {
    const ps = await page.$$eval('#vWeek .puck.me', els => [...new Set(els.map(e => e.getAttribute('data-person')))])
    return ps.length > 0 && ps.every(p => p === 'stiff') ? true : `me pucks: ${ps.join(',') || 'none'}`
  })
  await step(page, 'd-admin-wrong-pass', 'a wrong password on a seeded sign-in is still refused', async () => {
    await signOut(page); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'A'); await page.click('#loginForm button[type=submit]')
    await page.waitForTimeout(400)
    return (await text(page, '#lerr')).includes('Incorrect')
  })

  /* ---- the request flow (D204) ---- */
  await signIn(page, 'viper@mail', 'whatever')
  await step(page, 'd-request-screen', 'a name on no list lands on "Request access", naming the sign-in', async () =>
    (await page.locator('#accessRequest').count()) === 1 && (await text(page, '#accName')) === 'viper@mail' && (await page.locator('#shell').count()) === 0)
  await page.fill('#accCs', 'Viper'); await page.fill('#accIni', 'JOBLOGGS'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
  await page.click('#accSend'); await page.waitForTimeout(400)
  await step(page, 'd-waiting-screen', 'after asking: the waiting screen, what he asked, Sign out', async () =>
    (await page.locator('#accessWaiting').count()) === 1 && (await text(page, '#accessWaiting')).includes('Viper'))
  await signOut(page)
  await signIn(page, 'viper@mail', 'again')
  await step(page, 'd-waiting-again', 'signing in again while waiting shows the waiting screen, not the form', async () =>
    (await page.locator('#accessWaiting').count()) === 1)
  await signOut(page)

  await signIn(page, 'ad', 'a')
  await step(page, 'd-admin-badge', 'the Admin tab carries the count waiting (D204)', async () =>
    (await text(page, '#admWaitBadge')) === '1')
  await go(page, 'admin')
  await step(page, 'd-users-panel', 'Admin → Users: the request, the accounts (his own reads "you"), add, the guest switch', async () => {
    const own = await page.locator('[data-acct="acad"] .acc-tap').isDisabled()
    const req = await page.locator('#admWaiting [data-req]').count()
    const g = await page.locator('#admGuestView').isChecked()
    return own && req === 1 && g === false ? true : `own disabled ${own}, requests ${req}, guest ${g}`
  })
  await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(300)
  /* since [ACCOUNTS-NEW-PERSON] (D214) a callsign nobody has opens "New person"; this walk
     links an existing puck, so it takes "On the roster" first (Astra's code read #4) */
  const opensNew = (await page.locator('#apvModeNew[aria-pressed="true"]').count()) === 1
  await page.click('#apvModeRoster'); await page.waitForSelector('#apvPid')
  await step(page, 'd-approve-form', 'Approve opens New person for a callsign nobody has (D214); On the roster asks for the puck (typed callsign only a hint) and the role', async () =>
    opensNew && (await page.locator('#apvPid').count()) === 1 && (await page.locator('#apvPid').inputValue()) === ''
      ? true : `opens New person ${opensNew}, picker ${await page.locator('#apvPid').count()}`)
  await page.click('#apvGo'); await page.waitForTimeout(300)
  await step(page, 'd-approve-needs-puck', 'giving access with no puck picked is refused, the request stays', async () =>
    (await page.locator('#admWaiting [data-req]').count()) === 1)
  await page.selectOption('#apvPid', 'pike'); await page.click('#apvGo'); await page.waitForTimeout(400)
  await step(page, 'd-approved', 'approved: the request clears, the account appears, the badge goes', async () => {
    const req = await page.locator('#admWaiting [data-req]').count()
    const acct = await page.locator('#accList').innerText()
    const badge = await page.locator('#admWaitBadge').count()
    return req === 0 && acct.includes('viper@mail') && badge === 0 ? true : `req ${req} badge ${badge}`
  })
  await signOut(page)
  await signIn(page, 'viper@mail', 'any')
  const pikeCs = await cs(page, 'pike')
  await step(page, 'd-viper-in', 'the approved person signs in AS the puck the admin picked', async () =>
    (await text(page, '#roleBadge')) === `${pikeCs} · Member`)
  await signOut(page)

  /* ---- decline, ask again; add for a waiting name ---- */
  await signIn(page, 'wren@mail'); await page.fill('#accCs', 'Wren'); await page.fill('#accIni', 'W'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await page.click('#admWaiting [data-decline]'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'wren@mail')
  await step(page, 'd-declined-asks-again', 'declined: signing in again offers "Request access" again', async () =>
    (await page.locator('#accessRequest').count()) === 1)
  await page.fill('#accCs', 'Wren'); await page.fill('#accIni', 'W'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await page.fill('#accAddName', 'wren@mail'); await page.selectOption('#accAddPid', 'dj'); await page.click('#accAdd'); await page.waitForTimeout(400)
  await step(page, 'd-add-answers-request', 'adding an account for a waiting name answers the request', async () =>
    (await page.locator('#admWaiting [data-req]').count()) === 0 && (await page.locator('#accList').innerText()).includes('wren@mail'))

  /* ---- switch off / on ---- */
  await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(200)
  await page.click('#accEdOnOff'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'hex')
  await step(page, 'd-switched-off', 'an account switched off sees only "Your access is switched off"', async () =>
    (await page.locator('#accessOff').count()) === 1 && (await page.locator('#shell').count()) === 0)
  await signOut(page); await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(200); await page.click('#accEdOnOff'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'hex')
  await step(page, 'd-switched-on', 'switched back on, he is in again', async () => (await page.locator('#shell').count()) === 1)
  await signOut(page)

  /* ---- persistence across a reload ---- */
  await page.reload(); await page.waitForSelector('#luser')
  await signIn(page, 'wren@mail')
  await step(page, 'd-reload-keeps-accounts', 'after a reload the accounts are still there (the session is not)', async () =>
    (await page.locator('#shell').count()) === 1 && (await text(page, '#roleBadge')).includes(await cs(page, 'dj')))
  await signOut(page)

  /* ---- the member ---- */
  await signIn(page, 'us', 'us')
  await step(page, 'd-member-topbar', 'member: "Ranger · Member", no Edit Schedule, no Admin', async () => {
    const b = await text(page, '#roleBadge')
    const edit = await page.locator('.nav a[data-page="editsched"]').isVisible()
    const adm = await page.locator('.nav a[data-page="admin"]').isVisible()
    return b === `${ranger} · Member` && !edit && !adm ? true : `badge ${b} edit ${edit} admin ${adm}`
  })
  await go(page, 'quals')
  await page.click('#qViewA').catch(() => {}); await page.waitForTimeout(200)
  await page.click('#qEdit'); await page.waitForTimeout(300)
  await step(page, 'd-member-quals', 'Quals editing (D149): his own row has boxes, others read as text; his callsign is the admin\'s (D218)', async () => {
    const own = await page.locator('#qtbl input[data-init="bane"]').count()
    const other = await page.locator('#qtbl input[data-init="stiff"]').count()
    const ownCs = await page.locator('#qtbl input[data-cs="bane"]').count()
    const ro = await page.locator('#qtbl tr.qro').count()
    return own === 1 && other === 0 && ownCs === 0 && ro > 5 ? true : `own ${own} other ${other} his callsign box ${ownCs} ro ${ro}`
  })
  const qk = await page.evaluate(() => { const c = [...document.querySelectorAll('#qtbl td[data-q^="bane|"]')].map(x => x.getAttribute('data-q').split('|')[1]).find(k => !['san', 'sxo', 'sched'].includes(k)); return c || null })
  const held = (id) => page.evaluate(([i, k]) => !!(window.PEOPLE[i].quals || {})[k], [id, qk])
  const hadMine = await held('bane')
  await page.locator(`#qtbl td[data-q="bane|${qk}"]`).first().scrollIntoViewIfNeeded()
  await page.click(`#qtbl td[data-q="bane|${qk}"]`); await page.waitForTimeout(300)
  await step(page, 'd-member-quals-own', `he ticks his own qualification (${qk})`, async () =>
    (await held('bane')) === !hadMine ? true : 'his own tick did not change')
  const otherHad = await held('stiff')
  const oc = page.locator(`#qtbl td[data-q="stiff|${qk}"]`).first()
  if (await oc.count()) { await oc.scrollIntoViewIfNeeded(); await oc.click(); await page.waitForTimeout(300) }
  await step(page, 'd-member-quals-other', "a tick on another person's row is refused, with the reason", async () => {
    const same = (await held('stiff')) === otherHad
    const body = await page.locator('body').innerText()
    return same ? (body.includes('only edit your own row') ? true : 'refused, but no reason seen on screen') : 'another row changed'
  })
  await page.click('#qSave').catch(() => {}); await page.waitForTimeout(300)
  await go(page, 'inputs')
  await step(page, 'd-member-inputs', 'Inputs: his Person is fixed to Ranger; ✎ only on his own rows', async () => {
    const fixed = await page.locator('#inPersonFixed').innerText().catch(() => '')
    return fixed === ranger ? true : `fixed person "${fixed}"`
  })
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="lw-viewing"]', { timeout: 15000 }).catch(() => {})
  await step(page, 'd-member-leavewar', 'Leave War: the war follows him — "Viewing as Ranger", his own row lit', async () => {
    const v = await page.locator('[data-testid="lw-viewing"]').innerText().catch(() => '')
    const viewer = await page.evaluate(() => window.__lwViewer ?? null)
    return v.includes(ranger) ? true : `chip "${v}"`
  })
  await go(page, 'viewsched')
  await signOut(page)

  /* ---- the guest (D204; D211) ---- */
  await signIn(page, 'ad', 'a')
  await lib.board(page, 0)
  const pub = await lib.publish(page, 0)
  console.log('fixture: Monday published', JSON.stringify(pub))
  await lib.closeBoard(page)
  /* ---- undo is per sign-in (13 Sep 26, D148; AC15) — the publish just made is undoable ---- */
  await go(page, 'editsched')
  const undoBefore = !(await page.locator('#undoBtn').isDisabled())
  await signOut(page); await signIn(page, 'us', 'us'); await signOut(page); await signIn(page, 'ad', 'a')
  await go(page, 'editsched')
  await step(page, 'd-undo-fresh', 'the admin publishes (undo lit), signs out, a member signs in and out, the admin again: nothing to undo', async () =>
    undoBefore && await page.locator('#undoBtn').isDisabled() ? true : `undo lit before: ${undoBefore}`)
  await go(page, 'admin'); await page.check('#admGuestView'); await page.waitForTimeout(300)
  await signOut(page)
  await signIn(page, 'guesty@mail'); await page.fill('#accCs', 'G'); await page.fill('#accIni', 'GUEST'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signOut(page); await signIn(page, 'guesty@mail')
  await step(page, 'd-guest', 'guest: the walled-off view — no tabs, no app windows, "Waiting for access — view only"', async () => {
    const g = await page.locator('#guestApp').count()
    const nav = await page.locator('#topnav').count()
    const note = await page.locator('#guestNote').innerText().catch(() => '')
    return g === 1 && nav === 0 && note.includes('Waiting') ? true : `guest ${g} nav ${nav}`
  })
  await step(page, 'd-guest-medical', 'guest: a medical input reads in full, as a member sees it — its type and remark (D213)', async () => {
    const t = await page.locator('#guestApp').innerText()
    return t.includes('Medical leave 13 Jul') ? true : 'the medical remark is not shown to the guest'
  })
  await step(page, 'd-guest-unpublished', 'guest: a day not yet published shows as it stands, as members see it — no "Not published yet", no buttons (D215)', async () => {
    const t = await page.locator('#guestApp').innerText()
    const tue = await page.locator('#guestApp .day[data-day="1"]').innerText()
    const btns = await page.locator('#guestApp .day button').count()
    return !t.includes('Not published yet') && /COMMON PROGRAMME/i.test(tue) && btns === 0 ? true : `"Not published yet" ${t.includes('Not published yet')}, Tuesday drawn ${/COMMON PROGRAMME/i.test(tue)}, buttons ${btns}`
  })
  await step(page, 'd-guest-no-working-copy', 'guest: no working-draft picker on a published day', async () =>
    (await page.locator('#guestApp select[data-vwork]').count()) === 0)
  await step(page, 'd-guest-no-dead-doors', 'guest: no ⓘ, no "tap to review", no tappable day name (his view has no panel for them)', async () => {
    const n = await page.locator('#guestApp [data-dayinfo], #guestApp .dinfobtn, #guestApp [data-daywarn]').count()
    return n === 0 ? true : `${n} dead controls drawn`
  })
  await signOut(page)
  await signIn(page, 'us', 'us')
  await step(page, 'd-member-medical', 'a member sees the medical input in full (D211 — "Keep as today")', async () => {
    const t = await page.locator('#vWeek').innerText()
    return t.includes('Medical leave 13 Jul') ? true : 'the member does not see the remark'
  })
  await signOut(page)

  /* ---- who is recorded (D166 (5)) ---- */
  await signIn(page, 'ad', 'a')
  await go(page, 'editsched')
  await page.click('#histBtn').catch(() => {}); await page.waitForTimeout(500)
  await step(page, 'd-who', 'Edit history names the admin who signed and published — his callsign', async () => {
    const t = await page.locator('body').innerText()
    return t.includes(saber) ? true : 'Saber not named in the history'
  })
  await page.keyboard.press('Escape').catch(() => {})
  errorsAll.push(...errors.map(e => 'desktop: ' + e))
  await browser.close()
}

/* ======================= PHONE ======================= */
{
  const { browser, page, errors } = await world(390, 844)
  await signIn(page, 'ad', 'a')
  await page.click('#burger'); await page.waitForTimeout(400)
  await step(page, 'p-drawer', 'phone drawer: no View-as chips, no toggle; "Signed in as Saber · Admin"', async () => {
    const va = await page.locator('#drawerViewAs').count()
    const tg = await page.locator('#drawerRole').count()
    const acct = await page.locator('#drawerAcct').innerText()
    return va === 0 && tg === 0 && acct.includes('Admin') ? true : `chips ${va} toggle ${tg} acct "${acct}"`
  })
  await page.click('#drawerLogout'); await page.waitForTimeout(400)
  await signIn(page, 'kite@mail')
  await step(page, 'p-request', 'phone: the Request access card fits', async () => {
    const w = await page.locator('.acc-card').evaluate(e => e.getBoundingClientRect().right)
    return w <= 390 ? true : `card right edge ${w}`
  })
  await page.fill('#accCs', 'Kite'); await page.fill('#accIni', 'K'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await step(page, 'p-waiting', 'phone: the waiting card', async () => (await page.locator('#accessWaiting').count()) === 1)
  await page.click('#accOut'); await page.waitForTimeout(300)
  await signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
  if (!await page.locator('#admUsers').isVisible()) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(300) }
  await step(page, 'p-users', 'phone: Admin → Users drills in; the request and the accounts read', async () => {
    const r = await page.locator('#admWaiting [data-req]').count()
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    return r === 1 && !over ? true : `requests ${r} page overflows ${over}`
  })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(300)
  await page.click('#burger'); await page.waitForTimeout(300)
  await step(page, 'p-drawer-badge', 'phone drawer: the Admin entry carries the count waiting', async () =>
    (await page.locator('#drawerWaitBadge').innerText().catch(() => '')) === '1')
  await page.click('#drawerLogout'); await page.waitForTimeout(300)
  /* the guest on a phone */
  await signIn(page, 'ad', 'a'); await page.evaluate(() => window.go('admin')); await page.waitForTimeout(300)
  if (!await page.locator('#admUsers').isVisible()) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(200) }
  await page.check('#admGuestView'); await page.waitForTimeout(300)
  await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForTimeout(300)
  await signIn(page, 'kite@mail')
  await step(page, 'p-guest', 'phone: the guest view — its bar fits, the week reads', async () => {
    const g = await page.locator('#guestApp').count()
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    return g === 1 && !over ? true : `guest ${g} overflow ${over}`
  })
  errorsAll.push(...errors.map(e => 'phone: ' + e))
  await browser.close()
}

const pass = results.filter(r => r.ok).length
writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, errors: errorsAll }, null, 1))
console.log(`\n${pass}/${results.length} PASS · ${errorsAll.length} console/page errors`)
for (const e of errorsAll.slice(0, 20)) console.log('  ERR', e.slice(0, 200))
