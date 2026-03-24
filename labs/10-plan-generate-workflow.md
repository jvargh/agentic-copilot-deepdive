# Lab 10 - Plan → Generate → Implement: PR-Based Agentic Workflows

> **Mode:** VS Code (Agent Mode)
> **Duration:** 45 minutes
> **Prerequisites:** Labs 00–01 completed (custom instructions, custom agents). Familiarity with prompt files (`.prompt.md`).

---

## Objective

Use the `/plan` and `/generate` slash commands to orchestrate a **model-tiered PR workflow**: a large model plans and decomposes work, then a smaller, faster model executes each task. This mirrors how production teams plan with senior engineers and delegate implementation to the broader team.

Each exercise teaches a different stage of the pipeline:

| Exercise | Skill | What You Learn |
| --- | --- | --- |
| 1 | **Create the `/plan` prompt file** | Build a reusable slash command that produces a structured plan markdown file |
| 2 | **Create the `/generate` prompt file** | Build a slash command that converts a plan into step-by-step implementation tasks |
| 3 | **Create the TaskRunner agent** | Build a custom agent optimized for executing small, focused tasks from an implementation file |
| 4 | **Run the full pipeline end-to-end** | Plan a feature with a large model, generate tasks, implement with a smaller model |

---

## How It Works

```
  /plan                        /generate                     Implementation Agent
  (Large model)                (Large model)                 (Smaller/faster model)
       │                            │                              │
       ▼                            ▼                              ▼
  ┌───────────┐              ┌─────────────────┐             ┌──────────────────┐
  │ plan.md   │─────────────>│implementation.md│────────────>│ Execute tasks    │
  │           │  feed plan   │                 │ feed tasks  │ 1 task = 1 commit│
  │ High-level│  into        │  Step-by-step   │ into agent  │ All under 1 PR   │
  │ strategy  │  /generate   │  atomic tasks   │             │ on 1 branch      │
  └───────────┘              └─────────────────┘             └──────────────────┘
```

**Why tier models?**

- **Planning** needs deep reasoning → use a large model (e.g., Claude Opus 4.6, Claude Sonnet 4.6)
- **Task decomposition** needs structured output → use a large model with the plan as context
- **Implementation** needs speed and volume → use a smaller, faster model (e.g., GPT-4o, GPT-5 mini) to execute each atomic task

This gives you the **quality of a large model's planning** with the **speed and cost efficiency of a smaller model's execution**.

---

## Prerequisites

| Requirement | Details |
| --- | --- |
| **VS Code** | Insiders or latest Stable with GitHub Copilot extension (Agent Mode enabled) |
| **GitHub Copilot** | Copilot Pro, Pro+, Business, or Enterprise subscription |
| **Workspace** | This repository cloned locally |
| **App running** | `npm install && npm start` in root - backend on :4000, frontend on :5173 |
| **Labs 00–01** | Completed - you should have `copilot-instructions.md` and familiarity with custom agents |

---

## Part 1 - Create the `/plan` Prompt File (10 min)

> **Concepts:** Prompt files (`.prompt.md`), slash commands, structured markdown output, model selection

The `/plan` command is a reusable slash command that produces a structured plan markdown file. You use it with a large model to do high-level reasoning about what needs to change, why, and in what order - without writing any code.

### Exercise 1.1 - Create the Plan Prompt File

1. Create the file `.github/prompts/plan.prompt.md`:

```markdown
---
agent: agent
description: "High-level planning for PR-based workflows."
---

You are a senior software architect creating a detailed implementation plan.

## Your Task

Analyze the user's request and produce a **plan.md** file in the workspace root with the following structure:

### Plan Structure

The plan.md file MUST include:

1. **Title** - A clear, descriptive title for the change
2. **Summary** - 2-3 sentence overview of what will be built and why
3. **Scope** - List of files and components that will be created or modified
4. **Architecture Decisions** - Key technical choices and their rationale
5. **Implementation Order** - Numbered list of steps in dependency order (what must be built first)
6. **Testing Strategy** - What tests are needed and how to validate
7. **Risks & Edge Cases** - Potential issues to watch for

### Rules

- Do NOT write any code - this is a planning document only
- Be specific about file paths, function names, and data structures
- Each implementation step should be small enough for a single focused commit
- Consider both frontend and backend implications
- Reference existing code patterns in the project when relevant

## Output

Create the file `plan.md` in the workspace root with the plan content.
```

2. **Verify:** Open the Chat view and type `/`. You should see `plan` appear in the slash command list with the description "High-level planning for PR-based workflows."

### Exercise 1.2 - Test the Plan Command

1. Open Copilot Chat in **Agent Mode**
2. Select a **large model** (e.g., Claude Opus 4.6 or Claude Sonnet 4.6) from the model picker
3. Submit the following prompt:

```
/plan Refactor the UI of this application to be more clean and modern
```

4. Copilot will analyze the codebase and produce a `plan.md` file
5. **Review the output:** Open `plan.md` and check that it contains:
   - A clear summary of UI changes
   - Specific file paths (e.g., `frontend/src/components/BookList.jsx`, `frontend/src/styles/`)
   - Implementation steps in dependency order
   - No actual code - just the plan

> **Tip:** The plan should reference existing components and styles in the project. If it hallucinates file paths that don't exist, refine the prompt to include `Check existing code context before planning.`

### Checkpoint

You now have a reusable `/plan` command that produces structured planning documents using a large model's reasoning capabilities.

---

## Part 2 - Create the `/generate` Prompt File (10 min)

> **Concepts:** Prompt files with file references, task decomposition, atomic commits, PR-oriented output

The `/generate` command takes a plan file and breaks it into **atomic implementation tasks**. Each task maps to a single commit, and all tasks together form one PR on one branch. This is the bridge between planning and execution.

### Exercise 2.1 - Create the Generate Prompt File

1. Create the file `.github/prompts/generate.prompt.md`. This prompt is designed to consume the **`plan.md`** file produced by the `/plan` command in Part 1:

```markdown
---
agent: agent
description: "Generates step-by-step implementation files from PR plans."
---

You are a senior developer converting a high-level plan into atomic implementation tasks.

## Your Task

Read the plan file provided by the user and produce an **implementation.md** file in the workspace root.

### Implementation File Structure

The implementation.md file MUST follow this exact format:

~~~~
# Implementation: [Title from plan]

## Branch: feature/[kebab-case-name]

## PR Description
[2-3 sentence summary for the PR body]

---

## Task 1: [Short descriptive title]
**Commit message:** `[conventional commit message]`
**Files:** [list of files to create or modify]

### Instructions
[Detailed, specific instructions for what to implement in this task. Include:]
- Exact function signatures or component props
- Data structures and types
- Import statements needed
- Integration points with existing code
- Expected behavior

### Acceptance Criteria
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

---

## Task 2: [Short descriptive title]
...
~~~~

### Rules

- Each task MUST be a single, focused commit - small enough to review in isolation
- Tasks MUST be ordered by dependency (foundational changes first)
- Every task must include specific file paths, not vague descriptions
- Include exact commit messages following conventional commits (feat:, fix:, test:, refactor:, style:)
- Backend tasks come before frontend tasks that depend on them
- Test tasks should follow immediately after the code they test
- The total set of tasks should form a **single PR on a single branch**
- Reference existing code patterns, variable names, and file structures from the project

### Task Sizing Guidelines

- **Too big:** "Implement the entire backend API" - break into individual routes
- **Just right:** "Add GET /api/books/:id endpoint with error handling"
- **Too small:** "Add an import statement" - combine with the code that uses it

## Output

Create the file `implementation.md` in the workspace root.
```

2. **Verify:** Type `/` in the Chat view - `generate` should appear in the slash command list.

### Exercise 2.2 - Test the Generate Command

1. Ensure your `plan.md` from Exercise 1.2 is still in the workspace root
2. In Copilot Chat (Agent Mode), with a **large model** selected, submit:

```
/generate #file:plan.md
```

3. Copilot reads the plan and produces `implementation.md`
4. **Review the output:** Open `implementation.md` and verify:
   - Each task has a clear commit message
   - Tasks are ordered by dependency
   - File paths are specific and reference real project files
   - Acceptance criteria are testable
   - All tasks together form one coherent PR

> **Key Insight:** The `/generate` command uses a large model because task decomposition requires understanding the full codebase and making architectural decisions about ordering. This is the "expensive thinking" step - and it only happens once per feature.

### Checkpoint

You now have a `/generate` command that converts plans into atomic, commit-sized implementation tasks - the input format your Implementation agent will consume.

---

## Part 3 - Create the Implementation Agent (10 min)

> **Concepts:** Custom agents (`.agent.md`), model selection, tool restrictions, focused execution

The Implementation agent is a **custom agent** designed to execute one task at a time from an implementation file. It uses a smaller, faster model because each task is already fully specified - no planning or architectural decisions needed, just execution.

### Exercise 3.1 - Create the TaskRunner Agent

1. Create the file `.github/agents/TaskRunner.agent.md`:

```markdown
---
name: "TaskRunner"
description: "Executes implementation tasks from a plan. Designed for use with GPT-4o or GPT-5 mini."
tools:
  - editor
  - terminal
  - file
---

You are a focused implementation agent. You execute specific, well-defined tasks from an implementation file.

## How You Work

1. The user provides an **implementation.md** file containing numbered tasks
2. You execute **one task at a time** when the user says "Do it" or specifies a task number
3. For each task, you:
   - Read the task instructions carefully
   - Implement exactly what is specified - no more, no less
   - Follow the file paths, function signatures, and patterns listed
   - Run any relevant tests after implementation
   - Report what you did and what the user should verify

## Rules

- Do NOT deviate from the task instructions - they were designed by a senior architect
- Do NOT refactor, optimize, or "improve" code beyond what the task specifies
- Do NOT skip ahead to future tasks or combine multiple tasks
- If a task's instructions are ambiguous, implement the most straightforward interpretation
- Follow the project's existing code patterns and conventions
- After each task, suggest the commit message from the implementation file

## After Each Task

Tell the user:
1. What files were created or modified
2. The suggested commit message
3. Whether tests pass (if applicable)
4. That they should review and commit before moving to the next task
```

2. **Verify:** Open the Chat view and click the agent/mode selector - `TaskRunner` should appear in the list.

3. **Kick off the agent:** Select `TaskRunner` from the agent/mode selector, then submit:

```
#file:implementation.md Do it
```

   The TaskRunner reads Task 1 from the implementation file and executes it. After it finishes, say `Next task` to continue to the next one.

### Exercise 3.2 - Understand the Model Tiering Strategy

The power of this workflow comes from using the **right model for each stage**:

| Stage | Slash Command / Agent | Recommended Model | Why |
| --- | --- | --- | --- |
| **Planning** | `/plan` | Claude Opus 4.6, Claude Sonnet 4.6 | Deep reasoning, architecture decisions, full codebase analysis |
| **Task Generation** | `/generate` | Claude Opus 4.6, Claude Sonnet 4.6 | Structured decomposition, dependency ordering, commit sizing |
| **Implementation** | `TaskRunner agent` | GPT-4o, GPT-5 mini | Fast execution of well-specified tasks, lower cost per task |

> **Cost / Speed Tradeoff:** The large model runs twice (plan + generate) but produces high-quality specifications. The smaller model runs many times (once per task) but each run is fast and cheap. Total quality stays high because the small model follows detailed instructions, not vague prompts.

### Checkpoint

You now have all three components: `/plan` for strategy, `/generate` for decomposition, and `TaskRunner` for execution.

---

## Part 4 - Run the Full Pipeline End-to-End (15 min)

> **Concepts:** Full agentic workflow, model switching, commit-per-task discipline, PR-oriented development

Now you will run the complete pipeline to implement a real feature for the Book Favorites app.

### Exercise 4.1 - Plan the Feature

1. Open Copilot Chat in **Agent Mode**
2. Select a **large model** (e.g., Claude Opus 4.6)
3. Submit:

```
/plan Add a "Reading Status" feature that lets users mark books as "Want to Read", "Currently Reading", or "Finished". Include a filter dropdown on the book list to view books by status, and a progress indicator showing how many books are in each status.
```

4. Review the generated `plan.md`:
   - Does it identify backend API changes (new endpoints or data fields)?
   - Does it identify frontend component changes?
   - Does it include a testing strategy?
   - Is the implementation order logical (backend before frontend)?

> **If the plan is missing something:** Simply prompt again: `/plan Revise plan.md to also include backend validation for invalid status values and a migration step for existing data.`

### Exercise 4.2 - Generate Implementation Tasks

1. Still using the **large model**, submit:

```
/generate #file:plan.md
```

2. Review `implementation.md`:
   - Count the tasks - a feature like this should have 4–8 tasks
   - Verify dependency order (e.g., backend data model before API routes before frontend components)
   - Check that commit messages follow conventional commits
   - Ensure acceptance criteria are specific and testable

**Example of well-sized tasks:**

| Task | Commit Message | Scope |
| --- | --- | --- |
| 1 | `feat: add reading status field to books data model` | `backend/data/books.json` |
| 2 | `feat: add PATCH /api/books/:id/status endpoint` | `backend/routes/books.js` |
| 3 | `test: add tests for reading status endpoint` | `backend/tests/books.test.js` |
| 4 | `feat: add ReadingStatus component with dropdown` | `frontend/src/components/ReadingStatus.jsx` |
| 5 | `feat: add status filter to BookList` | `frontend/src/components/BookList.jsx` |
| 6 | `feat: add reading progress indicator to header` | `frontend/src/components/Header.jsx` |
| 7 | `style: add reading status styles` | `frontend/src/styles/ReadingStatus.module.css` |

### Exercise 4.3 - Implement the Tasks

Choose **Option A** (recommended) to implement locally with the TaskRunner agent, or **Option B** to delegate to the Coding Agent on GitHub.

#### Option A: Local Implementation with TaskRunner Agent

1. **Switch to the TaskRunner agent**: Click the agent/mode selector and choose `TaskRunner`
2. **Switch to a smaller model**: Select a faster model (e.g., GPT-4o or GPT-5 mini) from the model picker
3. Attach the implementation file and start:

```
#file:implementation.md Do it
```

4. The TaskRunner agent reads Task 1 and executes it
5. **Review what it did** — check the files it created or modified
6. If satisfied, commit the changes with the suggested commit message:

```bash
git add . && git commit -m "feat: add reading status field to books data model"
```

7. **Continue to the next task**: In the same chat, say:

```
Next task
```

8. Repeat the review → commit → next cycle for each task

> **Why commit after each task?** Each task is designed as an atomic commit. This gives you:
> - A clean git history where each commit is reviewable in isolation
> - Easy rollback if a task produces incorrect results
> - A natural checkpoint to validate before moving on

#### Option B: Delegate to the Coding Agent via GitHub Issues

> **Prerequisite:** Your repository must be pushed to a remote on GitHub.com, and the Coding Agent must be enabled in your repo settings (Settings → Copilot → Coding agent).

1. **Push the implementation file** to your remote repository:

```bash
git add implementation.md && git commit -m "docs: add implementation plan for reading status feature"
git push
```

2. **Create issues from the tasks** using Copilot Chat on **GitHub.com** (or VS Code Agent Mode with the GitHub tools). Submit the following prompt:

```
In <your-username>/<your-repo>, read the file implementation.md in the repo root. For each task listed in the file, create a GitHub issue with the task title, instructions, acceptance criteria, and the commit message in the body. Then create a parent issue titled "Implement Reading Status Feature" that links to all the task issues as sub-issues. Assign the parent issue to Copilot.
```

3. Approve the GitHub tool calls as Copilot creates each issue
4. **Verify on GitHub.com:**
   - The parent issue exists with all task issues linked as sub-issues
   - The parent issue is assigned to `@copilot`
   - The 👀 reaction appears (confirms the Coding Agent picked it up)

5. **Assign Copilot as PR reviewer**: When the draft PR appears (~5–10 minutes), go to the PR sidebar → **Reviewers** → select **Copilot**

6. **Monitor and iterate**: Check the **Actions** tab for the workflow run, review the PR when it appears, and leave comments to refine (just like Lab 07)

> **When to use Option B:** Option B is ideal when you want to delegate implementation asynchronously and move on to other work. The Coding Agent reads the linked issues and implementation file, then generates a PR covering all tasks. You review and merge when ready.

### Exercise 4.4 - Validate the Feature

After completing all tasks:

1. **Run backend tests:**

```bash
npm run test:backend
```

2. **Start the app and test manually:**
   - Can you set a reading status on a book?
   - Does the filter dropdown work?
   - Does the progress indicator show correct counts?

3. **Review git log:**

```bash
git log --oneline -10
```

Verify that each commit maps to one task from `implementation.md`, and together they form a coherent feature.

### Checkpoint

You have implemented a complete feature using the Plan → Generate → Implement pipeline. The large model's planning produced well-structured tasks, and the smaller model executed them efficiently.

---

## Part 5 - Reflect and Extend (Optional)

### Why This Pattern Works

| Concern | How This Pipeline Addresses It |
| --- | --- |
| **Quality** | Claude Opus/Sonnet 4.6 does all the thinking - architecture, ordering, edge cases |
| **Speed** | GPT-4o executes fast - no wasted tokens on planning |
| **Cost** | 2 Claude calls + N GPT-4o calls is cheaper than N Claude Opus calls |
| **Reviewability** | Each commit is atomic and maps to a clear task description |
| **Iteration** | Revise the plan or regenerate tasks without rewriting code |
| **Team workflow** | `plan.md` can be reviewed by a human before any code is written |

### Try These Variations

- **Different feature:** Run `/plan` for adding a book rating system, dark mode, or user profiles
- **Plan review:** Share `plan.md` with a teammate (or the Reviewer agent from Lab 01) before running `/generate`
- **Partial implementation:** Run only Tasks 1–3 with the TaskRunner, then switch to Agent Mode for the rest
- **Coding Agent handoff:** Push `implementation.md` to GitHub and create an issue referencing the tasks - assign to Copilot Coding Agent for autonomous implementation

---

## Validation Checklist

| Check | Status |
| --- | --- |
| `/plan` prompt file created and appears in slash commands | ◻ |
| `/plan` produces a structured `plan.md` with all required sections | ◻ |
| `/generate` prompt file created and appears in slash commands | ◻ |
| `/generate #file:plan.md` produces `implementation.md` with atomic tasks | ◻ |
| `TaskRunner` agent created and appears in agent selector | ◻ |
| Tasks decomposed in correct dependency order | ◻ |
| Each task maps to a single commit with a conventional commit message | ◻ |
| Feature implemented task-by-task with smaller model | ◻ |
| Backend tests pass after implementation | ◻ |
| Git log shows clean, atomic commits matching the implementation tasks | ◻ |
