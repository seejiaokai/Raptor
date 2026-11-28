# Section 1 — the code check's two findings in `ui/UsersPanel.tsx`: the builder's report (chat 204, 26 Nov 26)

Brief: `2026-11-26-msq-s1-lintfix-brief.md`. Nothing committed or pushed; `HANDOFF.md` untouched.

Status: READY FOR INDEPENDENT REVIEW

## Lines changed (`src/ui/UsersPanel.tsx`, +22 / −6 — only the lines the brief allows)

1. **New plain function `addFormDiffers(name, np, role, postIn, postIn0)`**, placed right after `useUsersFilter`. It
   holds the four-part "differs" test unchanged, and the whole comment that explained it (why the post-in date is
   compared with `postIn0`) moved with it, plus one sentence saying why it sits outside the component.
2. **The `addperson` line** now reads `useGuardWork('addperson', adding && addFormDiffers(name, np, role, postIn, postIn0))`,
   with a one-line pointer comment in place of the moved one.
3. **The `openNew` effect** is replaced by React's "adjust state while drawing" shape:
   - a `[openSeen, setOpenSeen] = useState(0)`; during the render, when `p.openNew ?? 0` differs from `openSeen`,
     `setOpenSeen(it)` and, if it is non-zero, `setAdding(true)`;
   - the focus request stays a ref written in an effect: `useEffect(() => { if (p.openNew) wantFocus.current = p.openNew }, [p.openNew])`,
     declared before the existing focus effect, so in the commit that first draws the form it runs first and the focus
     effect then finds the callsign box drawn (focus never on a phone — that effect is unchanged).
   - Behaviour kept: a non-zero, changing `openNew` opens the form; a first draw with it already non-zero opens it
     (`openSeen` starts at 0); a Cancel-folded form stays folded on redraws until `openNew` changes; a change to 0
     does nothing, as before. The opener button's own press is untouched. Nothing reading or setting `editing`,
     nor `PersonEditor`, `ArchivedEditor`, `PersonRow`, the `userrow` / `archrow` lines or `useRingLanding`, was touched.

## Test added (`src/ui/msq-guard-g.test.tsx`, G5, +26)

G5 already pinned "the form open and the callsign box focused" after Quals' "+ Add person". It did not pin the Cancel
case, so one case was added: open from Quals → Cancel → a redraw (`notify()`) leaves it folded and the opener shown →
back to Quals, press "+ Add person" again → the form opens and the callsign box has the focus. It **passed on the code
as it stood** before the change (G5: 2 passed, 13 skipped), and passes after.

## Checks (all from `raptor-port/`)

| Check | Result |
|---|---|
| `npm run lint:changed` before | exit 1 — 58 new findings; names both of this step's findings (`UsersPanel.tsx:563` high complexity, `:603` state adjusted after a prop change) and chat 205's (`:350`, `PersonEditor`); the other 55 are all in `src/ui/msq-guard-testkit.tsx` |
| G5 alone on today's code, with the new case | PASS — 2 passed, 13 skipped |
| The six named files (`msq-guard-g`, `msq-users-row`, `msq-users-filter`, `onedoor-users`, `admin`, `msq-guard-rollcall`) | PASS — 6 files, 102 tests passed |
| `msq-guard-open.test.tsx -t "Add a person"` | PASS — 11 ran and passed, 330 skipped |
| `npm run lint:changed` after | exit 1 — 57 new findings. **Gone:** "State adjusted after a prop changes". **Left:** `UsersPanel.tsx:571` (`UsersPanel`, high control-flow complexity) and `:350` (`PersonEditor`, chat 205's), plus the 55 testkit ones |
| `npm run build` (checks lock taken, released straight after) | PASS — exit 0 |

## What is left, and why

- **`UsersPanel`'s complexity finding stays reported.** As the brief foresaw: moving the four-part test out took this
  section's share away, but the new render-time `if` (React's approved shape for the `openNew` fix) adds a little
  back, and chat 205's additions to the same function are not this step's to touch. It goes when chat 205 fixes its
  share, or needs a further split of the component later — not done here, by the brief's limits.
- The 55 findings in `msq-guard-testkit.tsx` were not in this brief's scope.

Open items: the complexity finding on `UsersPanel` (above); none else.
