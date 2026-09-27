"""The break tests (bug-check order section 8.4) for the absence-record re-test (26 Sep 26): each wire broken once, its
tests run, the red tests named, the wire restored with `git checkout`. Run it in a SCRATCH worktree of the branch,
never the working one (a reviewer reading the code must never see a broken wire):
    git worktree add --detach ../abs-break-scratch HEAD      (then link raptor-port/node_modules to the real one)
    PYTHONIOENCODING=utf-8 python ab-breaks.py <scratch>/raptor-port [B1a B2 ...]
The seventh wire (B7) turned nothing red; src/leavewar/ui/repaint.test.tsx was written for it. Results: the evidence
sheet docs/handpass/2026-09-26-absence.md section 6."""
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

BREAKS = [
  ('B1a the absence door — filing over a bid no longer replaces it', 'src/leavewar/inputgate.ts',
   'function replaceBids(changed: any[]): string[] {', 'function replaceBids(changed: any[]): string[] {\n  return []',
   ['src/leavewar/inputgate.test.ts', 'src/leavewar/scenarios-doors.test.ts']),
  ('B1b the absence door — the clash refusals switched off', 'src/leavewar/inputgate.ts',
   'function vet(persons: ReadonlySet<string>, changedIds: ReadonlySet<string>, withWork: boolean): string[] {',
   'function vet(persons: ReadonlySet<string>, changedIds: ReadonlySet<string>, withWork: boolean): string[] {\n  return []',
   ['src/leavewar/inputgate.test.ts', 'src/leavewar/scenarios-doors.test.ts']),
  ('B2 the merged read — the ladder switched off', 'src/leavewar/engine/dayview.ts',
   'export function compareContrib(a: Contrib, b: Contrib): number {', 'export function compareContrib(a: Contrib, b: Contrib): number {\n  return 0',
   ['src/leavewar/engine/dayview.test.ts']),
  ('B3 the tap list — its first record dropped', 'src/leavewar/ui/DayList.tsx',
   'const lines = view.all.map(c => {', 'const lines = view.all.slice(1).map(c => {',
   ['src/leavewar/ui/daylist.test.tsx']),
  ('B4 the bid sheet — no refusal past the stage / row / medical checks', 'src/leavewar/state/store.ts',
   "  if (!clean) return null\n  const list = listAt(personId, date)", "  if (!clean) return null\n  return null\n  const list = listAt(personId, date)",
   ['src/leavewar/state/store.test.ts', 'src/leavewar/ui/freehalf.test.tsx', 'src/leavewar/inputgate.test.ts']),
  ("B5 the calendar drag — a member may move another man's input", 'src/ui/caldrag.ts',
   'if (!canEditSched() && !isMe(r.person)) {', 'if (false && !canEditSched() && !isMe(r.person)) {',
   ['src/ui/caldrag.test.tsx', 'src/ui/inputscal.test.tsx', 'src/ui/memberinput.test.tsx']),
  ('B6 the issued face — reads the live inputs, not the ones it went out with', 'src/engine/inputs.ts',
   '  if(FZ){const k=dateOrd(dt); const f=k!=null?FZ.get(k):undefined; if(f)return f;}\n  return INPUTS.filter(',
   '  return INPUTS.filter(',
   ['src/ui/latepub.test.tsx']),
  ('B7 the war repaint on an Inputs change — switched off', 'src/leavewar/sync.ts',
   '  if (!cmdDeferEffect(() => { if (getVersion() === at) absencesChanged() })) absencesChanged()',
   '  void at',
   ['src/leavewar/sync.test.ts', 'src/leavewar/inputgate.test.ts', 'src/leavewar/scenarios-doors.test.ts']),
]

only = sys.argv[2:]
out = []
for name, path, old, new, tests in BREAKS:
    if only and not any(name.startswith(o) for o in only): continue
    edit(path, old, new)
    try:
        r = subprocess.run('npx vitest run ' + ' '.join(tests) + ' --reporter=verbose', shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=600)
        txt = r.stdout + r.stderr
        red = sorted(set(m.strip() for m in re.findall(r'^\s*[×✗]\s+(.+?)(?:\s+\d+ms)?$', txt, re.M)))
        summ = [l.strip() for l in txt.splitlines() if re.search(r'^\s*Tests\s+', l)]
        out.append({'break': name, 'tests': tests, 'summary': summ[-1] if summ else '(no summary)', 'red': red})
    finally:
        subprocess.run(['git', 'checkout', '--', path], check=True)
    print(json.dumps(out[-1], ensure_ascii=False), flush=True)
st = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True).stdout.strip()
print('scratch clean after:', repr(st))
