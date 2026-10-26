/* [BOARD-SIDE-WIDTH] (D1113–D1116) — the pictures of TODAY, before any change: the Scheduler Board's right panel on a
   desktop (1440 × 900, 2x) with no seat picked, a flying seat picked (the reasons under the struck pucks — his example)
   and a duty desk picked; an ATT B man filed through the app's own Inputs door (window.fileInput — writeInputs, the
   door the Inputs page uses) so his look can be seen; and Edit Schedule's week at its top and scrolled down (D1116).
   Measures the side column, the crew columns and the pucks on the way.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-today.mjs */
console.log('bsw-today v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
const noToasts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })

/* the ATT B man: the first pilot (not SANS, not archived) with nothing filed on Monday 13 Jul */
const attb = await page.evaluate(() => {
  const P = window.PEOPLE, busy = new Set(window.INPUTS.filter(i => i.date === 'Jul 13').map(i => i.person))
  const id = Object.keys(P).filter(k => P[k].seat === 'FCP' && !P[k].san && !P[k].archived && !busy.has(k)).sort((a, b) => P[a].cs.localeCompare(P[b].cs))[3]
  window.fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '2026-07-10' })
  return { id, cs: P[id].cs }
})
console.log('ATT B filed for', attb)

await go(page, 'editsched')
/* Edit Schedule's week: the top, then scrolled down (D1116) */
await page.waitForTimeout(600); await noToasts()
await page.screenshot({ path: `${SHOTS}/today-week-top.png` })
await page.evaluate(() => window.scrollTo(0, 900))
await page.waitForTimeout(400); await noToasts()
const wk = await page.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)] }
  return { scrollY: Math.round(scrollY), topbar: r('.topbar'), roster: r('.edit-board .eroster'), head: r('.edit-board .eroster .er-h') }
})
console.log('week scrolled', JSON.stringify(wk))
await page.screenshot({ path: `${SHOTS}/today-week-scrolled.png` })
await page.evaluate(() => window.scrollTo(0, 0))

/* the board, Monday */
await page.click('#eWeek [data-sbday="0"]:visible')
await page.waitForSelector('#schedBoard')
await page.waitForTimeout(700)
const M = () => page.evaluate(() => {
  const side = document.querySelector('#schedBoard .sb-side').getBoundingClientRect()
  const cols = [...document.querySelectorAll('#schedBoard .sb-roster .rcols > .rcol')].map(c => Math.round(c.getBoundingClientRect().width))
  const pk = document.querySelector('#schedBoard .sb-roster .rpuck .puck')
  const why = [...document.querySelectorAll('#schedBoard .sb-roster .rwhy')].map(w => Math.round(w.getBoundingClientRect().height))
  return { side: [Math.round(side.left), Math.round(side.width)], cols, puckW: pk ? Math.round(pk.getBoundingClientRect().width) : null, whyCount: why.length, whyTallest: Math.max(0, ...why) }
})
const shotSide = async (name) => {
  await noToasts()
  const b = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) } })
  await page.screenshot({ path: `${SHOTS}/${name}-side.png`, clip: b })
  await page.screenshot({ path: `${SHOTS}/${name}-full.png` })
  console.log(name, JSON.stringify(await M()))
}
await shotSide('today-none')

/* the ATT B man's puck, with no seat picked */
const attbLook = await page.evaluate(id => { const e = document.querySelector(`#schedBoard .sb-roster .rpuck[data-person="${id}"]`); return e ? { cls: e.className, title: e.title } : null }, attb.id)
console.log('ATT B, no seat picked', JSON.stringify(attbLook))

/* a flying FRONT seat picked: the first empty one */
const arm = async (re) => {
  const ok = await page.evaluate(src => {
    const re = new RegExp(src)
    const all = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot], #schedBoard .seat[data-slot], #schedBoard [data-fill]')].filter(e => !e.matches('.seat') || !e.querySelector('.puck[data-person]'))
    const key = e => e.dataset.slot || e.dataset.fill
    const s = all.find(e => re.test(key(e)) && e.offsetParent)
    if (!s) return 'none of ' + all.slice(0, 12).map(key).join(' ')
    s.setAttribute('data-bswpick', '1')
    s.scrollIntoView({ block: 'center' }); return key(s)
  }, re)
  if (!ok || ok.startsWith('none')) return ok
  await page.locator('#schedBoard [data-bswpick="1"]').first().click()
  await page.evaluate(() => document.querySelector('[data-bswpick]')?.removeAttribute('data-bswpick'))
  await page.waitForTimeout(500)
  return await page.evaluate(() => window.ARM && window.ARM.key)
}
/* a blank line on the first wave, through its own + Line, so a front seat stands empty to be picked */
await page.locator('#schedBoard [data-gline="0.0"]:visible').first().click(); await page.waitForTimeout(600)
console.log('armed front seat', await arm('^0\\.\\d+\\.\\d+\\.\\d+\\.p$'))
await shotSide('today-front')
const attbFront = await page.evaluate(id => { const e = document.querySelector(`#schedBoard .sb-roster .rpuck[data-person="${id}"]`); return e ? { cls: e.className, why: e.dataset.why } : null }, attb.id)
console.log('ATT B, front seat picked', JSON.stringify(attbFront))
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); x && x.click() })
await page.waitForTimeout(300)
console.log('armed duty desk', await arm('^d:0\\.'))
await shotSide('today-desk')
console.log('errors', errors.length, errors.slice(0, 5))
await browser.close()
