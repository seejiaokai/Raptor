/* rcf-rw2-q3 — Q3: View-only Sched's next-week preview prints a published day's B as it went out (D1991, D186). desktop, then phone 402 in the same context */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'q3a'
process.env.HP_URL ||= 'http://localhost:4293'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk2/' + RUN)
console.log('rcf-rw2-q3 v1', process.env.HP_SHOTS)
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
const setLogic = async (val) => {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset="briefLead"]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) }
  const inp = page.locator('#lgBody input[data-lgset="briefLead"]').first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded()
  if (val != null) { await inp.fill(String(val)); await inp.press('Tab'); await sleep(500) }
  return { before, after: await inp.inputValue() }
}
/* the preview's Monday: its B cell(s), and the form's text */
const peekMonday = async (root) => page.evaluate(r => {
  const sec = document.querySelector(`${r} section.day.peek[data-peek-day="0"]`)
  if (!sec) return null
  sec.scrollIntoView({ block: 'center', inline: 'center' })
  return { head: sec.querySelector('.day-head') ? sec.querySelector('.day-head').innerText.replace(/\s+/g, ' ').trim() : '', forms: [...sec.querySelectorAll('.form')].map(f => ({ cs: ((f.querySelector('.csmsn') || {}).innerText || '').replace(/\s+/g, ' ').trim(), b: [...f.querySelectorAll('.bto')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), tl: ((f.querySelector('.ld') || {}).innerText || '').replace(/\s+/g, ' ').trim() })) }
}, root)
const peekPic = async (root, name) => {
  /* a clip of the viewport around the Monday preview's 12:00 line (an element picture of the tall day is garbled by the sticky bars) */
  const fm = page.locator(`${root} section.day.peek[data-peek-day="0"] .form`, { hasText: '12:00' }).last()
  await fm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
  const bb = await fm.boundingBox()
  const vp = page.viewportSize()
  if (!bb) { await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` }); return name + '.png (no box)' }
  const x = Math.max(0, bb.x - 30), y = Math.max(0, bb.y - 120)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png`, clip: { x, y, width: Math.min(vp.width - x, 640), height: Math.min(vp.height - y, bb.height + 200) } })
  return name + '.png'
}
const bOf = m => m ? m.forms.map(f => f.cs + ' B=[' + f.b.join('/') + '] T/O-LD=' + f.tl).join(' ; ') : 'NO PEEK'

/* ---- 1. week of 20 Jul: Monday VL BFM 12:00-13:00, B blank, Ranger; publish ---- */
const nw = await toWeek('2026-07-20')
check('Q3.0a navigation: the week of 20 Jul', /Jul 20/.test(nw.mon), JSON.stringify(nw))
await L.board(page, 0)
const seats = await page.evaluate(id => { const out = []; window.DAYS[0].waves.forEach((wv, gi) => wv.formations.forEach((f, fi) => f.aircraft.forEach((a, ai) => { if (a.p === id) out.push(`0.${gi}.${fi}.${ai}.p`); if (a.w === id) out.push(`0.${gi}.${fi}.${ai}.w`) }))); return out }, ranger)
for (const s of seats) console.log('unseat', s, JSON.stringify(await F.unseat2(page, `[data-slot="${s}"]`)))
const gM = await X.addWave(w, 0, '')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.cs"]`, 'VL')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.msn"]`, 'BFM')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.to"]`, '12:00')
await X.typeIn(w, `[data-bfld="ff:0.${gM}.0.ld"]`, '13:00')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="0.${gM}.0.0.p"]`, ranger))
const ml = await page.evaluate(g => { const f = window.DAYS[0].waves[g].formations[0]; return `${f.cs} ${f.msn} to ${f.to} ld ${f.ld} B=${JSON.stringify(f.br)} R=${JSON.stringify(f.rl)} p=${f.aircraft[0].p}` }, gM)
check('Q3.1a Monday 20 Jul line: VL BFM 12:00-13:00, B blank, Ranger', /VL BFM to 12:00 ld 13:00 B=(""|null|undefined) R=(""|null|undefined) p=bane/.test(ml), ml)
await L.closeBoard(page)
const sp = await X.signAndPublish(w, 0)
console.log('sign/publish', JSON.stringify({ sg: sp.sg, p: sp.p }))
await L.go(page, 'viewsched'); await sleep(600)
const mTag = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"] .day-head'); return d ? d.innerText.replace(/[\s ]+/g, ' ').slice(0, 80) : 'NO HEAD' })
check('Q3.1b Monday 20 Jul published (ORIG face)', /ORIG/.test(mTag) && sp.p.pressed, `${mTag} | pressed ${JSON.stringify(sp.p)}`)

/* ---- 2. back to the week of 13 Jul, View-only Sched: the preview's Monday ---- */
const tw = await toWeek('2026-07-13')
check('Q3.2a navigation: back to the week of 13 Jul', /Jul 13/.test(tw.mon), JSON.stringify(tw))
const lg0 = await setLogic(null)
console.log('briefLead before', JSON.stringify(lg0))
await L.go(page, 'viewsched'); await sleep(900)
let pv = await peekMonday('#vWeek')
console.log('PEEK view-only before', JSON.stringify(pv))
const p2 = await peekPic('#vWeek', 'q3-2-viewonly-preview-before')
check('Q3.2b View-only Sched, preview Monday shows B 09:40 (2h20)', pv && pv.forms.some(f => f.b.some(t => /09:40/.test(t))), bOf(pv), p2)
await page.screenshot({ path: `${process.env.HP_SHOTS}/q3-2-viewonly-page.png` })

/* ---- 3. Logic: brief lead to 3h20 ---- */
const lg1 = await setLogic('3h20')
console.log('briefLead now', JSON.stringify(lg1))
await pic('q3-3-logic-raised')
check('Q3.3 Logic "Brief before take-off" set to 3h20', /3h20/.test(lg1.after), `was ${lg0.before} now ${lg1.after}`, 'q3-3-logic-raised.png')

/* ---- 4. View-only: still 09:40; Edit Schedule's preview: record ---- */
await L.go(page, 'viewsched'); await sleep(900)
pv = await peekMonday('#vWeek')
console.log('PEEK view-only after', JSON.stringify(pv))
const p4 = await peekPic('#vWeek', 'q3-4-viewonly-preview-after')
check('Q3.4a View-only Sched, preview Monday after the raise: still B 09:40', pv && pv.forms.some(f => f.b.some(t => /09:40/.test(t))), bOf(pv), p4)
await editWeek(); await sleep(600)
const pe = await peekMonday('#eWeek')
console.log('PEEK edit after', JSON.stringify(pe))
const p4e = pe ? await peekPic('#eWeek', 'q3-4-editschedule-preview-after') : ''
note('Q3.4b Edit Schedule preview (working copy) Monday after the raise — RECORD (expected 08:40)', bOf(pe) + (p4e ? ' [' + p4e + ']' : ''))

/* the preview is cached per loaded week: bounce to another week and back so it is rebuilt, then read both again */
await toWeek('2026-07-20'); await toWeek('2026-07-13')
await L.go(page, 'viewsched'); await sleep(900)
pv = await peekMonday('#vWeek')
const p4r = await peekPic('#vWeek', 'q3-4r-viewonly-preview-rebuilt')
check('Q3.4d View-only Sched, preview Monday after the raise, preview REBUILT (week bounced): still B 09:40', pv && pv.forms.some(f => f.cs === 'VL BFM' && f.tl === '12:00 13:00' && f.b.some(t => /09:40/.test(t))), bOf(pv), p4r)
await editWeek(); await sleep(600)
const pe2 = await peekMonday('#eWeek')
const p4er = pe2 ? await peekPic('#eWeek', 'q3-4r-editschedule-preview-rebuilt') : ''
note('Q3.4e Edit Schedule preview (working copy), REBUILT — RECORD (expected 08:40)', bOf(pe2) + (p4er ? ' [' + p4er + ']' : ''))
/* the same, with the brief lead 2h20 restored and a rebuild: control */

/* phone 402 in the same context: does the preview show? */
await page.setViewportSize({ width: 402, height: 874 }); await sleep(600)
await L.go(page, 'viewsched'); await sleep(900)
const pvp = await peekMonday('#vWeek')
const nPeekP = await page.locator('#vWeek section.day.peek').count()
console.log('PEEK phone view-only', JSON.stringify(pvp), 'count', nPeekP)
await pic('q3-4-viewonly-phone')
check('Q3.4c phone 402: does View-only Sched show the preview', 'RECORD', nPeekP ? bOf(pvp) : 'no preview section on the phone width in the same context (peek is desktop only)', 'q3-4-viewonly-phone.png')
await page.setViewportSize({ width: 1536, height: 864 }); await sleep(400)

/* ---- 5. restore ---- */
const lg2 = await setLogic(lg0.before)
check('Q3.5 Logic value restored', String(lg2.after).trim() === String(lg0.before).trim(), `now ${lg2.after} want ${lg0.before}`)
await pic('q3-5-logic-restored')
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
await w.browser.close()
