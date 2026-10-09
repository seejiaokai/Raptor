/* WALKER G â€” X-07: Available redefinition refreshes both calendars after a page revisit (no reload) */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x07')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const ISO = '2026-07-13'
const say = (n, o) => console.log(n, JSON.stringify(o).slice(0, 1500))
const toLW = async () => { await L.go(p, 'leavewar'); await sleep(1100); await tid('month-JUL').first().click(); await sleep(1300) }
const lwFigs = () => p.evaluate(d => Object.fromEntries(['req-p', 'req-w', 'avail-p', 'avail-w'].map(r => { const c = document.querySelector(`[data-testid="${r}-${d}"]`); return [r, c ? c.innerText.trim() : 'none'] })), ISO)
const working = async () => {
  await tid(`avail-p-${ISO}`).click(); await tid('fly-working').waitFor({ timeout: 4000 }); await sleep(300)
  const t = await p.evaluate(() => Object.fromEntries(['req', 'avail', 'sans', 'need'].map(k => [k, document.querySelector(`[data-testid="fly-working-${k}"] b`)?.innerText.trim()])))
  const f = await G.shot(p, 'working-box')
  await p.keyboard.press('Escape'); await sleep(300)
  return { ...t, f }
}
const toSans = async () => {
  await L.go(p, 'inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }
  await p.locator('#inSansMode').click(); await sleep(500)
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 24; i++) {
    const m = (await tid('sc-month').getAttribute('aria-label')).toLowerCase().split(/\s+/)
    const cur = +m[1] * 12 + MON.indexOf(m[0]), want = 2026 * 12 + 6
    if (cur === want) break
    await tid(cur < want ? 'sc-next' : 'sc-prev').click(); await sleep(150)
  }
  const need = await tid(`sc-need-${ISO}`).innerText()
  const cell = (await tid(`sc-day-${ISO}`).innerText()).replace(/\s+/g, ' ')
  await tid(`sc-day-${ISO}`).click({ position: { x: 8, y: 8 } }); await sleep(600)
  const sd = await p.evaluate(() => Object.fromEntries(['req', 'avail', 'sans', 'need'].flatMap(k => ['p', 'w'].map(s => [`${k}-${s}`, document.querySelector(`[data-testid="sd-${k}-${s}"]`)?.innerText.trim()]))))
  const f = await G.shot(p, 'sans-month-and-day')
  return { need: need.replace(/\s+/g, ' '), cell, sd, f }
}
/* ---- set up: Required P = Available + 4 on 13 Jul, typed straight into its cell ---- */
await toLW()
const f0 = await lwFigs(); say('LW figures before', f0)
const avail0 = Number(f0['avail-p'])
await tid(`req-p-${ISO}`).click(); await sleep(500)
await p.keyboard.type(String(avail0 + 4)); await p.keyboard.press('Enter'); await sleep(700); await p.keyboard.press('Escape'); await sleep(300)
const f1 = await lwFigs(); say('LW figures after typing Required P', f1)
const w1 = await working(); say('working box before', w1)
const s1 = await toSans(); say('SANS before', s1)

/* ---- the definition: try each filter, read the live preview, pick the one that takes some pilots off ---- */
await toLW()
await tid('fly-name-avail-p').click(); await sleep(700)
const formShot0 = await G.shot(p, 'form-open')
const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /-noqual-|-cat-|-qual-|-seat-/.test(t)))
say('filters', ids)
const preview = async () => (await tid('cform-preview').innerText().catch(() => '')).replace(/\s+/g, ' ')
const base = await preview(); say('preview base', base)
const num = s => { const m = /counts (\d+(?:\.\d+)?)/.exec(s); return m ? Number(m[1]) : NaN }
const b0 = num(base)
/* "CAT is not A" — the two A-category pilots (Ace, Drifter) leave the count */
await tid('cf-catmode').click(); await sleep(200)
await tid('cf-cat-A').click(); await sleep(300)
const trialPrev = await preview(); say('preview CAT is not A', trialPrev)
const pick = ['cf-cat-A', b0 - num(trialPrev)]
const fForm = await G.shot(p, 'form-filter-chosen')
const prev = await preview(); say('preview with the filter', prev)
await tid('cform-save').click(); await sleep(900)
const f2 = await lwFigs(); say('LW figures after Save', f2)
const w2 = await working(); say('working box after Save (reopened)', w2)
/* ---- back to SANS without reloading ---- */
const s2 = await toSans(); say('SANS after Save (no reload)', s2)
/* ---- Undo (top bar) and return again ---- */
const un = await G.undo(p); say('UNDO', un)
const s3 = await toSans(); say('SANS after Undo', s3)
await toLW(); const f3 = await lwFigs(); say('LW figures after Undo', f3); const w3 = await working(); say('working box after Undo', w3)
G.saveRows('x07-raw')
console.log('errors', JSON.stringify(errors))
await browser.close()
