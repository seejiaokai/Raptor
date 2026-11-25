// draw-e10 - "+ Input" on another squadron (his D2628 C2). Hunter (142's admin, Plan of 149), 149 picked, Inputs → List →
// "+ Input": its window's Person box (the app's own select).
//  e10t-d  TODAY: what the Person box starts on and offers (FACT), the window as it opens.
//  e10-d   THE CHANGE DRAWN: the box starts empty (a blank first choice, picked) and its list offers only 149's men - every
//          other choice taken out. The list is drawn OPEN by the box's own `size` (the browser draws the same select as a
//          list in the page) - a picture of the browser's own pop-up list is not possible; on his PC and iPhone the list
//          opens as the browser's own menu.
//   node raptor-port/scripts/handpass/n176/draw-e10.mjs
import { run, as, FACT, wait, reachPick, shot, box, closeAll, barSq, usersTab, words } from './draw-lib.mjs'
import { newInputWindow } from '../n175/p6-lib.mjs'
const PERSON = '#inpEditPerson'
const opts = s => s.page.evaluate(sel => { const e = document.querySelector(sel); return { picked: e.options[e.selectedIndex]?.textContent.trim() ?? null, offered: [...e.options].map(o => o.textContent.trim()) } }, PERSON)
try {
  /* 149's own men, read on 149's own Admin → Users (Kestrel's page): its people less any man of another squadron */
  let own149 = []
  await run('e10.read', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await s.page.waitForTimeout(400)
    own149 = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].filter(e => !e.querySelector('.acc-sqn')).map(e => e.querySelector('.acc-name').textContent.trim()))
  })
  FACT('e10.own149', own149)
  await run('e10', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await newInputWindow(s); await wait(s, 500)
    const t = await opts(s); FACT('e10.today', { squadron: await barSq(s), ...t, notOf149: t.offered.filter(o => o && !own149.includes(o)) })
    await shot(s, 'e10t-d-today', [await box(s, '.inpedwin')])
    const r = await s.page.evaluate(([sel, own]) => {
      const e = document.querySelector(sel)
      for (const o of [...e.options]) if (!own.includes(o.textContent.trim())) o.remove()
      const blank = document.createElement('option'); blank.value = ''; blank.textContent = ''; e.prepend(blank); e.selectedIndex = 0
      e.size = e.options.length; e.style.height = 'auto'; e.style.overflow = 'hidden'
      return { offered: [...e.options].map(o => o.textContent.trim() || '(empty - picked)'), picked: e.options[e.selectedIndex].textContent || '(empty)' }
    }, [PERSON, own149])
    FACT('e10.drawn', r)
    await wait(s, 200)
    await shot(s, 'e10-d-person', [await box(s, PERSON), await box(s, '.inpedwin .win-ttl, .inpedwin')].map((b, i) => i ? b && { ...b, h: 60 } : b))
  })
} finally { await closeAll() }
