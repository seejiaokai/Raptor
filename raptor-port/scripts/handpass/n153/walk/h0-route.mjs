// h0 - the check lead's own short walk of the routes every scenario starts from (walk-scripts §1): Saber gives Hunter
// Plan of 149; Hunter's Tracker on 142 with an unsaved test event; a pick of 149 asks; Discard; 149's Tracker shows; back.
import { signIn, newPage, closeAll, finish, as, step, rec, pic, picsFor, press, grant, go, addEvent, hasEv, ask, trkHead, pickSq, shut, state, note, facts, check } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('h0-route v1', SZ)
picsFor('h0-' + SZ)
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { check('grant landed', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('tracker on 142 with a draft', async () => {
    check('event drawn', await addEvent(s, 'H0-TEST'), 'H0-TEST')
    await pic(s, '01-draft-142')
    facts.head142 = await trkHead(s); note(facts.head142)
  })
  await step('pick 149 asks', async () => {
    await pickSq(s, '149', 'h0-pick'); await page.waitForTimeout(400)
    const a = await ask(s); check('question drawn', /Save them before switching to 149/.test(a.msg || ''), a); await pic(s, '02-ask')
    await press(s, '#dlgAlt', 'h0-discard'); await page.waitForTimeout(1200); await shut(s)
    const st = await state(s); check('149 in view', (st.barMark || '').startsWith('149') || /149/.test(st.dMark || ''), st.barMark)
    await pic(s, '03-149-tracker')
    facts.head149 = await trkHead(s); note(facts.head149)
    check('draft not on 149', !(await hasEv(s, 'H0-TEST')), 'H0-TEST absent')
  })
  await step('back to 142', async () => {
    await pickSq(s, '142'); await page.waitForTimeout(1200); await shut(s)
    await pic(s, '04-142-tracker')
    check('discarded draft gone on 142', !(await hasEv(s, 'H0-TEST')), 'H0-TEST absent')
    await rec(s, 'back')
  })
  await s.ctx.close()
} finally { finish('h0-' + SZ); await closeAll() }
