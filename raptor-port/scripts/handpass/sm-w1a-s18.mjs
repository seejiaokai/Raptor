// W1a S18: the simple "2 pending" (Bolt LL on Unavailable + Saint Meeting Safety brief on Ground, published Wed 15 Jul), then Publish AL1.
// Run: node scripts/handpass/sm-w1a-s18.mjs pc|phone
import * as L from './sm-lib.mjs'
const SIZE = process.argv[2] || 'pc'
console.log('sm-w1a-s18 v1', SIZE)
const OUT = L.outDir('w1a')
const W = await L.launch(SIZE, { origin: 'http://localhost:4391' })
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const groundMark = () => W.page.evaluate(() => {
  const rows = [...document.querySelectorAll('#eWeek section.day[data-day="2"] .pl-row.gr-frominput')].filter(r => r.getBoundingClientRect().height > 0)
  return rows.map(r => { const b = r.querySelector('.ntx'); const cs = b && getComputedStyle(b); return { text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), aln: b && b.dataset.aln, deco: cs && `${cs.textDecorationLine} ${cs.textDecorationStyle} ${cs.textDecorationColor}` } })
})
const readAll = async tag => ({ pend: await L.dayPending(W.page, 2), unav: await L.weekUnavMark(W.page, 2, 'Bolt'), ground: await groundMark() })
const p = n => `s18-${SIZE}-${n}`
await L.signIn(W)
await step('publish', () => L.publishDay(W, 2))
await L.closeBoard(W)
await L.goEdit(W)
await L.center(W.page, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(300)
await step('clean.week', () => readAll())
await L.pic(W, OUT, p('1-clean-week'), { sel: '#eWeek section.day[data-day="2"]' })
await step('file.bolt', async () => { const r = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }); return r && { iid: r.iid, type: r.type } })
await step('file.saint', async () => { const r = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief' }); return r && { iid: r.iid, type: r.type, place: r.place || r.plc || null, keys: Object.keys(r).join(',') } })
await L.goEdit(W)
await L.center(W.page, '#eWeek section.day[data-day="2"] .dpend'); await L.sleep(500)
await step('pending.week', () => readAll())
await L.pic(W, OUT, p('2-pending-day-top'), { sel: '#eWeek section.day[data-day="2"] .dpend', pad: 60 })
await L.center(W.page, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(400)
await L.pic(W, OUT, p('3-pending-unav'), { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
await step('ground.where', () => W.page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="2"] .pl-row')].filter(r => r.getBoundingClientRect().height > 0 && /Saint|Safety/.test(r.textContent)).map(r => ({ cls: r.className, sec: (r.closest('[class*=sec-]') || {}).className, text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) }))))
const gsel = '#eWeek section.day[data-day="2"] .pl-row.gr-frominput'
if (await W.page.locator(gsel).count()) { await L.center(W.page, gsel); await L.sleep(300); await L.pic(W, OUT, p('4-pending-ground'), { sel: gsel, pad: 40 }) }
// the changes window (To go out) — via the pending chip
await step('changes.open', async () => {
  const chip = W.page.locator('#eWeek section.day[data-day="2"] .dpend:visible').first()
  await chip.click(); await L.sleep(700)
  return W.page.evaluate(() => { const w = [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0); return w.map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) })) })
})
await L.pic(W, OUT, p('5-changes-window'))
await W.page.keyboard.press('Escape'); await L.sleep(400)
// the board
await L.openBoard(W, 2)
await step('board.unav', () => L.boardUnavMark(W.page, 'Bolt'))
await step('board.ground', () => W.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-aln]')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const cs = getComputedStyle(e); return { cls: e.className, text: e.textContent.trim().slice(0, 30), aln: e.dataset.aln, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` } })))
await L.center(W.page, '#schedBoard .sb-panel.unav'); await L.sleep(400)
await L.pic(W, OUT, p('6-board-unav'), { sel: '#schedBoard .sb-panel.unav' })
await step('board.pendchip', () => W.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard *')].find(x => x.children.length === 0 && /pending/.test(x.textContent) && x.getBoundingClientRect().width > 0); return e && e.textContent.trim() }))
await L.pic(W, OUT, p('7-board-top'), { clip: { x: 0, y: 0, width: W.page.viewportSize().width, height: 260 } })
// publish AL1 from the board
await step('publish.al', async () => {
  const sels = W.page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  const n = await sels.count()
  for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—')); if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]); await L.sleep(150) }
  const btns = await W.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-beak], #schedBoard [data-alpub]')].filter(b => b.getBoundingClientRect().width > 0).map(b => ({ a: b.getAttributeNames().filter(n => /^data-/.test(n)).join(','), t: b.innerText.trim(), dis: b.disabled })))
  let beak = W.page.locator('#schedBoard [data-alpub="2"]:visible').first()
  if (!await beak.count()) beak = W.page.locator('#schedBoard [data-beak="2"]:visible').first()
  if (!await beak.count()) return { btns, pressed: false }
  await beak.click(); await L.sleep(900)
  const ok = W.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await L.sleep(1000) }
  return { btns, pressed: true, ver: await W.page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
})
await step('after.board', () => L.boardUnavMark(W.page, 'Bolt'))
await L.pic(W, OUT, p('8-board-after-al1'), { clip: { x: 0, y: 0, width: W.page.viewportSize().width, height: W.page.viewportSize().height } })
await L.closeBoard(W)
await L.goEdit(W)
await L.center(W.page, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(400)
await step('after.week', () => readAll())
await L.pic(W, OUT, p('9-after-week'), { sel: '#eWeek section.day[data-day="2"]' })
await step('errs', async () => W.errs)
L.saveJson(OUT, p('results'), res)
await L.closeAll(W)
console.log('DONE')
