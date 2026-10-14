/* [DRAG-EDGE-SCROLL-ELSEWHERE], the night of 15 Oct 26 (owner D897, D898, D899): a drag held at the edge of a view
   that does not scroll.
     M — the Inputs month: a run of days drawn across a month's end (held at the month's right side, then the left); a
         run carried THROUGH the band without holding; an input's bar carried into the next month and dropped, then undone;
         and the SANS calendar, whose pick is not given the turn (the ruling names the Inputs month).
     T — the Tracker, Edit chart layout: a ball carried to the canvas's right edge (the canvas pans, the ball stays under
         the pointer), dropped, then undone; a ball carried to the foot; a selected group carried to the edge.
   By REAL input — a mouse on the desktop, Chromium's own touch events (CDP) on a phone. Assertions of the RIGHT behaviour
   (a PASS means correct), so a re-run is the re-walk.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-edge-turn node scripts/handpass/edgeturn-walk.mjs [desk|phone] */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }
const SIZES = process.argv[2] ? [process.argv[2]] : ['desk', 'phone']

/* ---- one pointer, the way a person moves it: down, travel in steps, hold, travel, up ---- */
async function hand(w) {
  const p = w.page
  if (!w.phone) {
    let at = { x: 0, y: 0 }
    return {
      down: async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); at = { x, y }; await L.sleep(80) },
      to: async (x, y, steps = 12) => { for (let i = 1; i <= steps; i++) { await p.mouse.move(at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(25) } at = { x, y } },
      up: async () => { await p.mouse.up(); await L.sleep(350) },
    }
  }
  const cdp = await w.ctx.newCDPSession(p)
  let at = { x: 0, y: 0 }
  const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  return {
    down: async (x, y) => { await t('touchStart', x, y); at = { x, y }; await L.sleep(80) },
    to: async (x, y, steps = 12) => { for (let i = 1; i <= steps; i++) { await t('touchMove', at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(25) } at = { x, y } },
    up: async () => { await t('touchEnd'); await L.sleep(350) },
  }
}

/* ---- the Inputs month ---- */
const monthName = page => page.evaluate(() => document.querySelector('#inpCal .ic-mon')?.getAttribute('aria-label') || '')
/** the screen point of a date — low in its box, below the bars, where a press is the date's own */
const dateAt = (page, iso) => page.evaluate(d => {
  const c = document.querySelector(`#inpCal [data-icday="${d}"]`); if (!c) return null
  const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.bottom - 5 }
}, iso)
const gridBox = page => page.evaluate(() => { const r = document.querySelector('#inpCal [data-testid="ib-grid"]').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom } })
const picked = page => page.evaluate(() => [...document.querySelectorAll('#inpCal .ib-day.is-picked')].map(e => e.getAttribute('data-icday')))
/** the title of the input's own window, if one is up ("New input · Oct 28 → Nov 3"), or of the OIL question */
const dialogText = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .win-ttl, [data-testid^="win-oil"] .win-ttl, .oilask')].filter(e => e.offsetParent !== null).map(e => e.textContent).join(' | ').replace(/\s+/g, ' ').slice(0, 300))
const shut = async page => { for (let i = 0; i < 2 && await dialogText(page); i++) { await page.keyboard.press('Escape'); await L.sleep(350) } }

async function monthWalk(w, size) {
  const p = w.page
  await L.go(w, 'inputs'); await p.waitForSelector('#inpCal [data-icday]', { timeout: 20000 }); await L.sleep(500)
  const m0 = await monthName(p)
  const H = await hand(w)
  const g = await gridBox(p)
  const hold = w.phone ? 520 : 0                      // a finger's pick takes a hold first (calpick PICK_HOLD 400)

  /* each section runs on its own, so a step that fails (as a break test makes it) never hides the next */
  try {
  /* M1 — a run drawn from 28 Oct to the month's right side, held: the month turns; the run goes on; let go on 3 Nov */
  const a = await dateAt(p, '2026-10-28')
  if (!a) { ok(size, 'M1: 28 Oct is on the month shown', false, m0); return }
  await H.down(a.x, a.y); await L.sleep(hold)
  await H.to(g.r - 4, a.y)
  await L.sleep(1000)                                  // one turn: past the hold (600) and its settle (280), short of the repeat (1600)
  const m1 = await monthName(p)
  ok(size, 'M1: a run held at the month\'s right side turns to the next month', /November 2026/.test(m1), `${m0} → ${m1}`)
  /* the run is still being drawn — the month wears its picking look; which date is lit now depends on what lies under
     the still pointer in the new month (a blank square past its last date lights nothing new) */
  ok(size, 'M1: the run is still being drawn after the turn', await p.evaluate(() => !!document.querySelector('#inpCal .ib-grid.is-picking')), 'is-picking')
  const b = await dateAt(p, '2026-11-03')
  await H.to(b.x, b.y); await L.sleep(300)
  await L.pic(w, `M1-run-across-${size}`)
  const lit2 = await picked(p)
  ok(size, 'M1: carried back to 3 Nov, the run is lit from the month\'s first date to 3 Nov', lit2.at(-1) === '2026-11-03' && lit2[0] === '2026-11-01', lit2.join(','))
  await H.up(); await L.sleep(600)
  const dlg1 = await dialogText(p)
  ok(size, 'M1: let go — "+ Input" opens for 28 Oct to 3 Nov', /Oct 28/.test(dlg1) && /Nov 3/.test(dlg1), dlg1)
  await L.pic(w, `M1-input-window-${size}`)
  const m1b = await monthName(p)
  await L.sleep(1500)
  ok(size, 'M1: let go, the month turns no more', (await monthName(p)) === m1b, m1b)
  await shut(p)

  /* M2 — on November: a run from 3 Nov held at the LEFT side turns back to October; let go on 30 Oct */
  const c = await dateAt(p, '2026-11-03')
  await H.down(c.x, c.y); await L.sleep(hold)
  await H.to(g.l + 3, c.y)
  await L.sleep(1000)
  const m2 = await monthName(p)
  ok(size, 'M2: a run held at the month\'s left side turns back to the last month', /October 2026/.test(m2), m2)
  const d = await dateAt(p, '2026-10-30')
  await H.to(d.x, d.y); await L.sleep(300)
  await H.up(); await L.sleep(600)
  const dlg2 = await dialogText(p)
  ok(size, 'M2: let go — "+ Input" opens for 30 Oct to 3 Nov', /Oct 30/.test(dlg2) && /Nov 3/.test(dlg2), dlg2)
  await shut(p)

  /* M3 — a run carried THROUGH the side band and on, without holding there: nothing turns */
  const e = await dateAt(p, '2026-10-14'), f = await dateAt(p, '2026-10-16')
  await H.down(e.x, e.y); await L.sleep(hold)
  await H.to(g.r - 4, e.y, 6); await L.sleep(250); await H.to(f.x, f.y, 6); await L.sleep(1200)
  ok(size, 'M3: a run carried through the side band without holding does not turn the month', /October 2026/.test(await monthName(p)), await monthName(p))
  await H.up(); await L.sleep(500)
  await shut(p)

  } catch (e) { ok(size, 'M1–M3 ran to their end', false, String(e).slice(0, 200)) }
  await shut(p); await L.go(w, 'leavewar'); await L.go(w, 'inputs'); await L.sleep(500)

  /* M4 — an input's bar carried to the right side, held: the month turns and the bar rides on; dropped on a weekday
     of the next month, it moves there; then undone. The demo's inputs are in earlier months: step back to one. */
  const findBar = () => p.evaluate(() => {
    const bars = [...document.querySelectorAll('#inpCal .ib-bar[data-iid]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 10 && r.width < 400 && r.top > 0 && !b.classList.contains('is-cx') })
    const b = bars[0]; if (!b) return null
    const r = b.getBoundingClientRect(); return { x: r.x + Math.min(12, r.width / 2), y: r.y + r.height / 2, iid: b.dataset.iid, title: b.getAttribute('title') }
  })
  let bar = await findBar()
  for (let i = 0; i < 8 && !bar; i++) { await w.press('#icPrev'); await L.sleep(450); bar = await findBar() }
  if (!bar) ok(size, 'M4: a bar on a month to carry', false, 'none in the eight months before')
  else {
    const mStart = await monthName(p)
    await H.down(bar.x, bar.y); await L.sleep(w.phone ? 260 : 0)
    await H.to(bar.x + 30, bar.y, 4)
    await H.to(g.r - 4, bar.y)
    await L.sleep(1000)
    const m4 = await monthName(p)
    ok(size, 'M4: a bar held at the month\'s right side turns to the next month', m4 !== mStart, `${mStart} → ${m4}`)
    /* a weekday in the middle of the new month */
    const to = await p.evaluate(() => {
      const c = [...document.querySelectorAll('#inpCal .ib-day[data-icday]:not(.is-we)')][9]; if (!c) return null
      const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 8, iso: c.getAttribute('data-icday') }
    })
    await H.to(to.x, to.y); await L.sleep(300)
    const over = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ic-over')].map(e => e.getAttribute('data-icday')))
    ok(size, 'M4: carried on in the new month, ONE date is lit — the one under the pointer', over.length === 1 && over[0] === to.iso, over.join(','))
    await L.pic(w, `M4-bar-carried-${size}`)
    await H.up(); await L.sleep(900)
    const oil = await dialogText(p)
    const landed = await p.evaluate(iid => !!document.querySelector(`#inpCal .ib-bar[data-iid="${iid}"]`), bar.iid)
    ok(size, `M4: dropped on ${to.iso}, the input is on that month now`, landed, `${bar.title} · ${oil ? 'window: ' + oil : 'no window'}`)
    await L.pic(w, `M4-bar-dropped-${size}`)
    if (oil) await shut(p)
    if (landed) {
      const undo = p.locator('button[title^="Undo"]:visible').first()
      if (await undo.count()) { if (w.phone) await undo.tap(); else await undo.click() } else await p.keyboard.press('Control+z')
      await L.sleep(800)
      /* undo puts the input back on its own date and, it being out of view, turns the month to it (D672) */
      const back = await p.evaluate(iid => !!document.querySelector(`#inpCal .ib-bar[data-iid="${iid}"]`), bar.iid)
      const mBack = await monthName(p)
      ok(size, 'M4: undone, the input is back on its own date and the month turned back to it', back && mBack === mStart, `${mBack} · bar on view: ${back}`)
    }
  }

  /* S — the SANS calendar's own pick is not given the turn (the ruling is the Inputs month's) */
  const sansTab = p.locator('button.intab:has-text("SANS")').first()
  if (await sansTab.count()) {
    if (w.phone) await sansTab.tap(); else await sansTab.click()
    await L.sleep(900)
    const s = await p.evaluate(() => {
      const cells = [...document.querySelectorAll('[data-icday]')].filter(e => e.offsetParent !== null && !e.closest('#inpCal'))
      const c = cells[16] || cells[0]; if (!c) return null
      let gr = c.parentElement; while (gr && gr.getBoundingClientRect().width < innerWidth * 0.5) gr = gr.parentElement
      const r = c.getBoundingClientRect(), R = (gr || document.body).getBoundingClientRect()
      const t = [...document.querySelectorAll('[aria-live="polite"]')].find(e => e.offsetParent !== null && /20\d\d/.test(e.textContent || ''))
      return { x: r.x + r.width / 2, y: r.bottom - 5, right: Math.min(R.right, innerWidth), m: t ? t.textContent : '' }
    })
    if (s && s.m) {
      await H.down(s.x, s.y); await L.sleep(hold); await H.to(s.right - 4, s.y); await L.sleep(1500)
      const m = await p.evaluate(() => [...document.querySelectorAll('[aria-live="polite"]')].find(e => e.offsetParent !== null && /20\d\d/.test(e.textContent || ''))?.textContent || '')
      ok(size, 'S: on the SANS calendar a pick held at the side does not turn the month (not in the ruling)', m === s.m, `${s.m} → ${m}`)
      await H.up(); await L.sleep(400); await p.keyboard.press('Escape'); await L.sleep(300)
    } else ok(size, 'S: the SANS calendar\'s dates and month', false, JSON.stringify(s))
  } else ok(size, 'S: the SANS tab', false, 'not found')
}

/* ---- the Tracker, Edit chart layout ---- */
const viewT = page => page.evaluate(() => { const m = (document.getElementById('viewport')?.getAttribute('transform') || '').match(/translate\(([-\d.]+),([-\d.]+)\)/); return m ? { x: +m[1], y: +m[2] } : null })
const boardBox = page => page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { l: r.left, r: Math.min(r.right, innerWidth), t: r.top, b: Math.min(r.bottom, innerHeight) } })
const ballAt = (page, id) => page.evaluate(i => { const g = document.querySelector(`#flowSvg .ball[data-id="${i}"]`); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: g.getAttribute('transform') } }, id)

async function trackerWalk(w, size) {
  const p = w.page
  await L.go(w, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await L.sleep(800)
  const menu = p.locator('[title^="Edit the syllabus"]').first()
  if (w.phone) await menu.tap(); else await menu.click()
  await L.sleep(300)
  await w.press('#arrangeBtn'); await p.waitForSelector('#viewport', { timeout: 10000 }); await L.sleep(700)
  const H = await hand(w)
  const bb = await boardBox(p)
  /* a ball well inside the canvas */
  const pick = await p.evaluate(box => {
    const balls = [...document.querySelectorAll('#flowSvg .ball')].map(g => { const r = g.getBoundingClientRect(); return { id: g.dataset.id, x: r.x + r.width / 2, y: r.y + r.height / 2 } })
    const mx = (box.l + box.r) / 2, my = (box.t + box.b) / 2
    return balls.filter(b => b.x > box.l + 80 && b.x < box.r - 120 && b.y > box.t + 60 && b.y < box.b - 80).sort((a, b) => Math.hypot(a.x - mx, a.y - my) - Math.hypot(b.x - mx, b.y - my))[0] || null
  }, bb)
  if (!pick) { ok(size, 'T: a ball in the middle of the canvas', false, 'none'); return }
  const tool = await p.evaluate(() => document.getElementById('foldTool')?.textContent || [...document.querySelectorAll('button.primary')].map(b => b.textContent).join('/'))

  /* T1 — a ball carried to the right edge and held: the canvas pans, the ball stays under the pointer */
  const v0 = await viewT(p)
  await H.down(pick.x, pick.y); await L.sleep(w.phone ? 60 : 0)
  await H.to(bb.r - 6, pick.y)
  await L.sleep(1200)
  const v1 = await viewT(p), at1 = await ballAt(p, pick.id)
  ok(size, 'T1: a ball held at the canvas\'s right edge pans the canvas (the chart slides left)', v0 && v1 && v1.x < v0.x - 100, `${v0?.x} → ${v1?.x} (tool ${tool})`)
  ok(size, 'T1: the ball stays under the pointer', !!at1 && Math.abs(at1.x - (bb.r - 6)) < 40 && Math.abs(at1.y - pick.y) < 40, `ball at ${Math.round(at1?.x)},${Math.round(at1?.y)}; pointer ${Math.round(bb.r - 6)},${Math.round(pick.y)}`)
  await L.pic(w, `T1-ball-edge-${size}`)
  await H.up(); await L.sleep(500)
  const v1b = await viewT(p); await L.sleep(800)
  ok(size, 'T1: let go, the canvas pans no more', JSON.stringify(await viewT(p)) === JSON.stringify(v1b), JSON.stringify(v1b))
  const before = await p.evaluate(() => window.__undoForTests?.().undo)
  await p.keyboard.press('Control+z'); await L.sleep(600)
  const after = await p.evaluate(() => window.__undoForTests?.().undo)
  ok(size, 'T1: the move is one undo step, and undo takes it back', before >= 1 && after === before - 1, `${before} → ${after}`)

  /* T2 — a ball carried to the foot: the canvas pans up. T1 left the chart panned away; ⤢ Fit brings it back, as a
     person would, and a ball in the upper middle is taken */
  const fit = p.locator('button:visible', { hasText: /Fit$/ }).first()
  if (await fit.count()) { if (w.phone) await fit.tap(); else await fit.click(); await L.sleep(500) }
  const bb2 = await boardBox(p)
  const p2 = await p.evaluate(box => {
    const balls = [...document.querySelectorAll('#flowSvg .ball')].map(g => { const r = g.getBoundingClientRect(); return { id: g.dataset.id, x: r.x + r.width / 2, y: r.y + r.height / 2 } })
    return balls.filter(b => b.x > box.l + 80 && b.x < box.r - 80 && b.y > box.t + 60 && b.y < (box.t + box.b) / 2).sort((a, b) => a.y - b.y)[0] || null
  }, bb2)
  if (!p2) { ok(size, 'T2: a ball in the upper half after ⤢ Fit', false, 'none'); return }
  const v2 = await viewT(p)
  await H.down(p2.x, p2.y); await H.to(p2.x, bb2.b - 6); await L.sleep(1000)
  const v3 = await viewT(p)
  ok(size, 'T2: a ball held at the canvas\'s foot pans it (the chart slides up)', v2 && v3 && v3.y < v2.y - 60, `${v2?.y} → ${v3?.y}`)
  await L.pic(w, `T2-ball-foot-${size}`)
  await H.to(p2.x, p2.y); await H.up(); await L.sleep(400)
  await p.keyboard.press('Control+z'); await L.sleep(500)

  /* T3 — a ball pressed and held at the edge where it already sits does not set the canvas running (a band the press
     began in is dead until left) */
  const edgeBall = await p.evaluate(box => {
    const balls = [...document.querySelectorAll('#flowSvg .ball')].map(g => { const r = g.getBoundingClientRect(); return { id: g.dataset.id, x: r.x + r.width / 2, y: r.y + r.height / 2 } })
    return balls.find(b => b.x > box.r - 40 && b.x < box.r - 4 && b.y > box.t + 60 && b.y < box.b - 60) || null
  }, await boardBox(p))
  if (edgeBall) {
    const v4 = await viewT(p)
    await H.down(edgeBall.x, edgeBall.y); await H.to(edgeBall.x + 2, edgeBall.y + 2, 2); await L.sleep(900)
    ok(size, 'T3: a ball picked up at the edge does not pan until it has left the edge', JSON.stringify(await viewT(p)) === JSON.stringify(v4), JSON.stringify(v4))
    await H.up(); await L.sleep(300)
  } else ok(size, 'T3: a ball sitting at the edge (to test the dead band) — none there; carried by edgeturn.test.ts', true, 'test-carried')

  /* T4–T8 — the other handles a person drags in Edit chart layout, each carried to an edge and held: the canvas pans,
     the handle stays under the pointer. Each starts from ⤢ Fit and ends with an undo of what it changed. */
  /* buttons are clicked even on a phone: the test browser drops the first finger tap after a finger drag (D158) */
  const press = async loc => { await loc.click() }
  const useTool = async re => { await press(p.locator('button:visible', { hasText: re }).first()); await L.sleep(400) }
  /* the chart back in view after a pan: ⤢ Fit on a desktop; on a phone ⤢ Fit shrinks the whole chart to a column whose
     handles are a pixel or two wide (a finger then lands on a ball's blue points beside them), so there the editor is
     left and opened again, which brings the chart back at the phone's own zoom */
  const fitNow = async () => {
    if (!w.phone) { await press(p.locator('button:visible', { hasText: /Fit$/ }).first()); await L.sleep(500); return }
    const toggle = async () => { await press(p.locator('[title^="Edit the syllabus"]').first()); await L.sleep(300); await w.press('#arrangeBtn'); await L.sleep(700) }
    await toggle()                                       // ✓ Done editing chart
    await toggle()                                       // ✎ Edit chart layout, at the phone's own zoom
    /* then the nearest ball is brought to the middle by dragging empty space with ✋ Move, as a person pans */
    await press(p.locator('button:visible', { hasText: /Move$/ }).first()); await L.sleep(300)
    const pan = await p.evaluate(() => {
      const b = document.getElementById('board').getBoundingClientRect()
      const box = { l: b.left, r: Math.min(b.right, innerWidth), t: b.top, bt: Math.min(b.bottom, innerHeight) }
      const mx = (box.l + box.r) / 2, my = (box.t + box.bt) / 2
      const n = [...document.querySelectorAll('#flowSvg .ball')].map(g => { const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
        .sort((a, c) => Math.hypot(a.x - mx, a.y - my) - Math.hypot(c.x - mx, c.y - my))[0]
      /* an empty spot to grab: a point whose top element is the canvas itself */
      for (let dy = -80; dy <= 80; dy += 20) for (let dx = -60; dx <= 60; dx += 20) {
        const e = document.elementFromPoint(mx + dx, my + dy)
        if (e && (e.id === 'flowSvg' || e.tagName === 'svg' || e.id === 'bgRect' || e.getAttribute('class') === 'bg')) return { x: mx + dx, y: my + dy, dx: mx - n.x, dy: my - n.y }
      }
      return { x: mx, y: my, dx: mx - n.x, dy: my - n.y }
    })
    let left = { dx: pan.dx, dy: pan.dy }
    while (Math.abs(left.dx) > 4 || Math.abs(left.dy) > 4) {
      const sx = Math.max(-150, Math.min(150, left.dx)), sy = Math.max(-250, Math.min(250, left.dy))
      await H.down(pan.x, pan.y); await H.to(pan.x + sx, pan.y + sy, 10); await H.up()
      left = { dx: left.dx - sx, dy: left.dy - sy }
    }
    await L.sleep(300)
  }
  const tapAt = async (x, y) => {
    if (process.env.WALK_DEBUG) console.log(`   (tap at ${Math.round(x)},${Math.round(y)}: ${await p.evaluate(([a, b]) => { const e = document.elementFromPoint(a, b); return e ? (e.getAttribute('class') || e.tagName) : null }, [x, y])})`)
    /* a click even on a phone: the test browser drops a finger tap that follows a finger drag (D158 — its touch emulation, not a real phone) */
    await p.mouse.click(x, y); await L.sleep(400)
  }
  const centre = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }, sel)
  /** carry what lies at `at` to the right edge (or the foot), hold, and read the pan and where `sel` now sits */
  const carryTo = async (name, sel, at, edge) => {
    const box = await boardBox(p), v0 = await viewT(p)
    const tx = edge === 'right' ? box.r - 6 : at.x, ty = edge === 'right' ? at.y : box.b - 6
    const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('class') || e.tagName) : null }, [at.x, at.y])
    if (process.env.WALK_DEBUG) console.log(`   (${name}: under the press — ${under})`)
    await H.down(at.x, at.y); await H.to(at.x + 6, at.y + 6, 3); await H.to(tx, ty); await L.sleep(1000)
    const v1 = await viewT(p), c = await centre(sel)
    const moved = edge === 'right' ? (v1 && v0 && v1.x < v0.x - 60) : (v1 && v0 && v1.y < v0.y - 40)
    ok(size, `${name}: held at the canvas's ${edge === 'right' ? 'right edge' : 'foot'}, the canvas pans`, !!moved, `${JSON.stringify(v0)} → ${JSON.stringify(v1)}`)
    ok(size, `${name}: it stays under the pointer`, !!c && Math.abs(c.x - tx) < 40 && Math.abs(c.y - ty) < 40, `at ${Math.round(c?.x)},${Math.round(c?.y)}; pointer ${Math.round(tx)},${Math.round(ty)}`)
    await L.pic(w, `${name.split(':')[0]}-${size}`)
    await H.up(); await L.sleep(500)
    await p.keyboard.press('Control+z'); await L.sleep(500)
  }

  /* T4 — every ball selected (▣ Select all), one of them carried: the whole group rides, the canvas pans */
  await fitNow(); await useTool(/Select all$/)
  const g4 = await p.evaluate(box => {
    const b = [...document.querySelectorAll('#flowSvg .ball')].map(g => { const r = g.getBoundingClientRect(); return { id: g.dataset.id, x: r.x + r.width / 2, y: r.y + r.height / 2 } })
      .filter(o => o.x > box.l + 80 && o.x < box.r - 80 && o.y > box.t + 60 && o.y < box.b - 80)[0]; return b || null
  }, await boardBox(p))
  if (g4) await carryTo('T4: a selected group, by one of its balls', `#flowSvg .ball[data-id="${g4.id}"]`, g4, 'right')
  else ok(size, 'T4: a ball to carry the group by', false, 'none')

  /* T5, T6 — ✎ Edit lines: a prerequisite arrow picked; its orange end, then its blue bend square, carried */
  await fitNow(); await useTool(/Edit lines$/)
  const arrowAt = async () => p.evaluate(box => {
    for (const e of document.querySelectorAll('#flowSvg .edgehit')) {
      const L = e.getTotalLength(); if (L < 60) continue
      const q = e.getPointAtLength(L / 2), m = e.getScreenCTM(); if (!m) continue
      const x = m.a * q.x + m.c * q.y + m.e, y = m.b * q.x + m.d * q.y + m.f
      if (x > box.l + 80 && x < box.r - 80 && y > box.t + 60 && y < box.b - 80) return { x, y }
    }
    return null
  }, await boardBox(p))
  let ar = await arrowAt()
  if (!ar) ok(size, 'T5: a prerequisite arrow in view to pick', false, 'none')
  else {
    await tapAt(ar.x, ar.y)
    const e5 = await centre('#flowSvg .endhandle[data-end="to"]')
    if (e5) await carryTo('T5: an arrow\'s orange end', '#flowSvg .endhandle[data-end="to"]', e5, 'right')
    else ok(size, 'T5: the picked arrow shows its orange ends', false, 'none')
    await fitNow(); await useTool(/Edit lines$/)
    ar = await arrowAt()
    if (ar) await tapAt(ar.x, ar.y)
    const h6 = await centre('#flowSvg .linehandle')
    if (h6) await carryTo('T6: an arrow\'s bend square', '#flowSvg .linehandle', h6, 'foot')
    else ok(size, 'T6: the picked arrow shows its bend square', false, 'none')
  }

  /* T7, T8 — ╱ Line: a line drawn with a corner (two taps), picked; its end, then its corner square, carried */
  await fitNow(); await useTool(/Line$/)
  const bx = await boardBox(p)
  const A = { x: bx.l + (bx.r - bx.l) * 0.3, y: bx.t + (bx.b - bx.t) * 0.3 }, B = { x: A.x + 120, y: A.y + 90 }
  await tapAt(A.x, A.y); await tapAt(B.x, B.y)
  const lh = await p.evaluate(() => {
    const e = [...document.querySelectorAll('#flowSvg .linehit')].pop(); if (!e) return null
    const L = e.getTotalLength(), q = e.getPointAtLength(L * 0.25), m = e.getScreenCTM()
    return { x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f }
  })
  if (lh) await tapAt(lh.x, lh.y)
  const e7 = await centre('#flowSvg .lend[data-i="0"]')
  if (e7) {
    await carryTo('T7: a drawn line\'s end', '#flowSvg .lend[data-i="0"]', e7, 'right')
    /* a fresh line with a corner, picked — its own corner square, the one in view */
    await fitNow(); await useTool(/Line$/)
    await tapAt(A.x, A.y + 40); await tapAt(B.x, B.y + 40)
    const lh2 = await p.evaluate(() => {
      const e = [...document.querySelectorAll('#flowSvg .linehit')].pop(); if (!e) return null
      const L = e.getTotalLength(), q = e.getPointAtLength(L * 0.25), m = e.getScreenCTM()
      return { x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f }
    })
    if (lh2) await tapAt(lh2.x, lh2.y)
    const v8 = await p.evaluate(box => {
      const v = [...document.querySelectorAll('#flowSvg .lvert')].map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, i: e.getAttribute('data-i'), lid: e.getAttribute('data-lid') } })
        .find(o => o.x > box.l + 20 && o.x < box.r - 20 && o.y > box.t + 20 && o.y < box.b - 60)
      return v || null
    }, await boardBox(p))
    if (v8) await carryTo('T8: a drawn line\'s corner square', `#flowSvg .lvert[data-lid="${v8.lid}"][data-i="${v8.i}"]`, v8, 'foot')
    else ok(size, 'T8: the drawn line shows a corner square in view', false, 'none')
  } else ok(size, 'T7: a drawn line, picked, shows its ends', false, JSON.stringify(lh))

  ok(size, 'no console or page errors', w.errors.length === 0, w.errors.length ? w.errors.join(' | ').slice(0, 300) : '0')
}

for (const size of SIZES) {
  const w = await L.world(size)
  try {
    try { await monthWalk(w, size) } catch (e) { ok(size, 'the month\'s walk ran to its end', false, String(e).slice(0, 300)) }
    await trackerWalk(w, size)
  } catch (e) { ok(size, 'the walk ran to its end', false, String(e).slice(0, 300)) } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
