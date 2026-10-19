import { launch, ctxOpen, sleep, go, shot, openBoard, addStandby, seat, wave, bf, bType, status, errors, chips, summ, pressChip, waveShot, bPublish, topShot, pending, toTop, undo, redo, rec, oilRead, reload, oilShotWave, closeBoard, pickPlan, histText, roLook, histTab } from './sf-A-lib.mjs'
console.log('sf-A-s01 v2')
const b = await launch()
const DI = 5
const { ctx, p } = await ctxOpen(b, 's01')
const gi = await addStandby(p, DI, 'sc')
const seated = await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
const SPARE = seated[2][2], SPAREID = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].aircraft[2].p, [DI, gi])
await openBoard(p, DI)
const pub = await bPublish(p, DI)
console.log('publish', JSON.stringify(pub))
const oilLine = async () => { const r = await oilRead(p); return r.filter(x => x.includes(SPARE)).join(' || ') }
const lw = async () => {
  await go(p, 'leavewar'); await sleep(1200)
  const mon = p.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(1200) }
  const r = await p.evaluate(([id, d]) => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return c ? ((c.innerText || '').replace(/\s+/g, ' ').trim() + ' | ' + c.title) : 'NO CELL' }, [SPAREID, '2026-07-18'])
  await openBoard(p, DI); return r
}
const popPending = async (pic) => {
  const btn = p.locator('#schedBoard button', { hasText: /pending/ }).first()
  if (!(await btn.count())) return 'no pending button'
  await toTop(p); await p.locator('#sbHist, #schedBoard button', { hasText: /History/ }).first().click(); await sleep(600)
  const t = await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal, .chgwin, [class*=chg]')].filter(e => e.offsetParent && (e.innerText || '').length > 30).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 450)).slice(0, 1))
  if (pic) await shot(p, pic)
  await p.keyboard.press('Escape'); await sleep(300)
  if (await p.locator('[aria-label=Close], button:has-text("✕")').first().isVisible().catch(() => false)) { /* leave */ }
  return t
}
const lit = async () => (await chips(p, DI, gi, 0)).map(c => c.chips.some(x => x.on) ? 1 : 0).join('')
const signs = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-signday]')].filter(e => e.offsetParent).map(e => e.value))
const signedHead = () => p.evaluate(() => (document.querySelector('#schedBoard .sb-sign')?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 120))

/* baseline */
const oil0 = await oilLine(); const lw0 = await lw()
rec('1', 'Pub Sat (SC AM 07:00-13:00, R/B empty, SPARE seated), published ORIG; OIL Earn and the tracker for the SPARE', `${SPARE} earns nothing`, `oil: ${oil0}; tracker: ${lw0}`, /—/.test(oil0) && !/HO|FO/.test(lw0) ? 'PASS' : 'FAIL', await topShot(p, 'A-1-0-published'))

/* (a) */
await pressChip(p, `${DI}.${gi}.0.2`)
const pend1 = await pending(p), st1 = await status(p)
const pic1 = await topShot(p, 'A-1a-1-ticked-top')
const words = await histTab(p, /go out/); await shot(p, 'A-1a-2-changes-window'); await p.keyboard.press('Escape'); await sleep(400)
await waveShot(p, DI, gi, 'A-1a-3-wave')
const oil1 = await oilLine(); const lw1 = await lw()
const ow = await oilShotWave(p, DI, gi, 'A-1a-4-oil-mode')
rec('1a', 'press the SPARE\'s dashed chip on the published day: pending count, sign-offs, wording', 'lit; "1 pending"; Not yet signed; four sign-offs fall; Publish AL1', `lit=${await lit()}; pend=${JSON.stringify(pend1)}; beak=${st1.beak}; signs=${JSON.stringify(await signs())}`, /1 pending/.test(pend1.join()) && /Not yet signed/.test(pend1.join()) && st1.beak === 'Publish AL1' && (await lit()) === '0010' ? 'PASS' : 'FAIL', pic1)
rec('1a', 'the changes window\'s words for the tick', 'names the SC line, the SPARE row and a Flies change in words a scheduler uses', JSON.stringify(words), /flies|tick/i.test(JSON.stringify(words)) ? 'PASS' : 'FAIL', 'A/A-1a-2-changes-window.png')
rec('1a', 'OIL Earn mode and the tracker right after the tick, before any amendment', 'brief: both unchanged until AL1 (D592 (4)). The tracker (the money) must not move; the OIL Earn board is a working-copy preview (a CX moves it at once too)', `OIL Earn: ${oil1}; tracker: ${lw1}`, !/HO|FO/.test(lw1) ? 'RECORD' : 'FAIL', ow.pic)

/* (b) */
await undo(p)
const pend2 = await pending(p), st2 = await status(p)
rec('1b', 'Undo the tick', 'pending back to none, chip dashed, sign-offs back (the strip reads SIGNED again, no "Not yet signed")', `lit=${await lit()}; pend=${JSON.stringify(pend2)}; beak=${JSON.stringify(st2.beak)}; head=${await signedHead()}`, await lit() === '0000' && !/pending|Not yet signed/.test(pend2.join()) ? 'PASS' : 'FAIL', await topShot(p, 'A-1b-undo-top'))

/* (c) */
await redo(p)
const pubAL = await bPublish(p, DI)
const stAL = await status(p)
const oil3 = await oilLine(); const lw3 = await lw()
rec('1c', 'Redo, sign four, publish the amendment', 'AL1; the tracker credits the SPARE for 07:00-13:00 (6h = half a day)', `publish=${JSON.stringify(pubAL)}; chip=${stAL.chip}; lit=${await lit()}; OIL Earn: ${oil3}; tracker: ${lw3}`, stAL.chip === 'AL1' && /HO/.test(lw3) ? 'PASS' : 'FAIL', await topShot(p, 'A-1c-AL1-top'))
await waveShot(p, DI, gi, 'A-1c-AL1-wave')

/* earlier issued version's look: Original */
console.log('pick Original', await pickPlan(p, 'Original'))
const lkO = await roLook(p, 'A-1c-original-look')
const o2 = lkO.info[2]
rec('1c', 'look at the earlier issued version (Original)', 'the SPARE row (3rd badge) shown without a lit chip (the tick came after); nothing pressable', `badges: ${lkO.str}`, o2 && o2.role === 'SPARE' && !o2.chips.some(x => x.on) && lkO.info.every(i => i.chips.every(c => c.tag !== 'BUTTON')) ? 'PASS' : 'FAIL', lkO.pic)
console.log('pick AL1', await pickPlan(p, 'AL1'))
const lkA = await roLook(p, 'A-1c-AL1-look')
const a2 = lkA.info[2]
rec('1c', 'look at AL1 (issued, read-only)', 'the SPARE (3rd badge) WITH the lit chip, nothing pressable', `badges: ${lkA.str}`, a2 && a2.chips.some(x => x.on) && lkA.info.every(i => i.chips.every(c => c.tag !== 'BUTTON')) ? 'PASS' : 'FAIL', lkA.pic)
console.log('pick live', await pickPlan(p, 'live'))
console.log('after back: plan btn', await p.locator('#schedBoard .planselbtn').first().innerText())

/* (d) the opposite after publishing: untick the lit chip */
await pressChip(p, `${DI}.${gi}.0.2`)
const pend4 = await pending(p), st4 = await status(p)
const oil4 = await oilLine(); const lw4 = await lw()
rec('1d', 'press the lit chip off on the amended day (AL1)', 'dashed again; "1 pending"; Publish AL2; tracker still credits until published', `lit=${await lit()}; pend=${JSON.stringify(pend4)}; beak=${st4.beak}; OIL Earn: ${oil4}; tracker: ${lw4}`, await lit() === '0000' && /1 pending/.test(pend4.join()) && /HO/.test(lw4) ? 'PASS' : 'FAIL', await topShot(p, 'A-1d-1-unticked-top'))
const pubAL2 = await bPublish(p, DI)
const lw5 = await lw(); const st5 = await status(p)
rec('1d', 'publish the amendment (AL2)', 'the SPARE\'s OIL leaves the tracker', `publish=${JSON.stringify(pubAL2)}; chip=${st5.chip}; tracker: ${lw5}`, st5.chip === 'AL2' && !/HO|FO/.test(lw5) ? 'PASS' : 'FAIL', await topShot(p, 'A-1d-2-AL2-top'))

/* (e) roll back: view AL1 (the tick on) and load it onto the working copy, if the app offers it */
console.log('pick AL1', await pickPlan(p, 'AL1'))
const btns = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, [role=dialog] button')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 40))
console.log('buttons in AL1 look', JSON.stringify(btns))
const loadBtn = p.locator('#schedBoard button', { hasText: /Load onto working copy|Load .*working copy|Bring/ }).first()
if (await loadBtn.count()) {
  await loadBtn.click(); await sleep(800)
  await shot(p, 'A-1e-1-load-confirm')
  const confirm = p.locator('button', { hasText: /Load onto working copy|Load/ }).last()
  const cb = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(x => /Load|Cancel|Discard|OK/i.test(x)))
  console.log('confirm buttons', JSON.stringify(cb))
  await confirm.click().catch(e => console.log('confirm click', e.message.slice(0, 80))); await sleep(1000)
  const pl = await p.locator('#schedBoard .planselbtn').first().innerText()
  const pend6 = await pending(p), l6 = await lit()
  const oil6 = await oilLine(); const lw6 = await lw()
  rec('1e', 'view AL1 (tick on), "Load onto working copy"', 'the working copy gets the tick back: chip lit, pending, OIL Earn follows; tracker unchanged until published', `plan=${pl.replace(/\s+/g, ' ')}; lit=${l6}; pend=${JSON.stringify(pend6)}; OIL Earn: ${oil6}; tracker: ${lw6}`, l6 === '0010' ? 'PASS' : 'FAIL', await topShot(p, 'A-1e-2-after-load'))
} else rec('1e', 'roll back to an earlier version', 'if the app offers it, chip and OIL follow', 'no "Load onto working copy" button in the AL1 look: buttons ' + JSON.stringify(btns).slice(0, 300), 'NOT WALKED', await topShot(p, 'A-1e-no-load'))
await ctx.close()
console.log('errors', JSON.stringify(errors))
await b.close()
