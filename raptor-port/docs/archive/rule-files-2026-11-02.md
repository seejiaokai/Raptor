# Passages moved out of the always-loaded rule files (D1556, 2 Nov 26)

Moved here whole, byte for byte, by `backlog-archive.mjs --move` (D138), each leaving a one-line pointer where it
stood; searched, never loaded. Paths inside are from the repo root. Below: `.claude/rules/shipping.md`'s section "Ship
once per session, at the end".

## Ship once per session, at the end (owner, 10 Aug 26)
Build and verify everything locally as you go. **Shipping is not how you test**:
`npm run build && npx vite preview` is the same bundle that deploys, so every check — driving it in a browser
included — happens before his look and his "merge live"; while the repo is public the pull request is opened once the
job is built, so GitHub's run goes during the walk (D1086). One branch and one pull request carry two to four related
jobs of one area (D1087). Prefer batches: most of the cost is loading this app into context (measured
10 Aug 26: fifteen changes in one pass ran ~6 min each, where a single change shipped alone took an hour and a
half).
