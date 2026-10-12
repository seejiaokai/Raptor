// Walker A: A10 - the two routes to a Duty for ALL AVAIL alone. node or-A-ten.mjs
import { launch, openWorld, fileInput, shot, toastMark, toastsSince, SAT, SAT_DI, errs, WIN, OUT } from './or-A-lib.mjs'
import { drag } from './or-A-drag.mjs'
import { toWeek, weekDayLoc } from './or-A-read.mjs'
import { flow } from './or-A-flow.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/1fb32070-5ddc-4f68-a0ca-107059b0daf5/scratchpad'
const R = {}
const say = (k, o) => { R[k] = Object.assign(R[k] || {}, o); console.log('## ' + k + ' ' + JSON.stringify(o).slice(0, 2800)) }
const browser = await launch()
const allPics = []

/* ---- world 1: filed for ALL AVAIL alone ---- */
{
  const { page } = await openWorld(browser, 'A10w1', { who: 'ad', pass: 'a' })
  const F = flow(page, 'A10w1-')
  const f = await fileInput(page, { type: 'Duty', people: [], ph: 'allavail', from: SAT, to: SAT, timed: ['09:00', '12:00'], title: '', oil: 'yes',
    beforeSave: async () => { await page.waitForTimeout(200); await shot(page, 'A10w1-form'); F.pics.push('A10w1-form.png') } })
  say('w1-file', { sheet: f.sheetText, new: f.new })
  if (!f.new[0]) { say('w1', { note: 'no input saved' }) } else {
    const iid = f.new[0].iid
    const b = await F.bundle('read', iid); say('w1-read', F.pickLines(b))
    say('w1-window', await F.windowOf(iid))
    const aw = await F.aaWin('x'); say('w1-aawin', aw); await F.aaClose()
    R.w1iid = iid
  }
  allPics.push(...F.pics)
}
/* ---- world 2: filed for Ranger, ALL AVAIL dropped on, Ranger dragged off ---- */
{
  const { page } = await openWorld(browser, 'A10w2', { who: 'ad', pass: 'a' })
  const F = flow(page, 'A10w2-')
  const f = await fileInput(page, { type: 'Duty', person: 'Ranger', from: SAT, to: SAT, timed: ['09:00', '12:00'], title: '', oil: 'yes' })
  say('w2-file', { sheet: f.sheetText, new: f.new })
  if (!f.new[0]) { say('w2', { note: 'no input saved' }) } else {
    const iid = f.new[0].iid
    await toWeek(page)
    const wd = weekDayLoc(page, SAT_DI)
    let m = await toastMark(page)
    const row = wd.locator('.sec-grnd .pl-row.gr-frominput').first()
    await drag(page, page.locator('#eRoster [data-person="allavail"]').first(), row.locator('.ppl'))
    say('w2-drop', { toast: await toastsSince(page, m) })
    m = await toastMark(page)
    const ep = await page.evaluate(() => { for (const [x, y] of [[1425, 300], [1425, 600], [6, 600]]) { const e = document.elementFromPoint(x, y); if (e && !e.closest('[data-slot],[data-fill],[data-txt],.addz,#eRoster,.rpuck,input,textarea,button,select,.availwin,.pl-row')) return { x, y } } return null })
    await drag(page, weekDayLoc(page, SAT_DI).locator('.sec-grnd .pl-row.gr-frominput .puck[data-person="bane"]').first(), ep)
    say('w2-dragoff', { toast: await toastsSince(page, m) })
    const b = await F.bundle('read', iid); say('w2-read', F.pickLines(b))
    say('w2-window', await F.windowOf(iid))
    const aw = await F.aaWin('x'); say('w2-aawin', aw); await F.aaClose()
    R.w2iid = iid
  }
  allPics.push(...F.pics)
}
writeFileSync(join(SCR, 'A10.json'), JSON.stringify({ R, pics: allPics }, null, 1))
console.log('PICS ' + JSON.stringify(allPics))
console.log(JSON.stringify(errs))
await browser.close()
