import * as F from './fx.mjs'
const { L } = F
console.log('w1 c4-c5 v1')
const w = await L.world('phone')
const p = w.page
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
const stageNow = () => p.evaluate(() => document.querySelector('[data-testid="stage-now"]').textContent.trim())
try {
  await F.publishSat(w)
  await F.toWar(w)
  await F.openMonth(w)
  // C4: stage to BIDDING CLOSED with the screen's own controls
  const menu = await F.stageTo(w)
  await w.press('[data-testid="stage-advance"]'); await L.sleep(700)
  console.log('stage after advance 1:', await stageNow())
  const t = await F.tapCell(w, 'plasma')
  console.log('bid sheet', t.open, t.label)
  const b = await F.sheetPress(w, 'bid-LL')
  console.log('after bid LL', JSON.stringify(b.sheet))
  await F.closeSheets(w)
  const t2 = await F.tapCell(w, 'plasma')
  console.log('decide sheet', JSON.stringify(t2))
  const a = await F.sheetPress(w, /^Approve$/)
  console.log('approve pressed', a.pressed, a.why || '', JSON.stringify(a.sheet))
  await F.closeSheets(w); await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(500)
  const n = await F.readNote(p)
  console.log('NOTE', JSON.stringify(n))
  const r = n.rows && n.rows[0]
  ok('C4a', 'a clash: instruction "Send the leave back or delete it ›"; sentence "Weekend/PH work earns FO, but the day holds LL"', { stage: await stageNow(), line: n.line, rows: n.rows && n.rows.map(x => [x.who, x.day, x.go, x.what]) },
    !!r && r.who === 'Fable' && r.go === 'Send the leave back or delete it ›' && /^Weekend\/PH work earns \*?FO\*?, but the day holds LL$/.test(r.what))
  await L.pic(w, 'c4-phone-clash-send-back-or-delete')
  await w.press('[data-testid="clash-row-0"]'); await L.sleep(800)
  const s = await F.sheetNow(p)
  console.log('c4 tap sheet', JSON.stringify(s))
  const hasBackOrDelete = !!s.buttons && s.buttons.some(x => /send|back|return/i.test(x)) && s.buttons.some(x => /delete|remove/i.test(x))
  ok('C4b', 'tap on the row opens Fable\'s Sat 18 Jul sheet, offering to send the leave back or delete it', { open: s.open, text: s.text, buttons: s.buttons }, /^Fable Sat 18 Jul/.test(s.text || '') && hasBackOrDelete)
  await L.pic(w, 'c4-phone-tap-opens-the-sheet')
  // C5
  await F.closeSheets(w); await L.sleep(300)
  await F.stageTo(w)
  await w.press('[data-testid="stage-advance"]'); await L.sleep(900)
  const st5 = await stageNow()
  console.log('stage after advance 2:', st5, JSON.stringify(await F.dialogNow(p)))
  await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(400)
  const n5 = await F.readNote(p)
  console.log('NOTE5', JSON.stringify(n5))
  const r5 = n5.rows && n5.rows[0]
  ok('C5a', 'same clash now "Weekend/PH work earns FO, but the day holds published LL" with "Step the war back to Bidding Closed ›"', { stage: st5, line: n5.line, expanded: n5.expanded, rows: n5.rows && n5.rows.map(x => [x.who, x.day, x.go, x.what]) },
    !!r5 && r5.who === 'Fable' && /^Weekend\/PH work earns \*?FO\*?, but the day holds published LL$/.test(r5.what) && r5.go === 'Step the war back to Bidding Closed ›')
  await L.pic(w, 'c5-phone-clash-step-back')
  if (n5.rows && n5.rows.length) {
    await w.press('[data-testid="clash-row-0"]'); await L.sleep(800)
    const s5 = await F.sheetNow(p)
    console.log('c5 tap sheet', JSON.stringify(s5))
    ok('C5b', 'a tap opens Fable\'s Sat 18 Jul', { open: s5.open, text: s5.text, buttons: s5.buttons }, /^Fable Sat 18 Jul/.test(s5.text || ''))
    await L.pic(w, 'c5-phone-tap-opens-fable-sat-18')
  }
} finally { await L.close(w) }
