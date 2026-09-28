/* D3 — [AMEND-SMALL-SEEN] 3 + [ABSENCE-SMALL-SEEN] 3: a flying line's callsign. Five letters (VIPER, COBRA) were drawn
   "…" in the edit week and wrapped "VIP/R" on the phone board; six (W6LINE) "…" on View-only Sched. The rule the walk
   asserts, on every surface that draws the line: six letters show WHOLE on one line; a longer name ends in "…" and never
   wraps. Usage: node sf-d3-callsigns.mjs [outdir-suffix] */
const OUT = 'd3-callsigns' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, editWeek, board, closeBoard, check, note, summary, SF_STATE, DESK } = L

/* five letters, the re-test's six (W6LINE), a common six (RANGER), a WIDE six (MAGNUM — whole on a desktop, "…" on a
   phone week, where the column is sized for a common six), and a long name */
const NAMES = ['VIPER', 'W6LINE', 'RANGER', 'MAGNUM', 'THUNDERBOLTS']
const SIX = new Set(['VIPER', 'W6LINE', 'RANGER'])

/* every callsign on the given surface: its text, whether it is cut (its box narrower than what it holds), whether it
   ends in "…" (overflow hidden + ellipsis on the clipping box), and how many lines it takes */
const read = (page, scope, kind) => page.evaluate(({ scope, kind, names }) => {
  const out = []
  const els = kind === 'board'
    ? [...document.querySelectorAll(`${scope} .sb-line .lin`)].filter(e => e.offsetWidth)
    : [...document.querySelectorAll(`${scope} .fcell.csmsn b`)].filter(e => e.offsetWidth)
  for (const el of els) {
    const text = (el.value ?? el.textContent ?? '').trim()
    if (!names.includes(text)) continue
    const tx = el.querySelector('.ntx') || el
    const cs = getComputedStyle(el), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
    const cut = el.scrollWidth > el.clientWidth + 1 || tx.getBoundingClientRect().right > el.getBoundingClientRect().right + 0.5
    const tr = tx.getBoundingClientRect()
    /* a board box is a <textarea> that wraps and grows (the owner's 20 Aug 26 rule): its lines are its height over its
       leading; a week name is a text run: its lines are the run's line boxes */
    let lines
    if (el.tagName === 'TEXTAREA') { const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); lines = Math.round((el.scrollHeight - pad) / lh) }
    else { const range = document.createRange(); range.selectNodeContents(tx); lines = new Set([...range.getClientRects()].map(q => Math.round(q.top))).size }
    out.push({ text, cut, ellipsis: cs.textOverflow === 'ellipsis' && cs.overflow !== 'visible', lines, w: Math.round(el.clientWidth), need: Math.round(el.scrollWidth), fs: cs.fontSize, txw: Math.round(tr.width), disp: tx === el ? '' : getComputedStyle(tx).display })
  }
  return out
}, { scope, kind, names: NAMES })

function judge(where, rows, { board = false, wide = false } = {}) {
  note(where, JSON.stringify(rows))
  for (const n of NAMES) {
    const r = rows.find(x => x.text === n)
    if (!r) { check(`${where}: ${n} is drawn`, false, 'not found'); continue }
    if (SIX.has(n) || (n === 'MAGNUM' && (wide || board))) check(`${where}: ${n} shows whole on one line`, !r.cut && r.lines <= 1, JSON.stringify(r))
    else if (board) check(`${where}: ${n} (longer) wraps and grows, never cut — the 20 Aug 26 board rule`, !r.cut, JSON.stringify(r))
    /* an inline-BLOCK name is one piece: cut, the ellipsis swallows it whole and only the dot is left — so a cut name
       must be an ordinary inline run, which the ellipsis cuts after its first letters */
    else check(`${where}: ${n} ends in "…" after its first letters, on one line`, r.lines <= 1 && (!r.cut || (r.ellipsis && r.disp !== 'inline-block')), JSON.stringify(r))
  }
}

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await editWeek(page)
/* a day NOT yet published, with a flying line for every name — so View-only Sched draws what was typed (a published
   day's face keeps what it was issued with, D179); its lines take the names, typed the way a scheduler types them */
const pick = await page.evaluate(n => {
  const keys = [...new Set([...document.querySelectorAll('#eWeek [data-txt$=".cs"]')].map(e => e.getAttribute('data-txt')))]
  const byDay = {}
  for (const k of keys) { const d = Number((/^ff:(\d+)\./.exec(k) || [])[1]); if (Number.isFinite(d)) (byDay[d] ||= []).push(k) }
  for (const [d, ks] of Object.entries(byDay)) if (!window.dayApproved(Number(d)) && ks.length >= n) return { di: Number(d), keys: ks.slice(0, n) }
  const [d, ks] = Object.entries(byDay).sort((a, b) => b[1].length - a[1].length)[0]
  return { di: Number(d), keys: ks.slice(0, n), published: true }
}, NAMES.length)
const mine = pick.keys
note('the day and its callsign boxes', JSON.stringify(pick))
for (let i = 0; i < mine.length; i++) {
  const el = page.locator(`#eWeek [data-txt="${mine[i]}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click()
  await page.keyboard.press('Control+A'); await page.keyboard.type(NAMES[i], { delay: 5 }); await el.evaluate(e => e.blur())
  await page.waitForTimeout(400)
}
const di = pick.di

for (const [w, h] of [[1440, 900], [390, 844], [360, 780]]) {
  await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(700)
  await go(page, 'editsched'); await page.waitForTimeout(500)
  judge(`edit week ${w}`, await read(page, '#eWeek', 'week'), { wide: w > 820 })
  const one = page.locator('#eWeek .fcell.csmsn b', { hasText: 'W6LINE' }).first()
  if (await one.count()) { await one.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); const bb = await one.boundingBox(); if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d3-edit-${w}.png`, clip: { x: Math.max(0, bb.x - 16), y: Math.max(0, bb.y - 90), width: Math.min(w - Math.max(0, bb.x - 16), 380), height: 220 } }) }
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  /* a published day's issued face keeps its own names (D179), so the typed ones are read on its working draft —
     the same flying-line cell, the one a member reads when he opens the draft */
  if (pick.published) note(`View-only ${w} working draft`, String(await L.viewPick(page, di, 'working')))
  judge(`View-only Sched ${w}`, await read(page, '#vWeek', 'week'), { wide: w > 820 })
  const v = page.locator('#vWeek .fcell.csmsn b', { hasText: 'W6LINE' }).first()
  if (await v.count()) { await v.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); const bb = await v.boundingBox(); if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d3-view-${w}.png`, clip: { x: Math.max(0, bb.x - 16), y: Math.max(0, bb.y - 90), width: Math.min(w - Math.max(0, bb.x - 16), 380), height: 220 } }) }
  await board(page, di)
  judge(`board ${w}`, await read(page, '#schedBoard', 'board'), { board: true })
  const b = page.locator('#schedBoard .sb-line .lin').filter({ hasText: /W6LINE/ }).first()
  const bAny = (await b.count()) ? b : page.locator('#schedBoard .sb-line .lin').first()
  if (await bAny.count()) { await bAny.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); const bb = await bAny.boundingBox(); if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d3-board-${w}.png`, clip: { x: 0, y: Math.max(0, bb.y - 60), width: Math.min(w, 520), height: 240 } }) }
  await closeBoard(page)
}
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-d3-callsigns') ? 1 : 0
