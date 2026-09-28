/* [TRK-LEFTOVERS] baseline — J: a "+ Add" dialog (Students card) left OPEN
   while the squadron roster changes elsewhere — does it show the new person
   when you come back? (w3 O3). Adapted from trk-w3-09-roster.mjs, which was
   already moved to the one door for a new person (Quals' "+ Add person" is a
   button to Admin → Users, D217). Desktop 1440x900, admin, a fresh browser.
   First: can a POINTER reach the nav while the dialog is open (its grey shade),
   or only the keyboard? */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep } from './trk-w3-lib.mjs'

const L = log()
const addList = page => page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item')].map(b => (b.querySelector('.dlg-lbl').textContent + ' ' + ((b.querySelector('.dlg-sub') || {}).textContent || '')).trim()))
const toastText = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' })
const { browser, page, errors } = await open({ size: DESK, who: 'a' })

await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
const l0 = await addList(page)
L.note('J.1 + Add lists', `${l0.length} people; first ${l0.slice(0, 3).join(' | ')}`)
await shot(page, 'lo-J-1-add-open')
/* what a pointer press on the Quals nav tab would land on while the dialog is open */
const cover = await page.evaluate(() => {
  const a = document.querySelector('#topnav a[data-page="quals"]'); const r = a.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { hit: hit ? hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') + (typeof hit.className === 'string' && hit.className ? '.' + hit.className.trim().split(/\s+/).join('.') : '') : null, isTab: hit === a || a.contains(hit) }
})
L.note('J.2 a pointer press on the Quals tab while + Add is open would land on', JSON.stringify(cover))
/* by keyboard, as w3 did */
await page.focus('#topnav a[data-page="quals"]'); await page.keyboard.press('Enter'); await page.waitForFunction(() => window.CURPAGE === 'quals'); await sleep(400)
L.note('J.3 keyboard: focus the Quals tab + Enter → page', await page.evaluate(() => window.CURPAGE))
await shot(page, 'lo-J-2-quals')
await page.click('#qAddToggle'); await page.waitForFunction(() => window.CURPAGE === 'admin'); await sleep(500)
await page.fill('#accAddCs', 'ZULU9'); await page.fill('#accAddIni', 'ZZ')
const seatOpts = await page.evaluate(() => [...document.querySelectorAll('#accAddSeat option')].map(o => o.value + '=' + o.textContent))
const pilot = await page.evaluate(() => { const o = [...document.querySelectorAll('#accAddSeat option')].find(o => /pilot/i.test(o.textContent)); return o ? o.value : null })
if (pilot) await page.selectOption('#accAddSeat', pilot); await sleep(100)
const ocu = await page.evaluate(() => { const o = [...document.querySelectorAll('#accAddCat option')].find(o => /OCU/.test(o.textContent) || o.value === 'OCU'); return o ? o.value : null })
if (ocu) await page.selectOption('#accAddCat', ocu)
await shot(page, 'lo-J-3-admin-add-filled')
await page.click('#accAdd'); await sleep(500)
L.note('J.4 Admin → Users: Add a person ZULU9 (Pilot, OCU), no sign-in; seats ' + seatOpts.join(', '), 'toast: ' + await toastText(page))
await page.click('#topnav a[data-page="tracker"]'); await page.waitForFunction(() => window.CURPAGE === 'tracker'); await sleep(600)
const stillOpen = await page.locator('#dlgModal').isVisible().catch(() => false)
const lOpen = stillOpen ? await addList(page) : []
L.note('J.5 back on the Tracker: the + Add dialog still open?', String(stillOpen) + ` · ${lOpen.length} rows · ZULU9 listed: ${lOpen.some(x => /ZULU9/.test(x))}`)
L.ok('J.6 the dialog left open shows the new person (ZULU9)', lOpen.some(x => /ZULU9/.test(x)), `${lOpen.length} rows (was ${l0.length}); ZULU9 ${lOpen.some(x => /ZULU9/.test(x)) ? 'listed' : 'NOT listed'}`)
await shot(page, 'lo-J-4-dialog-left-open')
await page.click('#dlgCancel').catch(() => {}); await sleep(250)
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
const l1 = await addList(page)
const zi = l1.findIndex(x => /ZULU9/.test(x))
L.note('J.7 closed and reopened: + Add lists ZULU9?', zi >= 0 ? `row ${zi + 1} of ${l1.length}: ${l1[zi]}` : `not listed (${l1.length} rows)`)
await shot(page, 'lo-J-5-reopened')
await page.click('#dlgCancel').catch(() => {}); await sleep(200)

save('lo-F-roster', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
