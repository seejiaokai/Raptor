/* helper walk S27 (with the load of S24 as its set-up): the load's list — "Later", then answers.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-13.mjs [desk|phone] */
import { L, J, loadSetup, loadVersion, list, bell, bellLines, closeBell, cardOf, closeDay, signAs, closeWindows, board, closeBoard, rec, noteNow, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S27 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-13 S27 version 1', SIZE)
const listBtns = () => p.evaluate(() => { const win = document.querySelector('[data-testid="win-oilday"]'); return win ? [...win.querySelectorAll('button')].filter(b => b.getClientRects().length).map(b => (b.getAttribute('data-testid') || '') + ':' + (b.innerText || '').trim().slice(0, 14)) : null })
const listText = () => p.evaluate(() => { const win = document.querySelector('[data-testid="win-oilday"]'); return win ? (win.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600) : null })
const adminBell = async () => { const b = await bellLines(w); await closeBell(w); return b }
try {
  let o, ld, bell0
  await part(w, S, 'S27a set-up and the load', 'Friday published with A..F; made a holiday; A answered; B, C, D taken off; the Original loaded: the note counts the inputs put back needing an answer; the list opens', async () => {
    o = await loadSetup(w)
    bell0 = await adminBell()
    const where = w.phone ? 'board' : 'week'
    if (w.phone) await board(w, FRI); else await L.go(w, 'editsched')
    ld = await loadVersion(w, FRI, where)
    await L.pic(w, `S27a-loaded-${T}`)
    const ids = { A: o.A.id, B: o.B.id, C: o.C.id, D: o.D.id, E: o.E.id, F: o.F.id }
    const txt = await listText(), btns = await listBtns()
    rowOut(S, 'S27a the load (RECORD of the S24 sentence)', 'EXPECTED (S24): a note ending "· 2 inputs need an OIL answer" (B and C); the list opens for Friday listing B and C, not A, D or F', `ids ${J(ids)}; fixture: publish ${J(o.pub)}, holiday list ${J(o.hol.list && { count: o.hol.list.count, ids: o.hol.list.ids })}; from the ${where}: button "${ld.first}"${ld.second ? ' then "' + ld.second + '"' : ''}; note "${ld.note}"; list ${J(ld.list)}; list text ${J(txt)}; list buttons ${J(btns)}`,
      / · 2 inputs need an OIL answer$/.test(ld.note) && !!ld.list && ld.list.ids.includes(o.B.id) && ld.list.ids.includes(o.C.id) && !ld.list.ids.includes(o.A.id) && !ld.list.ids.includes(o.D.id) && !ld.list.ids.includes(o.F.id))
  })
  await part(w, S, 'S27b "Later"', 'the OIL? tags stand; the bell\'s line is as it was; no member notified; the filer (Ranger) of B is asked in his own bell', async () => {
    await w.press('[data-testid="odl-later"]'); await L.sleep(500)
    const gone = !(await list(p)), note = await noteNow(p)
    await closeWindows(w)
    const cB = await cardOf(w, FRI_ISO, o.B.id), cC = await cardOf(w, FRI_ISO, o.C.id)
    await closeDay(w)
    const bell1 = await adminBell()
    await L.pic(w, `S27b-after-later-${T}`)
    rowOut(S, 'S27b "Later": admin side', 'the list closes; B and C wear the OIL? tag; the schedulers\' bell reads as before', `bell before ${J(bell0)}; the list closed ${gone}; note "${note}"; B's card ${J(cB)}; C's card ${J(cC)}; bell after ${J(bell1)}`, gone && cB.oilq && cC.oilq && bell0.txt === bell1.txt)
    await signAs(w, 'us', 'us')
    const mb = await bellLines(w)
    const q = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 220) : null })
    await L.pic(w, `S27b-member-bell-${T}`)
    rowOut(S, 'S27b "Later": B\'s filer (Ranger)', 'his bell asks him an OIL question for Hangar brief', `member bell ${J(mb)}; after pressing it a question: ${J(q)}`, !!q && /Hangar brief/.test(q))
    await p.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="oilconf"] button')].find(x => /^Back$/.test(x.textContent.trim())); if (b) b.click() }); await L.sleep(300)
    await p.evaluate(() => { const b = document.querySelector('#inpEditCancel'); if (b) b.click() }); await L.sleep(300)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S27c reopen from the bell, "Yes to all", Save', 'the list reopens from the bell with B and C; after Save the tags are gone, the bell line gone, nobody notified', async () => {
    const info = await p.evaluate(() => { const b = [...document.querySelectorAll('#sbBell, #notifyBell')].find(e => e.getClientRects().length); b.click(); return !!b })
    await L.sleep(500)
    const opened = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); const item = l && [...l.querySelectorAll('*')].find(e => /need an OIL answer|needs an OIL answer/.test(e.textContent) && e.children.length === 0); if (!item) return null; (item.closest('button, a, [role=button], li, div') || item).click(); return item.textContent.trim() })
    await L.sleep(700)
    const l1 = await list(p), btns = await listBtns()
    await L.pic(w, `S27c-reopened-${T}`)
    rowOut(S, 'S27c reopened from the bell', 'pressing the bell\'s line opens the day\'s list with B and C', `the bell line pressed: ${J(opened)}; list ${J(l1)}; buttons ${J(btns)}`, !!l1 && l1.ids.includes(o.B.id) && l1.ids.includes(o.C.id))
    if (l1) {
      const all = await p.evaluate(() => { const win = document.querySelector('[data-testid="win-oilday"]'); const b = win && [...win.querySelectorAll('button')].find(x => /yes to all/i.test(x.textContent)); if (!b) return false; b.click(); return true })
      await L.sleep(300)
      await w.press('[data-testid="odl-save"]'); await L.sleep(800)
      const note = await noteNow(p), l2 = await list(p)
      await closeWindows(w)
      await L.pic(w, `S27c-after-save-${T}`)
      const cB = await cardOf(w, FRI_ISO, o.B.id), cC = await cardOf(w, FRI_ISO, o.C.id)
      await closeDay(w)
      const bellA = await adminBell()
      const rB = await rec(p, o.B.id), rC = await rec(p, o.C.id)
      rowOut(S, 'S27c "Yes to all", Save', 'the list closes; B and C answered Yes; no OIL? tag on their cards; the bell has no OIL line', `Yes to all pressed ${all}; note "${note}"; list after ${J(l2)}; B ${J(rB)}; C ${J(rC)}; cards ${J(cB)} / ${J(cC)}; bell ${J(bellA)}`, all && !l2 && !!rB.oil && !!rC.oil && !cB.oilq && !cC.oilq && !(bellA.txt && /need.* OIL answer/.test(bellA.txt) && !/Mark all read/.test('')))
      await signAs(w, 'us', 'us')
      const mb = await bellLines(w)
      await L.pic(w, `S27c-member-bell-${T}`)
      rowOut(S, 'S27c nobody notified of the answer (RECORD)', 'RECORD: Ranger\'s bell after the answer', `member bell ${J(mb)}`, true)
      await closeBell(w)
      await p.evaluate(() => { const b = document.querySelector('#inpEditCancel'); if (b) b.click() })
      await signAs(w, 'ad', 'a')
    }
  })
} finally { await L.close(w) }
