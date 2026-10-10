// S11 follow-up: read the Leave War row figures (OIL columns) for Ranger around the leave
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, signDay, pidOf, figs } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const w = await world(); const { page } = w
const p = await pidOf(page, 'Ranger')
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S11 duty', oil: 'yes' })
await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
await cr(page); say('1 issued: Ranger row figures', await figs(page, 'Ranger')); await shot(page, 'S11-C1-figs-issued')
await go(page, 'editsched'); await fileInput(page, { iso: '2026-07-18', kind: 'LL', person: p, rmk: 'S11 leave' })
await cr(page); say('2 leave filed, not yet AL: Ranger row figures', await figs(page, 'Ranger')); await shot(page, 'S11-C2-figs-leave-filed')
await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
await cr(page); say('3 after AL1: Ranger row figures', await figs(page, 'Ranger')); await shot(page, 'S11-C3-figs-after-al')
say('errors', w.errors)
await w.browser.close()
