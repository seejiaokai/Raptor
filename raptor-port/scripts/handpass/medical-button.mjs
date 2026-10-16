// THE MEDICAL TAB'S "+ MEDICAL" BUTTON, IN A FEW VARIATIONS (owner D963, D964 — 17 Oct 26: "design the medical input
// to look nicer. Give me a few variations … As in the medical button"), DRAWN on the built app before anything is built
// (D853). Every variation is the row's height (36, D911), the app's own button and colours — cyan is "press me" (§4),
// never the medical red — and changes only the page's own nodes (mockups-on-the-real-app.md). The cards are drawn as
// D961 proposes, so the pictures show the tab as it would be.
//   A  "+ Medical", filled, beside "as of"
//   B  "+ Medical", filled, at the row's right end
//   C  "+ Medical", outlined in cyan, at the row's right end
//   D  the Medical tab's own icon + "Medical", filled, at the row's right end
//
//   node scripts/handpass/medical-button.mjs [out dir]        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-medical-cards/button')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errs = [], facts = {}

/* the button, drawn into the row beside "as of" */
const DRAW = v => {
  document.querySelectorAll('.wp-door').forEach(e => e.remove())
  const head = document.querySelector('#medView .ic-head'), cal = document.getElementById('medCalBtn')
  const cb = getComputedStyle(cal)
  const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn wp-door'
  Object.assign(b.style, { height: cb.height, minHeight: cb.height, paddingBlock: '0', paddingInline: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: cb.fontSize, whiteSpace: 'nowrap' })
  /* the row already ends in a stretching gap (MedicalView.tsx) — a right-end button goes after it */
  const spacer = [...head.children].find(e => e.tagName === 'SPAN' && e.style.flex)
  if (v === 'A') b.style.marginLeft = '8px'
  if (v === 'C') {
    Object.assign(b.style, { background: 'transparent', color: 'var(--accent)', borderColor: 'var(--accent)' })
    b.textContent = '+ Medical'
  } else {
    b.classList.add('primary')
    if (v === 'D') {
      /* the tab's own drawing, taken from the Medical tab button itself */
      const icon = document.querySelector('#inMedBtn svg')
      if (icon) { const c = icon.cloneNode(true); Object.assign(c.style, { width: '15px', height: '15px', flex: 'none' }); b.append(c) }
      b.append('Medical')
    } else b.textContent = '+ Medical'
  }
  if (v === 'A' || !spacer) cal.after(b); else spacer.after(b)
  const r = b.getBoundingClientRect(), hr = head.getBoundingClientRect()
  return { size: Math.round(r.width) + 'x' + Math.round(r.height), right: Math.round(hr.right - r.right), headH: Math.round(hr.height), calH: Math.round(cal.getBoundingClientRect().height) }
}
/* D961's proposed cards, so the tab looks as it would (the same drawing as medical-cards.mjs) */
const CARDS = docPaths => {
  for (const card of document.querySelectorAll('.medcard')) {
    const sec = card.closest('.medsec'), top = card.querySelector('.medcard-top'), type = card.querySelector('.medcard-type')
    const line = card.querySelector('.medcard-t'), docn = card.querySelector('.medcard-docn')
    const row = document.createElement('span'); Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' })
    if (sec.classList.contains('med-done')) {
      type.remove(); line.textContent = line.textContent.replace(/^upchitted /, ''); row.append(line)
      const n = docn ? parseInt(docn.textContent, 10) || 1 : 0
      for (let i = 0; i < n; i++) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2')
        s.innerHTML = docPaths; Object.assign(s.style, { width: '11px', height: '11px', color: '#4ade80', flex: 'none' }); row.append(s)
      }
      if (docn) docn.remove()
    } else { if (sec.classList.contains('med-pend')) line.textContent = line.textContent.replace(/^was down /, ''); row.append(type, line) }
    top.after(row)
  }
}
const DOC = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
const boxOf = (page, sels, pad = 10) => page.evaluate(([sels, pad]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1) continue
    L = Math.min(L, r.left + scrollX); T = Math.min(T, r.top + scrollY); R = Math.max(R, r.right + scrollX); B = Math.max(B, r.bottom + scrollY)
  }
  return L > R ? null : { x: Math.max(0, L - pad), y: Math.max(0, T - pad), width: Math.min(document.documentElement.scrollWidth, R + pad) - Math.max(0, L - pad), height: B - T + 2 * pad }
}, [sels, pad])

for (const size of [{ tag: 'phone', viewport: { width: 390, height: 1100 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 900 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${size.tag} pageerror: ` + String(e).slice(0, 200)))
  const T = size.tag
  await page.goto(URL)
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
  await page.locator('button:has-text("Medical")').first().click(); await page.waitForTimeout(600)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none'; scrollTo(0, 0) })
  await page.evaluate(CARDS, DOC)
  for (const v of ['A', 'B', 'C', 'D']) {
    facts[`${T} ${v}`] = await page.evaluate(DRAW, v)
    /* the tabs above, the row, and the first section — where the button meets the eye */
    await page.screenshot({ path: join(OUT, `${T}-${v}.png`), clip: await boxOf(page, ['#inMedBtn', '#medView .ic-head', '.medsec.med-down']), fullPage: true })
  }
  await ctx.close()
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify({ ...facts, errors: errs }, null, 1))
console.log(JSON.stringify({ ...facts, errors: errs }, null, 1))
await browser.close()
