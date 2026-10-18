/* Night of 18 Oct 26, job 2 walk: D1008 (every member reads every man's OIL ledger) and D1015 (the Tracker's import
   refusal for student marks whose chart is in neither the file nor the Tracker).
   Drives the running built app (HP_URL, default http://localhost:4174). Writes pictures under
   docs/img/handpass/2026-10-18-night-job2/ (emptied at the start of every run). */
process.env.HP_URL ||= 'http://localhost:4174'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = resolve(HERE, '..', '..', 'docs/img/handpass/2026-10-18-night-job2')
rmSync(SHOTS_DIR, { recursive: true, force: true }); mkdirSync(SHOTS_DIR, { recursive: true })
process.env.HP_SHOTS = SHOTS_DIR
const L = await import('./trk-lib.mjs')
console.log('night1018-job2-walk v1 against', L.BASE)

const results = []
const allErrors = []
let current = null
async function step(id, page, shotName, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = !!r.ok; note = r.note } catch (e) { ok = false; note = 'EXCEPTION ' + String(e.message).split('\n')[0] }
  if (shotName && page) { try { await L.shot(page, shotName) } catch (e) { note += ' (picture failed: ' + e.message.split('\n')[0] + ')' } }
  results.push({ id, ok, note, shot: shotName ? shotName + '.png' : '' })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}${shotName ? '  [' + shotName + '.png]' : ''}`)
}
const lwStore = page => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/leavewar/i.test(k)) o[k] = localStorage.getItem(k) } return JSON.stringify(o) })

/* ---------------- Leave War: D1008 ---------------- */
async function openLW(opts) {
  const s = await L.open({ tracker: false, ...opts })
  await L.toPage(s.page, 'leavewar')
  await s.page.waitForSelector('[data-testid=oil-tracker]', { timeout: 20000 })
  await s.page.waitForTimeout(600)
  return s
}
async function oilFacts(page) {
  return page.evaluate(() => ({
    rows: document.querySelectorAll('[data-testid^="oil-row-"]').length,
    names: [...document.querySelectorAll('[data-testid^="oil-name-"] .who')].map(e => e.textContent),
    entries: document.querySelectorAll('[data-testid^="oil-entry-"]').length,
    withBalance: [...document.querySelectorAll('[data-testid^="oil-bal-"]')].filter(e => e.textContent.trim() !== '0').map(e => e.dataset.testid.replace('oil-bal-', '') + '=' + e.textContent.trim()),
    reasons: [...document.querySelectorAll('[data-testid^="oil-entry-"] .l2 .rt')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 6),
    editable: document.querySelectorAll('[data-testid^="oil-entry-"][role=button]').length,
    gear: document.querySelectorAll('[data-testid=oil-settings]').length,
    credit: document.querySelectorAll('[data-testid=oil-credit-panel]').length,
  }))
}

/* member, desktop */
{
  const { browser, page, errors } = await openLW({ who: 'u' })
  let facts
  await step('S1 desktop (member opens the OIL tracker)', page, 's1-desktop-member-oil', async () => {
    await page.click('[data-testid=oil-tracker]')
    await page.waitForSelector('[data-testid=oil-sheet]')
    await page.waitForTimeout(500)
    facts = await oilFacts(page)
    const others = facts.names.filter(n => n !== 'Ranger')
    const ok = facts.rows > 1 && others.length > 1 && facts.entries > 0 && facts.withBalance.some(b => !b.startsWith('bane='))
    return { ok, note: `${facts.rows} rows, others than Ranger: ${others.length}, ${facts.entries} entries, men with a balance: ${facts.withBalance.join(', ')}, reasons seen: ${JSON.stringify(facts.reasons)}` }
  })
  await step('B1 member: no control to add, change or delete a ledger entry/grant', page, 'b1-desktop-member-no-edit', async () => {
    const before = await lwStore(page)
    const target = page.locator('[data-testid^="oil-entry-"]', { hasText: 'Exercise recovery' }).first()
    const seen = await target.count()
    await target.click()
    await page.waitForTimeout(300)
    const after = await lwStore(page)
    const f = await oilFacts(page)
    const editInputs = await page.locator('[data-testid=oil-edit-amt], [data-testid=oil-edit-save], [data-testid^="oil-del-"]').count()
    const ok = seen === 1 && f.editable === 0 && f.gear === 0 && f.credit === 0 && editInputs === 0 && before === after
    return { ok, note: `grant box found ${seen}, tapped it; editable entries ${f.editable}, settings gear ${f.gear}, credit panel ${f.credit}, edit/delete controls after the tap ${editInputs}, stored Leave War data unchanged ${before === after}` }
  })
  await page.click('[data-testid=oil-close]')
  await page.waitForTimeout(300)
  await step('S2 desktop (member: a man\'s figures, then a breakdown with grants and reasons)', page, 's2-desktop-member-breakdown', async () => {
    await page.click('[data-testid=person-slipway]')
    await page.waitForSelector('[data-testid=person-figures]')
    const pf = (await page.locator('[data-testid=person-figures]').innerText()).replace(/\s+/g, ' ')
    await L.shot(page, 's2-desktop-member-person-figures')
    await page.click('[data-testid=pfig-lve] button.crow')
    await page.waitForSelector('[data-testid=figure-breakdown]')
    const bd = (await page.locator('[data-testid=figure-breakdown]').innerText()).replace(/\s+/g, ' ')
    const grants = await page.locator('[data-testid=breakdown-grants] .bdgrant').allInnerTexts()
    const ok = /Drifter/.test(pf) && grants.length > 0 && grants.some(g => /Annual leave top-up/.test(g))
    return { ok, note: `person sheet for Drifter read "${pf.slice(0, 80)}..."; LVE breakdown grants: ${JSON.stringify(grants)}` }
  })
  await page.click('[data-testid=breakdown-close]')
  await page.waitForTimeout(200)
  await step('S2b desktop (member: OIL row of a man\'s figures opens the tracker on him)', page, 's2b-desktop-member-oil-on-person', async () => {
    await page.click('[data-testid=person-slipway]')
    await page.click('[data-testid=pfig-oil] button.crow')
    await page.waitForSelector('[data-testid=oil-sheet]')
    await page.waitForTimeout(400)
    const here = await page.evaluate(() => [...document.querySelectorAll('.oil-row.here')].map(e => e.dataset.testid))
    const f = await oilFacts(page)
    return { ok: here.length === 1 && here[0] === 'oil-row-slipway' && f.entries > 0 && f.rows > 1, note: `lit row ${JSON.stringify(here)}, ${f.rows} rows, ${f.entries} entries` }
  })
  allErrors.push(...errors.map(e => 'S1/S2 desktop member: ' + e))
  await browser.close()
}

/* member, phone */
{
  const { browser, page, errors } = await openLW({ who: 'u', size: L.PHONE, touch: true })
  await step('S1 phone (member opens the OIL tracker)', page, 's1-phone-member-oil', async () => {
    await page.click('[data-testid=oil-tracker]')
    await page.waitForSelector('[data-testid=oil-sheet]')
    await page.waitForTimeout(500)
    const f = await oilFacts(page)
    const others = f.names.filter(n => n !== 'Ranger')
    return { ok: f.rows > 1 && others.length > 1 && f.entries > 0, note: `${f.rows} rows, others than Ranger: ${others.length}, ${f.entries} entries, editable ${f.editable}, gear ${f.gear}` }
  })
  await page.click('[data-testid=oil-close]')
  await page.waitForTimeout(300)
  await step('S2 phone (member: breakdown with grants and reasons)', page, 's2-phone-member-breakdown', async () => {
    await page.click('[data-testid=person-slipway]')
    await page.waitForSelector('[data-testid=person-figures]')
    await page.click('[data-testid=pfig-lve] button.crow')
    await page.waitForSelector('[data-testid=figure-breakdown]')
    const grants = await page.locator('[data-testid=breakdown-grants] .bdgrant').allInnerTexts()
    return { ok: grants.some(g => /Annual leave top-up/.test(g)), note: `LVE breakdown grants: ${JSON.stringify(grants)}` }
  })
  allErrors.push(...errors.map(e => 'S1/S2 phone member: ' + e))
  await browser.close()
}

/* admin, desktop */
{
  const { browser, page, errors } = await openLW({ who: 'a' })
  await step('S3 admin: the same OIL view still shows (and the edit controls are there to compare)', page, 's3-desktop-admin-oil', async () => {
    await page.click('[data-testid=oil-tracker]')
    await page.waitForSelector('[data-testid=oil-sheet]')
    await page.waitForTimeout(500)
    const f = await oilFacts(page)
    const others = f.names.filter(n => n !== 'Saber')
    return { ok: f.rows > 1 && others.length > 1 && f.entries > 0 && f.editable > 0 && f.gear === 1, note: `${f.rows} rows, ${f.entries} entries, men with a balance: ${f.withBalance.join(', ')}, editable entries ${f.editable}, settings gear ${f.gear}` }
  })
  await page.click('[data-testid=oil-close]')
  await page.waitForTimeout(300)
  await step('S3b admin: a man\'s LVE breakdown still shows the grant and its reason', page, 's3b-desktop-admin-breakdown', async () => {
    await page.click('[data-testid=person-slipway]')
    await page.waitForSelector('[data-testid=person-figures]')
    await page.click('[data-testid=pfig-lve] button.crow')
    await page.waitForSelector('[data-testid=figure-breakdown]')
    const grants = await page.locator('[data-testid=breakdown-grants] .bdgrant').allInnerTexts()
    return { ok: grants.some(g => /Annual leave top-up/.test(g)), note: `grants ${JSON.stringify(grants)}` }
  })
  allErrors.push(...errors.map(e => 'S3 admin: ' + e))
  await browser.close()
}

/* ---------------- Tracker: D1015 ---------------- */
const TMP = L.TMP
const OLDWORDS = 'older version'
const NEWWORDS = 'Student marks not brought in: they belong to a chart this file doesn’t carry. Export a fresh backup that includes its charts, and import that.'

async function noPickers(page) { await page.evaluate(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined }) }
async function fileMenu(page, id) {
  await page.locator('.menu >> text=⇪ File').first().click().catch(async () => { await page.click('text=⇪ File') })
  await page.click(id)
}
/** answer every in-page dialog that comes, recording its text, until none comes; stop (leave open) before pressing the one
    whose text matches `stopAt`, so its picture can be taken */
async function runDialogs(page, { stopAt = null, shotName = null } = {}) {
  const seen = []
  for (let i = 0; i < 12; i++) {
    try { await page.waitForSelector('#dlgModal', { state: 'visible', timeout: 3500 }) } catch { break }
    const text = (await page.locator('#dlgModal').innerText()).trim()
    const labels = await page.locator('#dlgModal button:visible').allInnerTexts()
    seen.push({ text, labels })
    if (stopAt && stopAt.test(text)) { if (shotName) await L.shot(page, shotName); return { seen, stopped: true } }
    const btns = page.locator('#dlgModal button:visible')
    let target = btns.filter({ hasText: /^(Replace it|Yes|OK|Import|Continue)/i }).first()
    if (!(await target.count())) target = btns.last()
    await target.click()
    await page.waitForTimeout(300)
  }
  return { seen, stopped: false }
}
const rosterNames = page => page.evaluate(() => [...document.querySelectorAll('.c-students .chip')].map(e => e.textContent.replace(/[✎×]/g, '').replace(/^\s*\d+\s*/, '').trim()))
const storageHas = (page, needle) => page.evaluate(n => { for (let i = 0; i < localStorage.length; i++) { const v = localStorage.getItem(localStorage.key(i)) || ''; if (v.includes(n)) return true } return false }, needle)

let exported = null, s5Path = null, s6Path = null
{
  const { browser, ctx, page, errors } = await L.open({ who: 'a' })
  await noPickers(page)
  await step('S4 admin: File > Export gives a real current backup (students and every chart)', page, 's4-export-window', async () => {
    await page.click('text=⇪ File')
    await page.click('#exportBtn')
    await page.waitForSelector('#copyModal')
    await page.click('#copyStudents')
    await page.click('#copyTickAll')
    const warn = (await page.locator('#copyWarn').innerText()).trim()
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#copyOk')])
    mkdirSync(TMP, { recursive: true })
    const p = resolve(TMP, 'night1018-job2-export.json')
    await dl.saveAs(p)
    exported = JSON.parse(readFileSync(p, 'utf8'))
    const ids = (exported.charts.sylcat || []).map(e => e.id)
    const ok = exported.version === 3 && !!exported.charts && !!exported.students && ids.length >= 2 && Object.keys(exported.students.byCourse).length >= 1
    return { ok, note: `file ${dl.suggestedFilename()}; version ${exported.version}; chart ids ${JSON.stringify(ids)}; courses ${JSON.stringify(exported.students.courses)}; students.sylcat ${JSON.stringify(exported.students.sylcat)}; export warning shown "${warn.slice(0, 40)}..."` }
  })
  await runDialogs(page)   // the export's own confirmation alert

  /* build S5's file: the students' chart (sb2026) is in neither the file nor the Tracker's catalogue under that id */
  const ex = exported
  const course = ex.students.courses[0]
  const cb = ex.students.byCourse[course.id]
  const sylId = cb.plan.sylId
  const s5 = JSON.parse(JSON.stringify(ex))
  const GONE = 'scnotthere'
  s5.charts.sylcat = s5.charts.sylcat.filter(e => e.id !== sylId)
  delete s5.charts.syllabi[sylId]
  s5.charts.order = s5.charts.order.filter(x => x !== sylId)
  delete s5.charts.layouts[sylId]
  if (s5.charts.eventInfoBySyl) delete s5.charts.eventInfoBySyl[sylId]
  s5.students.sylcat = (s5.students.sylcat || []).filter(e => e.id !== sylId)
  const blk = s5.students.byCourse[course.id]
  blk.bySyllabus = { [GONE]: { ...cb.bySyllabus[sylId], roster: [...cb.bySyllabus[sylId].roster, { id: 'szzzzzzzzzzzzzz', name: 'STUDENT ZED' }] } }
  blk.plan.sylId = GONE
  s5Path = resolve(TMP, 'night1018-job2-s5.json'); writeFileSync(s5Path, JSON.stringify(s5, null, 2))
  /* S6's file: version 2, a name-keyed students block, no charts */
  const s6 = { format: ex.format, version: 2, savedAt: ex.savedAt, contains: { charts: false, students: true, links: false }, charts: null,
    students: { courses: ex.students.courses, byCourse: { [course.id]: { plan: { sylName: '2026', mode: 'pace', epw: 2, target: null, target2: null, lulls: [] }, lulls: {}, pace: {}, bySyllabus: { '2026': { roster: [...cb.bySyllabus[sylId].roster, { id: 'szzzzzzzzzzzzzy', name: 'STUDENT YANKEE' }], marks: {}, dates: {} } } } } } }
  s6Path = resolve(TMP, 'night1018-job2-s6.json'); writeFileSync(s6Path, JSON.stringify(s6, null, 2))

  const before = await rosterNames(page)
  const chartsBefore = await L.core(page, c => c.sylsNow().map(s => s.id + ':' + s.name))
  console.log('students before S5:', JSON.stringify(before), 'charts:', JSON.stringify(chartsBefore))

  async function importFile(page, path) {
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), (async () => { await page.click('text=⇪ File'); await page.click('#importFileBtn') })()])
    await fc.setFiles(path)
  }

  let s5text = ''
  await step('S5 desktop: a current file whose marks belong to a missing chart is refused in the D1015 words', page, null, async () => {
    await importFile(page, s5Path)
    const r = await runDialogs(page, { stopAt: /Student marks not brought in|older version/, shotName: 's5-refusal-desktop' })
    const hit = r.seen.find(d => /Student marks not brought in|older version/.test(d.text))
    s5text = hit ? hit.text : ''
    const seenAll = r.seen.map(d => d.text.split('\n')[0].slice(0, 60))
    const exact = s5text.replace(/\s+/g, ' ').trim() === NEWWORDS.trim() || s5text.replace(/\s+/g, ' ').includes(NEWWORDS)
    return { ok: exact && !/older version/.test(s5text), note: `dialogs in order ${JSON.stringify(seenAll)}; refusal text read: "${s5text.replace(/\n/g, ' ')}"; exact match ${exact}` }
  })
  results[results.length - 1].shot = 's5-refusal-desktop.png'
  /* leave the refusal up for its picture (taken in runDialogs), then press OK and read the closing report */
  const closing = await runDialogs(page, { shotName: null })
  const report = closing.seen.map(d => d.text).join(' || ').replace(/\n+/g, ' ')
  await page.waitForTimeout(400)
  await step('S7 after S5: the charts in the file were brought in, and no student was added', page, 's7-after-s5', async () => {
    const after = await rosterNames(page)
    const zed = await storageHas(page, 'STUDENT ZED')
    const chartsAfter = await L.core(page, c => c.sylsNow().map(s => s.id + ':' + s.name))
    const ok = /Brought in/i.test(report) && after.length === before.length && !after.includes('STUDENT ZED') && !zed
    return { ok, note: `closing report "${report.slice(0, 200)}"; students before ${before.length} (${before.join(', ')}) after ${after.length} (${after.join(', ')}); "STUDENT ZED" anywhere in stored data ${zed}; charts before ${chartsBefore.length} after ${chartsAfter.length}` }
  })

  let s6text = ''
  await step('S6 desktop: a file really saved by version 2 keeps the older-version words', page, null, async () => {
    await importFile(page, s6Path)
    const r = await runDialogs(page, { stopAt: /Student marks not brought in|older version/, shotName: 's6-older-version-refusal' })
    const hit = r.seen.find(d => /Student marks not brought in|older version/.test(d.text))
    s6text = hit ? hit.text : ''
    const seenAll = r.seen.map(d => d.text.split('\n')[0].slice(0, 60))
    return { ok: /saved by an older version/.test(s6text) && !/Student marks not brought in/.test(s6text), note: `dialogs in order ${JSON.stringify(seenAll)}; refusal text read: "${s6text.replace(/\n/g, ' ')}"` }
  })
  results[results.length - 1].shot = 's6-older-version-refusal.png'
  await runDialogs(page)
  const afterS6 = await rosterNames(page)
  const yank = await storageHas(page, 'STUDENT YANKEE')
  const ok6b = afterS6.length === before.length && !yank
  results.push({ id: 'S6b after S6: no student added', ok: ok6b, note: `students now ${afterS6.length} (${afterS6.join(', ')}); "STUDENT YANKEE" in stored data ${yank}`, shot: '' })
  console.log(`${ok6b ? 'PASS' : 'FAIL'} S6b: ${results[results.length - 1].note}`)
  allErrors.push(...errors.map(e => 'Tracker desktop admin: ' + e))
  await browser.close()
}

/* S5 on a phone: a fresh phone browser, same file */
{
  const { browser, page, errors } = await L.open({ who: 'a', size: L.PHONE, touch: true })
  await noPickers(page)
  await step('S5 phone: the same refusal, in the D1015 words', page, null, async () => {
    // on a phone the File menu sits in the header; reach it by its own button
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), (async () => { await page.click('text=⇪ File'); await page.click('#importFileBtn') })()])
    await fc.setFiles(s5Path)
    const r = await runDialogs(page, { stopAt: /Student marks not brought in|older version/, shotName: 's5-refusal-phone' })
    const hit = r.seen.find(d => /Student marks not brought in|older version/.test(d.text))
    const t = hit ? hit.text.replace(/\s+/g, ' ').trim() : ''
    return { ok: t.includes(NEWWORDS), note: `refusal text read on the phone: "${t}"` }
  })
  results[results.length - 1].shot = 's5-refusal-phone.png'
  await runDialogs(page)
  allErrors.push(...errors.map(e => 'Tracker phone admin: ' + e))
  await browser.close()
}

console.log('\n==== SUMMARY ====')
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} | ${r.id} | ${r.shot}`)
console.log('console/page errors, 4xx, native dialogs:', allErrors.length ? JSON.stringify(allErrors, null, 1) : 'none')
