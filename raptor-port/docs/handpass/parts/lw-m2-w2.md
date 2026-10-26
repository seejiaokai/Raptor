# Leave War M2 bug check — walker 2: section B (16–22, an HO's half) and section C (23–32, the Available and Required rows)

Walked on the build at `fcddf90f4` served on `http://localhost:4173` (branch `claude/lw-m2-looks`), 23 Oct 26 (the machine's clock was 03:xx in Singapore).
Real browser (Chromium via Playwright), scripts in `raptor-port/scripts/handpass/`:
`lw-m2-walk-2-lib.mjs` (helpers), `lw-m2-walk-2.mjs` (16–19), `lw-m2-walk-2-s20.mjs` (20), `lw-m2-walk-2-c.mjs` (23–26),
`lw-m2-walk-2-c2.mjs` (21, 27–32), `lw-m2-walk-2-all.sh` (all of them in order, a full re-walk). Each step asserts the right
behaviour, so a PASS means correct. Pictures: `raptor-port/docs/img/handpass/2026-10-23-lw-m2-looks/w2/` (the pictures cited for a finding, and most of the others, were opened and looked at; the cell close-ups are small because a Leave War cell is
small). Sizes: desktop 1536×864 at 2× pixels, phone 390×844 with touch (iPhone user agent). Roles: admin `ad`/`a` (Saber, row
`stiff`), member `us`/`us` (Ranger, row `bane`). Worlds: `?fresh=1` for the walks that need nothing saved; the plain
address (real storage) for the walks that sign out and in, reload, or hand a world to a second browser (21, 27, 28, 31).
Console errors, page errors and 4xx responses were watched in every context: none were raised (list at the end).

**Result: 26 rows (scenario × size). PASS 20 · FAIL 3 (S23v, S26 desktop, S26 phone) · NOT RUN 2 (S18b ×2) · RECORDED 1 (S31).
S22 was not given a row by the script — NOT RUN, reason below.** The three FAILs are differences from the approved
pictures and the red list's words, not broken behaviour: every number, colour and refusal was right.

## The table (one row a scenario and size; the long notes follow)

| Scenario | Size | Role | Verdict |
|---|---|---|---|
| S16 | desktop 1536 | admin | PASS |
| S16 | phone 390 | admin | PASS |
| S17 | desktop 1536 | admin | PASS |
| S17 | phone 390 | admin | PASS |
| S18 | desktop 1536 | admin | PASS |
| S18 | phone 390 | admin | PASS |
| S18b | desktop 1536 | admin | NOT RUN |
| S18b | phone 390 | admin | NOT RUN |
| S19 | desktop 1536 | admin | PASS |
| S19 | phone 390 | admin | PASS |
| S20 | desktop 1536 | admin | PASS |
| S21 | phone 390 | member | PASS |
| S23 | desktop 1536 | admin | PASS |
| S23v | desktop 1536 | admin | FAIL |
| S24 | desktop 1536 | admin | PASS |
| S25 | desktop 1536 | admin | PASS |
| S26 | desktop 1536 | admin | FAIL |
| S26 | phone 390 | admin | FAIL |
| S27 | desk+phone | admin | PASS |
| S28 | desktop 1536 | member | PASS |
| S28 | phone 390 | member | PASS |
| S29 | desktop 1536 | admin | PASS |
| S30 | desktop 1536 | admin | PASS |
| S30 | phone 390 | admin | PASS |
| S31 | desktop 1536 | admin | RECORDED |
| S32 | desktop 1536 | admin | PASS |
| S22 | - | admin | NOT RUN |

## The rows in full

### S16 — desktop 1536 — admin — **PASS**
- Did: Saber: AM leave on Tue 27 Oct; +OIL 0.5 (Half row, PM lit) and Save; empty Wed 28 Oct +OIL 0.5 (AM lit) and Save; Thu 29 Oct +OIL 1 (no Half row) and Save
- Screen showed:
  - ✓ AM leave placed on 27 Oct: ["c k-ll s-w top"]
  - ✓ NOTE (not in the scenario): the bid window for a half-day leave is headed "Saber Tue 27 Oct NOW <LL" — the old arrow print "<LL" is still there
  - ✓ day with an AM leave, 0.5 typed: Half row shown=true, AM lit=false, PM lit=true (want PM only)
  - ✓ saved HO drawn bottom half: {"cls":"c k-oil s-a bot","text":"HO","x":0.07,"y":0.5,"w":0.83,"h":0.39}
  - ✓ the AM leave kept the top half
  - ✓ empty day, 0.5: AM lit=true, PM lit=false (want AM only)
  - ✓ saved HO on the empty day drawn top half: {"cls":"c k-oil s-a top","text":"HO","x":0.08,"y":0.08,"w":0.81,"h":0.39}
  - ✓ typing 0.5 shows the Half row (true); typing 1 takes it away (row now false)
  - ✓ the give button reads: Give FO
  - ✓ FO drawn as a whole box: {"cls":"c k-oil s-a whole","text":"FO","x":0.08,"y":0.08,"w":0.81,"h":0.81}
- Pictures: `s16-desk-a-half-row-pm-lit.png`, `s16-desk-b-ho-bottom-half.png`, `s16-desk-c-empty-day-am-lit.png`, `s16-desk-d-ho-top-half.png`, `s16-desk-e-one-day-no-half-row.png`, `s16-desk-f-fo-whole-box.png`

### S16 — phone 390 — admin — **PASS**
- Did: Saber: AM leave on Tue 27 Oct; +OIL 0.5 (Half row, PM lit) and Save; empty Wed 28 Oct +OIL 0.5 (AM lit) and Save; Thu 29 Oct +OIL 1 (no Half row) and Save
- Screen showed:
  - ✓ AM leave placed on 27 Oct: ["c k-ll s-w top"]
  - ✓ NOTE (not in the scenario): the bid window for a half-day leave is headed "Saber Tue 27 Oct NOW <LL" — the old arrow print "<LL" is still there
  - ✓ day with an AM leave, 0.5 typed: Half row shown=true, AM lit=false, PM lit=true (want PM only)
  - ✓ saved HO drawn bottom half: {"cls":"c k-oil s-a bot","text":"HO","x":0.08,"y":0.49,"w":0.8,"h":0.38}
  - ✓ the AM leave kept the top half
  - ✓ empty day, 0.5: AM lit=true, PM lit=false (want AM only)
  - ✓ saved HO on the empty day drawn top half: {"cls":"c k-oil s-a top","text":"HO","x":0.08,"y":0.07,"w":0.8,"h":0.38}
  - ✓ typing 0.5 shows the Half row (true); typing 1 takes it away (row now false)
  - ✓ the give button reads: Give FO
  - ✓ FO drawn as a whole box: {"cls":"c k-oil s-a whole","text":"FO","x":0.08,"y":0.07,"w":0.8,"h":0.8}
- Pictures: `s16-phone-a-half-row-pm-lit.png`, `s16-phone-b-ho-bottom-half.png`, `s16-phone-c-empty-day-am-lit.png`, `s16-phone-d-ho-top-half.png`, `s16-phone-e-one-day-no-half-row.png`, `s16-phone-f-fo-whole-box.png`

### S17 — desktop 1536 — admin — **PASS**
- Did: OIL tab: select Ranger and Saber together (Saber holds an AM leave on today, Fri 23 Oct; Ranger nothing), 0.5: look at the Half chips; Save; then Drifter alone, 0.5, press PM, Save
- Screen showed:
  - ✓ the credit bar names the picked people: "OIL credits · Ranger, Saber"
  - ✓ two people with different defaults, 0.5 typed: AM lit=false, PM lit=false (want neither)
  - ✓ Save without picking raised no refusal (null)
  - ✓ Saber (AM leave) took the PM: {"cls":"c k-oil s-a bot","text":"HO","x":0.07,"y":0.5,"w":0.83,"h":0.39}
  - ✓ Ranger (no leave) took the AM: {"cls":"c k-oil s-a top","text":"HO","x":0.07,"y":0.08,"w":0.83,"h":0.39}
  - ✓ one person with no leave: the default AM is lit (AM=true, PM=false)
  - ✓ after pressing PM: AM lit=false, PM lit=true
  - ✓ Drifter's HO saved in the PM, bottom half: {"cls":"c k-oil s-a bot","text":"HO","x":0.07,"y":0.5,"w":0.83,"h":0.39}
- Pictures: `s17-desk-a-two-people-neither-lit.png`, `s17-desk-b-after-save.png`, `s17-desk-c-saber-cell.png`, `s17-desk-d-ranger-cell.png`, `s17-desk-e-single-pm-picked.png`, `s17-desk-f-drifter-cell.png`

### S17 — phone 390 — admin — **PASS**
- Did: OIL tab: select Ranger and Saber together (Saber holds an AM leave on today, Fri 23 Oct; Ranger nothing), 0.5: look at the Half chips; Save; then Drifter alone, 0.5, press PM, Save
- Screen showed:
  - ✓ the credit bar names the picked people: "OIL credits · Ranger, Saber"
  - ✓ two people with different defaults, 0.5 typed: AM lit=false, PM lit=false (want neither)
  - ✓ Save without picking raised no refusal (null)
  - ✓ Saber (AM leave) took the PM: {"cls":"c k-oil s-a bot","text":"HO","x":0.08,"y":0.49,"w":0.8,"h":0.38}
  - ✓ Ranger (no leave) took the AM: {"cls":"c k-oil s-a top","text":"HO","x":0.08,"y":0.07,"w":0.8,"h":0.38}
  - ✓ one person with no leave: the default AM is lit (AM=true, PM=false)
  - ✓ after pressing PM: AM lit=false, PM lit=true
  - ✓ Drifter's HO saved in the PM, bottom half: {"cls":"c k-oil s-a bot","text":"HO","x":0.08,"y":0.49,"w":0.8,"h":0.38}
- Pictures: `s17-phone-a-two-people-neither-lit.png`, `s17-phone-b-after-save.png`, `s17-phone-c-saber-cell.png`, `s17-phone-d-ranger-cell.png`, `s17-phone-e-single-pm-picked.png`, `s17-phone-f-drifter-cell.png`

### S18 — desktop 1536 — admin — **PASS**
- Did: OIL tracker editor on Thu 29 Oct's FO (Saber): amount to 0.5, half untouched, Save; then 0.5 back to 1
- Screen showed:
  - ✓ found Saber's 29 Oct entry in the tracker: oil-entry-ol-mvjyp4nj40905
  - ✓ an FO's editor shows no Half chips (shown=false)
  - ✓ amount 0.5 shows the Half chips: AM lit=true, PM lit=false
  - ✓ the half saved equals the chip that was lit (AM): {"cls":"c k-oil s-a top","text":"HO","x":0.08,"y":0.08,"w":0.81,"h":0.39}
  - ✓ amount 1 takes the Half chips away
  - ✓ 0.5 back to 1 drops the half, a whole FO box: [{"cls":"c k-oil s-a whole","text":"FO","x":0.08,"y":0.08,"w":0.81,"h":0.81}]
- Pictures: `s18-desk-a-editor-half-chips.png`, `s18-desk-b-saved-half.png`, `s18-desk-c-back-to-whole.png`

### S18 — phone 390 — admin — **PASS**
- Did: OIL tracker editor on Thu 29 Oct's FO (Saber): amount to 0.5, half untouched, Save; then 0.5 back to 1
- Screen showed:
  - ✓ found Saber's 29 Oct entry in the tracker: oil-entry-ol-mvjyq3yu4kfek
  - ✓ an FO's editor shows no Half chips (shown=false)
  - ✓ amount 0.5 shows the Half chips: AM lit=true, PM lit=false
  - ✓ the half saved equals the chip that was lit (AM): {"cls":"c k-oil s-a top","text":"HO","x":0.08,"y":0.07,"w":0.8,"h":0.38}
  - ✓ amount 1 takes the Half chips away
  - ✓ 0.5 back to 1 drops the half, a whole FO box: [{"cls":"c k-oil s-a whole","text":"FO","x":0.08,"y":0.07,"w":0.8,"h":0.8}]
- Pictures: `s18-phone-a-editor-half-chips.png`, `s18-phone-b-saved-half.png`, `s18-phone-c-back-to-whole.png`

### S18b — desktop 1536 — admin — **NOT RUN**
- Did: the second half of scenario 18: change the award's date in the same edit to a day holding a PM leave
- Screen showed:
  - an award's date is shown, never changed, in the OIL tracker editor (a plain date reading, no picker) — the premise cannot be built through the app's own controls
- Pictures: (none)

### S18b — phone 390 — admin — **NOT RUN**
- Did: the second half of scenario 18: change the award's date in the same edit to a day holding a PM leave
- Screen showed:
  - an award's date is shown, never changed, in the OIL tracker editor (a plain date reading, no picker) — the premise cannot be built through the app's own controls
- Pictures: (none)

### S19 — desktop 1536 — admin — **PASS**
- Did: Mon 26 Oct: whole-day leave plus an HO (morning); tap the day for its list; Edit…, AM to PM, Save; Undo; Redo; read the list line
- Screen showed:
  - ✓ whole-day leave + HO on 26 Oct: ["c k-oil s-a right-am x0.5 y0.08 w0.39 h0.39","c k-ll s-w left x0.07 y0.08 w0.39 h0.81"]
  - ✓ a tap on a day holding two records opens the day's list (daylist visible=true, bid window visible=false)
  - ✓ list line before: "HO — OIL award, morning Edit… Delete LL — local leave · bid pending Approve Refuse ⇄Move Delete"
  - ✓ the editor opens with the award's own half lit (AM lit=true)
  - ✓ after Save the box moved to the bottom half: {"cls":"c k-oil s-a right-pm","text":"HO","x":0.5,"y":0.5,"w":0.39,"h":0.39}
  - ✓ list line after: "HO — OIL award, afternoon Edit… Delete LL — local leave · bid pending Approve Refuse ⇄Move Delete"
  - ✓ Undo moved it back to the top half: {"cls":"c k-oil s-a right-am","text":"HO","x":0.5,"y":0.08,"w":0.39,"h":0.39}
  - ✓ Redo put it back in the bottom half: {"cls":"c k-oil s-a right-pm","text":"HO","x":0.5,"y":0.5,"w":0.39,"h":0.39}
  - ✓ Undo button's title after the half pick: "Undo — Saber’s OIL award"
- Pictures: `s19-desk-z-whole-plus-ho.png`, `s19-desk-a-editor-pm-picked.png`, `s19-desk-b-after-save-list.png`, `s19-desk-c-undo-top.png`, `s19-desk-d-redo-bottom.png`

### S19 — phone 390 — admin — **PASS**
- Did: Mon 26 Oct: whole-day leave plus an HO (morning); tap the day for its list; Edit…, AM to PM, Save; Undo; Redo; read the list line
- Screen showed:
  - ✓ whole-day leave + HO on 26 Oct: ["c k-oil s-a right-am x0.5 y0.07 w0.39 h0.38","c k-ll s-w left x0.07 y0.07 w0.39 h0.8"]
  - ✓ a tap on a day holding two records opens the day's list (daylist visible=true, bid window visible=false)
  - ✓ list line before: "HO — OIL award, morning Edit… Delete LL — local leave · bid pending Approve Refuse ⇄Move Delete"
  - ✓ the editor opens with the award's own half lit (AM lit=true)
  - ✓ after Save the box moved to the bottom half: {"cls":"c k-oil s-a right-pm","text":"HO","x":0.5,"y":0.49,"w":0.39,"h":0.38}
  - ✓ list line after: "HO — OIL award, afternoon Edit… Delete LL — local leave · bid pending Approve Refuse ⇄Move Delete"
  - ✓ Undo moved it back to the top half: {"cls":"c k-oil s-a right-am","text":"HO","x":0.5,"y":0.07,"w":0.39,"h":0.38}
  - ✓ Redo put it back in the bottom half: {"cls":"c k-oil s-a right-pm","text":"HO","x":0.5,"y":0.49,"w":0.39,"h":0.38}
  - ✓ Undo button's title after the half pick: "Undo — Saber’s OIL award"
- Pictures: `s19-phone-z-whole-plus-ho.png`, `s19-phone-a-editor-pm-picked.png`, `s19-phone-b-after-save-list.png`, `s19-phone-c-undo-top.png`, `s19-phone-d-redo-bottom.png`

### S20 — desktop 1536 — admin — **PASS**
- Did: Edit Schedule: published Sat 18 Jul (SDO duty, Fable, 08:00-12:00) and Sun 19 Jul (SDO duty, Dash, 13:00-17:00); published Sat 25 Jul 10:00-14:00. Then the Leave War cells and the OIL tracker lines
- Screen showed:
  - ✓ the two men have cells on those dates: {"fable":true,"dash":true}
  - ✓ Sat 08:00-12:00 draws an OIL box in the top (morning) half: [{"cls":"c k-oil s-a top raptor","text":"HO*","x":0.08,"y":0.08,"w":0.81,"h":0.39}]
  - ✓ the box the schedule credited wears the star: texts ["HO*"]
  - ✓ Sun 13:00-17:00 draws an OIL box in the bottom (afternoon) half: [{"cls":"c k-oil s-a bot raptor","text":"HO*","x":0.08,"y":0.5,"w":0.81,"h":0.39}]
  - ✓ a 10:00-14:00 stretch counts as the morning: ["c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top raptor HO*","c k-oil s-a top rapt …
  - ✓ the OIL tracker line reads AM beside the date: Fable C 1 + 1 +0.5 18 Jul AM AUTO Weekend/PH Duty · 08:00–12:00 0.5 left +0.5 25 Jul AM AUTO Weekend/PH Duty · 10:00–14:00 0.5 left 
  - ✓ the OIL tracker line reads PM beside the date: Dash C 3 + 3 +1 carried in opening figure 1 left +0.5 19 Jul PM AUTO Weekend/PH Duty · 13:00–17:00 0.5 left +0.5 25 Jul AM AUTO Duty input Duty · 09:00–12:00 0.5 left +1 15 Aug FLT 1 left 
- Pictures: `s20-desk-a-published-weekend.png`, `s20-desk-a2-next-week.png`, `s20-desk-b-sat-am.png`, `s20-desk-c-sun-pm.png`, `s20-desk-d-oil-tracker.png`

### S21 — phone 390 — member — **PASS**
- Did: The admin gives Ranger an afternoon HO on Wed 28 Oct; sign out; sign in as Ranger; tap his own HO
- Screen showed:
  - ✓ set-up: Ranger holds an afternoon HO (bottom half): [{"cls":"c k-oil s-a bot","text":"HO","x":0.08,"y":0.49,"w":0.8,"h":0.38}]
  - ✓ the member sees his own HO in the bottom half: [{"cls":"c k-oil s-a bot","text":"HO","x":0.08,"y":0.49,"w":0.8,"h":0.38}]
  - ✓ a sheet opened: award-sheet
  - ✓ it names the half ("afternoon"): "Ranger Wed 28 Oct HO · OIL AWARD ✕ WHERE IT CAME FROM Given by an admin — only an admin can change it. REASON walk 2 award GIVEN BY Not given ENTERED BY Saber DAYS half a day, afternoon"
  - ✓ no Half chips, give button, days box or edit for the member: ["oil-detail","oil-detail-why","oil-detail-given","oil-detail-entered","oil-detail-days"]
- Pictures: `s21-phone-a-member-cell.png`, `s21-phone-b-member-sheet.png`

### S23 — desktop 1536 — admin — **PASS**
- Did: Type Required P 26, 27, 28, 29, 30 on Mon 26 to Fri 30 Oct; open the Available P window; Amber "+ 2", Red "+ 0", Save; Undo; Redo
- Screen showed:
  - ✓ Required P typed: 26,27,28,29,30
  - ✓ the window carries Amber and Red point boxes and the SANS line: "C TF AMBER when under Required RED when under Required SANS people are never counted here. The SANS calendar reads this row, so it cannot be deleted. On the SANS calendar, still needed is Required P less Available P, less the SANS committed to fly. On this war's  …
  - ✓ avail P after Save, Mon..Fri (need Req+2 amber, under Req red): {"26":"plain","27":"amber","28":"amber","29":"red","30":"red"}
  - ✓ no-Required days (Fri 23, Sat 24, Sun 25 Oct) show neither: {"23":"plain","24":"plain","25":"plain"}
  - ✓ Available W untouched: {"26":"plain","27":"plain","28":"plain","29":"plain","30":"plain"}
  - ✓ after Undo the amber is gone, red stays (red +0 is the old rule): {"26":"plain","27":"plain","28":"plain","29":"red","30":"red"}
  - ✓ after Redo the amber is back: {"26":"plain","27":"amber","28":"amber","29":"red","30":"red"}
  - ✓ Undo button title right after the points Save: "Undo — a change to an Available row on the Leave War"
- Pictures: `s23-desk-a-window.png`, `s23-desk-c-grid-after-save.png`, `s23-desk-d-after-undo.png`, `s23-desk-e-after-redo.png`

### S23v — desktop 1536 — admin — **FAIL**
- Did: Open the Available P window and measure its Amber and Red boxes against the approved picture r7-26-availp-desk (small boxes inline after "when under Required")
- Screen showed:
  - ✗ point boxes are small and inline as drawn (a box about 60 wide beside "when under Required"): built amber 534x40, red 534x40 in a window 560 wide
- Pictures: `s23v-desk-a-window.png`

### S24 — desktop 1536 — admin — **PASS**
- Did: Amber "+ 1", Red "+ 2" (red at or above amber): the window says amber never shows; Save; then Red "- 1", Amber "+ 0" with Required Fri 30 Oct = 30
- Screen showed:
  - ✓ the window says: "Red is set at or above amber, so amber never shows."
  - ✓ no amber on the grid: {"26":"plain","27":"red","28":"red","29":"red","30":"red"}
  - ✓ red from Req+2: 27 and 28 red, 26 plain: {"26":"plain","27":"red","28":"red","29":"red","30":"red"}
  - ✓ a negative red "- 1" is accepted: bad line shown=false, Save disabled=false
  - ✓ red "- 1", amber "+ 0": red only once two short (Fri req 30 vs 28), Thu (1 short) amber: {"26":"plain","27":"plain","28":"plain","29":"amber","30":"red"}
  - ✓ how the window reads the negative point back: reopen shows "− 1"
- Pictures: `s24-desk-a-window-hidden-line.png`, `s24-desk-b-grid-no-amber.png`, `s24-desk-c-window-negative.png`, `s24-desk-d-grid-negative.png`

### S25 — desktop 1536 — admin — **PASS**
- Did: Type "abc", "+", "200" and leave Red blank in the Available P window; look at Save and the line; Cancel and look at the grid
- Screen showed:
  - ✓ amber abc: Save disabled=true, line="Enter each as a number above or below Required, like + 2 or − 1."
  - ✓ amber "+": Save disabled=true, line="Enter each as a number above or below Required, like + 2 or − 1."
  - ✓ amber 200: Save disabled=true, line="Enter each as a number above or below Required, like + 2 or − 1."
  - ✓ red blank: Save disabled=true, line="Enter each as a number above or below Required, like + 2 or − 1."
  - ✓ pressing the disabled Save left the window open
  - ✓ nothing saved: before {"26":"plain","27":"plain","28":"plain","29":"amber","30":"red"} after {"26":"plain","27":"plain","28":"plain","29":"amber","30":"red"}
- Pictures: `s25-desk-x-amber-abc.png`, `s25-desk-x-amber-.png`, `s25-desk-x-amber-200.png`, `s25-desk-x-red-blank.png`

### S26 — desktop 1536 — admin — **FAIL**
- Did: Required P 27 (Tue) and 28 (Wed), points Amber "+ 2" Red "+ 0": amber-only days; then a pilot leave bid on Wed 28 Oct takes Available P under Required (red); open the red list; tap its line; delete the bid
- Screen showed:
  - ✓ two amber-only days: {"27":"amber","28":"amber"}
  - ✓ amber-only days leave the Manning button as it was (before: null, after: null) — "Manning" alone, no right half
  - ✓ Wed 28 Oct Available P is now 27 and red: "fr avail tap under"
  - ✓ the red count rose by one: "1 red ›"
  - ✓ the open-dates chip beside the red count is not cut short: {"text":"Bidding closed","cut":false,"w":104}
  - ✓ the list line names the row and its figure: "DAYS BREAKING A MANNING RULE 28 Oct 26 Available P 27" (drawn r19c: "Available P 23 of 24")
  - ✗ the line carries the "of <Required>" ending as drawn in r19c: false
  - ✓ a tap on the line took the grid to Wed 28 Oct (its date heading box {"x":211.328125,"y":233,"width":26,"height":45})
  - ✓ the list closed after the tap
  - ✓ after the bid is gone Wed 28 is back to amber-only: {"t":"28","c":"fr avail tap amb"}
  - ✓ at zero the right half vanishes, "Manning" alone: null
- Pictures: `s26-desk-a-manning-alone.png`, `s26-desk-b-red-count.png`, `s26-desk-c-red-list.png`, `s26-desk-d-after-jump.png`, `s26-desk-e-back-to-alone.png`

### S26 — phone 390 — admin — **FAIL**
- Did: Required P 27 (Tue) and 28 (Wed), points Amber "+ 2" Red "+ 0": amber-only days; then a pilot leave bid on Wed 28 Oct takes Available P under Required (red); open the red list; tap its line; delete the bid
- Screen showed:
  - ✓ two amber-only days: {"27":"amber","28":"amber"}
  - ✓ amber-only days leave the Manning button as it was (before: null, after: null) — "Manning" alone, no right half
  - ✓ Wed 28 Oct Available P is now 27 and red: "fr avail tap under"
  - ✓ the red count rose by one: "1 red ›"
  - ✗ the open-dates chip beside the red count is not cut short: {"text":"Bidding closed","cut":true,"w":74}
  - ✓ the list line names the row and its figure: "DAYS BREAKING A MANNING RULE 28 Oct 26 Available P 27" (drawn r19c: "Available P 23 of 24")
  - ✗ the line carries the "of <Required>" ending as drawn in r19c: false
  - ✓ a tap on the line took the grid to Wed 28 Oct (its date heading box {"x":107.140625,"y":266.1875,"width":20.796875,"height":44.1875})
  - ✓ the list closed after the tap
  - ✓ after the bid is gone Wed 28 is back to amber-only: {"t":"28","c":"fr avail tap amb"}
  - ✓ at zero the right half vanishes, "Manning" alone: null
- Pictures: `s26-phone-a-manning-alone.png`, `s26-phone-b-red-count.png`, `s26-phone-c-red-list.png`, `s26-phone-d-after-jump.png`, `s26-phone-e-back-to-alone.png`

### S27 — desk+phone — admin — **PASS**
- Did: Rename Required P to "Pilots req" (on real storage): the row name, the figure pad, the Required panel, the Available P window's SANS line; the phone's short name; rename back; Undo, Redo; reload
- Screen showed:
  - ✓ the row starts as "REQUIRED P"
  - ✓ the rename window holds the name alone: "Required P ✕ NAME Save Cancel"
  - ✓ the row name now reads "PILOTS REQ"
  - ✓ Undo button title right after the rename: "Undo — a Required row renamed on the Leave War"
  - ✓ the figure pad names the new name: "Pilots req Tue 27 Oct This day From 27 Oct on Enter next day · Tab the other seat · Esc leave it as it was"
  - ✓ the Required figures panel title reads: "Pilots req"
  - ✓ the Available P window's SANS line: "On the SANS calendar, still needed is Pilots req less Available P, less the SANS committed to fly."
  - ✓ after a reload (sign in again) the row still reads "PILOTS REQ"
  - ✓ on the phone a renamed row shows its new name, not "Req P": "PILOTS REQ"
  - ✓ the unrenamed Available P shows the phone short form: "AVAIL P"
  - ✓ renamed back: "REQUIRED P"
  - ✓ on the phone the original name shows "Req P" again: "REQ P"
  - ✓ Undo of the rename-back restores "PILOTS REQ"
  - ✓ Redo gives "REQUIRED P"
  - ✓ Redo/Undo wording seen on the Undo button after rename-back/undo: "Undo"
- Pictures: `s27-a-rename-window.png`, `s27-b-pad-title.png`, `s27-c-panel-title.png`, `s27-d-avail-window-sans-line.png`, `s27-e-phone-renamed.png`, `s27-f-phone-back.png`

### S28 — desktop 1536 — member — **PASS**
- Did: Tap the Required P, Required W, Available P and Available W names, and a Required cell
- Screen showed:
  - ✓ the row req-p is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the req-p name opens no rename or points window (opened=false)
  - ✓ the row req-w is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the req-w name opens no rename or points window (opened=false)
  - ✓ the row avail-p is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the avail-p name opens no rename or points window (opened=false)
  - ✓ the row avail-w is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the avail-w name opens no rename or points window (opened=false)
  - ✓ tapping a Required cell opens no figure pad (pad=false)
- Pictures: `s28-desk-a-after-taps.png`

### S28 — phone 390 — member — **PASS**
- Did: Tap the Required P, Required W, Available P and Available W names, and a Required cell
- Screen showed:
  - ✓ the row req-p is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the req-p name opens no rename or points window (opened=false)
  - ✓ the row req-w is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the req-w name opens no rename or points window (opened=false)
  - ✓ the row avail-p is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the avail-p name opens no rename or points window (opened=false)
  - ✓ the row avail-w is on the member grid as plain words (row present=true, name drawn as a button=false)
  - ✓ tapping the avail-w name opens no rename or points window (opened=false)
  - ✓ tapping a Required cell opens no figure pad (pad=false)
- Pictures: `s28-phone-a-after-taps.png`

### S29 — desktop 1536 — admin — **PASS**
- Did: Required P 26..30 typed; read the SANS calendar's still-needed figures and a SANS day; change Available P's points (amber +2/red +0, then amber +5/red +3); read them again; the Calendar window too
- Screen showed:
  - ✓ the SANS calendar shows still-needed figures: ["26:0 –","27:0 –","28:0 –","29:1 –","30:2 –"]
  - ✓ the points changed on the war (Tue 27 is red now): {"txt":"28","cls":"fr avail tap under"}
  - ✓ still-needed on the SANS calendar identical: before ["26:0 –","27:0 –","28:0 –","29:1 –","30:2 –"] after ["26:0 –","27:0 –","28:0 –","29:1 –","30:2 –"]
  - ✓ the opened SANS day reads the same before and after: before "⠿ Thu 29 Oct Day flying ✕ FIGURE PILOTS WSOS Required to fly 29 – Available 28 18 SANS committed to fly 0 0 Still needed 1 – + Commitment Calendar… No commitmen" after "⠿ Thu 29 Oct Day flying ✕ FIGURE PILOTS WSOS Required to fly 29 – Available 28 18 SANS committed t …
  - ✓ the SANS day keeps its own words (D626): "⠿ Thu 29 Oct Day flying ✕ FIGURE PILOTS WSOS Required to fly 29 – Available 28 18 SANS committed to fly 0 0 Still needed 1 – + Commitment Calendar… No commitments yet."
  - ✓ the SANS calendar gear is there: true
  - ✓ the gear panel mentions: ["Calendar…"]
- Pictures: `s29-desk-a-sans-before.png`, `s29-desk-b-sans-day-before.png`, `s29-desk-c-sans-after.png`, `s29-desk-d-sans-day-after.png`, `s29-desk-e-sans-gear.png`

### S30 — desktop 1536 — admin — **PASS**
- Did: Read the colours of the four rows (pairs); add a counter; Rearrange and drag it between Required W and Available P; read its colour and the four rows'
- Screen showed:
  - ✓ the pairs carry pair-p / pair-w: {"req-p":"flyrow req pair-p","req-w":"flyrow req pair-w","avail-p":"flyrow avail pair-p","avail-w":"flyrow avail pair-w"}
  - ✓ each pair shares one faint tint and the P and W pairs differ: P rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1/rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1, W rgba(26, 31, 38, 0.45) linear-gradient(rgba(40, 160, 110, 0.15), rgba(4/rgba(26, 31, 38, 0.45) linear-gradient(rgba(4 …
  - ✓ the new counter stands in the Manning block: walk-counter > req-p > req-w > avail-p > avail-w
  - ✓ Rearrange shows the counter drag handle: true
  - ✓ the counter now stands between Required W and Available P: req-p > req-w > walk-counter > avail-p > avail-w
  - ✓ the four rows keep their tints: {"rp":"rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1","ap":"rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1","rw":"rgba(26, 31, 38, 0.45) linear-gradient(rgba(40, 160, 110, 0.15), rgba(4","aw":"rgba(26, 31, 38, 0.45) linear-gradient(rgba(40, 160, …
  - ✓ the dragged counter row has no tint of its own pair: counter cell {"cls":"","trBg":"rgba(0, 0, 0, 0)","cell":"rgba(59, 198, 232, 0.05) none","first":"rgb(20, 24, 29)"} vs P rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1, W rgba(26, 31, 38, 0.45) linear-gradient(rgba(40, 160, 110, 0.15), rgba(4
  - ✓ Undo of the drop: walk-counter > req-p > req-w > avail-p > avail-w
  - ✓ Redo: req-p > req-w > walk-counter > avail-p > avail-w
- Pictures: `s30-desk-a-rows.png`, `s30-desk-b-amber-red-over-tint.png`, `s30-desk-c-dragging.png`, `s30-desk-d-rearranged.png`

### S30 — phone 390 — admin — **PASS**
- Did: Read the colours of the four rows (pairs); add a counter; Rearrange and drag it between Required W and Available P; read its colour and the four rows'
- Screen showed:
  - ✓ the pairs carry pair-p / pair-w: {"req-p":"flyrow req pair-p","req-w":"flyrow req pair-w","avail-p":"flyrow avail pair-p","avail-w":"flyrow avail pair-w"}
  - ✓ each pair shares one faint tint and the P and W pairs differ: P rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1/rgba(26, 31, 38, 0.45) linear-gradient(rgba(150, 140, 50, 0.15), rgba(1, W rgba(26, 31, 38, 0.45) linear-gradient(rgba(40, 160, 110, 0.15), rgba(4/rgba(26, 31, 38, 0.45) linear-gradient(rgba(4 …
  - ✓ phone: the Rearrange drag was walked on the desktop only (a finger drag of a counter row is not part of this walk)
- Pictures: `s30-phone-a-rows.png`, `s30-phone-b-amber-red-over-tint.png`

### S31 — desktop 1536 — admin — **RECORDED (the scenario asks only that it be said)**
- Did: Two tabs of one browser: in tab A type Required P 27 on Tue 27 Oct and set Available P amber +2; watch tab B for up to 45 seconds
- Screen showed:
  - ✓ tab A shows Tue 27 amber: {"txt":"28","cls":"fr avail tap amb"}
  - ✗ tab B repainted amber by itself — it did NOT within 45 s (the other tab had to be reloaded)
  - ✓ after tab B signs in again it shows: {"txt":"28","cls":"fr avail tap amb"}
- Pictures: `s31-desk-a-tab-b-after-wait.png`

### S32 — desktop 1536 — admin — **PASS**
- Did: Read the top bar Undo title after a points save, after a rename, and after Undo (the Redo title)
- Screen showed:
  - ✓ Undo title after a points save: "Undo — a change to an Available row on the Leave War"
  - ✓ Undo title after a rename: "Undo — a Required row renamed on the Leave War"
  - ✓ Redo title after the Undo: "Redo — a Required row renamed on the Leave War"
  - ✓ Redo title after a second Undo: "Redo — a change to an Available row on the Leave War"
- Pictures: (none)

### S22 — NOT RUN (P2) — admin
- Did: nothing. The scenario needs an HO stored with no half (given before D1164). Every door the app has now — the bid window's +OIL, the OIL tracker's grant form and its editor, the schedule's own credit — stores a half (the default half when none is picked; S16, S17, S18 show it). The old shape cannot be built through the app's own controls, and writing it to the store would be faking a state. It needs a store saved by the old build, or the unit test that carries it.
- Pictures: (none)

### S18b — NOT RUN (both sizes) — what was not built
The second half of scenario 18 asks to change an award's date in the same edit as its half. In the OIL tracker's editor an award's date is only read out ("29 Oct"), with no picker: the app does not let an award's date change at all (D260's reading, stated in the code beside it). So the premise of M4's open point (the default half taken from the OLD date) cannot be reached by pressing controls. What WAS walked of 18 passed: FO to 0.5 without touching the half saved the half that was lit (AM, on a day with nothing else); 0.5 back to 1 dropped the half and the box went back to a whole FO.

### S31 — why it is RECORDED and not FAIL
The scenario says "(or say it does not)". In two tabs of one browser, tab B did NOT repaint tab A's amber/red points by itself within 45 seconds; it showed them only after it was signed in again. (The app is per-browser storage until the database step.) Nothing is wrong with tab A.

## The roll-call rows these sections name (R3/R4 are the HO's half on the grid; the rest are by their numbers)

| Row | Place | Has it / must not | Where seen |
|---|---|---|---|
| R3, R4 | Grid cell: an HO in its half, a whole-day leave beside an HO, an HO beside a half-day leave | has it: AM leave top + HO bottom (S16, S17); whole-day leave drawn narrow at the left with the HO in its own half of the right side, top for the morning, bottom for the afternoon (S19); "HO*" for the schedule's own credit, top for 08:00, bottom for 13:00 (S20). No "+1" in any of them | S16, S17, S19, S20 pictures |
| R14 | Manning red count and its list | has it: counts a day only at red (amber-only days left "Manning" alone, two reds counted as "2 red ›", the bid that made Wed 28 red made it "1 red ›", gone again at zero); the line names the row and figure, a tap on it takes the grid to the day and closes the list. Words differ from the drawing (see FAIL 2) | S26 |
| R26 | Day's list | has it: HO line names its half ("HO — OIL award, afternoon"), "bid pending", Approve / Refuse / Move / Delete, and Edit… on the HO. Note: a day holding only an HO opens the bid window, not the list | S19, S21 |
| R27 | +OIL panel in the admin's bid window | has it: Half row with AM / PM only for 0.5, default the other half beside a half-day leave and the morning on an empty day; no Half row on 1 (FO). Must not: a Half row on an FO — none | S16 |
| R28 | OIL tracker: grant form, editor, lines | has it: AM / PM chips on 0.5; two people with different defaults light neither and each takes his own; one person's pick of PM saves PM; the editor shows chips only at 0.5; the lines read "26 Oct PM", "28 Oct AM", "18 Jul AM", "19 Jul PM". Must not: a lit default that is not what saves — none seen | S17, S18, S20 |
| R30 | Available P cells | has it: amber text under Required + amber point, red under Required + red point, red "+ 0" as the default rule; no colour on days with no Required (Fri 23, Sat 24, Sun 25) | S23, S24 |
| R31 | Available P's window | has it: Amber and Red boxes, the "Red is set at or above amber, so amber never shows." line, the SANS line (D1154), Save refused with its line for "abc", "+", "200" and a blank red. Layout differs from r7-26 (FAIL 1) | S23, S23v, S24, S25 |
| R32 | Required rows' names | has it: an admin's tap on the name opens a rename window holding the name alone; the new name reads in the row, the figure pad, the Required figures panel and the Available P window's SANS line; the phone shows the new name and goes back to "Req P" when renamed back; Undo/Redo and a reload keep it; a member sees plain words, no button, nothing opens | S27, S28 |
| R33 | Pair tints | has it: Required P + Available P one faint olive, Required W + Available W one faint green, amber/red figures readable over them; a counter dragged between Required W and Available P has no tint and the four keep theirs | S30 |
| R34 | SANS calendar / SANS day / Calendar window | has it: the still-needed figures for 26–30 Oct identical before and after two point changes; the SANS day keeps its own words ("Required to fly … Still needed", D626, M12) | S29 |
| R35 | Undo words | has it: "Undo — a change to an Available row on the Leave War", "Undo — a Required row renamed on the Leave War", and the Redo titles after Undo | S23, S27, S32 |

## Every FAIL, with the exact steps to reproduce

1. **S23v (desktop, admin) — the Available P window's Amber and Red boxes are not as drawn in r7-26-availp-desk.** Drawn: each box a small one (about the size of "+ 2") on the same line, right after "when under Required". Built: each is a full-width box (534 px wide, 40 px tall, in a window 560 px wide) on its own line under the label, the figure centred in it. Steps: sign in `ad`/`a` → Leave War → tap the name "Available P" in the Manning block → look at the AMBER and RED lines. Picture: `s23v-desk-a-window.png` (and `s23-desk-a-window.png` for the saved-at-default state). The behaviour in the boxes is right; this is only the look.
2. **S26 (desktop and phone, admin) — the red list's line is worded differently from the drawing r19c-short-red.** Drawn: "Tue 27 Jan   Available P 23 of 24" (weekday, then the row and the figure "of" what was required). Built: "28 Oct 26   Available P 27" (no weekday, year added, no "of 28"). Steps: admin → Leave War → Manning open → type Required P 27 and 28 on Tue 27 / Wed 28 Oct (click the Required P cell, type, Enter; on a phone use the number pad) → Available P window: Amber "+ 2", Red "+ 0", Save → tap Wed 28 Oct on Saber's row, press LL (answer the below-zero tap) → "1 red ›" → press it. Pictures: `s26-desk-c-red-list.png`, `s26-phone-c-red-list.png`. D1243 only says "each with the row and figure", so this is the host's to judge; the count, the line's colour and the jump all worked.
3. **S26 (phone only, admin) — the open-dates chip is cut short when the red count shows.** At 390 wide, with "1 red ›" beside Manning, the chip reads "Bidding cl…" (ellipsis). Steps: same as 2, on the phone. Picture: `s26-phone-b-red-count.png` (also shows D1227's bubble "This bid turns Available P red." under Manning, which is right: the bid was his own and made the row worse). Not a wrong figure; a squeezed word (the drawn chip is "Open 1 Jan – 31 Mar").

## Other things seen (not FAILs; the host decides)

- **Old arrow print in the bid window and the day's list for a half-day leave.** The bid window for an AM leave is headed "Saber Tue 27 Oct NOW <LL"; the day's list line for it reads "<LL — local leave, morning · bid pending". The grid box no longer prints the arrow (S16 pictures). Picture: `s16-phone-a-half-row-pm-lit.png` (the heading is visible in it). M3 may own this.
- **"Entered by Saber · 22 Oct 26" at 03:xx on 23 Oct.** The day's list and the award sheet print the date an award was entered from the UTC date, so between midnight and 8 a.m. in Singapore it says the day before. Picture: `s19-desk-b-after-save-list.png` (bottom right of the window). It is code going forward, so not covered by D56. Small, but it is in his time zone.
- **The windows still say "How many" and "How much"** (the bid window rows), where D1212 rules "Date" and "Duration". Picture: `s16-phone-a-half-row-pm-lit.png`. Probably M3's.
- **A day holding only an HO opens the bid window, not the day's list**, so "Edit…" (change its half) is reachable only on a day with a second record, or from the OIL tracker. S19 was walked on a day with a whole-day leave plus an HO.
- **A pending whole-day leave beside an HO is drawn as a narrow box at the left** (about 40% of the cell's width) with the HO in the right half (D1167 as ruled). Picture: `s19-desk-z-whole-plus-ho.png`.
- **The phone number pad** for typing a Required figure is the app's own (keys 1–0, ‹ ›, Done); walked through its keys, not the phone's keyboard.
- **Script notes (not app faults):** the scripts press a name in the frozen column without scrolling the grid sideways (it had parked the grid on September once); a cell close-up scrolls the cell to the middle of the screen first.

## Console / page errors / 4xx responses

None, in any browser context walked.
