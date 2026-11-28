// r4wf-mb-m1 — merge walk, Share B, M1 (Astra's M1): a shared leave Ranger + Hex 08:00–12:00 and an ALL AVAIL Meeting
// 10:00–11:00 on Wed 15 Jul, both filed through the Inputs page; on the Board the meeting's row (under the Common
// Programme) carries a count of who is free ("35 … tap to see them"); its window opened and its names read; Ranger's
// leave Start 1130, Tab into his End.
// EXPECTED (brief): with the caret still in Ranger's row, RECORD the count and the names on both builds; on the merged
// build the Common Programme row and Available crew agree with each other and with what they read after the caret leaves.
// Ranger's box keeps the caret.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-m1.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, pic, fixture, caretAt, heldRows, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-m1 v2', BUILD, TAG)
const steps = [], pics = [], notes = []
async function fileAll(w, iso, label, type, from, to, title) {
  const P = w.page
  await L.openDay(w, iso); const before = await L.ids(P)
  await L.press(w, '#icPopAdd'); await P.locator('#inpEditPop #inpEditType').waitFor()
  await P.selectOption('#inpEditPop #inpEditType', type)
  const v = await P.evaluate(l => { const o = [...document.querySelectorAll('#inpEditPerson option')].find(o => o.textContent.trim().toUpperCase() === l); return o ? o.value : null }, label)
  if (!v) throw new Error('no person entry ' + label)
  await P.selectOption('#inpEditPop #inpEditPerson', v)
  if (await P.locator('#inpEditSpan [data-span="custom"]').count()) await L.press(w, '#inpEditSpan [data-span="custom"]')
  await P.fill('#inpEditPop #inpEditStart', from); await P.fill('#inpEditPop #inpEditEnd', to)
  const t = P.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(title)
  await L.press(w, '#inpEditSave'); notes.push('ALL AVAIL save asked ' + J(await L.answerAsks(w)))
  if (await P.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
  const made = (await L.ids(P)).filter(x => !before.includes(x)); return made.length === 1 ? made[0] : null
}
try {
  const w = await world(); const p = w.page
  await fixture(w, [L.RANGER, L.HEX], { from: '08:00', to: '12:00' })
  const mt = await fileAll(w, L.WED, 'ALL AVAIL', 'Meeting', '10:00', '11:00', 'All hands')
  if (!mt) throw new Error('the ALL AVAIL meeting was not filed')
  await openBoard(w)
  const CNT = `#schedBoard .oilcount[data-oilsent="i:${mt}"]`
  const row = () => p.evaluate(sel => {
    const c = document.querySelector(sel); if (!c) return { none: true }
    const r = c.closest('.sb-arow'), s = c.closest('[data-secmove]')
    return { section: s?.getAttribute('data-secmove') + ' "' + (s?.querySelector('.sb-ph')?.innerText || '').replace(/\s+/g, ' ').slice(0, 30) + '"', count: c.textContent.trim(), title: c.title, boxes: [...r.querySelectorAll('input,textarea')].map(i => i.value).join(' | ') }
  }, CNT)
  const winNames = () => p.evaluate(() => {
    const wins = [...document.querySelectorAll('[role="dialog"], [data-testid^="win-"], .win, .pop, .sheet')].filter(e => e.offsetWidth && e.offsetHeight)
    return wins.map(e => ({ id: e.getAttribute('data-testid') || e.id || e.className.slice(0, 30), head: (e.innerText || '').split('\n')[0].slice(0, 80), names: [...e.querySelectorAll('[data-person] .nm, [data-person]')].map(x => x.getAttribute('data-person') || x.textContent.trim()).filter((v, i, a) => v && a.indexOf(v) === i), ranger: !!e.querySelector('[data-person="bane"]') || /Ranger/.test(e.innerText), hex: !!e.querySelector('[data-person="rocky"]') || /\bHex\b/.test(e.innerText) }))
  })
  const availOf = () => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".avail"]'); return { ranger: !!s?.querySelector('[data-person="bane"]'), hex: !!s?.querySelector('[data-person="rocky"]'), n: new Set([...(s?.querySelectorAll('[data-person]') || [])].map(e => e.getAttribute('data-person'))).size } })
  const look = async label => { const r = await read(p, label); const o = { ...r, caretAt: await caretAt(p), held: await heldRows(p), row: await row(), win: await winNames(), avail: await availOf() }; steps.push(o); return o }
  await look('board opened')
  if (steps[0].row.none) throw new Error('no count on the meeting\'s row')
  pics.push(await pic(w, 'm1-0-row', [CNT.replace(' .oilcount', ' .sb-arow:has(.oilcount') + ')']))
  /* the count's window, opened, moved aside if it can be, left open */
  await clickNow(w, CNT); await sleep(700)
  await look('count pressed (its window)')
  pics.push(await pic(w, 'm1-1-window', ['body']))
  const winOpen = steps.at(-1).win.length > 0
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(300)
  const c1 = await caretAt(p)
  notes.push(`after clicking Ranger's Start with the window open: caret at ${c1}; windows still open ${J((await winNames()).map(x => x.id))}`)
  if (!/\.str$/.test(c1)) { await clickNow(w, rs); await sleep(300); notes.push('clicked Ranger\'s Start again: caret at ' + await caretAt(p)) }
  await p.keyboard.press('Control+A'); await p.keyboard.type('1130'); await p.keyboard.press('Tab'); await sleep(700)
  const held = await look('1130, Tab (caret in Ranger\'s End)')
  pics.push(await pic(w, 'm1-2-row-caret-in-ranger', ['#sbBoard > [data-secmove$=".prog"]']))
  pics.push(await pic(w, 'm1-2-whole', ['body']))
  await p.mouse.click(3, 3); await sleep(700)
  const left = await look('caret left')
  pics.push(await pic(w, 'm1-3-row-left', ['#sbBoard > [data-secmove$=".prog"]']))
  await clickNow(w, CNT); await sleep(700)
  const reopened = await look('count pressed again after the caret left')
  pics.push(await pic(w, 'm1-4-window-after', ['body']))
  const keeps = /\.end$/.test(held.caretAt)
  const sameAsLeft = held.row.count === left.row.count && J(held.avail) === J(left.avail)
  const agreeEachOther = held.avail.ranger === true && held.avail.hex === false
  add('M1', BUILD === 'merged' ? (keeps && sameAsLeft && agreeEachOther ? 'PASS' : 'FAIL') : 'RECORD', { keeps, sameAsLeft, rangerInAvailHexNot: agreeEachOther, winOpenBeforeTyping: winOpen, notes, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store, held: x.held, row: x.row, win: x.win, avail: x.avail })) }, pics)
} catch (e) { add('M1', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps: steps.map(x => ({ step: x.step, row: x.row, win: x.win })) }).slice(0, 3000), pics) }
await done('m1')
