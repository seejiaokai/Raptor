# Prompt audit — Claude Code instruction files (Raptor), 14 Nov 26

## Context
He ran `/doctor prompt-audit`. It checks the instruction files that load into this project's chats for wording written
for older models, facts the repo no longer bears out, and files that disagree with each other. It produces a report
and proposed edits. **Nothing is applied.** Each hunk can be taken or left on its own.

## Assumptions (Step 0)
- **Target model:** Opus 5.5, the model this session runs on. No file pins a model of its own: the four impeccable
  helpers say `model: inherit`.
- **Scope, audited:** `AGENTS.md`, `raptor-port/CLAUDE.md`, every `.claude/rules/**` file (the five unscoped rules,
  `decisions/*`, `seams/*`, `raptor-executor.md`, `ui-design.md`), the 4 files in `.claude/agents/`, the 19
  `.claude/skills/*/SKILL.md`, and `~/.claude/CLAUDE.md` (**an edit there affects every project**).
- **Read in full:** the always-loaded files, `raptor-port/CLAUDE.md`, `raptor-executor.md`, `ui-design.md`, and the
  heads of the skills. **Searched for known warning signs only:** the large rulings pages (`decisions/*`, `seams/*`,
  about 300 KB) and the long skills. The rulings pages are context, not instructions to the model, and kept their
  wording (keep-list 1).
- **Report only, no edits proposed:** the installed plugins (claudex-loop, cowork-plugin-management) and the
  claude.ai-synced skills under `~/.claude/skills/synced/`. These were not read in depth.
- **Left out:** `.claude/worktrees/*`, which are other checkouts and don't load here. Also left out: settings files,
  hooks, `.mcp.json` and `~/.claude.json`. Not found: no `CLAUDE.local.md`, no `commands/` or `output-styles/` at
  either level, no `CLAUDE.md` in a folder above the project, and no imports.
- **Project rule that matters here:** D1975 says the outside skills (superpowers, Impeccable, task-observer) stay as
  they were brought in unless he says otherwise. Hunks 8–10 need his word for that reason.

## Summary
The three findings that matter most:
1. **`raptor-port/CLAUDE.md` §Build & verify says "All FIVE [gates], after any change."** That text is from 17 Sep.
   The newer `shipping.md` rule (D1086) says that while the repo is public, his PC runs only the affected tests and
   GitHub runs the full set. A chat that reads only the project guide would run the full set locally against his
   ruling. This is flagged rather than edited, because the newer rule relaxes a checking rule (see F1).
2. **The vendored `using-superpowers` and `brainstorming` skills shout** ("EXTREMELY-IMPORTANT … 1% chance … ABSOLUTELY
   MUST"). They tell the model to brainstorm before any creative work and before plan mode. The project guide already
   has to override this (§How to work here: brainstorming "usually should not" be used; MEDIUM is the default). On
   Opus 5.5, text this loud makes the model over-trigger.
3. **Rules written as a diff against an earlier version.** Examples: "CORRECTED 17 Sep 26: it is NOT…", "Since D1097,
   over the line above…", "Astra is the standing reviewer again". The model has to work out the current rule from two
   wordings instead of reading one.

Counts: Group 1 (dated prompt text) **8** · Group 2 (brittle or conflicting files) **3 + 3 flags** · Group 3 (tool
descriptions) **not applicable**: no tool definitions, and skill descriptions are routing text · Group 4 (request
config) **not applicable**: no API code. The sub-agent roster was checked: 4 impeccable helpers, each with a different
job, none redundant, so **0**.

Every path and npm script the guide names was checked and all exist (`reference/tfin.js`, `SHORT-FORM.md`,
`mockups-on-the-real-app.md`, the docs table, and `test:e2e`, `smoke:tracker`, `probes:adapted`, `perf`,
`lint:changed`, `rulecheck`, `docsize`). One small point: `SettingsSheet.tsx` lives under `src/leavewar/ui/`, which the
guide doesn't say, but nothing contradicts it.

## Findings (highest confidence first)

| # | Location | Evidence | Pattern | Why it is a problem | Conf. | Action |
|---|---|---|---|---|---|---|
| 1 | `raptor-port/CLAUDE.md:20,22,24,32,34,36` | "**WRITE HIS RULINGS DOWN…**", "**THE NEWEST OWNER INSTRUCTION WINS**", "STANDING ORDER", "is NOT a bug check" | 1a pressure language | Six headings in a row are all capitals, so the capitals no longer mark anything as more important. The repo's own rule says capitals only where a name has them (D970). On Opus 5.5 this register makes the model rigid. | Medium | rewrite (hunk 1) |
| 2 | `raptor-port/CLAUDE.md:163-167` | "**CORRECTED 17 Sep 26:** it is NOT "absent from the next AL" — since the amendment core…" | 1d migration-relative phrasing | Written as a correction of an older wording the model never saw. Stating the current fact once is enough. | Medium | rewrite (hunk 2) |
| 3 | `raptor-port/CLAUDE.md:180` | "**Since 30 Sep 26 a change to a WEEK…**" | 1d migration-relative phrasing | "Since" frames the rule as a change to the histPush rule just above it. The rule stands on its own. | Medium | rewrite (hunk 3) |
| 4 | `.claude/rules/shipping.md:94-99` | "Not for progress, not for a quick reply he is clearly watching…" then "Since D1097, over the line above: every stop…" | 1d patch accretion | Two bullets disagree, and the second overrides the first. Each chat has to settle the clash every time. One bullet states what D1097 left. | Medium | rewrite (hunk 4) |
| 5 | `.claude/rules/bug-check.md:54` | "Astra is the standing reviewer **again**" | 1d migration-relative phrasing | "Again" points to an earlier state the reader never saw. | Medium | rewrite (hunk 5) |
| 6 | `.claude/rules/raptor-executor.md:95-96` | "Brief progress updates only at real milestones or blockers." | 1d update suppressor | Opus 5.5 already gives few updates. The session-start notes record missed mid-run messages and repeated "hasn't heard from you" nudges. Say when updates are wanted instead. | Medium | rewrite (hunk 6) |
| 7 | `AGENTS.md:22-24` | "…`how-we-work.md`, since 7 Nov 26, OIL's, … since 9 Nov 26 — D1947)" | 2 history narrative / volatile list | The marker `<!-- shape: page -->` already identifies a converted page. The dated list of which file converted when is history, it has to grow by hand, and it goes wrong as more areas convert. | Medium | rewrite (hunk 7) |
| 8 | `.claude/skills/using-superpowers/SKILL.md:10-16` | "`<EXTREMELY-IMPORTANT>` …1% chance… ABSOLUTELY MUST… YOU DO NOT HAVE A CHOICE" | 1a pressure language | Shouting at this level makes Opus 5.5 over-trigger. The project guide (`raptor-port/CLAUDE.md:40,42`) has to push back against it. **Needs his word (D1975).** | Medium | rewrite (hunk 8) |
| 9 | `.claude/skills/brainstorming/SKILL.md:3` | "You MUST use this before any creative work…" | 1a / 3 (trigger text) | Routing text may carry some urgency (keep-list 6). But the repo shows it over-triggers: the guide calls brainstorming "the heavy path" and says it "usually should not" be used. Narrow the trigger to when it is actually wanted. **Needs his word (D1975).** | Medium | rewrite (hunk 9) |
| 10 | `systematic-debugging/SKILL.md:12`, `test-driven-development/SKILL.md:14`, `verification-before-completion/SKILL.md:12`, `writing-skills/SKILL.md:511` | "**Violating the letter of the rules is violating the spirit of the rules.**" | 1a pressure language | Pre-emptive argument against a loophole, with no stated failure behind it. The rules around each line carry the meaning without it. **Needs his word (D1975).** | Medium | remove (hunk 10) |
| 11 | `~/.claude/CLAUDE.md:7` *(all projects)* | "Independent bug-check or hard adversarial review → **Fable 5.1, high**" | 2 pinned model name | Fable 5.2 is out, so a named version goes stale with every release. The rule's point, "a different model from the one that wrote the code", carries the meaning. | Medium | rewrite (hunk 11) |
| F1 | `raptor-port/CLAUDE.md:91` (17 Sep, by git blame) vs `.claude/rules/shipping.md` §The checks (D1086, 20 Oct) | "All FIVE, after any change:" vs "on his PC run only the tests of what you change… no full gate run there" | 2 conflicting files | High-confidence conflict, and the newer rule (D1086) wins. The guide's own rule says to flag rather than rewrite when the newer passage relaxes a checking rule. Suggested wording if he agrees: *"The five gates below; which run on his PC and which on GitHub, and when, is `../.claude/rules/shipping.md` §The checks (D1086):"*. `raptor-executor.md:65` points here too, so the fix reaches it. | High | flag |
| F2 | `~/.claude/CLAUDE.md:7-9` vs project `how-we-work.md` §Models | Global: Fable 5.1 for bug checks, the cheaper model for mechanical work. Project: Astra plus a fresh Opus read, Fable only on his word, Sonnet only for D588's jobs. | 2 conflict across levels | The project rules name the override and are newer, so this project is covered. A project file is never a reason to edit the global file, so there is no edit. | — | flag |
| F3 | `.claude/rules/decisions/how-we-work.md` §Models, D1972 | "For the week to 16 Nov 26 Fable 5.2 mainly hosts his chats…" | 2 time-sensitive content | Expires in two days. The repo's own archive step for spent permissions should move it on 16 Nov. If it isn't moved, every chat after that date reads an expired rule. | — | flag |
| F4 | `raptor-port/CLAUDE.md:45,47,123-126,227-228,256-260` | "…moved 24 Sep 26, whole, to…", "*(Copied 24 Sep 26 from the container-era paragraph archived below…)*" | 2 history narrative | The one-line pointers are required by the project's own policy (D138, D141), so they stay. Only the line 123-124 note is stale: nothing is "archived below" any more. | Low | flag |

**Kept on purpose:** the dates and D-numbers after every rule. The "newest instruction wins" rule (D90) depends on
them to order rulings, so they are load-bearing. Also kept: the safety and process prohibitions (no push to `main`
without "merge live", the lock steps, never weaken a test). They are exact scripts for fragile steps, each with a
reason (keep-list 3 and 5).

## Proposed edits — one hunk per finding (not applied)

**Hunk 1 — `raptor-port/CLAUDE.md` (finding 1).** Change the headings to sentence case. The `· full text: …§` pointers
are left as they are, so the document check's pairing still holds.
```diff
-**WRITE HIS RULINGS DOWN AT THE MOMENT HE SAYS THEM** (owner, 21 Sep 26): …
+**Write his rulings down at the moment he says them** (owner, 21 Sep 26): …
-**THE NEWEST OWNER INSTRUCTION WINS** (owner, 17 Sep 26; D90): …
+**The newest owner instruction wins** (owner, 17 Sep 26; D90): …
-**FLAG WHAT THE NEW PLATFORM CANNOT DO** (owner, 31 Oct 26 — D1551): …
+**Flag what the new platform cannot do** (owner, 31 Oct 26 — D1551): …
-**STANDING ORDER — weigh the whole ecosystem** (owner, 28 Aug 26): …
+**Standing order — weigh the whole ecosystem** (owner, 28 Aug 26): …
-**STANDING ORDER — sweep the rules, then hand-test against them** (owner, 20 Sep 26; …): …
+**Standing order — sweep the rules, then hand-test against them** (owner, 20 Sep 26; …): …
-**THE BUG-CHECK STANDING ORDER IS `docs/bug-check-order.md`** (21 Sep 26): … A code review plus green tests is NOT a bug check — it needs a ROLL-CALL, a WALK of the running app …
+**The bug-check standing order is `docs/bug-check-order.md`** (21 Sep 26): … A code review plus green tests is not a bug check — it needs a roll-call, a walk of the running app …
```
(The text after "…" stays as it is on each line.)

**Hunk 2 — `raptor-port/CLAUDE.md:162-167` (finding 2)**
```diff
 never re-validated, never persisted, wears no amendment mark and leaves no
-edit-log entry. **CORRECTED 17 Sep 26:** it is NOT "absent from the next AL" —
-since the amendment core, `publish.ts` derives eligibility, the panel counts and
-the stored diff from the canonical `dayDelta`, "never from the accumulated
-pending marks", so a funnel-bypassing write DOES surface in the next AL as an
-unmarked, unexplained change. That is worse than being absent, not better. Deletes renumber the live key space first, then
+edit-log entry — yet it still shows in the next AL, as an unmarked, unexplained
+change, because `publish.ts` derives eligibility, the panel counts and the stored
+diff from the canonical `dayDelta`, never from the pending marks (17 Sep 26). Deletes renumber the live key space first, then
```

**Hunk 3 — `raptor-port/CLAUDE.md:180` (finding 3)**
```diff
-**Since 30 Sep 26 a change to a WEEK, a REQUEST, a PERSON, the PLANNING CALENDAR or the
-LEAVE WAR is saved only by the command it runs in** — its rows are written from that command's
+**A change to a week, a request, a person, the planning calendar or the
+Leave War is saved only by the command it runs in** (30 Sep 26) — its rows are written from that command's
```

**Hunk 4 — `.claude/rules/shipping.md:94-99` (finding 4)**
```diff
-- Tell him when you are done, with `PushNotification` — when the work is genuinely finished, and when you are blocked
-  waiting on his answer. One line, plainly. Not for progress, not for a quick reply he is clearly watching, never twice
-  for the same work.
-- Since D1097, over the line above: every stop that waits on him — the work done and his next step due, a question, an answer, a look or any other input
-  — gets its one notification, whether or not he seems to be watching; an unattended run keeps its one at the end
-  (D1097, D596).
+- Every stop that waits on him — the work done and his next step due, a question, an answer, a look or any other
+  input — gets one `PushNotification`, whether or not he seems to be watching: one line, plainly, never for progress,
+  never twice for the same work; an unattended run keeps its one at the end (D1097, D596).
```

**Hunk 5 — `.claude/rules/bug-check.md:54` (finding 5)**
```diff
-- **Who they are now:** Astra is the standing reviewer again, with no end date (D1770): …
+- **Who they are now:** Astra is the standing reviewer, with no end date (D1770): …
```

**Hunk 6 — `.claude/rules/raptor-executor.md:95-96` (finding 6)**
```diff
-full). Edit files with tools; never print proposed code and call the task done. Brief progress
-updates only at real milestones or blockers.
+full). Edit files with tools; never print proposed code and call the task done. Give a one-line
+progress note at each milestone, at a blocker, and whenever a long run of tool calls has gone by without one.
```

**Hunk 7 — `AGENTS.md:22-24` (finding 7)**
```diff
-5. A ruling there is ONE line — or, in a file converted to a page (marked `<!-- shape: page -->`; the general rulings,
-   `how-we-work.md`, since 7 Nov 26, OIL's, `oil.md`, the IT flow guide's, `it-flow-guide.md`, People & accounts',
-   `people-accounts.md`, the screen-design rulings, `design.md`, and the Tracker's, `tracker.md`, since 8 Nov 26 — D1735; the Inputs pages', `inputs.md`, since 9 Nov 26 — D1943; the scheduler's, `scheduler.md`, since 9 Nov 26 — D1944; the Leave War's, `leave-war.md`, since 9 Nov 26 — D1947), a statement with its rulings cited after it. Before acting on its detail
+5. A ruling there is one line — or, in a file converted to a page (marked `<!-- shape: page -->`; D1735), a statement
+   with its rulings cited after it. Before acting on its detail
```

**Hunk 8 — `.claude/skills/using-superpowers/SKILL.md:10-16` (finding 8; needs his word, D1975)**
```diff
-<EXTREMELY-IMPORTANT>
-If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.
-
-IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
-
-This is not negotiable. You cannot rationalize your way out of this.
-</EXTREMELY-IMPORTANT>
+When a skill fits the task in front of you, invoke it before you act. A project's own instructions decide when a heavy
+process skill (brainstorming, a written plan) is warranted.
```

**Hunk 9 — `.claude/skills/brainstorming/SKILL.md:3` (finding 9; needs his word, D1975)**
```diff
-description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
+description: "Use before creative work whose shape is still unsettled - a new feature, component or behaviour change where the intent or design is open. Explores user intent, requirements and design before implementation."
```

**Hunk 10 — four vendored skills (finding 10; needs his word, D1975):** delete the single line
`**Violating the letter of … is violating the spirit of ….**` at `systematic-debugging/SKILL.md:12`,
`test-driven-development/SKILL.md:14`, `verification-before-completion/SKILL.md:12` and `writing-skills/SKILL.md:511`.

**Hunk 11 — `~/.claude/CLAUDE.md:7-8` (finding 11; affects all projects)**
```diff
-  - Independent bug-check or hard adversarial review → **Fable 5.1, high** (a
-    different model from the one that wrote the code).
+  - Independent bug-check or hard adversarial review → **the newest Fable, high** (a
+    different model from the one that wrote the code).
```

## If he takes any hunks — how they ship (his project's rules)
- Hunks 1–7 change working guides or unscoped rule files. In this project, each needs **Astra's read plus a fresh,
  blind Opus read** (D1761, D1770). They go on their own branch and merge only on his **"merge live"**. None of them
  counts as notes-only.
- Hunks 8–10 also need his word, because they edit vendored skills (D1975).
- Hunk 11 is outside the repo, so no merge is needed. It changes every project at once.
- **Checks after editing:** `cd raptor-port && npm run docsize` (catches a broken short-form ↔ `guide-full.md`
  pairing from hunk 1) and `npm run rulecheck`. Then search for the removed phrases ("CORRECTED 17 Sep", "Since D1097",
  "EXTREMELY-IMPORTANT") to confirm no test or script matches on them. A behaviour check: in a fresh chat, ask for a
  small UI tweak and confirm it no longer jumps to brainstorming or a written spec.
- **Model advice:** applying the edits is light, so Opus at medium is enough. The two required reads are Astra and a
  fresh Opus, as above.

Rulings: none this session.
