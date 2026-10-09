// THE BREAK TESTS of "an input's own title" ([INPUT-OWN-TITLE]; the checking order's §8.4: for every wire the roll-call
// marks as wired, break it once on purpose and watch a NAMED test go red; if nothing goes red, that wire has no test, by
// proof). Each break is one exact text swap in one source file; the named test file is run; the file is put back.
// Nothing is left changed: it refuses to start on a tree with changes under src/.
//
//   node scripts/handpass/it-breaks.mjs [regex]            (from raptor-port/; about six minutes)
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const sh = (c) => execSync(c, { encoding: 'utf8' })
if (sh('git status --porcelain -- src').trim()) { console.log('REFUSED: src/ has uncommitted changes — commit first, so every break can be put back from git'); process.exit(2) }

const ENG = 'src/engine/inputtitle.test.ts', UI = 'src/ui/inputtitle.test.tsx', ROW = 'src/ui/inputtitle-row.test.tsx', PUB = 'src/ui/latepub.test.tsx'
const BREAKS = [
  ['B1 a leave takes a title', 'src/engine/inputs.ts', "return !!m&&(m.grp==='act'||m.grp==='duty');}", "return !!m;}", [ENG]],
  ['B2 a title left as the kind\'s own name is stored', 'src/engine/inputs.ts', "  return t&&t.toLowerCase()!==inpType(type).toLowerCase()?t:'';\n", "  return t;\n", [ENG, UI]],
  ['B3 a title is not cut to 40', 'src/engine/inputs.ts', ".trim().slice(0,TITLE_MAX).trim();", ".trim();", [ENG]],
  ['B4 the name ignores the title', 'src/engine/inputs.ts', "  return titleOf(type,inp&&inp.title)||type;\n", "  return type;\n", [ENG, ROW]],
  ['B5 the kind is never kept in sight', 'src/engine/inputs.ts', "  return inpLabel(inp)!==type?type:'';\n", "  return '';\n", [ENG, UI]],
  ['B6 a published day does not compare the title', 'src/engine/inputs.ts', "    ...(titleOf(inp.type,inp.title)?{title:titleOf(inp.type,inp.title)}:{}),\n", '', [ENG, PUB]],
  ['B7 a warning\'s copy of an input drops its title', 'src/engine/events.ts', ",...(inp.title?{title:inp.title}:{})};};", "};};", ['src/engine/dutyrest.test.ts']],
  ['B8 two requests of one name are merged into one commitment', 'src/engine/events.ts', "&&((!src&&!reqRows.has(x))||x.key===key)))return;", "))return;", ['src/engine/scshift-inputs.test.ts']],
  ['B9 two rows of one name are said as "two seats"', 'src/engine/validate.ts', "          ?(A.kind==='ground'&&B.kind==='ground'&&A.key!==B.key\n", "          ?(false\n", ['src/engine/scshift-inputs.test.ts']],
  ['B10 a request that is gone is named by its kind only', 'src/engine/inputs.ts', "  return kind&&name&&name.toLowerCase()!==kind.toLowerCase()?name:(kind||name);\n", "  return kind||name;\n", [ENG]],
  ['B11 the new record does not carry the title', 'src/ui/inputedit.tsx', "    ...(titleOf(draft.type, draft.title) ? { title: titleOf(draft.type, draft.title) } : {}),\n", '', [UI]],
  ['B12 an edit does not write the title', 'src/ui/inputedit.tsx', "    { const tt = titleOf(draft.type, draft.title); if (tt) r.title = tt; else delete r.title }\n", '', [UI, PUB]],
  ['B13 a kind changed to a leave keeps the typed title in the draft', 'src/ui/inputedit.tsx', "                    ...(titledKind(t) ? {} : { title: null }),\n", '', [UI]],
  ['B14 the Title box is drawn for every kind', 'src/ui/inputedit.tsx', "          {titledKind(draft.type) && ctx !== 's' && ctx !== 'up' && <label className=\"inped-f\">\n            <span className=\"inped-k\">Title</span>", "          {ctx !== 's' && ctx !== 'up' && <label className=\"inped-f\">\n            <span className=\"inped-k\">Title</span>", [UI]],
  ['B15 the window does not open on the saved title', 'src/ui/inputedit.tsx', "  title: r.title || null,\n", "  title: null,\n", [UI]],
  ['B16 an emptied box snaps back to the kind\'s name', 'src/ui/inputedit.tsx', "value={draft.title == null ? inpType(draft.type) : draft.title} placeholder={inpType(draft.type)}", "value={draft.title || inpType(draft.type)} placeholder={inpType(draft.type)}", [UI]],
  ['B17 the OIL question is headed by the kind', 'src/ui/inputedit.tsx', "    typeLabel: titleOf(draft.type, draft.title) || String(draft.type || ''), plan, prev,", "    typeLabel: String(draft.type || ''), plan, prev,", [UI]],
  ['B18 a shared input\'s save does not see a changed title', 'src/ui/inputedit.tsx', "      || String(r.title || '') !== titleOf(draft.type, draft.title)\n", '', [UI]],
  ['B19 the List\'s form does not save the title', 'src/ui/InputsPage.tsx', "      ...(titleOf(type, title) ? { title: titleOf(type, title) } : {}),\n", '', [UI]],
  ['B20 the List\'s form keeps the title for the next input', 'src/ui/InputsPage.tsx', "      setTitle(null)\n", '', [UI]],
  ['B21 the List\'s row does not print the title', 'src/ui/InputsPage.tsx', "{inpKindTag(r) && <b className=\"intitle\" data-testid=\"in-title\">{inpLabel(r)}</b>}", '', [UI]],
  ['B22 the List\'s pencil editor has no Title box', 'src/ui/InputsPage.tsx', "{titledKind(draft.type) && <input aria-label=\"Title\" data-ed=\"title\"", "{false && <input aria-label=\"Title\" data-ed=\"title\"", [UI]],
  ['B23 the List\'s search does not read the title', 'src/ui/InputsPage.tsx', "|| inpLabel(r).toLowerCase().includes(s) || (PEOPLE[r.person]", "|| (PEOPLE[r.person]", [UI]],
  ['B24 the opened day\'s search does not read the title', 'src/ui/InputsCal.tsx', "      (r.remarks || '').toLowerCase().includes(s) || inpLabel(r).toLowerCase().includes(s) ||\n", "      (r.remarks || '').toLowerCase().includes(s) ||\n", [UI]],
  ['B25 the day\'s card has no kind label', 'src/ui/InputsCal.tsx', "{it.kind && <span className=\"sd-kindtag\" data-testid=\"idy-kindtag\">{it.kind}</span>}", '', [UI]],
  ['B26 the month bar\'s tip does not say the kind', 'src/ui/InputsCal.tsx', "${it.word}${it.kind ? ' · ' + it.kind : ''} · ${dates}", "${it.word} · ${dates}", [UI]],
  ['B27 a remark that repeats the name is hidden', 'src/ui/InputsCal.tsx', "const rmk = r.remarks ? String(r.remarks) : ''", "const rmk = r.remarks && r.remarks !== it.word ? r.remarks : ''", ['src/ui/inputsday.test.tsx']],
  ['B28 the week\'s row has no kind label', 'src/ui/html.ts', "${nmi}${rowKindTag(o)}</span>", "${nmi}</span>", [ROW]],
  ['B29 a row nobody filed gets a kind label', 'src/ui/html.ts', "  if(!o||!o.src||!o.srcType)return '';\n", "  if(!o||!o.srcType)return '';\n", [ROW]],
  ['B30 the week\'s input card has no kind label', 'src/ui/html.ts', "inpEditLabel(inp,ed,inpLabel(inp),'ntx')+inpKindTagHTML(inp)}", "inpEditLabel(inp,ed,inpLabel(inp),'ntx')}", [ROW]],
  ['B31 the board\'s row has no kind label', 'src/ui/board-html.ts', "+(rowKindTag(x)&&!oilModeOn(di)?", "+(false?", [ROW]],
  ['B32 the board\'s input card has no kind label', 'src/ui/board-html.ts', "+(lc||inpKindTagHTML(inp)?`<span class=\"itemcell\">${itemCell}${inpKindTagHTML(inp)}${lc||''}</span>`:itemCell)", "+(lc?`<span class=\"itemcell\">${itemCell}${lc}</span>`:itemCell)", [ROW]],
  ['B33 a shared input does not share its title', 'src/state/inputgroup.ts', "['type', 'title', 'date',", "['type', 'date',", [ROW]],
  ['B34 a title change writes no history line', 'src/state/changelines.ts', "  if (!same(inpLabel(b), inpLabel(a)) && same(a.type, b.type)) logAction(null, `${who} · ${spanWords(sa)} · title`, base({ from: inpLabel(b), to: inpLabel(a) }))\n", '', [UI]],
  ['B35 the pending list does not say the title in words', 'src/ui/pendlist.ts', "  if (String(was.type || '') === String(now.type || '')) pair(inpLabel(was), inpLabel(now))\n", '', [PUB]],
  ['B36 the Inputs export has no Title column', 'src/ui/export.ts', "r.type, inpLabel(r), r.remarks]))", "r.type, r.remarks]))", [UI, 'src/ui/export.test.ts']],
  ['B37 the OIL history names a titled request by its kind', 'src/ui/oilmode.ts', "String(inpKindTag(r) ? inpLabel(r) : ((meta && meta.name) || inpLabel(r) || ''))", "String((meta && meta.name) || inpLabel(r) || '')", [UI]],
  ['B38 the demo\'s Event has no title', 'src/state/demoseed.ts', "type: 'Event', title: 'Sports afternoon', date: 'Jul 22'", "type: 'Event', date: 'Jul 22'", ['src/state/demostamps.test.ts']],
  ['B39 the List\'s question is headed by the kind', 'src/ui/InputsPage.tsx', "          typeLabel: titleOf(type, title) || type, plan, prev: {},", "          typeLabel: type, plan, prev: {},", [UI]],
  ['B40 the clash sentence names the kind', 'src/engine/validate.ts', "              :`${inpLabel(inp)} clashes with ${named(e.label,'this line')}${why}`,e.key);} }));", "              :`${inp.type} clashes with ${named(e.label,'this line')}${why}`,e.key);} }));", [ENG, 'src/engine/blankabsence.test.ts']],
]

let red = 0, green = 0
const ONLY = process.argv[2] ? new RegExp(process.argv[2]) : null   // e.g. "^B(8|9|26) " — run only these
for (const [name, file, from, to, tests] of BREAKS) {
  if (ONLY && !ONLY.test(name)) continue
  const src = readFileSync(file, 'utf8')
  if (src.split(from).length !== 2) { console.log(`SKIP   ${name} — the text to break is not there exactly once in ${file}`); green++; continue }
  writeFileSync(file, src.replace(from, to))
  let r
  try { r = spawnSync('npx', ['vitest', 'run', ...tests], { encoding: 'utf8', shell: true, timeout: 240000 }) }
  finally { writeFileSync(file, src) }
  const out = (r.stdout || '') + (r.stderr || '')
  const failed = /Tests\s+\d+ failed/.test(out) || /Test Files\s+\d+ failed/.test(out)
  const which = (out.match(/^\s*[×✗] .*$/gm) || []).slice(0, 2).map(s => s.trim().slice(0, 110)).join(' | ')
  if (failed) { red++; console.log(`RED    ${name} — ${tests.join(', ')}: ${which}`) }
  else { green++; console.log(`GREEN  ${name} — NOTHING went red in ${tests.join(', ')}: this wire has no test`) }
}
console.log(`\n${red} of ${red + green} breaks caught · ${green} not caught`)
if (sh('git status --porcelain -- src').trim()) console.log('WARNING: src/ is not as it was — check `git status`')
process.exit(green ? 1 : 0)
