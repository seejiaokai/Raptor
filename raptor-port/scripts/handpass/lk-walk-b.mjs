/* lk-walk part B: the corner tag W12-W14 ([OG-TAG-OVER-COUNT]) — the walker's script, 21 Oct 26 */
process.env.HP_URL ||= 'http://localhost:4295'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/docs/img/handpass/2026-10-21-look-keys/walk'
console.log('lk-walk-b v3')
const { go, board, publish, login } = await import('./lib.mjs')
const W = await import('./lk-walk-lib.mjs')
const rec = W.recorder('b')
const pause = (page, ms = 350) => page.waitForTimeout(ms)
const near = (a, b, t = 1) => Math.abs(a - b) <= t
const overlap = (a, b) => !!a && !!b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const box = (r) => r ? `${Math.round(r.x * 10) / 10},${Math.round(r.y * 10) / 10} ${Math.round(r.w * 10) / 10}x${Math.round(r.h * 10) / 10}` : 'none'

/* every visible seat under `root` that holds an ALL AVAIL count: the corner tag as painted (::after), the count's box, the puck's box */
const TAGSX = (root) => [...document.querySelectorAll(`${root} .seat`)].filter(s => s.offsetWidth && s.querySelector('[data-oilsent]')).map(s => {
  const st = getComputedStyle(s, '::after')
  const sr = s.getBoundingClientRect()
  const chipEl = s.querySelector('[data-oilsent]'); const cr = chipEl.getBoundingClientRect()
  const pk = s.querySelector('.puck, [data-person]')?.getBoundingClientRect()
  const has = st.content && st.content !== 'none' && st.content !== 'normal'
  const sum = (...k) => k.reduce((a, p) => a + (parseFloat(st[p]) || 0), 0)
  const w = sum('width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth')
  const h = sum('height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth')
  const right = parseFloat(st.right), top = parseFloat(st.top), left = parseFloat(st.left)
  /* where the ::after really stands: when the transform shifts it sideways it is placed by `left` (+ the shift, here -100% of its own width);
     only otherwise by `right` (the computed `right` of an absolutely placed box is always a number, so it cannot tell which was written) */
  let tx = 0; const tr = st.transform; if (tr && tr !== 'none') { const m = tr.match(/matrix\(([^)]+)\)/); if (m) tx = parseFloat(m[1].split(',')[4]) || 0 }
  const x = tx !== 0 ? sr.left + left + tx : sr.right - right - w
  const tag = has ? { x, y: sr.top + top, w, h } : null
  return { content: st.content, border: st.borderTopStyle + ' ' + st.borderTopWidth, bg: st.backgroundColor, color: st.color,
    attrs: { aln: s.hasAttribute('data-aln') || !!s.closest('[data-aln]'), alc: s.hasAttribute('data-alc') || !!s.closest('[data-alc]'),
      alnVal: s.getAttribute('data-aln') || s.closest('[data-aln]')?.getAttribute('data-aln') || null, alcVal: s.getAttribute('data-alc') || s.closest('[data-alc]')?.getAttribute('data-alc') || null },
    tag, chip: { x: cr.x, y: cr.y, w: cr.width, h: cr.height }, puck: pk ? { x: pk.x, y: pk.y, w: pk.width, h: pk.height } : null,
    seat: { x: sr.x, y: sr.y, w: sr.width, h: sr.height }, chipIsOilcount: chipEl.classList.contains('oilcount'), day: s.closest('.day')?.dataset.day ?? null }
})

async function judge(page, id, size, label, root, expectKind /* 'OG' | 'AL-hollow' | 'AL-solid' */, picName, onlyDay = null) {
  await page.evaluate((s) => { const el = [...document.querySelectorAll(`${s} .seat`)].find(x => x.offsetWidth && x.querySelector('[data-oilsent]')); el && el.scrollIntoView({ block: 'center', inline: 'center' }) }, root)
  await pause(page, 300)
  let all = await page.evaluate(TAGSX, root)
  if (onlyDay != null) { const f = all.filter(t => t.day == null || String(t.day) === String(onlyDay)); if (f.length) all = f }
  if (!all.length) { rec(id, size, label, `no seat with a [data-oilsent] count under ${root}`, 'NOT WALKED'); return }
  const t = all[0]
  const isOG = /OG/.test(t.content), isAL = /AL/.test(t.content)
  const kindOK = expectKind === 'OG' ? isOG : expectKind === 'AL-hollow' ? (isAL && t.attrs.aln) : (isAL && t.attrs.alc)
  const noOverlap = !!t.tag && !overlap(t.tag, t.chip)
  const rightOK = !!t.tag && !!t.puck && near(t.tag.x + t.tag.w, t.puck.x + t.puck.w + 3, 1)
  const topOK = !!t.tag && near(t.tag.y, t.seat.y - 5, 1)
  const ok = kindOK && noOverlap && rightOK && topOK
  /* pictures: the seat zoomed (2x), the tag's box and the count's box marked */
  const marks = [t.chip]; if (t.tag) marks.push(t.tag)
  const sc = await page.evaluate((s) => { const el = [...document.querySelectorAll(`${s} .seat`)].find(x => x.offsetWidth && x.querySelector('[data-oilsent]')); el && el.scrollIntoView({ block: 'center', inline: 'center' }); return !!el }, root)
  await pause(page, 250)
  const t2 = (await page.evaluate(TAGSX, root))[0] || t
  const mk = [t2.chip]; if (t2.tag) mk.push(t2.tag)
  await W.mark(page, mk)
  const vw = page.viewportSize().width, vh = page.viewportSize().height
  const cx = Math.max(0, t2.seat.x - 40), cy = Math.max(0, t2.seat.y - 30)
  const crop = await W.snap(page, picName + '-zoom', { x: cx, y: cy, width: Math.min(vw - cx, Math.max(300, t2.seat.w + 120)), height: Math.min(vh - cy, 110) })
  const full = await W.snap(page, picName)
  await W.unmark(page)
  rec(id, size, label,
    `${all.length} seat(s) with a count; first (day ${t.day}): ::after content ${t.content} (${t.border}, bg ${t.bg}); data-aln=${t.attrs.alnVal} data-alc=${t.attrs.alcVal}; tag ${box(t.tag)} · count ${box(t.chip)} (is .oilcount: ${t.chipIsOilcount}) · puck ${box(t.puck)} · seat ${box(t.seat)}; tag∩count: ${overlap(t.tag, t.chip)}; tag right ${t.tag && Math.round((t.tag.x + t.tag.w) * 10) / 10} vs puck right + 3 = ${t.puck && Math.round((t.puck.x + t.puck.w + 3) * 10) / 10}; tag top ${t.tag && Math.round(t.tag.y * 10) / 10} vs seat top − 5 = ${Math.round((t.seat.y - 5) * 10) / 10}; kind ${expectKind}: ${kindOK}`,
    ok ? 'PASS' : 'FAIL', [full, crop])
}

async function logout(page) {
  const bt = page.locator('button', { hasText: 'Logout' }).first()
  if (!(await bt.isVisible())) { await page.click('#burger'); await pause(page, 300) }
  await page.locator('button', { hasText: 'Logout' }).first().click()
  await pause(page, 800)
}

const allErrors = []
/* ---------------- W12: Ranger's View-only Sched, an unpublished day ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    const di = await page.evaluate(() => { const w = window; for (let d = 0; d < 7; d++) if (!w.dayApproved(d) && (w.DAYS[d].allhands || []).length) return d; return -1 })
    const put = await W.putAt(page, 'week', `a:${di}.0.+`)
    console.log('W12 put on unpublished day', di, put)
    await pause(page, 500)
    if (!/^ok/.test(put)) rec('W12', '1440x900', 'put', put, 'NOT WALKED')
    else {
      await logout(page)
      await login(page, 'u')
      await go(page, 'viewsched'); await pause(page, 500)
      console.log('signed in as', await page.evaluate(() => document.body.innerText.match(/RANGER[^\n]*/i)?.[0] || ''))
      await judge(page, 'W12a', '1440x900', `member Ranger, View-only Sched, unpublished day ${di} (admin put ALL AVAIL by the controls)`, '#vWeek', 'OG', 'w12-og-1440', di)
      await page.setViewportSize({ width: 390, height: 844 }); await pause(page, 700)
      await go(page, 'viewsched'); await pause(page, 500)
      await judge(page, 'W12b', '390x844', `same member and day, viewport set to 390x844`, '#vWeek', 'OG', 'w12-og-390', di)
    }
  } catch (e) { rec('W12', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W12: ' + W.consoleBlock(errors))
  await browser.close()
}

/* ---------------- W13 / W14: a published day ---------------- */
{
  const { browser, page, errors } = await W.openD({ width: 1440, height: 900 })
  try {
    await go(page, 'editsched')
    await board(page, 2)
    const pub = await publish(page, 2)
    console.log('publish day 2', JSON.stringify(pub))
    await page.click('#sbDone').catch(() => {}); await pause(page, 500)
    await go(page, 'editsched')
    const approved = await page.evaluate(() => window.dayApproved(2))
    if (!approved) { rec('W13', '1440x900', 'publish day 2', 'could not publish day 2 by the controls: ' + JSON.stringify(pub), 'NOT WALKED') }
    else {
      const put = await W.putAt(page, 'week', 'a:2.0.+')
      console.log('W13 put on published day 2', put)
      await pause(page, 600)
      await judge(page, 'W13a', '1440x900', 'admin, Edit Schedule week, published day 2 (ALL AVAIL put on its first Common Programme row)', '#eWeek', 'AL-hollow', 'w13-week-1440', 2)
      await board(page, 2); await pause(page, 500)
      await judge(page, 'W13b', '1440x900', 'admin, Scheduler Board on day 2', '#schedBoard', 'AL-hollow', 'w13-board-1440')
      await page.click('#sbDone').catch(() => {}); await pause(page, 400)
      await page.setViewportSize({ width: 390, height: 844 }); await pause(page, 700)
      await go(page, 'editsched'); await pause(page, 500)
      await judge(page, 'W13c', '390x844', 'admin, Edit Schedule week at 390x844', '#eWeek', 'AL-hollow', 'w13-week-390', 2)
      try {
        await board(page, 2); await pause(page, 600)
        await judge(page, 'W13d', '390x844', 'admin, Scheduler Board (phone copy) on day 2', '#schedBoard', 'AL-hollow', 'w13-board-390')
        await page.click('#sbDone').catch(async () => { await page.keyboard.press('Escape') }); await pause(page, 400)
      } catch (e) { rec('W13d', '390x844', 'board on phone', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }

      /* W14: publish the amendment through the board's own controls at 1440 */
      await page.setViewportSize({ width: 1440, height: 900 }); await pause(page, 700)
      await go(page, 'editsched'); await pause(page, 400)
      try {
        await board(page, 2); await pause(page, 500)
        const pub2 = await publish(page, 2)
        console.log('publish amendment', JSON.stringify(pub2))
        await page.click('#sbDone').catch(() => {}); await pause(page, 500)
        if (!pub2.published) rec('W14', '1440x900', 'publish the amendment', 'publish did not go: ' + JSON.stringify(pub2), 'NOT WALKED')
        else {
          await go(page, 'viewsched'); await pause(page, 600)
          await judge(page, 'W14a', '1440x900', `View-only Sched (admin) after publishing the amendment (${pub2.version})`, '#vWeek', 'AL-solid', 'w14-viewonly-1440', 2)
          await page.setViewportSize({ width: 390, height: 844 }); await pause(page, 700)
          await go(page, 'viewsched'); await pause(page, 500)
          await judge(page, 'W14b', '390x844', 'View-only Sched (admin) at 390x844', '#vWeek', 'AL-solid', 'w14-viewonly-390', 2)
        }
      } catch (e) { rec('W14', '1440', 'publish', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
    }
  } catch (e) { rec('W13', '1440', 'x', 'script error: ' + e.message.split('\n')[0], 'NOT WALKED') }
  allErrors.push('W13/14: ' + W.consoleBlock(errors))
  await browser.close()
}
console.log('CONSOLE', allErrors.join(' || '))
console.log('DONE b')
