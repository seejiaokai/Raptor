import * as L from './on-C-lib.mjs'
const { tid, shot, check } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const F = []
const iid = await L.fileIt(page, L.SAT, { type: 'OD', people: ['bane'] }, 'yes')
const recOd = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? JSON.stringify({ people: r.people.map(p => (window.PEOPLE[p.p] || {}).cs || p.p), oil: r.oil }) : 'GONE' }, iid)
F.push('OD filed for Ranger on Sat 18 Jul; its own OIL question answered Yes: ' + await recOd())
await L.plainRow(page, L.SAT_DI, 0, 'Hangar open day', '13:00', '15:00', ['rocky'])
await page.evaluate(() => { if (window.closeScheduler) window.closeScheduler() }); await page.waitForTimeout(300)
await L.toWeek(page)
const focus = async () => {
  await page.evaluate(([di, iid]) => {
    const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
    const pk = day.querySelector(`[data-inpseat="${iid}"] .puck`)
    pk.scrollIntoView({ block: 'center', inline: 'center' })
  }, [L.SAT_DI, iid])
  await page.waitForTimeout(300)
}
const target = `#eWeek [data-inpseat="${iid}"] .puck`
const hexRoster = '#eRoster .rpuck[data-person="rocky"]'
const hexSeat = `#eWeek [data-slot="g:${L.SAT_DI}.0"] .puck`
const day5 = () => page.evaluate(di => { const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...day.querySelectorAll('.sec-grnd .pl-row, .sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 70) + ' => ' + [...r.querySelectorAll('.puck .nm')].map(e => e.textContent).join('+')) }, L.SAT_DI)
const flashed = () => page.evaluate(() => [...document.querySelectorAll('.lift-land')].map(e => (e.innerText || e.className).replace(/\s+/g, ' ').slice(0, 30)))

async function round(label, srcSel, tag) {
  await focus()
  const g0 = await day5(), od0 = await recOd(), und0 = await L.undoLabel(page)
  await L.dragSel(page, srcSel, target)
  const q = tid(page, 'oilconf')
  const up = await q.count() === 1
  const lead = up ? await tid(page, 'oilconf-lead').innerText() : ''
  const head = up ? await q.locator('.airpop-head b').innerText() : ''
  const btns = up ? [await tid(page, 'oilconf-cancel').innerText(), await tid(page, 'oilconf-save').innerText(), await tid(page, 'oilconf-save').isDisabled()] : []
  const mid = { day: await day5(), od: await recOd() }
  const sub = up ? await q.innerText() : ''
  console.log(label, 'QUESTION up', up, 'lead', lead, 'head', head, 'btns', JSON.stringify(btns), 'measure', JSON.stringify(await L.measure(page, '[data-testid="oilconf"]')))
  console.log(label, 'question text:', sub.replace(/\s+/g, ' ').slice(0, 300))
  console.log(label, 'G0', JSON.stringify(g0), 'MID', JSON.stringify(mid.day), od0, mid.od)
  console.log(label, 'unchanged behind it:', JSON.stringify(mid.day) === JSON.stringify(g0) && mid.od === od0)
  await L.hush(page); await shot(page, `C2-${tag}-1-question`); await L.unhush(page)
  if (!up) return { up, lead, g0 }
  await tid(page, 'oilconf-cancel').click(); await page.waitForTimeout(120)
  const fl = await flashed()
  const bar = await tid(page, 'oilbar-text').innerText().catch(() => 'NONE')
  const bm = await L.measure(page, '[data-testid="oilbar"]')
  const g1 = await day5(), od1 = await recOd(), und1 = await L.undoLabel(page)
  console.log(label, 'CANCEL flashed', JSON.stringify(fl), 'bar', bar, 'barbox', JSON.stringify(bm), 'unchanged', JSON.stringify(g1) === JSON.stringify(g0) && od1 === od0, 'undo', und0, '->', und1)
  await shot(page, `C2-${tag}-2-bar`)
  /* answer */
  await tid(page, 'oilbar-answer').click(); await page.waitForTimeout(300)
  await tid(page, 'oil-yes').click()
  await tid(page, 'oilconf-save').click(); await page.waitForTimeout(700)
  const toastTxt = await L.toast(page)
  const g2 = await day5(), od2 = await recOd()
  console.log(label, 'ANSWERED toast', toastTxt, 'day', JSON.stringify(g2), 'od', od2)
  await L.hush(page); await focus(); await shot(page, `C2-${tag}-3-answered`); await L.unhush(page)
  await L.clickUndo(page)
  const g3 = await day5(), od3 = await recOd()
  const sameAsStart = JSON.stringify(g3) === JSON.stringify(g0) && od3 === od0
  console.log(label, 'UNDO once: same as start', sameAsStart, JSON.stringify(g3), od3)
  await L.clickRedo(page)
  const g4 = await day5(), od4 = await recOd()
  console.log(label, 'REDO: same as answered', JSON.stringify(g4) === JSON.stringify(g2) && od4 === od2)
  await L.clickUndo(page)   // put back for the next round
  const g5 = await day5(), od5 = await recOd()
  F.push(`${label}: question up=${up}, lead "${lead}", heading "${head}", buttons ${JSON.stringify(btns)}, nothing changed behind it=${JSON.stringify(mid.day) === JSON.stringify(g0) && mid.od === od0}; Don’t swap -> flashed ${JSON.stringify(fl)}, bar "${bar}" ${JSON.stringify(bm)}, nothing changed=${JSON.stringify(g1) === JSON.stringify(g0) && od1 === od0}, Undo ${und0} -> ${und1}; answered Yes -> toast "${toastTxt}", day ${JSON.stringify(g2)}, OD ${od2}; Undo once same as start=${sameAsStart} (${od3}); Redo same=${JSON.stringify(g4) === JSON.stringify(g2) && od4 === od2}; Undone again for next round: ${od5}`)
  return { up, lead }
}
const a = await round('CREWLIST', hexRoster, 'crew')
const b = await round('SEAT', hexSeat, 'seat')
console.log('FACTS\n' + F.join('\n'))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
