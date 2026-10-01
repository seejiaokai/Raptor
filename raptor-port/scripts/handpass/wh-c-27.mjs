/* walker C — scenario 27: every role gets the right face and the right door, at each of three states of one hide:
   WH_STATE=draft (hidden on a draft day) · issued (hidden, then published) · pending (published, then hidden).
   Roles: the scheduler (Edit Schedule, the board, and his own View-only Sched), the admin in his member view (his name
   badge), a member (Ranger), a guest (Admin → Users' guest switch on, a sign-in the app does not know). */
import * as C from './wh-c-lib.mjs'
const { H, W2 } = C, { L, W } = H
const ST = process.env.WH_STATE || 'issued', ID = `27.${ST}`
const TUE = 1, RE = /Long work day/i, WHO = 'wolf'
const { browser, p, errors } = await H.world({ who: 'a' })
/* what the PUBLISHED / read-only face must say in this state: hidden (struck, 3, plain) or still flagged (plain, 4, flag) */
const faceHidden = ST !== 'pending'
const face = (s, label) => faceHidden ? C.hiddenChecks(s, 3, { button: '', label }) : C.shownChecks(s, 4, { button: '', label })
try {
  await L.go(p, 'editsched')
  const s0 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const IX = s0.line.ix
  let pub = null, signs = null
  if (ST === 'pending') { signs = await W.signDay(p, TUE); pub = await W.publishDay(p, TUE); await L.settle(p) }
  const tap = await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)
  if (ST === 'issued') { await W.showDay(p, TUE); signs = await W.signDay(p, TUE); pub = await W.publishDay(p, TUE); await L.settle(p) }
  const h1 = await H.head(p, TUE)
  const s1 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic1 = await C.picLine(p, '#eWeek', TUE, IX, `27${ST}-1-scheduler-edit`)
  H.judge(`${ID}.1`, `the scheduler (Saber): ${ST === 'draft' ? '✕ on Static\'s "Long work day" (Tuesday a draft)' : ST === 'issued' ? '✕, then the four sign-offs, then Publish day' : 'the four sign-offs, Publish day, then ✕'} — Edit Schedule`, [
    ...(ST === 'draft' ? [['Tuesday is a draft', /DRAFT/i.test(h1.tag), h1.tag]] : [['Tuesday is published', !!pub && pub.pressed && !/DRAFT/i.test(h1.tag), JSON.stringify({ pub, tag: h1.tag })]]),
    ...(ST === 'pending' ? [['one pending change ("1 pending", a "Publish AL1" button, "Not yet signed"), the four sign-offs fallen', /^1 pending/.test(h1.pending) && /AL1/.test(h1.alpub) && W.signsEmpty(h1), JSON.stringify({ pending: h1.pending, alpub: h1.alpub, signs: h1.signs, nys: h1.nys })]] : []),
    ...(ST === 'issued' ? [['nothing waits after the publish (no "Publish AL" button, no "N pending" chip, no "not yet" marker)', !h1.alpub && !h1.nys && !/pending/i.test(h1.pending), JSON.stringify({ alpub: h1.alpub, nys: h1.nys, chip: h1.pending })]] : []),
    ...C.hiddenChecks(s1, 3)], [pic1])
  console.log('HEAD', JSON.stringify(h1), 'signs', JSON.stringify(signs), 'pub', JSON.stringify(pub))
  /* the board */
  await W.boardOn(p, TUE); await H.boardOpenFold(p)
  const b = await H.readBoard(p), bl = (b.lines || []).find(l => RE.test(l.text)), bp = await H.pucks(p, '#schedBoard', WHO)
  const pic2 = await H.pic(p, `27${ST}-2-scheduler-board`)
  H.judge(`${ID}.2`, 'the scheduler: the Scheduler Board on Tuesday', [['heading counts 3', /\b3 issues/.test(b.head || ''), b.head], ['the line is struck', !!bl && bl.struck], ['its button is ↺ and topmost', !!bl && bl.btn === '↺' && bl.btnTop === true, bl && bl.btn + ' ' + bl.btnTop], ['Static\'s pucks carry no flag', H.flagged(bp).length === 0, H.flagged(bp).map(x => x.cls).join(' | ')]], [pic2])
  await W.boardOff(p)
  /* the scheduler's own View-only Sched */
  await L.go(p, 'viewsched')
  const s3 = await C.see(p, '#vWeek', TUE, RE, WHO), d3 = await C.doors(p)
  const pic3 = await C.picLine(p, '#vWeek', TUE, IX, `27${ST}-3-scheduler-viewonly`)
  H.judge(`${ID}.3`, 'the scheduler: View-only Sched, Tuesday list opened', [...face(s3, ''), ['no ✕ / ↺ anywhere on the page', d3.woff === 0, d3.woff]], [pic3])
  /* the guest switch (Admin → Users), then the admin's member view through his badge */
  const gsw = await C.guestSwitchOn(p)
  await L.go(p, 'viewsched')
  const bd = await C.badge(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
  const s4 = await C.see(p, '#vWeek', TUE, RE, WHO), d4 = await C.doors(p)
  const pic4 = await C.picLine(p, '#vWeek', TUE, IX, `27${ST}-4-admin-member-view`)
  H.judge(`${ID}.4`, 'the admin pressed his name badge → his member view; View-only Sched, Tuesday', [['the badge now reads MEMBER', /MEMBER/i.test(bd.after || ''), JSON.stringify(bd)], ...face(s4, ''), ['no ✕ / ↺ anywhere', d4.woff === 0, d4.woff], ['no Edit Schedule tab', !d4.editTab]], [pic4])
  const bd2 = await C.badge(p)
  /* a member */
  await C.reSign(p, 'm'); await L.go(p, 'viewsched')
  const s5 = await C.see(p, '#vWeek', TUE, RE, WHO), d5 = await C.doors(p)
  const pic5 = await C.picLine(p, '#vWeek', TUE, IX, `27${ST}-5-member`)
  /* a tap on the line itself must change nothing */
  await p.locator(`#vWeek .day[data-day="${TUE}"] .witem[data-wix="${IX}"]`).first().click().catch(() => {}); await L.sleep(400)
  const s5b = await C.see(p, '#vWeek', TUE, RE, WHO)
  H.judge(`${ID}.5`, 'Logout; the member (Ranger): View-only Sched, Tuesday; then a tap on the line itself', [...face(s5, ''), ['no ✕ / ↺ anywhere', d5.woff === 0, d5.woff], ['no Edit Schedule tab', !d5.editTab], ['the tap changed nothing (same count, same strike)', s5b.n === s5.n && !!s5b.line && s5b.line.struck === s5.line.struck, s5b.bar]], [pic5])
  /* a guest */
  await L.settle(p); await W2.signOut(p)
  const gin = await C.guestIn(p)
  if (gin !== 'in') H.row(`${ID}.6`, 'a guest: signed in as a name the app does not know, asked for access, pressed "View the schedule"', `guest switch ${gsw}; ${gin}`, 'NOT WALKED (' + gin + ')', [await H.pic(p, `27${ST}-6-guest`)])
  else {
    const g = await C.guestSee(p, TUE, WHO)
    await p.evaluate(([i, who]) => { const e = document.querySelector(`#guestApp .day[data-day="${i}"] .puck[data-person="${who}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, [TUE, WHO]); await L.sleep(300)
    const pic6 = await H.pic(p, `27${ST}-6-guest`)
    H.judge(`${ID}.6`, 'a guest ("walkguest"): the admin\'s guest switch on, signed in, asked for access, pressed "View the schedule"; Tuesday', [
      ['the guest view opened (its own page, "Waiting for access — view only")', /view only/i.test(g.note), g.note],
      ['Static is drawn on Tuesday', g.pucks.length > 0, g.pucks.length],
      [faceHidden ? 'Static\'s pucks carry no flag (the same as the member\'s face)' : 'Static\'s pucks carry the flag (the published face keeps it)', faceHidden ? g.flagged.length === 0 : g.flagged.length > 0, g.pucks.map(x => x.cls).join(' | ')],
      ['no issues bar and no ✕ / ↺ anywhere on his page', g.bars === 0 && g.btns === 0, JSON.stringify({ bars: g.bars, btns: g.btns })]], [pic6])
    await W2.signOut(p)
  }
  /* back as the scheduler: nobody altered it */
  await L.signIn(p, 'a', { goto: false }); await L.go(p, 'editsched')
  const s7 = await C.see(p, '#eWeek', TUE, RE, WHO), h7 = await H.head(p, TUE)
  const pic7 = await C.picLine(p, '#eWeek', TUE, IX, `27${ST}-7-scheduler-again`)
  H.judge(`${ID}.7`, 'signed in again as the scheduler: Edit Schedule, Tuesday', [...C.hiddenChecks(s7, 3), ['the day\'s head is as he left it', h7.tag === h1.tag && h7.pending === h1.pending, JSON.stringify({ was: [h1.tag, h1.pending], now: [h7.tag, h7.pending] })]], [pic7])
  /* a reload at this state: the scheduler, then the member */
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const s8 = await C.see(p, '#eWeek', TUE, RE, WHO), h8 = await H.head(p, TUE)
  const pic8 = await C.picLine(p, '#eWeek', TUE, IX, `27${ST}-8-scheduler-reload`)
  await L.go(p, 'viewsched'); const s8v = await C.see(p, '#vWeek', TUE, RE, WHO)
  H.judge(`${ID}.8`, 'reloaded; signed in as the scheduler: Edit Schedule, then View-only Sched', [...C.hiddenChecks(s8, 3, { label: 'Edit Schedule: ' }), ['the day\'s head is unchanged', h8.tag === h1.tag && h8.alpub === h1.alpub && h8.nys === h1.nys, JSON.stringify([h8.tag, h8.alpub, h8.nys])], ...face(s8v, 'View-only Sched: ')], [pic8])
  await H.reloadAs(p, 'm'); await L.go(p, 'viewsched')
  const s9 = await C.see(p, '#vWeek', TUE, RE, WHO), d9 = await C.doors(p)
  const pic9 = await C.picLine(p, '#vWeek', TUE, IX, `27${ST}-9-member-reload`)
  H.judge(`${ID}.9`, 'reloaded; signed in as the member: View-only Sched', [...face(s9, ''), ['no ✕ / ↺ anywhere', d9.woff === 0, d9.woff]], [pic9])
} catch (e) { H.row(`${ID}.X`, 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, `27${ST}-X-error`)]) }
C.done(`27-${ST}`, errors)
await browser.close()
