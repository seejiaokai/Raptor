/* X-12 — a second change on an already pending day does not reset the comparison (D103, D178). Wed 15 Jul 26 (day 2). */
import * as H from './cal-H-lib.mjs'
H.setTag('x12')
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const DI = 2
const faceOf = async () => { await H.go(page, 'viewsched'); await H.sleep(500); return page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="2"]'); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { meeting: (t.match(/meeting/gi) || []).length, len: t.length, tag: (d && (d.querySelector('.verchip') || {}).innerText) || '', txt: t.slice(0, 1500) } }) }
const chg = async () => { await H.toEdit(page); await H.showDay(page, DI); await H.changesWin(page, DI); const r = await H.changesRead(page); return r }
const pend = async () => { await H.toEdit(page); await H.showDay(page, DI); return H.head(page, DI) }

// 1. publish a clean day
await H.toEdit(page); await H.showDay(page, DI)
await H.signDay(page, DI); await H.publishDay(page, DI)
const h0 = await pend()
const f0 = await faceOf()
await H.toEdit(page); await H.showDay(page, DI)
const s0 = await H.pic(page, '1-published-clean')
H.judge('X-12 step 1', 'signed the four boxes of Wed 15 Jul and pressed Publish day', [
  ['the day reads ORIG', /ORIG/.test(h0.tag), h0.tag], ['no pending (the chip reads a changes count, not pending)', !/pending/.test(h0.pending || ''), h0.pending], ['the signed line carries the four names', /CUR CK\s*\S+.*SKED CK/.test(h0.signed || ''), h0.signed],
], [s0], { h0 })

// 2. file a three-person input (Saber taken off)
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], exclude: ['Saber'], remarks: 'X12 first remark' })
const grp = (await H.inputsNow(page)).filter(x => /X12/.test(x.remarks))
const h1 = await pend()
await H.changesWin(page, DI); const c1 = await H.changesRead(page); const s1 = await H.pic(page, '2-three-pending'); await H.changesClose(page)
H.judge('X-12 step 2', 'filed ONE Meeting for Ranger, Drifter and Ace (Saber taken off) on the published Wed 15 Jul', [
  ['3 records, one group', grp.length === 3 && new Set(grp.map(x => x.grp)).size === 1, grp.map(x => x.person)],
  ['the day reads 3 pending', /^3 pending/.test(h1.pending || ''), h1.pending],
  ['the sign-offs fell (D103)', h1.signs.every(s => !s || /name/i.test(s)), h1.signs],
  ['the To go out list names each of the 3 people once', ['Ranger', 'Drifter', 'Ace'].every(n => (c1.lines.filter(l => new RegExp('^' + n + ' · Meeting').test(l)).length === 1)), c1.lines.filter(l => /Meeting/.test(l))],
], [s1], { h1, lines: c1.lines })

// 3. edit that input's remarks
await H.inputsMonth(page, 2026, 7)
const t3 = await H.openBar(page, /\+2/)
await page.fill('#inpEditRmk', 'X12 second remark'); await page.click('#inpEditSave'); await H.sleep(800); await H.answerOilIfAsked(page, 'Yes')
const grp3 = (await H.inputsNow(page)).filter(x => /X12/.test(x.remarks))
const h2 = await pend()
await H.changesWin(page, DI); const c2 = await H.changesRead(page); const s2 = await H.pic(page, '3-after-remark-edit'); await H.changesClose(page)
H.judge('X-12 step 3', 'opened the shared input and changed its remarks, Save', [
  ['still 3 records, one group, all with the new remark', grp3.length === 3 && grp3.every(x => x.remarks === 'X12 second remark') && new Set(grp3.map(x => x.grp)).size === 1, grp3.map(x => x.remarks)],
  ['the day STILL reads 3 pending (not 6)', /^3 pending/.test(h2.pending || ''), h2.pending],
  ['each of the 3 appears once in To go out', ['Ranger', 'Drifter', 'Ace'].every(n => (c2.lines.filter(l => new RegExp('^' + n + ' · Meeting').test(l)).length === 1)), c2.lines.filter(l => /Meeting/.test(l))],
], [s2], { t3, h2, lines: c2.lines })

// 4. an unrelated one-person input (Saber, himself)
await H.inputsMonth(page, 2026, 7)
await H.fileSolo(page, { iso: '2026-07-15', type: 'Appointment', remarks: 'X12 solo' })
const h3 = await pend()
await H.changesWin(page, DI); const c3 = await H.changesRead(page); const s3 = await H.pic(page, '4-after-solo'); await H.changesClose(page)
const f3 = await faceOf()
H.judge('X-12 step 4', 'filed an unrelated one-person Appointment for Saber on the same day', [
  ['the day reads 4 pending (3 + 1), not more', /^4 pending/.test(h3.pending || ''), h3.pending],
  ['To go out holds Ranger, Drifter, Ace and Saber each once', ['Ranger · Meeting', 'Drifter · Meeting', 'Ace · Meeting', 'Saber · Appointment'].every(n => c3.lines.filter(l => l === n || l.startsWith(n)).length === 1), c3.lines.filter(l => /Meeting|Appointment/.test(l))],
  ['View-only Sched\'s issued face has not changed yet (same words as at publication)', f3.meeting === f0.meeting, { before: f0.meeting, now: f3.meeting }],
], [s3], { h3, lines: c3.lines, f0meet: f0.meeting, f3meet: f3.meeting })

// 5. publish AL1
await H.toEdit(page); await H.showDay(page, DI)
const sg = await H.signDay(page, DI); const pu = await H.publishAL(page, DI)
const h4 = await pend()
await H.changesWin(page, DI); const c4 = await H.changesRead(page); const s4 = await H.pic(page, '5-after-AL1'); await H.changesClose(page)
const f4 = await faceOf()
await H.toEdit(page); await H.showDay(page, DI)
H.judge('X-12 step 5', 'signed the four boxes again and pressed Publish AL1', [
  ['the publish button was pressed', pu.pressed === true, pu],
  ['the day reads AL1 and no pending', /AL1/.test(h4.tag) && !/pending/.test(h4.pending || ''), { tag: h4.tag, pending: h4.pending, nys: h4.nys, signed: h4.signed }],
  ['To go out is empty', !/To go out · AL1 \d/.test(JSON.stringify(c4.tabs)), c4.tabs],
  ['View-only Sched now shows the final content (more Meeting words than before)', f4.meeting > f0.meeting, { before: f0.meeting, after: f4.meeting }],
  ['the final remark is the edited one', (await H.inputsNow(page)).filter(x => /X12/.test(x.remarks) && x.type === 'Meeting').every(x => x.remarks === 'X12 second remark'), ''],
], [s4], { h4, tabs: c4.tabs, f4meet: f4.meeting })
console.log('ERRORS', errors)
H.save('x12', { errors })
await browser.close()
