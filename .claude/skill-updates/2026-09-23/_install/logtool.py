"""Bounded, verified mutations of the task-observer log (the skill's Log-write safety sequence).

  status  LOG STATUS_JSON        set **Status:** of the named OPEN entries (line-anchored, one per entry)
  append  LOG ENTRIES_MD [START] append new entries at EOF (numbering checked; START may skip past
                                 numbers known to exist on another branch)
  archive LOG ARCHIVE_MD         move every ACTIONED/DECLINED entry to ARCHIVE_MD (owner D69: the same
                                 day); the active log keeps its header and each OPEN entry under its
                                 date heading; loose checkpoint markers move to the archive's end

Safety: a backup before every write; the snapshot is re-read and compared with the live file
immediately before write-back (abort on drift); header accounting is checked against the live
pre-write file; every target is verified after the write. Line endings are preserved (newline='').
"""
import json, os, re, shutil, sys, tempfile, time

HDR = re.compile(r'(?m)^### Observation (\d+):')
STATUS_OPEN = re.compile(r'(?m)^\*\*Status:\*\* OPEN[ \t]*$')
SPLIT = r'(?m)^(?=### Observation \d+:)'
# backups go OUTSIDE the repo (a temp dir), never beside this script
BACKUPS = os.environ.get('LOGTOOL_BACKUPS') or tempfile.gettempdir()
NL = '\n'


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def write(p, s):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def backup(p):
    dst = os.path.join(BACKUPS, 'log.backup-%s.md' % time.strftime('%Y%m%d-%H%M%S'))
    shutil.copy2(p, dst)
    return dst


def headers(s):
    return [int(m.group(1)) for m in HDR.finditer(s)]


def set_status(log, mapping):
    snap = read(log)
    pre = headers(snap)
    parts = re.split(SPLIT, snap)
    done = set()
    for i, chunk in enumerate(parts):
        m = HDR.match(chunk)
        if not m or int(m.group(1)) not in mapping:
            continue
        n = int(m.group(1))
        hits = STATUS_OPEN.findall(chunk)
        if len(hits) != 1:
            sys.exit('ABORT #%d: expected exactly one "**Status:** OPEN" line, found %d' % (n, len(hits)))
        new = '**Status:** ' + mapping[n]
        if NL in new or '\r' in new:
            sys.exit('ABORT #%d: the new status spans lines' % n)
        parts[i] = STATUS_OPEN.sub(lambda _m: new, chunk, count=1)
        done.add(n)
    missing = set(mapping) - done
    if missing:
        sys.exit('ABORT: no such OPEN entries: %s' % sorted(missing))
    out = ''.join(parts)
    a, b = snap.split(NL), out.split(NL)
    if len(a) != len(b):
        sys.exit('ABORT: line count changed %d -> %d' % (len(a), len(b)))
    diff = [(x, y) for x, y in zip(a, b) if x != y]
    if len(diff) != len(mapping) or any(not y.startswith('**Status:** ') for _, y in diff):
        sys.exit('ABORT: unexpected diff shape (%d changed lines)' % len(diff))
    live = read(log)
    if live != snap:
        sys.exit('ABORT: the log changed since the snapshot - re-run on the fresh file')
    bk = backup(log)
    write(log, out)
    post = read(log)
    if headers(post) != pre:
        write(log, live)
        sys.exit('ABORT: header list changed after write - restored the live copy')
    chunks = re.split(SPLIT, post)
    for n, st in mapping.items():
        mine = [c for c in chunks if re.match(r'### Observation %d:' % n, c)]
        if len(mine) != 1 or ('**Status:** ' + st) not in mine[0]:
            sys.exit('VERIFY FAILED on #%d (backup at %s)' % (n, bk))
    print('OK: %d statuses set; %d headers before and after; backup %s' % (len(mapping), len(pre), bk))


def append(log, entries_path, start=None):
    snap = read(log)
    pre = headers(snap)
    new_txt = read(entries_path)
    new_nums = headers(new_txt)
    if not new_nums:
        sys.exit('ABORT: no entries in %s' % entries_path)
    top = max(pre)
    first = top + 1 if start is None else start
    if first <= top:
        sys.exit('ABORT: start %d is not past the highest number %d' % (first, top))
    if new_nums != list(range(first, first + len(new_nums))):
        sys.exit('ABORT: new entries must be numbered %d.. in order, got %s' % (first, new_nums))
    for n in new_nums:
        if re.search(r'(?m)^### Observation %d:' % n, snap):
            sys.exit('COLLISION on #%d' % n)
    for c in re.split(SPLIT, new_txt):
        if HDR.match(c) and not re.search(r'(?m)^\*\*Status:\*\* OPEN\s*$', c):
            sys.exit('ABORT: a new entry lacks **Status:** OPEN')
    sep = '' if snap.endswith(NL * 2) else (NL if snap.endswith(NL) else NL * 2)
    out = snap + sep + new_txt.lstrip(NL)
    if not out.endswith(NL):
        out += NL
    live = read(log)
    if live != snap:
        sys.exit('ABORT: the log changed since the snapshot - re-run')
    bk = backup(log)
    write(log, out)
    got = headers(read(log))
    if got != pre + new_nums:
        write(log, live)
        sys.exit('ABORT: header list wrong after append - restored')
    print('OK: appended %s; headers %d -> %d; backup %s' % (new_nums, len(pre), len(got), bk))


def split_trailer(e):
    """Separate an entry from the trailing lines that belong to the log's structure
    (a '## date' heading, a '---' rule, a loose checkpoint marker), not to the entry."""
    lines = e.split(NL)
    cut = len(lines)
    for i in range(len(lines) - 1, 0, -1):
        s = lines[i].strip()
        if s == '':
            continue
        if (s.startswith('## ') or s == '---' or s.startswith('*Checkpoint')
                or s.startswith('<!-- checkpoint') or s.startswith('Checkpoint (')):
            cut = i
            continue
        break
    return NL.join(lines[:cut]), NL.join(lines[cut:])


def archive(log, archive_path):
    snap = read(log)
    pre = headers(snap)
    parts = re.split(SPLIT, snap)
    head_text, entries = parts[0], parts[1:]
    m = re.search(r'(?m)^---[ \t]*$', head_text)
    if not m:
        sys.exit('ABORT: no --- rule closing the log header')
    true_head = head_text[:m.end()] + NL * 2
    dates = [l.strip() for l in head_text[m.end():].split(NL) if l.strip().startswith('## ')]
    cur_date = dates[-1] if dates else None
    kept, moved, marks = [], [], []
    for e in entries:
        body, tail = split_trailer(e)
        sm = re.search(r'(?m)^\*\*Status:\*\*\s*(\S+)', body)
        word = sm.group(1) if sm else 'OPEN'
        if word.startswith('ACTIONED') or word.startswith('DECLINED'):
            moved.append(body)
        else:
            kept.append((cur_date, body))
        for line in tail.split(NL):
            t = line.strip()
            if t.startswith('## '):
                cur_date = t
            elif t and t != '---':
                marks.append(line.rstrip())
    if not moved:
        print('nothing to archive')
        return
    out, last = true_head, None
    for d, body in kept:
        if d and d != last:
            out += d + NL * 2
            last = d
        out += body.rstrip(NL) + NL * 2
    out = out.rstrip(NL) + NL
    moved_nums = headers(''.join(moved))
    arch_old = read(archive_path) if os.path.exists(archive_path) else true_head
    arch = arch_old.rstrip(NL) + NL * 2 + ''.join(b.rstrip(NL) + NL * 2 for b in moved)
    if marks:
        arch += '## Checkpoint markers moved from the active log' + NL * 2 + (NL * 2).join(marks) + NL
    arch = arch.rstrip(NL) + NL
    live = read(log)
    if live != snap:
        sys.exit('ABORT: the log changed since the snapshot - re-run')
    bk = backup(log)
    write(archive_path, arch)
    write(log, out)
    post = headers(read(log))
    if len(post) != len(pre) - len(moved_nums) or sorted(post + moved_nums) != sorted(pre):
        write(log, live)
        sys.exit('ABORT: header accounting failed after archive - log restored (backup %s)' % bk)
    if not set(moved_nums) <= set(headers(read(archive_path))):
        write(log, live)
        sys.exit('ABORT: the archive is missing moved entries - log restored')
    print('OK: archived %d entries (+%d checkpoint markers) -> %s; active log %d -> %d headers; backup %s'
          % (len(moved_nums), len(marks), archive_path, len(pre), len(post), bk))


if __name__ == '__main__':
    cmd, log = sys.argv[1], sys.argv[2]
    if cmd == 'status':
        m = json.load(open(sys.argv[3], encoding='utf-8'))
        set_status(log, {int(k): v for k, v in m.items()})
    elif cmd == 'append':
        append(log, sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else None)
    elif cmd == 'archive':
        archive(log, sys.argv[3])
    else:
        sys.exit('usage: logtool.py status|append|archive LOG FILE [START]')
