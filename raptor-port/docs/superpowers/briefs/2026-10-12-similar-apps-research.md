# Other apps like ours — what the public web shows (12 Oct 26)

**Why this exists.** His question, 12 Oct 26, while step 3 of the one-rule job was being built: *"can we search the web
to see if there's any other similar web app that is similar to raptor and see if we can take reference from them to see
if what we are doing has been done and we can learn from them"*. One helper searched the public web (it read no file of
ours — "ours does / lacks" below rests on a description of the app's seven parts). Backlog item: `OUTSTANDING.md`
`[SIMILAR-APPS-LOOK]`. Nothing here is a ruling and nothing was built from it.

**Caveat first.** Military tools publish very little. Several official pages refused to open; for those only the search
engine's summary was read — marked (S). Anything marked "inferred" was not read anywhere.

**The seven parts the helper was given:** 1 the weekly flying programme with its live rules check · 2 publishing with
four sign-offs, then numbered amendments and a change history · 3 personal inputs, for one, several or "everyone
available" · 4 the leave-bidding grid with manning counts · 5 earned time off in lieu (OIL) from the published schedule ·
6 the training-progress tracker · 7 the calendar where part-time aircrew offer days.

## The products

| Name | What it is, who uses it | Our parts | Source |
|---|---|---|---|
| **Puckboard** | US Air Force web scheduler, born from the whiteboard-and-pucks method; reported 24,000 users, 87 squadrons (S). Has an add-on that proposes crews. | 1 | news.mit.edu (opened); af.mil, rdworldonline (S) |
| **PEX (Patriot Excalibur)** | Long-standing US Air Force squadron scheduling and training-records tool | 1, part of 3 | flyingsquadron.com forum (opened) |
| **G/TIMS** ("TIMS" is the same family) | US training-command system: scheduling, syllabus, gradebook | 1, 6 | forum (opened); Northrop / Travis (S) |
| **ARES** | New US Air Force system to merge PEX, Puckboard, G/TIMS and others; first use planned 2027 | 1, 6 | airandspaceforces.com (opened) |
| **FlightPro** (Ocean Software) | Commercial military scheduler; Australian, Canadian, Finnish, UK air forces, including a Canadian fighter squadron | 1, some 6 | canada.ca, airforce-technology.com (opened) |
| **SHARP / M-SHARP** | US Navy / Marine training-and-readiness scheduling | 1, 6 | contract notices (S) — no design detail |
| **FlightLogger, Flight Schedule Pro, Talon ETA** | Flight-school schedulers with syllabus and progress tracking | 1 (simple), 6 | flightlogger.net (opened); others (S) |
| **Airline bidding systems** (Jeppesen, Navblue, AD OPT) | Pilots bid for monthly lines by preference and seniority | 4 | Wikipedia (opened); ALPA (S) |
| **SAFTE-FAST / FlyAwake**, shown inside **Leon** | Fatigue scoring from sleep and body-clock science | part of 1 | wiki.leonsoftware.com (opened) |
| **Deputy, NurseGrid, RosterElf** | Shift and hospital rostering | 2, 3, 5, 7 | NurseGrid help (opened); Deputy, RosterElf (S) |
| **UKG TeleStaff, First Due** | Fire / police vacation bidding | 4 | (S) only |

Not found or not relevant: no real open-source squadron scheduler on GitHub; Skedulo exists but is for field-service
visits; NALCOMIS not checked. No public tool found for reserve aircrew offering days.

## Lessons worth our attention

1. **Show the conflict itself, right where the scheduler is working.** The clearest PEX complaint: it says "there is a
   conflict" and makes you leave the page to find out what. (Forum, 2009 — old, but specific.)
2. **Speed and fit decide whether a tool survives.** Schedulers said the official systems were slow, bloated,
   one-size-fits-all — and went back to whiteboards and Excel. One called TIMS unusable for building a schedule because
   it depended on network speed.
3. **Suggest, with a reason; the human chooses.** Puckboard's add-on offers candidate crews with a short justification
   each, and the scheduler accepts or rejects. Its builders admit that "why him and not me" is still unsolved, and that
   crew chemistry cannot be programmed.
4. **After publishing, tell only the people whose day changed.** Deputy shows a count of unpublished changes on its
   publish button, offers "publish updates" (alerts only those affected) versus "publish all", and can ask each person
   to confirm. (S)
5. **"Anyone available" elsewhere means an offer sent to eligible people's phones.** NurseGrid and RosterElf send an
   open shift to those qualified and free; people claim it; it fills first-come up to a set number, or the manager
   picks. A natural model for the part-time aircrew calendar.
6. **In bidding, give a reason for every refusal and let people see the state of play.** Airline systems return a
   reason with each denied preference; "interactive" versions show others' bids while bidding is open. Pilots' standing
   complaints: confusing screens, and preferences that contradict each other. (Complaints (S).)
7. **Keep a fatigue score separate from the hard rest rule.** Leon shows a green / yellow / red dot per flight for
   predicted alertness and deliberately stopped using it to colour the legal-limit bars — so "against the rules" and
   "legal but tired" never blur.
8. **One glance: on pace, behind, or ready for the next step.** FlightLogger's headline progress view (the vendor's
   claim). Flight Schedule Pro goes further (beta): the syllabus recommends what to book next. (S)

## Ours does what the others appear not to

- **Everything in one place.** The US Air Force is paying a reported $100M to merge its separate tools into one.
- **Four sign-offs, then numbered amendments with a full history.** Nothing public describes this. Shift apps only
  "republish". (Military tools may have it and not say.)
- **OIL worked out from the published schedule.** Deputy's nearest equivalent derives time off in lieu from pay rules,
  and only on some plans. (S)
- **A live "everyone who is available" placeholder.** Others send an offer; none describe a placeholder that
  recalculates itself.
- **Leave bidding with manning counts beside the flying programme.** Elsewhere, separate products.

## Ours appears to lack (inferred from the description, not from the app)

- **Suggested or automatic filling of seats** — Puckboard, ARES and Flight Schedule Pro are all heading there.
- **A science-based fatigue score** beside the crew-rest and long-day rules.
- **Member-to-member swaps or give-aways**, standard in shift apps.
- **Phone alerts with "I have seen it" confirmation** after a change — the helper could not tell whether ours has
  this. *(The host's note: the bell's notices of the one-rule job — its step 7 — are the first piece of it; there is no
  phone alert.)*
- **Training need driving the schedule** — the syllabus telling the scheduler who needs what next.

## Could not find

Screenshots or user opinions of Puckboard, FlightPro or SHARP; how any military tool handles changes after publishing;
how vacation-bid rounds work inside TeleStaff.

## Links actually opened

- https://www.flyingsquadron.com/forums/topic/14817-flight-scheduling/
- https://news.mit.edu/2021/us-air-force-pilots-artificial-intelligence-assist-scheduling-aircrews-0708
- https://www.airandspaceforces.com/100m-software-contract-air-force-aircrew-management/
- https://www.canada.ca/en/department-national-defence/maple-leaf/rcaf/migration/2013/new-application-for-the-air-force.html
- https://www.airforce-technology.com/contractors/training/ocean-software/
- https://en.wikipedia.org/wiki/Preferential_bidding_system
- https://wiki.leonsoftware.com/wiki/safte-fast
- https://www.flightlogger.net/blog/2022/01/10/new-feature-duty-time
- https://healthstreamhelp.mcoutput.com/nursegrid/Content/NG_Mobile/Calendar/Picking_Up_a_Shift.htm

Refused to open (search summary only): af.mil, travis.af.mil and jbcharleston.jb.mil on Puckboard; rdworldonline.com;
aetc.af.mil on ARES; alpa.org; help.deputy.com; ukg.com; support.firstduesizeup.com.
