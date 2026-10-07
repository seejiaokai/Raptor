/* P3-06 typed text saved before a choice; P3-07 unrelated editing keeps the question */
import * as C from './stk2-Q-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const CREW = ['Saber', 'Echo']
const mixNow = async p => C.mixOf(await C.insightsRead(p), ...CREW)
const rm = (p, di = 0, ai = 0) => p.evaluate(([i, a]) => window.DAYS[i].waves[0].formations[0].aircraft[a].rmks, [di, ai])
const seqn = p => p.evaluate(() => window.commandStreamLen())

async function cond(editor, answer = 'red') {
  const w = await C.world()
  const p = w.p
  await C.tracking(p, true)
  if (editor === 'Board') await C.board(p, 0); else await C.toWeek(p, 0)
  await C.fset(p, 'ff:0.0.0.msn', 'ACM')
  await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU')
  if ((await C.question(p)).nQ) await C.side(p, answer)
  return w
}
const fieldLoc = (p, editor, key) => editor === 'Board' ? p.locator(`#schedBoard [data-bfld="${key}"]:visible`).first() : p.locator(`#eWeek [data-txt="${key}"]:visible`).first()
async function typeDirty(p, editor, key, text) {
  const f = fieldLoc(p, editor, key)
  await f.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await f.click(); await C.sleep(200)
  if (editor === 'Board') await f.fill(text); else { await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 5 }) }
  return f
}
const hasFocus = async (p, editor, key) => p.evaluate(([k, ed]) => { const a = document.activeElement; return !!a && (a.getAttribute(ed === 'Board' ? 'data-bfld' : 'data-txt') === k) }, [key, editor])

async function p306(editor) {
  const { browser, p } = await cond(editor, 'red')
  const id = 'P3-06'
  const pics = []
  try {
    const m0 = await mixNow(p)
    const f = await typeDirty(p, editor, 'fr:0.0.0.0', 'DS FROM RU')
    const label = await p.evaluate(() => { const b = document.querySelector('[data-role-choose]'); return b && b.offsetParent ? b.innerText.trim() : null })
    const n0 = await seqn(p)
    const savedBefore = await rm(p)
    await p.locator('[data-role-choose]:visible').first().click(); await C.sleep(400)
    const savedAfterChoose = await rm(p)
    const n1 = await seqn(p)
    const q = await C.question(p)
    const focus1 = await hasFocus(p, editor, 'fr:0.0.0.0')
    const reach1 = await C.reach(p)
    pics.push(await C.pic(p, 'p306-' + editor + '-question'))
    await C.side(p, 'blue')
    const savedAfterBlue = await rm(p)
    const focus2 = await hasFocus(p, editor, 'fr:0.0.0.0')
    // continue typing in the same box
    await p.keyboard.type(' // X')
    const typed = await f.evaluate(e => e.value ?? e.textContent)
    await p.keyboard.press('Tab'); await C.sleep(400)
    const saved2 = await rm(p)
    const qAfter = await C.question(p)
    const m1 = await mixNow(p)
    // wording back to the old text: which answer is used?
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU')
    const qBack = await C.question(p)
    const m2 = await mixNow(p)
    pics.push(await C.pic(p, 'p306-' + editor + '-back'))
    C.row(`${id}(${editor}${process.env.HP_PHONE ? ",phone" : ""})`, `${editor}: answered Red on "DS FOR RU"; clicked into Remarks, typed "DS FROM RU" WITHOUT leaving the box, pressed the manual door, then Blue; kept typing; later put the old wording back`,
      `Insights before ${m0}. While typing the door says ${J(label)}; text saved before the click: ${J(savedBefore)} (commands ${n0}); after pressing it: saved ${J(savedAfterChoose)} (commands ${n1}); question ${J(q)}; caret still in the Remarks box ${focus1}; finger reach: ${reach1}. After Blue: Insights ${m1}; saved ${J(savedAfterBlue)}; caret in box ${focus2}; typed continuation shows ${J(typed)}, saved after Tab ${J(saved2)}; question after Tab ${J(qAfter.nQ)}. Old wording "DS FOR RU" restored: question ${J(qBack.nQ)}, Insights ${m2}`,
      (savedAfterChoose === 'DS FROM RU' && savedBefore === 'DS FOR RU' ? 'PASS' : 'CHECK'), pics)
  } catch (e) { C.row(`${id}(${editor})`, 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p306-' + editor + '-error')]) }
  finally { await browser.close() }
}

async function p307(editor) {
  const { browser, p } = await C.world().then(async w => { const p = w.p; await C.tracking(p, true); if (editor === 'Board') await C.board(p, 0); else await C.toWeek(p, 0); return w })
  const pics = []
  try {
    await C.fset(p, 'ff:0.0.0.msn', 'ACM')
    await C.fset(p, 'fr:0.0.0.0', 'DS FOR RU')
    const q0 = await C.question(p)
    const reach0 = await C.reach(p)
    pics.push(await C.pic(p, 'p307-' + editor + '-open'))
    await C.fset(p, 'ff:0.0.1.to', '13:50')   // another formation's take-off
    const q1 = await C.question(p)
    const to1 = await p.evaluate(() => window.DAYS[0].waves[0].formations[1].to)
    await C.fset(p, 'ff:0.0.0.to', '12:45')   // the questioned formation's own take-off
    const q2 = await C.question(p)
    const to2 = await p.evaluate(() => window.DAYS[0].waves[0].formations[0].to)
    pics.push(await C.pic(p, 'p307-' + editor + '-after-edits'))
    await C.side(p, 'red')
    const q3 = await C.question(p)
    const m = await mixNow(p)
    pics.push(await C.pic(p, 'p307-' + editor + '-answered'))
    C.row(`P3-07(${editor}${process.env.HP_PHONE ? ',phone' : ''})`, `${editor}: question opened on VL (ACM, "DS FOR RU"); edited RU's take-off (13:50), then VL's own take-off (12:45); pressed Red`,
      `question after opening ${J(q0.q)} (finger reach: ${reach0}); after RU's take-off edit (now ${to1}) ${J(q1.nQ)} question ${J(q1.q)}; after VL's own take-off edit (now ${to2}) ${J(q2.nQ)} question ${J(q2.q)}; after Red: ${J(q3.nQ)} question left; Insights ${m}`,
      q0.nQ === 1 && q1.nQ === 1 && q2.nQ === 1 && q3.nQ === 0 && /Echo:2b\/1r/.test(m) ? 'PASS' : 'CHECK', pics)
  } catch (e) { C.row(`P3-07(${editor})`, 'aborted', String(e.stack || e).slice(0, 900), 'FAIL', [await C.pic(p, 'p307-' + editor + '-error')]) }
  finally { await browser.close() }
}
const only = (process.env.ONLY || 'p307').split(',')
for (const ed of ['Board', 'Week']) {
  if (only.includes('p306')) await p306(ed)
  if (only.includes('p307')) await p307(ed)
}
C.save('c')
