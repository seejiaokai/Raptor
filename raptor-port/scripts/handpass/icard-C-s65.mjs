import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const toast = () => p.evaluate(() => (document.getElementById('toastEl') || {}).innerText || '')
const fmt = r => r ? `${r.type} rmk "${r.remarks}" ${r.date} ${r.s}-${r.e}` : 'GONE'
const badge = async () => ((await p.locator('#roleBadge').innerText().catch(() => '')) || '').trim()
async function drawerRole() {
  await p.locator('#burger').tap(); await sleep(500)
  const b = p.locator('#drawerRole')
  const label = (await b.innerText()).trim()
  await b.tap(); await sleep(700)
  // close the drawer if still open
  if (await p.locator('#drawerRole:visible').count()) { await p.locator('#burger').tap().catch(() => {}); await sleep(300) }
  return label
}
try {
  const ranger = await L.pid(p, 'Ranger')
  await L.fileNew(w, { iso: '2026-07-27', type: 'Duty', s: '09:00', e: '10:00' }) // Saber's own: one saved change first
  const rec = await L.recBy(p, { type: 'Appointment', date: 'Jul 16', person: ranger }) // Ranger's own, placed by Ranger
  parts.push('input used: ' + fmt(rec) + ' placed by ' + (await p.evaluate(b => window.PEOPLE[b].cs, rec.by)))
  await L.openFromList(w, rec.iid)
  await p.fill('#inpEditRmk', 'draft remark')
  const f0 = await L.winFacts(p)
  parts.push(`Saber (admin) opened Ranger's Duty and typed a draft remark: Save ${f0.save}, Delete ${f0.del}, calendar ${f0.cal}; badge "${await badge()}"`)
  pics.push(await L.pic(w, '65-1-admin-draft'))
  const lab = await drawerRole()
  parts.push(`pressed "${lab}" in the burger menu; badge now "${await badge()}"; window still open ${await L.win(p).count()}`)
  pics.push(await L.pic(w, '65-2-after-switch'))
  let f1 = { save: false, del: false, cal: false, ro: '' }
  if (await L.win(p).count()) f1 = await L.winFacts(p)
  parts.push(`window after the switch: Save ${f1.save}, Delete ${f1.del}, calendar ${f1.cal}, ro "${f1.ro}", live fields ${await p.locator(L.WIN).evaluate(w => [...w.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => e.offsetParent && !e.disabled && !e.readOnly && !e.closest('[inert]')).length).catch(() => 'n/a')}`)
  if (f1.save || f1.del) {
    // buttons still there: press them and see what happens
    if (f1.save) { await p.locator('#inpEditSave').scrollIntoViewIfNeeded(); await p.locator('#inpEditSave').tap(); await sleep(700) }
    const r1 = await L.recId(p, rec.iid)
    parts.push(`Save pressed as member: toast "${await toast()}"; saved record ${fmt(r1)}`)
    if (r1.remarks === 'draft remark') fail('the member-view Save wrote the admin draft')
    if (f1.del && await L.win(p).count()) { await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await p.locator('#inpEditDel').tap(); await sleep(700) }
    const r2 = await L.recId(p, rec.iid)
    parts.push(`Delete pressed as member: record ${fmt(r2)}`)
    if (!r2) fail('the member-view Delete removed the record')
    pics.push(await L.pic(w, '65-3-member-attempts'))
    if (f1.save || f1.del) parts.push('NOTE: Save/Delete were still on screen after the switch to the member view')
  }
  const lab2 = await drawerRole()
  parts.push(`pressed "${lab2}"; badge "${await badge()}"; window open ${await L.win(p).count()}`)
  pics.push(await L.pic(w, '65-4-back-to-admin'))
  const rFinal = await L.recId(p, rec.iid)
  parts.push('record at the end: ' + fmt(rFinal))
  if (!rFinal) fail('record gone')
  else if (rFinal.remarks === 'draft remark') parts.push('the draft remark was saved (during or after the switch)')
  L.row(65, 'phone 390x844', 'Admin (Saber) switching to member view with the window open', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '65-err'))
  L.row(65, 'phone 390x844', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
