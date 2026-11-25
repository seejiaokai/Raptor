// shr-c-c8 v1 — Share C, C8: the plain-user round. The admin files a leave for two (LL Ranger + Hex, 08:00–10:00, Wed 15
// Jul) on the Inputs page; Ranger opens the Leave War, his remark window, types, and closes it by each way (✕, Escape, a
// tap outside it), reading the store after each; then the admin looks at the Inputs page, the schedule's Unavailable list
// (the Scheduler Board) and the bell; then Hex's bell. RECORD what each shows.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=desk|phone node scripts/handpass/shr-c-c8.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'desk', ENG = 'chromium', tg = `${SZ}-${ENG}`
console.log('shr-c-c8 v1', tg, L.OUT)
const WED = '2026-07-15', DAYS = ['Jul 15']
const WIN = T('remarks-sheet'), BOX = T('remarks-remarks')
const st = P => C.store(P, ['bane', 'rocky'], DAYS)
const rows = P => P.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld$=".str"]')].map(e => { const row = e.closest('tr, .sb-arow, .sb-row') || e.parentElement; const who = (row.innerText || '').replace(/\s+/g, ' '); return /Ranger|Hex/.test(who) ? `${/Ranger/.test(who) ? 'Ranger' : 'Hex'} ${e.value}-${row.querySelector('[data-ifld$=".end"]')?.value} "${row.querySelector('[data-ifld$=".rmks"]')?.value || ''}" [${e.getAttribute('data-ifld')}]` : null }).filter(Boolean))
const w = await C.world(SZ, ENG); const P = w.page
const pics = [], log = []
try {
  await C.signIn(w, 'ad')
  const iid = await L.fileInput(w, 'c8', WED, { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
  if (!iid) throw new Error('fixture did not land')
  log.push(['filed', await st(P)])
  await C.signOutIn(w, 'us'); await C.toWar(w)
  for (const [i, how] of ['✕', 'Escape', 'tap outside'].entries()) {
    await C.openCell(w, 'bane', WED, w.phone ? `c8-${tg}-${i + 1}a-open-q` : null)
    if (!(await C.vis(P, WIN))) throw new Error('Ranger\'s window did not open: ' + J(await C.sheet(P)))
    const shown = await C.valueOf(P, BOX)
    await C.typeInto(w, BOX, `C8 ${how}`)
    pics.push(await C.pic(w, `c8-${tg}-${i + 1}b-typed`, [WIN], 12))
    let where = null
    if (how === '✕') await C.press(w, T('remarks-cancel'), w.phone ? `c8-${tg}-${i + 1}c-close-q` : null)
    else if (how === 'Escape') await P.keyboard.press('Escape')
    else {
      /* a point on the page clear of the window and of every cell (the top bar's blank) */
      where = await P.evaluate(() => { const s = document.querySelector('[data-testid="remarks-sheet"]').getBoundingClientRect(); for (let y = 8; y < s.top - 10; y += 12) for (let x = 8; x < innerWidth - 8; x += 16) { const e = document.elementFromPoint(x, y); if (!e) continue; if (e.closest('button, a, input, textarea, [role=button], td, [data-testid^="cell-"], [data-testid^="month-"]')) continue; return { x, y, on: (e.dataset?.testid || e.id || e.tagName) + '.' + String(e.className).slice(0, 24) } } return null })
      if (!where) throw new Error('no blank point outside the window')
      if (w.phone) await C.finger(w, where.x, where.y, `c8-${tg}-${i + 1}c-outside-q`); else await P.mouse.click(where.x, where.y)
    }
    await sleep(700)
    const s = await st(P), open = await C.vis(P, WIN), other = await C.sheet(P)
    log.push([`closed by ${how}`, { shownWhenOpened: shown, windowStillOpen: open, otherWindow: open ? null : other?.id || null, tappedAt: where, note: await L.shownToast(P), store: s }])
    pics.push(await C.pic(w, `c8-${tg}-${i + 1}d-after-${how === '✕' ? 'x' : how.replace(' ', '-')}`))
    if (open) { await P.keyboard.press('Escape'); await sleep(300) }
    await C.closeAny(w)
  }
  const hexBell = await (async () => { await C.signOutIn(w, 'hex'); const b = await C.bellLines(w); pics.push(await C.pic(w, `c8-${tg}-5-hex-bell`)); return b })()
  await C.signOutIn(w, 'ad')
  const adBell = await C.bellLines(w); pics.push(await C.pic(w, `c8-${tg}-6-admin-bell`))
  await L.openDay(w, WED)
  const day = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] [data-popiid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120)).filter(t => /Ranger|Hex/.test(t)))
  pics.push(await C.pic(w, `c8-${tg}-7-inputs-day`, ['[data-testid="win-inputsday"]'], 10))
  if (await P.locator('[data-testid="win-inputsday-x"]').count()) await C.press(w, '[data-testid="win-inputsday-x"]')
  await L.go(P, 'editsched'); await P.evaluate(() => window.openScheduler(2)); await sleep(1000)
  const board = await rows(P)
  pics.push(await C.pic(w, `c8-${tg}-8-board-unavailable`, ['#sbBoard > [data-secmove$=".unav"]'], 8))
  const fin = await st(P)
  C.rec('C8 the plain-user round: the leave for two, Ranger\'s remark window typed and closed by ✕ / Escape / a tap outside; the Inputs page, the Board\'s Unavailable list, the bells', tg, 'RECORDED',
    `${J(log)}; Hex's bell ${J(hexBell)}; the admin's bell ${J(adBell)}; the Inputs page's day: ${J(day)}; the Board's Unavailable rows: ${J(board)}; final store ${J(fin)}`, pics)
} catch (e) { C.rec('C8', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(log), pics) }
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c8-${tg}.json`)
await L.finish()
