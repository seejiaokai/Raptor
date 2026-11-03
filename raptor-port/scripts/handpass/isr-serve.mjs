// The Inputs re-check scripts (isr-A*, isr-B*) served a running preview on a fixed port. For a re-walk on a frozen build
// folder (the bug-check order's §4: one served folder a round), WALK_DIR names that folder and every request to the
// walk's address is answered from it inside the test browser — no server holds a port (walk-scripts.md §The build before
// the change). ISR_OUT names the round's own picture folder, so the first round's pictures stay as its evidence.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const TYPES = {
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.map': 'application/json',
}

export const WALK_DIR = process.env.WALK_DIR || ''

/** With WALK_DIR set, answer every request to `url`'s origin from that folder (index.html as the fallback). */
export async function serveFrozen(ctx, url) {
  if (!WALK_DIR) return
  const origin = new URL(url).origin
  await ctx.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.origin !== origin) return route.abort()
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '')
    let file = join(WALK_DIR, rel)
    if (!rel || !existsSync(file) || !statSync(file).isFile() || !resolve(file).startsWith(resolve(WALK_DIR))) file = join(WALK_DIR, 'index.html')
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream'
    return route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': type, 'cache-control': 'no-store' } })
  })
}
