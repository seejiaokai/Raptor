// walker F: F7 (three-day Training Mon-Wed, Mon and Tue published)   node scripts/handpass/or-F-run2.mjs F7a F7b
import * as L from './or-F-lib.mjs'
import * as A from './or-F-acts.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad/orF'
mkdirSync(SCR, { recursive: true })
const want = process.argv.slice(2)
const log = (...a) => console.log(...a)
const TT = 'Three day training'

async function f7(key, how) {
  if (want.length && !want.includes(key)) return
  const rc = { key, did: [], pics: [] }
  const { ctx, page } = await L.open()
  try {
    rc.filed = await L.fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-13', to: '2026-07-15', timed: ['14:00', '15:00'], title: TT, oil: 'yes' })
    log(key, 'filed', JSON.stringify(rc.filed))
    rc.pubMon = await L.signAndPublish(page, 0); log(key, 'publish Mon', JSON.stringify(rc.pubMon))
    rc.pubTue = await L.signAndPublish(page, 1); log(key, 'publish Tue', JSON.stringify(rc.pubTue))
    await L.toWeek(page)
    rc.rows = {}
    for (const di of [0, 1, 2]) rc.rows[di] = JSON.stringify((await A.rowOf(page, TT, di)).map(r => ({ times: r.times, pucks: r.pucks })))
    rc.clean = {}
    for (const di of [0, 1]) { const c = await L.counts(page, { di }); rc.clean[di] = L.fmt(c); log(key, 'clean day', di, L.fmt(c)) }
    rc.did.push(...(await how(page, rc)))
    rc.after = {}
    for (const di of [0, 1, 2]) rc.after[di] = JSON.stringify((await A.rowOf(page, TT, di)).map(r => ({ times: r.times, pucks: r.pucks, cls: r.cls })))
    rc.res = {}
    for (const di of [0, 1]) {
      const tag = `${key.toLowerCase()}-${di === 0 ? 'mon' : 'tue'}`
      const s = await A.snap(page, tag, di, { title: TT })
      rc.res[di] = { counts: s.fmt, lines: s.lines, n: s.c.n, agree: s.c.agree, amend: s.c.c, day: s.c.a, windowTitle: s.c.d }
      rc.pics.push(...s.pics)
      log(key, 'day', di, 'COUNTS', s.fmt, ' LINES', JSON.stringify(s.lines))
    }
    // Wed (not published): what the head reads
    await L.toWeek(page)
    rc.wedHead = await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2]; return d.querySelector('.dstat')?.innerText.replace(/\s+/g, ' ') })
    rc.inputs = await page.evaluate(() => window.INPUTS.filter(r => /three day/i.test(r.title || '')).map(r => ({ title: r.title, date: r.date, to: r.to || r.dateTo || null, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs), cx: !!r.cx, cxr: r.cxr || '' })))
    rc.amendFull = await L.shotAmend(page, `${key.toLowerCase()}-amend-full`)
    if (rc.amendFull) rc.pics.push(rc.amendFull)
    rc.amendText = await page.evaluate(() => { const els = [...document.querySelectorAll('#page-editsched *')].filter(e => /^\s*AMENDMENTS/i.test(e.textContent) && e.textContent.length < 600); els.sort((x, y) => x.textContent.length - y.textContent.length); return els.length ? els[els.length - 1].innerText.replace(/\s+/g, ' ') : null })
  } catch (e) { rc.crash = String(e.stack || e).split('\n').slice(0, 6).join(' | '); log(key, 'CRASH', rc.crash) }
  writeFileSync(`${SCR}/${key}.json`, JSON.stringify(rc, null, 1))
  await ctx.close()
}
await f7('F7a', async (p, rc) => { const r = await A.addFromCrew(p, 'Tally', TT, 0); rc.act = r; return ['on Monday dragged Tally from the crew list onto the three-day Training row\'s + add: ' + JSON.stringify(r)] })
await f7('F7b', async (p, rc) => { const r = await A.boardCx(p, TT, 'WX', 0); rc.act = r; return ['on Monday\'s Scheduler Board pressed CX on the three-day Training row, reason WX: ' + JSON.stringify(r)] })
await L.browser.close(); log('ERRS', JSON.stringify(L.errs)); writeFileSync(`${SCR}/errs-f7-${want.join('_') || 'all'}.json`, JSON.stringify(L.errs))
