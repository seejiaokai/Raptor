"""The break tests (bug-check order section 8.4) for D260-D262 (27 Sep 26): each new wire broken once, its tests run,
the red tests named, the wire restored with `git checkout`. Run it in a SCRATCH worktree of the branch, never the
working one:
    git worktree add --detach <scratch> HEAD      (then link raptor-port/node_modules to the real one)
    PYTHONIOENCODING=utf-8 python mv-breaks.py <scratch>/raptor-port [W1 W2 ...]
Results: the evidence sheet docs/handpass/2026-09-27-d260-d262.md section 6."""
import os, subprocess, re, json, sys
W = sys.argv[1]
os.chdir(W)

def edit(path, old, new):
    b = open(path, 'rb').read()
    crlf = b'\r\n' in b
    t = b.replace(b'\r\n', b'\n').decode('utf-8')
    assert t.count(old) == 1, (path, old[:80], t.count(old))
    t = t.replace(old, new, 1)
    open(path, 'wb').write((t.replace('\n', '\r\n') if crlf else t).encode('utf-8'))

AW = ['src/leavewar/ui/awardclear.test.tsx', 'src/leavewar/inputgate.test.ts', 'src/leavewar/ui/selectsheet.test.tsx']
OWN = ['src/leavewar/ui/ownaward.test.tsx']
MV = ['src/leavewar/ui/moveone.test.tsx', 'src/leavewar/ui/movewire.test.ts', 'src/leavewar/ui/deciding.test.tsx']
BREAKS = [
  ('W1 D260 the store names no award (awardsIn empty)', 'src/leavewar/state/store.ts',
   "export function awardsIn(cells: readonly { personId: string; date: string }[]): Array<{ personId: string; date: string; code: 'FO' | 'HO'; days: number }> {\n",
   "export function awardsIn(cells: readonly { personId: string; date: string }[]): Array<{ personId: string; date: string; code: 'FO' | 'HO'; days: number }> {\n  if (cells) return []\n", AW),
  ('W2 D260 the Delete confirm drops its award clause', 'src/leavewar/ui/SelectSheet.tsx',
   "const incl = awards.length ? `, including ${awardsClause(awards, people)}` : ''", "const incl = '' as string", AW),
  ('W3 D260 the Clear never asks', 'src/leavewar/ui/BidPicker.tsx',
   'if (awards.length && !clearAsked) {', 'if (false && awards.length && !clearAsked) {', AW),
  ('W4 D260 Delete leaves the award beside leave', 'src/leavewar/state/store.ts',
   'const reqs = clearRequestsAt(c.personId, c.date, true)', 'const reqs = clearRequestsAt(c.personId, c.date, false)', AW),
  ('W5 D260 a block of awards alone offers no Delete', 'src/leavewar/ui/SelectSheet.tsx',
   '{(hasBids || awards.length > 0) && (', '{hasBids && (', AW),
  ('W6 S18 a published leave that stays is not counted', 'src/leavewar/state/store.ts',
   'if (!reqs || m.lw) skipped++', 'if (!reqs) skipped++', AW),
  ('W7 D261 his own award is not tappable', 'src/leavewar/ui/Matrix.tsx',
   '    ownAwardOnly(view, viewer, personId) ||', '    false ||', OWN),
  ('W8 D261 the read-only award sheet never mounts', 'src/leavewar/ui/Matrix.tsx',
   '{open && !listOpen && !canRemark && openCredit && ownAwardOnly(openView, viewer, open.id)',
   '{false && open && !listOpen && !canRemark && openCredit && ownAwardOnly(openView, viewer, open.id)', OWN),
  ("W9 D262 the sheet's Move picks nothing up", 'src/leavewar/ui/Matrix.tsx',
   '            setMoveSel({ people: [open.id], from: open.date, to: open.date, cells })',
   '            void cells', MV),
  ('W10 D262 no hover edge scroll', 'src/leavewar/ui/select.ts',
   'if (inBand && bandsLive && !hoverRaf) hoverRaf = requestAnimationFrame(edgeStep)', 'void edgeStep', MV),
  ('W11 D262 a press-and-drag lands nothing', 'src/leavewar/ui/select.ts',
   'onSelect: d => { dragPickedAt = Date.now(); opts.onPick(d) },', 'onSelect: () => { dragPickedAt = Date.now() },', MV),
  ('W12 D262 an empty tap outside the grid does not cancel', 'src/leavewar/ui/select.ts',
   'if (t && opts.isGrid && !opts.isGrid(t) && !t.closest(NOT_EMPTY)) opts.onCancel()', 'void t', MV),
  ('W13 D262 no double-click guard', 'src/leavewar/ui/select.ts',
   'if (Date.now() - began < MOVE_SETTLE || Date.now() - dragPickedAt < DRAG_TAIL) {', 'if (Date.now() - dragPickedAt < DRAG_TAIL) {', MV),
  ('W14 D262 a long press cancels', 'src/leavewar/ui/select.ts',
   "if (lastPointer === 'mouse') opts.onCancel()", 'opts.onCancel()', MV),
  ('W15 D262 leaving the war keeps the move', 'src/leavewar/ui/Matrix.tsx',
   '    if (isLwOnScreen()) return\n    setMoveSel(null)', '    return\n    setMoveSel(null)', MV),
  ("W16 D262 its own day reads \"Nothing to move\"", 'src/leavewar/ui/Matrix.tsx',
   '    if (onItsOwnDay(targetDate)) { if (w) clearLanding(w); setMovePreview(null); setMoveErr(ownDayWords()); return }\n', '', MV),
  ('W17 D262 a band the mouse starts in scrolls at once', 'src/leavewar/ui/select.ts',
   'if (!seen) { seen = true; bandsLive = !inBand }', 'if (!seen) { seen = true; bandsLive = true }', MV),
  ('W18 D262 the whole page counts as the grid', 'src/leavewar/ui/Matrix.tsx',
   '!!cardRef.current?.contains(t) ||', 'true ||', MV),
  ("W19 D262 a popup's shade cancels", 'src/leavewar/ui/select.ts',
   ", .bidsheet, .mv-banner, [data-testid$=\"scrim\"]'", ", .bidsheet'", MV),
]

only = sys.argv[2:]
out = []
for name, path, old, new, tests in BREAKS:
    if only and not any(name.startswith(o + ' ') for o in only): continue
    edit(path, old, new)
    try:
        r = subprocess.run('npx vitest run ' + ' '.join(tests) + ' --reporter=verbose', shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=900)
        txt = r.stdout + r.stderr
        red = sorted(set(m.strip() for m in re.findall(r'^\s*[×✗]\s+(.+?)(?:\s+\d+ms)?$', txt, re.M)))
        summ = [l.strip() for l in txt.splitlines() if re.search(r'^\s*Tests\s+', l)]
        out.append({'break': name, 'summary': summ[-1] if summ else '(no summary)', 'red': red})
        print(json.dumps(out[-1], ensure_ascii=False), flush=True)
    finally:
        subprocess.run(['git', 'checkout', '--', path], check=True)
print('DONE', len(out))
