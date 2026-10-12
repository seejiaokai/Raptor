// RX2-10 (the question on a sideways phone, 844 x 390 by touch) — a new world. Setup at the upright phone size, then turned sideways.
import { launch, world, bye, SAT, sleep } from './on-RX2-lib.mjs'
const SAT_DI = 5
const browser = await launch()
const w = await world(browser, { tag: 'R10', size: 'l390' }); const { page, tid, VW, VH } = w
await page.setViewportSize({ width: 390, height: 844 })
const iid = await w.fileIt(SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
await page.evaluate(() => window.go('editsched'))
await page.waitForTimeout(500)
await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
await page.waitForTimeout(400)
await page.locator(`#sbBoard [data-gradd="${SAT_DI}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
await page.waitForTimeout(300)
const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
await type(`gr:${SAT_DI}.1.prog`, 'Hangar open day')
await type(`gr:${SAT_DI}.1.str`, '13:00')
await type(`gr:${SAT_DI}.1.end`, '15:00')
await page.evaluate(di => { window.fillSlot(`g:${di}.1.+`, 'nick'); window.afterSchedMutate() }, SAT_DI)   // SETUP (allowed)
await page.waitForTimeout(400)
await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
// turn the phone on its side
await page.setViewportSize({ width: VW, height: VH }); await sleep(2500)
const groundNow = () => page.evaluate(di => (window.DAYS[di].ground || []).map(r => { const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''; return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}` }), SAT_DI)
const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#sbUndo'); const v = b && b.getBoundingClientRect().width ? b : document.querySelector('#undoBtn'); return v ? `${v.disabled ? 'off' : 'on'}|${v.title}` : '' })
const before = await groundNow(); const undo0 = await undoLabel()
w.say('before', before)
// frame the rows: put Ranger's puck at about y=262 so both pucks are well inside the short screen
for (let k = 0; k < 3; k++) {
  await page.locator(puckSel(0)).first().evaluate(e => {
    let sc = e.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement
    const y = e.getBoundingClientRect().top
    if (sc) sc.scrollTop += (y - 262)
  }); await sleep(500)
}
await sleep(800)
w.say('pucks', { ranger: await w.measure(puckSel(0)), tally: await w.measure(puckSel(1)) })
await w.shot('R10-0-board-sideways')
await sleep(500)
const f = await w.centreOf(puckSel(1)), t = await w.centreOf(puckSel(0))
w.say('from/to', [f, t])
await w.touchDrag(f, t, { hold: 600, afterHold: async () => { await w.shot('R10-0c-held') }, beforeEnd: async () => { await w.shot('R10-0d-over-target') } }); w.say('ground after drag', await groundNow())
const R = {}
R.up = await tid('oilconf').count()
w.say('question up', R.up)
if (R.up) {
  R.lead = (await tid('oilconf-lead').innerText()).trim()
  R.cancelText = await tid('oilconf-cancel').innerText(); R.saveText = await tid('oilconf-save').innerText()
  R.saveDisabled = await tid('oilconf-save').isDisabled()
  R.nothingMoved = JSON.stringify(await groundNow()) === JSON.stringify(before)
  R.undoSame = (await undoLabel()) === undo0
  // geometry: card box, buttons, against card and screen
  R.geo = await page.evaluate(([VW, VH]) => {
    const q = document.querySelector('[data-testid="oilconf"]')
    const card = q.querySelector('.airpop-box')
    const c = card.getBoundingClientRect(), b1 = q.querySelector('[data-testid="oilconf-cancel"]').getBoundingClientRect(), b2 = q.querySelector('[data-testid="oilconf-save"]').getBoundingClientRect()
    const hit = el => { const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === el || el.contains(h) }
    const inCard = r => r.left >= c.left - 0.5 && r.right <= c.right + 0.5 && r.top >= c.top - 0.5 && r.bottom <= c.bottom + 0.5
    const inScr = r => r.left >= -0.5 && r.top >= -0.5 && r.right <= VW + 0.5 && r.bottom <= VH + 0.5
    const R = r => ({ x: Math.round(r.left), y: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) })
    // the card's scrolling part: any descendant with overflow auto/scroll and overflow content
    const sc = [...card.querySelectorAll('*'), card].find(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2)
    return { card: R(c), cancel: R(b1), save: R(b2), cardInScreen: inScr(c), cancelInCard: inCard(b1), saveInCard: inCard(b2), cancelInScreen: inScr(b1), saveInScreen: inScr(b2), cancelOnTop: hit(q.querySelector('[data-testid="oilconf-cancel"]')), saveOnTop: hit(q.querySelector('[data-testid="oilconf-save"]')), sameRow: Math.abs(b1.top - b2.top) < 2, scroller: sc ? { cls: sc.className.toString().slice(0, 30), sh: sc.scrollHeight, ch: sc.clientHeight, top: Math.round(sc.getBoundingClientRect().top), bottom: Math.round(sc.getBoundingClientRect().bottom) } : null, buttonsBelowWords: sc ? (sc.getBoundingClientRect().bottom <= Math.min(b1.top, b2.top) + 1) : null, innerH: innerHeight, innerW: innerWidth }
  }, [VW, VH])
  w.say('question geometry', R.geo)
  await w.hush(); await w.shot('R10-1-question')
  // scroll the card's words to the end and measure again
  R.geoEnd = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="oilconf"] .airpop-box')
    const sc = [...card.querySelectorAll('*'), card].find(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2)
    if (!sc) return null
    sc.scrollTop = sc.scrollHeight
    const c = card.getBoundingClientRect(), b1 = card.querySelector('[data-testid="oilconf-cancel"]').getBoundingClientRect(), b2 = card.querySelector('[data-testid="oilconf-save"]').getBoundingClientRect()
    return { scrollTop: Math.round(sc.scrollTop), cancel: [Math.round(b1.top), Math.round(b1.bottom)], save: [Math.round(b2.top), Math.round(b2.bottom)], cardBottom: Math.round(c.bottom), innerH: innerHeight }
  })
  w.say('after scrolling the card words to the end', R.geoEnd)
  await w.shot('R10-2-question-words-scrolled')
  await sleep(200)
  // tap Don't swap (a real finger at its centre)
  const m = await w.measureT('oilconf-cancel')
  await page.touchscreen.tap(m.x + m.w / 2, m.y + m.h / 2); await sleep(150)
  const lit = await page.evaluate(sels => sels.map(q => { const p = document.querySelector(q); const host = p && (p.closest('.seat') || p); return !!host && host.classList.contains('lift-land') }), [puckSel(0), puckSel(1)])
  R.lit = lit
  await w.unhush()
  await sleep(300)
  R.bar = { text: await tid('oilbar-text').innerText().catch(() => ''), answer: await tid('oilbar-answer').innerText().catch(() => ''), ok: await tid('oilbar-ok').innerText().catch(() => '') }
  R.barGeo = await page.evaluate(([VW, VH]) => {
    const bar = document.querySelector('[data-testid="oilbar"]'); if (!bar) return null
    const a = document.querySelector('[data-testid="oilbar-answer"]').getBoundingClientRect(), o = document.querySelector('[data-testid="oilbar-ok"]').getBoundingClientRect(), b = bar.getBoundingClientRect()
    const hit = el => { const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === el || el.contains(h) }
    return { bar: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], answer: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)], ok: [Math.round(o.left), Math.round(o.top), Math.round(o.right), Math.round(o.bottom)], insideScreen: b.left >= -0.5 && b.top >= -0.5 && b.right <= VW + 0.5 && b.bottom <= VH + 0.5, sideBySide: Math.abs(a.top - o.top) < 2 && a.right <= o.left + 1, barOnTop: hit(bar), answerOnTop: hit(document.querySelector('[data-testid="oilbar-answer"]')), okOnTop: hit(document.querySelector('[data-testid="oilbar-ok"]')) }
  }, [VW, VH])
  w.say('bar', { text: R.bar, geo: R.barGeo, lit })
  await w.shot('R10-3-bar')
  R.nothingMovedAfter = JSON.stringify(await groundNow()) === JSON.stringify(before)
  R.undoSameAfter = (await undoLabel()) === undo0
  R.oil = await w.state([iid])
}
R.errors = await bye(w)
w.say('R', R)
await browser.close()
import { writeFileSync } from 'node:fs'
writeFileSync('docs/handpass/parts/on-RX2-r10.json', JSON.stringify(R, null, 1))
