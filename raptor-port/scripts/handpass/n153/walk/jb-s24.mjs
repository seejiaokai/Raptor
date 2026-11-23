// jb-s24 v1 - S24: the member view with a clean chart and with a Tracker draft, on 149's Tracker; Undo, Redo and a pick of 142
// while held; Stay, Discard, Save. WHO=hunter (Plan of 149) or WHO=saber (master admin).
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, addEvent, hasEv, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, roleSwitch, head, holdWords, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const WHO = process.env.WHO || 'hunter'
const U = WHO === 'hunter' ? ['ad2', 'a2'] : ['ad', 'a']
const tag = `s24-${WHO}-${SZ}`
console.log('jb-s24 v1', SZ, WHO)
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1100) }
async function build() {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  if (WHO === 'hunter') check('grant', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  if (WHO === 'hunter') { await logout(s); await signIn(s, 'ad2', 'a2') }
  await to(s, '149'); await onSeed(s)
  return s
}
const member = async s => { const st = await state(s); return /member/i.test(st.role || '') ? 'admin-view' : 'member-view' }
try {
  await step('clean there and back', async () => {
    const s = await build()
    const a = await fp(s); note('149 clean', short(a))
    await roleSwitch(s, 'a1-mv'); let q = await ask(s)
    check('clean: switch asks nothing', !q.msg, q.msg)
    const st = await state(s); note('member', st.badge, st.page, await head(s, 200)); facts.cleanHold = await holdWords(s); note('words', JSON.stringify(facts.cleanHold)); await pic(s, 'a1-member')
    await roleSwitch(s, 'a2-back'); q = await ask(s)
    const b = await onSeed(s); check('clean: back on 149 with its marks', b.sq === '149' && b.done === 1, short(b)); await pic(s, 'a2-back')
    await s.ctx.close()
  })
  for (const ans of ['Stay', 'Discard', 'Save']) await step('draft, held, ' + ans, async () => {
    const s = await build(); const { page } = s
    const name = 'JB-S24' + ans[0]
    check('draft on 149', await addEvent(s, name), name)
    await roleSwitch(s, `${ans}-1`)
    let q = await ask(s); check(`${ans}: member switch asks nothing`, !q.msg, q.msg)
    const words = await holdWords(s); note('held words', JSON.stringify(words)); await pic(s, `${ans}-1-held`)
    const badge = (await state(s)).badge
    note('badge', badge, 'head', await head(s, 220))
    // Undo and Redo while held
    const ub = page.locator('#trUndoBtn').filter({ visible: true })
    if (await ub.count()) {
      const dis = await ub.first().isDisabled(); note('Undo while held disabled:', dis, await ub.first().getAttribute('title'))
      if (!dis) { await press(s, '#trUndoBtn', `${ans}-undo`); await wait(s, 300); note('after Undo while held', await head(s, 120)) }
    } else note('Undo not drawn while held')
    await pic(s, `${ans}-2-after-undo`)
    // a pick of 142 while held
    await pickSq(s, '142', `${ans}-pick`); await wait(s, 500)
    q = await ask(s); const st2 = await state(s); note('pick asked', JSON.stringify(q.msg), st2.barMark, st2.drawerOpen); await pic(s, `${ans}-3-pick`)
    check(`${ans}: the pick asks`, /Save them before switching to 142/.test(q.msg || ''), q.msg)
    let inMember = true
    if (!q.msg) {
      // the question is open inside the hidden Tracker: leave the member view, where it comes up, and answer it there
      await shut(s); await roleSwitch(s, `${ans}-leave`); await wait(s, 600); inMember = false
      q = await ask(s); const st3 = await state(s)
      note('after leaving the member view, on', st3.page, st3.barMark, 'it reads', JSON.stringify(q.msg)); await pic(s, `${ans}-3b-question-comes-up`)
      if (!q.msg) { await s.ctx.close(); return }
    }
    const sel = ans === 'Stay' ? '#dlgCancel' : ans === 'Discard' ? '#dlgAlt' : '#dlgOk'
    await press(s, sel, `${ans}-ans`); await wait(s, 1500); await shut(s)
    const after = await state(s); note('after answer', after.barMark, after.badge, after.page); await pic(s, `${ans}-4-after`)
    if (ans === 'Stay') {
      check('Stay: still 149', (after.barMark || '').startsWith('149'), after.barMark)
      if (inMember) { await roleSwitch(s, 'stay-back'); await wait(s, 500) }
      await go(s, 'tracker'); await wait(s, 900)
      const f = await fp(s); check('Stay: back in admin view, draft still there', f.sq === '149' && f.dirty && await hasEv(s, name), short(f)); await pic(s, 'Stay-5-back')
      await press(s, '#saveChanges', 'stay-save'); await wait(s, 900)
      const g = await onSeed(s); check('Stay: saved on 149', !g.dirty && await hasEv(s, name), short(g))
      await to(s, '142'); const h = await onSeed(s); check('Stay: 142 has no 149 event', !(await hasEv(s, name)) && h.done === 2, short(h)); await pic(s, 'Stay-6-142')
    } else {
      check(`${ans}: moved to 142`, (after.barMark || '').startsWith('142'), after.barMark)
      await wait(s, 300)
      note('in member view on 142?', after.badge, 'head', await head(s, 200))
      if (inMember) { await roleSwitch(s, `${ans}-back`); await wait(s, 400) }
      const f = await onSeed(s); check(`${ans}: 142 has its own marks, no 149 event`, f.sq === '142' && f.done === 2 && !(await hasEv(s, name)), short(f)); await pic(s, `${ans}-5-142`)
      await to(s, '149'); const g = await onSeed(s)
      if (ans === 'Discard') check('Discard: 149 has no draft', !(await hasEv(s, name)) && g.done === 1 && !g.dirty, short(g))
      else check('Save: 149 kept the saved event', (await hasEv(s, name)) && g.done === 1 && !g.dirty, short(g))
      await pic(s, `${ans}-6-149`)
      await reload(s, U[0], U[1]); await to(s, '149'); const r = await onSeed(s)
      check(`${ans}: after reload 149 agrees`, ans === 'Save' ? await hasEv(s, name) : !(await hasEv(s, name)), short(r))
    }
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
