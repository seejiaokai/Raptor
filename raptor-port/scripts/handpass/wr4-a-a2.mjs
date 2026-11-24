// Walker a — A2: a kind change on a titled input (Training -> Meeting, nothing else touched). Run: node scripts/handpass/wr4-a-a2.mjs [run] [i,ii,iii,iv]
import { setup } from './wr4-a-common.mjs'
console.log('wr4-a-a2 v1')
const RUN = process.argv[2] || 'a2-r1'
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, RANGER, HEX, WED } = L
const CASES = [['i', 'Brief'], ['ii', 'Meeting'], ['iii', 'meeting'], ['iv', 'Training · Safety']]
for (const [k, title] of CASES) {
  if (ONLY.length && !ONLY.includes(k)) continue
  const c = 'A2' + k
  try {
    let w = await newPage('desk'); await signIn(w, 'ad')
    log(c, 'bundle ' + await bundleOf(w.page))
    const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title })
    if (!iid) { A.judge(c, 'fixture filed', false, 'no new input'); await w.ctx.close(); continue }
    log(c, 'before: ' + JSON.stringify(await recOf(w.page, iid)))
    await editInput(w, c, iid, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'Meeting'))
    const after = await recOf(w.page, iid)
    log(c, 'after: ' + JSON.stringify(after))
    A.judge(c, 'saved: kind Meeting, title kept, hours kept', after && after.type === 'Meeting' && after.title === title && after.s === 540 && after.e === 600 ? true : null, after)
    w = await handOver(w, 'phone', 'us')
    const r = await A.bell(w, c, 'ranger-bell')
    const L1 = r.find(l => l.day === 'Wed 15 Jul' && !/You were added/.test(l.what))
    if (k === 'iii') A.judge(c, `phone: title "${title}" — the line Ranger reads (RECORD)`, null, L1 ? `${L1.name} ${L1.day} / ${L1.what}` : A.said(r))
    else {
      A.judge(c, `phone: title "${title}" — "Training changed to Meeting · Saber"`, !!L1 && L1.what === 'Training changed to Meeting · Saber', L1 ? `${L1.name} ${L1.day} / ${L1.what}` : A.said(r))
      A.judge(c, `phone: title "${title}" — bold name "${title}"`, !!L1 && L1.name === title, L1 && L1.name)
      A.judge(c, `phone: title "${title}" — no "renamed"`, !r.some(l => /renamed/i.test(l.what)), A.said(r))
    }
    if (k === 'i') {
      w = await handOver(w, 'desk', 'us')
      const d = await A.bell(w, c, 'ranger-bell')
      A.judge(c, 'desk: Ranger reads "Training changed to Meeting · Saber"', d.some(l => l.what === 'Training changed to Meeting · Saber' && l.name === title), A.said(d))
      w = await handOver(w, 'phone', 'hex')
      const h = await A.bell(w, c, 'hex-bell')
      A.judge(c, 'phone: Hex reads "Training changed to Meeting · Saber"', h.some(l => l.what === 'Training changed to Meeting · Saber' && l.name === title), A.said(h))
    }
    await w.ctx.close()
  } catch (e) { L.facts.errors.push(c + ': ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
}
await A.done(RUN)
