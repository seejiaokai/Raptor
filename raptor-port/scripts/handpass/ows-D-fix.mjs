/* shared fixture for S38 and the Op/Or pairs: Ranger with a duty 06:00–06:30 and a flight 12:00–13:00 with IN TIME 10:00 (Saturday) */
import * as D from './ows-D-lib.mjs'
import * as K from './stk-B-lib.mjs'
const { sleep, A, R, W, L, P, SAT } = D
export async function m38(p, { di = SAT, who = 'bane', phone = false } = {}) {
  await L.go(p, 'editsched'); await sleep(400)
  const duty = await R.addRow(p, 'duty', di, 'DESK-A', '06:00', '06:30', who)
  const w = await K.addFlyWave(p, di)
  await K.ff(p, di, w.gi, 0, 'cs', 'VIPER'); await K.ff(p, di, w.gi, 0, 'to', '12:00'); await K.ff(p, di, w.gi, 0, 'ld', '13:00')
  const seat = await K.seat(p, di, w.gi, 0, 0, 'p', who)
  await A.addItBtn(p, di, w.gi)
  await A.setItLine(p, di, w.gi, 0, 'IN TIME 10:00')
  const its = await A.intimes(p, di, w.gi)
  return { duty, gi: w.gi, took: seat.took && duty.took, its }
}
/* the OIL Earn items of the open board: key by label */
export async function items(p) { return D.switches(p) }
export async function itemKey(p, label) { const sw = await D.switches(p); const s = sw.find(x => x.txt === label); return s ? s.item : null }
export async function tapItem(p, key) { const l = p.locator(`#schedBoard [data-oilitem="${key}"]:not([data-oilp]):visible`).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await l.click(); await sleep(600); return D.toast(p) }
export async function tapPuck(p, who, key) { const l = p.locator(`#schedBoard [data-oilp="${who}"][data-oilitem="${key}"]:visible`).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await l.click(); await sleep(600); return D.toast(p) }
export async function figOf(p, who) {
  return p.evaluate(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + (/oildim/.test(e.className) ? ' [dim]' : '') + (/oilglow/.test(e.className) ? ' [glow]' : '')), who)
}
/* the OIL header of the board in the mode, in full words */
export async function oilHeader(p) {
  return p.evaluate(() => { const e = document.querySelector('#schedBoard .oilbar, #schedBoard .sb-oil, #schedBoard [class*="oilhead"], #schedBoard .oilearn'); const t = document.querySelector('#schedBoard');
    const btns = [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent !== null && /OIL|earn|off|day/i.test(b.innerText + ' ' + (b.title || ''))).map(b => `${(b.innerText || '').trim()} [${b.id || ''}|${(b.title || '').slice(0, 80)}]`)
    return { head: e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no header)', btns } })
}
