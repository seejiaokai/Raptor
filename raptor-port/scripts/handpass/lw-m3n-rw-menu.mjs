// THE WALK OF [LW-DRAG-MORE-MENU] (the night of 26 Oct 26): the drag window's ⋯ offers Post in beside Post out for one man,
// as the one-day window's ⋯ does (his D1326); dated from the drag's first day; it posts him in. Assertions of the right
// behaviour (walk-scripts §6), the built bundle on LW_PORT, desktop 1536 x 864 then an iPhone's size (a long press and
// drag), the picture right after each tap with the touched state held (D1281).
//   M1  desktop, admin: drag Drifter 2–3 Nov → ⋯ lists Attach · Other · Post out · Post in; Post in opens "PI from" on
//       2 Nov; Post in pressed → the window closes, and Drifter's 1 Nov reads before his first day
//   M2  desktop: a drag over two men → no Post in (nor Post out)
//   M3  phone, admin: the same on Ranger 9–10 Nov — the ⋯ with Post in, the panel, posted in
//   M4  phone, member: his own drag's ⋯ holds Attach alone
// Usage (from raptor-port/, the build served on LW_PORT): node scripts/handpass/lw-m3n-rw-menu.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-26-lw-m3-night/menu'
const fs = await import('node:fs')
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
fs.mkdirSync(L.OUT, { recursive: true })
L.clearPrefix('m')
console.log('lw-m3n-rw-menu →', L.OUT)
const log = [], verdicts = []
const note = (id, s) => { log.push({ id, s }); console.log(`   ${id} ${s}`) }
const judge = (id, ok, s) => { verdicts.push({ id, ok }); note(id, (ok ? 'PASS ' : 'FAIL ') + s) }
const menuItems = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="sel-more-menu"] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()))
const cellCls = (P, id, iso) => P.evaluate(([id, iso]) => { const e = document.querySelector(`[data-testid="cell-${id}-${iso}"]`); return e ? e.className : null }, [id, iso])

async function postInWalk(w, tag, who, a, z) {
  const P = w.page
  const open = await M.dragCells(w, [who, a], [who, z])
  await M.tapPic(w, T('sel-more'), `${tag}-1-more-pressed`)
  await P.waitForSelector(T('sel-more-menu'))
  const items = await menuItems(P)
  await M.cropPic(w, `${tag}-2-more-menu`, [T('select-sheet')]).catch(() => {})
  const hasPi = items.includes('Post in')
  let date = null, closed = false, before = null, after = null
  if (hasPi) {
    await M.tapPic(w, T('sel-postin'), `${tag}-3-postin-pressed`)
    await P.waitForTimeout(400)
    date = await P.locator(T('sel-pi-date')).getAttribute('data-value')
    await M.cropPic(w, `${tag}-4-postin-panel`, [T('select-sheet')]).catch(() => {})
    before = await cellCls(P, who, prevDay(a))
    await M.tapPic(w, T('sel-pi-confirm'), `${tag}-5-confirm-pressed`)
    await P.waitForTimeout(800)
    closed = !(await L.vis(P, T('select-sheet')))
    after = await cellCls(P, who, prevDay(a))
    await M.rangeShot(w, who, prevDay(prevDay(a)), z, `${tag}-6-row-after`).catch(() => {})
  }
  return { open, items, hasPi, date, closed, before, after }
}
function prevDay(iso) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10) }

/* ---------- desktop ---------- */
const w = await M.start('desk', 'chromium', 'admin', undefined, undefined, 2)
const ids = await M.ids(w.page)
const r1 = await postInWalk(w, 'm1', ids.Drifter, '2026-11-02', '2026-11-03')
judge('M1', r1.open && ['Attach', 'Other', 'Post out', 'Post in'].every(t => r1.items.includes(t)) && r1.date === '2026-11-02' && r1.closed && r1.before !== r1.after,
  `drag window open ${r1.open}; ⋯ lists ${JSON.stringify(r1.items)}; PI from ${r1.date}; closed after Post in ${r1.closed}; 1 Nov's cell "${r1.before}" → "${r1.after}"`)

{
  const P = w.page
  await P.keyboard.press('Escape').catch(() => {})
  const open = await M.dragCells(w, [ids.Ranger, '2026-11-16'], [ids.Comet, '2026-11-16'])
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'))
  const items = await menuItems(P)
  await M.cropPic(w, 'm2-1-two-men-more', [T('select-sheet')]).catch(() => {})
  judge('M2', open && !items.includes('Post in') && !items.includes('Post out'), `two men: ⋯ lists ${JSON.stringify(items)}`)
  await P.keyboard.press('Escape').catch(() => {})
}
const deskErrs = [...w.errs]
await w.ctx.close()

/* ---------- phone ---------- */
const m = await M.start('phone', 'chromium', 'admin', undefined, undefined, 3)
const pids = await M.ids(m.page)
const r3 = await postInWalk(m, 'm3', pids.Ranger, '2026-11-09', '2026-11-10')
judge('M3', r3.open && r3.items.includes('Post in') && r3.date === '2026-11-09' && r3.closed && r3.before !== r3.after,
  `phone: drag window open ${r3.open}; ⋯ lists ${JSON.stringify(r3.items)}; PI from ${r3.date}; closed ${r3.closed}; 8 Nov's cell "${r3.before}" → "${r3.after}"`)
const phoneErrs = [...m.errs]
await m.ctx.close()

const u = await M.start('phone', 'chromium', 'member', undefined, undefined, 3)
{
  const P = u.page
  const uids = await M.ids(P)
  const open = await M.dragCells(u, [uids.Ranger, '2026-11-23'], [uids.Ranger, '2026-11-24'])
  await M.tapPic(u, T('sel-more'), 'm4-1-member-more-pressed')
  await P.waitForSelector(T('sel-more-menu'))
  const items = await menuItems(P)
  await M.cropPic(u, 'm4-2-member-more-menu', [T('select-sheet')]).catch(() => {})
  judge('M4', open && JSON.stringify(items) === JSON.stringify(['Attach']), `member: ⋯ lists ${JSON.stringify(items)}`)
}
note('errors', JSON.stringify([...deskErrs, ...phoneErrs, ...u.errs].slice(0, 8)))
fs.writeFileSync(`${L.OUT}/m-log.json`, JSON.stringify(log, null, 1))
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await L.closeBrowser?.()
process.exit(0)
