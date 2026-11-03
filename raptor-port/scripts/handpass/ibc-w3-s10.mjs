// W3 / S10 (D1578): the OIL of a weekend filed before its year had a Leave War period, end to end. Desktop, admin.
//   VARIANT=sched  the period is made by the schedule's "Create the period"     VARIANT=lw  by the Leave War's "+ New period"
// Every write through the app's controls; the probe bridge (INPUTS, PEOPLE) is only READ.
import * as L from './isr-A-lib.mjs'
import { pubDay, face, editWeek, showDay } from './isr-A-pub.mjs'
import { jumpTo, curWeek, dayAdvice, sleep } from './ibc-w3-lib.mjs'
const { say, check, note, notWalked, tid, press, shot, text } = L
const V = process.env.VARIANT || 'sched'
const ANSWER = process.env.ANSWER || 'yes'   // yes | no
const P = `S10${V === 'lw' ? 'b' : 'a'}${ANSWER === 'no' ? 'n' : ''}`
console.log('ibc-w3-s10 v1', V, ANSWER)
const iso = '2029-03-10', WHO = 'slipway'
const { ctx, page, tap } = await L.session('desktop')
const lwText = () => page.evaluate(() => (document.querySelector('#page-leavewar')?.innerText || '').replace(/\s+/g, ' ').trim())
let TRK = 0
const oilTrackerFor = async () => {
  await L.go(page, 'leavewar')
  if (!(await page.locator('[data-testid="oil-close"]').count())) { await press(page, tap, '[data-testid="oil-tracker"]'); await sleep(600) }
  await page.waitForFunction(() => /Drifter/.test(document.querySelector('[data-testid="oil-sheet"]')?.innerText || ''), null, { timeout: 5000 }).catch(() => {})
  const t = await page.evaluate(() => (document.querySelector('[data-testid="oil-sheet"]')?.innerText || document.querySelector('#page-leavewar')?.innerText || '').replace(/\s+/g, ' ').trim())
  const i = t.indexOf('Drifter')
  const row = i < 0 ? null : t.slice(i, i + 150)
  await shot(page, P, 'desktop', 'tracker-open-' + (++TRK))
  if (await page.locator('[data-testid="oil-close"]').count()) { await page.locator('[data-testid="oil-close"]').first().click(); await sleep(500) }
  const still = await page.locator('[data-testid="oil-close"]').count()
  const mb = row && /Drifter\s+\S+\s+([\d.]+)/.exec(row)
  return { drifter: row, bal: mb ? +mb[1] : null, all: t.slice(0, 1500), stillOpen: still }
}
const gridTab = async () => { await L.go(page, 'leavewar'); const g = page.locator('[data-testid="lw-tab-grid"]'); if (await g.count()) await press(page, tap, g.first()); await sleep(400) }
const warNames = async () => { if (await page.evaluate(() => window.CURPAGE) !== "leavewar") await L.go(page, "leavewar"); return warNames0() }
const warNames0 = () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? { opts: [...s.options].map(o => o.text.trim()), sel: s.options[s.selectedIndex]?.text.trim() } : null })
async function cellRead() {
  // the 2029 war on its grid, March, Drifter's 10 Mar cell
  await gridTab()
  const w = await warNames()
  const opt = w.opts.find(o => /29/.test(o))
  if (!opt) return { war: w, cell: 'NO 2029 PERIOD IN THE PICKER' }
  if (w.sel !== opt) { await page.selectOption('[data-testid="war-picker"]', { label: opt }); await sleep(600) }
  await press(page, tap, '[data-testid="month-MAR"]'); await sleep(500)
  const c = page.locator(`[data-testid="cell-${WHO}-${iso}"]`)
  if (!(await c.count())) return { war: await warNames(), cell: 'NO CELL ' + iso }
  await c.first().scrollIntoViewIfNeeded(); await sleep(300)
  const r = await c.first().evaluate(e => ({ text: (e.innerText || '').replace(/\s+/g, ' ').trim(), cls: String(e.className), kids: [...e.querySelectorAll('[data-testid]')].map(k => k.getAttribute('data-testid') + ':' + (k.innerText || '').trim()) }))
  return { war: await warNames(), cell: r }
}
const personOil = async () => {
  await gridTab()
  const b = page.locator(`[data-testid="person-${WHO}"]`)
  if (!(await b.count())) return null
  await b.first().scrollIntoViewIfNeeded(); await press(page, tap, b.first()); await sleep(700)
  const t = await page.evaluate(() => { const w = document.querySelector('[data-testid="win-person"], [role=dialog]'); return (w?.innerText || document.body.innerText).replace(/\s+/g, ' ').trim() })
  return t
}
try {
  /* 0 · before anything: no 2029 period */
  const w0 = await warNames()
  note(`${P}-0`, `Leave War period picker before: ${JSON.stringify(w0)}`)
  check(`${P}-0`, 'no Leave War period holds 2029', !w0.opts.some(o => /29/.test(o)), w0)
  const oil0 = await oilTrackerFor()
  note(`${P}-0`, `OIL tracker as first seen (Drifter): ${JSON.stringify(oil0.drifter)}`)

  /* 1 · file the Duty through the Inputs calendar, answer the OIL question */
  const before = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2029, 3); await L.openDay(page, iso)
  await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor()
  await page.selectOption('#inpEditPop #inpEditType', 'Duty'); await page.selectOption('#inpEditPop #inpEditPerson', WHO)
  await press(page, tap, '#inpEditSave'); await sleep(700)
  const asked = await tid(page, 'oilconf').count()
  const q = asked ? await text(page, '[data-testid="oilconf"]') : null
  check(`${P}-1`, 'the OIL question is asked for a weekend no period covers', asked === 1, { asked, q })
  check(`${P}-1`, 'the question says nothing of a missing period (D1585)', !!q && !/period|leave war/i.test(q), q)
  await shot(page, P, 'desktop', '1-oil-question')
  if (asked) { await press(page, tap, ANSWER === 'yes' ? '[data-testid="oil-yes"]' : '[data-testid="oil-no"]'); await shot(page, P, 'desktop', '1-answer-picked'); await press(page, tap, '[data-testid="oilconf-save"]'); await sleep(700) }
  const made = await page.evaluate(b => window.INPUTS.filter(r => !b.includes(String(r.iid))).map(r => ({ iid: String(r.iid), type: r.type, person: r.person, people: r.people && r.people.map(e => e.p), date: r.date, yr: r.yr, oil: r.oil, allday: r.allday })), before)
  note(`${P}-1`, `records made: ${JSON.stringify(made)}`)
  check(`${P}-1`, 'exactly one Duty record saved, for Drifter on Sat 10 Mar 2029', made.length === 1 && made[0].type === "Duty" && /slipway|Drifter/.test(JSON.stringify(made[0])), made)
  const dayWords = await text(page, '[data-testid="win-inputsday"]')
  const bodyWords = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '))
  const ment = (bodyWords.match(/[^.]{0,50}(no period|period is missing|Leave War period|2029 period)[^.]{0,50}/gi) || [])
  check(`${P}-1`, 'the Inputs page names no missing period after the save (D1585)', ment.length === 0, ment)
  await shot(page, P, 'desktop', '1-inputs-day-after-save')
  note(`${P}-1`, `day window words: ${JSON.stringify((dayWords || '').slice(0, 260))}`)
  if (await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')

  /* 2 · the schedule: that week, the Saturday's advisory and the offer */
  await L.go(page, 'editsched'); await jumpTo(page, tap, iso)
  note(`${P}-2`, `week reached: ${await curWeek(page)}`)
  await showDay(page, 5)
  const tg = page.locator('#eWeek .day[data-day="5"] :text("1 issue")').first()
  if (await tg.count()) { await tg.click(); await sleep(500) }
  const adv = await dayAdvice(page, 5)
  const sat = await page.evaluate(() => (document.querySelector('#eWeek .day[data-day="5"]').innerText || '').replace(/\s+/g, ' '))
  const advLine = (/No OIL — no Leave War period[^✕]*/.exec(sat) || [null])[0]
  const ck2 = ANSWER === 'no' ? ((id, n, ok, g) => note(id, `RECORDED (answer No) ${n}: ${ok ? 'yes' : 'no'} — saw ${JSON.stringify(g)}`)) : check
  ck2(`${P}-2`, 'the Saturday shows D19\'s advisory naming the missing 2029 period', !!advLine && /2029/.test(advLine), advLine)
  ck2(`${P}-2`, 'and still offers "Create the 2029 period"', adv.create.length === 1 && /Create the 2029 period/.test(adv.create[0]), adv.create)
  await page.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="5"] [data-mkperiod]'); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b' } })
  await shot(page, P, 'desktop', '2-saturday-advisory-marked')

  /* 3 · publish Saturday */
  const pub = await pubDay(page, tap, 5)
  note(`${P}-3`, `publish: ${JSON.stringify(pub)}`)
  const f1 = await face(page, 5)
  check(`${P}-3`, 'Saturday is published (a version tag shows)', !!f1 && /Original|ORIG|v|AL/i.test(f1.tag || '') && !/DRAFT/i.test(f1.tag || 'DRAFT'), f1)
  const sat2 = await page.evaluate(() => (document.querySelector('#eWeek .day[data-day="5"]').innerText || '').replace(/\s+/g, ' ').slice(0, 260))
  note(`${P}-3`, `Saturday head after publish: ${JSON.stringify(sat2)}`)
  await showDay(page, 5); await shot(page, P, 'desktop', '3-saturday-published')
  const adv2 = await dayAdvice(page, 5)
  note(`${P}-3`, `after publish the offer: ${JSON.stringify(adv2.create)}`)

  /* 4 · make the period */
  if (V === 'sched') {
    const btn = page.locator('#eWeek .day[data-day="5"] [data-mkperiod]').first()
    if (!(await btn.count())) { /* the offer may be behind the issue fold */
      const tg2 = page.locator('#eWeek .day[data-day="5"] :text("issue")').first(); if (await tg2.count()) { await tg2.click(); await sleep(400) }
    }
    if (await btn.count()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await sleep(1200) }
    else notWalked(`${P}-4`, 'premise: the Create the period offer was not on the published Saturday')
    note(`${P}-4`, `after "Create the period": page ${await page.evaluate(() => window.CURPAGE)}, ${JSON.stringify(await warNames())}`)
    await shot(page, P, 'desktop', '4-after-create-from-schedule')
  } else {
    await L.go(page, 'leavewar'); await sleep(300)
    await page.selectOption('[data-testid="war-picker"]', { label: '+ New period' }); await sleep(700)
    await shot(page, P, 'desktop', '4-new-period-sheet')
    await page.fill('[data-testid="war-name"]', 'JAN - DEC 29')
    const cal = page.locator('[data-testid="war"]').first()
    const wantM = 2029 * 12
    for (let i = 0; i < 80; i++) { const m = await cal.getAttribute('data-month'); const have = +m.slice(0, 4) * 12 + (+m.slice(5, 7) - 1); if (have === wantM) break; await page.locator(`[data-testid="war-${have < wantM ? 'next' : 'prev'}"]`).click(); await sleep(100) }
    await page.locator('[data-testid="war-day-2029-01-01"]').click(); await sleep(250)
    for (let i = 0; i < 11; i++) { await page.locator('[data-testid="war-next"]').click(); await sleep(100) }
    await page.locator('[data-testid="war-day-2029-12-31"]').click(); await sleep(300)
    note(`${P}-4`, `sheet shows selection: ${await text(page, '[data-testid="war-selection"]')}`)
    await shot(page, P, 'desktop', '4-new-period-sheet-filled')
    await press(page, tap, '[data-testid="war-create"]'); await sleep(1000)
    note(`${P}-4`, `after Create: ${JSON.stringify(await warNames())}, problem: ${await text(page, '[data-testid="war-problem"]')}`)
    await shot(page, P, 'desktop', '4-after-create-on-leave-war')
  }
  const w1 = await warNames()
  check(`${P}-4`, 'a 2029 period now exists', !!w1 && w1.opts.some(o => /29/.test(o)), w1)

  /* 5 · what the Leave War reads now */
  const c1 = await cellRead()
  note(`${P}-5`, `Drifter's 10 Mar 2029 cell: ${JSON.stringify(c1.cell)}; war picker: ${JSON.stringify(c1.war)}`)
  await shot(page, P, 'desktop', '5-grid-march-2029')
  const cellTxt = JSON.stringify(c1.cell)
  if (ANSWER === 'yes') check(`${P}-5`, 'Drifter\'s 10 Mar 2029 cell shows the OIL (FO)', /FO|OIL/i.test(cellTxt) && !/NO CELL|NO 2029/.test(cellTxt), c1.cell)
  else check(`${P}-5`, 'answer No: the cell shows no OIL', !/FO/.test(cellTxt), c1.cell)
  const oil1 = await oilTrackerFor()
  note(`${P}-5`, `OIL tracker Drifter before ${JSON.stringify(oil0.drifter)} after ${JSON.stringify(oil1.drifter)}`)
  const po = await personOil()
  note(`${P}-5`, `Drifter's person window: ${JSON.stringify((po || 'no window').slice(0, 700))}`)
  await shot(page, P, 'desktop', '5-person-window')
  if (await page.keyboard.press('Escape').catch(() => {})) await sleep(300)
  check(`${P}-5`, ANSWER === 'yes' ? 'the OIL balance of Drifter rose by one day after the period was made' : 'answer No: the OIL balance of Drifter did not move', ANSWER === 'yes' ? oil1.bal === oil0.bal + 1 : oil1.bal === oil0.bal, { before: oil0.bal, after: oil1.bal })

  /* 6 · unpublish Saturday -> OIL goes; publish again -> back */
  await editWeek(page); await showDay(page, 5)
  const up = page.locator('#eWeek button[data-unpub="5"]').first()
  if (!(await up.count())) notWalked(`${P}-6`, 'premise: no Unpublish button on Saturday')
  else {
    await up.scrollIntoViewIfNeeded(); await up.click(); await sleep(700)
    const armed = await page.locator('#eWeek button[data-unpub="5"].warn').count()
    note(`${P}-6`, `Unpublish pressed; armed confirm shown: ${armed}`)
    await shot(page, P, 'desktop', '6-unpublish-armed')
    if (armed) { await page.locator('#eWeek button[data-unpub="5"]').first().click(); await sleep(900) }
    const f2 = await face(page, 5)
    note(`${P}-6`, `Saturday after unpublish: ${JSON.stringify(f2)}`)
    const c2 = await cellRead()
    note(`${P}-6`, `cell after unpublish: ${JSON.stringify(c2.cell)}`)
    await shot(page, P, 'desktop', '6-grid-after-unpublish')
    if (ANSWER === 'yes') check(`${P}-6`, 'unpublished: the OIL has gone from the cell', !/FO/.test(JSON.stringify(c2.cell)), c2.cell)
    const oil2 = await oilTrackerFor()
    note(`${P}-6`, `OIL tracker after unpublish Drifter balance ${oil2.bal} (before the day was published ${oil0.bal})`)
    if (ANSWER === 'yes') check(`${P}-6`, 'unpublished: the balance of Drifter is back to what it was before', oil2.bal === oil0.bal, { before: oil0.bal, after: oil2.bal })
    const pub2 = await pubDay(page, tap, 5)
    note(`${P}-6`, `republish: ${JSON.stringify(pub2)}`)
    const c3 = await cellRead()
    note(`${P}-6`, `cell after republish: ${JSON.stringify(c3.cell)}`)
    await shot(page, P, 'desktop', '6-grid-after-republish')
    if (ANSWER === 'yes') check(`${P}-6`, 'republished: the OIL is back on the cell', /FO/.test(JSON.stringify(c3.cell)), c3.cell)
    const oil3 = await oilTrackerFor()
    note(`${P}-6`, `OIL tracker after republish Drifter balance ${oil3.bal}`)
    if (ANSWER === 'yes') check(`${P}-6`, 'republished: the balance of Drifter is up by one again', oil3.bal === oil0.bal + 1, { before: oil0.bal, after: oil3.bal })
  }
  /* 7 · the Inputs page after: still the same question words, what the card shows */
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2029, 3); await L.openDay(page, iso)
  note(`${P}-7`, `Inputs day window after: ${JSON.stringify(((await text(page, '[data-testid="win-inputsday"]')) || '').slice(0, 260))}`)
  await shot(page, P, 'desktop', '7-inputs-day-after')
} catch (e) { say(`ERROR ${P}: ${e.message.split('\n').slice(0, 3).join(' / ')} @ ${(e.stack.split('\n').find(l => l.includes('ibc-w3-s10')) || '').trim()}`); await shot(page, P, 'desktop', 'error').catch(() => {}) }
await ctx.close()
await L.finish(`s10-${V}-${ANSWER}`)
