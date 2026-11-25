// r4wf-ma-x8 — merge walk, walker A, X8 (a): a time typed and NOT left, then Reject on the same row (phone). Shared
// overseas duty Ranger + Hex 08:00–12:00, nothing changed: 0900 in Ranger's Start, not left; Reject on Ranger's row
// keeping the caret; tap blank. RECORD what moved to Personal Inputs and whose start became 09:00.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit KEEP=tap node scripts/handpass/r4wf-ma-x8.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-x8 v1', A.TAG, 'KEEP', process.env.KEEP || 'tap', 'bundle', A.EXPECT_BUNDLE)
const ID = 'X8a', steps = [], pics = []
let p
const persRead = () => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); if (!s) return null; return { head: (s.querySelector('.sb-ph')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80), rows: [...s.querySelectorAll('[data-inprow]')].map(r => `${r.getAttribute('data-inprow')} ${[...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')} ${r.querySelector('[data-ifld$=".str"]')?.value}-${r.querySelector('[data-ifld$=".end"]')?.value}`) } })
const rd = async (label, extra = {}) => { const r = { ...(await A.read(p, label)), pers: await persRead(), note: await A.note(p), ...extra }; steps.push(r); return r }
try {
  const w = await A.world(); p = w.page
  const iid = await A.fixture(w, [L.RANGER, L.HEX], { type: 'OD', from: '08:00', to: '12:00' })
  await A.openBoard(w)
  if (!(await p.locator(`#sbBoard > [data-secmove$=".unav"] [data-inprow^="${iid}"]`).count())) throw new Error('the shared OD is not under Unavailable')
  /* Personal Inputs open, so what moves there shows */
  const t = p.locator('#schedBoard [data-pitog]').first()
  const open = await p.evaluate(() => [...(document.querySelector('#sbBoard > [data-secmove$=".inputs"]')?.querySelectorAll('[data-ifld]') || [])].some(e => e.getBoundingClientRect().height > 0))
  await rd('filed')
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'str'), '0900', null, 'r-str-tap')
  await rd('0900 typed in Ranger\'s Start, not left', { piOpen: open })
  const row = await A.rowSel(p, 'Ranger')
  const k = await A.keepPress(w, `${row} .accb[data-acc="x"]`, 'X8a-reject')
  await rd('Reject on Ranger\'s row', { keep: k })
  pics.push(await A.pic(w, 'X8a-1-after-reject', ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  await A.away(w); await rd('blank tapped')
  pics.push(await A.pic(w, 'X8a-2-caret-left', ['#sbBoard > [data-secmove$=".unav"]', '#sbBoard > [data-secmove$=".inputs"]']))
  const hexChanged = steps.some(s => s.store.some(x => /Hex/.test(x) && (!/ 480-720 /.test(x) || /acc=r/.test(x))))
  const fin = steps.at(-1).store
  A.res(ID, hexChanged ? 'FAIL' : (k.kept ? 'RECORD' : 'RECORD (caret lost at Reject)'), { hexChanged, final: fin, pers: steps.at(-1).pers, keep: k, steps }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin(`x8a-${process.env.KEEP || 'tap'}`)
