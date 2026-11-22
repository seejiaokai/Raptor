// Walk step 2 — a View holder pressing the edit doors on 149's pages. Saber gives Hunter View of 149 (real presses),
// Hunter signs in on the same page, picks 149 and presses: Admin → Data's two clears (a date picked, then the button),
// the Inputs page's settings gear, Quals' Edit and + Add person (whose people?), the Leave War (whose war?), View-only
// Sched's day "i", "Traffic", a day's title, a puck; Logic's rows; Insights. Then 142 back and the same doors again.
import { serve, stop, newPage, signIn, shot, pick, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, liveControls, toastText } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const opened = s => s.page.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal.on, .win, .sheet, dialog[open], .pop')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 40 && b.height > 40 }).map(e => (e.id || e.className.toString().slice(0, 40)) + ': ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 160)))
async function esc(s) { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300) }

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz)
    const P = `w2-${sz}`
    await signIn(s, 'ad', 'a')
    await step('give view', async () => {
      await adminCat(s, 'Users'); await openRow(s, 'prowler')
      await s.page.click(lineBtn('149', 'view')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    for (const unit of ['149', '142']) {
      const Q = `${P}-${unit}`
      await step(`pick ${unit}`, async () => { await pick(s, unit); facts[`${Q}-mark`] = await text(s, '#sqnMenuBtn') })
      await step(`data clears ${unit}`, async () => {
        await adminCat(s, 'Data')
        await s.page.click('#admWipeDate'); await s.page.waitForTimeout(400)
        await shot(s, `${Q}-01-data-datebox.png`)
        // the app's own date box: press the first enabled day in it
        const day = s.page.locator('.dcal button:not([disabled]), [data-iso]:not([disabled])').filter({ hasText: /^\d{1,2}$/ })
        facts[`${Q}-data-days`] = await day.count()
        if (await day.count()) { await day.nth(Math.min(5, (await day.count()) - 1)).click(); await s.page.waitForTimeout(400) }
        facts[`${Q}-wipe-enabled`] = await s.page.evaluate(() => !document.querySelector('#admWipe').disabled)
        facts[`${Q}-wipe-label`] = await text(s, '#admWipe')
        await s.page.click('#admWipe').catch(e => note('wipe click', String(e).split('\n')[0])); await s.page.waitForTimeout(600)
        facts[`${Q}-wipe-after-press`] = await text(s, '#admWipe'); facts[`${Q}-wipe-toast`] = await toastText(s)
        await shot(s, `${Q}-02-data-after-press.png`, ['#admData'])
      })
      await step(`inputs gear ${unit}`, async () => {
        await navTo(s, 'Inputs')
        facts[`${Q}-inputs-head`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-inputs h1, #page-inputs h2, #page-inputs .pg-sub, #page-inputs .ic-title')].map(e => e.textContent.trim()).slice(0, 4))
        await s.page.locator('#inGear:visible').first().click(); await s.page.waitForTimeout(700)
        facts[`${Q}-gear-window`] = await opened(s)
        const w = await s.page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(e => e.getBoundingClientRect().width > 40).pop(); if (!d) return null
          return { live: [...d.querySelectorAll('button, input, select')].filter(e => !e.disabled && e.getBoundingClientRect().width > 0).map(e => (e.id || '') + ':' + (e.textContent || e.value || '').trim().slice(0, 24)), text: d.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) } })
        facts[`${Q}-gear-detail`] = w
        await shot(s, `${Q}-03-inputs-gear.png`)
        await esc(s)
      })
      await step(`quals ${unit}`, async () => {
        await navTo(s, 'Quals')
        facts[`${Q}-quals-names`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-quals tbody tr')].slice(0, 400).map(r => (r.querySelector('td') || r).textContent.trim()).filter(Boolean).slice(0, 80))
        facts[`${Q}-quals-has-kestrel`] = (facts[`${Q}-quals-names`] || []).some(t => /Kestrel/.test(t))
        facts[`${Q}-quals-has-ranger`] = (facts[`${Q}-quals-names`] || []).some(t => /Ranger/.test(t))
        await shot(s, `${Q}-04-quals.png`)
      })
      await step(`leave war ${unit}`, async () => {
        await navTo(s, 'Leave War'); await s.page.waitForTimeout(800)
        const t = await s.page.evaluate(() => document.querySelector('#page-leavewar') ? document.querySelector('#page-leavewar').textContent : '')
        facts[`${Q}-war-kestrel`] = /Kestrel/.test(t); facts[`${Q}-war-ranger`] = /Ranger/.test(t)
        await shot(s, `${Q}-05-leavewar.png`)
      })
      await step(`viewsched doors ${unit}`, async () => {
        await navTo(s, 'View-only Sched'); await s.page.waitForTimeout(500)
        const tr = s.page.locator('#page-viewsched button:visible', { hasText: 'Traffic' }).first()
        if (await tr.count()) { await tr.click(); await s.page.waitForTimeout(600); facts[`${Q}-traffic-opens`] = await opened(s)
          facts[`${Q}-traffic-live`] = await s.page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], .pop, .tpop')].filter(e => e.getBoundingClientRect().width > 40).pop(); return d ? [...d.querySelectorAll('button, input, select, textarea')].filter(e => !e.disabled && e.getBoundingClientRect().width > 0).map(e => (e.id || '') + ':' + (e.textContent || e.value || '').trim().slice(0, 24)) : null })
          await shot(s, `${Q}-06-traffic.png`); await esc(s) }
        const info = s.page.locator('#page-viewsched .day button:visible', { hasText: /^i$/ }).first()
        if (await info.count()) { await info.click(); await s.page.waitForTimeout(600); facts[`${Q}-dayinfo-opens`] = await opened(s); await shot(s, `${Q}-07-dayinfo.png`); await esc(s) }
        // a puck: press it, then a long press — what does it offer?
        const puck = s.page.locator('#page-viewsched .day .puck:visible, #page-viewsched .day [data-pid]:visible').first()
        if (await puck.count()) { await puck.click(); await s.page.waitForTimeout(600); facts[`${Q}-puck-opens`] = await opened(s); await shot(s, `${Q}-08-puck.png`); await esc(s) }
        // a day's title
        const title = s.page.locator('#page-viewsched .day .dh, #page-viewsched .day header, #page-viewsched .day .day-h').first()
        if (await title.count()) { await title.click(); await s.page.waitForTimeout(700); facts[`${Q}-daytitle-opens`] = await opened(s)
          facts[`${Q}-board-edit-live`] = await s.page.evaluate(() => [...document.querySelectorAll('#sbDone, .sb-edit, [data-sbedit], #sbEdit')].filter(e => e.getBoundingClientRect().width > 0 && !e.disabled).map(e => e.id || e.className))
          await shot(s, `${Q}-09-daytitle.png`); await esc(s) }
      })
      await step(`insights ${unit}`, async () => {
        if (!s.desk) return
        await s.page.click('#insightBtn'); await s.page.waitForTimeout(500)
        facts[`${Q}-insights-items`] = await s.page.evaluate(() => [...document.querySelectorAll('.schedule-moremenu button, .sb-moreitem')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim() + (e.disabled ? ' [off]' : '')))
        await shot(s, `${Q}-10-insights.png`); await esc(s)
      })
    }
    await s.ctx.close()
  }
} finally { save('w2'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
