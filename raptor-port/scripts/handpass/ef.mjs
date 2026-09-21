/* BLOCKS E + F + H3/H5 — the edges of the measure, ALL AVAIL, and the Leave War.
   Helpers only; each scenario is its own script beside this one.
   Nothing here injects state: every set-up goes through the app's own controls. */
import { tap, type, put, board, go, shot, V, B } from './lib.mjs'

export const SAT = '2026-07-18'
export const SUN = '2026-07-19'

/** id -> the callsign the app prints. ALWAYS report this, never the id. */
export async function names(page) {
  return page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [k, v.cs])))
}

/** The OIL mode's reading of every person-puck and every item switch on the
    board: who, what the figure says, and what a tap would do. */
export async function modeRead(page) {
  return page.evaluate(() => {
    const P = window.PEOPLE
    const cs = id => (P[id] && P[id].cs) || id || ''
    const items = [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => ({
      key: e.dataset.oilitem,
      text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      title: (e.getAttribute('title') || '').slice(0, 160),
      cls: e.className,
    }))
    const people = [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => {
      const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
      const id = pk ? pk.dataset.person : ''
      return {
        key: e.dataset.oilp,
        who: cs(id),
        id,
        text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30),
        title: (e.getAttribute('title') || '').slice(0, 170),
        cls: e.className,
      }
    })
    return { items, people }
  })
}

/** Every puck the board draws, with the green strip it wears. Outside the mode. */
export async function bars(page) {
  return page.evaluate(() => {
    const P = window.PEOPLE
    const cs = id => (P[id] && P[id].cs) || id || ''
    return [...document.querySelectorAll('#schedBoard .puck[data-person]')]
      .filter(e => !e.closest('#sbRoster') && !e.closest('#eRoster'))
      .map(e => ({
        who: cs(e.dataset.person),
        id: e.dataset.person,
        bar: e.className.match(/oil-(fo|ho)|oilbar-(fo|ho)/)?.slice(1).filter(Boolean)[0]
          || (/oil/.test(e.className) ? e.className.match(/oil[a-z-]*/)[0] : null),
        cls: e.className,
        title: (e.getAttribute('title') || '').slice(0, 170),
        row: (e.closest('.sb-row, .sb-arow, .sb-line, tr, li') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 60) || '',
      }))
  })
}

/** The sentinel (ALL / ALL AVAIL) pucks on the board, with their count chip. */
export async function sentinels(page) {
  return page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')]
    .filter(e => !e.closest('#sbRoster') && /ALL/.test(e.innerText || ''))
    .map(e => ({
      text: (e.innerText || '').replace(/\s+/g, ' ').trim(),
      cls: e.className,
      title: (e.getAttribute('title') || '').slice(0, 200),
      chip: (e.querySelector('.cnt, .chip, .allcnt, [class*=cnt]') || {}).innerText || '',
    })))
}

/* ------------------------------------------------------------------ money */

export async function leaveWar(page) {
  await go(page, 'leavewar')
  await page.waitForTimeout(900)
}

/** What the Leave War grid says on a person's date, plus every OIL record the
    tracker holds for that date. Read through the app's own screens. */
export async function money(page, personIds, date) {
  await leaveWar(page)
  const grid = await page.evaluate(([ids, d]) => {
    const out = {}
    for (const id of ids) {
      const cell = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      const mark = document.querySelector(`[data-testid="mark-${id}-${d}"]`)
      out[id] = cell ? {
        text: (cell.innerText || '').replace(/\s+/g, ' ').trim(),
        cls: cell.className,
        mark: mark ? (mark.innerText || '').trim() + ' | ' + mark.className : null,
      } : { text: 'ROW NOT ON THE GRID', cls: '', mark: null }
    }
    return out
  }, [personIds, date])
  return grid
}

/** The OIL tracker's own boxes, read from inside the tracker sheet. */
export async function closeSheets(page) {
  for (let i = 0; i < 4; i++) {
    const scrim = page.locator('[data-testid="sheet-scrim"]:visible')
    if (!(await scrim.count())) break
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
  }
}

export async function tracker(page, personIds) {
  await leaveWar(page)
  await closeSheets(page)
  const open = await page.locator('[data-testid="oil-tracker"]').first()
  await open.click()
  await page.waitForTimeout(1100)
  const rows = await page.evaluate(ids => {
    const P = window.LWSTATE ? null : null
    const out = {}
    for (const id of ids) {
      const row = document.querySelector(`[data-oilrow="${id}"]`)
      if (!row) { out[id] = { found: false }; continue }
      const entries = [...row.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => ({
        testid: e.dataset.testid || e.getAttribute('data-testid'),
        cls: e.className,
        text: (e.innerText || '').replace(/\s+/g, ' ').trim(),
        buttons: [...e.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean),
      }))
      out[id] = { found: true, text: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400), entries }
    }
    return out
  }, personIds)
  return rows
}

export async function closeTracker(page) {
  const x = page.locator('[data-testid="oil-close"]').first()
  if (await x.count() && await x.isVisible()) { await x.click(); await page.waitForTimeout(500) }
}

/** Open a person's day detail on the grid (the tap list / day sheet). */
export async function dayDetail(page, personId, date) {
  await leaveWar(page)
  const cell = page.locator(`[data-testid="cell-${personId}-${date}"]`).first()
  await cell.scrollIntoViewIfNeeded()
  await cell.click()
  await page.waitForTimeout(900)
  const txt = await page.evaluate(() => {
    const sheet = document.querySelector('[role="dialog"].bidsheet') || document.querySelector('[role="dialog"]')
    return sheet ? (sheet.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1600) : 'NO SHEET OPENED'
  })
  await closeSheets(page)
  return txt
}

export { tap, type, put, board, go, shot, V, B }


/** Sign the four roles and press the day's own "Publish AL<n>" button.
    A published day has no `data-beak`, so lib's publish() cannot reach it. */
export async function publishAL(page, di) {
  const sels = page.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(500)
  const btn = page.locator('#schedBoard button:visible').filter({ hasText: /^Publish AL\d+$/ }).first()
  if (!(await btn.count())) return { published: false, why: 'no Publish AL button on the board' }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { published: false, why: label + ' is locked: ' + (await btn.getAttribute('title')) }
  await btn.click()
  await page.waitForTimeout(1200)
  const ver = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { published: true, pressed: label, version: ver }
}

/** Fill a seat / add-zone and PROVE it landed by reading the day's own record,
    not the DOM container (an add-zone stays empty after the person is added). */
export async function putSure(page, armSel, pid, verify) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    const armedAlready = await page.evaluate(() => !!(window.ARM && window.ARM.key))
    if (armedAlready) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    /* a people cell that already holds pucks has its "+ add" affordance at the
       end; clicking the cell's CENTRE would hit a puck and select him instead */
    const addz = page.locator(`#schedBoard ${armSel} .addz:visible`).first()
    if (await addz.count()) {
      await addz.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(120)
      const b = await addz.boundingBox()
      if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
      await page.waitForTimeout(260)
    } else {
      await tap(page, armSel)
      await page.waitForTimeout(250)
    }
    if (!(await page.evaluate(() => window.ARM && window.ARM.key))) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
    if (!(await p.count())) return 'FAILED nobody offered for ' + armSel
    await p.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(120)
    try { await p.click({ timeout: 2500 }) }
    catch { const b = await p.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
    await page.waitForTimeout(500)
    if (await page.evaluate(verify, pid)) return pid
  }
  return 'FAILED ' + armSel
}

/** File a personal request through the board's own door.
    `door` is 'g' (Ground Programme "+ Inputs" — commitments) or 'u'
    (Unavailable "+ Add" — leave, medical, overseas duty). The OIL question,
    when it is raised, is answered with `oil`. */
export async function fileRequest(page, di, { door = 'g', person, type: t, st, en, allday = true, oil = 'no' }) {
  await page.locator(`#schedBoard [data-inpadd="${di}.${door}"]:visible`).first().click()
  await page.waitForTimeout(700)
  const pop = page.locator('#inpEditPop')
  const before = await page.evaluate(() => Object.keys(window.INPUTS).length)
  if (person) await pop.locator('select').nth(0).selectOption(person)
  if (t) await pop.locator('select').nth(1).selectOption(t)
  await page.waitForTimeout(200)
  if (door === 'u') {
    const btn = pop.locator('.spanbtn').filter({ hasText: allday ? /^ALL DAY$/ : /^CUSTOM$/ }).first()
    if (await btn.count()) { await btn.click(); await page.waitForTimeout(250) }
    if (!allday) { if (st) await pop.locator('#inpEditStart').fill(st); if (en) await pop.locator('#inpEditEnd').fill(en) }
  } else {
    const cb = pop.locator('input[type=checkbox]').first()
    if (await cb.count() && allday !== await cb.isChecked()) { await cb.click(); await page.waitForTimeout(200) }
    if (!allday) { if (st) await pop.locator('input[type=time]').nth(0).fill(st); if (en) await pop.locator('input[type=time]').nth(1).fill(en) }
  }
  await page.waitForTimeout(250)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(900)
  const conf = page.locator('[data-testid="oilconf"]')
  let asked = false, question = ''
  if (await conf.count() && await conf.isVisible()) {
    asked = true
    question = (await conf.innerText()).replace(/\s+/g, ' ').trim().slice(0, 260)
    await conf.locator('button').filter({ hasText: oil === 'yes' ? /^Yes/ : /^No OIL/ }).first().click()
    await page.waitForTimeout(350)
    await conf.getByRole('button', { name: 'Save', exact: true }).click()
    await page.waitForTimeout(900)
  }
  /* a medical type raises a second ask — "attach the chit?" — on top of the
     form; it must be answered or the next door cannot be opened */
  const doc = page.locator('[data-testid="docconf"]')
  let docAsk = ''
  if (await doc.count() && await doc.isVisible()) {
    docAsk = (await doc.innerText()).replace(/\s+/g, ' ').trim().slice(0, 200)
    const btns = await doc.locator('button').allInnerTexts()
    const skip = doc.locator('button').filter({ hasText: /Not now|Skip|Later|No thanks|^No$|Done|Close/i }).first()
    if (await skip.count()) await skip.click()
    else { await page.keyboard.press('Escape') }
    await page.waitForTimeout(700)
    docAsk += ' || buttons: ' + btns.join(' / ')
  }
  for (let i = 0; i < 3 && await page.locator('#inpEditPop:visible').count(); i++) {
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  }
  const after = await page.evaluate(() => Object.keys(window.INPUTS).length)
  return { added: after - before, oilAsked: asked, question, docAsk }
}
