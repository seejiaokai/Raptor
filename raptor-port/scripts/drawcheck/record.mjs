// The drawing check's RECORDER (D1494): loaded beside a drawing script, it measures the named parts of the drawing at
// the moment the script takes the approved picture, and saves them with a full picture of the screen — the drawing's
// numbers, committed beside it, are what a build is measured against. No drawing script is changed for it.
//   cd raptor-port ; DRAWCHECK_SPEC=scripts/drawcheck/specs/<screen>.mjs [DRAWCHECK_DIST=<built folder>] \
//     node --import ./scripts/drawcheck/record.mjs docs/mock/<area>/<drawing script>.mjs
// DRAWCHECK_DIST serves that built folder at the origin the drawing script opens (DRAWCHECK_ORIGIN, default
// http://localhost:4197 — full-lib.mjs's), so the drawing is replayed on the build it was drawn on without a server;
// DRAWCHECK_APPROVED names the folder of the approved pictures, so each record says whether its replay drew the approved
// picture pixel for pixel, and DRAWCHECK_DRAWN_ON says in words which build the drawing was drawn on.
// Each state of the spec whose `drawing.shot` is the picture's name gets `<records>/<state>.json` and `.png`.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execSync } from 'node:child_process'
import { chromium, serveDist, measureParts, pictureDiff } from './lib.mjs'

console.log('[drawcheck record v1]')
const SPEC_PATH = process.env.DRAWCHECK_SPEC
if (!SPEC_PATH) throw new Error('DRAWCHECK_SPEC is not set')
const spec = (await import(pathToFileURL(resolve(SPEC_PATH)).href)).default
const RECORDS = resolve(process.env.DRAWCHECK_RECORDS || spec.records)
mkdirSync(RECORDS, { recursive: true })
const DIST = process.env.DRAWCHECK_DIST
const ORIGIN = process.env.DRAWCHECK_ORIGIN || 'http://localhost:4197'
// a state measured against another's record (`drawing.record`) records nothing of its own; only this script's states
const SCRIPT = (process.argv[1] || '').replace(/\\/g, '/')
const mine = spec.states.filter(s => !s.drawing.record && SCRIPT.endsWith(s.drawing.script.replace(/^.*?docs\//, 'docs/')))
const byShot = new Map(mine.map(s => [s.drawing.shot, s]))
const done = new Set()
const sel = x => typeof x === 'string' ? { sel: x } : x
let head = ''
try { head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim() } catch {}

const patched = new WeakSet()
function patchPage(page) {
  const proto = Object.getPrototypeOf(page)
  if (patched.has(proto)) return
  patched.add(proto)
  const orig = proto.screenshot
  proto.screenshot = async function (opts = {}) {
    const name = opts.path ? basename(opts.path).replace(/\.png$/, '') : ''
    const st = byShot.get(name)
    if (st && !done.has(st.id)) {
      // DRAWCHECK_EXPLORE=<selector>: list what the drawing draws under it, to write a state's parts
      if (process.env.DRAWCHECK_EXPLORE) console.log(`--- ${st.id}: the drawing under ${process.env.DRAWCHECK_EXPLORE}\n` + await this.evaluate(root => [...document.querySelectorAll(root)].flatMap(r0 => [r0, ...r0.querySelectorAll('*')]).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !(e instanceof SVGElement) }).slice(0, 200).map(e => {
        const r = e.getBoundingClientRect(), s = getComputedStyle(e)
        const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 28)
        return `${e.tagName.toLowerCase()}${e.dataset.testid ? '[' + e.dataset.testid + ']' : ''}${e.className ? '.' + String(e.className).trim().split(/\s+/).join('.') : ''}  ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}  ta=${s.textAlign} bg=${s.backgroundColor} edgeL=${s.borderLeftWidth} ${s.borderLeftColor} r=${s.borderTopLeftRadius}${own ? ' "' + own + '"' : ''}`
      }).join('\n'), process.env.DRAWCHECK_EXPLORE))
      const parts = st.parts.filter(p => p.draw).map(p => ({ name: p.name, ...sel(p.draw) }))
      const m = await this.evaluate(measureParts, parts)
      // the whole screen, as the build's side is taken: a drawing's own picture may be cut to an area
      await orig.call(this, { path: join(RECORDS, st.id + '.png') })
      writeFileSync(join(RECORDS, st.id + '.json'), JSON.stringify({ state: st.id, drawing: st.drawing, recorded: new Date().toISOString(),
        // the build the drawing was drawn on (DRAWCHECK_DRAWN_ON, e.g. 'main at 230aa3b85'): the replay proves only that one
        drawnOn: process.env.DRAWCHECK_DRAWN_ON || (DIST ? 'served from ' + DIST : "the drawing script's own server"), checkout: head, ...m }, null, 1))
      const missing = Object.entries(m.parts).filter(([, v]) => !v.found).map(([k, v]) => `${k} (${v.why})`)
      console.log(`drawcheck: recorded ${st.id} from ${name} — ${Object.keys(m.parts).length - missing.length} parts` + (missing.length ? `; NOT FOUND: ${missing.join('; ')}` : ''))
      done.add(st.id)
      // the replay must BE the approved picture: the script's own picture is compared with the committed one
      const out = await orig.call(this, opts)
      const approved = process.env.DRAWCHECK_APPROVED && join(resolve(process.env.DRAWCHECK_APPROVED), name + '.png')
      const rec = JSON.parse(readFileSync(join(RECORDS, st.id + '.json'), 'utf8'))
      // a drawing script writing its pictures INTO the approved folder replaces the approved picture first, and the
      // comparison would then be of a file with itself: refused, so it never reads as proof
      if (approved && resolve(approved).toLowerCase() === resolve(opts.path).toLowerCase()) {
        rec.approved = { picture: name + '.png', identical: null, differs: "not compared: the drawing script wrote its picture over the approved one — send its pictures to a scratch folder" }
        console.log(`drawcheck: ${st.id} — NOT COMPARED: the drawing script's picture went into the approved folder`)
      } else if (approved && existsSync(approved)) {
        const r = await pictureDiff(this.context().browser(), approved, opts.path)
        rec.approved = { picture: name + '.png', identical: r.same, ...(r.same ? {} : { differs: r.why || `${r.pixels} pixels in ${JSON.stringify(r.where)}` }) }
        console.log(`drawcheck: ${st.id} — the replayed picture is ${r.same ? 'IDENTICAL to' : 'NOT the same as'} the approved ${name}.png`)
      } else rec.approved = { picture: name + '.png', identical: null, differs: 'no approved picture given to compare (DRAWCHECK_APPROVED)' }
      writeFileSync(join(RECORDS, st.id + '.json'), JSON.stringify(rec, null, 1))
      return out
    }
    return orig.call(this, opts)
  }
}
const launch = chromium.launch.bind(chromium)
chromium.launch = async (...a) => {
  const browser = await launch(...a)
  const newContext = browser.newContext.bind(browser)
  browser.newContext = async (...b) => {
    const ctx = await newContext(...b)
    if (DIST) await serveDist(ctx, ORIGIN, DIST)
    const newPage = ctx.newPage.bind(ctx)
    ctx.newPage = async () => { const p = await newPage(); patchPage(p); return p }
    return ctx
  }
  return browser
}
process.on('exit', () => {
  const wanted = mine.filter(s => !done.has(s.id) && (!process.env.DRAWCHECK_STATES || process.env.DRAWCHECK_STATES.split(',').includes(s.id)))
  console.log(`drawcheck: ${done.size} state(s) recorded into ${RECORDS}` + (wanted.length ? `; not met in this run: ${wanted.map(s => s.id + ' (' + s.drawing.shot + ')').join(', ')}` : ''))
})
