// draw-r6-misc-probe - round 6 (chat 188): what the app draws today, read before drawing (scratch pictures in TMP/r6).
//   node raptor-port/scripts/handpass/n176/draw-r6-misc-probe.mjs   (ONLY=drawer,lists,lw,arch)
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, FACT, want, wait, vis, hit, usersTab, reachPick, closeAll, TMP, words, box, barSq } from './draw-r5b-lib.mjs'
import { go, newInputWindow } from '../n175/p6-lib.mjs'
const R6 = resolve(TMP, 'r6'); mkdirSync(R6, { recursive: true })
const ST6 = resolve(TMP, 'state-e6.json'), ST11 = resolve(TMP, 'state-e11.json')
const pic = (s, n) => s.page.screenshot({ path: `${R6}/${n}.png` })
try {
  if (want('drawer')) await run('drawer', 'p', async s => {
    await as(s, 'saber'); await wait(s, 500)
    await pic(s, 'p0-before')
    await hit(s, '#burger', 500); await pic(s, 'p1-menu')
    FACT('drawer.parts', await s.page.evaluate(() => ({ btn: !!document.querySelector('#drawerSqnBtn'), panel: (() => { const r = document.querySelector('#drawer .drawer-panel').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })(), num: (() => { const e = [...document.querySelectorAll('.topbar .mark .k')].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, e.textContent] })() })))
    await hit(s, '#drawerSqnBtn', 500); await pic(s, 'p2-list')
    FACT('drawer.rows', await words(s, '#drawerSqnList .sqm-row'))
    await s.page.evaluate(() => [...document.querySelectorAll('#drawerSqnList .sqm-row')].find(e => e.querySelector('.sqm-num')?.textContent.trim() === '150').setAttribute('data-x', '1'))
    await hit(s, '[data-x]', 700); await pic(s, 'p3-picked')
    FACT('drawer.afterPick', { open: await s.page.evaluate(() => document.querySelector('#drawer').classList.contains('open')), bar: await barSq(s) })
    await s.page.touchscreen.tap(s.W - 20, 500); await wait(s, 600); await pic(s, 'p4-closed')
    FACT('drawer.afterShade', { open: await s.page.evaluate(() => document.querySelector('#drawer').classList.contains('open')) })
  })
  if (want('lists')) {
    for (const sz of ['d', 'p']) await run('lists.' + sz, sz, async s => {
      await as(s, 'kestrel'); await go(s, 'editsched'); await wait(s, 1200)
      await pic(s, `${sz}-es0`)
      FACT(`lists.${sz}.signs`, await s.page.evaluate(() => [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 4).map(e => ({ label: e.getAttribute('aria-label'), opts: [...e.options].map(o => o.textContent), lab: e.closest('label')?.className, box: (() => { const r = e.closest('label').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] })() }))))
    }, { state: ST11 })
    for (const sz of ['d', 'p']) await run('person.' + sz, sz, async s => {
      await as(s, 'hunter'); await reachPick(s, 149, s.desk ? 'bar' : 'menu'); await newInputWindow(s); await wait(s, 600)
      await pic(s, `${sz}-input`)
      FACT(`person.${sz}`, await s.page.evaluate(() => { const e = document.querySelector('#inpEditPerson'); return e ? { tag: e.tagName, opts: [...e.options].map(o => o.textContent).slice(0, 60), n: e.options.length, several: !!document.querySelector('[data-testid="pp-several"]') } : 'none' }))
      if (await vis(s, '[data-testid="pp-several"]').count()) { await hit(s, '[data-testid="pp-several"]', 600); await pic(s, `${sz}-input-several`) }
    })
    await run('menus.d', 'd', async s => {
      await as(s, 'saber'); await hit(s, '#sqnMenuBtn', 500); await pic(s, 'd-sqnmenu')
      FACT('menus.sqn', await s.page.evaluate(() => { const m = document.querySelector('#sqnMenu'); const r = m.getBoundingClientRect(); return { cls: m.className, box: [r.left, r.top, r.width, r.height], rows: [...m.querySelectorAll('.sqm-row')].map(e => e.outerHTML.slice(0, 400)) } }))
      await s.page.keyboard.press('Escape'); await wait(s, 300)
      const more = await s.page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /schedule|more|⋯/i.test((b.getAttribute('aria-label') || '') + b.textContent)).map(b => (b.id || '') + '|' + (b.getAttribute('aria-label') || '') + '|' + b.textContent.trim().slice(0, 20)))
      FACT('menus.candidates', more)
    })
  }
  if (want('lw')) await run('lw', 'd', async s => {
    await as(s, 'hunter'); await go(s, 'leavewar'); await wait(s, 1500); await pic(s, 'lw0')
    FACT('lw.cells', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].slice(0, 5).map(e => e.dataset.testid)))
  })
  if (want('arch')) await run('arch', 'd', async s => {
    await as(s, 'hunter'); await usersTab(s); await wait(s, 400)
    if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400)
    await pic(s, 'arch0')
    const pid = await s.page.evaluate(() => [...document.querySelectorAll('#accArchList .acc-row[data-person]')].find(e => e.querySelector('.acc-name')?.textContent.trim() === 'Jester')?.dataset.person)
    FACT('arch.jester', pid)
    await hit(s, s.page.locator(`#accArchList [data-person="${pid}"] .acc-tap`).first(), 700)
    await pic(s, 'arch1-open')
    FACT('arch.open', await s.page.evaluate(p => { const e = document.querySelector(`#accArchList [data-person="${p}"]`); return { text: e.innerText.replace(/\s+/g, ' ').trim(), buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.id}|${b.className}|${b.textContent.trim()}|${Math.round(b.getBoundingClientRect().height)}`) } }, pid))
  }, { state: ST6 })
} finally { await closeAll() }
