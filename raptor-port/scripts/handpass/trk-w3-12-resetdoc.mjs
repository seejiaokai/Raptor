/* w3 item 12 — Fable #44 (predicted trap): on a ball YOU made (arrange →
   + Acad), fill its details (Name, Crew) → Save → open again → "Reset to doc".
   There is no source document for a ball the user made — what does the button
   do to what was typed? Walked through the pop-up's ✎ Edit details AND Show
   All's own inline editor. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg } from './trk-w3-lib.mjs'

const L = log()
const saRow = (page, id) => page.evaluate(id => { const r = [...document.querySelectorAll('#saBody .sarow')].find(x => x.querySelector('.sid').textContent.trim() === id); return r ? r.innerText.replace(/\s+/g, ' ').slice(0, 200) : null }, id)
const fields = page => page.evaluate(() => ({ name: (document.getElementById('ifName') || {}).value, fmt: (document.getElementById('ifFmt') || {}).value, hrs: (document.getElementById('ifHrs') || {}).value, crew: (document.getElementById('ifCrew') || {}).value, pre: (document.getElementById('ifPre') || {}).value }))

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
/* make a ball: arrange → + Acad "MY-01" → Done → Save changes */
await menuItem(page, 'syl', 'arrangeBtn')
await page.locator('#arrTools button', { hasText: '+ Acad' }).click(); await sleep(300)
const ask = await dlg(page, { value: 'MY-01' }); await sleep(400)
L.note('+ Acad asked', ask.text.replace(/\s+/g, ' '))
await menuItem(page, 'syl', 'arrangeBtn')
if (await page.locator('#saveChanges').count()) { await page.click('#saveChanges'); await sleep(500) }
L.note('saved', await page.locator('#saveStat').innerText())
/* fill its details through the pop-up's ✎ Edit details */
await tapBall(page, 'MY-01')
await page.click('#popEditInfo'); await page.waitForSelector('#infoModal', { state: 'visible' }); await sleep(250)
L.note('the details window for MY-01 opens with', JSON.stringify(await fields(page)) + ' · Reset button title: ' + await page.getAttribute('#ifReset', 'title'))
await page.fill('#ifName', 'My own lecture'); await page.fill('#ifHrs', '2.0 Hrs'); await page.fill('#ifCrew', 'IP / UP')
await page.click('#ifSave'); await sleep(500)
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
L.ok('the details are saved (Show All shows them)', /My own lecture/.test(await saRow(page, 'MY-01') || ''), await saRow(page, 'MY-01'))
await page.click('#saClose'); await sleep(250)
/* open again → Reset to doc */
await tapBall(page, 'MY-01')
await page.click('#popEditInfo'); await page.waitForSelector('#infoModal', { state: 'visible' }); await sleep(250)
L.note('reopened, the window shows', JSON.stringify(await fields(page)))
await page.click('#ifReset'); await sleep(500)
const q = await page.locator('#dlgModal').isVisible().catch(() => false)
L.note('Reset to doc — did it ask first?', q ? 'yes: ' + await page.locator('#dlgMsg').innerText() : 'no question')
const after = await fields(page)
L.note('Reset to doc — the window now shows', JSON.stringify(after))
await shot(page, 'w3-12-after-reset-to-doc')
await page.click('#ifCancel'); await sleep(300)
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
const row = await saRow(page, 'MY-01')
L.ok('Reset to doc on a ball the user made keeps what they typed (there is no document to go back to) — or at least asks first', /My own lecture/.test(row || '') || q, `after Reset + Cancel, Show All reads: ${row}`)
await shot(page, 'w3-12-showall-after-reset')
/* the undo arrow: can it take the wipe back? */
L.note('the ↶ arrow after the wipe', JSON.stringify(await page.evaluate(() => { const b = document.getElementById('trUndoBtn'); return { disabled: b.disabled, title: b.title } })))
/* the same through Show All's own inline editor */
const edit = page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: /^MY-01$/ }) }).locator('.sedit')
await edit.click(); await sleep(250)
await page.locator('#saBody .saedit input').first().fill('Typed again'); await page.locator('#saBody .saedit button', { hasText: /^Save$/ }).click(); await sleep(500)
L.note('Show All inline editor: saved', await saRow(page, 'MY-01'))
await edit.click(); await sleep(250)
await page.locator('#saBody .saedit button', { hasText: 'Reset to doc' }).click(); await sleep(500)
const inl = await page.evaluate(() => [...document.querySelectorAll('#saBody .saedit input, #saBody .saedit textarea')].map(i => i.value))
L.note('Show All inline "Reset to doc" — the editor now shows', JSON.stringify(inl))
await page.locator('#saBody .saedit button', { hasText: 'Cancel' }).click(); await sleep(300)
L.note('…after Cancel the row reads', await saRow(page, 'MY-01'))
await shot(page, 'w3-12-showall-inline-after-reset')
L.note('errors', errors.join(' | ') || 'none')
save('w3-12-resetdoc', { rows: L.rows })
await browser.close()
