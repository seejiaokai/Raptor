/* [ACCOUNTS] D200 (3) — the source scan: "one place answers 'may this person do this?'".
   It fails when a file decides authority itself — reading the session's role, the old
   login role, or comparing a person with the signed-in one — outside the allow-list below,
   so a new gate cannot grow outside state/perms.ts (Fable R1-5 / R2-4, Astra R1-5 / R2-2).
   A regex over the forms the code base uses, with fixtures proving it catches aliased,
   bracketed and destructured forms (an AST check was weighed and declined as out of
   proportion — plan §4, round 2). Register line AC14. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = join(__dirname, '..')
const PATTERNS: [RegExp, string][] = [
  [/\bSESSION\s*(?:\?\.|\.)\s*role\b|\bSESSION\s*\[\s*['"]role['"]\s*\]/, "reads the session's role"],
  [/\{\s*[^}]*\brole\b[^}]*\}\s*=\s*SESSION\b/, "destructures the session's role"],
  [/\bLOGINROLE\b/, 'reads the retired login role'],
  [/\bME\s*(?:===|!==|==|!=)|(?:===|!==|==|!=)\s*ME\b/, 'compares a person with the signed-in one'],
  [/\.role\s*(?:===|!==)\s*['"](?:admin|member|main)['"]/, 'compares a role'],
]
/* who may decide authority, and why */
const ALLOW: Record<string, string> = {
  'state/perms.ts': 'the one place',
  'state/auth.ts': 'the session itself',
  'command/actor.ts': 'maps the session to the command actor',
  'command/permissions.ts': 'the command layer\'s own role helpers (adminOnly, ownOrAdmin)',
  'undo/timeline.ts': 'mayReverse compares the actors of two undo entries',
  'state/accounts.ts': 'an ACCOUNT record\'s role (isAdminAccount) — data, not the session',
  /* multi-squadron batch 1, step 1: an account RECORD's role read as its level in its home unit (levelFrom) — data, as
     accounts.ts's; perms.ts asks it at the commit gate, and the session's role in force stays perms.ts's own check */
  'state/units-model.ts': 'an ACCOUNT record\'s role as its level in its home unit (levelFrom) — data, not the session',
  /* batch 1's second half, plan §7 item 6: the access an account RECORD held on a day, read to word the line on his own
     bell — it tells him, it decides nothing; who may make the change stays perms.ts's */
  'state/acctlines.ts': 'an ACCOUNT record\'s role read to word the line on his bell (accessIn) — data, it decides nothing',
}
/* the Leave War is a second app with its own store: its `role` and `viewer` are the war's,
   written ONLY by resetSession (the one seam), and its writers are held to §11 by
   leavewar/permsparity.test.ts */
const ALLOW_TREE = ['leavewar/']

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) files(p, out)
    else if (/\.(ts|tsx|js|jsx)$/.test(f) && !/\.test\.|\.spec\./.test(f)) out.push(p)
  }
  return out
}
const scan = (text: string) => {
  const hits: string[] = []
  text.split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '')
    if (/^\s*(\*|\/\*)/.test(line)) return            // a comment line
    for (const [re, why] of PATTERNS) if (re.test(code)) hits.push(`${i + 1}: ${why} — ${line.trim().slice(0, 100)}`)
  })
  return hits
}

describe('D200 (3): authority is decided in ONE place (state/perms.ts)', () => {
  it('no file outside the allow-list decides who may do what', () => {
    const bad: string[] = []
    for (const f of files(SRC)) {
      const rel = relative(SRC, f).replace(/\\/g, '/')
      if (ALLOW[rel] || ALLOW_TREE.some(t => rel.startsWith(t))) continue
      for (const h of scan(readFileSync(f, 'utf8'))) bad.push(`${rel}:${h}`)
    }
    expect(bad, 'ask state/perms.ts instead (isAdmin, me, isMe, mayEditInput …)').toEqual([])
  })
  it('the scan catches the forms it claims to (fixtures)', () => {
    expect(scan("if (SESSION.role !== 'admin') return")).toHaveLength(2)
    expect(scan("const r = SESSION?.role")).toHaveLength(1)
    expect(scan("const r = SESSION['role']")).toHaveLength(1)
    expect(scan('const { role } = SESSION')).toHaveLength(1)
    expect(scan('const { user, role } = SESSION')).toHaveLength(1)
    expect(scan('if (LOGINROLE === x) {}')).toHaveLength(1)
    expect(scan('if (r.person !== ME) {}')).toHaveLength(1)
    expect(scan('const own = ME === p')).toHaveLength(1)
    expect(scan("return a.role === 'main'")).toHaveLength(1)
    expect(scan('// SESSION.role in a comment')).toHaveLength(0)
    expect(scan('if (isAdmin()) {}')).toHaveLength(0)
  })
})
