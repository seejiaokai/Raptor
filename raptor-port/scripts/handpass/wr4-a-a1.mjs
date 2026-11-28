// Walker a — A1: a kind change on an input with no title (D2521 Q1). Run: node scripts/handpass/wr4-a-a1.mjs [run-name]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a1 v2 (Hex signs in as hex)')
const RUN = process.argv[2] || 'a1-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, RANGER, HEX, WED } = L
const FRI = '2026-07-17'
const c = 'A1'
try {
  let w = await newPage('desk'); await signIn(w, 'us')
  log(c, 'bundle ' + await bundleOf(w.page))
  const own = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  if (!own) throw new Error('Ranger could not file his LL')
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, own, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
  log(c, 'own after: ' + JSON.stringify(await recOf(w.page, own)))
  // Saber files an LL for Ranger and Hex, then changes it to OL
  const grp = await fileInput(w, c, FRI, { type: 'LL', people: [RANGER, HEX], span: 'all' })
  if (!grp) A.judge(c, 'group LL filed', false, 'no new input')
  else {
    log(c, 'group before: ' + JSON.stringify(await recOf(w.page, grp)))
    await editInput(w, c, grp, FRI, () => w.page.selectOption('#inpEditPop #inpEditType', 'OL'))
    log(c, 'group after: ' + JSON.stringify(await recOf(w.page, grp)))
  }
  const saber = await A.bell(w, c, 'saber-bell')
  A.judge(c, 'Saber\'s own bell holds no "changed to" line (D769)', !saber.some(l => / changed to /.test(l.what)), A.said(saber))
  // Ranger on the phone, then on the desktop
  w = await handOver(w, 'phone', 'us')
  let r = await A.bell(w, c, 'ranger-bell')
  const ok1 = l => l.what === 'LL changed to OL · Saber'
  A.judge(c, 'phone: Ranger reads bold "OL Wed 15 Jul" / "LL changed to OL · Saber"', r.some(l => ok1(l) && l.name === 'OL' && l.day === 'Wed 15 Jul'), A.said(r))
  A.judge(c, 'phone: Ranger reads the group input "OL Fri 17 Jul" / "LL changed to OL · Saber"', r.some(l => ok1(l) && l.day === 'Fri 17 Jul'), A.said(r))
  w = await handOver(w, 'desk', 'us')
  r = await A.bell(w, c, 'ranger-bell')
  A.judge(c, 'desk: Ranger reads both "LL changed to OL · Saber" lines', r.filter(ok1).length === 2, A.said(r))
  w = await handOver(w, 'phone', 'hex')
  const h = await A.bell(w, c, 'hex-bell')
  A.judge(c, 'phone: Hex reads "OL Fri 17 Jul" / "LL changed to OL · Saber"', h.some(l => ok1(l) && l.day === 'Fri 17 Jul'), A.said(h))
  await w.ctx.close()
} catch (e) { L.facts.errors.push('A1: ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
await A.done(RUN)
