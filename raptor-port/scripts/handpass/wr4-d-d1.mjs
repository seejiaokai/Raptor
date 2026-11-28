// Walker d — D1: a Training titled "meeting" changed to a Meeting, nothing else touched; run on the build before the fix
// and on the fixed build. Run: node scripts/handpass/wr4-d-d1.mjs [run]
import { setup, B } from './wr4-d-common.mjs'
console.log('wr4-d-d1 v1')
const RUN = process.argv[2] || 'd1-r1'
const { L, A } = await setup(RUN)
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, RANGER, HEX, WED } = L
const WANT = 'Training changed to Meeting · Saber'
for (const [tag, dir] of [['before', B.before], ['fixed', B.fixed]]) {
  const c = 'D1-' + tag
  try {
    let w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
    log(c, `build ${dir} bundle ` + await bundleOf(w.page))
    const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'meeting' })
    if (!iid) { A.judge(c, 'fixture filed', false, 'no new input'); await w.ctx.close(); continue }
    log(c, 'before: ' + JSON.stringify(await recOf(w.page, iid)))
    await editInput(w, c, iid, WED, () => w.page.selectOption('#inpEditPop #inpEditType', 'Meeting'))
    const after = await recOf(w.page, iid)
    A.judge(c, 'saved: kind Meeting, title "meeting" kept, 09:00-10:00 kept', after && after.type === 'Meeting' && after.title === 'meeting' && after.s === 540 && after.e === 600, after)
    for (const size of ['phone', 'desk']) {
      w = await handOver(w, size, 'us', dir)
      log(c, `${size} bundle ` + await bundleOf(w.page))
      const r = await A.bell(w, c, 'ranger-bell')
      const l = r.find(x => x.day === 'Wed 15 Jul' && !/You were added/.test(x.what))
      const got = l ? `${l.name} ${l.day} / ${l.what}` : A.said(r)
      if (tag === 'before') A.judge(c, `${size}: the old words "Training changed to Meeting, renamed — was meeting · Saber"`, !!l && l.what === 'Training changed to Meeting, renamed — was meeting · Saber', got)
      else {
        A.judge(c, `${size}: "${WANT}"`, !!l && l.what === WANT, got)
        A.judge(c, `${size}: no "renamed" in any line`, !r.some(x => /renamed/i.test(x.what)), A.said(r))
        A.judge(c, `${size}: bold name "Meeting"`, !!l && l.name === 'Meeting', l && l.name)
      }
    }
    await w.ctx.close()
  } catch (e) { L.facts.errors.push(c + ': ' + String(e && e.stack || e).slice(0, 500)); log(c, 'ERROR ' + String(e.message || e)) }
}
await A.done(RUN)
