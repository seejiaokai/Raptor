// w-c1 - the re-walk of the second fix round, item 1 (C1). Saber on 142, Inputs, List, All dates; Drifter's input with typed words;
// Blade's row pressed so "Open Blade's input and lose them?" is up; 149 picked. SZ=d|pc. Every step is a press; the page is only read.
import { signIn, mk, closeAll, finish, step, pic, picsFor, press, go, state, note, check, pickSq, shut } from '../rewalk/rlib.mjs'
const SZ = process.env.SZ || 'd', tag = `w-c1-${SZ}`
console.log('w-c1 v1', SZ, process.env.MQ_PORT)
picsFor(tag)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const tid = t => `[data-testid="${t}"]`
const WORDS = 'RW2 typed words'
const tap = async (s, l) => { if (s.desk) await l.click(); else await l.tap(); await wait(s, 350) }
const listAll = async s => {
  const { page } = s
  await go(s, 'inputs'); await shut(s); await wait(s, 500)
  if (await page.locator('#inListBtn[aria-pressed="false"]').filter({ visible: true }).count()) await press(s, '#inListBtn')
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await wait(s, 350)
  if (await page.locator('#inRangePop').filter({ visible: true }).count()) { await press(s, '#inRangeBtn'); await wait(s, 200) }
}
const rows = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].map(r => r.dataset.iid + '|' + r.innerText.replace(/\s+/g, ' ').trim()))
const form = s => s.page.evaluate(() => {
  const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
  if (!r) return null
  const w = r.closest('.floatwin') || r.closest('.airpop')
  const save = w?.querySelector('#inpEditSave')
  return { head: w?.innerText.split('\n').slice(0, 2).join(' / ').trim(), rmk: r.value, band: document.querySelector('[data-testid="inped-moveband"]')?.textContent.replace(/\s+/g, ' ').trim() ?? null, inert: !!w?.querySelector('.inped-body')?.hasAttribute('inert'), rmkOff: r.readOnly || r.disabled || !!r.closest('[inert]'), saveOff: save ? (save.disabled || !!save.closest('[inert]')) : null }
})
const asked = s => s.page.locator(tid('inped-swap')).filter({ visible: true }).count()
const covered = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(n => n.getBoundingClientRect().width > 1); if (!e) return 'not drawn'; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName}#${t?.id}.${String(t?.className).slice(0, 30)}` }, sel)
const rowOf = (s, who) => s.page.locator('#inBody tr[data-iid], #inList [data-iid]', { hasText: who }).filter({ visible: true }).first()
/* the pick: the size's own door; the phone's by the menu, or by a second pointer when the window covers the menu's button */
async function pickNow(s, num) {
  const { page } = s
  if (s.desk) {
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click(); await wait(s, 320)
    const row = page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first()
    const b = await row.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
    return 'by the top bar list'
  }
  const top = await covered(s, '#sqnMenuBtn'); note('the top bar squadron button is', top)
  if (top === 'free') {
    await page.locator('#sqnMenuBtn').filter({ visible: true }).first().tap(); await wait(s, 320)
    await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first().tap(); await wait(s, 900)
    return 'by the top bar list, a finger'
  }
  const c = await covered(s, '#burger'); note('the menu button is', c)
  if (c !== 'free') return `NOT REACHABLE by a finger: ☰ ${c}`
  await page.locator('#burger').tap(); await wait(s, 320)
  if (!(await page.locator('#drawerSqnList').count())) { await page.locator('#drawerSqnBtn').tap(); await wait(s, 250) }
  await page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first().tap(); await wait(s, 900)
  await shut(s)
  return 'by the ☰ menu'
}
try {
  await step('C1', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    await listAll(s); const a142 = await rows(s); await pic(s, '00-142-list')
    await pickSq(s, '149'); await shut(s); await wait(s, 500); await listAll(s); const a149 = await rows(s); await pic(s, '00-149-list')
    await pickSq(s, '142'); await shut(s); await wait(s, 500); await listAll(s)
    note('rows before', a142.length, a149.length)
    const blade0 = a142.filter(x => /Blade/.test(x)), drifter0 = a142.filter(x => /Drifter/.test(x))
    { const r = rowOf(s, 'Drifter'), o = r.locator(tid('in-open')); await tap(s, (await o.count()) ? o.first() : r); await wait(s, 500) }
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill(WORDS); await wait(s, 200)
    await pic(s, '01-drifter-typed')
    note('form', JSON.stringify(await form(s)))
    const blade = rowOf(s, 'Blade')
    await blade.scrollIntoViewIfNeeded().catch(() => {})
    const opener = (await blade.locator(tid('in-open')).count()) ? blade.locator(tid('in-open')).first() : blade
    const bb = await opener.boundingBox()
    const at = bb && await page.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? `${t.tagName}#${t.id}.${String(t.className).slice(0, 40)} inRow=${!!t.closest('#inBody, #inList')}` : null }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
    note("at Blade's row", at)
    if (bb && /inRow=true/.test(at || '')) await tap(s, opener)
    else { note("Blade's row is under the window: pressed through the page's own click, the only way to raise the question at this size"); await opener.evaluate(e => e.click()); await wait(s, 400) }
    const q = await asked(s); await pic(s, '02-question-up')
    check('the question "Open Blade\'s input and lose them?" is up', q > 0 && /Open Blade.s input and lose them/.test(await page.locator(tid('inped-swap')).first().innerText().catch(() => '')), q)
    const how = await pickNow(s, '149'); note('pick', how)
    if (/NOT REACHABLE/.test(how)) { check('NOT WALKED at this size: a finger cannot reach the pick with the window open', false, how); await s.ctx.close(); return }
    const v = await state(s); const f = await form(s), q2 = await asked(s)
    await pic(s, '03-after-pick')
    note('after the pick', JSON.stringify(f), 'bar', v.barMark, 'question', q2)
    check('the question is gone after the pick', q2 === 0, q2)
    check('on 149', /149/.test(v.barMark || v.dMark || ''), v.barMark || v.dMark)
    check("the window stays on Drifter's input", !!f && /Drifter/.test(f.head || '') , f?.head)
    check('it is held read-only under its band', !!f?.band && (f.inert || f.rmkOff), f)
    check('the typed words are still there', f?.rmk === WORDS, f?.rmk)
    const during = await rows(s)
    note('rows in both lists before the walk', JSON.stringify(a149.filter(x => a142.includes(x))))
    check("149's list behind the held window is exactly its own (no 142 row added)", JSON.stringify(during) === JSON.stringify(a149), { during: during.length, a149: a149.length, sameAs142: during.filter(x => a142.includes(x)).length })
    /* the held form cannot be written */
    await page.locator(tid('inped-moveband')).locator('button', { hasText: /^Close$/ }).filter({ visible: true }).first().evaluate(() => {})
    await pic(s, '04-held-band')
    await tap(s, page.locator(tid('inped-moveband')).locator('button', { hasText: /^Close$/ }).filter({ visible: true }).first()); await wait(s, 500)
    const fc = await form(s), qc = await asked(s); await pic(s, '05-after-close')
    check('Close: the window is gone, no question', !fc && qc === 0, { fc, qc })
    await listAll(s); const b149 = await rows(s); await pic(s, '06-149-list-after')
    check("149's list is exactly as before", JSON.stringify(b149) === JSON.stringify(a149), { before: a149.length, after: b149.length })
    await pickSq(s, '142'); await shut(s); await wait(s, 600); await listAll(s); const b142 = await rows(s); await pic(s, '07-142-list-after')
    check("142's list is exactly as before", JSON.stringify(b142) === JSON.stringify(a142), { before: a142.length, after: b142.length })
    check("Blade's record unchanged", JSON.stringify(b142.filter(x => /Blade/.test(x))) === JSON.stringify(blade0), blade0.length)
    check("Drifter's record unchanged (the typed words never saved)", JSON.stringify(b142.filter(x => /Drifter/.test(x))) === JSON.stringify(drifter0) && !b142.some(x => x.includes(WORDS)), drifter0.length)
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
