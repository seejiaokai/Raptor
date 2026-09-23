/* w3 item 17 — the member walk-through (R2, owner 7 Sep 26 "second word"):
   as us/us every door works — marking, Edit chart layout, both ✎ menus,
   students, dates, pace, lulls, Show All, event details. The ⇪ File menu is
   absent on this build; under D121 (owner, 23 Sep 26) a member gets File too,
   so its absence here is the superseded rule, not a finding. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg, dlgText, pickFrom } from './trk-w3-lib.mjs'

const L = log()
const clean = s => (s || '').replace(/\s+/g, ' ')
const wedges = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null }, id)
const opts = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel + ' option')].map(o => o.textContent), sel)
const chipsText = page => page.evaluate(() => [...document.querySelectorAll('#side .c-students .chip')].map(c => c.innerText.replace(/[✎×]/g, '').replace(/\s+/g, ' ').trim()))

const { browser, page, errors } = await open({ size: DESK, who: 'u' })
L.ok('member: signed in as a member and on the Tracker', /member/i.test(await page.locator('#roleBadge').innerText()) && await page.evaluate(() => window.CURPAGE) === 'tracker', await page.locator('#roleBadge').innerText())
L.note('member: ⇪ File on the bar?', (await page.locator('#fileMenuBtn').count()) ? 'shown' : 'absent — the pre-D121 rule on this build (superseded, not a finding)')
await shot(page, 'w3-17-member-bar', { el: '#page-tracker header' })

/* marking + failures + undo */
const w0 = await wedges(page, 'ST-01')
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
L.ok('marking: DCO on ST-01', JSON.stringify(await wedges(page, 'ST-01')) !== JSON.stringify(w0), `${JSON.stringify(w0)} → ${JSON.stringify(await wedges(page, 'ST-01'))}`)
await tapBall(page, 'ST-02'); await page.click('#popFailPlus'); await sleep(300)
L.ok('marking: + a failure on ST-02', (await page.locator('#failCount').innerText()) === '1', await page.locator('#failCount').innerText())
await page.keyboard.press('Escape'); await sleep(200)
L.ok('undo is there for the member (↶ lit, names the step)', !(await page.locator('#trUndoBtn').isDisabled()), await page.getAttribute('#trUndoBtn', 'title'))

/* Edit chart layout */
await menuItem(page, 'syl', 'arrangeBtn')
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'MEM-T' }); await sleep(300)
await menuItem(page, 'syl', 'arrangeBtn')
await page.click('#saveChanges'); await sleep(400)
L.ok('Edit chart layout: + Test → ✓ Save changes', (await page.locator('#flowSvg .ball[data-id="MEM-T"]').count()) === 1 && !(await page.locator('#saveChanges').count()), clean(await page.locator('#saveStat').innerText()))

/* Course ✎ */
await menuItem(page, 'course', 'addCourse'); await dlg(page, { value: 'memc' }); await sleep(700)
L.ok('Course ✎: + Add course', (await page.locator('#courseSel option:checked').innerText()) === 'MEMC', await page.locator('#courseSel option:checked').innerText())
await menuItem(page, 'course', 'renCourse'); await dlg(page, { value: 'memc2' }); await sleep(500)
L.ok('Course ✎: ✎ Rename course', (await page.locator('#courseSel option:checked').innerText()) === 'MEMC2', await page.locator('#courseSel option:checked').innerText())
await menuItem(page, 'course', 'ordCourse'); await page.waitForSelector('#ordModal', { state: 'visible' })
await page.locator('#ordList .ordrow').nth(0).locator('button[title="Move down"]').click(); await page.click('#ordSave'); await sleep(400)
L.ok('Course ✎: ⇅ Reorder courses', (await opts(page, '#courseSel'))[1] === 'MEMC2', JSON.stringify(await opts(page, '#courseSel')))
await menuItem(page, 'course', 'delCourse'); const dq = await dlgText(page); await page.click('#dlgOk'); await sleep(700)
L.ok('Course ✎: 🗑 Delete course', !(await opts(page, '#courseSel')).includes('MEMC2'), `${clean(dq)} → ${JSON.stringify(await opts(page, '#courseSel'))}`)

/* Syllabus ✎ */
await menuItem(page, 'syl', 'renSyl'); await dlg(page, { value: '2026 M' }); await sleep(500)
L.ok('Syllabus ✎: ✎ Rename syllabus', /^2026 M/.test(await page.locator('#sylSel option:checked').innerText()), await page.locator('#sylSel option:checked').innerText())
await menuItem(page, 'syl', 'dupSyl'); await dlg(page, { ok: true }); await sleep(900)
const dupName = await page.locator('#sylSel option:checked').innerText()
L.ok('Syllabus ✎: ⧉ Duplicate syllabus', /copy/.test(dupName), dupName)
await menuItem(page, 'syl', 'delSyl'); await page.click('#dlgOk'); await sleep(900)
L.ok('Syllabus ✎: 🗑 Delete syllabus (the copy)', !(await opts(page, '#sylSel')).some(o => /copy/.test(o)), JSON.stringify(await opts(page, '#sylSel')))
await menuItem(page, 'syl', 'addSyl'); await dlg(page, { value: 'MEMSYL' }); await sleep(900)
L.ok('Syllabus ✎: + Add syllabus', /^MEMSYL/.test(await page.locator('#sylSel option:checked').innerText()), await page.locator('#sylSel option:checked').innerText())
await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' })
await page.locator('#ordList .ordrow').last().locator('button[title="Move up"]').click(); await page.click('#ordSave'); await sleep(400)
L.ok('Syllabus ✎: ⇅ Reorder syllabi', true, JSON.stringify(await opts(page, '#sylSel')))
await menuItem(page, 'syl', 'delSyl'); await page.click('#dlgOk'); await sleep(900)
await pickFrom(page, '#sylSel', /^2026 M/)

/* students */
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(200)
const first = await page.locator('#dlgList .dlg-item .dlg-lbl').first().innerText()
await page.locator('#dlgList .dlg-item').first().click(); await sleep(700)
L.ok(`students: + Add (roster pick ${first})`, (await chipsText(page)).some(c => c.includes(first.toUpperCase())), JSON.stringify(await chipsText(page)))
await page.locator('#side .c-students .chip').filter({ hasText: first.toUpperCase() }).locator('.ren').click(); await dlg(page, { value: 'member renamed' }); await sleep(500)
L.ok('students: ✎ rename', (await chipsText(page)).some(c => c.includes('MEMBER RENAMED')), JSON.stringify(await chipsText(page)))
await page.click('#ordCrew'); await page.waitForSelector('#ordModal', { state: 'visible' })
await page.locator('#ordList .ordrow').nth(0).locator('button[title="Move down"]').click(); await page.click('#ordSave'); await sleep(500)
L.ok('students: ⇅ Reorder crew', (await chipsText(page))[0] !== '1 STUDENT A', JSON.stringify(await chipsText(page)))
await page.locator('#side .c-students .chip').filter({ hasText: 'MEMBER RENAMED' }).locator('.x').click(); const rq = await dlgText(page); await page.click('#dlgOk'); await sleep(600)
L.ok('students: × remove (asks first)', !(await chipsText(page)).some(c => c.includes('MEMBER RENAMED')), clean(rq))
await pickFrom(page, '#activeSel', /^STUDENT A$/)

/* dates, pace */
await page.fill('#lastSyll', '2026-09-20'); await page.fill('#downDays', '2'); await page.fill('#upchit', '2026-09-22'); await sleep(400)
L.ok('dates: Last Flown (Syllabus), down days, upchit take', (await page.inputValue('#lastSyll')) === '2026-09-20' && (await page.inputValue('#downDays')) === '2', clean(await page.locator('#side .c-curr .curKv').innerText()))
await page.fill('#epwIn', '3'); await page.fill('#targetIn', '2027-06-30'); await page.fill('#targetIn2', '2027-09-30'); await sleep(400)
L.ok('pace: Set pace, End date A, End date B take', (await page.inputValue('#epwIn')) === '3' && (await page.inputValue('#targetIn')) === '2027-06-30', clean(await page.locator('#side .c-pace .paceGrid').innerText()))

/* lulls */
await page.click('#setLullBtn'); await page.waitForSelector('#lullCal', { state: 'visible' })
const days = page.locator('#lullCal .day:not(.out)')
await days.nth(9).click(); await sleep(150); await days.nth(14).click(); await sleep(400)
L.ok('lulls: + Set lull period (two clicks)', !(await page.locator('#lullCal').count()) && !(await page.locator('#lullChips').innerText()).includes('none'), clean(await page.locator('#lullChips').innerText()))
await page.click('#copyLullBtn'); await page.waitForSelector('#lullCopy', { state: 'visible' })
await page.locator('#lullCopy input[type=checkbox]').first().check(); await page.click('#lullCopyOk'); await sleep(500)
await pickFrom(page, '#activeSel', /^STUDENT B$/)
L.ok('lulls: Copy to… STUDENT B', !(await page.locator('#lullChips').innerText()).includes('none'), clean(await page.locator('#lullChips').innerText()))
await pickFrom(page, '#activeSel', /^STUDENT A$/)

/* Show All inline edit, event details, details mode */
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' })
await page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: /^ST-02$/ }) }).locator('.sedit').click(); await sleep(200)
await page.locator('#saBody .saedit input').nth(2).fill('0.7 Hrs'); await page.locator('#saBody .saedit button', { hasText: /^Save$/ }).click(); await sleep(400)
L.ok('Show All: Edit → hours saved', /0\.7 Hrs/.test(await page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: /^ST-02$/ }) }).innerText()), '')
await page.click('#saClose'); await sleep(200)
await tapBall(page, 'ACG-01'); await page.click('#popEditInfo'); await page.waitForSelector('#infoModal', { state: 'visible' })
await page.fill('#ifName', 'Member-edited name'); await page.click('#ifSave'); await sleep(400)
await tapBall(page, 'ACG-01')
L.ok('event details: ✎ Edit details → saved (the pop-up shows it)', /Member-edited name/.test(await page.locator('#popInfo').innerText()), clean(await page.locator('#popInfo').innerText()).slice(0, 80))
await page.keyboard.press('Escape')
await page.click('#detailsBtn'); await sleep(200)
L.ok('ⓘ Details mode on / off', await page.locator('#detailsHint').isVisible(), '')
await page.click('#detailsHintOff'); await sleep(200)
await shot(page, 'w3-17-member-after-walk')
L.note('errors', errors.join(' | ') || 'none')
save('w3-17-member', { rows: L.rows })
await browser.close()
