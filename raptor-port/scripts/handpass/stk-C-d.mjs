/* P3-08 — context-changing actions dismiss the question */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const nQ = p => p.locator('.mission-role-question').count()
const OUTCOME = []   // [what, nQ right after, nQ after coming back / a moment later]

async function fresh(editor) {
  const w = await C.world()
  const p = w.p
  await C.tracking(p, true)
  if (editor === 'Board') await C.board(p, 0); else await C.toWeek(p, 0)
  await C.fset(p, 'ff:0.0.0.msn', 'ACM')
  return w
}
async function trigger(p, text = 'DS FOR RU') {
  await C.fset(p, 'fr:0.0.0.0', text)
  return nQ(p)
}
const log = (editor, what, a, b, pics) => { OUTCOME.push({ editor, what, a, b, pics }); console.log(editor, what, a, b) }

async function boardCases() {
  const { browser, p } = await fresh('Board')
  try {
    const pics = []
    let t = await trigger(p)
    pics.push(await C.pic(p, 'b-open'))
    log('Board', 'question opened by own Remarks edit', t, null)
    // 1 wording change to a no-cue wording
    await C.fset(p, 'fr:0.0.0.0', 'ORDINARY BRIEF')
    log('Board', 'cue wording changed to a wording with no cue', await nQ(p), null, [await C.pic(p, 'b-wording')])
    // 2 undo
    t = await trigger(p, 'DS FOR RU')
    const u = await W.door(p, 'board', 'undo')
    log('Board', 'Undo with the question open (before ' + t + '; ' + J((u.toasts || [])[0] || u.title) + ')', await nQ(p), null, [await C.pic(p, 'b-undo')])
    const r = await W.door(p, 'board', 'redo')
    log('Board', 'Redo afterwards (' + J((r.toasts || [])[0] || r.title) + ') — a delayed question?', await nQ(p), null, [await C.pic(p, 'b-redo')])
    // 3 day change (open a question again first)
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 2')
    t = await nQ(p)
    await p.locator('#sbDays [data-sbd], #sbDays button').filter({ hasText: /Tue/ }).first().click().catch(async () => { await p.getByText('Tue 14').first().click() })
    await C.sleep(700)
    const onTue = await p.evaluate(() => window.SBDAY)
    const qTue = await nQ(p)
    await p.getByText('Mon 13').first().click(); await C.sleep(700)
    log('Board', `day change Mon→Tue→Mon (question before ${t}; on day ${onTue})`, qTue, await nQ(p), [await C.pic(p, 'b-day')])
    // 4 tracking off / on
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 3')
    t = await nQ(p)
    await C.tracking(p, false)
    await C.board(p, 0)
    const qOff = await nQ(p)
    await C.tracking(p, true)
    await C.board(p, 0)
    log('Board', `tracking switched Off then On (question before ${t})`, qOff, await nQ(p), [await C.pic(p, 'b-tracking')])
    // 5 week change through the board's calendar
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 4')
    t = await nQ(p)
    await p.locator('#sbCal').click(); await C.sleep(400)
    await p.locator('[data-wcal="2026-07-22"]').click().catch(() => {}); await C.sleep(900)
    const wk = await p.evaluate(() => window.CURWEEK)
    const qWk = await nQ(p)
    pics.push(await C.pic(p, 'b-weekchange'))
    await p.locator('#sbCal').click().catch(() => {}); await C.sleep(300)
    await p.locator('#weekCal .wc-today').click().catch(() => {}); await C.sleep(900)
    log('Board', `week change via the board's Calendar (week now ${wk}; question before ${t}); back to ${await p.evaluate(() => window.CURWEEK)}`, qWk, await nQ(p), pics.slice(-1))
    // 6 sign-out
    await C.board(p, 0)
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 5')
    t = await nQ(p)
    await W.boardOff(p)
    await p.locator('#logout:visible').first().click(); await C.sleep(800)
    await L.signIn(p, 'a', { goto: false }); await C.sleep(600)
    await C.board(p, 0)
    log('Board', `sign-out and sign in again (question before ${t})`, await nQ(p), null, [await C.pic(p, 'b-signout')])
    const doorAfter = await C.doorLabel(p, 0)
    log('Board', 'manual door after sign-in says', J(doorAfter.label), doorAfter.nQ)
  } catch (e) { console.log('board cases error', e); OUTCOME.push({ editor: 'Board', what: 'ERROR ' + String(e).slice(0, 300) }) }
  finally { await browser.close() }
}

async function deleteCase() {
  const { browser, p } = await fresh('Board')
  try {
    await trigger(p)
    const before = await nQ(p)
    await p.locator('#schedBoard [data-ldel="0.0.0.0"]:visible').first().click(); await C.sleep(500)
    const mid = await nQ(p)
    const left = await p.evaluate(() => window.DAYS[0].waves[0].formations.map(f => f.cs + ':' + f.aircraft.length))
    await p.locator('#schedBoard [data-ldel="0.0.0.0"]:visible').first().click(); await C.sleep(500)
    const left2 = await p.evaluate(() => window.DAYS[0].waves[0].formations.map(f => f.cs + ':' + f.aircraft.length))
    log('Board', `formation VL removed line by line (question before ${before}; after the first line ${mid} ${J(left)}; after the second ${J(left2)})`, await nQ(p), null, [await C.pic(p, 'b-delete')])
  } catch (e) { OUTCOME.push({ editor: 'Board', what: 'delete ERROR ' + String(e).slice(0, 300) }) }
  finally { await browser.close() }
}
async function moveCase() {
  const { browser, p } = await fresh('Board')
  try {
    await trigger(p)
    const before = await nQ(p)
    const order0 = await p.evaluate(() => window.DAYS[0].waves.map(w => w.label))
    const src = p.locator('#schedBoard .wvgrip').first()
    const dst = p.locator('#schedBoard .wvgrip').nth(1)
    await W.drag(p, src, dst)
    const order1 = await p.evaluate(() => window.DAYS[0].waves.map(w => w.label))
    log('Board', `Go 1 wave dragged below Go 2 (waves ${J(order0)} → ${J(order1)}; question before ${before})`, await nQ(p), null, [await C.pic(p, 'b-move')])
  } catch (e) { OUTCOME.push({ editor: 'Board', what: 'move ERROR ' + String(e).slice(0, 300) }) }
  finally { await browser.close() }
}
async function versionCase() {
  const { browser, p } = await fresh('Board')
  try {
    await trigger(p, 'DS FOR RU')
    await C.side(p, 'later')
    await C.publish2(p, 0)
    const ver = await p.evaluate(() => window.dayCurVer(0))
    await C.preview(p, ver)
    const q = await C.openQuestion(p, 0, { published: true })
    const before = await nQ(p)
    await C.live(p, 0)
    const after = await nQ(p)
    log('Board', `version change: published question open (${before}) → Back to live copy`, after, null, [await C.pic(p, 'b-version')])
  } catch (e) { OUTCOME.push({ editor: 'Board', what: 'version ERROR ' + String(e).slice(0, 300) }) }
  finally { await browser.close() }
}
async function weekCases() {
  const { browser, p } = await fresh('Week')
  try {
    const pics = []
    let t = await trigger(p)
    pics.push(await C.pic(p, 'w-open'))
    log('Week', 'question opened by own Remarks edit', t, null)
    await C.fset(p, 'fr:0.0.0.0', 'ORDINARY BRIEF')
    log('Week', 'cue wording changed to no-cue wording', await nQ(p), null, [await C.pic(p, 'w-wording')])
    t = await trigger(p, 'DS FOR RU')
    await p.locator('#undoBtn').click(); await C.sleep(700)
    log('Week', 'Undo (top bar) with the question open (before ' + t + ')', await nQ(p), null, [await C.pic(p, 'w-undo')])
    await p.locator('#redoBtn').click(); await C.sleep(700)
    log('Week', 'Redo (top bar) — a delayed question?', await nQ(p), null)
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 3'); t = await nQ(p)
    await C.tracking(p, false); await C.toWeek(p, 0)
    const qOff = await nQ(p)
    await C.tracking(p, true); await C.toWeek(p, 0)
    log('Week', `tracking Off then On (question before ${t})`, qOff, await nQ(p), [await C.pic(p, 'w-tracking')])
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 4'); t = await nQ(p)
    // another week through the week buttons
    const other = await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => e.getAttribute('data-wk')).filter(v => v !== window.CURWEEK)[0])
    await p.evaluate(w => document.querySelector(`[data-wk="${w}"]`).click(), other); await C.sleep(900)
    const qWk = await nQ(p)
    await p.evaluate(w => { const b = document.querySelector('[data-wk]'); }, other)
    log('Week', `week change (to ${other}; question before ${t})`, qWk, null, [await C.pic(p, 'w-weekchange')])
    await p.evaluate(() => document.querySelector('[data-wk="13/07/2026"]').click()); await C.sleep(900)
    await C.toWeek(p, 0)
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU 5'); t = await nQ(p)
    await p.locator('#logout:visible').first().click(); await C.sleep(800)
    await L.signIn(p, 'a', { goto: false }); await C.sleep(600)
    await C.toWeek(p, 0)
    log('Week', `sign-out and sign in (question before ${t})`, await nQ(p), null, [await C.pic(p, 'w-signout')])
  } catch (e) { console.log(e); OUTCOME.push({ editor: 'Week', what: 'ERROR ' + String(e).slice(0, 300) }) }
  finally { await browser.close() }
}
await boardCases(); await deleteCase(); await moveCase(); await versionCase(); await weekCases()
const body = OUTCOME.map(o => o.what.startsWith('ERROR') || /ERROR/.test(o.what) ? `[${o.editor}] ${o.what}` : `[${o.editor}] ${o.what}: question count ${o.a}${o.b !== null && o.b !== undefined ? ' → ' + o.b : ''}`).join(' || ')
const pics = OUTCOME.flatMap(o => o.pics || [])
C.row('P3-08', 'a question opened by an own edit, then each invalidating action in turn: wording change, Undo/Redo, day change, tracking Off/On, week change, formation delete, wave drag, version change, sign-out',
  body, 'CHECK', pics)
console.log('ERRORS', JSON.stringify(C.ERR))
C.save('d')
