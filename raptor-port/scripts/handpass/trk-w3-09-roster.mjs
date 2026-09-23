/* w3 item 9 — the squadron roster changing while the Tracker is open
   (Fable #35, Astra #40, #41; R31, R34).
   Add a person on the Quals page → + Add lists them (also: a + Add dialog
   left OPEN across the trip); pick them (a LINKED student, dot + tooltip);
   rename their callsign on Quals → the chip's tooltip vs the student's label;
   archive them → the chip's dot/tooltip, + Add no longer lists them, typing
   the old callsign lands on the same student; restore them → the link back. */
import { open, shot, save, log, toTracker, DESK } from './trk-lib.mjs'
import { sleep, dlgText } from './trk-w3-lib.mjs'

const L = log()
const addList = page => page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item')].map(b => (b.querySelector('.dlg-lbl').textContent + ' ' + ((b.querySelector('.dlg-sub') || {}).textContent || '')).trim()))
const chips = page => page.evaluate(() => [...document.querySelectorAll('#side .c-students .chip')].map(c => ({ text: c.innerText.replace(/[✎×]/g, '').replace(/\s+/g, ' ').trim(), linked: c.classList.contains('linked'), title: c.title || '' })))
const toQuals = async page => { await page.click('#topnav a[data-page="quals"]'); await page.waitForFunction(() => window.CURPAGE === 'quals'); await sleep(400) }
const toastText = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' })
const qualsEditing = async (page, on) => { const btn = on ? '#qEdit' : '#qSave'; if (await page.locator(btn + ':visible').count()) { await page.click(btn); await sleep(300) } }
const csInput = (page, cs) => page.locator('#qtbl input[data-cs]').filter({ has: page.locator(`xpath=self::*[@value="${cs}"]`) })

const { browser, page, errors } = await open({ size: DESK, who: 'a' })

/* 1. what + Add offers today */
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
const l0 = await addList(page)
L.note('1. + Add lists', `${l0.length} people; first: ${l0.slice(0, 5).join(' | ')}; last: ${l0.slice(-2).join(' | ')}`)
L.ok('1. the list has its heading, search box and the type-a-callsign box', (await page.locator('.dlg-listtitle').innerText().catch(() => '')).length > 0 && await page.locator('#dlgFilter').isVisible() && await page.locator('#dlgInput').isVisible(), (await page.locator('.dlg-listtitle').innerText().catch(() => '')) + ' · ' + (await page.getAttribute('#dlgInput', 'placeholder')))
await shot(page, 'w3-09-1-add-dialog')
/* 2. leave it OPEN and go to the Quals page by keyboard (the dialog's scrim covers the nav for a pointer) */
await page.focus('#topnav a[data-page="quals"]'); await page.keyboard.press('Enter'); await page.waitForFunction(() => window.CURPAGE === 'quals'); await sleep(400)
if (!(await page.locator('#qCS').isVisible().catch(() => false))) { await page.click('#qAddToggle'); await sleep(250) }
await page.fill('#qCS', 'ZULU9'); await page.fill('#qInitials', 'ZZ'); await page.selectOption('#qSeat', 'FCP'); await sleep(100)
if (await page.locator('#qLevel').count()) await page.selectOption('#qLevel', 'OCU')
await page.click('#qAddPerson'); await sleep(400)
L.note('2. Quals: + Add person ZULU9 (Pilot, OCU)', await toastText(page))
await page.click('#topnav a[data-page="tracker"]'); await page.waitForFunction(() => window.CURPAGE === 'tracker'); await sleep(500)
const lOpen = await addList(page)
L.note('2. the + Add dialog left OPEN across the trip — lists ZULU9?', (lOpen.some(x => /ZULU9/.test(x)) ? 'YES' : 'no (the old list)') + ` · ${lOpen.length} rows`)
await shot(page, 'w3-09-2-dialog-left-open')
await page.click('#dlgCancel'); await sleep(250)
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
const l1 = await addList(page)
const zi = l1.findIndex(x => /ZULU9/.test(x))
L.ok('2. reopened, + Add lists ZULU9 (OCU pilots first)', zi >= 0, `row ${zi + 1} of ${l1.length}: ${l1[zi]}; rows 1-4: ${l1.slice(0, 4).join(' | ')}`)
/* 3. pick them: search, Enter picks the sole match */
await page.click('#dlgFilter'); await page.keyboard.type('zulu9', { delay: 30 }); await sleep(250)
const shown = await addList(page)
await page.keyboard.press('Enter'); await sleep(700)
const c3 = await chips(page)
const z = c3.find(c => /ZULU9/.test(c.text))
L.ok('3. search "zulu9" + Enter adds ZULU9, upper-cased, as a LINKED chip with the tooltip', shown.length === 1 && z && z.linked && /On the squadron roster as ZULU9/.test(z.title), `${JSON.stringify(shown)} → ${JSON.stringify(z)}`)
await shot(page, 'w3-09-3-linked-chip', { el: '#side .c-students' })
/* 4. rename the callsign on the Quals page */
await toQuals(page); await qualsEditing(page, true)
await page.fill('#qFilter', 'ZULU9'); await sleep(300)
const inp = page.locator('#qtbl input[data-cs]').first()
L.note('4. Quals edit mode — the callsign box found', await inp.inputValue().catch(() => 'none'))
await inp.fill('YANKEE9'); await inp.press('Enter'); await page.locator('#qFilter').click(); await sleep(400)
L.note('4. Quals said', await toastText(page))
await page.fill('#qFilter', ''); await sleep(200)
await toTracker(page)
const c4 = (await chips(page)).find(c => /ZULU9|YANKEE9/.test(c.text))
L.note('4. the chip after the rename', JSON.stringify(c4))
L.ok('4. the student\'s label stays ZULU9 while the tooltip names the new callsign (label ≠ link, by design)', c4 && /ZULU9/.test(c4.text) && /YANKEE9/.test(c4.title), JSON.stringify(c4))
await shot(page, 'w3-09-4-after-rename', { el: '#side .c-students' })
const crew4 = await page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
L.note('4. the Crew dropdown reads', crew4.join(', '))
/* 5. archive them */
await toQuals(page); await qualsEditing(page, true)
await page.fill('#qFilter', 'YANKEE9'); await sleep(300)
await page.locator('#qtbl .qarch').first().click(); await sleep(500)
L.note('5. Quals: archived — the Archived section', (await page.locator('#qArchToggle').innerText().catch(() => 'none')))
await page.fill('#qFilter', ''); await sleep(200)
await qualsEditing(page, false)
await toTracker(page)
const c5 = (await chips(page)).find(c => /ZULU9|YANKEE9/.test(c.text))
L.note('5. the chip after the archive', JSON.stringify(c5))
L.ok('5. the chip is still there with its marks, but no longer claims the roster link', c5 && !c5.linked && !c5.title, JSON.stringify(c5))
await shot(page, 'w3-09-5-after-archive', { el: '#side .c-students' })
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
const l5 = await addList(page)
L.ok('5. + Add no longer lists the archived person', !l5.some(x => /YANKEE9|ZULU9/.test(x)), `${l5.length} rows`)
/* typing the student's own name lands on the SAME student */
const n0 = (await chips(page)).length
await page.fill('#dlgInput', 'zulu9'); await page.click('#dlgOk'); await sleep(700)
const q5 = await dlgText(page)
const n1 = (await chips(page)).length
L.ok('5. typing "zulu9" in the box lands on the existing student — no second ZULU9', n1 === n0, `chips ${n0} → ${n1}${q5 ? ' · asked: ' + q5 : ''} · status "${await page.locator('#saveStat').innerText()}"`)
if (q5) await page.keyboard.press('Escape')
/* 6. restore them */
await toQuals(page)
if (await page.locator('#qArchToggle').isVisible().catch(() => false)) { await page.click('#qArchToggle'); await sleep(250) }
await page.locator('#qArchive .qarchrow').filter({ hasText: 'YANKEE9' }).locator('.qrestore').click().catch(e => L.note('6. restore failed', e.message.slice(0, 80)))
await sleep(400)
L.note('6. Quals said', await toastText(page))
await toTracker(page)
const c6 = (await chips(page)).find(c => /ZULU9|YANKEE9/.test(c.text))
L.ok('6. restored: the chip is linked again (dot + tooltip)', c6 && c6.linked && /YANKEE9/.test(c6.title), JSON.stringify(c6))
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
await page.click('#dlgFilter'); await page.keyboard.type('yankee', { delay: 30 }); await sleep(250)
await page.keyboard.press('Enter'); await sleep(700)
const c7 = await chips(page)
L.ok('6. picking YANKEE9 again from + Add lands on the same student (the person link) — no duplicate', c7.filter(c => /ZULU9|YANKEE9/.test(c.text)).length === 1, JSON.stringify(c7) + ' · status "' + await page.locator('#saveStat').innerText() + '"')
await shot(page, 'w3-09-6-after-restore', { el: '#side .c-students' })
L.note('errors', errors.join(' | ') || 'none')
save('w3-09-roster', { rows: L.rows })
await browser.close()
