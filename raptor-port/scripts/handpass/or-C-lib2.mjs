// Walker C helpers, part 2: every surface of one input (reading only).
import { goEdit, openBoard, closeBoard, rowIdx, MONTHS } from './or-C-lib.mjs'

async function toMonth(p) {
  await p.evaluate(() => window.go('inputs')); await p.locator('#inCalBtn').waitFor(); await p.waitForTimeout(300)
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
  await p.locator('#inpCal').waitFor()
  for (let i = 0; i < 12; i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)); const want = 2026 * 12 + 6
    if (at === want) break
    await p.locator(at < want ? '#icNext' : '#icPrev').click()
  }
}

export async function surfaces(p, { di, iso, iid, skipInputs = false }) {
  const out = {}
  await goEdit(p)
  const ri = await rowIdx(p, di, iid)
  out.weekRow = ri < 0 ? '(no row in DAYS)' : await p.evaluate(([di, ri]) => {
    const z = document.querySelectorAll('#eWeek .day:not(.peek)')[di]
    const f = z.querySelector(`[data-fill="g:${di}.${ri}.+"]`) || z.querySelector(`[data-slot="g:${di}.${ri}"]`)
    const r = f && f.closest('.pl-row'); if (!r) return '(no row drawn)'
    const names = [...r.querySelectorAll('.ppl .puck')].map(x => (x.querySelector('.nm') || {}).textContent)
    const chip = r.querySelector('.oilcount'); const t = [...r.querySelectorAll('.t')].map(x => x.textContent.trim())
    const tag = r.querySelector('.cxtag')
    return `[${r.className.replace('pl-row ', '')}] ${(r.querySelector('.nm .ntx') || {}).textContent} ${t.join('-')} | ${names.join(', ')}${chip ? ' +counter ' + chip.textContent.trim() : ''} | rmk: ${((r.querySelector('.rmk') || {}).textContent || '').trim()}${tag ? ' | CXTAG:' + tag.textContent.trim() : ''}`
  }, [di, ri])
  { const has = await p.evaluate(di => document.querySelectorAll('#eWeek .day:not(.peek)')[di].querySelectorAll('.sec-inp .pl-row').length, di); if (!has) { const f = p.locator('#eWeek .sec-inp .pl-fold[data-pitog="' + di + '"]').first(); if (await f.count()) { await f.scrollIntoViewIfNeeded().catch(() => {}); await f.click(); await p.waitForTimeout(300) } } }
  out.weekLine = await p.evaluate(di => {
    const z = document.querySelectorAll('#eWeek .day:not(.peek)')[di]
    return [...z.querySelectorAll('.sec-inp .pl-row')].map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).join(' || ') || '(none)'
  }, di)
  await openBoard(p, di)
  const hasRows = await p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length)
  if (!hasRows) { const f = p.locator(`#schedBoard [data-pitog="${di}"]:visible`).first(); if (await f.count()) { await f.scrollIntoViewIfNeeded().catch(() => {}); await f.click().catch(() => {}); await p.waitForTimeout(400) } }
  out.boardRow = ri < 0 ? '(no row in DAYS)' : await p.evaluate(([di, ri]) => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent)
    const r = rows.find(x => x.querySelector(`[data-fill="g:${di}.${ri}.+"], [data-slot="g:${di}.${ri}"]`)); if (!r) return `(no row drawn; ${rows.length} rows)`
    const names = [...r.querySelectorAll('.ppl .puck')].map(x => (x.querySelector('.nm') || {}).textContent)
    const chip = r.querySelector('.oilcount'); const ins = [...r.querySelectorAll('input.ain, textarea.ain')].map(x => x.value)
    return `${ins.join(' / ')} | ${names.join(', ')}${chip ? ' +counter ' + chip.textContent.trim() : ''}${[...r.querySelectorAll('.cxtag')].map(x => ' | CXTAG:' + x.textContent.trim()).join('')}${r.className.includes('cx') ? ' | class cx' : ''}`
  }, [di, ri])
  out.boardLine = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow.inprow')].filter(e => e.offsetParent).map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).join(' || ') || '(none)')
  await closeBoard(p)
  if (!skipInputs) {
    await toMonth(p)
    await p.waitForSelector(`[data-icday="${iso}"]`)
    out.bar = await p.evaluate(iid => [...document.querySelectorAll(`.ib-bar[data-iid="${iid}"]`)].map(e => ({ text: (getComputedStyle(e, '::before').content.replace(/^none$|"/g, '')) + (e.textContent || '').replace(/\s+/g, ' ').trim(), strike: getComputedStyle(e).textDecorationLine, opacity: getComputedStyle(e).opacity, tip: e.getAttribute('title') })).slice(0, 2), iid)
    await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(350)
    out.card = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '(no card)' }, iid)
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await p.waitForTimeout(250) }
    await p.locator('#inListBtn').click(); await p.waitForTimeout(400)
    if (!(await p.locator('#inRangeAll').count())) await p.locator('#inRangeBtn').click()
    await p.locator('#inRangeAll').click().catch(() => {}); await p.waitForTimeout(400)
    out.list = await p.evaluate(iid => { const r = document.querySelector(`tr[data-iid="${iid}"], .icard[data-iid="${iid}"]`); return r ? (r.innerText || '').replace(/\s+/g, ' ').trim() : '(no list row)' }, iid)
    await p.locator('#inCalBtn').click(); await p.waitForTimeout(200)
  }
  return out
}

export async function readWindow(p, { iso, iid, close = true }) {
  await toMonth(p)
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
  await p.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`).first().click()
  await p.waitForSelector('#inpEditPop', { timeout: 5000 }); await p.waitForTimeout(400)
  const t = await p.evaluate(() => {
    const w = document.querySelector('[data-testid="win-inputedit"]'); const bar = w.querySelector('.win-bar')
    return { head: (bar ? bar.innerText : '').replace(/\s+/g, ' ').trim(), body: (w.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 700),
      people: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs), ph: [...w.querySelectorAll('[data-ph][aria-pressed="true"]')].map(b => b.getAttribute('data-ph')), cxm: !!w.querySelector('[data-testid="inped-cx"]') }
  })
  if (close) {
    const c = p.locator('#inpEditCancel:visible, #inpEditClose:visible').first(); if (await c.count()) await c.click(); await p.waitForTimeout(250)
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.click(); await p.waitForTimeout(200)
  }
  return t
}
