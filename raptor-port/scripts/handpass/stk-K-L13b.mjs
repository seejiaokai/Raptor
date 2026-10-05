import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
let WHO = 'stiff'; let CS = 'Saber'
const CASE = process.env.K_CASE || 'mon'
import { handPut } from './seat-lib.mjs'
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
async function snap(p, surf, di, label) {
  const lst = await H.readList(p, surf, di)
  const ws = await H.warnsOf(p, di)
  const pk = H.flagged(await H.pucks(p, `${surf} .day[data-day="${di}"]`, WHO))
  const head = await W.head(p, di)
  return { label, focus: await focusKey(p), bar: lst.bar, nLines: (lst.lines || []).length, lines: (lst.lines || []).filter(l => new RegExp(CS+"|double|two seats|clash","i").test(l.text)).map(l => l.sev + ': ' + l.text).slice(0, 8), warnsHeld: ws.length, warnsHeldSaber: ws.filter(w => (w.who || []).includes(WHO)).map(w => w.msg), pucks: pk.map(x => `${x.where}${x.warn ? ' warn' : ''}${x.sev ? ' ' + x.sev : ''}${x.chip ? ' chip ' + x.chip : ''}${x.red ? ' red-ring' : ''}`), pending: head && head.pending, signed: head && head.signed, signs: head && head.signs }
}
const show = s => `[${s.label}] focus ${s.focus}; day bar "${s.bar}" (${s.nLines} lines; app holds ${s.warnsHeld} warnings, Saber's: ${JSON.stringify(s.warnsHeldSaber)}); Saber's flagged pucks: ${JSON.stringify(s.pucks)}; chip "${s.pending}"; sign line "${s.signed}"`

for (const mode of ['unpublished', 'published']) {
  const DI = CASE === 'tue' ? 1 : 0
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(700)
  await W.toastSpy(p)
  if (mode === 'published') { await W.signDay(p, 0); await W.publishDay(p, 0); await L.sleep(800) }
  await H.openList(p, '#eWeek', 0)
  const S = []
  S.push(await snap(p, '#eWeek', 0, 'before'))
  // wave 2's VL take-off 19:45 -> 12:30 : Saber flies it, and Wave 1's VL 12:40-14:05
  const TO = '#eWeek [data-txt="ff:0.1.0.to"]'
  await clickBox(p, TO)
  await p.keyboard.press('Control+A'); await p.keyboard.type('1230', { delay: 20 })
  await p.keyboard.press('Tab'); await K.sleep(250)
  S.push(await snap(p, '#eWeek', 0, 'tab 1'))
  const pc1 = await K.pic(p, `L13-${mode}-tab1`)
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Tab'); await K.sleep(60) }
  await K.sleep(300)
  S.push(await snap(p, '#eWeek', 0, 'tab 3'))
  for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); await K.sleep(60) }
  await K.sleep(500)
  S.push(await snap(p, '#eWeek', 0, 'tab 7'))
  const pc2 = await K.pic(p, `L13-${mode}-tab7`)
  await p.keyboard.press('Escape'); await K.sleep(500)
  S.push(await snap(p, '#eWeek', 0, 'after Escape'))
  const pc3 = await K.pic(p, `L13-${mode}-escape`)
  await clickEmpty(p)
  S.push(await snap(p, '#eWeek', 0, 'after click away'))
  const pc4 = await K.pic(p, `L13-${mode}-clickaway`)
  const model = await p.evaluate(() => window.DAYS[0].waves[1].formations[0].to)
  K.note('L-13', mode, `Edit Schedule Mon${mode === 'published' ? ' (signed four names and published first)' : ''}: day's warning list opened; wave 2 VL take-off 19:45 -> 1230 typed (Saber also flies Wave 1 VL 12:40-14:05); Tab (never a click) 1, 3, then 7 times; Escape; then click on empty page`,
    S.map(show).join('  ||  ') + `; stored take-off ${model}`, 'RECORD', [pc1, pc2, pc3, pc4])
  console.log('errors', mode, K.errList(errors))
  await browser.close()
}
K.flush()
