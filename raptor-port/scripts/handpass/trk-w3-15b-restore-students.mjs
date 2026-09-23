/* w3 item 15, follow-up: "restore brings the shipped chart back with NO
   students" — walked with a student and a mark actually on the chart first
   (the demo course has none on 2024). Also: the same student on 2026 keeps
   their marks there (a delete sweeps only the deleted chart). */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg, pickFrom } from './trk-w3-lib.mjs'
const L = log()
const students = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
const wedges = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null }, id)
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
/* STUDENT A marks ST-01 on 2026 */
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
const w26 = await wedges(page, 'ST-01')
/* on 2024: add STUDENT A (typed — the same name lands on the same enrolment) and mark ST-01 */
await pickFrom(page, '#sylSel', /^2024/)
await page.click('#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' })
await page.fill('#dlgInput', 'student a'); await page.click('#dlgOk'); await sleep(700)
L.note('2024: students after + Add "student a"', JSON.stringify(await students(page)))
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
L.note('2024: ST-01 for STUDENT A', JSON.stringify(await wedges(page, 'ST-01')))
await menuItem(page, 'syl', 'delSyl'); await page.click('#dlgOk'); await sleep(900)
await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' })
await page.locator('#ordHidden .ordrow').filter({ hasText: '2024' }).locator('button', { hasText: 'Restore' }).click(); await sleep(400)
await page.click('#ordSave'); await sleep(400)
await pickFrom(page, '#sylSel', /^2024$/)
L.ok('restored 2024 comes back with NO students (the one added before the delete is gone)', !(await students(page)).length, JSON.stringify(await students(page)) + ' · card "' + (await page.locator('#side .c-students').innerText()).replace(/\s+/g, ' ') + '"')
await shot(page, 'w3-15b-restored-no-students')
await pickFrom(page, '#sylSel', /^2026/)
L.ok('…while STUDENT A keeps the ST-01 mark on 2026', JSON.stringify(await wedges(page, 'ST-01')) === JSON.stringify(w26), `${JSON.stringify(w26)} → ${JSON.stringify(await wedges(page, 'ST-01'))} · crew ${JSON.stringify(await students(page))}`)
L.note('errors', errors.join(' | ') || 'none')
save('w3-15b-restore-students', { rows: L.rows })
await browser.close()
