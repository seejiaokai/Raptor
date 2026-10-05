/* walker TO — P2-09: custom default wording uses the same parser.
   The scenario sets the button's default words on Logic ("RALLY", then blank, then "RALLY — check 13:00"). First the
   Logic page is searched for that setting, in reading and in "Edit rules" mode. What can still be walked without it:
   the two "+ In-time / Rally" buttons (week, board) on new waves without reporting lines, and the same three wordings
   typed by hand into the line the button made — recorded apart, because that is NOT the scenario's route. */
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DI = 0, WHO = ['Comet', 'Cinder']
await T.run('P2-09', async p => {
  /* ---- is the setting there? ---- */
  await T.toPage(p, 'logic')
  const look = async q => { const s = p.locator('#lgSearch'); await s.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); if (q) await p.keyboard.type(q, { delay: 10 }); await L.sleep(450)
    return p.evaluate(() => { const pg = document.querySelector('#page-logic'); const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim(); const count = [...pg.querySelectorAll('*')].map(t).find(x => /^\d+ of \d+ rules/.test(x)) || ''; const cards = [...pg.querySelectorAll('[class*=lg-card], .lgc, .lg-rule, [data-lgrule]')].filter(e => e.offsetParent !== null).map(e => t(e).slice(0, 110)); return { count: count.slice(0, 60), cards: cards.slice(0, 6) } }) }
  const found = {}
  for (const q of ['words', 'wording', 'default', 'button', 'WX/NOTAMS', 'rally']) found[q] = await look(q)
  await look('rally'); const s0 = await pic(p, 'p209-0-logic-search-rally', { fullPage: false })
  await look('')
  await p.locator('#lgEdit').click(); await L.sleep(400)
  const boxes = await p.evaluate(() => [...document.querySelectorAll('#page-logic input:not(#lgSearch), #page-logic textarea, #page-logic select, #page-logic [contenteditable="true"], #page-logic [role="switch"]')].filter(e => e.offsetParent !== null).map(e => (e.getAttribute('aria-label') || e.dataset.lgset || e.dataset.lgkind || e.id || e.type) + (e.type === 'checkbox' ? '' : '=' + (e.value || ''))))
  const textBoxes = boxes.filter(b => !/^(fly|sim|duty|shift|ground|prog)$/.test(b))
  await p.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].find(x => x.children.length === 0 && (x.innerText || '').trim() === 'Nominal report before T/O'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
  const s1 = await pic(p, 'p209-1-logic-edit-nominal-report')
  await p.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].find(x => /^IN-TIME \/ RALLY$/.test((x.innerText || '').trim())); if (e) e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90) }); await L.sleep(250)
  const s2 = await pic(p, 'p209-2-logic-edit-intime-rally-section')
  await T.logicDone(p)
  /* a words setting would be named for the button, the words, Rally or In-time — none of the page's boxes is */
  const wordsBox = textBoxes.filter(b => /word|rally|in.?time|button|wx/i.test(b))
  judge('P2-09.0', 'SETUP — Logic: the search box typed "words", "wording", "default", "button", "WX/NOTAMS", "rally" in turn; then "Edit rules" pressed and every box on the page listed, looking for the setting that holds the button\'s default words (the scenario: "Set default words to RALLY"; the brief: "the words set beside it on Logic").', [
    ['a box for the button\'s words exists on Logic', wordsBox.length > 0, wordsBox.length ? wordsBox.join(', ') : `NONE. Every typing box in Edit rules (${textBoxes.length}): ${textBoxes.join(' · ')}. Searches: ${Object.entries(found).map(([q, r]) => `"${q}" → ${r.count}`).join('; ')}`],
  ], [s0, s1, s2])

  /* ---- the two buttons on new waves without reporting lines ---- */
  await T.boardAt(p, DI)
  const g1 = await T.addWave(p, DI); await T.newForm(p, DI, g1, { cs: 'VL', to: '1200', ld: '1300' }, WHO)
  const g2 = await T.addWave(p, DI); await T.form(p, DI, g2, 0, { cs: 'RU', to: '1200', ld: '1300' })
  await T.itShow(p, 'board', DI, g2)
  const bAdd = await T.itAdd(p, 'board', DI, g2); const s3 = await pic(p, 'p209-3-board-button')
  await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, g1)
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  const wAdd = await T.itAdd(p, 'week', DI, g1); await T.itShow(p, 'week', DI, g1); const s4 = await pic(p, 'p209-4-week-button')
  judge('P2-09.1', `Two new Monday waves without reporting lines (wave ${g1 + 1}: VL 12:00–13:00 Comet / Cinder; wave ${g2 + 1}: RU 12:00–13:00). "+ In-time / Rally" pressed on the BOARD for wave ${g2 + 1} and on the WEEK for wave ${g1 + 1}, Logic untouched.`, [
    ['the week\'s button and the board\'s button fill the same text (the scenario\'s "week and Board differ" would disprove)', wAdd.added === bAdd.added, `week "${wAdd.added}" · board "${bAdd.added}"`],
    ['the clock filled is the earliest take-off less the nominal report (12:00 − 3h = 09:00) — the brief\'s item 2', /^09:00/.test(wAdd.added || '') && /^09:00/.test(bAdd.added || ''), `week "${wAdd.added}" · board "${bAdd.added}" — both carry the take-off's own clock, 12:00`],
  ], [s3, s4])

  /* ---- the three wordings, typed by hand into the week's line (not the scenario's route) ---- */
  const seen = []
  const tryText = async (label, text) => { await T.toEdit(p); await W.showDay(p, DI); const r = await T.itType(p, 'week', DI, g1, 0, text); const h = await T.hours(p, WHO); await T.insShut(p); const held = await T.held(p, DI, 'Comet'); seen.push({ label, text, shown: r.lines.join(' / ') || '(no line left)', fb: r.fb, d: T.dmin(h0, h, 'Comet'), fig: T.delta(h0, h, 'Comet'), held }); return r }
  await tryText('"RALLY"', '09:00 RALLY')
  await T.itShow(p, 'week', DI, g1); const s5 = await pic(p, 'p209-5-week-typed-rally')
  await tryText('"RALLY — check 13:00"', '09:00 RALLY — check 13:00')
  await T.itShow(p, 'week', DI, g1); const s6 = await pic(p, 'p209-6-week-typed-rally-check-1300')
  await tryText('blank words (the clock alone)', '09:00')
  await T.itShow(p, 'week', DI, g1); const s7 = await pic(p, 'p209-7-week-typed-clock-only')
  const hEnd = await T.hours(p, WHO); const s8 = await T.insPicAt(p, 'p209-8-hours-end', 'Comet'); await T.insShut(p)
  const base = seen[0].d
  row('P2-09.2', 'NOT the scenario\'s route (the Logic setting is absent) — the same three wordings typed BY HAND into the week\'s line for wave ' + (g1 + 1) + ' (VL 12:00–13:00, Comet / Cinder; before any line Comet read ' + h0.fig.Comet + '), Insights read after each',
    seen.map(s => `${s.label}: typed "${s.text}" → line shows "${s.shown}", under it "${s.fb}", Comet ${s.fig}; held: ${s.held}`).join(' ||| ') + ` — the prose clock 13:00 ${seen[1].d === seen[0].d ? 'did NOT take over (same figure as "RALLY" alone)' : 'CHANGED the figure'}; the clock-only line ${seen[2].d === seen[0].d ? 'reads the same start' : 'reads a different start'}.`,
    'INFO', [s5, s6, s7, s8])
  row('P2-09', 'the scenario as written (set the default words on Logic to "RALLY", blank, "RALLY — check 13:00", and press Add on the week and the board each time)', 'NOT WALKED as written: Logic has no setting for the button\'s words in this build (P2-09.0). Walked instead: both buttons with the built-in words (P2-09.1) and the three wordings typed by hand (P2-09.2).', 'NOT WALKED', [])
})
