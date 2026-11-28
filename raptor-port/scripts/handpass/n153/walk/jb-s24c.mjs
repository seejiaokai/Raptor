// jb-s24c v1 - the control for jb-s24b: the same pick of 142 from the member view on 149, with NO draft; then with a draft
// the same pick by the top bar twice, by the keyboard (Enter on the row), and by the phone's menu. Reads where it lands.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, addEvent, hasEv, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, roleSwitch, holdWords } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s24c v1', SZ)
const tag = `s24c-${SZ}`
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1100) }
const bar = async s => { const st = await state(s); return `${(st.barMark || st.dMark || '').slice(0, 3)} ${st.page} ${st.badge}` }
async function build(draft) {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await grant(s, 'prowler', '149', 'plan')
  await dress(s, '142', ['ST-01', 'ACG-01'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await logout(s); await signIn(s, 'ad2', 'a2')
  await to(s, '149'); await onSeed(s)
  if (draft) check('draft', await addEvent(s, 'JB-S24C'), 'JB-S24C')
  await roleSwitch(s); await wait(s, 400)
  return s
}
try {
  await step('clean: member view on 149, pick 142', async () => {
    const s = await build(false)
    note('before', await bar(s))
    await pickSq(s, '142', 'clean-pick'); await shut(s); await wait(s, 900)
    const a = await ask(s); const b = await bar(s); note('after', b, JSON.stringify(a.msg))
    check('clean member-view pick moves to 142', b.startsWith('142'), b); await pic(s, '01-clean-after')
    await s.ctx.close()
  })
  await step('draft: same pick', async () => {
    const s = await build(true); const { page } = s
    note('before', await bar(s))
    await pickSq(s, '142', 'draft-pick'); await wait(s, 700)
    let a = await ask(s); let b = await bar(s); note('after first pick', b, JSON.stringify(a.msg)); await pic(s, '02-draft-after')
    check('draft member-view pick asks or moves', !!a.msg || b.startsWith('142'), { b, ask: a.msg })
    if (!a.msg) {
      await shut(s)
      await pickSq(s, '142', 'draft-pick2'); await wait(s, 700); a = await ask(s); b = await bar(s); note('after second pick', b, JSON.stringify(a.msg))
      if (s.desk && !a.msg) {
        await press(s, '#sqnMenuBtn'); await wait(s, 200)
        const row = page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: /^142$/ }) }).first()
        await row.focus(); await page.keyboard.press('Enter'); await wait(s, 700); a = await ask(s); b = await bar(s); note('after Enter on the row', b, JSON.stringify(a.msg))
      }
      await shut(s)
    }
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
