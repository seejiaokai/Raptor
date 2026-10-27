// Walker A, route 4: scenario 8 (the paperclip viewer and the page behind it) and 14 (+N pending in the next period). Desktop, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s8'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, datesBtn } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a-s8 v1]')
L.clearOut()
const pdf = L.pdfPath('m4-a-form.pdf')
const w = await L.newCtx('desk')
const P = w.page
const size = 'desk'
try {
  await L.signIn(w, 'member')
  await bidBatch(w, 'bane', [{ iso: '2026-01-12', pdf }, { iso: '2026-01-14' }])
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  const clip = lineLoc(P, 'Mon 12 Jan').locator('[data-testid="appr-clip"]')
  await pressLoc(w, clip); await P.waitForTimeout(700)
  await shot(w, 'a-s8-1-viewer-open')
  const v = async () => P.evaluate(() => {
    const top = document.elementFromPoint(768, 430)
    let box = top; for (let i = 0; i < 8 && box && !/Close/.test(box.innerText || ''); i++) box = box.parentElement
    const title = document.querySelector('[data-testid="docview-placed"]')
    const root = title ? (title.closest('[class*="doc"], [class*="modal"], [class*="sheet"], [class*="win"]') || title.parentElement.parentElement) : null
    return { open: !!title, titleParentText: root ? root.innerText.replace(/\s+/g, ' ').slice(0, 220) : null, buttons: root ? [...root.querySelectorAll('button')].map(b => b.innerText.trim() || b.getAttribute('aria-label')) : [] }
  })
  const v0 = await v()
  console.log('viewer', JSON.stringify(v0))
  const readOnlyFoot = v0.buttons.length > 0 && !v0.buttons.some(b => /edit input|upchit/i.test(b || ''))
  rec('8a the paperclip opens the viewer, read only (no "Edit input", no "Upchit")', size, v0.open && readOnlyFoot ? 'PASS' : 'FAIL', `buttons in the viewer: ${JSON.stringify(v0.buttons)}; text "${v0.titleParentText}"`, ['a-s8-1-viewer-open'])
  /* press another line's Approve behind it: the visible part of the button right of the viewer */
  const ab = await approveBtn(P, 'Wed 14 Jan').boundingBox()
  const rb = await refuseBtn(P, 'Wed 14 Jan').boundingBox()
  console.log('approve box', JSON.stringify(ab), 'refuse', JSON.stringify(rb))
  const px = ab.x + ab.width - 8, py = ab.y + ab.height / 2
  const hit = await P.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName).toString().slice(0, 60) : null }, { x: px, y: py })
  console.log('point', px, py, 'hits', hit)
  await P.mouse.click(px, py); await P.waitForTimeout(600)
  const v1 = await v()
  const l14 = await lineInfo(P, 'Wed 14 Jan').catch(() => null)
  const l12 = await lineInfo(P, 'Mon 12 Jan').catch(() => null)
  await shot(w, 'a-s8-2-after-press-behind')
  console.log('after the press: viewer', JSON.stringify(v1), '14 Jan', l14 && JSON.stringify(l14.ok), '12 Jan', l12 && JSON.stringify(l12.ok))
  const stillShowsOwn = v1.open && /Jan 12/.test(v1.titleParentText || '')
  rec('8b a press on another line behind the viewer: the viewer still shows ITS request', size, !v1.open || stillShowsOwn ? 'PASS' : 'FAIL', `the press at the visible edge of Wed 14 Jan's Approve hit "${hit}"; viewer open afterwards: ${v1.open} ("${v1.titleParentText}"); 14 Jan Approve pressed=${l14 && l14.ok.p}; 12 Jan Approve pressed=${l12 && l12.ok.p}`, ['a-s8-1-viewer-open', 'a-s8-2-after-press-behind'])
  /* Escape / Close */
  if (v1.open) { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
  const closedByEsc = !(await v()).open
  if (!closedByEsc) { const cb = P.getByRole('button', { name: 'Close' }).first(); if (await cb.count()) { await cb.click(); await P.waitForTimeout(400) } }
  await shot(w, 'a-s8-3-viewer-closed')
  console.log('closed by Escape', closedByEsc, 'closed now', !(await v()).open)
  /* ===== 14: +N pending in the next period ===== */
  const pickerBefore = await txt(P, T('war-picker')) || await txt(P, T('period-label'))
  const elsewhere = await txt(P, T('appr-elsewhere'))
  const hdrBefore = await txt(P, T('appr-sub'))
  await shot(w, 'a-s8-14-before-link')
  await pressLoc(w, P.locator(T('appr-elsewhere'))); await P.waitForTimeout(800)
  const pickerAfter = await txt(P, T('war-picker')) || await txt(P, T('period-label'))
  const hdrAfter = await txt(P, T('appr-sub'))
  const elsewhereAfter = (await P.locator(T('appr-elsewhere')).count()) ? await txt(P, T('appr-elsewhere')) : null
  const lines = await L.apprLines(P)
  await shot(w, 'a-s8-14-after-link')
  console.log('picker', pickerBefore, '->', pickerAfter, '| header', hdrBefore, '->', hdrAfter, '| link', elsewhere, '->', elsewhereAfter, '| lines', lines.length)
  for (const l of lines) console.log('   ', l.text)
  const m = (elsewhere || '').match(/\+(\d+) pending/)
  rec('14 the "+N pending in <next period>" link switches the View', size, m && pickerAfter !== pickerBefore && lines.length === Number(m[1]) ? 'PASS' : 'FAIL', `link "${elsewhere}"; View "${pickerBefore}" -> "${pickerAfter}"; header "${hdrBefore}" -> "${hdrAfter}"; lines after: ${lines.length}; the link now reads "${elsewhereAfter}"`, ['a-s8-14-before-link', 'a-s8-14-after-link'])
  /* back to the first period through the new link, if it is offered */
  if (elsewhereAfter) { await pressLoc(w, P.locator(T('appr-elsewhere'))); await P.waitForTimeout(800); await shot(w, 'a-s8-14-back-to-first'); console.log('back again: picker', await txt(P, T('war-picker')) || await txt(P, T('period-label')), 'header', await txt(P, T('appr-sub'))) }
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 500))
  await shot(w, 'a-s8-error').catch(() => {})
}
console.log('errs', JSON.stringify(w.errs))
L.writeResults('s8')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
