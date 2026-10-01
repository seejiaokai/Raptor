/* walker C — scenario 28: a DRAFT hide survives a reload, a sign-out and sign-in, a member, and the next edit of that day.
   Also: the rows one hide writes (that day's row and nothing else of the schedule). */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, RE = /Long work day/i, WHO = 'wolf'
const { browser, p, errors } = await H.world({ who: 'a' })
try {
  await L.go(p, 'editsched')
  const s0 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic0 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-0-before')
  H.judge('28.0', 'Edit Schedule, Tuesday, list opened — before any hide', C.shownChecks(s0, 4), [pic0])

  /* the hide, and the rows it wrote */
  const w = await C.wrote(p, () => H.tapLine(p, '#eWeek', TUE, s0.line.ix))
  const s1 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic1 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-1-hidden')
  H.judge('28.1', 'pressed ✕ on Static\'s "Long work day" line', [...C.hiddenChecks(s1, 3), ['the line kept its place (4th of 4)', s1.line && s1.line.ix === s0.line.ix && s1.nLines === 4, s1.line && s1.line.ix], ['the bar says nothing about a hidden one', !/hidden/i.test(s1.bar), s1.bar]], [pic1])
  H.judge('28.rows', 'the saved rows before and after that one hide', [
    ['it wrote Tuesday\'s own row', w.sched.includes('weeks/13-07-2026#1'), w.sched],
    ['and no other day row; the week\'s own header row only because this week had never been saved (see rows.1–3)', w.sched.filter(k => k !== 'weeks/13-07-2026#1').every(k => k === 'weeks/13-07-2026' && w.after[k] === '{"v":2,"am":1}'), w.sched],
    ['one change-log batch', w.d.newBatches.length === 1, w.d.newBatches.length],
    ['the stored Tuesday row carries the hide', /"wo"|woff|"off"/.test(w.after['weeks/13-07-2026#1'] || ''), (w.after['weeks/13-07-2026#1'] || '').match(/"wo":[^\]]*\]|"woff":[^\]]*\]/)?.[0] || '(no wo field found)'],
  ])
  console.log('ROWS', JSON.stringify(w.d), 'HIST', JSON.stringify(await C.histTail(p, 2)))

  /* a hard reload */
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const s2 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic2 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-2-after-reload')
  H.judge('28.2', 'reloaded the page, signed in again as the admin', C.hiddenChecks(s2, 3), [pic2])

  /* sign out, sign in — the same scheduler */
  await C.reSign(p, 'a'); await L.go(p, 'editsched')
  const s3 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic3 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-3-after-signout-in')
  H.judge('28.3', 'Logout, then signed in again as the same admin (no reload)', C.hiddenChecks(s3, 3), [pic3])

  /* a member after him */
  await C.reSign(p, 'm'); await L.go(p, 'viewsched')
  const s4 = await C.see(p, '#vWeek', TUE, RE, WHO)
  const pic4 = await C.picLine(p, '#vWeek', TUE, s0.line.ix, '28-4-member-view')
  const editTab = await p.evaluate(() => [...document.querySelectorAll('[data-go="editsched"], [data-page="editsched"]')].some(e => e.offsetParent !== null))
  H.judge('28.4', 'Logout, signed in as the member (Ranger), View-only Sched, Tuesday list opened', [...C.hiddenChecks(s4, 3, { button: '' }), ['no ✕ on any line of the list', s4.lines.every(l => !l.btn), s4.lines.map(l => l.btn).join('')], ['the member has no Edit Schedule tab', !editTab]], [pic4])

  /* back as the scheduler: edit a different Tuesday field, then reload */
  await C.reSign(p, 'a'); await L.go(p, 'editsched'); await W.showDay(p, TUE)
  const w2 = await C.wrote(p, () => W.weekText(p, 'dn:1.0', 'ORDERS: FLYING ORDER (WALK C)'))
  const noteNow = await p.evaluate(() => (document.querySelector('#eWeek [data-txt="dn:1.0"]') || {}).innerText)
  const s5 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic5 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-5-after-next-edit')
  H.judge('28.5', 'back as the admin; typed a new day note on Tuesday (a different field)', [['the note took', /WALK C/.test(noteNow || ''), noteNow], ['the edit saved Tuesday\'s row', w2.sched.includes('weeks/13-07-2026#1'), w2.sched], ...C.hiddenChecks(s5, 3)], [pic5])
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const s6 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const note6 = await p.evaluate(() => (document.querySelector('#eWeek [data-txt="dn:1.0"]') || {}).innerText)
  const pic6 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, '28-6-reload-after-edit')
  H.judge('28.6', 'reloaded again after that edit', [['the note is still there', /WALK C/.test(note6 || ''), note6], ...C.hiddenChecks(s6, 3)], [pic6])

  /* the board says the same */
  await W.boardOn(p, TUE); await H.boardOpenFold(p)
  const b = await H.readBoard(p); const bl = (b.lines || []).find(l => RE.test(l.text))
  const pic7 = await H.pic(p, '28-7-board')
  const bp = await H.pucks(p, '#schedBoard', WHO)
  H.judge('28.7', 'opened the Scheduler Board on Tuesday', [['heading counts 3', /\b3\b/.test(b.head || ''), b.head], ['the line is struck there', !!bl && bl.struck], ['its button is ↺', !!bl && bl.btn === '↺', bl && bl.btn], ['Static\'s pucks on the board carry no flag', H.flagged(bp).length === 0, H.flagged(bp).map(x => x.where + ':' + x.cls).join(' | ')]], [pic7])
  await W.boardOff(p)
} catch (e) { H.row('28.X', 'the script', String(e && e.stack || e).slice(0, 600), 'FAIL', [await H.pic(p, '28-X-error')]) }
C.done('28', errors)
await browser.close()
