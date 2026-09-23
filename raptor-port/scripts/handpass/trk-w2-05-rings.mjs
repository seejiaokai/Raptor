/* [HUMAN-RETEST] Tracker — walker w2, walk 5: RINGS, LANDING, WEDGES
   (R55, R57–R62, Astra #20–#22), desktop 1440x900, admin.

   The yellow "can be planned next" rings, what a Crew-dropdown pick does to
   the view, a press on another student's wedge, a press on the ball's centre,
   the cyan edge, and whether grading far down the chart moves the view. */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, ringed, pickFrom, offCentre, scrollOf, wedgePoint, wedges, mine, centreOf, ticks } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const crew = () => page.locator('#activeSel option:checked').innerText()
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }

/* ---- 1. the rings are the PICKED student's (R55) ---- */
const r0 = await ringed(page)
L.note('1.0 A, nothing marked: ringed', r0.slice(0, 12).join(', ') + (r0.length > 12 ? ' …(' + r0.length + ')' : ''))
await tapBall(page, 'ST-01'); await grade('DCO')
const rA = await ringed(page)
L.ok('1.1 ST-01 done for A → A\'s rings: ACG-01 ringed, ST-01 not', rA.includes('ACG-01') && !rA.includes('ST-01'), 'ringed: ' + rA.slice(0, 10).join(', '))
await pickFrom(page, '#activeSel', /STUDENT B/)
const rB = await ringed(page)
L.ok('1.2 pick B → the rings are B\'s: ST-01 ringed, ACG-01 not (the owner\'s 9 Sep screenshot)', rB.includes('ST-01') && !rB.includes('ACG-01'), 'ringed: ' + rB.slice(0, 10).join(', '))
await shot(page, 'w2-07-rings-for-B')

/* ---- 2. landing: B (no mark) → the chart's first event, centred; A → A's latest mark ---- */
await pickFrom(page, '#activeSel', /STUDENT A/)
await tapBall(page, 'TR-3'); await grade('DCO')                    // A's latest mark, far down the chart
await reveal(page, 'BFM-3'); await sleep(200)                       // look somewhere else entirely
const s0 = await scrollOf(page)
await pickFrom(page, '#activeSel', /STUDENT B/); await sleep(400)
const oB = await offCentre(page, 'ST-01'); const s1 = await scrollOf(page)
L.ok('2.1 picking B (nothing marked) lands on the chart\'s FIRST event, ST-01, centred', oB && Math.abs(oB.dx) <= 6 && Math.abs(oB.dy) <= 6, `ST-01 off centre by ${JSON.stringify(oB)}; view ${JSON.stringify(s0)} → ${JSON.stringify(s1)}`)
await shot(page, 'w2-07-land-B-first-event')
await pickFrom(page, '#activeSel', /STUDENT A/); await sleep(400)
const oA = await offCentre(page, 'TR-3')
L.ok('2.2 picking A lands on A\'s latest mark (TR-3), centred', oA && Math.abs(oA.dx) <= 6 && Math.abs(oA.dy) <= 6, `TR-3 off centre by ${JSON.stringify(oA)}`)
await shot(page, 'w2-07-land-A-latest')
L.ok('2.3 picking a student never changes the syllabus', (await page.locator('#sylSel option:checked').innerText()).trim() === '2026', await page.locator('#sylSel option:checked').innerText())
/* a pick closes an open grading pop-up */
await tapBall(page, 'TR-4'); const openBefore = await popOpen(page)
await pickFrom(page, '#activeSel', /STUDENT B/)
L.ok('2.4 a Crew pick closes an open grading pop-up', openBefore && !(await popOpen(page)), `open before ${openBefore}, after ${await popOpen(page)}`)
await pickFrom(page, '#activeSel', /STUDENT A/)

/* ---- 3. tap B's wedge on a ball: B picked, nothing opens, the view stays (R60) ---- */
await reveal(page, 'ACG-02'); await sleep(200)
const sv = await scrollOf(page)
const wp = await wedgePoint(page, 'ACG-02', 1)
await page.mouse.click(wp.x, wp.y); await sleep(450)
const sv2 = await scrollOf(page)
L.ok('3.1 a press on B\'s wedge picks B (the Crew dropdown follows)', /STUDENT B/.test(await crew()), 'crew: ' + await crew())
L.ok('3.2 …opens nothing', !(await popOpen(page)), (await popOpen(page)) ? 'pop-up opened: ' + await popTitle(page) : 'nothing open')
L.ok('3.3 …and the view does not move', JSON.stringify(sv) === JSON.stringify(sv2), `${JSON.stringify(sv)} → ${JSON.stringify(sv2)}`)
await shot(page, 'w2-07-wedge-picked-B')
/* the picked student's OWN wedge opens grading */
const wp2 = await wedgePoint(page, 'ACG-02', 1)
await page.mouse.click(wp2.x, wp2.y); await sleep(400)
L.ok('3.4 a press on the picked student\'s own wedge opens grading for them', await popOpen(page) && /STUDENT B/.test(await popTitle(page)), await popTitle(page))
await page.keyboard.press('Escape'); await sleep(200)

/* ---- 4. the ball's centre grades the picked student; the cyan EDGE ---- */
await tapBall(page, 'ACG-02', { noReveal: true })
L.ok('4.1 a press on the centre opens grading for the PICKED student (B)', /ACG-02 · STUDENT B/.test(await popTitle(page)), await popTitle(page))
await grade('DPCO')
const w = await wedges(page, 'ACG-02'); const m = await mine(page, 'ACG-02')
L.ok('4.2 B\'s wedge takes the DPCO colour, A\'s does not', w[1] !== '#ffffff' && w[0] === '#ffffff', JSON.stringify(w))
L.ok('4.3 the picked student\'s wedge wears a cyan EDGE, never a fill (the DPCO colour still shows)', m && m.wi === '1' && m.fill === 'none' && /36c2ff/i.test(m.stroke), JSON.stringify(m))
const c = await centreOf(page, 'ACG-02')
await page.screenshot({ path: (await import('./trk-lib.mjs')).SHOTS + '/w2-07-cyan-edge-zoom.png', clip: { x: c.x - 70, y: c.y - 70, width: 140, height: 140 } })
const allEdged = await page.evaluate(() => { const gs = [...document.querySelectorAll('#flowSvg .ball')]; return { balls: gs.length, edged: gs.filter(g => { const m = g.querySelector('path.mine'); return m && m.dataset.wi === '1' && m.getAttribute('fill') === 'none' }).length } })
L.ok('4.4 EVERY ball edges B\'s wedge in cyan', allEdged.balls === allEdged.edged, JSON.stringify(allEdged))

/* ---- 5. grading / + / − far down the chart leaves the view where it is (R62) ---- */
await reveal(page, 'BFM-3'); await sleep(250)
const f0 = await scrollOf(page)
await tapBall(page, 'BFM-3', { noReveal: true }); await grade('DCO')
const f1 = await scrollOf(page)
L.ok('5.1 grading BFM-3 (far down) leaves the view where it is', JSON.stringify(f0) === JSON.stringify(f1), `${JSON.stringify(f0)} → ${JSON.stringify(f1)}`)
await tapBall(page, 'BFM-3', { noReveal: true }); await page.click('#popFailPlus'); await sleep(450)
const f2 = await scrollOf(page)
await page.click('#popFailMinus'); await sleep(450)
const f3 = await scrollOf(page)
L.ok('5.2 + and − a failure there leave the view where it is', JSON.stringify(f0) === JSON.stringify(f2) && JSON.stringify(f0) === JSON.stringify(f3), `${JSON.stringify(f0)} → + ${JSON.stringify(f2)} → − ${JSON.stringify(f3)}`)
await page.keyboard.press('Escape'); await sleep(200)
await shot(page, 'w2-07-far-down-view-kept')

/* ---- 6. (off-list, Astra #36) a press on ANOTHER student's red failure tick ---- */
await tapBall(page, 'BFM-3', { noReveal: true }); await page.click('#popFailPlus'); await sleep(400); await page.keyboard.press('Escape'); await sleep(200)   // B: one failure on BFM-3
await pickFrom(page, '#activeSel', /STUDENT A/)
await reveal(page, 'BFM-3'); await sleep(200)
const tick = await page.evaluate(() => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'BFM-3'); const l = g && g.querySelector('line[stroke="#ff2b2b"]'); if (!l) return null
  const r = l.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const hit = document.elementFromPoint(x, y)
  return { x, y, hit: hit ? hit.tagName + (hit.getAttribute('class') ? '.' + hit.getAttribute('class') : '') : null }
})
if (tick) {
  await page.mouse.click(tick.x, tick.y); await sleep(400)
  L.note('6. a press on B\'s red tick on BFM-3 (A picked) hits a ' + tick.hit, (await popOpen(page)) ? 'opened grading for ' + await popTitle(page) + ' (B was not picked)' : 'picked ' + await crew())
  await shot(page, 'w2-07-press-on-tick')
  await page.keyboard.press('Escape'); await sleep(200)
} else L.note('6. no tick drawn on BFM-3 for B', String(await ticks(page, 'BFM-3')))

save('w2-05-rings', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
