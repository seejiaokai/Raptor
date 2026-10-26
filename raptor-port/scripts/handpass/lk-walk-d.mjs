/* lk-walk part D: the Cancel sheet by keyboard W16 and the note told to a screen reader W17 ([BATCH-14OCT-LEFTOVERS] a, f) — the walker's script, 21 Oct 26 */
process.env.HP_URL ||= 'http://localhost:4295'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/docs/img/handpass/2026-10-21-look-keys/walk'
console.log('lk-walk-d v2')
const { go, board, closeBoard } = await import('./lib.mjs')
const W = await import('./lk-walk-lib.mjs')
const rec = W.recorder('d')
const pause = (page, ms = 350) => page.waitForTimeout(ms)
const RING = 'solid 2px rgb(59, 198, 232)'
const allErrors = []

const FOCUS = () => {
  const a = document.activeElement
  if (!a || a === document.body) return null
  const s = getComputedStyle(a), r = a.getBoundingClientRect()
  return { name: (a.getAttribute('aria-label') || a.title || a.textContent || a.id || a.tagName).replace(/\s+/g, ' ').trim().slice(0, 20), tag: a.tagName, id: a.id, cls: (a.className || '').toString().slice(0, 36),
    inSheet: !!a.closest('#cxPop'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset, border: s.borderTopColor, shadow: s.boxShadow === 'none' ? '' : s.boxShadow.slice(0, 60),
    box: { x: r.x, y: r.y, w: r.width, h: r.height } }
}
const fmtF = (f) => f ? `${f.name} [${f.tag}${f.id ? '#' + f.id : ''}.${f.cls}] outline ${f.outline} offset ${f.offset}${f.tag === 'INPUT' ? ' border ' + f.border + (f.shadow ? ' shadow ' + f.shadow : '') : ''}` : '(body / nothing)'

async function tabRun(page, max = 14) {
  const seq = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab'); await page.waitForTimeout(80)
    const f = await page.evaluate(FOCUS)
    if (!f || !f.inSheet) { seq.push({ out: true, f }); break }
    if (seq.find(x => x.f && x.f.name === f.name && x.f.cls === f.cls && x.f.tag === f.tag)) break
    seq.push({ f })
  }
  return seq
}
async function zoomOf(page, name, box, vw = 1440, vh = 900) {
  await W.mark(page, [box])
  const x = Math.max(0, box.x - 60), y = Math.max(0, box.y - 40)
  const p = await W.snap(page, name, { x, y, width: Math.min(vw - x, box.w + 120), height: Math.min(vh - y, box.h + 80) })
  await W.unmark(page); return p
}

/* ---------------- W16: the Cancel sheet ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await board(page, 1); await pause(page, 500)
    const fam = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetWidth && /^CX$/.test((b.textContent || '').trim())).map(b => Object.keys(b.dataset).join(',') + ' @' + b.closest('[id], section, div')?.className.toString().slice(0, 20)))
    console.log('CX buttons on the board (dataset keys):', JSON.stringify([...new Set(fam)]))
    const famKeys = [...new Set(fam.map(f => f.split(' ')[0]))]
    /* each family: Common Programme (pcx), then whatever duty / flying ones exist */
    for (const key of famKeys) {
      const attr = key.split(',')[0]
      const sel = '#schedBoard [data-' + attr.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + ']'
      const btn = page.locator(`${sel}:visible`).filter({ hasText: /^CX$/ }).first()
      if (!(await btn.count())) { console.log('no visible CX for', key); continue }
      const label = attr === 'pcx' ? 'Common Programme row CX' : `CX family data-${attr}`
      const isMain = attr === 'pcx'
      await btn.scrollIntoViewIfNeeded(); await btn.click()
      await page.waitForSelector('#cxPop:not([hidden])'); await pause(page, 400)
      if (isMain) {
        /* mouse only, on a fresh sheet: a click on a chip leaves no ring */
        const c0 = page.locator('#cxQuick [data-cxq]:visible').first()
        await c0.click(); await pause(page, 250)
        const cr0 = await page.evaluate(() => { const e = document.querySelector('#cxQuick [data-cxq]'); const s = getComputedStyle(e); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} offset ${s.outlineOffset}` })
        const act0 = await page.evaluate(FOCUS)
        const pm0 = await zoomOf(page, 'w16-cx-chip-mouse-fresh-1440', await W.rectOf(page, '#cxQuick [data-cxq]'))
        rec('W16c', '1440x900', 'fresh Cancel sheet, mouse only: clicked the first chip (no key pressed)', `chip outline after the click: ${cr0}; active element: ${fmtF(act0)}`, !/solid 2px rgb(59, 198, 232)/.test(cr0) ? 'PASS' : 'FAIL', [pm0])
        await page.keyboard.press('Escape'); await pause(page, 400)
        if (await page.evaluate(() => { const e = document.getElementById('cxPop'); return !!e && !e.hidden && !!e.offsetWidth })) await page.locator('#cxClose').click()
        await pause(page, 300)
        await btn.click(); await page.waitForSelector('#cxPop:not([hidden])'); await pause(page, 400)
      }
      await page.locator('#cxReason').focus(); await pause(page, 150)
      const start = await page.evaluate(FOCUS)
      const seq = await tabRun(page)
      const byName = (re) => seq.map(s => s.f).filter(Boolean).find(f => re.test(f.name))
      const lines = seq.map(s => s.out ? 'Tab → (left the sheet: ' + (s.f ? s.f.name : 'body') + ')' : 'Tab → ' + fmtF(s.f))
      console.log(`${label}: from ${fmtF(start)}\n  ` + lines.join('\n  '))
      let pics = []
      /* pictures: each chip as reached; take the first chip's zoom */
      const wx = byName(/WX/)
      if (isMain) {
        const quick = ['WX', 'OPS', 'LOGS']
        const missing = quick.filter(q => !byName(new RegExp('^' + q)))
        const edit = seq.map(s => s.f).filter(Boolean).find(f => /cxq-edit/.test(f.cls))
        const bad = [...quick.map(q => byName(new RegExp('^' + q))), edit].filter(Boolean).filter(f => f.outline !== RING)
        // zoom of a chip with its ring: re-focus WX by tabbing again
        await page.locator('#cxReason').focus(); await page.keyboard.press('Tab'); await page.waitForTimeout(100)
        const f1 = await page.evaluate(FOCUS)
        if (f1 && f1.inSheet) pics.push(await zoomOf(page, 'w16-cx-chip-ring-1440', f1.box))
        pics.push(await W.snap(page, 'w16-cx-sheet-1440'))
        const rest = seq.map(s => s.f).filter(Boolean).filter(f => /Cancel|✕|Close/.test(f.name) || f.id === 'cxSave' || f.id === 'cxClose')
        rec('W16a', '1440x900', `${label}: focused the reason box, Tab repeatedly (keyboard)`,
          `order: ${seq.filter(s => s.f && !s.out).map(s => s.f.name).join(' → ')}; chips/Edit rings: ${[...quick.map(q => byName(new RegExp('^' + q))), edit].filter(Boolean).map(f => f.name + ' ' + f.outline + ' off ' + f.offset).join('; ')}; missing from the Tab order: ${missing.length ? missing.join(',') : 'none'}; not the ring: ${bad.length ? bad.map(f => f.name + ' = ' + f.outline).join(', ') : 'none'}; Cancel line / ✕ (kept theirs): ${rest.map(f => f.name + ' ' + f.outline).join('; ') || 'not reached'}`,
          (!missing.length && edit && !bad.length) ? 'PASS' : 'FAIL', pics)
        /* Enter on ✎ Edit → the edit list */
        await page.locator('#cxReason').focus()
        for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); const f = await page.evaluate(FOCUS); if (f && /cxq-edit/.test(f.cls)) break }
        const onEdit = await page.evaluate(FOCUS)
        await page.keyboard.press('Enter'); await pause(page, 400)
        const listOpen = await page.evaluate(() => { const e = document.getElementById('cxEdit'); return !!e && !e.hidden && !!e.offsetWidth })
        if (!listOpen) rec('W16b', '1440x900', 'Enter on ✎ Edit', `focus was ${fmtF(onEdit)}; the edit list #cxEdit did not show`, 'NOT WALKED')
        else {
          await page.locator('#cxEdit .cxedit-name').first().focus(); await pause(page, 150)
          const nm = await page.evaluate(FOCUS)
          const seq2 = []
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab'); await page.waitForTimeout(80)
            const f = await page.evaluate(FOCUS)
            if (!f || !f.inSheet) break
            if (seq2.find(x => x.name === f.name && x.cls === f.cls && Math.round(x.box.y) === Math.round(f.box.y) && Math.round(x.box.x) === Math.round(f.box.x))) break
            seq2.push(f)
          }
          console.log('edit list: name box', fmtF(nm), '\n  ' + seq2.map(fmtF).join('\n  '))
          const mv = seq2.filter(f => /cxedit-(mv|del)/.test(f.cls) || /▲|▼|✕/.test(f.name))
          const badMv = mv.filter(f => f.outline !== RING)
          const nameBad = !/59, 198, 232/.test(nm.border) && !/59, 198, 232/.test(nm.outline) && !/59, 198, 232/.test(nm.shadow)
          const pe = []
          if (mv[0]) pe.push(await zoomOf(page, 'w16-cx-edit-ring-1440', mv[0].box))
          const nmRect = nm.box
          await page.locator('#cxEdit .cxedit-name').first().focus(); await pause(page, 100)
          pe.push(await zoomOf(page, 'w16-cx-edit-namebox-1440', nmRect))
          rec('W16b', '1440x900', 'Enter on ✎ Edit (keyboard); focused a name box, Tab through the edit list',
            `edit list opened; name box focused: outline ${nm.outline}, border ${nm.border}${nm.shadow ? ', shadow ' + nm.shadow : ''}; then Tab reached ${seq2.map(f => f.name + ' [' + f.outline + ']').join(', ')}; ▲/▼/✕ not ringed: ${badMv.length ? badMv.map(f => f.name + ' ' + f.outline).join(', ') : 'none'}; (${mv.length} of ▲/▼/✕ reached)`,
            (mv.length && !badMv.length && !nameBad) ? 'PASS' : 'FAIL', pe)
          const done = page.locator('#cxEdit [data-cxdone]').first()
          if (await done.count()) { await done.focus(); await page.keyboard.press('Enter'); await pause(page, 300) }
        }
        /* a MOUSE click on a chip: no cyan 2px ring on it */
        const chip = page.locator('#cxQuick [data-cxq]:visible').first()
        if (await chip.count()) {
          await chip.click(); await pause(page, 250)
          const af = await page.evaluate(FOCUS)
          const cr = await page.evaluate(() => { const e = document.querySelector('#cxQuick [data-cxq]'); const s = getComputedStyle(e); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` })
          const pm = await zoomOf(page, 'w16-cx-chip-mouse-1440', (await W.rectOf(page, '#cxQuick [data-cxq]')))
          rec('W16c2', '1440x900', 'a MOUSE click on the first chip AFTER keyboard use on the same sheet (the chip already keyboard-focused)', `chip outline after the click: ${cr}; active element: ${fmtF(af)}`, 'RECORD', [pm])
        } else rec('W16c', '1440x900', 'a MOUSE click on a chip', 'no chip visible', 'NOT WALKED')
      } else {
        const chips = seq.map(s => s.f).filter(Boolean)
        rec('W16-' + attr, '1440x900', `${label}: reason box focused, Tab repeatedly`, chips.map(f => f.name + ' ' + f.outline).join('; '), 'RECORD')
      }
      /* Escape / ✕ closes the sheet — RECORD where the keyboard is */
      await page.keyboard.press('Escape'); await pause(page, 400)
      let open = await page.evaluate(() => { const e = document.getElementById('cxPop'); return !!e && !e.hidden && !!e.offsetWidth })
      let how = 'Escape'
      if (open) { await page.locator('#cxClose').click(); await pause(page, 400); how = '✕ (Escape did not close it)' }
      const where = await page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}${a.id ? '#' + a.id : ''}.${(a.className || '').toString().slice(0, 30)} "${(a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 20)}"` : 'none' })
      rec('W16-esc-' + attr, '1440x900', `closed the sheet with ${how}`, `keyboard is on: ${where}`, 'RECORD')
    }
  } catch (e) { rec('W16', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 5).join('\n')) }
  allErrors.push('W16: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W17: the note told to a screen reader ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await page.evaluate(() => {
      window.__fills = []; window.__toasts = []
      new MutationObserver((recs) => {
        for (const r of recs) {
          const sr = document.getElementById('srSay')
          if (sr && (r.target === sr || sr.contains(r.target))) {
            if (r.type === 'characterData' && r.target.data) window.__fills.push(r.target.data)
            for (const n of r.addedNodes) if ((n.textContent || '').trim()) window.__fills.push(n.textContent)
          }
          const te = document.getElementById('toastEl')
          if (te && (r.target === te || te.contains(r.target)) && te.textContent.trim()) window.__toasts.push(te.textContent)
          for (const n of r.addedNodes) if (n.id === 'srSay' && n.textContent.trim()) window.__fills.push(n.textContent)
        }
      }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true })
    })
    const read = async () => { await page.waitForTimeout(100); return page.evaluate(() => { const t = document.getElementById('toastEl'), s = document.getElementById('srSay'); const o = { toast: t ? t.textContent : null, toastShown: t ? !!t.offsetWidth && getComputedStyle(t).visibility !== 'hidden' && getComputedStyle(t).opacity !== '0' : null, ah: t ? t.getAttribute('aria-hidden') : null, sr: s ? s.textContent : null, role: s && s.getAttribute('role'), live: s && s.getAttribute('aria-live'), atomic: s && s.getAttribute('aria-atomic'), fills: window.__fills.slice(), toasts: window.__toasts.slice() }; return o }) }
    const reset = () => page.evaluate(() => { window.__fills = []; window.__toasts = [] })

    /* (1) a real action: ALL AVAIL put on a Common Programme row */
    const put1 = await W.putAt(page, 'week', 'a:0.0.+'); await pause(page, 300)
    const r1 = await read()
    const toastShot = await W.snap(page, 'w17-toast-1440', { x: 0, y: 500, width: 1440, height: 400 })
    const ok1 = r1.ah === 'true' && !!r1.toast && r1.sr === r1.toast && r1.role === 'status' && r1.live === 'polite' && r1.atomic === 'true'
    rec('W17a', '1440x900', `admin, Edit Schedule: put ALL AVAIL on a Common Programme row (${put1})`,
      `#toastEl "${r1.toast}" aria-hidden=${r1.ah} (shown: ${r1.toastShown}); #srSay "${r1.sr}" role=${r1.role} aria-live=${r1.live} aria-atomic=${r1.atomic}; fills seen: ${JSON.stringify(r1.fills)}`, ok1 ? 'PASS' : 'FAIL', [toastShot])
    /* (2) the same action again: the same words must be told again */
    await reset()
    const put2 = await W.putAt(page, 'week', 'a:0.1.+'); await pause(page, 300)
    const r2 = await read()
    const ok2 = r2.fills.length === 2 || (r2.fills.length >= 2 && r2.fills.every(f => f === r1.toast))
    rec('W17b', '1440x900', `the same action again on the next row (${put2})`,
      `#toastEl "${r2.toast}"; #srSay "${r2.sr}"; non-empty fills recorded by the observer: ${r2.fills.length} ${JSON.stringify(r2.fills)} (expected two for one action: the clear and the fill? — the brief says two fills across the two actions: ${r1.fills.length} + ${r2.fills.length})`,
      (r1.fills.length >= 1 && r2.fills.length >= 1 && r2.sr === r1.sr && r2.sr === r2.toast) ? 'PASS' : 'FAIL')
    /* (3) the Inputs page */
    await go(page, 'inputs'); await pause(page, 500)
    await page.click('#inListBtn'); await pause(page, 300)
    await page.click('#inRangeBtn'); await page.click('#inRangeAll'); await pause(page, 400)
    await reset()
    await page.click('#inNew'); await page.waitForSelector('.inpedwin:not([hidden])'); await pause(page, 500)
    await page.selectOption('#inpEditType', { label: 'Training' }); await pause(page, 300)
    await page.selectOption('#inpEditPerson', { label: 'Anvil' })
    await page.locator('[data-testid="inpEdCal-day-2026-07-15"]').click(); await pause(page, 300)
    const rows0 = await page.evaluate(() => document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs [data-iid]').length)
    await page.click('#inpEditSave'); await pause(page, 900)
    const asked = await page.evaluate(() => /Does it deserve/.test(document.body.innerText))
    const r3 = await read()
    const rows1 = await page.evaluate(() => document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs [data-iid]').length)
    const shot3 = await W.snap(page, 'w17-input-added-1440')
    const winOpen = await page.evaluate(() => { const w = document.querySelector('.inpedwin'); return !!w && !w.hidden && !!w.offsetWidth })
    const told = r3.fills.filter(f => /Input added/.test(f)).length
    const toastWords = r3.toast && r3.toastShown ? r3.toast : '(none shown)'
    let verdict = 'FAIL'
    if (asked || winOpen) verdict = 'NOT WALKED'
    else if (told === 1 && !/Input added/.test(toastWords)) verdict = 'PASS'
    rec('W17c', '1440x900', 'Inputs page, List, All dates: "+ Input", Training for Anvil on Wed 15 Jul, Add',
      `window still open: ${winOpen}; OIL question asked: ${asked}; rows before ${rows0} after ${rows1}; #toastEl text "${r3.toast}" shown=${r3.toastShown} aria-hidden=${r3.ah}; #srSay "${r3.sr}"; fills the observer saw: ${JSON.stringify(r3.fills)} ("Input added" told ${told} time(s)); toast words seen by the observer: ${JSON.stringify(r3.toasts)}`,
      verdict, [shot3])
  } catch (e) { rec('W17', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED'); console.log(e.stack.split('\n').slice(0, 5).join('\n')) }
  allErrors.push('W17: ' + W.consoleBlock(errors))
  await browser.close()
}
console.log('CONSOLE', allErrors.join(' || '))
console.log('DONE d')
