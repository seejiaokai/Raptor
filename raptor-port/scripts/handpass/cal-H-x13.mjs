/* X-13 — failed persistence stays visible and recoverable with a window open (D641, D586, D587).
   The failed save is forced the way a full disk does it (Storage.prototype.setItem throws a QuotaExceededError) on the
   served build WITHOUT ?fresh=1, after one real write — the recipe of sn-cover.mjs. */
import * as H from './cal-H-lib.mjs'
const SIZE = process.argv[2] || 'desk'
H.setTag('x13' + SIZE)
const touch = !!H.SIZES[SIZE].hasTouch
const { browser, page, errors } = await H.world({ size: SIZE, plain: true })
page.__size = SIZE
const press = loc => (touch ? loc.tap() : loc.click())
const bandInfo = () => page.evaluate(() => {
  const n = document.querySelector('.topbar > .savestat'); if (!n) return { note: null }
  const r = n.getBoundingClientRect(), b = n.querySelector('button'), br = b ? b.getBoundingClientRect() : null
  const at = (x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('.savestat') ? (e.closest('button') ? 'RETRY' : 'band') : (e.closest('[data-testid="win-inputedit"]') ? 'editor window' : (e.closest('[data-testid="win-inputsset"]') ? 'settings window' : (e.id || e.className || e.tagName).toString().slice(0, 40)))) : null }
  return { text: n.textContent.trim(), failed: n.classList.contains('failed'), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], retryBox: br && [Math.round(br.left), Math.round(br.top), Math.round(br.width), Math.round(br.height)],
    atBandMid: at(r.left + r.width / 2, r.top + r.height / 2), atRetry: br ? at(br.left + br.width / 2, br.top + br.height / 2) : null, sideways: document.documentElement.scrollWidth > innerWidth,
    inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, topbarH: Math.round(document.querySelector('.topbar').getBoundingClientRect().height) }
})
const failOn = () => page.evaluate(() => { window.__lsSetWas = window.__lsSetWas || Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') } })
const armRestoreOnRetry = () => page.evaluate(() => { const arm = e => { if (!e.target.closest('.savestat button, .saveband button')) return; Storage.prototype.setItem = window.__lsSetWas; document.removeEventListener('pointerdown', arm, true) }; document.addEventListener('pointerdown', arm, true) })
const rowsHave = async re => page.evaluate(s => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; if (k.startsWith('raptor:') && new RegExp(s).test(v)) n++ } return n }, re.source)
const X = s => page.evaluate(r => window.INPUTS.filter(x => new RegExp(r).test(x.remarks || '')).map(x => [x.person, x.grp || '', x.type, x.date].join('|')), s)
const pics = []

// 1. one real write (a solo input) — must persist
await H.inputsMonth(page, 2026, 7)
await H.fileSolo(page, { iso: '2026-07-16', type: 'Appointment', remarks: 'X13 first' })
await H.sleep(1800)
const firstSaved = await rowsHave(/X13 first/)
const band0 = await bandInfo()
pics.push(await H.pic(page, '1-first-write-saved'))
H.judge(`X-13 ${SIZE} step 1`, 'one real write: filed a solo Appointment through the editor on the plain address (not ?fresh=1)', [
  ['the input is in browser storage (a real save)', firstSaved >= 1, firstSaved], ['no failed-save note is up', !band0.failed, band0],
], [pics[0]])

// 2. the editor window open, storage refuses, Save pressed
await H.openNewInput(page, '2026-07-17')
await page.selectOption('#inpEditType', 'Meeting')
await press(page.locator('#inpEditPop [data-testid="pp-several"]')); await H.sleep(250)
for (const cs of ['Ranger', 'Drifter', 'Ace']) { const pid = await H.pidOf(page, cs); const b = page.locator(`#inpEditPop [data-testid="pp"] [data-pp="${pid}"]`).first(); await b.scrollIntoViewIfNeeded(); await press(b); await H.sleep(120) }
await page.fill('#inpEditRmk', 'X13 group')
await failOn()
await H.toastSpy(page)
const sv = page.locator('#inpEditSave'); await sv.scrollIntoViewIfNeeded()
pics.push(await H.pic(page, '2a-editor-before-save'))
await press(sv); await H.sleep(1800)
const band1 = await bandInfo()
const toast1 = await H.toasts(page)
const edOpen = await page.locator('[data-testid="win-inputedit"]').count()
const mem = await X('X13 group'), disk = await rowsHave(/X13 group/)
pics.push(await H.pic(page, '2b-after-failed-save'))
H.judge(`X-13 ${SIZE} step 2`, 'the editor window open on a short screen, storage refusing writes; pressed the editor\'s Save for a 3-person Meeting', [
  ['the failure is shown ("Not saved") with a Retry', band1.failed && /Not saved/i.test(band1.text) && !!band1.retryBox, band1],
  ['the warning is whole on screen and the page does not slide sideways', band1.inView && !band1.sideways, { inView: band1.inView, sideways: band1.sideways }],
  ['a press on Retry\'s middle lands on Retry (nothing covers it)', band1.atRetry === 'RETRY', band1.atRetry],
  ['the app does not say it saved: no toast claims "Saved"', !toast1.some(t => /^saved|saved\b/i.test(t) && !/not saved/i.test(t)), toast1],
  ['the work is not discarded: the 4 records (Saber, Ranger, Drifter, Ace) are held in the page', mem.length === 4, mem],
  ['and are NOT on disk yet', disk === 0, disk],
], [pics[1], pics[2]], { band1, toast1, edOpen })

// the day window that opens after a save is a window too: if it lies over Retry, close it to carry on (and say so)
const dayWinOpen = await page.locator('[data-testid="win-inputsday"]').count()
let afterClose = null
if (dayWinOpen && band1.atRetry !== 'RETRY') {
  await press(page.locator('[data-testid="win-inputsday-x"]')); await H.sleep(500)
  afterClose = await bandInfo()
  pics.push(await H.pic(page, '2c-day-window-closed'))
  H.judge(`X-13 ${SIZE} step 2b`, 'the opened-day window lay over Retry; closed it with its cross and read the band again', [
    ['after closing the window a press on Retry lands on Retry', afterClose.atRetry === 'RETRY', afterClose.atRetry],
  ], [pics[pics.length - 1]], { afterClose })
}
// 3. a window open while the band is up: the Inputs settings window
await press(page.locator('[data-testid="in-gear"]')); await H.sleep(600)
const setWin = await page.locator('[data-testid="win-inputsset"]').count()
const band2 = await bandInfo()
pics.push(await H.pic(page, '3-settings-over-band'))
const sw = page.locator('[data-testid="iset-memberfile"]')
const swBefore = await sw.count() ? await sw.isChecked() : null
H.judge(`X-13 ${SIZE} step 3`, 'with the warning up, opened the Inputs settings window (the gear)', [
  ['the settings window opened', setWin === 1, setWin],
  ['Retry is still the thing a press lands on (the window does not cover it)', band2.atRetry === 'RETRY', band2],
  ['the failure band is still whole on screen', band2.inView, band2.box],
], [pics[3]], { band2, swBefore })
// close that window without a change
await press(page.locator('[data-testid="iset-cancel"]')).catch(() => {}); await H.sleep(400)

// 4. Retry, with storage working again from the press on Retry
await armRestoreOnRetry()
const rb = await page.locator('.topbar > .savestat button').boundingBox()
await press(page.locator('.topbar > .savestat button'))
const gone = await page.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 9000 }).then(() => true, () => false)
await H.sleep(800)
const disk2 = await rowsHave(/X13 group/)
pics.push(await H.pic(page, '4-after-retry'))
H.judge(`X-13 ${SIZE} step 4`, 'pressed Retry (storage working again from that press)', [
  ['Retry is a pressable size', !!rb && rb.width >= 24 && rb.height >= 20, rb && [Math.round(rb.width), Math.round(rb.height)]],
  ['the warning goes', gone, gone],
  ['the 4 records are now on disk', disk2 >= 4, disk2],
], [pics[4]])

// 5. reload: exactly one saved result
await page.reload(); await H.signIn(page, 'ad')
const afterReload = await X('X13 group'), once = await X('X13 first')
await H.inputsMonth(page, 2026, 7)
pics.push(await H.pic(page, '5-after-reload'))
H.judge(`X-13 ${SIZE} step 5`, 'reloaded the page (plain address) and signed in again', [
  ['exactly ONE shared input of 4 records (Saber + 3), one group id', afterReload.length === 4 && new Set(afterReload.map(s => s.split('|')[1])).size === 1, afterReload],
  ['the first write is there exactly once', once.length === 1, once],
  ['no duplicate from the retry', afterReload.length === 4, afterReload.length],
], [pics[5]])

// 6. the settings window: change the switch, Save while storage refuses, Retry, reload
await press(page.locator('[data-testid="in-gear"]')); await H.sleep(600)
const sw2 = page.locator('[data-testid="iset-memberfile"]')
const before = await sw2.isChecked()
await failOn()
await press(sw2); await H.sleep(250)
pics.push(await H.pic(page, '6a-settings-changed'))
await press(page.locator('[data-testid="iset-save"]')); await H.sleep(1800)
const band3 = await bandInfo()
pics.push(await H.pic(page, '6b-settings-failed-save'))
const winStill = await page.locator('[data-testid="win-inputsset"]').count()
await armRestoreOnRetry()
await press(page.locator('.topbar > .savestat button'))
const gone2 = await page.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 9000 }).then(() => true, () => false)
await page.reload(); await H.signIn(page, 'ad'); await H.go(page, 'inputs')
await press(page.locator('[data-testid="in-gear"]')); await H.sleep(600)
const sw3 = page.locator('[data-testid="iset-memberfile"]')
const afterSw = await sw3.isChecked()
pics.push(await H.pic(page, '6c-settings-after-reload'))
H.judge(`X-13 ${SIZE} step 6`, 'settings window: flipped "Members may file duties and commitments for other people", Save with storage refusing, then Retry, then reload', [
  ['the failure is shown with Retry reachable', band3.failed && band3.atRetry === 'RETRY' && band3.inView, band3],
  ['Retry saves and the note goes', gone2, gone2],
  ['after reload the switch holds the changed value (it differs from before)', String(afterSw) !== String(before), { before, afterSw }],
], [pics[7], pics[8], pics[9]], { winStill })
console.log('ERRORS', errors)
H.save('x13-' + SIZE, { errors, picCount: H.picCount() })
await browser.close()
