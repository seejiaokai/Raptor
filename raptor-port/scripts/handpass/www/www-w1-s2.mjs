/* www W1 round 2, scenario 2: the looks (published version, saved plan), day details from every door.
   usage: [PHONE=1] node scripts/handpass/www/www-w1-s2.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's2-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const SAT = X.SAT
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('2 the looks and day details', size, did, exp, saw, v, pic)
const tap = async loc => { if (PHONE) await loc.tap(); else await loc.click() }
// fixture: Saturday, Ranger flight 12:00-13:00, signed + published (ORIG, clean)
await X.board(w, SAT)
await X.flight(w, SAT, '12:00', '13:00', 'bane', { msn: 'V1 FLT' })
await H.signAndPublish(w, SAT); await sleep(800)
// a saved plan copied while the day is clean
await X.press(w, `[data-planmenu="${SAT}"]`, { scope: 'board' }); await sleep(400)
await X.pic(w, `2-0menu-${P}`)
const menuTxt = await page.evaluate(() => [...document.querySelectorAll('.wm, .wm-row button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).join(' | '))
await X.press(w, '[data-plandup="1"]'); await sleep(900)
const afterDup = await page.evaluate(() => document.querySelector('[data-planmenu]')?.innerText.replace(/\s+/g, ' '))
await X.pic(w, `2-0dup-${P}`)
R('published Saturday (ORIG); opened the plans menu; + Alt Plan copied the clean day', 'RECORD', `menu: ${menuTxt}; selector after: ${afterDup}`, 'RECORDED', `2-0dup-${P}.png`)
// back to the live copy, then make a conflict on it: a second Ranger flight overlapping
const live = page.locator(`[data-plangolive="${SAT}"]`)
if (!(await live.count())) { await X.press(w, `[data-planmenu="${SAT}"]`, { scope: 'board' }); await sleep(400) }
if (await page.locator(`[data-plangolive="${SAT}"]:visible`).count()) { await tap(page.locator(`[data-plangolive="${SAT}"]:visible`).first()); await sleep(800) }
await X.flight(w, SAT, '12:30', '13:30', 'bane', { msn: 'CLASH FLT' })
await sleep(600)
const liveW = await X.boardWarn(w)
await X.pic(w, `2-1live-${P}`)
R('live copy: a second Ranger flight 12:30-13:30 overlapping the first', 'the live board shows a Conflict line', JSON.stringify(liveW), liveW.some(l => /Conflict/.test(l)) ? 'PASS' : 'RECORDED', `2-1live-${P}.png`)
const eye = async () => page.evaluate(() => { const s = document.querySelector('[data-planmenu]'); const b = document.querySelector('.pvbanner, [class*="pvban"], [class*="lookban"]'); return JSON.stringify({ sel: s ? s.innerText.replace(/\s+/g, ' ') : null, svg: !!(s && s.querySelector('svg')), banner: b ? b.innerText.replace(/\s+/g, ' ').trim() : null }) })
// look at the published version (ORIG)
await X.press(w, `[data-planmenu="${SAT}"]`, { scope: 'board' }); await sleep(400)
const pv = page.locator('[data-planpv]:visible').first()
const pvN = await page.locator('[data-planpv]:visible').count()
if (pvN) {
  const verTxt = (await pv.innerText()).replace(/\s+/g, ' ')
  await tap(pv); await sleep(900)
  const lw = await X.boardWarn(w)
  const e1 = await eye()
  await X.pic(w, `2-2pv-${P}`)
  R('looked at the published version (' + verTxt + ') through the plans menu', 'the look shows that version only: no live Conflict line; the eye-marked selector/banner', `${e1}; warnings: ${JSON.stringify(lw)}`, lw.some(l => /Conflict/.test(l)) ? 'FAIL' : 'PASS', `2-2pv-${P}.png`)
  // is anything of the live copy's conflict left on the look after the toast time (the toast and the red crew chip in the first picture)?
  await sleep(7000)
  const leak = await page.evaluate(() => ({ toast: [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /CLASH FLT/.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight && +getComputedStyle(e).opacity > 0.05 && getComputedStyle(e).visibility !== 'hidden').map(e => e.className + ':' + e.textContent.slice(0, 80)), redchips: [...document.querySelectorAll('#schedBoard .chip, #sbSide .chip, #schedBoard [class*="pers"]')].filter(e => /Ranger/.test(e.textContent) && /(conf|warn|red|bad)/i.test(e.className) && e.getBoundingClientRect().width > 0).map(e => e.className).slice(0, 5) }))
  await X.pic(w, `2-2pv-later-${P}`)
  R('the same look, 7 seconds later: does anything of the live conflict remain (the toast, the red Ranger chip)?', 'nothing of the live conflict on the old version\'s look', JSON.stringify(leak), leak.toast.length ? 'FAIL' : 'PASS', `2-2pv-later-${P}.png`)
  const back = page.locator('button:visible', { hasText: /Back to live copy/ }).first()
  if (await back.count()) { await tap(back); await sleep(800) }
  await X.closeBoard(w)
} else { R('looked at the published version', 'a version in the menu', 'no [data-planpv] control visible', 'NOT WALKED', `2-0dup-${P}.png`); await X.closeBoard(w) }
// the saved plan
await X.board(w, SAT)
await X.press(w, `[data-planmenu="${SAT}"]`, { scope: 'board' }); await sleep(400)
const ps = page.locator('[data-plansel]:visible')
const psN = await ps.count()
if (psN) {
  const nm = (await ps.first().innerText()).replace(/\s+/g, ' ')
  await tap(ps.first()); await sleep(900)
  const lw = await X.boardWarn(w)
  const e2 = await eye()
  await X.pic(w, `2-3plan-${P}`)
  R('opened the saved plan (' + nm + ') copied while the day was clean', 'flag-free: no warning line of any kind on the plan', `${e2}; warnings: ${JSON.stringify(lw)}`, lw.some(l => /Conflict|Crew rest|Tight|Warning/.test(l)) ? 'FAIL' : 'PASS', `2-3plan-${P}.png`)
  await X.press(w, `[data-planmenu="${SAT}"]`, { scope: 'board' }); await sleep(400)
  if (await page.locator(`[data-plangolive="${SAT}"]:visible`).count()) { await tap(page.locator(`[data-plangolive="${SAT}"]:visible`).first()); await sleep(900) }
} else R('opened the saved plan', 'a plan in the menu', 'no [data-plansel] control visible', 'NOT WALKED', `2-0dup-${P}.png`)
await X.closeBoard(w)
// day details from Edit Schedule, View-only, the board
await L.go(page, 'editsched'); await sleep(500)
const dd = await X.dayDetails(w, '#eWeek', SAT)
await X.pic(w, `2-4details-edit-${P}`)
R('Edit Schedule: Saturday day details', 'RECORD its warning lines (live: the Conflict)', JSON.stringify(dd.items), 'RECORDED', `2-4details-edit-${P}.png`)
await X.closeDayPop(w, 'done')
await L.go(page, 'viewsched').catch(() => {}); await sleep(600)
let vd = null
try { vd = await X.dayDetails(w, '#vWeek', SAT); await X.pic(w, `2-5details-view-${P}`); await X.closeDayPop(w, 'done') } catch (e) { say('view-only details failed', e.message.slice(0, 100)) }
R('View-only Sched: Saturday day details', 'RECORD its warning lines', vd ? JSON.stringify(vd.items) : 'could not open', vd ? 'RECORDED' : 'NOT WALKED', vd ? `2-5details-view-${P}.png` : '')
await X.fin(w)
