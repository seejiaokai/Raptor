# The project guide's "no rule versioning" line — a correction DRAFTED for his approval (D2024), not applied

**What this is (chat 67, the night of 13 Nov 26).** His D2024 (13 Nov 26): "The project guide's statement that the app
keeps no copy of old Logic settings is to be corrected, the change read first by Astra and a fresh, blind Opus reader."
A working-guide change is made while he is awake, so tonight the wording is only drafted and read; `raptor-port/CLAUDE.md`
is NOT edited. On his word the line below replaces the old one, in a change of its own that merges on his "merge live".

## The line as it stands (`raptor-port/CLAUDE.md` §Stable decisions → Pipeline & repo invariants → Product invariants)

> no rule versioning (narrowed 26 Sep 26 by D186: a published day keeps the brief lead it printed, with it — one
> printed value, not a versioned rulebook)

## The line proposed

> no rule versioning — the rulebook itself keeps no history (narrowed 26 Sep 26 by D186 and 12–13 Nov 26 by D2005,
> D2014: a published day keeps the Logic settings it was published under — its printed B, its checks, and its OIL's
> report lead, debrief and "Full day of OIL", D592 — until its next amendment is published; one kept copy per
> published day, not a versioned rulebook)

Nothing else in the bullet changes (the items after the first "·" stay word for word).

## Why
- **D186 (26 Sep 26)** narrowed the 7 Aug 26 invariant for ONE printed value: a published day keeps the brief lead it printed.
- **D2005 (12 Nov 26)**: "A published day is checked by all the Logic settings it was published under, not only the
  brief it printed; a changed setting applies to that day from its next amendment and to every unpublished day at
  once." Built the night of 12 Nov 26 (pull request 762): each published day keeps a copy of the Logic settings.
- **D2014 (13 Nov 26)**: a published day's OIL follows the "Full day of OIL" setting it was published under. The build
  of 13 Nov 26 found this was already so since [OIL-WORK-START] (D592 (4), 5 Oct 26: the report lead, the debrief and
  the full-day line are kept in the published record); it is now pinned by tests and walked.
- So the guide's "one printed value" is no longer true, and a chat that reads it would wrongly treat every other
  setting as read live on a published day.
- What stays true, and is why "no rule versioning" is kept as the invariant's name: there is no rulebook of numbered
  versions, no history of the Logic settings, and nothing to pick an old version from — only the copy each published
  day carries until it is published again.
- Known limits of D2005, deliberately not in the line (they are in `docs/engine-rules.md` §Publishing and the backlog
  item [RULES-CHECK-FIXES]): the titles on a puck's chip, the same-time note and the R box still read today's settings;
  the open-ended row's assumed hour on a published day is a question waiting for him (13 Nov 26).

## Where the same statement stands elsewhere (already corrected, or not a guide)
- `docs/engine-rules.md` §Publishing — rewritten with the builds of 12 and 13 Nov 26.
- `docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` row AM7 — corrected 13 Nov 26 (names D592, D2005, D2014).
- `.claude/rules/decisions/scheduler.md` — the rulings page states D2005 and D2014 themselves.
- Older specs and briefs that quote the 7 Aug 26 invariant are records of their day and are left.

## The read asked of each reader (a working-guide change — narrow brief, D70, D1761)
Read the old line, the proposed line, and the full rows of D186, D2005, D2014, D592 and D2024
(`grep -h '^| D2005 |' .claude/decisions-full/*.md .claude/rules/decisions/*.md`), and `docs/engine-rules.md` §Publishing
on this branch. Answer only: (1) does the proposed line say what those rulings mean — nothing more, nothing less;
(2) does it contradict any guide or ruling; (3) does it drop a safeguard the old line gave, or add bulk the guide does
not need; (4) any wording a fresh model would misread. A finding names the words and the ruling it is measured
against, and proposes the corrected words.

## The line REVISED after the two reads — this is the one put to him

> no rule versioning (narrowed 26 Sep 26 by D186, 5 Oct 26 by D592 and 12–13 Nov 26 by D2005, D2014: a published
> day's issued version uses the Logic settings it was published under — the brief lead behind its printed B, its
> checks, and its OIL's report lead, debrief and "Full day of OIL" — until the day is next published (an amendment, or
> Unpublish and publish again); a working copy with changes waiting uses today's settings; the settings are kept with
> each published version, not a versioned rulebook; the exceptions, and which changes read pending, are in
> `docs/engine-rules.md` §Publishing)

What each read changed: both readers, blind to each other, found "one kept copy per published day" wrong — each issued
version (the original, each amendment) keeps its own, so it reads "kept with each published version" (Astra's words).
From Astra: "a published day's issued version uses", the working copy's sentence, and the opening "the rulebook itself
keeps no history" dropped as a repeat of "not a versioned rulebook". From the fresh Opus reader: "until the day is next
published (an amendment, or Unpublish and publish again)", as D186 has it; D592 given its own date; the pointer to
`docs/engine-rules.md` §Publishing for the settled exceptions (Insights' work hours read today's settings, D482) and
for which changes read pending; "the brief lead behind its printed B". One round each (D70): the revised line has NOT
been read again — the coordinator's own merge of the two reads, his to approve or change.

## The reads, as they arrived (13 Nov 26; each reader blind to the other)

### Astra (the Codex CLI, read-only)

1. **Meaning:** The main correction is right. D186 covers the printed brief; D2005 says “all the Logic settings it was published under”; D592 and D2014 preserve the OIL settings until republication. D2024 authorises correcting the guide. Two wording changes are needed below.

2. **Contradiction:** “one kept copy per published day” suggests only one copy survives across amendments. Publishing says a historical view uses “that version’s own” settings, so this could lead a model to overwrite earlier versions’ settings. Replace those words with **“settings kept with each published version”**.

3. **Safeguards and bulk:** No old safeguard is lost: “not a versioned rulebook” preserves the prohibition on maintaining a separate rulebook history. Naming the wider exception earns its place, although “the rulebook itself keeps no history” repeats the ending. The guide calls itself an “INDEX”; remove that opening explanation and retain **“not a versioned rulebook”** once.

4. **Fresh-model misreading:** “a published day … its checks … until its next amendment is published” could wrongly include its edited working copy. Publishing explicitly says “once the day has any change waiting its working copy reads today’s settings”; otherwise a model might check proposed changes against old limits. Change **“a published day keeps”** to **“a published day’s issued version uses”**, and add **“a working copy with changes waiting uses today’s settings.”**

### The fresh, blind Opus reader


Checked: the old and proposed lines, the full rows of D186, D2005, D2014, D592 and D2024, and engine-rules.md
§Publishing (around the D592 (4) bullet and the D2005 / D2014 passage). The line is mostly sound and contradicts no
ruling. Four findings, in order of weight.

1. **(4) misread: "one kept copy per published day".** engine-rules §Publishing says each publication freezes its own
   values ("`daySnap` freezes them … at every publication"), and that "a look at a version" reads "by that version's
   own". So each issued version (ORIG, AL1, …) carries its own copy, not each day. Together with "the rulebook itself
   keeps no history", a fresh model could think a day holds one copy that is overwritten, and drop the copy from older
   versions. Proposed words: "one kept copy in each issued version of a day, not a versioned rulebook".
2. **(1) slightly narrower than D186: "until its next amendment is published".** D186 reads "until the next AL (or
   Unpublish and publish again)", and engine-rules lists "first publish, an amendment, Unpublish then publish" as the
   points where the copy is refreshed. Proposed words: "until it is next published (an amendment, or Unpublish and
   publish again)".
3. **(1)/(4) over-broad: "keeps the Logic settings it was published under … its checks".** engine-rules names settled
   exceptions, not just the known limits the brief left out on purpose: Insights' work hours read today's settings
   ("D482, settled"); "the validator's other OIL checks" run under today's settings; once a change is waiting, the
   working copy "reads today's settings — it previews the next amendment". A fresh model could take the line as
   "everything about a published day reads its kept copy" and "fix" Insights. The line also says nothing about pending
   marks: only the brief lead (D186) and the three OIL values (D592) make a day pending, and "A changed setting never
   makes a published day pending through its checks". Proposed addition (one clause): "— its exceptions, and which
   changes read pending, in `docs/engine-rules.md` §Publishing".
4. **(1) citation dates: D592 is cited with no date.** D592 (5 Oct 26) narrowed the invariant before D2005, and the line
   places it inside the 12–13 Nov narrowing. D1991 (11 Nov 26) is also a narrowing; D2005 takes it over, so leaving it
   out is acceptable. Proposed words: "narrowed 26 Sep 26 by D186, 5 Oct 26 by D592 and 12–13 Nov 26 by D2005, D2014".

**Minor:** "its printed B" stands for the brief lead the day printed (D186: "the brief lead it printed"). "B" is the
app's own word, so it may stay, but "the brief lead behind its printed B" would be exact.

On the other questions: no safeguard of the old line is dropped — the old "one printed value, not a versioned
rulebook" survives as "the rulebook itself keeps no history … not a versioned rulebook", matching D186's "the rulebook
itself stays unversioned". The line does not contradict D2005, D2014 or D592 (4); its length is proportionate.
