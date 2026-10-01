/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part E (30 Sep 26): TWO PEOPLE = TWO TABS of one
   browser (they share its storage; an open tab never re-reads it, so tab B does not see tab A's change until it reloads —
   exactly the case: with the old whole-list records, B's save would have overwritten A's).
   E1 (the brief)      A adds a student; B — opened before, not reloaded — renames a DIFFERENT student and reorders the
                       courses; then A, still stale, renames the other course. Reload both → all of it.
   E2 (designer 5)     same course and chart: A types details on ball X; B adds a student and types details on ball Y.
   E3 (designer 5)     two different charts: A adds a student on Tx 2026 and ⧉ duplicates a chart; B adds a student on
                       2026 and + adds a syllabus.
   E4 (designer 5)     two different courses: A + adds a course and a student on it; B the same, another course.
   A is Saber (admin), B is Ranger (member — the Tracker gives everyone the same doors, D121). Every gesture: its rows,
   named by its batch. After each pair: both tabs reload (and the reloads write nothing); both see everything.
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-e.json node dbrA-W5-e.mjs */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const errors = [], table = [], notes = []
const bare = s => String(s || '').replace(/ ✎$/, '')
async function showAllEdit(p, id, fields) {
  await p.click('#showAllBtn'); await p.waitForSelector('#showAllPanel', { state: 'visible' }); await T.sleep(250)
  await p.fill('#saSearch', id); await T.sleep(300)
  const row = p.locator('#saBody .sarow').filter({ has: p.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  await row.locator('button.sedit').click(); await T.sleep(250)
  for (const [label, v] of Object.entries(fields)) await p.locator('.saedit label', { hasText: label }).locator('input, textarea').first().fill(v)
  await p.locator('.saedit .saedit-btns button.primary').click(); await T.sleep(500)
  await p.click('#saClose'); await T.sleep(250)
}
/* a reload of a (possibly stale) tab: sign in again, back to the Tracker; the reload itself must write nothing */
async function reloadTab(p, who, name) {
  const r1 = await L.rows(p)
  await p.reload(); await L.signIn(p, who, { goto: false }); await T.toTracker(p); await L.settle(p, 700)
  const rd = L.diff(r1, await L.rows(p))
  L.check(`${name} — the reload wrote nothing`, !rd.put.length && !rd.del.length && !rd.newBatches.length, rd.put.length || rd.del.length ? { put: rd.put, del: rd.del } : 'no row changed')
}
const details = (p, syl, ev) => p.evaluate(({ syl, ev }) => { const v = localStorage.getItem(`raptor:tracker/v3:master:info:${syl}:${encodeURIComponent(ev)}`); return v ? JSON.parse(v).name : null }, { syl, ev })
const rosterOn = p => p.evaluate(() => window.__coreForTests.rosterNow().map(r => r.name))

const b = await L.launch()
try {
  const ctx = await L.context(b)
  const A = await L.page(ctx, errors, 'W5e tab A (Saber)')
  await T.firstBoot(A); await T.firstMount(A)
  await L.step(A, 'E0 A: + Add course "E-SECOND" (a second course, for the order)', async () => { await T.menu(A, 'course', 'addCourse'); await T.dlg(A, { value: 'E-SECOND' }); await A.evaluate(() => window.__coreForTests.whenLoaded()) })
  await T.pickFrom(A, '#courseSel', '26ABSG')
  await T.trkReload(A, 'E0 A: a second course')
  const B = await L.page(ctx, errors, 'W5e tab B (Ranger)')
  await L.signIn(B, 'm'); await T.toTracker(B)
  if ((await T.picked(B, '#courseSel')) !== '26ABSG') await T.pickFrom(B, '#courseSel', '26ABSG')
  const idB = (await B.evaluate(() => window.__coreForTests.rosterNow())).find(r => r.name === 'STUDENT B').id

  /* ---- E1 ---- */
  const e1a = await L.step(A, 'E1a tab A: + Add "ALPHA"', async () => { await A.click('#addStu'); await T.dlg(A, { value: 'ALPHA' }); await T.sleep(500) })
  const e1b = await L.step(B, 'E1b tab B (not reloaded): rename STUDENT B → "BRAVO R"', async () => { await B.click(`[data-ren="${idB}"]`); await T.dlg(B, { value: 'BRAVO R' }) }, { put: [/:enr:/], only: true })
  L.check('E1b B\'s rename wrote ONE row — his own — and did not remove ALPHA\'s', e1b.put.length === 1 && e1b.put[0].endsWith(':enr:' + idB) && !e1b.del.length, T.rowsLine(e1b))
  const e1c = await L.step(B, 'E1c tab B: ⇅ Reorder courses — 26ABSG to the top, Save order', async () => {
    await T.menu(B, 'course', 'ordCourse'); await B.waitForSelector('#ordModal[data-ord="course"]', { state: 'visible' })
    await T.ordMove(B, 1, 0); await B.click('#ordSave')
  }, { put: [/^tracker\/v3:master:course:/], only: true })
  const e1d = await L.step(A, 'E1d tab A (still not reloaded): rename course E-SECOND → "E-SECOND R"', async () => {
    await T.pickFrom(A, '#courseSel', 'E-SECOND'); await T.menu(A, 'course', 'renCourse'); await T.dlg(A, { value: 'E-SECOND R' })
  }, { put: [/^tracker\/v3:master:course:/], only: true })
  L.check('E1d A\'s rename wrote only that course\'s row (B\'s new order untouched)', e1d.put.length === 1, T.rowsLine(e1d))
  await reloadTab(A, 'a', 'E1 tab A'); await reloadTab(B, 'm', 'E1 tab B')
  for (const [p, who] of [[A, 'A'], [B, 'B']]) {
    const cl = await T.opts(p, '#courseSel')
    if ((await T.picked(p, '#courseSel')) !== '26ABSG') await T.pickFrom(p, '#courseSel', '26ABSG')
    const crew = await T.opts(p, '#activeSel')
    L.check(`E1 after both reloads, tab ${who}: ALPHA, BRAVO R and STUDENT A on 26ABSG; the courses 26ABSG, E-SECOND R`, crew.includes('ALPHA') && crew.includes('BRAVO R') && crew.includes('STUDENT A') && crew.length === 3 && cl.join() === '26ABSG,E-SECOND R', `crew ${crew.join(', ')} · courses ${cl.join(', ')}`)
  }
  await L.shot(A, 'e1-tab-a-after-reload'); await L.shot(B, 'e1-tab-b-after-reload')
  table.push({ step: 'E1', width: 'desktop', did: 'A + Add ALPHA; B (stale) ✎ STUDENT B → BRAVO R, ⇅ Reorder courses (26ABSG up); A (stale) ✎ Rename course E-SECOND → E-SECOND R; reload both', after: `both: ${(await T.opts(A, '#activeSel')).join(', ')} · courses ${(await T.opts(A, '#courseSel')).join(', ')}`,
    rows: `A add: ${T.rowsLine(e1a)} ‖ B rename: ${T.rowsLine(e1b)} ‖ B reorder: ${T.rowsLine(e1c)} ‖ A course rename: ${T.rowsLine(e1d)}`, pics: ['e1-tab-a-after-reload', 'e1-tab-b-after-reload'] })

  /* ---- E2 same course and chart: details on two different balls, and a student ---- */
  const [x, y] = (await T.firstBalls(A, 6)).slice(3, 5)
  const e2a = await L.step(A, `E2a tab A: details on ${x} (☰ Show All → Edit)`, async () => showAllEdit(A, x, { Name: 'TYPED IN TAB A' }), { put: [/^tracker\/v3:master:info:/], only: true })
  const e2b = await L.step(B, 'E2b tab B (not reloaded): + Add "BRAVO2"', async () => { await B.click('#addStu'); await T.dlg(B, { value: 'BRAVO2' }); await T.sleep(500) })
  const e2c = await L.step(B, `E2c tab B: details on ${y}`, async () => showAllEdit(B, y, { Name: 'TYPED IN TAB B' }), { put: [/^tracker\/v3:master:info:/], only: true })
  L.check('E2c B\'s details wrote only its own ball\'s row (A\'s untouched)', e2c.put.length === 1 && e2c.put[0].endsWith(':' + encodeURIComponent(y)), T.rowsLine(e2c))
  await reloadTab(A, 'a', 'E2 tab A'); await reloadTab(B, 'm', 'E2 tab B')
  for (const [p, who] of [[A, 'A'], [B, 'B']]) {
    if ((await T.picked(p, '#courseSel')) !== '26ABSG') await T.pickFrom(p, '#courseSel', '26ABSG')
    const crew = await T.opts(p, '#activeSel')
    const pic = await T.trkPic(p)
    const info = pic.charts.eventInfoBySyl.sb2026 || {}
    L.check(`E2 after both reloads, tab ${who}: both details and all four students`, (info[x] || {}).name === 'TYPED IN TAB A' && (info[y] || {}).name === 'TYPED IN TAB B' && ['STUDENT A', 'BRAVO R', 'ALPHA', 'BRAVO2'].every(n => crew.includes(n)), `${x}: ${(info[x] || {}).name} · ${y}: ${(info[y] || {}).name} · crew ${crew.join(', ')}`)
  }
  await L.shot(B, 'e2-tab-b-after-reload')
  table.push({ step: 'E2', width: 'desktop', did: `A details on ${x}; B (stale) + Add BRAVO2, details on ${y}; reload both`, after: `${x} "TYPED IN TAB A", ${y} "TYPED IN TAB B", crew ${(await T.opts(B, '#activeSel')).join(', ')}`,
    rows: `A: ${T.rowsLine(e2a)} ‖ B add: ${T.rowsLine(e2b)} ‖ B details: ${T.rowsLine(e2c)}`, pics: ['e2-tab-b-after-reload'] })

  /* ---- E3 two different charts: a student each, and a new chart each ---- */
  await T.pickFrom(A, '#sylSel', /^Tx 2026/)
  if (bare(await T.picked(B, '#sylSel')) !== '2026') await T.pickFrom(B, '#sylSel', /^2026/)
  const e3a = await L.step(A, 'E3a tab A on Tx 2026: + Add "A-TX"', async () => { await A.click('#addStu'); await T.dlg(A, { value: 'A-TX' }); await T.sleep(500) })
  const e3b = await L.step(B, 'E3b tab B (not reloaded) on 2026: + Add "B-26"', async () => { await B.click('#addStu'); await T.dlg(B, { value: 'B-26' }); await T.sleep(500) })
  const e3c = await L.step(A, 'E3c tab A: ⧉ Duplicate syllabus Tx 2026 → "A CHART"', async () => { await T.menu(A, 'syl', 'dupSyl'); await T.dlg(A, { value: 'A CHART' }); await A.evaluate(() => window.__coreForTests.whenLoaded()) })
  const e3d = await L.step(B, 'E3d tab B (not reloaded): + Add syllabus "B CHART"', async () => { await T.menu(B, 'syl', 'addSyl'); await T.dlg(B, { value: 'B CHART' }); await B.evaluate(() => window.__coreForTests.whenLoaded()) })
  L.check('E3d B\'s new chart did not remove or rewrite A\'s new chart row', ![...e3d.put, ...e3d.del].some(k => e3c.put.filter(x => /master:chart:sc/.test(x)).includes(k)), `A's: ${e3c.put.filter(x => /master:chart:sc/.test(x)).join(', ')} · B wrote ${T.rowsLine(e3d)}`)
  await reloadTab(A, 'a', 'E3 tab A'); await reloadTab(B, 'm', 'E3 tab B')
  for (const [p, who] of [[A, 'A'], [B, 'B']]) {
    const charts = (await T.opts(p, '#sylSel')).map(bare)
    if ((await T.picked(p, '#courseSel')) !== '26ABSG') await T.pickFrom(p, '#courseSel', '26ABSG')
    await T.pickFrom(p, '#sylSel', /^Tx 2026/); const onTx = await rosterOn(p)
    await T.pickFrom(p, '#sylSel', /^2026/); const on26 = await rosterOn(p)
    L.check(`E3 after both reloads, tab ${who}: both new charts; A-TX on Tx 2026, B-26 on 2026`, charts.includes('A CHART') && charts.includes('B CHART') && onTx.includes('A-TX') && on26.includes('B-26') && on26.includes('ALPHA'), `charts ${charts.join(', ')} · Tx: ${onTx.join(', ')} · 2026: ${on26.join(', ')}`)
  }
  await L.shot(A, 'e3-tab-a-after-reload')
  table.push({ step: 'E3', width: 'desktop', did: 'A on Tx 2026 + Add A-TX, ⧉ Duplicate → A CHART; B (stale) on 2026 + Add B-26, + Add syllabus B CHART; reload both', after: `charts ${(await T.opts(A, '#sylSel')).join(', ')}`,
    rows: `A add: ${T.rowsLine(e3a)} ‖ B add: ${T.rowsLine(e3b)} ‖ A dup: ${T.rowsLine(e3c)} ‖ B add chart: ${T.rowsLine(e3d)}`, pics: ['e3-tab-a-after-reload'] })

  /* ---- E4 two different courses ---- */
  const e4a = await L.step(A, 'E4a tab A: + Add course "A-COURSE"', async () => { await T.menu(A, 'course', 'addCourse'); await T.dlg(A, { value: 'A-COURSE' }); await A.evaluate(() => window.__coreForTests.whenLoaded()) })
  const e4b = await L.step(B, 'E4b tab B (not reloaded): + Add course "B-COURSE"', async () => { await T.menu(B, 'course', 'addCourse'); await T.dlg(B, { value: 'B-COURSE' }); await B.evaluate(() => window.__coreForTests.whenLoaded()) })
  const e4c = await L.step(A, 'E4c tab A: + Add "A-STU" on A-COURSE', async () => { await A.click('#addStu'); await T.dlg(A, { value: 'A-STU' }); await T.sleep(500) })
  const e4d = await L.step(B, 'E4d tab B: + Add "B-STU" on B-COURSE', async () => { await B.click('#addStu'); await T.dlg(B, { value: 'B-STU' }); await T.sleep(500) })
  L.check('E4b B\'s new course did not remove or rewrite A\'s', ![...e4b.put, ...e4b.del].some(k => e4a.put.filter(x => /master:course:/.test(x)).includes(k)), T.rowsLine(e4b))
  await reloadTab(A, 'a', 'E4 tab A'); await reloadTab(B, 'm', 'E4 tab B')
  const orders = []
  for (const [p, who] of [[A, 'A'], [B, 'B']]) {
    const cl = await T.opts(p, '#courseSel'); orders.push(cl.join('|'))
    await T.pickFrom(p, '#courseSel', 'A-COURSE'); const ca = await rosterOn(p)
    await T.pickFrom(p, '#courseSel', 'B-COURSE'); const cb = await rosterOn(p)
    L.check(`E4 after both reloads, tab ${who}: both courses, each with its own student`, cl.includes('A-COURSE') && cl.includes('B-COURSE') && ca.join() === 'A-STU' && cb.join() === 'B-STU', `courses ${cl.join(', ')} · A-COURSE: ${ca.join(', ')} · B-COURSE: ${cb.join(', ')}`)
  }
  L.check('E4 both tabs list the courses in the same order', orders[0] === orders[1], orders.join(' vs '))
  await L.shot(B, 'e4-tab-b-after-reload')
  table.push({ step: 'E4', width: 'desktop', did: 'A + Add course A-COURSE, + Add A-STU; B (stale) + Add course B-COURSE, + Add B-STU; reload both', after: `courses ${orders[0].split('|').join(', ')}`,
    rows: `A course: ${T.rowsLine(e4a)} ‖ B course: ${T.rowsLine(e4b)} ‖ A stu: ${T.rowsLine(e4c)} ‖ B stu: ${T.rowsLine(e4d)}`, pics: ['e4-tab-b-after-reload'] })

  /* ---- E5 (found on the way, from E3's rows): a stale tab and the charts' FIRST placing. In a fresh world no chart row
     carries a place yet; the first save of the chart order places every chart. Tab A reorders the charts (that first
     placing); tab B, opened before and never reloaded, then adds a chart — B's copy still holds the charts unplaced, so
     its save places them all again in ITS order. A's order must survive: two people, two different things. ---- */
  const c5 = await L.context(b)
  const A5 = await L.page(c5, errors, 'W5e5 tab A (Saber)')
  await T.firstBoot(A5); await T.firstMount(A5)
  const B5 = await L.page(c5, errors, 'W5e5 tab B (Ranger)')
  await L.signIn(B5, 'm'); await T.toTracker(B5)
  const before5 = await T.opts(A5, '#sylSel')
  const e5a = await L.step(A5, 'E5a tab A: ⇅ Reorder syllabi — the last chart to the top, Save order (the charts’ first placing)', async () => {
    await T.menu(A5, 'syl', 'ordSyl'); await A5.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
    await T.ordMove(A5, before5.length - 1, 0); await A5.click('#ordSave')
  })
  const orderA = await T.opts(A5, '#sylSel')
  const e5b = await L.step(B5, 'E5b tab B (not reloaded): + Add syllabus "B5 CHART"', async () => { await T.menu(B5, 'syl', 'addSyl'); await T.dlg(B5, { value: 'B5 CHART' }); await B5.evaluate(() => window.__coreForTests.whenLoaded()) })
  const clobbered = e5b.put.filter(k => e5a.put.includes(k))
  notes.push(`E5 A's reorder wrote ${T.rowsLine(e5a)}; B's add wrote ${T.rowsLine(e5b)}; rows of A's that B rewrote: ${clobbered.join(', ') || 'none'}`)
  await reloadTab(A5, 'a', 'E5 tab A'); await reloadTab(B5, 'm', 'E5 tab B')
  const want5 = [...orderA.map(bare), 'B5 CHART']
  for (const [p, who] of [[A5, 'A'], [B5, 'B']]) {
    const got = (await T.opts(p, '#sylSel')).map(bare)
    L.check(`E5 after both reloads, tab ${who}: A's chart order kept, B's new chart after it`, got.join('|') === want5.join('|'), `want ${want5.join(' · ')} · got ${got.join(' · ')}`)
  }
  /* the order as the person sees it: the ⇅ Reorder syllabi window (then Cancel — nothing saved) */
  await T.menu(A5, 'syl', 'ordSyl'); await A5.waitForSelector('#ordModal[data-ord="syllabus"]', { state: 'visible' })
  await L.shot(A5, 'e5-tab-a-after-reload')
  await A5.click('#ordCancel'); await T.sleep(200)
  table.push({ step: 'E5', width: 'desktop', did: 'fresh world, two tabs open; A ⇅ Reorder syllabi (A/G - A/A 2026 to the top — the first time the chart order is saved); B (stale) + Add syllabus "B5 CHART"; reload both', after: `A's order ${orderA.map(bare).join(', ')} → after both reloads ${(await T.opts(A5, '#sylSel')).map(bare).join(', ')}`,
    rows: `A reorder: ${T.rowsLine(e5a)} ‖ B add chart: ${T.rowsLine(e5b)}`, pics: ['e5-tab-a-after-reload'] })
  await c5.close()
} catch (e) {
  L.check('W5 part E ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part E — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'E', table, notes, errors }) ? 1 : 0
