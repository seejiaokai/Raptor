// Chat 63: the rest of the walk of the three small schedule-and-board fixes (chat 62's first share is sb62-walk.mjs).
// A PASS means the screen is right. Version: sb63-walk v1
// From raptor-port/:  WALK_DIR=dist SB61_OUT=docs/img/handpass/2026-11-10-sched-board-small/walk2 node scripts/handpass/sb63-walk.mjs
// ONLY=w4,w5,… picks steps; SIZES=pc,phone,side picks sizes; the phone runs in WebKit by touch (PHONE_ENGINE=chromium to change).
console.log('sb63-walk v1')
const { world, goPage, sleep, vis, shot, ok, note, openBoard, finish, PC, PHONE, OUT } = await import('./sb61-lib.mjs')
const { resolve } = await import('node:path')
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
const SIDE = { width: 874, height: 402 }
const ALL_SIZES = { pc: { size: PC }, phone: { size: PHONE, phone: true, dpr: 2, engine: process.env.PHONE_ENGINE || 'webkit' }, side: { size: SIDE, phone: true, dpr: 2, engine: process.env.PHONE_ENGINE || 'webkit' } }
const SIZES = (process.env.SIZES || 'pc,phone').split(',').map(n => [n, ALL_SIZES[n]])
const clipOf = (b, pad, size) => ({ x: Math.max(0, b.l - pad), y: Math.max(0, b.t - pad), width: Math.min(size.width - Math.max(0, b.l - pad), b.r - b.l + 2 * pad), height: Math.min(size.height - Math.max(0, b.t - pad), b.b - b.t + 2 * pad) })
const quick = (page, name) => page.screenshot({ path: resolve(OUT, name + '.png') })   // the picture right after a press

// the changes window as drawn: its foot, how many lines can be tapped (a button) and how many cannot, the tab lit, the tabs' boxes
const win = page => page.evaluate(() => {
  const w = [...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().width > 0 && !e.classList.contains('bar'))
  if (!w) return null
  const f = w.querySelector('.cw-foot')
  const shown = s => [...w.querySelectorAll(s)].filter(e => e.getBoundingClientRect().height > 0).length
  return { foot: f ? f.textContent.trim() : null, taps: shown('button.cw-l'), still: shown('div.cw-l.still'), tab: (w.querySelector('.win-tab.on') || {}).textContent?.replace(/\s+/g, ' ').trim(), tabs: [...w.querySelectorAll('.win-tab')].map(t => { const r = t.getBoundingClientRect(); return t.textContent.replace(/\s+/g, ' ').trim().slice(0, 14) + '@' + Math.round(r.left) + ',' + Math.round(r.top) }), says: /Tap a change/.test(w.textContent), text: w.textContent.replace(/\s+/g, ' ').slice(0, 300) }
})
// the rule of fix 2, for an admin on All changes / New to you / To go out: the "Tap a change" foot stands exactly when a drawn line can be tapped, never on To go out
const footRight = s => !!s && (/To go out/.test(s.tab || '') ? s.foot === null : /New to you/.test(s.tab || '') ? /Mark all as seen/.test(s.foot || '') : (s.foot === 'Tap a change to go to it — the window stays open.') === (s.taps > 0) && (s.foot === null || s.taps > 0))
const pickTab = async (page, name) => { await page.locator('.chgwin .win-tab', { hasText: name }).first().click(); await sleep(450) }
const closeWin = async page => { const x = page.locator('.chgwin .win-x:visible').first(); if (await x.count()) { await x.click(); await sleep(450) } }

// a box on the board, found by selector and its place in that list (the board redraws its markup on Undo, so the box is found afresh)
async function boxAt(page, sel, idx) {
  return page.evaluate(([sel, idx]) => {
    const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
    const el = els[idx < 0 ? els.length + idx : idx]; if (!el) return null
    let s = el.parentElement; while (s && s !== document.body && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    const sc = (!s || s === document.body) ? document.scrollingElement : s
    const r = el.getBoundingClientRect(), v = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect()
    const bar = document.querySelector('#schedBoard .sb-top')?.getBoundingClientRect()
    const top = Math.max(v.top, bar && bar.height > 0 && bar.top <= 1 ? bar.bottom : 0), bottom = Math.min(v.bottom, innerHeight)
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(top), bottom: Math.round(bottom), inView: r.top >= top - 0.5 && r.bottom <= bottom + 0.5, onTop: !!hit && (hit === el || el.contains(hit)), hitIs: hit ? (hit.className + '').slice(0, 40) : null, value: el.value ?? el.textContent, scroll: Math.round(sc.scrollTop), scrollerIs: sc === document.scrollingElement ? 'page' : (sc.id || sc.className + '').slice(0, 30), n: els.length }
  }, [sel, idx])
}
const scrollBoard = (page, sel, idx, where) => page.evaluate(([sel, idx, where]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0); const el = els[idx < 0 ? els.length + idx : idx]
  let s = el.parentElement; while (s && s !== document.body && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const sc = (!s || s === document.body) ? document.scrollingElement : s
  sc.scrollTop = where === 'top' ? 0 : where === 'foot' ? sc.scrollHeight : sc.scrollTop
}, [sel, idx, where])
async function typeInto(page, sel, idx, text) {
  const els = page.locator(sel).filter({ visible: true })
  const el = idx < 0 ? els.nth((await els.count()) + idx) : els.nth(idx)
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('End'); await page.keyboard.type(text); await page.keyboard.press('Enter'); await sleep(700)
}
const undoSel = async page => (await page.locator('#sbUndo:visible').count()) ? '#sbUndo:visible' : '#undoBtn:visible'

// sign the four roles and press the day's Publish — through the board's own controls (cd-lib.mjs signAndPublish, copied)
async function signAndPublish(page, di) {
  const sels = page.locator(`#schedBoard [data-signday="${di}"]:visible`)
  for (let i = 0; i < await sels.count(); i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await sleep(150)
  }
  await sleep(400)
  const beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  if (!(await beak.count())) return 'no publish button'
  if (await beak.isDisabled()) return 'publish still locked: ' + (await beak.innerText())
  await beak.click(); await sleep(800)
  const yes = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await yes.count() && await yes.isVisible()) { await yes.click(); await sleep(1000) }
  return 'published'
}
const doneBoard = async page => { await page.locator('#sbDone:visible').first().click(); await sleep(800) }

for (const [name, opts] of SIZES) {
  // W4 — the desktop's next-week preview draws no issues bar (it reads no warnings — ui/peek.ts); the live week's bars do
  if (want('w4') && name === 'pc') {
    const { ctx, page, errors } = await world(opts)
    const r = await page.evaluate(() => {
      const peek = [...document.querySelectorAll('#eWeek .day')].filter(d => !d.hasAttribute('data-day') && d.getBoundingClientRect().width > 0)
      const live = [...document.querySelectorAll('#eWeek .day[data-day]')]
      peek[0]?.scrollIntoView({ block: 'nearest', inline: 'start' })
      return { peek: peek.length, peekBars: peek.reduce((a, d) => a + d.querySelectorAll('.daywarn').length, 0), liveBars: live.filter(d => d.querySelector('.daywarn')).length, peekHead: (peek[0] && peek[0].textContent || '').replace(/\s+/g, ' ').slice(0, 80) }
    })
    await sleep(700)
    ok(`W4 ${name} the next-week preview draws no issues bar (it has no warning list); the live week's days do`, r.peek > 0 && r.peekBars === 0 && r.liveBars > 0, JSON.stringify(r))
    await shot(page, `w4-${name}-preview`)
    ok(`W4 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W5 — the changes window on a published day with a change waiting: To go out (no foot), All changes (the foot, a line to tap), Who, New to you
  if (want('w5') || want('w6') || want('w7')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const pub = await signAndPublish(page, 0)
    note(`W5 ${name} Monday published through the board's sign-off and Publish`, pub)
    await typeInto(page, '#sbBoard .sb-line .nts', 0, ' w5')
    // and a change on Tuesday, not published: View-only Sched shows a count only on a day's working copy (html.ts — a
    // published day's issued face never does)
    await page.locator('#sbNextDay:visible, #schedBoard [data-sbtab="1"]:visible').first().click(); await sleep(900)
    await typeInto(page, '#sbBoard .sb-line .nts', 0, ' w6')
    await doneBoard(page)
    const chip = page.locator('#eWeek [data-pendlist="0"]:visible').first()
    if (want('w5')) {
      if (await chip.count()) {
        ok(`W5 ${name} Monday's count reads a change waiting`, true, (await chip.innerText()).replace(/\s+/g, ' '))
        await chip.click(); await sleep(900)
        const s0 = await win(page)
        ok(`W5 ${name} "To go out": no foot under the list (the list's own words say where a tap goes)`, footRight(s0) && /To go out/.test(s0.tab || ''), JSON.stringify(s0))
        const w0 = await vis(page, '.chgwin:not(.bar)'); if (w0) await shot(page, `w5-${name}-1-to-go-out`, { clip: clipOf(w0, 12, opts.size) })
        await pickTab(page, 'All changes')
        const s1 = await win(page)
        ok(`W5 ${name} "All changes": "Tap a change to go to it — the window stays open." under lines that can be tapped`, footRight(s1) && s1.taps > 0, JSON.stringify(s1))
        ok(`W5 ${name} the tabs did not move when the foot came and went`, JSON.stringify(s0.tabs) === JSON.stringify(s1.tabs), JSON.stringify([s0.tabs, s1.tabs]))
        const w1 = await vis(page, '.chgwin:not(.bar)'); if (w1) await shot(page, `w5-${name}-2-all-changes`, { clip: clipOf(w1, 12, opts.size) })
        const who = page.locator('.chgwin button', { hasText: /^Who$/ }).first()
        if (await who.count()) {
          await who.click(); await sleep(450)
          const s2 = await win(page)
          ok(`W5 ${name} grouped by Who: the foot follows what can be tapped`, footRight(s2), JSON.stringify(s2))
          const w2 = await vis(page, '.chgwin:not(.bar)'); if (w2) await shot(page, `w5-${name}-3-by-who`, { clip: clipOf(w2, 12, opts.size) })
          const gh = page.locator('.chgwin .cw-gh[aria-expanded="true"]')
          for (let i = await gh.count(); i > 0; i--) { await gh.first().click(); await sleep(250) }
          const s3 = await win(page)
          ok(`W5 ${name} every Who group folded: nothing to tap, so no foot`, footRight(s3) && s3.taps === 0 && s3.foot === null, JSON.stringify(s3))
          await shot(page, `w5-${name}-4-who-folded`, { clip: clipOf(await vis(page, '.chgwin:not(.bar)'), 12, opts.size) })
          const gh2 = page.locator('.chgwin .cw-gh[aria-expanded="false"]'); for (let i = await gh2.count(); i > 0; i--) { await gh2.first().click(); await sleep(250) }
          const item = page.locator('.chgwin button', { hasText: /^Item$/ }).first(); if (await item.count()) { await item.click(); await sleep(400) }
        } else ok(`W5 ${name} the Group by: Who button`, null, 'not found')
        await pickTab(page, 'New to you')
        const s4 = await win(page)
        ok(`W5 ${name} "New to you": its own foot, "Mark all as seen", unchanged`, footRight(s4), JSON.stringify(s4))
        await shot(page, `w5-${name}-5-new-to-you`, { clip: clipOf(await vis(page, '.chgwin:not(.bar)'), 12, opts.size) })
        await closeWin(page)
      } else ok(`W5 ${name} Monday's "to go out" count`, null, 'no pending chip after publishing and a change: ' + pub)
    }
    // W6 — the admin on View-only Sched: a day's count opens the window; the foot follows what can be tapped there
    if (want('w6')) {
      await goPage(page, 'viewsched')
      const c = page.locator('#vWeek [data-chgday]:visible, #vWeek [data-pendlist]:visible').first()
      if (await c.count()) {
        const label = (await c.innerText()).replace(/\s+/g, ' ')
        await c.click(); await sleep(900)
        const s = await win(page)
        ok(`W6 ${name} admin, View-only Sched, a day's count ("${label}"): the foot follows what can be tapped`, footRight(s), JSON.stringify(s))
        if (s && !/All changes/.test(s.tab || '') && await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).count()) { await pickTab(page, 'All changes'); const s2 = await win(page); ok(`W6 ${name} …and on All changes`, footRight(s2), JSON.stringify(s2)) }
        await shot(page, `w6-${name}-viewsched-admin`, { clip: clipOf(await vis(page, '.chgwin:not(.bar)'), 12, opts.size) })
        await closeWin(page)
      } else ok(`W6 ${name} a day's count on View-only Sched`, null, 'no count drawn on View-only Sched')
    }
    // W7 — a member: the window from a day's count on View-only Sched keeps "Read only —" (unchanged), never "Tap a change"
    if (want('w7')) {
      // a desktop's Logout is on the bar; a phone's is in the ☰ menu (aa-A-lib.mjs)
      if (await page.locator('#logout:visible').count()) await page.locator('#logout:visible').first().click()
      else { await page.locator('#burger:visible').click(); await sleep(500); await page.locator('#drawerLogout').click() }
      await sleep(900)
      const { login } = await import('./trk-chat9-lib.mjs')
      await login(page, 'us'); await sleep(800)
      const c = page.locator('#vWeek [data-chgday]:visible, #vWeek [data-pendlist]:visible').first()
      if (await c.count()) {
        const label = (await c.innerText()).replace(/\s+/g, ' ')
        await c.click(); await sleep(900)
        const tabs = []
        for (const t of ['To go out', 'All changes', 'New to you']) {
          if (!(await page.locator('.chgwin .win-tab', { hasText: t }).count())) continue
          await pickTab(page, t); const s = await win(page); tabs.push(s)
          ok(`W7 ${name} member, "${t}" (opened from "${label}"): ${t === 'New to you' ? '"Mark all as seen"' : '"Read only — …"'}, never "Tap a change"`, !!s && !s.says && (t === 'New to you' ? /Mark all as seen/.test(s.foot || '') : /^Read only/.test(s.foot || '')), JSON.stringify(s))
          await shot(page, `w7-${name}-member-${t.replace(/ /g, '-').toLowerCase()}`, { clip: clipOf(await vis(page, '.chgwin:not(.bar)'), 12, opts.size) })
        }
        await closeWin(page)
      } else ok(`W7 ${name} a member's day count on View-only Sched`, null, 'no count drawn for the member')
    }
    ok(`W5–W7 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W8 — the board: Undo of a change BELOW the screen (the list scrolled to its top): the box comes up clear of the foot
  //      (a) a flying line's remark, (b) an input's remark on Personal Inputs / Unavailable (the input branch of the landing)
  if (want('w8')) {
    for (const [tag, sel] of [['remark', '#sbBoard .sb-line .nts'], ['input', '#sbBoard .rmkin']]) {
      const { ctx, page, errors } = await world(opts)
      await openBoard(page, 0)
      const n = await page.locator(sel).filter({ visible: true }).count()
      if (!n) { ok(`W8 ${name} ${tag}: a box to change`, null, 'none drawn: ' + sel); await ctx.close(); continue }
      const before0 = (await boxAt(page, sel, -1)).value
      await typeInto(page, sel, -1, ' d8')
      await scrollBoard(page, sel, -1, 'top'); await sleep(600)
      const out = await boxAt(page, sel, -1)
      await shot(page, `w8-${name}-${tag}-1-before-undo`)
      await page.locator(await undoSel(page)).first().click(); await quick(page, `w8-${name}-${tag}-2-just-after-undo`)
      await sleep(1400)
      const back = await boxAt(page, sel, -1)
      ok(`W8 ${name} ${tag}: Undo of a change below the screen brings it up clear of the foot, on top, words back`, !out.inView && back.inView && back.onTop && back.value === before0 && back.bottom - back.b < 60, `before: box ${out.t}–${out.b}, list ${out.top}–${out.bottom} (scrolls: ${out.scrollerIs}); after: box ${back.t}–${back.b}, list ${back.top}–${back.bottom}, on top: ${back.onTop} (${back.hitIs}); words "${String(back.value).slice(0, 60)}"`)
      await shot(page, `w8-${name}-${tag}-3-after-undo`)
      ok(`W8 ${name} ${tag} no page errors`, !errors.length, errors.join(' | ') || 'none')
      await ctx.close()
    }
  }

  // W9 — the board: Undo with the changes window open over it — the box brought on screen must not land under the window
  if (want('w9')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const sel = '#sbBoard .sb-line .nts'
    const was = (await boxAt(page, sel, 0)).value
    await typeInto(page, sel, 0, ' w9')
    await scrollBoard(page, sel, 0, 'foot'); await sleep(500)
    await page.locator('#sbHist:visible').first().click(); await sleep(900)
    const wv = await vis(page, '.chgwin')
    const out = await boxAt(page, sel, 0)
    await shot(page, `w9-${name}-1-window-open`)
    await page.locator(await undoSel(page)).first().click(); await quick(page, `w9-${name}-2-just-after-undo`)
    await sleep(1400)
    const back = await boxAt(page, sel, 0)
    ok(`W9 ${name} Undo with the changes window open: the remark is brought on screen and is not under the window`, !out.inView && back.inView && back.onTop && back.value === was, `window ${wv ? wv.t + '–' + wv.b + ' × ' + wv.l + '–' + wv.r : 'none'}; box before ${out.t}–${out.b}, after ${back.t}–${back.b} × ${back.l}–${back.r}, on top: ${back.onTop} (what is there: ${back.hitIs}); words "${back.value}"`)
    await shot(page, `w9-${name}-3-after-undo`)
    ok(`W9 ${name} the window is still open after the Undo`, !!(await vis(page, '.chgwin')), 'window drawn')
    ok(`W9 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W9b — the same with the change BELOW the screen: brought up from the foot — where, on a phone, the window stands (lesson 5)
  if (want('w9')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const sel = '#sbBoard .sb-line .nts'
    const was = (await boxAt(page, sel, -1)).value
    await typeInto(page, sel, -1, ' w9b')
    await scrollBoard(page, sel, -1, 'top'); await sleep(500)
    await page.locator('#sbHist:visible').first().click(); await sleep(900)
    const wv = await vis(page, '.chgwin')
    const out = await boxAt(page, sel, -1)
    await shot(page, `w9b-${name}-1-window-open`)
    await page.locator(await undoSel(page)).first().click(); await quick(page, `w9b-${name}-2-just-after-undo`)
    await sleep(1400)
    const back = await boxAt(page, sel, -1)
    ok(`W9b ${name} Undo with the changes window open, the change below the screen: brought on screen and not under the window`, !out.inView && back.inView && back.onTop && back.value === was, `window ${wv ? wv.t + '–' + wv.b + ' × ' + wv.l + '–' + wv.r : 'none'}; box before ${out.t}–${out.b}, after ${back.t}–${back.b} × ${back.l}–${back.r}, on top: ${back.onTop} (what is there: ${back.hitIs}); words "${back.value}"`)
    await shot(page, `w9b-${name}-3-after-undo`)
    ok(`W9b ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W10 — Undo from another day's board, by the day arrow (chat 62's phone step that found no day tab)
  if (want('w10')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const sel = '#sbBoard .sb-line .nts'
    const was = (await boxAt(page, sel, 0)).value
    await typeInto(page, sel, 0, ' w10')
    await page.locator('#sbNextDay:visible, #schedBoard [data-sbtab="1"]:visible').first().click(); await sleep(900)
    await scrollBoard(page, sel, 0, 'foot'); await sleep(400)
    const day1 = await page.locator('#sbDay').innerText()
    await page.locator(await undoSel(page)).first().click(); await quick(page, `w10-${name}-1-just-after-undo`)
    await sleep(1600)
    const day2 = await page.locator('#sbDay').innerText()
    const back = await boxAt(page, sel, 0)
    ok(`W10 ${name} Undo pressed on Tuesday's board (reached by the › arrow): Monday comes back with the remark in view, words back`, /Tue/.test(day1) && /Mon/.test(day2) && back.inView && back.onTop && back.value === was, `day ${day1.replace(/\s+/g, '')} → ${day2.replace(/\s+/g, '')}; box ${back.t}–${back.b}, list ${back.top}–${back.bottom}; words "${back.value}"`)
    await shot(page, `w10-${name}-2-after-undo`)
    ok(`W10 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W11 — the keyboard's Undo (Ctrl+Z) on the board, the change out of view (desktop only)
  if (want('w11') && name === 'pc') {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const sel = '#sbBoard .sb-line .nts'
    const was = (await boxAt(page, sel, 0)).value
    await typeInto(page, sel, 0, ' w11')
    await scrollBoard(page, sel, 0, 'foot'); await sleep(500)
    await page.locator('#sbDate').click(); await sleep(200)   // the keys off any text box, as a person clicks away
    await page.keyboard.press('Control+z'); await sleep(1400)
    const back = await boxAt(page, sel, 0)
    // the scheduler has no keyboard Undo (no Ctrl+Z handler outside the Tracker — searched 11 Nov 26): not a way in; recorded
    note(`W11 ${name} Ctrl+Z on the board: not a way to Undo here (only the buttons are)`, back.value === was ? 'it undid — a keyboard Undo exists after all: walk it' : `nothing taken back — words still "${back.value}"`)
    await shot(page, `w11-${name}-ctrl-z`)
    ok(`W11 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W12 — the plain-user round: open the board from the week, change a remark, Undo, Redo, open and close History every way,
  //       ✓ Done, and look at the week; the changes clock on Edit Schedule opened and closed
  if (want('w12')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    const sel = '#sbBoard .sb-line .nts'
    const was = (await boxAt(page, sel, 0)).value
    await typeInto(page, sel, 0, ' p12')
    const u = await undoSel(page)
    await page.locator(u).first().click(); await sleep(900)
    const a = await boxAt(page, sel, 0)
    await page.locator(u.replace('Undo', 'Redo').replace('undo', 'redo')).first().click(); await sleep(900)
    const b = await boxAt(page, sel, 0)
    ok(`W12 ${name} change, Undo, Redo in view: words go and come back, the board does not move`, a.value === was && /p12/.test(b.value) && a.scroll === b.scroll, `"${a.value}" → "${b.value}", scrolled ${a.scroll} then ${b.scroll}`)
    await page.locator('#sbHist:visible').first().click(); await sleep(900)
    const s1 = await win(page)
    ok(`W12 ${name} History opens the changes window (All changes after a tab press) with the foot right`, !!s1, JSON.stringify(s1))
    if (s1) { await pickTab(page, 'All changes'); const s2 = await win(page); ok(`W12 ${name} …All changes: foot right`, footRight(s2), JSON.stringify(s2)); await shot(page, `w12-${name}-1-history-open`) }
    await closeWin(page)
    ok(`W12 ${name} ✕ closes the window`, !(await vis(page, '.chgwin')), 'after ✕')
    await shot(page, `w12-${name}-2-closed-by-x`)
    await page.locator('#sbHist:visible').first().click(); await sleep(800)
    const open2 = !!(await vis(page, '.chgwin'))
    await page.locator('#sbHist:visible').first().click(); await sleep(800)
    ok(`W12 ${name} History pressed again closes it`, open2 && !(await vis(page, '.chgwin')), `open: ${open2}`)
    await page.locator('#sbHist:visible').first().click(); await sleep(800)
    await page.keyboard.press('Escape'); await sleep(600)
    note(`W12 ${name} Escape with the window open (an open question to him, [CHGWIN-ESCAPE])`, (await vis(page, '.chgwin')) ? 'the window stays open' : 'the window closed')
    if (await vis(page, '.chgwin')) await closeWin(page)
    await doneBoard(page)
    const wk = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] input, #eWeek .day[data-day="0"] textarea, #eWeek .day[data-day="0"] [contenteditable]')].map(e => e.value ?? e.textContent).filter(t => /p12/.test(t)).length + [...document.querySelectorAll('#eWeek .day[data-day="0"]')].filter(d => /p12/.test(d.textContent)).length)
    ok(`W12 ${name} ✓ Done: the week shows the remark as left (with "p12")`, wk > 0, 'places on Monday showing it: ' + wk)
    await shot(page, `w12-${name}-3-week-after-done`)
    const hb = page.locator('#histBtn:visible').first()
    if (await hb.count()) {
      await hb.click(); await sleep(900)
      const s = await win(page)
      ok(`W12 ${name} Edit Schedule's changes clock opens the window, foot right`, footRight(s), JSON.stringify(s))
      if (s && !/All changes/.test(s.tab || '')) { await pickTab(page, 'All changes'); const s2 = await win(page); ok(`W12 ${name} …All changes, foot right`, footRight(s2), JSON.stringify(s2)) }
      await shot(page, `w12-${name}-4-clock-window`)
      await hb.click(); await sleep(700)
      ok(`W12 ${name} the clock pressed again closes it`, !(await vis(page, '.chgwin')), 'after the second press')
    } else note(`W12 ${name} Edit Schedule's changes clock`, 'not drawn at this size')
    ok(`W12 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }
}
finish('walk.json')
process.exit(0)
