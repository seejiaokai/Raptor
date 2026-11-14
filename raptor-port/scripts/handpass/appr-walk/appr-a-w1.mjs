import * as C from './appr-a-common.mjs'
console.log('[appr-a-w1 v1]')
C.initLog('appr-a-w1-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page
const step = async (label) => { const g = await C.geo(P); const c = await C.counts(P); C.note(`${label}: winRoom ${g.winRoom} scrollTop ${g.sc?.top} cardBottom ${g.card?.bottom} counts ${JSON.stringify(c)}`); return { g, c } }
await C.wheelList(P, 300)
const s0 = await step('after wheel 300')
// choose lines wholly in view
const n = (await C.lineIds(P)).length
const inview = []
for (let i = 0; i < n; i++) { const li = await C.lineInfo(P, i); if (li.inView) inview.push(li) }
C.note('in view: ' + inview.map(l => l.idx + ':' + l.text.slice(0, 22)).join(' | '))
const A = inview[1].idx, R = inview[3].idx
await C.shot(P, 'w1-0-before')
C.check('W1-0', s0.g.winRoom <= 0, `window room ${s0.g.winRoom} after wheel`)
const num = s => +(String(s).match(/\d+/)?.[0] ?? -1)
// Approve line A
await C.nthLine(P, A).locator('[data-testid="appr-approve"]').click(); await C.sleep(500)
const s1 = await step('after Approve on line ' + A); const la1 = await C.lineInfo(P, A)
C.note(JSON.stringify(la1)); await C.shot(P, 'w1-1-approved')
C.check('W1-a', la1.approve === 'Approved' && la1.apPressed === 'true' && Math.abs(la1.top - inview[1].top) <= 1 && Math.abs(s1.g.sc.top - s0.g.sc.top) <= 1, `Approve: line stays (top ${inview[1].top}->${la1.top}), lit "${la1.approve}", scrollTop ${s0.g.sc.top}->${s1.g.sc.top}`)
C.check('W1-a-count', num(s1.c.tab) === num(s0.c.tab) - 1 && num(s1.c.approveAll) === num(s0.c.approveAll) - 1, `counts ${s0.c.tab} / ${s0.c.approveAll} -> ${s1.c.tab} / ${s1.c.approveAll}`)
C.check('W1-a-foot', Math.abs(s1.g.card.bottom - s0.g.card.bottom) <= 1 && s1.g.winRoom <= 0, `card foot ${s0.g.card.bottom}->${s1.g.card.bottom}, winRoom ${s1.g.winRoom}`)
// Refuse line R
await C.nthLine(P, R).locator('[data-testid="appr-refuse"]').click(); await C.sleep(500)
const s2 = await step('after Refuse on line ' + R); const lr2 = await C.lineInfo(P, R)
C.note(JSON.stringify(lr2)); await C.shot(P, 'w1-2-refused')
C.check('W1-r', lr2.refuse === 'Refused' && lr2.rfPressed === 'true' && Math.abs(lr2.top - inview[3].top) <= 1 && Math.abs(s2.g.sc.top - s0.g.sc.top) <= 1, `Refuse: line stays (top ${inview[3].top}->${lr2.top}), lit "${lr2.refuse}", scrollTop ->${s2.g.sc.top}`)
C.check('W1-r-count', num(s2.c.tab) === num(s1.c.tab) - 1 && num(s2.c.approveAll) === num(s1.c.approveAll) - 1, `counts ${s1.c.tab} / ${s1.c.approveAll} -> ${s2.c.tab} / ${s2.c.approveAll}`)
C.check('W1-r-foot', Math.abs(s2.g.card.bottom - s0.g.card.bottom) <= 1 && s2.g.winRoom <= 0, `card foot ${s2.g.card.bottom}, winRoom ${s2.g.winRoom}`)
// press the lit Approved again -> back to pending
await C.nthLine(P, A).locator('[data-testid="appr-approve"]').click(); await C.sleep(500)
const s3 = await step('after pressing lit Approved again'); const la3 = await C.lineInfo(P, A)
C.note(JSON.stringify(la3)); await C.shot(P, 'w1-3-back-to-pending')
C.check('W1-b', la3.approve === 'Approve' && la3.apPressed === 'false' && Math.abs(s3.g.sc.top - s0.g.sc.top) <= 1 && Math.abs(la3.top - inview[1].top) <= 1, `lit Approve pressed again: back to "${la3.approve}", line top ${la3.top}, scrollTop ${s3.g.sc.top}`)
C.check('W1-b-count', num(s3.c.tab) === num(s2.c.tab) + 1 && num(s3.c.approveAll) === num(s2.c.approveAll) + 1, `counts ${s2.c.tab} / ${s2.c.approveAll} -> ${s3.c.tab} / ${s3.c.approveAll}`)
C.check('W1-b-foot', Math.abs(s3.g.card.bottom - s0.g.card.bottom) <= 1 && s3.g.winRoom <= 0, `card foot ${s3.g.card.bottom}, winRoom ${s3.g.winRoom}`)
// also the other lines unchanged in lit state
C.note('errors ' + JSON.stringify(errs)); C.check('W1-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
