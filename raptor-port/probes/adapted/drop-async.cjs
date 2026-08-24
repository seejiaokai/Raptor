/* drop.js sections A, B2, B3 and B6, adapted for the React port. The
   originals assume a SYNCHRONOUS repaint (mutate, then read the DOM in the
   same evaluate) and instrument window globals the port's ESM modules never
   call (window.tdArm, window.toast, bare DRAG= assignment). The assertions
   here are the same contracts, read the way a React build repaints:
   - A  · a programme row with holes renders no empty elements, survivors
          flush left, every puck the canonical 74px (B49)
   - B2 · a finger wobble inside the hold re-arms instead of cancelling
          (verdict: body.tdrag while held — the user-visible signal)
   - B3 · a drop anywhere on a list row resolves to that row
   - B6 · a drop back onto the same seat says so (verdict: the toast text) */
const { chromium } = require('playwright')
const URL = process.env.PORT_URL || 'http://localhost:4173/'

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  let pass = 0, fail = 0
  const T = (n, got, want) => {
    const ok = String(got) === String(want); ok ? pass++ : fail++
    console.log(`${ok ? ' ok  ' : 'FAIL '} ${n.padEnd(54)} want ${want} · got ${got}`)
  }
  const boot = async ctx => {
    const p = await ctx.newPage()
    p.on('pageerror', e => console.log('  PAGEERR', e.message))
    await p.goto(URL)
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
    await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(900)
    await p.evaluate(() => go('editsched')); await p.waitForTimeout(800)
    return p
  }

  /* ---- A · the offset puck ---------------------------------------------- */
  {
    const p = await boot(await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }))
    await p.evaluate(() => {
      const d = DAYS[0]
      if (!d.allhands || !d.allhands.length) d.allhands = [{ prog: 'PROBE ITEM', sub: '', str: '0900', end: '1000', who: [] }]
      ;['ipman', 'krait', 'romeo', 'vinci', 'badger', 'cards'].forEach(id => fillSlot('a:0.0.+', id))
      afterSchedMutate()
    })
    await p.waitForTimeout(200)
    await p.evaluate(() => { for (let i = 0; i < 3; i++) setSlotVal('a:0.0.' + i, ''); afterSchedMutate() })
    await p.waitForTimeout(200)
    const r = await p.evaluate(() => {
      const row = DAYS[0].allhands[0]
      const cell = document.querySelector('#eWeek .ah-row .ppl[data-fill="a:0.0.+"]')
      const kids = [...cell.children].filter(c => !c.classList.contains('addz'))
      const box = cell.getBoundingClientRect()
      return {
        holes: whoArr(row).filter(x => !x).length,
        crew: whoArr(row).filter(Boolean).length,
        empties: kids.filter(c => !c.classList.contains('seat')).length,
        lefts: kids.filter(c => c.classList.contains('seat')).map(c => Math.round(c.getBoundingClientRect().left - box.left)),
        widths: [...cell.querySelectorAll('.puck')].map(c => Math.round(c.getBoundingClientRect().width)),
      }
    })
    console.log(`A · programme row with ${r.holes} holes and ${r.crew} crew`)
    T('A · a hole renders no element at all', r.empties, 0)
    T('A · every remaining puck is flush left', [...new Set(r.lefts)].length, 1)
    T('A · and every puck is the canonical width', [...new Set(r.widths)].join(','), '74')
    await p.close()
  }

  /* ---- B2/B3/B6 · touch + drop behaviours -------------------------------- */
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
    const p = await boot(ctx)

    /* B2 — wobble inside the hold: the drag ARMS (body.tdrag appears) */
    for (const w of [7, 9, 20, 40]) {
      const r0 = await p.evaluate(() => {
        const s = document.querySelector('#eWeek .seat[data-slot$=".p"]')
        s.scrollIntoView({ block: 'center' }); const bx = s.getBoundingClientRect()
        return { x: Math.round(bx.left + bx.width / 2), y: Math.round(bx.top + bx.height / 2) }
      })
      await p.evaluate(([x, y]) => {
        const el = document.elementFromPoint(x, y)
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }))
      }, [r0.x, r0.y])
      await p.evaluate(([x, y, wb]) => document.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: x + wb, clientY: y + wb, pointerId: 1, isPrimary: true })), [r0.x, r0.y, w])
      await p.waitForTimeout(260)
      const armed = await p.evaluate(() => document.body.classList.contains('tdrag'))
      await p.evaluate(([x, y]) => document.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true })), [r0.x, r0.y])
      await p.waitForTimeout(120)
      T(`B2 · wobble ${String(w).padStart(2)}px → ${w > 26 ? 'cancelled' : 'armed'}`,
        armed ? 'armed' : 'cancelled', w > 26 ? 'cancelled' : 'armed')
    }

    /* B3 — a drop anywhere on a list row resolves to that row */
    const rowDrop = await p.evaluate(async () => {
      const row = document.querySelector('#eWeek .pl-row .ppl[data-fill]')?.closest('.pl-row')
      if (!row) return 'no row'
      row.scrollIntoView({ block: 'center' })
      const cell = row.querySelector('[data-fill]'), rb = row.getBoundingClientRect()
      const cb = cell.getBoundingClientRect()
      const id = Object.keys(PEOPLE).find(x => !PEOPLE[x].special)
      const n = () => row.querySelectorAll('.seat[data-slot]').length
      const y = Math.min(rb.bottom - 2, cb.bottom + 4), x = rb.left + 8
      const el = document.elementFromPoint(x, y)
      if (el && el.closest('[data-fill]')) return 'probe point was inside the cell'
      const n0 = n()
      DRAG = { kind: 'roster', id }
      const ok = applyDrop(el, x, y)
      await new Promise(r => setTimeout(r, 80))
      const row2 = document.querySelector(`#eWeek .pl-row .ppl[data-fill="${cell.dataset.fill}"]`)
      const n1 = row2 ? row2.closest('.pl-row').querySelectorAll('.seat[data-slot]').length : n0
      return ok && n1 > n0 ? 'landed' : `swallowed(ok=${ok} ${n0}->${n1})`
    })
    T('B3 · a drop below the cell still lands on the row', rowDrop, 'landed')

    /* B6 — a drop back onto the same seat reports it (the toast says so) */
    const told = await p.evaluate(async () => {
      const s = [...document.querySelectorAll('#eWeek .seat[data-slot$=".p"]')].find(x => slotVal(x.dataset.slot))
      if (!s) return 'no filled seat'
      const bx = s.getBoundingClientRect()
      DRAG = { kind: 'slot', key: s.dataset.slot }
      applyDrop(s, bx.left + 5, bx.top + 5)
      await new Promise(r => setTimeout(r, 60))
      const t = document.getElementById('toastEl')
      return t && /Already in that seat/.test(t.textContent) ? 'told' : 'silent'
    })
    T('B6 · a drop back onto the same seat reports it', told, 'told')
    await p.close(); await ctx.close()
  }

  console.log(`\n${pass} passed · ${fail} failed`)
  await b.close(); console.log('drop-async done')
  process.exit(fail ? 1 : 0)
})().catch(e => { console.log('ERR', e.message); process.exit(1) })
