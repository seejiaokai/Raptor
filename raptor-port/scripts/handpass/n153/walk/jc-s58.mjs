// jc-s58 - S58, the Inputs everyday round: a member files his own future input, sees it in the List and on the Calendar, reopens, edits and deletes it;
// every way of closing the window; the admin files for someone else from a calendar day; Medical and SANS opened and left; the squadrons kept apart.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, go, shut, pickSq, state } from './jlib.mjs'
import { toast } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s58 v1', SZ)
picsFor('jc-s58-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const WIN = '.floatwin.inpedwin'
/* what the app says to a press of Add or Save: a question box is answered with its go-ahead, and its words kept */
async function answer(s, tag) {
  const nd = s.page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) { rec(`S58 ${tag} the No document question`, 'answered No document'); if (s.desk) await nd.first().click(); else await nd.first().tap(); await s.page.waitForTimeout(450) }
  const q = await s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null })
  if (q) { rec(`S58 ${tag} asked`, q); const ok = s.page.locator('#dlgOk'); if (s.desk) await ok.click(); else await ok.tap(); await s.page.waitForTimeout(450) }
  const inWin = await s.page.evaluate(w => { const r = [...document.querySelectorAll(w)].find(e => e.getBoundingClientRect().width > 0); return r ? [...r.querySelectorAll('.err, [role=alert], .inp-err, .warn')].filter(e => e.getBoundingClientRect().width > 0 && e.textContent.trim()).map(e => e.textContent.trim().slice(0, 120)) : null }, WIN)
  if (inWin && inWin.length) rec(`S58 ${tag} the window says`, inWin)
}
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(280) }
const winOpen = s => s.page.locator(WIN).filter({ visible: true }).count().then(n => n > 0)
const rows = s => s.page.evaluate(() => [...document.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.dataset.iid, t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })))
const toList = async s => { await go(s, 'inputs'); await shut(s); await s.page.waitForTimeout(350); if (await s.page.locator('#inMemberMode').filter({ visible: true }).count()) await tapIt(s, '#inMemberMode'); await tapIt(s, '#inListBtn'); await s.page.waitForTimeout(250) }
const winBtns = s => s.page.evaluate(w => { const r = [...document.querySelectorAll(w)].find(e => e.getBoundingClientRect().width > 0); return r ? [...r.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && (b.id || b.getAttribute('aria-label')?.startsWith('Close'))).map(b => b.id || b.getAttribute('aria-label')) : null }, WIN)
/* the window's calendar opens on the demo's July: its › is pressed until the wanted day is drawn */
const pickDay = async (s, label) => {
  const b = () => s.page.locator(`${WIN} button[aria-label^="${label}"]`).first()
  for (let i = 0; i < 8 && !(await b().count()); i++) await tapIt(s, s.page.locator(`${WIN} button[aria-label="Next month"]`).first())
  if (!(await b().count())) { note('no day ' + label); return false }
  await tapIt(s, b()); return true
}
/* the list shows a window of dates: read what it holds for this person's remark */
const findRow = async (s, word) => (await rows(s)).find(r => r.t.includes(word))
async function widenRange(s) {
  await tapIt(s, '#inRangeBtn'); await s.page.waitForTimeout(250)
  const b = s.page.locator('button', { hasText: /^All$|All dates|Everything/ }).filter({ visible: true }); rec('S58 range pop-up has All', await b.count())
  if (await b.count()) await tapIt(s, b.first())
  if (await s.page.locator('#inRangeBtn[aria-expanded="true"]').count()) await tapIt(s, '#inRangeBtn')
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'us', 'us')
  await step('S58 member: every way of closing an empty window', async () => {
    await toList(s)
    for (const [how, fn] of [['✕', () => tapIt(s, `${WIN} button[aria-label^="Close"]`)], ['Cancel', () => tapIt(s, '#inpEditCancel')], ['Escape', () => page.keyboard.press('Escape')]]) {
      await tapIt(s, '#inNew'); check(`S58 window opens (${how})`, await winOpen(s), 'open'); await fn(); await page.waitForTimeout(300); check(`S58 ${how} closes it`, !(await winOpen(s)), 'closed')
    }
    await tapIt(s, '#inNew'); const w = await page.evaluate(wn => { const r = document.querySelector(wn).getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom } }, WIN)
    const X = w.l > 40 ? 10 : Math.min(page.viewportSize().width - 4, w.r + 4), Y = w.t > 110 ? 80 : Math.min(page.viewportSize().height - 4, w.b + 8)
    if (s.desk) await page.mouse.click(X, Y); else await page.touchscreen.tap(X, Y); await page.waitForTimeout(350); const still = await winOpen(s); rec('S58 a press outside the window: still open', still); await pic(s, 'm0-outside')
    if (still) await tapIt(s, '#inpEditCancel')
  })
  let id
  await step('S58 member: files his own input', async () => {
    await tapIt(s, '#inNew'); const lock = await page.evaluate(() => { const p = document.querySelector('#inpEditPerson'); return p ? { v: p.value, off: p.disabled, n: p.options.length } : null }); rec('S58 member Person box', lock)
    rec('S58 member Person is named, not a list', await page.evaluate(w => { const e = document.querySelector(w); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 40) : null }, WIN)); check('S58 a member files for himself: no person list', !lock, lock)
    rec('S58 window controls', await winBtns(s))
    check('S58 day found', await pickDay(s, 'Mon 7 Dec 2026'), 'Mon 7 Dec'); await page.fill('#inpEditRmk', 'jc58 remark'); await pic(s, 'm1-filled')
    await tapIt(s, '#inpEditSave'); await page.waitForTimeout(450); await answer(s, 'member Add'); await pic(s, 'm1b-after-add'); rec('S58 Add says', await toast(s)); rec('S58 window words after Add', await page.evaluate(w => [...document.querySelectorAll(w)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/s+/g, ' ').slice(0, 200)), WIN)); check('S58 window closes on Add', !(await winOpen(s)), 'closed')
    let r = await findRow(s, 'jc58'); if (!r) { await widenRange(s); r = await findRow(s, 'jc58') }
    rec('S58 list row', r || (await rows(s)).slice(0, 3)); check('S58 in the List once', (await rows(s)).filter(x => x.t.includes('jc58')).length === 1, r?.t); id = r?.id; await pic(s, 'm2-list')
  })
  await step('S58 member: on the Calendar', async () => {
    await tapIt(s, '#inCalBtn'); await page.waitForTimeout(350)
    for (let i = 0; i < 8 && !(await page.locator('#page-inputs button[aria-label*="December 2026"]').count()); i++) await tapIt(s, '#icNext')
    const head = await page.evaluate(() => [...document.querySelectorAll('#page-inputs button[aria-label*="choose the month"]')].map(b => b.textContent.trim())); rec('S58 calendar on', head); await pic(s, 'm3-calendar')
    const has = await page.evaluate(() => document.querySelector('#page-inputs').innerText.includes('Ranger')); rec('S58 calendar names Ranger', has)
    await tapIt(s, '#inListBtn')
  })
  await step('S58 member: reopen, edit, delete', async () => {
    const row = page.locator(`[data-iid="${id}"]`).first(); await tapIt(s, row); await page.waitForTimeout(250); check('S58 his row reopens', await winOpen(s), 'open'); rec('S58 reopened controls', await winBtns(s))
    await page.fill('#inpEditRmk', 'jc58 edited'); await tapIt(s, '#inpEditSave'); await page.waitForTimeout(450); await answer(s, 'member edit'); rec('S58 Save says', await toast(s))
    check('S58 the edit shows in the List', ((await findRow(s, 'jc58'))?.t || '').includes('edited'), (await findRow(s, 'jc58'))?.t)
    await tapIt(s, page.locator(`[data-iid="${id}"]`).first()); await page.waitForTimeout(250)
    const del = page.locator(`${WIN} button`, { hasText: /^Delete/ }).first(); check('S58 Delete offered on his own', (await del.count()) > 0, await del.count()); if (await del.count()) { await tapIt(s, del); await page.waitForTimeout(250); if (await page.locator('#dlgOk:visible').count()) { rec('S58 delete asks', await page.locator('#dlgMsg').textContent()); await tapIt(s, '#dlgOk') } else if (await del.count() && await winOpen(s)) { rec('S58 delete second press', await del.textContent()); await tapIt(s, del) } await page.waitForTimeout(450) }
    check('S58 gone from the List', !(await findRow(s, 'jc58')), (await findRow(s, 'jc58'))?.t); await pic(s, 'm4-deleted')
  })
  await step('S58 admin: files for another person, Medical and SANS', async () => {
    await as(s, 'ad', 'a'); await toList(s); await tapIt(s, '#inNew')
    const v = await page.evaluate(() => { const o = [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent)); return o?.value }); await page.selectOption('#inpEditPerson', v)
    await pickDay(s, 'Tue 8 Dec 2026'); await page.fill('#inpEditRmk', 'jc58 for hunter'); await tapIt(s, '#inpEditSave'); await page.waitForTimeout(450); await answer(s, 'admin Add'); rec('S58 admin Add says', await toast(s))
    let r = await findRow(s, 'jc58'); if (!r) { await widenRange(s); r = await findRow(s, 'jc58') } rec('S58 admin row', r); check('S58 the input is on his row', !!r && /Hunter/.test(r.t), r?.t); await pic(s, 'a1-admin-list')
    await tapIt(s, '#inMedBtn'); await page.waitForTimeout(300); const med = await state(s); check('S58 Medical opens on Inputs', med.page === 'page-inputs', med.page); await pic(s, 'a2-medical')
    await tapIt(s, '#inSansMode'); await page.waitForTimeout(300); await pic(s, 'a3-sans'); await tapIt(s, '#inMemberMode'); await page.waitForTimeout(250); await tapIt(s, '#inListBtn')
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(450); await tapIt(s, '#inListBtn'); const on149 = await findRow(s, 'jc58'); check('S58 142\'s input not on 149', !on149, on149?.t)
    await pickSq(s, '142'); await shut(s); await page.waitForTimeout(450); await tapIt(s, '#inListBtn'); let back = await findRow(s, 'jc58'); if (!back) { await widenRange(s); back = await findRow(s, 'jc58') } check('S58 still on 142', !!back, back?.t)
    await as(s, 'ad9', 'a9'); await toList(s); const k = await findRow(s, 'jc58'); check('S58 149\'s admin does not see it', !k, k?.t); await pic(s, 'a4-kestrel')
  })
  await s.ctx.close()
} finally { finish('jc-s58-' + SZ); await closeAll() }
