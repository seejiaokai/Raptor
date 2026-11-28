// Walker b — B6 (Astra S16, O-S13, F-S6): THE PUBLISHED DAY. The fixture's day signed four times and published through
// the week's own controls (proved published and signed first); then on the Board, Ranger's row: start 0900 Tab, end
// 1100 Tab, remark Tab — a picture and the pending figure after each; the changes window, its line tapped; the day as a
// member sees it; Undo all; then Redo and publish the amendment.  SZ=desk ENG=chromium
console.log('shr-b-b6 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b6-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, store, boardRows, typeIn, pic, J, judge, showDay, caret, answerAsks, catchToast, releaseToast, shownToast, handOver, signIn } = B
const c = 'B6', P = `b6-${SZ}-${ENG}`
const R = st => st.filter(x => /^LL Ranger /.test(x)), H = st => st.filter(x => /^LL Hex /.test(x))
const notesFor = (page, ms = 3000) => page.evaluate(ms => new Promise(res => { const seen = []; const t0 = performance.now(); const tick = () => { const t = document.getElementById('toastEl'); if (t) { const cs = getComputedStyle(t); const s = (t.textContent || '').replace(/\s+/g, ' ').trim(); if (+cs.opacity > 0.05 && s && seen[seen.length - 1] !== s) seen.push(s) } if (performance.now() - t0 < ms) setTimeout(tick, 80); else res(seen) }; tick() }), ms)
/* what the day's head says (the Board when open, else the week's day) — copied from dbrA-W1-lib head() */
const head = (p, di) => p.evaluate(i => {
  const b = document.querySelector('#schedBoard')
  const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
  if (!scope) return null
  const t = e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : ''
  const q = s => scope.querySelector(s)
  return { where: scope.id || 'week', tag: t(q('.verchip')), pending: t(q('.dpend')), beak: q(`[data-beak="${i}"]`) ? (q(`[data-beak="${i}"]`).disabled ? 'locked' : 'on') : 'none', alpub: t(q(`[data-alpub="${i}"]`)), alpubLocked: q(`[data-alpub="${i}"]`)?.disabled ?? null, unpub: t(q(`[data-unpub="${i}"]`)), signs: [...scope.querySelectorAll(`select[data-sign][data-signday="${i}"]`)].map(s => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : ''), signed: t(q('.signedln')), nys: t(q('.nysmark')), undo: document.getElementById('undoBtn')?.title, sbUndo: document.getElementById('sbUndo')?.title }
}, di)
/* the waiting marks on each man's Unavailable row (week or board): classes / dotted styles on the row */
const rowMarks = (p, root) => p.evaluate(root => [...document.querySelectorAll(`${root} .puck[data-person="bane"], ${root} .puck[data-person="rocky"]`)].filter(e => e.getBoundingClientRect().width > 1 && e.closest('.sec-unav, [data-secmove$=".unav"]')).map(e => { const row = e.closest('.pl-row, .sb-arow, tr') || e.parentElement; const nm = row.querySelector('[data-inpedit]'); const cs = nm ? getComputedStyle(nm) : null; return `${e.getAttribute('data-person') === 'bane' ? 'Ranger' : 'Hex'}: row[${row.className}] name[${nm ? nm.className + ' ' + (nm.getAttribute('title') || '').slice(0, 60) + ' border:' + cs.borderBottomStyle + ' ' + cs.textDecorationLine + ' ' + cs.textDecorationStyle : '-'}] puck[${e.className}]` }), root)
async function sign(w, di, root) {
  const signed = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = w.page.locator(`${root} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.scrollIntoViewIfNeeded(); await sel.selectOption(opts[0]); await sleep(250)
    signed[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return signed
}
async function publish(w, di, root, attr) {
  const pub = w.page.locator(`${root} [${attr}="${di}"]:visible`).first()
  if (!(await pub.count())) return { err: 'no ' + attr }
  if (await pub.isDisabled()) return { err: 'greyed: ' + await pub.getAttribute('title') }
  await pub.scrollIntoViewIfNeeded()
  const np = notesFor(w.page, 4500)
  await pub.click(); await sleep(400)
  const dlg = await w.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^(Publish|Yes|Confirm)/.test(x.textContent.trim()) && x.closest('[role="dialog"], .airpop, .modal, .upconf-pop')); return b ? b.textContent.trim() : null })
  if (dlg) await w.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first().click()
  const asked = await answerAsks(w)
  return { dialog: dlg, asked, notes: await np }
}
/* the changes window from the day's pending count on the week: its tabs, "To go out" lines, a tap on Ranger's line, "All changes" */
async function changesWin(w, di, tag) {
  const out = {}
  const cnt = w.page.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (!(await cnt.count())) return { err: 'no pending count on the day' }
  out.countSays = (await cnt.innerText()).trim()
  await cnt.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await cnt.click(); await sleep(700)
  const rd = () => w.page.evaluate(() => { const wn = document.querySelector('.chgwin:not([hidden])'); if (!wn) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    return { title: t(wn.querySelector('.win-ttl')), tabs: [...wn.querySelectorAll('.win-tab')].map(x => t(x) + (x.classList.contains('on') ? ' [on]' : '')), outHead: t(wn.querySelector('.pl-head')), out: [...wn.querySelectorAll('.pl-list > *')].map(e => t(e)), groups: [...wn.querySelectorAll('.cw-g')].map(g => t(g).slice(0, 300)), foot: t(wn.querySelector('.win-foot')) } })
  const tabTo = async name => { const x = w.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: name }).first(); if (await x.count()) { await x.click(); await sleep(350); return true } return false }
  out.opened = await rd()
  if (!out.opened) return { ...out, err: 'no changes window opened' }
  out.pics = []
  if (await tabTo('To go out')) { out.toGoOut = await rd(); out.pics.push(await pic(w, c, `${P}-${tag}-chg-togoout`, ['.chgwin:not([hidden])'], out.toGoOut.out, { noScroll: true })) }
  /* tap Ranger's line: where does it land */
  const items = await w.page.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .pl-list > *')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
  const ix = items.findIndex(t => /Ranger/.test(t))
  if (ix >= 0) {
    await w.page.locator('.chgwin:not([hidden]) .pl-list > *').nth(ix).click({ timeout: 2500 }).catch(() => {}); await sleep(500)
    out.tapped = { line: items[ix], landed: await w.page.evaluate(() => { const e = document.querySelector('.chgflash'); const t = x => x ? (x.innerText || x.value || '').replace(/\s+/g, ' ').trim().slice(0, 120) : ''; return e ? { tag: e.tagName, cls: String(e.className).slice(0, 80), text: t(e), row: e.closest('.pl-row')?.getAttribute('data-inprow') || null, puck: e.closest('.pl-row')?.querySelector('.puck')?.getAttribute('data-person') || null, day: e.closest('.day[data-day]')?.getAttribute('data-day') || null } : { none: true, chgwinOpen: !!document.querySelector('.chgwin:not([hidden])') } }) }
    out.pics.push(await pic(w, c, `${P}-${tag}-chg-tapped`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.tapped, { noScroll: true }))
  } else out.tapped = { none: 'no line naming Ranger', items }
  /* the window again for All changes (the tap may have closed it) */
  if (!(await w.page.locator('.chgwin:not([hidden])').count())) { await cnt.click().catch(() => {}); await sleep(600) }
  if (await tabTo('All changes')) { out.all = await rd(); out.pics.push(await pic(w, c, `${P}-${tag}-chg-all`, ['.chgwin:not([hidden])'], out.all.groups, { noScroll: true })) }
  await w.page.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await sleep(300)
  return out
}
/* the day as the member (Ranger) sees it: View-only, its Unavailable rows */
const viewRows = (p, di) => p.evaluate(di => [...document.querySelectorAll(`#vWeek .day[data-day="${di}"] .sec-unav .pl-row`)].filter(r => r.getBoundingClientRect().width > 1 && r.querySelector('.puck[data-person="bane"], .puck[data-person="rocky"]')).map(r => `${r.querySelector('.puck[data-person="bane"]') ? 'Ranger' : 'Hex'} ${[...r.querySelectorAll('.t')].map(e => (e.textContent || '').trim()).join('-')} "${(r.querySelector('.rmk .ntx')?.textContent || '').trim()}" [${r.className}]`), di)
const vhead = (p, di) => p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; const sel = d.querySelector('select.dver'); return { tag: t(d.querySelector('.verchip')), pend: t(d.querySelector('.dpend')), nys: t(d.querySelector('.nysmark')), sel: sel ? sel.options[sel.selectedIndex].text : '', signed: t(d.querySelector('.signedln')) } }, di)
async function memberLook(w, di, who, tag) {
  const m = await handOver(w, SZ, who)
  await go(m.page, 'viewsched'); await sleep(500)
  await m.page.evaluate(i => document.querySelector(`#vWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), di)
  const r = { who, head: await vhead(m.page, di), rows: await viewRows(m.page, di), store: await store(m.page) }
  r.pic = await pic(m, c, `${P}-${tag}-member-${who}`, [`#vWeek .day[data-day="${di}"] .sec-unav`], r.rows)
  log(c, `${tag} the day as ${who} sees it: ${J(r)}`)
  return { m, r }
}

const out = { steps: [] }
let w
try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  if (!iid) throw new Error('fixture not filed')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
  await showDay(w.page, di); await sleep(300)
  /* ---- publish: sign four times, Publish day ---- */
  out.signed = await sign(w, di, '#eWeek')
  out.headSigned = await head(w.page, di)
  out.publish = await publish(w, di, '#eWeek', 'data-beak')
  await sleep(600)
  out.headPublished = await head(w.page, di)
  out.marksPublished = await rowMarks(w.page, '#eWeek')
  await w.page.evaluate(i => document.querySelector(`#eWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'nearest' }), di); await sleep(250)
  const pp = await pic(w, c, `${P}-0-published`, [`#eWeek .day[data-day="${di}"]`], out.headPublished, { noScroll: true })
  log(c, 'published: ' + J({ signed: out.signed, publish: out.publish, head: out.headPublished }))
  const hp = out.headPublished
  const isPub = !!hp && hp.beak === 'none' && !!(hp.tag || hp.unpub) && ((hp.signs.length === 4 && hp.signs.every(s => s && !/^(—|-|Sign|$)/.test(s))) || !!hp.signed)
  judge('B6 fixture published and signed', cfg, isPub ? 'PASS' : 'NOT WALKED', { signed: out.signed, publish: out.publish, head: out.headPublished }, pp)
  if (!isPub) throw new Error('the day did not read published and signed: ' + J(out.headPublished))
  /* ---- the Board: Ranger's row, three changes ---- */
  await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  const h0 = await head(w.page, di)
  out.steps.push({ step: 'board open', head: h0, store: await store(w.page), screen: await boardRows(w.page) })
  const pics = [await pic(w, c, `${P}-1-board-open`, ['#sbBoard > [data-secmove$=".unav"]'], h0)]
  const bsel = async f => { const k = (await boardRows(w.page)).find(r => r.startsWith('Ranger')).match(/\[(.+)\]/)[1].replace(/\.str$/, '.' + f); return `#schedBoard [data-ifld="${k}"]` }
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]) {
    const sel = await bsel(f)
    const b = w.page.locator(sel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await b.click(); await sleep(200)
    await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v, { delay: 15 })
    const np = notesFor(w.page, 2500); await w.page.keyboard.press('Tab'); const notes = await np; await sleep(300)
    const s = { step: `${f} ${v} Tab`, typedIn: sel, store: await store(w.page), screen: await boardRows(w.page), caret: await caret(w.page), head: await head(w.page, di), marks: await rowMarks(w.page, '#schedBoard'), notes }
    out.steps.push(s); log(c, J(s))
    pics.push(await pic(w, c, `${P}-2-board-${f}`, ['#sbBoard > [data-secmove$=".unav"]'], { pending: s.head.pending, signs: s.head.signs, screen: s.screen }, { noScroll: true }))
  }
  await w.page.mouse.click(3, 3); await sleep(800)
  const sl = { step: 'caret left', store: await store(w.page), screen: await boardRows(w.page), head: await head(w.page, di), marks: await rowMarks(w.page, '#schedBoard') }
  out.steps.push(sl); log(c, J(sl))
  pics.push(await pic(w, c, `${P}-3-board-left`, ['#sbBoard > [data-secmove$=".unav"]'], { pending: sl.head.pending, signs: sl.head.signs, marks: sl.marks }))
  /* close the board */
  const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(700) }
  await showDay(w.page, di); await sleep(300)
  out.week = { head: await head(w.page, di), marks: await rowMarks(w.page, '#eWeek'), screen: await B.weekRows(w.page, di) }
  pics.push(await pic(w, c, `${P}-4-week-after`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.week))
  log(c, 'week after: ' + J(out.week))
  /* ---- the changes window ---- */
  out.chg = await changesWin(w, di, '5')
  log(c, 'changes window: ' + J(out.chg))
  pics.push(...(out.chg.pics || []))
  /* ---- Undo all (the top bar's Undo) until the store holds the one shared leave again ---- */
  out.undos = []
  for (let i = 0; i < 6; i++) {
    const st = await store(w.page)
    if (st.length === 1 && /Ranger\+Hex 08:00-10:00 ""/.test(st[0])) break
    const u = w.page.locator('#undoBtn:visible').first()
    const t = await u.getAttribute('title'); if (await u.isDisabled()) { out.undos.push({ title: t, disabled: true }); break }
    await u.click(); await sleep(800)
    out.undos.push({ title: t, store: await store(w.page), head: await head(w.page, di), notes: await shownToast(w.page) })
  }
  out.afterUndo = { store: await store(w.page), head: await head(w.page, di), screen: await B.weekRows(w.page, di), marks: await rowMarks(w.page, '#eWeek') }
  pics.push(await pic(w, c, `${P}-7-after-undo`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.afterUndo.head))
  log(c, 'undos: ' + J(out.undos) + ' after: ' + J(out.afterUndo))
  /* ---- Redo the same number, then publish the amendment ---- */
  out.redos = []
  for (let i = 0; i < out.undos.filter(u => !u.disabled).length; i++) {
    const r = w.page.locator('#redoBtn:visible').first()
    const t = await r.getAttribute('title'); if (await r.isDisabled()) { out.redos.push({ title: t, disabled: true }); break }
    await r.click(); await sleep(800)
    out.redos.push({ title: t, store: await store(w.page), head: await head(w.page, di) })
  }
  out.afterRedo = { store: await store(w.page), head: await head(w.page, di), screen: await B.weekRows(w.page, di) }
  pics.push(await pic(w, c, `${P}-8-after-redo`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.afterRedo.head))
  log(c, 'redos: ' + J(out.redos) + ' after: ' + J(out.afterRedo))
  out.chgBeforeAL = await changesWin(w, di, '8b'); pics.push(...(out.chgBeforeAL.pics || []))
  /* ---- the day as the member sees it (Ranger signs in on the same world; the admin's Undo list clears at sign-out, D148,
     so this comes after the Undo / Redo), then back to the admin ---- */
  const r1 = await memberLook(w, di, 'us', '8c'); out.memberBefore = r1.r; pics.push(r1.r.pic)
  w = await handOver(r1.m, SZ, 'ad'); await go(w.page, 'editsched'); await sleep(500); await showDay(w.page, di)
  log(c, 'admin again, store ' + J(await store(w.page)) + ' head ' + J(await head(w.page, di)))
  let al = await publish(w, di, '#eWeek', 'data-alpub')
  if (al.err) { out.signAgain = await sign(w, di, '#eWeek'); al = { firstTry: al, ...(await publish(w, di, '#eWeek', 'data-alpub')) } }
  out.amend = al
  await sleep(600)
  out.afterAL = { store: await store(w.page), head: await head(w.page, di), screen: await B.weekRows(w.page, di) }
  pics.push(await pic(w, c, `${P}-9-after-amendment`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.afterAL.head))
  log(c, 'amendment: ' + J(out.amend) + ' after: ' + J(out.afterAL))
  const r2 = await memberLook(w, di, 'us', '10'); out.memberAfter = r2.r; pics.push(r2.r.pic)
  await r2.m.ctx.close()
  /* ---- judge ---- */
  const s3 = out.steps[3], sLeft = out.steps[4]
  const issuedFrozen = out.memberBefore.rows.length === 2 && out.memberBefore.rows.every(x => / 08:00-10:00 "(till 15 Jul)?"/.test(x))
  const changesRanger = R(sLeft.store).length === 1 && R(sLeft.store)[0].includes('09:00-11:00 "own hours"') && H(sLeft.store).length === 1 && H(sLeft.store)[0].includes('08:00-10:00 ""')
  /* the sign-offs fall: the "Not yet signed" marker on every change, and AL1's publish locked until signed again */
  const signsFell = out.steps.slice(1, 4).every(s => /Not yet signed/.test(s.head.nys) && s.head.alpubLocked === true)
  const amendRanger = out.memberAfter.rows.some(x => /^Ranger 09:00-11:00 "own hours/.test(x)) && out.memberAfter.rows.some(x => /^Hex 08:00-10:00 "(till 15 Jul)?"/.test(x))
  judge('B6', cfg, issuedFrozen && changesRanger && amendRanger ? 'PASS' : 'FAIL', { issuedFrozenBeforeAmendment: issuedFrozen, rangerOnlyChanged: changesRanger, amendmentCarriesRangerNotHex: amendRanger, memberBefore: out.memberBefore.rows, memberAfter: out.memberAfter.rows, storeAfterChanges: sLeft.store, storeAfterAL: out.afterAL.store }, pics.join(', '))
  judge('B6 counts, marks, sign-offs', cfg, 'RECORD', { published: out.headPublished, perChange: out.steps.map(s => ({ step: s.step, pending: s.head?.pending, signs: s.head?.signs, nys: s.head?.nys, alpub: s.head?.alpub, marks: s.marks, notes: s.notes })), week: out.week, undos: out.undos.map(u => ({ title: u.title, pending: u.head?.pending, signs: u.head?.signs })), afterUndo: out.afterUndo, redos: out.redos.map(r => ({ title: r.title, pending: r.head?.pending, signs: r.head?.signs })), afterRedo: out.afterRedo, amend: out.amend, signAgain: out.signAgain, afterAL: out.afterAL }, pics.join(', '))
  judge('B6 changes window', cfg, 'RECORD', { afterChanges: out.chg, beforeAmendment: out.chgBeforeAL }, (out.chg.pics || []).join(', '))
  judge('B6 the member\'s view', cfg, 'RECORD', { before: out.memberBefore, after: out.memberAfter }, `${out.memberBefore.pic}, ${out.memberAfter.pic}`)
  judge('B6 sign-offs fall on the first change', cfg, signsFell ? 'PASS' : 'FAIL', out.steps.slice(1, 4).map(s => ({ step: s.step, pending: s.head.pending, signs: s.head.signs })), pics.slice(1, 4).join(', '))
} catch (e) { judge('B6', cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400) + ' :: so far ' + J(out).slice(0, 1500)) }
try { await w?.ctx.close() } catch {}
await B.done()
