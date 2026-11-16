/* wwf w1 scenario 5 — copies, plans, Undo/Redo and reload. */
import * as H from './wwf-w1-lib.mjs'
const X = await H.init(process.env.RUN || 's05')
const { say, sleep, row, pic } = X
const w = await X.open({})
const { page } = w
const S = 'S5', SZ = 'desktop'
const crewOf = ls => ls.filter(l => H.crew(l))
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const blocks = d => page.evaluate(d => JSON.stringify(window.DAYS[d].dutywaves.map(b => b.label + '/' + (b.sa || '-') + ':' + b.rows.slice(0, 1).map(r => r.role + ' ' + r.str + '-' + r.end + ' ' + (r.id || '')).join(' | '))), d)
const monday = async (d, pg) => { await H.gotoWeek(X, w, H.MONDAY_WK, pg || null); const ww = await X.weekWarn(w, '#eWeek', d); return ww }
const planMenuDump = async (d, tag) => {
  await X.press(w, `#eWeek [data-planmenu="${d}"]`); await sleep(400)
  const m = await page.evaluate(() => [...document.querySelectorAll('.wm, [data-planpv], [data-plansw], [data-planalt], [data-plannew]')].filter(e => e.offsetWidth).map(e => [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + '|' + e.innerText.replace(/\s+/g, ' ')).join(' ;; '))
  say('PLAN MENU ' + tag, m); await pic(w, 'menu-' + tag)
  return m
}
const D = 1, N = 2  // plan day: Tue 28 Jul (1); next day Wed 29 Jul (2)
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
const sc = await H.makeDesk(X, w, D, { tpl: 'sc', str: '20:00', end: '', people: ['bane'] })
await X.closeBoard(w)
await X.board(w, N)
await H.flight2(X, w, N, { to: '09:00', ld: '10:00', br: '08:00', front: 'bane', rear: null })
await X.closeBoard(w)
let ww = await monday(N)
say('PLAN A (END blank) Wed strip', ww.head, JSON.stringify(ww.items))
await pic(w, '01-planA-wed')
const aBlank = crewOf(ww.items).length === 0
// + Alt Plan
await X.press(w, `#eWeek [data-planmenu="${D}"]`); await sleep(400)
await pic(w, '02-menu-before-alt')
const altBtn = page.locator('.wm:visible', { hasText: '+ Alt Plan' }).first()
await altBtn.click(); await sleep(900)
await pic(w, '03-after-alt-plan')
say('after + Alt Plan: curDraft', await page.evaluate(() => typeof window.curDraftId === 'function' ? String(window.curDraftId(1)) : 'n/a'), await blocks(D))
await planMenuDump(D, 'after-alt')
await page.keyboard.press('Escape'); await sleep(200)
// type END 23:00 on plan B
const nowPlan = await page.evaluate(() => document.querySelector('#eWeek [data-planmenu="1"]')?.innerText.replace(/\s+/g, ' '))
say('selector now reads', nowPlan)
await H.setEnd(X, w, D, sc.wi, 0, '23:00')
await X.closeBoard(w)
say('plan B blocks', await blocks(D))
ww = await monday(N)
say('PLAN B (END 23:00) Wed strip', ww.head, JSON.stringify(ww.items))
await pic(w, '04-planB-wed')
const bLine = crewOf(ww.items).length > 0
row(S, SZ, 'Plan A END blank; + Alt Plan creates Plan B; type END 23:00 there; read Wed (Ranger B 08:00)', 'Plan A none; Plan B crew-rest line (clear 11:00)', 'A: ' + JSON.stringify(crewOf([])) + ' blank-ok=' + aBlank + ' | B: ' + JSON.stringify(crewOf(ww.items)) + ' | selector ' + nowPlan, aBlank && bLine ? 'PASS' : 'FAIL', 'w1/s05/04-planB-wed.png')
// switch back to A via menu
const sw = async (labelRe, tag) => {
  await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
  await X.press(w, `#eWeek [data-planmenu="${D}"]`); await sleep(400)
  const items = page.locator('.wm:visible')
  const n = await items.count(); const labels = []
  for (let i = 0; i < n; i++) labels.push((await items.nth(i).innerText()).replace(/\s+/g, ' '))
  say('menu labels (' + tag + ')', JSON.stringify(labels))
  const ix = labels.findIndex(l => labelRe.test(l))
  if (ix < 0) { say('NO MATCH', labelRe); await page.keyboard.press('Escape'); return false }
  await items.nth(ix).click(); await sleep(900)
  await pic(w, 'switch-' + tag)
  return true
}
await step('switch to live/A', async () => {
  const ok = await sw(/Live working copy|Plan A|Main/i, 'toA')
  say('switched to A?', ok, await blocks(D))
  ww = await monday(N); say('after switch to A Wed strip', ww.head, JSON.stringify(ww.items)); await pic(w, '05-A-again-wed')
  const aNow = crewOf(ww.items).length
  const ok2 = await sw(/Plan B|Alt|Draft|Plan 2|B\b/i, 'toB')
  say('switched to B?', ok2, await blocks(D))
  ww = await monday(N); say('after switch to B Wed strip', ww.head, JSON.stringify(ww.items)); await pic(w, '06-B-again-wed')
  row(S, SZ, 'switch A -> B -> A through the plans menu (selector label seen in the menu dump)', 'next-day result follows the selected plan', 'A again crew lines=' + aNow + ' ; B again crew lines=' + crewOf(ww.items).length + ' ; blocks ' + await blocks(D), 'SEE-LOG', 'w1/s05/06-B-again-wed.png')
})
// Undo / Redo of END change
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
const endNow = await page.evaluate(() => window.DAYS[1].dutywaves.map(b => b.rows[0].end).join(','))
say('END now (plan on screen)', endNow)
await H.setEnd(X, w, D, sc.wi, 0, '22:00'); await X.closeBoard(w)
say('after 22:00', await blocks(D))
await X.press(w, '#undoBtn'); await sleep(700)
say('after Undo', await blocks(D)); await pic(w, '07-after-undo')
await X.press(w, '#redoBtn'); await sleep(700)
say('after Redo', await blocks(D)); await pic(w, '08-after-redo')
// leave week, return, reload
await H.gotoWeek(X, w, '03/08/2026', null)
await H.gotoWeek(X, w, H.MONDAY_WK, null)
say('after week away/back', await blocks(D))
await sleep(1500)
await H.reload(X, w)
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
say('after reload', await blocks(D))
ww = await X.weekWarn(w, '#eWeek', N); say('after reload Wed strip', ww.head, JSON.stringify(ww.items)); await pic(w, '09-after-reload-wed')
await planMenuDump(D, 'after-reload')
await page.keyboard.press('Escape')
// ---- day template: save this day, apply to another unpublished day (Thu 30 = 3), re-seat, test
const T = await import('./wwf-w1-s05-tail.mjs')
await T.run({ X, H, w, page, D, N, S, SZ, crewOf, step, blocks, sw, planMenuDump })
await X.fin(w)
