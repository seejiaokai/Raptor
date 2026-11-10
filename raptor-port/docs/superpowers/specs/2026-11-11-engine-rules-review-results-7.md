# Family 7 — the published day, amendments and what a frozen day reads (W68–W78)

Rules-first review, 11 Nov 26 ([ENGINE-RULES-REVIEW], D1983). Test file: `raptor-port/src/engine/rulesfirst-7-published-day.test.ts`
— 9 tests: 8 pass, 1 `it.fails` (finding 7.1). `npx tsc -b`: clean. Every ruling's full row was opened (D45, D44, D103, D179,
D183, D184, D185, D188, D178, D177, D189, D186, D187, D482, D478, D530, D327, D321, D101, D98, D1010).

| W-id | D-numbers | verdict | where implemented | the test | one line |
|---|---|---|---|---|---|
| W68 | D45, D44, D103 | MATCHES | `engine/publish.ts` dayDelta (content, input, warn, hide axes), signShown / pendingKey binding; the crowd: oilev frozen block | new: "D103 / D45: Ranger taken off published Tuesday's VL…"; existing: `engine/oilmembership.test.ts` "D44 — a changed crowd on a published day raises the pending mark" and "D103 — a changed crowd … wipes the sign-offs, and putting it back restores them" | A change reads pending, the four fall, putting it back restores them; the crowd frozen at publication. |
| W69 | D179, D183, D184, D185, D188 | MATCHES (with 7.U2 as built) | `engine/validate.ts` LIVE_ON_FACE, faceWarn, warnSliceOf; `engine/publish.ts` warnDelta | new: "D185 (e) / D188: the crew-rest check's tight-turn note is live…", "D185 (d) / D188: the crew-pairing warnings stay FROZEN…", "as built (7.U2…)"; existing: `ui/latepub.test.tsx` "D184 / D185 …" (5 tests), "D179 — medical freezes…" | The ruled live set (dotted mark + RUN twin, CREW_REST, CREW_TIGHT, DAYS_RUN, QUAL, SC_QUAL, AAR_QUAL, AAR_INSTR) is live; pairing frozen and pending; medical frozen. The set also holds six OIL advisories the statement does not list (7.U2). |
| W70 | D179, D183, D184, D185 (D188) | MATCHES | `engine/validate.ts` warnSliceOf (live codes and their marks never stored); `publish.ts` warnSliceKey | new: the tight-turn test above (dayDelta stays [] and the four stand through tight → breach → gone); existing: `ui/latepub.test.tsx` "a late duty put on the DRAFT day before breaks a published day's crew rest…", "the 7-day run: a lowered limit…" | Live warnings never make the day pending by themselves. |
| W71 | D178, D177 (D179, D185, D183, D184) | MATCHES | `engine/publish.ts` inputAxes / filingDelta, dayInputsFrozen; `engine/inputs.ts` frozenInputMatch; `validate.ts` frozen inputs on the official pass | existing: `ui/latepub.test.tsx` "D177 / D178 — an input change after publishing waits for the admin" (filed, edited, deleted, re-filed identical, next AL, Unpublish-and-republish), "D179 — … a downchit filed after publishing: the issued face shows no row and no DNIF…" | Every input change after publish is pending; the face keeps what it was issued with; a medical downchit frozen (the old D177 "stays live" reading is gone from the code). |
| W72 | D189 | MATCHES | `publish.ts` inpDetailKey (the printed "till" note), `engine/inputs.ts` | existing: `ui/latepub.test.tsx` "F1: the dates alone — a Mon–Tue leave stretched to Wednesday…", "F1, as the app writes it…", "F1: an upchit trims a Mon–Fri downchit…"; `engine/tilldate.test.ts` "inpDetailKey — a published day compares the printed remark (D189, D948 (3))" | Every published day the stretched/trimmed input still covers reads one change; dates alone are never a change. |
| W73 | D186 | MATCHES for the CAT, rename and the printed brief; UNCLEAR 7.U1 and DRIFT 7.1 where the live crew-rest check meets the kept brief | `engine/faceattrs.ts` (personShown, briefLeadShown), `publish.ts` freezeWarn (snap.pa, snap.rv), dayPeopleAttrs, faceRuleVals | new: "a CAT changed after publishing…", "as built (7.U1…)", `it.fails` "7.1 — the Logic line read as written…"; existing: `ui/latepub.test.tsx` "the brief lead changed on the Logic side: a published blank brief keeps the time it printed — on the face and in the CSV…", "a callsign renamed on a published day is a label…" | The face keeps the CAT and the brief it printed; but the live crew-rest warning on that face measures to today's brief. |
| W74 | D187 | MATCHES | `validate.ts` versionFaceWarn, withVersionWarn; `ui/html.ts` withVersionFlags | existing: `ui/latepub.test.tsx` "D187 — a look at a published version wears its warnings" (4 tests) and "D187, after its reads…" | Current version = View-only's face, older version = what it went out with. |
| W75 | D482 | MATCHES | `engine/insights.ts` computeInsights (today's rules on the published content) | existing: `engine/daystart-default-rally.test.ts` "published at a 1h default rally … then 3h: … Insights moves at once (D482)" | Insights hours move at once on a Logic change, published days included. |
| W76 | D478, D530 | MATCHES | `engine/insights.ts` computeInsights; the role store | existing: `ui/insights-published.test.tsx` "IN1 (D478) — a published day is counted as published…" (4 tests); `state/mission-roles.test.ts` "published A and pending B have independent immediate answers, preserved through AL and withdrawal" | Latest published version counted; a blue/red answer counts at once with no change to the book. |
| W77 | D327, D321 | MATCHES | `publish.ts` dayPeopleAttrs (putCrowd drops `archived`), peopleAttrsNow; `leavewar/sync.ts` availableFor | new: "Ranger named in published Tuesday's front seat, then archived…"; existing: `leavewar/onedoor.test.ts` "D327: ALL AVAIL reads an archived man by his stints…" | Named on the day → pending; only in the crowd → nothing pending. |
| W78 | D101, D98, D1010 | MATCHES | `publish.ts` unpublishDay (re-opens the AL's marks as pending, `correcting`), publishALDay, nextSeq; `engine/weekctx.ts` / `ui/peek.ts` | new: "Tuesday ORIG → AL1 → AL2 on its own track…" (also pins per-day numbering); existing: `engine/inputs-frozenmatch.wire.test.ts` (D98), `engine/accept.test.ts` "recovery discard count … (D98…)", `ui/peek.test.tsx` "D1010 — View-only Sched's preview shows a published day as published" | Unpublish leaves the changes pending, republish reissues the same number; per-day ORIG → AL1 → AL2. |

Counts: MATCHES 11 (W73 also carries one DRIFT and one UNCLEAR); findings 1 (DRIFT 7.1); UNCLEAR 2 (7.U1, 7.U2).

## Finding 7.1 — DRIFT: the Logic page says a published day's crew rest counts to the B it keeps; it counts to today's

- **The rule:** D932 — "every line is correct for whatever the settings are". The Logic page's setting "Brief before take-off"
  reads: *"Sets the suggested B on a line with no brief typed, and a blank B is checked against it. With no in-time typed,
  crew rest counts to this B. A published day keeps its B until it is published again."* (`ui/logic-html.ts` lgSettings).
  Read together, a user is told that on a published day crew rest counts to the B the day keeps.
- **Kind:** DRIFT (the Logic page's text against a real case).
- **Where:** `engine/validate.ts` — the official pass (today's judgement of the issued day, with today's VCONF.briefLead) feeds
  the LIVE crew-rest warning on the face (LIVE_ON_FACE, faceWarn); `engine/faceattrs.ts` briefLeadShown prints the kept lead.
- **The case:** Ranger (bane) flies Monday's LATE 18:00–19:00 (Monday a draft; +2h debrief ends 21:00, clear of crew rest at
  09:00). Tuesday is published with Ranger on VL, T/O 12:00, brief left blank: at the 140-minute lead the face prints B 09:40.
  The admin raises "Brief before take-off" to 200 minutes on the Logic page. Tuesday's published face still prints 09:40 (D186),
  Tuesday reads pending (the printed value changed — D186), and the face now carries a red live warning on Ranger: *"Crew rest
  breach — Monday landed 19:00, +2h debrief assumed → ended 21:00 → crew rest clear at 09:00, but told to report 08:40 — only
  11h40 rest."* Counted to the B the day keeps (09:40) he has 12h40 and no breach.
- **What they see:** a member reading View-only Sched sees Ranger ringed red for crew rest with a report time (08:40) that
  appears nowhere on the published schedule, whose B says 09:40; the Logic page told the scheduler the published day keeps its B.
- **Confidence:** high that the text and the behaviour disagree (reproduced; red line below). Which side is right is his
  (see 7.U1): D186 itself says "the validator and every working surface read today's rules", so the code may be the ruled side
  and the line the one to fix.
- **The red line:** `AssertionError: counted to the kept 09:40 B, Ranger has 12h40 — no breach: expected true to be false`
- **Suggested fix (not built):** either word the line as built ("…a published day keeps the B it printed; its crew-rest check
  uses today's") or, if he rules the kept B wins, have the official pass judge a published day's blank B with `snap.rv.briefLead`.

## 7.U1 — UNCLEAR: which B does the LIVE crew-rest check on a published day measure to?

- **The clauses:** D186 — *"a published day keeps the brief lead it printed with it; the rulebook itself stays unversioned (the
  validator and every working surface read today's rules)"*; D184/D185 — the crew-rest breach is live on the face, *"drawn from
  today's judgement"*, D183's purpose *"to see the break of crew rest"*.
- **The case:** as 7.1. The face prints B 09:40 and, beside it, a live breach "told to report 08:40".
- **As built:** the live warning reads today's lead; the day also reads pending (because the printed brief lead changed), so the
  admin is told, and the next AL prints 08:40 and agrees with the warning.
- **Why it is his:** D186 kept the printed value with the day precisely so the published document does not change under its
  reader; D184 made crew rest live so the reader sees a break. Here the two disagree on one face until the next AL. His rulings
  do not say which one the live check should read.
- **Test:** "as built (7.U1, a question for him)…" pins it. Settle by asking: "On a published day whose brief was left blank,
  should the live crew-rest check measure to the brief the day printed, or to today's setting?"

## 7.U2 — UNCLEAR: six OIL advisories are live on a published face, beyond the ruled list

- **The clause:** D179 "freeze everything for now"; the live exceptions are D183–D185/D188's list. D179's own "agent's reading"
  left live only "the Leave War's reminders that a leave period is missing" (OIL_NO_PERIOD).
- **As built:** `LIVE_ON_FACE` also holds OIL_STALE_DAY, OIL_STALE_HOLIDAY, OIL_OLD_BLOCK, OIL_UNPUBLISHED and OIL_NO_TIMES.
  The three "publish again" advisories are D2's "the day saying so" and can only exist after publication, so they are
  defensible. OIL_NO_TIMES is a RED warning ("… no usable times — nobody on it earns OIL for this day").
- **The case:** Tuesday (a weekday) published with Ranger on a flying line with no times typed — no OIL warning (weekdays are
  not read for OIL). The Leave War then calls Tuesday a public holiday. Tuesday's published face shows a new red warning at once,
  not stored with the version, never compared. With the engine's default hooks in the test, Tuesday reads nothing pending and
  keeps its four (in the real app the OIL block may make it pending — that is family 8's question).
- **What they see:** a red line appears on a published day for every reader with nobody acknowledging it.
- **Test:** "as built (7.U2, a question for him)…". Settle by asking whether the OIL advisories belong on the live list (and the
  page statement be widened to say so), or OIL_NO_TIMES should freeze like the other warnings.

## Outside my family (one line each, not reviewed)

- `HOOKS.oilDayISO` default leaves a weekday published under the engine's own hooks with no frozen OIL block, so OIL_STALE_DAY
  cannot fire in an engine-only test; worth checking with the war's hooks installed (family 8).
- The Logic page's "Brief before take-off" line is the only Logic / Help line found stating a published-day rule; Help says
  nothing about publishing.
- Not covered by this family's items and not tested here: a saved plan brought out on a published day (plain editing, normal
  marks) and the previous week's published Sunday into Monday's crew rest (pinned by `engine/official-flags.test.ts` Phase 3).
