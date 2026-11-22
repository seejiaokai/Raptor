// Walk step 5 — Admin → Squadrons. Saber makes 150 on screen ("+ New squadron", a new place with its time zone, a first
// admin), Undo and Redo of it; then makes squadrons up to eight on screen; the menu, Admin → Users' row lines, the
// filter's Squadron group and the bell's Show buttons with eight. Hunter (142 only): no "+ New squadron"; Home base's time
// zone (142 and 149 both there) greyed with D2336's words; a squadron's place not his greyed.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, undo, redo, bellOpen, bellLines, bellClose, tabsShown } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
const N = +(process.env.NSQ || 8)
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const sqRows = s => s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
const placeRows = s => s.page.evaluate(() => [...document.querySelectorAll('#sqPlaces [data-place]')].map(r => r.getAttribute('data-place') + ':' + r.textContent.replace(/\s+/g, ' ').trim()))
async function makeSquadron(s, num, newPlace, adminLabel) {
  const { page } = s
  if (!(await vis(s, '#sqNew'))) { note(`[${s.sz}] #sqNew not in sight before ${num}; panel: ${await page.evaluate(() => { const c = document.querySelector('#page-admin .adm-cat.on .adm-cat-l'); return c && c.textContent })}`); await adminCat(s, 'Squadrons') }
  await page.click('#sqNew'); await page.waitForTimeout(300)
  facts[`new-${num}-admins`] = await page.evaluate(() => [...document.querySelectorAll('#sqNewAdmin option')].map(o => o.textContent))
  facts[`new-${num}-places`] = await page.evaluate(() => [...document.querySelectorAll('#sqNewPlace option')].map(o => `${o.value}=${o.textContent}`))
  await page.fill('#sqNewNum', String(num))
  if (newPlace) {
    await page.selectOption('#sqNewPlace', '+new'); await page.waitForTimeout(200)
    await page.fill('#sqNewPlaceName', newPlace)
    await page.selectOption('#sqNewTz', 'Australia/Darwin').catch(async () => { const v = await page.evaluate(() => [...document.querySelectorAll('#sqNewTz option')].map(o => o.value).find(v => v)); await page.selectOption('#sqNewTz', v) })
  }
  if (adminLabel) await page.selectOption('#sqNewAdmin', { label: adminLabel }).catch(() => note(`no admin option ${adminLabel}`))
  facts[`new-${num}-note`] = await text(s, '#sqNewNote')
  return async () => { await page.click('#sqNewSave'); await page.waitForTimeout(800); return toastText(s) }
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz)
    const P = `w5-${sz}`
    await signIn(s, 'ad', 'a')
    await step('150 with a new place', async () => {
      await adminCat(s, 'Squadrons')
      facts[`${P}-rows0`] = await sqRows(s); facts[`${P}-places0`] = await placeRows(s)
      const go = await makeSquadron(s, 150, 'Northern base', null)
      facts[`${P}-150-admin-default`] = await s.page.evaluate(() => { const o = document.querySelector('#sqNewAdmin'); return o && o.options[o.selectedIndex] ? o.options[o.selectedIndex].textContent : null })
      await shot(s, `${P}-01-new150-form.png`, ['[data-new-sqn]', '#sqNewSave'])
      facts[`${P}-150-toast-no-admin`] = await go()
      // a number already in use, then the right one
      await s.page.fill('#sqNewNum', '149'); await s.page.selectOption('#sqNewAdmin', { label: 'Hunter · 142' })
      facts[`${P}-149-dup-toast`] = await go()
      await s.page.fill('#sqNewNum', '150')
      facts[`${P}-150-note-with-admin`] = await text(s, '#sqNewNote')
      facts[`${P}-150-toast`] = await go()
      facts[`${P}-rows1`] = await sqRows(s); facts[`${P}-places1`] = await placeRows(s)
      facts[`${P}-menu1`] = await menuRows(s)
      await shot(s, `${P}-02-after-150.png`)
    })
    await step('undo redo 150', async () => {
      const t = await s.page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? (b.title || b.getAttribute('aria-label')) : null }); facts[`${P}-undo-title-150`] = t
      const panel = () => s.page.evaluate(() => { const c = document.querySelector('#page-admin .adm-cat.on .adm-cat-l'); return c ? c.textContent.trim() : null })
      facts[`${P}-panel-before-undo`] = await panel()
      await undo(s); facts[`${P}-150-undo-toast`] = await toastText(s)
      facts[`${P}-panel-after-undo`] = await panel(); facts[`${P}-page-after-undo`] = await s.page.evaluate(() => document.querySelector('.page.on').id)
      if (facts[`${P}-panel-after-undo`] !== 'Squadrons') await adminCat(s, 'Squadrons')
      facts[`${P}-rows-undo`] = await sqRows(s); facts[`${P}-places-undo`] = await placeRows(s)
      await shot(s, `${P}-03-after-undo-150.png`)
      await redo(s); facts[`${P}-150-redo-toast`] = await toastText(s)
      facts[`${P}-panel-after-redo`] = await panel()
      if (facts[`${P}-panel-after-redo`] !== 'Squadrons') await adminCat(s, 'Squadrons')
      facts[`${P}-rows-redo`] = await sqRows(s); facts[`${P}-places-redo`] = await placeRows(s)
    })
    for (let n = 151; n <= 150 + N - 3; n++) {   // 142, 149 and 150 stand: up to N in all
      await step(`make ${n}`, async () => { const go = await makeSquadron(s, n, null, 'Hunter · 142'); facts[`${P}-${n}-toast`] = await go() })
    }
    await step('eight in the menu', async () => {
      facts[`${P}-rows-8`] = await sqRows(s)
      await shot(s, `${P}-04-eight-squadrons.png`)
      await s.page.locator('#sqnMenuBtn:visible').first().click(); await s.page.waitForTimeout(300)
      facts[`${P}-menu-8`] = await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()))
      await shot(s, `${P}-05-menu-eight.png`)
      await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(200)
    })
    await step('eight on the bell', async () => {
      await bellOpen(s); facts[`${P}-bell-show-8`] = await text(s, '[data-testid="bell-show"]')
      facts[`${P}-bell-show-over`] = await s.page.evaluate(() => { const r = document.querySelector('[data-testid="bell-show"]'); return r ? { sw: r.scrollWidth, cw: r.clientWidth } : null })
      await shot(s, `${P}-06-bell-eight.png`, ['[data-testid="bell-list"]']); await bellClose(s)
    })
    await step('eight in a row and the filter', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      facts[`${P}-row-lines-8`] = await text(s, '[data-testid="acc-sq"]')
      facts[`${P}-row-fits`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-sq"] button, [data-testid="acc-sq"] .acc-sq-n')].filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent))
      await shot(s, `${P}-07-row-eight.png`, ['[data-testid="acc-sq"]'])
      await s.page.click('#accEdCancel'); await s.page.waitForTimeout(200)
      await s.page.click('#accFilter'); await s.page.waitForTimeout(300)
      facts[`${P}-filter-groups`] = await s.page.evaluate(() => { const p = document.querySelector('#accFilterPanel'); return p ? p.innerText.replace(/\s+/g, ' ').slice(0, 400) : null })
      await shot(s, `${P}-08-filter-eight.png`, ['#accFilterPanel', '#accFilter'])
      // tick 149 in the Squadron group (a master admin's) and read the list
      const t = s.page.locator('#accFilterPanel [data-ftick]', { hasText: /^149$/ })
      if (await t.count()) { await t.first().click(); await s.page.waitForTimeout(300); facts[`${P}-filter-149-showing`] = await s.page.evaluate(() => { const e = document.querySelector('#accShowing, .od-showing'); return e ? e.textContent.trim() : null }); facts[`${P}-filter-149-groups`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-unit-head]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.trim())); await shot(s, `${P}-09-filter-149.png`) }
      await s.page.keyboard.press('Escape')
    })
    await step('a squadron pick at eight', async () => {
      const t0 = Date.now(); await pick(s, '155'); facts[`${P}-pick155-ms`] = Date.now() - t0 - 800
      facts[`${P}-pick155-mark`] = await text(s, '#sqnMenuBtn')
      await adminCat(s, 'Users'); facts[`${P}-users-155-head`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin h4')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
      await shot(s, `${P}-10-users-155.png`)
      await pick(s, '142')
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter squadrons', async () => {
      await adminCat(s, 'Squadrons')
      facts[`${P}-hunter-new-btn`] = await vis(s, '#sqNew')
      facts[`${P}-hunter-rows`] = await sqRows(s); facts[`${P}-hunter-places`] = await placeRows(s)
      await shot(s, `${P}-11-hunter-squadrons.png`)
      await s.page.locator('#sqPlaces [data-place] .acc-tap').first().click(); await s.page.waitForTimeout(400)
      facts[`${P}-hunter-place-why`] = await text(s, '#plWhy'); facts[`${P}-hunter-place-save-off`] = await s.page.evaluate(() => { const b = document.querySelector('#plSave'); return b ? b.disabled : null })
      await shot(s, `${P}-12-hunter-homebase.png`, ['#sqPlaces'])
      // his own squadron's place: open 142's row
      await s.page.locator('#sqList [data-unit="u142"] .acc-tap').first().click().catch(() => note('no 142 tap')); await s.page.waitForTimeout(400)
      facts[`${P}-hunter-142-move`] = await s.page.evaluate(() => { const e = document.querySelector('#sqList [data-unit="u142"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 200) : null })
      await shot(s, `${P}-13-hunter-142-place.png`, ['#sqList'])
      facts[`${P}-hunter-149-tap`] = await s.page.evaluate(() => { const b = document.querySelector('#sqList [data-unit="u149"] button'); return b ? { disabled: b.disabled, title: b.title } : null })
    })
    await s.ctx.close()
  }
} finally { save('w5'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
