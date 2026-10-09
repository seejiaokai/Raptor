// Scenarios 22, 23, 24 (admin, desktop and phone): the Personal Inputs cards, the Unavailable cards, and a long title with the normal marks.
import { launch, open, table, errs, people, shot, elShot, sleep, press, allRecs, closeAnyWin, win, norm, toCal, tapAt, gotoInputs, recs, month, DAYWIN } from './it-A-lib.mjs'
import { calDoor, boardDoor, closeBoardAny, showAll, T40 } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s22')
const SZ = (process.argv[2] || 'desk,phone').split(',')
const WHICH = (process.argv[3] || '22,23,24').split(',')
for (const size of SZ) {
  const { ctx, page } = await open(browser, size)
  const tag = size === 'phone' ? 'p' : 'd'
  const P = await people(page)
  const c = calDoor()
  const mk = async (who, type, title, st, en, rmk) => {
    const before = new Set((await allRecs(page)).map(r => r.iid))
    await c.openNew(page, { iso: '2026-07-15', person: P[who], type, st, en, rmk })
    if (title) await page.fill('#inpEditTitle', title)
    await c.submit(page); await closeAnyWin(page)
    return (await allRecs(page)).find(r => !before.has(r.iid))
  }
  const F = {}
  F.e1 = await mk('Ranger', 'Event', 'Sports day', '14:00', '15:00', 'Bring boots please')
  F.e0 = await mk('Anvil', 'Event', '', '16:00', '17:00', 'Bring boots please')
  F.o1 = await mk('Ranger', 'OD', 'Overseas visit', null, null, 'Detachment')
  F.o0 = await mk('Anvil', 'OD', '', null, null, 'Detachment')
  const LONGR = 'Bring the long list of kit, the signed forms and the spare radio batteries to the briefing room before the start please'
  F.l1 = await mk('Basher', 'Event', T40, '09:00', '10:00', LONGR)
  F.l0 = await mk('Cinch', 'Event', '', '09:00', '10:00', LONGR)
  F.l1x = await mk('Basher', 'Training', '', '09:30', '10:30', 'overlap')
  F.l0x = await mk('Cinch', 'Training', '', '09:30', '10:30', 'overlap')
  console.log(size, 'fixtures', Object.entries(F).map(([k, v]) => k + ':' + (v && v.iid)).join(' '))

  const unfold = async root => {
    for (const f of await page.locator(`${root} .pl-fold, ${root} [data-pitog]`).all()) {
      const t = (await f.innerText().catch(() => '')).replace(/\s+/g, ' ')
      if (/Personal Inputs|show/.test(t) && /show/.test(t)) { await f.scrollIntoViewIfNeeded().catch(() => {}); await press(page, f); await sleep(page, 300) }
    }
  }
  const card = async (root, iid) => {
    const sel = `${root} [data-inprow="${iid}"]`
    if (!(await page.locator(sel).count()) || !(await page.locator(sel).first().isVisible().catch(() => false))) await unfold(root)
    const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await sleep(page, 150)
    return el.evaluate(r => {
      const ty = r.querySelector('.sbi-ty') || r.querySelector('.nm .ntx'), k = r.querySelector('.nm-kind'), late = r.querySelector('.latechip')
      const box = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { l: Math.round(q.left), t: Math.round(q.top), r: Math.round(q.right), b: Math.round(q.bottom) } }
      const ov = (a, b) => a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2
      const a = box(ty), kb = box(k), lb = box(late)
      return { name: ty && ty.textContent.trim(), kind: k && k.textContent.trim(), late: !!late, clip: ty ? ty.scrollWidth > ty.clientWidth + 1 : null, overlaps: [ov(a, kb) && 'name/kind', ov(a, lb) && 'name/late', ov(kb, lb) && 'kind/late'].filter(Boolean), vw: innerWidth, inside: a && a.r <= innerWidth + 1 && a.l >= -1 }
    })
  }
  const openCard = async (root, iid) => {
    const b = page.locator(`${root} [data-inprow="${iid}"] [data-inpedit]`).first(); await b.scrollIntoViewIfNeeded()
    await press(page, b); await page.locator('input#inpEditTitle').first().waitFor({ state: 'visible', timeout: 5000 }); await sleep(page, 250)
    const d = await page.evaluate(() => { const t = [...document.querySelectorAll('input#inpEditTitle')].find(e => e.offsetParent); const per = document.querySelector('#inpEditPop #inpEditPerson, [data-testid="win-inputedit"] #inpEditPerson, #inpEditPersonFixed'); return { title: t && t.value, sw: t && t.scrollWidth, cw: t && t.clientWidth, person: per ? (per.tagName === 'SELECT' ? per.selectedOptions[0].textContent : per.textContent) : null, type: (document.querySelector('#inpEditType') || {}).value } })
    return d
  }
  const closeEd = async () => { const x = page.locator('#inpEditCancel'); if (await x.count() && await x.first().isVisible().catch(() => false)) { await press(page, x.first()); await sleep(page, 250) } }
  const surfaces = [
    { n: 'week', root: '#eWeek .day[data-day="2"]', pre: async () => { await page.evaluate(() => window.go('editsched')); await sleep(page, 600) } },
    { n: 'Board', root: '#schedBoard', pre: async () => { await boardDoor(2).openBoard(page) } },
  ]
  /* ---------------- 22 ---------------- */
  if (WHICH.includes('22')) {
    const say = []; let ok = true; const pics = []
    const need = (cnd, m) => { if (!cnd) ok = false; say.push((cnd ? '' : 'MISSED: ') + m) }
    try {
      for (const S of surfaces) {
        await closeBoardAny(page); await S.pre()
        const a = await card(S.root, F.e1.iid), b = await card(S.root, F.e0.iid)
        need(a.name === 'Sports day' && a.kind === 'Event' && b.name === 'Event' && !b.kind, `${S.n}: titled card reads "${a.name}" with kind "${a.kind}"; untitled card reads "${b.name}" with kind ${JSON.stringify(b.kind)}`)
        need(a.overlaps.length === 0 && b.overlaps.length === 0 && a.inside, `${S.n}: nothing overlaps on the cards (${JSON.stringify(a.overlaps)}, ${JSON.stringify(b.overlaps)})`)
        await page.locator(`${S.root} [data-inprow="${F.e1.iid}"]`).first().scrollIntoViewIfNeeded()
        pics.push(await shot(page, `s22-${tag}-${S.n}-cards`))
        for (const [k, f] of [['titled', F.e1], ['untitled', F.e0]]) {
          const d = await openCard(S.root, f.iid)
          need(d.title === (k === 'titled' ? 'Sports day' : 'Event') && d.person === (k === 'titled' ? 'Ranger' : 'Anvil') && d.type === 'Event', `${S.n}: the ${k} card opens the right input - Title "${d.title}", Person "${d.person}", Type ${d.type}`)
          if (k === 'titled') pics.push(await shot(page, `s22-${tag}-${S.n}-opened-titled`))
          await closeEd()
        }
      }
    } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `s22-${tag}-err`).catch(() => {}) }
    T.add({ n: 22, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics }); T.save()
  }
  /* ---------------- 23 ---------------- */
  if (WHICH.includes('23')) {
    const say = []; let ok = true; const pics = []
    const need = (cnd, m) => { if (!cnd) ok = false; say.push((cnd ? '' : 'MISSED: ') + m) }
    try {
      for (const S of surfaces) {
        await closeBoardAny(page); await S.pre()
        const a = await card(S.root, F.o1.iid), b = await card(S.root, F.o0.iid)
        need(a.name === 'Overseas visit' && a.kind === 'OD' && b.name === 'OD' && !b.kind, `${S.n}: titled OD card reads "${a.name}" with kind "${a.kind}"; untitled OD card reads "${b.name}" with kind ${JSON.stringify(b.kind)}`)
        await page.locator(`${S.root} [data-inprow="${F.o1.iid}"]`).first().scrollIntoViewIfNeeded()
        pics.push(await shot(page, `s23-${tag}-${S.n}-cards`))
        for (const [k, f] of [['titled', F.o1], ['untitled', F.o0]]) {
          const d = await openCard(S.root, f.iid)
          need(d.title === (k === 'titled' ? 'Overseas visit' : 'OD') && d.person === (k === 'titled' ? 'Ranger' : 'Anvil') && d.type === 'OD', `${S.n}: the ${k} OD card opens the right input - Title "${d.title}", Person "${d.person}", Type ${d.type}`)
          await closeEd()
        }
      }
      const gr = await page.evaluate(ids => ids.map(id => window.DAYS[2].ground.filter(g => g.src === id).length), [F.o1.iid, F.o0.iid])
      need(gr[0] === 0 && gr[1] === 0, `neither OD has a Ground Programme row (rows for the titled OD ${gr[0]}, untitled OD ${gr[1]})`)
      await closeBoardAny(page); await page.evaluate(() => window.go('editsched')); await sleep(page, 500)
      const wk = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="2"] .pl-row.gr-frominput')].map(r => (r.querySelector('.nm .ntx') || {}).textContent))
      need(!wk.some(x => /OVERSEAS|^OD$/i.test(x || '')), `the week's Ground Programme request rows are ${JSON.stringify(wk)} - no OD row`)
    } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `s23-${tag}-err`).catch(() => {}) }
    T.add({ n: 23, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics }); T.save()
  }
  /* ---------------- 24 ---------------- */
  if (WHICH.includes('24')) {
    const say = []; let ok = true; const pics = []
    const need = (cnd, m) => { if (!cnd) ok = false; say.push((cnd ? '' : 'MISSED: ') + m) }
    try {
      const w = await page.evaluate(([a, b]) => window.validate().all.filter(x => x.di === 2).filter(x => (x.who || []).some(p => [a, b].includes(p))).map(x => x.code + ':' + x.sev), [P.Basher, P.Cinch])
      say.push(`warnings on the two men's Wednesday: ${JSON.stringify(w)}`)
      // calendar day
      await gotoInputs(page); await toCal(page); await closeAnyWin(page); await month(page, 2026, 7)
      await tapAt(page, page.locator('#inpCal [data-icday="2026-07-15"]'), { x: 8, y: 8 }); await sleep(page, 400)
      const dc = await page.evaluate(([a, b]) => Object.fromEntries([['t', a], ['u', b]].map(([k, id]) => { const c = document.querySelector(`[data-testid="idy-row-${id}"]`); if (!c) return [k, null]; const n = c.querySelector('.idy-kind'), tg = c.querySelector('[data-testid="idy-kindtag"]'), lt = c.querySelector('.latetag, .latechip'); const bx = e => e && e.getBoundingClientRect(); const ov = (x, y) => x && y && Math.min(x.right, y.right) - Math.max(x.left, y.left) > 2 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 2; return [k, { name: n.textContent, clip: n.scrollWidth > n.clientWidth + 1, tag: tg && tg.textContent, late: !!lt, ov: [ov(bx(n), bx(tg)) && 'name/tag', ov(bx(n), bx(lt)) && 'name/late'].filter(Boolean), h: Math.round(c.getBoundingClientRect().height), rmk: (c.querySelector('.sd-rmk') || {}).textContent }] })), [F.l1.iid, F.l0.iid])
      say.push(`Calendar day: ${JSON.stringify(dc)}`)
      need(dc.t && dc.t.name === T40 && dc.t.tag === 'Event' && dc.t.ov.length === 0 && dc.u && dc.u.name === 'Event' && !dc.u.tag, `Calendar day: the 40-character title carries its kind tag, the untitled control has none, nothing overlaps (the title text ${dc.t && dc.t.clip ? 'is cut by an ellipsis on the card - see the picture; the editor shows all 40' : 'is whole'})`)
      pics.push(await elShot(page, DAYWIN, `s24-${tag}-day`))
      await closeAnyWin(page)
      // List
      await press(page, page.locator('#inListBtn')); await showAll(page)
      const lr = await page.evaluate(([a, b]) => Object.fromEntries([['t', a], ['u', b]].map(([k, id]) => { const t = document.querySelector(`#inBody tr[data-iid="${id}"]`); if (!t) return [k, null]; const ti = t.querySelector('[data-testid="in-title"]'), tg = t.querySelector('.intag'), lt = t.querySelector('.latetag'); const bx = e => e && e.getBoundingClientRect(); const ov = (x, y) => x && y && Math.min(x.right, y.right) - Math.max(x.left, y.left) > 2 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 2; return [k, { title: ti && ti.textContent, clip: ti ? ti.scrollWidth > ti.clientWidth + 1 : null, kind: tg && tg.textContent, late: !!lt, ov: [ov(bx(ti), bx(tg)) && 'title/kind', ov(bx(tg), bx(lt)) && 'kind/late'].filter(Boolean) }] })), [F.l1.iid, F.l0.iid])
      say.push(`List: ${JSON.stringify(lr)}`)
      need(lr.t && lr.t.title === T40 && !lr.t.clip && lr.t.kind === 'Event' && lr.u && !lr.u.title && lr.u.kind === 'Event', 'List: the title is whole above the kind; the untitled control shows one kind label (boxes of the wrapped title and the kind pill overlap by measure: judged on the picture)')
      await page.locator(`#inBody tr[data-iid="${F.l1.iid}"]`).first().scrollIntoViewIfNeeded()
      pics.push(await shot(page, `s24-${tag}-list`))
      // the opened editor reveals all 40 characters (the List's pencil, then the window)
      await page.locator(`#inBody tr[data-iid="${F.l1.iid}"] [data-edit]`).first().click().catch(async () => { await press(page, page.locator(`#inBody tr[data-iid="${F.l1.iid}"] [data-edit]`).first()) })
      const pe = await page.locator('#inBody tr.ined input[data-ed="title"]').evaluate(e => ({ v: e.value.length, sw: e.scrollWidth, cw: e.clientWidth }))
      say.push(`List pencil editor: the Title box holds ${pe.v} characters, its text is ${pe.sw}px wide in a ${pe.cw}px box${pe.sw > pe.cw + 1 ? ' - CLIPPED, scrolls inside the box' : ' - whole'}`)
      pics.push(await shot(page, `s24-${tag}-pencil`))
      await press(page, page.locator('#inBody tr.ined [data-cancel]'))
      await sleep(page, 200)
      await c.openSaved(page, F.l1)
      const we = await page.locator('input#inpEditTitle').evaluate(e => ({ v: e.value.length, sw: e.scrollWidth, cw: e.clientWidth }))
      need(we.v === 40 && we.sw <= we.cw + 4, `window editor: the Title box holds ${we.v} characters; text ${we.sw}px in a ${we.cw}px box`)
      pics.push(await shot(page, `s24-${tag}-window`))
      await closeAnyWin(page)
      // week and Board
      for (const S of [{ n: 'week', pre: async () => { await page.evaluate(() => window.go('editsched')); await sleep(page, 600) }, root: '#eWeek' }, { n: 'Board', pre: async () => { await boardDoor(2).openBoard(page) }, root: '#schedBoard' }]) {
        await closeBoardAny(page); await S.pre()
        const rows = await page.evaluate(({ root, S }) => {
          const all = [...document.querySelectorAll(`${root} ${root === '#eWeek' ? '.day[data-day="2"] ' : ''}.pl-row.gr-frominput, ${root} ${root === '#eWeek' ? '.day[data-day="2"] ' : ''}.sb-arow.c6r`)]
          const nameOf = r => (r.querySelector('.nm .ntx') || r.querySelector('[data-bfld$=".prog"]') || {}); const txt = e => (e.value != null && e.value !== undefined && e.tagName === 'INPUT' ? e.value : e.textContent || '').trim()
          return all.filter(r => /1234567890|^EVENT$/i.test(txt(nameOf(r)))).map(r => { const n = nameOf(r), k = r.querySelector('.nm-kind'), q = r.getBoundingClientRect(); const nb = n.getBoundingClientRect(), kb = k && k.getBoundingClientRect(); return { name: txt(n), clip: n.scrollWidth > n.clientWidth + 1, kind: k && k.textContent, ov: !!(kb && Math.min(nb.right, kb.right) - Math.max(nb.left, kb.left) > 2 && Math.min(nb.bottom, kb.bottom) - Math.max(nb.top, kb.top) > 2), h: Math.round(q.height) } })
        }, { root: S.root, S: S.n })
        say.push(`${S.n} rows: ${JSON.stringify(rows)}`)
        const t = rows.find(r => /1234567890/.test(r.name)), u = rows.find(r => /^EVENT$/i.test(r.name))
        need(!!t && t.kind === 'Event' && !t.ov, `${S.n}: the 40-character name row carries its kind tag with no overlap (found ${!!t}, kind ${t && t.kind}, overlap ${t && t.ov}, name clipped ${t && t.clip})`)
        need(!!u && !u.kind, `${S.n}: the untitled control row reads EVENT with no second label`)
        // scroll to the row for the picture
        await page.evaluate(({ root, d }) => { const r = [...document.querySelectorAll(`${root} .pl-row.gr-frominput, ${root} .sb-arow.c6r`)].find(x => /1234567890/.test((x.querySelector('.nm .ntx') || x.querySelector('[data-bfld$=".prog"]') || {}).value || (x.querySelector('.nm .ntx') || {}).textContent || '')); if (r) { const day = r.closest('.day'); const wk = document.querySelector(root); if (day && wk && wk.scrollWidth > wk.clientWidth + 4) wk.scrollLeft += day.getBoundingClientRect().left - wk.getBoundingClientRect().left - 6; r.scrollIntoView({ block: 'center' }) } }, { root: S.root })
        await sleep(page, 400)
        pics.push(await shot(page, `s24-${tag}-${S.n}`))
      }
      await closeBoardAny(page)
    } catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, `s24-${tag}-err`).catch(() => {}) }
    T.add({ n: 24, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics }); T.save()
  }
  await ctx.close()
}
await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
