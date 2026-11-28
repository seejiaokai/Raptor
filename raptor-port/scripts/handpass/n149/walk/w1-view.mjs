// Walk step 1 — View of 149: Saber gives Hunter View of 149 on Admin → Users (real presses), Undo and Redo of it; Hunter
// signs in on the same page, reads his bell, opens the Schedules menu, picks 149 and presses through every tab and every
// edit control a View holder could reach; then picks 142 back. Desktop (Chromium 1536) and iPhone (WebKit 402).
import { serve, stop, newPage, signIn, shot, menuRows, pick, note, save, errs, facts, text, vis } from './lib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
export async function navTo(s, words) {
  const { page } = s
  if (s.desk) {
    const b = page.locator('button:visible', { hasText: new RegExp(`^${words}$`) }).filter({ has: page.locator('xpath=self::*') })
    const top = await page.evaluateHandle(w => [...document.querySelectorAll('button, a')].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < 60 && e.textContent.trim().replace(/\d+$/, '') === w }), words)
    const el = top.asElement()
    if (!el) { note(`[${s.sz}] no tab "${words}"`); return false }
    await el.click(); await page.waitForTimeout(800); return true
  }
  await page.click('#burger'); await page.waitForTimeout(350)
  const a = page.locator('#drawerNav a', { hasText: new RegExp(`^\\s*${words}`) })
  if (!(await a.count())) { note(`[${s.sz}] no drawer item "${words}"`); await page.keyboard.press('Escape'); await page.mouse.click(390, 400).catch(() => {}); return false }
  await a.first().click(); await page.waitForTimeout(800); return true
}
export async function tabsShown(s) {
  const { page } = s
  if (s.desk) return page.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < 60 && !e.id }).map(e => e.textContent.trim()).filter(t => t && t.length < 20))
  await page.click('#burger'); await page.waitForTimeout(350)
  const t = await page.evaluate(() => [...document.querySelectorAll('#drawerNav a')].map(a => a.textContent.trim()))
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  if (await vis(s, '#drawer.open')) { await page.mouse.click(395, 860).catch(() => {}); await page.waitForTimeout(250) }
  return t
}
export async function adminCat(s, label) {
  const { page } = s
  await navTo(s, 'Admin')
  // the phone shows one panel at a time: its ‹ goes back to the list of panels
  if (await page.locator('.adm-back:visible').count()) { await page.locator('.adm-back:visible').first().click(); await page.waitForTimeout(400) }
  const c = page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: new RegExp(`^${label}`) }) })
  if (!(await c.count())) { note(`[${s.sz}] no admin tile ${label}`); return false }
  await c.first().click(); await page.waitForTimeout(700); return true
}
export async function openRow(s, pid) {
  const { page } = s
  const r = page.locator(`[data-person="${pid}"] .acc-tap`).first()
  await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await page.waitForTimeout(300)
}
export const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`
export async function undo(s) { const { page } = s; const b = page.locator('#undoBtn:visible'); if (!(await b.count())) { note(`[${s.sz}] no Undo button visible`); return false } await b.first().click(); await page.waitForTimeout(700); return true }
export async function redo(s) { const { page } = s; const b = page.locator('#redoBtn:visible'); if (!(await b.count())) { note(`[${s.sz}] no Redo button visible`); return false } await b.first().click(); await page.waitForTimeout(700); return true }
export async function bellOpen(s) { const { page } = s; await page.locator('#notifyBell:visible, .bellbtn:visible').first().click(); await page.waitForTimeout(500) }
export async function bellLines(s) { return s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim())) }
export async function bellClose(s) { await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300) }
export const toastText = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? t.textContent.replace(/\s+/g, ' ').trim() : null })

/* every visible edit-looking control on the page: buttons/inputs not disabled */
export async function liveControls(s, root) {
  return s.page.evaluate(root => {
    const R = document.querySelector(root); if (!R) return null
    return [...R.querySelectorAll('button, input, select, textarea, [contenteditable="true"], [draggable="true"]')].filter(e => {
      const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && !e.disabled && getComputedStyle(e).pointerEvents !== 'none'
    }).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.type ? '[' + e.type + ']' : ''}${e.draggable ? '[drag]' : ''}:${(e.textContent || e.value || e.placeholder || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 28)}`)
  }, root)
}

if (process.argv[1] && process.argv[1].endsWith('w1-view.mjs')) {
  await serve()
  try {
    for (const sz of SZS) {
      const s = await newPage(sz)
      const P = `w1-${sz}`
      await signIn(s, 'ad', 'a')
      await step('saber users', async () => {
        await adminCat(s, 'Users'); await shot(s, `${P}-01-saber-users.png`)
        await openRow(s, 'prowler'); await shot(s, `${P}-02-hunter-row-open.png`, ['[data-testid="acc-sq"]', '#accEdRole', '#accEdSave'])
        facts[`${P}-row-lines`] = await text(s, '[data-testid="acc-sq"]')
        await s.page.click(lineBtn('149', 'view')); await s.page.waitForTimeout(200)
        await shot(s, `${P}-03-view-picked.png`, ['[data-testid="acc-sq"]', '#accEdSave'])
        await s.page.click('#accEdSave'); await s.page.waitForTimeout(800)
        facts[`${P}-toast-after-save`] = await toastText(s)
        await shot(s, `${P}-04-after-save.png`)
        facts[`${P}-hunter-held-after-save`] = await text(s, '[data-testid="acc-held-acad2"]')
      })
      await step('undo redo', async () => {
        await undo(s); facts[`${P}-toast-undo`] = await toastText(s)
        facts[`${P}-held-after-undo`] = await text(s, '[data-testid="acc-held-acad2"]')
        await shot(s, `${P}-05-after-undo.png`)
        await openRow(s, 'prowler'); facts[`${P}-149-pressed-after-undo`] = await s.page.evaluate(() => [...document.querySelectorAll('[aria-label="Access to 149"] button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed')}`))
        await s.page.click('#accEdCancel'); await s.page.waitForTimeout(300)
        await redo(s); facts[`${P}-toast-redo`] = await toastText(s)
        facts[`${P}-held-after-redo`] = await text(s, '[data-testid="acc-held-acad2"]')
        await shot(s, `${P}-06-after-redo.png`)
      })
      await logout(s)
      await signIn(s, 'ad2', 'a2')
      await step('hunter arrives', async () => {
        await shot(s, `${P}-07-hunter-arrives.png`)
        await bellOpen(s); facts[`${P}-hunter-bell`] = await bellLines(s); await shot(s, `${P}-08-hunter-bell.png`, ['[data-testid="bell-list"]'])
        await bellClose(s)
        facts[`${P}-hunter-menu`] = await menuRows(s)
        facts[`${P}-hunter-tabs-142`] = await tabsShown(s)
      })
      await step('pick 149', async () => {
        await s.page.locator('#sqnMenuBtn:visible').first().click(); await s.page.waitForTimeout(300)
        await shot(s, `${P}-09-menu-open.png`, ['#sqnMenu', '#sqnMenuBtn'])
        await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(200)
        await pick(s, '149')
        facts[`${P}-after-pick-mark`] = await text(s, '#sqnMenuBtn')
        facts[`${P}-tabs-149`] = await tabsShown(s)
        await shot(s, `${P}-10-after-pick-149.png`)
      })
      // every page a View holder can open, with 149 picked
      for (const t of ['Edit Schedule', 'View-only Sched', 'Inputs', 'Quals', 'Logic', 'Leave War', 'Tracker', 'Admin']) {
        await step(`page ${t}`, async () => {
          const ok = await s.page.evaluate(() => 1) && await navTo(s, t)
          facts[`${P}-page-${t}-opened`] = ok
          if (!ok) return
          if (t === 'Tracker') await s.page.waitForTimeout(2500)
          const pg = await s.page.evaluate(() => { const p = document.querySelector('.page.on, [id^="page-"].on'); return p ? p.id : null })
          facts[`${P}-page-${t}-id`] = pg
          facts[`${P}-page-${t}-live`] = pg ? await liveControls(s, `#${pg}`) : null
          facts[`${P}-page-${t}-heads`] = await s.page.evaluate(pg => { const p = document.getElementById(pg); return p ? [...p.querySelectorAll('h1,h2,h3,.sb-title,.pg-title,.ph-title,.lw-title')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 8) : null }, pg)
          await shot(s, `${P}-11-${t.replace(/\W+/g, '')}.png`)
        })
      }
      await step('admin tiles', async () => {
        await navTo(s, 'Admin')
        facts[`${P}-admin-tiles`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-cat-l')].map(e => e.textContent.trim()))
        for (const c of facts[`${P}-admin-tiles`] || []) {
          const nm = c.replace(/\d+$/, '')
          await s.page.locator('#page-admin button.adm-cat', { has: s.page.locator('.adm-cat-l', { hasText: nm }) }).first().click(); await s.page.waitForTimeout(600)
          facts[`${P}-admin-${nm}-live`] = await liveControls(s, '#page-admin')
          facts[`${P}-admin-${nm}-heads`] = await s.page.evaluate(() => [...document.querySelectorAll('#page-admin h2, #page-admin h3, #page-admin h4')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 6))
          await shot(s, `${P}-12-admin-${nm.replace(/\W+/g, '')}.png`)
          if (!s.desk) { await navTo(s, 'Admin') }
        }
      })
      await step('pick 142 back', async () => {
        await navTo(s, 'View-only Sched')
        await pick(s, '142'); facts[`${P}-back-mark`] = await text(s, '#sqnMenuBtn'); facts[`${P}-tabs-back-142`] = await tabsShown(s)
        await shot(s, `${P}-13-back-142.png`)
      })
      await s.ctx.close()
    }
  } finally { save('w1'); await stop() }
  console.log('errs', errs.length, errs.slice(0, 10))
}
