// Multi-squadron & detachment — Round 6 (17 Nov 26, chat 97), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md. One new drawing, D2136: the Leave War's Post out sheet with
// "Transfer to Sqn" working — today (the chip greyed, "Comes with the shared database") beside proposed (the chip lit,
// a "To" row naming the squadron, the sheet's one line saying what happens on the date and one line listing what the
// admin must know before he presses Post out). Round 6's other questions reuse earlier rounds' pictures, named on the page.
// Every proposed frame adds a node marked data-mine or changes a real node's words; nothing is removed.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r6/draw.mjs
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r6'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r6/img'
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: 1px !important; position: relative; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; top: -9px; right: -4px; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
`
const manifest = {}, errs = []

async function sheetFor(sz) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  await page.goto(URL_)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(800)
  await page.addStyleTag({ content: MARK_CSS })
  // Ranger (bane): a seeded man with a sign-in; his third shown day
  const id = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-bane-"]')][2].getAttribute('data-testid'))
  const c = page.locator(`[data-testid="${id}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  if (sz === 'p') await c.tap(); else await c.click()
  await sleep(700)
  await page.locator('.bidsheet[role="dialog"] [data-testid="bid-more"]').filter({ visible: true }).last().click(); await sleep(400)
  await page.locator('[data-testid="bid-postout"]').filter({ visible: true }).last().click(); await sleep(700)
  return { ctx, page }
}
async function shot(page, file, sz, kind, caption) {
  await page.mouse.move(2, 2); await sleep(150)
  // the sheet and a little of the grid above it
  const b = await page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop(); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
  const pad = 16, vw = page.viewportSize()
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 40), width: Math.min(vw.width, b.w + 2 * pad), height: Math.min(vw.height - Math.max(0, b.y - 40), b.h + 40 + pad) }
  await page.screenshot({ path: `${OUT}/${file}`, clip })
  manifest[file] = { item: 'X', size: SIZES[sz].name, kind, caption }
  console.log('  wrote', file)
}

async function itX(sz) {
  // today
  let { ctx, page } = await sheetFor(sz)
  const day = await page.evaluate(() => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop()
    const t = s.querySelector('[data-testid$="-transfer"]')
    t.classList.add('mkq'); const g = document.createElement('span'); g.className = 'mkq-tag'; g.textContent = 'X1'; t.appendChild(g)
    return s.querySelector('.when').textContent.trim()
  })
  await shot(page, `X1-${sz}-today.png`, sz, 'today', `Today, real: Ranger's Post out sheet on the Leave War (${day}). Mark X1: "Transfer to Sqn" is drawn but greyed, "Comes with the shared database"; the lit default is Overseas Sqn ("archived, account suspended").`)
  // proposed: Transfer lit, a "To" row naming the squadron, the sheet's line and the list of what it touches
  const words = await page.evaluate(() => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop()
    for (const e of s.querySelectorAll('.mkq-tag')) e.remove(); for (const e of s.querySelectorAll('.mkq')) e.classList.remove('mkq')
    const ov = s.querySelector('[data-testid$="-overseas"]'); ov.classList.remove('on'); ov.textContent = 'Overseas Sqn'
    const t = s.querySelector('[data-testid$="-transfer"]'); t.disabled = false; t.removeAttribute('title'); t.classList.add('on'); t.textContent = '✓ Transfer to Sqn'
    t.classList.add('mkq'); const g1 = document.createElement('span'); g1.className = 'mkq-tag'; g1.textContent = 'X2'; t.appendChild(g1)
    // the "To" row: a clone of the Posting row, its own chips — every squadron made in Admin → Squadrons but his own (only 149 in the demo)
    const row = s.querySelector('.po-outcomes')
    const to = row.cloneNode(false); to.setAttribute('data-mine', '1'); to.removeAttribute('aria-label')
    const lab = row.querySelector('.lab').cloneNode(true); lab.textContent = 'To'; to.appendChild(lab)
    const ch = row.querySelector('[data-testid$="-delete"]').cloneNode(true); ch.removeAttribute('data-testid'); ch.classList.add('on'); ch.textContent = '✓ 149'; to.appendChild(ch)
    row.after(to)
    to.classList.add('mkq'); const g2 = document.createElement('span'); g2.className = 'mkq-tag'; g2.textContent = 'X3'; to.appendChild(g2)
    // the sheet's one line for the outcome, and under it one line listing what the transfer touches
    const note = [...s.querySelectorAll('.note')].find(x => /^On /.test(x.textContent.trim()))
    const d = note.textContent.trim().match(/^On ([^:]+):/)[1]
    note.textContent = `On ${d}: moves to 149, his leave, OIL, quals and inputs with him.`
    const n2 = note.cloneNode(false); n2.setAttribute('data-mine', '1')
    n2.textContent = `After ${d}: 2 lines on 142's schedule hold him (kept, as a 149 man borrowed); 1 leave approved by 142 goes to 149's Approvals.`
    note.after(n2)
    // the note sits in a wrapping row: each line takes the row's whole width, one under the other
    for (const x of [note, n2]) { x.style.flex = '1 1 100%'; x.style.maxWidth = '100%' }
    note.classList.add('mkq'); const g3 = document.createElement('span'); g3.className = 'mkq-tag'; g3.textContent = 'X4'; note.appendChild(g3)
    n2.classList.add('mkq'); const g4 = document.createElement('span'); g4.className = 'mkq-tag'; g4.textContent = 'X5'; n2.appendChild(g4)
    return { d, line1: note.firstChild.textContent, line2: n2.firstChild.textContent }
  })
  await sleep(200)
  await shot(page, `X2-${sz}-proposed.png`, sz, 'proposed', `Proposed, drawn in on the real sheet. X2: "Transfer to Sqn" pressable and lit. X3: a "To" row, a clone of the Posting row, naming the squadron — every squadron made in Admin → Squadrons except his own (only 149 in the demo). X4: the sheet's one line, "${words.line1}" X5: one line listing what the date touches, shown only when there is something: "${words.line2}" (the figures are made up for the picture). The button stays "Post out".`)
  await ctx.close()
}

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try { for (const sz of ['d', 'p']) { try { await itX(sz) } catch (e) { errs.push(`[${sz}] itX FAILED: ${e.message}`) } } }
finally { await browser.close() }
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
