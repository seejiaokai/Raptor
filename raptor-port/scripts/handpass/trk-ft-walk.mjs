/* [TRK-FILE-TRANSFER-SPLIT] — the RECORDING walk (17 Oct 26; docs/walk-scripts.md §8). The import's store-free steps
   moved out of the Tracker's main file; nothing a person sees may change. So the File menu's Import is driven on the
   build BEFORE the move and the build AFTER it, with the clock held and the random numbers seeded (every minted id
   repeats), and the two records are compared as text: every question and message the import put, in order, and every
   Tracker record in the browser's storage after each scenario. Two runs of the SAME build are compared first — that is
   what proves the comparison sees only the code.
   The OS file picker cannot be driven, so each file is handed in through the app's own test hooks
   (window.__pickOpenForTests / __pickSaveForTests, as the Tracker's browser suite does); every other step presses the
   real control — the File menu, Import, Export, the question's own buttons — by finger on the phone.
   Scenarios: S1 a whole backup (charts, students and marks) exported and brought back, every chart replaced;
   S2 an older (version 2) file with a chart and students — the chart comes, the students are refused;
   S3 a new chart, then a file that would give its name to a different chart — refused, nothing changed;
   S4 a chart whose name is here, brought in "Add as new" with its students — they follow the new chart;
   S5 a file whose students point at a chart it does not carry — the students are refused, the charts come.
   node scripts/handpass/trk-ft-walk.mjs <base url> <out folder> [desk|phone] */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const [BASE, OUT, SIZE = 'desk'] = process.argv.slice(2)
if (!BASE || !OUT) { console.error('usage: trk-ft-walk.mjs <base url> <out folder> [desk|phone]'); process.exit(2) }
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const phone = SIZE === 'phone'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext(phone
  ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
  : { viewport: { width: 1440, height: 900 } })
/* every id the app mints is Date.now + Math.random: hold the one, seed the other */
await ctx.addInitScript(() => {
  let a = 0x9e3779b9
  Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
})
const page = await ctx.newPage()
await page.clock.setFixedTime(new Date('2026-10-17T09:00:00+08:00'))
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
const sleep = ms => page.waitForTimeout(ms)
const press = async sel => { const l = page.locator(sel).first(); if (phone) await l.tap(); else await l.click() }

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('tracker'))
await page.waitForFunction(() => window.CURPAGE === 'tracker')
await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
await sleep(600)

const record = { size: SIZE, scenarios: [] }
let shotN = 0
const shot = async name => { shotN++; await page.screenshot({ path: join(OUT, `${String(shotN).padStart(2, '0')}-${name}.png`) }) }
/* every Tracker record in storage, sorted — plus what the screen lists */
const state = () => page.evaluate(() => {
  const keys = Object.keys(localStorage).filter(k => /tracker|ocu:/i.test(k)).sort()
  const opts = sel => [...document.querySelectorAll(sel + ' option')].map(o => o.textContent)
  return { storage: keys.map(k => [k, localStorage.getItem(k)]), syllabi: opts('#sylSel'), courses: opts('#courseSel'), students: opts('#activeSel') }
})
const menuItem = async item => {
  await press('#fileMenuBtn'); await sleep(200)
  await press(item); await sleep(300)
}
/* answer the import's questions in order; `answers` is a list of 'ok' | 'alt' | 'cancel' | { type: text } — returns
   every message shown. A question nobody planned for is recorded and closed with OK, and named as unplanned. */
async function answerAll(tag, answers) {
  const seen = []
  for (let i = 0; ; i++) {
    const up = await page.locator('#dlgModal').waitFor({ state: 'visible', timeout: 4000 }).then(() => true, () => false)
    if (!up) break
    const msg = ((await page.locator('#dlgMsg').textContent()) || '').replace(/\s+/g, ' ').trim()
    await shot(`${tag}-q${i + 1}`)
    const a = i < answers.length ? answers[i] : 'ok'
    seen.push(i < answers.length ? msg : 'UNPLANNED: ' + msg)
    if (a && typeof a === 'object') { await page.fill('#dlgInput', a.type); await press('#dlgOk') }
    else await press(a === 'alt' ? '#dlgAlt' : a === 'cancel' ? '#dlgCancel' : '#dlgOk')
    await sleep(700)
  }
  return seen
}
const feed = file => page.evaluate(f => { const text = JSON.stringify(f); window.__pickOpenForTests = async () => ({ name: 'walk.json', text }) }, file)
const build = (charts, students, version) => page.evaluate(([c, s, v]) =>
  window.__fileFormatForTests.buildFile({ charts: c, students: s, savedAt: '2026-10-17T01:00:00.000Z', ...(v ? { version: v } : {}) }), [charts, students, version])
const ev = (id, type = 'acad', prereqs = []) => ({ id, type, prereqs, phase: 'P' })
async function scenario(tag, what, file, answers) {
  await feed(file)
  await menuItem('#importFileBtn')
  const dialogs = await answerAll(tag, answers)
  await page.evaluate(() => { delete window.__pickOpenForTests })
  await sleep(500); await shot(`${tag}-after`)
  record.scenarios.push({ tag, what, dialogs, after: await state() })
  console.log(`${tag} — ${what}\n   ${dialogs.join('\n   ') || '(no question)'}`)
}

record.start = await state()

/* S1 — the whole backup, through the real Export: every chart ticked, students & marks ticked */
await page.evaluate(() => { window.__pickSaveForTests = async name => ({ name, createWritable: async () => ({ write: async t => { window.__exportedForTests = t }, close: async () => {} }) }) })
await menuItem('#exportBtn'); await sleep(400)
await shot('s1-export-window')
await press('#copyTickAll'); await sleep(200)
const stuBox = page.locator('#copyStudents'); if (!(await stuBox.isChecked())) { if (phone) await stuBox.tap(); else await stuBox.check() }
await press('#copyOk'); await sleep(1200)
const exportDialogs = await answerAll('s1-export', [])
const whole = await page.evaluate(() => JSON.parse(window.__exportedForTests || 'null'))
await page.evaluate(() => { delete window.__pickSaveForTests; delete window.__exportedForTests })
record.exported = { dialogs: exportDialogs, contains: whole && whole.contains, charts: whole && whole.charts && whole.charts.order }
if (!whole || !whole.contains || !whole.contains.students) throw new Error('S1: the export did not carry the students — the walk cannot start')
const nCharts = whole.charts.order.length
await scenario('s1', 'a whole backup brought back, every chart replaced, students yes', whole, [...Array(nCharts).fill('ok'), 'ok', 'ok'])

/* S2 — an older file (version 2): a chart by name and a students block by name */
await scenario('s2', 'an older file: the chart comes, the students are refused',
  await build({ order: ['WALK OLD'], syllabi: { 'WALK OLD': [ev('WO-01'), ev('WO-02', 'flight', ['WO-01'])] }, layouts: {}, eventInfo: {} },
    { courses: ['WALK OLD COURSE'], byCourse: { 'WALK OLD COURSE': { plan: { sylName: 'WALK OLD' }, lulls: {}, pace: {}, bySyllabus: { 'WALK OLD': { roster: ['WALK OLD STU'], marks: {}, dates: {} } } } } }, 2),
  ['ok', 'ok', 'ok'])

/* S3 — a new chart, then a file that hands its name to a different chart */
await scenario('s3a', 'a new chart, straight in',
  await build({ order: ['scwalky'], syllabi: { scwalky: [ev('WY-01')] }, layouts: {}, eventInfo: {}, sylcat: [{ id: 'scwalky', name: 'WALK Y' }] }, null), ['ok'])
await scenario('s3b', 'a file that gives that name to a different chart: refused, nothing changed',
  await build({ order: ['scwalky', 'scwalkb'], syllabi: { scwalky: [ev('WZ-01')], scwalkb: [ev('WB-01')] }, layouts: {}, eventInfo: {}, sylcat: [{ id: 'scwalky', name: 'WALK Z' }, { id: 'scwalkb', name: 'WALK Y' }] }, null), ['ok'])

/* S4 — a chart named like one here, "Add as new", with students on it */
await scenario('s4', 'a chart already here, added as new with its students: they follow the new chart',
  await build({ order: ['scwalkn'], syllabi: { scwalkn: [ev('WN-01'), ev('WN-02', 'flight', ['WN-01'])] }, layouts: {}, eventInfo: {}, sylcat: [{ id: 'scwalkn', name: 'WALK Y' }] },
    { courses: [{ id: 'cwalkfour', name: 'WALK FOUR COURSE' }], sylcat: [{ id: 'scwalkn', name: 'WALK Y' }], byCourse: { cwalkfour: { plan: { sylId: 'scwalkn' }, lulls: {}, pace: {}, bySyllabus: { scwalkn: { roster: [{ id: 'swalk4', name: 'WALK FOUR STU' }], marks: { swalk4: { 'WN-01': { g: 'dco' } } }, dates: {} } } } } }),
  ['alt', { type: 'WALK Y TWO' }, 'ok', 'ok'])

/* S5 — students pointing at a chart the file does not carry */
await scenario('s5', 'students pointing at a chart the file does not carry: refused, the chart comes',
  await build({ order: ['scwalkf'], syllabi: { scwalkf: [ev('WF-01')] }, layouts: {}, eventInfo: {}, sylcat: [{ id: 'scwalkf', name: 'WALK FIVE' }] },
    { courses: [{ id: 'cwalkfive', name: 'WALK FIVE COURSE' }], sylcat: [{ id: 'scwalkf', name: 'WALK FIVE' }], byCourse: { cwalkfive: { plan: { sylId: 'scnowhere' }, lulls: {}, pace: {}, bySyllabus: {} } } }),
  ['ok', 'ok', 'ok'])

record.errors = errors
writeFileSync(join(OUT, 'record.json'), JSON.stringify(record, null, 1))
console.log(`errors: ${errors.length ? errors.join(' | ') : 'none'} · pictures: ${shotN} · ${join(OUT, 'record.json')}`)
await browser.close()
