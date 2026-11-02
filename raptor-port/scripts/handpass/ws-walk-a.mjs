/* walker A of the week-swipe bug check (3 Nov 26) — version 2. Scenarios A1–A12. Env: ENGINE=chromium|webkit, ONLY=A1,A5 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { openPhone, goPage, weekId, slOf, park, settle, crossed, startSampler, stopSampler, startCast, stopCast, saveFrame, fingerCdp, fingerPage, path, analyse, sleep, now, OUT } from './ws-walk-a-lib.mjs'
console.log('ws-walk-a v2')
const ENGINE = process.env.ENGINE || 'chromium'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const BASE_WEEK = '13/07/2026'
const RES = `${OUT}/results-${ENGINE}.json`
const results = existsSync(RES) && ONLY.length ? JSON.parse(readFileSync(RES, 'utf8')) : {}
const save = () => writeFileSync(RES, JSON.stringify(results, null, 1))
const shiftWeek = (id, days) => { const [d, m, y] = id.split('/').map(Number); const t = new Date(Date.UTC(y, m - 1, d + days)); return `${String(t.getUTCDate()).padStart(2, '0')}/${String(t.getUTCMonth() + 1).padStart(2, '0')}/${t.getUTCFullYear()}` }

const finger = (s, pts, rest) => s.engine === 'chromium' ? fingerCdp(s.cdp, pts, rest) : fingerPage(s.page, pts, rest)

async function resetWeek(s, sel, week) {
  await s.page.evaluate(w => window.loadWeek(w), week)
  await s.page.waitForFunction(w => window.CURWEEK === w, week)
  await s.page.waitForTimeout(600)
  await settle(s.page, sel)
}
async function finalState(page, sel) {
  return page.evaluate(sel => {
    const e = document.querySelector(sel), ds = [...e.querySelectorAll('.day:not(.peek)')]
    return { week: window.CURWEEK, sl: Math.round(e.scrollLeft * 10) / 10, max: e.scrollWidth - e.clientWidth, d0: Math.round(ds[0].getBoundingClientRect().left * 10) / 10, d6: Math.round(ds[6].getBoundingClientRect().left * 10) / 10, scrollY: Math.round(scrollY), copies: [...document.body.children].filter(c => c.style.position === 'fixed' && c.classList.contains('week')).length }
  }, sel)
}

/* choose pictures out of the screencast: the last frame before the lift, up to three inside the copies-up window, the last */
function chooseFrames(cast, lift, tr, an) {
  const lifts = tr.marks.filter(m => m.ev === 'touchend' || m.ev === 'touchcancel')
  const pageLift = lifts.length ? lifts[lifts.length - 1].t : null
  const off = pageLift != null ? lift - pageLift : 0
  const F = tr.frames
  const upI = F.findIndex(f => f.copies.length), downI = F.map(f => f.copies.length > 0).lastIndexOf(true)
  const pre = [...cast].filter(f => f.at <= lift).pop() || null
  let mids = []
  if (upI >= 0) {
    const a = F[upI].t + off, b = F[downI].t + off
    const inW = cast.filter(f => f.at >= a - 20 && f.at <= b + 40)
    const pick = n => inW.length <= n ? inW : Array.from({ length: n }, (_, i) => inW[Math.min(inW.length - 1, Math.round((i + 0.5) * inW.length / n))])
    mids = pick(3)
    return { pre, first: inW[0] || null, mids, post: cast[cast.length - 1], inWindow: inW.length, total: cast.length, win: [Math.round(a - lift), Math.round(b - lift)] }
  }
  return { pre, mids: [], post: cast[cast.length - 1], inWindow: 0, total: cast.length, win: null }
}

/* one cross scenario, once. mode 'clean' = trace only; 'pics' = pictures too. */
async function runOnce(s, def, mode) {
  const sel = def.sel || '#eWeek'
  const p = s.page
  await resetWeek(s, sel, def.week || BASE_WEEK)
  if (def.setup) await def.setup(s, sel)
  await p.evaluate(() => scrollTo(0, 0))
  if (def.pre) await def.pre(s, sel)
  await park(p, sel, def.day)
  const from = await weekId(p), slStart = await slOf(p, sel), problems0 = s.problems.length
  const yStart = await p.evaluate(() => Math.round(scrollY))
  await startSampler(p, sel)
  const cast = mode === 'pics' && s.cdp ? await startCast(s.cdp) : null
  const shots = []
  if (mode === 'pics' && !s.cdp) { const n = `${def.id}${def.suffix || ""}-${ENGINE}-0-before`; await p.screenshot({ path: `${OUT}/${n}.png`, animations: 'allow' }); shots.push(n + '.png') }
  const t0 = now()
  const logs = []
  for (const g of def.gestures) {
    if (g.wait) await sleep(g.wait)
    if (g.between) await g.between(s, sel)
    logs.push(await finger(s, g.pts, g.rest ?? 0))
    if (g.afterLift) await g.afterLift(s, sel)
  }
  const lift = s.cdp ? logs[logs.length - 1].lift : null
  if (mode === 'pics' && !s.cdp) for (let k = 1; k <= 3; k++) { const n = `${def.id}${def.suffix || ""}-${ENGINE}-${k}-slide`; await p.screenshot({ path: `${OUT}/${n}.png`, animations: 'allow' }); shots.push(n + '.png') }
  await sleep(def.expect === 'stay' || def.expect === 'inweek' ? 900 : 720)
  await crossed(p, from).catch(() => {})
  await sleep(300)
  const tr = await stopSampler(p)
  if (cast) await stopCast(s.cdp)
  const fin = await finalState(p, sel)
  if (mode === 'pics' && !s.cdp) { const n = `${def.id}${def.suffix || ""}-${ENGINE}-4-after`; await p.screenshot({ path: `${OUT}/${n}.png` }); shots.push(n + '.png') }
  const landDay = def.land
  const an = analyse(tr, landDay)
  let picNote = null
  if (cast) {
    const c = chooseFrames(cast, lift, tr, an)
    if (c.pre) shots.push(saveFrame(c.pre, `${def.id}${def.suffix || ""}-${ENGINE}-1-beforelift`))
    if (c.first) shots.push(saveFrame(c.first, `${def.id}${def.suffix || ""}-${ENGINE}-2-slide0-first`))
    c.mids.forEach((f, i) => shots.push(saveFrame(f, `${def.id}${def.suffix || ""}-${ENGINE}-2-slide${i + 1}`)))
    if (c.post) shots.push(saveFrame(c.post, `${def.id}${def.suffix || ""}-${ENGINE}-3-after`))
    picNote = { castFrames: c.total, inWindow: c.inWindow, windowMsAfterLift: c.win }
  }
  return { from, slStart, yStart, fin, an, tr, shots, picNote, logs: logs.map(l => ({ moves: l.moves.length, startToLiftMs: Math.round(l.lift - l.start) })), problems: s.problems.slice(problems0), spanMs: Math.round(now() - t0) }
}

function judge(def, r) {
  const notes = []
  let ok = true
  const f = r.fin, an = r.an
  const toExp = def.expect === 'prev' ? shiftWeek(r.from, -7) : def.expect === 'next' ? shiftWeek(r.from, 7) : r.from
  if (def.expect === 'prev' || def.expect === 'next') {
    if (f.week !== toExp) { ok = false; notes.push(`week is ${f.week}, expected ${toExp}`) }
    else {
      if (f.copies) { ok = false; notes.push('copies left on screen') }
      const landOK = def.land === 0 ? Math.abs(f.sl - 12) <= 2 && Math.abs(f.d0) <= 2 : Math.abs(f.sl - f.max) <= 2
      if (!landOK) { ok = false; notes.push(`landing off: sl ${f.sl} (max ${f.max}), Mon at ${f.d0}, Sun at ${f.d6}`) } else notes.push(`landed sl ${f.sl}, Mon ${f.d0}, Sun ${f.d6}`)
      if (an.up < 0) { ok = false; notes.push('no glide copies seen') }
      else {
        if (an.leaving.delta == null || Math.abs(an.leaving.delta) > 1.5) { ok = false; notes.push(`leaving copy first at ${an.leaving.copyFirstCard}, day stood at ${an.leaving.stoodCard} (Δ ${an.leaving.delta})`) }
        else notes.push(`leaving copy first ${an.leaving.copyFirstCard} vs day stood ${an.leaving.stoodCard} (Δ ${an.leaving.delta})`)
        if (an.arriving.delta == null || Math.abs(an.arriving.delta) > 1.5) { ok = false; notes.push(`arriving copy ended ${an.arriving.lastCopyCard}, real day ${an.arriving.firstLiveAfter} (Δ ${an.arriving.delta})`) }
        else notes.push(`arriving copy ended ${an.arriving.lastCopyCard} vs real day ${an.arriving.firstLiveAfter}/${an.arriving.settledLive} (Δ ${an.arriving.delta})`)
        const L = an.leavingSeries, A = an.arrivingSeries, B = an.liveBeforeCopies
        const badSeries = []
        for (const [nm, x] of [['leaving copy', L], ['arriving copy', A]]) {
          if (x.maxSpeedPxMs > 3.4) badSeries.push(nm + ' speed ' + x.maxSpeedPxMs + 'px/ms')
          if (x.accelSpikes.length) badSeries.push(nm + ' speeds up mid-slide ' + JSON.stringify(x.accelSpikes))
          if (x.reversals) badSeries.push(nm + ' goes backwards ' + x.reversals + ' times')
        }
        if (!def.skipLive && B.n > 1 && Math.abs(B.maxStep) > 30) badSeries.push('the day moved ' + B.maxStep + 'px in one frame before the copies')
        if (badSeries.length) { ok = false; notes.push('motion: ' + badSeries.join('; ')) }
        notes.push('leaving copy: ' + L.from + ' -> ' + L.to + ', max ' + L.maxSpeedPxMs + 'px/ms, biggest single step ' + L.maxStep + 'px (' + (L.maxStepAt ? L.maxStepAt.dt : '?') + 'ms); arriving copy: ' + A.from + ' -> ' + A.to + ', max ' + A.maxSpeedPxMs + 'px/ms, biggest step ' + A.maxStep + 'px; no step over 30px that is not the glide: ' + (badSeries.length ? 'NO' : 'yes'))
        if (an.arrivingParked) notes.push('arriving copy stood on screen at ' + an.arrivingParked.at + ' for ' + an.arrivingParked.frames + ' frames (' + an.arrivingParked.ms + 'ms) under the leaving one before it jumped to ' + an.arrivingParked.jumpsTo)
        if (def.second) { const st = r.tr.marks.filter(x => x.ev === 'touchstart'); const sl2 = st[1] ? st[1].sl : null; notes.push('second swipe began with the week at ' + sl2 + 'px (Monday rests at 12; settled-at-Monday would read 12)'); if (!(sl2 > 30)) { ok = false; notes.push('the second swipe began after the week had settled — not the case under test') } }
        notes.push('copies up ' + an.copiesUpMs + 'ms, first copy ' + an.liftToCopiesUpMs + 'ms after the lift')
      }
    }
  } else if (def.expect === 'stay') {
    if (f.week !== r.from) { ok = false; notes.push(`week changed to ${f.week}`) } else notes.push('week unchanged')
    if (an.up >= 0) { ok = false; notes.push('copies appeared') }
    const marks = r.tr.marks.map(m => m.ev).join(',')
    notes.push(`touch seen by the page: ${marks}`)
    notes.push(`page scrollY ${r.yStart} -> ${f.scrollY}`)
    if (def.needScroll && Math.abs(f.scrollY - r.yStart) < 50) { ok = false; notes.push('the day did not scroll') }
  } else if (def.expect === 'inweek') {
    if (f.week !== r.from) { ok = false; notes.push(`week changed to ${f.week}`) }
    if (an.up >= 0) { ok = false; notes.push('copies appeared') }
    notes.push(`sl ${r.slStart} -> ${f.sl}`)
  }
  return { ok, notes }
}

async function scenario(s, def) {
  if (ONLY.length && !ONLY.includes(def.id + (def.suffix || ""))) return
  console.log('--', def.id, ENGINE, def.title)
  const out = { id: def.id + (def.suffix || ""), engine: ENGINE, title: def.title, tries: [] }
  let clean = null
  for (let t = 1; t <= 3; t++) {
    try {
      clean = await runOnce(s, def, 'clean')
    } catch (e) { out.tries.push({ error: String(e).slice(0, 300) }); console.log('  error', String(e).slice(0, 200)); continue }
    const j = judge(def, clean)
    out.tries.push({ verdict: j.ok ? 'PASS' : 'FAIL', notes: j.notes, from: clean.from, fin: clean.fin, logs: clean.logs })
    console.log('  try', t, j.ok ? 'PASS' : 'FAIL', j.notes.join(' | '))
    if (j.ok) break
    if (def.noRetry) break
  }
  if (clean) {
    const j = judge(def, clean)
    out.verdict = j.ok ? 'PASS' : 'FAIL'; out.notes = j.notes; out.analysis = clean.an
    writeFileSync(`${OUT}/${def.id}${def.suffix || ""}-${ENGINE}-trace.json`, JSON.stringify({ id: def.id, engine: ENGINE, from: clean.from, final: clean.fin, analysis: clean.an, marks: clean.tr.marks, gesture: clean.logs, frames: clean.tr.frames }))
    out.trace = `${def.id}${def.suffix || ""}-${ENGINE}-trace.json`
    try {
      const pic = await runOnce(s, def, 'pics')
      const pj = judge(def, pic)
      out.pics = pic.shots; out.picRun = { verdict: pj.ok ? 'PASS' : 'FAIL', notes: pj.notes, picNote: pic.picNote }
      console.log('  pics run', pj.ok ? 'PASS' : 'FAIL', JSON.stringify(pic.picNote), pic.shots.join(' '))
    } catch (e) { out.picRun = { error: String(e).slice(0, 300) }; console.log('  pic error', String(e).slice(0, 200)) }
  } else { out.verdict = 'FAIL'; out.notes = ['every try raised an error'] }
  out.problems = clean ? clean.problems : []
  results[def.id + (def.suffix || '')] = out
  save()
}

/* ---------- the gestures ---------- */
const slowRight = path(100, 430, 250, 430, 10, 400)         // 150px over 400ms
const slowLeft = path(320, 430, 170, 430, 10, 400)
const flickRight = [[150, 430, 0], [180, 430, 16]]          // 30px, one move, lifted at once: about 65-80ms in all through this test browser (two moves leave ~34ms of rest before the lift — see ws-walk-a-flick.mjs)
const arc = [[100, 380, 0], [114, 381, 16], [128, 384, 32], [140, 392, 48], [150, 404, 64], [158, 418, 80], [164, 434, 96], [168, 448, 112], [170, 460, 128]]
const driftDown = [[200, 300, 0], [201, 340, 40], [202, 380, 80], [203, 420, 120], [205, 460, 160], [212, 490, 200], [220, 500, 240]]  // 20 across, 200 down
const shortSlow = path(150, 430, 184, 430, 10, 400)

/* WebKit: touches made inside the page drive no browser scroll, so the first swipe of A6 cannot move the week; at its lift the week is sent smoothly to Monday, as the browser would snap it */
const snapToMonday = async (s, sel) => { if (s.engine.startsWith("webkit")) await s.page.evaluate(async sel => { const w = document.querySelector(sel); const raf = () => new Promise(r => requestAnimationFrame(() => r(null))); w.style.scrollBehavior = "auto"; w.scrollLeft = 157; w.style.scrollBehavior = ""; await raf(); w.scrollTo({ left: 12, behavior: "smooth" }) }, sel) }
const defs = [
  { id: 'A1', title: 'Edit Schedule Mon 13 Jul -> slow right swipe (150px/400ms) -> Sun 12 Jul', day: 0, gestures: [{ pts: slowRight, rest: 90 }], expect: 'prev', land: 6 },
  { id: 'A2', title: 'quick short flick (30px/60ms) right off Monday -> Sunday', day: 0, gestures: [{ pts: flickRight, rest: 0 }], expect: 'prev', land: 6 },
  { id: 'A3', title: 'curling thumb (70 across, 80 down) off Monday -> crosses', day: 0, gestures: [{ pts: arc, rest: 60 }], expect: 'prev', land: 6 },
  { id: 'A4', title: 'mostly-vertical drag drifting sideways (20 across, 200 down) -> must NOT cross', day: 0, needScroll: true, setup: async (s) => { await s.page.evaluate(() => scrollTo(0, 400)); await sleep(300) }, pre: async (s) => { await s.page.evaluate(() => scrollTo(0, 400)); await sleep(300) }, gestures: [{ pts: driftDown, rest: 60 }], expect: 'stay', land: 6 },
  { id: 'A5', title: 'back: Sunday 12 Jul -> slow left swipe -> Monday 13 Jul', week: '06/07/2026', day: 6, gestures: [{ pts: slowLeft, rest: 90 }], expect: 'next', land: 0 },
  { id: 'A6', title: 'Tuesday 14 -> right swipe to Monday, second right swipe ~120ms after the first lifts -> Sunday 12 Jul', day: 1,
    gestures: [{ pts: path(60, 430, 320, 430, 8, 130), rest: 40, afterLift: snapToMonday }, { pts: path(80, 430, 230, 430, 6, 80), rest: 0 }], expect: 'prev', land: 6, skipLive: true, second: true },
  { id: 'A6', suffix: 'b', title: 'A6 again, second swipe begun ~120ms (page clock) after the first lifts (24 runs: ws-walk-a-twice.mjs)', day: 1, noRetry: true,
    gestures: [{ pts: path(60, 430, 320, 430, 8, 130), rest: 40, afterLift: snapToMonday }, { wait: 100, pts: path(80, 430, 230, 430, 6, 80), rest: 0 }], expect: 'prev', land: 6, skipLive: true },
  { id: 'A7', title: 'wave-dense Monday 20 Jul: cross begun ON a wave block, right -> Sunday 19 Jul', week: '20/07/2026', day: 0, gestures: [], expect: 'prev', land: 6, wave: true },
  { id: 'A8', title: 'slow drag stopping short (34px) then held 300ms -> must NOT cross', day: 0, gestures: [{ pts: shortSlow, rest: 300 }], expect: 'stay', land: 6 },
  { id: 'A9', title: 'inside the week: Wednesday -> Thursday, one day, no copies', day: 2, gestures: [{ pts: path(320, 430, 100, 430, 10, 400), rest: 90 }], expect: 'inweek', land: 3 },
]

/* A7 needs the touch to begin on a wave block: aim at the first wave block of Monday that is on screen */
const a7 = defs.find(d => d.id === 'A7')
a7.pre = async (s, sel) => {
  await s.page.evaluate(sel => { const g = document.querySelector(sel + ' .day:not(.peek) .go'); if (g) g.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sel)
  await sleep(500)
}
a7.gestures = []
Object.defineProperty(a7, 'gestures', { get() { return a7._g || [] }, set(v) { a7._g = v } })
a7.armOnWave = async (s, sel) => {
  const r = await s.page.evaluate(sel => { const g = document.querySelector(sel + ' .day:not(.peek) .go'); if (!g) return null; const b = g.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), w: Math.round(b.width), h: Math.round(b.height), sl: g.scrollLeft, sw: g.scrollWidth, cw: g.clientWidth } }, sel)
  return r
}

/* A10: View-only Sched, A1 and A5 again (its landing code is separate) */
defs.push({ id: 'A10', suffix: 'a', page: 'viewsched', sel: '#vWeek', title: 'View-only Sched Mon 13 Jul -> slow right swipe -> Sun 12 Jul', day: 0, gestures: [{ pts: slowRight, rest: 90 }], expect: 'prev', land: 6 })
defs.push({ id: 'A10', suffix: 'b', page: 'viewsched', sel: '#vWeek', title: 'View-only Sched Sun 12 Jul -> slow left swipe -> Mon 13 Jul', week: '06/07/2026', day: 6, gestures: [{ pts: path(320, 220, 170, 220, 10, 400), rest: 90 }], expect: 'next', land: 0 })

const tap = async (s, selector) => s.cdp ? s.page.locator(selector).first().tap() : s.page.locator(selector).first().click()

/* A11: the Scheduler Board on a phone — a sideways swipe must not change the week */
async function boardScenario(s) {
  if (ONLY.length && !ONLY.includes('A11')) return
  console.log('-- A11', ENGINE, 'Scheduler Board: sideways swipes must not change the week')
  const p = s.page
  const out = { id: 'A11', engine: ENGINE, title: 'the Scheduler Board on the phone: a sideways swipe does not change the week (the board steps by its arrows)', checks: [], pics: [] }
  const readBoard = () => p.evaluate(() => ({ week: window.CURWEEK, open: !!document.querySelector('#schedBoard') && getComputedStyle(document.getElementById('schedBoard')).display !== 'none' && !document.getElementById('schedBoard').hidden, title: ((document.querySelector('#schedBoard .sb-title') || {}).textContent || '').trim(), copies: [...document.body.children].filter(c => c.style.position === 'fixed' && c.classList.contains('week')).length, wsl: Math.round(document.getElementById('eWeek').scrollLeft) }))
  let ok = true
  for (const [label, day, week, swipes] of [
    ['monday', 0, '13/07/2026', [['right slow', slowRight], ['right flick', flickRight], ['right at y=250', path(100, 250, 250, 250, 10, 400)], ['right at y=650', path(100, 650, 250, 650, 10, 400)]]],
    ['sunday', 6, '13/07/2026', [['left slow', slowLeft], ['left flick', [[250, 430, 0], [200, 430, 16]]], ['left at y=250', path(320, 250, 170, 250, 10, 400)], ['left at y=650', path(320, 650, 170, 650, 10, 400)]]],
  ]) {
    await resetWeek(s, '#eWeek', week)
    await p.evaluate(() => scrollTo(0, 0))
    await park(p, '#eWeek', day)
    await tap(s, `#eWeek [data-sbday="${day}"]`)
    await p.waitForSelector('#schedBoard', { state: 'visible', timeout: 5000 })
    await p.waitForTimeout(800)
    const b0 = await readBoard()
    const n0 = `A11-${ENGINE}-${label}-1-board`; await p.screenshot({ path: `${OUT}/${n0}.png` }); out.pics.push(n0 + '.png')
    out.checks.push({ label, step: 'board open', state: b0 })
    console.log('   ', label, 'board', JSON.stringify(b0))
    if (!b0.open) { ok = false; out.checks.push({ label, note: 'the board did not open' }); continue }
    await startSampler(p, '#eWeek')
    for (const [nm, pts] of swipes) {
      await finger(s, pts, nm.includes('flick') ? 0 : 90)
      await sleep(900)
      const b = await readBoard()
      const bad = b.week !== b0.week || b.copies || !b.open || b.title !== b0.title
      if (bad) ok = false
      out.checks.push({ label, swipe: nm, state: b, same: !bad })
      console.log('   ', label, nm, bad ? 'CHANGED' : 'same', JSON.stringify(b))
    }
    const tr = await stopSampler(p)
    const seen = tr.marks.filter(m => m.ev === 'touchstart').length, ends = tr.marks.filter(m => m.ev === 'touchend').length
    const copiesEver = tr.frames.some(f => f.copies.length)
    out.checks.push({ label, step: 'touches seen by the page', starts: seen, ends, copiesEverSeen: copiesEver })
    if (copiesEver) ok = false
    const n1 = `A11-${ENGINE}-${label}-2-after-swipes`; await p.screenshot({ path: `${OUT}/${n1}.png` }); out.pics.push(n1 + '.png')
    /* the positive control: the board's own arrow steps the day */
    const arrow = label === 'monday' ? '#sbNextDay' : '#sbPrevDay'
    const before = await readBoard()
    await tap(s, arrow).catch(e => out.checks.push({ label, note: 'arrow ' + arrow + ' not pressed: ' + String(e).slice(0, 100) }))
    await sleep(900)
    const after = await readBoard()
    out.checks.push({ label, step: 'arrow ' + arrow, before: before.title, after: after.title, week: after.week })
    console.log('   ', label, 'arrow', arrow, before.title, '->', after.title, after.week)
    const n2 = `A11-${ENGINE}-${label}-3-after-arrow`; await p.screenshot({ path: `${OUT}/${n2}.png` }); out.pics.push(n2 + '.png')
    await p.keyboard.press('Escape'); await sleep(500)
  }
  out.verdict = ok ? 'PASS' : 'FAIL'
  results.A11 = out; save()
  console.log('  A11', out.verdict)
}

/* A12: the phone on its side (844 x 390) */
async function landscape(W = 844, H = 390, id = "A12") {
  if (ONLY.length && !ONLY.some(x => x.startsWith(id))) return
  const s2 = await openPhone(ENGINE, { width: W, height: H })
  try {
    await goPage(s2.page, 'editsched')
    const info = await s2.page.evaluate(() => { const e = document.getElementById('eWeek'); const ds = [...e.querySelectorAll('.day:not(.peek)')]; const wp = document.getElementById('weekPrev'); return { iw: innerWidth, ih: innerHeight, dayW: Math.round(ds[0].getBoundingClientRect().width), step: Math.round(ds[1].getBoundingClientRect().left - ds[0].getBoundingClientRect().left), cw: e.clientWidth, sl: Math.round(e.scrollLeft), weekPrevDisplay: wp ? getComputedStyle(wp).display : 'none present' } })
    console.log('landscape layout', JSON.stringify(info))
    const L = [
      { id, suffix: 'a', title: 'phone on its side ' + W + ' x ' + H + ': Monday 13 Jul -> swipe right -> Sunday 12 Jul', day: 0, gestures: [{ pts: path(250, 250, 400, 250, 10, 400), rest: 90 }], expect: 'prev', land: 6 },
      { id, suffix: 'b', title: 'phone on its side ' + W + ' x ' + H + ': Sunday 12 Jul -> swipe left -> Monday 13 Jul', week: '06/07/2026', day: 6, gestures: [{ pts: path(600, 250, 450, 250, 10, 400), rest: 90 }], expect: 'next', land: 0 },
    ]
    for (const d of L) await scenario(s2, d)
    results[id + '-layout'] = info
    results['problems-landscape-' + id + '-' + ENGINE] = s2.problems
    save()
  } finally { await s2.browser.close() }
}

const s = await openPhone(ENGINE)
let cur = ''
try {
  await goPage(s.page, 'editsched'); cur = 'editsched'
  console.log('week', await weekId(s.page))
  for (const def of defs) {
    const want = def.page || 'editsched'
    if (want !== cur) { await goPage(s.page, want); cur = want }
    if (def.id === 'A7') {
      if (ONLY.length && !ONLY.includes('A7')) continue
      await resetWeek(s, '#eWeek', def.week)
      await s.page.evaluate(() => scrollTo(0, 0))
      await park(s.page, '#eWeek', 0)
      await def.pre(s, '#eWeek')
      const r = await def.armOnWave(s, '#eWeek')
      console.log('wave block', JSON.stringify(r))
      if (!r) { results.A7 = { id: 'A7', engine: ENGINE, verdict: 'FAIL', notes: ['no wave block found on Monday 20 Jul'] }; continue }
      def.gestures = [{ pts: path(r.x - 60, r.y, r.x + 90, r.y, 10, 400), rest: 90 }]
      def.waveBlock = r
    }
    await scenario(s, def)
  }
  if (cur !== 'editsched') { await goPage(s.page, 'editsched'); cur = 'editsched' }
  await boardScenario(s)
  console.log('problems overall', JSON.stringify(s.problems))
  results['problems-' + ENGINE] = s.problems
  save()
} finally { await s.browser.close() }
await landscape()
await landscape(812, 375, 'A12x')
