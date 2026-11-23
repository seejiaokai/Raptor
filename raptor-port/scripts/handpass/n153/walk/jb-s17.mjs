// jb-s17 v1 - S17: Undo and Redo waiting in another squadron, truly pressed: by the buttons, then by Tab and Enter (desktop).
// Saber; 142 has three marks, 149 one. Each reversal is read in both squadrons through the screen.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts } from './jlib.mjs'
import { dress, fp, short, wait, mark, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-s17 v1', SZ)
picsFor('s17-' + SZ)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1200) }
const U = '#trUndoBtn', R = '#trRedoBtn'
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01', 'ST-02'])
  await to(s, '149'); await dress(s, '149', ['ST-01'])
  await step('a Undo and Redo of 149 own', async () => {
    let f = await fp(s); note('149 before', short(f), JSON.stringify(f.undo))
    check('undo tip names ST-01 of 149', /ST-01/.test(f.undo?.tip || ''), f.undo?.tip)
    await press(s, U, 'a1'); f = await fp(s); check('149 Undo: done 0', f.done === 0 && f.sq === '149', short(f)); await pic(s, 'a1-149-undone')
    await press(s, R, 'a2'); f = await fp(s); check('149 Redo: done 1', f.done === 1 && f.sq === '149', short(f))
    await to(s, '142'); const g = await fp(s); check('142 untouched at 3', g.done === 3, short(g)); note('142 undo tip', g.undo?.tip)
    facts.tip142 = g.undo?.tip
  })
  await step('b Undo of 142 only', async () => {
    let f = await fp(s)
    check('on 142 the waiting Undo names a 142 mark', /ST-02/.test(f.undo?.tip || ''), f.undo?.tip)
    await press(s, U, 'b1'); f = await fp(s); check('142 Undo: done 2', f.done === 2, short(f)); await pic(s, 'b1-142-undone')
    await to(s, '149'); f = await fp(s); check('149 still 1 after 142 Undo', f.done === 1 && f.sq === '149', short(f)); note('149 undo tip', f.undo?.tip, 'redo', f.redo?.tip)
    await pic(s, 'b2-149-read')
  })
  await step('c Undo in 149, a new mark in 149, back to 142: its Redo', async () => {
    let f = await fp(s); const before = f.undo?.tip
    await press(s, U, 'c1'); f = await fp(s); check('149 Undo took its own', f.done === 0, `${before} -> ${short(f)}`)
    await mark(s, 'ACG-01', 'dco'); await wait(s, 500); f = await fp(s); check('149 new mark drawn', f.done === 1, short(f))
    note('149 after new mark: undo', f.undo?.tip, 'redo', f.redo?.tip, 'redo off', f.redo?.off)
    await to(s, '142'); f = await fp(s); note('RECORD 142 Redo after a new change on 149:', f.redo?.off, f.redo?.tip); facts.q142Redo = f.redo
    await pic(s, 'c2-142-redo-record')
    check('142 still 2', f.done === 2, short(f))
    if (!f.redo?.off) {
      await press(s, R, 'c3'); f = await fp(s); check('142 Redo acts on 142 only: 3', f.done === 3, short(f))
      await to(s, '149'); const g = await fp(s); check('149 unchanged at 1', g.done === 1, short(g)); await to(s, '142')
    }
  })
  if (SZ === 'd') await step('d by Tab and Enter', async () => {
    let f = await fp(s); const before = f.done; note('before', short(f), f.undo?.tip)
    let at = null
    await page.locator('#page-tracker').click({ position: { x: 700, y: 400 } }).catch(() => {})
    await page.keyboard.press('Escape')
    await page.evaluate(() => { document.activeElement?.blur?.() })
    for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); at = await page.evaluate(() => document.activeElement?.id || ''); if (at === 'trUndoBtn') break }
    check('Tab reaches Undo', at === 'trUndoBtn', at)
    await page.keyboard.press('Enter'); await wait(s, 700); f = await fp(s)
    check('Enter on Undo took one 142 mark', f.done === before - 1, short(f)); await pic(s, 'd1-tab-undo')
    const at2 = await page.evaluate(() => document.activeElement?.id || ''); note('focus after', at2)
    for (let i = 0; i < 3 && (await page.evaluate(() => document.activeElement?.id)) !== 'trRedoBtn'; i++) await page.keyboard.press('Tab')
    await page.keyboard.press('Enter'); await wait(s, 700); f = await fp(s)
    check('Enter on Redo put it back', f.done === before, short(f))
    await to(s, '149'); const g = await fp(s); check('149 not touched by the keys', g.done === 1, short(g))
    await page.evaluate(() => { document.activeElement?.blur?.() })
    for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); at = await page.evaluate(() => document.activeElement?.id || ''); if (at === 'trUndoBtn') break }
    await page.keyboard.press('Enter'); await wait(s, 700); const h = await fp(s); check('Enter on Undo on 149 acts on 149', h.done === 0 && h.sq === '149', short(h))
    await to(s, '142'); const i2 = await fp(s); check('142 unchanged by 149 keys', i2.done === before, short(i2))
    await to(s, '149'); await press(s, R); note('149 redone', short(await fp(s)))
  })
  await step('e survives a reload', async () => {
    if ((await fp(s)).sq !== '149') await to(s, '149')
    const f149 = await fp(s); note('149 before the reload', short(f149))
    note('reload', JSON.stringify(await reload(s)))
    const { go } = await import('./jlib.mjs'); await go(s, 'tracker'); await wait(s, 2000); let f = await fp(s); note('after reload', short(f))
    if (f.sq !== '149') await to(s, '149')
    f = await fp(s); check('149 after reload keeps its marks', f.done === f149.done, short(f)); await pic(s, 'e1-149-reloaded')
    await to(s, '142'); const g = await fp(s); check('142 after reload has its own marks', g.done >= 2 && (g.courses || []).includes('JB142') && !(g.courses || []).includes('JB149'), short(g)); await pic(s, 'e2-142-reloaded')
    note('after reload undo tip', g.undo?.tip, g.redo?.tip)
  })
  await s.ctx.close()
} finally { finish('s17-' + SZ); await closeAll() }
