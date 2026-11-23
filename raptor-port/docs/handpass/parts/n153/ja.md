# Walker A (`ja`): the Tracker's records kept apart

**Build:** `fcca051f0`, frozen, port 4711. **Sizes:** d = 1536 Chromium, p = 402 WebKit phone, pc = 402 Chromium phone (real finger, S22 only).
**Scenarios:** `docs/superpowers/briefs/2026-11-24-msq-night-scenarios-astra.md`. **Scripts:** `scripts/handpass/n153/walk/ja-*.mjs`.
**Pictures:** under `docs/handpass/2026-11-24-msq-night-check/ja/`; each path below is relative to that folder.
**Raw logs:** the session scratchpad, `job4/ja/log-*.txt`.

## Result

18 scenarios at 2 sizes = 36 rows: **34 PASS, 2 FAIL (S6 at both sizes)**. No page or console error in any of the 53 logged runs.
**No record of one squadron was shown in, or written to, another in any scenario.** S6's fault is a remembered *place* crossing squadrons, for a course copied by Export and Import. The records themselves stayed apart.

Parts not exercised, inside rows that otherwise pass:
- **S20:** a Retry that *succeeds* after the person has moved to another squadron. `?savefail` refuses every save for the life of the tab, so no control can make the retry land. Which squadron a held save lands in is therefore **unproved**.
- **S22:** a finger drag of a ball in the layout editor at phone size. WebKit has no real finger drag. In Chromium (pc) two tries, one with a 300 ms rest first, did not move the ball, so it is NOT WALKED there, and the script's "ball moved" FAIL line in `log-22-pc` is that set-up failing, not an app fault. The mouse drag at d passed. The finger pan at pc passed.
- **S19:** the overlap was attempted two ways: ordinary presses with no wait, and the write and the pick pressed inside one browser task. Every accepted write landed in its own squadron. The screen cannot show whether a write was still in flight at that moment, so this is "attempted at the fastest the driver allows", not a proven overlap.

## Scenarios

| Id | Size | Result | What the screen showed | Picture |
|---|---|---|---|---|
| S1 | d | PASS | Deleted event left both 142 courses and their marks (A 4→3, C 2→1); 149 kept the event and its mark; no come-back after reload | `j19-d/06-s1-142b.png` |
| S1 | p | PASS | Same | `j19-p/06-s1-142b.png` |
| S2 | d | PASS | Each Restore list held only its own squadron's course; restored students kept marks (142: 2, 149: 1), also after reload | `j11-d-s2/03-142-restored.png` |
| S2 | p | PASS | Same | `j11-p-s2/03-142-restored.png` |
| S3 | d | PASS | Four files: each held only its squadron; charts-only held no student, course or mark; full copy said "a full backup" | `j03-d-s3/02-142-full-done.png` |
| S3 | p | PASS | Same | `j03-p-s3/02-142-full-done.png` |
| S4 | d | PASS | Replace changed 142 only; hidden marks came back with the later chart (A 4, C 2); Add as new made a chart on 142 only; 149 whole after reload | `j03-d-s4/02-marks-back.png` |
| S4 | p | PASS | Same | `j03-p-s4/02-marks-back.png` |
| **S6** | d | **FAIL** | 149's copy reopened on the student and the chart last chosen on **142** | `j06r-d/01-149-student-after-142-chose.png`, `j06r-d/02-149-chart-after-142-chose.png` |
| **S6** | p | **FAIL** | Same | `j06r-p/01-149-student-after-142-chose.png`, `j06r-p/02-149-chart-after-142-chose.png` |
| S7 | d | PASS | Chart window and Show All agreed per squadron through Cancel, Save and Reset to doc, with picks before and after | `j07-d-s7/03-142-reset.png` |
| S7 | p | PASS | Same | `j07-p-s7/03-142-reset.png` |
| S8 | d | PASS | Pace, end dates, lulls and Copy to stayed per squadron; Undo waited for its squadron; Flex changed on 142 only; member read Flex with no field or Save | `j07-d-s8/05-member-flex.png` |
| S8 | p | PASS | Same | `j07-p-s8/05-member-flex.png` |
| S9 | d | PASS | Deleted person left the unfinished course, stayed with his mark on the completed one; others and 149 untouched, also after reload | `j09-d-s9/04-after reload-completed.png` |
| S9 | p | PASS | Same | `j09-p-s9/04-after reload-completed.png` |
| S10 | d | PASS | Medical counted 1 day for Hunter only; last-flown dates stayed on their person and squadron, also after reload | `j09-d-s10/05-hunter-back.png` |
| S10 | p | PASS | Same | `j09-p-s10/05-hunter-back.png` |
| S11 | d | PASS | Every add, rename, duplicate, reorder, delete and restore finished on its own squadron, on 142 and picking 149 first. A press on the squadron button with a window up was taken by the shade, closed the window and changed nothing | `j11-d-s11a/01-JA-written.png`, `j11-d-s11b/01-JB-written.png` |
| S11 | p | PASS | Same | `j11-p-s11a/01-JA-written.png`, `j11-p-s11b/01-JB-written.png` |
| S12 | d | PASS | Member, then Plan holder on 149: chart, event window, Info, Failures and totals agreed through a round trip, Undo, Redo and reload | `j12-d/03-plan-after-redo.png` |
| S12 | p | PASS | Same | `j12-p/03-plan-after-redo.png` |
| S13 | d | PASS | Master and Plan holder: question named 149; event saved to both 142 courses, never to 149, also after reload | `j13-d-saber/03-s13-142.png` |
| S13 | p | PASS | Same | `j13-p-saber/03-s13-142.png` |
| S14 | d | PASS | Stay and Escape kept 142 and the draft; Discard removed it; the later save held only the fresh edit | `j13-d-saber/07-s14-reloaded.png` |
| S14 | p | PASS | Same | `j13-p-saber/07-s14-reloaded.png` |
| S19 | d | PASS | Grade, failure and event deletion each finished in 142 when 149 was picked at once; reverse order also right; whole after reload (overlap: see above) | `j19-d/03-s19-reloaded.png` |
| S19 | p | PASS | Same | `j19-p/03-s19-reloaded.png` |
| S20 | d | PASS | See the record below | `j20-d/03-settled.png`, `j20-d/07-signout-after.png`, `j20-d/07b-signin-held.png` |
| S20 | p | PASS | Same | `j20-p/03-settled.png`, `j20-p/07-signout-after.png`, `j20-p/07b-signin-held.png` |
| S22 | d | PASS | No Find ring, saved word or move from 142 reached 149; marks after zoom and pan landed on the pressed event | `j22-d/04-149-after-drag.png` |
| S22 | p | PASS | Same, without the finger drags (above); pc walked the pan | `j22-p/03-149-after-zoom.png`, `j22-pc/03-149-after-zoom.png` |
| S23 | d | PASS | New squadron 155 opened on the demo course with no live marks of 142 or 149; first course, student and marks stayed on it; its first admin had its Tracker | `j23-d/05-first-admin.png` |
| S23 | p | PASS | Same | `j23-p/05-first-admin.png` |
| S55 | d | PASS | Member, own admin, Plan holder, master: every task finished, every opened control closed, the export agreed | `j55-d-master/07-chart-saved.png` |
| S55 | p | PASS | Same | `j55-p-master/07-chart-saved.png` |

### S20, what the screen says when saves are refused (both sizes)

- **Pick 149 → Save them:** the app **moves to 149**. The band "Not saved, keep this page open" with Retry stays up. Back on 142 the edit is drawn, with no Save button, under the same band.
- **Export → "Save, then export":** the Export window opens under the band, and the file **does hold** the unsaved event.
- **Sign-out → Save them:** he is signed out, and the sign-in screen carries the band. Signing in again in the same tab is held: "The last change has not saved yet — check the connection. Sign in waits until it saves."
- **After leaving `?savefail`:** the refused event is not on the saved chart, so nothing was falsely saved. A new edit saves and survives a reload.

## The FAIL in full

### S6: a course copied to another squadron shares its remembered student and chart

**Steps from a clean world** (script `ja-06r.mjs`, run at d and p; also `ja-06.mjs`, 4 FAIL lines at each size):
1. Sign in as Saber (`ad`). Tracker on 142. Pencil → Add course `JR-COPY`. Add students `JRALPHA` and `JRBRAVO`. Give JRALPHA a DCO on ST-01.
2. File → Export, tick Charts and Students & courses, All, Export.
3. Pick 149. File → Import that file. Press "Skip this one" for each chart, then OK to bring the students in.
4. On 149 choose course `JR-COPY`, Crew `JRALPHA`.
5. Pick 142. Choose `JR-COPY`, Crew `JRBRAVO`.
6. Pick 149. **It opens on JRBRAVO (0 done), not JRALPHA (1 done).**
7. Pick 142. On `JR-COPY` choose Syllabus `2024`.
8. Pick 149. **It opens on chart 2024, with an empty Crew box and "No students on this course yet."**

**What should happen:** each squadron reopens on the student and chart last chosen there (D376, D2395: "each squadron's pages are its own"; scenario S6: "Remembered selections identify the correct person and course within the correct squadron").

**What it costs a person:**
- 149's students look gone after someone only changed a chart on 142. They are not lost: picking 2026 by hand brings both students and the mark back.
- 149 can open on a different student from the one he left, so his next mark goes on that student unless he notices the name.
- It survives leaving the Tracker and signing out and in.
- Nothing was written across squadrons.

**Control:** the demo course `26ABSG`, on both squadrons but not copied, kept each squadron's own student. The fault needs a course brought over by Export and Import.

**A lead for the fixer, not checked further:** the app's remembered course is filed per squadron (`lastCourse@<unit>` in `src/tracker/app/core.js`), while the remembered chart and student (`lastSyl:<course>`, `lastCrew:<course>`) are filed per person and course only. An imported copy appears to keep the course's id.

## Odd things no scenario asked about (to check, not findings)

- **Export's file name can carry yesterday's date.** Early on 24 Nov the file was named `OCU-syllabus-2026-11-23.json` while the app's own "today" was 24 Nov. It looks like the name uses the UTC day. Seen in S3 and S20; not looked into.
- **S20a:** "Save them" that fails still completes the pick. The band keeps it from being silent, so it is recorded as a pass, but the owner may want to know the move is not held back by a failed save.

## Limits of this walk

- I opened the pictures behind the S6 FAIL and the S20 sign-in screen. The other rows rest on the checks the scripts printed from the screen; their pictures are cited for the host and were not each opened.
- The first runs of several scripts failed on my own script's mistakes (a wrong event id, a re-pick of the shown option, a substring match). Each was fixed and rerun; the rows above are the final runs.
