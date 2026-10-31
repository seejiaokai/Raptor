// DRAWINGS FOR HIS LOOK — [LW-HELD-DAY-ADD] (his D1548, 31 Oct 26): a tap on a Leave War day held whole by an entry filed on
// the Inputs page opens the bid window (Grant OIL first), as a course's day already does (D1395). Drawn on the REAL app (the
// built bundle on LW_PORT), today beside proposed, at an iPhone's size (402 x 874, 3x) and a desktop's (1536 x 864, 2x).
// Nothing is built. THE ONE TRANSFORM: the course-day window (built, D1395) is opened on a free day next to the held one,
// re-dated to the held day, its course line's box swapped for a clone of the held entry's own box from the grid and its words
// for the entry's; where the war refuses a leave over what holds the day (leave over leave or a medical — engine/dayview.ts
// barsWrite), the eight leave buttons are given the app's own greyed look (`.bidsheet .tchip:disabled`, D1543's way). The
// changed parts are outlined in dashed yellow (D1222).
//   p1  admin, desktop + iPhone — Gambit's whole-day OML (his picture): today's read-only note / B leaves greyed / A leaves gone
//   p2  member on his own row, iPhone — Ranger's whole-day LL filed on the Inputs page: today / B
//   p3  admin, desktop — Nomad's overseas duty: today / proposed (a leave may go over an OD, so the leaves stay lit)
//   p4  admin, desktop — the two cases the ruling did not name: a whole-day Other under Unavailable (today the day's list), and
//       a day whose two halves are both filed on the Inputs page (today the read-only note): today / proposed
// Run: LW_PORT=4173 node scripts/handpass/lw-held-draw.mjs   (DRAW=p1,p3 for some)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-10-31-lw-held-day/draw'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
fs.mkdirSync(H.OUT, { recursive: true })
const parts = (process.env.DRAW || 'p1,p2,p3,p4').split(',')
const run = id => parts.includes(id)
console.log('lw-held-draw →', H.OUT, parts.join(' '))
const RING = 'outline:2px dashed #FFD23F;outline-offset:2px'
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = iso => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`
const ids = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))

/* a fresh world (memory store), admin first: November opened for bidding so the member's own day takes a bid */
async function fresh(size) {
  const w = size === 'phone' ? await H.phoneCtx() : await H.deskFrom(undefined, 2)
  await L.signInPlain(w, 'admin')
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
  if ((await P.locator(T('od-month-2026-11')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-11')); await P.waitForTimeout(500) }
  await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
  return w
}
/* an entry filed on the Inputs page, through the app's own Inputs list (the test bridge's writer — the Inputs page's save) */
const file = (P, person, iso, type, remarks, half = null) => P.evaluate(([person, d, type, remarks, half]) => window.fileInput({
  person, date: d, yr: 2026, type, remarks, ...(type === 'Other' ? { acc: 'u' } : {}), ...(half ? { allday: false, half, s: half === 'am' ? 0 : 721, e: half === 'am' ? 720 : 1439 } : { allday: true }),
}), [person, md(iso), type, remarks, half])
const sheetOf = P => P.evaluate(() => ['bid-picker', 'raptor-sheet', 'daylist-sheet', 'remarks-sheet'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) ?? null)
const close = async w => { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(350) }
/* a tap on a neutral heading, so no control the drawn flow never touches stays hovered or focused */
const neutral = P => P.evaluate(() => { document.activeElement?.blur?.() })

/** THE TRANSFORM: the course window opened on `free` (a CSE filed there for the drawing) becomes the held day's window */
async function proposed(w, { who, held, free, lines, grey, gone = false, ownWords = null }) {
  const P = w.page
  await L.openCellR(w, who, free)
  if ((await sheetOf(P)) !== 'bid-picker') throw new Error(`${free} opened ${await sheetOf(P)}, not the course window`)
  const r = await P.evaluate(([held, free, lines, grey, gone, RING, ownWords]) => {
    const win = document.querySelector('[data-testid="bid-picker"]'); if (!win) return { ok: false }
    const dd = iso => { const d = new Date(iso + 'T12:00:00Z'); return { dow: d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }), day: d.getUTCDate() } }
    const H = dd(held), F = dd(free)
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+held.slice(5, 7) - 1]
    /* every date the window prints for the day it opened on reads the held day (its title, the till date) */
    for (const e of win.querySelectorAll('*')) if (e.children.length === 0 && e.textContent) e.textContent = e.textContent.replace(new RegExp(`\\b${F.dow}\\s+${F.day}\\s+${mon}\\b`), `${H.dow} ${H.day} ${mon}`).replace(new RegExp(`\\b${F.day} ${mon}\\b`), `${H.day} ${mon}`)
    const line = win.querySelector('[data-testid="bid-heldday"]'); if (!line) return { ok: false, why: 'no course line' }
    const row = line.closest('.bidsheet-row')
    const out = []
    lines.forEach((l, i) => {
      const n = i === 0 ? line : line.cloneNode(true)
      if (i > 0) { const r2 = row.cloneNode(false); r2.appendChild(n); (out[out.length - 1] || row).after(r2); out.push(r2) } else out.push(row)
      /* the line's own box (BidBits EntryBox, the course's) takes the held entry's kind — its colour class read off the
         entry's box in the grid cell — its words and its half; nothing restyled */
      const cell = document.querySelector(`[data-testid="cell-${l.pid}-${held}"]`)
      const src = [...(cell?.querySelectorAll('.c') || [])].find(b => (b.textContent || '').replace(/\W/g, '').startsWith(l.code.replace(/\W/g, '')))
      const inner = n.querySelector('.leg-box .c')
      if (inner) {
        const k = src ? [...src.classList].find(c => c.startsWith('k-')) : null
        if (k) inner.className = inner.className.replace(/\bk-\S+/, k)
        inner.className = inner.className.replace(/\b(whole|top|bot)\b/, l.half === 'AM' ? 'top' : l.half === 'PM' ? 'bot' : 'whole').replace(/\bwide\b|\bw4\b/g, '')
        if (l.code.length > 2) inner.classList.add('wide')
        inner.textContent = l.code
      }
      const spans = [...n.children].filter(e => e.tagName === 'SPAN' && !e.classList.contains('leg-box'))
      for (const s of spans) {
        if (l.half && /^(Whole day|AM|PM)$/.test(s.textContent)) s.textContent = l.half
        else if (s.classList.contains('bp-heldwords')) s.textContent = `“${l.remarks}”`
      }
      if (!spans.some(s => s.classList.contains('bp-heldwords')) && l.remarks) { const s = document.createElement('span'); s.className = 'bp-heldwords'; s.textContent = `“${l.remarks}”`; spans[spans.length - 1].before(s) }
      n.style.cssText += ';' + RING
    })
    const grid = win.querySelector('[data-testid="bid-leave-grid"]')
    let greyed = 0
    if (grid && gone) { grid.closest('.bidsheet-row').style.display = 'none' }
    else if (grid && grey) { for (const b of grid.querySelectorAll('button')) { b.disabled = true; b.title = grey; greyed++ } grid.style.cssText += ';' + RING }
    /* THE MEMBER'S OWN LEAVE (ownWords): its Remarks and Document stay where he edits them today (his remarks window,
       D1354) — the window's Remarks row speaks for the held leave, as it does for an approved leave (D1307), and the line
       above names it without repeating its words */
    if (ownWords) {
      for (const s of win.querySelectorAll('[data-testid="bid-heldday"] .bp-heldwords')) s.remove()
      const box = win.querySelector('textarea, input[placeholder="Remarks"]')
      if (box) { box.value = ownWords; box.style.cssText += ';' + RING }
    }
    return { ok: true, greyed, title: win.querySelector('.bidsheet-hd')?.textContent?.replace(/\s+/g, ' ').trim() }
  }, [held, free, lines, grey, gone, RING, ownWords])
  if (!r.ok) throw new Error('transform failed: ' + JSON.stringify(r))
  await neutral(P); await P.waitForTimeout(200)
  return r
}

async function today(w, who, iso, name) {
  const P = w.page
  await L.openCellR(w, who, iso)
  const s = await sheetOf(P)
  await neutral(P); await P.waitForTimeout(150)
  await H.pic(w, name, [T(s), T(`cell-${who}-${iso}`)], { pad: 6, scale: 'device' })
  const said = await L.txt(P, T(s))
  await close(w)
  return { sheet: s, said }
}

/* ---------- p1 Gambit's whole-day OML, admin ---------- */
if (run('p1')) {
  for (const size of ['desk', 'phone']) {
    const w = await fresh(size), P = w.page
    const id = await ids(P), g = id.Gambit
    const held = '2026-11-17', free = '2026-11-19'
    await file(P, g, held, 'OML', 'Medical leave — grounded'); await file(P, g, free, 'CSE', 'x'); await P.waitForTimeout(600)
    const t = await today(w, g, held, `p1-${size}-1-today`)
    note('p1-' + size, 'today', `${t.sheet}: ${t.said}`)
    const lines = [{ pid: g, code: 'OML', remarks: 'Medical leave — grounded' }]
    const grey = 'OML holds 17 Nov — leave can’t go over a medical'
    const b = await proposed(w, { who: g, held, free, lines, grey })
    await H.pic(w, `p1-${size}-2-proposed-B`, [T('bid-picker')], { pad: 6, scale: 'device' })
    note('p1-' + size, 'B', JSON.stringify(b)); await close(w)
    const a = await proposed(w, { who: g, held, free, lines, grey, gone: true })
    await H.pic(w, `p1-${size}-3-proposed-A`, [T('bid-picker')], { pad: 6, scale: 'device' })
    note('p1-' + size, 'A', JSON.stringify(a)); await close(w)
    if (w.errs.length) note('p1-' + size, 'errors', w.errs.slice(0, 3).join(' | '))
    await w.ctx.close()
  }
}

/* ---------- p2 Ranger's own whole-day LL filed on the Inputs page, member, iPhone ---------- */
if (run('p2')) {
  const w = await fresh('phone'), P = w.page
  const id = await ids(P), me = id.Ranger
  const held = '2026-11-24', free = '2026-11-26'
  await file(P, me, held, 'LL', 'Family wedding'); await file(P, me, free, 'CSE', 'x'); await P.waitForTimeout(600)
  await L.signInPlain(w, 'member')
  const t = await today(w, me, held, 'p2-phone-1-today')
  note('p2', 'today', `${t.sheet}: ${t.said}`)
  const b = await proposed(w, { who: me, held, free, lines: [{ pid: me, code: 'LL', remarks: 'Family wedding' }], grey: 'LL holds 24 Nov — clear it on the Inputs page first', ownWords: 'Family wedding' })
  await H.pic(w, 'p2-phone-2-proposed-B', [T('bid-picker')], { pad: 6, scale: 'device' })
  note('p2', 'B', JSON.stringify(b)); await close(w)
  const a = await proposed(w, { who: me, held, free, lines: [{ pid: me, code: 'LL', remarks: 'Family wedding' }], grey: 'x', gone: true, ownWords: 'Family wedding' })
  await H.pic(w, 'p2-phone-3-proposed-A', [T('bid-picker')], { pad: 6, scale: 'device' })
  note('p2', 'A', JSON.stringify(a)); await close(w)
  if (w.errs.length) note('p2', 'errors', w.errs.slice(0, 3).join(' | '))
  await w.ctx.close()
}

/* ---------- p3 Nomad's overseas duty, admin, desktop ---------- */
if (run('p3')) {
  const w = await fresh('desk'), P = w.page
  const id = await ids(P), n = id.Nomad
  const held = '2026-11-18', free = '2026-11-20'
  await file(P, n, held, 'OD', 'Exercise, off island'); await file(P, n, free, 'CSE', 'x'); await P.waitForTimeout(600)
  const t = await today(w, n, held, 'p3-desk-1-today')
  note('p3', 'today', `${t.sheet}: ${t.said}`)
  const b = await proposed(w, { who: n, held, free, lines: [{ pid: n, code: 'OD', remarks: 'Exercise, off island' }], grey: null })
  await H.pic(w, 'p3-desk-2-proposed', [T('bid-picker')], { pad: 6, scale: 'device' })
  note('p3', 'proposed', JSON.stringify(b)); await close(w)
  await w.ctx.close()
}

/* ---------- p4 the two cases the ruling did not name, admin, desktop ---------- */
if (run('p4')) {
  const w = await fresh('desk'), P = w.page
  const id = await ids(P)
  /* a whole-day Other under Unavailable (D1356 opens the day's list today) */
  const c = id.Comet, cHeld = '2026-11-17', cFree = '2026-11-19'
  await file(P, c, cHeld, 'Other', 'Station board'); await file(P, c, cFree, 'CSE', 'x'); await P.waitForTimeout(600)
  const t1 = await today(w, c, cHeld, 'p4-desk-1-other-today')
  note('p4-other', 'today', `${t1.sheet}: ${t1.said}`)
  const b1 = await proposed(w, { who: c, held: cHeld, free: cFree, lines: [{ pid: c, code: 'OTH', remarks: 'Station board' }], grey: null })
  await H.pic(w, 'p4-desk-2-other-proposed', [T('bid-picker')], { pad: 6, scale: 'device' })
  note('p4-other', 'proposed', JSON.stringify(b1)); await close(w)
  /* a morning LL and an afternoon OML, both filed on the Inputs page */
  const d = id.Drifter, dHeld = '2026-11-24', dFree = '2026-11-26'
  await file(P, d, dHeld, 'LL', 'Dentist run', 'am'); await file(P, d, dHeld, 'OML', 'Medically down', 'pm'); await file(P, d, dFree, 'CSE', 'x'); await P.waitForTimeout(600)
  const t2 = await today(w, d, dHeld, 'p4-desk-3-halves-today')
  note('p4-halves', 'today', `${t2.sheet}: ${t2.said}`)
  const b2 = await proposed(w, { who: d, held: dHeld, free: dFree, lines: [{ pid: d, code: 'LL', half: 'AM', remarks: 'Dentist run' }, { pid: d, code: 'OML', half: 'PM', remarks: 'Medically down' }], grey: 'LL and OML hold 24 Nov — leave can’t go over them' })
  await H.pic(w, 'p4-desk-4-halves-proposed', [T('bid-picker')], { pad: 6, scale: 'device' })
  note('p4-halves', 'proposed', JSON.stringify(b2)); await close(w)
  if (w.errs.length) note('p4', 'errors', w.errs.slice(0, 3).join(' | '))
  await w.ctx.close()
}
H.saveLog('draw-log.json')
await H.closeBrowser()
