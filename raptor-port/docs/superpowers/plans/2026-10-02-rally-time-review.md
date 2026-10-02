# Rally time — independent Astra proposal/review record, 2 Oct 26

Author of responses below: delegated Astra; recorded by Sol host. Read-only runs, no app edits/tests. No approved implementation plan. D496 model split applies. Original structured-editor draft is an unapproved earlier proposal; its complete response is retained verbatim in `2026-10-02-rally-time-astra-original-draft.md`, with its impact concerns also preserved as an explicitly labelled host summary in the design note. The following is the revised response, preserved verbatim.

## Revised response after the owner's simpler-box proposal

The simpler box is viable and avoids introducing a separate timing editor or new stored structure. It is **not merely a rename** if “earliest” must work reliably: the current reader uses the first clock per line, the earliest unscoped line, but the **last matching formation-specific line**. Those rules can disagree.

This remains a proposed simplification. It does not withdraw D497’s chronology requirement or authorize building.

**Recommended minimal design**

Rename the existing block and add control to **In-time / Rally**. Keep its present editable lines and compact appearance. Show a small calculated explanation underneath, for example:

> Reporting starts 07:45 · Reaper, Saber
> An earlier commitment starts that person’s day sooner.

Demonstrate the three arrangements using the same box:

```text
08:00 Rally — WX + NOTAMs
```

```text
07:45 In-time, rally immediately after — WX + NOTAMs
```

```text
07:45 In-time
08:00 Rally — Reaper + Saber
```

Recommend **one operative clock per line**. Later clock times in prose must not accidentally become reporting instructions. The preview should reveal both the chosen time and whom it applies to before the user leaves the box.

**What still needs resolving**

- **Clock selection:** `events.ts:208` currently reads the first valid clock, not the earliest of every number. Reading every clock in arbitrary prose would allow a note such as “WX from 06:00” to move reporting earlier unintentionally.
- **Scope:** `events.ts:247` matches formation callsigns anywhere in the text. A line naming none becomes a wave-wide fallback; a specific line overrides it regardless of which time is earlier. Repeated specific lines currently use the last one. The new meaning must resolve these cases deliberately.
- **Overnight:** choose the earliest *actual time*, not the smallest clock number. For a 01:00 flight, 23:00 the previous evening is earlier than 00:15. Existing limited midnight conversion at `events.ts:275` occurs after current line selection; simply inserting `Math.min` would be insufficient.
- **Chronology:** an earliest reporting time alone cannot prove “in-time → rally → brief → take-off → landing.” Preserving that requirement needs recognizable in-time/rally labels, even if both remain in the same box. A bare line can retain a clearly stated report-time meaning, but it cannot supply an invented rally stage.
- **Earlier commitments are per person:** work-hours already take the earliest start from that person’s scheduled events (`validate.ts:139`). Crew-rest checks also consider qualifying earlier timed inputs (`validate.ts:493–518`). They do not move everyone in the wave to one person’s earlier meeting.
- **The input distinction matters:** the work-hours span excludes personal inputs while crew-rest includes certain timed work inputs. “Unless another event is earlier” should preserve those established definitions, not silently count leave or all-day records as work.

**Revised impact and safety recommendation**

Retain the shared instructed-report route through `seatIntime` and its event/availability callers. Update the relevant clock resolution and labels; keep the rest of the original impact map as a verification checklist rather than assuming every listed file needs editing.

The affected outcomes remain work-hours/Insights, long-day warnings, crew rest, SANS availability, wave availability bands and cross-week checks. Preserve:

- Insights’ latest-issued-copy rule.
- Existing nominal-report and step-time distinctions.
- SC’s separate interpretation and late-show behaviour.
- Publishing, pending marks, signature invalidation, Undo and saved-plan round trips.
- **Earned leave:** `oil.ts:219` uses the nominal reporting lead, not the current in-time reader. This proposal must not silently change OIL.

Using the existing string field avoids a new saved-data format. Nevertheless, changing its interpretation affects old **and newly written** schedules. Do not silently reinterpret ambiguous existing text or claim this is only a disposable-demo-data issue.

The minimal mock should show three normal examples, one formation-specific example and one invalid/overnight example. It need not implement a new timing table.

**Four product questions**

1. **“Can each line contain one reporting clock, with the wording after it explaining the activity?”**
   Recommended: yes—e.g. `07:45 In-time` and `08:00 Rally`. This keeps notes from accidentally changing the calculation.
2. **“If the whole wave has an 08:00 in-time and Reaper has a 09:00 rally, should Reaper still start at 08:00?”**
   Recommended: yes—the earlier instruction applying to Reaper wins. This changes today’s specific-line override, so it needs an explicit answer.
3. **“When the times run backwards, should the draft remain editable but publishing be stopped?”**
   Recommended: yes, with the exact incorrect pair identified. The chronology requirement stands; this question settles enforcement.
4. **“For overnight flying, should a time explicitly say ‘previous day’ when needed?”**
   Recommended: yes, with a visible interpreted sequence. Do not guess the date merely to make a bad sequence pass.

Equality between stages and omitted-step handling remain unresolved for the next round; equal take-off/landing is already governed by D49 and should not be re-asked.

The **complete previous draft remains in my immediately preceding full plan response**. Preserve that response verbatim as the earlier, more structured proposal, followed by this revision; do not replace it with a reconstructed “original.” Its impact map remains useful, while its new structured-storage recommendation is superseded at the proposal level by this simpler direction.

No edits or tests performed. Rulings: none added.

## Generated-ruling and mock source read — complete response

**D498 meaning check passes.** The generated short line says “ASSESS,” and its full row explicitly retains proposal status, unanswered scope/grammar/midnight/enforcement questions, and unchanged earned-leave rules. D497 also retains its unapproved-design caveats.

One material mock-up defect:

- **Accepted `INTIME` becomes the wrong activity.** The parser accepts `08:15 INTIME`, but normalisation only replaces a hyphen. The result remains `INTIME`, rather than `IN TIME`; it displays as Rally and is excluded from the in-time chronology check.
- **Consequence:** `08:15 INTIME` followed by `08:00 RALLY` can say the order is valid and enable the demonstration’s publish button.
- **Fix:** normalise every accepted `IN TIME` / `IN-TIME` / `INTIME` spelling to one activity value before rendering and validation.

Otherwise, the source reflects the simpler proposal: the box remains text-based, the demo explicitly says whole wave, remarks after `|` are not parsed, overnight dates are explicit, and Saber’s earlier event affects his displayed day start separately. “Proposed design” and “proposed publish block” distinguish it from an approved app change.

Limits: source read only; no browser rendering or interaction testing. Equality, mandatory reporting time and publication blocking remain prototype assumptions—not settled rules. Its calculations provide no evidence that the real app’s downstream consumers work.

No edits. Rulings: none added.

## Host disposition

Fixed the normalisation in the mock only and verified all three spellings with the same reversed-order assertion. The lightweight mock browser results are in the design note. The follow-up source read below confirmed the mock fix; this is not a final real-app inspection. The earlier full draft has been retained verbatim, separate from the host summary.

## Final source and design-note read — complete Astra response

The mock’s `INTIME` defect is fixed in the source: every accepted in-time spelling now becomes `IN TIME` before validation and display. Its proposal labels and the design note preserve the whole-wave-only scope, unresolved choices and lack of app-build approval. I did not rerun the browser checks.

One documentation correction remains: the impact map points to three wrong locations. Use:

- `src/engine/insights.ts`, not `src/ui/insights.ts`
- `src/engine/publish.ts`, not `src/state/publish.ts`
- `src/engine/editlog.ts`, not `src/command/editlog.ts`

These references otherwise send the next implementer to the wrong modules.

The complete original draft response is archived verbatim, with an added author/status header, in [rally-astra-original-draft.md](C:/Users/User/.codex/visualizations/2026/10/02/01a0fab0-9850-7130-8da0-de797da4a3ba/rally-astra-original-draft.md). Nothing from that response was excluded.

No repository edits or tests. Rulings: none added.

Host disposition: verified the three engine module paths and corrected the design note. Preserved the original full draft on the planning branch. No app implementation or ownership choices were approved by these reads.
## D500 formation clarification — complete independent Astra read

**D500 short/full meaning read: passes.** It preserves existing own-wave callsign recognition and free text, without approving a new parser or changing specific-over-wide precedence.

**Sol-authored clarification: no material findings.** The legacy VL example is correctly described. The engine rule preserves the existing fallback; the spec keeps dual-stage precedence, mandatory grammar and publication enforcement undecided. The reported 18 passing tests are clearly limited to the existing reader, not Rally implementation or a full app walk.

I am not approving my own copied scope paragraph. I did not rerun or observe the tests.

No edits. Rulings: none added by this agent.

Host disposition: preserved the existing production callsign reader and accepted free text; no source/test edits. The mock remains an explicitly limited whole-wave demonstration, not proof of flight-specific parsing. Existing focused in-time suite 18/18 passed. Future Rally dual-stage calculations and enforcement still require product choices and an independently challenged implementation plan.
## D501–D502 answers — complete independent Astra read

**D138 meaning read: passes.** D501/D502’s short/full pairs and D497/D498’s narrowed status preserve the owner’s answers:

- One operative clock per line is approved; legacy free text remains, with no mandatory separator.
- Editing feedback, saveable drafts and publication blocking are approved.
- Specific-over-wide precedence remains unchanged and unresolved for the proposed dual-stage calculation.
- Broader overnight inference remains unanswered.

**Sol’s clarification: no material findings.** It explicitly exposes whole-line callsign matching, including names in remarks, and does not promise semantic understanding or ignore those matches. Existing overnight recognition is described as separately bounded for report and brief. No equality, blank-B or implementation approval is inferred.

I did not approve my own earlier proposals or rerun tests. The prior 18-test result is correctly labelled historical evidence.

No edits. Rulings: none added by this agent.

Host disposition: two accepted product directions recorded, older tentative statuses narrowed in the same change, and existing recognition preserved. The one overnight question remains pending; no time elapsed is taken as an answer. No Rally app build started or mock parser represented as application behaviour. The publication block concerns the agreed incorrect timing order, not a blanket block for every existing advisory. Equal take-off/landing retains D49 pending no new contrary ruling.