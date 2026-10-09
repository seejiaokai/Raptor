/* Test-only source reader. Production still has one eager scheduler.css import. */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SCHEDULER_PARTS = [
  '00-foundation-login.css', '01-logic.css', '02-shell.css', '03-week.css',
  '04-pucks-sections.css', '05-quals.css', '06-inputs.css', '07-inputs-calendar.css',
  '08-windows-tools.css', '09-week-responsive.css', '10-board-history.css', '11-drag.css',
  '12-schedule-editing.css', '13-board-rows-responsive.css', '14-input-editors.css',
  '15-admin-help.css', '16-medical.css', '17-save-status.css', '18-oil-board.css',
  '19-availability.css', '20-changes-quals.css', '21-insights.css', '22-float-windows.css', '23-days.css', '24-sans-calendar.css', '25-inputs-calendar.css',
] as const

export function schedulerParts(entry: string): string[] {
  const text = entry.replace(/\/\*[\s\S]*?\*\//g, '')
  const imports = [...text.matchAll(/@import\s+['"]\.\/scheduler\/([^'"]+)['"]\s*;/g)]
  const parts = imports.map(m => m[1]!)
  if (text.replace(/@import\s+['"]\.\/scheduler\/[^'"]+['"]\s*;/g, '').trim()) throw new Error('Scheduler entry contains CSS outside its ordered imports')
  if (new Set(parts).size !== parts.length) throw new Error('Duplicate scheduler part')
  if (JSON.stringify(parts) !== JSON.stringify(SCHEDULER_PARTS)) throw new Error('Missing, unlisted or reordered scheduler part')
  return parts
}

export function readSchedulerCss(): string {
  const entry = join(dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'scheduler.css')
  const text = readFileSync(entry, 'utf8')
  return schedulerParts(text).map(part => readFileSync(join(dirname(entry), 'scheduler', part), 'utf8')).join('')
}
