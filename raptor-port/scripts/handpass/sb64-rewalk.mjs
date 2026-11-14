// Chat 64, job 1: the re-walk of the reads' fixes (Undo / Redo land on the change only when it is out of view). Version: sb64-rewalk v13
// From raptor-port/:  WALK_DIR=dist node scripts/handpass/sb64-rewalk.mjs      ONLY=r2,r3 picks scenarios; SIZES=pc,phone picks sizes.
console.log('sb64-rewalk v15')
process.env.SB61_OUT ||= 'docs/img/handpass/2026-11-10-sched-board-small/rewalk'
const { world, sleep, shot, ok, note, openBoard, finish, PC, PHONE, OUT } = await import('./sb61-lib.mjs')
const { resolve } = await import('node:path')
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
const SZ = (process.env.SIZES || 'pc,phone').split(',')
const hasSz = n => SZ.includes(n)
const OPTS = { pc: { size: PC }, phone: { size: PHONE, phone: true, dpr: 2, engine: 'webkit' }, phoneC: { size: PHONE, phone: true, dpr: 2, engine: 'chromium' } }
const ALLERR = []

const quick = (page, name) => page.screenshot({ path: resolve(OUT, name + '.png') })
const until = async (fn, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await fn()) return true } catch { /* retry */ } await sleep(150) } return false }
const REMARKS = '#sbBoard .sb-line .nts'
const LIST = '#sbBoard .sb-panel.prog'
const PI_HEAD = '#sbBoard .sb-panel.pinp [data-pitog]', PI_ROWS = '#sbBoard .sb-panel.pinp .inprow'

const spot = (page, sel, idx = 0) => page.evaluate(([sel, idx]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const el = els[idx < 0 ? els.length + idx : idx]; if (!el) return null
  let s = el.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const sc = s || document.scrollingElement
  const r = el.getBoundingClientRect()
  const v = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect()
  const bar = document.querySelector('#schedBoard .sb-top')?.getBoundingClientRect()
  const top = Math.max(v.top, bar && bar.top <= 1 ? bar.bottom : 0), bottom = Math.min(v.bottom, innerHeight)
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), top: Math.round(top), bottom: Math.round(bottom), inView: r.top >= top - 0.5 && r.bottom <= bottom + 0.5, onTop: !!hit && (hit === el || el.contains(hit) || hit.contains(el)), hitIs: hit ? (hit.className + '').slice(0, 30) : null, value: String(el.value ?? el.textContent ?? '').slice(0, 80), scroll: Math.round(sc.scrollTop), n: els.length }
}, [sel, idx])
const list = (page, to) => page.evaluate(([sel, to]) => {
  let s = document.querySelector(sel).parentElement
  while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const sc = s || document.scrollingElement
  if (to) sc.scrollTop = to === 'top' ? 0 : sc.scrollHeight
  return Math.round(sc.scrollTop)
}, [LIST, to])
// at rest: two readings 200 ms apart agree
const rested = async page => { let a = -1, b = await list(page); const t = Date.now(); while ((a !== b) && Date.now() - t < 8000) { await sleep(200); a = b; b = await list(page) } return b }
const settle = async page => { await sleep(350); return rested(page) }
const nearTop = (page, sel) => page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().height > 0)
  let s = el.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
  s.scrollTop += el.getBoundingClientRect().top - Math.max(s.getBoundingClientRect().top, bar.bottom) - 24
}, sel)
const tapOrClick = async (page, loc) => { if (page.__phone) await loc.tap(); else await loc.click() }
const ur = async (page, kind, name) => { const loc = page.locator(kind === 'undo' ? '#sbUndo:visible' : '#sbRedo:visible').first(); await tapOrClick(page, loc); if (name) await quick(page, name) }
async function retype(page, sel, idx, add) {
  const els = page.locator(sel).filter({ visible: true })
  const el = idx < 0 ? els.nth((await els.count()) + idx) : els.nth(idx)
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('End'); await page.keyboard.type(add); await page.keyboard.press('Enter'); await sleep(700)
}
async function retime(page, sel, digits) { await page.locator(sel).filter({ visible: true }).first().click(); await page.keyboard.type(digits); await page.keyboard.press('Enter'); await sleep(500) }
const groundRow = (page, item) => page.evaluate(item => { const b = [...document.querySelectorAll('#sbBoard .gr-frominput [data-bfld$=".prog"]')].find(e => e.value === item); return b ? b.getAttribute('data-bfld').replace(/\.prog$/, '') : null }, item)
const inputOf = (page, kind) => page.evaluate(kind => { const b = [...document.querySelectorAll('#sbBoard .sb-panel.pinp .inprow .inpedit')].find(e => (e.textContent || '').trim() === kind); return b ? b.getAttribute('data-inpedit') : null }, kind)

async function run(id, sizeKey, fn) {
  if (!want(id.toLowerCase().slice(0, 2)) && !want(id.toLowerCase())) return
  const tag = `${id} ${sizeKey}`
  let ctx, br
  try {
    const w = await world(OPTS[sizeKey]); ctx = w.ctx; br = ctx.browser()
    w.page.__phone = sizeKey !== 'pc'
    w.page.on('requestfailed', r => w.errors.push('requestfailed ' + r.url().slice(0, 100)))
    w.page.on('response', r => { if (r.status() >= 400) w.errors.push('http ' + r.status() + ' ' + r.url().slice(0, 100)) })
    await openBoard(w.page, 0)
    await fn(w.page, tag, w)
    ALLERR.push(...w.errors.map(e => tag + ': ' + e))
    ok(`${tag} no console error, page error or failed request`, !w.errors.length, w.errors.join(' | ') || 'none')
  } catch (e) {
    ok(`${tag} scenario could not run`, null, 'NOT RUN: ' + String(e.message).split('\n')[0].slice(0, 300))
    try { if (ctx) await shot(ctx.pages()[0], `${id.toLowerCase().replace(/\W/g, '')}-${sizeKey}-notrun`) } catch { /* none */ }
  } finally { try { if (ctx) await ctx.close() } catch { /* closed */ } }
}
const nm = (id, size) => `${id.toLowerCase()}-${size}`

// ---------------- R2: the pinched board (Chromium, a phone's size and touch; the pinch is by CDP fingers) ----------------
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
async function pinch(cdp, cx, cy, d0, d1, steps = 10) {
  const at = i => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await touch(cdp, 'touchStart', [at(0)[0]]); await sleep(30)
  await touch(cdp, 'touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
  await touch(cdp, 'touchEnd', []); await sleep(350)
}
if (want('r2') && hasSz('phone')) {
  for (const [name, fingers, lo, hi] of [['small', [[240, 120]], 0.3, 0.75], ['twice', [[60, 300], [60, 300]], 1.9, 2.05]]) {
    await run(`R2 ${name}`, 'phoneC', async (page, tag, w) => {
      await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap()
      await page.waitForSelector('#schedBoard.sb-wide'); await sleep(400)
      const cdp = await w.ctx.newCDPSession(page)
      for (const [d0, d1] of fingers) await pinch(cdp, 200, 450, d0, d1)
      const z = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#schedBoard .sb-main')).zoom || '1'))
      ok(`${tag} the day is pinched (zoom ${z.toFixed(2)}, wanted ${lo}–${hi})`, z > lo && z < hi, `zoom ${z}`)
      const n = nm('r2', name)
      await retype(page, REMARKS, 0, ' r2')
      const before = await spot(page, REMARKS, 0)
      await list(page, 'foot'); await rested(page)
      const out = await spot(page, REMARKS, 0)
      await shot(page, `${n}-1-before-undo`)
      await ur(page, 'undo', `${n}-2-just-after-undo`)
      await until(async () => !/r2/.test((await spot(page, REMARKS, 0)).value))
      await settle(page)
      const back = await spot(page, REMARKS, 0)
      await shot(page, `${n}-3-after-undo`)
      ok(`${tag} Undo of a remark near the top, the day at its foot: the box comes into view, not under the bar, on top`, !out.inView && back.inView && back.onTop && back.t - back.top < 60, `retyped "${before.value}"; before: box ${out.t}–${out.b} list ${out.top}–${out.bottom}; after: box ${back.t}–${back.b} list ${back.top}–${back.bottom}, on top ${back.onTop} (${back.hitIs}), words "${back.value}"`, `${n}-1..3`)
      const sc0 = await rested(page)
      await ur(page, 'redo', `${n}-4-just-after-redo`)
      await until(async () => /r2/.test((await spot(page, REMARKS, 0)).value))
      const sc1 = await settle(page)
      await shot(page, `${n}-5-after-redo`)
      ok(`${tag} Redo with the box in view moves nothing`, sc0 === sc1, `list ${sc0} → ${sc1}`, `${n}-4,5`)
    })
  }
}

// ---------------- R3: a re-ordered row ----------------
const HEADP = '#sbBoard [data-bfld="ap:0.0.prog"]'
const progNames = page => page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-bfld^="ap:0."][data-bfld$=".prog"]')].map(e => e.value))
if (want('r3')) for (const sk of ['pc', 'phone', 'phoneC']) if (hasSz(sk)) {
  // (a) Auto sort
  await run('R3a', sk, async (page, tag) => {
    const n = nm('r3a', sk)
    const cnt = (await progNames(page)).length
    const FOOT = `#sbBoard [data-bfld="ap:0.${cnt - 1}.prog"]`
    const first = (await spot(page, HEADP)).value
    await retime(page, '#sbBoard [data-bfld="ap:0.0.str"]', '2200')
    await page.evaluate(() => document.activeElement && document.activeElement.blur())
    await until(async () => (await spot(page, '#sbBoard [data-bfld="ap:0.0.str"]')).value === '22:00')
    await tapOrClick(page, page.locator('#sbBoard [data-sortsec="p.0"]'))
    const sorted = await until(async () => (await spot(page, HEADP)).value !== first)
    await list(page, 'foot'); await rested(page)
    const out = await spot(page, HEADP)
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await spot(page, HEADP))?.value === first)
    await settle(page)
    const back = await spot(page, HEADP)
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} Auto sort, the moved rows out of view: Undo brings a row that MOVED into view`, sorted && !out.inView && back.inView && back.onTop, `sorted ${sorted}; head before undo in view ${out.inView}; after: head "${back.value}" box ${back.t}–${back.b} list ${back.top}–${back.bottom} on top ${back.onTop}`, `${n}-1..3`)
    await list(page, 'foot'); await rested(page)
    await ur(page, 'redo', `${n}-4-just-after-redo`)
    await until(async () => (await spot(page, FOOT))?.value === first)
    await settle(page)
    const down = await spot(page, FOOT)
    await shot(page, `${n}-5-after-redo`)
    ok(`${tag} Redo likewise: the row that moved (now last of the list) comes into view`, down && down.inView && down.onTop, `foot row "${down?.value}" box ${down?.t}–${down?.b} list ${down?.top}–${down?.bottom} on top ${down?.onTop}`, `${n}-4,5`)
  })
  // (b) and (c): ONE row dragged by its grip
  await run('R3b', sk, async (page, tag) => {
    const n = nm('r3b', sk)
    const ITEMS = '#sbBoard [data-bfld^="ap:0."][data-bfld$=".prog"]'
    const row = i => `#sbBoard [data-move="mv:p.0.${i}"]`, item = i => `#sbBoard [data-bfld="ap:0.${i}.prog"]`
    const before = await progNames(page)
    const cnt = before.length
    ok(`${tag} the Common Programme is a list of distinct items`, cnt > 4 && new Set(before).size === cnt, `${cnt} rows: ${before.join(' | ').slice(0, 200)}`)
    const drag = async (fromI, toI, auto) => {
      await page.locator(row(auto ? fromI : Math.floor((fromI + toI) / 2))).evaluate(e => e.scrollIntoView({ block: 'center' })); await rested(page)
      const a = await page.locator(`${row(fromI)} .sb-grip`).boundingBox()
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await sleep(250)
      if (auto) {
        for (let k = 0; k < 60; k++) {
          const bt = await page.evaluate(sel => { const e = document.querySelector(sel); const bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(); return e.getBoundingClientRect().top - bar.bottom }, row(toI))
          if (bt > 70) break
          const bar = await page.evaluate(() => document.querySelector('#schedBoard .sb-top').getBoundingClientRect().bottom)
          await page.mouse.move(a.x + a.width / 2, bar + 14, { steps: 3 }); await sleep(200)
        }
      }
      const b = await page.locator(row(toI)).boundingBox()
      // dropping UP onto a row's top edge: the pointer at the row's very top (a drop 4px or 8px inside it did not re-order — the walk's exploration, 11 Nov)
      await page.mouse.move(b.x + b.width / 2, b.y + (toI < fromI ? 0 : 8), { steps: 12 })
      const lifted = await page.locator('#sbBoard .lift').count()
      await sleep(150); await page.mouse.up(); await sleep(600)
      return lifted
    }
    // (b) the LAST row to the head
    let dragged = null, tries = 0
    while (tries < 3) {
      tries++
      const lifted = await drag(cnt - 1, 0, sk !== 'pc')
      const now = await progNames(page)
      if (now[0] === before[cnt - 1]) { dragged = now; break }
      note(`${tag} (b) attempt ${tries} did not re-order (lifted ${lifted})`, now.join(' | ').slice(0, 200))
      await shot(page, `${n}-attempt${tries}`)
    }
    if (!dragged) { ok(`${tag} (b) the last Common Programme row dragged to the head`, null, 'NOT RUN: the drag never re-ordered in 3 attempts')}
    if (dragged) {
    await list(page, 'top'); await rested(page)
    const head0 = await spot(page, item(0))
    await shot(page, `${n}-1-before-undo`)
    const moved = before[cnt - 1]
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await progNames(page)).join('|') === before.join('|'))
    await settle(page)
    const FOOTI = item(cnt - 1)
    const back = await spot(page, FOOTI)
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} (b) Undo from the head: the list goes to the foot, where that row went back`, !!back && back.inView && back.onTop && back.value === moved, `head row before undo "${head0.value}" in view ${head0.inView}; after: foot row "${back?.value}" box ${back?.t}–${back?.b} list ${back?.top}–${back?.bottom} on top ${back?.onTop}`, `${n}-1..3`)
    await list(page, 'foot'); await rested(page)
    await ur(page, 'redo', `${n}-4-just-after-redo`)
    await until(async () => (await progNames(page)).join('|') === dragged.join('|'))
    await settle(page)
    const up = await spot(page, item(0))
    await shot(page, `${n}-5-after-redo`)
    ok(`${tag} (b) Redo at the foot: the row leaves for the head and the list follows it there`, !!up && up.inView && up.onTop && up.value === moved && up.t - up.top < 60, `head row "${up?.value}" box ${up?.t}–${up?.b} list ${up?.top}–${up?.bottom} on top ${up?.onTop}`, `${n}-4,5`)
    }
    // (c) a row moved while its old and new place are both in view: nothing moves
    if (dragged) { await ur(page, 'undo'); await until(async () => (await progNames(page)).join('|') === before.join('|')); await settle(page) }
    await list(page, 'top'); await rested(page)
    const lifted = await drag2(page, row, 0, 2)
    const moved2 = await progNames(page)
    if (moved2.join('|') === before.join('|')) { ok(`${tag} (c) a row moved with old and new place in view`, null, `NOT RUN: the short drag did not re-order (lifted ${lifted})`); return }
    await list(page, 'top'); const s0 = await rested(page)
    const oldIn = await spot(page, item(0)), newIn = await spot(page, item(2))
    await shot(page, `${n}-6-c-before-undo`)
    await ur(page, 'undo', `${n}-7-c-just-after-undo`)
    await until(async () => (await progNames(page)).join('|') === before.join('|'))
    const s1 = await settle(page)
    await ur(page, 'redo', `${n}-8-c-just-after-redo`)
    await until(async () => (await progNames(page)).join('|') === moved2.join('|'))
    const s2 = await settle(page)
    await shot(page, `${n}-9-c-after-redo`)
    ok(`${tag} (c) a row moved, old and new place both in view: Undo and Redo move nothing`, oldIn.inView && newIn.inView && s0 === s1 && s1 === s2, `places in view ${oldIn.inView}/${newIn.inView}; list ${s0} → ${s1} → ${s2}`, `${n}-6..9`)
  })
  // (d) Sort all with Ground rows in view and rows far above
  await run('R3d', sk, async (page, tag) => {
    const n = nm('r3d', sk)
    const GROUND = '#sbBoard .sb-panel.grnd .sb-arow'
    const prog = () => progNames(page)
    const ground = () => page.evaluate(sel => [...document.querySelectorAll(sel)].map(r => r.querySelector('[data-bfld$=".prog"]')?.value || ''), GROUND)
    const groundBox = async item => `#sbBoard [data-bfld="${await page.evaluate(([sel, item]) => { const b = [...document.querySelectorAll(`${sel} [data-bfld$=".prog"]`)].find(e => e.value === item); return b ? b.getAttribute('data-bfld') : 'none' }, [GROUND, item])}"]`
    await retime(page, '#sbBoard [data-bfld="ap:0.0.str"]', '2200')
    await page.evaluate(() => document.activeElement && document.activeElement.blur())
    await until(async () => (await spot(page, '#sbBoard [data-bfld="ap:0.0.str"]')).value === '22:00')
    const g0 = await ground()
    if (g0.length < 3 || new Set(g0).size !== g0.length) { ok(`${tag} Ground Programme is a list of distinct rows`, false, g0.join(' | ')); return }
    const grips = page.locator(`${GROUND} .sb-grip:visible`)
    await grips.first().scrollIntoViewIfNeeded(); await rested(page)
    let ordered = false
    for (let t = 1; t <= 3 && !ordered; t++) {
      const a = await grips.first().boundingBox(), b = await page.locator(GROUND).nth(2).boundingBox()
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await sleep(250)
      await page.mouse.move(b.x + b.width / 2, b.y + 8, { steps: 12 }); await sleep(150); await page.mouse.up(); await sleep(600)
      ordered = JSON.stringify(await ground()) !== JSON.stringify(g0)
      if (!ordered) { note(`${tag} ground drag attempt ${t} did not re-order`, ''); await grips.first().scrollIntoViewIfNeeded(); await rested(page) }
    }
    if (!ordered) { ok(`${tag} (d) a Ground row carried down by its grip`, null, 'NOT RUN: the drag never re-ordered in 3 attempts'); return }
    const mixed = { prog: await prog(), ground: await ground() }
    if (sk === 'pc') await page.locator('#sbSortAll').click()
    else { await page.locator('#sbMore').tap(); await page.locator('#sbMoreSort').tap() }
    await page.locator('#sortAllConfirm').first().click(); await sleep(700)
    await until(async () => JSON.stringify(await prog()) !== JSON.stringify(mixed.prog))
    const sorted = { prog: await prog(), ground: await ground() }
    const mover = sorted.ground.find((x, i) => mixed.ground[i] !== x)
    if (!mover) { ok(`${tag} (d) Sort all re-sorted a Ground row`, null, 'NOT RUN: Sort all moved no Ground row'); return }
    await nearTop(page, await groundBox(mover)); const at = await rested(page)
    const gIn = await spot(page, await groundBox(mover)), pOut = await spot(page, '#sbBoard [data-bfld="ap:0.0.prog"]')
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => JSON.stringify(await prog()) === JSON.stringify(mixed.prog))
    const s1 = await settle(page)
    await shot(page, `${n}-3-after-undo`)
    const gIn2 = await spot(page, await groundBox(mover))
    await ur(page, 'redo', `${n}-4-just-after-redo`)
    await until(async () => JSON.stringify(await prog()) === JSON.stringify(sorted.prog))
    const s2 = await settle(page)
    await shot(page, `${n}-5-after-redo`)
    ok(`${tag} (d) Sort all, Ground rows in view and rows far above: Undo and Redo move nothing`, gIn.inView && !pOut.inView && s1 === at && s2 === at && gIn2.inView, `Ground row in view ${gIn.inView}, Common head in view ${pOut.inView}; list ${at} → ${s1} → ${s2}`, `${n}-1..5`)
  })
}
async function drag2(page, row, fromI, toI) {
  const a = await page.locator(`${row(fromI)} .sb-grip`).boundingBox(), b = await page.locator(row(toI)).boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await sleep(250)
  await page.mouse.move(b.x + b.width / 2, b.y + 8, { steps: 12 })
  const lifted = await page.locator('#sbBoard .lift').count()
  await sleep(150); await page.mouse.up(); await sleep(600)
  return lifted
}

// ---------------- R4: Personal Inputs folded ----------------
if (want('r4')) for (const sk of ['pc', 'phone']) if (hasSz(sk)) await run('R4', sk, async (page, tag) => {
  const n = nm('r4', sk)
  await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(PI_HEAD)); await sleep(500)
  const iid = await inputOf(page, 'Meeting')
  if (!iid) { ok(`${tag} a Meeting under Personal Inputs`, null, 'NOT RUN: none drawn'); return }
  const LINE = `#sbBoard [data-inprow="${iid}"]`, RMK = `#sbBoard [data-ifld="${iid}.rmks"]`
  await page.locator(`${LINE} [data-acc="x"]`).click(); await sleep(600)
  await page.locator(RMK).click(); await page.keyboard.press('End'); await page.keyboard.type(' r4')
  await page.locator('#sbBoard .sb-panel.pinp .sb-pinote').click(); await sleep(600)
  const kept = /r4/.test((await spot(page, RMK))?.value || '')
  await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(PI_HEAD)); await sleep(500)
  const folded = (await page.locator(PI_ROWS).count()) === 0
  await list(page, 'top'); await rested(page)
  const head = await spot(page, PI_HEAD)
  await shot(page, `${n}-1-before-undo-folded`)
  await ur(page, 'undo', `${n}-2-just-after-undo`)
  await until(async () => (await page.locator(PI_ROWS).count()) > 0 && !/r4/.test((await spot(page, RMK))?.value || 'r4'))
  await settle(page)
  const line = await spot(page, LINE)
  await shot(page, `${n}-3-after-undo`)
  ok(`${tag} Undo of an input's remark with Personal Inputs folded and out of view: the panel opens and the line is in view`, kept && folded && head && !head.inView && !!line && line.inView && line.onTop, `kept ${kept}, folded ${folded}, panel head in view before ${head?.inView}; after: line box ${line?.t}–${line?.b} list ${line?.top}–${line?.bottom} on top ${line?.onTop}`, `${n}-1..3`)
  await list(page, 'top'); await rested(page)
  await ur(page, 'redo', `${n}-4-just-after-redo`)
  await until(async () => /r4/.test((await spot(page, RMK))?.value || ''))
  await settle(page)
  const line2 = await spot(page, LINE)
  await shot(page, `${n}-5-after-redo`)
  ok(`${tag} Redo likewise: the input's line is in view`, !!line2 && line2.inView && line2.onTop, `line box ${line2?.t}–${line2?.b} list ${line2?.top}–${line2?.bottom} on top ${line2?.onTop}`, `${n}-4,5`)
  // a change to something ELSE with the panel folded: it stays folded
  await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(PI_HEAD)); await sleep(500)
  const f2 = (await page.locator(PI_ROWS).count()) === 0
  await list(page, 'top'); await rested(page)
  await retype(page, REMARKS, 0, ' r4b')
  await ur(page, 'undo', `${n}-6-else-just-after-undo`)
  await until(async () => !/r4b/.test((await spot(page, REMARKS, 0)).value))
  await settle(page)
  const stillFolded = (await page.locator(PI_ROWS).count()) === 0
  await shot(page, `${n}-7-else-after-undo`)
  ok(`${tag} with the panel folded, Undo of a remark elsewhere leaves it folded`, f2 && stillFolded, `folded before ${f2}, after ${stillFolded}`, `${n}-6,7`)
})

// ---------------- R5: a sign-off and a hidden warning ----------------
const BAR = '#sbWarn .wh', XB = '#sbWarn .wln-mute'
async function openWarn(page) { if (!(await page.locator(`${XB}:visible`).count())) { await tapOrClick(page, page.locator(BAR)); await sleep(500) } }
if (want('r5') && hasSz('phone')) {
  await run('R5a', 'phone', async (page, tag) => {
    const n = nm('r5a', 'phone')
    const PICK = '#sbSign select[data-sign="cur"]', LINE = '#sbSignBar'
    const opt = await page.locator(PICK).evaluate(e => [...e.options].map(o => o.value).find(v => v && v !== '—'))
    await page.locator(PICK).selectOption(opt)
    await until(async () => (await page.locator(PICK).inputValue()) === opt)
    await list(page, 'foot'); await rested(page)
    const out = await spot(page, LINE)
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await page.locator(PICK).inputValue()) === '')
    await settle(page)
    const back = await spot(page, LINE)
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} a sign-off picked, the board at its foot: Undo brings the sign-off line into view`, !out.inView && back.inView && back.onTop, `before: line ${out.t}–${out.b} in view ${out.inView}; after: ${back.t}–${back.b} list ${back.top}–${back.bottom} on top ${back.onTop}`, `${n}-1..3`)
  })
  await run('R5b', 'phone', async (page, tag) => {
    const n = nm('r5b', 'phone')
    await openWarn(page)
    const was = (await spot(page, BAR)).value
    const ix = await page.locator(`${XB}:visible`).first().evaluate(b => b.closest('.wln').getAttribute('data-wix'))
    const LINE = `#sbWarn .wln[data-wix="${ix}"]`
    await tapOrClick(page, page.locator(`${XB}:visible`).first())
    await until(async () => (await spot(page, BAR)).value !== was)
    await list(page, 'foot'); await rested(page)
    const out = await spot(page, LINE)
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await spot(page, BAR))?.value === was)
    await settle(page)
    const back = await spot(page, LINE)
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} a warning hidden, the board at its foot: Undo brings that warning's own line into view`, !!out && !out.inView && !!back && back.inView && back.onTop, `before: line ${out?.t}–${out?.b} in view ${out?.inView}; after: ${back?.t}–${back?.b} list ${back?.top}–${back?.bottom} on top ${back?.onTop}`, `${n}-1..3`)
  })
}
if (want('r5') && hasSz('pc')) {
  await run('R5c', 'pc', async (page, tag) => {
    const n = nm('r5c', 'pc')
    await openWarn(page)
    const own = () => page.evaluate(() => Math.round(document.querySelector('#sbWarn').scrollTop))
    const head = async () => { await page.evaluate(() => { document.querySelector('#sbWarn').scrollTop = 0 }); await list(page, 'top'); await rested(page) }
    const ix = await page.locator(`${XB}:visible`).last().evaluate(b => b.closest('.wln').getAttribute('data-wix'))
    const LINE = `#sbWarn .wln[data-wix="${ix}"]`
    await head()
    const pre = await spot(page, LINE)
    const was = (await spot(page, BAR)).value
    await page.locator(`${XB}:visible`).last().click()
    await until(async () => (await spot(page, BAR)).value !== was)
    await head()
    const barIn = await spot(page, BAR)
    const l0 = await rested(page), o0 = await own()
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await spot(page, BAR))?.value === was)
    await sleep(500); const l1 = await rested(page)
    const back = await spot(page, LINE), o1 = await own()
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} a warning low in the issues list hidden, the list back at its top: Undo brings that line into view, the board's list does not move`, !!pre && !pre.inView && barIn.inView && !!back && back.inView && back.onTop && l0 === l1, `line before ${pre?.inView ? 'in' : 'out of'} view; after: ${back?.t}–${back?.b} in issues list ${back?.top}–${back?.bottom} on top ${back?.onTop}; issues list scroll ${o0} → ${o1}; board list ${l0} → ${l1}`, `${n}-1..3`)
  })
  await run('R5d', 'pc', async (page, tag) => {
    const n = nm('r5d', 'pc')
    await openWarn(page)
    const own = () => page.evaluate(() => Math.round(document.querySelector('#sbWarn').scrollTop))
    const was = (await spot(page, BAR)).value
    const ix = await page.locator(`${XB}:visible`).first().evaluate(b => b.closest('.wln').getAttribute('data-wix'))
    const LINE = `#sbWarn .wln[data-wix="${ix}"]`
    await page.locator(`${XB}:visible`).first().click()
    await until(async () => (await spot(page, BAR)).value !== was)
    await page.evaluate(() => { document.querySelector('#sbWarn').scrollTop = 0 }); await list(page, 'foot'); const l0 = await rested(page)
    const o0 = await own(), pre = await spot(page, LINE)
    await shot(page, `${n}-1-before-undo`)
    await ur(page, 'undo', `${n}-2-just-after-undo`)
    await until(async () => (await spot(page, BAR))?.value === was)
    await sleep(500); const l1 = await rested(page), o1 = await own()
    const back = await spot(page, LINE)
    await shot(page, `${n}-3-after-undo`)
    ok(`${tag} the warning's line in view: Undo moves nothing`, !!pre && pre.inView && !!back && back.inView && l0 === l1 && o0 === o1, `line in view before ${pre?.inView}, after ${back?.inView}; board list ${l0} → ${l1}; issues list ${o0} → ${o1}`, `${n}-1..3`)
  })
}

// ---------------- R6: a SANS availability card ----------------
if (want('r6')) for (const sk of ['pc', 'phone']) if (hasSz(sk)) await run('R6', sk, async (page, tag) => {
  const n = nm('r6', sk)
  const CARD = '#sbBoard .sb-panel.sansav .sanscard'
  const remark = () => page.evaluate(() => String((window.INPUTS || []).find(x => x.type === 'SANS Availability' && x.date === 'Jul 13')?.remarks || ''))
  await page.locator(CARD).first().scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(CARD).first())
  await page.waitForSelector('#inpEditPop:not([hidden]) .airpop-box')
  await page.locator('#inpEditRmk').fill('r6 card'); await tapOrClick(page, page.locator('#inpEditSave')); await sleep(700)
  const r0 = await remark()
  await list(page, 'top'); await rested(page)
  const out = await spot(page, CARD)
  await shot(page, `${n}-1-before-undo`)
  await ur(page, 'undo', `${n}-2-just-after-undo`)
  await until(async () => (await remark()) !== 'r6 card')
  await settle(page)
  const back = await spot(page, CARD)
  await shot(page, `${n}-3-after-undo`)
  ok(`${tag} a SANS card's remark changed and saved, scrolled away: Undo brings the card into view`, r0 === 'r6 card' && !out.inView && back.inView && back.onTop, `changed "${r0}"; before: card ${out.t}–${out.b} in view ${out.inView}; after: ${back.t}–${back.b} list ${back.top}–${back.bottom} on top ${back.onTop}`, `${n}-1..3`)
  await nearTop(page, CARD); const room = await rested(page)
  const inV = await spot(page, CARD)
  await ur(page, 'redo', `${n}-4-just-after-redo`)
  await until(async () => (await remark()) === 'r6 card')
  const s1 = await settle(page)
  await shot(page, `${n}-5-after-redo`)
  const c1 = await spot(page, CARD)
  ok(`${tag} with the card in view, Redo moves nothing`, inV.inView && s1 === room && c1.inView, `card in view before ${inV.inView}, after ${c1.inView}; list ${room} → ${s1}`, `${n}-4,5`)
  await ur(page, 'undo', `${n}-6-in-view-just-after-undo`)
  await until(async () => (await remark()) !== 'r6 card')
  const s2 = await settle(page)
  await shot(page, `${n}-7-in-view-after-undo`)
  ok(`${tag} with the card in view, Undo moves nothing`, s2 === room, `list ${room} → ${s2}`, `${n}-6,7`)
})

// ---------------- R7: an accepted input on a programme row ----------------
if (want('r7')) for (const sk of ['pc', 'phone']) if (hasSz(sk)) await run('R7', sk, async (page, tag) => {
  const n = nm('r7', sk)
  const row = await groundRow(page, 'MEETING')
  if (!row) { ok(`${tag} an accepted Meeting on the Ground Programme`, null, 'NOT RUN: none drawn'); return }
  const END = `#sbBoard [data-bfld="${row}.end"]`
  await nearTop(page, END); await rested(page)
  const piOpen = (await page.locator(PI_ROWS).count()) > 0
  await retime(page, END, '1730')
  const endOf = async () => `#sbBoard [data-bfld="${await groundRow(page, 'MEETING')}.end"]`
  await until(async () => (await spot(page, await endOf()))?.value === '17:30')
  const at = await rested(page)
  const box = await spot(page, await endOf()), pi = await spot(page, PI_HEAD)
  await shot(page, `${n}-1-before-undo`)
  await ur(page, 'undo', `${n}-2-just-after-undo`)
  await until(async () => (await spot(page, await endOf()))?.value === '17:00')
  const s1 = await settle(page)
  await shot(page, `${n}-3-after-undo`)
  ok(`${tag} an accepted input's time retyped on its Ground row (in view; Personal Inputs ${pi && pi.inView ? 'IN view at this size' : 'out of view'}, panel ${piOpen ? 'open' : 'folded'}): Undo moves nothing`, box.inView && s1 === at && (await page.locator(PI_ROWS).count() > 0) === piOpen, `time box in view ${box.inView}; Personal Inputs head in view ${pi?.inView}; list ${at} → ${s1}`, `${n}-1..3`)
  await ur(page, 'redo', `${n}-4-just-after-redo`)
  await until(async () => (await spot(page, await endOf()))?.value === '17:30')
  const s2 = await settle(page)
  await shot(page, `${n}-5-after-redo`)
  ok(`${tag} Redo likewise moves nothing`, s2 === at, `list ${at} → ${s2}`, `${n}-4,5`)
})

// ---------------- R8: with the changes window open ----------------
if (want('r8')) for (const sk of ['phone', 'pc']) if (hasSz(sk)) for (const [which, idx, startTo] of [['below', -1, 'top'], ['above', 0, 'foot']]) await run(`R8 ${which}`, sk, async (page, tag) => {
  const n = nm('r8' + which, sk)
  const was = (await spot(page, REMARKS, idx)).value
  await retype(page, REMARKS, idx, ' r8')
  await list(page, startTo); await rested(page)
  await tapOrClick(page, page.locator('#sbHist:visible').first()); await sleep(900)
  const win = await page.evaluate(() => { const w = [...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().width > 0 && !e.classList.contains('bar')); if (!w) return null; const r = w.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } })
  const out = await spot(page, REMARKS, idx)
  await shot(page, `${n}-1-window-open`)
  await ur(page, 'undo', `${n}-2-just-after-undo`)
  await until(async () => (await spot(page, REMARKS, idx))?.value === was)
  await settle(page)
  const back = await spot(page, REMARKS, idx)
  await shot(page, `${n}-3-after-undo`)
  const winStill = await page.evaluate(() => [...document.querySelectorAll('.chgwin')].some(e => e.getBoundingClientRect().width > 0))
  ok(`${tag} changes window open, the change ${which} the screen: Undo brings the box into view clear of the window`, !!win && !out.inView && back.inView && back.onTop && winStill, `window ${win ? `${win.t}–${win.b} × ${win.l}–${win.r}` : 'none'}; box before ${out.t}–${out.b}; after ${back.t}–${back.b} (list ${back.top}–${back.bottom}), on top ${back.onTop} (${back.hitIs}); window still open ${winStill}`, `${n}-1..3`)
})

// ---------------- R9: the plain-user check ----------------
// three ordinary changes on ONE flying line, all in view together: one of its seats, its remark, one of its times
if (want('r9')) for (const sk of ['pc', 'phone']) if (hasSz(sk)) await run('R9', sk, async (page, tag) => {
  const n = nm('r9', sk)
  const sel = await page.evaluate(() => {
    const line = document.querySelector('#sbBoard .sb-line'); if (!line) return null
    const by = e => { for (const a of ['data-bfld', 'data-txt', 'data-slot']) if (e.getAttribute(a)) return `[${a}="${e.getAttribute(a)}"]`; return null }
    const rm = line.querySelector('.nts')
    const tm = [...line.querySelectorAll('[data-bfld]')].find(e => /^\d\d:\d\d$/.test(e.value || '') && e.getBoundingClientRect().width > 0)
    const seat = [...line.querySelectorAll('[data-slot]')].find(e => /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(e.getAttribute('data-slot')) && e.querySelector('.puck'))
    return { rm: rm && by(rm), tm: tm && by(tm), seat: seat && by(seat) }
  })
  note(`${tag} the line's boxes`, JSON.stringify(sel))
  if (!sel || !sel.rm || !sel.tm) { ok(`${tag} a flying line with a remark and a time`, null, 'NOT RUN: ' + JSON.stringify(sel)); return }
  await nearTop(page, '#sbBoard ' + sel.rm); await rested(page)
  const seatOf = () => page.evaluate(s => document.querySelector('#sbBoard ' + s + ' .puck')?.getAttribute('data-person') || null, sel.seat)
  const val = s => page.evaluate(s => [...document.querySelectorAll('#sbBoard ' + s)].find(e => e.getBoundingClientRect().width > 0)?.value ?? null, s)
  const changes = []
  // 1) a seat: a free roster man dragged onto the line's first seat (three tries)
  let seatDone = false
  const prior = sel.seat ? await seatOf() : null
  for (let t = 0; t < 3 && sel.seat && !seatDone; t++) {
    const pucks = page.locator('#sbRoster .rpuck:not(.no) .puck:visible')
    const man = await pucks.evaluateAll(es => es.map(e => e.getAttribute('data-person') || ''))
    const i = man.findIndex((m, k) => k >= t && m && !/^all/i.test(m) && m !== 'null')
    if (i < 0) break
    const a = await pucks.nth(i).boundingBox(), b = await page.locator('#sbBoard ' + sel.seat).filter({ visible: true }).first().boundingBox()
    if (!a || !b) { note(`${tag} seat drag attempt ${t + 1}`, 'a box is not drawn'); continue }
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await sleep(250)
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 14 }); await page.mouse.up(); await sleep(800)
    if ((await seatOf()) !== prior) seatDone = true
    else { note(`${tag} seat drag attempt ${t + 1}`, `seat still "${prior}"`); await shot(page, `${n}-seat-attempt${t + 1}`) }
  }
  // a phone's own route: tap the seat to arm it, then tap a free man in the crew list (one more gesture, tried once)
  if (!seatDone && sel.seat && sk !== 'pc') {
    try {
      await tapOrClick(page, page.locator('#sbBoard ' + sel.seat).filter({ visible: true }).first()); await sleep(600)
      const pk = page.locator('#sbRoster .rpuck:not(.no) .puck:visible'), man = await pk.evaluateAll(es => es.map(e => e.getAttribute('data-person') || ''))
      const i = man.findIndex(m => m && !/^all/i.test(m))
      if (i >= 0) { await pk.nth(i).scrollIntoViewIfNeeded(); await shot(page, `${n}-seat-armed`); await tapOrClick(page, pk.nth(i)); await sleep(900) }
      seatDone = (await seatOf()) !== prior
      note(`${tag} seat by tap (arm the seat, tap a man)`, `seat "${prior}" → "${await seatOf()}"`)
    } catch (e) { note(`${tag} seat by tap`, 'failed: ' + String(e.message).split('\n')[0]) }
  }
  if (seatDone) changes.push({ what: 'seat', read: seatOf, v0: prior, v1: await seatOf() })
  else ok(`${tag} a seat change (a roster man dragged onto the line's first seat)`, null, 'NOT RUN: the seat never changed in 3 attempts; a second time change stands in as the third change')
  await nearTop(page, '#sbBoard ' + sel.rm); await rested(page)
  // 2) the line's remark
  const r0 = await val(sel.rm)
  await retype(page, '#sbBoard ' + sel.rm, 0, ' r9')
  changes.push({ what: 'remark', read: () => val(sel.rm), v0: r0, v1: await val(sel.rm) })
  // 3) the line's time
  const t0 = await val(sel.tm)
  await retime(page, '#sbBoard ' + sel.tm, '0845'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(300)
  changes.push({ what: 'time', read: () => val(sel.tm), v0: t0, v1: await val(sel.tm) })
  if (!seatDone) {
    const sel2 = await page.evaluate(({ rm }) => { const line = document.querySelector('#sbBoard ' + rm).closest('.sb-line'); const e = [...line.querySelectorAll('[data-bfld]')].filter(e => /^\d\d:\d\d$/.test(e.value || '') && e.getBoundingClientRect().width > 0)[1]; return e ? `[data-bfld="${e.getAttribute('data-bfld')}"]` : null }, sel)
    if (sel2) { const u0 = await val(sel2); await retime(page, '#sbBoard ' + sel2, '0900'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(300); changes.push({ what: 'time2', read: () => val(sel2), v0: u0, v1: await val(sel2) }) }
  }
  const base = await rested(page)
  const inV = await spot(page, '#sbBoard ' + sel.rm), tIn = await spot(page, '#sbBoard ' + sel.tm)
  note(`${tag} the changes made`, changes.map(c => `${c.what}: "${c.v0}" → "${c.v1}"`).join(' ; ') + `; remark in view ${inV?.inView}, time in view ${tIn?.inView}; list ${base}`)
  await shot(page, `${n}-1-changes-made`)
  let k = 1; const moved = [], stepsIn = []
  for (let i = changes.length - 1; i >= 0; i--) {
    await ur(page, 'undo', `${n}-${++k}-undo-${changes[i].what}`)
    await until(async () => String(await changes[i].read()) === String(changes[i].v0))
    moved.push(await settle(page))
  }
  const undone = []; for (const c of changes) undone.push(String(await c.read()) === String(c.v0))
  await shot(page, `${n}-${++k}-all-undone`)
  for (let i = 0; i < changes.length; i++) {
    await ur(page, 'redo', `${n}-${++k}-redo-${changes[i].what}`)
    await until(async () => String(await changes[i].read()) === String(changes[i].v1))
    moved.push(await settle(page))
  }
  await shot(page, `${n}-${++k}-all-redone`)
  const redone = []; for (const c of changes) redone.push(String(await c.read()) === String(c.v1))
  ok(`${tag} three changes (all in view), Undo all, Redo all: the screen never moves`, !!inV?.inView && !!tIn?.inView && moved.every(m => m === base) && undone.every(Boolean) && redone.every(Boolean), `list at ${base}; after each step ${moved.join(', ')}; every Undo took its change back: ${undone.join('/')}; every Redo restored it: ${redone.join('/')}`, `${n}-1..${k}`)
})

// ---------------- W1 (after the fix): the changed box rests clear of the passing "Undid: ..." note ----------------
const toastNow = page => page.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = t.getBoundingClientRect()
  return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), op: t.style.opacity, cs: getComputedStyle(t).opacity, showing: t.style.opacity !== '0' && getComputedStyle(t).opacity !== '0' && r.height > 0, text: (t.textContent || '').slice(0, 40) }
})
const apart = (b, t) => !!b && !!t && (b.b <= t.t + 0.5 || b.t >= t.b - 0.5 || b.r <= t.l + 0.5 || b.l >= t.r - 0.5)
const rs = x => x ? `${x.l}–${x.r} × ${x.t}–${x.b}` : 'none'
// press Undo/Redo, picture at once, wait for the scroll to stop (two readings 200 ms apart), read the rects, THEN the settled picture
async function pressAndRead(page, kind, name, sel, idx = 0) {
  await ur(page, kind, `${name}-1-just-after-${kind}`)
  await sleep(250)
  let a = -1, b = await list(page); const t0 = Date.now()
  while (a !== b && Date.now() - t0 < 5000) { await sleep(200); a = b; b = await list(page) }
  const box = await spot(page, sel, idx), note = await toastNow(page)
  await shot(page, `${name}-2-settled-${kind}`)
  return { box, note, scroll: b }
}
const clear = r => !!r.box && !!r.note && r.note.showing && apart(r.box, r.note) && r.box.inView && r.box.onTop
const say = r => `box ${rs(r.box)} (list ${r.box?.top}–${r.box?.bottom}, in view ${r.box?.inView}, on top ${r.box?.onTop}); note ${rs(r.note)} showing ${r.note?.showing} "${r.note?.text}"`
const nearFoot = (page, sel) => page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().height > 0)
  let s = el.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll|overlay/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const v = s.getBoundingClientRect()
  s.scrollTop += el.getBoundingClientRect().bottom - (Math.min(v.bottom, innerHeight) - 30)
}, sel)

if (want('w1')) {
  // W1a — R4 on the phone
  await run('W1a', 'phone', async (page, tag) => {
    const n = 'w1-a-phone'
    await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(PI_HEAD)); await sleep(500)
    const iid = await inputOf(page, 'Meeting')
    if (!iid) { ok(`${tag} a Meeting under Personal Inputs`, null, 'NOT RUN: none drawn'); return }
    const LINE = `#sbBoard [data-inprow="${iid}"]`, RMK = `#sbBoard [data-ifld="${iid}.rmks"]`
    await page.locator(`${LINE} [data-acc="x"]`).click(); await sleep(600)
    await page.locator(RMK).click(); await page.keyboard.press('End'); await page.keyboard.type(' w1a')
    await page.locator('#sbBoard .sb-panel.pinp .sb-pinote').click(); await sleep(600)
    await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(PI_HEAD)); await sleep(500)
    await list(page, 'top'); await rested(page)
    const u = await pressAndRead(page, 'undo', n, LINE)
    ok(`${tag} Undo with Personal Inputs folded, far away: the input's line rests clear of the note`, clear(u), say(u), `${n}-1,2`)
    await list(page, 'top'); await rested(page); await sleep(2600)
    const r = await pressAndRead(page, 'redo', n + 'r', LINE)
    ok(`${tag} Redo likewise: the line rests clear of the note`, clear(r), say(r), `${n}r-1,2`)
  })
  // W1b — R5b on the phone, both ways
  await run('W1b', 'phone', async (page, tag) => {
    const n = 'w1-b-phone'
    await openWarn(page)
    const was = (await spot(page, BAR)).value
    const ix = await page.locator(`${XB}:visible`).first().evaluate(b => b.closest('.wln').getAttribute('data-wix'))
    const LINE = `#sbWarn .wln[data-wix="${ix}"]`
    await tapOrClick(page, page.locator(`${XB}:visible`).first())
    await until(async () => (await spot(page, BAR)).value !== was)
    await list(page, 'foot'); await rested(page)
    const u = await pressAndRead(page, 'undo', n + 'i', LINE)
    ok(`${tag} a warning hidden, scrolled to the foot: Undo brings its line down from above, clear of the note`, clear(u), say(u), `${n}i-1,2`)
    await sleep(2600)
    // the reverse: the LAST warning of the long list hidden, the board at its top, its line below the screen
    const ix2 = await page.locator(`${XB}:visible`).last().evaluate(b => b.closest('.wln').getAttribute('data-wix'))
    const LINE2 = `#sbWarn .wln[data-wix="${ix2}"]`
    const was2 = (await spot(page, BAR)).value
    await page.locator(`${XB}:visible`).last().scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(`${XB}:visible`).last())
    await until(async () => (await spot(page, BAR)).value !== was2)
    await list(page, 'top'); await rested(page)
    const pre = await spot(page, LINE2)
    const d = await pressAndRead(page, 'undo', n + 'ii', LINE2)
    ok(`${tag} a warning low in the list hidden, its line BELOW the screen (was ${pre?.inView ? 'IN' : 'out of'} view): Undo brings it up, clear of the note`, !!pre && !pre.inView && clear(d), say(d), `${n}ii-1,2`)
  })
  // W1c — R6 on the phone: the card BELOW the screen
  await run('W1c', 'phone', async (page, tag) => {
    const n = 'w1-c-phone'
    const CARD = '#sbBoard .sb-panel.sansav .sanscard'
    const remark = () => page.evaluate(() => String((window.INPUTS || []).find(x => x.type === 'SANS Availability' && x.date === 'Jul 13')?.remarks || ''))
    await page.locator(CARD).first().scrollIntoViewIfNeeded(); await tapOrClick(page, page.locator(CARD).first())
    await page.waitForSelector('#inpEditPop:not([hidden]) .airpop-box')
    await page.locator('#inpEditRmk').fill('w1c card'); await tapOrClick(page, page.locator('#inpEditSave')); await sleep(700)
    await list(page, 'top'); await rested(page)
    const pre = await spot(page, CARD)
    const u = await pressAndRead(page, 'undo', n, CARD)
    ok(`${tag} a SANS card changed, the card BELOW the screen (was ${pre?.inView ? 'IN' : 'out of'} view): Undo brings it up, clear of the note`, !!pre && !pre.inView && (await remark()) !== 'w1c card' && clear(u), say(u), `${n}-1,2`)
  })
  // W1d — R3b on the pc, and one plain case
  await run('W1d', 'pc', async (page, tag) => {
    const n = 'w1-d-pc'
    const row = i => `#sbBoard [data-move="mv:p.0.${i}"]`, item = i => `#sbBoard [data-bfld="ap:0.${i}.prog"]`
    const before = await progNames(page), cnt = before.length
    let dragged = null
    for (let t = 1; t <= 3 && !dragged; t++) {
      await page.locator(row(Math.floor((cnt - 1) / 2))).evaluate(e => e.scrollIntoView({ block: 'center' })); await rested(page)
      const a = await page.locator(`${row(cnt - 1)} .sb-grip`).boundingBox()
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down(); await sleep(250)
      const b = await page.locator(row(0)).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y, { steps: 12 }); await sleep(150); await page.mouse.up(); await sleep(600)
      const now = await progNames(page); if (now[0] === before[cnt - 1]) dragged = now
    }
    if (!dragged) { ok(`${tag} one row dragged to the head`, null, 'NOT RUN: the drag never re-ordered in 3 attempts'); return }
    await list(page, 'top'); await rested(page)
    const u = await pressAndRead(page, 'undo', n + 'a', item(cnt - 1))
    ok(`${tag} one row dragged to the head, scroll at the head: Undo brings the row up from below, clear of the note`, clear(u), say(u), `${n}a-1,2`)
    await sleep(2600)
    // plain case: the last flying line's remark near the foot of the day retyped, scrolled to the top, Undo
    await retype(page, REMARKS, -1, ' w1d')
    await list(page, 'top'); await rested(page)
    const pre = await spot(page, REMARKS, -1)
    const p = await pressAndRead(page, 'undo', n + 'b', REMARKS, -1)
    ok(`${tag} a remark near the foot retyped, scroll to the top (box ${pre?.inView ? 'IN' : 'out of'} view), Undo: the box rests clear of the note`, !!pre && !pre.inView && clear(p), say(p), `${n}b-1,2`)
  })
  // W1e — a box in view near the foot, changed and undone without scrolling: nothing moves
  for (const sk of ['phone', 'pc']) await run('W1e', sk, async (page, tag) => {
    const n = 'w1-e-' + sk
    await retype(page, REMARKS, 0, ' w1e')
    await nearFoot(page, REMARKS); const s0 = await rested(page)
    const pre = await spot(page, REMARKS, 0)
    await shot(page, `${n}-0-before`)
    const u = await pressAndRead(page, 'undo', n + 'u', REMARKS)
    await sleep(2600)
    const r = await pressAndRead(page, 'redo', n + 'r', REMARKS)
    const cov = x => x.note && x.note.showing && !apart(x.box, x.note)
    ok(`${tag} a box in view near the foot: Undo and Redo move nothing (list ${s0} → ${u.scroll} → ${r.scroll})`, !!pre && pre.inView && u.scroll === s0 && r.scroll === s0, `Undo: ${say(u)}; note covers box ${cov(u)}. Redo: ${say(r)}; note covers box ${cov(r)}`, `${n}u-1,2 ${n}r-1,2`)
  })
  // W1f — OBSERVATION: the very last box of the last section, scroll to the top, Undo
  for (const sk of ['phone', 'pc']) await run('W1f', sk, async (page, tag) => {
    const n = 'w1-f-' + sk
    const SELS = '#sbBoard input[type=text], #sbBoard input:not([type]), #sbBoard textarea'
    const last = await page.evaluate(sels => {
      const all = [...document.querySelectorAll(sels)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
      const e = all[all.length - 1]; if (!e) return null
      return { k: all.length - 1, n: all.length, cls: (e.className + '').slice(0, 40), attrs: [...e.attributes].map(a => a.name + '=' + a.value).filter(s => /^data-/.test(s)).join(' ').slice(0, 100), value: e.value, sec: (e.closest('.sb-panel')?.className || '').slice(0, 40) }
    }, SELS)
    note(`${tag} the very last box the board draws`, JSON.stringify(last))
    if (!last) { ok(`${tag} a last box`, null, 'NOT RUN: none found'); return }
    const el = page.locator(SELS).filter({ visible: true }).nth(last.k)
    await el.scrollIntoViewIfNeeded()
    if (/^\d\d:\d\d$/.test(last.value)) { await el.click(); await page.keyboard.type('1100'); await page.keyboard.press('Enter') }
    else { await el.click(); await page.keyboard.press('End'); await page.keyboard.type(' w1f'); await page.keyboard.press('Enter') }
    await sleep(700)
    const after = await page.locator(SELS).filter({ visible: true }).nth(last.k).inputValue()
    await list(page, 'top'); await rested(page)
    const read = () => page.evaluate(([sels, k]) => { const all = [...document.querySelectorAll(sels)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); const e = all[k]; if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), value: e.value } }, [SELS, last.k])
    await ur(page, 'undo', `${n}-1-just-after-undo`)
    await sleep(250)
    let a = -1, b = await list(page); const t0 = Date.now()
    while (a !== b && Date.now() - t0 < 5000) { await sleep(200); a = b; b = await list(page) }
    const box = await read(), nt = await toastNow(page)
    await shot(page, `${n}-2-settled-undo`)
    const covered = nt && nt.showing && box && !apart(box, nt)
    const said = `changed "${last.value}" → "${after}", Undo put "${box?.value}" back; box ${rs(box)}; note ${rs(nt)} showing ${nt?.showing}; list scroll ${b}`
    note(`${tag} OBSERVED (W1f): the last box of the last section, Undo from the top: ${covered ? 'COVERED by the note' : 'CLEAR of the note'}`, said, `${n}-1,2`)
  })
}

note('errors across the whole walk', ALLERR.length ? ALLERR.join(' | ').slice(0, 900) : 'none')
finish(process.env.ONLY || process.env.SIZES ? 'rewalk-partial.json' : 'rewalk.json')
process.exit(0)
