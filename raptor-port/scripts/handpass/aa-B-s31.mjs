import { world, fileInput, pic, sleep, go, openBoard, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's31'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-15', kind: 'Duty', person: 'allavail', rmk: 'S31ph', s: '09:00', e: '12:00', oil: null })
const nd = await fileInput(page, { iso: '2026-07-15', kind: 'Duty', person: 'dice', rmk: 'S31named', s: '09:00', e: '12:00', oil: null })
await openBoard(page, 2)
const lines = () => page.evaluate(() => document.body.innerText.split(/\n/).map(l => l.trim()).filter(l => /placeholder|ALL AVAIL.*(cannot|only)|cannot|can’t|can't|refus|not allowed|stand for|whoever is free/i.test(l)).slice(0, 8))
const owner = (i) => page.evaluate(i => window.INPUTS.find(x => x.iid === i).person, i)
// 1. reassignment on the genuine-leave (Unavailable) row: tap-arm then a placeholder from the crew palette
for (const mode of ['pick', 'drag']) {
  const seat = page.locator('#schedBoard [data-inpseat]').first()
  const iid = await seat.getAttribute('data-inpseat'); const before = await owner(iid)
  const src = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  await seat.scrollIntoViewIfNeeded()
  if (mode === 'pick') {
    await seat.click(); await sleep(300); say('armed:', await page.evaluate(() => (window.ARM && window.ARM.key) || null))
    await src.scrollIntoViewIfNeeded(); await src.click(); await sleep(700)
  } else {
    const sb = await src.boundingBox(); const tb = await seat.boundingBox()
    await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.mouse.down()
    for (let i = 1; i <= 14; i++) { await page.mouse.move(sb.x + (tb.x + tb.width / 2 - sb.x) * i / 14, sb.y + (tb.y + tb.height / 2 - sb.y) * i / 14); await sleep(25) }
    await page.mouse.up(); await sleep(700)
  }
  const after = await owner(iid); const ln = await lines()
  say(mode, ': leave input owner before', before, 'after', after, '| screen words:', JSON.stringify(ln)); out['leave->placeholder ' + mode] = { before, after, ln }
  await pic(w, 'leave-' + mode)
  await page.keyboard.press('Escape'); await sleep(300)
}
// 2. the reverse: a named person onto the placeholder request. The placeholder Duty is on the Ground Programme (acc g): no Unavailable seat exists for it.
say('seats with the reassign gesture on screen:', await page.locator('#schedBoard [data-inpseat]').count(), '| for the placeholder input:', await page.locator(`#schedBoard [data-inpseat="${f.rec.iid}"]`).count())
// 3. a named man dropped on the placeholder's puck in the Personal Inputs row (the request's own puck) — ordinary scheduling does not own that puck
const pk = page.locator(`#schedBoard [data-inprow="${f.rec.iid}"] .puck`).first()
await pk.scrollIntoViewIfNeeded(); await pk.click(); await sleep(400)
say('armed after tapping the request\'s own puck:', await page.evaluate(() => (window.ARM && window.ARM.key) || null), '| owner still', await owner(f.rec.iid))
await page.keyboard.press('Escape')
out.errors = w.errors
await w.browser.close()
savePart('s31-run', { out, log })
