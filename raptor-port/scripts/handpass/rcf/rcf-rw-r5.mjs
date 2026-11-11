/* rcf-rw-r5 — R5: next week's published Monday and this week's Sunday (D1991). desktop. RECORD scenario: only the published faces are judged. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'r5b'
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/' + RUN)
console.log('rcf-rw-r5 v2', process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, check, note, norm, sleep, RESULTS } = X
const w = await X.world('desktop')
const { page } = w
console.log('BUNDLE', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(',')))
const ranger = w.ID('Ranger')
const pic = (name) => page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` })
const editWeek = async () => { await L.go(page, 'editsched'); await sleep(500) }
const toWeek = async (iso) => {
  await editWeek()
  await page.locator('.wk-cal:visible, .filt-cal:visible').first().click(); await sleep(500)
  const sel = `#weekCal [data-iso="${iso}"]`
  for (let i = 0; i < 3 && !(await page.locator(sel).count()); i++) { await page.locator('#weekCal [data-testid="wcal-next"]').first().click(); await sleep(400) }
  await page.locator(sel).first().click(); await sleep(1200)
  await editWeek()
  const r = await page.evaluate(() => ({ week: window.CURWEEK, mon: window.DAYS[0].dt }))
  console.log('calendar went to', JSON.stringify(r))
  return r
}
const refs = id => page.evaluate(id => JSON.stringify(window.DAYS.map((d, i) => [i, JSON.stringify(d).split('"' + id + '"').length - 1]).filter(x => x[1])), id)
const setLogic = async (val) => {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset="briefLead"]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) }
  const inp = page.locator('#lgBody input[data-lgset="briefLead"]').first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded()
  if (val != null) { await inp.fill(String(val)); await inp.press('Tab'); await sleep(500) }
  return { before, after: await inp.inputValue() }
}
/* what a surface shows for day di: the Breaks box, Ranger's pucks, the warning strip items */
const readDay = async (root, di) => {
  const strip = await X.stripItems(page, root, di)
  const d = await page.evaluate(([r, i, id]) => {
    const day = document.querySelector(`${r} .day[data-day="${i}"]`)
    if (!day) return null
    const txt = day.innerText.replace(/[\s ]+/g, ' ')
    const breaks = [...day.querySelectorAll('.wcode')].filter(e => e.offsetWidth).map(e => e.innerText.trim())
    const pk = [...day.querySelectorAll(`.puck[data-person="${id}"]`)].filter(e => e.offsetWidth).map(e => e.className.replace(/\s+/g, ' '))
    const tips = [...day.querySelectorAll('[title*="crew rest"], [title*="Breaks"]')].map(e => e.title.slice(0, 160))
    return { breaks, mentionsBreaks: /Breaks\s+(next )?Monday/i.test(txt), pk, tips }
  }, [root, di, ranger])
  return { strip: strip.items.filter(t => /Ranger/.test(t)), allStrip: strip.items.length, d }
}
const crestWords = items => items.filter(t => /(rest|Breaks)/i.test(t))

/* ---- 1. next week: Monday 20 Jul ---- */
const nw = await toWeek('2026-07-20')
check('R5.0a navigation: the week of 20 Jul', /Jul 20/.test(nw.mon), JSON.stringify(nw))
console.log('Ranger refs in 20 Jul week before', await refs(ranger))
await L.board(page, 0)
/* clear Ranger's other tasks on Monday: find his seats on waves */
const seats = await page.evaluate(id => { const out = []; window.DAYS[0].waves.forEach((wv, gi) => wv.formations.forEach((f, fi) => f.aircraft.forEach((a, ai) => { if (a.p === id) out.push(`0.${gi}.${fi}.${ai}.p`); if (a.w === id) out.push(`0.${gi}.${fi}.${ai}.w`) }))); return out }, ranger)
console.log('Ranger on Monday 20 Jul seats', JSON.stringify(seats))
for (const s of seats) console.log('unseat', s, JSON.stringify(await F.unseat2(page, `[data-slot="${s}"]`)))
console.log('Ranger refs after clearing', await refs(ranger))
const gM = await X.addWave(w, 0, '')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.cs"]`, 'VL')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.msn"]`, 'BFM')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.to"]`, '12:00')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.ld"]`, '13:00')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="0.${gM}.0.0.p"]`, ranger))
const ml = await page.evaluate(g => { const f = window.DAYS[0].waves[g].formations[0]; return `${f.cs} ${f.msn} to ${f.to} ld ${f.ld} B=${JSON.stringify(f.br)} R=${JSON.stringify(f.rl)} p=${f.aircraft[0].p}` }, gM)
check('R5.1a Monday 20 Jul line: VL BFM 12:00-13:00, B blank, Ranger', /VL BFM to 12:00 ld 13:00 B=(""|null|undefined) R=(""|null|undefined) p=bane/.test(ml), ml)
console.log('Ranger refs now', await refs(ranger))
await pic('r5-1-monday-built')
await L.closeBoard(page)
const sp = await X.signAndPublish(w, 0)
console.log('sign/publish', JSON.stringify({ sg: sp.sg, p: sp.p }))
await editWeek()
await L.go(page, 'viewsched'); await sleep(600)
const mv0 = await readDay('#vWeek', 0)
const mTag = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"] .day-head'); return d ? d.innerText.replace(/[\s ]+/g, ' ').slice(0, 80) : 'NO HEAD' })
check('R5.1b Monday 20 Jul published (View-only Sched shows its ORIG face)', /ORIG/.test(mTag) && sp.p.pressed, `${mTag} | pressed ${JSON.stringify(sp.p)}`)
console.log('View-only Monday 20 Jul before any change:', JSON.stringify(mv0))
await pic('r5-2-monday-published-viewonly')

/* ---- 3. this week: Sunday 19 Jul: Ranger only on a duty desk 13:00-21:30 ---- */
const tw = await toWeek('2026-07-13')
check('R5.3a navigation: back to the week of 13 Jul', /Jul 13/.test(tw.mon), JSON.stringify(tw))
console.log('Ranger refs, 13 Jul week (Sunday is day 6):', await refs(ranger))
await L.board(page, 6)
const sSeats = await page.evaluate(id => { const out = []; const d = window.DAYS[6]; d.waves.forEach((wv, gi) => wv.formations.forEach((f, fi) => f.aircraft.forEach((a, ai) => { if (a.p === id) out.push(`6.${gi}.${fi}.${ai}.p`); if (a.w === id) out.push(`6.${gi}.${fi}.${ai}.w`) }))); return out }, ranger)
console.log('Ranger on Sunday waves', JSON.stringify(sSeats))
await X.press(w, '[data-dradd="6.0"]'); await sleep(500)
const ri = await page.evaluate(() => window.DAYS[6].dutywaves[0].rows.length - 1)
const keys = await page.evaluate(ri => [...document.querySelectorAll(`#schedBoard [data-bfld^="dr:6.0.${ri}."]`)].map(e => e.dataset.bfld), ri)
console.log('new duty row', ri, 'fields', JSON.stringify(keys))
await X.typeIn(w, `[data-bfld="dr:6.0.${ri}.role"]`, 'SXO')
await X.typeIn(w, `[data-bfld="dr:6.0.${ri}.str"]`, '13:00')
await X.typeIn(w, `[data-bfld="dr:6.0.${ri}.end"]`, '21:30')
console.log('seat desk', await X.seatPhoneAware(w, `[data-fill="d:6.0.${ri}.+"]`, ranger))
const dr = await page.evaluate(ri => JSON.stringify(window.DAYS[6].dutywaves[0].rows[ri]), ri)
check('R5.3b Sunday 19 Jul: Ranger on a duty desk 13:00-21:30', /"str":"13:00"/.test(dr) && /"end":"21:30"/.test(dr) && /"id":"bane"/.test(dr), dr)
console.log('Ranger refs on the 13 Jul week now', await refs(ranger))
await pic('r5-3-sunday-built')
await L.closeBoard(page)

/* ---- 4. View-only Sched: Sunday, before the raise ---- */
const read4 = async (tag, withWork) => {
  await L.go(page, 'viewsched'); await sleep(700)
  const v = await readDay('#vWeek', 6)
  const d = page.locator('#vWeek .day[data-day="6"]').first()
  await d.evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
  await pic(`r5-${tag}-sunday-viewonly`)
  console.log(`[${tag}] View-only Sunday`, JSON.stringify(v))
  let e = null
  if (withWork) {
    await editWeek()
    e = await readDay('#eWeek', 6)
    await page.locator('#eWeek .day[data-day="6"]').first().evaluate(x => x.scrollIntoView({ block: 'start' })); await sleep(300)
    await pic(`r5-${tag}-sunday-working`)
    console.log(`[${tag}] Edit Schedule (working copy) Sunday`, JSON.stringify(e))
  }
  return { v, e }
}
const s4 = await read4('4-before', true)
check('R5.4 View-only Sched, Sunday, default setting: no "Breaks Monday" mark for Ranger', s4.v && !s4.v.d.mentionsBreaks && !s4.v.d.breaks.some(t => /Breaks/.test(t)) && !s4.v.strip.some(t => /rest|Breaks/i.test(t)), JSON.stringify(s4.v))

/* ---- 4b. control: Monday 20 Jul's published face BEFORE the raise, with Sunday built ---- */
const mondayView = async (tag) => {
  await toWeek('2026-07-20')
  await L.go(page, 'viewsched'); await sleep(700)
  const m = await readDay('#vWeek', 0)
  await page.locator('#vWeek .day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
  await pic(`r5-${tag}-monday-viewonly`)
  console.log(`[${tag}] View-only Monday 20 Jul`, JSON.stringify(m))
  return m
}
const mv4 = await mondayView('4b-before-raise')
check('R5.4b control: Monday 20 Jul published face BEFORE the raise (Sunday built): no crew-rest line for Ranger', mv4 && !mv4.strip.some(t => /rest|Breaks/i.test(t)), JSON.stringify(mv4.strip))
await toWeek('2026-07-13')
/* ---- 5. raise the setting to 200 minutes ---- */
const lg0 = await setLogic(null)
console.log('briefLead before', JSON.stringify(lg0))
let target = '200'; const cur = String(lg0.before).trim()
if (/h/i.test(cur)) target = '3h20'; else if (/m/i.test(cur)) target = '200m'
const lg1 = await setLogic(target)
console.log('briefLead now', JSON.stringify(lg1))
await pic('r5-5-logic-raised')
check('R5.5 Logic "Brief before take-off" raised', String(lg1.after).trim() !== cur, `was ${JSON.stringify(lg0.before)} now ${JSON.stringify(lg1.after)}`)

/* ---- 6. View-only again ---- */
const s6 = await read4('6-after', true)
check('R5.6a View-only Sched, Sunday, after the raise: still NO "Breaks Monday" mark on Ranger', s6.v && !s6.v.d.mentionsBreaks && !s6.v.d.breaks.some(t => /Breaks/.test(t)) && !s6.v.strip.some(t => /rest|Breaks/i.test(t)), JSON.stringify(s6.v))
note('R5.6b Edit Schedule (working copy) Sunday after the raise — RECORD', JSON.stringify(s6.e))
/* Monday 20 Jul published face */
await toWeek('2026-07-20')
await L.go(page, 'viewsched'); await sleep(700)
const mv6 = await readDay('#vWeek', 0)
await page.locator('#vWeek .day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
await pic('r5-6-monday-viewonly-after')
console.log('View-only Monday 20 Jul after the raise', JSON.stringify(mv6))
check('R5.6c Monday 20 Jul published face (View-only Sched) after the raise: no crew-rest line for Ranger', mv6 && !mv6.strip.some(t => /rest|Breaks/i.test(t)), JSON.stringify(mv6))
await editWeek()
const mw = await readDay('#eWeek', 0)
note('R5.6d Edit Schedule (working copy) Monday 20 Jul after the raise — RECORD', JSON.stringify(mw))
await page.locator('#eWeek .day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start' })); await sleep(300)
await pic('r5-6-monday-working-after')
/* ---- 7. restore ---- */
const lg2 = await setLogic(lg0.before)
check('R5.7 Logic value restored', String(lg2.after).trim() === cur, `now ${JSON.stringify(lg2.after)} want ${JSON.stringify(lg0.before)}`)
const mv7 = await mondayView('7-after-restore')
note('R5.7b Monday 20 Jul published face after the setting is restored — RECORD', JSON.stringify(mv7.strip))
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
await w.browser.close()
