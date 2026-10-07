/* S25 part C — the Medical view (Inputs page → Medical): a card → the document viewer → "Edit input" → the editor; and the Leave War
   (an approved leave created, changed and deleted on the war's grid). X on blank seats Tue (flying line + duty row). */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, sleep, R, pic } = T
const t = T.mk('s25c')
const TU = 1
const fl = r => r.away.filter(x => /On leave|Medically|Downchit/i.test(x))
const one = r => Q.shortDay(TU, r)
const dlg = p => p.evaluate(() => { const e = [...document.querySelectorAll('.airpop, [role=dialog]')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 260) : '' })

async function medical() {
  const { browser, p, errors } = await K.fresh()
  try {
    await Q.seatDays(p, [TU]); await T.blankRow(p, 'duty', TU)
    const f = await T.file(p, { type: 'ATT C', di: TU, toDi: 2, allday: true, remarks: 'Med one' })
    const m1 = await Q.readDay(p, TU, 'm1', { noPics: false })
    t.add('S25c.M1', `ATT C, All day, Tue 14 → Wed 15 filed on the Inputs form (stored: ${await T.rec(p, f.iid)})`, one(m1), fl(m1).length === 2 ? 'PASS' : 'FAIL', m1.s.pics)
    const openCard = async () => {
      if (!(await p.locator('#medView').count())) { await L.go(p, 'inputs'); await sleep(600) }
      if (!(await p.locator('#medView').count())) { await W2.inputsList(p); await p.locator('#inMedBtn').click(); await sleep(700) }
      await p.locator('#medCalBtn').click(); await sleep(400)
      await p.locator('[data-medday="2026-07-14"]').click(); await sleep(500)
      const card = p.locator(`[data-medcard="${f.iid}"]`)
      if (!(await card.count())) return 'no card for him on 14 Jul in the Medical view'
      await pic(p, 's25c-medical')
      await card.click(); await sleep(700)
      await p.locator('#docViewEdit').click(); await sleep(800)
      return 'editor open: ' + await dlg(p)
    }
    const o1 = await openCard()
    if (/^editor open/.test(o1)) {
      await p.locator('#inpEditType').selectOption('ATT B').catch(() => {})
      await pic(p, 's25c-med-editor')
      await p.locator('#inpEditSave').click(); await sleep(800)
      const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await sleep(500) }
    }
    const m2 = await Q.readDay(p, TU, 'm2', { noPics: false })
    t.add('S25c.M2', `Medical view (as of 14 Jul) → his card → document viewer → "Edit input" (${o1.slice(0, 120)}): the type changed ATT C → ATT B and saved; stored: ${await T.rec(p, f.iid)}`, one(m2), m2.away.some(x => /Downchit but planned to fly this line/.test(x)) && !m2.away.some(x => /this row/.test(x)) ? 'PASS' : 'FAIL', m2.s.pics)
    const o2 = await openCard()
    let del = 'no editor'
    if (/^editor open/.test(o2)) { await p.locator('#inpEditDel').click(); await sleep(800); del = 'Delete pressed; the screen said "' + (await dlg(p)) + '"' ; const yes = p.locator('button:visible').filter({ hasText: /^(Delete|Yes|Confirm|Remove)/ }).last(); if (await p.locator('#inpEditSave:visible').count() === 0 && await yes.count() && /sure|confirm|delete/i.test(await dlg(p))) { await yes.click().catch(() => {}); await sleep(600) } }
    const m3 = await Q.readDay(p, TU, 'm3', { noPics: false })
    t.add('S25c.M3', `Medical view → card → Edit input → Delete (${o2.slice(0, 80)}; ${del}); his inputs now ${JSON.stringify(await T.recAll(p))}`, one(m3), fl(m3).length === 0 ? 'PASS' : 'FAIL', m3.s.pics)
  } catch (e) { R('S25c.MX', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's25c-MX')]) }
  R('S25c.Merr', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function leaveWar() {
  const { browser, p, errors } = await K.fresh()
  try {
    await Q.seatDays(p, [TU, 2]); await T.blankRow(p, 'duty', TU)
    const cell = '[data-testid="cell-split-2026-07-14"]'
    const lw = async (label, date = '2026-07-14') => {
      await L.go(p, 'leavewar'); await sleep(1500)
      const c = p.locator(`[data-testid="cell-split-${date}"]`); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
      await c.click(); await sleep(900)
      const txt = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 420) : 'no sheet' })
      return { txt, shot: await pic(p, `s25c-lw-${label}`) }
    }
    const pressSheet = async name => {
      const b = p.locator('[class*=sheet] button:visible').filter({ hasText: new RegExp('^' + name + '$') }).first()
      if (!(await b.count())) return `no "${name}" button`
      await b.click(); await sleep(800); return 'pressed ' + name
    }
    const closeSheet = async () => { if (await p.locator('.bidsheet:visible').count()) { await p.keyboard.press('Escape'); await sleep(500) } if (await p.locator('.sheetscrim:visible').count()) { const x = p.locator('.bidsheet-hd button:visible').first(); if (await x.count()) { await x.click(); await sleep(500) } } if (await p.locator('.sheetscrim:visible').count()) { await p.mouse.click(5, 450); await sleep(500) } }
    const cellText = () => p.evaluate(c => { const e = document.querySelector(c); return e ? `"${e.innerText.trim()}" class "${e.className}"` : 'cell not found' }, cell)
    const stage = () => p.evaluate(() => (document.querySelector('.stage-go') || {}).innerText || '')
    const s0 = await lw('0-sheet')
    t.add('S25c.L0', `Leave War (stage ${await stage()}): Vandal's cell for Tue 14 Jul tapped — the sheet`, s0.txt, 'RECORDED', [s0.shot])
    let a = await pressSheet('LL')
    const ask = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(-140) : '' })
    if (/same leave again/i.test(ask)) { await pic(p, 's25c-lw-LL-ask'); a += ' (the sheet said "' + ask.slice(ask.indexOf('That takes')) + '") then pressed LL again: ' + await pressSheet('LL') }
    if (await p.locator('.bidsheet:visible').count()) { await p.keyboard.press('Escape'); await sleep(500) }
    if (await p.locator('.sheetscrim:visible').count()) { const x = p.locator('.bidsheet-hd button:visible').first(); if (await x.count()) { await x.click(); await sleep(500) } }
    const bidCell = await cellText()
    await L.go(p, 'editsched'); const l1 = await Q.readDay(p, TU, 'l1')
    t.add('S25c.L1', `the sheet's LL pressed (${a}) — a leave bid while bidding is OPEN; the cell reads ${bidCell}; his inputs: ${JSON.stringify(await T.recAll(p))}`, one(l1), 'RECORDED', l1.s.pics)
    /* close bidding, decide the bid */
    await L.go(p, 'leavewar'); await sleep(1200)
    const st = p.locator('.stage-go').filter({ hasText: /BIDDING CLOSED/ }).first()
    const stTxt = (await st.count()) ? (await st.innerText()).trim() : 'no stage button'
    if (await st.count()) { await st.click(); await sleep(900) }
    const conf = await p.evaluate(() => { const e = [...document.querySelectorAll('[role=dialog], .sheet, [class*=sheet], .airpop')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 200) : '' })
    if (conf) { const ok = p.locator('button:visible').filter({ hasText: /^(Close bidding|Confirm|Yes|OK|Continue)/ }).first(); if (await ok.count()) { await ok.click(); await sleep(900) } }
    const s2 = await lw('2-closed')
    const ap = await pressSheet('Approve')
    await L.go(p, 'editsched'); const l2 = await Q.readDay(p, TU, 'l2', { noPics: false })
    t.add('S25c.L2', `stage button "${stTxt}" pressed${conf ? ' (it asked: ' + conf + ')' : ''}; the cell's sheet then read "${s2.txt}"; Approve: ${ap}; his inputs: ${JSON.stringify(await T.recAll(p))}`, one(l2), fl(l2).length === 2 ? 'PASS' : 'FAIL', [s2.shot, ...l2.s.pics])
    /* change: AM */
    const s3 = await lw('3-approved')
    const am = await pressSheet('AM')
    const afterAm = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : '(sheet closed)' })
    await pic(p, 's25c-lw-after-AM')
    const am2 = await pressSheet('<LL')
    const afterLL = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : '(sheet closed)' })
    await pic(p, 's25c-lw-after-AM-LL')
    await closeSheet()
    await L.go(p, 'editsched'); const l3 = await Q.readDay(p, TU, 'l3', { noPics: false })
    t.add('S25c.L3', `the approved cell tapped again — the sheet read "${s3.txt}"; then AM pressed (${am}; the sheet then read: ${afterAm}); then LL pressed (${am2}; the sheet then read: ${afterLL}); his inputs: ${JSON.stringify(await T.recAll(p))}`, one(l3), 'RECORDED', [s3.shot, ...l3.s.pics])
    /* change: move the approved leave to Wednesday */
    const s3b = await lw('3b-before-move')
    const mv = await pressSheet('⇄Move')
    const wcell = p.locator('[data-testid="cell-split-2026-07-15"]')
    await wcell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
    await wcell.click().catch(() => {}); await sleep(900)
    const afterMv = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/s+/g, ' ').slice(0, 260) : '(no sheet)' })
    await pic(p, 's25c-lw-after-move')
    await closeSheet()
        await L.go(p, 'editsched'); const l3t = await Q.readDay(p, TU, 'l3b', { noPics: false }); const l3w = await Q.readDay(p, 2, 'l3b', { noPics: false })
    t.add('S25c.L3b', `the approved cell tapped: ${mv}; then Wednesday's cell tapped (the screen then: ${afterMv}); his inputs: ${JSON.stringify(await T.recAll(p))}`, `${Q.shortDay(TU, l3t)} || ${Q.shortDay(2, l3w)}`, 'RECORDED', [s3b.shot, ...l3t.s.pics, ...l3w.s.pics])
    /* removal */
    const nowRec = JSON.stringify(await T.recAll(p)); const delDate = /Jul 15/.test(nowRec) ? '2026-07-15' : '2026-07-14'
    const s4 = await lw('4-before-delete', delDate)
    const dl = await pressSheet('Delete')
    await pic(p, 's25c-lw-after-Delete')
    const conf2 = await p.evaluate(() => { const e = [...document.querySelectorAll('[role=dialog], .sheet, [class*=sheet], .airpop')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 200) : '' })
    if (conf2 && /sure|remove|delete/i.test(conf2)) { const ok = p.locator('button:visible').filter({ hasText: /^(Delete|Yes|Confirm|Remove)/ }).last(); if (await ok.count()) { await ok.click().catch(() => {}); await sleep(800) } }
    await L.go(p, 'editsched'); const l4 = await Q.readDay(p, TU, 'l4', { noPics: false }); const l4w = await Q.readDay(p, 2, 'l4', { noPics: false })
    t.add('S25c.L4', `the cell tapped (sheet: "${s4.txt}"); Delete: ${dl}${conf2 ? ' (then: ' + conf2 + ')' : ''}; his inputs: ${JSON.stringify(await T.recAll(p))}`, `${one(l4)} || ${Q.shortDay(2, l4w)}`, fl(l4).length === 0 && fl(l4w).length === 0 ? 'PASS' : 'FAIL', [s4.shot, ...l4.s.pics, ...l4w.s.pics])
  } catch (e) { R('S25c.LX', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's25c-LX')]) }
  R('S25c.Lerr', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
await medical()
await leaveWar()
T.done('bta-B-s25c')
