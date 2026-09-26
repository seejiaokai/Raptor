/* [ACCOUNTS-NEW-PERSON] walk (26 Sep 26) — the plan's roll-call and door check
   (docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md), driven by Fable's scenarios S1–S17
   (docs/superpowers/specs/2026-09-26-accounts-new-person-redteam-r1-fable.md, Part 2) on the REAL production
   bundle in a real Chromium, desktop 1440×900 and phone 390×844, pictures to disk. Every step ASSERTS the right
   behaviour (PASS means correct), so re-running it on a fixed build IS the re-walk (bug-check order §5).
   Fixtures go through the app's own controls; the one read of the roster behind the screen is `window.PEOPLE`
   (the localhost probe bridge) to find a person's id for a selector — never to write.
   Run: HP_URL=http://localhost:4174 HP_SHOTS=… HP_OUT=… node scripts/handpass/np-walk.mjs            */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4174'
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-accounts-new-person/walk1'
const OUT = process.env.HP_OUT || SHOTS + '/walk.json'
mkdirSync(SHOTS, { recursive: true })

const results = []
let shotN = 0
const errorsAll = []

async function world(width, height, tag) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag} ${m.text()}`) })
  page.on('pageerror', e => errors.push(`${tag} PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
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
  await page.waitForSelector('#luser')
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(700)
}
async function signUp(page, name, f) {
  await signIn(page, name)
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', f.cs); if (f.ini != null) await page.fill('#accIni', f.ini)
  await page.selectOption('#accSeat', f.seat); if (f.seat !== 'GND') await page.selectOption('#accCat', f.cat)
  await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const toastText = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' })
const bellOn = page => page.evaluate(() => !!document.querySelector('#notifyBell.on'))
const pidOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, cs)
async function go(page, to) { await page.evaluate(p => window.go(p), to); await page.waitForTimeout(600) }
async function usersPane(page, phone) {
  await go(page, 'admin')
  if (phone) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(400) }
}
async function trackerList(page) {
  await go(page, 'tracker'); await page.waitForTimeout(900)
  await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await page.waitForTimeout(300)
  const l = await page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item .dlg-lbl')].map(b => b.textContent.trim()))
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (await page.locator('#dlgModal').isVisible().catch(() => false)) { const c = page.locator('#dlgModal button', { hasText: 'Cancel' }); if (await c.count()) await c.first().click() }
  return l
}
async function lwHas(page, cs) {
  await go(page, 'leavewar'); await page.waitForTimeout(1500)
  return page.evaluate(c => [...document.querySelectorAll('#page-leavewar .cs, #page-leavewar [class*="who"]')].some(e => (e.textContent || '').trim().startsWith(c)), cs)
}
async function qualsRow(page, view, cs) {
  await go(page, 'quals'); await page.click(view); await page.waitForTimeout(300)
  return page.evaluate(c => {
    const tr = [...document.querySelectorAll('#qtbl tbody tr:not(.grp)')].find(r => (r.querySelector('.qname')?.textContent || '').trim() === c)
    if (!tr) return null
    return { ini: tr.querySelector('.qinitc')?.textContent.trim(), flight: tr.querySelector('.qfltc')?.textContent.trim(), cells: tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) }
  }, cs)
}

/* ============================== DESKTOP 1440×900 ============================== */
{
  const W = await world(1440, 900, 'desktop'); const page = W.page
  /* S9 — the sign-up card */
  await signIn(page, 'fresh@mail')
  await step(page, 'd-S9-card', 'the sign-up card: four labelled fields, "Displayed callsign/name", no Name box; the selects look like the boxes', async () => {
    const labels = await page.$$eval('#accForm label', ls => ls.map(l => l.textContent.trim()))
    const seat = await page.$$eval('#accSeat option', os => os.map(o => o.textContent))
    return JSON.stringify(labels) === JSON.stringify(['Displayed callsign/name', 'Initials', 'Pilot, WSO or personnel', 'CAT'])
      && JSON.stringify(seat) === JSON.stringify(['Pick…', 'Pilot', 'WSO', 'Personnel (ground crew)'])
      && !(await page.locator('#accFull').count()) ? true : `${labels.join('|')} · ${seat.join('|')}`
  })
  await step(page, 'd-S9-refusals', 'refusals: blank → "Type the callsign or name"; 15 letters said at once and refused; a missing pick refused', async () => {
    await page.click('#accSend'); await page.waitForTimeout(200)
    const a = await text(page, '#accErr')
    await page.fill('#accCs', 'Christopher Tan'); await page.waitForTimeout(150)
    const kept = await page.inputValue('#accCs'), line = await text(page, '#accCsLong')
    await page.click('#accSend'); await page.waitForTimeout(200)
    const b = await text(page, '#accErr')
    await page.fill('#accCs', 'Viper'); await page.click('#accSend'); await page.waitForTimeout(200)
    const c = await text(page, '#accErr')
    return a === 'Type the callsign or name' && kept === 'Christopher Tan' && /at most 14 letters/.test(line) && /at most 14 letters/.test(b) && c === 'Pick pilot, WSO or personnel'
      ? true : `${a} / ${kept} / ${line} / ${b} / ${c}`
  })
  await step(page, 'd-S9-seatcat', 'the seat drives the CAT: WSO has no IP/IR; a CAT the new seat cannot hold goes back to Pick…; personnel have no CAT box', async () => {
    await page.selectOption('#accSeat', 'RCP'); const w = await page.$$eval('#accCat option', os => os.map(o => o.value))
    await page.selectOption('#accCat', 'IW'); await page.selectOption('#accSeat', 'FCP'); const back = await page.inputValue('#accCat')
    await page.selectOption('#accSeat', 'GND'); const none = await page.locator('#accCat').count()
    /* Astra's code read #2: a CAT picked for a pilot must not ride through Personnel */
    await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
    await page.selectOption('#accSeat', 'GND'); await page.selectOption('#accSeat', 'RCP'); const via = await page.inputValue('#accCat')
    return !w.includes('IP') && !w.includes('IR') && back === '' && none === 0 && via === '' ? true : `${w.join(',')} / "${back}" / ${none} / through Personnel "${via}"`
  })
  await step(page, 'd-S9-waiting', 'a valid request → the waiting screen reads what he gave; a reload keeps it', async () => {
    await page.selectOption('#accSeat', 'RCP'); await page.selectOption('#accCat', 'C'); await page.fill('#accIni', 'jkb')
    await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
    const t1 = await text(page, '#accAsked')
    await page.reload(); await page.waitForTimeout(800)
    if (!(await page.locator('#accessWaiting').count())) await signIn(page, 'fresh@mail')
    const t2 = await text(page, '#accAsked')
    return /You asked for access as Viper \(JKB · WSO · CAT C\)\./.test(t1) && t1 === t2 ? true : `${t1} // ${t2}`
  })
  await step(page, 'd-S10-pending-nobell', 'a person waiting has no bell and no app (not signed in to it)', async () =>
    !(await page.locator('#notifyBell').count()) && !(await page.locator('#shell').count()))

  /* S1 — the admin's bell; the Admin TAB (desktop) puts it out */
  await signIn(page, 'ad', 'a')
  await step(page, 'd-S1-bell-lit', 'the admin signs in to a lit bell; the Admin tab counts 1', async () =>
    (await bellOn(page)) && (await text(page, '#admWaitBadge')) === '1' ? true : `bell ${await bellOn(page)} badge ${await text(page, '#admWaitBadge')}`)
  await step(page, 'd-S1-tab-seen', 'desktop: the Admin TAB alone (Users beside the rail) shows the list — "asked as Viper · JKB · WSO · CAT C" — and puts the bell out', async () => {
    await go(page, 'admin')
    const line = await text(page, '#admWaiting [data-req] .acc-sub')
    await go(page, 'viewsched')
    return /^asked as Viper · JKB · WSO · CAT C · /.test(line) && !(await bellOn(page)) && (await text(page, '#admWaitBadge')) === '1' ? true : `${line} / bell ${await bellOn(page)}`
  })
  await step(page, 'd-S1-reload', 'a reload: the bell stays out, the count stays 1', async () => {
    await page.reload(); await page.waitForTimeout(900)
    if (await page.locator('#luser').count()) await signIn(page, 'ad', 'a')
    return !(await bellOn(page)) && (await text(page, '#admWaitBadge')) === '1' ? true : `bell ${await bellOn(page)} badge ${await text(page, '#admWaitBadge')}`
  })

  /* S4 — approve with New person, end to end */
  await go(page, 'admin')
  await step(page, 'd-S4-approve-open', 'Approve opens on New person (Viper is on no roster), filled from what he gave', async () => {
    await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(250)
    const v = { mode: await page.getAttribute('#apvModeNew', 'aria-pressed'), cs: await page.inputValue('#apvCs'), ini: await page.inputValue('#apvIni'), seat: await page.inputValue('#apvSeat'), cat: await page.inputValue('#apvCat'), go: await text(page, '#apvGo'), note: await text(page, '#apvNote') }
    return v.mode === 'true' && v.cs === 'Viper' && v.ini === 'JKB' && v.seat === 'RCP' && v.cat === 'C' && v.go === 'Add person and give access' && /Filled from what he gave/.test(v.note) ? true : JSON.stringify(v)
  })
  await step(page, 'd-S4-approve-go', 'the admin corrects (Vyper, CAT D) and gives access: the request, the badge and the bell go; Vyper · MEMBER listed', async () => {
    await page.fill('#apvCs', 'Vyper'); await page.selectOption('#apvCat', 'D')
    await page.click('#apvGo'); await page.waitForTimeout(400)
    const t = await toastText(page)
    const acct = await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].map(r => r.textContent.replace(/\s+/g, ' ').trim()).find(x => x.startsWith('fresh@mail')) || '')
    return /Vyper added — fresh@mail can sign in now/.test(t) && !(await page.locator('#admWaitBadge').count()) && /Vyper/.test(acct) && /Member/i.test(acct) ? true : `${t} / ${acct}`
  })
  await step(page, 'd-S4-quals', 'Quals → WSOs: Vyper · JKB · flight "-" · CAT D', async () => {
    const r = await qualsRow(page, '#qViewW', 'Vyper')
    return r && r.ini === 'JKB' && r.flight === '-' && /\bD\b/.test(r.cells) ? true : JSON.stringify(r)
  })
  const vyper = await pidOf(page, 'Vyper')
  await step(page, 'd-S4-palette', 'Edit Schedule: the aircrew palette offers Vyper', async () => {
    await go(page, 'editsched'); await page.waitForTimeout(800)
    return (await page.locator(`#eRoster .rpuck[data-person="${vyper}"]`).count()) > 0 ? true : `no palette puck for ${vyper}`
  })
  /* Fable's code read #2(a): the roll-call's row 18 names the board's Available crew too */
  await step(page, 'd-S4-board-avail', 'the scheduler board: Available crew offers Vyper', async () => {
    await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(1000)
    const panel = () => page.evaluate(() => { const s = document.querySelector('#schedBoard .sec-avail'); return s ? s.textContent.replace(/\s+/g, ' ') : null })
    let t = await panel()
    if (t && !/close/.test(t)) { await page.click('#schedBoard .sec-avail [data-avtog]'); await page.waitForTimeout(500); t = await panel() }
    await page.locator('#schedBoard .sec-avail').scrollIntoViewIfNeeded().catch(() => {})
    const has = await page.evaluate(id => !!document.querySelector(`#schedBoard .sec-avail [data-person="${id}"]`), vyper)
    return has ? true : `panel ${t ? t.slice(0, 120) : 'missing'}`
  })
  /* the next weekday two or more days ahead — inside the Inputs list's default "today → two weeks" */
  const soon = (() => { const d = new Date(); d.setDate(d.getDate() + 2); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
  await step(page, 'd-S4-inputs', 'Inputs: the admin\'s person picker lists Vyper, and files a Training for him', async () => {
    await go(page, 'inputs')
    const opts = await page.$$eval('#inPerson option', os => os.map(o => o.textContent))
    if (!opts.includes('Vyper')) return `${opts.length} options, no Vyper`
    /* Fable's code read #2(b): an input the admin files for him, to read back as his */
    await page.selectOption('#inPerson', vyper); await page.selectOption('#inType', 'Training')
    for (let i = 0; i < 14 && !(await page.locator(`#inCal [data-cal="${soon}"]`).count()); i++) { await page.locator('#inCal button[aria-label="Next month"]').click(); await page.waitForTimeout(120) }
    await page.click(`#inCal [data-cal="${soon}"]`); await page.waitForTimeout(200)
    await page.click(`#inCal [data-cal="${soon}"]`); await page.waitForTimeout(200)
    await page.fill('#inRemarks', 'walk: filed by the admin'); await page.click('#inAdd'); await page.waitForTimeout(900)
    const row = await page.evaluate(() => [...document.querySelectorAll('tr[data-iid]')].some(r => r.textContent.includes('walk: filed by the admin')))
    return row ? true : `no row for the filed input (${soon})`
  })
  await step(page, 'd-S4-search', 'View-only Sched: the name / callsign search takes "Vyper"', async () => {
    await go(page, 'viewsched'); await page.fill('#searchV', 'Vyper'); await page.waitForTimeout(400)
    const v = await page.inputValue('#searchV'); await page.fill('#searchV', '')
    return v === 'Vyper'
  })
  await step(page, 'd-S4-leavewar', 'Leave War: Vyper is on the roster', async () => (await lwHas(page, 'Vyper')) ? true : 'not on the war\'s roster')
  await step(page, 'd-S4-tracker', 'Tracker "+ Add": Vyper (a WSO) is listed', async () => {
    const l = await trackerList(page); return l.includes('Vyper') ? true : `${l.length} listed, no Vyper`
  })
  await step(page, 'd-S4-reload', 'a reload keeps the person AND the account (never an account without its person)', async () => {
    await page.reload(); await page.waitForTimeout(900)
    if (await page.locator('#luser').count()) await signIn(page, 'ad', 'a')
    const r = await qualsRow(page, '#qViewW', 'Vyper')
    await go(page, 'admin')
    const acct = await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).find(x => x.startsWith('fresh@mail')) || '')
    return !!r && /Vyper/.test(acct) ? true : `${JSON.stringify(r)} / ${acct}`
  })
  await step(page, 'd-S4-signin-as-him', 'he signs in as himself: "Vyper · Member"; his own Quals row edits, but not its callsign (D218)', async () => {
    await signIn(page, 'fresh@mail')
    const badge = await text(page, '#roleBadge')
    await go(page, 'quals'); await page.click('#qViewW'); await page.click('#qEdit'); await page.waitForTimeout(300)
    const own = await page.evaluate(id => ({ ini: !!document.querySelector(`#qtbl input[data-init="${id}"]`), cs: !!document.querySelector(`#qtbl input[data-cs="${id}"]`) }), vyper)
    await page.click('#qSave')
    return badge === 'Vyper · Member' && own.ini && !own.cs ? true : `${badge} ${JSON.stringify(own)}`
  })
  /* Fable's code read #2(b): the roll-call's row 25 promised his Inputs and the Leave War too */
  await step(page, 'd-S4-his-inputs', 'signed in as Vyper: Inputs is his ("Vyper" fixed), and the Training the admin filed reads as his, with its ✎', async () => {
    await go(page, 'inputs')
    const fixed = await text(page, '#inPersonFixed')
    const row = await page.evaluate(() => { const r = [...document.querySelectorAll('tr[data-iid]')].find(x => x.textContent.includes('walk: filed by the admin'))
      return r ? { name: r.querySelector('td[data-label="Name"]')?.textContent.trim(), edit: !!r.querySelector('[data-edit]') } : null })
    return fixed === 'Vyper' && row && row.name === 'Vyper' && row.edit ? true : `${fixed} ${JSON.stringify(row)}`
  })
  await step(page, 'd-S4-his-leavewar', 'signed in as Vyper: the Leave War lights HIS row ("this is you")', async () => {
    await go(page, 'leavewar'); await page.waitForTimeout(1500)
    const me = await page.evaluate(id => { const r = document.querySelector(`#page-leavewar [data-testid="row-${id}"]`); if (r) r.scrollIntoView({ block: 'center' }); return r ? r.className : null }, vyper)
    await page.waitForTimeout(300)
    return me != null && /\bme\b/.test(me) ? true : `row class "${me}"`
  })

  /* S5 — a roster-only person (blank sign-in), linked later */
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await step(page, 'd-S5-blank-form', 'Add → New person with a blank sign-in: no Role box, the button reads "Add person"', async () => {
    await page.click('#accModeNew'); await page.waitForTimeout(150)
    return !(await page.locator('#accAddRole').count()) && (await text(page, '#accAdd')) === 'Add person' && /blank for someone/.test(await page.getAttribute('#accAddName', 'placeholder'))
  })
  await step(page, 'd-S5-add', 'Gecko · GK · Pilot · OCU → "added to the roster"; no new account; the form back on On the roster', async () => {
    const before = await page.locator('#accList [data-acct]').count()
    await page.fill('#accAddCs', 'Gecko'); await page.fill('#accAddIni', 'gk'); await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'OCU')
    await page.click('#accAdd'); await page.waitForTimeout(400)
    const t = await toastText(page), after = await page.locator('#accList [data-acct]').count()
    return /Gecko added to the roster — set flight and quals on the Quals page/.test(t) && after === before && (await page.getAttribute('#accModeRoster', 'aria-pressed')) === 'true' ? true : `${t} ${before}→${after}`
  })
  await step(page, 'd-S5-seams', 'Gecko on Quals (Pilots, GK), the Leave War and the Tracker "+ Add"', async () => {
    const r = await qualsRow(page, '#qViewP', 'Gecko'); const lw = await lwHas(page, 'Gecko'); const tr = (await trackerList(page)).includes('Gecko')
    return r && r.ini === 'GK' && lw && tr ? true : `${JSON.stringify(r)} lw ${lw} tr ${tr}`
  })
  await step(page, 'd-S5-link-later', 'later: an account for gecko@mail On the roster → he signs in as Gecko', async () => {
    await go(page, 'admin')
    await page.fill('#accAddName', 'gecko@mail'); await page.selectOption('#accAddPid', await pidOf(page, 'Gecko')); await page.click('#accAdd'); await page.waitForTimeout(300)
    await signIn(page, 'gecko@mail'); const b = await text(page, '#roleBadge')
    return b === 'Gecko · Member' ? true : b
  })

  /* Astra's code read #1 — after an add the WHOLE form clears, the half not in view too */
  await signIn(page, 'ad', 'a')
  await step(page, 'd-A1-form-clears', 'after an add the whole form clears: a roster pick made before a New person add is gone; a half-typed New person never comes back after an On the roster add', async () => {
    await go(page, 'admin')
    await page.selectOption('#accAddPid', await page.$eval('#accAddPid', s => s.options[1].value))
    await page.click('#accModeNew'); await page.fill('#accAddName', ''); await page.fill('#accAddCs', 'Clearo')
    await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
    await page.click('#accAdd'); await page.waitForTimeout(400)
    const pidAfter = await page.inputValue('#accAddPid')
    await page.click('#accModeNew'); await page.fill('#accAddCs', 'Leftov'); await page.fill('#accAddIni', 'LO')
    await page.selectOption('#accAddSeat', 'RCP'); await page.selectOption('#accAddCat', 'D')
    await page.click('#accModeRoster'); await page.fill('#accAddName', 'clearo@mail'); await page.selectOption('#accAddPid', await pidOf(page, 'Clearo'))
    await page.click('#accAdd'); await page.waitForTimeout(400)
    const linked = await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].some(r => r.textContent.includes('clearo@mail')))
    await page.click('#accModeNew')
    const np = { cs: await page.inputValue('#accAddCs'), ini: await page.inputValue('#accAddIni'), seat: await page.inputValue('#accAddSeat'), cat: await page.inputValue('#accAddCat') }
    await page.click('#accModeRoster')
    return pidAfter === '' && linked && !np.cs && !np.ini && !np.seat && !np.cat ? true : JSON.stringify({ pidAfter, linked, np })
  })
  /* Astra's code read #2 — the same on the admin's form */
  await step(page, 'd-A2-cat-personnel', 'Admin → Users New person: Pilot + CAT C → Personnel → WSO puts the CAT back to "Pick…"', async () => {
    await page.click('#accModeNew')
    await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
    await page.selectOption('#accAddSeat', 'GND'); const dis = await page.locator('#accAddCat').isDisabled()
    await page.selectOption('#accAddSeat', 'RCP'); const v = await page.inputValue('#accAddCat')
    await page.selectOption('#accAddSeat', ''); await page.click('#accModeRoster')
    return dis && v === '' ? true : `disabled ${dis}, CAT "${v}"`
  })

  /* S6 — refusals and one-step atomicity, by the screen */
  await signIn(page, 'ad', 'a'); await go(page, 'admin'); await page.click('#accModeNew')
  const fillNew = async (name, cs, seat = 'FCP', cat = 'C', ini = 'NM') => {
    await page.fill('#accAddName', name); await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
    await page.selectOption('#accAddSeat', seat); if (seat !== 'GND' && cat) await page.selectOption('#accAddCat', cat)
  }
  await step(page, 'd-S6-refusals', 'refused: a taken sign-in, a taken callsign, "ALL" (taken, never "restore"), a missing seat — and nothing half-made', async () => {
    const said = []
    await fillNew('hex', 'Zephyr'); await page.click('#accAdd'); await page.waitForTimeout(250); said.push(await toastText(page))
    await fillNew('zephyr2@mail', 'Saber'); await page.click('#accAdd'); await page.waitForTimeout(250); said.push(await toastText(page))
    await fillNew('zephyr2@mail', 'ALL'); await page.click('#accAdd'); await page.waitForTimeout(250); said.push(await toastText(page))
    await page.fill('#accAddCs', 'Zephyr'); await page.selectOption('#accAddSeat', ''); await page.click('#accAdd'); await page.waitForTimeout(250); said.push(await toastText(page))
    const none = !(await pidOf(page, 'Zephyr')) && !(await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].some(r => r.textContent.includes('zephyr2@mail'))))
    const ok = /hex already has an account/.test(said[0]) && /Saber is already taken/.test(said[1]) && /ALL is already taken/.test(said[2]) && !/restore/.test(said[2]) && /Pick pilot, WSO or personnel/.test(said[3]) && none
    return ok ? true : said.join(' | ') + ` · none ${none}`
  })
  await step(page, 'd-S6-personnel', 'Personnel: the CAT box greys to "None — personnel"; Zephyr with zephyr@mail is made — Quals Personnel', async () => {
    await page.selectOption('#accAddSeat', 'GND'); const dis = await page.locator('#accAddCat').isDisabled()
    await page.fill('#accAddName', 'zephyr@mail'); await page.click('#accAdd'); await page.waitForTimeout(400)
    const t = await toastText(page); const r = await qualsRow(page, '#qViewG', 'Zephyr')
    return dis && /Zephyr added — zephyr@mail can sign in now/.test(t) && !!r ? true : `${dis} ${t} ${JSON.stringify(r)}`
  })
  await step(page, 'd-S6-double-tap', 'a double tap makes ONE person and ONE account; the second tap meets an empty form and says so', async () => {
    await go(page, 'admin'); await page.click('#accModeNew'); await fillNew('blaze@mail', 'Blaze', 'RCP', 'D', 'RTK')
    await page.dblclick('#accAdd'); await page.waitForTimeout(500)
    const n = await page.evaluate(() => Object.values(window.PEOPLE).filter(p => p.cs === 'Blaze').length)
    const a = await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].filter(r => r.textContent.includes('blaze@mail')).length)
    return n === 1 && a === 1 ? true : `people ${n} accounts ${a}`
  })

  /* S8 — approving when the typed callsign is someone's. Ranger (bane) already HAS an account
     (the seeded "us"), so the picker cannot offer him (one account per person): the note says so
     (Fable's code read #1 — the first walk pinned "Pick them", an instruction nobody could follow).
     A person on Quals with NO account is the "Pick them" case: the first free one in the picker. */
  await go(page, 'admin')
  const freeCs = await page.$eval('#accAddPid', s => s.options[1].textContent)
  await signUp(page, 'r1@mail', { cs: 'Ranger', seat: 'FCP', cat: 'C' })
  await signUp(page, 'r2@mail', { cs: 'bane', seat: 'FCP', cat: 'C' })
  await signUp(page, 'r3@mail', { cs: 'ALL', seat: 'FCP', cat: 'C' })
  await signUp(page, 'r4@mail', { cs: freeCs, seat: 'FCP', cat: 'C' })
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  const reqId = cs => page.evaluate(c => { const r = [...document.querySelectorAll('#admWaiting [data-req]')].find(x => x.querySelector('.acc-sub b')?.textContent === c); return r ? r.getAttribute('data-req') : null }, cs)
  /* both ways out named (Fable's fix check #2): him on a new sign-in, or someone else */
  const HAS = 'already has an account (us), so they can\'t be picked here. If it is them on a new sign-in, change that account\'s sign-in under Accounts — that answers this request. If it is someone else, choose New person and give them another callsign or name.'
  /* each approve form stays OPEN for its picture (the note is the evidence); Cancel comes after */
  const openApv = async cs => { await page.click(`[data-approve="${await reqId(cs)}"]`); await page.waitForTimeout(200); await page.locator('[data-approving]').scrollIntoViewIfNeeded() }
  await step(page, 'd-S8-ranger', '"Ranger" (he already has an account): On the roster, NOT pre-picked, the picker does not offer him and the note SAYS so', async () => {
    await openApv('Ranger')
    const v = { mode: await page.getAttribute('#apvModeRoster', 'aria-pressed'), pid: await page.inputValue('#apvPid'), note: await text(page, '#apvNote'),
      offered: (await page.$$eval('#apvPid option', os => os.map(o => o.textContent))).includes('Ranger') }
    return v.mode === 'true' && v.pid === '' && !v.offered && v.note === `He typed Ranger — Ranger ${HAS}` ? true : JSON.stringify(v)
  })
  await step(page, 'd-S8-ranger-new', '"Ranger" on New person: refused as taken, said on screen', async () => {
    await page.click('#apvModeNew'); await page.click('#apvGo'); await page.waitForTimeout(250); const t = await toastText(page)
    return /Ranger is already taken/.test(t) ? true : t
  })
  await page.click('#apvCancel')
  await step(page, 'd-S8-bane', '"bane" (Ranger\'s hidden id): the note names Ranger, never the id, and says he has an account', async () => {
    await openApv('bane')
    const n = await text(page, '#apvNote')
    return n === `He typed bane — that is Ranger, who ${HAS}` ? true : n
  })
  await page.click('#apvCancel')
  await step(page, 'd-S8-free', `"${freeCs}" (on Quals, no account): On the roster, NOT pre-picked, the note says "Pick them" — and the picker offers him`, async () => {
    await openApv(freeCs)
    const v = { mode: await page.getAttribute('#apvModeRoster', 'aria-pressed'), pid: await page.inputValue('#apvPid'), note: await text(page, '#apvNote'),
      offered: (await page.$$eval('#apvPid option', os => os.map(o => o.textContent))).includes(freeCs) }
    return v.mode === 'true' && v.pid === '' && v.offered && v.note === `He typed ${freeCs} — ${freeCs} is on the roster. Pick them if this is them.` ? true : JSON.stringify(v)
  })
  await page.click('#apvCancel')
  await step(page, 'd-S8-all', '"ALL": New person, refused as taken (no restore door named)', async () => {
    await page.click(`[data-approve="${await reqId('ALL')}"]`); await page.waitForTimeout(200)
    const m = await page.getAttribute('#apvModeNew', 'aria-pressed')
    await page.click('#apvGo'); await page.waitForTimeout(250); const t = await toastText(page); await page.click('#apvCancel')
    return m === 'true' && /ALL is already taken/.test(t) && !/restore/i.test(t) ? true : `${m} ${t}`
  })
  await step(page, 'd-S17-cancel', 'Cancel discards: the next Approve starts from what he gave; each half keeps its entries while open', async () => {
    const id = await reqId('ALL')
    await page.click(`[data-approve="${id}"]`); await page.fill('#apvCs', 'Edited')
    await page.click('#apvModeRoster'); const opt = await page.$eval('#apvPid', s => s.options[1].value); await page.selectOption('#apvPid', opt)
    await page.click('#apvModeNew'); const kept = await page.inputValue('#apvCs')
    await page.click('#apvModeRoster'); const keptPid = await page.inputValue('#apvPid')
    await page.click('#apvCancel'); await page.click(`[data-approve="${id}"]`)
    const fresh = await page.inputValue('#apvCs'); await page.click('#apvCancel')
    return kept === 'Edited' && keptPid === opt && fresh === 'ALL' ? true : `${kept} ${keptPid} ${fresh}`
  })
  for (const c of ['Ranger', 'bane', 'ALL', freeCs]) { const id = await reqId(c); if (id) { await page.click(`[data-decline="${id}"]`); await page.waitForTimeout(200) } }

  /* S3 — Quals' "+ Add person", twice; the tab afterwards is On the roster again */
  await step(page, 'd-S3-quals-button', 'Quals "+ Add person" → Admin → Users, New person chosen, the Callsign/Name box focused — every press', async () => {
    const r = []
    for (let i = 0; i < 2; i++) {
      await go(page, 'quals'); await page.click('#qAddToggle'); await page.waitForTimeout(500)
      r.push({ page: await page.evaluate(() => window.CURPAGE), mode: await page.getAttribute('#accModeNew', 'aria-pressed'), focus: await page.evaluate(() => document.activeElement && document.activeElement.id) })
      await page.click('#accModeRoster')
    }
    await go(page, 'viewsched'); await go(page, 'admin')
    const dflt = await page.getAttribute('#accModeRoster', 'aria-pressed')
    return r.every(x => x.page === 'admin' && x.mode === 'true' && x.focus === 'accAddCs') && dflt === 'true' ? true : JSON.stringify(r) + ' ' + dflt
  })

  /* S11 — the words */
  await step(page, 'd-S11-words', 'Quals heads "Callsign/Name" in all four views; the pickers ask for a "callsign or name"; no (FCP)/(RCP) anywhere', async () => {
    await go(page, 'quals'); const heads = []
    for (const v of ['#qViewP', '#qViewW', '#qViewG', '#qViewA']) { await page.click(v); await page.waitForTimeout(150); heads.push(await page.$eval('#qtbl thead th[data-sort="cs"]', th => th.firstChild.textContent.trim())) }
    await go(page, 'admin')
    const opt = await page.$eval('#accAddPid', s => s.options[0].textContent), lab = await text(page, 'label[for="accAddPid"]')
    const fcp = await page.evaluate(() => /\((FCP|RCP)\)/.test(document.body.innerText))
    return heads.every(h => h === 'Callsign/Name') && opt === 'Pick a callsign or name…' && lab === 'Callsign/Name' && !fcp ? true : `${heads.join('|')} / ${opt} / ${lab} / fcp ${fcp}`
  })
  await step(page, 'd-S11-csv', 'the exported LoX heads its first column "Callsign/Name"', async () => {
    await go(page, 'quals'); await page.click('#qViewP')
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click('#qExport')])
    const p = await dl.path(); const first = readFileSync(p, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)[0].split(',')[0].replace(/"/g, '')
    return first === 'Callsign/Name' ? true : first
  })

  /* S7 — two admins take turns; each bell its own; a decline puts it out */
  await go(page, 'admin')
  const free = await page.$eval('#accAddPid', s => s.options[1].value)
  await page.fill('#accAddName', 'b@mail'); await page.selectOption('#accAddPid', free); await page.selectOption('#accAddRole', 'admin'); await page.click('#accAdd'); await page.waitForTimeout(300)
  await signUp(page, 'kite@mail', { cs: 'Kite', ini: 'KT', seat: 'RCP', cat: 'D' })
  await step(page, 'd-S7-two-admins', 'admin 1 sees the list → out for him; admin 2 still lit until he looks; admin 1 still out', async () => {
    await signIn(page, 'ad', 'a'); const a1 = await bellOn(page); await go(page, 'admin'); await go(page, 'viewsched'); const a1out = !(await bellOn(page))
    await signIn(page, 'b@mail'); const b1 = await bellOn(page); await go(page, 'admin'); await go(page, 'viewsched'); const b1out = !(await bellOn(page))
    await signIn(page, 'ad', 'a'); const a2 = !(await bellOn(page))
    return a1 && a1out && b1 && b1out && a2 ? true : JSON.stringify({ a1, a1out, b1, b1out, a2 })
  })
  await signUp(page, 'wren@mail', { cs: 'Wren', seat: 'GND' })
  await step(page, 'd-S7-decline', 'a request declined by one admin before the other saw it: nobody\'s bell stays lit; a personnel line reads "· Personnel ·"', async () => {
    await signIn(page, 'b@mail'); await go(page, 'admin')
    const line = await page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req] .acc-sub')].map(x => x.textContent).find(x => x.includes('Wren')) || '')
    const id = await reqId('Wren'); await page.click(`[data-decline="${id}"]`); await page.waitForTimeout(300)
    for (const k of await page.$$eval('#admWaiting [data-decline]', bs => bs.map(b => b.getAttribute('data-decline')))) { await page.click(`[data-decline="${k}"]`); await page.waitForTimeout(200) }
    await signIn(page, 'ad', 'a'); const out = !(await bellOn(page))
    return /asked as Wren · Personnel · /.test(line) && out ? true : `${line} / out ${out}`
  })

  /* S10 — a member's bell never lights; no doors */
  await signUp(page, 'wait1@mail', { cs: 'Wait', seat: 'FCP', cat: 'C' })
  await step(page, 'd-S10-member', 'a member: the bell stays dark with a request waiting; no Admin tab; Quals has no "+ Add person" and heads "Callsign/Name"', async () => {
    await signIn(page, 'us', 'us')
    const bell = await bellOn(page), adm = await page.locator('.nav a[data-page="admin"]').isHidden()
    await go(page, 'quals'); const add = await page.locator('#qAddToggle').count()
    const head = await page.$eval('#qtbl thead th[data-sort="cs"]', th => th.firstChild.textContent.trim())
    return !bell && adm && add === 0 && head === 'Callsign/Name' ? true : JSON.stringify({ bell, adm, add, head })
  })

  /* S13 — the bell's order: the access request before a bug report */
  await step(page, 'd-S13-order', 'with a bug report too, the first tap opens Admin → Users, the next the Help page', async () => {
    await go(page, 'help'); await page.fill('#bugText, textarea', 'something is off'); await page.click('#bugSend').catch(async () => { await page.locator('#page-help button', { hasText: 'Send' }).first().click() }); await page.waitForTimeout(300)
    await signIn(page, 'ad', 'a')
    await page.click('#notifyBell'); await page.waitForTimeout(500); const p1 = await page.evaluate(() => window.CURPAGE); const t1 = await toastText(page)
    await go(page, 'viewsched'); await page.click('#notifyBell'); await page.waitForTimeout(500); const p2 = await page.evaluate(() => window.CURPAGE)
    return p1 === 'admin' && /1 waiting for access — opening Admin → Users/.test(t1) && p2 === 'help' ? true : `${p1} ${t1} ${p2}`
  })

  /* S16 — personnel across the seams (Zephyr) */
  await step(page, 'd-S16-personnel', 'personnel Zephyr: on the Leave War; NOT in the Tracker "+ Add" (aircrew only, by design); in the Inputs picker', async () => {
    const lw = await lwHas(page, 'Zephyr'); const tr = (await trackerList(page)).includes('Zephyr')
    await go(page, 'inputs'); const inp = (await page.$$eval('#inPerson option', os => os.map(o => o.textContent))).includes('Zephyr')
    return lw && !tr && inp ? true : JSON.stringify({ lw, tr, inp })
  })

  /* S12 — undo is untouched: a schedule edit, then a person added, then Undo takes back the edit only */
  await step(page, 'd-S12-undo', 'a schedule change, then a person added: Undo takes back the schedule change; the person stays', async () => {
    await go(page, 'editsched'); await page.waitForTimeout(800)
    /* a flying seat keeps its box when emptied (a crowd row's name would take its box with it) */
    const slot = await page.$eval('#eWeek .acrow .seat[data-slot] .puck[data-person]', p => p.closest('.seat').getAttribute('data-slot')).catch(() => null)
    if (!slot) return 'no filled seat found'
    await page.click(`#eWeek .seat[data-slot="${slot}"]`, { button: 'right' }); await page.waitForTimeout(400)
    const cleared = await page.$eval(`#eWeek .seat[data-slot="${slot}"]`, s => !s.querySelector('.puck[data-person]'))
    await go(page, 'admin'); await page.click('#accModeNew'); await page.fill('#accAddName', ''); await page.fill('#accAddCs', 'Undoer'); await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C'); await page.click('#accAdd'); await page.waitForTimeout(300)
    await go(page, 'editsched'); await page.waitForTimeout(500)
    await page.click('#undoBtn'); await page.waitForTimeout(600)
    const back = await page.$eval(`#eWeek .seat[data-slot="${slot}"]`, s => !!s.querySelector('.puck[data-person]'))
    const still = !!(await pidOf(page, 'Undoer'))
    return cleared && back && still ? true : JSON.stringify({ cleared, back, still })
  })

  /* Fable's and Astra's fix checks #1 and Astra's #2 — a person ARCHIVED who keeps his account (posting out does
     exactly that): Hex (rocky) holds the seeded `hex` account. Archived through Quals' own ✕, then someone asks as
     "Hex": the note names the account (never "restore to link", which could not end in a link), and Hex's account
     editor still shows Hex in its picker. Last on the desktop, so Hex stays archived for nothing after it. */
  await go(page, 'quals'); await page.click('#qViewA').catch(() => {})
  if (await page.locator('#qEdit').isVisible()) { await page.click('#qEdit'); await page.waitForTimeout(300) }
  const archOk = await page.evaluate(() => { const el = document.querySelector('#qtbl [data-arch="rocky"]'); if (!el) return 'no ✕ drawn for Hex'; el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true })
  await page.waitForTimeout(400)
  if (await page.locator('#qSave').isVisible().catch(() => false)) await page.click('#qSave')
  await signUp(page, 'hexnew@mail', { cs: 'Hex', seat: 'RCP', cat: 'C' })
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await step(page, 'd-FC1-archived-account', 'Hex archived on Quals (his account kept): someone asks as "Hex" — the note names the account and both ways out, never "restore to link"', async () => {
    if (archOk !== true || !(await page.evaluate(() => !!window.PEOPLE.rocky.archived))) return `not archived: ${archOk}`
    await openApv('Hex')
    const note = await text(page, '#apvNote'), offered = (await page.$$eval('#apvPid option', os => os.map(o => o.textContent))).includes('Hex')
    return note.startsWith('He typed Hex — Hex (archived) already has an account (hex)') && !/to link them|Pick them/i.test(note)
      && /restore them on the Quals page if they are back\./.test(note) && !offered ? true : `${note} / offered ${offered}`
  })
  await page.click('#apvCancel')
  { const id = await reqId('Hex'); if (id) { await page.click(`[data-decline="${id}"]`); await page.waitForTimeout(200) } }
  await step(page, 'd-FC2-archived-editor', 'Hex\'s account editor (Hex archived): the Callsign/Name picker shows Hex, not a blank "Pick…"', async () => {
    await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(200)
    await page.locator('[data-editing="achex"]').scrollIntoViewIfNeeded()
    const v = await page.inputValue('#accEdPid'), shown = await page.$eval('#accEdPid', s => s.options[s.selectedIndex]?.textContent)
    return v === 'rocky' && shown === 'Hex' ? true : `value "${v}", shows "${shown}"`
  })
  await page.click('#accEdCancel')
  /* Astra's second fix check: the typed callsign is the SIGNED-IN admin's own — his row is locked to him */
  await signUp(page, 'saber.new@mail', { cs: 'Saber', seat: 'FCP', cat: 'C' })
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await step(page, 'd-FC3-own-account', '"Saber" asked while Saber (ad) is the admin looking: the note says another admin must change his own account — the row he cannot open is not named as his door', async () => {
    await openApv('Saber')
    const note = await text(page, '#apvNote'), locked = await page.locator('[data-acct="acad"] .acc-tap').isDisabled()
    return /It is your own account: if it is you on a new sign-in, another admin must change its sign-in under Accounts/.test(note) && locked ? true : `${note} / row locked ${locked}`
  })
  await page.click('#apvCancel')
  { const id = await reqId('Saber'); if (id) { await page.click(`[data-decline="${id}"]`); await page.waitForTimeout(200) } }

  W.errors.forEach(e => errorsAll.push(e))
  await W.browser.close()
}

/* ============================== PHONE 390×844 ============================== */
{
  const W = await world(390, 844, 'phone'); const page = W.page
  await signIn(page, 'fresh2@mail')
  await step(page, 'p-S9-card', 'phone: the sign-up card, four fields, the selects as wide as the boxes', async () => {
    const m = await page.evaluate(() => { const i = document.querySelector('#accCs').getBoundingClientRect(), s = document.querySelector('#accSeat').getBoundingClientRect(); return [Math.round(i.left - s.left), Math.round(i.right - s.right), Math.round(i.height - s.height)] })
    return m.every(x => x === 0) ? true : m.join(',')
  })
  await page.fill('#accCs', 'Hawk'); await page.fill('#accIni', 'hk'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'B')
  await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
  await step(page, 'p-S9-waiting', 'phone: the waiting line', async () => /as Hawk \(HK · Pilot · CAT B\)/.test(await text(page, '#accAsked')))
  await signIn(page, 'ad', 'a')
  await step(page, 'p-S2-rail', 'phone: the Admin category list alone ("Users · 1 waiting for access") does NOT put the bell out', async () => {
    await go(page, 'admin'); const rail = await text(page, '.adm-cat.on .adm-cat-s')
    await go(page, 'viewsched')
    return (await bellOn(page)) && /1 waiting for access/.test(rail) ? true : `bell ${await bellOn(page)} rail ${rail}`
  })
  await step(page, 'p-S3-config-then-bell', 'phone: on Admin → Squadron config, the bell opens Users drilled in and puts itself out', async () => {
    await go(page, 'admin'); await page.locator('.adm-cat', { hasText: 'Squadron config' }).first().click(); await page.waitForTimeout(300)
    await page.click('#notifyBell'); await page.waitForTimeout(600)
    const on = await page.evaluate(() => document.querySelector('#admUsers').classList.contains('on') && document.querySelector('.adm-shell').classList.contains('drilled'))
    await page.waitForTimeout(300)
    return on && !(await bellOn(page)) ? true : `users-on ${on} bell ${await bellOn(page)}`
  })
  await step(page, 'p-S15-approve', 'phone: Approve → New person, the two-column fields fit the pane (no sideways scroll)', async () => {
    await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(300)
    await page.locator('[data-approving]').scrollIntoViewIfNeeded()
    const m = await page.evaluate(() => { const pane = document.querySelector('#admUsers').getBoundingClientRect(); const bad = [...document.querySelectorAll('[data-approving] input, [data-approving] select, [data-approving] button')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.left < pane.left - 1 || b.right > pane.right + 1) }).map(e => e.id); return { bad, sx: document.documentElement.scrollWidth > innerWidth } })
    return m.bad.length === 0 && !m.sx ? true : JSON.stringify(m)
  })
  await step(page, 'p-S15-give', 'phone: "Add person and give access" makes Hawk', async () => {
    await page.click('#apvGo'); await page.waitForTimeout(400)
    return !!(await pidOf(page, 'Hawk'))
  })
  await step(page, 'p-S3-quals-button', 'phone: Quals "+ Add person" lands drilled into Users on New person', async () => {
    await go(page, 'quals'); await page.click('#qAddToggle'); await page.waitForTimeout(600)
    const v = await page.evaluate(() => ({ drilled: document.querySelector('.adm-shell').classList.contains('drilled'), mode: document.querySelector('#accModeNew').getAttribute('aria-pressed') }))
    return v.drilled && v.mode === 'true' ? true : JSON.stringify(v)
  })
  await step(page, 'p-S5-add-form', 'phone: the New person add form fits the pane', async () => {
    await page.locator('#accAddBlock').scrollIntoViewIfNeeded()
    const m = await page.evaluate(() => { const pane = document.querySelector('#admUsers').getBoundingClientRect(); return [...document.querySelectorAll('#accAddBlock input, #accAddBlock select, #accAddBlock button')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.left < pane.left - 1 || b.right > pane.right + 1) }).map(e => e.id) })
    return m.length === 0 ? true : m.join(',')
  })
  W.errors.forEach(e => errorsAll.push(e))
  await W.browser.close()
}

/* ============================== SHORT WINDOW 1440×700 (§7.2) ============================== */
{
  const W = await world(1440, 700, 'short'); const page = W.page
  await signIn(page, 'short@mail')
  await step(page, 's-S9-card', 'a short window: the whole sign-up card reaches its Request access and Sign out', async () => {
    await page.selectOption('#accSeat', 'FCP'); await page.locator('#accOut').scrollIntoViewIfNeeded()
    return (await page.locator('#accSend').isVisible()) && (await page.locator('#accOut').isVisible())
  })
  W.errors.forEach(e => errorsAll.push(e))
  await W.browser.close()
}

/* ============================== A FRESH WORLD 1440×900 (§7.7; Fable's code read #2(c)) ==============================
   The roll-call's row 26: a person AND his account as the FIRST write on a world nobody has written to, then
   a reload — the trap in bug-check order §7.7 (a fresh world reloaded before any write comes back different). */
{
  const W = await world(1440, 900, 'fresh'); const page = W.page
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await page.click('#accModeNew'); await page.fill('#accAddName', 'first@mail'); await page.fill('#accAddCs', 'Firsty'); await page.fill('#accAddIni', 'FY')
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await page.click('#accAdd'); await page.waitForTimeout(500)
  await step(page, 'f-S14-first-write-reload', 'a fresh world: "Add person and account" as its FIRST write, then a reload — Firsty on Quals, first@mail on Admin → Users, both kept; he signs in as himself', async () => {
    const before = { pid: await pidOf(page, 'Firsty') }
    await page.reload(); await page.waitForTimeout(1000)
    if (await page.locator('#luser').count()) await signIn(page, 'ad', 'a')
    const r = await qualsRow(page, '#qViewP', 'Firsty')
    await go(page, 'admin')
    const acct = await page.evaluate(() => [...document.querySelectorAll('#accList [data-acct]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).find(x => x.startsWith('first@mail')) || '')
    await signIn(page, 'first@mail'); const badge = await text(page, '#roleBadge')
    return before.pid && r && r.ini === 'FY' && /Firsty/.test(acct) && badge === 'Firsty · Member' ? true : JSON.stringify({ before, r, acct, badge })
  })
  W.errors.forEach(e => errorsAll.push(e))
  await W.browser.close()
}

const pass = results.filter(r => r.ok).length
writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), base: BASE, pass, total: results.length, results, errors: errorsAll }, null, 2))
console.log(`\n${pass}/${results.length} PASS · ${errorsAll.length} browser errors`)
errorsAll.slice(0, 20).forEach(e => console.log('  ERR', e))
