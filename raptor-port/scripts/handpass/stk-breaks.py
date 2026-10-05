"""The Codex stack check — the BREAK TESTS (bug-check order §8.4), 6 Oct 26.

For each wired surface of the stack: cut that one wire on purpose, run the test file that should notice, and record
whether a NAMED test goes red. If nothing goes red, that surface has no test, by proof. Every break is put back from
git (`git checkout -- <file>`) before the next one; the script refuses to start on a dirty source tree.

  cd raptor-port && python scripts/handpass/stk-breaks.py            # all
  cd raptor-port && python scripts/handpass/stk-breaks.py B3 C2      # some

Each entry: id · the surface · the file · (find, replace) · the vitest file(s) to run.
Results: docs/handpass/parts/stk-breaks.json (id, surface, red tests, verdict)."""
import json, subprocess, sys, os, re

BREAKS = [
  ('A1', 'Discard marks: no button in the amendments box', 'src/ui/ALPanel.tsx', None, ['src/ui/alpanel.test.tsx']),
  ('B1', 'a crew\'s report time reads the In-time / Rally lines (events → resolveReporting)', 'src/engine/events.ts',
   ('  return resolveReporting(w,f,toM,parsed).report;\n}', '  return null;\n}'), ['src/engine/rally-workspan.test.ts']),
  ('B2', 'a timing pair out of order reaches the day\'s warning list', 'src/engine/validate.ts',
   ('    reportingIssuesForDay(DAYS[di]).forEach(', '    ([] as any[]).forEach('), ['src/engine/rally-consumers.test.ts', 'src/ui/rally-feedback.test.tsx']),
  ('B3', 'the "+ In-time / Rally" button fills the Logic words', 'src/ui/interactions.ts',
   ("+ VCONF.reportText\n", "+ 'IN TIME + WX/NOTAMS'\n"), ['src/ui/intimesadd.test.tsx', 'src/ui/rally-feedback.test.tsx']),
  ('B4', 'the week\'s wave header says the previous day', 'src/ui/html.ts',
   ("return night+(r!=null&&r<0?` · ${REPORTING_LABEL} ${stated(r,true)}`:'');", "return night;"), ['src/ui/rally-feedback.test.tsx', 'src/ui/schedule-tab.test.tsx']),
  ('B5', 'the board\'s wave header note', 'src/ui/html.ts',
   ("return `${REPORTING_LABEL} ${t!=null?stated(t,true):'—'} · ${n} ac`;", "return `${n} ac`;"), ['src/ui/rally-feedback.test.tsx', 'src/ui/board.test.tsx']),
  ('C1', 'Insights splits a person\'s bar by Blue / Red', 'src/engine/insights.ts',
   ("...(tracking?{roleMix:mixes[id]}:{})", "...({})"), ['src/engine/insights-mission-mix.test.ts', 'src/ui/insights-mix.test.tsx']),
  ('C2', 'the Blue/Red question after his own edit (week and board)', 'src/ui/mission-role-offer.ts',
   ("if(after&&after.id!==before.id&&!readRole(after.id)) {const field=remarksFor(after);if(field)show(after,true,field)}", "if(false) {}"), ['src/ui/mission-role-offer.test.tsx']),
  ('C3', 'the published board\'s read-only Remarks door', 'src/ui/board.ts',
   ("roleAccess ? `data-role-remarks=", "false ? `data-role-remarks="), ['src/ui/mission-role-interim-fixes.test.tsx', 'src/ui/mission-role-offer.test.tsx']),
  ('C4', 'a saved answer comes back at boot', 'src/state/persist.ts',
   ("  hydrateRoles(wb.keys('settings').filter(k=>k.startsWith('missionrole:'))", "  hydrateRoles([] as any ?? wb.keys('settings').filter(k=>k.startsWith('missionrole:'))"), ['src/state/mission-role-persist.test.ts']),
  ('C5', 'only an admin may answer (the permissions table)', 'src/state/perms.ts',
   ("  'insights.role.set': op(T.missionrole, 'U'),", "  'insights.role.set': op(T.missionrole, 'R'),"), ['src/state/perms.test.ts', 'src/state/mission-roles.test.ts']),
  ('C6', 'the Logic switch "Track Blue/Red sorties"', 'src/ui/LogicPage.tsx',
   ("onChange={e=>{if(lgCanEdit()) setMissionTracking(e.currentTarget.checked)}}", "onChange={()=>{}}"), ['src/ui/logic.test.tsx', 'src/ui/insights-mix.test.tsx']),
  ('C7', 'the Scheduler Board\'s own way into Insights', 'src/ui/SchedBoard.tsx',
   ('<span className="sb-dayctl"><button className="abtn sb-insights" id="sbInsights" onClick={()=>{setInsights(true);notify()}}>', '<span className="sb-dayctl"><button className="abtn sb-insights" id="sbInsights" onClick={()=>{}}>'), ['src/ui/board.test.tsx', 'src/ui/insights-mix.test.tsx', 'src/ui/schedule-insights-menu.test.tsx']),
  ('C8', 'an answer\'s line in the change history', 'src/state/changelines.ts',
   ("logAction(null,`${name} · mission role · ${origin}`", "void (null as any)?.(null,`${name} · mission role · ${origin}`"), ['src/state/mission-roles.test.ts', 'src/ui/mission-role-interim-fixes.test.tsx']),
  ('D1', 'the stylesheet parts are all loaded, in order', 'src/ui/scheduler.css', 'DROP-IMPORT', ['src/ui/scheduler-css.test.ts']),
  ('D2', 'Tab on the schedule takes the route', 'src/ui/textedit.ts',
   ("  if (routeScheduleTab(e, refreshTextDestination)) return\n", "  if (false as boolean && routeScheduleTab(e, refreshTextDestination)) return\n"), ['src/ui/schedule-tab.test.tsx']),
  ('D3', 'the phone ⋯ menu\'s Insights item', 'src/ui/ScheduleInsightsMenu.tsx',
   ("    setOpened(null); setInsights(true); notify()", "    setOpened(null); notify()"), ['src/ui/schedule-insights-menu.test.tsx']),
  ('E1', 'the failed-save band on the Scheduler Board', 'src/ui/SchedBoard.tsx',
   ("        <SaveBand active={open} />", "        {null}"), ['src/ui/SaveStatus.test.tsx']),
  ('E2', 'the failed-save band on the Inputs calendar', 'src/ui/InputsCal.tsx',
   ("      <SaveBand />", "      {null}"), ['src/ui/SaveStatus.test.tsx', 'src/ui/inputscal.test.tsx']),
  # the fix round's own wires (each of these tests was red before its fix — re-proved here)
  ('F1', 'W11: spacing alone is no change', 'src/engine/slots.ts',
   ("  if(!TIME_TXT.test(String(path))&&was.replace(/\\s+/g,' ').trim()===v)return false;", "  /* cut */"), ['src/ui/schedule-tab.test.tsx']),
  ('F2', 'W15: the day keeps up while he tabs (week)', 'src/ui/EditWeek.tsx',
   ("          const r = swapDayAround(days[i]!, h, was.chunks[i] || chunksOfHTML(was.html[i]!), caret)", "          const r = { chunks: was.chunks[i] || chunksOfHTML(was.html[i]!), held: true }"), ['src/ui/schedule-tab.test.tsx']),
  ('F3', 'W15: the day keeps up while he tabs (board)', 'src/ui/SchedBoard.tsx',
   ("      if (caret && el.contains(caret)) return   // the caret's own panel: owed, written when the caret leaves", "      if (caret) return"), ['src/ui/schedule-tab.test.tsx']),
  ('F4', 'W8: the built-in weeks\' repeatable row ids', 'src/engine/weeks-data.ts',
   ("  if(!AUTHORED||!AUTHORED_WEEKS.has(String(v)))return days;", "  return days;"), ['src/engine/rowids.test.ts', 'src/state/mission-role-seedweek.test.ts']),
  ('F5', 'W12: the Tab route stops at a window', 'src/ui/schedule-tab.ts',
   ("  if (windowOverSchedule()) return true\n", "\n"), ['src/ui/schedule-tab.test.tsx']),
  ('F6', 'W10: the OIL question keeps open through a drag-out', 'src/ui/OilConfirm.tsx',
   ("if (clickedSurround(e, 'upconf-pop')) onCancel()", "if ((e.target as HTMLElement).className.includes('upconf-pop')) onCancel()"), ['src/ui/outside.test.tsx']),
  ('F7', 'W7: an answer is filed under its formation', 'src/ui/changesmodel.ts',
   ("  if (r.fld === 'mission-role') return roleItem(date, r)\n", "\n"), ['src/ui/changesmodel.test.ts']),
  ('F8', 'W2: the button\'s words are not a modified rule', 'src/ui/Shell.tsx',
   ("document.body.classList.toggle('page-rules-off', !!rulesCheckedOffCount())", "document.body.classList.toggle('page-rules-off', !!rulesOffCount())"), ['src/ui/logic.test.tsx']),
]

def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')

def main():
    want = set(sys.argv[1:])
    dirty = sh('git status --porcelain -- src').stdout.strip()
    if dirty:
        print('REFUSED: src is not clean:\n' + dirty); sys.exit(2)
    out = []
    for bid, surface, path, edit, tests in BREAKS:
        if want and bid not in want: continue
        tests = [t for t in tests if os.path.exists(t)]
        if edit is None or not tests:
            out.append({'id': bid, 'surface': surface, 'verdict': 'NOT RUN', 'why': 'no wire to cut (a removed control)' if edit is None else 'no such test file', 'red': []}); print(bid, 'NOT RUN'); continue
        if not os.path.exists(path):
            out.append({'id': bid, 'surface': surface, 'verdict': 'NOT RUN', 'why': 'no such file ' + path, 'red': []}); print(bid, 'NOT RUN (no file)'); continue
        src = open(path, encoding='utf-8', newline='').read()
        if edit == 'DROP-IMPORT':
            lines = src.split('\n'); idx = [i for i, l in enumerate(lines) if '@import' in l]
            if len(idx) < 3:
                out.append({'id': bid, 'surface': surface, 'verdict': 'NOT RUN', 'why': 'no import list found', 'red': []}); print(bid, 'NOT RUN'); continue
            del lines[idx[len(idx) // 2]]; broken = '\n'.join(lines)
        else:
            a, b = edit
            if src.count(a) != 1:
                out.append({'id': bid, 'surface': surface, 'verdict': 'NOT RUN', 'why': 'the line to cut was found %d times' % src.count(a), 'red': []}); print(bid, 'NOT RUN (find x%d)' % src.count(a)); continue
            broken = src.replace(a, b)
        open(path, 'w', encoding='utf-8', newline='').write(broken)
        try:
            r = sh('npx vitest run ' + ' '.join(tests))
            text = r.stdout + r.stderr
            red = sorted(set(re.sub(r'\s+\d+ms$', '', m.strip()) for m in re.findall(r'^\s*[×✗]\s+(.*)$', text, flags=re.M)))
            errs = re.findall(r'^\s*(?:FAIL|Error:).*$', text, flags=re.M)[:3]
            verdict = 'RED' if (red or r.returncode != 0) else 'STILL GREEN'
            out.append({'id': bid, 'surface': surface, 'file': path, 'tests': tests, 'verdict': verdict, 'red': red[:8], 'notes': errs if not red else []})
            print(bid, verdict, '|', (red[:2] or errs[:1]))
        finally:
            sh('git checkout -- "%s"' % path)
    if sh('git status --porcelain -- src').stdout.strip():
        print('WARNING: src is not clean after the run'); sys.exit(3)
    dest = 'docs/handpass/parts/stk-breaks.json'
    old = []
    if want and os.path.exists(dest):
        old = [o for o in json.load(open(dest, encoding='utf-8')) if o['id'] not in want]
    json.dump(old + out, open(dest, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('saved', dest)

main()
