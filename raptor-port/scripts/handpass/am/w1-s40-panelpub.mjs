/* w1 · S40 (Fable) — publish an AL from the Amendments panel while the week is scrolled to ANOTHER day.
   Desktop only (the panel is hidden under 820px). Everything week: SUNDAY is at its Original with one change
   waiting ("Sun · 1 change · Publish AL1"). Sign Sunday, scroll the week to Monday, press Sunday's
   "Publish AL1" in the panel.
   RIGHT behaviour: AM25 each day has its own Publish button in the panel; AM1 it publishes that day only;
   the toast names the right day; Sunday's head is updated (AL1, nothing pending) even though it is off screen.
   Also AM25: a day's panel button is LOCKED while an old version of that day is being looked at.
   Usage: node w1-s40-panelpub.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, planMenuItems, planMenuLook, STATE, WIDTHS, checker, toastSpy, toasts, panel, headLine, headN, shotUnion, shotBox } = L
const C = checker('S40 desktop')
const { browser, page, errors } = await open({ ...WIDTHS.desktop, state: STATE })
await toastSpy(page)
await editWeek(page)
const onScreen = () => page.evaluate(() => [...document.querySelectorAll('#eWeek .day')].filter(d => { const r = d.getBoundingClientRect(); return r.right > 40 && r.left < window.innerWidth - 40 }).map(d => d.querySelector('.dow')?.innerText))
// AM25 — the panel's lock while a version is being looked at (Monday)
await planMenuItems(page, 0); await planMenuLook(page, /^Original/)
const Pv = await panel(page)
const monRow = Pv.days.find(d => /^Mon/.test(d.text))
const monTitle = await page.evaluate(() => [...document.querySelectorAll('#alPanel .al-pubday')].find(r => /^Mon/.test(r.innerText))?.querySelector('button')?.title)
C.check('S40.0', monRow && monRow.disabled && /Return to the live copy/.test(monTitle || ''), 'while Monday\'s Original is being looked at, Monday\'s panel button is LOCKED and says why — AM25', { monRow, monTitle })
await page.locator('#eWeek [data-golive="0"]:visible').first().click(); await page.waitForTimeout(500)
// sign Sunday, then scroll the week to Monday
await page.locator('#eWeek .day[data-day="6"]').evaluate(e => e.scrollIntoView({ inline: 'start', block: 'nearest' })); await page.waitForTimeout(300)
await signDay(page, 6)
C.log('Sunday signed', await headLine(page, 6))
await page.locator('#eWeek .day[data-day="0"] .day-head').evaluate(e => e.scrollIntoView({ inline: 'start', block: 'nearest' })); await page.waitForTimeout(400)
const vis0 = await onScreen()
C.log('days on screen before the press', vis0)
const P0 = await panel(page)
C.log('panel before', P0)
const sunBtn = page.locator('#alPanel .al-pubday', { hasText: /^Sun/ }).locator('button').first()
await sunBtn.evaluate(e => e.scrollIntoView({ block: 'center' }))
await sunBtn.click(); await page.waitForTimeout(800)
const t = await toasts(page)
const vis1 = await onScreen()
const hSun = await headN(page, 6), hMon = await headN(page, 0)
C.log('after the panel press', { toasts: t, daysOnScreen: vis1, sun: await headLine(page, 6), mon: await headLine(page, 0) })
C.check('S40.a', !vis0.includes('Sunday'), 'Sunday was OFF screen when the panel button was pressed (the test is real)', vis0)
C.check('S40.b', t.some(x => /^Published AL1 · 1 item on Sun only · approved by \w+/.test(x)), 'the toast names SUNDAY — AM1/AM25', t)
C.check('S40.c', hSun.tag === 'AL1' && !hSun.pending && !hSun.alpub, 'Sunday\'s head (off screen) now reads AL1, nothing pending, no Publish button — AM22/AM15', hSun)
C.check('S40.d', hMon.tag === 'AL1' && hMon.pending === '1 pending', 'Monday is untouched (still AL1 with its change waiting) — AM1', hMon)
const P1 = await panel(page)
C.check('S40.e', !P1.days.some(d => /^Sun/.test(d.text)) && P1.tags.some(x => /^AL1 Sun/.test(x)), 'the panel drops Sunday\'s row and lists "AL1 Sun" among the issued ALs — AM25', P1)
C.note('S40.f', 'did the week jump to Sunday after the press?', JSON.stringify(vis0) === JSON.stringify(vis1) ? 'no — it stayed where it was' : `yes: ${vis1}`)
await shotBox(page, 's40-desktop-1-panel-after', '#alPanel')
await page.locator('#eWeek .day[data-day="6"]').evaluate(e => e.scrollIntoView({ inline: 'start', block: 'nearest' })); await page.waitForTimeout(400)
await shotUnion(page, 's40-desktop-2-sunday-head', ['#eWeek .day[data-day="6"] .day-head'])
C.check('S40.z', !errors.length, 'no console errors', errors)
C.summary()
await browser.close()
