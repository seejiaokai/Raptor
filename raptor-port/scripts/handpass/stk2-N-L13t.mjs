/* L-13 again on a day where the person starts clean: Tuesday 14 Jul, nact (VL line 08:40-10:05) is put, through the board's own
   seat + crew list, into the RU line as well, whose take-off is first moved to 10:30 so there is no clash. The scenario's
   action is then: type RU's take-off 09:40 and press Tab. */
import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const WHO = 'nact'
async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(200)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(250)
}
async function clickEmpty(p) {
  const pt = await p.evaluate(() => {
    for (const [x, y] of [[8, 450], [1430, 450], [8, 300], [1430, 600], [700, 880]]) {
      const e = document.elementFromPoint(x, y)
      if (e && !e.closest('[contenteditable],input,select,button,a,[data-txt],[data-inp]')) return [x, y]
    }
    return null
  })
  await p.mouse.click(pt[0], pt[1]); await K.sleep(500)
}
const focusKey = p => p.evaluate(() => { const a = document.activeElement; return !a || a === document.body ? 'BODY' : (a.dataset.txt || a.dataset.inp || a.dataset.atime || a.dataset.area || a.dataset.bombs || a.tagName) })
async function snap(p, di, label) {
  const lst = await H.readList(p, '#eWeek', di)
  const ws = await H.warnsOf(p, di)
  const pk = H.flagged(await H.pucks(p, `#eWeek .day[data-day="${di}"]`, WHO))
  const head = await W.head(p, di)
  return { label, focus: await focusKey(p), bar: lst.bar, nLines: (lst.lines || []).length, lines: (lst.lines || []).filter(l => /nact|Nact|two seats|at once/i.test(l.text)).map(l => l.sev + ': ' + l.text).slice(0, 5), warnsHeld: ws.length, mine: ws.filter(w => (w.who || []).includes(WHO)).map(w => w.msg), pucks: pk.map(x => `${x.where}${x.sev ? ' ' + x.sev : ''}${x.chip ? ' chip ' + x.chip : ''}${x.red ? ' red-ring' : ''}`), pending: head && head.pending, signed: head && head.signed }
}
const show = s => `[${s.label}] focus ${s.focus}; day bar "${s.bar}" (${s.nLines} lines in the open list${s.lines.length ? ', mine: ' + JSON.stringify(s.lines) : ''}); app holds ${s.warnsHeld} warnings, nact's: ${JSON.stringify(s.mine)}; nact's flagged pucks: ${JSON.stringify(s.pucks)}; chip "${s.pending}"; sign line "${s.signed}"`

for (const mode of ['unpublished', 'published']) {
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await W.toastSpy(p)
  // set-up through the board: RU take-off 10:30, then nact onto RU's first seat
  await W.boardOn(p, 1)
  await W.boardText(p, 'ff:1.0.1.to', '1030')
  await K.sleep(800)
  const src = p.locator('#sbRoster .rpuck[data-person="nact"]:visible').first(), dst = p.locator('#schedBoard [data-slot="1.0.1.0.p"]:visible').first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' })); await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(200)
  await W.drag(p, src, dst)
  const put = { took: (await p.evaluate(() => window.DAYS[1].waves[0].formations[1].aircraft[0].p)) === 'nact', msg: 'dragged from the crew list' }
  console.log('put', JSON.stringify(put))
  if (mode === 'published') { await W.signDay(p, 1); await W.publishDay(p, 1); await L.sleep(800) }
  await W.boardOff(p)
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="1"]'); await L.sleep(700)
  await H.openList(p, '#eWeek', 1)
  const S = []
  S.push(await snap(p, 1, 'before'))
  const TO = '#eWeek [data-txt="ff:1.0.1.to"]'
  await clickBox(p, TO)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0940', { delay: 20 })
  await p.keyboard.press('Tab'); await K.sleep(300)
  S.push(await snap(p, 1, 'tab 1'))
  const pc1 = await K.pic(p, `L13t-${mode}-tab1`)
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Tab'); await K.sleep(60) }
  await K.sleep(300)
  S.push(await snap(p, 1, 'tab 3'))
  for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); await K.sleep(60) }
  await K.sleep(500)
  S.push(await snap(p, 1, 'tab 7'))
  const pc2 = await K.pic(p, `L13t-${mode}-tab7`)
  await p.keyboard.press('Escape'); await K.sleep(500)
  S.push(await snap(p, 1, 'after Escape'))
  const pc3 = await K.pic(p, `L13t-${mode}-escape`)
  await clickEmpty(p)
  S.push(await snap(p, 1, 'after click away'))
  const pc4 = await K.pic(p, `L13t-${mode}-clickaway`)
  const model = await p.evaluate(() => window.DAYS[1].waves[0].formations[1].to)
  K.note('L-13', 'tue-clean-' + mode, `Tuesday 14 Jul${mode === 'published' ? ' (signed four names and published first)' : ''}: via the board RU take-off 09:40 -> 10:30 and nact (VL 08:40-10:05) put on RU's first seat; day's list open; then on the week RU take-off typed 0940, Tab 1, 3, then 7 times (never a click); Escape; then click on empty page`,
    S.map(show).join('  ||  ') + `; stored RU take-off ${model}; handPut said ${JSON.stringify({ took: put.took, msg: put.msg })}`, 'RECORD', [pc1, pc2, pc3, pc4])
  console.log('errors', mode, K.errList(errors))
  await browser.close()
}
K.flush()
