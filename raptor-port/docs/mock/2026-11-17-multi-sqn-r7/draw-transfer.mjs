// Multi-squadron & detachment — Round 7, the transfer sheet's choices (17 Nov 26, chat 99), drawn on the REAL running
// app by .claude/skills/brainstorming/mockups-on-the-real-app.md. His idea (chat 99): when "Transfer to Sqn" is picked,
// the sheet offers a few decisions — "does he still have access to 142" and the like. Drawn here: round 6's X sheet with
// the choices as chip rows, each a clone of the sheet's own "Posting" row: T1 "142 access" (None / View / Scheduler),
// T2 "142 lines" (Keep him / Take him off, only when 142's lines after the date hold him), T3 "In 149" (Member /
// Scheduler / Admin, only for an admin of both squadrons or a master admin). Variant A: the recommended defaults;
// variant B: "View" and "Take him off" picked, X5's lines changing with them. Figures made up for the picture.
// Every proposed frame adds nodes marked data-mine or changes a real node's words; nothing is removed.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-transfer.mjs
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, readFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
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
const MF = `${OUT}/manifest.json`
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, 'utf8')) : {}
const errs = []

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
  const b = await page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop(); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
  const pad = 16, vw = page.viewportSize()
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 40), width: Math.min(vw.width, b.w + 2 * pad), height: Math.min(vw.height - Math.max(0, b.y - 40), b.h + 40 + pad) }
  await page.screenshot({ path: `${OUT}/${file}`, clip })
  manifest[file] = { item: 'T', size: SIZES[sz].name, kind, caption }
  console.log('  wrote', file)
}

// variant: 'A' the recommended defaults, 'B' View + Take him off
async function itT(sz, variant) {
  const { ctx, page } = await sheetFor(sz)
  const words = await page.evaluate((variant) => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop()
    const mark = (el, tag) => { el.classList.add('mkq'); const g = document.createElement('span'); g.className = 'mkq-tag'; g.textContent = tag; el.appendChild(g) }
    const ov = s.querySelector('[data-testid$="-overseas"]'); ov.classList.remove('on'); ov.textContent = 'Overseas Sqn'
    const t = s.querySelector('[data-testid$="-transfer"]'); t.disabled = false; t.removeAttribute('title'); t.classList.add('on'); t.textContent = '✓ Transfer to Sqn'
    const row = s.querySelector('.po-outcomes')
    const proto = row.querySelector('[data-testid$="-delete"]')
    // a chip row, a clone of the sheet's own "Posting" row: its label and chips, the picked one lit
    const chipRow = (label, chips, picked) => {
      const r = row.cloneNode(false); r.setAttribute('data-mine', '1'); r.removeAttribute('aria-label')
      const lab = row.querySelector('.lab').cloneNode(true); lab.textContent = label; r.appendChild(lab)
      for (const c of chips) {
        const ch = proto.cloneNode(true); ch.removeAttribute('data-testid'); ch.classList.toggle('on', c === picked)
        ch.textContent = (c === picked ? '✓ ' : '') + c; r.appendChild(ch)
      }
      return r
    }
    const to = chipRow('To', ['149'], '149'); row.after(to)
    const in149 = chipRow('In 149', ['Member', 'Scheduler', 'Admin'], 'Member'); to.after(in149)
    const acc = chipRow('142 access', ['None', 'View', 'Scheduler'], variant === 'A' ? 'None' : 'View'); in149.after(acc)
    const lines = chipRow('142 lines', ['Keep him', 'Take him off'], variant === 'A' ? 'Keep him' : 'Take him off'); acc.after(lines)
    mark(to, 'X3'); mark(in149, 'T3'); mark(acc, 'T1'); mark(lines, 'T2')
    const note = [...s.querySelectorAll('.note')].find(x => /^On /.test(x.textContent.trim()))
    const d = note.textContent.trim().match(/^On ([^:]+):/)[1]
    // chat 98's X4 named "account, quals and Tracker course" too; Fable's read (finding 21) questions each, so the line
    // keeps only what surely moves until round 7 settles them
    note.textContent = `On ${d}: moves to 149, with his sign-in, leave, OIL and inputs.`
    // the button reads as it will once a squadron is named: pressable, not greyed
    for (const b of s.querySelectorAll('button')) if (b.textContent.trim() === 'Post out') { b.disabled = false; b.removeAttribute('aria-disabled') }
    const L = variant === 'A'
      ? [`After ${d}: 2 of 142's lines keep him, as a borrowed 149 man`,
         '3 of his inputs move to 149\'s schedule',
         '1 leave 142 approved goes to 149\'s Approvals; 149 may still refuse it',
         'Published days go pending: 4 of 142\'s, 2 of 149\'s',
         `142's manning from ${d}: OPS P turns amber on 4 days`]
      : [`After ${d}: he is taken off 2 of 142's lines; their seats are left empty`,
         '3 of his inputs move to 149\'s schedule',
         '1 leave 142 approved goes to 149\'s Approvals; 149 may still refuse it',
         'Published days go pending: 5 of 142\'s, 1 of 149\'s',
         `142's manning from ${d}: OPS P turns amber on 4 days`,
         'He keeps view of 142: he sees its schedules and changes nothing']
    const n2 = note.cloneNode(false); n2.setAttribute('data-mine', '1'); n2.textContent = L.join('\n'); n2.style.whiteSpace = 'pre-line'
    note.after(n2)
    for (const x of [note, n2]) { x.style.flex = '1 1 100%'; x.style.maxWidth = '100%' }
    mark(t, 'X2'); mark(note, 'X4'); mark(n2, 'X5')
    return { d, L }
  }, variant)
  await sleep(200)
  const cap = variant === 'A'
    ? `Variant A, the recommended defaults. X2 "Transfer to Sqn" lit; X3 "To" 149. T3 "In 149" — Member / Scheduler / Admin, shown only to an admin of both squadrons or a master admin (else 149's admins are told and give it). T1 "142 access" — None (lit) / View / Scheduler. T2 "142 lines" — Keep him (lit) / Take him off, shown only when 142's lines after ${words.d} hold him. X4 the date's line; X5 what it affects, changing with the choices. Figures made up.`
    : `Variant B, the choices changed: T1 "View" and T2 "Take him off" picked. X5's lines change with them: "${words.L[0]}", the pending count moves to 142's days, and a last line "${words.L[5]}". Figures made up.`
  await shot(page, `T${variant}-${sz}-proposed.png`, sz, 'proposed', cap)
  await ctx.close()
}

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try { for (const v of ['A', 'B']) for (const sz of ['d', 'p']) { try { await itT(sz, v) } catch (e) { errs.push(`[${v}${sz}] itT FAILED: ${e.message}`) } } }
finally { await browser.close() }
writeFileSync(MF, JSON.stringify(manifest, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
