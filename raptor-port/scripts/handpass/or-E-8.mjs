// E8c: a FILER (Saber) of an input for SEVERAL people with an unanswered OIL question AND an unread notice (Tally takes himself out), on the phone.
//  Saber files a Saturday Training for Ranger alone (Yes); drags Tally from the board's crew drawer onto Ranger's lone puck (replace; the question opens -> Yes);
//  Tally (the only named person, in place) re-times it -> a notice for Saber; Saber drags Hex onto Tally's lone puck (replace; the question opens -> closed unanswered).
import { world, sleep, PHONE, browser, summarise, touchDrag, toBoardSec, openDrawer, drawerName } from './or-E-lib.mjs'
const w = await world({ size: PHONE, touch: true, who: 'ad', pass: 'a', clock: '2026-06-22T09:00:00', tag: 'E8c' })
const { page, press } = w
const oilState = () => page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return s ? { buttons: [...s.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || b.id || b.className) + ':' + b.innerText.replace(/\s+/g, ' ').slice(0, 30)), text: s.innerText.replace(/\s+/g, ' ').slice(0, 160) } : null })
const closeOil = async () => { const s = page.locator('[data-testid="oilconf"]'); if (!(await s.count())) return false; await press(s.locator('button.x').first()); await sleep(400); return !(await s.count()) }
const answerOil = async (how = 'yes') => { const s = page.locator('[data-testid="oilconf"]'); await press(s.locator(`[data-testid="oil-${how}"]`).first()); await sleep(300); await press(s.locator('[data-testid="oilconf-save"]')); await sleep(600) }
const rowTarget = title => page.evaluate(title => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].filter(e => e.offsetParent).find(r => (r.querySelector('textarea.ain') || {}).value?.toLowerCase() === title); const p = r.querySelector('.ppl .puck'); const b = p.getBoundingClientRect(); return { x: b.x + 20, y: b.y + b.height / 2 } }, title.toLowerCase())
const raw = () => page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Sat X'); return { people: r.people.map(e => (window.PEOPLE[e.p] || {}).cs), by: r.by, s: r.s, e: r.e, oil: Object.fromEntries(Object.entries(r).filter(([k]) => /oil/i.test(k))), people_oil: r.people.map(e => [(window.PEOPLE[e.p] || {}).cs, e.oil ?? null]) } })
const addTarget = title => page.evaluate(title => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].filter(e => e.offsetParent).find(r => (r.querySelector('textarea.ain') || {}).value?.toLowerCase() === title); const p = r.querySelector('.ppl .addz') || r.querySelector('.ppl'); const b = p.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, cls: p.className } }, title.toLowerCase())
const joinOnto = async (cs) => {
  await w.openBoard(5); await toBoardSec(page, 'ground', 5); await sleep(300); await openDrawer(page)
  const nm = await drawerName(page, cs); const from = await nm.boundingBox(); const tgt = await addTarget('Sat X'); w.say('join target', JSON.stringify(tgt))
  await touchDrag(page, { x: from.x + from.width / 2, y: from.y + from.height / 2 }, tgt)
}
const dragOnto = async (cs) => {
  await w.openBoard(5); await toBoardSec(page, 'ground', 5); await sleep(300); await openDrawer(page)
  const nm = await drawerName(page, cs); const from = await nm.boundingBox(); const tgt = await rowTarget('Sat X')
  await touchDrag(page, { x: from.x + from.width / 2, y: from.y + from.height / 2 }, tgt)
}
try {
  await w.fileIt({ day: '2026-07-18', pick: ['Ranger'], title: 'Sat X', from: '09:00', to: '10:00', kind: 'Training', oil: 'yes' })
  w.say('E8c filed', JSON.stringify(await raw()))
  await dragOnto('Tally')
  w.say('E8c replace toast:', await w.note(), '| record', JSON.stringify(await raw()), '| question', JSON.stringify(await oilState()))
  w.say('E8c closed unanswered:', await closeOil(), JSON.stringify(await raw()))
  for (const cs of ['Hex', 'Anvil']) {
    await joinOnto(cs)
    w.say('E8c join ' + cs + ' toast:', await w.note(), '| record', JSON.stringify(await raw()), '| question', JSON.stringify(await oilState()))
    if (await page.locator('[data-testid="oilconf"]').count()) w.say('E8c closed unanswered:', await closeOil())
  }
  await w.shot('e8-03-three-people')
  await w.closeBoard().catch(() => {})
  w.say('E8c Saber bell (question waiting, no notice yet):', JSON.stringify(await w.bellState()))
  // Tally, in place, takes himself out
  const tid = await w.csId('Tally')
  await page.evaluate(id => { window.raptorMe(id); window.raptorRole('member') }, tid); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  await w.toMonth(); await w.openDay('2026-07-18')
  const rec = await w.rec('Sat X')
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${rec.iid}"]`).first()); await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await sleep(500)
  const to = page.locator('[data-testid="inped-takeout"]').first()
  w.say('E8c Tally has Take me out:', await to.count())
  await to.scrollIntoViewIfNeeded(); await press(to); await sleep(700)
  w.say('E8c Tally took himself out: toast', await w.note(), '| record', JSON.stringify(await raw()), '| any confirm sheet:', await page.evaluate(() => [...document.querySelectorAll('[role="dialog"], [data-testid$="conf"]')].filter(e => e.offsetParent).map(e => (e.getAttribute('data-testid') || e.className) + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 120)).join(' | ')))
  await w.shot('e8-04-tally-confirm')
  { const btns = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(b => b.offsetParent && /take me out|stay in/i.test(b.innerText)).map(b => (b.getAttribute('data-testid') || b.id || b.className) + ':' + b.innerText.trim())); w.say('E8c confirm buttons', JSON.stringify(btns)) }
  await press(page.locator('#inpEditPop button', { hasText: /^Take me out$/ }).last()); await sleep(800)
  w.say('E8c Tally confirmed: toast', await w.note(), '| record', JSON.stringify(await raw()))
  await w.shot('e8-04-tally-took-out')
  const conf = page.locator('[data-testid="takeout-confirm"], [data-testid="inped-takeout-confirm"], [data-testid="docconf"]').first()
  if (await conf.count()) { await press(conf); await sleep(500) }
  if (await page.locator('#inpEditPop:visible').count()) { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(250) } }
  await w.closeDay().catch(() => {})
  w.say('E8c notices for Saber', JSON.stringify(await page.evaluate(() => (window.NOTICES || []).filter(n => n.to === 'stiff').map(n => [n.by, (n.what || []).map(p => p.k).join('+'), n.read]))))
  await page.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  w.say('E8c record now', JSON.stringify(await raw()))
  w.say('E8c Saber bell: question + notice', JSON.stringify(await w.bellState()))
  await w.shot('e8-05-saber-bell')
  await press(await w.bell()); await sleep(600)
  const q1 = await oilState()
  w.say('E8c first tap: question?', JSON.stringify(q1), '| list open:', await page.locator('.bell-list').count())
  await w.shot('e8-06-first-tap'); w.res('e8_first_tap', { oil: q1, listOpen: await page.locator('.bell-list').count() })
  if (q1) {
    await answerOil('yes')
    w.say('E8c answered: sheet', await page.locator('[data-testid="oilconf"]').count(), JSON.stringify(await raw()), await w.note(), '| bell', JSON.stringify(await w.bellState()))
    w.say('E8c after answering, what is standing:', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"], #inpEditPop')].filter(e => e.offsetParent).map(e => e.getAttribute('data-testid') || e.id).join(',')))
    await w.shot('e8-06b-after-answer')
    for (let k = 0; k < 3; k++) { const x = page.locator('[data-testid="win-inputedit-x"]:visible, [data-testid="win-inputsday-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(300) } }
    await press(await w.bell()); await sleep(500)
    w.say('E8c next tap: list open:', await page.locator('.bell-list').count(), '| sheet:', await page.locator('[data-testid="oilconf"]').count())
    const fl = await w.shotList('e8-07-next-tap-list'); w.say('E8c the list', JSON.stringify(summarise(fl))); w.res('e8_second_tap_list', summarise(fl))
  } else {
    const fl = await w.shotList('e8-07-first-tap-list'); w.say('E8c the list (first tap)', JSON.stringify(summarise(fl)))
  }
  w.say('errors', JSON.stringify(w.errors)); w.res('e8c_errors', w.errors)
} catch (e) { w.say('E8c SCRIPT FAILED', String(e).slice(0, 800)); await w.shot('e8c-zz-fail').catch(() => {}) }
await browser.close()
