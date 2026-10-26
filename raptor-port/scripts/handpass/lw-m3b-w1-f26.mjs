// W1 part f3 — scenario 26 (phone, Chromium): a whole-day Training under Unavailable (built on a desktop context through the Inputs
// window and Edit Schedule's Reject -> → Unavail, then reopened on a phone from its saved storage): a tap opens the day's list, read only,
// its remarks — for the admin and for Ranger. Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-f26.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
L.clearPrefix('s26-')
console.log('lw-m3b-w1-f26 out', L.OUT)
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const ISO = '2026-07-15', REM = 'Sim refresher'
const brief = c => (c?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|')[2] + '/' + b.split('|').pop()).join(' + ') || '(empty)'

/* the fixture, on a desktop */
const d = await M.start('desk')
const fx = await M.buildTrgUnavail(d, { iso: ISO, remarks: REM })
say('fixture (desktop): ' + JSON.stringify(fx))
judge(fx.before[0]?.acc === 'g' && fx.after[0]?.acc === 'u' && fx.after[0]?.allday === true && fx.onUnavailList, `26 the Training is whole-day and moved from the Ground Programme to Unavailable: before ${JSON.stringify(fx.before)}, after ${JSON.stringify(fx.after)}, on the Unavailable list ${fx.onUnavailList}`)
const state = await d.ctx.storageState()
console.log('   desktop errors:', JSON.stringify(d.errs))
await d.ctx.close()

async function look(role, label) {
  const w = await M.newCtx('phone', 'chromium', state)
  const P = w.page
  await L.signInPlain(w, role); await M.hideTransient(P)
  const who = role === 'admin' ? 'bane' : 'bane'
  const a0 = await P.evaluate(([iso]) => (window.INPUTS || []).filter(r => r.remarks === 'Sim refresher').length, [ISO])
  judge(a0 === 1, `26 [${label}] the saved world reached the phone: ${a0} Training "Sim refresher" in the inputs`)
  await L.reachCell(w, who, ISO)
  const cell = await M.cellWords(P, who, ISO)
  say(`26 [${label}] the cell: ${brief(cell)}`)
  await L.cellShot(w, who, ISO, `s26-${label}-1-cell`)
  const evalBox = await L.cellInfo(P, who, ISO)
  say(`26 [${label}] the box: ${evalBox.boxes[0]?.text} fill ${evalBox.boxes[0]?.bg} edge ${evalBox.boxes[0]?.bs}`)
  judge(/^TRG\|/.test((cell?.boxes || [])[0] || ''), `26 [${label}] a TRG box on the war: ${brief(cell)}`)
  const before = await M.stateOf(P, who, ISO)
  const writesBefore = await M.recsOf(P, who, ISO)
  await L.openCellR(w, who, ISO, `s26-${label}-2-tap-q`); await P.waitForTimeout(700)
  const wins = await M.anyWindowOpen(P)
  say(`26 [${label}] a tap opens: ${JSON.stringify(wins)}`)
  const dump = await L.sheetDump(P)
  say(`26 [${label}] the window reads: "${(dump?.text || '').slice(0, 300)}"`)
  await M.winPic(w, `s26-${label}-3-window`, { sel: T('daylist-sheet'), above: 175 })
  const acts = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] button')].filter(b => b.getBoundingClientRect().height > 0).map(b => (b.dataset.testid || '') + '=' + b.textContent.trim()))
  say(`26 [${label}] buttons in the window: ${acts.join(' | ') || '(none but the close)'}`)
  const noAct = !acts.some(a => /approve|refuse|delete|remove|clear|move/i.test(a))
  judge(wins[0] === 'daylist' || (wins.length && dump), `26 [${label}] a tap opens the day's list (${wins.join(',')})`)
  judge(/Sim refresher/.test(dump?.text || ''), `26 [${label}] its remarks are shown: ${/Sim refresher/.test(dump?.text || '')}`)
  judge(noAct, `26 [${label}] read only — no Approve / Refuse / Delete / Move: ${acts.join(' | ')}`)
  const inputsBox = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] input, [data-testid="daylist"] textarea')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || e.type) + ':' + (e.readOnly ? 'readonly' : 'EDITABLE')))
  say(`26 [${label}] input boxes in the window: ${JSON.stringify(inputsBox)}`)
  const writesAfter = await M.recsOf(P, who, ISO)
  judge(JSON.stringify(writesBefore) === JSON.stringify(writesAfter), `26 [${label}] the tap wrote nothing (records ${writesBefore.length} -> ${writesAfter.length})`)
  await L.closeAny(w)
  console.log(`   [${label}] errors:`, JSON.stringify(w.errs))
  await w.ctx.close()
}
await look('admin', 'admin')
await look('member', 'ranger')
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
await M.closeBrowser()
