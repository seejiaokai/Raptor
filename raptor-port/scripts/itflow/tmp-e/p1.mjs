import { start } from './lib.mjs'
const { browser, page, errors, shot, box, ballBox } = await start('ad')
await shot('p1-land')
const info = await page.evaluate(() => ({
  crew: [...document.querySelectorAll('#activeSel option')].map(o => o.textContent + '|' + o.selected),
  course: [...document.querySelectorAll('#courseSel option')].map(o => o.textContent + '|' + o.selected),
  syl: [...document.querySelectorAll('#sylSel option')].map(o => o.textContent + '|' + o.selected),
  balls: document.querySelectorAll('#flowSvg .ball').length,
  title: document.getElementById('courseTitle')?.textContent,
  scroll: (() => { const b = document.getElementById('board'); return [b.scrollTop, b.scrollLeft, b.scrollHeight] })(),
  topUndo: !!document.querySelector('#undoBtn'), 
  hdr: document.querySelector('#page-tracker header')?.getBoundingClientRect().toJSON(),
  topbar: [...document.querySelectorAll('button:not([hidden])')].filter(b => b.getBoundingClientRect().top < 50 && b.offsetParent).map(b => (b.id || '') + ':' + b.textContent.trim().slice(0, 15)),
}))
console.log(JSON.stringify(info, null, 1))
for (const s of ['#activeSel', '#courseSel', '#courseMenuBtn', '#sylSel', '#sylMenuBtn', '#detailsBtn', '#showAllBtn', '#fileMenuBtn', '#hSearchBtn', '#hSearch', '#barHideBtn', '#side', '.legend', '#board', '#addStu', '#ordCrew', '.c-overall', '.c-next', '.c-fails', '#undoBtn', '#redoBtn'])
  console.log(s, JSON.stringify(await box(`#page-tracker ${s}, ${s}`)))
for (const id of ['ST-01', 'ST-02', 'ST-03']) console.log(id, JSON.stringify(await ballBox(id)))
console.log('errors', errors)
await browser.close()
