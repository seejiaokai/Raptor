// l1 — Astra's scenarios 25 and 26: a right changed by Saber while the other person stays signed in. Two pages in ONE
// browser context (one demo world): page A the person, page B Saber. First it reads whether page B starts signed out
// (a sign-in per tab) and whether page A is still signed in after Saber signs in on B; only then are the scenarios walked.
// Desktop (25) and phone (26).
import { serve, stop, newPage, signIn, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
console.log('l1-live v1')
picsFor('l1')
const who = p => p.evaluate(() => { const a = document.querySelector('#drawerAcct'); return a ? a.textContent.replace(/\s+/g, ' ').trim() : (document.querySelector('#luser') ? 'signed out' : '?') })
async function second(s) {
  const page = await s.ctx.newPage()
  page.on('pageerror', e => note('[B] PAGEERROR', String(e)))
  await page.goto(`http://localhost:${process.env.MQ_PORT}/`); await page.waitForTimeout(1500)
  return { ...s, page }
}
await serve()
try {
  /* 25 — Hunter on a desktop, View of 149 given first */
  const a = await newPage('d')
  await signIn(a, 'ad', 'a')
  await step('S25 setup', async () => { await grant(a, 'prowler', '149', 'view'); await go(a, 'viewsched') })
  const { as } = await import('./vlib.mjs')
  await as(a, 'ad2', 'a2')
  await step('S25 Hunter on 149', async () => { await barPick(a, '149'); await rec(a, 's25-a-hunter-149'); await pic(a, 's25-01-hunter-149', ['.topbar']) })
  const b = await second(a)
  await step('S25 second page', async () => {
    facts['s25-b-B-start'] = await who(b.page); note('B starts:', facts['s25-b-B-start'])
    if (facts['s25-b-B-start'] !== 'signed out') { facts.s25 = `NOT WALKED: the second page opened already signed in (${facts['s25-b-B-start']}) — one sign-in per browser, not per tab`; return }
    await b.page.fill('#luser', 'ad'); await b.page.fill('#lpass', 'a'); await b.page.click('#loginForm button[type=submit]')
    await b.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await b.page.waitForTimeout(900)
    facts['s25-c-A-after-B-signin'] = await who(a.page); facts['s25-c-B'] = await who(b.page)
    note('A after B signs in:', facts['s25-c-A-after-B-signin'], 'B:', facts['s25-c-B'])
    await grant(b, 'prowler', '149', 'plan')
    await a.page.waitForTimeout(3000)
    await rec(a, 's25-d-A-after-plan'); await pic(a, 's25-02-A-after-plan-given', ['.topbar'])
    await grant(b, 'prowler', '149', 'view')
    await a.page.waitForTimeout(3000)
    await rec(a, 's25-e-A-after-view-again'); await pic(a, 's25-03-A-after-view-again', ['.topbar'])
  })
  await b.page.close(); await a.ctx.close()

  /* 26 — Ranger on the phone, one squadron, ☰ open; Saber gives View of 149, takes it, gives it again */
  const r = await newPage('p')
  await signIn(r, 'us', 'us')
  await step('S26', async () => {
    await openMenu(r); await rec(r, 's26-a-ranger-one'); await pic(r, 's26-01-ranger-one-menu')
    const b2 = await second(r)
    facts['s26-b-B-start'] = await who(b2.page)
    if (facts['s26-b-B-start'] !== 'signed out') { facts.s26 = `NOT WALKED: the second page opened already signed in (${facts['s26-b-B-start']})`; return }
    await b2.page.fill('#luser', 'ad'); await b2.page.fill('#lpass', 'a'); await b2.page.click('#loginForm button[type=submit]')
    await b2.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await b2.page.waitForTimeout(900)
    facts['s26-c-A-after-B-signin'] = await who(r.page)
    await grant(b2, 'bane', '149', 'view'); await r.page.waitForTimeout(3000)
    await rec(r, 's26-d-after-grant'); await pic(r, 's26-02-after-grant')
    if ((await state(r)).dBtn) { await press(r, '#drawerSqnBtn'); await rec(r, 's26-e-list') }
    await grant(b2, 'bane', '149', 'none'); await r.page.waitForTimeout(3000)
    await rec(r, 's26-f-after-removal'); await pic(r, 's26-03-after-removal')
    await grant(b2, 'bane', '149', 'view'); await r.page.waitForTimeout(3000)
    await rec(r, 's26-g-after-regrant'); await pic(r, 's26-04-after-regrant')
  })
  await r.ctx.close()
} finally { finish('l1'); await stop() }
