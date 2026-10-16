// THE WHOLE-APP WORDS PASS (owner D808) — round 3 AS BUILT (D959, D960; 17 Oct 26): the Medical tab and the Help page
// on the built app, phone and desktop, nothing drawn on them — the "after" of the LOOK check, beside round 3's "before"
// pictures (docs/img/handpass/2026-10-16-words-pass/r3/). Asserts what the rulings say, so a PASS means correct:
//   Medically Down and Pending Upchit have no grey line; Upchit Complete keeps "the past 30 days, newest first";
//   no Medical card carries a placed line ("Placed by", a time of day); Medically Down's cards say a period
//   ("15–17 Jul" / one day "17 Jul"), Pending Upchit's "was down <period>"; Help's two lines read as answered.
//
//   node scripts/handpass/words-r3-built.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/r3-built')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], facts = {}, results = []
const check = (name, ok, got) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' — got ' + JSON.stringify(got)}`) }

async function signIn(page, to) {
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(to => window.go(to), to); await page.waitForTimeout(800)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
}
const boxOf = (page, sels, pad = 8) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  return L > R ? null : { x: Math.max(0, L - pad), y: Math.max(0, T - pad), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad }
}, [sels, pad])
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }) }

for (const size of [{ tag: 'desk', viewport: { width: 1440, height: 1400 }, dsf: 2 }, { tag: 'phone', viewport: { width: 390, height: 2000 }, dsf: 3, touch: true }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  const T = size.tag

  /* the Medical tab, pressed as a person presses it */
  await signIn(page, 'inputs')
  await page.locator('[role="tab"]:has-text("Medical"), button:has-text("Medical")').first().click(); await page.waitForTimeout(600)
  await page.evaluate(() => scrollTo(0, 0))
  const m = await page.evaluate(() => {
    const txt = s => [...document.querySelectorAll(s)].map(e => e.textContent.replace(/\s+/g, ' ').trim())
    return {
      downSub: txt('.medsec.med-down .medsec-sub'), pendSub: txt('.medsec.med-pend .medsec-sub'), doneSub: txt('.medsec.med-done .medsec-sub'),
      down: txt('.medsec.med-down .medcard-t'), pend: txt('.medsec.med-pend .medcard-t'), done: txt('.medsec.med-done .medcard-t'),
      cards: txt('.medcard'), heights: [...document.querySelectorAll('.medsec')].map(e => Math.round(e.getBoundingClientRect().height)),
    }
  })
  facts[T + ' medical'] = m
  check(`${T} Medically Down has no grey line`, m.downSub.length === 0, m.downSub)
  check(`${T} Pending Upchit has no grey line`, m.pendSub.length === 0, m.pendSub)
  check(`${T} Upchit Complete keeps its line`, m.doneSub.join() === 'the past 30 days, newest first', m.doneSub)
  check(`${T} no card says who placed it or a time`, m.cards.length > 0 && m.cards.every(c => !/Placed by|\d\d:\d\d/.test(c)), m.cards)
  const PERIOD = /^\d{1,2}(–\d{1,2})? [A-Z][a-z]{2}$|^\d{1,2} [A-Z][a-z]{2} – \d{1,2} [A-Z][a-z]{2}$/
  check(`${T} Medically Down cards say a period`, m.down.length > 0 && m.down.every(t => PERIOD.test(t)), m.down)
  check(`${T} Pending Upchit cards say "was down <period>"`, m.pend.length > 0 && m.pend.every(t => PERIOD.test(t.replace(/^was down /, '')) && t.startsWith('was down ')), m.pend)
  check(`${T} Upchit Complete cards unchanged ("upchitted <day>")`, m.done.every(t => /^upchitted \d{1,2} [A-Z][a-z]{2}$/.test(t)), m.done)
  await shot(page, `${T}-medical-built`, await boxOf(page, ['#medCalBtn', '.medsec']))

  /* Help, as an admin: both cards */
  await signIn(page, 'help')
  const h = await page.evaluate(() => ({ lead: document.querySelector('#bugFile .help-lead')?.textContent, empty: document.querySelector('#bugAdmin .help-lead')?.textContent }))
  facts[T + ' help'] = h
  check(`${T} Report a problem's line`, h.lead === 'Spotted something wrong, or something that could work better? The schedulers see every report.', h.lead)
  check(`${T} the empty Bug reports card`, h.empty === 'No reports yet.', h.empty)
  await shot(page, `${T}-help-built`, await boxOf(page, ['#bugFile', '#bugAdmin']))
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, results, errors: errs }, null, 1))
for (const r of results) console.log(r)
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
console.log(results.filter(r => r.startsWith('FAIL')).length ? 'SOME FAILED' : 'ALL PASS')
await browser.close()
