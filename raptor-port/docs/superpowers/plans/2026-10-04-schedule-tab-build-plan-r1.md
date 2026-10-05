# Schedule text Tab route — implementation and independent scenarios

**DRAFT — Astra authored, 4 Oct 2026. Not self-approved.** Product scope is D550–D555.
Implementation is gated on Sol's independent plan challenge and the owner's look at the
complete numbered week/Board route pictures requested after D555. The earlier A/B picture
settled B; it does not stand in for these new pictures. No source changes or runtime proof
are claimed by this document. Branch `codex/workflow-ui`; planning entry
`ea1ca8dab2b313e57e732527ed37716783b53fd0`, with subsequent host-owned ruling/spec filing.

## 1. Authority and unchanged behaviour

- D554: Callsign → Mission → Brief → Take-off → Landing → Remarks/stores; reverse
  Shift+Tab. Week shared flight details once, then each aircraft's Remarks/stores; Board
  each displayed aircraft row, including its repeated flight boxes. Area/time afterwards.
- D555: available headings, in-time/Rally lines, notes and sections in their displayed
  order. No fixed section order; no deduplication of separate displayed input echoes.
- D550/D551: Edit Schedule week and Board only; available empty typing boxes count.
  No opening closed editors, sections or popups. Buttons, selects, crew and suggestions
  are skipped between text boxes. A text field with a click picker receives focus only.
- D553: after the day's last box leave text entry for the next ordinary control, without
  looping or changing day. Reverse entry exits symmetrically to the preceding ordinary
  control. The owner's numbered pictures must show the actual boundary examples.
- Keep Enter commit, Escape restore, Shift+Enter behaviour and D529 unchanged-Remarks
  silence. No extra save, amendment, Undo step or role question for plain traversal.
- Keep D487 button dimensions, D546 deferrals, D547/D548 leave-it choices and D549 accepted
  phone Desktop Board repair. No engine/rule/schema/style redesign or new dependency.
- D496: Sol challenges then implements; a fresh independent Astra reads final code after
  gates and walk. Claude's plan/code/scenario and independent app reads remain OWED after
  Monday 5 Oct 2026, 19:00 Singapore, before main. No merge, main push or merging PR.

## 2. Smallest architecture

Add one small `src/ui/schedule-tab.ts` helper, called at the start of `routeKeyDown` in
`textedit.ts` for an unmodified Tab or Shift+Tab. Return whether it handled the event;
leave all existing key branches untouched. Ignore prevented events, composition, and
Ctrl/Alt/Meta combinations. Do not install per-cell listeners or positive tabindex values.

The existing builders already emit B in DOM order. Collect on demand from the current
day's current active editor, filter eligibility, then choose adjacent index. Do not sort
by rectangles, model index, text value, section name or field name. No persistent field
cache, mutation observer, dense React conversion or new builder attributes are needed.

Scope discovery must require the actual focused eligible text node, current Edit Schedule
page and current central edit permission/mode. Board open wins: scope is visible `#sbBoard`
for `SBDAY`; never the mounted week behind it. Otherwise scope is the ancestor live
`#eWeek > .day[data-day]` of that field, with a real live day index. Exclude protected weeks,
DPREV/`.pv-frozen`, OIL readonly mode, next-week peek and another day. Re-check context
after any commit capable of changing it; never retain a future focus request across
page/week/day/session/role changes. Reuse existing central guards, not new permission policy.

Candidate attributes:

| Week | Board |
|---|---|
| `[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]` | `[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]` |

An eligible candidate is itself an enabled non-readonly text input/textarea, or the
explicit editable owner of a contenteditable field; it is connected to that scope and
rendered (not hidden, inert, display:none or visibility:hidden through an ancestor).
Use the existing known field attributes and explicit editable state, not every input on
the page. Empty content, placeholder text and cancellation/fade styling do not exclude an
otherwise editable box. Being below the viewport in its scroll area does not exclude it.
Use visibility checks at the key gesture only; batch reads before focus writes. Do not
mistake jsdom's zero rectangles for real-browser visibility evidence.

Exclude readonly `[data-role-remarks]`, `[data-role-ui]`, selects such as Board wave title,
suggested Brief text/acceptance, store chips and C, pucks, picker/dialog controls, date/search
chrome and button-shaped input labels. Keep their ordinary keyboard access outside this
text-to-text route. Focus must never synthesize click, select or activation.

## 3. Actual field and section map for pictures and tests

Sections are `.dsec[data-secmove]` within the week day and `.sb-sec[data-secmove]`
within Board. Their DOM order is already `secOrder(d)`. Number the complete captured day
continuously, with section headings and readable crops; a repeated row must carry its
own numbers. Retain every stop in a machine-readable annotation manifest for review.

| Section / visual grouping | Week fields in order | Board fields / differences |
|---|---|---|
| Overall notes | `dn:di.ni` first inside `prog` | separate `notes`, `.sb-nrow`, `data-bfld=dn:di.ni` |
| Common Programme (`prog`) | `.ah-row`: `ap:di.ri.prog`, `.sub`, `.str`, `.end`, `.rmks`; then `pn:di` | `.sb-arow`: Item, Start, End, Rmks; no Detail/location `.sub` box; then `pn:di` |
| Flying (`waves`) heading | `wl:di.gi` then each `data-itline=di\|gi\|ix` | wave title is a SELECT and skipped; in-time lines included |
| Ordinary flying formation | `.form`: `ff:di.gi.li.cs/msn/br/to/ld`, each `.rmkcell` `fr:di.gi.li.ai` then `data-bombs`; `.form-area` Area then time | `.sb-line[data-move]`: same five fields then own Remarks/stores; repeat next aircraft including flight fields; `.sb-area` after formation |
| Standalone flying | existing available CS, Mission, Take-off, Landing, Remarks; absent Brief/stores/footer are not invented | follow only rendered eligible boxes in each existing row; skip hidden/disabled standalone cells and role controls |
| Duties (`duty`) | `dl:di.wi` heading; each `.pl-row` Role, Start, End, Rmks (`dr:`); `dtn:di` | `.sb-psub` heading; `.sb-arow.c6r` same order; focus Role without opening its picker; section note last |
| Sims (`sims`) | AMT/OFT displayed groups; each `.pl-row` Item, Start, End, Rmks (`sr:`); `sn:di` | `.sb-panel.simr`, `.sb-arow.c6r`; same available text order; crew/passenger seats skipped |
| Ground (`ground`) | displayed `groundOrder`: Item, Start, End, Rmks (`gr:`); `gn:di`; input-backed fields use `data-inp` | `.sb-panel.grnd`, `.sb-arow.c6r`; schedule `data-bfld`, input-backed `data-ifld` |
| Personal Inputs (`inputs`) | already-open rows: input Start, End, Remarks (`data-inp`) | `.sb-panel.pinp` open rows: `data-ifld` Start, End, Remarks; displayed echoes remain separate |
| Available crew (`avail`) | no current typing boxes | no current typing boxes; crew controls skipped |
| SANS (`sans`) | cards open a separate editor, so no text stop | `.sb-panel.sansav` cards likewise skipped |
| Unavailable (`unav`) | existing input Start, End, Remarks when editable | `.sb-panel.unav` input Start, End, Remarks when editable |

Static titles (including AMT/OFT), Scheduler/Public toggles and section grips are not typing
boxes. Notes retain their actual positions, including an empty available notes box in a
section without rows. Phone wrapping preserves logical order; it does not create a new row.

Picture preparation uses ordinary controls to open Edit Schedule, the day's Board, and
the Personal Inputs `[data-pitog]` header for an explicitly labelled expanded example.
Tab must not perform that expansion. Show both an expanded route and the folded skip.
Scroll each real container to the section before capture; do not reposition app fields
for annotations. Capture week/Board desktop and phone, plus accepted Board Desktop mode
on phone where the arrangement differs. Use existing app controls to add a missing row
kind only in the disposable local demo fixture, and label any absent kind as not pictured.

Primary source anchors: `html.ts` 1623–1652, 1667–1807, 1812–2021, 2060–2086;
`board.ts` 168–185, 286–336, 359–393; `board-html.ts` 169–280, 411–445, 470–600,
685–719, 726–800. These are read findings, not future app proof.

## 4. Commit and focus lifecycle

1. Resolve scope, collection, source index and proposed destination before losing focus.
   Prevent default only for a supported navigation transition. Use native `focus()` to
   move to a text destination so the existing blur/change handlers save the old field.
   Never call `txtSet`, `boardChange` or `routeFocusOut` as a second synthetic save.
2. Week writes synchronously through the existing command funnels; `txtCommit` validates
   and delays repaint until editing ends. Preserve that split and its refusal healing.
   Board writes through its existing `change` listener and `afterSchedMutate` path.
3. Both render effects already guard `editingText()`. Extend its Board coverage to active
   `data-ifld` inputs/textareas if the failing mounted test confirms the missing guard;
   it currently recognizes `data-bfld` but omits `data-ifld`. Preserve the role-offer guard.
4. Clearing an in-time removes its DOM pair immediately. The remaining live line addresses
   must match their shifted model indices before the next focused line can save. Add the
   smallest local address repair in that deletion branch; do not rebuild under the caret.
   Preserve the pre-blur destination node where it remains connected, then re-collect and
   verify eligibility/context after blur. Never resolve a shifted line by its stale index.
5. Pin final repaint in a mounted test: Board writes can notify while a next field is focused,
   causing the effect to skip; later leaving an unchanged box must still paint saved
   dependent text. If confirmed, add a bounded UI-only deferred repaint/settling request
   for a real pending Board text change after text focus ends. Do not replay a mutation,
   add a history step, or run a second validation merely to paint. Cancel on context loss.
6. At the boundary choose the next/previous ordinarily tabbable non-text control in actual
   active-surface document order, excluding hidden UI and other days' typing boxes. Do not
   wrap to a control earlier in the order, invent Done as the target, activate a button, or
   enter the background week. Preserve the current day/scroll while focusing the ordinary
   boundary control; verify its actual identity and visibility on each captured layout.
   If a tested layout has no eligible ordinary boundary target, report that concrete case
   for resolution before implementing a made-up fallback or trapping Tab.
7. Changed Mission/Remarks may still offer a role after their normal save. Focus transfer
   must neither auto-answer nor suppress that question; the question must not steal the
   destination caret. Unchanged traversal remains silent. Never navigate inside role UI.

First try this direct, guarded path. A permanent focus registry or broad Board rendering
rewrite requires a reproduced failure that this path cannot solve and a challenged plan
revision. `textedit.ts` 31–43, 73–247, 249–355; `SchedBoard.tsx` 209–299;
`EditWeek.tsx` 100–118; `mission-role-offer.ts` 147–181 are the integration seams.

## 5. Independent risk tier and checks designed before implementation

**FULL**, conservatively applying the standing eight questions:

| Question | Answer and reason |
|---|---|
| Money/earned leave | YES: timing and input commits can change downstream work spans/entitlement; writers stay unchanged but the new gesture invokes them. |
| Published record | YES: blur writes affect pending amendments/history; issued snapshots must stay frozen. |
| Saved data | YES: edited text must persist through the existing command streams, including inputs. |
| Shared drawer | YES: shared text navigation across both dense editors and every existing text family. |
| New gesture | YES: Tab/Shift+Tab destination and boundaries change. |
| New surface | NO: existing fields/layout only. |
| Roles | YES: eligibility must respect edit permission, readonly modes and a session changing mid-edit. |
| Warnings | YES: saved times/remarks feed existing validation and role questions; no detector changes. |

Roll-call each table row above for both editors: Show = existing text only/no new mark;
Usable = YES when eligible, NO-because for readonly/absent/folded controls; Co-painted =
suggestion, amendment/history mark, warning, placeholder, store flash or role offer as
applicable. No blank cells. Cover scheduler/admin roles with editing authority and member,
guest, issued/draft preview and OIL mode exclusions; record actual reachable roles, never
claim an absent demo role was walked. Stale permission changes get focused route tests.

Failing-first named checks, using real mounted events where commit behaviour matters:

| Check | Required assertion and existing home to extend |
|---|---|
| TAB01 B and reverse | Each editor's full ordered available collection, every text family, two aircraft, empty fields; week/Board native Tab progression. New `schedule-tab.test.tsx` plus browser spec. |
| TAB02 boundaries | First/last exits, no loop, correct current day, no hidden-week focus, no activation; empty/one-field day and reordered last section. Browser required. |
| TAB03 eligibility | readonly/disabled/hidden/folded/peek/popup/role UI excluded; cancelled-but-editable fields retained; no picker click. Collector and mounted route tests. |
| TAB04 valid/refused saves | Valid schedule and input times/remarks save once; invalid/end-before-start heals and continues without false save/history. `textedit.test.tsx`, `boardwrap.test.tsx`, input route tests. |
| TAB05 no-op | No history/Undo/amendment/opts initialization; derived Area/time keeps following TO/LD; folded in-time text/all-day input stays unchanged. `editlog-writers.test.tsx`, `stsaved.test.tsx`. |
| TAB06 deletion | Clear first/middle/last in-time, Tab and reverse into remaining neighbour, edit it, verify exact model line and Undo. `rally-feedback.test.tsx` plus mounted navigation regression. |
| TAB07 paint/caret | Changed Board field → input-owned field and reverse; rapid Tab twice; final unchanged blur paints dependent boxes; week/Board keep caret and scroll during unrelated notify. Mounted test and browser. |
| TAB08 role offer | No-op Remarks silence; changed Mission/Remarks saves first, question persists through unrelated edit, next caret stays; Later/Choose/Change preserve existing flow. Existing mission-role test files and browser. |
| TAB09 keys | Enter/Escape/Shift+Enter untouched in native and editable fields; modified Tab/composition remains untouched. Existing textedit/boardwrap tests. |
| TAB10 persistence/publish | Edit→Tab→Undo→Redo→reload; publish→edit→Tab and edit→Tab→publish; issued values unchanged until publish, amendment correct; input-derived downstream values observed. Real app controls. |
| TAB11 current state | Role/session/page/day change or deletion between events never writes/focuses a stale target; no late deferred focus steals a newly opened dialog. Mounted lifecycle test. |

Before building, pin unchanged Enter/Escape, D529 and the accepted phone repair on today's
behaviour. Tests must fail for the missing new route before the feature lands. Break the
week and Board integration once each and observe named tests fail, then restore the wire;
do not weaken assertions or alter engine/reference bodies to gain a pass.

## 6. Runtime evidence, proportionality and finish

After independent plan PASS and full-route picture look, Sol implements and runs focused
tests, then the required repository gates (unit, build, reference, browser, Tracker,
rulecheck/docsize, required adapted probes and performance). Take/release the PC lock for
each heavy run. Use current shipping instructions for exact commands; no duplicate broad
run without a relevant change/failure. Freeze source/tests/driver/plan and prove the
production files served match that build before the qualifying walk.

Use the everything-day through app controls: ordinary two-aircraft flight plus standalone,
duty, both sim shapes, Common/Ground Programme and input-backed rows, notes, empty fields,
folded/open Personal Inputs, cancelled/info-only rows and real warnings/marks. Exercise
both traversal directions and each distinct writer/refusal/order. Pair Tab with edit,
Enter/Escape, reorder/fold, Undo/Redo and role offer in both meaningful orders. Prove save,
history, amendment and downstream timing/earned results once per distinct writer path.

D499: desktop full writer/lifecycle proof need not repeat only for width; every affected
section and both editor mechanisms must still be operated at desktop and phone, with
wrapped rows and phone Desktop Board mode explicitly checked. Short phone/landscape and
700px desktop height verify the focused box/boundary stays reachable. Inspect actual
focus, computed visibility, scroll and hit target; not only class or value. Selected
distinct pictures show formation sequence, supporting/section transition, wrap, boundary,
refusal/role offer and repair preservation. Open every saved picture and retain failures.

List physical iPhone Safari/contenteditable keyboard behaviour as unproven by Chromium;
provide a short owner look card after internal proof. No claim that phone emulation proves
the device. Record exact roll-call, orders, gate counts, errors, omissions and dispositions
in a new handpass evidence sheet; existing repair evidence is historical, not a new walk.
Fresh Astra inspection receives the final frozen code, this plan, roll-call and evidence;
Sol resolves findings and re-walks affected paths. Claude's Monday reads remain OWED.
Update only the branch's handoff block, affected UI contracts and backlog; branch-only
commit/push after checks and review, with owner pictures/look status stated accurately.

Preparation: current executor, bug-check order including D499 addendum, performance Part 1,
relevant UI/feature-impact/command contracts and applicable rulings read. This document
describes future checks; none were executed for this draft. Rulings: D555 meaning checked.
