import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTitle, closeWin, pubDay, credits, undoRedo, reload, savePart } from './aa-B-lib.mjs'
import { groundIdx, rowPucks, rowSeat } from './aa-B-rows.mjs'
import { openInputs } from './lib.mjs'
const M = 'shaft', W = 'glass'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
async function run(kind) {
  const w = await world('desk', 'ad', false); w.tag = 's23' + kind
  const { page } = w
  const rmk = 'S23' + kind
  say('--- ' + kind)
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Event', person: 'allavail', rmk, s: '09:00', e: '12:00', oil: 'yes' })
  const iid = f.rec.iid
  await openBoard(page, 5)
  say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
  const c0 = await credits(page, [M, W]); say('credits ORIG', JSON.stringify(c0))
  await openBoard(page, 5)
  const slot = await groundIdx(page, rmk); const n = slot.replace('g:', '')
  if (kind === 'CX') { await page.locator(`#schedBoard [data-grcx="${n}"]`).first().click(); await sleep(400); await page.locator('#cxPop').getByRole('button', { name: /Cancel line/ }).click() }
  else if (kind === 'INFO') await page.locator(`#schedBoard [data-grinfo="${n}"]`).first().click()
  else { await openInputs(page, 5); await page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]`).first().click() }
  await sleep(800); await pic(w, 'applied')
  const stat = {}
  stat.rowAfter = await page.evaluate(r => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); return row ? row.innerText.replace(/\s+/g, ' ').slice(0, 160) : 'row gone' }, rmk)
  say('row after', stat.rowAfter)
  await oilOn(page, true); await pic(w, 'oil-mode')
  const items = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].filter(e => /i:/.test(e.dataset.oilitem || '') || /S23/.test(e.closest('.sb-arow') ? e.closest('.sb-arow').innerText : '')).map(e => e.className + '|' + (e.title || '').slice(0, 140)).slice(0, 6))
  stat.oilItems = items; say('OIL items for the row', JSON.stringify(items))
  const cnt = page.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]`)
  stat.countChips = await cnt.count()
  if (stat.countChips) { await cnt.first().click(); await sleep(500); await tabTo(page, 'earn'); const s = await winState(page); stat.win = { M: s.seats[M], tab: s.tabs[1], text: s.text.slice(-200) }; say('window', JSON.stringify(stat.win)); await pic(w, 'win'); await closeWin(page) }
  else say('no count chip on the row')
  await oilOn(page, false)
  await undoRedo(page, 'undo'); say('after UNDO row', await page.evaluate(r => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); return row ? 'row present: ' + row.className : 'row absent' }, rmk))
  await pic(w, 'undone')
  await undoRedo(page, 'redo'); say('after REDO', await page.evaluate(r => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); return row ? 'row present: ' + row.className : 'row absent' }, rmk))
  await reload(page); await openBoard(page, 5)
  say('after RELOAD', await page.evaluate(r => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); return row ? 'row present: ' + row.className : 'row absent' }, rmk))
  const mid = await credits(page, [M, W]); say('credits before AL (issued must hold)', JSON.stringify(mid))
  await openBoard(page, 5)
  say('publish AL', JSON.stringify(await pubDay(page, 5)))
  stat.c1 = await credits(page, [M, W]); say('credits AL (disabling amendment: expect none)', JSON.stringify(stat.c1)); await pic(w, 'lw-disabled')
  // restore through the normal control
  await openBoard(page, 5)
  if (kind === 'CX') { const s2 = await groundIdx(page, rmk); await page.locator(`#schedBoard [data-grcx="${s2.replace('g:', '')}"]`).first().click(); await sleep(400); await page.locator('#cxPop').getByRole('button', { name: /Un-cancel/ }).click() }
  else if (kind === 'INFO') { const s2 = await groundIdx(page, rmk); await page.locator(`#schedBoard [data-grinfo="${s2.replace('g:', '')}"]`).first().click() }
  else { await openInputs(page, 5); const acc = page.locator(`#schedBoard [data-inprow="${iid}"] [data-acc]`); say('restore buttons', JSON.stringify(await acc.evaluateAll(es => es.map(e => e.dataset.acc + ':' + e.innerText)))); await acc.first().click() }
  await sleep(800); await pic(w, 'restored')
  say('row restored', await page.evaluate(r => { const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => [...e.querySelectorAll('textarea')].some(t => t.value === r)); return row ? 'present: ' + row.innerText.replace(/\s+/g, ' ').slice(0, 100) : 'absent' }, rmk))
  await openBoard(page, 5)
  say('publish AL2', JSON.stringify(await pubDay(page, 5)))
  stat.c2 = await credits(page, [M, W]); say('credits AL2 (expect HO back)', JSON.stringify(stat.c2)); await pic(w, 'lw-restored')
  stat.c0 = c0; stat.errors = w.errors
  out[kind] = stat
  await w.browser.close()
}
for (const k of (process.argv[2] ? [process.argv[2]] : ['CX', 'INFO', 'TAKEOFF'])) { try { await run(k) } catch (e) { say('ERROR', k, e.message.split('\n')[0]) } }
savePart('s23-run' + (process.argv[2] || ''), { out, log })
