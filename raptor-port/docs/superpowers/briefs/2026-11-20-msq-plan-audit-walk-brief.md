# [MSQ-PLAN-AUDIT] — the walk's brief (walker A, Sonnet; chat 126, 20 Nov 26)

You walk the running app as a person would, signed in as **Hunter, 142's admin, holding Plan of 149** (his D2201: full
access to 149, "its people and their sign-ins" — D2211), and record what each screen says. Read
`raptor-port/docs/walk-scripts.md` §1–§5 and §7 first, whole. Work from `C:\Users\User\projects\Raptor-msq\raptor-port`.

## The machine's traps (carry them yourself)
- Write every script with the file-writing tool, saved as UTF-8, and run it from `raptor-port/` with `node <file>` —
  never pass a script inline to the shell (backslashes are lost; an apostrophe in a here-document never parses). A
  script prints a version line first; never rewrite a script and run it in one step.
- Your files: scripts under `raptor-port/scripts/handpass/msq/` named `msq-pa-a-*.mjs` only (prove each name free with
  a listing first); nothing else written outside your picture folder and your report.
- **The recipe:** `raptor-port/scripts/handpass/msq/msq-pa-host.mjs` — the host's passing run of the route every
  scenario starts from. Copy its first lines (the settings, `MSQ_WHO` set to `a`, `MSQ_RUN` to `desktop` or `phone`),
  its setup of Hunter's Plan of 149 (a stored row written BEFORE anyone signs in, then a reload — no screen gives Plan
  yet; setup only), its sign-in through the card and its way to Admin → Users (the desktop's "Admin" tab, the phone's
  menu then "Admin"; the "Users" category), the search box and a row opened by its header.
- The frozen build: `MSQ_DIST` as in the recipe, bundle `index-a7kr8dHR.js`. The library refuses any other bundle. Do
  not build, do not run any test suite.
- Each scenario starts in a fresh world (`X.open(...)` makes a new browser context with empty storage).
- Pictures: `X.pic(w, name)` saves to `raptor-port/docs/img/handpass/2026-11-20-msq-plan-audit/a/<desktop|phone>/`.
  One picture right after each press that matters (within about 100 ms on the phone) AND the settled one.
- Both sizes: desktop (`PA_PHONE` unset — Chromium 1536×864) and iPhone (`PA_PHONE=1` — WebKit 402×874, taps).
- Stop and report after 3 failed attempts at one gesture. Close every browser you start.

## The scenarios — each EXPECTED line names its source; "RECORD" means write exactly what the screen says
- **S1 — Hunter (Plan of 149) acts on Osprey, 149's member** (source: D2201 / D2211, and the code's door
  `otherSquadronProblem`, which counts a Plan holder an admin of 149 — the host's roll-call):
  - (a) Suspend → EXPECTED: no refusal; Osprey's Sign-in dot turns red. Then Enable → green again. Then the top bar's
    Undo, then Redo → RECORD what each shows and the dot after each.
  - (b) Role → "Admin — schedules and manages", Save → EXPECTED: saved, no refusal; his row reads Admin (D2201's
    reading told to him: a Plan holder may make a 149 man an admin of 149). Undo → RECORD.
  - (c) Archive → RECORD every question it asks and its words; complete it. EXPECTED: no "He is 149's…" refusal. Then
    open his archived row and Restore → RECORD.
  - (d) In a fresh world: Delete → RECORD the first tap's question; tap again → EXPECTED: no "He is 149's…" refusal;
    RECORD what happens.
- **S2 — the control: Hunter WITHOUT Plan** (no stored row): Osprey's row → Suspend → EXPECTED refused, the words
  "He is 149's. Only an admin of 149 can change his account." (source: `state/accounts.ts otherSquadronProblem`, as on
  this build — RECORD exactly if different); then Archive → RECORD.
- **S3 — the last admin (kept out on purpose — the last-admin count reads 149's admins at home only; D2184 Q10's words):**
  Hunter (Plan of 149) → Kestrel's row → Suspend → EXPECTED refused: "Kestrel is 149's last admin. Make another admin of
  149 first." Then make Osprey an admin (as S1 b), then Kestrel's Suspend again → RECORD (expected: allowed).
- **S4 — a master admin's account (kept out on purpose, D2205):** Hunter (Plan of 149) → Saber's row → Suspend →
  EXPECTED refused "Only a master admin can do that". Role → Member, Save → RECORD.
- **S5 — the bell (RECORD only):** in one world: Osprey (`us9`) signs in, files a leave (LL) for himself on a July day
  on his Inputs page (`msq-fr17-lib.mjs fileLL` is a helper you may copy), signs out; Kestrel (`ad9`) signs in → open
  the bell → RECORD its lines and picture; sign out; Hunter (`ad2`, Plan of 149 stored) signs in → open the bell →
  RECORD. Then, as Hunter, archive Osprey (S1 c) and sign in as Kestrel → bell → RECORD.
- **S6 — Hunter's own pages (RECORD):** Hunter with Plan of 149: the Inputs page's list, the Leave War, Quals — whose
  people each shows (EXPECTED 142's — no screen picks another squadron today; source: the session's squadron is his
  home), with a picture each.
- **The plain-user round (D1557), on Admin → Users:** every control that opens or closes — a row opened and closed by
  its header, by Cancel, by Escape (desktop), by a tap outside; the search box typed and cleared by its ✕; after S1's
  changes, Undo and Redo from the top bar; then look at the other places the result shows — Quals (Osprey's row), and,
  signed in as Kestrel, 149's Leave War (Osprey's row after S1 c's Archive and Restore). Pictures of each.

## Your report
Write `raptor-port/docs/handpass/parts/2026-11-20-msq-plan-audit/walker-a.md`: one row per step — scenario, size, what
you pressed, EXPECTED, what the screen said (exact words), PASS / FAIL / RECORDED, picture file. Then errors seen in the
console, and anything you could not reach. Send ONE short hand-back after stopping every script and browser.
