// The night of 1–2 Nov 26, job 1 — [LW-HELDHALF-WORDS], walked on screen: a day whose morning (or afternoon) holds a
// commitment filed on the Inputs page under Unavailable opens the bid window on the free half, with one line for the held
// half (D1371) — its box, AM / PM (D1525), where it is attached, its words with their "till <date>" (D948, D951) and its
// documents as chips, read only, a tap opening them (D1150) — the same body as a held day's line. Written as the RIGHT
// behaviour (a PASS means correct). Fixtures through the Inputs page's own form, never injected (§7.7).
// Run from raptor-port: LW_PORT=<a served build> LW_OUT=2026-11-01-lw-next-batch/held node scripts/handpass/lw-nb-held.mjs
//   (PART=d,p,m for some)
process.env.LW_PORT ||= '4173'
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/held'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T } = H
fs.mkdirSync(H.OUT, { recursive: true })
for (const f of fs.readdirSync(H.OUT)) if (f.endsWith('.png')) fs.unlinkSync(`${H.OUT}/${f}`)
const parts = (process.env.PART || 'd,p,m').split(',')
const run = id => parts.includes(id)
console.log('[lw-nb-held v1] →', H.OUT, parts.join(' '), 'bundle on', process.env.LW_PORT)
const ids = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
const sheetOf = P => P.evaluate(() => ['bid-picker', 'raptor-sheet', 'daylist-sheet', 'remarks-sheet', 'closed-note'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) ?? null)
const halfLine = P => P.evaluate(() => { const e = document.querySelector('[data-testid="bid-picker"] [data-testid="bid-heldhalf"]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null })
const chipsOf = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid="bid-heldhalf"] .docchip')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()))
const lit = (P, id) => P.evaluate(id => document.querySelector(`[data-testid="bid-picker"] [data-testid="${id}"]`)?.getAttribute('aria-pressed') ?? null, id)
const close = async w => { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(400) }
const neutral = P => P.evaluate(() => document.activeElement?.blur?.())
const recs = []
const rec = (id, size, ok, said, pics = []) => { recs.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} [${size}]  ${said}`) }
const winPic = async (w, name) => { await neutral(w.page); await w.page.waitForTimeout(150); return H.pic(w, name, [T('bid-picker')], { pad: 6, scale: 'device' }) }
/** the line's geometry: inside the window, nothing sideways */
const fits = P => P.evaluate(() => {
  const l = document.querySelector('[data-testid="bid-picker"] [data-testid="bid-heldhalf"]')?.getBoundingClientRect()
  const s = document.querySelector('[data-testid="bid-picker"]')?.getBoundingClientRect()
  return l && s ? { inside: l.left >= s.left - 0.5 && l.right <= s.right + 0.5, wide: document.documentElement.scrollWidth <= innerWidth, lr: [Math.round(l.left), Math.round(l.right)], sr: [Math.round(s.left), Math.round(s.right)] } : null
})
/** the doc viewer that a chip opens */
const viewerOpen = P => P.evaluate(() => [...document.querySelectorAll('.docview, [data-testid*="docview"], [data-testid*="doc-viewer"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getAttribute('data-testid') || e.className).slice(0, 3))

/* the fixtures, all through the Inputs page's form (signed in as the admin, members' today 13 Jul 26):
   Comet  — an Other under Unavailable, the MORNING (07:00–12:00 — a commitment's form takes hours, not AM / PM), 21–22 Jul,
            "Station board", one document (board.pdf)
   Havoc  — an Attach, the AFTERNOON (13:00–17:00), one day 23 Jul, "Exercise", To "145 Sqn" (a one-day commitment prints no
            till — D951) */
async function fixtures(w) {
  await H.fileInput(w, { who: 'Comet', type: 'Other', from: '2026-07-21', to: '2026-07-22', remarks: 'Station board', goes: 'u', times: ['07:00', '12:00'], beforeSave: () => L.setDoc(w, '[data-testid="win-inputedit"]', 'board.pdf'), tag: 'nb-oth', oil: 'no' })
  await H.fileInput(w, { who: 'Havoc', type: 'Attach', from: '2026-07-23', remarks: 'Exercise', toWhere: '145 Sqn', times: ['13:00', '17:00'], tag: 'nb-atch', oil: 'no' })
  await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForTimeout(1200)
}

/* ================= d: an admin on a desktop (1536 x 864) ================= */
if (run('d')) {
  const w = await H.deskFrom(undefined, 1), P = w.page
  await L.signInPlain(w, 'admin', '2026-07-13')
  const id = await ids(P)
  await fixtures(w)
  /* H1 the morning Other over two days: the window opens on PM, the line names it with its till and its document */
  await L.openCellR(w, id.Comet, '2026-07-21')
  let s = await sheetOf(P), l = await halfLine(P), ch = await chipsOf(P), pm = await lit(P, 'portion-pm')
  rec('H1-line', 'desk', s === 'bid-picker' && pm === 'true' && /^OTH\s*AM/.test(l || '') && /“Station board till 22 Jul”/.test(l || '') && ch.length === 1 && /board\.pdf/.test(ch[0]) && /change it on the Inputs page$/.test(l || ''),
    `opened ${s}; PM lit ${pm}; line "${l}"; chips ${ch.join(', ') || 'none'}`, [await winPic(w, 'h1-comet-other-am')])
  /* H2 the chip opens the document, read only */
  if (ch.length) { await L.press(w, `${T('bid-picker')} [data-testid="bid-heldhalf"] .docchip`); await P.waitForTimeout(800) }
  const v = await viewerOpen(P)
  const vpic = await P.screenshot({ path: `${H.OUT}/h2-comet-doc-open.png`, scale: 'device' }).then(() => 'h2-comet-doc-open.png')
  rec('H2-doc', 'desk', v.length > 0, `after a tap on the chip, open: ${v.join(', ') || 'nothing'}`, [vpic])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300); await close(w)
  /* H3 its second day: the same line, the same till */
  await L.openCellR(w, id.Comet, '2026-07-22')
  l = await halfLine(P)
  rec('H3-second-day', 'desk', /“Station board till 22 Jul”/.test(l || ''), `line "${l}"`, [await winPic(w, 'h3-comet-day2')])
  await close(w)
  /* H4 the afternoon Attach of one day: AM free, the line names where he is attached, no till (D951), no chip */
  await L.openCellR(w, id.Havoc, '2026-07-23')
  s = await sheetOf(P); l = await halfLine(P); ch = await chipsOf(P)
  const am = await lit(P, 'portion-am')
  rec('H4-attach', 'desk', s === 'bid-picker' && am === 'true' && /^ATCH\s*PM/.test(l || '') && /· 145 Sqn/.test(l || '') && /“Exercise”/.test(l || '') && !/till/.test(l || '') && ch.length === 0,
    `opened ${s}; AM lit ${am}; line "${l}"; chips ${ch.length}`, [await winPic(w, 'h4-havoc-attach-pm')])
  /* H5 a leave placed on the free half from this window lands beside the commitment (the window still works) */
  await L.press(w, `${T('bid-picker')} ${T('bid-LL')}`); await P.waitForTimeout(700)
  if (await L.vis(P, T('bid-picker')) && /Tap the same leave again/.test((await L.txt(P, T('bid-picker'))) || '')) { await L.press(w, `${T('bid-picker')} ${T('bid-LL')}`); await P.waitForTimeout(700) }
  const c5 = await L.cellInfo(P, id.Havoc, '2026-07-23')
  rec('H5-place', 'desk', /LL/.test(c5?.text || '') && /ATCH/.test(c5?.text || ''), `cell now ${c5?.text}`, [await H.pic(w, 'h5-havoc-after', [T(`cell-${id.Havoc}-2026-07-23`)], { pad: 40, scale: 'device' })])
  await close(w); await L.press(w, '#undoBtn'); await P.waitForTimeout(600)
  rec('D-errors', 'desk', !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}

/* ================= p: an admin on an iPhone 402 x 874 (Chromium touch, then WebKit) ================= */
if (run('p')) {
  for (const engine of ['chromium', 'webkit']) {
    const w = await H.phoneCtx(engine), P = w.page
    await L.signInPlain(w, 'admin', '2026-07-13')
    const id = await ids(P)
    await fixtures(w)
    await L.reachCell(w, id.Comet, '2026-07-21')
    await L.press(w, T(`cell-${id.Comet}-2026-07-21`), engine === 'chromium' ? 'p1-quick' : null); await P.waitForTimeout(700)
    const s = await sheetOf(P), l = await halfLine(P), ch = await chipsOf(P), g = await fits(P)
    const shot = await P.screenshot({ path: `${H.OUT}/p1-${engine}-comet-other.png`, scale: 'device' }).then(() => `p1-${engine}-comet-other.png`)
    rec('P1-line', engine, s === 'bid-picker' && /“Station board till 22 Jul”/.test(l || '') && ch.length === 1 && !!g && g.inside && g.wide,
      `opened ${s}; line "${l}"; chips ${ch.join(', ') || 'none'}; line ${g?.lr} inside window ${g?.sr} ${g?.inside}; no sideways scroll ${g?.wide}`, [shot])
    if (ch.length) { await L.press(w, `${T('bid-picker')} [data-testid="bid-heldhalf"] .docchip`); await P.waitForTimeout(800) }
    const v = await viewerOpen(P)
    const vpic = await P.screenshot({ path: `${H.OUT}/p2-${engine}-doc-open.png`, scale: 'device' }).then(() => `p2-${engine}-doc-open.png`)
    rec('P2-doc', engine, v.length > 0, `after a tap on the chip, open: ${v.join(', ') || 'nothing'}`, [vpic])
    rec('P-errors', engine, !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
    await w.ctx.close()
  }
}

/* ================= m: a member — his own day, its morning an Other under Unavailable (D1371: the same for a member) ================= */
if (run('m')) {
  const w = await H.phoneCtx(), P = w.page
  await L.signInPlain(w, 'admin', '2026-07-13')
  const id = await ids(P), me = id.Ranger
  /* July opened for bidding by the admin, through the "Open for bidding" window (his today is 13 Jul: open from today) */
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900); await P.evaluate(() => window.scrollTo(0, 0))
  await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'))
  if ((await P.locator(T('od-month-2026-07')).getAttribute('aria-pressed')) !== 'true') { await L.press(w, T('od-month-2026-07')); await P.waitForTimeout(500) }
  await L.press(w, T('open-dates-close')); await P.waitForTimeout(300)
  await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-28', to: '2026-07-29', remarks: 'Exam board', goes: 'u', times: ['07:00', '12:00'], beforeSave: () => L.setDoc(w, '[data-testid="win-inputedit"]', 'notice.pdf'), tag: 'nb-m-oth', oil: 'no' })
  await L.signInPlain(w, 'member', '2026-07-13')
  await L.openCellR(w, me, '2026-07-28', 'm1-quick'); await P.waitForTimeout(500)
  const s = await sheetOf(P), l = await halfLine(P), ch = await chipsOf(P)
  rec('M1-own', 'phone', s === 'bid-picker' && /^OTH\s*AM/.test(l || '') && /“Exam board till 29 Jul”/.test(l || '') && ch.length === 1,
    `opened ${s}; line "${l}"; chips ${ch.join(', ') || 'none'}`, [await winPic(w, 'm1-ranger-own')])
  rec('M-errors', 'phone', !w.errs.length, w.errs.slice(0, 4).join(' | ') || 'none')
  await w.ctx.close()
}

fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify(recs, null, 1))
console.log(`\n${recs.filter(r => r.verdict === 'PASS').length}/${recs.length} PASS`)
await H.closeBrowser()
