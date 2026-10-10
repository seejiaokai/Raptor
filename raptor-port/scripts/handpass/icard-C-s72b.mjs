import * as L from './icard-C-lib.mjs'
import { readFileSync } from 'node:fs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
const parts = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const bellInfo = async () => {
  const dot = await p.evaluate(() => { const b = document.getElementById('notifyBell'); return b ? b.className : null })
  await p.locator('#notifyBell').click(); await sleep(700)
  const q = await L.oilText(p)
  const panel = await p.evaluate(() => [...document.querySelectorAll('.floatwin,.airpop,.notifpop')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 160)).join(' || '))
  return { dot, q, panel }
}
try {
  await L.openNew(w, '2026-07-15')
  await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', 'allavail')
  await L.setTimes(p, '09:00', '12:00'); await p.fill('#inpEditOwnTitle', 'Weekday placeholder')
  await L.saveWin(w); await L.closeWins(p)
  parts.push('Ranger filed a weekday ALL AVAIL Event Wed 15 Jul (no OIL question on a working day)')
  await L.switchUser(w, 'ad')
  await L.declareHoliday(w, '2026-07-15', 'Test holiday', 'TH'); await L.closeWins(p)
  const sb = await bellInfo()
  parts.push(`Saber's bell after the holiday: class "${sb.dot}", OIL question opened: ${sb.q ? sb.q.slice(0, 120) : 'none'}; panel "${sb.panel}"`)
  await L.closeWins(p); await p.keyboard.press('Escape')
  await L.switchUser(w, 'us')
  const rb = await bellInfo()
  parts.push(`Ranger's bell: class "${rb.dot}", OIL question opened: ${rb.q ? rb.q.slice(0, 160) : 'none'}; panel "${rb.panel}"`)
  await L.pic(w, '72-bell-ranger')
  if (sb.q) fail('Saber (not the filer) was asked the placeholder question: ' + sb.q.slice(0, 100))
  if (!rb.q) fail('the filer Ranger was not asked the unanswered placeholder question through his bell')
} catch (e) { parts.push('ERR ' + String(e).slice(0, 200)); verdict = 'NOT RUN' }
const j = JSON.parse(readFileSync(L.JSONF, 'utf8'))
const r = j.rows.find(r => r.n === '72')
r.said += ' || UNANSWERED NOTIFICATION (separate run): ' + parts.join(' ; ')
if (verdict === 'FAIL') r.verdict = 'FAIL'
r.pics.push('desk-72-bell-ranger.png')
import { writeFileSync } from 'node:fs'
writeFileSync(L.JSONF, JSON.stringify(j, null, 1))
console.log(verdict, parts.join('\n'))
await w.browser.close()
