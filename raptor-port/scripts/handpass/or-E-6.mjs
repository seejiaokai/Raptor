// E8 + E9: "Nothing new"; the list with 9 lines at 390x844, 390x568 and 844x390; a filer with an unanswered OIL question AND an unread notice.
import { world, sleep, DI, PHONE, browser, summarise, touchDrag, toBoardSec, openDrawer, drawerName } from './or-E-lib.mjs'
const w = await world({ size: PHONE, touch: true, who: 'ad', pass: 'a', clock: '2026-06-22T09:00:00', tag: 'E8' })
const { page, press } = w
const oilState = () => page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); return s ? { buttons: [...s.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || b.id || b.className) + ':' + b.innerText.replace(/\s+/g, ' ').slice(0, 30)), text: s.innerText.replace(/\s+/g, ' ').slice(0, 200) } : null })
const closeOil = async () => {
  const s = page.locator('[data-testid="oilconf"]'); if (!(await s.count())) return false
  await press(s.locator('button.x').first()); await sleep(400); return !(await s.count())
}
try {
  // ---- E8a: Saber, a person with no notices
  const b0 = await w.bellState(); w.say('E8 Saber (no notices) bell', JSON.stringify(b0))
  await press(await w.bell()); await sleep(450)
  const f0 = await w.shotList('e8-01-nothing-new'); w.say('E8 Saber tap', JSON.stringify(summarise(f0)), 'toast:', await w.note())
  w.res('e8_nothing_new', summarise(f0))
  await press(await w.bell()); await sleep(250)
  // ---- Ranger: Nothing new too; then he files "Wed brief" for himself (E9's lines come from Saber re-timing it)
  await w.signOut(); await w.signIn('us', 'us')
  await press(await w.bell()); await sleep(450)
  const f00 = await w.shotList('e8-02-ranger-nothing-new'); w.say('E8 Ranger tap (no notices, no question)', JSON.stringify(summarise(f00)), 'oil sheet:', await page.locator('[data-testid="oilconf"]').count())
  await press(await w.bell()); await sleep(250)
  await w.fileIt({ pick: ['Ranger'], title: 'Wed brief', from: '10:00', to: '11:00', kind: 'Training', oil: 'no' })
  w.say('E9 Wed brief', JSON.stringify(await w.rec('Wed brief')))
  // ---- Saber re-times it NINE times (each a real save through its window)
  await w.signOut(); await w.signIn('ad', 'a')
  const times = [['11:00', '12:00'], ['12:00', '13:00'], ['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'], ['08:00', '09:00'], ['07:00', '08:00'], ['06:00', '07:00']]
  for (let i = 0; i < times.length; i++) {
    await w.toMonth(); await w.openDay('2026-07-15')
    const rec = await w.rec('Wed brief')
    await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${rec.iid}"]`).first()); await page.waitForSelector('#inpEditPop #inpEditStart', { timeout: 5000 }); await sleep(300)
    await page.locator('#inpEditPop #inpEditStart').fill(times[i][0]); await page.locator('#inpEditPop #inpEditEnd').fill(times[i][1])
    await press(page.locator('#inpEditSave')); await sleep(500)
    if (await page.locator('#inpEditPop:visible').count()) { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(250) } }
    await w.closeDay().catch(() => {})
    w.say('E9 re-time ' + (i + 1), JSON.stringify(times[i]), JSON.stringify(await page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Wed brief'); return [r.s, r.e] })))
  }
  w.say('E9 notices stored for Ranger', await page.evaluate(() => (window.NOTICES || []).filter(n => n.to === 'bane').length), '| Saber bell', JSON.stringify(await w.bellState()))
  // ---- Ranger reads the list: three screens
  await w.signOut(); await w.signIn('us', 'us')
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  w.say('E9 Ranger bell', JSON.stringify(await w.bellState()))
  await press(await w.bell()); await sleep(600)
  const fa = await w.shotList('e9-01-390x844'); w.say('E9 list 390x844', JSON.stringify(summarise(fa))); w.res('e9_844', summarise(fa))
  const fits = async (label) => {
    const f = await w.listFacts()
    const tb = await page.evaluate(() => { const b = document.querySelector('.bellbtn[aria-expanded="true"]') || document.querySelector('.bellbtn'); const r = b.getBoundingClientRect(); return { bellBottom: Math.round(r.bottom), bellTop: Math.round(r.top) } })
    const sc = await page.evaluate(() => { const l = document.querySelector('.bell-list'); const cands = [l, ...l.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)); const s = cands[0]; return { scroller: s ? (s.className || s.tagName) : null, sh: s ? s.scrollHeight : null, ch: s ? s.clientHeight : null, listOverflowY: getComputedStyle(l).overflowY, listSH: l.scrollHeight, listCH: l.clientHeight } })
    const bodyScroll = await page.evaluate(() => ({ y: Math.round(scrollY), docH: document.documentElement.scrollHeight, vh: innerHeight }))
    const mark = await page.evaluate(() => { const m = document.querySelector('[data-testid="bell-markall"]'); if (!m) return null; const r = m.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), inScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, hit: !!h && (h === m || m.contains(h)) } })
    w.say('E9 ' + label, JSON.stringify({ vw: f.vw, vh: f.vh, box: f.box, bottomEdge: f.box.y + f.box.h, inView: f.inView, topClearOfBar: f.box.y >= tb.bellBottom, bell: tb, lines: f.lines.length, scroll: sc, page: bodyScroll, markAll: mark, cut: f.lines.filter(l => l.cut).length, outside: f.lines.filter(l => !l.lineInside).length }))
    return { f, sc, mark, tb }
  }
  const r844 = await fits('390x844'); w.res('e9_844_fit', { box: r844.f.box, scroll: r844.sc, mark: r844.mark })
  await press(await w.bell()); await sleep(300)
  for (const [vw, vh, nm] of [[390, 568, 'e9-02-390x568'], [844, 390, 'e9-03-844x390']]) {
    await page.setViewportSize({ width: vw, height: vh }); await sleep(800)
    w.say('E9 viewport now', vw, vh, 'bell state', JSON.stringify(await w.bellState()))
    await press(await w.bell()); await sleep(500)
    const r = await fits(nm)
    await w.quiet(); await w.shot(nm + '-full'); await w.loud()
    const reach = await page.evaluate(() => { const l = document.querySelector('.bell-list'); const cands = [l, ...l.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)); const sc = cands[0]; if (!sc) return { scroller: null }; sc.scrollTop = sc.scrollHeight; const lines = [...l.querySelectorAll('.bl-line')]; const last = lines[lines.length - 1].getBoundingClientRect(); const m = l.querySelector('[data-testid="bell-markall"]'); const mr = m ? m.getBoundingClientRect() : null; return { scroller: sc.className || sc.tagName, scrolledTo: Math.round(sc.scrollTop), lastLineBottom: Math.round(last.bottom), vh: innerHeight, markVisible: mr ? (mr.top >= 0 && mr.bottom <= innerHeight) : null } })
    w.say('E9 ' + nm + ' after scrolling the list to its end', JSON.stringify(reach))
    await sleep(200); await w.quiet(); await w.shot(nm + '-scrolled-end'); await w.loud()
    w.res(nm, { fit: { box: r.f.box, scroll: r.sc, mark: r.mark, topClearOfBar: r.f.box.y >= r.tb.bellBottom }, reach })
    await press(await w.bell()).catch(() => {}); await sleep(300)
  }
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(600)

  // ---- E8b: a filer with an unanswered OIL question AND an unread notice. The Inputs form cannot be saved unanswered (probed), so:
  // Saber files a Saturday Training for Ranger alone (answers Yes), drops Tally from the crew drawer ON Ranger's lone puck on the board
  // (replace: the answer is void and the question opens), closes the question unanswered; Tally (the only named person) re-times it.
  await w.signOut(); await w.signIn('ad', 'a')
  await w.fileIt({ day: '2026-07-18', pick: ['Ranger'], title: 'Sat X', from: '09:00', to: '10:00', kind: 'Training', oil: 'yes' })
  const sx = await w.rec('Sat X'); w.say('E8b Sat X filed', JSON.stringify(sx))
  await w.openBoard(5); await toBoardSec(page, 'ground', 5); await sleep(300); await openDrawer(page)
  const nm = await drawerName(page, 'Tally'); const from = await nm.boundingBox()
  const tgt = await page.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].filter(e => e.offsetParent).find(r => /sat x/i.test((r.querySelector('textarea.ain') || {}).value || '')); const p = r.querySelector('.ppl .puck'); const b = p.getBoundingClientRect(); return { x: b.x + 20, y: b.y + b.height / 2 } })
  w.say('E8b drag from', JSON.stringify(from), 'to', JSON.stringify(tgt))
  await touchDrag(page, { x: from.x + from.width / 2, y: from.y + from.height / 2 }, tgt)
  w.say('E8b after the drop: toast', await w.note(), '| record', JSON.stringify(await w.rec('Sat X')), '| oil sheet', JSON.stringify(await oilState()))
  await w.shot('e8-03-after-replace-drop')
  const closedQ = await closeOil(); w.say('E8b closed the question unanswered:', closedQ, '| sheet now', await page.locator('[data-testid="oilconf"]').count(), '| record', JSON.stringify(await w.rec('Sat X')), 'by/oil:', JSON.stringify(await page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Sat X'); return Object.fromEntries(Object.entries(r).filter(([k]) => /^(by|oil|acc)/i.test(k))) })))
  await w.shot('e8-04-after-close')
  await w.closeBoard().catch(() => {})
  w.say('E8b Saber bell now (unanswered question, no notice yet)', JSON.stringify(await w.bellState()))
  // become Tally in place and re-time it
  const tid = await w.csId('Tally')
  await page.evaluate(id => { window.raptorMe(id); window.raptorRole('member') }, tid); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  await w.toMonth(); await w.openDay('2026-07-18')
  const sxr = await w.rec('Sat X')
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${sxr.iid}"]`).first()); await page.waitForSelector('#inpEditPop #inpEditStart', { timeout: 5000 }); await sleep(300)
  w.say('E8b Tally window controls', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button:not(.pp-puck), #inpEditPop input')].filter(e => e.offsetParent && !/rc-/.test(e.className + e.id)).map(e => e.id || e.getAttribute('data-testid') || e.innerText.slice(0, 20)))))
  await page.locator('#inpEditPop #inpEditStart').fill('11:00'); await page.locator('#inpEditPop #inpEditEnd').fill('12:00')
  await press(page.locator('#inpEditSave')); await sleep(600)
  w.say('E8b Tally saved: oil sheet', JSON.stringify(await oilState()), '| record s/e', JSON.stringify(await page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Sat X'); return [r.s, r.e] })), await w.note())
  if (await page.locator('[data-testid="oilconf"]').count()) { const c = await closeOil(); w.say('E8b Tally closed the question:', c) }
  if (await page.locator('#inpEditPop:visible').count()) { const x = page.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await press(x); await sleep(250) } }
  await w.closeDay().catch(() => {})
  w.say('E8b notices for Saber', JSON.stringify(await page.evaluate(() => (window.NOTICES || []).filter(n => n.to === 'stiff').map(n => [n.by, (n.what || []).map(p => p.k).join('+'), n.read]))))
  await page.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  w.say('E8b Saber bell: question + notice', JSON.stringify(await w.bellState()))
  await w.shot('e8-05-saber-bell')
  await press(await w.bell()); await sleep(600)
  const q1 = await oilState()
  w.say('E8b first tap: OIL question?', JSON.stringify(q1), '| list open:', await page.locator('.bell-list').count())
  await w.shot('e8-06-first-tap'); w.res('e8_first_tap', { oil: q1, listOpen: await page.locator('.bell-list').count() })
  if (q1) {
    const sheet = page.locator('[data-testid="oilconf"]')
    await press(sheet.locator('[data-testid="oil-yes"], [data-testid="oil-all"]').first()); await sleep(300)
    await press(sheet.locator('[data-testid="oilconf-save"]')); await sleep(600)
    w.say('E8b answered: oil sheet', await page.locator('[data-testid="oilconf"]').count(), 'record oil:', JSON.stringify(await page.evaluate(() => { const r = window.INPUTS.find(x => x.title === 'Sat X'); return Object.fromEntries(Object.entries(r).filter(([k]) => /oil/i.test(k))) })), await w.note())
    w.say('E8b bell after answering', JSON.stringify(await w.bellState()))
    await press(await w.bell()); await sleep(500)
    w.say('E8b next tap: list open:', await page.locator('.bell-list').count(), '| oil sheet:', await page.locator('[data-testid="oilconf"]').count())
    const fl = await w.shotList('e8-07-next-tap-list'); w.say('E8b the list', JSON.stringify(summarise(fl))); w.res('e8_second_tap_list', summarise(fl))
  }
  w.say('errors', JSON.stringify(w.errors)); w.res('e89_errors', w.errors)
} catch (e) { w.say('E8 SCRIPT FAILED', String(e).slice(0, 800)); await w.shot('e8-zz-fail').catch(() => {}) }
await browser.close()
