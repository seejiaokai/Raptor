// Walk step 3 — Plan of 149, a master admin's every page after a pick, the Tracker after a pick, the member view, a
// window open at a pick, Plan lowered and taken (with Undo / Redo) and what Hunter's bell and menu then say.
// All by real presses on one page (one browser's store), sign-out and sign-in between people.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, liveControls, toastText, undo, redo, bellOpen, bellLines, bellClose, tabsShown } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForTimeout(800)
  // the Tracker's own "save first?" question may stand between: record and answer Discard
  const q = await s.page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], .modal')].find(e => e.getBoundingClientRect().width > 0); return d ? d.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : null })
  if (q && !(await s.page.locator('#luser').count())) { note('[logout question]', q) }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const pageText = (s, id) => s.page.evaluate(id => { const p = document.getElementById(id); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : null }, id)
const bannerOf = s => s.page.evaluate(() => [...document.querySelectorAll('#page-tracker [role=status], #page-tracker .tr-band, #page-tracker .band, .trk-cover, [data-testid*="tracker"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4))

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz)
    const P = `w3-${sz}`
    await signIn(s, 'ad', 'a')
    await step('give plan', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      await s.page.click(lineBtn('149', 'plan')); await s.page.waitForTimeout(200)
      await shot(s, `${P}-01-plan-picked.png`, ['[data-testid="acc-sq"]', '#accEdSave'])
      await s.page.click('#accEdSave'); await s.page.waitForTimeout(800)
      facts[`${P}-toast-save`] = await toastText(s)
      facts[`${P}-hunter-line`] = await text(s, '[data-person="prowler"]')
      await shot(s, `${P}-02-after-save.png`, ['[data-person="prowler"]'])
    })
    // a master admin's every page after a pick (Saber picks 149)
    await step('saber tracker first on 142', async () => { await navTo(s, 'Tracker'); await s.page.waitForTimeout(2500); facts[`${P}-saber-tracker-142-band`] = await bannerOf(s) })
    await step('saber pick 149', async () => {
      await pick(s, '149'); facts[`${P}-saber-mark`] = await text(s, '#sqnMenuBtn'); facts[`${P}-saber-tabs-149`] = await tabsShown(s)
      facts[`${P}-saber-page-after-pick`] = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p && p.id })
      await shot(s, `${P}-03-saber-149-tracker.png`)
      facts[`${P}-saber-tracker-after-pick-text`] = await pageText(s, 'page-tracker')
    })
    for (const t of ['Edit Schedule', 'View-only Sched', 'Inputs', 'Quals', 'Logic', 'Leave War']) {
      await step(`saber 149 ${t}`, async () => {
        await navTo(s, t); await s.page.waitForTimeout(400)
        const pg = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p && p.id })
        const tx = pg ? await pageText(s, pg) : ''
        facts[`${P}-saber149-${t}`] = { pg, kestrel: /Kestrel/.test(tx || ''), ranger: /Ranger/.test(tx || ''), head: (tx || '').slice(0, 140) }
        if (t === 'Quals' || t === 'Leave War') {
          const full = await s.page.evaluate(pg => document.getElementById(pg).innerText, pg)
          facts[`${P}-saber149-${t}`].kestrelFull = /Kestrel/.test(full); facts[`${P}-saber149-${t}`].rangerFull = /Ranger/.test(full)
        }
        await shot(s, `${P}-04-saber149-${t.replace(/\W+/g, '')}.png`)
      })
    }
    await step('saber 149 admin', async () => {
      for (const c of ['Users', 'Squadrons', 'Squadron config', 'Data']) {
        await adminCat(s, c)
        facts[`${P}-saber149-admin-${c}`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-panel.on h3, #page-admin .adm-panel.on h4, #page-admin .adm-panel.on .adm-note')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 6))
        if (c === 'Users') { const t = await s.page.evaluate(() => document.querySelector('#page-admin').innerText); facts[`${P}-saber149-users-kestrel`] = /Kestrel/.test(t); facts[`${P}-saber149-users-ranger`] = /Ranger/.test(t) }
        await shot(s, `${P}-05-saber149-admin-${c.replace(/\W+/g, '')}.png`)
      }
    })
    await step('saber back to 142 — tracker band', async () => {
      await navTo(s, 'View-only Sched'); await pick(s, '142')
      await navTo(s, 'Tracker'); await s.page.waitForTimeout(1500)
      facts[`${P}-saber-tracker-band-after-142`] = await bannerOf(s)
      facts[`${P}-saber-tracker-text-after-142`] = (await pageText(s, 'page-tracker') || '').slice(0, 300)
      await shot(s, `${P}-06-saber-tracker-142-after.png`)
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter plan arrives', async () => {
      await bellOpen(s); facts[`${P}-hunter-bell`] = await bellLines(s)
      facts[`${P}-hunter-bell-show`] = await text(s, '[data-testid="bell-show"]')
      await shot(s, `${P}-07-hunter-bell.png`, ['[data-testid="bell-list"]']); await bellClose(s)
      facts[`${P}-hunter-menu`] = await menuRows(s)
      await pick(s, '149'); facts[`${P}-hunter-tabs-149`] = await tabsShown(s)
      await adminCat(s, 'Users')
      const t = await s.page.evaluate(() => document.querySelector('#page-admin').innerText)
      facts[`${P}-hunter149-users-kestrel`] = /Kestrel/.test(t); facts[`${P}-hunter149-users-head`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin h4')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
      await shot(s, `${P}-08-hunter149-users.png`)
      await navTo(s, 'Edit Schedule'); facts[`${P}-hunter149-edit-page`] = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p && p.id })
      await shot(s, `${P}-09-hunter149-edit.png`)
    })
    await step('hunter member view', async () => {
      await s.page.locator('#roleBadge:visible, #drawerRole').first().click().catch(async () => { await s.page.click('#burger'); await s.page.click('#drawerRole') })
      await s.page.waitForTimeout(800)
      facts[`${P}-member-badge`] = await text(s, '#roleBadge')
      facts[`${P}-member-menu`] = await menuRows(s)
      facts[`${P}-member-tabs`] = await tabsShown(s)
      facts[`${P}-member-page`] = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p && p.id })
      await shot(s, `${P}-10-member-view.png`)
      await s.page.locator('#roleBadge:visible').first().click().catch(() => {}); await s.page.waitForTimeout(800)
      facts[`${P}-member-back-badge`] = await text(s, '#roleBadge')
    })
    await step('hunter input window at a pick', async () => {
      await navTo(s, 'Inputs'); await s.page.waitForTimeout(500)
      const day = s.page.locator('#inpCal [data-icday]').nth(10)
      await day.click({ position: { x: 8, y: 8 } }); await s.page.waitForTimeout(500)
      if (await s.page.locator('#icPopAdd:visible').count()) { await s.page.click('#icPopAdd'); await s.page.waitForSelector('[data-testid="win-inputedit"]', { timeout: 5000 }); await s.page.waitForTimeout(500) }
      facts[`${P}-inputwin-before`] = await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 160) : null })
      await s.page.evaluate(() => document.querySelector('#sqnMenuBtn').click()); await s.page.waitForTimeout(300)
      await shot(s, `${P}-11-menu-over-window.png`)
      const picked = await s.page.evaluate(() => { const r = [...document.querySelectorAll('#sqnMenu .sqm-row')].find(r => /142/.test(r.textContent)); if (r) r.click(); return !!r })
      await s.page.waitForTimeout(800)
      facts[`${P}-inputwin-picked`] = picked
      facts[`${P}-inputwin-after`] = await s.page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 300) : null })
      await shot(s, `${P}-12-inputwin-after-pick.png`)
      await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(400)
    })
    await logout(s); await signIn(s, 'ad', 'a')
    await step('lower to view, undo, redo, none', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      facts[`${P}-lower-toast`] = await toastText(s)
      await undo(s); facts[`${P}-lower-undo-toast`] = await toastText(s)
      await redo(s); facts[`${P}-lower-redo-toast`] = await toastText(s)
      await openRow(s, 'prowler'); await s.page.click(lineBtn('149', 'none')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
      facts[`${P}-none-toast`] = await toastText(s)
      await shot(s, `${P}-13-after-none.png`, ['[data-person="prowler"]'])
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter after none', async () => {
      await bellOpen(s); facts[`${P}-hunter-bell-end`] = await bellLines(s); facts[`${P}-hunter-bell-show-end`] = await text(s, '[data-testid="bell-show"]')
      await shot(s, `${P}-14-hunter-bell-end.png`, ['[data-testid="bell-list"]']); await bellClose(s)
      facts[`${P}-hunter-menu-end`] = await menuRows(s); facts[`${P}-hunter-mark-end`] = await text(s, '#sqnMenuBtn')
      await shot(s, `${P}-15-hunter-end.png`)
    })
    await s.ctx.close()
  }
} finally { save('w3'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
