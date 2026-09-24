/* w2-06 — THE PHONE (390px): Monday's day head with everything lit (S4), and a MEMBER on the phone view page
   (S37). Every control measured against the screen edge and its neighbours, and TAPPED by a real mouse press
   at its own centre — so a tap that lands on the neighbour (Unpublish instead of Publish AL) would show.
   Rules: AM22 (tag left of the 4×4), AM24 ("Not yet signed"), AM23 ("N pending"), AM28 (the selector; the
   plan name clamped with the full name in the tooltip), AM10/AM15 (sign-offs), AM5/AM31 (the member's picker).
   Usage: node w2-06-phone-head.mjs [s4|s37|all] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, h, bookDay, altPlan, planEdit, audit, clip, screen, signDay,
  viewDay, dayInfo, STATE, PHONE } = L
const part = process.argv[2] || 'all'
const LONG = 'WET WEATHER CONTINGENCY!'   // 24 characters, the most a plan name takes — wide enough to need the clamp

/* press a control where a finger would: at the centre of its box, with a real mouse */
async function pressAt(page, sel) {
  const el = page.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await page.waitForTimeout(200)
  const b = await el.boundingBox(); if (!b) return false
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(700); return true
}

if (part === 'all' || part === 's4') {
  console.log('\n##### S4 — phone 390 — Monday with everything lit #####')
  const { browser, page, errors } = await open({ ...PHONE, state: STATE })
  await installToasts(page); await editWeek(page)
  await altPlan(page, 0); await takeToasts(page)
  await planEdit(page, 0, 'Plan B')
  const inp = page.locator('#draftsModal .tpl-name'); await inp.click(); await inp.fill(LONG); await inp.press('Enter'); await page.waitForTimeout(400)
  await page.locator('#draftsModal button', { hasText: 'Done' }).click(); await page.waitForTimeout(400)
  await signDay(page, 0)
  let hd = await h(page, 0)
  console.log('S4 head', JSON.stringify(hd))
  check('p.S4 lit: AL1 tag, "Not yet signed", "1 pending", selector = the long plan name, Publish AL2 unlocked, Unpublish', hd.tag === 'AL1' && hd.nys && /1\s*pending/.test(hd.pending) && hd.selector.includes(LONG) && hd.alpub && !hd.alpub.disabled && hd.unpub,
    JSON.stringify({ tag: hd.tag, nys: hd.nys, pend: hd.pending, sel: hd.selector.trim(), alpub: hd.alpub, unpub: !!hd.unpub }))
  await page.locator('#eWeek .day[data-day="0"]').evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await page.waitForTimeout(300)
  await L.underBar(page, '#eWeek .day[data-day="0"] .day-head')
  const SEL = ['.day-head .dow', '.day-head .dt', '.day-head [data-daytplopen]', '.day-head .planselbtn', '.day-head .verchip', '.day-head .nysmark', '.day-head .badge',
    '.day-head .dpend', '.day-head .dinfobtn', '.day-head [data-alpub]', '.day-head [data-unpub]', '.day-sign label.sgn', '.day-sign .so-clear']
  const au = await audit(page, '#eWeek .day[data-day="0"]', SEL)
  console.log('S4 audit', JSON.stringify(au))
  const outside = au.items.filter(i => !i.inside), covered = au.items.filter(i => !i.hit)
  check('p.S4 every head control and sign pill is inside the 390px screen', outside.length === 0, JSON.stringify(outside))
  check('p.S4 nothing covers any of them (a press at the centre reaches the control itself)', covered.length === 0, JSON.stringify(covered))
  check('p.S4 no two controls overlap (the tag / "Not yet signed" / 4×4 / date / buttons)', au.over.length === 0, JSON.stringify(au.over))
  /* sizes are RECORDED, not judged: no ruling sets a minimum, and the owner ruled the OIL mode's small phone
     targets fine as they are (D26) — status labels (tag, pending, 4×4) are not tap targets at all */
  note('p.S4 control sizes (px, w×h)', au.items.map(i => `${i.sel.replace('.day-head ', '').replace('.day-sign ', '')}=${i.w}×${i.h}`).join(' '))
  const taps = au.items.filter(i => /daytplopen|planselbtn|dinfobtn|alpub|unpub|label\.sgn|so-clear/.test(i.sel))
  note('p.S4 tap targets under 24px tall', JSON.stringify(taps.filter(i => i.h < 24).map(i => `${i.text || i.sel} ${i.w}×${i.h}`)))
  const tag = au.items.find(i => i.sel.endsWith('.verchip')), badge = au.items.find(i => i.sel.endsWith('.badge'))
  check('p.S4/AM22 the version tag sits LEFT of the 4×4 badge', tag && badge && tag.x + tag.w <= badge.x + 1 && Math.abs(tag.y - badge.y) < 12, JSON.stringify({ tag, badge }))
  const pills = au.items.filter(i => i.sel.endsWith('label.sgn'))
  check('p.S4 the four sign pills wrap under the head (more than one row)', pills.length === 4 && new Set(pills.map(p => p.y)).size > 1, JSON.stringify(pills.map(p => [p.x, p.y, p.w])))
  const selInfo = await page.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="0"] .planselbtn'); const l = b.querySelector('.psl'); return { title: b.title, w: Math.round(b.getBoundingClientRect().width), lw: Math.round(l.getBoundingClientRect().width), scroll: l.scrollWidth, client: l.clientWidth } })
  check('p.S4/AM28 the long plan name is clamped (ellipsis) and the tooltip carries the full name', selInfo.title.includes(LONG) && selInfo.scroll > selInfo.client, JSON.stringify(selInfo))
  await clip(page, 'p-70-S4-mon-head-everything-lit', '#eWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 190 })

  /* the taps — each at the control's own centre */
  await pressAt(page, '#eWeek .day[data-day="0"] .planselbtn')
  const menuOpen = await page.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 600) : '' })
  check('p.S4 a tap on the selector opens the plans menu', /PLANS — MONDAY/i.test(menuOpen) && menuOpen.includes(LONG), menuOpen)
  await screen(page, 'p-71-S4-plans-menu-open')
  await L.menuClose(page)
  const info = await dayInfo(page, 0)
  check('p.S4 a tap on ⓘ opens the day panel', /Monday/i.test(info) && info !== 'NO PANEL', info.slice(0, 200))
  await pressAt(page, '#eWeek .day[data-day="0"] .day-sign .so-clear')
  hd = await h(page, 0)
  check('p.S4 a tap on "Clear" clears the four sign-offs (Publish AL2 locks)', hd.signs.every(s => /— name —/.test(s)) && hd.alpub && hd.alpub.disabled, JSON.stringify({ signs: hd.signs, alpub: hd.alpub }))
  await signDay(page, 0)
  hd = await h(page, 0)
  check('p.S4 re-signed on the phone through the pills', hd.alpub && !hd.alpub.disabled, JSON.stringify(hd.alpub))
  await takeToasts(page)
  await pressAt(page, '#eWeek .day[data-day="0"] [data-alpub="0"]')
  let t = await takeToasts(page); hd = await h(page, 0)
  check('p.S4 a tap on "Publish AL2" publishes AL2 (not the neighbouring Unpublish)', hd.tag === 'AL2' && t.some(x => /Published AL2/.test(x)), `tag ${hd.tag} toast ${JSON.stringify(t)}`)
  await clip(page, 'p-72-S4-mon-head-after-publish-AL2', '#eWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 120 })
  await pressAt(page, '#eWeek .day[data-day="0"] [data-unpub="0"]')
  t = await takeToasts(page); hd = await h(page, 0)
  check('p.S4 a tap on "Unpublish" takes AL2 back: tag AL1, the change pending again', hd.tag === 'AL1' && /1\s*pending/.test(hd.pending), `tag ${hd.tag} pend ${hd.pending} toast ${JSON.stringify(t)}`)
  await clip(page, 'p-73-S4-mon-head-after-unpublish', '#eWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 120 })
  check('p.S4: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

if (part === 'all' || part === 's37') {
  console.log('\n##### S37 — a MEMBER on the phone view page #####')
  const { browser, page, errors } = await open({ ...PHONE, state: STATE, who: 'm' })
  await installToasts(page)
  await go(page, 'viewsched')
  const badge = await page.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText || (document.querySelector('.rolechip') || {}).innerText || '')
  note('p.S37 signed in as', badge)
  await page.locator('#vWeek .day[data-day="0"]').evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await page.waitForTimeout(300)
  await L.underBar(page, '#vWeek .day[data-day="0"] .day-head')
  const au = await audit(page, '#vWeek .day[data-day="0"]', ['.day-head .dow', '.day-head .dt', '.day-head .verchip', '.day-head .badge', '.day-head select[data-vwork]', '.day-head .dinfobtn'])
  console.log('S37 audit', JSON.stringify(au))
  check('p.S37 the member\'s "AL1 — as issued" picker is on screen, uncovered, not overlapping the 4×4 badge or the tag', au.items.some(i => i.sel.endsWith('select[data-vwork]') && i.inside && i.hit) && au.over.length === 0, JSON.stringify(au))
  await clip(page, 'p-74-S37-member-view-mon-issued', '#vWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 90 })
  /* choose "Working draft — not issued" through the picker itself (a real select) */
  await page.locator('#vWeek select[data-vwork="0"]').selectOption('working'); await page.waitForTimeout(600)
  let v = await viewDay(page, 0)
  check('p.S37/AM5 the member can look at the working draft, clearly labelled', /Viewing Working draft — not issued/.test(v.bar) && v.nys && /1\s*pending/.test(v.pend) && v.writers === 0, JSON.stringify({ bar: v.bar, nys: v.nys, pend: v.pend, writers: v.writers }))
  await clip(page, 'p-75-S37-member-view-mon-working', '#vWeek .day[data-day="0"] .day-head', { pad: 6, extraH: 140 })
  await page.locator('#vWeek select[data-vwork="0"]').selectOption('issued'); await page.waitForTimeout(500)
  v = await viewDay(page, 0)
  check('p.S37 and back to the issued face', /\bissued\b/.test(v.cls) && !v.nys, v.cls)
  const doors = await page.evaluate(() => [...document.querySelectorAll('[data-planmenu],[data-unpub],[data-alpub],[data-beak],select[data-sign],[data-restore]')].filter(e => !e.closest('.page:not(.on)') && (e.offsetWidth || e.offsetHeight)).length)
  check('p.S37/AM17 the member sees no plan, publish, unpublish, sign or load door', doors === 0, `doors ${doors}`)
  check('p.S37: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-06-phone-head') ? 1 : 0
