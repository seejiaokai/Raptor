// [GROUP-INPUT-ONE-ROW] — the PICTURES of the schedule's one row for a shared input, for his yes before the plan (D541;
// D662's reading 2). A MOCK-UP on the real screens: the built app is driven through its own controls (a leave, then a
// meeting filed for four men), pictured as it draws it TODAY (one row a man), and then the same rows are re-arranged ON
// THE PAGE into the row as ruled (D661, D734-D741) and pictured again. Only the app's own markup and stylesheet are
// used - a row with several pucks already exists (a sim row, a ground row with a second man) - so the "new" picture is
// what the built row will look like, not a drawing. Nothing of the app is changed.
//   node scripts/handpass/gi-mock.mjs [scene …]      scenes: draft big pub        LOOK_URL=http://localhost:4180/
import { browser, open, fileInput, shot, press, DESK, PHONE, OUT, errs } from './gi-lib.mjs'
import { join } from 'node:path'

const ISO = '2026-07-15', DI = 2            // the demo week's Wednesday
const FOUR = ['Drifter', 'Hunter', 'Ranger', 'Tally'], TEN = ['Anvil', 'Blade', 'Cinch', 'Drifter', 'Echo', 'Forge', 'Hunter', 'Ranger', 'Tally', 'Vapor']
const TITLE = 'Range safety brief'
const only = process.argv.slice(2)
const scene = async (name, fn) => { if (only.length && !only.includes(name)) return; try { await fn() } catch (e) { console.log(`SCENE ${name} FAILED: ` + String(e.stack || e).split('\n').slice(0, 6).join(' | ')) } }
const SIZES = [['desk', DESK, false], ['phone', PHONE, true]]

/* THE MOCK'S ONE STEP: every row of the shared input becomes ONE row holding all its pucks, A to Z (D661, D727's order).
   Runs in the page. `pend` (a published day): the day's count of changes waiting reads one for the input (D736). */
const MERGE = ({ title, pend }) => {
  const norm = s => (s || '').trim().toLowerCase()
  const sets = [
    [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-grnd .pl-row.gr-frominput')].filter(r => norm(r.querySelector('.nm .ntx')?.textContent) === title),
    [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-inp .pl-row')].filter(r => norm(r.querySelector('.nm .ntx')?.textContent) === title),
    [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].filter(r => norm(r.querySelector('textarea.ain')?.value) === title),
    [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow.inprow')].filter(r => norm(r.querySelector('.inpedit')?.textContent) === title),
  ]
  /* two small things the build will do, drawn here: on a phone the row's two times stay together at its top (today they
     spread down a tall row), and on a desktop Personal Inputs gets the Ground Programme's two-puck People column */
  if (!document.getElementById('giMockCss')) {
    const st = document.createElement('style'); st.id = 'giMockCss'
    st.textContent = '@media(max-width:820px){#page-editsched .plist .pl-row.gi-shared{grid-template-rows:auto 1fr}}'
      + '@media(min-width:821px){#page-editsched .plist.one.sec-inp .pl-cols,#page-editsched .plist.one.sec-inp .pl-row{grid-template-columns:minmax(64px,1fr) 44px 44px calc(var(--puck-w)*2 + 10px) minmax(0,1.25fr)}}'
    document.head.appendChild(st)
  }
  let merged = 0
  for (const rows of sets) {
    if (rows.length < 2) continue
    const keep = rows[0], ppl = keep.querySelector('.ppl'), addz = ppl.querySelector('.addz')
    const seats = rows.map(r => r.querySelector('.ppl .seat')).filter(Boolean).sort((a, b) => a.querySelector('.nm').textContent.localeCompare(b.querySelector('.nm').textContent))
    for (const s of seats) addz ? ppl.insertBefore(s, addz) : ppl.appendChild(s)
    ppl.classList.remove('one'); keep.classList.add('gi-shared')
    rows.slice(1).forEach(r => r.remove())
    merged++
  }
  /* Personal Inputs' folded line counts inputs: four records of one input read as one */
  for (const h of document.querySelectorAll('.pl-hint, .sb-ph .sub')) h.textContent = h.textContent.replace(/\b4 inputs · 4 on programme/, '1 input · 1 on programme').replace(/\b10 inputs · 10 on programme/, '1 input · 1 on programme')
  /* the count's space is a no-break space, so \s, never a typed space; text nodes only, so no button loses its children */
  if (pend) for (const e of document.querySelectorAll('#page-editsched *, #schedBoard *, [data-testid^="win-"] *')) for (const n of e.childNodes) if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/\b4(\s+)pending\b/, '1$1pending').replace(/\b4(\s+)changes\b/, '1$1change')
  /* the changes window's "To go out" list: today a line a man; as ruled ONE line naming its people (D736 — it settles
     [CAL-TOGO-ONE-ITEM]), written the way the "All changes" tab already writes a shared input (D663) */
  const items = [...document.querySelectorAll('.chgwin .pl-list .pl-item')].filter(b => norm(b.querySelector('.pl-where')?.textContent).endsWith('· ' + title))
  if (pend && items.length > 1) {
    const names = items.map(b => b.querySelector('.pl-where').textContent.split(' · ')[0]).sort((a, b) => a.localeCompare(b))
    const where = items[0].querySelector('.pl-where'), shown = where.textContent.split(' · ').slice(1).join(' · ')
    where.innerHTML = ''
    where.append(`${shown} · ${names.length} people`)
    const sub = document.createElement('span'); sub.textContent = names.join(' · ')
    sub.style.cssText = 'display:block;font-weight:500;font-size:.86em;opacity:.72;margin-top:1px'
    where.append(sub)
    items.slice(1).forEach(b => b.remove())
    for (const e of document.querySelectorAll('.chgwin .win-ttl small, .chgwin .pl-head, .chgwin .win-tab.on .c')) for (const n of e.childNodes) if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/\b4(\s+)changes\b/, '1$1change').replace(/^4$/, '1')
  }
  return merged
}
/* the published day's pictures are cut to what changes: the Amendments box and the day's head; the list of what is waiting */
const HEADCLIP = { desk: { x: 0, y: 98, width: 560, height: 250 }, phone: { x: 0, y: 118, width: 390, height: 150 } }
const listClip = p => p.evaluate(() => { const r = document.querySelector('.chgwin').getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(innerWidth, r.width + 8), height: Math.min(r.height + 8, 400) } })
const hideToast =p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })

/* bring a section of the Wednesday to the top of the screen (under the app's bar) */
const toWeekSec = (p, key) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [DI, key])
const toBoardSec = (p, key) => p.evaluate(([di, key]) => {
  const sec = document.querySelector(`#schedBoard [data-secmove="${di}.${key}"]`)
  sec.scrollIntoView({ block: 'start' })
  for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 10; break }
}, [DI, key])
/* a picture of ONE section: the whole phone screen (it is the point there), or on a desktop the section itself */
async function pic(p, tag, sel, name) {
  await p.waitForTimeout(350)
  if (tag === 'phone') return shot(p, name)
  /* the week's floating day arrow lies over a desktop crop's corner: out of the picture */
  await p.evaluate(() => { for (const x of [20, 40]) for (const y of [300, 450, 650]) { const b = document.elementFromPoint(x, y)?.closest('button'); if (b && /^[‹›❮❯<>]$/.test(b.textContent.trim())) b.style.visibility = 'hidden' } })
  const el = p.locator(sel).first()
  await el.screenshot({ path: join(OUT, name + '.png') }); console.log('saved ' + name)
}
const WK = k => `#page-editsched .day:not(.peek) [data-secmove="${DI}.${k}"]`
const BD = k => `#schedBoard [data-secmove="${DI}.${k}"]`

/* the four screens of one world: the week's Ground Programme and Personal Inputs, the board's two — each today, then new */
async function fourScreens(page, tag, touch, pre, { pend = false } = {}) {
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  await hideToast(page)
  const fold = page.locator(`#page-editsched .day:not(.peek) [data-pitog="${DI}"]`).first()
  if (/show/.test(await fold.innerText())) { await press(touch, fold); await page.waitForTimeout(400) }
  await toWeekSec(page, 'ground'); await pic(page, tag, WK('ground'), `${pre}-${tag}-week-ground-1today`)
  await toWeekSec(page, 'inputs'); await pic(page, tag, WK('inputs'), `${pre}-${tag}-week-inputs-1today`)
  console.log(tag, 'week merged', await page.evaluate(MERGE, { title: TITLE.toLowerCase(), pend }))
  await toWeekSec(page, 'ground'); await pic(page, tag, WK('ground'), `${pre}-${tag}-week-ground-2new`)
  await toWeekSec(page, 'inputs'); await pic(page, tag, WK('inputs'), `${pre}-${tag}-week-inputs-2new`)
  await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
  await toBoardSec(page, 'ground'); await pic(page, tag, BD('ground'), `${pre}-${tag}-board-ground-1today`)
  await toBoardSec(page, 'inputs'); await pic(page, tag, BD('inputs'), `${pre}-${tag}-board-inputs-1today`)
  console.log(tag, 'board merged', await page.evaluate(MERGE, { title: TITLE.toLowerCase(), pend }))
  await toBoardSec(page, 'ground'); await pic(page, tag, BD('ground'), `${pre}-${tag}-board-ground-2new`)
  await toBoardSec(page, 'inputs'); await pic(page, tag, BD('inputs'), `${pre}-${tag}-board-inputs-2new`)
}

/* A — a day not yet published: a meeting for four men, one of them on leave that day (flagged on the row, D605) */
await scene('draft', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await fileInput(page, { type: 'LL', person: 'Hunter', from: ISO, to: ISO }, touch)
    await fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await fourScreens(page, tag, touch, 'a')
    await ctx.close()
  }
})

/* B — a big one: ten people on the one row */
await scene('big', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await fileInput(page, { type: 'Meeting', people: TEN, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600); await hideToast(page)
    await page.evaluate(MERGE, { title: TITLE.toLowerCase() })
    await toWeekSec(page, 'ground'); await pic(page, tag, WK('ground'), `b-${tag}-week-ground-ten`)
    await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
    await page.evaluate(MERGE, { title: TITLE.toLowerCase() })
    await toBoardSec(page, 'ground'); await pic(page, tag, BD('ground'), `b-${tag}-board-ground-ten`)
    await ctx.close()
  }
})

/* C — a PUBLISHED day: the Wednesday is signed and published first, then the meeting is filed - a change waiting to go out */
await scene('pub', async () => {
  for (const [tag, vp, touch] of SIZES) {
    const { ctx, page } = await open(vp, 'ad', 'a', touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    await page.evaluate(di => window.openScheduler(di), DI); await page.waitForTimeout(900)
    const sels = page.locator(`#schedBoard [data-signday="${DI}"]`)
    for (let i = 0; i < await sels.count(); i++) {
      const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
      if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
      await page.waitForTimeout(120)
    }
    const beak = page.locator(`#schedBoard [data-beak="${DI}"]`).first()
    console.log(tag, 'publish button:', (await beak.innerText()).trim(), 'disabled', await beak.isDisabled())
    await beak.evaluate(b => b.click()); await page.waitForTimeout(700)
    const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
    if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await page.waitForTimeout(900) }
    await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(400)
    await fileInput(page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE, rmk: 'Bring your logbook' }, touch)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600); await hideToast(page)
    // the day's head, with its count of changes waiting
    await page.evaluate(di => { const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]; day.scrollIntoView({ inline: 'start', block: 'nearest' }); window.scrollTo(0, 0) }, DI)
    await page.waitForTimeout(300); await shot(page, `c-${tag}-pub-head-1today`, HEADCLIP[tag])
    const headTxt = await page.evaluate(di => [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di].innerText.slice(0, 400), DI)
    console.log(tag, 'head:', headTxt.replace(/\s+/g, ' '))
    // the list of what is waiting to go out, opened from the day's own count
    const toTop = () => page.evaluate(di => { const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]; day.scrollIntoView({ inline: 'start', block: 'nearest' }); window.scrollTo(0, 0) }, DI)
    const openList = async () => {
      const what = await page.evaluate(di => {
        const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
        const c = [...day.querySelectorAll('*')].filter(e => /\d+\s+pending/.test(e.textContent) && e.textContent.length < 30)
        const el = c[c.length - 1]; el?.setAttribute('data-gi', 'pend')
        return c.map(e => e.tagName + '.' + e.className + ':' + e.textContent).join(' || ')
      }, DI)
      await press(touch, page.locator('[data-gi="pend"]')); await page.waitForTimeout(700)
      return what
    }
    console.log(tag, 'pending chip:', await openList())
    await shot(page, `c-${tag}-pub-list-1today`, await listClip(page))
    const win = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-testid^="win-"]')].find(e => /to go out/i.test(e.innerText)); return w ? { id: w.getAttribute('data-testid'), text: w.innerText.slice(0, 900) } : null })
    console.log(tag, 'changes window:', JSON.stringify(win?.id), (win?.text || '').replace(/\s+/g, ' | '))
    await press(touch, page.locator('.chgwin .win-x')); await page.waitForTimeout(300)
    console.log(tag, 'changes window closed:', !(await page.locator('.chgwin').count()))
    await fourScreens(page, tag, touch, 'c', { pend: true })
    // back on the week: the day's head and the list again, with the count as ruled (D736)
    await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(500)
    await page.evaluate(MERGE, { title: TITLE.toLowerCase(), pend: true })
    await toTop(); await page.waitForTimeout(300); await shot(page, `c-${tag}-pub-head-2new`, HEADCLIP[tag])
    await openList(); await page.evaluate(MERGE, { title: TITLE.toLowerCase(), pend: true }); await page.waitForTimeout(200)
    await shot(page, `c-${tag}-pub-list-2new`, await listClip(page))
    await ctx.close()
  }
})

console.log('errs', errs)
await browser.close()
