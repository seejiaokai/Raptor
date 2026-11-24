// THE WALK OF ROUND 4 OF THE WORDS PASS — the host's own short run, before the walkers start (walk-scripts.md §1): the
// shared helpers proved on the frozen build, and the four bell cases read as the app prints them.
//   h1  an LL changed to OL            h2  a whole-day LL made the morning half        h3  moved, renamed, remark changed
//   h4  the same three made on the build of MAIN (the old words, the old saved shape), then read on the new build
// Run from raptor-port:  WR4_NEW=<frozen build> WR4_OLD=<main's build> node scripts/handpass/wr4-host.mjs [h1,h4]
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-host v2')
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/host')
const L = await import('./wr4-lib.mjs')
const { newPage, signIn, handOver, fileInput, editInput, openBell, bellFit, bellClip, shot, log, facts, press, recOf, bundleOf, RANGER, HEX, WED, THU, NEW_DIR, OLD_DIR } = L
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const run = c => !ONLY.length || ONLY.includes(c)
const said = lines => lines.map(l => `${l.name} ${l.day} / ${l.what}`)
const stored = page => page.evaluate(r => window.NOTICES.filter(n => n.to === r).map(n => ({ name: n.name, day: n.day, what: n.what })), RANGER)

/* the three changes, each through the input's own window, on the build `dir`; returns the world after Saber's saves */
async function ll(c, dir, edit) {
  let w = await newPage('desk', undefined, dir); await signIn(w, 'us')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const iid = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  if (!iid) throw new Error('Ranger could not file his LL')
  w = await handOver(w, 'desk', 'ad', dir)
  await editInput(w, c, iid, WED, () => edit(w))
  log(c, 'after Saber\'s save: ' + JSON.stringify(await recOf(w.page, iid)))
  return w
}
const toOL = w => w.page.selectOption('#inpEditPop #inpEditType', 'OL')
const toAM = w => press(w, '#inpEditSpan [data-span="am"]')
async function three(c, dir) {
  let w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
  log(c, 'bundle: ' + await bundleOf(w.page))
  const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  if (!iid) throw new Error('Saber could not file the group input')
  await editInput(w, c, iid, WED, async () => {
    await press(w, `#inpEdCal [data-iso="${THU}"]`)
    await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
    await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
  })
  log(c, 'after the one save: ' + JSON.stringify(await recOf(w.page, iid)))
  return w
}
/* Ranger's bell on his phone, on the NEW build: the lines as printed, how each fits, the picture */
async function read(c, w, want) {
  w = await handOver(w, 'phone', 'us', NEW_DIR)
  log(c, 'read on bundle: ' + await bundleOf(w.page))
  log(c, 'notices to Ranger in store: ' + JSON.stringify(await stored(w.page)))
  const lines = await openBell(w)
  const fit = await bellFit(w.page)
  log(c, 'Ranger\'s bell: ' + JSON.stringify(said(lines)))
  log(c, 'fit: ' + JSON.stringify(fit.map(f => f && `${f.lines} line(s), box ${f.boxWidth}px`)))
  await shot(w.page, c, `${c}-phone-bell`, await bellClip(w.page), said(lines), w.size, { fit })
  for (const [re, label] of want) log(c, `${lines.some(l => re.test(l.what)) ? 'PASS' : 'FAIL'} ${label} — read: ${JSON.stringify(lines.map(l => l.what))}`)
  await w.ctx.close()
}

const CASES = {
  h1: async c => read(c, await ll(c, NEW_DIR, toOL), [[/^LL changed to OL · Saber$/, 'D2521 Q1 "LL changed to OL · Saber"']]),
  h2: async c => read(c, await ll(c, NEW_DIR, toAM), [[/^Now LL \(AM\) · Saber$/, 'D2521 Q2 "Now LL (AM) · Saber"']]),
  h3: async c => read(c, await three(c, NEW_DIR), [[/^Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber$/, 'D2521 Q3 the ruled line']]),
  h4: async c => {
    if (!OLD_DIR) { log(c, 'NOT WALKED: no WR4_OLD build given'); return }
    await read(c + 'a', await ll(c + 'a', OLD_DIR, toOL), [[/^Renamed — was LL · Saber$/, 'an old line (kind) reads as it did, facts q1 today']])
    await read(c + 'b', await ll(c + 'b', OLD_DIR, toAM), [[/^Now 00:00–12:00 am · Saber$/, 'an old line (half) reads as it did, facts q2 today']])
    await read(c + 'c', await three(c + 'c', OLD_DIR), [[/^Now Thu 16 Jul, /, 'RECORD: an old three-part line on the new build']])
  },
}
for (const [k, f] of Object.entries(CASES)) {
  if (!run(k)) continue
  try { await f(k) } catch (e) { facts.errors.push(`${k}: ` + String(e && e.stack || e).slice(0, 600)); log(k, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
}
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 30)) console.log('  ' + e)
await L.finish()
