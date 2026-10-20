# Single-seat jets — the app works with only the front seat filled (his intent, 21 Oct 26 — D1099)

**His words (21 Oct 26):** *"Allow single seat which is FCP filled only to also work normally like flagging etc. because
this app is eventually going to be extended to an F-16 sqn and potentially F-35 sqn. So F-16 have mixed configuration.
Some might be double seat some might be single seat. F-35 are all single seat. So I want to make sure the all still works
if there are only single seats. Also for f-35 maybe the app admin setting can also toggle to turn off RCP from displaying
on their app. So just FCP only pilots."*

## What it means

1. **A line with only its front seat (FCP) filled must work as fully as a two-seat line** — every check and warning,
   every mark on a puck, every count (Insights, OIL, the Leave War's manning, the SANS calendar's pilots / WSOs), every
   page that draws a line (View and Edit Schedule, the Scheduler Board, the PDF, the changes window).
2. **An F-16 squadron flies a mixed fleet** (some jets single-seat, some two-seat); **an F-35 squadron is all
   single-seat.** The app must serve both, beside today's two-seat squadron.
3. **His idea, not yet designed:** an admin setting that switches the back seat (RCP) off for a squadron, so its
   schedule shows front-seat pilots only. Since D1100 (21 Oct 26) it is one of the aircraft-type settings that carry a type's
   rules (`docs/architecture-direction.md` §3).

## What already bears on it

- **D622 (7 Oct 26):** the day's requirement is kept as two figures, pilots and WSOs, for exactly this reason.
- **D288, D289 (27 Sep 26):** a community is the squadrons flying one aircraft type; a guest from another community is
  always marked ("Viper · F-16").
- **Today's checks read the back seat in several places** (seen 21 Oct 26 in the schedule's checks): the pilot/WSO
  pairing rules (an OCU pilot with a WSO, CO approval pairings), a passenger in the back seat, and air-to-air refuelling
  training, which needs an instructor sitting behind the pilot (with an empty back seat it is flagged today). Which of
  these change for a single-seat jet — and how the app tells a single-seat sortie from a two-seat jet whose back seat is
  not filled yet — are his questions, put to him after the check below.

## The steps

1. **The check (no change to the app):** every place the app reads the back seat, and what each does when only the front
   seat is filled — read in the code and walked on screen — written up as a list for him: what already works, what
   breaks, and the questions the design needs. Filed as [SINGLE-SEAT].
2. **His answers** — rounds of at most four questions, each with a recommended answer and a picture (D853).
3. **The build**, on his word.
