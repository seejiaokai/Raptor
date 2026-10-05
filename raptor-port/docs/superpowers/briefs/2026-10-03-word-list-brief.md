# Brief for Astra — draft the app's word list (`[WORD-LIST]`, D491) — 3 Oct 26

You are drafting ONE reference page, read-only: change nothing in the repo; your final message IS the draft, in Markdown.
The host checks it against the running app before it is used.

**Why.** The owner is not technical. Every message to him must name things the way the APP does, on screen — never a
function, file, field or class name (`.claude/rules/plain-language.md`). Agents keep failing at that translation. The
list is the translation: screen name → meaning → code name.

**Read first, by path:** `.claude/rules/plain-language.md`; `raptor-port/CLAUDE.md` (whole);
`raptor-port/docs/ui-contracts.md`, `engine-rules.md`, `feature-impact.md`, `remarks-vocabulary.md`, `file-map.md`
(under `raptor-port/docs/`); the area files under `.claude/rules/decisions/` (`scheduler.md`, `leave-war.md`,
`tracker.md`, `oil.md`, `people-accounts.md`) for the words the owner himself uses. Then the screens' own labels in
`raptor-port/src/ui/`, `src/leavewar/ui/`, `src/tracker/` — a term's screen name must be text the app really prints
(quote the file you took it from).

**The page.** One table per area — Schedule and the Scheduler Board; Publishing and amendments; Inputs; Warnings and
rules; Insights; OIL (earned leave — time off banked, never pay or money, D25); the Leave War; the Tracker; People and
accounts; Saving, undo and history. Columns:

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |

**Rules:**
- The first two columns must mean something to someone who has never opened the code. No jargon in column two.
- Where the owner's word differs from the screen's label, give both ("the ring around the puck").
- Where a thing has NO name on screen, say so and give the short plain phrase to use for it.
- Where the code uses one word for two things, or two words for one, list it in the last column — these are the traps.
- Column three: the main identifiers and the file that owns them, short; never a tour of the implementation.
- About 80 to 150 rows in all: the terms that come up in reports and briefs, not every label.
- No unit designation anywhere (D58): the bare squadron number is fine; never the squadron or service abbreviation.
- Mark any row you are unsure of with "(check)" rather than guessing. End with a short list of terms you could not place.
