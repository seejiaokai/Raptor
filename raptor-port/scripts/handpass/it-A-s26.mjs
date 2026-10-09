// Scenario 26 — the Inputs export (admin and Ranger, desktop): a Title column beside Type; commas and quotes stay in their cell.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, gotoInputs, norm } from './it-A-lib.mjs'
import { calDoor, showAll } from './it-A-doors.mjs'
import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUTD = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/5be0e123-6cd9-4081-8796-605c27ebd4b5/scratchpad/exports'
mkdirSync(OUTD, { recursive: true })
const parseCsv = text => {
  const rows = []; let row = [], f = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(f); f = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; rows.push(row); row = [] }
    else f += c
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row) }
  return rows
}
const browser = await launch()
const T = table('s26')
for (const role of ['admin', 'member']) {
  const { ctx, page } = await open(browser, 'desk', role === 'admin' ? 'ad' : 'us', role === 'admin' ? 'a' : 'us')
  const P = await people(page)
  const say = []; let ok = true; const pics = []
  const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
  try {
    const c = calDoor()
    const who = role === 'admin' ? P.Ranger : undefined
    const mk = async (iso, st, en, title, rmk) => { await c.openNew(page, { iso, person: who, type: 'Event', st, en, rmk }); if (title) await page.fill('#inpEditTitle', title); await c.submit(page); await closeAnyWin(page) }
    await mk('2026-07-20', '09:00', '10:00', 'Sports day', 'first remark')
    await mk('2026-07-21', '09:00', '10:00', '', 'second remark')
    await mk('2026-07-22', '09:00', '10:00', 'Ops, "A&B"', 'third, remark "quoted"')
    await gotoInputs(page); await press(page, page.locator('#inListBtn')); await showAll(page)
    pics.push(await shot(page, `s26-${role}-list`))
    const dl = page.waitForEvent('download', { timeout: 8000 }).catch(() => null)
    await press(page, page.locator('#inExport'))
    const d = await dl
    if (!d) { ok = false; say.push('NOT REACHED: the export press produced no browser download event in this headless browser') }
    else {
      const file = join(OUTD, `${role}-` + d.suggestedFilename()); await d.saveAs(file)
      const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
      const rows = parseCsv(text).filter(r => r.length > 1)
      const head = rows[0]
      say.push(`downloaded "${d.suggestedFilename()}", ${rows.length - 1} data rows; header: ${head.join(' | ')}`)
      const ti = head.indexOf('Title'), ty = head.indexOf('Type')
      need(ti >= 0 && ty >= 0 && ti === ty + 1 || ti === ty - 1, `a Title column stands beside Type (Type at ${ty}, Title at ${ti})`)
      const find = rmk => rows.slice(1).find(r => r.some(x => x === rmk))
      const r1 = find('first remark'), r0 = find('second remark'), r3 = find('third, remark "quoted"')
      need(!!r1 && r1[ty] === 'Event' && r1[ti] === 'Sports day', `row 1: Type "${r1 && r1[ty]}", Title "${r1 && r1[ti]}"`)
      need(!!r0 && r0[ty] === 'Event' && r0[ti] === 'Event', `row 2 (untitled): Type "${r0 && r0[ty]}", Title "${r0 && r0[ti]}"`)
      need(!!r3 && r3[ty] === 'Event' && r3[ti] === 'Ops, "A&B"', `row 3: Type "${r3 && r3[ty]}", Title ${JSON.stringify(r3 && r3[ti])}`)
      const width = new Set(rows.map(r => r.length))
      need(width.size === 1, `every row has the same number of cells (${[...width].join(',')}) - the comma and quotes shifted nothing`)
      const di = head.findIndex(h => /date|start/i.test(h)), ri = head.findIndex(h => /remark/i.test(h))
      say.push(`the quoted row's cells: ${JSON.stringify(r3)}`)
      const raw = text.split(/\r?\n/).find(l => l.includes('A&B'))
      say.push(`the quoted row as written in the file: ${raw}`)
    }
  } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')) }
  T.add({ n: 26, size: page.sizeName, role: role === 'admin' ? 'admin' : 'member (Ranger)', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
  T.save()
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
