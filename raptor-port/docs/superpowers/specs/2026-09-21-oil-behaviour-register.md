# The OIL behaviour register — what this build had to obey (21 Sep 26)

The standing order (CLAUDE.md §SWEEP THE RULES): search the record for every ruling
that applies, list it in plain words, hand-test the build against the list, and flag
any clash the moment it appears. This is that list for `[OIL-AUTO-REMOVE]` and
`[ALL-AVAIL-REDEF]`.

One line per ruling, with its id. The design that answers them is
`2026-09-21-oil-auto-remove-decisions.md`; `npm run rulecheck` fails if a ruling here
is named by no test.

**Two clashes were found and are flagged at the bottom.** Both are resolved by the
newest-instruction-wins rule, and both need the owner to know.

---

## From the 21 September session (the owner's own design)

| id | in plain words |
|---|---|
| OIL1 | The way in is ONE button at the top of the day — "OIL Earn" — on weekends and public holidays only. Not a per-row button, not a separate panel. |
| OIL2 | Pressed, it goes green and every man who earns OIL that day wears a glowing green puck. Tap a puck to take the glow off, tap again to put it back. |
| OIL3 | Tapping a man's puck takes him off THAT ONE event. His other events keep glowing and keep counting. |
| OIL4 | The figure is his day from first start to last end, gaps included — never the sum of what is left. So unticking one puck often changes nothing, and occasionally costs half a day. |
| OIL5 | Every puck shows its own figure live, FO or HO, where the qualification letter normally sits. Without it the mode looks broken. |
| OIL6 | A full day and a half day look different: a solid glow against an outline only. |
| OIL7 | Tapping an ITEM's name stops the whole item earning — so a tenth man added later does not earn silently. |
| OIL8 | An ALL / ALL AVAIL puck opens into real pucks inside the mode, or its people cannot be tapped at all. |
| OIL9 | "Nothing today earns" is a fact about the DAY, so it covers anything added later. The row and person marks underneath survive and come back when it is turned off. |
| OIL10 | The member's own answer to the OIL question decides whether his input's puck glows by DEFAULT. The admin can overrule it, and the member's answer is never overwritten. |
| OIL11 | All OIL now waits for publication — the schedule's and a duty-and-commitments claim's alike. |
| OIL12 | Overseas duty never lands on the ground programme but shows under Unavailable as OD, and the mode reaches it there. |
| OIL13 | An input the scheduler took off the programme earns nothing, whatever the member answered. |
| OIL14 | ALL AVAIL / ALL: no ground crew; a SANS man IN when he is planned on our programme that day; ATT B in; anyone whose commitment or existing tasking overlaps the event OUT. |
| OIL15 | ALL and ALL AVAIL stay identical — one behaviour, two names. Do not "fix" the duplication. |
| OIL16 | Marking an item or a person on an already-published day goes out as an amendment. |
| OIL17 | The marked state is NEUTRAL — never amber, never red. |
| OIL18 | Every one of these controls is drawn only on a day that can earn. Five days a week the board is unchanged. |
| OIL19 | ⓘ info-only silently killed OIL and its wording did not say so. It says so now. |
| OIL20 | OIL is shown POSITIVELY on the schedule: a green bar down the LEFT edge of the puck. Full height is a full day; the bottom half, a shade paler, is a half. |
| OIL21 | That bar is the MAN'S DAY, repeated on every puck he wears that day — never what one event earned. |
| OIL22 | It retires the "NO OIL" marking entirely: if green means earns, no green means earns nothing. |
| OIL23 | A sentinel puck wears the bar only when the people behind it all earn the same thing. Mixed, it wears none and its count chip says "6 of 9 earn". |
| OIL24 | The published schedule IS the truth — a full freeze, no carve-out. Correcting an issued day's OIL is unpublish-and-republish under the same label, or the end-of-day publish. Neither costs an amendment number. |
| OIL25 | A decision is addressed by what SURVIVES a member's edit: an input-derived one by the input's own id, a hand-built row by its row id. |
| OIL26 | The change ships behind the existing development reset, at its real scope — the weeks, the published days, the inputs and the Leave War together. |
| OIL27 | An OIL-only edit is publishable, as ONE amendment item reading "the OIL decisions on this day changed" rather than naming each man. |
| OIL28 | Nothing overrides ineligibility. An "allow" is permission to count real work, never permission to invent it. |
| OIL29 | The evidence is derived on the live working copy and frozen only on the issued day, so a plan parked and brought back months later can never resurrect an obsolete projection. |

## Rulings from before this session that the build had to keep

| id | in plain words |
|---|---|
| OIL30 | Six hours and one minute or more is a full day; exactly six hours is still a half. |
| OIL31 | What earns nothing by default: an SC spare · AVALON and BB, desks included · anything cancelled · a row with no readable times · a zero-length row · a ground row that came from an input · an ⓘ row · sim free text. |
| OIL32 | A day backed by BOTH the schedule and a claim is labelled the schedule's — the stronger evidence, and what a reader would go and look at. |
| OIL33 | A worked day that earns nobody anything says so — at the moment of publishing, and on the day itself while it is being built. |
| OIL34 | The credit always lands. A credit sitting on an undecided leave bid flags the day rather than replacing the bid. |
| OIL37 | A request filed on an already-published day auto-accepts on the WORKING copy as a pending amendment; the issued face stays frozen. |
| OIL38 | Amendment numbering is per-day isolated. |
| OIL39 | Undo of a publish is silent until the shared database registers it, then just a line in the history. |

---

## The two clashes

**OIL35 — a SANS man is now inside ALL AVAIL, and the war was hiding him.**
The owner's 18 August ruling keeps SANS off the Leave War roster unless the squadron
turns "Show SANS" on ("we will not show the SANS in the leave war however there is a
function to still enable this"). His 21 September ruling puts a SANS man who is
planned with us that day INSIDE ALL AVAIL — which means he earns OIL from a family
day. The first cut of this build let the credit fall on the floor while the switch
was off, and it was put to him as an open clash.

*HIS ANSWER, 21 Sep 26: "There's no way to credit OIL to SANs even when they are
hidden?"* — so hiding a man must not destroy his money. A credit is stored against
the PERSON and the DATE, not against a grid row, so a hidden man can hold one
perfectly well: it lands while he is hidden, and his row arrives carrying everything
he earned the moment "Show SANS" goes on. The guard that used to drop it keeps its
real job — a SENTINEL puck and a body the war has no business crediting are still
never credited. Pinned by two tests, one for each half.

*A question this raised, still open and his to answer:* GROUND CREW ride the Leave
War roster (his own 18 Aug ask), so a ground-crew man a scheduler NAMES on a weekend
row has always earned OIL from that row — unchanged by this build, and not something
any ruling covers either way. He is correctly OUT of the ALL AVAIL expansion; the
question is only whether being named should earn him a credit at all.

**OIL36 — "the old hours must never survive" vs "the published schedule is the truth".**
On 20 September the owner ruled that a credit's hours follow the work, and that what
must never survive is hours the man did not work. On 21 September he ruled that money
comes only from the issued document, precisely so that a member cannot move his own
already-issued credit by editing his own input.

*Resolved this way:* the LATER ruling governs. Re-timing an input on a published day
moves nothing by itself; publishing the day again moves it, and then the old hours
are gone exactly as the 20 September ruling requires. The correction costs no
amendment number (unpublish and republish under the same label, or the end-of-day
publish), which is the path the owner himself proposed for this family of case.
