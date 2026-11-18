# Power Apps code apps — real-world developer experience (community, outside the reference docs)

Research date: 19 Nov 2026. Every source dated where the page gave a date. "(snippet only)" = seen only in a search-result summary, page not opened. Reddit and Stack Overflow searches returned no threads at all (two attempts), so community voice here comes from GitHub issues/discussions, MVP blogs, dev.to and practitioner sites.

## 1. Tutorials and walkthroughs — extra steps and surprises beyond the quickstart

### Takeaway
Every first-hand walkthrough hits the same few setup snags: the environment toggle, sign-in, the local-play URL (not plain localhost), the Vite base path and the SDK's sign-in context never resolving outside Power Apps. The command-line tool itself changed in 2026 (`pac code` → a new npm `pa` CLI), so tutorials from 2025 are partly stale.

### Cited Findings
- Aug 2025 walkthrough of real errors: (1) `npm create vite@latest MyFirstApp` fails "Invalid package.json name" — names must be lowercase; (2) `pac auth create` opened a blank popup — fix `pac auth create --deviceCode`; (3) `pac code push` refused because the environment doesn't allow code app operations — admin must enable "Enable code apps" (Admin centre → Environment → Settings → Product → Features); (4) the same error persisted after enabling — fix: delete the auth profile, sign in again, push again. — [mspowerplatformtips, 27 Aug 2025](https://mspowerplatformtips.blogspot.com/2025/08/creating-code-apps-in-power-apps-step.html)
- New `pa` CLI (`@microsoft/power-apps-cli`, installed globally and separately from the `@microsoft/power-apps` SDK package): `pa auth login`, `pa app init` (writes `power.config.json`), `pa app add data-source`, `pa app add flow` / `list-flows` (only in the new CLI), `pa app run`, `pa app push` (build first — push uploads compiled assets), `pa app push --non-interactive` for pipelines, `pa app add dataverse-api`, `pa connection create`. `pac code` is on the deprecation list. — [Rajeev Pentyala (MVP), 10 Aug 2026](https://rajeevpentyala.com/2026/08/10/power-apps-code-build-and-deploy-using-the-new-pa-cli/)
- Same post: open the printed "Local Play" URL, not plain localhost, in the same browser profile as the tenant; Chrome/Edge can block a public origin calling a local endpoint (local-network-access) — allow it in the browser. Node: "LTS", no exact version. — [Rajeev Pentyala, 10 Aug 2026](https://rajeevpentyala.com/2026/08/10/power-apps-code-build-and-deploy-using-the-new-pa-cli/)
- Community cheat sheet: blank page after push is usually a missing `base: "./"` in `vite.config.ts`; 401s on connector calls during local runs = expired tunnel auth, fix by re-running `pa auth login`; static client bundle only, no SSR frameworks. — [Code Apps cheat sheet (viipiin), undated](https://viipiin.github.io/resources/code-apps-cheat-sheet) (snippet only)
- Preact guide: the SDK call that reads the signed-in user's context only resolves inside Power Apps; locally it never resolves, so code that awaits it shows a blank screen; router choice mattered because the real player is less forgiving than the dev server. — [recursion.no, undated](https://recursion.no/blogs/preact-power-apps-code-app/) (snippet only)
- Practitioner verdict on setup: "complex"; the starter template is more reliable than building from scratch; running a local build is often more trouble than it's worth. — [David Wyatt (dev.to), 17 Nov 2025](https://dev.to/wyattdave/vibe-coding-a-power-app-the-pro-way-with-code-apps-56dk)
- Microsoft's official Learn page (updated 23 Sep 2026) now lists prerequisites as IDE, Node.js LTS, npm, Git and "Power Apps CLI"; frameworks "React, Vue, and others". — [Microsoft Learn overview, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)

### Inferences
- For a port of an existing Vite app, the extra steps are: set `base: "./"`, make app start-up not block on the Power Apps context, check the router works under the player's iframe, and use the new `pa` CLI rather than any 2025 tutorial's `pac code` commands.
- Tutorials before Aug 2026 describe a tool that is being retired; any internal guide should be written against `pa` 1.3.x.

### Gaps
- No YouTube transcript or Build / Power Platform Conference 2025–26 session content was opened; I found no conference talk content in search results.
- No exact Node minimum for the `pa` CLI found (Microsoft's skills plugin says Node 22+, see §4).

## 2. Common errors and fixes (GitHub issues, Q&A, forums)

### Takeaway
The live bug stream (Nov 2026) is dominated by the Android mobile player and by ALM/data-source generation. Dataverse code generation has documented defects around lookups that bite a 45-table app directly. Several issues are from users on the current SDK/CLI, so these are not just preview-era leftovers.

### Cited Findings
- Open issues seen on 19 Nov 2026 (8 open shown): #523 Android player bridge error blocks connector calls (16 Nov 2026); #519 `dataverseOrgUrl` empty in Android mobile (3 Nov 2026); #503 binary transfer (image upload, file read, image download) fails on Android (20 Oct 2026); #499 blank app icon on Android (17 Oct 2026); #472 CLI can't reach default-prefixed environments, Dataverse connector rejects a default-environment org (10 Oct 2026); #461 flow bindings not restored on redeploy to a new environment (15 Sep 2026); #433 CLI can't find/add the Dataverse API (13 Aug 2026); #364 iframe uses `100vh` incl. Android nav bar, hides bottom content (5 Jun 2026, "product team investigating"). — [microsoft/PowerAppsCodeApps issues](https://github.com/microsoft/PowerAppsCodeApps/issues)
- Lookup defects in generated Dataverse code: #451 generated `@odata.bind` navigation-property casing doesn't match the real lookup schema name when the column was created via the Web API/metadata (not the maker-portal designer) — `create()` fails; #455 generator emits `<lookup>name` fields (e.g. `trd_accountname`) that don't exist and silently return undefined (display name exists only as a FormattedValue annotation). — [Issue #451](https://github.com/microsoft/PowerAppsCodeApps/issues/451), [Issue #455](https://github.com/microsoft/PowerAppsCodeApps/issues/455) (snippet only)
- Other generation failures: #337 add-data-source reports success but no model/service files generated for Dataverse; #242 `dataSourcesInfo.ts` has empty `tableId`/`version`, breaking local runs; #462 after SDK 1.1.1 / CLI 1.0.1 upgrade, `GetOrganizations` missing from the generated service (breaking existing apps); #101 "Cannot find module '@microsoft/power-apps/data'"; #444 Android: Dataverse `get()` never returns, list hangs after navigation. — [#337](https://github.com/microsoft/PowerAppsCodeApps/issues/337), [#242](https://github.com/microsoft/PowerAppsCodeApps/issues/242), [#462](https://github.com/microsoft/PowerAppsCodeApps/issues/462), [#101](https://github.com/microsoft/PowerAppsCodeApps/issues/101), [#444](https://github.com/microsoft/PowerAppsCodeApps/issues/444) (snippets only)
- Load failures: #330 apps intermittently fail to load with `UnexpectedError` even for a blank app from the official Vite template, no connections — shell loads, inner iframe fails before app code runs; #95 "Timeout Error" once deployed (marked known issue); #373 iOS mobile crash "platformSpecificResourcesVersion undefined" on a React 19 / Vite 8 app with no code change, reporter suspects player regression; #343 `npx degit` of the template failed. — [#330](https://github.com/microsoft/PowerAppsCodeApps/issues/330), [#95](https://github.com/microsoft/PowerAppsCodeApps/issues/95), [#373](https://github.com/microsoft/PowerAppsCodeApps/issues/373), [#343](https://github.com/microsoft/PowerAppsCodeApps/issues/343) (snippets only)
- Product team, Jan 2026: a new SDK (end Jan 2026) removes the need to call `initialize`, to avoid the "App Timed Out" error; migration needed on next update. — [Power Apps Guide, Office Hours 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)
- First-hand production incident (B2B guest users): guests saw empty KPI tiles/grids, HTTP 403 "The user is not a member of the organization". Cause: FetchXML run through the Dataverse connector's `ListRecordsWithOrganization` (the cross-environment flavour) — authors believe it doesn't map guests to their systemuser. Plain `ListRecords` failed with invalid org URL (they stored the org URL in an environment variable). Fix: a Custom API (plug-in runs FetchXML in caller's context) called through the *generated service* (native channel); +40–50 ms per call vs plain OData on a 251-row test. Rejected trick: FetchXML in a `nextLink` (SDK 1.6.0) — SDK always sends a page-size Prefer header, Dataverse then ignores FetchXML paging and returns page 1 repeatedly, silently. Lesson: code apps lack a first-class way to run FetchXML against their own environment. — [neronotte (dev.to), 8 Nov (year not shown; SDK 1.6.0 implies 2026)](https://dev.to/_neronotte/power-apps-code-apps-and-the-dataverse-connector-the-day-our-guest-users-saw-nothing-19ld)
- Dataverse coverage, Jan 2026 (product team): single-value lookups and basic CRUD work; Actions, FetchXML, relationship support and ExecuteMultiple planned for Mar–Apr 2026. — [Power Apps Guide, Office Hours 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)
- Microsoft Learn limitations (23 Sep 2026): assets served from a publicly accessible endpoint with no IP restriction (SAS IP binding/firewall setting does not apply — use Conditional Access by location); no Secure Implicit Connections; no Power Platform Git integration; not in Power Apps for Windows; no PowerBIIntegration; no SharePoint forms integration. CSP and mobile are no longer listed as limitations (both were in the preview-era README). — [Microsoft Learn overview, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview); preview-era list: [GitHub README](https://github.com/microsoft/PowerAppsCodeApps)

### Inferences
- For a ~45-table port: expect to hand-check generated services for lookups (casing of `@odata.bind`, phantom `*name` fields) and to need a workaround for anything beyond basic CRUD + single lookups (multi-table queries, FetchXML, batch writes) — confirm whether the Mar–Apr 2026 Dataverse items actually shipped; I found no source confirming they did.
- Tables created by script/Web API (rather than in the maker portal) are exactly the case #451 describes — relevant if the IT side builds tables with a table-building kit.
- Mobile (especially Android) is the least stable surface in late 2026; iPhone players also had a regression (#373).
- An IP-restricted government tenant should note the public asset endpoint limitation.

### Gaps
- Microsoft Q&A, Power Platform Community forum, Reddit and Stack Overflow threads were not found by search (no results returned); no tally of how often each error occurs.
- Did not open #451/#455/#337 etc. to confirm Microsoft responses or fix status — snippets only.
- No first-hand report on bundle size limits or CORS specifically.

## 3. ALM: environments, tenants, solutions, pipelines, service principals

### Takeaway
ALM went from "not supported" in preview to solution-based in 2026, but cross-environment moves still have rough edges — most clearly flow bindings that don't survive a move to a new environment/tenant, and no source-level packaging of the app.

### Cited Findings
- Preview-era (2025) README: code apps didn't support Dataverse solutions, therefore couldn't use Power Platform pipelines; no CSP. — [GitHub repo (search summary)](https://github.com/microsoft/PowerAppsCodeApps)
- 2026 pattern: push to DEV into a named solution (`pac code push --solutionName X`, now `pa app push`), then export managed solution and import into QA/UAT/PROD; connection references remapped on import; solution checker on Managed Environments. — [The Power Times (Paul Bien), 6 Mar 2026](https://thepowertimes.com/posts/2026-03-06-code-apps-governance-why-it-will-love-them/); [Lagortinez/CodeAppsALM (Azure DevOps template)](https://github.com/Lagortinez/CodeAppsALM) (snippet only)
- Paul Bien (Mar 2026): Solution Packager not supported — the code app is one opaque artifact; the portal doesn't link to Git, source control is the developer's job. Contradicted by product team in Jan 2026 saying Solution Packager is "already available with the latest PAC CLI" — [Power Apps Guide, 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour). Treat as unresolved.
- Learn (Sep 2026): code apps don't support Power Platform Git integration. — [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Rolling back in Power Platform does not roll back the React source; keep Git and PRs for every deployment. — [David Wyatt, 17 Nov 2025](https://dev.to/wyattdave/vibe-coding-a-power-app-the-pro-way-with-code-apps-56dk)
- Only built output is stored in Power Platform, so a deployed app can't be edited in the maker portal; editing means "hacking open the solution file". — [David Wyatt (dev.to), 16 Mar (year not shown, ~2026)](https://dev.to/wyattdave/power-apps-a-cooler-way-to-use-code-apps-3nb6)
- Issue #461 (open, 15 Sep 2026): `pa app add data-source` can bind through a solution-portable connection reference, but `pa app add flow` cannot — after solution import + push to a new environment the Flows tab is empty, no warning. In a clean environment in a *different tenant*, Dataverse calls worked but every flow call failed (token-acquisition "Core.ApplicationError"). Reproduced on CLI 1.3.0 (30 Oct 2026). Workaround: per environment, maker signs in interactively, `pa app list-flows --json`, re-add each flow, rebuild, push — cannot run under a service principal. Microsoft assigned engineers (23 Oct, 17 Nov 2026), no fix or timeline. — [Issue #461](https://github.com/microsoft/PowerAppsCodeApps/issues/461)
- ALM4Dataverse PR adds building code apps and patching them into solutions; PAC-publishing path needs Power Platform API RBAC for the pipeline identity. — [ALM4Dataverse PR #107](https://github.com/ALM4Dataverse/ALM4Dataverse/pull/107) (snippet only)
- `pa app push --non-interactive` publishes from a pipeline with a service principal; solution export/import still via `pac`. — [Rajeev Pentyala, 10 Aug 2026](https://rajeevpentyala.com/2026/08/10/power-apps-code-build-and-deploy-using-the-new-pa-cli/)
- Product team (Jan 2026): next PAC CLI (Feb 2026) to store source code with the app; transpiled code and artifacts stored. — [Power Apps Guide, 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)

### Inferences
- The personal-tenant → government-tenant hand-over is exactly the #461 scenario (new tenant, solution import): Dataverse data access moved fine for that reporter, Power Automate flow calls did not. An app that uses no flows avoids the known break.
- Plan to keep the source in Git as the master; the solution carries only built output.

### Gaps
- No first-hand report of a full cross-tenant move into a restricted/government tenant.
- Whether "store source with the app" (promised Feb 2026) shipped — not confirmed.

## 4. AI coding agents (Claude Code, Copilot) and Microsoft's own skills

### Takeaway
Microsoft now ships an official (preview) agent plugin for code apps that works in Claude Code and Copilot; practitioners report agents get a working base fast but need many correction rounds, and one MVP argues the whole feature is really aimed at vibe coding.

### Cited Findings
- Official `code-apps-preview` plugin in the `microsoft/power-platform-skills` marketplace: works with GitHub Copilot CLI, Claude Code, Codex, Cursor; Node 22+; installs `pa` CLI 1.3.0+ for new projects; 15 commands incl. `/create-code-app`, `/add-dataverse` (tables with generated TypeScript services), `/add-sharepoint`, `/add-connector`, `/list-connections`, `/deploy`, `/report-issue`; no MCP servers bundled; no telemetry; "may change before general availability". — [microsoft/power-platform-skills code-apps plugin](https://github.com/microsoft/power-platform-skills/tree/main/plugins/code-apps); [Power Platform Skills site](https://microsoft.github.io/power-platform-skills/)
- Community skills also exist (not Microsoft): rahulm-28/power-apps-code-apps-skills, DanielKerridge/claude-code-power-platform-skills. — [rahulm-28](https://github.com/rahulm-28/power-apps-code-apps-skills), [DanielKerridge](https://github.com/DanielKerridge/claude-code-power-platform-skills) (snippets only)
- First-hand: a Planning Poker app built with Copilot — first prompt gave a working base, ~20 follow-up prompts to fix; polling never worked, users duplicated, UI never centred, result "functional but not what he wanted". — [David Wyatt, 17 Nov 2025](https://dev.to/wyattdave/vibe-coding-a-power-app-the-pro-way-with-code-apps-56dk)
- Product team (Jan 2026): updating generated code to suit coding agents is "being considered"; a path from "vibe" apps to code apps planned, no date. — [Power Apps Guide, 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)
- Wyatt's alternative: plain JS instead of React because AI output is better and cheaper with readable code; he found the official TypeScript SDK hard to use directly. Anecdotal, no benchmarks. — [David Wyatt, 16 Mar (~2026)](https://dev.to/wyattdave/power-apps-a-cooler-way-to-use-code-apps-3nb6)

### Inferences
- The official plugin's `/add-dataverse` is worth trying for a 45-table app, but generated lookups need checking against §2 defects.

### Gaps
- No Microsoft "Dataverse MCP server" usage report specific to code apps found; the official plugin explicitly bundles none.
- No first-hand report of an agent porting a large existing app (vs. greenfield).

## 5. Status timeline and roadmap

### Takeaway
Early-access preview mid-2025 → GA on 5 Feb 2026 → GCC by May 2026 → new `pa` CLI mid-2026 (1.3.0 by Oct 2026), with flows, Vue, solutions and monitoring added along the way. GCC High / DoD is unconfirmed.

### Cited Findings
- Early Access Preview by 11 Jul 2025 (sign-up page). — [Rajeev Pentyala, 11 Jul 2025](https://rajeevpentyala.com/2025/07/11/power-apps-code-apps/). Exact preview announcement date not found.
- GA: "Generally available: host and run code apps in Power Apps", Jordan Chodak, 5 Feb (2026): build locally, 1,400+ connectors from JavaScript, Managed Host, Entra sign-in, connector consent, runtime DLP, Conditional Access, Power Platform Monitor health metrics. — [Microsoft Power Platform blog](https://www.microsoft.com/en-us/power-platform/blog/power-apps/generally-available-host-and-run-code-apps-in-power-apps/); echoed [Power Apps Guide, 10 Feb 2026](https://powerappsguide.com/blog/post/code-apps-are-generally-available)
- Jan 2026 Office Hours roadmap: SDK without `initialize` (end Jan 2026); CSP "coming soon" end Jan 2026; Dataverse actions/FetchXML/relationships/ExecuteMultiple Mar–Apr 2026; source stored with app Feb 2026; no connector limits at GA; embedding code apps in model-driven apps not planned; sovereign/government clouds ~spring 2026 (~90 days after GA) with no extra limits beyond connector limits. — [Power Apps Guide, 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)
- GCC: answered "Yes, it is available in GCC" on 8 May 2026 by Brian Caauwe (likely Microsoft-affiliated, unconfirmed), pointing to a community GCC guide; nothing about GCC High/DoD. — [Discussion #333](https://github.com/microsoft/PowerAppsCodeApps/discussions/333)
- `pa` CLI with flow commands by Aug 2026; CLI 1.3.0 by Oct 2026. — [Rajeev Pentyala, 10 Aug 2026](https://rajeevpentyala.com/2026/08/10/power-apps-code-build-and-deploy-using-the-new-pa-cli/); [Issue #461](https://github.com/microsoft/PowerAppsCodeApps/issues/461)
- Learn (Sep 2026) lists 1,500+ connectors and React/Vue; mobile no longer a listed limitation (Android/iOS player bugs filed through Nov 2026 confirm mobile is now used). — [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)

### Inferences
- The product is ~9 months past GA and still changing its CLI; expect breaking tool changes during a multi-month port (see #462: an SDK/CLI upgrade removed a generated operation).

### Gaps
- No official dated roadmap page found; the Jan 2026 items are a third party's notes of an Office Hours call (single source). Did not confirm which items shipped (CSP, FetchXML etc.).
- GCC High / DoD availability: no source found.

## 6. Comparisons, opinions, licensing, governance, maturity

### Takeaway
Supporters (governance writers, MVPs) like that a React app inherits Entra sign-in, DLP, sharing limits and monitoring. Sceptics (notably MVP David Wyatt) say setup is heavy, it's not really low-code, it's mainly a vehicle for AI "vibe coding", and source/ALM handling is weak. Every end user needs a premium licence.

### Cited Findings
- Sceptical (Wyatt, Nov 2025): code apps are early; setup heavy; doubts many React developers will choose it just for the environment; worries Microsoft might abandon it because of the complexity; sees it as a way to bring vibe-coding tools into the platform. — [David Wyatt, 17 Nov 2025](https://dev.to/wyattdave/vibe-coding-a-power-app-the-pro-way-with-code-apps-56dk)
- Sceptical (Wyatt, ~Mar 2026): "not really low-code", so its place in Power Platform is questionable; source isn't in the platform; why React as the default for vibe coding. — [David Wyatt, 16 Mar](https://dev.to/wyattdave/power-apps-a-cooler-way-to-use-code-apps-3nb6)
- Positive governance view: DLP at connector layer applies like canvas apps with no special setup; Managed Environment sharing limits; admin insights (usage, active users, last launch); Dataverse security roles, Conditional Access, row-level security. — [The Power Times, 6 Mar 2026](https://thepowertimes.com/posts/2026-03-06-code-apps-governance-why-it-will-love-them/)
- Security model caveat: standard and Dataverse connections run as each signed-in user, so security roles still decide what they see. — [David Wyatt, 17 Nov 2025](https://dev.to/wyattdave/vibe-coding-a-power-app-the-pro-way-with-code-apps-56dk)
- Licensing: end users need Power Apps Premium, or pay-as-you-go, an App Pass, or auto-claim. — [Microsoft Learn, Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview). General criticism (not code-app-specific): one premium connector means every user needs a paid licence; licence costs hard to predict — [collab365](https://collab365.com/blog/power-apps-licensing-explained-which-plan-is-right-for-you), [holgerimbery.blog](https://holgerimbery.blog/powerplatform-licensing) (snippets; vendor/consultancy sources, some competitor-written e.g. [Alpha Software](https://www.alphasoftware.com/power-apps-pricing-what-you-should-know-about-hidden-costs))
- Comparisons: embedding code apps in model-driven apps not planned; no convergence path with generative pages. — [Power Apps Guide, 15 Jan 2026](https://powerappsguide.com/blog/post/code-apps-january-office-hour)

### Inferences
- For a team whose users already hold Premium, the licensing criticism is moot; the open maturity risks are ALM across tenants, Dataverse generation gaps and mobile player stability.

### Gaps
- No practitioner side-by-side of code apps vs PCF, SPFx, or Azure Static Web App + Dataverse Web API found.
- No CoE/admin-team critical write-up found; no Reddit/forum sentiment captured.
- msdynamicsworld article on AI-generated code de-emphasising traditional tools returned 403 — unread.
