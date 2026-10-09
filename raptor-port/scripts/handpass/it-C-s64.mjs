import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const ISO = '2026-11-20'
const pics = []
const late = tag => p.evaluate(t => { const r = window.INPUTS.find(x => x.remarks === t); return r ? { late: !!window.isLateInput(r), note: window.lateNote(r), mod: r.mod, title: r.title || null, stamp: window.inputStampISO(r), due: window.inputOwnDueISO(r), by: r.by } : null }, tag)
const dayWarns = () => p.evaluate(() => window.validate().all.length)
await C.switchUser(w, 'us')
await C.fileNew(w, { iso: ISO, type: 'Event', title: 'Late test one', s: '10:00', e: '11:00', rmk: 'l64' })
const R = (await C.recAll(p, { remarks: 'l64' }))[0]
const s0 = await late('l64'); const w0 = await dayWarns()
await C.openSaved(w, ISO, R.iid); const i0 = await C.winInfo(p); pics.push(await C.pic(w, 's64-before-late')); await C.closeWins(p)
console.log('S0', JSON.stringify(s0), w0, i0.placed)
// admin: bring the deadline before today
await C.switchUser(w, 'ad')
const cut = await C.setCutoffDays(w, 60)
console.log('CUT', JSON.stringify(cut))
const s1 = await late('l64'); console.log('S1 (after setting, nothing edited)', JSON.stringify(s1))
await C.switchUser(w, 'us')
await C.winRetitle(w, ISO, R.iid, { title: 'Late test two' })
const s2 = await late('l64'); const w2 = await dayWarns()
await C.openSaved(w, ISO, R.iid); const i2 = await C.winInfo(p)
const card = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="idy-row-${iid}"]`); const t = c && c.querySelector('.latetag, [class*=late]'); return c ? { text: c.innerText.replace(/\s+/g, ' ').trim(), late: t ? { text: t.textContent, title: t.getAttribute('title') } : null } : null }, R.iid)
pics.push(await C.pic(w, 's64-after-retitle')); await C.closeWins(p)
await C.openList(w); await C.listRow(p, R.iid).scrollIntoViewIfNeeded().catch(() => {})
const lrow = await p.evaluate(iid => { const tr = document.querySelector(`#inBody tr[data-iid="${iid}"]`); const t = tr && tr.querySelector('.latetag'); return tr ? { late: t ? { text: t.textContent, title: t.getAttribute('title') } : null, text: tr.innerText.replace(/\s+/g, ' ').trim() } : null }, R.iid)
pics.push(await C.pic(w, 's64-list-late'))
console.log('S2', JSON.stringify(s2), w2, JSON.stringify(card), JSON.stringify(lrow))
// undo
await C.go(p, 'inputs'); const u = await C.undoBtn(w, 'undo')
const s3 = await late('l64'); const w3 = await dayWarns()
await C.openList(w); await C.listRow(p, R.iid).scrollIntoViewIfNeeded().catch(() => {})
const lrow3 = await p.evaluate(iid => { const tr = document.querySelector(`#inBody tr[data-iid="${iid}"]`); const t = tr && tr.querySelector('.latetag'); return tr ? { late: t ? { text: t.textContent, title: t.getAttribute('title') } : null, text: tr.innerText.replace(/\s+/g, ' ').trim() } : null }, R.iid)
pics.push(await C.pic(w, 's64-after-undo'))
console.log('S3', JSON.stringify(u), JSON.stringify(s3), w3, JSON.stringify(lrow3))
const ok = !s0.late && s2.late && /Late input — last changed/.test(s2.note) && w2 === w0 && u.pressed && s3.title === 'Late test one' && s3.mod === s0.mod && s3.late === s0.late
row(64, size, 'member (Ranger), admin sets the cut-off', ok ? 'PASS' : 'FAIL',
  `Ranger filed Event "Late test one" on Fri 20 Nov 2026 (not late: ${!s0.late}; placed line "${i0.placed}"). Admin set the Inputs gear cut-off to 60 days before the week (was ${JSON.stringify(cut.was)}; example "${cut.example}"; error "${cut.err}"); input right after, nothing edited: late ${s1.late}. Ranger retitled only the title -> "Late test two": late ${s2.late}; hover note "${s2.note}"; day card ${JSON.stringify(card)}; List row ${JSON.stringify(lrow)}; warnings in the app before ${w0} / after ${w2} (a new clash would raise it); window small print "${i2.placed}". Undo (${u.pressed ? 'pressed' : u.why}) -> title "${s3.title}", change stamp ${s3.mod} (before ${s0.mod}), late ${s3.late}; List row ${JSON.stringify(lrow3)}`, pics)
await C.finish(w, 's64')
