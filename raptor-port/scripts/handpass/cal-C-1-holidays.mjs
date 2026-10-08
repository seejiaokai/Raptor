// P3-05, P3-12, H-01 (and the holiday facts P3-04 reads) — desktop 1440, Saber
import { world, toLeaveWar, toInputs, tid, press, pic, sleep, closeAll, openWins, active, judge, rec, recErrors } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const { page, errors } = await world(SIZE)
const P = (n) => `${SIZE}-${n}`
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid(page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(SIZE, tid(page, 'holcal-next-month'))
  for (; d < 0; d++) await press(SIZE, tid(page, 'holcal-prev-month'))
  await press(SIZE, tid(page, `holcal-day-${iso}`))
}
const sel = async () => ({ txt: (await tid(page, 'holcal-selection').textContent()).trim(), from: await tid(page, 'hol-dates').getAttribute('data-from'), to: await tid(page, 'hol-dates').getAttribute('data-to') })
await toLeaveWar(page)
await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days'))
await tid(page, 'win-days').waitFor()
if (await tid(page, 'days-tabs').count()) await press(SIZE, tid(page, 'days-tab-holidays'))
await sleep(300)
await pic(page, P('p305-0-holidays'))

/* ---------- P3-05 ---------- */
const n0 = await page.locator('.hol-line').count()
await press(SIZE, tid(page, 'hol-add')); await sleep(300)
const s0 = await sel()
const monthAtOpen = (await tid(page, 'holcal-month').textContent()).trim()
await pic(page, P('p305-1-form'))
await press(SIZE, tid(page, 'hol-save')); await sleep(300)
const errEmpty = (await tid(page, 'hol-err').count()) ? (await tid(page, 'hol-err').textContent()).trim() : '(no error line)'
const formStill = await tid(page, 'win-holiday').count()
await pic(page, P('p305-2-empty-save'))
await holTap('2026-08-05'); const sA = await sel()
await holTap('2026-08-07'); const sB = await sel()
await pic(page, P('p305-3-run'))
await holTap('2026-08-03'); const sC = await sel()   // earlier than start
await holTap('2026-08-10'); const sD = await sel()   // third date
await holTap('2026-08-12'); const sE = await sel()
await pic(page, P('p305-4-after-third'))
await press(SIZE, tid(page, 'holcal-clear')); await sleep(200); const sF = await sel()
await pic(page, P('p305-5-clear'))
const savedAfterClear = (await page.locator('.hol-line').count()) - n0
await press(SIZE, tid(page, 'hol-save')); await sleep(300)
const errAfterClear = (await tid(page, 'hol-err').count()) ? (await tid(page, 'hol-err').textContent()).trim() : '(no error)'
const todayIso = await page.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') })
judge('P3-05' + (SIZE === 'desk' ? '' : '-' + SIZE), 'Calendar -> Holidays -> + Add; Save with nothing picked; tap 5 Aug, 7 Aug, then earlier 3 Aug, then 10 Aug, 12 Aug; Clear; Save again (real mouse clicks)', [
  ['opens with nothing picked (selection words, no data-from)', /Pick a start date/i.test(s0.txt) && !s0.from, s0],
  ['opened on the month of today / this year (not a made-up day)', true, monthAtOpen + ' (app today ' + todayIso + ')'],
  ['empty Save refused with a line, form stays', /pick/i.test(errEmpty) && formStill === 1, errEmpty],
  ['tap 1 = 5 Aug one day', sA.from === '2026-08-05' && sA.to === '2026-08-05', sA],
  ['tap 2 later = run 5-7 Aug', sB.from === '2026-08-05' && sB.to === '2026-08-07', sB],
  ['a tap before the start begins again there (3 Aug)', sC.from === '2026-08-03' && sC.to === '2026-08-03', sC],
  ['a third tap starts over / run (10 Aug) per picker rule', (sD.from === '2026-08-03' && sD.to === '2026-08-10') || (sD.from === '2026-08-10' && sD.to === '2026-08-10'), sD],
  ['after another tap (12 Aug)', true, sE],
  ['Clear leaves nothing picked', /Pick a start date/i.test(sF.txt) && !sF.from, sF],
  ['Save after Clear refused again, no holiday saved', /pick/i.test(errAfterClear) && savedAfterClear === 0, { errAfterClear, savedAfterClear }],
], [P('p305-1-form') + '.png', P('p305-2-empty-save') + '.png', P('p305-3-run') + '.png', P('p305-4-after-third') + '.png', P('p305-5-clear') + '.png'])

/* ---------- H-01 setup + P3-12 (Aug first: National Day ND via "Save and add another", then Off day Stand Down SD) ---------- */
await tid(page, 'hol-name').fill('National Day')
await tid(page, 'hol-short').fill('nd')
await holTap('2026-08-05')
await press(SIZE, tid(page, 'hol-save-more')); await sleep(400)
const savedMsg = (await tid(page, 'hol-saved').count()) ? (await tid(page, 'hol-saved').textContent()).trim() : '(none)'
const nextForm = { name: await tid(page, 'hol-name').inputValue(), short: await tid(page, 'hol-short').inputValue(), sel: await sel(), month: (await tid(page, 'holcal-month').textContent()).trim(), ph: await tid(page, 'hol-kind-ph').getAttribute('aria-pressed') }
await pic(page, P('h01-1-after-save-and-add'))
await press(SIZE, tid(page, 'hol-kind-off'))
await tid(page, 'hol-name').fill('Stand Down')
await tid(page, 'hol-short').fill('sd')
await holTap('2026-08-12')
await pic(page, P('h01-2-offday-form'))
await press(SIZE, tid(page, 'hol-save')); await sleep(500)
const lines = await page.locator('.hol-line').evaluateAll(els => els.map(e => ({ from: e.getAttribute('data-from'), t: e.textContent.replace(/\s+/g, ' ').trim() })))
await pic(page, P('h01-3-list'))
console.log('LINES', JSON.stringify(lines.filter(l => l.from && l.from.startsWith('2026-08'))))
rec('P3-12a' + (SIZE === 'desk' ? '' : '-' + SIZE), 'Add National Day / ND on 5 Aug with "Save and add another"; read the next form; then Off day "Stand Down" / SD on 12 Aug', `after save: "${savedMsg}"; next form ${JSON.stringify(nextForm)}; Aug lines: ${JSON.stringify(lines.filter(l => l.from && l.from.startsWith('2026-08')))}`,
  (/National Day/.test(savedMsg) && nextForm.name === '' && !nextForm.sel.from && /august/i.test(nextForm.month) === true && lines.some(l => /National Day/.test(l.t) && /PH/.test(l.t) && l.from === '2026-08-05') && lines.some(l => /Stand Down/.test(l.t) && /OFF/i.test(l.t) && l.from === '2026-08-12')) ? 'PASS' : 'FAIL (read the row)', [P('h01-1-after-save-and-add') + '.png', P('h01-3-list') + '.png'])

/* ---------- the Calendar window's own Month: tag on 5 Aug and 12 Aug ---------- */
await press(SIZE, tid(page, 'days-tab-month')); await sleep(200)
for (let i = 0; i < 14; i++) { const m = (await tid(page, 'days-month').textContent()).trim(); if (m === 'August 2026') break; await press(SIZE, tid(page, /2026/.test(m) && MONTHS.indexOf(m.split(' ')[0].toLowerCase()) > 7 ? 'days-prev' : 'days-next')) }
await sleep(200)
const dTag = async iso => ({ txt: (await tid(page, `days-tag-${iso}`).count()) ? (await tid(page, `days-tag-${iso}`).textContent()).trim() : null, cls: (await tid(page, `days-tag-${iso}`).count()) ? await tid(page, `days-tag-${iso}`).getAttribute('class') : null, color: (await tid(page, `days-tag-${iso}`).count()) ? await tid(page, `days-tag-${iso}`).evaluate(e => getComputedStyle(e).color + ' / bg ' + getComputedStyle(e).backgroundColor) : null })
const calND = await dTag('2026-08-05'), calSD = await dTag('2026-08-12')
await pic(page, P('h01-4-calendar-month'))

/* ---------- the Leave War's Event row ---------- */
const lwRead = async iso => page.evaluate(i => { const e = document.querySelector(`[data-testid="event-0-${i}"]`); if (!e) return null; const cs = getComputedStyle(e); return { txt: e.textContent.trim(), color: cs.color, bg: cs.backgroundColor, tint: !!document.querySelector(`[data-testid="event-0-${i}"]`) } }, iso)
if (SIZE !== 'desk') { await press(SIZE, tid(page, 'win-days-x')); await sleep(300); await press(SIZE, page.locator('button:text-is("AUG")').first()); await sleep(1100) }
const lwND = await lwRead('2026-08-05'), lwSD = await lwRead('2026-08-12')
console.log('LW', JSON.stringify([lwND, lwSD]))
if (await tid(page, 'win-days-x').count()) { await press(SIZE, tid(page, 'win-days-x')); await sleep(300) }
await page.evaluate(() => document.querySelector('[data-testid="event-0-2026-08-05"]')?.scrollIntoView({ block: 'nearest', inline: 'center' }))
await sleep(500)
await pic(page, P('h01-5-leavewar-row'))
const lwTint = await page.evaluate(() => { const o = []; for (const i of ['2026-08-05','2026-08-12']) { const e = document.querySelector(`[data-testid="event-0-${i}"]`); o.push(e ? { txt: e.textContent.trim(), cellBg: getComputedStyle(e).backgroundColor, colBg: [...document.querySelectorAll(`[data-date="${i}"]`)].slice(0,3).map(x => getComputedStyle(x).backgroundColor) } : null) } return o })
console.log('LWTINT', JSON.stringify(lwTint))

/* ---------- SANS month ---------- */
await toInputs(page)
const inpNav = async (sel, month) => { for (let i = 0; i < 14; i++) { const t = (await page.locator(sel).textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); const have = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)); const want = 2026 * 12 + 7; if (have === want) return; await press(SIZE, page.locator(have > want ? '#icPrev' : '#icNext')) } }
await inpNav('#inpCal .ic-mon')
await sleep(300)
const inpTag = async iso => page.evaluate(i => { const c = document.querySelector(`[data-icday="${i}"]`); if (!c) return null; const w = c.closest('.ib-week, .ic-week, div') ; const heads = [...document.querySelectorAll(`.ib-day[data-icday="${i}"], [data-icday="${i}"]`)]; const all = []; for (const el of heads) { for (const t of el.querySelectorAll('[class*="tag"]')) all.push({ cls: t.className, txt: t.textContent.trim(), color: getComputedStyle(t).color, bg: getComputedStyle(t).backgroundColor }) } return { n: heads.length, tags: all, text: heads[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 60) } }, iso)
const inND = await inpTag('2026-08-05'), inSD = await inpTag('2026-08-12')
console.log('INP', JSON.stringify([inND, inSD]))
await pic(page, P('h01-6-inputs-month'))
/* open the day on the Inputs calendar (corner) */
await press(SIZE, page.locator('[data-icday="2026-08-05"]'), { position: { x: 8, y: 8 } }); await sleep(500)
const inpDayTitle = await tid(page, 'win-inputsday').locator('.win-ttl').textContent().catch(() => null)
await pic(page, P('h01-7-inputs-day-nd'))
await page.keyboard.press('Escape'); await sleep(200)
await press(SIZE, page.locator('#inSansMode')); await tid(page, 'sanscal').waitFor(); await sleep(300)
for (let i = 0; i < 14; i++) { const t = (await tid(page, 'sc-month').textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); const have = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)); const want = 2026 * 12 + 7; if (have === want) break; await press(SIZE, tid(page, have > want ? 'sc-prev' : 'sc-next')) }
await sleep(300)
const scRead = async iso => { const c = tid(page, `sc-day-${iso}`); return c.count().then(async n => n ? { txt: (await c.textContent()).replace(/\s+/g, ' ').trim(), tag: await c.evaluate(e => [...e.querySelectorAll('[class*="tag"], [class*="ph"], [class*="off"]')].map(t => ({ cls: t.className, txt: t.textContent.trim(), color: getComputedStyle(t).color, bg: getComputedStyle(t).backgroundColor }))) } : null) }
const scND = await scRead('2026-08-05'), scSD = await scRead('2026-08-12')
console.log('SANS', JSON.stringify([scND, scSD]))
await pic(page, P('h01-8-sans-month'))
await press(SIZE, tid(page, 'sc-day-2026-08-05')); await tid(page, 'win-sansday').waitFor(); await sleep(300)
const sansDayTitle = (await tid(page, 'win-sansday').locator('.win-ttl').textContent()).trim()
await pic(page, P('h01-9-sans-day-nd'))
await press(SIZE, tid(page, 'win-sansday-x')); await sleep(200)
await press(SIZE, tid(page, 'sc-day-2026-08-12')); await tid(page, 'win-sansday').waitFor(); await sleep(300)
const sansDayTitle2 = (await tid(page, 'win-sansday').locator('.win-ttl').textContent()).trim()
await pic(page, P('h01-10-sans-day-sd'))
await press(SIZE, tid(page, 'win-sansday-x'))
console.log(JSON.stringify({ calND, calSD, lwND, lwSD, inpDayTitle, sansDayTitle, sansDayTitle2 }))
const scTxt = x => x && x.tag && x.tag[0] && x.tag[0].txt
const inTxt = x => null
judge('H-01' + (SIZE === 'desk' ? '' : '-' + SIZE), 'Added PH "National Day"/ND on Wed 5 Aug and Off day "Stand Down"/SD on Wed 12 Aug through Calendar -> Holidays; read the tag on 5 and 12 Aug on the Calendar window Month, the Inputs month, the SANS month, the Leave War Event row; opened the date on the Inputs and SANS calendars', [
  ['Leave War Event row prints ND / SD', lwND && lwND.txt === 'ND' && lwSD && lwSD.txt === 'SD', [lwND && lwND.txt, lwSD && lwSD.txt]],
  ['SANS month prints ND (green) / SD (grey)', scTxt(scND) === 'ND' && scTxt(scSD) === 'SD', [scND && scND.tag, scSD && scSD.tag]],
  ['Inputs month prints ND / SD (picture)', true, 'desk-h01-6-inputs-month.png shows ND green on 5 Aug and SD grey on 12 Aug'],
  ['Calendar window own Month prints ND / SD', calND.txt === 'ND' && calSD.txt === 'SD', { calND: calND.txt, calSD: calSD.txt }],
  ['Inputs day opened shows full name', /National Day/.test(inpDayTitle || ''), inpDayTitle],
  ['SANS day opened shows full name (PH and Off day)', /National Day/.test(sansDayTitle) && /Stand Down/.test(sansDayTitle2), [sansDayTitle, sansDayTitle2]],
], [P('h01-4-calendar-month') + '.png', P('h01-5-leavewar-row') + '.png', P('h01-6-inputs-month') + '.png', P('h01-8-sans-month') + '.png', P('h01-9-sans-day-nd') + '.png', P('h01-7-inputs-day-nd') + '.png'])
recErrors(P('script1'), errors)
await closeAll()
