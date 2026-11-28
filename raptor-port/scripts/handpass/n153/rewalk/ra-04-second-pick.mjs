// ra-04 - 1536, the keyboard: with "Save them before switching to 149?" up, the focus is still on the squadron button, so Enter opens the
// list again. A second pick from it, then the question answered. ANSWER: Stay, Discard them, Save them.
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, ask, addEvent, arrange, check, hasEv, pickSq, shut } from './rlib.mjs'
import { pickHeld, answerHeld, shot, trackerSaved, layoutDiff } from './ra-lib.mjs'
console.log('ra-04-second-pick v1', process.env.MQ_PORT)
const dir = picsFor('ra-04')
const row = s => s.page.evaluate(() => document.activeElement?.querySelector?.('.sqm-num')?.textContent.trim() ?? null)
for (const ans of ['Stay', 'Discard them', 'Save them']) await step('second pick, ' + ans, async () => {
  const s = await mk('d'); const { page } = s, k = ans[0] + ans.length
  await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await page.waitForTimeout(1800)
  await pickSq(s, '149'); await shut(s); await page.waitForTimeout(1200); await pickSq(s, '142'); await shut(s); await page.waitForTimeout(1200)
  const name = 'RA4' + k
  await addEvent(s, name); await arrange(s, true); await page.waitForTimeout(300)
  const a0 = await trackerSaved(s, '142'), b0 = await trackerSaved(s, '149')
  log(ans, 'first pick', await pickHeld(s, '149'))
  const q1 = await ask(s); check(`${ans}: the question is up`, /switching to 149\?/.test(q1.msg || ''), q1.msg)
  await page.waitForTimeout(250)
  await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  const listOpen = await page.evaluate(() => { const m = document.getElementById('sqnMenu'); return !!m && m.getBoundingClientRect().width > 1 })
  log(ans, 'Enter opened the list over the question', listOpen)
  await shot(s, dir, `${k}-01-list-over-question`)
  for (let i = 0; i < 6 && (await row(s)) !== '149'; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60) }
  log(ans, 'on row', await row(s))
  await page.keyboard.press('Enter'); await page.waitForTimeout(700)
  const t1 = await T(s), q2 = await ask(s)
  check(`${ans}: the second pick moved nothing, the one question still up`, /^142/.test(t1.sq || '') && /switching to 149\?/.test(q2.msg || ''), { sq: t1.sq, q: q2.msg })
  await shot(s, dir, `${k}-02-after-second-pick`)
  log(ans, 'answered by', await answerHeld(s, ans)); await page.waitForTimeout(1200)
  const t2 = await T(s), q3 = await ask(s), a2 = await trackerSaved(s, '142'), b2 = await trackerSaved(s, '149')
  const wantSq = ans === 'Stay' ? '142' : '149'
  check(`${ans}: ends on ${wantSq}, no question left`, new RegExp('^' + wantSq).test(t2.sq || '') && !q3.msg, { sq: t2.sq, q: q3.msg })
  check(`${ans}: 149's saved records unchanged`, layoutDiff(b0, b2).length === 0, layoutDiff(b0, b2))
  if (ans === 'Save them') check(`${ans}: saved on 142`, layoutDiff(a0, a2).length > 0, layoutDiff(a0, a2))
  else check(`${ans}: 142's saved records unchanged`, layoutDiff(a0, a2).length === 0, layoutDiff(a0, a2))
  if (ans === 'Stay') check(`${ans}: the draft still there`, t2.dirty && await hasEv(s, name), { dirty: t2.dirty })
  else check(`${ans}: 149 shows no unsaved mark`, !t2.dirty, { dirty: t2.dirty })
  await pic(s, `${k}-03-settled`)
  await s.ctx.close()
})
finish('ra-04'); await closeAll()
