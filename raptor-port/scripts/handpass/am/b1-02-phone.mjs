/* Walker B1 (amendment batch, 25 Sep 26) — PHONE (390×844, DPR 3): the one count (D109), the pending list
   (D99, D100) from the week head AND the board strip, and the jump (D107) — on a phone the week steps to the day.
   Fresh world (the seed week); Monday published through the app's own controls on the phone board.
   PASS = correct. Pictures: docs/img/handpass/2026-09-25-amendment-batch/b1/ (b1-p-*).
   Run from raptor-port/: node scripts/handpass/am/b1-02-phone.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1'
const L = await import('./w2-lib.mjs')
const W = await import('./w1-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, head, check, note, summary, screen } = L
const { toastSpy, toasts, shotBox, shotUnion, boardType, norm } = W
const MON = 0
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const { browser, page, errors } = await openHi({ width: 390, height: 844, dpr: 3, state: null })
await toastSpy(page)
const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))

async function dragPuck(fromSlot, toSel) {
  const src = page.locator(`#schedBoard [data-slot="${fromSlot}"] .puck:visible`).first()
  const dst = page.locator(`#schedBoard ${toSel}:visible`).first()
  if (!(await src.count()) || !(await dst.count())) return 'missing'
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await page.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + Math.min(b.height / 2, 10), { steps: 12 })
  await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(800)
  return 'dropped'
}
async function openList(scope) {
  const b = page.locator(`${scope} [data-pendlist="${MON}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await b.click(); await page.waitForTimeout(500)
  return page.evaluate(() => {
    const p = document.querySelector('#pendList'); if (!p) return { open: false }
    const r = p.getBoundingClientRect(), vv = window.visualViewport
    return { open: true, head: p.querySelector('.pl-head')?.innerText.replace(/\s+/g, ' ').trim(),
      rows: [...p.querySelectorAll('.pl-item')].map(e => ({ btn: e.tagName === 'BUTTON', where: e.querySelector('.pl-where')?.innerText, chg: e.querySelector('.pl-chg')?.innerText.replace(/\s+/g, ' '), who: e.querySelector('.pl-who')?.innerText.replace(/\s+/g, ' ') })),
      text: p.innerText, box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), vw: vv ? vv.width : innerWidth, vh: vv ? vv.height : innerHeight } }
  })
}
const jumpState = () => page.evaluate(() => {
  const f = [...document.querySelectorAll('.chgflash')].map(e => { const r = e.getBoundingClientRect(); return { key: e.dataset.slot || e.dataset.fill || e.dataset.bfld || e.dataset.txt || e.className.slice(0, 30), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= -1 && r.right <= innerWidth + 1, where: e.closest('#schedBoard') ? 'board' : e.closest('#eWeek') ? 'week' : 'other' } })
  /* which day the phone week is showing: the day whose card sits at the left edge */
  const days = [...document.querySelectorAll('#eWeek .day[data-day]')].map(d => ({ di: +d.dataset.day, x: Math.round(d.getBoundingClientRect().left) }))
  const shown = days.filter(d => d.x >= -40 && d.x < innerWidth / 2).map(d => d.di)
  return { board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth), flash: f, shown }
})

try {
  await editWeek(page)
  await board(page, MON)
  const sg = await signDay(page, MON, 0)
  const pub = await publishDay(page, MON)
  const h0 = await head(page, MON)
  check('P-FIX publish', pub.pressed && /ORIG/.test(h0.tag), `Monday published on the phone board (${JSON.stringify(sg)}), tag "${h0.tag}"`)
  // the changes: Warden → SODB (a move), a time, a remark far down the day (CMD ENGAGEMENT)
  const r = await dragPuck(`a:${MON}.1.0`, `[data-fill="a:${MON}.0.+"]`)
  const moved = await page.evaluate(() => ({ sodb: window.DAYS[0].allhands[0].who, met: window.DAYS[0].allhands[1].who }))
  note('P-A gesture', `${r}; SODB ${JSON.stringify(moved.sodb)} MET ${JSON.stringify(moved.met)}; ${JSON.stringify(await toasts(page))}`)
  await boardType(page, `ap:${MON}.3.str`, '1140')
  await boardType(page, `ap:${MON}.9.rmks`, 'far down')
  const exp = (moved.sodb === 'nact' ? 1 : 0) + 2
  // counts on the phone: the board strip, the week head, the ⓘ panels
  const hb = norm((await head(page, MON)).pending)
  const ib = await W.dayInfo(page, MON, 'board'); await W.closeDayInfo(page)
  await shotUnion(page, 'b1-p-01-board-strip', ['#sbSignBar'])
  await editWeek(page)
  const hw = norm((await head(page, MON)).pending)
  const iw = await W.dayInfo(page, MON, 'week'); await W.closeDayInfo(page)
  const n = [num(hb), num(hw), num(ib.pend), num(iw.pend)]
  check('P-C1 counts agree', n.every(x => x === exp), `phone: board strip "${hb}", week head "${hw}", ⓘ board "${ib.pend}", ⓘ week "${iw.pend}" — want ${exp} (a move is one)`)

  // the list from the week head
  await page.evaluate(() => window.scrollTo(0, 0))
  let o = await openList(`#eWeek .day[data-day="${MON}"]`)
  await screen(page, 'b1-p-02-list-week')
  check('P-L1 week list', o && o.open && o.head === `Waiting to go out as AL1 · ${exp} changes` && o.rows.length === exp, `phone week head: the list opens, "${o && o.head}", ${o && o.rows.length} rows`)
  check('P-L2 fits the phone', o && o.box.left >= 0 && o.box.right <= o.box.vw && o.box.bottom <= o.box.vh, `the list sits inside the 390px screen: ${JSON.stringify(o && o.box)}`)
  const mv = o && o.rows.find(x => /Warden/.test(x.where || ''))
  check('P-L3 move line', mv && /MET \+ NOTAM BRIEF\s*→\s*SODB/.test(mv.chg || ''), `the move reads "Warden: MET + NOTAM BRIEF → SODB": ${JSON.stringify(mv)}`)
  check('P-L4 no raw', o && !/␟|[{}]/.test(o.text) && !Object.keys(CS).some(k => k !== CS[k] && new RegExp(`\\b${k}\\b`).test(o.text)), 'no raw "␟", JSON or ids on the phone list')
  // the jump from the week list: the remark far down CMD ENGAGEMENT — the week must scroll to it, board stays shut
  const ix = o ? o.rows.findIndex(x => /CMD ENGAGEMENT/.test(x.where || '')) : -1
  if (ix >= 0) {
    await page.locator(`#pendList [data-plix="${ix}"]`).click(); await page.waitForTimeout(250)
    const j = await jumpState()
    await screen(page, 'b1-p-03-jump-week-from-list')
    check('P-J1 list → week', !j.board && j.flash.some(f => f.where === 'week' && f.inView), `phone: from the week's list, the board stays shut and the far-down remark is marked in view — ${JSON.stringify(j)}`)
  } else check('P-J1 list → week', false, 'no CMD ENGAGEMENT row in the list')
  await page.waitForTimeout(1600)
  // step the phone week to Wednesday the way a swipe does (scroll the day strip), then Edit history → Monday's move
  await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="2"]'); d && d.scrollIntoView({ block: 'nearest', inline: 'start' }); window.scrollTo(0, 0) })
  await page.waitForTimeout(500)
  const before = await jumpState()
  note('P-J2 before', `the phone week shows day ${JSON.stringify(before.shown)}`)
  const hb2 = page.locator('#histBtn:visible, [data-histopen]:visible').first()
  if (await hb2.count()) {
    await hb2.click(); await page.waitForTimeout(600)
    await screen(page, 'b1-p-04-edit-history')
    const rows = await page.evaluate(() => [...document.querySelectorAll('#histBody .hit')].map((e, i) => ({ i, key: e.dataset.hkey, t: e.innerText.replace(/\s+/g, ' ').slice(0, 60) })))
    const rw = rows.find(x => /^a:0\.0/.test(x.key || '')) || rows.find(x => /SODB/.test(x.t))
    if (rw) {
      await page.locator('#histBody .hit').nth(rw.i).click(); await page.waitForTimeout(700)
      const j = await jumpState()
      await screen(page, 'b1-p-05-jump-week-from-history')
      check('P-J2 history → week steps to the day', !j.board && j.shown.includes(0) && j.flash.some(f => f.where === 'week' && f.inView), `phone: from Wednesday, Edit history → Monday's move: the week steps to Monday, board shut, change marked — ${JSON.stringify(j)}`)
    } else check('P-J2 history → week steps to the day', false, 'no SODB row in Edit history: ' + JSON.stringify(rows.slice(0, 8)))
  } else check('P-J2 history → week steps to the day', false, 'no Edit history opener on the phone top bar')
  await page.waitForTimeout(1600)
  // the list from the board strip on the phone, and the board jump
  await board(page, MON)
  o = await openList('#schedBoard')
  await screen(page, 'b1-p-06-list-board')
  check('P-L5 board list', o && o.open && o.rows.length === exp && o.box.left >= 0 && o.box.right <= o.box.vw, `phone board strip: the list opens inside the screen, ${o && o.rows.length} rows, ${JSON.stringify(o && o.box)}`)
  const ixb = o ? o.rows.findIndex(x => /CMD ENGAGEMENT/.test(x.where || '')) : -1
  if (ixb >= 0) {
    await page.locator(`#pendList [data-plix="${ixb}"]`).click(); await page.waitForTimeout(900)
    const j = await jumpState()
    const bub = await page.evaluate(() => { const b = [...document.querySelectorAll('.histbub')].find(e => e.offsetWidth); if (!b) return null; const r = b.getBoundingClientRect(); return { text: b.innerText.replace(/\s+/g, ' ').slice(0, 100), left: Math.round(r.left), right: Math.round(r.right) } })
    await screen(page, 'b1-p-07-jump-board-from-list')
    check('P-J3 board list → board', j.board && j.flash.some(f => f.where === 'board') && !!bub, `phone board: the jump stays on the board, marks the cell, the bubble pinned — ${JSON.stringify({ j, bub })}`)
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await page.mouse.click(200, 820); await page.waitForTimeout(300)
  o = await openList('#schedBoard')
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  check('P-L6 escape', !(await page.locator('#pendList').count()), 'Escape closes the phone list')
} catch (e) {
  check('RUN', false, 'the script stopped: ' + e.message.split('\n')[0])
  await screen(page, 'b1-p-ZZ-stopped')
}
check('P-ERR', !errors.length, `browser error list ${errors.length ? JSON.stringify(errors.slice(0, 6)) : 'empty'}`)
summary('B1 phone')
await browser.close()
