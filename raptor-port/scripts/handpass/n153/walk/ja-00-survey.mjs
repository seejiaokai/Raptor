// ja-00: a first look at the Tracker's controls at the size given, on a clean world. Reads only.
import { mk, closeAll, finish, signIn, go, T, info, ballIds, pic, picsFor, note, step, half, state } from './ja-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('ja-00-survey v1', SZ)
picsFor('j00-' + SZ)
try {
  const s = await mk(SZ)
  await signIn(s, 'ad', 'a')
  await step('tracker', async () => {
    await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 25000 }); await s.page.waitForTimeout(1200)
    note(JSON.stringify(await T(s)))
    note((await ballIds(s)).slice(0, 12).join(' '))
    note(JSON.stringify(await info(s)))
    await pic(s, '01-tracker')
    await half(s, 'info'); await pic(s, '02-info'); await half(s, 'flow')
    note(JSON.stringify(await state(s)))
  })
  await s.ctx.close()
} finally { finish('j00-' + SZ); await closeAll() }
