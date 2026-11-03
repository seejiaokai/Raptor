// Inputs-seen re-check, part B (3 Nov 26): the calendar job's small finds of 8 Oct, looked at again on today's build.
//   node scripts/handpass/isr-B.mjs            (all; empties its folder first)      ONLY=b1 node scripts/handpass/isr-B.mjs   (one part, folder kept)
import * as L from './isr-B-lib.mjs'
const { check, info, notWalked, press, tid, shot, mark, unmark, rect, hitOf, sleep, go, openWins, closeWins } = L
const ONLY = process.env.ONLY || ''
const want = k => !ONLY || ONLY.split(',').includes(k)
console.log('isr-B v1')
L.startRun(ONLY)
const browser = await L.launch()
const run = async (key, size, fn) => {
  if (!want(key)) return
  const w = await L.session(browser, size)
  try { await fn(w) } catch (e) { L.say(`ERROR ${key} ${size}: ${e.message.split('\n')[0]}`); console.log(e.stack); await shot(w.page, `${key}-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}
const BAR = ['#undoBtn', '#redoBtn', '#icPrev', '#icNext', '#inGear']
const coverage = async (w, sels) => {
  await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(250)
  const out = {}
  for (const s of sels) { const h = await hitOf(w.page, s); out[s] = h ? (h.own ? 'free' : `COVERED by ${h.inWin || h.hit}`) : 'absent' }
  return out
}

/* ===== B1a — a phone on its side ===== */
await run('b1', 'side', async w => {
  await L.toInputsCal(w, 2026, 7)
  info('B1a calendar on', await w.page.locator('#inpCal .ic-mon').innerText())
  await shot(w.page, 'B1a-side-calendar-no-window')
  const base = await coverage(w, BAR)
  check('B1a premise: every bar control is free with no window up', Object.values(base).every(v => v === 'free'), base)
  /* 1. a day opened on the Inputs calendar */
  await L.openIcDay(w, '2026-07-15')
  const day = await coverage(w, BAR)
  info('B1a opened day: window box', await rect(w.page, '[data-testid="win-inputsday"]'))
  check('B1a (day window) nothing of the top bar / arrows / gear is under the opened day', Object.values(day).every(v => v === 'free'), day)
  for (const s of BAR) if (day[s] !== 'free') await mark(w.page, s, { noscroll: true })
  await shot(w.page, 'B1a-side-day-open')
  await unmark(w.page, BAR.join(','))
  /* 2. the input window, from the day's + Input */
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor(); await sleep(400)
  const ed = await coverage(w, BAR)
  info('B1a input window: box', await rect(w.page, '[data-testid="win-inputedit"]'))
  check('B1a (input window) nothing of the bar is under the input window', Object.values(ed).every(v => v === 'free'), ed)
  for (const s of BAR) if (ed[s] !== 'free') await mark(w.page, s, { noscroll: true })
  await shot(w.page, 'B1a-side-input-window')
  await unmark(w.page, BAR.join(','))
  await closeWins(w)
  /* 3. the Inputs settings window (gear) and its Calendar window */
  await press(w, '#inGear'); await tid(w.page, 'win-inputsset').waitFor(); await sleep(400)
  const st = await coverage(w, BAR)
  info('B1a settings window: box', await rect(w.page, '[data-testid="win-inputsset"]'))
  check('B1a (Inputs settings window) nothing of the bar is under it', Object.values(st).every(v => v === 'free'), st)
  await shot(w.page, 'B1a-side-settings-window')
  await press(w, tid(w.page, 'iset-days')); await tid(w.page, 'win-days').waitFor(); await sleep(500)
  const cw = await coverage(w, BAR)
  info('B1a Calendar window: box', await rect(w.page, '[data-testid="win-days"]'))
  check('B1a (Calendar window) nothing of the bar is under it', Object.values(cw).every(v => v === 'free'), cw)
  for (const s of BAR) if (cw[s] !== 'free') await mark(w.page, s, { noscroll: true })
  await shot(w.page, 'B1a-side-calendar-window')
  await unmark(w.page, BAR.join(','))
  await closeWins(w)
  /* 4. SANS: opened day, then its Calendar... */
  await L.toSans(w, 2026, 7)
  const SB = ['#undoBtn', '#redoBtn', '[data-testid="sc-prev"]', '[data-testid="sc-next"]', '[data-testid="sc-gear"]']
  await L.openSansDay(w, '2026-07-14')
  const sd = await coverage(w, SB)
  info('B1a SANS day: box', await rect(w.page, '[data-testid="win-sansday"]'))
  check('B1a (SANS day) nothing of the bar is under the SANS day', Object.values(sd).every(v => v === 'free'), sd)
  for (const s of SB) if (sd[s] !== 'free') await mark(w.page, s, { noscroll: true })
  await shot(w.page, 'B1a-side-sans-day')
  await press(w, tid(w.page, 'sd-days')); await tid(w.page, 'win-days').waitFor(); await sleep(500)
  const sc = await coverage(w, SB)
  info('B1a Calendar window from SANS day: box', await rect(w.page, '[data-testid="win-days"]'))
  check('B1a (Calendar... from the SANS day) nothing of the bar is under it', Object.values(sc).every(v => v === 'free'), sc)
  for (const s of SB) if (sc[s] !== 'free') await mark(w.page, s, { noscroll: true })
  await shot(w.page, 'B1a-side-sans-calendar-window')
  await closeWins(w)
})

/* ===== B1b — SANS Highlight list on its side ===== */
await run('b1b', 'side', async w => {
  await L.toSans(w, 2026, 7)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(250)
  await press(w, tid(w.page, 'sc-hl')); await tid(w.page, 'sc-hl-menu').waitFor(); await sleep(300)
  const geo = () => w.page.evaluate(() => {
    const m = document.querySelector('[data-testid="sc-hl-menu"]'); const r = m.getBoundingClientRect()
    const items = [...m.querySelectorAll('[role=option]')]; const last = items[items.length - 1].getBoundingClientRect()
    const maxPageScroll = document.documentElement.scrollHeight - innerHeight
    return { vh: innerHeight, menu: [Math.round(r.top), Math.round(r.bottom)], items: items.length, lastItem: [Math.round(last.top), Math.round(last.bottom)], menuScroll: [m.scrollTop, m.scrollHeight, m.clientHeight], pageScrollY: Math.round(scrollY), maxPageScroll: Math.round(maxPageScroll), overflowY: getComputedStyle(m).overflowY, pos: getComputedStyle(m).position }
  })
  const g0 = await geo()
  info('B1b menu as it opens', g0)
  await mark(w.page, '[data-testid="sc-hl-menu"]', { noscroll: true })
  await shot(w.page, 'B1b-side-highlight-open')
  check('B1b the Highlight list lies wholly on the screen as it opens (bottom <= screen height)', g0.menu[1] <= g0.vh, g0)
  /* can a finger reach the last person? scroll the page down, then the menu itself */
  await w.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(300)
  const g1 = await geo()
  info('B1b after scrolling the page to its foot', g1)
  await w.page.evaluate(() => { const m = document.querySelector('[data-testid="sc-hl-menu"]'); m.scrollTop = m.scrollHeight }); await sleep(250)
  const g2 = await geo()
  info('B1b after also scrolling the list itself to its foot', g2)
  const reachable = g1.lastItem[1] <= g1.vh || g2.lastItem[1] <= g2.vh
  check('B1b the last person in the list can be brought wholly on screen by scrolling (page or list)', reachable, { page: g1.lastItem, list: g2.lastItem, vh: g1.vh })
  await shot(w.page, 'B1b-side-highlight-scrolled-to-foot')
})

/* ===== B1c — the number pad over the Required cell, on its side ===== */
await run('b1c', 'side', async w => {
  await go(w.page, 'leavewar'); await tid(w.page, 'row-slipway').waitFor({ timeout: 15000 }); await sleep(500)
  const fig = tid(w.page, 'figures-toggle')
  info('B1c Figures toggle reads', (await fig.count()) ? (await fig.innerText()).trim() : null)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  const month = tid(w.page, 'month-FEB')
  if (await month.count()) { await press(w, month); await sleep(500) }
  let iso = '2026-02-25'
  if (!(await tid(w.page, 'req-p-' + iso).count())) iso = await w.page.evaluate(() => (document.querySelector('[data-testid^="req-p-"]') || {}).getAttribute?.('data-testid')?.slice(6))
  info('B1c Required cell used', iso)
  await w.page.evaluate(iso => { const e = document.querySelector(`[data-testid="req-p-${iso}"]`); e.scrollIntoView({ block: 'center', inline: 'center' }) }, iso); await sleep(350)
  await press(w, tid(w.page, 'req-p-' + iso)); await sleep(500)
  if (!(await tid(w.page, 'fly-pad').count())) { notWalked('B1c', 'no number pad opened from the Required cell'); await shot(w.page, 'B1c-side-nopad'); return }
  const m = await w.page.evaluate(iso => {
    const R = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }
    const tb = document.querySelector('.topbar'); const tbr = tb ? Math.round(tb.getBoundingClientRect().bottom) : null
    const c = document.querySelector(`[data-testid="req-p-${iso}"]`).getBoundingClientRect()
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, c.left + c.width / 2)), Math.min(innerHeight - 1, Math.max(0, c.top + c.height / 2)))
    return { vh: innerHeight, pad: R('[data-testid="fly-pad"]'), cell: R(`[data-testid="req-p-${iso}"]`), topbarBottom: tbr, availP: R('[data-testid="fly-row-avail-p"]'), availW: R('[data-testid="fly-row-avail-w"]'), strip: R('[data-testid="fly-edit-strip"]'), cellHit: hit ? (hit.getAttribute('data-testid') || hit.id || hit.className).toString().slice(0, 40) : null }
  }, iso)
  info('B1c measures', m)
  const cellSeen = m.cell && m.cell[1] >= (m.topbarBottom || 0) - 1 && m.cell[3] <= m.pad[1] + 1 && /req-p/.test(m.cellHit || '')
  check('B1c the Required cell being typed is in sight: below the top bar, above the pad, and what a finger meets', !!cellSeen, m)
  await mark(w.page, `[data-testid="req-p-${iso}"]`, { noscroll: true })
  await shot(w.page, 'B1c-side-required-typing')
  await unmark(w.page, `[data-testid="req-p-${iso}"]`)
  /* pad keys all on screen? */
  const keys = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="fly-pad-"]')].map(b => { const r = b.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.top >= 0 }))
  info('B1c pad keys on screen (all?)', { n: keys.length, all: keys.every(Boolean) })
  await press(w, tid(w.page, 'fly-pad-7'))
  const typed = await w.page.evaluate(() => { const s = document.querySelector('[data-testid="fly-edit-strip"]'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : null })
  const cellTxt = await w.page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).innerText.replace(/\s+/g, ' ').trim(), iso)
  info('B1c after typing 7: what the pad strip says, and the cell itself (behind the pad)', { strip: typed, cell: cellTxt })
  await shot(w.page, 'B1c-side-required-typed-7')
  await press(w, tid(w.page, 'fly-pad-done')); await sleep(400)
  info('B1c after Done: the cell reads', await w.page.evaluate(iso => document.querySelector(`[data-testid="req-p-${iso}"]`).innerText.replace(/\s+/g, ' ').trim(), iso))
})

/* ===== B2a — Leave War Rearrange: the first tap after a finger-drag of a counter row ===== */
const cdpOf = async w => w.ctx.newCDPSession(w.page)
const b2a = async (w, rest) => {
  await go(w.page, 'leavewar'); await tid(w.page, 'row-slipway').waitFor({ timeout: 15000 }); await sleep(500)
  await press(w, tid(w.page, 'settings-open')); await sleep(300)
  await press(w, tid(w.page, 'counter-add')); await sleep(400)
  await tid(w.page, 'cform-name').fill('Delta')
  await press(w, tid(w.page, 'cf-seat-pilot'))
  await press(w, tid(w.page, 'cform-save')); await sleep(600)
  if (!(await tid(w.page, 'settings-rearrange').count())) { await press(w, tid(w.page, 'settings-open')); await sleep(300) }
  const order = () => w.page.$$eval('.mx tbody.counts > tr', els => els.map(e => e.getAttribute('data-testid')))
  await press(w, tid(w.page, 'settings-rearrange')); await sleep(600)
  check(`B2a (${rest ? 'finger rests 100 ms' : 'no rest, as the 8 Oct script'}) premise: the counter Delta exists`, (await tid(w.page, 'manning-drag-delta').count()) === 1, await order())
  await w.page.evaluate(() => window.scrollTo(0, 0))
  const arranging = () => w.page.evaluate(() => !!document.querySelector('[data-testid="roster-arrange"]'))
  check(`B2a (${rest}) premise: Rearrange is on`, await arranging(), null)
  const before = await order()
  await tid(w.page, 'manning-drag-delta').scrollIntoViewIfNeeded()
  const g = await tid(w.page, 'manning-drag-delta').boundingBox()
  const t = await tid(w.page, 'fly-row-avail-p').locator('td.who').first().boundingBox()
  const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }, b = { x: t.x + Math.min(t.width / 2, 30), y: t.y + 3 }
  const c = await cdpOf(w)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
  for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] })
  if (rest) await sleep(100)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await sleep(600)
  const after = await order()
  check(`B2a (${rest}) premise: the finger-drag moved the counter row (order changed)`, JSON.stringify(before) !== JSON.stringify(after), { before, after })
  const tag = rest ? 'rest' : 'norest'
  await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  await shot(w.page, `B2a-phone-${tag}-after-drag`)
  const bx = await tid(w.page, 'roster-arrange').boundingBox()
  await press(w, tid(w.page, 'roster-arrange'))
  const afterTap1 = await arranging()
  await mark(w.page, '[data-testid="roster-arrange"], [data-testid="manning-drag-delta"]', { noscroll: true })
  await shot(w.page, `B2a-phone-${tag}-after-first-tap`)
  let afterTap2 = null
  if (afterTap1) { await press(w, tid(w.page, 'roster-arrange')); afterTap2 = await arranging() }
  check(`B2a (${rest ? 'rest' : 'no rest'}) ONE tap on Done (Rearrange off) after the drag leaves Rearrange`, !afterTap1, { stillOnAfterTap1: afterTap1, stillOnAfterTap2: afterTap2, button: bx })
}
await run('b2a', 'phone', async w => b2a(w, true))
await run('b2a', 'phone', async w => b2a(w, false))

/* ===== B2b — Escape during a bar's mouse drag on the Inputs calendar ===== */
await run('b2b', 'desktop', async w => {
  await L.toInputsCal(w, 2026, 7)
  await sleep(500)
  const pick = await w.page.evaluate(() => { const b = [...document.querySelectorAll('#inpCal .ib-bar[data-iid]')].find(x => x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().width > 20); return b ? b.getAttribute('data-iid') : null })
  if (!pick) { notWalked('B2b', 'no input bar drawn in July 2026'); return }
  const bar = w.page.locator(`#inpCal .ib-bar[data-iid="${pick}"]`).first()
  await bar.scrollIntoViewIfNeeded()
  const state = () => w.page.evaluate(iid => ({ ghost: document.querySelectorAll('.ic-ghost').length, over: document.querySelectorAll('.ic-over').length, bodyDragging: document.body.classList.contains('ic-dragging'), pk: document.querySelectorAll('.pk-drag').length, rec: JSON.stringify(window.INPUTS.filter(x => String(x.iid) === iid).map(x => [x.date, x.endDate])) }), pick)
  const s0 = await state()
  const bb = await bar.boundingBox(), y = bb.y + bb.height / 2
  const first = w.page.locator('#inpCal [data-icday]').nth(10), tgt = await w.page.locator('#inpCal [data-icday]').nth(12).boundingBox()
  await w.page.mouse.move(bb.x + Math.min(12, bb.width / 2), y); await w.page.mouse.down()
  await w.page.mouse.move(tgt.x + tgt.width / 2, tgt.y + tgt.height / 2, { steps: 10 }); await sleep(200)
  const mid = await state()
  info('B2b before / mid-drag', { s0, mid })
  check('B2b premise: the bar is held and the drag is under way (a ghost or the dragging state is up)', mid.ghost > 0 || mid.bodyDragging || mid.pk > 0, mid)
  await w.page.keyboard.press('Escape'); await sleep(300)
  const afterEsc = await state()
  await shot(w.page, 'B2b-desktop-after-escape-button-down')
  await w.page.mouse.up(); await sleep(500)
  const afterUp = await state()
  await w.page.mouse.move(700, 700, { steps: 6 }); await sleep(500)
  const away = await state()
  await shot(w.page, 'B2b-desktop-after-release-and-move-away')
  info('B2b after Escape (button down) / after release / after moving the pointer away', { afterEsc, afterUp, away })
  check('B2b after Escape, release and moving the pointer away no picked-up copy follows the pointer and the page is out of its dragging state', away.ghost === 0 && !away.bodyDragging && away.pk === 0, away)
  info('B2b OBSERVATION: Escape while the bar is held does not cancel the drag; the release still drops the bar (record before / after)', { before: s0.rec, after: away.rec, droppedStill: away.rec !== s0.rec })
})

/* B2b again, as the 8 Oct walker did it: a bar of several days, pressed in its middle, carried two dates on, Escape, release, a later click */
await run('b2b2', 'desktop', async w => {
  await L.toInputsCal(w, 2026, 7)
  await sleep(500)
  const pick = await w.page.evaluate(() => { const bs = [...document.querySelectorAll('#inpCal .ib-bar[data-iid]')].filter(x => x.getBoundingClientRect().height > 0); bs.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width); return bs[0] ? { iid: bs[0].getAttribute('data-iid'), w: Math.round(bs[0].getBoundingClientRect().width) } : null })
  info('B2b2 widest bar in July 2026', pick)
  if (!pick) { notWalked('B2b2', 'no bar'); return }
  const bar = w.page.locator(`#inpCal .ib-bar[data-iid="${pick.iid}"]`).first()
  await bar.scrollIntoViewIfNeeded()
  const state = () => w.page.evaluate(iid => ({ ghost: document.querySelectorAll('.ic-ghost').length, over: document.querySelectorAll('.ic-over').length, bodyDragging: document.body.classList.contains('ic-dragging'), rec: JSON.stringify(window.INPUTS.filter(x => String(x.iid) === iid).map(x => [x.date, x.endDate])) }), pick.iid)
  const s0 = await state()
  const bb = await bar.boundingBox(), y = bb.y + bb.height / 2
  await w.page.mouse.move(bb.x + bb.width / 2, y); await w.page.mouse.down()
  await w.page.mouse.move(bb.x + bb.width / 2 + 150, y + 4, { steps: 8 }); await sleep(200)
  const mid = await state()
  check('B2b2 premise: the drag is under way (ghost up)', mid.ghost > 0, mid)
  await w.page.keyboard.press('Escape'); await sleep(300)
  const afterEsc = await state()
  await w.page.mouse.up(); await sleep(600)
  await w.page.mouse.move(700, 700, { steps: 6 }); await sleep(500)
  const away = await state()
  await shot(w.page, 'B2b2-desktop-after-escape-release-move-away')
  await w.page.mouse.move(300, 500); await w.page.mouse.down(); await w.page.mouse.up(); await sleep(500)
  const later = await state()
  info('B2b2 states: before / mid / after Escape / after release+move away / after a later click', { s0, mid, afterEsc, away, later })
  check('B2b2 after Escape + release + moving away: no picked-up copy follows the pointer, page out of the dragging state', away.ghost === 0 && !away.bodyDragging, away)
  check('B2b2 a later click does not find a copy still held', later.ghost === 0 && !later.bodyDragging, later)
})

/* ===== B3 — the Calendar window on a 320 x 568 phone, dragged and brought back ===== */
const fingerDrag = async (w, from, to, rest = true) => {
  const c = await w.ctx.newCDPSession(w.page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 10, y: from.y + (to.y - from.y) * i / 10 }] }); await sleep(20) }
  if (rest) await sleep(100)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(500)
}
await run('b3', 'small', async w => {
  await L.toInputsCal(w, 2026, 8)
  await press(w, '#inGear'); await tid(w.page, 'win-inputsset').waitFor(); await sleep(300)
  await press(w, tid(w.page, 'iset-days')); await tid(w.page, 'win-days').waitFor(); await sleep(500)
  /* the window's month turned to August 2026 (six weeks) by reading its own heading */
  const tab = tid(w.page, 'days-tab-month'); if (await tab.count()) { await press(w, tab); await sleep(300) }
  for (let i = 0; i < 24; i++) {
    const [m, y] = (await tid(w.page, 'days-month').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 7 - (+y * 12 + ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m))
    if (!d) break
    await press(w, tid(w.page, d > 0 ? 'days-next' : 'days-prev'))
  }
  info('B3 Calendar window month', (await tid(w.page, 'days-month').innerText()).trim())
  const geo = () => w.page.evaluate(() => {
    const win = document.querySelector('[data-testid="win-days"]'), r = win.getBoundingClientRect()
    const last = document.querySelector('[data-testid="days-cell-2026-08-31"]'); const lr = last ? last.getBoundingClientRect() : null
    const body = win.querySelector('.win-body') || win
    return { vh: innerHeight, win: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], winH: Math.round(r.height), lastCell: lr ? [Math.round(lr.top), Math.round(lr.bottom)] : null, bodyScroll: [Math.round(body.scrollTop), body.scrollHeight, body.clientHeight] }
  })
  const g0 = await geo(); info('B3 as opened', g0)
  check('B3 premise: the window as opened is no taller than the screen and its last date (31 Aug) is drawn', g0.winH <= g0.vh && !!g0.lastCell, g0)
  await shot(w.page, 'B3-small-calendar-as-opened')
  /* drag it by its title bar to the foot, then back to the top (a resting finger) */
  const bar = await tid(w.page, 'win-days').locator('.win-bar').boundingBox()
  const from = { x: Math.round(bar.x + bar.width / 2), y: Math.round(bar.y + bar.height / 2) }
  await fingerDrag(w, from, { x: from.x, y: from.y + 300 })
  const g1 = await geo(); info('B3 dragged low', g1)
  const bar2 = await tid(w.page, 'win-days').locator('.win-bar').boundingBox()
  const from2 = { x: Math.round(bar2.x + bar2.width / 2), y: Math.round(bar2.y + bar2.height / 2) }
  await fingerDrag(w, from2, { x: from2.x, y: 24 })
  const g2 = await geo(); info('B3 dragged back to the top', g2)
  check('B3 premise: the window really moved (top changed after the drags)', g1.win[1] !== g0.win[1] || g2.win[1] !== g1.win[1], { g0top: g0.win[1], g1top: g1.win[1], g2top: g2.win[1] })
  check('B3 after being dragged and brought back the window is no taller than the screen', g2.winH <= g2.vh, { winH: g2.winH, vh: g2.vh })
  await w.page.evaluate(() => { const e = document.querySelector('[data-testid="days-cell-2026-08-31"]'); if (e) { e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '-2px' } })
  const lastSeen = await w.page.evaluate(() => { const e = document.querySelector('[data-testid="days-cell-2026-08-31"]'); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, r.top + r.height / 2)); return { bottom: Math.round(r.bottom), vh: innerHeight, hitIsCell: !!h && e.contains(h) } })
  check('B3 the last week (31 Aug) is wholly on screen and what a finger meets', !!lastSeen && lastSeen.bottom <= lastSeen.vh && lastSeen.hitIsCell, lastSeen)
  await shot(w.page, 'B3-small-calendar-dragged-and-back')
})

/* a quiet place on the page behind the windows: a point whose hit is not a control, a field, a bar, a day or a window */
const quietPoint = page => page.evaluate(() => {
  for (let y = 20; y < innerHeight - 20; y += 24) for (let x = 700; x < innerWidth - 20; x += 40) {
    const h = document.elementFromPoint(x, y); if (!h) continue
    if (h.closest('button, a, input, select, textarea, [role=button], [tabindex], [data-testid^="win-"], [data-icday], .ib-bar, label, .floatwin')) continue
    return { x, y, hit: (h.id || h.className || h.tagName).toString().slice(0, 40) }
  }
  return null
})

/* ===== B4 / B5 / B6 / B7 — Escape and window manners (desktop 1440) ===== */
await run('b4', 'desktop', async w => {
  await L.toInputsCal(w, 2026, 7)
  await L.openIcDay(w, '2026-07-15')
  const lines = () => w.page.locator('[data-testid="idy-open"]').count()
  const n0 = await lines()
  check('B4 premise: the opened day lists inputs', n0 > 0, n0)
  const line = w.page.locator('[data-testid="idy-open"]').first()
  await line.focus(); await w.page.keyboard.press('Delete'); await sleep(400)
  check('B4 premise: Delete on a line asks "Delete this input?"', (await tid(w.page, 'idy-ask').count()) === 1, await tid(w.page, 'idy-ask').innerText().catch(() => null))
  const q = await quietPoint(w.page)
  info('B4 quiet place pressed on the page behind', q)
  await w.page.mouse.click(q.x, q.y); await sleep(300)
  const st = async () => ({ ask: await tid(w.page, 'idy-ask').count(), wins: await openWins(w.page), lines: await lines(), active: await L.active(w.page) })
  const s1 = await st()
  check('B4 premise: after the press behind, the question is still up, the day still open, nothing deleted', s1.ask === 1 && s1.wins.includes('win-inputsday') && s1.lines === n0, s1)
  await mark(w.page, '[data-testid="idy-ask"]'); await shot(w.page, 'B4-desktop-question-after-press-behind')
  await unmark(w.page, '[data-testid="idy-ask"]')
  await w.page.keyboard.press('Escape'); await sleep(400)
  const s2 = await st()
  check('B4 Escape closes only the question: the question gone, the day window still open, nothing deleted', s2.ask === 0 && s2.wins.includes('win-inputsday') && s2.lines === n0, s2)
  await shot(w.page, 'B4-desktop-after-escape')
})

await run('b5', 'desktop', async w => {
  await L.toInputsCal(w, 2026, 7)
  await L.openIcDay(w, '2026-07-15')
  /* (a) a control on the page behind takes the keyboard: the month's next arrow, pressed with the mouse */
  await w.page.locator('#icNext').click(); await sleep(500)
  const before = { wins: await openWins(w.page), active: await L.active(w.page), month: await w.page.locator('#inpCal .ic-mon').innerText() }
  check('B5 premise: the day window is still open and a control behind it holds the keyboard', before.wins.includes('win-inputsday') && /icNext/.test(before.active || ''), before)
  await mark(w.page, '#icNext', { noscroll: true }); await shot(w.page, 'B5-desktop-control-behind-focused'); await unmark(w.page, '#icNext')
  await w.page.keyboard.press('Escape'); await sleep(400)
  const after = { wins: await openWins(w.page), active: await L.active(w.page) }
  check('B5a Escape with a page control focused (window open) closes the window', !after.wins.includes('win-inputsday'), { before, after })
  await shot(w.page, 'B5-desktop-after-escape-a')
  /* (b) the window's title pressed (the walker: focus stays on the page control) */
  await w.page.locator('#icPrev').click(); await sleep(400)
  await L.openIcDay(w, '2026-07-15')
  await w.page.locator('#icNext').focus()
  const bar = await tid(w.page, 'win-inputsday').locator('.win-bar').boundingBox()
  await w.page.mouse.click(bar.x + bar.width / 2, bar.y + bar.height / 2); await sleep(300)
  const pre = { wins: await openWins(w.page), active: await L.active(w.page) }
  await w.page.keyboard.press('Escape'); await sleep(400)
  const post = { wins: await openWins(w.page), active: await L.active(w.page) }
  check('B5b Escape after the window\'s own title was pressed closes the window', !post.wins.includes('win-inputsday'), { pre, post })
})

/* ===== B6 — a settings window left open when the page is changed ===== */
await run('b6', 'desktop', async w => {
  await L.toInputsCal(w, 2026, 7)
  await press(w, '#inGear'); await tid(w.page, 'win-inputsset').waitFor(); await sleep(300)
  const up = await openWins(w.page)
  check('B6 premise: the Inputs settings window is open', up.includes('win-inputsset'), up)
  await go(w.page, 'editsched'); await sleep(500)
  const on = await w.page.evaluate(() => window.CURPAGE)
  const after = await openWins(w.page)
  const box = await rect(w.page, '[data-testid="win-inputsset"]')
  check('B6 premise: the page is now Edit Schedule', on === 'editsched', on)
  check('B6 the settings window is gone after the page is changed', !after.includes('win-inputsset'), { after, box })
  await shot(w.page, 'B6-desktop-after-page-change-via-go')
  /* the same through the real tab: back to Inputs, gear open, then the top bar's Edit Schedule tab */
  await go(w.page, 'inputs'); await press(w, '#inGear'); await tid(w.page, 'win-inputsset').waitFor(); await sleep(300)
  const tab = w.page.locator('#topnav >> text=Edit Schedule').first()
  await tab.click(); await sleep(600)
  const after2 = await openWins(w.page)
  check('B6 (real tab press) the settings window is gone after pressing the Edit Schedule tab', !after2.includes('win-inputsset') && (await w.page.evaluate(() => window.CURPAGE)) === 'editsched', { after2, page: await w.page.evaluate(() => window.CURPAGE) })
  await shot(w.page, 'B6-desktop-after-tab-press')
  /* SANS settings window too */
  await go(w.page, 'inputs'); await press(w, '#inSansMode'); await tid(w.page, 'sanscal').waitFor()
  await press(w, tid(w.page, 'sc-gear')); await tid(w.page, 'win-sansset').waitFor().catch(() => {}); await sleep(300)
  const sup = await openWins(w.page)
  await w.page.locator('#topnav >> text=Edit Schedule').first().click(); await sleep(600)
  const after3 = await openWins(w.page)
  check('B6 (SANS settings window) gone after pressing the Edit Schedule tab', sup.length > 0 && !after3.some(x => /sans|set/.test(x)), { sup, after3 })
})

/* ===== B7 — "Calendar..." from the SANS day lands over that day's window (1440 wide) ===== */
await run('b7', 'desktop', async w => {
  await L.toSans(w, 2026, 7)
  await L.openSansDay(w, '2026-07-14')
  const dayBox = await rect(w.page, '[data-testid="win-sansday"]')
  await press(w, tid(w.page, 'sd-days')); await tid(w.page, 'win-days').waitFor(); await sleep(600)
  const calBox = await rect(w.page, '[data-testid="win-days"]')
  const dayAfter = await rect(w.page, '[data-testid="win-sansday"]')
  const xb = await hitOf(w.page, '[data-testid="win-sansday-x"]')
  const inter = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t))
  const cover = dayAfter ? inter(dayAfter, calBox) / (dayAfter.w * dayAfter.h) : null
  info('B7 boxes', { dayBefore: dayBox, dayAfter, calendar: calBox, shareOfDayCovered: cover, dayCrossHit: xb })
  check('B7 the Calendar window does not lie wholly over the SANS day window (its cross is still reachable)', !!xb && xb.own, { dayAfter, calBox, cover, xb })
  await mark(w.page, '[data-testid="win-sansday-x"]', { noscroll: true }); await shot(w.page, 'B7-desktop-calendar-from-sans-day')
})

/* ===== B8 — each man's LATE mark on a shared input's card, on a phone ===== */
const freeMen = (page, k, days) => page.evaluate(([k, days]) => {
  const P = window.PEOPLE, D = window.DAYS
  return Object.keys(P).filter(id => !P[id].special && !P[id].pers && !P[id].archived && !P[id].san
    && days.every(d => !JSON.stringify(D[d]).includes(`"${id}"`))
    && !window.INPUTS.some(r => JSON.stringify(r).includes(`"${id}"`) && days.some(d => window.inputCoversDate(r, D[d].dt)))).slice(0, k)
}, [k, days])
await run('b8', 'phone', async w => {
  const three = await freeMen(w.page, 3, [2])
  if (three.length < 3) { notWalked('B8', `only ${three.length} free men for an input of three`); return }
  await L.toInputsCal(w, 2026, 7)
  await L.openIcDay(w, '2026-07-15')
  const before = await w.page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'Training')
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of three) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!three.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
  const ad = w.page.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await w.page.fill('#inpEditPop #inpEditStart', '09:00'); await w.page.fill('#inpEditPop #inpEditEnd', '10:00')
  if (await w.page.locator('#inpEditPop #inpEditOwnTitle').count()) await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Walk brief')
  await press(w, '#inpEditSave'); await sleep(500)
  if (await tid(w.page, 'oilconf').count()) { await press(w, (await tid(w.page, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]'); await press(w, '[data-testid="oilconf-save"]') }
  const made = await w.page.evaluate(b => window.INPUTS.map(r => String(r.iid)).filter(x => !b.includes(x)), before)
  check('B8 premise: one shared input of three was filed through "+ Input"', made.length === 1, made)
  if (made.length !== 1) return
  const iid = made[0]
  await sleep(500)
  if (!(await tid(w.page, 'win-inputsday').count())) await L.openIcDay(w, '2026-07-15')
  const card = w.page.locator(`[data-testid="idy-row-${iid}"]`).first()
  check('B8 premise: its card is drawn in the opened day', (await card.count()) === 1, await card.count())
  await card.scrollIntoViewIfNeeded()
  const info1 = await card.evaluate(c => ({ who: (c.querySelector('[data-testid="idy-who"]') || {}).textContent, lateEls: [...c.querySelectorAll('[data-testid="idy-late"], .idy-manlate, [class*="manlate"]')].map(e => ({ tag: e.tagName, cls: e.className, title: e.getAttribute('title'), text: e.textContent.trim() })) }))
  info('B8 the card: who it names and every LATE mark in it', info1)
  check('B8 premise: the input is late (a LATE mark is drawn)', info1.lateEls.length > 0, info1)
  if (!info1.lateEls.length) { await shot(w.page, 'B8-phone-no-late-mark'); return }
  const allButtons = info1.lateEls.every(e => e.tag === 'BUTTON')
  check('B8 every LATE mark on the shared card is a button (a finger can open what it says)', allButtons, info1.lateEls)
  await mark(w.page, `[data-testid="idy-row-${iid}"] [data-testid="idy-late"]`, { noscroll: false })
  await shot(w.page, 'B8-phone-shared-card-late-before-tap')
  await unmark(w.page, `[data-testid="idy-row-${iid}"] [data-testid="idy-late"]`)
  await press(w, card.locator('[data-testid="idy-late"]').first())
  const note = await card.locator('[data-testid="idy-latenote"]').first().innerText().catch(() => null)
  check('B8 a finger on the LATE mark opens its note', !!note, note)
  await shot(w.page, 'B8-phone-shared-card-late-after-tap')
})

await browser.close()
L.writeResults()
console.log(`\n${L.results.filter(r => r.startsWith('PASS')).length} PASS · ${L.results.filter(r => r.startsWith('FAIL')).length} FAIL · ${L.results.filter(r => r.startsWith('NOT')).length} NOT WALKED · ${L.errs.length} browser errors`)
