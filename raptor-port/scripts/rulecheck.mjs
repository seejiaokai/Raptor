#!/usr/bin/env node
/* RULE CHECK — every behaviour the owner ruled must be NAMED by a test.
 *
 * Why this exists ([S4-BUGHUNT], 20 Sep 26): a bug survived two full
 * cross-provider code inspections and 5103 green tests, because it was not a
 * coding mistake. The build had taken one ruling and used it for a job that
 * ruling never claimed, and a LATER ruling on the same day covered that job.
 * Every test passed, because no test named either ruling — so when the rules
 * drifted apart, nothing went red.
 *
 * This is the cheap mechanical guard. It does not check that a rule is
 * IMPLEMENTED correctly — no script can. It checks that at least one test
 * mentions each rule by its id, so that a rule which changes has something
 * pointing at it, and so that a rule nobody has ever written a test for is
 * visible instead of silent.
 *
 * The baseline below is the set of rules that had no test naming them on the
 * day this was written. The check FAILS when that set grows — a new unnamed
 * rule — and tells you to shrink the baseline when it shrinks. It never
 * rewrites itself; removing a name from the baseline is a deliberate edit.
 *
 * Run: node scripts/rulecheck.mjs        (part of the gate suite)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/* Every ruling id in the rules of record, with the plain-words reminder that
   goes in the failure message. Keep in step with
   docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md. */
const RULES = {
  B1: 'several records on one person/day',
  B2: 'courses and overseas duty show on the war',
  B3: 'different parts of the day sit side by side, not a clash',
  B4: 'a worked day beside an absence earns OIL when the times miss',
  B5: 'publishing is a door; undo of the publish brings the bid back',
  B6: 'the replaced-bid notice, until "OK, seen"',
  B7: 'the same rules at every door, including redo',
  B8: 'a hand-typed credit with times; none means the whole day',
  B9: 'the main-code ladder',
  H1: 'which inputs replace an undecided bid',
  H2: 'a medical cuts leave in half-day steps',
  H3: 'overlap judged on real times (owner overrule)',
  H4: 'the 15-day run: pilots, LL/OL only',
  H5: 'filing leave for a posted-out person',
  H6: 'overnight tails; leave over part of a medical refused whole',
  Q1: 'two half-day leaves both come off their own balances',
  Q2: 'a member may bid each half separately',
  Q6: 'a medical on a worked day keeps both and goes amber',
  Q7: 'a hand-typed credit with no times is whole-day work',
  Q8: 'leave is allowed during a course or overseas duty',
  Q9: 'leave before posting-in and after posting-out',
  Q11: 'moving a bid into the next war is refused',
  Q12: 'leave on a "no leave" day is a warning only',
  Q13: 'the 15-day rule is LL/OL only',
  Q14: 'a member may file leave any date, already approved',
  Q15: 'a SANS offer is never work',
  /* The 20–21 Sep rulings. N13 and N16 are a pair and the second only makes
     sense beside the first: an award is not attendance, and an award and a
     worked day add up. They are the ones a later change is most likely to
     undo by accident, because every instinct in the old code says a day has
     one credit and a credit means the man was at work. */
  N13: 'an OIL award owes a man a day; it does not say he was at work',
  N16: 'an award and a worked day ADD UP, and never affect each other',
  N17: 'the manning counts bodies; only a planned absence takes one away',
  /* [OIL-AUTO-REMOVE] + [ALL-AVAIL-REDEF], 21 Sep 26. Register:
     docs/superpowers/specs/2026-09-21-oil-behaviour-register.md, which also
     carries the two CLASHES this build found (OIL35, OIL36) and how each was
     resolved. OIL30 and up are earlier rulings the build had to keep. */
  OIL1: 'one OIL Earn button at the top of the day, weekends and holidays only',
  OIL2: 'every man who earns wears a glowing green puck; tap it off, tap it back',
  OIL3: 'a tap takes him off THAT event; his others keep counting',
  OIL4: 'the figure is first start to last end, gaps included, on what is left',
  OIL5: 'every puck shows its own figure live, where the qual letter sits',
  OIL6: 'a full day and a half day look different',
  OIL7: 'tapping an item name stops the whole item earning, later additions too',
  OIL8: 'a sentinel opens into real pucks inside the mode',
  OIL9: 'the day blanket is a FACT about the day and MASKS the marks beneath it',
  OIL10: 'the member answers first; the admin overrules; his answer is never overwritten',
  OIL11: 'all OIL waits for publication — the schedule and a claim alike',
  OIL12: 'overseas duty shows under Unavailable as OD, and the mode reaches it',
  OIL13: 'an input taken off the programme earns nothing, whatever he answered',
  OIL14: 'ALL AVAIL: no ground crew, SANS in when with us, ATT B in, a clash out',
  OIL15: 'ALL and ALL AVAIL stay identical — one behaviour, two names',
  OIL16: 'a mark on a published day goes out as an amendment',
  OIL17: 'the marked state is NEUTRAL, never amber or red',
  OIL18: 'every one of these controls only where a day can earn',
  OIL19: 'the info-only wording says it earns no OIL',
  OIL20: 'a green bar down the left edge: full height a full day, bottom half a half',
  OIL21: 'the bar is the MAN’S DAY, shown only on the events that COUNTED (O-1)',
  OIL21a: 'it reaches every seat the schedule draws, on the board AND the week',
  OIL21b: 'it stays visible on a puck already wearing a warning chip',
  OIL22: 'the NO OIL marking is retired entirely',
  OIL23: 'a sentinel wears the bar only when the people behind it agree',
  OIL24: 'the published schedule IS the truth — full freeze, unpublish to correct',
  OIL25: 'a decision is addressed by what survives a member edit',
  OIL26: 'the change ships behind the existing development reset, at its real scope',
  OIL27: 'an OIL-only edit is publishable, as ONE amendment item',
  OIL28: 'an allow counts real work; it never invents it',
  OIL29: 'derived on the live copy, frozen only on the issued one',
  /* THE AMENDMENT SYSTEM — docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md
     ([HUMAN-RETEST], 24 Sep 26). Its LIVE and PARTLY BUILT lines; AM38 (D148, not built),
     AM43 ([PUB-UNAVAIL], not built) and AM52 (EOD, deferred) are left out until they exist. */
  AM1: 'each day publishes and numbers on its own track — never the week',
  AM2: 'a day is a stack of frozen issued versions under one working copy',
  AM3: 'every issued version has its own identity tied to its date and year',
  AM4: 'an issued version is never edited in place and never erased',
  AM5: 'viewers see the issued version; the working copy is labelled when they look',
  AM6: 'an older version comes back only by loading it and publishing the NEXT amendment; the load puts back what it had filed too (D98)',
  AM7: 'no publish-all-days, no two-person approval, no rule versioning',
  AM8: 'first publish is "Publish day": the Original carries no amendment marks',
  AM9: 'after that, "Publish AL<n>" for that day only, only when it really differs',
  AM10: 'all four sign every publish, bound to the content they signed',
  AM11: 'a content change wipes the sign-offs; putting it back restores them',
  AM12: 'each plan carries its own sign-offs',
  AM13: 'any change that shows as pending on a published day wipes the sign-offs (D103, replacing D45\'s signature half)',
  AM14: 'a filing-only change must be signed for too (PSF-001)',
  AM15: 'the sign-off line says what publishing will do; no button with nothing to publish',
  AM15b: '"All signed — no changes to publish right now"',
  AM16: 'only appointed schedulers sign three roles; a signed name stays offered',
  AM17: 'only the scheduler publishes, signs, unpublishes, loads or switches plans',
  AM18: 'amendment marks are a published-day thing — a draft day shows none',
  AM19: 'a changed puck: a solid ALn tag once out, a hollow dotted one while waiting, never a ring; cells keep their marks (D92, D93)',
  AM20: 'a pending mark means "differs from what was issued", not "was touched"',
  AM21: 'a removal and a reorder on a published day are real amendment items',
  AM21b: 'wave drag / MAIN-SPARE flip / accepted input ride an AL; section drag does not',
  AM22: 'the version tag: ORIG the seal (D111), ALn coloured by number, DRAFT dashed, left of the count',
  AM23: 'every count of a day\'s unpublished changes reads one body; a man moved is one (D109)',
  AM24: '"Not yet signed" / "Not yet published" on every working copy of a changed published day, never the issued face (D97)',
  AM25: 'the Amendments panel: per-day publish with the kinds, the issued list with approvers',
  AM26: 'a day holds alternative plans before AND after it is published',
  AM27: 'bringing out a saved plan is plain editing — no review screen',
  AM28: 'the plans selector (locked design)',
  AM29: 'plans lettered and renamable; deleting down to one clears them',
  AM30: 'a stored plan being looked at never wears the issued clothes',
  AM31: 'the view page: look at plans on a draft day; issued or working once published',
  AM32: 'undo of a published day = Unpublish, a standing button',
  AM33: 'unpublish = correct quietly, reissue the SAME label',
  AM34: 'unpublish: scheduler only, clears the sign-offs, latest version only',
  AM35: 'the label is reused, nothing is erased; silent until a database saw it',
  AM36: 'the only boundary is the shared database — never an export or a logout',
  AM37: 'unpublishing a day whose OIL is already spent warns first',
  AM37b: 'correcting an issued day costs no amendment number',
  AM37c: 'unpublishing an AL re-opens its changes; the Original makes a plain draft',
  AM39: 'publishing is its own undo step; an undo there runs Unpublish',
  AM39b: 'one undo that takes you there; a bubble says what it did; a clash is refused',
  AM39c: 'undo cannot reach behind a later publish of that day',
  AM39d: 'roster and settings edits are undoable and never amendments',
  AM40: 'nothing on a published schedule changes without the scheduler acknowledging it',
  AM41: 'a request filed live on a published day lands on the working copy as pending',
  AM42: 'who stood behind ALL / ALL AVAIL is frozen at publication (D44)',
  AM43b: 'an input not yet landed still counts for its warnings',
  AM44: 'an issued day keeps what it went out with when a rule changes under it (D48)',
  AM45: 'an issued weekend with a placeholder may read pending — leave it (D54)',
  AM46: 'a day\'s OIL comes from its latest published version (D142)',
  AM47: 'only the issued schedule earns, both directions (D2)',
  AM48: 'each day\'s OIL from that day alone; an unreadable week keeps its credits',
  AM48a: 'who earned is decided at publication and frozen',
  AM48b: 'ALL OIL waits for publication',
  AM48c: 'publishing a weekend keeps a clashing undecided bid and flags the day',
  AM48d: 'a weekend that earns nobody, or has no Leave War period, says so',
  AM49: 'History: who changed what, when, from what — this session only',
  AM49b: 'the board\'s sign-off reads like the week\'s; on a phone sign-off, checks, panels',
  AM49c: '"Clear old clutter" deletes no saved week',
  AM50: 'export is the scheduler\'s snapshot of the PUBLISHED schedule',
  AM51: 'a published day shows its warnings again',
  AM51b: 'the view page shows the warnings of the face it shows',
  AM51c: 'a published day shows everything a draft shows; an old version or plan preview none',
  AM51d: 'a draft day breaking a published neighbour flags on both views',
  AM51e: 'the issued face is the same for admin and member; the working peek is open to all',
  AM51f: 'divergence is anchored on the calendar date, no clock, no EOD coupling',
  AM51g: 'no tally on the publish button, no publish-or-discard reminder',
  /* the amendment batch (25 Sep 26, D112): the register's new lines, each named by a test */
  AM53: '"N pending" opens the list of what will go out; a tap takes the view there (D99, D100)',
  AM54: 'who made a change is the shared account until the database (D104)',
  AM55: 'the change bubble stays, hover or tap; a long one scrolls inside itself (D105)',
  AM56: 'a jump from Edit history or the pending list stays on the page you are on (D107)',
  AM57: 'the Signed line names who signed the version on screen, the Original included (D95, D102)',
  AM58: 'a day template is refused on a published day, with the reason at every door (D96)',
  AM59: 'the board draws the dashed and dotted warning rings as the week does (D94)',
}

/* Rules with no test naming them on 20 Sep 26. The check fails if this set
   GROWS. Shrink it as the [S4-BUGHUNT] scenarios land their named tests. */
/* OIL19 (the info-only wording) and OIL26 (the storage reset, which its own boot
   tests exercise by version rather than by name) are the two OIL rulings no test
   names yet — both are wording/version facts checked by eye in the live-view
   pass, and they are listed here so they stay visible rather than silent. */
/* The AMENDMENT rules below had no test that pins them WHOLE on 24 Sep 26 (the re-test's mapping, in the
   register's §Coverage): most are pinned in PART, AM7 and AM44 by nothing. Named-by-nothing is the honest
   state, so they are baselined here to stay visible; shrink the list as each gains a whole-rule test. */
const BASELINE = new Set(['Q9', 'Q11', 'Q12', 'Q14', 'Q15', 'OIL19', 'OIL26',
  'AM7', 'AM8', 'AM15', 'AM17', 'AM25', 'AM26', 'AM27', 'AM30', 'AM36', 'AM37', 'AM39', 'AM39d', 'AM44', 'AM45', 'AM48', 'AM48a', 'AM49', 'AM49b', 'AM50', 'AM51b', 'AM51c', 'AM51d', 'AM51e', 'AM51f', 'AM51g',
  /* AM55: a long bubble scrolling is layout, which the test browser does not have: the walk proves it (25 Sep 26) */
  'AM55'])

const TEST_DIRS = [join(ROOT, 'src'), join(ROOT, 'e2e')]
const isTest = (f) => /\.(test|spec)\.(ts|tsx)$/.test(f)

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.')) continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (isTest(e)) out.push(p)
  }
  return out
}

const files = TEST_DIRS.flatMap((d) => walk(d))
/* no test files at all means the script was run from the wrong place, not
   that every rule lost its test — say so rather than raising 26 alarms */
if (!files.length) {
  console.error(`FAIL — no test files found under ${TEST_DIRS.join(' or ')}.`)
  console.error('Run this from the repo (npm run rulecheck), not from a copy.')
  process.exit(2)
}
const haystack = files.map((f) => readFileSync(f, 'utf8')).join('\n')

const unnamed = Object.keys(RULES).filter((id) => !new RegExp(`\\b${id}\\b`).test(haystack))

const added = unnamed.filter((id) => !BASELINE.has(id))
const cleared = [...BASELINE].filter((id) => !unnamed.includes(id))

console.log(`rulecheck: ${files.length} test files, ${Object.keys(RULES).length} rulings`)
console.log(`  named by a test : ${Object.keys(RULES).length - unnamed.length}`)
console.log(`  named by nothing: ${unnamed.length}${unnamed.length ? ` (${unnamed.join(', ')})` : ''}`)

if (cleared.length) {
  console.log(`\n  ${cleared.length} now covered — remove from BASELINE in this file: ${cleared.join(', ')}`)
}

if (added.length) {
  console.error(`\nFAIL — ${added.length} ruling(s) no test names, and not in the baseline:\n`)
  for (const id of added) console.error(`  ${id} — ${RULES[id]}`)
  console.error(`\nName the rule in a test ("... (${added[0]})"), or add it to BASELINE with a reason.`)
  process.exit(1)
}

console.log('\nrulecheck OK')
