// h1 - the Tracker's crew, course and syllabus dropdowns on the phone: is their text cut off, and was it so before tonight?
// Run once against the build of fcca051f0 and once against the build from before tonight's app changes (MQ_PORT, RUN).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, go, note, facts } from './jlib.mjs'
const RUN = process.env.RUN || 'tonight'
console.log('h1-dropdowns v1', RUN, process.env.MQ_PORT)
picsFor('h1-' + RUN)
const measure = s => s.page.evaluate(() => {
  const cv = document.createElement('canvas').getContext('2d')
  return [...document.querySelectorAll('#page-tracker select')].filter(e => e.getBoundingClientRect().width > 0).map(e => {
    const c = getComputedStyle(e); const b = e.getBoundingClientRect()
    cv.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`
    const opt = e.options[e.selectedIndex]; const words = opt ? opt.textContent.trim() : ''
    const ink = cv.measureText(words).width
    const room = b.width - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight) - parseFloat(c.borderLeftWidth) - parseFloat(c.borderRightWidth)
    return { id: e.id, words, w: +b.width.toFixed(1), h: +b.height.toFixed(1), room: +room.toFixed(1), text: +ink.toFixed(1), cutBy: +Math.max(0, ink - room).toFixed(1), font: c.fontSize, padR: c.paddingRight, appearance: c.webkitAppearance || c.appearance }
  })
})
try {
  const s = await newPage(process.env.SZ || 'p')
  await signIn(s, 'ad', 'a')
  await step('open the Tracker', async () => {
    await go(s, 'tracker'); await s.page.waitForTimeout(2000)
    const m = await measure(s); facts.selects = m; note(JSON.stringify(m, null, 0))
    await pic(s, 'dropdowns', ['#page-tracker select'], 10)
    await pic(s, 'page')
    const bar = await s.page.evaluate(() => { const e = document.querySelector('#page-tracker select'); let p = e; for (let i = 0; i < 3 && p.parentElement; i++) p = p.parentElement; const b = p.getBoundingClientRect(); return { cls: p.className, w: Math.round(b.width), sw: p.scrollWidth, cw: p.clientWidth } })
    facts.bar = bar; note(JSON.stringify(bar))
  })
  await s.ctx.close()
} finally { finish('h1-' + RUN); await closeAll() }
