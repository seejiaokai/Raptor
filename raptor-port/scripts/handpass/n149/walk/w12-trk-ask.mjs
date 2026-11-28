// Walk step 12 — Astra's 1 (D2318, plan §16 D2′): a pick with unsaved chart edits asks "Save them before switching to
// 149?" — Save them / Discard them / Stay — each answer pressed: Stay keeps the pick and the edit; Discard picks and drops
// it; Save saves to the Tracker that holds it, then picks. The second and third asked from View-only Sched, not the
// Tracker page. The edit is a new test event made in the chart's layout editor by presses.
import { serve, stop, newPage, signIn, shot, pick, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, toastText } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
const t = (s, sel) => s.page.locator(sel + ':visible').first().click()
async function addEvent(s, name) {
  await navTo(s, 'Tracker'); await s.page.waitForTimeout(1500)
  await t(s, '#sylMenuBtn'); await t(s, '#arrangeBtn'); await s.page.waitForTimeout(300)
  const add = s.page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await s.page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
  await add.click(); await s.page.waitForSelector('#dlgInput:visible')
  await s.page.locator('#dlgInput:visible').first().fill(name)
  await t(s, '#dlgOk'); await s.page.waitForTimeout(400); await t(s, '#sylMenuBtn'); await t(s, '#arrangeBtn'); await s.page.waitForTimeout(400)
  return s.page.evaluate(() => { const e = [...document.querySelectorAll('#page-tracker *')].find(x => /^● ?(saved|unsaved)|unsaved/i.test(x.textContent.trim()) && x.children.length === 0); return e ? e.textContent.trim() : null })
}
async function pickAsk(s, num) {
  await s.page.locator('#sqnMenuBtn:visible').first().click(); await s.page.waitForTimeout(300)
  await s.page.locator('#sqnMenu .sqm-row', { hasText: num }).first().click(); await s.page.waitForTimeout(600)
  return { msg: await text(s, '#dlgMsg'), btns: await s.page.$$eval('#dlgModal button', bs => bs.filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim())) }
}
const hasEv = (s, name) => s.page.evaluate(n => (document.querySelector('#page-tracker') || document.body).innerText.includes(n), name)

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `w12-${sz}`
    await signIn(s, 'ad', 'a')
    await step('stay, then discard (on the Tracker page)', async () => {
      facts[`${P}-mark-after-edit-1`] = await addEvent(s, 'T-NEWA')
      facts[`${P}-ask-1`] = await pickAsk(s, '149'); await shot(s, `${P}-01-ask.png`)
      await s.page.click('#dlgCancel'); await s.page.waitForTimeout(500)
      facts[`${P}-after-stay`] = { mark: await text(s, '#sqnMenuBtn'), has: await hasEv(s, 'T-NEWA') }
      facts[`${P}-ask-2`] = await pickAsk(s, '149')
      await s.page.click('#dlgAlt'); await s.page.waitForTimeout(900)
      facts[`${P}-after-discard`] = { mark: await text(s, '#sqnMenuBtn'), page: await s.page.evaluate(() => document.querySelector('.page.on').id) }
      await pick(s, '142'); await navTo(s, 'Tracker'); await s.page.waitForTimeout(800)
      facts[`${P}-after-discard-back`] = { has: await hasEv(s, 'T-NEWA') }
    })
    await step('save (asked from View-only Sched)', async () => {
      facts[`${P}-mark-after-edit-2`] = await addEvent(s, 'T-NEWB')
      await navTo(s, 'View-only Sched')
      facts[`${P}-ask-3`] = await pickAsk(s, '149'); await shot(s, `${P}-02-ask-from-viewsched.png`)
      await s.page.click('#dlgOk'); await s.page.waitForTimeout(1200)
      facts[`${P}-after-save`] = { mark: await text(s, '#sqnMenuBtn'), page: await s.page.evaluate(() => document.querySelector('.page.on').id), toast: await toastText(s) }
      await shot(s, `${P}-03-after-save.png`)
      await pick(s, '142'); await navTo(s, 'Tracker'); await s.page.waitForTimeout(800)
      facts[`${P}-after-save-back`] = { has: await hasEv(s, 'T-NEWB') }
    })
    await s.ctx.close()
  }
} finally { save('w12'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
