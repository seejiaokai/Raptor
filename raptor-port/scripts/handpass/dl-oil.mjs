/* THE DESIGN LOOK — the OIL question put before a swap, and the bar that stays; pictured as built at both sizes, with
   what a keyboard can do in each; and whether a keyboard can pick up a puck at all.
   The set-up is e2e/oilwait.spec.ts's own: a Training filed on Saturday 18 Jul 26, a plain row beside it, a real drag.
   node scripts/handpass/dl-oil.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
const K = size
const SAT = '2026-07-18', SAT_DI = 5
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/* file the input through the Inputs calendar's own day window */
await L.go(w, 'inputs')
if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
await p.waitForSelector('#inpCal')
for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${SAT}"]`).count()); i++) {
  const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +SAT.slice(0, 4) * 12 + (+SAT.slice(5, 7) - 1)
  await w.press(at < want ? '#icNext' : '#icPrev')
}
await p.locator(`[data-icday="${SAT}"]`).focus()
await p.keyboard.press('Enter')
await p.waitForSelector('[data-testid="win-inputsday"]')
await w.press('#icPopAdd')
await p.waitForSelector('#inpEditPop #inpEditType')
await p.selectOption('#inpEditPop #inpEditType', 'Training')
await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
const ad = p.locator('#inpEditPop #inpEditAllday')
if (await ad.count() && await ad.isChecked()) await ad.click()
await p.fill('#inpEditPop #inpEditStart', '09:00'); await p.fill('#inpEditPop #inpEditEnd', '12:00')
await p.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
await w.press('#inpEditSave')
await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(350)
/* the input's OWN save asks the same sheet (Cancel / Save) — pictured as the plain form of the question */
await L.pic(w, `oil-${K}-0-question-at-a-save`)
await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
await p.waitForSelector('#inpEditPop', { state: 'hidden' })
await p.locator('[data-testid="win-inputsday-x"]').click()

await L.go(w, 'editsched')
await p.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
await p.evaluate(di => { const W = window; W.DAYS[di].ground.push({ prog: 'Hangar open day', str: '13:00', end: '15:00', who: '', rmks: '' }); W.afterSchedMutate(); W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'nick'); W.afterSchedMutate() }, SAT_DI)
await L.sleep(400)
const from = `#sbBoard [data-slot="g:${SAT_DI}.1"] .puck`, to = `#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`
await p.locator(to).evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)

if (!w.phone) {
  /* CAN A KEYBOARD PICK UP A PUCK? — asked before the drag, on the board and on the crew list */
  const facts = await p.evaluate(() => {
    const tab = e => e.tabIndex >= 0 && !e.disabled
    const pk = [...document.querySelectorAll('#sbBoard .puck')].filter(e => e.getBoundingClientRect().width > 0)
    const crew = [...document.querySelectorAll('#sbBoard .palette .puck, #sbBoard .crew .puck, .sb-crew .puck, #sbPal .puck')].filter(e => e.getBoundingClientRect().width > 0)
    return { pucks: pk.length, tabbable: pk.filter(tab).length, tag: pk[0]?.tagName, role: pk[0]?.getAttribute('role') || 'none', crew: crew.length, crewTabbable: crew.filter(tab).length }
  })
  let reached = 0
  await p.locator('#sbBoard').evaluate(e => { const f = e.querySelector('button, input, [tabindex]'); if (f) f.focus() })
  for (let i = 0; i < 80; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement?.closest?.('.puck'))) { reached++; break } }
  L.row('A puck on the Scheduler Board', 'Tab (80 presses from the top of the board)', 'the keyboard can land on a puck, and Enter or Space picks it up (arms it) as a tap does', `${facts.pucks} pucks on screen, ${facts.tabbable} of them a Tab stop (a <${String(facts.tag).toLowerCase()}>, role ${facts.role}); Tab reached a puck: ${reached ? 'yes' : 'never'}`, facts.tabbable && reached ? 'look' : 'GAP — a puck cannot be picked up, moved or swapped without a mouse or a finger')
}

await L.pic(w, `oil-${K}-1-before-the-swap`)
const fb = await p.locator(from).boundingBox(), tb = await p.locator(to).boundingBox()
await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down()
await p.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
await p.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
await p.mouse.up()
await p.waitForSelector('[data-testid="oilconf-lead"]'); await L.sleep(400)
await L.pic(w, `oil-${K}-2-question-waits`)
if (!w.phone) await L.pic(w, `oil-${K}-2c-question-close-up`, { around: '[data-testid="oilconf"] .airpop-box', pad: 40 })

if (!w.phone) {
  L.row('OIL question', 'opens with the keyboard on…', 'inside the sheet — on the safe answer, or the first choice', await L.focusOf(w), 'look')
  const stops = []
  for (let i = 0; i < 7; i++) { await p.keyboard.press('Tab'); stops.push((await L.focusOf(w)).split(' · ')[0]) }
  const inside = await p.evaluate(() => !!document.activeElement?.closest?.('[data-testid="oilconf"]'))
  L.row('OIL question', 'Tab, seven times', 'goes round INSIDE the sheet: Yes, No, Don’t swap, (Swap once live), ✕', stops.join('  |  ') + ` · still inside: ${inside}`, inside ? 'look' : 'GAP — Tab leaves the sheet for the board behind it')
  const ring = await L.focusOf(w)
  L.row('OIL question', 'the ring on its buttons', 'always visible', ring, /NO RING/.test(ring) ? 'GAP — no ring' : 'works')
  /* pick Yes by keyboard, see the main button come alive, then No-answer path */
  await p.locator('[data-testid="oil-yes"]').focus(); await p.keyboard.press('Space'); await L.sleep(200)
  const live = !(await p.locator('[data-testid="oilconf-save"]').isDisabled())
  L.row('OIL question', 'Space on "Yes"', 'picks it; "Swap" comes alive', `Swap is ${live ? 'live' : 'still off'}`, live ? 'works' : 'GAP')
  await L.pic(w, `oil-${K}-3-question-answered`, { around: '[data-testid="oilconf"] .airpop-box', pad: 40 })
  await p.keyboard.press('Escape'); await L.sleep(400)
  const bar = await p.locator('[data-testid="oilbar"]').count()
  L.row('OIL question', 'Escape', 'nothing is swapped; the bar stays', `sheet ${(await p.locator('[data-testid="oilconf"]').count()) ? 'OPEN' : 'closed'}; bar ${bar ? 'up' : 'MISSING'}; keyboard on ${await L.focusOf(w)}`, bar ? 'works' : 'GAP')
} else {
  await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(400)
}
await p.waitForSelector('[data-testid="oilbar"]'); await L.sleep(300)
await L.pic(w, `oil-${K}-4-bar-stays`)
const barBox = await p.locator('[data-testid="oilbar"]').boundingBox()
console.log('BAR', JSON.stringify(barBox), 'screen', w.S.w, w.S.h)
await L.pic(w, `oil-${K}-4c-bar-close-up`, { around: '[data-testid="oilbar"]', pad: w.phone ? 24 : 60 })

if (w.phone) {
  /* DRAWN IN, for him to take or leave: the bar as wide as the phone, its words on one line with the two buttons at
     the right. As built it is centred by "left: 50%", which leaves it half the screen (195 of 390), so its five words
     wrap and the buttons drop under them (the layout of the picture he approved, D783). */
  await p.addStyleTag({ content: '.secdef-snack.oilbar{left:12px;right:12px;transform:none;flex-wrap:nowrap;justify-content:flex-start;padding:8px 10px;gap:8px}.secdef-snack.oilbar .secdef-msg{flex:1 1 auto;min-width:0;font-size:12.5px}.secdef-snack.oilbar .secdef-btn{white-space:nowrap;flex:0 0 auto;padding:6px 10px}' })
  await L.sleep(250)
  const bw = await p.locator('[data-testid="oilbar"]').boundingBox()
  if (bw.width < 300) throw new Error('the wide bar was not drawn')
  console.log('BAR WIDE', JSON.stringify(bw))
  await L.pic(w, `oil-${K}-6-bar-full-width-drawn`)
  await L.pic(w, `oil-${K}-6c-bar-full-width-drawn-close-up`, { around: '[data-testid="oilbar"]', pad: 24 })
}
if (!w.phone) {
  const after = await L.focusOf(w)
  L.row('The bar that stays', 'where the keyboard is when the bar appears', 'on the bar, or one Tab from it', after, /oilbar/.test(after) ? 'works' : 'look')
  let n = 0, on = ''
  for (; n < 120; n++) { await p.keyboard.press('Tab'); on = await L.focusOf(w); if (/oilbar/.test(on)) break }
  L.row('The bar that stays', 'Tab until "Answer OIL" is reached', 'a few presses', /oilbar/.test(on) ? `${n + 1} presses — ${on}` : `not reached in 120 presses`, /oilbar/.test(on) ? (n < 6 ? 'works' : `GAP — ${n + 1} presses away`) : 'GAP — cannot be reached')
  if (/oilbar/.test(on)) {
    await L.pic(w, `oil-${K}-5-bar-keyboard`, { around: '[data-testid="oilbar"]', pad: 60 })
    await p.keyboard.press('Enter'); await L.sleep(400)
    const back = await p.locator('[data-testid="oilconf"]').count()
    L.row('The bar that stays', 'Enter on "Answer OIL"', 'the question comes back, the keyboard inside it', `question ${back ? 'back' : 'NOT back'}; keyboard on ${(await L.focusOf(w)).split(' · ')[0]}`, back ? 'works' : 'GAP')
    if (back) { await p.keyboard.press('Escape'); await L.sleep(300) }
  }
  const esc0 = await p.locator('[data-testid="oilbar"]').count()
  await p.keyboard.press('Escape'); await L.sleep(300)
  const esc1 = await p.locator('[data-testid="oilbar"]').count()
  L.row('The bar that stays', 'Escape', 'closes the bar (it is what opened last)', `bar before ${esc0 ? 'up' : 'gone'}, after ${esc1 ? 'still up' : 'gone'}`, esc0 && !esc1 ? 'works' : 'GAP — Escape does nothing; only OK closes it')
}
await L.close(w)
