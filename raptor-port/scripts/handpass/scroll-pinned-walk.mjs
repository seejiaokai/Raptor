// THE WALK OF 30 OCT 26 ([LW-LEAVE-SCROLL-CARRY], [PINNED-LEAK-SWEEP], [QUALS-PINNED-COLS-REFLOW]) — assertions of the right
// behaviour, so running it again on a fixed build IS the re-walk. His iPhone's engine (WebKit 402×874 ×3, a finger by tap) and
// his PC (Chromium 1536×730 ×1.25, a mouse). Every page switch is read on its FIRST frame (the window's scroll and the page on
// screen, taken by a frame callback before that frame is drawn — §7.11 lesson 10) and pictured as it settles.
//   L1  the Leave War scrolled down, then every other page from the menu: each opens at its own top; back, the war where he was
//   L2  the View-only Sched ↔ Edit Schedule hop keeps the place it keeps today
//   L3  an Edit Schedule change typed in a real box, Undo pressed on the scrolled Leave War: Edit Schedule, the change undone,
//       its day in view
//   L4  a Quals change typed in a real box, Undo pressed on the scrolled Leave War: Quals, its row on screen
//   L5  Quals scrolled, "+ Add person": Admin with the new person's form in view
//   L6  (phone) the menu opened and closed on a scrolled page keeps its place; a page picked from it opens at its top
//   L7  the member's bell line for his approved leave, tapped on a scrolled Quals: the Leave War at that day
//   P1  the parts made solid, pressed: a picture right after the press (a phone keeps what it touched "hovered") and settled
//   P2  the OIL tracker's tools row where it was before the fix, wide letters forced from the first paint (nothing moved)
//   node scripts/handpass/scroll-pinned-walk.mjs <port of a served build> [before-port for P2] [only]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { webkit, chromium, devices } = require('@playwright/test')
import { LAUNCH } from '../drawcheck/lib.mjs'
const here = path.dirname(fileURLToPath(import.meta.url))
const [, , PORT = '4186', BEFORE_PORT = '', ONLY = ''] = process.argv
const OUT = path.resolve(here, process.env.HP_SHOTS || '../../docs/img/handpass/2026-10-30-scroll-pinned/walk')
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f))
console.log(`[scroll-pinned-walk v1] port ${PORT} -> ${OUT}`)
const LW_TODAY = '2026-01-05'
const results = []
const rec = (id, size, ok, said, pics = []) => { const v = ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL'; results.push({ id, size, verdict: v, said, pics }); console.log(`${v}  ${id} [${size}]  ${said}`) }
const want = id => !ONLY || ONLY.split(',').some(o => id.startsWith(o))
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function world(size, port = PORT, wide = false) {
  const phone = size === 'phone'
  const b = phone ? await webkit.launch() : await chromium.launch(LAUNCH)
  const ctx = await b.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  if (wide) await ctx.addInitScript(() => { const add = () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }'; document.head.appendChild(s) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) })
  /* the first frame after every page change: the window's scroll and the page then on screen */
  await ctx.addInitScript(() => {
    window.__ff = []
    let last
    const tick = () => { const p = window.CURPAGE; if (p !== last) { window.__ff.push({ page: p, y: Math.round(window.scrollY), t: Math.round(performance.now()) }); last = p } requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  return { b, ctx, page, phone, size, errs, port }
}
async function signIn(w, who) {
  const p = w.page
  await p.goto(`http://localhost:${w.port}/`)
  await p.waitForSelector('#luser')
  await p.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await p.fill('#luser', who === 'admin' ? 'ad' : 'us'); await p.fill('#lpass', who === 'admin' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await sleep(700)
}
const shot = (w, name, clip) => w.page.screenshot({ path: path.join(OUT, `${w.size}-${name}.png`), ...(clip ? { clip } : {}) }).then(() => `${w.size}-${name}.png`)
/* a press as a person makes it: a finger on the phone (a picture ~100 ms after the lift, pointer left there), a mouse on a desktop */
async function press(w, sel, quick = null) {
  const l = w.page.locator(sel).first()
  await l.waitFor({ state: 'visible', timeout: 15000 })
  if (w.phone) await l.tap(); else await l.click()
  if (quick) { await sleep(90); return shot(w, quick) }
  return null
}
async function openPage(w, pg) {
  if (w.phone) { await press(w, '#burger'); await sleep(250); await press(w, `#drawerNav a[data-page="${pg}"]`) }
  else await press(w, `#topnav a[data-page="${pg}"]`)
  await w.page.waitForFunction(q => window.CURPAGE === q, pg, { timeout: 15000 })
  await sleep(500)
}
const lastFF = w => w.page.evaluate(() => window.__ff[window.__ff.length - 1])
const winY = w => w.page.evaluate(() => Math.round(window.scrollY))
/* the person row in the middle of the Leave War, as he sees it */
const warRow = w => w.page.evaluate(() => {
  const r = [...document.querySelectorAll('#page-leavewar tr[data-testid^="row-"]')].find(e => { const q = e.getBoundingClientRect(); return q.height > 0 && q.top > innerHeight / 3 && q.bottom < innerHeight })
  return r ? { id: r.dataset.testid, top: Math.round(r.getBoundingClientRect().top) } : null
})
const rowTop = (w, id) => w.page.evaluate(i => { const e = document.querySelector(`[data-testid="${i}"]`); return e ? Math.round(e.getBoundingClientRect().top) : null }, id)
async function warScrolled(w, y = 500) {
  await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForSelector('#page-leavewar tr[data-testid^="row-"]', { timeout: 20000 }); await sleep(700)
  await w.page.evaluate(yy => window.scrollTo(0, yy), y); await sleep(400)
}

async function run(size) {
  const w = await world(size)
  const S = size
  try {
    await signIn(w, 'admin')
    /* ---- L1 ---- */
    if (want('L1')) {
      for (const pg of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'help', 'admin', 'tracker']) {
        await warScrolled(w)
        const was = await warRow(w), y0 = await winY(w)
        await openPage(w, pg)
        const ff = await lastFF(w)
        const pic = await shot(w, `L1-${pg}`)
        rec(`L1 ${pg} from the scrolled Leave War`, S, ff && ff.page === pg && ff.y === 0 && (await winY(w)) === 0, `war at ${y0}; first frame on ${ff && ff.page} at ${ff && ff.y}, settled at ${await winY(w)}`, [pic])
        await openPage(w, 'leavewar'); await sleep(300)
        const now = was ? await rowTop(w, was.id) : null
        rec(`L1 back on the Leave War from ${pg}`, S, !!was && now !== null && Math.abs(now - was.top) <= 2, `${was && was.id} stood at ${was && was.top}, now ${now}`, [await shot(w, `L1-${pg}-back`)])
      }
    }
    /* ---- L2 ---- */
    if (want('L2')) {
      await openPage(w, 'viewsched'); await w.page.evaluate(() => window.scrollTo(0, 400)); await sleep(400)
      const v0 = await winY(w)
      await openPage(w, 'editsched'); const ff = await lastFF(w)
      rec('L2 View-only Sched scrolled, then Edit Schedule: the hop keeps what it does today (not sent to the top by the change)', S, ff.page === 'editsched' && ff.y > 0, `View-only at ${v0}; Edit Schedule's first frame at ${ff.y}, settled at ${await winY(w)}`, [await shot(w, 'L2-hop')])
    }
    /* ---- L3 ---- */
    if (want('L3')) {
      await openPage(w, 'editsched'); await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(400)
      /* a box on Thursday the app routes, found on screen: the day's note on a phone and a desktop alike */
      const key = await w.page.evaluate(() => {
        const d = document.querySelector('#eWeek .day[data-day="3"]')
        const e = d && [...d.querySelectorAll('[data-txt]')].find(x => x.getBoundingClientRect().height > 0 && x.isContentEditable)
        return e ? e.getAttribute('data-txt') : null
      })
      if (!key) rec('L3 an Edit Schedule box on Thursday', S, null, 'no box found on Thursday')
      else {
        if (!w.phone) await w.page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="3"]'); d.scrollIntoView({ inline: 'start', block: 'nearest' }) })
        const box = w.page.locator(`#eWeek [data-txt="${key}"]`).first()
        await box.scrollIntoViewIfNeeded()
        const before = (await box.innerText()).trim()
        if (w.phone) await box.tap(); else await box.click()
        await w.page.keyboard.press('End'); await w.page.keyboard.type(' WALK')
        await w.page.keyboard.press('Tab'); await sleep(500)
        const typed = (await w.page.locator(`#eWeek [data-txt="${key}"]`).first().innerText()).trim()
        rec('L3 fixture: typed in the box', S, typed.endsWith('WALK'), `"${before}" → "${typed}" (${key})`, [await shot(w, 'L3-typed')])
        /* Thursday out of view first: the week at Monday */
        await w.page.evaluate(() => { const wk = document.getElementById('eWeek'); if (wk) wk.scrollLeft = 0; window.scrollTo(0, 0) }); await sleep(300)
        await warScrolled(w, 600)
        await press(w, '#undoBtn')
        await w.page.waitForFunction(() => window.CURPAGE === 'editsched', null, { timeout: 8000 }).catch(() => {})
        await sleep(700)
        const ff = await lastFF(w)
        const r = await w.page.evaluate(k => {
          const e = document.querySelector(`#eWeek [data-txt="${k}"]`), wk = document.getElementById('eWeek'), d = document.querySelector('#eWeek .day[data-day="3"]')
          const wr = wk.getBoundingClientRect(), dr = d.getBoundingClientRect()
          return { text: e ? e.innerText.trim() : null, dayL: Math.round(dr.left), weekL: Math.round(wr.left), weekR: Math.round(wr.right), vw: innerWidth }
        }, key)
        const inView = r.dayL >= r.weekL - 1 && r.dayL < Math.min(r.weekR, r.vw) - 40
        rec('L3 Undo on the scrolled Leave War lands on Edit Schedule, the change undone, Thursday in view', S, ff.page === 'editsched' && r.text === before && inView, `first frame on ${ff.page} at y ${ff.y}; the box reads "${r.text}"; Thursday's front edge at ${r.dayL} (week ${r.weekL}–${r.weekR})`, [await shot(w, 'L3-undo-landed')])
      }
    }
    /* ---- L4 ---- */
    if (want('L4')) {
      await openPage(w, 'quals'); await w.page.waitForSelector('#qtbl td.qname')
      await press(w, '#qEdit'); await sleep(300)
      const ids = await w.page.evaluate(() => [...document.querySelectorAll('#qtbl input[data-init]')].map(i => i.getAttribute('data-init')))
      const pid = ids[Math.floor(ids.length * 0.8)]
      const box = w.page.locator(`#qtbl input[data-init="${pid}"]`)
      await box.scrollIntoViewIfNeeded(); const was = await box.inputValue()
      if (w.phone) await box.tap(); else await box.click()
      await box.fill('WK'); await box.press('Enter'); await sleep(300)
      await w.page.evaluate(() => window.scrollTo(0, 0)); await press(w, '#qSave'); await sleep(400)
      const saved = await w.page.evaluate(id => { const td = document.querySelector(`#qtbl td.qname[data-person="${id}"]`); return td ? td.parentElement.querySelector('.qinitc').textContent.trim() : null }, pid)
      rec('L4 fixture: the initials typed and kept', S, saved === 'WK', `"${was}" → "${saved}" (${pid})`)
      await warScrolled(w, 600)
      await press(w, '#undoBtn')
      await w.page.waitForFunction(() => window.CURPAGE === 'quals', null, { timeout: 8000 }).catch(() => {})
      await sleep(900)
      const ff = await lastFF(w)
      const r = await w.page.evaluate(id => {
        const td = document.querySelector(`#qtbl td.qname[data-person="${id}"]`), tr = td && td.parentElement
        const q = td ? td.getBoundingClientRect() : null, head = document.querySelector('[data-testid="qsticky-head"]')
        const hb = head ? head.getBoundingClientRect().bottom : (document.querySelector('.topbar').getBoundingClientRect().bottom)
        return { init: tr ? tr.querySelector('.qinitc').textContent.trim() : null, top: q && Math.round(q.top), bottom: q && Math.round(q.bottom), clear: q ? q.top >= hb - 1 && q.bottom <= innerHeight : false }
      }, pid)
      rec('L4 Undo on the scrolled Leave War lands on Quals with the changed row on screen, clear of the pinned row', S, ff.page === 'quals' && r.init === was && r.clear, `first frame on ${ff.page} at y ${ff.y}; initials "${r.init}" (was "${was}"); the row at ${r.top}–${r.bottom}`, [await shot(w, 'L4-undo-landed')])
    }
    /* ---- L5 ---- */
    if (want('L5')) {
      await openPage(w, 'quals'); await w.page.waitForSelector('#qtbl td.qname')
      await w.page.evaluate(() => { const b = document.getElementById('qAddToggle'); window.scrollTo(0, Math.max(0, b.getBoundingClientRect().top + scrollY - 120)) }); await sleep(300)
      const y0 = await winY(w)
      await press(w, '#qAddToggle'); await w.page.waitForFunction(() => window.CURPAGE === 'admin'); await sleep(900)
      const r = await w.page.evaluate(() => { const e = document.getElementById('accAddBlock'); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) } })
      rec('L5 Quals scrolled, "+ Add person": Admin opens with the new person\'s form in view', S, !!r && r.top >= 0 && r.top < 874 - 60, `Quals at ${y0}; the form at ${r && r.top}–${r && r.bottom}, window at ${await winY(w)}`, [await shot(w, 'L5-addperson')])
    }
    /* ---- L6 (phone) ---- */
    if (want('L6') && w.phone) {
      await openPage(w, 'viewsched'); await w.page.evaluate(() => window.scrollTo(0, 500)); await sleep(400)
      const y0 = await winY(w)
      await press(w, '#burger'); await sleep(300)
      await w.page.locator('#drawer').click({ position: { x: 395, y: 600 } }); await sleep(400)
      rec('L6 the menu opened and closed on a scrolled page: the page keeps its place', S, Math.abs((await winY(w)) - y0) <= 2 && (await w.page.evaluate(() => window.CURPAGE)) === 'viewsched', `View-only at ${y0}, after the menu ${await winY(w)}`, [await shot(w, 'L6-menu-closed')])
      await press(w, '#burger'); await sleep(300)
      await press(w, '#drawerNav a[data-page="logic"]'); await w.page.waitForFunction(() => window.CURPAGE === 'logic'); await sleep(500)
      const ff = await lastFF(w)
      rec('L6 a page picked from the menu on a scrolled page opens at its top', S, ff.page === 'logic' && ff.y === 0 && (await winY(w)) === 0, `first frame on Logic at ${ff.y}, settled ${await winY(w)}`, [await shot(w, 'L6-menu-logic')])
    }
    /* ---- P1 ---- */
    if (want('P1')) {
      if (w.phone) {
        await openPage(w, 'editsched'); await w.page.evaluate(() => window.scrollTo(0, 300)); await sleep(300)
        const q = await press(w, '#eRoster .ros-tab', 'P1-drawer-tab-q'); await sleep(500)
        rec('P1 the crew drawer pressed open, right after and settled: solid over the week', S, await w.page.evaluate(() => getComputedStyle(document.getElementById('eRoster')).backgroundColor === 'rgb(11, 13, 16)'), 'its fill read', [q, await shot(w, 'P1-drawer-open')])
        await press(w, '#eRoster .ros-tab'); await sleep(400)
      } else {
        await openPage(w, 'editsched'); await w.page.evaluate(() => window.scrollTo(0, 300)); await sleep(300)
        const rail = await w.page.locator('.ros-rail').boundingBox()
        await w.page.mouse.move(rail.x + rail.width / 2, rail.y + rail.height / 2); await sleep(250)
        const pic = await shot(w, 'P1-rail-hover', { x: rail.x - 60, y: rail.y - 30, width: 90, height: rail.height + 60 })
        await w.page.mouse.move(600, 300); await sleep(250)
        const pic2 = await shot(w, 'P1-rail-rest', { x: rail.x - 60, y: rail.y - 30, width: 90, height: rail.height + 60 })
        const bg = await w.page.evaluate(() => getComputedStyle(document.querySelector('.ros-rail')).backgroundColor)
        rec('P1 the CREW rail at rest (solid, its blue tint) and under the pointer (solid blue, unchanged)', S, bg === 'rgb(18, 39, 46)', `at rest ${bg}`, [pic2, pic])
        const hs = await w.page.locator('#hscroll').boundingBox()
        await press(w, '#hsR'); await sleep(500)
        rec('P1 the days\' scroll bar at the foot pressed (a day on): still solid, the days moving under it', S, await w.page.evaluate(() => getComputedStyle(document.getElementById('hscroll')).backgroundColor === 'rgb(11, 13, 16)'), 'its fill read', [await shot(w, 'P1-hscroll-pressed', { x: 0, y: hs.y - 60, width: 1536, height: hs.height + 60 })])
      }
      await w.page.evaluate(() => window.go('leavewar')); await sleep(800)
      await press(w, '[data-testid="oil-tracker"]'); await w.page.waitForSelector('[data-testid="oil-list"]'); await sleep(600)
      await w.page.locator('[data-testid="oil-list"]').evaluate(e => { e.scrollTop = 200 }); await sleep(300)
      const q1 = await press(w, '[data-testid="oil-legend"]', 'P1-oil-legend-q'); await sleep(400)
      const solid = await w.page.evaluate(() => getComputedStyle(document.querySelector('.oil-top')).backgroundColor)
      rec('P1 the OIL tracker\'s "?" pressed over a scrolled list: the tools, the legend and the head one solid surface', S, solid === 'rgb(20, 24, 29)', `the top's fill ${solid}`, [q1, await shot(w, 'P1-oil-legend')])
      await press(w, '[data-testid="oil-legend"]'); await sleep(300)
      await press(w, '[data-testid="oil-close"]'); await sleep(300)
    }
    /* ---- L7 ---- */
    if (want('L7')) {
      /* the member bids LL on Tue 24 Mar 26 through the bid window; the admin approves it on Approvals; the member's bell */
      await w.page.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await w.page.waitForSelector('#luser', { timeout: 15000 })
      await signIn(w, 'member')
      await w.page.evaluate(() => window.go('leavewar')); await sleep(900)
      const cell = '[data-testid="cell-bane-2026-03-24"]'
      if (!(await w.page.locator(cell).count())) { await press(w, 'button:has-text("MAR")'); await sleep(700) }
      await press(w, cell); await sleep(500)
      await press(w, '[data-testid="bid-LL"]'); await sleep(500)
      if (await w.page.locator('[data-testid="bid-picker"]').isVisible().catch(() => false)) { await press(w, '[data-testid="bid-LL"]'); await sleep(500) }
      await w.page.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await w.page.waitForSelector('#luser', { timeout: 15000 })
      await signIn(w, 'admin')
      await w.page.evaluate(() => window.go('leavewar')); await sleep(900)
      await press(w, '[data-testid="lw-tab-approvals"]'); await w.page.waitForSelector('[data-testid="approvals-page"]'); await sleep(500)
      const li = await w.page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(l => /24 Mar/.test(l.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', 'mar24'); return i })
      if (li < 0) rec('L7 fixture: the 24 Mar request on Approvals', S, null, 'not found')
      else {
        await press(w, '[data-walk="mar24"] [data-testid="appr-approve"]'); await sleep(500)
        await w.page.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() }); await w.page.waitForSelector('#luser', { timeout: 15000 })
        await signIn(w, 'member')
        await openPage(w, 'quals'); await w.page.evaluate(() => window.scrollTo(0, 600)); await sleep(400)
        const y0 = await winY(w)
        await press(w, '#notifyBell'); await sleep(500)
        const line = await w.page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="bell-list"] [data-testid^="bell-line-"]')]; const l = ls.find(x => /24 Mar/.test(x.innerText)); return l ? l.dataset.testid : null })
        if (!line) rec('L7 the member\'s bell line for 24 Mar', S, null, 'no line in the bell')
        else {
          const q = await press(w, `[data-testid="${line}"]`, 'L7-bell-tap-q'); await sleep(1200)
          const ff = await lastFF(w)
          const r = await w.page.evaluate(() => { const td = document.querySelector('[data-testid="cell-bane-2026-03-24"]'); if (!td) return null; const q = td.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { l: Math.round(q.left), t: Math.round(q.top), inView: q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth, seen: !!h && (h === td || td.contains(h)), ring: td.classList.contains('lw-ring') } })
          rec('L7 the bell\'s Leave War line tapped on a scrolled Quals: the Leave War at 24 Mar, the day in sight and ringed', S, ff.page === 'leavewar' && !!r && r.inView && r.seen, `Quals at ${y0}; first frame on ${ff.page} at y ${ff.y}; the day at ${r && r.l},${r && r.t}, seen ${r && r.seen}, ring ${r && r.ring}`, [q, await shot(w, 'L7-bell-landed')])
        }
      }
    }
  } catch (e) { rec('the walk stopped', S, false, String(e).slice(0, 300)) }
  rec('page errors', S, w.errs.length === 0, w.errs.slice(0, 4).join(' / ') || 'none')
  await w.b.close()
}
/* ---- P2: the OIL tracker's parts where they were, before and after, wide letters ---- */
async function p2() {
  if (!BEFORE_PORT || !want('P2')) return
  const read = async (port, size) => {
    const w = await world(size, port, true)
    await signIn(w, 'admin'); await w.page.evaluate(() => window.go('leavewar')); await sleep(900)
    await press(w, '[data-testid="oil-tracker"]'); await w.page.waitForSelector('[data-testid="oil-list"]'); await sleep(700)
    const m = await w.page.evaluate(() => Object.fromEntries(['.bidsheet-hd', '.oil-tools', '[data-testid="oil-window"]', '[data-testid="oil-list"]', '[data-testid="oil-range-first"]', '[data-testid="oil-settings"]'].map(s => { const q = document.querySelector(s).getBoundingClientRect(); return [s, [q.left, q.top, q.width, q.height].map(v => Math.round(v * 10) / 10)] })))
    const pic = await shot(w, `P2-oil-${port === BEFORE_PORT ? 'before' : 'after'}`, { x: 0, y: 0, width: size === 'phone' ? 402 : 1536, height: 220 })
    await w.b.close()
    return { m, pic }
  }
  for (const size of ['phone', 'desk']) {
    const a = await read(BEFORE_PORT, size), b = await read(PORT, size)
    const diffs = Object.keys(a.m).filter(k => a.m[k].some((v, i) => Math.abs(v - b.m[k][i]) > 0.5))
    rec('P2 the OIL tracker\'s head, tools, window line and list where they stood before the fix (wide letters)', size, diffs.length === 0, diffs.length ? diffs.map(k => `${k} ${a.m[k]} → ${b.m[k]}`).join('; ') : 'every part within 0.5px', [a.pic, b.pic])
  }
}
for (const s of ['desk', 'phone']) await run(s)
await p2()
writeFileSync(path.join(OUT, 'walk.json'), JSON.stringify(results, null, 1))
const n = v => results.filter(r => r.verdict === v).length
console.log(`DONE — ${n('PASS')} pass, ${n('FAIL')} fail, ${n('NOT WALKED')} not walked`)
