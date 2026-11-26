// k0p-a-lull - Part 2 A: the Tracker's two lull pop-ups ("Set lull period — <student>", "Copy <student>'s lull periods
// to") as Saber on 142's Tracker. Each: open, picture (does the shade cover the top bar?), then the keys: Tab (and in a
// second round Shift+Tab) until the focus leaves the pop-up, logging every stop; where the focus lands on the squadron
// button, the name badge or the bell, Enter is pressed and what opens is pictured; a squadron is then picked by the keys.
//   node raptor-port/scripts/handpass/n194/k0p-a-lull.mjs
import { mk, signIn, go, FACT, closeAll, world, wait, ERRS, shot, boxOf, vis, barSq, hit } from './k0p-lib.mjs'
console.log('k0p-a-lull v1')
const T = { sqn: '#sqnMenuBtn', badge: '#roleBadge', bell: '#notifyBell, .bellbtn' }
const act = s => s.page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'BODY'; return (a.id ? '#' + a.id : a.tagName.toLowerCase() + '.' + String(a.className).split(' ')[0]) + ' "' + (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 24) + '"' + (a.closest('.lullcal') ? ' [in pop-up]' : a.closest('.topbar') ? ' [top bar]' : '') })
const which = s => s.page.evaluate(() => { const a = document.activeElement; if (!a) return null; if (a.closest('#sqnMenuBtn') || a.id === 'sqnMenuBtn') return 'sqn'; if (a.id === 'roleBadge') return 'badge'; if (a.matches('#notifyBell, .bellbtn')) return 'bell'; return a.closest('.lullcal') ? 'popup' : 'other' })
async function openTrk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await wait(s, 800); if (!(await vis(s, '#setLullBtn').count())) { const t = vis(s, 'button').filter({ hasText: /^\s*Info\s*$/ }); if (await t.count()) await hit(s, t.first(), 500) } }
async function coverage(s, key) {
  const out = {}
  for (const [n, sel] of Object.entries(T)) out[n] = await s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 1); if (!e) return 'not drawn'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e || e.contains(h) ? 'FREE (not covered)' : 'covered by ' + (h?.className || h?.tagName) }, sel)
  out.shadeBox = await boxOf(s, '.lullback'); out.screen = [s.W, s.H]
  FACT(`${key}.coverage`, out)
}
async function keysRound(s, key, back, popupSel) {
  const log = []; let hitWhat = null
  for (let i = 0; i < 80; i++) {
    await s.page.keyboard.press(back ? 'Shift+Tab' : 'Tab'); await wait(s, 60)
    const a = await act(s), w = await which(s); log.push(a)
    if (['sqn', 'badge', 'bell'].includes(w)) { hitWhat = w; break }
  }
  FACT(`${key}.${back ? 'shiftTab' : 'tab'}.stops`, { count: log.length, first: log.slice(0, 12), last: log.slice(-6), reached: hitWhat })
  return hitWhat
}
async function tryEnter(s, key, w, popupSel) {
  const before = await barSq(s)
  await shot(s, `a-${key}-focus-on-${w}-d`)
  await s.page.keyboard.press('Enter'); await wait(s, 600)
  const after = { popupStill: !!(await s.page.locator(popupSel).count()), sqnMenu: await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim())), bellList: !!(await s.page.locator('[data-testid="bell-list"]').count()), focus: await act(s), squadron: before }
  FACT(`${key}.enterOn.${w}`, after)
  await shot(s, `a-${key}-enter-${w}-d`)
  if (w === 'sqn' && after.sqnMenu.length) {
    /* pick 149 by the keys: arrows to its row, Enter */
    for (let i = 0; i < 6; i++) { const f = await s.page.evaluate(() => document.activeElement?.closest('.sqm-row')?.querySelector('.sqm-num')?.textContent.trim()); if (f === '149') break; await s.page.keyboard.press('ArrowDown'); await wait(s, 120) }
    const on = await s.page.evaluate(() => document.activeElement?.closest('.sqm-row')?.innerText.replace(/\s+/g, ' ').trim() ?? document.activeElement?.textContent?.trim().slice(0, 30))
    await s.page.keyboard.press('Enter'); await wait(s, 1200)
    FACT(`${key}.pickByKeys`, { focusedRowBeforeEnter: on, squadronBefore: before, squadronAfter: await barSq(s), popupStill: !!(await s.page.locator(popupSel).count()), page: await s.page.evaluate(() => document.querySelector('.page.on')?.id), dialogs: await s.page.evaluate(() => [...document.querySelectorAll('[role=dialog], .dlg, #dlgModal')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 160))) })
    await shot(s, `a-${key}-after-pick-d`)
  }
  if (w === 'badge') FACT(`${key}.badgeAfter`, await s.page.evaluate(() => document.querySelector('#roleBadge')?.textContent.trim()))
}
async function one(key, open, popupSel) {
  const s = await mk('d', { storageState: await world() })
  try {
    await signIn(s, 'saber'); await openTrk(s)
    FACT(`${key}.student`, await s.page.evaluate(() => document.querySelector('#page-tracker .sname, #stuSel, select')?.value || null))
    await open(s); await wait(s, 500)
    FACT(`${key}.opened`, await s.page.evaluate(sel => document.querySelector(sel)?.innerText.replace(/\s+/g, ' ').slice(0, 200) ?? null, popupSel))
    await coverage(s, key)
    await shot(s, `a-${key}-open-d`)
    /* where does the focus start */
    FACT(`${key}.focusAtOpen`, await act(s))
    const w = await keysRound(s, key, false, popupSel)
    if (w) await tryEnter(s, key, w, popupSel)
    FACT(`${key}.errs`, s.errs)
  } catch (e) { FACT(`${key}.error`, String(e).slice(0, 300)) } finally { await s.ctx.close() }
  /* the Shift+Tab round, and the other two controls, each in a fresh browser */
  for (const [k2, target] of [['back', null], ['badge', 'badge'], ['bell', 'bell']]) {
    const s2 = await mk('d', { storageState: await world() })
    try {
      await signIn(s2, 'saber'); await openTrk(s2); await open(s2); await wait(s2, 500)
      if (!target) { const w = await keysRound(s2, `${key}.${k2}`, true, popupSel); if (w) await tryEnter(s2, `${key}-back`, w, popupSel) }
      else {
        /* walk Tab until the target itself has the keys (passing the squadron button by) */
        let got = null; const log = []
        for (let i = 0; i < 90; i++) { await s2.page.keyboard.press('Tab'); await wait(s2, 50); const w = await which(s2); log.push(w); if (w === target) { got = w; break } }
        FACT(`${key}.${k2}.tabToTarget`, { reached: got, stops: log.length, kinds: [...new Set(log)] })
        if (got) await tryEnter(s2, `${key}-${k2}`, got, popupSel)
      }
    } catch (e) { FACT(`${key}.${k2}.error`, String(e).slice(0, 300)) } finally { await s2.ctx.close() }
  }
}
try {
  if (process.env.ONLY !== 'p') await one('setlull', async s => { await hit(s, '#setLullBtn', 600); const d = s.page.locator('#lullCal button:not(.sm)').filter({ hasText: /^\d+$/ }).nth(9); if (await d.count()) { await d.click(); await wait(s, 300) } }, '#lullCal')
  if (process.env.ONLY !== 'p') await one('copylull', async s => { await hit(s, '#copyLullBtn', 600); const c = s.page.locator('#lullCopy input[type=checkbox]').nth(1); if (await c.count()) { await c.click(); await wait(s, 200) } }, '#lullCopy')
  /* the phone: the pop-up and its shade, pictured */
  const p = await mk('p', { storageState: await world() })
  try { await signIn(p, 'saber'); await openTrk(p); await hit(p, '#setLullBtn', 700); await coverage(p, 'setlull.p'); await shot(p, 'a-setlull-open-p'); await p.page.locator('#lullClose').tap(); await wait(p, 400); await hit(p, '#copyLullBtn', 700); await coverage(p, 'copylull.p'); await shot(p, 'a-copylull-open-p') } catch (e) { FACT('a.p.error', String(e).slice(0, 300)) } finally { await p.ctx.close() }
} finally { FACT('errors', ERRS); await closeAll() }
