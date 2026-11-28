// ra-05 - item 5: Export with the save picker open across a pick. The picker is a STAND-IN: the app's own test door
// (window.__pickSaveForTests) is handed a promise this script holds open, then releases with a fake file. CASES: control (no pick),
// pick (149, then release), there-and-back (149, 142, then release).
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, shut, check, ask, hit, shots, press, state, note } from './rlib.mjs'
import { trackerSaved, layoutDiff } from './ra-lib.mjs'
const SZS = (process.env.SZ || 'd,pc').split(','), CASES = (process.env.CASES || 'control,pick,back').split(',')
const TAG = process.env.TAG || 'ra-05'
console.log('ra-05-export v1', process.env.MQ_PORT, SZS, CASES)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const door = s => s.page.evaluate(() => {
  window.__raFile = { asked: 0, created: 0, wrote: [], closed: 0 }
  window.__pickSaveForTests = name => new Promise(res => {
    window.__raFile.asked++; window.__raFile.name = name
    window.__releasePick = () => res({ name, createWritable: async () => { window.__raFile.created++; return { write: async t => { window.__raFile.wrote.push(String(t).length) }, close: async () => { window.__raFile.closed++ } } } })
  })
})
const file = s => s.page.evaluate(() => ({ ...window.__raFile }))
const copyShown = s => s.page.evaluate(() => { const e = document.getElementById('copyOk'); return !!e && e.getBoundingClientRect().width > 1 })
const startExport = async s => { await hit(s, '#fileMenuBtn', 250); await hit(s, '#exportBtn', 450); const open = await copyShown(s); await hit(s, '#copyOk', 350); return open }
/* the pick by the size's own door, where a press can reach it; if the window stands over it, by the keys */
async function pickNow(s, num) {
  const { page } = s
  const barSel = s.desk ? '#sqnMenuBtn' : '#burger'
  const free = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(n => n.getBoundingClientRect().width > 1); if (!e) return 'none'; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName}#${t?.id}` }, barSel)
  log('the pick control is', free)
  if (free === 'free') {
    if (s.desk) { await press(s, '#sqnMenuBtn'); await press(s, s.page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first()) }
    else {
      await press(s, '#burger'); if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn')
      await press(s, page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first())
      await shut(s)
    }
    await wait(s, 700); return 'by presses'
  }
  await page.evaluate(() => document.getElementById('sqnMenuBtn').focus())
  await page.keyboard.press('Enter'); await wait(s, 220)
  for (let i = 0; i < 8; i++) { const at = await page.evaluate(() => document.activeElement?.querySelector?.('.sqm-num')?.textContent.trim() ?? null); if (at === num) break; await page.keyboard.press('ArrowDown'); await wait(s, 60) }
  await page.keyboard.press('Enter'); await wait(s, 800)
  return 'by the keys (the window covers the control)'
}
for (const sz of SZS) for (const c of CASES) {
  const run = `${TAG}-${sz}-${c}`
  picsFor(run)
  await step(run, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800)
    if (!s.desk) await shut(s)
    await door(s)
    const a0 = await trackerSaved(s, '142')
    const opened = await startExport(s)
    const f0 = await file(s)
    check(`${run}: the Export window opened and its Export asked the (stand-in) picker`, opened && f0.asked === 1, { opened, asked: f0.asked })
    await pic(s, '01-picker-pending')
    if (c === 'control') {
      await page.evaluate(() => window.__releasePick()); await wait(s, 900)
      const f = await file(s), q = await ask(s)
      check(`${run}: (calibration) with no pick the file IS written and the app says so`, f.wrote.length === 1 && f.closed === 1 && /Exported as/.test(q.msg || ''), { wrote: f.wrote, msg: q.msg })
      await pic(s, '02-control-written')
      await s.ctx.close(); return
    }
    const how = await pickNow(s, '149'); log(run, 'pick', how)
    const t1 = await T(s)
    check(`${run}: on 149 while the picker is open`, /^149/.test(t1.sq || ''), t1.sq)
    await pic(s, '02-on-149-pending')
    if (c === 'back') {
      const how2 = await pickNow(s, '142'); log(run, 'pick back', how2)
      const t2 = await T(s); check(`${run}: back on 142 while the picker is open`, /^142/.test(t2.sq || ''), t2.sq)
      await pic(s, '03-back-142-pending')
    }
    const b0 = await trackerSaved(s, '149')
    await page.evaluate(() => window.__releasePick()); await wait(s, 1000)
    const f = await file(s), q = await ask(s), t = await T(s)
    check(`${run}: nothing written to the file`, f.created === 0 && f.wrote.length === 0, { created: f.created, wrote: f.wrote })
    check(`${run}: no message after the release`, !q.msg, q)
    check(`${run}: no error in the save corner`, !/NOT saved|error/i.test(t.saveStat || ''), t.saveStat)
    check(`${run}: the Export window is not left open`, !(await copyShown(s)), await copyShown(s))
    check(`${run}: the app on the squadron he picked last`, new RegExp('^' + (c === 'back' ? '142' : '149')).test(t.sq || ''), t.sq)
    check(`${run}: the release wrote no saved record`, layoutDiff(a0, await trackerSaved(s, '142')).length === 0 && layoutDiff(b0, await trackerSaved(s, '149')).length === 0, { on142: layoutDiff(a0, await trackerSaved(s, '142')), on149: layoutDiff(b0, await trackerSaved(s, '149')) })
    await pic(s, '04-after-release')
    /* still usable: Export again here, the picker released at once, and this one is written and told */
    await door(s)
    const again = await startExport(s); await page.evaluate(() => window.__releasePick()); await wait(s, 900)
    const f2 = await file(s), q2 = await ask(s)
    check(`${run}: usable: a fresh Export here writes and says so`, again && f2.wrote.length === 1 && /Exported as/.test(q2.msg || ''), { again, wrote: f2.wrote, msg: q2.msg })
    await pic(s, '05-fresh-export')
    await s.ctx.close()
  })
}
finish(TAG); await closeAll()
