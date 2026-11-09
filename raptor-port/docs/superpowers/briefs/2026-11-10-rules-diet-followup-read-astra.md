# The rules diet's follow-up — Astra's blind read (10 Nov 26, chat 48)

*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`, codex-cli 0.160.0; brief `2026-11-10-rules-diet-followup-read-brief.md`, on `497c1d3df`. Blind to the fresh Opus reader.)*

I found **one unfiled open recommendation and three smaller accuracy issues**. I found no governing ruling made unreachable by this change.

**1. A ruling a job can no longer reach**

No finding under this question. The distinction is between losing automatic loading and losing the route to a required ruling.

| Job | What happens after this change |
|---|---|
| Leave War | Ordinary Leave War source files no longer bring in the scheduler page through either guide. Its existing pointer plus the two additions cover the relevant scheduler rules. Browser tests, mock-ups and shared scheduler files can still load it directly. |
| Tracker | Ordinary Tracker source files lose that indirect loading. Its existing pointer covers its shared calendar, keyboard, history and other scheduler rules. Shared files such as `src/ui/logout.ts` still load both pages. |
| OIL | OIL work under `src/ui/**` still loads the scheduler page directly. OIL work confined to Leave War files retains the Leave War and OIL pages and their pointers. |
| People & accounts | Work under the shared UI, state or engine paths still loads the scheduler page. Work confined to Leave War components or documents follows the relevant area-page pointers. |
| IT flow guide | Its own document paths do not load the scheduler page. The performance note now directs a change to a settled speed rule to its owning page; the ripple map directs work affecting another surface to that surface’s rulings. |
| Notes-only edits to either guide | Neither guide now loads the scheduler page. Their new notes supply the manual reading route before changing the relevant rule or surface. |

I checked these rule groups against the remaining pages, seams and required design-guide sections:

- **Leave War windows and Event sheet:** D641, D642, D644 and D645 are covered by the new first pointer. The other windows remain explicitly waiting under `[LW-WINDOWS-NONBLOCKING]`.
- **Calendar and phone keyboard:** D796, D797, D901, D1012, D1020, D1048, D1081 and D1412 are covered by the second pointer; Tracker already has its corresponding pointer.
- **History:** D263 is newly named for Leave War. The existing history pointers and Leave War’s own rules retain the other relevant requirements.
- **Manning, typed numbers, acknowledgement and Reset:** the existing Leave War pointer, its own statements and its seam retain these.
- **Whole-app writing, window placement, rings, notes, feedback and bars:** these remain reachable through the design page, the required design-guide sections and the OIL page. The time-format rule also retains an explicit route in `raptor-port/CLAUDE.md:260`.
- **Settled speed rules:** the 1150-element ceiling, dragged ghost, hover suppression, changed-block replacement, fallback and drop ordering remain on `scheduler.md:74–77`. The new performance note names that section and requires opening the owning page before changing its figures or settled dead ends.

**2. The pointer lines’ fidelity**

The two substantive additions at `leave-war.md:301–302` are faithful **as pointers followed by the required full-page read**. Their cited numbers support their wording. I found no missing number required by the words actually stated, no member/admin scope change, and no agent interpretation promoted into an owner’s ruling.

**F2 — Low: the new loading statements are too absolute.**  
Locations: [leave-war.md:303](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/.claude/rules/decisions/leave-war.md:303) and [tracker.md:101](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/.claude/rules/decisions/tracker.md:101).

“The scheduler’s page does not load with a Leave War/Tracker file” is false for overlapping paths:

- Leave War browser tests match the scheduler’s `e2e/**`.
- Leave War mock-ups match its `docs/mock/**`.
- Tracker’s `src/ui/logout.ts` matches its `src/ui/**`.

D1949’s full row expressly preserves this exception. The new handoff itself acknowledges the Leave War examples.

**Consequence:** a reader assessing which rules a job loads, and its expected saving, receives contradictory instructions. This does not remove a safeguard.

**Fix:** say that the two guides no longer load the scheduler page, while files matching both areas still do; retain the instruction to open it before changing the listed matters.

**3. The guides’ notes**

No finding.

- The performance note is immediately inside **Part 1**, at `performance.md:27–31`. The measure reads that whole part.
- The ripple-map addition is within **How to read it**, at `feature-impact.md:20–22`. The measure’s paragraph selection includes the added continuation lines.
- The named scheduler **Speed of the dense screens** and **Settled** sections exist; Leave War’s **Settled** section exists.
- Neither guide now matches the scheduler page’s paths. The performance guide still loads the Leave War **seam**, which is correctly acknowledged separately in the handoff.

**4. The six removed handoff blocks**

| Removed block | Result |
|---|---|
| Chat 47 — final measure | Its follow-up is this job. The general page’s lack of space is retained under `[RULES-DIET]`, `OUTSTANDING.md:414`. |
| Chat 46 — Leave War page | Its unanswered readings, seven testing gaps, archival work, stale references and unmarked changes remain under `[LW-PAGE-LEFTOVERS]`. Its next measurement step was completed by chat 47. |
| Chats 19–27 — checking tools | Download reliability and the unobserved gold-dot skip are retained at `OUTSTANDING.md:1999–2004`. The later live merge-check result supersedes the earlier unproved state. |
| Chat 13 — schedule marks | The five newly filed points at `OUTSTANDING.md:319–329` preserve the original questions and qualifications. Leave War’s separate “locked week” wording remains under `[DAMAGED-WEEK-LEFTOVERS]`, lines 339–342. |
| Chat 38 — coordinator | Completed coordination is removable; its parked work has existing backlog items, and away mode expires. **The skill-notes review remains unfiled: F1 below.** |
| Chat 4 — IT answers | The awaited reply and two recommendations are faithfully retained at `OUTSTANDING.md:1655`. Existing IT/database items and their referenced plans retain the remaining questions and testing requirements. |

**F1 — Medium: an unanswered recommendation was removed without being filed.**  
Location: [HANDOFF.md:25](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/HANDOFF.md:25), the assertion that nothing remains of `coordinator-2`.

The removed coordinator block explicitly listed the skill-notes review as **Open**, last reviewed 27 October, offered as a separate job. The retained date still says 27 October. I found no current backlog entry for that subsequent review; entries describing the completed October reviews do not cover it.

Saying the review “is offered in the report” does not make the recommendation finished or file it in the one backlog. D1949 and the handoff’s own removal rule require that filing.

**Consequence:** the next coordinator can treat this block as fully cleared while the unanswered recommendation disappears from the backlog.

**Fix:** file the pending review, its last-reviewed date and its need for the owner’s answer. Do not describe the offer as authorization to perform it.

I found no other lost open point or widened filing among the six blocks.

**5. Other breakage and reproduced totals**

**F3 — Low: the reported final totals omit the saving from the handoff cleanup.**  
Locations: [HANDOFF.md:25](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/HANDOFF.md:25) and [OUTSTANDING.md:418](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/OUTSTANDING.md:418).

I reproduced the model’s totals with `node raptor-port/scripts/docsize.mjs --reads --verbose`:

| Model job | Base | Final | Reduction |
|---|---:|---:|---:|
| Leave War | 304,434 | **264,482** | **39,952** |
| Tracker | 270,651 | **230,343** | **40,308** |

The final components are:

| Model job | Start | Task | Check |
|---|---:|---:|---:|
| Leave War | 35,816 | 103,274 | 125,392 |
| Tracker | 35,816 | 62,260 | 132,267 |

Both recorded final totals are **9,458 tokens too high**, consistent with omitting the net handoff/backlog saving. The claim that scheduler and Inputs jobs are unchanged is also incorrect: each falls by **9,190** across the complete change.

**Consequence:** the central result of this follow-up is misreported. With the stated approximate 83,000-token app share, the Leave War model is about **347,000**, rather than 357,000.

**Fix:** record the final whole-change measurement, or clearly label the existing figures as an intermediate, paths-only comparison. These remain estimates for the model jobs, not guarantees for every job.

**F4 — Low: the measurement script’s explanation now contradicts its behaviour.**  
Location: [docsize-reads.mjs:16](C:/Users/User/projects/Raptor/.claude/worktrees/rules-diet-followup-4a76cd/raptor-port/scripts/docsize-reads.mjs:16).

Its opening comment still says the ripple map and performance guide load the scheduler’s rulings. This change makes that claim false; the calculation itself follows the current paths correctly.

**Consequence:** someone explaining or maintaining the measurement can incorrectly attribute the scheduler page to both jobs.

**Fix:** update that explanation to describe the current path-based loading. The dated before-change measurements in the rules-diet plan can remain historical evidence.

I found no further changed safeguard or contradiction. The diff removes more text than it adds: seven files, 44 added lines and 81 removed. The read measurement reported no missing sections, and the whitespace check passed.

Read-only throughout; no files changed, committed or pushed.  
Rulings: none.

**Verdict: REVISE — file the outstanding review and correct the loading statements and measurement records; the substantive routing change is sound.**