// The drawing check's part list for the Leave War's Events list as redrawn and approved on 29 Oct 26 (his D1512–D1516):
// the two lists (Squadron events first, then Holidays), each line's kind in one column, its pencil and its ✕ that asks
// once, the note with Undo after a delete, an empty list. The drawing of record is mock-events-split.mjs's F- frames
// (MOCK_PLAIN=1, pictures docs/mock/lw-overhaul/full/m5b/events-split/plain/), drawn on this branch at 9f90febe8 — the
// one-list Events window, its lines cloned into the busy year. It replaces lw-m5b.mjs's two Events states, whose round-1
// drawing (one list, no buttons on a line) D1516 superseded.
// Record the drawing (on the build it was drawn on — 9f90febe8's dist):
//   cd raptor-port ; MOCK_PLAIN=1 DRAWCHECK_SPEC=scripts/drawcheck/specs/lw-m5b-events.mjs \
//     DRAWCHECK_APPROVED=docs/mock/lw-overhaul/full/m5b/events-split/plain DRAWCHECK_DRAWN_ON='claude/leave-war-m5b-iphone-balances-1402b7 at 9f90febe8' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/mock-events-split.mjs <that dist> <scratch folder>
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-m5b-events.mjs --dist dist
import { fileURLToPath } from 'node:url'

const q = t => `[data-testid="${t}"]`
// the drawing's clock (mock-events-split.mjs): Thu 2 Apr 26, 09:00 at the squadron
const CLOCK = new Date('2026-04-02T09:00:00+08:00')

/* THE DRAWING'S BUSY YEAR (mock-events-split.mjs LINES), staged through the store's own writer as every drawing check
   stages its data (the localhost bridge): the demo year's events taken off first, then each line on Event row 1, a run
   of one word over its days. Families day is left out: it is added by the app's own ＋ Event, so its line wears the
   just-added ring as the drawing's does. */
const LINES = [
  [['2026-01-01'], "New Year's Day", 'off'],
  [['2026-02-17', '2026-02-18'], 'Chinese New Year', 'off'],
  [['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15', '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20'], 'Ex Pitch Black', 'work'],
  [['2026-04-03'], 'Good Friday', 'off'],
  [['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12', '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17'], 'ORE — no leave', 'nolv'],
  [['2026-05-01'], 'Labour Day', 'off'],
  [['2026-05-22'], 'Squadron dinner', null],
  [['2026-08-09'], 'National Day', 'off'],
  [['2026-08-10'], 'Off — National Day', 'free'],
  [['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'], 'Ex Cope Tiger', 'work'],
  [['2026-12-25'], 'Christmas Day', 'off'],
]
async function signIn(page, origin) {
  await page.clock.setFixedTime(CLOCK)
  await page.goto(origin + '/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('settings-open'), { timeout: 20000 }); await page.waitForTimeout(600)
}
async function stage(page, { squadron = true } = {}) {
  const had = await page.evaluate(() => window.lwEventDays())
  if (had.bands) return `staging: the demo year has ${had.bands} merged band(s) to take off first`
  for (const [d, evs] of had.days) for (let i = 0; i < evs.length; i++) if (evs[i]) await page.evaluate(([d, i]) => window.lwSetDayEvent(d, i, ''), [d, i])
  for (const [days, name, kind] of LINES) {
    if (!squadron && kind !== 'off' && kind !== 'free') continue
    for (const d of days) await page.evaluate(([d, name, kind]) => window.lwSetDayEvent(d, 0, name, kind), [d, name, kind])
  }
  await page.waitForTimeout(300)
}
const press = async (page, phone, sel) => { const l = page.locator(sel).first(); if (phone) await l.tap(); else await l.click(); await page.waitForTimeout(450) }
async function openList(page, phone) {
  await press(page, phone, q('settings-open'))
  await press(page, phone, q('settings-events'))
  await page.waitForSelector(q('events-list'))
}
/* Families day, through ＋ Event: the name typed, 31 Oct picked on its calendar, Save — back on the list, ringed */
async function addFamiliesDay(page, phone) {
  await press(page, phone, q('events-add'))
  await page.fill(q('event-text'), 'Families day')
  for (let i = 0; i < 13 && !(await page.locator(q('event-day-2026-10-31')).count()); i++) await press(page, phone, q('event-next'))
  await press(page, phone, q('event-day-2026-10-31'))
  await press(page, phone, q('event-apply'))
  if (!(await page.locator(q('evline-0-2026-10-31')).count())) return 'staging: Families day did not land on the list'
}
async function fixed(page, { origin, phone }) {
  await signIn(page, origin); await stage(page); await openList(page, phone)
  const why = await addFamiliesDay(page, phone); if (why) return why
  // Squadron dinner's ✕ pressed once: it asks
  await press(page, phone, q('evdel-0-2026-05-22'))
  await page.mouse.move(2, 2)
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const W = q('events-sheet')
const DS = '.mock-col:nth-child(1)', DH = '.mock-col:nth-child(2)'
const BS = q('events-sec-squadron'), BH = q('events-sec-holidays')
const line = (col, n) => `${col} .hol-line:nth-child(${n})`
const top = [
  P('window', 'the Events window', W, W, ['place', 'width', ...LOOK]),
  P('title', 'its title "EVENTS"', `${W} .bidsheet-hd .who`, `${W} .bidsheet-hd .who`, ['place', 'words-x'], { rel: 'window' }),
  P('period', 'the period in View', q('events-period'), q('events-period'), ['place', 'words-x'], { rel: 'window' }),
  P('add', '＋ Event', q('events-add'), q('events-add'), ['place', 'size', ...LOOK], { rel: 'window' }),
  P('presets', 'Edit presets', q('events-presets'), q('events-presets'), ['place', 'size', ...LOOK], { rel: 'window' }),
  P('sq-head', 'the heading "Squadron events · n", first', `${DS} .mock-sec`, q('events-head-squadron'), ['place', 'words-x', 'colour'], { rel: 'window' }),
  P('hol-head', 'the heading "Holidays · 7"', `${DH} .mock-sec`, q('events-head-holidays'), ['place', 'words-x', 'colour'], { rel: 'window' }),
  P('hol-list', 'the Holidays list', `${DH} .mock-part`, `${BH} .hol-list`, ['place', 'size', ...LOOK], { rel: 'window' }),
  P('h1', 'Holidays, its first line (New Year’s Day, past)', line(DH, 1), line(BH, 1), ['place', 'size', 'fill'], { rel: 'hol-list' }),
  P('h1-when', 'its date, greyed', `${line(DH, 1)} .hol-when`, `${line(BH, 1)} .hol-when`, ['place', 'colour', 'words-x'], { rel: 'h1' }),
  P('h1-name', 'its name, greyed', `${line(DH, 1)} .hol-name`, `${line(BH, 1)} .hol-name`, ['place', 'colour', 'words-x'], { rel: 'h1' }),
  P('h1-kind', 'its kind, "Public holiday"', `${line(DH, 1)} .evpeek-kind`, `${line(BH, 1)} .evpeek-kind`, ['place', 'words-place'], { rel: 'h1' }),
  P('h1-pen', 'its pencil', `${line(DH, 1)} .mock-pen`, `${line(BH, 1)} .ev-pen`, ['place', 'size', 'edge', 'corners'], { rel: 'h1' }),
  P('h1-x', 'its ✕ at rest, the red cross', `${line(DH, 1)} .mock-ctl:not(.mock-pen)`, `${line(BH, 1)} .ev-x`, ['place', 'size', 'fill', 'edge', 'corners', 'words-place', 'colour'], { rel: 'h1' }),
  P('h6', 'Holidays, its sixth line (Off — National Day)', line(DH, 6), line(BH, 6), ['place', 'size'], { rel: 'hol-list' }),
  P('h6-name', 'its name', `${line(DH, 6)} .hol-name`, `${line(BH, 6)} .hol-name`, ['place', 'words-x', 'colour'], { rel: 'h6' }),
  P('h6-kind', 'its kind, "Off day", in the column', `${line(DH, 6)} .evpeek-kind`, `${line(BH, 6)} .evpeek-kind`, ['place', 'words-place'], { rel: 'h6' }),
]
const squadron = [
  P('sq-list', 'the Squadron events list', `${DS} .mock-part`, `${BS} .hol-list`, ['place', 'size', ...LOOK], { rel: 'window' }),
  P('s1', 'Squadron events, its first line (Ex Pitch Black, past)', line(DS, 1), line(BS, 1), ['place', 'size', 'fill'], { rel: 'sq-list' }),
  P('s1-when', 'its date', `${line(DS, 1)} .hol-when`, `${line(BS, 1)} .hol-when`, ['place', 'colour', 'words-x'], { rel: 's1' }),
  P('s1-name', 'its name', `${line(DS, 1)} .hol-name`, `${line(BS, 1)} .hol-name`, ['place', 'words-x'], { rel: 's1' }),
  P('s1-kind', 'its kind, "Working event"', `${line(DS, 1)} .evpeek-kind`, `${line(BS, 1)} .evpeek-kind`, ['place', 'words-place'], { rel: 's1' }),
  P('s2-kind', 'the second line’s kind, "No leave", in the same column', `${line(DS, 2)} .evpeek-kind`, `${line(BS, 2)} .evpeek-kind`, ['place', 'words-place'], { rel: 'sq-list' }),
]
const asking = [
  P('s3', 'the third line (Squadron dinner, no kind), asking', line(DS, 3), line(BS, 3), ['place', 'size'], { rel: 'sq-list' }),
  P('s3-sure', '"Delete — sure?" in the kind’s column', `${line(DS, 3)} .evpeek-kind`, `${line(BS, 3)} .evpeek-kind`, ['place', 'words-place'], { rel: 's3' }),
  // (the drawing wrote its words in a <b> of their own colour, the build colours the column itself: the words compared)
  P('s3-sure-words', 'its words, bold, the Leave War’s pale red', `${line(DS, 3)} .evpeek-kind b`, `${line(BS, 3)} .evpeek-kind`, ['colour'], { rel: 's3' }),
  P('s3-pen', 'its pencil, not moved', `${line(DS, 3)} .mock-pen`, `${line(BS, 3)} .ev-pen`, ['place', 'size'], { rel: 's3' }),
  P('s3-x', 'its ✕ armed: the same box, solid red', `${line(DS, 3)} .mock-ctl:not(.mock-pen)`, `${line(BS, 3)} .ev-x`, ['place', 'size', 'fill', 'edge', 'colour'], { rel: 's3' }),
  // the ring itself is the app's just-added flash (6 s), drawn steady in the drawing: its place and size only
  P('s5', 'the fifth line (Families day, just added), ringed', line(DS, 5), line(BS, 5), ['place', 'size'], { rel: 'sq-list' }),
]
const deleted = [
  P('s3-after', 'the third line after the delete (Ex Cope Tiger)', line(DS, 3), line(BS, 3), ['place', 'size'], { rel: 'sq-list' }),
  P('note', 'the note at the foot, "Squadron dinner deleted · Undo"', '.mock-snack', q('events-undo-note'), ['place', 'size', 'fill', 'edge', 'corners']),
  P('note-msg', 'its words', '.mock-snack .secdef-msg', `${q('events-undo-note')} .secdef-msg`, ['place', 'words-x'], { rel: 'note' }),
  P('note-undo', 'its Undo', '.mock-snack .secdef-btn', q('events-undo'), ['place', 'size', 'fill'], { rel: 'note' }),
]
const empty = [
  P('sq-empty', '"No squadron events in JAN – DEC 26."', `${DS} .hol-empty`, q('events-empty-squadron'), ['place', 'words-x', 'colour'], { rel: 'window' }),
]

const D = 'scripts/handpass/mock-events-split.mjs'
export default {
  name: 'Leave War M5b — the Events list (D1512–D1516)',
  slug: 'lw-m5b-events',
  records: fileURLToPath(new URL('../../../docs/mock/lw-overhaul/drawcheck/m5b-events/', import.meta.url)),
  states: [
    { id: 'events-fixed-desk', title: 'The Events list, desktop, admin — one ✕ asking, a new event ringed', drawing: { script: D, shot: 'D-F-fixed' },
      reach: fixed, parts: [...top, ...squadron, ...asking] },
    { id: 'events-fixed-phone', title: 'The Events list, iPhone, admin — one ✕ asking, a new event ringed', phone: true, drawing: { script: D, shot: 'P-F-fixed' },
      reach: fixed, parts: [...top, ...squadron, ...asking] },
    { id: 'events-deleted-desk', title: 'The Events list, desktop, admin — the second press: deleted, with Undo', drawing: { script: D, shot: 'D-F-deleted' },
      async reach(page, o) { const w = await fixed(page, o); if (w) return w; await press(page, false, q('evdel-0-2026-05-22')); await page.mouse.move(2, 2) },
      parts: [...top, ...squadron, ...deleted] },
    { id: 'events-deleted-phone', title: 'The Events list, iPhone, admin — the second press: deleted, with Undo', phone: true, drawing: { script: D, shot: 'P-F-deleted' },
      async reach(page, o) { const w = await fixed(page, o); if (w) return w; await press(page, true, q('evdel-0-2026-05-22')) },
      parts: [...top, ...squadron, ...deleted] },
    { id: 'events-empty-desk', title: 'The Events list, desktop, admin — no squadron events', drawing: { script: D, shot: 'D-F-empty' },
      async reach(page, { origin }) { await signIn(page, origin); await stage(page, { squadron: false }); await openList(page, false); await page.mouse.move(2, 2) },
      parts: [...top, ...empty] },
  ],
  // the differences he has ruled to keep as built — none yet
  accepted: [],
}
