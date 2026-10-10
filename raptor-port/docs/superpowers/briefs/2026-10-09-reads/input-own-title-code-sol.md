1. **A shared filing’s history can show one person’s title as everybody’s title.**

   **Reproduction:** File “Sports day” for two people. Change one person’s hours through the board, separating that record from the shared entry. Open that person’s input and rename it “Open house”. In Changes → Group by Item, the original filing remains one historical item, but its heading takes the title of the first stored record: “Input · Open house · 2 people” or “Input · Sports day · 2 people”.

   **Cause:** [changesmodel.ts:124](/C:/Users/User/projects/Raptor/raptor-port/src/ui/changesmodel.ts:124), `inputItem`, selects the first record with the original group ID. Equal group IDs no longer guarantee equal titles: `entriesOf` correctly separates records whose shared fields differ.

   **Evidence:** An isolated, in-memory execution of the production heading function produced both headings merely by reversing record order.

   **Exact fix:** Keep D663’s historical group identity and count. Derive the heading from the distinct current `inpLabel` values of its surviving records, in deterministic order. When those names differ, show both rather than assigning the first record’s name to everybody. Add a regression covering the split, retitle and reversed record order.

   **New with this change:** the historical grouping predates it; substituting one arbitrary current title introduces this failure.

2. **Some availability and earned-leave explanations still omit the input’s title.**

   **Reproduction:**
   - File a Saturday Event titled “Sports day” and answer No to OIL. Its off puck says “answered No for this Event”.
   - File the same titled Event for ALL AVAIL and answer No. The window’s hint and individual puck explanations call it “this Event”.
   - Cancel its landed row. The explanation calls it “his Event’s row”.
   - File an OD titled “Exercise Darwin”, with empty remarks. The crew picker’s refusal says only “overseas duty (OD)”.

   **Cause:** [oilmode.ts:268](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:268), `oilOffReason`, and the related `oilHeldClaimHint` and `inertWhy` read the evidence’s `type` directly. [inputs.ts:424](/C:/Users/User/projects/Raptor/raptor-port/src/engine/inputs.ts:424), `offWord`, likewise never reads `inpLabel`.

   **Exact fix:** Resolve the input’s display name separately from the OIL calculation. For the OIL explanations, use the input in the installed day’s world through `inputOn`; use the landed row’s recorded name when necessary, then the existing kind fallback. Use `inpLabel` in `offWord`, retaining the kind and absence explanation where needed. **Do not add the title to the OIL comparison or pricing key.** Kind-only explanations of a rule, such as `oilNoAskWhy`, should remain kind-based.

   Add titled cases for named-person No/unanswered states, placeholder No/unanswered states, cancelled rows, availability refusals and issued-version reads.

   **New omissions:** these older functions also produce the wrong naming for newly filed titled inputs; D56 does not exclude them.

3. **Handing a titled input to another person records its kind instead of its name.**

   **Reproduction:** File an Event titled “Sports day”, then reassign it through the existing puck hand-over. The saved title survives, but the history line reads “Event … · whose”, rather than “Sports day … · whose”.

   **Cause:** [changelines.ts:124](/C:/Users/User/projects/Raptor/raptor-port/src/state/changelines.ts:124), `inputLines`, still uses `b.type` in the person-change sentence.

   **Exact fix:** Use `inpLabel(b)` in that sentence. Keep `itype` and the separate kind-change line unchanged. Add a hand-over test asserting both preservation of the saved title and the history’s wording.

   **New omission:** the existing hand-over writer was missed by the title naming sweep.

4. **The documented shared-entry definitions omit the title.**

   **Concrete discrepancy:** Two records with the same group ID and different titles are separate entries in production and in the new tests. The exhaustive shared-field definitions in [data-schema.md:167](/C:/Users/User/projects/Raptor/raptor-port/docs/data-schema.md:167) and [data-model.md:570](/C:/Users/User/projects/Raptor/raptor-port/docs/data-model.md:570) still describe them as one entry.

   **Exact fix:** Add `title` to both shared-entry definitions and to the corresponding server uniqueness condition in the data model, matching `SHARED_FIELDS` and `groupBreach`.

   **New documentation omission:** the new field’s own row says it is shared, but the detailed definitions were not updated consistently.

**Explicit negatives — what I traced and found sound**

These are conclusions from reading, except for the isolated function executions described above.

| Object or surface | Required sign and working door | Result |
|---|---|---|
| Ten eligible kinds | Title in the window, List form and pencil editor | The predicate includes exactly the ten intended kinds. Leave, medical, upchit and SANS remain excluded. |
| Title editing | Default follows the kind; an emptied box stays empty | The `null` versus string distinction is carried through the editors. Eligible retypes retain typed text; excluded retypes clear it. |
| Ordinary input writes | Save, in-place times/remarks, re-date and reassign | Production callers seed `draftOf`. `commitInputEdit` preserves a title when a hand-made draft omits the field; explicit clearing removes it. |
| Shared input writes | One title saved for kept and added people; one Undo | Title participates in the shared fields and change detection. Removal and regrouping do not require a second title store. The latest live List code also resets the title after a successful shared add. |
| Medical and posting paths | Splits/trims retain the remaining record correctly | Copies preserve unrelated fields; excluded-kind saves drop titles. Posting trims change dates and remarks without rebuilding the title away. |
| Persistence and restore | Reload, Undo and Redo retain the record | Input records are stored and restored as complete record images; the new field is not filtered out. |
| Calendar and List | Name on desktop bars, day cards and rows; search finds it | Title reaches the month and opened-day searches. Remarks remain independently visible. Kind filters still use the kind. |
| Schedule, board and peek | Title on the landed row; small kind outside the editable name | The kind label is a sibling of the editable text. It cannot enter `txtSet` through the name’s `textContent`. The board wrapper occupies the original name cell, preserving child positions. |
| Published records | Frozen name and kind; one pending input change | The full input snapshot carries the title. `inpDetailKey` detects title-only and capitals-only changes. Pairing and folding combine the input and its rebuilt row into one item. Published sign-off binding includes that difference. |
| Version and working-copy overlays | Issued previews retain issued words; working copies reconcile current inputs | The issued rendering installs frozen inputs; row kind labels read the row’s recorded fields. The ALL AVAIL heading reads the installed landed row, avoiding a live-title leak. |
| Event identity and downstream figures | Distinct requests remain distinct; one request’s repeated seat/extras remains one timed event | The request-row test works in either arrival order, including against a hand-typed row. Hand-typed twins retain the settled old rule. Work hours and crew rest use occupied boundaries, not summed duplicate event durations; OIL uses its separate item-based calculation. Blank rows do not acquire new numeric work from this change. |
| Warnings and midnight copies | Input title in warning sentences; kind controls severity | `mapInp` carries the title into ordinary, whole-day and neighbouring-day copies. Source-kind grading remains independent of title words, including the recorded-kind fallback after deletion. |
| Roles and export | Existing edit rights; distinct Type and Title columns | Title uses the existing input permissions. Read-only controls remain inert. Export keeps kind and display name separate and applies the existing text protections. |

**Scenario ranking and test gaps**

I started with the specialised history and OIL surfaces, then traced hand-over, record writers, published versions, event ordering and shared rendering.

The remaining failures are in combinations the title tests do not exercise: a historical group whose current records have different titles, titled OIL explanations, and a titled hand-over history line. Their existing tests can remain green while those routes are wrong. The forty caught break tests establish coverage of the wires selected for mutation; they do not establish coverage of these omitted callers.

One new pencil-editor test also overclaims: [inputtitle.test.tsx:319](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputtitle.test.tsx:319) says it checks retyping to leave and saving without a title, but it selects Duty and Personal, then stops without saving. Extend it to select LL, assert the Title box disappears, save, and assert the stored title is absent. That is a test gap; I did not find the corresponding production retype path broken.

The restated “Other” tests reflect D716’s changed requirement and retain meaningful assertions about the landed name, remarks and source kind. I found no weakening in those restatements.

I reviewed the latest live code, including changes made during this read. I changed no files and opened no reader report. I ran only in-memory calls of extracted production functions; I did not rerun the suite, build, browser walk or gates.

Walk: code read only; the host’s recorded app-walk evidence was read, not repeated.

Rulings: none this session.

VERDICT: CHANGES REQUIRED