# The drawings: the end-time guard rail (G1–G4) and six untrue sentences (F1–F6)

## Where everything is
- **The folder:** `C:/Users/User/projects/Raptor/raptor-port/docs/mock/2026-11-25-guardrail-wording/`
  - `drafts.md`: for each of G1–G4 and F1–F6, where it is, today's words, the drafted words, the pictures and every
    QUESTION FOR HIM.
  - `img/`: 82 pictures. Each is a today / proposed pair, at desktop (1536 x 864, Chromium, 2x) and phone (402 x 874,
    WebKit, touch, 3x) size where the screen exists on the phone.
  - `img/facts-*.json`: what the runs read off the screen.
  - The scripts: `kit.mjs` (shared), `draw-g.mjs` and `draw-f.mjs`.
- **Nothing committed or pushed.** The branch was not switched.
- **The checkout differed from the brief.** The checkout at `C:/Users/User/projects/Raptor` is not on a detached HEAD:
  it is on `claude/sans-leftovers-179`. The folder above is new and untracked there; nothing else in it was touched.
- **The audit briefs and pictures are not in that checkout.** They are on the audit's worktree, branch
  `claude/readings-lapse-fix-fdbb3c`, at
  `C:/Users/User/projects/Raptor/.claude/worktrees/chat-156-handoff-a6d8d7/raptor-port/docs/superpowers/briefs/` and
  `…/docs/img/handpass/2026-11-25-audit-round1|2/`. I read them there.
- **Build and server.** Driven build: `D:/raptor-work/c173-main/raptor-port/dist`, served by `npx vite preview` on
  **port 4791** (checked free first). The server is stopped. No build and no test suite were run.
- **Clock and sign-ins.** The clock was installed at Wed 15 Jul 26 09:00 in every world. Saber (ad/a), Ranger (us/us)
  and Hex (hex) signed in.
- **Staging.** All staging was done through the app's own controls on the desktop. The store (with its IndexedDB) was
  then handed to a phone world, so nothing was typed on the phone.

## What was drawn

### G — the end-time guard rail
**The day.** Saturday 18 Jul, from Thursday's template. VL's landing was cleared (Hunter and Ranger on it), and the SXO
desk's END was cleared (Ridge on it).

**G1 and G2 (the red edge).**
- The red edge is one class added to the empty end boxes the app drew, found on screen by the script. It was drawn on:
  - Edit Schedule's week: the landing (G1), the SXO END (G2) and the AMT BRIEF / DEBRIEF ENDs (g2b);
  - the Scheduler Board's landing box (desktop and phone).
- **The red used:** the app's warning red, `--hard` #F0555F. The app already draws it on these same time boxes when
  their warning is tapped (`.badtm.wfoc`, a 2px edge) and on the Logic page's refused value box (`.lgin.bad`).
- **The shape used:** the app's own resting mark on a take-off / landing pair (`.badtm`, today amber): a 1px edge on the
  week, the border on the board's box.

**G3 (Publish).** The real states were pictured first:
- the greyed "Publish day" with its hover words "Sign off CUR CK, SKED CK, PLANNED BY, APPROVED BY before publishing
  Saturday";
- the real publish with the landing and END blank: "Saturday 18 Jul published and approved. The SXO desk has no usable
  times, so nobody on it earns OIL."

Then the grey "Blocked:" note in two forms, the count (as ruled) and the items named.

**G4 (a sign-off box).** The real signing was pictured first ("CUR CK Ace"). Then the box left empty with the grey
"Blocked:" note.

### F1–F6
**F1.** Staged as the audit did. Three places were drawn:
- the ALL AVAIL window's foot line;
- a man's hover words inside that window (Reaper);
- Ranger's own puck's hover words on "Sim prep".

**F2.** The Leave War's card, for two people on the published Saturday:
- Hunter's card, the admin's view;
- Ranger's own read-only card, the member's view (the sentence is printed twice in the code).

**F3.** Three places:
- Hex opening the Training Ranger filed for Ace (desktop and phone);
- the Delete key's note (desktop only: a phone has no Delete key).
- The drag sentence was not drawn, being unreachable as the audit found. Its words are drafted in drafts.md.

**F4 (his words, D2615).** Four places:
- the Legend;
- Monday's warning headings;
- the Logic page's four check names;
- the Logic page's key of flags.

**F5.** Two places:
- the hide ✕'s hover words;
- the note after the real press of ✕.

**F6.** The Logic page line.

## What could not be drawn, and why
- **No real refusal of Publish or a sign-off box exists today.** So the "Blocked:" note was raised through the app's own
  note function (`window.toast(words, 'blocked')`): the built grey face, with the drafted words. This is the way the
  5 Nov 26 refusal drawings raised notes no control reached. drafts.md says so.
- **A press on the greyed Publish today does nothing and shows no note** (read off the screen). Because the sign-off
  boxes are refused first, "Publish says how many" can only come from that press. This is put to him as G-Q3.
- **Not staged:**
  - a "TBD" landing;
  - an amendment's "Publish AL1";
  - F3 with the members' switch off;
  - F2's input-credit sentence ("Earned off a duty input…"), because no input-earned OIL was reached;
  - F6's information-only case.
- **Not drawn:** the "You can only edit / delete your own inputs" sentences (same family as F3); a flagged puck's hover
  words ("Misses …", the same list as F4).
- **The drawing check's recorder (walk-scripts §10) was not run.** It needs a part list per screen. These are word
  changes plus one class, and their measures would be the text's. The build job's drawing check should add a spec if
  it wants one. Say so if that is wrong.

## Where the app differed from the brief
1. **The demo's AMT sim block carries BRIEF and DEBRIEF rows typed with a start and no end** (Thursday's, copied to
   Saturday). Under the rule as recorded ("a sim") these are items with no end. So Saturday has **4** such items, not
   the brief's 2, and every day with an AMT block like the demo's would be blocked. The Logic page treats a DEBRIEF row
   with no end as normal ("an AMT's DEBRIEF row … where that row has no end"). Drawn outlined and counted, by the rule
   as recorded. Put to him as G-Q1, with a recommendation to leave them out.
2. **An empty END shows no mark today**, not even the grey dash a landing shows. On the weekend the only sign was the
   OIL line "SXO has no usable times, so nobody on it earns OIL for this day".
3. **F1: no record keeps who answered the OIL question.** After Saber's "No to all" the inputs hold `by` (Ranger),
   `modBy` (Saber, overwritten by any later edit) and the answer. D782 says each answer is "stamped with who gave it";
   the app does not keep that. The draft therefore names nobody (F1-Q).
4. **F4 reaches further than his ruling names.** The Logic page prints the same "Misses …" names twice (the four check
   names and the key of flags), and a flagged puck's hover words use the same list. Drawn on the Logic page and put to
   him (F4-Q). Each warning's own sentence also still says "Misses VL BFM brief …"; that is already ruled (D2424,
   D2427) and filed with [ALL-AVAIL-WINDOW-FLAGS].
5. **F5: today's words are true for every warning except a clash.** Only a clash is held by "same man, same two items"
   (D2001). So the draft gives a clash its own words and keeps today's for the rest (F5-Q).
6. **G3's example in the brief named "Hunter's VL landing".** The draft names items the way the warning list does,
   "VL SAT (T/O 12:45)", so a line with nobody on it can still be named.
7. **The Scheduler Board draws the formation's landing box twice** (once per jet row). Both are outlined.

## Facts files
Three runs leave facts files in `img/`:
- `facts-g.json` is the final G run.
- `facts-f-f6-f4-f5.json` holds the final F6 and F5 (and an earlier F4).
- `facts-f-f4-f3-f1-f2.json` holds the final F4, plus F3, F1 and F2 lines from a run that stopped part-way.
- `facts-f-f3-f1-f2.json` is the final F3, F1 and F2.

Every picture in `img/` is from its scene's final run. Four stale pictures from a superseded F4 Logic crop were deleted.

## Still owed before he sees it
- By D2441, every drafted sentence goes to a fresh Fable to review and adjust.
- The pages for him (an Artifact at 2x, tap to zoom) are not built. Only the pictures and drafts.md exist.
