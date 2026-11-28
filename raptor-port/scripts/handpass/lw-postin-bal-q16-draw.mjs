// Chat 200 — question 16: Fable's design DRAWN on the real app (a mock-up: the extra words are laid over the real page,
// nothing is saved). His numbers: 25 days, a 1-day leave on Wed 2 Dec, the official leave app shows 24, posted in
// Fri 27 Nov. Pelican: leave first, then 24 (right). Kittyhawk: 24 first, then the leave (23, the slip). Lynx: never typed.
// The words come from Q16_WORDS (JSON) so a reviewer's change is a re-run, not an edit.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-11-26-lw-postin-balance/q16'
process.env.LW_TODAY ||= '2026-11-26'
process.env.PORT ||= '4757'
const L = await import('./lw-m4-lib.mjs')
const { T, press, vis, shot } = L
const W = Object.assign({
  never: 'Type what the official leave app shows',
  same: 'typed 26 Nov',
  since: 'typed 24 on 26 Nov · −1 since',
  row: '−1',
  foldTitle: 'How it works',
  fold: ['Type what the official leave app shows today.', 'TALON takes off each leave approved after that.', "Doesn't match the official app? Type it again."],
}, process.env.Q16_WORDS ? JSON.parse(process.env.Q16_WORDS) : {})
console.log('[lw-postin-bal-q16-draw v1]', JSON.stringify(W))
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
const log = (...a) => console.log(...a)

const pidOf = cs => P.evaluate(cs => {
  for (const e of document.querySelectorAll('[data-testid^="bal-name-"]')) if (e.textContent.trim().startsWith(cs)) return e.dataset.testid.slice(9)
  return null
}, cs)
async function openBalances() { await press(w, T('lw-tab-balances')); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(500) }
async function openGrid() { await press(w, T('lw-tab-grid')); await P.waitForTimeout(700) }
async function typeBox(sel, fig) {
  await press(w, sel); await P.waitForTimeout(150)
  await P.keyboard.press('Control+A'); await P.keyboard.type(String(fig), { delay: 30 }); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
}
async function placeLL(pid, iso) {
  await L.openCell(w, pid, iso)
  await P.waitForSelector(`${T('postin-place')}, ${T('bid-picker')}`, { state: 'visible', timeout: 8000 }).catch(() => null)
  if (await vis(P, T('postin-place'))) { await press(w, T('postin-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, true)
  await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
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
/* MOCK: the grey line under App bal, and a figure on the 2 Dec leave row; `never` also draws q11's "Not typed" */
async function drawWindow(line, rowFig, never) {
  await P.evaluate(({ line, rowFig, never }) => {
    const pw = document.querySelector('[data-testid="person-window"]')
    /* inside the LVE tile, as its last line, in the grey of its "incl. … carried fwd" line */
    const tile = pw.querySelector('[data-testid="pw-tile-LVE"]') || pw.querySelector('[data-testid="pw-LVE"]').closest('[class*="r17-t"]')
    const cfLine = pw.querySelector('[data-testid="pw-LVE-cf"]').parentElement
    const cs = getComputedStyle(cfLine)
    const el = document.createElement('div')
    el.textContent = line
    el.style.cssText = `font-size:${cs.fontSize};color:${never ? '#F2C879' : cs.color};font-family:${cs.fontFamily};margin-top:4px;white-space:${line.includes('\n') ? 'pre-line' : line.length > 45 ? 'normal' : 'nowrap'};grid-column:1/-1`
    tile.appendChild(el)
    if (never) {
      for (const id of ['pw-LVE', 'pw-LVE-cf']) { const b = pw.querySelector(`[data-testid="${id}"]`); if (b) { b.value = ''; b.style.border = '1px dashed rgba(242,200,121,.8)' } }
      const war = pw.querySelector('[data-testid="pw-LVE-war"]'); if (war) { war.textContent = 'Not typed'; war.style.color = '#F2C879'; war.style.fontSize = '15px'; war.style.whiteSpace = 'nowrap' }
    }
    if (rowFig) {
      for (const r of pw.querySelectorAll('[data-testid^="pw-line-"]')) {
        if (/-(dot|who)$/.test(r.dataset.testid) || !/2 Dec/.test(r.textContent)) continue
        const f = document.createElement('span'); f.textContent = rowFig
        f.style.cssText = 'margin-left:auto;padding-left:12px;color:#E8EDF2;font-weight:600;white-space:nowrap'
        r.style.display = 'flex'; r.style.alignItems = 'center'; r.appendChild(f); break
      }
    }
  }, { line, rowFig, never })
  await P.waitForTimeout(200)
}
async function windowShot(pid, name, line, rowFig, never = false) {
  await openBalances()
  await press(w, T(`bal-name-${pid}`)); await P.waitForSelector(T('person-window'), { state: 'visible', timeout: 8000 }); await P.waitForTimeout(500)
  await drawWindow(line, rowFig, never)
  await P.locator(T('person-window')).screenshot({ path: `${L.OUT}/${name}.png` })
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
}

try {
  await L.signIn(w, 'admin')
  await addMan('Pelican', 'PN'); await addMan('Kittyhawk', 'KH'); await addMan('Lynx', 'LX')
  await L.openWar(w, 'admin'); await openBalances()
  const pel = await pidOf('Pelican'), kit = await pidOf('Kittyhawk'), lynx = await pidOf('Lynx'); log('ids', pel, kit, lynx)
  await openGrid(); await placeLL(pel, '2026-12-02')
  await openBalances(); await typeBox(T(`bal-LVE-${pel}`), 24)
  await typeBox(T(`bal-LVE-${kit}`), 24)
  await openGrid(); await placeLL(kit, '2026-12-02')

  for (const size of ['desk', 'phone']) {
    if (size === 'phone') { await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(800) }
    await windowShot(pel, `${size}-a-right`, W.same, '')
    await windowShot(kit, `${size}-b-slip`, W.since, W.row)
    await windowShot(lynx, `${size}-c-never`, W.never, '', true)
  }
  /* the Balances page's closed fold, opened, at the page's foot (desktop) */
  await P.setViewportSize({ width: 1536, height: 860 }); await P.waitForTimeout(800)
  await openBalances()
  await P.evaluate(({ title, lines }) => {
    const page = document.querySelector('[data-testid="balances-page"]')
    const d = document.createElement('details'); d.open = true
    d.style.cssText = 'margin:10px 20px 0;color:#9aa4b2;font-size:13px;line-height:1.6'
    const s = document.createElement('summary'); s.textContent = title; s.style.cssText = 'cursor:pointer;color:#c8d4e4;font-weight:600'
    d.appendChild(s)
    for (const l of lines) { const p = document.createElement('div'); p.textContent = l; d.appendChild(p) }
    const scroll = page.querySelector('[data-testid="bal-scroll"]') || page
    scroll.insertAdjacentElement('afterend', d)
  }, { title: W.foldTitle, lines: W.fold })
  await P.waitForTimeout(300)
  await shot(w, 'desk-d-fold-page')
  log('errors:', w.errs.length ? w.errs.join(' | ') : 'none')
} catch (e) {
  console.log('STOPPED:', e.message); await shot(w, 'zz-stopped')
} finally { await L.closeBrowser() }
