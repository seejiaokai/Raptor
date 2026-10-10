import { world, fileInput, pic, sleep, go, openBoard, typeIfld, savePart } from './aa-B-lib.mjs'
import { openInputs, put } from './lib.mjs'
const P = 'dice'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
async function addFlying(page, di, cs, to, ld) {
  await openBoard(page, di)
  await page.locator(`#schedBoard [data-wvadd="${di}"]`).first().click(); await sleep(500)
  await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
  for (const [k, v] of [['cs', cs], ['msn', 'ACM'], ['to', to], ['ld', ld]]) { const l = page.locator(`#schedBoard [data-bfld="ff:${di}.0.0.${k}"]`).first(); await l.click(); await l.fill(v); await l.blur(); await sleep(300) }
  return put(page, `[data-slot="${di}.0.0.0.p"]`, [P])
}
async function dayWarn(page, di, label) {
  await openBoard(page, di)
  const r = await page.evaluate(() => [...document.querySelectorAll('#sbSide .wln')].map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Reaper|conflicts flagged/i.test(t)))
  say(label, JSON.stringify(r).slice(0, 700)); return r
}
async function dir1(kind) {
  const w = await world('desk'); w.tag = 's47' + kind; const { page } = w
  say(`--- direction 1: late ${kind} Thu 21:00-23:00, flying Fri 07:00`)
  say('flying wave Fri, P seated:', await addFlying(page, 4, 'AA1', '07:00', '08:30'))
  const f = await fileInput(page, { iso: '2026-07-16', kind, person: P, rmk: 'S47' + kind, s: '21:00', e: '23:00', oil: null }); say('filed', JSON.stringify(f.rec))
  const r = {}
  r.thu = await dayWarn(page, 3, kind + ' Thu warnings'); await pic(w, 'thu')
  r.fri = await dayWarn(page, 4, kind + ' Fri warnings'); await pic(w, 'fri')
  await openBoard(page, 3); await openInputs(page, 3)
  await typeIfld(page, f.rec.iid, 'str', '14:00'); await typeIfld(page, f.rec.iid, 'end', '15:00')
  r.thuMoved = await dayWarn(page, 3, kind + ' moved to 14:00-15:00, Thu'); r.friMoved = await dayWarn(page, 4, kind + ' moved, Fri'); await pic(w, 'moved')
  r.errors = w.errors; out['dir1' + kind] = r
  await w.browser.close()
}
async function dir2(kind) {
  const w = await world('desk'); w.tag = 's47r' + kind; const { page } = w
  say(`--- direction 2: flying Fri 20:00-21:30, then ${kind} Sat 04:00-05:00`)
  say('flying wave Thu, P seated:', await addFlying(page, 4, 'BB1', '20:00', '21:30'))
  const f = await fileInput(page, { iso: '2026-07-18', kind, person: P, rmk: 'S47r' + kind, s: '04:00', e: '05:00', oil: 'no' }); say('filed', JSON.stringify(f.rec))
  const r = {}
  r.thu = await dayWarn(page, 4, kind + ' Fri (flying) warnings'); r.fri = await dayWarn(page, 5, kind + ' Sat warnings'); await pic(w, 'sat')
  r.errors = w.errors; out['dir2' + kind] = r
  await w.browser.close()
}
for (const f of [() => dir1('Event'), () => dir1('Training'), () => dir2('Event'), () => dir2('Training')]) { try { await f() } catch (e) { say('ERROR', e.message.split('\n')[0]) } }
savePart('s47-run', { out, log })
