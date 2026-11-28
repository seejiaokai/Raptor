// jb-s24b v1 - S24 by hand-sized steps: Hunter, a draft on 149, the member view, then a pick of 142 from the bar's list:
// what the list offers, what the press does, and any note it leaves. WHO=saber repeats it as the master admin.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, addEvent, hasEv, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, roleSwitch, head, holdWords } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const WHO = process.env.WHO || 'hunter'
console.log('jb-s24b v1', SZ, WHO)
const tag = `s24b-${WHO}-${SZ}`
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1100) }
const toast = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? t.textContent.replace(/\s+/g, ' ').trim() : null })
const rows = s => s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row, #drawerSqnList .sqm-row')].filter(r => r.getBoundingClientRect().width > 0).map(r => `${r.getAttribute('aria-checked') === 'true' ? 'CHECK ' : ''}${r.textContent.replace(/\s+/g, ' ').trim()} dis=${r.disabled || r.getAttribute('aria-disabled')}`))
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  if (WHO === 'hunter') await grant(s, 'prowler', '149', 'plan')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  if (WHO === 'hunter') { await logout(s); await signIn(s, 'ad2', 'a2') }
  await to(s, '149'); await onSeed(s)
  check('draft', await addEvent(s, 'JB-S24X'), 'JB-S24X')
  await roleSwitch(s, 'mv'); await wait(s, 400)
  await step('the list, opened', async () => {
    if (s.desk) await press(s, '#sqnMenuBtn', 'open'); else { await press(s, '#burger', 'open'); if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn', 'open2') }
    await wait(s, 300)
    const r = await rows(s); note('rows', JSON.stringify(r)); await pic(s, '01-list')
    const row = page.locator(s.desk ? '#sqnMenu .sqm-row' : '#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: /^142$/ }) }).first()
    if (await row.count()) {
      await (s.desk ? row.click() : row.tap())
      for (const ms of [40, 200, 500, 1200]) { await wait(s, ms); const st = await state(s); const q = await ask(s); note(`+${ms}: bar ${st.barMark} page ${st.page} ask ${JSON.stringify(q.msg)} toast ${JSON.stringify(await toast(s))} drawer ${st.drawerOpen}`) }
      await pic(s, '02-after-press')
    } else note('no 142 row')
  })
  await step('answer it, if asked', async () => {
    const q = await ask(s)
    if (q.msg) { await press(s, '#dlgCancel', 'stay'); await wait(s, 600); await pic(s, '03-stay'); note('after stay', JSON.stringify(await state(s))) }
    await shut(s)
    note('words', JSON.stringify(await holdWords(s)))
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
