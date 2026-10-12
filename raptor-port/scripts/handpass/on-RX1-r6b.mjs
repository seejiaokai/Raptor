import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R6b' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W, { goToBoard: false })
await L.frameGrnd(page)
const snap = () => page.evaluate(() => {
  const t = document.getElementById('toastEl'), cs = getComputedStyle(t), r = t.getBoundingClientRect()
  const bar = document.querySelector('[data-testid="oilbar"]'), ans = document.querySelector('[data-testid="oilbar-answer"]'), ok = document.querySelector('[data-testid="oilbar-ok"]')
  const br = bar && bar.getBoundingClientRect()
  const hit = e => { if (!e) return null; const q = e.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return h === e || e.contains(h) ? 'button itself' : (h ? (h.id || '') + '.' + String(h.className).slice(0, 24) + '|' + h.textContent.slice(0, 24) : 'null') }
  const vis = cs.opacity !== '0'
  const tb = { x: Math.round(r.left), r: Math.round(r.right), y: Math.round(r.top), b: Math.round(r.bottom) }
  const bb = br ? { x: Math.round(br.left), r: Math.round(br.right), y: Math.round(br.top), b: Math.round(br.bottom) } : null
  const overlap = vis && bb ? !(tb.r <= bb.x || tb.x >= bb.r || tb.b <= bb.y || tb.y >= bb.b) : false
  return { txt: t.textContent.trim(), op: +(+cs.opacity).toFixed(2), toast: tb, bar: bb, overlap, hitAns: hit(ans), hitOk: hit(ok) }
})
async function dontSwap(fast) {
  const sp = fast ? { steps: 4, wait: 20, settle: 0 } : {}
  await L.drag(page, page.locator(L.wkSel(1)), page.locator(L.wkSel(0)), sp)
  await page.waitForSelector('[data-testid="oilconf-cancel"]', { timeout: 3000 })
  await press(tid('oilconf-cancel'))
}
const undoBtn = page.locator('#undoBtn'), redoBtn = page.locator('#redoBtn')
/* ORDER 1: the bar first, then a note (Undo's, Redo's) */
await dontSwap(false)
await page.waitForTimeout(3500)
console.log('bar up, no note', J(await snap()))
await undoBtn.click()
const o1 = []
for (let i = 0; i < 5; i++) { await page.waitForTimeout(i === 0 ? 200 : 150); o1.push(await snap()) }
console.log('what I did: pressed Undo with the bar up (the note says what it undid)')
console.log('ORDER1 note after Undo', J(o1))
await shot('RX1-6-1-note-over-bar')
await page.waitForTimeout(2500)
await redoBtn.click(); await page.waitForTimeout(300)
const o1b = await snap()
console.log('ORDER1 note after Redo', J(o1b))
await shot('RX1-6-1b-note-redo-over-bar')
console.log('bar still up', await tid('oilbar').count(), 'ground', J(await L.groundNow(page)))
/* ORDER 2: a note, then within a second the bar */
await press(tid('oilbar-ok')); await page.waitForTimeout(3000)
console.log('bar closed', await tid('oilbar').count())
await L.frameGrnd(page); await page.waitForTimeout(300)
console.log('before order 2', J(await snap()))
await undoBtn.click(); await page.waitForTimeout(400)
const t0 = Date.now()
await redoBtn.click()
const pre = await snap()
console.log('note just raised (no bar yet)', J(pre))
await dontSwap(true)
const tBar = Date.now() - t0
const o2 = []
for (let i = 0; i < 12; i++) { o2.push({ at: Date.now() - t0, ...(await snap()) }); await page.waitForTimeout(60) }
console.log('ORDER2 ms from the note to the bar being up', tBar)
console.log('ORDER2', J(o2.map(s => ({ at: s.at, txt: s.txt, op: s.op, toast: s.toast, bar: s.bar, overlap: s.overlap, hitAns: s.hitAns }))))
await shot('RX1-6-2-note-then-bar')
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
