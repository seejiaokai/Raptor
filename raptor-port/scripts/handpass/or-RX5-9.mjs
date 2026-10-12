// RX4-9: the tag on the new man alone. Meeting Drifter/Hunter/Ranger Wed 15 Jul published; Drifter off and back; Tally dropped on "+ add": 1 pending, only Tally wears the hollow AL1; reload; Tally off.
import * as L from './or-RX5-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))

/* every puck of the row, with its seat (wrapper): title, tag text, class — on the week or on the board */
const seats = (surface) => p.evaluate(([iid, di, surface]) => {
  const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
  let f
  if (surface === 'board') f = [...document.querySelectorAll(`#schedBoard [data-fill="g:${di}.${ri}.+"]`)].find(e => e.offsetParent)
  else { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`) }
  const row = f ? (f.closest('.pl-row') || f.closest('.sb-arow') || f.parentElement) : null
  if (!row) return null
  return [...row.querySelectorAll('.puck')].filter(pk => !pk.closest('.addz')).map(pk => {
    const nm = (pk.querySelector('.nm')?.textContent || pk.textContent).trim()
    const chain = []
    let a = pk
    for (let k = 0; k < 4 && a && a !== row; k++, a = a.parentElement) chain.push({ tag: a.tagName, cls: a.className.toString().slice(0, 60), title: a.getAttribute('title'), text: (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) })
    const titled = [pk, ...pk.querySelectorAll('*'), ...(pk.parentElement ? [pk.parentElement, ...pk.parentElement.querySelectorAll('*')] : [])].map(e => e.getAttribute && e.getAttribute('title')).filter(Boolean)
    const hollow = (pk.parentElement ? [...pk.parentElement.querySelectorAll('*')] : []).filter(e => /^AL\d$/.test((e.textContent || '').trim()) && e.children.length === 0).map(e => e.className.toString() + ':' + e.textContent.trim())
    return { who: nm, puckCls: pk.className.toString().slice(0, 60), titles: [...new Set(titled)], hollowTag: hollow, chain }
  })
}, [iid, L.DI, surface])
const summarise = s => s ? s.map(x => `${x.who}: tag=${x.hollowTag.length ? x.hollowTag.join('|') : 'none'}; title=${x.titles.join(' / ') || 'none'}`) : 'ROW NOT FOUND'
const rowShot = async (surface, name) => {
  let f
  if (surface === 'board') {
    const ri = await L.rowIdx(p, L.DI, iid)
    const row = L.boardRowEl ? null : null
  }
  const box = await p.evaluate(([iid, di, surface]) => {
    const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
    let f
    if (surface === 'board') f = [...document.querySelectorAll(`#schedBoard [data-fill="g:${di}.${ri}.+"]`)].find(e => e.offsetParent)
    else { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`) }
    const row = f ? (f.closest('.pl-row') || f.closest('.sb-arow') || f.parentElement) : null
    if (!row) return null
    row.scrollIntoView({ block: 'center' })
    const r = row.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
  }, [iid, L.DI, surface])
  await p.waitForTimeout(300)
  const box2 = await p.evaluate(([iid, di, surface]) => {
    const ri = (window.DAYS[di].ground || []).findIndex(g => g.src === iid)
    let f
    if (surface === 'board') f = [...document.querySelectorAll(`#schedBoard [data-fill="g:${di}.${ri}.+"]`)].find(e => e.offsetParent)
    else { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; f = d.querySelector(`[data-fill="g:${di}.${ri}.+"]`) }
    const row = f ? (f.closest('.pl-row') || f.closest('.sb-arow') || f.parentElement) : null
    const r = row.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
  }, [iid, L.DI, surface])
  const clip = { x: Math.max(0, box2.x - 4), y: Math.max(0, box2.y - 4), width: Math.min(1440, box2.width + 8), height: box2.height + 8 }
  await L.shot(p, name, clip)
}
const stage = async (tag, picName) => {
  const r = {}
  await L.toWeek(p); await L.scrollToSec(p, 'ground')
  r.weekSeats = await seats('week'); r.weekSummary = summarise(r.weekSeats)
  await rowShot('week', picName + '-week-zoom')
  await L.shot(p, picName + '-week')
  await L.toBoard(p, L.DI)
  const ri = await L.rowIdx(p, L.DI, iid)
  const row = L.boardRowEl(p, L.DI, ri); await L.centre(row); await p.waitForTimeout(400)
  r.boardSeats = await seats('board'); r.boardSummary = summarise(r.boardSeats)
  await rowShot('board', picName + '-board-zoom')
  await L.shot(p, picName + '-board')
  r.boardPend = await p.evaluate(() => (document.querySelector('#schedBoard .dpend')?.textContent || '').trim() || '(no .dpend)')
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  out[tag] = r
  console.log(tag, 'WEEK', j(r.weekSummary)); console.log(tag, 'BOARD', j(r.boardSummary), '| board pending:', r.boardPend)
  return r
}
await stage('s0_published', 'rx4-9-0-published')
out.takeToast = await L.takeOffRow(p, 'Drifter', iid); console.log('Drifter off:', out.takeToast)
out.backToast = await L.addOntoRow(p, 'Drifter', iid); console.log('Drifter back:', out.backToast, '| people:', j((await L.inputOf(p, iid)).people))
out.cBack = await L.counts(p, { noBoard: false }); console.log('COUNTS after Drifter back', L.fmt(out.cBack))
await stage('s1_drifterBack', 'rx4-9-1-drifter-back')
out.tallyToast = await L.addOntoRow(p, 'Tally', iid); console.log('Tally added:', out.tallyToast, '| people:', j((await L.inputOf(p, iid)).people))
out.cTally = await L.counts(p, { keepWin: true }); console.log('COUNTS Tally added', L.fmt(out.cTally))
await L.shot(p, 'rx4-9-2-tally-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await stage('s2_tallyIn', 'rx4-9-2-tally-in')
// reload
out.signedAgain = await L.reload(p); console.log('RELOADED, signed in again:', out.signedAgain)
out.cReload = await L.counts(p, { keepWin: true }); console.log('COUNTS after reload', L.fmt(out.cReload))
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await stage('s3_reload', 'rx4-9-3-reload')
// Tally off
out.tallyOff = await L.takeOffRow(p, 'Tally', iid); console.log('Tally off:', out.tallyOff, '| people:', j((await L.inputOf(p, iid)).people))
out.cOff = await L.counts(p, { keepWin: true }); console.log('COUNTS Tally off', L.fmt(out.cOff))
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await stage('s4_tallyOff', 'rx4-9-4-tally-off')
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('9', out)
await ctx.close(); await L.browser.close()
