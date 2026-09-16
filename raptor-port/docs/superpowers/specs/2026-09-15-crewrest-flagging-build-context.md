# BUILD CONTEXT — live flagging on the published schedule (in progress)

**Branch:** `claude/crewrest-published-flagging` · **Model:** Opus 4.8, HEAVY, test-first.
**Spec:** `2026-09-15-crewrest-flagging-plan-v2.md` (§5 mechanism, §11 tests, §14 hard-spots).
**Rule:** content byte-frozen → `tfin.js` 728/0. No merge until owner says "merge live".

This file is the RESUMABLE build log: the locked implementation design + phase
plan + progress, so a fresh session can pick up mid-build. Update the Progress
table as phases land. Delete when the feature is merged.

## The mechanism actually chosen (grounded in code, not the plan's abstractions)

The plan (§5) offers "snapshot/restore around the OFFICIAL run, exactly as
`withDaySnap` does for DAYS" as an alternative to a global-free `validate()`
rewrite. We take that — it keeps the blast radius on the 1272-line
`engine/validate.ts` tiny.

1. **`validateCore()`** = the current `validate()` body from the `ev=collectEvents()`
   line through `WARN={...}` and `return WARN`, MINUS the 5 DOM-counter lines
   (the `$('nHard')`… block at the end). It still writes every module global
   (WARN/REST/EVD/RUNLEN/RUNSEED/NEXTON/EVDAYS/PREVSUN/NEXTMON/CREWREST_BODY/XD_CACHE)
   exactly as today. There is exactly ONE top-level `return` (the final one); all
   other `return`s are inside nested closures. Clean extraction.
2. **`validate()`** = `const w=validateCore()` (WORKING; writes globals) → `OFFICIAL=officialFor(w)` → `emitCounters(w)` (DOM counts from WORKING only) → `return w`. Signature unchanged.
3. **`officialFor(working)`**: if nothing diverges → `return working` (ALIAS, same
   object ref — drift-proof by construction, zero cost). Else
   `withIssuedWeek(()=>{ const o=validateCore(); return {all,byDay,sev,chip,dash,trace} })`.
4. **`withIssuedWeek(fn)`**: snapshot ALL module globals → install every approved
   day's issued snapshot into DAYS + SCHED.changes (+ filing overrides, phase 4) →
   set world='official' → `fn()` → finally restore world, DAYS, globals. Installs
   ALL approved days at once (F-4/CRP-006), not per-day.
5. **World flag** lives in a NEW neutral module `engine/world.ts` (`getWorld`/`setWorld`)
   to avoid a validate↔weekctx import cycle. `weekctx.bundle(v)` consults it: world
   ==='official' → resolve each neighbour day via `daySnapIn(stash.sc, di, dayCurVerIn(stash.sc,di,v), v)` (the exact resolver OIL uses); no stash/SCHED → fall back to working seed. (CRP-001/F-2, phase 3.)
6. **OFFICIAL bundle export** + a surface-resolved accessor. Render path (view week)
   already funnels through `html.ts` local helpers `sev/chip/dsh/traceHit/chip`
   which gate on `PV`; the overlay = when rendering a published day's frozen face
   under a "show official flags" mode, those helpers read the OFFICIAL bundle
   instead of returning null, and `dayWarnHTML` is no longer skipped. Click/focus
   (view.ts, interactions.ts) + trace also resolve to the displayed day's version.
   Edit-page surfaces (board.ts, board-html.ts, palette-html.ts, avail.ts probes,
   insights) keep reading the WORKING module global.

## Alias gate (the divergence test) — §14.1

`officialDiverges()` = SOME approved day in the WHOLE dependency window (loaded
week ∪ prev week back to maxRun days ∪ prev Sunday ∪ next Monday) has a non-empty
`dayDelta`/filing delta. Phase 1 uses the loaded-week deltas only; the
stashed-window widening (needs a days-parameterised `dayDeltaIn` reading
`stashDays(v)` — §14.2) is phase 3. An UNRESOLVABLE issued snapshot ⇒ "evidence
unavailable" (that week protected / no flags), NEVER "no delta → alias".

## Phase plan (each: failing test first → implement → affected tests green → commit)

| Phase | What | Spec refs | Status |
|---|---|---|---|
| 1 | Engine foundation: validateCore, OFFICIAL/officialFor/withIssuedWeek, loaded-week alias gate, officialWarn() accessor. WORKING behaviour unchanged (4770/4770 green). | §5.1,5.5 F-1/CRP-002/CRP-004 | **DONE** (d650a32) |
| 2 | Render overlay: view week's published days show OFFICIAL flags on the frozen face via withOfficialWarn + OFW; content frozen. pubsweep flipped per §10. | §5.4,§8 F-3/CRP-007 | **DONE** |
| 3 | Cross-week: world.ts wired; weekctx.bundle resolves neighbour weeks' issued days under world='official'; windowDiverges() widens the alias gate over the dependency window (stashed-day delta, §14.2); unresolvable→protect (content stripped). | §5.3,§14.1-2 F-2/CRP-001 | **DONE** |

**Perf watch (for code inspection):** `windowDiverges` + `weekctx.bundle` re-parse stash blobs per validate (every keystroke). Existing code already parses the prev-week stash each validate; this adds next + prev-prev + a second parse (stashSched). Consider caching `stashSched`/`stashDays` by blob reference (the `stashOilWeek` pattern) if `npm run perf` flags it. Correctness-first for now.
| 4 | Filing truth: `world.ts` frozen-filing map (keyed by dateOrd) honoured by `inpShow` + `workedSet` via `fileAcc`, gated by `filingActive()` so the non-official path is byte-identical (no id mint). Built in `withIssuedWeek` from loaded snapshots + `windowFiling` (neighbours). Primary 'r'-after-publish case + trap (a) RUN count pinned. | §14.3 Codex V2-002/003 | **DONE** (traps a + primary; **trap b deferred — see below**) |

**§14.3 trap (b) — DEFERRED for the code inspection to rule on.** The cross-week `inpShow` `xweek=true` fast-path (`if(xweek)return true`) bypasses the accepted-row dedup for seed reads. The spec asks to replace the blanket bypass with per-date dedup against the selected day's own rows during the OFFICIAL run. NOT changed here: it is a well-tested existing seed behaviour, the double-count edge is narrow (a neighbour issued day carrying BOTH a personal input and its landed ground row), and changing the seed dedup blindly risks a subtle regression. Flagged for the Codex + Fable inspection to confirm whether it bites in practice; fix with a test if it does.
| 5 | Click/focus world-identity: `view.displayedByDay(di)` resolves which bundle a day is showing (viewsched + approved + !VWORK + !DPREV → OFFICIAL, else WORKING); focusWarn + the 3 interactions reads route through it. A stale index → defined no-op (§14.4), never a throw. | §14.4 F-3/CRP-007/V2-004 | **DONE** |

**Phase 5 note for inspection:** the trace/warning markup carries only `data-wdi`/`data-wix`, not an explicit world (§14.4's ideal). `displayedByDay(di)` resolves by the TARGET day's displayed bundle, which is correct for the same-world case (#9) and a safe no-op when the index is stale; the cross-world edge (an OFFICIAL Monday trace whose target day is shown via VWORK) could focus a different index rather than presenting the origin world. Rare; flagged for Codex+Fable to judge whether a `data-world` attribute is warranted. Also NOT world-resolved yet: the person-select highlight (`personWarnDays`) and `openWarns` (no caller) — edit-page paths; note only.
| 6 | "Not Yet Signed" marker (`publish.notYetSigned`, captured pre-swap via `NYS`, rendered in `.dhver`, shown to everyone) + in-list "goes away / new once signed" markings (keyed diff code+who+di+prevDi, gated `!OFW && dayApproved && officialWarn()!==WARN` so parity holds). CSS added. pubsweep byte-frozen test updated to allow the marker. | §6,§14.5 | **DONE** |

**Phase 6 notes for inspection:** (1) the "goes away" rows render only when the working box already has ≥1 warning (`if(!all.length)return soloTrace` early-return kept) — a day whose warnings ALL clear to zero shows the marker but no struck rows; note only, marker covers it. (2) The markings annotate the FLAG day's list; §6's "also on the cause day" (the crew-rest trace box on prevDi) is NOT annotated — deferred, flag for inspection. (3) Marker lives inside `.dhver` so html.test.ts's noVerTag excision keeps parity.
| 7 | Gates all green; live drive confirmed on desktop+phone; Codex + Fable inspection. Hold for "merge live". | §11,§12 | **IN PROGRESS** |

## Phase 7 results (overnight 15–16 Sep 26)
**Gates (all green):** vitest 4781/4781 · build clean · tfin.js **728/0** · smoke:tracker 425/0 ·
e2e 423 passed / **2 pre-existing phone-width failures** (`geometry.spec.ts:1976` board flying-line
brief-inline + `leavewar.spec.ts:2241` phone sheet-gesture) — both documented pre-existing on `main`,
in code this change does NOT touch (board-html.ts + Leave War; my html.ts changes are inert under
PV=false/OFW=false, the board/edit path), e2e wrapper exit 0.
**Live drive (production bundle, Browser pane, admin ad/a):**
- Published Monday (day 0 signed+approved via probe bridge) STILL shows "14 issues · 6 warning" +
  all puck flags on the frozen issued face ("Original — as issued") — the headline criterion:
  before this feature publishing HID them. ✅
- Unpublished amendment (addWave) → the amber **"Not yet signed"** marker paints beside the ORIG tag,
  desktop AND phone (375px) — no day-head layout break. ✅
- No console errors, no 404s. Content frozen (issued face unchanged). ✅
- In-list "goes away / new once signed" tags: NOT driven live (needs a warning-CHANGING amendment,
  awkward via the console bridge) — proven by official-flags.test.ts + CSS in place.
**Bug-check:** Codex (gpt-6-astra high) code inspection launched via claudex-loop runner
(`review --host claude --model gpt-6-astra`); Fable pass next. Findings → fix → re-gate.

## Test-first cases (§11 + §14 extras) — tick as pinned
1 published day shows crew-rest/run/conflict, content frozen · 2 cross-week bust both dirs ·
3 two adjacent published, one amended, OFFICIAL≠WORKING across window · 4 fresh draft busts published → both worlds ·
5 hidden-fix struck-through both flag+cause day, reconciles on publish · 6 edit picker greys vs WORKING after OFFICIAL compute ·
7 VCONF/qual re-flags published w/ unchanged content · 8 medical/qual lapse flags OFFICIAL immediately ·
9 view-page tap on published-only warning opens THAT warning · 10 VWORK'd day shows WORKING under "Working draft" ·
11 board mirrors page's week · 12 tfin 728/0 + suites green ·
extras: undo past publish updates official · file-'r'-after-publish keeps official warning ·
delta-free loaded week + amended stashed Sunday → official bust shows · workedSet/xweek dedup · trace clicked through VWORK · DPREV/old-AL preview shows NO flags.

## Key code coordinates (verified this session)
- `engine/validate.ts`: globals L61-78 + CREWREST_BODY L1160 + XD_CACHE L1165; `validate()` L117; WARN= L1107; counters L1108-1112; return L1113. Probes `restIfPlaced`/`runIfPlaced`/`crossDayIfPlaced` read globals = WORKING/edit only.
- `engine/publish.ts`: `dayApproved` L120, `dayCurVerIn` L150, `daySnap` L213, `dayFilingFingerprint` L227, `dayDeltaIn` L254 (reads LIVE DAYS — §14.2), `daySnapIn` L298.
- `ui/html.ts`: `withDaySnap` L70, `dayIssuedHTML` L105, PV helpers L48-65 (`sev/traceHit/chip/dsh` return null under PV — the overlay point).
- `engine/weekctx.ts`: `bundle` L52 (world hook point), `seedRunIn`/`prevSundaySeed`/`nextMondaySeed`/`nextMondayWorked`.
- WARN readers (non-test): render via html.ts helpers (view) + board-html/palette-html (edit); list/click via board.ts, view.ts (L429/459/475), interactions.ts (L38/995/1108); trace via html.ts (L617-621), view.ts (L437); insights.ts, Modals.tsx; avail.ts (edit probes). probe-bridge exposes accessors.
