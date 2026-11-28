// q-probe - a first look before the drawings (chat 204): the probe is on the page, the squadron list's rows and
// their ids, and that nothing refuses at rest.   node raptor-port/scripts/handpass/n204/q-probe.mjs
import { run, closeAll, FACT, signIn, listOpenedAndClosed, PROBE, go, wait, vis, hit, words } from './q-lib.mjs'
FACT('probe', PROBE)
for (const sz of ['d', 'p']) await run('probe.' + sz, sz, async s => {
  await signIn(s, 'ad', 'a')
  await listOpenedAndClosed(s, 'probe.' + sz)
  FACT(`probe.${sz}.openAtRest`, await s.page.evaluate(() => window.__n204.open([])))
  if (s.desk) {
    await go(s, 'admin'); await wait(s, 700)
    FACT('probe.d.adminCats', await words(s, '#page-admin button.adm-cat'))
    FACT('probe.d.adminHtml', await s.page.evaluate(() => document.querySelector('#page-admin')?.innerText.replace(/\s+/g, ' ').slice(0, 600)))
  }
})
await closeAll()
