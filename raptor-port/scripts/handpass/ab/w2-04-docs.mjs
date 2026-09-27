/* W2-04 — the medical DOCUMENTS and the Medical view (Astra 28; roll-call R4, R32 the document ask, R33 the viewer),
   walked in the running app. Assertions of the RIGHT behaviour.
     D1  a medical filed WITH its certificate (two files: a picture and a PDF) is not asked "Upload / No document"
     D2  the Inputs table's paperclip opens the viewer: "1 of 2", paging, the picture then the PDF, Escape closes
     D3  the Medical view: the man under Medically Down (as of the app's today, 13 Jul) with "2 documents"; a tap
         opens the same viewer; the Medical button's red badge counts him
     D4  an edit that removes one file, then Cancel — both files still there; an edit that removes one, then Save —
         one left; a reload keeps exactly that one, and it still opens
     D5  a Pending Upchit card → the viewer's Upchit → the upchit is filed → he moves to Upchit Complete, the amber
         badge drops
     D6  the published / view schedule: what a tap on a medical row offers (no document door is wired there — recorded)
     D7  a MEMBER (us = Ranger) opens another man's document from the Medical view (D211: every member sees a medical
         input's type, remarks and documents); the viewer offers him no "Edit input" on another man's entry
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w2-04-docs.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT, inputsWindow, go } = L
const PHONE = WD === 'phone'
const R = resultBook(`W2-04-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w2-04-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const P = (n) => `w2-04-${WD}-${n}`
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
const DOCS = W.makeDocs()
const M = 'dice'                        // Reaper
let iid = null
const docCount = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? (r.docIds || (r.docId ? [r.docId] : [])).length : -1 }, iid)
const closeViewer = async () => { const d = page.locator('#docViewDone:visible'); if (await d.count()) { await d.click(); await page.waitForTimeout(300) } }

await step('D1', async () => {
  const med0 = await W.medView(page)
  await W.toList(page)
  await page.selectOption('#inPerson', M)
  await page.selectOption('#inType', 'ATT C')
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const walkTo = async (iso) => {
    for (let i = 0; i < 30 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
      await page.locator(`#inCal button[aria-label="${`${y}-${String(MON.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}` < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).first().click(); await page.waitForTimeout(150)
  }
  await walkTo(JUL(13)); if ((await page.locator('#inDates').textContent()).includes('→')) await walkTo(JUL(13))
  await walkTo(JUL(15))
  await page.locator('#inRemarks').fill('W2 D1 flu, GP letter attached')
  const up = page.locator('.docfield input[type="file"]').first()
  await up.setInputFiles([DOCS.png, DOCS.pdf]); await page.waitForTimeout(600)
  await shot(page, P('D1a-form-with-two-files'))
  const chips = await page.evaluate(() => [...document.querySelectorAll('.docfield .docchip')].map(e => e.innerText.trim()))
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await page.locator('#inAdd').click(); await page.waitForTimeout(700)
  const c = await W.confirmNow(page)
  iid = await page.evaluate(b => { const s = new Set(b); const f = window.INPUTS.filter(x => !s.has(x.iid)); return f.length ? f[0].iid : null }, before)
  R.ck('D1-no-ask-with-document', !!iid && !c.docconf && (await docCount()) === 2, 'filed with two files attached: no "Upload / No document" ask; the entry carries 2 documents', { chips, sheet: c, iid, docs: await docCount() })
  const med1 = await W.medView(page)
  R.note('D1-medical-badge', { before: med0.badge, after: med1.badge })
  R.ck('D3-badge-counts-him', (parseInt((med1.badge.find(b => b.startsWith('red')) || 'red 0').slice(4)) === parseInt((med0.badge.find(b => b.startsWith('red')) || 'red 0').slice(4)) + 1), 'the Medical button\'s red badge counts one more man medically down today (13 Jul)', { before: med0.badge, after: med1.badge })
})

await step('D2', async () => {
  await W.toList(page); await inputsWindow(page, JUL(13), JUL(15))
  const clip = page.locator(`#inBody tr[data-iid="${iid}"] .rclip`).first()
  R.ck('D2-paperclip', !!(await clip.count()), 'the Inputs table row carries a paperclip', { iid })
  await clip.click(); await page.waitForTimeout(700)
  const v1 = await W.docViewNow(page)
  await shot(page, P('D2a-viewer-1-of-2'))
  const nx = page.locator('#docViewNext:visible')
  if (await nx.count()) { await nx.click(); await page.waitForTimeout(700) }
  const v2 = await W.docViewNow(page)
  await shot(page, P('D2b-viewer-2-of-2'))
  R.ck('D2-viewer-pages', v1.open && /1 of 2/.test(v1.count) && v1.img && /2 of 2/.test(v2.count) && v2.pdf && /Reaper/.test(v1.title),
    'the viewer opens on "1 of 2" (the picture), › pages to "2 of 2" (the PDF), titled with Reaper · ATT C and the remark', { v1, v2 })
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  R.ck('D2-escape-closes', !(await W.docViewNow(page)).open, 'Escape closes the viewer', await W.docViewNow(page))
})

await step('D3', async () => {
  const mv = await W.medView(page)
  await shot(page, P('D3a-medical-view'))
  const down = mv.secs.find(s => /Medically Down/i.test(s.h)) || { cards: [] }
  const card = down.cards.find(c => c.endsWith('#' + iid))
  R.ck('D3-listed-down', !!card && /2 documents/.test(card) && /till 15 Jul/.test(card), 'the Medical view lists Reaper under Medically Down, "till 15 Jul", "2 documents"', mv)
  await page.locator(`[data-medcard="${iid}"]`).first().click(); await page.waitForTimeout(700)
  const v = await W.docViewNow(page)
  await shot(page, P('D3b-viewer-from-medical-view'))
  R.ck('D3-card-opens-viewer', v.open && /of 2/.test(v.count) && v.foot.some(f => /docViewEdit/.test(f)), 'a tap on the card opens the same viewer, both documents, with "Edit input" for the admin', v)
  await closeViewer()
})

await step('D4', async () => {
  await W.toList(page); await inputsWindow(page, JUL(13), JUL(15))
  await W.tableEdit(page, iid)
  await page.locator('#inBody tr.ined .docchip .docdel').first().click(); await page.waitForTimeout(300)
  const chips = await page.evaluate(() => [...document.querySelectorAll('#inBody tr.ined .docchip')].length)
  await W.tableCancel(page)
  R.ck('D4-cancel-keeps-both', chips === 1 && (await docCount()) === 2, 'removing a file in the editor, then ✕ Cancel: both files still on the entry', { chipsWhileEditing: chips, docs: await docCount() })
  await W.tableEdit(page, iid)
  await page.locator('#inBody tr.ined .docchip .docdel').first().click(); await page.waitForTimeout(300)
  await toasts(page)
  await W.tableSave(page)
  const t = await toasts(page)
  R.ck('D4-save-removes-one', (await docCount()) === 1, 'removing one file and ✓ Save: one document left', { toasts: t, docs: await docCount() })
  await W.reload(page, 'a')
  await W.toList(page); await inputsWindow(page, JUL(13), JUL(15))
  const clip = page.locator(`#inBody tr[data-iid="${iid}"] .rclip`).first()
  await clip.click(); await page.waitForTimeout(700)
  const v = await W.docViewNow(page)
  await shot(page, P('D4a-viewer-after-reload-one-left'))
  R.ck('D4-reload-keeps-one', (await docCount()) === 1 && v.open && !v.count && (v.pdf || v.img) && !v.none, 'after a reload: exactly one document, and it still opens (no pager, no "No document on file")', { docs: await docCount(), v })
  await closeViewer()
})

await step('D5', async () => {
  const mv0 = await W.medView(page)
  const pend = (mv0.secs.find(s => /Pending Upchit/i.test(s.h)) || { cards: [] }).cards
  const quill = pend.find(c => /Quill/.test(c))
  R.note('D5-pending-before', { badge: mv0.badge, pend })
  if (!quill) { R.ck('D5-pending-card', false, 'Quill is on Pending Upchit (demo OML till 9 Jul)', pend); return }
  const qiid = quill.split('#').pop()
  await page.locator(`[data-medcard="${qiid}"]`).first().click(); await page.waitForTimeout(700)
  const v = await W.docViewNow(page)
  await shot(page, P('D5a-pending-card-viewer'))
  R.ck('D5-upchit-door', v.foot.some(f => /docViewUpchit/.test(f)), 'the Pending Upchit card\'s viewer offers "Upchit"', v)
  await page.locator('#docViewUpchit').click(); await page.waitForTimeout(700)
  const ed = await W.confirmNow(page)
  await shot(page, P('D5b-upchit-editor'))
  await page.locator('#inpEditSave:visible').click(); await page.waitForTimeout(700)
  let c = await W.confirmNow(page)
  if (c.docconf) { await page.locator('[data-testid="docconf-nodoc"]').click(); await page.waitForTimeout(600); c = await W.confirmNow(page) }
  if (c.upconf) { await W.confirmSave(page) }
  const mv1 = await W.medView(page)
  await shot(page, P('D5c-medical-view-after-upchit'))
  const done = (mv1.secs.find(s => /Upchit Complete/i.test(s.h)) || { cards: [] }).cards
  const pend1 = (mv1.secs.find(s => /Pending Upchit/i.test(s.h)) || { cards: [] }).cards
  R.ck('D5-moves-to-complete', done.some(c => /Quill/.test(c)) && !pend1.some(c => /Quill/.test(c)) && !mv1.badge.some(b => b.startsWith('amber')),
    'after the upchit Quill leaves Pending Upchit for Upchit Complete, and the amber badge goes', { editor: ed, sheets: c, badge: mv1.badge, done, pend1 })
})

await step('D6', async () => {
  await go(page, 'viewsched'); await page.waitForTimeout(500)
  const sel = '#vWeek .day[data-day="0"] .sec-unav'
  const row = await page.evaluate(s => { const b = document.querySelector(s); if (!b) return null; const r = [...b.querySelectorAll('.pl-row')].find(x => /Reaper/.test(x.innerText)); return r ? { text: r.innerText.replace(/\s+/g, ' ').trim(), buttons: [...r.querySelectorAll('button,[data-inpedit],.rclip,[data-doc]')].map(e => e.outerHTML.slice(0, 80)) } : 'no Reaper row' }, sel)
  if (await page.locator(sel).count()) { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300) }
  await shot(page, P('D6a-view-schedule-monday-unavailable'))
  R.note('D6-view-schedule-row', { row, note: 'no document door is wired on the schedule (only the Inputs table and the Medical view open the viewer — src/ui/InputsPage.tsx, MedicalView.tsx)' })
})

await step('D7', async () => {
  await L.relogin(page, 'm')
  await toastSpy(page)
  const mv = await W.medView(page)
  await shot(page, P('D7a-member-medical-view'))
  const card = page.locator(`[data-medcard="${iid}"]`).first()
  R.ck('D7-member-sees-card', !!(await card.count()), 'the member (Ranger) sees Reaper\'s card on the Medical view', mv)
  if (await card.count()) {
    await card.click(); await page.waitForTimeout(700)
    const v = await W.docViewNow(page)
    await shot(page, P('D7b-member-opens-another-mans-document'))
    R.ck('D7-member-opens-document', v.open && !v.none && (v.img || v.pdf) && /flu/.test(v.sub), 'he opens Reaper\'s document and reads its type and remarks (D211)', v)
    R.ck('D7-no-edit-for-member', !v.foot.some(f => /docViewEdit|docViewUpchit/.test(f)), 'the viewer offers him no "Edit input" / "Upchit" on another man\'s entry', v.foot)
    await closeViewer()
  }
})

R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
