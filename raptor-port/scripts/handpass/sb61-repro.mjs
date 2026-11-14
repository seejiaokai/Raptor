// Chat 61: does each filed fault show on main's build? Records what the screen does — it judges nothing.
// From raptor-port/:  WALK_DIR=dist node scripts/handpass/sb61-repro.mjs
console.log('sb61-repro v3')
const { L, world, sleep, vis, shot, note, act, openBoard, finish } = await import('./sb61-lib.mjs')
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)

// R1 — the week's issues bar: its words on each day
if (want('r1')) {
  const { ctx, page } = await world()
  const bars = await page.evaluate(() => [...document.querySelectorAll('#eWeek .daywarn')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
  note('R1 the week\'s issues bars', JSON.stringify(bars))
  const b = await vis(page, '#eWeek .daywarn'); note('R1 the first bar\'s box', JSON.stringify(b)); await shot(page, 'r1-week-issues-bar')
  await openBoard(page, 0)
  note('R1 the board\'s issues heading (Monday)', JSON.stringify(await vis(page, '#schedBoard .sbwrap .wh')))
  await ctx.close()
}

// R2 — the changes window: its foot with nothing to tap, and Escape
if (want('r2')) {
  const { ctx, page } = await world()
  await page.click('#histBtn'); await sleep(900)
  note('R2 window open', JSON.stringify(!!(await vis(page, '.chgwin'))))
  await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await sleep(300)
  const lines = await page.evaluate(() => ({ buttons: document.querySelectorAll('.chgwin button.cw-l').length, still: document.querySelectorAll('.chgwin .cw-l.still').length, none: (document.querySelector('.chgwin .cw-none') || {}).textContent || '' }))
  note('R2 All changes, an untouched week: lines', JSON.stringify(lines))
  note('R2 its foot', JSON.stringify(await vis(page, '.chgwin .cw-foot')))
  await shot(page, 'r2-changes-empty-foot')
  await page.keyboard.press('Escape'); await sleep(600)
  note('R2 after Escape: window still drawn', JSON.stringify(!!(await vis(page, '.chgwin'))))
  await ctx.close()
}

// R3 — the board: an Undo of a change scrolled out of view, the same day
if (want('r3')) {
  const { ctx, page } = await world()
  await openBoard(page, 0)
  // the scroller is whatever scrolls the first line's remark box: found from the box, named in the log
  await page.evaluate(() => { let s = [...document.querySelectorAll('#sbBoard .sb-line .nts')].find(e => e.getBoundingClientRect().width > 0).parentElement; while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement; window.__sc = s || document.scrollingElement })
  note('R3 the scroller', await page.evaluate(() => window.__sc.tagName + '#' + window.__sc.id + '.' + window.__sc.className + ' ' + window.__sc.scrollHeight + '/' + window.__sc.clientHeight))
  const sc = () => page.evaluate(() => Math.round(window.__sc.scrollTop))
  const box = page.locator('#sbBoard .sb-line .nts:visible').first()
  await box.click(); await page.keyboard.type(' u1'); await page.keyboard.press('Enter'); await sleep(700)
  const typed = await page.evaluate(() => [...document.querySelectorAll('#sbBoard .sb-line .nts')].find(e => e.getBoundingClientRect().width > 0).value)
  note('R3 the first line\'s remark now', typed)
  const max = await page.evaluate(() => { const s = window.__sc; s.scrollTop = s.scrollHeight; return Math.round(s.scrollTop) }); await sleep(400)
  const s0 = await sc(); const before = await vis(page, '#sbBoard .sb-line .nts')
  await shot(page, 'r3-before-undo')
  await page.click('#sbUndo'); await sleep(1200)
  const s1 = await sc(); const after = await vis(page, '#sbBoard .sb-line .nts')
  const v = await page.evaluate(() => [...document.querySelectorAll('#sbBoard .sb-line .nts')].find(e => e.getBoundingClientRect().width > 0).value)
  note('R3 undo with the row out of view', `scrolled to ${max}; scrollTop before ${s0} after ${s1}; the box at ${JSON.stringify(before && [before.t, before.b])} then ${JSON.stringify(after && [after.t, after.b])}; screen height 730; remark now "${v}"`)
  await shot(page, 'r3-after-undo')
  await ctx.close()
}

// R4 — the board: where Tab stops
if (want('r4')) {
  const { ctx, page } = await world()
  await openBoard(page, 0)
  const targets = await page.evaluate(() => ({
    wave: document.querySelectorAll('#schedBoard [data-wvadd]').length,
    block: [...document.querySelectorAll('#schedBoard button')].filter(b => /^\+ Block/.test(b.textContent.trim())).map(b => [...b.attributes].map(a => a.name + '=' + a.value).join(' ')).slice(0, 3),
    stores: [...document.querySelectorAll('#schedBoard button')].filter(b => /store/i.test((b.title || '') + [...b.attributes].map(a => a.name).join(' '))).map(b => [...b.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 120)).slice(0, 3),
  }))
  note('R4 the buttons on the board', JSON.stringify(targets))
  for (const key of ['Tab', 'Shift+Tab']) {
    await page.locator('#sbBoard .sb-line .nts:visible').first().click(); await sleep(200)
    const seen = {}; let first = null, n = 0, hits = []
    for (; n < 420; n++) {
      await page.keyboard.press(key)
      const a = await act(page); if (!a) continue
      const k = a.tag + '#' + a.id + '.' + a.cls + '|' + a.attrs
      if (first == null) first = JSON.stringify(a)
      else if (JSON.stringify(a) === first) break
      seen[k] = (seen[k] || 0) + 1
      if (a.wvadd != null || /^\+ (Block|Wave)/.test(a.text) || /st/.test(a.attrs) && a.tag === 'BUTTON') hits.push(n + ':' + a.text + '[' + a.attrs + ']')
    }
    const buttons = Object.keys(seen).filter(k => k.startsWith('BUTTON')).slice(0, 40)
    note('R4 ' + key + ' through the board', `${n} presses before the route came round; stops on + Block / + Wave / a stores button: ${JSON.stringify(hits.slice(0, 12))}; the kinds of button it did stop on: ${JSON.stringify(buttons)}`)
  }
  await ctx.close()
}
finish('repro.json')
await L.closeAll()
process.exit(0)
