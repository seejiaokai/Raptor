// Walker 2 — scenario 26: words typed in the drag window, then no action (✕, Escape, a tap behind), then Delete. usage: node lw-night-w2-s26.mjs [desk|phone]
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, rec, kinds, place, dayWindow, closeSheet, warRecs, dayWords, dragCells, typeInto, sleep, inputsOf } = H
const size = process.argv[2] || 'desk'
const tag = `s26-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-night-w2-s26 v1', size, tag)
H.clearPics(tag)
const w = await L.newCtx(size)
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const shots = []
const snap = async n => { await L.shot(w, `${tag}-${n}`); shots.push(`${tag}-${n}`); return `${tag}-${n}` }
const words = async (who, days) => { const o = {}; for (const n of days) o[n] = (await dayWords(P, ids[who], dd(n))).text; return o }
const fmt = o => Object.entries(o).map(([d, t]) => `${d} Dec: ${t}`).join(' ; ')
const sc = async (id, fn) => { console.log(`-- ${id} [${size}]`); try { await fn() } catch (e) { rec(`26${id}`, size, 'NOT DONE', String(e).slice(0, 400), []); await snap(`${id}-error`).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}); await L.closeAny(w) } }
const allWith = async text => { /* every saved record anywhere holding exactly these words */
  const recs = await P.evaluate(t => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k) continue; const v = localStorage.getItem(k) || ''; if ((k.startsWith('raptor:leavewar/rec:') || k.startsWith('raptor:inputs/')) && v.includes(`"remarks":"${t}"`)) o.push(k.slice(0, 40)) } return o }, text)
  return recs
}
async function fixture(who, a, b, wa, wb) {
  await place(w, ids[who], dd(a), 'LL', { approve: false, remarks: wa })
  await place(w, ids[who], dd(b), 'OL', { approve: false, remarks: wb })
  const x = await words(who, [a, b])
  if (!x[a].includes(`LL/pending/"${wa}"`) || !x[b].includes(`OL/pending/"${wb}"`)) throw new Error(`${who} fixture: ${fmt(x)}`)
  return x
}
for (const way of ['a', 'b']) await sc(way, async () => {
  const who = way === 'a' ? 'Reaper' : 'Anvil'
  const typed = way === 'a' ? 'ksa words' : 'ksb words'
  const f = await fixture(who, 1, 2, `${way}-old1`, `${way}-old2`)
  if (!(await dragCells(w, [ids[who], dd(1)], [ids[who], dd(2)]))) throw new Error('no drag window')
  await typeInto(w, T('sel-remarks'), typed)
  await snap(`${way}-typed`)
  if (way === 'a') { if (w.phone) await L.step(w, `${tag}-a-close`, T('sel-cancel')); else { await L.press(w, T('sel-cancel')); await sleep(w, 500) } }
  else { await P.keyboard.press('Escape'); await sleep(w, 500) }
  const closed = !(await L.vis(P, T('select-sheet')))
  const x = await words(who, [1, 2])
  await snap(`${way}-after`)
  const kept = [1, 2].every(n => x[n].includes(`"${typed}"`))
  rec(`26${way}`, size, 'RECORD', `${who} 1 Dec LL "${way}-old1", 2 Dec OL "${way}-old2", dragged 1–2 Dec, typed "${typed}", then ${way === 'a' ? '✕' : 'Escape'} — the window ${closed ? 'closed' : 'STAYED OPEN'}; the days now: ${fmt(x)} — ${kept ? 'the typed words WERE kept on both bids (D1339: never dropped)' : 'the typed words were NOT kept (the bids hold their old words)'}`, [`${tag}-${way}-typed`, `${tag}-${way}-after`].concat(w.phone && way === 'a' ? [`${tag}-a-close-q`] : []))
})
await sc('c', async () => {
  /* Cinch's 1–2 Dec bids, drag over them, type, then tap Piston's 2 Dec cell (his own pending bid "p-own") behind the window */
  await fixture('Cinch', 1, 2, 'c-old1', 'c-old2')
  await place(w, ids.Piston, dd(2), 'LL', { approve: false, remarks: 'p-own' })
  if (!(await dragCells(w, [ids.Cinch, dd(1)], [ids.Cinch, dd(2)]))) throw new Error('no drag window')
  const typed = 'ksc words'
  await typeInto(w, T('sel-remarks'), typed)
  await snap('c-typed')
  const b = await P.locator(T(L.cellId(ids.Piston, dd(2)))).first().boundingBox()
  if (w.phone) await L.tapAt(w, b.x + b.width / 2, b.y + b.height / 2, `${tag}-c-tap-q`); else await P.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(w, 700)
  const sheet = await H.sheetOf(P)
  const wTap = sheet === 'bid-picker' ? { remarks: await P.locator(T('bid-remarks')).inputValue(), who: await L.txt(P, '[data-testid="bid-picker"] .who') } : { sheet }
  await snap('c-tapped-window')
  await closeSheet(w)
  const x = await words('Cinch', [1, 2]), px = await words('Piston', [2])
  const stray = await allWith(typed)
  const ok = sheet === 'bid-picker' && wTap.remarks === 'p-own' && /p-own/.test(px[2]) && !/ksc/.test(px[2])
  rec('26c', size, ok ? 'PASS' : 'FAIL', `Cinch's 1–2 Dec bids dragged, typed "${typed}", then a tap on Piston's 2 Dec cell behind the window: the window opened is ${sheet} (${JSON.stringify(wTap)}); Piston's 2 Dec now: ${px[2]}; Cinch's days: ${fmt(x)}; records holding "${typed}": ${stray.length} (${stray.join(', ') || 'none'}) — the typed words ${/ksc words/.test(x[1]) && /ksc words/.test(x[2]) ? 'WERE kept on Cinch\'s two bids' : 'were NOT kept on Cinch'}, none on Piston`, [`${tag}-c-typed`].concat(w.phone ? [`${tag}-c-tap-q`] : []).concat([`${tag}-c-tapped-window`]))
})
await sc('d', async () => {
  await fixture('Sidewinder', 1, 2, 'd-old1', 'd-old2')
  if (!(await dragCells(w, [ids.Sidewinder, dd(1)], [ids.Sidewinder, dd(2)]))) throw new Error('no drag window')
  const typed = 'ksd words'
  await typeInto(w, T('sel-remarks'), typed)
  await snap('d-typed')
  if (w.phone) await L.step(w, `${tag}-d-delete1`, T('sel-delete')); else { await L.press(w, T('sel-delete')); await sleep(w, 500); await snap('d-delete1') }
  const ask = await L.txt(P, T('sel-note'))
  const mid = await words('Sidewinder', [1, 2])
  if (w.phone) await L.step(w, `${tag}-d-delete2`, T('sel-delete')); else { await L.press(w, T('sel-delete')); await sleep(w, 600) }
  await snap('d-after')
  const x = await words('Sidewinder', [1, 2])
  const stray = await allWith(typed)
  const gone = [1, 2].every(n => x[n] === 'req: - | input: -')
  rec('26d', size, gone && stray.length === 0 ? 'PASS' : 'FAIL', `Sidewinder's 1–2 Dec bids dragged, typed "${typed}", Delete: first tap asked "${ask}" (the days then: ${fmt(mid)}); second tap: ${fmt(x)}; records anywhere holding "${typed}": ${stray.length} (${stray.join(', ') || 'none'})`, [`${tag}-d-typed`, `${tag}-d-delete1` + (w.phone ? '-q' : ''), `${tag}-d-after`])
})
rec('26-errors', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
H.saveResults(tag)
await w.ctx.close()
await H.finish()
