CHANGES REQUIRED

**2. Findings**

**F1 — Medium: the deployment instructions can select the wrong preview.**

Location: [gates-and-deploy.md:58](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/gates-and-deploy.md:58).

- **Concrete failure:** branch A has been approved and merged. Another chat pushes branch B, whose preview becomes the top deployment. Following “the ⋯ menu of the TOP row” selects B. Comparing A’s head with A’s merge still returns an empty difference; that check does not establish the identity of the selected deployment.
- **Expected:** only the deployment corresponding to the approved change may become Production.
- **Cause:** deployment selection uses list position, while the comparison uses separately supplied commit references.
- **Compared with main:** this instruction is new.
- **Exact fix:** (1) replace “TOP row” with selection by the intended deployment’s recorded source commit; (2) compare that **selected deployment’s** commit with the approved merge; (3) if they differ in content, use a deployment built from the approved merge; (4) verify the resulting Production deployment’s identity and successful completion. Preserve the existing owner-approval requirement.

This is an unsafe instruction found by reading; I did not perform a deployment.

**F2 — Low: the notes overstate what the unchanged crew list predicts.**

Locations: [engine-rules.md:337](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/engine-rules.md:337), [blankabsence.test.ts:429](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/blankabsence.test.ts:429).

- **Concrete case:** give an otherwise idle Vandal whole-day Training on Tuesday. Add a blank flying line and arm its front seat. Training is an activity, so `isAway` excludes it; the activity-conflict check requires usable seat hours. The crew-list question therefore returns no conflict reason. Placing him raises **“Training clashes with this line.”**
- **Expected under the documented build decisions:** this difference is allowed because the picker deliberately remains unchanged. The statement “no man the list flags was offered clean” must therefore be restricted to the absence types actually tested.
- **Cause:** `avail.ts:479` filters through `isAway`; its activity check is inside the timed-window guard at line 578. The new test’s before/after loop checks only eight leave/medical/OD types at line 439.
- **Compared with main:** the picker is unchanged. The post-placement warning on the blank line is new and intended.
- **Exact fix:** (1) narrow the documentation and test comment to their tested absence types; (2) explicitly describe whole-day activities as another possible before/after difference; (3) add a focused Training case asserting no pre-drop conflict reason and the expected post-placement warning. Do not change the picker under this correction.

This is a source-traced documentation mismatch, not a recommendation to broaden this build.

**3. Absences against the two roll-calls**

| Roll-call group | Read result |
|---|---|
| Flying seats; SC MAIN/SPARE | Connected through `fly`, `events` and `forms`; no missing collector found. |
| AVALON/BB front/rear, MAIN/SPARE and independently templated desks | Connected through `sacrew` or `blank`, retaining the desk’s ATT B exception. |
| Ordinary/SC-linked desks and extras | Connected through the shared row collector. |
| OFT/AMT front/rear, passengers and extras | Connected through the sim collector. Free-text `who` is excluded. |
| Ground, request-derived and Common Programme rows, including extras | Connected; the blank request row excludes only its own source input. |
| Cancelled/info-only assignments and placeholders | Excluded before the applicable collection. No new missing exclusion found. |
| Week/Board lists, ordinary and exempt pucks, drop toast | Existing shared warning readers receive the new codes and keys. |
| Published face, version look, hides, pending/sign-offs and Insights | Existing frozen/working routes remain connected. |
| Crew list and drag prediction | Connected, with F2’s qualification and the already-filed empty-formation limitation. |
| Logic, exports and next-week peek | Logic states the rule. Dedicated exports and peek intentionally lack warning furniture. |

The supplied evidence has these remaining limits:

- **Gate receipts are absent:** the evidence sheet claims every gate is green, but its “The gates” section is still a placeholder. Its independent-read section is also unfinished. I cannot verify those completion claims.
- **Publication orders are incomplete:** walker D records six filing orders and six lifting orders. The designer requested twelve of each, including orders with actions after the amendment.
- **ALL AVAIL warning inspection remains unproven:** S29 excluded the person from the crowd. That demonstrates filtering, not the window’s rendering of this warning.
- Physical iPhone, several phone scenarios, specified drag bubbles, rendered-page print preview, and the complete reversal/action-pair matrix remain unwalked as disclosed.
- The unit oracle represents AVALON with BB fixtures and AMT with OFT fixtures. Their additional coverage comes from the reported walk, not that unit table.
- No dedicated coverage was identified for Upchit’s official/cross-week exclusion or an accepted custom whole-day request through the complete published/moved/re-landed sequence.

The highest-value remaining scenarios are:

| Priority | Setup and action | Expected; observation disproving correctness |
|---|---|---|
| High | Publish an accepted `00:00–23:59` Training request alongside a blank assignment; move or take off the request, then amend. | Working warning follows the edit; issued warning stays frozen until amendment. Early disappearance or duplicate warning disproves it. |
| High | Run a missing order such as **seat → publish → amend → file absence**, then its lifting equivalent. | The final input change remains pending after that amendment. A changed issued face or retained sign-offs disproves it. |
| Medium | Blank BB/AVALON desk: switch the occupant’s whole-day ATT B to OL, then undo and restore. | ATT B remains allowed; OL flags the desk and its own puck. A cockpit exemption copied onto the desk, or a stale ring, disproves it. |

Roles and overlays remain coverage qualifications: the supplied walk includes admin/member/guest faces, but I did not independently operate their gestures or inspect every combination of selection, SANS stripe, qualification chip, amendment tag and OIL marking.

**4. The eight claims**

References below are to the current source.

| Claim | Assessment |
|---|---|
| **1. Timed seats unchanged except Upchit** | **Does not hold literally.** `validate.ts:845–863`, `:919` and `:959` also change unnamed timed-seat wording. That is deliberate and documented. I found no additional timed-window arithmetic change. Upchit’s removal also correctly removes it from brief/debrief input checks; rest and long-day paths already exclude it through their existing type rules. |
| **2. Every unmeasurable seat collected correctly** | **Holds by source inspection.** `events.ts:303`, `:404`, `:449`, `:465` cover the four new collection sites; flying/SC seats retain their existing collections. The branches prevent a newly collected blank row also becoming its timed event. |
| **3. `day.whole` and undeferred reading** | **Holds by source inspection.** `events.ts:22–85`, `:97`, `:500–501`: marker exclusions, dormancy, frozen filing, this-date selection and own-source exclusion are preserved. Timed seats retain the deferred `day.input` route. |
| **4. Exemptions and words** | **Holds for the covered absence rules.** `validate.ts:848–959` and `:1276–1285` retain the type gates: ATT B may work ordinary rows/exempt desks; standby places use `canSpare`; SC MAIN Meeting stays amber without an invented clock. Existing other-sentence wording defects remain excluded as instructed. |
| **5. Blank rows do not acquire occupied hours** | **Holds.** `events.ts:272–540` keeps `blank` separate. Clash/busy/rest/work-hour consumers continue reading events or their existing input lists. `insights.ts:21–55` still derives hours from issued events. Existing partial flying-line rest behavior is unchanged. |
| **6. Published-day freeze** | **Holds by source inspection.** `publish.ts:550–555` stores the warning slice; `validate.ts:110` excludes these absence codes from live warnings; `:1631–1675` restores frozen warnings. The two new publication tests at `latepub.test.tsx:901–925` exercise initial publication and later filing. |
| **7. SC crew-rest prediction** | **Holds in the reviewed paths.** `validate.ts:1997–2058` adds shift siblings, rejects exempt targets, preserves source-seat removal/held-seat exclusion and invokes the existing evaluator in both directions. Shift ends retain no debrief pad. |
| **8. Tests prove every stated claim** | **Does not hold as complete proof.** The explicit oracle at `blankabsence.test.ts:176–205` matches `INPUT_META` and is stronger than before/after equality. The older changed pins preserve meaningful negative controls. However, F2 and the coverage gaps above remain. Also, `blankabsence.spec.ts:92` checks that *some* box-shadow exists, not that a visible red warning ring is painted. |

For the browser assertion, strengthen the check to verify the expected warning colour and nonzero visible ring geometry; a transparent or unrelated shadow must fail.

**5. The two meaning reads**

- **D605: PASS on meaning.** The short line preserves whole-day scope, immediate flagging and part-day silence. Readings (6) and (7) distinguish the builder’s broader activity interpretation from the owner’s words and accurately retain the unchanged picker. `[BLANK-STANDBY-STRIKE]` is now filed. F2 concerns the additional universal claim in the implementation notes.
- **“VERCEL CAN MISS A MERGE”: CHANGES REQUIRED.** F1 must be corrected. The surrounding requirement for explicit “merge live” and subsequent Production verification remains consistent with shipping guidance.

**6. Explicit negatives and limits**

I checked the collection branches, type matrix, source-request exclusion, frozen warning selection, downstream event consumers and SC prediction changes and found **no additional scheduler defect**. I found no new permission, persistence-schema or OIL-calculation change. I did not re-report the explicitly excluded findings.

I read the changed application/test code, the named review material and relevant callers. I did not read any file ending in `-read-sol.md`, inspect every screenshot, audit every unchanged writer, fetch remote refs, build, start a server or modify repository files.

**Checks:** the permitted focused test was attempted with caching disabled, but the read-only environment refused its temporary directory. **Zero tests ran.**  
**Walk:** not run; supplied walk results were reviewed as reported evidence.  
**Confidence:** reasonably strong in the source conclusions; runtime and full-gate completion remain unverified.  
**Rulings:** none this session.

