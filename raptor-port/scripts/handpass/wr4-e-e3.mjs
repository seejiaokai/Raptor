// Walker e — E3: the rename (kind AND title changed in one save) read by Ranger on the phone, its control on the build
// before the fix, and the earlier walks' cases again on the fixed build — each in its own world. Copied from walker d's
// wr4-d-d2.mjs and walker a's wr4-a-a34.mjs (the Attach's "To").  Run: node scripts/handpass/wr4-e-e3.mjs [keys,...]
console.log('wr4-e-e3 v1')
const E = await (await import('./wr4-e-common.mjs')).setup('e3')
const { newPage, signIn, handOver, fileInput, editInput, recOf, bundleOf, log, press, openBell, bellFit, bellClip, shot, judge, save, finish, B, RANGER, HEX } = E
const TR = title => ({ type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', ...(title != null ? { title } : {}) })
const kind = (w, k) => w.page.selectOption('#inpEditPop #inpEditType', k)
const title = (w, t) => w.page.fill('#inpEditPop #inpEditOwnTitle', t)
const WED = '2026-07-15'
// [key, build, filed on, spec, edit, the day the line names, expected words (null = RECORD), bold name, filed by Ranger with own edit]
const CASES = [
  ['combo', 'fixed', WED, TR('Training · briefing'), async w => { await kind(w, 'Meeting'); await title(w, 'Meeting · briefing') }, 'Wed 15 Jul', 'Training changed to Meeting, renamed — was Training · briefing · Saber'],
  ['combo-before', 'before', WED, TR('Training · briefing'), async w => { await kind(w, 'Meeting'); await title(w, 'Meeting · briefing') }, 'Wed 15 Jul', null],
  ['meeting', 'fixed', WED, TR('meeting'), w => kind(w, 'Meeting'), 'Wed 15 Jul', 'Training changed to Meeting · Saber'],
  ['safety', 'fixed', WED, TR('Training · Safety'), w => kind(w, 'Meeting'), 'Wed 15 Jul', 'Training changed to Meeting · Saber'],
  ['brief', 'fixed', WED, TR('Brief'), w => kind(w, 'Meeting'), 'Wed 15 Jul', 'Training changed to Meeting · Saber', 'Brief'],
  ['rangeLL', 'fixed', WED, TR('Range brief'), w => kind(w, 'LL'), 'Wed 15 Jul', 'Training changed to LL, renamed — was Range brief · Saber'],
  ['give', 'fixed', WED, TR(null), w => title(w, 'Range brief'), 'Wed 15 Jul', 'Renamed — was Training · Saber'],
  ['attachTo', 'fixed', WED, { type: 'Attach', title: 'Exercise Kite' }, w => w.page.fill('#inpEditPop #inpEditTo', '146 Sqn'), 'Wed 15 Jul', 'Renamed — was Exercise Kite · 145 Sqn · Saber', null, w => w.page.fill('#inpEditPop #inpEditTo', '145 Sqn')],
  ['LLOL', 'fixed', WED, { type: 'LL', people: [RANGER], span: 'all' }, w => kind(w, 'OL'), 'Wed 15 Jul', 'LL changed to OL · Saber'],
  ['LLAM', 'fixed', WED, { type: 'LL', people: [RANGER], span: 'all' }, w => press(w, '#inpEditSpan [data-span="am"]'), 'Wed 15 Jul', 'Now LL (AM) · Saber'],
  ['three', 'fixed', WED, { ...TR('Training'), remarks: 'Bring your kit' }, async w => { await press(w, '#inpEdCal [data-iso="2026-07-16"]'); await title(w, 'Range brief'); await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water') }, 'Thu 16 Jul', 'Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber'],
]
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
for (const [k, build, iso, spec, edit, day, want, bold, own] of CASES) {
  if (ONLY.length && !ONLY.includes(k)) continue
  const c = 'E3-' + k, dir = B[build]
  try {
    let w = await newPage('desk', undefined, dir)
    let iid
    if (own) { await signIn(w, 'us'); iid = await fileInput(w, c, iso, spec); if (iid) await editInput(w, c, iid, iso, () => own(w)); w = await handOver(w, 'desk', 'ad', dir) }
    else { await signIn(w, 'ad'); iid = await fileInput(w, c, iso, spec) }
    log(c, `build ${dir} bundle ${await bundleOf(w.page)}`)
    if (!iid) { judge(c, k, 'NOT WALKED', 'not filed', want); await w.ctx.close(); continue }
    const b = await recOf(w.page, iid); await editInput(w, c, iid, iso, () => edit(w)); const a = await recOf(w.page, iid)
    log(c, `saved before ${JSON.stringify(b)} after ${JSON.stringify(a)}`)
    w = await handOver(w, 'phone', 'us', dir)
    log(c, 'phone bundle ' + await bundleOf(w.page))
    const lines = await openBell(w)
    const said = lines.map(l => `${l.name} ${l.day} / ${l.what}`)
    await shot(w.page, c, `e3-${k}-ranger-bell-phone`, await bellClip(w.page), said, w.size, { fit: await bellFit(w.page) })
    const ls = lines.filter(l => l.day === day && !/You were added/.test(l.what))
    const got = { lines: ls.map(l => `${l.name} ${l.day} / ${l.what}`), all: said, before: b, after: a }
    if (!want) judge(c, k, 'RECORD', got, '', `e3-${k}-ranger-bell-phone.png`)
    else {
      const ok = ls.some(l => l.what === want) && (!bold || ls.some(l => l.name === bold)) && (/renamed/i.test(want) || !ls.some(l => /renamed/i.test(l.what)))
      judge(c, k, ok ? 'PASS' : 'FAIL', got, want + (bold ? ` (bold "${bold}")` : ''), `e3-${k}-ranger-bell-phone.png`)
    }
    await w.ctx.close()
  } catch (e) { console.log('ERR', k, e.message.split('\n')[0]); E.facts.errors.push(k + ' ' + e.stack) }
  save()
}
save(); await finish()
console.log('errors:', E.facts.errors.length, E.facts.errors.slice(0, 5).map(s => s.slice(0, 300)))
