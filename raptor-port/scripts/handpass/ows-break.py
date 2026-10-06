# -*- coding: utf-8 -*-
"""[OIL-WORK-START] — the BREAK TESTS (bug-check order §8.4): each wire of the change is cut once, on purpose, and the
three test files are run; a wire with no test that goes red has, by proof, no test. Every file is put back exactly as
it was (byte for byte) whether the run passes, fails or throws. Run from raptor-port/:  python scripts/handpass/ows-break.py
Writes docs/handpass/parts/ows-break.json."""
import io, json, os, subprocess, sys

TESTS = ['src/engine/oilworkstart.test.ts', 'src/leavewar/oilworkstart-published.test.ts', 'src/ui/oilworkstart.test.tsx']
# (id, what is cut, file, the exact text, what it becomes)
CUTS = [
 ('B01', 'the flying line stops reading its entered in-time / Rally', 'src/engine/oil.ts',
  "w2(rep!=null?rep:st-lead,", "w2(st-lead,"),
 ('B02', 'the walk ignores the kept report lead', 'src/engine/oil.ts',
  "const lead=opts&&opts.rv?opts.rv.reportLead:VCONF.reportLead,", "const lead=VCONF.reportLead,"),
 ('B03', 'the walk ignores the kept debrief', 'src/engine/oil.ts',
  "deb=opts&&opts.rv?opts.rv.debrief:VCONF.debrief;", "deb=VCONF.debrief;"),
 ('B04', 'the threshold ignores the value handed in', 'src/engine/oil.ts',
  "(min>=(full==null?VCONF.oilFullMin:full)?1:0.5)", "(min>=VCONF.oilFullMin?1:0.5)"),
 ('B05', 'the block no longer keeps the three values', 'src/engine/oilev.ts',
  "sent, mem: 1, rv: oilRuleValsNow() }", "sent, mem: 1 }"),
 ('B06', 'the work walk is not handed the block\'s kept values', 'src/engine/oilev.ts',
  "(item && ev.sent[item]) || [], rv: oilKeptVals(ev) })", "(item && ev.sent[item]) || [] })"),
 ('B07', 'the amount reads today\'s full-day line', 'src/engine/oilev.ts',
  "kept ? kept.oilFullMin : null)", "null)"),
 ('B08', 'the credit pass does not face each date\'s own block', 'src/leavewar/sync.ts',
  "oilAmount(blocks.get(k.slice(k.indexOf('|') + 1)), spans)", "oilAmount(undefined, spans)"),
 ('B09', 'the board\'s figures read today\'s full-day line', 'src/ui/oilmode.ts',
  "const v = oilAmount(ev, spans)", "const v = oilAmount(null, spans)"),
 ('B10', 'no pending entry for a Logic change', 'src/engine/publish.ts',
  ".concat(oilRuleDelta(di,issuedDay));}", ";}"),
 ('B11', 'the Logic entry is not listed as its own item', 'src/engine/publish.ts',
  "if(String(e.addr).startsWith('oilrv:'))items.push(", "if(false)items.push("),
 ('B12', 'the Logic entry is folded with the request\'s', 'src/engine/publish.ts',
  "oil=oilAll.filter((e:any)=>!String(e.addr).startsWith('oilrv:'));", "oil=oilAll;"),
 ('B13', 'the pending line loses its own words', 'src/ui/pendlist.ts',
  "if (String(e.addr || '').startsWith('oilrv:')) return oilRuleWords(di)", ""),
 ('B14', 'a sign-off no longer keeps the values it was given under', 'src/engine/publish.ts',
  "orv:oev.earns?oilKeptVals(oev):null};}", "orv:null};}"),
 ('B15', 'a sign-off is not checked against the values it kept', 'src/engine/publish.ts',
  "&&oilBoundOk(di,x.oil,c.oil)&&oilRvBoundOk(di,x.orv);}", "&&oilBoundOk(di,x.oil,c.oil);}"),
 ('B16', 'the comparison is on the amount alone (worked times dropped)', 'src/engine/oilev.ts',
  "const recKey = (r: OilRec | null) => r ? `${r.amt}:${r.spans.map(x => x.join('-')).join('+')}` : ''",
  "const recKey = (r: OilRec | null) => r ? `${r.amt}` : ''"),
 ('B17', 'the comparison fires whenever a value differs, whatever it would write', 'src/engine/oilev.ts',
  ".filter(p => recKey(a[p] || null) !== recKey(b[p] || null)).map(", ".map("),
 ('B18', '"could he earn here" reads today\'s values on a published face', 'src/ui/oilmode.ts',
  "oilSentinelPeople(di, it, win), rv: oilKeptVals(ev) })", "oilSentinelPeople(di, it, win) })"),
 ('B20', '"can this row earn" ignores the values handed in', 'src/engine/oil.ts',
  "onItem:(it:string)=>{if(it)out.add(it);},rv});", "onItem:(it:string)=>{if(it)out.add(it);}});"),
 ('B21', 'a malformed kept value is trusted', 'src/engine/oilev.ts',
  "const n = (v: any) => typeof v === 'number' && isFinite(v) && v >= 0", "const n = (v: any) => v != null"),
 ('B22', 'the Logic line names no man', 'src/ui/pendlist.ts',
  "oilRuleShift(d, ev).forEach(r => rows.push(", "oilRuleShift(null, ev).forEach(r => rows.push("),
 ('B23', 'a standalone wave (SC, AVALON, BB) is measured like a flying line', 'src/engine/oil.ts',
  "const win=sc?w2(st,en)", "const win=sc&&false?w2(st,en)"),
]

def run():
    r = subprocess.run('npx vitest run ' + ' '.join(TESTS), shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    out = (r.stdout or '') + (r.stderr or '')
    red = [l.strip()[2:].strip() for l in out.splitlines() if l.strip().startswith('×')]
    return r.returncode, red

results = []
only = set(sys.argv[1:])
for cid, what, path, a, b in CUTS:
    if only and cid not in only: continue
    src = io.open(path, encoding='utf-8', newline='').read()
    if src.count(a) != 1:
        results.append({'id': cid, 'what': what, 'file': path, 'verdict': 'NOT RUN', 'why': 'the text was found %d times' % src.count(a)}); print(cid, 'NOT RUN', src.count(a)); continue
    try:
        io.open(path, 'w', encoding='utf-8', newline='').write(src.replace(a, b))
        code, red = run()
    finally:
        io.open(path, 'w', encoding='utf-8', newline='').write(src)
    verdict = 'RED' if code != 0 and red else ('RED (did not compile or run)' if code != 0 else 'GREEN — NO TEST')
    results.append({'id': cid, 'what': what, 'file': path, 'verdict': verdict, 'red': len(red), 'first': red[:3]})
    print(cid, verdict, len(red), '|', (red[0][:110] if red else ''))
code, red = run()
print('restored:', 'all green' if code == 0 else 'STILL RED %d' % len(red))
os.makedirs('docs/handpass/parts', exist_ok=True)
if not only:
    json.dump({'tests': TESTS, 'cuts': results, 'restored_green': code == 0}, io.open('docs/handpass/parts/ows-break.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
