// W1 part b — scenario 3 (desktop 1536x864): both orders on one bid, in the one-day window AND in the day's list.
// Never two lit; the two windows agree after each tap. Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-b3.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
L.clearPrefix('s3-')
console.log('lw-m3b-w1-b3 desktop 1536x864 out', L.OUT)
const w = await M.start('desk')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const GREY_A = b => b.pressed !== 'true' && b.text === 'Approve' && b.bg === 'rgb(26, 31, 38)'
const GREY_R = b => b.pressed !== 'true' && b.text === 'Refuse' && b.bg === 'rgb(26, 31, 38)'
const LIT_A = b => b.pressed === 'true' && b.text === 'Approved' && b.bg === 'rgb(87, 201, 122)'
const LIT_R = b => b.pressed === 'true' && b.text === 'Refused' && b.bg === 'rgb(240, 85, 95)'
const stateOfBox = s => /\|s-a\|/.test(s) ? 'approved' : /\|s-r\|/.test(s) ? 'refused' : /\|s-w\|/.test(s) ? 'pending' : '?'
const fitsWin = (a, r, want) => want === 'approved' ? LIT_A(a) && GREY_R(r) : want === 'refused' ? LIT_R(r) && GREY_A(a) : GREY_A(a) && GREY_R(r)
const lines = []
const say = s => { lines.push(s); console.log('   ' + s) }
const bad = []
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const stillOpen = sel => L.vis(P, sel)

/* one-day window reading on a whole-day bid */
async function oneDay(label, iso, want, pic, boxIdx = 0) {
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('bid-picker')); await P.waitForTimeout(350)
  const [a, r] = await M.btnState(P, ['decide-approve', 'decide-refuse'])
  const cell = await M.cellWords(P, 'bane', iso)
  const litCount = [a, r].filter(b => b.pressed === 'true').length
  judge(fitsWin(a, r, want) && stateOfBox(cell.boxes[boxIdx]) === want && litCount <= 1, `${label}: one-day window ${a.text}(${a.pressed}, ${a.bg}) / ${r.text}(${r.pressed}, ${r.bg}), lit ${litCount}; cell ${stateOfBox(cell.boxes[boxIdx])}; wanted ${want}`)
  if (pic) await M.winPic(w, pic, { above: 0 })
}
/* the day's list: entries found by their own half-day label, their cell boxes by top / bot */
const entriesJs = () => [...document.querySelectorAll('[data-testid^="dl-approve-"]')].map(b => {
  let c = b.parentElement
  while (c && !/Morning|Afternoon|Whole day/.test(c.innerText || '')) c = c.parentElement
  const t = (c?.innerText || '').replace(/\s+/g, ' ')
  return { id: b.dataset.testid.replace('dl-approve-', ''), half: (t.match(/Morning|Afternoon|Whole day/) || [''])[0], head: t.slice(0, 40) }
})
async function dayList(label, iso, wants, pic) {
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('daylist'), { timeout: 5000 }); await P.waitForTimeout(350)
  const ents = await P.evaluate(entriesJs)
  const cell = await M.cellWords(P, 'bane', iso)
  const boxOf = half => cell.boxes.find(b => b.endsWith(half === 'Morning' ? 'top' : half === 'Afternoon' ? 'bot' : 'whole')) || ''
  for (const e of ents) {
    const [a, r] = await M.btnState(P, [`dl-approve-${e.id}`, `dl-refuse-${e.id}`])
    const litCount = [a, r].filter(b => b.pressed === 'true').length
    const want = wants[e.half]
    judge(fitsWin(a, r, want) && litCount <= 1 && stateOfBox(boxOf(e.half)) === want, `${label}: day's list, ${e.half} entry: ${a.text} (aria-pressed ${a.pressed}, ${a.bg}) / ${r.text} (aria-pressed ${r.pressed}, ${r.bg}), lit ${litCount}; its cell box ${stateOfBox(boxOf(e.half))}; wanted ${want}`)
  }
  if (ents.length !== Object.keys(wants).length) judge(false, `${label}: the list holds ${ents.length} entries (${ents.map(e => e.half)}), wanted ${Object.keys(wants).length}`)
  if (pic) await M.winPic(w, pic, { sel: T('daylist'), above: 0 })
}
async function tapIn(iso, half, kind, name) {
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('daylist'))
  const id = (await P.evaluate(entriesJs)).find(e => e.half === half)?.id
  if (!id) throw new Error('no ' + half + ' entry in the list')
  const q = await M.tapQ(w, T(`dl-${kind}-${id}`), name, { sel: T('daylist'), above: 0 })
  say(`tap ${kind} on the ${half} entry: list ${await stillOpen(T('daylist')) ? 'still open' : 'closed'}; ${q}`)
}

/* ---- 3a: one-day window, Approve then Refuse ---- */
{
  const iso = '2026-11-12'
  await M.bidType(w, 'bane', iso, { approve: false })
  await oneDay('3a pending', iso, 'pending', 's3-1-a-pending')
  let q = await M.tapQ(w, T('decide-approve'), 's3-2-a-approve-q', { above: 0 }); say(`3a tap Approve: window ${await stillOpen(T('bid-picker')) ? 'still open' : 'closed'}; ${q}`)
  await oneDay('3a after Approve', iso, 'approved', 's3-3-a-approved')
  q = await M.tapQ(w, T('decide-refuse'), 's3-4-a-refuse-q', { above: 0 }); say(`3a tap Refuse (while Approved is lit): window ${await stillOpen(T('bid-picker')) ? 'still open' : 'closed'}; ${q}`)
  await oneDay('3a after Refuse (was approved)', iso, 'refused', 's3-5-a-refused')
  await L.closeAny(w)
}
/* ---- 3b: one-day window, Refuse then Approve ---- */
{
  const iso = '2026-11-13'
  await M.bidType(w, 'bane', iso, { approve: false })
  await oneDay('3b pending', iso, 'pending')
  await M.tapQ(w, T('decide-refuse'), 's3-6-b-refuse-q', { above: 0 })
  await oneDay('3b after Refuse', iso, 'refused', 's3-7-b-refused')
  await M.tapQ(w, T('decide-approve'), 's3-8-b-approve-q', { above: 0 })
  await oneDay('3b after Approve (was refused)', iso, 'approved', 's3-9-b-approved')
  await L.closeAny(w)
}
/* ---- 3c: the day's list — AM LL and PM OL on one day, every order ---- */
{
  const iso = '2026-11-16'
  await M.bidType(w, 'bane', iso, { approve: false, portion: 'am' })
  await M.bidType(w, 'bane', iso, { approve: false, portion: 'pm', type: 'OL' })
  await dayList('3c pending', iso, { Morning: 'pending', Afternoon: 'pending' }, 's3-10-c-pending')
  await tapIn(iso, 'Morning', 'approve', 's3-11-c-am-approve-q')
  await dayList('3c AM Approved', iso, { Morning: 'approved', Afternoon: 'pending' }, 's3-12-c-am-approved')
  await tapIn(iso, 'Morning', 'refuse', 's3-13-c-am-refuse-q')
  await dayList('3c AM Refused (was approved)', iso, { Morning: 'refused', Afternoon: 'pending' }, 's3-14-c-am-refused')
  await tapIn(iso, 'Afternoon', 'refuse', 's3-15-c-pm-refuse-q')
  await dayList('3c PM Refused', iso, { Morning: 'refused', Afternoon: 'refused' }, 's3-16-c-both-refused')
  await tapIn(iso, 'Afternoon', 'approve', 's3-17-c-pm-approve-q')
  await dayList('3c PM Approved (was refused)', iso, { Morning: 'refused', Afternoon: 'approved' }, 's3-18-c-pm-approved')
  await tapIn(iso, 'Morning', 'refuse', 's3-19-c-am-refuse2-q')
  await dayList('3c AM lit Refuse tapped again', iso, { Morning: 'pending', Afternoon: 'approved' }, 's3-20-c-am-waiting')
  await L.closeAny(w)
}
/* ---- 3d: the SAME bid in the one-day window (a day holding only its AM bid) and then in the day's list (a PM bid beside it) ---- */
{
  const iso = '2026-11-17'
  await M.bidType(w, 'bane', iso, { approve: false, portion: 'am' })
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForTimeout(500)
  const dump = await L.sheetDump(P)
  say(`3d a day holding only the AM bid: a tap opens ${dump?.id}; Approve/Refuse offered for the held AM bid: ${await L.vis(P, T('decide-approve'))}; held-half line: "${await L.txt(P, T('bid-heldhalf'))}"`)
  await M.winPic(w, 's3-21-d-am-alone', { above: 0 })
  await M.tapQ(w, T('decide-approve'), 's3-22-d-am-approve-q', { above: 0 })
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForTimeout(400)
  const [a, r] = await M.btnState(P, ['decide-approve', 'decide-refuse'])
  const cell = await M.cellWords(P, 'bane', iso)
  judge(LIT_A(a) && GREY_R(r) && stateOfBox(cell.boxes[0]) === 'approved', `3d one-day window after Approve on the AM bid: ${a.text}(${a.pressed}) / ${r.text}(${r.pressed}); cell ${stateOfBox(cell.boxes[0])}`)
  await M.winPic(w, 's3-23-d-am-approved', { above: 0 })
  await L.closeAny(w)
  // a PM bid beside it, through the same one-day window
  await M.bidType(w, 'bane', iso, { approve: false, portion: 'pm', type: 'OL' })
  await dayList('3d the AM bid, now in the day\'s list', iso, { Morning: 'approved', Afternoon: 'pending' }, 's3-24-d-in-list')
  await tapIn(iso, 'Morning', 'refuse', 's3-25-d-list-refuse-q')
  await dayList('3d AM Refused in the list', iso, { Morning: 'refused', Afternoon: 'pending' }, 's3-26-d-list-refused')
  await L.closeAny(w)
}
console.log(`SUMMARY [desktop]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} readings, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
