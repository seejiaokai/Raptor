/* CHAT 9 — THE TRACKER'S WALK (8 Nov 26): D1790, D1791, D1792 (c). Scenarios S1–S34 of
   docs/superpowers/briefs/2026-11-08-chat9-tracker-scenarios.md. Helpers: trk-chat9-lib.mjs.
   From raptor-port/:  HP_URL=http://localhost:4297 [ONLY=s01,s02] node scripts/handpass/trk-chat9-walk.mjs
   c9walk v1 — part A: the slide (S1–S15). Parts B, C are imported below. */
import * as L from './trk-chat9-lib.mjs'
const { scn, ok, note, row, mkWorld, closeW, geo, limitOf, r1, inter, pic, tapXY, land, closePop, setScroll, placeAt, pressTraced, traceStart, traceStop, analyse, fmtAn, checkW, wsay, undoState, sleep, PHONE, SIDE, PC, PCREAL, NARROW, SHORTPC, BIG, SHORT500, typeFind, finger, shownRow, keysTo } = L
console.log('c9walk v1')

/* the first-tap point on a phone is measured at the landing; the window "final centre" is its rest place */
async function slideCase(w, id, tag, { reopenAfter = true } = {}) {
  const u0 = await undoState(w.page); const errN = w.errors.length
  const g0 = await geo(w.page, id)
  const p1 = await pic(w, `${tag}-landed`)
  const r = await pressTraced(w, id)
  const c = await checkW(w, id, { undo: u0, errN, slid: r.an.slid })
  return { r, c, g0, u0, errN, p1 }
}

/* ---------------- S1 ---------------- */
await scn('s01', 'The ruled case on his iPhone size, with the frames', async () => {
  const w = await mkWorld({ size: PHONE, touch: true })
  const g = await land(w, 'ACG-09')
  const mid = (g.board.t + g.board.b) / 2
  ok('1 landed (D984)', g.ball.t >= 419 - 2 && g.ball.b <= 448 + 2, `ACG-09 centre ${r1(g.ball.y)} vs the chart box middle ${r1(mid)}; ball ${r1(g.ball.t)}–${r1(g.ball.b)} (notes: 419–448); scrollTop ${g.st}; found ring ${g.ball.found}`, await pic(w, 's01-landed'))
  const u0 = await undoState(w.page); const errN = w.errors.length
  await traceStart(w.page, 'ACG-09')
  await tapXY(w, g.ball.x, g.ball.y); await sleep(60)
  const pMid = await pic(w, 's01-midslide'); await sleep(40)
  const pT = await pic(w, 's01-tap100'); await sleep(1400)
  const rows = await traceStop(w.page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, errN, slid: an.slid })
  await pic(w, 's01-open')
  ok('2-3 slide + window (W1–W8)', c.fails.length === 0 && an.slid && an.steps >= 6 && an.back === 0 && an.shownDuring === 0 && an.moved === 0 && an.unseenPressable === 0, fmtAn(an) + ' | ' + wsay(c), 's01-landed,s01-midslide,s01-tap100,s01-open')
  /* W4 pixels mid-slide: count the window's own background colour in its final box in the mid-slide picture */
  const frame = rows.find(r => r.st !== rows[0].st)
  note('W4 pixels', `the mid-slide picture (taken ~60ms after the tap) is s01-midslide; frame trace: first scroll change at ${an.firstT}ms, chart rested at ${an.rest}ms, window first shown ${an.shownT}ms. Window rect on the trace's first shown frame ${JSON.stringify(rows.find(shownRow) && rows.find(shownRow).pr)}`)
  note('Q1 the slide', `slid ${an.slideLen}px (scrollTop ${rows[0].st}→${rows[rows.length - 1].st}); ACG-09 top ${an.ballTop0} → ${an.ballTop1}, window ${r1(c.g.pop.t)}–${r1(c.g.pop.b)}; drawing: ACG-09 187–216, window 214–643 (slid 232)`)
  const dr = { ballT: 187, ballB: 216, popT: 214, popB: 643 }
  const diffs = []
  if (Math.abs(c.g.ball.t - dr.ballT) > 2) diffs.push(`ball top ${r1(c.g.ball.t)} vs ${dr.ballT}`)
  if (Math.abs(c.g.ball.b - dr.ballB) > 2) diffs.push(`ball foot ${r1(c.g.ball.b)} vs ${dr.ballB}`)
  if (Math.abs(c.g.pop.t - dr.popT) > 2) diffs.push(`window top ${r1(c.g.pop.t)} vs ${dr.popT} (drawn 2px over the ball; built 4px under it)`)
  if (Math.abs(c.g.pop.b - dr.popB) > 2) diffs.push(`window foot ${r1(c.g.pop.b)} vs ${dr.popB}`)
  note('4 beside the drawing', diffs.length ? 'differences over 2px: ' + diffs.join('; ') : 'no difference over 2px (ball, window top and foot)')
  /* 5 reachable */
  const hits = await w.page.evaluate(() => { const pe = document.getElementById('pop'); const out = {}; for (const b of pe.querySelectorAll('button')) { const r = b.getBoundingClientRect(); if (r.width < 2) continue; const h = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); out[(b.textContent.trim() || b.id || b.className).slice(0, 18)] = !!h && (h === b || b.contains(h)) } return out })
  ok('5 every control found at its centre', Object.values(hits).length > 5 && Object.values(hits).every(Boolean), JSON.stringify(hits))
  const stOpen = (await geo(w.page)).st
  await closePop(w); const pC = await pic(w, 's01-closed')
  const e = []; const t0 = Date.now(); let held = true; while (Date.now() - t0 < 1000) { const s = (await geo(w.page)).st; if (Math.abs(s - stOpen) > 1) held = false; await sleep(200) }
  ok('6 Close; W7 holds 1s', held && !((await geo(w.page)).pop && (await geo(w.page)).pop.shown),`scrollTop ${stOpen} → ${(await geo(w.page)).st}`, 's01-closed')
  const r2 = await pressTraced(w, 'ACG-09'); const c2 = await checkW(w, 'ACG-09', { slid: false })
  await pic(w, 's01-reopen')
  ok('7 tap again (now high): opens, no slide', !r2.an.slid && c2.fails.length === 0, fmtAn(r2.an) + ' | ' + wsay(c2), 's01-reopen')
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S2 ---------------- */
await scn('s02', 'Where the window goes, all down the chart', async () => {
  const w = await mkWorld({ size: PHONE, touch: true })
  let g = await land(w, 'ACG-09'); const L0 = limitOf(g)
  /* a real finger drag of the chart: assert it moves */
  const s0 = g.st; await L.finger(w, 200, 600, 0, -120); const g1 = await geo(w.page)
  ok('1 a real finger drag moves the chart', g1.st !== s0, `scrollTop ${s0} → ${g1.st}`)
  const table = []
  const ys = []; for (let y = Math.ceil(L0 + 20); y <= 840; y += 40) ys.push(y)
  for (const y of ys) {
    g = await placeAt(w, 'ACG-09', y); if (Math.abs(g.ball.y - y) > 3) { table.push(`${y}: could not place (${r1(g.ball.y)})`); continue }
    const c0 = Math.round(g.ball.y)
    const r = await pressTraced(w, 'ACG-09', { wait: 1400 }); const c = await checkW(w, 'ACG-09', { slid: r.an.slid })
    table.push({ y: c0, cls: r.an.slid ? 'SLIDE' : 'NO-SLIDE', slide: r.an.slideLen, popT: c.g.pop && r1(c.g.pop.t), popB: c.g.pop && r1(c.g.pop.b), ballTopAfter: r1(c.g.ball.t), fails: c.fails.join(';'), margin: c.g.pop && r1(c.g.vh - c.g.pop.b) })
    await closePop(w)
  }
  const bad = table.filter(t => t.fails)
  const placed = table.filter(t => typeof t === 'object'); const fitsRule = placed.every(t => (t.cls === 'NO-SLIDE') === (t.popB <= 841.5 && t.popT >= 0 && t.cls === 'NO-SLIDE'))
  ok('2-3 table of places', bad.length === 0 && placed.length >= 10 && placed.some(t => t.cls === 'NO-SLIDE') && placed.some(t => t.cls === 'SLIDE') && placed.filter(t => t.cls === 'NO-SLIDE').every(t => t.popB <= 841.5), `(places below centre 772 cannot be reached: the chart's top ends there) ` +table.map(t => typeof t === 'string' ? t : `y${t.y}:${t.cls}${t.slide ? '(' + t.slide + ')' : ''} win ${t.popT}–${t.popB} ball→${t.ballTopAfter}${t.fails ? ' FAIL ' + t.fails : ''}`).join(' | '))
  /* halve to 2px: the last place the window fits below, first where it does not */
  let lo = L0 + 20, hi = 840, seq = 0
  const slides = async y => { const gg = await placeAt(w, 'ACG-09', y); const r = await pressTraced(w, 'ACG-09', { wait: 1300 }); await closePop(w); return r.an.slid }
  if (!(await slides(lo)) && (await slides(hi))) { while (hi - lo > 2 && seq++ < 9) { const m = (lo + hi) / 2; if (await slides(m)) hi = m; else lo = m } }
  note('threshold', `no slide at centre ${r1(lo)}, slide at ${r1(hi)} (a 2px bracket where the window stops fitting below)`)
  /* 4 half under the tabs */
  g = await placeAt(w, 'ACG-09', L0)
  const gg = await geo(w.page); const visible = gg.ball.b - L0
  const pt = Math.max(gg.ball.y, L0 + 4)
  const u0 = await undoState(w.page)
  await pic(w, 's02-halfhidden-before')
  await tapXY(w, gg.ball.x, (L0 + gg.ball.b) / 2); await sleep(1400)
  note('4 premise', `ACG-09's centre placed at the limit ${r1(L0)}: ball ${r1(gg.ball.t)}–${r1(gg.ball.b)}`)
  const c = await checkW(w, 'ACG-09', { slid: false }); await pic(w, 's02-halfhidden')
  note('4 event with its top under the tabs (A7)', `ball ${r1(gg.ball.t)}–${r1(gg.ball.b)} with limit ${r1(L0)}: ${r1(visible)}px of ${r1(gg.ball.b - gg.ball.t)} show; ${c.g.pop && c.g.pop.shown ? 'window opened: ' + wsay(c) : 'no window'}; slid ${c.g.st !== gg.st}`, 's02-halfhidden-before,s02-halfhidden')
  await closeW(w)
})

/* ---------------- S3 ---------------- */
await scn('s03', "The chart's end: option B, and part of a slide", async () => {
  for (const [name, size, touch] of [['phone', PHONE, true], ['pc', PC, false]]) {
    const w = await mkWorld({ size, touch })
    await w.page.evaluate(() => { const b = document.getElementById('board'); b.scrollTop = 1e6 }); await sleep(500)
    const g = await geo(w.page, null); const st = g.st
    /* the lowest event: the ball with the greatest bottom */
    const low = await w.page.evaluate(() => { const bs = [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, r: x.getBoundingClientRect() })); bs.sort((a, b) => b.r.bottom - a.r.bottom); return bs.slice(0, 6).map(b => ({ id: b.id, t: Math.round(b.r.top), b: Math.round(b.r.bottom), x: Math.round((b.r.left + b.r.right) / 2) })) })
    note(name + ' 1 end', `scrollTop ${st} of ${g.sh - g.ch} max; lowest events ${JSON.stringify(low)}`)
    const id = low[0].id; const gb = await geo(w.page, id); const u0 = await undoState(w.page)
    await pic(w, `s03-${name}-end-before`)
    const r = await pressTraced(w, id, { wait: 1500 }); const c = await checkW(w, id, { undo: u0, slid: r.an.slid })
    await pic(w, `s03-${name}-B`)
    const p = c.g.pop
    ok(name + ' 2 option B', !r.an.slid && Math.abs(c.g.st - st) <= 1 && p && p.shown && c.fails.length === 0, `${fmtAn(r.an)} | ${wsay(c)} | scrollTop ${st}→${c.g.st}; window ${p && r1(p.t)}–${p && r1(p.b)}, event ${r1(c.g.ball.t)}–${r1(c.g.ball.b)}, limit ${r1(c.L)}`, `s03-${name}-B`)
    if (p && p.shown) {
      /* the window scrolls inside itself; scrolling it past its end does not move the chart */
      const sc0 = await w.page.evaluate(() => { const pe = document.getElementById('pop'); return { st: pe.scrollTop, sh: pe.scrollHeight, ch: pe.clientHeight } })
      if (touch) { const cx = (p.l + p.r) / 2; await finger(w, cx, p.b - 30, 0, -140); } else { await w.page.mouse.move((p.l + p.r) / 2, (p.t + p.b) / 2); await w.page.mouse.wheel(0, 400); await sleep(400); await w.page.mouse.wheel(0, 400); await sleep(500) }
      const after = await w.page.evaluate(() => { const pe = document.getElementById('pop'); return { st: pe.scrollTop, bd: document.getElementById('board').scrollTop } })
      await pic(w, `s03-${name}-inner-scrolled`)
      ok(name + ' 2b inner scroll, chart holds', sc0.sh > sc0.ch ? (after.st > sc0.st && Math.abs(after.bd - st) <= 1) : null, `window scrollTop ${sc0.st}→${after.st} (content ${sc0.sh} in ${sc0.ch}); chart scrollTop ${st}→${after.bd}${sc0.sh <= sc0.ch ? ' (window does not overflow here)' : ''}`, `s03-${name}-inner-scrolled`)
      await closePop(w)
    }
    if (name === 'phone') {
      /* 3: walk up the last screenful's events */
      const ids = (await w.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, b: x.getBoundingClientRect().bottom })).sort((a, b) => b.b - a.b).map(x => x.id))).slice(0, 14)
      const seen = []
      for (const i of ids.slice(1)) {
        await setScroll(w, 1e6); const g2 = await geo(w.page, i); if (!g2.ball || g2.ball.t < limitOf(g2) || g2.ball.b > g2.vh) { seen.push(i + ':offscreen'); continue }
        const st1 = g2.st; const rr = await pressTraced(w, i, { wait: 1300 }); const cc = await checkW(w, i, { slid: rr.an.slid })
        seen.push(`${i}:${rr.an.slid ? 'SLIDE ' + rr.an.slideLen : (Math.abs(cc.g.st - st1) <= 1 ? 'B/NO-SLIDE' : '?')}${cc.fails.length ? ' FAIL ' + cc.fails.join(';') : ''}`)
        await closePop(w)
      }
      const fl = seen.filter(s => s.includes('FAIL'))
      ok('3 the last screenful, event by event', fl.length === 0, seen.join(' | '))
      /* at the usual zoom the chart ends with room below its last row, so B cannot arise: zoom in to bring the lowest rows low on the screen */
      for (let k = 0; k < 4; k++) { await w.page.locator('#fzIn').tap(); await sleep(350) }
      await setScroll(w, 1e6); await sleep(500)
      const zs = await w.page.evaluate(() => document.getElementById('fzPct').textContent)
      const ids2 = (await w.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, b: x.getBoundingClientRect().bottom, t: x.getBoundingClientRect().top })).filter(x => x.b < innerHeight && x.t > 160).sort((a, b) => b.b - a.b).map(x => x.id))).slice(0, 8)
      const seenZ = []; let shot = 0
      for (const i of ids2) {
        await setScroll(w, 1e6); const g2 = await geo(w.page, i); if (!g2.ball || g2.ball.t < limitOf(g2) || g2.ball.b > g2.vh) { seenZ.push(i + ':offscreen'); continue }
        const st1 = g2.st; const rr = await pressTraced(w, i, { wait: 1400 }); const cc = await checkW(w, i, { slid: rr.an.slid })
        const cls = rr.an.slid ? 'SLIDE ' + rr.an.slideLen + (cc.g.st >= cc.g.sh - cc.g.ch - 1 ? ' (to the chart end)' : '') : (cc.g.pop && cc.g.pop.t < cc.g.ball.t ? 'ABOVE' : 'B/NO-SLIDE')
        seenZ.push(`${i}@${Math.round(g2.ball.y)}:${cls} win ${cc.g.pop ? r1(cc.g.pop.t) + '–' + r1(cc.g.pop.b) + (cc.g.pop.scrolls ? ' scrolls ' + cc.g.pop.sh + '/' + cc.g.pop.ch : '') : '-'}${cc.fails.length ? ' FAIL ' + cc.fails.join(';') : ''}`)
        if (shot < 3 && (cls !== 'B/NO-SLIDE' || cc.g.pop.scrolls)) { await pic(w, `s03-phone-zoomed-${i.replace(/[^A-Za-z0-9]/g, '')}`); shot++ }
        await closePop(w)
      }
      const flz = seenZ.filter(s => s.includes('FAIL'))
      ok('3b zoomed in ' + zs + ', the lowest events (Q2: part of a slide, B)', flz.length === 0 && seenZ.length >= 1, 'at no zoom does the chart end low enough on a phone for B to arise: it ends with room below its last row. ' + seenZ.join(' | '))
      await w.page.locator('#fzReset').tap(); await sleep(400)
      /* zoomed right out the chart has the least scroll room: the best chance of an event short of room to slide */
      for (let k = 0; k < 8; k++) { await w.page.locator('#fzOut').tap(); await sleep(250) }
      await setScroll(w, 1e6); await sleep(400)
      const zo = await w.page.evaluate(() => document.getElementById('fzPct').textContent); const gz0 = await geo(w.page, null)
      const idsO = (await w.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, b: x.getBoundingClientRect().bottom, t: x.getBoundingClientRect().top })).filter(x => x.b < innerHeight && x.t > 160).sort((a, b) => b.b - a.b).map(x => x.id))).slice(0, 5)
      const seenO = []
      for (const i of idsO) {
        await setScroll(w, 1e6); const g2 = await geo(w.page, i); const st1 = g2.st; const rr = await pressTraced(w, i, { wait: 1400 }); const cc = await checkW(w, i, { slid: rr.an.slid })
        const room = cc.g.sh - cc.g.ch - st1
        seenO.push(`${i}@${Math.round(g2.ball.y)} room ${Math.round(room)}: ${rr.an.slid ? 'SLIDE ' + rr.an.slideLen : (cc.g.pop && cc.g.pop.t < cc.g.ball.t ? 'ABOVE' : 'NO-SLIDE')} win ${cc.g.pop ? r1(cc.g.pop.t) + '–' + r1(cc.g.pop.b) : '-'}${cc.fails.length ? ' FAIL ' + cc.fails.join(';') : ''}`)
        await closePop(w)
      }
      ok('3c zoomed right out (' + zo + '): scroll room ' + Math.round(gz0.sh - gz0.ch) + 'px', !seenO.some(s => s.includes('FAIL')) && seenO.length > 0, seenO.join(' | '), await pic(w, 's03-phone-zoomed-out'))
    }
    ok(name + ' errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
    await closeW(w)
  }
})

/* ---------------- S4 ---------------- */
await scn('s04', "The chart's top", async () => {
  for (const [name, size, touch] of [['phone', PHONE, true], ['pc', PC, false]]) {
    const w = await mkWorld({ size, touch })
    await setScroll(w, 0)
    const top = await w.page.evaluate(() => { const bs = [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, t: x.getBoundingClientRect().top, l: x.getBoundingClientRect().left })).filter(b => b.t > 0).sort((a, b) => a.t - b.t); return bs[0].id })
    const g = await geo(w.page, top); const u0 = await undoState(w.page)
    await pic(w, `s04-${name}-before`)
    const r = await pressTraced(w, top, { wait: 1300 }); const c = await checkW(w, top, { undo: u0, slid: r.an.slid }); await pic(w, `s04-${name}-top`)
    const popH = c.g.pop ? c.g.pop.b - c.g.pop.t : 0
    const fits = g.ball.b + 4 + popH <= g.board.b + 0.5
    ok(name + ' highest event ' + top + ' (slides only if its window would not fit below)', c.fails.length === 0 && r.an.slid === !fits, `scrollTop 0, event at ${r1(g.ball.t)}–${r1(g.ball.b)} (the chart's own first row sits low on a phone: premise "no slide at the top" does not hold for it); window ${r1(popH)} tall, fits below: ${fits}; ${fmtAn(r.an)} | ${wsay(c)}`, `s04-${name}-before,s04-${name}-top`)
    await closeW(w)
  }
})

await import('./trk-chat9-walk-b.mjs')
if (process.env.PARTC !== '0') await import('./trk-chat9-walk-c.mjs').catch(e => { if (!/Cannot find module/.test(e.message)) throw e })
if (process.env.PARTD !== '0') await import('./trk-chat9-walk-d.mjs').catch(e => { if (!/Cannot find module/.test(e.message)) throw e })
if (process.env.PARTE !== '0') await import('./trk-chat9-walk-e.mjs').catch(e => { if (!/Cannot find module/.test(e.message)) throw e })
await L.closeAll()
console.log('done')
