// Walker 2 — scenarios 28 / 29, the checks that need the member's Inputs page and a reload:
//   28e the Inputs page entry shows the words; 28f after a reload the words are there; 28g the admin's one-day window shows them;
//   29f2 till unticked → the Inputs page prints no till; ticked again → it does.   usage: node lw-night-w2-s28x.mjs <desk|phone|webkit>
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOn, dayWindow } = H
const which = process.argv[2] || 'desk'
const tag = `s28x-${which === 'desk' ? 'dk' : which === 'webkit' ? 'wk' : 'ph'}`
console.log('lw-night-w2-s28x v2', which, tag)
H.clearPics(tag)
H.KEEP.toasts = true
const w = await L.newCtx(which === 'desk' ? 'desk' : 'phone', which === 'webkit' ? 'webkit' : 'chromium')
const P = w.page
const D = '2026-12-14', D2 = '2026-12-16', ME = 'bane'
const snap = async n => { await L.shot(w, `${tag}-${n}`); return `${tag}-${n}` }
const fmtS = a => JSON.stringify(a)
try {
  await H.signInAs(w, 'admin')
  await place(w, ME, D, 'LL', { approve: true })
  await place(w, ME, D2, 'LL', { approve: true })
  await H.signOut(P); await H.signInAs(w, 'member')
  await L.openCellR(w, ME, D)
  await L.press(w, T('remarks-remarks')); await P.keyboard.type('At home, call me'); await P.keyboard.press('Enter'); await sleep(w, 500)
  await closeSheet(w)
  const rows = await H.inputsPageRows(w, 'Ranger', `${tag}-inputs-page`)
  const r14 = rows.filter(r => /14 Dec/.test(r) || /At home, call me/.test(r))
  rec('28e', which, r14.some(r => /At home, call me/.test(r)) ? 'PASS' : 'FAIL', `the Inputs page (Ranger's own list, all dates) after the save: ${fmtS(r14.map(r => r.slice(0, 160)))}`, [`${tag}-inputs-page`])
  await H.toWar(w, 'member')
  await H.reloadAs(w, 'member')
  const st = (await inputsOn(P, ME, D))[0]?.remarks
  const win = await dayWindow(w, ME, D); await snap('reload-window'); await closeSheet(w)
  rec('28f', which, win.sheet === 'remarks-sheet' && win.remarks === 'At home, call me' && st === 'At home, call me' ? 'PASS' : 'FAIL', `after a reload (signed in again as Ranger): saved "${st}"; his tap on 14 Dec opens ${win.sheet} reading "${win.remarks}" (till "${win.till}")`, [`${tag}-reload-window`])
  // 29f2 on 16 Dec
  await L.openCellR(w, ME, D2); await L.press(w, T('remarks-till')); await sleep(w, 600); await closeSheet(w)
  const off = (await inputsOn(P, ME, D2))[0]?.till
  const rowsOff = (await H.inputsPageRows(w, 'Ranger', `${tag}-inputs-unticked`)).filter(r => /16 Dec/.test(r))
  await H.toWar(w, 'member')
  await L.openCellR(w, ME, D2); await L.press(w, T('remarks-till')); await sleep(w, 600); await closeSheet(w)
  const on = (await inputsOn(P, ME, D2))[0]?.till
  const rowsOn = (await H.inputsPageRows(w, 'Ranger', `${tag}-inputs-reticked`)).filter(r => /16 Dec/.test(r))
  rec('29f2', which, off === false && !/till/.test(rowsOff.join(' ')) && on !== false && /till 16 Dec/.test(rowsOn.join(' ')) ? 'PASS' : 'FAIL', `16 Dec: till unticked → saved ${fmtS(off)}, the Inputs page row ${fmtS(rowsOff.map(r => r.slice(0, 120)))}; ticked again → saved ${fmtS(on)}, the Inputs page row ${fmtS(rowsOn.map(r => r.slice(0, 120)))}`, [`${tag}-inputs-unticked`, `${tag}-inputs-reticked`])
  await H.toWar(w, 'member')
  await H.signOut(P); await H.signInAs(w, 'admin')
  const aw = await dayWindow(w, ME, D); await snap('admin-window')
  const geom = await P.evaluate(() => ({ lit: [...document.querySelectorAll('[data-testid="bid-picker"] .lit')].map(e => e.dataset.testid), text: document.querySelector('[data-testid="bid-picker"]')?.innerText.replace(/\s+/g, ' ').slice(0, 200) }))
  await closeSheet(w)
  rec('28g', which, aw.sheet === 'bid-picker' && aw.remarks === 'At home, call me' ? 'PASS' : 'FAIL', `the admin's one-day window on Ranger's 14 Dec leave (${aw.sheet}) reads "${aw.remarks}", till "${aw.till}"; the window: "${geom.text}"; lit ${fmtS(geom.lit)}`, [`${tag}-admin-window`])
} catch (e) { rec('28x', which, 'NOT DONE', String(e).slice(0, 400), []); await snap('error').catch(() => {}) }
rec('28x-errors', which, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
