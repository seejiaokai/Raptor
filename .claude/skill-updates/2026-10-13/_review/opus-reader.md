# Independent read of the 13 Oct 26 skill-review drafts — fresh Opus reader (D810)

Read: the brief, `diff.patch` whole, `dispositions.md`, the memory and backlog proposals, the live files and scripts the
drafts lean on, eleven full ruling rows, 164 notes in the live log. Short names as in `dispositions.md`.

## Findings, most severe first

**1. HIGH — BCO §7.0, new bullet "A designed scenario is left unwalked only for a reason about the SCENARIO".**
Its first sentence allows two reasons only. The D608-approved bullet above it lets the sizing step choose "how many
scenarios"; the new sentence turns a designer's list into a floor nobody ruled. Its second sentence implies a third reason
is sometimes valid, so it contradicts itself, and note 502's own third reason (walked on unchanged code) is dropped.
Replace the bullet with:
> - **A scenario an independent designer wrote is set aside only with its reason written beside it in the sheet** — a
>   named test carries it (as above), it cannot be reached, it was walked on code this change leaves as it was (name that
>   walk), or the sizing lines say what makes a walk of it unable to find anything here. "Older behaviour this change does
>   not touch" is never that reason when the change touches the same listener family, the same component or the same scope
>   rule (10 Oct 26: two real faults sat among eight scenarios set aside that way) — drive those once: a scripted step is
>   cheaper than a second round of reads.

**2. MEDIUM — BCO §5 "A fix is new code".** It names no reader. As drafted the chat that wrote the fix can count its own
read (against D790), or call Fable three more times without his word. "The cap of about three rounds" is the plan-review
cap (§4a, D70), not a ruled cap on code reads. Replace the second sentence's opening with:
> … the fix commit gets its own narrow read ("is each fix right and complete, and what did it break beside it") by a fresh
> Opus reader that did not write the fix and is handed only the fix commit and the findings it answers (D790 — never the
> chat that wrote it; whether Fable reads fixes too is not ruled: until he says, it does not), repeated on each round's
> fixes for at most about three rounds (the agent's cap, borrowed from the plan-review one, §4a); …

**3. MEDIUM — BCO §4, hand-back item 2 loses note 292.** The draft triggers only when a fix goes "BEYOND the rule the
finding cites" and then says "fix only the cited defect". In 292 the cited defect itself was pinned by a test as intended;
the lesson was "not a fix — a question". Replace item 2 with:
> 2. Check it against the governing ruling. Then search the tests, the code comments and the records for a decision that
>    pins as INTENDED either the behaviour the finding calls a defect, or any behaviour the fix would change beyond the rule
>    the finding cites. If the finding's own behaviour is pinned, it goes to him as a question and is not fixed; if only the
>    wider behaviour is, fix the cited defect and put the rest to him. Either way with a safe interim (the action SAYS what
>    it does).

**4. MEDIUM — DPA "Stage by explicit path" against "Never commit a tree an agent is still writing".** The new bullet
describes committing while "a helper's half-finished output" sits in the checkout; the bullet two below forbids any commit
then. Append to the new bullet:
> This is how the rule below is kept when your own commit cannot wait: only files you finished go in, by name; nothing a
> running agent has written or may still write is staged.

**5. MEDIUM — WS §6, `process.env.HP_SHOTS ||= '<folder>'` misleads as written.** `lib.mjs` reads `HP_SHOTS` once, at
import, and a static `import` is hoisted above that line; a walker following the README's `import { open } from …/lib.mjs`
gets the driver's default — an absolute folder in ANOTHER checkout (`…/Raptor/raptor-port/docs/img/handpass/2026-09-21-oil`),
the exact fault §5 warns of. Replace the parenthesis with:
> (`process.env.HP_SHOTS ||= '<folder>'`, on a line that runs BEFORE the shared driver loads — the driver reads it once, at
> import, and a static `import` is hoisted above the line: load it with `await import('./lib.mjs')` afterwards, or set it in
> a small module imported first, as `scripts/handpass/ab/ab-env.mjs` does — or the pictures go to the driver's default
> folder in another checkout)

**6. MEDIUM — MOCK's home is not reached where mock-ups are made.** It sits in `brainstorming`, which
`raptor-port/CLAUDE.md` says "usually should not" be invoked; its other pointer is in `guide-full.md` (never loaded). The
new BCO §11 bullet, which orders the picture, does not name it. Keep the file and add (a) to the end of that bullet: `The method: `.claude/skills/brainstorming/mockups-on-the-real-app.md`.`
(b) a row in the draft `raptor-port/CLAUDE.md` §Where things live, under the walk-scripts row:
> | **How to draw a proposed change on the running app** (a mock-up of a screen that exists) — read before making one | `../.claude/skills/brainstorming/mockups-on-the-real-app.md` |

**7. MEDIUM — DECISIONS.md steps 1 and 2.** (a) Step 2 dropped the live text's "in its full row": "the cell that states
its rule" also describes the short line's third column ("The rule"). The gate reads marks from the full row's third and
fourth cells; notes 407/408 say the fourth. Replace with: `stays live and says so in its FULL row, at the end of the fourth
cell, "What it means" (…)`. (b) Step 1's backlog sentence omits the trigger. The gate fires on `OUTSTANDING.md` in
backticks (it then requires that file to cite the number); D810's own row does this. Replace with:
> … in the home cell backticks are for files only, and a backlog item is written "filed as [ID]" in plain words — never
> `OUTSTANDING.md` in backticks as a home: the gate then requires that file to name the ruling, the item leaves at the
> archive, and the move is refused.

Confirmed: "the cell right after the date" is where REPLACED / SPENT is read, and ANSWERED is accepted.

**8. MEDIUM — wrong closure, note 352 (REFLECTED).** D368 and `doc-structure.md` say WHAT to tell him; neither says the
lesson: "no new worktree — reuse this folder" cannot be done, and the branch must be released first. The branch's own
`HANDOFF.md` block still says "no new worktree". Make it APPLY — add to SH Step 1, after the opening-line sentences:
> When the fresh chat continues THIS chat's branch, never tell him "no new worktree — reuse this folder": the app offers
> only the main folder or a NEW worktree, and git allows a branch in one folder at a time. Check everything is pushed,
> release the branch here (`git switch --detach`), and tell him to tick "worktree" and pick `claude/<name>`.

**9. LOW — HANDOFF.md head gives only the fresh-worktree command.** A chat continuing a pushed branch (SH: "git pull is
for…") follows it and stays behind its own branch — note 420's stale read. Replace the sentence with:
> Bring the checkout level BEFORE reading this file: a chat continuing a pushed branch runs `git pull --ff-only`; a fresh
> worktree has no upstream, so "git pull" pulls nothing there — `git fetch origin`, then `git merge --ff-only origin/main`.

**10. LOW — BCO §4 parenthesis: "the app's limit of five preview servers".** In this document "the app" is RAPTOR; the
limit is the desktop harness's (note 417). Replace with: `Where the harness's limit of five preview servers a folder (its
preview tool counts every chat's) leaves none free, …`. On D16: "its own port" is the row's meaning cell, not his words,
and separate browser storage keeps its purpose — the recipe is narrowed, not the ruling.

**11. LOW — BCO §4 "one round, with one brief" against D353.** D353 gives scenario design ONE reader and an important
plan's red team BOTH; the draft does not say which wins. Append: ` — sent to as many readers as the plan's red team needs
(D353: both for an important plan, one otherwise), never a second scenarios-only run`.

**12. LOW — TDD "Red is an observation" beside the Iron Law.** "Once green, break the one line" reads as a licence to code
first. Append to that paragraph: `This recovers the proof for a test written first that could not be seen failing; it is not
a way to write the code first — the Iron Law stands.`

**13. LOW — TO "is not logged again as a note".** None of 256/512/518 says to stop recording; the recurrence count is what
justified `[SHELL-SCRIPT-GUARD]`. Replace the first two sentences with:
> **A trap that recurs after it was logged is not logged again as a fresh note.** Add one dated line under the earlier
> entry ("met again <date>: <job>") — or, if that entry is closed, one new note citing its number — and propose the guard: …

**14. LOW — BCO §6 "REMOVES or replaces a control, an event or a way out".** His find was a removed FORM; the item's
proposed wording said "something from a page". Replace with `a control, a form or panel, an event or a way out`.

**15. LOW — BCO §4, "a third of the walkers' FAILs".** Note 539 says four of five, and about twelve the job before.
Replace the parenthesis with: `(13 Oct 26: four of one walk's five FAILs, and about twelve on the job before, were the
host's own expected line contradicting an older ruling.)`

**16. LOW — the lock sentences.** (a) `shipping.md`: "waits for it" can be read as "takes it"; replace with `waits until
the lock is free`. (b) GD (4) and `shipping.md` say "ask before breaking", but the waiting `take` / `run` breaks a two-hour
lock by itself. Add to GD (4): `The waiting `take` or `run` breaks it by itself at two hours — stop your queued run while
the holder is still working.` (c) `dispositions.md` says ONE sentence of `shipping.md` changed; three clauses did — tell him three. `gatelock.mjs`'s
header still states the old exemption: add it to `[CHECK-TOOLS-HARDEN]`.

**17. LOW — `[METHOD-LIT-COLOUR]` rides D810.** It answers no note; its item says "read by Astra and Sol first", and
D810's reading (5) keeps the Opus-only read to this review. Its wording matches the item exactly. Add to
`dispositions.md` "Also carried": `Neither item had the Astra and Sol read its own text asks for; they go in on this one
Opus read only if he says so — a separate yes/no in the approval — and both are written on `[NO-ASTRA-LIST]` (D761).`

**18. LOW — WS has two readers and does not say so.** A Sonnet walker handed all 167 lines meets host-only steps
(break tests, the brief itself). Add under the title line: `**A walker reads §3 to §7; §1, §2, §8 and §9 are the
host's.**`

**19. LOW — thin closures.** 284 (REFLECTED): D302 fires "before changing a file"; the note's lesson is at PLAN time. Add
to WP Self-Review 12: `Before the design, compare the files each other open branch changes with the files this plan will
touch; for each overlap the plan says which version it builds on, and in what order.` 434 (REFLECTED): memory only; add to
WS §7: `A fault that depends on zoom or display scaling is reproduced in a browser STARTED at that scaling
(`--force-device-scale-factor`), never with an emulated picture scale.` 423: its row's "every handoff's opening line now
asks for the usage" is not in SH — cite the memory note only. 534 (ASK): right to close, but its lesson that ledger rows
give SCENARIOS apart from WALKERS lands nowhere — say so in its row.

**20. LOW — BCO §4 item 1** invents a disposition ("not a defect — checked") beside item 5's fixed list. Replace with `is
dispositioned a false positive (item 5), marked "checked", with the reader that disproves it`.

**21. NOTE — install.** The staged `HANDOFF.md` and `DECISIONS.md` are whole-file snapshots of the base commit. Copying
them over the live files would revert this branch's `## Now` block and any map row added since: apply the hunks.

## Checked, nothing found

- **Fidelity (check 1).** Read against their drafts, issue, suggested change and principle — every `BCO §6` row (244, 250, 252, 389, 409, 413, 433, 435,
  474, 478, 490, 496, 498), `DEC` (314, 340, 406, 407, 408, 446, 448, 450, 513, 519), `HO` (370, 395, 420, 439, 541),
  `shipping.md` (342, 391, 444), `MOCK` (241, 242, 243, 249, 271, 283, 296, 297, 425, 451, 452, 453, 488, 493, 511, 520);
  and 93 other APPLY rows (about a third of these by their suggested change and principle only): BCO 240, 253, 277, 290, 292, 293, 304, 322, 386, 390, 410, 417, 424, 429, 432, 440, 441, 471,
  475, 482, 499, 502, 531, 539, 540 · WS 239, 247, 338, 343, 436, 536, 537 · TDD 382, 383, 401, 459, 497, 529, 538 · WGT
  260, 438, 457, 532 · VBC/BC 254, 404, 473, 476, 481, 517 · SD 251, 324, 492 · WP 306, 331, 422, 454, 479 · RCR 344, 437,
  501, 535 · DPA 336, 337, 405, 426, 431, 525, 528, 530 · EP 303, 384 · FS 419 · TO 256, 512, 518 · SH 258, 310, 323, 327,
  348, 355, 360, 430, 447, 449, 467, 509, 516 · GD 276, 312, 484, 485 · doc-budget 507. Small losses, not findings: 355's
  "why now", 370's `git branch -r` look, 490's "size the check from that list".
- **Every note has one row:** 272 headers, 272 rows, same numbers.
- **Lost safeguards (check 3).** Every removed line reappears extended, bar finding 7(a).
- **Closures (check 4).** The other 14 REFLECTED rows hold at the cited place (memory files, outside the repo, not
  opened). ASK 272, 329, 339, 388, 418: closing is right. FILED: a backlog item is enough; WS §2 carries the rule for helpers.
- **Commands and names (check 7).** Every command, name, section and path the brief lists exists and is used correctly.
  `tsconfig.json` has `"files": []`; `docsize.mjs` reads `DOCSGUARD_ALLOW` and `backlog-archive.mjs` passes it on;
  `gatelock.mjs run` releases in a `finally`, so a killed run does not; `breaks.mjs` and `breaks-browser.mjs` each take a
  list file and restore the bytes they changed.
- **Tripwires.** `shipping.md` 104/110, `HANDOFF.md` 168/250, `raptor-port/CLAUDE.md` 295/340, `DECISIONS.md` 89/90 —
  one line of room: finding 7's edits must not add a line.
- **Leakage (check 8).** None that misleads elsewhere.
- **Doubling (check 5).** The repeats between TDD/WGT/BC and WS serve two readers. Not earned: WS §4's "nothing changes"
  and "a negative assertion" bullets; BC's "hidden mounted twin" sentence (it repeats WGT). BCO grows 769 → 880 lines.
- **The two new guides (check 6).** WS is a sound home and contradicts neither BCO, the ledger nor the README; MOCK
  agrees with `brainstorming/SKILL.md`.
- **Memory notes and backlog items (check 9).** Each says what its notes meant; none is a rule of the app. Add to
  `record-answers-quietly-during-a-round`: "what a replaced ruling leaves behind is still fixed in the change that
  records it (D201)".
- **`[WALK-FINGER-NOT-LOCATOR]`:** both lines match the item's proposal.

**REVISE**
