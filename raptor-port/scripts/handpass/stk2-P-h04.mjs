/* Walker P re-walk: H-04 — Tab through a PUBLISHED weekend (Saturday) changes nothing, earned leave included. Fresh world; everything through the app's controls. */
import * as R from './stk2-P-run.mjs'
import * as W from './dbrA-W1-lib.mjs'
import * as L from './dbrA-lib.mjs'
import { changesList } from './p6-lib.mjs'
const { S, finish, nav, openBoard, boxList, walkForward, walkBack, caret, label, snap, same, sleep, pic, scopeSel, ensureHelper, tap, type, put, lwCell } = R
const wk = scopeSel('week', 5), sb = scopeSel('board', 5)
await S('h04', 'H-04', 'Saturday: SDO desk (Fable 08:00–18:00), added SXO 06:00–14:00 (nact), VIPER 12:00–13:00 (bane/freak), signed the four names, published; clicked into Saturday\'s first open box, Tab until focus left the day, typing nothing — week then Board — then Shift+Tab all the way back', {}, async page => {
  await openBoard(page, 5)
  await tap(page, '[data-dradd="5.0"]')
  await type(page, '[data-bfld="dr:5.0.1.role"]', 'SXO')
  await type(page, '[data-bfld="dr:5.0.1.str"]', '06:00')
  await type(page, '[data-bfld="dr:5.0.1.end"]', '14:00')
  const p1 = await put(page, '[data-fill="d:5.0.1.+"]', ['nact'])
  await tap(page, '[data-wvadd="5"]'); await page.getByRole('button', { name: 'Flying wave', exact: true }).click(); await sleep(500)
  await type(page, '[data-bfld="ff:5.0.0.cs"]', 'VIPER'); await type(page, '[data-bfld="ff:5.0.0.to"]', '12:00'); await type(page, '[data-bfld="ff:5.0.0.ld"]', '13:00')
  const p2 = await put(page, '[data-slot="5.0.0.0.p"]', ['bane']), p3 = await put(page, '[data-slot="5.0.0.0.w"]', ['freak'])
  const signed = await W.signDay(page, 5)
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(1200)
  let pub = null
  for (let t = 0; t < 8; t++) { await sleep(900); pub = await W.publishDay(page, 5); if (pub.pressed) break }
  await sleep(1800)
  const WHO = ['plasma', 'nact', 'bane', 'freak']
  const cellsBefore = await lwCell(page, WHO)
  const pics = [await pic(page, 'H-04-leavewar-before')]
  await nav(page, 'editsched'); await sleep(600)
  const marks = () => page.evaluate(() => { const d = document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? document.querySelector('#schedBoard') : document.querySelector('#eWeek .day[data-day="5"]'); return [...d.querySelectorAll('*')].filter(e => /(^|\s|-)(chg|dchg|amend\w*|pmark|late|newmk|mark\w*)(\s|$)/.test(String(e.className))).length })
  const headBefore = await W.head(page, 5)
  const chBefore = await changesList(L, page, 5)
  const pendBefore = await page.evaluate(() => ({ cnt: window.pendCount(5) }))
  const marksBefore = await marks()
  pics.push(await pic(page, 'H-04-week-before'))
  const out = {}
  for (const surf of ['week', 'board']) {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 5)
    const scope = surf === 'week' ? wk : sb
    await ensureHelper(page)
    const s0 = await snap(page)
    const fw = await walkForward(page, scope, { keepStops: false })
    await page.keyboard.press('Tab'); await sleep(250)
    const exit = await caret(page)
    const bk = await walkBack(page, scope)
    await page.keyboard.press('Shift+Tab'); await sleep(250)
    const exit2 = await caret(page)
    const s1 = await snap(page)
    const hb = await W.head(page, 5)
    const pendA = await page.evaluate(() => ({ cnt: window.pendCount(5) }))
    const pic1 = await pic(page, `H-04-${surf}-after`)
    out[surf] = { n: fw.n, bad: fw.bad.slice(0, 4), badBack: bk.bad.slice(0, 4), exit: label(exit), exitBack: label(exit2), noWrite: same(s0, s1), head: hb, pend: pendA, pic: pic1, marks: await marks(), diff: Object.keys(s0).filter(k => JSON.stringify(s0[k]) !== JSON.stringify(s1[k])) }
  }
  await nav(page, 'editsched')
  const headAfter = await W.head(page, 5)
  const chAfter = await changesList(L, page, 5)
  const cellsAfter = await lwCell(page, WHO)
  pics.push(await pic(page, 'H-04-leavewar-after'), out.week.pic, out.board.pic)
  const same2 = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  return { checks: [
    ['setup: the day is published and signed (tag, sign-off line)', /ORIG|AL/.test(headBefore.tag) && /SIGNED/.test(headBefore.signed || ''), { headBefore, signed, pub, puts: [p1, p2, p3] }],
    ['the people noted: Leave War cells on Sat 18 Jul before', true, cellsBefore],
    ['week: Tab through all ' + out.week.n + ' open boxes in order, one more Tab leaves (to ' + out.week.exit + '), Shift+Tab all the way back (out to ' + out.week.exitBack + ')', out.week.bad.length === 0 && out.week.badBack.length === 0, { bad: out.week.bad, badBack: out.week.badBack }],
    ['board: the same over all ' + out.board.n + ' boxes (leaves to ' + out.board.exit + ')', out.board.bad.length === 0 && out.board.badBack.length === 0, { bad: out.board.bad, badBack: out.board.badBack }],
    ['nothing written (days, inputs, settings, command count, history lines, pending counts) on either surface', out.week.noWrite && out.board.noWrite, { week: out.week.diff, board: out.board.diff }],
    ['"0 pending" throughout: pending count 0 before and after both surfaces; the bar says', pendBefore.cnt === 0 && out.week.pend.cnt === 0 && out.board.pend.cnt === 0, { before: pendBefore, week: out.week.pend, board: out.board.pend, bars: [headBefore.pending, out.week.head.pending, out.board.head.pending, headAfter.pending] }],
    ['the day\'s bar and four sign-offs unchanged (week and board reads, then week again)', same2(headBefore, out.week.head) && same2(headBefore.signs, headAfter.signs) && /SIGNED/.test(headAfter.signed || ''), { before: headBefore, week: out.week.head, board: out.board.head, after: headAfter }],
    ['no line in the changes window', same2(chBefore, chAfter), { before: chBefore, after: chAfter }],
    ['no amendment mark painted on any box (mark-classed elements in the day: before / after week / after board)', marksBefore === out.week.marks && marksBefore === out.board.marks, { before: marksBefore, week: out.week.marks, board: out.board.marks }],
    ['every Leave War cell as noted', same2(cellsBefore, cellsAfter), { before: cellsBefore, after: cellsAfter }],
  ], pics }
})
await finish('h04')
