/* [OIL-SEATS-CAN-EARN] walk — SURFACES block, survey.
   What the EDIT WEEK, the VIEW WEEK, the next-week PEEK and the EXPORT doors
   actually draw on this build, before anything is placed by hand. */
import { open, go, shot, STATE, SHOTS } from './lib.mjs'

const { browser, page, errors } = await open({ state: STATE })
console.log('SHOTS =', SHOTS)

const survey = async (label) => {
  const r = await page.evaluate(() => {
    const vis = e => e.offsetParent !== null
    const root = document.querySelector('#eWeek') || document.querySelector('#vWeek') || document
    const chips = [...document.querySelectorAll('.oilcount')].map(e => ({
      txt: (e.innerText || '').trim(), item: e.dataset.oilsent, day: e.dataset.oilday,
      ver: e.dataset.oilver, vis: vis(e), where: e.closest('.peek') ? 'PEEK'
        : e.closest('#eWeek') ? 'eWeek' : e.closest('#vWeek') ? 'vWeek'
          : e.closest('#schedBoard') ? 'board' : 'other',
      title: (e.getAttribute('title') || '').slice(0, 120),
    }))
    const bars = [...document.querySelectorAll('[class*=oilbar]')].map(e => ({
      who: e.dataset.person, cls: (e.className.match(/oilbar[-a-z]*/g) || []).join(' '),
      where: e.closest('.peek') ? 'PEEK' : e.closest('#eWeek') ? 'eWeek'
        : e.closest('#vWeek') ? 'vWeek' : e.closest('#schedBoard') ? 'board' : 'other',
      vis: vis(e),
    }))
    const sent = [...document.querySelectorAll('[data-person="allavail"],[data-person="all"]')].map(e => ({
      who: e.dataset.person, tag: e.tagName, cls: e.className.slice(0, 60),
      where: e.closest('.peek') ? 'PEEK' : e.closest('#eWeek') ? 'eWeek'
        : e.closest('#vWeek') ? 'vWeek' : e.closest('#schedBoard') ? 'board'
          : e.closest('#eRoster') || e.closest('#sbRoster') ? 'palette' : 'other',
      vis: vis(e),
    }))
    return { page: window.CURPAGE, days: document.querySelectorAll('.day').length,
      peeks: document.querySelectorAll('.peek').length, chips, bars, sent,
      exportCsv: !!document.querySelector('#exportSched'), exportPdf: !!document.querySelector('#exportPdf'),
      rootId: root.id }
  })
  console.log(`\n===== ${label} (page=${r.page}) =====`)
  console.log(' days on screen:', r.days, '| peek blocks:', r.peeks,
    '| export CSV door:', r.exportCsv, '| print door:', r.exportPdf)
  console.log(' COUNT CHIPS:', r.chips.length)
  for (const c of r.chips) console.log('   ', JSON.stringify(c))
  const byW = {}
  for (const b of r.bars) (byW[b.where + (b.vis ? '' : '(hidden)')] ||= []).push(b.who + ':' + b.cls)
  console.log(' OIL BARS by surface:'); for (const k of Object.keys(byW)) console.log('   ', k, '->', byW[k].length, byW[k].slice(0, 8).join(', '))
  console.log(' PLACEHOLDER PUCKS drawn:', r.sent.length)
  for (const s of r.sent) console.log('   ', JSON.stringify(s))
  return r
}

await go(page, 'editsched'); await page.waitForTimeout(700)
await survey('EDIT WEEK — desktop 1440')
await shot(page, 'SURF-00-editweek-desktop')

await go(page, 'viewsched'); await page.waitForTimeout(700)
await survey('VIEW WEEK — desktop 1440')
await shot(page, 'SURF-00-viewweek-desktop')

/* where does the day actually keep its placeholders right now? */
const world = await page.evaluate(() => {
  const S = id => id === 'allavail' || id === 'all'
  const hits = []
  window.DAYS.forEach((d, di) => {
    ;(d.ground || []).forEach((g, ri) => {
      if (S(g.who)) hits.push(`g:${di}.${ri}.who=${g.who}`)
      ;(g.more || []).forEach((m, x) => { if (S(m)) hits.push(`g:${di}.${ri}.x${x}=${m}`) })
    })
    ;(d.allhands || []).forEach((a, ri) => {
      const w = Array.isArray(a.who) ? a.who : [a.who]
      w.forEach((q, x) => { if (S(q)) hits.push(`a:${di}.${ri}[${x}]=${q}`) })
      ;(a.more || []).forEach((m, x) => { if (S(m)) hits.push(`a:${di}.${ri}.x${x}=${m}`) })
    })
    ;(d.dutywaves || []).forEach((b, bi) => (b.rows || []).forEach((r, ri) => {
      if (S(r.id)) hits.push(`d:${di}.${bi}.${ri}=${r.id}`)
      ;(r.more || []).forEach((m, x) => { if (S(m)) hits.push(`d:${di}.${bi}.${ri}.x${x}=${m}`) })
    }))
    ;['oft', 'amt'].forEach(k => ((d.sims || {})[k] || []).forEach((s, ri) => {
      if (S(s.p)) hits.push(`s:${di}.${k}.${ri}.p`); if (S(s.w)) hits.push(`s:${di}.${k}.${ri}.w`)
      ;(s.pax || []).forEach((m, x) => { if (S(m)) hits.push(`s:${di}.${k}.${ri}.pax${x}=${m}`) })
      ;(s.more || []).forEach((m, x) => { if (S(m)) hits.push(`s:${di}.${k}.${ri}.x${x}=${m}`) })
    }))
  })
  return { hits, dates: window.DAYS.map((d, i) => `${i}:${d.dow} ${d.dt}`) }
})
console.log('\n===== PLACEHOLDERS IN THE SAVED WORLD =====')
console.log(' days:', world.dates.join(' | '))
console.log(' hits:', world.hits.length ? world.hits.join('\n        ') : 'NONE')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
