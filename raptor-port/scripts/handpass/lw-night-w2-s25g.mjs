// Walker 2 — scenario 25 (g) follow-up: who is told when Ranger is split off a shared leave by the drag window's words. desktop.
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, place, closeSheet, sleep, inputsOf, dragCells, typeInto } = H
const tag = 's25g-dk'
console.log('lw-night-w2-s25g v1', tag)
H.clearPics(tag)
H.KEEP.toasts = true
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const fmtS = a => JSON.stringify(a)
const w = await L.newCtx('desk')
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const snap = async n => { await L.shot(w, `${tag}-${n}`); return `${tag}-${n}` }
try {
  const bellOf = async () => {
    const btn = P.locator('#bellBtn, button[aria-label*="otification"], button[aria-label*="ell"], button[title*="ell"], button[title*="otification"]').first()
    const id = await btn.evaluate(e => e.id || e.getAttribute('aria-label') || e.title)
    await btn.click(); await sleep(w, 600)
    const text = await P.evaluate(() => { const pops = [...document.querySelectorAll('[id*="ell"], [class*="bell"], [class*="notif"]')].filter(e => e.getBoundingClientRect().height > 40 && e.innerText.trim().length > 5); return pops.map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 500)).slice(0, 2) })
    return { id, text }
  }
  await H.fileInputLeave(w, null, 'LL', dd(7), null, { remarks: 'Shared', several: [ids.Ranger, ids.Ridge] })
  await H.toWar(w, 'admin'); await L.reachCell(w, ids.Ranger, dd(7))
  await place(w, ids.Ranger, dd(8), 'LL', { approve: false, remarks: 'Pending8' })
  if (!(await dragCells(w, [ids.Ranger, dd(7)], [ids.Ranger, dd(8)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), 'Mine only')
  await L.press(w, T('sel-approve')); await sleep(w, 700)
  await closeSheet(w)
  const rg = (await inputsOf(P, ids.Ranger)).filter(i => i.from >= dd(1)).map(i => `${i.type} ${i.from.slice(5)} [${i.people.join(',')}] "${i.remarks}"`)
  const adminBell = await bellOf(); await snap('admin-bell'); await P.keyboard.press('Escape')
  await H.signOut(P); await H.signInAs(w, 'member')
  const memberBell = await bellOf(); await snap('ranger-bell')
  rec('25g-bell', 'desk', 'RECORD', `after the drag window's words split Ranger off the leave he shared with Ridge (Ranger's entries now ${fmtS(rg)}): the admin's bell (${adminBell.id}) reads ${fmtS(adminBell.text)}; Ranger's own bell (${memberBell.id}) reads ${fmtS(memberBell.text)}; Ridge has no sign-in to read`, [`${tag}-admin-bell`, `${tag}-ranger-bell`])
} catch (e) { rec('25g-bell', 'desk', 'NOT DONE', String(e).slice(0, 400), []); await snap('error').catch(() => {}) }
rec('25g-errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
