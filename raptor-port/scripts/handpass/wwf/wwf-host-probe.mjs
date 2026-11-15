/* wwf host probe v1 (16 Nov 26, chat 86) — [WARN-WORDS-STANDALONE]'s follow-ups, the FULL check's walk: the host proves
   the routes before the walker. On the frozen build of 7eade5b52, through the board's own controls:
     Saturday: + Block → SC Shift (template 'sc'); its first row START 20:00, END cleared, Ranger seated;
     Sunday: a flight, take-off 09:00, landing 10:00, Ranger in the front seat;
     read the warnings (no crew-rest line expected — D2073), then type the desk's END 23:00 (a crew-rest line expected:
     clear 11:00 after a 12h rest), then clear END again (gone again).
     The control: the same on a plain "Empty block" desk for Havoc (crew rest counts START + 1h — the builder's reading).
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/wwf/wwf-host-probe.mjs */
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const PHONE = process.env.PHONE === '1'
process.env.WWW_DIST ||= 'C:/Users/User/AppData/Local/Temp/walk-7eade5b52'
process.env.WWW_BUNDLE ||= 'index-Dqzz8EGM.js'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'probe-' + (PHONE ? 'p' : 'd')
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-16-warn-words-followups', 'host', process.env.WWW_RUN)
const X = await import('../www/www-lib.mjs')
const { say, sleep, SAT, SUN } = X
say('wwf-host-probe v1', PHONE ? 'phone' : 'desktop')
const w = await X.open({ phone: PHONE })
const { page, P } = w
const crew = l => /crew rest/i.test(l)

await X.board(w, SAT)
const wi = await page.evaluate(d => (window.DAYS[d].dutywaves || []).length, SAT)
await X.press(w, `[data-dwadd="${SAT}"]`, { scope: 'board' }); await sleep(300)
await X.press(w, `[data-blktpl="sc"]`); await sleep(400)
const blk = await page.evaluate(([d, i]) => { const b = window.DAYS[d].dutywaves[i]; return b && { label: b.label, sa: b.sa, rows: b.rows.map(r => r.role + ' ' + r.str + '-' + r.end) } }, [SAT, wi])
say('SC block made', JSON.stringify(blk))
const base = `${SAT}.${wi}.0`
await X.typeIn(w, `[data-bfld="dr:${base}.str"]`, '20:00')
await X.typeIn(w, `[data-bfld="dr:${base}.end"]`, '')
say('seat desk', await X.seat(w, `[data-fill="d:${base}.+"]`, 'bane'))
await X.closeBoard(w)
await X.board(w, SUN)
const fw = await X.flight(w, SUN, '09:00', '10:00', 'bane', { msn: 'VL BFM' })
say('flight', JSON.stringify(fw))
let bw = await X.boardWarn(w)
say('A: SC desk, END blank — crew-rest lines for Ranger', JSON.stringify(bw.filter(l => crew(l) && /Ranger/.test(l))))
await X.pic(w, `probe-a-blank-${P}`)
await X.closeBoard(w)
await X.board(w, SAT)
await X.typeIn(w, `[data-bfld="dr:${base}.end"]`, '23:00')
await X.closeBoard(w)
await X.board(w, SUN)
bw = await X.boardWarn(w)
say('B: END 23:00 — crew-rest lines for Ranger', JSON.stringify(bw.filter(l => crew(l) && /Ranger/.test(l))))
await X.pic(w, `probe-b-end-${P}`)
await X.closeBoard(w)
await X.board(w, SAT)
await X.typeIn(w, `[data-bfld="dr:${base}.end"]`, '')
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', SUN)
say('C: END cleared — Sunday week list crew-rest lines', ww.head, JSON.stringify(ww.items.filter(l => crew(l) && /Ranger/.test(l))))
await X.pic(w, `probe-c-cleared-${P}`)
const tr = await X.trace(w, '#eWeek', SAT, 'bane')
say('C: Saturday forward trace for Ranger', JSON.stringify(tr))
await X.fin(w)
