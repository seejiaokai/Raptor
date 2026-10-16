// THE MEDICAL CARDS, ROUND 2 — three cases the drawing of D965 never showed, found by the code read of 17 Oct 26, DRAWN
// on the built app before anything changes (D853). Planted in a throwaway browser only (the page's own test door):
//   1  a period across a month end — "ATT C 29 Jun – 14 Jul" — wider than a third of a phone's row;
//   2  a medically-down man with TWO documents — his card no longer says so on a phone (the "2 documents" pill went);
//   3  an upchit with FIVE documents — five page drawings in a row.
//   before — the tab as built on the branch.
//   after  — the recommendation: on a phone a card is at most a third of the row and a long period goes under its kind;
//            a down or pending card with two or more documents draws one page each; at most three pages, then "+2".
// Every "after" changes the page's own nodes (mockups-on-the-real-app.md); nothing in the app is changed.
//
//   node scripts/handpass/medical-cards-r2.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-medical-cards-r2')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log('medical-cards-r2 v1 →', OUT)
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], facts = {}

const MARK_CSS = `[data-wpn]{outline:2px solid #34c759 !important;outline-offset:2px;position:relative}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:4px;top:-9px;background:#34c759;color:#05210f;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}`

/* the three planted men: names read back for the facts */
const PLANT = () => {
  const w = window
  const docs = w.INPUTS.find(r => Array.isArray(r.docIds) && r.docIds.length >= 2)
  if (!docs) return 'NO documents on file to reuse'
  const [a, b] = docs.docIds
  const taken = new Set(w.INPUTS.filter(r => /^(ATT [BC]|OML|HL|Upchit)$/i.test(String(r.type))).map(r => String(r.person)))
  const free = Object.keys(w.PEOPLE).filter(k => w.PEOPLE[k].cs && !taken.has(k) && !w.PEOPLE[k].archived && !w.PEOPLE[k].special)
  if (free.length < 3) return 'NOT ENOUGH free men'
  const [p1, p2, p3] = free
  w.fileInput({ person: p1, type: 'ATT C', date: 'Jun 29', endDate: 'Jul 14', yr: 2026, allday: true, docId: a, docIds: [a] })
  w.fileInput({ person: p2, type: 'ATT C', date: 'Jul 10', endDate: 'Jul 12', yr: 2026, allday: true, docId: a, docIds: [a] })
  w.fileInput({ person: p2, type: 'ATT B', date: 'Jul 13', endDate: 'Jul 16', yr: 2026, allday: true, docId: b, docIds: [b] })
  w.fileInput({ person: p3, type: 'Upchit', date: 'Jul 9', yr: 2026, allday: true, docId: a, docIds: [a, b, a, b, a] })
  return [p1, p2, p3].map(k => w.PEOPLE[k].cs)
}
const DOC = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
/* the recommendation, drawn on the page's own nodes */
const AFTER = docPaths => {
  const st = document.createElement('style'); st.id = 'wp-after'
  st.textContent = `@media(max-width:820px){.medcard{max-width:calc((100% - 12px)/3)}}
.medcard-row2{flex-wrap:wrap;row-gap:2px;white-space:normal}.medcard-row2>*{white-space:nowrap}
.wp-more{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;color:var(--sec)}`
  document.head.append(st)
  const svg = () => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.innerHTML = docPaths; s.classList.add('medcard-doc'); return s }
  for (const c of document.querySelectorAll('.medcard')) {
    const n = +((c.title.match(/view (\d+) documents/) || [])[1] || 1), row2 = c.querySelector('.medcard-row2')
    const done = !!c.closest('.med-done')
    if (!done && n >= 2) for (let i = 0; i < n; i++) row2.append(svg())
    const icons = [...row2.querySelectorAll('.medcard-doc')]
    if (icons.length > 3) { icons.slice(3).forEach(e => e.remove()); const m = document.createElement('span'); m.className = 'wp-more'; m.textContent = '+' + (icons.length - 3); row2.append(m) }
  }
}
const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  document.querySelectorAll('[data-wpn]').forEach(e => e.removeAttribute('data-wpn'))
  for (const it of items) { const e = [...document.querySelectorAll('.medcard')].find(c => c.textContent.includes(it.who)); if (e) e.setAttribute('data-wpn', it.n) }
}, [items, MARK_CSS])
const measure = page => page.evaluate(() => {
  const per = sec => { const tops = [...document.querySelectorAll(`.medsec.${sec} .medcard`)].map(c => Math.round(c.getBoundingClientRect().top)); return [...new Set(tops)].map(t => tops.filter(x => x === t).length) }
  return {
    perRow: { down: per('med-down'), pend: per('med-pend'), done: per('med-done') },
    cards: [...document.querySelectorAll('.medcard')].map(c => { const r = c.getBoundingClientRect(); return c.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' docs:' + c.querySelectorAll('.medcard-doc').length }),
    spill: [...document.querySelectorAll('.medcard')].some(c => c.querySelector('.medcard-row2').scrollWidth > c.querySelector('.medcard-row2').clientWidth + 1),
  }
})
const shot = async (page, name) => {
  const clip = await page.evaluate(() => {
    let L = 1e9, T = 1e9, R = -1e9, B = -1e9
    for (const e of document.querySelectorAll('#medView .ic-head, .medsec')) { const r = e.getBoundingClientRect(); L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY) }
    return { x: Math.max(0, L - 8), y: Math.max(0, T - 14), width: R - L + 16, height: B - T + 24 }
  })
  await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true })
}

for (const size of [{ tag: 'phone', w: 390, dsf: 3, touch: true }, { tag: 'phone375', w: 375, dsf: 3, touch: true }, { tag: 'desk', w: 1440, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: 1600 }, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage(), T = size.tag
  page.on('pageerror', e => errs.push(`${T} pageerror: ` + String(e).slice(0, 200)))
  await page.goto(URL)
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  const who = await page.evaluate(PLANT); facts[T + ' planted'] = who
  if (!Array.isArray(who)) { errs.push(T + ': ' + who); await ctx.close(); continue }
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  await page.locator('#inMedBtn').click(); await page.waitForTimeout(500)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
  const items = [{ n: '1', who: who[0] }, { n: '2', who: who[1] }, { n: '3', who: who[2] }]
  facts[T + ' before'] = await measure(page)
  await mark(page, items); await shot(page, `${T}-before`)
  await page.evaluate(AFTER, DOC)
  facts[T + ' after'] = await measure(page)
  await mark(page, items); await shot(page, `${T}-after`)
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, errors: errs }, null, 1))
console.log(JSON.stringify(facts, null, 1)); console.log('errors:', errs.length); for (const e of errs) console.log('  ' + e)
await browser.close()
