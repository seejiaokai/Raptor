/* THE EVERYTHING-COURSE — walker c, 28 Sep 26: the day his look starts on.
   Built ONCE through the app's own controls, at 1440×900 as the admin: two courses (a new
   27ABSG beside the demo 26ABSG), a hidden chart (the built-in "2024" deleted — restorable from
   ⇅ Reorder), three students on 27ABSG (Recon from the squadron roster, VIPER9 and the 14-letter
   ABCDEFGHIJKLMN typed) with VIPER9 then removed, marks, an N.A. event carrying two failures
   (D370), a back-dated failure (D371), a lull period, a pace, a chart brought in through
   File → Import, and an unsaved chart edit. Pictures of the Flow chart and the Info side at
   1440, then the same world at 390 upright (a finger) — a fresh page on the saved store, which
   also shows D376 (each person reopens on their own course and student).

   Two driver notes, said plainly: (1) Export and Import go through the browser's file boxes; this
   headless browser's native pickers cannot be driven, so the script switches them off first and
   the app falls back to a download and a plain file box — the path the owner's iPhone takes
   (trk-w1-lib's exportVia/importVia). (2) The unsaved chart edit lives only in the session by
   design (a reload asks first), so at 390 it is made again the same way.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2c-everything.mjs
*/
import { open, shot, save, log, reveal, core, TMP, DESK, sleep, menu, pickSyl, pickCourse, pickCrew, sylLabels, courseLabels, crewLabels, exportVia, importVia, dlgUp, dlgText } from './trk-w1-lib.mjs'
import { typeDate } from './trk-w2-lib.mjs'
import { resolve } from 'node:path'

const L = log()
const allErrors = []
const STATE = resolve(TMP, 'lo-2c-everything-state.json')
const ok = async page => { await page.click('#dlgOk'); await sleep(450) }
const ballAt = async (page, id) => { await reveal(page, id); const b = await page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
const failCard = page => page.evaluate(() => ({
  chips: [...document.querySelectorAll('#failChips .failchip')].map(c => c.textContent.replace(/\s+/g, ' ').trim()),
  total: ((document.getElementById('failTotal') || {}).textContent || '').trim(),
}))
const ticks = (page, id) => page.evaluate(id => { const g = document.querySelector(`#flowSvg .ball[data-id="${id}"]`); return g ? g.querySelectorAll('line.ftick').length : null }, id)

/* ================= built at 1440×900 ================= */
{
  const { browser, ctx, page, errors } = await open({ size: DESK })
  /* ---- a hidden chart: the built-in "2024" deleted (restorable from ⇅ Reorder) ---- */
  await pickSyl(page, '2024')
  await menu(page, 'syl', 'delSyl')
  const q = (await dlgUp(page)) ? await dlgText(page) : ''
  L.note('E1 🗑 Delete syllabus on "2024" asks', q)
  await ok(page)
  if (await dlgUp(page, 800)) { L.note('E1 a second word after the delete', await dlgText(page)); await ok(page) }
  const syls = await sylLabels(page)
  L.ok('E1 the built-in "2024" is gone from the Syllabus list (hidden, not lost)', !syls.some(s => /^2024/.test(s)), JSON.stringify(syls))
  if (!/^2026/.test(await page.locator('#sylSel option:checked').innerText())) await pickSyl(page, '2026')

  /* ---- two courses: + Add course "27ABSG" ---- */
  await menu(page, 'course', 'addCourse')
  await page.locator('#dlgInput').click(); await page.keyboard.type('27ABSG', { delay: 30 }); await ok(page)
  const courses = await courseLabels(page)
  L.ok('E2 two courses: 27ABSG added beside 26ABSG, and it is the course on screen', courses.includes('27ABSG') && courses.includes('26ABSG') && (await page.locator('#courseSel option:checked').innerText()) === '27ABSG', JSON.stringify(courses))

  /* ---- three students, one of them then removed ---- */
  await page.click('#addStu'); await sleep(400)
  await page.locator('#dlgFilter').click(); await page.keyboard.type('Recon', { delay: 40 }); await sleep(300)
  await page.locator('#dlgList .dlg-item', { hasText: 'Recon' }).first().click(); await sleep(500)
  if (await dlgUp(page, 500)) await ok(page)
  for (const nm of ['VIPER9', 'ABCDEFGHIJKLMN']) {
    await page.click('#addStu'); await sleep(400)
    await page.locator('#dlgInput').click(); await page.keyboard.type(nm, { delay: 30 }); await ok(page)
  }
  const three = await crewLabels(page)
  L.ok('E3 three students on 27ABSG: Recon (from the roster — the Tracker writes him RECON, as it writes every name), VIPER9, ABCDEFGHIJKLMN', three.length === 3 && ['RECON', 'VIPER9', 'ABCDEFGHIJKLMN'].every(n => three.includes(n)), JSON.stringify(three))
  const rm = await page.evaluate(() => { const c = [...document.querySelectorAll('#side [data-rm]')].find(x => x.parentElement.textContent.includes('VIPER9')); return c ? c.getAttribute('data-rm') : null })
  await page.click(`#side [data-rm="${rm}"]`); await sleep(400)
  const rq = await dlgText(page)
  await ok(page); await sleep(400)
  const two = await crewLabels(page)
  L.ok('E3 VIPER9 removed (after its question): two left', two.length === 2 && !two.includes('VIPER9'), JSON.stringify({ asked: rq.slice(0, 80), left: two }))
  await pickCrew(page, 'RECON')

  /* ---- marks for Recon ---- */
  for (const [id, g] of [['ST-01', 'DCO'], ['ST-02', 'DCO'], ['ACG-01', 'DPCO']]) {
    const c = await ballAt(page, id); await page.mouse.click(c.x, c.y); await sleep(400)
    await page.locator('#pop .opts button', { hasText: new RegExp('^' + g + '$') }).first().click(); await sleep(400)
  }
  /* ---- an N.A. event carrying failures: ACG-02, two failures, then N.A. (D370) ---- */
  let c = await ballAt(page, 'ACG-02'); await page.mouse.click(c.x, c.y); await sleep(400)
  await page.click('#popFailPlus'); await sleep(250); await page.click('#popFailPlus'); await sleep(250)
  const fc = await page.locator('#failCount').innerText()
  await page.locator('#pop .opts button', { hasText: 'N.A.' }).first().click(); await sleep(500)
  const card1 = await failCard(page)
  L.ok('E4 ACG-02: two failures recorded, then N.A. — the Failures card leaves them out and the ball draws no red ticks (D370)', fc === '2' && !card1.chips.some(x => /ACG-02/.test(x)) && (await ticks(page, 'ACG-02')) === 0, JSON.stringify({ failCountBeforeNA: fc, card: card1, ticks: await ticks(page, 'ACG-02') }))
  /* ---- a back-dated failure: ACG-03, one today, then one on 10 Sep 26 (D371) ---- */
  c = await ballAt(page, 'ACG-03'); await page.mouse.click(c.x, c.y); await sleep(400)
  await page.click('#popFailPlus'); await sleep(300)
  await typeDate(page, '#popFailDate', '2026-09-10')
  await page.click('#popFailPlus'); await sleep(400)
  const popList = await page.evaluate(() => [...document.querySelectorAll('#popFailDates .fdate')].map(x => x.textContent.replace(/\s+/g, ' ').trim()))
  await shot(page, 'lo-2c-e00-1440-backdated-popup')
  await page.locator('#pop .opts button', { hasText: 'Close' }).first().click(); await sleep(400)
  const card2 = await failCard(page)
  L.ok('E5 ACG-03: a failure today and one back-dated to 10/09 — the earliest day wears the plain code (ACG-03 10/09, ACG-03X today)', /^ACG-03 10\/09/.test(popList[0] || '') && /^ACG-03X/.test(popList[1] || ''), JSON.stringify({ popList, card: card2 }))

  /* ---- a lull period: 14–18 Sep ---- */
  await page.click('#setLullBtn'); await sleep(400)
  const month = await page.evaluate(() => (document.querySelector('#lullCal') || {}).innerText?.split('\n').slice(0, 3).join(' '))
  await page.click('#lullCal .day[data-iso="2026-09-14"]'); await sleep(250)
  await page.click('#lullCal .day[data-iso="2026-09-18"]'); await sleep(500)
  const lull = await page.evaluate(() => [...document.querySelectorAll('#lullChips .lullchip')].map(x => x.textContent.replace('×', '').replace(/\s+/g, ' ').trim()))
  L.ok('E6 a lull period 14–18 Sep set from + Set lull period', lull.length === 1, JSON.stringify({ opensOn: month, lull }))

  /* ---- a pace: 3 a week ---- */
  await page.locator('#epwIn').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('3', { delay: 60 }); await page.keyboard.press('Tab'); await sleep(500)
  const pace = await page.evaluate(() => ({ epw: document.getElementById('epwIn').value, card: (document.querySelector('.c-pace') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 160) }))
  L.ok('E7 the pace set to 3 a week', pace.epw === '3', JSON.stringify(pace))

  /* ---- a file brought in through File → Import: "Tx 2026" exported, then imported as a new chart ---- */
  const file = resolve(TMP, 'lo-2c-e-tx2026.json')
  const ex = await exportVia(page, { tick: ['Tx 2026'], students: false, file })
  L.note('E8 ⤓ Export (charts only, Tx 2026) — the file', `${ex.suggested}; says: ${ex.conf}`)
  const asked = await importVia(page, file, async msg => /already exists/.test(msg) ? 'alt' : 'ok')
  L.note('E8 ⇪ Import — what it asked, and the answers', JSON.stringify(asked))
  const sylsAfter = await sylLabels(page)
  L.ok('E8 the imported chart "Tx 2026 (new)" is in the Syllabus list', sylsAfter.some(s => /^Tx 2026 \(new\)/.test(s)), JSON.stringify(sylsAfter))
  /* back to the everything-course */
  if ((await page.locator('#courseSel option:checked').innerText()) !== '27ABSG') await pickCourse(page, '27ABSG')
  if (!/^2026/.test(await page.locator('#sylSel option:checked').innerText())) await pickSyl(page, '2026')
  if ((await page.locator('#activeSel option:checked').innerText()) !== 'Recon') await pickCrew(page, 'RECON')

  /* ---- an unsaved chart edit: + Flight "EVERY-1", Done editing — ✓ Save changes waits ---- */
  await menu(page, 'syl', 'arrangeBtn')
  await page.locator('#arrTools button', { hasText: '+ Flight' }).first().click(); await sleep(300)
  await page.locator('#dlgInput').click(); await page.keyboard.type('EVERY-1', { delay: 30 }); await ok(page)
  await menu(page, 'syl', 'arrangeBtn')
  L.ok('E9 an unsaved chart edit: "EVERY-1" on the chart, ✓ Save changes showing', (await page.locator('#saveChanges').count()) === 1 && (await page.locator('#flowSvg .ball[data-id="EVERY-1"]').count()) === 1)

  /* ---- the pictures at 1440 ---- */
  /* the chart and the side panel from their tops, the way a person scrolls there (the wheel) */
  const mid = sel => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 2, innerHeight - 60) } }, sel)
  let m = await mid('#board'); await page.mouse.move(m.x, m.y); await page.mouse.wheel(0, -30000); await sleep(400)
  m = await mid('#side'); await page.mouse.move(m.x, m.y); await page.mouse.wheel(0, -30000); await sleep(400)
  await shot(page, 'lo-2c-e01-1440-flow-and-info-top')
  await page.mouse.wheel(0, 30000); await sleep(400)
  await shot(page, 'lo-2c-e02-1440-info-lower')
  await reveal(page, 'ACG-03'); await sleep(300)
  await shot(page, 'lo-2c-e01b-1440-flow-acg02-acg03')
  await shot(page, 'lo-2c-e03-1440-failures-card', { el: '#failsCard' })
  await menu(page, 'syl', 'ordSyl'); await sleep(400)
  const hidden = await page.evaluate(() => (document.getElementById('ordHidden') || {}).innerText || '')
  await shot(page, 'lo-2c-e04-1440-reorder-hidden-chart')
  L.ok('E1b ⇅ Reorder syllabi lists "2024" under the hidden charts, with ↺ Restore', /2024/.test(hidden), JSON.stringify(hidden))
  await page.click('#ordCancel'); await sleep(300)
  const world = await core(page, c => ({ courses: c.coursesNow().map(x => x.name), syls: c.sylsNow().map(x => x.name), course: c.curCourseName(), syl: c.curSylName(), roster: c.rosterNow().map(r => r.name + (r.pid ? ' (roster ' + r.pid + ')' : '')) }))
  L.note('E10 the world as the store has it', JSON.stringify(world))
  L.ok('E10 no console or page error while building', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '1440: ' + e))
  await ctx.storageState({ path: STATE })
  await browser.close()
}

/* ================= the same world at 390 upright, a finger ================= */
{
  const { browser, page, errors } = await open({ size: { width: 390, height: 844 }, touch: true, state: STATE })
  await shot(page, 'lo-2c-e09-390-flow-as-opened')
  const where = { course: await page.locator('#courseSel option:checked').innerText(), syl: await page.locator('#sylSel option:checked').innerText(), crew: await page.locator('#activeSel option:checked').innerText(), save: await page.locator('#saveChanges').count() }
  L.ok('E11 at 390 on the saved store, the admin reopens on HIS place: 27ABSG, 2026, RECON (D376)', where.course === '27ABSG' && /^2026/.test(where.syl) && where.crew === 'RECON', JSON.stringify(where))
  L.note('E11 the unsaved chart edit did not outlive the session (by design; a reload asks first) — made again here', JSON.stringify({ saveChangesShowing: where.save }))
  const tap = async sel => { await page.locator(sel).first().tap(); await sleep(300) }
  await tap('#sylMenuBtn'); await tap('#arrangeBtn'); await sleep(500)
  await page.locator('#arrTools button', { hasText: '+ Flight' }).first().tap(); await sleep(300)
  await page.locator('#dlgInput').tap(); await page.keyboard.type('EVERY-1', { delay: 30 }); await tap('#dlgOk'); await sleep(400)
  await tap('#sylMenuBtn'); await tap('#arrangeBtn'); await sleep(500)
  L.ok('E12 390: the unsaved chart edit made again — ✓ Save changes showing', (await page.locator('#saveChanges').count()) === 1)
  await reveal(page, 'ACG-03'); await sleep(300)
  await shot(page, 'lo-2c-e10-390-flow-acg02-acg03')
  await page.locator('#viewtabs [data-view="info"]').tap(); await sleep(500)
  await shot(page, 'lo-2c-e11-390-info')
  await shot(page, 'lo-2c-e12-390-info-side', { el: '#side' })
  const card = await failCard(page)
  L.ok('E13 390 Info: the Failures card shows ACG-03 (10/09) and ACG-03X, and nothing from the N.A. ACG-02', card.chips.some(x => /^ACG-03\b/.test(x)) && card.chips.some(x => /ACG-03X/.test(x)) && !card.chips.some(x => /ACG-02/.test(x)), JSON.stringify(card))
  L.ok('E14 390: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '390: ' + e))
  await browser.close()
}

save('lo-2c-everything', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
