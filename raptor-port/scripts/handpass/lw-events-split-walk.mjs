// THE WALK OF THE EVENTS LIST AS REDRAWN (his D1512–D1516, 29 Oct 26): the two lists, each line's pencil and its ✕ that
// asks once, the note with Undo, the top bar's Undo and Redo, a run and a merged band deleted whole, a new event ringed in
// its own list, an empty list, the keyboard, the list opened over the Balances page, a page switch mid-question, the
// columns MEASURED (lesson 9) in the app's letters and in letters a seventh wider (his iPhone's), a member's way in.
// Pressed on screen through the app's own controls, at his iPhone's 402 (touch) and his PC's 1536 at 125%, as the admin;
// the year staged as the drawing's (the localhost bridge — scripts/drawcheck/specs/lw-m5b-events.mjs). Asserts the RIGHT
// behaviour, so a re-run is the re-walk (bug-check order §5).
// Run from raptor-port:  node scripts/handpass/lw-events-split-walk.mjs <dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , DIST = 'dist', OUT = 'docs/img/handpass/2026-10-29-lw-events-split'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4198'
const res = []
const C = (id, ok, note = '') => { res.push({ id, ok: !!ok, note }); console.log((ok ? 'PASS ' : 'FAIL ') + id + (note ? ' — ' + note : '')) }
const LINES = [
  [['2026-01-01'], "New Year's Day", 'off'],
  [['2026-02-17', '2026-02-18'], 'Chinese New Year', 'off'],
  [['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13'], 'Ex Pitch Black', 'work'],
  [['2026-04-03'], 'Good Friday', 'off'],
  [['2026-05-01'], 'Labour Day', 'off'],
  [['2026-05-22'], 'Squadron dinner', null],
  [['2026-08-10'], 'Off — National Day', 'free'],
  [['2026-09-07', '2026-09-08', '2026-09-09'], 'Ex Cope Tiger', 'work'],
  [['2026-09-30'], 'A squadron event whose name runs far longer than any line can hold', 'nolv'],
]
for (const kind of ['P', 'D']) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.clock.setFixedTime(new Date('2026-04-02T09:00:00+08:00'))
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="settings-open"]', { timeout: 20000 }); await p.waitForTimeout(600)
  const T = id => p.locator(`[data-testid="${id}"]`)
  const press = async (id, wait = 450) => { const l = T(id).first(); if (phone) await l.tap(); else await l.click(); await p.waitForTimeout(wait) }
  const shot = n => p.screenshot({ path: join(OUT, `${kind}-${n}.png`) })
  const vis = async id => (await T(id).count()) > 0 && await T(id).first().isVisible()
  const days = () => p.evaluate(() => window.lwEventDays())
  const word = async (d, line = 0) => { const x = await days(); const r = x.days.find(e => e[0] === d); return r ? r[1][line] : '' }
  const names = sec => p.evaluate(s => [...document.querySelectorAll(`[data-testid="events-sec-${s}"] .hol-name`)].map(n => n.textContent), sec)
  // the year as the drawing has it, with one name too long for a line
  const had = await days()
  for (const [d, evs] of had.days) for (let i = 0; i < evs.length; i++) if (evs[i]) await p.evaluate(([d, i]) => window.lwSetDayEvent(d, i, ''), [d, i])
  for (const [ds, name, k] of LINES) for (const d of ds) await p.evaluate(([d, name, k]) => window.lwSetDayEvent(d, 0, name, k), [d, name, k])
  const open = async () => { await press('settings-open'); await press('settings-events'); await p.waitForSelector('[data-testid="events-list"]') }
  /* the top bar's Undo / Redo — on a phone the full-page list covers the top bar (D1511; the note's Undo is the one in reach
     there) and on a desktop it is a window that blocks the page under it: closed first, opened again after */
  const bar = async id => { await press('events-close'); await p.locator(`#${id}:visible`).first()[phone ? 'tap' : 'click'](); await p.waitForTimeout(450); await open() }

  // 1. the two lists, Squadron events first
  await open()
  const order = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="events-sec-"]')].map(s => s.dataset.testid))
  C(kind + '1 Squadron events first, then Holidays', order.join() === 'events-sec-squadron,events-sec-holidays', order.join())
  const sq = await names('squadron'), hol = await names('holidays')
  C(kind + '1 each event in its own list', sq.includes('Squadron dinner') && sq.includes('Ex Pitch Black') && hol.includes('Off — National Day') && !hol.includes('Squadron dinner'), `squadron ${sq.length}, holidays ${hol.length}`)
  C(kind + '1 headings carry the counts', (await T('events-head-squadron').textContent()) === `Squadron events · ${sq.length}` && (await T('events-head-holidays').textContent()) === `Holidays · ${hol.length}`)
  const geo = await p.evaluate(() => {
    const a = document.querySelector('[data-testid="events-sec-squadron"]').getBoundingClientRect(), h = document.querySelector('[data-testid="events-sec-holidays"]').getBoundingClientRect()
    const w = document.querySelector('[data-testid="events-sheet"]').getBoundingClientRect()
    return { side: Math.abs(a.top - h.top) < 2 && h.left > a.right, under: h.top >= a.bottom, win: { l: w.left, r: w.right, t: w.top, b: w.bottom } }
  })
  C(kind + '1 ' + (phone ? 'one under the other' : 'side by side'), phone ? geo.under : geo.side, JSON.stringify(geo.win))
  C(kind + '1 the window inside the screen', geo.win.l >= 0 && geo.win.r <= (phone ? 402 : 1536) + 0.5 && geo.win.t >= 0 && geo.win.b <= (phone ? 874 : 864) + 0.5)
  await shot('01-lists')

  // 2. the columns, MEASURED (lesson 9): every kind starts at one place in each list; every date column one width; the
  //    pencil and the ✕ at one place down the list; nothing clipped but the long name (ellipsis on a desktop, wrapped on
  //    a phone); then in letters a seventh wider
  const cols = async () => p.evaluate(() => {
    const out = {}
    for (const s of ['squadron', 'holidays']) {
      const ls = [...document.querySelectorAll(`[data-testid="events-sec-${s}"] .ev-line`)]
      const r = (l, sel) => l.querySelector(sel).getBoundingClientRect()
      const set = a => [...new Set(a.map(Math.round))]
      out[s] = {
        kindL: set(ls.map(l => r(l, '.ev-kind').left)), penL: set(ls.map(l => r(l, '.ev-pen').left)), xL: set(ls.map(l => r(l, '.ev-x').left)),
        nameL: set(ls.map(l => r(l, '.hol-name').left)),
        clipped: ls.flatMap(l => [...l.querySelectorAll('.hol-when,.ev-kind')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent)),
        gap: Math.min(...ls.map(l => { const d = l.querySelector('.hol-when'); const rg = document.createRange(); rg.selectNodeContents(d); return Math.round(r(l, '.hol-name').left - rg.getBoundingClientRect().right) })),
        boxes: set(ls.flatMap(l => [r(l, '.ev-pen').width, r(l, '.ev-x').width, r(l, '.ev-pen').height])),
        gapIcons: set(ls.map(l => r(l, '.ev-x').left - r(l, '.ev-pen').right)),
      }
    }
    return out
  })
  for (const [tag, style] of [['app letters', ''], ['letters a seventh wider', '.ev-line, .ev-line *{font-family:Verdana,sans-serif!important}']]) {
    /* the list measures its columns as it opens, in the letters it is drawn in — so it is opened again in the wider ones,
       as his iPhone opens it in its own */
    if (style) { await p.addStyleTag({ content: style }); await press('events-close'); await open() }
    const c = await cols()
    for (const s of ['squadron', 'holidays']) {
      const x = c[s]
      C(`${kind}2 ${s}: one kind column, pencils and ✕s each one column (${tag})`, x.kindL.length === 1 && x.penL.length === 1 && x.xL.length === 1, JSON.stringify({ k: x.kindL, p: x.penL, x: x.xL }))
      C(`${kind}2 ${s}: no date or kind word cut (${tag})`, x.clipped.length === 0, x.clipped.join(' | '))
      C(`${kind}2 ${s}: the buttons 22px, 14px apart (${tag})`, x.boxes.join() === '22' && x.gapIcons.join() === '14', JSON.stringify({ b: x.boxes, g: x.gapIcons }))
      if (!phone) C(`${kind}2 ${s}: every name starts at one place, ≥12px clear of its date (${tag})`, x.nameL.length === 1 && x.gap >= 12, JSON.stringify({ n: x.nameL, gap: x.gap }))
    }
    if (style) { await shot('02-wider-letters') }
  }
  // put the app's own letters back for the rest
  await p.evaluate(() => document.querySelectorAll('style').forEach(s => { if (s.textContent.includes('Verdana')) s.remove() }))
  await press('events-close'); await open()
  const longCut = await p.evaluate(() => { const n = [...document.querySelectorAll('.ev-line .hol-name')].find(e => e.textContent.startsWith('A squadron event whose')); return { cut: n.scrollWidth > n.clientWidth + 1, h: Math.round(n.getBoundingClientRect().height) } })
  C(kind + '2 the long name: ' + (phone ? 'wraps, whole' : 'ends in …, one line'), phone ? !longCut.cut && longCut.h > 20 : longCut.cut && longCut.h < 20, JSON.stringify(longCut))

  // 3. the pencil opens the event's window; its ✕ brings the list back
  await press('evedit-0-2026-05-22')
  C(kind + '3 the pencil opens the event', await vis('event-sheet') && (await T('event-text').inputValue()) === 'Squadron dinner')
  await shot('03-pencil-opens')
  await press('event-cancel')
  C(kind + '3 closing it brings the list back', await vis('events-list'))
  // …and a tap on the line itself still does
  await p.locator('[data-testid="evline-0-2026-05-22"] .hol-when').first()[phone ? 'tap' : 'click'](); await p.waitForTimeout(450)
  C(kind + '3 a tap on the line opens it too', await vis('event-sheet'))
  await press('event-cancel')

  // 4. the ✕ asks once: a picture right after the press (lesson / §7.10), then settled
  const x = p.locator('[data-testid="evdel-0-2026-05-22"]')
  const before = await x.boundingBox(), penBefore = await T('evedit-0-2026-05-22').boundingBox()
  if (phone) await x.tap(); else await x.click()
  await p.waitForTimeout(60); await shot('04a-asking-at-press')
  await p.waitForTimeout(400); await shot('04b-asking')
  const after = await x.boundingBox(), penAfter = await T('evedit-0-2026-05-22').boundingBox()
  C(kind + '4 asking: "Delete — sure?" in the kind column, the ✕ red', (await T('evkind-0-2026-05-22').textContent()) === 'Delete — sure?' && await x.evaluate(e => e.classList.contains('arm') && getComputedStyle(e).backgroundColor === 'rgb(240, 85, 95)'))
  C(kind + '4 the ✕ and the pencil have not moved', Math.abs(after.x - before.x) < 0.5 && Math.abs(after.width - before.width) < 0.5 && Math.abs(penAfter.x - penBefore.x) < 0.5)
  C(kind + '4 nothing deleted yet', (await word('2026-05-22')) === 'Squadron dinner')
  // 5. a press elsewhere takes it back
  await press('events-head-holidays')
  C(kind + '5 a press elsewhere takes the question back', !(await x.evaluate(e => e.classList.contains('arm'))) && (await T('evkind-0-2026-05-22').textContent()) === '')
  // 6. another line's ✕ moves the question
  await press('evdel-0-2026-05-22'); await press('evdel-0-2026-09-07')
  C(kind + '6 another ✕ moves the question there', !(await x.evaluate(e => e.classList.contains('arm'))) && await T('evdel-0-2026-09-07').evaluate(e => e.classList.contains('arm')) && (await word('2026-09-07')) === 'Ex Cope Tiger')
  await press('events-head-squadron')

  // 7. two presses delete; the note at the foot; the grid's Event row empty
  await press('evdel-0-2026-05-22'); await press('evdel-0-2026-05-22')
  await p.waitForTimeout(60); await shot('07a-deleted-at-press'); await p.waitForTimeout(300)
  C(kind + '7 deleted: gone from the store and the list', (await word('2026-05-22')) === '' && !(await names('squadron')).includes('Squadron dinner'))
  const note = await p.evaluate(() => { const n = document.querySelector('[data-testid="events-undo-note"]'); if (!n) return null; const r = n.getBoundingClientRect(); return { t: n.querySelector('.secdef-msg').textContent, l: r.left, r: r.right, b: r.bottom, h: Math.round(r.height), top: document.elementFromPoint((r.left + r.right) / 2, r.top + r.height / 2)?.closest('[data-testid="events-undo-note"]') != null } })
  C(kind + '7 the note: "Squadron dinner deleted", one line, in the screen, on top', note && note.t === 'Squadron dinner deleted' && note.l >= 0 && note.r <= (phone ? 402 : 1536) && note.h < 60 && note.top, JSON.stringify(note))
  await shot('07b-deleted-note')
  // 8. the note's Undo brings it back, on the list and the grid
  await press('events-undo')
  C(kind + '8 Undo on the note brings it back', (await word('2026-05-22')) === 'Squadron dinner' && (await names('squadron')).includes('Squadron dinner') && !(await vis('events-undo-note')))
  await shot('08-undone')
  // 9. the top bar's Undo, then Redo, after a delete
  await press('evdel-0-2026-05-22'); await press('evdel-0-2026-05-22')
  await bar('undoBtn')
  C(kind + '9 the top bar’s Undo brings it back', (await word('2026-05-22')) === 'Squadron dinner' && (await names('squadron')).includes('Squadron dinner'))
  await bar('redoBtn')
  C(kind + '9 Redo deletes it again', (await word('2026-05-22')) === '' && !(await names('squadron')).includes('Squadron dinner'))
  await bar('undoBtn')
  // the note waits about seven seconds, then goes
  await press('evdel-0-2026-05-22'); await press('evdel-0-2026-05-22')
  await p.waitForTimeout(7700)
  C(kind + '9 the note goes by itself after about seven seconds', !(await vis('events-undo-note')))
  await bar('undoBtn')

  // 10. a run of one word over three days: one ✕ deletes every day, one Undo brings all three
  await press('evdel-0-2026-09-07'); await press('evdel-0-2026-09-07')
  const run = await Promise.all(['2026-09-07', '2026-09-08', '2026-09-09'].map(d => word(d)))
  C(kind + '10 a run deleted every day of it', run.every(w => w === ''), run.join())
  await press('events-undo')
  const back = await Promise.all(['2026-09-07', '2026-09-08', '2026-09-09'].map(d => word(d)))
  C(kind + '10 one Undo brings the whole run back', back.every(w => w === 'Ex Cope Tiger'), back.join())

  // 11. ＋ Event over three days, saved as one merged bar: it lands in its own list, ringed, in view; its ✕ takes the bar
  await press('events-add')
  await p.fill('[data-testid="event-text"]', 'Ex Merge')
  for (let i = 0; i < 13 && !(await T('event-day-2026-06-08').count()); i++) await press('event-next', 250)
  await press('event-day-2026-06-08', 250); await press('event-day-2026-06-10', 250)
  await press('event-apply', 700)
  const bands = (await days()).bands
  const ring = await p.evaluate(() => { const l = document.querySelector('[data-testid="evline-0-2026-06-08"]'); if (!l) return null; const r = l.getBoundingClientRect(); return { innew: l.classList.contains('innew'), sec: l.closest('section')?.dataset.testid, inView: r.top >= 0 && r.bottom <= innerHeight } })
  C(kind + '11 a new event: its own list, ringed, in view', bands === 1 && ring && ring.innew && ring.sec === 'events-sec-squadron' && ring.inView, JSON.stringify({ bands, ring }))
  await shot('11-new-ringed')
  await press('evdel-0-2026-06-08'); await press('evdel-0-2026-06-08')
  C(kind + '11 its ✕ takes the merged bar whole', (await days()).bands === 0 && !(await names('squadron')).includes('Ex Merge'))

  // 12. keyboard (desktop): Tab to a pencil, Enter opens; to a ✕, Enter asks, Enter deletes; Tab away takes it back
  if (!phone) {
    await T('evedit-0-2026-03-09').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400)
    C(kind + '12 keyboard: Enter on a pencil opens the event', await vis('event-sheet'))
    await p.keyboard.press('Escape'); await p.waitForTimeout(400)
    C(kind + '12 keyboard: Escape closes it, the list back', await vis('events-list') && !(await vis('event-sheet')))
    await T('evdel-0-2026-03-09').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(250)
    const ring2 = await T('evdel-0-2026-03-09').evaluate(e => getComputedStyle(e).outlineStyle)
    C(kind + '12 keyboard: Enter on a ✕ asks, the focus ring shown', await T('evdel-0-2026-03-09').evaluate(e => e.classList.contains('arm')) && ring2 !== 'none', ring2)
    await shot('12-keyboard-asking')
    await p.keyboard.press('Tab'); await p.waitForTimeout(250)
    C(kind + '12 keyboard: Tab away takes the question back', !(await T('evdel-0-2026-03-09').evaluate(e => e.classList.contains('arm'))) && (await word('2026-03-09')) === 'Ex Pitch Black')
    await T('evdel-0-2026-03-09').focus(); await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
    C(kind + '12 keyboard: Enter twice deletes', (await word('2026-03-09')) === '')
    C(kind + '12 keyboard: then it is on the note’s Undo (the read’s R2)', await p.evaluate(() => document.activeElement?.dataset.testid === 'events-undo'))
    await p.keyboard.press('Enter'); await p.waitForTimeout(400)
    C(kind + '12 keyboard: Enter on Undo brings it back, the keyboard on its ✕', (await word('2026-03-09')) === 'Ex Pitch Black' && await p.evaluate(() => document.activeElement?.dataset.testid === 'evdel-0-2026-03-09'))
    await shot('12b-keyboard-undone')
  }

  // 13. a page switch while asking, and back: the question is gone
  await press('evdel-0-2026-05-22')
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(500)
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(700)
  const still = (await T('evdel-0-2026-05-22').count()) ? await T('evdel-0-2026-05-22').evaluate(e => e.classList.contains('arm')) : false
  C(kind + '13 after leaving the page and coming back, nothing still asks', !still)
  if (await vis('events-close')) await press('events-close')

  // 14. the list opened over the Balances page (lesson 12): in sight, and the page under it still Balances when it closes
  await press('lw-tab-balances', 700)
  await open()
  const overBal = await p.evaluate(() => { const s = document.querySelector('[data-testid="events-sheet"]'); const r = s.getBoundingClientRect(); return r.width > 0 && r.height > 0 && document.elementFromPoint(r.left + r.width / 2, r.top + 30)?.closest('[data-testid="events-sheet"]') != null })
  C(kind + '14 over the Balances page: the list in sight, on top', overBal)
  await shot('14-over-balances')
  await press('events-close')
  C(kind + '14 closed: the Balances page as he left it', await vis('lw-tab-balances') && await p.evaluate(() => !!document.querySelector('[data-testid="lw-tab-balances"][aria-selected="true"], [data-testid="lw-tab-balances"].on, [data-testid="lw-tab-balances"].active')))
  await press('lw-tab-grid', 700)

  // 15. an empty list: every squadron event deleted, through the list
  await open()
  for (let guard = 0; guard < 12; guard++) {
    const first = await p.evaluate(() => document.querySelector('[data-testid="events-sec-squadron"] .ev-x')?.dataset.testid)
    if (!first) break
    await press(first); await press(first)
  }
  const longNote = await p.evaluate(() => { const n = document.querySelector('[data-testid="events-undo-note"]'); if (!n) return null; const r = n.getBoundingClientRect(), u = n.querySelector('.secdef-btn').getBoundingClientRect(), m = n.querySelector('.secdef-msg'); return { l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), uL: Math.round(u.left), uR: Math.round(u.right), ell: m.scrollWidth > m.clientWidth, t: m.textContent.slice(0, 30) } })
  C(kind + '15 the note for the longest name: inside the screen, one line, its Undo whole', longNote && longNote.l >= 0 && longNote.r <= (phone ? 402 : 1536) && longNote.uR <= longNote.r && longNote.h < 60, JSON.stringify(longNote))
  await shot('15b-long-note')
  C(kind + '15 empty: its heading 0 and one line saying so', (await T('events-head-squadron').textContent()) === 'Squadron events · 0' && (await T('events-empty-squadron').textContent()) === `No squadron events in ${await T('events-period').textContent()}.`)
  await shot('15-empty')
  C(kind + ' no page errors', errs.length === 0, errs.slice(0, 3).join(' | '))
  await ctx.close()
}

// 17. the widths between (the fresh code read's R1): an iPad upright (820) and a 1024 window, as the admin
for (const [w, h, touch] of [[820, 1180, true], [1024, 768, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-04-02T09:00:00+08:00'))
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="settings-open"]', { timeout: 20000 }); await p.waitForTimeout(600)
  for (const [ds, name, k] of LINES) for (const d of ds) await p.evaluate(([d, name, k]) => window.lwSetDayEvent(d, 0, name, k), [d, name, k])
  for (const id of ['settings-open', 'settings-events']) { const l = p.locator(`[data-testid="${id}"]`).first(); if (touch) await l.tap(); else await l.click(); await p.waitForTimeout(450) }
  const g = await p.evaluate(() => {
    const a = document.querySelector('[data-testid="events-sec-squadron"]').getBoundingClientRect(), hh = document.querySelector('[data-testid="events-sec-holidays"]').getBoundingClientRect()
    const ls = [...document.querySelectorAll('.ev-line')]
    return { under: hh.top >= a.bottom, xIn: ls.every(l => l.querySelector('.ev-x').getBoundingClientRect().right <= l.closest('.hol-list').getBoundingClientRect().right - 1),
      minName: Math.min(...ls.map(l => Math.round(l.querySelector('.hol-name').getBoundingClientRect().width))) }
  })
  C(`W${w} one under the other, every ✕ inside its list, every name room to read`, g.under && g.xIn && g.minName >= 100, JSON.stringify(g))
  await p.screenshot({ path: join(OUT, `W${w}-lists.png`) })
  await ctx.close()
}

// 16. a member has no way in
{
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-04-02T09:00:00+08:00'))
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'us'); await p.fill('#lpass', 'us'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1200)
  const gear = await p.locator('[data-testid="settings-open"]').count()
  if (gear) { await p.locator('[data-testid="settings-open"]').first().click(); await p.waitForTimeout(400) }
  C('M16 a member: no Events… and no Events list', !(await p.locator('[data-testid="settings-events"]').count()) && !(await p.locator('[data-testid="events-sheet"]').count()), gear ? 'a ⚙ was offered' : 'no ⚙')
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(res, null, 1))
const bad = res.filter(r => !r.ok)
console.log(`\n${res.length - bad.length}/${res.length} PASS` + (bad.length ? `\nFAILED:\n${bad.map(r => '  ' + r.id + (r.note ? ' — ' + r.note : '')).join('\n')}` : ''))
process.exit(bad.length ? 1 : 0)
