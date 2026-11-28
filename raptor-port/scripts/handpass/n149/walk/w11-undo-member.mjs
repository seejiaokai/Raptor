// Walk step 11 — Astra's 25 (D2250, plan §16 D1′): Saber makes Ranger an admin with Plan of 149 in one Save; Hunter
// (142's admin, not a master) makes Ranger a member — his Plan ends with it — then presses Undo: Ranger's admin role
// comes back, his Plan of 149 does not. What Ranger's row, menu and bell then say.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { adminCat, openRow, lineBtn, toastText, undo, bellOpen, bellLines, bellClose } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const lines = s => s.page.evaluate(() => ({ role: document.querySelector('#accEdRole') && document.querySelector('#accEdRole').value,
  l: [...document.querySelectorAll('[data-testid="acc-sq"] [role=group]')].map(g => g.getAttribute('aria-label') + ':' + [...g.querySelectorAll('button')].map(b => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? '*' : ''}${b.disabled ? '(off)' : ''}`).join('|')) }))

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `w11-${sz}`
    await signIn(s, 'ad', 'a')
    await step('saber: ranger admin + plan in one save', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane')
      facts[`${P}-plan-off-as-member`] = await s.page.evaluate(sel => document.querySelector(sel).disabled, lineBtn('149', 'plan'))
      await s.page.selectOption('#accEdRole', 'admin'); await s.page.waitForTimeout(200)
      facts[`${P}-plan-off-after-admin-picked`] = await s.page.evaluate(sel => document.querySelector(sel).disabled, lineBtn('149', 'plan'))
      await s.page.click(lineBtn('149', 'plan')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      facts[`${P}-toast`] = await toastText(s); await openRow(s, 'bane'); facts[`${P}-ranger-after`] = await lines(s)
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter: ranger made a member, then undo', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane'); facts[`${P}-hunter-sees`] = await lines(s)
      await shot(s, `${P}-01-hunter-sees-ranger.png`, ['.acc-edit'])
      await s.page.selectOption('#accEdRole', 'main'); await s.page.waitForTimeout(200); facts[`${P}-hunter-picked-member`] = await lines(s)
      await s.page.click('#accEdSave'); await s.page.waitForTimeout(700); facts[`${P}-member-toast`] = await toastText(s)
      await openRow(s, 'bane'); facts[`${P}-after-member`] = await lines(s); await s.page.click('#accEdCancel').catch(() => {})
      facts[`${P}-undo-title`] = await s.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? b.title : null })
      await undo(s); facts[`${P}-undo-toast`] = await toastText(s)
      await openRow(s, 'bane'); facts[`${P}-after-undo`] = await lines(s)
      await shot(s, `${P}-02-after-undo.png`, ['.acc-edit'])
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await logout(s); await signIn(s, 'us', 'us')
    await step('ranger after', async () => {
      facts[`${P}-ranger-menu`] = await menuRows(s); facts[`${P}-ranger-badge`] = await text(s, '#roleBadge')
      await bellOpen(s); facts[`${P}-ranger-bell`] = await bellLines(s); await shot(s, `${P}-03-ranger-bell.png`, ['[data-testid="bell-list"]']); await bellClose(s)
    })
    await s.ctx.close()
  }
} finally { save('w11'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
