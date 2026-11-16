/* warn-words mock-up helpers (15 Nov 26). Self-contained: drives the local preview on :4391, writes only to this folder.
   Staging steps copied from raptor-port/scripts/handpass/rcb2/rcb2-w3-lib.mjs (chat 81's walk). */
import { createRequire } from 'node:module'
import { appendFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
/* the folder's own place, so a replay writes beside the script unless WW_OUT names another folder — the pictures put
   to him are never overwritten by accident when WW_OUT is set (first made in a chat's scratch folder, 15 Nov 26) */
const require = createRequire(new URL('../../../package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
export const OUT = process.env.WW_OUT || fileURLToPath(new URL('.', import.meta.url)).replace(/[\\/]$/, '')
mkdirSync(OUT, { recursive: true })
export const BASE = 'http://localhost:4391'
export const LOG = OUT + '/run-log.txt'
export function say(...a) { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); appendFileSync(LOG, s + '\n') }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const FRI = 4, MAN = 'bane'

export async function open({ phone = false } = {}) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const tag = phone ? 'PHONE' : 'DESK'
  page.on('pageerror', e => say(tag, 'PAGEERROR', e.message))
  page.on('console', m => { if (m.type() === 'error') say(tag, 'CONSOLE-ERROR', m.text()) })
  page.on('response', r => { if (r.status() >= 400) say(tag, 'HTTP', r.status(), r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page)
  return { browser, ctx, page, phone, P: phone ? 'phone' : 'desktop' }
}
export async function login(page) {
  await page.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
  if (await page.locator('#luser').count()) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(600)
}
/** reload (clears an emulated phone's focus zoom), sign in again if asked */
export async function reload(w) {
  await w.page.reload()
  await w.page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(w.page)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(400)
}
export async function press(w, sel, { nth = 0, scope = 'page' } = {}) {
  const page = w.page
  const q = sel.split(',').map(s => (scope === 'board' ? '#schedBoard ' : '') + s.trim() + ':visible').join(', ')
  const el = page.locator(q).nth(nth)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  try { if (w.phone) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }) } catch {
    const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel)
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  await sleep(300)
}
export async function typeIn(w, sel, value) {
  const page = w.page
  const inBoard = await page.locator('#schedBoard:visible').count()
  const el = page.locator((inBoard ? '#schedBoard ' : '') + sel + ':visible').first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(100)
  if (w.phone) await el.tap(); else await el.click()
  await el.fill('')
  await el.type(String(value), { delay: 8 })
  await page.keyboard.press('Enter').catch(() => {})
  await el.blur().catch(() => {})
  await sleep(350)
}
export async function board(w, di) {
  const page = w.page
  const cur = await page.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) await closeBoard(w)
  await go(page, 'editsched')
  await press(w, `#eWeek [data-sbday="${di}"]`)
  await page.waitForSelector('#schedBoard'); await sleep(600)
}
export async function closeBoard(w) {
  const page = w.page
  if (!(await page.locator('#schedBoard').count())) return
  const d = page.locator('#schedBoard').getByRole('button', { name: /Done|Close/ }).first()
  if (await d.count()) { if (w.phone) await d.tap(); else await d.click() } else await page.keyboard.press('Escape')
  await sleep(600)
}
export async function addWave(w, di, kind = '') {
  const page = w.page
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, di)
  await press(w, `[data-wvadd="${di}"]`, { scope: 'board' })
  await press(w, `.wavemenu [data-wmkind="${kind}"]`)
  await page.waitForFunction(([i, n]) => window.DAYS[i].waves.length === n + 1, [di, n0])
  await sleep(300)
  return n0
}
async function ensureRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.locator('#sbRoster:visible').count()) return
  const tab = page.locator('#schedBoard .ros-tab:visible').first()
  if (await tab.count()) { await tab.tap(); await sleep(400) }
}
async function closeRoster(w) {
  if (!w.phone) return
  const page = w.page
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) { const tab = page.locator('#schedBoard .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(400) } }
}
export async function seat(w, slotSel, id) {
  const page = w.page
  await ensureRoster(w)
  let res = 'FAILED seat not armed'
  for (let t = 0; t < 3; t++) {
    await press(w, slotSel, { scope: 'board' }); await sleep(200)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); res = 'FAILED ' + id + ' not offered'; break }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
    try { if (w.phone) await p.tap({ timeout: 2500 }); else await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) { if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
    await sleep(400); res = 'ok'; break
  }
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await closeRoster(w)
  return res
}
export async function flight(w, di, to, ld, man = MAN) {
  const wi = await addWave(w, di, '')
  await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  const s = await seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man)
  if (s !== 'ok') throw new Error('SEAT PROBLEM ' + s)
  return wi
}
/** stage Ranger's Friday exactly as rcb2-w3-r1.mjs does: VL BFM T/O 12:00 no landing; BRIEFING 12:40-13:00 Ranger; RU T/O 13:00 landing 14:00 */
export async function stageFriday(w) {
  const page = w.page
  await board(w, FRI)
  const wi = await flight(w, FRI, '12:00', '')
  await typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.msn"]`, 'VL BFM')
  const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
  await press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
  await typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'BRIEFING')
  await typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:40')
  await typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:00')
  const s = await seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, MAN)
  if (s !== 'ok') throw new Error('ground seat ' + s)
  const w2 = await flight(w, FRI, '13:00', '14:00')
  await typeIn(w, `[data-bfld="ff:${FRI}.${w2}.0.msn"]`, 'RU')
  const st = await page.evaluate(([d, a, b, g]) => {
    const f = i => { const x = window.DAYS[d].waves[i].formations[0]; return { msn: x.msn, to: x.to, ld: x.ld, p: window.PEOPLE[x.aircraft[0].p]?.cs } }
    const gr = window.DAYS[d].ground[g]
    return { vl: f(a), ru: f(b), ground: { prog: gr.prog, str: gr.str, end: gr.end } }
  }, [FRI, wi, w2, g0])
  say('STAGED', st)
  return { wi, w2, g0, st }
}
/** open the warning list (the phone folds it) and read its rows */
export async function openWarn(w) {
  const pg = w.page
  const open = await pg.evaluate(() => !!document.querySelector('#schedBoard #sbWarn .sbwrap.open'))
  if (!open) {
    const tog = pg.locator('#schedBoard #sbWarn [data-sbwtog]:visible').first()
    if (await tog.count()) { await tog.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w.phone) await tog.tap(); else await tog.click(); await sleep(400) }
  }
  return readWarn(w)
}
export async function readWarn(w) {
  return w.page.evaluate(() => {
    const box = document.querySelector('#schedBoard #sbWarn')
    const head = (box.querySelector('.wh')?.innerText || '').replace(/\s+/g, ' ').trim()
    const rows = [...box.querySelectorAll('.wln')].filter(e => e.offsetWidth && getComputedStyle(e).display !== 'none').map(e => ({
      sev: ['hard', 'adv', 'note', 'ok'].find(c => e.classList.contains(c)) || '?',
      text: (e.querySelector('.wln-t')?.innerText || e.innerText).replace(/\s+/g, ' ').trim(),
      lines: (() => { const t = e.querySelector('.wln-t'); if (!t) return 0; const lh = parseFloat(getComputedStyle(t).lineHeight) || 20; return Math.round(t.getBoundingClientRect().height / lh) })(),
    }))
    return { head, rows }
  })
}
/** sign all four roles and publish the day (copied from scripts/handpass/lib.mjs publish) */
export async function publish(page, di) {
  const sels = page.locator(`#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await sleep(150)
  }
  await sleep(400)
  let beak = page.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  if (!await beak.count()) beak = page.locator(`#schedBoard [data-alpub="${di}"]:visible`).first()
  if (!await beak.count()) return { published: false, why: 'no publish button' }
  if (await beak.isDisabled()) return { published: false, why: (await beak.innerText()).trim() }
  await beak.click(); await sleep(900)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
  return { published: true }
}
/** set a Logic setting by its key (as rcb2-w2-s12 setKey does: fill + Tab) */
export async function setKey(w, key, val) {
  const page = w.page
  await go(page, 'logic'); await sleep(500)
  if (!(await page.locator(`#lgBody input[data-lgset="${key}"]:visible`).count())) { if (await page.locator('#lgEdit:visible').count()) { await press(w, '#lgEdit'); await sleep(400) } }
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded(); await inp.fill(val); await inp.press('Tab'); await sleep(700)
  return { key, before, after: await inp.inputValue() }
}
/** DRAWN: hide every real row of the open list, clone a real row of each wanted colour, set prefix + words; header recounted */
/* nowrap: each HH:MM–HH:MM range of a proposed row sits in a nowrap span so it never breaks (redraw 2, §2) */
export async function drawRows(w, rows, { nowrap = false } = {}) {
  const got = await w.page.evaluate(([rows, nowrap]) => {
    const setWords = (el, text, nw) => {
      if (!nw) { el.textContent = text; return }
      const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      el.innerHTML = esc(text).replace(/(\d\d:\d\d–\d\d:\d\d)/g, '<span style="white-space:nowrap">$1</span>')
    }
    const box = document.querySelector('#schedBoard #sbWarn')
    box.querySelectorAll('[data-ww]').forEach(e => e.remove())
    const real = [...box.querySelectorAll('.wln[data-wix]')]
    const tpl = {}
    for (const e of real) for (const s of ['hard', 'adv', 'note']) if (e.classList.contains(s) && !tpl[s] && !e.classList.contains('hid')) tpl[s] = e
    for (const r of rows) if (!tpl[r.sev]) return { err: 'no real row of colour ' + r.sev }
    real.forEach(e => { e.style.display = 'none' })
    let after = real[real.length - 1]
    for (const r of rows) {
      const c = tpl[r.sev].cloneNode(true)
      c.classList.remove('on', 'pksel'); c.style.display = ''
      c.setAttribute('data-ww', '1'); c.removeAttribute('data-wix')
      c.querySelectorAll('.wln-act').forEach(x => x.remove())   // our own clone: the Leave War period button is not part of these lines
      setWords(c.querySelector('.wln-t'), r.prefix ? r.prefix + ' — ' + r.words : r.words, nowrap)
      after.after(c); after = c
    }
    const wh = box.querySelector('.wh'), b = wh.querySelector('b')
    const n = rows.length, nh = rows.filter(r => r.sev === 'hard').length
    b.textContent = `⚠ ${n} issue${n > 1 ? 's' : ''}`
    while (b.nextSibling) b.nextSibling.remove()
    if (nh) wh.appendChild(document.createTextNode(` · ${nh} warning${nh > 1 ? 's' : ''}`))
    wh.classList.remove('hard', 'adv', 'note'); wh.classList.add(nh ? 'hard' : rows.some(r => r.sev === 'adv') ? 'adv' : 'note')
    return { ok: true }
  }, [rows, nowrap])
  if (!got.ok) throw new Error(got.err)
  await assertDrawn(w, rows)
}
export async function assertDrawn(w, rows) {
  const now = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard #sbWarn [data-ww]')].map(e => ({ sev: ['hard', 'adv', 'note'].find(c => e.classList.contains(c)), text: e.querySelector('.wln-t').textContent })))
  const want = rows.map(r => ({ sev: r.sev, text: r.prefix ? r.prefix + ' — ' + r.words : r.words }))
  if (JSON.stringify(now) !== JSON.stringify(want)) throw new Error('DRAWN ROWS NOT AS INTENDED\n' + JSON.stringify(now) + '\n' + JSON.stringify(want))
}
/** picture the board's warning list: phone = scroll the list up under the board's bar, clip from the top; desktop = the lit day chip to the right edge */
export async function shotList(w, file) {
  const page = w.page
  if (!w.phone) await page.mouse.move(5, 860)
  await neutral(w)
  const g = await page.evaluate(phone => {
    const box = document.querySelector('#schedBoard #sbWarn'), wh = box.querySelector('.wh')
    let s = box.parentElement
    while (s && !(s.scrollHeight > s.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    let barBottom = 0
    if (phone) {
      let e = document.elementFromPoint(201, 30)
      while (e && !(e.getBoundingClientRect().width >= 390 && e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().height < 200)) e = e.parentElement
      barBottom = e ? e.getBoundingClientRect().bottom : 80
      const d = wh.getBoundingClientRect().top - barBottom - 10
      if (s) s.scrollTop += d; else window.scrollBy(0, d)
    }
    const rows = [...box.querySelectorAll('.wln')].filter(e => e.offsetWidth && getComputedStyle(e).display !== 'none')
    const bottom = Math.max(...rows.map(e => e.getBoundingClientRect().bottom), wh.getBoundingClientRect().bottom)
    let x = 0
    if (!phone) {
      const chips = [...document.querySelectorAll('button, [role=button], a, div, span')].filter(e => e.offsetWidth && e.getBoundingClientRect().top < 70 && /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+$/.test((e.innerText || '').replace(/\s+/g, ' ').trim()))
      const outer = chips.filter(e => !chips.some(o => o !== e && o.contains(e)) )
      const c = outer[window.SBDAY]
      x = c ? Math.max(0, c.getBoundingClientRect().left - 10) : 1100
      if (!c) console.log('WW: no day chip found', chips.length)
    }
    // the floating note at the foot of the screen says the same words: hide it if it falls inside the picture
    const hidden = []
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e)
      if (cs.position !== 'fixed' || !e.offsetWidth || box.contains(e)) continue
      const r = e.getBoundingClientRect()
      if (r.top < bottom + 10 && r.bottom > 0 && r.right > x && / — /.test(e.innerText || '') && r.height < 120) { e.style.display = 'none'; hidden.push((e.innerText || '').slice(0, 80)) }
    }
    return { x, bottom, barBottom, hidden, vh: innerHeight, vw: innerWidth, boxOver: box.scrollHeight > box.clientHeight + 2 }
  }, w.phone)
  await sleep(250)
  const h = Math.ceil(g.bottom + 10)
  if (h > g.vh || g.boxOver) say('TOO TALL', file, h, '>', g.vh, 'list scrolls inside itself:', g.boxOver)
  const clip = { x: g.x, y: 0, width: g.vw - g.x, height: Math.min(h, g.vh) }
  if (g.hidden.length) say('hid floating note(s) for', file, g.hidden)
  await page.screenshot({ path: `${OUT}/${file}`, clip })
  return { clip, hiddenNotes: g.hidden, tooTall: h > g.vh || g.boxOver }
}
/** desktop: drag the app's own "Drag to resize the checks panel" grip down, so the list shows whole */
export async function growWarn(w, toY = 850) {
  const g = w.page.locator('#schedBoard .sb-wsplit:visible').first()
  if (!(await g.count())) return 'no grip'
  const b = await g.boundingBox()
  await w.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await w.page.mouse.down(); await w.page.mouse.move(b.x + b.width / 2, toY, { steps: 12 }); await w.page.mouse.up()
  await sleep(400)
  return w.page.evaluate(() => Math.round(document.querySelector('#schedBoard #sbWarn').getBoundingClientRect().height))
}
/** tap a neutral spot so no control keeps a hover/focus ring */
export async function neutral(w) {
  await w.page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
}
