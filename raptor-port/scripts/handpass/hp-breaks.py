"""[HIST-PHONE-HIDE] + [CHG-BY-ITEM] — the break tests (bug-check order §8.4): each wire this build added is broken ONCE on
purpose, the named test must go red, and the file is put back byte for byte. Run from raptor-port/ in a clean tree:
  python scripts/handpass/hp-breaks.py            (the unit breaks)
  python scripts/handpass/hp-breaks.py e2e        (the painted ones — a real browser; E2E_PORT from the environment)
A break whose test stays GREEN is a surface with no test, by proof: the script says so and exits 1."""
import subprocess, sys, os

UNIT = [
    ('B1 the edit week runs the dot pass', 'src/ui/EditWeek.tsx', '    refreshHistDots(root)\n', '',
     'src/ui/histbubble.test.tsx', 'none while the window is shut'),
    ('B2 the board runs the dot pass', 'src/ui/SchedBoard.tsx', '    refreshHistDots(wrapRef.current)\n', '',
     'src/ui/histbubble.test.tsx', 'none while the window is shut'),
    ('B3 an input row\'s story (iu:)', 'src/ui/histbubble.ts', "  if (key.startsWith('iu:')) {", "  if (key.startsWith('iu:NEVER')) {",
     'src/ui/histbubble.test.tsx', "an input's own row answers"),
    ('B4 a look answers nothing (cellOf)', 'src/ui/histbubble.ts', '  return c && !c.closest(LOOK) ? c : null', '  return c',
     'src/ui/histbubble.test.tsx', 'never tells the live story'),
    ('B5 the wave-title box is a cell', 'src/ui/histbubble.ts', "[data-inprow],[data-wsel]'", "[data-inprow]'",
     'src/ui/histbubble.test.tsx', "the board's wave title"),
    ('B6 the dot pass skips a look', 'src/ui/histbubble.ts', "    const k = el.closest(LOOK) ? '' : keyOf(el)", "    const k = keyOf(el)",
     'src/ui/histbubble.test.tsx', 'a version look wears none'),
    ('B7 Hide is not the grip', 'src/ui/ChangesWindow.tsx', "    closeSel: '.win-x, .win-hide',", "    closeSel: '.win-x',",
     'src/ui/histbubble.test.tsx', 'pressing Hide never starts a drag'),
    ('B8 the hint shows where a tap raises a bubble', 'src/ui/ChangesWindow.tsx', '{HOOKS.isPhone() && histHere ?', '{false && histHere ?',
     'src/ui/histbubble.test.tsx', 'and the hint in his words'),
    ('B9 every group open by default', 'src/ui/ChangesWindow.tsx', "  const isOpen = (key: string) => CHGFOLD.has(key) ? !!CHGFOLD.get(key) : true",
     "  const isOpen = (key: string) => CHGFOLD.has(key) ? !!CHGFOLD.get(key) : false",
     'src/ui/histbubble.test.tsx', 'the buttons read Item, then Who'),
    ('B10 a posting keeps its man', 'src/state/changelines.ts', "({ date: d, sect: 'abs', sub: pid, fld: 'posting', ...extra })", "({ date: d, sect: 'quals', ...extra })",
     'src/leavewar/changelines-lw.test.ts', 'each posting line keeps whose it is'),
    ('B11 a roster add keeps its man', 'src/state/changelines.ts', "{ ...at, sub: pid, fld: 'roster' }", "at",
     'src/state/changelines.test.ts', 'a man added to the roster'),
    ('B12 a move within one item is one entry', 'src/ui/changesmodel.ts', "    if (iOn.id === iOff.id) return", "    if (false) return",
     'src/ui/changesmodel.test.ts', 'a move WITHIN one item is ONE entry'),
]
E2E = [
    ('B13 the seat dot is painted', 'src/ui/scheduler.css', ".seat[data-histdot]:not(.tdghost):not(.dragimg)::before,", ".seat[data-nothing]::before,",
     'e2e/changeswin.spec.ts', 'every changed detail wears a gold dot'),
    ('B14 a text detail\'s dot is painted outside', 'src/ui/scheduler.css', ":is(span,b,i)[data-histdot]:not(.seat):not(:empty)::before{", ":is(span,b,i)[data-nothing]::before{",
     'e2e/changeswin.spec.ts', 'every changed detail wears a gold dot'),
    ('B15 the hidden bar sits over the ALL AVAIL window', 'src/ui/scheduler.css', "  .chgwin.bar,.chgwin.bar.front{z-index:412}", "  .chgwin.bar,.chgwin.bar.front{}",
     'e2e/changeswin.spec.ts', 'the hidden bar stays reachable'),
]

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, r.stdout + r.stderr

def one(label, path, old, new, test, name, e2e=False):
    src = open(path, encoding='utf-8', newline='').read()
    if src.count(old) != 1:
        return f'SETUP {label}: the wire was not found exactly once in {path}'
    open(path, 'w', encoding='utf-8', newline='').write(src.replace(old, new))
    try:
        if e2e:
            port = os.environ.get('E2E_PORT', '4214')
            code, out = run(f'set E2E_PORT={port}&& npx playwright test --project=raptor {test} --reporter=line -g "{name}"' if os.name == 'nt' else f'E2E_PORT={port} npx playwright test --project=raptor {test} --reporter=line -g "{name}"')
        else:
            code, out = run(f'npx vitest run {test} -t "{name}"')
    finally:
        open(path, 'w', encoding='utf-8', newline='').write(src)
    ran = ' passed' in out or ' failed' in out
    red = code != 0 and (' failed' in out)
    if not ran:
        return f'SETUP {label}: the test name matched no test'
    return f"{'RED  ' if red else 'GREEN'} {label} -> {test} \"{name}\"" + ('' if red else '  <-- NO TEST CATCHES THIS WIRE')

rows = [one(*b, e2e=True) for b in E2E] if (len(sys.argv) > 1 and sys.argv[1] == 'e2e') else [one(*b) for b in UNIT]
print('\n'.join(rows))
sys.exit(0 if all(r.startswith('RED') for r in rows) else 1)
