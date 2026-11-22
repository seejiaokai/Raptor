// Walk step 9 — more of Astra's scenarios by real presses:
//  (1) a master admin's exports with 149 picked: the schedule's CSV and the Quals (LoX) file's names (plan §3 item 9)
//  (2) the bell's Show switch with a 149 request waiting (Astra 23, D2198): off — nothing lit; on — lit, the tap's toast
//  (3) Undo across a pick (Astra 10, D148): a change on 142's page, 149 picked, Undo — what it says and where it lands
//  (4) a waiting request blocks Undo of its new squadron (Astra 34, plan §5 item 4): Saber makes 150 in tab A, a newcomer
//      asks 150 in tab B of the same browser, tab A presses Undo
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, undo, redo, bellOpen, bellLines, bellClose } from './w1-view.mjs'

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
const dl = async (s, sel) => { const [d] = await Promise.all([s.page.waitForEvent('download', { timeout: 8000 }), s.page.locator(sel).first().click()]); return d.suggestedFilename() }

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz, { acceptDownloads: true }); const P = `w9-${sz}`
    await step('a request to 149 first', async () => { await ask(s, 'kite@mail', '149'); await logout(s) })
    await signIn(s, 'ad', 'a')
    await step('exports with 149 picked', async () => {
      await pick(s, '149'); await navTo(s, 'Edit Schedule')
      if (s.desk) facts[`${P}-csv-name`] = await dl(s, '#exportSched:visible').catch(e => 'ERR ' + String(e).slice(0, 80))
      await navTo(s, 'Quals'); facts[`${P}-lox-name`] = await dl(s, '#qExport:visible').catch(e => 'ERR ' + String(e).slice(0, 80))
      await pick(s, '142'); await navTo(s, 'Quals'); facts[`${P}-lox-name-142`] = await dl(s, '#qExport:visible').catch(e => 'ERR ' + String(e).slice(0, 80))
    })
    await step('bell switch with a 149 request', async () => {
      facts[`${P}-bell-lit-149-off`] = await vis(s, '.belldot')
      await bellOpen(s); facts[`${P}-bell-lines-off`] = await bellLines(s); await shot(s, `${P}-01-bell-149-off.png`, ['[data-testid="bell-list"]'])
      await s.page.locator('[data-testid="bell-show"] .fchip', { hasText: /^149$/ }).click(); await s.page.waitForTimeout(400)
      facts[`${P}-bell-lines-on`] = await bellLines(s); facts[`${P}-bell-chips-on`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] .fchip')].map(c => c.textContent + ':' + c.getAttribute('aria-pressed')))
      await shot(s, `${P}-02-bell-149-on.png`, ['[data-testid="bell-list"]'])
      await bellClose(s); facts[`${P}-bell-lit-149-on`] = await vis(s, '.belldot')
      await s.page.locator('#notifyBell:visible').first().click(); await s.page.waitForTimeout(250)
      facts[`${P}-bell-tap-149-on`] = { toast: await toastText(s), mark: await text(s, '#sqnMenuBtn'), page: await s.page.evaluate(() => document.querySelector('.page.on').id) }
      await shot(s, `${P}-03-bell-tap.png`)
      await pick(s, '142')
    })
    await step('undo across a pick', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane'); await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      await pick(s, '149'); facts[`${P}-undo-title-after-pick`] = await s.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? b.title : null })
      await undo(s); facts[`${P}-undo-after-pick`] = { toast: await toastText(s), mark: await text(s, '#sqnMenuBtn'), page: await s.page.evaluate(() => document.querySelector('.page.on').id) }
      await shot(s, `${P}-04-undo-after-pick.png`)
      await pick(s, '142'); await adminCat(s, 'Users'); await openRow(s, 'bane')
      facts[`${P}-ranger-after-undo`] = await s.page.evaluate(() => [...document.querySelectorAll('[aria-label="Access to 149"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed')}`))
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await step('a request blocks undo of 150 (two tabs)', async () => {
      await adminCat(s, 'Squadrons')
      await s.page.click('#sqNew'); await s.page.waitForTimeout(250)
      await s.page.fill('#sqNewNum', '150'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      await s.page.click('#sqNewSave'); await s.page.waitForTimeout(800)
      facts[`${P}-150-made`] = await s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
      const pB = await s.ctx.newPage(); const B = { ctx: s.ctx, page: pB, sz, desk: s.desk }
      await ask(B, 'lark@mail', '150'); facts[`${P}-lark-sent`] = await B.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 120))
      await pB.close()
      await s.page.bringToFront(); await s.page.waitForTimeout(500)
      await undo(s); facts[`${P}-undo-150-with-request`] = { toast: await toastText(s) }
      await adminCat(s, 'Squadrons'); facts[`${P}-rows-after-undo`] = await s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
      await shot(s, `${P}-05-undo-150-with-request.png`)
    })
    await s.ctx.close()
  }
} finally { save('w9'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
