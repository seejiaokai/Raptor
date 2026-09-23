/* w3 item 16 — arrange mode, desktop 1440 (R90–R93, Astra #34, #35).
   The tool strip docks under the bar and never covers the chart: the top ball
   (ST-01) and the bottom-most ball are clickable and draggable; turning edit on
   adds or removes no bar button; ⤢ Fit and ↺ Reset layout live in the strip.
   ↺ Reset layout warns that drawn lines go too, clears them, ↶ brings them
   back. Switching tools never moves the chart. The hint is one line and at rest
   does not cover the colour legend; the Line tool's long hint — what does it
   cover? Plus item 2's leftover: balls named Z-2, Z-9, Z-10 in Show All. */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, ball, menuItem, dlg, dlgText, box } from './trk-w3-lib.mjs'

const L = log()
const tr = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? g.getAttribute('transform') : null }, id)
const barIds = page => page.evaluate(() => [...document.querySelectorAll('#page-tracker header button, #page-tracker header select, #page-tracker header input')].filter(e => e.getBoundingClientRect().width).map(e => e.id || e.textContent.trim()).join(' '))
const freeLines = page => page.evaluate(() => document.querySelectorAll('#flowSvg path[id^="lp_"]').length)
const hitIsBall = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return 'no ball'; const r = g.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && h.closest('.ball') === g ? 'ball' : (h ? h.tagName + '#' + h.id + '.' + (typeof h.className === 'string' ? h.className : (h.className && h.className.baseVal) || '') : 'nothing') }, id)
async function dragBy(page, id, dx, dy) {
  const b = await ball(page, id).boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  await page.mouse.move(x, y); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + dx * i / 8, y + dy * i / 8)
  await page.mouse.up(); await sleep(300)
}

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const bar0 = await barIds(page)
await menuItem(page, 'syl', 'arrangeBtn')
const bar1 = await barIds(page)
L.ok('R90: turning edit on adds or removes no bar button', bar0 === bar1, bar0 === bar1 ? 'same' : `${bar0} → ${bar1}`)
L.ok('R91: the Syllabus ✎ lights while editing and its first item reads "✓ Done editing chart"', (await page.locator('#sylMenuBtn.primary').count()) === 1 && (await page.locator('#arrangeBtn').innerText()) === '✓ Done editing chart', await page.locator('#arrangeBtn').innerText())
L.ok('R90: ⤢ Fit and ↺ Reset layout are in the strip', (await page.locator('#arrTools #fitBtn').count()) === 1 && (await page.locator('#arrTools #resetLayout').count()) === 1, '')
const strip = await box(page, '#arrTools'), hint = await box(page, '#arrhint'), legend = await box(page, '#page-tracker .legend'), bd = await box(page, '#board'), hdr = await box(page, '#page-tracker header')
L.ok('R90: the strip sits below the bar and above the chart — never over it', strip.y >= hdr.b - 1 && bd.y >= strip.b, JSON.stringify({ bar: [hdr.y, hdr.b], strip: [strip.y, strip.b], hint: hint && [hint.y, hint.b], legend: legend && [legend.y, legend.b], chart: [bd.y, bd.b] }))
L.ok('R93: at rest (Move) the hint is ONE line and does not cover the legend', hint && hint.h <= 30 && legend && (hint.b <= legend.y || hint.y >= legend.b), `hint ${JSON.stringify(hint)} · legend ${JSON.stringify(legend)} · "${await page.locator('#arrhint').innerText()}"`)
await shot(page, 'w3-16-arrange-rest')

/* the top ball and the bottom-most ball */
await reveal(page, 'ST-01')
L.ok('the top ball ST-01 is what a press at its centre hits', (await hitIsBall(page, 'ST-01')) === 'ball', await hitIsBall(page, 'ST-01'))
let t0 = await tr(page, 'ST-01'); await dragBy(page, 'ST-01', 40, 25); let t1 = await tr(page, 'ST-01')
L.ok('…and it drags', t0 !== t1, `${t0} → ${t1}`)
await page.click('#trUndoBtn'); await sleep(300)
L.note('↶ put it back', `${await tr(page, 'ST-01')} (was ${t0})`)
const lowest = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(g => { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute('transform') || ''); return { id: g.dataset.id, y: m ? +m[2] : 0 } }).sort((a, b) => b.y - a.y)[0].id)
await reveal(page, lowest)
L.ok(`the bottom-most ball ${lowest} is what a press at its centre hits`, (await hitIsBall(page, lowest)) === 'ball', await hitIsBall(page, lowest))
t0 = await tr(page, lowest); await dragBy(page, lowest, -40, -25); t1 = await tr(page, lowest)
L.ok('…and it drags', t0 !== t1, `${t0} → ${t1}`)
await page.click('#trUndoBtn'); await sleep(300)
await shot(page, 'w3-16-bottom-ball')

/* switching tools never moves the chart */
await reveal(page, 'ACG-02')
const at0 = await box(page, '#flowSvg .ball[data-id="ACG-02"]')
const toolMoves = []; const hints = {}
for (const name of ['▣ Select', '→ Connect', '🗑 Delete', '✎ Text', '╱ Line', '❐ Edit lines', '✕ Merge', '⌢ Unmerge', '✋ Move']) {
  await page.locator('#arrTools').getByRole('button', { name, exact: true }).click(); await sleep(200)
  const a = await box(page, '#flowSvg .ball[data-id="ACG-02"]')
  if (!a || a.x !== at0.x || a.y !== at0.y) toolMoves.push(`${name}: ${JSON.stringify(a)}`)
  const h = await box(page, '#arrhint'); hints[name] = h ? h.h : 0
  if (name === '╱ Line') {
    const lg = await box(page, '#page-tracker .legend'), b2 = await box(page, '#board')
    const lh = await box(page, '#arrhint')
    const covers = []
    if (lg && lh && lh.b > lg.y && lh.y < lg.b) covers.push('the colour legend')
    if (b2 && lh && lh.b > b2.y) covers.push(`the top ${lh.b - b2.y}px of the chart`)
    L.note('R93: the Line tool\'s hint', `${lh && lh.h}px tall (${Math.round((lh && lh.h || 0) / 26.4)} lines) — covers ${covers.join(' and ') || 'nothing'} · "${(await page.locator('#arrhint').innerText()).slice(0, 90)}…"`)
    await shot(page, 'w3-16-line-hint')
  }
}
L.ok('R93: switching through every tool never moves the chart', !toolMoves.length, toolMoves.join(' | ') || `ACG-02 stayed at ${at0.x},${at0.y}`)
L.note('hint height per tool (px)', JSON.stringify(hints))

/* Reset layout: draw a line, reset, undo */
const n0 = await freeLines(page)
await page.locator('#arrTools').getByRole('button', { name: '╱ Line', exact: true }).click(); await sleep(200)
const bb = await box(page, '#board')
/* two clicks on empty chart, far from any ball */
const empty = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); const pts = []; for (let fy = 0.2; fy < 0.9; fy += 0.05) for (let fx = 0.05; fx < 0.95; fx += 0.05) { const x = b.left + b.width * fx, y = b.top + b.height * fy; const el = document.elementFromPoint(x, y); if (el && (el.id === 'flowSvg' || (el.closest('#flowSvg') && !el.closest('.ball') && el.tagName.toLowerCase() === 'rect'))) pts.push({ x, y }) } return pts })
const p1 = empty[0], p2 = empty.find(p => Math.abs(p.x - p1.x) > 120 && Math.abs(p.y - p1.y) > 60) || empty[empty.length - 1]
await page.mouse.click(p1.x, p1.y); await sleep(200); await page.mouse.click(p2.x, p2.y); await sleep(400)
const n1 = await freeLines(page)
L.note('a line drawn on 2026', `drawn lines ${n0} → ${n1} · Save waiting ${await page.locator('#saveChanges').count()}`)
await page.locator('#arrTools').getByRole('button', { name: '✋ Move', exact: true }).click(); await sleep(200)
await page.click('#resetLayout'); await sleep(300)
const q = await dlgText(page)
L.ok('R92: ↺ Reset layout warns that the drawn lines go too', /lines drawn on this chart/.test(q || ''), (q || 'no question').replace(/\s+/g, ' '))
await shot(page, 'w3-16-reset-warning')
await page.click('#dlgOk'); await sleep(600)
const n2 = await freeLines(page)
L.ok('R92: …OK clears them', n2 < n1, `drawn lines ${n1} → ${n2}`)
await page.click('#trUndoBtn'); await sleep(600)
const n3 = await freeLines(page)
L.ok('R92: …and ↶ brings them back', n3 === n1, `drawn lines ${n2} → ${n3}`)
await shot(page, 'w3-16-after-undo-reset')

/* Z-2, Z-9, Z-10 in Show All (item 2's number order, on new balls) */
for (const id of ['Z-10', 'Z-9', 'Z-2']) { await page.locator('#arrTools button', { hasText: '+ Flight' }).click(); await sleep(250); await dlg(page, { value: id }); await sleep(300) }
await menuItem(page, 'syl', 'arrangeBtn')
await page.click('#saveChanges'); await sleep(500)
await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
await page.click('#saSearch'); await page.keyboard.type('Z-', { delay: 30 }); await sleep(300)
const zs = await page.evaluate(() => [...document.querySelectorAll('#saBody .sarow .sid')].map(s => s.textContent.trim()))
L.ok('item 2 on new balls: Show All lists Z-2, Z-9, Z-10 in that order (ST-9 before ST-10)', JSON.stringify(zs) === JSON.stringify(['Z-2', 'Z-9', 'Z-10']), JSON.stringify(zs))
await shot(page, 'w3-16-showall-Z')
L.note('errors', errors.join(' | ') || 'none')
save('w3-16-arrange', { rows: L.rows })
await browser.close()
