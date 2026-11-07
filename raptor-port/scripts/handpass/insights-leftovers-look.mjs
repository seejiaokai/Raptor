/* [STACK-LEFTOVERS] (1)(2) — the LOOK of job 6 (8 Nov 26; evidence sheet docs/handpass/2026-11-08-insights-leftovers.md).
   Drives the REAL production bundle, served locally, at a desktop's and a phone's size, through the app's own controls:
   (a) a published day: typing left unsaved in a Remarks box, then "Choose mission role" — the typing saved, the caret
       kept in the box, and the day's "N pending" chip counting it at once;
   (2) the answer told the same way in the change history and in Undo's words (one shared body now);
   (b) Edit Schedule looking at the day's issued version: no Templates button on the day.
   Nothing a person sees is meant to change: run it on the build before (main's three touched files swapped in) and the
   build after, each into its own folder, and compare the words in each run's result.json.
   HP_URL the served build (localhost only); HP_SHOTS the run's folder (set by the caller, never reused). */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= resolve(here, '../../docs/img/handpass/2026-11-08-insights-leftovers/' + new Date().toISOString().replace(/[:.]/g, '-'))
const OUT = process.env.HP_SHOTS
if (existsSync(OUT + '/result.json')) throw new Error('Choose a fresh evidence folder: ' + OUT)
mkdirSync(OUT, { recursive: true })
const { login, go, board, closeBoard, publish } = await import('./lib.mjs')
const { chromium } = await import('@playwright/test')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const BASE = process.env.HP_URL || 'http://localhost:4186'
const report = { base: BASE, out: OUT, results: [], words: {}, pictures: [], errors: [], limits: ['Chromium touch emulation at 390x844, not his iPhone.'] }
const save = () => writeFileSync(OUT + '/result.json', JSON.stringify(report, null, 2))
const settle = (page, ms = 250) => page.waitForTimeout(ms)
async function shot(page, name) { const p = `${OUT}/${name}.png`; await page.screenshot({ path: p, fullPage: false }); report.pictures.push(p); return p }
let blocked = ''
async function check(page, id, fn) {
  if (blocked) { report.results.push({ id, status: 'NOT WALKED', why: blocked }); console.log('NOT WALKED', id, blocked); save(); return }
  try { const facts = await fn(); report.results.push({ id, status: 'PASS', facts }); console.log('PASS', id, JSON.stringify(facts)) }
  catch (e) { report.results.push({ id, status: 'FAIL', error: String(e) }); console.log('FAIL', id, String(e)); if (id.endsWith('-setup')) blocked = id + ' could not act'; await shot(page, id + '-failure').catch(() => {}) }
  finally { save() }
}
/* the press the app routes, at its own box, after proving nothing stands over it */
async function press(page, loc) {
  await loc.waitFor({ state: 'visible' }); await loc.scrollIntoViewIfNeeded()
  const free = await loc.evaluate(e => { const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return h === e || e.contains(h) })
  assert.equal(free, true, 'nothing stands over the control')
  await loc.click()
}
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
try {
  for (const [view, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, ...(view === 'phone' ? { isMobile: true, hasTouch: true } : {}) })
    const page = await ctx.newPage()
    page.on('pageerror', e => report.errors.push(view + ': ' + e.message))
    page.on('console', m => { if (m.type() === 'error') report.errors.push(view + ' console: ' + m.text()) })
    page.on('response', r => { if (r.status() >= 400) report.errors.push(view + ': HTTP ' + r.status() + ' ' + r.url()) })
    await page.goto(BASE + '/?fresh=1')
    await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' })
    await login(page)
    let cs = ''
    await check(page, view + '-setup', async () => {
      await go(page, 'logic')
      if (await page.locator('#lgEdit').isVisible()) await page.locator('#lgEdit').click()
      await page.locator('#lgMissionMix').setChecked(true); await settle(page)
      assert.equal(await page.locator('#lgMissionMix').isChecked(), true, 'blue/red tracking on')
      await board(page, 0)
      const msn = page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first(), rmk = page.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first()
      await press(page, msn); await msn.fill('ACM'); await msn.press('Tab'); await settle(page)
      await press(page, rmk); await rmk.fill('DS FOR ALPHA'); await rmk.press('Tab'); await settle(page)
      if (await page.locator('[data-role-side="later"]').count()) await press(page, page.locator('[data-role-side="later"]').first())
      const r = await publish(page, 0)
      assert.equal(r.published, true, 'published: ' + JSON.stringify(r))
      await closeBoard(page); await go(page, 'editsched'); await settle(page, 600)
      cs = await page.evaluate(() => String(window.DAYS[0].waves[0].formations[0].cs || ''))
      const chip = await page.locator('#eWeek [data-pendlist="0"]').count()
      assert.equal(chip, 0, 'nothing waiting to go out before the typing')
      return { published: r, callsign: cs }
    })
    await check(page, view + '-a-choose-with-typing', async () => {
      const box = page.locator('#eWeek [data-txt="fr:0.0.0.0"]:visible').first()
      await press(page, box); await settle(page)
      await page.keyboard.press('Control+A'); await page.keyboard.type('DS FOR BRAVO'); await settle(page)
      const choose = page.locator('.mission-role-action [data-role-choose]:visible').first()
      assert.equal((await choose.textContent())?.trim(), 'Choose mission role')
      await press(page, choose)
      if (view === 'phone') await shot(page, view + '-a-right-after-tap')
      await settle(page, 400)
      const saved = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].rmks)
      const kept = await box.evaluate(e => document.activeElement === e)
      const chip = ((await page.locator('#eWeek [data-pendlist="0"]:visible').textContent()) || '').replace(/\s+/g, ' ').trim()
      const asked = ((await page.locator('.mission-role-question:visible strong').textContent()) || '').trim()
      await page.locator('#eWeek .day[data-day="0"] .day-head').scrollIntoViewIfNeeded().catch(() => {})
      await shot(page, view + '-a-pending-chip-and-question')
      assert.equal(saved, 'DS FOR BRAVO', 'the typing saved')
      assert.equal(kept, true, 'the caret still in the Remarks box')
      assert.match(chip, /^1 pending/, 'the chip counts it at once')
      report.words[view + '-chip'] = chip; report.words[view + '-question'] = asked
      return { saved, kept, chip, asked }
    })
    await check(page, view + '-2-history-and-undo-words', async () => {
      await press(page, page.locator('[data-role-side="red"]:visible').first()); await settle(page, 400)
      await press(page, page.locator('#histBtn:visible')); await settle(page, 600)
      /* the window opens on "New to you", which never lists his own changes: the line is under "All changes" */
      await press(page, page.locator('.chgwin .win-tab', { hasText: 'All changes' }).first()); await settle(page, 400)
      const lines = await page.locator('.chgwin').evaluate(w => [...w.querySelectorAll('*')].filter(e => e.children.length === 0 && /mission role|Unresolved|Red/.test(e.textContent || '') && e.getBoundingClientRect().width > 1).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()))
      /* the whole line ("Mission role · Working copy Unresolved → Red · Saber · date") and its item's heading, read off
         what is drawn — the line's chip reads "Mission role", capital M */
      const block = await page.locator('.chgwin').evaluate(w => {
        const hit = [...w.querySelectorAll('*')].find(e => e.children.length === 0 && /^mission role$/i.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 1)
        let row = hit; while (row && row !== w && !/→/.test(row.innerText || '')) row = row.parentElement
        const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
        /* the item's heading, without its time of day (which differs run to run) */
        return { line: t(row), heading: t(hit?.closest('.cw-g')?.querySelector('.cw-ghname')) }
      })
      await shot(page, view + '-2-history-line')
      assert.ok(lines.length > 0, 'a mission-role line in the changes window: ' + JSON.stringify(lines))
      assert.match(block.line, /Mission role.*Unresolved.*→.*Red/i, 'the line reads Unresolved → Red: ' + JSON.stringify(block))
      report.words[view + '-history'] = { lines, block }
      await press(page, page.locator('#histBtn:visible')); await settle(page, 400)
      await press(page, page.locator('#undoBtn:visible'))
      /* the note read only once it is painted in view (shown, not faded, inside the screen): its text stays in the page
         after it fades, so a read of the text alone could pass on a note nobody saw (Astra's read, low 2) */
      await page.waitForFunction(() => { const t = document.getElementById('toastEl'); if (!t) return false; const r = t.getBoundingClientRect(), st = getComputedStyle(t); return /the mission role/.test(t.textContent || '') && Number(st.opacity) > 0.9 && st.visibility !== 'hidden' && st.display !== 'none' && r.width > 0 && r.bottom > 0 && r.top < innerHeight }, null, { timeout: 4000 })
      const toast = ((await page.locator('#toastEl').textContent()) || '').replace(/\s+/g, ' ').trim()
      await shot(page, view + '-2-undo-words')
      assert.equal(toast, `Undid: the mission role for ${cs} — Red`, 'Undo names the line and the side')
      report.words[view + '-undo'] = toast
      await press(page, page.locator('#redoBtn:visible')); await settle(page, 400)
      return { lines, block, toast, callsign: cs }
    })
    await check(page, view + '-b-issued-look-no-templates', async () => {
      const day = page.locator('#eWeek .day[data-day="0"]')
      const tplBefore = await page.locator('#eWeek [data-daytplopen="0"]').count()
      assert.equal(tplBefore, 1, 'the working copy offers Templates before the look')
      await press(page, page.locator('#eWeek [data-planmenu="0"]:visible').first())
      await press(page, page.locator('.wavemenu [data-planpv]').first()); await settle(page, 500)
      const bar = await day.locator('.dprev-bar').count()
      const tpl = await page.locator('#eWeek [data-daytplopen="0"]').count()
      await day.locator('.day-head').scrollIntoViewIfNeeded().catch(() => {})
      await shot(page, view + '-b-issued-look')
      assert.equal(bar, 1, 'the day shows the issued version')
      assert.equal(tpl, 0, 'no Templates while the issued version is looked at')
      await press(page, page.locator('#eWeek [data-planmenu="0"]:visible').first())
      await press(page, page.locator('.wavemenu [data-plangolive]').first()); await settle(page, 500)
      return { previewBar: bar, templatesUnderLook: tpl, templatesBefore: tplBefore }
    })
    /* the board's own plans selector starts the look there too (the fresh Opus read, low 2) */
    await check(page, view + '-b-board-issued-look-templates-greyed', async () => {
      await press(page, page.locator('#eWeek .sb-open[data-sbday="0"]:visible').first())
      await page.waitForSelector('#schedBoard'); await settle(page, 500)
      const tplBtn = page.locator('#sbTpl')
      const liveBefore = await tplBtn.isEnabled()
      assert.equal(liveBefore, true, 'the board offers Templates on the working copy')
      await press(page, page.locator('#sbSign [data-planmenu="0"]:visible').first())
      await press(page, page.locator('.wavemenu [data-planpv]').first()); await settle(page, 500)
      const bar = await page.locator('#schedBoard .dprev-bar:visible').count()
      const greyed = await tplBtn.isDisabled()
      const dayTpl = await page.locator('#sbBoard [data-daytpladd="0"]').count()
      await shot(page, view + '-b-board-issued-look')
      assert.ok(bar >= 1, 'the board shows the issued version')
      assert.equal(greyed, true, "the board's Templates greyed under the look")
      assert.equal(dayTpl, 0, "the day's own Templates not drawn under the look")
      await press(page, page.locator('#sbSign [data-planmenu="0"]:visible').first())
      await press(page, page.locator('.wavemenu [data-plangolive]').first()); await settle(page, 500)
      await closeBoard(page)
      return { templatesBefore: liveBefore, previewBar: bar, templatesGreyed: greyed, dayTemplates: dayTpl }
    })
    await ctx.close(); blocked = ''
  }
} finally { await browser.close(); save() }
console.log('folder', OUT, 'errors', report.errors.length)
/* a walk with any step not PASS, or any page error, ends with a failing exit status (Astra's read, low 1) */
if (report.errors.length || report.results.some(r => r.status !== 'PASS')) process.exitCode = 1
