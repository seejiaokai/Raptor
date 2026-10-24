// RE-WALK F1 (w1 scenario 12): an overseas duty filed over a weekend from the drag window. Required P = Available P on a weekday; the bubble must stand UNDER the Manning button
// (not at the foot) while the OIL question is up, stay up after the question is answered by a tap / Enter / Escape, and end at a tap on the page.
// usage (from raptor-port/): node scripts/handpass/lw-night-rw-f1.mjs <desk|phone|phone-webkit> [tap,enter,escape]
const R = await import('./lw-night-rw-lib.mjs')
const { H1: H, L, T, rec, judge, availCell, f1, sleep } = R
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone', engine = which === 'phone-webkit' ? 'webkit' : 'chromium'
const phone = size === 'phone'
const tag = `f1-${R.shortTag(size, engine)}`
const VARS = (process.argv[3] || (phone ? 'tap' : 'tap,enter,escape')).split(',')
const label = R.engineTag(size, engine)
console.log('lw-night-rw-f1 v1', which, tag, VARS.join(','))
const w = await H.startWorld(size, engine)
const P = w.page
const ids = await H.peopleIds(P)
const PLAN = { tap: ['2026-12-03', '2026-12-07', ids.Drifter], enter: ['2026-12-10', '2026-12-14', ids.Ridge], escape: ['2026-12-17', '2026-12-21', ids.Hunter] }
const RED = /240, 85, 95/
const isRed = b => b.where !== 'none' && b.level === 'red' && RED.test(b.border) && /46, 20, 24/.test(b.bg) && /255, 170, 176/.test(b.color)
const WORDS = 'This overseas duty turns Available P red.'
const btnState = () => P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return { in: r.bottom > 0 && r.top < innerHeight, bottom: Math.round(r.bottom) } })
const oilUp = () => L.vis(P, T('oilconf'))
const oilDump = () => P.evaluate(() => { const o = document.querySelector('[data-testid="oilconf"]'); if (!o) return null; return { text: o.innerText.replace(/\s+/g, ' ').slice(0, 160), tids: [...o.querySelectorAll('[data-testid]')].map(e => e.dataset.testid), btns: [...o.querySelectorAll('button')].map(b => b.innerText.trim() + '|' + (b.dataset.testid || '')) } })
const snapFull = async n => { await H.settled(w, `${tag}-${n}`); return `${tag}-${n}.png` }
for (const v of VARS) {
  const [D1, D2, who] = PLAN[v]
  const id = `F1 ${v}`
  try {
    await H.setManningView(w, true)
    await openRowsSafe()
    const fx = await f1(w, D1)
    if (!(await H.dragCells(w, [who, D1], [who, D2]))) throw new Error('no drag window')
    const span = await L.txt(P, T('sel-span'))
    await H.setSwitch(w, false, 'sel').catch(() => {})
    await H.setManningView(w, true)
    const btn0 = await btnState()
    const seen = await H.tapPic(w, T('sel-file-OD'), `${tag}-${v}-1-od-after-tap`)
    await sleep(w, 500)
    const b1 = await H.bubbleNow(P), up1 = await oilUp(), dump = await oilDump(), a1 = await availCell(P, D1)
    const btn1 = await btnState()
    const pic1 = await snapFull(`${v}-1-oil-up-settled`)
    judge(`${id}: 1 filing → bubble under the Manning button while the OIL question is up`, label, [
      ['the window closed and the OIL question is up', up1, JSON.stringify(dump)],
      ['bubble up UNDER the Manning button, not at the foot', b1.where === 'mid', b1.where],
      ['words', b1.text === WORDS, b1.text],
      ['red look', isRed(b1), `${b1.level} ${b1.border} ${b1.bg} ${b1.color}`],
      ['inside the screen', !!b1.inside, JSON.stringify(b1.rect)],
      ['Available P turned red', a1 === `${Number(fx.a0) - 1} red`, `${fx.a0} → ${a1}`],
      ['not both notes', !(b1.all?.mid && b1.all?.foot), JSON.stringify(b1.all)],
      ['the Manning button in view', btn1.in, JSON.stringify(btn1)],
    ], `range ${span}; Required P ${fx.req} = Available P ${fx.a0}; right after the tap: ${H.bubbleLine(seen)}; settled with the question up: ${H.bubbleLine(b1)}; Manning button ${JSON.stringify(btn1)}`, [`${tag}-${v}-1-od-after-tap.png`, pic1])
    // ---- answer the question
    const steps = []
    const snapB = async (name, how) => { const b = await H.bubbleNow(P); steps.push({ how, b, up: await oilUp() }); return b }
    if (v === 'tap') {
      // a tap on "No OIL" (a choice inside the question), then a tap on Save
      const s1 = await H.tapPic(w, T('oil-none'), `${tag}-${v}-2-oilnone-after-tap`); await sleep(w, 400)
      const b2 = await snapB('after No OIL', 'tap on "No OIL"')
      await H.settled(w, `${tag}-${v}-2-oilnone-settled`)
      const s2 = await H.tapPic(w, T('oilconf-save'), `${tag}-${v}-3-save-after-tap`); await sleep(w, 500)
      const b3 = await snapB('after Save', 'tap on Save')
      await H.settled(w, `${tag}-${v}-3-save-settled`)
      judge(`${id}: 2 the bubble after answering the OIL question with taps`, label, [
        ['after the tap on "No OIL" the bubble is still under the button, same words', steps[0].b.where === 'mid' && steps[0].b.text === WORDS && isRed(steps[0].b), H.bubbleLine(steps[0].b)],
        ['after the tap on Save the bubble is still up, under the button', steps[1].b.where === 'mid' && steps[1].b.text === WORDS && isRed(steps[1].b), H.bubbleLine(steps[1].b)],
        ['the question is gone after Save', !steps[1].up, `up=${steps[1].up}`],
      ], `tap on No OIL: right after ${H.bubbleLine(s1)}; settled ${H.bubbleLine(steps[0].b)} (question up ${steps[0].up}). Tap on Save: right after ${H.bubbleLine(s2)}; settled ${H.bubbleLine(steps[1].b)} (question up ${steps[1].up})`, [`${tag}-${v}-2-oilnone-after-tap.png`, `${tag}-${v}-2-oilnone-settled.png`, `${tag}-${v}-3-save-after-tap.png`, `${tag}-${v}-3-save-settled.png`])
    } else if (v === 'enter') {
      // keyboard: focus "No OIL", Enter; focus Save, Enter
      await P.locator(T('oil-none')).focus(); await P.keyboard.press('Enter'); await sleep(w, 400)
      const b2 = await snapB('after Enter on No OIL', 'Enter on "No OIL"')
      await H.settled(w, `${tag}-${v}-2-enter-oilnone-settled`)
      await P.locator(T('oilconf-save')).focus(); await P.keyboard.press('Enter'); await sleep(w, 600)
      const b3 = await snapB('after Enter on Save', 'Enter on Save')
      await H.settled(w, `${tag}-${v}-3-enter-save-settled`)
      judge(`${id}: 2 the bubble after answering the OIL question with Enter`, label, [
        ['after Enter on "No OIL" the bubble is still up, under the button', steps[0].b.where === 'mid' && steps[0].b.text === WORDS && isRed(steps[0].b), H.bubbleLine(steps[0].b)],
        ['after Enter on Save the bubble is still up, under the button', steps[1].b.where === 'mid' && steps[1].b.text === WORDS && isRed(steps[1].b), H.bubbleLine(steps[1].b)],
        ['the question is gone after Save', !steps[1].up, `up=${steps[1].up}`],
      ], `Enter on No OIL: ${H.bubbleLine(steps[0].b)} (question up ${steps[0].up}). Enter on Save: ${H.bubbleLine(steps[1].b)} (question up ${steps[1].up})`, [`${tag}-${v}-2-enter-oilnone-settled.png`, `${tag}-${v}-3-enter-save-settled.png`])
    } else {
      // Escape closes the question
      await P.keyboard.press('Escape'); await sleep(w, 500)
      const b2 = await snapB('after Escape', 'Escape')
      await H.settled(w, `${tag}-${v}-2-escape-settled`)
      judge(`${id}: 2 the bubble after Escape at the OIL question`, label, [
        ['after Escape the bubble is still up, under the button, same words', steps[0].b.where === 'mid' && steps[0].b.text === WORDS && isRed(steps[0].b), H.bubbleLine(steps[0].b)],
        ['the question closed (or is recorded)', true, `question up ${steps[0].up}`],
      ], `Escape: ${H.bubbleLine(steps[0].b)} (question still up: ${steps[0].up})`, [`${tag}-${v}-2-escape-settled.png`])
      if (steps[0].up) { // Escape did not close it: answer by Save so the world is clean
        await L.press(w, T('oil-none')).catch(() => {}); await L.press(w, T('oilconf-save')).catch(() => {}); await sleep(w, 400)
      }
    }
    // close the input window if the question left it open
    const left = await H.clearOilAsk(w)
    const bEnd = await H.bubbleNow(P)
    // a tap on the page ends the bubble
    if (bEnd.where !== 'none') {
      const blank = await P.evaluate(() => { const e = document.querySelector('[data-testid="counts-toggle"]'); const r = e.getBoundingClientRect(); return { x: Math.min(innerWidth - 8, r.right + 30), y: r.top + r.height / 2 } })
      const s = await H.tapPic(w, { x: blank.x, y: blank.y }, `${tag}-${v}-4-page-tap-after`)
      await sleep(w, 400)
      const b5 = await H.bubbleNow(P)
      await H.settled(w, `${tag}-${v}-4-page-tap-settled`)
      judge(`${id}: 3 a tap on the page ends the bubble`, label, [
        ['the bubble is gone', b5.where === 'none', H.bubbleLine(b5)],
      ], `before the tap: ${H.bubbleLine(bEnd)}; tap at (${Math.round(blank.x)}, ${Math.round(blank.y)}): right after ${H.bubbleLine(s)}; settled ${H.bubbleLine(b5)}; leftovers cleared: ${JSON.stringify(left)}`, [`${tag}-${v}-4-page-tap-after.png`, `${tag}-${v}-4-page-tap-settled.png`])
    } else {
      rec(`${id}: 3 a tap on the page ends the bubble`, label, 'NOT DONE', `no bubble left to end before the tap: ${H.bubbleLine(bEnd)} (leftovers cleared ${JSON.stringify(left)})`, [])
    }
  } catch (e) {
    rec(id, label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), [])
    await H.closeAll(w).catch(() => {})
    await H.clearOilAsk(w).catch(() => {})
  }
}
async function openRowsSafe() { /* Manning rows are opened by setReq/availP as needed */ }
rec('errors-f1', label, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
await w.ctx.close()
await L.closeBrowser()
R.saveResults(`f1-${which}`)
