import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const fmt = r => r ? `${r.person} ${r.date} ${r.s}-${r.e} oil ${JSON.stringify(r.oil)} by ${r.by}` : 'GONE'
const oilN = rs => rs.map(r => JSON.stringify(r.oil))
const badge = async () => ((await p.locator('#roleBadge').innerText().catch(() => '')) || '').trim()
async function pass(kind, iso, titleTag) {
  // Ranger files
  await L.switchUser(w, 'us')
  await L.openNew(w, iso)
  await p.selectOption('#inpEditType', 'Event')
  const opts = await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent))
  if (!(await p.locator(`#inpEditPerson option[value="${kind}"]`).count())) { parts.push(`${kind}: Ranger's Person list does not offer ${kind}: ${opts.slice(0, 4)}`); await L.closeWins(p); return }
  await p.selectOption('#inpEditPerson', kind)
  await L.setTimes(p, '09:00', '12:00'); await p.fill('#inpEditOwnTitle', titleTag)
  const s = await L.saveWin(w)
  parts.push(`${kind}: Ranger filed a weekend ${kind} Event: question ${s.asked ? s.head.slice(0, 140) : 'none'}`)
  pics.push(await L.pic(w, `72-${kind}-1-question`))
  if (s.asked) await L.answerOil(w, 'yes')
  await L.closeWins(p)
  const rs = await L.recAll(p, { title: titleTag })
  parts.push(`${kind}: saved ${rs.length} record(s): ${rs.map(fmt).join(' ; ')}`)
  const iid = rs[0].iid
  // revise as Ranger
  await L.openByText(w, titleTag)
  let f = await L.winFacts(p)
  parts.push(`${kind}: Ranger (filer) opens it: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, group Change… ${f.revise}, own Change… ${await p.locator('[data-testid="oil-revise-own"]').count()}, Take me out ${f.takeout}; ro "${f.ro}"`)
  pics.push(await L.pic(w, `72-${kind}-2-ranger-window`))
  const rv = p.locator('[data-testid="oil-revise"]')
  if (await rv.count() && !(await rv.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(x === e || e.contains(x)) }))) {
    await rv.click(); await sleep(400); await L.answerOil(w, 'no'); await sleep(500)
    const r2 = await L.recAll(p, { title: titleTag })
    parts.push(`${kind}: Ranger revised to No: ${oilN(r2).join(' ')}`)
  } else { fail(`${kind}: filer Ranger cannot revise the placeholder answer (Change… ${await rv.count()})`) }
  await L.closeWins(p)
  // Saber admin revises
  await L.switchUser(w, 'ad')
  await L.openByText(w, titleTag)
  f = await L.winFacts(p)
  parts.push(`${kind}: Saber (admin) opens it: Save ${f.save}, Delete ${f.del}, group Change… ${f.revise}, Take me out ${f.takeout}`)
  const rv2 = p.locator('[data-testid="oil-revise"]')
  if (await rv2.count()) { await rv2.click(); await sleep(400); await L.answerOil(w, 'yes'); await sleep(500); parts.push(`${kind}: Saber revised to Yes: ${oilN(await L.recAll(p, { title: titleTag })).join(' ')}`) } else fail(`${kind}: admin cannot revise`)
  await L.closeWins(p)
  // Saber in member view: a member who did not file it
  await p.locator('#roleBadge').click(); await sleep(700)
  parts.push(`${kind}: Saber switched to the member view (badge "${await badge()}")`)
  await L.openByText(w, titleTag)
  f = await L.winFacts(p)
  const ownBtns = await p.locator('[data-testid="oil-revise-own"], [data-testid="oil-answer-own"]').count()
  const grpLive = await p.locator('[data-testid="oil-revise"]').evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (x === e || e.contains(x)) }).catch(() => null)
  parts.push(`${kind}: as an ordinary member who did not file it: Save ${f.save}, Delete ${f.del}, calendar ${f.cal}, group Change… present ${f.revise} usable ${grpLive}, own Change… ${ownBtns}, Take me out ${f.takeout}; ro "${f.ro}"`)
  pics.push(await L.pic(w, `72-${kind}-3-member-view`))
  if (f.save || f.del || f.takeout || ownBtns || grpLive) fail(`${kind}: an ordinary member behind ${kind} has controls: save ${f.save} del ${f.del} takeout ${f.takeout} own ${ownBtns} grp ${grpLive}`)
  await L.closeWins(p)
  await p.locator('#roleBadge').click(); await sleep(700)
  parts.push(`${kind}: switched back (badge "${await badge()}")`)
}
try {
  await pass('allavail', '2026-07-18', 'AllAvail fun')
  await pass('all', '2026-07-19', 'All fun')
  // unanswered notification belongs to the filer: look at Ranger's bell vs Saber's after a holiday would be heavy; record bell state
  L.row(72, 'desktop 1440x900', 'Member (Ranger) filer, Admin (Saber) admin and member-view', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '72-err'))
  L.row(72, 'desktop 1440x900', 'Ranger / Saber', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
