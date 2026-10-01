Read-only review complete. I opened every requested file, all seven upstream snapshots, and the additional Thermo wrapper/reviewer snapshots. I changed no file.

## 3. Standing tidiness guard — ADOPT WITH CHANGES

1. Already said?

Partly. The existing planning skill says large files may signal mixed responsibilities and permits only targeted improvements, not unrelated refactoring ([brainstorming §Working in existing codebases](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/skills/brainstorming/SKILL.md:92)). The review template already asks about separation, duplication and architecture ([code-reviewer.md](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/skills/requesting-code-review/code-reviewer.md:44)).

The three concrete diff questions are therefore sharper, not wholly new.

2. Contradictions and narrowing

- The proposed `1,000 lines / another 100` rule risks becoming the forbidden numeric target. D141 permits a size only as a tripwire, never something to cut toward ([D141 full row](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/decisions-full/how-we-work.md:57)).
- `src/engine` is explicitly exempt from tidying, splitting and reformatting because its bodies are verbatim ports ([CLAUDE.md §Coding conventions](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/CLAUDE.md:193)).
- Asking for a separate “cleanliness” all-clear risks the order’s anti-pattern: `"Is this clean?" manufactures confidence` ([bug-check-order §4](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/bug-check-order.md:209)).
- D353 allows no extra reviewer: the existing one reader, or two on risky work, must perform this check ([D353](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/decisions-full/how-we-work.md:33)).
- D144 supports finding a structural cause, but not opportunistic micro-tidying. D485 means the check happens once per batch. D29 is not directly engaged, provided nobody trims documents during it.

Also, “fixed if small” is unsafe: a fix after the final read spends that read’s evidence and starts another verification round.

3. Cost

Small but not “almost nothing.” It consumes attention on every final read and is duplicated across both readers on FULL work. False notes create filing, owner decisions and possibly another gate/read cycle.

4. What it would catch here

It would challenge future additions to the 6,684-line `scheduler.css`, 6,666-line Tracker core, or 4,701-line Leave War matrix. I searched the live code and history but found no concrete escaped defect demonstrably caused by a duplicated helper or misplaced special case that this new guard—and not the existing architecture review—would have caught.

5. Exact wording and placement

In `raptor-port/docs/bug-check-order.md` §4, after the sentence ending `the cheapest possible pointer to a real bug` at current line 246:

> **A separate maintainability note from the same final reader or readers required by D353, after the defect findings.** Inspect only the changed lines and their immediate owners. Report only a concrete case where the change (a) puts a new responsibility into an already busy non-engine file instead of a focused module, (b) adds a feature-only branch to a shared flow instead of its canonical owner, or (c) duplicates an existing helper. A size is a tripwire, never a target (D141); do not tidy, split or reformat `src/engine/` bodies. These notes are non-blocking, add no reviewer, and are filed for later ruling—not fixed during the final read. If none: `Maintainability note: checked the changed lines for those three risks; none found.`

The upstream Thermo rule only flags a change crossing from below to above 1,000 lines. The proposed “already large plus about 100” threshold is this spec’s invention, not upstream.

## 4. Five look-and-feel checks — ADOPT WITH CHANGES

1. Already said?

Three are already substantially present in Impeccable:

- Touch targets below 44×44 are already an Impeccable audit check ([audit.md §Responsive Design](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/skills/impeccable/reference/audit.md:46)).
- Tabular data is already mentioned in its craft/type guidance.
- Its motion guidance already requires repeated-use behaviour and a second, non-motion signal ([animate.md §Verify](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/skills/impeccable/reference/animate.md:79)).

I searched Impeccable and found no rule banning `transition: all`, no concentric-radius formula, and no “considered but rejected” report section. Those parts are new. Naming inspected and uninspected scope already exists generally in the verification skill, but not in Impeccable’s report.

2. Contradictions and narrowing

A blanket 44px finding conflicts with D487 in practice. The phone top bar deliberately uses 30px history buttons, a 32×30 burger and tight gaps so the approved one-row bar fits ([scheduler.css phone contract](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/ui/scheduler.css:3408)). Expanding every hit area invisibly would overlap neighbours unless geometry changes—also forbidden by the source rule.

Therefore size alone cannot be a finding. It needs a demonstrated missed tap or overlap. Any remedy must respect D487 and `scheduler.css`’s measured contracts.

3. Cost

The static checks are cheap. A real touch-target check is not: it requires the phone build, hit testing and relevant states. A compulsory rejected-candidates list can manufacture filler and waste owner attention unless explicitly allowed to be empty.

4. What it would catch here

Two concrete candidates exist:

- Leave War’s changing manning counts are printed in day columns, while tabular digits are scoped only to balance boxes ([CountRows.tsx](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/leavewar/ui/CountRows.tsx:213), [matrix.css](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/leavewar/ui/matrix.css:250)).
- Tracker’s Complete/Done/Remaining figures change without tabular digits ([SidePanel.jsx](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/tracker/components/SidePanel.jsx:279)).

These are candidates, not confirmed visible defects; they would need rendering. I found no `transition: all`, no confirmed high-frequency-motion violation, and no confirmed nested-radius defect.

5. Exact wording and placement

Add after the overlap table in `.claude/skills/IMPECCABLE-VENDORED.md`:

> ## Raptor review overlay
>
> When Impeccable reviews this app, stay inside the changed surface and report:
>
> - changing or column-aligned numeric values that visibly shift or fail to align because their digits are not tabular;
> - `transition: all`;
> - nested rounded surfaces whose outer radius does not match the inner radius plus the visible gap.
>
> Impeccable’s existing motion and touch checks still apply, narrowed by D487: a control below 44px is not a finding by measurement alone, and its visible size does not change. Report only a demonstrated phone miss or overlapping hit areas. Propose an invisible extension only after browser hit-testing shows that it will not overlap another control or disturb `scheduler.css`’s measured geometry.
>
> The report names the exact surfaces and states inspected and not inspected. Add `Considered but rejected` only for real borderline candidates; never invent entries.

## 5. Three evidence rules — REJECT

1. Already said?

All three are already live:

- Fresh evidence: `"NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE"` and a run must occur in the current message ([verification-before-completion](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/.claude/skills/verification-before-completion/SKILL.md:14)).
- Evidence strength: the order already says a screenshot cannot prove a gesture, a browser test is not the walk, and a code read is not the walk ([bug-check-order §3](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/bug-check-order.md:174)).
- Later fixes invalidate proof: the order requires gates and affected re-walks after fixes and preserves the original pictures separately ([bug-check-order §5](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/bug-check-order.md:380)).
- Verified versus assumed is already a standing product rule ([CLAUDE.md §Product bar](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/CLAUDE.md:72)).

I checked `requesting-code-review`: it does not separately state evidence expiry or evidence-layer hierarchy.

2. Contradictions

No direct ruling contradiction. The third line is simply misplaced in the bug-check order because it governs planning. Requiring labels on “every important statement” would also bloat owner-facing plans without solving enforcement.

3. Cost and catch

It adds recurring words and reviewer attention but no new protection. The OIL escape already proved weaker evidence could not replace the walk; the order was written around that exact case. D29’s erroneous claim about where a record lived is a concrete example that Verified/Assumed labelling could have caught—but the live “verified versus assumed” rule already existed. Repeating it is not the remedy.

## Fact check

- Correct: source code excluding tests is 6,590,340 bytes; roughly 6.6 MB and about 1.7 million tokens.
- Correct: exactly 19 non-test source files exceed 1,000 lines; every listed file size is exact.
- Correct: the 30-day, no-merge commit counts reproduce exactly when measured back from the spec’s 1:10am commit.
- Correct: tabular digits occur in exactly five source files.
- Correct: I found no `transition: all`.
- Wrong: §4 says React is among the technologies “none of which most of this app uses.” The app declares React 19 and 218 source files import React ([package.json](/C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/package.json:22)). The upstream skill also explicitly supports plain CSS; it does not require Tailwind or an animation library.
- Overstated: upstream says tabular digits for dynamically changing numbers; “every number sitting in a column” is this spec’s extension.
- Incomplete: APEX classifies statements as Verified, Assumption, Unknown **and Untrusted**; §5 omits the fourth.
- I found no other factual error in §§2–5.

## Better missing fusion

APEX’s strongest omitted rule would reduce false reviewer findings:

> Reject a review claim that does not name a concrete failure route or violated ruling, the changed code that introduces or exposes it, and the smallest safe remedy. Style preference and speculative breakage are not findings.

That belongs in `bug-check-order.md` §4 immediately after the existing demand for exact fixes and explicit negatives. It protects reviewer attention better than adding more general evidence slogans.

If only one proposal can be taken, take the rewritten §3 guard. It adds a focused future-growth check to a read already happening, without reopening button design or repeating evidence rules.

Keep proposal 3, but remove the numeric growth target and never tidy engine code during the review.  
Keep a narrowed proposal 4; do not flag button size alone.  
Reject proposal 5 because the live rules already say all three things.  
The measurements are right; the claim that this app mostly does not use React is wrong.  
If only one is chosen, choose the rewritten proposal 3.

