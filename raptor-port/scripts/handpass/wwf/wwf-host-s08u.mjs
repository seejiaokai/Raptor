/* wwf host (chat 88) — reproduce w1's S8-U lead: hide the "Illegal seat" line, show it again, then press the BOARD's
   own Undo (#sbUndo — the page's #undoBtn sits behind the board's bar, which is what w1's script pressed), then Redo.
   usage: [PHONE=1] node wwf-host-s08u.mjs   (the new frozen build of fd8c40f40) */
import * as H from './wwf-w1-lib.mjs'
process.env.WWW_DIST = 'C:/Users/User/AppData/Local/Temp/walk-fd8c40f40'
process.env.WWW_BUNDLE = 'index-B9-7bbV4.js'
const PHONE = process.env.PHONE === '1'
const X = await H.init(PHONE ? 'host-s08u-p' : 'host-s08u', PHONE)
const { say, sleep, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const D = 1
const seatLine = async () => (await X.boardWarn(w)).filter(l => /Illegal seat/.test(l))
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
await X.board(w, D)
await X.press(w, `[data-wvadd="${D}"]`, { scope: 'board' }); await sleep(300)
await X.press(w, '.wavemenu [data-wmkind="avalon"]'); await sleep(700)
say('seat', await X.seat(w, `[data-slot="${D}.0.0.0.p"]`, 'rocky'))
say('0 start', JSON.stringify(await seatLine())); await pic(w, '00-start')
const cross = () => page.locator('#schedBoard #sbWarn .wln', { hasText: 'Illegal seat' }).locator('button:visible, [data-whide]:visible, .wx:visible').first()
await cross().click(); await sleep(700); say('1 after hide', JSON.stringify(await seatLine())); await pic(w, '01-hidden')
await cross().click(); await sleep(700); say('2 after show', JSON.stringify(await seatLine())); await pic(w, '02-shown')
say('sbUndo enabled', await page.locator('#sbUndo:visible').isEnabled())
await X.press(w, '#sbUndo', { after: '03a-undo-press' }); await sleep(700); say('3 after undo 1', JSON.stringify(await seatLine())); await pic(w, '03-undo1')
await X.press(w, '#sbUndo'); await sleep(700); say('4 after undo 2', JSON.stringify(await seatLine())); await pic(w, '04-undo2')
await X.press(w, '#sbRedo'); await sleep(700); say('5 after redo 1', JSON.stringify(await seatLine())); await pic(w, '05-redo1')
await X.press(w, '#sbRedo'); await sleep(700); say('6 after redo 2', JSON.stringify(await seatLine())); await pic(w, '06-redo2')
say('errors', JSON.stringify(w.errors || []))
await X.fin(w)
