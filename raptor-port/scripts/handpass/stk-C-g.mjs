/* P3-18 answer history and Undo actors */
import * as C from './stk-C-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const nQ = p => p.locator('.mission-role-question').count()
const mx = async (p, ...n) => C.mixOf(await C.insightsRead(p), ...n)
const who = ['Saber', 'Echo', 'Ranger']
const pics = []
const { browser, p } = await C.world()
try {
  await C.tracking(p, true); await C.board(p, 0)
  await C.bset(p, 'ff:0.0.0.msn', 'ACM'); await C.bset(p, 'fr:0.0.0.0', 'DS FOR RU')
  const q1 = await C.question(p); await C.side(p, 'red')
  const mRed = await mx(p, ...who)
  const door = await C.openQuestion(p, 0, { published: false })
  await C.side(p, 'blue')
  const mBlue = await mx(p, ...who)
  pics.push(await C.pic(p, 'p318-A-blue'))
  const h1 = await C.histRead(p, { tab: 'All changes' })
  // Undo / Redo (board bar)
  const u1 = await W.door(p, 'board', 'undo'); const mU1 = await mx(p, ...who)
  const r1 = await W.door(p, 'board', 'redo'); const mR1 = await mx(p, ...who)
  const u2 = await W.door(p, 'board', 'undo'); const mU2 = await mx(p, ...who)
  const r2 = await W.door(p, 'board', 'redo'); const mR2 = await mx(p, ...who)
  // give a second admin a sign-in through Admin → Users
  await W.boardOff(p); await L.go(p, 'admin')
  await p.locator('.adm-cat').filter({ hasText: 'Users' }).click(); await C.sleep(500)
  await p.locator('#page-admin button').filter({ hasText: 'Anvil' }).first().click(); await C.sleep(500)
  await p.locator('#page-admin input[placeholder="name@mail"]').fill('anvil@mail')
  const roles = await p.locator('#accGiveRole').locator('option').evaluateAll(os => os.map(o => o.value + '|' + o.textContent))
  await p.locator('#accGiveRole').selectOption('admin'); await C.sleep(200)
  pics.push(await C.pic(p, 'p318-giveadmin'))
  await p.getByRole('button', { name: 'Give sign-in' }).click(); await C.sleep(700)
  pics.push(await C.pic(p, 'p318-given'))
  // sign out; sign in as B
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await L.signIn(p, ['anvil@mail', 'x'], { goto: false }); await C.sleep(800)
  const badge = await p.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText)
  await C.board(p, 0)
  const doorB = await C.openQuestion(p, 0, { published: false })
  await C.side(p, 'red')
  const mB = await mx(p, ...who)
  const undoB = await p.locator('#sbUndo').evaluate(e => ({ disabled: e.disabled, title: e.title }))
  pics.push(await C.pic(p, 'p318-B-red'))
  const histB = await C.histRead(p, { tab: 'All changes' })
  // back to A
  await W.boardOff(p)
  await p.locator('#logout:visible').first().click(); await C.sleep(800)
  await L.signIn(p, 'a', { goto: false }); await C.sleep(800)
  await C.board(p, 0)
  const undoA = await p.locator('#sbUndo').evaluate(e => ({ disabled: e.disabled, title: e.title }))
  const dA = await W.door(p, 'board', 'undo')
  const mA = await mx(p, ...who)
  pics.push(await C.pic(p, 'p318-A-again'))
  const histA = await C.histRead(p, { tab: 'All changes' })
  // reload: answers saved?
  await C.sleep(1200); await p.reload(); await L.signIn(p, 'a', { goto: false }); await C.board(p, 0)
  const mReload = await mx(p, ...who)
  C.row('P3-18', 'admin A (ad): Red then Change → Blue on Mon VL; Undo/Redo ×2 on the board bar; Admin → Users gave Anvil a sign-in as admin; signed in as Anvil, answered Red; signed back in as A; looked at History and Undo; reload',
    `first question ${J(q1.nQ)}; Insights after Red ${mRed}; after Blue ${mBlue}. Changes window (A): ${h1.text}. Undo ${J((u1.toasts || [])[0] || u1.title)} → ${mU1}; Redo ${J((r1.toasts || [])[0] || r1.title)} → ${mR1}; Undo ${J((u2.toasts || [])[0] || u2.title)} → ${mU2}; Redo ${J((r2.toasts || [])[0] || r2.title)} → ${mR2}. Roles offered: ${J(roles)}. Signed in as Anvil badge ${J(badge)}; Remarks door/question ${J(doorB.q)}; B's answer Red → ${mB}; Undo button for B (fresh session) ${J(undoB)}. Changes window (B): ${histB.text}. Back as A: Undo button ${J(undoA)}; pressing Undo gave ${J(dA)}; Insights ${mA}; Changes window (A again): ${histA.text}. After reload: ${mReload}`,
    'CHECK', pics)
} catch (e) { C.row('P3-18', 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p318-error')]) }
finally { await browser.close() }
console.log('ERRORS', JSON.stringify(C.ERR))
C.save('g')
