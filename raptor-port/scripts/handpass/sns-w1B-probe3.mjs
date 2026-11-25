// sns-w1B-probe3 — how a crew-list tap with nothing armed selects a man (the green "where can he go" rings), proved first.
import './sns-w1B-env.mjs'
const Y = await import('./sns-w1B-lib.mjs')
const { T, L, W5, RANGER, IPMAN, WK1, J, sleep, postR, blank, disarm } = Y
const ringsNow = p => p.evaluate(() => ({ ok: document.querySelectorAll('#schedBoard .oktake, #schedBoard .oktake-f').length, okWeek: document.querySelectorAll('#eWeek .oktake, #eWeek .oktake-f').length, sel: [...document.querySelectorAll('.puck.sel')].map(e => e.dataset.person).slice(0, 5), armed: window.ARM && window.ARM.key }))
await T.run('probe3', process.env.SZ || 'd', async (p, W) => {
  const a = await blank(p, W, 5, 'f')
  await L.openBoard(p, W, 5)
  await W5.boardDrawer(p, W, true)
  W.rec('0', 'board open, nothing armed', 'REC', J(await ringsNow(p)))
  await W.press(p, `#schedBoard .rpuck[data-person="${RANGER}"]:visible`, 'rpuck'); await sleep(500)
  W.rec('1', 'press .rpuck (Ranger)', 'REC', J(await ringsNow(p)), await W.pic(p, 'p3-1'))
  await p.keyboard.press('Escape'); await sleep(300)
  await W.press(p, `#schedBoard .rpuck[data-person="${RANGER}"] .puck:visible`, 'rpuck-inner').catch(e => W.rec('2e', 'inner', 'REC', String(e).slice(0, 120)))
  await sleep(500)
  W.rec('2', 'press .rpuck .puck (Ranger)', 'REC', J(await ringsNow(p)), await W.pic(p, 'p3-2'))
  /* a seated demo puck: Ranger on Mon 13 wave 1 */
  await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  const pk = p.locator(`#eWeek .puck[data-person="${RANGER}"]:visible`).first()
  await pk.scrollIntoViewIfNeeded()
  await W.press(p, pk, 'weekpuck'); await sleep(500)
  W.rec('3', 'press Ranger\'s seated puck on the week', 'REC', J(await ringsNow(p)), await W.pic(p, 'p3-3'))
  const sat = await p.evaluate(k => { const e = [...document.querySelectorAll(`#eWeek [data-slot="${k}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? e.className : 'no seat' }, a.fcp)
  W.rec('4', 'the Sat 18 blank FCP on the week, its class', 'REC', sat)
})
