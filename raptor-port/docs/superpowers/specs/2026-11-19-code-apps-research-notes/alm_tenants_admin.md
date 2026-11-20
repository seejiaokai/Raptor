# Moving a Power Apps code app between tenants (ALM) and the admin side of code apps

Research date: 19 Nov 2026. All "official" items are Microsoft Learn pages; dates given are each page's `ms.date` (the "last updated" date shown on the page) and, where different, its later `updated_at` build stamp. Community items are marked **[community]**.

**Headline fact that changes the brief's wording:** the code-apps tooling is no longer `pac code ...` inside the Power Platform CLI. Since the v1.0 / GA period it is a separate npm-installed **Power Apps CLI, command `pa`** (`npm install --global @microsoft/power-apps-cli`), with `pa app init`, `pa app push`, `pa app add data-source`, `pa app share`, etc. Every current Learn page uses `pa`; some older localised pages still say `pac code add-data-source` — [CLI reference, ms.date 2026-11-10](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli); [Quickstart, ms.date 2026-08-13](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch). Code apps went **GA in February 2026** — Microsoft's [February 2026 feature update blog](https://www.microsoft.com/en-us/power-platform/blog/power-apps/whats-new-in-power-platform-february-2026-feature-update/) (seen via search summary; not opened in full); the January 2026 office-hours recap said GA was "scheduled for the first week of February" — [powerappsguide.com, 28 Jan 2026] **[community]**(https://powerappsguide.com/blog/post/code-apps-office-hours-january-2026-highlights-part-2).

---

## 1. Are code apps solution-aware? Export/import, what carries over, Pipelines, Git

### Takeaway
Yes. A code app can live in a Dataverse solution (the CLI adds it on `pa app push`, or a maker adds it via Solutions → Add existing → App → Code app), and Microsoft says that exporting the solution and importing it elsewhere moves the app, with Power Platform Pipelines supported. Power Platform **Git integration (source-code integration) is not supported**. Nothing official specifically covers a *cross-tenant* solution import of a code app, and the target team here takes no solution files anyway — so the practical hand-over route is source + rebuild + `pa app push` in their tenant (section 2).

### Cited Findings
- "Putting an app in a solution makes it portable across environments through standard ALM. When you export the solution from one environment and import it into another, the app moves with it." — [ALM for code apps, ms.date 2026-08-27 (updated 2026-09-01)](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- Prerequisite for solution placement: an environment **with Dataverse**; in an environment without Dataverse the app publishes without a solution. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- `pa app push --solution-id <GUID>` (alias `-s`; env var `PA_CLI_SOLUTION_ID`) targets a solution. Solution **names are not accepted, only the GUID**. Validation: non-GUID → stops; solution not found → stops; environment without Dataverse → stops and tells you to publish without `--solution-id`. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- Automatic selection on **first** publish (no `--solution-id`): (1) the environment's **preferred solution** (if none set, Dataverse uses the *Common Data Service Default Solution*); (2) else the all-components Default solution; (3) else no solution. On **later** publishes without `--solution-id` the CLI leaves membership unchanged; with it, adds the app to that solution. Tip: set a preferred solution for predictable ALM. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- Find a solution ID: make.powerapps.com → **Solutions** → select solution → copy GUID from URL `https://make.powerapps.com/environments/<environment-id>/solutions/<solution-id>/overview`; or `pa solution list`. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Add an already-published code app to a solution in the portal: make.powerapps.com → **Solutions** → select solution → **Add existing → App → Code app** → pick the app. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- "After you add the app to a solution, use Power Platform Pipelines to deploy across stages (Dev → Test → Prod) with preflight checks for dependencies, connection references, and more." — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- Limitations: code apps "Don't support source code integration" (Power Platform Git integration). Repeated in the overview's limitations list. — [ALM page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm); [Overview, ms.date 2026-09-23](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- **Connection references** are supported: `pa app add data-source --connector <id> --connection-ref <logical-name> --solution-id <solution-id>`; list them with `pa connection list-references --solution-id <id>`. "Instead of binding your app directly to a user-specific connection, bind it to a reference. This approach makes the solution environment-aware and portable across Dev, Test, and Prod." — [Connect to data, ms.date 2026-10-02](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)
- **Environment variables** are supported for tabular arguments: `--dataset "@envvar:<schemaName>" --table "@envvar:<schemaName>"`; the `@envvar:` references are stored in `power.config.json` and "when you move the app to another environment, it uses the values configured for those environment variables in that environment." — [Use environment variables, ms.date 2026-08-13](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-environment-variables)
- Microsoft's earlier (Jan 2026) office hours said "solution packager support and auto-saving to preferred solutions are live in the latest PAC CLI." — [powerappsguide.com, Jan 2026] **[community]**(https://powerappsguide.com/blog/post/code-apps-office-hours-january-2026-highlights-part-2)
- Community advice: code apps "are stored as HTML, JavaScript, and CSS files, not in Dataverse"; "Deploy from the repository to Test and Prod, not through the standard Dev-Test-Prod export path"; a person other than the developer should deploy, after code review/scanning; existing Power Platform review tools may not support code apps yet. — [David Wyatt, DEV Community, 23 Mar (2026 presumed)] **[community]**(https://dev.to/wyattdave/setting-your-environments-up-for-code-apps-16i8)
- General (not code-app-specific) cross-tenant solution practice: export from source, import into target tenant; importer needs at least **System Customizer** in the target; connections must be rebuilt in the new tenant. — [Power Platform Community thread] **[community]**(https://community.powerplatform.com/forums/thread/details/?threadid=8cbaa0dd-a7d4-4aeb-a81f-9ee73f709171); [wickedsmartdata.com, 2026] **[community]**(https://www.wickedsmartdata.com/articles/migrating-flows-between-tenants-solution-export-connection-remapping-and-cutover)

### Inferences
- What would travel in a solution: the code app component, connection references (not the connections), environment-variable definitions (values set per target), and Dataverse tables if they are in the same solution. Connections, sharing, security-role assignments and data never travel and must be recreated in the target. (Standard solution behaviour; not stated code-app-specifically.)
- Because the target centre of excellence builds tables itself from a written list and takes no solution files, the hand-over is effectively: they receive **source code**, rebuild, and publish with `pa app push` into a solution of their own (their preferred solution or `--solution-id`). The solution route remains useful *inside* their tenant (their own dev→prod), but they have only one production environment for code apps, so pipelines may not apply.
- No Git integration means the source repository (outside Power Platform) is the system of record; the compiled bundle in Power Platform is not editable source.

### Gaps
- No Microsoft page explicitly confirms a **cross-tenant** solution import of a code app (as opposed to cross-environment). Assumed to work like any solution component, unverified.
- Not found: whether the target environment must have the "Enable code apps" toggle on *before* a solution containing a code app imports (very likely yes; not documented).
- Not found: whether managed solutions lock the code app against `pa app push` updates in the target (managed-layer behaviour for code apps undocumented).

---

## 2. Rebuild and push in the target tenant from source — rights needed, and what in power.config.json is environment-specific

### Takeaway
Yes — the target builder clones the source, runs `npm install`, `pa app init` (or keeps `power.config.json` and points it at their environment), re-adds data sources against *their* Dataverse tables, `npm run build`, `pa app push`. The environment-specific values are: environment ID, app ID (created on first push in that environment), cloud, Dataverse organization URL, connection IDs / connection-reference logical names, solution ID, and env-var schema names. Microsoft does not publish the full `power.config.json` schema.

### Cited Findings
- Install and init: `npm install --global @microsoft/power-apps-cli`, `npm install --global @microsoft/power-apps`, `npm install`; `pa app init --display-name "<name>" --environment-id <environment-id>`; it prompts sign-in (browser) if not authenticated. Prerequisites: a Power Platform environment **with code apps enabled**, Node.js LTS, Git. Then `npm run build` and `pa app push`, which returns a Power Apps play URL. — [Quickstart, ms.date 2026-08-13](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- `pa app init` options: `--display-name`, `--environment-id`, `--description`, `--build-path` (default `./dist`), `--file-entry-point` (default `index.html`), `--app-type` (`CodeApp` default or `MobileApp`), `--app-url` (default `http://localhost:3000`, saved as `localAppUrl`), `--cloud`. — [CLI reference, ms.date 2026-11-10](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli); [CLI environment variables, ms.date 2026-10-02](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- `--cloud` / `PA_CLI_CLOUD` values: `public` (default), `usgov`, `usgovhigh`, `usgovdod`, `china`. `PA_CLI_ENVIRONMENT_ID` = target environment ID. — [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- `power.config.json` "contains metadata. Both the CLI and Power Apps client library for code apps use this metadata for Power Platform connections and to publish an app to an environment. Your app logic doesn't need to interact with the `power.config.json` file." — [Architecture, ms.date 2026-08-12](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture)
- Documented `power.config.json` contents: `appSettings` object (`showHeader`, `customizeRequestAccess.{enabled,title,messageBody}`); `localAppUrl`; app type; data sources incl. `@envvar:` references; flows and their connection references (`pa app add flow` "adds the flow and its connection references to `power.config.json`"). — [System configuration, ms.date 2026-11-10](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration); [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- `pa app share` "The code app must already be published and have an app ID from a successful `pa app push` command." (i.e., app ID is minted per environment on first push.) — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Native Dataverse data source: `pa app add data-source --connector dataverse --table <table-logical-name>` (one table per command); interactive prompts ask for table logical name and **Dataverse organization URL** (`--org-url` / `PA_CLI_ORG_URL`). Native Dataverse "doesn't use a connection ID, connection reference, or dataset." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli); [Connect to Dataverse, ms.date 2026-08-14 (updated 2026-10-30)](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- `pa app refresh data-source --name <name>` regenerates model/service files when schema changes; `pa app remove data-source`. — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)
- Publisher rights (service principal page): to publish an update, the identity "needs access to the target Power Platform environment and **edit** access to the code app. Environment-level permissions alone don't grant permission to update an existing app." An app maker must share with `pa app share --principal <EnterpriseApp object id> --access edit` once first. — [Publish with a service principal, ms.date 2026-08-26](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-service-principal)
- Service principal / CI: `PA_CLI_USE_SP_AUTH=true`, `PA_CLI_SP_CLIENT_ID`, `PA_CLI_SP_CLIENT_SECRET`, `PA_CLI_SP_TENANT_ID`, then `pa app push --non-interactive`; exit code 0 = published. — [Service principal page](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-service-principal); [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- `pa app add flow`: "The person who runs `pa app add flow` must have access to the flow and its underlying connections." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- General: importing solutions into a target needs at least **System Customizer**. — [Community thread] **[community]**(https://community.powerplatform.com/forums/thread/details/?threadid=8cbaa0dd-a7d4-4aeb-a81f-9ee73f709171)

### Inferences
- Rights for the target builder (not stated on any code-app page): to create a *new* app in a Dataverse environment the person needs the **Environment Maker** security role (creating any app in an environment requires it); to have `pa app push` add it to a solution, or to add a native Dataverse table's metadata, **System Customizer** (or a role with solution/customization privileges) is the safe assumption; for later updates, **edit** (co-owner) share on the app. An "ordinary user" with no maker role likely cannot do the first push — flag to the target team.
- Values that will differ per tenant and must change: environment ID, cloud (if their tenant is sovereign), Dataverse org URL, app ID (new on first push — do not carry the test tenant's), solution ID, any connection IDs / connection-reference logical names, env-var schema names (these carry the publisher prefix), and all table/column logical names (prefix). Safest hand-over: ship the source **without** a populated `power.config.json` app/environment binding (or with instructions to `pa app init` fresh), plus a script of the `pa app add data-source` commands.

### Gaps
- No official full schema of `power.config.json` (fields such as `appId`, `environmentId`, `region`, `databaseReferences` are seen in community samples historically but not on current Learn pages). The sample repo path `samples/Dataverse/power.config.json` returned 404.
- No official statement of the minimum security role for `pa app push` by a human.

---

## 3. How the Dataverse schema binds to the app — consequence of a different publisher prefix

### Takeaway
The generated TypeScript models and services are produced from the live table metadata, keyed by **table logical name** (which carries the publisher prefix, e.g. `cr123_shift`). If the production team's prefix differs from the test tenant's, every table and column logical name changes, so data sources must be re-added against their tables and every code reference to field names must be updated.

### Cited Findings
- Adding a table requires its **logical name**: `pa app add data-source --connector dataverse --table <table-logical-name>`. — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- Generated files: e.g. Accounts table → `AccountsModel.ts`, `AccountsService.ts` in `src/generated/models` / `src/generated/services`; "The generated models reflect the schema of your Dataverse table." Queries use column logical names (e.g. `select: ['name','accountnumber','address1_city']`, OData `filter` strings). — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- Supported: CRUD, option-set formatted values, table metadata, lookups (via single-valued navigation property guidance), image/file upload-download **(preview)**, delegation of Filter/Sort/Top, paging. Not supported: polymorphic lookups, schema (metadata) CRUD, FetchXML, alternate keys. — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- Env-var schema names carry the prefix too (example `crd1b_SharepointSiteVar`). — [Use environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-environment-variables)
- Connection-reference logical names carry it (example `cr123_sharedsharepointonline_1a2b3`). — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)

### Inferences
- Design mitigation: keep the app's own code behind a thin data layer that maps app-level names to Dataverse logical names in one file, so a prefix change ("talon" in test vs the IT side's prefix) is one mapping edit plus regenerated services. Also keep table *base* names, column names, choice values, and relationships identical in the written table list so only the prefix differs.
- Choice (option set) integer values are generated per environment unless the table list fixes them; differing values would silently break filters — worth pinning in the table list.
- The tables must exist in the target before `pa app add data-source` can generate code there (metadata is read live).

### Gaps
- No official doc on renaming/regenerating across prefixes; no tool to remap.

---

## 4. Tenant/environment admin settings that touch code apps (with click paths)

### Takeaway
Code apps are **off by default** per environment and are switched on in PPAC → Manage → Environments → [env] → Settings → Product → Features → "Power Apps code apps" → Enable code apps. Then they obey the normal managed-platform controls: data policies (DLP) at launch, sharing limits, app quarantine, per-app Conditional Access, tenant isolation, B2B guests, health metrics, and an environment-level **Content Security Policy** that is enforced by default. IP firewall / SAS IP binding does **not** apply to code apps.

### Cited Findings
**Enable code apps** — [Overview, ms.date 2026-09-23](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
1. PPAC (https://admin.powerplatform.microsoft.com) as Power Platform admin or environment admin.
2. **Manage → Environments** → select environment.
3. **Settings** → expand **Product** → **Features**.
   - Screenshot: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/enable-settings-products-features.png` — alt "Screenshot of the Product features settings in the Power Platform admin center."
4. Find **Power Apps code apps**, turn on **Enable code apps**.
   - Screenshot: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/enable-code-apps.png` — alt "Screenshot of the Power Apps code apps feature and Enable code apps toggle."
5. **Save**. Can be set at scale via environment groups and rules.

**Managed-platform capabilities that work for code apps** (table on the overview page): consent dialog for connector permissions; **sharing limits** ("follow canvas app sharing limits"); **App Quarantine**; **data policy enforcement during app launch**; **Conditional Access on an individual app**; admin consent-dialog suppression (Microsoft OAuth and custom OAuth connectors); **tenant isolation**; **Azure B2B (external user access)**; health metrics in PPAC and maker portal. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)

**Limitations** — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview); [System configuration, ms.date 2026-11-10](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration)
- Code apps don't use Storage SAS IP restriction, so the **SAS IP Binding and Firewall environment setting doesn't apply**; compiled assets are served from a **publicly accessible endpoint** without IP restriction; use Entra **Conditional Access – block by location** instead. "Don't store sensitive user or organizational data in the app" — keep it in a data source behind auth.
- Not yet supported: **Secure Implicit Connections**; Power Platform Git integration; Power Apps for Windows; Power BI data integration (PowerBIIntegration) (but can be embedded via the Power Apps visual); SharePoint forms integration.
- Connectors not yet supported: Excel Online (Business), Excel Online (OneDrive). — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)

**Content Security Policy (code apps)** — [Configure CSP, ms.date 2026-04-07](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
- Environment-level, applies to all code apps in the environment; **enforced by default**. Requires environment admin. With Dataverse: configure in PPAC; without Dataverse: REST API.
- Path: PPAC → **Manage** → **Environments** → select environment → **Settings** → expand **Product** → **Privacy + Security** → under **Content security policy**, select the **App** tab.
  - Screenshot: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/media/content-security-policy-settings-overview.png` — alt "Image of the Code Apps CSP setting UO in the Power Platform admin center"
  - `.../media/content-security-policy-reporting-setting.png` — alt "Screenshot of a toggle labeled Enable reporting turned on and a text box labeled Reporting endpoint containing a url."
  - `.../media/content-security-policy-directive-settings.png` — alt "Screenshot of CSP directives configured in different states"
- Defaults include: `frame-ancestors 'self' https://*.powerapps.com`; `script-src 'self' <platform>`; `img-src 'self' data: <platform>`; `style-src 'self' 'unsafe-inline'`; `font-src 'self'`; `connect-src 'none'`; `default-src 'self'`; `worker-src 'none'`; `form-action 'none'`; `manifest-src 'none'`. Custom values append to defaults (replace when default is `'none'`); turning a toggle off with an empty list removes the directive.
- REST: `https://api.powerplatform.com/environmentmanagement/environments/{environmentId}/settings` with settings `PowerApps_CSPEnabledCodeApps`, `PowerApps_CSPReportingEndpoint`, `PowerApps_CSPConfigCodeApps`.
- Message center MC1218747: after **30 Jan 2026**, code apps calling assets outside Power Apps domains are blocked by default. — [MC1218747 via mc.merill.net] **[aggregator of Microsoft message center]**(https://mc.merill.net/message/MC1218747)
- Community: CSP changes may need the browser closed and reopened; treat `connect-src` as effectively your DLP for direct fetch calls; keep fonts/images self-hosted. — [Wyatt, DEV] **[community]**(https://dev.to/wyattdave/setting-your-environments-up-for-code-apps-16i8)

**Data policies (DLP)** — [Manage data policies, ms.date 2026-04-07 (updated 2026-08-14)](https://learn.microsoft.com/en-us/power-platform/admin/prevent-data-loss)
- Path: PPAC → **Security** → (Settings) **Data and privacy** → **Data policy** → **+ New Policy** → name → **Pre-built connectors** (move to Business / Non-business / Blocked; **Set default group** for new connectors) → **Custom connectors** → **Scope** (tenant-level only) → **Environments** → **Review** → **Create policy**.
- Roles: tenant-level = Power Platform Administrator; environment-level = Environment Admin (System Administrator where Dataverse exists). Environment-level policies can't override tenant ones.
- Some connectors are **unblockable** (e.g. SharePoint) — they sit in Non-business by default and can't be blocked.
- Screenshots: `https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-view-no-policies-new.png` ("No policies view"), `media/dlp-assign-connectors-new.png` ("Assign connectors"), `media/dlp-business-data-group-new.png` ("Business data group"), `media/dlp-edit-default-group-new.png` ("Set default group"), `media/dlp-define-scope-new.png` ("Define scope."), `media/dlp-exclude-environments-new.png` ("Exclude environments."), `media/dlp-new-policy-review-new.png` ("Review new policy.").

**Tenant isolation** — [Restrict cross-tenant access, ms.date 2025-04-23 (updated 2026-08-14)](https://learn.microsoft.com/en-us/power-platform/admin/cross-tenant-restrictions)
- PPAC → **Security** → **Identity and access** → **Tenant isolation** → turn on **Restrict cross-tenant connections** → **Add exceptions** (direction inbound/outbound/both, tenant ID or domain, `*` wildcard) → **Save**. Power Platform admin role. Max 500 rules; ~1 hour to take effect.
- Applies only to connectors using Entra auth (e.g. Office 365 Outlook, SharePoint); "doesn't impact Microsoft Entra ID-based access outside of Power Platform."
- Screenshots: `https://learn.microsoft.com/en-us/power-platform/admin/media/restrict-outbound-inbound-cross-tenant.png` ("Restrict outbound and inbound cross-tenant access."), `media/allow-list-both-tenants.png`.

**Environment security group** — [Control user access, ms.date 2026-08-26](https://learn.microsoft.com/en-us/power-platform/admin/control-user-access)
- PPAC → **Manage** → **Environments** → select environment → **Edit** → in **Edit details**, **Edit** icon by **Security group** → pick group (first 200 shown; search) → **Done** → **Save**.
  - Screenshot: `https://learn.microsoft.com/en-us/power-platform/admin/media/edit-security-groups-new-tab.png` — alt "Select the Edit icon to select a security group."
- Effects: adding/removing group members adds/disables environment users; associating a group disables existing non-members; only licensed members are created; Security and Microsoft 365 group types only (not on-prem AD); **cannot assign a security group to default or developer environments**; Power Platform Administrators get in regardless; application users run regardless; users still need a **Dataverse security role** or get "data access denied". Apps can be shared with non-members but they see "You can't open apps in this environment. You aren't a member of the environment's security group."
- Role matrix: Groups Administrator for group membership; License Administrator for licences; Power Platform Admin to associate group; System Administrator role to assign Dataverse roles (admins must self-elevate).
- Create group: Microsoft 365 admin center → **Teams & groups → Active teams & groups → + Add a group** → type **Security group**.

### Inferences
- For the target tenant: their builder (ordinary user) can't flip the code-apps toggle, CSP, DLP or tenant isolation — all need environment or Power Platform admin; put these on the centre of excellence's checklist.
- If the app loads anything from a non-Power-Apps domain (fonts, images, CDN scripts, direct fetch), the default CSP will block it — the app should bundle all assets and use only connectors/Dataverse via the SDK.
- The "public endpoint" note matters for a restricted tenant: the JS bundle itself is publicly fetchable; no secrets or sensitive data may be compiled into it.

### Gaps
- **Managed Environments requirement**: the current overview no longer lists Managed Environments as a prerequisite (earlier preview material did). Sharing limits and per-app Conditional Access are Managed Environment features, so the target likely uses one; not confirmed as mandatory for code apps.
- App quarantine / per-app Conditional Access click paths not fetched (linked from overview: [admin-manage-apps](https://learn.microsoft.com/en-us/power-platform/admin/admin-manage-apps)).
- Auditing: nothing code-app-specific found; Dataverse auditing on tables is the standard mechanism.
- Customer Lockbox, VNet support (subnet delegation): no code-app-specific statement found. Code apps' Dataverse calls go through the platform, so VNet (which covers plug-ins/connectors to private resources) is likely irrelevant here — inference only.

---

## 5. Sharing with a security group, end-user licensing, URL, Teams / mobile

### Takeaway
Share via make.powerapps.com → Apps → Share (or `pa app share`), naming the Entra security group; users need Power Apps Premium (or pay-as-you-go, App Pass, or auto-claim), a Dataverse security role, and membership of the environment's security group. Play URL: `https://apps.powerapps.com/play/e/{environment-id}/a/{app-id}`. Embedding in an iframe works (same-tenant users only, frame-ancestors CSP change). **Code apps are not supported in Power Apps for Windows**; official status in Teams and the Power Apps mobile app is not documented.

### Cited Findings
- End users need one of: **Power Apps Premium**, **pay-as-you-go enabled**, an **App Pass**, or **auto-claim enabled** (auto-assigns a premium licence if one is available). — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- `pa app share --principal <emails or Entra object IDs, comma-separated> [--access play|edit]`. — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Canvas sharing (code apps "follow canvas app sharing limits"): make.powerapps.com → **Apps** → select app → **Share** → type user or Entra security group → **User** or **Co-Owner**; for Dataverse apps a **More security roles** option assigns roles at share time (needs System Administrator in Dataverse); use a security group for >100 users; members must be explicit members (owners aren't automatically members); Microsoft 365 groups need `SecurityEnabled = true`; can't share with distribution groups; licences can't be requested for groups. Screenshots e.g. `https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/media/share-app/share-app-coowner.png` ("share with a co-owner"), `media/share-app/share-app-access.png` ("Manage app access"), `media/share-app/cds-assign-security-role-list.png` ("Security role list."). — [Share a canvas app, ms.date 2026-09-17](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/share-app) (applicability of the portal Share dialog to code apps inferred from the overview's "follow canvas app sharing limits")
- Play URL: `https://apps.powerapps.com/play/e/{environment-id}/a/{app-id}`; append `?hideNavBar=true` to hide header; or `pa app set-setting --show-header false` then push. — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration)
- Iframe embedding: URL `https://apps.powerapps.com/play/e/{environmentId}/app/{appId}?tenantid={tenantId}`; "Only Power Apps users within the same tenant can access an embedded code app"; add host origin to `frame-ancestors` (e.g. `https://<org>.crm.dynamics.com`). Updated 2026-08-11. — [Embed in an iframe, ms.date 2026-03-06](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe)
- "Code apps aren't supported in Power Apps for Windows." — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- `pa app init --app-type` accepts `MobileApp` as well as `CodeApp` (no further explanation on the page). — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Mobile timing (community recaps of Microsoft office hours): Feb 2026 "targeting summer for mobile online support"; Mar 2026 "unlikely before July 2026, no committed date"; Dec 2025: mobile low on priority, offline needed first. — [powerappsguide.com March 2026] **[community]**(https://powerappsguide.com/blog/post/code-apps-office-hours-march-2026-highlights); [Feb 2026] **[community]**(https://powerappsguide.com/blog/post/code-apps-office-hours-february-2026-highlights)
- Teams sharing for canvas apps needs Teams admin settings "Allow interaction with custom apps" and "Shared Power Apps". — [Share a canvas app](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/share-app)
- Microsoft states model-driven apps can no longer be newly added to Teams. — [Embed model-driven app in Teams](https://learn.microsoft.com/en-us/power-apps/teams/embed-model-driven-teams-tab)

### Inferences
- The presence of a `MobileApp` app type suggests some mobile path now exists, but no Learn page describes running a code app in the Power Apps mobile app — treat phone use as **browser (mobile Safari) at the play URL** until confirmed.
- Teams: a link/website tab to the play URL is the plausible route; a native "Add to Teams" for code apps is unconfirmed.

### Gaps
- Official statement on code apps in the Power Apps mobile app and in Teams: not found.
- Auto-claim policy click path (M365 admin center → Billing → Licenses → Auto-claim policy) not verified this session.

---

## 6. Government / sovereign clouds and regions

### Takeaway
The CLI officially supports `usgov`, `usgovhigh`, `usgovdod` and `china` clouds, so code apps are built for sovereign clouds, but Microsoft's US Government service page (updated 18 Nov 2026) does not mention code apps and points to a separate parity spreadsheet. Microsoft's Jan 2026 office hours targeted GCC for March 2026 **[community]**. No region notes (e.g. Asia/Singapore) for code apps were found.

### Cited Findings
- `PA_CLI_CLOUD`: `public`, `usgov`, `usgovhigh`, `usgovdod`, `china`. — [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- US Gov URLs: maker `make.gov.powerapps.us` (GCC), `make.high.powerapps.us` (GCC High), `make.apps.appsplatform.us` (DoD); admin `gcc.admin.powerplatform.microsoft.us`, `high.admin.powerplatform.microsoft.us`, `admin.appsplatform.us`; play `apps.high.powerapps.us` (GCC High), `play.apps.appsplatform.us` (DoD; table also lists it for GCC). Feature exceptions are in the "Business Applications US Government – Availability Summary" (https://aka.ms/BAPFunctionalParity). Page does not mention code apps. — [Power Apps US Government, ms.date 2026-11-10 (updated 2026-11-18)](https://learn.microsoft.com/en-us/power-platform/admin/powerapps-us-government)
- "Support for Government Clouds (GCC) is expected in March" (2026). — [powerappsguide.com Jan 2026] **[community]**(https://powerappsguide.com/blog/post/code-apps-office-hours-january-2026-highlights-part-2)

### Inferences
- The target described (a government M365 tenant outside the US, per context) is most likely on the **public commercial cloud** in a local geography, not a US sovereign cloud; in that case `--cloud public` and normal URLs apply. Confirm the tenant's cloud with their team.

### Gaps
- No official per-cloud availability table for code apps; the parity spreadsheet was not opened.
- No Singapore/Asia region notes found.
- Customer Lockbox / IP firewall / VNet effects: only the IP firewall point is documented (doesn't apply; see section 4).

---

## 7. Building a personal test tenant that mirrors a restricted one

### Takeaway
Big change this month: **from 15 Nov 2026 the Developer Plan no longer creates a developer environment, unmanaged developer environments are suspended from 15 Dec 2026 and deleted from 15 Jan 2027**, and each user may create only one *managed* developer environment, whose users need premium licences. Also, a security group **cannot** be attached to a developer environment. To mirror the target (one production environment, security-group gated, DLP, auditing), the test tenant should use a **sandbox or production environment with Dataverse**, Managed Environments on, code apps enabled, a tenant DLP policy blocking non-Microsoft connectors, and an environment security group.

### Cited Findings
- Deprecation: unmanaged developer environments (incl. those created by Developer Plan sign-up) "are suspended starting December 15, 2026 and deleted starting January 15, 2027"; "Starting November 15, 2026, signing up for the Developer Plan no longer creates a developer environment, and you can't create new unmanaged developer environments"; each user can create only one managed developer environment; Developer Plan doesn't include Managed Environment use rights, so users need a premium licence to run assets there. — [Power Apps Developer Plan, ms.date 2026-10-26 (updated 2026-10-29)](https://learn.microsoft.com/en-us/power-platform/developer/plan); [Important changes coming](https://learn.microsoft.com/en-us/power-platform/important-changes-coming)
- Developer environment capacity: 750 flow runs/month, 2 GB database; Dataverse included; banner shown on apps in developer environments. Screenshot `https://learn.microsoft.com/en-us/power-platform/developer/media/power_apps_dev_env_app_banner.png` ("Power Apps Developer Environment app banner."). — [Developer Plan page](https://learn.microsoft.com/en-us/power-platform/developer/plan)
- "You can't assign security groups to default and developer environment types." Automatic user assignment isn't supported for **trial** environments. — [Control user access](https://learn.microsoft.com/en-us/power-platform/admin/control-user-access)
- Standard trial environments remain available. — [Developer Plan page](https://learn.microsoft.com/en-us/power-platform/developer/plan)
- DLP creation steps and security-group association steps: see section 4.

### Inferences
- Mirror checklist for the owner's premium M365 test tenant: (1) create a **Sandbox** (or Production) environment with Dataverse in the same geography as the target; (2) enable **Managed Environments**; (3) Settings → Product → Features → **Enable code apps**; (4) leave CSP enforced (default) and test that nothing breaks; (5) tenant-level data policy: move only Microsoft 365 connectors the target allows (Dataverse, Office 365 Users/Outlook, Teams, Power Automate-related) to Business, set default group for new connectors to **Blocked**, block everything blockable that's non-Microsoft; (6) associate one Entra security group with the environment; (7) create a publisher with a test prefix (e.g. "talon"), build tables from the written list in a solution; (8) turn on Dataverse auditing; (9) optionally tenant isolation on; (10) test as a non-admin licensed user who is only in the group with only a custom security role — and as a maker with only Environment Maker to rehearse the target builder's `pa app push`.
- Note: "trial" environments don't auto-add security-group users and expire; a sandbox under a paid licence is the closer mirror.

### Gaps
- Microsoft 365 Developer Program sandbox eligibility changes in 2026 not researched (out of time budget).
- How to create a Dataverse environment step-by-step (PPAC → Manage → Environments → New) not fetched with screenshots.

---

## Screenshot index (for a later picture guide)

| Step | Learn page | Image URL | Alt text |
|---|---|---|---|
| Product → Features settings | [overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview) | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/enable-settings-products-features.png | Screenshot of the Product features settings in the Power Platform admin center. |
| Enable code apps toggle | same | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/enable-code-apps.png | Screenshot of the Power Apps code apps feature and Enable code apps toggle. |
| CSP App tab | [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy) | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/media/content-security-policy-settings-overview.png | Image of the Code Apps CSP setting UO in the Power Platform admin center |
| CSP reporting | same | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/media/content-security-policy-reporting-setting.png | Screenshot of a toggle labeled Enable reporting turned on and a text box labeled Reporting endpoint containing a url. |
| CSP directives | same | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/media/content-security-policy-directive-settings.png | Screenshot of CSP directives configured in different states |
| Environment security group | [control-user-access](https://learn.microsoft.com/en-us/power-platform/admin/control-user-access) | https://learn.microsoft.com/en-us/power-platform/admin/media/edit-security-groups-new-tab.png | Select the Edit icon to select a security group. |
| DLP no policies | [prevent-data-loss](https://learn.microsoft.com/en-us/power-platform/admin/prevent-data-loss) | https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-view-no-policies-new.png | No policies view |
| DLP assign connectors | same | https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-assign-connectors-new.png | Assign connectors |
| DLP default group | same | https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-edit-default-group-new.png | Set default group |
| DLP scope | same | https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-define-scope-new.png | Define scope. |
| DLP review | same | https://learn.microsoft.com/en-us/power-platform/admin/media/dlp-new-policy-review-new.png | Review new policy. |
| Tenant isolation | [cross-tenant-restrictions](https://learn.microsoft.com/en-us/power-platform/admin/cross-tenant-restrictions) | https://learn.microsoft.com/en-us/power-platform/admin/media/restrict-outbound-inbound-cross-tenant.png | Restrict outbound and inbound cross-tenant access. |
| Share as co-owner | [share-app](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/share-app) | https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/media/share-app/share-app-coowner.png | share with a co-owner |
| Share: security roles | same | https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/media/share-app/cds-assign-security-role-list.png | Security role list. |
| Code app architecture | [architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture) | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/app-development-architecture.png | Screenshot of the code app development architecture and component relationships. |
| Runtime architecture | same | https://learn.microsoft.com/en-us/power-apps/developer/code-apps/media/app-development-runtime.png | Screenshot of the code app runtime architecture and its three logical components. |

(Image URLs are built from the relative `media/...` paths on each page; not individually fetched to confirm they resolve.)
