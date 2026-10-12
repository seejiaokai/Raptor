import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R6' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W, { goToBoard: false })
await L.frameGrnd(page)
const snap = () => page.evaluate(() => {
  const t = document.getElementById('toastEl'), bar = document.querySelector('[data-testid="oilbar"]'), ans = document.querySelector('[data-testid="oilbar-answer"]'), ok = document.querySelector('[data-testid="oilbar-ok"]')
  const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }
  const tb = box(t), bb = box(bar)
  const cs = t ? getComputedStyle(t) : null
  const vis = !!t && t.style.opacity !== '0' && cs.opacity !== '0' && cs.visibility !== 'hidden'
  let hitAns = null, hitOk = null
  if (ans) { const r = ans.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); hitAns = h === ans || ans.contains(h) ? 'button itself' : (h ? h.id + '.' + String(h.className).slice(0, 30) + '|' + h.textContent.slice(0, 30) : 'null') }
  if (ok) { const r = ok.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); hitOk = h === ok || ok.contains(h) ? 'button itself' : (h ? h.id + '.' + String(h.className).slice(0, 30) : 'null') }
  const overlap = tb && bb && vis ? !(tb.r <= bb.x || tb.x >= bb.r || tb.b <= bb.y || tb.y >= bb.b) : null
  return { toastText: t ? t.textContent.trim() : null, toastVisible: vis, toastOpacity: cs ? cs.opacity : null, toast: tb, bar: bb, overlap, toastAboveBar: tb && bb ? tb.b <= bb.y : null, gap: tb && bb ? bb.y - tb.b : null, hitAns, hitOk, vh: innerHeight }
})
async function dontSwap(fast) {
  const sp = fast ? { steps: 5, wait: 30, settle: 0 } : {}
  await L.drag(page, page.locator(L.wkSel(1)), page.locator(L.wkSel(0)), sp)
  await page.waitForSelector('[data-testid="oilconf-cancel"]', { timeout: 3000 })
  await press(tid('oilconf-cancel'))
}
/* ORDER 1: the bar first, then a note */
await dontSwap(false)
await page.waitForTimeout(900)
console.log('bar up, no note yet', J(await snap()))
const rmk = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.SAT_DI}.1.rmks"]`)
await rmk.click(); await page.keyboard.type('bring helmets'); await page.keyboard.press('Tab')
const samples = []
for (let i = 0; i < 6; i++) { await page.waitForTimeout(i === 0 ? 120 : 250); samples.push(await snap()) }
console.log('ORDER1 samples', J(samples.map(s => ({ t: s.toastText, vis: s.toastVisible, toast: s.toast, bar: s.bar, overlap: s.overlap, above: s.toastAboveBar, gap: s.gap, hitAns: s.hitAns, hitOk: s.hitOk }))))
console.log('what I did: clicked Hangar open day\'s remark box on the week, typed "bring helmets", pressed Tab')
console.log('remark saved?', await page.evaluate(di => (window.DAYS[di].ground[1] || {}).rmks, L.SAT_DI))
// picture while the note is up: re-raise it and shoot fast
await rmk.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('bring helmets 2'); await page.keyboard.press('Tab')
await page.waitForTimeout(250)
console.log('picture-time snap', J(await snap()))
await shot('RX1-6-1-note-over-bar')
await page.waitForTimeout(3000)
console.log('later (note gone?)', J(await snap()))
console.log('bar still', await tid('oilbar').count())
// a second kind of note: right-click is not available (rows hold one); add undo
/* ORDER 2: the note first, then the bar */
await press(tid('oilbar-ok')); await page.waitForTimeout(400)
console.log('bar closed', await tid('oilbar').count())
await L.frameGrnd(page); await page.waitForTimeout(300)
await rmk.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('bring helmets 3'); await page.keyboard.press('Tab')
const t0 = Date.now()
await dontSwap(true)
const tBar = Date.now() - t0
const s2 = []
for (let i = 0; i < 6; i++) { await page.waitForTimeout(i === 0 ? 20 : 200); s2.push({ at: Date.now() - t0, ...(await snap()) }) }
console.log('ORDER2 ms from note to bar', tBar)
console.log('ORDER2 samples', J(s2.map(s => ({ at: s.at, t: s.toastText, vis: s.toastVisible, toast: s.toast, bar: s.bar, overlap: s.overlap, above: s.toastAboveBar, gap: s.gap, hitAns: s.hitAns }))))
await shot('RX1-6-2-order2')
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
