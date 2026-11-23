// jb-s18 v1 - S18: rapid picks while the Tracker first loads, after it has loaded, and while it is hidden. Saber; 142, 149 and a
// new squadron 151 made through Admin, each with its own course and marks. The last pick must win, the next mark lands there.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, go, state, ask, logout } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, mark, makeSquadron, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s18 v1', SZ)
const tag = `s18-${SZ}`
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
/* picks one straight after another, nothing waited for between them; a phone's menu stays open at a clean pick */
async function rapid(s, seq) {
  const { page } = s; const out = []
  for (const u of seq) {
    try {
      if (s.desk) {
        await page.locator('#sqnMenuBtn').filter({ visible: true }).first().click({ timeout: 2000 })
        await page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${u}$`) }) }).first().click({ timeout: 2000 })
      } else {
        if (!(await state(s)).drawerOpen) await page.locator('#burger').tap({ timeout: 2000 })
        if (!(await page.locator('#drawerSqnList').count())) await page.locator('#drawerSqnBtn').tap({ timeout: 2000 })
        await page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${u}$`) }) }).first().tap({ timeout: 2000 })
      }
      out.push(u)
    } catch (e) { out.push(`${u}:FAILED ${String(e).split('\n')[0].slice(0, 70)}`) }
  }
  return out
}
const WANT = { 142: 3, 149: 1, 151: 2 }
/* the chart drawn matches the bar, the course list is that squadron's alone, its marks are its own */
async function judge(s, label, last) {
  await shut(s)
  let f = await fp(s); note(`${label} at once: ${short(f)}`)
  await wait(s, 1800); f = await fp(s); note(`${label} settled: ${short(f)}`)
  const g = await onSeed(s)
  check(`${label}: bar shows ${last}`, (g.sq || '').startsWith(last), g.sq)
  check(`${label}: course list is ${last}'s alone`, (g.courses || []).includes('JB' + last) && (g.courses || []).every(c => !/^JB/.test(c) || c === 'JB' + last), g.courses)
  if (g.done != null) check(`${label}: marks are ${last}'s (${WANT[last]})`, g.done === WANT[last], short(g))
  return g
}
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  check('made 151', await makeSquadron(s, '151'), '151')
  await to(s, '142'); await dress(s, '142', ['ST-01', 'ACG-01', 'ST-02'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await to(s, '151'); const f151 = await dress(s, '151', ['ST-01', 'ACG-01'])
  note('151 dressed', short(f151))
  WANT[151] = f151.done ?? 0
  await step('first opening: 142, 149, 151', async () => {
    await reload(s); await go(s, 'tracker')           // the Tracker's first load, the picks straight on top of it
    note('sequence', JSON.stringify(await rapid(s, ['142', '149', '151'])))
    await pic(s, 'a1-right-after'); const g = await judge(s, 'a', '151'); await pic(s, 'a2-settled')
    const before = g.done
    if (g.done != null) { await mark(s, 'ST-02', 'dco'); await wait(s, 500); const h = await fp(s); check('a: the next mark lands on 151', h.sq === '151' && h.done === before + 1, short(h)); await pic(s, 'a3-after-mark'); WANT[151] = h.done }
    await to(s, '142'); const x = await onSeed(s); check('a: 142 kept its own after that mark', x.done === WANT[142], short(x))
    await to(s, '149'); const y = await onSeed(s); check('a: 149 kept its own after that mark', y.done === WANT[149], short(y))
  })
  await step('first opening: 142, 149, 142', async () => {
    await reload(s); await go(s, 'tracker')
    note('sequence', JSON.stringify(await rapid(s, ['142', '149', '142'])))
    await pic(s, 'b1-right-after'); await judge(s, 'b', '142'); await pic(s, 'b2-settled')
  })
  await step('after the first load: 149, 151, 142, 149', async () => {
    await onSeed(s); await wait(s, 800)
    note('sequence', JSON.stringify(await rapid(s, ['149', '151', '142', '149'])))
    await judge(s, 'c', '149'); await pic(s, 'c1-settled')
  })
  await step('Tracker hidden: 151, 142, 149, 151, then open it', async () => {
    await go(s, 'viewsched'); await wait(s, 500)
    note('sequence', JSON.stringify(await rapid(s, ['151', '142', '149', '151'])))
    await shut(s); await go(s, 'tracker'); await wait(s, 300)
    await pic(s, 'd1-right-after'); await judge(s, 'd', '151'); await pic(s, 'd2-settled')
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
