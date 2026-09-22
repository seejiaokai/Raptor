"""Group 1 rider (Fable finding 6): correct raptor-port/CLAUDE.md §Token discipline.

The always-loaded rule said "pipe logs through tail/grep" — the exact habit that hid two
failed specs (observation #44): a pipe reports tail's exit code, not the check's. The new
wording sends a long run to a file and greps the FILE. The paragraph is re-wrapped into the
SAME 11 lines, so the docsize ceiling does not move and no code file changes.

  python claude_md_token_discipline.py [--dry-run]    (run from the repo root)

Refuses to touch the file unless the old paragraph is present exactly once, verbatim.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = 'raptor-port/CLAUDE.md'

spec = json.load(open(os.path.join(HERE, 'claude_md_token_discipline.json'), encoding='utf-8'))
old, new = spec['old'], spec['new']
if len(old) != len(new):
    sys.exit('ABORT: the replacement must keep the line count (%d vs %d)' % (len(old), len(new)))

text = open(TARGET, encoding='utf-8', newline='').read()
nl = '\r\n' if '\r\n' in text else '\n'
old_block, new_block = nl.join(old), nl.join(new)
count = text.count(old_block)
if count != 1:
    sys.exit('ABORT: the old paragraph occurs %d times (expected exactly 1) - the file has changed; apply by hand' % count)

out = text.replace(old_block, new_block)
if out.count(nl) != text.count(nl):
    sys.exit('ABORT: line count changed')
if '--dry-run' in sys.argv:
    print('DRY RUN OK: one paragraph would change; line count stays %d' % text.count(nl))
else:
    open(TARGET, 'w', encoding='utf-8', newline='').write(out)
    print('OK: %s §Token discipline corrected; line count unchanged (%d)' % (TARGET, out.count(nl)))
