# Insights mission mix — design in progress, 3 Oct 26

Status: owner D512 approves the blue/red categories. Complete visual design and Board entry placement await his look;
no application code is built here. Astra plans under D496; Sol independently challenges before building. Claude's further
plan/code read after Monday 5 Oct 26, 19:00 is owed before main. No merge/main push.

## Approved and preserved

- D512: the existing Flying load · sorties this week chart splits each person's total bar into blue and red segments.
  Missions named "Red" and "DS" count red; every other mission counts blue. Both segments show for a mixed person.
- D481: the Scheduler Board gets an Insights opener. The proposed positions are beside the bell on desktop and in ⋯
  on a phone; the owner asked to see their placement first.
- D478: each day uses its latest published version, or the working copy only while not yet published. A waiting edit
  changes no published-day figure until issued. D482: current Logic rules still affect work hours at once.
- Existing weekly sortie eligibility, aircraft/crew counting, cancellations, standalone exclusions, person identities,
  roster handling, work hours, earned leave and permissions retain their meanings.

## Owner's reference and next step

The supplied phone picture shows the existing Insights four tiles, weekly sortie bars, top-twelve list and work-hours
bars. It is the placement reference, not evidence that any proposed mix matches those people's actual missions.
Prepare a phone/desktop picture in the app's existing style with illustrative mixed/all-blue/all-red bars and a clear
legend. Exact bar colours, visible split counts, the expansion control's appearance/behaviour and mission-word matching are implementation/design
proposals until the actual names are checked and the useful product choices are settled. Do not add new periods,
filters or hours metrics without an owner choice. Link the finished proposed picture and Astra/Sol disposition here.

Backlog: `[INSIGHTS-MISSION-MIX]`, with `[INSIGHTS-BOARD-DOOR]` in `[FEATURE-WISHLIST]` item 3.

## Proposed picture and pending answers

Actual-app design overlays: `../../img/insights-proposal/sorties-phone.png`, `sorties-desktop.png`, `board-phone.png`,
`board-desktop.png` in that same folder. These show temporary DOM overlays on the existing local production bundle,
not built application behaviour. The twelve sortie totals are retained, but the blue/red splits are illustrative
(Relay 2+2, Echo 0+3, Hex 3+0, Static 2+1, Ace 1+1; remaining rows all blue). No missions or saved data were edited.
The source generator and measured layout results live beside the pictures. The proposed Show all control and Board
opener are inert design controls. Phone390×844 and desktop1440×1000: no chart horizontal overflow; proposed Board
controls within viewport; zero page errors. All four final pictures opened by Sol. No app gates or feature pass claimed.

Two product questions were presented together. D513 answers the second: initial12 plus Show all.
For the first he explained the directional ambiguity (D514): DS for another formation means our flight is red air,
but a DS reference can describe external support coming to us. Real demo Mission boxes are BFM/SAT/ACM/AD; the
RED AIR / DS FOR VL examples are only in remarks. He asks whether Remarks should classify the sortie; this is a question,
not approval of a parser. Host recommends keeping Remarks free and not inferring a category from them.
One follow-up is pending: may a flight retain ACM/BFM as its Mission and count red? If yes, an explicit Blue/Red choice
is recommended, with its placement/scope to be pictured and its save/issued behaviour planned before building. If no,
exact Mission names Red/DS remain the sole automatic classifier. Do not treat the proposed extra field as approved.

The visible proposed count line is `2 blue · 2 red`, total at right, blue then red; ordering stays descending total.
Work-hours appearance and meaning stay unchanged. Weekly scope and sortie-count metric are already supplied by the
owner's target; do not put them back as questions. Complete visual look and Board positions still await his picture look.

## Astra proposal and Sol challenge — not build approval

Full independent Astra response, including its D512 short/full meaning PASS:
`../plans/2026-10-03-insights-planning-read.md`. Sol's challenge accepted the one-world aggregate approach and the two
bounded product questions, with these constraints before implementation:
- Category counters must be incremented in the same eligible-aircraft/occupied-seat traversal as current totals.
  Blue+red=n for every person, including the existing same-person-two-seats case; do not silently deduplicate.
- Pending mission changes on a published day must not leak into the split. Test the real Original → pending → AL
  path, plus unpublished neighbours and earlier-version preview. Keep current callsign labels over stable ids.
- Proposed controls must actually work in the final build; a screenshot of an inert overlay is design only.
  Short-screen sizing, accessible counts/legend, all-blue/all-red/empty cases, list expansion and every opener route
  need live operation and hit testing. Phone menu label must include Insights and close before opening the window.
- Re-answer the eight tier questions against the final diff; provisional WALK is for a derived chart/new opener
  that changes no issued-record writer, saved shape, authority, earnings or warning calculation. Any changed boundary
  widens the tier. Keep all standing gates and required fresh Astra inspection; Claude's further read remains owed.
- Keep an independent Insights branch based on the committed planning notes, with no selected Rally fixes copied in.
  Its work hours initially retain that baseline's behaviour. Integrate the complete reviewed timing work only in the
  eventual authorized integration order with explicit rechecks; never describe this isolated preview as containing Rally.

If an explicit saved Blue/Red choice is approved, the earlier provisional WALK proposal is superseded: saved data/issued
record boundaries make the build FULL. Read schema/model/undo contracts and applicable full rulings before designing it.

Current session tier: NONE (documents and design overlays; all eight application-risk questions NO because no application
source/behaviour changed). Design checks above are proportionate D499 checks, not an application bug check.

Later D513/D514 independent short/full/home comparison PASS, with complete response retained separately in
`../plans/2026-10-03-insights-follow-up-ruling-read.md`. Its clarity finding is corrected above: Show all itself is
approved, while the control's appearance/behaviour remains a design proposal. If the extra colour choice is approved,
formation versus individual-aircraft scope needs an owner answer before its saved design is written.
