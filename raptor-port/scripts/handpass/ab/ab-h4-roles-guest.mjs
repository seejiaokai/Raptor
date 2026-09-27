/* The absence-record re-test — HOST H4 (26 Sep 26): who sees what of an absence. Rules: D211 (every member sees a
   medical input's type, remarks and documents), D213 / D215 (a guest sees a medical row on View-only Sched as a member
   does, read only), D166 (a member acts on his own row only), D204 / D221 (the waiting screen's "View the schedule"
   when the admin's guest view is on). Fable S12, S34; Astra 13.
   World: the admin files a medical with remarks for a free man on Fri 17 Jul, publishes Friday, turns the guest view on
   (Admin → Users); then a member signs in, then a stranger asks for access and enters the guest view. Both widths.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/ab-h4-roles-guest.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = `host/h4-${W}`
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi, login } = await import('../am/w2-lib.mjs')
const { go, fileInput, inputsView, inputsWindow, shot, resultBook, ROOT, lwOpen, tapCell, closeSheets } = L
const PHONE = W === 'phone'
const R = resultBook(`H4-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-h4-${W}.txt`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `h4-THREW-${name}`).catch(() => {}) } }
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
const FRI = 4, ISO = '2026-07-17'
let M
async function signOut() {
  if (await page.locator('#schedBoard:visible').count()) await L.closeBoard(page)
  const lo = page.locator('#logout:visible').first()
  if (await lo.count()) await lo.click()
  else {
    const menu = page.locator('.hamb:visible, #hamb:visible, button[aria-label*="menu" i]:visible').first()
    if (await menu.count()) { await menu.click(); await page.waitForTimeout(400) }
    await page.getByRole('button', { name: /Log ?out|Sign out/i }).first().click()
  }
  await page.waitForTimeout(800)
}
async function signInAs(user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(1200)
}
/* the Unavailable row for one man on View-only Sched's face of Friday: its words */
async function unavRowText(id) {
  await go(page, 'viewsched'); await page.waitForTimeout(400)
  return page.evaluate(([s, id]) => {
    const r = [...document.querySelectorAll(`${s} .sec-unav .pl-row`)].find(x => x.querySelector(`[data-person="${id}"]`))
    if (!r) return '(no row)'
    const vals = [...r.querySelectorAll('input, textarea')].map(e => e.value).filter(Boolean)
    return r.innerText.replace(/\s+/g, ' ').trim() + (vals.length ? ' [' + vals.join(' | ') + ']' : '')
  }, [`#vWeek .day[data-day="${FRI}"]`, id])
}

await step('setup', async () => {
  ;[M] = await S.freeMen(page, [FRI])
  const f = await fileInput(page, { person: M, type: 'HL', from: ISO, remarks: 'H4 knee — physio every morning' })
  const p = await S.pubOnBoard(page, FRI)
  await L.closeBoard(page)
  await go(page, 'admin'); await page.waitForTimeout(500)
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first(); await users.click(); await page.waitForTimeout(500)
  const gv = page.locator('#admGuestView')
  if (!(await gv.isChecked())) { await gv.click(); await page.waitForTimeout(400) }
  R.ck('setup', f.added === 1 && p.p.pressed && await gv.isChecked(), 'a medical with remarks on Friday, Friday published, the guest view on', { M, f: f.added, pub: p.p, guest: await gv.isChecked() })
  await shot(page, 'h4-00-admin-guest-switch')
})
await step('admin-face', async () => {
  const t = await unavRowText(M)
  R.ck('admin-face', /HL/.test(t) && /physio/.test(t), 'the admin reads the medical\'s type and remarks on the published face', t)
  await S.shotUnav(page, 'face', FRI, 'h4-01-admin-face')
})
await step('member', async () => {
  await signOut(); await signInAs('us', 'us')
  const t = await unavRowText(M)
  R.ck('member-face', /HL/.test(t) && /physio/.test(t), 'a member reads the medical\'s type and remarks on the published face (D211)', t)
  await S.shotUnav(page, 'face', FRI, 'h4-02-member-face')
  /* the Inputs table as a member: another man's medical row, with its remarks, and no edit door on it */
  await inputsWindow(page, ISO, ISO)
  /* the member's table opens filtered to HIS OWN name — widen it through the name filter, as he would */
  const opts = await page.locator('#inFPerson option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })))
  const everyone = opts.find(o => /all|everyone/i.test(o.t)) || opts.find(o => o.v === '')
  R.note('member-filter-options', { first: opts.slice(0, 3), picked: everyone })
  if (everyone) { await page.selectOption('#inFPerson', everyone.v); await page.waitForTimeout(400) }
  const row = await page.evaluate(id => { const tr = [...document.querySelectorAll('#inBody tr')].find(r => r.innerText.includes('H4 knee')); return tr ? { text: tr.innerText.replace(/\s+/g, ' ').trim().slice(0, 200), edit: !!tr.querySelector('[data-edit]'), del: !!tr.querySelector('.rmx') } : null }, M)
  R.ck('member-inputs-row', row && /HL/.test(row.text) && !row.edit && !row.del, 'a member sees another man\'s medical on the Inputs page with its remarks, and cannot edit or delete it', row)
  await shot(page, 'h4-03-member-inputs')
  /* the war: another man's medical cell opens the read-only sheet at most, never a write door */
  await lwOpen(page, ISO)
  const t2 = await tapCell(page, M, ISO)
  R.ck('member-war-other', t2.open === 'raptor-sheet' || t2.open === 'nothing', 'a member tapping another man\'s medical on the war gets the read-only sheet or nothing', { open: t2.open, text: (t2.text || '').slice(0, 160), buttons: t2.buttons })
  await shot(page, 'h4-04-member-war-other'); await closeSheets(page)
})
await step('guest', async () => {
  await signOut(); await signInAs('h4.stranger@mail', 'x')
  const card = await page.evaluate(() => ({ request: !!document.querySelector('#accessRequest'), waiting: !!document.querySelector('#accessWaiting') }))
  if (card.request) {
    await page.fill('#accCs', 'Stranger'); await page.fill('#accFull', 'H4 Stranger')
    await shot(page, 'h4-05-request-access')
    await page.click('#accSend'); await page.waitForTimeout(900)
  }
  const gbtn = page.locator('#accGuest')
  R.ck('guest-door', await gbtn.count() > 0, 'the waiting screen offers "View the schedule" while the guest view is on (D221)', card)
  await shot(page, 'h4-06-waiting')
  await gbtn.click(); await page.waitForTimeout(1200)
  const t = await page.evaluate(([fri, id]) => {
    const r = [...document.querySelectorAll(`.day[data-day="${fri}"] .sec-unav .pl-row`)].find(x => x.querySelector(`[data-person="${id}"]`))
    return { row: r ? r.innerText.replace(/\s+/g, ' ').trim() : '(no row)', nav: [...document.querySelectorAll('.nav a, #drawerNav a')].map(a => a.innerText.trim()).filter(Boolean),
      info: document.querySelectorAll('.dinfobtn, [data-dayinfo]').length, inputs: !!document.querySelector('#inAdd'), war: !!document.querySelector('[data-testid^="row-"]') }
  }, [FRI, M])
  R.ck('guest-medical', /HL/.test(t.row), 'the guest sees the medical row as a member does, read only (D213, D215)', t)
  R.ck('guest-no-doors', !t.inputs && !t.war && t.info === 0, 'the guest has no Inputs page, no Leave War and no ⓘ panel', t)
  const fri = page.locator(`.day[data-day="${FRI}"] .sec-unav`).first()
  if (await fri.count()) { await fri.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300) }
  await shot(page, 'h4-07-guest-face')
})
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
