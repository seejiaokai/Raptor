// THE WALK of the whole-app words pass, round 1 (owner D938, D940, 16 Oct 26). Drives the BUILT app at a desktop and a
// phone (by touch), as the admin and as a member, and asserts the RIGHT behaviour (a PASS is correct, so a later run is
// the re-walk): the words he approved gone or changed on Edit Schedule, View-only Sched and the Scheduler Board; and the
// controls those words described still working when pressed — the issues bar opens and closes, Personal Inputs and
// Available crew fold and unfold by their headings. Pictures after each step.
//
//   node scripts/handpass/words-r1-walk.mjs [out dir]        (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r1-walk v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-16-words-pass/walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let n = 0, bad = 0
const errs = []
const say = (ok, name, seen) => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${seen !== undefined ? ' — saw: ' + String(seen).slice(0, 160) : ''}`) }

const GONE = ['tap to review', 'tap to collapse', 'press a card to edit', 'type in place', 'clear a time for all day',
  'press the type to change it', 'tap header to hide', 'show ⌄', 'hide ⌃', 'by wave · close', 'shown at the head of the day',
  'squadron-wide — affects all', 'go times, formations, crews', 'SDO / SXO / ops desk', 'AMT and OFT rows', 'briefs, reviews, admin',
  'submitted by aircrew', 'leave, medical and overseas duty —', 'what SANS aircrew are offering', 'publish a day, edit it',
  'accepted again — delete']
const NOTE = 'A removed input flags nothing until accepted again. Delete it here if it should go entirely.'
/* the words a person SEES: text inside boxes wider than 1px (walk-scripts.md §4), within a scope */
const seen = (p, scope) => p.evaluate(scope => {
  const root = document.querySelector(scope); if (!root) return null
  const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let t; while ((t = w.nextNode())) { const e = t.parentElement; if (!e) continue; const r = e.getBoundingClientRect(); if (r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden') out.push(t.textContent) }
  return out.join(' ').replace(/\s+/g, ' ')
}, scope)
const noneGone = (txt) => GONE.filter(g => txt.includes(g))
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })

async function open(viewport, touch, u, pw) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 3 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${u}-${viewport.width}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', u); await page.fill('#lpass', pw)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  return { ctx, page }
}

for (const sz of [{ tag: 'desk', viewport: { width: 1440, height: 900 } }, { tag: 'phone', viewport: { width: 390, height: 844 }, touch: true }]) {
  const T = sz.tag, touch = !!sz.touch
  /* ── the admin: Edit Schedule's Monday ── */
  {
    const { ctx, page } = await open(sz.viewport, touch, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
    const D = '#eWeek .day[data-day="0"]'
    let txt = await seen(page, D)
    say(txt && txt.includes('Personal Inputs') && txt.includes('Unavailable'), `${T} admin: Edit Schedule's Monday is drawn`, txt && txt.slice(0, 80))
    say(txt && !noneGone(txt).length, `${T} admin: none of the round's old words on Monday (folded)`, noneGone(txt || '').join(' | ') || 'none')
    const bar = page.locator(`${D} [data-daywarn]`)
    say(/issue/.test(await bar.innerText()) && /▼/.test(await bar.innerText()), `${T} admin: the issues bar says its count and ▼`, await bar.innerText())
    await bar.scrollIntoViewIfNeeded(); await press(touch, bar); await page.waitForTimeout(300)
    say(/▲/.test(await bar.innerText()) && await page.locator(`${D} .dwbox.open`).count() === 1, `${T} admin: pressing the bar opens the day's list (▲)`, await bar.innerText())
    await shot(page, `${T}-admin-week-bar-open`)
    await press(touch, bar); await page.waitForTimeout(300)
    say(/▼/.test(await bar.innerText()), `${T} admin: pressing it again closes it (▼)`, await bar.innerText())
    /* Personal Inputs: folded shows its count and ⌄; its heading opens it to ⌃, and folds it again */
    const pi = page.locator(`${D} [data-pitog="0"]`).first()
    const folded = (await pi.innerText()).replace(/\s+/g, ' ')
    say(/\d+ inputs?( · \d+ on programme)? ⌄/.test(folded) && !/show/.test(folded), `${T} admin: folded Personal Inputs shows its count and ⌄, no "show"`, folded)
    await pi.scrollIntoViewIfNeeded(); await press(touch, pi); await page.waitForTimeout(350)
    const openTxt = (await page.locator(`${D} [data-pitog="0"]`).first().innerText()).replace(/\s+/g, ' ')
    say(/⌃/.test(openTxt) && !/type in place|hide/.test(openTxt), `${T} admin: pressing it opens Personal Inputs; its heading keeps ⌃ only`, openTxt)
    const note = await page.locator(`${D} .pl-inpnote`).innerText().catch(() => null)
    say(note === NOTE, `${T} admin: the removed-input note reads with a full stop`, note)
    txt = await seen(page, D)
    say(!noneGone(txt).length, `${T} admin: none of the old words with Personal Inputs open`, noneGone(txt).join(' | ') || 'none')
    await shot(page, `${T}-admin-week-pi-open`)
    await press(touch, page.locator(`${D} [data-pitog="0"]`).first()); await page.waitForTimeout(350)
    say(/⌄/.test(await page.locator(`${D} [data-pitog="0"]`).first().innerText()), `${T} admin: pressing the heading again folds it`, await page.locator(`${D} [data-pitog="0"]`).first().innerText())
    /* Available crew: open shows ⌃ only; pressing the heading shuts it to its counts and ⌄ */
    const av = page.locator(`${D} [data-avtog="0"]`)
    if (await av.count()) {
      const avOpen = (await av.innerText()).replace(/\s+/g, ' ')
      await av.scrollIntoViewIfNeeded(); await press(touch, av); await page.waitForTimeout(350)
      const avShut = (await page.locator(`${D} [data-avtog="0"]`).innerText()).replace(/\s+/g, ' ')
      say(/⌃$/.test(avOpen.trim()) && !/by wave|close/.test(avOpen) && /all day.*⌄/i.test(avShut), `${T} admin: Available crew shows ⌃ open, folds to its counts and ⌄`, `${avOpen} → ${avShut}`)
      await press(touch, page.locator(`${D} [data-avtog="0"]`)); await page.waitForTimeout(300)
    } else say(false, `${T} admin: Available crew's heading is there`, 'missing')
    /* the Amendments box (desktop only — the phone's Edit Schedule has none) */
    const al = page.locator('.al-none')
    if (T === 'desk') say((await al.innerText().catch(() => null)) === 'No amendments published yet.', `${T} admin: the empty Amendments box says only "No amendments published yet."`, await al.innerText().catch(() => 'missing'))
    else say(!(await al.isVisible().catch(() => false)), `${T} admin: no Amendments box on a phone (as before)`, await al.count())
    await page.evaluate(() => scrollTo(0, 0)); await shot(page, `${T}-admin-week-head`)

    /* ── the Scheduler Board's Monday ── */
    await page.evaluate(() => scrollTo(0, 0))
    await press(touch, page.locator('#eWeek [data-sbday="0"]').first())
    await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(700)
    txt = await seen(page, '#schedBoard')
    say(txt && /Overall notes/i.test(txt) && /Unavailable/i.test(txt), `${T} admin: the board's Monday is drawn`, txt && txt.slice(0, 80))
    say(txt && !noneGone(txt).length, `${T} admin: none of the round's old words on the board (folded)`, noneGone(txt || '').join(' | ') || 'none')
    const subs = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-ph > .sub')].filter(e => e.getBoundingClientRect().width > 1).map(e => e.textContent.trim()))
    say(subs.every(s => /^(\d+ inputs?( · \d+ on programme)? ⌄|⌃)$/.test(s)), `${T} admin: a panel name carries no subtitle — only the fold's count or caret`, JSON.stringify(subs))
    /* the board's issues bar folds on a PHONE only — on a desktop its list is always open and the bar is inert (the
       stylesheet's .sbw-car note, interactions.ts's isPhone() gate), so there the check is that the list shows */
    const wh = page.locator('#schedBoard [data-sbwtog]')
    if (touch) {
      await press(touch, wh); await page.waitForTimeout(300)
      say(await page.locator('#schedBoard .sbwrap.open').count() === 1 && /▾/.test(await wh.innerText()), `${T} admin: pressing the board's issues bar opens it (▾)`, await wh.innerText())
      await shot(page, `${T}-admin-board-bar-open`)
      await press(touch, page.locator('#schedBoard [data-sbwtog]')); await page.waitForTimeout(300)
    } else {
      const lines = await page.locator('#schedBoard .sb-warn .wln').evaluateAll(ls => ls.filter(l => l.getBoundingClientRect().width > 1).length)
      say(lines > 0 && /issue/.test(await wh.innerText()), `${T} admin: the board's issues list shows under its bar, as always on a desktop`, `${lines} lines; bar: ${await wh.innerText()}`)
      await shot(page, `${T}-admin-board-bar`)
    }
    const bpi = page.locator('#schedBoard [data-pitog="0"]')
    await bpi.scrollIntoViewIfNeeded(); await press(touch, bpi); await page.waitForTimeout(400)
    const bOpen = (await page.locator('#schedBoard [data-pitog="0"]').innerText()).replace(/\s+/g, ' ')
    const bNote = await page.locator('#schedBoard .sb-pinote').innerText().catch(() => null)
    say(/⌃/.test(bOpen) && bNote === NOTE, `${T} admin: the board's Personal Inputs opens by its heading — ⌃, and the note with its full stop`, `${bOpen} / ${bNote}`)
    await shot(page, `${T}-admin-board-pi-open`)
    await press(touch, page.locator('#schedBoard [data-pitog="0"]')); await page.waitForTimeout(400)
    say(/⌄/.test(await page.locator('#schedBoard [data-pitog="0"]').innerText()), `${T} admin: pressing it again folds it to its count`, await page.locator('#schedBoard [data-pitog="0"]').innerText())
    await ctx.close()
  }
  /* ── the member: View-only Sched (the issues bar is drawn for him too) ── */
  {
    const { ctx, page } = await open(sz.viewport, touch, 'us', 'us')
    await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(600)
    const D = '#vWeek .day[data-day="0"]'
    const txt = await seen(page, D)
    say(txt && !noneGone(txt).length, `${T} member: none of the round's old words on View-only Sched's Monday`, noneGone(txt || '').join(' | ') || 'none')
    const bar = page.locator(`${D} [data-daywarn]`)
    if (await bar.count()) {
      await bar.scrollIntoViewIfNeeded(); await press(touch, bar); await page.waitForTimeout(300)
      say(/▲/.test(await bar.innerText()), `${T} member: the issues bar still opens by a press (▲)`, await bar.innerText())
      await shot(page, `${T}-member-view-bar-open`)
    } else say(false, `${T} member: the issues bar is drawn on Monday`, 'missing')
    await ctx.close()
  }
}
console.log(`\n${n - bad} / ${n} PASS`)
console.log('errors:', errs.length); for (const e of errs.slice(0, 20)) console.log('  ' + e)
await browser.close()
process.exit(bad ? 1 : 0)
