// RX2-6: a cut leave — add Hunter to the Mon-Tue piece; he must be on Mon-Tue only.
import { open, shot, errs, browser, saveRes, fileInput, toWeek, toast, unavailRows, lwCells, calRead, leaveInputs, sleep, openInputWindow, saveWindow, reload, press, csId, undoRedo } from './or-RX2-lib.mjs'
const R = {}
const { ctx, page: p } = await open('ad', 'a', { fresh: false })
R.ll = await fileInput(p, { type: 'LL', person: 'Hex', from: '2026-07-13', to: '2026-07-17' })
R.llToast = await toast(p)
R.med = await fileInput(p, { type: 'ATT C', person: 'Hex', from: '2026-07-15', to: '2026-07-15' })
R.medToast = await toast(p)
R.pieces = await leaveInputs(p)
const read = async (tag) => {
  const o = {}
  o.inputs = (await leaveInputs(p)).filter(r => /Hex|Hunter/.test(r.people.join()))
  o.cal = {}
  for (const iso of ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17']) { const c = await calRead(p, iso, ['2026-07-13', '2026-07-16', '2026-07-17'].includes(iso) ? `${tag}-cal-${iso.slice(8)}` : null); o.cal[iso] = { bars: c.bars.filter(b => /Hex|Hunter|LL|ATT|\d/.test(b)).slice(0, 12), cards: c.cards.filter(t => /LL|ATT|Hex|Hunter/.test(t)) } }
  await toWeek(p)
  o.unav = {}
  for (const [name, di] of [['Mon13', 0], ['Tue14', 1], ['Wed15', 2], ['Thu16', 3], ['Fri17', 4]]) o.unav[name] = (await unavailRows(p, '#eWeek', di)).filter(t => /Hex|Hunter/.test(t))
  await p.locator('#eWeek .day:not(.peek)').nth(3).locator('.sec-unav').scrollIntoViewIfNeeded().catch(() => {})
  await shot(p, `${tag}-unav-thu`)
  o.war = await lwCells(p, ['Hunter', 'Hex'], `${tag}-war`)
  return o
}
R.before = await read('rx2-6-0-before')
const mon = R.pieces.find(r => r.people.includes('Hex') && r.type === 'LL' && r.date === 'Jul 13') || R.pieces.find(r => r.type === 'LL')
R.monPiece = mon
const full = await p.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && window.PEOPLE[(r.people && r.people[0] && r.people[0].p) || r.person]?.cs === 'Hex').map(r => ({ iid: r.iid, date: r.date, to: r.to || r.endDate || null })))
R.fullPieces = full
const monIid = await p.evaluate(() => { const r = window.INPUTS.filter(r => r.type === 'LL' && window.PEOPLE[(r.people && r.people[0] && r.people[0].p) || r.person]?.cs === 'Hex').find(r => r.date === 'Jul 13'); return r ? r.iid : null })
R.monIid = monIid
await openInputWindow(p, monIid, '2026-07-13')
R.windowTitle = await p.evaluate(() => (document.querySelector('#inpEditPop')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200))
await shot(p, 'rx2-6-1-window-open')
await press(false, p.locator('#inpEditPop [data-testid="pp-several"]')); await sleep(300)
await press(false, p.locator(`#inpEditPop [data-pp="${await csId(p, 'Hunter')}"]`)); await sleep(300)
R.pressed = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs))
await shot(p, 'rx2-6-2-hunter-picked')
await p.locator('#inpEditSave').click(); await sleep(700)
R.saveToast = await toast(p)
R.saveSheets = await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent && /conf|sheet|err|refus/.test(e.dataset.testid)).map(e => e.dataset.testid + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200)))
await sleep(300)
R.stillOpen = await p.locator('#inpEditPop').count()
await shot(p, 'rx2-6-3-after-save')
R.after = await read('rx2-6-4-after')
await reload(p)
R.reloaded = await read('rx2-6-5-reload')
R.errs = errs.slice()
saveRes('RX2-6', R)
console.log(JSON.stringify(R, null, 1))
await ctx.close(); await browser.close()
