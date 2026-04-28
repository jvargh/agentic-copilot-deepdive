# Lab 11: Security Hardening Sprint

> **Mode:** VS Code (Agent Mode)  
> **Duration:** ~60 min  
> **Prerequisites:** [Lab 00](00-custom-instructions-exercise.md) (Custom Instructions), [Lab 01](01-custom-agents-exercise.md) (Custom Agents), [Lab 02](02-hooks-exercise.md) (Hooks), [Lab 03](03-skills-exercise.md) (Skills), [Lab 07](07-coding-agent.md) (Coding Agent)

---

## Table of Contents

*   [Objective](#objective)
*   [Exercise 1 - Build the OWASP Scanner Agent](#exercise-1--build-the-owasp-scanner-agent-10-min)
*   [Exercise 2 - Create the Security-Fix Skill](#exercise-2--create-the-security-fix-skill-10-min)
*   [Exercise 3 - Add the Auth-Guard Hook](#exercise-3--add-the-auth-guard-hook-10-min)
*   [Exercise 4 - Run the Scanner and Open Fix PRs](#exercise-4--run-the-scanner-and-open-fix-prs-20-min)
*   [Exercise 5 - Re-Scan and Generate Compliance Report](#exercise-5--re-scan-and-generate-compliance-report-10-min)
*   [Summary](#summary)

---

## Objective

Run a complete security hardening sprint against the Book Favorites backend using the agentic Copilot workflow. You will build a read-only OWASP Scanner agent, a security-fix skill with remediation templates, a PreToolUse hook that guards auth middleware, and tie it all together with the Coding Agent to open fix PRs and a Reviewer agent to validate compliance.

| Exercise | What You Build | Ties Back To |
| --- | --- | --- |
| 1 | OWASP Scanner agent (read-only) | Lab 01 (Custom Agents) |
| 2 | security-fix skill with remediation templates | Lab 03 (Skills) |
| 3 | PreToolUse auth-guard hook | Lab 02 (Hooks) |
| 4 | Coding Agent fix PRs | Lab 07 (Coding Agent) |
| 5 | Reviewer re-scan + compliance report | Labs 01, 03 |

### Prerequisites

| Requirement | Details |
| --- | --- |
| **VS Code** | Insiders or latest Stable with GitHub Copilot extension (Agent Mode enabled) |
| **GitHub Copilot** | Copilot Pro, Pro+, Business, or Enterprise subscription |
| **Workspace** | This repository cloned locally |
| **Node.js** | v18 or later |
| **App running** | `npm run install:all && npm start` - backend on :4000, frontend on :5173 |
| **Prior labs** | Labs 00, 01, 02, 03 completed - you should have Planner, Implementer, Reviewer agents plus global hooks |
| **GitHub repo** | Repository pushed to GitHub (required for Exercise 4 - Coding Agent PRs) |

### Architecture Overview

```
  ┌────────────────┐      ┌──────────────┐      ┌──────────┐
  │ OWASP Scanner  │ ───> │ Implementer  │ ───> │ Reviewer │
  │ (read-only)    │      │ + skill      │      │ (re-scan)│
  └────────────────┘      └──────┬───────┘      └──────────┘
         │                       │                     │
    findings report        auth-guard hook         compliance
                           blocks unreviewed       report
                           auth changes
```

---

## Exercise 1 - Build the OWASP Scanner Agent (10 min)

**Objective:** Create an agent that audits `backend/` for OWASP Top 10 vulnerabilities and writes a structured findings report to `reports/owasp-findings.md`. This agent can search and read source code but **may only write files inside the** `**reports/**` **directory**.

> **Tip - Use Context7 to pull up-to-date OWASP guidance.** Before writing or customizing the scanner's checklist, you can ask Copilot to fetch the latest OWASP Top 10 documentation via the Context7 MCP server (configured in [Lab 00](00-custom-instructions-exercise.md#context7-mcp-setup)). For example, in any Chat session run:
> 
> ```
> Use context7 to look up the OWASP Top 10 checklist for Node.js/Express applications.
> Summarize each category with one-line detection rules I can paste into an agent's scan procedure.
> ```
> 
> This ensures the scanner's checklist reflects the **current OWASP standard** rather than relying on training-data knowledge that may be outdated. You can also use it to pull guidance for other security frameworks (e.g., CWE, NIST SSDF) and add those checks to the agent's scan procedure table.

### Step 1.1 - Create the Agent File

1.  In the Chat view, click the **gear icon** (⚙) → **Custom Agents** → **Create new custom agent**.
2.  Choose `.github/agents` as the location.
3.  Name it `OWASPScanner`.
4.  Replace the generated content with:

```
---
description: "Audit the Book Favorites backend for OWASP Top 10 security issues. Read-only for source code - only writes to reports/. Use when: security audit, OWASP scan, vulnerability assessment, security review, compliance check."
name: "OWASP Scanner"
tools: ['search', 'search/codebase', 'search/usages', 'web/fetch', 'editFiles']
user-invocable: true
handoffs:
  - label: "Fix Security Findings"
    agent: "Implementer"
    prompt: "Apply the security fixes for each finding listed above using the security-fix skill. Reference the OWASP IDs and remediation templates."
    send: false
  - label: "Review After Fixes"
    agent: "Reviewer"
    prompt: "Re-scan the codebase for the OWASP findings listed above. For each finding, verify the fix was applied correctly and report pass/fail status in a compliance table."
    send: false
---

# OWASP Scanner Instructions

You are a security auditor. You scan the Book Favorites backend for OWASP Top 10 vulnerabilities. **You must never modify source code files.** You may only create or overwrite files inside the `reports/` directory at the project root.

After completing the scan, **always write the full findings report to `reports/owasp-findings.md`**. Display a brief summary in chat and confirm the file was written.

## Scan Procedure

1. **Enumerate attack surface**: Read all route files in `backend/routes/`, the server entry `backend/server.js`, and middleware/utilities in `backend/utils/`.
2. **Check each OWASP Top 10 category** against the codebase:

| ID | Category | What to Look For |
|----|----------|-----------------|
| A01 | Broken Access Control | Missing `authenticateToken` on mutation routes, IDOR via predictable IDs, missing ownership checks |
| A02 | Cryptographic Failures | Plaintext passwords, hardcoded secrets (`SECRET_KEY`), weak JWT configuration |
| A03 | Injection | Unsanitized user input in queries/file operations, template injection, path traversal |
| A04 | Insecure Design | No rate limiting on `/login` or `/register`, no account lockout |
| A05 | Security Misconfiguration | Overly permissive CORS, missing Helmet headers, verbose error messages |
| A06 | Vulnerable Components | Outdated npm packages with known CVEs |
| A07 | Auth Failures | No password complexity requirements, no token refresh/revocation |
| A08 | Data Integrity Failures | No CSRF protection, unsigned data in JSON files |
| A09 | Logging Failures | No security event logging (failed logins, auth failures) |
| A10 | SSRF | Unsanitized URLs in any fetch/redirect logic |

3. **For each finding**, report the OWASP ID, severity (Critical/High/Medium/Low), file + line, description, evidence snippet, and remediation.

## Output Format

Produce a Markdown findings table followed by detailed findings. End with a compliance score: `{X} of 10 OWASP categories checked - {Y} findings, {Z} critical`.

## Constraints

- **Source-code read-only**: You must never edit files outside `reports/`. If asked to fix something, use the "Fix Security Findings" handoff.
- Always write the full report to `reports/owasp-findings.md` - do not only print to chat.
- Focus on `backend/` only.
- Do not fabricate findings - trace each to specific code.
```

### Step 1.2 - Verify the Agent Loads

1.  Open the **Agents** dropdown in the Chat view.
2.  Confirm **OWASP Scanner** appears in the list.
3.  Select it and verify the tool list includes search tools and `editFiles` (for writing to `reports/`) - but note the agent instructions restrict writes to the `reports/` directory only.

> **Why restrict to** `**reports/**` **only?** A security scanner must never modify the code it audits. By including `editFiles` but instructing the agent to only write inside `reports/`, we get the best of both worlds: the findings persist as a file artifact while source code remains untouched. The agent physically can write files, but its instructions enforce the `reports/`\-only boundary.

---

## Exercise 2 - Create the Security-Fix Skill (10 min)

**Objective:** Build a reusable skill containing remediation templates for the OWASP findings the scanner will discover. The Implementer agent will reference this skill to apply fixes consistently.

### Step 2.1 - Create the Skill Folder

Create the skill at `.github/skills/security-fix/SKILL.md`.

You can use `/create-skill` or create it manually. The skill should contain remediation templates for these OWASP categories (which are the real issues in this codebase):

| OWASP ID | Finding | Remediation |
| --- | --- | --- |
| A02 | Plaintext passwords | bcrypt hashing with salt rounds |
| A02 | Hardcoded `SECRET_KEY` | Environment variable with startup check |
| A03 | No input validation | Sanitization helpers (regex for username, bookId) |
| A04 | No rate limiting | express-rate-limit on auth endpoints |
| A05 | Wide-open CORS, no Helmet | helmet middleware + restricted CORS origins |
| A09 | No security logging | Structured stderr logger for auth events |

### Step 2.2 - Use `/create-skill` (Recommended)

1.  Open Chat and type:

```
/create-skill
```

1.  Enter this prompt:

> Create a skill called `security-fix` in `.github/skills/security-fix/` for the Book Favorites app. The SKILL.md should:
> 
> *   **name:** security-fix
> *   **description:** Remediation templates for OWASP Top 10 findings in the Book Favorites Express backend. Provides copy-paste code fixes for input validation, rate limiting, CORS hardening, Helmet headers, and password hashing.
> *   **argument-hint:** 'Specify the OWASP finding ID(s) to fix (e.g., "A02 A05" or "all")'
> *   **Body sections:**
>     1.  A02 fix: bcrypt password hashing for registration and login in `backend/routes/auth.js`
>     2.  A02 fix: Move `SECRET_KEY` to `process.env.JWT_SECRET` with startup validation
>     3.  A03 fix: Create `backend/utils/sanitize.js` with `sanitizeString()`, `isValidUsername()`, `isValidBookId()` helpers
>     4.  A04 fix: Add express-rate-limit middleware to `/api/login` and `/api/register` (10 requests per 15 min)
>     5.  A05 fix: Add helmet middleware + restrict CORS to `http://localhost:5173`
>     6.  A09 fix: Create `backend/utils/securityLogger.js` with structured JSON logging to stderr
>     7.  A verification checklist at the end
> 
> All code comments must start with `generated-by-copilot:` . Each template should include the npm install command if a new package is needed.

### Step 2.3 - Verify the Skill Loads

1.  Open any Chat session and click the **Tools** button (wrench icon).
2.  Scroll to find **security-fix** in the skills list.
3.  The description should match your SKILL.md frontmatter.

> **Alternatively**, if you prefer not to generate from scratch, the artifact is pre-built at `.github/skills/security-fix/SKILL.md`. Open it and review the templates.

---

## Exercise 3 - Add the Auth-Guard Hook (10 min)

**Objective:** Create a `PreToolUse` hook that intercepts file edits to auth middleware (`backend/routes/auth.js`, `backend/server.js`) and requires explicit user approval before the change proceeds. This prevents accidental or unauthorized modifications to authentication logic.

### Step 3.1 - Create the Hook Script

Create `.github/hooks/scripts/auth-guard.js`:

```javascript
// generated-by-copilot: PreToolUse hook - blocks writes to auth middleware without explicit user approval
// Protects backend/routes/auth.js and backend/server.js authenticateToken from accidental modification.
// Returns permissionDecision "ask" so the user must explicitly approve changes to auth code.
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

    // generated-by-copilot: only intercept file-edit tools
    const editTools = [
      'create_file',
      'replace_string_in_file',
      'multi_replace_string_in_file',
      'edit_file',
      'write_file',
    ];
    if (
      !editTools.some((t) => toolName.toLowerCase().includes(t.toLowerCase()))
    ) {
      process.stdout.write(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    // generated-by-copilot: extract tool_input, handling both object and JSON string forms
    let toolInput = input.tool_input || {};
    if (typeof toolInput === 'string') {
      try {
        toolInput = JSON.parse(toolInput);
      } catch (_) {
        toolInput = {};
      }
    }

    // generated-by-copilot: collect all file paths from the tool input
    const rawPaths = [
      toolInput.filePath,
      toolInput.path,
      toolInput.file_path,
      toolInput.filename,
      ...(Array.isArray(toolInput.replacements)
        ? toolInput.replacements.map((r) => r.filePath || r.path || '')
        : []),
    ].filter(Boolean);

    // generated-by-copilot: normalize Windows backslashes to forward slashes
    const normalizedPaths = rawPaths.map((p) => p.replace(/\\/g, '/'));

    // generated-by-copilot: protected auth files - any edit requires explicit user approval
    const authPatterns = [
      'backend/routes/auth.js',
      'backend/server.js',
    ];

    const blocked = normalizedPaths.find((filePath) =>
      authPatterns.some((pattern) => filePath.includes(pattern))
    );

    if (blocked) {
      // generated-by-copilot: check if the edit touches auth-related code
      const editContent = JSON.stringify(toolInput).toLowerCase();
      const authKeywords = [
        'authenticatetoken',
        'authenticate_token',
        'secret_key',
        'jwt_secret',
        'jwt.sign',
        'jwt.verify',
        'bcrypt',
        'password',
        'login',
        'register',
      ];
      const touchesAuth = authKeywords.some((kw) => editContent.includes(kw));

      if (touchesAuth) {
        process.stdout.write(
          JSON.stringify({
            hookSpecificOutput: {
              hookEventName: 'PreToolUse',
              permissionDecision: 'ask',
              permissionDecisionReason:
                `AUTH GUARD: This edit modifies authentication/authorization code in "${blocked}". ` +
                'Auth changes require explicit user approval. Review the change carefully before approving.',
            },
          })
        );
        process.exit(0);
      }
    }

    // generated-by-copilot: non-auth edit, allow
    process.stdout.write(JSON.stringify({ continue: true }));
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Auth guard hook error: ${err.message}\n`);
    process.exit(1);
  }
});
```

### Step 3.2 - Create the Hook Configuration

Create `.github/hooks/auth-guard.json`:

```
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "node .github/hooks/scripts/auth-guard.js",
        "timeout": 10
      }
    ]
  }
}
```

### Step 3.3 - Test the Hook

1.  Select the **Implementer** agent.
2.  Ask it to make a change to auth:

> "In backend/routes/auth.js, change the JWT expiry from '1h' to '30m'"

1.  **Expected behavior**: Before the edit tool executes, the hook fires and you see a prompt:

```
AUTH GUARD: This edit modifies authentication/authorization code in "backend/routes/auth.js".
Auth changes require explicit user approval. Review the change carefully before approving.
```

1.  You must click **Allow** or **Deny** - the agent cannot proceed without your decision.
2.  Click **Deny** to test the block, then **Allow** to confirm the hook lets approved changes through.

**Verify in the Output panel:**

*   Open **Output** → **GitHub Copilot Chat Hooks**
*   Look for `[PreToolUse] Running: {"command":"node .github/hooks/scripts/auth-guard.js"...}`
*   Confirm the `permissionDecision: "ask"` output

> **Key difference from Lab 02's security guard**: Lab 02's hook uses `permissionDecision: "deny"` to unconditionally block dangerous terminal commands. This hook uses `permissionDecision: "ask"` - it pauses and asks the user instead of outright blocking. This is appropriate for security fixes where the edit is intentional but must be reviewed.

### Step 3.4 - Understand the Three Permission Decisions

| Decision | Behavior | Use Case |
| --- | --- | --- |
| `continue: true` | Allow silently | Non-auth files, safe operations |
| `permissionDecision: "ask"` | Pause and prompt user | Auth file edits (this hook) |
| `permissionDecision: "deny"` | Block unconditionally | Destructive commands (Lab 02) |

---

## Exercise 4 - Run the Scanner and Open Fix PRs (20 min)

**Objective:** Run the OWASP Scanner to generate a findings report, then use the Coding Agent (or Implementer locally) to apply fixes from the security-fix skill and open PRs.

### Step 4.1 - Run the OWASP Scanner

1.  Select the **OWASP Scanner** agent from the Agents dropdown.
2.  Submit:

```
Scan the Book Favorites backend for OWASP Top 10 vulnerabilities. Check all route files, server.js, and utility files. Write the detailed findings report to reports/owasp-findings.md.
```

1.  The scanner will write the full report to `reports/owasp-findings.md` and display a summary in chat. You should see findings similar to:

| # | OWASP ID | Severity | File | Finding |
| --- | --- | --- | --- | --- |
| 1 | A02 | Critical | `server.js:11` | Hardcoded JWT secret `'your_jwt_secret'` |
| 2 | A02 | Critical | `routes/auth.js:14` | Plaintext password storage |
| 3 | A03 | High | `routes/auth.js:7` | No input validation on username/password |
| 4 | A04 | High | `routes/auth.js` | No rate limiting on login/register |
| 5 | A05 | Medium | `server.js:12` | Permissive CORS (`app.use(cors())`) |
| 6 | A05 | Medium | `server.js` | No Helmet security headers |
| 7 | A09 | Medium | `routes/auth.js` | No security event logging |

1.  **Verify the report file** - open `reports/owasp-findings.md` and confirm it contains the full Markdown report with Findings Summary table, Detailed Findings, and Compliance Score sections.

> **Why write to a file?** Persisting the report to `reports/owasp-findings.md` makes it available for the Implementer and Reviewer agents in later steps, survives chat session resets, and can be committed to the repo as an audit artifact.

### Step 4.2 - Apply Fixes Locally with the Implementer

1.  Click the **"Fix Security Findings"** handoff button (or switch to the Implementer agent manually).
2.  Submit:

```
Apply the OWASP security fixes using the security-fix skill (#skill:security-fix). Start with the Critical findings (A02), then High (A03, A04), then Medium (A05, A09). Install required npm packages. Run npm run test:backend after each fix to verify nothing breaks.
```

1.  **Watch for the auth-guard hook** - when the Implementer tries to edit `backend/routes/auth.js` or `backend/server.js`, you'll be prompted for approval:

```
AUTH GUARD: This edit modifies authentication/authorization code...
```

1.  Review each proposed change and click **Allow** to proceed.

> **Tip:** The auth-guard hook fires for each individual edit to auth files. You may see it 3-4 times during this exercise (bcrypt, env secret, input validation, rate limiter). This is intentional - each auth change gets individual review.

### Step 4.3 - Open Fix PRs with the Coding Agent (Optional)

If your repository is pushed to GitHub and you have the Coding Agent configured (Lab 07):

1.  Create a GitHub Issue for each fix category:

```
Title: Security: Fix OWASP A02 - Hash passwords and externalize JWT secret
Body: Apply bcrypt password hashing in backend/routes/auth.js and move SECRET_KEY to process.env.JWT_SECRET. Reference .github/skills/security-fix/SKILL.md for templates.
```

```
Title: Security: Fix OWASP A04+A05 - Add rate limiting, Helmet, and CORS hardening
Body: Install express-rate-limit and helmet. Apply rate limiter to /api/login and /api/register. Add helmet() middleware and restrict CORS origins. Reference .github/skills/security-fix/SKILL.md.
```

1.  Assign each issue to `@copilot`.
2.  Monitor the Actions workflow - the Coding Agent will read the skill templates and open draft PRs.
3.  Review the PRs and merge if the fixes look correct.

> **Why separate PRs?** Splitting security fixes by OWASP category keeps each PR focused and reviewable. The auth-guard hook also applies to the Coding Agent's ephemeral runner, so auth changes will require your review during the PR process.

---

## Exercise 5 - Re-Scan and Generate Compliance Report (10 min)

**Objective:** After fixes are applied, use the Reviewer agent to re-scan the codebase and produce a pass/fail compliance report.

### Step 5.1 - Re-Scan with the Reviewer

1.  From the Implementer's session, click the **"Review After Fixes"** handoff button (or switch to the **Reviewer** agent).
2.  Submit:

```
Re-scan the Book Favorites backend for the OWASP findings from the previous audit. For each finding, verify whether the fix was applied correctly. Produce a compliance report in this format:

| # | OWASP ID | Finding | Status | Evidence |
|---|----------|---------|--------|----------|
| 1 | A02 | Hardcoded JWT secret | ✅ PASS | SECRET_KEY loaded from process.env.JWT_SECRET |
| 2 | A02 | Plaintext passwords | ✅ PASS / ❌ FAIL | bcrypt.hash found in register route |
| ... | ... | ... | ... | ... |

End with: "Compliance Score: X/Y findings resolved"
```

### Step 5.2 - Verify Each Fix

The Reviewer should check:

| Finding | How to Verify |
| --- | --- |
| Hardcoded secret | `server.js` uses `process.env.JWT_SECRET` |
| Plaintext passwords | `auth.js` calls `bcrypt.hash()` on register, `bcrypt.compare()` on login |
| No input validation | `sanitize.js` exists and is imported in route handlers |
| No rate limiting | `express-rate-limit` configured for auth endpoints |
| Open CORS | `cors()` has `origin` restriction |
| No Helmet | `helmet()` middleware in `server.js` |
| No security logging | `securityLogger.js` exists and is called on login failure |

### Step 5.3 - Run the Full Test Suite

After all fixes, run:

```
npm run test:backend
```

All existing tests should still pass. If any tests fail due to the security changes (e.g., bcrypt making auth tests async), update the tests to match.

---

## Summary

In this lab you built a complete security hardening pipeline:

| Artifact | Location | Lab Tie-In |
| --- | --- | --- |
| OWASP Scanner agent | `.github/agents/OWASPScanner.agent.md` | Lab 01 (Custom Agents) |
| security-fix skill | `.github/skills/security-fix/SKILL.md` | Lab 03 (Skills) |
| auth-guard hook | `.github/hooks/auth-guard.json` + `scripts/auth-guard.js` | Lab 02 (Hooks) |
| Fix PRs via Coding Agent | GitHub Issues → `@copilot` | Lab 07 (Coding Agent) |
| Compliance report | Reviewer agent output | Lab 01 (Agents) |

### Key Concepts Reinforced

*   **Read-only agents** enforce audit integrity by restricting tools at the architecture level
*   **Skills** make remediation templates reusable and consistent across sessions
*   **PreToolUse hooks** with `permissionDecision: "ask"` create human-in-the-loop checkpoints for sensitive code
*   **Agent handoffs** chain Scanner → Implementer → Reviewer into a pipeline
*   **The Coding Agent** can consume skills and instructions to open security fix PRs autonomously

### Bonus Challenges

1.  **Add A06 - Vulnerable Components**: Add `npm audit --json` as a step in the OWASP Scanner's instructions and parse the output for known CVEs.
2.  **SessionStart context injection**: Create a `SessionStart` hook that automatically loads the latest OWASP scan results into the Implementer's context.
3.  **Compliance gate**: Create a `Stop` hook on the Reviewer agent that writes the compliance report to `reports/owasp-compliance.json` for CI/CD integration.
4.  **Expand to frontend**: Create a separate XSS Scanner agent that audits `frontend/src/` for `dangerouslySetInnerHTML`, unsanitized URL parameters, and missing CSP headers.