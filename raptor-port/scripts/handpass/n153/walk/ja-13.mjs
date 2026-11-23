// S13 Save before a pick, S14 Stay / Escape / Discard and a fresh edit. WHO=saber (master admin) or hunter (admin of 142 with Plan of 149).
import { mk, closeAll, finish, as, grant, go, pic, picsFor, note, step, check, T, ask, addEvent, hasEv, hit, pickCourse, pickSq, shut, state, ballIds, sleep } from './ja-lib.mjs'
import { fixture, readBoth, whole142, whole149, waitTrk, openTrk, move, reload } from './ja-fx.mjs'
const SZ = process.env.SZ || 'd', WHO = process.env.WHO || 'saber'
console.log('ja-13 v1', SZ, WHO)
picsFor(`j13-${SZ}-${WHO}`)
const has = async (s, n) => (await ballIds(s)).includes(n) || hasEv(s, n)
try {
  const s = await mk(SZ)
  await step('fixture', async () => { await fixture(s) })
  let user = 'ad', pass = 'a'
  if (WHO === 'hunter') {
    await step('grant Hunter Plan of 149', async () => {
      check('grant landed', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149'); await go(s, 'viewsched')
      await as(s, 'ad2', 'a2'); user = 'ad2'; pass = 'a2'
      await openTrk(s, '142'); await pickCourse(s, 'JA-142')
    })
  } else await step('open', async () => { await openTrk(s, '142'); await pickCourse(s, 'JA-142') })

  await step('S13 save before the pick', async () => {
    check('S13 draft drawn', await addEvent(s, 'JAS13'), 'JAS13'); await sleep(s, 300)
    check('S13 Save changes lit', (await T(s)).dirty, await T(s))
    await pickSq(s, '149', 's13-pick'); await sleep(s, 400)
    const q = await ask(s); check('S13 question names 149', /149/.test(q.msg || '') && q.btns.length === 3, q); await pic(s, '01-s13-ask')
    await hit(s, '#dlgOk', 300); if (!s.desk) await shut(s)
    check('S13 149 usable after Save them', await waitTrk(s, '149'), (await T(s)).sq)
    const t = await T(s); check('S13 no draft mark on 149', !t.dirty, t.saveStat)
    await pickCourse(s, 'JA-149')
    check('S13 event NOT in 149', !(await has(s, 'JAS13')), (await T(s)).course.now); await pic(s, '02-s13-149')
    await move(s, '142'); await pickCourse(s, 'JA-142')
    check('S13 event in JA-142', await has(s, 'JAS13'), (await T(s)).course.now); await pic(s, '03-s13-142')
    await pickCourse(s, 'JA-142B')
    check('S13 event in JA-142B too (shared chart)', await has(s, 'JAS13'), (await T(s)).course.now)
    await pickCourse(s, 'JA-142')
    await reload(s, user, pass); await openTrk(s); await pickCourse(s, 'JA-142')
    check('S13 event in JA-142 after reload', await has(s, 'JAS13'), (await T(s)).sq)
    await pickCourse(s, 'JA-142B'); check('S13 event in JA-142B after reload', await has(s, 'JAS13'), (await T(s)).course.now)
    await move(s, '149'); await pickCourse(s, 'JA-149'); check('S13 still not in 149 after reload', !(await has(s, 'JAS13')), (await T(s)).sq)
    const b = await readBoth(s); check('S13 both squadrons whole', whole142(b['142']) && whole149(b['149']), b)
  })

  await step('S14 Stay', async () => {
    await pickCourse(s, 'JA-142')
    check('S14 draft drawn', await addEvent(s, 'JAS14A'), 'JAS14A'); await sleep(s, 300)
    await pickSq(s, '149', 's14-pick1'); await sleep(s, 300)
    const q = await ask(s); check('S14 asks on pick', /149/.test(q.msg || ''), q)
    await hit(s, '#dlgCancel', 500); if (!s.desk) await shut(s)
    const t = await T(s); check('S14 Stay keeps 142 and the draft', t.sq.startsWith('142') && t.dirty && await has(s, 'JAS14A'), t); await pic(s, '04-s14-stay')
  })
  await step('S14 Escape', async () => {
    await pickSq(s, '149', 's14-pick2'); await sleep(s, 300)
    const q = await ask(s); check('S14 asks again', /149/.test(q.msg || ''), q)
    await s.page.keyboard.press('Escape'); await sleep(s, 500); if (!s.desk) await shut(s)
    const t = await T(s); check('S14 Escape keeps 142 and the draft', t.sq.startsWith('142') && t.dirty && await has(s, 'JAS14A') && !(await ask(s)).msg, t); await pic(s, '05-s14-escape')
  })
  await step('S14 Discard, fresh edit', async () => {
    await pickSq(s, '149', 's14-pick3'); await sleep(s, 300)
    await hit(s, '#dlgAlt', 300); if (!s.desk) await shut(s)
    check('S14 Discard moves to 149', await waitTrk(s, '149'), (await T(s)).sq)
    check('S14 discarded edit not on 149', !(await has(s, 'JAS14A')) && !(await T(s)).dirty, (await T(s)).saveStat)
    await move(s, '142'); await pickCourse(s, 'JA-142')
    const t = await T(s); check('S14 draft gone from 142, no unsaved sign', !(await has(s, 'JAS14A')) && !t.dirty, t.saveStat); await pic(s, '06-s14-after-discard')
    check('S14 saved event still there', await has(s, 'JAS13'), 'JAS13')
    check('S14 fresh draft drawn', await addEvent(s, 'JAS14B'), 'JAS14B'); await sleep(s, 300)
    await hit(s, '#saveChanges', 700)
    const t2 = await T(s); check('S14 fresh save done', !t2.dirty && await has(s, 'JAS14B') && !(await has(s, 'JAS14A')), t2.saveStat)
    await reload(s, user, pass); await openTrk(s); await pickCourse(s, 'JA-142')
    check('S14 after reload: fresh edit kept, discarded edit gone', await has(s, 'JAS14B') && !(await has(s, 'JAS14A')), (await T(s)).saveStat); await pic(s, '07-s14-reloaded')
    await pickCourse(s, 'JA-142B'); check('S14 shared course has the fresh edit only', await has(s, 'JAS14B') && !(await has(s, 'JAS14A')), 'JA-142B')
    const b = await readBoth(s); check('S14 both squadrons whole', whole142(b['142']) && whole149(b['149']), b)
    await move(s, '149'); await pickCourse(s, 'JA-149'); check('S14 149 never got either event', !(await has(s, 'JAS14A')) && !(await has(s, 'JAS14B')), 'JA-149')
  })
  await s.ctx.close()
} finally { finish(`j13-${SZ}-${WHO}`); await closeAll() }
