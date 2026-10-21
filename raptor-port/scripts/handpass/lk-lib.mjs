/* The look-and-keys night job's (21 Oct 26) one addition to lib.mjs: open the app with the browser's clock SET to a day
   of the demo week and left running (docs/walk-scripts.md §1) — the Inputs list opens on today's dates, and the demo
   inputs are in July 2026. Everything else is lib.mjs's. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { BASE, SHOTS, login } from './lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export async function openAt({ width = 1440, height = 900, who = 'a', clock = '2026-07-14T09:00:00', touch = false } = {}) {
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width, height }, ...(touch ? { hasTouch: true, isMobile: true } : {}) })
  if (clock) await ctx.clock.install({ time: new Date(clock) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { browser, ctx, page, errors }
}
