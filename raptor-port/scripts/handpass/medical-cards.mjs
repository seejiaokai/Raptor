// THE MEDICAL TAB'S CARDS, THREE A ROW, AND ITS TITLE (owner D961, D962 — 17 Oct 26), DRAWN on the built app before
// anything is built (D853). One throwaway browser per size; a third man is filed medically down on 13 Jul in THAT browser
// only (the page's own test door, `fileInput`), so a full row of three is a real row of the app's own cards.
//   before — the tab as built today, same data.
//   after  — (1) each card: the puck alone on its row, the kind and the period on the row under it, so a card is as
//            wide as its puck and three stand in a row; (2) Pending Upchit: "was down" goes ("6–9 Jul"); (3) Upchit
//            Complete: "Upchit" and "upchitted" go, "2 documents" becomes two of the app's document drawings after the
//            date; (4) the title "Add a medical input on the Inputs tab." beside the "as of" button.
// Every "after" changes the page's own nodes (mockups-on-the-real-app.md); nothing in the app is changed.
//
//   node scripts/handpass/medical-cards.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-medical-cards')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], facts = {}
const TITLE = 'Add a medical input on the Inputs tab.'

const MARK_CSS = `[data-wpn]{outline:2px solid #34c759 !important;outline-offset:2px;border-radius:4px;position:relative}
[data-wpn]::before{content:attr(data-wpn);position:absolute;left:calc(100% + 7px);top:50%;transform:translateY(-50%);background:#34c759;color:#05210f;font:700 11px/15px system-ui;letter-spacing:0;text-transform:none;padding:0 5px;border-radius:3px;white-space:nowrap;z-index:5}
[data-wpn=""]::before{display:none}`

/* the proposed cards and title, drawn on the page's own nodes */
const AFTER = ([title, docPaths]) => {
  const head = document.querySelector('#medView .ic-head')
  const t = document.createElement('span'); t.className = 'wp-title'; t.textContent = title
  Object.assign(t.style, { fontSize: '13px', color: 'var(--ink-2)', marginLeft: '12px', alignSelf: 'center', lineHeight: '1.3' })
  document.getElementById('medCalBtn').after(t)
  for (const card of document.querySelectorAll('.medcard')) {
    const sec = card.closest('.medsec'), top = card.querySelector('.medcard-top'), type = card.querySelector('.medcard-type')
    const line = card.querySelector('.medcard-t'), docn = card.querySelector('.medcard-docn')
    const row = document.createElement('span'); row.className = 'wp-row2'
    Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' })
    if (sec.classList.contains('med-done')) {
      type.remove()
      line.textContent = line.textContent.replace(/^upchitted /, '')
      row.append(line)
      const n = docn ? parseInt(docn.textContent, 10) || 1 : 0
      for (let i = 0; i < n; i++) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor')
        s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round')
        s.innerHTML = docPaths; Object.assign(s.style, { width: '11px', height: '11px', color: getComputedStyle(sec).getPropertyValue('--ok') || '#4ade80', flex: 'none' })
        s.classList.add('wp-doc'); row.append(s)
      }
      if (docn) docn.remove()
    } else {
      if (sec.classList.contains('med-pend')) line.textContent = line.textContent.replace(/^was down /, '')
      row.append(type, line)
    }
    top.after(row)
  }
}
const DOC = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'

const mark = (page, items) => page.evaluate(([items, css]) => {
  if (!document.getElementById('wp-css')) { const s = document.createElement('style'); s.id = 'wp-css'; s.textContent = css; document.head.append(s) }
  for (const it of items) [...document.querySelectorAll(it.sel)].filter(e => e.getBoundingClientRect().width > 1).forEach((e, i) => e.setAttribute('data-wpn', i ? '' : it.n))
}, [items, MARK_CSS])
const boxOf = (page, sels, pad = 10) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  return L > R ? null : { x: Math.max(0, L - pad), y: Math.max(0, T - pad), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad + 18 }
}, [sels, pad])
const shot = async (page, name, clip) => { if (!clip) { errs.push(name + ': nothing to clip'); return } await page.screenshot({ path: join(OUT, name + '.png'), clip, fullPage: true }) }
const measure = page => page.evaluate(() => {
  const per = sec => { const tops = [...document.querySelectorAll(`.medsec.${sec} .medcard`)].map(c => Math.round(c.getBoundingClientRect().top)); return [...new Set(tops)].map(t => tops.filter(x => x === t).length) }
  const tl = document.querySelector('.wp-title')
  return {
    perRow: { down: per('med-down'), pend: per('med-pend'), done: per('med-done') },
    cards: [...document.querySelectorAll('.medcard')].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) }),
    lines: [...document.querySelectorAll('.medcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim()),
    title: tl ? { w: Math.round(tl.getBoundingClientRect().width), h: Math.round(tl.getBoundingClientRect().height) } : null,
    head: Math.round(document.querySelector('#medView .ic-head').getBoundingClientRect().height),
  }
})

for (const size of [{ tag: 'phone', viewport: { width: 390, height: 1400 }, dsf: 3, touch: true }, { tag: 'phone375', viewport: { width: 375, height: 1400 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 1000 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size.tag} console: ` + m.text().slice(0, 200)) })
  const T = size.tag
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* a third man down on 13 Jul, in this throwaway browser only — someone not already on the tab */
  facts[T + ' planted'] = await page.evaluate(() => {
    const w = window
    if (typeof w.fileInput !== 'function') return 'NO fileInput'
    const taken = new Set(w.INPUTS.filter(r => /^(ATT [BC]|OML|HL|Upchit)$/i.test(String(r.type))).map(r => String(r.person)))
    const pid = Object.keys(w.PEOPLE).find(k => w.PEOPLE[k].cs && !taken.has(k) && !w.PEOPLE[k].archived)
    w.fileInput({ person: pid, type: 'HL', date: 'Jul 12', endDate: 'Jul 15', yr: 2026, allday: true }); if (w.notify) w.notify()
    return w.PEOPLE[pid].cs
  })
  if (String(facts[T + ' planted']).startsWith('NO')) errs.push(T + ': could not file the third man')
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
  await page.locator('button:has-text("Medical")').first().click(); await page.waitForTimeout(600)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
  facts[T + ' before'] = await measure(page)
  await shot(page, `${T}-before`, await boxOf(page, ['#medView .ic-head', '.medsec']))
  await page.evaluate(AFTER, [TITLE, DOC])
  facts[T + ' after'] = await measure(page)
  await mark(page, [{ n: '', sel: '.medsec.med-down .medcard' }, { n: '1', sel: '.medsec.med-down .medcard:last-child' }, { n: '2', sel: '.medsec.med-pend .wp-row2' }, { n: '3', sel: '.medsec.med-done .wp-row2' }, { n: '4', sel: '.wp-title' }])
  await shot(page, `${T}-after`, await boxOf(page, ['#medView .ic-head', '.medsec']))
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, errors: errs }, null, 1))
console.log(JSON.stringify(facts, null, 1))
console.log('errors:', errs.length); for (const e of errs) console.log('  ' + e)
await browser.close()
