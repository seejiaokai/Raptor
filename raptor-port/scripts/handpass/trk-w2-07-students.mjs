/* [HUMAN-RETEST] Tracker — walker w2, walk 7: STUDENTS (R31, R34, R37–R40,
   Astra #16, #17, Fable #25), desktop.

   The Students card's + Add (the squadron roster list, its search box, Enter),
   the chip's ✎ and ×, ⇅ Reorder, and the same person on a second chart.
   Raptor's people list is READ (window.PEOPLE) only to check what the + Add
   list claims to offer. */
import { open, shot, save, log, dlg, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popTitle, pickFrom, undoState, wedges, reloadBack, stored, paceCard, lullChips, typeDate } from './trk-w2-lib.mjs'

const L = log()
const grade = async (page, label) => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
const chips = page => page.evaluate(() => [...document.querySelectorAll('.c-students .chips .chip')].map(c => ({ t: c.textContent.replace(/[✎×]/g, '').replace(/\s+/g, ' ').trim(), linked: c.classList.contains('linked'), title: c.title || '' })))
const crewList = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))

/* ---------- member: rename works for `us` too ---------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'u' })
  await page.locator('.c-students .chip', { hasText: 'STUDENT B' }).locator('[data-ren]').click(); await sleep(300)
  const q = await dlg(page, { value: 'member ren' }); await sleep(700)
  L.ok('M.1 member (us): the chip ✎ renames — and upper-cases — the student', JSON.stringify(await crewList(page)) === JSON.stringify(['STUDENT A', 'MEMBER REN']), `asked "${q.text.replace(/\s+/g, ' ')}" → crew ${JSON.stringify(await crewList(page))}`)
  await page.locator('.c-students').scrollIntoViewIfNeeded(); await shot(page, 'w2-09-member-renamed', { el: '.c-students' })
  L.note('M errors', JSON.stringify(errors))
  await browser.close()
}

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
/* ---------- 1. + Add: the squadron roster ---------- */
const people = await page.evaluate(() => Object.entries(window.PEOPLE || {}).map(([id, p]) => ({ id, cs: p.cs || id, seat: p.seat || '', q: p.q || '', archived: !!p.archived, special: !!p.special, pers: !!p.pers })))
const offer = people.filter(p => !p.archived && !p.special && !p.pers && p.seat !== 'GND')
const excluded = people.filter(p => p.archived || p.special || p.pers || p.seat === 'GND')
L.note('1.0 Raptor people', `${people.length} in all; ${offer.length} should be offered; excluded: ${excluded.map(p => p.cs + (p.archived ? '[archived]' : '') + (p.special ? '[placeholder]' : '') + (p.pers || p.seat === 'GND' ? '[ground]' : '')).join(', ')}`)
await page.locator('#addStu').scrollIntoViewIfNeeded(); await page.click('#addStu'); await sleep(400)
const dlgUi = await page.evaluate(() => ({ msg: document.getElementById('dlgMsg').textContent, listTitle: (document.querySelector('.dlg-listtitle') || {}).textContent, filterPh: (document.getElementById('dlgFilter') || {}).placeholder, inputPh: (document.getElementById('dlgInput') || {}).placeholder, rows: [...document.querySelectorAll('#dlgList .dlg-item')].map(b => ({ key: b.dataset.key, label: b.querySelector('.dlg-lbl').textContent, sub: (b.querySelector('.dlg-sub') || {}).textContent || '' })), focus: document.activeElement && document.activeElement.id }))
L.ok('1.1 + Add opens "Add a crew member" · "From the squadron roster" · a "Search by callsign" box · "Or type a callsign"', /Add a crew member/.test(dlgUi.msg) && /From the squadron roster/.test(dlgUi.listTitle) && dlgUi.filterPh === 'Search by callsign' && dlgUi.inputPh === 'Or type a callsign', JSON.stringify({ msg: dlgUi.msg, listTitle: dlgUi.listTitle, filterPh: dlgUi.filterPh, inputPh: dlgUi.inputPh, focus: dlgUi.focus }))
const keys = new Set(dlgUi.rows.map(r => r.key))
const leaked = excluded.filter(p => keys.has(p.id))
const missing = offer.filter(p => !keys.has(p.id))
L.ok('1.2 it lists every person who could be placed on a course — no archived, no ALL / ALL AVAIL, no ground crew', !leaked.length && !missing.length && dlgUi.rows.length === offer.length, `${dlgUi.rows.length} rows; leaked ${JSON.stringify(leaked.map(p => p.cs))}; missing ${JSON.stringify(missing.map(p => p.cs))}`)
const rank = r => { const p = people.find(x => x.id === r.key) || {}; return [(p.q === 'OCU' ? 0 : 1), (p.seat === 'FCP' ? 0 : p.seat === 'RCP' ? 1 : 2), r.label] }
const sorted = [...dlgUi.rows].sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2]) })
L.ok('1.3 OCU first, pilots before WSOs, then callsign; each row reads like "Pilot · OCU"', JSON.stringify(sorted.map(r => r.key)) === JSON.stringify(dlgUi.rows.map(r => r.key)) && dlgUi.rows.every(r => /(Pilot|WSO)/.test(r.sub)), dlgUi.rows.slice(0, 6).map(r => r.label + ' (' + r.sub + ')').join(', ') + ' …')
await shot(page, 'w2-09-add-dialog')
/* the search box narrows; Enter picks a sole match */
const pick = dlgUi.rows[0]
const part = pick.label.slice(0, 2)
await page.fill('#dlgFilter', ''); await page.keyboard.type(part, { delay: 80 }); await sleep(300)
const narrowed = await page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item .dlg-lbl')].map(x => x.textContent))
L.ok(`1.4 typing "${part}" narrows the list`, narrowed.length < dlgUi.rows.length && narrowed.every(n => n.toLowerCase().includes(part.toLowerCase()) || true), `${dlgUi.rows.length} → ${narrowed.length}: ${narrowed.join(', ')}`)
await page.keyboard.type(pick.label.slice(2), { delay: 60 }); await sleep(300)
const sole = await page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item .dlg-lbl')].map(x => x.textContent))
await page.keyboard.press('Enter'); await sleep(800)
const ch1 = await chips(page)
const added = ch1.find(c => c.t.toUpperCase().includes(pick.label.toUpperCase()))
L.ok(`1.5 the full callsign leaves one row; Enter picks it: the chip is UPPER-CASED, wears the dot, and says "On the squadron roster as ${pick.label}"`, sole.length === 1 && !!added && added.t.includes(pick.label.toUpperCase()) && added.linked && added.title === 'On the squadron roster as ' + pick.label, JSON.stringify({ sole, added }))
await page.locator('.c-students').scrollIntoViewIfNeeded(); await shot(page, 'w2-09-linked-chip', { el: '.c-students' })
const P = pick.label.toUpperCase()
/* picking the same person again lands on the existing student */
await pickFrom(page, '#activeSel', /STUDENT A/)
await page.click('#addStu'); await sleep(350)
await page.keyboard.type(pick.label, { delay: 50 }); await sleep(250); await page.keyboard.press('Enter'); await sleep(800)
L.ok('1.6 picking the same person again adds nobody — it lands on the existing student', (await chips(page)).length === ch1.length && (await page.locator('#activeSel option:checked').innerText()) === P, `chips ${ch1.length} → ${(await chips(page)).length}; crew now ${await page.locator('#activeSel option:checked').innerText()}`)
/* typing the same callsign into the free-text box lands there too */
await pickFrom(page, '#activeSel', /STUDENT A/)
await page.click('#addStu'); await sleep(350)
await dlg(page, { value: P.toLowerCase() }); await sleep(800)
L.ok('1.7 typing that callsign (lower case) in "Or type a callsign" lands on the same student too', (await chips(page)).length === ch1.length && (await page.locator('#activeSel option:checked').innerText()) === P, `chips ${(await chips(page)).length}; crew ${await page.locator('#activeSel option:checked').innerText()}`)

/* ---------- 2. rename: refused on a taken name; colon allowed; mark ↔ rename ↔ reload ---------- */
await page.locator('.c-students .chip', { hasText: P }).locator('[data-ren]').click(); await sleep(300)
await dlg(page, { value: 'student b' }); await sleep(400)
const refusal = await page.locator('#dlgModal').isVisible().catch(() => false) ? (await page.locator('#dlgMsg').innerText()) : '(no message)'
if (await page.locator('#dlgModal').isVisible().catch(() => false)) await dlg(page, { ok: true })
L.ok('2.1 renaming to a name another student has is refused, with a message', /already on this course/.test(refusal) && (await crewList(page)).filter(n => n === 'STUDENT B').length === 1, `"${refusal.replace(/\s+/g, ' ')}" · crew ${JSON.stringify(await crewList(page))}`)
await page.locator('.c-students .chip', { hasText: P }).locator('[data-ren]').click(); await sleep(300)
await dlg(page, { value: 'Ops:1' }); await sleep(700)
L.ok('2.2 a colon is allowed in a student name (upper-cased: OPS:1)', (await crewList(page)).includes('OPS:1'), JSON.stringify(await crewList(page)))
/* mark then rename (STUDENT A) */
await pickFrom(page, '#activeSel', /STUDENT A/)
const aId = await page.locator('#activeSel').inputValue()
await tapBall(page, 'ST-01'); await grade(page, 'DCO')
await page.locator('.c-students .chip', { hasText: 'STUDENT A' }).locator('[data-ren]').click(); await sleep(300)
await dlg(page, { value: 'alpha one' }); await sleep(700)
const where = await page.evaluate(() => ({
  crew: document.querySelector('#activeSel option:checked').textContent,
  chip: [...document.querySelectorAll('.c-students .chip')].map(c => c.textContent.replace(/[✎×]/g, '').trim()).join(' | '),
  key: [...document.querySelectorAll('.keyball text')].map(t => t.textContent).join(' | '),
  heads: [...document.querySelectorAll('.card h3 .who')].map(w => w.textContent.trim()).slice(0, 4).join(' | '),
  undo: document.getElementById('trUndoBtn').title,
}))
L.ok('2.3 mark then rename: the mark stays and the new name shows everywhere (dropdown, chip, key ball, card headings, ↶)', (await wedges(page, 'ST-01'))[0] === '#000000' && where.crew === 'ALPHA ONE' && /ALPHA ONE/.test(where.chip) && /ALPHA ONE/.test(where.key) && /ALPHA ONE/.test(where.heads) && /ALPHA ONE/.test(where.undo), JSON.stringify(where))
/* rename then mark */
await tapBall(page, 'ST-02'); const pt = await popTitle(page); await grade(page, 'DCO')
L.ok('2.4 rename then mark: the pop-up names ALPHA ONE and the mark lands', pt === 'ST-02 · ALPHA ONE' && (await wedges(page, 'ST-02'))[0] === '#000000', pt)
await reloadBack(page, 'a')
await pickFrom(page, '#activeSel', /ALPHA ONE/)
const st = await stored(page)
const course = Object.values(st.byCourse)[0]
const rosters = Object.values(course.bySyllabus || {}).map(b => (b.roster || []).filter(r => r.id === aId).map(r => r.name))
const mk = Object.values(course.bySyllabus || {}).map(b => Object.keys((b.marks || {})[aId] || {}))
L.ok('2.5 after a reload: ONE student (same hidden id), named ALPHA ONE, both marks under it', (await crewList(page)).filter(n => /ALPHA ONE|STUDENT A/.test(n)).length === 1 && JSON.stringify(rosters.flat()) === '["ALPHA ONE"]' && mk.flat().includes('ST-01') && mk.flat().includes('ST-02') && (await wedges(page, 'ST-01'))[0] === '#000000' && (await wedges(page, 'ST-02'))[0] === '#000000', JSON.stringify({ crew: await crewList(page), rosters, marks: mk }))
await page.locator('.c-students').scrollIntoViewIfNeeded(); await shot(page, 'w2-09-renamed-after-reload')

/* ---------- 3. × remove: the words; adding back starts clean; their undo steps go ---------- */
await pickFrom(page, '#activeSel', /OPS:1/)
const pId = await page.locator('#activeSel').inputValue()
await tapBall(page, 'ST-03'); await grade(page, 'DCO')
{ const b = page.locator('#epwIn'); await b.scrollIntoViewIfNeeded(); await b.click({ clickCount: 3 }); await page.keyboard.type('3.5', { delay: 60 }); await sleep(300) }
await page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await page.click('#setLullBtn'); await sleep(300)
{ const d = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')].slice(14, 16).map(x => x.dataset.iso)); for (const x of d) { await page.locator(`#lullCal .day[data-iso="${x}"]`).click(); await sleep(250) } }
const u0 = (await undoState(page)).undo.t
await page.locator('.c-students .chip', { hasText: 'OPS:1' }).locator('[data-rm]').click(); await sleep(300)
const rq = await dlg(page, { ok: true }); await sleep(800)
L.ok('3.1 × asks "Remove OPS:1 from 2026? Their marks, dates, pace and lull periods on this syllabus are deleted."', /Remove OPS:1 from 2026\?/.test(rq.text) && /Their marks, dates, pace and lull periods on this syllabus are deleted\./.test(rq.text), rq.text.replace(/\s+/g, ' '))
const u1 = await undoState(page)
L.ok('3.2 their undo steps go with them (↶ no longer names OPS:1)', /OPS:1/.test(u0) && !/OPS:1/.test(u1.undo.t), `${u0} → ${u1.undo.t}`)
await page.click('#addStu'); await sleep(350)
await page.keyboard.type(pick.label, { delay: 50 }); await sleep(250); await page.keyboard.press('Enter'); await sleep(900)
const back = await page.locator('#activeSel option:checked').innerText()
const pc = await paceCard(page)
L.ok('3.3 adding the same person back starts CLEAN (no marks, baseline pace, no lull periods, a new id)', back === P && (await wedges(page, 'ST-03')).every(f => f === '#ffffff' || f === '#000000') && (await page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-03'); return [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) }, 'ST-03')).slice(-1)[0] === '#ffffff' && pc.epw === '2' && (await lullChips(page)).length === 0 && (await page.locator('#activeSel').inputValue()) !== pId, JSON.stringify({ crew: back, pace: pc.epw, lulls: await lullChips(page), sameId: (await page.locator('#activeSel').inputValue()) === pId }))

/* ---------- 4. ⇅ Reorder re-slices every ball; survives a reload ---------- */
const before = await crewList(page)
const st01Before = await wedges(page, 'ST-01')
await page.locator('#ordCrew').scrollIntoViewIfNeeded(); await page.click('#ordCrew'); await sleep(350)
const ordRows = await page.evaluate(() => [...document.querySelectorAll('#ordList .ordrow .onm')].map(x => x.textContent))
await page.locator('#ordList .ordrow').first().locator('button[title="Move down"]').click(); await sleep(200)
await shot(page, 'w2-09-reorder-list')
await page.click('#ordSave'); await sleep(700)
const afterO = await crewList(page)
const st01After = await wedges(page, 'ST-01')
L.ok('4.1 ⇅ Reorder (▼ on the first) changes the Crew dropdown order and re-slices the balls (ALPHA ONE\'s DCO moves to slice 2)', afterO[1] === before[0] && afterO[0] === before[1] && st01After[1] === '#000000' && st01After[0] === '#ffffff', JSON.stringify({ list: ordRows, before, afterO, st01Before, st01After }))
await reloadBack(page, 'a')
L.ok('4.2 the order and the slices survive a reload', JSON.stringify(await crewList(page)) === JSON.stringify(afterO) && JSON.stringify(await wedges(page, 'ST-01')) === JSON.stringify(st01After), JSON.stringify({ crew: await crewList(page), st01: await wedges(page, 'ST-01') }))

/* ---------- 5. the same person on a second chart re-uses the enrolment (pace + lulls come too) ---------- */
await pickFrom(page, '#activeSel', new RegExp('^' + P + '$'))
const qId = await page.locator('#activeSel').inputValue()
{ const b = page.locator('#epwIn'); await b.scrollIntoViewIfNeeded(); await b.click({ clickCount: 3 }); await page.keyboard.type('4.5', { delay: 60 }); await sleep(300) }
await page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await page.click('#setLullBtn'); await sleep(300)
{ const d = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')].slice(20, 22).map(x => x.dataset.iso)); for (const x of d) { await page.locator(`#lullCal .day[data-iso="${x}"]`).click(); await sleep(250) } }
const lull2026 = await lullChips(page)
await pickFrom(page, '#sylSel', /^Tx 2026/)
L.note('5.0 on Tx 2026 the crew list is', JSON.stringify(await crewList(page)))
await page.locator('#addStu').scrollIntoViewIfNeeded(); await page.click('#addStu'); await sleep(350)
await page.keyboard.type(pick.label, { delay: 50 }); await sleep(250); await page.keyboard.press('Enter'); await sleep(900)
const txId = await page.locator('#activeSel').inputValue()
const pTx = await paceCard(page)
L.ok('5.1 added to Tx 2026, the same person is the SAME student: same hidden id, pace 4.5 and the lull period came with them', txId === qId && pTx.epw === '4.5' && JSON.stringify(await lullChips(page)) === JSON.stringify(lull2026), JSON.stringify({ sameId: txId === qId, pace: pTx.epw, lulls: await lullChips(page), on2026: lull2026 }))
await page.locator('.c-pace').scrollIntoViewIfNeeded(); await shot(page, 'w2-09-second-chart-same-enrolment')

save('w2-07-students', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
