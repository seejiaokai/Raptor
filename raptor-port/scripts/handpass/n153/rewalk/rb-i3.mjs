// rb-i3 v1 - item 3: the question in the member view, over a held chart draft on 149. SZ=d|p|pc WHO=hunter|saber
import { finish, closeAll, picsFor, step, hasEv, go } from './rlib.mjs'
import { hunterOn149, heldDraft, Q, answerable, shortQ, where, savedBoth, savedDiff, answerQ, SAVE, DISCARD, STAY, roleSwitch, wait, note, check, pic, pickSq, shut } from './rb-lib.mjs'
const SZ = process.env.SZ || 'd', WHO = process.env.WHO || 'hunter'
const tag = `rb-i3-${WHO}-${SZ}`
console.log('rb-i3 v1', SZ, WHO, process.env.MQ_PORT)
picsFor(tag)
const pick = async (s, n, name) => { await pickSq(s, n, name); await wait(s, 700) }
const askWords = /Save them before switching to 142\?/
try {
  await step('the question, Save refused, then later picks', async () => {
    const s = await hunterOn149(SZ, WHO)
    await heldDraft(s, 'RB3A')
    const w0 = await where(s); note('held', JSON.stringify(w0)); await pic(s, '01-held-member-view')
    const saved0 = await savedBoth(s)

    await pick(s, '142', '02-pick')
    let q = await Q(s); note('at the pick', JSON.stringify(shortQ(q))); await pic(s, '02-question')
    check('the pick asks, in the words', askWords.test(q.msg || ''), q.msg)
    check('the question is seen and every button is first at its middle', answerable(q), shortQ(q))
    check('he has not moved while asked', (await where(s)).sq.startsWith('149'), (await where(s)).sq)

    await answerQ(s, SAVE, '03-save')
    q = await Q(s); note('after Save them', JSON.stringify(shortQ(q)))
    check('Save them shows "This change could not be saved."', /This change could not be saved\./.test(q.msg || ''), q.msg)
    check('the refusal is seen and answerable', answerable(q), shortQ(q))
    check('nothing written by the refused Save', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))

    const close = q.btns[0]?.id ? '#' + q.btns[0].id : SAVE
    await answerQ(s, close, '04-dismiss')
    q = await Q(s); let w = await where(s); note('after dismissing', JSON.stringify(shortQ(q)), JSON.stringify(w))
    check('the refusal can be dismissed', !q.up, shortQ(q))
    check('he stayed on 149 with the draft', w.sq.startsWith('149') && !w.signedOut, w)

    await pick(s, '142', '05-pick2')
    q = await Q(s); note('second pick', JSON.stringify(shortQ(q))); await pic(s, '05-asked-again')
    check('a later pick is not jammed: it asks again', askWords.test(q.msg || '') && answerable(q), shortQ(q))
    await answerQ(s, STAY, '06-stay')
    q = await Q(s); w = await where(s); note('after Stay', JSON.stringify(w))
    check('Stay: the question gone, still on 149', !q.up && w.sq.startsWith('149'), { q: shortQ(q), w })

    await pick(s, '142', '07-pick3')
    q = await Q(s); note('third pick', JSON.stringify(shortQ(q))); await pic(s, '07-asked-third')
    check('after Stay a pick asks again', askWords.test(q.msg || '') && answerable(q), shortQ(q))
    await answerQ(s, DISCARD, '08-discard')
    await shut(s); await wait(s, 700)
    q = await Q(s); w = await where(s); note('after Discard', JSON.stringify(w)); await pic(s, '08-on-142')
    check('Discard: he lands on 142', !q.up && w.sq.startsWith('142'), { q: shortQ(q), w })
    check('nothing written by the Discard', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))

    await pick(s, '149', '09-pick149'); await shut(s); await wait(s, 500)
    q = await Q(s); w = await where(s); note('a pick of 149 after', JSON.stringify(shortQ(q)), JSON.stringify(w))
    check('the next pick works with no question', !q.up && w.sq.startsWith('149'), { q: shortQ(q), w })
    await roleSwitch(s, '10-back'); await wait(s, 600)
    await go(s, 'tracker'); await shut(s); await wait(s, 1300)
    const gone = !(await hasEv(s, 'RB3A')); w = await where(s); await pic(s, '10-149-tracker-after-discard')
    check('back in the admin view, 149 has no RB3A', gone && w.sq.startsWith('149'), { gone, w })
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
