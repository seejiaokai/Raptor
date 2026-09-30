/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part G (30 Sep 26): the independent scenario
   designer's scenarios 3 and 4.
   G1 (designer 3) — one chart (2026) used by TWO courses, each with a student marked DCO on the same flight (so Last
      Flown is set) and details typed on that ball. Edit chart layout → 🗑 Delete that ball → ↶ Undo (nothing lost), Done;
      then again → 🗑 Delete → Done → ✓ Save changes: the event, its marks on BOTH courses, its details go and Last Flown
      is worked out again (D124, D130); every other row byte-identical.
   G2 (designer 4) — the writers not walked elsewhere: End date A / B, Last Flown (Syllabus / Currency), Upchit, down days,
      a lull period and ⧉ Copy to…, a failure (+) and its re-dating, a drawn line and the font (then ✓ Save changes),
      Reset to doc on a ball's details, ✎ Rename syllabus. Each: its rows, named by its batch; reload.
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-g.json node dbrA-W5-g.mjs */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'
import { reveal } from './trk-lib.mjs'

const errors = [], table = [], notes = []
const bare = s => String(s || '').replace(/ ✎$/, '')
const arranging = p => p.locator('#arrTools.on').count().then(n => n > 0)
async function tool(p, label) { await p.locator('#arrTools button', { hasText: label }).first().click(); await T.sleep(200) }
async function clickBall(p, id) { await reveal(p, id); const b = await T.ball(p, id).boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await T.sleep(450) }
async function showAllEdit(p, id, fields) {
  await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await T.sleep(250)
  await p.fill('#saSearch', id); await T.sleep(300)
  const row = p.locator('#saBody .sarow').filter({ has: p.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  await row.locator('button.sedit').click(); await T.sleep(250)
  for (const [label, v] of Object.entries(fields)) await p.locator('.saedit label', { hasText: label }).locator('input, textarea').first().fill(v)
  await p.locator('.saedit .saedit-btns button.primary').click(); await T.sleep(500)
  await p.click('#saClose'); await T.sleep(250)
}
const setDate = async (p, sel, v) => { await p.locator(sel).scrollIntoViewIfNeeded(); await p.fill(sel, v); await p.press(sel, 'Enter'); await T.sleep(400) }
const rowVal = (p, key) => p.evaluate(k => localStorage.getItem('raptor:' + k), key)

const b = await L.launch()
try {
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'W5g')
  await T.firstBoot(p); await T.firstMount(p)
  const cid1 = await p.evaluate(() => document.getElementById('courseSel').value)
  const [stA] = await p.evaluate(() => window.__coreForTests.rosterNow())
  const F = await p.evaluate(async () => { const c = await window.__coreForTests.collectCharts(['sb2026']); return c.syllabi.sb2026.filter(e => e.type === 'flight').sort((a, b) => a.seq - b.seq)[0].id })
  notes.push('G1 the flight used: ' + F)

  /* ================= G1 setup ================= */
  await L.step(p, `G1a ${stA.name} DCO on the flight ${F} (course 26ABSG)`, async () => T.grade(p, F, 'DCO'))
  await L.step(p, `G1b details typed on ${F}`, async () => showAllEdit(p, F, { Name: 'G1 DETAIL ON ' + F }))
  await L.step(p, 'G1c + Add course "G-TWO" (on the same chart, 2026)', async () => { await T.menu(p, 'course', 'addCourse'); await T.dlg(p, { value: 'G-TWO' }); await p.evaluate(() => window.__coreForTests.whenLoaded()) })
  const cid2 = await p.evaluate(() => document.getElementById('courseSel').value)
  await L.step(p, 'G1d + Add "G2 STU" on G-TWO', async () => { await p.click('#addStu'); await T.dlg(p, { value: 'G2 STU' }); await T.sleep(500) })
  const st2 = (await p.evaluate(() => window.__coreForTests.rosterNow()))[0]
  await L.step(p, `G1e G2 STU DCO on ${F} (course G-TWO)`, async () => T.grade(p, F, 'DCO'))
  const lf = async c => p.evaluate(({ c }) => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith(`raptor:tracker/v3:${c}:sb2026:d:`)).map(k => [k.slice(7), JSON.parse(localStorage.getItem(k)).lastSyll])), { c })
  const lf1 = { ...(await lf(cid1)), ...(await lf(cid2)) }
  L.check('G1 setup: Last Flown (Syllabus) set on both courses by the flight', Object.values(lf1).filter(Boolean).length >= 2, JSON.stringify(lf1))
  await T.trkReload(p, 'G1 setup (a mark on each course, details)')
  await L.shot(p, 'g1-setup')

  /* ---- run 1: delete the ball, ↶ Undo before Save ---- */
  const before1 = await L.rows(p)
  const u1 = await L.step(p, `G1f Edit chart layout, 🗑 Delete ${F}`, async () => {
    await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300); await tool(p, 'Delete'); await clickBall(p, F)
    if (await T.dlgUp(p, 800)) return await T.dlg(p, {})
  })
  notes.push('G1f the delete asked: ' + String(u1.ret || '(nothing)').replace(/\s+/g, ' '))
  L.check(`G1f ${F} is off the chart (not saved yet)`, !(await T.ball(p, F).count()))
  await L.shot(p, 'g1-deleted-unsaved')
  const u2 = await L.step(p, 'G1g ↶ Undo (top bar) — the unsaved delete', async () => { await p.click('#trUndoBtn'); await T.sleep(500) })
  L.check(`G1g ${F} is back on the chart`, await T.ball(p, F).count() > 0)
  await tool(p, 'Move'); await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300)
  const saveLit = await p.locator('#saveChanges').count() > 0
  notes.push(`G1g after ↶ Undo and Done editing, ✓ Save changes is ${saveLit ? 'still lit' : 'gone'}`)
  if (saveLit) { const s = await L.step(p, 'G1g ✓ Save changes (the chart as it stands — nothing deleted)', async () => { await p.click('#saveChanges'); await T.sleep(600) }); notes.push('G1g that save wrote: ' + T.rowsLine(s)) }
  const d1 = L.diff(before1, await L.rows(p))
  const lostAny = d1.del.length || d1.put.some(k => /:m:|:d:|master:info:/.test(k))
  L.check(`G1g the undone delete lost nothing: no mark, date or details row changed`, !lostAny, `changed: put ${d1.put.join(', ') || 'none'} · del ${d1.del.join(', ') || 'none'}`)
  await T.trkReload(p, 'G1g ↶ Undo before Save')
  L.check(`G1g after the reload ${F} is there with its mark`, await T.ball(p, F).count() > 0 && (await T.gradeOf(p, F)) === 'dco')

  /* ---- run 2: delete it and ✓ Save changes ---- */
  const beforeRun2 = await L.rows(p)
  await L.step(p, `G1h Edit chart layout, 🗑 Delete ${F} again, Done editing`, async () => {
    await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300); await tool(p, 'Delete'); await clickBall(p, F)
    if (await T.dlgUp(p, 800)) await T.dlg(p, {})
    await tool(p, 'Move'); await T.menu(p, 'syl', 'arrangeBtn')
  })
  const sv = await L.step(p, `G1i ✓ Save changes — ${F} deleted for good`, async () => { await p.click('#saveChanges'); await T.sleep(800); if (await T.dlgUp(p, 800)) return await T.dlg(p, {}) })
  if (sv.ret) notes.push('G1i the save asked: ' + String(sv.ret).replace(/\s+/g, ' '))
  T.oneBatch('G1i ✓ Save changes (a ball deleted)', sv)
  const run2 = L.diff(beforeRun2, await L.rows(p))
  const allowed = [/^tracker\/v3:master:chart:sb2026$/, /^tracker\/v3:master:lay:sb2026$/, new RegExp(`^tracker/v3:(${cid1}|${cid2}):sb2026:(m|d):`), new RegExp(`^tracker/v3:master:info:sb2026:${encodeURIComponent(F).replace(/[()]/g, '\\$&')}$`), new RegExp(`^tracker/v3:(${cid1}|${cid2}):(last:|lastStudent)`)]
  const stray = [...run2.put, ...run2.del].filter(k => !allowed.some(re => re.test(k)))
  L.check('G1i only the chart, its layout, the two courses\' marks / dates, the ball\'s details and last-work rows changed — every other row byte-identical', !stray.length, stray.length ? 'ALSO: ' + stray.join(', ') : `put ${run2.put.join(', ')} · del ${run2.del.join(', ')}`)
  const m1 = JSON.parse(await rowVal(p, `tracker/v3:${cid1}:sb2026:m:${stA.id}`) || '{}'), m2 = JSON.parse(await rowVal(p, `tracker/v3:${cid2}:sb2026:m:${st2.id}`) || '{}')
  const lf2 = { ...(await lf(cid1)), ...(await lf(cid2)) }
  const info = await rowVal(p, `tracker/v3:master:info:sb2026:${encodeURIComponent(F)}`)
  L.check(`G1i on BOTH courses the mark on ${F} is gone, Last Flown worked out again, and its details gone`, !m1[F] && !m2[F] && Object.values(lf2).every(v => !v) && info == null, `26ABSG mark ${JSON.stringify(m1[F] || null)} · G-TWO mark ${JSON.stringify(m2[F] || null)} · Last Flown ${JSON.stringify(lf2)} · details ${info}`)
  await L.shot(p, 'g1-saved')
  await T.trkReload(p, 'G1i ✓ Save changes (ball deleted)')
  for (const c of ['26ABSG', 'G-TWO']) {
    if ((await T.picked(p, '#courseSel')) !== c) await T.pickFrom(p, '#courseSel', c)
    L.check(`G1 after the reload, course ${c}: ${F} is not on the chart`, !(await T.ball(p, F).count()))
  }
  await L.shot(p, 'g1-after-reload')
  table.push({ step: 'G1', width: 'desktop', did: `2026 shared by 26ABSG and G-TWO, each with a DCO on the flight ${F} and details on it; 🗑 Delete ${F} → ↶ Undo → Done (reload); 🗑 Delete ${F} → Done → ✓ Save changes (reload both courses)`, after: `${F} gone from 2026; marks and Last Flown gone on both courses; details gone`,
    rows: `SAVE: ${T.rowsLine(sv)}`, pics: ['g1-setup', 'g1-deleted-unsaved', 'g1-saved', 'g1-after-reload'] })

  /* ================= G2 the remaining writers ================= */
  await T.pickFrom(p, '#courseSel', '26ABSG')
  if ((await T.picked(p, '#activeSel')) !== stA.name) await T.pickFrom(p, '#activeSel', stA.name)
  const S = stA.id
  const rows = []
  const one = async (name, fn, expect, check) => {
    const a = await L.step(p, name, fn, expect)
    T.oneBatch(name, a)
    const r = await T.trkReload(p, name)
    if (check) await check(r)
    rows.push(`${name.replace(/^G2\S* /, '')}: ${T.rowsLine(a)}`)
    return a
  }
  const PACE = new RegExp(`^tracker/v3:${cid1}:pace:${S}$`), DATES = new RegExp(`^tracker/v3:${cid1}:sb2026:d:${S}$`), LULLS = new RegExp(`^tracker/v3:${cid1}:lulls:`), MARKS = new RegExp(`^tracker/v3:${cid1}:sb2026:m:${S}$`)
  await one('G2a End date A → 30/06/2027', () => setDate(p, '#targetIn', '2027-06-30'), { put: [PACE], only: true }, async () => L.check('G2a after the reload End date A reads 2027-06-30', (await p.inputValue('#targetIn')) === '2027-06-30', await p.inputValue('#targetIn')))
  await one('G2b End date B → 30/09/2027', () => setDate(p, '#targetIn2', '2027-09-30'), { put: [PACE], only: true }, async () => L.check('G2b after the reload End date B reads 2027-09-30', (await p.inputValue('#targetIn2')) === '2027-09-30'))
  await one('G2c Last Flown (Syllabus) → 01/09/2026', () => setDate(p, '#lastSyll', '2026-09-01'), { put: [DATES], only: true }, async () => L.check('G2c after the reload Last Flown (Syllabus) reads 2026-09-01', (await p.inputValue('#lastSyll')) === '2026-09-01'))
  await one('G2d Last Flown (Currency) → 15/09/2026', () => setDate(p, '#lastCurr', '2026-09-15'), { put: [DATES], only: true }, async () => L.check('G2d after the reload Last Flown (Currency) reads 2026-09-15', (await p.inputValue('#lastCurr')) === '2026-09-15'))
  await one('G2e Upchit → 15/10/2026', () => setDate(p, '#upchit', '2026-10-15'), { put: [DATES], only: true }, async () => L.check('G2e after the reload Upchit reads 2026-10-15', (await p.inputValue('#upchit')) === '2026-10-15'))
  await one('G2f No. of down days → 3', async () => { await p.locator('#downDays').scrollIntoViewIfNeeded(); await p.fill('#downDays', '3'); await T.sleep(400) }, { put: [DATES], only: true }, async () => L.check('G2f after the reload down days read 3', (await p.inputValue('#downDays')) === '3'))
  await one('G2g + Set lull period 01/10 – 08/10/2026', async () => {
    await p.locator('#setLullBtn').scrollIntoViewIfNeeded(); await p.click('#setLullBtn'); await p.waitForSelector('#lullCal', { state: 'visible' })
    await p.click('#lullCal .day[data-iso="2026-10-01"]'); await T.sleep(200); await p.click('#lullCal .day[data-iso="2026-10-08"]'); await T.sleep(500)
  }, { put: [LULLS], only: true }, async () => L.check('G2g after the reload the lull chip is there', (await p.locator('#lullChips .chip').count()) >= 1, await p.locator('#lullChips').innerText().catch(() => '')))
  await p.locator('#lullChips').scrollIntoViewIfNeeded(); await T.sleep(200)
  await L.shot(p, 'g2-lull-after-reload')
  await one('G2h ⧉ Copy to… the lull period onto every other student', async () => {
    await p.click('#copyLullBtn'); await p.waitForSelector('#lullCopy', { state: 'visible' })
    /* "Select all" shows only when there are two or more others; with one, his own box */
    for (const cb of await p.locator('#lullCopy input[type=checkbox][value]').all()) await cb.check()
    await p.click('#lullCopyOk'); await T.sleep(500)
  }, { put: [LULLS], only: true })
  const [fb] = (await T.firstBalls(p, 3)).slice(2)
  await one(`G2i a failure on ${fb} (pop-up Fails +, Close)`, async () => {
    await T.tapBall(p, fb); await p.waitForSelector('#pop', { state: 'visible' }); await p.click('#popFailPlus'); await T.sleep(400)
    await p.locator('#pop button').filter({ hasText: /^\s*Close\s*$/ }).first().click(); await T.sleep(300)
  }, { put: [MARKS], also: [new RegExp(`^tracker/v3:${cid1}:(last:${S}|lastStudent)$`)], only: true })
  await one(`G2j re-date that failure (the Failures list) → 20/09/2026`, async () => {
    await p.locator('#failTitle').scrollIntoViewIfNeeded(); await p.click('#failTitle'); await p.waitForSelector('#failLog', { state: 'visible' })
    const inp = p.locator('#failLog .frow input[type=date]').first(); await inp.fill('2026-09-20'); await inp.press('Enter'); await T.sleep(400)
    await p.click('#failLogClose'); await T.sleep(200)
  }, { put: [MARKS], only: true }, async () => L.check('G2j after the reload the failure is dated 2026-09-20', JSON.stringify(JSON.parse(await rowVal(p, `tracker/v3:${cid1}:sb2026:m:${S}`) || '{}')).includes('2026-09-20')))
  await p.locator('#failsCard').scrollIntoViewIfNeeded(); await T.sleep(200)
  await L.shot(p, 'g2-failure-after-reload')
  /* a drawn line and the font — structure, saved by ✓ Save changes */
  const beforeLine = await L.rows(p)
  const ln = await L.step(p, 'G2k Edit chart layout: ╱ Line drawn in empty space; ▣ Select all, Font 9', async () => {
    await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300)
    await reveal(p, 'ST-01'); const s01 = await T.ball(p, 'ST-01').boundingBox()
    await tool(p, 'Line'); await p.mouse.click(s01.x + 260, s01.y + 10); await T.sleep(250); await p.mouse.click(s01.x + 260, s01.y + 90); await T.sleep(400)
    await p.click('#selectAllBtn'); await T.sleep(200); await p.fill('#fontIn', '9'); await T.sleep(300)
    await tool(p, 'Move'); await T.menu(p, 'syl', 'arrangeBtn'); await T.sleep(300)
  })
  notes.push(`G2k the line and font, before ✓ Save changes, wrote: ${T.rowsLine(ln)}`)
  await L.shot(p, 'g2-line-font-unsaved')
  const lsv = await L.step(p, 'G2l ✓ Save changes (the line and the font)', async () => { if (await p.locator('#saveChanges').count()) await p.click('#saveChanges'); await T.sleep(600) })
  T.oneBatch('G2l ✓ Save changes (line, font)', lsv)
  const lay = JSON.parse(await rowVal(p, 'tracker/v3:master:lay:sb2026') || '{}')
  L.check('G2l the chart\'s stored layout holds the drawn line and the font 9', JSON.stringify(lay).includes('9') && Object.keys(lay).some(k => /line|__/.test(k)), Object.keys(lay).filter(k => k.startsWith('__')).join(', '))
  const rl = await T.trkReload(p, 'G2l ✓ Save changes (line, font)')
  rows.push(`line+font: ${T.rowsLine(ln)} ‖ save: ${T.rowsLine(lsv)}`)
  await L.shot(p, 'g2-line-font-after-reload')
  /* Reset to doc on a ball whose details were typed */
  const [rb] = (await T.firstBalls(p, 5)).slice(4)
  await L.step(p, `G2m details typed on ${rb}`, async () => showAllEdit(p, rb, { Name: 'G2 TO BE RESET' }))
  const INFO = /^tracker\/v3:master:info:sb2026:/
  await one(`G2n Reset to doc on ${rb} (pop-up ✎ Edit details → Reset to doc → Save)`, async () => {
    await T.tapBall(p, rb); await p.waitForSelector('#popEditInfo', { state: 'visible' }); await p.click('#popEditInfo')
    await p.waitForSelector('#infoModal', { state: 'visible' }); await p.click('#ifReset'); await T.sleep(200); await p.click('#ifSave'); await T.sleep(500)
  }, { del: [INFO], only: true }, async () => L.check(`G2n after the reload ${rb} has no typed details (the document's wording)`, !JSON.stringify((await T.trkPic(p)).charts.eventInfoBySyl.sb2026 || {}).includes('G2 TO BE RESET')))
  await one('G2o ✎ Rename syllabus 2026 → "2026 W5"', async () => { await T.menu(p, 'syl', 'renSyl'); await T.dlg(p, { value: '2026 W5' }) }, { put: [/^tracker\/v3:master:chart:sb2026$/], only: true }, async r => L.check('G2o after the reload the dropdown reads "2026 W5"', r.t2.screen.chartList.map(bare).includes('2026 W5'), r.t2.screen.chartList.join(' · ')))
  await L.shot(p, 'g2-renamed-chart-after-reload')
  table.push({ step: 'G2', width: 'desktop', did: 'End date A, End date B, Last Flown (Syllabus), Last Flown (Currency), Upchit, down days, + Set lull period, ⧉ Copy to…, Fails +, the failure re-dated, ╱ Line + Font 9 → ✓ Save changes, Reset to doc, ✎ Rename syllabus — a reload after each', after: 'each value as set', rows: rows.join(' ‖ '), pics: ['g2-lull-after-reload', 'g2-failure-after-reload', 'g2-line-font-unsaved', 'g2-line-font-after-reload', 'g2-renamed-chart-after-reload'] })
} catch (e) {
  L.check('W5 part G ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part G — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'G', table, notes, errors }) ? 1 : 0
