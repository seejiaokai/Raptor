# Question 27, step 1: the draft words' examples checked against the app — the report (chat 204, S1; a fresh Opus helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-q27-words-check-brief.md`. Working copy `lw-balances-hover-275293`, branch
`claude/msq-s1-guard-6ae5e1`. Read only: no source or test file changed, nothing committed. Read: `ui/guard.ts` (whole),
`ui/guardnote.ts`, `state/guard.ts`, `state/store.ts` (the page door, `stepPage`, `enterSquadron`, `maybeReenter`),
`state/belltap.ts`, `state/inputsqn.ts`, `state/undo-wire.ts squadronRefusal` and its hooks, `undo/timeline.ts` hooks,
`ui/OilDayList.tsx`, `ui/Shell.tsx` (where the Undo pair shows), `ui/HolidaysPanel.tsx`, the Cancel buttons of
`UsersPanel`, `SquadronsPanel`, `EveryWeekday`, `InputsSettings`, `SansSettings`, `QualsPage`'s "Add qualification", the
K6 and K8 reports, the tests `msq-guard-doors-undo`, `msq-guard-doors-bell` B25, `msq-guard-input-sqn` F5, and the plan
§4.6 (`2026-11-25-msq-pick-guard-build1.md`).

## In one paragraph

Every Undo lead in item 4 and item 5 is **true** (each Cancel exists with that name in that state and adds no Undo step;
"clear the new qualification" is true only as "delete the typed words" — there is no Clear control) and **reachable**,
but only on one road: Saber (a master admin) makes a squadron with "+ New squadron", picks it, and presses Undo with the
thing open. **Items 1, 2 and 3 are reachable by no real press today** — the card's refusal and the page door's need the
OIL list or a press standing over a squadron that is not its own, which a pick and a bell line both prevent; a Redo has
no road at all (the plan §4.6 says the same of items 1–2: "No press of his reaches this ending after Build 1"). The words
would be true if reached. **One problem outside the words:** the Undo that takes the new squadron away goes through
`maybeReenter`, which never runs the guard's closing step — so the windows that only show things (ALL AVAIL, Changes,
Insights, a SANS day, the Leave War's day panel, the Tracker's four) stay open after the squadron changes, and Logic's
and Quals' edit modes stay on. Worth a failing test (below, P1).

## The one road an Undo refusal has (needed for every Undo item)

`squadronRefusal` (`state/undo-wire.ts`) refuses only on two rows:
- **row 21** — the Undo's own changes remove or change `unit:<squadron in view>`. Only `units.ts addUnit` writes that row,
  so it is the Undo of "+ New squadron" with that new squadron picked. Real presses: Saber (master admin — only a master
  admin makes squadrons) on Admin → Squadrons, "+ New squadron", 151, a first admin, Save; picks 151 in the Schedules
  menu (a master admin's every page follows the pick); opens the thing; presses Undo. The Undo pair is on Edit Schedule,
  the Leave War, Inputs, Quals and (for an admin) Admin and Logic (`ui/Shell.tsx pairOn`); on the Tracker the pair is the
  Tracker's own history and never meets this.
- **row 13** — the Undo's landing is a page the squadron in view does not offer. That is only a View-only pick, whose
  pages are View-only Sched and Help, which carry **no Undo pair** (`pairOn`). No keyboard Undo exists. So row 13 is a
  belt (K6 scenario 7, K8 B23 — the tests drive it by calling the engine, not a button).

**A consequence for Fable's examples:** for the Undo to be refused, the newest Undo step in view must still be
"+ New squadron". Anything Saber saved on 151 after making it would be on top, and Undo would take that back instead
(no refusal). So in real life 151 is brand new and empty — no leave period, no holidays, no people of its own — unless
another admin of 151 filled it meanwhile. This makes some states rare (noted per item).

How often: rare. A master admin making a squadron, picking it, starting something, then pressing Undo to take the
squadron back — a "made it by mistake" moment, once in a long while.

---

## Item 1 — the OIL list's card (door `card`): "Blocked: <lead>, then try again."

- **When it would happen:** Hunter (Plan of 149) has 142's OIL list up — "Wed 15 Jul is now a public holiday", one card
  an input — while 149 is in view, and a change failed to save on 142. He presses a card to open that input's window,
  which needs 142 brought back into view first.
- **The whole note:** "Blocked: press Retry to save your changes, then try again." (or "close the open window, …", "save
  or cancel the open row, …" — any lead but the OIL list's own, which the card leaves out).
- **What he pressed / what "again" presses:** the card's body (its name line) in the OIL list. "Again" = the same card.
- **True? Yes, if reached.** The card asks `enterForLine(inputSqn(r, pageUnit('own')), again, 'card', {skip:['oilday']})`
  (`ui/OilDayList.tsx openInput`), then `openInputOnPage(…, {door:'card'})`. After the lead's step the second press finds
  nothing open, enters 142, closes the show-only windows, sets Inputs, opens the window. The OIL list is still there to
  press: it is a `'window'` row, never closed by `closeShown`, and keeps its squadron (`o.unit`). Pinned for the two
  roads in `msq-guard-input-sqn` F5 and `msq-guard-doors-bell` B25.
- **Reachable by a real press? No.** Both roads need the OIL list standing over a squadron other than its own:
  (a) the card's entry refuses only when the list's squadron is not his own pages' squadron; (b) the page door refuses
  only under a View-only pick. But the list counts as an open window, so a pick is refused while it is up; a holiday's
  bell line enters its squadron before opening the list (`openNotice` → `enterForLine` then `ownSquadronFirst`); a saved
  holiday opens it on the holiday's own squadron (`leavewar/sync.ts tellHoliday`); a put-back and a sign-off box open it
  on the squadron in view. Every test of the refusal sets the state by a raw entry and says so ("reached by no press since
  D2403 and D2627 A19"). Plan §4.6 says the same.
- **Problems / for the words:**
  - The card's note stands at the **foot** (`guardnote.ts noteAtFor` default), not by the card; "try again" there is
    vague about what to press. The plan's own reason for "try again" is that the card has no words to name. Fable's
    call.
  - With "close the open window" and two windows up, he may close the OIL list itself, after which "try again" cannot
    be done. Small; the same lead every door uses.
  - One edge I could not rule out without a browser (low confidence, not a words matter): a list opened with no squadron
    (`askFiledOil` in `leavewar/sync.ts`, a drag filing an overseas duty or course for several men on a weekend) takes its
    squadron from `OilDayList listUnit` — first from a live holiday line of his for exactly those dates. A Plan holder with
    a 149 holiday line for the same dates, filing on 142's war, might get 149's list on 142, whose cards then cross
    squadrons. Not a reason to change the words.

## Item 2 — a press naming no door (door `page`): "…, then try again."

- **Every press that reaches the page door with no door named** (K6's census, re-checked by grep of `setPage(`,
  `ownPageRefused(`, `openAdminUsers(`, `openWarAt(`, `openNewPeriod(`, `openInputWindow(`, `openInputsPage(`). The door
  refuses only where the page is not offered, which is only under a View-only pick (`perms.ts pageOffered`: View-only
  Sched and Help, or everything):

| Press | Where it is | Refusal reachable? |
|---|---|---|
| a tab (`Shell nav`), a ☰ page (`Drawer go`) | top bar, ☰ | no — only offered pages are drawn |
| sign-in's page (`Login`) | sign-in | no — his home just entered |
| Logout's Tracker step (`logout.ts`) | Logout | no — asks `pageOffered` first |
| bug alert → Help (`topstate`) | bell | no — Help always offered |
| "make a period" (`interactions.ts`) | a schedule warning | no — needs schedule edit rights, so not a View-only pick |
| Leave War → Inputs (`openInputsPage`, `openInputWindow` — the clash note, the closed-day note) | Leave War page | no — the Leave War is never shown under a View-only pick |
| Quals' "+ Add person" → Admin (`openAdminUsers`) | Quals | no — Quals shown means everything is offered |
| "Add a leave period for …" / the period offer in the Holidays list (`openNewPeriod`) | the Calendar | no — the Calendar cannot be up under a View-only pick: it closes at the pick or refuses it, and every way to open it is on a page a View-only pick does not offer |
| `openWarAt` | only from a bell line | carries the line's door (`PRESSED`), not `page` |
| an Undo's / Redo's landing (`stepPage`) | Undo | no — asked first by the `undo` / `redo` door (K8); row 13 has no button |
| the developer's bridge (`probe-bridge`) | tests only | — |

- **True?** Cannot be judged on a real press: none reaches it. "Try again" would be true for any of them (each re-runs the
  same press once the lead's step is done).
- **Reachable? No.** The plan §4.6 says so too. **The note may not be needed** today; it is only a belt.

## Item 3 — Redo (door `redo`): "Blocked: <lead>, then press Redo again."

- **K8 confirmed: no press reaches a Redo refusal.** Row 21 needs a Redo whose forward removes or changes the row of the
  squadron in view; only "+ New squadron" writes such a row, and its forward only adds it (a Redo of it puts 151 back
  while 151 cannot be in view). No command deletes a squadron. Row 13 needs a View-only pick, where there is no Redo
  button (`Shell.tsx pairOn`). The only tests are a made-up step (B24's belt) and the engine called directly (B23).
- **True if reached:** yes — the refusal writes nothing, so Redo pressed again after the lead's step redoes the same step.
- **The card may not need it.** If it is kept, it is a belt's words.

## Item 4 — the Undo leads with no Cancel half he has seen

Each is the Undo of "+ New squadron" with 151 in view (the road above). "Then press Undo again" stays true only if the
lead's step adds no Undo step: every Cancel below only closes or empties its form (each `onClose` / `setState`; none
commits), so after it Undo again takes 151 away and brings 142 back. Today each falls back to a stand-in (K8 item 4).

| Draft note | The state | The control, as on screen | Adds no step? | Reachable on the road? |
|---|---|---|---|---|
| "Blocked: cancel the open row on Users, then press Undo again." | a person's row opened on Admin → Users and changed (or an archived row), with Squadrons the section showing | "Cancel" (`#accEdCancel`, `#accArCancel`) — not on screen while Squadrons shows; the words send him to Users | yes | yes — Saber on Admin (it has the pair for an admin) |
| "Blocked: cancel the new person on Users, then press Undo again." | "Add a person" with something typed, Squadrons showing | "Cancel" (`#accAddCancel`) — empties and folds the form | yes | yes |
| "Blocked: cancel giving access on Users, then press Undo again." | Give access started for a waiting request, Squadrons showing | "Cancel" (`#apvCancel`) | yes | rare — needs a request already waiting for 151 |
| "Blocked: cancel the open row on Squadrons, then press Undo again." | a squadron's row (its place being moved) or a place's row opened and changed, Users showing | "Cancel" (`#sqMoveCancel`, `#plCancel`) | yes | yes (B24 drives 142's row with a place typed) |
| "Blocked: cancel the new squadron on Squadrons, then press Undo again." | "+ New squadron" open again with a number typed, Users showing | "Cancel" (`#sqNewCancel`) | yes | yes |
| "Blocked: cancel the changed holiday, then press Undo again." | "Change a holiday" open on the Calendar with something changed | "Cancel" (`hol-cancel`) — beside Delete and Save | yes | **rare** — 151 needs a holiday, which needs a leave period of 151; if Saber made either, it is the newest step and the Undo takes that back instead (no refusal); only another admin of 151 could have made them |
| "Blocked: cancel “Every Monday”, then press Undo again." (the window's own weekday) | "Every Monday" opened from the Calendar, something pressed in it | "Cancel" (`every-cancel`) | yes; the Calendar then closes by itself at the Undo | yes |
| "Blocked: cancel the sheet’s holidays, then press Undo again." | a holiday sheet read in, its preview not yet added | "Cancel" (`hol-pv-cancel`; the Calendar's ✕ also clears it) | yes | yes in principle (the preview counts while up, whatever it lists for an empty 151) |
| "Blocked: cancel Inputs calendar settings, then press Undo again." | Inputs calendar settings with something changed | "Cancel" (`iset-cancel`) | yes | yes |
| "Blocked: close the Calendar, cancel Inputs calendar settings, then press Undo again." | the same, on a phone, the Calendar brought up over it | the Calendar's ✕ (`win-days-x`), then "Cancel" | yes, both | yes (phone) |
| "Blocked: cancel SANS calendar settings, then press Undo again." / "…close the Calendar, cancel SANS calendar settings, …" | the same for SANS calendar settings | "Cancel" (`sset-cancel`); the Calendar's ✕ | yes | yes |
| "Blocked: close the open window on the Leave War, then press Undo again." | a Leave War window that refuses ("Open for bidding", a person's window, Settings…) left open on 151's war, Saber gone to another page with the pair | the window's ✕ (on the Leave War, out of sight) | yes — closing a sheet writes nothing | yes in principle; **what 151's empty war can open** ("No leave period yet") is a browser question — its ⚙ Settings is the likely one |
| "Blocked: close the open window on the Tracker, then press Undo again." | a Tracker window that refuses left open on 151's Tracker, Saber on another page | the window's close | yes | the same browser question ("No course yet") |
| **(not in the brief)** "Blocked: close the open window on the Tracker’s Info tab, then press Undo again." | on a phone, a Tracker window behind the Flow chart tab — this lead wins even from another page (`guardLead`, `trackerBehindInfo`) | as above | yes | the same; today it also falls back to "close the open window" (`guardUndoLead` default) |
| "Blocked: clear the new qualification, then press Undo again." | Quals with "✎ Edit" and "Edit quals" on, words typed in "Add qualification" | **no Clear control**: the box ("Add qualification") and its "Add" button only (`#qNewQual`, `#qAddQualBtn`). "Clear" can only mean deleting the words by hand | yes — deleting words writes nothing; "Add" would add a step | yes |

**"Does Undo ever leave that page's window behind?"** A window that refuses: never — that is why it refuses. But see P1:
a window that only shows things **is** left behind when this Undo goes through.

Notes for the words:
- "clear the new qualification": no button says "Clear". Two other true ways out exist: "Done" or "✕ Edit quals" hide the
  box and the words stop counting (`QualsPage canEditQuals = admin && qEditing && qualsEdit`; the words are kept hidden,
  and dropped if the squadron in view changes). Neither adds a step as far as the code shows (both are page state). Fable
  may prefer "delete the new qualification's words" or similar; I did not reword.
- The section-named Users / Squadrons leads name a Cancel that is not on screen (the other section shows). That is what
  D2814's section names are for; true.

## Item 5 — "cancel the new holiday, or create its leave period" → "cancel the new holiday" with the Undo ending

- **When:** in the Undo road this is the **likeliest** holiday state, not a rare one: 151 is brand new with no leave period,
  so any holiday Saber types and presses Save on for 151 is refused for want of a period and kept waiting ("It is kept
  here, and saved by itself as soon as a leave period covers it.").
- **Note:** "Blocked: cancel the new holiday, then press Undo again."
- **True? Yes.** The form in that state shows Cancel, "Save and add another", Save and, under the wait line, "Create the
  2026 leave period" (`hol-wait-create`) or "Add a leave period for …" (`hol-wait-period`). Cancel (`hol-cancel` →
  `onClose`) writes nothing. Creating the period is a step (`createOilPeriodFor`) and the waiting holiday then saves
  itself — a second step — so the "or create its leave period" half would make "press Undo again" untrue. Confirmed.
- **Reachable?** Yes, on the road above.

---

## P1 — a problem outside the words: the Undo that takes the new squadron away closes nothing

- **What:** with 151 in view and only a window that shows things open (ALL AVAIL, Changes, Insights, a SANS day, the Leave
  War's day panel, a show-only Leave War sheet, a Tracker event's details, the marking window, Down days, Failures), or
  Logic's or Quals' edit mode on, the Undo of "+ New squadron" is not refused (correct — those are `'closes'` / mode rows)
  and goes through. The squadron then changes by `store.ts maybeReenter` → `enterSquadron`, which never calls
  `closeShown()` (only the pick, the view switch, a bell line's entry and the page door's landing do: `pick.ts`,
  `store.ts` lines ~132, 143, 796, `belltap.ts`). `squadronRefusal` returns before any closing. `state/guard.ts` already
  names this road as invisible to the test-time entry checker.
- **What he would meet (not walked):** 142 in view with ALL AVAIL, Changes or Insights still up — over whatever 142 holds
  at the same place, or 151's crowd — and Logic's or Quals' edit mode still on for 142. Logic's case matters most: a value
  typed for 151 and still waiting its beat is written by the mode's own end only when a door ends it; here no door does.
- **Against which rule:** D2596, D2597, D2627 A4 (a window that only shows things closes and the press goes through; the
  edit modes end at a door's last step). Whether D2654 E7 meant the Undo to close them too is the orchestrator's reading.
- **To settle:** a test first — `saberOn151()`, ALL AVAIL (or Changes) open, Undo pressed: expect the window shut after
  151 goes; the same with Logic's edit mode on and a value just typed. A likely fix is one `closeShown()` where the Undo
  will go through — read with Astra and the fresh Opus reader before building.

## What only a browser can settle

1. What 151's empty Leave War ("No leave period yet") and empty Tracker ("No course yet") let him open, for the two
   "…on the Leave War / on the Tracker" items: pick 151, open the Leave War's ⚙ Settings (and the Tracker's Show All),
   go to Inputs, press Undo.
2. P1: pick 151, open ALL AVAIL on Edit Schedule, press Undo — does the window stay up over 142?

---

## For Fable — the situations and the draft notes, plain

All the Undo notes below happen in one rare moment: a master admin has just made a new squadron, 151, picked it, started
something, and presses Undo to take the new squadron away again. The app holds the Undo until what he started is put
away. Cancelling never adds anything Undo would take back first, so "press Undo again" stays true.

1. **On Admin, a person's row on Users opened and changed, but he is looking at the Squadrons section.**
   "Blocked: cancel the open row on Users, then press Undo again."
2. **On Admin, "Add a person" half filled on Users, Squadrons showing.**
   "Blocked: cancel the new person on Users, then press Undo again."
3. **On Admin, giving someone access half done on Users, Squadrons showing.** (rare: someone must already be asking for
   access to the new squadron)
   "Blocked: cancel giving access on Users, then press Undo again."
4. **On Admin, a squadron's or a place's row opened and changed on Squadrons, Users showing.**
   "Blocked: cancel the open row on Squadrons, then press Undo again."
5. **On Admin, "+ New squadron" opened again with a number typed, Users showing.**
   "Blocked: cancel the new squadron on Squadrons, then press Undo again."
6. **On the Calendar, an existing holiday being changed.** (rare: the new squadron has no holidays unless another admin
   made some)
   "Blocked: cancel the changed holiday, then press Undo again."
7. **On the Calendar, "Every Monday" (or Tuesday…) with a choice pressed.**
   "Blocked: cancel “Every Monday”, then press Undo again."
8. **On the Calendar, a holiday sheet read in and waiting to be added.**
   "Blocked: cancel the sheet’s holidays, then press Undo again."
9. **Inputs calendar settings changed but not saved** — on a phone, with the Calendar in front of it, the second form.
   "Blocked: cancel Inputs calendar settings, then press Undo again."
   "Blocked: close the Calendar, cancel Inputs calendar settings, then press Undo again."
10. **The same for SANS calendar settings.**
    "Blocked: cancel SANS calendar settings, then press Undo again."
    "Blocked: close the Calendar, cancel SANS calendar settings, then press Undo again."
11. **A window left open on the Leave War, he is now on another page.**
    "Blocked: close the open window on the Leave War, then press Undo again."
12. **A window left open on the Tracker, he is now on another page** — and, on a phone, one behind the Tracker's Info tab.
    "Blocked: close the open window on the Tracker, then press Undo again."
    "Blocked: close the open window on the Tracker’s Info tab, then press Undo again."
13. **On Quals while editing, words typed in "Add qualification" and not added.** There is no "Clear" button: he clears
    the words himself (pressing Done also puts them away).
    "Blocked: clear the new qualification, then press Undo again."
14. **On the Calendar, a new holiday for the new squadron, saved but kept waiting because the squadron has no leave
    period yet.** (the likeliest holiday case here: a new squadron never has one) Creating the leave period would itself
    be something Undo takes back, so only Cancel is offered.
    "Blocked: cancel the new holiday, then press Undo again."

Not needed today (no press reaches them — words for a safety net only):

15. **A card on the OIL list** that would open an input of another squadron, while something else is open. The note
    stands at the foot of the screen; "again" means the same card.
    "Blocked: press Retry to save your changes, then try again." (with whichever lead applies)
16. **Any other press that would bring his own squadron back** — none reaches this today.
    "Blocked: <lead>, then try again."
17. **Redo** — no Redo can reach this today.
    "Blocked: <lead>, then press Redo again."
