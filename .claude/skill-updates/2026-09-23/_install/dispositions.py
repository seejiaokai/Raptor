"""Every observation's disposition from the 23 Sep 26 skill review.

  python dispositions.py check LOG            -> every header assigned exactly once?
  python dispositions.py emit GROUPS DATE OUT -> status JSON for the approved groups
                                                 (GROUPS: comma list, or "all")

Group ids match the numbered list the owner approves. 'H' = housekeeping
(already reflected / declined). Entries in OPEN stay OPEN.
"""
import json, re, sys

REVIEW = 'weekly review 23 Sep 26'

GROUPS = {
    '1': ('verification-before-completion', 'Common Failures rows / long-run pattern / browser-checks.md',
          [5, 6, 17, 18, 20, 33, 35, 40, 44, 48, 49, 65, 83, 84, 85, 87, 105, 119, 134, 136, 152, 159, 176, 177]),
    '2': ('systematic-debugging', 'reproduce / recent-change / working-example lines, the flaky block, device-only-bugs.md',
          [52, 61, 67, 70, 124, 133, 138, 160, 167]),
    '3': ('test-driven-development', 'Verify RED/GREEN additions and writing-good-tests.md',
          [13, 63, 125, 139, 143, 145, 149, 155, 170, 172, 175]),
    '4': ('writing-plans', 'plan-file check, per-task browser check, Model line, standing orders, No-Placeholders items, self-review 4-9',
          [46, 80, 93, 94, 97, 101, 103, 112, 128, 130, 132, 148, 150, 153, 184]),
    '5': ('subagent-driven-development', 'SKILL.md, implementer/task-reviewer prompts, scripts/task-brief',
          [26, 95, 96, 98, 102, 104, 106, 111, 113, 129, 135, 147, 151, 169]),
    '6': ('dispatching-parallel-agents', 'Common Mistakes pairs + "When Agents Share the Working Tree or the Machine"',
          [19, 24, 25, 27, 53, 126]),
    '7': ('brainstorming', 'visual-first rounds, enumerate "every", layered rules, trap hunt, mock-on-the-real-app fallback',
          [14, 47, 77, 89, 90, 91, 92, 99, 100, 107, 108, 109, 110, 114, 116, 117, 118, 173]),
    '8': ('session-handoff + executing-plans', 'check-before-acting PR state, whole In-flight reconcile, Step 3 range fix, premise check',
          [60, 127, 163, 183, 188]),
    '9': ('requesting-code-review + receiving-code-review', 'shared-state checklist, line-ending check, finding/diagnosis/fix, two-of-a-kind, proof for "can\'t happen"',
          [2, 4, 7, 28, 29, 30, 32, 39, 131, 137, 144, 156, 158, 174, 178]),
    '10': ('using-git-worktrees', 'the symlinked-dependencies staging trap', [73]),
    '11': ('task-observer', 'numbering across branches, close-it-where-you-apply-it, review Step 3, the pinned log location, the second log folded in',
           [62, 186, 187, 189]),
    '12': ('impeccable project config', 'detector.ignoreFiles for the engine and test files', [43]),
    '13': ('machine-local memory notes', 'Windows exit code, per-section convergence, when not to commission a pre-build guide',
           [154, 162, 164, 165]),
}

CLAUDE = 'raptor-port/CLAUDE.md'
PERF = 'raptor-port/docs/performance.md'
UIC = 'raptor-port/docs/ui-contracts.md'
REFLECTED = {
    9: PERF + ' §B Scroll and motion',
    10: UIC + ' (in-time lines)', 11: UIC + ' (in-time lines)',
    12: CLAUDE + ' §Rules-engine robustness doctrine',
    16: CLAUDE + ' §Rules-engine robustness doctrine',
    **{n: CLAUDE + ' §Build & verify (stop a server by its port)' for n in (15, 21, 66, 121, 140, 142, 146)},
    34: UIC + ' (a fix that landed in the wrong media block)',
    82: UIC + ' (frozen name column; override block placement)',
    36: 'raptor-port/docs/bug-check-order.md and OUTSTANDING.md [HUMAN-RETEST]',
    37: 'raptor-port/docs/engine-rules.md §Weekend/PH work earns OIL (derives on read)',
    38: CLAUDE + ' §Time format',
    41: PERF + ' §E Leave War (content-visibility)',
    45: CLAUDE + ' §How to work here (no auto-merge; "merge live")',
    50: UIC + ' §Drag / arm-and-plant (root user-select baseline)',
    51: CLAUDE + ' §Architecture rules (what actually persists)',
    **{n: PERF + ' §The one law: measure first' for n in (54, 55, 56, 57)},
    58: PERF + ' §Dead ends',
    59: PERF + ' §D Drag and drop',
    **{n: PERF + ' ledger items 22-25' for n in (64, 68, 69, 71, 72)},
    74: '.claude/rules/plain-language.md (loaded every session)',
    185: '.claude/rules/plain-language.md (loaded every session)',
    76: UIC + ' (compositor-layer section)', 81: UIC + ' (compositor-layer section)',
    78: UIC + ' (what a drag looks like)', 79: UIC + ' (frozen-column grip)',
    86: UIC + ' (page stays usable behind a sheet)', 88: UIC + ' (page stays usable behind a sheet)',
    115: CLAUDE + ' §Product bar (state the expected time before the first task)',
    123: PERF + ' §The perf gate (desktop and phone)',
    157: 'the machine-local memory note astra-codex-cli-available (runner command, --host mapping)',
    168: 'the machine-local memory note astra-codex-cli-available (runner command, --host mapping)',
    161: 'raptor-port/scripts/tracker/smoke.mjs (process-tree teardown)',
    171: 'raptor-port/docs/bug-check-order.md §3 (the walk owns the seams)',
}
DECLINED = {
    8: 'a one-off CSS fact (a table header cannot sit mid-table); too narrow for a guide',
    31: 'a quirk of one GitHub listing tool; too narrow for a guide',
    141: 'a one-off masking job; the standing rule (synthetic demo data, tripwire-tested) is in raptor-port/docs/architecture-direction.md §5, and the repo is private (D59)',
    166: 'a one-off parse error (`*/` inside a block comment); too narrow for a guide',
}
OPEN = {
    42: 'needs a small code change (a root-level script or hook), not a guide change',
    75: 'owner question: keep or retire the bug-testing tracker',
    120: 'owner question: a new "add a whole app as a tab" guide',
    122: 'owner question: a new "add a whole app as a tab" guide',
}


def assignment():
    seen = {}
    for g, (_, _, nums) in GROUPS.items():
        for n in nums:
            seen.setdefault(n, []).append('group ' + g)
    for n in REFLECTED:
        seen.setdefault(n, []).append('H-reflected')
    for n in DECLINED:
        seen.setdefault(n, []).append('H-declined')
    for n in OPEN:
        seen.setdefault(n, []).append('open')
    return seen


def headers(log):
    txt = open(log, encoding='utf-8', newline='').read()
    return [int(m) for m in re.findall(r'(?m)^### Observation (\d+):', txt)]


def check(log):
    hs, seen = headers(log), assignment()
    dup = {n: v for n, v in seen.items() if len(v) > 1}
    missing = [n for n in hs if n not in seen]
    unknown = [n for n in seen if n not in hs]
    applied = sum(len(v[2]) for v in GROUPS.values())
    print('log headers: %d | applied: %d | already reflected: %d | declined: %d | left open: %d'
          % (len(hs), applied, len(REFLECTED), len(DECLINED), len(OPEN)))
    print('assigned twice:', dup or 'none')
    print('in log but unassigned:', missing or 'none')
    print('assigned but not in log:', unknown or 'none')
    ok = not dup and not missing and not unknown and applied + len(REFLECTED) + len(DECLINED) + len(OPEN) == len(hs)
    print('CHECK', 'PASSED' if ok else 'FAILED')
    return ok


def emit(groups, date, out):
    chosen = list(GROUPS) + ['H'] if groups == 'all' else groups.split(',')
    statuses = {}
    for g in chosen:
        if g == 'H':
            for n, where in REFLECTED.items():
                statuses[n] = 'ACTIONED (%s) — already reflected in %s; nothing to change (%s)' % (date, where, REVIEW)
            for n, why in DECLINED.items():
                statuses[n] = 'DECLINED (%s) — %s (%s, owner-approved)' % (date, why, REVIEW)
            continue
        skill, what, nums = GROUPS[g]
        for n in nums:
            statuses[n] = 'ACTIONED (%s) — Applied to %s: %s (%s, owner-approved)' % (date, skill, what, REVIEW)
    json.dump({str(k): v for k, v in sorted(statuses.items())}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('wrote %d statuses for groups %s to %s' % (len(statuses), ','.join(chosen), out))


if __name__ == '__main__':
    if sys.argv[1] == 'check':
        sys.exit(0 if check(sys.argv[2]) else 1)
    emit(sys.argv[2], sys.argv[3], sys.argv[4])
