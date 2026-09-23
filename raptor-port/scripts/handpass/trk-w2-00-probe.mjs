/* [HUMAN-RETEST] Tracker — walker w2, step 0: learn the ground before walking.
   Read-only: which events the 2026 chart holds (id, type, order), where the
   side panel's boxes sit, and how a date box takes typed keys in this browser
   (the order of its segments decides how a person's keystrokes land). */
import { open, shot, core, DESK } from './trk-lib.mjs'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const info = await core(page, c => {
  const s = c.SYLLABI['2026'] || []
  return {
    course: c.curCourseName(), syl: c.curSylName(), roster: c.rosterNow().map(r => r.name + ' ' + r.id + (r.pid ? ' linked' : '')),
    first: s.slice().sort((a, b) => a.seq - b.seq).slice(0, 30).map(e => `${e.id}:${e.type}:${e.seq}${(e.prereqs || []).length ? '<' + e.prereqs.join(',') : ''}`),
    flights: s.filter(e => e.type === 'flight').slice(0, 40).map(e => e.id),
    acad: s.filter(e => e.type === 'acad').slice(0, 20).map(e => e.id),
    n: s.length,
  }
})
console.log(JSON.stringify(info, null, 1))
const ballsOnScreen = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].slice(0, 12).map(g => { const r = g.getBoundingClientRect(); return g.dataset.id + '@' + Math.round(r.x) + ',' + Math.round(r.y) }))
console.log('balls', ballsOnScreen.join(' '))
/* the date box: type into Last Flown (Syllabus) by keys and read back what it holds */
const box = page.locator('#lastSyll')
await box.scrollIntoViewIfNeeded(); await box.click(); await sleep(100)
await page.keyboard.type('0920', { delay: 60 }); await sleep(150)
const v1 = await box.inputValue()
await page.keyboard.type('2026', { delay: 60 }); await sleep(300)
const v2 = await box.inputValue()
console.log('date box after 0920 →', JSON.stringify(v1), ' after 2026 →', JSON.stringify(v2))
console.log('locale', await page.evaluate(() => navigator.language), 'today(app)', await page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date())))
console.log('undo', JSON.stringify(await page.evaluate(() => window.__undoForTests && (({ undo, redo, active }) => ({ undo, redo, active }))(window.__undoForTests()))))
await shot(page, 'w2-00-probe-start')
console.log('errors', errors)
await browser.close()
