// Walker 2 — scenario 33: the other doors to the same window. usage: node lw-night-w2-s33.mjs <desk|phone>
//  (a) Ranger's Inputs-filed leave (the blue "filed on the Inputs page" edge) → tap → what opens; a day holding two entries → the day's list shows such words how.
//  (b) the admin switched to the member view (D292) on his own approved leave → the window.
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOf, inputsOn, warRecs } = H
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone'
const tag = `s33-${which === 'desk' ? 'dk' : 'ph'}`
console.log('lw-night-w2-s33 v1', which, tag)
H.clearPics(tag)
H.KEEP.toasts = true
const nv = n => `2026-11-${String(n).padStart(2, '0')}`
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const fmtS = a => JSON.stringify(a)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const ME = ids.Ranger, ADM = ids.Saber
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const sc = async (id, fn) => { console.log(`-- ${id} [${which}]`); try { await fn() } catch (e) { rec(id, which, 'NOT DONE', String(e).slice(0, 400), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w); if (await L.vis(P, '#inpEditCancel')) await P.click('#inpEditCancel').catch(() => {}) } }
const geomOf = pfx => P.evaluate(pfx => {
  const sheet = document.querySelector(`[data-testid="${pfx}-sheet"]`) || document.querySelector('.bidsheet[data-testid]:last-of-type')
  const r = s => document.querySelector(s)
  const b = e => { if (!e) return null; const x = e.getBoundingClientRect(); return { t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right), h: Math.round(x.height), w: Math.round(x.width) } }
  return { text: sheet?.innerText.replace(/\s+/g, ' ').trim(), box: b(r(`[data-testid="${pfx}-remarks"]`)), tick: b(r(`[data-testid="${pfx}-tl"]`)), doc: b(r(`[data-testid="${pfx}-doc-row"] button`)), saveBtn: [...(sheet?.querySelectorAll('button') ?? [])].some(x => /^save$/i.test(x.innerText.trim())), labels: [...(sheet?.querySelectorAll('.lab') ?? [])].map(e => e.innerText.trim()) }
}, pfx)

// fixtures as admin: Ranger's war-approved PM OL on 24 Nov (for the two-entry day), the admin's own approved LL on 14 Dec
await place(w, ME, nv(24), 'OL', { approve: true, portion: 'pm' })
await place(w, ADM, dd(14), 'LL', { approve: true, remarks: 'Mine' })
console.log('fixtures:', fmtS((await inputsOf(P, ME)).filter(i => i.from >= '2026-11-01').map(i => `${i.type}-${i.half} ${i.from}`)), fmtS((await inputsOf(P, ADM)).filter(i => i.from >= '2026-12-01').map(i => `${i.type} ${i.from} "${i.remarks}"`)))

// ---- (b) first: the admin switched to the member view, on his own approved leave
await sc('33b', async () => {
  const before = await P.evaluate(() => document.querySelector('#roleBadge')?.innerText.trim() ?? document.querySelector('#drawerRole')?.innerText.trim())
  if (w.phone) { await L.press(w, '#burger'); await sleep(w, 400); await L.step(w, `${tag}-33b-switch`, '#drawerRole') } else { await L.press(w, '#roleBadge'); await sleep(w, 800); await snap('33b-switched') }
  await sleep(w, 1200)
  const after = await P.evaluate(() => document.querySelector('#roleBadge')?.innerText.trim() ?? document.querySelector('#drawerRole')?.innerText.trim())
  await H.toWar(w, 'admin').catch(async () => { await P.evaluate(() => window.go('leavewar')); await sleep(w, 1200) })
  await L.reachCell(w, ADM, dd(14))
  await L.openCellR(w, ADM, dd(14), w.phone ? `${tag}-33b-tap-q` : null); await sleep(w, 500)
  const sheet = await H.sheetOf(P)
  const g = sheet === 'remarks-sheet' ? await geomOf('remarks') : { sheet }
  const val = sheet === 'remarks-sheet' ? await P.locator(T('remarks-remarks')).inputValue() : null
  await snap('33b-window')
  let saved = null
  if (sheet === 'remarks-sheet') { await L.press(w, T('remarks-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Mine changed'); await P.keyboard.press('Enter'); await sleep(w, 500); saved = (await inputsOn(P, ADM, dd(14)))[0]?.remarks; await closeSheet(w) }
  rec('33b', which, sheet === 'remarks-sheet' && val === 'Mine' && saved === 'Mine changed' && !g.saveBtn && g.labels.length === 0 ? 'PASS' : 'FAIL', `the badge read "${before}", after the switch "${after}"; the admin's tap on his own approved 14 Dec leave opens ${sheet} ${fmtS(g)}; the box held "${val}"; typed "Mine changed" + Enter: saved "${saved}"`, [`${tag}-33b-window`].concat(w.phone ? [`${tag}-33b-tap-q`] : []))
  /* back to the admin view */
  if (w.phone) { await L.press(w, '#burger'); await sleep(w, 400); await L.press(w, '#drawerRole') } else await L.press(w, '#roleBadge')
  await sleep(w, 1000)
})

// ---- (a) Ranger, signed in: files a leave straight on the Inputs page
await H.signOut(P); await H.signInAs(w, 'member')
await sc('33a', async () => {
  /* an Inputs-filed LL (whole day) on 20 Nov with words, and a morning LL on 24 Nov (the other half of the day already holds the admin's afternoon OL) */
  await H.fileInputLeave(w, null, 'LL', nv(20), null, { remarks: 'Filed on Inputs' })
  await H.fileInputLeave(w, null, 'LL', nv(24), null, { span: 'AM', remarks: 'Filed AM' })
  await H.toWar(w, 'member')
  const ins = (await inputsOf(P, ME)).filter(i => i.from >= '2026-11-01').map(i => `${i.type}${i.half ? '-' + i.half : ''} ${i.from.slice(5)}${i.lw ? '' : ' [inputs]'} "${i.remarks}"`)
  console.log('his inputs', fmtS(ins))
  // the one-entry day
  await L.openCellR(w, ME, nv(20), w.phone ? `${tag}-33a-tap-q` : null); await sleep(w, 500)
  const s1 = await H.sheetOf(P)
  const g1 = s1 === 'remarks-sheet' ? await geomOf('remarks') : { sheet: s1, text: (await L.sheetDump(P))?.text, tids: (await L.sheetDump(P))?.tids }
  const v1 = s1 === 'remarks-sheet' ? await P.locator(T('remarks-remarks')).inputValue() : null
  await snap('33a-window')
  let edited = null
  if (s1 === 'remarks-sheet') { await L.press(w, T('remarks-remarks')); await P.keyboard.press('Control+A'); await P.keyboard.type('Edited here'); await P.keyboard.press('Enter'); await sleep(w, 500); edited = (await inputsOn(P, ME, nv(20)))[0]?.remarks }
  await closeSheet(w)
  rec('33a', which, 'RECORD', `Ranger's Inputs-filed LL on 20 Nov ("Filed on Inputs", the blue edge): his tap opens ${s1} — ${fmtS(g1)}; the box held "${v1}"; typed "Edited here" + Enter: saved "${edited}" — the same editable one row ${s1 === 'remarks-sheet' ? 'as an approved leave filed on the war' : 'NOT: another window'}`, [`${tag}-33a-window`].concat(w.phone ? [`${tag}-33a-tap-q`] : []))
  // the two-entry day: 24 Nov holds his Inputs-filed morning LL and the admin's war-approved afternoon OL
  await L.openCellR(w, ME, nv(24), w.phone ? `${tag}-33a2-tap-q` : null); await sleep(w, 500)
  const s2 = await H.sheetOf(P)
  const list = s2 === 'daylist-sheet' ? await P.evaluate(() => ({ text: document.querySelector('[data-testid="daylist-sheet"]').innerText.replace(/\s+/g, ' ').trim(), boxes: [...document.querySelectorAll('[data-testid="daylist-sheet"] textarea, [data-testid="daylist-sheet"] input[type=text]')].map(e => ({ val: e.value, ro: e.readOnly || e.disabled })), readOnlyWords: [...document.querySelectorAll('[data-testid="daylist-sheet"] .bp-words, [data-testid="daylist-sheet"] .dl-words, [data-testid="daylist-sheet"] .note')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 8) })) : { sheet: s2 }
  await snap('33a-daylist')
  await closeSheet(w)
  rec('33a2', which, 'RECORD', `the day 24 Nov (his Inputs-filed morning LL "Filed AM" and the war's afternoon OL): his tap opens ${s2}: ${fmtS(list)} — whether the Inputs-filed words are an editable box there or read only is what the list's own boxes say (ro = read only)`, [`${tag}-33a-daylist`].concat(w.phone ? [`${tag}-33a2-tap-q`] : []))
})
rec('33-errors', which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
