import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R7', size: 'p844' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const sleep = L.sleep
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'], title: 'OD thing' })
const rec0 = () => L.recOf(page, iid)
console.log('filed', iid, await rec0())
await page.evaluate(() => window.go('editsched')); await sleep(900)
const day = page.locator('#page-editsched .day:not(.peek)').nth(L.SAT_DI)
const row = day.locator(`[data-inprow="${iid}"]`).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
const hex = await L.idOf(page, 'Hex')
const hp = () => page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first()
const armed = () => page.evaluate(([di, iid]) => {
  const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  const row = day.querySelector(`[data-inprow="${iid}"]`)
  const pk = row && row.querySelector('.puck')
  const seat = pk && (pk.closest('[data-inpseat]') || pk)
  const cs = pk ? getComputedStyle(pk) : null
  const arm = document.querySelector('.ros-arm')
  const ros = document.querySelector('#eRoster'); const rb = ros && ros.getBoundingClientRect()
  return {
    rosArm: !!arm,
    rowCls: row ? row.className : null,
    puckCls: pk ? pk.className : null,
    seatCls: seat ? seat.className : null,
    boxShadow: cs ? cs.boxShadow.slice(0, 80) : null,
    outline: cs ? cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor : null,
    rowRing: row ? getComputedStyle(row).boxShadow.slice(0, 60) + '|' + getComputedStyle(row).outlineStyle : null,
    drawerOpen: !!rb && rb.width > 0 && rb.left < innerWidth - 20 && rb.right > 0, drawerLeft: rb ? Math.round(rb.left) : null,
    ringedAny: [...document.querySelectorAll('#page-editsched .day .arm, #page-editsched .day .armed, #page-editsched .day [class*="arm"]')].map(e => e.className).slice(0, 5),
  }
}, [L.SAT_DI, iid])
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const s0 = { rec: await rec0(), undo: await undoLabel() }
console.log('0 before', J(await armed()))
const pk = await row.locator('.puck').first().boundingBox()
await page.touchscreen.tap(pk.x + pk.width / 2, pk.y + pk.height / 2); await sleep(800)
const a1 = await armed(); console.log('1 after arming tap', J(a1))
await shot('RX1-7-1-armed-drawer')
if (!a1.drawerOpen) { await page.locator('#rosTab').tap(); await sleep(800) }
await hp().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await hp().tap(); await sleep(900)
const q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => 'NO'), btns: [await tid('oilconf-cancel').innerText().catch(() => ''), await tid('oilconf-save').innerText().catch(() => '')], measure: await L.measure(page, '[data-testid="oilconf"] .airpop-box'), unchanged: (await rec0()) === s0.rec, undoSame: (await undoLabel()) === s0.undo }
console.log('2 QUESTION', J(q))
const a2 = await armed(); console.log('2 armed state behind the question', J(a2))
await W.hush(); await shot('RX1-7-2-question'); await W.unhush()
// the row, scrolled into view and the question moved aside is not possible: take a clip of the row from the page behind
await page.keyboard.press('Escape'); await sleep(700)
const a3 = await armed()
console.log('3 Escape: question', await tid('oilconf').count(), 'bar', await tid('oilbar-text').innerText().catch(() => 'NO'), 'barBox', J(await L.measure(page, '[data-testid="oilbar"]')))
console.log('3 armed after Escape', J(a3), 'rec same', (await rec0()) === s0.rec, 'undo same', (await undoLabel()) === s0.undo)
await W.hush(); await shot('RX1-7-3-bar-still-armed'); await W.unhush()
await press(tid('oilbar-answer')); await sleep(600)
console.log('4 Answer OIL: question', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'), 'armed', J(await armed()))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(1000)
const a5 = await armed()
console.log('5 after Swap: toast', await L.toast(page), 'rec', await rec0(), 'bar', await tid('oilbar').count(), 'question', await tid('oilconf').count())
console.log('5 armed', J(a5))
await shot('RX1-7-4-after-swap')
console.log('RECORD drawer open at the end:', a5.drawerOpen, 'drawerLeft', a5.drawerLeft, 'rosArm', a5.rosArm)
await press(page.locator('#undoBtn')).catch(() => {}); await sleep(700)
console.log('6 Undo once: rec', await rec0(), 'same as start', (await rec0()) === s0.rec)
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
