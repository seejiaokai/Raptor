// [NOTSAVED-REFUSAL-LOOK] (his D1665, 5 Nov 26): the app's "not saved" REFUSALS — one change refused, not a failed save —
// pictured AS THEY ARE TODAY, on the real frozen build, at his PC's 1536 (Chromium) and his iPhone's 402 × 874 (WebKit).
// Each is reached through the app's own controls; what makes the one change refuse is named beside it:
//   R1 a Leave War figure box (Balances page) and R2 the Grades window — a member's tab whose Leave War view still reads
//      him as an admin (the developer bridge's lwSetRole, the route e2e/leavewar.spec.ts uses): the boxes are offered, the
//      app's own permission check refuses the save — what a role changed from another device would do.
//   R3 the same figure box when the box leaves the screen with the figure still typed in (Days taken pressed) — its
//      refusal is then said in the passing note.
//   R4 a document too big to store — the browser's document store made to refuse its write (what a full store does),
//      then a file added through the input window's own Document button.
//   R5 the schedule's refused change — NO control reaches it (it fires only when a window forgets its own refusal: the
//      safety net of inputedit.tsx saveBatchX). Drawn by raising the app's own passing note with its exact words over the
//      input window it would come from; the page says so.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> NSR_PHASE=today node scripts/handpass/nsr1105-today.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const OUT = join(L.OUT, '../../../mock/2026-11-05-notsaved-refusal/img')
mkdirSync(OUT, { recursive: true })
/* the phone without isMobile: a focused box under 16px would zoom the page and shift every later picture (the method) */
L.SIZES.phone.opts = { viewport: { width: 402, height: 874 }, hasTouch: true }
const T = (id) => `[data-testid="${id}"]`
const log = []
const rec = (id, size, what) => { const l = `${id} [${size}] ${typeof what === 'string' ? what : JSON.stringify(what)}`; log.push(l); console.log(l) }

/* a picture cropped round an element, padded, kept on the screen */
async function crop(page, sel, name, pad = { x: 160, y: 90 }) {
  const box = await page.locator(sel).first().boundingBox()
  const vw = page.viewportSize()
  if (!box) { await page.screenshot({ path: join(OUT, name + '.png') }); return 'whole (no box)' }
  const x = Math.max(0, box.x - pad.x), y = Math.max(0, box.y - pad.y)
  const w = Math.min(vw.width - x, box.width + pad.x * 2), h = Math.min(vw.height - y, box.height + pad.y * 2)
  await page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y, width: w, height: h } })
  return { x, y, w, h }
}
const toastText = (page) => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { text: t.textContent.replace(/\s+/g, ' ').trim(), cls: t.className, shown: getComputedStyle(t).opacity } : null })

/* ---- THE PROPOSED LOOK (one look for every "not saved" refusal, apart from the band — D1665) ----
   Built only of what the app already has: the Leave War refusal tag's dark red fill, red edge and pale red words
   (leavewar/ui/balances.css .bp-err — #2a1215, #FF7A84, #FFB3B9), laid out as the "Not saved" band lays out its words
   (SaveStatus.tsx SplitWords: a drawn sign, the lead in bold, the rest quieter in --ink-2). The sign is a drawn
   "no entry" ring (⊘) in the tag's red — never the band's amber triangle; no button (nothing to retry). New classes carry
   the drawing's prefix `nsr-`. In a passing note the note keeps its place, size and timing; only its face changes. */
const SIGN = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6.4' fill='none' stroke='#FF7A84' stroke-width='1.8'/><path d='M3.6 12.4 12.4 3.6' stroke='#FF7A84' stroke-width='1.8' stroke-linecap='round'/></svg>")}") center/contain no-repeat`
const NSR_CSS = `.nsr-ref{display:flex !important;align-items:flex-start;gap:7px;text-align:left}
.nsr-sign{width:14px;height:14px;flex:0 0 14px;margin-top:1px;background:${SIGN}}
.nsr-ref > span:last-child{text-align:left !important;min-width:0}
.nsr-ref b{color:#FFB3B9;font-weight:700;flex:0 0 auto}
.nsr-rest{color:var(--ink-2,#B9C2CE);font-weight:500}
.nsr-note{background:#2a1215 !important;border-color:#FF7A84 !important;color:var(--ink-2,#B9C2CE) !important}
.nsr-mark{outline:3px solid #ff3b6b !important;outline-offset:3px}
.nsr-mark-today{outline:3px dashed #ff3b6b !important;outline-offset:3px}`
const face = (lead, rest) => `<span class="nsr-sign" aria-hidden="true"></span><span><b>${lead}</b>${rest ? `<span class="nsr-rest"> ${rest}</span>` : ''}</span>`
/* the refusal tag under a box, in the proposed face */
async function tagProposed(page, sel, lead, rest) {
  await page.addStyleTag({ content: NSR_CSS })
  await page.evaluate(([s, html]) => { const e = document.querySelector(s); e.innerHTML = html; e.classList.add('nsr-ref') }, [sel, face(lead, rest)])
}
/* a passing note in the proposed face — raised through the app's own note, its words split lead / rest */
async function noteProposed(page, lead, rest) {
  await page.addStyleTag({ content: NSR_CSS })
  await page.evaluate(([l, r]) => window.toast(r ? `${l} ${r}` : l, 'warn'), [lead, rest])
  await page.waitForTimeout(260)
  await page.evaluate((html) => { const t = document.getElementById('toastEl'); t.innerHTML = html; t.classList.add('nsr-ref', 'nsr-note') }, face(lead, rest))
  await page.waitForTimeout(60)
}
/* a passing note as TODAY, raised through the app's own note with its exact words */
async function noteToday(page, words) {
  await page.evaluate((w) => window.toast(w, 'warn'), words); await page.waitForTimeout(260)
}

/* the IndexedDB document store refuses its writes once armed (what a full browser store does) */
const IDB_REFUSE = () => {
  window.__idbRefuse = false
  const put = IDBObjectStore.prototype.put
  IDBObjectStore.prototype.put = function (...a) {
    if (window.__idbRefuse) throw new DOMException('The quota has been exceeded (picture: forced)', 'QuotaExceededError')
    return put.apply(this, a)
  }
}

for (const size of ['desktop', 'phone']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  /* ---- R1, R2, R3: the Leave War, as the admin ----
     The words "Not saved" in a figure box or the Grades window come only from a refusal by the app's permission check of a
     change the screen offered; tried 5 Nov 26 with the bridge's lwSetRole, the refusal puts the war's view back and the box
     and its words go with it (filed older: [LW-NIGHT1025-OLDER]) — so today they are, in practice, never seen. Their PLACE
     and LOOK are the box's own refusal line (.bp-err, role alert), reached here for real by a typing refusal; the
     "Not saved" picture then sets that same line's words to the app's own constant — one named transform, said on the page. */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
    const box = 'bal-LVE-dice', sel = T(box)
    await page.locator(sel).scrollIntoViewIfNeeded()
    await page.locator(sel).click(); await page.locator(sel).fill('abc'); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    const real = await page.evaluate((s) => document.querySelector(s)?.textContent ?? null, T(box + '-err'))
    rec('R1', size, { realRefusal: real })
    await page.locator(T('balances-page')).click({ position: { x: 4, y: 4 } }).catch(() => {})
    rec('R1', size, { crop: await crop(page, sel, `R1-figbox-real-${sfx}`, { x: 220, y: 60 }) })
    await page.evaluate((s) => { const e = document.querySelector(s); if (e) e.textContent = 'Not saved' }, T(box + '-err'))
    await page.waitForTimeout(100)
    rec('R1', size, { crop: await crop(page, sel, `R1-figbox-today-${sfx}`, { x: 220, y: 60 }) })
    await tagProposed(page, T(box + '-err'), 'Not saved', '')
    rec('R1', size, { crop: await crop(page, sel, `R1-figbox-proposed-${sfx}`, { x: 220, y: 60 }) })
    /* R3: the note a figure box raises when it leaves the screen with a figure still typed in and that figure is refused
       (BalancesPage.tsx — the lock landing while he types; leaving the box by a press saves first, so on one device no
       button reaches it): its exact words, raised through the app's own note */
    await page.locator(T('balances-page')).click({ position: { x: 4, y: 4 } }).catch(() => {})
    await noteToday(page, 'Dice LVE App bal not saved: Locked by admin')
    await page.screenshot({ path: join(OUT, `R3-figbox-gone-today-${sfx}.png`) })
    await crop(page, '#toastEl', `R3c-figbox-gone-today-${sfx}`, { x: 40, y: 30 })
    await noteProposed(page, 'Dice LVE App bal not saved', 'Locked by admin')
    await page.screenshot({ path: join(OUT, `R3-figbox-gone-proposed-${sfx}.png`) })
    await crop(page, '#toastEl', `R3c-figbox-gone-proposed-${sfx}`, { x: 40, y: 30 })
    await page.waitForTimeout(2600)
    /* R2: the Grades window — a grade's name emptied (its real refusal), then the same line as "Not saved" */
    await page.locator(T('bal-grades')).first().click(); await page.waitForTimeout(700)
    const gname = await page.evaluate(() => document.querySelector('[data-testid^="grade-name-"]')?.dataset.testid ?? null)
    rec('R2', size, { gname })
    if (gname) {
      await page.locator(T(gname)).click(); await page.locator(T(gname)).fill(''); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
      rec('R2', size, { realRefusal: await page.evaluate((s) => document.querySelector(s)?.textContent ?? null, T(gname + '-err')) })
      rec('R2', size, { crop: await crop(page, T(gname), `R2-grades-real-${sfx}`, { x: 140, y: 110 }) })
      await page.evaluate((s) => { const e = document.querySelector(s); if (e) e.textContent = 'Not saved' }, T(gname + '-err'))
      rec('R2', size, { crop: await crop(page, T(gname), `R2-grades-today-${sfx}`, { x: 140, y: 110 }) })
      await tagProposed(page, T(gname + '-err'), 'Not saved', '')
      rec('R2', size, { crop: await crop(page, T(gname), `R2-grades-proposed-${sfx}`, { x: 140, y: 110 }) })
      await page.screenshot({ path: join(OUT, `R2-grades-whole-today-${sfx}.png`) })
    }
    await page.context().close()
  }
  /* ---- R4: a document the browser cannot store ---- */
  {
    const { page } = await L.open(size)
    await page.context().addInitScript(IDB_REFUSE)
    await page.reload(); await page.waitForSelector('#luser')
    await L.signIn(page, 'us', 'us')
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1000)
    await page.locator('#inListBtn').first().click(); await page.waitForTimeout(600)
    await page.locator(T('in-new')).first().click(); await page.waitForTimeout(700)
    await page.evaluate(() => { window.__idbRefuse = true })
    const fileSel = 'input[type="file"][accept="image/*,application/pdf"]'
    rec('R4', size, { fileInputs: await page.locator(fileSel).count() })
    await page.locator(fileSel).first().setInputFiles({ name: 'medical-cert.png', mimeType: 'image/png', buffer: Buffer.alloc(2048, 1) })
    await page.waitForTimeout(700)
    rec('R4', size, { toast: await toastText(page), notes: await page.evaluate(() => window.__notes) })
    await page.screenshot({ path: join(OUT, `R4-document-today-${sfx}.png`) })
    await crop(page, '#toastEl', `R4c-document-today-${sfx}`, { x: 40, y: 30 })
    await noteProposed(page, "Couldn't save that document", 'your browser storage may be full, so it may not be here after a reload.')
    await page.screenshot({ path: join(OUT, `R4-document-proposed-${sfx}.png`) })
    await crop(page, '#toastEl', `R4c-document-proposed-${sfx}`, { x: 40, y: 30 })
    await page.context().close()
  }
  /* ---- R5: the schedule's refused change — no control reaches it; the app's own note, its exact words ---- */
  {
    const { page } = await L.open(size)
    await L.signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
    await page.evaluate(() => window.toast('Not saved — that change was refused, and nothing was kept', 'warn'))
    await page.waitForTimeout(400)
    rec('R5', size, { toast: await toastText(page) })
    await page.screenshot({ path: join(OUT, `R5-schedule-today-${sfx}.png`) })
    await crop(page, '#toastEl', `R5c-schedule-today-${sfx}`, { x: 40, y: 30 })
    await noteProposed(page, 'Not saved', 'that change was refused, and nothing was kept')
    await page.screenshot({ path: join(OUT, `R5-schedule-proposed-${sfx}.png`) })
    await crop(page, '#toastEl', `R5c-schedule-proposed-${sfx}`, { x: 40, y: 30 })
    await page.evaluate(() => window.toast('Not saved — that change is not yours to make', 'warn'))
    await page.waitForTimeout(400)
    await crop(page, '#toastEl', `R5bc-schedule-today-${sfx}`, { x: 40, y: 30 })
    await noteProposed(page, 'Not saved', 'that change is not yours to make')
    await crop(page, '#toastEl', `R5bc-schedule-proposed-${sfx}`, { x: 40, y: 30 })
    await page.context().close()
  }
}
writeFileSync(join(OUT, 'today-log.txt'), log.join('\n') + '\n\nerrors:\n' + L.errs.join('\n') + '\n')
console.log('errors', L.errs.length, L.errs.slice(0, 8))
process.exit(0)
