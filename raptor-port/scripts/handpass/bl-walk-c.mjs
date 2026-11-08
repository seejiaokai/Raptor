/* WALKER C — the keyboard rings on the Scheduler Board (chat 11, 8 Nov 26; D1771, D1646). Everything is reached by the keys
   (Tab, Enter, arrows, Escape); a mouse click / a finger tap only for C6. Reads computed outline AND counts cyan pixels in each cropped picture.
   Usage: ENGINE=chromium|webkit node scripts/handpass/bl-walk-c.mjs   (pictures: docs/img/handpass/2026-11-08-board-layout/walk/c/<engine>/) */
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
console.log('bl-walk-c v2')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ENGINE = process.env.ENGINE || 'chromium'
const OUT = path.resolve(HERE, '../../docs/img/handpass/2026-11-08-board-layout/walk/c', ENGINE)
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let n = 0
const res = []
const log = (id, ok, note) => { res.push({ id, ok, note }); console.log((ok === true ? 'PASS ' : ok === false ? 'FAIL ' : 'INFO ') + id + ' — ' + note) }

const desc = () => {
  const a = document.activeElement; if (!a) return null
  const cs = getComputedStyle(a)
  return { tag: a.tagName, id: a.id, cls: [...a.classList].join('.'), txt: (a.textContent || '').trim().slice(0, 28),
    data: [...a.attributes].filter(x => x.name.startsWith('data-')).map(x => x.name).join(','),
    vis: a.matches(':focus-visible'), os: cs.outlineStyle, oc: cs.outlineColor, ow: cs.outlineWidth, oo: cs.outlineOffset, bg: cs.backgroundColor, bs: cs.boxShadow }
}
const act = page => page.evaluate(desc)
const short = r => r ? `${r.tag}${r.id ? '#' + r.id : ''}.${r.cls} "${r.txt}" fv=${r.vis} outline=${r.os} ${r.ow} ${r.oc} off=${r.oo}` : 'nothing focused'

async function newWorld(opts) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  page.errs = []
  page.on('pageerror', e => page.errs.push('pageerror ' + e.message))
  page.on('console', m => { if (m.type() === 'error') page.errs.push('console ' + m.text()) })
  await page.goto('http://localhost:4180/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  page.ctx = ctx
  page.accent = await page.evaluate(() => { const d = document.createElement('i'); d.style.color = 'var(--accent)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c })
  return page
}
/* real Tab presses until the focused element satisfies the page-side predicate source; returns presses or -1 */
async function tabTo(page, predSrc, max = 345) {
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i <= max; i++) {
      const ok = await page.evaluate('(' + predSrc + ')(document.activeElement)')
      if (ok) return i
      await page.keyboard.press(key)
    }
  }
  return -1
}
/* cyan pixel count in a picture buffer (colour within 40 of the accent) */
async function cyanPixels(page, buf) {
  const m = page.accent.match(/\d+/g).map(Number)
  const b64 = buf.toString('base64')
  if (!page.scratch) { page.scratch = await page.ctx.newPage(); await page.scratch.goto('about:blank'); await page.bringToFront() }
  return page.scratch.evaluate(async ([b64, m]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const d = x.getImageData(0, 0, c.width, c.height).data; let k = 0
    for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - m[0]) + Math.abs(d[i + 1] - m[1]) + Math.abs(d[i + 2] - m[2]) < 60) k++
    return k
  }, [b64, m])
}
const pad = (b, p) => ({ x: Math.max(0, b.x - p), y: Math.max(0, b.y - p), width: b.width + 2 * p, height: b.height + 2 * p })
const activeBox = page => page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } })
/* picture (cropped to the box, clamped to the screen); returns { file, cyan } */
async function shot(page, name, box, p = 12) {
  n++
  const file = `${OUT}/${String(n).padStart(3, '0')}-${name}.png`
  const vp = page.viewportSize()
  let clip
  if (box) { const c = pad(box, p); const x = Math.min(c.x, vp.width - 4), y = Math.min(c.y, vp.height - 4); clip = { x, y, width: Math.max(4, Math.min(vp.width - x, c.width)), height: Math.max(4, Math.min(vp.height - y, c.height)) } }
  const buf = await page.screenshot({ path: file, clip })
  return { file: path.basename(file), cyan: await cyanPixels(page, buf) }
}
const isCyan = (r, a) => r && r.vis && r.os === 'solid' && r.oc === a && parseFloat(r.ow) >= 1.99
/* judge the focused control: expect the cyan ring (keys) — logs computed style + pixels + picture */
async function judgeRing(page, id, name, { box } = {}) {
  const r = await act(page)
  const b = box || await activeBox(page)
  const s = await shot(page, name, b)
  const ok = isCyan(r, page.accent) && s.cyan > 20
  log(id, ok, `${short(r)} bg=${r.bg} | cyan px ${s.cyan} | ${s.file}`)
  return ok
}
async function judgeNoRing(page, id, name, { box } = {}) {
  const r = await act(page)
  const b = box || await activeBox(page)
  const s = await shot(page, name, b)
  const ok = r && (!r.vis) && (r.os === 'none' || parseFloat(r.ow) === 0)
  log(id, ok, `${short(r)} | cyan px ${s.cyan} | ${s.file}`)
  return ok
}

/* ===== reaching places by the keys ===== */
async function goEditSchedByKeys(page, narrow) {
  /* the keys start at the very top of the page, as after a page load */
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); const r = document.createRange(); r.setStart(document.body, 0); r.collapse(true); const g = getSelection(); g.removeAllRanges(); g.addRange(r) })
  if (narrow) {
    const k0 = await tabTo(page, `e => e && e.id === 'burger'`, 400); if (k0 < 0) { for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); console.log('DBGTAB', JSON.stringify((await act(page)).id + (await act(page)).cls)) } console.log('DBG no burger', JSON.stringify(await act(page))); return false }
    await page.keyboard.press('Enter'); await page.waitForTimeout(400)
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(100)
  }
  const k = await tabTo(page, `e => e && e.tagName === 'A' && /^edit schedule$/i.test((e.textContent||'').trim()) && e.getClientRects().length > 0`, 60)
  if (k < 0) return false
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => window.CURPAGE === 'editsched', null, { timeout: 6000 }).catch(() => {})
  await page.waitForTimeout(500)
  return await page.evaluate(() => window.CURPAGE === 'editsched')
}
async function openBoardByKeys(page) {
  const k = await tabTo(page, `e => e && e.matches && e.matches('#eWeek .sb-open[data-sbday]')`, 600)
  if (k < 0) return false
  await page.keyboard.press('Enter')
  await page.waitForSelector('#schedBoard:not([hidden]) #sbBoard .sb-line', { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(500)
  return await page.evaluate(() => !!document.querySelector('#schedBoard:not([hidden])'))
}
const menuBox = (page, sel) => page.locator(sel + ':visible').first().boundingBox()

/* a ⋯ menu: Enter path and down-arrow path; items; arrows; Escape. opener: predicate source; menuSel: the menu element */
async function moreMenu(page, tag, openerPred, menuSel, itemCls) {
  const k = await tabTo(page, openerPred, 600)
  if (k < 0) { log(tag, null, 'NOT WALKED — could not Tab to the ⋯ button'); return }
  const opener = await act(page)
  log(tag + '-opener', null, `Tabbed to ${short(opener)} after ${k} Tabs`)
  /* Enter */
  await page.keyboard.press('Enter'); await page.waitForTimeout(250)
  let r = await act(page)
  if (!r || !new RegExp(itemCls).test(r.cls)) { log(tag + '-enter', false, 'Enter did not land on a menu item: ' + short(r)); }
  else {
    const mb = await menuBox(page, menuSel)
    const first = r.txt
    const ok = await judgeRing(page, tag + '-enter-first-item', tag + '-enter-first', { box: mb })
    /* arrows */
    const seen = [first]; let allOk = ok
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80)
      const q = await act(page)
      if (!q || !new RegExp(itemCls).test(q.cls) || seen.includes(q.txt)) break
      seen.push(q.txt)
      const mb2 = await menuBox(page, menuSel)
      allOk = (await judgeRing(page, tag + '-down-' + q.txt.replace(/\W+/g, '_'), tag + '-down-' + seen.length, { box: mb2 })) && allOk
    }
    await page.keyboard.press('ArrowUp'); await page.waitForTimeout(80)
    const up = await act(page)
    const mbu = await menuBox(page, menuSel)
    await judgeRing(page, tag + '-up', tag + '-up', { box: mbu })
    log(tag + '-items', null, 'items reached by ArrowDown: ' + seen.join(' | ') + ' ; after ArrowUp on "' + (up && up.txt) + '"')
    await page.keyboard.press('Escape'); await page.waitForTimeout(250)
    const back = await act(page)
    const menuGone = !(await page.locator(menuSel + ':visible').count())
    log(tag + '-escape', back && back.id === opener.id && menuGone, `after Escape: ${short(back)} ; menu closed=${menuGone}`)
    const bb = await activeBox(page); const s = await shot(page, tag + '-escape-opener', bb); log(tag + '-escape-pic', null, s.file + ' cyan ' + s.cyan)
  }
  /* separate: ArrowDown on the closed ⋯ */
  await page.evaluate(`document.getElementById('${opener.id}')?.focus()`)
  const pre = await act(page)
  if (pre && pre.id === opener.id) {
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(250)
    const q = await act(page)
    if (q && new RegExp(itemCls).test(q.cls)) {
      const mb = await menuBox(page, menuSel)
      await judgeRing(page, tag + '-arrow-open-first-item', tag + '-arrowopen-first', { box: mb })
    } else log(tag + '-arrow-open', false, 'ArrowDown on ⋯ did not land on an item: ' + short(q))
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  } else log(tag + '-arrow-open', null, 'NOT WALKED — could not refocus the opener: ' + short(pre))
}

async function focusRing(page, id, name, predSrc, { enter } = {}) {
  let k = await tabTo(page, predSrc, 345)
  if (k < 0) {
    /* Tab cannot reach it (the board routes Tab box to box, D550–D556): put the keys there by a script focus() after a real key press, and say so */
    const m = predSrc.match(/e\.matches\((".*")\)/); const q = m && JSON.parse(m[1])
    await page.keyboard.press('Shift')
    const got = q ? await page.evaluate((q) => { const e = [...document.querySelectorAll(q)].find(x => x.offsetParent); if (!e) return false; e.focus(); return document.activeElement === e }, q) : false
    if (!got) { log(id, null, 'NOT WALKED — Tab never reached it and it is not on screen'); return false }
    log(id + '-reach', null, 'Tab (both directions, one full cycle of the board, 345 stops each way) never stops on it: reached by a script focus() after a key press')
  }
  await page.waitForTimeout(80)
  await page.evaluate(() => { const a = document.activeElement; a.scrollIntoView && 0 })
  const ok = await judgeRing(page, id, name)
  if (enter) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(300)
    const s = await shot(page, name + '-after-enter', null)
    const open = await page.evaluate(() => [...document.querySelectorAll('[role=menu], .menu, .popmenu, .sb-pop, .blkmenu, .blockmenu, dialog, [class*=menu]')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 20).map(e => e.className).slice(0, 4))
    log(id + '-enter', null, 'Enter pressed; menus visible: ' + JSON.stringify(open) + ' ; focus now ' + short(await act(page)) + ' ; ' + s.file)
    const st = await page.evaluate(() => { const e = document.activeElement; return { body: !e || e === document.body, onCtl: !!(e && e.matches('[data-dwadd],[data-sblkadd],[data-wvadd],.planselbtn,#sbTpl,.stcfg,[data-rolepick],.mbtn.daybtn')) } })
    if (!st.body && !st.onCtl) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    else if (st.body) log(id + '-focus-lost', null, 'after Enter the keys are on the page body (the board redrew): Escape not pressed')
    if (!(await page.evaluate(() => !!document.querySelector('#schedBoard:not([hidden]) #sbBoard .sb-line')))) { log(id + '-board', null, 'board had closed; reopened by the keys'); await openBoardByKeys(page) }
    log(id + '-escape', null, 'after Escape focus is ' + short(await act(page)))
  }
  return ok
}

const sel = (s) => `e => e && e.matches && e.matches(${JSON.stringify(s)})`

/* ===================== DESKTOP 1536 x 900 ===================== */
async function desktop() {
  const page = await newWorld({ viewport: { width: 1536, height: 900 } })
  log('setup', null, 'accent ' + page.accent)
  if (!(await goEditSchedByKeys(page, false))) { log('desktop', null, 'NOT WALKED — could not reach Edit Schedule by the keys'); return }
  log('C2-edit-week-1536', null, 'the week ⋯ is drawn only at 820 and narrower (phone) — absent at 1536 by design; walked at 402')
  /* open the board by Enter on a date */
  if (!(await openBoardByKeys(page))) { log('desktop', null, 'NOT WALKED — board did not open by Enter on a date'); return }
  log('open-board', true, 'Tabbed to a day date and pressed Enter; board open; focus ' + short(await act(page)))
  await shot(page, 'board-open', null)
  /* C1 */
  await moreMenu(page, 'C1-board', sel('#sbMore'), '#sbMoreMenu', 'sb-moreitem')
  /* C4 desktop Templates */
  await focusRing(page, 'C4-templates-bar', 'c4-templates-bar', sel('#sbTpl'), { enter: true })
  /* C3 */
  await focusRing(page, 'C3-plusblock-duty', 'c3-block-duty', sel('#schedBoard [data-dwadd]'), { enter: true })
  await focusRing(page, 'C3-plusblock-amt', 'c3-block-amt', sel('#schedBoard [data-sblkadd]'), { enter: true })
  /* C5 */
  await focusRing(page, 'C5-plusWave', 'c5-wave', sel('#schedBoard [data-wvadd]'), { enter: true })
  await focusRing(page, 'C5-plans', 'c5-plans', sel('#schedBoard .planselbtn'), { enter: true })
  await focusRing(page, 'C5-stores', 'c5-stores', sel('#schedBoard .stcfg'))
  await focusRing(page, 'C5-rolebox', 'c5-rolebox', sel('#schedBoard [data-rolepick]'), { enter: true })
  return page
}

/* second desktop world: the rest — mouse (C6), View-only Sched's ⋯, the plain-user round */
async function desktopMouse() {
  const page = await newWorld({ viewport: { width: 1536, height: 900 } })
  /* View-only Sched is the page after login; its ⋯ by the keys */
  log('C2-viewonly-1536', null, 'the week ⋯ is drawn only at 820 and narrower — absent at 1536; walked at 402')
  /* C6: mouse on the week ⋯ and an item */
  const wk = page.locator('#viewSchedMore:visible, #page-viewsched button.schedule-more:visible').first()
  if (await wk.count()) {
    const b = await wk.boundingBox()
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(250)
    await judgeNoRing(page, 'C6-mouse-week-more-button', 'c6-week-more-btn', { box: b })
    const it = page.locator('.schedule-moreitem:visible').first()
    if (await it.count()) {
      const ib = await it.boundingBox()
      await page.mouse.move(ib.x + 10, ib.y + ib.height / 2); await page.waitForTimeout(250)
      const mb = await menuBox(page, '.schedule-moremenu')
      const hv = await it.evaluate(e => { const cs = getComputedStyle(e); return { bg: cs.backgroundColor, bs: cs.boxShadow, os: cs.outlineStyle, fv: e.matches(':focus-visible'), hov: e.matches(':hover') } })
      const s = await shot(page, 'c6-week-item-hover', mb)
      log('C6-hover-week-item', hv.hov && hv.os === 'none' && !hv.fv && s.cyan < 20, JSON.stringify(hv) + ' cyan ' + s.cyan + ' ' + s.file)
      await page.mouse.click(ib.x + 10, ib.y + ib.height / 2); await page.waitForTimeout(300)
      await shot(page, 'c6-week-item-clicked', null)
      log('C6-click-week-item', null, 'item clicked; focus ' + short(await act(page)))
    }
  }
  /* edit schedule + board with the mouse */
  await page.click('a:text-is("Edit Schedule")'); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(400)
  await page.locator('#eWeek .sb-open[data-sbday]').first().click()
  await page.waitForSelector('#schedBoard:not([hidden]) #sbBoard .sb-line'); await page.waitForTimeout(500)
  const targets = [['C6-mouse-sbMore', '#sbMore'], ['C6-mouse-tpl', '#sbTpl'], ['C6-mouse-block', '#schedBoard [data-dwadd]'], ['C6-mouse-amtblock', '#schedBoard [data-sblkadd]'],
    ['C6-mouse-wave', '#schedBoard [data-wvadd]'], ['C6-mouse-plans', '#schedBoard .planselbtn'], ['C6-mouse-stores', '#schedBoard .stcfg'], ['C6-mouse-role', '#schedBoard [data-rolepick]']]
  for (const [id, s] of targets) {
    const l = page.locator(s + ':visible').first()
    if (!(await l.count())) { log(id, null, 'NOT WALKED — not on screen'); continue }
    await l.scrollIntoViewIfNeeded(); await page.waitForTimeout(100)
    const b = await l.boundingBox()
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2)
    await shot(page, id.toLowerCase() + '-before', b)
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(250)
    const a = await act(page)
    const cs = await judgeNoRing(page, id, id.toLowerCase(), { box: b })
    const fl = await page.evaluate(() => { const e = document.activeElement; return !e || e === document.body })
    if (!fl) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    if (!(await page.locator('#schedBoard:not([hidden]) #sbBoard .sb-line').count())) { log(id + '-board', null, 'board had closed after this press; reopened by a click on the date'); await page.locator('#eWeek .sb-open[data-sbday]').first().click(); await page.waitForSelector('#schedBoard:not([hidden]) #sbBoard .sb-line'); await page.waitForTimeout(500) }
  }
  /* mouse: the board ⋯ menu item hover and click */
  if (await page.locator('#sbMore:visible').count()) await page.mouse.click(...(await (async () => { const b = await page.locator('#sbMore').boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] })())); await page.waitForTimeout(250)
  const it = page.locator('.sb-moreitem:visible').first()
  if (await it.count()) {
    const ib = await it.boundingBox()
    await page.mouse.move(ib.x + 10, ib.y + ib.height / 2); await page.waitForTimeout(250)
    const hv = await it.evaluate(e => { const cs = getComputedStyle(e); return { bg: cs.backgroundColor, bs: cs.boxShadow, os: cs.outlineStyle, fv: e.matches(':focus-visible'), hov: e.matches(':hover') } })
    const s = await shot(page, 'c6-board-item-hover', await menuBox(page, '#sbMoreMenu'))
    log('C6-hover-board-item', hv.hov && hv.os === 'none' && !hv.fv && s.cyan < 20, JSON.stringify(hv) + ' cyan ' + s.cyan + ' ' + s.file)
  }
  await page.keyboard.press('Escape')
  return page
}

/* third desktop world: the plain-user round by the keys */
async function round() {
  const page = await newWorld({ viewport: { width: 1536, height: 900 } })
  if (!(await goEditSchedByKeys(page, false)) || !(await openBoardByKeys(page))) { log('round', null, 'NOT WALKED — could not open the board by the keys'); return }
  const reopen = async () => { if (!(await page.locator('#schedBoard:not([hidden]) #sbBoard .sb-line').count())) { log('round-reopen', null, 'board had closed; reopened by the keys'); await goEditSchedByKeys(page, false).catch(() => {}); await openBoardByKeys(page) } }
  /* each menu: Enter opens, Escape closes, the keys back on the button that opened it */
  for (const [id, s] of [['sbTpl', '#sbTpl'], ['wave', '#schedBoard [data-wvadd]'], ['plans', '#schedBoard .planselbtn'], ['block', '#schedBoard [data-dwadd]'], ['amtblock', '#schedBoard [data-sblkadd]']]) {
    let k = await tabTo(page, sel(s), 345)
    if (k < 0) { await page.keyboard.press('Shift'); const ok = await page.evaluate(q => { const e = [...document.querySelectorAll(q)].find(x => x.offsetParent); if (e) e.focus(); return !!e }, s); if (!ok) { log('round-' + id, null, 'NOT WALKED — not on screen'); continue } }
    const op = await act(page)
    await page.keyboard.press('Enter'); await page.waitForTimeout(350)
    const after = await act(page)
    await shot(page, 'round-' + id + '-open', null)
    const bodyNow = !after || after.tag === 'BODY'
    if (!bodyNow) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
    const back = await act(page)
    const same = back && back.id === op.id && back.cls === op.cls && back.data === op.data
    log('round-' + id, bodyNow ? null : same, `Enter -> focus ${after ? after.tag + '.' + after.cls + ' "' + after.txt + '"' : 'none'}; after Escape focus ${short(back)}`)
    await reopen()
  }
  /* Templates: save this day, pick it, Undo — all by the keys */
  await tabTo(page, sel('#sbTpl'), 345)
  await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  await page.keyboard.press('Enter'); await page.waitForTimeout(500)   // "+ Save this day as a template"
  await shot(page, 'round-tpl-save-step', null)
  log('round-tpl-save', null, 'Enter on "+ Save this day…"; focus ' + short(await act(page)) + '; dialog fields: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('input,textarea,button')].filter(e => e.offsetParent && e.closest('.wm-pop,.sb-pop,[class*=pop],[class*=win],[class*=sheet]')).map(e => e.tagName + '.' + e.className + ':' + (e.textContent || e.value || '').trim().slice(0, 20)).slice(0, 8))))
  /* the dialog: Tab to its Done, Enter */
  const kd0 = await tabTo(page, `e => e && e.tagName === 'BUTTON' && /^done$/i.test((e.textContent||'').trim()) && !!e.closest('.modal-box')`, 30)
  log('round-tpl-dialog-done', kd0 >= 0, 'Tab to the dialog Done: ' + (kd0 >= 0 ? kd0 + ' Tabs; ' + short(await act(page)) : 'not reached'))
  if (kd0 >= 0) { await judgeRing(page, 'round-tpl-dialog-done-ring', 'round-tpl-dialog-done'); await page.keyboard.press('Enter'); await page.waitForTimeout(400) }
  log('round-tpl-dialog-closed', await page.evaluate(() => !document.querySelector('.modal-box')), 'focus now ' + short(await act(page)))
  const undoInfo = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => /undo|redo/i.test((b.title || '') + (b.getAttribute('aria-label') || '') + b.id)).map(b => b.id + '|' + (b.title || b.getAttribute('aria-label')) + '|dis=' + b.disabled + '|vis=' + !!b.offsetParent))
  log('round-undo-buttons', null, JSON.stringify(undoInfo))
  /* pick the saved template by the keys */
  await tabTo(page, sel('#sbTpl'), 345)
  await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  log('round-tpl-menu', null, 'Templates open; focus ' + short(await act(page)))
  await shot(page, 'round-tpl-menu', null)
  const pickIsFirst = await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-daytplpick'))
  if (!pickIsFirst) await tabTo(page, `e => e && e.hasAttribute && e.hasAttribute('data-daytplpick')`, 6)
  log('round-tpl-pick-focus', null, short(await act(page)))
  await page.keyboard.press('Enter'); await page.waitForTimeout(600)
  await shot(page, 'round-tpl-picked', null)
  log('round-tpl-picked', null, 'Enter on the template; focus ' + short(await act(page)) + '; dialogs: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal-box,.wm-pop,[role=dialog]')].filter(e => e.offsetParent).map(e => e.className + ':' + (e.textContent || '').trim().slice(0, 80)))))
  /* Undo by the keys */
  const ku = await tabTo(page, sel('#sbUndo'), 345)
  if (ku >= 0) {
    const t0 = await page.evaluate(() => document.getElementById('sbUndo').title)
    const waves0 = await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-line').length)
    await judgeRing(page, 'round-undo-ring', 'round-undo-focus')
    await page.keyboard.press('Enter'); await page.waitForTimeout(600)
    const t1 = await page.evaluate(() => document.getElementById('sbUndo') && document.getElementById('sbUndo').title)
    const waves1 = await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-line').length)
    await shot(page, 'round-after-undo', null)
    log('round-undo', null, `Undo title before "${t0}", after "${t1}"; lines ${waves0} -> ${waves1}; Redo disabled=${await page.evaluate(() => document.getElementById('sbRedo') && document.getElementById('sbRedo').disabled)}; focus ${short(await act(page))}`)
  } else log('round-undo', null, 'NOT WALKED — Tab never reached Undo')
  const kd = await tabTo(page, sel('#sbDone'), 345)
  if (kd >= 0) {
    await judgeRing(page, 'round-done-ring', 'round-done-focus')
    await page.keyboard.press('Enter'); await page.waitForTimeout(600)
    const closed = await page.evaluate(() => { const b = document.getElementById('schedBoard'); return !b || b.hidden || !b.offsetParent })
    log('round-done', closed, 'Enter on ✓ Done; board closed=' + closed + '; focus ' + short(await act(page)))
    await shot(page, 'round-after-done', null)
  } else log('round-done', null, 'NOT WALKED — Tab never reached ✓ Done')
  log('errors-desktop-round', page.errs.length === 0, page.errs.slice(0, 3).join(' ; '))
  return page
}

/* ===================== NARROW 402 x 874 (no touch) ===================== */
async function narrow() {
  const page = await newWorld({ viewport: { width: 402, height: 874 } })
  /* View-only week ⋯ is reachable at once */
  await moreMenu(page, 'C2-viewonly-402', sel('#viewSchedMore'), '.schedule-moremenu', 'schedule-moreitem')
  await page.context().close()
  const page2 = await newWorld({ viewport: { width: 402, height: 874 } })
  return narrow2(page2)
}
async function narrow2(page) {
  if (!(await goEditSchedByKeys(page, true))) { log('narrow', null, 'NOT WALKED — could not reach Edit Schedule by the keys at 402'); return }
  await moreMenu(page, 'C2-edit-402', sel('#page-editsched button.schedule-more'), '#page-editsched .schedule-moremenu', 'schedule-moreitem')
  if (!(await openBoardByKeys(page))) { log('narrow', null, 'NOT WALKED — board did not open by Enter on a date at 402'); return }
  log('open-board-402', true, 'board open at 402 by Enter; focus ' + short(await act(page)))
  await shot(page, 'board-open-402', null)
  await moreMenu(page, 'C1-board-402', sel('#sbMore'), '#sbMoreMenu', 'sb-moreitem')
  await focusRing(page, 'C4-templates-daybar-402', 'c4-templates-daybar', sel('#schedBoard .mbtn.daybtn'), { enter: true })
  await focusRing(page, 'C3-plusblock-duty-402', 'c3-block-duty-402', sel('#schedBoard [data-dwadd]'), { enter: true })
  await focusRing(page, 'C3-plusblock-amt-402', 'c3-block-amt-402', sel('#schedBoard [data-sblkadd]'), { enter: true })
  await focusRing(page, 'C5-plusWave-402', 'c5-wave-402', sel('#schedBoard [data-wvadd]'), { enter: true })
  await focusRing(page, 'C5-plans-402', 'c5-plans-402', sel('#schedBoard .planselbtn'), { enter: true })
  await focusRing(page, 'C5-stores-402', 'c5-stores-402', sel('#schedBoard .stcfg'))
  await focusRing(page, 'C5-rolebox-402', 'c5-rolebox-402', sel('#schedBoard [data-rolepick]'), { enter: true })
  /* every other button on the board under Tab: the browser's own ring? (met in passing) */
  log('errors-402', page.errs.length === 0, page.errs.slice(0, 3).join(' ; '))
}

/* ===================== TOUCH 402 x 874: finger tap (C6) ===================== */
async function touch() {
  const page = await newWorld({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  const fingerAt = async q => { const b = await page.locator(q).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
  await fingerAt('#burger'); await page.waitForTimeout(500)
  await fingerAt('#drawerNav a:text-is("Edit Schedule")'); await page.waitForFunction(() => window.CURPAGE === 'editsched'); await page.waitForTimeout(500)
  const wk = page.locator('#page-editsched button.schedule-more:visible').first()
  if (await wk.count()) {
    await fingerAt('#page-editsched button.schedule-more'); await page.waitForTimeout(250)
    await judgeNoRing(page, 'C6-tap-week-more', 'c6-tap-week-more', { box: await wk.boundingBox() })
    const it = page.locator('.schedule-moreitem:visible').first()
    if (await it.count()) { const ib = await it.boundingBox(); await shot(page, 'c6-tap-week-menu', await menuBox(page, '.schedule-moremenu')); log('C6-tap-week-menu', null, 'menu open after tap, focus ' + short(await act(page))) }
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  }
  await fingerAt('#eWeek .sb-open[data-sbday]')
  await page.waitForSelector('#schedBoard:not([hidden]) #sbBoard .sb-line'); await page.waitForTimeout(500)
  for (const [id, s] of [['C6-tap-sbMore', '#sbMore'], ['C6-tap-daybar-tpl', '#schedBoard .mbtn.daybtn'], ['C6-tap-block', '#schedBoard [data-dwadd]'], ['C6-tap-amtblock', '#schedBoard [data-sblkadd]'],
    ['C6-tap-wave', '#schedBoard [data-wvadd]'], ['C6-tap-plans', '#schedBoard .planselbtn'], ['C6-tap-stores', '#schedBoard .stcfg'], ['C6-tap-role', '#schedBoard [data-rolepick]']]) {
    const l = page.locator(s + ':visible').first()
    if (!(await l.count())) { log(id, null, 'NOT WALKED — not on screen'); continue }
    await l.scrollIntoViewIfNeeded(); await page.waitForTimeout(150)
    const b = await l.boundingBox()
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(100)
    await shot(page, id.toLowerCase() + '-now', b)
    await page.waitForTimeout(400)
    await judgeNoRing(page, id, id.toLowerCase(), { box: b })
    if (id === 'C6-tap-sbMore') {
      const it = page.locator('.sb-moreitem:visible').first()
      if (await it.count()) { const ib = await it.boundingBox(); const mb = await menuBox(page, '#sbMoreMenu'); const r = await act(page); const s2 = await shot(page, 'c6-tap-board-menu', mb); log('C6-tap-board-menu', null, 'menu after tap; focus ' + short(r) + ' cyan ' + s2.cyan + ' ' + s2.file) }
    }
    const fl = await page.evaluate(() => { const e = document.activeElement; return !e || e === document.body })
    if (!fl) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
    if (!(await page.locator('#schedBoard:not([hidden]) #sbBoard .sb-line').count())) { log(id + '-board', null, 'board had closed after this tap; reopened by a tap on the date'); await fingerAt('#eWeek .sb-open[data-sbday]'); await page.waitForSelector('#schedBoard:not([hidden]) #sbBoard .sb-line'); await page.waitForTimeout(500) }
  }
  log('errors-touch', page.errs.length === 0, page.errs.slice(0, 3).join(' ; '))
}

async function dump() {
  const page = await newWorld({ viewport: { width: 1536, height: 900 } })
  await goEditSchedByKeys(page, false); await openBoardByKeys(page)
  console.log(await page.evaluate(() => ['#sbMore','[data-dwadd]','[data-sblkadd]','[data-wvadd]','.stcfg','[data-rolepick]','#sbDone'].map(s => s + ' n=' + document.querySelectorAll('#schedBoard ' + s).length + ' vis=' + [...document.querySelectorAll('#schedBoard ' + s)].filter(e => e.offsetParent).length).join(' | ')))
  console.log(await page.evaluate(() => ['[data-dwadd]', '[data-sblkadd]', '[data-wvadd]', '.stcfg', '[data-rolepick]'].map(q => { const e = document.querySelector('#schedBoard ' + q); const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return q + ' tag=' + e.tagName + ' tabindex=' + e.getAttribute('tabindex') + ' vis=' + cs.visibility + ' op=' + cs.opacity + ' disp=' + cs.display + ' pe=' + cs.pointerEvents + ' box=' + [r.x, r.y, r.width, r.height].map(Math.round) + ' parent=' + e.parentElement.className }).join(' || ')))
  const seq = []
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); seq.push(await page.evaluate(() => { const a = document.activeElement; return a.tagName + (a.id ? '#' + a.id : '') + '.' + String(a.className).slice(0, 24) + ' "' + (a.textContent || '').trim().slice(0, 10) + '"' })) }
  console.log(seq.map((x, i) => i + ' ' + x).filter(x => /BUTTON|HTML|BODY/.test(x)).join('\n'))
}
const only = process.env.ONLY || ''
for (const [name, fn] of [['dump', dump], ['desktop', desktop], ['mouse', desktopMouse], ['round', round], ['narrow', narrow], ['touch', touch]]) {
  if (name === "dump" ? only !== "dump" : (only && only !== name)) continue
  console.log('=== ' + name)
  try { await fn() } catch (e) { log(name, null, 'SCRIPT ERROR ' + String(e).split('\n')[0]) }
}
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(res, null, 1))
await browser.close()
