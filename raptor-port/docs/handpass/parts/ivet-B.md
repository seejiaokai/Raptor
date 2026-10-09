# Walker B — the design vet's walk — 10 Oct 26

Server: http://localhost:4232/ (frozen build). Scenarios walked: 25 rows (scenarios 20, 21, 23, 25, 28–31, 53–63, 67–69; 58, 59 and 60 have a second row for the other size). Counts: PASS 23, FAIL 1, NOT RUN 1.
Sizes and roles follow the brief's rule (odd = phone by touch, even = desktop; admin Saber when the number mod 4 is 0 or 1, member Ranger when 2 or 3), except where a scenario names its own (53, 54, 55 Saber; 54 names 390 px; 67 and 68 Saber then Ranger; 21 phone admin). The Medical tab shows no entry for Saber's own medical input (see extras), so scenario 21's document was also opened from a Ranger entry filed by Saber.

| # | size | role | result | what the screen said | pictures (all in docs/img/handpass/2026-10-10-inputs-vet-check/B/) |
|---|---|---|---|---|---|
| 20 | desktop 1440x900 | admin Saber (own input) | PASS | ATT C: Add asks the document question before anything is saved — No medical document — Saber, ATT C ✕ THIS ATT C HAS NO CERTIF / ATT C: "No document" saves it, right kind and dates, no document attached — {"iid":"imv1klmox6dxsgs","person":"stiff","cs":"Sa (+6 more checks, all as expected) | s20-ATTC-docquestion.png, s20-ATTC-saved-list.png, s20-ATTC-reopened.png, s20-OML-docquestion.png … |
| 21 | phone 390x844 (touch) | admin Saber (own input) | PASS | Upload returns to the intact draft (nothing saved, type, remark and dates kept) — {"n":52,"win":1,"type":"ATT C","rmk":"S21 re / the attachment appears in the window before saving — s21-cert-1.pdf ✕ Add / DOCUMENT s21-cert-1.pdf ✕ Add (+5 more checks, all as expected) | s21-r1-question.png, s21-r1-after-upload-press.png, s21-r1-attached.png, s21-r1-saved-list.png … |
| 23 | phone 390x844 (touch) | member Ranger (own medical) | PASS | the ATT C 27–31 Jul is saved — ["ATT C Jul 27–Jul 31"] / the upchit summary appears and names the downchit and its new end of 28 July — {"kind":"upconf","words":"Upchit — Ranger, Jul  (+5 more checks, all as expected) | s23-summary.png, s23-after-cancel.png, s23-confirmed-list.png |
| 25 | phone 390x844 (touch) | admin Saber (own medical) | PASS | ATT C 27–31 Jul saved — ["ATT C Jul 27–Jul 31"] / the clash question names both kinds and their dates — {"kind":"medclash","words":"ATT B — Saber, Jul 29 – Jul 30 ✕ DAYS COVERE (+6 more checks, all as expected) | s25-clash.png, s25-clash-chosen.png, s25-after-save.png |
| 28 | desktop 1440x900 | admin Saber | FAIL | FAIL: with no filter hiding it: lit after the save, light lets go when a column heading is pressed — {"lit1":1,"lit2":1} | s28-1-search_zz_no_match_.png, s28-1-released.png, s28-2-Person_Wisp.png, s28-2-released.png … |
| 29 | phone 390x844 (touch) | admin Saber | PASS | first save (Saber, Echo): ONE card, both names, lit, in view, under its own day heading once, the hiding search still on — {"c / after Ace is added: still ONE card, now naming Ace, Echo, Saber, lit, in view and first; no duplicate; the search still on — { (+2 more checks, all as expected) | s29-first-save.png, s29-second-save.png |
| 30 | desktop 1440x900 | member Ranger (own filings) | PASS | (setup) the upchit filing shortened the downchit and added the upchit — {"s0":["ATT C Jul 27–Jul 31"],"s1":["ATT C Jul 27–Jul  / Undo takes back the WHOLE upchit filing: the upchit goes and the downchit is whole again (27–31) — ["ATT C Jul 27–Jul 31"] (+8 more checks, all as expected) | s30-a-undo.png, s30-a-redo.png, s30-b-undo.png, s30-b-redo.png … |
| 31 | phone 390x844 (touch) | member Ranger | PASS | an unsaved-changes question appears (new draft) — This input has unsaved changes. Open a new input and lose them? Discard and  / Keep editing preserves every change (type, people, dates, title, remark) — {"f0":{"read":"Jul 27 → Jul 28","rmk":"S31 remark t (+13 more checks, all as expected) | s31-1-question.png, s31-2-discarded.png, s31-3-saved-question.png, s31-4-people-only-question.png |
| 53 | phone 390x844 (touch) | admin Saber | PASS | (setup) a two-person and a nine-person Meeting saved — 2 and 9 records / the bars begin "2 · Meeting", "9 · Meeting" and "4 · Meeting" (no callsign, no "+N") — {"A":["2 · Meeting"],"B":["9 · Meeting" (+1 more checks, all as expected) | s53-month.png, s53-month-filtered.png |
| 54 | phone 390x844 (touch) | admin Saber | PASS | (setup) the nine-person Event saved — 9 / its bar begins "9 ·" and the title, clipped only to fit (the count stays) — [{"text":"9 · C54 Squadron photograph and briefing (+1 more checks, all as expected) | s54-month.png, s54-opened.png |
| 55 | phone 390x844 (touch) | admin Saber | PASS | (setup) a two-person Meeting 26–28 Jul saved — [["Echo","Jul 26","Jul 28"],["Saber","Jul 26","Jul 28"]] / the bar runs on across the week boundary: two pieces on two week rows, the same count and title words — [{"text":"2 · Meeting" (+1 more checks, all as expected) | s55-month.png, s55-day-26.png, s55-day-27.png, s55-day-28.png |
| 56 | desktop 1440x900 (picture scale 2) | admin Saber (own inputs) | PASS | (setup) all five saved — {"ll":["LL","Jul 6",true,0,1439],"llT":["LL","Jul 7",false,600,720],"mt":["Meeting","Jul 8",true,0,14 / all-day leave: solid red, no edge; all-day Meeting: solid amber, no edge — [{"timed":false,"tone":"red","bg":"color(srgb 0.458 (+4 more checks, all as expected) | s56-month.png |
| 57 | phone 390x844 (touch) | admin Saber | PASS | (setup) the timed Meeting 27–29 Jul 09:00–11:00 saved — [{"iid":"imv1kzml9d2ei91","person":"stiff","cs":"Saber","type":"Meetin / every bar segment is tinted (the timed look) with the solid left edge — [{"timed":true,"bg":"color(srgb 0.195471 0.174758 0.13 (+3 more checks, all as expected) | s57-month.png, s57-day-27.png, s57-day-28.png, s57-day-29.png … |
| 58 | desktop 1440x900 (mouse) | member Ranger (own input) | PASS | (setup) a timed own Meeting and a timed shared two-day Meeting saved — ["imv1l58vtd1l005",2] / the bar lifts and follows the mouse (a ghost, the date under it lights), legible — {"ghost1":1,"over":1,"ghostTxt":{"text":"Ra (+6 more checks, all as expected) | s58-lifted.png, s58-moved.png, s58-shared-lifted.png, s58-shared-moved.png |
| 58-phone | phone 390x844 (finger over CDP) | admin Saber (own input) | PASS | held still the bar lifts; dragged by finger it follows; dropped it moved one day with hours kept and the timed look — {"ghost" / the release did not open the input (+1 more checks, all as expected) | s58-phone-held.png, s58-phone-dragged.png, s58-phone-moved.png |
| 59 | phone 390x844 (touch) | member Ranger | PASS | a tap on a bar opens THAT input in its window — {"wins":["win-inputedit","win-inputedit-x"],"ttl":{"own":"S59 own","type":"Mee / a tap on empty space of its date opens that DAY, whose card agrees with the bar — {"day":true,"edit":false,"cards":["S59 own"] (+1 more checks, all as expected) | s59-bar-tap.png, s59-empty-space-tap.png, s59-crowded.png, s59-more.png |
| 59-desktop | desktop 1440x900 | member Ranger | PASS | a shared titled bar's tooltip names every person, the kind, the dates (and hours / filing detail), not just the clipped words  / it carries filing details ("Placed by …") — Drifter, Echo, Ranger, Saber · Meeting · 23 Jul · 10:00–11:00
Placed by Saber for  (+1 more checks, all as expected) | s59-tooltip-hover.png |
| 60 | desktop 1440x900 | admin Saber | PASS | the fold has four items — 4 / item 1 = tap a day/bar and drag; item 2 = several days; item 3 = NF / holiday / Off day; item 4 = the filing cut-off — ["Tap a (+4 more checks, all as expected) | s60-fold.png |
| 60-phone | phone 390x844 (extra, the scenario says especially 390) | admin Saber | PASS | the fold has four items — 4 / item 1 = tap a day/bar and drag; item 2 = several days; item 3 = NF / holiday / Off day; item 4 = the filing cut-off — ["Tap a (+4 more checks, all as expected) | s60-phone-fold.png |
| 61 | phone 390x844 (touch) | admin Saber | PASS | opened: no words (Person, Type, Search) stand over the three boxes; each box says what it is by its value / placeholder — {"sp / the filter button and the gear did not jump when the fields opened — {"p0":[["#inFiltersBtn",306,106],["#inGear",344,106],["#i (+3 more checks, all as expected) | s61-closed.png, s61-open.png, s61-closed-with-values.png, s61-after-switch.png |
| 62 | desktop 1440x900 | member Ranger | PASS | "+ Input" in the opened 27 Jul gives that day, the "?" and no instruction paragraph — {"read":"Jul 27","help":1,"hint":0,"type / a mouse drag over 27–29 Jul opens a new input with that span, same controls and "?", no paragraph — {"read":"Jul 27 → Jul 29", (+1 more checks, all as expected) | s62-day-plus.png, s62-drag-span.png, s62-list-plus.png |
| 63 | phone 390x844 (touch) | member Ranger (shared inputs he filed himself; the demo four-person one is another man's) | PASS | an editable one-person input: no instruction paragraph — {"h1":null,"paras":[]} / saved four-person input: "Date changes apply to all 4." — Date changes apply to all 4. (+5 more checks, all as expected) | s63-one-person.png, s63-four.png, s63-five.png, s63-three.png … |
| 67 | phone 390x844 (touch) | admin Saber, then member Ranger | PASS | Cancel keeps the previous saved settings — {"lead":"14","mf":true,"mode":"true"} / closing by the X keeps the previous saved settings — {"lead":"14","mf":true,"mode":"true"} (+10 more checks, all as expected) | s67-gear-open.png, s67-before-save.png, s67-invalid.png, s67-ranger-switch-off.png … |
| 68 | desktop 1440x900 | admin Saber, then member Ranger | PASS | the Logic page offers the Inputs settings button on its rows — ["Inputs calendar settings…","SANS calendar settings…","Inputs  / every Logic row opens the same settings window with the same words as the gear — [{"i":0,"open":1,"same":true},{"i":2,"open":1 (+6 more checks, all as expected) | s68-gear.png, s68-logic-opened.png, s68-calendar-config.png |
| 69 | phone 390x844 | guest | NOT RUN | NOT RUN: the guest / view-only boundary — the sign-in card offers no guest route — only username, password and "Sign in" (["/Sign in"]); no account was created and no unknown name was tried | s69-card.png |

## Detail of every check
### 20 — PASS — desktop 1440x900 — admin Saber (own input) — ATT C and OML only
- ok: ATT C: Add asks the document question before anything is saved — No medical document — Saber, ATT C ✕ THIS ATT C HAS NO CERTIFICATE ATTACHED. Attach one now, or file it without — for when the record genuinely isn’t available yet. No document Upload
- ok: ATT C: "No document" saves it, right kind and dates, no document attached — {"iid":"imv1klmox6dxsgs","person":"stiff","cs":"Saber","type":"ATT C","remarks":"till 4 Aug","date":"Aug 3","endDate":"Aug 4","allday":true,"s":0,"e":1439,"oil":null,"grp":null,"by":"stiff","byCs":"Saber","docs":0,"docId":null}
- ok: ATT C: the reopened window does not claim a document — {"chips":0,"text":"Document","allText":false}
- ok: ATT C: the row shows no paperclip — clips 0
- ok: OML: Add asks the document question before anything is saved — No medical document — Saber, OML ✕ THIS OML HAS NO CERTIFICATE ATTACHED. Attach one now, or file it without — for when the record genuinely isn’t available yet. No document Upload
- ok: OML: "No document" saves it, right kind and dates, no document attached — {"iid":"imv1klnt90fzqit","person":"stiff","cs":"Saber","type":"OML","remarks":"till 11 Aug","date":"Aug 10","endDate":"Aug 11","allday":true,"s":0,"e":1439,"oil":null,"grp":null,"by":"stiff","byCs":"Saber","docs":0,"docId":null}
- ok: OML: the reopened window does not claim a document — {"chips":0,"text":"Document","allText":false}
- ok: OML: the row shows no paperclip — clips 0

### 21 — PASS — phone 390x844 (touch) — admin Saber (own input)
- ok: Upload returns to the intact draft (nothing saved, type, remark and dates kept) — {"n":52,"win":1,"type":"ATT C","rmk":"S21 remark kept","q":0,"read":"Aug 17 → Aug 18"}
- ok: the attachment appears in the window before saving — s21-cert-1.pdf ✕ Add | DOCUMENT s21-cert-1.pdf ✕ Add
- ok: Add again saves with no second document question (no loop) — {"loop":0,"made":[{"iid":"imv1klqyx1b311a","person":"stiff","cs":"Saber","type":"ATT C","remarks":"S21 remark kept","date":"Aug 17","endDate":"Aug 18","allday":true,"s":0,"e":1439,"oil":null,"grp":null,"by":"stiff","byCs":"Saber","docs":1,"docId":"doc-8c46f490-3123-4d12-915d-a5c901b5814a"}]}
- the list card for the saved input has a paperclip/document control — 0
- ok: the Medical tab lists the saved medical entry with its document control — docs 1
- ok: tapping the card opens the document (a viewer comes up) — {"title":"Tap to view the document","iframe":1,"wins":[],"words":""}
- ok: attached before the first Add: no document question, saved with 1 document — {"loop2":0,"made2":[{"iid":"imv1klwao8u4dit","person":"stiff","cs":"Saber","type":"ATT C","remarks":"till 25 Aug","date":"Aug 24","endDate":"Aug 25","allday":true,"s":0,"e":1439,"oil":null,"grp":null,"by":"stiff","byCs":"Saber","docs":1,"docId":"doc-13d881c9-1531-4281-9380-19094372ebaa"}]}

### 23 — PASS — phone 390x844 (touch) — member Ranger (own medical)
- ok: the ATT C 27–31 Jul is saved — ["ATT C Jul 27–Jul 31"]
- ok: the upchit summary appears and names the downchit and its new end of 28 July — {"kind":"upconf","words":"Upchit — Ranger, Jul 29 ✕ SAVING THIS UPCHIT WILL ATT C Jul 27 – Jul 31 → now ends Jul 28 Fit for full duty from Jul 29. Cancel Save upchit"}
- ok: nothing is written while the summary is up — ["ATT C Jul 27–Jul 31"]
- summary buttons — ["|✕","|Cancel","upconf-save|Save upchit"]
- ok: Cancel leaves the downchit intact (27–31), no upchit saved, the draft still in the window — {"afterCancel":["ATT C Jul 27–Jul 31"],"win":1,"rmk":"S23 up","typ":"Upchit"}
- ok: confirming shows the shortened downchit (to 28 Jul) and the 29 Jul upchit together — ["ATT C Jul 27–Jul 28","Upchit Jul 29"]
- cards seen — ["ATT C till 28 Jul","Upchit All day"]

### 25 — PASS — phone 390x844 (touch) — admin Saber (own medical) — the cancel, and ONE resolution
- ok: ATT C 27–31 Jul saved — ["ATT C Jul 27–Jul 31"]
- clash buttons — ["BUTTON|✕","BUTTON|ATT B replaces","BUTTON|Remove those days","BUTTON|Keep them","BUTTON|Cancel","medclash-save|Save"]
- ok: the clash question names both kinds and their dates — {"kind":"medclash","words":"ATT B — Saber, Jul 29 – Jul 30 ✕ DAYS COVERED BY ANOTHER STATUS — CHOOSE WHO HOLDS THEM ATT C Jul 27 – Jul 31 · both cover Jul 29 – Jul 30 ATT B replaces Left over after it: ATT C Jul 31 — will be removed Remove those days Keep them The days each status keeps stay exactly as chosen — every day holds one status, and the new entry is filed around whatever you keep. Cancel Save"}
- ok: nothing is written while the question is up — ["ATT C Jul 27–Jul 31"]
- ok: Cancel changes nothing (the ATT C is whole, no ATT B) and the draft stays in the window — {"afterC":["ATT C Jul 27–Jul 31"],"win":1}
- resolution options — []
- chosen resolution — ATT B replaces
- ok: after confirming, the periods match the chosen resolution with no unexplained overlap, gap or lost dates — ["ATT B Jul 29–Jul 30","ATT C Jul 27–Jul 28"] | chosen: ATT B replaces

### 28 — FAIL — desktop 1440x900 — admin Saber — four hiding filters, each alone, then together
- ok: search "zz-no-match": the new input is in view, FIRST and LIT, and the filters were not changed — {"row":{"at":0,"lit":true,"onScreen":true},"before":{"search":"zz-no-match","person":"Everyone","type":"All types","range":"📅 All dates"},"after":{"search":"zz-no-match","person":"Everyone","type":"All types","range":"📅 All dates"},"nrows":1}
- ok: search "zz-no-match": when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left — {"row2":null,"lit":0}
- ok: Person = Wisp: the new input is in view, FIRST and LIT, and the filters were not changed — {"row":{"at":0,"lit":true,"onScreen":true},"before":{"search":"","person":"Wisp","type":"All types","range":"📅 All dates"},"after":{"search":"","person":"Wisp","type":"All types","range":"📅 All dates"},"nrows":2}
- ok: Person = Wisp: when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left — {"row2":null,"lit":0}
- ok: Type = LL: the new input is in view, FIRST and LIT, and the filters were not changed — {"row":{"at":0,"lit":true,"onScreen":true},"before":{"search":"","person":"Everyone","type":"LL","range":"📅 All dates"},"after":{"search":"","person":"Everyone","type":"LL","range":"📅 All dates"},"nrows":4}
- ok: Type = LL: when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left — {"row2":null,"lit":0}
- ok: dates = 5–20 Oct: the new input is in view, FIRST and LIT, and the filters were not changed — {"row":{"at":0,"lit":true,"onScreen":true},"before":{"search":"","person":"Everyone","type":"All types","range":"📅 5 Oct → 20 Oct"},"after":{"search":"","person":"Everyone","type":"All types","range":"📅 5 Oct → 20 Oct"},"nrows":1}
- ok: dates = 5–20 Oct: when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left — {"row2":null,"lit":0}
- ok: all four together: the new input is in view, FIRST and LIT, and the filters were not changed — {"row":{"at":0,"lit":true,"onScreen":true},"before":{"search":"zz-no-match","person":"Wisp","type":"LL","range":"📅 5 Oct → 20 Oct"},"after":{"search":"zz-no-match","person":"Wisp","type":"LL","range":"📅 5 Oct → 20 Oct"},"nrows":1}
- ok: all four together: when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left — {"row2":null,"lit":0}
- rows lit straight after the filters were reset (earlier saves, filters touched in between) — 3
- lit rows 1.75 s after the heading press — 1
- FAIL: with no filter hiding it: lit after the save, light lets go when a column heading is pressed — {"lit1":1,"lit2":1}

### 29 — PASS — phone 390x844 (touch) — admin Saber — hiding filter; Saber then Echo; then Ace added
- ok: first save (Saber, Echo): ONE card, both names, lit, in view, under its own day heading once, the hiding search still on — {"cardsTotal":1,"mine":1,"who":"Echo, Saber","lit":true,"first":true,"head":"Wed 29 Jul1 input","heads":["Wed 29 Jul1 input"],"onScreen":true,"srch":"zz-no-match"}
- people ticked in the reopened window — ["SaberIP","EchoIW"]
- ok: after Ace is added: still ONE card, now naming Ace, Echo, Saber, lit, in view and first; no duplicate; the search still on — {"c2":{"cardsTotal":1,"mine":1,"who":"Ace, Echo, Saber","lit":true,"first":true,"head":"Wed 29 Jul1 input","heads":["Wed 29 Jul1 input"],"onScreen":true,"srch":"zz-no-match"},"grpIds":["Ace","Echo","Saber"]}
- ok: the day heading appears once and counts the shared entry once ("1 input") — ["Wed 29 Jul1 input"]

### 30 — PASS — desktop 1440x900 — member Ranger (own filings) — undo/redo after a 23-type filing (upchit), a 25-type filing (clash) and a hidden-by-filter save
- ok: (setup) the upchit filing shortened the downchit and added the upchit — {"s0":["ATT C Jul 27–Jul 31"],"s1":["ATT C Jul 27–Jul 28","Upchit Jul 29"]}
- ok: Undo takes back the WHOLE upchit filing: the upchit goes and the downchit is whole again (27–31) — ["ATT C Jul 27–Jul 31"]
- ok: Redo restores both together (downchit to 28 Jul, upchit 29 Jul) and the upchit row is in view and lit — {"s3":["ATT C Jul 27–Jul 28","Upchit Jul 29"],"up":{"lit":true,"top":376}}
- ok: (setup) the clash filing split the periods — {"c0":["ATT C Aug 24–Aug 28"],"c1":["ATT B Aug 26–Aug 27","ATT C Aug 24–Aug 25"]}
- ok: Undo takes back the WHOLE clash filing: no ATT B, the ATT C 24–28 Aug is whole again — ["ATT C Aug 24–Aug 28"]
- ok: Redo restores the same periods as the first time — ["ATT B Aug 26–Aug 27","ATT C Aug 24–Aug 25"]
- ok: (setup) the save under the hiding search is revealed and lit — {"at":0,"lit":true}
- ok: Undo removes it; Redo brings it back REVEALED (first, in view) and LIT although the search still hides it — {"dark":0,"gone":true,"r2":{"at":0,"lit":true,"onScreen":true}}
- ok: the List choice stayed on the List through every Undo and Redo — 1
- ok: a fresh "+ Input": no date picked, no carried title / remark / attachment, no paragraph; kind "Training" (the brief; the scenario text says Duty), person Ranger — {"read":"pick a start date","type":"Training","rmk":"","title":"Training","who":"Ranger","chips":0,"hint":0}

### 31 — PASS — phone 390x844 (touch) — member Ranger — + Input pressed while a window holds unsaved changes
- window dragged down by its title with a finger; "+ Input" reachable now — {"top":208,"w":66,"hit":"inNew","onNew":true}
- ok: an unsaved-changes question appears (new draft) — This input has unsaved changes. Open a new input and lose them? Discard and open Keep editing
- ok: Keep editing preserves every change (type, people, dates, title, remark) — {"f0":{"read":"Jul 27 → Jul 28","rmk":"S31 remark typed","title":"S31 title","type":"Meeting","ticked":["Ranger","Echo"]},"f1":{"read":"Jul 27 → Jul 28","rmk":"S31 remark typed","title":"S31 title","type":"Meeting","ticked":["Ranger","Echo"]}}
- ok: Discard and open: ONE fresh undated window, nothing saved — {"f2":{"read":"pick a start date","rmk":"","title":"Training","type":"Training","ticked":[]},"n0":52,"n1":52,"wins":1}
- the window had kept its dragged-down place; a finger drags it back up — top was 432
- window dragged down by its title with a finger; "+ Input" reachable now — {"top":208,"w":66,"hit":"inNew","onNew":true}
- ok: from a changed saved input an unsaved-changes question appears
- ok: Keep editing keeps the edit — {"read":"Jul 30","rmk":"S31 saved EDITED","title":"S31 saved title","type":"Meeting","ticked":[]}
- ok: Discard and open: a fresh undated window and the saved record is unchanged — {"g2":{"read":"pick a start date","rmk":"","title":"Training","type":"Training","ticked":[]},"rec":"S31 saved"}
- the window had kept its dragged-down place; a finger drags it back up — top was 481
- shared input filed — ["Echo","Ranger"]
- window dragged down by its title with a finger; "+ Input" reachable now — {"top":208,"w":66,"hit":"inNew","onNew":true}
- ok: with ONLY the people changed (Ace ticked) the question appears
- ok: Keep editing keeps the ticked people — ["Ace","Ranger","Echo"]
- ok: Discard and open: fresh window; the saved group is unchanged (no Ace) — {"grpNow":["Echo","Ranger"],"read":"pick a start date"}

### 53 — PASS — phone 390x844 (touch) — admin Saber
- ok: (setup) a two-person and a nine-person Meeting saved — 2 and 9 records
- ok: the bars begin "2 · Meeting", "9 · Meeting" and "4 · Meeting" (no callsign, no "+N") — {"A":["2 · Meeting"],"B":["9 · Meeting"],"C":["4 · Meeting"]}
- ok: with the Person filter set to Ranger the shared bars still lead with their whole counts (2, 9, 4) — never 1 — {"A2":["2 · Meeting"],"B2":["9 · Meeting"],"C2":["4 · Meeting"],"barsOnMonth":4}

### 54 — PASS — phone 390x844 (touch) — admin Saber — the scenario names 390px
- ok: (setup) the nine-person Event saved — 9
- ok: its bar begins "9 ·" and the title, clipped only to fit (the count stays) — [{"text":"9 · C54 Squadron photograph and briefing","clipped":true,"w":48}]
- ok: opening it shows the full title, the Event kind and all nine people — {"title":"Ace +8 · 10 Jul","ownTitle":"C54 Squadron photograph and briefing","type":"Event","ticked":9}

### 55 — PASS — phone 390x844 (touch) — admin Saber
- ok: (setup) a two-person Meeting 26–28 Jul saved — [["Echo","Jul 26","Jul 28"],["Saber","Jul 26","Jul 28"]]
- ok: the bar runs on across the week boundary: two pieces on two week rows, the same count and title words — [{"text":"2 · Meeting","top":607,"left":331,"w":50},{"text":"2 · Meeting","top":732,"left":9,"w":104}]
- ok: every covered day opens to the same ONE shared entry naming both people — [{"d":"2026-07-26","n":1,"who":"Echo, Saber","when":"06:00–18:00 · till 28 Jul"},{"d":"2026-07-27","n":1,"who":"Echo, Saber","when":"06:00–18:00 · till 28 Jul"},{"d":"2026-07-28","n":1,"who":"Echo, Saber","when":"06:00–18:00"}]

### 56 — PASS — desktop 1440x900 (picture scale 2) — admin Saber (own inputs)
- ok: (setup) all five saved — {"ll":["LL","Jul 6",true,0,1439],"llT":["LL","Jul 7",false,600,720],"mt":["Meeting","Jul 8",true,0,1439],"mtT":["Meeting","Jul 9",false,540,630],"am":["LL","Jul 10",false,0,720]}
- painted — {"ll":{"timed":false,"tone":"red","bg":"color(srgb 0.458039 0.199373 0.227608)","lum":65,"shadow":"none","color":"rgb(255, 255, 255)","text":"Saber · LL"},"llT":{"timed":true,"tone":"red","bg":"color(srgb 0.207498 0.129904 0.152445)","lum":38,"shadow":"color(srgb 0.458039 0.199373 0.227608) 3px 0px 0px 0px inset","color":"rgb(241, 244, 247)","text":"Saber · LL"},"mt":{"timed":false,"tone":"amb","bg":"color(srgb 0.422667 0.331294 0.163137)","lum":86,"shadow":"none","color":"rgb(255, 255, 255)","text":"Saber · Meeting"},"mtT":{"timed":true,"tone":"amb","bg":"color(srgb 0.195471 0.174758 0.130525
- ok: all-day leave: solid red, no edge; all-day Meeting: solid amber, no edge — [{"timed":false,"tone":"red","bg":"color(srgb 0.458039 0.199373 0.227608)","lum":65,"shadow":"none","color":"rgb(255, 255, 255)","text":"Saber · LL"},{"timed":false,"tone":"amb","bg":"color(srgb 0.422667 0.331294 0.163137)","lum":86,"shadow":"none","color":"rgb(255, 255, 255)","text":"Saber · Meeting"}]
- ok: timed Custom leave: lighter red with a solid left edge; timed Meeting: lighter amber with a solid left edge — [{"timed":true,"tone":"red","bg":"color(srgb 0.207498 0.129904 0.152445)","lum":38,"shadow":"color(srgb 0.458039 0.199373 0.227608) 3px 0px 0px 0px inset","color":"rgb(241, 244, 247)","text":"Saber · LL"},{"timed":true,"tone":"amb","bg":"color(srgb 0.195471 0.174758 0.130525)","lum":45,"shadow":"color(srgb 0.422667 0.331294 0.163137) 3px 0px 0px 0px inset","color":"rgb(241, 244, 247)","text":"Saber · Meeting"}]
- ok: the half-day (AM) leave uses the timed treatment — {"timed":true,"tone":"red","bg":"color(srgb 0.207498 0.129904 0.152445)","lum":38,"shadow":"color(srgb 0.458039 0.199373 0.227608) 3px 0px 0px 0px inset","color":"rgb(241, 244, 247)","text":"Saber · LL"}
- "lighter": compared as the brightness of the paint colour; the picture shows it — luminance solid red 65 / timed red 38 / solid amber 86 / timed amber 45

### 57 — PASS — phone 390x844 (touch) — admin Saber
- ok: (setup) the timed Meeting 27–29 Jul 09:00–11:00 saved — [{"iid":"imv1kzml9d2ei91","person":"stiff","cs":"Saber","type":"Meeting","title":"S57 timed span","remarks":"S57 timed","date":"Jul 27","endDate":"Jul 29","allday":false,"s":540,"e":660,"oil":null,"grp":null,"by":"stiff","byCs":"Saber","docs":0,"docId":null}]
- ok: every bar segment is tinted (the timed look) with the solid left edge — [{"timed":true,"bg":"color(srgb 0.195471 0.174758 0.130525)","shadow":"color(srgb 0.422667 0.331294 0.163137) 3px 0px 0px 0px inset","text":"Saber · S57 timed span"}]
- opened-day cards — [{"d":"2026-07-27","when":"09:00–11:00 · till 29 Jul","kind":"Meeting","rmk":"S57 timed"},{"d":"2026-07-28","when":"09:00–11:00 · till 29 Jul","kind":"Meeting","rmk":"S57 timed"},{"d":"2026-07-29","when":"09:00–11:00","kind":"Meeting","rmk":"S57 timed"}]
- ok: first, middle and last opened days all show the hours (not "All day") — [{"d":"2026-07-27","when":"09:00–11:00 · till 29 Jul","kind":"Meeting","rmk":"S57 timed"},{"d":"2026-07-28","when":"09:00–11:00 · till 29 Jul","kind":"Meeting","rmk":"S57 timed"},{"d":"2026-07-29","when":"09:00–11:00","kind":"Meeting","rmk":"S57 timed"}]
- ok: the saved window keeps the span and the hours (Jul 27 → Jul 29, 09:00–11:00, not all day) — {"read":"Jul 27 → Jul 29","start":"09:00","end":"11:00","allday":false}

### 58 — PASS — desktop 1440x900 (mouse) — member Ranger (own input) — phone half follows below
- ok: (setup) a timed own Meeting and a timed shared two-day Meeting saved — ["imv1l58vtd1l005",2]
- ok: the bar lifts and follows the mouse (a ghost, the date under it lights), legible — {"ghost1":1,"over":1,"ghostTxt":{"text":"Ranger · S58 own","bg":"color(srgb 0.195471 0.174758 0.130525)","color":"rgb(241, 244, 247)","cls":"ib-bar amb timed ic-ghost lift"}}
- ok: dropped on the next day: it moved one day, keeping its hours and (still timed) look — {"before":[["Jul 7","","540-600"]],"after":[["Jul 8","","540-600"]],"timed":true}
- ok: the release did not open the input it moved
- ok: Undo puts it back on 7 Jul — [["Jul 7","","540-600"]]
- ok: a cancelled drag (Escape, then brought home) causes no move — [["Jul 7","","540-600"]]
- ok: the shared timed span moved as a whole (both people, same length and hours, still timed) — {"beforeS":[["Jul 14","Jul 15","540-600"],["Jul 14","Jul 15","540-600"]],"afterS":[["Jul 15","Jul 16","540-600"],["Jul 15","Jul 16","540-600"]],"texts":["2 · Meeting"]}
- ok: Undo restores the shared span's original dates — [["Jul 14","Jul 15","540-600"],["Jul 14","Jul 15","540-600"]]

### 58-phone — PASS — phone 390x844 (finger over CDP) — admin Saber (own input) — the phone half of 58
- ok: held still the bar lifts; dragged by finger it follows; dropped it moved one day with hours kept and the timed look — {"ghost":1,"before":[["Jul 7","","540-600"]],"after":[["Jul 8","","540-600"]]}
- ok: the release did not open the input
- ok: Undo restores 7 Jul — [["Jul 7","","540-600"]]

### 59 — PASS — phone 390x844 (touch) — member Ranger
- ok: a tap on a bar opens THAT input in its window — {"wins":["win-inputedit","win-inputedit-x"],"ttl":{"own":"S59 own","type":"Meeting"}}
- ok: a tap on empty space of its date opens that DAY, whose card agrees with the bar — {"day":true,"edit":false,"cards":["S59 own"]}
- ok: "+2 more" opens the intended DAY with all its cards (the month showed the rest) — {"day":true,"edit":false,"title":"Wed 22 Jul","n":6}

### 59-desktop — PASS — desktop 1440x900 — member Ranger — the tooltip half of 59
- the tooltip (the bar's title text) — Drifter, Echo, Ranger, Saber · Meeting · 23 Jul · 10:00–11:00
Placed by Saber for 4 people · 25 Jun 26, 14:32
- ok: a shared titled bar's tooltip names every person, the kind, the dates (and hours / filing detail), not just the clipped words — Drifter, Echo, Ranger, Saber · Meeting · 23 Jul · 10:00–11:00
Placed by Saber for 4 people · 25 Jun 26, 14:32
- ok: it carries filing details ("Placed by …") — Drifter, Echo, Ranger, Saber · Meeting · 23 Jul · 10:00–11:00
Placed by Saber for 4 people · 25 Jun 26, 14:32

### 60 — PASS — desktop 1440x900 — admin Saber
- the four lines — ["Tap a day to open it. Tap a bar to edit it, drag to move it.","Several days: drag across them (phone: hold, then drag).","NF no-fly · green public holiday · grey Off day.","File at least 14 days before the week starts."]
- ok: the fold has four items — 4
- ok: item 1 = tap a day/bar and drag; item 2 = several days; item 3 = NF / holiday / Off day; item 4 = the filing cut-off — ["Tap a day to open it. Tap a bar to edit it, drag to move it.","Several days: drag across them (phone: hold, then drag).","NF no-fly · green public holiday · grey Off day.","File at least 14 days before the week starts."]
- ok: the key reads "absence" and "duty" and the fold has no red/amber explanation — {"key":["absence","duty"]}
- ok: nothing runs off the screen (no sideways page scroll) — {"right":1428,"bottom":265,"h":900,"w":1440,"wide":1440}
- ok: it closes again — 0

### 60-phone — PASS — phone 390x844 (extra, the scenario says especially 390) — admin Saber
- the four lines — ["Tap a day to open it. Tap a bar to edit it, drag to move it.","Several days: drag across them (phone: hold, then drag).","NF no-fly · green public holiday · grey Off day.","File at least 14 days before the week starts."]
- ok: the fold has four items — 4
- ok: item 1 = tap a day/bar and drag; item 2 = several days; item 3 = NF / holiday / Off day; item 4 = the filing cut-off — ["Tap a day to open it. Tap a bar to edit it, drag to move it.","Several days: drag across them (phone: hold, then drag).","NF no-fly · green public holiday · grey Off day.","File at least 14 days before the week starts."]
- ok: the key reads "absence" and "duty" and the fold has no red/amber explanation — {"key":["absence","duty"]}
- ok: nothing runs off the screen (no sideways page scroll) — {"right":382,"bottom":292,"h":844,"w":390,"wide":390}
- ok: it closes again — 0

### 61 — PASS — phone 390x844 (touch) — admin Saber
- ok: opened: no words (Person, Type, Search) stand over the three boxes; each box says what it is by its value / placeholder — {"spans":0,"text":"Everyone ALL AVAIL ALL Ace Anvil Basher Blade Bolt Cinch Cinder Cobra Comet Cotter Cutter Dash Diesel Drifter Echo Fable Forge Gambit Ghost Grit Havoc Hex Hunter Jester Kraken Ledger Marlin Nomad Otter Outlaw Piston Pixel Quill Ranger Ratchet Reaper Rebel Recon Relay Ridge Rune Ryder Saber Saint Scope Scribe Sidewinder Static Talisman Tally Torch Trident Vandal Vapor Vector Warden Widget Wildcard Wisp Zenith Zulu All types LL OL OIL CCL PL FCL EL CL HL OML ATT C ATT B Upchit Training CSE Meeting Fly with Personal Appointment Duty Event OD Other","ph":"Search inputs","aria":[
- accessible names of the three boxes — ["Person","Type","Search inputs"]
- ok: the filter button and the gear did not jump when the fields opened — {"p0":[["#inFiltersBtn",306,106],["#inGear",344,106],["#inCalBtn",234,106],["#inListBtn",268,106]],"p1":[["#inFiltersBtn",306,106],["#inGear",344,106],["#inCalBtn",234,106],["#inListBtn",268,106]]}
- ok: closed and reopened: the values are kept (Ranger · Meeting · "Flight") and the buttons stay put — {"back":{"person":"Ranger","type":"Meeting","search":"Flight"},"sum1":{"btn":"Filters 3|3","cards":1,"foot":["2","1","3","Ranger · Meeting · Search: FlightClear filters"]},"p2":[["#inFiltersBtn",306,106],["#inGear",344,106],["#inCalBtn",234,106],["#inListBtn",268,106]]}
- ok: switching Calendar and List and back keeps the filter values; cards agree with them — {"person":"Ranger","type":"Meeting","search":"Flight","cards":1}

### 62 — PASS — desktop 1440x900 — member Ranger
- ok: "+ Input" in the opened 27 Jul gives that day, the "?" and no instruction paragraph — {"read":"Jul 27","help":1,"hint":0,"type":"Training","save":"Add","instr":[]}
- ok: a mouse drag over 27–29 Jul opens a new input with that span, same controls and "?", no paragraph — {"read":"Jul 27 → Jul 29","help":1,"hint":0,"type":"Training","save":"Add","instr":[]}
- ok: "+ Input" on the List supplies no date; same controls and "?"; no paragraph — {"read":"pick a start date","help":1,"hint":0,"type":"Training","save":"Add","instr":[]}

### 63 — PASS — phone 390x844 (touch) — member Ranger (shared inputs he filed himself; the demo four-person one is another man's)
- ok: an editable one-person input: no instruction paragraph — {"h1":null,"paras":[]}
- ok: saved four-person input: "Date changes apply to all 4." — Date changes apply to all 4.
- with Blade ticked but NOT yet saved the line reads — Date changes apply to all 4.
- ok: after one is added and saved: "…all 5." — Date changes apply to all 5.
- with Ace and Wisp unticked but NOT yet saved the line reads — Date changes apply to all 5.
- ok: after two are removed and saved: "…all 3." — Date changes apply to all 3.
- ok: two people reduced to one: the shared line "…all 2." before, and none once one person remains — {"ha":"Date changes apply to all 2.","hz":null,"left":["Ranger"]}

### 67 — PASS — phone 390x844 (touch) — admin Saber, then member Ranger — a persisting world, signed in again after a saved change
- settings as first opened — {"lead":"14","mf":true,"mode":"true"}
- ok: Cancel keeps the previous saved settings — {"lead":"14","mf":true,"mode":"true"}
- ok: closing by the X keeps the previous saved settings — {"lead":"14","mf":true,"mode":"true"}
- ok: Escape keeps the previous saved settings — {"vE":{"lead":"14","mf":true,"mode":"true"},"stillOpen":0}
- ok: a valid save is there when reopened (cut-off 9, member filing flipped) — {"lead":"9","mf":false,"mode":"true"}
- after the invalid save — {"toast":"","windowStillOpen":1,"hintTxt":"⠿ Inputs calendar settings admins only ✕ CALENDAR Calendar… Day, night or no-fly dates, and holidays. LATE CUT-OFF FOR INPUTS Days before A weekday Days before the week starts Later than this is LATE. Medical is never late. FILING FOR OTHER PEOPLE Members may file duties for others Never leave, medical or SANS. The number of days must be a whole number from 0 to 60. Cancel Save"}
- ok: an invalid cut-off is explained and does NOT quietly save the checkbox change — {"msg":"","still":1,"vI":{"lead":"9","mf":false,"mode":"true"}}
- Undo once, Undo twice (the cut-off and the member switch) — {"afterSave":{"lead":"9","mf":false,"mode":"true"},"u1":{"lead":"9","mf":true,"mode":"true"},"u2":{"lead":"14","mf":true,"mode":"true"},"base":{"lead":"14","mf":true,"mode":"true"}}
- ok: the cut-off and the member switch undo as separate steps (one Undo reverses one of them, the second the other) — {"u1":{"lead":"9","mf":true,"mode":"true"},"u2":{"lead":"14","mf":true,"mode":"true"}}
- after Redo twice — {"lead":"9","mf":false,"mode":"true"}
- ok: with member filing OFF, Ranger's Duty is for himself only (a fixed name, no list, no "Several people") — {"sel":0,"fixed":"Ranger","several":0,"gear":0}
- ok: with it back ON, Ranger's Duty offers other people (a list and "Several people") — {"sel":63,"several":1}

### 68 — PASS — desktop 1440x900 — admin Saber, then member Ranger
- Logic rows with the settings button — [{"text":"Inputs calendar settings…","row":"LEAVE, DOWNCHIT AND PERSONAL INPUTS SETTING An absence is booked as one of 24 things. Every one of them closes the man for the hours it covers — flying, sims, duties and ground slots alike — from the moment it is typed. The one exception: an input a scheduler "},{"text":"SANS calendar settings…","row":"LEAVE, DOWNCHIT AND PERSONAL INPUTS SETTING An absence is booked as one of 24 things. Every one of them closes the man for the hours it covers — flying, sims, duties and ground slots alike — from the moment it is typed. The one exception: an input a sc
- ok: the Logic page offers the Inputs settings button on its rows — ["Inputs calendar settings…","SANS calendar settings…","Inputs calendar settings…"]
- ok: every Logic row opens the same settings window with the same words as the gear — [{"i":0,"open":1,"same":true},{"i":2,"open":1,"same":true}]
- ok: the shortened helper lines are there through the Logic route — ⠿ Inputs calendar settings admins only ✕ CALENDAR Calendar… Day, night or no-fly dates, and holidays. LATE CUT-OFF FOR INPUTS Days before A weekday Days before the week starts For the week of Mon 26 Oct, inputs are due by the end of Mon 12 Oct. Later than this is LATE. Medical is never late. FILING 
- ok: "Calendar…" opens the calendar configuration window — {"wins":["win-days","win-days-x","win-inputsset","win-inputsset-x"],"setOpen":true,"ttl":["Calendaradmins only","Inputs calendar settingsadmins only"]}
- after closing the calendar window the settings window is — gone
- ok: Ranger has no Inputs gear — 0
- ok: Ranger has no working admin settings route through Logic (no Logic buttons, or the window opens without a Save) — {"lg":{"page":true,"btns":0},"opened":null}

### 69 — NOT RUN — phone 390x844 — guest
- NOT RUN: the guest / view-only boundary — the sign-in card offers no guest route — only username, password and "Sign in" (["|Sign in"]); no account was created and no unknown name was tried

## Errors seen (console, page, 4xx)
None. No console error, page error or failed request in any run.

## Anything that looked wrong and was not in a scenario
- **Only the new row is lit after Redo of a two-record filing** (picture s30-a-redo.png, opened): after Undo then Redo of the upchit filing the screen said "Redid: 2 inputs", the upchit row is lit, but the downchit row Redo shortened to 28 Jul is not lit.
- **Lights come back after a filter is reset** (scenario 28, picture s28-7-after-reset-lights.png): three rows saved a few seconds earlier, which had been dropped out of view by a filter being touched, were lit again the moment the filters were reset (still inside their six seconds).
- **A blue translucent block over the open window on a phone** (s63-four.png and s67-ranger-switch-off.png, both opened; both as the member Ranger, both within a few seconds of a save or the window opening): a blue box lies over the window's people list / Type box, at the place of the list card or "+ Input" button behind it. Not reproduced on a plain run (s-lit-behind-window-A.png, opened, is clean) — may be a transition caught in the picture.
- **The passing note stays over the question windows and over the window's Cancel button** on a phone (the stale "Input added" in s20-OML-docquestion.png, s21-*, s23-summary.png, s25-clash-chosen.png; "Input added for 4 people" over Cancel in s63-four.png).
- **On a phone the window covers the list's "+ Input"**; a finger can drag the window down by its title to reach it (scenario 31), and the window keeps that dragged-down place the next time it opens (it then has to be dragged back up to reach its dates).
- **A member's Calendar and List are filtered to himself by default** ("Ranger" with "Clear filters"): the demo's ALL event on 22 Jul does not show in his month or day (scenario 59 crowding test; 7 records on that day, 6 shown).
- **The Medical tab did not list Saber's own ATT C** filed with a document for 13–14 Jul (count stayed 2 / 1); Ranger's did appear. Not checked further (Saber may not be aircrew).
- **Scenario text differs from the ruling:** scenarios 1 and 30 say a fresh window starts on Duty; the brief and the screen say "Training" — the screen matches the brief. The fresh window's Title box is pre-filled with the kind's name ("Training"), which is not carried-over text.
- **Scenario 28's heading rule:** see the FAIL — pressing a column heading does not release the light on a row that is still visible (picture s28-9-after-heading-press.png, opened; the lit row has moved out of the first screen by the sort).

## Not walked
- 69: the sign-in card offers only username, password and "Sign in" — no guest route (s69-card.png). Nothing was created or tried.
- 25: only ONE resolution was walked (as told): "ATT B replaces" with the leftover default "Remove those days" (ATT C 31 Jul removed); "Keep them" was not walked.

## Pictures
107 pictures saved in the folder (including a few probe pictures); 17 opened and looked at, among them one behind every FAIL, the medical scenarios (20, 21, 23, 25), the member scenarios (30, 58, 63, 67), and 56 and 57.
