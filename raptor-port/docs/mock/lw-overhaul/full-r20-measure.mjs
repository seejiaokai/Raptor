// Round 20 (22 Oct 26), his "do u also think that this is the best design for the leave war? like how things are
// arranged. is there a better way to do this" (on round 19's picture of the grid card: the Manning rows, the month
// strip, Balances and the date headings). Measures every band of the grid card, top to bottom, on round 19's top,
// for an admin and a member on a phone and an admin on a desktop, and takes full-height pictures to look at.
//   r20-now-admin-phone / -member-phone / -admin-desk    the whole first screen, round 19's top
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r20-measure.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
export const N = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const res = {}'), { newPage, signIn, DC, state, browser }, ['page', 'draw'])

// every band from the app's top bar to the first person, by what it is
export const bands = p => p.evaluate(() => {
  const pg = document.querySelector('#page-leavewar')
  const R = e => e && e.getBoundingClientRect()
  const top = R(document.querySelector('.topbar, header'))
  const nav = R(pg.querySelector('[data-zz="nav"]'))
  const row2 = R(pg.querySelector('.topbar')); const bar = R(pg.querySelector('.zz-bar'))
  const fly = [...pg.querySelectorAll('[data-testid^="fly-row-"]')].map(R).filter(r => r && r.height)
  const months = R(pg.querySelector('.monthstrip, .mstrip, [data-testid="month-strip"]') || [...pg.querySelectorAll('button')].find(b => b.textContent.trim() === 'FEB')?.parentElement)
  const head = R(pg.querySelector('[data-testid^="head-2026-01-0"]'))
  const ev = [...pg.querySelectorAll('[data-testid^="event-0-"], [data-testid^="event-1-"]')].map(R).filter(r => r && r.height)
  const first = R(pg.querySelector('[data-testid^="row-"]:not([data-testid^="row-slipway"])') || pg.querySelector('[data-testid^="row-"]'))
  const people = [...pg.querySelectorAll('[data-testid^="row-"]')].map(R).filter(r => r && r.height && r.top < innerHeight && r.bottom > 0).length
  const r = n => n == null ? null : Math.round(n)
  return { screen: innerHeight, appBar: r(R(document.querySelector('.topbar'))?.bottom), nav: nav && [r(nav.top), r(nav.bottom)], bar: bar && [r(bar.top), r(bar.bottom)],
    manning: fly.length ? [r(fly[0].top), r(fly[fly.length - 1].bottom), fly.length] : null, months: months && [r(months.top), r(months.bottom)],
    dateHead: head && [r(head.top), r(head.bottom)], events: ev.length ? [r(Math.min(...ev.map(e => e.top))), r(Math.max(...ev.map(e => e.bottom)))] : null,
    firstPerson: first && r(first.top), peopleOnScreen: people }
})

if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  for (const [w, h, touch, who, name] of [[390, 844, true, 'admin', 'admin-phone'], [390, 844, true, 'member', 'member-phone'], [1536, 860, false, 'admin', 'admin-desk']]) {
    const { ctx, p } = await N.page(w, h, touch, who)
    await N.draw(p, touch, who === 'member')
    await p.waitForTimeout(300)
    console.log(name, JSON.stringify(await bands(p)))
    await p.mouse.move(2, 2)
    await shot(p, 'r20-now-' + name)
    await ctx.close()
  }
  await browser.close(); console.log('errors:', errs)
}
