// Walk step 6 — the account doors by real presses (Astra's scenarios 12, 13, 14, 18, 21, 26, 30, 4, 6):
// Kestrel finds Hunter by search and gives him View of 149, the rest of his row locked; a Save whose second change is
// refused saves nothing; Saber adds a 149 man from 142's page; a waiting 149 request typed onto a 142 man by Hunter is
// refused with its words; archiving Ranger ends his View of 149, restoring does not bring it back; Hunter with Plan made
// a master admin (his rows "Full access") and Undo; an Inputs settings window left open across a pick; Squadron config
// with Plan of 149.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, undo, redo, bellOpen, bellLines, bellClose, liveControls } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#accOut:visible').count()) await page.click('#accOut')
  else if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const rowState = s => s.page.evaluate(() => {
  const q = sel => document.querySelector(sel)
  return { name: q('#accEdName') ? { v: q('#accEdName').value, off: q('#accEdName').disabled } : null, role: q('#accEdRole') ? { v: q('#accEdRole').value, off: q('#accEdRole').disabled } : null,
    onoff: q('#accEdOnOff') ? q('#accEdOnOff').disabled : null, archive: q('#accEdArchive') ? q('#accEdArchive').disabled : null, del: q('#accEdDel') ? q('#accEdDel').disabled : null,
    lines: [...document.querySelectorAll('[data-testid="acc-sq"] [role=group]')].map(g => g.getAttribute('aria-label') + ':' + [...g.querySelectorAll('button')].map(b => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? '*' : ''}${b.disabled ? '(off)' : ''}`).join('|')),
    notes: [...document.querySelectorAll('[data-testid="acc-sq"] .acc-sq-note, .acc-edit .od-err, .acc-edit .adm-note')].map(n => n.textContent.trim()).slice(0, 6) }
})

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz)
    const P = `w6-${sz}`
    // a newcomer asks 149 first, for the alternate-door test
    await step('jett asks 149', async () => {
      await signIn(s, 'jett@mail', 'j1', { pending: true }); await s.page.waitForSelector('#accForm')
      await s.page.selectOption('#accSqn', { label: '149' }); await s.page.fill('#accCs', 'Jett'); await s.page.fill('#accIni', 'JT')
      await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(150); await s.page.selectOption('#accCat', 'OCU')
      await s.page.click('#accSend'); await s.page.waitForTimeout(600); await logout(s)
    })
    await signIn(s, 'ad9', 'a9')
    await step('kestrel finds hunter', async () => {
      await adminCat(s, 'Users'); await s.page.fill('#accFind', 'Hunter'); await s.page.waitForTimeout(400)
      facts[`${P}-k-find`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-person]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()))
      await openRow(s, 'prowler'); facts[`${P}-k-hunter-row`] = await rowState(s)
      await shot(s, `${P}-01-kestrel-hunter-row.png`, ['.acc-edit', '[data-person="prowler"]'])
      await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      facts[`${P}-k-give-toast`] = await toastText(s)
      await s.page.fill('#accFind', 'Hunter'); await s.page.waitForTimeout(300)
      await openRow(s, 'prowler'); facts[`${P}-k-hunter-row-after`] = await rowState(s)
      await shot(s, `${P}-02-kestrel-after-view.png`, ['.acc-edit'])
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter: a waiting 149 request onto a 142 man', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'dj')
      facts[`${P}-ace-row`] = await rowState(s)
      const nm = (await s.page.locator('#accGiveName').count()) ? '#accGiveName' : '#accEdName'
      await s.page.fill(nm, 'jett@mail'); await s.page.waitForTimeout(200)
      await s.page.locator('#accGive, #accEdSave').first().click(); await s.page.waitForTimeout(700)
      facts[`${P}-ace-give-toast`] = await toastText(s)
      facts[`${P}-ace-give-err`] = await s.page.evaluate(() => [...document.querySelectorAll('.od-err, .acc-edit .err, [role=alert]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.trim()))
      await shot(s, `${P}-03-hunter-jett-onto-ace.png`, ['.acc-edit'])
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await logout(s); await signIn(s, 'ad', 'a')
    await step('saber: second change refused saves nothing', async () => {
      await adminCat(s, 'Users'); await s.page.fill('#accFind', 'Kestrel'); await s.page.waitForTimeout(300)
      await openRow(s, 'kes9'); facts[`${P}-kes-before`] = await rowState(s)
      await s.page.click(lineBtn('142', 'view')); await s.page.selectOption('#accEdRole', 'main'); await s.page.waitForTimeout(200)
      await shot(s, `${P}-04-kestrel-two-changes.png`, ['.acc-edit'])
      await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      facts[`${P}-kes-save-toast`] = await toastText(s); facts[`${P}-kes-after-press`] = await rowState(s)
      await shot(s, `${P}-05-kestrel-refused.png`, ['.acc-edit'])
      await s.page.click('#accEdCancel').catch(() => {}); await s.page.waitForTimeout(300)
      await s.page.fill('#accFind', 'Kestrel'); await s.page.waitForTimeout(300)
      await openRow(s, 'kes9'); facts[`${P}-kes-reopened`] = await rowState(s)
      await s.page.click('#accEdCancel').catch(() => {}); await s.page.fill('#accFind', ''); await s.page.waitForTimeout(300)
    })
    await step('saber adds a 149 man from 142', async () => {
      facts[`${P}-add-homes`] = await s.page.evaluate(() => [...document.querySelectorAll('#accAddHome option')].map(o => o.textContent))
      await s.page.selectOption('#accAddHome', { label: '149' })
      await s.page.fill('#accAddCs', 'Talon'); await s.page.fill('#accAddIni', 'TN')
      await s.page.selectOption('#accAddSeat', { label: 'Pilot' }).catch(() => {}); await s.page.waitForTimeout(150)
      await s.page.selectOption('#accAddCat', 'C').catch(() => {})
      await shot(s, `${P}-06-add-149-man.png`, ['#accAddBlock'])
      await s.page.click('#accAdd'); await s.page.waitForTimeout(800)
      facts[`${P}-add-toast`] = await toastText(s)
      facts[`${P}-add-on-142-list`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-unit="u142"] [data-person]')].some(e => /Talon/.test(e.textContent)))
      facts[`${P}-add-groups`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-unit-head]')].map(e => e.textContent.trim()))
      await pick(s, '149'); await navTo(s, 'Quals'); facts[`${P}-add-on-149-quals`] = await s.page.evaluate(() => /Talon/.test(document.querySelector('#page-quals').innerText))
      await navTo(s, 'Leave War'); facts[`${P}-add-on-149-war`] = await s.page.evaluate(() => /Talon/.test(document.querySelector('#page-leavewar').innerText))
      await shot(s, `${P}-07-talon-149-war.png`)
      await pick(s, '142'); await navTo(s, 'Quals'); facts[`${P}-add-on-142-quals`] = await s.page.evaluate(() => /Talon/.test(document.querySelector('#page-quals').innerText))
    })
    await step('archive ends ranger\'s view', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'bane')
      await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      await openRow(s, 'bane'); facts[`${P}-ranger-before-archive`] = await rowState(s)
      await s.page.click('#accEdArchive'); await s.page.waitForTimeout(600)
      // the archive's own form (callsign / date) may ask — press its confirm
      const conf = s.page.locator('.acc-edit button.primary:visible, .acc-edit button.danger:visible', { hasText: /Archive/ })
      facts[`${P}-archive-form`] = await s.page.evaluate(() => { const e = document.querySelector('.acc-edit'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : null })
      if (await conf.count()) { await conf.last().click(); await s.page.waitForTimeout(800) }
      facts[`${P}-archive-toast`] = await toastText(s)
      await shot(s, `${P}-08-after-archive.png`)
      await s.page.click('#accArchToggle').catch(() => {}); await s.page.waitForTimeout(300)
      await s.page.locator('#accArchList [data-person="bane"] .acc-tap').first().click().catch(() => note('no archived ranger')); await s.page.waitForTimeout(400)
      await s.page.locator('#accArRestore').click().catch(() => note('no restore')); await s.page.waitForTimeout(800)
      facts[`${P}-restore-toast`] = await toastText(s)
      await openRow(s, 'bane').catch(() => note('ranger row not found after restore')); facts[`${P}-ranger-after-restore`] = await rowState(s)
      await shot(s, `${P}-09-ranger-after-restore.png`, ['.acc-edit'])
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await step('hunter plan then master, undo', async () => {
      await openRow(s, 'prowler'); await s.page.click(lineBtn('149', 'plan')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      await openRow(s, 'prowler'); await s.page.selectOption('#accEdRole', 'master'); await s.page.waitForTimeout(250)
      facts[`${P}-master-picked`] = await rowState(s)
      await shot(s, `${P}-10-hunter-master-picked.png`, ['.acc-edit'])
      await s.page.click('#accEdSave'); await s.page.waitForTimeout(700); facts[`${P}-master-toast`] = await toastText(s)
      facts[`${P}-undo-title-master`] = await s.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? b.title : null })
      await undo(s); facts[`${P}-master-undo-toast`] = await toastText(s)
      await openRow(s, 'prowler'); facts[`${P}-after-master-undo`] = await rowState(s)
      await shot(s, `${P}-11-hunter-after-master-undo.png`, ['.acc-edit'])
      await s.page.click('#accEdCancel').catch(() => {})
    })
    await step('settings window across a pick', async () => {
      await navTo(s, 'Inputs'); await s.page.locator('#inGear:visible').first().click(); await s.page.waitForTimeout(600)
      const before = await s.page.evaluate(() => { const d = [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 0).pop(); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 200) : null })
      await s.page.evaluate(() => document.querySelector('#sqnMenuBtn').click()); await s.page.waitForTimeout(300)
      await s.page.evaluate(() => { const r = [...document.querySelectorAll('#sqnMenu .sqm-row')].find(r => /149/.test(r.textContent)); if (r) r.click() }); await s.page.waitForTimeout(800)
      const after = await s.page.evaluate(() => { const d = [...document.querySelectorAll('.floatwin')].filter(e => e.getBoundingClientRect().width > 0).pop(); return d ? { t: d.innerText.replace(/\s+/g, ' ').slice(0, 300), live: [...d.querySelectorAll('button, input, select')].filter(e => !e.disabled).map(e => e.id || e.textContent.trim().slice(0, 20)) } : null })
      facts[`${P}-settings-before`] = before; facts[`${P}-settings-after`] = after
      await shot(s, `${P}-12-settings-after-pick.png`)
      await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300); await pick(s, '142')
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter plan: squadron config 149', async () => {
      await pick(s, '149'); await adminCat(s, 'Squadron config')
      facts[`${P}-cfg-head`] = await s.page.evaluate(() => [...document.querySelectorAll('#admConfig h3, #admConfig h4, #admConfig .adm-note')].slice(0, 3).map(e => e.textContent.trim()))
      facts[`${P}-cfg-live`] = (await liveControls(s, '#admConfig') || []).length
      await shot(s, `${P}-13-hunter-plan-config149.png`)
    })
    await s.ctx.close()
  }
} finally { save('w6'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
