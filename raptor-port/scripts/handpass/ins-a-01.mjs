/* Scenario 1 — the Scheduler Board: RECORD what door exists; prove the counting half (a waiting change made ON the board). */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic, savePart } = A
const S = '1', SEAT = '1.1.1.0.p', NEW = 'shaft'
const { browser, p, errors } = await A.world()
try {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const f0 = await A.face(p, TUE)
  const i0 = await A.ins(p, 's1-a-orig-editsched')
  row(`${S}.a`, `admin, Edit Schedule: Tuesday signed and published (${pub.r.label}); Insights opened by ${i0.how}`, `day: ${A.faceLine(f0)} · window on top at its centre: ${i0.top} · ${A.sum(i0)}`, 'RECORDED', i0.shots)

  /* the window opened on Edit Schedule BEFORE the board: is it still there once the board is up? */
  const o = await A.insOpen(p)
  const cover = await p.evaluate(() => { const m = document.querySelector('#insightModal'); const r = m.getBoundingClientRect(); return { covers: r.left <= 0 && r.top <= 0 && r.right >= innerWidth && r.bottom >= innerHeight, z: getComputedStyle(m).zIndex } })
  await p.evaluate(d => window.openScheduler(d), TUE); await L.sleep(900)
  const boardUp = await p.locator('#schedBoard:visible').count()
  const still = await A.insRead(p)
  const shotB = await pic(p, 's1-b-window-then-board')
  row(`${S}.b`, `Insights left open on Edit Schedule (${o.how}), then the board opened for Tuesday (by the bridge — with the window open it covers the whole page: ${JSON.stringify(cover)}, so no finger can reach the day's board button)`,
    `board up: ${!!boardUp} · the window ${still.err ? 'is GONE (' + still.err + ')' : 'is still there, on top at its centre: ' + still.top + ', same words as before: ' + A.same(i0, still)}`, 'RECORDED', [shotB])
  await A.insClose(p)
  if (!boardUp) await W.boardOn(p, TUE)

  /* the board's own bar: what is there, and is any Insights door reachable */
  const bar = await p.evaluate(() => { const b = document.querySelector('#schedBoard')
    const top = e => { if (!e) return 'absent'; const r = e.getBoundingClientRect(); if (!r.width || e.offsetParent === null) return 'not drawn'; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) ? 'reachable' : 'covered by the board' }
    const btns = [...b.querySelectorAll('button')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().top < 120 && e.getBoundingClientRect().top >= 0).map(e => (e.innerText.trim() || e.title || e.getAttribute('aria-label') || e.id).replace(/\s+/g, ' ').slice(0, 26))
    return { btns, anyInsightsWord: [...b.querySelectorAll('button, a')].filter(e => /insight/i.test(e.innerText + ' ' + (e.title || '') + ' ' + (e.getAttribute('aria-label') || ''))).length, topBarInsights: top(document.querySelector('#insightBtn')), burger: top(document.querySelector('#burger')) } })
  /* the ⋯ on a phone */
  let more = ''
  const mb = p.locator('#sbMore:visible').first()
  if (await mb.count()) { await mb.click(); await L.sleep(400); more = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sbmore-menu button, #schedBoard [class*=more] button, .sbmenu button')].filter(e => e.offsetParent !== null).map(e => e.innerText.trim().replace(/\s+/g, ' ').slice(0, 24)).join(', ')); const sm = await pic(p, 's1-c-board-more'); more += ` [${sm}]`; await p.keyboard.press('Escape'); await mb.click().catch(() => {}); await L.sleep(200) }
  const shotC = await pic(p, 's1-c-board-bar')
  row(`${S}.c`, 'the Scheduler Board up for Tuesday: every button in its own bar, and whether any door to Insights can be reached', `bar: [${bar.btns.join(' | ')}] · buttons on the board naming Insights: ${bar.anyInsightsWord} · the app's top-bar Insights button: ${bar.topBarInsights} · the ☰: ${bar.burger}${more ? ' · behind ⋯: ' + more : ''}`, 'RECORDED', [shotC])

  /* the counting half: a waiting change made ON the board */
  if (await p.locator('#sbMore[aria-expanded="true"]').count()) await p.locator('#sbMore').click().catch(() => {})
  if (A.PHONE) {
    /* a phone: the crew list is a drawer and a tap on a filled seat picks the man in it up, so the waiting change made
       on the board here is the line's own CX (Go 2, RU lead) */
    const did = await A.cxLine(p, '1.1.1.0')
    const hb = await A.head(p, TUE)
    const shotD = await pic(p, 's1-d-board-line-cancelled')
    await W.boardOff(p)
    const f1 = await A.face(p, TUE)
    const i1 = await A.ins(p, 's1-e-pending-editsched')
    judge(`${S}.d`, `on the board (phone): CX on Go 2's RU lead line (${did}); ✓ Done; Insights on Edit Schedule by ${i1.how}`, [
      ['the board showed the day pending', /pending/.test(hb.pending), hb.pending + ' / ' + hb.alpub],
      ['Edit Schedule shows Tuesday pending', A.isPending(f1), A.faceLine(f1)],
      ['the window is on top at its centre', i1.top === true],
      ['the window says word for word what it said at Original', A.same(i0, i1), A.diffText(i0, i1)],
      ['By day still reads Tuesday 8 sorties', /8 sorties/.test(A.byDay(i1, 'Tue')), A.byDay(i1, 'Tue')],
    ], [shotD, ...i1.shots])
    const al = await A.pubAL(p, TUE)
    const f2 = await A.face(p, TUE)
    const i2 = await A.ins(p, 's1-f-AL1-editsched')
    judge(`${S}.e`, `Tuesday signed and "${al.r.label || al.r.why}" pressed; Insights on Edit Schedule`, [
      ['the day reads AL1, nothing pending', /AL1/.test(f2.tag) && !A.isPending(f2), A.faceLine(f2)],
      ['the window moved', !A.same(i1, i2), A.diffText(i1, i2)],
      ['Sorties 32 → 31', A.tile(i0, /Sorties/i) === '32' && A.tile(i2, /Sorties/i) === '31', A.tilesLine(i2)],
      ['By day reads Tuesday 7 sorties', /7 sorties/.test(A.byDay(i2, 'Tue')), A.byDay(i2, 'Tue')],
    ], i2.shots)
    throw 'done'
  }
  const put = await A.seatPut(p, SEAT, NEW)
  const hb = await A.head(p, TUE)
  const shotD = await pic(p, 's1-d-board-seat-changed')
  const done = await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.ins(p, 's1-e-pending-editsched')
  judge(`${S}.d`, `on the board: ${await A.cs(p, NEW)} put on ${await A.cs(p, put.before)}'s seat (Go 2, RU lead) — ${JSON.stringify(put)}; ✓ Done; Insights on Edit Schedule`, [
    ['the seat took the new man', put.took, put],
    ['the board showed the day pending', /pending/.test(hb.pending), hb.pending + ' / ' + hb.alpub],
    ['Edit Schedule shows Tuesday pending', A.isPending(f1), A.faceLine(f1)],
    ['the window is on top at its centre', i1.top === true],
    ['the window says word for word what it said at Original', A.same(i0, i1), A.diffText(i0, i1)],
    ['Not on the flying programme still lists the new man (issued: he is not flying)', A.idleHas(i1, await A.cs(p, NEW))],
  ], [shotD, ...i1.shots])

  const al = await A.pubAL(p, TUE)
  const f2 = await A.face(p, TUE)
  const i2 = await A.ins(p, 's1-f-AL1-editsched')
  const oldCs = await A.cs(p, put.before), newCs = await A.cs(p, NEW)
  judge(`${S}.e`, `Tuesday signed and "${al.r.label || al.r.why}" pressed; Insights on Edit Schedule`, [
    ['the day reads AL1, nothing pending', /AL1/.test(f2.tag) && !A.isPending(f2), A.faceLine(f2)],
    ['the window moved', !A.same(i1, i2), A.diffText(i1, i2)],
    [`${newCs} left "Not on the flying programme"`, !A.idleHas(i2, newCs)],
    [`${oldCs} joined "Not on the flying programme"`, A.idleHas(i2, oldCs)],
    ['Sorties and Formations unchanged', A.tile(i2, /Sorties/i) === A.tile(i0, /Sorties/i) && A.tile(i2, /Formations/i) === A.tile(i0, /Formations/i), A.tilesLine(i2)],
  ], i2.shots)
} catch (e) { if (e !== 'done') row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
