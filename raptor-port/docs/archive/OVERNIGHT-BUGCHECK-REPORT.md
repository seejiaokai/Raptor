# Overnight bug-check — what I found, what I fixed, what needs your call

Written for the owner, 11 Sep 26 (early hours). Plain language. Both Astra (Codex)
and Fable (Claude) were used — Astra as the main bug-hunter, Fable to red-team the
fixes. Nothing went live; nothing was merged.

---

## The one-minute version

- I asked Astra to rank your last 20 changes by "what could bite a real user now."
  The top 3 were all in the **Tracker's saving/importing** — three ways student
  marks could quietly go missing.
- I confirmed all three by reading the code myself. Then I had **both models
  red-team my proposed fixes** — which caught that my first two fixes would have
  *made things worse*. That back-and-forth is exactly why we did this.
- **I safely fixed ONE of them** (the most likely to actually happen) — it's on a
  branch, every test passes, and it is **waiting for your "merge live."**
- **The other two are storage-architecture decisions that are yours to make** —
  I did NOT touch them. They're written up below with a recommendation each.
- **Your live app is safe right now.** None of this is silently breaking today.

---

## What I fixed (safe, done, waiting for you)

**The problem:** In the Tracker, if you **import** a file that contains a *different
person who happens to share a callsign* with someone already on the course, the app
used to silently drop the person already there — leaving their marks stored but
unreachable. On the most common file operation.

**The fix:** the import now **refuses** in that case, with a clear message ("that
file names a different person under an existing callsign — rename one, then import
again; nothing has been changed"), *before it writes anything*. This is the same way
the app already refuses other name clashes. Nothing is lost; you rename one and
re-import.

Why refuse instead of keeping both: both AIs showed that keeping two same-named
students would corrupt the roster and make your own backups impossible to re-import.
Refusing is the safe, consistent choice.

- **Branch / PR:** #386 (`claude/tracker-import-conflict-fix`)
- **Checks (all green, run locally):** full test suite 4492 pass · build clean ·
  reference parity 728/0 · Tracker browser suite 426/0.
- **Status: HOLD.** It will not go live until you say "merge live."

---

## Two things that are YOUR decision (I did not touch them)

Both are real but **rare** — they need your browser storage to be almost completely
full to trigger — and both are really the *same* underlying thing: the app saves in
the background, so a "did it save?" check inside the app can pass while the actual
save to disk later fails. Fixing that properly means changing the storage plumbing
that your future shared-database work sits on. That's why it's your call, not a
silent overnight change.

### Decision A — the migration/rename "safety check" checks memory, not the disk
When the Tracker upgrades old data, or you rename a course/syllabus, it copies
records, checks the copy looks right, then deletes the originals. That check reads
the app's *working memory* (which always looks right), not what actually reached the
disk. If the disk write fails (storage full) at that moment, an original can be
deleted before its copy is safely saved.
- **How likely:** low, and Fable found it's largely *self-healing* (the app keeps
  retrying and re-saves when you close the tab). It bites only if storage is within a
  few bytes of full AND the tab is closed before the retry lands (more likely on an
  iPhone, which doesn't warn on close).
- **My recommendation:** don't patch it piecemeal (it lives in three places). Fix it
  once, properly, as part of the database step — either a real "it's saved" signal
  the delete waits for, or a rule that a delete never runs while an earlier save is
  still failing. For now I'd log it as a known limitation. **Your call: accept it as
  a documented limitation until the DB step? (my recommendation) or want it fixed
  sooner?**

### Decision B — a half-finished one-time data import can hide the rest forever
The very first time an old browser loads the new version, it copies your old saved
data into the new format, once. If that copy is interrupted halfway (storage full),
the app thinks it's done and ignores the rest from then on — the data still exists,
but the app stops looking.
- **How likely:** low (needs storage full during that one first load).
- **Why I didn't just fix it:** the obvious fix would *resurrect records you've since
  deleted* on every existing browser — a new bug. The correct fix (a per-item ledger
  + grandfathering existing installs) is safe but touches the code that runs at every
  startup, so it deserves your eyes. **Your call: want me to implement the safe
  version (ready to go) on a branch for your review?**

---

## Two smaller things worth knowing (found in passing)

- **Syllabus rename** has the same "checks memory not disk" gap as Decision A —
  include it in that fix.
- **Import wording vs. behaviour:** the import dialog says "nothing else is touched,"
  but for a student the file *does* carry, it overwrites their marks with the file's.
  Restoring an old backup over a live course would quietly revert newer marks. Not a
  crash — a wording/expectation gap. Worth a decision on the message.

---

## Why I'm confident in all this
Two different companies' AIs, reading your code separately, **agreed** on every one
of these findings — and then caught the flaws in my first fixes before any code was
written. That's the strongest signal you can get that this is real and that the one
fix I landed is the safe one.

Full technical detail: `scratchpad` review logs (this session). The rid-engine wiring
(the big task #1) is still not started — its own red-team is done and waiting.
