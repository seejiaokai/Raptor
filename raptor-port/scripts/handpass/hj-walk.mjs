/* [HIST-JUMP-EMPTY-SEAT] — THE WALK (10 Oct 26). The owner's find, on his iPhone: in the changes window a tap on a
   change whose seat is empty now was answered "shown on the scheduler board" on Edit Schedule and "shown on the week"
   on the board. This drives the REAL built app the way he did, on the demo Monday's own rows (SODB and FLIGHT SAFETY
   STAND-DOWN are his two), and asserts the RIGHT behaviour — so running it again on a later build is the re-walk.

   The fixture is made through the app's own controls on a desktop (a tap on a puck then on a row's "+ add" moves him;
   a right-click takes him off), saved, and opened again on a phone and as a member — the change history is kept
   across a reload (D338). Every line is pressed AT A POINT (a mouse press, or a finger), after that point is proved
   to be the line — never by a scripted press that scrolls first.

   HP_URL=http://localhost:4190 HP_SHOTS=<folder> node scripts/handpass/hj-walk.mjs [part]
   parts: fixture · desk · phone · member · refill · gone — then Astra's: togo · look · issued · oil · otherday · undo
   (none = all, in that order; desk, phone, member, refill and gone need fixture run first, look and issued need togo) */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { BASE, SHOTS, login, go, board, tap, put, publish } from './lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const WORK = process.env.HJ_WORK || SHOTS + '/_work'
mkdirSync(SHOTS, { recursive: true }); mkdirSync(WORK, { recursive: true })
const S1 = WORK + '/state-empty.json', S2 = WORK + '/state-refilled.json'
const only = process.argv[2] || ''
const want = p => !only || only === p

/* his PC shows the app at 125% (a 1440 × 900 window is 1152 × 720 of the page's own points); his phone is an iPhone */
const SIZES = {
  desk: { viewport: { width: 1152, height: 720 }, deviceScaleFactor: 1.25 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
const browser = await chromium.launch({ headless: true, ...launchOptions })
const errors = []
async function world(size, { who = 'a', state = null, fresh = false } = {}) {
  const ctx = await browser.newContext({ ...SIZES[size], ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${size}] ` + m.text()) })
  page.on('pageerror', e => errors.push(`[${size}] PAGEERROR ` + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${size}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { ctx, page, size }
}

const rows = []
async function step(id, what, expect, fn) {
  let got = '', ok = false
  try { got = await fn(); ok = true } catch (e) { got = 'FAIL — ' + String(e && e.message || e).split('\n')[0] }
  rows.push({ id, what, expect, got, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${what}\n        ${got}`)
}
const must = (cond, msg) => { if (!cond) throw new Error(msg) }
const val = (page, key) => page.evaluate(k => window.slotVal(k), key)
const cs = (page, id) => page.evaluate(i => (window.PEOPLE[i] ? window.PEOPLE[i].cs : i), id)

/* leave the board by its own one exit, "✓ Done" (D349) — the changes window closed first by its own ✕ */
async function closeWin(page) {
  const x = page.locator('.chgwin:visible button', { hasText: '✕' }).first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(250) }
}
async function doneBoard(page) {
  await closeWin(page)
  if (await page.evaluate(() => window.SBDAY == null)) return
  await page.locator('#schedBoard #sbDone:visible').first().click()
  await page.waitForTimeout(500)
  must(await page.evaluate(() => window.SBDAY == null), 'the board did not close')
}

/* ---- the changes window ---- */
async function openWin(page, how) {
  if (!(await page.locator('.chgwin:visible').count())) {
    if (how === 'board') await page.locator('#schedBoard #sbHist:visible').first().click()
    else if (how === 'week') await page.locator('#histBtn:visible').first().click()
    else await page.locator(how).first().click()
    await page.waitForSelector('.chgwin:visible')
  }
  const all = page.locator('.chgwin .win-tab:visible', { hasText: 'All changes' })
  if (await all.count()) await all.first().click()
  const mon = page.locator('.chgwin .cw-day:visible', { hasText: /^Mon/ })
  if (await mon.count()) await mon.first().click()
  await page.waitForTimeout(250)
}
const lines = page => page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-l')].filter(e => e.offsetParent).map(e => ({ btn: e.tagName === 'BUTTON', key: e.dataset.cwkey || '', text: (e.textContent || '').replace(/\s+/g, ' ').trim(), head: ((e.closest('.cw-item,.cw-grp') || e.parentElement).querySelector('.cw-ih,.cw-gh,b') || {}).textContent || '' })))

const noteShown = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return !!t && +getComputedStyle(t).opacity > 0.05 })
/* PRESS A LINE AT A POINT. The line is brought into its own list's view by the list's scroll (a person scrolls the
   window, not the page), the point is proved to be the line, then a mouse press or a finger lands on it. */
async function pressLine(page, size, pos, name, has = '', mockNote = '') {
  /* on a phone the window drops to a slim bar after a tap, so the schedule can be seen (D339): "Show" brings it back */
  const show = page.locator('.cw-show:visible').first()
  if (await show.count()) { const b = await show.boundingBox(); if (SIZES[size].hasTouch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400) }
  /* `pos` is a place ("a:0.0.0") on the All changes tab; on To go out — whose lines carry no place of their own — it is
     { togo: '<words of the line>' } */
  const LSEL = typeof pos === 'string' ? '.chgwin .cw-l' : '.chgwin [data-pltarget], .chgwin [data-plix]'
  const idx = await page.evaluate(([p, h, sel]) => {
    const all = [...document.querySelectorAll(sel)].filter(e => e.offsetParent)
    if (typeof p !== 'string') return all.findIndex(e => (e.textContent || '').includes(p.togo))
    return all.findIndex(e => e.dataset.cwkey && (e.dataset.cwkey === p || window.posKey(e.dataset.cwkey) === p) && (!h || (e.textContent || '').includes(h)))
  }, [pos, has, LSEL])
  if (typeof pos !== 'string') pos = 'the To go out line "' + pos.togo + '"'
  must(idx >= 0, `no line for ${pos}${has ? ' naming ' + has : ''} in the window`)
  const pt = await page.evaluate(([i, sel]) => {
    const el = [...document.querySelectorAll(sel)].filter(e => e.offsetParent)[i]
    let sc = el.parentElement
    while (sc && !(sc.scrollHeight > sc.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    if (sc) { const a = el.getBoundingClientRect(), b = sc.getBoundingClientRect(); if (a.top < b.top || a.bottom > b.bottom) sc.scrollTop += a.top - b.top - (b.height - a.height) / 2 }
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    const hit = document.elementFromPoint(x, y)
    return { x, y, btn: el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || getComputedStyle(el).cursor === 'pointer', hit: !!hit && (hit === el || el.contains(hit)), text: (el.textContent || '').replace(/\s+/g, ' ').trim() }
  }, [idx, LSEL])
  must(pt.btn, `the line is not a button: "${pt.text}"`)
  must(pt.hit, `the point of the line is covered by something else: "${pt.text}"`)
  /* the last passing note is let fade first — a note still on screen would be read as this press's own */
  for (let i = 0; i < 40; i++) { if (!(await noteShown(page))) break; await page.waitForTimeout(150) }
  if (SIZES[size].hasTouch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
  if (mockNote) await page.evaluate(n => window.toast(n, 'warn'), mockNote)
  /* the page glides to the place (a smooth scroll): it is measured once it has come to rest, while the mark still shows */
  await page.waitForTimeout(300)
  for (let i = 0, last = ''; i < 8; i++) {
    const at = await page.evaluate(() => { const e = document.querySelector('.chgflash'); if (!e) return 'none'; const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) })
    if (at === last) break
    last = at; await page.waitForTimeout(110)
  }
  const seen = await page.evaluate(() => {
    const t = document.getElementById('toastEl')
    const said = t && +getComputedStyle(t).opacity > 0.4 ? t.textContent : ''
    const el = document.querySelector('.chgflash')
    if (!el) return { toast: said, lit: null, page: window.CURPAGE, board: window.SBDAY }
    const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, hit = document.elementFromPoint(cx, cy)
    const win = document.querySelector('.chgwin'), wr = win && win.offsetParent ? win.getBoundingClientRect() : null
    const row = el.closest('.sb-arow,.pl-row,.ah-row,.sb-line,.form')
    return {
      toast: said, page: window.CURPAGE, board: window.SBDAY,
      lit: {
        fill: el.dataset.fill || '', slot: el.dataset.slot || '', cls: el.className, w: Math.round(r.width), h: Math.round(r.height),
        inView: r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw,
        onTop: !!hit && (hit === el || el.contains(hit) || hit.contains(el)),
        underWin: !!wr && !(r.right <= wr.left || r.left >= wr.right || r.bottom <= wr.top || r.top >= wr.bottom),
        outline: getComputedStyle(el).animationName + ' / ' + getComputedStyle(el).outlineStyle + ' / ' + getComputedStyle(el).boxShadow.slice(0, 40),
        rowText: row ? (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : '',
      },
    }
  })
  if (name) await page.screenshot({ path: `${SHOTS}/${name}.png` })
  await page.waitForTimeout(1500)   // the mark fades; the next press starts clean
  return { ...seen, text: pt.text }
}
/* the landing a person can SEE: marked, on screen, not under the window, nothing over it */
function seenOK(s, { fill, slot, toast }) {
  must(!/shown on the (scheduler board|week)|no longer|not shown/.test(s.toast || ''), `it said "${s.toast}"`)
  must((s.toast || '') === toast, `it said "${s.toast}", expected "${toast}"`)
  must(s.lit, 'nothing on the page was marked')
  if (fill) must(s.lit.fill === fill, `the mark is on ${s.lit.fill || s.lit.slot || s.lit.cls}, expected the people box ${fill}`)
  if (slot) must(s.lit.slot === slot, `the mark is on ${s.lit.slot || s.lit.fill || s.lit.cls}, expected the place ${slot}`)
  must(s.lit.inView, 'the marked place is off the screen')
  must(!s.lit.underWin, 'the marked place is under the changes window')
  must(s.lit.onTop, 'something is drawn over the marked place')
  must(s.lit.w > 8 && s.lit.h > 8, `the marked place has no size (${s.lit.w} × ${s.lit.h})`)
  return `"${s.text.slice(0, 70)}" → ${s.toast ? `said "${s.toast}"` : 'said nothing'}; marked ${s.lit.fill ? 'the people box of' : 'the place on'} "${s.lit.rowText}" (${s.lit.w} × ${s.lit.h}, on screen, clear of the window)`
}

/* THE PLACES OF THE ROLL-CALL on Monday — emptied by the fixture. `board` / `week`: where the tap must land on each page
   (a people box "<row>.+", or the seat itself where that page draws it empty) */
const EMPTY = 'That seat is empty now'
const P = {
  sodb: { name: 'Common Programme — SODB (he moved in, then on)', key: 'a:0.0.0', board: { fill: 'a:0.0.+' }, week: { fill: 'a:0.0.+' } },
  fssd: { name: 'Common Programme — FLIGHT SAFETY STAND-DOWN (he moved out)', key: 'a:0.2.0', board: { fill: 'a:0.2.+' }, week: { fill: 'a:0.2.+' } },
  desk: { name: 'Duty desk — SDO', key: 'd:0.0.0', board: { fill: 'd:0.0.0.+' }, week: { fill: 'd:0.0.0.+' } },
  deskx: { name: 'Duty desk — SXO, an extra man', key: 'd:0.0.1.x0', board: { fill: 'd:0.0.1.+' }, week: { fill: 'd:0.0.1.+' } },
  grnd: { name: 'Ground row — HQ ENGAGEMENT', key: 'g:0.0', board: { fill: 'g:0.0.+' }, week: { fill: 'g:0.0.+' } },
  sim: { name: 'Sim — OFT EP-4, front seat', key: 's:0.oft.0.p', board: { slot: 's:0.oft.0.p' }, week: { fill: 's:0.oft.0.+' } },
  pax: { name: 'Sim — AMT BOX, a passenger', key: 's:0.amt.1.pax.0', board: { slot: 's:0.amt.1.pax.0' }, week: { fill: 's:0.amt.1.+' } },
  fly: { name: 'Flying line — front seat', key: '0.0.0.0.p', board: { slot: '0.0.0.0.p' }, week: { slot: '0.0.0.0.p' } },
}
const expectOf = (p, s) => ({ ...p[s], toast: p[s].fill ? EMPTY : '' })
const saysOf = (p, s) => (p[s].fill ? `lands on the row's people box, says "${EMPTY}"` : 'lands on the empty seat itself, says nothing')

/* ================= THE FIXTURE — through the app's own controls ================= */
if (want('fixture')) {
  /* a new browser has nothing saved, so this IS the demo world — and not "?fresh=1", which keeps nothing to reopen */
  const { ctx, page } = await world('desk')
  await board(page, 0)
  const rclick = async key => { const el = page.locator(`#schedBoard [data-slot="${key}"]:visible`).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click({ button: 'right' }); await page.waitForTimeout(300) }
  /* a man is moved by dragging his puck onto the other row's people box — a real mouse drag, in steps */
  const move = async (from, toFill) => {
    const a = page.locator(`#schedBoard [data-slot="${from}"]:visible`).first(), b = page.locator(`#schedBoard [data-fill="${toFill}"]:visible`).first()
    await a.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
    const ra = await a.boundingBox(), rb = await b.boundingBox()
    must(ra && rb && rb.y > 0 && rb.y + rb.height < 720, 'the two rows are not both on screen')
    await page.mouse.move(ra.x + ra.width / 2, ra.y + ra.height / 2)
    await page.mouse.down()
    await page.mouse.move(ra.x + ra.width / 2 + 6, ra.y + ra.height / 2 + 6, { steps: 3 })
    await page.mouse.move(rb.x + rb.width - 14, rb.y + rb.height / 2, { steps: 14 })
    await page.waitForTimeout(120)
    await page.mouse.up()
    await page.waitForTimeout(450)
  }
  await step('F1', 'Board, Monday: drag the man on FLIGHT SAFETY STAND-DOWN onto SODB', 'he moves to SODB', async () => {
    const man = await val(page, 'a:0.2.0'); must(man, 'nobody on FLIGHT SAFETY STAND-DOWN')
    await move('a:0.2.0', 'a:0.0.+')
    must(await val(page, 'a:0.0.0') === man && !(await val(page, 'a:0.2.0')), `SODB holds "${await val(page, 'a:0.0.0')}", the stand-down "${await val(page, 'a:0.2.0')}"`)
    return `${await cs(page, man)} is on SODB; FLIGHT SAFETY STAND-DOWN is empty`
  })
  await step('F2', 'Drag him from SODB onto WPNS & TACTICS SYNC', 'he moves on; SODB and the stand-down both stand empty ("+ ADD")', async () => {
    const man = await val(page, 'a:0.0.0')
    await move('a:0.0.0', 'a:0.3.+')
    const where = await page.evaluate(m => window.DAYS[0].allhands.map(r => [r.prog, JSON.stringify(r.who || '')]).filter(x => x[1].includes(m)).map(x => x[0]).join(', '), man)
    must(!(await val(page, 'a:0.0.0')) && where && !/SODB/.test(where), `he did not move on (he is on: ${where || 'no row'})`)
    return `${await cs(page, man)} is on ${where}; SODB and FLIGHT SAFETY STAND-DOWN are empty`
  })
  await step('F3', 'Add an extra man under the SXO desk ("+ add", then a puck)', 'an extra man stands under SXO', async () => {
    const r = await put(page, '[data-fill="d:0.0.1.+"]', ['wolf', 'slash', 'snap', 'divot', 'dj'])
    must(!/^FAILED/.test(r) && await val(page, 'd:0.0.1.x0') === r, 'no extra man landed: ' + r)
    return `${await cs(page, r)} added under SXO`
  })
  for (const [id, k] of [['F4', 'd:0.0.1.x0'], ['F5', 'd:0.0.0'], ['F6', 'g:0.0'], ['F7', 's:0.oft.0.p'], ['F8', 's:0.amt.1.pax.0'], ['F9', '0.0.0.0.p']]) {
    await step(id, `Right-click the man on ${k}`, 'he is taken off; the place is empty', async () => {
      const man = await val(page, k); must(man, 'nobody there to take off')
      await rclick(k)
      must(!(await val(page, k)), 'he is still there')
      return `${await cs(page, man)} taken off`
    })
  }
  await page.screenshot({ path: `${SHOTS}/00-fixture-board.png` })
  await page.waitForTimeout(900)       // the save is written a moment after the last change
  await ctx.storageState({ path: S1 })
  await ctx.close()
}

/* ================= DESKTOP, his PC's 125% — both pages that edit ================= */
if (want('desk')) {
  const { ctx, page, size } = await world('desk', { state: S1 })
  for (const s of ['board', 'week']) {
    if (s === 'board') await board(page, 0); else { await doneBoard(page); await go(page, 'editsched') }
    await openWin(page, s)
    if (s === 'board') console.log(JSON.stringify(await lines(page), null, 0).slice(0, 1800))
    let n = 0
    for (const [id, p] of Object.entries(P)) {
      n++
      await step(`D-${s === 'board' ? 'B' : 'W'}${n}`, `Desktop, ${s === 'board' ? 'Scheduler Board' : 'Edit Schedule'}: press the line of ${p.name}`, saysOf(p, s), async () =>
        seenOK(await pressLine(page, size, p.key, `d-${s}-${n}-${id}`), expectOf(p, s)))
    }
    await closeWin(page)
  }
  await ctx.close()
}

/* ================= A PHONE, by touch — where he found it ================= */
if (want('phone')) {
  const { ctx, page, size } = await world('phone', { state: S1 })
  await go(page, 'editsched')
  await page.waitForTimeout(400)
  await openWin(page, 'week')
  await page.screenshot({ path: `${SHOTS}/p-week-0-window.png` })
  let n = 0
  for (const id of ['sodb', 'fssd', 'desk', 'grnd', 'sim', 'fly']) {
    const p = P[id]; n++
    await step(`P-W${n}`, `Phone, Edit Schedule: a finger on the line of ${p.name}`, saysOf(p, 'week'), async () =>
      seenOK(await pressLine(page, size, p.key, `p-week-${n}-${id}`), expectOf(p, 'week')))
  }
  /* the board, on a phone */
  await page.evaluate(() => { const b = [...document.querySelectorAll('.chgwin button')].find(x => /✕|Close/.test(x.textContent || '') || x.getAttribute('aria-label') === 'Close'); if (b) b.click() })
  await page.waitForTimeout(300)
  await board(page, 0)
  await openWin(page, 'board')
  await page.screenshot({ path: `${SHOTS}/p-board-0-window.png` })
  n = 0
  for (const id of ['sodb', 'fssd', 'deskx', 'grnd', 'pax']) {
    const p = P[id]; n++
    await step(`P-B${n}`, `Phone, Scheduler Board: a finger on the line of ${p.name}`, saysOf(p, 'board'), async () =>
      seenOK(await pressLine(page, size, p.key, `p-board-${n}-${id}`), expectOf(p, 'board')))
  }
  await ctx.close()
}

/* ================= A MEMBER, on View-only Sched — read only, no box to add to ================= */
if (want('member')) {
  const { ctx, page, size } = await world('desk', { state: S1, who: 'us' })
  await go(page, 'viewsched')
  const doors = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] [data-pendlist], #vWeek .day[data-day="0"] [data-chgtab]')].filter(e => e.offsetParent).map(e => (e.textContent || '').trim() + ' · ' + JSON.stringify(e.dataset)))
  console.log('member doors on Monday:', doors)
  await step('M1', 'Member (Ranger), View-only Sched: open the changes window from Monday\'s own count', 'the window opens, read only', async () => {
    must(doors.length, 'Monday shows him no count to open the window from')
    await openWin(page, '#vWeek .day[data-day="0"] [data-pendlist]:visible, #vWeek .day[data-day="0"] [data-chgtab]:visible')
    return 'opened from: ' + doors[0]
  })
  const L = await lines(page)
  console.log('member lines:', JSON.stringify(L).slice(0, 900))
  await step('M2', 'Member: press the line of SODB (nobody is left on that row)', `says "${EMPTY}"; names no other page`, async () => {
    const s = await pressLine(page, size, P.sodb.key, 'm-view-1-sodb')
    must(s.toast === EMPTY, `it said "${s.toast}"`)
    return `said "${s.toast}"` + (s.lit ? `; marked "${s.lit.rowText}"` : '; nothing to mark — a read-only page draws no box on a row nobody is on')
  })
  await step('M3', 'Member: press the line of the extra man under SXO (the desk still holds its own man)', `lands on that desk's people, says "${EMPTY}"`, async () => {
    const s = await pressLine(page, size, P.deskx.key, 'm-view-2-deskx')
    must(s.toast === EMPTY, `it said "${s.toast}"`)
    must(s.lit && s.lit.inView && /SXO/.test(s.lit.rowText), 'the SXO desk was not marked on screen: ' + JSON.stringify(s.lit))
    return `said "${s.toast}"; marked the people of "${s.lit.rowText}"`
  })
  await ctx.close()
}

/* ================= ANOTHER MAN HAS TAKEN THE PLACE (D733) — and the picture he asked for ================= */
if (want('refill')) {
  const { ctx, page, size } = await world('desk', { state: S1 })
  await board(page, 0)
  let other = ''
  await step('R1', 'Board: put another man on SODB ("+ add", then a puck)', 'he stands in the place the first man left', async () => {
    const r = await put(page, '[data-fill="a:0.0.+"]', ['wolf', 'slash', 'snap', 'divot', 'dj'])
    must(!/^FAILED/.test(r) && await val(page, 'a:0.0.0') === r, 'nobody landed on SODB: ' + r)
    other = await cs(page, r)
    return `${other} is on SODB now`
  })
  await page.waitForTimeout(900)
  await ctx.storageState({ path: S2 })
  await openWin(page, 'board')
  await step('R2', 'Desktop, Scheduler Board: press the FIRST man\'s line about SODB', `lands on the place — ${other || 'the other man'}'s puck — and says nothing (D733)`, async () =>
    seenOK(await pressLine(page, size, P.sodb.key, 'r-board-sodb-refilled', 'Ranger'), { slot: 'a:0.0.0', toast: '' }))
  await ctx.close()
  const ph = await world('phone', { state: S2 })
  await go(ph.page, 'editsched'); await ph.page.waitForTimeout(400)
  await openWin(ph.page, 'week')
  await step('R3', 'Phone, Edit Schedule: a finger on the first man\'s line about SODB', `lands on ${other || 'the other man'}'s puck and says nothing (D733)`, async () =>
    seenOK(await pressLine(ph.page, 'phone', P.sodb.key, 'r-phone-sodb-refilled', 'Ranger'), { slot: 'a:0.0.0', toast: '' }))
  /* THE OTHER CHOICE, drawn for him to compare — NOT built: the same tap with a passing note naming who is there now */
  await pressLine(ph.page, 'phone', P.sodb.key, '', 'Ranger').catch(() => {})
  await pressLine(ph.page, 'phone', P.sodb.key, 'r-phone-sodb-refilled-MOCK-note', 'Ranger', other + ' is here now')
  await ph.ctx.close()
}

/* ================= THE ROW ITSELF HAS GONE — today's words, kept ================= */
if (want('gone')) {
  const { ctx, page, size } = await world('desk', { state: S1 })
  await board(page, 0)
  await openWin(page, 'board')
  const sodbLines = await page.evaluate(p => [...document.querySelectorAll('.chgwin .cw-l')].filter(e => e.offsetParent && e.dataset.cwkey && window.posKey(e.dataset.cwkey) === p).map(e => e.dataset.cwkey), P.sodb.key)
  await closeWin(page)
  await step('G1', 'Board: delete the SODB row by its own ✕', 'the row is gone', async () => {
    const before = await page.evaluate(() => window.DAYS[0].allhands.length)
    const row = page.locator('#schedBoard .sb-arow:visible', { has: page.locator('[data-fill="a:0.0.+"]') }).first()
    await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
    const x = row.locator('button:visible, .mbtn:visible').filter({ hasText: /✕|×/ }).first()
    must(await x.count(), 'the row shows no ✕')
    await x.click(); await page.waitForTimeout(350)
    const yes = page.locator('.modal:visible button, .confirm:visible button, dialog button').filter({ hasText: /Delete|Remove|Yes|OK/ }).first()
    if (await yes.count()) { await yes.click(); await page.waitForTimeout(350) }
    const after = await page.evaluate(() => window.DAYS[0].allhands.length)
    must(after === before - 1, `the programme still has ${after} rows (had ${before})`)
    return `the Common Programme has ${after} rows (had ${before})`
  })
  await openWin(page, 'board')
  await step('G2', 'Press the line about SODB', 'says "That detail is no longer on this day"; marks nothing', async () => {
    must(sodbLines.length, 'no line about SODB was found before the row was deleted')
    const s = await pressLine(page, size, sodbLines[0], 'g-board-sodb-row-gone')
    must(/no longer on this day/.test(s.toast), `it said "${s.toast}"`)
    must(!s.lit, 'something was marked')
    return `said "${s.toast}"`
  })
  await ctx.close()
}

/* =====================================================================================================================
   THE SCENARIOS ASTRA DESIGNED (its read of 10 Oct 26 — docs/superpowers/briefs/2026-10-10-hist-jump-empty-seat-scenarios.md):
   the doors and states the first walk did not have — a published day's "To go out" lines, a look at an older version on
   the board, a member on the issued face, OIL Earn mode, a line of another day, Undo and Redo after a tap.
   ===================================================================================================================== */
const S3 = WORK + '/state-published.json', S4 = WORK + '/state-otherdays.json'
const rclickOn = async (page, key) => { const el = page.locator(`#schedBoard [data-slot="${key}"]:visible`).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click({ button: 'right' }); await page.waitForTimeout(300) }
const bubbleUp = page => page.evaluate(() => { const b = document.querySelector('.histbub'); if (!b) return false; const r = b.getBoundingClientRect(), s = getComputedStyle(b); return r.width > 0 && s.display !== 'none' && s.visibility !== 'hidden' })
const tabOf = async (page, words) => { await page.locator('.chgwin .win-tab:visible', { hasText: words }).first().click(); await page.waitForTimeout(250) }

/* ---- A PUBLISHED DAY: the To go out lines name several places at once (Astra 1, scenario 3) ---- */
if (want('togo')) {
  const { ctx, page, size } = await world('desk')
  await board(page, 0)
  let extra = ''
  await step('T1', 'Board, Monday: add an extra man under the SXO desk, then sign the four names and publish the day', 'Monday is published with the extra man on it', async () => {
    const r = await put(page, '[data-fill="d:0.0.1.+"]', ['wolf', 'slash', 'snap', 'divot', 'dj'])
    must(!/^FAILED/.test(r), 'no extra man landed: ' + r)
    extra = await cs(page, r)
    const p = await publish(page, 0)
    must(p.published, 'the day was not published: ' + JSON.stringify(p))
    return `${extra} under SXO; published as ${p.version || 'ORIG'}`
  })
  await step('T2', 'Take the extra man off (right-click), and the one man on MET + NOTAM BRIEF', 'two changes wait to go out', async () => {
    await rclickOn(page, 'd:0.0.1.x0'); await rclickOn(page, 'a:0.1.0')
    must(!(await val(page, 'd:0.0.1.x0')) && !(await val(page, 'a:0.1.0')), 'a man is still there')
    return 'both taken off; the day reads pending'
  })
  await page.waitForTimeout(900)
  await ctx.storageState({ path: S3 })
  await openWin(page, 'board')
  await tabOf(page, 'To go out')
  console.log('To go out lines:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.chgwin [data-plix], .chgwin [data-pltarget]')].filter(e => e.offsetParent).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)))))
  await step('T3', 'To go out: press the line of the SXO desk (its extra man was taken off; its own man still stands)', `lands on the desk's people box, says "${EMPTY}", and opens no History bubble`, async () => {
    const s = await pressLine(page, size, { togo: 'SXO' }, 't-togo-1-sxo-extra')
    const r = seenOK(s, { fill: 'd:0.0.1.+', toast: EMPTY })
    must(!(await bubbleUp(page)), 'a History bubble opened — another detail\'s story')
    return r + '; no bubble'
  })
  await step('T4', 'To go out: press the line of MET + NOTAM BRIEF (its only man was taken off)', `lands on that row's people box, says "${EMPTY}", and opens no History bubble`, async () => {
    const s = await pressLine(page, size, { togo: 'MET + NOTAM' }, 't-togo-2-prog-sole')
    const r = seenOK(s, { fill: 'a:0.1.+', toast: EMPTY })
    must(!(await bubbleUp(page)), 'a History bubble opened — the row heading\'s story')
    return r + '; no bubble'
  })
  await ctx.close()
}

/* ---- THE BOARD IS SHOWING AN OLDER VERSION (Astra 2) ---- */
if (want('look')) {
  const { ctx, page, size } = await world('desk', { state: S3 })
  await board(page, 0)
  await step('L1', 'Board, Monday: open the version menu and look at the published version', 'the board shows the day as it went out — the extra man still under SXO', async () => {
    await page.locator('#schedBoard [data-planmenu="0"]:visible').first().click(); await page.waitForTimeout(300)
    const pv = page.locator('[data-planpv]:visible').first()
    must(await pv.count(), 'the menu offers no version to look at')
    const which = (await pv.innerText()).replace(/\s+/g, ' ').trim()
    await pv.click(); await page.waitForTimeout(500)
    must(await page.locator('#schedBoard .pv-frozen').count(), 'the board is not showing the older version')
    return `looking at "${which.slice(0, 40)}"`
  })
  await openWin(page, 'board')
  await step('L2', 'All changes: press the line of the extra man taken off the SXO desk', `the board goes back to the working copy and lands on the desk's people box, saying "${EMPTY}"`, async () => {
    const s = await pressLine(page, size, P.deskx.key, 'l-board-look-returns')
    must(!(await page.locator('#schedBoard .pv-frozen').count()), `the board still shows the older version — and it said "${s.toast}"`)
    return seenOK(s, { fill: 'd:0.0.1.+', toast: EMPTY }) + '; the older version is no longer on the board'
  })
  await ctx.close()
}

/* ---- A MEMBER ON THE ISSUED FACE (Astra scenario 5) ---- */
if (want('issued')) {
  const { ctx, page, size } = await world('desk', { state: S3, who: 'us' })
  await go(page, 'viewsched')
  const VW = '#vWeek .day[data-day="0"] select[data-vwork="0"]'
  const face = () => page.evaluate(sel => (document.querySelector(sel) || {}).value || '', VW)
  await step('I1', 'Member (Ranger), View-only Sched, published Monday: switch the day to "Working draft", open the changes window from its count, then switch back to "as issued"', 'the window is open, read only, over the day as it was issued', async () => {
    must(await page.locator(VW + ':visible').count(), 'Monday offers no switch between the issued day and the working draft')
    await page.selectOption(VW, 'working'); await page.waitForTimeout(400)
    const door = '#vWeek .day[data-day="0"] [data-pendlist]:visible, #vWeek .day[data-day="0"] [data-chgtab]:visible'
    must(await page.locator(door).count(), 'the working draft shows him no count to open the window from')
    await openWin(page, door)
    await page.selectOption(VW, 'issued'); await page.waitForTimeout(400)
    must(await face() === 'issued', 'the day did not go back to its issued face')
    return 'window open (' + (await page.locator('.chgwin .win-tab:visible').allInnerTexts()).join(' / ').replace(/\s+/g, ' ') + '); Monday shows "as issued"'
  })
  await step('I2', 'Press the line of the extra man taken off the SXO desk', `the day turns to its working draft; the SXO desk's people are marked; says "${EMPTY}"`, async () => {
    const s = await pressLine(page, size, P.deskx.key, 'i-member-issued-face')
    must(s.toast === EMPTY, `it said "${s.toast}"`)
    must(s.lit && s.lit.inView && /SXO/.test(s.lit.rowText), 'the SXO desk was not marked on screen: ' + JSON.stringify(s.lit))
    must(await face() === 'working', 'Monday did not turn to its working draft')
    return `Monday shows its working draft; marked the people of "${s.lit.rowText}"; said "${s.toast}"`
  })
  await ctx.close()
}

/* ---- OIL EARN MODE: the seats and names are OIL switches there (Astra 3, scenario 1) ---- */
if (want('oil')) {
  const { ctx, page, size } = await world('desk')
  await board(page, 5)
  const DESK = 'd:5.0.0'
  let own = '', extra = ''
  await step('O1', 'Board, Saturday: add an extra man under the duty desk, then take the desk\'s own man off', 'the desk\'s own seat is empty; the extra man stands under it', async () => {
    own = await val(page, DESK); must(own, 'Saturday has no duty desk with a man on it')
    const r = await put(page, `[data-fill="${DESK}.+"]`, ['wolf', 'slash', 'snap', 'divot', 'dj', 'bane', 'stiff'])
    must(!/^FAILED/.test(r) && await val(page, DESK + '.x0') === r, 'no extra man landed: ' + r)
    extra = r
    await rclickOn(page, DESK)
    must(!(await val(page, DESK)), 'the desk\'s own man is still there')
    return `${await cs(page, own)} taken off; ${await cs(page, extra)} stands under the desk`
  })
  let before = ''
  await step('O2', 'Turn OIL Earn on', 'the row\'s name becomes an OIL switch; nothing on the board can be edited', async () => {
    await page.locator('#schedBoard #sbOil:visible').first().click(); await page.waitForTimeout(700)
    const n = await page.evaluate(() => document.querySelectorAll('#schedBoard [data-oilitem]').length)
    must(n > 0, 'OIL Earn did not come on')
    before = await page.evaluate(() => JSON.stringify(window.DAYS[5]))
    return `OIL Earn is on (${n} switches)`
  })
  await openWin(page, 'board')
  const sa = page.locator('.chgwin .cw-day:visible', { hasText: /^Sat/ }); if (await sa.count()) { await sa.first().click(); await page.waitForTimeout(250) }
  await step('O3', 'Press the line of the extra man put under the desk (he IS there)', 'lands on his own puck; says nothing — never "not shown"', async () => {
    const s = await pressLine(page, size, DESK + '.x0', 'o-oil-1-occupied')
    must(!(s.toast || ''), `it said "${s.toast}"`)
    must(s.lit && s.lit.inView && s.lit.onTop && !s.lit.underWin, 'his puck was not marked on screen: ' + JSON.stringify(s.lit))
    const his = await page.evaluate(id => { const e = document.querySelector('.chgflash'); return !!e && !!(e.matches('[data-person="' + id + '"]') || e.querySelector('[data-person="' + id + '"]')) }, extra)
    return `said nothing; marked "${s.lit.rowText}"` + (his ? ' — his own puck' : ' — the row')
  })
  await step('O4', 'Press the line of the desk\'s own man, taken off', `lands on the desk — its name — and says "${EMPTY}"`, async () => {
    const s = await pressLine(page, size, DESK, 'o-oil-2-emptied')
    must(s.toast === EMPTY, `it said "${s.toast}"`)
    must(s.lit && s.lit.inView && s.lit.onTop && !s.lit.underWin, 'the desk was not marked on screen: ' + JSON.stringify(s.lit))
    return `said "${s.toast}"; marked "${s.lit.rowText}"`
  })
  await step('O5', 'After the two taps: is Saturday unchanged, and OIL Earn still on?', 'nothing was written; no OIL switch was thrown', async () => {
    const after = await page.evaluate(() => JSON.stringify(window.DAYS[5]))
    must(after === before, 'Saturday changed under the taps')
    must(await page.evaluate(() => document.querySelectorAll('#schedBoard [data-oilitem]').length) > 0, 'OIL Earn went off')
    return 'Saturday is byte for byte what it was; OIL Earn is still on'
  })
  await ctx.close()
}

/* ---- A LINE OF ANOTHER DAY (Astra scenarios 6, 7) ---- */
if (want('otherday')) {
  const { ctx, page, size } = await world('desk')
  /* a place on that day's schedule with a man in it, and its row's people box: a programme row of one man, else a duty desk */
  const placeOn = di => page.evaluate(d => {
    const ok = id => id && window.PEOPLE[id] && !window.PEOPLE[id].special, day = window.DAYS[d]
    const a = (day.allhands || []).findIndex(r => { const w = Array.isArray(r.who) ? r.who : [r.who]; return w.length === 1 && ok(w[0]) })
    if (a >= 0) return { key: `a:${d}.${a}.0`, fill: `a:${d}.${a}.+`, name: day.allhands[a].prog }
    for (let wi = 0; wi < (day.dutywaves || []).length; wi++) { const ri = (day.dutywaves[wi].rows || []).findIndex(r => ok(r.id)); if (ri >= 0) return { key: `d:${d}.${wi}.${ri}`, fill: `d:${d}.${wi}.${ri}.+`, name: day.dutywaves[wi].rows[ri].role } }
    return null
  }, di)
  const toBoard = async di => { await doneBoard(page); await board(page, di) }
  let tue = null, sun = null
  await step('X1', 'Board: take a man off a row on Tuesday, and on Sunday', 'an empty seat on each of two other days', async () => {
    await toBoard(1); tue = await placeOn(1); must(tue, 'Tuesday has no row with a man to take off'); await rclickOn(page, tue.key)
    await toBoard(6); sun = await placeOn(6); must(sun, 'Sunday has no row with a man to take off'); await rclickOn(page, sun.key)
    must(!(await val(page, tue.key)) && !(await val(page, sun.key)), 'a man is still there')
    return `Tuesday's ${tue.name} and Sunday's ${sun.name} are empty`
  })
  await page.waitForTimeout(900)
  await ctx.storageState({ path: S4 })
  await toBoard(0)
  await openWin(page, 'board')
  await page.locator('.chgwin .cw-day:visible', { hasText: /^Week/ }).first().click(); await page.waitForTimeout(250)
  await step('X2', 'Board open on MONDAY; the window on Week: press Tuesday\'s line', `the board turns to Tuesday and lands on that row's people box, saying "${EMPTY}"`, async () => {
    const s = await pressLine(page, size, tue.key, 'x-board-other-day')
    must(s.board === 1, `the board is on day ${s.board}, not Tuesday`)
    return seenOK(s, { fill: tue.fill, toast: EMPTY }) + '; the board is on Tuesday'
  })
  await ctx.close()
  const ph = await world('phone', { state: S4 })
  await go(ph.page, 'editsched'); await ph.page.waitForTimeout(400)
  await openWin(ph.page, 'week')
  await ph.page.locator('.chgwin .cw-day:visible', { hasText: /^Week/ }).first().click(); await ph.page.waitForTimeout(250)
  await step('X3', 'Phone, Edit Schedule showing Monday; the window on Week: a finger on SUNDAY\'s line', `the week steps to Sunday; that row's people box is on screen, clear of the bar; says "${EMPTY}"`, async () => {
    const s = await pressLine(ph.page, 'phone', sun.key, 'x-phone-sunday')
    return seenOK(s, { fill: sun.fill, toast: EMPTY })
  })
  await ph.ctx.close()
}

/* ---- UNDO AND REDO AFTER A TAP (Astra scenario 15) ---- */
if (want('undo')) {
  const { ctx, page, size } = await world('desk')
  await board(page, 0)
  const K = 'a:0.1.0'
  let man = ''
  await step('U1', 'Board, Monday: take the one man off MET + NOTAM BRIEF; press his line', `lands on the row's people box, says "${EMPTY}"`, async () => {
    man = await val(page, K); await rclickOn(page, K)
    await openWin(page, 'board')
    return seenOK(await pressLine(page, size, K, 'u-1-emptied'), { fill: 'a:0.1.+', toast: EMPTY })
  })
  await step('U2', 'Press Undo (the board\'s top bar), then the same line', 'Undo puts the man back — it is the move that is undone, not the tap; the line now lands on his puck and says nothing', async () => {
    await page.locator('#schedBoard #sbUndo:visible').first().click(); await page.waitForTimeout(500)
    must(await val(page, K) === man, 'Undo did not put him back')
    const s = await pressLine(page, size, K, 'u-2-after-undo')
    return seenOK(s, { slot: K, toast: '' }) + `; ${await cs(page, man)} is back`
  })
  await step('U3', 'Press Redo, then the same line', `he is off again; the line lands on the row's people box, says "${EMPTY}"`, async () => {
    await page.locator('#schedBoard #sbRedo:visible').first().click(); await page.waitForTimeout(500)
    must(!(await val(page, K)), 'Redo did not take him off again')
    return seenOK(await pressLine(page, size, K, 'u-3-after-redo'), { fill: 'a:0.1.+', toast: EMPTY })
  })
  await ctx.close()
}

await browser.close()
writeFileSync(`${WORK}/results-${only || 'all'}.json`, JSON.stringify({ rows, errors }, null, 1))
console.log(`\n${rows.filter(r => r.ok).length} PASS · ${rows.filter(r => !r.ok).length} FAIL · browser errors: ${errors.length}`)
errors.slice(0, 10).forEach(e => console.log('  ' + e))
