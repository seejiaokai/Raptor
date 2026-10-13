/* THE PASSING NOTES' WORDS OF RECORD, PINNED WHERE THEY ARE WRITTEN (owner D837, D838, D839 — 14 Oct 26, "All approved as
   recommended"; `[NOTES-SHORTER]`). The words: docs/superpowers/briefs/2026-10-13-wording-recheck.md — List 1, List 2,
   and List 3, whose ten rows each REPLACE their note's wording in the other two.

   WHY A READ OF THE SOURCE, BESIDE THE TESTS THAT PRESS THE CONTROLS. Thirty-odd notes were reworded to the letter — a
   dash to a full stop, one word to another — and most of them are raised from deep inside a gesture (the second tap of
   an Unpublish whose credits are spent, a warning hidden on a published day). The tests that reach a note through its
   control pin it there (reqdoor, oilundo-button, medclash, medwrite, groupeditor, phmember, DutyTplModal,
   audit-c-briefguard, publishdoor, toastbatch, lockednote, quals). This file is the one list of ALL of them, so that a
   note nobody's test happens to press cannot drift from the approved sentence unseen — and so that the notes he did
   NOT approve a change to stay word for word as they were.

   Each row is the piece of source that writes the sentence: its fixed words and punctuation, with the code's own
   interpolations between them (the callsign, the day, the version). A row fails when the sentence is reworded, moved
   to another file, or copied a different number of times. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(__dirname, '..')
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8')
const count = (text: string, piece: string) => text.split(piece).length - 1

/* [the note, the file, the piece of source, how many times it stands there] */
const BUILT: [string, string, string, number][] = [
  ['N1 — the publish note, shown alone', 'engine/publish.ts', '`${DAYS[di].dow} published and approved`', 1],
  ['N1 — what it tells the join', 'engine/publish.ts', "{day:di,head:DAYS[di].dow,body:'published and approved'}", 1],
  ['N1 — the OIL line, for the join: the Common Programme in its heading’s capitals', 'leavewar/sync.ts', "body: `${desks.replace('the common programme', 'the Common Programme')} ${so}`", 1],
  ['N2 — unpublished', 'ui/interactions.ts', '`${dow} unpublished. It is a draft again, and publishing reissues the ${wl}.`', 1],
  ['N2 — its OIL sentence', 'ui/interactions.ts', "' Its OIL credits are withdrawn from the Leave War until it is republished.'", 1],
  ['N3 — an amendment withdrawn', 'ui/interactions.ts', '`${dow}: ${wl} withdrawn. Its changes are back on the working copy as pending, and ${verLabel(now)} is the issued schedule. Publishing reissues ${wl}.`', 1],
  ['N4 — the warning before an Unpublish (List 3 row 4)', 'ui/interactions.ts', "`Some of ${DAYS[di]?.dow || 'this day'}’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm.`", 1],
  ['N6 — changes on a draft day (List 3 row 1)', 'engine/publish.ts', '`${DAYS[di].dow} is still a draft. Publish the day first, then its changes.`', 1],
  ['N9 — OIL Earn turned on, the board’s button (List 3 row 2)', 'ui/board.ts', "'OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning'", 1],
  ['N9 — the same, the board’s top bar', 'ui/SchedBoard.tsx', "'OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning'", 1],
  ['N10 — info only, on', 'ui/board.ts', "'This item is info only: no longer checked against the rules, and earns nobody any OIL'", 3],
  ['N10 — info only, off (List 3 row 8)', 'ui/board.ts', "'This item is checked against the rules again and can earn OIL'", 3],
  ['N11 — nothing today earns, on', 'ui/board.ts', "'Nothing on this day earns OIL, including anything added later'", 1],
  ['N11 — nothing today earns, off', 'ui/board.ts', "'This day can earn OIL again, and the marks underneath are back'", 1],
  ['N12 — a puck under the day’s switch', 'ui/board.ts', "'Nothing on this day earns. Turn that off first.'", 1],
  ['N12 — a puck under an item’s switch', 'ui/board.ts', "'This event earns nobody any OIL. Turn the event back on first.'", 1],
  ['N13 — a standby wave added', 'ui/board.ts', "S.label + ' added: standalone, ' + (S.all ? 'every seat checked for availability, SC currency, front seat and overlapping places only'", 1],
  ['N14 — a line made SPARE', 'ui/interactions.ts', "'Line is SPARE now: standing by, checked for availability and currency only'", 1],
  ['N14 — a line made MAIN', 'ui/interactions.ts', "'Line is MAIN now: fully cross-checked'", 1],
  ['N15 — a warning hidden (List 3 row 5)', 'ui/interactions.ts', "'Warning hidden: no flag, not counted. It returns if the warning changes.'", 1],
  ['N16 — a note made public: today’s wording, whole', 'ui/interactions.ts', "on ? 'Note now shows on the view-only schedule' : 'Note is scheduler-only again'", 1],
  ['N17 — the board’s desktop layout on a phone', 'ui/board.ts', "'Desktop layout: pan sideways to read the whole day'", 1],
  ['N19 — a brief stranded by an earlier take-off (List 3 row 3)', 'engine/slots.ts', '`The ${bwas} brief was after the new take-off, so it was removed`', 1],
  ['N22 — the last document', 'ui/inputedit.tsx', "'Keep at least one document on this entry. Add the replacement before removing the last file.'", 1],
  ['N23 — an identical ground row', 'ui/inputedit.tsx', "'An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead'", 1],
  ['N24 — a drop on an ALL AVAIL input (List 3 row 9)', 'ui/inputedit.tsx', '`An ${PEOPLE[from].cs} input can only be changed in its own window. Open it to change who it is for.`', 1],
  ['N24 — who is in an input of several (List 3 row 9)', 'ui/inputedit.tsx', "'Open this input’s own window to change who is in it'", 1],
  ['N25 — an input removed under its open window', 'ui/inputedit.tsx', "'That input was removed while its window was open, so the window has closed'", 1],
  ['N26 — a medical entry of several', 'ui/inputedit.tsx', "'A medical entry is one person’s own. Take the other people out and save, then change its kind.'", 1],
  ['N27 — the last on an input', 'ui/reqdoor.ts', '`${cs} is the last on this input. Take the input off the programme, or delete it in its own window.`', 1],
  ['N28 — NAAR’s instructor mark (List 3 row 6)', 'state/quals-write.ts', '`${p.cs} needs the DAAR instructor mark before NAAR can carry one, so the NAAR tick comes off instead`', 1],
  ['N29 — a qualification off the LoX', 'ui/QualsPage.tsx', "`${c.h} removed from the LoX. Nobody's record changed. Add it back and the ticks return.`", 1],
  ['N30 — a store off the list', 'ui/interactions.ts', '`${lab} removed from the list. Every jet carrying it keeps it. Add it back and the chips return.`', 1],
  ['N31 — a leave war period created', 'ui/interactions.ts', '`The ${yr} leave war period is created. Set its bidding window here.`', 1],
  ['N32 — a leave war already there', 'ui/interactions.ts', '`A leave war already covers part of ${yr}. Open the Leave War and extend it instead.`', 1],
  ['"is not a time" — a schedule box', 'engine/slots.ts', '`${v} is not a time. Try 0900 or 09:00.`', 1],
  ['"is not a time" — a duty template', 'ui/DutyTplModal.tsx', '`${v} is not a time. Try 0900 or 09:00.`', 1],
  ['"is not a time" — a wave template', 'ui/WaveTplModal.tsx', '`${v} is not a time. Try 0900 or 09:00.`', 1],
  ['Red box', 'ui/board.ts', "'Red box: flagged for the next scheduler'", 6],
  ['LATE mark hidden', 'ui/interactions.ts', "'LATE mark hidden. The Inputs page still shows it.'", 1],
  ['Left OIL Earn (List 3 row 7)', 'ui/topbits.tsx', "'Left OIL Earn without undoing. The next undo would change the day itself.'", 1],
]

/* the old words of the notes above — gone from the file that said them */
const GONE: [string, string][] = [
  ['engine/publish.ts', 'published — APPROVED'],
  ['engine/publish.ts', 'is still draft — publish the day before publishing its changes'],
  ['ui/interactions.ts', '`Heads up — ${'],
  ['ui/interactions.ts', 'are bid against on the Leave War'],
  ['ui/interactions.ts', 'unpublished — it is a draft again'],
  ['ui/interactions.ts', 'withdrawn — its changes are back'],
  ['ui/interactions.ts', 'its OIL credits leave the Leave War'],
  ['ui/interactions.ts', 'It returns if the day changes'],
  ['ui/interactions.ts', 'LATE mark hidden —'],
  ['ui/interactions.ts', 'Line is SPARE now —'],
  ['ui/interactions.ts', 'Line is MAIN now —'],
  ['ui/board.ts', 'OIL mode — tap a puck'],
  ['ui/SchedBoard.tsx', 'OIL mode — tap a puck'],
  ['ui/board.ts', "'Info only — this item is no longer checked"],
  ['ui/board.ts', "'This item is checked against the rules again'"],
  ['ui/board.ts', 'anything added later is covered too'],
  ['ui/board.ts', 'This day can earn again —'],
  ['ui/board.ts', "'Red box — flagged for the next scheduler'"],
  ['ui/board.ts', 'added — standalone'],
  ['ui/board.ts', 'Desktop layout —'],
  ['engine/slots.ts', 'so it has been cleared'],
  ['engine/slots.ts', 'is not a time —'],
  ['ui/DutyTplModal.tsx', 'is not a time —'],
  ['ui/WaveTplModal.tsx', 'is not a time —'],
  ['ui/inputedit.tsx', 'on this entry — add the replacement'],
  ['ui/inputedit.tsx', 'Ground Programme — added under'],
  ['ui/inputedit.tsx', "'Who is in this input is changed in its own window'"],
  ['ui/inputedit.tsx', 'is changed in its own window — open it'],
  ['ui/inputedit.tsx', 'was open — the window has closed'],
  ['ui/inputedit.tsx', 'save first — then change its kind'],
  ['ui/reqdoor.ts', 'is the last on this input —'],
  ['state/quals-write.ts', 'can carry it — the tick comes off instead'],
  ['ui/QualsPage.tsx', "Nobody's record changed —"],
  ['ui/QualsPage.tsx', "toast('Shortcut to the Admin page"],
  ['ui/topbits.tsx', 'Left OIL Earn —'],
]

/* NOT ON HIS LIST OF 13 OCT 26 — left for the whole-app words job (D808) unless he says otherwise, never changed unasked
   (the record's last bullet). Each stands exactly as it did, as many times as it did. */
const LEFT: [string, string, string, number][] = [
  ['the OIL line shown by itself or behind a receipt — its own day and colon', 'leavewar/sync.ts', 'line: `${when}: ${desks} ${so}`', 1],
  ['…whose words are today’s', 'leavewar/sync.ts', "const so = `no usable times, so nobody on ${blind.length > 1 ? 'them' : 'it'} earns OIL`", 1],
  ['the OIL line’s second form', 'leavewar/sync.ts', 'line: `${when} earned nobody any OIL — ${desks} no usable times`', 1],
  ['"no leave war period for 2027 …"', 'leavewar/sync.ts', '`there is no leave war period for ${iso.slice(0, 4)}, so no OIL can be earned for this day — create the period on the Leave War`', 1],
  ['"… now sits on published work — …"', 'leavewar/sync.ts', "`${said.join(', ')} now sits on published work — the day is flagged, the bid is still live`", 1],
  ['…and the dot that joins those lines', 'leavewar/sync.ts', "lines.join(' · ')", 1],
  ['the names a blind place goes by (the day’s own warning reads them too)', 'engine/oil.ts', "add('the common programme');", 1],
  ['the day bar under "Nothing today earns"', 'ui/oilmode.ts', "'Nothing on this day earns OIL. The marks underneath are kept — turn it off and they come back.'", 1],
  ['"That is not a time" in an input’s own editors', 'ui/inputedit.tsx', "'That is not a time — try 0900 or 09:00'", 2],
  ['N32’s twin on the Holidays list', 'ui/HolidaysPanel.tsx', '`A leave period already covers part of ${year} — open the Leave War and extend it instead.`', 1],
  ['N12’s copy in the ALL AVAIL window — the day', 'ui/AvailWindow.tsx', "'Nothing on this day earns — turn that off first'", 1],
  ['N12’s copy in the ALL AVAIL window — the event', 'ui/AvailWindow.tsx', "'This event earns nobody any OIL — turn the event back on first'", 1],
  ['N12’s copy on the board — the item’s own switch', 'ui/board.ts', "return toast('Nothing on this day earns — turn that off first')", 1],
  ['N10’s words in a hover title — the tag', 'ui/board-html.ts', 'title="Info only — not checked against the rules, and earns no OIL"', 2],
  ['N10’s words in a hover title — the week’s tag', 'ui/html.ts', 'title="Info only — not checked against the rules, and earns no OIL"', 1],
  ['the red box’s words in a hover title', 'ui/board-html.ts', "'Red box — flag for the next scheduler'", 2],
  ['the red box’s words in a hover title — a flying line', 'ui/board.ts', "'Red box — flag this for the next scheduler'", 1],
  ['N8’s line, which the app can no longer show', 'ui/board.ts', 'replaces your unpublished edits on ${d.dow} — open Templates and pick it again to confirm`', 1],
  ['N5 — an amendment’s receipt keeps its dots (no note of ours joins it differently)', 'ui/toast.ts', "said.join(' · ')", 1],
]

describe('the words built — each stands in its file, to the letter', () => {
  it.each(BUILT)('%s (%s)', (_note, file, piece, n) => {
    expect(count(read(file), piece)).toBe(n)
  })
})
describe('the words they replaced are gone', () => {
  it.each(GONE)('%s no longer says "%s"', (file, piece) => {
    expect(count(read(file), piece)).toBe(0)
  })
})
describe('the notes not on his list are left word for word', () => {
  it.each(LEFT)('%s (%s)', (_note, file, piece, n) => {
    expect(count(read(file), piece)).toBe(n)
  })
})
