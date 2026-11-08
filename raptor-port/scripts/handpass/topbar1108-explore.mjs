import { open, tab, V } from './topbar1108-lib.mjs'
console.log('[topbar1108-explore v3]')
const { br, p } = await open({ dist: 'C:/Users/User/AppData/Local/Temp/topbar-dist-after' })
await tab(p, 'editsched')
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#shell > .topbar *')].filter(e => e.id || e.getAttribute('aria-label')).map(e => e.tagName + '#' + e.id + '|' + e.getAttribute('aria-label') + '|' + (e.getBoundingClientRect().width | 0)))))
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-editsched button')].filter(e => /board/i.test(e.textContent + e.id + (e.title || ''))).map(e => e.id + '|' + e.className + '|' + e.textContent.trim().slice(0, 30)))))
await br.close()
