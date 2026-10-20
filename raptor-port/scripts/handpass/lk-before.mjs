/* The look-and-keys night job (21 Oct 26) — the host's reproductions BEFORE any fix, on the build of main:
   [OG-TAG-OVER-COUNT] the corner tag over an ALL AVAIL count, [INP-OIL-CHIP-PHONE] the green OIL chip on a request's
   card, [BATCH-14OCT-LEFTOVERS] (a) the Cancel sheet's chips by keyboard. Pictures and measurements only.
   Run: HP_URL=http://localhost:4296 HP_SHOTS=<folder> node scripts/handpass/lk-before.mjs */
console.log('lk-before v4')
const { open, go, shot, login, SHOTS } = await import('./lib.mjs')
const { openAt } = await import('./lk-lib.mjs')

const box = (r) => r && `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}×${Math.round(r.h)}`
const overlap = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

/* the corner tag of every seat that holds a count chip, measured as PAINTED: the seat's box, the ::after's offsets
   and its used size, against the chip's own box */
const TAGS = () => [...document.querySelectorAll('.seat')].filter(s => s.offsetWidth && s.querySelector('.oilcount')).map(s => {
  const st = getComputedStyle(s, '::after')
  const sr = s.getBoundingClientRect(), cr = s.querySelector('.oilcount').getBoundingClientRect()
  const pk = s.querySelector('.puck, [data-person]')?.getBoundingClientRect()
  const has = st.content && st.content !== 'none' && st.content !== 'normal'
  const w = parseFloat(st.width) + parseFloat(st.paddingLeft) + parseFloat(st.paddingRight) + parseFloat(st.borderLeftWidth) + parseFloat(st.borderRightWidth)
  const h = parseFloat(st.height) + parseFloat(st.paddingTop) + parseFloat(st.paddingBottom) + parseFloat(st.borderTopWidth) + parseFloat(st.borderBottomWidth)
  const right = parseFloat(st.right), top = parseFloat(st.top)
  const tag = has ? { x: sr.right - right - w, y: sr.top + top, w, h } : null
  return { what: has ? st.content : '(no tag)', where: s.closest('[id]')?.id || '', tag, chip: { x: cr.x, y: cr.y, w: cr.width, h: cr.height },
    puck: pk ? { x: pk.x, y: pk.y, w: pk.width, h: pk.height } : null }
})

/* ---- [OG-TAG-OVER-COUNT]: Saber puts ALL AVAIL on an unpublished day's Common Programme row; Ranger (a member)
   then opens View-only Sched, where the change is new to him */
{
  const { browser, page, errors } = await open({ width: 1440, height: 900 })
  await go(page, 'editsched')
  const di = await page.evaluate(() => { const w = window; for (let d = 6; d >= 0; d--) if (!w.dayApproved(d) && (w.DAYS[d].allhands || []).length) return d; return -1 })
  console.log('unpublished day with a Common Programme row:', di)
  const r = await page.evaluate((d) => { const w = window; const ok = w.fillSlot(`a:${d}.0.+`, 'allavail'); w.afterSchedMutate(); return { ok, who: JSON.stringify(w.DAYS[d].allhands[0].who), prog: w.DAYS[d].allhands[0].prog } }, di)
  console.log('ALL AVAIL put on its first row:', JSON.stringify(r))
  await page.waitForTimeout(400)
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Logout/.test(x.textContent || '')); if (b) b.click() })
  await login(page, 'u')
  for (const [label, w] of [['desktop', 1440], ['phone', 390]]) {
    await page.setViewportSize({ width: w, height: w > 600 ? 900 : 844 })
    await go(page, 'viewsched')
    await page.waitForTimeout(400)
    /* bring that day's Common Programme row into view */
    const seat = page.locator(`#vWeek .day[data-day="${di}"] .seat:has(.oilcount)`).first()
    if (await seat.count()) { await seat.scrollIntoViewIfNeeded(); await page.waitForTimeout(300) }
    const t = await page.evaluate(TAGS)
    for (const x of t) console.log(`${label}: ${x.what} in #${x.where} — tag ${box(x.tag)} · chip ${box(x.chip)} · puck ${box(x.puck)} · OVERLAP ${overlap(x.tag, x.chip)}`)
    if (await seat.count()) {
      const b = await seat.boundingBox()
      await page.screenshot({ path: `${SHOTS}/before-og-tag-${label}.png`, clip: { x: Math.max(0, b.x - 60), y: Math.max(0, b.y - 30), width: Math.min(360, w - Math.max(0, b.x - 60)), height: 80 } })
    }
  }
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
}

/* ---- [INP-OIL-CHIP-PHONE]: the Inputs list. On a phone the List draws the input's CARD (ui/InputCard.tsx) — its only
   OIL mark is the "OIL?" tag in the corner, beside LATE and the hours; the green OIL chip (`.roil`) lives on the
   desktop table only. Both are measured: the card at 390 and 320, the table at its narrowest widths. Inputs filed on
   Saturday 17 Oct 26 through the app's own filing body, one with the OIL question unanswered (LATE too), one answered. */
const FILE = (rows) => {
  const w = window, P = w.PEOPLE
  const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
  return rows.map((r, i) => { const iid = 'lk-' + i; w.fileInput({ iid, person: crew[r.who % crew.length], type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 540, e: 720, ...(r.more || {}) }); return iid })
}
const MARKS = () => [...document.querySelectorAll('.roil, .oiltag, .sd-late')].filter(c => c.offsetWidth).map(c => {
  const host = c.closest('tr, .icard'), cr = c.getBoundingClientRect(), hits = []
  for (const el of host.querySelectorAll('td, .icard-hrs, .icard-who, .icard-kind, .icard-text, .icard-by, .oiltag, .sd-late, .roil')) {
    if (el === c || el.contains(c) || c.contains(el)) continue
    const rg = document.createRange(); rg.selectNodeContents(el)
    for (const r of rg.getClientRects()) if (r.width > 1 && cr.x < r.right - 0.5 && cr.right > r.x + 0.5 && cr.y < r.bottom - 0.5 && cr.bottom > r.y + 0.5) hits.push(`${el.dataset.label || el.className}: ${Math.round(Math.min(cr.right, r.right) - Math.max(cr.x, r.x))}×${Math.round(Math.min(cr.bottom, r.bottom) - Math.max(cr.y, r.y))}`)
  }
  const hb = host.getBoundingClientRect()
  return { iid: host.dataset.iid || host.querySelector('[data-iid]')?.dataset.iid || '', mark: c.className + '[' + c.textContent + ']', at: `${Math.round(cr.x)},${Math.round(cr.y)} ${Math.round(cr.width)}×${Math.round(cr.height)}`, inside: cr.x >= hb.x - 0.5 && cr.right <= hb.right + 0.5, hits }
})
for (const w of [390, 320, 821, 1024]) {
  const { browser, page, errors } = await openAt({ width: w, height: w === 320 ? 568 : 844 })
  await go(page, 'inputs')
  const ids = await page.evaluate(FILE, [{ who: 3, more: { mod: '2026-10-16' } }, { who: 4, more: { oil: { '2026-10-17': 1 } } }, { who: 5 }])
  await page.click('#inListBtn'); await page.waitForTimeout(300)
  await page.click('#inRangeBtn'); await page.click('#inRangeAll'); await page.waitForTimeout(400)
  const m = (await page.evaluate(MARKS)).filter(x => ids.includes(x.iid))
  console.log(`inputs ${w}: ${m.length} marks on the three filed inputs`)
  for (const r of m) console.log(`  ${r.iid} ${r.mark} at ${r.at} inside=${r.inside} — overlaps: ${r.hits.length ? r.hits.join('; ') : 'none'}`)
  const first = page.locator(`[data-iid="${ids[0]}"]:visible`).first()
  if (await first.count()) {
    await first.scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
    const b = await first.boundingBox()
    await page.screenshot({ path: `${SHOTS}/before-oilchip-${w}.png`, clip: { x: 0, y: Math.max(0, b.y - 40), width: w, height: Math.min(260, 844 - Math.max(0, b.y - 40)) } })
  }
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
}

/* ---- [BATCH-14OCT-LEFTOVERS] (a): the board's Cancel sheet, every control reached by Tab, its ring as painted */
{
  const { browser, page, errors } = await open({ width: 1440, height: 900 })
  await go(page, 'editsched')
  await page.click('#eWeek [data-sbday="1"]:visible')
  await page.waitForSelector('#schedBoard')
  await page.waitForTimeout(500)
  const cx = page.locator('#schedBoard [data-pcx]:visible, #schedBoard [data-cx]:visible').first()
  console.log('a CX button on the board:', await cx.count())
  await cx.click()
  await page.waitForSelector('#cxPop:not([hidden])')
  const seen = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const f = await page.evaluate(() => {
      const a = document.activeElement
      if (!a || !a.closest('#cxPop')) return null
      const s = getComputedStyle(a)
      return { name: (a.getAttribute('aria-label') || a.textContent || a.id || a.tagName).trim().slice(0, 18), cls: a.className, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset }
    })
    if (!f) break
    if (seen.find(x => x.name === f.name && x.cls === f.cls)) break
    seen.push(f)
    if (/WX|✎/.test(f.name)) await shot(page, `before-cx-ring-${f.name.includes('✎') ? 'edit' : 'wx'}`, page.locator('#cxPop .airpop-box'))
  }
  for (const f of seen) console.log(`  Tab → ${f.name.padEnd(18)} outline ${f.outline} offset ${f.offset}`)
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
}
