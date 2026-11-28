// does WebKit launch here? (one line: OK or the error)
import { webkit } from '@playwright/test'
try { const b = await webkit.launch(); const p = await (await b.newContext()).newPage(); await p.goto('http://localhost:4700/'); console.log('WEBKIT OK', await p.title()); await b.close() } catch (e) { console.log('WEBKIT FAILED', String(e).split('\n')[0]); process.exitCode = 1 }
