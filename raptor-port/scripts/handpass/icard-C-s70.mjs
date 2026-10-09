import * as L from './icard-C-lib.mjs'
const { sleep } = L
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const fmt = r => r ? `${r.date} ${r.s}-${r.e} person ${r.person} oil ${JSON.stringify(r.oil)}` : 'GONE'
const sel = () => p.locator('[data-testid="oilconf"]').evaluate(e => ({ yes: e.querySelector('[data-testid="oil-yes"]').className + '|' + e.querySelector('[data-testid="oil-yes"]').getAttribute('aria-pressed'), no: e.querySelector('[data-testid="oil-no"]').className + '|' + e.querySelector('[data-testid="oil-no"]').getAttribute('aria-pressed'), save: e.querySelector('[data-testid="oilconf-save"]').disabled, foot: (e.querySelector('.airpop-foot') || {}).innerText }))
let p, w
async function pass(label, size, who, open, getBtn, touch) {
  w = await L.world(size, who)
  p = w.page
  const me = await L.pid(p, who === 'ad' ? 'Saber' : 'Ranger')
  await L.fileNew(w, { iso: who === 'ad' ? '2026-07-18' : '2026-07-19', type: 'Duty', s: '09:00', e: '12:00', oil: 'yes' })
  const rec = await L.recBy(p, { type: 'Duty', person: me })
  const base = fmt(rec)
  parts.push(`${label}: filed an own weekend Duty and answered Yes: ${base}`)
  const flip = async (to, shot) => {
    await open(rec.iid)
    const btn = getBtn(rec.iid)
    await btn.scrollIntoViewIfNeeded().catch(() => {})
    await (touch ? btn.tap() : btn.click()); await sleep(450)
    const s = await sel()
    const q = (await L.oilText(p)) || ''
    if (shot) pics.push(await L.pic(w, shot))
    parts.push(`${label}: the question opened for the current answer; Yes class "${s.yes}", No class "${s.no}", foot "${(s.foot || '').replace(/\s+/g, ' ')}"`)
    if (s.yes === s.no || /Choose an option/i.test(s.foot || '')) fail(label + ': the question opened with NO answer preselected (current saved answer was ' + (to === 'no' ? 'Yes' : 'No') + ' — both buttons look the same and the foot says Choose an option above)')
    await L.answerOil(w, to); await sleep(500)
    const r = await L.recId(p, rec.iid)
    parts.push(`${label}: answered ${to}: ${fmt(r)}`)
    const same = r.date === rec.date && r.s === rec.s && r.e === rec.e && r.person === rec.person
    if (!same) fail(label + ': dates/hours/person changed by the OIL answer: ' + fmt(r))
    const yes = Object.values(r.oil || {}).some(v => v > 0)
    if ((to === 'yes') !== yes) fail(label + ': saved oil does not match the answer ' + to + ': ' + fmt(r))
    return { s, r }
  }
  const a = await flip('no', label + '-1-question-current-yes')
  // summary on the row / window matches
  if (!touch) await L.openFromList(w, rec.iid); else await open(rec.iid)
  const sum = await p.locator(L.WIN).evaluate(w => (w.querySelector('.inped-oil') || {}).innerText || '')
  parts.push(`${label}: window summary after No: "${sum.replace(/\s+/g, ' ')}"`)
  if (!/no OIL/i.test(sum)) fail(label + ': window summary does not say no OIL: ' + sum)
  if (!touch) { const chip = await p.locator(`#inBody tr[data-iid="${rec.iid}"] .roil`).innerText().catch(() => ''); parts.push(label + ': row chip after No: "' + chip + '"') }
  await L.closeWins(p)
  const b = await flip('yes', label + '-2-question-current-no')
  await L.closeWins(p)
  // undo / redo of the last answer
  const u = await L.undo(w); const rU = await L.recId(p, rec.iid)
  const rd = await L.redo(w); const rR = await L.recId(p, rec.iid)
  parts.push(`${label}: Undo ${u}: oil ${JSON.stringify(rU.oil)}; Redo ${rd}: oil ${JSON.stringify(rR.oil)}`)
  if (!(Object.values(rU.oil || {}).every(v => !(v > 0))) || !Object.values(rR.oil || {}).some(v => v > 0)) fail(label + ': Undo/Redo of the answer wrong')
  pics.push(await L.pic(w, label + '-3-after-redo'))
  await L.finish(w)
}
try {
  // Admin on a desktop: the row's own OIL chip
  await pass('D-admin', 'desk', 'ad',
    async iid => { await L.toList(w) },
    iid => p.locator(`#inBody tr[data-iid="${iid}"] [data-oilrev]`).first(), false)
} catch (e) { console.log('ERR1', e); fail('desktop part stopped: ' + String(e).slice(0, 200)); try { await w.browser.close() } catch (x) {} }
try {
  await pass('P-member', 'phone', 'us',
    async iid => { await L.openFromList(w, iid) },
    iid => p.locator('[data-testid="oil-revise"]').first(), true)
} catch (e) { console.log('ERR2', e); fail('phone part stopped: ' + String(e).slice(0, 200)) }
L.row(70, 'desktop 1440x900 (admin chip) + phone 390x844 (member window)', 'Admin (Saber) desktop; Member (Ranger) phone', verdict, parts.join(' || '), pics)
L.saveRows()
