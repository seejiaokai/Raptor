// The schedule leftovers' WALK (2 Nov 26, pull request 620): four older finds on Edit Schedule, walked on the BUILT app
// (vite preview of dist) with a real mouse and real fingers (CDP touches), against the bug-check order's §7.11 lessons.
//   D  his PC, 1536 × 730 at 1.25 — the week: a puck let go over nothing (its note, Undo, Redo); the crew panel during a
//      drag scrolled part-way and at the page's foot; ALL AVAIL carried from the panel onto a lower row; the panel hidden;
//      the board's own crew list; the look at the Original beside the working copy (its count, Load, Keep editing, Back).
//   P  an iPhone held upright, 402 × 874 — the board: a seat puck let go over nothing (a picture right after the lift);
//      the week: a crew-drawer puck carried to the foot scrolls the page.
//   S  a phone on its side, 844 × 390 — the board: a crew-list puck held at the top of the pane scrolls the pane, slowly
//      and as a quick flick; a seat puck carried past the pane's top into the bar goes on scrolling it; a crew-list puck
//      dropped on a row lands.
// Usage: node scripts/handpass/sched-leftovers-walk.mjs [port]   (pictures → docs/img/handpass/2026-11-02-schedule-leftovers/walk)
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const ONLY = process.env.ONLY || ''
/* a run of only some steps writes to its own folder and never empties the whole run's (skill-observations 771) */
const OUT = path.resolve(here, '../../docs/img/handpass/2026-11-02-schedule-leftovers', process.env.WALK_OUT || 'walk', ONLY ? `only-${ONLY}` : '')
if (!ONLY) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4180'
const rows = []
const rec = (name, ok, said, pics = []) => { rows.push({ name, result: ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL'}  ${name}  ${said}`) }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function open(viewport, opts = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: opts.dpr || 1.25, isMobile: !!opts.touch, hasTouch: !!opts.touch })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  const cdp = opts.touch ? await ctx.newCDPSession(page) : null
  return { browser, ctx, page, errs, cdp }
}
const shot = (page, name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) }).then(() => name + '.png')
const mark = (page, ring, label, lx, ly) => page.evaluate(([g, t, x, y]) => {
  const m = document.createElement('div'); m.className = 'pic-mark'
  m.innerHTML = `<div style="position:fixed;left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border:3px solid #ffb020;border-radius:10px;box-shadow:0 0 0 2px rgba(0,0,0,.6)"></div>`
    + `<div style="position:fixed;left:${x}px;top:${y}px;max-width:330px;padding:7px 10px;background:#ffb020;color:#111;font:600 13px/1.35 system-ui,sans-serif;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.6)">${t}</div>`
  Object.assign(m.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 99999 })
  document.body.appendChild(m)
}, [ring, label, lx, ly])
const unmark = (page) => page.evaluate(() => document.querySelectorAll('.pic-mark').forEach(n => n.remove()))
const toastNow = (page) => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent.trim() : '' })
const csOf = (page, id) => page.evaluate(i => (window.PEOPLE[i] && window.PEOPLE[i].cs) || i, id)
/* a seat puck in view inside `root`, with a man on it */
const seatIn = (page, root, minTop = 90) => page.evaluate(([r, mt]) => {
  const s = [...document.querySelectorAll(`${r} .seat[data-slot][data-drag]`)].map(e => ({ e, b: e.getBoundingClientRect() }))
    .find(o => o.b.width > 0 && o.b.top > mt && o.b.bottom < innerHeight - 60 && o.e.querySelector('.puck[data-person]') && document.elementFromPoint(o.b.left + o.b.width / 2, o.b.top + o.b.height / 2)?.closest('.seat') === o.e)
  if (!s) return null
  return { x: Math.round(s.b.left + s.b.width / 2), y: Math.round(s.b.top + s.b.height / 2), key: s.e.dataset.slot, id: s.e.querySelector('.puck[data-person]').dataset.person }
}, [root, minTop])
const slotVal = (page, key) => page.evaluate(k => window.slotVal(k), key)
const panel = (page) => page.evaluate(() => {
  const bar = document.querySelector('.topbar').getBoundingClientRect()
  const ros = document.querySelector('.edit-board .eroster'); if (!ros) return null
  const h = ros.querySelector('.er-h').getBoundingClientRect(), ph = ros.querySelector('.rall').getBoundingClientRect()
  const allav = [...ros.querySelectorAll('.rall .rpuck[data-person]')].find(p => /ALL AVAIL/.test(p.textContent))
  const ab = allav && allav.getBoundingClientRect()
  const hit = ab && document.elementFromPoint(ab.left + ab.width / 2, ab.top + ab.height / 2)
  return { scrolled: Math.round(scrollY), barBottom: Math.round(bar.bottom), headTop: Math.round(h.top), rallTop: Math.round(ph.top),
    allav: ab ? { x: Math.round(ab.left + ab.width / 2), y: Math.round(ab.top + ab.height / 2), w: Math.round(ab.width), h: Math.round(ab.height), l: Math.round(ab.left), t: Math.round(ab.top) } : null,
    allavReach: !!hit && !!allav && allav.contains(hit), docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, winW: document.documentElement.clientWidth,
    pos: getComputedStyle(ros).position }
})

/* ======================= D. his PC, 1536 × 730 at 1.25 ======================= */
if (!ONLY || ONLY.includes('D')) {
  const { browser, page, errs } = await open({ width: 1536, height: 730 })

  /* D1 a seat puck let go over nothing on the week: off its seat, the right-click's note; Undo puts it back, Redo again */
  {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
    const s = await seatIn(page, '#eWeek', 120)
    if (!s) rec('D1 a puck let go over nothing says so', null, 'no seat puck in view')
    else {
      const cs = await csOf(page, s.id)
      const head = await page.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="0"] .day-head').getBoundingClientRect(); return { x: Math.round(b.left + 30), y: Math.round(b.top + b.height / 2) } })
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(head.x, head.y, { steps: 12 }); await sleep(120); await page.mouse.up(); await sleep(250)
      const said = await toastNow(page), gone = !(await slotVal(page, s.key))
      const p1 = await shot(page, 'D1-1-let-go-over-nothing')
      rec('D1 a puck let go over nothing comes off and says "<callsign> removed"', gone && said.startsWith(`${cs} removed`), `the seat now holds "${await slotVal(page, s.key)}"; the note reads "${said}"`, [p1])
      await page.click('#undoBtn'); await sleep(500)
      const back = await slotVal(page, s.key)
      const p2 = await shot(page, 'D1-2-undo-puts-him-back')
      rec('D1 Undo puts him back on his seat', back === s.id, `the seat holds ${back} (was ${s.id}); the note reads "${await toastNow(page)}"`, [p2])
      await page.click('#redoBtn'); await sleep(500)
      rec('D1 Redo takes him off again', !(await slotVal(page, s.key)), `the seat holds "${await slotVal(page, s.key)}"`)
      await page.click('#undoBtn'); await sleep(500)
    }
  }

  /* D2 a puck dropped back on its own seat still says "Already in that seat" (no removal note) */
  {
    const s = await seatIn(page, '#eWeek', 120)
    if (s) {
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 30, s.y + 10, { steps: 6 }); await page.mouse.move(s.x, s.y, { steps: 6 }); await sleep(100); await page.mouse.up(); await sleep(250)
      const said = await toastNow(page)
      rec('D2 dropped back on its own seat: no removal, "Already in that seat"', (await slotVal(page, s.key)) === s.id && !/removed/.test(said), `the note reads "${said}"`)
    }
  }

  /* D3 scrolled part-way, a puck picked up: the crew panel stays under the bar, ALL AVAIL in reach (mid-drag picture) */
  {
    await page.evaluate(() => scrollTo(0, 900)); await sleep(300)
    const before = await panel(page)
    const s = await seatIn(page, '#eWeek', 200)
    if (!s) rec('D3 the panel stays put during a drag', null, 'no seat puck in view part-way down')
    else {
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 40, s.y + 30, { steps: 8 }); await sleep(200)
      const mid = await panel(page)
      let p = null
      if (mid.allav) { await mark(page, { x: mid.allav.l - 6, y: mid.allav.t - 6, w: mid.allav.w + 12, h: mid.allav.h + 12 }, 'Mid-drag, scrolled down: the crew panel stays under the top bar, ALL AVAIL in reach', mid.allav.l - 360, mid.allav.t + 30); p = await shot(page, 'D3-1-mid-drag-panel-in-place'); await unmark(page) }
      await page.mouse.move(s.x, s.y, { steps: 8 }); await page.mouse.up(); await sleep(300)
      rec('D3 mid-drag, scrolled 900: the panel keeps its place under the bar, ALL AVAIL in reach', mid.scrolled > 400 && mid.headTop >= mid.barBottom && mid.headTop === before.headTop && mid.allavReach,
        `panel heading ${before.headTop} before, ${mid.headTop} mid-drag (bar's foot ${mid.barBottom}); ALL AVAIL reached under the mouse: ${mid.allavReach}; position ${mid.pos}`, p ? [p] : [])
      rec('D3 the puck went back where it was', (await slotVal(page, s.key)) === s.id, `seat holds ${await slotVal(page, s.key)}`)
    }
  }

  /* D4 his everyday task: ALL AVAIL carried from the panel onto a row lower down the page — it lands there */
  {
    await page.evaluate(() => scrollTo(0, 900)); await sleep(300)
    const p0 = await panel(page)
    const target = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-fill]')].map(e => ({ e, b: e.getBoundingClientRect() }))
        .filter(o => o.b.width > 0 && o.b.top > 160 && o.b.bottom < innerHeight - 60 && /^(g:|d:|a:)/.test(o.e.dataset.fill || ''))
      const c = cells[0]; if (!c) return null
      return { x: Math.round(c.b.left + Math.min(30, c.b.width / 2)), y: Math.round(c.b.top + c.b.height / 2), key: c.e.dataset.fill, before: c.e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) }
    })
    if (!p0.allav || !target) rec('D4 ALL AVAIL carried onto a lower row', null, `ALL AVAIL ${!!p0.allav}, a row in view ${!!target}`)
    else {
      await page.mouse.move(p0.allav.x, p0.allav.y); await page.mouse.down(); await page.mouse.move(target.x, target.y, { steps: 16 }); await sleep(150); await page.mouse.up(); await sleep(400)
      const after = await page.evaluate(k => { const c = document.querySelector(`#eWeek [data-fill="${k}"]`); return c ? c.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : '' }, target.key)
      const pic = await shot(page, 'D4-1-allavail-landed-lower')
      rec('D4 ALL AVAIL carried from the panel onto a row lower down lands there', /ALL AVAIL/.test(after) && !/ALL AVAIL/.test(target.before), `row ${target.key}: before "${target.before}", after "${after}"; note "${await toastNow(page)}"`, [pic])
      await page.click('#undoBtn'); await sleep(500)
    }
  }

  /* D5 scrolled to the last day: heading and Placeholders under the bar, the page no wider than the window */
  {
    await page.evaluate(() => scrollTo(0, 1e6)); await sleep(400)
    const m = await panel(page)
    let p = null
    if (m.allav) { await mark(page, { x: m.allav.l - 6, y: m.headTop - 6, w: 240, h: m.allav.t + m.allav.h - m.headTop + 12 }, 'Scrolled to the foot: the heading and ALL / ALL AVAIL stay under the top bar', m.allav.l - 360, m.allav.t + 40); p = await shot(page, 'D5-1-page-foot-panel-in-place'); await unmark(page) }
    rec('D5 at the page\'s foot the heading and ALL AVAIL stay under the bar', m.scrolled > 400 && m.headTop >= m.barBottom && m.allavReach, `scrolled ${m.scrolled}; heading ${m.headTop}, bar's foot ${m.barBottom}; ALL AVAIL reached: ${m.allavReach}`, p ? [p] : [])
    rec('D5 the page is no wider than the window', m.docW <= m.winW, `page ${m.docW} wide, window ${m.winW}`)
    /* and mid-drag at the foot too */
    const s = await seatIn(page, '#eWeek', 200)
    if (s) {
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 40, s.y + 20, { steps: 8 }); await sleep(200)
      const mid = await panel(page)
      await page.mouse.move(s.x, s.y, { steps: 6 }); await page.mouse.up(); await sleep(300)
      rec('D5 mid-drag at the foot: the panel stays put', mid.headTop === m.headTop && mid.allavReach, `heading ${m.headTop} → ${mid.headTop}; ALL AVAIL reached ${mid.allavReach}`)
    }
  }

  /* D6 the crew panel hidden (the CREW tab), then a drag: it stays hidden, nothing jumps into the page; shown again, the
     page no wider than the window (lesson 17) */
  {
    await page.evaluate(() => scrollTo(0, 600)); await sleep(300)
    await page.click('.ros-rail'); await sleep(600)
    const hidden = await page.evaluate(() => { const r = document.querySelector('.edit-board .eroster').getBoundingClientRect(); return { left: Math.round(r.left), win: innerWidth, docW: document.documentElement.scrollWidth } })
    const s = await seatIn(page, '#eWeek', 150)
    let mid = null
    if (s) {
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 40, s.y + 20, { steps: 8 }); await sleep(200)
      mid = await page.evaluate(() => { const r = document.querySelector('.edit-board .eroster').getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top), pos: getComputedStyle(document.querySelector('.edit-board .eroster')).position } })
      var pic = await shot(page, 'D6-1-panel-hidden-mid-drag')
      await page.mouse.move(s.x, s.y, { steps: 6 }); await page.mouse.up(); await sleep(300)
    }
    rec('D6 the hidden panel stays hidden through a drag', !!mid && mid.left >= hidden.win - 30 && hidden.left >= hidden.win - 30, `hidden at x ${hidden.left} (window ${hidden.win}); mid-drag x ${mid && mid.left}, ${mid && mid.pos}`, pic ? [pic] : [])
    await page.click('.ros-rail'); await sleep(600)
    const shown = await panel(page)
    rec('D6 shown again: in place under the bar, the page no wider than the window', shown.headTop >= shown.barBottom && shown.docW <= shown.winW, `heading ${shown.headTop}, bar ${shown.barBottom}; page ${shown.docW} / window ${shown.winW}`)
  }

  /* D7 the board on a desktop: its crew list's "drop to unassign" badge still shows mid-drag (the relative it keeps);
     a seat puck let go over nothing there says so too */
  {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
    await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
    const s = await seatIn(page, '#schedBoard', 120)
    if (!s) rec('D7 the board: a puck let go over nothing', null, 'no seat in view on the board')
    else {
      const cs = await csOf(page, s.id)
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 30, s.y + 10, { steps: 6 }); await sleep(150)
      const badge = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-ros.eroster, #schedBoard .eroster'); if (!r) return 'no crew list'; return getComputedStyle(r, '::after').content + ' / ' + getComputedStyle(r).position })
      const blank = await page.evaluate(() => { const b = document.querySelector('#schedBoard .sb-title, #schedBoard .sb-bar'); const r = b.getBoundingClientRect(); return { x: Math.round(r.left + 40), y: Math.round(r.top + r.height / 2) } })
      await page.mouse.move(blank.x, blank.y, { steps: 10 }); await sleep(120); await page.mouse.up(); await sleep(250)
      const said = await toastNow(page)
      const pic = await shot(page, 'D7-1-board-let-go-over-nothing')
      rec('D7 the board: let go over its bar, off the seat with "<callsign> removed"', !(await slotVal(page, s.key)) && said.startsWith(`${cs} removed`), `seat "${await slotVal(page, s.key)}"; note "${said}"; crew list mid-drag: ${badge}`, [pic])
      await page.click('#sbUndo').catch(() => page.click('#undoBtn')); await sleep(500)
      rec('D7 the board\'s Undo puts him back', (await slotVal(page, s.key)) === s.id, `seat ${await slotVal(page, s.key)}`)
    }
    await page.locator('#sbDone').click().catch(() => {}); await sleep(600)
  }

  /* D8 the look at the Original beside the working copy: Monday published (signs and Publish through the board), then an
     edit to the day and a leave filed for a man since (the leave is BACKGROUND, filed by the app's own write path — the
     route under test is the count, not the filing) */
  {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
    await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
    const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
    const n = await sels.count()
    for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—')); if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]); await sleep(120) }
    const beak = page.locator('#schedBoard [data-beak="0"]:visible').first()
    if (await beak.count()) { await beak.click(); await sleep(900); const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first(); if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) } }
    await page.locator('#sbDone').click().catch(() => {}); await sleep(600)
    const pub = await page.evaluate(() => window.dayApproved(0))
    if (!pub) rec('D8 the look\'s count', null, 'Monday did not publish through the board')
    else {
      /* an edit on the published day — a man let go over nothing (one change), then the leave */
      const s = await seatIn(page, '#eWeek .day[data-day="0"]', 120)
      const head = await page.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="0"] .day-head').getBoundingClientRect(); return { x: Math.round(b.left + 30), y: Math.round(b.top + b.height / 2) } })
      await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(head.x, head.y, { steps: 12 }); await sleep(120); await page.mouse.up(); await sleep(400)
      await page.evaluate(() => { const w = window; const who = Object.keys(w.PEOPLE).find(id => !w.PEOPLE[id].special && !w.PEOPLE[id].archived && w.PEOPLE[id].pos === 'P'); w.fileInput({ iid: 'walk-ll', person: who, type: 'LL', date: w.DAYS[0].dt, yr: 2026, allday: true, remarks: 'FILED SINCE (walk)' }); w.afterSchedMutate && w.afterSchedMutate() })
      await sleep(600)
      const live = await page.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] .dpend') || {}).textContent || '')
      const pLive = await shot(page, 'D8-1-working-copy-count', { x: 0, y: 60, width: 760, height: 260 })
      /* open the look: the plan menu → the Original */
      await page.click('#eWeek .day[data-day="0"] [data-planmenu="0"]'); await sleep(400)
      const pv = page.locator('[data-planpv]').first()
      if (!(await pv.count())) rec('D8 the look\'s count', null, 'no issued version in the plan menu')
      else {
        await pv.click(); await sleep(700)
        const look = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); return { chip: (d.querySelector('.dpend') || {}).textContent || '', bar: (d.querySelector('.dprev-bar') || {}).textContent || '' } })
        const pLook = await shot(page, 'D8-2-look-at-original-count', { x: 0, y: 60, width: 760, height: 260 })
        rec('D8 the look at the Original reads the working copy\'s own "N pending"', live.replace(/\s+/g, ' ').trim() === look.chip.replace(/\s+/g, ' ').trim() && /\d+\s+pending/.test(live), `working copy "${live.replace(/\s+/g, ' ').trim()}", the look "${look.chip.replace(/\s+/g, ' ').trim()}"`, [pLive, pLook])
        await page.click('#eWeek .day[data-day="0"] [data-restore="0"]'); await sleep(400)
        const armed = await page.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] .dprev-restore') || {}).textContent || '')
        const pArm = await shot(page, 'D8-3-load-armed-discard-count', { x: 0, y: 60, width: 760, height: 260 })
        rec('D8 "Load onto working copy" armed says what the load discards (the edit, not the leave)', /Discard 1 edit/.test(armed), `the button reads "${armed.trim()}"`, [pArm])
        await page.click('#eWeek .day[data-day="0"] [data-restcancel="0"]'); await sleep(400)
        await page.click('#eWeek .day[data-day="0"] [data-golive="0"]'); await sleep(500)
        const back = await page.evaluate(() => ({ pv: !!document.querySelector('#eWeek .day[data-day="0"].preview'), chip: (document.querySelector('#eWeek .day[data-day="0"] .dpend') || {}).textContent || '' }))
        rec('D8 Keep editing, then ← Back to live copy: the working copy and its count as they were', !back.pv && back.chip.replace(/\s+/g, ' ').trim() === live.replace(/\s+/g, ' ').trim(), `preview still up: ${back.pv}; count "${back.chip.replace(/\s+/g, ' ').trim()}"`)
        /* the board's look reads the same count (its sign strip is the same drawer) */
        await page.click('#eWeek [data-sbday="0"]:visible'); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
        const bLive = await page.evaluate(() => (document.querySelector('#schedBoard .dpend') || {}).textContent || '')
        await page.locator('#schedBoard [data-planmenu]:visible').first().click(); await sleep(400)
        await page.locator('[data-planpv]').first().click(); await sleep(700)
        const bLook = await page.evaluate(() => (document.querySelector('#schedBoard .dpend') || {}).textContent || '')
        const pB = await shot(page, 'D8-4-board-look-count')
        /* the board's strip under a look is built without the count, as before this change (board.ts boardSignBody, its
           pv branch: who signed the version and the plan selector only) — so no count there can disagree */
        rec('D8 the board: its working copy reads the count; its look draws none (as built)', /\d+\s+pending/.test(bLive) && bLook === '', `board working copy "${bLive.replace(/\s+/g, ' ').trim()}", its look "${bLook.replace(/\s+/g, ' ').trim()}"`, [pB])
        await page.locator('#schedBoard [data-golive]:visible').first().click().catch(() => {}); await sleep(400)
        await page.locator('#sbDone').click().catch(() => {}); await sleep(600)
        /* View-only Sched's issued face still shows no pending count (AM24) */
        await page.evaluate(() => window.go('viewsched')); await sleep(800)
        const vs = await page.evaluate(() => (document.querySelector('#vWeek .day[data-day="0"] .dpend') || {}).textContent || '')
        const pV = await shot(page, 'D8-5-view-only-issued-face', { x: 0, y: 60, width: 760, height: 260 })
        rec('D8 View-only Sched\'s issued face shows no pending count', vs === '', `View-only Monday's count: "${vs}"`, [pV])
        await page.evaluate(() => window.go('editsched')); await sleep(800)
      }
    }
  }
  rec('D errors in the page', errs.length === 0, errs.length ? errs.join(' | ') : 'none')
  await browser.close()
}

/* touch helpers — real fingers over CDP; a finger rests before it lifts (walk-scripts §4) */
const T = (cdp) => ({
  down: (x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }),
  move: (x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }),
  up: () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
})
const glide = async (t, a, b, n = 8, ms = 16) => { for (let i = 1; i <= n; i++) { await t.move(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n); await sleep(ms) } }
const hold = async (t, p, n = 12, ms = 30) => { for (let i = 0; i < n; i++) { await t.move(p.x, p.y + (i % 2)); await sleep(ms) } }

/* ======================= P. an iPhone held upright, 402 × 874 ======================= */
if (!ONLY || ONLY.includes('P')) {
  const { browser, page, errs, cdp } = await open({ width: 402, height: 874 }, { touch: true, dpr: 3 })
  const t = T(cdp)
  /* P1 the week: the crew drawer opened, a crew puck carried to the screen's foot scrolls the page */
  {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
    await page.locator('.eroster .ros-tab').first().tap().catch(() => {}); await sleep(600)
    const pk = await page.evaluate(() => { const p = [...document.querySelectorAll('#eRoster .rpuck[data-person]')].map(e => e.getBoundingClientRect()).find(b => b.width > 0 && b.top > 120 && b.bottom < innerHeight - 120); return p ? { x: Math.round(p.left + p.width / 2), y: Math.round(p.top + p.height / 2) } : null })
    if (!pk) rec('P1 the week: a crew-drawer puck carried to the foot scrolls the page', null, 'no crew puck in the drawer in view')
    else {
      const y0 = await page.evaluate(() => scrollY)
      await t.down(pk.x, pk.y); await sleep(300)
      const foot = { x: 200, y: 874 - 10 }
      await glide(t, pk, foot, 10); await hold(t, foot, 20)
      const y1 = await page.evaluate(() => scrollY)
      const pic = await shot(page, 'P1-1-week-crew-puck-at-foot')
      await glide(t, foot, pk, 10); await sleep(90); await t.up(); await sleep(400)
      rec('P1 the week, upright: a crew-drawer puck held at the foot scrolls the page', y1 > y0, `page scroll ${y0} → ${y1}`, [pic])
    }
  }
  /* P2 the board: a seat puck let go over nothing — a picture right after the lift, and the note */
  {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(200)
    await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
    const s = await seatIn(page, '#schedBoard', 160)
    if (!s) rec('P2 the board, upright: a puck let go over nothing', null, 'no seat in view')
    else {
      const cs = await csOf(page, s.id)
      const bar = await page.evaluate(() => { const b = document.querySelector('#schedBoard .sb-title, #schedBoard .sb-bar').getBoundingClientRect(); return { x: Math.round(b.left + 60), y: Math.round(b.top + b.height / 2) } })
      await t.down(s.x, s.y); await sleep(300)
      await glide(t, s, bar, 10); await sleep(90); await t.up(); await sleep(60)
      const pNow = await shot(page, 'P2-1-board-just-after-lift')
      await sleep(300)
      const said = await toastNow(page)
      const pSet = await shot(page, 'P2-2-board-settled')
      rec('P2 the board, upright: let go over its bar, off the seat with "<callsign> removed"', !(await slotVal(page, s.key)) && said.startsWith(`${cs} removed`), `seat "${await slotVal(page, s.key)}"; note "${said}"`, [pNow, pSet])
      await page.locator('#sbUndo:visible').first().tap(); await sleep(500)
      rec('P2 Undo puts him back', (await slotVal(page, s.key)) === s.id, `seat ${await slotVal(page, s.key)}`)
    }
  }
  rec('P errors in the page', errs.length === 0, errs.length ? errs.join(' | ') : 'none')
  await browser.close()
}

/* ======================= S. a phone on its side, 844 × 390 ======================= */
if (!ONLY || ONLY.includes('S')) {
  const { browser, page, errs, cdp } = await open({ width: 844, height: 390 }, { touch: true, dpr: 3 })
  const t = T(cdp)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
  const paneOf = () => page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-boardwrap'); const r = p.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), w: Math.round(r.width), st: Math.round(p.scrollTop), sh: p.scrollHeight } })
  const setPane = (v) => page.evaluate(x => { document.querySelector('#schedBoard .sb-boardwrap').scrollTop = x }, v)
  const crewPk = (name) => page.evaluate(nm => { const ps = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => ({ e, b: e.getBoundingClientRect() })).filter(o => o.b.width > 0 && o.b.top > 200 && o.b.bottom < innerHeight - 4); const o = nm ? ps.find(o => o.e.textContent.includes(nm)) : ps[0]; return o ? { x: Math.round(o.b.left + o.b.width / 2), y: Math.round(o.b.top + o.b.height / 2), id: o.e.dataset.person, nm: o.e.textContent.trim().slice(0, 14) } : null }, name)
  const listSt = () => page.evaluate(() => Math.round(document.querySelector('#sbRoster').scrollTop))

  /* S1 slowly: a crew-list puck held at the top of the pane scrolls the pane (not the list) */
  {
    await setPane(300); await sleep(200)
    const pane = await paneOf(), pk = await crewPk('ALL AVAIL'), l0 = await listSt()
    if (!pk) rec('S1 a crew-list puck held at the pane\'s top scrolls the pane', null, 'no crew puck in view')
    else {
      await t.down(pk.x, pk.y); await sleep(300)
      const to = { x: pane.left + pane.w / 2, y: pane.top + 8 }
      await glide(t, pk, to, 10, 20); await hold(t, to, 14)
      const p1 = await paneOf(), l1 = await listSt()
      await mark(page, { x: pane.left + 4, y: pane.top - 2, w: pane.w - 8, h: 40 }, 'Held at the top of the day pane: the pane scrolls', pane.left + 40, pane.top + 50)
      const pic = await shot(page, 'S1-1-crew-puck-scrolls-pane'); await unmark(page)
      await glide(t, to, pk, 8); await sleep(90); await t.up(); await sleep(400)
      rec('S1 slowly: a crew-list puck held at the pane\'s top scrolls the pane, not the list', p1.st < 300 && l1 === l0, `pane ${300} → ${p1.st}; crew list ${l0} → ${l1}`, [pic])
    }
  }
  /* S2 a quick flick: a short hold, a fast carry to the pane's top (lesson 2) */
  {
    await setPane(300); await sleep(200)
    const pane = await paneOf(), pk = await crewPk('ALL AVAIL')
    if (pk) {
      await t.down(pk.x, pk.y); await sleep(200)
      const to = { x: pane.left + pane.w / 2, y: pane.top + 8 }
      await glide(t, pk, to, 3, 8); await hold(t, to, 10, 25)
      const p1 = await paneOf()
      await glide(t, to, pk, 4, 8); await sleep(90); await t.up(); await sleep(400)
      rec('S2 a quick flick to the pane\'s top scrolls the pane too', p1.st < 300, `pane 300 → ${p1.st}`)
    }
  }
  /* S3 a seat puck carried up past the pane into the bar goes on scrolling the pane (the last box under the finger) */
  {
    await setPane(400); await sleep(200)
    const pane = await paneOf()
    const s = await seatIn(page, '#schedBoard .sb-boardwrap', pane.top + 40)
    if (!s) rec('S3 a seat puck carried into the bar keeps scrolling the pane', null, 'no seat in the pane')
    else {
      await t.down(s.x, s.y); await sleep(300)
      const inBar = { x: s.x, y: Math.max(8, pane.top - 30) }
      await glide(t, s, inBar, 10, 20); await hold(t, inBar, 14)
      const p1 = await paneOf()
      const pic = await shot(page, 'S3-1-seat-puck-in-bar-scrolls-pane')
      await glide(t, inBar, s, 8); await sleep(90); await t.up(); await sleep(400)
      rec('S3 a seat puck carried up into the bar keeps scrolling the pane', p1.st < 400, `pane 400 → ${p1.st}`, [pic])
      const was = await slotVal(page, s.key)
      rec('S3 put back where it was (or said where it went)', true, `seat now holds "${was}" (was ${s.id}); note "${await toastNow(page)}"`)
      if (was !== s.id) { await page.locator('#sbUndo:visible').first().tap(); await sleep(500) }
    }
  }
  /* S4 his task: a crew-list puck carried into the pane and dropped on a row there — it lands */
  {
    /* the pane is about 200px tall on its side: bring a row's "+ add" to its middle first, as a person scrolls to it */
    await page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-boardwrap'); const c = [...p.querySelectorAll('[data-fill]')].find(e => e.getBoundingClientRect().width > 0); if (c) p.scrollTop += c.getBoundingClientRect().top - p.getBoundingClientRect().top - p.clientHeight / 2 })
    await sleep(300)
    const pk = await crewPk()
    const cell = await page.evaluate(() => { const p = document.querySelector('#schedBoard .sb-boardwrap').getBoundingClientRect(); const c = [...document.querySelectorAll('#schedBoard .sb-boardwrap [data-fill]')].map(e => ({ e, b: e.getBoundingClientRect() })).find(o => o.b.width > 0 && o.b.top > p.top + 40 && o.b.bottom < p.bottom - 40); return c ? { x: Math.round(c.b.left + Math.min(20, c.b.width / 2)), y: Math.round(c.b.top + c.b.height / 2), key: c.e.dataset.fill } : null })
    if (!pk || !cell) rec('S4 a crew-list puck dropped on a row in the pane lands', null, `crew puck ${!!pk}, a row in the pane ${!!cell}`)
    else {
      const cs = await csOf(page, pk.id)
      await t.down(pk.x, pk.y); await sleep(300)
      await glide(t, pk, cell, 12, 20); await sleep(90); await t.up(); await sleep(500)
      const landed = await page.evaluate(([k, id]) => [...document.querySelectorAll(`#schedBoard [data-fill="${k}"] [data-person="${id}"], #schedBoard [data-slot^="${k.replace(/\.\+$/, '')}"] [data-person="${id}"]`)].length > 0, [cell.key, pk.id])
      const pic = await shot(page, 'S4-1-crew-puck-landed-in-pane')
      rec('S4 a crew-list puck dropped on a row in the pane lands there', landed, `${cs} on ${cell.key}: ${landed}; note "${await toastNow(page)}"`, [pic])
      await page.locator('#sbUndo:visible').first().tap(); await sleep(500)
    }
  }
  rec('S errors in the page', errs.length === 0, errs.length ? errs.join(' | ') : 'none')
  await browser.close()
}

writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(rows, null, 1))
const fails = rows.filter(r => r.result === 'FAIL').length, nw = rows.filter(r => r.result === 'NOT WALKED').length
console.log(`\n${rows.length} checks: ${rows.length - fails - nw} PASS, ${fails} FAIL, ${nw} NOT WALKED`)
