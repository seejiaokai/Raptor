// E8b: a FILER (Saber) with an unanswered OIL question AND an unread notice, on the phone, reached only through the app's own controls.
//  Saber files a Saturday Training for Ranger alone (Yes); drags Tally from the board's crew drawer onto Ranger's lone puck (replace; the question opens -> Yes);
//  Tally (the only named person, in place) re-times it -> a notice for Saber; Saber drags Hex onto Tally's lone puck (replace; the question opens -> closed unanswered).
import { world, sleep, PHONE, browser, summarise, touchDrag, toBoardSec, openDrawer, drawerName } from './or-E-lib.mjs'
const w = await world({ size: PHONE, touch: true, who: 'ad', pass: 'a', clock: '2026-06-22T09:00:00', tag: 'E8b' })
const { page, press } = w
const oilState = () => page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return s ? { buttons: [...s.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || b.id || b.className) + ':' + b.innerText.replace(/\s+/g, ' ').slice(0, 30)), text: s.innerText.replace(/\s+/g, ' ').slice(0, 160) } : null })
const closeOil = async () => { const s = page.locator('[data-testid="oilconf"]'); if (!(await s.count())) return false; await press(s.locator('button.x').first()); await sleep(400); return !(await s.count()) }
const answerOil = async (how = 'yes') => { const s = page.locator('[data-testid="oilconf"]'); await press(s.locator(`[data-testid="oil-${how}"]`).first()); await sleep(300); await press(s.locator('[data-testid="oilconf-save"]')); await sleep(600) }
const rowTarget = title => page.evaluate(title => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].filter(e => e.offsetParent).find(r => (r.querySelector('textarea.ain') || {}).value?.toLowerCase() === title); const p = r.querySelector('.ppl .puck'); const b = p.getBoundingClientRect(); return { x: b.x + 20, y: b.y + b.height / 2 } }, title.toLowerCase())
const raw = () => page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Sat X'); return { people: r.people.map(e => (window.PEOPLE[e.p] || {}).cs), by: r.by, s: r.s, e: r.e, oil: Object.fromEntries(Object.entries(r).filter(([k]) => /oil/i.test(k))), people_oil: r.people.map(e => [(window.PEOPLE[e.p] || {}).cs, e.oil ?? null]) } })
const dragOnto = async (cs) => {
  await w.openBoard(5); await toBoardSec(page, 'ground', 5); await sleep(300); await openDrawer(page)
  const nm = await drawerName(page, cs); const from = await nm.boundingBox(); const tgt = await rowTarget('Sat X')
  await touchDrag(page, { x: from.x + from.width / 2, y: from.y + from.height / 2 }, tgt)
}
try {
  await w.fileIt({ day: '2026-07-18', pick: ['Ranger'], title: 'Sat X', from: '09:00', to: '10:00', kind: 'Training', oil: 'yes' })
  w.say('E8b filed', JSON.stringify(await raw()))
  await dragOnto('Tally')
  w.say('E8b replace #1 toast:', await w.note(), '| record', JSON.stringify(await raw()), '| question', JSON.stringify(await oilState()))
  await answerOil('yes'); w.say('E8b answered Yes: sheet', await page.locator('[data-testid="oilconf"]').count(), JSON.stringify(await raw()))
  await w.closeBoard().catch(() => {})
  // Tally, in place, re-times it
  const tid = await w.csId('Tally')
  await page.evaluate(id => { window.raptorMe(id); window.raptorRole('member') }, tid); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  await w.toMonth(); await w.openDay('2026-07-18')
  const rec = await w.rec('Sat X')
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${rec.iid}"]`).first()); await page.waitForSelector('#inpEditPop #inpEditStart', { timeout: 5000 }); await sleep(300)
  await page.locator('#inpEditPop #inpEditStart').fill('11:00'); await page.locator('#inpEditPop #inpEditEnd').fill('12:00')
  await press(page.locator('#inpEditSave')); await sleep(600)
  w.say('E8b Tally saved: question', JSON.stringify(await oilState()), '| record', JSON.stringify(await raw()), await w.note())
  if (await page.locator('[data-testid="oilconf"]').count()) await answerOil('yes')
  if (await page.locator('#inpEditPop:visible').count()) { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(250) } }
  await w.closeDay().catch(() => {})
  w.say('E8b notices for Saber', JSON.stringify(await page.evaluate(() => (window.NOTICES || []).filter(n => n.to === 'stiff').map(n => [n.by, (n.what || []).map(p => p.k).join('+'), n.read]))))
  // Saber again: replace Tally with Hex -> the question opens -> closed unanswered
  await page.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await sleep(600)
  await dragOnto('Hex')
  w.say('E8b replace #2 toast:', await w.note(), '| record', JSON.stringify(await raw()), '| question', JSON.stringify(await oilState()))
  await w.shot('e8-03-replace-question')
  const c = await closeOil(); w.say('E8b closed unanswered:', c, '| sheet now', await page.locator('[data-testid="oilconf"]').count(), '| record', JSON.stringify(await raw()), '| any dialog/sheet standing:', await page.evaluate(() => [...document.querySelectorAll('[role="dialog"], .win, [data-testid^="win-"], [data-testid="oilconf"]')].filter(e => e.offsetParent && !e.closest('#schedBoard')).map(e => e.getAttribute('data-testid') || e.className).slice(0, 5).join(',')))
  await w.shot('e8-04-after-close')
  await w.closeBoard().catch(() => {})
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  w.say('E8b who am I', await page.evaluate(() => (window.PEOPLE[window.ME] || {}).cs || String(window.ME)))
  w.say('E8b Saber bell: question + notice', JSON.stringify(await w.bellState()))
  await w.shot('e8-05-saber-bell')
  await press(await w.bell()); await sleep(600)
  const q1 = await oilState()
  w.say('E8b first tap: question?', JSON.stringify(q1), '| list open:', await page.locator('.bell-list').count())
  await w.shot('e8-06-first-tap'); w.res('e8_first_tap', { oil: q1, listOpen: await page.locator('.bell-list').count() })
  if (q1) {
    await answerOil('yes')
    w.say('E8b answered: sheet', await page.locator('[data-testid="oilconf"]').count(), JSON.stringify(await raw()), await w.note(), '| bell', JSON.stringify(await w.bellState()))
    await press(await w.bell()); await sleep(500)
    w.say('E8b next tap: list open:', await page.locator('.bell-list').count(), '| sheet:', await page.locator('[data-testid="oilconf"]').count())
    const fl = await w.shotList('e8-07-next-tap-list'); w.say('E8b the list', JSON.stringify(summarise(fl))); w.res('e8_second_tap_list', summarise(fl))
  }
  w.say('errors', JSON.stringify(w.errors)); w.res('e8b_errors', w.errors)
} catch (e) { w.say('E8b SCRIPT FAILED', String(e).slice(0, 800)); await w.shot('e8b-zz-fail').catch(() => {}) }
await browser.close()
