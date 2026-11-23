// jc-words - each approved new wording drawn by the build at 2x and put beside its picture on the drawn page: the Request access card, the Undo bubbles, the bell's lines.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as } from './jlib.mjs'
import { toast, editRow, saveRow, toUsers, doUndo, doRedo, bell, tips } from './jc-lib.mjs'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('jc-words v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const MOCK = resolve(HERE, '../../../../docs/mock/2026-11-24-msq-new-words/img')
const P = picsFor('jc-words')
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
async function beside(tool, name, drawn, built, h) {
  const a = readFileSync(resolve(MOCK, drawn)).toString('base64'), b = readFileSync(built).toString('base64')
  await tool.setViewportSize({ width: 1440, height: h || 700 })
  await tool.setContent(`<body style="margin:0;background:#2a2a2a;color:#fff;font:14px sans-serif;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start"><div>Approved drawing<br><img src="data:image/png;base64,${a}" style="max-width:690px"></div><div>This build<br><img src="data:image/png;base64,${b}" style="max-width:690px"></div></body>`)
  await tool.waitForTimeout(120); await tool.screenshot({ path: `${P}/${name}.png`, fullPage: true })
}
const clipTo = async (s, sel, file, pad = 10) => {
  const r = await s.page.evaluate(q => { const e = [...document.querySelectorAll(q)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } }, sel); if (!r) return null
  const W = s.page.viewportSize().width, H = s.page.viewportSize().height
  await s.page.screenshot({ path: file, clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.min(W - Math.max(0, r.x - pad), r.w + pad * 2), height: Math.min(H - Math.max(0, r.y - pad), r.h + pad * 2) } }); return r
}
try {
  const toolS = await newPage('d', { deviceScaleFactor: 1 }); const tool = toolS.page; await tool.goto('about:blank')
  for (const [sz, tag] of [['d', 'desk'], ['p', 'phone']]) {
    const s = await newPage(sz, sz === 'd' ? { deviceScaleFactor: 2 } : {}); const { page } = s
    await step(`${tag} Request access`, async () => {
      await page.goto(`http://localhost:${process.env.MQ_PORT}/`); await page.waitForSelector('#luser'); await page.fill('#luser', 'viper@mail'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accForm')
      await clipTo(s, '#accForm', `${P}/${tag}-f1.png`); await beside(tool, `w-f1-${tag}`, `f1-${tag}-starts-on-pick.png`, `${P}/${tag}-f1.png`, 800)
      await page.fill('#accCs', 'Kite'); await page.fill('#accIni', 'KT'); await page.selectOption('#accSeat', { index: 1 }); await page.selectOption('#accCat', { label: 'OCU' })
      await page.click('#accSend'); await page.waitForTimeout(300); check(`${tag} the words`, (await page.textContent('#accErr')) === 'Pick your squadron', await page.textContent('#accErr'))
      await clipTo(s, '#accForm', `${P}/${tag}-f2.png`); await beside(tool, `w-f2-${tag}`, `f2-${tag}-pick-your-squadron.png`, `${P}/${tag}-f2.png`, 800)
      await page.locator('#accOut').first().click(); await page.waitForSelector('#luser')
    })
    await signIn(s, 'ad', 'a')
    await step(`${tag} the Undo words`, async () => {
      await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'plan'] }, { name: 'hunter9' }]); await saveRow(s); await page.waitForTimeout(150); await doUndo(s)
      const o = await toast(s); check(`${tag} two changes named`, o === 'Undid: Plan of 149 given, sign-in name changed · Hunter', o)
      const r = await clipTo(s, '#toastEl', `${P}/${tag}-o1.png`); rec(`${tag} the bubble's box`, r); check(`${tag} it fits on one line`, !!r && r.h < 52, r && r.h); check(`${tag} it stays inside the screen`, !!r && r.x >= 0 && r.x + r.w <= page.viewportSize().width, r && [r.x, r.x + r.w])
      await beside(tool, `w-o1-${tag}`, `o1-${tag}-undid-two.png`, `${P}/${tag}-o1.png`, 220)
      await editRow(s, 'prowler', [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(150); await doUndo(s)
      check(`${tag} Undid made`, (await toast(s)) === 'Undid: Made a master admin · Hunter', await toast(s)); await clipTo(s, '#toastEl', `${P}/${tag}-l1.png`); await beside(tool, `w-l1-${tag}`, `l1-${tag}-undid-made.png`, `${P}/${tag}-l1.png`, 220)
      await doRedo(s); await page.waitForTimeout(150); await editRow(s, 'prowler', [{ role: 'admin' }]); await saveRow(s); await page.waitForTimeout(150); await doUndo(s)
      check(`${tag} Undid taken off`, (await toast(s)) === 'Undid: Master admin taken off · Hunter', await toast(s)); await clipTo(s, '#toastEl', `${P}/${tag}-l2.png`); await beside(tool, `w-l2-${tag}`, `l2-${tag}-undid-taken-off.png`, `${P}/${tag}-l2.png`, 220)
      rec(`${tag} hover now`, (await tips(s)).redo?.title)
    })
    await step(`${tag} the bell's lines`, async () => {
      await doRedo(s); await page.waitForTimeout(120)
      await as(s, 'ad', 'a'); await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s); await page.waitForTimeout(120)
      await editRow(s, 'prowler', [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(120); await editRow(s, 'prowler', [{ role: 'admin' }]); await saveRow(s); await page.waitForTimeout(120)
      await as(s, 'ad2', 'a2'); await bell.open(s); await page.waitForTimeout(250)
      await clipTo(s, '[data-testid="bell-list"]', `${P}/${tag}-n1.png`, 4); await beside(tool, `w-n1-${tag}`, `n1-${tag}-bell.png`, `${P}/${tag}-n1.png`, 720)
      rec(`${tag} bell`, (await bell.lines(s)).slice(0, 5))
    })
    await s.ctx.close()
  }
  await toolS.ctx.close()
} finally { finish('jc-words'); await closeAll() }
