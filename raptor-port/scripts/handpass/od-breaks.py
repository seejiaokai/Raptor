"""The break tests (bug-check order section 8.4) for [ONE-DOOR] (D305, D308, D309, D310, D320-D323, 27 Sep 26): each new
wire broken once, its tests run, the red tests named, the wire restored with `git checkout`. Run it in a SCRATCH worktree
of the branch, never the working one:
    git worktree add --detach <scratch> HEAD      (then link raptor-port/node_modules to the real one)
    PYTHONIOENCODING=utf-8 python od-breaks.py <scratch>/raptor-port [B1 B2 ...]
Results: the evidence sheet docs/handpass/2026-09-27-one-door.md (the break tests). Shape copied from ms/ms-breaks.py."""
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


S = ['src/leavewar/onedoor.test.ts', 'src/leavewar/stints.test.ts']
U = ['src/ui/onedoor-users.test.tsx', 'src/ui/welcomeback.test.tsx']
SH = ['src/leavewar/ui/onedoor-sheets.test.tsx']
PO = ['src/leavewar/ui/po.test.tsx', 'src/leavewar/postout-outcomes.test.ts']
PM = ['src/state/perms.test.ts', 'src/state/perms-scan.test.ts']
AC = ['src/ui/accounts-ui.test.tsx']
SY = 'src/leavewar/sync.ts'
ST = 'src/leavewar/state/store.ts'
PE = 'src/leavewar/engine/people.ts'
MX = 'src/leavewar/ui/Matrix.tsx'
BP = 'src/leavewar/ui/BidPicker.tsx'
OC = 'src/leavewar/ui/OutcomeChips.tsx'
UP = 'src/ui/UsersPanel.tsx'
WB = 'src/ui/WelcomeBack.tsx'
AP = 'src/ui/App.tsx'
QP = 'src/ui/QualsPage.tsx'
AD = 'src/ui/AdminPage.tsx'
ACS = 'src/state/accounts.ts'
PMS = 'src/state/perms.ts'
RA = 'src/state/roster-add.ts'
BREAKS = [
  ('B1 D310 Archive leaves his sign-in on', SY, "if (suspendForArchive(id) === 'lock') throw", "if (false) throw", S + U),
  ('B2 F1 Archive is not marked an admin\'s', SY, "      body.archivedBy = 'admin'", "      body.archivedBy = 'po' as any", S + SH),
  ('B3 D323 Archive closes no stint', SY, "replaced = closeStintOnArchive(id, today, keepHidden).replaced", "replaced = null", S + U),
  ('B4 D322 Restore leaves his sign-in off', SY, "        enableForRestore(id)\n", "", S + U),
  ('B5 D305 Restore sets no welcome note', SY, "        body.back = true\n", "", S + U),
  ('B6 D320 Restore opens no stint', SY, "if (!openStint(id, postIn, identity)) throw", "if (false) throw", S + U),
  ('B7 D320 the war forgets past stints (inSquadron)', PE, "  return !!p.past && p.past.some(s => inWindow(s.from, s.to, date))", "  return false", S),
  ('B8 D320 a gap day opens no Post in sheet', PE, "  if (gapBeforeCurrent(p, date)) return 'pi'", "  if (false) return 'pi'", S + SH),
  ('B9 D320 the grid draws no row for a past stint', MX, "  const inPast = !!p.past && p.past.some(", "  const inPast = false && p.past.some(", S + SH + PO),
  ('B10 F1 the grid mounts the Post out sheet unlocked', MX,
   "the war never reads Raptor's people) */\n          lockedWhy={postingLocked(open.id)}", "the war never reads Raptor's people) */\n          lockedWhy={null}", SH),
  ('B11 4.2 the grid mounts the Post in sheet unlocked', MX,
   "read only, as the Post out sheet */\n          lockedWhy={postingLocked(open.id)}", "read only, as the Post out sheet */\n          lockedWhy={null}", SH),
  ('B12 4.2 the Post in sheet offers Undo while locked', BP, "{!backFrom && !locked && <button", "{!backFrom && <button", SH),
  ('B13 4.3 setPostIn ignores the lock', ST, "  if (postingLocked(id)) return false             //", "  if (false) return false             //", S + SH),
  ('B14 4.3 the sync installs no lock', SY, "  setPostingLockLookup(adminArchived)\n", "", S),
  ('B15 4.3 postingProblem says nothing of the lock', ST, "  if (kind !== 'restore') { const locked = postingLocked(id); if (locked) return locked }\n", "", S),
  ('B16 4.4 a hidden man\'s stored dates are not laid on', ST, "  return w ? { ...identity, ...windowFor(w, state.showSans) } : identity", "  return identity", S),
  ('B17 4.5 a never-arrived delete keeps a backwards stint', ST, "      if (!past.length) return null\n", "", S),
  ('B18 4.1 no "posting in" tag', SY, "  if (w && !w.gone && w.from && w.from > effectiveToday()) return `posting in ${dayMon(w.from)}`\n", "", S),
  ('B19 4.7 the message names a sign-in he does not have', SY, "(accountOfPid(id) ? ' — his sign-in is suspended' : '')", "' — his sign-in is suspended'", S),
  ('B20 D309 the Roster dot never goes red', UP, "<Dot kind={p.archived ? 'off' : 'on'}", "<Dot kind={'on'}", U),
  ('B21 D310 Archive on the row does nothing', UP, 'id="accEdArchive" onClick={archive}', 'id="accEdArchive" onClick={() => {}}', U),
  ('B22 D308 Restore asks no post-in date', UP, "(restoreArchivedPerson(p.pid, postIn) ? null", "(restoreArchivedPerson(p.pid) ? null", U),
  ('B23 R7 the Archived group cannot fold during a search', UP, "onClick={() => setArchOpen(!archOpenNow)}", "onClick={() => setArchOpen(true)}", U),
  ('B24 R13 the rail says "Who can sign in" again', AD, "sub: 'Sign-in and roster'", "sub: 'Who can sign in'", U),
  ('B25 D305 the welcome note ignores `back`', WB, "if (!p || !p.back || p.archived || p.deleted) return null", "if (!p || p.archived || p.deleted) return null", U),
  ('B26 F8 a lapsed session carries on', AP, "    if (!sessionLapsed()) return", "    if (true) return", U + AC),
  ('B27 D305 Check my quals outlines nothing', QP, "    if (!QUALSFOCUS) return", "    if (true) return", U),
  ('B28 D322 Enable on an archived man goes through', ACS, "if (p && p.archived && !p.deleted) return", "if (false) return", S + AC),
  ('B29 perms: Archive no longer names the war\'s record', PMS,
   "'person.archive': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U']]),",
   "'person.archive': op(T.person, 'U', 'never', [[T.user, 'U']]),", PM + S),
  ('B30 D308 a new person\'s post-in never reaches the war', RA, "    if (postIn !== undefined) HOOKS.warPostIn(txn, id, postIn)", "    void 0", S),
  ('B31 D310 the posting line says "archived on Quals" again', OC, "return `On ${day}: archived${hasAccount", "return `On ${day}: archived on Quals${hasAccount", PO),
  # after the walk's pictures (27 Sep 26)
  ('B32 W1 a locked man's bid sheet offers Post out again', MX,
   "onPostOut={role === 'admin' && !openPerson?.gone && !postingLocked(open.id)", "onPostOut={role === 'admin' && !openPerson?.gone", SH),
]

only = sys.argv[2:]
out = []
for name, path, old, new, tests in BREAKS:
    if only and not any(name.startswith(o + ' ') for o in only): continue
    edit(path, old, new)
    try:
        r = subprocess.run('npx vitest run ' + ' '.join(sorted(set(tests))) + ' --reporter=verbose', shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=900)
        txt = r.stdout + r.stderr
        red = sorted(set(m.strip() for m in re.findall(r'^\s*[×✗]\s+(.+?)(?:\s+\d+ms)?$', txt, re.M)))
        summ = [l.strip() for l in txt.splitlines() if re.search(r'^\s*Tests\s+', l)]
        out.append({'break': name, 'summary': summ[-1] if summ else '(no summary)', 'red': red})
        print(json.dumps(out[-1], ensure_ascii=False), flush=True)
    finally:
        subprocess.run(['git', 'checkout', '--', path], check=True)
print('DONE', len(out))
