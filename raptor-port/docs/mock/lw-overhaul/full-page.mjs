// Pictures 1–3: the page today and proposed — the member's phone, the admin's phone, the admin's desktop.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, errs, OUT, gridTo } from './full-lib.mjs'
import { injectCss, waitingRuns, proposeCells, proposeTop, renameFigures, lockDays, management, figOf } from './full-propose.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
// what today's "+1" hides on Warden's Fri 23 Jan: his PM LL beside the AM OIL (both waiting)
const EXTRA = { 'cell-nact-2026-01-23': [{ code: 'OIL', cls: 'c', half: 'am' }, { code: 'LL', cls: 'c', half: 'pm' }] }
const LOCKED = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']

async function scene({ name, w, h, touch, who, phone, admin, date, mgmt }) {
  const { ctx, p } = await newPage(browser, w, h, touch, state)
  await signIn(p, who)
  await gridTo(p, date); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  await shot(p, `t-${name}`)
  const runs = await waitingRuns(p)
  const waiting = runs.length + 1 // + Warden's PM LL behind today's "+1"
  const me = who === 'admin' ? 'stiff' : 'bane'
  const lve = await figOf(p, me)
  const mine = runs.filter(r => r.id === me).length
  const next = who === 'admin' ? ['LL Fri 30 Jan', '30 Jan'] : ['LL Mon 19 Jan', '19 Jan']
  await injectCss(p)
  await proposeTop(p, { admin, phone, waiting, locks: 2, myLeave: { lve, oil: 0, waiting: mine, next: next[0], nextShort: next[1] } })
  await gridTo(p, date); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
  // drawn after the last scroll: a sideways scroll repaints the grid's rows and figures
  await proposeCells(p, EXTRA)
  await renameFigures(p)
  await lockDays(p, LOCKED, !admin)
  if (mgmt) console.log('management rows moved:', await management(p, ['Reaper', 'Saber']))
  await shot(p, `p-${name}-clean`)
  // marks
  let n = 1
  const T = (t) => phone ? String(n++) : `${n++} ${t}`
  const o = (x) => phone ? { num: true } : x
  if (admin) await mark(p, '.zz-appr', T('NEW Approvals'), o({ below: true }))
  await mark(p, '.zz-lock', T('NEW lock dates'), o({ below: true }))
  await mark(p, '.zz-my', T('My leave (D1141)'), o({ below: true }))
  await mark(p, '[data-testid="figures-toggle"]', T('Balances'), o({ below: true }))
  if (mgmt) await mark(p, '.zz-mgmt .grphd', T('Management first'), o({ below: false }))
  await mark(p, '[data-testid="cell-shaft-2026-01-20"]', T('AM / PM halves'), phone ? { num: true, below: true } : { below: false, off: 1 })
  await mark(p, '[data-testid="cell-bane-2026-01-26"]', T('waiting: dashed'), phone ? { num: true, below: true } : { below: true, off: 1 })
  console.log(name, 'waiting runs', waiting, 'my LVE', lve, 'mine', mine)
  await shot(p, `p-${name}`)
  await unmark(p)
  if (phone) {
    // the same page scrolled to the busy rows
    await p.evaluate(() => { const r = document.querySelector('[data-testid="row-dice"]'); window.scrollBy(0, r.getBoundingClientRect().top - 330) }); await p.waitForTimeout(300)
    await shot(p, `p-${name}-busy`)
  }
  await ctx.close()
}
await scene({ name: 'phone-member', w: 390, h: 844, touch: true, who: 'member', phone: true, admin: false, date: '2026-01-21' })
await scene({ name: 'phone-admin', w: 390, h: 844, touch: true, who: 'admin', phone: true, admin: true, date: '2026-01-21' })
await scene({ name: 'desk-admin', w: 1536, h: 860, touch: false, who: 'admin', phone: false, admin: true, date: '2026-01-01', mgmt: true })
await browser.close(); console.log('errors:', errs)
