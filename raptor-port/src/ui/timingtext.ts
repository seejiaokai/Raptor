/* THE TIMING READOUT'S WORDS ([APP-SPEED] step 1 — owner D2481, D2483). Every line is the mock-up's of 24 Nov 26, in
   the words a fresh Fable review gave it, adopted whole: the start-up times are points on one clock, counted from opening
   the address ("at"); the sign-in is a length on its own clock ("took"), set apart; a figure a browser does not give
   names that browser ("not given by Safari"), never a blank or a 0, which would read as "none"; a time under a twentieth
   of a second reads "under 0.1 s", never "0.0 s". Pure: no page, no clock — the readout hands it what it measured. */

export type Freezes = { supported: boolean, n: number, total: number, max: number }
export type Files = { supported: boolean, n: number, bytes: number, kept: number, asked: number }
export type Env = {
  browser: { name: string | null, version: string | null }
  cores: number | null
  memGB: number | null
  screen: string
  window: string
  /** devicePixelRatio: the screen's own scaling and the browser's zoom together — never called "zoom" (both readers, F7) */
  scale: number
  /** how long the tab has been open (ms) — so a count of freezes has its span (Fable F10) */
  openFor: number
}
export type PageRow = { name: string, first: boolean, ms: number, downloaded: number }
export type TimingView = {
  /** the site's first answer, from opening the address (ms), or null where the browser does not say */
  site: number | null
  /** the app's code loaded and started (ms from opening the address) */
  app: number | null
  first: { screen: 'signin' | 'week', t: number } | null
  /** sign in pressed → the week drawn (ms), null before a sign-in */
  signin: number | null
  /** newest first */
  pages: PageRow[]
  freezes: Freezes
  files: Files
  env: Env
}
export type Row = { label: string, tag?: string, value: string, gap?: boolean }
export type Section = { head: string, rows: Row[], empty?: string }

export function secs(ms: number): string {
  return ms < 50 ? 'under 0.1 s' : (ms / 1000).toFixed(1) + ' s'
}
export function kb(bytes: number): string {
  const k = bytes / 1024
  return k >= 1000 ? (k / 1024).toFixed(1) + ' MB' : Math.round(k) + ' KB'
}
export function notGiven(browser: string | null): string {
  return 'not given by ' + (browser || 'this browser')
}
/** The browser from its own description of itself. Edge and Chrome both claim "Chrome" and "Safari", Chrome claims
 *  "Safari": so the narrowest claim is read first. */
export function browserOf(ua: string): { name: string | null, version: string | null } {
  const tries: [string, RegExp][] = [['Edge', /Edg(?:A|iOS)?\/(\d+)/], ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/], ['Chrome', /(?:Chrome|CriOS)\/(\d+)/], ['Safari', /Version\/(\d+)[^ ]* (?:Mobile\/\S+ )?Safari\//]]
  for (const [name, re] of tries) { const m = ua.match(re); if (m) return { name, version: m[1] } }
  return { name: null, version: null }
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const two = (n: number) => String(n).padStart(2, '0')
/** The app's own way of writing a date — "24 Nov 26" — then the clock. */
export function stamp(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${two(d.getFullYear() % 100)} ${two(d.getHours())}:${two(d.getMinutes())}`
}

export function readoutSections(v: TimingView): Section[] {
  const by = v.env.browser.name
  /* a point on the start-up's clock; under a twentieth of a second it reads "under 0.1 s", never "at under 0.1 s" */
  const atS = (ms: number) => (ms < 50 ? secs(ms) : 'at ' + secs(ms))
  const start: Row[] = [
    { label: 'Site answered', value: v.site == null ? notGiven(by) : atS(v.site) },
    { label: 'App loaded', value: v.app == null ? 'not yet' : atS(v.app) },
    { label: 'Sign-in shown', value: !v.first ? 'not yet' : v.first.screen === 'signin' ? atS(v.first.t) : 'not shown' },
    { label: 'Sign in pressed → week shown', value: v.signin == null ? 'not yet' : 'took ' + secs(v.signin), gap: true },
  ]
  const pages: Row[] = v.pages.map(p => ({
    label: p.name,
    tag: p.first ? 'first time' + (p.downloaded > 0 ? ' · downloaded ' + kb(p.downloaded) : '') : 'opened before',
    value: secs(p.ms),
  }))
  const f = v.freezes
  const mem = v.env.memGB == null ? 'memory ' + notGiven(by) : v.env.memGB >= 8 ? '8 GB or more' : v.env.memGB + ' GB'
  const cores = v.env.cores == null ? 'cores ' + notGiven(by) : v.env.cores + ' cores'
  const computer: Row[] = [
    { label: 'Brief freezes', value: !f.supported ? notGiven(by) : f.n === 0 ? 'none' : `${f.n} · ${secs(f.total)} in all` },
    { label: 'Longest freeze', value: !f.supported ? notGiven(by) : f.n === 0 ? 'none' : secs(f.max) },
    /* a size the browser does not give is said so, never "0 KB" (Astra's read, 7) */
    { label: 'App files used', value: v.files.n === 0 ? notGiven(by) : v.files.bytes > 0 ? `${v.files.n} · ${kb(v.files.bytes)}` : `${v.files.n} · size ${notGiven(by)}` },
    { label: 'Kept from an earlier visit', value: !v.files.supported ? notGiven(by) : `${v.files.kept} of ${v.files.n}` },
    { label: 'Processor · memory', value: `${cores} · ${mem}` },
    { label: 'Screen · browser', value: `${v.env.screen} · ${by || 'not known'}` },
  ]
  return [
    { head: 'Start-up, from opening the address', rows: start },
    { head: 'Pages opened, newest first', rows: pages, empty: pages.length ? undefined : 'No page opened yet' },
    { head: 'This computer', rows: computer },
  ]
}

/** Copy all: every row in the window's own words, so it reads on its own when pasted into a chat; then, for the
 *  developer, the browser's version, how long the app had been open, the browser window's size, the display scale (the
 *  screen's own scaling and the browser's zoom together — never called "zoom": a phone's 3 is no zoom at all), the
 *  screen in its own pixels, and how many kept files were asked about again. Not seen in the window: for the developer. */
export function copyText(v: TimingView, when: Date): string {
  const out = [`TALON timing, ${stamp(when)}, this computer's clock`, "This computer's speed only. Nothing about any person, nothing saved."]
  for (const s of readoutSections(v)) {
    out.push('', s.head)
    if (s.empty) out.push('  ' + s.empty)
    for (const r of s.rows) {
      let value = r.value
      if (r.label === 'Screen · browser' && v.env.browser.version) value += ' ' + v.env.browser.version
      out.push(`  ${r.label}${r.tag ? ', ' + r.tag : ''}: ${value}`)
    }
    if (s.head === 'This computer') {
      out.push(`  App open for: ${Math.max(1, Math.round(v.env.openFor / 60_000))} min`)
      out.push(`  Browser window: ${v.env.window} page units`)
      out.push(`  Display scale: ${Math.round(v.env.scale * 100)}% (the screen's own scaling and the browser's zoom together)`)
      const [w, h] = v.env.screen.split('×').map(Number)
      if (w && h) out.push(`  Screen in its own pixels: ${Math.round(w * v.env.scale)}×${Math.round(h * v.env.scale)} (if the browser's zoom is 100%)`)
      if (v.files.supported) out.push(`  Asked the site again before using a kept file: ${v.files.asked} of ${v.files.n}`)
    }
  }
  return out.join('\n')
}
