/* J15 — print, export and data: Edit Schedule's two export icons (admin), the PDF report itself (read from the
   hidden print frame and drawn on its own page), the Inputs page's Export to Excel (everyone), Admin → Data
   (nothing destructive is pressed — a date is not even picked). */
import { go } from '../lib.mjs'

export default async function ({ fresh, shot }) {
  const page = await fresh()
  await go(page, 'editsched')
  await shot(page, 'export-1', { x: 0, y: 40, w: 640, h: 480 }, [
    { n: 1, sel: '#exportSched', pos: 'b' }, { n: 2, sel: '#exportPdf', pos: 'br' },
  ])
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportSched')])
  await dl.cancel().catch(() => {})
  await page.click('#exportPdf'); await page.waitForTimeout(900)
  const html = await page.evaluate(() => [...document.querySelectorAll('iframe')].map(f => f.srcdoc).filter(Boolean).pop())
  const rep = await page.context().newPage()
  await rep.setViewportSize({ width: 794, height: 1123 })
  await rep.setContent(html || '<p>no report</p>'); await rep.waitForTimeout(400)
  await shot(rep, 'export-2', { x: 0, y: 0, w: 794, h: 596 }, [])
  await rep.close()
  await go(page, 'inputs')
  await shot(page, 'export-3', { x: 0, y: 56, w: 840, h: 630 }, [{ n: 3, sel: '#inExport', pos: 'b' }])
  await go(page, 'admin')
  await page.click('.adm-rail .adm-cat:has-text("Data")'); await page.waitForTimeout(500)
  await shot(page, 'export-4', { x: 270, y: 60, w: 900, h: 675 }, [
    { n: 4, sel: '.adm-rail .adm-cat:has-text("Data")' }, { see: true, sel: '#admWipe' }, { see: true, sel: '#admLog' },
  ])
  await page.context().close()
}
