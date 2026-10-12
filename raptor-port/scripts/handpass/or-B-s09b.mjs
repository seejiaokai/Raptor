// B9 aside - the member view on Edit Schedule reached only by the bridge go() (the tab is gone for him)
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, saveJson, loadJson, errs } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const browser = await launch()
const { page: p } = await openWorld(browser)
const f = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Gear brief' })
await p.locator('#roleBadge').click(); await p.waitForTimeout(800)
say('badge', await p.locator('#roleBadge').innerText())
await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(800)
say('page after go', await p.evaluate(() => window.CURPAGE))
say('edit week: editable boxes / drag handles / roster pucks / board buttons', await p.evaluate(() => ({ ce: document.querySelectorAll('#eWeek [contenteditable="true"]').length, drag: document.querySelectorAll('#eWeek [data-drag]').length, roster: document.querySelectorAll('#eRoster .rpuck').length, sbday: [...document.querySelectorAll('#eWeek [data-sbday]')].filter(e => e.offsetParent).length })))
await shot(p, 's09b-1-member-editsched')
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B9b = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
