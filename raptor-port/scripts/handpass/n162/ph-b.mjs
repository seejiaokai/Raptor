// ph-b - subject B: an Input window held in the member view. Saber picks 149 (a squadron he works by the master mark),
// opens an input on 149's Inputs page, types in its Remarks, and with the window open goes for the switch to the member
// view by the control's real position (a finger on touch sizes, the mouse on a desktop). Where the held state is reached,
// every way back is tried, each from a fresh browser.
//   node raptor-port/scripts/handpass/n162/ph-b.mjs <d|402x874|874x402|768x1024|1024x768> [ONLY=reach|ways]
// Pictures: ph-b-<size>-*.png
import { mk, signIn, go, pickSq, closeAll, note, FACT, die, press, pic, picMarked, covered, boxOf, shut } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const ONLY = process.env.ONLY || ''
const WORDS = 'PH typed words'
const P = `ph-b-${SZ}`, F = k => `B.${SZ}.${k}`
const wait = (s, ms) => s.page.waitForTimeout(ms)

/* a tap (or click) at a point, as a person makes it */
async function tapAt(s, x, y) { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await wait(s, 450) }
async function tapCentre(s, sel) { const b = await boxOf(s, sel); if (!b) return null; await tapAt(s, b.x + b.w / 2, b.y + b.h / 2); return b }

async function toInputs(s) {
  await signIn(s, 'ad', 'a')
  await pickSq(s, '149'); await go(s, 'inputs'); await wait(s, 700)
}
async function listView(s) {
  const { page } = s
  if (await page.locator('#inListBtn[aria-pressed="false"]').filter({ visible: true }).count()) await press(s, '#inListBtn')
  const rangeWords = async () => ((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '').trim()
  if (!/All dates/.test(await rangeWords())) {
    if (!(await page.locator('#inRangeAll').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
    const a = page.locator('#inRangeAll').first()
    if (!(await a.count())) die('the dates window has no All dates (button reads: ' + (await rangeWords()) + ')')
    await a.scrollIntoViewIfNeeded().catch(() => {}); await press(s, a)
    if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeBtn')
  }
  await wait(s, 300)
}
async function calView(s) {
  const { page } = s
  if (await page.locator('#inListBtn[aria-pressed="true"]').filter({ visible: true }).count()) await press(s, '#inCalBtn')
  if (!(await page.locator('#icPrev').filter({ visible: true }).count())) {
    await pic(s, `${P}-debug-no-month-arrow`)
    FACT(F('debug.calView'), await s.page.evaluate(() => ({ listPressed: document.querySelector('#inListBtn')?.getAttribute('aria-pressed'), calCls: document.querySelector('#inCalBtn')?.className, scrollY: Math.round(scrollY), prev: (() => { const e = document.querySelector('#icPrev'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) })() })))
  }
  for (let i = 0; i < 12 && !(await page.locator('.ib-bar[data-iid]').count()); i++) await press(s, '#icPrev')
  if (!(await page.locator('.ib-bar[data-iid]').count())) die('no input bar in the calendar within 12 months back')
}
const rowIds = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid], #inList [data-iid]')].map(r => ({ iid: r.dataset.iid, t: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) })))
const win = s => s.page.evaluate(() => {
  const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
  if (!r) return null
  const w = r.closest('.floatwin') || r.closest('.airpop') || r.closest('[role=dialog]')
  const body = w?.querySelector('.win-body') || w?.querySelector('.inped-body')
  const b = w?.getBoundingClientRect()
  const band = document.querySelector('[data-testid="inped-moveband"]')
  return {
    head: w?.innerText.split('\n').slice(0, 2).join(' / ').trim().slice(0, 60), cls: String(w?.className).slice(0, 40),
    box: b && [b.left, b.top, b.width, b.height].map(Math.round), bodyContentH: body ? body.scrollHeight : null,
    rmk: r.value, band: band ? band.textContent.replace(/\s+/g, ' ').trim() : null,
    inert: !!w?.querySelector('[inert]') || !!r.closest('[inert]'), rmkOff: r.readOnly || r.disabled || !!r.closest('[inert]'),
  }
})
const role = s => s.page.evaluate(() => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const badge = [...document.querySelectorAll('#roleBadge')].find(vis)
  return { badge: badge ? badge.textContent.trim() : null, badgeTitle: badge?.getAttribute('title') ?? null, drawerRole: document.querySelector('#drawerRole')?.textContent.trim() ?? null, lifted: vis(document.querySelector('[data-testid="inped-rolechip"]')) ? document.querySelector('[data-testid="inped-rolechip"]').textContent.trim() : null }
})
const question = s => s.page.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('#dlgModal, [data-testid="inped-xask"], .inped-xask, [role=alertdialog]')) { const b = e.getBoundingClientRect(); if (b.width > 1 && b.height > 1) out.push(e.textContent.replace(/\s+/g, ' ').trim().slice(0, 200)) }
  return out
})
/* open an input by the size's presses: the List's row (its open button), or the calendar's bar, then the day's card */
async function openInput(s, opener, iid) {
  const { page } = s
  if (opener === 'list') {
    await listView(s)
    const row = page.locator(`#inBody tr[data-iid], #inList [data-iid]`, { hasText: iid }).first()
    await row.scrollIntoViewIfNeeded().catch(() => {})
    const o = row.locator('[data-testid="in-open"]')
    await press(s, (await o.count()) ? o.first() : row)
  } else {
    /* the input's id in this browser's world (ids are made afresh in each new browser): read from the List's row */
    await listView(s)
    const who = iid
    iid = await page.locator(`#inBody tr[data-iid], #inList [data-iid]`, { hasText: who }).first().getAttribute('data-iid')
    if (!iid) die(`no List row for ${who}`)
    await calView(s)
    const bar = page.locator(`.ib-bar[data-iid="${iid}"]`).first()
    if (!(await bar.count())) die(`no calendar bar for ${iid}`)
    await bar.scrollIntoViewIfNeeded().catch(() => {})
    const b = await bar.boundingBox(); await tapAt(s, b.x + Math.min(10, b.width / 2), b.y + b.height / 2)
    await wait(s, 400)
    if (!(await win(s))) {
      const card = page.locator(`[data-testid="idy-row-${iid}"]`).filter({ visible: true })
      if (!(await card.count())) die(`the calendar tap opened neither the window nor a card for ${iid}`)
      await press(s, card.first())
    }
  }
  await wait(s, 500)
  if (!(await win(s))) die(`the input window did not open (${opener} ${iid})`)
}
async function typeRemarks(s) {
  const r = s.page.locator('#inpEditRmk').filter({ visible: true }).first()
  await r.scrollIntoViewIfNeeded().catch(() => {})
  await press(s, r)
  await s.page.keyboard.press('Control+a').catch(() => {}); await s.page.keyboard.type(WORDS)
  await wait(s, 300)
  if ((await win(s))?.rmk !== WORDS) die('the typed words did not land in Remarks')
}
/* the switch to the member view, by the control's real position: the bar's name badge where drawn, else ☰ and its line */
async function trySwitch(s, k) {
  const out = {}
  const badgeDrawn = !!(await boxOf(s, '#roleBadge'))
  out.badgeDrawn = badgeDrawn
  if (badgeDrawn) {
    out.badgeAt = await boxOf(s, '#roleBadge'); out.badgeCovered = await covered(s, '#roleBadge')
    await tapCentre(s, '#roleBadge')
    out.via = 'name badge'
  } else {
    out.burgerAt = await boxOf(s, '#burger'); out.burgerCovered = await covered(s, '#burger')
    await tapCentre(s, '#burger'); await wait(s, 300)
    out.drawerOpen = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    out.drawerRoleAt = await boxOf(s, '#drawerRole'); out.drawerRoleCovered = await covered(s, '#drawerRole')
    out.drawerRoleWords = await s.page.evaluate(() => document.querySelector('#drawerRole')?.textContent.trim() ?? null)
    if (out.drawerRoleAt) { await tapCentre(s, '#drawerRole'); await wait(s, 300) }
    out.via = '☰ then its role line'
    await shut(s)
  }
  await wait(s, 400)
  const w = await win(s), r = await role(s)
  out.windowAfter = w ? { head: w.head, rmk: w.rmk, band: w.band, inert: w.inert, rmkOff: w.rmkOff } : null
  out.roleAfter = r; out.questions = await question(s); out.pageAfter = await s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
  out.memberView = /Member/.test(r.badge || '') || /admin view/i.test(r.drawerRole || '')
  out.held = !!w && !!w.band
  for (const [kk, v] of Object.entries(out)) FACT(F(`${k}.${kk}`), v)
  return out
}
async function setUp(opener, iid, tag) {
  const s = await mk(SZ)
  await toInputs(s)
  await openInput(s, opener, iid)
  await typeRemarks(s)
  if (tag) {
    const w = await win(s)
    FACT(F(`${tag}.window`), { head: w.head, box: w.box, bodyContentH: w.bodyContentH, cls: w.cls })
    const ctl = (await boxOf(s, '#roleBadge')) ? '#roleBadge' : '#burger'
    FACT(F(`${tag}.memberControl`), ctl === '#roleBadge' ? 'name badge (#roleBadge)' : '☰ menu button (its line "Switch to the member view")')
    FACT(F(`${tag}.memberControl.at`), await boxOf(s, ctl)); FACT(F(`${tag}.memberControl.covered`), await covered(s, ctl))
    await picMarked(s, `${P}-${tag}-1-open-marked`, ctl)
  }
  return s
}
try {
  console.log('ph-b v1', SZ, ONLY)
  /* which inputs: the shortest and the tallest window content at this size */
  const s0 = await mk(SZ); await toInputs(s0); await listView(s0)
  const rows = await rowIds(s0)
  if (rows.length < 2) die('fewer than two inputs on 149')
  const sizes = []
  for (const r of rows) { r.who = r.t.split(/[ ,]/)[0]; await openInput(s0, 'list', r.who); const w = await win(s0); sizes.push({ ...r, h: w.bodyContentH }); await press(s0, '.inpedwin .win-x'); await wait(s0, 300) }
  await s0.ctx.close()
  sizes.sort((a, b) => a.h - b.h)
  const short = sizes[0], tall = sizes[sizes.length - 1]
  FACT(F('inputs.contentHeights'), sizes.map(x => `${x.t} = ${x.h}px`))
  FACT(F('inputs.short'), short.t); FACT(F('inputs.tall'), tall.t)
  /* REACH: each opener x each input, the switch tried with the window open */
  const reached = []
  if (ONLY !== 'ways') for (const opener of ['list', 'cal']) for (const [nm, inp] of [['short', short], ['tall', tall]]) {
    const tag = `${opener}-${nm}`
    const s = await setUp(opener, inp.who, tag)
    const o = await trySwitch(s, `${tag}.switch`)
    await pic(s, `${P}-${tag}-2-after-switch`)
    if (o.held) { await pic(s, `${P}-${tag}-2-held-band`, ['[data-testid="inped-moveband"]'], 16); reached.push({ opener, nm, iid: inp.who }) }
    await s.ctx.close()
  }
  FACT(F('reach.heldReachedIn'), reached.map(r => `${r.opener}-${r.nm}`))
  /* WAYS BACK: from the held state (list opener, short input), each from a fresh browser */
  if (ONLY !== 'reach') {
    const base = reached[0] || { opener: 'list', nm: 'short', iid: short.who }
    if (!reached.length && ONLY !== 'ways') { FACT(F('ways'), 'not tried: the held state was not reached by presses at this size') }
    else for (const way of ['role', 'menu', 'bandClose', 'x', 'escape', 'swipe', 'back']) {
      const s = await setUp(base.opener, base.iid, null)
      const o = await trySwitch(s, `ways.${way}.setup`)
      if (!o.held) { FACT(F(`ways.${way}`), 'held state not reached in this run'); await s.ctx.close(); continue }
      const k = `ways.${way}`
      let did = 'pressed'
      if (way === 'role') {
        const lifted = await boxOf(s, '[data-testid="inped-rolechip"]')
        const sel = lifted ? '[data-testid="inped-rolechip"]' : '#roleBadge'
        const at = await boxOf(s, sel)
        FACT(F(`${k}.control`), lifted ? 'the name badge drawn above the window (inped-rolechip)' : at ? 'the name badge in the bar' : 'no name badge drawn')
        if (at) { FACT(F(`${k}.covered`), await covered(s, sel)); FACT(F(`${k}.words`), await s.page.evaluate(sel => document.querySelector(sel)?.textContent.trim(), sel)); await tapCentre(s, sel) } else did = 'not drawn'
      } else if (way === 'menu') {
        FACT(F(`${k}.burgerCovered`), await covered(s, '#burger'))
        if (await boxOf(s, '#burger')) {
          await tapCentre(s, '#burger'); await wait(s, 300)
          FACT(F(`${k}.lineWords`), await s.page.evaluate(() => document.querySelector('#drawerRole')?.textContent.trim() ?? null))
          FACT(F(`${k}.lineCovered`), await covered(s, '#drawerRole'))
          await pic(s, `${P}-ways-menu-open`)
          if (await boxOf(s, '#drawerRole')) await tapCentre(s, '#drawerRole'); else did = 'no role line'
          await shut(s)
        } else did = 'no ☰ drawn'
      } else if (way === 'bandClose') {
        const sel = '[data-testid="inped-moveband"] button'
        FACT(F(`${k}.covered`), await covered(s, sel))
        if (!(await tapCentre(s, sel))) did = 'no Close drawn'
      } else if (way === 'x') {
        /* the window's own ✕ in its title strip: whichever button there reads ✕ */
        const found = await s.page.evaluate(() => {
          const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
          const w = r && (r.closest('.floatwin') || r.closest('.airpop') || r.closest('[role=dialog]'))
          const x = w && [...w.querySelectorAll('button')].find(b => b.textContent.trim() === '✕' && b.getBoundingClientRect().width > 0)
          if (!x) return null
          x.setAttribute('data-n162x', '1'); return x.className + (x.id ? '#' + x.id : '')
        })
        FACT(F(`${k}.control`), found)
        if (found) { FACT(F(`${k}.covered`), await covered(s, '[data-n162x]')); await tapCentre(s, '[data-n162x]') } else did = 'no ✕ drawn'
      } else if (way === 'escape') {
        await s.page.keyboard.press('Escape'); did = s.desk ? 'Escape pressed' : 'Escape pressed (a keyboard attached to the tablet or phone)'
      } else if (way === 'swipe') {
        /* the held window's own box (a floating window, or the dialog it is drawn as once held) */
        const head = await s.page.evaluate(() => {
          const r = [...document.querySelectorAll('#inpEditRmk')].find(e => e.getBoundingClientRect().width > 0)
          const w = r && (r.closest('.airpop') || r.closest('.floatwin') || r.closest('[role=dialog]'))
          const h = w && (w.querySelector('.airpop-head, .win-bar') || w)
          if (!h) return null; const b = h.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }
        })
        if (!head) die('no held window to swipe')
        if (s.desk) { did = 'not tried: no swipe on a desktop' }
        else {
          const cdp = await s.ctx.newCDPSession(s.page)
          const x = head.x + head.w / 2, y0 = head.y + Math.min(20, head.h / 2), y1 = Math.min(s.H - 10, y0 + 400)
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 1 }] })
          for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / 10, id: 1 }] }); await wait(s, 20) }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
          did = `a finger dragged down from the window's top strip, ${Math.round(y0)} to ${Math.round(y1)}`
        }
      } else if (way === 'back') {
        await s.page.goBack({ timeout: 8000 }).catch(e => { did = 'Back: ' + String(e).split('\n')[0].slice(0, 80) })
        if (did === 'pressed') did = 'the browser Back'
      }
      await wait(s, 700)
      FACT(F(`${k}.did`), did)
      const qs = await question(s); FACT(F(`${k}.question`), qs)
      if (qs.length) await pic(s, `${P}-ways-${way}-question`)
      const w = await win(s), r = await role(s)
      FACT(F(`${k}.windowAfter`), w ? { head: w.head, rmk: w.rmk, band: w.band, rmkOff: w.rmkOff } : null)
      FACT(F(`${k}.roleAfter`), r)
      FACT(F(`${k}.url`), s.page.url()); FACT(F(`${k}.signedOut`), !!(await s.page.locator('#luser').filter({ visible: true }).count()))
      await pic(s, `${P}-ways-${way}-after`)
      /* where the window went: were the words kept anywhere? reopen the input as it now stands */
      if (!w && !(await s.page.locator('#luser').filter({ visible: true }).count())) {
        const page = await s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
        FACT(F(`${k}.pageAfter`), page)
        if (/Member/.test(r.badge || '') || /admin view/i.test(r.drawerRole || '')) FACT(F(`${k}.stillMemberView`), true)
        /* reopened by presses: back to the admin view where needed, 149 picked where needed, its Inputs, the same input */
        if (s.page.url().startsWith('http://localhost:4700')) try {
          if (/Member/.test(r.badge || '') || /admin view/i.test(r.drawerRole || '')) {
            if (await boxOf(s, '#roleBadge')) await tapCentre(s, '#roleBadge')
            else { await tapCentre(s, '#burger'); await wait(s, 300); await tapCentre(s, '#drawerRole'); await shut(s) }
            await wait(s, 500)
          }
          const sq = await s.page.evaluate(() => { const m = [...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1); return m ? m.textContent : '' })
          if (!/149/.test(sq)) await pickSq(s, '149')
          await go(s, 'inputs')
          await openInput(s, 'list', base.iid)
          FACT(F(`${k}.reopened.remarks`), (await win(s))?.rmk ?? null)
          await pic(s, `${P}-ways-${way}-reopened`)
        } catch (e) { FACT(F(`${k}.reopened`), 'could not reopen: ' + String(e).split('\n')[0].slice(0, 100)); process.exitCode = 0 }
      }
      await s.ctx.close()
    }
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
void note
