/* RULES SWEEP 3 — D49 (owner, 22 Sep 26): a flying line typed with the SAME
   take-off and landing STILL EARNS; the day must SAY the times look wrong, on
   the line, on ANY day, and must never refuse the line.
   Plus D49's other half: a line with crew and NO readable times earns nothing
   and is NAMED beside the duty desks. */
import { open, board, tap, type, shot, oilMode, warnings, readDay, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'
const { browser, page, errors } = await open({ state: STATE })
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }
const lineWarn = async () => page.evaluate(() => {
  const b=document.querySelector('#schedBoard')
  const out=[]
  for (const e of b.querySelectorAll('[data-bfld$=".ld"],[data-bfld$=".to"]')) { if(e.offsetParent===null) continue
    const row=e.closest('.sb-line,.sb-arow,tr,.line')||e.parentElement
    out.push({ fld:e.dataset.bfld, cls:e.className, rowcls:(row&&row.className||'').slice(0,60),
      title:e.getAttribute('title')||'', rowtitle:(row&&row.getAttribute('title'))||'' }) }
  return out.filter(o=>/warn|adv|bad|amber|flag/i.test(o.cls+o.rowcls)||o.title||o.rowtitle) })

for (const [di, what] of [[5,'SATURDAY (earns OIL)'], [2,'WEDNESDAY (earns nothing)']]) {
  console.log('\n\n########## ' + what + ' — day ' + di + ' ##########')
  await board(page, di)
  const d0 = await readDay(page, di)
  console.log('lines before:', JSON.stringify(d0.waves.map(w=>w.f.map(f=>`${f.cs} ${f.to}-${f.ld} [${f.ac}]`))))
  const w0 = await warnings(page); console.log('warnings before:', JSON.stringify(w0.lines))

  /* find a flying line that has crew, and type the SAME time in both boxes */
  const tgt = await page.evaluate(i => { const d=window.DAYS[i]
    for (let g=0; g<d.waves.length; g++) { const w=d.waves[g]; if (w.kind) continue
      for (let l=0; l<w.formations.length; l++) { const f=w.formations[l]
        if ((f.aircraft||[]).some(a=>a.p||a.w)) return {g,l,cs:f.cs,to:f.to,ld:f.ld} } }
    return null }, di)
  console.log('target line:', JSON.stringify(tgt))
  if (!tgt) { console.log('NO CREWED ORDINARY FLYING LINE ON THIS DAY — cannot walk D49 here'); continue }
  await type(page, `[data-bfld="ff:${di}.${tgt.g}.${tgt.l}.to"]`, '10:00')
  await type(page, `[data-bfld="ff:${di}.${tgt.g}.${tgt.l}.ld"]`, '10:00')
  await page.waitForTimeout(700)
  const d1 = await readDay(page, di)
  console.log('line now:', JSON.stringify(d1.waves[tgt.g].f[tgt.l]))
  const w1 = await warnings(page); console.log('WARNINGS AFTER:', JSON.stringify(w1, null, 1))
  console.log('ON-THE-LINE marks:', JSON.stringify(await lineWarn(), null, 1).slice(0,1200))
  await shot(page, `RULE-03-d49-same-time-day${di}`)
  /* the line must NOT be refused: the typed value is still there */
  const kept = await page.evaluate(([i,g,l])=>{const f=window.DAYS[i].waves[g].formations[l];return f.to+'-'+f.ld},[di,tgt.g,tgt.l])
  console.log('the app KEPT the typed times:', kept)
  /* and the crew must still earn (Saturday only — a Wednesday earns nobody) */
  await oilMode(page, true)
  const crowd = await pk()
  const sw = (await allSwitches(page)).filter(s=>s.txt===tgt.cs)
  console.log('switch on that line:', JSON.stringify(sw))
  const item = sw[0] && sw[0].item
  console.log('its crew:', item ? (crowd[item]||[]).join(', ') || '(none earning)' : '(no switch)')
  await shot(page, `RULE-03-d49-mode-day${di}`)
  await oilMode(page, false)
}

/* ---- D49's other half: crew, no times at all ----------------------------- */
console.log('\n\n########## D49 OTHER HALF — a crewed line with NO times ##########')
await board(page, 5)
const t2 = await page.evaluate(i => { const d=window.DAYS[i]
  for (let g=0; g<d.waves.length; g++) { const w=d.waves[g]; if (w.kind) continue
    for (let l=0; l<w.formations.length; l++) { const f=w.formations[l]
      if ((f.aircraft||[]).some(a=>a.p||a.w)) return {g,l,cs:f.cs} } } return null }, 5)
await type(page, `[data-bfld="ff:5.${t2.g}.${t2.l}.to"]`, '')
await type(page, `[data-bfld="ff:5.${t2.g}.${t2.l}.ld"]`, '')
await page.waitForTimeout(800)
console.log('line now:', await page.evaluate(([i,g,l])=>{const f=window.DAYS[i].waves[g].formations[l];return `${f.cs} "${f.to}"-"${f.ld}"`},[5,t2.g,t2.l]))
const w2 = await warnings(page); console.log('WARNINGS:', JSON.stringify(w2, null, 1))
await oilMode(page, true)
const c2 = await pk(); const s2 = (await allSwitches(page)).filter(s=>s.txt===t2.cs)
console.log('switch:', JSON.stringify(s2))
console.log('crew earning:', s2[0]&&s2[0].item ? (c2[s2[0].item]||[]).join(', ')||'(none)' : '(no switch item)')
await shot(page, 'RULE-03-d49-no-times')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
