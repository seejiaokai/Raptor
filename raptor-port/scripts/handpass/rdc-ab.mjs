/* BEFORE / AFTER screen recorder of the react-doctor clean-up (31 Oct 26, D1534: nothing on screen may change).
   usage:  node scripts/handpass/rdc-ab.mjs <distFolder> <label> [only]
     writes  docs/img/handpass/2026-10-31-react-doctor/<label>/<size>/<NN-step>.png  and  <label>/record.json
     `only` (optional): a comma list of group names to run, e.g. "lw,trk" (a re-run of a part; the label's folder is
     emptied only when `only` is absent).
   Method: docs/walk-scripts.md §8 — the recording is made twice of the SAME build first (rdc-compare.mjs before before2);
   two equal records prove sameness, not coverage, so the record says where each step landed (reached / how / text).
   Every step presses the control a person presses, takes the picture, and is closed by the NEXT step (§5).
   Each GROUP gets a fresh browser world (empty storage = the demo world), so a failed step cannot carry into another. */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { launch, newWorld, login, settle, toPage, SIZES, OUTROOT } from './rdc-lib.mjs'

const dist = process.argv[2], label = process.argv[3], only = (process.argv[4] || '').split(',').filter(Boolean)
if (!dist || !label) { console.error('usage: node scripts/handpass/rdc-ab.mjs <distFolder> <label> [groups]'); process.exit(2) }
if (!existsSync(resolve(dist, 'index.html'))) { console.error('no index.html in ' + dist); process.exit(2) }
const OUT = resolve(OUTROOT, label)
if (!only.length) rmSync(OUT, { recursive: true, force: true })
for (const s of Object.keys(SIZES)) mkdirSync(resolve(OUT, s), { recursive: true })

const V = sel => `${sel} >> visible=true`
const sleep = (p, ms) => p.waitForTimeout(ms)
async function click(p, sel, o = {}) { await p.locator(V(sel)).first().click({ timeout: 5000, ...o }); await settle(p, 400) }
async function esc(p, n = 1) { for (let i = 0; i < n; i++) { await p.keyboard.press('Escape'); await settle(p, 250) } }
async function noSaving(p) { await p.waitForFunction(() => !/Saving/.test(document.body.innerText), null, { timeout: 4000 }).catch(() => {}) }
async function visible(p, sel) { return (await p.locator(V(sel)).count()) > 0 }
const phone = p => p.viewportSize().width < 600
const win = sel => ({ close: async p => { if (await visible(p, sel + ' .win-x')) await click(p, sel + ' .win-x'); else await esc(p) } })

/* ---- the groups. A step: { id, what, open(p, ctx) -> how string, close?(p) } ---- */
const GROUPS = []
const group = (name, role, steps, boot = {}) => GROUPS.push({ name, role, steps, boot })

group('sched-view', 'admin', [
  { id: 'sched-view-week', what: 'View-only Sched week', open: async p => { await toPage(p, 'viewsched'); return 'tab View-only Sched' } },
  { id: 'phone-menu-drawer', what: 'the phone menu drawer (burger)', open: async p => { if (!phone(p)) return null; await click(p, '#burger'); return 'burger' }, close: async p => { if (phone(p)) { await p.mouse.click(380, 420); await settle(p, 400) } } },
  { id: 'sched-view-day-info', what: 'a day\'s i (approval / AL versions) popup on the view week', open: async p => { await click(p, '.dinfobtn[data-dayinfo="0"]'); return 'day 0 i button' }, close: async p => esc(p) },
])

group('sched-edit', 'admin', [
  { id: 'sched-edit-week', what: 'Edit Schedule week', open: async p => { await toPage(p, 'editsched'); return 'tab Edit Schedule' } },
  { id: 'sched-changes-window', what: 'the changes window (clock icon)', open: async p => { await click(p, '#histBtn'); return 'clock icon #histBtn' }, ...win('.chgwin') },
  { id: 'sched-date-jump', what: 'the week\'s Jump-to-a-date calendar popup', open: async p => { await click(p, '#page-editsched .wk-cal, #page-editsched .filt-cal, .wknav-mbtn.filt-cal'); return 'jump to a date' }, close: async p => esc(p) },
  { id: 'sched-input-window', what: 'an input\'s own window from the schedule', open: async p => { await click(p, '#eWeek .sanscard[data-inpedit], #eWeek .ntx.inpedit[data-inpedit]'); return 'first input chip on the week' }, close: async p => esc(p) },
  { id: 'sched-day-templates-menu', what: 'a day\'s Templates menu', open: async p => { await click(p, '#eWeek [data-daytplopen="0"]'); return 'Templates on Monday' } },
  { id: 'sched-day-templates-window', what: 'day templates window (Manage templates)', open: async p => { await click(p, 'text=Manage templates'); return 'Manage templates' }, close: async p => { await click(p, '#daytplModal button:has-text("Done")') } },
  { id: 'sched-plans-menu', what: 'a day\'s plans menu', open: async p => { await click(p, '#eWeek [data-planmenu="0"]'); return 'plans menu on Monday' }, close: async p => esc(p) },
  { id: 'sched-plans-window', what: 'saved plans / drafts window (after + Alt Plan, Manage plans)', open: async p => {
      await click(p, '#eWeek [data-planmenu="0"]'); await click(p, '[data-plandup]'); await click(p, '#eWeek [data-planmenu="0"]'); await click(p, '[data-planmanage]'); return '+ Alt Plan then Manage plans' }, close: async p => esc(p) },
])

group('board', 'admin', [
  { id: 'board-day', what: 'the Scheduler Board (Monday)', open: async p => { await toPage(p, 'editsched'); await click(p, '#eWeek [data-sbday="0"]'); await p.waitForSelector('#schedBoard'); return 'day door on Edit Schedule' } },
  { id: 'board-changes-window', what: 'the changes window from the board (History)', open: async p => { await click(p, '#sbHist'); return '#sbHist' }, ...win('.chgwin') },
  { id: 'board-date-jump', what: 'the board\'s Calendar popup', open: async p => { await click(p, '#sbCal'); return '#sbCal' }, close: async p => esc(p) },
  { id: 'board-day-templates', what: 'the board\'s Templates menu', open: async p => { await click(p, '#sbTpl, #schedBoard .mbtn.daybtn'); return 'Templates on the board' }, close: async p => esc(p) },
  { id: 'board-roster-armed', what: 'a programme row armed to take a person (+ add)', open: async p => { await click(p, '#schedBoard [data-fill="a:0.0.+"]'); return 'armed the first programme row' } },
  { id: 'board-all-avail-chip', what: 'ALL AVAIL placed: its count chip', open: async p => { await click(p, '#sbRoster .puck.allavail'); await p.waitForSelector('#schedBoard .oilcount', { timeout: 4000 }); return 'armed row then ALL AVAIL puck' } },
  { id: 'board-all-avail-window', what: 'the ALL AVAIL window (tap the count chip)', open: async p => { await click(p, '#schedBoard .oilcount'); await p.waitForSelector('.availwin.front', { timeout: 4000 }); return 'count chip' }, ...win('.availwin') },
])

group('inputs', 'admin', [
  { id: 'inputs-calendar', what: 'Inputs page, calendar month (July)', open: async p => { await toPage(p, 'inputs'); return 'tab Inputs' } },
  { id: 'inputs-list', what: 'Inputs list', open: async p => { await click(p, '#inListBtn'); return '#inListBtn' } },
  { id: 'inputs-filters-gear', what: 'Inputs calendar settings (gear)', open: async p => { await click(p, '#inGear'); return 'gear' }, close: async p => esc(p) },
  { id: 'inputs-medical', what: 'the medical view', open: async p => { await click(p, '#inMedBtn'); return '#inMedBtn' } },
  { id: 'inputs-sans', what: 'the SANS calendar', open: async p => { await click(p, '#inSansMode'); return '#inSansMode' } },
  { id: 'inputs-sans-day', what: 'the SANS calendar: an opened day (15 Jul)', open: async p => { await click(p, '[data-testid="sc-day-2026-07-15"]'); return 'day cell 15 Jul' }, close: async p => esc(p) },
  { id: 'inputs-day-open', what: 'Inputs calendar: an opened day (7 Jul)', open: async p => { await click(p, '#inMemberMode'); await click(p, '#inCalBtn'); await click(p, '[data-icday="2026-07-07"]'); return 'Inputs tab, Calendar, tapped 7 Jul' } },
  { id: 'inputs-new-input', what: 'the new-input window with the date calendar', open: async p => { await click(p, 'button:has-text("+ Input")'); return '+ Input on the day panel' } },
  { id: 'inputs-people-picker', what: 'a people picker (Several people)', open: async p => { await click(p, 'text=Several people'); return 'Several people switch' } },
  { id: 'inputs-cancel-edit', what: 'new-input window cancelled, back on the day', open: async p => { await click(p, '#inpEditCancel'); return 'Cancel' } },
])

group('pages', 'admin', [
  { id: 'logic-page', what: 'Logic page', open: async p => { await toPage(p, 'logic'); return 'tab Logic' } },
  { id: 'quals-page', what: 'Quals page', open: async p => { await toPage(p, 'quals'); return 'tab Quals' } },
  { id: 'admin-page', what: 'Admin page', open: async p => { await toPage(p, 'admin'); return 'tab Admin' } },
  { id: 'help-page', what: 'Help page', open: async p => { await toPage(p, 'help'); return 'tab Help' } },
])

group('lw', 'admin', [
  { id: 'lw-grid', what: 'Leave War grid', open: async p => { await toPage(p, 'leavewar'); return 'tab Leave War' } },
  { id: 'lw-cell-sheet', what: 'a cell tapped (bid window)', open: async p => { await click(p, '[data-testid^="cell-"][data-testid$="-2026-07-15"]'); return 'cell of 15 Jul' }, close: async p => { await click(p, '.bidsheet .x') } },
  { id: 'lw-legend', what: 'Legend', open: async p => { await click(p, '[data-testid="legend-open"]'); return 'Legend chip' }, close: async p => esc(p) },
  { id: 'lw-my-leave', what: 'My leave (person window)', open: async p => { await click(p, '[data-testid="my-leave"]'); return 'My leave chip' }, close: async p => { await click(p, '[data-testid="pw-close"]') } },
  { id: 'lw-open-for-bidding', what: 'the Open for bidding window', open: async p => { await click(p, '[data-testid="open-chip"]'); return 'Bidding closed chip' }, close: async p => { await click(p, '[data-testid="open-dates-close"]') } },
  { id: 'lw-settings', what: 'Settings (gear)', open: async p => { await click(p, '[data-testid="settings-open"]'); return 'gear' } },
  { id: 'lw-calendar-window', what: 'the Calendar window (Days) from Settings', open: async p => { await click(p, '[data-testid="settings-days"]'); await p.waitForTimeout(400); return 'Settings > Calendar…' } },
  { id: 'lw-approvals', what: 'Approvals tab', open: async p => { await esc(p, 2); await click(p, '[data-testid="lw-tab-approvals"]'); return 'Approvals tab' } },
  { id: 'lw-balances', what: 'Balances tab', open: async p => { await click(p, '[data-testid="lw-tab-balances"]'); return 'Balances tab' } },
  { id: 'lw-grades', what: 'the Grades window (from Balances)', open: async p => { await click(p, '[data-testid="bal-grades"]'); return 'Grades…' }, close: async p => esc(p) },
  { id: 'lw-oil', what: 'OIL tab (OIL tracker)', open: async p => { await click(p, '[data-testid="oil-tracker"]'); return 'OIL tab' } },
])

group('lw-member', 'member', [
  { id: 'lw-member-grid', what: 'Leave War grid as a member', open: async p => { await toPage(p, 'leavewar'); return 'tab Leave War (member)' } },
  { id: 'lw-member-balances', what: 'Balances as a member', open: async p => { await click(p, '[data-testid="lw-tab-balances"]'); return 'Balances tab (member)' } },
  { id: 'sched-member-view', what: 'View-only Sched as a member', open: async p => { await toPage(p, 'viewsched'); return 'tab View-only Sched (member)' } },
  { id: 'inputs-member', what: 'Inputs as a member', open: async p => { await toPage(p, 'inputs'); return 'tab Inputs (member)' } },
], { who: 'u' })

group('trk', 'admin', [
  { id: 'trk-chart', what: 'the Tracker flow chart', open: async p => { await toPage(p, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 20000 }); return 'tab Tracker' } },
  { id: 'trk-info-panel', what: 'the Info panel (side panel; the Info tab on a phone)', open: async p => { if (phone(p)) { await click(p, 'button[data-view="info"]'); return 'Info tab' } return 'always beside the chart on a desktop' } },
  { id: 'trk-show-all', what: 'Show All', open: async p => { await click(p, '#showAllBtn, #showAllTab'); return 'Show All' }, close: async p => { await click(p, '#showAllBtn, #showAllTab') } },
  { id: 'trk-legend', what: 'Legend', open: async p => { await click(p, '#legendBtn'); return 'Legend' }, close: async p => esc(p) },
  { id: 'trk-flex-settings', what: 'flex settings (gear, admin)', open: async p => { await click(p, '#flexBtn'); return 'gear' }, close: async p => { if (await visible(p, '#trkFlexWin')) await click(p, '#trkFlexWin button:has-text("✕")'); else await esc(p) } },
  { id: 'trk-add-student', what: '"+ Add" student dialog', open: async p => { if (phone(p)) await click(p, 'button[data-view="info"]'); await click(p, '#addStu'); return '+ Add' }, close: async p => { await click(p, '#dlgModal button:has-text("Cancel")') } },
  { id: 'trk-ball-popup', what: 'a ball\'s marking pop-up (tap an event on the chart)', open: async p => { if (phone(p)) await click(p, 'button[data-view="flow"]'); await p.locator('#flowSvg .ball').first().click({ timeout: 5000 }); await settle(p, 500); return 'first ball on the chart' }, close: async p => esc(p) },
  { id: 'trk-date-box', what: 'a date box\'s calendar popup (Last Flown)', open: async p => { if (phone(p)) await click(p, 'button[data-view="info"]'); await click(p, '#lastSyll'); return 'Last Flown (Syllabus)' }, close: async p => esc(p) },
  { id: 'trk-syllabus-menu', what: 'the syllabus menu', open: async p => { if (phone(p)) await click(p, 'button[data-view="flow"]'); await click(p, '#sylMenuBtn'); return 'syllabus pencil' } },
  { id: 'trk-edit-layout', what: 'Edit chart layout tools', open: async p => { await click(p, '#sylMenuPanel >> text=Edit chart layout'); return 'Edit chart layout' } },
])

/* ---- the run ---- */
const record = { label, dist: 'see the label', steps: [] }
const browser = await launch()
for (const [sizeName, size] of Object.entries(SIZES)) {
  let n = 0
  for (const g of GROUPS) {
    const base = n; n += g.steps.length
    if (only.length && !only.includes(g.name)) continue
    const w = await newWorld(browser, dist, size, { touch: sizeName === 'phone' })
    const p = w.page
    let booted = true
    try { await login(p, g.boot.who || 'a'); await noSaving(p) } catch (e) { booted = false; console.log(`[${sizeName}] group ${g.name}: BOOT FAILED ${String(e.message).split('\n')[0]}`) }
    let prev = null
    for (let i = 0; i < g.steps.length; i++) {
      const s = g.steps[i], nn = String(base + i + 1).padStart(2, '0'), file = `${nn}-${s.id}.png`
      w.where.step = s.id
      const row = { id: s.id, no: nn, what: s.what, size: sizeName, role: g.role, group: g.name, reached: false, how: '', text: '', errors: [] }
      const errFrom = w.errors.length
      if (!booted) { row.how = 'boot failed' }
      else {
        try {
          if (prev && prev.close) { try { await prev.close(p) } catch { await esc(p) } }
          const how = await s.open(p)
          if (how == null) { row.how = 'not applicable at this size' }
          else {
            row.reached = true; row.how = how
            await settle(p, 450); await noSaving(p); await settle(p, 150)
            await p.screenshot({ path: resolve(OUT, sizeName, file), fullPage: false })
            row.text = await p.evaluate(() => document.body.innerText)
            /* geometry of the Tracker's chart, kept in the record to explain a picture difference (sub-pixel layout) */
            row.geom = await p.evaluate(() => { const b = document.querySelectorAll('#flowSvg .ball'); const r = e => e ? e.getBoundingClientRect() : null; const bd = document.getElementById('board'); return b.length ? { n: b.length, b0: r(b[0]), bLast: r(b[b.length - 1]), board: bd ? { sl: bd.scrollLeft, st: bd.scrollTop } : null, svg: r(document.getElementById('flowSvg')) } : null })
            row.file = `${sizeName}/${file}`
          }
        } catch (e) {
          row.how = 'NOT REACHED: ' + String(e.message).replace(/\u001b\[[0-9;]*m/g, '').split('\n').filter(l => /Timeout|intercepts|waiting for|not visible|not stable|resolved to|Error|failed/i.test(l)).slice(0, 5).join(' | ').slice(0, 500)
          try { await esc(p, 2) } catch {}
        }
      }
      row.errors = w.errors.slice(errFrom).map(x => x.e)
      record.steps.push(row)
      console.log(`[${sizeName}] ${nn} ${s.id}: ${row.reached ? 'ok' : row.how}${row.errors.length ? '  (errors: ' + row.errors.length + ')' : ''}`)
      prev = s
    }
    await w.ctx.close()
  }
}
await browser.close()
const recFile = resolve(OUT, 'record.json')
let all = record
if (only.length && existsSync(recFile)) {
  /* a part re-run replaces only its groups' rows */
  const old = JSON.parse((await import('node:fs')).readFileSync(recFile, 'utf8'))
  const mine = new Set(record.steps.map(r => r.id + '|' + r.size))
  all = { ...old, steps: [...old.steps.filter(r => !mine.has(r.id + '|' + r.size)), ...record.steps].sort((a, b) => (a.size + a.no).localeCompare(b.size + b.no)) }
}
writeFileSync(recFile, JSON.stringify(all, null, 1))
console.log(`done: ${record.steps.length} steps, ${record.steps.filter(r => r.reached).length} reached -> ${recFile}`)
