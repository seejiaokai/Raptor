import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const D = '2027-03-10' // Wed — held only by the 2027 period; the Leave War will be showing the 2026 one
const o = {}
await H.warOpen(w)
o.shown = await tid(w.page, 'war-picker').inputValue()
const events = () => w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].filter(e => /^event-\d+-\d{4}-/.test(e.getAttribute('data-testid')) && e.innerText.trim() && e.innerText.trim() !== '＋').map(e => e.getAttribute('data-testid').replace('event-', '') + '=' + e.innerText.trim()))
const NAME = process.env.HNAME ?? ''
const ID = process.env.PID || 'P1-03'
const kinds2026 = () => w.page.evaluate(() => { const out = []; const d = new Date(Date.UTC(2026, 0, 1)); for (let i = 0; i < 365; i++) { const iso = d.toISOString().slice(0, 10); const f = window.lwDayFacts(iso); if (f.kind) out.push(iso + '=' + f.kind + ':' + f.short); d.setUTCDate(d.getUTCDate() + 1) } return out })
o.events2026Before = await kinds2026()
await H.calOpenFromWar(w)
await H.calGoto(w, D)
o.calBefore = await H.calRead(w, D)
o.add = await H.holAdd(w, { kind: 'ph', name: NAME, from: D })
await H.calGoto(w, D)
o.calAfter = await H.calRead(w, D)
o.holList = (await tid(w.page, 'hol-list').count()) ? (await tid(w.page, 'hol-list').innerText()).replace(/\s+/g, ' ').trim().slice(0, 200) : null
const p0 = await H.pic(w, ID.toLowerCase() + '-cal-after-add')
await H.calClose(w)
// the Leave War is still on the 2026 period
o.shownAfter = await tid(w.page, 'war-picker').inputValue()
o.events2026After = await kinds2026()
o.warHasDate = await w.page.evaluate(d => !!document.querySelector(`[data-testid="head-${d}"]`), D)
const p1 = await H.pic(w, ID.toLowerCase() + '-war-2026-still-shown')
// the SANS month and its opened day
await H.openSans(w); await H.sansGoto(w, D)
o.sansCell = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansHead = await w.page.evaluate(() => document.querySelector('[data-testid="win-sansday"]').innerText.replace(/\s+/g, ' ').trim().slice(0, 70))
o.sansDay = await H.sansDayRead(w)
const p2 = await H.pic(w, ID.toLowerCase() + '-sans-day')
await H.sansClose(w)
// the Inputs month and its opened day
await H.inputsOpen(w); await H.inputsGoto(w, D)
o.inputsTag = await H.inputsTag(w, D)
const c = w.page.locator(`[data-icday="${D}"]`)
await c.scrollIntoViewIfNeeded()
if (w.touch) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
await tid(w.page, 'win-inputsday').waitFor({ timeout: 6000 }); await sleep(500)
o.inputsHead = await w.page.evaluate(() => document.querySelector('[data-testid="win-inputsday"]').innerText.replace(/\s+/g, ' ').trim().slice(0, 90))
const p3 = await H.pic(w, ID.toLowerCase() + '-inputs-day')
await w.press(tid(w.page, 'win-inputsday-x')); await sleep(300)
// the holding period (2027) in the Leave War: its Event row and its column tint
await H.warPeriod(w, 'y2027')
await H.warJump(w, D)
o.events2027 = await events()
o.eventsOnDate = await w.page.evaluate(d => [...document.querySelectorAll('[data-testid^="event-"]')].filter(e => e.getAttribute('data-testid').endsWith(d) && e.innerText.trim() && e.innerText.trim() !== '＋').map(e => e.getAttribute('data-testid') + '=' + e.innerText.trim()), D)
o.tint = await w.page.evaluate(d => {
  const bg = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? getComputedStyle(e).backgroundColor : null }
  const prev = d.replace('-10', '-09')
  return { headOn: bg('head-' + d), headPrev: bg('head-' + prev), cellOn: bg('cell-slipway-' + d), cellPrev: bg('cell-slipway-' + prev), eventOn: bg('event-0-' + d) }
}, D)
await H.cellIn(w, 'event-0-' + D)
const p4 = await H.pic(w, ID.toLowerCase() + '-war-2027-event')
const nowPH = o.eventsOnDate.length === 1 && o.eventsOnDate[0].split('=')[1] === o.sansCell.tag
H.judge(ID, `${SIZE} (name '${NAME}'): two periods (JAN-DEC 26 shown, JAN-DEC 27); in Calendar > Holidays added a public holiday on Wed 10 Mar 27 (held only by the 2027 period); read it on Calendar, the SANS month and day, the Inputs month and day, then the 2027 period's Event row and column tint`, [
  ['the Leave War was on the earlier period (2026) while the holiday was added', o.shown === 'y2026' && o.shownAfter === 'y2026', [o.shown, o.shownAfter]],
  ['the add was accepted (no error, form closed)', !o.add.err && !o.add.formStillOpen, o.add],
  ['the 2026 period gained nothing: its Event cells are exactly as before', eq(o.events2026Before, o.events2026After), [o.events2026Before.length, o.events2026After.length]],
  ['Calendar month prints the same tag as the SANS month and the Inputs month', o.calAfter.tag === o.sansCell.tag, o.calAfter],
  ['SANS month tag equals the Inputs month tag; opened day names the holiday', o.sansCell && o.sansCell.tag === o.inputsTag.tag, [o.sansCell.tag, o.sansHead]],
  ['Inputs month tag equals the Leave War Event row text', o.inputsTag.tag === o.eventsOnDate[0]?.split('=')[1], o.inputsTag],
  ['the 2027 period holds exactly ONE event on the date, reading PH', nowPH, o.eventsOnDate],
  ['the 2027 column is tinted on the date (head and cell backgrounds differ from the day before)', o.tint.headOn !== o.tint.headPrev && o.tint.cellOn !== o.tint.cellPrev, o.tint],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1, p2, p3, p4])
H.savePart(ID + '-' + SIZE, { out: o })
await H.closeAll(w)
