import { world, fileInput, pic, sleep, go, openBoard, oilOn, warnLines, typeIfld, savePart } from './aa-B-lib.mjs'
import { openInputs, put } from './lib.mjs'
import { addGroundRow, slotByRmk, putMain } from './aa-B-rows.mjs'
const P = 'dice'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's46'
const { page } = w
await openBoard(page, 4)
await page.locator('#schedBoard [data-wvadd="4"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'SC', exact: true }).first().click(); await sleep(900)
say('P into SC MAIN (07:00-13:00):', await put(page, '[data-slot="4.0.0.0.p"]', [P]))
const warns = async (label) => {
  const r = await page.evaluate(() => {
    const side = document.querySelector('#sbSide'); if (!side) return null
    const items = [...side.querySelectorAll('li, .wrow, [data-warn], .sb-wrn, .wln')].map(e => ({ cls: e.className, text: e.innerText.replace(/\s+/g, ' ').trim() })).filter(x => x.text)
    return { head: side.innerText.split(/\n/)[0] + ' ' + (side.innerText.split(/\n/)[1] || '') + ' ' + (side.innerText.split(/\n/)[2] || ''), items: items.slice(0, 12), raw: side.innerText.slice(0, 700).replace(/\s+/g, ' ') }
  })
  say(label, JSON.stringify(r).slice(0, 900)); return r
}
const puckRing = async () => page.evaluate(() => { const s = document.querySelector('#schedBoard [data-slot="4.0.0.0.p"] .puck'); return s ? s.className + ' | ' + s.title : 'no puck' })
await warns('no input yet'); say('P puck on the SC seat', await puckRing()); await pic(w, 'sc-seated')
const m = await fileInput(page, { iso: '2026-07-17', kind: 'Meeting', person: P, rmk: 'S46m', s: '10:00', e: '11:00', oil: null })
say('Meeting filed', JSON.stringify(m.rec))
await openBoard(page, 4)
out.meeting = await warns('with the Meeting'); out.meetingRing = await puckRing(); say('ring', out.meetingRing); await pic(w, 'meeting')
// change only its kind to Event (the editor window, opened from the day's card)
await go(page, 'inputs')
await page.locator('#inCalBtn').click(); await sleep(300)
await page.locator('#inpCal [data-icday="2026-07-17"]').click({ position: { x: 8, y: 8 } }); await sleep(500)
await page.locator(`[data-testid="idy-row-${m.rec.iid}"] [data-testid="idy-open"]`).click(); await sleep(500)
await page.selectOption('#inpEditType', 'Event'); await page.locator('#inpEditSave').click(); await sleep(800)
say('kind now', await page.evaluate(i => window.INPUTS.find(x => x.iid === i).type, m.rec.iid))
await openBoard(page, 4)
out.event = await warns('with the same input as an Event'); out.eventRing = await puckRing(); say('ring', out.eventRing); await pic(w, 'event')
// click the warning line (jump to the affected place)
const line = page.locator('#sbSide').getByText(/Reaper/).first()
if (await line.count()) { await line.click(); await sleep(600); await pic(w, 'event-jump'); say('after clicking the warning line, selected pucks', await page.evaluate(() => document.querySelectorAll('#schedBoard .puck.hlw, #schedBoard .puck.sel, #schedBoard .puck.flag').length)) }
// move the Event outside the shift
await openInputs(page, 4)
await typeIfld(page, m.rec.iid, 'str', '14:00'); await typeIfld(page, m.rec.iid, 'end', '15:00')
out.moved = await warns('Event moved to 14:00-15:00'); say('ring', await puckRing()); await pic(w, 'event-moved')
// S48: hand-typed rows
for (const [name, label] of [['EVENT', 'typed EVENT'], ['Sports EVENT', 'typed Sports EVENT'], ['MEETING', 'typed MEETING']]) {
  const rmk = 'S48' + name.replace(/\W/g, '')
  await addGroundRow(page, 4, name, '10:00', '11:00', rmk)
  const sl = await slotByRmk(page, rmk); say('row', name, 'slot', sl, 'put P:', await putMain(page, sl, P))
  out['row ' + name] = await warns(label + ' overlapping the shift'); await pic(w, 'row-' + name.replace(/\W/g, ''))
  say('P SC puck', await puckRing())
  const n = sl.replace('g:', '')
  const t = page.locator(`#schedBoard [data-bfld="gr:${n}.str"]`).first(); await t.fill('14:00'); await t.blur(); await sleep(400)
  const e = page.locator(`#schedBoard [data-bfld="gr:${(await slotByRmk(page, rmk)).replace('g:', '')}.end"]`).first(); await e.fill('15:00'); await e.blur(); await sleep(600)
  out['row ' + name + ' moved'] = await warns(label + ' moved clear (14:00-15:00)')
  const n2 = (await slotByRmk(page, rmk)).replace('g:', '')
  await page.locator(`#schedBoard [data-grdel="${n2}"]`).first().click(); await sleep(500)
}
out.errors = w.errors
await w.browser.close()
savePart('s46-run', { out, log })
