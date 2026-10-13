// THE HOST'S SHORT LOOK at "→ Unavail" waiting on its OIL question (owner D804, 13 Oct 26) — the Inputs batch's check §14.
// It serves the built app itself, then by the app's own controls: an input of kind Other filed on a working Friday; the
// Friday made a public holiday, its list left for later; the input taken off; "→ Unavail" pressed — on the SCHEDULER
// BOARD's card and on EDIT SCHEDULE's week line, at a desktop and a phone. A PASS means the right behaviour.
//   node scripts/handpass/ib/d804-look.mjs [out folder]
// VERSION 3
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import * as L from './w1/ibl.mjs'

const DIST = resolve(L.PORT, 'dist')
const OUT = resolve(process.argv[2] || join(L.PORT, 'docs/img/handpass/2026-10-13-inputs-batch/d804'))
mkdirSync(OUT, { recursive: true })
console.log(`d804-look VERSION 3 — ${DIST} -> ${OUT}`)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url || '/').split('?')[0])))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file))
})
await new Promise((done, fail) => { server.once('error', fail); server.listen(+new URL(L.BASE).port, '127.0.0.1', done) })

let bad = 0
const say = (id, ok, note) => { if (!ok) bad++; console.log(`[${id}] ${ok ? 'PASS' : 'FAIL'} — ${note}`) }
const shot = async (s, name) => { await s.page.screenshot({ path: join(OUT, `${name}.png`) }); return `${name}.png` }
const acc = (page, iid) => page.evaluate(i => String((window.INPUTS.find(r => String(r.iid) === String(i)) || {}).acc || ''), iid)
const b = await L.launch()

for (const size of ['desktop', 'phone']) for (const where of ['board', 'week']) {
  const id = `${where}-${size}`
  const s = await L.session(b, size), { page } = s
  try {
    const iid = await L.fileIt(s, L.FRI, { type: 'Other', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
    await L.makeHoliday(s, 'later')
    const root = where === 'board' ? '#schedBoard' : '#eWeek'
    const btn = k => page.locator(`${root} [data-acc="${k}"][data-acck="${iid}"]:visible`).first()
    const open = async k => {
      if (await btn(k).count()) return
      const t = page.locator(`${root} [data-pitog="${L.FRI_DI}"]:visible`).first()
      if (await t.count()) { await t.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await page.waitForTimeout(450) }
    }
    const pressBtn = async k => { await open(k); const x = btn(k); await x.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); if (s.tap) await x.tap(); else await x.click(); await page.waitForTimeout(450) }
    if (where === 'board') { await L.openBoard(s, L.FRI_DI); await L.takeOff(s, L.FRI_DI, iid) }
    else { await L.go(page, 'editsched'); await pressBtn('x') }
    say(`${id} premise`, (await acc(page, iid)) === 'r' && Object.keys(await L.oilOf(page, iid)).length === 0, `taken off, no answer (acc=${await acc(page, iid)})`)
    /* the two buttons of an Other */
    await open('u')
    const words = [await L.txt(page, `${root} [data-acc="g"][data-acck="${iid}"]`), await L.txt(page, `${root} [data-acc="u"][data-acck="${iid}"]`)]
    await btn('u').evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await shot(s, `${id}-1-the-two-buttons`)
    say(`${id} buttons`, /ground/i.test(words[0] || '') && /unavail/i.test(words[1] || ''), `the card offers ${JSON.stringify(words)} (drawn in capitals)`)
    /* "→ Unavail": the question, and nothing filed */
    await pressBtn('u')
    const lead = await L.txt(page, '[data-testid="oilconf-lead"]'), no = await L.txt(page, '[data-testid="oilconf-cancel"]'), yes = await L.txt(page, '[data-testid="oilconf-save"]')
    const fit = lead ? await L.whollyIn(page, '[data-testid="oilconf"] .airpop-box', ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]']) : ['no sheet']
    const box = lead ? await L.onTopAndInside(page, '[data-testid="oilconf"] .airpop-box') : {}
    await shot(s, `${id}-2-the-question`)
    say(`${id} question`, lead === "Filing Ranger's Range brief under Unavailable" && no === 'Don’t file' && yes === 'File' && fit.every(x => x === 'in') && box.top && box.inside && (await acc(page, iid)) === 'r',
      `lead "${lead}", buttons "${no}" / "${yes}", both inside the card ${JSON.stringify(fit)}, the card on top and inside the screen ${JSON.stringify(box)}, still not filed (acc=${await acc(page, iid)})`)
    /* left unanswered: the bar */
    await s.press('[data-testid="oilconf-cancel"]')
    const bar = await L.txt(page, '[data-testid="oilbar-text"]'), barBox = await L.onTopAndInside(page, '[data-testid="oilbar"]')
    await shot(s, `${id}-3-not-filed-the-bar`)
    say(`${id} bar`, bar === 'Not filed — OIL not answered' && barBox.top && barBox.inside && (await acc(page, iid)) === 'r', `bar "${bar}" ${JSON.stringify(barBox)}; not filed`)
    /* answered from the bar: filed, with its answer; listed under Unavailable */
    await s.press('[data-testid="oilbar-answer"]')
    await s.press('[data-testid="oil-yes"]')
    await s.press('[data-testid="oilconf-save"]')
    await page.waitForTimeout(500)
    const oil = await L.oilOf(page, iid), a = await acc(page, iid)
    const listed = await page.evaluate(([root, i]) => { const r = document.querySelector(`${root} [data-inprow="${i}"]`); if (r) r.scrollIntoView({ block: 'center', inline: 'center' }); return !!r }, [root, iid])
    await page.waitForTimeout(250)
    await shot(s, `${id}-4-filed-under-unavailable`)
    say(`${id} filed`, a === 'u' && oil[L.FRI] === 0.5 && (await L.rowsOf(page, L.FRI_DI)).length === 0 && !(await page.locator('[data-testid="oilbar"]').count()),
      `acc=${a}, answer=${JSON.stringify(oil)}, not on the programme, the bar gone; its row on the day's Unavailable list ${listed ? 'is drawn' : 'NOT FOUND by [data-inprow]'}`)
    /* one Undo: taken off again, and unanswered */
    const u = await L.findUndoBtn(page)
    if (u && u.id) { await page.locator('#' + u.id).first().evaluate(e => e.click()); await page.waitForTimeout(500) }
    say(`${id} undo`, (await acc(page, iid)) === 'r' && Object.keys(await L.oilOf(page, iid)).length === 0, `ONE Undo: acc=${await acc(page, iid)}, answer=${JSON.stringify(await L.oilOf(page, iid))} (the Undo button: ${JSON.stringify(u && u.id)})`)
    say(`${id} errors`, s.errs.length === 0, s.errs.length ? s.errs.join(' | ').slice(0, 300) : 'no page error, no console error, no failed request')
  } catch (e) { bad++; console.log(`[${id}] FAIL — the script stopped: ${String(e && e.message || e).slice(0, 300)}`); await shot(s, `${id}-STOPPED`).catch(() => {}) }
  await s.ctx.close()
}
console.log(`\n${bad ? bad + ' FAILED' : 'every check passed'}`)
await b.close(); server.close()
process.exit(bad ? 1 : 0)
