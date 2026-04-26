# Lab 06: Agent Plugins in VS Code - Bundle and Share AI Customizations

> **Mode:** VS Code (Agent Mode)  
> **Duration:** ~50 min  
> **Prerequisite:** [Lab 04 - Build an MCP Server](04-mcp-builder.md) and [Lab 05 - Exercise the MCP Server](05-mcp-data.md) (Labs 00-05 completed, app running)

## Table of Contents

*   [Overview](#overview)
    *   [What Plugins Can Bundle](#what-plugins-can-bundle)
    *   [What You Will Learn](#what-you-will-learn)
    *   [Prerequisites](#prerequisites)
*   [Part 1 – Build and Package a QA Plugin](#part-1---build-and-package-a-qa-plugin-44-min)
    *   [Exercise 1.1 – Enable Agent Plugins and Explore the Marketplace](#exercise-11---enable-agent-plugins-and-explore-the-marketplace)
    *   [Exercise 1.2 – Add the Test Runner Skill](#exercise-12---add-the-test-runner-skill)
    *   [Exercise 1.3 – Add the QA Reviewer Agent](#exercise-13---add-the-qa-reviewer-agent)
    *   [Exercise 1.4 – Add the Post-Test Logger Hook](#exercise-14---add-the-post-test-logger-hook)
    *   [Exercise 1.5 – Add the Book Database MCP Server](#exercise-15---add-the-book-database-mcp-server)
    *   [Exercise 1.6 – Install and Test the Plugin Locally](#exercise-16---install-and-test-the-plugin-locally)
    *   [Exercise 1.7 – Manage Plugin Installation](#exercise-17---manage-plugin-installation)
    *   [Exercise 1.8 – Review How All Layers Work Together](#exercise-18---review-how-all-layers-work-together)
*   [Part 2 – Configure Plugin Marketplaces](#part-2---configure-plugin-marketplaces-5-min)

## Overview

Agent plugins are **prepackaged bundles** of chat customizations that you can discover and install from plugin marketplaces. A single plugin can include any combination of [custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions), [agent skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills), [custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents), [hooks](https://code.visualstudio.com/docs/copilot/customization/hooks), and [MCP servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

In previous labs you created these customizations by hand inside `.github/`. Plugins solve the **distribution** problem: how do you share those customizations with teammates, across projects, or with the community? Instead of copying files manually, you package them into a plugin with a `plugin.json` manifest, and anyone can install them with one click.


### What Plugins Can Bundle

| Customization Type | Local location | Plugin reference |
| --- | --- | --- |
| **Skills** | `.github/skills/bookfaves-test-runner/` | `bookfaves-test-runner` |
| **Hooks** | `.github/hooks/bookfaves-post-test-logger.json` | `bookfaves-post-test-logger` |
| **MCP Servers** | `.vscode/mcp.json` | `book-database` |

### What You Will Learn

| Part | Topic | Description |
| --- | --- | --- |
| Pre | [Prerequisites](#prerequisites) | VS Code, Copilot subscription, Labs 00-03 completed, app running |
| 1.1 | [Enable Plugins & Explore](#exercise-11---enable-agent-plugins-and-explore-the-marketplace) | Enable agent plugins and browse marketplace |
| 1.2 | [Add Test Runner Skill](#exercise-12---add-the-test-runner-skill) | Create `bookfaves-test-runner` skill in `.github/skills/` |
| 1.3 | [Add QA Reviewer Agent](#exercise-13---add-the-qa-reviewer-agent) | Create `bookfaves-qa-reviewer` agent in `.github/agents/` |
| 1.4 | [Add Post-Test Hook](#exercise-14---add-the-post-test-logger-hook) | Create `bookfaves-post-test-logger` hook in `.github/hooks/` |
| 1.5 | [Add Book Database MCP](#exercise-15---add-the-book-database-mcp-server) | Configure `book-database` MCP server in `.vscode/mcp.json` |
| 1.6 | [Install & Test](#exercise-16---install-and-test-the-plugin-locally) | Install plugin locally and verify all components |
| 1.7 | [Manage Plugin](#exercise-17---manage-plugin-installation) | Toggle plugin on/off for debugging |
| 1.8 | [Review Layers](#exercise-18---review-how-all-layers-work-together) | Observe full stack integration |
| 2 | [Configure Plugin Marketplaces](#part-2---configure-plugin-marketplaces-5-min) | Add custom marketplaces for team-wide or community plugin distribution |

---

## Part 1 - Build and Package a QA Plugin (44 min)

**Objective:** Enable agent plugins, explore the default marketplace, then build a complete plugin from scratch. The plugin - `bookfaves-qa-plugin` - bundles a test-runner skill, a QA reviewer agent, a post-test logging hook, and the book-database MCP server into a single distributable package. Each component builds on patterns you learned in Labs 00-05.

> **Why a plugin?** The customizations you created locally in `.github/` folders and `.vscode/mcp.json` only work when that repo is open. A plugin makes the same capabilities **portable, installable, and shareable** - any developer who installs the plugin gets the skill, agent, hook, MCP server, and instructions automatically, regardless of which repo they have open.

### Exercise 1.1 - Enable Agent Plugins and Explore the Marketplace

Agent plugins are in Preview and must be enabled before you can build or install them.

1.  Open **Settings** (`Ctrl+,`).
2.  Search for `chat.plugins.enabled`.
3.  Check the box to enable it.

Alternatively, add this to your `settings.json`:

```json
{
  "chat.plugins.enabled": true
}
```

Now explore what the community has published:

4.  Open the **Extensions view** (`Ctrl+Shift+X`).
5.  In the search field, enter `@agentPlugins` to filter for agent plugins.

    Alternatively, select the **More Actions** (three dots `···`) icon in the Extensions sidebar header, choose **Views** > **Agent Plugins**.

6.  Browse the list of available plugins from the default marketplaces.

> **Default marketplaces:** VS Code discovers plugins from the [copilot-plugins](https://github.com/github/copilot-plugins) and [awesome-copilot](https://github.com/github/awesome-copilot/) repositories by default.

7.  Select any plugin from the list to read its description and see what it bundles (skills, agents, hooks, etc.).
8.  Optionally, click **Install** on a plugin that interests you to see how installed plugins appear.

You can also manage installed plugins from the Chat view:

*   Click the **gear icon** (⚙) at the top of the Chat panel and select **Plugins**.
*   Installed plugins appear in the **Agent Plugins - Installed** view in the Extensions sidebar, where you can **enable**, **disable**, or **uninstall** them.

> **Security note:** Plugins can include hooks and MCP servers that **run code on your machine**. Always review the plugin contents and publisher before installing, especially for plugins from community marketplaces.

**Verify:**

*   `chat.plugins.enabled` is checked in settings
*   The `@agentPlugins` search returns a list of plugins from the default marketplaces
*   The **gear icon** menu in Chat includes a **Plugins** option

### Exercise 1.2 - Add the Test Runner Skill

Create a test runner skill that teaches Copilot how to run and interpret tests for the Book Favorites app. This skill follows the same conventions you learned in [Lab 03](03-skills-exercise.md) - a `SKILL.md` with supporting scripts - and enforces the testing conventions from `testing.instructions.md` ([Lab 00, Exercise 2.3](00-custom-instructions-exercise.md#exercise-23---generate-testing-instructions)).

#### Step 1 - Create the skill in `.github/skills`

1.  In the Chat view, click the **gear icon** (⚙) > **Skills** > **Create new skill**.
2.  Choose `.github/skills` as the location.
3.  Enter `bookfaves-test-runner` as the skill folder name.
4.  Replace the generated `SKILL.md` content with:

```markdown
---
name: bookfaves-test-runner
description: >
  Runs and analyzes tests for the Book Favorites app. Executes backend Jest
  tests and frontend Cypress E2E tests, interprets results, and suggests fixes
  for failures. Use when running tests, diagnosing test failures, or checking
  test coverage.
argument-hint: "Specify which tests to run: backend, frontend, or all"
---

# Test Runner

## Available Commands

| Suite | Command | Framework |
| --- | --- | --- |
| Backend | `npm run test:backend` | Jest + supertest |
| Frontend E2E | `npm run build:frontend && npm run test:frontend` | Cypress |
| All (bash) | `bash ./scripts/run-tests.sh` | Both |
| All (PowerShell) | `powershell -File ./scripts/run-tests.ps1` | Both |

## Supporting Scripts

- **Linux/macOS**: Run `bash .github/skills/bookfaves-test-runner/scripts/run-tests.sh`
- **Windows**: Run `powershell -File .github/skills/bookfaves-test-runner/scripts/run-tests.ps1`

## Rules

1. Always start comments with "generated-by-copilot: "
2. Run tests from the `copilot-agent-and-mcp/` directory.
3. Run backend tests first - faster and catches API issues early.
4. If a test fails, read the failing test and source file before suggesting a fix.
5. Never modify test expectations to make tests pass - fix the source code instead.
6. After fixing a failure, re-run the specific test suite to confirm.

## Interpreting Output

- **Jest**: `FAIL` / `PASS` lines. Failed tests show expected vs received.
- **Cypress**: `✓` (pass) / `✗` (fail). Screenshots in `cypress/screenshots/`.

## Workflow

1. Ask which suite to run (backend, frontend, or both).
2. Execute the appropriate command.
3. Summarize: total tests, passed, failed, skipped.
4. For failures: identify root cause, show code, suggest fix.
5. After fix: re-run to confirm.
```

#### Step 2 - Add supporting scripts

Create `.github/skills/bookfaves-test-runner/scripts/run-tests.sh`:

```bash
#!/bin/bash
# generated-by-copilot: run all test suites sequentially
set -e

echo "=== Running Backend Tests ==="
cd copilot-agent-and-mcp
npm run test:backend

echo ""
echo "=== Running Frontend E2E Tests ==="
npm run build:frontend && npm run test:frontend

echo ""
echo "=== All Tests Complete ==="
```

Create `.github/skills/bookfaves-test-runner/scripts/run-tests.ps1`:

```powershell
# generated-by-copilot: run all test suites sequentially (Windows)
$ErrorActionPreference = "Stop"

Write-Host "=== Running Backend Tests ==="
Push-Location copilot-agent-and-mcp
npm run test:backend

Write-Host ""
Write-Host "=== Running Frontend E2E Tests ==="
npm run build:frontend; npm run test:frontend
Pop-Location

Write-Host ""
Write-Host "=== All Tests Complete ==="
```

### Exercise 1.3 - Add the QA Reviewer Agent

Create an agent that reviews test coverage and quality without modifying files. This follows the same `.agent.md` format from [Lab 01](01-custom-agents-exercise.md) and enforces the same read-only tool restrictions you used for the Planner and Reviewer agents.

1.  Create `.github/agents/bookfaves-qa-reviewer.agent.md`:

```markdown
---
description: Review test coverage and quality for the Book Favorites app. Analyzes test files, identifies gaps, and suggests improvements without modifying code.
name: bookfaves-qa-reviewer
tools: ['search', 'search/codebase', 'search/usages']
---

# QA Review Instructions

You are a senior QA engineer specializing in test quality. You review test suites for coverage, reliability, and best practices.

Don't make any code edits, just review and report findings.

## Rules

1. Always start comments with "generated-by-copilot: "
2. **NEVER edit, create, or delete files.** You are read-only.
3. Focus on the `copilot-agent-and-mcp/` directory for all analysis.
4. Backend tests are in `backend/tests/` (Jest).
5. Frontend E2E tests are in `cypress/e2e/` (Cypress).

## Review Checklist

1. **Coverage gaps** - routes/components without corresponding tests
2. **Edge cases** - missing boundary conditions, error paths, empty states
3. **Test isolation** - tests that depend on shared state or execution order
4. **Assertion quality** - generic assertions (`toBeTruthy()`) vs. specific ones
5. **Mock usage** - over-mocking that hides real bugs
6. **Naming** - test descriptions that clearly explain what is being tested
7. **DRY** - duplicated setup that should use `beforeEach` / helpers

## Output Format

- **Summary** - overall test health score (A/B/C/D/F) and one-line assessment
- **Coverage Map** - table showing each route/component and whether it has tests
- **Findings** - table with columns: Priority (P0-P3), File, Issue, Suggestion
- **Quick Wins** - top 3 easiest improvements with the highest impact
```

### Exercise 1.4 - Add the Post-Test Logger Hook

Create a hook that logs test execution results after test-related terminal commands. This follows the same `PostToolUse` hook pattern from [Lab 02, Exercise 1.2](02-hooks-exercise.md#exercise-12---create-the-auto-format-hook) - a `.json` config pointing to a Node.js script.

1.  Create `.github/hooks/bookfaves-post-test-logger.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "node .github/hooks/scripts/bookfaves-post-test-logger.js",
        "timeout": 10
      }
    ]
  }
}
```

2.  Create `.github/hooks/scripts/bookfaves-post-test-logger.js`:

```javascript
// generated-by-copilot: PostToolUse hook to log test execution results
// Only fires for terminal tool calls that contain test commands.
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin });
let inputData = '';

rl.on('line', (line) => {
  inputData += line;
});

rl.on('close', () => {
  try {
    const input = JSON.parse(inputData);
    const toolName = input.tool_name || '';
    const toolInput =
      typeof input.tool_input === 'string'
        ? JSON.parse(input.tool_input)
        : input.tool_input || {};

    // generated-by-copilot: only log for terminal commands that look like test runs
    const terminalTools = ['run_in_terminal', 'terminal', 'bash', 'shell'];
    if (!terminalTools.some((t) => toolName.toLowerCase().includes(t))) {
      process.exit(0);
    }

    const command = toolInput.command || toolInput.cmd || toolInput.input || '';
    const testPatterns = [/npm\s+run\s+test/i, /jest/i, /cypress/i, /vitest/i];

    if (!testPatterns.some((p) => p.test(command))) {
      process.exit(0);
    }

    // generated-by-copilot: log test execution with timestamp
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Test executed: ${command}\n`;
    process.stderr.write(logEntry);
  } catch (err) {
    // generated-by-copilot: non-blocking - log but don't fail the agent
    process.stderr.write(`Test log hook error: ${err.message}\n`);
    process.exit(0);
  }
});
```

> **Compare with Lab 02:** This hook follows the same pattern as the auto-format hook (Exercise 1.2) - reads stdin JSON, checks `tool_name`, and processes only relevant tool calls. The difference: this one filters for test commands instead of file edits.

### Exercise 1.5 - Add the Book Database MCP Server

Add the book-database MCP server to provide access to book data tools. This MCP server exposes tools that query and manage books.

1.  Open `.vscode/mcp.json` in the workspace.
2.  Add the `book-database` server to the `servers` section:

```json
{
  "servers": {
    "book-database": {
      "command": "node",
      "args": ["path/to/book-database/build/index.js"]
    }
  }
}
```

> **Note:** Replace `path/to/book-database/build/index.js` with the actual path to your book-database MCP server. The MCP server will be available to all agents and skills once configured.

### Exercise 1.6 - Install and Test the Plugin Locally

Now install your plugin as a local plugin in VS Code. The UI will create `plugin.json` automatically.

1.  Create a `bookfaves-qa-plugin/` folder at the workspace root.
2.  Open the Chat view.
3.  Click the **gear icon** (⚙) at the top of the Chat panel.
4.  Select **Plugins** from the dropdown menu.
5.  In the **Agent Plugins - Local** view, click the **+** button to add a local plugin.
6.  In the **Create Plugin** dialog, select which components to include in your plugin:
    *   Check **Skills**: select `bookfaves-test-runner` from `.github/skills/`
    *   Check **Agents**: select `bookfaves-qa-reviewer` from `.github/agents/`
    *   Check **Hooks**: select `bookfaves-post-test-logger` from `.github/hooks/`
    *   Check **MCP Servers**: select `book-database` from `.vscode/mcp.json`
7.  Click **OK** to proceed.
8.  Enter the plugin name: `bookfaves-qa-plugin`
9.  Enter the plugin location: the absolute path to your `bookfaves-qa-plugin/` directory (e.g., `C:\Users\yourname\Desktop\agentic-copilot-deepdive-main\bookfaves-qa-plugin`)
10. Click **Install** to finish. VS Code creates `plugin.json` with your selected components.

**Verify each component is active:**

**Test the skill:**

1.  Open the Chat view and type `/bookfaves-test-runner`.
2.  Ask: "Run the backend tests for the Book Favorites app."
3.  Copilot should use the skill instructions and run `npm run test:backend`.

**Test the hook:**

1.  Ask Copilot: "Run backend tests in the copilot-agent-and-mcp directory."
2.  Open the **Output** panel (`Ctrl+Shift+U`) and select **GitHub Copilot Chat Hooks**.
3.  Look for the `[PostToolUse]` log entry from the post-test logger hook.

**Test the MCP Server:**

1.  Ask an agent: "Query the book database for available books."
2.  The agent should have access to book-database tools via the MCP server.

### Exercise 1.7 - Manage Plugin Installation

1.  Go to the Chat view **gear icon** (⚙) > **Plugins**.
2.  In **Agent Plugins - Local**, find **bookfaves-qa-plugin**.
3.  Click the **disable toggle** to turn the plugin off.
4.  Verify: the **bookfaves-qa-reviewer** agent disappears from the dropdown, the `/bookfaves-test-runner` skill is no longer available.
5.  Click the toggle again to re-enable it and confirm everything reappears.

> **Tip:** This is how you toggle plugins on and off without uninstalling them - useful for debugging and testing.

### Exercise 1.8 - Review How All Layers Work Together

With your customizations built locally in `.github/` and packaged into a plugin, you now have all five layers active simultaneously:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Instructions (Lab 00)        Always-on conventions            │
│  copilot-instructions.md, react/express/testing/css/security            │
│  → Applied to ALL agents (local and plugin)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 2: Agents (Lab 01)              Personas + tool restrictions     │
│  .github/agents/: Planner, Implementer, Reviewer, bookfaves-qa-reviewer │
│  → Exported to plugin for team distribution                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 3: Hooks (Lab 02)               Deterministic automation         │
│  .github/hooks/: auto-format, security guard, bookfaves-post-test-log   │
│  → All hooks fire globally (shared across all agents)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 4: Skills (Lab 03)              On-demand capabilities           │
│  .github/skills/: Data Seeder, Test Fixture, bookfaves-test-runner      │
│  → Loaded when task matches skill description                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 5: MCP Servers                  Tool access layer                │
│  .vscode/mcp.json: book-database (bundled in plugin)                    │
│  → Agents invoke MCP tools for data queries and operations              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Observe the full stack:**

1.  Select the **bookfaves-qa-reviewer** agent.
2.  Ask: "Review the test coverage for the Book Favorites app."
3.  Observe:
    *   The agent is loaded from the installed plugin
    *   The `testing.instructions.md` conventions (Lab 00) auto-apply to this agent
    *   The security guard hook (Lab 02) fires silently in the background
    *   The post-test logger hook fires when test commands execute
    *   The book-database MCP server provides tools for data queries
    *   All five layers coexist without conflicts

---

## Part 2 - Configure Plugin Marketplaces (5 min)

**Objective:** Learn how to add custom plugin marketplaces beyond the defaults, including private team repositories.

### Exercise 2.1 - Add a Custom Marketplace

Plugin marketplaces are Git repositories that contain plugin definitions. You can reference them in several formats:

| Format | Example |
| --- | --- |
| **Shorthand** | `owner/repo` (public GitHub repos) |
| **HTTPS** | `https://github.com/owner/repo.git` |
| **SSH** | `git@github.com:owner/repo.git` |
| **Local** | `file:///path/to/marketplace` |

1.  Open **Settings** (`Ctrl+,`).
2.  Search for `chat.plugins.marketplaces`.
3.  Click **Add Item** and enter a marketplace reference.

```json
{
  "chat.plugins.marketplaces": [
    "github/copilot-plugins",
    "github/awesome-copilot"
  ]
}
```

> **Private repositories:** If a public lookup fails, VS Code falls back to cloning the repository directly. Private repos work as long as your Git credentials have access.

4.  After adding a marketplace, browse the **Extensions view** with `@agentPlugins` to see plugins from the new marketplace.

### Exercise 2.2 - Understand Plugin vs Local Customization Precedence

Plugins work **alongside** your locally defined customizations. When both exist:

| Aspect | Local (`.github/`) | Plugin |
| --- | --- | --- |
| **Discovery** | Automatic from `.github/` folders | Requires `chat.plugins.paths` or marketplace install |
| **Toggle** | Rename files to disable | Set path value to `false` |
| **Scope** | This workspace only | Any workspace where plugin is installed |
| **Sharing** | Copy files manually or commit to repo | Install from marketplace with one click |
| **Conflicts** | N/A | Both sources appear in menus; user picks which to use |

> **Key insight:** The customizations in `.github/` (Labs 00-03) are **workspace-scoped** - they only work when this repo is open. The plugin you built here is **portable** - install it in any workspace and the QA Reviewer, test-runner skill, and post-test logger are available immediately.

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| Plugin UI not visible | Verify `chat.plugins.enabled` is `true` in settings |
| `@agentPlugins` returns nothing | Check your network connection; VS Code needs to reach GitHub to list marketplace plugins |
| Local plugin not loading | Open Chat > **gear icon** > **Plugins** and verify the plugin path is correct and enabled |
| Plugin agent not in dropdown | Reload VS Code (`Ctrl+Shift+P` > **Developer: Reload Window**) after installing the plugin |
| Plugin hook not firing | Check that the hook script path in the `.json` config is correct relative to the workspace root |
| Plugin component not available | Verify the component (skill, agent, hook, MCP) exists in the specified folder and was selected during plugin creation |
| `plugin.json` errors | Validate the JSON syntax; ensure `name` and `displayName` fields are present |

---

## Key Takeaways

| Concept | Key Learning |
| --- | --- |
| **Build locally, package as plugin** | Create customizations in `.github/` folders first, then bundle them into a plugin for distribution |
| **Plugins = portability** | Plugins solve how to share agents, skills, hooks, MCP servers, and instructions as a single installable package |
| **`plugin.json`** | The manifest that identifies the plugin with metadata (name, description, version, publisher) |
| **Bundled customizations** | A plugin can contain any combination of skills, agents, hooks, MCP servers, and slash commands from `.github/` |
| **All five layers coexist** | Instructions (Lab 00) + agents (Lab 01) + hooks (Lab 02) + skills (Lab 03) + MCP servers form a complete stack |
| **Plugin installation via UI** | Use Chat > **gear icon** > **Plugins** to select components and install plugins locally for development |
| **Marketplaces** | Git repositories that host plugin definitions; configurable via `chat.plugins.marketplaces` |
| **Enable/disable** | Toggle plugins on/off without uninstalling via the Plugins view - useful for debugging |
| **Security** | Always review plugin contents before installing - hooks and MCP servers run code on your machine |

## What's there so far

With all six core lab exercises complete, you have built a full customization stack for GitHub Copilot and packaged it as a distributable plugin:

| Lab | Layer | What you built | Packaged in Plugin? |
| --- | --- | --- | --- |
| **00** | Instructions | Coding conventions that Copilot follows automatically | ✓ auto-applied |
| **01** | Agents | Specialized AI personas with tool restrictions | ✓ bookfaves-qa-reviewer |
| **02** | Hooks | Deterministic automation around agent actions | ✓ bookfaves-post-test-logger |
| **03** | Skills | Reusable, on-demand capabilities | ✓ bookfaves-test-runner |
| **04** | Build MCP Server | Custom MCP server for data access | Built in Lab 04 |
| **05** | Exercise MCP Server | MCP tools tested and exercised | Built in Lab 05 |
| **06** | MCP Servers + Plugins | Distributable package bundling all above | ✓ bookfaves-qa-plugin (includes book-database) |

From here, you can:

1.  **Share the plugin** - Commit `bookfaves-qa-plugin/plugin.json` to version control and share it with teammates
2.  **Publish to marketplace** - Add your plugin to a GitHub marketplace for team or community discovery
3.  **Extend the plugin** - Add more skills, agents, hooks, or MCP servers by repeating the exercises
4.  **Create specialized plugins** - Build focused plugins for different workflows (e.g., security-qa-plugin, data-science-plugin)

## Reference

*   [VS Code Agent Plugins Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins)
*   [Customize AI for Your Project Guide](https://code.visualstudio.com/docs/copilot/guides/customize-copilot-guide)
*   [Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
*   [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
*   [Hooks](https://code.visualstudio.com/docs/copilot/customization/hooks)
*   [MCP Servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
