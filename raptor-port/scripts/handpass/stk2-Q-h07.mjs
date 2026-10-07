/* H-07 — a Logic change is one undo step and survives a reload (re-walk, walker Q). Controls only. */
import * as C from './stk2-Q-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const w = await C.world(); const p = w.p
const pics = []
const checks = []
const log = []
const ensureEdit = async () => { await L.go(p, 'logic'); const e = p.locator('#lgEdit:visible'); if (await e.count()) { await e.click(); await C.sleep(400) } }
const readVals = async () => {
  await ensureEdit()
  return p.evaluate(() => {
    const lead = document.querySelector('[data-lgset="reportLead"]'), words = document.querySelector('[data-lgset="reportText"]'), sw = document.querySelector('#lgMissionMix')
    const sv = sw ? (sw.getAttribute('aria-checked') != null ? sw.getAttribute('aria-checked') === 'true' : !!sw.checked) : null
    return { lead: lead ? (lead.value ?? lead.textContent) : null, words: words ? (words.value ?? words.textContent) : null, track: sv }
  })
}
const barTitles = () => p.evaluate(() => ({ undo: (document.querySelector('#undoBtn') || {}).title, redo: (document.querySelector('#redoBtn') || {}).title, undoOff: (document.querySelector('#undoBtn') || {}).disabled, redoOff: (document.querySelector('#redoBtn') || {}).disabled }))
const setBox = async (key, value) => {
  await ensureEdit()
  const box = p.locator(`[data-lgset="${key}"]`).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await box.fill(''); await box.type(String(value), { delay: 8 }); await box.press('Tab'); await C.sleep(500)
}
const pressSwitch = async () => { await ensureEdit(); await p.locator('#lgMissionMix').click(); await C.sleep(500) }
try {
  await W.toastSpy(p)
  const v0 = await readVals()
  log.push(`start ${J(v0)}`)
  const changes = {
    lead: { label: 'nominal report before T/O (-> 2h)', run: () => setBox('reportLead', '2h') },
    words: { label: "the '+ In-time / Rally' button's words (-> WALK WORDS)", run: () => setBox('reportText', 'WALK WORDS') },
    track: { label: 'Track Blue/RED sorties switch (-> On)', run: () => pressSwitch() },
  }
  const rows = []
  for (const k of ['lead', 'words', 'track']) {
    const before = await readVals()
    await changes[k].run()
    const mid = await readVals()
    const bar1 = await barTitles()
    const u = await W.door(p, 'top', 'undo')
    const afterU = await readVals()
    const bar2 = await barTitles()
    pics.push(await C.pic(p, `h07-${k}-after-undo`))
    const r = await W.door(p, 'top', 'redo')
    const afterR = await readVals()
    pics.push(await C.pic(p, `h07-${k}-after-redo`))
    const exactlyOne = ['lead', 'words', 'track'].every(x => x === k ? (J(afterU[x]) === J(before[x]) && J(mid[x]) !== J(before[x])) : (J(afterU[x]) === J(mid[x])))
    const restored = J(afterR) === J(mid)
    rows.push({ k, before, mid, afterU, afterR, undoTitle: bar1.undo, undoPressed: u.pressed, undoToast: (u.toasts || [])[0], undoPresent: u.present, redoTitleAfterUndo: bar2.redo, redoPressed: r.pressed, redoToast: (r.toasts || [])[0], exactlyOne, restored })
    checks.push([`${changes[k].label}: Undo put back exactly that one value and the bar said "${(u.toasts || [])[0] || bar1.undo}"; Redo restored it (${restored})`, u.pressed && exactlyOne && restored, J({ before, mid, afterU, afterR, undoTitle: bar1.undo, toast: u.toasts, redoToast: r.toasts })])
  }
  const now = await readVals()
  await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.settle(p, 900)
  const after = await readVals()
  pics.push(await C.pic(p, 'h07-reloaded'))
  checks.push(['after a reload and fresh sign-in the three changed values are still there', J(now) === J(after) && now.lead !== v0.lead && now.words !== v0.words && now.track === true, J({ v0, now, after })])
  const bad = checks.filter(c => !c[1])
  C.row('H-07', 'Logic: changed the nominal report (to 2h), the button words (to WALK WORDS) and the Track Blue/RED switch (On) one at a time; after each, top-bar Undo then Redo; then reload and sign in again',
    checks.map(c => `${c[1] ? 'OK' : 'NOT OK'} ${c[0]} [${String(c[2]).slice(0, 700)}]`).join(' || ') + ' || ' + log.join(' ;; '), bad.length ? 'FAIL' : 'PASS', pics)
} catch (e) { C.row('H-07', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'h07-error')]) }
console.log('ERRORS', J(C.ERR))
C.save('h07')
await w.browser.close()
