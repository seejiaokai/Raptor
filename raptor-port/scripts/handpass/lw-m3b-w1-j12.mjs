// W1 part j — the roll-call's R12 (the OIL tracker and the balance bar unchanged by an OTH / ATCH) and the day panel's Away list (desktop 1536x864).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-j12.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
L.clearPrefix('r12-'); L.clearPrefix('rday-')
console.log('lw-m3b-w1-j12 desktop 1536x864 out', L.OUT)
const w = await M.start('desk'); const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const who = 'bane'
const norm = t => (t || '').replace(/\s+/g, ' ').trim()
/* the person window (a tap on his name) */
async function personWindow(label) {
  await P.evaluate(() => window.scrollTo(0, 0))
  await L.reachCell(w, who, '2026-11-10')
  const name = P.locator(`[data-testid="row-${who}"] td.who`).first()
  await name.scrollIntoViewIfNeeded()
  const bb = await name.boundingBox()
  await P.mouse.click(bb.x + 20, bb.y + bb.height / 2); await P.waitForTimeout(800)
  const wins = await M.anyWindowOpen(P)
  const txt = await P.evaluate(() => { const e = [...document.querySelectorAll('[role="dialog"], .bidsheet, .sheet, .floatwin')].filter(e => e.getBoundingClientRect().height > 0).pop(); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
  await P.screenshot({ path: path.join(L.OUT, `r12-${label}-person.png`), scale: 'css' })
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await L.closeAny(w)
  return { wins, txt }
}
async function oilTab(label) {
  await L.press(w, T('oil-tracker')); await P.waitForTimeout(1200)
  const txt = await P.evaluate(() => { const e = [...document.querySelectorAll('.floatwin, [role="dialog"], .oiltracker, [data-testid*="oil"]')].filter(e => /OIL TRACKER/i.test(e.innerText || '') && e.getBoundingClientRect().height > 300).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return e ? e.innerText.replace(/\s+/g, ' ').trim() : '' })
  await P.screenshot({ path: path.join(L.OUT, `r12-${label}-oiltab.png`), scale: 'css' })
  await P.keyboard.press('Escape'); await P.waitForTimeout(600)
  if (await P.evaluate(() => [...document.querySelectorAll('.floatwin, [role="dialog"]')].some(e => /OIL TRACKER/i.test(e.innerText || '') && e.getBoundingClientRect().height > 300))) { await P.locator('.floatwin:has-text("OIL TRACKER") .win-x').first().click().catch(() => {}); await P.waitForTimeout(500) }
  return txt
}
const balCell = async () => norm(await L.txt(P, T('bal-' + who)))
const p0 = await personWindow('before'); say('R12 the person window before: ' + JSON.stringify(p0.wins) + ' "' + (p0.txt || '').slice(0, 260) + '"')
const o0 = await oilTab('before'); say('R12 the OIL tab before holds ' + o0.length + ' characters; the part naming Ranger: ' + (o0.match(/.{0,60}Ranger.{0,80}/)?.[0] || '(not named)'))
const b0 = await balCell(); say('R12 Ranger\'s figure beside his name before: "' + b0 + '"')
// file an Other (a weekday), an Attach (another), through the bid window's ⋯
for (const [d, tid] of [['2026-11-10', 'bid-file-OTH'], ['2026-11-11', 'bid-file-ATCH']]) {
  await L.openCellR(w, who, d); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu')); await L.press(w, T(tid)); await P.waitForTimeout(800)
  say(`R12 ${tid} on ${d}: ${((await M.cellWords(P, who, d))?.boxes || []).map(b => b.split('|')[0]).join(',')}`)
}
const p1 = await personWindow('after'); say('R12 the person window after: "' + (p1.txt || '').slice(0, 260) + '"')
const o1 = await oilTab('after')
const b1 = await balCell(); say('R12 Ranger\'s figure beside his name after: "' + b1 + '"')
judge(norm(p0.txt) === norm(p1.txt) && !!p0.txt, `R12 the person window's balances are the same before and after an Other and an Attach: ${norm(p0.txt) === norm(p1.txt) ? 'identical' : 'DIFFERENT — before "' + (p0.txt || '').slice(0, 200) + '" after "' + (p1.txt || '').slice(0, 200) + '"'}`)
judge(o0 === o1, `R12 the OIL tab reads the same before and after (${o0.length} / ${o1.length} characters)${o0 === o1 ? '' : ' — first difference near: ' + (() => { let i = 0; while (i < o0.length && o0[i] === o1[i]) i++; return o0.slice(Math.max(0, i - 40), i + 60) + ' => ' + o1.slice(Math.max(0, i - 40), i + 60) })()}`)
judge(b0 === b1, `R12 the figure beside his name is the same before and after: "${b0}" -> "${b1}"`)

/* the day panel's Away list for a day holding an OTH (and, next day, an ATCH) */
for (const d of ['2026-11-10', '2026-11-11']) {
  await P.evaluate(() => window.scrollTo(0, 0)); await L.reachCell(w, who, d)
  await L.press(w, T('head-' + d)); await P.waitForSelector(T('win-lwday'), { timeout: 5000 }); await P.waitForTimeout(600)
  const t = await P.evaluate(() => document.querySelector('[data-testid="win-lwday"]').innerText.replace(/\s+/g, ' ').trim())
  const box = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"] .c, [data-testid="win-lwday"] .leg-box'); return e ? { text: e.textContent, cls: e.className.toString() } : null })
  const rect = await P.locator(T('win-lwday')).boundingBox()
  await P.screenshot({ path: path.join(L.OUT, `rday-${d.slice(5)}-panel.png`), clip: { x: rect.x, y: rect.y, width: rect.width, height: Math.min(rect.height, 420) }, scale: 'css' })
  say(`panel ${d}: "${t}"; box ${JSON.stringify(box)}`)
  judge(/AWAY · 1/i.test(t) && /Ranger/.test(t) && /(OTH|ATCH)/.test(t), `the day panel's Away list names Ranger with ${d === '2026-11-10' ? 'OTH' : 'ATCH'}: "${t.slice(t.indexOf('AWAY'))}"`)
  await P.locator(T('win-lwday') + ' .win-x').click(); await P.waitForTimeout(300)
}
console.log(`SUMMARY [desktop]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
