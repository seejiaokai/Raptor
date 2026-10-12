import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R5' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const trident = await L.idOf(page, 'Trident')
const iid = await L.fileIt(W, L.FRI, { type: 'Training', people: ['bane', trident], from: '09:00', to: '12:00', title: 'Range brief' })
await L.makeHoliday(W, L.FRI, 'National Day', { later: true })
await L.plainRow(W, L.FRI_DI, 1, 'Hangar open day', '13:00', '15:00', ['nick'])
const row = `#sbBoard [data-move="mv:g.${L.FRI_DI}.2"]`
console.log('add candidates', J(await page.evaluate(sel => [...document.querySelector(sel).querySelectorAll('*')].filter(e => /^\+ ?add/i.test(e.textContent.trim()) && !e.children.length).map(e => e.tagName + '.' + e.className + ' [' + [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 25)).join(' ') + ']'), row)))
const addSel = `${row} .addz, ${row} [data-addslot], ${row} .addp`
console.log('addSel count', await page.locator(addSel).count())
const tally = `#sbBoard [data-slot="g:${L.FRI_DI}.1"] .puck`
await page.locator(row).evaluate((e, top) => {
  const sec = e.closest('.sb-sec'); sec.scrollIntoView({ block: 'start' })
  let sc = sec.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement
  if (sc) sc.scrollTop -= top
}, 120); await page.waitForTimeout(300)
const s0 = { rec: await L.recOf(page, iid), ground: await L.groundNow(page, L.FRI_DI), undo: await L.undoState(page) }
console.log('BEFORE', J(s0))
await L.drag(page, page.locator(tally), page.locator(addSel).first())
console.log('Q', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'), '|', await tid('oilconf-cancel').innerText().catch(() => ''), '|', await tid('oilconf-save').innerText().catch(() => ''))
console.log('behind: rec same', (await L.recOf(page, iid)) === s0.rec, 'ground same', J(await L.groundNow(page, L.FRI_DI)) === J(s0.ground), 'undo same', (await L.undoState(page)) === s0.undo, 'input window', await page.locator('#inpEditPop:not([hidden])').count())
await W.hush(); await shot('RX1-5-1-question'); await W.unhush()
await press(tid('oilconf-cancel')); await page.waitForTimeout(100)
const addPlace = `${row} .addz`
console.log('flash tally seat', J(await L.flashing(page, [tally])))
console.log('flash classes at 100ms', J(await page.evaluate(([row, tally]) => ({
  tallyHost: (() => { const p = document.querySelector(tally); const h = p.closest('.seat') || p; return h.className })(),
  rowEls: [...document.querySelector(row).querySelectorAll('.lift-land')].map(e => e.tagName + '.' + e.className.slice(0, 50) + ' :: ' + e.textContent.trim().slice(0, 20)),
  allLand: [...document.querySelectorAll('#sbBoard .lift-land')].map(e => e.tagName + '.' + e.className.slice(0, 60) + ' :: ' + e.textContent.trim().slice(0, 20)),
}), [row, tally])))
await shot('RX1-5-2-flash-100ms')
await page.waitForTimeout(700)
console.log('bar', await tid('oilbar-text').innerText().catch(() => 'NO'), J(await L.measure(page, '[data-testid="oilbar"]')))
console.log('AFTER: rec same', (await L.recOf(page, iid)) === s0.rec, 'ground same', J(await L.groundNow(page, L.FRI_DI)) === J(s0.ground), 'undo same', (await L.undoState(page)) === s0.undo, J(await L.groundNow(page, L.FRI_DI)), await L.recOf(page, iid))
await W.hush(); await shot('RX1-5-3-bar'); await W.unhush()
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
