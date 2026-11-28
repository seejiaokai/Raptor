// Walker a — A6: three or more changes in one save (D2521 Q3). One world; Saber files and changes; Ranger and Hex read.
// Run: node scripts/handpass/wr4-a-a6.mjs [run]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a6 v1')
const RUN = process.argv[2] || 'a6-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, sleep, shot, boxOf, go, RANGER, HEX } = L
const c = 'A6'
const day = (w, iso) => press(w, `#inpEdCal [data-iso="${iso}"]`)
const T = { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' }
const extra = w => w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].map(b => b.getAttribute('data-pp')).filter(id => !['bane', 'rocky', 'stiff'].includes(id) && !/9$/.test(id)))
const toggle = (w, id) => press(w, `#inpEditPop [data-pp="${id}"]`)
try {
  let w = await newPage('desk'); await signIn(w, 'ad')
  log(c, 'bundle ' + await bundleOf(w.page))
  const m = {}
  m.a = await fileInput(w, c, '2026-07-15', T)
  m.b = await fileInput(w, c, '2026-07-14', T)
  m.c = await fileInput(w, c, '2026-07-13', T)
  m.d = await fileInput(w, c, '2026-07-17', T)
  m.e = await fileInput(w, c, '2026-07-20', T)
  m.f1 = await fileInput(w, c, '2026-07-22', T)
  m.f2 = await fileInput(w, c, '2026-07-23', { type: 'LL', people: [RANGER], span: 'all' })
  m.g = await fileInput(w, c, '2026-07-19', T)
  log(c, 'made ' + JSON.stringify(m))
  const ed = async (k, iso, fn) => { if (!m[k]) { A.judge(c, k + ' fixture', false, 'not filed'); return } const b = await recOf(w.page, m[k]); await editInput(w, c, m[k], iso, fn); log(c, `${k}: before ${JSON.stringify(b)} after ${JSON.stringify(await recOf(w.page, m[k]))}`) }
  await ed('a', '2026-07-15', async () => { await day(w, '2026-07-16'); await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water') })
  await ed('b', '2026-07-14', async () => { await day(w, '2026-07-17'); await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range walk') })
  let added = []
  await ed('c', '2026-07-13', async () => { await day(w, '2026-07-16'); await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range talk'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water'); added = (await extra(w)).slice(0, 1); log(c, 'c adds ' + added); for (const id of added) await toggle(w, id) })
  await ed('d', '2026-07-17', async () => { await w.page.selectOption('#inpEditPop #inpEditType', 'Meeting'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water'); await toggle(w, HEX) })
  await ed('e', '2026-07-20', async () => { const x = (await extra(w)).slice(0, 3); log(c, 'e adds ' + x); for (const id of x) await toggle(w, id); await day(w, '2026-07-21'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water') })
  await ed('f1', '2026-07-22', () => w.page.fill('#inpEditPop #inpEditRmk', 'Bring water'))
  // f2: a leave made two days, then (a save of its own) extended, its "till" tick left as it stands
  await ed('f2', '2026-07-23', async () => { await day(w, '2026-07-23'); await day(w, '2026-07-24') })
  await ed('f2', '2026-07-23', async () => { log(c, 'f2 till tick: ' + await w.page.locator('#inpEditTill').isChecked().catch(() => 'none') + ' · till text ' + JSON.stringify(await w.page.locator('[data-testid="inped-till"]').textContent().catch(() => ''))); await day(w, '2026-07-23'); await day(w, '2026-07-27') })
  // g: does the window offer a cancel? then the schedule's own cancel, a save of its own
  if (m.g) {
    const { openDay } = L
    await openDay(w, '2026-07-19')
    await press(w, w.page.locator(`[data-testid="win-inputsday"] [data-iid="${m.g}"], [data-testid="win-inputsday"] [data-popiid="${m.g}"]`))
    await w.page.locator('[data-testid="win-inputedit"]').waitFor()
    const btns = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] button')].filter(b => b.getBoundingClientRect().width > 1).map(b => (b.textContent || b.getAttribute('aria-label') || '').trim()).filter(Boolean))
    A.judge(c, '(g) the window\'s buttons (is there a cancel?)', null, btns.filter(t => t.length < 30 && !/^\d+$/.test(t)))
    await shot(w.page, c, 'A6-g-window-desk', await boxOf(w.page, ['[data-testid="win-inputedit"]'], 8), 'the window of input g', 'desk')
    await w.page.keyboard.press('Escape'); await sleep(300)
    if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
    await go(w.page, 'editsched'); await sleep(600)
    const cx = await w.page.evaluate(() => [...document.querySelectorAll('[data-grcx]')].filter(b => b.getBoundingClientRect().width > 0).map(b => ({ k: b.getAttribute('data-grcx'), row: (b.closest('tr,.grow,.row,[data-row]')?.textContent || '').replace(/\s+/g, ' ').slice(0, 80) })))
    log(c, 'cx buttons on Edit Schedule: ' + JSON.stringify(cx))
    const hit = cx.find(x => x.k.startsWith('6.') && /Training/.test(x.row)) || cx.find(x => x.k.startsWith('6.'))
    if (!hit) A.judge(c, '(g) the schedule\'s cancel — NOT WALKED', null, 'no cancel button found on Sun 19 Jul\'s ground rows')
    else {
      await press(w, `[data-grcx="${hit.k}"]`)
      const open = await w.page.locator('#cxPop:not([hidden])').count()
      if (!open) A.judge(c, '(g) the schedule\'s cancel — NOT WALKED', null, 'the cancel box did not open')
      else { await w.page.fill('#cxReason', 'Weather'); await shot(w.page, c, 'A6-g-cxpop-desk', await boxOf(w.page, ['#cxPop .airpop-head', '#cxReason', '#cxSave'], 20), 'the cancel box', 'desk'); await press(w, '#cxSave'); await sleep(500); log(c, 'g after cancel: ' + JSON.stringify(await recOf(w.page, m.g))) }
    }
  }
  const lineOf = (r, name, d) => r.filter(l => l.name === name && (!d || l.day === d)).map(l => `${l.name} ${l.day} / ${l.what}`)
  for (const size of ['phone', 'desk']) {
    w = await handOver(w, size, 'us')
    const r = await A.bell(w, c, 'ranger-bell')
    A.judge(c, `${size}: (a) "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber"`, r.some(l => l.name === 'Range brief' && l.what === 'Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber'), lineOf(r, 'Range brief'))
    A.judge(c, `${size}: (b) both said, no "more" — "Now Fri 17 Jul, renamed — was Training · Saber"`, r.some(l => l.name === 'Range walk' && l.what === 'Now Fri 17 Jul, renamed — was Training · Saber'), lineOf(r, 'Range walk'))
    const lc = r.filter(l => l.name === 'Range talk' && !/You were added/.test(l.what))
    A.judge(c, `${size}: (c) ends "and 2 more changes · Saber" (RECORD the whole line)`, lc.some(l => /, and 2 more changes · Saber$/.test(l.what)), lineOf(r, 'Range talk'))
    const ld = r.filter(l => l.day === 'Fri 17 Jul' && l.name !== 'Range walk' && !/You were added/.test(l.what))
    A.judge(c, `${size}: (d) Ranger's whole line (RECORD); "Training" keeps its capital, ends "and 1 more change"`, ld.some(l => /, and 1 more change · Saber$/.test(l.what) && !/\btraining\b/.test(l.what)), ld.map(l => `${l.name} ${l.day} / ${l.what}`))
    A.judge(c, `${size}: (e) three added, day moved, remark (RECORD)`, null, r.filter(l => ['Mon 20 Jul', 'Tue 21 Jul'].includes(l.day)).map(l => `${l.name} ${l.day} / ${l.what}`))
    A.judge(c, `${size}: (f) only the remark (RECORD)`, null, r.filter(l => l.day === 'Wed 22 Jul').map(l => `${l.name} ${l.day} / ${l.what}`))
    const f2 = r.filter(l => l.day === 'Thu 23 Jul').map(l => `${l.name} ${l.day} / ${l.what}`)
    A.judge(c, `${size}: (f) dates extended, till tick (RECORD; no "remark" said)`, f2.length ? !f2.some(s => /remark/i.test(s)) && null : null, f2)
    A.judge(c, `${size}: (g) the schedule's cancel (RECORD)`, null, r.filter(l => l.day === 'Sun 19 Jul').map(l => `${l.name} ${l.day} / ${l.what}`))
  }
  w = await handOver(w, 'phone', 'hex')
  const h = await A.bell(w, c, 'hex-bell')
  const hd = h.filter(l => l.day === 'Fri 17 Jul' && !/You were added/.test(l.what) && l.name !== 'Range walk')
  A.judge(c, 'phone: (d) Hex reads only "You were taken off · Saber"', hd.length === 1 && hd[0].what === 'You were taken off · Saber', hd.map(l => `${l.name} ${l.day} / ${l.what}`))
  A.judge(c, 'phone: Hex\'s whole bell (RECORD)', null, A.said(h))
  await w.ctx.close()
} catch (e) { L.facts.errors.push('A6: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
