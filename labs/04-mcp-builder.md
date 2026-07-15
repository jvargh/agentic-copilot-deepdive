# Lab 04 - Build an MCP Server with the MCP Builder Skill

> **Mode:** VS Code (Agent Mode)  
> **Prerequisite:** [Lab 03 - Agent Skills](03-skills-exercise.md)

---

## Table of Contents

*   [Objective](#objective)
*   [Exercise 1: Install the MCP Builder Skill](#exercise-1-install-the-mcp-builder-skill)
    *   [Option A: Use the /create-skill Shortcut](#option-a-use-the-create-skill-shortcut-recommended)
    *   [Option B: Manual Download](#option-b-manual-download-alternative)
*   [Exercise 2: Scaffold the Project](#exercise-2-scaffold-the-project)
*   [Exercise 3: Implement the Tools](#exercise-3-implement-the-tools)
*   [Exercise 4: Test with MCP Inspector](#exercise-4-test-with-mcp-inspector)
*   [Exercise 5: Wire Up to VS Code](#exercise-5-wire-up-to-vs-code)
*   [Troubleshooting](#troubleshooting)

## Objective

Build a fully functional MCP server from scratch using GitHub Copilot in Agent Mode with the Anthropic MCP Builder skill. The server exposes a Book Database built entirely by prompting Copilot into the `book-database-mcp-server/` folder.

> **Note:** If `book-database-mcp-server/` already exists in your workspace, delete it first. This lab rebuilds it from scratch.

| Exercise | Skill                     | What You Learn                                                                                                              |
| -------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1        | **Skill installation**    | Install and verify an Agent Skill in VS Code - understand how skills extend Copilot's capabilities                          |
| 2        | **AI-scaffolded project** | Prompt Copilot with the MCP Builder skill to scaffold a TypeScript project with proper structure, config, and dependencies  |
| 3        | **Tool implementation**   | Prompt Copilot to implement MCP tools with Zod validation, annotations, and error handling - learn MCP tool design patterns |
| 4        | **MCP testing**           | Test the server with MCP Inspector - verify tools work before wiring to an AI client                                        |
| 5        | **VS Code integration**   | Wire the server into VS Code and test it from Copilot Chat - the full loop from build to use                                |

---

## Exercise 1: Install the MCP Builder Skill

> **Purpose:** Install the Anthropic MCP Builder skill so Copilot knows how to scaffold production-quality MCP servers. Without this skill, Copilot generates generic code - with it, Copilot follows MCP best practices (tool naming, Zod schemas, annotations, error handling).

### Option A: Use the `/create-skill` Shortcut (Recommended)

1.  Open GitHub Copilot Chat in VS Code
2.  Type `/create-skill` and submit this prompt:

```
Install the Anthropic MCP Builder skill from https://github.com/anthropics/skills/tree/main/skills/mcp-builder

Download the SKILL.md and all files in the reference/ folder (mcp_best_practices.md, node_mcp_server.md, python_mcp_server.md, evaluation.md) from that repository. Save them as a project skill under .github/skills/mcp-builder/ in this workspace.
```

1.  Copilot generates the `SKILL.md` and reference docs
2.  Review the generated files and confirm they were saved to `.github/skills/mcp-builder/`

### Option B: Manual Download (Alternative)

If `/create-skill` is unavailable, download the files manually:

```
mkdir -p .github/skills/mcp-builder/reference

curl -L -o .github/skills/mcp-builder/SKILL.md \
  https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/SKILL.md

curl -L -o .github/skills/mcp-builder/reference/mcp_best_practices.md \
  https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/mcp_best_practices.md

curl -L -o .github/skills/mcp-builder/reference/node_mcp_server.md \
  https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/node_mcp_server.md

curl -L -o .github/skills/mcp-builder/reference/python_mcp_server.md \
  https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/python_mcp_server.md

curl -L -o .github/skills/mcp-builder/reference/evaluation.md \
  https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/evaluation.md
```

**PowerShell:** Replace `mkdir -p` with `New-Item -ItemType Directory -Force -Path` and `curl -L -o` with `Invoke-WebRequest -Uri <URL> -OutFile <PATH>`.

### Step 2: Verify the Skill is Loaded

1.  Open Command Palette: `Ctrl+Shift+P` → **Chat: Open Chat Customizations**
2.  Under **Skills**, confirm `mcp-builder` appears
3.  Ask Copilot:

```
Do you have the MCP Builder skill loaded? Summarize the four phases of building an MCP server.
```

**Expected:** Copilot mentions **(1) Deep Research & Planning → (2) Implementation → (3) Review & Test → (4) Create Evaluations**.

### Validation

- `.github/skills/mcp-builder/SKILL.md` exists
- 4 reference files in `.github/skills/mcp-builder/reference/`
- Skill appears in Chat Customizations
- Copilot confirms the 4-phase workflow

---

## Exercise 2: Scaffold the Project

> **Purpose:** Use the MCP Builder skill to scaffold a TypeScript MCP server project from a single prompt. Compare the generated structure against the skill's recommendations - learn what a well-structured MCP project looks like.

### Step 1: Prompt Copilot to Scaffold

In Agent Mode. This prompt uses **phased validation gates** so Copilot runs pre-flight checks, halts on failure, and doesn't skip data-file copy or build steps:

```
Using the MCP Builder skill, scaffold, build, and validate a TypeScript MCP server in the
workspace root at book-database-mcp-server/. Server name: book-database-mcp-server. stdio
transport. Follow the skill's TypeScript project structure.

Source data files in this workspace:
- data/books.json         - array of { isbn, title, author }
- data/books-details.json - array of { isbn, summary, date, author }

Run these phases in order. ABORT and report if any gate fails; do not proceed to the next phase.

PHASE 0 - PRE-FLIGHT
[ ] node --version prints >= 18
[ ] npm config get registry returns a reachable registry
[ ] Both data files exist at data/books.json and data/books-details.json

PHASE 1 - SCAFFOLD
[ ] Generate project structure per the MCP Builder TypeScript guide
[ ] package.json has "type": "module" and depends on @modelcontextprotocol/sdk and zod
[ ] tsconfig.json has "strict": true, "target": "ES2020", "module": "Node16",
    "outDir": "./dist", "rootDir": "./src", "resolveJsonModule": true
[ ] Copy data files into book-database-mcp-server/src/data/

PHASE 2 - COMPILE
[ ] cd book-database-mcp-server && npm install && npm run build
[ ] Fail if output contains "error TS"
[ ] Confirm dist/index.js exists

PHASE 3 - DISTRIBUTE
[ ] Copy src/data/*.json to dist/data/ BEFORE any server start
[ ] List dist/data/ and confirm both JSON files are present

Report pass/fail for every gate.
```

> **Known limitation (Phase 2):** MCP SDK + Zod inference can exceed the TypeScript type-depth limit. If the build fails with "Type instantiation is excessively deep", add `// @ts-ignore` on the offending `server.registerTool(...)` line and type the handler params as `any`, then re-parse inside with your Zod schema. This is documented in the MCP Builder skill's Node reference.

### Step 2: Verify the Generated Structure

```
book-database-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── constants.ts
│   ├── schemas/
│   │   └── validation.ts
│   ├── services/
│   │   └── bookService.ts
│   ├── tools/
│   │   ├── search.ts
│   │   ├── list.ts
│   │   └── getByISBN.ts
│   └── data/
│       ├── books.json ← verify this exists
│       └── books-details.json ← verify this exists
```

⚠️ **Important:** If `src/data/` is empty or does not exist, Copilot may have forgotten to copy the data files.  
Re-prompt with:

```
Copy the data files from data/books.json and data/books-details.json in the workspace root 
into book-database-mcp-server/src/data/ now.
```

Verify the files were copied before proceeding to Step 3.


### Step 3: Verify Config

Open `package.json` and `tsconfig.json`. Confirm:

- `"type": "module"` in package.json
- `@modelcontextprotocol/sdk` and `zod` in dependencies
- `"strict": true` in tsconfig.json
- `outDir` → `./dist`, `rootDir` → `./src`
- `"build": "tsc"` script defined

### Step 4: Install and Build

```
cd book-database-mcp-server
npm install
npm run build
```

Fix any compilation errors before moving on.

### Step 5: Copy Data Files to dist

After building, TypeScript compiles only `.ts` files to the `dist/` directory. The data files need to be manually copied:

**On Linux/macOS:**

```bash
cp -r src/data dist/
```

**On Windows (PowerShell):**

```powershell
Copy-Item -Path src/data -Destination dist/data -Recurse -Force
```

Verify the files are in place:

```
dist/data/books.json
dist/data/books-details.json
```

### Validation

- Project scaffolded with correct structure
- Config files match MCP Builder recommendations
- `npm run build` succeeds with zero errors

---

## Exercise 3: Implement the Tools

> **Purpose:** Prompt Copilot to implement four MCP tools following MCP Builder best practices - Zod `.strict()` schemas, `server.registerTool()` (modern API), tool annotations, and actionable error messages. This is where the skill's value shows: the generated code follows patterns you'd miss without it.

### Step 1: Prompt for Tool Implementation

> Using the MCP Builder skill best practices, implement four tools in the book-database MCP server: `get_book_by_isbn`, `get_book_by_title`, `get_books_by_titles`, and `get_books_by_isbn_list`. Use `server.registerTool()` (the modern API). Each tool should have Zod input schemas with `.strict()` and `.describe()`, proper title, description, inputSchema, and annotations (all are read-only, non-destructive, idempotent). Return formatted text responses. Handle not-found cases with clear, actionable error messages.
>
> **Type-depth guardrail:** If the TypeScript compiler complains about excessive type instantiation depth on any `server.registerTool(...)` call, add `// @ts-ignore` on that line, declare the handler as `async (params: any) => { ... }`, and parse `params` with the tool's Zod schema inside the handler. Do NOT use `any` anywhere else.
### Step 2: Review the Implementation

Check these quality criteria:

| Criteria        | Expected                                                               |
| --------------- | ---------------------------------------------------------------------- |
| API             | Uses `server.registerTool()` (NOT deprecated `server.tool()`)          |
| Annotations     | `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true` |
| Zod schemas     | Uses `.strict()` to reject extra fields                                |
| Descriptions    | Zod fields have `.describe()` for discoverability                      |
| ISBN validation | Enforces exactly 10 characters                                         |
| Error messages  | Clear and actionable for not-found cases                               |
| Types           | No `any` - uses proper types or `unknown`                              |

### Step 3: Build and Fix

```
npm run build
```

Iterate with Copilot until the build succeeds with zero errors.

### Step 4: Run the Server

```
node .\dist\index.js
```

**Expected on stderr:**

```
Book database MCP Server running on stdio
```

Press `Ctrl+C` to stop (server hangs waiting for stdin - that's expected).

### Step 5: Validate the Transport Handshake

In another terminal, send a raw MCP `initialize` request:

```
cd .\book-database-mcp-server\

echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' | node dist/index.js
```

Verify the response includes `"name": "book-database-mcp-server"` and a `capabilities` object listing `tools`.

### Validation

- 4 tools implemented with `server.registerTool()`
- Zod schemas use `.strict()` and `.describe()`
- Annotations present on all tools
- `npm run build` succeeds
- Server starts and responds to initialize request

---

## Exercise 4: Test with MCP Inspector

> **Purpose:** Use MCP Inspector to interactively test each tool before wiring the server into VS Code. This catches bugs early - always verify tools work standalone before connecting them to an AI client.

### Step 1: Launch the Inspector

From the `book-database-mcp-server/` folder (where `dist/index.js` lives):

```
cd book-database-mcp-server
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a browser UI showing all registered tools.

### Step 2: Run Test Cases

Select each tool in the Inspector sidebar, fill in the parameter fields, and click **Run**.

| #   | Tool                    | Parameter(s)                                           | Expected                                     |
| --- | ----------------------- | ------------------------------------------------------ | -------------------------------------------- |
| 1   | `search_books`          | **query**: `1984`                                      | Details for "1984" by George Orwell          |
| 2   | `search_books`          | **query**: `The Hobbit`                                | ISBN `0547928227`, author J.R.R. Tolkien     |
| 3   | `search_books`          | **query**: `Orwell`                                    | All books by George Orwell                   |
| 4   | `search_books`          | **query**: `1984`, **limit**: `1`                      | Single result for "1984"                     |
| 5   | `search_books`          | **query**: `fiction`, **limit**: `5`, **offset**: `5`  | Paginated results (second page of 5)         |
| 6   | `search_books`          | **query**: `1984`, **response_format**: `json`         | JSON structured response instead of markdown |
| 7   | `search_books`          | **query**: `nonexistentbook99`                         | Empty results or not-found message           |
| 8   | `get_book_by_isbn`      | **isbn**: `0451524935`                                 | Title, author, publication date, and summary for "1984" |
| 9   | `get_book_by_title`     | **title**: `The Hobbit`                                | Details for "The Hobbit" by J.R.R. Tolkien   |
| 10  | `get_books_by_titles`   | **titles**: `["1984", "The Hobbit"]`                   | One entry per title with full details        |
| 11  | `get_books_by_isbn_list`| **isbns**: `["0451524935", "0547928227"]`              | One entry per ISBN with full details         |

### Validation

- All 4 tools visible in Inspector
- Valid inputs return correct data
- Invalid ISBN returns validation error
- Not-found ISBN returns actionable error message

---

## Exercise 5: Wire Up to VS Code

> **Purpose:** Connect your server to VS Code and test it from Copilot Chat. This completes the loop: you built an MCP server from scratch and can now use it as a data source for AI-assisted development - the same setup Lab 05 will use.

### Step 1: Configure MCP

Create or update `.vscode/mcp.json` in the **workspace root**:

```
{
  "servers": {
    "book-database": {
      "type": "stdio",
      "command": "node",
      "args": ["/book-database-mcp-server/dist/index.js"]
    }
  }
}
```

### Step 2: Start the MCP Server

1.  Open Command Palette: `Ctrl+Shift+P`
2.  Run: **MCP: Start MCP server**
3.  Select **book-database**

### Step 3: Test from Copilot Chat

In Agent Mode:

```
Use the book-database MCP server to find details about the book "1984".
```

**Expected:** Copilot calls `get_book_by_isbn` or `get_book_by_title` and returns the book information.

Follow up:

```
Now get the summaries for The Hobbit and Pride and Prejudice.
```

### Validation

- `.vscode/mcp.json` configured
- MCP server starts from VS Code
- Copilot calls MCP tools and returns book data

---

## Troubleshooting

| Issue                                    | Fix                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run build` fails with import errors | Ensure `"type": "module"` in package.json and `"module": "Node16"` in tsconfig.json       |
| `error TS2589: Type instantiation is excessively deep` | Add `// @ts-ignore` on the failing `server.registerTool(...)` line and type the handler params as `any` (re-parse with Zod inside). MCP SDK + Zod inference exceeds TS depth limits. |
| MCP Inspector won't connect              | Run `npm run build` first - `dist/index.js` must exist                                    |
| Tools not appearing in Copilot           | Restart VS Code after updating `.vscode/mcp.json`                                         |
| `Cannot find module './data/books.json'` | Ensure JSON files are in `src/data/` **and** copied to `dist/data/` after each build; enable `resolveJsonModule` in tsconfig |
| Copilot uses `server.tool()`             | Re-prompt: "Use `server.registerTool()` - the modern API, not deprecated `server.tool()`" |
