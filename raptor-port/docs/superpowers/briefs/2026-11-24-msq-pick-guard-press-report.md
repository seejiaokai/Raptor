# [MSQ-PICK-GUARD] step 1 — what today's app does, the pressing helper's report (chat 166, 24 Nov 26)

Brief: `2026-11-24-msq-pick-guard-press-brief.md`. An Opus helper; saved verbatim from its hand-back by the host. The
host's re-run of every script, and what it confirmed, is recorded below the report.

---

## [MSQ-PICK-GUARD] step 1: what today's app does, pressed at 1536×864 (d) and 402×874 (p)

Nothing under `src` was changed and nothing was committed. Scripts are in `C:\Users\User\projects\Raptor-msq\raptor-port\scripts\handpass\n166\` and pictures in `...\raptor-port\docs\mock\2026-11-24-msq-pick-guard\today\` (278 files). Every row below comes from the scripts' FACT lines. I opened the deciding pictures myself: A-d-input-pick-2-after, A-d-input-view-2-after, A-p-input-pick-1-open, A-p-lw-day-pick-1-open, A-d-sans-day-pick-2-after, E1-d-input-2-after-midnight, E4-d-2-after and E4-d-1-question.

Re-run order, each with `d` then `402x874`: win-a, bell-a, trk-b, type-c, save-d, mid-e1, right-e2, trk-e3, second-f. `sum-a.mjs <log>` reads win-a's log into one line per window. The probe-*.mjs files were only for finding controls.

### A. Windows (Saber picks 149; the member-view switch; script win-a, pictures `A-<d|p>-<window>-<pick|pickmenu|view>-*`)

| Window | d: reachable? → what happened | p: reachable? → what happened |
|---|---|---|
| Input window (existing and new) | Yes. **Pick:** the window stays, greyed, typed words kept, band "This is 142's. You picked 149 — close this to go on." with Close. **View:** an existing input turns read-only, no band, footer "Only Drifter or an admin can change this." with Close. A new input stays open and live. | No. The window's title strip covers the picker and ☰. |
| Leave War My leave | Yes. Pick: held with the same band. View: stays open and live. | Same as d. |
| SANS day | Yes. Pick and view: **stays open and live**, title unchanged, figures redrawn for 149 (Available 5/5). | No (window covers the bar). |
| Inputs settings, Calendar, Add a holiday (typed), Every Monday, SANS settings, Day details ⓘ, Traffic, Jump to a date, Changes, Templates menu, Plans menu, Tracker marking window, File menu, bell list | Yes. Each **closes silently**; holiday name typing is lost. View from Edit Schedule lands on View-only Sched. | Yes, both pickers. Same results. |
| Tracker Edit chart layout | Yes. Pick: the toolbar closes. View: stays open and live. | Same as d. |
| Insights; Leave War Open for bidding, Place a bid, Settings, Legend, OIL tracker; Tracker Export, Legend, + Add question | **No.** Their shade covers the picker, the badge and the bell. | No for most. Exception: **Place a bid and Settings leave the bar uncovered, but the tap on the picker or ☰ opens nothing.** |
| ALL AVAIL window | Not opened: no count chip is drawn on Edit Schedule or the week in the demo. | Same. |
| Clear edit history… | Not a window: it is an inline two-tap control. Left out. | — |

**Bell line that leads to another squadron** (script bell-a). Hunter has Plan of 149 and is on 149; his bell has a 142 line "You were added".
- No window, Changes window, or SANS settings open (d and p): the press enters 142 and opens the input "Hunter · 8 Dec". The window that was open closes.
- Input window with typed words (d): enters 142. The 149 window stays, greyed, band "This is 149's. You picked 142 — close this to go on." An ask card says "This input has unsaved changes. Open Hunter's input and lose them?" with "Discard and open" and "Keep editing". Typed words kept.
- Input window (p): the bell is under the window's ✕.
- Place a bid (d): covered by its shade. Place a bid (p): the bell tap opens no list.

### B. Unsaved Tracker chart edits (script trk-b, pictures `B-*`)

| Case | d | p |
|---|---|---|
| Pick 149 (bar list, and the ☰ list on p) | Asked: "You have unsaved chart edits on “2026”. Save them before switching to 149?" with Stay, Discard them, Save them. Stay keeps him on 142. | Same words and buttons, from both lists. |
| Switch to the member view | **Not asked.** Member view, edit still on the chart, "✓ Save changes" still drawn. | Same. |
| Switch back to the admin view | Not asked. Edit kept. | Same. |

### C. Unsaved typing that is not in a window (script type-c, pictures `C-*`)

| Case | d and p (both pickers on p) |
|---|---|
| Admin → Users, an opened row, typing in its sign-in box | Nothing asked. The row closes and the words are gone, still gone back on 142. |
| Edit Schedule, typing in a day's note | Nothing asked. **The words go into 142's note** and show there on return to 142. |
| Logic search box, Quals filter box | Words kept in the box through the pick and back. |

### D. A save still going, or failed (script save-d, pictures `D-*`)

| Case | d and p |
|---|---|
| Save, then pick at once | Sign said "Saving…" before the pick. Pick goes through and **the save lands in the input's own record** (raptor:inputs/…). |
| Save failed (stand-in) | "Not saved — keep this page open" with Retry. The pick is reachable and goes through. On 149 the band stays and Retry is still drawn. With the stand-in lifted, **Retry on 149 saves 142's input change**, and the band clears. |

### E. Changes he did not make

| Case | d | p |
|---|---|---|
| E1 move at midnight, Input window open (mid-e1) | Bar becomes 149, badge "Hunter · Member". Window held, greyed, band **"This change could not be saved."** with Close, Save gone, typed words kept read-only. | Same. The ☰ role line is gone. |
| E1 move at midnight, Leave War Place a bid open | Band "You are 149's from today. This can't be saved in 142's Leave War." with Close. Fields still drawn live. | Same. |
| E2 Plan removed by Saber in a second tab (right-e2) | **Tab A never notices:** no band, no change. Its Save then **writes the input on 149** after the Plan was gone. A reload brings the sign-in card. Tab B stays signed in as Saber throughout. | Same. |
| E3 Tracker fails part-way through a switch, Input window open (trk-e3) | Window held with the "This is 142's. You picked 149…" band. Tracker page: "Couldn't finish upgrading your Tracker data … Reload to try again." with **no buttons**. | Not reached: the window covers both pickers. |
| E4 sign-out with a window open and unsaved chart edits (trk-b) | Logout moves to the Tracker and asks "…Save them before logging out?" **but the Input window is redrawn centred on top of the question**, so Discard is covered and a press lands on the window. Only after the window's own Cancel can the question be answered. Discard then signs out; the window words and the chart edit are lost. | ☰ is under the window, so sign-out is not reachable. |

### F. A second press during a switch, and Undo (script second-f, pictures `F-*`)

| Case | d and p |
|---|---|
| Second switch while the Tracker question is up | Its shade covers the picker, the badge or ☰, and the bell. Nothing reachable; the question stays and he stays on 142. |
| Two picks back to back on the Tracker (149, then 142 at once) | Ends on 142 with the chart drawn and nothing asked. |
| Undo after a pick | On 149, Undo still reads "Undo — Drifter's OL" (142's step). Pressed: toast "Undid: Drifter's OL", **142's record is undone while on 149**, no squadron named. Redo works the same way ("Redid: Drifter's OL"). |

### What surprised me
1. **Sign-out (E4):** the Input window stands over the Tracker's sign-out question, so its Discard cannot be pressed until the window is cancelled. On a phone, sign-out cannot be reached at all.
2. **Plan removed in another tab (E2):** the open tab never notices and can still save to 149.
3. **SANS day:** after a pick it stays open and live, quietly showing 149's figures under the same date.
4. **Typed day note (C):** a pick saves it into 142's note without asking.
5. **Failed save (D):** Retry on 149 saves 142's change; Undo and Redo on 149 change 142's records.
6. **Phone, Place a bid and Settings:** the bar looks free, but the picker tap opens nothing.
7. **Midnight move:** the Input window gets the generic "This change could not be saved.", while the Leave War window gets the move words.

### Stand-ins used, each named in its script and FACT lines
- **Failed save (D):** browser storage refuses every write (localStorage.setItem throws), installed just before the Save, lifted before Retry.
- **Midnight move (E1):** the move is written as a home row at the sign-in card, because no screen saves a move (msq-rs-lib's way). The page clock is installed at 23:58:30 on 15 Jul 2026, Singapore time, and run to 00:00:30. The phone there is WebKit.
- **Tracker failure (E3):** chat 162's 'mapget': reads of 149's Tracker records throw.
- **Right taken away (E2):** a second tab in the same browser, as the brief names.
- **Bell set-up:** the saved data after a pressed set-up (Plan of 149 given to Hunter, an input filed for him) is copied into each fresh browser.
- **Text boxes:** a box that did not take the typed words was filled directly (needed only for the holiday name).

Scratch run data is in `raptor-port\.tmp\n166` and `raptor-port\.tmp\n166-rs`.

---

## The host's re-run (chat 166, 24 Nov 26)

Every script re-run by the host at d and 402x874 on the same build (logs `raptor-port/.tmp/n166-host/`, not committed): 18 runs, no step failed; `trk-e3` at 402x874 stops by design ("the pick cannot be reached with the window open at this size"). The deciding facts match the report: the windows table (sum-a), the Tracker question at a pick and none at the member-view switch, the Input window over the logout question, the typed words of C, the failed save and Retry on 149 storing the 142 input, the midnight bands, the other tab never noticing, Undo and Redo of 142's step on 149. The host also opened the deciding pictures (E1, E3, E4, F3, D2).
