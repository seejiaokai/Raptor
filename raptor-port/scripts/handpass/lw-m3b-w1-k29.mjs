// W1 part k — scenario 29's tail: after a Saturday Other filed from the war and answered "Yes: credit FO", where does the OIL show (desktop 1536x864)?
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-k29.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
L.clearPrefix('s29b-')
console.log('lw-m3b-w1-k29 desktop out', L.OUT)
const w = await M.start('desk'); const P = w.page
const say = s => console.log('   ' + s)
const D = '2026-11-14', who = 'bane'
const rangerOil = async label => {
  await L.press(w, T('oil-tracker')); await P.waitForTimeout(1200)
  const t = await P.evaluate(() => { const e = [...document.querySelectorAll('.floatwin, [role="dialog"]')].filter(e => /OIL TRACKER/i.test(e.innerText || '') && e.getBoundingClientRect().height > 300).sort((a, b) => a.innerText.length - b.innerText.length)[0]; if (!e) return null; const rows = [...e.querySelectorAll('tr')].filter(r => /Ranger/.test(r.innerText)); return { ranger: rows.map(r => r.innerText.replace(/\s+/g, ' ').trim()), total: e.innerText.length } })
  await P.screenshot({ path: path.join(L.OUT, `s29b-${label}-oiltracker.png`), scale: 'css' })
  await P.keyboard.press('Escape'); await P.waitForTimeout(600)
  return t
}
say('OIL tracker, Ranger, before: ' + JSON.stringify(await rangerOil('1-before')))
await L.openCellR(w, who, D); await P.waitForSelector(T('bid-picker'))
await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu')); await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(900)
await L.press(w, T('oil-yes')); await P.waitForTimeout(300); await L.press(w, T('oilconf-save')); await P.waitForTimeout(1000)
if (await L.vis(P, T('inped-placed'))) { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
await L.reachCell(w, who, D)
say('cell after: ' + (((await M.cellWords(P, who, D))?.boxes) || []).map(b => b.split('|')[0] + '/' + b.split('|').pop()).join(' + '))
say('input: ' + JSON.stringify(await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Other').map(r => ({ date: r.date, acc: r.acc, oil: r.oil })))))
say('OIL tracker, Ranger, after: ' + JSON.stringify(await rangerOil('2-after')))
await L.cellShot(w, who, D, 's29b-3-cell')
const wb = await P.evaluate(([who]) => document.querySelector(`[data-testid="bal-${who}"]`)?.innerText.replace(/\s+/g, ' ').trim(), [who])
say('the figure beside his name: ' + wb)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
