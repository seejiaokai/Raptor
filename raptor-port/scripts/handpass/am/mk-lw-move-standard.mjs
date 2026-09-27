/* THE MOCK-UP FOR [LW-MOVE-STANDARD] (27 Sep 26) — his rulings D264 (one format and look for the one-day sheet and the
   drag-selection sheet), D265 (a record that can move always offers Move — a bid under an OIL award moves alone) and
   D266 (the day's list moves a record by the grid's move mode, no date box).
   Pictures of the REAL app (the production build served on 4177, a fresh demo world each run), the fixture made through
   the app's own controls (Vector's OIL award and his LL bid on 3 Jan — the owner's own example; bids for Ryder and Wisp;
   a member's own bid), then the proposal drawn into the real sheets' own markup and classes: the rows re-ordered, Move
   and Delete put on one row of their own. Nothing here is built; the page is docs/mock/lw-move-standard.html.
   Run from raptor-port/, the preview on 4177:
     node scripts/handpass/am/mk-lw-move-standard.mjs desktop
     node scripts/handpass/am/mk-lw-move-standard.mjs phone
   A RECORD once the page is approved: re-running it on a later build draws into sheets that may have changed.
   The observations the recipe carries (241, 249, 296): everything drawn is applied LAST, after every scroll, and each
   picture checks its drawn premise is still on screen before it is taken. */
import '../ms/ms-env.mjs'
import { mkdirSync } from 'node:fs'
const M = await import('../mv/mv-lib.mjs')
const { WIDTH, PHONE, openMv, signInAs, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, dragRect, centre, fingerHoldDrag, bidOn } = M

const OUT = 'docs/mock/img/lw-move-standard'
mkdirSync(OUT, { recursive: true })
const { browser, page, errors, cdp } = await openMv('a')
const done = []
async function step(name, fn) { try { await fn() } catch (e) { console.log('FAILED', name, String(e && e.message || e).slice(0, 300)) } }

/** The picture: the phone's whole screen; on the desktop, the open sheet with a strip of the grid above it. `premise`
    is checked at the moment of the shot (Observation 296) — a picture whose drawn state was repainted away is refused. */
async function snap(name, premise) {
  await page.waitForTimeout(300)
  if (premise) {
    const ok = await page.evaluate(p => !!document.querySelector(p), premise)
    if (!ok) { console.log('REFUSED', name, '— premise gone:', premise); return }
  }
  const f = `${OUT}/${WIDTH}-${name}.png`
  if (PHONE) await page.screenshot({ path: f })
  else {
    const s = page.locator('.bidsheet[role="dialog"]:visible').last()
    const b = (await s.count()) ? await s.boundingBox() : null
    if (!b) await page.screenshot({ path: f })
    else {
      const top = Math.max(0, b.y - 150)
      await page.screenshot({ path: f, clip: { x: Math.max(0, b.x - 60), y: top, width: Math.min(1440 - Math.max(0, b.x - 60), b.width + 120), height: Math.min(900 - top, b.y - top + b.height + 20) } })
    }
  }
  done.push(name); console.log('ok', name)
}

/** Select a block the way this width does: a mouse drag on the desktop, a held-then-dragged finger on the phone. */
async function selectBlock(a, isoA, b, isoB) {
  if (!PHONE) return dragRect(page, a, isoA, b, isoB)
  const p1 = await centre(page, `cell-${a}-${isoA}`)
  const p2 = await page.locator(`[data-testid="cell-${b}-${isoB}"]`).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await fingerHoldDrag(page, cdp, p1, [p2])
  return sheetNow(page)
}

/* ------------------------------------------------------------------------------------------------------------------
   THE DRAWING. Every function below takes the REAL open sheet and rearranges ITS OWN rows (the app's markup and
   classes), so what is drawn is exactly the app's look — only the order, one new row and a few words change.
   ------------------------------------------------------------------------------------------------------------------ */

/** The one standard row for what is already there: Move (the quiet grey chip it already is on the one-day sheet), then
    Delete in the dashed quiet look today's one-day Clear wears — NOT red: on the day's list Delete sits beside Refuse,
    and two red buttons side by side read as the same act (Refuse keeps the bid as history; Delete removes it). Same
    buttons, same place, same look on every sheet. The dashed Delete is drawn by one injected rule (`MKDEL`). */
const SELECTED_ROW = '<div class="bidsheet-row mk-sel"><span class="lab">Selected</span><button class="dchip move">Move</button><button class="dchip mkdel">Delete</button></div>'
const MKDEL = '.bidsheet .dchip.mkdel, .bidsheet .dl-acts .dchip.mkdel { background: var(--panel-2); color: var(--ink-2); border: 1px dashed var(--ink-3); }'

/** The one-day sheet (the bid sheet) in the proposed order. order 'A' (recommended): what's there first — How many ·
    Decide · Selected (Move · Delete) · How much · Which leave · the admin's +OIL / PO / PI. order 'B': place leave first —
    How many · How much · Which leave · Decide · Selected · +OIL / PO / PI. Clear leaves the leave chips (it is the
    Selected row's Delete now); Move leaves the decision row. */
async function drawOneDay(order) {
  await page.evaluate(({ order, SEL }) => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop()
    const rowOf = t => { const e = s.querySelector(`[data-testid="${t}"]`); return e && e.closest('.bidsheet-row') }
    const hd = s.querySelector('.bidsheet-hd')
    const many = rowOf('span-one'), much = rowOf('portion-full'), which = rowOf('bid-LL'), dec = rowOf('decide-ack'), extra = rowOf('bid-oil') || rowOf('bid-postout')
    const rest = [...s.children].filter(c => ![hd, many, much, which, dec, extra].includes(c) && !c.classList.contains('mk-sel'))
    s.querySelector('[data-testid="decide-shift"]')?.remove()
    s.querySelector('[data-testid="bid-clear"]')?.remove()
    if (dec) dec.querySelector('.lab').textContent = 'Decide'
    const tmp = document.createElement('div'); tmp.innerHTML = SEL; const sel = tmp.firstChild
    const seq = order === 'A' ? [hd, many, dec, sel, much, which, extra] : [hd, many, much, which, dec, sel, extra]
    for (const n of [...seq, ...rest]) if (n) s.appendChild(n)
  }, { order, SEL: SELECTED_ROW })
}

/** The drag-selection sheet in the same two orders (no How many: the drag IS the selection). Its "Move…" becomes the
    same Move as the one-day sheet's; Delete keeps its red outline. */
async function drawBlock(order) {
  await page.evaluate(({ order, SEL }) => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop()
    const rowOf = t => { const e = s.querySelector(`[data-testid="${t}"]`); return e && e.closest('.bidsheet-row') }
    const hd = s.querySelector('.bidsheet-hd')
    const much = rowOf('sel-portion-full'), which = rowOf('sel-LL'), dec = rowOf('sel-approve'), old = rowOf('sel-delete')
    const po = rowOf('sel-postout')
    if (po) po.querySelector('button').textContent = 'PO'
    old?.remove()
    const tmp = document.createElement('div'); tmp.innerHTML = SEL; const sel = tmp.firstChild
    const seq = order === 'A' ? [hd, dec, sel, much, which, po] : [hd, much, which, dec, sel, po]
    const rest = [...s.children].filter(c => !seq.includes(c))
    for (const n of [...seq, ...rest]) if (n) s.appendChild(n)
  }, { order, SEL: SELECTED_ROW })
}

/** The day's list, each record's own buttons in the standard order: the decisions, then Move, then Delete — the one
    word for taking a record away (the one-day sheet's Clear and the block's Delete do the same job, D264 (3)). A bid
    gains the Move it never had (D265); an OIL award keeps Edit… and no Move (an award never moves, D260). */
async function drawList() {
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop()
    for (const li of s.querySelectorAll('li.dl-line')) {
      const acts = li.querySelector('.dl-acts'); if (!acts) continue
      const has = t => !!acts.querySelector(`[data-testid^="dl-${t}-"]`)
      const b = (cls, txt) => `<button class="dchip ${cls}">${txt}</button>`
      let html = ''
      if (has('approve')) html = b('ack', 'Ack') + b('approve', 'Approve') + b('refuse', 'Refuse') + b('move', 'Move') + b('mkdel', 'Delete')
      else if (has('oil-edit')) html = b('', 'Edit…') + b('mkdel', 'Delete')
      else if (has('unapprove')) html = b('', 'Back to bid') + b('refuse', 'Refuse') + b('move', 'Move') + b('mkdel', 'Delete')
      else continue
      acts.innerHTML = html
      acts.classList.add('mk-drawn')
    }
  })
}

/** The move banner a picked-up record rides (D262's move mode), drawn: the count is what will move — the award stays. */
async function drawBanner(text) {
  await page.evaluate(text => {
    document.querySelector('.mk-banner')?.remove()
    const host = document.querySelector('#page-leavewar') || document.body
    const d = document.createElement('div')
    d.className = 'mv-banner mk-banner'
    d.innerHTML = `<span class="mv-msg">${text}</span><button class="dchip">Cancel</button>`
    host.appendChild(d)
  }, text)
}

/* ------------------------------------------------------------------------------------------------------------------
   THE FIXTURE — made the way a person makes it (bug-check order §7.7): the admin, bidding open, January 2026.
   ------------------------------------------------------------------------------------------------------------------ */
await lwOpen(page, '2026-01-05')
await page.addStyleTag({ content: MKDEL })
await step('fixture', async () => {
  /* Vector's 3 Jan, the owner's picture: an OIL award first (+OIL on the day's own sheet), then an LL bid beside it */
  const t = await tapCell(page, 'divot', '2026-01-03')
  if (t.open !== 'bid-picker') throw new Error('Vector 3 Jan opened ' + t.open)
  await sheetPress(page, 'bid-oil')
  await page.fill('[data-testid="oil-why"]', 'Exercise recovery')
  await page.fill('[data-testid="oil-given-by"]', 'OC Ops')
  await sheetPress(page, 'oil-give')
  await closeSheets(page)
  const v = await bidOn(page, 'divot', '2026-01-03', 'LL')
  const r = await bidOn(page, 'xray', '2026-01-04', 'LL')
  const w = await bidOn(page, 'shrek', '2026-01-05', 'LL')
  console.log('fixture', JSON.stringify({ vector: v.placed, ryder: r.placed, wisp: w.placed }))
})

/* ---------- 1 · TODAY: the one-day sheet and the block sheet, as his pictures showed them ---------- */
await step('1 one-day today', async () => {
  await tapCell(page, 'xray', '2026-01-04'); await snap('1-oneday-today'); await closeSheets(page)
})
await step('1 block today', async () => {
  await selectBlock('xray', '2026-01-04', 'shrek', '2026-01-05'); await snap('1-block-today'); await closeSheets(page)
})

/* ---------- 2 · PROPOSED, order A (what's there first) — the recommendation ---------- */
await step('2 one-day A', async () => {
  await tapCell(page, 'xray', '2026-01-04'); await drawOneDay('A'); await snap('2-oneday-A', '.mk-sel'); await closeSheets(page)
})
await step('2 block A', async () => {
  await selectBlock('xray', '2026-01-04', 'shrek', '2026-01-05'); await drawBlock('A'); await snap('2-block-A', '.mk-sel'); await closeSheets(page)
})

/* ---------- 3 · the other order, B (place leave first) ---------- */
await step('3 one-day B', async () => {
  await tapCell(page, 'xray', '2026-01-04'); await drawOneDay('B'); await snap('3-oneday-B', '.mk-sel'); await closeSheets(page)
})
await step('3 block B', async () => {
  await selectBlock('xray', '2026-01-04', 'shrek', '2026-01-05'); await drawBlock('B'); await snap('3-block-B', '.mk-sel'); await closeSheets(page)
})

/* ---------- 4 · D265: Vector's 3 Jan — the day's list and the block over it ---------- */
await step('4 list today', async () => {
  const t = await tapCell(page, 'divot', '2026-01-03'); console.log('list opened', t.open); await snap('4-list-today'); await closeSheets(page)
})
await step('4 list proposed', async () => {
  await tapCell(page, 'divot', '2026-01-03'); await drawList(); await snap('4-list-proposed', '.mk-drawn'); await closeSheets(page)
})
await step('4 block3 today', async () => {
  await selectBlock('xray', '2026-01-03', 'shrek', '2026-01-03'); await snap('4-block3-today'); await closeSheets(page)
})
await step('4 block3 proposed', async () => {
  await selectBlock('xray', '2026-01-03', 'shrek', '2026-01-03'); await drawBlock('A'); await snap('4-block3-proposed', '.mk-sel'); await closeSheets(page)
})

/* ---------- 5 · D266: Move on the list picks that one record up — the grid's move mode, no date box ---------- */
await step('5 moving', async () => {
  await closeSheets(page)
  const c = await centre(page, 'cell-divot-2026-01-03')
  await drawBanner('Tap a day to move 1 entry')
  /* the chip being carried, marked the way the landing preview marks a day (drawn — the real one follows the mouse) */
  await page.evaluate(() => { const e = document.querySelector('[data-testid="cell-divot-2026-01-03"]'); if (e) e.style.outline = '2px dashed rgba(59,198,232,.9)' })
  const f = `${OUT}/${WIDTH}-5-moving.png`
  const ok = await page.evaluate(() => !!document.querySelector('.mk-banner'))
  if (!ok) { console.log('REFUSED 5-moving'); return }
  await page.screenshot({ path: f })
  done.push('5-moving'); console.log('ok 5-moving')
  await page.evaluate(() => { document.querySelector('.mk-banner')?.remove(); const e = document.querySelector('[data-testid="cell-divot-2026-01-03"]'); if (e) e.style.outline = '' })
})

/* ---------- 6 · a member's own bid: today Clear only; proposed the same Selected row (question 3) ---------- */
await step('6 member', async () => {
  await signInAs(page, 'us')
  await lwOpen(page, '2026-01-05')
  await page.addStyleTag({ content: MKDEL })
  const b = await bidOn(page, 'bane', '2026-01-06', 'LL')
  console.log('member bid', b.placed, b.why)
  await tapCell(page, 'bane', '2026-01-06'); await snap('6-member-today'); await closeSheets(page)
  await tapCell(page, 'bane', '2026-01-06'); await drawOneDay('A'); await snap('6-member-A', '.mk-sel'); await closeSheets(page)
})

console.log('pictures', done.length, done.join(' '))
console.log('errors', errors.length ? errors.slice(0, 8) : 'none')
await browser.close()
