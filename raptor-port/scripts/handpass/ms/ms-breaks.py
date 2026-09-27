"""The break tests (bug-check order section 8.4) for [LW-MOVE-STANDARD] (D264-D266, D330-D335, 27 Sep 26): each new wire
broken once, its tests run, the red tests named, the wire restored with `git checkout`. Run it in a SCRATCH worktree of
the branch, never the working one:
    git worktree add --detach <scratch> HEAD      (then link raptor-port/node_modules to the real one)
    PYTHONIOENCODING=utf-8 python ms-breaks.py <scratch>/raptor-port [B1 B2 ...]
Results: the evidence sheet docs/handpass/2026-09-27-lw-move-standard.md (the break tests)."""
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


S = ['src/leavewar/movestandard.test.ts']
U = ['src/leavewar/ui/movestandard.test.tsx', 'src/leavewar/ui/movestandard-synced.test.tsx']
OLD = ['src/leavewar/ui/moveone.test.tsx', 'src/leavewar/ui/deciding.test.tsx', 'src/leavewar/ui/daylist.test.tsx',
       'src/leavewar/ui/selectsheet.test.tsx', 'src/leavewar/ui/awardclear.test.tsx', 'src/leavewar/ui/rangeclear.test.tsx']
ST = 'src/leavewar/state/store.ts'
BP = 'src/leavewar/ui/BidPicker.tsx'
SS = 'src/leavewar/ui/SelectSheet.tsx'
DL = 'src/leavewar/ui/DayList.tsx'
MX = 'src/leavewar/ui/Matrix.tsx'
SA = 'src/leavewar/ui/SheetActions.tsx'
BREAKS = [
  ('B1 D265 a move reads the day\'s TOP record again', ST,
   "if (r.kind === 'request' && requestMovable(personId, date, r, list)) out.push",
   "if (r.kind === 'request' && mainAt(personId, date)?.id === r.id && requestMovable(personId, date, r, list)) out.push", S + U),
  ('B2 D265 approved leave is never a record that moves', ST,
   'return !!a && !!a.lw && isLeaveCode(a.code)', 'return false && !!a', S),
  ('B3 S32 a refused bid beside a live one on its half moves too', ST,
   "  if (r.state === 'refused' && liveRequestsOn(list, portionOfCode(r.code)).length) return false\n", '', S),
  ('B4 D331 what stays is never named (the award)', ST,
   "if (r.kind === 'credit' && r.oil === 'manual') out.push({ personId, date, what: 'award' })",
   "if (false) out.push({ personId, date, what: 'award' })", S + U),
  ('B5 D332 Delete is never offered', ST, '    if (own || approved) n++', '    if (false) n++', S + U + OLD),
  ('B6 D266 the list\'s pick is ignored (every record moves)', ST, '  if (!only) return out\n', '  return out\n', S + U),
  ('B7 D331 the Selected row loses its name', BP, '<span className="lab">Selected</span>', '<span className="lab">Actions</span>', U),
  ('B8 D335 Move carries the tapped day, not the range', BP, 'const why = onMove?.(selCells())', 'const why = onMove?.([{ personId, date }])', U),
  ('B9 D335 Decide answers the tapped day, not the range', BP, 'const { decided } = setBidStates(selCells(), bid)',
   'const { decided } = setBidStates([{ personId, date }], bid)', U),
  ('B10 D334 Move loses its teal arrow', SA, '<span className="mvarr" aria-hidden="true">⇄</span>Move', 'Move', U),
  ('B11 D332 Delete is drawn red', SA, 'className="dchip del"', 'className="dchip refuse"', U),
  ('B12 D265 the list\'s bid line has no Move', DL, '      actions.push(...moveBtn(c.id))\n', '', U + OLD),
  ('B13 D266 the list\'s Move carries the whole day', MX,
   'cells: [{ personId: rec.personId, date: rec.date }], only: [rec] })', 'cells: [{ personId: rec.personId, date: rec.date }] })', U),
  ('B14 D331 the block\'s posting button reads "Post out (PO)…" again', SS,
   'onClick={() => setPoOpen(true)}>PO</button>', 'onClick={() => setPoOpen(true)}>Post out (PO)…</button>', U),
  ('B15 D264 the block\'s Move is its old own button', SS,
   '<MoveChip testid="sel-move" onClick={() => { onClose(); onMove(sel) }} />',
   '<button className="dchip" data-testid="sel-move" onClick={() => { onClose(); onMove(sel) }}>Move…</button>', U),
  ('B16 S4 a moved bid\'s line forgets where it came from', DL,
   'const movedFrom = biddingClosed(period.stage) && src?.shiftedFrom ?', 'const movedFrom = false && src?.shiftedFrom ?', U),
  ('B17 D331 the banner never says what stays', MX, "${stayWords(moveStays)}", '', U),
  ('B18 D332 the block offers Delete where it would do nothing', SS, '{canDelete && <DeleteChip', '{true && <DeleteChip', U + OLD),
  ('B19 D335 the one-day Delete ignores the range', BP, "setNoteAt(code ? 'leave' : 'sel')\n    if (!code) {\n      const cells = range ? spanCells(range) : [{ personId, date }]",
   "setNoteAt(code ? 'leave' : 'sel')\n    if (!code) {\n      const cells = [{ personId, date }]", U + OLD),
  # the final reads' fixes (27 Sep 26)
  ('B20 FR1 the preview drops every day of a moving leave again', ST,
   'x.iid === a.id && x.personId === r.personId && x.date === to', 'x.iid === a.id && x.personId === r.personId', S),
  ('B21 FR2 the door counts the moving bids at the preview', ST,
   'DOOR.moveApproved(abs, dayDelta, biddingClosed(state.period.stage), true, skip)', 'DOOR.moveApproved(abs, dayDelta, biddingClosed(state.period.stage), true)', S),
  ('B22 FR3 a refused bid beneath leave on its half moves again', ST,
   '    if (absencesAt(personId, date).some(a => barsWrite(c, a))) return false\n', '', S),
  ('B23 FR3b the door\'s answer at the commit is thrown away', ST,
   '      if (d) { refused = d; throw new MoveRefusedAtCommit(d.reason) }', '      void d', S),
  ('B24 FR4 Decide over a range is drawn from the tapped day only', BP,
   'const canDecideHere = !!decide || (!!range && decidableIn(selCells()) > 0)', 'const canDecideHere = !!decide', U),
  ('B25 FR5 a refused bid staying is not named', ST,
   "what: r.state === 'refused' ? 'refused' : 'bid' })", "what: 'bid' })", S + U),
  ('B26 FR6 a record gone under a move goes unsaid', MX,
   "    setMoveErr('That record changed or is no longer there — nothing to move.')", "    void 0", U),
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
