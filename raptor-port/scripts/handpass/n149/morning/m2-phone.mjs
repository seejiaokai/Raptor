// The morning page — phone pictures (402, ×2), by presses: Request access with its Squadron choice (a4, q-f), the Schedules
// menu as a sheet (a1), the bell's Show row with a grey squadron mark on a line (a5, q-m), Hunter's bell after being made a
// master admin and back (q-n).
import { serve, stop, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, adminCat, openRow, lineBtn, bellOpen, bellClose } from '../walk/w1-view.mjs'
import { step, as, logout, press, vis } from '../rewalk/rlib.mjs'
import { newPage, ringShot, saveManifest } from './mlib.mjs'

const T = id => `[data-testid="${id}"]`
const BELL = '[data-testid="bell-list"]'

await serve()
try {
  const s = await newPage('p')
  await step('a4, q-f Request access', async () => {
    await signIn(s, 'kite@mail', 'k1', { pending: true }); await s.page.waitForSelector('#accForm')
    facts['q-f-start'] = await s.page.evaluate(() => { const e = document.querySelector('#accSqn'); return e ? e.options[e.selectedIndex].textContent : null })
    await ringShot(s, 'q-f-request-access-starts-on-142.png', { ring: ['#accSqn'], clip: ['#accSqn', 'label[for="accSqn"]'], pad: 28, what: `Question (f): Request access, as a newcomer sees it — the Squadron choice starts on "${facts['q-f-start']}".` })
    await s.page.selectOption('#accSqn', { label: '149' }); await s.page.fill('#accCs', 'Kite'); await s.page.fill('#accIni', 'KT')
    await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(150)
    const o = await s.page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(v => v)); if (o.length) await s.page.selectOption('#accCat', o[0])
    await ringShot(s, 'a4-request-access-squadron.png', { ring: ['#accSqn'], clip: ['#accForm'], what: 'Request access: the card a newcomer fills in — Squadron first (149 chosen here), then callsign, initials, seat and CAT.' })
    await press(s, '#accSend'); await logout(s)
  })
  await signIn(s, 'ad', 'a')
  await step('a1 phone menu', async () => {
    await press(s, '#sqnMenuBtn:visible'); await s.page.waitForTimeout(300)
    await ringShot(s, 'a1-schedules-menu-phone.png', { ring: ['#sqnMenu'], clip: ['#sqnMenuBtn', '#sqnMenu'], what: 'The Schedules menu on the phone: "142 ▾" opens a sheet — 142 "Your squadron" ticked, 149 "Full access".' })
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
    if (await vis(s, '#sqnMenu .sqm-row')) { await s.page.touchscreen.tap(200, 820); await s.page.waitForTimeout(300) }
  })
  await step('a5 a 149 line: Gannet posted out today (Overseas Sqn)', async () => {
    // a 149 admin line by presses: 149 picked, Leave War, Gannet's day today, ⋯ → Post out → Overseas Sqn → confirm; the
    // posting runs on its date, and its line goes to 149's admins and every master admin (B12)
    await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    const c = s.page.locator(T('cell-gan9-2026-11-23')).first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(300)
    const b = await c.boundingBox(); await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await s.page.waitForTimeout(700)
    await press(s, T('bid-more')); await press(s, T('bid-postout'))
    if ((await s.page.locator(T('po-overseas')).getAttribute('aria-pressed').catch(() => null)) !== 'true') await press(s, T('po-overseas'))
    facts['a5-po-line'] = await s.page.locator(T('po-line')).innerText().catch(() => null)
    await press(s, T('po-confirm')); await s.page.waitForTimeout(800)
    if (await vis(s, T('bid-cancel'))) await press(s, T('bid-cancel'))
    await navTo(s, 'View-only Sched'); await pick(s, '142')
    await as(s, 'ad', 'a')   // a fresh sign-in, so the posting pass has run
  })
  await step('a5, q-m bell', async () => {
    await bellOpen(s)
    await ringShot(s, 'q-m-bell-show-row.png', { ring: [T('bell-show')], clip: [BELL], what: 'Question (m): the bell\'s Show row (142 on, 149 off) — where a refused press would get its word, if he wants one.' })
    await press(s, `${T('bell-show')} .fchip:text-is("149")`); await s.page.waitForTimeout(400)
    facts['a5-lines'] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => l.textContent.replace(/\s+/g, ' ').trim()))
    await ringShot(s, 'a5-bell-show-and-squadron-mark.png', { rings: [[`${BELL} .bl-sqn`], [T('bell-show')]], clip: [BELL], what: "The bell after 149 is pressed on in its Show row: 149's line appears (Gannet, posted out today — a posting made by presses for this picture; 142 had no lines), its grey squadron mark \"149\" after the name (both ringed)." })
    await press(s, `${T('bell-show')} .fchip:text-is("149")`); await bellClose(s)
  })
  await step('q-n set up: Plan, master, admin', async () => {
    await adminCat(s, 'Users'); await openRow(s, 'prowler'); await press(s, lineBtn('149', 'plan')); await press(s, '#accEdSave')
    await openRow(s, 'prowler'); await s.page.selectOption('#accEdRole', 'master'); await press(s, '#accEdSave')
    await openRow(s, 'prowler'); await s.page.selectOption('#accEdRole', 'admin'); await press(s, '#accEdSave')
  })
  await as(s, 'ad2', 'a2')
  await step('q-n Hunter bell', async () => {
    await bellOpen(s)
    facts['q-n-lines'] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => l.textContent.replace(/\s+/g, ' ').trim()))
    await ringShot(s, 'q-n-hunter-bell-master-and-back.png', { ring: [0, 1, 2].map(i => s.page.locator(`${BELL} .bl-line`).nth(i)), clip: [BELL], what: 'Question (n): Hunter\'s bell after Saber gave him Plan of 149, made him a master admin, then an admin again — "Given Plan of 149…", "Made a master admin", "Master admin taken off"; no line says Plan of 149 went.' })
    await bellClose(s)
  })
  await s.ctx.close()
} finally { saveManifest('m2'); save('m2'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
