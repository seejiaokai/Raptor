// jb-s25 v1 - S25: Hunter's rights over 149 changed by Saber while Hunter sits on 149's Tracker. Part A: two live tabs (two
// devices that do not sync): the stale tab's behaviour is RECORDED, then a reload is judged. Part B: the same by sign-out and
// sign-in in one tab. Three changes: Plan to View, access removed, master admin removed.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, facts, as, grant, go, state, ask, logout, admCat, openRow } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, mark, reload } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const CASES = (process.env.CASES || 'view,none,master').split(',')
const tag = `s25-${SZ}-${CASES.join('-')}`   // one folder per case: a later case's run must not empty an earlier one's pictures
console.log('jb-s25 v1', SZ, CASES.join(','))
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const list = async s => { const st = await state(s); return { sq: (st.barMark || st.dMark || '').slice(0, 3), page: st.page, tabs: st.tabs.length ? st.tabs : st.items } }
async function role(s, pid, v) {
  await admCat(s, 'Users'); await openRow(s, pid)
  await s.page.selectOption('#accEdRole', v); await wait(s, 200)
  await s.page.locator('#accEdSave').click(); await wait(s, 700)
  note('role of', pid, 'set to', v)
}
/* Saber's own read of 149's marks: what really is in the store */
async function saberReads(s, label) {
  await to(s, '149'); const f = await onSeed(s); note(`${label}: Saber reads 149: ${short(f)}`); return f
}
async function apply(s, c) {
  if (c === 'view') await grant(s, 'prowler', '149', 'view')
  else if (c === 'none') await grant(s, 'prowler', '149', 'none')
  else await role(s, 'prowler', 'admin')
}
async function give(s, c) {
  if (c === 'master') await role(s, 'prowler', 'master')
  else await grant(s, 'prowler', '149', 'plan')
}
try {
  for (const c of CASES) await step(`A two tabs: ${c}`, async () => {
    const s = await newPage(SZ); const { page } = s
    await signIn(s, 'ad', 'a'); await give(s, c)
    await dress(s, '142', ['ST-01']); await to(s, '149'); await dress(s, '149', ['ST-01', 'ACG-01'])
    await logout(s); await signIn(s, 'ad2', 'a2')
    await to(s, '149'); const h0 = await onSeed(s); note('Hunter on 149', short(h0)); check(`${c}: Hunter on 149's Tracker`, h0.sq === '149', short(h0))
    // the second device: Saber
    const p2 = await s.ctx.newPage(); const s2 = { ctx: s.ctx, page: p2, sz: s.sz, desk: s.desk }
    await signIn(s2, 'ad', 'a'); await apply(s2, c); await wait(s2, 400); await pic(s2, `A-${c}-1-saber-saved`)
    // the stale first tab
    await page.bringToFront(); await wait(s, 400)
    const st = await fp(s); note(`RECORD ${c} stale tab, before any press: ${short(st)}`); await pic(s, `A-${c}-2-stale`)
    const ok = await mark(s, 'ST-02', 'dco'); await wait(s, 600)
    const af = await fp(s); const toast = await page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim() || '')
    note(`RECORD ${c} stale tab, a mark pressed (${ok}): ${short(af)}; note "${toast}"; band ${JSON.stringify(af.bands)}`); await pic(s, `A-${c}-3-stale-mark`)
    facts[`s25-stale-${c}`] = { before: short(st), after: short(af), toast, bands: af.bands }
    // refreshed: Hunter reloads and signs in again
    await reload(s, 'ad2', 'a2'); const h1 = await list(s); note(`${c} after reload`, JSON.stringify(h1)); await pic(s, `A-${c}-4-reloaded`)
    await page.locator('#sqnMenuBtn').filter({ visible: true }).count()
    if (c === 'view') {
      await to(s, '149'); const v = await list(s); check('view: 149 offers no Tracker after the refresh', !v.tabs.includes('tracker') && v.sq === '149', v); await pic(s, `A-${c}-5-on149`)
    } else if (c === 'none') {
      const r = await pickSq(s, '149'); await shut(s); const v = await list(s); check('none: no way into 149 after the refresh', v.sq !== '149', { r, v }); await pic(s, `A-${c}-5-no149`)
    } else {
      /* he held 149 only through being a master admin: with that gone 149 is not his to pick at all, or at most View */
      const r = await pickSq(s, '149'); await shut(s); await wait(s, 700); const v = await list(s); note('master gone: pick of 149 pressed', r, JSON.stringify(v))
      check('master gone: no Tracker of 149 after the refresh', v.sq !== '149' || !v.tabs.includes('tracker'), { r, v }); await pic(s, `A-${c}-5-on149`)
    }
    await p2.close()
    await logout(s); await signIn(s, 'ad', 'a'); const r = await saberReads(s, c); await pic(s, `A-${c}-6-saber-reads`)
    facts[`s25-store-${c}`] = short(r); note(`RECORD ${c}: 149 in the store after the stale tab's press: done ${r.done} (it had ${h0.done})`)
    await s.ctx.close()
  })
  for (const c of CASES) await step(`B one tab: ${c}`, async () => {
    const s = await newPage(SZ)
    await signIn(s, 'ad', 'a'); await give(s, c)
    await dress(s, '142', ['ST-01']); await to(s, '149'); await dress(s, '149', ['ST-01', 'ACG-01'])
    await logout(s); await signIn(s, 'ad2', 'a2'); await to(s, '149'); await onSeed(s)
    await as(s, 'ad', 'a'); await apply(s, c)
    await as(s, 'ad2', 'a2'); const h = await list(s); note(`${c} one tab, back in`, JSON.stringify(h))
    check(`${c}: Hunter lands in 142`, h.sq === '142', h)
    if (c === 'view') {
      await to(s, '149'); const v = await list(s); check(`${c}: 149 shows View-only pages only`, v.sq === '149' && !v.tabs.includes('tracker') && !v.tabs.includes('editsched'), v); await pic(s, `B-${c}-1`)
    } else {
      const has = await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-num, #drawerSqnList .sqm-num')].map(e => e.textContent.trim()))
      const r = await pickSq(s, '149'); await shut(s); const v = await list(s); check('none: 149 not reachable', v.sq !== '149', { has, r, v }); await pic(s, `B-${c}-1`)
    }
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
