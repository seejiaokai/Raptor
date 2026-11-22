// Re-walk R3 / R5 — the doors on screen (each fix was to a hand-made command; its unit test holds it; here the screen's
// own doors are checked still to behave):
//  R5: a newcomer (kite@mail) asks to join 149 on the Request access card. Hunter (admin of 142 only): no request in his
//      bell or Waiting list, and typing the waiting name onto a 142 man's sign-in is refused. Saber (149 picked) sees it;
//      Kestrel (149's admin) gives access; the newcomer signs in as a 149 member.
//  R3: Saber gives Hunter Plan of 149; Role → Master admin, Save: his Plan goes ("Full access"); Role → Admin, Save: Plan of
//      149 does not come back. Hunter signs in: what his menu and bell say.
import { serve, stop, newPage, signIn, pick, menuRows, note, save, errs, facts } from '../walk/lib.mjs'
import { adminCat, openRow, lineBtn, toastText, bellOpen, bellLines, bellClose } from '../walk/w1-view.mjs'
import { step, as, logout, press, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const waiting = s => s.page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req]')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
const row = s => s.page.evaluate(() => ({ name: document.querySelector('#accEdName, #accGiveName')?.value ?? null, role: document.querySelector('#accEdRole')?.value ?? null, lines: document.querySelector('[data-testid="acc-sq"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null, l149: [...document.querySelectorAll('[aria-label="Access to 149"] button')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()) }))

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r5-${sz}`
    await step('R5 kite asks 149', async () => {
      await signIn(s, 'kite@mail', 'k1', { pending: true }); await s.page.waitForSelector('#accForm')
      await s.page.selectOption('#accSqn', { label: '149' }); await s.page.fill('#accCs', 'Kite'); await s.page.fill('#accIni', 'KT')
      await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(150)
      const o = await s.page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(v => v)); if (o.length) await s.page.selectOption('#accCat', o[0])
      await shot(s, `${P}-01-kite-asks-149.png`, ['#accForm'])
      await press(s, '#accSend', `${P}-01-send`)
      facts[`${P}-kite-sent`] = await s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 160))
      await logout(s)
    })
    await signIn(s, 'ad2', 'a2')
    await step('R5 hunter (142 only)', async () => {
      await bellOpen(s); facts[`${P}-hunter-bell`] = await bellLines(s); await bellClose(s)
      await adminCat(s, 'Users'); facts[`${P}-hunter-waiting`] = await waiting(s); facts[`${P}-hunter-nowait`] = await text(s, '#admNoWaiting')
      await openRow(s, 'dj'); facts[`${P}-dj-before`] = await row(s)
      const nm = (await s.page.locator('#accGiveName').count()) ? '#accGiveName' : '#accEdName'
      await s.page.fill(nm, 'kite@mail'); await s.page.waitForTimeout(200)
      await press(s, '#accGive, #accEdSave', `${P}-02-hunter-save`)
      facts[`${P}-hunter-kite-toast`] = await toastText(s)
      await shot(s, `${P}-02-hunter-kite-refused.png`, ['.acc-edit', '#toastEl'])
      await press(s, '#accEdCancel'); await openRow(s, 'dj'); facts[`${P}-dj-reopened`] = await row(s); await press(s, '#accEdCancel')
    })
    await as(s, 'ad', 'a')
    await step('R5 saber sees it with 149 picked', async () => {
      await adminCat(s, 'Users'); facts[`${P}-saber142-waiting`] = await waiting(s)
      await pick(s, '149'); await adminCat(s, 'Users'); facts[`${P}-saber149-waiting`] = await waiting(s)
      facts[`${P}-saber149-answer-btn`] = await vis(s, '#admWaiting button[data-approve]')
      await shot(s, `${P}-03-saber-149-waiting.png`, ['#admWaiting', 'h4.adm-sub'])
      await pick(s, '142')
    })
    await as(s, 'ad9', 'a9')
    await step('R5 kestrel gives access', async () => {
      await adminCat(s, 'Users'); facts[`${P}-kestrel-waiting`] = await waiting(s)
      await shot(s, `${P}-04-kestrel-waiting.png`, ['#admWaiting', 'h4.adm-sub'])
      await press(s, '#admWaiting button[data-approve]', `${P}-04-approve`)
      await press(s, '#apvGo', `${P}-05-go`); await s.page.waitForTimeout(400)
      facts[`${P}-kestrel-toast`] = await toastText(s)
      facts[`${P}-kestrel-waiting-after`] = await waiting(s)
    })
    await as(s, 'kite@mail', 'k1')
    await step('R5 kite signs in', async () => {
      facts[`${P}-kite-badge`] = await text(s, '#roleBadge'); facts[`${P}-kite-mark`] = await text(s, '#sqnMenuBtn')
      await shot(s, `${P}-06-kite-in.png`)
    })
    await as(s, 'ad', 'a')
    await step('R3 master drops Plan', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      await press(s, lineBtn('149', 'plan')); await press(s, '#accEdSave'); facts[`${P}-plan-toast`] = await toastText(s)
      await openRow(s, 'prowler'); facts[`${P}-with-plan`] = await row(s)
      await s.page.selectOption('#accEdRole', 'master'); await s.page.waitForTimeout(250)
      facts[`${P}-master-picked`] = await row(s)
      await shot(s, `${P}-07-master-picked.png`, ['.acc-edit'])
      await press(s, '#accEdSave', `${P}-08-master-save`); facts[`${P}-master-toast`] = await toastText(s)
      await openRow(s, 'prowler'); facts[`${P}-after-master`] = await row(s)
      await shot(s, `${P}-08-after-master.png`, ['.acc-edit'])
      await s.page.selectOption('#accEdRole', 'admin'); await s.page.waitForTimeout(250)
      facts[`${P}-admin-picked`] = await row(s)
      await press(s, '#accEdSave', `${P}-09-admin-save`); facts[`${P}-admin-toast`] = await toastText(s)
      await openRow(s, 'prowler'); facts[`${P}-after-unmaster`] = await row(s)
      await shot(s, `${P}-09-after-unmaster.png`, ['.acc-edit'])
      await press(s, '#accEdCancel')
    })
    await as(s, 'ad2', 'a2')
    await step('R3 hunter after', async () => {
      facts[`${P}-hunter-menu-after`] = await menuRows(s)
      await bellOpen(s); facts[`${P}-hunter-bell-after`] = await bellLines(s)
      await shot(s, `${P}-10-hunter-bell-after.png`, ['[data-testid="bell-list"]']); await bellClose(s)
    })
    await s.ctx.close()
  }
} finally { save('r5'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
