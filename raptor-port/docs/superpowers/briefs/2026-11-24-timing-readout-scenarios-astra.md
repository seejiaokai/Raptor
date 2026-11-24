**The readout is not yet safe to use to choose the next speed fix.** Three defects can materially misstate a page’s time: it can finish while the loading claw is still up, include time spent waiting for the readout itself to download, and miss the page reopened after Retry.

This is a blind, read-only scenario design. I did not read this branch’s handoff block, another reader’s report, or its walk evidence. An evidence filename appeared during the work; I left it unopened. No files were changed. I checked source and exercised timing logic in isolation; **these are not browser-walk passes**.

Expected results below use:

- **Promise:** D2481—hidden switch, useful measurements, no personal details, nothing saved, no readout download without the switch.
- **Window:** D2483—approved words, movable window, ✕ folds it, Copy all, desktop open/phone folded, unavailable figures explicitly named.
- **Recovery:** D1631, D1633, D1635, D1638—page-local download failure, safe Retry, reopening the failed page after sign-in.
- **Shared-window rules:** D641, D1523, D2112—background remains usable, placement around save warnings, appropriate Escape order.
- **Host comparison:** the proposed second-animation-frame endpoint. This is **not an owner’s ruling**. Record the relationship between the displayed figure, actual content, and claw disappearance rather than silently adopting it as one.

**Coverage inventory—starting with the specialised surfaces**

Every row below needs its own visible-content check. A selected navigation label or an empty page container does not prove that page has appeared.

| Page or surface | Visible sign and production gesture |
|---|---|
| Tracker | Open Tracker from navigation. Observe the actual chart, or its legitimate “No course yet” state. Exercise failed download, Retry, chart changes and unsaved-chart questions. |
| Leave War | Open Leave War from navigation and from its cross-page links. Observe the actual period/calendar or legitimate empty state. Include desktop background downloading, failed download and Retry. |
| Admin | Admin navigation, account-access notification, person/posting notification, and Quals’ Add person door. The requested Admin content must appear. |
| Edit Schedule | Admin navigation; relevant Undo/Redo return. Observe the week’s actual days and controls, then the expanded scheduling board. |
| Inputs | Navigation; pending-OIL notification; input notification; OIL-day entry; Leave War clash-resolution and closed-bidding links. Check both the page and any editor opened over it. |
| Quals | Navigation and Welcome back → Check my quals. Observe the qualifications content and the intended person when that door specifies one. |
| Logic | Navigation and any applicable history return. Observe its actual controls; preserve the member’s permitted view. |
| Help | Navigation and bug notification. Observe the requested Help content. |
| View-only Schedule | Navigation, normal accepted sign-in, session reset and role downgrade. Observe the week’s days, not merely its selected tab. |
| Sign-in/access screens | Initial load, sign-out, rejected credentials, waiting/new/switched-off accounts. These must not be reported as an ordinary successful week landing. |

The production doors to cover are:

| Door | Where the gesture belongs |
|---|---|
| Desktop navigation | Top bar: mouse and keyboard activation for every permitted page. |
| Phone navigation | ☰ drawer: open, choose each permitted page, observe drawer dismissal and destination. |
| Accepted sign-in | Sign-in button and Enter submission; normal week landing and Retry landing separately. |
| Sign-out | Desktop and phone account controls; ordinary exit, pending save, and Tracker’s unsaved-chart question. |
| Role change | Account role controls; include leaving an admin-only page when switching to member view. |
| Notifications | Bell entries for account access, bugs, pending OIL, postings, Leave War and Inputs. A no-longer-actionable entry must not invent a page visit. |
| Welcome back | Check my quals; contrast with Later, which should not create that visit. |
| Add person | Quals → Add person → Admin’s people controls. |
| Leave War links | Date/person notification, missing-period link from scheduling, new-period links from Holidays, clash-resolution input links, and the closed-bidding Inputs link. |
| OIL details | An OIL-day entry leading to its input editor. |
| Undo/Redo | Changes whose restoration returns the person to another page. Exercise both directions and a change that stays on the current page. |
| Download Retry | Failure card → Retry → reload when safe → sign-in → the failed page. |
| Browser Back/Forward | Browser controls. No app page-history routing was found; record actual browser behaviour rather than assuming these are app-page doors. |

Development-only page-opening helpers are not substitutes for these gestures.

The measurement chain also needs coverage:

| Writer or reader | What its downstream consumer must receive |
|---|---|
| Start-up marks | Points measured from opening the address, labelled separately from elapsed sign-in time. |
| Sign-in mark | The result of that particular accepted attempt, with its actual destination respected. |
| Shared page setter | One correctly attributed visit for every qualifying production page change. |
| Deferred readout | Completed measurements that remain correct even when the readout arrives late. |
| Page renderers and loading claws | A truthful distinction between requested, loading, drawn, failed and abandoned. |
| Browser resource entries | Correctly attributed downloads and cache information; unknown must remain unknown. |
| Freeze observer | Counts, total and maximum without duplicate observation. |
| Visible card, folded button and Copy all | Consistent results from the same underlying measurements. |
| Developer receiving pasted text | Enough truthful context to distinguish slow drawing, downloading, cache use and unavailable information. |

For overlap coverage, open Timing **before and after** each relevant surface, and then bring each forward:

- Shared movable windows: Calendar, Every weekday, Add/change holiday, Inputs day/settings/editor, OIL day, SANS day/settings, Leave War day, ALL AVAIL and Changes.
- Tracker: event details/editing, event and syllabus lists, reorder controls, Copy, Flex settings, Show all, Tools/File menus, import questions and unsaved-chart Save/Discard/Stay.
- Leave War: bid and filed-leave/OIL details, awards and postings, counters, person/day lists, events and presets, grades, manning explanations, OIL tracker/settings, opening bidding, person leave, notes, required figures, selected days, settings and new-period forms.
- Other app overlays: expanded scheduling board, day details, Traffic, Jump date, Insights, input/document/medical/OIL questions, templates, drafts/plans, roster and phone drawers, bell list and small pickers.
- Bands and transient surfaces: failed-save and storage warnings, OIL band, loading claws, failure cards and toasts.

A genuinely modal question must retain its own blocking behaviour. A non-modal window must leave the surrounding page usable. Lower-level Tracker overlays deserve particular attention: do not assume their stacking behaves like the app’s top-level dialogs.

**Ranked walk scenarios**

The ranking puts possible harm to ordinary users first, followed by misleading measurements. Within those groups, the specialised failure paths come before routine navigation.

1. **No switch: no readout cost or changed behaviour.**  
   **Setup:** Built production app, clean browser context, ordinary address; repeat with browser cache populated. **Action:** Sign in, visit all permitted pages, open windows, edit fresh demo data, save and sign out. Compare the same build with timing enabled and, for performance regression, the appropriate unchanged baseline. **Expected:** No timing control, timing-window script/style request, timing observer or saved timing data; ordinary behaviour remains intact (**Promise**). **Disproof:** Any such resource or behaviour appears without the switch. Check the production dependency graph as well as Network: cached resources can hide a transfer.

2. **Tracker remains downloading while its page container is selected.**  
   **Setup:** Fresh first Tracker visit; hold its required download. **Action:** Open Tracker and leave the claw visible for several seconds, then release the download. **Expected:** No ordinary completed-page figure before the actual chart/empty state is ready (**Promise**); record its relationship to claw disappearance and the host’s two-frame endpoint. **Disproof:** A tiny completed Tracker time appears while the claw still covers it. **The current code permits this.**

3. **Leave War’s background download fails.**  
   **Setup:** Desktop; fail Leave War’s background fetch before its first visit. **Action:** Continue using another page, then open Leave War. **Expected:** No premature whole-app failure; on opening, the page-local failure card and usable navigation (**Recovery**). Record exactly how timing represents failure; it must not masquerade as a successful ordinary opening (**Promise**). **Disproof:** Whole-app blanking, inaccessible navigation, or an apparently successful fast Leave War measurement for the failure card.

4. **Retry succeeds and sign-in lands directly on the failed page.**  
   **Setup:** Fail Tracker, then repeat independently for Leave War. **Action:** Restore connectivity, press Retry, sign in, remain on the reopened page, then much later open View-only Schedule. **Expected:** The failed page reopens (**Recovery**). Its timing and sign-in information must describe that journey; no later unrelated week visit may become the original sign-in’s completion (**Promise**). **Disproof:** Missing destination measurement followed by an enormous sign-in time when the week is eventually opened. **The current shortcut permits both.**

5. **Retry cannot safely reload.**  
   **Setup:** Failed page with either continuing network failure or a fresh save still waiting. **Action:** Press Retry; also try leaving the page or signing out while Retry is working. **Expected:** Apply the existing recovery rules: no unsafe reload, failure card returns when appropriate, signed-in state and Retry focus retained (**Recovery**). **Disproof:** Reload despite the unsafe condition, lost recovery controls, or a success-looking timing row for the failed attempt. Record the timing treatment where its wording is unspecified.

6. **The timing download arrives after the measured page.**  
   **Setup:** Delay only the readout’s separate download by ten seconds; allow the app to work normally. **Action:** Sign in and open one or more pages before releasing the readout. **Expected:** Measurements describe those actual openings, independent of readout arrival (**Promise**). **Disproof:** Approximately ten seconds are added, earlier visits vanish, or only the page still visible at readout arrival is measured. **Current logic checks reproduced delayed completion.**

7. **Leave a page before it finishes.**  
   **Setup:** Hold Tracker or Leave War’s download. **Action:** Open it, leave for Inputs, release the old download, then return later. Repeat with departure during the proposed final two frames. **Expected:** No completed visit falsely attributed to content the person never saw (**Promise**). Record whether abandoned attempts are omitted or otherwise represented. **Disproof:** An old page completes while another page is visible, or an abandoned first attempt changes the later visit’s description incorrectly.

8. **A sign-out timer completes in somebody’s next session.**  
   **Setup:** Start from a non-week page with a newly failed save, so sign-out can leave the sign-in screen without immediate reload. **Action:** Sign out, wait, then sign in again. **Expected:** The new attempt is not contaminated by time spent signed out; old successful sign-in values must not look current (**Promise**). **Disproof:** A page-opening duration includes the signed-out wait, or the previous attempt’s value remains presented as the new one.

9. **A page is charged for somebody else’s download.**  
   **Setup:** Overlap a first page visit with Leave War prewarming and/or the readout download. **Action:** Open the page while collecting independent resource start/end times and sizes. **Expected:** A page’s “downloaded” amount is attributable to that page, with uncertainty represented honestly (**Promise; approved words**). **Disproof:** It includes unrelated files, misses its already-in-flight download, or claims none although its required files transferred. **The current calculation includes all matching app resources after the start.**

10. **First visit, browser-cache visit and same-session revisit.**  
    **Setup:** Three runs: empty cache; fresh navigation with cached files; leave and return within one session. Include a visit after desktop prewarming. **Action:** Open Tracker and Leave War in each. **Expected:** “First time”, “opened before”, transfer sizes and kept-file counts describe the applicable visit accurately (**approved words; Promise**). **Disproof:** Cache reuse is called a fresh transfer, actual repeat transfer is forced to zero, or prewarming produces a misleading page-download claim. Record the distinction between session-first and browser-first.

11. **High-density screen is reported as browser zoom.**  
    **Setup:** A phone or high-density display at the browser’s normal 100% zoom; then change zoom on desktop. **Action:** Copy all. **Expected:** Computer information is accurate (**Promise**). **Disproof:** Normal zoom is reported as 200% or 300%. **Current code multiplies pixel ratio by 100 and calls it zoom.**

12. **Unavailable browser figures become zero.**  
    **Setup:** Safari, plus controlled absence of resource timing or other relevant APIs. **Action:** Open and copy the card. **Expected:** Each unavailable figure says “not given by Safari” or the appropriate browser wording (**Window**). **Disproof:** Blank, invented zero, “none”, or “0 · 0 KB” where availability was not established. **The app-file total currently lacks that guard.**

13. **The card becomes stale while the app is idle.**  
    **Setup:** Leave the card open while a background download finishes; use a browser without long-task notifications. **Action:** Wait without navigating, resize/rotate, capture the card, then Copy all. **Expected:** Values presented as current agree with the current browser state and copied snapshot (**Promise**). **Disproof:** Downloads or window dimensions update only after an unrelated page visit, freeze or copy. **Resource completion and resize currently have no dedicated notification.**

14. **Clipboard permission is refused.**  
    **Setup:** First refuse the modern clipboard API but allow the fallback; then refuse both. Include an immediate failed attempt after a successful copy. **Action:** Press Copy all and inspect the actual clipboard and feedback. **Expected:** Successful copy contains the full report; failure must not claim success (**Window; Promise**). Record the exact failure experience because approved failure wording is unspecified. **Disproof:** “Copied” with unchanged clipboard, stale success feedback for a failed second attempt, or no usable way to obtain the promised report.

15. **Every production navigation door reaches the measurement.**  
    **Setup:** Fresh demo conditions enabling each door in the inventory. **Action:** Use each real gesture, including notifications, history restoration and role downgrade; repeat using keyboard where supported. **Expected:** One correctly named qualifying page opening, and the requested content/editor visible (**Promise**). **Disproof:** Missing entry, wrong page, duplicate entries or timing that completes before its destination exists. Do not use a development helper to manufacture this pass.

16. **Every page: first and repeat opening.**  
    **Setup:** Admin and member; ordinary and slowed computer conditions. **Action:** Walk all nine pages available to the relevant role, first and repeat, using both desktop navigation and the phone drawer. **Expected:** Correct names, newest-first order, and actual content ready when completion is represented (**approved words; Promise**). **Disproof:** A selected empty section passes, a role’s page is omitted, or repeat visits retain an obsolete duration.

17. **Accepted, rejected and restricted sign-in results.**  
    **Setup:** Member, admin, admin viewing as member, incorrect credentials, waiting/new and switched-off account cases. **Action:** Submit by button and Enter; correct a rejected attempt and try again. **Expected:** Existing access rules remain unchanged; timing never grants access or calls an access screen a drawn week (**Promise; D2239**). **Disproof:** Restricted content appears, rejected attempts create successful timings, or an old attempt completes after a different account enters.

18. **Start-up labels and sign-in labels use their stated clocks.**  
    **Setup:** Independently delay server response, app code, start-up work and accepted sign-in drawing. **Action:** Capture navigation timing and a visual timeline. **Expected:** Start-up “at” values run from opening the address; sign-in “took” is a separate duration (**approved words**). **Disproof:** A delay affects the wrong clock, or “shown” clearly precedes the visible screen it describes. **RECORD exactly** how start-up claw fading and the host’s two-frame proposal relate to the values.

19. **The observer changes the result it reports.**  
    **Setup:** Matched runs with timing absent, folded and open. **Action:** During slow page drawing, open/reopen Timing, drag it, bring it forward and copy. Compare rendering and long-task traces. **Expected:** Measurements remain interpretable and ordinary interaction is not damaged (**Promise**). **Disproof:** The readout causes substantial app redraws, adds its own delayed arrival to a page result, or generates repeated observation/rendering loops. Record the measured overhead; no numerical allowance was ruled.

20. **Freeze counts are duplicated or misleading.**  
    **Setup:** Supported browser with independently observed long tasks; unsupported browser as a separate case. **Action:** Cause distinct known stalls, then fold/reopen and navigate repeatedly. **Expected:** Count, total and longest correspond to the browser’s entries; unsupported means “not given…” (**Promise; Window**). **Disproof:** Reopening recounts old tasks, total/maximum disagree, or an unsupported browser says there were no freezes. Record whether readout-generated work contributes.

21. **Timing conflicts with Tracker or Leave War overlays.**  
    **Setup:** Each specialised overlay listed above, including unsaved-chart and import questions. **Action:** Open Timing before and after it; bring windows forward, use controls and press Escape. **Expected:** Existing modal/non-modal behaviour remains usable; the correct front surface responds (**shared-window rules**). **Disproof:** Timing covers an unavoidable answer, a click reaches the page through a blocking question, or Escape dismisses an unrelated surface.

22. **Timing covers a save warning or other app window.**  
    **Setup:** Failed-save and OIL bands; untouched, resized-only and deliberately moved Timing positions. Include sign-in and the expanded board. **Action:** Raise/remove the band and open another movable window, drawer or dialog in both orders. **Expected:** Unplaced/resized-only windows clear the failed-save band; deliberately moved windows retain the person’s placement (**D1523**). Other layers retain their established behaviour. **Disproof:** Retry is covered in the protected cases, required controls become unreachable, or clicking a window fails to bring the appropriate one forward.

23. **Drag, fold, reopen and growing content.**  
    **Setup:** Desktop and phone, short viewport, many timing rows and browser zoom. **Action:** Drag by the bar; press Copy all and ✕; reopen from the corner; resize/rotate; add more rows and copy repeatedly. **Expected:** ✕ folds rather than destroys measurements; corner reopening works; controls stay reachable; Copy all does not initiate dragging (**Window; shared-window rules**). **Disproof:** Lost results, stranded title bar, clipped close/copy control, jumping placement or the control moving away during ordinary use.

24. **Escape and focus follow the wrong surface.**  
    **Setup:** Timing alone; Timing plus older/newer windows; a menu; a page input being edited behind it. **Action:** Press Escape once, then hold it; fold and reopen using the keyboard. **Expected:** Appropriate front/newer surface closes; a background text edit retains its own Escape behaviour; keyboard use remains workable (**D641; D2112**). **Disproof:** Multiple unintended closures, lost text, hidden focus, or reopening/folding leaves the keyboard stranded. The corner button is replaced during opening, so focus return needs a real check.

25. **Automatic opening interrupts sign-in; phone defaults are wrong.**  
    **Setup:** Delay the timing download while the person types their username. Also load on desktop, portrait phone, landscape phone and around the layout breakpoint. **Action:** Continue typing as Timing appears. **Expected:** Desktop open and phone folded (**Window**); sign-in remains usable. **Disproof:** Typed characters are lost because the late window takes focus, or a phone opens the full window unexpectedly. Record the width-based outcome separately from the owner’s word “phone”.

26. **Privacy and “saving nothing”.**  
    **Setup:** Fresh demo edits containing distinctive person and account text. **Action:** Visit relevant pages, copy, inspect outgoing requests and storage changes, reload and reopen without the switch. **Expected:** Only allowed timing/computer information in the card and clipboard; no saved or transmitted timing report (**Promise**). **Disproof:** Identity, credentials, record contents, persisted measurements or automatic telemetry. Existing app saving and the existing Retry-page note are not themselves timing-storage defects.

27. **Back, same-page taps and internal controls invent visits.**  
    **Setup:** Several page visits, then internal tabs, dates, dialogs and repeated selection of the already-open page. **Action:** Use those controls and browser Back/Forward. **Expected:** Record actual browser navigation; ordinary internal changes must not be mislabeled as new page openings (**Promise**). **Disproof:** False rows, duplicate rows, replayed timings, or broken return to the app. Include browser-restored pages where available; **RECORD exactly** whether they retain the old report.

28. **Limits and failure of the readout itself.**  
    **Setup:** More than 30 page visits, a backgrounded tab during loading, a load held beyond two minutes, and a separately blocked timing download. **Action:** Resume, release the load and inspect/copy. Separately exercise normal app start-up failure. **Expected:** Readout failure must not break app use or recovery (**Promise**). **RECORD exactly** the row limit, timeout, background waiting and timing availability during start-up failure; these policies are not settled by the quoted rulings. **Disproof:** An unfinished/failed operation is presented as an ordinary completed opening or the readout prevents normal recovery.

29. **Switch recognition and the complete copied report.**  
    **Setup:** Ordinary address, `?timing`, unrelated query, hash containing “timing”, and a query containing timing alongside another parameter. **Action:** Reload each; where enabled, compare the approved card text with Copy all. **Expected:** The explicit switch controls the feature, and Copy all carries all rows with their context (**Promise; Window**). **Disproof:** A hash/unrelated parameter enables it, removal on a fresh load leaves it active, or copied values lose meaning or disagree with the displayed report. For valued variants such as `timing=false`, record the current interpretation rather than inventing a ruling.

30. **“Download times” versus the approved contents.**  
    **Setup:** A visibly slow download with known duration and size. **Action:** Inspect all sections and Copy all. **Expected:** **RECORD exactly what it shows.** D2481 broadly says download times; the pinned approved text supplies sizes and cache counts, with no separate download-duration row. **Disproof:** Any size or page duration is presented as though it were a separately measured download duration. The unresolved breadth of the wording should be reported, not silently expanded into a new design.

For each walked case, retain the starting state, actual gesture, visible result and independent timing/network observation. For overlap cases, include a hit-tested click or tap on the control: a picture alone cannot prove it remains usable.

**Code already wrong, with precise repair steps**

These are proposed repairs, not edits made during this task.

1. **The loading-claw check searches the wrong place.**  
   [TimingReadout.tsx:59](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:59) searches inside the page section. [pageclaw.ts:48](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/pageclaw.ts:48) appends the claw to the document body. A selected empty or failed page can therefore complete.  
   **Fix:** First identify the active page’s actual readiness and failure state. Check its body-level claw or its maintained busy state, alongside actual renderer readiness. Then recheck page, session and readiness after the final frames before committing a result. Do not convert a failure card into an ordinary successful-page sample.

2. **Measurement completion starts only after the deferred readout arrives.**  
   [timing.ts:24](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/timing.ts:24) queues start marks; [TimingReadout.tsx:181](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:181) later attaches the completion logic. Past completion cannot be recovered by inspecting today’s screen.  
   **Fix:** Move switch-guarded measurement collection into the lightweight collector. Capture completion when it actually happens, including attempt identity and outcome. Queue completed records for the deferred window to display. Keep rendering and its download independent of measurement completion.

3. **The sign-in shortcut discards legitimate destinations.**  
   [TimingReadout.tsx:78](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:78) always waits for the week; [line 85](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:85) discards every page mark within 50 ms. [Login.tsx:39](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/Login.tsx:39) deliberately reopens Tracker or Leave War after Retry.  
   **Fix:** Give each accepted attempt an explicit destination/outcome. Remove the time-proximity heuristic. Suppress only an explicitly identified duplicate normal-week landing. Cancel an inapplicable week watcher, reset the previous attempt’s displayed result, and measure the reopened page normally. Any new explanatory wording must follow the existing design process.

4. **Session changes and final frames can leave obsolete watches alive.**  
   [TimingReadout.tsx:47](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:47) cancels only a newer watch of the same kind; [line 53](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:53) does not recheck visibility at completion.  
   **Fix:** Introduce navigation/session generations. Invalidate old work on every relevant transition, before duplicate filtering. Recheck the generation and readiness at final completion. Ensure sign-out cannot leave a page watcher waiting to finish in the next session.

5. **Page download attribution is not page-specific.**  
   [TimingReadout.tsx:64](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:64) totals all matching same-origin script/style resources beginning after the mark. [Line 89](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:89) forces repeat visits to zero.  
   **Fix:** Associate a page with its actual dependency/resource set and observed loading interval. Account for already-in-flight prewarming. Exclude unrelated page and readout resources. Keep “unknown” separate from zero, and report observed repeat transfers honestly. State clearly whether a displayed size means transferred bytes or file-body size; those differ. [Browser resource-size definitions](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/transferSize).

6. **Pixel ratio is incorrectly labelled as zoom.**  
   [TimingReadout.tsx:123](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:123) supplies `devicePixelRatio`; [timingtext.ts:104](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/timingtext.ts:104) labels it percentage zoom. Pixel ratio also reflects display density. [Browser definition](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).  
   **Fix:** Stop presenting that value as zoom. Either report it accurately as pixel ratio through the approved wording process, or represent unavailable zoom honestly. Do not infer reliable zoom from screen dimensions.

7. **Unavailable file totals can be printed as known zeros.**  
   [TimingReadout.tsx:95](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:95) can return an unsupported empty result; [timingtext.ts:79](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/timingtext.ts:79) prints its count and bytes unconditionally.  
   **Fix:** Track availability separately for count, size and cache information. Render each unavailable quantity using the required “not given…” wording. Retain genuinely known counts even if only their byte sizes are unavailable.

8. **Current information lacks update triggers.**  
   [TimingReadout.tsx:145](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:145) subscribes to timing changes; [line 185](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:185) adds freeze updates, but resource completion and viewport changes have no corresponding trigger.  
   **Fix:** Add guarded, batched notifications for the relevant resource and viewport changes. Update the readout’s own subscriber without broadcasting unnecessary app redraws. Use a consistent current snapshot for the displayed/copy operation.

9. **Copy feedback can describe the previous attempt.**  
   [TimingReadout.tsx:158](C:/Users/User/projects/Raptor-speed/raptor-port/src/ui/TimingReadout.tsx:158) sets success only on success but does not clear a previous success before another attempt. Both clipboard mechanisms failing otherwise produces no outcome feedback.  
   **Fix:** Reset feedback for each attempt, associate completion with that attempt, and show success only for its successful write. Provide an accessible failure/recovery route, such as selecting the full report for manual copying, with wording taken through the normal approval process.

The isolated checks supported the first five measurement concerns: a loading-shaped selected Tracker container completed in 48 ms; delayed readout attachment produced a roughly ten-second sign-in result; a Retry-style landing was suppressed and a later week visit completed the old sign-in; final-frame visibility loss still committed a result without a replacement watch; and unrelated resource sizes were added together. These establish faulty logic, not the exact timings a real browser will show.

**Explicit negatives**

- I checked the production page-changing callers and found no second independent page setter bypassing the shared one.
- I checked the nine page names against the page containers and found no omitted or mismatched page name.
- I checked for app Back/Forward routing and found none.
- I checked the readout import and found it guarded by the switch; I found no unconditional readout stylesheet import. Production download evidence is still owed.
- I checked the timing payload and copy formatter and found no person, credential or record-content field, and no timing-storage or telemetry writer.
- I checked ordinary page-A → page-B replacement and found cancellation already exists for that straightforward sequence. The defects concern other transitions and completion checks.
- I checked the freeze observer’s normal start path and found no second observer installed by folding/reopening.
- I checked the shared drag controls and found Copy/close controls excluded from starting a drag.
- I checked visible and copied wording and found they share the same row formatter.
- I found no issue here whose harm depends only on old stored data. All proposed scenarios can be exercised with fresh demo activity.

The remaining work is the production browser WALK, particularly real timing boundaries, cache/network evidence, focus, stacking and touch targets. No pass or release recommendation follows from this scenario design.

Rulings: none recorded this session; read-only assignment.

