const L = await import('./msq-pa-a-lib.mjs')
const { X, say, sleep, sj, tap, phone } = L
say('msq-pa-a-s5 v1', L.size)
const NOW = '2026-07-17T09:00:00'
const w = await L.start(false)
await w.ctx.clock.install({ time: new Date(NOW) })
await w.page.evaluate(() => {
  localStorage.setItem('raptor:settings/grant:gpa1', JSON.stringify({ id: 'gpa1', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-01-01' }))
})
await w.page.reload(); await sleep(1500)
const p = w.page
const bell = async name => {
  const badge = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); const e = document.querySelector('#notifyBell'); return { dot: d ? getComputedStyle(d).display : 'no dot', text: (e?.innerText || '').replace(/\s+/g, ' ').trim(), aria: e?.getAttribute('aria-label') || '' } })
  await tap(p.locator('#notifyBell:visible').first()); await sleep(120)
  await X.pic(w, name + '-press')
  await sleep(800)
  const lines = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' ')) : null })
  const all = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.innerText.replace(/\s+/g, ' ').slice(0, 800) : '(no bell list)' })
  await X.pic(w, name)
  const r = { badge, lines, all }
  say(name, sj(r))
  if (await p.locator('[data-testid="bell-list"]:visible').count()) { await tap(p.locator('#notifyBell:visible').first()); await sleep(600) }
  return r
}
const monthTo = async re => {
  for (let i = 0; i < 12; i++) {
    const t = await p.evaluate(() => (document.querySelector('.inped-win .dcal-title')?.textContent || '').replace(/\s+/g, ' ').trim())
    if (re.test(t)) return t
    await tap(p.locator('.inped-win .dcal-nav[aria-label="Next month"]').first()); await sleep(500)
  }
  throw new Error('month not reached')
}
// 1) Osprey signs in, files LL
await X.login(p, 'us9'); say('Osprey signed in')
await X.L.go(p, 'inputs'); await sleep(1400)
if (!(await p.locator('#inNew:visible').count())) { await tap(p.locator('#inListBtn')); await sleep(800) }
await X.pic(w, 's5-1-osprey-inputs')
await tap(p.locator('#inNew')); await sleep(1400)
say('person select options', await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? s.tagName + ' ' + [...(s.options || [])].map(o => o.text).slice(0, 5).join(',') + ' val=' + s.value : 'none' }))
try { await p.selectOption('#inpEditPerson', { label: 'Osprey' }) } catch (e) { say('person select not set:', e.message.slice(0, 80)) }
await p.selectOption('#inpEditType', { label: 'LL' }); await sleep(600)
await monthTo(/July 2026/)
const d = p.locator('.inped-win .dcal-d[aria-label^="Mon 20 Jul 2026"]').first()
await d.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(400)
await tap(d); await sleep(500)
await X.pic(w, 's5-2-ll-filled')
await tap(p.locator('#inpEditSave')); await sleep(1600)
const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
if (await nd.count()) { await tap(nd); await sleep(1200) }
await X.pic(w, 's5-3-ll-filed')
say('inputs rows', sj(await p.evaluate(() => [...document.querySelectorAll('#page-inputs [data-iid]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 8))))
await X.signOut(w); say('Osprey signed out')
// 2) Kestrel
await X.login(p, 'ad9')
let r = await bell('s5-4-kestrel-bell')
L.rep('S5', 'Kestrel (149 admin) opens the bell after Osprey filed LL', 'RECORD', 'badge=' + sj(r.badge) + ' list=' + r.all, 'RECORDED', 's5-4-kestrel-bell')
await X.signOut(w)
// 3) Hunter
await X.login(p, 'ad2')
r = await bell('s5-5-hunter-bell')
L.rep('S5', 'Hunter (Plan of 149) opens the bell', 'RECORD', 'badge=' + sj(r.badge) + ' list=' + r.all, 'RECORDED', 's5-5-hunter-bell')
// 4) Hunter archives Osprey
await L.toUsers(w)
await L.openRow(w, 'Osprey')
await L.press(w, p.locator('#accEdArchive'), 's5-6-archive')
say('archive toast', (await L.state(w, 'Osprey')).toast)
await X.signOut(w)
await X.login(p, 'ad9')
r = await bell('s5-7-kestrel-bell-after-archive')
L.rep('S5', 'Hunter archived Osprey; Kestrel opens the bell', 'RECORD', 'badge=' + sj(r.badge) + ' list=' + r.all, 'RECORDED', 's5-7-kestrel-bell-after-archive')
// 5) Kestrel's Leave War with Osprey archived
await X.L.go(p, 'leavewar'); await sleep(2500)
await X.pic(w, 's6-k-leavewar-archived')
const lwNames = async () => p.evaluate(() => { const t = document.querySelector('#page-leavewar')?.innerText || ''; return { osprey: /Osprey/.test(t), kestrel: /Kestrel/.test(t), hunter: /Hunter/.test(t), saber: /Saber/.test(t), len: t.length, head: t.replace(/\s+/g, ' ').slice(0, 300) } })
say('Kestrel LeaveWar (Osprey archived)', sj(await lwNames()))
L.rep('Round', 'Kestrel: Leave War while Osprey archived', 'RECORD', sj(await lwNames()), 'RECORDED', 's6-k-leavewar-archived')
await X.signOut(w)
await X.login(p, 'ad2'); await L.toUsers(w)
await tap(p.locator('#accArchToggle')); await sleep(700)
await tap(p.locator('#page-admin button.acc-main', { hasText: /^Osprey/ }).first()); await sleep(900)
await L.press(w, p.locator('#page-admin button:visible', { hasText: /^Restore$/ }).first(), 's5-8-restore')
say('restore toast', (await L.state(w, 'Osprey')).toast)
await X.signOut(w)
await X.login(p, 'ad9')
await X.L.go(p, 'leavewar'); await sleep(2500)
await X.pic(w, 's6-k-leavewar-restored')
L.rep('Round', 'Kestrel: Leave War after Osprey restored', 'RECORD', sj(await lwNames()), 'RECORDED', 's6-k-leavewar-restored')
r = await bell('s5-9-kestrel-bell-after-restore')
L.rep('S5', 'after restore, Kestrel opens the bell', 'RECORD', 'badge=' + sj(r.badge) + ' list=' + r.all, 'RECORDED', 's5-9-kestrel-bell-after-restore')
await L.done(w)
