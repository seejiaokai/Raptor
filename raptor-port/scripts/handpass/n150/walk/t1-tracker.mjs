// t1 — Astra's scenario 28 (Hunter, Plan of 149: unsaved Tracker edits, then a pick of 149 — Stay, Discard, Save) and the
// question case "unsaved home Tracker edits when the destination is View only" (Hunter, View of 149). SZ=d (the top bar's
// list) or SZ=p (the ☰ menu's list). The edit is a new test event made in the chart's layout editor by presses (w12's way).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('t1-tracker v1', SZ)
picsFor('t1-' + SZ)
const vclick = (s, sel) => s.page.locator(sel).filter({ visible: true }).first().click()
async function addEvent(s, name) {
  await go(s, 'tracker'); await s.page.waitForTimeout(1800)
  await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await s.page.waitForTimeout(300)
  const add = s.page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await s.page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
  await add.click(); await s.page.waitForSelector('#dlgInput:visible')
  await s.page.locator('#dlgInput:visible').first().fill(name)
  await vclick(s, '#dlgOk'); await s.page.waitForTimeout(400); await vclick(s, '#sylMenuBtn'); await vclick(s, '#arrangeBtn'); await s.page.waitForTimeout(400)
  return hasEv(s, name)
}
const hasEv = (s, name) => s.page.evaluate(n => (document.querySelector('#page-tracker') || document.body).innerText.includes(n), name)
const ask = s => s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); const d = document.querySelector('#dlgModal'); return { msg: m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null, btns: d ? [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.id}:${b.textContent.trim()}`) : [] } })
async function pick(s, num, name) { return SZ === 'd' ? barPick(s, num, name) : menuPick(s, num, name) }
const trkHead = s => s.page.evaluate(() => { const p = document.querySelector('#page-tracker'); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : null })
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant Hunter Plan of 149', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('S28 Stay', async () => {
    facts['s28-a-made'] = await addEvent(s, 'T-STAY'); note('made', facts['s28-a-made'])
    await pick(s, '149', 's28-01'); await page.waitForTimeout(400)
    facts['s28-b-ask'] = await ask(s); await rec(s, 's28-b-state'); await pic(s, 's28-01-ask')
    await press(s, '#dlgCancel', 's28-02-stay'); await page.waitForTimeout(400)
    await rec(s, 's28-c-after-stay'); facts['s28-c-has'] = await hasEv(s, 'T-STAY'); await pic(s, 's28-02-after-stay')
    if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
  })
  await step('S28 Discard', async () => {
    await pick(s, '149', 's28-03'); await page.waitForTimeout(400)
    facts['s28-d-ask'] = await ask(s)
    await press(s, '#dlgAlt', 's28-03-discard'); await page.waitForTimeout(900)
    await rec(s, 's28-e-after-discard'); facts['s28-e-trk'] = await trkHead(s); await pic(s, 's28-03-after-discard')
    if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'viewsched'); await pick(s, '142'); if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'tracker'); await page.waitForTimeout(1200)
    facts['s28-f-has-after-discard'] = await hasEv(s, 'T-STAY')
  })
  await step('S28 Save', async () => {
    facts['s28-g-made'] = await addEvent(s, 'T-SAVE')
    await pick(s, '149', 's28-04'); await page.waitForTimeout(400)
    facts['s28-h-ask'] = await ask(s); await pic(s, 's28-04-ask-save')
    await press(s, '#dlgOk', 's28-05-save'); await page.waitForTimeout(1200)
    await rec(s, 's28-i-after-save'); facts['s28-i-trk'] = await trkHead(s); await pic(s, 's28-05-after-save')
    if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'viewsched'); await pick(s, '142'); if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'tracker'); await page.waitForTimeout(1200)
    facts['s28-j-has-after-save'] = await hasEv(s, 'T-SAVE'); await pic(s, 's28-06-142-tracker-after-save')
  })
  await as(s, 'ad', 'a')
  await step('Hunter back to View of 149', async () => { await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  await step('Q5 unsaved edits, destination View only (on the Tracker)', async () => {
    facts['q5-a-made'] = await addEvent(s, 'T-VIEW')
    await pick(s, '149', 'q5-01'); await page.waitForTimeout(600)
    facts['q5-b-ask'] = await ask(s); await rec(s, 'q5-b-state'); await pic(s, 'q5-01-after-pick-149')
    if (facts['q5-b-ask'].msg) { await press(s, '#dlgCancel'); facts['q5-b2-stayed'] = (await state(s)).barMark }
    if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
  })
  await step('Q5 again from View-only Sched', async () => {
    if (!(await state(s)).barMark?.startsWith('142')) { await go(s, 'viewsched'); await pick(s, '142'); if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s) }
    await go(s, 'viewsched')
    await pick(s, '149', 'q5-02'); await page.waitForTimeout(600)
    facts['q5-c-ask'] = await ask(s); await rec(s, 'q5-c-state'); await pic(s, 'q5-02-from-viewsched')
    if (facts['q5-c-ask'].msg) await press(s, '#dlgAlt')
    if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'viewsched'); await pick(s, '142'); if (SZ === 'p' && (await state(s)).drawerOpen) await closeMenuOutside(s)
    await go(s, 'tracker'); await page.waitForTimeout(1200)
    facts['q5-d-has-on-return'] = await hasEv(s, 'T-VIEW'); await rec(s, 'q5-d-return')
  })
  await s.ctx.close()
} finally { finish('t1-' + SZ); await stop() }
