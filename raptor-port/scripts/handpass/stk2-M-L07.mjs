/* L-07 — an answer on a day nobody has touched, across a reload. Parts a / b / c (env PART). */
import * as G from './stk2-M-lib.mjs'
const { L, W } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const PART = process.env.PART || 'a'
const w = await G.world(); const p = w.p
const out = { PART }
const TUE = 1, WV = 1, FM = 1   // Tuesday, wave 2, the RU formation
const KEY = `fr:${TUE}.${WV}.${FM}.0`
const crew = await p.evaluate(() => { const f = DAYS[1].waves[1].formations[1]; return { cs: f.cs, rm: f.aircraft.map(a => a.rmks), msn: f.msn, people: f.aircraft.flatMap(a => [a.p, a.w]).filter(Boolean).map(id => ({ id, cs: PEOPLE[id] && PEOPLE[id].cs })) } })
out.crew = crew
console.log('CREW', JSON.stringify(crew))

async function bars(label) {
  const btn = p.locator('#insightBtn:visible').first()
  await btn.click(); await p.waitForSelector('#insightBody', { state: 'visible' }); await G.sleep(500)
  const all = p.locator('[data-insights-all]:visible').first()
  if (await all.count()) { await all.click(); await G.sleep(400) }
  const r = await p.evaluate(names => {
    const b = document.querySelector('#insightBody')
    const mix = [...b.querySelectorAll('.ibar.mission-mix-row')].map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), html: e.innerHTML.replace(/\s+/g, ' ').slice(0, 520) }))
    return { crewMix: mix.filter(r => names.some(n => r.text.startsWith(n + ' '))), nMix: mix.length, legend: (b.querySelector('.mission-mix-legend, .mix-legend') || {}).innerText || b.innerText.replace(/\s+/g, ' ').slice(0, 160) }
  }, crew.people.map(x => x.cs))
  r.pic = await G.pic(p, `L07${PART}-${label}-insights`)
  await G.insightsClose(p)
  console.log('BARS', label, JSON.stringify(r.crewMix.map(x => x.text)), 'nMix', r.nMix)
  out['bars_' + label] = r
  return r
}
async function boxState(label) {
  await W.showDay(p, TUE)
  const el = p.locator(`#eWeek [data-txt="${KEY}"]`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click(); await G.sleep(500)
  const r = await p.evaluate(() => { const c = document.querySelector('[data-role-choose]'); return { btn: c ? c.innerText.trim() : null, q: document.querySelectorAll('.mission-role-question').length } })
  r.text = await el.innerText()
  r.pic = await G.pic(p, `L07${PART}-${label}-box`)
  console.log('BOX', label, JSON.stringify(r))
  out['box_' + label] = r
  await p.keyboard.press('Escape')
  return r
}
/* tracking on */
await G.logicEditOn(p)
await p.locator('#lgMissionMix').setChecked(true); await G.sleep(400)
out.tracking = await p.locator('#lgMissionMix').getAttribute('aria-checked')
await G.logicDone(p)
await L.go(p, 'editsched'); await W.showDay(p, TUE)

if (PART === 'b') {
  /* first change any other text box on Tuesday so the day is saved once: the day's first scheduler note, else the wave-1 RU remarks */
  const other = p.locator(`#eWeek [data-txt="fr:${TUE}.0.0.0"]`).first()
  await other.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await other.click(); await p.keyboard.press('End'); await p.keyboard.type(' X', { delay: 20 }); await p.keyboard.press('Tab'); await G.sleep(600)
  out.otherEdited = await p.evaluate(() => DAYS[1].waves[0].formations[0].aircraft[0].rmks)
  console.log('other box now', out.otherEdited)
}
await bars('0-before')
/* click into the box and press Choose → Red */
const el = p.locator(`#eWeek [data-txt="${KEY}"]`).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await el.click(); await G.sleep(500)
const ch = p.locator('[data-role-choose]:visible').first()
out.chooseText = (await ch.count()) ? (await ch.innerText()).trim() : 'NO BUTTON'
await G.pic(p, `L07${PART}-1-choose-button`)
await ch.click(); await G.sleep(400)
await G.pic(p, `L07${PART}-2-question`)
await p.locator('[data-role-side="red"]:visible').first().click(); await G.sleep(600)
await p.keyboard.press('Tab'); await G.sleep(300)
await G.pic(p, `L07${PART}-3-answered`)
out.stored = await p.evaluate(() => ({ rm: DAYS[1].waves[1].formations[1].aircraft.map(a => a.rmks) }))
await bars('1-after-answer')
await boxState('1-after-answer')

if (PART === 'c') {
  /* next week and back, through the week picker's own buttons */
  const nxt = p.locator('button:has-text("Jul 20"):visible').first()
  await nxt.click(); await G.sleep(1200)
  out.wk1 = await p.evaluate(() => window.CURWEEK)
  const bk = p.locator('button:has-text("Jul 13"):visible').first()
  await bk.click(); await G.sleep(1200)
  out.wk2 = await p.evaluate(() => window.CURWEEK)
  console.log('weeks', out.wk1, out.wk2)
  await G.pic(p, `L07${PART}-4-back-on-week`)
} else {
  await W.showDay(p, TUE)
  await p.reload(); await L.signIn(p, 'a', { goto: false })
  out.trackingAfter = await p.evaluate(() => { const c = document.querySelector('#lgMissionMix'); return c ? c.getAttribute('aria-checked') : 'not on this page' })
  await L.go(p, 'editsched')
  await G.pic(p, `L07${PART}-4-after-reload`)
}
out.trackingAfterNav = await G.vconf(p, 'reportLead')
await L.go(p, 'logic'); out.trackingSwitch = await p.locator('#lgMissionMix').getAttribute('aria-checked'); await G.pic(p, `L07${PART}-5-logic-switch`)
await L.go(p, 'editsched'); await W.showDay(p, TUE)
await bars('2-after-nav')
await boxState('2-after-nav')
console.log('errors', w.errors)
G.save('L07' + PART + '-' + TAG, { out, errors: w.errors })
await w.browser.close()
