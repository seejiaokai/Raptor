/* The IT flow guide's WORDS ([IT-FLOW-GUIDE], D410–D418) — every slide's text, and which picture it uses; deck.mjs
   only lays them out. Plain and few, the app's own names, no rules-engine arithmetic (his ask). A journey is one or
   more slides of a kind: 'steps' (pictures in order, arrows between), 'ways' (several ways to one end, side by
   side — D412), 'compare' (two ways of working — D416), 'ripple' (one action, every place it shows by itself —
   D415). In a caption line {n} is the orange click mark of that number, {see: true} the green "what you should
   see" ring, neither a plain note. A test is [file, what it proves]; every file named was read to confirm it
   covers the journey — when a test is renamed or a screen changes, fix the entry here and re-shoot (README). */

export const PAGES = [
  ['editsched', 'Edit Schedule'], ['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['quals', 'Quals'],
  ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['admin', 'Admin · Logic'],
]

const see = t => ({ see: true, t })
const note = t => ({ t })
const c = (n, t) => ({ n, t })

export const JOURNEYS = [
  {
    n: 1, title: 'Sign in, or ask for access', who: 'everyone', page: 'signin', where: 'The sign-in card → Admin → Users',
    slides: [{
      steps: [
        { shot: 'signin-1', lines: [c(1, 'Type the defence mail'), c(2, 'Type a password'), c(3, 'Sign in')] },
        { shot: 'signin-2', lines: [c(4, 'Not on the list: your name'), c(5, 'Pilot, WSO or personnel'), c(6, 'Request access')] },
        { shot: 'signin-3', lines: [see('"Your request is with the admins"')] },
        { shot: 'signin-4', lines: [c(7, 'Admin shows 1 waiting'), c(8, 'Give access (or Refuse)')] },
      ],
      checks: [
        'A wrong password on a real account shows "Incorrect username or password."',
        'A sign-in nobody knows opens Request access; Personnel hides the CAT box.',
        'Signing in again while waiting shows the waiting screen, not the form.',
        'The admin sees a 1 on the Admin tab, "1 waiting for access" and the bell lit.',
        'Give access opens New person already filled in; he then signs in as a member.',
      ],
      tests: [
        ['accounts-ui.test.tsx', 'request → waiting; the Admin tab counts it'],
        ['accounts-newperson.test.tsx', 'Give access filled in; the bell lights'],
        ['onedoor-users.test.tsx', 'Give access / Refuse; Post in asked'],
        ['accounts.test.ts', 'a new user joins either way'],
        ['e2e/geometry.spec.ts', 'the sign-in cards fit desktop and phone'],
      ],
    }],
  },
  {
    n: 2, title: 'Make a schedule', who: 'admin', page: 'editsched', where: 'Edit Schedule · the Scheduler Board',
    slides: [
      {
        kind: 'compare', title: 'Two ways to edit: the week and the board',
        ways: [
          { t: 'Edit Schedule — the week: the big picture, smaller edits', shot: 'modes-week', lines: [
            c(1, 'Tap a day\'s date to open its board'),
            note('All seven days side by side: drag a puck to another day'),
            note('The Amendments panel, the export buttons, the week picker'),
            note('Fill seats, type times, sign and publish — as on the board'),
          ] },
          { t: 'The Scheduler Board — one day, every tool', shot: 'modes-board', lines: [
            c(2, '✓ Done goes back to the week'),
            note('Add: + Note, + Item, + Wave, + Line, + Block, + Row, + Inputs'),
            note('Per row: CX cancel, flag, info, ✕; Auto sort, Sort all, drag rows'),
            note('Its issue list is always open, beside the crew list'),
          ] },
        ],
        checks: [
          'The date in a day heading opens the board on that day; ✓ Done returns to the week.',
          'A change on the board shows on the week, and the other way round.',
          'Both have: sign-off and Publish, the plan selector, Templates, drag, tap-to-arm and right-click remove.',
        ],
        tests: [
          ['board.test.tsx', 'the board\'s adds, kinds and templates'],
          ['boardnav.test.tsx', 'the board\'s day and week stepping'],
          ['editweek.test.tsx', 'the week\'s editing, arm and plant'],
        ],
      },
      {
        title: 'A day from nothing: the first steps',
        steps: [
          { shot: 'build-1', lines: [c(1, 'Templates: apply or save one'), see('Saved day templates listed here')] },
          { shot: 'build-2', lines: [c(2, '+ Item on the programme'), c(3, 'Type what it is')] },
          { shot: 'build-3', lines: [c(4, '+ Wave'), c(5, 'Flying wave, SC, AVALON or BB')] },
          { shot: 'build-4', lines: [c(6, '+ Line in the wave'), c(7, 'Callsign, then seats and times')] },
        ],
        checks: [
          'A bare day (week of 27 Jul) says "No flying waves yet — + Wave above adds the first."',
          'A saved day template fills a draft day in one tap; a published day refuses it.',
          '+ Wave offers Flying wave / SC / AVALON / BB and a ⚙ to manage wave templates.',
          '+ Line adds a blank line at the bottom of the wave ("Line added").',
        ],
        tests: [
          ['daytplui.test.tsx', 'save / apply a day template; published refuses'],
          ['board.test.tsx', '+ Line, + Wave kinds, ✕ Wave'],
          ['wavepicker.test.tsx', 'the wave kinds and saved templates'],
          ['wavedefault-add.test.tsx', 'a new wave lands in the set order'],
        ],
      },
      {
        title: 'Duties, sims and the ground programme',
        steps: [
          { shot: 'build-5', lines: [c(1, '+ Block under Duties'), c(2, 'A duty template: Standard…')] },
          { shot: 'build-6', lines: [c(3, '+ Row for one more desk'), see('The template\'s roles land')] },
          { shot: 'build-7', lines: [c(4, 'Sims: + Block (brief, box, debrief)')] },
          { shot: 'build-8', lines: [c(5, 'Ground: + Item'), c(6, '+ Inputs: file for a person')] },
        ],
        checks: [
          'Standard gives SDO / SXO / OPS O rows; the pencil in the menu edits the templates.',
          'A sims + Block adds BRIEF, BOX and DEBRIEF rows together.',
          '+ Inputs on the Ground Programme files an input for a person and lands his row ("Input added to the Ground Programme").',
          'SANS and Unavailable have their own + Add for leave, medical and SANS.',
        ],
        tests: [
          ['board.test.tsx', '+ Block offers the duty templates'],
          ['DutyTplModal.test.tsx', 'a duty template: rows, new, delete'],
          ['boardaddinput.test.tsx', 'adding an input through the board'],
          ['dutytpl.test.ts', 'a template copies onto the day'],
        ],
      },
      {
        kind: 'ways', title: 'Every way to put a person on a seat (1 of 2)',
        intro: 'All of these work on the week and on the board, unless it says.',
        ways: [
          { t: 'Drag from the crew list', shot: 'puck-a', lines: [c(1, 'Pick up a name'), c(2, 'Drop on + ADD or a seat')] },
          { t: 'Tap the seat, then a name', shot: 'puck-b', lines: [c(1, 'The seat arms, list narrows'), c(2, 'Tap a free name')] },
          { t: 'ALL AVAIL or ALL', shot: 'puck-c', lines: [c(1, 'A placeholder, dragged in'), c(2, 'Any seat but a jet\'s')] },
          { t: 'Seat to seat, or day to day', shot: 'puck-d', lines: [c(1, 'Drag a puck already on'), c(2, 'Onto an empty seat: he moves')] },
        ],
        checks: [
          'A dropped name leaves the FREE count (it drops by one) and Undo lights up.',
          'Tapping an empty seat rings it and strikes the names who are not free, with their reason.',
          'ALL on a jet seat is refused: "ALL — cannot crew a jet…".',
          'Dragging a puck to another day moves him (week only); onto another puck swaps the two.',
        ],
        tests: [
          ['e2e/geometry.spec.ts', 'a real mouse drag lands on the pointer machine'],
          ['drag.test.tsx', 'roster to seat, swaps, drag-off removes'],
          ['editweek.test.tsx', 'arm a seat, then plant a name'],
          ['palette.test.ts', 'the crew list carries ALL AVAIL and ALL'],
        ],
      },
      {
        kind: 'ways', title: 'Every way to put a person on a seat (2 of 2)',
        intro: 'A tap on a name first does not place him — it lights every copy of him. The search box only highlights.',
        ways: [
          { t: '+ Inputs on the board', shot: 'inputs-w3', lines: [c(1, 'Person, type, times, Add')] },
          { t: 'Accept a personal input', shot: 'puck-f', lines: [c(1, 'ACCEPT puts him on the day')] },
          { t: 'A member files an activity', shot: 'inputs-3', lines: [see('It lands on the day by itself')] },
        ],
        checks: [
          'An activity input (a meeting, an appointment) lands on its day by itself; UNDO takes it off, ACCEPT puts it back.',
          'On a published day a landed input reads as a pending change instead.',
          'Loading a template, switching plans and Undo also put pucks back — whole-day copies.',
        ],
        tests: [
          ['boardaddinput.test.tsx', 'adding through the board'],
          ['accept.test.ts', 'accept and unaccept an input'],
          ['inputground.test.ts', 'an activity lands on its day by itself'],
        ],
      },
      {
        kind: 'ways', title: 'Take off, cancel, put in order',
        ways: [
          { t: 'Right-click to remove', shot: 'off-a', lines: [c(1, 'Right-click the puck')] },
          { t: 'Drag it off', shot: 'off-b', lines: [c(1, 'Onto the crew list'), see('Back in the free list')] },
          { t: 'Cancel, not delete (board)', shot: 'off-c', lines: [c(1, 'A reason: WX, OPS, LOGS'), c(2, 'Cancel line')] },
          { t: 'Put rows in order (board)', shot: 'off-d', lines: [c(1, 'Auto sort by start time')] },
        ],
        checks: [
          'Right-click removes with a toast ("Trident removed"); Undo brings him back.',
          'CX keeps the line and prints "CX DUE WX"; Un-cancel restores it.',
          'Auto sort puts one section in time order; Sort all asks first, then sorts the day in one undo.',
          'A row\'s grip drags it up or down; a section\'s ⠿ grip moves the whole section (display only).',
        ],
        tests: [
          ['drag.test.tsx', 'drag-off removes'],
          ['sort.test.ts', 'Auto sort and Sort all'],
          ['rowdrag.test.tsx', 'dragging rows, waves and sections'],
          ['audit-d-sortall-undo.test.tsx', 'Sort all is one undo'],
        ],
      },
      {
        title: 'Check the day: the issues',
        steps: [
          { shot: 'issues-1', lines: [c(1, 'Tap "N issues · tap to review"'), see('One line per issue')] },
          { shot: 'issues-2', lines: [note('Tap an issue: the week jumps'), note('to the puck and lights it')] },
          { shot: 'issues-3', lines: [note('On the board the list'), note('is always open')] },
        ],
        checks: [
          'The bar opens the day\'s list; tap it again to fold it.',
          'Tapping an issue scrolls to the puck and lights its crew in the warning colours.',
          'An ✕ on an issue hides it on both the week and the board; Undo shows it again.',
        ],
        tests: [
          ['warnjump.test.tsx', 'an issue click scrolls to the puck'],
          ['interact.test.tsx', 'the issues bar opens and folds'],
          ['warnmute-week.test.ts', 'one hide, both surfaces'],
        ],
      },
    ],
  },
  {
    n: 3, title: 'Publish a day', who: 'admin', page: 'editsched', where: 'Edit Schedule',
    slides: [{
      steps: [
        { shot: 'publish-1', lines: [c(1, 'Open Edit Schedule'), c(2, 'Pick the week')] },
        { shot: 'publish-2', lines: [c(3, 'Pick the four sign-off names'), c(4, 'Press Publish day')] },
        { shot: 'publish-3', lines: [see('The day wears ORIG'), see('Unpublish appears')] },
        { shot: 'publish-4', lines: [see('View-only Sched shows ORIG'), see('"Original — as issued"')] },
      ],
      checks: [
        'Publish day stays locked until all four names are picked; its hover hint names who is missing.',
        'After publishing: the ORIG tag, the signed line, and "Monday published — APPROVED".',
        'A member (us / us) sees the issued day on View-only Sched and has no Edit Schedule.',
        'Reload the page: the day is still published.',
        'Change anything after signing: the names clear and Publish locks again.',
      ],
      tests: [
        ['pubsweep.test.tsx', 'sign, publish, ORIG, what viewers see'],
        ['publish.test.ts', 'the four sign-off roles; three of four stays locked'],
        ['signbind.test.ts', 'an edit after signing clears the names'],
        ['unpublish-button.test.tsx', 'Unpublish shows only where it should'],
        ['am-01-basics.mjs', 'walk script: the same, in a real browser'],
      ],
    }],
  },
  {
    n: 4, title: 'Amend a published day', who: 'admin', page: 'editsched', where: 'Edit Schedule (or the board)',
    slides: [{
      steps: [
        { shot: 'amend-1', lines: [see('Published: ORIG'), see('Sign-offs empty again')] },
        { shot: 'amend-2', lines: [c(1, 'Change something'), see('"1 pending", "Not yet signed"')] },
        { shot: 'amend-3', lines: [c(2, 'Sign the four again'), c(3, 'Publish AL1')] },
        { shot: 'amend-4', lines: [see('The day wears AL1'), c(4, 'Unpublish takes it back')] },
      ],
      checks: [
        'Any change on a published day shows "1 pending" and "Not yet signed"; Publish AL1 stays locked until all four sign.',
        'The changed detail carries a pending mark; after publishing it wears a solid AL1 tag.',
        'A second change after signing drops all four names again.',
        'Unpublish: "AL1 withdrawn — its changes are back on the working copy as pending".',
        'Members keep seeing the issued version until AL1 goes out.',
      ],
      tests: [
        ['editweek.test.tsx', 'an edit grows the AL button, gated on signing'],
        ['amendretest.test.tsx', 'Not yet signed / Not yet published'],
        ['publish-commit.test.ts', 'the Original, then each AL recorded'],
        ['unpublish-commit.test.ts', 'Unpublish re-opens only what differs'],
        ['e2e/amendbatch.spec.ts', 'a changed puck wears its ALn tag'],
      ],
    }],
  },
  {
    n: 5, title: 'Alternate plans', who: 'admin', page: 'editsched', where: 'Edit Schedule — the plan selector',
    slides: [{
      steps: [
        { shot: 'plans-1', lines: [c(1, 'Open the plan selector'), c(2, '+ Alt Plan'), see('Issued versions: look only')] },
        { shot: 'plans-2', lines: [c(3, 'Tap a plan to make it live'), see('The live plan is marked ●')] },
        { shot: 'plans-3', lines: [see('The day now shows Plan A'), note('Differences mark as the next AL')] },
        { shot: 'plans-4', lines: [c(4, 'Back to live copy'), c(5, 'Load onto working copy')] },
      ],
      checks: [
        '+ Alt Plan renames the current day to Plan A and makes Plan B the live day.',
        'Switching is plain editing: on a published day the differences show as pending marks, no review screen.',
        'The toast says how the plan compares with what was issued ("matches Original — nothing pending").',
        'Issued rows only look; Load onto working copy asks first if edits are pending.',
        '✎ Manage plans renames or deletes a plan.',
      ],
      tests: [
        ['planselector.test.tsx', 'the label states, switch, preview'],
        ['draftsui.test.tsx', 'the menu, + Alt Plan, a published switch'],
        ['editweek.test.tsx', 'preview a version, load onto working copy'],
        ['drafts.test.ts', 'plans kept per day'],
      ],
    }],
  },
  {
    n: 6, title: 'Read the schedule', who: 'everyone', page: 'viewsched', where: 'View-only Sched',
    slides: [
      {
        steps: [
          { shot: 'read-1', lines: [c(1, 'Jump to a date'), c(2, 'Or tap a week')] },
          { shot: 'read-2', lines: [c(3, 'Tap any day to go to it')] },
          { shot: 'read-3', lines: [c(4, 'A published day: its versions'), see('The working draft, stamped')] },
          { shot: 'read-4', lines: [c(5, 'Tap the issues bar'), see('What the checks found')] },
        ],
        checks: [
          'A member\'s top bar has no Edit Schedule and no Admin.',
          'A published day opens on "Original — as issued"; "Working draft — not issued" shows the live copy under a stamp.',
          'An unpublished day shows DRAFT and no version picker.',
          'The issues bar opens and folds the list.',
        ],
        tests: [
          ['draftsui.test.tsx', 'issued by default; working copy under a banner'],
          ['interact.test.tsx', 'the issues bar opens and folds'],
          ['weeknav.test.ts', 'the week picker and its window'],
          ['odds.test.tsx', 'the phone menu\'s calendar and Today'],
        ],
      },
      {
        kind: 'ways', title: 'Other ways to move about',
        ways: [
          { t: 'Day arrows (desktop)', shot: 'read-w1', lines: [c(1, 'One press, one day'), see('"Day 2–4 of 7"')] },
          { t: 'Next-week preview', shot: 'read-w2', lines: [c(1, 'Tap a greyed day to load it')] },
          { t: 'Phone: swipe', shot: 'read-p2', lines: [note('One day fills the screen'), see('Swipe to the next day')] },
          { t: 'Phone: the menu', shot: 'read-p3', lines: [c(1, 'Menu'), c(2, 'Pick a date…')] },
        ],
        checks: [
          'At the week\'s end the › arrow crosses into the next week.',
          'Clicking a next-week day loads that week and lands on it.',
          'On a phone a swipe off Sunday or Monday changes week.',
        ],
        tests: [
          ['pan.test.tsx', 'arrows move whole days; the edge crosses weeks'],
          ['peek.test.tsx', 'a peek day lands and loads'],
          ['swipeweeks.test.tsx', 'a swipe off the end changes week'],
        ],
      },
    ],
  },
  {
    n: 7, title: 'File an input or a medical', who: 'everyone', page: 'inputs', where: 'Inputs',
    slides: [
      {
        steps: [
          { shot: 'inputs-1', lines: [c(1, 'Pick the day(s)'), c(2, 'The type'), c(3, 'Times, if not all day'), c(4, 'Remarks'), c(5, 'Add input')] },
          { shot: 'inputs-2', lines: [see('It is on the list')] },
          { shot: 'inputs-3', lines: [see('And on that day\'s schedule')] },
          { shot: 'inputs-4', lines: [note('A medical, with its document:'), see('the Medical view shows him')] },
        ],
        checks: [
          'A member files for himself only (the person is fixed); an admin picks anyone.',
          'An input filed less than two weeks ahead wears LATE; a downchit never does.',
          'A medical type asks for its document; adding without one asks first.',
          'The Medical button counts "down now" (red) and "owing an upchit" (amber).',
        ],
        tests: [
          ['inputs.test.tsx', 'a member files for himself; add and delete'],
          ['docconfirm.test.tsx', 'a medical without a document asks'],
          ['medicalview.test.tsx', 'the three sections; a card opens its document'],
          ['e2e/medical.spec.ts', 'the Medical view fits desktop and phone'],
          ['lateinput.test.ts', 'the LATE mark; downchits never'],
        ],
      },
      {
        kind: 'ways', title: 'Other ways to file an input',
        ways: [
          { t: 'The Calendar view', shot: 'inputs-w2', lines: [note('A day → + Input'), c(1, 'Type, times, remarks'), c(2, 'Add')] },
          { t: '+ Inputs on the board (admin)', shot: 'inputs-w3', lines: [c(1, 'For any person, that day')] },
          { t: 'Leave through the Leave War', shot: 'bid-3', lines: [note('An approved bid becomes'), note('his leave input (journey 10)')] },
        ],
        checks: [
          'The Calendar view opens on the real month; ‹ steps back to the demo July.',
          'An input added on the board shows on the Inputs page at once.',
          'An approved Leave War bid appears on the Inputs page at Approve.',
        ],
        tests: [
          ['inputscal.test.tsx', 'the day popover; hold to add'],
          ['boardaddinput.test.tsx', 'adding through the board'],
          ['sync.test.ts', 'approving turns bids into one input'],
        ],
      },
    ],
  },
  {
    n: 8, title: 'Update quals', who: 'everyone', page: 'quals', where: 'Quals',
    slides: [{
      steps: [
        { shot: 'quals-1', lines: [c(1, 'Enable editing'), see('Pilots, WSOs, Personnel, All')] },
        { shot: 'quals-2', lines: [c(2, 'Tick your own box'), c(3, 'Your CAT')] },
        { shot: 'quals-3', lines: [see('Another\'s row refuses')] },
        { shot: 'quals-4', lines: [c(4, 'Admin: Edit quals'), c(5, 'A new qualification'), c(6, 'Add a column')] },
      ],
      checks: [
        'A tick takes effect at once; "Save changes" only leaves edit mode.',
        'A member edits only his own row: "You can only edit your own row".',
        'An admin edits any row, renames callsigns and adds or removes columns.',
        'A change in Quals re-checks the week (a lapsed qual warns at once).',
      ],
      tests: [
        ['quals-write.test.ts', 'own row only; admin any row'],
        ['quals.test.tsx', 'a member ticks but cannot reshape'],
        ['quals.test.tsx', 'a tick or CAT change re-checks the week'],
        ['qualcols.test.ts', 'a new column, kept after reload'],
      ],
    }],
  },
  {
    n: 9, title: 'Bid for leave', who: 'everyone', page: 'leavewar', where: 'Leave War — your own row',
    slides: [
      {
        steps: [
          { shot: 'bid-1', lines: [c(1, 'Leave War'), c(2, 'Fold the Manning away'), c(3, 'And the figures'), see('The stage: open for bidding')] },
          { shot: 'bid-2', lines: [c(4, 'Tap a day on your row')] },
          { shot: 'bid-3', lines: [c(5, 'Whole day, AM or PM'), c(6, 'The leave'), see('Below zero: tap again')] },
          { shot: 'bid-4', lines: [see('The bid, plain until answered'), see('Your balance moves')] },
        ],
        checks: [
          'A tap on someone else\'s row opens nothing; a member bids only on his own.',
          'A bid lands plain; an admin\'s answer colours it (green approved, purple Ack, red refused).',
          'Going below zero asks once ("Tap the same leave again"), then writes.',
          'Bids only inside the "Bidding on" dates; once Bidding closed, a member\'s tap opens nothing.',
        ],
        tests: [
          ['e2e/leavewar.spec.ts', 'a bid lands plain; own row only'],
          ['bidding.test.tsx', 'placing a bid; below zero asks once'],
          ['window.test.tsx', 'the bidding window on screen'],
          ['e2e/leavewar.spec.ts', 'closing the war locks members out'],
        ],
      },
      {
        kind: 'ways', title: 'Other ways to bid, and after publishing',
        ways: [
          { t: 'Drag across days', shot: 'bid-w1', lines: [c(1, 'Press the first day'), c(2, 'Release on the last'), c(3, 'The leave')] },
          { t: 'Pick a range in the sheet', shot: 'bid-w2', lines: [c(1, 'Pick a range'), c(2, 'The last day'), c(3, 'The leave')] },
          { t: 'Published: your remarks', shot: 'lwflow-remarks', lines: [c(1, 'Your approved day'), c(2, 'Remarks'), c(3, 'Save')] },
        ],
        checks: [
          'A drag fills the whole span in one go; going below zero asks once first, naming each man, as a one-day bid does (D418).',
          'Pick a range opens a calendar on the tapped day.',
          'After publishing, a member opens only his own approved leave, for its remarks.',
        ],
        tests: [
          ['e2e/leavewar.spec.ts', 'drag-selecting fills the whole span; a drag below zero asks once'],
          ['bidding.test.tsx', 'bidding over a range'],
          ['remarks.test.tsx', 'remarks on an approved leave'],
        ],
      },
    ],
  },
  {
    n: 10, title: 'Run the Leave War', who: 'admin', page: 'leavewar', where: 'Leave War',
    slides: [
      {
        steps: [
          { shot: 'run-1', lines: [c(1, '→ Bidding closed'), see('The stage now; + New')] },
          { shot: 'run-2', lines: [c(2, 'Tap a bid'), c(3, 'Approve (or Ack, Refuse)'), c(4, '⇄ Move')] },
          { shot: 'run-3', lines: [c(5, 'Tap the new day'), see('Cancel stops the move')] },
          { shot: 'run-4', lines: [see('Published'), see('← Bidding closed undoes it')] },
        ],
        checks: [
          'Stages: Draft → Open for bidding → Bidding closed → Published; no confirm; the top bar\'s Undo takes a stage back.',
          'The admin decides in every stage but Draft (D418).',
          'An approved leave reaches Inputs and the schedule at Approve, not at Publish (D418).',
          'A bid moved after bidding closed wears a dotted edge and "moved from".',
          'Published: members are locked out; an approved leave offers only its remarks (D418).',
        ],
        tests: [
          ['deciding.test.tsx', 'approve, ack, refuse'],
          ['chrome.test.tsx', 'the stage strip'],
          ['stage-undo.test.ts', 'Undo takes back a stage move'],
          ['sync.test.ts', 'approving turns bids into one input'],
          ['moveone.test.tsx', 'moving one bid'],
        ],
      },
      {
        kind: 'ways', title: 'More ways: many at once, and a new period',
        ways: [
          { t: 'Decide many at once', shot: 'run-w1', lines: [c(1, 'Drag across'), c(2, 'the bids'), c(3, 'Approve all')] },
          { t: 'A new period', shot: 'run-w3', lines: [c(1, 'Its name'), c(2, 'First day'), c(3, 'Last day'), c(4, 'Create')] },
          { t: 'It starts in Draft', shot: 'lwflow-open', lines: [c(1, '→ Open for bidding')] },
        ],
        checks: [
          'A drag-selection offers Ack / Approve / Refuse, Move and Delete for every bid in it.',
          'A day with two entries shows "+1"; its list decides each one.',
          'A new war opens on the admin\'s screen in Draft; members pick it in Period.',
          'A new war\'s "Bidding on" reads "THE WHOLE YEAR" until its dates are set.',
        ],
        tests: [
          ['selectsheet.test.tsx', 'decide many; batch approve'],
          ['e2e/step4-leavewar.spec.ts', 'the day\'s list, each undoable'],
          ['wars.test.tsx', 'creating a leave war'],
        ],
      },
      {
        title: 'The Manning — set it up your way',
        steps: [
          { shot: 'man-1', lines: [c(1, 'Tap a row\'s name'), c(2, '⚙ Settings'), see('Days under-manned')] },
          { shot: 'man-2', lines: [c(3, 'Amber below'), c(4, 'Red below'), c(5, 'Save'), c(6, 'Edit counter…')] },
          { shot: 'man-3', lines: [c(7, 'A new counter'), c(8, 'Who: CAT'), c(9, 'Holding a qual'), c(10, 'Add counter')] },
          { shot: 'man-4', lines: [c(11, '⇅ Rearrange'), c(12, 'The eye hides a row'), see('The new row')] },
        ],
        checks: [
          'Everyone can open a row\'s explainer; only an admin changes anything (a member has no ⚙ or Rearrange).',
          'New amber / red lines colour the day\'s counts at once and change "Under-manned".',
          'A new counter shows a preview count before it is added, then a row at the foot.',
          'A hidden row folds under "Archive" and comes back from there; ↺ Reset counters asks first.',
        ],
        tests: [
          ['manningsheet.test.tsx', 'the explainer; an admin edits the lines'],
          ['counterform.test.tsx', 'build, edit, delete; members cannot'],
          ['counts.test.tsx', 'amber and red; reorder, hide, archive'],
          ['undermanned.test.tsx', 'the days breaking a manning rule'],
          ['settingssheet.test.tsx', '⚙ is admin only'],
        ],
      },
    ],
  },
  {
    n: 11, title: 'The Tracker', who: 'everyone', page: 'tracker', where: 'Tracker — the same for everyone',
    slides: [
      {
        title: 'Find your way',
        steps: [
          { shot: 'trk-1', lines: [c(1, 'Crew: whose marks'), c(2, 'Course'), c(3, 'Syllabus: which chart'), see('A ring slice per student')] },
          { shot: 'trk-2', lines: [see('Students, and their progress')] },
          { shot: 'trk-3', lines: [c(4, 'Show All: filter the events'), see('Done or not, per event')] },
          { shot: 'trk-4', lines: [c(5, 'Find event'), see('The matches, ringed')] },
        ],
        checks: [
          'A member sees exactly the same bar and menus as an admin.',
          'Changing Crew moves the highlighted slice on every ball and the Overall card.',
          'Find event rings the ball in turquoise and scrolls to it; Enter steps to the next match.',
        ],
        tests: [
          ['smoke.mjs', 'the board draws; the bar reads in order'],
          ['smoke.mjs', 'typing a code snaps to that ball'],
          ['smoke.mjs', 'Show All groups by code; says done'],
          ['tracker.test.tsx', 'a member has every control'],
        ],
      },
      {
        title: 'Make a flow chart: the tools',
        steps: [
          { shot: 'chart-1', lines: [c(1, 'Syllabus ✎'), c(2, '+ Add syllabus'), c(3, 'Edit chart layout')] },
          { shot: 'chart-2', lines: [c(4, '+ Acad, + Flight, + Sim…'), c(5, '✋ Move: drag it'), c(6, '→ Connect two events')] },
          { shot: 'chart-3', lines: [c(7, '✎ Text: the poke-ball'), c(8, 'Save'), see('Its prerequisite links')] },
          { shot: 'chart-4', lines: [c(9, '✓ Save changes'), see('The event, renamed')] },
        ],
        checks: [
          'Tools: Move, Select, Connect (prerequisite, then the event), Delete (asks), + events, Text, Line, Edit lines, Arrow, Merge, Fit, Reset layout, Edit events.',
          'The first structure change lights "✓ Save changes ●"; saving clears it and the undo history.',
          'A moved ball saves itself; Delete asks, and says marks go at Save.',
        ],
        tests: [
          ['smoke.mjs', 'a ball drags in edit mode'],
          ['smoke.mjs', 'a new event shows Save changes'],
          ['smoke.mjs', 'the poke-ball editor stays open on Delete?'],
          ['retest.test.tsx', 'a detail typed on one chart stays there'],
        ],
      },
      {
        kind: 'ways', title: 'Edit an event\'s details — three doors',
        ways: [
          { t: 'Its pop-up: ✎ Edit details', shot: 'detail-1', lines: [c(1, 'Hours, name, type, crew'), c(2, 'Save')] },
          { t: 'Show All: its Edit', shot: 'detail-2', lines: [c(1, 'Filter to it'), c(2, 'Save')] },
          { t: 'In the chart editor', shot: 'chart-3', lines: [note('✎ Text: label, colour,'), note('badge, crew, links')] },
        ],
        checks: [
          'A change of hours shows at once in the event\'s pop-up.',
          'Reset to doc refills the boxes but saves nothing until Save.',
          'Hours change only in the details window or Show All — not in the poke-ball editor.',
        ],
        tests: [
          ['smoke.mjs', 'the inline editor has all five fields'],
          ['smoke.mjs', 'Reset to doc fills the boxes'],
          ['retest.test.tsx', 'details belong to one chart'],
        ],
      },
      {
        title: 'Mark progress',
        steps: [
          { shot: 'mark-1', lines: [c(1, 'Tap the event'), c(2, 'DCO, DPCO, Marginal, N.A.'), see('Done on: today')] },
          { shot: 'mark-2', lines: [see('His slice turns black'), see('Progress moves on')] },
          { shot: 'mark-3', lines: [c(3, 'Fails +'), see('Each failure, dated')] },
        ],
        checks: [
          'DCO dates the event today and moves the yellow "available" ring on.',
          'Each Fails + is one failure, drawn as a red tick on the ball and a chip in the Failures card.',
          'Changing Done on after a grade re-dates the mark.',
        ],
        tests: [
          ['smoke.mjs', 'a ball opens the grading pop-up'],
          ['smoke.mjs', 'DCO dates the day it was pressed'],
          ['smoke.mjs', 'every failure is its own chip'],
          ['tracker.test.tsx', 'a grade is one undo step'],
        ],
      },
      {
        kind: 'ways', title: 'Other ways to update',
        ways: [
          { t: 'Another student\'s slice', shot: 'mark-w1', lines: [c(1, 'Tap his slice: he is picked'), see('Crew switches to him')] },
          { t: 'The Failures list', shot: 'mark-w2', lines: [c(1, 'Failures'), c(2, 'Change a failure\'s day')] },
          { t: 'Undo in the top bar', shot: 'mark-w3', lines: [c(1, '↶ one step at a time'), see('↷ puts it back')] },
        ],
        checks: [
          'Tapping another student\'s slice picks him and opens nothing; tapping again opens his pop-up.',
          'The side panel\'s dates (last flown, down days, pace, end dates) save on leaving the box.',
          'Undo covers marks, failures, dates, pace and chart edits; there is no bulk marking.',
        ],
        tests: [
          ['smoke.mjs', 'another crew member\'s wedge picks them'],
          ['smoke.mjs', 'changing a day in the list re-dates it'],
          ['leftovers.test.tsx', 'Undo takes back pace, end date, lull'],
        ],
      },
      {
        kind: 'ways', title: 'What it refuses',
        ways: [
          { t: 'An N.A. cannot have fails', shot: 'refuse-1', lines: [c(1, 'Fails + on an N.A.'), see('Refused, with the reason')] },
          { t: 'A day not yet come', shot: 'refuse-2', lines: [c(1, 'A future Done on'), see('"pick today or earlier"')] },
          { t: 'A loop in the chart', shot: 'refuse-3', lines: [see('"That link would create a loop"'), c(1, 'OK')] },
        ],
        checks: [
          'Also refused: the same link twice, a link to itself, a name already used, a colon in a course name, deleting the last course (no automated test yet — filed).',
          'A future day is refused in Done on, Failed on and both Last Flown boxes.',
          'Switching chart, exporting or signing out with unsaved chart edits asks first.',
        ],
        tests: [
          ['smoke.mjs', 'an N.A. event cannot be failed'],
          ['leftovers.test.tsx', 'a day after today is refused'],
          ['smoke.mjs', 'switching with unsaved edits asks first'],
        ],
      },
      {
        title: 'Students and courses',
        steps: [
          { shot: 'stu-1', lines: [c(1, '+ Add'), c(2, 'Search the roster'), c(3, 'Pick him')] },
          { shot: 'stu-2', lines: [see('He joins, linked'), c(4, '✎ rename'), c(5, '× remove')] },
          { shot: 'stu-3', lines: [c(6, 'Course ✎'), c(7, '+ Add course'), see('Delete course')] },
          { shot: 'stu-4', lines: [c(8, '↺ Restore a deleted course'), c(9, 'Save order')] },
        ],
        checks: [
          'A pick from the roster adds him in capitals with a linked dot; a typed new callsign adds a new crew member.',
          'Rename keeps his marks; × removes him and his marks on that chart.',
          'A new course goes to the top and opens empty; a deleted one comes back with ↺ Restore.',
          'There is no "move to another course": remove and add again (starts clean).',
        ],
        tests: [
          ['smoke.mjs', '+ Add lists the roster; the pick is added'],
          ['smoke.mjs', 'rename keeps the id; remove takes the work'],
          ['smoke.mjs', 'a new course at the top; reorder re-slices'],
          ['retest.test.tsx', 'a deleted course comes back'],
        ],
      },
      {
        title: 'Export and import',
        steps: [
          { shot: 'file-1', lines: [c(1, '⇪ File'), c(2, 'Export…'), see('Import…')] },
          { shot: 'file-2', lines: [c(3, 'Students & courses too?'), c(4, 'All charts'), c(5, 'Export')] },
          { shot: 'file-3', lines: [see('What the file holds')] },
          { shot: 'file-4', lines: [see('Import: replace or add?'), c(6, 'Replace it')] },
        ],
        checks: [
          'Export opens with students unticked every time; ticking them shows the ⚠ warning.',
          'A charts-only file imports without asking about people and changes no marks.',
          'A chart already here asks Skip / Add as new / Replace; a file with people asks once.',
          'A damaged file is refused with a message saying what is wrong.',
        ],
        tests: [
          ['smoke.mjs', 'Export starts with students unticked'],
          ['smoke.mjs', 'charts-only import asks nothing, writes no mark'],
          ['smoke.mjs', 'damaged files refused, with a reason'],
          ['fileFormat.test.ts', 'the file\'s shape'],
        ],
      },
    ],
  },
  {
    n: 12, title: 'Let people in, add a person', who: 'admin', page: 'admin', where: 'Admin → Users',
    slides: [{
      steps: [
        { shot: 'people-1', lines: [c(1, 'Callsign and initials'), c(2, 'Pilot, WSO or personnel'), c(3, 'His sign-in, if he uses the app'), c(4, 'Add person and sign-in')] },
        { shot: 'people-2', lines: [see('On the list, both dots green')] },
        { shot: 'people-3', lines: [c(5, 'Tap a man with no sign-in'), c(6, 'Type his defence mail'), c(7, 'Give sign-in')] },
        { shot: 'people-4', lines: [see('His sign-in dot turns green')] },
      ],
      checks: [
        'Sign-in left blank: the button reads "Add person", no Role box; typing one changes both.',
        'After Add the form clears; he is on People A to Z and has a Quals row.',
        'A row with no sign-in offers Give sign-in · Archive · Delete · Cancel.',
        'The new sign-in works at once; the top right reads "Nova · Member".',
        'Your own row is greyed and cannot be opened. A member has no Admin tab.',
      ],
      tests: [
        ['accounts-newperson.test.tsx', 'add roster-only; Quals "+ Add person" opens it'],
        ['accounts-ui.test.tsx', 'gives a man on the roster his sign-in'],
        ['onedoor-users.test.tsx', 'one row per person, two dots; Post in'],
        ['roster-add.test.ts', 'callsign, initials, seat and CAT checks'],
        ['od-walk.mjs', 'walk: the list, the dots, Give sign-in'],
      ],
    }],
  },
  {
    n: 13, title: 'Post out, archive, delete', who: 'admin', page: 'admin', where: 'Leave War (post out) · Admin → Users',
    slides: [{
      steps: [
        { shot: 'leaving-1', lines: [c(1, 'His day → PO: PO from'), c(2, 'Where he goes'), c(3, 'Post out')] },
        { shot: 'leaving-2', lines: [c(4, 'Admin → Users: tap his row'), c(5, 'Archive')] },
        { shot: 'leaving-3', lines: [c(6, 'Restore: his Post in date'), c(7, 'Restore')] },
        { shot: 'leaving-4', lines: [c(8, 'Delete asks twice'), see('It says what goes')] },
      ],
      checks: [
        'Post out: the sheet opens on the tapped day, Overseas Sqn chosen; nothing happens until the PO date.',
        'Archive is one tap: he moves to "Archived", both dots red, his sign-in says access suspended.',
        'Restore asks the Post in date; his next sign-in shows "Welcome back — check your quals and CAT".',
        'Delete needs two taps and names what goes before the second.',
        'You cannot archive yourself, or the last admin who can sign in.',
      ],
      tests: [
        ['e2e/onedoor.spec.ts', 'archive → away on the war → restore → welcome back'],
        ['onedoor-users.test.tsx', 'archive one tap; restore asks Post in; delete twice'],
        ['po.test.tsx', 'post out from the grid; members see no PO'],
        ['person-delete.test.ts', 'delete keeps flown days, clears days to come'],
        ['accounts-ui.test.tsx', 'suspend / enable; delete says what goes'],
      ],
    }],
  },
  {
    n: 14, title: 'Squadron settings and rules', who: 'admin', page: 'admin', where: 'Admin → Squadron config · Logic',
    slides: [
      {
        steps: [
          { shot: 'settings-1', lines: [c(1, 'Squadron config'), c(2, 'Move a section (Sims up)'), c(3, 'Duty templates…')] },
          { shot: 'settings-2', lines: [see('A template editor')] },
          { shot: 'settings-3', lines: [c(4, 'Logic: find a rule'), c(5, 'Edit rules (then Done)'), c(6, 'Change a setting'), see('What changed')] },
          { shot: 'settings-4', lines: [see('"Rules modified" on the schedule')] },
        ],
        checks: [
          'A member has no Admin tab; Logic is read-only for him, with no Edit rules.',
          'A section nudge renumbers the list; "Reset to standard order" puts it back.',
          'A setting outside its limits is refused and put back, with the limits named.',
          'After a change every week shows "Rules modified" until "Reset to standard".',
        ],
        tests: [
          ['admin.test.tsx', 'template openers; a nudge re-orders'],
          ['logic.test.tsx', 'Edit rules changes the engine; limits refused'],
          ['DutyTplModal.test.tsx', 'a new template, rows, delete'],
          ['WaveTplModal.test.tsx', 'the wave editor; members never see it'],
        ],
      },
      {
        kind: 'ways', title: 'Other doors to the same editors',
        ways: [
          { t: 'A day\'s Templates', shot: 'settings-w2', lines: [c(1, 'Templates'), c(2, '✎ Manage templates')] },
          { t: 'The board\'s + Block', shot: 'settings-w3', lines: [c(1, '+ Block'), c(2, 'The pencil')] },
          { t: 'The board\'s + Wave', shot: 'settings-w4', lines: [c(1, '+ Wave'), c(2, 'The ⚙')] },
        ],
        checks: [
          'Each door opens the same editor as Admin → Squadron config.',
          'A template saved from one door shows at every other.',
        ],
        tests: [
          ['daytplui.test.tsx', 'both entry points open one picker'],
          ['board.test.tsx', '+ Block offers the duty templates'],
          ['wavepicker.test.tsx', 'the pencil opens the editor'],
        ],
      },
    ],
  },
  {
    n: 15, title: 'Print, export and data', who: 'admin', page: 'admin', where: 'Edit Schedule · Inputs · Admin → Data',
    slides: [{
      steps: [
        { shot: 'export-1', lines: [c(1, 'Export to Excel'), c(2, 'Export as PDF')] },
        { shot: 'export-2', lines: [see('The printable report')] },
        { shot: 'export-3', lines: [c(3, 'Inputs: Export to Excel')] },
        { shot: 'export-4', lines: [c(4, 'Admin → Data'), see('Clear old data (asks twice)')] },
      ],
      checks: [
        'The schedule\'s CSV is 142-schedule.csv; a published day exports its issued version.',
        'The PDF report is one block per day, marked RESTRICTED, each day stamped signed or working.',
        'A member has no schedule export, but has Export to Excel on Inputs and Quals.',
        'Admin → Data\'s Clear buttons stay grey until a date is picked; the first tap only counts.',
      ],
      tests: [
        ['export.test.ts', 'CSV encoding; both span ends'],
        ['export-published.test.ts', 'a published day exports as issued'],
        ['printpdf.test.ts', 'the report stands alone, by day'],
        ['wipe.test.tsx', 'clearing takes clutter only; undoable'],
      ],
    }],
  },
  {
    n: 16, title: 'Undo, redo and the change history', who: 'everyone', page: 'topbar', where: 'The top bar, every page',
    slides: [{
      steps: [
        { shot: 'hist-1', lines: [c(1, 'Undo'), c(2, 'Redo'), see('The change, taken back or put back')] },
        { shot: 'hist-2', lines: [c(3, 'The clock: the change history'), c(4, 'All changes'), c(5, 'Group by Who')] },
        { shot: 'hist-3', lines: [c(6, 'Tap a change: go to it'), note('The window stays open')] },
      ],
      checks: [
        'Undo is grey until there is something to undo; it takes back only your own changes.',
        'The history window is movable; gold dots mark every detail with a history.',
        '"New to you" holds others\' changes until "Mark all as seen"; your own are never new.',
        'The undo list empties at sign-in and sign-out.',
      ],
      tests: [
        ['e2e/changeswin.spec.ts', 'the window, gold dots, Group by Item'],
        ['histlist.test.tsx', 'the ways in; a click jumps'],
        ['undo-wire.test.ts', 'undo and redo are wired'],
        ['session-undo.test.ts', 'undo is per sign-in'],
        ['topbar-pair.test.tsx', 'where the pair shows'],
      ],
    }],
  },
  {
    n: 17, title: 'What happens by itself', who: 'everyone', page: 'topbar', where: 'Everywhere — nobody touches it',
    slides: [
      {
        kind: 'ripple', title: 'One leave filed — where it shows',
        action: { shot: 'r1-act', lines: [c(1, 'A member picks the day'), c(2, 'LL'), c(3, 'Add input')] },
        places: [
          { shot: 'r1-unav', page: 'Schedule', t: 'the day\'s Unavailable block' },
          { shot: 'r1-warn', page: 'Issues', t: '"On leave + flying" for each seat he held' },
          { shot: 'r1-lw', page: 'Leave War', t: 'LL, approved, with the blue "from Inputs" edge' },
          { shot: 'r1-palette', page: 'Crew list', t: 'struck through, the reason on hover' },
          { shot: 'r1-chip', page: 'Admin', t: '"1 new" on the day; the clock counts it' },
          { shot: 'r1-pending', page: 'A published day', t: '"1 pending", the sign-offs fall' },
        ],
        checks: [
          'Nothing needs a refresh: the schedule, Inputs calendar and Leave War show it at once.',
          'The Leave War\'s manning counts for that day drop by one.',
          'On a published day members still see the issued version until the next AL.',
          'The bell does not light for inputs; the day\'s chip and the clock are the notice.',
        ],
        tests: [
          ['sync.test.ts', 'Inputs-filed LL shows on the war'],
          ['avail.test.ts', 'leave and downchit close the day'],
          ['latepub.test.tsx', 'filed after publishing: 1 pending'],
          ['changes.test.ts', 'someone else\'s change is new to you'],
        ],
      },
      {
        kind: 'ripple', title: 'An activity, and a downchit',
        action: { shot: 'inputs-2', lines: [note('A Meeting with times, or a'), note('medical (ATT C), on Inputs')] },
        places: [
          { shot: 'r2-ground', page: 'Schedule', t: 'a Meeting lands on the Ground Programme' },
          { shot: 'r3-med', page: 'Medical', t: 'the downchit leads the tracker' },
          { shot: 'r3-lw', page: 'Leave War', t: 'the downchit shows on his day' },
        ],
        checks: [
          'An activity with times lands as a Ground Programme row on the week, the board and View-only.',
          'An activity never reaches the Leave War; a downchit does.',
          'A downchit never wears LATE; each seat he holds raises "Downchit + flying".',
          'A weekend Duty asks the OIL question before it is saved.',
        ],
        tests: [
          ['inputground.test.ts', 'an activity lands on its day'],
          ['medicalview.test.tsx', 'the Medical count is live'],
          ['sync.test.ts', 'a spanned ATT C shows on the war'],
          ['lateinput.test.ts', 'downchits are never LATE'],
        ],
      },
      {
        kind: 'ripple', title: 'The Leave War and Inputs, both ways',
        action: { shot: 'run-2', lines: [c(3, 'The admin approves a bid')] },
        places: [
          { shot: 'r5-lw', page: 'Leave War', t: 'the bid turns green' },
          { shot: 'r5-inputs', page: 'Inputs', t: 'his leave input appears at once' },
          { shot: 'r1-lw', page: 'The other way', t: 'a leave filed on Inputs shows on the war' },
        ],
        checks: [
          'A bid alone never reaches Inputs; Approve does, before the war is published (D418).',
          'Publishing the war changes no input.',
          'A weekend Duty credited FO reaches the war only when that day is published.',
        ],
        tests: [
          ['sync.test.ts', 'a 3-day LL run becomes one input'],
          ['sync.test.ts', 'refusing a mid-span day splits it'],
          ['oilsync.test.ts', 'publishing the Saturday lands FO'],
        ],
      },
      {
        kind: 'ripple', title: 'A name changed on Quals',
        action: { shot: 'quals-1', lines: [note('An admin renames a callsign'), note('on Quals (Enable editing)')] },
        places: [
          { shot: 'r6-sched', page: 'Schedule', t: 'every puck of his, renamed' },
          { shot: 'r6-lw', page: 'Leave War', t: 'his row\'s name' },
          { shot: 'r6-admin', page: 'Admin → Users', t: 'his row, same person' },
        ],
        checks: [
          'The stored person never changes — only his label — so nothing is lost or duplicated.',
          'A lapsed qualification ticked off on Quals warns on the week at once, with a Q mark.',
          'Archiving a man posts him out of the war from that day and keeps his flown pucks.',
        ],
        tests: [
          ['personid.test.ts', 'a rename moves nothing'],
          ['latepub.test.tsx', 'a lapsed AAR warns at once'],
          ['onedoor.test.ts', 'archiving keeps every puck'],
        ],
      },
    ],
  },
]

/* The two work flows (D411, D413, as the app really behaves — D418): who does what, in order. `j` names the journeys
   a stage belongs to (its slide number is worked out); `links` join stages, a third element marking the dashed loop. */
export const FLOWS = [
  {
    title: 'The work flow — the life of a day',
    sub: 'Who does what, in the order it happens. Under each stage: the slide that shows it.',
    lanes: ['Everyone', 'Admin — the scheduler'],
    stages: [
      { lane: 0, col: 0, t: 'File inputs and leave bids', j: [7, 9], shot: 'inputs-2' },
      { lane: 1, col: 1, t: 'Build the day from who is free', j: [2], shot: 'puck-a' },
      { lane: 1, col: 2, t: 'Try an alternate plan', j: [5], shot: 'plans-1' },
      { lane: 1, col: 3, t: 'Sign off and publish — ORIG', j: [3], shot: 'publish-2' },
      { lane: 0, col: 4, t: 'Everyone reads the issued day', j: [6], shot: 'publish-4' },
      { lane: 0, col: 5, t: 'Something changes: a late input', j: [7, 17], shot: 'r1-unav' },
      { lane: 1, col: 6, t: 'Amend: sign again, publish AL1', j: [4], shot: 'amend-4' },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4, 'AL1 goes out']],
    foot: ref => `Alongside the day: Quals (slide ${ref(8)}), the Tracker (${ref(11)}), Admin (${ref(12)} on); what spreads by itself (${ref(17)}).`,
  },
  {
    title: 'The work flow — the Leave War',
    sub: 'A leave period from start to finish, as the app runs it. Under each stage: the slide that shows it.',
    lanes: ['Everyone', 'Admin'],
    stages: [
      { lane: 1, col: 0, t: 'Create the period (starts in Draft)', j: [10], shot: 'run-w3' },
      { lane: 1, col: 1, t: 'Open it for bidding', j: [10], shot: 'lwflow-open' },
      { lane: 0, col: 2, t: 'Members bid on their own row', j: [9], shot: 'bid-3' },
      { lane: 1, col: 3, t: 'Close it; approve — leave reaches Inputs', j: [10, 17], shot: 'run-2' },
      { lane: 1, col: 4, t: 'Publish: locked for members', j: [10], shot: 'run-4' },
      { lane: 0, col: 5, t: 'Members add their remarks', j: [9], shot: 'lwflow-remarks' },
      { lane: 0, col: 6, t: 'A change later: through Inputs', j: [7, 17], shot: 'inputs-1' },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    foot: () => 'The admin can decide bids in any stage but Draft, and can still add leave directly on the war; an approved leave on a published war is changed by stepping back to Bidding closed or on Inputs (D418).',
  },
]
