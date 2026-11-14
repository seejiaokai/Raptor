/* rcf-rw3-t2 — T2: Edit Schedule's next-week preview redraws after a Logic change; View-only keeps a published day's B. desktop */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 't2a'
process.env.HP_URL ||= 'http://localhost:4294'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk3/' + RUN)
console.log('rcf-rw3-t2 v1', process.env.HP_SHOTS)
const X = await import('./rcf-w1-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, check, note, sleep, RESULTS } = X
const w = await X.world('desktop')
const { page } = w
console.log('BUNDLE', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(',')))
const ranger = w.ID('Ranger')
const pic = (name) => page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` })
const editWeek = async () => { await L.go(page, 'editsched'); await sleep(700) }
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
const peekMonday = async (root) => page.evaluate(r => {
  const sec = document.querySelector(`${r} section.day.peek[data-peek-day="0"]`)
  if (!sec) return null
  sec.scrollIntoView({ block: 'center', inline: 'center' })
  return { head: sec.querySelector('.day-head') ? sec.querySelector('.day-head').innerText.replace(/\s+/g, ' ').trim() : '', forms: [...sec.querySelectorAll('.form')].map(f => ({ cs: ((f.querySelector('.csmsn') || {}).innerText || '').replace(/\s+/g, ' ').trim(), b: [...f.querySelectorAll('.bto')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), tl: ((f.querySelector('.ld') || {}).innerText || '').replace(/\s+/g, ' ').trim() })) }
}, root)
const peekPic = async (root, name) => {
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
const vl = m => m ? m.forms.find(f => f.cs === 'VL BFM' && /12:00/.test(f.tl)) : null
const has = (m, re) => { const f = vl(m); return !!f && f.b.some(t => re.test(t)) }

/* ---- 1. week of 20 Jul: Monday VL BFM 12:00-13:00, B blank, Ranger; NOT published yet ---- */
const nw = await toWeek('2026-07-20')
check('T2.0a navigation: the week of 20 Jul', /Jul 20/.test(nw.mon), JSON.stringify(nw))
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
check('T2.1 Monday 20 Jul line VL BFM 12:00-13:00, B blank, Ranger (unpublished)', /VL BFM to 12:00 ld 13:00 B=(""|null|undefined) R=(""|null|undefined) p=bane/.test(ml), ml)
await L.closeBoard(page)

/* ---- 2. week of 13 Jul, Edit Schedule: the preview's Monday, note its B ---- */
const tw = await toWeek('2026-07-13')
check('T2.2a navigation: back to the week of 13 Jul', /Jul 13/.test(tw.mon), JSON.stringify(tw))
const lg0 = await setLogic(null)
console.log('briefLead before', JSON.stringify(lg0))
await editWeek(); await sleep(600)
let pe = await peekMonday('#eWeek')
const p2 = pe ? await peekPic('#eWeek', 't2-2-editschedule-preview-before') : ''
check('T2.2b Edit Schedule preview Monday shows the blank-B line with B 09:40 (2h20)', has(pe, /09:40/), bOf(pe), p2)

/* ---- 3. Logic 3h20, back to Edit Schedule WITHOUT reloading the week ---- */
const lg1 = await setLogic('3h20')
await pic('t2-3-logic-raised')
check('T2.3a Logic "Brief before take-off" 3h20', /3h20/.test(lg1.after), `was ${lg0.before} now ${lg1.after}`, 't2-3-logic-raised.png')
await editWeek(); await sleep(800)
const wk1 = await page.evaluate(() => window.CURWEEK)
pe = await peekMonday('#eWeek')
const p3 = pe ? await peekPic('#eWeek', 't2-3-editschedule-preview-after') : ''
check('T2.3b Edit Schedule preview after the raise (week not reloaded: ' + wk1 + '): B an hour earlier, 08:40', has(pe, /08:40/), bOf(pe), p3)

/* ---- 4. restore 2h20 ---- */
const lg2 = await setLogic(lg0.before)
check('T2.4a Logic restored', String(lg2.after).trim() === String(lg0.before).trim(), `now ${lg2.after} want ${lg0.before}`)
await editWeek(); await sleep(800)
pe = await peekMonday('#eWeek')
const p4 = pe ? await peekPic('#eWeek', 't2-4-editschedule-preview-restored') : ''
check('T2.4b Edit Schedule preview after the restore: B back to 09:40', has(pe, /09:40/), bOf(pe), p4)

/* ---- 5. View-only Sched, a PUBLISHED next-week day keeps its B ---- */
await toWeek('2026-07-20')
const sp = await X.signAndPublish(w, 0)
console.log('sign/publish', JSON.stringify({ sg: sp.sg, p: sp.p }))
await L.go(page, 'viewsched'); await sleep(600)
const mTag = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"] .day-head'); return d ? d.innerText.replace(/[\s ]+/g, ' ').slice(0, 80) : 'NO HEAD' })
check('T2.5a Monday 20 Jul published (ORIG face)', /ORIG/.test(mTag) && sp.p.pressed, `${mTag} | pressed ${JSON.stringify(sp.p)}`)
await toWeek('2026-07-13')
await L.go(page, 'viewsched'); await sleep(900)
let pv = await peekMonday('#vWeek')
const p5 = pv ? await peekPic('#vWeek', 't2-5-viewonly-preview-before') : ''
check('T2.5b View-only Sched preview of published Monday shows B 09:40', has(pv, /09:40/), bOf(pv), p5)
const lg3 = await setLogic('3h20')
await L.go(page, 'viewsched'); await sleep(900)
pv = await peekMonday('#vWeek')
const p6 = pv ? await peekPic('#vWeek', 't2-5-viewonly-preview-after') : ''
check('T2.5c View-only Sched preview of published Monday after the raise (' + lg3.after + '): still 09:40', has(pv, /09:40/), bOf(pv), p6)
await editWeek(); await sleep(800)
pe = await peekMonday('#eWeek')
const p7 = pe ? await peekPic('#eWeek', 't2-5-editschedule-preview-published-day') : ''
note('T2.5d Edit Schedule preview of the PUBLISHED Monday after the raise — RECORD', bOf(pe) + (p7 ? ' [' + p7 + ']' : ''))
const lg4 = await setLogic(lg0.before)
check('T2.5e Logic restored again', String(lg4.after).trim() === String(lg0.before).trim(), `now ${lg4.after} want ${lg0.before}`)
await pic('t2-5-logic-restored')
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
await w.browser.close()
