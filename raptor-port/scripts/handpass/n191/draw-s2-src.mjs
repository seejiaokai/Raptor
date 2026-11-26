// draw-s2-src - section 2's drawings (chat 191, 26 Nov 26): the SOURCES every s2 drawing is made from, read off the REAL
// app served at 4700 in round 6's world (n176's r6-users-state.json, read only) and kept in .tmp/n176-draw/s2-sources.json:
//   ARCH   the page's own "▸ Archived" fold (the folded headings are cloned from it)
//   P      each squadron's own people as its page lists them (Saber, a master admin)
//   COUNT  each squadron's "People · N"
//   CARD   real opened rows: k.* opened by Kestrel on 149's page (by the search), h.* by Hunter with 149 picked
// Nothing here writes the app's code.   node raptor-port/scripts/handpass/n191/draw-s2-src.mjs   (FRESH=1 re-reads)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { run, as, FACT, wait, vis, hit, usersTab, reachPick, words, typeInto, TMP, closeAll } from '../n176/draw-r5b-lib.mjs'
export const R6 = resolve(TMP, 'r6-users-state.json'), SRC = resolve(TMP, 's2-sources.json')
const n = t => Number(String(t).replace(/\D+/g, ''))
const peopleNow = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].filter(e => !e.querySelector('.acc-sqn')).map(e => {
  const sub = [...e.querySelector('.acc-sub').childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.classList?.contains('od-rw') || n.classList?.contains('od-plans') || n.classList?.contains('od-po') || n.classList?.contains('acc-tag') ? '' : n.textContent)).join('')
  const parts = sub.split(' · ').map(x => x.trim()).filter(Boolean)
  const ub = e.querySelector('.ub')
  return { pid: e.dataset.person, cs: e.querySelector('.acc-name').childNodes[0].textContent, seatCat: parts.slice(1).filter(p => !/^also /.test(p)).join(' · '), signIn: e.querySelector('.acc-sub b')?.textContent ?? null, badge: ub ? ub.textContent.trim() : null, badgeClass: ub ? ub.className : null, whole: e.innerText.replace(/[ \t\r\n]+/g, ' ').trim() }
}))
async function openCard(s, cs) {
  await typeInto(s, '#accFind', cs); await wait(s, 400)
  await hit(s, vis(s, '#page-admin .acc-row[data-person] .acc-tap').filter({ hasText: new RegExp('^' + cs) }).first(), 700)
  const html = await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on').outerHTML)
  const text = await s.page.evaluate(() => document.querySelector('.acc-row.od-row-on .acc-edit')?.innerText.replace(/[ \t\r\n]+/g, ' ').trim())
  if (await vis(s, '#accEdCancel').count()) await hit(s, '#accEdCancel', 400)
  await typeInto(s, '#accFind', ''); await wait(s, 300)
  return { html, today: text }
}
export async function sources() {
  if (existsSync(SRC) && !process.env.FRESH) return JSON.parse(readFileSync(SRC, 'utf8'))
  if (!existsSync(R6)) throw new Error('no round-6 world: run n176/draw-r6-users.mjs first')
  const S = { ARCH: null, P: {}, COUNT: {}, CARD: {} }
  await run('s2.read.saber', 'd', async s => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    S.ARCH = await s.page.evaluate(() => document.querySelector('#accArchived').outerHTML)
    S.P['142'] = await peopleNow(s); S.COUNT['142'] = n((await words(s, '.od-head .adm-sub'))[0])
    for (const u of [149, 150]) { await reachPick(s, u, 'bar'); await usersTab(s); await wait(s, 400); S.P[u] = await peopleNow(s); S.COUNT[u] = n((await words(s, '.od-head .adm-sub'))[0]) }
  }, { state: R6 })
  await run('s2.read.kestrel', 'd', async s => {
    await as(s, 'kestrel'); await usersTab(s); await wait(s, 400)
    for (const cs of ['Blade', 'Basher', 'Ranger', 'Hunter', 'Bolt', 'Cinch']) S.CARD['k.' + cs] = await openCard(s, cs)
  }, { state: R6 })
  await run('s2.read.hunter', 'd', async s => {
    await as(s, 'hunter'); await reachPick(s, 149, 'bar'); await usersTab(s); await wait(s, 400)
    for (const cs of ['Blade', 'Hunter']) S.CARD['h.' + cs] = await openCard(s, cs)
  }, { state: R6 })
  writeFileSync(SRC, JSON.stringify(S))
  FACT('s2.sources', { counts: S.COUNT, cardsToday: Object.fromEntries(Object.entries(S.CARD).map(([k, v]) => [k, v.today])) })
  return S
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) { try { const S = await sources(); FACT('s2.sources.kept', { counts: S.COUNT, cards: Object.keys(S.CARD) }) } finally { await closeAll() } }
