// B8 — refusals
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, drag2, rosterPuckOf } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText + ' [op ' + t.style.opacity + ']' : '' })
const waitQuiet = async p => { for (let i = 0; i < 30; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.opacity : '0' }); if (o !== '1') return; await p.waitForTimeout(400) } }
const browser = await launch()
const { page: p } = await openWorld(browser)
const t3 = (await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-13', to: '2026-07-15', timed: ['17:00', '18:00'] }))[0].iid
const fw = (await fileInput(p, { type: 'Fly with', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['10:00', '11:00'] }))[0].iid
const pe = (await fileInput(p, { type: 'Personal', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] }))[0].iid
say('ids', { t3, fw, pe })
say('t3 rows Mon/Tue/Wed', [await rowIdx(p, 0, t3), await rowIdx(p, 1, t3), await rowIdx(p, 2, t3)])
const ppl = id => inputOf(p, id).then(x => x.people)
const snap = async () => ({ t3: await ppl(t3), fw: await ppl(fw), pe: await ppl(pe) })
async function tryDrop(tag, di, iid, who, where) {
  await openBoard(p, di)
  const ri = await rowIdx(p, di, iid)
  const before = { s: await snap(), row: ri >= 0 ? (await boardRowNames(p, di, ri)).names : null }
  let target
  if (where === 'row') { const row = boardRowEl(p, di, ri); await centre(row); await p.waitForTimeout(300); target = row.locator('.puck').first() }
  else {
    await boardLines(p, di)
    const line = p.locator(`#schedBoard .pinp .sb-arow.inprow[data-inprow^="${iid}"]:visible`).first()
    say(tag + ' line count', await line.count())
    await centre(line); await p.waitForTimeout(300); target = line.locator('.puck').first()
  }
  await waitQuiet(p)
  const src = await rosterPuckOf(p, '#sbRoster', who)
  const m = await toastMark(p)
  await drag2(p, src, target)
  say(tag + ' toasts', await toastsSince(p, m))
  say(tag + ' toast now', await toastNow(p))
  const after = { s: await snap(), row: ri >= 0 ? (await boardRowNames(p, di, ri)).names : null }
  say(tag + ' before/after', [before, after])
  say(tag + ' unchanged', JSON.stringify(before) === JSON.stringify(after))
  await shot(p, 's08-' + tag.replace(/[^a-z0-9]+/gi, '-').toLowerCase())
}
await tryDrop('1 ALL AVAIL onto 3-day Training row (Mon)', 0, t3, 'ALL AVAIL', 'row')
await tryDrop('2 ALL onto 3-day Training row (Mon)', 0, t3, 'ALL', 'row')
await tryDrop('3 ALL AVAIL onto Fly with row', 3, fw, 'ALL AVAIL', 'row')
await tryDrop('4 ALL AVAIL onto Fly with line', 3, fw, 'ALL AVAIL', 'line')
await tryDrop('5 ALL AVAIL onto Personal row', 3, pe, 'ALL AVAIL', 'row')
await tryDrop('6 ALL AVAIL onto Personal line', 3, pe, 'ALL AVAIL', 'line')
await tryDrop('7 Tally onto Personal row', 3, pe, 'Tally', 'row')
await tryDrop('8 Tally onto Personal line', 3, pe, 'Tally', 'line')
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B8 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
