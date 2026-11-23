// r-t2 (chat 151, the re-walk) — fix 2 on the phone (WebKit 402 × 874, touch ×2): Hunter (Plan of 149) with unsaved chart
// edits on 142's Tracker picks 149 inside ☰. The pick must CLOSE the ☰ menu first and draw the question in front, naming
// 149, the squadron not yet switched; each answer then works when pressed where it is drawn: Stay keeps 142 and the edit;
// Discard switches to 149 and drops it; Save switches after saving it to 142. Lead f too: after Discard, what the
// Tracker's bar says. (t2's first-walk premise — closing the menu by its shade to reach the question — is gone.)
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, menuPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, over } from './r-lib.mjs'
console.log('r-t2-tracker-phone v1')
picsFor('r-t2')
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
/* the Tracker's own bar of unsaved work, its drawn words */
const trkBar = s => s.page.evaluate(() => { const p = document.querySelector('#page-tracker'); if (!p) return null; const hits = [...p.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 1 && /unsaved/i.test(e.textContent)); return hits.map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4) })
await serve()
try {
  const s = await newPage('p')
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant Hunter Plan of 149', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'ad2', 'a2')
  for (const [ans, sel] of [['stay', '#dlgCancel'], ['discard', '#dlgAlt'], ['save', '#dlgOk']]) {
    await step(`fix 2 / S28 phone — ${ans}`, async () => {
      const name = `T-${ans.toUpperCase()}`
      const made = await addEvent(s, name); check(`${ans}: premise — the unsaved test event made on 142's Tracker`, made, made)
      check(`${ans}: premise — 142 in view`, (await state(s)).barMark?.startsWith('142'), (await state(s)).barMark)
      await menuPick(s, '149', `${ans}-01`)
      const a = await rec(s, `${ans}-a-asked`)
      const cov = { cancel: await over(s, '#dlgCancel'), alt: await over(s, '#dlgAlt'), ok: await over(s, '#dlgOk'), msg: await over(s, '#dlgMsg') }
      facts[`${ans}-a-cover`] = cov
      await pic(s, `${ans}-01-asked`)
      check(`${ans}: the pick closed the ☰ menu`, !a.drawerOpen, a.drawerOpen)
      check(`${ans}: the question drawn, naming 149`, !!a.dlg && /149/.test(a.dlg), a.dlg)
      check(`${ans}: the question in front — Stay, Discard, Save each reached by a press`, cov.cancel === 'self' && cov.alt === 'self' && cov.ok === 'self', cov)
      check(`${ans}: not yet switched (142 in view)`, a.barMark?.startsWith('142'), a.barMark)
      await press(s, sel, `${ans}-02-answer`); await page.waitForTimeout(900)
      const b = await rec(s, `${ans}-b-answered`); const has = await hasEv(s, name); facts[`${ans}-b-trkbar`] = await trkBar(s)
      await pic(s, `${ans}-02-answered`)
      if (ans === 'stay') {
        check('stay: 142 kept', b.barMark?.startsWith('142'), b.barMark)
        check('stay: the edit kept, still unsaved on the Tracker', has, has)
      } else {
        check(`${ans}: 149 in view`, b.barMark?.startsWith('149'), b.barMark)
        check(`${ans}: the question gone`, !b.dlg, b.dlg)
        note(`${ans}: the Tracker's bar after the answer reads`, JSON.stringify(facts[`${ans}-b-trkbar`]))
        if (ans === 'discard') check('lead f (phone): after Discard the bar no longer says there are unsaved edits', !(facts['discard-b-trkbar'] || []).length, facts['discard-b-trkbar'])
      }
      if ((await state(s)).drawerOpen) await shutMenu(s)
      if (!(await state(s)).barMark?.startsWith('142')) { await go(s, 'viewsched'); await menuPick(s, '142'); await shutMenu(s) }
      await go(s, 'tracker'); await page.waitForTimeout(1200)
      const back = await hasEv(s, name); facts[`${ans}-c-on-142`] = back
      if (ans === 'stay') check('stay: still there on 142', back, back)
      if (ans === 'discard') check('discard: the edit gone on 142', !back, back)
      if (ans === 'save') check('save: the edit saved on 142', back, back)
      await pic(s, `${ans}-03-142-tracker`)
    })
  }
  await s.ctx.close()
} finally { finish('r-t2'); await stop() }
