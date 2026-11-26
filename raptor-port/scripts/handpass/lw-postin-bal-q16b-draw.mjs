// Chat 200 — question 16 after his answer (D2748): short instructions AT THE BOX where a balance is typed, drawn on
// the real app as a mock-up (laid over the real page, nothing saved). Pelican: 24 typed, no leave since. Shown in his
// person window (inside the LVE tile, under the box) and once on the Balances page (above the list), desktop and phone.
// The words come from Q16_INSTR (JSON: {pwTitle?, pw:[...], pwFoldTitle?, pwFold?:[...], balTitle?, bal:[...]}) so a
// reviewer's change is a re-run. Each entry is one sentence, wrapped by the tile's width; a fold is drawn closed and open.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-26-lw-postin-balance/q16-instr'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, shot } = L
const W = JSON.parse(process.env.Q16_INSTR || '{"pw":["Type what the official leave app shows."],"bal":["Type what the official leave app shows."]}')
console.log('[lw-postin-bal-q16b-draw v2]', JSON.stringify(W))
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const log = (...a) => console.log(...a)

const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  return null
}, cs)
async function openBalances() { await press(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(500) }
async function typeBox(sel, fig) {
  await press(w, sel); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
}
async function addMan(cs, ini) {
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(800)
  await P.locator('#accAddBlock').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', ini)
  await P.selectOption('#accAddSeat', 'FCP'); await P.selectOption('#accAddCat', 'OCU')
  await P.click('#accAddPostIn'); await P.waitForTimeout(400)
  await P.locator('[data-iso="2026-11-27"]').first().click(); await P.waitForTimeout(400)
  await P.click('#accAdd'); await P.waitForTimeout(800)
}
/* MOCK: the instructions block, grey small text; a title in the lighter grey when one is given */
function block(doc, title, lines, cs, extra, foldTitle, fold, open) {
  doc.getElementById('q16-instr')?.remove()
  const d = doc.createElement('div'); d.id = 'q16-instr'
  d.style.cssText = `font-size:${cs.fontSize};color:${cs.color};font-family:${cs.fontFamily};line-height:1.45;${extra}`
  if (title) { const t = doc.createElement('div'); t.textContent = title; t.style.cssText = 'color:#c8d4e4;font-weight:600;margin-bottom:2px'; d.appendChild(t) }
  for (const l of lines) { const p = doc.createElement('div'); p.textContent = l; p.style.marginTop = '2px'; d.appendChild(p) }
  if (fold && fold.length) {
    const f = doc.createElement('details'); f.open = !!open; f.style.marginTop = '4px'
    const s = doc.createElement('summary'); s.textContent = foldTitle || 'What counts'; s.style.cssText = 'cursor:pointer;color:#7fd3f0'
    f.appendChild(s)
    for (const l of fold) { const p = doc.createElement('div'); p.textContent = l; p.style.marginTop = '2px'; f.appendChild(p) }
    d.appendChild(f)
  }
  return d
}
async function windowShot(pid, name, open) {
  await openBalances()
  await press(w, T(`bal-name-${pid}`)); await P.waitForSelector(T('person-window'), { state: 'visible', timeout: 8000 }); await P.waitForTimeout(500)
  await P.evaluate(({ title, lines, block, foldTitle, fold, open, dateLine, rename }) => {
    const mk = new Function('return ' + block)()
    const pw = document.querySelector('[data-testid="person-window"]')
    const tile = pw.querySelector('[data-testid="pw-tile-LVE"]')
    const cs = getComputedStyle(pw.querySelector('[data-testid="pw-LVE-cf"]').parentElement)
    /* W.dateLine: the line naming where the typed figure came from, in the carried-forward line's grey, before the words */
    if (dateLine) { const dl = document.createElement('div'); dl.textContent = dateLine; dl.style.cssText = `font-size:${cs.fontSize};color:${cs.color};font-family:${cs.fontFamily};margin-top:4px;grid-column:1/-1`; tile.appendChild(dl) }
    tile.appendChild(mk(document, title, lines, cs, 'margin-top:6px;grid-column:1/-1;white-space:normal', foldTitle, fold, open))
    /* W.rename: the label "App bal" drawn as "Official bal" (D2810) */
    if (rename) for (const n of pw.querySelectorAll('*')) if (n.childElementCount === 0 && n.textContent.trim() === 'App bal') n.textContent = 'Official bal'
  }, { title: W.pwTitle || '', lines: W.pw, block: block.toString(), foldTitle: W.pwFoldTitle || '', fold: W.pwFold || [], open: !!open, dateLine: W.dateLine || '', rename: !!W.rename })
  await P.waitForTimeout(200)
  await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/${name}.png` })
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
}
async function pageShot(name) {
  await openBalances()
  await P.evaluate(({ title, lines, block, rename }) => {
    const mk = new Function('return ' + block)()
    const page = document.querySelector('[data-testid="balances-page"]')
    const scroll = page.querySelector('[data-testid="bal-scroll"]')
    const ref = document.querySelector('[data-testid^="bal-pend-"]') || page
    const cs = getComputedStyle(ref)
    const d = mk(document, title, lines, { fontSize: '13px', color: '#9aa4b2', fontFamily: cs.fontFamily }, 'margin:8px 16px 8px')
    if (scroll) scroll.insertAdjacentElement('beforebegin', d); else page.prepend(d)
    /* on a phone the column is too narrow for one line: two, as PENDING / APPROVAL beside it */
    if (rename) for (const n of page.querySelectorAll('*')) if (n.childElementCount === 0 && n.textContent.trim() === 'APP BAL') { if (innerWidth < 700) n.innerHTML = 'OFFICIAL<br>BAL'; else n.textContent = 'OFFICIAL BAL' }
  }, { title: W.balTitle || '', lines: W.bal, block: block.toString(), rename: !!W.rename })
  await P.waitForTimeout(300)
  await shot(w, name)
}

try {
  await L.signIn(w, 'admin')
  await addMan('Pelican', 'PN')
  await L.openWar(w, 'admin'); await openBalances()
  const pel = await pidOf('Pelican'); log('id', pel)
  await typeBox(T(`bal-LVE-${pel}`), 24)
  for (const size of ['desk', 'phone']) {
    if (size === 'phone') { await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(800) }
    await windowShot(pel, `${size}-pw`, false)
    if (W.pwFold && W.pwFold.length) await windowShot(pel, `${size}-pw-open`, true)
    await pageShot(`${size}-bal`)
  }
  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
} catch (e) {
  console.log('STOPPED:', e.message); await shot(w, 'zz-stopped')
} finally { await L.closeBrowser() }
