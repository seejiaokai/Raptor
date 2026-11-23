// t2 — a probe of t1's phone lead, then scenario 28 on the phone by the route a person has: Hunter (Plan of 149) with
// unsaved chart edits picks 149 inside ☰; the question "Save them before switching to 149?" opens — is it drawn above
// the menu or under it? What covers its buttons? Then the menu closed by a tap on the shade, and each answer pressed.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, go, grant, finish, note, facts, state } from './vlib.mjs'
console.log('t2-tracker-phone v1')
picsFor('t2')
const vclick = (s, sel) => s.page.locator(sel).filter({ visible: true }).first().click()
const hasEv = (s, name) => s.page.evaluate(n => (document.querySelector('#page-tracker') || document.body).innerText.includes(n), name)
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
const cover = s => s.page.evaluate(() => {
  const out = {}
  for (const id of ['dlgCancel', 'dlgAlt', 'dlgOk', 'dlgMsg']) {
    const b = document.getElementById(id); if (!b) { out[id] = 'none'; continue }
    const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    out[id] = { box: [r.left, r.top, r.width, r.height].map(Math.round), top: t ? (b.contains(t) ? 'self' : `${t.tagName}#${t.id}.${String(t.className).slice(0, 30)}`) : 'nothing' }
  }
  const z = e => e ? getComputedStyle(e).zIndex : null
  out.z = { drawer: z(document.querySelector('#drawer')), modal: z(document.querySelector('#dlgModal')), modalParent: z(document.querySelector('#dlgModal')?.parentElement) }
  return out
})
await serve()
try {
  const s = await newPage('p')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant Hunter Plan of 149', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched') })
  await as(s, 'ad2', 'a2')
  for (const [ans, sel] of [['stay', '#dlgCancel'], ['discard', '#dlgAlt'], ['save', '#dlgOk']]) {
    await step(`S28 phone ${ans}`, async () => {
      const name = `T-${ans.toUpperCase()}`
      facts[`${ans}-made`] = await addEvent(s, name)
      await menuPick(s, '149', `${ans}-01`)
      await rec(s, `${ans}-a-asked`); facts[`${ans}-a-cover`] = await cover(s); note('cover:', JSON.stringify(facts[`${ans}-a-cover`]))
      await pic(s, `${ans}-01-asked-menu-open`)
      await closeMenuOutside(s, `${ans}-02-shade`)
      await rec(s, `${ans}-b-after-shade`); facts[`${ans}-b-cover`] = await cover(s); note('cover after shade:', JSON.stringify(facts[`${ans}-b-cover`]))
      await pic(s, `${ans}-02-after-shade`)
      if ((await state(s)).dlg) {
        await press(s, sel, `${ans}-03-answer`); await page.waitForTimeout(900)
        await rec(s, `${ans}-c-answered`); facts[`${ans}-c-has`] = await hasEv(s, name); await pic(s, `${ans}-03-answered`)
      }
      if ((await state(s)).drawerOpen) await closeMenuOutside(s)
      if (!(await state(s)).barMark?.startsWith('142')) { await menuPick(s, '142'); await closeMenuOutside(s) }
      await go(s, 'tracker'); await page.waitForTimeout(1200)
      facts[`${ans}-d-has-on-142`] = await hasEv(s, name); note(`${ans}: on 142 has ${name}:`, facts[`${ans}-d-has-on-142`])
    })
  }
  await s.ctx.close()
} finally { finish('t2'); await stop() }
