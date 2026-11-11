/* pdl-w2-t5 v1 — T5 the next-week preview (desktop). Mon 3 Aug published (VL 12:00-13:00, B blank); looked at from the week of 27 Jul. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/t5-run1')
console.log('pdl-w2-t5 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep, check, note, pic, SHOTS } = P
const w = await X.world('desktop')
const { page } = w
const A = w.ID('Ranger')
/* ---- fixture: the following week (3 Aug) Monday ---- */
const nw = await P.toWeek(page, '2026-08-03')
check('T5.0a navigation: the week of 3 Aug', /Aug 3/.test(nw.mon), JSON.stringify(nw))
await L.board(page, 0); await sleep(400)
const f = await P.flight(w, 0, { to: '1200', ld: '1300', who: A })
const fx = await page.evaluate(() => { const fm = window.DAYS[0].waves[0].formations[0]; return `${fm.cs} ${fm.msn} ${fm.to}-${fm.ld} B=${JSON.stringify(fm.br)} R=${JSON.stringify(fm.rl)} p=${fm.aircraft[0].p}` })
check('T5.0b fixture: Monday 3 Aug VL 12:00-13:00, B blank, Ranger', /VL BFM 12:00-13:00 B=(""|null|undefined) R=(""|null|undefined) p=bane/.test(fx), fx)
await L.closeBoard(page)
const sp = await X.signAndPublish(w, 0)
await L.go(page, 'viewsched'); await sleep(600)
const mTag = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"] .day-head'); return d ? d.innerText.replace(/[\s ]+/g, ' ').slice(0, 80) : 'NO HEAD' })
check('T5.0c Monday 3 Aug published (ORIG)', /ORIG/.test(mTag) && sp.p.pressed, `${mTag} | pressed ${JSON.stringify(sp.p)}`)

/* ---- look from the week of 27 Jul ---- */
const peekMonday = async (root) => page.evaluate(r => {
  const sec = document.querySelector(`${r} section.day.peek[data-peek-day="0"]`)
  if (!sec) return null
  return { head: sec.querySelector('.day-head') ? sec.querySelector('.day-head').innerText.replace(/\s+/g, ' ').trim() : '', forms: [...sec.querySelectorAll('.form')].map(fm => ({ cs: ((fm.querySelector('.csmsn') || {}).innerText || '').replace(/\s+/g, ' ').trim(), b: [...fm.querySelectorAll('.bto')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), tl: ((fm.querySelector('.ld') || {}).innerText || '').replace(/\s+/g, ' ').trim(), all: fm.innerText.replace(/[\s ]+/g, ' ').trim() })) }
}, root)
const peekPic = async (root, name) => {
  const fm = page.locator(`${root} section.day.peek[data-peek-day="0"] .form`).last()
  if (!(await fm.count())) { await pic(page, name + '-nopeek'); return name + '-nopeek.png' }
  await fm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
  await page.screenshot({ path: `${SHOTS}/${name}.png` })
  return name + '.png'
}
const bOf = m => m ? m.forms.map(fm => fm.all).join(' ; ') : 'NO PEEK'
const lookAt = async (tag) => {
  await P.toWeek(page, '2026-07-27')
  await L.go(page, 'viewsched'); await sleep(900)
  const v = await peekMonday('#vWeek'); const vp = await peekPic('#vWeek', `t5-${tag}-viewonly`)
  await L.go(page, 'editsched'); await sleep(900)
  const e = await peekMonday('#eWeek'); const ep = await peekPic('#eWeek', `t5-${tag}-edit`)
  console.log('PEEK', tag, 'view', JSON.stringify(v), 'edit', JSON.stringify(e))
  return { v, e, vp, ep }
}
const s1 = await lookAt('1-before')
note('T5.1 next-week preview, before the change (RECORD the printed B)', `View-only: ${bOf(s1.v)} [${s1.vp}] || Edit Schedule: ${bOf(s1.e)} [${s1.ep}]`)
const lg = await P.setLogic(w, 'briefLead', '3h')
console.log('briefLead', JSON.stringify(lg))
await pic(page, 't5-2-logic-brieflead-3h')
/* the preview is cached per loaded week: first look as it stands, then bounce to another week and back so it is rebuilt */
await L.go(page, 'viewsched'); await sleep(900)
const v2c = await peekMonday('#vWeek'); const v2cp = await peekPic('#vWeek', 't5-3-viewonly-after-nobounce')
await L.go(page, 'editsched'); await sleep(900)
const e2c = await peekMonday('#eWeek'); const e2cp = await peekPic('#eWeek', 't5-3-edit-after-nobounce')
note('T5.2 after the change, preview as it stands (no week bounce) (RECORD)', `View-only: ${bOf(v2c)} [${v2cp}] || Edit Schedule: ${bOf(e2c)} [${e2cp}]`)
await P.toWeek(page, '2026-08-03'); const s2 = await lookAt('4-after-rebuilt')
check('T5.3 View-only Sched: the preview of the published Monday keeps B 09:40 after the change (D186)', !!s2.v && s2.v.forms.some(fm => fm.b.some(t => /09:40/.test(t))), `rebuilt: ${bOf(s2.v)} | not rebuilt: ${bOf(v2c)}`, s2.vp)
note('T5.4 Edit Schedule preview after the change, rebuilt (RECORD)', `${bOf(s2.e)} [${s2.ep}]`)
P.finish(w, { s1, s2, v2c, e2c })
await w.browser.close()
