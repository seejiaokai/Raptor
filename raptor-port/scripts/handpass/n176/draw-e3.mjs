// draw-e3 - the bell with three squadrons (his D2624, D2628 C1) and the Plan lines to a squadron's admins (D2626).
// SET-UP by presses, Saber (master admin) from the world, saved as this script's own state:
//   142: + Input - Hunter, Duty, Tue 8 Dec 2026 → Save                (Hunter's bell: "You were added", a 142 line)
//   149: picked; + Input - Heron, Duty, Tue 8 Dec 2026 → Save; Inputs settings → Calendar → Holidays → + Add: 8 Dec,
//        "Squadron Day" → Save, the OIL list left with "Later"         (149's admins' bell - Hunter holds Plan of 149)
//   150: picked; the same with Mako                                  (150's admins' bell: Mako, a master admin)
// "Squadron Day" is the case's data (a holiday's name), not a word of the drawing.
//  e3 (d, p)  THE DRAWING OF RECORD (the host's redraw, 25 Nov 26 - D2191: a View holder's bell never shows that squadron):
//             SABER's bell (master admin, primary 142). One more press for him, from this script's state: 142's Inputs
//             settings → Calendar → Holidays → + Add: 8 Dec, "Squadron Day" (Hunter's 8 Dec duty stands on it) - so each of
//             142, 149 and 150 has a holiday line written to its admins, a master admin among them (state e3s). His bell's
//             "Show" buttons for 149 and 150 pressed on (his own saved choice, D2198 - off by default for a master admin).
//             Every line real, none cloned; the number first on every line, one column; his own account's lines (none
//             here - FACT) would keep the place empty.
//  e3h (d, p) Hunter's bell (the first drawing, kept): his real lines - 142's input line, 149's holiday line, his two account lines ("Given Plan of
//             149: …", "Given View of 150") - and ONE LINE CLONED: 150's holiday line. Hunter holds only View of 150, and
//             a View holder's bell never carries a squadron's lines (D2191), so the app sends him none; the line is a
//             real line of his bell cloned, its words those of 150's real holiday line as Saber's bell shows it.
//             THE CHANGE DRAWN: every squadron's line wears its grey number (the app's own `.bl-sqn` badge) at the very
//             start of its first line, in one column (a fixed width), no colour; his own account's lines keep the place
//             empty. Today's after-the-name mark is moved, not doubled.
//  e3b-d      Kestrel's bell (149's admin, his bell one squadron - no numbers, D2624) with the two new lines of D2626,
//             cloned from a real line of his bell: W.planGivenLine, W.planEndedLine (who, date, words, signer).
//  e3b2-d     the same, Hunter's callsign wearing his home squadron's grey "142" beside it (the app's `.bl-sqn`, after
//             the name, as today's mark sits).
//   node raptor-port/scripts/handpass/n176/draw-e3.mjs        (ONLY=e3-d,e3-p,e3h-d,e3h-p,e3b,e3b2; FRESH=1 remakes the set-up)
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, FACT, want, wait, vis, hit, reachPick, shot, box, closeAll, world, TMP, LIST, lineParts, numbersFirst } from './draw-lib.mjs'
import { fileInput, tapBell, bellLines, go } from '../n175/p6-lib.mjs'
const ST = resolve(TMP, 'state-e3.json')
async function addHoliday(s, name) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 500)
  await hit(s, '#inGear', 500); await hit(s, '[data-testid="iset-days"]', 700)
  if (await vis(s, '[data-testid="days-tab-holidays"]').count()) await hit(s, '[data-testid="days-tab-holidays"]')
  await hit(s, '[data-testid="hol-add"]', 500)
  await vis(s, '[data-testid="hol-name"]').first().fill(name)
  const cal = '[data-testid="hol-dates"]'
  const day = () => page.locator(`${cal} button[aria-label*="8 Dec"], ${cal} button[aria-label*="8 December 2026"], ${cal} [data-iso="2026-12-08"]`).first()
  for (let i = 0; i < 14 && !(await day().count()); i++) { const nx = page.locator(`${cal} button[aria-label^="Next"]`).first(); if (!(await nx.count())) break; await hit(s, nx, 250) }
  await hit(s, day(), 300)
  await hit(s, '[data-testid="hol-save"]', 900)
  const lead = await page.evaluate(() => document.querySelector('[data-testid="odl-lead"]')?.textContent.trim() ?? null)
  if (await vis(s, '[data-testid="odl-later"]').count()) await hit(s, '[data-testid="odl-later"]', 600)
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await wait(s, 250) }
  return { lead }
}
async function setup() {
  if (existsSync(ST) && !process.env.FRESH) return JSON.parse(await import('node:fs').then(f => f.readFileSync(ST + '.line.json', 'utf8')))
  let line150 = null
  await run('e3.setup', 'd', async s => {
    await as(s, 'saber')
    FACT('e3.setup.142.hunterDuty', await fileInput(s, 'Hunter', 'Duty', 'Tue 8 Dec 2026', 'n176 duty'))
    for (const [n, who] of [[149, 'Heron'], [150, 'Mako']]) {
      await reachPick(s, n, 'bar')
      FACT(`e3.setup.${n}.duty`, await fileInput(s, who, 'Duty', 'Tue 8 Dec 2026', 'n176 duty'))
      FACT(`e3.setup.${n}.holiday`, await addHoliday(s, 'Squadron Day'))
    }
    /* 150's real holiday line, as Saber's bell shows it (his "Show" button for 150 pressed on, his own choice) */
    await tapBell(s)
    const on = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: /^150$/ })
    if (await on.count() && (await on.first().getAttribute('aria-pressed')) !== 'true') await hit(s, on.first(), 500)
    const lines = await lineParts(s)
    FACT('e3.setup.saberBell', lines)
    line150 = lines.find(l => l.mark === '150') || null
    await reachPick(s, 142, 'bar'); await wait(s, 600)
    writeFileSync(ST, JSON.stringify(await s.ctx.storageState()))
  }, { state: await world() })
  writeFileSync(ST + '.line.json', JSON.stringify(line150))
  return line150
}
const ABOUT_HIM = ['^Given (Plan|View) of', '^Plan of .* ended']
try {
  const line150 = await setup()
  FACT('e3.line150', line150)
  const st = ST
  /* SABER'S STATE: 142's own holiday on 8 Dec added by his press (Hunter's 8 Dec duty stands on it) */
  const STS = resolve(TMP, 'state-e3s.json')
  if (!existsSync(STS) || process.env.FRESH) await run('e3s.setup', 'd', async s => {
    await as(s, 'saber')
    FACT('e3s.setup.142.holiday', await addHoliday(s, 'Squadron Day'))
    await wait(s, 600); writeFileSync(STS, JSON.stringify(await s.ctx.storageState()))
  }, { state: ST })
  /* and a line about him by another man's press (a man is never told of his own change): Hunter files a duty for Saber
     on 142. (Kestrel cannot do the same on 149: 149's "+ Input" does not offer Saber - tried 25 Nov 26.) */
  if (!existsSync(STS + '.more') || process.env.FRESH) {
    for (const [who, day] of [['hunter', 'Wed 9 Dec 2026']]) await run(`e3s.setup.${who}`, 'd', async s => {
      await as(s, who)
      FACT(`e3s.setup.${who}.dutyForSaber`, { squadron: await s.page.evaluate(() => [...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 0)?.textContent), ...(await fileInput(s, 'Saber', 'Duty', day, 'n176 duty')) })
      await wait(s, 600); writeFileSync(STS, JSON.stringify(await s.ctx.storageState()))
    }, { state: STS })
    writeFileSync(STS + '.more', 'done')
  }
  for (const sz of ['d', 'p']) if (want('e3-' + sz)) await run(`e3.${sz}`, sz, async s => {
    const k = `e3.${sz}`
    await as(s, 'saber'); await tapBell(s)
    FACT(`${k}.showBefore`, await s.page.evaluate(l => [...document.querySelectorAll(l + ' [data-testid="bell-show"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST))
    FACT(`${k}.linesBefore`, (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what}`))
    /* his own switch: 149 and 150 pressed on */
    for (const n of ['149', '150']) {
      const b = vis(s, `${LIST} [data-testid="bell-show"] button`).filter({ hasText: new RegExp('^' + n + '$') })
      if (await b.count() && (await b.first().getAttribute('aria-pressed')) !== 'true') { await b.first().click(); await wait(s, 400) }
    }
    if (!(await s.page.locator(LIST).count())) await tapBell(s)
    FACT(`${k}.showAfter`, await s.page.evaluate(l => [...document.querySelectorAll(l + ' [data-testid="bell-show"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'}`), LIST))
    const real = await lineParts(s)
    FACT(`${k}.realLines`, real)
    FACT(`${k}.ownAccountLines`, real.filter(l => ABOUT_HIM.some(re => new RegExp(re).test(l.what || ''))).length || 'none on his bell - no account line of his was raised')
    const r = await numbersFirst(s, { home: '142', about: ABOUT_HIM })
    FACT(`${k}.column`, r)
    FACT(`${k}.drawn`, (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`))
    FACT(`${k}.cloned`, 'none - every line raised by presses')
    await s.page.evaluate(() => document.activeElement?.blur())
    await s.page.mouse.move(s.W - 2, s.H - 2).catch(() => {})   // the pointer off the list: the Show press left it over a line, lit as hovered
    await shot(s, `e3-${sz}-bell`, [await box(s, LIST), await box(s, '#notifyBell, .bellbtn')])
  }, { state: STS })
  for (const sz of ['d', 'p']) if (want('e3h-' + sz)) await run(`e3h.${sz}`, sz, async s => {
    const k = `e3h.${sz}`
    await as(s, 'hunter'); await tapBell(s)
    const real = await lineParts(s)
    FACT(`${k}.realLines`, real)
    if (!line150) throw new Error('no 150 line to clone')
    const at = real.findIndex(l => l.mark === '149')
    const r = await numbersFirst(s, { home: '142', about: ABOUT_HIM, clones: [{ ...line150, after: at >= 0 ? at : null }] })
    FACT(`${k}.column`, r)
    FACT(`${k}.drawn`, (await lineParts(s)).map(l => `${l.mark ?? '-'} | ${l.name} ${l.day} | ${l.what} | ${l.ago}`))
    FACT(`${k}.cloned`, 'the 150 line: a real line of this bell cloned, its name, day, words and age those of 150\'s real holiday line in Saber\'s bell')
    FACT(`${k}.showRow`, await s.page.evaluate(l => document.querySelector(l + ' [data-testid="bell-show"]')?.innerText.replace(/\s+/g, ' ') ?? 'none', LIST))
    await shot(s, `e3h-${sz}-bell`, [await box(s, LIST), await box(s, '#notifyBell, .bellbtn')])
  }, { state: st })
  for (const [key, mark] of [['e3b', false], ['e3b2', true]]) if (want(key)) await run(key, 'd', async s => {
    await as(s, 'kestrel'); await tapBell(s)
    const real = await lineParts(s)
    FACT(`${key}.realLines`, real)
    const acct = real.find(l => /^Given /.test(l.what || '')) || real[0]
    const mk = (L, i) => ({ name: L.who, mark: mark ? '142' : null, day: acct.day, what: `${L.words('149')} · ${L.by}`, ago: acct.ago, unread: true, after: null })
    const clones = [mk(W.planEndedLine), mk(W.planGivenLine)]
    /* newest first: "ended" on top (both drawn, as if given then ended) - the clones go before the real lines */
    await s.page.evaluate(({ L, clones }) => {
      const lines = [...document.querySelectorAll(L + ' .bl-line')], tpl = lines[0]
      for (const c of clones.reverse()) {
        const e = tpl.cloneNode(true); e.removeAttribute('data-testid'); e.dataset.n176 = 'cloned'; e.classList.add('unread')
        e.querySelector('.bl-name').textContent = c.name; e.querySelector('.bl-sqn')?.remove()
        if (c.mark) { const m = document.createElement('span'); m.className = 'bl-sqn'; m.textContent = c.mark; e.querySelector('.bl-name').after(m) }
        e.querySelector('.bl-day').textContent = c.day; e.querySelector('.bl-what').textContent = c.what; e.querySelector('.bl-ago').textContent = c.ago
        tpl.parentElement.prepend(e)
      }
    }, { L: LIST, clones })
    FACT(`${key}.clonedFrom`, { line: acct, note: 'a real line of his bell cloned; its day and age kept, its name, mark and words replaced' })
    FACT(`${key}.drawn`, (await lineParts(s)).map(l => `${l.name}${l.mark ? ' [' + l.mark + ']' : ''} ${l.day} | ${l.what} | ${l.ago}`))
    const b = await box(s, LIST), c = await s.page.evaluate(L => { const e = [...document.querySelectorAll(L + ' [data-n176="cloned"]')]; const r = e.map(x => x.getBoundingClientRect()); return { x: Math.min(...r.map(q => q.left)), y: Math.min(...r.map(q => q.top)), w: Math.max(...r.map(q => q.width)), h: r.reduce((a, q) => a + q.height, 0) } }, LIST)
    await shot(s, `${key}-d-bell`, [b, await box(s, '#notifyBell, .bellbtn')])
  }, { state: st })
} finally { await closeAll() }
