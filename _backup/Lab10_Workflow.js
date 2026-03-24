// generated-by-copilot: Lab10 Workflow PPTX generator
// Run: npm install pptxgenjs && node _backup/Lab10_Workflow.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "GitHub Copilot";
pres.title = "Plan → Generate → Implement: PR-Based Agentic Workflows";

// --- Color palette: Midnight Executive ---
const NAVY = "1E2761";
const ICE_BLUE = "CADCFC";
const WHITE = "FFFFFF";
const LIGHT_BG = "F0F2F8";
const MUTED = "8B95A8";
const ACCENT = "3B82F6";

// --- Slide 1: Title ---
const slide1 = pres.addSlide();
slide1.background = { color: NAVY };
slide1.addText("Plan → Generate → Implement", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.2,
  fontSize: 40, fontFace: "Arial Black", color: WHITE, bold: true,
});
slide1.addText("PR-Based Agentic Workflows with Model Tiering", {
  x: 0.8, y: 2.5, w: 8.4, h: 0.8,
  fontSize: 20, fontFace: "Calibri", color: ICE_BLUE,
});
slide1.addText("Lab 10", {
  x: 0.8, y: 3.8, w: 2, h: 0.5,
  fontSize: 14, fontFace: "Calibri", color: MUTED,
});
slide1.addNotes(
  "Welcome to Lab 10. This is where we bring together everything you have learned about custom instructions, prompt files, and custom agents into one cohesive workflow.\n\n" +
  "The idea is straightforward: we use a large model to do the heavy thinking, the planning and task decomposition, and then hand off execution to a smaller, faster model. " +
  "If you think about how real engineering teams work, this is exactly the pattern. A senior engineer or architect designs the approach, breaks the work into well-scoped tickets, and then the broader team picks them up and executes.\n\n" +
  "What makes this powerful in a Copilot context is that we can encode this entire workflow into reusable prompt files and a custom agent. " +
  "So once you build it, you can use it over and over for any feature, any refactor, any PR. " +
  "The plan stays high-quality because a large model wrote it. The execution stays fast and cheap because a smaller model follows detailed, specific instructions.\n\n" +
  "By the end of this lab, you will have three reusable components: a /plan slash command, a /generate slash command, and a TaskRunner agent. Together they form a complete PR pipeline."
);

// --- Slide 2: How the Workflow Works ---
const slide2 = pres.addSlide();
slide2.background = { color: WHITE };

slide2.addText("How the Workflow Works", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true,
});

// Three-column layout for the pipeline stages
const colW = 2.6;
const colY = 1.5;
const colH = 2.8;
const stages = [
  { x: 0.6, title: "/plan", subtitle: "Large Model", desc: "Produces plan.md with architecture decisions, scope, and implementation order. No code written.", color: "0D9488" },
  { x: 3.7, title: "/generate", subtitle: "Large Model", desc: "Reads plan.md and produces implementation.md with atomic, commit-sized tasks in dependency order.", color: "2563EB" },
  { x: 6.8, title: "TaskRunner", subtitle: "Smaller Model", desc: "Executes one task at a time from implementation.md. Each task = one commit. All tasks = one PR.", color: "7C3AED" },
];

stages.forEach((s) => {
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: s.x, y: colY, w: colW, h: colH,
    fill: { color: LIGHT_BG },
  });
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: s.x, y: colY, w: colW, h: 0.06,
    fill: { color: s.color },
  });
  slide2.addText(s.title, {
    x: s.x + 0.2, y: colY + 0.2, w: colW - 0.4, h: 0.5,
    fontSize: 20, fontFace: "Arial Black", color: NAVY, bold: true,
  });
  slide2.addText(s.subtitle, {
    x: s.x + 0.2, y: colY + 0.7, w: colW - 0.4, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: MUTED, italic: true,
  });
  slide2.addText(s.desc, {
    x: s.x + 0.2, y: colY + 1.1, w: colW - 0.4, h: 1.5,
    fontSize: 13, fontFace: "Calibri", color: "333333", valign: "top",
  });
});

// Arrows between columns
const arrowY = colY + 1.3;
slide2.addText("→", { x: 3.25, y: arrowY, w: 0.4, h: 0.4, fontSize: 28, color: NAVY, align: "center" });
slide2.addText("→", { x: 6.35, y: arrowY, w: 0.4, h: 0.4, fontSize: 28, color: NAVY, align: "center" });

// Bottom summary
slide2.addText("Large model plans twice (quality) · Small model executes N times (speed & cost)", {
  x: 0.8, y: 4.7, w: 8.4, h: 0.5,
  fontSize: 12, fontFace: "Calibri", color: MUTED, italic: true, align: "center",
});

slide2.addNotes(
  "Let's walk through the three stages.\n\n" +
  "Stage one is /plan. This is a prompt file you create as a reusable slash command. When you invoke it, Copilot uses a large model, something like Claude Opus or Sonnet, to analyze your codebase and produce a plan.md file. " +
  "The plan includes the scope of changes, architecture decisions, implementation order, testing strategy, and edge cases. Crucially, it writes zero code. It is purely a thinking document. " +
  "This is where the expensive reasoning happens, and it only happens once per feature.\n\n" +
  "Stage two is /generate. This is another prompt file. You feed it the plan.md, and it produces implementation.md, a file containing numbered, atomic tasks. " +
  "Each task is sized for a single commit. Tasks are ordered by dependency, so backend changes come before the frontend code that depends on them. " +
  "Every task includes specific file paths, function signatures, commit messages following conventional commits, and testable acceptance criteria. " +
  "This is still using the large model because decomposing work correctly requires understanding the full codebase and making judgment calls about ordering and scope.\n\n" +
  "Stage three is the TaskRunner agent. This is a custom agent you create in .github/agents. You switch to a smaller, faster model like GPT-4o or GPT-5 mini, select the TaskRunner from the agent picker, and attach the implementation file. " +
  "The agent executes one task at a time. After each task, you review what it did, commit with the suggested message, and say 'Next task' to continue. " +
  "Because each task is already fully specified by the large model, the small model does not need to make architectural decisions. It just follows instructions. That is why it is fast and cheap.\n\n" +
  "The bottom line: you get two calls to an expensive model for planning, then N fast calls to a cheaper model for execution. Total quality stays high because the small model is following detailed specs, not vague prompts."
);

// --- Slide 3: Lab 10 Overview (white background, matching slide 2 style) ---
const slide3 = pres.addSlide();
slide3.background = { color: WHITE };

slide3.addText("Lab 10 — What You'll Build", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true,
});

const exercises = [
  { num: "1", title: "Create /plan prompt file", desc: "Reusable slash command → plan.md", color: "0D9488" },
  { num: "2", title: "Create /generate prompt file", desc: "Converts plan → implementation.md", color: "2563EB" },
  { num: "3", title: "Create TaskRunner agent", desc: "Focused agent for task execution", color: "7C3AED" },
  { num: "4", title: "Run the full pipeline", desc: "Plan → Generate → Implement a feature", color: ACCENT },
];

exercises.forEach((ex, i) => {
  const rowY = 1.3 + i * 0.85;
  const cardW = 8.4;
  // Card background
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: rowY, w: cardW, h: 0.7,
    fill: { color: LIGHT_BG },
  });
  // Left color accent bar
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: rowY, w: 0.06, h: 0.7,
    fill: { color: ex.color },
  });
  // Number circle
  slide3.addShape(pres.shapes.OVAL, {
    x: 1.1, y: rowY + 0.08, w: 0.5, h: 0.5,
    fill: { color: ex.color },
  });
  slide3.addText(ex.num, {
    x: 1.1, y: rowY + 0.08, w: 0.5, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: WHITE, bold: true, align: "center", valign: "middle",
  });
  // Title
  slide3.addText(ex.title, {
    x: 1.85, y: rowY, w: 3.8, h: 0.7,
    fontSize: 17, fontFace: "Calibri", color: NAVY, bold: true, valign: "middle",
  });
  // Description
  slide3.addText(ex.desc, {
    x: 5.8, y: rowY, w: 3.2, h: 0.7,
    fontSize: 13, fontFace: "Calibri", color: MUTED, valign: "middle",
  });
});

// Outcome callout
slide3.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 4.8, w: 8.4, h: 0.6,
  fill: { color: NAVY },
});
slide3.addText("Outcome: Implement a real feature with atomic commits, clean git history, and model-tiered efficiency", {
  x: 1.0, y: 4.8, w: 8.0, h: 0.6,
  fontSize: 13, fontFace: "Calibri", color: ICE_BLUE, valign: "middle",
});

slide3.addNotes(
  "Now let's look at what you will actually build in this lab.\n\n" +
  "Exercise 1 is about creating the /plan prompt file. This goes in .github/prompts/plan.prompt.md. " +
  "Once created, it shows up as a slash command in the Chat view. You type /plan followed by a description of what you want to build, and Copilot produces a structured plan.md file. " +
  "The prompt instructs the model to include a title, summary, scope, architecture decisions, implementation order, testing strategy, and risks. " +
  "The key rule is no code. This is a planning-only document. You test it by running something like '/plan Refactor the UI to be more clean and modern' and reviewing the output.\n\n" +
  "Exercise 2 creates the /generate prompt file at .github/prompts/generate.prompt.md. This one consumes the plan. " +
  "You run '/generate #file:plan.md' and it produces implementation.md with numbered tasks. Each task has a conventional commit message, specific file paths, detailed instructions, and acceptance criteria. " +
  "The sizing guidelines matter here: too big means 'implement the entire backend API', just right means 'add GET /api/books/:id endpoint with error handling', and too small means 'add an import statement' on its own.\n\n" +
  "Exercise 3 is where you create the TaskRunner agent at .github/agents/TaskRunner.agent.md. " +
  "This is a custom agent with restricted tools: just editor, terminal, and file. Its system prompt tells it to execute one task at a time, follow instructions exactly, not deviate or refactor beyond scope, and suggest the commit message after each task. " +
  "To kick it off, you select TaskRunner from the agent picker, switch to a smaller model, and submit '#file:implementation.md Do it'. After it completes a task, you review, commit, and say 'Next task'.\n\n" +
  "Exercise 4 brings it all together. You plan a Reading Status feature, generate implementation tasks, and then execute them one by one with the TaskRunner. " +
  "The feature adds status tracking for books: Want to Read, Currently Reading, and Finished. It includes backend data model changes, new API endpoints, frontend components, and styles. " +
  "There are two options for execution: Option A uses the TaskRunner locally, committing after each task. Option B pushes the implementation file to GitHub and creates issues that the Coding Agent picks up asynchronously. " +
  "Either way, by the end you should have a clean git log where each commit maps directly to one task from the implementation file, and together they form a single coherent feature."
);

// --- Write file ---
const outputPath = "_backup/Lab10_Workflow.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("Created: " + outputPath);
}).catch((err) => {
  console.error("Error:", err);
});
