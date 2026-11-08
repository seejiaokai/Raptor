console.log('oeb-w1-more v1')
import { launch, closeAll, open, openBoard, oilOn, oilIsOn, swChecked, toastText, noteText, sleep, pic, BAR, SW, toTop, press, mkReport, saveRows, blur } from './oeb-w1-lib.mjs'

const only = (process.argv[3] || '').split(',').filter(Boolean)
const sizes = process.argv[2] ? [process.argv[2]] : ['phone', 'pc']
const rep = mkReport()
const WANT = 'Nothing on this day earns OIL. Turn off the switch and each man earns as he did before.'
const pressWords = async W => { const l = W.page.locator(SW).filter({ visible: true }).first(); const b = await l.boundingBox(); const pos = { x: b.width - 10, y: b.height / 2 }; if (W.phone) await l.tap({ position: pos }); else await l.click({ position: pos }) }
const doneOil = async W => { await W.page.locator('#schedBoard .daybar [data-oilmode].done').filter({ visible: true }).first()[W.phone ? 'tap' : 'click'](); await sleep(700) }

const SC = {}
SC.A15 = async W => {
  await open(W); await oilOn(W); await toTop(W)
  const log = []
  await pressWords(W); await sleep(600); log.push('Saturday switch on=' + await swChecked(W.page))
  const goNext = async () => { if (W.phone) await press(W, '#sbNextDay'); else await W.page.locator('#schedBoard').getByText(/^Sun 19$/).first().click(); await sleep(900) }
  const goPrev = async () => { if (W.phone) await press(W, '#sbPrevDay'); else await W.page.locator('#schedBoard').getByText(/^Sat 18$/).first().click(); await sleep(900) }
  await goNext()
  const modeSun = await oilIsOn(W.page); log.push(`arrived on Sunday: OIL Earn mode ${modeSun ? 'still ON' : 'OFF'}`)
  if (!modeSun) await oilOn(W)
  await toTop(W); const sunSw = await swChecked(W.page); log.push('Sunday switch=' + sunSw)
  await pic(W, `A15-${W.size}-sunday`, { sel: BAR, pad: 40 })
  await goPrev()
  const modeSat = await oilIsOn(W.page); log.push(`back on Saturday: mode ${modeSat ? 'still ON' : 'OFF'}`)
  if (!modeSat) await oilOn(W)
  await toTop(W); const sat2 = await swChecked(W.page); log.push('Saturday switch=' + sat2)
  await doneOil(W); await oilOn(W); await toTop(W); const sat3 = await swChecked(W.page); log.push('after leaving and entering the mode: Saturday switch=' + sat3)
  await press(W, '#sbDone'); await sleep(900); await openBoard(W, 5); await oilOn(W); await toTop(W); const sat4 = await swChecked(W.page); log.push('after ✓ Done and reopening Saturday: switch=' + sat4)
  await pic(W, `A15-${W.size}-reopen`, { sel: BAR, pad: 40 })
  // reload
  await W.page.reload(); await W.page.waitForSelector('#luser')
  await W.page.fill('#luser', 'ad'); await W.page.fill('#lpass', 'a'); await W.page.click('#loginForm button[type=submit]')
  await W.page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  await openBoard(W, 5); const modeR = await oilIsOn(W.page); await oilOn(W).catch(() => {}); await toTop(W); const sat5 = await swChecked(W.page); log.push(`after reload, sign-in and reopening Saturday: mode ${modeR ? 'ON' : 'OFF'} on opening; Saturday switch=${sat5}`)
  await pic(W, `A15-${W.size}-reload`, { sel: BAR, pad: 40 })
  const ok = sunSw === false && sat2 === true && sat3 === true && sat4 === true && sat5 === true
  rep.add({ sc: 'A15', size: W.size, res: ok ? 'PASS' : 'FAIL', said: log.join('; '), pic: `A15-${W.size}-sunday.png, A15-${W.size}-reopen.png, A15-${W.size}-reload.png` })
}
SC.A24 = async W => {
  // a member: his own fresh browser world (the equivalent of signing out and in as us)
  const out = []
  await open(W, null, { user: 'us', pass: 'us' })
  const nav = await W.page.evaluate(() => [...document.querySelectorAll('nav button, .topnav button, #topNav button, header button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.trim()).filter(Boolean).slice(0, 14))
  out.push('member sees: ' + JSON.stringify(nav))
  await W.page.evaluate(() => window.go('viewsched')); await sleep(900)
  await pic(W, `A24-${W.size}-member-viewsched`, { full: true })
  const board = async () => { await W.page.evaluate(() => window.openScheduler(5)); await sleep(1000); return W.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; const b = document.querySelector('#schedBoard'); return { board: !!b && vis(b), oilBtns: [...document.querySelectorAll('#sbOil, [data-oilmode]')].filter(vis).length, sw: [...document.querySelectorAll('input[data-oilblank]')].filter(vis).length, bar: b && vis(b) ? (document.querySelector('#schedBoard .daybar')?.innerText.replace(/\n+/g, ' | ')) : null } }) }
  const m = await board(); out.push('member on View-only Sched, board: ' + JSON.stringify(m))
  await pic(W, `A24-${W.size}-member-board`, { full: true })
  const memberOk = m.oilBtns === 0 && m.sw === 0
  await W.page.evaluate(() => { try { window.closeScheduler && window.closeScheduler() } catch {} })
  await closeAll(W)
  // the admin on View-only Sched
  const A = await launch(W.size)
  try {
    await open(A, null)
    await A.page.evaluate(() => window.go('viewsched')); await A.page.waitForFunction(() => window.CURPAGE === 'viewsched'); await sleep(900)
    const m2 = await A.page.evaluate(() => window.openScheduler(5)).then(() => sleep(1000)).then(() => A.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; const b = document.querySelector('#schedBoard'); return { page: window.CURPAGE, board: !!b && vis(b), oilBtns: [...document.querySelectorAll('#sbOil, [data-oilmode]')].filter(vis).length, sw: [...document.querySelectorAll('input[data-oilblank]')].filter(vis).length, bar: b && vis(b) ? (document.querySelector('#schedBoard .daybar')?.innerText.replace(/\n+/g, ' | ')) : null } }))
    out.push('admin on View-only Sched, board: ' + JSON.stringify(m2))
    await pic(A, `A24-${W.size}-admin-viewonly-board`, { full: true })
    // contrast: the same admin on Edit Schedule does have the controls
    await A.page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(300)
    await A.page.evaluate(() => window.go('editsched')); await A.page.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(500)
    await A.page.evaluate(() => window.openScheduler(5)); await sleep(1000)
    const m3 = await A.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; return { oilBtns: [...document.querySelectorAll('#sbOil, [data-oilmode]')].filter(vis).length } })
    out.push('contrast, same admin on Edit Schedule: ' + JSON.stringify(m3))
    const adminOk = m2.sw === 0 && m3.oilBtns > 0
    rep.add({ sc: 'A24', size: W.size, res: memberOk && adminOk ? 'PASS' : 'FAIL', said: out.join('; ') + `; ${m.board ? '' : 'the member\'s board did not open through the app bridge, so "no controls" there is the board not being offered'}`, pic: `A24-${W.size}-member-viewsched.png, A24-${W.size}-member-board.png, A24-${W.size}-admin-viewonly-board.png` })
    rep.note(`A24 (${W.size}): ` + (A.errs.length ? JSON.stringify(A.errs) : 'no page errors'))
  } finally { await closeAll(A) }
}

for (const size of sizes) {
  for (const k of Object.keys(SC)) {
    if (only.length && !only.includes(k)) continue
    const W = await launch(size)
    try { await SC[k](W) } catch (e) { rep.add({ sc: k, size, res: 'NOT WALKED', said: 'script error: ' + e.message.split('\n').slice(0, 6).join(' ~ '), pic: '' }) }
    if (W.errs.length) rep.note(`${k}/${size}: page errors ${JSON.stringify(W.errs)}`)
    await closeAll(W)
  }
}
saveRows(rep, 'more-' + (process.argv[2] || 'both') + (only.length ? '-' + only.join('') : ''))
console.log('DONE')
