# The M365 move plan — the fresh reader's report (31 Oct 26, the night)

One fresh, blind Opus reader (D790, D903) compared `raptor-port/docs/superpowers/plans/2026-10-31-m365-move-plan.md` with
the SWiFT kit (his files, kept out of the project) and spot-checked Raptor's side. Read-only. Saved as it arrived; what
was done about each finding is in the plan's own history (the commit after this one).

1. §1 #11 wrong — the two demo sign-ins check seeded passwords in `raptor-port/src/state/accounts.ts` (`SEED_PASS`; D223
   "only the two seeded sign-ins check it"); the kit's hand-over search for "password" finds them. Fix: reword #11; add a
   small database-step point — the password box and the seeded passwords go when Microsoft's sign-in replaces the page.
2. Point 20 misstates D213 — a guest sees a medical input's type and remarks on the published schedule, not its documents.
   Fix: "…every member reads it in full, documents included (D211); a guest sees its type and remarks (D213)…".
3. §1 #7 overclaims — `tsconfig.app.json` has `noUnusedLocals: false`, `noUnusedParameters: false`; the kit's new-project
   step wants both true. Fix: move to the work list ("switch both on, fix what they flag"), small to count, fixed area by area.
4. Point 3 leaves the lint command unaddressed — the kit's ready check runs `npm run lint`; `package.json` has no `lint`
   script. Fix: add one (it may run the code check); if point 3 is followed, the kit's code-check settings file goes into
   `raptor-port/`.
5. Point 13 understates the loose types — about 2,700 "anything goes" types in the engine outside tests (recheck the 3,400
   figure), about 2,900 elsewhere (screens ~1,800, state ~770, Leave War ~270); the kit asks for a written reason on each.
   Fix: both figures, and a recommendation for the non-engine parts.
6. Coverage: "never swallow an error" — about 116 empty catch blocks in app code; #12 covers saves only. Fix: add a point
   (each shows the reason or carries a one-line why; a preference read inside a try is allowed by the kit).
7. Coverage: the real-data search (real-looking names, units, phone numbers, ID-shaped values, internal web addresses) is
   in the kit's ready check and in no point. Fix: add to point 4 or 29.
8. Coverage: bringing in an existing app — the kit moves the screens onto Microsoft's code-app template (point 26 should say
   why Raptor adds Microsoft's package to its own build instead); and the kit's rules file is added and filled in (point 29
   or 30: the hand-over copy carries it, filled in).
9. Coverage: the kit's first rule — what may be shared with the AI tool (made-up data only; no real records or pictures of
   live systems). Fix: a line under "Already fits", pointing to point 32.
10. Coverage, minor: the table list, the per-table types and the choice numbers change together in one change (point 19);
    no commented-out code left (point 6).
11. Order: point 34 says "now, with point 1" but sits under "At hand-over" — move it next to point 1; point 27 works in
    the hand-over copy point 29 makes yet comes first, and 29 is his call — put 29 first and say 27 falls if he strikes 29.
12. Plain language: points 3 and 13 are his calls but say "lint check", "TypeScript", "JavaScript", "types" unexplained —
    say what each means in the same sentence.

Public safety: nothing found. D1531's short line: faithful (D138). Verdict: sound and safe to publish; fix 1–5 before it
goes to him, 6–12 smaller.
