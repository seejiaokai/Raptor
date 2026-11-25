# [MSQ-PICK-GUARD] the third round — what today's app does (Opus presser; chat 176, 25 Nov 26)

Brief: `2026-11-25-msq-q3-press-brief.md`. Saved whole by the host from the helper's hand-back; the host's re-runs are noted in `HANDOFF.md`.

# [MSQ-PICK-GUARD] round 3: what today's app does (presser, chat 176, 25 Nov 26)

**The world (k0-world, by presses):** Saber added 150. "+ New squadron" offers only Hunter · 142 or Kestrel · 149 as first admin, so Kestrel was used. Saber then added Zephyr (150, sign-in, made Admin) and Vortex (150, no sign-in), set Kestrel's 150 line back to None, and gave Hunter Plan of 149 and View of 150. Hunter's picker reads "142 Your squadron · 149 Full access · 150 View only". Pictures are in `docs/mock/2026-11-25-msq-pick-guard-q3/today/` at scale 1; I opened every one named below.

**k1: the Calendar window (d, p).** Some presses save at once, some do not. Pressing a day saves at once (`a.dayKey` saved `settings/u142@flyday:2026-12-09`). Saving a holiday saves at once, and so does Delete, which asks nothing (`c.saved`, `d.deleted`). Two side forms hold choices until their own Save:
- "Every Monday": a choice pressed saves nothing (`b.everyChoice` saved=false).
- "Add a holiday": it has a **name box to type in**. Typing saves nothing, and neither does picking a date (`c.nameTyped`, `c.dateChosen`).

Picking 149 or 150 with the Calendar open closes it, with nothing said (`f.pick149`, `g.pick150` cal=null). A holiday name typed and not saved is lost at the pick, and nothing is saved (`h.typedPick149` nameBox "(no box)", no saved keys). On the phone the Inputs settings window stayed open under the Calendar, and the pick closed both.
Pair: `k1-d-8-typed-before-pick149` → `k1-d-9-typed-after-pick149` (also `k1-d-4-holiday-typed`, `k1-d-3-every-form`).

**k2: the Tracker's marking window (d, p).** Fails + and Fails − save at once (`a.failPlus`, `b.failMinus` → `tracker/u142@…`). A grade (DCO) saves and closes the window (`d.gradeDCO`). There is no box to type in. One thing is held: the "Done on" day picked on an event not yet done saves nothing (`c.doneOnDay` saved=false). It only waits for the next grade, so Close or a pick drops it. One press on the Schedules menu closes the window and opens the list in the same press (`f.firstPress` window=null, listOpen=true). On the phone, ☰ does the same. The pick then goes through. 150 is the same.
Pair: `k2-d-3-before-pick149` → `k2-d-4-after-first-press`.

**k3: the six "show-only" windows, 150 picked (d; Changes also p).**
- ALL AVAIL, Changes (opened out and folded), and the Tracker's ⓘ bubble: each closes, and none comes back.
- Insights: it **covers the Schedules menu** (`2.pick150` "covered by div#insightModal"). The first press closes Insights without opening the list; a second press picks.
- **SANS day and the Leave War's day panel: both stay open.** They quietly re-read 150's figures: SANS "Available 28 18" becomes "0 0"; the day panel's "Available P 28" becomes "1" and its crew rows go. Back on 142 they show 142's figures again (`sansday/lwday 2.pick150` wordsBefore/After, `3.back142` cameBack=true). This is against what his D2597 decides; the guard is not built yet. The SANS day also carries a live "+ Commitment" button.
- Pairs: `k3-d-lwday-1-open` → `k3-d-lwday-2-after-pick150`; `k3-d-sansday-1-open` → `k3-d-sansday-2-after-pick150`; `k3-p-changesFolded-1-open` → `-2-after-pick150`.

**k4: N9. It cannot be raised by pressing today.**
- First, Kestrel cannot end Hunter's Plan: every button on his 149 line is greyed, under "Only a master admin gives Plan." (`2.kestrelEndsPlan`). This is today's rule, before his D2626. Saber ended it instead.
- While Hunter held Plan, his bell had "OL 149 Mon 14 Dec — Remark changed · Kestrel" (`2b.hunterBellWithPlan`).
- Once the Plan was ended, to View or to None, **that line was gone from his bell**, on 142 and on 149 alike (`3.lines`, `3.linesOn149`). Ended to None, 149 also drops out of his picker. So no line is left to press.
- Pair: `k4-d-view-0b-bell-with-plan-crop` → `k4-d-view-1a-bell-crop`.

**k5: N10.** On 149, Edit chart layout was opened and nothing moved; his badge was then pressed. Nothing is asked. The member view stays on **149**, with only the View-only Sched and Help tabs (`2.toMember`), so the editor is out of sight. Back in the admin view, the Tracker on 149 **still has the editor open** (`3b.trackerAgain` editorOpen=true). On 150 (View only) there is no Tracker tab at all, so the editor cannot be reached (`4.tabs150`).
Pair: `k5-d-1-editor-149` → `k5-d-3b-tracker-again` (`k5-d-2-member-view` between).

**k6: N12.** "No. of Down Days" stays "none counted yet" and greyed even after a course start is set: the demo has no medical inputs for Student A. So I used its twin, the Failures window (`1.downDays`, `1.instead`). At 1000 wide the Flow chart half shows and the window is out of sight. **Nothing on screen says it is open** (`2.narrow1000` seen=false). Picking 149 removes it (`3.pick149` inDom=false). Back on 142 the Info tab does not show it again (`4.back142Info`).
Pair: `k6-d-1-open-1536` → `k6-d-2-narrow-1000`.

**k7: D2625, Kestrel on 149's Admin → Users.**
- Ranger (142), found by the search: the row reads "Ranger 142 us · Pilot · CAT IP MEMBER".
  - Opened, it shows his sign-in mail "us" (greyed), Role (greyed), **Save live**, and Suspend, Archive and Delete greyed.
  - Two access lines show: **149's**, live (Plan greyed, "Plan is for admins only."), and **150's, all greyed**.
  - Save with nothing changed only closes; nothing is saved.
- Zephyr (150) is the same shape: mail and Role greyed, Save live, 142's line greyed, 149's line live.
- Today this differs from his D2625, which wants the mail, role and buttons hidden and only 149's line shown.
- Pair: `k7-d-r142-1-row` → `k7-d-r142-2-opened-crop`.

**k8: N6.** The best pair is `q2/today/p5-n6-saber-d-1-held-crop` (149, the window greyed under "This change could not be saved." and Close, his words "N175 N6 words" in Remarks) → `p5-n6-saber-d-2-after-pick-crop` (142, the same window live, the words kept). No re-run was needed.

**Other surprises**
- When Hunter, on 149, files a new input, the people picker **starts with Hunter (a 142 man) picked**, and he is listed among 149's pilots. The first run saved "Hunter +2". Kestrel then could not save that input: "Blocked: nothing was kept".
- 150's new Tracker already shows the STUDENT A / B chart.

**Scripts** are in `raptor-port/scripts/handpass/n176/`: k0-world, then k1, k2 and k3 (each takes d or p), k4 (view or none), k5, k6, k7. Each builds the world itself when it is missing (FRESH=1 rebuilds it). Logs are in `raptor-port/.tmp/n176/`. Nothing under src was changed; nothing was committed.
