**1. Findings**

**REVISE: two gaps remain in F2’s question-lifetime promise.** These are source-traced failures, not browser reproductions. No files were changed, and no builds or tests were run.

**P2 — Editing another formation’s cue replaces the question already open.**

**Steps:** Enable Blue/Red tracking. In Edit Schedule or the Scheduler Board, give formation A an ordinary Mission such as ACM and enter `DS FOR EAGLE` in Remarks. Leave A’s question unanswered. On the same day, enter `DS FOR VIPER` in formation B’s Remarks and leave that field.

**Expected:** Under D535, A’s question stays until one of its specified dismissal conditions occurs. Editing B changes neither A’s Mission nor A’s cue. D523 also prohibits opening several questions together.

**Actual and cause:** The deferred edit handler unconditionally opens B’s question at [mission-role-offer.ts:160](/C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/mission-role-offer.ts:160). Opening it calls `clear()` at [line 97](/C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/mission-role-offer.ts:97), removing A’s question. The structural-edit offer at line 184 has the same bypass. The new reconciliation logic preserves A through ordinary edits, but these other callers can immediately replace it.

**Classification:** A gap left by `51f5ec51`, not a newly introduced defect. The automatic replacement path existed before the fix. Its added regression tests cover timing edits, not another formation becoming eligible for a question.

**Fix, step by step:**

1. Add a regression for the sequence above through both real editors. Assert that the remaining question names A, not merely that one question exists.
2. Route both automatic-offer callers through one arbitration function.
3. In that function, reconcile the existing question first. If it remains valid and belongs to another formation, retain it and suppress the new automatic offer.
4. Keep B’s saved wording and its later **Choose mission role** access. Do not queue a burst of questions.
5. Verify that changing A’s own cue still replaces its obsolete question, and answering A still writes only A’s role.

**Failure observation:** A’s question disappears and B’s name takes its place without answering or dismissing A.

**P2 — Moving between days within Edit Schedule leaves the old question active and can block another day’s Choose button.**

**Steps:** With tracking enabled, prepare unanswered conditional formations on Monday and Tuesday, using **Later** to leave them unresolved. On Monday, open a question through **Choose mission role**. Swipe to Tuesday within the same week, then focus Tuesday’s unchanged Remarks.

**Expected:** D535 dismisses Monday’s question when moving to another day. D529 then allows Tuesday’s temporary **Choose mission role** button.

**Actual and cause:** The question’s view identity includes the page, Board day, version previews and navigation counter, but not Edit Schedule’s visible day: [mission-roles.ts:78](/C:/Users/User/projects/Raptor-sbs/raptor-port/src/state/mission-roles.ts:78). Same-week navigation scrolls the week; its follow-up updates the crew-panel day without invalidating the question: [pan.ts:372](/C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/pan.ts:372). Consequently, Monday’s question still passes the current-target check. Focusing Tuesday’s Remarks reaches the early return at [mission-role-offer.ts:149](/C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/mission-role-offer.ts:149), so Tuesday gets no Choose button.

**Classification:** An older missing navigation connection left uncovered by `51f5ec51`’s implementation of D535. Board-day navigation has an invalidation counter; same-week Edit Schedule navigation does not.

**Fix, step by step:**

1. Add a browser regression for the phone swipe sequence, plus desktop day-arrow navigation and an away-and-back sequence.
2. Track actual Edit Schedule day transitions independently of the crew-panel selection, which can remain pinned.
3. When that visible day changes while the Board is closed, dismiss the offer and invalidate its queued callbacks. Connect both arrow navigation and completed manual scrolling/swiping.
4. Make current-target validation reject tokens captured before that transition, so an old button cannot remain usable.
5. Verify that vertical scrolling, same-day edits and unrelated crew-panel updates retain the question, while Tuesday’s unchanged Remarks immediately offers Choose.

**Failure observation:** Tuesday has no Choose button, and returning to Monday reveals its unanswered question still active.

**2. Explicit negatives**

These are inspection results only.

- **Published Board Remarks:** I checked the restored amendment attribute and its actual textarea styling; the AL outline and tooltip are connected, while the schedule-edit key remains absent.
- **Published-view boundaries:** I checked the latest-version, tracking, permission, cancellation and standalone guards; I found no unintended expansion of the editable Remarks route.
- **History on published previews:** I checked the missing history-cell address; frozen previews deliberately exclude history bubbles and dots, so this is not another F1 defect.
- **Ordinary unrelated edits:** I checked question reconciliation after timing and crew changes; it refreshes the target while retaining the same formation and context.
- **Stale answers:** I checked context, role revision, session, tracking, published-version identity and Undo invalidation; the refresh does not remove those answer-time protections.
- **Published Insights:** I checked the separate role writer and Insights reader; answers remain outside the signed programme, while Insights combines current answers with published wording.
- **Template-copy history:** I checked fresh template identities, the loaded formation-name lookup and the history subscriber; named destination formations receive their callsigns rather than hidden row identifiers.
- **Window dismissal:** I checked all thirteen changed callers: Day templates, document viewer, Plans, drawer, Duty templates, day details, Traffic, Insights, cancellation, Sort all, Flying waves, date picker and Input editor. Each calls the shared helper with its own surround identifier.
- **Drag versus click:** I checked capture-phase press recording and the helper’s comparison; an inside press followed by a surround click is rejected, while a normal surround press/click is accepted.
- **Other calendar overlays:** Their outside dismissal happens on pointer-down, so an inside-started drag does not encounter the repaired click-target failure.
- **Phone height:** I checked all five shared modal consumers and the stylesheet cascade; tall windows receive the dynamic-height limit, short windows retain content height, and desktop retains its separate limit.
- **Tests:** I read the added tests and found meaningful coverage of their stated cases. They do not cover either finding above or prove physical iPhone browser-bar behaviour.

**3. What I did not read, and why**

I did not open other checkouts, later Git history, or the other reviewers’ reports. I did not audit the entire underlying mission-mix feature, unrelated application areas, or historical-data migration behaviour.

**Isolation caveat:** My initial required memory-index lookup returned summaries including later work before I applied the brief’s checkout-only restriction. I excluded those summaries from the findings and opened no linked reports, but this run cannot claim perfect isolation from later-work metadata.

No runtime walk or physical-device verification was performed, consistent with the requested read-only review.

Rulings: none this session.

**4. Confidence:** Moderate that no serious defect remains beyond these findings; real-browser checks of both sequences, all dismissal gestures and iPhone viewport behaviour could change that assessment.

