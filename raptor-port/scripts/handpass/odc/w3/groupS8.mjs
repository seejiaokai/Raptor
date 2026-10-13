// W3 scenario 8 by the Admin route: Archive Drifter (posted out today), Restore him with a later Post in, then on the Leave War tap a day
// at the end of his EARLIER stay. One fresh world.
import { newWorld, rec } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupS8 VERSION 1 - ${which}`)
const P = which === 'phone' ? 'p' : 'd'
const w = await newWorld(which, { tag: 'S8' }); const { page } = w
const sheetText = () => page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
const goneIn = pref => page.evaluate(p => [...document.querySelectorAll(`[data-testid^="cell-slipway-${p}"]`)].filter(e => /gone/.test(e.className)).map(e => e.getAttribute('data-testid').slice(-5)), pref)
const scrollPress = async sel => { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await w.press(sel); await page.waitForTimeout(300) }
try {
  await w.login()
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(500)
  await scrollPress('#admUsers .acc-main:has(.acc-name:text-is("Drifter"))')
  await scrollPress('#accEdArchive'); await page.waitForTimeout(400)
  await scrollPress('#accArchToggle'); await page.waitForTimeout(300)
  await scrollPress('#accArchList .acc-main')
  const readToday = await w.text('#accArPostIn')
  await scrollPress('#accArPostIn')
  const c = await w.cardOnTop('S8 Restore post in')
  console.log('  Restore Post in reads:', readToday, ' calendar month', c.month)
  await w.gotoMonthAndPick('2026-11-03')
  const readPicked = await w.text('#accArPostIn'), val = await w.val('#accArPostIn')
  await scrollPress('#accArRestore'); await page.waitForTimeout(600)
  console.log('  restored; box was', val, readPicked, '; archived toggle present:', await page.locator('#accArchToggle').count())
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 8000 })
  await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(300)
  await w.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  const octGone = await goneIn('2026-10-'), novGone0 = await goneIn('2026-11-')
  console.log('  Oct struck:', octGone.join(' '), ' Nov struck (drawn?):', novGone0.join(' '))
  await w.shot(`s8-${P}-oct-grid`)
  // tap the end of the earlier stay: 12 Oct (the day before the archive day 13 Oct)
  const cellSel = '[data-testid="cell-slipway-2026-10-12"]'
  console.log('  cell 10-12 present:', await page.locator(cellSel).count(), 'class', await page.locator(cellSel).first().evaluate(e => e.className).catch(() => 'n/a'))
  await w.tapCell('slipway', '2026-10-12')
  const sh = await sheetText()
  const info = await page.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid]')].map(e => e.getAttribute('data-testid') + (e.disabled ? '(disabled)' : '')).join(' '))
  await w.shot(`s8-${P}-earlier-stay-end-sheet`)
  console.log('  sheet:', sh, '\n  controls:', info)
  let tapRes = ''
  for (const id of ['postout-date', 'po-date', 'postin-date']) {
    const loc = page.locator(`[data-testid="${id}"]`)
    if (await loc.count()) {
      const st = await loc.first().evaluate(e => ({ tag: e.tagName, disabled: e.disabled === true, ariaDisabled: e.getAttribute('aria-disabled'), opacity: getComputedStyle(e).opacity, cursor: getComputedStyle(e).cursor, pe: getComputedStyle(e).pointerEvents, text: e.innerText.trim() }))
      await w.press(`[data-testid="${id}"]`)
      const opened = await page.locator('[data-testid="dcal-card"]').count()
      tapRes += ` box ${id}: ${JSON.stringify(st)}; a tap on it opened a calendar: ${opened > 0}.`
      await w.shot(`s8-${P}-tap-on-${id}`)
    }
  }
  // press PO and PI on the 12 Oct sheet; then tap a day in the gap (13 and 20 Oct), then the day his new stay begins
  const dateBoxState = () => page.evaluate(() => ['po-date', 'pi-date', 'postout-date', 'postin-date'].map(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? `${id}: "${e.innerText.trim()}" disabled=${e.disabled === true} aria-disabled=${e.getAttribute('aria-disabled')} opacity=${getComputedStyle(e).opacity} data-value=${e.getAttribute('data-value')}` : null }).filter(Boolean).join(' ; '))
  const extra = []
  if (await page.locator('[data-testid="bid-postout"]').count()) {
    await w.press('[data-testid="bid-postout"]')
    extra.push(`12 Oct then PO: ${await dateBoxState()}; sheet "${(await sheetText()).slice(-260)}"`)
    await w.shot(`s8-${P}-12oct-po`)
  }
  for (const [lab, iso] of [['13 Oct (first day posted out)', '2026-10-13'], ['20 Oct (in the gap)', '2026-10-20']]) {
    await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
    await w.tapCell('slipway', iso)
    const st = await dateBoxState()
    let opened = 'n/a'
    for (const id of ['postout-date', 'postin-date']) if (await page.locator(`[data-testid="${id}"]`).count()) { await w.press(`[data-testid="${id}"]`); opened = `tap on ${id} opened a calendar: ${(await page.locator('[data-testid="dcal-card"]').count()) > 0}`; await w.shot(`s8-${P}-${iso.slice(5)}-box-tap`); break }
    extra.push(`${lab}: boxes ${st || '(no date box)'}; ${opened}; sheet "${(await sheetText()).slice(0, 300)}"`)
    await w.shot(`s8-${P}-${iso.slice(5)}-sheet`)
    if (await page.locator('[data-testid="dcal-card"]').count()) { await page.mouse.click(3, 3).catch(() => {}); await page.waitForTimeout(300) }
  }
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  await w.press('[data-testid="month-NOV"]'); await page.waitForTimeout(900)
  await w.tapCell('slipway', '2026-11-03')
  { const st = await dateBoxState(); extra.push(`3 Nov (new stay's first day): boxes ${st || '(no date box)'}; sheet "${(await sheetText()).slice(0, 300)}"`); await w.shot(`s8-${P}-03nov-sheet`) }
  console.log('  EXTRA:\n  ' + extra.join('\n  '))
  tapRes += ' ' + extra.join(' ## ')
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  rec(w, '8', 'RECORD', `Drifter archived from today (13 Oct 26), restored with Post in "${readToday}" -> picked "${readPicked}" (${val}). On the Leave War, October struck days: ${octGone.length ? octGone[0] + '..' + octGone[octGone.length - 1] + ' (' + octGone.length + ')' : '(none)'}. Tapped 12 Oct (end of the earlier stay): sheet reads "${sh.slice(0, 300)}"; controls: ${info}.${tapRes || ' No date box on the sheet.'}`, `s8-${P}-earlier-stay-end-sheet.png`)
} catch (e) { console.log('ERR', String(e).slice(0, 600)); await w.shot(`S8-ERR-${P}`).catch(() => {}); rec(w, '8', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
console.log('RESULTS', JSON.stringify(w.results))
await w.close().catch(() => {})
