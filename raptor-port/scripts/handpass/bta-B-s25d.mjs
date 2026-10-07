/* S25 part D — the schedule board's own Unavailable row (the schedule input editor): times and remarks typed in place, the type button's
   editor, Delete — with the board's warning panel read WITHOUT leaving the board. X on a blank flying line and a blank duty row, Tue. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s25d')
const readLive = async p => { const b = await B.readBoard(p); return { mine: (b.lines || []).filter(x => x.text.includes(CSN)).map(x => x.text.replace(/ ✕| ↺/g, '').slice(0, 130)), head: b.head } }
const panel = async (p, tag, first = false) => {
  /* read 1: straight away, the board never left */
  const live = first ? null : await readLive(p)
  const liveShot = first ? null : await pic(p, `s25d-${tag}-live`)
  /* read 2: leave the board and open it again */
  await B.toEdit(p).catch(() => {})
  await K.boardTo(p, TUE); await sleep(400)
  await B.boardOpenFold(p)
  const r = await readLive(p)
  const pk = await C.painted(p, '#schedBoard', ID)
  return { mine: r.mine, head: r.head, live, pk, shot: await pic(p, `s25d-${tag}-board`), liveShot }
}
const typeIn = async (p, key, value) => {
  const el = p.locator(`#schedBoard [data-ifld="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await el.click(); await p.keyboard.press('Control+A')
  if (value === '') await p.keyboard.press('Backspace'); else await p.keyboard.type(value, { delay: 8 })
  await el.evaluate(e => e.blur()); await sleep(600)
}
const say = x => `${x.live ? 'read straight away without leaving the board: ' + JSON.stringify(x.live.mine) + ' (heading "' + x.live.head + '"); ' : ''}after leaving the board and opening it again: the board's warning panel (heading "${x.head}"), lines naming him: ${JSON.stringify(x.mine)} · his pucks on the board: [${C.pk2(x.pk.filter(q => q.where !== 'crew list'))}]`
const { browser, p, errors } = await K.fresh()
try {
  await T.blankLine(p, TUE); await T.blankRow(p, 'duty', TUE)
  const f = await T.file(p, { type: 'LL', di: TUE, allday: true, remarks: 'Board one' })
  const d1 = await panel(p, 'd1', true)
  t.add('S25d.1', `LL, All day, Tue filed on the Inputs page; the board for Tuesday opened (stored: ${await T.rec(p, f.iid)})`, say(d1), d1.mine.length === 2 && (!d1.live || d1.live.mine.length === 2) ? 'PASS' : 'FAIL', [d1.liveShot, d1.shot])
  await typeIn(p, `${f.iid}.str`, '14:00'); await typeIn(p, `${f.iid}.end`, '15:00')
  const d2 = await panel(p, 'd2')
  t.add('S25d.2', `on the board's Unavailable row for him, typed in place: start 14:00, end 15:00 — the board not left (stored: ${await T.rec(p, f.iid)})`, say(d2), d2.mine.length === 0 && (!d2.live || d2.live.mine.length === 0) ? 'PASS' : 'FAIL', [d2.liveShot, d2.shot])
  await typeIn(p, `${f.iid}.str`, ''); await typeIn(p, `${f.iid}.end`, '')
  const d3 = await panel(p, 'd3')
  t.add('S25d.3', `both times cleared again (all day) (stored: ${await T.rec(p, f.iid)})`, say(d3), d3.mine.length === 2 && (!d3.live || d3.live.mine.length === 2) ? 'PASS' : 'FAIL', [d3.liveShot, d3.shot])
  await typeIn(p, `${f.iid}.rmks`, 'Board two')
  const d4 = await panel(p, 'd4')
  t.add('S25d.4', 'the remarks changed in place to "Board two"', say(d4), d4.mine.length === 2 && (!d4.live || d4.live.mine.length === 2) && d4.mine.every(x => /Board two/.test(x)) ? 'PASS' : 'FAIL', [d4.liveShot, d4.shot])
  /* the editor from the type button: type to OL then delete */
  await p.locator(`#schedBoard [data-inpedit="${f.iid}"]`).first().click(); await sleep(800)
  const ed = await p.evaluate(() => { const e = [...document.querySelectorAll('.airpop, [role=dialog]')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 160) : 'no editor' })
  await p.locator('#inpEditSpan [data-span="am"]').click().catch(() => {})
  await pic(p, 's25d-editor')
  await p.locator('#inpEditSave').click(); await sleep(900)
  const d5 = await panel(p, 'd5')
  t.add('S25d.5', `the type button → the editor ("${ed}"): span set to AM and saved (stored: ${await T.rec(p, f.iid)})`, say(d5), d5.mine.length === 0 && (!d5.live || d5.live.mine.length === 0) ? 'PASS' : 'FAIL', [d5.liveShot, d5.shot])
  await p.locator(`#schedBoard [data-inpedit="${f.iid}"]`).first().click(); await sleep(800)
  await p.locator('#inpEditSpan [data-span="all"]').click().catch(() => {})
  await p.locator('#inpEditSave').click(); await sleep(900)
  const d6 = await panel(p, 'd6')
  t.add('S25d.6', `the editor again: span back to All day (stored: ${await T.rec(p, f.iid)})`, say(d6), d6.mine.length === 2 && (!d6.live || d6.live.mine.length === 2) ? 'PASS' : 'FAIL', [d6.liveShot, d6.shot])
  await p.locator(`#schedBoard [data-inpedit="${f.iid}"]`).first().click(); await sleep(800)
  await p.locator('#inpEditDel').click(); await sleep(900)
  const afterDel = await p.evaluate(() => { const e = [...document.querySelectorAll('.airpop, [role=dialog]')].filter(x => x.offsetParent !== null).pop(); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 160) : '(no dialog)' })
  const d7 = await panel(p, 'd7')
  t.add('S25d.7', `the editor → Delete (afterwards: ${afterDel}); his inputs now ${JSON.stringify(await T.recAll(p))}`, say(d7), d7.mine.length === 0 && (!d7.live || d7.live.mine.length === 0) ? 'PASS' : 'FAIL', [d7.liveShot, d7.shot])
} catch (e) { R('S25d.X', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's25d-X')]) }
R('S25d.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s25d')
