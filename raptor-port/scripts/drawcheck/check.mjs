// THE DRAWING CHECK (owner D1494, 29 Oct 26): measures a built screen against its approved drawing and lists every
// difference — where each named part sits, its size, its fill, edges and corners, where its words sit and what they
// say — at the sizes the drawing was taken at (his PC's 1536 × 864 at 1.25, his iPhone's 402 × 874 at 3). For each
// difference it writes the drawing beside the build, the place marked on both, and the two laid over each other (D1426:
// he sees each one side by side and chooses). It exits red while any difference is unexplained (D1424: run after every
// change). A difference he has ruled to keep is listed in the spec's `accepted`, with his ruling; it stays in the
// report, marked, and no longer turns the check red.
//   cd raptor-port ; npm run build
//   node scripts/drawcheck/check.mjs scripts/drawcheck/specs/<screen>.mjs [--dist dist] [--out <folder>]
//        [--states a,b] [--all]          (--all: count the accepted differences as unexplained too)
// The drawing's side is its RECORD (record.mjs), committed beside the drawing; nothing here re-runs the drawing.
// DRAWCHECK_BUILD names the build in the report's words ("M5a at 794346689"); the report and its pictures go to --out.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium, LAUNCH, serveDist, measureParts } from './lib.mjs'
import { compare } from './compare.mjs'

console.log('[drawcheck check v1]')
const args = process.argv.slice(2)
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1] }
const SPEC_PATH = args.find(a => a.endsWith('.mjs'))
if (!SPEC_PATH) { console.error('usage: node scripts/drawcheck/check.mjs <spec.mjs> [--dist dist] [--out folder] [--states a,b] [--all]'); process.exit(2) }
const spec = (await import(pathToFileURL(resolve(SPEC_PATH)).href)).default
const DIST = resolve(opt('dist', 'dist'))
const OUT = resolve(opt('out', join('docs/img/handpass/drawcheck', spec.slug || 'run')))
const ONLY = (opt('states', '') || '').split(',').filter(Boolean)
const ALL = args.includes('--all')
const ORIGIN = spec.origin || 'http://localhost:4311'
const TOL = spec.tolerance ?? 2
// a kept difference names his ruling and the ONE kind it keeps: an entry with neither would keep every future
// difference of that part too, and the check could go green on a change he never saw
for (const a of spec.accepted || []) if (!a.check || !a.why || !a.state || !a.part) { console.error('a kept difference needs state, part, check and why (his ruling): ' + JSON.stringify(a)); process.exit(2) }
// one run, one folder (walk-scripts.md §5)
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })

// ---------------------------------------------------------------- the pictures
// The drawing beside the build, each cut to the same area of the screen (both parts' boxes and some room round them),
// the part ringed on each; then the build laid over the drawing at half strength, both rings drawn.
async function pictures(browser, st, rec, part, D, B, lines, file) {
  const vw = rec.viewport.w, vh = rec.viewport.h, dpr = rec.dpr
  const boxes = [D?.box, B?.box].filter(Boolean)
  const pad = part.pad ?? 36
  let x0 = Math.max(0, Math.min(...boxes.map(b => b.x)) - pad), y0 = Math.max(0, Math.min(...boxes.map(b => b.y)) - pad)
  let x1 = Math.min(vw, Math.max(...boxes.map(b => b.x + b.w)) + pad), y1 = Math.min(vh, Math.max(...boxes.map(b => b.y + b.h)) + pad)
  if (x1 - x0 < 160) { const c = (x0 + x1) / 2; x0 = Math.max(0, c - 80); x1 = Math.min(vw, c + 80) }
  if (y1 - y0 < 90) { const c = (y0 + y1) / 2; y0 = Math.max(0, c - 45); y1 = Math.min(vh, c + 45) }
  const w = x1 - x0, h = y1 - y0
  // a crop wider than a third of the screen goes above and below, not side by side
  const stack = w > Math.min(700, vw * 0.55)
  const img = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  const ring = (b, colour, label) => b ? `<div class="ring" style="left:${b.x - x0}px;top:${b.y - y0}px;width:${b.w}px;height:${b.h}px;border-color:${colour}"><i style="background:${colour}">${label}</i></div>` : ''
  const crop = (src, inner) => `<div class="crop" style="width:${w}px;height:${h}px"><img src="${src}" style="left:${-x0}px;top:${-y0}px;width:${vw}px;height:${vh}px">${inner}</div>`
  const dSrc = img(rec.__png), bSrc = img(st.__png)
  const PINK = '#ff2d95', GOLD = '#ffc400'
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#fff;font:14px/1.35 system-ui,sans-serif;color:#111}
    .sheet{display:inline-block;padding:16px}
    h1{font:700 17px system-ui;margin:0 0 4px} p{margin:0 0 10px;max-width:${stack ? w : 2 * w + 24}px}
    .row{display:flex;gap:24px;align-items:flex-start;flex-direction:${stack ? 'column' : 'row'}}
    .cap{font:700 13px system-ui;margin:0 0 4px}
    .crop{position:relative;overflow:hidden;outline:1px solid #bbb;background:#000}
    .crop img{position:absolute;max-width:none}
    .ring{position:absolute;border:2px solid;box-sizing:border-box;pointer-events:none}
    .ring i{position:absolute;left:-2px;top:-19px;color:#000;font:700 11px/1 system-ui;font-style:normal;padding:3px 5px;border-radius:4px;white-space:nowrap}
    .over img.b{opacity:.5}
    ul{margin:4px 0 12px 18px;padding:0}
  </style><div class="sheet">
    <h1>${esc(st.title)} — ${esc(part.label || part.name)}</h1>
    <ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
    <div class="row">
      <div><div class="cap">Drawing (approved)</div>${crop(dSrc, ring(D?.box, PINK, 'drawing'))}</div>
      <div><div class="cap">Built</div>${crop(bSrc, ring(B?.box, GOLD, 'built'))}</div>
    </div>
    <div class="cap" style="margin-top:14px">Laid over each other: the build at half strength on the drawing — pink ring the drawing's place, yellow the build's</div>
    <div class="crop over" style="width:${w}px;height:${h}px"><img src="${dSrc}" style="left:${-x0}px;top:${-y0}px;width:${vw}px;height:${vh}px"><img class="b" src="${bSrc}" style="left:${-x0}px;top:${-y0}px;width:${vw}px;height:${vh}px">${ring(D?.box, PINK, 'drawing')}${ring(B?.box, GOLD, 'built')}</div>
  </div>`
  const ctx = await browser.newContext({ viewport: { width: 400, height: 300 }, deviceScaleFactor: Math.min(dpr, 2) })
  const page = await ctx.newPage()
  await page.setContent(html); await page.waitForFunction(() => [...document.images].every(i => i.complete))
  await page.locator('.sheet').screenshot({ path: file })
  await ctx.close()
}

// ---------------------------------------------------------------- the run
const browser = await chromium.launch(LAUNCH)
const report = []
const errors = []
for (const st of spec.states) {
  if (ONLY.length && !ONLY.includes(st.id)) continue
  // a state may be measured against another state's record (`drawing.record`): one drawing, two ways the build gets there
  const recId = st.drawing.record || st.id
  const recFile = join(spec.records, recId + '.json')
  if (!existsSync(recFile) && opt('explore')) writeFileSync(join(OUT, st.id + '.stand-in.json'), JSON.stringify({ viewport: st.phone ? { w: 402, h: 874 } : { w: 1536, h: 864 }, dpr: st.phone ? 3 : 1.25 }))
  if (!existsSync(recFile) && !opt('explore')) { report.push({ state: st.id, title: st.title, unrecorded: true }); console.log(`${st.id}: NO DRAWING RECORD (${relative(process.cwd(), recFile)}) — record the drawing first (record.mjs)`); continue }
  const rec = JSON.parse(readFileSync(existsSync(recFile) ? recFile : join(OUT, st.id + '.stand-in.json'), 'utf8')); rec.__png = join(spec.records, recId + '.png')
  const ctx = await browser.newContext({ viewport: { width: rec.viewport.w, height: rec.viewport.h }, deviceScaleFactor: rec.dpr,
    hasTouch: !!st.phone, isMobile: !!st.phone, timezoneId: spec.timezone || 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${st.id}: ${e}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${st.id}: console: ${m.text().slice(0, 200)}`) })
  let reached = null
  try { reached = await st.reach(page, { origin: ORIGIN, phone: !!st.phone }) } catch (e) { reached = 'could not reach the screen: ' + e.message.split('\n')[0] }
  if (typeof reached === 'string') { report.push({ state: st.id, title: st.title, notReached: reached }); console.log(`${st.id}: NOT CHECKED — ${reached}`); await ctx.close(); continue }
  await page.mouse.move(1, 1); await page.waitForTimeout(250)
  // --explore <selector>: list what the build draws under it (to write a state's parts), measure nothing
  if (opt('explore')) {
    console.log(`--- ${st.id}: what the build draws under ${opt('explore')}`)
    console.log(await page.evaluate(root => [...document.querySelectorAll(root)].flatMap(r0 => [r0, ...r0.querySelectorAll('*')]).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !(e instanceof SVGElement) }).slice(0, 200).map(e => {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e)
      const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 28)
      return `${e.tagName.toLowerCase()}${e.dataset.testid ? '[' + e.dataset.testid + ']' : ''}${e.className ? '.' + String(e.className).trim().split(/\s+/).join('.') : ''}  ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}  ta=${s.textAlign} bg=${s.backgroundColor} edgeL=${s.borderLeftWidth} ${s.borderLeftColor} r=${s.borderTopLeftRadius}${own ? ' "' + own + '"' : ''}`
    }).join('\n'), opt('explore')))
    await page.screenshot({ path: join(OUT, st.id + '.explore.png') })
    await ctx.close(); continue
  }
  const parts = st.parts.map(p => ({ name: p.name, ...(typeof p.build === 'string' ? { sel: p.build } : p.build) }))
  const m = await page.evaluate(measureParts, parts)
  st.__png = join(OUT, st.id + '.build.png')
  await page.screenshot({ path: st.__png })
  await ctx.close()
  const row = { state: st.id, title: st.title, drawing: rec.drawing, approved: rec.approved, size: `${rec.viewport.w} × ${rec.viewport.h} at ${rec.dpr}`, parts: [] }
  let n = 0
  for (const part of st.parts) {
    const D = rec.parts[part.name], B = m.parts[part.name]
    const Drel = part.rel && rec.parts[part.rel], Brel = part.rel && m.parts[part.rel]
    let diffs
    if (!D?.found || !B?.found) diffs = [{ check: 'found', what: 'the part itself', drawing: D?.found ? 'drawn' : 'not in the drawing', build: B?.found ? 'built' : 'NOT FOUND in the build', by: (B?.why || D?.why || '') }]
    else diffs = compare(part, D, B, Drel?.found && Drel, Brel?.found && Brel, TOL)
    const acc = spec.accepted || []
    for (const d of diffs) {
      const a = acc.find(a => a.state === st.id && a.part === part.name && a.check === d.check)
      d.accepted = a ? a.why : null
      d.counts = !a || ALL
    }
    let pic = null
    // a part off the screen in this view (a column slid out of sight) is measured, but a crop would show something else
    const onScreen = m => m?.found && m.box.x < rec.viewport.w && m.box.x + m.box.w > 0 && m.box.y < rec.viewport.h && m.box.y + m.box.h > 0
    const offScreen = diffs.length && !onScreen(D) && !onScreen(B)
    if (offScreen) for (const d of diffs) d.what += ' — off the screen in this view, not pictured'
    if (diffs.length && !offScreen) {
      n++
      pic = `${st.id}--${part.name}.png`
      const lines = diffs.map(d => `${d.what}: drawing ${d.drawing}, built ${d.build}${d.by ? ' — ' + d.by : ''}${d.accepted ? ' [kept as built: ' + d.accepted + ']' : ''}`)
      try { await pictures(browser, st, rec, part, D?.found && D, B?.found && B, lines, join(OUT, pic)) } catch (e) { pic = null; errors.push(`${st.id}/${part.name}: picture failed: ${e.message.split('\n')[0]}`) }
    }
    row.parts.push({ part: part.name, label: part.label, diffs, picture: pic, measured: { drawing: D, build: B } })
  }
  report.push(row)
  console.log(`${st.id}: ${st.parts.length} parts measured, ${row.parts.filter(p => p.diffs.length).length} differ` + (rec.approved?.identical === false ? ' — WARNING: the drawing record was not taken from the approved picture'
    : rec.approved?.identical !== true ? ' — note: this record was never compared with the approved picture' : ''))
}
await browser.close()

// ---------------------------------------------------------------- the report
const counting = report.flatMap(r => (r.parts || []).flatMap(p => p.diffs.filter(d => d.counts).map(d => ({ ...d, state: r.state, part: p.part }))))
const kept = report.flatMap(r => (r.parts || []).flatMap(p => p.diffs.filter(d => !d.counts)))
const blocked = report.filter(r => r.unrecorded || r.notReached)
let md = `# Drawing check — ${spec.name}\n\nBuild: \`${process.env.DRAWCHECK_BUILD || DIST}\` · run ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })} · tolerance ${TOL}px` +
  (ALL ? ' · every difference counted, the kept ones too (--all)' : '') + `\n\n` +
  `**${counting.length ? 'RED' : blocked.length ? 'RED' : 'GREEN'}** — ${counting.length} difference(s) unexplained, ${kept.length} kept as built by his ruling, ${blocked.length} screen(s) not checked.\n\n`
for (const r of report) {
  md += `## ${r.title} (\`${r.state}\`${r.size ? ', ' + r.size : ''})\n\n`
  if (r.unrecorded) { md += 'No drawing record: record the drawing first.\n\n'; continue }
  if (r.notReached) { md += `NOT CHECKED — ${r.notReached}\n\n`; continue }
  md += `Drawing: \`${r.drawing.script}\` → \`${r.drawing.shot}.png\`` + (r.approved ? ` (the replay ${r.approved.identical ? 'is identical to' : r.approved.identical === false ? 'DIFFERS from' : 'was not compared with'} the approved picture)` : '') + '\n\n'
  md += '| Part | Difference | Drawing | Built | |\n|---|---|---|---|---|\n'
  for (const p of r.parts) {
    if (!p.diffs.length) { md += `| ${p.label || p.part} | matches | | | |\n`; continue }
    for (const d of p.diffs) md += `| ${p.label || p.part} | ${d.what}${d.by ? ' — ' + d.by : ''} | ${d.drawing} | ${d.build} | ${d.accepted ? 'kept as built: ' + d.accepted : '**unexplained**'}${p.picture ? ` · [picture](${p.picture})` : ''} |\n`
  }
  md += '\n'
}
if (errors.length) md += `## Errors on the page\n\n${errors.map(e => '- ' + e).join('\n')}\n`
writeFileSync(join(OUT, 'report.md'), md)
writeFileSync(join(OUT, 'report.json'), JSON.stringify({ spec: spec.name, dist: DIST, all: ALL, report, errors }, (k, v) => k.startsWith('__') ? undefined : v, 1))
console.log(`\n${counting.length || blocked.length ? 'RED' : 'GREEN'}: ${counting.length} unexplained, ${kept.length} kept, ${blocked.length} not checked — ${relative(process.cwd(), join(OUT, 'report.md'))}`)
for (const d of counting) console.log(`  ${d.state} / ${d.part}: ${d.what} — drawing ${d.drawing}, built ${d.build}${d.by ? ' (' + d.by + ')' : ''}`)
if (errors.length) console.log('page errors:\n  ' + errors.join('\n  '))
process.exit(counting.length || blocked.length ? 1 : 0)
