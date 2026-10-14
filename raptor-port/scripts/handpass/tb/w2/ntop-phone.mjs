/* W2 N-TOP — phone: a note raised while a window of the Inputs calendar is up.  node ntop-phone.mjs */
import { L, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('ntop-phone v1')
const w = await L.world('phone')
const p = w.page
const SAT = '2026-07-18'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const watch = async label => {
  const rows = []
  for (const ms of [0, 150, 250, 400, 600]) { if (ms) await sleep(ms === 150 ? 150 : 100 + (ms > 250 ? 50 : 0)); const t = await toastNow(p); rows.push(t && t.text && parseFloat(t.opacity) > 0.05 ? `${ms}ms op ${t.opacity} y ${t.box.y} h ${t.box.h} left ${t.box.x} rightGap ${Math.round((t.vw - t.box.right) * 10) / 10} "${t.text}"` : `${ms}ms none`) }
  console.log(label + '\n   ' + rows.join('\n   '))
}
try {
  await L.go(w, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
  await p.waitForSelector('#inpCal')
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${SAT}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +SAT.slice(0, 4) * 12 + (+SAT.slice(5, 7) - 1)
    await w.press(at < want ? '#icNext' : '#icPrev')
  }
  await p.locator(`[data-icday="${SAT}"]`).tap({ position: { x: 8, y: 8 } })
  await p.waitForSelector('[data-testid="win-inputsday"]')
  await sleep(400)
  console.log('day window up:', await p.locator('[data-testid="win-inputsday"]').count())
  console.log('buttons in window:', await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `#${b.id}|${(b.textContent || '').trim().slice(0, 24)}`).join(' ; ')))
  await w.press('#icPopAdd')
  await p.waitForSelector('#inpEditPop #inpEditType')
  await p.selectOption('#inpEditPop #inpEditType', 'Training')
  await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.tap()
  await p.fill('#inpEditPop #inpEditStart', '09:00'); await p.fill('#inpEditPop #inpEditEnd', '12:00')
  await p.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
  await clearToast(p)
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="oilconf"]'); await sleep(400)
  await w.press('[data-testid="oil-yes"]')
  await clearToast(p)
  await w.press('[data-testid="oilconf-save"]')
  const t = await toastShown(p, 2500)
  console.log('first reading after the answer:', JSON.stringify(t))
  await sleep(500)
  const t2 = await toastNow(p)
  const windowUp = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))
  const pic = await L.pic(w, 'ntop-phone-note-with-window-up')
  console.log('windows up:', windowUp.join(','))
  if (t2) console.log(`== N-TOP ${t2.text && parseFloat(t2.opacity) > 0.5 && t2.box.y < 120 && Math.abs(t2.box.x - 12) < 0.6 && Math.abs(t2.vw - t2.box.right - 12) < 0.6 ? 'PASS' : 'FAIL'}\n   note ${JSON.stringify(t2.text)} opacity ${t2.opacity}; top edge y=${t2.box.y}, left ${t2.box.x}, right gap ${t2.vw - t2.box.right}, w ${t2.box.w}, h ${t2.box.h}, bottom gap ${t2.vh - t2.box.bottom}\n   pic ${pic}`)
  else console.log('== N-TOP NO NOTE')
} finally { await L.close(w) }
