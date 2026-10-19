// Walker B shared driver — one tap then typing replaces (D1080). VERSION 1
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/B')
mkdirSync(OUT, { recursive: true })
export const URL0 = 'http://localhost:4333/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const SIZES = { desktop: { w: 1440, h: 900, touch: false }, phone: { w: 402, h: 874, touch: true } }
export async function launch(size, who = 'ad') {
  const S = SIZES[size]
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.touch ? 2 : 1, isMobile: S.touch, hasTouch: S.touch, colorScheme: 'dark' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  await page.goto(URL0)
  const script = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean).join(','))
  console.log('served script:', script)
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.waitForTimeout(500)
  const api = { browser, ctx, page, errors, S, size, n: 0 }
  api.shot = async name => { const f = `${size}-${name}.png`; await page.screenshot({ path: join(OUT, f) }); console.log('  picture', f); return f }
  api.go = async p => { await page.evaluate(p => window.go(p), p); await page.waitForTimeout(500) }
  // press at the centre of a box: mouse on desktop, finger on a phone
  api.pressEl = async (loc, off) => {
    const h = typeof loc === 'string' ? page.locator(loc).first() : loc
    const b = await h.boundingBox(); if (!b) throw new Error('no box for press')
    const x = b.x + (off?.x ?? b.width / 2), y = b.y + (off?.y ?? b.height / 2)
    if (S.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
    await page.waitForTimeout(150)
  }
  api.val = async loc => (typeof loc === 'string' ? page.locator(loc).first() : loc).evaluate(e => e.value)
  api.active = () => page.evaluate(() => { const e = document.activeElement; return e ? (e.tagName + '#' + e.id + '.' + (e.className || '') + ' [' + (e.getAttribute('data-testid') || '') + ']') : null })
  api.tap = async loc => { const h = typeof loc === 'string' ? page.locator(loc).first() : loc; if (S.touch) await h.tap(); else await h.click(); await page.waitForTimeout(250) }
  api.close = async () => { await browser.close() }
  return api
}
export const log = (...a) => console.log(...a)
export const dumpInputs = page => page.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !/CUR CK|SKED CK|PLANNED BY|APPROVED BY/.test(e.getAttribute('aria-label')||'') && !/^(searchE|acc|admGuest)/.test(e.id) }).map(e => `${e.tagName} type=${e.type} id=${e.id} cls=${e.className} ph=${e.placeholder} val=${JSON.stringify(e.value)} testid=${e.getAttribute('data-testid')||''} aria=${e.getAttribute('aria-label')||''} name=${e.name||''}`))
export const dumpBtns = page => page.evaluate(() => [...document.querySelectorAll('button,[role=button],[data-testid]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => `${e.tagName} id=${e.id} cls=${String(e.className).slice(0,40)} testid=${e.getAttribute('data-testid')||''} txt=${(e.innerText||'').slice(0,30).replace(/\n/g,' ')}`))

// ---- the five steps for one box (D1080) ----
import { writeFileSync, appendFileSync } from 'node:fs'
export const RES = process.env.KBS_RES || 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-frosty-robinson-72dcd4/584b3e65-8cc1-4a99-baa6-1406c615a4d1/scratchpad/kbs-B-results.jsonl'
export const sel = (loc) => loc.evaluate(e => { let s = null, n = null; try { s = e.selectionStart; n = e.selectionEnd } catch {} return { s, e: n, len: e.value.length, type: e.type, cls: e.className } })
export const addedOk = (prior, v, d) => { for (let i = 0; i <= v.length - 1; i++) if (v[i] === d && v.slice(0, i) + v.slice(i + 1) === prior) return true; return false }
export async function runBox(A, spec) {
  const { page, size } = A
  const rows = []
  const L = () => spec.loc(A)
  const tag = `${spec.id}-${spec.slug || ''}`.replace(/-$/, '')
  const row = (step, did, expected, shown, result, pics, note) => { const r = { id: spec.id, box: spec.name, size, step, did, expected, shown, result, pics: pics || [], note: note || '' }; rows.push(r); appendFileSync(RES, JSON.stringify(r) + '\n'); console.log(`  [${spec.id} ${size} s${step}] ${result} — shown ${JSON.stringify(shown)}${note ? ' — ' + note : ''}`); return r }
  const reset = async () => {
    if (spec.ensure) await spec.ensure(A)
    const l = L()
    await l.evaluate(e => { e.scrollIntoView({ block: 'center' }) }); await page.waitForTimeout(250)
    await l.evaluate(e => e.blur()).catch(() => {})
    await l.fill(spec.prior)
    await l.evaluate(e => e.blur())
    await page.waitForTimeout(750)
    return await A.val(L())
  }
  const press = async () => { await L().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); await A.pressEl(L()) }
  const typeIt = async t => { await page.keyboard.type(t, { delay: 45 }); await page.waitForTimeout(120) }
  try {
    // 1 — one press, then type
    let p = await reset()
    await press()
    const afterPress = await sel(L())
    await typeIt(spec.typed)
    let v = await A.val(L())
    let pic = await A.shot(`${tag}-s1-typed`)
    const ok1 = spec.expect1 ? spec.expect1(v, p) : v === spec.typed
    row(1, `box held "${p}"; one ${A.S.touch ? 'finger tap' : 'mouse click'} on it, then typed "${spec.typed}"`, spec.expectText1 || `box holds only "${spec.typed}"`, v, ok1 ? 'PASS' : 'FAIL', [pic], `after the press the box's selection was ${afterPress.s}-${afterPress.e} of ${afterPress.len} chars`)
    // 2 — leave the box
    await page.keyboard.press('Tab'); await page.waitForTimeout(500)
    const left = spec.readAfter ? await spec.readAfter(A) : await A.val(L())
    const pic2 = await A.shot(`${tag}-s2-left`)
    const ok2 = spec.expect2 ? spec.expect2(left, v) : left === spec.expectLeave
    row(2, 'left the box with Tab', spec.expectText2 || `shows ${JSON.stringify(spec.expectLeave)}`, left, ok2 ? 'PASS' : 'FAIL', [pic2])
    if (spec.persist) {
      const pv = await spec.persist(A)
      const pic2b = await A.shot(`${tag}-s2-reopened`)
      const okp = spec.expectPersist ? spec.expectPersist(pv) : pv === spec.expectLeave
      row('2b', spec.persistDid || 'closed the window / reloaded and looked again', spec.expectTextPersist || `still ${JSON.stringify(spec.expectLeave)}`, pv, okp ? 'PASS' : 'FAIL', [pic2b])
    }
    if (spec.elsewhere) {
      p = await reset()
      await press(); await typeIt(spec.typed)
      await spec.elsewhere(A); await page.waitForTimeout(600)
      const l2 = spec.readAfter ? await spec.readAfter(A) : await A.val(L())
      const pic2c = await A.shot(`${tag}-s2c-left-by-press`)
      const ok2c = spec.expect2 ? spec.expect2(l2, spec.typed) : l2 === spec.expectLeave
      row('2c', 'typed again, then left the box by pressing elsewhere on the board (the Board title area)', spec.expectText2 || `shows ${JSON.stringify(spec.expectLeave)}`, l2, ok2c ? 'PASS' : 'FAIL', [pic2c])
    }
    // 3 — second press then a digit
    p = await reset()
    await press(); await page.waitForTimeout(700); await A.pressEl(L(), spec.secondOff)
    const sel3 = await sel(L())
    await typeIt('7')
    v = await A.val(L())
    pic = await A.shot(`${tag}-s3-second-press`)
    const ok3 = spec.add3 ? spec.add3(v, p) : addedOk(p, v, '7')
    row(3, `box held "${p}"; pressed once, waited 0.7s, pressed again, typed 7`, `"7" added at the caret, nothing replaced (${p.length + 1} chars, still holding "${p}")`, v, ok3 ? 'PASS' : 'FAIL', [pic], `selection after the 2nd press ${sel3.s}-${sel3.e} of ${sel3.len}`)
    // 4 — one press, then Backspace
    p = await reset()
    await press(); await page.keyboard.press('Backspace'); await page.waitForTimeout(150)
    v = await A.val(L())
    pic = await A.shot(`${tag}-s4-backspace`)
    row(4, `box held "${p}"; one press, then Backspace`, spec.expectText4 || 'box is empty', v, (spec.expect4 ? spec.expect4(v, p) : v === '') ? 'PASS' : 'FAIL', [pic])
    // 5 — Tab into the box
    p = await reset()
    if (!spec.noTab) {
      await L().evaluate(PREVFN)
      await page.keyboard.press('Tab'); await page.waitForTimeout(250)
      const act = await page.evaluate(() => { const e = document.activeElement; return e && (e.tagName + '.' + e.className + '[' + (e.getAttribute('aria-label') || e.id || e.getAttribute('data-testid') || '') + ']') })
      const isBox = await L().evaluate(e => e === document.activeElement)
      if (!isBox) row(5, 'Tab from the box before it', 'focus lands in the box', act, 'NOT REACHED', [], 'the Tab did not land in the box (script path); focus is on ' + act)
      else {
        const s5 = await sel(L())
        await typeIt('7')
        v = await A.val(L())
        pic = await A.shot(`${tag}-s5-tab-in`)
        const ok5 = addedOk(p, v, '7')
        row(5, `box held "${p}"; Tab into it from the box before it, typed 7`, `"7" added to "${p}" (Tab arms nothing)`, v, ok5 ? 'PASS' : 'FAIL', [pic], `after the Tab the browser's selection was ${s5.s}-${s5.e} of ${s5.len} chars (a Tab into a text box selects its content natively)`)
        // 5b — the same, but the native select-all is collapsed first (ArrowRight): does the app itself arm anything on a Tab?
        p = await reset()
        await L().evaluate(PREVFN)
        await page.keyboard.press('Tab'); await page.waitForTimeout(250)
        await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100)
        await typeIt('7')
        v = await A.val(L())
        pic = await A.shot(`${tag}-s5b-tab-in-collapsed`)
        row('5b', `box held "${p}"; Tab into it, ArrowRight (collapses the browser's own select-all), typed 7`, `"7" added to "${p}"`, v, addedOk(p, v, '7') ? 'PASS' : 'FAIL', [pic])
      }
    } else row(5, 'Tab into the box', 'added', '', 'NOT REACHED', [], 'no box before it to Tab from')
    // leave things tidy
  } catch (e) {
    row('x', 'script error', '', String(e).slice(0, 200), 'NOT REACHED', [], 'script failed: ' + String(e).slice(0, 300))
  }
  return rows
}

// a CONTROL: a plain box NOT on the arming list, Tabbed into and typed in — shows what the browser itself does
export async function runControl(A, c) {
  const { page, size } = A
  const L = () => c.loc(A)
  try {
    if (c.ensure) await c.ensure(A)
    await L().evaluate(e => { e.scrollIntoView({ block: 'center' }) }); await page.waitForTimeout(250)
    await L().fill(c.prior); await L().evaluate(e => e.blur()); await page.waitForTimeout(500)
    const p = await A.val(L())
    await L().evaluate(PREVFN)
    await page.keyboard.press('Tab'); await page.waitForTimeout(250)
    const isBox = await L().evaluate(e => e === document.activeElement)
    const s = await sel(L())
    await page.keyboard.type('7', { delay: 45 }); await page.waitForTimeout(100)
    const v = await A.val(L())
    const pic = await A.shot(`${c.id}-control-tab-in`)
    const r = { id: c.id + '-control', box: c.name, size, step: 'C', did: `CONTROL (a box not on the list): held "${p}"; Tab into it, typed 7`, expected: 'what the browser does by itself', shown: v, result: isBox ? 'INFO' : 'NOT REACHED', pics: [pic], note: `selection after the Tab ${s.s}-${s.e} of ${s.len}` }
    appendFileSync(RES, JSON.stringify(r) + '\n'); console.log(`  [${r.id} ${size}] ${r.result} — shown ${JSON.stringify(v)} — ${r.note}`)
  } catch (e) { console.log('control failed', String(e).slice(0, 200)) }
}

export const prevFocusable = loc => loc.locator('xpath=preceding::*[self::input or self::button or self::select or self::textarea][1]')

// focus the tabbable element that comes just before the box in the page's tab order (the box before it)
const PREVFN = box => { const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' }; const all = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => !e.disabled && e.tabIndex >= 0 && vis(e) && e.type !== 'hidden'); const i = all.indexOf(box); if (i > 0) { all[i - 1].focus(); return all[i - 1].tagName + '.' + all[i - 1].className } return null }
