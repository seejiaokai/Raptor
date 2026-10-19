/* Walker A's driver for the [STANDBY-FLIES] FULL check (19 Oct 26). Own copy. Desktop 1440x900, mouse. */
import { existsSync, mkdirSync, appendFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

export const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.HP_URL || 'http://localhost:4322'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/walk/A')
import { basename } from 'node:path'
export const LOG = resolve(HERE, 'sf-A-log-' + basename(process.argv[1] || 'x', '.mjs') + '.txt')
mkdirSync(OUT, { recursive: true }); writeFileSync(LOG, '')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function launch() { return chromium.launch({ ...LAUNCH }) }
export const errors = []

export async function ctxOpen(browser, tag, { dark = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light' })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${tag} PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await sleep(500)
  return { ctx, p }
}
export async function login(p) {
  if (await p.locator('#luser').isVisible().catch(() => false)) {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' }).catch(() => {})
  await sleep(600)
}

export const rows = []
export function rec(sc, step, expected, seen, verdict, pic = '') {
  const r = { sc, step, expected, seen: typeof seen === 'string' ? seen : JSON.stringify(seen), verdict, pic }
  rows.push(r)
  const line = `[${sc}] ${verdict} | ${step} | exp: ${expected} | seen: ${r.seen} | ${pic}`
  console.log(line)
  appendFileSync(LOG, line + '\n')
  return r
}

export const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await sleep(700) }
export const shot = async (p, name, locator) => {
  const f = `${OUT}/${name}.png`
  if (locator) await locator.screenshot({ path: f }); else await p.screenshot({ path: f })
  return `A/${name}.png`
}

export async function openBoard(p, di) {
  if (await p.locator('#sbDone').first().isVisible().catch(() => false)) { await p.locator('#sbDone').first().click().catch(() => {}); await sleep(400) }
  await go(p, 'editsched')
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
}
export async function closeBoard(p) {
  if (await p.locator('#sbDone').first().isVisible().catch(() => false)) { await p.locator('#sbDone').first().click(); await sleep(600) }
}
export const bf = (di, gi, li, f) => `#schedBoard [data-bfld="ff:${di}.${gi}.${li}.${f}"]`

/** Real typing into a board box: click, select all, type, blur. */
export async function bType(p, sel, value) {
  const el = p.locator(sel + ':visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+a'); await p.keyboard.press('Backspace')
  if (String(value) !== '') await p.keyboard.type(String(value), { delay: 8 })
  await p.keyboard.press('Enter'); await sleep(120); await leaveBox(p)
  await el.blur().catch(() => {}); await sleep(350)
}

/** Add a standby wave of a kind to day di as admin on Edit Schedule (set-up helper through the app's own function). */
export async function addStandby(p, di, kind) {
  await go(p, 'editsched')
  return p.evaluate(([di, kind]) => { window.addWave(di, kind); return window.DAYS[di].waves.map((w, i) => [i, w.kind]).filter(x => x[1] === kind).pop()[0] }, [di, kind])
}
/** Seat crew via fillSlot (SET-UP ONLY, not the thing under test). lis: formation indexes; ais: aircraft idx list */
export async function seat(p, di, gi, spec, skip = []) {
  return p.evaluate(([di, gi, spec, skip]) => {
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special && !skip.includes(i))
    const used = new Set(window.__used || [])
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    const out = []
    for (const [li, ai] of spec) {
      const a = pick('FCP'), b = pick('RCP')
      window.fillSlot(`${di}.${gi}.${li}.${ai}.p`, a); window.fillSlot(`${di}.${gi}.${li}.${ai}.w`, b)
      out.push([li, ai, window.PEOPLE[a].cs, window.PEOPLE[b].cs])
    }
    window.__used = [...used]
    return out
  }, [di, gi, spec, skip])
}
export const wave = (p, di, gi) => p.evaluate(([di, gi]) => {
  const w = window.DAYS[di].waves[gi]
  return { kind: w.kind, label: w.label, sa: w.sa, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, rl: f.rl, str: f.str, end: f.end, flies: f.flies, ac: f.aircraft.map(a => ({ p: a.p, w: a.w, role: a.role, flies: a.flies, cx: a.cx, fly: a.fly })) })) }
}, [di, gi])

export async function bPublish(p, di) {
  const sels = p.locator(`#schedBoard [data-signday="${di}"]:visible`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && !/^—/.test(v)))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await sleep(200)
  }
  await sleep(400)
  const beak = p.locator(`#schedBoard [data-beak="${di}"]:visible, #schedBoard [data-alpub="${di}"]:visible`).first()
  if (!(await beak.count())) return { published: false, why: 'no publish button', n }
  const lab0 = (await beak.innerText()).trim()
  if (await beak.isDisabled()) return { published: false, why: lab0, n }
  await beak.click(); await sleep(900)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
  return { published: true, label: lab0, chip: await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
}
export const status = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b) return null
  return {
    chip: (b.querySelector('.verchip') || {}).innerText || '',
    pend: [...b.querySelectorAll('[data-alcount], .alchip, [data-histbtn], [data-dayhist]')].map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 4),
    signs: [...b.querySelectorAll('[data-signday]')].filter(e => e.offsetParent).map(e => e.value),
    beak: (b.querySelector('[data-beak]') || b.querySelector('[data-alpub]') || {}).innerText || '',
  }
})
export const warns = p => p.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 30) : [] })
export const oilOn = async p => { if (!(await p.locator('#schedBoard [data-oilitem]').count())) { await p.locator('#sbOil').click(); await sleep(800) } }
export const oilOff = async p => { if (await p.locator('#schedBoard [data-oilitem]').count()) { await p.locator('#sbOil').click(); await sleep(600) } }
export const oilRead = async p => { await oilOn(p); const r = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())); await oilOff(p); return r }

/** the chips for a shift: for each data-sarole badge, the .saflies chips sharing its container (a button = dashed or lit button; on = lit) */
export const chips = (p, di, gi, li, root = '#schedBoard') => p.evaluate(([di, gi, li, root]) => {
  const out = []
  for (const b of document.querySelectorAll(`${root} [data-sarole^="${di}.${gi}.${li}."]`)) {
    if (b.offsetParent === null) continue
    const k = b.getAttribute('data-sarole')
    const cs = [...(b.parentElement ? b.parentElement.querySelectorAll('.saflies') : [])].filter(e => e.offsetParent)
    out.push({ k, role: (b.innerText || '').trim(), badgeCls: b.className, badgeTitle: b.getAttribute('title') || '',
      chips: cs.map(e => ({ tag: e.tagName, txt: (e.innerText || '').trim(), on: e.classList.contains('on'), cls: e.className, title: e.getAttribute('title') || '', dis: !!e.disabled, aria: e.getAttribute('aria-label') || '', safly: e.getAttribute('data-safly'), tab: e.tabIndex })) })
  }
  return out
}, [di, gi, li, root])
export const summ = cs => cs.map(c => `${c.k.split('.').slice(2).join('.')}:${c.role}:` + (c.chips.length ? c.chips.map(x => `${x.tag === 'BUTTON' ? 'B' : x.tag}${x.on ? '*LIT*' : '-dash-'}${x.dis ? '(dis)' : ''}`).join('') : 'nochip')).join('  ')
/** the day heading badge on the week ("X n / m") and the changes button of the day */
export const dayBadge = (p, di, root = '#eWeek') => p.evaluate(([di, root]) => { const d = document.querySelector(`${root} .day[data-day="${di}"]`); if (!d) return null; return { badge: ((d.querySelector('.badge') || {}).textContent || '').replace(/\s+/g, ' ').trim(), badgeTitle: (d.querySelector('.badge') || {}).title || '', chg: (d.querySelector('[data-chgday]') || {}).innerText || '', ver: (d.querySelector('.verchip') || {}).innerText || '' } }, [di, root])
/** press a Flies chip by its row key with a real mouse press */
export async function pressChip(p, key) {
  const el = p.locator(`#schedBoard [data-safly="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await el.click(); await sleep(450)
}
export async function undo(p) { await p.locator('#sbUndo').click(); await sleep(600) }
export async function redo(p) { await p.locator('#sbRedo').click(); await sleep(600) }

export async function reload(p) {
  await p.reload(); await sleep(800)
  await login(p)
}
export const sbShot = async (p, name) => { const el = p.locator('#schedBoard .sb-go').first(); return shot(p, name, el) }
/** picture of one wave's whole block on the board */
export const waveShot = async (p, di, gi, name, root = '#schedBoard') => {
  const loc = p.locator(`${root} .sb-go`, { has: p.locator(`[data-slot="${di}.${gi}.0.0.p"]`) }).first()
  await loc.scrollIntoViewIfNeeded(); await sleep(200)
  return shot(p, name, loc)
}
/** leave a text box the way a person does: a plain press on the board's title text, away from every control */
export async function leaveBox(p) {
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur && a !== document.body) a.blur() })
  await p.mouse.click(250, 26); await sleep(400)
}
export async function toTop(p) {
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('#schedBoard, #schedBoard .sb-main, #schedBoard .sb-boardwrap').forEach(e => { e.scrollTop = 0 }) }); await sleep(250)
}
/** the day's pending-change reading on the open board: every short text mentioning pending / change / AL, with the sign-off strip */
export const pending = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b) return null
  const t = [...b.querySelectorAll('button, span, div')].filter(e => e.offsetParent && e.children.length === 0 && /pending|change|amend|unsigned|SIGNED|to go out|publish/i.test(e.innerText || '') && (e.innerText || '').length < 60).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
  return [...new Set(t)].slice(0, 12)
})
export async function topShot(p, name) { await toTop(p); return shot(p, name) }
/** OIL Earn mode on, picture of the wave, the row texts, then off */
export async function oilShotWave(p, di, gi, name) {
  await oilOn(p)
  const pic = await shot(p, name, p.locator('#schedBoard .sb-go').first())
  const r = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()))
  const items = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => (e.getAttribute('data-oilitem') || '') + '=' + ((e.querySelector('input,button') || e).className.toString().slice(0, 30)) + ':' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40)).slice(0, 30))
  await oilOff(p)
  return { pic, r, items }
}
export async function viewIssued(p, label) {
  await toTop(p)
  await p.locator('#schedBoard .planselbtn, #schedBoard button', { hasText: /Live working copy|Original|AL\d/ }).first().click(); await sleep(500)
  await p.locator('div, button', { hasText: new RegExp('^' + label) }).filter({ hasText: /read-only/ }).last().click(); await sleep(900)
}
/** open the plan menu on the board and pick an entry: 'Original', 'AL1' (read-only looks) or 'live' (the working copy) */
export async function pickPlan(p, name) {
  await toTop(p)
  await p.locator('#schedBoard .planselbtn').first().click(); await sleep(500)
  if (name === 'live') { const l = p.locator('[data-plangolive]:visible').first(); if (await l.count()) { await l.click(); await sleep(1000); return 'ok' } }
  const ok = await p.evaluate(name => {
    const bs = [...document.querySelectorAll('button, [role=menuitem], .planopt, [data-planpick], [data-plan]')].filter(e => e.offsetParent)
    const hit = bs.find(e => { const t = (e.innerText || '').replace(/\s+/g, ' ').trim(); return name === 'live' ? /^Live working copy/.test(t) && /live now|differences/.test(t) : (t.startsWith(name) && /read-only/.test(t)) })
    if (!hit) return 'no entry ' + name + ' among: ' + bs.map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)).join(' / ').slice(0, 300)
    hit.click(); return 'ok'
  }, name)
  await sleep(1000)
  return ok
}
export const histText = async (p) => {
  await toTop(p)
  await p.locator('#schedBoard button', { hasText: /History/ }).first().click(); await sleep(700)
  const t = await p.evaluate(() => { const x = document.body.innerText; const i = x.indexOf('Changes ·'); return i >= 0 ? x.slice(i, i + 900).replace(/\s+/g, ' ') : null })
  return t
}
/** read-only (issued / member) look: the role badges and any Flies chips drawn, picture centred on the first badge */
export async function roLook(p, name, root = '#schedBoard') {
  const info = await p.evaluate(root => {
    const bs = [...document.querySelectorAll(`${root} .sarole`)].filter(e => e.offsetParent)
    return bs.map(b => { const c = b.parentElement ? [...b.parentElement.querySelectorAll('.saflies')].filter(e => e.offsetParent) : []
      return { role: (b.innerText || '').trim(), cls: b.className, chips: c.map(e => ({ tag: e.tagName, txt: (e.innerText || '').trim(), on: e.classList.contains('on'), title: e.getAttribute('title') || '', dis: !!e.disabled })) } })
  }, root)
  const first = p.locator(`${root} .sarole:visible`).first()
  if (await first.count()) { await first.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250) }
  const pic = await shot(p, name)
  return { info, pic, str: info.map(i => i.role + ':' + (i.chips.length ? i.chips.map(c => (c.tag === 'BUTTON' ? 'B' : c.tag) + (c.on ? '*LIT*' : '-dash-')).join('') : 'nochip')).join('  ') }
}
export const histTab = async (p, tabRe) => {
  const t = await histText(p)
  const tab = p.locator('[role=tab], button, .chgtab, [data-chgtab]', { hasText: tabRe }).filter({ hasText: /go out|All changes|New to you/ }).first()
  if (await tab.count()) { await tab.click(); await sleep(600) }
  return p.evaluate(() => { const x = document.body.innerText; const i = x.indexOf('Changes ·'); return i >= 0 ? x.slice(i, i + 1100).replace(/\s+/g, ' ') : null })
}
/** CX a row (or un-cancel it) through the real popup: the row's CX button, then "Cancel line" or "Un-cancel" */
export async function cxRow(p, di, gi, li, ai) {
  const el = p.locator(`#schedBoard [data-lcx="${di}.${gi}.${li}.${ai}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await el.click(); await sleep(500)
  const un = p.locator('#cxUn:visible')
  const mode = (await un.count()) ? 'un' : 'cx'
  if (mode === 'un') await un.click(); else await p.locator('#cxSave').click()
  await sleep(700)
  return mode
}
