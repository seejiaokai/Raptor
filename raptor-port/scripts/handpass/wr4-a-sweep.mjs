// Walker a — the window's kinds: which offer AM / PM, a Title box, an "Attached to" box, the plain all-day tick.
// Run: node scripts/handpass/wr4-a-sweep.mjs [run-name]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-sweep v1')
const RUN = process.argv[2] || 'sweep-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, openDay, press, log, shot, boxOf, WED, sleep } = L
const c = 'A5sweep'
try {
  for (const [who, user] of [['Saber', 'ad'], ['Ranger', 'us']]) {
    const w = await newPage('desk'); await signIn(w, user)
    await openDay(w, WED)
    await press(w, '#icPopAdd')
    await w.page.locator('#inpEditPop #inpEditType').waitFor()
    const opts = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop #inpEditType option')].map(o => ({ v: o.value, t: o.textContent.trim(), dis: o.disabled })))
    const rows = []
    for (const o of opts) {
      if (o.dis || !o.v) { rows.push({ ...o, skipped: true }); continue }
      await w.page.selectOption('#inpEditPop #inpEditType', o.v); await sleep(150)
      rows.push({ kind: o.v, label: o.t, ...(await w.page.evaluate(() => ({
        am: !!document.querySelector('#inpEditSpan [data-span="am"]'), pm: !!document.querySelector('#inpEditSpan [data-span="pm"]'),
        spans: [...document.querySelectorAll('#inpEditSpan [data-span]')].map(b => b.getAttribute('data-span')),
        allDayTick: !!document.querySelector('#inpEditAllday'), title: !!document.querySelector('#inpEditOwnTitle'), to: !!document.querySelector('#inpEditTo'),
        till: !!document.querySelector('#inpEditTill'),
      }))) })
    }
    log(c, `${who} kinds: ` + JSON.stringify(rows))
    A.judge(c, `${who}: kinds offering AM/PM`, null, rows.filter(r => r.am || r.pm).map(r => r.kind))
    A.judge(c, `${who}: kinds with a Title box AND AM/PM (a door to a titled half day)`, null, rows.filter(r => (r.am || r.pm) && r.title).map(r => r.kind))
    A.judge(c, `${who}: kinds with a Title box`, null, rows.filter(r => r.title).map(r => r.kind))
    A.judge(c, `${who}: kinds with an "Attached to" box`, null, rows.filter(r => r.to).map(r => r.kind))
    await w.page.selectOption('#inpEditPop #inpEditType', 'LL'); await sleep(200)
    await shot(w.page, c, `A5-sweep-${who}-LL-window-desk`, await boxOf(w.page, ['[data-testid="win-inputedit"]'], 8), 'the window on LL', 'desk')
    await w.ctx.close()
  }
} catch (e) { L.facts.errors.push('sweep: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
