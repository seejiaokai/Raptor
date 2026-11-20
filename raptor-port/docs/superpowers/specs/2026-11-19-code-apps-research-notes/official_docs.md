# Power Apps code apps — Microsoft's official documentation, page by page (state as of 19 Nov 2026)

How these notes were made: every Markdown source file of the Learn section was downloaded from Microsoft's public docs repo (MicrosoftDocs/powerapps-docs, folder `powerapps-docs/developer/code-apps/`, branch `main`, fetched 19 Nov 2026) and read in full; the live Learn pages for the overview (en-sg, which serves the en-us content) and the CLI reference were fetched and match the repo text and dates. The repo's commit history was read to date when things changed. "Official" below means Microsoft Learn, Microsoft's docs repo, Microsoft's npm packages, Microsoft's GitHub sample repo or Microsoft's blog; anything else is labelled.

Base URL for every page: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/` (the en-sg URL `https://learn.microsoft.com/en-sg/power-apps/developer/code-apps/overview` serves identical content; its metadata says `locale: en-us`, `canonicalUrl` = the en-us page). Source repo path: `https://github.com/MicrosoftDocs/powerapps-docs/tree/main/powerapps-docs/developer/code-apps`.

---

## 1. The documentation set: every page, its date, and what a code app is (architecture, GA vs preview, timeline)

### Takeaway
The section has 31 pages (plus a landing page). Code apps went GA on 5 Feb 2026; the whole doc set was rewritten on 18 Aug 2026 for the GA of a NEW command-line tool, the npm-based **Power Apps CLI (`pa`)**, which replaces the old Power Platform CLI `pac code …` commands (still documented, still marked "(Preview)", to be deprecated). Anything written about code apps before Aug 2026 that uses `pac auth create` / `pac code init` / `pac code push` / `npx power-apps …` is superseded.

### Cited Findings

**Full page inventory (table of contents order; `ms.date` = the page's "last updated" date on Learn):**

| TOC group | Page title | URL slug | Last updated |
|---|---|---|---|
| — | Power Apps code apps documentation (landing) | `index.yml` → `/code-apps/` | 14 Aug 2026 |
| Get started | Overview ("Features and Requirements") | `overview` | 23 Sep 2026 |
| Get started | Sign in and manage accounts | `how-to/sign-in-manage-accounts` | 13 Aug 2026 |
| Get started | Quickstart: Create a code app (Power Apps CLI) | `how-to/create-an-app-from-scratch` | 13 Aug 2026 |
| Get started | Quickstart: Create a code app with GitHub Copilot | `how-to/quickstart-github-copilot` | 24 Jun 2026 |
| Get started | Architecture | `architecture` | 12 Aug 2026 |
| Get started | System configuration (hosting, header, request-access text) | `system-limits-configuration` | 10 Nov 2026 |
| What's new? | Customize request-access text | `system-limits-configuration#customize-the-request-access-text` | 10 Nov 2026 |
| What's new? | Publish by using a service principal | `how-to/use-service-principal` | 26 Aug 2026 |
| Connect to data | Create a connection from the CLI | `how-to/create-connection` | 19 Aug 2026 |
| Connect to data | Connect to data | `how-to/connect-to-data` | 2 Oct 2026 |
| Connect to data | Connect to Dataverse | `how-to/connect-to-dataverse` | 14 Aug 2026 |
| Connect to data | Add a Dataverse action or function | `how-to/add-dataverse-action-function` | 13 Aug 2026 |
| Connect to data | Connect to Azure SQL | `how-to/connect-to-azure-sql` | 13 Aug 2026 |
| Connect to data | SharePoint operations | `how-to/sharepoint-operations` | 12 Aug 2026 |
| Connect to data | Connect to Copilot Studio | `how-to/connect-to-copilot-studio` | 13 Aug 2026 |
| Connect to data | Get Dataverse tables metadata | `how-to/get-table-metadata` | 5 Mar 2026 |
| Develop | Analyze data requests and responses | `how-to/analyze-data-request-response` | 2 Feb 2026 |
| Develop | Create a basic asset management API with Azure Functions | `how-to/create-basic-asset-management-api-azure-functions` | 5 Mar 2026 |
| Develop | Embed in an iframe | `how-to/embed-iframe` | 6 Mar 2026 |
| Develop | Use environment variables | `how-to/use-environment-variables` | 13 Aug 2026 |
| Develop | Get context data | `how-to/retrieve-context` | 2 Oct 2026 |
| Develop | Add flows | `how-to/add-flows` | 13 Aug 2026 |
| Deploy & Monitor | Application lifecycle management (ALM) | `how-to/alm` | 27 Aug 2026 |
| Deploy & Monitor | Manage Power Apps CLI telemetry | `how-to/telemetry` | 13 Aug 2026 |
| Deploy & Monitor | Set up Azure App Insights | `how-to/set-up-azure-app-insights` | 5 Mar 2026 |
| Manage | Configure Content Security Policy (CSP) | `how-to/content-security-policy` | 7 Apr 2026 |
| Manage | Migrate your code to v1.0 | `how-to/migrate-to-v1` | 5 Mar 2026 |
| Reference | Power Apps CLI command reference | `reference/cli` | 10 Nov 2026 |
| Reference | Power Apps CLI environment variables | `reference/environment-variables` | 2 Oct 2026 |
| Troubleshoot | Analyze data requests and responses (same page as above) | `how-to/analyze-data-request-response` | 2 Feb 2026 |
| Troubleshoot | Feedback and support | `feedback-support` | 6 Mar 2026 |
| Troubleshoot | Adding a data source | `troubleshoot-add-datasource` | 13 Aug 2026 |
| Troubleshoot | Zscaler issues | `troubleshoot-zscaler-issues` | 13 Aug 2026 |
— [toc.yml](https://github.com/MicrosoftDocs/powerapps-docs/blob/main/powerapps-docs/developer/code-apps/toc.yml); dates from each page's `ms.date` front matter in [the docs repo folder](https://github.com/MicrosoftDocs/powerapps-docs/tree/main/powerapps-docs/developer/code-apps); live dates confirmed for [overview](https://learn.microsoft.com/en-sg/power-apps/developer/code-apps/overview) (ms.date 2026-09-23, updated_at 2026-09-24) and [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli) (ms.date 2026-11-10, updated_at 2026-11-11).

- There is **no** separate FAQ page, release-notes page or "add to an existing app" page in the section; "What's new?" is just two TOC links (request-access text; service principal). — [toc.yml](https://github.com/MicrosoftDocs/powerapps-docs/blob/main/powerapps-docs/developer/code-apps/toc.yml)
- Two pages were deleted on 18 Aug 2026 and now redirect: `how-to/npm-quickstart` → `how-to/create-an-app-from-scratch`; `how-to/push-to-solution` → `how-to/alm#publish-to-a-solution`. — [commit "Rewrite code apps docs for the pa cli GA (#12499)", 18 Aug 2026](https://github.com/MicrosoftDocs/powerapps-docs/commit/68ec0bdb4e841612073c791871d6ab0c71d7b16f)

**What a code app is (Microsoft's words, paraphrased):**
- Code apps "let developers bring Power Apps capabilities into custom web apps built in a code‑first IDE"; develop locally, run the same app in Power Platform; build with React, Vue and others "while keeping full control over your UI and logic." — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Key features listed: Microsoft Entra authentication and authorization; access to Power Platform data sources and 1,500+ connectors callable from JavaScript; publishing and hosting of line-of-business web apps in Power Platform; adherence to Managed Platform policies (sharing limits, Conditional Access, DLP); simplified deployment and ALM. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Code apps support single-page applications (SPAs); you need "an HTML or TypeScript/JavaScript app." — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture)

**Architecture (development time):** three components — `power.config.json` ("contains metadata"; both the CLI and the client library use it "for Power Platform connections and to publish"; "Your app logic doesn't need to interact with" it); the **Power Apps client library for code apps** = npm package `@microsoft/power-apps` (sometimes called the "Power Apps SDK"), which has APIs the app calls and "manages models and services as connections are added and removed"; the **Power Apps CLI**, whose `pa app push` "takes a compiled app and publishes it in a Power Platform environment." — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture)

**Architecture (runtime):** three logical parts — your code; the client library (exposes APIs and the generated models/services that perform data requests "through Power Platform connectors"); the **Power Apps host**, which "manages end-user authentication, app loading, and presenting contextual messages to the user if an app fails to load." — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture). The `getContext` function "communicates with the web player to obtain context data." — [Get context data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context)
- Diagrams: `media/app-development-architecture.png` and `media/app-development-runtime.png` (see §11). — [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture)

**How it differs from canvas / model-driven apps (what the docs actually say):** the docs never give a side-by-side comparison. They state code apps follow canvas app sharing limits; Azure B2B guest access works "similar to canvas apps"; `getContext` properties "align with session details available in canvas apps." — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview); [Get context data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context)

**GA / preview timeline (official sources):**
- **5 Feb 2026** — Microsoft Power Platform blog "Generally available: host and run code apps in Power Apps" (author Jordan Chodak): "code apps in Power Apps are now generally available"; mentions frameworks such as React and Vue, 1,400+ connectors, Managed Host, Entra auth, connector consent, DLP at runtime, Conditional Access, health monitoring via Monitor, lifecycle tools. The post gives no licensing, preview-feature, CLI, mobile or Teams details. — [Microsoft blog](https://www.microsoft.com/en-us/power-platform/blog/power-apps/generally-available-host-and-run-code-apps-in-power-apps/) (year inferred from the page's image path; also announced in [What's new in Power Platform: February 2026](https://microsoft.com/en-us/power-platform/blog/power-apps/whats-new-in-power-platform-february-2026-feature-update), not opened)
- **Client library v1.0** — "As code apps approach general availability" Microsoft released `@microsoft/power-apps` 1.0 with breaking changes from 0.3.21 (see §6). — [Migrate to v1.0](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/migrate-to-v1) (5 Mar 2026)
- **From client library v1.0.4** the library shipped "an npm-based CLI for code apps" that "will replace the Power Platform CLI's `pac code` commands, which will be deprecated in a future release" (pre-Aug 2026 wording, now removed from the Learn section but still on the pac reference page). — [old overview, before 18 Aug 2026](https://github.com/MicrosoftDocs/powerapps-docs/blob/ffaf30afcf66db49243e8541e24f3502fa276a67/powerapps-docs/developer/code-apps/overview.md); [pac code reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/code)
- **18 Aug 2026** — docs rewritten "for the pa cli GA"; npm package `@microsoft/power-apps-cli` reached 1.0.0 on 19 Aug 2026. — [docs commit](https://github.com/MicrosoftDocs/powerapps-docs/commit/68ec0bdb4e841612073c791871d6ab0c71d7b16f); [npm registry @microsoft/power-apps-cli](https://registry.npmjs.org/@microsoft/power-apps-cli)
- **The old `pac code` command group** is still documented on the Power Platform CLI reference, headed "(Preview) Commands to manage your code apps. For the latest features and improvements, use the npm-based Power Apps CLI instead" (page ms.date 25 Oct 2026). — [pac code reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/code)
- Features still labelled preview in the current pages: Dataverse "Image and file upload and download (preview)" — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse); the GitHub Copilot plugin is named `code-apps-preview` — [Copilot quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/quickstart-github-copilot).
- Other dated changes found in the repo history: 29 May 2026 the limitation "Code apps aren't supported in the Power Apps mobile app or Power Apps for Windows" was cut to "…aren't supported in Power Apps for Windows" (mobile limitation removed); 7 May 2026 a limitation "Service Principals (SPN) cannot create or become owners of code apps" was added and on 7 Jul 2026 removed; 4 Sep 2026 "Update limitations section" (Secure Implicit Connections line now present); 23 Sep 2026 licensing widened (see §2); 11 Nov 2026 request-access customisation documented. — [commit history of the folder](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps)

### Inferences
- Any third-party tutorial, video or AI answer older than mid-Aug 2026 will describe `pac code` and is out of date for the commands, though the concepts (power.config.json, generated services, push, play URL) carry over.
- The Learn section is effectively the release notes: the "What's new?" TOC group plus page dates are the only official change signal; the docs repo commit log is the only fine-grained history.

### Gaps
- No official comparison table of code apps vs canvas vs model-driven exists in this section.
- The exact GA date of the `pa` CLI is not stated on any Learn page; the 18–19 Aug 2026 date is inferred from the docs commit title and the npm 1.0.0 release date.

---

## 2. Prerequisites and system requirements (licences, Node, CLI, VS Code, the environment switch, Managed Environments)

### Takeaway
Developers need Node.js (LTS — and the CLI package itself requires Node 22 or newer), Git, an IDE and the npm-installed Power Apps CLI; no .NET / `pac` / VS Code extension is required any more. An admin must switch on **Enable code apps** per environment in the Power Platform admin center. Every end user needs Power Apps Premium (or pay-as-you-go, an App Pass, or auto-claim). The docs do not state that a Managed Environment is required.

### Cited Findings
- "Code apps require an IDE, Node.js, npm, Git, and the Power Apps CLI." Tools listed: an IDE (e.g. Visual Studio Code), Node.js (LTS version), Git, Power Apps CLI. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Superseded (pre-18 Aug 2026) prerequisite wording: "Visual Studio Code, git, dotnet, node.js, and npm" plus the Power Platform CLI. — [old overview](https://github.com/MicrosoftDocs/powerapps-docs/blob/ffaf30afcf66db49243e8541e24f3502fa276a67/powerapps-docs/developer/code-apps/overview.md)
- The `@microsoft/power-apps-cli` package (latest 1.4.2, published 17 Nov 2026) declares `"engines": {"node": ">=22"}` and installs the `pa` command (`bin: {"pa": "dist/Bin.js"}`); its dependencies are `open`, `@napi-rs/keyring`, `@azure/msal-node-runtime`. — [npm registry](https://registry.npmjs.org/@microsoft/power-apps-cli)
- The Zscaler troubleshooting page also requires "Node.js version is greater or equal to v22." — [Zscaler issues](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/troubleshoot-zscaler-issues). (The older Azure SQL page's troubleshooting still says "Should be LTS version (18.x or 20.x)" — a stale line. — [Connect to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql))
- The Azure SQL walkthrough lists VS Code, "Power Platform Tools for VS Code" and the SQL Server (mssql) VS Code extension as prerequisites — for that walkthrough only. — [Connect to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql)

**Enable code apps — exact click path (Overview):**
1. "As an admin, go to [Power Platform admin center](https://admin.powerplatform.microsoft.com)."
2. "Go to **Manage** > **Environments** > select the environment where you use code apps."
3. "Go to **Settings** > Expand the **Product** subsection > Select **Features**." (screenshot `enable-settings-products-features.png`)
4. "Go to the feature **Power Apps code apps** and use the **Enable code apps** toggle to turn it on." (screenshot `enable-code-apps.png`)
5. "Select **Save** in the settings experience."
- Who can set it: "Power Platform admins and environment admins"; "The environment setting respects groups and rules set by Power Platform admins"; can be set for many environments at once via environment groups and rules. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)

**End-user licensing (current, since 23 Sep 2026):** end users need one of: Power Apps Premium licence; pay-as-you-go enabled; an App Pass; or auto-claim enabled ("automatically assigns a premium license to the user if one is available in the tenant"). — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview). Before 23 Sep 2026 the page listed only Power Apps Premium. — [old overview](https://github.com/MicrosoftDocs/powerapps-docs/blob/ffaf30afcf66db49243e8541e24f3502fa276a67/powerapps-docs/developer/code-apps/overview.md); [commit "Update licensing information for code apps (#12652)"](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps)
- Flows called from a code app: end users "need sufficient Dataverse permissions to invoke the flow. Assign the App Opener security role or an equivalent role." — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)
- Configuring CSP requires being "an administrator of the environment." — [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
- Adding an app to a solution needs "a Power Platform environment with Dataverse. In environments without Dataverse, the app publishes without a solution." — [ALM](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)

### Inferences
- The owner's premium M365 test tenant must still have a Power Platform environment with Dataverse and the code-apps toggle on; the government tenant's admins must do the same toggle themselves — it is an admin-only setting.
- Node 22+ matters: a developer PC on Node 20 LTS will not run the `pa` CLI.

### Gaps
- No page says whether a Managed Environment is required to run code apps. Several listed governance features (sharing limits, Conditional Access on an individual app, app quarantine) are Managed Environment features in general Power Platform docs, but the code-apps pages do not state a requirement.
- No minimum `pa` CLI version is stated anywhere except "latest"; per-feature minimums exist only for the client library (`@microsoft/power-apps` 1.1.1+ for flows and Dataverse actions/functions).
- No VS Code extension is required by the current docs; none is documented for the `pa` CLI.

---

## 3. Creating a code app: the quickstart, every command, the packages, the generated files and the ports (and the "existing Vite app" path)

### Takeaway
Current official flow: `npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app` → `npm install --global @microsoft/power-apps-cli` (+ `@microsoft/power-apps`) → `npm install` → `pa app init` → `pa app run` (open the **Local Play** URL) → `npm run build` → `pa app push`. The template wires the Vite plugin `@microsoft/power-apps-vite`. There is no official page for converting an existing Vite app; the template's two Power-Apps-specific pieces (the client library dependency and the Vite plugin) plus `pa app init` are what an existing app would need.

### Cited Findings
**Quickstart (current, 13 Aug 2026)** — [Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch):
- Prerequisites: environment with code apps enabled; Node.js LTS; Git.
- Step 1: `npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app` then `cd my-app`.
- Step 2: 
  ```bash
  npm install --global @microsoft/power-apps-cli
  npm install --global @microsoft/power-apps
  npm install
  ```
  then `pa app init` (interactive) or `pa app init --display-name "App From Scratch" --environment-id <environment-id>`. "When you run `pa app init`, the CLI prompts you to sign in if you're not already authenticated."
- Step 3: `pa app run`; "Open the URL labeled **Local Play**." IMPORTANT: "Open the URL in the same browser profile that you use for your Power Platform tenant." NOTE on local network access: "Chrome and Microsoft Edge block requests from public origins to local endpoints by default"; you may need to grant browser permission or configure enterprise policies; for embedded scenarios include `allow="local-network-access"` in iframe tags. (Pre-Aug wording dated this "Since December 2025".)
- Step 4: `npm run build` then `pa app push`; "When the command finishes successfully, it returns a Power Apps URL where you can run the app." You can also go to make.powerapps.com "to play, share, or view details for the app."

**`pa app init` options** — `--display-name`, `--environment-id`, `--description`, `--build-path`, `--file-entry-point`, `--app-type` (`CodeApp` | `MobileApp`), `--app-url`, `--cloud`. — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Defaults (via environment-variable reference): build path default `./dist`; file entry point default `index.html`; app type default `CodeApp` ("saved in `power.config.json` and used as the app type when the app is published"); app URL default `http://localhost:3000`, "saved as `localAppUrl` in `power.config.json` and becomes the default URL for future `pa app run` commands"; cloud values `public` (default), `usgov`, `usgovhigh`, `usgovdod`, `china`. — [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)

**Ports:** `pa app run [--port <port>] [--local-app-url <url>]`; the Power Apps local host port defaults to **8080** (`PA_CLI_PORT`); the locally running app's URL defaults to **`http://localhost:3000`** (`localAppUrl` / `PA_CLI_LOCAL_APP_URL`, which overrides for one command without changing the saved config). — [CLI environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli). The Azure SQL page's troubleshooting covers "EADDRINUSE: address already in use :::3000". — [Connect to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql)
- Several pages still say `npm run dev` to run locally (Connect to data, Add flows). — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data); [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)

**Packages (npm registry, read 19 Nov 2026):**
| Package | Role | Latest | Notes |
|---|---|---|---|
| `@microsoft/power-apps` | client library ("Power Apps SDK") | 1.6.0 (4 Nov 2026) | other tags: `beta` 0.3.12, `dev` 0.5.2; recent: 1.3.0 (19 Aug), 1.4.0 (16 Sep), 1.5.0 (29 Sep 2026); exports `./app`, `./data`, `./telemetry`, `./data/executors`, `./data/metadata/dataverse`, internal paths |
| `@microsoft/power-apps-cli` | the `pa` CLI | 1.4.2 (17 Nov 2026) | first published 7 Jan 2026 as 0.5.3; 1.0.0 on 19 Aug 2026; Node >=22 |
| `@microsoft/power-apps-vite` | Vite plugin | 1.0.13 (2 Sep 2026) | first 1.0.2 (5 Feb 2026); peer `vite >=5.0.0`; exports `.` and `./plugin` |
— [npm @microsoft/power-apps](https://registry.npmjs.org/@microsoft/power-apps); [npm @microsoft/power-apps-cli](https://registry.npmjs.org/@microsoft/power-apps-cli); [npm @microsoft/power-apps-vite](https://registry.npmjs.org/@microsoft/power-apps-vite). Licence field on all three: "See license in LICENSE file" (no public source repo listed).

**The Vite template's wiring** (`templates/vite`, Microsoft's GitHub repo): `package.json` scripts `"dev": "vite"`, `"build": "tsc -b && vite build"`; dependencies `@microsoft/power-apps ^1.2.5`, `react ^19.2.0`, `react-dom ^19.2.0`; devDependencies include `@microsoft/power-apps-vite ^1.0.2`, `vite ^7.2.4`, `@vitejs/plugin-react ^5.1.1`, `typescript ~5.9.3`. `vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"
export default defineConfig({ plugins: [react(), powerApps()] });
```
— [templates/vite/package.json](https://github.com/microsoft/PowerAppsCodeApps/blob/main/templates/vite/package.json); [templates/vite/vite.config.ts](https://github.com/microsoft/PowerAppsCodeApps/blob/main/templates/vite/vite.config.ts)
- The Vite plugin `@microsoft/power-apps-vite` is not mentioned on any Learn page. — (all 31 pages read)

**Generated / touched files (documented):**
- `power.config.json` — written by `pa app init`; documented fields scattered across pages: `environmentId`, `region` (should be `prod` "unless you want to target another region. Add it if it's missing") — [Troubleshoot adding a data source](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/troubleshoot-add-datasource); `localAppUrl`, app type — [CLI env vars](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables); `appSettings` (`showHeader`, `customizeRequestAccess.{enabled,title,messageBody}`) — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration); data sources, flows and their connection references, `@envvar:` references — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows); [Use environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-environment-variables).
- Generated code: `src/generated/models/<Name>Model.ts` and `src/generated/services/<Name>Service.ts` (e.g. `Office365UsersModel.ts`, `Office365UsersService.ts`; `AccountsModel.ts`, `AccountsService.ts`). — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data); [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- Dataverse action/function files: `<schemaPath>/dataverse/<ApiName>.Schema.json`, `<schemaPath>/dataverse/<TableName>.Schema.json`, `<schemaPath>/appschemas/dataSourcesInfo.ts`, `power.config.json`, `<codeGenPath>/generated/models/<TableName>Model.ts`, `<codeGenPath>/generated/services/<ApiName>Service.ts`. — [Add a Dataverse action or function](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function)
- Flow files: `src/services/<Flow>Service.ts`, `src/models/<Flow>Model.ts`, `schemas/logicflows/<Flow>.Schema.json`. — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)
- CLI user settings: `userSettings.json` in `%USERPROFILE%\.powerapps-cli\` (Windows) or `$HOME/.powerapps-cli/` (Linux/Mac). — [Telemetry](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/telemetry)

**Sign-in commands:** `pa auth login [--account user@contoso.com]` (always opens the system browser; the `--account` value only pre-fills), `pa auth status [--json]`, `pa auth switch [--account …]`, `pa auth logout` (signs out of *all* accounts). — [Sign in and manage accounts](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/sign-in-manage-accounts)

**GitHub Copilot quickstart (alternative path, 24 Jun 2026):** in the `copilot` CLI: `/plugin marketplace add microsoft/power-platform-skills`, `/plugin install code-apps-preview@power-platform-skills`, restart, `/code-apps-preview:create-app`, describe the app incl. environment ID; the agent runs the code apps CLI to scaffold, init, add connectors, build and deploy. The plugin "also works with Claude Code and other coding agents through Open Plugins." — [Copilot quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/quickstart-github-copilot)

### Inferences
- For an existing React + TypeScript + Vite app the minimum, by analogy with the official template (not an official procedure): add `@microsoft/power-apps` as a dependency and `@microsoft/power-apps-vite` as a dev dependency, add `powerApps()` to the Vite plugins, run `pa app init` at the project root (pointing `--build-path` at the Vite output, default `./dist`, and `--file-entry-point` at `index.html`), then `pa app run` / `npm run build` / `pa app push`. Because `localAppUrl` defaults to `http://localhost:3000` while Vite's own default port is 5173, either the plugin sets the port or `--app-url` must match the dev server — check before relying on it.
- The quickstart's `npm install --global @microsoft/power-apps` (global install of the client library) is unusual; the template already lists it as a project dependency.

### Gaps
- No complete schema of `power.config.json` is published on Learn; fields above are pieced together from several pages.
- No official "add code-apps support to an existing Vite app" page exists in the current section (none found in the 18 Aug rewrite either). What the Vite plugin does is undocumented.
- Whether `--app-type MobileApp` produces something different at publish time is not explained beyond the env-var table.

---

## 4. Local development, publishing, versions, sharing, the play URL, and how end users open the app

### Takeaway
Local play runs your dev server plus a Power Apps local host and opens a "Local Play" URL in the browser under your real tenant sign-in, with real connections. `pa app push` uploads the compiled `dist` as a new version and prints the Power Apps play URL; sharing is via make.powerapps.com or `pa app share`. End users open `https://apps.powerapps.com/play/e/{environment-id}/a/{app-id}` in a browser; the Power Apps mobile app is no longer listed as unsupported (since 29 May 2026); Power Apps for Windows is unsupported; Teams is not mentioned at all.

### Cited Findings
- `pa app run` "Starts the Power Apps local host for the code app"; open the **Local Play** URL "in the same browser profile that you use for your Power Platform tenant." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli); [Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- Local play shows the real connector consent dialog (screenshot `sql-consent.png`, "Consent dialog requesting permissions for the app"; `sql-testapp.png`, "Client library for code apps console with app URL and status"). — [Connect to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql)
- `pa app push [--solution-id <solution-id>] [--non-interactive]` "Publishes a new version of the code app to Power Apps"; it "validates app settings in `power.config.json` … before publishing." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Compiled assets are hosted "on a publicly accessible endpoint. This endpoint doesn't currently support IP-based access restrictions"; use Conditional Access to control by location/IP; "Don't store sensitive user or organizational data in the app. Store this kind of data in a data source so the content is retrieved after end-users … go through authentication and authorization checks." — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration)
- The hosted origin seen in a CSP error: `https://<environment>.powerplatformusercontent.com/`. — [Embed in an iframe](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe)
- Play URLs: `https://apps.powerapps.com/play/e/{environment-id}/a/{app-id}`; add `?hideNavBar=true` (or `&hideNavBar=true`) to hide the header — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration). The iframe page gives `https://apps.powerapps.com/play/e/{environmentId}/app/{appId}?tenantid={tenantId}` (`tenantid` optional, "to support guest access") and its sample `<iframe src>` omits the `/app/` segment — the three forms are inconsistent across pages. — [Embed in an iframe](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe)
- Sharing: `pa app share --principal <principal> [--access play|edit]` — comma-separated emails or Entra object IDs; `play` default; the app "must already be published and have an app ID from a successful `pa app push`." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli). Or open make.powerapps.com "to play, share, or view details." — [Quickstart](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- `pa app list` "Lists code apps in the current environment." — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Header bar: hidden for all users by `pa app set-setting --show-header false` then `pa app push`; or per-URL via `hideNavBar=true`. Request-access text: `pa app set-setting --customize-request-access true --request-access-title "…" --request-access-message "…"` then `pa app push` (title ≤100 chars, message ≤1,000 chars; "Custom text doesn't grant access"). — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration)
- Embedded apps: "Only Power Apps users within the same tenant can access an embedded code app"; iframe needs `frame-ancestors` CSP widened; `allow="geolocation; microphone; camera; fullscreen; clipboard-write"` if those APIs are used. — [Embed in an iframe](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe)
- Power BI: can be embedded in Power BI reports with the Power Apps Visual, but PowerBIIntegration isn't supported. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Mobile: the limitation "Code apps aren't supported in the Power Apps mobile app or Power Apps for Windows" became "…aren't supported in Power Apps for Windows" on 29 May 2026. — [commit "Removed mobile limitation"](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps); current [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- Versions/rollback: the docs say only that push "Publishes a new version"; no page covers version history or restoring an earlier version. — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)

### Inferences
- Because local play signs in through the real tenant and real connections, development against the owner's test tenant exercises real Entra sign-in, consent and DLP; the browser profile must be signed in to that tenant (a second profile for the government tenant later).
- The "local network access" browser block may be enforced by enterprise policy in a locked-down government tenant, which could stop local play there; the test tenant is the safer place to develop.

### Gaps
- No page states positively that the Power Apps mobile app runs code apps (only that the limitation was removed), and nothing at all is said about Microsoft Teams.
- No page documents version history, rollback, or app deletion for code apps.
- No offline support is mentioned anywhere (neither supported nor unsupported).

---

## 5. Every documented limitation and "not supported" list

### Takeaway
Limitations are spread over six pages. The ones most relevant to a restricted government tenant: assets served from a public endpoint with no IP restriction; no Secure Implicit Connections; no Power Platform Git integration; no Power Apps for Windows; Dataverse lacks polymorphic lookups, FetchXML, alternate keys and metadata CRUD; Excel Online connectors unsupported; flows must be solution-aware instant flows with the Power Apps trigger; strict default CSP.

### Cited Findings
**Overview → Limitations (23 Sep 2026)** — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview):
- No Storage SAS IP restriction; "SAS IP Binding and Firewall environment setting doesn't apply"; public asset endpoint without IP restrictions; use Conditional Access – block by location.
- "Code apps don't yet support Secure Implicit Connections."
- "Code apps don't support Power Platform Git integration."
- "Code apps aren't supported in Power Apps for Windows."
- No Power BI data integration (PowerBIIntegration function); embedding in Power BI via Power Apps Visual is possible.
- "Code apps don't support SharePoint forms integration."

**Overview → managed platform capabilities that DO work:** connector consent dialog; sharing limits (canvas limits); app quarantine; DLP enforcement at app launch; Conditional Access on an individual app; admin consent dialog suppression (Microsoft and custom OAuth connectors); tenant isolation; Azure B2B external users; health metrics in admin center and maker portal. — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)

**Connectors** — "All connectors are officially supported except": Excel Online (Business), Excel Online (OneDrive). — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)

**Dataverse** — supported: add tables; formatted values (labels) for option sets; table metadata; lookups (via single-valued navigation property / associate-on-create guidance, "A dedicated how-to guide is coming soon"); image and file upload/download (preview); Create/Retrieve/RetrieveMultiple/Update/Delete; delegation for Filter, Sort, Top; paging. Unsupported: "Polymorphic lookups; Schema definition (entity metadata) CRUD; FetchXML support; Alternate key support." — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- `pa app add data-source` accepts only one native Dataverse table per command. — [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)

**SharePoint** — CRUD on lists and choice/lookup/person values supported; "don't support Document Processing APIs or actions like item synchronization or permission changes" (write a custom service file). — [SharePoint operations](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/sharepoint-operations)

**Power Automate flows** — "Code apps support only solution-aware instant flows that use the Power Apps trigger. Scheduled flows, automated flows, and instant flows that use other triggers aren't supported"; needs `@microsoft/power-apps` 1.1.1+; maker needs access to the flow and its connections; end users need Dataverse permissions (App Opener role or equivalent); re-run `pa app add flow` after a flow changes. — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)

**ALM** — a solution must be given by ID (GUID), "Solution names aren't accepted"; no source code (Git) integration. — [ALM](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)

**Embedding** — same-tenant users only. — [Embed in an iframe](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/embed-iframe)

**Copilot Studio** — `ExecuteCopilot` returns only a conversation ID; `ExecuteCopilotAsync` "Might return 502"; use `ExecuteCopilotAsyncV2`. — [Connect to Copilot Studio](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio)

**Environment variables (conflicting statements):** the App Insights page (5 Mar 2026) says "Environment variables aren't yet supported for code apps" and suggests a Dataverse settings table or `getContext()`; the newer page (13 Aug 2026) documents `@envvar:<schemaName>` references for data-source dataset/table values, and the CLI has `pa app list-environment-variables`. — [Set up App Insights](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights); [Use environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-environment-variables); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)

**Removed limitations (historical):** Power Apps mobile app (removed 29 May 2026); "Service Principals (SPN) cannot create or become owners of code apps" (added 7 May, removed 7 Jul 2026). — [folder commit history](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps)

### Inferences
- For the owner's app (saving through one storage "doorway"), the main code-apps-specific constraints are Dataverse ones: no FetchXML (use OData `filter`/`orderBy`/`top`/`select` via `getAll`), no alternate keys (rows must be found by GUID primary key or filter), and no polymorphic lookups (e.g. Customer/Owner-type lookups to several tables).
- "Native Dataverse doesn't use a connection ID, connection reference, or dataset" ([CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)), so a Dataverse-only code app needs no connector at all — relevant to a tenant that allows no outside connectors.

### Gaps
- Offline use, service workers/PWA, and file-size or bundle-size limits for pushed apps are not documented anywhere in the section.
- No list of request limits / throttling specific to code apps (the page called "system-limits-configuration" no longer contains limits, only configuration).

---

## 6. Content security policy, app-level settings, telemetry and monitoring, context (`getContext`), client-library API changes

### Takeaway
CSP is enforced by default per environment with a strict policy (`connect-src 'none'`, `worker-src 'none'`, `font-src 'self'`, `frame-ancestors 'self' https://*.powerapps.com`); admins add sources in Power Platform admin center → Environments → Settings → Product → Privacy + Security → Content security policy → **App** tab, or by REST. Monitoring = Power Platform Monitor (health) plus your own tool via `setConfig({ logger: { logMetric } })`. `getContext()` from `@microsoft/power-apps/app` returns app, user (incl. Dataverse `systemUserId`) and host session data.

### Cited Findings
**CSP defaults** (`<platform>` = values the platform needs) — [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy):
| Directive | Default |
|---|---|
| frame-ancestors | `'self' https://*.powerapps.com` |
| script-src | `'self' <platform>` |
| img-src | `'self' data: <platform>` |
| style-src | `'self' 'unsafe-inline'` |
| font-src | `'self'` |
| connect-src | `'none'` |
| frame-src | `'self'` |
| form-action | `'none'` |
| base-uri | `'self'` |
| child-src | `'none'` |
| default-src | `'self'` |
| manifest-src | `'none'` |
| media-src | `'self' data:` |
| object-src | `'self' data:` |
| worker-src | `'none'` |
- "When you customize a directive, the values you supply are appended to the default value. If the default value is `'none'`, your custom values replace the default value." Set at environment level, applies to all code apps in it; can be set at scale via environment groups and rules. Prereq: environment administrator. — [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
- Admin center click path: sign in to Power Platform admin center → **Manage** → **Environments** → select environment → command bar **Settings** → expand **Product** → **Privacy + Security** → under **Content security policy** select the **App** tab. Controls: **Enable reporting** toggle + **Reporting endpoint**; **Enforce content security policy**; **Configure directives** (leave default toggled on; toggle off to add custom sources; toggled off with an empty source list disables the directive). Admin center route requires an environment with Dataverse; otherwise use REST. — [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
- REST: `https://api.powerplatform.com/environmentmanagement/environments/{environmentId}/settings` (api-version `2022-03-01-preview` in the samples); settings `PowerApps_CSPEnabledCodeApps`, `PowerApps_CSPReportingEndpoint`, `PowerApps_CSPConfigCodeApps` (stringified JSON `{"<directive>": {"sources": [{"source": "…"}]}}`); PowerShell helpers `Get-CodeAppContentSecurityPolicy` / `Set-CodeAppContentSecurityPolicy` given in full; token via `azureauth aad --resource "https://api.powerplatform.com/" --tenant $tenantId --client 9cee029c-6210-4654-90bb-17e6e9d36617 --output token` (that client ID is "the client id of the Power Platform CLI"); WARNING: updating directives replaces the whole collection. — [CSP](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/content-security-policy)
- "CSP changes can take several minutes to propagate." — [Set up App Insights](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights)

**App-level settings** (`appSettings` in `power.config.json`): `showHeader` (Boolean; omitted = shown); `customizeRequestAccess.enabled` (omitted = disabled), `.title` (≤100 chars, required when enabled), `.messageBody` (≤1,000 chars, required when enabled). Commands: `pa app set-setting …`, `pa app get-settings [--json]`, then `pa app push`. — [System configuration](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/system-limits-configuration); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)

**Monitoring:**
- Health metrics "available in both the Power Platform admin center and the maker portal." — [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- App Insights "only captures telemetry after the app successfully loads. Startup failures … only show up in Monitor." Steps: `npm install @microsoft/applicationinsights-web`; init `new ApplicationInsights({ config: { connectionString } })`; register `setConfig({ logger: { logMetric: (value: Metric) => … } })` from `@microsoft/power-apps/app` ("You should only call this function once"); `ILogger` from `@microsoft/power-apps/telemetry`; add the App Insights endpoints to CSP `connect-src`; query `customEvents`. Built-in metric types: `sessionLoadSummary` (`successfulAppLaunch`, `appLoadResult: 'optimal'|'other'`, `appLoadNonOptimalReason: 'interactionRequired'|'throttled'|'screenNavigatedAway'|'other'`, `timeToAppInteractive`) and `networkRequest` (`url`, `method`, `duration`, `statusCode`, `responseSize`); two sample KQL queries. Pattern "works for any monitoring tool." — [Set up App Insights](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/set-up-azure-app-insights)
- Browser DevTools filters: connectors `apihub.net`, Dataverse `dynamics.com`. — [Analyze data requests](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/analyze-data-request-response)
- CLI telemetry (about the developer tool, not the app): collects activity events, error events, scenario timing, non-PII environment context and tenant ID; `pa telemetry enable|disable|status`; `PA_CLI_TELEMETRY=0|false|no|off` disables per process; `userSettings.json` keys `enabled`, `consoleOnly`, `outputToConsole`; "Telemetry failures never block CLI operations." — [Telemetry](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/telemetry); [CLI env vars](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)

**Context (`getContext`)** — `import { getContext } from '@microsoft/power-apps/app'; const ctx = await getContext();`
- `ctx.app`: `appId`, `environmentId`, `queryParams` (Record<string,string>), `dataverseOrgUrl`, `appUrl`.
- `ctx.user`: `fullName`, `objectId` (Entra), `systemUserId` (optional; the user's Dataverse `systemuser` row ID, "can be omitted or empty when unavailable"), `tenantId`, `userPrincipalName`.
- `ctx.host`: `sessionId` ("changes every time the app is opened").
— [Get context data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context) (2 Oct 2026; `dataverseOrgUrl` added 10 Aug 2026 per [commit history](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps))

**Client library v1.0 breaking changes:** `initialize` removed — "Apps must no longer import or call `initialize`"; remove `isInitialized` flags; new `setConfig` from `@microsoft/power-apps/app` (logger option). — [Migrate to v1.0](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/migrate-to-v1)

### Inferences
- An existing app that uses Web Workers, loads web fonts from outside, calls any non-platform URL (`fetch` to its own API), or uses a web manifest will be blocked by the defaults (`worker-src 'none'`, `font-src 'self'`, `connect-src 'none'`, `manifest-src 'none'`) until an environment admin adds sources — in the government tenant that is an IT request.
- `ctx.user.systemUserId` gives the signed-in person's Dataverse user row directly, useful for "who am I" and ownership without an extra query.

### Gaps
- Exactly which hosts `<platform>` adds is not listed.
- Whether the client library's own Dataverse/connector calls are exempt from `connect-src 'none'` is implied (apps work by default) but not stated.

---

## 7. Data pages — shape only (Dataverse detail covered by another researcher)

### Takeaway
Data access is through generated TypeScript services per data source; connectors need a connection (created with `pa connection create` or in the maker portal); native Dataverse needs only `pa app add data-source --connector dataverse --table <logical-name>`.

### Cited Findings
- Connection flow: `pa connector list [--search] [--json]` → `pa connection create --connector <id> [--display-name] [--json]` (returns the connection ID) → `pa app add data-source --connector <id> --connection-id <id> [--dataset …] [--table … (repeatable)] [--procedure …] [--as table|action] [--connection-ref <logical-name> --solution-id <id>] [--org-url …]` → import from `./generated/services/…`. Also `pa connection list`, `list-datasets`, `list-tables`, `list-procedures`, `list-references`; `pa app refresh data-source --name`; `pa app remove data-source --connector --name [--force]`. — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data); [Create a connection](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-connection); [CLI reference](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/cli)
- Dataverse generated service methods: `create`, `get(id)`, `getAll(options?: IGetAllOptions)` (`maxPageSize`, `select`, `filter` (OData), `orderBy`, `top`, `skip`, `skipToken`), `update(id, changes)` ("only include the properties you're changing"), `delete(id)`, `getMetadata(options)`. "Always limit the number of columns you retrieve by using the `select` parameter." — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse); [Get table metadata](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/get-table-metadata)
- Dataverse actions/functions: `pa app find-dataverse-api --search <name> [--json]`, `pa app add dataverse-api --api-name <name>` (e.g. `WhoAmI`, `AddToQueue`); requires `@microsoft/power-apps` 1.1.1+. — [Add a Dataverse action or function](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-dataverse-action-function)
- Flows: `pa app list-flows [--search]`, `pa app add flow --flow-id <id>`, `pa app remove flow --flow-name|--flow-id [--force]`; generated `<Flow>Service.Run(...)` returns `{ success, data, error }`. — [Add flows](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows)
- Official sample for Dataverse: `samples/Dataverse` (CRUD, lookups, images/files, generated services; setup in `samples/Dataverse/DEVELOPMENT.md`). — [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- Other data pages: Azure SQL (full walkthrough incl. stored procedures), SharePoint (list CRUD, choices/lookups/persons), Copilot Studio (`shared_microsoftcopilotstudio`, `ExecuteCopilotAsyncV2`), Azure Functions + API Management + custom connector. — pages listed in §1.

### Inferences
- In a tenant that allows only Microsoft 365 connectors, native Dataverse plus (optionally) Microsoft connectors like Office 365 Users stay within policy; custom connectors (the Azure Functions page) would not.

### Gaps
- None needed here beyond the other researcher's scope.

---

## 8. ALM, solutions, CI/CD, service principals, environment variables

### Takeaway
`pa app push` places the app in a Dataverse solution (preferred solution on first push, or `--solution-id <GUID>`); solutions then move between environments by export/import or Power Platform Pipelines. CI/CD publishing uses a service principal (env vars `PA_CLI_USE_SP_AUTH=true`, `PA_CLI_SP_CLIENT_ID`, `PA_CLI_SP_CLIENT_SECRET`, `PA_CLI_SP_TENANT_ID`, then `pa app push --non-interactive`) after a maker has shared the app with it at `edit` level.

### Cited Findings
- First publish without `--solution-id`: (1) the environment's preferred solution (Dataverse uses Common Data Service Default Solution if none set); (2) else the all-components Default solution; (3) else no solution. Subsequent publishes without `--solution-id` don't change membership; with it, add to that solution. Invalid GUID / missing solution / no Dataverse → command stops. Find the ID from `https://make.powerapps.com/environments/<environment-id>/solutions/<solution-id>/overview` or `pa solution list`. Manual: Solutions → select → **Add existing** > **App** > **Code app**. CI: `PA_CLI_SOLUTION_ID=<solution-id> pa app push`. Deploy with Power Platform Pipelines (Dev → Test → Prod). — [ALM](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/alm)
- Connection references make data sources portable across environments: `pa connection list-references --solution-id <id>`; `pa app add data-source --connector <id> --connection-ref <logical-name> --solution-id <id>`. — [Connect to data](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data)
- Environment variables in data sources: `--dataset "@envvar:<schema>" --table "@envvar:<schema>"`, persisted in `power.config.json`. — [Use environment variables](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-environment-variables)
- Service principal: maker shares once (`pa auth login --account <maker-email>`, `pa app share --principal <enterprise-application-object-id> --access edit`) — use the **Enterprise applications** object ID, not the App registrations one (`az ad sp show --id <application-client-id> --query id --output tsv`); a service principal "can't grant itself access"; then in the pipeline set the four `PA_CLI_*` variables, `npm run build`, `pa app push --non-interactive`; exit code 0 = published. `CI=true` also selects SP auth "for compatibility". — [Service principal](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/use-service-principal); [CLI env vars](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- CLI option resolution order: command-line option → environment variable → default → interactive prompt. — [CLI env vars](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)
- Full `PA_CLI_*` list: auth (`ACCOUNT`, `SP_CLIENT_ID`, `SP_CLIENT_SECRET`, `SP_TENANT_ID`, `USE_SP_AUTH`); global (`CLOUD`, `ENVIRONMENT_ID`); init (`APP_BUILD_PATH`, `APP_DESCRIPTION`, `APP_DISPLAY_NAME`, `APP_FILE_ENTRY_POINT`, `APP_TYPE`, `APP_URL`); run (`LOCAL_APP_URL`, `PORT`); share (`SHARE_ACCESS`, `SHARE_PRINCIPAL`); data (`AS`, `CONNECTION_DISPLAY_NAME`, `CONNECTION_ID`, `CONNECTION_REF`, `CONNECTION_SEARCH`, `CONNECTOR`, `CONNECTOR_SEARCH`, `DATASET`, `DATA_SOURCE_NAME`, `ORG_URL`, `PROCEDURE`, `SOLUTION_ID`, `SOLUTION_SEARCH`, `TABLE`); APIs/flows (`DATAVERSE_API_NAME`, `DATAVERSE_API_SEARCH_TERM`, `FLOW_DATA_SOURCE_NAME`, `FLOW_ID`, `FLOW_SEARCH`, `REMOVE_FLOW_ID`); telemetry (`CONSOLE_ONLY`, `OUTPUT_TO_CONSOLE`, `TELEMETRY`); plus standard `NO_COLOR`. — [CLI env vars](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/reference/environment-variables)

### Inferences
- For the hand-over to the government tenant, the documented path is a managed solution containing the code app (and connection references / environment variables), imported by their IT — rather than re-pushing from source — but Microsoft does not describe a cross-tenant hand-over specifically.

### Gaps
- No page covers moving a code app between tenants (only between environments), nor managed vs unmanaged solution behaviour for code apps.

---

## 9. Samples and templates (github.com/microsoft/PowerAppsCodeApps)

### Takeaway
Two templates (`starter` recommended, `vite` minimal) and seven samples; the repo README says "Code apps are generally available" and the AI plugin has moved to microsoft/power-platform-skills. The templates README still shows the old `pac code init` command.

### Cited Findings
- Templates: `starter` — "**Recommended.** Pre-configured with React, Vite, Tailwind CSS, Tanstack Query, and React Router"; `vite` — "Minimal Vite + React setup, pre-configured for Code Apps." — [repo README](https://github.com/microsoft/PowerAppsCodeApps)
- Samples: `HelloWorld` (React, Vite, TS — "Best first read"); `FluentSample` (Fluent UI v9, SQL, Office 365 — connectors, custom API, SQL backend, CI/CD); `StaticAssetTracker` (Tailwind); `Dataverse` (native Dataverse CRUD, lookups, files, functions, actions); `DataverseConnector` (Dataverse through the Microsoft Dataverse connector); `DataverseContextRouting` (selects the initial page from `getContext()` query parameters); `tanstack-app` (TanStack Router). Also `/sessions/ppcc2025` (Power Platform Community Conference 2025 materials) and `/tests/e2e/*.spec.ts` Playwright tests for both templates. Licence MIT. — [repo README](https://github.com/microsoft/PowerAppsCodeApps)
- README quick start: `npx degit microsoft/PowerAppsCodeApps/templates/starter my-app`, `npm install`, `npm run dev`. — [repo README](https://github.com/microsoft/PowerAppsCodeApps)
- The AI assistant plugin "has moved to … microsoft/power-platform-skills." — [repo README](https://github.com/microsoft/PowerAppsCodeApps)
- `templates/README.md` still instructs `pac code init --environment [environmentId] --displayName [appDisplayName]` (legacy). — [templates README](https://github.com/microsoft/PowerAppsCodeApps/blob/main/templates/README.md)
- Issues: Microsoft directs feedback/guidance to the repo's Issues and bugs/support to the normal Microsoft Support channel ("SDK or CLI behavior that doesn't match the documentation" and "App behavior that regresses without making changes" → Microsoft Support). — [Feedback and support](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/feedback-support)

### Inferences
- The `vite` template is the closest match to the owner's existing React + TS + Vite stack; `DataverseContextRouting` shows deep-linking via `queryParams`.

### Gaps
- Issue labels were not catalogued. No `power.config.json` is committed in the samples (none found in the repo tree), so no official full example of the file is available there.

---

## 10. Release notes, what's new, FAQ, troubleshooting

### Takeaway
No FAQ or release-notes page; "What's new?" = request-access text (Nov 2026) and service-principal publishing (Aug 2026). Troubleshooting covers data-source adding failures and SSL-inspecting proxies (Zscaler) — the latter directly relevant to a government network.

### Cited Findings
- Troubleshoot adding a data source: symptoms `Fetch Failed`, `ETIMEDOUT`/`ENOTFOUND`/`ECONNRESET`, environment mismatch; check `power.config.json` `environmentId` and `region: "prod"`; `pa auth status`; corporate proxy/firewall must allow non-browser HTTPS to Power Platform endpoints ([connectivity requirements](https://learn.microsoft.com/en-us/power-platform/admin/online-requirements)); verify in a browser with the same account; Fiddler Classic capture (200 ok; 401/403 auth); reset with `pa auth logout` + `pa auth login`; escalation data: `pa --version`, OS/shell, full command, sanitized debug output, redacted `power.config.json`. — [Troubleshoot adding a data source](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/troubleshoot-add-datasource)
- Zscaler / SSL-inspecting proxy: symptoms `TypeError: fetch failed`, `Error: Request failed: {}`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `SELF_SIGNED CERT IN CHAIN`, works off-network; needs Node ≥22; fix = export the corporate root CA from `Cert:\CurrentUser\Root` to `%USERPROFILE%\.zscaler-root-ca.pem`, lock its permissions with `icacls`, set user env var `NODE_EXTRA_CA_CERTS` to it, reopen terminal; never use `NODE_TLS_REJECT_UNAUTHORIZED=0` except a one-off diagnostic. — [Zscaler issues](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/troubleshoot-zscaler-issues)
- Azure SQL page troubleshooting: port 3000 in use; npm install failures; runtime connection errors. — [Connect to Azure SQL](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-azure-sql)
- Copilot Studio troubleshooting: response casing (`conversationId` / `ConversationId` / `conversationID`), empty responses. — [Connect to Copilot Studio](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-copilot-studio)

### Inferences
- A government network almost certainly inspects TLS; the Zscaler page's `NODE_EXTRA_CA_CERTS` method applies to any corporate root CA, not only Zscaler.

### Gaps
- No official FAQ; no release notes for `@microsoft/power-apps` or `@microsoft/power-apps-cli` (the npm packages publish no changelog and no source repository).

---

## 11. Screenshots on Microsoft's pages (for a later step-by-step picture guide)

### Takeaway
Only four official screenshots show admin/maker-portal setup (two for the "Enable code apps" toggle, three for CSP in the admin center); the rest are CLI output, VS Code, Azure portal and DevTools pictures.

### Cited Findings
Learn image URLs follow `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/<source path>`; raw files are at `https://raw.githubusercontent.com/MicrosoftDocs/powerapps-docs/main/powerapps-docs/developer/code-apps/<path>`. — [docs repo media folders](https://github.com/MicrosoftDocs/powerapps-docs/tree/main/powerapps-docs/developer/code-apps)

| Page | Image path (relative to `/code-apps/`) | Alt text |
|---|---|---|
| Overview | `media/enable-settings-products-features.png` | Screenshot of the Product features settings in the Power Platform admin center. |
| Overview | `media/enable-code-apps.png` | Screenshot of the Power Apps code apps feature and Enable code apps toggle. |
| Architecture | `media/app-development-architecture.png` | Screenshot of the code app development architecture and component relationships. |
| Architecture | `media/app-development-runtime.png` | Screenshot of the code app runtime architecture and its three logical components. |
| Quickstart | `how-to/media/npm-run-dev-result.png` | A code app running locally in a browser |
| Connect to data | `how-to/media/pac-cli-connection-list.png` | Screenshot of Power Apps CLI output with connection IDs and connector identifiers. |
| CSP | `how-to/media/content-security-policy-settings-overview.png` | Image of the Code Apps CSP setting UO [sic] in the Power Platform admin center |
| CSP | `how-to/media/content-security-policy-reporting-setting.png` | Screenshot of a toggle labeled Enable reporting turned on and a text box labeled Reporting endpoint containing a url. |
| CSP | `how-to/media/content-security-policy-directive-settings.png` | Screenshot of CSP directives configured in different states |
| App Insights | `media/errors-only.png` | How to set the console to errors only |
| App Insights | `media/csp-violation.png` | See the expected CSP violations |
| App Insights | `media/csp-sources.png` | Example CSP sources |
| Analyze requests | `how-to/media/code-app_browser-dev-tools-data-requests.png` | Image shows using the apihub.net string to filter requests for connectors using dev tools with the Edge browser |
| Azure SQL | `how-to/media/sql-addconnection.png`, `sql-signin.png`, `sql-connect.png`, `sql-newquery.png`, `sql-connectionlist.png`, `sql-testapp.png`, `sql-consent.png`, `sql-datagrid.png`, `sql-pushed.png` | Add Connection in VS Code SQL Server extension; Microsoft Entra sign in prompt for SQL connection; Connected to Azure SQL database in VS Code; New Query command…; Power Platform connections list showing SQL connection; Client library for code apps console with app URL and status; Consent dialog requesting permissions for the app; Projects data grid…; App published to Power Apps with Open app link |
| Azure Functions | `how-to/media/custom-connector-create-azure-function.png`, `custom-connector-create-getassets.png`, `custom-connector-apim-create-api.png`, `custom-connector-apim-import-api.png`, `custom-connector-apim-security-subscription.png`, `custom-connector-apim-create-connector.png`, `custom-connector-test-connector.png` | Create Function in Azure; Create HTTP trigger; Add API; Import API; Update security settings; Create custom connector; Test custom connector |
— alt texts and paths from the page sources in [the docs repo](https://github.com/MicrosoftDocs/powerapps-docs/tree/main/powerapps-docs/developer/code-apps)
- Images present in the media folders but not used by any current page (likely from removed pre-`pa` steps): `media/csp-settings.png`, `how-to/media/powerapps-connection-apiname-connectionid.png`, `powerapps-create-connection.png`, `powerapps-create-office-connection.png`, `sql-createconnection.png`, `sql-localhost.png`, `sql-vite-running-powerapps.png`. — [repo tree](https://github.com/MicrosoftDocs/powerapps-docs/tree/main/powerapps-docs/developer/code-apps)

### Inferences
- Pictures for sharing an app in make.powerapps.com, the play page, the consent dialog in the live player, and the Solutions → Add existing → Code app path do not exist officially and would need to be captured in the owner's test tenant.

### Gaps
- The screenshots' capture dates are unknown; admin-center UI may have moved since.

---

## 12. Superseded material: the old `pac code` path (keep only for reading older guides)

### Takeaway
Before Aug 2026 the official flow was `pac auth create` → `pac env select --environment <id>` → `npm install` → `pac code init --displayname "…"` → `npm run dev` → `npm run build | pac code push`. These commands still exist under the Power Platform CLI (marked Preview, to be deprecated) but the Learn section no longer uses them.

### Cited Findings
- Old quickstart: `npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-app`; `pac auth create`; `pac env select --environment < Your environment ID >`; `npm install`; `pac code init --displayname "App From Scratch"`; `npm run dev` (open **Local Play**); `npm run build | pac code push` (build script `"tsc -b && vite build"`). — [old Quickstart, pre-18 Aug 2026](https://github.com/MicrosoftDocs/powerapps-docs/blob/ffaf30afcf66db49243e8541e24f3502fa276a67/powerapps-docs/developer/code-apps/how-to/create-an-app-from-scratch.md)
- `pac code` subcommands (still documented, "(Preview)"): `add-data-source` (`--apiId/-a`, `--connectionId/-c`, `--connectionRef/-cr`, `--dataset/-d`, `--environment/-env`, `--logLevel/-l`, `--solutionId/-s`, `--storedProcedure/-sp`, `--table/-t`), `delete-data-source`, `init` (`--displayName/-n` required; `--appUrl`, `--buildPath`, `--description`, `--environment`, `--fileEntryPoint`, `--logoPath`, `--region`), `list`, `list-connection-references`, `list-datasets`, `list-sql-stored-procedures`, `list-tables`, `push` (`--environment`, `--solutionName/-s`), `run` (`--appUrl`, `--port`). — [pac code reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/code) (ms.date 25 Oct 2026)
- Between Jan and Aug 2026 an interim npm CLI was invoked as `npx power-apps …` (e.g. a `create-connection` verb documented 3 Jun 2026; "npx" prefixes removed 4 Jun 2026). — [folder commit history](https://github.com/MicrosoftDocs/powerapps-docs/commits/main/powerapps-docs/developer/code-apps)

### Inferences
- Note the parameter differences when translating old guides: `pac code push --solutionName` (name) vs `pa app push --solution-id` (GUID only); `pac code init --logoPath` has no documented `pa` equivalent.

### Gaps
- Microsoft has not published a deprecation date for `pac code`.
