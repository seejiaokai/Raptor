/* [TRK-EDIT-SIDEWAYS] + D373 — the walk of the fold (28 Sep 26). Written as assertions of
   the RIGHT behaviour (a PASS means correct), so running it on a fixed build IS the re-walk
   (bug-check order §5). Drives the production bundle through the app's own controls.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-10-fold.mjs
*/
import { open, shot, save, log } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const tap = async (page, sel) => { await page.locator(sel).first().click(); await sleep(250) }
const box = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), bottom: Math.round(r.bottom), shown: getComputedStyle(e).display !== 'none' && r.height > 0 } }, sel)

async function editing(size, touch) {
  const w = await open({ size, touch })
  await tap(w.page, '#sylMenuBtn'); await tap(w.page, '#arrangeBtn'); await sleep(500)
  return w
}

/* 1 — sideways phone: the fold, the chart has room */
{
  const { browser, page, errors } = await editing({ width: 844, height: 390 }, true)
  const fold = await box(page, '#arrFold'), strip = await box(page, '#arrTools'), board = await box(page, '#board')
  const tabs = await box(page, '#viewtabs'), hint = await box(page, '#arrhint')
  L.ok('844×390: the folded row is shown', fold && fold.shown, JSON.stringify(fold))
  L.ok('844×390: the full strip is folded away', !strip || !strip.shown, JSON.stringify(strip))
  L.ok('844×390: the Flow / Info / Show All tabs and the hint line step aside', (!tabs || !tabs.shown) && (!hint || !hint.shown), JSON.stringify({ tabs, hint }))
  L.ok('844×390: the chart has real room (was 0px)', board && board.h >= 120, 'chart ' + (board && board.h) + 'px')
  const row = await page.evaluate(() => ({ tool: document.querySelector('#foldTool')?.textContent, hint: document.querySelector('#foldHint')?.textContent }))
  L.ok('844×390: the row names the tool in use and its hint', /Move/.test(row.tool || '') && /drag/.test(row.hint || ''), JSON.stringify(row))
  await shot(page, 'fold-1-sideways-folded')
  await tap(page, '#foldTools')
  const open2 = await box(page, '#arrTools')
  const onTop = await page.evaluate(() => { const s = document.getElementById('arrTools'), r = s.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && (hit === s || s.contains(hit)) })
  L.ok('844×390: Tools ▾ opens the whole set over the chart', open2 && open2.shown && onTop, JSON.stringify(open2))
  await shot(page, 'fold-2-sideways-tools-open')
  await page.locator('#arrTools button', { hasText: 'Connect' }).first().click(); await sleep(300)
  const after = await page.evaluate(() => ({ open: document.getElementById('arrTools').classList.contains('open'), tool: document.querySelector('#foldTool')?.textContent }))
  L.ok('844×390: choosing a tool closes the set; the row shows it', !after.open && /Connect/.test(after.tool || ''), JSON.stringify(after))
  await tap(page, '#foldTools')
  await page.keyboard.press('Escape'); await sleep(250)
  const esc = await page.evaluate(() => ({ open: document.getElementById('arrTools').classList.contains('open'), editing: !!document.querySelector('.tr-root.arranging') }))
  L.ok('844×390: Escape closes the set and nothing else', !esc.open && esc.editing, JSON.stringify(esc))
  await tap(page, '#foldTools')
  const b = await box(page, '#board'); await page.mouse.click(420, b.bottom - 10); await sleep(250)
  L.ok('844×390: a press outside closes the set', !(await page.evaluate(() => document.getElementById('arrTools').classList.contains('open'))))
  await tap(page, '#foldFit')
  L.ok('844×390: ⤢ Fit in the row works (no error)', errors.length === 0, errors.join(' | '))
  await tap(page, '#sylMenuBtn'); await tap(page, '#arrangeBtn'); await sleep(400)
  const done = { tabs: await box(page, '#viewtabs'), fold: await box(page, '#arrFold') }
  L.ok('844×390: Done editing — the tabs come back, the row goes', done.tabs && done.tabs.shown && (!done.fold || !done.fold.shown), JSON.stringify(done))
  await shot(page, 'fold-3-sideways-done')
  L.ok('844×390: no console or page error', errors.length === 0, errors.join(' | '))
  await browser.close()
}

/* 2 — upright phone and desktop: unchanged — the strip as it was, no folded row */
for (const [name, size, touch] of [['390×844', { width: 390, height: 844 }, true], ['1440×900', { width: 1440, height: 900 }, false]]) {
  const { browser, page, errors } = await editing(size, touch)
  const fold = await box(page, '#arrFold'), strip = await box(page, '#arrTools'), board = await box(page, '#board')
  L.ok(name + ': no folded row', !fold || !fold.shown, JSON.stringify(fold))
  L.ok(name + ': the strip shows, as before', strip && strip.shown, JSON.stringify(strip))
  L.ok(name + ': the chart keeps its room', board && board.h >= 300, 'chart ' + (board && board.h) + 'px')
  await shot(page, 'fold-4-' + name.replace('×', 'x') + '-unchanged')
  L.ok(name + ': no console or page error', errors.length === 0, errors.join(' | '))
  await browser.close()
}

save('lo-10-fold', L.rows)
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
