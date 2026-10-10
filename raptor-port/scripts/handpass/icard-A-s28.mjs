import { launch, open, openDay, press, shot, toList, judge, saveRows, saveWin, csId, pickDates, signOut, signIn, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
import { readFileSync, mkdirSync } from 'node:fs'
const SCRATCH = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/4fe0a868-4766-4a61-b47c-1e2d7bfe00d0/scratchpad/icardA-exports'
mkdirSync(SCRATCH, { recursive: true })
const browser = await launch()
const T = false
const { ctx, page: p } = await open(browser, { width: 1440, height: 900 }, 'ad', 'a', T)
const probs = []; const pics = []; const logs = []
// one saved change first, so the world survives the sign-out: a multi-day input (Anvil, 20-22 Jul)
await openDay(p, '2026-07-20', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Duty'); await p.selectOption('#inpEditPerson', await csId(p, 'Anvil'))
await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:00'); await p.fill('#inpEditOwnTitle', 'ZX export span')
await pickDates(p, T, '2026-07-20', '2026-07-22')
await saveWin(p, T, 'no'); await p.keyboard.press('Escape'); await p.waitForTimeout(250)
const span = await rec(p, { title: 'ZX export span' })
console.log('span', span.date, span.endDate)
const parse = text => {
  const rows = []; let row = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = '' }
    else cur += c
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  return rows
}
async function doExport(tag) {
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.locator('#inExport').click()])
  let toast = ''
  for (let i = 0; i < 12 && !/downloaded/i.test(toast); i++) { toast = (await p.getByText('CSV downloaded').first().isVisible().catch(() => false)) ? 'CSV downloaded' : ''; if (!/downloaded/i.test(toast)) await p.waitForTimeout(80) }
  const tpic = await shot(p, `28-${tag}-toast`); pics.push(tpic)
  const path = `${SCRATCH}/${tag}.csv`
  await dl.saveAs(path)
  return { path, name: dl.suggestedFilename(), toast, rows: parse(readFileSync(path, 'utf8')) }
}
async function listFilters(open_) {
  await toList(p, T)
  if (!(await p.locator('#inFilters').isVisible().catch(() => false))) { const b = p.locator('#inFiltersBtn'); if (await b.isVisible().catch(() => false)) await b.click(); await p.waitForTimeout(250) }
}
async function roundOf(who) {
  const total = await p.evaluate(() => window.INPUTS.length)
  const res = {}
  await listFilters()
  // a filter that matches one entry
  await p.fill('#inFSearch', who === 'admin' ? 'ZX export span' : 'Medical / PHA'); await p.waitForTimeout(500)
  const visibleOne = await p.locator('#inBody tr').count()
  pics.push(await shot(p, `28-${who}-filter-one`))
  res.one = await doExport(`${who}-one`)
  // a filter that matches none
  await p.fill('#inFSearch', 'qqzznothing'); await p.waitForTimeout(500)
  const emptyNow = await p.evaluate(() => { const e = document.querySelector('#inEmpty'); return e && e.offsetParent ? e.innerText.replace(/\s+/g, ' ') : '' })
  pics.push(await shot(p, `28-${who}-filter-none`))
  res.none = await doExport(`${who}-none`)
  logs.push(`${who}: INPUTS ${total}; table rows with the one-entry filter ${visibleOne}; empty note "${emptyNow}"; export(one filter) ${res.one.rows.length - 1} data rows, name ${res.one.name}, toast "${res.one.toast}"; export(no-match filter) ${res.none.rows.length - 1} data rows, toast "${res.none.toast}"`)
  for (const k of ['one', 'none']) {
    if (!/downloaded/i.test(res[k].toast)) probs.push(`${who}/${k}: no download confirmation (toast "${res[k].toast}")`)
    if (res[k].rows.length - 1 !== total) probs.push(`${who}/${k}: ${res[k].rows.length - 1} data rows in the file, but ${total} inputs exist`)
  }
  if (JSON.stringify(res.one.rows) !== JSON.stringify(res.none.rows)) probs.push(`${who}: the two files differ`)
  const head = res.one.rows[0]
  logs.push(`${who} header: ${head.join(' | ')}`)
  // the multi-day input carries its whole span in one row
  const row = res.none.rows.find(r => r.join('|').includes('ZX export span'))
  logs.push(`${who} span row: ${row && row.join(' | ')}`)
  if (!row) probs.push(`${who}: the multi-day input is not in the file`)
  else if (!/22/.test(row.join(' ')) || !/20/.test(row.join(' '))) probs.push(`${who}: the span row does not carry both ends: ${row.join(' | ')}`)
  return res
}
await roundOf('admin')
// undo/redo has nothing to check for an export (no save); sign in as the member in place
await p.keyboard.press('Escape').catch(() => {})
await signOut(p, T); await signIn(p, 'us', 'us')
const mem = await roundOf('member')
await p.waitForTimeout(200)
judge(28, 'desktop 1440', 'admin then member Ranger', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || logs.join(' ## '), pics)
console.log(logs.join('\n'))
await ctx.close()
await browser.close()
saveRows('s28')
console.log('ERRS', JSON.stringify(errs))
