// P3-02 (a holiday waiting for a leave period) and P3-03 (a run spanning outside coverage refuses whole) — desktop 1440, Saber
import { world, toLeaveWar, tid, press, pic, sleep, closeAll, judge, rec, recErrors } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const { page, errors } = await world(SIZE)
const P = n => `${SIZE}-${n}`
const monthOf = async (id) => { const [m, y] = (await tid(page, id).textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
async function tapOn(prefix, iso) {
  const id = prefix + '-month'
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await monthOf(id)
  for (; d > 0; d--) await press(SIZE, tid(page, prefix + '-next-month'))
  for (; d < 0; d++) await press(SIZE, tid(page, prefix + '-prev-month'))
  await press(SIZE, tid(page, `${prefix}-day-${iso}`))
}
const lines = () => page.locator('.hol-line').evaluateAll(els => els.map(e => ({ from: e.getAttribute('data-from'), t: e.textContent.replace(/\s+/g, ' ').trim() })))
const year = async () => +(await tid(page, 'hol-year').textContent())
async function toYear(y) { while ((await year()) < y) await press(SIZE, tid(page, 'hol-next')); while ((await year()) > y) await press(SIZE, tid(page, 'hol-prev')); await sleep(200) }
const txt = async id => (await tid(page, id).count()) ? (await tid(page, id).textContent()).trim() : null
const periods = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="war-picker"] option')].map(o => o.textContent.trim()))
async function addHol(name, short, a, b, { save = true } = {}) {
  await press(SIZE, tid(page, 'hol-add')); await sleep(200)
  await tid(page, 'hol-name').fill(name); if (short) await tid(page, 'hol-short').fill(short)
  await tapOn('holcal', a); if (b) await tapOn('holcal', b)
  if (save) { await press(SIZE, tid(page, 'hol-save')); await sleep(500) }
}
await toLeaveWar(page)
await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days'))
await tid(page, 'win-days').waitFor(); await press(SIZE, tid(page, 'days-tab-holidays')); await sleep(300)

/* ===== P3-02 A: no period at all (2031): wait, then "Create the 2031 leave period" ===== */
await toYear(2031)
const noCover = await txt('hol-nocover')
await addHol('Wait One', 'w1', '2031-08-09')
const waitA = { err: await txt('hol-err'), waiting: await txt('hol-waiting'), createBtn: await txt('hol-wait-create'), formOpen: await tid(page, 'win-holiday').count(), list: (await lines()).length }
await pic(page, P('p302-1-waiting-2031'))
await press(SIZE, tid(page, 'hol-wait-create')); await sleep(900)
const afterA = { formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2031')), periods: await periods() }
await pic(page, P('p302-2-after-create-2031'))

/* ===== B: cancel the waiting holiday, then create the period: it must not appear ===== */
await toYear(2032)
await addHol('Cancelled Day', 'cd', '2032-05-05')
const waitB = { waiting: !!(await txt('hol-waiting')) }
await press(SIZE, tid(page, 'hol-cancel')); await sleep(300)
await press(SIZE, tid(page, 'hol-create-year')); await sleep(900)
const afterB = { formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2032')), empty: await txt('hol-empty') }
await pic(page, P('p302-3-cancelled-then-created'))

if (SIZE === 'desk') {
/* ===== C: edit the waiting holiday (the wait ends), create the period: nothing saves by itself; then Save once ===== */
await toYear(2033)
await addHol('Edit Day', 'ed', '2033-04-04')
var waitC = { waiting: !!(await txt('hol-waiting')) }
await tid(page, 'hol-name').fill('Edited Day'); await tapOn('holcal', '2033-04-05')
var waitingGoneAfterEdit = (await tid(page, 'hol-waiting').count()) === 0
await press(SIZE, tid(page, 'hol-create-year')); await sleep(900)
var afterC1 = { formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2033')) }
await pic(page, P('p302-4-edited-then-created'))
if (afterC1.formOpen) { await press(SIZE, tid(page, 'hol-save')); await sleep(600) }
var afterC2 = { formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2033')) }

}
else console.log('C skipped at phone width: the open form covers the Holidays list and its Create button, so a wait cannot be completed with the form still open')
/* ===== D: a period covers only part of 2034 — made on the Leave War's + New sheet ===== */
if (SIZE !== 'desk') { await press(SIZE, tid(page, 'win-days-x')); await sleep(400) }   // on a phone the window covers the war's + New
await press(SIZE, tid(page, 'war-new')); await tid(page, 'war-sheet').waitFor(); await sleep(300)
await tid(page, 'war-name').fill('Q1 34'); await tapOn('war', '2034-01-01'); await tapOn('war', '2034-03-31')
await pic(page, P('p302-5-new-period-q1'))
await press(SIZE, tid(page, 'war-create')); await sleep(900)
if (SIZE !== 'desk') { await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days')); await tid(page, 'win-days').waitFor(); await sleep(500); await pic(page, P('p302-5b-reopened')); await press(SIZE, tid(page, 'days-tab-holidays')); await sleep(500) }
await toYear(2034)
const partNotice = await txt('hol-nocover')
const partButtons = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="hol-new-period-"]')].map(b => b.textContent.trim()))
await pic(page, P('p302-6-partial-notice'))
await addHol('Partial Day', 'pd', '2034-08-09')
const waitD = { err: await txt('hol-err'), waiting: await txt('hol-waiting'), btn: await txt('hol-wait-period') }
await press(SIZE, tid(page, 'hol-wait-period')); await tid(page, 'war-sheet').waitFor(); await sleep(500)
await pic(page, P('p302-7-period-sheet-over-calendar'))
const sheetHit = await page.evaluate(() => { const s = document.querySelector('[data-testid="war-sheet"]'); const r = s.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { inSheet: !!h && !!h.closest('[data-testid="war-sheet"]'), sel: (document.querySelector('[data-testid="war-selection"]') || {}).textContent } })
await tid(page, 'war-name').fill('Rest 34')
await press(SIZE, tid(page, 'war-create')); await sleep(1000)
const afterD = { formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2034')), periods: await periods() }
await pic(page, P('p302-8-after-partial-period'))

judge('P3-02' + (SIZE === 'desk' ? '' : '-' + SIZE), 'Calendar -> Holidays: add a PH where no period exists (2031) -> "Create the 2031 leave period"; cancel a waiting holiday then create the period (2032); edit a waiting holiday then create (2033); partial year (2034, Q1 made on + New): waiting -> "Add a leave period for…" sheet -> Create', [
  ['2031: notice says no period covers it', /No leave period covers 2031/.test(noCover || ''), noCover],
  ['2031: Save refused and the holiday waits, with the create button', !!waitA.waiting && /Create the 2031/.test(waitA.createBtn || '') && waitA.formOpen === 1, waitA],
  ['2031: after Create the holiday saved ONCE on 9 Aug and the form closed', afterA.formOpen === 0 && afterA.lines.length === 1 && afterA.lines[0].from === '2031-08-09', afterA],
  ['2032: cancelled holiday does NOT appear after the period is created', waitB.waiting && afterB.formOpen === 0 && afterB.lines.length === 0, { waitB, afterB }],
  ...(SIZE !== 'desk' ? [] : [['2033: an edit takes the wait down; creating the period does not save it by itself', waitC.waiting && waitingGoneAfterEdit && afterC1.lines.length === 0, { waitC, waitingGoneAfterEdit, afterC1 }]]),
  ...(SIZE !== 'desk' ? [] : [['2033: Save then saves the EDITED holiday once ("Edited Day", 4-5 Apr: the second tap on the picker extends the first, as the picker rules say)', afterC2.lines.length === 1 && afterC2.lines[0].from === '2033-04-04' && /Edited Day/.test(afterC2.lines[0].t) && /5 Apr/.test(afterC2.lines[0].t), afterC2]]),
  ['2034 partial: the notice names the uncovered dates and offers "Add a period for…"', /1 Apr/.test(partNotice || '') && partButtons.length >= 1, { partNotice, partButtons }],
  ['2034: the holiday waits and offers the period button', !!waitD.waiting && /Add a leave period for/.test(waitD.btn || ''), waitD],
  ['2034: the New-period sheet opens in FRONT of Calendar (centre hit is the sheet)', sheetHit.inSheet, sheetHit],
  ['2034: after Create the holiday saved once on 9 Aug, form closed', afterD.formOpen === 0 && afterD.lines.length === 1 && afterD.lines[0].from === '2034-08-09', afterD],
], [P('p302-1-waiting-2031') + '.png', P('p302-2-after-create-2031') + '.png', P('p302-3-cancelled-then-created') + '.png', P('p302-4-edited-then-created') + '.png', P('p302-6-partial-notice') + '.png', P('p302-7-period-sheet-over-calendar') + '.png', P('p302-8-after-partial-period') + '.png'])

/* ===== P3-03: Q1 and Rest exist in 2034; an Original holiday on 10 Feb 2034 ===== */
await addHol('Original', 'or', '2034-02-10')
const orig0 = (await lines()).filter(l => l.from === '2034-02-10').length
/* run 30 Mar - 2 Apr: first date in Q1, last in Rest */
await addHol('Straddle', 'st', '2034-03-30', '2034-04-02')
const s1 = { err: await txt('hol-err'), formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => /Straddle/.test(l.t)) }
await pic(page, P('p303-1-straddle-refused'))
await press(SIZE, tid(page, 'hol-cancel')); await sleep(300)
/* a run past the end of the last period: 30 Dec 2034 - 2 Jan 2035 */
await addHol('Year End', 'ye', '2034-12-30', '2035-01-02')
const s2 = { err: await txt('hol-err'), waiting: await txt('hol-waiting'), formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => /Year End/.test(l.t)) }
await pic(page, P('p303-2-year-end-refused'))
await press(SIZE, tid(page, 'hol-cancel')); await sleep(300)
/* move the existing one there */
await page.locator('.hol-line[data-from="2034-02-10"]').click(); await sleep(300)
await press(SIZE, tid(page, 'holcal-clear')); await tapOn('holcal', '2034-03-30'); await tapOn('holcal', '2034-04-02')
const selMove = await txt('holcal-selection')
await press(SIZE, tid(page, 'hol-save')); await sleep(600)
const m1 = { err: await txt('hol-err'), formOpen: await tid(page, 'win-holiday').count(), lines: (await lines()).filter(l => l.from && l.from.startsWith('2034')), selMove }
await pic(page, P('p303-3-move-refused'))
if (await tid(page, 'hol-cancel').count()) await press(SIZE, tid(page, 'hol-cancel')); await sleep(300)
const after = (await lines()).filter(l => l.from && l.from.startsWith('2034'))
judge('P3-03' + (SIZE === 'desk' ? '' : '-' + SIZE), 'In 2034 (Q1 + Rest periods): add a run 30 Mar - 2 Apr (crosses the two periods); a run 30 Dec 2034 - 2 Jan 2035; then change the existing holiday of 10 Feb to 30 Mar - 2 Apr', [
  ['original holiday exists first', orig0 === 1, orig0],
  ['straddling run refused with a sentence, nothing saved', !!s1.err && s1.formOpen === 1 && s1.lines.length === 0, s1],
  ['year-end run (ends in an uncovered year) refused/waits as a whole, no partial 30-31 Dec saved', s2.lines.length === 0 && (!!s2.err || !!s2.waiting), s2],
  ['moving the original there is refused and the original is NOT deleted', !!m1.err && m1.lines.some(l => l.from === '2034-02-10' && /Original/.test(l.t)), m1],
  ['after cancel the 2034 list still holds Original 10 Feb once', after.filter(l => l.from === '2034-02-10').length === 1 && !after.some(l => /Straddle|Year End/.test(l.t)), after],
], [P('p303-1-straddle-refused') + '.png', P('p303-2-year-end-refused') + '.png', P('p303-3-move-refused') + '.png'])
recErrors(P('script4'), errors)
await closeAll()
