// draw-e5 - a master admin's primary open (his D2631). Saber, Admin → Users, his "All squadrons" view - today the Filter's
// Squadron ticks 142, 149 and 150 (D2270), which group the list under each squadron's heading. THE CHANGE DRAWN: 142 (his
// primary) stands open as today; 149's and 150's groups folded under a closed heading each, W.folded(n, count), cloned
// from Admin → Users' own "▸ Archived" heading (on this page - 142 holds an archived Ace). Each count is that squadron's
// own, as today's grouped heading gives it.
//  e5t-d               today's grouped view, for comparison (the top of the list)
//  e5-d-primary-top    the top of the list: 142's heading, open
//  e5-d-primary-open   the foot of 142's people: 149 and 150 folded under them, then "▸ Archived"
//   node raptor-port/scripts/handpass/n176/draw-e5.mjs
import { run, as, W, FACT, wait, vis, hit, usersTab, shot, box, words, closeAll } from './draw-lib.mjs'
try {
  await run('e5', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    await hit(s, '#accFilter', 500)
    FACT('e5.filterPanel', await words(s, '#accFilterPanel'))
    for (const n of ['142', '149', '150']) {
      const c = vis(s, '#accFilterPanel button').filter({ hasText: new RegExp('^(✓ )?' + n + '$') })
      if (await c.count()) await hit(s, c.first(), 300); else FACT('e5.noChip', n)
    }
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    if (await vis(s, '#accFilterPanel').count()) await hit(s, '#accFilter', 400)
    await s.page.evaluate(() => document.activeElement?.blur())   // the keys' ring off the Filter button, as after a mouse press elsewhere
    const heads = await words(s, '[data-unit-head]')
    FACT('e5.today.groups', { showing: await words(s, '.od-showing, [data-testid="users-showing"]'), heads })
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    await shot(s, 'e5t-d-today-grouped', [await box(s, '.od-head')].map(b => ({ ...b, h: 700 })))
    const arch = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    const counts = Object.fromEntries(heads.map(h => h.split('·').map(x => x.trim())))
    const labels = { '149': W.folded('149', counts['149']), '150': W.folded('150', counts['150']) }
    const r = await s.page.evaluate(({ arch, labels }) => {
      const out = []
      for (const g of [...document.querySelectorAll('[data-testid="acc-groups"] > div')]) {
        const h = g.querySelector('[data-unit-head]'); if (!h) continue
        const num = h.textContent.split('·')[0].trim()
        if (!labels[num]) { out.push(num + ' open, as today: ' + h.textContent); continue }
        const t = document.createElement('div'); t.innerHTML = arch; const blk = t.firstElementChild
        blk.id = 'n176fold' + num; blk.querySelector('#accArchList')?.remove()
        const b = blk.querySelector('button'); b.id = 'n176foldBtn' + num; b.setAttribute('aria-expanded', 'false'); b.textContent = labels[num]
        g.replaceWith(blk); out.push(num + ' folded: ' + labels[num])
      }
      return out
    }, { arch, labels })
    FACT('e5.drawn', r)
    FACT('e5.folds', await words(s, '[id^=n176foldBtn]'))
    await s.page.evaluate(() => { const a = document.querySelector('#n176fold149').getBoundingClientRect(); scrollBy(0, a.top - 520) }); await wait(s, 300)
    const a = await box(s, '#n176fold149'), b = await box(s, '#accArchived')
    await shot(s, 'e5-d-primary-open', [{ x: 607, y: a.y - 300, w: 584, h: (b ? b.y + b.h : a.y + 120) - (a.y - 300) }])
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    FACT('e5.top', await words(s, '[data-unit-head]'))
    await shot(s, 'e5-d-primary-top', [await box(s, '.od-head')].map(b => ({ ...b, h: 420 })))
  })
} finally { await closeAll() }
