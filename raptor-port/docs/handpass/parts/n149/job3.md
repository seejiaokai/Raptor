# Night of 22–23 Nov 26, job 3 — the builder's report (Request access's squadron; Admin → Squadrons)

Saved as it arrived (chat 149's helper; commit `3d4bb3a40`, branch `claude/msq-b1-screens-135`).

**Built.** (1) Request access asks the squadron (b1-5): "Squadron" first on the card, the store's squadrons by number, the
CAT choice's look, starting on the first (142) as drawn; sent with the request; hidden with one squadron in the store.
(2) Admin → Squadrons (b1-3, b1-4, b1-9, b1-10, p7): a "Squadrons" tile after Users for every admin, grey line "Places",
the map pin (`MapPinIcon`). The page: "Squadrons · N", a row each ("Home base · 61 people"); "+ New squadron" for a master
admin only; "Places · N", each "142 · 149 · Perth · GMT+8" (a squadron moving there tomorrow counts). A squadron's row
opens only for an admin of it: its Place list ending "+ New place…" (name and time zone in the same form), D2306's line
"Saved at once. The new place applies from tomorrow.", Save moves it from tomorrow — the move and a new place one Undo
step. A place's row opens for every admin (Name, Time zone as "Perth · GMT+8"); where the door refuses him, Name, Time
zone and Save greyed with the door's words (two squadrons: D2336's sentence; three: "Only an admin of 142, 149 and 150 can
change the time zone: all three squadrons are here."). "+ New squadron": number (faded "150"), Place (with "+ New
place…"), First admin ("Pick an admin…", only admins the door accepts), the line "Hunter gets Plan of 150, full access to
it, so 150 starts with an admin." (number and admin filled), "Saved together: 150 and its new place, Northern base." when
a place is new; one Undo step; a refusal keeps the form open with why; the new row wears the just-added ring 6 s.
`src/ui/SquadronsPanel.tsx`, `src/ui/squadrons-model.ts`; `state/units.ts` — `addUnit`'s first-admin checks as one
function `firstAdminProblem` (the list and the save share it), a new `mayMoveUnit`; nothing the doors accept or refuse
changed.

**Tests:** `src/ui/msq-squadrons-panel.test.tsx` 12, red against a stub of the panel, then 12/12; `accounts-newperson.test.tsx`
NP4's labels start with "Squadron" (D2111 — the intended change). **Checks:** 38 unit files under the lock 463 passed, 1
failed (NP4, then fixed, 26/26 alone); build under the lock; code check no new finding; docsize; rulecheck OK. One slip: a
last two-file re-run without the lock.

**Measured** (`scripts/handpass/n149/measure-job3.mjs`, at the drawings' sizes 1440 / 390 Chromium and 1536 / 402 WebKit):
b1-5 within 1px; b1-3, b1-4, b1-9, b1-10 the drawings' spacing exactly, all 60px lower (desktop) / 67px (phone) under the
Admin panel's own cyan "SQUADRONS" heading (and back arrow on a phone), which the drawing scripts had hidden — kept.
**Left:** p7 — Name and Save greyed as well as Time zone (the door refuses a rename too), the app's own faded look a
little fainter than drawn, the squadrons list shown above Places; b1-9 — the drawing's first-admin list had a member and a
made-up place, the built list is the real one (Hunter · 142, Kestrel · 149); WebKit at 402 — WebKit's grey drop-downs, the
time zone box cuts "Darwin · GMT+9:30" short as drawn; b1-4, b1-9 use D2306's words.

**Words in no drawing:** hover texts "Change 142's place", "Only an admin of 149 can change its place.", "Change Home
base"; "Saved together: 150 and its new place. …" before the name is typed; "Saved" (existing); "1 person".

**Its decisions for his look:** the Squadron choice starts on 142 as drawn (risk: a newcomer who leaves it asks the wrong
squadron — "Pick…" first would avoid it, not drawn); Name greyed with Time zone on a shared place; a squadron row he
cannot change does not open; a new place's time zone starts on the first place's; the first-admin list also leaves out
suspended accounts and archived men; the just-added ring on a new squadron; the Admin heading with its back arrow on a
phone.
