# D1746 and D1747 placed on the page and checklists — the fresh, blind Opus read (8 Nov 26)

**What was read.** `claude/merge-one-at-a-time` had `main` brought in after the How we work rulings became a page (pull
request 663) and the five always-loaded rule files checklists (665). D1746 (the merge lock and a level check before each
merge) and D1747 (the pictures round drawn on the night of 7 Nov 26) were placed by hand: D1746's four merge steps on the
shipping checklist, cited beside D78 and D1742 where those are stated (`shipping.md`, `doc-structure.md`); D1747 on the
page's Order of work beside D1717; the page's step-4 line pointing at the merge lock's steps. One fresh, blind Opus reader
(a document read, D138) compared each placed line with the full rows of D1746, D1747, D1742, D1717, D78, D1750 and the
branch's own earlier wording (`26a8dfdb7`), at the merge commit `0e147b03e`, reading through git only.

**The brief, in short:** nothing dropped, added or changed in meaning; every condition of D1746 kept — every kind of
merge (his word, D1407 notes-only, D1093 runs), never `--auto`, the take with a 600000 timeout going on only on
`gatelock: taken`, each command on one line, behind → release and wait for D151 before bringing `main` in, his word
standing unless settling a clash changed this branch's own app code, release only a lock you took with its folder
written out; D1747's every condition; a finding only with the line, the ruling's text and the fix. Style, line length and
stored data were excluded.

## The reader's report (whole)

1. **The "at once" in the release step was dropped.** `shipping.md`, §"Push" and "merge live", step 4 — "Release a lock
   you took, whatever happened next …". D1746's rule says to release the lock *at once* after merging; the placed step
   lets a chat hold the merge lock while it confirms the live app (about 6 minutes for `main`'s run plus Vercel), and
   every other chat's merge would wait behind it. The 26a8dfdb7 wording had the same gap, and neither earlier read caught
   it. Ruling (D1746, bold): "… then merges and releases the lock at once". Fix: "4. Release a lock you took at once,
   whatever happened next — merged, refused or stopped — …".
2. **A condition was added to the one allowed push (low).** `shipping.md`, §"Done" means LIVE, bullet 1 — "except
   bringing `main` in when another chat merged first". Neither ruling ties the exception to another chat having merged;
   step 2 brings `main` in whenever the branch is behind (D1742's mark: "bringing main in is then the one push allowed
   between his word and the merge"; D1746: "if not, brings main in"). Fix: "… except bringing `main` in when the branch
   is behind it (step 2 above) (D1742, D78, D1746)."
3. **"Each on his word" sits next to the merges that need no word of his (low).** `shipping.md`, the parallel-chats
   bullet — "parallel chats merge one at a time, each on his word, each under the merge lock …"; the next bullet names a
   notes-only pull request merging by itself (D1407) and an "auto merge live" run (D1093). Fix: "parallel chats merge
   one at a time — each on his word, or by itself where the next bullet allows — each under the merge lock and level
   check below; …".
4. **"One lock" is no longer the only lock (low).** `shipping.md`, §The checks — "Parallel chats take turns through one
   lock on his PC …"; D1746 adds a second lock, a folder of its own, so a merge never waits behind a check run. Fix:
   "Parallel chats' full checks take turns through one lock on his PC, the checks lock (merges have the merge lock of
   their own, §"Push" and "merge live"); … (D228, D1746)."

**Checked, no finding:** every kind of merge named; the four steps' conditions (never `--auto`; the take's timeout and
`gatelock: taken`; each command whole on one line; behind → release, D151, bring `main` in, wait, start again; his word
standing unless the clash changed this branch's app code; release only your own lock, never after a stopped take, its
folder written out); the lock script matches the wording (`RAPTOR_GATE_LOCK` overrides the folder, `release` removes it
whoever holds it); "Done" means LIVE's two bullets (the D143 bullet below still says "that `main` commit", covered by
bullet 1's parenthesis — not untrue); `doc-structure.md`'s line, the talk-to-each-other bullet and the page's step-4 line;
the D1747 line, every condition there, "was drawn" true (chat 3's pull request 666); every number cited belongs to its
line. **Verdict:** the meaning holds in substance; finding 1 should be fixed, 2–4 are small one-line corrections.

## What was done

All four fixed as the reader wrote them, in the commit after `0e147b03e`; the converter's inventory clean and the
document check passing after.
