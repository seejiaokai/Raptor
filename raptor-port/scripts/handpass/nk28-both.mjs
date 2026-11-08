// The host's re-walk after the readers' fix: `?nostore&savefail` in a browser that keeps — "Not kept" now, and the
// browser's storage holds no record afterwards. From raptor-port/:  WALK_DIR=dist node scripts/handpass/nk28-both.mjs
console.log('nk28-both v1')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, vis, shot } = H
const w = await world({ locked: false, url: '/?nostore&savefail' }); const p = w.page
await p.waitForSelector('#luser'); await L.login(p, 'a'); await p.evaluate(() => window.go('editsched')); await sleep(1200)
const kept = await vis(p, '.topbar > .savestat.nokeep'), failed = await vis(p, '.topbar > .savestat.failed')
const rows = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:')).length)
await shot(p, 'both-editsched')
console.log(JSON.stringify({ notKept: !!kept, notSaved: !!failed, raptorRecordsInStorage: rows, errors: w.errors || [] }))
process.exit(0)
