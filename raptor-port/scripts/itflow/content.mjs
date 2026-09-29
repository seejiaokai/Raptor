/* The IT flow guide's WORDS ([IT-FLOW-GUIDE], D410–D414) — every slide's text, and which picture it uses; deck.mjs
   only lays them out. Plain and few, the app's own names, no rules-engine arithmetic (his ask). Each journey is
   one or more slides: kind 'steps' (pictures in order, arrows between) or 'ways' (several ways to the same end,
   side by side — D412). In a caption line, {n} is the orange click mark of that number, {see: true} the green
   "what you should see" ring. A test is [file, what it proves]; every file named was read to confirm it covers
   the journey — when a test is renamed or a screen changes, fix the entry here and re-shoot (README). */

export const PAGES = [
  ['editsched', 'Edit Schedule'], ['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['quals', 'Quals'],
  ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['admin', 'Admin · Logic'],
]

export const JOURNEYS = [
  {
    n: 1, title: 'Sign in, or ask for access', who: 'everyone', page: 'signin',
    slides: [{
      kind: 'steps', where: 'The sign-in card → Admin → Users',
      steps: [
        { shot: 'signin-1', lines: [{ n: 1, t: 'Type the defence mail' }, { n: 2, t: 'Type a password' }, { n: 3, t: 'Sign in' }] },
        { shot: 'signin-2', lines: [{ n: 4, t: 'Not on the list: your name' }, { n: 5, t: 'Pilot, WSO or personnel' }, { n: 6, t: 'Request access' }] },
        { shot: 'signin-3', lines: [{ see: true, t: '"Your request is with the admins"' }] },
        { shot: 'signin-4', lines: [{ n: 7, t: 'Admin shows 1 waiting' }, { n: 8, t: 'Give access (or Refuse)' }] },
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
  { n: 2, title: 'Make a schedule', who: 'admin', page: 'editsched' },
  {
    n: 3, title: 'Publish a day', who: 'admin', page: 'editsched',
    slides: [{
      kind: 'steps', where: 'Edit Schedule',
      steps: [
        { shot: 'publish-1', lines: [{ n: 1, t: 'Open Edit Schedule' }, { n: 2, t: 'Pick the week' }] },
        { shot: 'publish-2', lines: [{ n: 3, t: 'Pick the four sign-off names' }, { n: 4, t: 'Press Publish day' }] },
        { shot: 'publish-3', lines: [{ see: true, t: 'The day wears ORIG' }, { see: true, t: 'Unpublish appears' }] },
        { shot: 'publish-4', lines: [{ see: true, t: 'View-only Sched shows ORIG' }, { see: true, t: '"Original — as issued"' }] },
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
  { n: 4, title: 'Amend a published day', who: 'admin', page: 'editsched' },
  { n: 5, title: 'Alternate plans', who: 'admin', page: 'editsched' },
  { n: 6, title: 'Read the schedule, desktop and phone', who: 'everyone', page: 'viewsched' },
  { n: 7, title: 'File an input or a medical', who: 'everyone', page: 'inputs' },
  { n: 8, title: 'Update quals', who: 'everyone', page: 'quals' },
  { n: 9, title: 'Bid for leave', who: 'everyone', page: 'leavewar' },
  { n: 10, title: 'Run the Leave War', who: 'admin', page: 'leavewar' },
  { n: 11, title: 'The Tracker', who: 'everyone', page: 'tracker' },
  {
    n: 12, title: 'Let people in, add a person', who: 'admin', page: 'admin',
    slides: [{
      kind: 'steps', where: 'Admin → Users',
      steps: [
        { shot: 'people-1', lines: [{ n: 1, t: 'Callsign and initials' }, { n: 2, t: 'Pilot, WSO or personnel' }, { n: 3, t: 'His sign-in, if he uses the app' }, { n: 4, t: 'Add person and sign-in' }] },
        { shot: 'people-2', lines: [{ see: true, t: 'On the list, both dots green' }] },
        { shot: 'people-3', lines: [{ n: 5, t: 'Tap a man with no sign-in' }, { n: 6, t: 'Type his defence mail' }, { n: 7, t: 'Give sign-in' }] },
        { shot: 'people-4', lines: [{ see: true, t: 'His sign-in dot turns green' }] },
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
    n: 13, title: 'Post out, archive, delete', who: 'admin', page: 'admin',
    slides: [{
      kind: 'steps', where: 'Leave War (post out) · Admin → Users',
      steps: [
        { shot: 'leaving-1', lines: [{ n: 1, t: 'Leave War: his day → PO' }, { n: 2, t: 'Where he goes' }, { n: 3, t: 'Post out' }] },
        { shot: 'leaving-2', lines: [{ n: 4, t: 'Admin → Users: tap his row' }, { n: 5, t: 'Archive' }] },
        { shot: 'leaving-3', lines: [{ n: 6, t: 'Restore: his Post in date' }, { n: 7, t: 'Restore' }] },
        { shot: 'leaving-4', lines: [{ n: 8, t: 'Delete asks twice' }, { see: true, t: 'It says what goes' }] },
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
  { n: 14, title: 'Squadron settings and rules', who: 'admin', page: 'admin' },
  { n: 15, title: 'Print, export and data', who: 'admin', page: 'admin' },
  { n: 16, title: 'Undo, redo and the change history', who: 'everyone', page: 'topbar' },
]

/* The two work flows (D411, D413): who does what, in order. `j` names the journeys a stage belongs to (its slide
   number is worked out); `links` join stages, a third element marking the dashed way back round. */
export const FLOWS = [
  {
    title: 'The work flow — the life of a day',
    sub: 'Who does what, in the order it happens. Under each stage: the slide that shows it.',
    lanes: ['Everyone', 'Admin — the scheduler'],
    stages: [
      { lane: 0, col: 0, t: 'File inputs and leave bids', j: [7, 9], shot: 'flow-inputs' },
      { lane: 1, col: 1, t: 'Build the day from who is free', j: [2], shot: 'flow-build' },
      { lane: 1, col: 2, t: 'Try an alternate plan', j: [5], shot: 'flow-plans' },
      { lane: 1, col: 3, t: 'Sign off and publish — ORIG', j: [3], shot: 'publish-2' },
      { lane: 0, col: 4, t: 'Everyone reads the issued day', j: [6], shot: 'publish-4' },
      { lane: 0, col: 5, t: 'Something changes: a late input', j: [7], shot: 'flow-late' },
      { lane: 1, col: 6, t: 'Amend: sign again, publish AL1', j: [4], shot: 'flow-amend' },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4, 'AL1 goes out']],
    foot: ref => `Alongside the day: Quals (slide ${ref(8)}), the Tracker (${ref(11)}), Admin (${ref(12)} on).`,
  },
  {
    title: 'The work flow — the Leave War',
    sub: 'A leave period from start to finish. Under each stage: the slide that shows it.',
    lanes: ['Everyone', 'Admin'],
    stages: [
      { lane: 1, col: 0, t: 'Create the period', j: [10], shot: 'lwflow-new' },
      { lane: 1, col: 1, t: 'Open it for bidding', j: [10], shot: 'lwflow-open' },
      { lane: 0, col: 2, t: 'Members bid', j: [9], shot: 'lwflow-bid' },
      { lane: 1, col: 3, t: 'Close it and decide the bids', j: [10], shot: 'lwflow-decide' },
      { lane: 1, col: 4, t: 'Publish', j: [10], shot: 'lwflow-publish' },
      { lane: 0, col: 5, t: 'Members add their remarks', j: [9], shot: 'lwflow-remarks' },
      { lane: 0, col: 6, t: 'A change: through Inputs', j: [7], shot: 'lwflow-input' },
    ],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    foot: () => 'After publishing, a member changes his leave through Inputs; the admin may also edit on the war directly, where he sees everyone.',
  },
]
