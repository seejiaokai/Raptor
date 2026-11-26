// words-r6-nav.mjs - every word the jump-navigation drawings of Admin → Users put on screen that round 6's did not
// (chat 188, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-users-nav-brief.md). Drafted by the drawer (a fresh
// Fable); a SECOND fresh Fable reviews them before he sees them (his D2441) - the host then edits THIS file and
// draw-r6-nav.mjs is re-run, so no drawing carries a word of its own. Everything else on the pictures comes from
// ./words-r6-users.mjs (W6) and ./words.mjs (W), unchanged.
import { W6 } from './words-r6-users.mjs'
export const WN = {
  // ---- the jumps: one per group on the page, each the group's own heading word, its count after it
  jumpPeople: 'People',                        // the heading "People · 60"
  jumpOutgoing: 'Outgoing',                    // the heading "Outgoing · 1"
  jumpIncoming: 'Incoming',                    // the heading "Incoming · 1"
  jumpOther: 'From other squadrons',           // the heading, whole - the desktop's left column has the room
  jumpOtherShort: 'Others',                    // the phone's jump button only: four jumps share 328px, the heading's own words do not fit
  // ---- a heading that folds: the app's own fold marks ("▸ Archived"), before the heading's own words
  open: t => `▾ ${t}`,
  closed: t => `▸ ${t}`,
  // ---- a fold opened by the search: the fold's own words with the open mark
  opened: t => t.replace('▸', '▾'),
  // ---- drawn people the round-6 world does not hold (142's page): the row words are W6's, only who they are is new
  kestrelHolds: n => W6.alsoViews(n),          // round 6's own words, read from its file so the two can never differ (the words' second fresh Fable, 26 Nov)
  // ---- for a screen reader only (never drawn): the name of the list of jumps
  navName: 'On this page',
}
