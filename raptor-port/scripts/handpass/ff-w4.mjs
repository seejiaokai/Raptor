/* RETIRED 27 Sep 26 (owner, D275 — "I still prefer these"): the room beside the ‹ arrow this script asserts was taken
   out before it merged ([ARROW-ROOM-OUT]). Kept as the first walk's evidence (docs/handpass/2026-09-26-five-flags.md
   §3d, §5); re-running it now reports the room missing, which is correct. Do not re-run it as a check. */
/* W4 — [VIEW-ARROW-OVER-LIST] walk (five-flags batch, 26 Sep 26). Walker W4 of the fanned-out FULL walk
   (brief: raptor-port/docs/superpowers/briefs/2026-09-26-five-flags-walk-brief.md §W4; Fable F7, F8, F9, F19, §2.4).
   Drives the REAL production bundle already served at http://localhost:4176 (never rebuilds, never writes through
   window). Every check asserts the RIGHT behaviour, so re-running this IS the re-walk.

   Usage (from raptor-port/):  node scripts/handpass/ff-w4.mjs [section ...]
   Sections: probe arrows chips cal carry board peek warn pend misc edge availwin resize phone   (default: all but probe)

   What "the day at the front sits beside the ‹ arrow" is measured as, after EVERY landing:
     · CLEAR  — the front day's left edge ≥ the ‹ arrow's right edge + 4px
     · INSET  — the front day's left edge is at the week's declared room (week left + scroll-padding-left, ±2px):
                beside the arrow, not a fraction of a day off it
     · HIT    — document.elementFromPoint at the front day's first pixels, at the arrow's own height, is the day
     · LIST   — an opened "⚠ N issues" list of the front day starts right of the arrow, and with the page scrolled
                so its first line sits at the arrow's height, elementFromPoint at its first letters is the list
     · NO HOP — the week's scroll, sampled every frame from the action to rest, never moves again after it first
                reaches its resting value (the landing frame IS the rest frame) */
process.env.HP_URL = 'http://localhost:4176'
process.env.HP_SHOTS = process.env.FF_SHOTS || 'C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/docs/img/handpass/2026-09-26-five-flags/w4'
const L = await import('./am/am-lib.mjs')
const { open, go } = L
import { mkdirSync } from 'node:fs'
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const SH = process.env.HP_SHOTS

/* ---------------- bookkeeping ---------------- */
const ROWS = []
const ERRS = []
const out = (s) => console.log(s.length > 1600 ? s.slice(0, 1600) + '…' : s)
function check(id, ok, what, detail = '') { ROWS.push({ id, ok: !!ok, what, detail }); out(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`) }
function note(id, what, detail = '') { ROWS.push({ id, ok: null, what, detail }); out(`NOTE ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}`) }

const DESK = { width: 1440, height: 900 }, WIDE = { width: 1920, height: 1080 }, SHORT = { width: 1024, height: 700 }, PHONE = { width: 390, height: 844 }
const WK = { viewsched: '#vWeek', editsched: '#eWeek' }
const tagOf = (vp) => `${vp.width}x${vp.height}`
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function world(vp, who = 'a') {
  const w = await open({ ...vp, who })
  w.page.on('dialog', d => d.dismiss().catch(() => {}))
  return w
}
function collect(tag, errors) { if (errors.length) { for (const e of errors) ERRS.push(`${tag}: ${e}`); out(`ERRORS ${tag}: ${JSON.stringify(errors)}`) } errors.length = 0 }

/* ---------------- the frame sampler: every frame's scrollLeft from the action to rest ---------------- */
async function trackStart(page, wk) {
  await page.evaluate((wk) => {
    const el = document.querySelector(wk)
    /* a generation number: a sampler started in the same frame another was stopped must not leave the old loop
       running alongside (two loops on two different weeks would interleave their readings) */
    const gen = (window.__w4gen = (window.__w4gen || 0) + 1)
    window.__w4trk = []; window.__w4on = true
    const t0 = performance.now()
    const tick = () => { if (!window.__w4on || window.__w4gen !== gen) return; const e = document.querySelector(wk); window.__w4trk.push([Math.round(performance.now() - t0), e ? Math.round(e.scrollLeft) : null]); requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }, wk)
}
/* wait until the week (and the page's vertical) holds still for 10 frames, and ≥500ms since the action; stop sampling */
async function settle(page, wk, min = 500) {
  const t0 = Date.now()
  await page.evaluate(async (wk) => {
    let lx = NaN, ly = NaN, same = 0
    for (let i = 0; i < 300; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const e = document.querySelector(wk)
      const x = e ? Math.round(e.scrollLeft) : -1, y = Math.round(window.scrollY)
      same = (x === lx && y === ly) ? same + 1 : 0; lx = x; ly = y
      if (same >= 10) break
    }
  }, wk)
  const el = Date.now() - t0
  if (el < min) await sleep(min - el)
}
async function trackStop(page) {
  const s = await page.evaluate(() => { window.__w4on = false; return window.__w4trk || [] })
  const vals = s.map(x => x[1]).filter(v => v != null)
  if (!vals.length) return { n: 0, hop: false, path: [] }
  const fin = vals[vals.length - 1]
  const firstAt = vals.findIndex(v => Math.abs(v - fin) <= 2)
  const after = vals.slice(firstAt)
  const hop = after.some(v => Math.abs(v - fin) > 2)
  /* the distinct positions it passed through, compressed */
  const path = []; for (const v of vals) if (!path.length || Math.abs(path[path.length - 1] - v) > 1) path.push(v)
  return { n: vals.length, hop, path: path.length > 12 ? [...path.slice(0, 4), '…', ...path.slice(-6)] : path, fin }
}

/* ---------------- the measurement ---------------- */
async function measure(page, wk) {
  return page.evaluate((wk) => {
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left * 10) / 10, r: Math.round(b.right * 10) / 10, t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }
    const week = document.querySelector(wk)
    if (!week || !week.offsetParent) return { error: 'week not on screen' }
    const cs = getComputedStyle(week)
    const wr = week.getBoundingClientRect()
    const prevEl = document.getElementById('weekPrev'), nextEl = document.getElementById('weekNext')
    const shown = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0
    const prev = shown(prevEl) ? r(prevEl) : null, next = shown(nextEl) ? r(nextEl) : null
    const inset = parseFloat(cs.scrollPaddingLeft); const insetR = parseFloat(cs.scrollPaddingRight)
    const live = [...week.querySelectorAll('.day[data-day]')]
    const all = [...week.querySelectorAll('.day')]
    const edge = prev ? prev.r : wr.left
    /* the front day: the first day (live or preview) whose right edge is well past the arrow */
    const frontEl = all.find(d => d.getBoundingClientRect().right > edge + 100) || null
    const fr = frontEl ? frontEl.getBoundingClientRect() : null
    const frontName = frontEl ? (frontEl.dataset.day != null ? 'd' + frontEl.dataset.day : 'peek' + frontEl.dataset.peekDay) : null
    const dow = frontEl ? ((frontEl.querySelector('.dow') || frontEl.querySelector('.day-head') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30) : ''
    /* HIT: the day's first pixels at the arrow's own height (or the day head's middle when no arrow) */
    let hit = null
    if (fr) {
      const y = prev ? Math.round(prev.t + prev.h / 2) : Math.round(fr.top + 20)
      const x = Math.round(fr.left + 3)
      const e = document.elementFromPoint(x, y)
      hit = { x, y, isArrow: !!(e && e.closest && e.closest('.week-nav')), inDay: !!(e && e.closest && e.closest('.day') === frontEl), what: e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) : null,
        dayReaches: fr.top <= y && fr.bottom >= y }
    }
    /* the day's own first line (the day head's title) — at its own height */
    let headHit = null
    if (frontEl) {
      const h = frontEl.querySelector('.day-head') || frontEl
      const hb = h.getBoundingClientRect()
      const hy = Math.round(hb.top + Math.min(12, hb.height / 2))
      const e = document.elementFromPoint(Math.round(hb.left + 3), hy)
      headHit = { isArrow: !!(e && e.closest && e.closest('.week-nav')), inDay: !!(e && e.closest && e.closest('.day') === frontEl), onScreen: hy > 0 && hy < innerHeight }
    }
    /* the proxy scrollbar */
    const trk = document.getElementById('hsTrack'), bar = document.getElementById('hscroll')
    let proxy = null
    if (trk && bar && bar.classList.contains('on')) {
      const over = week.scrollWidth - week.clientWidth, tmax = trk.scrollWidth - trk.clientWidth
      proxy = { want: Math.round(over > 0 ? (week.scrollLeft / over) * tmax : 0), got: Math.round(trk.scrollLeft) }
    }
    const step = live.length > 1 ? Math.round(live[1].getBoundingClientRect().left - live[0].getBoundingClientRect().left) : 0
    const lbl = (document.getElementById('hsLbl') || {}).textContent || ''
    /* which live days are wholly / partly visible between the two arrows */
    const lo = prev ? prev.r : wr.left, hi = next ? next.l : wr.right
    const vis = live.map(d => { const b = d.getBoundingClientRect(); return { di: +d.dataset.day, whole: b.left >= lo - 1 && b.right <= hi + 1, part: b.right > lo && b.left < hi } })
    return {
      vw: innerWidth, vh: innerHeight, sl: Math.round(week.scrollLeft), max: week.scrollWidth - week.clientWidth,
      padL: cs.paddingLeft, padR: cs.paddingRight, spL: cs.scrollPaddingLeft, spR: cs.scrollPaddingRight, inset: Number.isFinite(inset) ? inset : 0, insetR: Number.isFinite(insetR) ? insetR : 0,
      week: r(week), prev, next, front: frontName, dow, frontL: fr ? Math.round(fr.left * 10) / 10 : null, frontR: fr ? Math.round(fr.right) : null,
      want: Math.round((wr.left + (Number.isFinite(inset) ? inset : 0)) * 10) / 10, hit, headHit, proxy, step, lbl,
      whole: vis.filter(v => v.whole).map(v => v.di), part: vis.filter(v => v.part).map(v => v.di),
    }
  }, wk)
}
/* the standard asserts on one landing */
function assertLanding(id, m, { expectFront = null, expectInset = true, trk = null, lblCheck = true } = {}) {
  if (m.error) { check(id + '.ok', false, 'the week is on screen', m.error); return }
  if (expectFront != null) check(id + '.day', m.front === expectFront, `the front day is ${expectFront}`, `front=${m.front} (${m.dow})`)
  if (m.prev) {
    check(id + '.clear', m.frontL >= m.prev.r + 4, 'the front day starts ≥4px right of the ‹ arrow', `dayLeft=${m.frontL} arrowRight=${m.prev.r}`)
    if (expectInset) check(id + '.inset', Math.abs(m.frontL - m.want) <= 2, 'the front day sits AT the room the week keeps (beside the arrow, not a fraction of a day off)', `dayLeft=${m.frontL} want=${m.want} sl=${m.sl}`)
    /* a short day (a bare weekend, an empty week) ends above the arrow's height — there the point is the week's own
       background, and the only thing to prove is that it is not the arrow */
    if (m.hit && !m.hit.dayReaches) check(id + '.hit', !m.hit.isArrow, 'at the arrow\'s height beside the front day (the day ends above it): not the arrow', m.hit)
    else check(id + '.hit', m.hit && !m.hit.isArrow && m.hit.inDay, 'elementFromPoint at the front day\'s first pixels (arrow height) is the day, not the arrow', m.hit)
  }
  /* the head is only there to read when the page is not scrolled past it (a warning tap scrolls the page down) */
  if (!m.headHit || m.headHit.onScreen) check(id + '.head', m.headHit && m.headHit.inDay && !m.headHit.isArrow, 'the front day\'s head, first letters, is the day', m.headHit)
  if (m.proxy) check(id + '.proxy', Math.abs(m.proxy.got - m.proxy.want) <= 2, 'the proxy bar\'s thumb follows the week', m.proxy)
  if (lblCheck && m.prev && m.lbl) {
    const front = m.front && m.front.startsWith('d') ? +m.front.slice(1) : null
    const a = +(m.lbl.match(/day (\d+)/) || [])[1]
    if (front != null) check(id + '.label', a === front + 1, '"day a–b of 7" starts at the front day', `lbl="${m.lbl}" front=${m.front} whole=${JSON.stringify(m.whole)} part=${JSON.stringify(m.part)}`)
  }
  if (trk) check(id + '.nohop', !trk.hop, 'no hop after landing (the landing frame is the rest frame)', `frames=${trk.n} path=${JSON.stringify(trk.path)}`)
}

/* open the front day's "⚠ N issues" list (if it has one) and prove its first letters are clear of the arrow —
   scrolling the PAGE (never the week) so its first line sits at the arrow's own height */
async function listCheck(page, wk, id, shotName) {
  const m0 = await measure(page, wk)
  if (!m0.front || !m0.front.startsWith('d')) { note(id + '.list', 'front day is a preview day; no list'); return }
  const di = m0.front.slice(1)
  const has = await page.evaluate(([wk, di]) => !!document.querySelector(`${wk} .day[data-day="${di}"] [data-daywarn]`), [wk, di])
  if (!has) { note(id + '.list', `front day d${di} has no issues line`); return }
  const openAlready = await page.evaluate(([wk, di]) => { const l = document.querySelector(`${wk} .day[data-day="${di}"] .dwlist`); return !!(l && l.getBoundingClientRect().width) }, [wk, di])
  const sl0 = m0.sl
  if (!openAlready) {
    /* a real mouse press where the line is, without Playwright scrolling anything first */
    const b = await page.evaluate(([wk, di]) => { const e = document.querySelector(`${wk} .day[data-day="${di}"] [data-daywarn]`); const r = e.getBoundingClientRect(); return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2, vh: innerHeight } }, [wk, di])
    if (b.y < 60 || b.y > b.vh - 60) await page.evaluate(([wk, di]) => { const e = document.querySelector(`${wk} .day[data-day="${di}"] [data-daywarn]`); window.scrollBy(0, e.getBoundingClientRect().top - innerHeight * 0.3) }, [wk, di])
    const b2 = await page.evaluate(([wk, di]) => { const e = document.querySelector(`${wk} .day[data-day="${di}"] [data-daywarn]`); const r = e.getBoundingClientRect(); return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2 } }, [wk, di])
    await page.mouse.click(b2.x, b2.y)
    await sleep(350)
  }
  /* the page scrolled so the list's first line is at the arrow's height */
  const g = await page.evaluate(([wk, di]) => {
    const l = document.querySelector(`${wk} .day[data-day="${di}"] .dwlist`)
    if (!l || !l.getBoundingClientRect().width) return { open: false }
    const prev = document.getElementById('weekPrev')
    const pr = prev && !prev.hidden && prev.getBoundingClientRect().width ? prev.getBoundingClientRect() : null
    const ay = pr ? pr.top + pr.height / 2 : innerHeight * 0.52
    const first = l.querySelector('.witem') || l.firstElementChild || l
    window.scrollBy(0, first.getBoundingClientRect().top + 6 - ay)
    return { open: true }
  }, [wk, di])
  if (!g.open) { check(id + '.list', false, 'the day\'s issues list opens', `d${di}`); return }
  await sleep(250)
  const lr = await page.evaluate(([wk, di]) => {
    const l = document.querySelector(`${wk} .day[data-day="${di}"] .dwlist`)
    const first = l.querySelector('.witem') || l.firstElementChild || l
    const fb = first.getBoundingClientRect(), lb = l.getBoundingClientRect()
    const prev = document.getElementById('weekPrev')
    const pr = prev && !prev.hidden && prev.getBoundingClientRect().width ? prev.getBoundingClientRect() : null
    /* at the arrow's own height when the list reaches it (the page cannot always scroll that far — a short list near
       the top of the page), else at the first item's own first line */
    const ay = pr ? Math.round(pr.top + pr.height / 2) : null
    const atArrow = ay != null && lb.top <= ay && lb.bottom >= ay
    const y = atArrow ? ay : Math.round(fb.top + 8)
    /* the first letters: a few px into the first item's text box */
    const x = Math.round(fb.left + 4)
    const e = document.elementFromPoint(x, y)
    return { atArrow, listL: Math.round(lb.left), itemL: Math.round(fb.left), arrowR: pr ? Math.round(pr.right) : null, arrowT: pr ? Math.round(pr.top) : null, arrowB: pr ? Math.round(pr.bottom) : null, y, itemT: Math.round(fb.top), itemB: Math.round(fb.bottom),
      hitList: !!(e && e.closest && e.closest('.dwlist') === l), hitArrow: !!(e && e.closest && e.closest('.week-nav')), text: (first.innerText || '').replace(/\s+/g, ' ').slice(0, 40) }
  }, [wk, di])
  const sl1 = await page.evaluate((wk) => Math.round(document.querySelector(wk).scrollLeft), wk)
  if (lr.arrowR != null) check(id + '.list', lr.listL >= lr.arrowR + 4 && lr.hitList && !lr.hitArrow, 'the opened issues list starts clear of the ‹ arrow and its first letters are the list (at the arrow\'s height where it reaches it)', lr)
  else check(id + '.list', lr.hitList, 'the opened issues list is on screen (no arrows)', lr)
  check(id + '.listkeep', Math.abs(sl1 - sl0) <= 1, 'opening the list did not move the week sideways', `${sl0}→${sl1}`)
  if (shotName) {
    await page.screenshot({ path: `${SH}/${shotName}.png` })
    if (lr.arrowR != null) await page.screenshot({ path: `${SH}/${shotName}-close.png`, clip: { x: 0, y: Math.max(0, lr.y - 90), width: 420, height: 180 } })
  }
}
async function shot(page, name) { await page.screenshot({ path: `${SH}/${name}.png` }) }
/* press an arrow the way a person does (a real mouse click at its centre), record the frames, settle, measure */
async function press(page, wk, dir) {
  await trackStart(page, wk)
  const b = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, dir > 0 ? 'weekNext' : 'weekPrev')
  await page.mouse.click(b.x, b.y)
  await sleep(120)
  await settle(page, wk, 650)
  const trk = await trackStop(page)
  return { m: await measure(page, wk), trk, week: await page.evaluate(() => window.CURWEEK) }
}
/* a landing driven by some action fn: sample, act, settle, measure */
async function landing(page, wk, fn, min = 600) {
  await trackStart(page, wk)
  await fn()
  await settle(page, wk, min)
  const trk = await trackStop(page)
  return { m: await measure(page, wk), trk, week: await page.evaluate(() => window.CURWEEK) }
}
async function toTop(page) { await page.evaluate(() => window.scrollTo(0, 0)); await sleep(150) }

/* ================= sections ================= */
const SECTIONS = {}

SECTIONS.probe = async () => {
  for (const vp of [DESK, SHORT, WIDE]) {
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      await go(page, pg)
      const m = await measure(page, WK[pg])
      out(`PROBE ${tagOf(vp)} ${pg} ${JSON.stringify(m)}`)
      const extra = await page.evaluate(() => {
        const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) } }
        return { rail: r(document.querySelector('.ros-rail')), aside: r(document.querySelector('.edit-board .eroster')), bar: r(document.getElementById('hscroll')),
          warnDays: [...document.querySelectorAll('.page.on .day[data-day] [data-daywarn]')].map(e => e.closest('.day').dataset.day), week: window.CURWEEK }
      })
      out(`PROBE+ ${tagOf(vp)} ${pg} ${JSON.stringify(extra)}`)
    }
    collect('probe ' + tagOf(vp), errors)
    await browser.close()
  }
}

/* L13 boot, L2/L3 › seven times (incl. the cross), L4/L1 ‹ back (incl. the cross back), both pages, three widths */
SECTIONS.arrows = async () => {
  for (const vp of [DESK, SHORT, WIDE]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg]
      await go(page, pg)
      await toTop(page)
      const p = pg === 'viewsched' ? 'view' : 'edit'
      const wk0 = await page.evaluate(() => window.CURWEEK)
      /* L13 — at rest */
      const m0 = await measure(page, wk)
      assertLanding(`L13.${t}.${p}`, m0, { expectFront: 'd0' })
      await shot(page, `L13-rest-${p}-${t}`)
      await listCheck(page, wk, `L13.${t}.${p}`, pg === 'viewsched' ? `L13-list-${p}-${t}` : null)
      await toTop(page)
      /* the list may have been opened — close it the way a person does: click its line again */
      await page.evaluate((wk) => { const l = document.querySelector(`${wk} .day[data-day="0"] .dwlist`); if (l && l.getBoundingClientRect().width) document.querySelector(`${wk} .day[data-day="0"] [data-daywarn]`).click() }, wk)
      await sleep(200)
      /* › six times: Tue … Sun at the front */
      for (let i = 1; i <= 6; i++) {
        const r = await press(page, wk, 1)
        assertLanding(`L2.${t}.${p}.fwd${i}`, r.m, { expectFront: 'd' + i, trk: r.trk })
        check(`L2.${t}.${p}.fwd${i}.oneday`, r.week === wk0, 'one press = one day, same week', `week=${r.week}`)
        await shot(page, `L2-fwd${i}-${p}-${t}`)
        if (i === 6) {
          /* Sunday at the front: the next-week preview beside it, no void */
          const pv = await page.evaluate((wk) => {
            const w = document.querySelector(wk), sun = w.querySelector('.day[data-day="6"]'), pk = w.querySelector('.day.peek')
            if (!sun) return null
            const s = sun.getBoundingClientRect(), k = pk ? pk.getBoundingClientRect() : null
            return { sunR: Math.round(s.right), peekL: k ? Math.round(k.left) : null, gap: k ? Math.round(k.left - s.right) : null, peeks: w.querySelectorAll('.day.peek').length, vw: innerWidth }
          }, wk)
          check(`L2.${t}.${p}.sunpeek`, pv && pv.peekL != null && pv.gap >= 0 && pv.gap <= 20, 'Sunday at the front shows the next-week preview right beside it, no void', pv)
          if (pg === 'viewsched') await listCheck(page, wk, `L2.${t}.${p}.sun`, `L2-sun-list-${p}-${t}`)
          await toTop(page)
        }
      }
      /* the 7th press crosses to next week, Monday at the front (L3) */
      const c1 = await press(page, wk, 1)
      assertLanding(`L3.${t}.${p}`, c1.m, { expectFront: 'd0', trk: c1.trk })
      check(`L3.${t}.${p}.week`, c1.week !== wk0, 'the press past Sunday crossed into next week', `${wk0}→${c1.week}`)
      await shot(page, `L3-cross-fwd-${p}-${t}`)
      /* ‹ on that Monday crosses back: Sunday at the front (L4) */
      const c2 = await press(page, wk, -1)
      assertLanding(`L4.${t}.${p}`, c2.m, { expectFront: 'd6', trk: c2.trk })
      check(`L4.${t}.${p}.week`, c2.week === wk0, 'the press back from Monday crossed back to the week', `${c1.week}→${c2.week}`)
      await shot(page, `L4-cross-back-${p}-${t}`)
      /* ‹ six times: Sat … Mon at the front (L1) */
      for (let i = 5; i >= 0; i--) {
        const r = await press(page, wk, -1)
        assertLanding(`L1.${t}.${p}.back${i}`, r.m, { expectFront: 'd' + i, trk: r.trk })
        check(`L1.${t}.${p}.back${i}.oneday`, r.week === wk0, 'one press = one day, same week', `week=${r.week}`)
        await shot(page, `L1-back-to-d${i}-${p}-${t}`)
      }
      /* ‹ on Monday: the previous week's Sunday (L4, the other week) */
      const c3 = await press(page, wk, -1)
      assertLanding(`L4b.${t}.${p}`, c3.m, { expectFront: 'd6', trk: c3.trk })
      check(`L4b.${t}.${p}.week`, c3.week !== wk0, 'the press back from Monday crossed into the previous week', `${wk0}→${c3.week}`)
      await shot(page, `L4b-prevweek-sun-${p}-${t}`)
      /* › from there: this week's Monday (L3 again) */
      const c4 = await press(page, wk, 1)
      assertLanding(`L3b.${t}.${p}`, c4.m, { expectFront: 'd0', trk: c4.trk })
      check(`L3b.${t}.${p}.week`, c4.week === wk0, 'back on the demo week', c4.week)
    }
    collect('arrows ' + t, errors)
    await browser.close()
  }
}

/* L16 — the four week chips (prev · current · +1 · +2), from a mid-week position, both pages */
SECTIONS.chips = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg)
      await press(page, wk, 1); await press(page, wk, 1)     // Wednesday at the front
      const chips = await page.evaluate(() => [...document.querySelectorAll('.page.on [data-wk]')].filter(e => e.offsetWidth).map(e => ({ v: e.dataset.wk, lbl: e.innerText.trim(), on: e.classList.contains('on') })))
      note(`L16.${t}.${p}.chips`, 'the week chips shown', chips)
      for (const [k, idx] of [['prev', 0], ['plus1', 2], ['plus2', 3], ['current', 1]]) {
        const cur = await page.evaluate(() => [...document.querySelectorAll('.page.on [data-wk]')].filter(e => e.offsetWidth).map(e => e.dataset.wk))
        const v = cur[idx]
        const r = await landing(page, wk, async () => {
          const b = await page.evaluate((v) => { const e = [...document.querySelectorAll('.page.on [data-wk]')].find(x => x.offsetWidth && x.dataset.wk === v); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, v)
          await page.mouse.click(b.x, b.y)
        })
        assertLanding(`L16.${t}.${p}.${k}`, r.m, { trk: r.trk })
        note(`L16.${t}.${p}.${k}.where`, 'the chip landed on (the week holds its front day)', `week=${r.week} front=${r.m.front} lbl="${r.m.lbl}"`)
        await shot(page, `L16-chip-${k}-${p}-${t}`)
      }
    }
    collect('chips ' + t, errors)
    await browser.close()
  }
}

/* L5 — the calendar: pick a day; lands that exact day at the front */
SECTIONS.cal = async () => {
  for (const vp of [DESK, SHORT, WIDE]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg)
      for (const [iso, di] of [['2026-07-15', 2], ['2026-07-19', 6], ['2026-07-23', 3], ['2026-07-13', 0], ['2026-07-17', 4]]) {
        const r = await landing(page, wk, async () => {
          const b = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .wk-cal')].find(x => x.offsetWidth); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
          await page.mouse.click(b.x, b.y)
          await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]')
          await page.click(`#weekCal [data-wcal="${iso}"]`)
        })
        assertLanding(`L5.${t}.${p}.${iso}`, r.m, { expectFront: 'd' + di, trk: r.trk })
        await shot(page, `L5-cal-${iso}-${p}-${t}`)
        if (iso === '2026-07-15' && pg === 'viewsched') { await listCheck(page, wk, `L5.${t}.${p}.${iso}`, `L5-cal-${iso}-list-${p}-${t}`); await toTop(page) }
      }
    }
    collect('cal ' + t, errors)
    await browser.close()
  }
}

/* L6 — a page switch carries the day: View → Edit, Edit → View, and a detour through Inputs */
SECTIONS.carry = async () => {
  for (const vp of [DESK, SHORT, WIDE]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    await go(page, 'viewsched')
    for (let i = 0; i < 3; i++) await press(page, '#vWeek', 1)     // Thursday at the front
    let r = await landing(page, '#eWeek', () => go(page, 'editsched'))
    assertLanding(`L6.${t}.view2edit`, r.m, { expectFront: 'd3', trk: r.trk })
    await shot(page, `L6-view2edit-d3-${t}`)
    await press(page, '#eWeek', -1)                                  // Wednesday
    r = await landing(page, '#vWeek', () => go(page, 'viewsched'))
    assertLanding(`L6.${t}.edit2view`, r.m, { expectFront: 'd2', trk: r.trk })
    await shot(page, `L6-edit2view-d2-${t}`)
    await listCheck(page, '#vWeek', `L6.${t}.edit2view`, `L6-edit2view-list-${t}`)
    await toTop(page)
    await press(page, '#vWeek', 1); await press(page, '#vWeek', 1); await press(page, '#vWeek', 1)   // Saturday
    await go(page, 'inputs')
    r = await landing(page, '#vWeek', () => go(page, 'viewsched'))
    assertLanding(`L6.${t}.viaInputs`, r.m, { expectFront: 'd5', trk: r.trk })
    await shot(page, `L6-via-inputs-d5-${t}`)
    /* Sunday at the front carried across (the far end: the ceiling must let Sunday reach the front on the other page) */
    await press(page, '#vWeek', 1)
    r = await landing(page, '#eWeek', () => go(page, 'editsched'))
    assertLanding(`L6.${t}.sun.view2edit`, r.m, { expectFront: 'd6', trk: r.trk })
    await shot(page, `L6-view2edit-d6-${t}`)
    collect('carry ' + t, errors)
    await browser.close()
  }
}

/* L7 — the board closes and the edit week lands the board's day at the front */
SECTIONS.board = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    await go(page, 'editsched')
    for (const di of [3, 6, 1]) {
      /* open the board from the day's own door on the week (a real click; the door may need the day on screen) */
      const opened = await page.evaluate((di) => { const e = [...document.querySelectorAll(`#eWeek [data-sbday="${di}"]`)].find(x => x.offsetWidth); if (!e) return false; e.click(); return true }, di)
      await page.waitForSelector('#schedBoard', { timeout: 5000 }).catch(() => {})
      await sleep(500)
      check(`L7.${t}.d${di}.open`, opened && await page.locator('#schedBoard').count(), 'the board opened on the day', `d${di}`)
      const r = await landing(page, '#eWeek', () => L.closeBoard(page))
      assertLanding(`L7.${t}.d${di}`, r.m, { expectFront: 'd' + di, trk: r.trk })
      await shot(page, `L7-boardclose-d${di}-${t}`)
    }
    collect('board ' + t, errors)
    await browser.close()
  }
}

/* L8 — the next-week preview click: where the new live day lands, and what sits at the front */
SECTIONS.peek = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg)
      await landing(page, wk, async () => {
        const b = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .wk-cal')].find(x => x.offsetWidth); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
        await page.mouse.click(b.x, b.y); await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]'); await page.click('#weekCal [data-wcal="2026-07-19"]')
      })
      for (const pk of [0, 1]) {
        /* on screen = inside the week's own box (on Edit Schedule the crew palette covers everything right of it) */
        const before = await page.evaluate(([wk, pk]) => { const e = document.querySelector(`${wk} .day.peek[data-peek-day="${pk}"]`); if (!e) return null; const r = e.getBoundingClientRect(); const w = document.querySelector(wk).getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + 40), vis: r.left < Math.min(w.right, innerWidth - 46) - 80 } }, [wk, pk])
        if (!before || !before.vis) { note(`L8.${t}.${p}.peek${pk}`, 'preview day not on screen to click', before); continue }
        const wk0 = await page.evaluate(() => window.CURWEEK)
        const r = await landing(page, wk, async () => { await page.mouse.click(before.x + 60, before.y) })
        const landed = await page.evaluate(([wk, pk]) => { const e = document.querySelector(`${wk} .day[data-day="${pk}"]`); return e ? Math.round(e.getBoundingClientRect().left) : null }, [wk, pk])
        check(`L8.${t}.${p}.peek${pk}.week`, r.week !== wk0, 'the preview click loaded next week', `${wk0}→${r.week}`)
        /* "in place" unless the week cannot scroll that far: Monday (or Tuesday) of the new week cannot sit further right
           than it does at the week's very start, so there the week rests at its start (scroll 0) — Monday at the room */
        check(`L8.${t}.${p}.peek${pk}.inplace`, landed != null && (Math.abs(landed - before.x) <= 2 || (r.m.sl === 0 && landed < before.x)), 'the clicked preview day became real in place (same x), or as close as the start of the week allows', `was x=${before.x} now x=${landed} sl=${r.m.sl}`)
        /* the front day after: beside the arrow (clear), whatever it is */
        assertLanding(`L8.${t}.${p}.peek${pk}`, r.m, { trk: r.trk, expectInset: false })
        note(`L8.${t}.${p}.peek${pk}.front`, 'front day after the preview click', `front=${r.m.front} left=${r.m.frontL} want=${r.m.want}`)
        await shot(page, `L8-peek${pk}-${p}-${t}`)
        /* back to the demo week's Sunday for the next preview click */
        await landing(page, wk, async () => {
          const b = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .wk-cal')].find(x => x.offsetWidth); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
          await page.mouse.click(b.x, b.y); await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]'); await page.click('#weekCal [data-wcal="2026-07-19"]')
        })
      }
    }
    collect('peek ' + t, errors)
    await browser.close()
  }
}

/* ---------------- helpers for the free-position and tap landings ---------------- */
/* move the week sideways the way a trackpad does: a horizontal wheel over a day head (never over a wave block, which
   scrolls its own columns first) — repeated until it rests on the target */
async function wheelTo(page, wk, target) {
  await toTop(page)
  const box = await page.evaluate((wk) => { const w = document.querySelector(wk); const r = w.getBoundingClientRect()
    const h = [...w.querySelectorAll('.day-head')].map(e => e.getBoundingClientRect()).find(b => b.left > 60 && b.right < innerWidth - 60 && b.top > 0)
    return h ? { x: Math.round(h.left + h.width / 2), y: Math.round(h.top + h.height / 2) } : { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + 20) } }, wk)
  await page.mouse.move(box.x, box.y)
  for (let i = 0; i < 8; i++) {
    const sl = await page.evaluate((wk) => document.querySelector(wk).scrollLeft, wk)
    const d = target - sl
    if (Math.abs(d) <= 1) break
    await page.mouse.wheel(d, 0)
    await settle(page, wk, 150)
  }
  return page.evaluate((wk) => Math.round(document.querySelector(wk).scrollLeft), wk)
}
const slOf = (page, wk) => page.evaluate((wk) => Math.round(document.querySelector(wk).scrollLeft), wk)
/* the visible band between the two arrows (or the week box's own edges where no arrow covers it) */
async function band(page, wk) {
  return page.evaluate((wk) => {
    const w = document.querySelector(wk).getBoundingClientRect()
    const shown = (e) => !!e && !e.hidden && e.getBoundingClientRect().width > 0
    const p = document.getElementById('weekPrev'), n = document.getElementById('weekNext')
    const lo = Math.max(w.left, shown(p) ? p.getBoundingClientRect().right : w.left)
    const hi = Math.min(w.right, shown(n) ? n.getBoundingClientRect().left : w.right)
    return { lo: Math.round(lo), hi: Math.round(hi), wl: Math.round(w.left), wr: Math.round(w.right) }
  }, wk)
}
/* a real mouse click on warning item `idx` of day `di`'s opened list, on the part of it that is on screen */
async function clickWarn(page, wk, di, idx) {
  const b = await band(page, wk)
  const p = await page.evaluate(([wk, di, idx, b]) => {
    const it = document.querySelectorAll(`${wk} .day[data-day="${di}"] .dwlist .witem`)[idx]
    if (!it) return null
    let r = it.getBoundingClientRect()
    if (r.top < 70 || r.bottom > innerHeight - 50) { window.scrollBy(0, r.top - innerHeight * 0.35); r = it.getBoundingClientRect() }
    /* never the ✕ at the item's right end (Edit Schedule) — that HIDES the check, it does not jump to it */
    const mute = it.querySelector('.witem-mute')
    const mx = mute ? mute.getBoundingClientRect().left - 6 : r.right
    const x0 = Math.max(r.left, b.lo + 6), x1 = Math.min(r.right, b.hi - 6, mx)
    return x1 - x0 > 8 ? { x: Math.round((x0 + x1) / 2), y: Math.round(r.top + Math.min(14, r.height / 2)), text: it.innerText.replace(/\s+/g, ' ').slice(0, 60) } : { off: true, x0, x1 }
  }, [wk, di, idx, b])
  if (!p || p.off) return p
  await sleep(150)
  await page.mouse.click(p.x, p.y)
  return p
}
async function openList(page, wk, di) {
  const open = await page.evaluate(([wk, di]) => { const l = document.querySelector(`${wk} .day[data-day="${di}"] .dwlist`); return !!(l && l.getBoundingClientRect().width) }, [wk, di])
  if (open) return true
  const b = await band(page, wk)
  const p = await page.evaluate(([wk, di, b]) => { const e = document.querySelector(`${wk} .day[data-day="${di}"] [data-daywarn]`); if (!e) return null; const r = e.getBoundingClientRect()
    const x0 = Math.max(r.left, b.lo + 6), x1 = Math.min(r.right, b.hi - 6); return x1 - x0 > 8 ? { x: Math.round(x0 + Math.min(30, (x1 - x0) / 2)), y: Math.round(r.top + r.height / 2) } : null }, [wk, di, b])
  if (!p) return false
  await page.mouse.click(p.x, p.y); await sleep(350)
  return page.evaluate(([wk, di]) => { const l = document.querySelector(`${wk} .day[data-day="${di}"] .dwlist`); return !!(l && l.getBoundingClientRect().width) }, [wk, di])
}
/* every lit ("wfoc") puck on day di, and whether each is wholly inside the visible band */
async function lit(page, wk, di) {
  const b = await band(page, wk)
  return page.evaluate(([wk, di, b]) => [...document.querySelectorAll(`${wk} .day[data-day="${di}"] .puck.wfoc`)].map(e => { const r = e.getBoundingClientRect()
    return { who: e.dataset.person, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), inBand: r.left >= b.lo - 1 && r.right <= b.hi + 1, inBox: r.left >= b.wl - 1 && r.right <= b.wr + 1, onScreenY: r.top >= 0 && r.bottom <= innerHeight } }), [wk, di, b])
}
async function clearFocus(page) {
  /* teardown only: the focused warning toggles off when it is clicked again */
  await page.evaluate(() => { const on = document.querySelector('.page.on .witem.on'); if (on) on.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  await sleep(250)
  const n = await page.evaluate(() => document.querySelectorAll('.page.on .puck.wfoc').length)
  return n
}
const dayLeft = (page, wk, di) => page.evaluate(([wk, di]) => { const d = document.querySelector(`${wk} .day[data-day="${di}"]`); return d ? Math.round(d.getBoundingClientRect().left) : null }, [wk, di])

/* L9 — a warning tap that has to pan brings its day to the front beside the arrow; one that does not stays put */
SECTIONS.warn = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg); await toTop(page)
      const step = (await measure(page, wk)).step
      /* (a) Monday almost off the left (its list opened at rest first), tap its first warning */
      check(`L9.${t}.${p}.mon.open`, await openList(page, wk, 0), 'Monday\'s issues list opens')
      await wheelTo(page, wk, step - 80)
      await shot(page, `L9-mon-offleft-before-${p}-${t}`)
      let r = await landing(page, wk, async () => { const c = await clickWarn(page, wk, 0, 0); note(`L9.${t}.${p}.mon.tap`, 'tapped', c) })
      let lt = await lit(page, wk, 0)
      check(`L9.${t}.${p}.mon.lit`, lt.length && lt.some(x => x.inBand), 'the tap lit its man on Monday, and he is in view between the arrows', lt)
      assertLanding(`L9.${t}.${p}.mon`, r.m, { expectFront: 'd0', trk: r.trk })
      await shot(page, `L9-mon-tapped-${p}-${t}`)
      await clearFocus(page)
      /* (b) Wednesday hanging half off the right, its list opened, then each of its first two warnings tapped */
      for (const idx of [0, 1]) {
        await toTop(page)
        const b = await band(page, wk)
        const wedAt0 = await page.evaluate(([wk]) => { const w = document.querySelector(wk); const d = w.querySelector('.day[data-day="2"]'); return Math.round(d.getBoundingClientRect().left - w.getBoundingClientRect().left + w.scrollLeft) }, [wk])
        await wheelTo(page, wk, wedAt0 - (b.wr - b.wl - 276))
        check(`L9.${t}.${p}.wed${idx}.open`, await openList(page, wk, 2), 'Wednesday\'s issues list opens with the day half off the right')
        const sl0 = await slOf(page, wk)
        await shot(page, `L9-wed-halfright-before-w${idx}-${p}-${t}`)
        r = await landing(page, wk, async () => { const c = await clickWarn(page, wk, 2, idx); note(`L9.${t}.${p}.wed${idx}.tap`, 'tapped', c) })
        lt = await lit(page, wk, 2)
        const panned = Math.abs(r.m.sl - sl0) > 2
        note(`L9.${t}.${p}.wed${idx}.pan`, panned ? 'the week panned' : 'the week held its sideways position', `${sl0}→${r.m.sl}`)
        check(`L9.${t}.${p}.wed${idx}.lit`, lt.length && lt.every(x => x.inBand), 'every man the warning lights on Wednesday is in view, clear of both arrows', lt)
        if (panned) {
          const wl = await dayLeft(page, wk, 2)
          check(`L9.${t}.${p}.wed${idx}.front`, Math.abs(wl - r.m.want) <= 2, 'a pan lands Wednesday at the front beside the ‹ arrow', `wedLeft=${wl} want=${r.m.want}`)
          check(`L9.${t}.${p}.wed${idx}.nohop`, !r.trk.hop, 'no hop after the pan', r.trk)
        }
        await shot(page, `L9-wed-tapped-w${idx}-${p}-${t}`)
        await clearFocus(page)
      }
    }
    collect('warn ' + t, errors)
    await browser.close()
  }
  /* (c) HOLD THE LATERAL VIEW (owner, 6 Aug 26 — highlights.ts bringIntoView): a warning whose man sits wholly ON
     SCREEN must not pan the week. The branch widened "on screen" to exclude 54px at BOTH edges of the week box. On Edit
     Schedule the › arrow floats over the crew palette, not over the week, so the week's own last 54px are plainly
     visible; on View-only the › arrow's own column starts 8px inside that band. Find a warning that lights exactly ONE
     puck on Wednesday, park that puck wholly visible inside the right-hand band (not under any arrow), tap it. */
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['editsched', 'viewsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg); await toTop(page)
      await press(page, wk, 1); await press(page, wk, 1)
      await openList(page, wk, 2)
      const n = await page.evaluate((wk) => document.querySelectorAll(wk + ' .day[data-day="2"] .dwlist .witem').length, wk)
      let pick = null
      for (let idx = 0; idx < Math.min(n, 7) && !pick; idx++) {
        await toTop(page)
        await clickWarn(page, wk, 2, idx); await settle(page, wk, 400)
        /* the jump's own target is the lit puck it scrolled to the middle of the window (block:'center') — the one the
           lateral check measures; remember it as (man, n-th of his pucks on the day) */
        const tg = await page.evaluate((wk) => { const es = [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck.wfoc')]; if (!es.length) return null
          const mid = innerHeight / 2; let best = null, bd = 1e9
          for (const e of es) { const r = e.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = e } }
          const same = [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck')].filter(e => e.dataset.person === best.dataset.person)
          return { who: best.dataset.person, nth: same.indexOf(best), off: Math.round(bd), n: es.length } }, wk)
        if (tg && tg.off < (pg === 'viewsched' ? 300 : 60)) pick = { idx, ...tg }
        await clearFocus(page)
      }
      if (!pick) { note('L9band.' + t + '.' + p, 'no Wednesday warning whose jump target could be identified; not walked'); continue }
      /* the lone puck's index among his pucks on the day, so it can be found again */
      await toTop(page)
      const b = await band(page, wk)
      const X = pg === 'editsched' ? b.wr - 20 : b.hi - 6
      const tgt = (wk, who, nth) => [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck')].filter(e => e.dataset.person === who)[nth]
      const pr = await page.evaluate(([wk, who, nth]) => { const e = [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck')].filter(e => e.dataset.person === who)[nth]; return { r: Math.round(e.getBoundingClientRect().right) } }, [wk, pick.who, pick.nth])
      const sl = await slOf(page, wk)
      await wheelTo(page, wk, sl + (pr.r - X))
      await openList(page, wk, 2)
      const pos = await page.evaluate(([wk, who, nth, b]) => { const e = [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck')].filter(e => e.dataset.person === who)[nth]; const q = e.getBoundingClientRect()
        const nx = document.getElementById('weekNext'); const nr = nx && !nx.hidden ? nx.getBoundingClientRect() : null
        return { l: Math.round(q.left), r: Math.round(q.right), weekRight: b.wr, inBox: q.left >= b.wl + 54 && q.right <= b.wr, clearOfArrow: !nr || q.right <= nr.left, inRightBand: q.right > b.wr - 54 } }, [wk, pick.who, pick.nth, b])
      const sl0 = await slOf(page, wk)
      await shot(page, 'L9band-before-' + p + '-' + t)
      /* a picture of the man's puck where it sits before the tap: the page scrolled DOWN to it (never sideways) */
      await page.evaluate(([wk, who, nth]) => { const e = [...document.querySelectorAll(wk + ' .day[data-day="2"] .puck')].filter(e => e.dataset.person === who)[nth]; window.scrollBy(0, e.getBoundingClientRect().top - innerHeight / 2) }, [wk, pick.who, pick.nth])
      await sleep(250)
      check('L9band.' + t + '.' + p + '.still', (await slOf(page, wk)) === sl0, 'scrolling the page down to look did not move the week sideways')
      await shot(page, 'L9band-before-target-' + p + '-' + t)
      await toTop(page)
      const r = await landing(page, wk, async () => { await clickWarn(page, wk, 2, pick.idx) })
      const after = await lit(page, wk, 2)
      note('L9band.' + t + '.' + p + '.setup', 'the puck the jump aims at, before the tap (wholly visible, clear of the › arrow, inside the right-hand 54px)', { pick, pos, sl0 })
      if (pos.inBox && pos.clearOfArrow && pg === 'viewsched') note('L9band.' + t + '.' + p, Math.abs(r.m.sl - sl0) <= 2 ? 'OBSERVATION — held' : 'OBSERVATION — on View-only a man whose puck ends a few px short of the › arrow, at any height, still counts as out of view: the week pans', 'sl ' + sl0 + '→' + r.m.sl)
      else if (pos.inBox && pos.clearOfArrow) check('L9band.' + t + '.' + p, Math.abs(r.m.sl - sl0) <= 2, 'a warning whose man is wholly on screen and clear of both arrows does not pan the week (HOLD THE LATERAL VIEW, owner 6 Aug 26)', 'sl ' + sl0 + '→' + r.m.sl + '; after=' + JSON.stringify(after))
      else note('L9band.' + t + '.' + p, 'could not park the puck wholly visible and clear of the arrow', pos)
      await shot(page, 'L9band-after-' + p + '-' + t)
      await clearFocus(page)
    }
    collect('warnband ' + t, errors)
    await browser.close()
  }
}

/* L10 "take me to this change" from the pending list, L15 the 👁 look, L14 an edit and its Undo — on a published
   Friday made through the app's own controls (sign the four, Publish day, then one change) */
SECTIONS.pend = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    const wk = '#eWeek'
    await go(page, 'editsched')
    const signed = await L.signDay(page, 4)
    const pub = await L.publishDay(page, 4)
    note(`L10.${t}.publish`, 'Friday signed and published through its own controls', { signed, pub })
    await L.editText(page, 'ap:4.0.rmks', 'W4 ARROW CHECK')
    const h = await L.head(page, 4)
    check(`L10.${t}.pending`, /pending/i.test(h?.pending || ''), 'Friday reads pending after one change on the published day', h?.pending)
    /* Friday half off the right of the week */
    await toTop(page)
    const b = await band(page, wk)
    const friAt0 = await page.evaluate(() => { const w = document.querySelector('#eWeek'); const d = w.querySelector('.day[data-day="4"]'); return Math.round(d.getBoundingClientRect().left - w.getBoundingClientRect().left + w.scrollLeft) })
    await wheelTo(page, wk, friAt0 - (b.wr - b.wl - 276))
    const chip = await page.evaluate((b) => { const e = document.querySelector('#eWeek .day[data-day="4"] [data-pendlist]'); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), y: Math.round(r.top + r.height / 2), vis: r.left >= b.lo && r.right <= b.hi } }, b)
    note(`L10.${t}.chip`, 'the "N pending" chip with Friday half off the right', chip)
    await shot(page, `L10-fri-halfright-before-${t}`)
    if (chip && chip.vis) {
      await page.mouse.click(Math.round((chip.l + chip.r) / 2), chip.y); await sleep(400)
      const rows = await page.evaluate(() => [...document.querySelectorAll('#pendList [data-plix]')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 60)))
      check(`L10.${t}.list`, rows.length >= 1, 'the pending list opens with the change in it', rows)
      /* the pop-up against the ‹ arrow: what is at the list's left edge, at the arrow's height */
      const pop = await page.evaluate(() => { const p = document.getElementById('pendList'); if (!p) return null; const r = p.getBoundingClientRect(); const a = document.getElementById('weekPrev').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), overlapsPrev: r.left < a.right && r.right > a.left && r.top < a.bottom && r.bottom > a.top } })
      note(`L10.${t}.popup`, 'the pending-list pop-up against the ‹ arrow', pop)
      await shot(page, `L10-pendlist-open-${t}`)
      const sl0 = await slOf(page, wk)
      const r = await landing(page, wk, async () => { const it = await page.evaluate(() => { const e = document.querySelector('#pendList [data-plix]'); const r = e.getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 } }); await page.mouse.click(it.x, it.y) }, 900)
      const cell = await page.evaluate((b) => { const e = document.querySelector('#eWeek [data-txt="ap:4.0.rmks"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), inBand: r.left >= b.lo - 1 && r.right <= b.hi + 1, onY: r.top >= 0 && r.bottom <= innerHeight } }, await band(page, wk))
      const panned = Math.abs(r.m.sl - sl0) > 2
      note(`L10.${t}.pan`, panned ? 'the jump panned the week' : 'the jump held the week', `${sl0}→${r.m.sl}`)
      check(`L10.${t}.cell`, cell && cell.inBand && cell.onY, 'the changed cell is in front of the reader, clear of both arrows', cell)
      if (panned) {
        const fl = await dayLeft(page, wk, 4)
        check(`L10.${t}.front`, Math.abs(fl - r.m.want) <= 2, '"take me to this change" lands Friday at the front beside the ‹ arrow', `friLeft=${fl} want=${r.m.want}`)
        check(`L10.${t}.nohop`, !r.trk.hop, 'no hop after the jump', r.trk)
      }
      await shot(page, `L10-jumped-${t}`)
    } else check(`L10.${t}.chipvis`, false, 'the pending chip is on screen with Friday half off the right', chip)
    /* L15 — the 👁 look at the issued version holds the week where it is, then back to the live copy */
    await toTop(page)
    const slA = await slOf(page, wk)
    const pm = await page.evaluate(() => { const e = document.querySelector('#eWeek [data-planmenu="4"]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.left > 50 && r.right < innerWidth - 50 && r.top > 0 } })
    if (pm.vis) {
      await page.mouse.click(pm.x, pm.y); await sleep(450)
      const r = await landing(page, wk, async () => { const it = await page.evaluate(() => { const e = [...document.querySelectorAll('.wm[data-planpv]')].find(x => x.offsetWidth); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2, text: e.innerText.replace(/\s+/g, ' ') } }); note(`L15.${t}.item`, 'the issued version picked', it); if (it) await page.mouse.click(it.x, it.y) })
      const lab = await page.evaluate(() => (document.querySelector('#eWeek [data-planmenu="4"]') || {}).innerText || '')
      check(`L15.${t}.look`, /👁/.test(lab), 'Friday shows the 👁 issued version', lab.replace(/\s+/g, ' '))
      check(`L15.${t}.holds`, Math.abs(r.m.sl - slA) <= 2, 'the 👁 look holds the week where it was', `${slA}→${r.m.sl}`)
      assertLanding(`L15.${t}`, r.m, { trk: r.trk, expectInset: Math.abs(((await dayLeft(page, wk, 4)) - r.m.want)) <= 2 })
      await shot(page, `L15-eye-look-${t}`)
      /* back to the live copy */
      const pm2 = await page.evaluate(() => { const e = document.querySelector('#eWeek [data-planmenu="4"]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      await page.mouse.click(pm2.x, pm2.y); await sleep(450)
      const back = await page.evaluate(() => { const e = [...document.querySelectorAll('.wm[data-plangolive], .wm')].find(x => x.offsetWidth && (x.dataset.plangolive != null || /live/i.test(x.innerText))); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 } })
      if (back) { await page.mouse.click(back.x, back.y); await sleep(500) }
      const slB = await slOf(page, wk)
      check(`L15.${t}.backholds`, Math.abs(slB - slA) <= 2, 'back to the live copy, the week still holds', `${slA}→${slB}`)
    } else note(`L15.${t}`, 'the plan menu button was not on screen', pm)
    /* L14 — an edit on a cell in view and its Undo hold the week's position */
    await toTop(page)
    const fl = await dayLeft(page, wk, 4)
    const slE = await slOf(page, wk)
    const cellVis = await page.evaluate((b) => { const e = document.querySelector('#eWeek [data-txt="ap:4.1.rmks"]'); const r = e.getBoundingClientRect(); return r.left >= b.lo && r.right <= b.hi }, await band(page, wk))
    if (cellVis) {
      let r = await landing(page, wk, async () => {
        const c = await page.evaluate(() => { const e = document.querySelector('#eWeek [data-txt="ap:4.1.rmks"]'); const r = e.getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 } })
        await page.mouse.click(c.x, c.y); await page.keyboard.type('W4 EDIT', { delay: 8 }); await page.evaluate(() => document.activeElement && document.activeElement.blur())
      })
      check(`L14.${t}.edit`, Math.abs(r.m.sl - slE) <= 2, 'an edit on the day at the front holds the week where it was', `${slE}→${r.m.sl}`)
      r = await landing(page, wk, async () => { await page.click('#undoBtn') })
      check(`L14.${t}.undo`, Math.abs(r.m.sl - slE) <= 2, 'Undo holds the week where it was', `${slE}→${r.m.sl}; friLeft ${fl}→${await dayLeft(page, wk, 4)}`)
      await shot(page, `L14-edit-undo-holds-${t}`)
    } else note(`L14.${t}`, 'the cell to edit was not wholly on screen', { fl, slE })
    collect('pend ' + t, errors)
    await browser.close()
  }
}

/* L11 the palette's day arrows never scroll the week; L12 free positions (proxy drag, shift+wheel) then a press parks at
   the room; a carry from a free position; the previous day's tail in the gutter (a close-up) */
SECTIONS.misc = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    /* L11 */
    await go(page, 'editsched'); await toTop(page)
    await press(page, '#eWeek', 1)
    const sl0 = await slOf(page, '#eWeek')
    const hd0 = await page.evaluate(() => (document.querySelector('.eroster .er-h') || {}).innerText || '')
    for (const dir of [1, 1, -1]) {
      await page.click(`.er-daynav[data-crewstep="${dir}"]`); await sleep(400)
    }
    const hd1 = await page.evaluate(() => (document.querySelector('.eroster .er-h') || {}).innerText || '')
    const sl1 = await slOf(page, '#eWeek')
    check(`L11.${t}.palette`, hd1 !== hd0, 'the palette\'s ‹ › day arrows step the palette\'s day', `${hd0} → ${hd1}`)
    check(`L11.${t}.noscroll`, sl1 === sl0, 'the palette\'s day arrows never scroll the week', `${sl0}→${sl1}`)
    await shot(page, `L11-palette-daynav-${t}`)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg); await toTop(page)
      const step = (await measure(page, wk)).step
      /* L12a — a trackpad pan (a horizontal wheel over a day head). The proxy bar's native thumb cannot be dragged here:
         headless Chromium draws no scrollbars, so there is no thumb to grab (named in the parts file as not walked) */
      await wheelTo(page, wk, 0)
      await wheelTo(page, wk, Math.round(1.24 * step))
      let m = await measure(page, wk)
      note(`L12.${t}.${p}.drag`, 'a trackpad pan leaves the week at a free position (no snap on desktop)', `sl=${m.sl} (step ${step}; ${(m.sl / step).toFixed(2)} days) front=${m.front} left=${m.frontL}`)
      await shot(page, `L12-trackpad-free-${p}-${t}`)
      const at = m.sl / step
      let r = await press(page, wk, 1)
      const expd = Math.max(0, Math.min(6, Math.floor(at + 0.35) + 1))
      assertLanding(`L12.${t}.${p}.dragThenNext`, r.m, { expectFront: 'd' + expd, trk: r.trk })
      await shot(page, `L12-trackpad-then-next-${p}-${t}`)
      /* the proxy bar's own ‹ › buttons (at its two ends) land like the floating arrows */
      for (const [id, dir] of [['hsR', 1], ['hsL', -1]]) {
        const before = await slOf(page, wk)
        const exp = Math.max(0, Math.min(6, Math.round(before / step) + dir))
        r = await landing(page, wk, async () => { await page.click('#' + id) }, 650)
        assertLanding(`L12.${t}.${p}.${id}`, r.m, { expectFront: 'd' + exp, trk: r.trk })
      }
      await shot(page, `L12-proxy-arrows-${p}-${t}`)
      /* L12b — shift + wheel (a mouse wheel turned sideways) over a day head to another free position, then ‹ */
      await toTop(page)
      const hp = await page.evaluate((wk) => { const h = [...document.querySelectorAll(wk + ' .day-head')].map(e => e.getBoundingClientRect()).find(b => b.left > 60 && b.right < innerWidth - 60 && b.top > 0); return h ? { x: h.left + h.width / 2, y: h.top + h.height / 2 } : { x: 600, y: 300 } }, wk)
      await page.mouse.move(hp.x, hp.y)
      await page.keyboard.down('Shift'); await page.mouse.wheel(0, 700); await page.keyboard.up('Shift')
      await settle(page, wk, 400)
      m = await measure(page, wk)
      note(`L12.${t}.${p}.shiftwheel`, 'shift+wheel moves the week to a free position', `sl=${m.sl} (${(m.sl / step).toFixed(2)} days) front=${m.front} left=${m.frontL}`)
      const at2 = m.sl / step
      r = await press(page, wk, -1)
      const expb = Math.max(0, Math.ceil(at2 - 0.35) - 1)
      assertLanding(`L12.${t}.${p}.wheelThenPrev`, r.m, { expectFront: 'd' + expb, trk: r.trk })
      await shot(page, `L12-shiftwheel-then-prev-${p}-${t}`)
      /* a carry from a free position: the day nearest the room at the front is the one carried, and it lands AT the room */
      await wheelTo(page, wk, Math.round(2.3 * step))
      const other = pg === 'viewsched' ? 'editsched' : 'viewsched'
      r = await landing(page, WK[other], () => go(page, other))
      assertLanding(`L6free.${t}.${p}to${other === 'viewsched' ? 'view' : 'edit'}`, r.m, { expectFront: 'd2', trk: r.trk })
      await shot(page, `L6-free-carry-${p}-${t}`)
    }
    /* the previous day's tail in the gutter beside the ‹ arrow, at an arrow landing */
    await go(page, 'viewsched'); await toTop(page)
    await wheelTo(page, '#vWeek', 0)
    await press(page, '#vWeek', 1); await press(page, '#vWeek', 1)
    const tail = await page.evaluate(() => { const w = document.querySelector('#vWeek'); const wr = w.getBoundingClientRect(); const d1 = w.querySelector('.day[data-day="1"]').getBoundingClientRect(); const d2 = w.querySelector('.day[data-day="2"]').getBoundingClientRect(); const a = document.getElementById('weekPrev').getBoundingClientRect()
      return { prevDayRight: Math.round(d1.right), shows: Math.round(Math.max(0, d1.right - wr.left)), frontLeft: Math.round(d2.left), arrow: [Math.round(a.left), Math.round(a.right)] } })
    note(`GUTTER.${t}`, 'the day BEFORE the front day shows a strip in the gutter beside the ‹ arrow (on main the strip was 20 − 12 = 8px; now 54 − 12 = 42px)', tail)
    await page.screenshot({ path: `${SH}/GUTTER-prevday-tail-view-${t}.png`, clip: { x: 0, y: 100, width: 360, height: vp.height - 140 } })
    collect('misc ' + t, errors)
    await browser.close()
  }
}

/* F19 — every edge-docked control measured against what it covers; the › arrow clickable on both pages */
SECTIONS.edge = async () => {
  for (const vp of [DESK, SHORT, WIDE]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    for (const pg of ['viewsched', 'editsched']) {
      const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg); await toTop(page)
      for (const pos of ['rest', 'wed', 'sun']) {
        if (pos === 'wed') { await press(page, wk, 1); await press(page, wk, 1) }
        if (pos === 'sun') { for (let i = 0; i < 4; i++) await press(page, wk, 1) }
        const e = await page.evaluate((wk) => {
          const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) } }
          const nm = (el) => el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ').slice(0, 2).join('.')) : null
          const under = (x, y) => document.elementsFromPoint(x, y).slice(0, 6).map(el => { const d = el.closest && el.closest('.day'); return nm(el) + (d ? `[${d.dataset.day != null ? 'd' + d.dataset.day : 'peek' + d.dataset.peekDay}]` : '') })
          const prev = document.getElementById('weekPrev'), next = document.getElementById('weekNext')
          const pr = r(prev), nr = r(next)
          const pc = [Math.round((pr.l + pr.r) / 2), Math.round((pr.t + pr.b) / 2)], nc = [Math.round((nr.l + nr.r) / 2), Math.round((nr.t + nr.b) / 2)]
          const top = document.elementFromPoint(nc[0], nc[1]), topP = document.elementFromPoint(pc[0], pc[1])
          const rail = document.querySelector('.page.on .ros-rail') || document.querySelector('.ros-rail')
          const railR = rail && rail.offsetParent !== null ? r(rail) : null
          const ov = (a, b) => !!(a && b && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t)
          const tb = document.querySelector('.topbar'), bar = document.getElementById('hscroll')
          return { prevTop: nm(topP), prevIsTop: !!(topP && topP.closest('#weekPrev')), underPrev: under(pc[0], pc[1]),
            nextTop: nm(top), nextIsTop: !!(top && top.closest('#weekNext')), underNext: under(nc[0], nc[1]),
            rail: railR, railOverNext: ov(railR, nr), topbar: r(tb), topbarOverPrev: ov(r(tb), pr), bar: bar && bar.classList.contains('on') ? r(bar) : null, barOverArrows: ov(bar && r(bar), pr) || ov(bar && r(bar), nr) }
        }, wk)
        check(`F19.${t}.${p}.${pos}.prevtop`, e.prevIsTop, 'the ‹ arrow is the top thing at its own centre (clickable)', e.prevTop)
        check(`F19.${t}.${p}.${pos}.nexttop`, e.nextIsTop, 'the › arrow is the top thing at its own centre (clickable; the rail never over it)', { top: e.nextTop, rail: e.rail, railOverNext: e.railOverNext })
        check(`F19.${t}.${p}.${pos}.chrome`, !e.topbarOverPrev && !e.barOverArrows, 'the sticky top bar and the proxy bar never cover an arrow', { topbar: e.topbar, bar: e.bar })
        note(`F19.${t}.${p}.${pos}.underPrev`, 'what lies under the ‹ arrow (should be the gutter, not the front day)', e.underPrev)
        note(`F19.${t}.${p}.${pos}.underNext`, 'OBSERVATION — what lies under the › arrow', e.underNext)
        await shot(page, `F19-edges-${pos}-${p}-${t}`)
      }
      /* does the ‹ arrow sit over any part of the FRONT day at any vertical scroll? walk the page down in screens */
      await go(page, pg); await toTop(page)
      await press(page, wk, 1)
      const cover = await page.evaluate(async (wk) => {
        const out = []
        const a = document.getElementById('weekPrev').getBoundingClientRect()
        const H = document.documentElement.scrollHeight
        for (let y = 0; y < H; y += Math.round(innerHeight * 0.6)) {
          window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
          const w = document.querySelector(wk); const d = [...w.querySelectorAll('.day')].find(x => x.getBoundingClientRect().right > a.right + 100)
          const els = document.elementsFromPoint(a.right - 2, a.top + a.height / 2)
          const frontUnder = els.some(el => el.closest && el.closest('.day') === d)
          out.push({ y, frontUnder })
        }
        window.scrollTo(0, 0)
        return out
      }, wk)
      check(`F19.${t}.${p}.prevNeverOverFront`, cover.every(c => !c.frontUnder), 'down the whole page, the ‹ arrow never sits over the front day', cover.filter(c => c.frontUnder))
    }
    collect('edge ' + t, errors)
    await browser.close()
  }
}

/* F19 — the ALL AVAIL window's default dock against the arrows (a placeholder planted on a weekend desk through the
   palette, its window opened from the puck's count chip) */
SECTIONS.availwin = async () => {
  for (const vp of [DESK, SHORT]) {
    const t = tagOf(vp)
    const { browser, page, errors } = await world(vp)
    await go(page, 'editsched')
    /* Saturday to the front through the calendar, arm its duty desk's "+ ADD", tap ALL AVAIL in the crew palette */
    const cal = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .wk-cal')].find(x => x.offsetWidth); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await page.mouse.click(cal.x, cal.y); await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]'); await page.click('#weekCal [data-wcal="2026-07-18"]'); await sleep(700)
    const add = await page.evaluate(() => { const z = document.querySelector('#eWeek [data-fill="d:5.0.0.+"]'); if (!z) return null
      const kids = [...z.querySelectorAll('*')].filter(e => /ADD/i.test(e.textContent || '') && !e.querySelector('*'))
      const el = kids[kids.length - 1] || z; el.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tag: el.tagName + '.' + el.className } })
    let planted = false
    if (add) {
      await sleep(200); await page.mouse.click(add.x, add.y); await sleep(400)
      const armed = await page.evaluate(() => window.ARM && window.ARM.key)
      const pk = await page.evaluate(() => { const e = document.querySelector('#eRoster .rpuck[data-person="allavail"]'); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      if (pk) { await sleep(200); await page.mouse.click(pk.x, pk.y); await sleep(600) }
      planted = await page.evaluate(() => !!document.querySelector('#eWeek .day[data-day="5"] [data-person="allavail"]'))
      note(`AW.${t}.plant`, 'ALL AVAIL dropped onto the Saturday duty desk extras through the palette', { add, armed, planted })
    } else note(`AW.${t}.plant`, 'no + ADD on the Saturday desk')
    for (const pg of ['editsched', 'viewsched']) {
      const p = pg === 'viewsched' ? 'view' : 'edit'
      await go(page, pg)
      const chip = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on [data-oilsent]')].find(x => x.offsetWidth); if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'nearest' }); return true })
      if (!chip) { note(`AW.${t}.${p}`, 'no ALL AVAIL count chip on the week to open the window from; not walked'); continue }
      await sleep(400)
      const c = await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on [data-oilsent]')].find(x => x.offsetWidth); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      await page.mouse.click(c.x, c.y); await sleep(600)
      const e = await page.evaluate(() => {
        const w = document.querySelector('.availwin:not([hidden])'); if (!w) return null
        const r = w.getBoundingClientRect(), n = document.getElementById('weekNext').getBoundingClientRect(), pv = document.getElementById('weekPrev').getBoundingClientRect()
        const top = document.elementFromPoint(Math.round((n.left + n.right) / 2), Math.round((n.top + n.bottom) / 2))
        return { win: { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) }, overNext: r.left < n.right && r.right > n.left && r.top < n.bottom && r.bottom > n.top,
          overPrev: r.left < pv.right && r.right > pv.left && r.top < pv.bottom && r.bottom > pv.top, nextCentre: top ? (top.closest('#weekNext') ? 'the › arrow' : top.closest('.availwin') ? 'the ALL AVAIL window' : top.tagName) : null }
      })
      if (!e) { note(`AW.${t}.${p}`, 'the window did not open from the chip'); continue }
      check(`AW.${t}.${p}.prev`, !e.overPrev, 'the ALL AVAIL window never sits over the ‹ arrow', e)
      note(`AW.${t}.${p}.next`, 'OBSERVATION — the ALL AVAIL window at its default dock against the › arrow', e)
      await shot(page, `AW-window-vs-arrows-${p}-${t}`)
      await page.keyboard.press('Escape'); await sleep(200)
    }
    collect('availwin ' + t, errors)
    await browser.close()
  }
}

/* F19 — the resize crossing 1440 → 780 → 1440 without a reload */
SECTIONS.resize = async () => {
  const { browser, page, errors } = await world(DESK)
  for (const pg of ['viewsched', 'editsched']) {
    const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
    await go(page, pg); await toTop(page)
    await press(page, wk, 1); await press(page, wk, 1)
    await page.setViewportSize({ width: 780, height: 900 }); await sleep(700)
    let m = await measure(page, wk)
    check(`RS.${p}.780`, !m.prev && !m.next && m.inset === 0 && m.padL !== '54px', 'at 780 (a phone layout): no arrows, no room kept, the phone\'s own padding', { prev: m.prev, next: m.next, padL: m.padL, spL: m.spL, inset: m.inset })
    await shot(page, `RS-780-${p}`)
    await page.setViewportSize(DESK); await sleep(700)
    m = await measure(page, wk)
    check(`RS.${p}.back`, m.prev && m.next && m.inset === 54 && m.padL === '54px', 'back at 1440: the arrows and the room come back', { prev: m.prev, padL: m.padL, spL: m.spL })
    note(`RS.${p}.backfront`, 'where the front day sits straight after the round trip (no press yet)', `front=${m.front} left=${m.frontL} want=${m.want} sl=${m.sl}`)
    /* a resize never re-lands the week (pan.ts onResize only redraws the arrows and the preview; nothing in this change
       touches it), so the week keeps whatever scroll the phone layout left — the same on main by construction. Recorded,
       and the next press must park at the room (below) */
    note(`RS.${p}.backclear`, (m.frontL >= m.prev.r + 4 ? 'the front day is clear of the ‹ arrow' : 'OBSERVATION — straight after the round trip a day sits partly under the ‹ arrow until the next press'), `left=${m.frontL}`)
    await shot(page, `RS-back-1440-${p}`)
    const r = await press(page, wk, 1)
    assertLanding(`RS.${p}.press`, r.m, { trk: r.trk })
    await shot(page, `RS-back-1440-press-${p}`)
  }
  collect('resize', errors)
  await browser.close()
}

/* F9 — the phone is untouched: no room kept, no arrows; one swipe crosses each way; a within-week swipe steps a day */
SECTIONS.phone = async () => {
  const { browser, ctx, page, errors } = await world(PHONE)
  const cdp = await ctx.newCDPSession(page)
  const swipe = async (x, y, dx, steps = 10, gap = 16) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 7 }] })
    for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y, id: 7 }] }); await sleep(gap) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  const toMonday = async () => {
    await toTop(page)
    await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .filt-cal, .page.on .wknav-mbtn')].find(x => x.offsetWidth); e && e.click() })
    await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]')
    await page.click('#weekCal [data-wcal="2026-07-13"]'); await sleep(900)
  }
  const frontNow = async () => { await settle(page, '#vWeek', 400); return page.evaluate(() => { const w = document.querySelector('#vWeek'); const ds = [...w.querySelectorAll('.day[data-day]')]; const f = ds.find(d => d.getBoundingClientRect().right > 60); return { week: window.CURWEEK, sl: Math.round(w.scrollLeft), front: f && f.dataset.day, frontLeft: f && Math.round(f.getBoundingClientRect().left) } }) }
  for (const pg of ['viewsched', 'editsched']) {
    const wk = WK[pg], p = pg === 'viewsched' ? 'view' : 'edit'
    await go(page, pg); await toTop(page)
    const g = await page.evaluate((wk) => { const w = document.querySelector(wk); const cs = getComputedStyle(w); const d = w.querySelector('.day[data-day="0"]'); const pv = document.getElementById('weekPrev')
      return { padL: cs.paddingLeft, spL: cs.scrollPaddingLeft, monFromWeek: Math.round(d.getBoundingClientRect().left - w.getBoundingClientRect().left + w.scrollLeft), sl: Math.round(w.scrollLeft), arrowShown: !!(pv && !pv.hidden && getComputedStyle(pv).display !== 'none' && pv.getBoundingClientRect().width), vw: innerWidth } }, wk)
    check(`F9.${p}.gutter`, g.padL === '12px' && (g.spL === 'auto' || g.spL === '0px') && !g.arrowShown, 'the phone keeps its own 12px padding, no room for arrows, no arrows drawn', g)
    await shot(page, `F9-phone-rest-${p}`)
  }
  /* View-only: swipe right on Monday → previous week's Sunday in ONE swipe */
  await go(page, 'viewsched'); await toTop(page)
  const wk = '#vWeek'
  const w0 = await page.evaluate(() => window.CURWEEK)
  const headY = await page.evaluate(() => { const h = document.querySelector('#vWeek .day[data-day="0"] .day-head').getBoundingClientRect(); return Math.round(h.top + h.height / 2) })
  /* sample the glide's clones while it runs */
  await page.evaluate(() => { window.__cl = []; window.__clOn = true; const f = () => { if (!window.__clOn) return; const cs = [...document.body.children].filter(e => e.classList && e.classList.contains('week') && e.style.position === 'fixed'); if (cs.length) window.__cl.push(cs.map(c => Math.round(c.getBoundingClientRect().height))); requestAnimationFrame(f) }; requestAnimationFrame(f) })
  await swipe(200, headY, 160)
  await sleep(1400)
  const cl = await page.evaluate(() => { window.__clOn = false; return window.__cl })
  let s = await page.evaluate((wk) => { const w = document.querySelector(wk); const max = w.scrollWidth - w.clientWidth; return { week: window.CURWEEK, sl: Math.round(w.scrollLeft), max, h: Math.round(w.getBoundingClientRect().height) } }, wk)
  check(`F9.back1`, s.week !== w0 && Math.abs(s.sl - s.max) <= 24, 'ONE swipe right on Monday crosses to the previous week and lands on its Sunday', { from: w0, ...s })
  note(`F9.clones`, 'the glide\'s two clones, heights per frame (the taller of the two weeks)', { frames: cl.length, first: cl[0], last: cl[cl.length - 1] })
  await shot(page, `F9-phone-swipe-back-sunday`)
  /* swipe left on that Sunday → the demo week's Monday in ONE swipe */
  const headY2 = await page.evaluate(() => { const h = [...document.querySelectorAll('#vWeek .day[data-day="6"] .day-head')][0].getBoundingClientRect(); return Math.round(h.top + h.height / 2) })
  await swipe(200, headY2, -160)
  await sleep(1400)
  s = await page.evaluate((wk) => { const w = document.querySelector(wk); return { week: window.CURWEEK, sl: Math.round(w.scrollLeft), monLeft: Math.round(w.querySelector('.day[data-day="0"]').getBoundingClientRect().left) } }, wk)
  check(`F9.fwd1`, s.week === w0 && s.sl <= 24, 'ONE swipe left on Sunday crosses forward and lands on Monday', s)
  check(`F9.fwd1.gutter`, s.monLeft >= 0 && s.monLeft <= 14, 'Monday sits at the phone\'s own 12px, no wider gutter', s)
  await shot(page, `F9-phone-swipe-fwd-monday`)
  /* an ordinary within-week swipe that starts on a wave block of wave-dense Monday */
  await toMonday()
  const goY = await page.evaluate(() => { const g = document.querySelector('#vWeek .day[data-day="0"] .go'); if (!g) return null; g.scrollIntoView({ block: 'center' }); const r = g.getBoundingClientRect(); return Math.round(r.top + 20) })
  await sleep(300)
  if (goY != null) {
    await swipe(300, goY, -220, 20, 25)
    await sleep(600)
    s = await frontNow()
    note(`F9.within`, 'a within-week swipe that starts on a wave block (the block scrolls its own columns first, or the week moves — never a week cross)', s)
    /* the no-cross half is the promise; WHERE an emulated fling comes to rest is not reliable in headless Chromium
       (the same swipe rested on a whole day in one run and between two days in the next) — recorded for the iPhone card */
    check(`F9.within.nocross`, s.week === w0, 'a within-week swipe never crosses the week', s)
    note(`F9.within.rest`, Math.abs(s.frontLeft) <= 14 ? 'rested on a whole day, flush at the phone edge' : 'OBSERVATION (emulated touch) — rested BETWEEN two days', s)
    await shot(page, `F9-phone-swipe-within`)
  } else note('F9.within', 'no wave block on Monday found')
  /* an ordinary within-week swipe that starts on the day head (no wave block to own it), at a person's pace */
  await toMonday()
  const hy = await page.evaluate(() => { const h = document.querySelector('#vWeek .day[data-day="0"] .day-head').getBoundingClientRect(); return Math.round(h.top + h.height / 2) })
  await swipe(300, hy, -250, 20, 25)
  await sleep(600)
  s = await frontNow()
  note('F9.withinHead.where', 'where a paced within-week swipe from Monday came to rest (the owner kept the swipe free to travel more than a day)', s)
  check('F9.withinHead', s.week === w0 && s.sl > 20, 'a within-week swipe on the head of Monday moves the week on, and never crosses it', s)
  note('F9.withinHead.rest', Math.abs(s.frontLeft) <= 14 ? 'rested on a whole day, flush at the phone edge' : 'OBSERVATION (emulated touch) — rested BETWEEN two days', s)
  await shot(page, 'F9-phone-swipe-within-head')
  /* the calendar on the phone lands the day at the phone's own padding */
  await toTop(page)
  await page.evaluate(() => { const e = [...document.querySelectorAll('.page.on .filt-cal, .page.on .wknav-mbtn')].find(x => x.offsetWidth); e && e.click() })
  await page.waitForSelector('#weekCal:not([hidden]) [data-wcal]')
  await page.click('#weekCal [data-wcal="2026-07-16"]'); await sleep(900)
  s = await page.evaluate((wk) => { const w = document.querySelector(wk); const d = w.querySelector('.day[data-day="3"]'); return { thuLeft: Math.round(d.getBoundingClientRect().left), wl: Math.round(w.getBoundingClientRect().left) } }, wk)
  check(`F9.cal`, s.thuLeft - s.wl >= 0 && s.thuLeft - s.wl <= 14, 'a calendar pick on the phone lands Thursday at the phone\'s own 12px (no 54px room)', s)
  await shot(page, `F9-phone-cal-thu`)
  collect('phone', errors)
  await browser.close()
}

const want = process.argv.slice(2)
const order = ['probe', 'arrows', 'chips', 'cal', 'carry', 'board', 'peek', 'warn', 'pend', 'misc', 'edge', 'availwin', 'resize', 'phone']
for (const s of (want.length ? want : order.filter(x => x !== 'probe'))) {
  if (!SECTIONS[s]) { out('no section ' + s); continue }
  out(`\n===== ${s} =====`)
  try { await SECTIONS[s]() } catch (e) { check(`${s}.crash`, false, 'the section ran to the end', e.stack || String(e)) }
}
const f = ROWS.filter(r => r.ok === false)
out(`\nSUMMARY ${ROWS.filter(r => r.ok).length} pass · ${f.length} fail · ${ROWS.filter(r => r.ok === null).length} notes${f.length ? ' · FAILS: ' + f.map(r => r.id).join(', ') : ''}`)
out(`ERRORS SEEN: ${ERRS.length ? JSON.stringify(ERRS) : 'none'}`)
process.exit(0)
