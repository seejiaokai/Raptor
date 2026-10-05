/* The Codex stack check, round 3 (6 Oct 26) — the walk of what his answers unlocked and his own find:
     D598 [ROLE-QUESTION-SECOND]  two Blue/Red questions stand together, each under its own formation
     D599                          on the week a question waits on its day; on the board a day change ends it (as built)
     D597 [TAB-DAY-END]            Tab from a day's last box with no button below keeps the caret there
     [PUCK-DOT-ZOOM]               the dotted crew-rest ring, wherever a puck draws it (the pictures at each screen
                                   scaling are zoom-dot.mjs's; here: every surface draws the ring from the one rule)
   Every step is an assertion of the RIGHT behaviour, so a re-run is the re-walk. Real presses and typing; the probe
   bridge is only READ (what was saved).
   Run:  HP_URL=http://localhost:4241 HP_SHOTS=docs/img/handpass/2026-10-06-codex-stack-r3 node scripts/handpass/stk3-walk.mjs */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
const SHOTS = process.env.HP_SHOTS || 'docs/img/handpass/2026-10-06-codex-stack-r3'
mkdirSync(SHOTS, { recursive: true })

const rows = []
const errors = []
const row = (size, id, what, pass, note = '') => { rows.push({ size, id, what, pass: pass ? 'PASS' : 'FAIL', note }); console.log(`${pass ? 'PASS' : 'FAIL'} ${size} ${id} ${what}${note ? ' — ' + note : ''}`) }

async function open(browser, size) {
  const phone = size === 'phone'
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`${size}: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`${size}: PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${size}: HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  return { ctx, page, phone }
}
/* changing page is not what is under test: the app's own page switch, as the browser tests use it */
const nav = async (page, phone, to) => {
  await page.evaluate(p => window.go(p), to); await page.waitForFunction(p => window.CURPAGE === p, to); await page.waitForTimeout(350)
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` })
const labels = page => page.evaluate(() => [...document.querySelectorAll('.mission-role-question')].map(n => `${n.getAttribute('aria-label')} @ ${n.previousElementSibling?.getAttribute('data-role-formation') ? 'own formation' : 'ELSEWHERE'} day ${n.previousElementSibling?.getAttribute('data-role-day')}`))
/* type into a week text box as a person does: click, select all, type, then leave it by Tab */
const typeIn = async (page, sel, text) => {
  const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await el.click()
  await page.keyboard.press('Control+A'); await page.keyboard.type(text); await page.keyboard.press('Tab'); await page.waitForTimeout(150)
}
const sig = page => page.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? a.tagName + JSON.stringify({ ...a.dataset }) : null })
const TYPING = '[data-txt],[data-inp],[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const lastBox = async (page, surface) => {
  const all = await page.locator(surface).locator(TYPING).elementHandles(); let last = null
  for (const el of all) if (await el.isVisible() && await el.evaluate(e => !e.closest('[data-role-ui],[data-role-remarks],.pv-frozen,[role="dialog"]') && (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'))) last = el
  return last
}

const browser = await chromium.launch({ headless: true, ...launchOptions })
for (const size of ['desktop', 'phone']) {
  const { ctx, page, phone } = await open(browser, size)
  try {
    /* ---------- tracking On, by the Logic page's own switch ---------- */
    await nav(page, phone, 'logic')
    await page.locator('#lgEdit').click(); await page.locator('#lgMissionMix').check()
    row(size, 'R3-00', 'Logic: "Track Blue/Red sorties" turns On', await page.locator('#lgMissionMix').isChecked())
    await nav(page, phone, 'editsched')
    await page.waitForSelector('#eWeek .day')
    const f = await page.evaluate(() => window.DAYS[0].waves[0].formations.slice(0, 2).map(x => ({ cs: x.cs, rid: x.rid })))

    /* ---------- D598 on Edit Schedule's week ---------- */
    const wk = '#eWeek .day[data-day="0"]'
    await typeIn(page, `${wk} [data-txt="fr:0.0.0.0"]`, 'DS FOR EAGLE')
    let l = await labels(page)
    row(size, 'R3-01', 'week: a DS cue typed on the first formation asks Blue/Red under that formation', l.length === 1 && l[0].includes(f[0].cs) && l[0].includes('own formation'), l.join(' | '))
    await typeIn(page, `${wk} [data-txt="fr:0.0.1.0"]`, 'RED FROM VIPER')
    l = await labels(page)
    row(size, 'R3-02', 'week: a cue typed on a SECOND formation opens its question and the first one stays — both, each under its own formation (D598)', l.length === 2 && l.some(x => x.includes(f[0].cs)) && l.some(x => x.includes(f[1].cs)) && l.every(x => x.includes('own formation')), l.join(' | '))
    await page.locator('.mission-role-question').first().scrollIntoViewIfNeeded(); await shot(page, `${size}-01-week-two-questions`)
    /* an unrelated edit on the day keeps both (D535) */
    await typeIn(page, `${wk} [data-txt="ff:0.0.0.to"]`, '0845')
    row(size, 'R3-03', 'week: an unrelated edit (a take-off) leaves both questions on screen (D535)', (await labels(page)).length === 2)
    /* D599: the week — go to another day and come back; both wait */
    if (phone) { await page.locator('#eWeek').evaluate(e => { e.scrollLeft = e.scrollWidth / 7 * 2 }); await page.waitForTimeout(400); await page.locator('#eWeek').evaluate(e => { e.scrollLeft = 0 }); await page.waitForTimeout(400) }
    else { await page.locator('#eWeek .day[data-day="2"] [data-txt]').first().click(); await page.waitForTimeout(200) }
    row(size, 'R3-04', `week: after ${phone ? 'swiping to Wednesday and back' : 'clicking into Wednesday'} the questions still wait on Monday (D599)`, (await labels(page)).length === 2)
    /* answer the second: Red. The first stays. */
    const q = cs => page.locator(`.mission-role-question[aria-label="Mission role for ${cs}"]`)
    await q(f[1].cs).locator('[data-role-side="red"]').click(); await page.waitForTimeout(200)
    l = await labels(page)
    const savedRole = await page.evaluate(() => { const c = (window.lastEnvelope().changes || []).filter(x => x.collection === 'insights.role'); return c.length ? JSON.stringify(c.map(x => (x.after || x.value || {}).side || x.op || 'written')) : 'NOT SAVED' })
    row(size, 'R3-05', 'week: Red on the second formation\'s question answers THAT formation; the first one\'s question is untouched', l.length === 1 && l[0].includes(f[0].cs) && savedRole !== 'NOT SAVED', `${l.join(' | ')} · the answer was saved: ${savedRole}`)
    await shot(page, `${size}-02-week-one-answered`)
    await q(f[0].cs).locator('[data-role-side="later"]').click(); await page.waitForTimeout(200)
    row(size, 'R3-06', 'week: Later on the first formation\'s question removes it; nothing is left open', (await labels(page)).length === 0)

    /* ---------- D598 and D535 on the Scheduler Board ---------- */
    await page.locator('#eWeek [data-sbday="0"]').first().click(); await page.waitForSelector('#schedBoard', { state: 'visible' })
    const bf = n => page.locator(`#sbBoard [data-bfld="fr:0.0.${n}.0"]:visible`).first()
    await bf(0).scrollIntoViewIfNeeded(); await bf(0).fill('DS FOR RU 2'); await bf(0).press('Tab'); await page.waitForTimeout(200)
    await bf(1).scrollIntoViewIfNeeded(); await bf(1).fill('RED FROM VIPER 2'); await bf(1).press('Tab'); await page.waitForTimeout(200)
    l = await labels(page)
    row(size, 'R3-07', 'board: two cues typed one after the other leave TWO questions, each under its own formation (D598)', l.length === 2 && l.every(x => x.includes('own formation')), l.join(' | '))
    await page.locator('.mission-role-question').first().scrollIntoViewIfNeeded(); await shot(page, `${size}-03-board-two-questions`)
    /* the Choose button never doubles a formation whose question is open */
    await bf(0).click(); await page.waitForTimeout(150)
    row(size, 'R3-08', 'board: selecting the Remarks of a formation whose question is open draws no second button for it', await page.locator('.mission-role-action').count() === 0 && (await labels(page)).length === 2)
    /* the board: moving to another day ends them (D535, D599) */
    if (phone) await page.locator('#sbNextDay').click(); else await page.locator('#sbDays [data-sbtab="1"]').click()
    await page.waitForTimeout(350)
    const goneOnDayChange = (await labels(page)).length === 0
    if (phone) await page.locator('#sbPrevDay').click(); else await page.locator('#sbDays [data-sbtab="0"]').click()
    await page.waitForTimeout(350)
    row(size, 'R3-09', 'board: stepping to Tuesday ends both open questions, and they do not come back on Monday (D535; D599 leaves the board as it was)', goneOnDayChange && (await labels(page)).length === 0)

    /* ---------- D597 on the board ---------- */
    const bl = await lastBox(page, '#sbBoard'); await bl.scrollIntoViewIfNeeded(); await bl.focus(); const bat = await sig(page)
    await page.keyboard.press('Tab'); await page.waitForTimeout(150)
    const bnow = await sig(page)
    if (phone) row(size, 'R3-10', 'phone board: Tab from the last text box keeps the caret in it (no button follows it — D597)', bnow === bat, String(bnow))
    else row(size, 'R3-10', 'desktop board: Tab from the last text box goes on to the next control, inside the board (D553, unchanged)', bnow !== bat && await page.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body && !!a.closest('#schedBoard') }), String(bnow))
    await shot(page, `${size}-04-board-last-box-tab`)
    await page.locator('#sbDone').click(); await page.waitForSelector('#schedBoard', { state: 'hidden' })

    /* ---------- D597 on the week ---------- */
    const last = await lastBox(page, wk); await last.scrollIntoViewIfNeeded(); await last.click(); const at = await sig(page)
    const pan = await page.locator('#eWeek').evaluate(e => e.scrollLeft)
    /* Control+End, not End: on a phone the remark wraps, and End stops at the end of its first LINE */
    await page.keyboard.press('Control+End'); await page.keyboard.type(' R3'); await page.keyboard.press('Tab'); await page.waitForTimeout(200)
    const stayed = await sig(page)
    const saved = await page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS]).includes(' R3'))
    row(size, 'R3-11', 'week: Tab from Monday\'s last text box keeps the caret in that box, the week does not pan, and what was typed is saved (D597)', stayed === at && saved && await page.locator('#eWeek').evaluate(e => e.scrollLeft) === pan, `in: ${stayed} · saved: ${saved}`)
    await shot(page, `${size}-05-week-last-box-tab`)
    await page.keyboard.type('!'); await page.keyboard.press('Tab'); await page.waitForTimeout(200)
    const again = await sig(page), boxNow = await page.evaluate(() => String(document.activeElement?.textContent ?? ''))
    row(size, 'R3-12', 'week: he can go on typing in that box, and a second Tab stays and saves again', again === at && await page.evaluate(() => JSON.stringify([window.DAYS, window.INPUTS]).includes(' R3!')), `in: ${again} · the box reads "${boxNow}"`)
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(150)
    const back = await sig(page)
    row(size, 'R3-13', 'week: Shift+Tab still goes back to the box before, on the same day', back !== at && back !== null && await page.evaluate(() => !!document.activeElement?.closest('#eWeek .day[data-day="0"]')), String(back))
    /* the day catches up: a take-off typed, the caret walked off by click to the last box, Tab at the end — the line's worked-out area time is the new one */
    await page.locator(`${wk} [data-txt="ff:0.0.1.to"]`).first().click(); await page.keyboard.press('Control+A'); await page.keyboard.type('1410'); await page.keyboard.press('Tab'); await page.waitForTimeout(100)
    const last2 = await lastBox(page, wk); await last2.click(); await page.keyboard.press('Tab'); await page.waitForTimeout(250)
    const shownAt = await page.locator(`${wk} [data-atime="0.0.1"]`).first().textContent()
    const wantAt = await page.evaluate(() => window.atimeText ? window.atimeText(window.DAYS[0].waves[0].formations[1]) : null)
    row(size, 'R3-14', 'week: after that Tab the line\'s worked-out area time on screen is the one for the new take-off (the day still catches up)', wantAt == null ? /^1410-/.test(String(shownAt)) : shownAt === wantAt, `shown ${shownAt}${wantAt == null ? '' : ' · worked out ' + wantAt}`)

    /* ---------- the dotted ring: every surface that draws a puck with it ---------- */
    const rings = async where => page.evaluate(() => [...document.querySelectorAll('.puck.boxdot')].filter(p => p.getClientRects().length).map(p => getComputedStyle(p).outlineStyle + ' ' + getComputedStyle(p).outlineWidth))
    const wkR = await rings()
    row(size, 'R3-15', 'Edit Schedule\'s week draws the dotted ring on the man whose day breaks the next day\'s crew rest', wkR.length > 0 && wkR.every(x => x.startsWith('dotted')), `${wkR.length} · ${wkR[0]}`)
    await page.locator('#eWeek [data-sbday="0"]').first().click(); await page.waitForSelector('#schedBoard', { state: 'visible' })
    const bdR = await rings()
    row(size, 'R3-16', 'the Scheduler Board draws the same dotted ring (D94)', bdR.length > 0 && bdR.every(x => x.startsWith('dotted')), `${bdR.length} · ${bdR[0]}`)
    await page.locator('#sbDone').click(); await page.waitForSelector('#schedBoard', { state: 'hidden' })
    await nav(page, phone, 'viewsched'); await page.waitForSelector('#vWeek .day')
    const vwR = await rings()
    row(size, 'R3-17', 'View-only Sched draws the same dotted ring', vwR.length > 0 && vwR.every(x => x.startsWith('dotted')), `${vwR.length} · ${vwR[0]}`)
    row(size, 'R3-18', 'an unscaled screen is handed no width: the ring is what it always was', await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dot-w') === ''))
  } catch (e) { row(size, 'R3-XX', 'the walk stopped', false, String(e && e.message || e).slice(0, 300)); await shot(page, `${size}-99-stopped`).catch(() => {}) }
  await ctx.close()

  /* ================= part 2 — the fix round (the two reads' finding, and the two small Blue/Red leftovers) =================
     A fresh sign-in, so nothing above colours it. */
  const two = await open(browser, size)
  const p2 = two.page
  try {
    await nav(p2, phone, 'logic'); await p2.locator('#lgEdit').click(); await p2.locator('#lgMissionMix').check()
    await nav(p2, phone, 'editsched'); await p2.waitForSelector('#eWeek .day')
    const wk = '#eWeek .day[data-day="0"]', rm = `${wk} [data-txt="fr:0.0.0.0"]`
    const inBox = () => p2.evaluate(() => document.activeElement?.getAttribute('data-txt') || document.activeElement?.getAttribute('data-bfld') || null)
    const btn = () => p2.evaluate(() => [...document.querySelectorAll('.mission-role-action [data-role-choose]')].map(b => b.textContent).join(' | '))

    /* [ROLE-BUTTON-AFTER-ANSWER] — the week */
    await typeIn(p2, rm, 'DS FOR EAGLE')
    await p2.locator('.mission-role-question [data-role-side="later"]').click(); await p2.waitForTimeout(150)
    await p2.locator(rm).first().click(); await p2.waitForTimeout(150)
    row(size, 'R3-19', 'week: selecting the Remarks of a formation with a cue and no answer offers "Choose mission role"', await btn() === 'Choose mission role', await btn())
    await p2.locator('.mission-role-action [data-role-choose]').click(); await p2.waitForTimeout(150)
    await p2.locator('.mission-role-question [data-role-side="later"]').click(); await p2.waitForTimeout(200)
    row(size, 'R3-20', 'week: Later pressed with the caret still in that Remarks — the question goes and "Choose mission role" is back at once', await btn() === 'Choose mission role' && await inBox() === 'fr:0.0.0.0' && await p2.locator('.mission-role-question').count() === 0, `button: ${await btn()} · caret in ${await inBox()}`)
    await p2.locator('.mission-role-action [data-role-choose]').click(); await p2.waitForTimeout(150)
    await p2.locator('.mission-role-question [data-role-side="red"]').click(); await p2.waitForTimeout(250)
    row(size, 'R3-21', 'week: Red pressed with the caret still there — the button now reads "Change mission role", so a mis-press can be corrected on the spot', await btn() === 'Change mission role' && await inBox() === 'fr:0.0.0.0', `button: ${await btn()} · caret in ${await inBox()}`)
    await shot(p2, `${size}-06-week-change-button-back`)

    /* [ROLE-BLANK-CALLSIGN] — the board: a new line, no callsign, a mission that asks */
    await p2.locator('#eWeek [data-sbday="0"]').first().click(); await p2.waitForSelector('#schedBoard', { state: 'visible' })
    const n = await p2.evaluate(() => window.DAYS[0].waves[0].formations.length)
    await p2.locator('#sbBoard [data-gline="0.0"]').first().click(); await p2.waitForTimeout(250)
    const msn = p2.locator(`#sbBoard [data-bfld="ff:0.0.${n}.msn"]:visible`).first()
    await msn.scrollIntoViewIfNeeded(); await msn.fill('DS-2'); await msn.press('Tab'); await p2.waitForTimeout(250)
    const rid = await p2.evaluate(i => window.DAYS[0].waves[0].formations[i].rid, n)
    const heads = await p2.evaluate(() => [...document.querySelectorAll('.mission-role-question strong')].map(x => x.textContent))
    const pageText = await p2.evaluate(() => document.body.innerText)
    row(size, 'R3-22', 'board: a new line with no callsign and Mission DS-2 asks "Line: Blue or Red?" — the page shows no hidden row code', heads.includes('Line: Blue or Red?') && !pageText.includes(rid), heads.join(' | '))
    await p2.locator('.mission-role-question').last().scrollIntoViewIfNeeded(); await shot(p2, `${size}-07-board-blank-line-question`)
    await p2.locator('.mission-role-question:has(strong:text-is("Line: Blue or Red?")) [data-role-side="red"]').click(); await p2.waitForTimeout(250)
    const undoWords = await p2.evaluate(() => { const b = document.querySelector('#sbUndo,#undoBtn'); return [...document.querySelectorAll('#sbUndo,#undoBtn')].map(x => (x.getAttribute('title') || '') + ' ' + (x.getAttribute('aria-label') || '')).join(' / ') })
    row(size, 'R3-23', 'board: after Red, Undo names it "the mission role for Line", never the row code', /mission role for Line/.test(undoWords) && !undoWords.includes(rid), undoWords.slice(0, 160))

    /* the two reads' finding — the board holds its whole day for the caret: the last box's Tab must still bring it up to date */
    const to = p2.locator('#sbBoard [data-bfld="ff:0.0.0.to"]:visible').first()
    await to.scrollIntoViewIfNeeded(); await to.fill('1255'); await to.press('Tab'); await p2.waitForTimeout(150)
    const bl = await lastBox(p2, '#sbBoard'); await bl.scrollIntoViewIfNeeded(); await bl.focus(); const at = await sig(p2)
    await p2.keyboard.press('Tab'); await p2.waitForTimeout(250)
    const shown = await p2.locator('#sbBoard [data-atime="0.0.0"]').first().evaluate(e => String(e.value ?? e.textContent))
    if (phone) row(size, 'R3-24', 'phone board: a take-off typed, then Tab from the day\'s last box — the caret stays AND the line\'s area time on screen is the new one (Astra\'s and Sol\'s finding)', await sig(p2) === at && /^1255-/.test(shown), `area time shown: ${shown}`)
    else row(size, 'R3-24', 'desktop board: a take-off typed, then Tab from the last box (it goes on to the next control) — the line\'s area time on screen is the new one', /^1255-/.test(shown), `area time shown: ${shown}`)
  } catch (e) { row(size, 'R3-YY', 'part 2 of the walk stopped', false, String(e && e.message || e).slice(0, 300)); await shot(p2, `${size}-98-stopped`).catch(() => {}) }
  await two.ctx.close()
}
await browser.close()
const md = ['| size | id | what was done and what must be true | result | note |', '|---|---|---|---|---|', ...rows.map(r => `| ${r.size} | ${r.id} | ${r.what} | ${r.pass} | ${String(r.note).replace(/\|/g, '/')} |`), '', `Errors seen (console, page, HTTP 4xx): ${errors.length ? errors.join(' · ') : 'none'}`].join('\n')
writeFileSync(`${SHOTS}/result.md`, md + '\n')
console.log(`\n${rows.filter(r => r.pass === 'PASS').length} PASS, ${rows.filter(r => r.pass === 'FAIL').length} FAIL · errors: ${errors.length}`)
