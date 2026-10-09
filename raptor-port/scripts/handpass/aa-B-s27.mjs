import { world, fileInput, pic, sleep, go, openBoard, pubDay, credits, tid, savePart } from './aa-B-lib.mjs'
import { openInputs } from './lib.mjs'
const P = 'dice'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's27'
const { page } = w
async function trackerRow(label) {
  await go(page, 'leavewar'); await sleep(900)
  await page.getByRole('button', { name: /OIL tracker/i }).first().click(); await sleep(800)
  const t = (await tid(page, 'oil-row-' + P).innerText()).replace(/\s+/g, ' ')
  say('tracker, Reaper —', label, ':', t); await pic(w, 'tracker-' + label.replace(/\W+/g, ''))
  await tid(page, 'oil-close').click(); await sleep(400)
  return t
}
// 1. a manual award of 1 day through the tracker
await go(page, 'leavewar'); await sleep(900)
await page.getByRole('button', { name: /OIL tracker/i }).first().click(); await sleep(800)
await page.locator('[data-testid="oil-sheet"]').getByText('Reaper', { exact: true }).first().click(); await sleep(600)
await tid(page, 'oil-reason').fill('S27 manual award'); await tid(page, 'oil-credit-save').click(); await sleep(800)
await pic(w, 'awarded')
await tid(page, 'oil-close').click(); await sleep(400)
out.t0 = await trackerRow('after the manual award')
// 2. a Yes placeholder Duty, issued
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S27', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P]); say('Leave War Sat 18 Jul cell', JSON.stringify(out.c0))
out.t1 = await trackerRow('after ORIG')
// 3. take the request off and amend
await openBoard(page, 5); await openInputs(page, 5)
await page.locator(`#schedBoard [data-acc="x"][data-acck="${f.rec.iid}"]`).first().click(); await sleep(800)
say('publish AL1 (request taken off)', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P]); say('Leave War cell', JSON.stringify(out.c1))
out.t2 = await trackerRow('after request taken off + AL1')
// 4. restore and amend
await openBoard(page, 5); await openInputs(page, 5)
const acc = page.locator(`#schedBoard [data-inprow="${f.rec.iid}"] [data-acc]`); say('restore buttons', JSON.stringify(await acc.evaluateAll(es => es.map(e => e.dataset.acc + ':' + e.innerText))))
await acc.first().click(); await sleep(800)
say('publish AL2 (restored)', JSON.stringify(await pubDay(page, 5)))
out.c2 = await credits(page, [P]); say('Leave War cell', JSON.stringify(out.c2))
out.t3 = await trackerRow('after restore + AL2')
out.errors = w.errors
await w.browser.close()
savePart('s27-run', { out, log })
