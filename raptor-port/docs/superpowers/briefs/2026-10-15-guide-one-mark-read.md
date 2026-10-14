# Brief — a fresh, blind read of the design guide's "one mark, one look" draft (`[GUIDE-ONE-MARK]`, D866; D70)

You are a fresh reader; you did not write the draft. Read-only: change no file. Return ONE report.

**Read:** the draft, `raptor-port/docs/superpowers/specs/2026-10-15-guide-one-mark-draft.md` (four changes, before → after);
the guide it changes, `raptor-port/docs/design-practices.md` — §0 (what wins), §1's feedback point, §4 (colour, with its
table), §5 (motion); the rulings in full: `grep -h '^| D860 \|^| D861 \|^| D866 \|^| D852 \|^| D850 |' .claude/decisions-full/*.md`
(the shell, not the Grep tool); what the app does today: `raptor-port/docs/ui-contracts.md`, the paragraph headed "ONE
MARK, ONE LOOK"; and the writing rules every guide line follows: `.claude/rules/plain-language.md` and the guide's own §1a
and §1b.

**Ask of each change:**
1. **Faithful:** does it say only what his rulings say — nothing added, nothing narrowed, nothing lost (D138: a summary
   never changes the meaning)? Name any clause that is the agent's reading presented as his ruling.
2. **True of the app today:** does any sentence describe the app other than as `ui-contracts.md` and the code say
   (`raptor-port/src/ui/highlights.ts paintFreshAdds`, `raptor-port/src/ui/scheduler/06-inputs.css`,
   `raptor-port/src/ui/scheduler/25-inputs-calendar.css`, `raptor-port/src/ui/markring-css.test.ts`)?
3. **Usable by the next agent:** could an agent designing a new screen apply it without asking — where to put the ring,
   what "the edge of the thing added" means for a kind of thing not named, what to do for a reader who asked for less
   motion? Name the case it leaves open.
4. **Fits the guide:** does it contradict another line of the guide (§5's list of the motion already in the app, §1's
   feedback cases), repeat one, or sit in the wrong section?
5. **Words:** each sentence against §1a/§1b — a fact cut, a dash used as a join, a word he would not use.

A point is a finding only with the exact words that fail, why, and the exact replacement (D489). Report to
`raptor-port/docs/superpowers/briefs/2026-10-15-reads/guide-one-mark-opus.md`: a verdict line, then the findings numbered
G1…, each with severity (must / should / could), then what you did not read.
