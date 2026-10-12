// B4 (landscape 844x390, again): the list's footer — reachable by scrolling the list; finger taps only (no auto scroll)
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const SZ = process.argv[2] || 'l390'
const w = await world(SZ)
const { page, tid, press, VW, VH } = w
await page.setViewportSize({ width: 390, height: 844 })
const ON_FRI = [
  { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' },
  { type: 'Duty', people: ['harpoon'], title: 'Gate duty' },
  { type: 'Meeting', people: ['mamba'], from: '14:00', to: '15:00', title: 'Safety board' },
  { type: 'Meeting', people: ['nick'], from: '15:30', to: '16:30', title: 'Tally meet' },
]
const ids = []
for (const s of ON_FRI) ids.push(await w.fileIt(FRI, s))
await page.setViewportSize({ width: VW, height: VH }); await sleep(400)
const up = await makeHoliday(w); log('list up', up)
const L = '[data-testid="win-oilday"]'
const scrollBody = pos => page.evaluate(([L, pos]) => { const win = document.querySelector(L); const e = win.querySelector('.win-body'); e.scrollTop = pos === 'end' ? e.scrollHeight : 0; return { top: e.scrollTop, sh: e.scrollHeight, ch: e.clientHeight } }, [L, pos])
const tapC = async b => { await page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); await sleep(500) }
const R = {}
R.win0 = await w.measure(L)
R.footerAtTop = await w.measureT('odl-save'); R.later0 = await w.measureT('odl-later')
R.yesAllTop = await w.measureT('odl-yesall')
R.pageScroll = await page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop])
await w.shot(`B4b-${SZ}-1-top`)
// all five lines on screen? the foot's position relative to the window's bottom
R.endScroll = await scrollBody('end'); await sleep(250)
R.later = await w.measureT('odl-later'); R.save = await w.measureT('odl-save'); R.yesAllEnd = await w.measureT('odl-yesall')
R.pageScrollAfter = await page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop])
await w.shot(`B4b-${SZ}-2-end`)
// back to the top: Yes to all by finger
await scrollBody('top'); await sleep(250)
R.yesAll2 = await w.measureT('odl-yesall')
await tapC(R.yesAll2)
R.countYesAll = (await tid('odl-count').innerText()).trim()
R.leftLine = await tid('odl-left').innerText()
// is the Save live and where is it
R.endScroll2 = await scrollBody('end'); await sleep(250)
R.save2 = await w.measureT('odl-save')
await w.shot(`B4b-${SZ}-3-end-after-yesall`)
R.saveLive = !(await tid('odl-save').isDisabled())
await tapC(R.save2)
R.closed = (await page.locator(L).count()) === 0
R.written = await page.evaluate(ids => ids.map(i => { const r = window.INPUTS.find(x => x.iid === i); return r && r.oil }), ids)
R.undo = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
R.toast = await w.toast()
rec(`B4b-${SZ}`, R)
await done(w); process.exit(0)
