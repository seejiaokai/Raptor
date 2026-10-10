import { world, fileInput, pic, sleep, go, openBoard, savePart } from './aa-B-lib.mjs'
import { openInputs } from './lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's32'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-15', kind: 'Duty', person: 'allavail', rmk: 'S32', s: '09:00', e: '12:00', oil: null })
const iid = f.rec.iid; say('placeholder Duty Wed 15 Jul', JSON.stringify(f.rec))
await openBoard(page, 2); await openInputs(page, 2)
const panel = () => page.evaluate(i => {
  const r = document.querySelector(`#schedBoard [data-inprow="${i}"]`)
  const un = [...document.querySelectorAll('#schedBoard .sb-panel')].find(e => /Unavailable/i.test((e.querySelector('.sb-ph') || {}).innerText || ''))
  return { row: r ? r.className : 'no row', buttons: r ? [...r.querySelectorAll('button')].map(b => (b.dataset.acc || '') + ':' + b.innerText.trim()) : [], unavailHead: un ? (un.querySelector('.sb-ph').innerText.replace(/\s+/g, ' ')) : null, unavailRows: un ? [...un.querySelectorAll('.inprow, .sb-arow')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 90)) : null }
}, iid)
out.accepted = await panel(); say('accepted row', JSON.stringify(out.accepted)); await pic(w, 'board-accepted')
// take it off, then look again at the actions
await page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]`).first().click(); await sleep(800)
out.off = await panel(); say('taken off row', JSON.stringify(out.off)); await pic(w, 'board-taken-off')
// S31: the reassign gesture on an Unavailable row (genuine leave for Cobra, Jul 15) — arm its seat, pick ALL AVAIL
const seat = page.locator('#schedBoard [data-inpseat]').first()
say('unavailable seats with the reassign gesture:', await page.locator('#schedBoard [data-inpseat]').count())
const iidL = await seat.getAttribute('data-inpseat'); const before = await page.evaluate(i => window.INPUTS.find(x => x.iid === i).person, iidL)
await seat.scrollIntoViewIfNeeded(); await seat.click(); await sleep(300)
say('armed', await page.evaluate(() => (window.ARM && window.ARM.key) || null))
const ph = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible, #schedBoard [data-person="allavail"]:visible').first()
say('placeholder offered to arm onto this seat:', await ph.count())
if (await ph.count()) { await ph.click(); await sleep(600) }
const after = await page.evaluate(i => window.INPUTS.find(x => x.iid === i).person, iidL)
say('leave input owner before', before, 'after', after); out.reassign = { before, after }
const lines = await page.evaluate(() => document.body.innerText.split(/\n/).filter(l => /cannot|can’t|can't|only|not .*placeholder|ALL AVAIL/i.test(l)).slice(0, 8)); say('lines on screen', JSON.stringify(lines))
await pic(w, 'reassign-attempt')
out.errors = w.errors
await w.browser.close()
savePart('s32-run', { out, log })
