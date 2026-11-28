// v0 — a look round before the scenarios: Saber gives Ranger View of 149; Ranger on the phone opens ☰, the mark, picks 149.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, menuPick, grant, finish, note } from './vlib.mjs'
console.log('v0-explore v1')
picsFor('v0')
await serve()
try {
  const s = await newPage(process.env.SZ || 'p')
  await signIn(s, 'ad', 'a')
  await step('grant', () => grant(s, 'bane', '149', 'view'))
  await as(s, 'us', 'us')
  await step('look', async () => {
    await rec(s, 'home')
    await openMenu(s, '01-menu')
    await rec(s, 'menu-open'); await pic(s, '01-menu')
    await press(s, '#drawerSqnBtn', '02-mark')
    await rec(s, 'list-open'); await pic(s, '02-list')
    await menuPick(s, '149', '03-pick')
    await rec(s, 'after-pick'); await pic(s, '03-after-pick')
  })
  await s.ctx.close()
} finally { finish('v0'); await stop() }
