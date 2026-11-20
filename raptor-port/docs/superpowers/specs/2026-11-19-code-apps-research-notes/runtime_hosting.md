# Power Apps code apps — runtime hosting and constraints (for porting an existing React + Vite SPA)

Research date: 19 Nov 2026. Source types are marked: **[Official]** = Microsoft Learn / Microsoft-maintained repo or a Microsoft staff reply on GitHub; **[Community]** = blogs, recaps, user reports; **[Inference]** = my own reasoning from the cited facts, not stated by any source.

Naming note: Learn pages updated Sep–Nov 2026 call the publish command `pa app push` (the "Power Apps CLI"); GitHub issues from early–mid 2026 use the older `pac code push` / `pac code run`. Same step, renamed tool — [Configure hosting, header and access text, Learn, updated 11 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration); [Architecture, Learn, 12 Aug 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture).

## 1. How the app is hosted: iframe, domain, sandbox, content security policy (CSP)

### Takeaway
The app's built files are served from a per-environment `powerplatformusercontent.com` host, on a path that changes with every push. The Power Apps player at `apps.powerapps.com/play/...` shows that page in an iframe. CSP is enforced by default and is strict: no `eval`, no inline scripts, no web workers, no manifest, and **`connect-src 'none'` — so even `fetch()` to the app's own files is blocked** until an environment admin adds sources. CSP is set per environment by an admin, not per app.

### Cited findings
- **[Official]** Runtime has three parts: your code, the client library (`@microsoft/power-apps`), and the Power Apps host. The host "manages end-user authentication, app loading, and presenting contextual messages to the user if an app fails to load." Code apps support single-page apps — [Architecture, Learn, 12 Aug 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture).
- **[Official]** The play URL is `https://apps.powerapps.com/play/e/{environmentId}/app/{appId}?tenantid={tenantId}` (`tenantid` optional, for guests). The framed content is on `https://<environment>.powerplatformusercontent.com/`, per the example CSP error on the page — [Embed a code app in an iframe, Learn, 6 Mar 2026, updated 11 Aug 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe).
- **[Community, GitHub issue]** The Teams error showed the host as `<env-id>.environment.api.powerplatformusercontent.com` — [Issue #296, opened 6 Apr 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/296).
- **[Community, GitHub issue]** Code apps run in a **sandboxed** iframe on `powerplatformusercontent.com`. The path has a `storageproxy` segment with a timestamp that **changes on every push**. The host serves the app only at that full path: the origin root returns RouteNotFound, and unknown query parameters are rejected. Microsoft turned the issue into a discussion without disputing these points — [Issue #272, 19 Mar 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/272).
- **[Official]** The built files sit on a **publicly accessible endpoint** that does not support IP restrictions; use Entra Conditional Access instead. "Don't store sensitive user or organizational data in the app" — [System configuration, Learn, 11 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration); [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Official] Default CSP, enforced unless an admin turns it off** (`<platform>` = sources the platform needs) — [Configure CSP, Learn, 7 Apr 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy):
  - `frame-ancestors 'self' https://*.powerapps.com`
  - `script-src 'self' <platform>`
  - `img-src 'self' data: <platform>`
  - `style-src 'self' 'unsafe-inline'`
  - `font-src 'self'`
  - `connect-src 'none'`
  - `frame-src 'self'`
  - `form-action 'none'`
  - `base-uri 'self'`
  - `child-src 'none'`
  - `default-src 'self'`
  - `manifest-src 'none'`
  - `media-src 'self' data:`
  - `object-src 'self' data:`
  - `worker-src 'none'`
- **[Official] How CSP is set:** per **environment**, so it covers every code app in it. It needs an environment admin. With Dataverse: Power Platform admin center → Environments → (environment) → Settings → Product → Privacy + Security → Content security policy → **App** tab. Without Dataverse: the REST API `https://api.powerplatform.com/environmentmanagement/environments/{environmentId}/settings` with `PowerApps_CSPEnabledCodeApps` (on/off), `PowerApps_CSPReportingEndpoint` and `PowerApps_CSPConfigCodeApps` (directive JSON). Custom values are **appended** to the defaults; where the default is `'none'`, they **replace** it. A directive switched off with an empty list is left out of the policy. Report-only use (reporting on, enforcement off) is possible. An API update replaces the whole directive set. The 15 directives that can be set are exactly those listed above — [Configure CSP, Learn, 7 Apr 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy).
- **[Official]** CSP changes "can take several minutes to propagate." App Insights calls are blocked until their endpoints are added to `connect-src` — [Set up App Insights, Learn, 5 Mar 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights).
- **[Community]** CSP has been enforced for code apps since 30 Jan 2026; Microsoft suggests starting in report-only mode — [Paul Bien, Complete Guide to Code Apps, 18 Feb 2026](https://paulbien.com/guides/code-apps-complete-guide).
- **[Community]** One third-party Copilot instructions file still lists "CSP not yet supported" as a limitation. It is out of date — [awesome-copilot power-apps-code-apps instructions, undated](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/power-apps-code-apps.instructions.md).

### Inferences
- **What the default CSP means for this app**, read against standard CSP rules:
  - **Inline scripts:** blocked (`script-src` has no `'unsafe-inline'`). Vite's production build emits only external module scripts, so that is fine — but any inline `<script>` in `index.html` must go.
  - **`eval` / `new Function`:** blocked (no `'unsafe-eval'`). Check the bundle for libraries that use them.
  - **Inline styles:** allowed (`style-src 'unsafe-inline'`).
  - **Web workers:** blocked (`worker-src 'none'`). A service worker would be blocked too — the current build has none.
  - **`blob:` URLs:** not allowed as scripts or workers, and not in `img-src` either. A blob URL used to display an image would fail. A blob URL used for a download link is a navigation, not a fetch, so CSP does not govern it; whether the sandbox allows downloads is unknown (gap).
  - **WebAssembly:** needs `'wasm-unsafe-eval'` in `script-src`, so it is blocked by default.
  - **`form-action 'none'`:** a real HTML form submit is blocked. A login form handled in JavaScript with `preventDefault` is fine — and the login form goes away anyway (see §4).
  - **Fonts:** must be bundled (`font-src 'self'`); no `data:` fonts or font CDN unless added.
- **Critical for this app: `connect-src 'none'` blocks `fetch()` and XHR even to the app's own origin.**
  - Fetching its own page-files list (JSON) at run time fails by default.
  - Lazy-loaded chunks loaded by `import()` and `<link rel="modulepreload">` fall under `script-src 'self'`, so they should load.
  - Options: ask the admin to add `'self'` (or the `*.powerplatformusercontent.com` host) to `connect-src`; or put the list into the bundle at build time.
  - Connector calls do not appear to need `connect-src` (apps work under the default) — likely because the library talks to the host by `postMessage`. Unconfirmed.
- Vite's modulepreload polyfill falls back to `fetch()` only in browsers without native modulepreload. Current Safari and Chrome have it, so this is low risk.
- The code app setting applies to **all** code apps in the environment. Loosening it (for example adding `'unsafe-eval'`) is a decision for the IT side, not the app.

### Gaps
- The exact iframe `sandbox` attribute list (whether it includes allow-same-origin, allow-scripts, allow-popups, allow-downloads, allow-top-navigation, allow-modals) is not documented anywhere I found. Open the player in DevTools to read it.
- What `<platform>` expands to in `script-src` / `img-src` is not published.
- No source confirms whether keywords such as `'unsafe-eval'` or `'wasm-unsafe-eval'` are accepted as custom sources (the UI accepts free-text sources).

## 2. How static files are served

### Takeaway
Publishing uploads the compiled `dist` folder to Microsoft-managed storage. It is served under a versioned path, so asset URLs must be relative: `base: './'`, which the official Vite plugin handles. Lazy chunks are fine. Fetching the app's own JSON needs a CSP change (§1). I found no published size limit.

### Cited findings
- **[Official]** `pa app push` "takes a compiled app and publishes it in a Power Platform environment." `power.config.json` holds the app metadata — [Architecture, Learn, 12 Aug 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture).
- **[Official repo]** The starter template's `vite.config.ts` uses `powerApps()` from `@microsoft/power-apps-vite` beside `@vitejs/plugin-react` — [starter/vite.config.ts, PowerAppsCodeApps repo, read 19 Nov 2026](https://raw.githubusercontent.com/microsoft/PowerAppsCodeApps/main/templates/starter/vite.config.ts).
- **[Community]** The `powerApps()` plugin "handles asset paths automatically". Without it you must set `base: './'`, or Vite's absolute `/assets/...` paths "break on the Power Platform CDN" — [Paul Bien, 18 Feb 2026](https://paulbien.com/guides/code-apps-complete-guide).
- **[Official repo]** The starter's router computes its base path from `new URL(".", location.href).pathname` and rewrites a path ending in `/index.html` with `history.replaceState`. Its comments say not to change this, as it is needed "for proper routing when hosted in Power Apps" — [starter/src/router.tsx, read 19 Nov 2026](https://raw.githubusercontent.com/microsoft/PowerAppsCodeApps/main/templates/starter/src/router.tsx).
- **[Community, GitHub, fixed]** `pac code push` corrupted binary assets on upload; closed 1 Jul 2026 — [Issue #389](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile).
- **[Community]** Code splitting and lazy loading are recommended for large apps — [awesome-copilot instructions, undated](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/power-apps-code-apps.instructions.md).

### Inferences
- The served page is `…/storageproxy/<timestamp>/…/index.html` (from #272 and the starter's `/index.html` handling). Every push gives a new path, so absolute URLs or any cached path break. Relative `import()` chunk URLs that Vite resolves against `import.meta.url` keep working.
- A run-time `fetch('./pages.json')` would resolve correctly but be blocked by `connect-src 'none'`. Either the admin adds `'self'`, or the list is built into the bundle.
- After a push, users already on the old version keep requesting chunks from the old timestamped path. Whether old paths stay live is unknown. Plan a "chunk failed to load → reload" fallback.

### Gaps
- No documented limit on bundle size, file count or file size. Nor did I find what HTTP caching headers the asset host sends, or whether old versions stay reachable after a new push.

## 3. Routing and deep links

### Takeaway
Microsoft's own starter uses **browser-history routing** (`createBrowserRouter`) with a base path worked out at run time. But the host serves only the exact `index.html` path and rejects unknown query parameters. So routes inside the app live only in the iframe, and **deep links must come in as query parameters on the play URL**, read with `getContext().app.queryParams`.

### Cited findings
- **[Official repo]** The starter template (React, Vite, Tailwind, TanStack Query, React Router) uses `createBrowserRouter` with the run-time basename above — [repo README](https://github.com/microsoft/PowerAppsCodeApps); [router.tsx](https://raw.githubusercontent.com/microsoft/PowerAppsCodeApps/main/templates/starter/src/router.tsx). A TanStack Router sample (`tanstack-app`) also exists — [repo README, read 19 Nov 2026](https://github.com/microsoft/PowerAppsCodeApps).
- **[Official]** `getContext().app.queryParams` is a `Record<string,string>` of "the query parameters added to the URL" — [Get context data, Learn, 2 Oct 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context).
- **[Official repo]** The `DataverseContextRouting` sample picks its first page from `context.app.queryParams.table ?? context.app.queryParams.page`, falling back to a default page — [sample README](https://github.com/microsoft/PowerAppsCodeApps/tree/main/samples/DataverseContextRouting).
- **[Community, GitHub]** The asset host rejects unrecognised query parameters and returns RouteNotFound at the origin root — [Issue #272, 19 Mar 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/272).
- **[Official]** `hideNavBar=true` is a recognised play-URL parameter (§6) — [System configuration, Learn, 11 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration).

### Inferences
- **Deep links:** use `https://apps.powerapps.com/play/e/{env}/app/{app}?screen=day&date=2026-11-20`, read `queryParams` at start-up, then navigate inside the app. Do not rely on the iframe's own URL.
- **Reload:** a reload of the player tab reloads `index.html` at the root route. The in-app path is lost unless the app saves it, for example in sessionStorage — and that is subject to §5.
- The browser Back button: pushes to the iframe's history join the joint session history of the top tab, so Back should step through in-app routes. Untested — walk it.
- Hash routing would also work, but it is not needed.

### Gaps
- No official doc on history versus hash routing, or on how the player passes custom query parameters through (beyond `queryParams` existing). Test whether names clash with reserved ones (`tenantid`, `hideNavBar`, `skipMobileRedirect`, `platformOS`).

## 4. Sign-in and identity

### Takeaway
Entra sign-in is done by the host before the app loads, so **the app's own login form goes**. `getContext()` gives the Entra object id, UPN, full name, tenant id, the Dataverse `systemuser` id and a session id. **There is no token API.** MSAL inside the iframe fails because the redirect URL changes with each push. Reach other APIs through connectors.

### Cited findings
- **[Official]** Key features include "Microsoft Entra authentication and authorization"; Conditional Access, data loss prevention policies and sharing limits are applied at launch — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Official]** `import { getContext } from '@microsoft/power-apps/app'; const ctx = await getContext();` It "communicates with the web player":
  - `ctx.app`: `appId`, `environmentId`, `queryParams`, `dataverseOrgUrl`, `appUrl`
  - `ctx.user`: `fullName`, `objectId` (Entra), `systemUserId` (optional; the Dataverse `systemuser` row), `tenantId`, `userPrincipalName`
  - `ctx.host`: `sessionId` (new each time the app opens)
  - — [Get context data, Learn, 2 Oct 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context).
- **[Community]** "The Power Apps host manages Entra ID tokens, OAuth flows, and consent. Your code doesn't handle auth" — [Paul Bien, 18 Feb 2026](https://paulbien.com/guides/code-apps-complete-guide).
- **[Official]** Users see a consent dialog for connector permissions. Admins can suppress it for Microsoft and custom OAuth connectors — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Community, GitHub]** MSAL redirect and popup flows for Graph all failed inside Power Platform (they worked on localhost). The cause is the dynamic iframe path, which cannot be registered as a redirect URI. Microsoft gave no fix and converted the issue to a discussion — [Issue #272, 19 Mar 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/272). Also: the "redirect URI from code app is too long to register in Entra ID" — [Issue #187, closed 11 Feb 2026](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+localStorage+OR+sessionStorage+OR+IndexedDB+OR+cookies+OR+sandbox).
- **[Community, GitHub]** Several HTTP-with-Entra-ID connections in one code app did not work; closed 15 Jul 2026 — [Issue #301](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+routing+OR+router+OR+localStorage+OR+Safari+OR+iframe). Gateway-based connections always prompted sign-in (duplicate, closed 7 Aug 2026, #424). Sign-in stayed tied to the source tenant after a cross-tenant import (closed 8 Sep 2026, #456) — same list.
- **[Official]** App sharing works as for canvas apps; guests (Azure B2B) are supported. An embedded app is reachable only by users of the same tenant — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview); [Embed in an iframe](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe).

### Inferences
- Map the app's own "who is signed in" to `ctx.user.objectId` (stable) or `systemUserId` (for Dataverse ownership and roles). Do not trust a UPN typed into a form.
- Expect `getContext()` to be the first await at start-up. On mobile it has timed out before (§6), so build a timeout and error state.

### Gaps
- No documentation found on what happens when the Entra session or token expires mid-session (silent refresh by the host, or a forced reload), nor on what a reload inside the frame does to sign-in. Presumably the host re-authenticates at top level, but no source says so. Must be tested (leave a phone overnight, then tap).

## 5. Browser storage inside the player iframe

### Takeaway
The app's origin (`*.powerplatformusercontent.com`) differs from the top page (`apps.powerapps.com`), so its storage is **third-party / partitioned** storage. In Safari (all iPhone browsers) that storage is partitioned and, per WebKit's documentation, **ephemeral**. Treat localStorage, sessionStorage and IndexedDB as a cache that can disappear, never as a store of record. The 30-second poll and any saved preferences must cope with empty storage. Whether storage is available at all depends on the sandbox flags, which are undocumented.

### Cited findings
- **[Official]** The framed origin is `<environment>.powerplatformusercontent.com`; the top page is `apps.powerapps.com` — [Embed in an iframe, Learn](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe).
- **[Official, WebKit]** WebKit partitions third-party LocalStorage and IndexedDB per top-level site and makes them ephemeral. The Storage Access API covers cookies only, not other storage — [WebKit Tracking Prevention](https://webkit.org/tracking-prevention/); [Introducing Storage Access API, WebKit blog](https://www.webkit.org/blog/8124/introducing-storage-access-api). A 2017 WebKit bug and a 2020 developer report describe partitioned localStorage as transient — not persisted, deleted when the browser quits — [WebKit bug 168631](https://bugs.webkit.org/show_bug.cgi?id=168631).
- **[Official guidance, CSP]** Microsoft says not to store sensitive data in the app; keep it in a data source — [System configuration, Learn, 11 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration).
- **[Community]** Use IndexedDB for offline data — [awesome-copilot instructions, undated](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/power-apps-code-apps.instructions.md). This is generic advice, untested inside the player.
- I found **no GitHub issue** about localStorage, sessionStorage or IndexedDB failing in code apps (searched 19 Nov 2026) — [issue search](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+localStorage+OR+sessionStorage+OR+IndexedDB+OR+cookies+OR+sandbox).

### Inferences
- Since no issues report storage throwing, storage likely works (the sandbox likely includes allow-same-origin). That is weak evidence from absence.
- In **Chrome/Edge**, third-party iframe storage is partitioned by top-level site (Chrome's storage partitioning, 2024). It persists, keyed to `apps.powerapps.com`, so it behaves like ordinary persistent storage there.
- In **Safari/iOS**, data saved by the app may be lost when Safari closes or the tab is purged.
- **The Power Apps mobile app** uses a WebView, whose storage rules differ again (untested).
- **The path changes on every push, but the origin does not** (the environment host stays), so storage should survive a new version.
- Per-device settings (zoom level, last screen) will reset unexpectedly on iPhones. Anything that matters belongs in Dataverse.

### Gaps
- No official statement of the iframe sandbox flags, or of storage persistence inside the player or the mobile app. Must be measured on a real iPhone (Safari, and the Power Apps app if used).

## 6. Mobile, Teams and full screen

### Takeaway
- **Phone browsers:** work via the play URL; use the `/app/` URL form so iOS does not bounce users into the Power Apps app.
- **Power Apps mobile app:** said "not supported" in March 2026. Since about June 2026 Microsoft has treated it as a supported host with bugs, and the September 2026 docs list only Windows as unsupported. Android bugs are still open in November 2026.
- **Not supported:** Power Apps for Windows. No offline support.
- **Teams:** blocked by `frame-ancestors` unless an admin adds Teams' origins; not documented.
- **The header:** can be hidden per app or per link.

### Cited findings
- **[Official]** "Code apps aren't supported in Power Apps for Windows." The limitations list (Sep 2026) does **not** list iOS/Android — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Official, Microsoft staff on GitHub]** On 27 Mar 2026: mobile player support is "not something that we support at this time", in the backlog with no ETA — [Issue #285](https://github.com/microsoft/PowerAppsCodeApps/issues/285).
- **[Official, Microsoft staff on GitHub]** Later, mobile was treated as a supported host:
  - iOS crash (`platformSpecificResourcesVersion` undefined): called "a regression in the mobile player itself", fix rolled out to all users 15 Jul 2026 — [Issue #373](https://github.com/microsoft/PowerAppsCodeApps/issues/373).
  - `getContext()` timed out after about 8 s on iOS/Android because the mobile player did not answer. Fix shipped as an app update, ETA 17 Jul 2026. Interim advice: detect the `platformOS` URL parameter — [Issue #387, 30 Jun–1 Jul 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/387).
- **[Community, GitHub] Open Android bugs (Nov 2026)** — [issue list](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile):
  - #519 `dataverseOrgUrl` empty in Power Apps Mobile for Android (3 Nov 2026)
  - #523 CordovaBridge "wrong secret token" blocks connector calls (16 Nov 2026)
  - #503 binary data between app and host breaks (20 Oct 2026)
  - #499 blank app icon (17 Oct 2026)
  - #444 Dataverse GetItem never returning on Android (closed 5 Nov 2026)
- **[Community]** Office-hours recaps: mobile was targeted for "summer" 2026 (Feb), then "unlikely before July 2026" (Mar). No Dataverse offline support, no ETA (May 2026) — [powerappsguide.com, Feb 2026](https://powerappsguide.com/blog/post/code-apps-office-hours-february-2026-highlights); [Mar 2026](https://powerappsguide.com/blog/post/code-apps-office-hours-march-2026-highlights); [May 2026](https://powerappsguide.com/blog/post/code-apps-may-2026).
- **[Community]** A PWA support request was closed 13 Mar 2026 (#191) — [issue list](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile). Under the default CSP, `manifest-src 'none'` and `worker-src 'none'` also rule out a manifest and a service worker (§1).
- **[Official staff reply, GitHub] Phone browser redirect:**
  - Old `/play/e/{env}/a/{app}` links pushed phone users into the Power Apps app. iOS Universal Links intercept the `/a/` path; `?skipMobileRedirect=true` helped on Android only.
  - The new `/play/e/{env}/app/{app}` form avoids the redirect on all platforms. The maker portal and newer CLIs produce it.
  - — [Issue #195, 10–25 Feb 2026](https://github.com/microsoft/PowerAppsCodeApps/issues/195).
- **[Community, GitHub] Viewport on Android:**
  - The player shell sets `.player-shell-content { height: calc(100vh) }`. On Android Chrome this hides about 71 px of the bottom under the system navigation bar.
  - Code inside the iframe cannot detect it: `innerHeight` and `visualViewport` report the full height.
  - Microsoft is considering `100dvh`. The issue is still open; an internal repair item was opened 22 Oct 2026 — [Issue #364](https://github.com/microsoft/PowerAppsCodeApps/issues/364).
  - The related Android bottom-nav issue #327 was closed 19 Jun 2026. "White strips" around dark apps because the host container background could not be set: #375, closed 17 Jun 2026 — [issue list](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile).
- **[Official] Header:**
  - Hide it for all users with `pa app set-setting --show-header false` (`appSettings.showHeader` in `power.config.json`), then push.
  - Or per link with `?hideNavBar=true` (`&hideNavBar=true` if the URL already has a query string).
  - — [System configuration, Learn, 11 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration).
- **[Official]** When embedding, pass `allow="geolocation; microphone; camera; fullscreen; clipboard-write"` on the outer iframe if those APIs are used — [Embed in an iframe, Learn](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe).
- **[Community, GitHub] Teams:**
  - A Teams tab showed "`…powerplatformusercontent.com` refused to connect", although the maker portal offers "Add to Teams".
  - Microsoft staff said it "looks like a CSP issue" and closed it 22 Apr 2026, advising a CSP update. No documented list of Teams origins was given.
  - — [Issue #296](https://github.com/microsoft/PowerAppsCodeApps/issues/296).
- **[Official staff on GitHub]** Hosting code apps inside model-driven apps was a feature request, closed 21 Oct 2026 (#508). Code apps don't run in China 21Vianet (#463, closed 23 Oct 2026). GCC High CLI failures (#331, closed 1 Jul 2026) — [issue lists](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+router+OR+BrowserRouter+OR+HashRouter+OR+lazy+OR+chunk+OR+base).
- **[Official]** Code apps don't support SharePoint forms integration or Power BI data integration. They can be embedded in Power BI reports via the Power Apps visual — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).

### Inferences
- **Viewport and pinch-zoom:**
  - On mobile browsers the **top-level** page's `<meta name="viewport">` (the player's on `apps.powerapps.com`) governs page zoom. The app's own meta viewport inside the iframe has no effect on page zoom.
  - The app's pinch-zoom grids handle touch and gesture events themselves inside the iframe, so they should still receive pinches — `touch-action` and `preventDefault` work in iframes — but iOS Safari may zoom the whole player page instead. Must be tested on an iPhone.
  - `env(safe-area-inset-*)` inside the iframe will probably read 0; the shell decides safe areas.
- **For iPhone members:** share the `/app/` URL with `hideNavBar=true`, opened in Safari. If they use the Power Apps app, test it separately — it has had serious regressions as recently as July 2026, with Android bugs open in November.
- **For Teams:** an admin would need to add Teams origins (likely `https://teams.microsoft.com` and the `*.cloud.microsoft` hosts) to `frame-ancestors` for the environment. Unverified.
- **Offline:** not available. The app needs network for every data call.

### Gaps
- No official announcement or date for mobile-app support, and no minimum app version.
- Nothing found on: Teams mobile; Edge on Intune-managed phones (Conditional Access app-protection policies would apply as for any Entra web app — unverified); the player's loading screen on phones; how iOS Safari handles the player's viewport and pinch-zoom.

## 7. Performance, loading and monitoring

### Takeaway
No published cold-start figures. The platform hands the app a `sessionLoadSummary` metric (time to interactive) and per-request metrics, which can go to App Insights once its endpoints are added to `connect-src`. Start-up failures show only in Power Platform Monitor and the admin center health metrics.

### Cited findings
- **[Official]**
  - Call `setConfig({ logger: { logMetric } })` from `@microsoft/power-apps/app` once.
  - Built-in metric types:
    - `sessionLoadSummary`: `successfulAppLaunch`, `appLoadResult: 'optimal'|'other'`, `appLoadNonOptimalReason: 'interactionRequired'|'throttled'|'screenNavigatedAway'|'other'`, `timeToAppInteractive`.
    - `networkRequest`: `url`, `method`, `duration`, `statusCode`, `responseSize`.
  - App Insights "only captures telemetry after the app successfully loads"; start-up failures show only in Monitor.
  - — [Set up App Insights, Learn, 5 Mar 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights).
- **[Official]** Operational health metrics for code apps are in the Power Platform admin center and the maker portal — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Official]** The March 2026 App Insights page says environment variables "aren't yet supported" for code apps. The Learn table of contents now has a "Use environment variables" page, so this has likely changed — [App Insights page, 5 Mar 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights); [Learn TOC, read 19 Nov 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/toc.json).
- **[Community, GitHub]** "Code Apps intermittently fail to load with UnexpectedError" (blank Vite template), closed 2 Jun 2026 (#330). Local Play fails when the `EnableAuthenticatedGateway` feature gate is on (#504, closed 30 Oct 2026) — [issue lists](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile).
- **[Official]** A dedicated Learn troubleshooting page exists for **Zscaler** (corporate proxy) issues — [Learn TOC](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/toc.json).

### Inferences
- Cold start = player shell + host sign-in + data-loss-policy and consent checks + loading `index.html` and the first chunks from the asset host, then `getContext()`. Keep the first chunk small; the lazy page chunks help.
- The 30-second background poll goes through connectors. Its requests will show in `networkRequest` metrics. Watch Dataverse throttling ("throttled" is a named non-optimal load reason).

### Gaps
- No figures on cold-start time, CDN caching headers, or whether the bundle is cached across pushes.

## 8. Other known gotchas (developer reports, 2026)

### Cited findings
- **[Community]** Custom Vite setups need `base: './'`. Use the Dataverse `…WithOrganization` method variants, or results can come back silently empty. `CreateRecord` returns void, so read the record back after creating it. Schema changes need the data source deleted and re-added. Connections are made in the maker portal. There is no automatic theming — [Paul Bien, 18 Feb 2026](https://paulbien.com/guides/code-apps-complete-guide).
- **[Community, GitHub, with dates]** — [issue lists](https://github.com/microsoft/PowerAppsCodeApps/issues?q=is%3Aissue+mobile):
  - Flow responses with non-ASCII characters were corrupted (#359, closed 10 Sep 2026).
  - A PDF could not be opened inside a code app (#413, closed 22 Oct 2026).
  - "Redirect Failed" on an Outlook compose URL (#425, closed 26 Oct 2026).
  - A request for an exit/close function (#498, closed 20 Oct 2026).
  - Binary SharePoint uploads saved as base64 text (#522, closed 13 Nov 2026).
  - An app disappeared in QA/production after a pipeline redeploy (#325, closed 11 Aug 2026).
- **[Official]** Not supported: Power Platform Git integration, Secure Implicit Connections, SAS IP binding — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).
- **[Official]** End users need a Power Apps Premium licence (or pay-as-you-go, an app pass, or auto-claim). An admin enables code apps per environment (Settings → Product → Features) — [Overview, Learn, 23 Sep 2026](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview).

### Inferences
- Opening links, PDFs or `mailto:`/compose URLs from inside the sandboxed iframe is a recurring pain point. Expect `window.open` and top navigation to depend on the undocumented sandbox flags.

### Gaps
- No issue thread gave the actual fix for #413 or #425 in the summaries I read.
