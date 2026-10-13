/* THE OIL QUESTION PUT BEFORE A SWAP, AND THE BAR THAT STAYS — at both sizes, with what a keyboard can do in each.
   FIRST RUN (13 Oct 26, the design look — [DESIGN-LOOK-13OCT]): it recorded what was FOUND ("GAP", "look"); those
   pictures and that key record are docs/mock/2026-10-13-design-look/ and stay as they were.
   SINCE 14 OCT 26 ([LOOK-13OCT-SMALL-FIXES], owner D830, D837) EVERY LINE IS AN ASSERTION OF THE RIGHT BEHAVIOUR — a
   `works` means correct, a `FAIL — …` is a fault — so running it on the built app IS the re-walk (docs/bug-check-order.md
   §5). Run it with DL_SHOTS naming the check's own folder:
     DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/dl-oil.mjs [phone|desk]
   What it asserts: L1 the answers flat under the question · L2 the ✕ in the corner, last by keyboard · L3 the reason as
   one ordinary sentence, the words of record · L4 Back / Add at a new input's save · L5 a picked answer in the outline
   look · K7 the first answer takes the keyboard · K10 the app's ring · L7, K8, K9 the bar by keyboard · L6 the bar's
   box on a phone.
   The set-up is e2e/oilwait.spec.ts's own: a Training filed on Saturday 18 Jul 26, a plain row beside it, a real drag. */
import * as L from './dl-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
const K = size
const SAT = '2026-07-18', SAT_DI = 5
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ACCENT = await p.evaluate(() => { const i = document.createElement('i'); i.style.color = 'var(--accent)'; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c })
const say = v => (typeof v === 'string' ? v : JSON.stringify(v))
const ok = (surface, key, expected, saw, pass) => L.row(surface, key, expected, say(saw), pass ? 'works' : `FAIL — ${say(saw).slice(0, 400)}`)
/** the question's own facts, read off the screen */
const sheetFacts = () => p.evaluate(accent => {
  const s = document.querySelector('[data-testid="oilconf"]'), box = s.querySelector('.airpop-box'), head = s.querySelector('.airpop-head')
  const x = head.querySelector('.x'), b = head.querySelector('b'), hr = head.getBoundingClientRect(), xr = x.getBoundingClientRect()
  const ans = [...s.querySelectorAll('.upconf-seg')], row = ans[0].parentElement, rs = getComputedStyle(row), ask = s.querySelector('[data-testid="oilconf-ask"]')
  const q = (ask || s.querySelector('.oilconf-what')).getBoundingClientRect(), a0 = ans[0].getBoundingClientRect()
  const picked = ans.find(a => a.getAttribute('aria-pressed') === 'true'), ps = picked ? getComputedStyle(picked) : null
  const main = s.querySelector('[data-testid="oilconf-save"]'), ms = getComputedStyle(main)
  return {
    title: b.textContent, ask: ask ? ask.textContent.replace(/\s+/g, ' ').trim() : null, caps: ask ? getComputedStyle(ask).textTransform : null,
    note: s.querySelector('.oilconf-note').textContent, answers: ans.map(a => a.textContent), buttons: [s.querySelector('[data-testid="oilconf-cancel"]').textContent, main.textContent],
    xGap: Math.round(hr.right - xr.right), titleToX: Math.round(xr.left - b.getBoundingClientRect().right),
    rowClass: row.className, rowBg: rs.backgroundColor, rowBorder: rs.borderBottomWidth, rowPadL: rs.paddingLeft, wornSeg: !!s.querySelector('.seg'), boxed: !!s.querySelector('.upconf-left'),
    answerLeftVsQuestion: Math.round(a0.left - q.left),
    picked: picked ? { text: picked.textContent, bg: ps.backgroundColor, edge: ps.borderTopColor, ink: ps.color } : null,
    mainBg: ms.backgroundColor, accent,
    boxW: Math.round(box.getBoundingClientRect().width),
  }
}, ACCENT)

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
/* the input's OWN save asks the same sheet — L4: its two buttons are Back / Add over the form's Cancel / Add */
await L.pic(w, `oil-${K}-0-question-at-a-save`)
{
  const f = await sheetFacts()
  ok(`OIL question at a new input's save [${K}]`, 'L4 — its two buttons', 'Back / Add (the form behind it says Add)', f.buttons.join(' / '), f.buttons.join('/') === 'Back/Add')
  ok(`OIL question at a new input's save [${K}]`, 'L3 — the title and the sentence, the words of record', 'OIL: <who>, Range brief · "This input falls on Sat 18 Jul, a non-working day (weekend/PH). Does it deserve HO, half a day of OIL?" in ordinary letters', `${f.title} · ${f.ask} · letters: ${f.caps}`,
    /^OIL: .+, Range brief$/.test(f.title) && f.ask === 'This input falls on Sat 18 Jul, a non-working day (weekend/PH). Does it deserve HO, half a day of OIL?' && f.caps === 'none')
  ok(`OIL question at a new input's save [${K}]`, 'the answers and the small print', 'Yes: credit HO · No OIL · "…so published work the same day can raise the credit."', `${f.answers.join(' · ')} · ${f.note}`,
    f.answers.join('|') === 'Yes: credit HO|No OIL' && f.note === 'The credit lands on the Leave War as an HO cell and moves the OIL balance. Hours count start to finish for the day, so published work the same day can raise the credit.')
  ok(`OIL question at a new input's save [${K}]`, 'L1 — the answers sit flat under the question', 'a row of their own: no patch, no line under it, no box round it, starting at the question\'s left edge', JSON.stringify({ rowClass: f.rowClass, rowBg: f.rowBg, rowBorder: f.rowBorder, wornSeg: f.wornSeg, boxed: f.boxed, left: f.answerLeftVsQuestion }),
    f.rowClass === 'oilconf-answers' && /rgba\(0, 0, 0, 0\)|transparent/.test(f.rowBg) && f.rowBorder === '0px' && !f.wornSeg && !f.boxed && Math.abs(f.answerLeftVsQuestion) <= 1)
  ok(`OIL question at a new input's save [${K}]`, 'L2 — the ✕', 'in the head\'s corner (its right edge within the head\'s own padding), not following the title', `${f.xGap}px from the head's right edge; ${f.titleToX}px after the title's last letter; the sheet is ${f.boxW} wide`, f.xGap <= 20 && f.titleToX > 30)
}
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
{
  const f = await sheetFacts()
  ok(`OIL question before a swap [${K}]`, 'its two buttons are its own', 'Don’t swap / Swap', f.buttons.join(' / '), f.buttons.join('/') === 'Don’t swap/Swap')
  ok(`OIL question before a swap [${K}]`, 'L1, L2 — flat answers, the ✕ in the corner', 'as at a save', JSON.stringify({ rowClass: f.rowClass, wornSeg: f.wornSeg, boxed: f.boxed, xGap: f.xGap }), f.rowClass === 'oilconf-answers' && !f.wornSeg && !f.boxed && f.xGap <= 20)
}

if (!w.phone) {
  const first = await L.focusOf(w)
  ok('OIL question', 'K7 — opens with the keyboard on…', 'its first answer ("Yes: credit HO"), nothing picked', first, /oil-yes/.test(first) && await p.locator('[data-testid="oilconf-save"]').isDisabled())
  const stops = []
  for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); stops.push((await L.focusOf(w)).split(' · ')[0]) }
  const inside = await p.evaluate(() => !!document.activeElement?.closest?.('[data-testid="oilconf"]'))
  /* from Yes: No → Don't swap → (Swap is off while unanswered) → ✕ → round to Yes */
  ok('OIL question', 'L2 — Tab, four times from the first answer', 'No OIL, then Don’t swap, then the ✕ LAST, then round to the first answer — never out of the sheet', stops.join('  |  ') + ` · still inside: ${inside}`,
    inside && /oil-no/.test(stops[0]) && /oilconf-cancel/.test(stops[1]) && /Close/.test(stops[2]) && /oil-yes/.test(stops[3]))
  /* the ring on each kind of control, with the keyboard on it */
  const rings = []
  for (const sel of ['[data-testid="oil-yes"]', '[data-testid="oilconf"] .airpop-head .x', '[data-testid="oilconf-cancel"]']) {
    await p.locator('[data-testid="oil-no"]').focus(); await p.keyboard.press('Shift+Tab')      // a key press, so the ring is the keyboard's
    await p.locator(sel).focus()
    rings.push(await p.locator(sel).evaluate(e => { const s = getComputedStyle(e); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` }))
  }
  ok('OIL question', 'K10 — the ring on an answer, the ✕ and a foot button', `the app's own: solid 2px ${ACCENT}`, rings.join('  |  '), rings.every(r => r === `solid 2px ${ACCENT}`))
  /* pick Yes by keyboard, see the main button come alive, and the picked look */
  await p.locator('[data-testid="oil-yes"]').focus(); await p.keyboard.press('Space'); await L.sleep(200)
  const live = !(await p.locator('[data-testid="oilconf-save"]').isDisabled())
  ok('OIL question', 'Space on "Yes"', 'picks it; "Swap" comes alive', `Swap is ${live ? 'live' : 'still off'}`, live)
  const f = await sheetFacts()
  ok('OIL question', 'L5 — a picked answer', `the outline look: its edge and its words ${ACCENT}, its ground NOT the main button's solid fill`, JSON.stringify(f.picked) + ` · main button ${f.mainBg}`, !!f.picked && f.picked.edge === ACCENT && f.picked.ink === ACCENT && f.picked.bg !== ACCENT && f.mainBg === ACCENT)
  await L.pic(w, `oil-${K}-3-question-answered`, { around: '[data-testid="oilconf"] .airpop-box', pad: 40 })
  await p.keyboard.press('Escape'); await L.sleep(400)
  const bar = await p.locator('[data-testid="oilbar"]').count()
  ok('OIL question', 'Escape', 'nothing is swapped; the bar stays', `sheet ${(await p.locator('[data-testid="oilconf"]').count()) ? 'OPEN' : 'closed'}; bar ${bar ? 'up' : 'MISSING'}`, !!bar && !(await p.locator('[data-testid="oilconf"]').count()))
} else {
  /* a phone: the picked look, by a finger */
  await w.press('[data-testid="oil-no"]'); await L.sleep(200)
  const f = await sheetFacts()
  ok('OIL question [phone]', 'L5 — a picked "No OIL"', 'the outline look, the same as a picked Yes', JSON.stringify(f.picked), !!f.picked && f.picked.text === 'No OIL' && f.picked.edge === ACCENT && f.picked.bg !== ACCENT)
  await L.pic(w, `oil-${K}-3-question-answered`)
  await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(400)
}
await p.waitForSelector('[data-testid="oilbar"]'); await L.sleep(900)            // the two pucks' flash has ended
await L.pic(w, `oil-${K}-4-bar-stays`)
const barBox = await p.locator('[data-testid="oilbar"]').boundingBox()
console.log('BAR', JSON.stringify(barBox), 'screen', w.S.w, w.S.h)
await L.pic(w, `oil-${K}-4c-bar-close-up`, { around: '[data-testid="oilbar"]', pad: w.phone ? 24 : 60 })
/* L6, D831, D840, D841 — THE BAR IS A BAND UNDER THE BAR IN FRONT: the last line of that bar, edge to edge, the
   failed-save warning's own height, its words and both buttons on ONE line with nothing cut, the line under it amber,
   and nothing of the page under it. `wider` asks the same in letters about a seventh wider (a stand-in for his iPhone's). */
const AMBER = 'rgba(229, 194, 74, 0.5)'
const band = (wider = false) => p.evaluate(async wider => {
  const b = document.querySelector('[data-testid="oilbar"]')
  if (wider) { b.style.letterSpacing = '.075em'; window.dispatchEvent(new Event('resize')); await new Promise(r => requestAnimationFrame(() => r(null))) }
  const r = b.getBoundingClientRect(), under = b.closest('.sb-top') || b.closest('.topbar')
  const kids = [...b.children].map(k => { const q = k.getBoundingClientRect(); return { t: k.textContent, mid: Math.round(q.top + q.height / 2), left: Math.round(q.left), right: Math.round(q.right), h: Math.round(q.height), cut: k.scrollWidth > k.clientWidth + 0.5, fs: getComputedStyle(k).fontSize } })
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  const save = document.querySelector('.topbar > .savestat.failed:not([inert]), .sb-top > .saveband'), sr = save ? save.getBoundingClientRect() : null
  return { where: under ? under.className.split(' ')[0] : 'NOWHERE', box: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth,
    lastLine: !!under && Math.abs(under.getBoundingClientRect().bottom - r.bottom) <= 1.5, oneLine: new Set(kids.map(k => k.mid)).size === 1,
    nothingCut: kids.every(k => !k.cut) && b.scrollWidth <= b.clientWidth + 0.5 && kids.every(k => k.left >= r.left && k.right <= r.right),
    kids: kids.map(k => `${k.t}:${k.left}–${k.right} h${k.h} ${k.fs}`), buttonsH: [...new Set(kids.slice(1).map(k => k.h))], fit: b.style.getPropertyValue('--oil-fit') || '1', tight: b.classList.contains('is-tight'),
    edge: under ? getComputedStyle(under).borderBottomColor : '', onTop: !!hit && (hit === b || b.contains(hit)), count: document.querySelectorAll('[data-testid="oilbar"]').length,
    save: sr ? { box: `${Math.round(sr.x)},${Math.round(sr.y)} ${Math.round(sr.width)}×${Math.round(sr.height)}`, h: Math.round(sr.height), above: sr.bottom <= r.top + 1, touching: Math.abs(sr.bottom - r.top) <= 1.5 } : null }
}, wider)
const unwide = () => p.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'); b.style.letterSpacing = ''; window.dispatchEvent(new Event('resize')) })
const bandOk = f => f.h === 36 && f.left === 0 && f.right === f.vw && f.lastLine && f.oneLine && f.nothingCut && f.buttonsH.length === 1 && f.edge === AMBER && f.onTop && f.count === 1
{
  const f = await band()
  ok(`The bar that stays [${K}]`, 'L6 — on the Scheduler Board', 'a band: the last line of the board\'s own bar, edge to edge, 36 tall, words and both buttons on ONE line, nothing cut, the line under it amber, itself on top, one bar only', f, f.where === 'sb-top' && bandOk(f))
  const g = await band(true)
  ok(`The bar that stays [${K}]`, 'D840 — the same in letters a seventh wider', 'STILL one line, 36 tall, nothing cut — its letters a step smaller if they must be', g, g.h === 36 && g.oneLine && g.nothingCut)
  await L.pic(w, `oil-${K}-4w-bar-wider-letters`)
  await unwide(); await L.sleep(150)
}
if (!w.phone) {
  const after = await L.focusOf(w)
  ok('The bar that stays', 'K8 — where the keyboard is when the bar appears', 'on "Answer OIL"', after, /oilbar-answer/.test(after))
  const ring = await p.locator('[data-testid="oilbar-answer"]').evaluate(e => { const s = getComputedStyle(e); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} offset ${s.outlineOffset}` })
  ok('The bar that stays', 'K10 — the ring on "Answer OIL"', `the app's own, set off the filled button: solid 2px ${ACCENT} offset 2px`, ring, ring === `solid 2px ${ACCENT} offset 2px`)
  await L.pic(w, `oil-${K}-5-bar-keyboard`, { around: '[data-testid="oilbar"]', pad: 60 })
  await p.keyboard.press('Tab')
  const next = await L.focusOf(w)
  ok('The bar that stays', 'Tab from "Answer OIL"', 'its OK', next, /oilbar-ok/.test(next))
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Enter'); await L.sleep(400)
  const back = await p.locator('[data-testid="oilconf"]').count()
  const inQ = await L.focusOf(w)
  ok('The bar that stays', 'Enter on "Answer OIL"', 'the question comes back, the keyboard on its first answer', `question ${back ? 'back' : 'NOT back'}; keyboard on ${inQ.split(' · ')[0]}`, !!back && /oil-yes/.test(inQ))
  if (back) { await p.keyboard.press('Escape'); await L.sleep(400) }
  const again = await L.focusOf(w)
  ok('The bar that stays', 'Escape on the question, a second time', 'the bar again, the keyboard on "Answer OIL" again', `bar ${(await p.locator('[data-testid="oilbar"]').count()) ? 'up' : 'MISSING'}; keyboard on ${again.split(' · ')[0]}`, /oilbar-answer/.test(again))
  const esc0 = await p.locator('[data-testid="oilbar"]').count()
  await p.keyboard.press('Escape'); await L.sleep(300)
  const esc1 = await p.locator('[data-testid="oilbar"]').count()
  ok('The bar that stays', 'K9 — Escape, with the keyboard on the bar', 'closes the bar, as OK does', `bar before ${esc0 ? 'up' : 'gone'}, after ${esc1 ? 'still up' : 'gone'}`, !!esc0 && !esc1)
  const swapped = await p.evaluate(di => window.DAYS[di].ground.map(g => `${g.prog}:${g.who}`).join(' | '), SAT_DI)
  ok('The bar that stays', 'after all of it, nothing was swapped', 'Range brief still holds its own man', swapped, !/Range brief:nick/i.test(swapped))
}
/* ---- THE BAND ON EDIT SCHEDULE (D831, D841) ----
   A fresh question is left unanswered again (the bar was closed above on a desktop), the board is closed — the bar
   stays, nothing was swapped — and the top bar carries it. (The bar WITH A FAILED SAVE ABOVE IT is dl-band-built.mjs:
   this script's world is the app's "start fresh" one, which keeps nothing, so no save can fail in it.) */
if (!(await p.locator('[data-testid="oilbar"]').count())) {
  const fb2 = await p.locator(from).boundingBox(), tb2 = await p.locator(to).boundingBox()
  await p.mouse.move(fb2.x + fb2.width / 2, fb2.y + fb2.height / 2); await p.mouse.down()
  await p.mouse.move(fb2.x + fb2.width / 2 + 6, fb2.y + fb2.height / 2 + 6, { steps: 3 })
  await p.mouse.move(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2, { steps: 14 })
  await p.mouse.move(tb2.x + tb2.width / 2 + 1, tb2.y + tb2.height / 2 + 1)
  await p.mouse.up()
  await p.waitForSelector('[data-testid="oilconf-lead"]'); await L.sleep(300)
  await w.press('[data-testid="oilconf-cancel"]')
  await p.waitForSelector('[data-testid="oilbar"]'); await L.sleep(900)
}
await p.evaluate(() => { const b = document.querySelector('#sbDone') || document.querySelector('#sbClose'); b.click() })
await L.sleep(700)
await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300)
{
  const f = await band()
  const page = await p.evaluate(() => { const tb = document.querySelector('#shell .topbar'), nxt = document.querySelector('#shell .page.on, #shell .page:not([hidden])'); return { barBottom: Math.round(tb.getBoundingClientRect().bottom), cls: tb.className } })
  ok(`The bar that stays [${K}]`, 'D831 — on Edit Schedule, the board closed', 'the bar is still up (nothing was swapped), now the last line of the TOP bar: edge to edge, 36 tall, one line, nothing cut, the line under it amber — not Edit Schedule\'s cyan (D841)', { ...f, page }, f.where === 'topbar' && bandOk(f) && /oil-waiting/.test(page.cls))
  await L.pic(w, `oil-${K}-8-week-band`)
  if (w.phone) {
    const g = await band(true)
    ok(`The bar that stays [${K}]`, 'D840 — on Edit Schedule in letters a seventh wider', 'STILL one line, nothing cut', g, g.h === 36 && g.oneLine && g.nothingCut)
    await L.pic(w, `oil-${K}-8w-week-band-wider-letters`)
    await unwide(); await L.sleep(150)
  }
  /* what stood under the top bar has moved down by the band, not under it: the element just below the band is not the band */
  const below = await p.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.bottom + 6); return { tag: e ? e.tagName : null, inBand: !!e && !!e.closest('[data-testid="oilbar"]'), y: Math.round(b.bottom) } })
  ok(`The bar that stays [${K}]`, 'nothing is under it', 'just below the band the page begins — the band covers none of it', below, !below.inBand && !!below.tag)
}
/* OK closes it; the top bar gives the line back and Edit Schedule's own cyan edge returns */
await w.press('[data-testid="oilbar-ok"]'); await L.sleep(400)
{
  const st = await p.evaluate(() => { const tb = document.querySelector('#shell .topbar'); return { bars: document.querySelectorAll('[data-testid="oilbar"]').length, cls: tb.className, edge: getComputedStyle(tb).borderBottomColor } })
  ok(`The bar that stays [${K}]`, 'OK closes it', 'the bar is gone, the top bar gives its line back, and Edit Schedule\'s own cyan edge is back', st, st.bars === 0 && !/oil-waiting/.test(st.cls) && st.edge === 'rgba(59, 198, 232, 0.5)')
}
await L.close(w)
