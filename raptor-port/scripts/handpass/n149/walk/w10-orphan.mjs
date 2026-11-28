// Walk step 10 — what follows when "+ New squadron" is undone while a newcomer's request names it (found by w9: the
// Undo goes through when the request was sent from a second tab of the same browser). Repeated, then: the stored
// request read (facts only), Saber signed in again — every squadron's Waiting list and his bell — and the newcomer
// signing in again.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, toastText, undo, bellOpen, bellLines, bellClose } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#accOut:visible').count()) await page.click('#accOut')
  else if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
async function ask(s, who, unitLabel) {
  await signIn(s, who, 'x1', { pending: true }); await s.page.waitForSelector('#accForm')
  await s.page.selectOption('#accSqn', { label: unitLabel }); await s.page.fill('#accCs', who.split('@')[0]); await s.page.fill('#accIni', 'XX')
  await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(150); await s.page.selectOption('#accCat', 'OCU')
  await s.page.click('#accSend'); await s.page.waitForTimeout(600)
}
const reqs = s => s.page.evaluate(() => Object.keys(localStorage).filter(k => /accessreq/.test(k)).map(k => k + ' = ' + localStorage.getItem(k).slice(0, 200)))
const unitsStored = s => s.page.evaluate(() => Object.keys(localStorage).filter(k => /(^|:)unit:/.test(k)).map(k => k + ' = ' + localStorage.getItem(k).slice(0, 120)))

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `w10-${sz}`
    await signIn(s, 'ad', 'a')
    await step('make 150, a request in tab B, undo in tab A', async () => {
      await adminCat(s, 'Squadrons'); await s.page.click('#sqNew'); await s.page.waitForTimeout(250)
      await s.page.fill('#sqNewNum', '150'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      await s.page.click('#sqNewSave'); await s.page.waitForTimeout(800)
      const pB = await s.ctx.newPage(); const B = { ctx: s.ctx, page: pB, sz, desk: s.desk }
      await ask(B, 'lark@mail', '150'); await pB.close()
      await s.page.bringToFront(); await s.page.waitForTimeout(400)
      facts[`${P}-stored-before-undo`] = await reqs(s)
      await undo(s); facts[`${P}-undo-toast`] = await toastText(s)
      facts[`${P}-stored-after-undo`] = await reqs(s); facts[`${P}-units-after-undo`] = await unitsStored(s)
    })
    await logout(s); await signIn(s, 'ad', 'a')
    await step('saber again', async () => {
      facts[`${P}-menu`] = await menuRows(s)
      await bellOpen(s); facts[`${P}-bell-show`] = await text(s, '[data-testid="bell-show"]'); await bellClose(s)
      await adminCat(s, 'Users'); facts[`${P}-waiting-142`] = await s.page.evaluate(() => document.querySelector('#admWaiting, #admNoWaiting').innerText.replace(/\s+/g, ' ').slice(0, 200))
      await pick(s, '149'); await adminCat(s, 'Users'); facts[`${P}-waiting-149`] = await s.page.evaluate(() => document.querySelector('#admWaiting, #admNoWaiting').innerText.replace(/\s+/g, ' ').slice(0, 200))
      await shot(s, `${P}-01-saber-waiting.png`)
      await adminCat(s, 'Squadrons'); facts[`${P}-rows`] = await s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
    })
    await logout(s)
    await step('lark again', async () => {
      await signIn(s, 'lark@mail', 'x1', { pending: true }); await s.page.waitForTimeout(800)
      facts[`${P}-lark-screen`] = await s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300))
      await shot(s, `${P}-02-lark-again.png`)
    })
    await s.ctx.close()
  }
} finally { save('w10'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
