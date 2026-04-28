# Book Favorites App

> [!NOTE]
> This is a demo repository to be used during the GitHub Copilot Agents and MCP training session.

## Features

### Application Features

#### Authentication & User Management
- **User Registration** — create a new account with a username and password via `POST /api/auth/register`
- **User Login** — authenticate with existing credentials and receive a JWT via `POST /api/auth/login`
- **User Logout** — clear the session token and return to the welcome page
- **JWT-based Auth** — tokens are issued on login, stored in `localStorage`, and sent as `Authorization: Bearer` headers on every protected request
- **Protected Routes** — `/books` and `/favorites` pages redirect unauthenticated users to the welcome page

#### Book Catalog
- **Browse Books** — view a curated catalog of 50 books via `GET /api/books`
- **Book Cards** — each book displays its title and author in a responsive card grid
- **Favorite Indicator** — books already in the user's favorites list display a filled heart (♥) icon

#### Favorites
- **Add to Favorites** — add a book to a personal favorites list via `POST /api/favorites`
- **View Favorites** — see all favorited books in a dedicated page via `GET /api/favorites`
- **Idempotent Add** — adding a book that is already a favorite is a no-op (no duplicates)
- **Empty State** — clear call-to-action when no favorites have been added yet

#### UI / UX
- **Responsive Layout** — CSS Modules with a card grid that adapts to desktop and mobile viewports
- **Navigation Header** — fixed top bar with **Books** and **Favorites** links, a greeting with the logged-in username, and a **Logout** button; links are hidden when the user is not logged in
- **Loading & Error States** — spinner/message shown while data is being fetched; error message shown on failure
- **Welcome Page** — landing page with links to **Login** and **Register** for unauthenticated visitors

### Backend API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-------------:|-------------|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `GET` | `/api/books` | No | Retrieve the full book catalog |
| `GET` | `/api/favorites` | Yes | Retrieve the authenticated user's favorites |
| `POST` | `/api/favorites` | Yes | Add a book to the authenticated user's favorites |

### Workshop / Labs Features

This repository doubles as the hands-on project for the **Agentic DevOps with GitHub Copilot** workshop. The following lab features are included:

| Lab | Feature |
|-----|---------|
| **Lab 00 — Custom Instructions** | `.instructions.md` files (stored in `.github/instructions/`) that teach Copilot project-specific coding standards and architecture rules |
| **Lab 01 — Custom Agents** | Specialist AI personas (Planner, Implementer, Reviewer) with tool restrictions and agent-handoff patterns |
| **Lab 02 — Agent Hooks** | Shell commands fired at agent lifecycle events (e.g. auto-format on save, security guard before destructive ops) |
| **Lab 03 — Agent Skills** | Reusable portable capabilities (Test Fixture Generator, Data Seeder) created with `/create-skill` |
| **Lab 04 — Build an MCP Server** | TypeScript MCP server scaffolded with MCP Builder, Zod-validated tools, and MCP Inspector integration |
| **Lab 05 — Exercise the MCP Server** | Using the MCP server to generate features from live book data and extend it with new tools |
| **Lab 06 — Agent Plugins** | Distributable plugin bundles combining instructions, agents, hooks, skills, and MCP servers via `plugin.json` |
| **Lab 07 — Coding Agent** | GitHub Copilot Coding Agent implementing features from GitHub Issues through the prompt-to-PR lifecycle |
| **Lab 08 — Greenfield Capstone** | Feature Flag Service built from scratch using agents, skills, hooks, and MCP servers from Labs 00–07 |
| **Lab 09 — Brownfield Capstone** | Full-stack Book Quotes feature delivered in a production sprint using all prior labs |
| **Lab 10 — Plan → Generate → Implement** | Model-tiered PR workflows using `/plan` and `/generate` slash commands |
| **Lab 11 — Security Hardening Sprint** | OWASP Scanner agent, security-fix skill, PreToolUse auth-guard hook, and automated fix PRs |

---

## Functional

Book Favorites is a full-stack web application that allows users to:
- Register for a new account or log in with existing credentials
- Browse a curated list of 50 books
- Add books from their personal favorites list
- View their favorite books in a dedicated section
- Enjoy a clean, modern, and responsive user interface
- Experience protected routes (only logged-in users can access book and favorites pages)

## Technical

- **Frontend:**
  - Built with React, Redux Toolkit, and React Router
  - Uses CSS Modules for modular, responsive, and modern styling
  - State management for user authentication, books, and favorites via Redux slices
  - JWT-based authentication; tokens are stored in localStorage and sent with API requests
  - Protected routes and navigation for a seamless UX

- **Backend:**
  - Node.js with Express.js for RESTful API endpoints
  - User authentication with JWT (JSON Web Tokens)
  - Data persistence using JSON files (`books.json` and `users.json`)
  - Modular route structure for authentication, books, and favorites
  - CORS enabled for frontend-backend communication

- **Other:**
  - Responsive design for desktop and mobile
  - Clear empty states and error handling
  - Modern UI/UX with attention to navigation and feedback

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```

2. **Install dependencies:**
  ```bash
    npm run install:all
  ```

3. **Run the app (backend + frontend):**
   ```bash
   npm start
   ```
   The backend runs on [http://localhost:4000](http://localhost:4000) and the frontend on [http://localhost:5173](http://localhost:5173)

4. **Run the tests (optional):**

   Open a second terminal.

   ```bash
   npm run test
   ```

   ![Tests execution logs example](./images/tests-execution-logs-example.png)

5. **Usage:**
   - Register a new account or log in with an existing one (`user1`/`user1`).
   - Browse books, add favorites, and enjoy the app!
