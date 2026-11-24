# [MSQ-PICK-GUARD] the second questions page — presser P2's report: Admin → Users, the bell, his own pages, a save still going (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-q2-press-brief.md` §P2. An Opus helper; saved whole from its hand-back by the host.

---

## P2 — Admin → Users, the bell, his own pages, a save still going (pressed 25 Nov 26, app at 4700)

Nothing under `src` changed; nothing committed. Scripts: `raptor-port/scripts/handpass/n175/p2-*.mjs` (I wrote the shared `lib.mjs`; it did not exist). Pictures (whole + `-crop`, ringed): `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/p2-*`. Logs: `raptor-port/.tmp/n175/p2/`. Desktop Chromium 1536×864, phone WebKit 402×874 touch; d and p alike unless said. Every fact is from a FACT line.

### 1. Admin → Users — Saber on 142; pick 149 (top-bar picker / ☰ list) and member-view switch (badge / ☰ role line) — `p2-users.mjs`

| Case | Pick 149 | Back on 142 | Member view | Picture `p2-users-…` |
|---|---|---|---|---|
| (a) Hunter's row, Role Admin → Member, nothing typed | Nothing asked; 149's Users, row gone | Row open again, Role **Admin** — change lost | Nothing asked; View-only Sched; back: row closed, lost | `a-{d,p}-pick-1-before`, `-2-after` |
| (b) Give access form, words typed | Nothing asked; no form on 149 | Form **open again, words kept** | Nothing asked; back: closed, lost | `b-{d,p}-pick-1-before`, `-2-after` |
| (c) Add a person, "Nfive" typed | Nothing asked; **form stays filled on 149, Home squadron now 149** | "Nfive", Home 142 | Nothing asked; back: box empty | `c-{d,p}-pick-2-after` |
| (d) archived Ace's row, name → "Acey" | Nothing asked; row gone | Row open again, **"Ace"** — lost | Nothing asked; back: closed, lost | `d-{d,p}-pick-1-before`, `-2-after` |
| (e) + New squadron, "150" typed | Nothing asked; **form stays open on 149 with "150"** | Still "150" | Nothing asked; back: closed, lost | `e-{d,p}-pick-2-after` |
| (f1) row typed → Squadrons → back to Users | — | Row **open, words kept**; nothing asked | — | `f1-{d,p}-back` |
| (f2) row typed → Squadrons → door | Nothing asked | Row open again, box back to "ad2" — lost | Nothing asked; lost | `f2-{d,p}-pick-2-after` |
| (g) row typed → Inputs tab | Nothing asked; back on Users the row is **closed, words gone** | — | — | `g-{d,p}-back` |

### 2–5. The bell — `p2-bell.mjs` (set-up by presses: `p2-bell-setup.mjs`)

| Case | Presses | Today | Typing / record | Picture `p2-bell-…` |
|---|---|---|---|---|
| 2. Other squadron's line, no window (Hunter, Plan of 149, on 149) | Bell → 142 line "Duty Tue 8 Dec · You were added · Saber" (blue dot) | List closes; **bar 142**, Inputs, "Hunter · 8 Dec" window live. Reopened: line **read** (dot gone, dimmed). Pressed again from 149: same | — | `line-{d,p}-1-before`, `-3-line-after` |
| 3. Bell tap, own OIL question (Ranger, member, 142; 8 Dec made a holiday) | Bell, nothing open | Toast "Weekend/PH work — confirm your OIL"; "Ranger · 8 Dec" window with "OIL: Ranger, Duty … Does it deserve FO, a full day of OIL?" | — | `tap-{d,p}-ranger-none-after` |
| 3. same, his other input open, words typed | Bell | d: card "This input has unsaved changes. Open Ranger’s input and lose them?" (Discard and open / Keep editing). **p: bell under the window's title strip — not pressable** | Kept | `tap-{d,p}-ranger-input-after` |
| 3. Hunter (142 admin), same question | Bell | **No direct opening**: the list opens (holiday line "2 inputs need an OIL answer" first). With an input open: d list over the window; p bell under the window's ✕ | Kept | `tap-{d,p}-hunter-*-after` |
| 3. Access alert (request to 149; Saber on 142; bell lit only once his Show chip "149" was switched on — it was off) | Bell, nothing open | **149 entered**, Admin → Users, toast "1 waiting for access to 149" | — | `access-{d,p}-none-after` |
| 3. same, Drifter's input open, words typed | Bell | d: **149 entered**; the 142 window stays greyed, band "This is 142's. You picked 149 — close this to go on." p: bell under ✕ | Kept | `access-d-input-after` |
| 4. Bell's OIL tap on 149 (Ranger, View of 149) | Bell | **Bar to 142 first**, his window + OIL question; Save, Delete, Remarks live. "Yes: credit FO" → "OIL answer saved" | 142 input, OIL 8 Dec = 1, bar reading 142 | `oil-{d,p}-ranger-1-after-tap` |
| 4. Hunter (Plan) on 149 | Bell | List opens, no direct opening | — | `oil-{d,p}-hunter-1-after-tap` |
| 4. Hunter opens 142's OIL list (holiday line), then picks 149 | Pick | Nothing asked; **bar 149, "OIL — Tue 8 Dec · Public holiday · N175 Day" stays open and live**. Yes · FO + Save → "OIL answered for 1 input" | **142's input written under a bar reading 149** | `oil-{d,p}-hunter-list-after-pick` |
| 5. Own page from a squadron he views (Ranger, View, on 149) | Bell → his 142 line; also with a day's ⓘ open | **Bar 142**, Inputs, his window opens live; the ⓘ closes, nothing said | — | `own-{d,p}-none-2-after`, `-dayinfo-2-after` |

### 6. Save going, fails after the pick — `p2-save.mjs`
Drifter's input, Remarks typed, Save, pick 149 at once (d 74 ms, p 199 ms). At the row press: "Saving…". After: bar 149, **"Not saved — keep this page open" + Retry on 149**. Retry still failing: same. Stand-in lifted, **Retry on 149 saves Drifter's 142 input** (its record and a change-log entry stamped 142); band clears, bar stays 149. On p the ☰ menu was still open after the pick. `p2-save-{d,p}-1-not-saved-on-149`, `-2-after-retry`.

### What surprised me
1. "Add a person" carries its typing to 149 and its Home squadron switches to 149.
2. Typing in "+ New squadron" and Give access survives a pick; a row's edit is silently put back; the member-view switch loses all.
3. 142's OIL list stays live under a bar reading 149 and writes 142's records.
4. The access-alert tap moves him to 149 with a 142 Input window open (greyed).
5. A 149 request does not light Saber's bell until "149" is on under Show.
6. On a phone with an Input window open, the bell cannot be pressed.

### Stand-ins
- Case 6: storage refuses every write (localStorage.setItem throws) from just before Save, lifted before the last Retry. "Slow" is the app's own ~0.3 s wait before sending, the pick pressed inside it; storage itself cannot be made to wait.
- Set-ups saved after presses and copied into fresh browsers (rights given, inputs filed, holiday added and its list left with "Later", requests made on the sign-in card).
- Phone typing set through the box's own input event (n166's way).

### Not pressed
- Case 5 with the Changes window: no change count on 149's View-only Sched in the demo; Day details ⓘ used.
- The bug-report and "Notifications cleared" bell taps: not raised (time).
- Hunter's own direct OIL tap: as a 142 admin his question is under the holiday line, so the tap opens the list.

### Re-run order (repo root, each `d` then `p`)
`p2-users.mjs` (~4 min) · `p2-bell.mjs` (own set-up) · `p2-save.mjs`. `p2-probe.mjs`, `p2-oilprobe.mjs` only found controls.
