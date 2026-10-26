// Walker 2 — scenario 28c: what changes on screen at the Enter that saves his own leave's words (the top bar's Undo lights, with its title).
process.env.LW_OUT ||= '2026-10-25-lw-night/w2'
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, sleep } = H
H.KEEP.toasts = true
const w = await L.newCtx('desk')
const P = w.page
await H.signInAs(w, 'admin')
await H.place(w, 'bane', '2026-12-14', 'LL', { approve: true })
await H.signOut(P); await H.signInAs(w, 'member')
await L.openCellR(w, 'bane', '2026-12-14')
const undo = async () => P.evaluate(() => { const b = document.querySelector('#undoBtn'); const c = getComputedStyle(b); return { title: b.title, dis: b.disabled, opacity: c.opacity, color: c.color } })
console.log('before typing', JSON.stringify(await undo()))
await L.press(w, T('remarks-remarks')); await P.keyboard.type('x words'); await sleep(w, 200)
console.log('typed, not saved', JSON.stringify(await undo()))
await P.keyboard.press('Enter'); await sleep(w, 500)
console.log('after Enter', JSON.stringify(await undo()))
await L.closeBrowser()
