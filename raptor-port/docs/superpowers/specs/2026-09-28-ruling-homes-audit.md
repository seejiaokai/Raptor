# The ruling-homes audit — does each ruling's named home carry it? (28 Sep 26)

`[RULING-HOMES-AUDIT]`, on `claude/docs-tidy-subheads-audit-ec8f87`. Documents only. The question for each
ruling: does the document its row names under "Where it lives now" actually carry it — by CONTENT, read, not
assumed — and does it say the number, so the next check is a search rather than a read?

**Scope.** The item named 24 rows (found 24 Sep 26: D1–D3, D5–D13, D15, D28, D31, D32, D39, D43, D51, D52, D53,
D58, D63, D64). A scripted pass over all 264 live rows on 28 Sep 26 then listed every row with a DURABLE Markdown
home (a reference doc, a rules file, a register, the project guide) that never mentions its number; the backlog,
HANDOFF blocks, archives and one-task records do not count as homes (D29 rule 2: never the backlog alone). That
added ten newer rows (D21, D36, D59, D135, D145, D169, D304, D325, D328, D338). Each was then checked by hand.

## What was found and done

| Ruling | Home checked | Content there? | Done |
|---|---|---|---|
| D1 | `ui-contracts.md` §The green edge | yes (O-1) | number added |
| D2 | `engine-rules.md` "ONLY THE ISSUED SCHEDULE PAYS" | yes (R-1) | number added |
| D3 | `engine-rules.md`, the two R-2 bullets | yes | number added to both |
| D5 | `bug-check-order.md` §0 | yes | number added |
| D6 | `bug-check-order.md` §4 rank 1 | yes | number added |
| D7 | `bug-check-order.md` §3 and §5 | yes | number added at §5's opening |
| D8 | `bug-check-order.md`, its head | yes | number added |
| D9 | `bug-check-order.md` §0a; `.claude/rules/bug-check.md` | yes, both | number added to both |
| D10 | `bug-check-order.md`, its head and §0a | yes | number added to both places |
| D11 | `bug-check-order.md` §4a; `.claude/rules/bug-check.md` | yes, both | number added to both |
| D12 | `bug-check-order.md` §2a | yes | number added |
| D13 | `.claude/rules/record-decisions.md` §The lapse | yes | number added |
| D15 | the OIL register, OIL31 | yes | number added |
| D28, D31, D32, D43 | the OIL-seats register | yes — it has a row for each; the rulings rows named only the archived backlog item | each row's home cell now names the register |
| D39 | `ui-contracts.md` §[ALL-AVAIL-WINDOW] (D38–D41 at its head) | yes | the row's home cell names it (it was only an "on build:" path) |
| D51 | the same section, pilots left / WSOs right | yes | number added; home cell names it |
| D52 | the OIL-seats register | **no** | **a row written into the register** |
| D53 | `.claude/rules/record-decisions.md` §Read it before you ask him anything | yes | number added |
| D58, D63 | `raptor-port/CLAUDE.md` | **no** — the files named are where the wording was changed; the RULE (no unit designation) was stated in no project document, only in its rulings row and a memory note | **written into `raptor-port/CLAUDE.md` §Product invariants** with D58, D62, D63, D64; each row's home cell says "the rule itself" vs "where it was applied" |
| D64 | the Tracker's event-box hint | yes, but the row named `Modals.jsx`; the hint now lives in `src/tracker/app/core.js` (`FMT_HINT`) and `retest.test.tsx` names D64 | the row's home cell corrected (no code touched) |
| D21 | `ui-contracts.md`, "the stale sentence, corrected" | **no — never corrected**: §Where it is drawn, and where it is not still said the OIL mode shows on "off-day-tagged days", against D21, the code (`isNonWorkingISO`: weekends and PH only) and the register | **sentence corrected**; the row's home cell says when; the register's Off-day row renumbered OIL38 → **OIL43** (it had reused an id that already meant "amendment numbering is per-day isolated", which the 21 Sep scenario lists cite) |
| D36 | `engine-rules.md` (the availability window) | not stated there (the OIL-seats register has it) | one clause written into §The ALL / ALL AVAIL expansion |
| D304 | `engine-rules.md`, the delete's cutoff | yes | number added, with "the real calendar date, never the demo's own today" |
| D325 | `ui-contracts.md` §Admin → Users — one door | **no** | one sentence written into "The Leave War after the one door" |
| D328 | the same section, the earlier stint read-only | yes | number added |
| D338 | `ui-contracts.md` §The one changes window | yes | number added at its opening |
| D169 | `handover-dataverse.md` "(medical stays restricted)" | that half was set aside by D211; the brief now says every member reads it | the row's home cell notes it |
| D59 | `raptor-port/README.md` | its stale live-site line has since gone; its three other homes cite D59 | nothing |
| D135 | `.claude/rules/shipping.md` | the cell names shipping.md for D86's conditions, which D135 leaves standing | nothing |
| D145 | `.claude/skills/session-handoff/SKILL.md` | the skill it approved | nothing — a skill change needs both reviewers and his approval (D70) |

Left after the pass, each explained above: D59, D63 (`engine-rules.md` is where "F-15" was applied, not the
rule's home), D135, D145, D169.

## Found in passing, fixed

- `engine-rules.md` §The edit log said the log is "Session-scoped, and cleared by `resetSession`" (stale since
  `[DRAFT-PENDING]`, D336 (b), D338 (1) — it is durable) and that `who` "only ever reads Admin or Squadron member"
  (stale since `[ACCOUNTS]`, D166 (5) — it reads the signed-in callsign). Each got a dated CORRECTED lead-in; the
  old words stay as history.

## The gate, from now on

`raptor-port/scripts/docsize.mjs` (job 1b) now also fails a ruling row NEW on a branch when a Markdown home it
names before "on build:" never mentions its number (alone, or inside a range such as D5–D13); the append-only
archives are exempt; code homes are not checked. Its self-test replays the miss (red on the old gate, green on the
new). The three parallel chats of 28 Sep 26 were told before it was committed; one row (D349) it caught on their
branch was fixed there the same hour.
