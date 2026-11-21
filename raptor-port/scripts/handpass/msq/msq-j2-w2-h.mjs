/* msq-j2-w2-h v1 — W2's helpers for job 2's walk (19 Nov 26) */
export const mk = async () => {
  const H = await (await import('./msq-j2-w1-h.mjs')).mk()
  const Hm = await import('./msq-j2-w1-h2.mjs')
  const { X, U, say, sleep, row } = H
  const iso = Hm.iso, T = Hm.T
  const chunks = t => t.split(/(?<=[.!?])\s+|\s{2,}/).map(s => s.trim()).filter(Boolean)
  const newWords = (before, after) => { const b = new Set(chunks(before)); return chunks(after).filter(c => !b.has(c)).join(' || ').slice(0, 500) }
  const KNOWN = /(He is 149's[^.]*\.(?: Only[^.]*\.)?|Only a master admin[^.]*\.?|[A-Za-z0-9]+ is a master admin[^.]*|[A-Za-z0-9]+ is 149's last admin\.[^.]*\.(?: [^.]*\.)?|That did not save[^.]*|[^.]{0,60}can.t be deleted[^.]*)/
  const known = t => (t.match(KNOWN) || [''])[0]
  const pstate = (p, pid) => p.evaluate(pid => { const x = window.PEOPLE?.[pid]; return x ? `cs=${x.cs} archived=${!!x.archived} deleted=${!!x.deleted}` : '(gone)' }, pid)
  const rowWords = (p, pid) => p.evaluate(pid => { const r = document.querySelector(`.acc-row[data-person="${pid}"]`); return r ? r.innerText.replace(/\s+/g, ' ').trim() : '(row not on screen)' }, pid)
  const dots = (p, pid) => p.evaluate(pid => { const r = document.querySelector(`.acc-row[data-person="${pid}"]`); if (!r) return '(no row)'; return [...r.querySelectorAll('[class*=dot],[class*=Dot],.dot')].map(e => e.className + ':' + (e.getAttribute('title') || e.getAttribute('aria-label') || '')).join(' ; ') || '(no dots found)' }, pid)
  async function openRowBy(w, cs, pid) {
    await H.usersPage(w)
    await w.page.locator(H.FIND).fill(cs); await sleep(600)
    const tap = w.page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
    if (!(await tap.count())) return false
    if (!(await w.page.locator('#accEdSave, #accGive, #accEdArchive, #accArRestore').first().isVisible().catch(() => false))) { await tap.click(); await sleep(800) }
    return true
  }
  async function openArchivedRow(w, cs, pid) {
    const p = w.page
    await H.usersPage(w)
    await p.locator(H.FIND).fill(cs); await sleep(600)
    const tap = p.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
    if (!(await tap.isVisible().catch(() => false))) {
      const fold = p.getByRole('button', { name: /Archived/ }).first()
      if (await fold.count()) { await fold.click(); await sleep(600) }
    }
    if (!(await p.locator('#accArPostIn, #accArCs').first().isVisible().catch(() => false))) { await tap.click(); await sleep(800) }
  }
  async function postOutSheet(w, pid, d, chip) {
    const page = w.page
    const cell = page.locator(`[data-testid="cell-${pid}-${d}"]`).first()
    if (!(await cell.count())) return { ok: false, text: 'no grid cell for ' + pid + ' on ' + d }
    await cell.scrollIntoViewIfNeeded().catch(() => {})
    await cell.click(); await sleep(900)
    await page.locator('button:visible', { hasText: '⋯' }).last().click({ timeout: 4000 }).catch(() => {}); await sleep(600)
    const po = page.locator('button:visible', { hasText: /^Post out/ }).first()
    if (!(await po.count())) return { ok: false, text: 'no Post out in the ⋯ list' }
    await po.click(); await sleep(700)
    if (chip) {
      const ch = page.locator('button:visible', { hasText: new RegExp('^(✓ )?' + chip) }).first()
      if (await ch.count()) { const already = /^✓/.test((await ch.textContent()).trim()); if (!already) { await ch.click(); await sleep(800) } }
    }
    return { ok: true, text: await sheetText(page) }
  }
  const sheetText = page => page.evaluate(() => {
    const e = [...document.querySelectorAll('button')].find(b => /^Post out$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2)
    let box = e; for (let i = 0; i < 8 && box && box.parentElement && !/PO FROM/i.test(box.innerText || ''); i++) box = box.parentElement
    return (box?.innerText || '(sheet not found)').replace(/\s+/g, ' ').trim()
  })
  async function addGround(w, name, cs, di) {
    const page = w.page
    await X.W.board(w, di); await sleep(600)
    await X.W.press(w, `[data-gradd="${di}"]`, { scope: 'board' }); await sleep(600)
    const n = (await U.groundNames(page, di)).length - 1
    await X.W.typeIn(w, `[data-bfld="gr:${di}.${n}.prog"]`, name)
    const id = await U.pidOf(page, cs)
    const r = await X.W.seat(w, `[data-fill="g:${di}.${n}.+"]`, id)
    await X.W.closeBoard(w); await sleep(600)
    return r
  }
  const elog = p => p.evaluate(() => {
    const out = []
    for (const k of Object.keys(localStorage).filter(k => k.includes('elog:'))) {
      let v; try { v = JSON.parse(localStorage.getItem(k)) } catch { v = null }
      const arr = Array.isArray(v) ? v : (v && typeof v === 'object' ? [v] : [])
      for (const r of arr) out.push('u=' + (r.u ?? '(none)') + ' who=' + (r.who ?? '') + ' pid=' + (r.pid ?? '') + ' | ' + String(r.lbl ?? r.key ?? '').slice(0, 40))
      if (!arr.length) out.push('[' + k.slice(0, 50) + ' shape: ' + String(localStorage.getItem(k)).slice(0, 80) + ']')
    }
    return out
  })
  const swap = async (w, user) => { await X.signOut(w); await X.login(w.page, user) }
  const selRole = async (p, which) => {
    const opts = await p.locator('#accEdRole').evaluate(s => [...s.options].map(o => [o.value, o.text]))
    const want = /member/i.test(which) ? 'main' : 'admin'
    const o = opts.find(([v]) => v === want)
    if (o) await p.locator('#accEdRole').selectOption(o[0])
    return JSON.stringify(opts)
  }
  return { ...H, Hm, iso, T, chunks, newWords, known, pstate, rowWords, dots, openRowBy, openArchivedRow, postOutSheet, sheetText, addGround, elog, swap, selRole }
}
