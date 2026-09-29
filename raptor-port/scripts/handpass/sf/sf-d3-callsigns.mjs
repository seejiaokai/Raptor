/* D3 — [AMEND-SMALL-SEEN] 3 + [ABSENCE-SMALL-SEEN] 3: a flying line's callsign. Five letters (VIPER, COBRA) were drawn
   "…" in the edit week and wrapped "VIP/R" on the phone board; six (W6LINE) "…" on View-only Sched. The rule the walk
   asserts, on every surface that draws the line: every name shows WHOLE — on the week it wraps and the cell grows (D367,
   29 Sep 26, after his iPhone cut W6LINE on one line), never "…"; on a desktop week a six takes one line; the board's boxes
   wrap and grow (20 Aug 26). Usage: node sf-d3-callsigns.mjs [outdir-suffix] */
const OUT = 'd3-callsigns' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, editWeek, board, closeBoard, check, note, summary, SF_STATE, DESK } = L

/* five letters, the re-test's six (W6LINE), a common six (RANGER), a WIDE six (MAGNUM — whole on a desktop, "…" on a
   phone week, where the column is sized for a common six), and a long name */
const NAMES = ['VIPER', 'W6LINE', 'RANGER', 'MAGNUM', 'THUNDERBOLTS']

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
    const cell = el.closest('.fcell'), cb = cell ? cell.getBoundingClientRect() : null
    const cut = el.scrollWidth > el.clientWidth + 1 || tx.getBoundingClientRect().right > el.getBoundingClientRect().right + 0.5
      || (!!cell && (cell.scrollHeight > cell.clientHeight + 1 || tx.getBoundingClientRect().bottom > cb.bottom + 0.5))
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
    if (board) { check(`${where}: ${n} wraps and grows, never cut — the 20 Aug 26 board rule`, !r.cut, JSON.stringify(r)); continue }
    /* the week (D367): whole, never "…", whatever the width or the font; a desktop's column still holds a six on one line */
    check(`${where}: ${n} shows whole — wrapped if it must, never "…"`, !r.cut && !r.ellipsis, JSON.stringify(r))
    if (wide && n !== 'THUNDERBOLTS') check(`${where}: ${n} takes one line on a desktop`, r.lines <= 1, JSON.stringify(r))
  }
}

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
/* SF_WIDE=1: draw the names in a WIDER face (Verdana), as his iPhone's own font is wider than this PC's — the app loads no
   font of its own ([APP-FONTS-NOT-LOADED]), so the wrap (D367) is walked where it actually happens */
if (process.env.SF_WIDE) await page.addStyleTag({ content: '.form .csmsn b{font-family:Verdana,"DejaVu Sans",sans-serif !important}' })
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
  /* the remarks keep their room: a stand-alone line's MAIN / SPARE tag stays whole (at 48px on a 360 phone it broke
     in two, "MAI N" — found by this walk's pictures, 29 Sep 26) */
  const tags = await page.evaluate(() => { const els = [...document.querySelectorAll('#vWeek .sarole')].filter(e => e.getClientRects().length)
    return { n: els.length, split: els.filter(e => { const rg = document.createRange(); rg.selectNodeContents(e); return new Set([...rg.getClientRects()].map(q => Math.round(q.top))).size > 1 }).map(e => e.textContent.trim()) } })
  check(`View-only Sched ${w}: every MAIN / SPARE tag in the remarks stays on one line`, tags.n > 0 && tags.split.length === 0, JSON.stringify(tags))
  const v = page.locator('#vWeek .fcell.csmsn b', { hasText: 'W6LINE' }).first()
  if (await v.count()) { await v.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); const bb = await v.boundingBox(); if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d3-view-${w}.png`, clip: { x: Math.max(0, bb.x - 16), y: Math.max(0, bb.y - 90), width: Math.min(w - Math.max(0, bb.x - 16), 380), height: 220 } }) }
  for (const [sel, tag] of [['#eWeek', 'edit'], ['#vWeek', 'view']]) {
    if (tag === 'edit') { await go(page, 'editsched'); await page.waitForTimeout(400) }
    const t = page.locator(`${sel} .fcell.csmsn b`, { hasText: 'THUNDERBOLTS' }).first()
    if (await t.count()) { await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); const bb = await t.boundingBox(); if (bb) await page.screenshot({ path: `${process.env.HP_SHOTS}/d3-${tag}-${w}-long.png`, clip: { x: Math.max(0, bb.x - 16), y: Math.max(0, bb.y - 150), width: Math.min(w - Math.max(0, bb.x - 16), 380), height: 300 } }) }
    if (tag === 'edit') { await go(page, 'viewsched'); await page.waitForTimeout(500) }
  }
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
