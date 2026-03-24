# UI Refactor: Clean & Modern Book Favorites Interface

## Summary

Refactor the Book Favorites application UI from a mix of inline styles and inconsistent CSS Modules into a cohesive, modern design system. The current codebase suffers from heavy inline `style={{}}` objects in most components, conflicting global CSS files, inconsistent naming conventions, missing responsive layouts, and no shared design tokens. This plan extracts all styles into proper CSS Modules with CSS custom properties, enforces kebab-case naming, removes conflicting boilerplate, and adds responsive/mobile-first layouts.

## Scope

### Files to Modify

| File | Change |
| --- | --- |
| `frontend/src/index.css` | Strip Vite dark-mode boilerplate; set clean light-theme base reset |
| `frontend/src/App.css` | Delete file (unused Vite boilerplate) |
| `frontend/src/App.jsx` | Remove `App.css` import; import `App.module.css` as styles; wrap routes in `<main>` with layout class |
| `frontend/src/styles/App.module.css` | Add CSS custom properties (`:root` design tokens); rewrite global form/heading overrides as scoped classes |
| `frontend/src/styles/BookList.module.css` | Rename camelCase classes to kebab-case; remove `!important`; remove duplicate `.favoriteHeart`; add responsive grid breakpoints |
| `frontend/src/styles/ReadingListDropdown.module.css` | Reference design tokens instead of hard-coded colors |
| `frontend/src/components/Header.jsx` | Replace all inline styles with CSS Module classes; use `NavLink` for active-link styling |
| `frontend/src/components/Welcome.jsx` | Replace inline styles with CSS Module classes |
| `frontend/src/components/Login.jsx` | Replace inline styles with CSS Module classes |
| `frontend/src/components/Register.jsx` | Replace inline styles with CSS Module classes |
| `frontend/src/components/Favorites.jsx` | Replace inline styles with CSS Module classes; render favorites as styled cards instead of `<ul>/<li>` |
| `frontend/src/components/BookList.jsx` | Update class references from camelCase to kebab-case to match renamed CSS |

### Files to Create

| File | Purpose |
| --- | --- |
| `frontend/src/styles/Header.module.css` | Scoped styles for header nav bar |
| `frontend/src/styles/Welcome.module.css` | Scoped styles for welcome/landing page |
| `frontend/src/styles/Login.module.css` | Scoped styles for login form |
| `frontend/src/styles/Register.module.css` | Scoped styles for register form |
| `frontend/src/styles/Favorites.module.css` | Scoped styles for favorites page & cards |

## Architecture Decisions

**CSS Custom Properties as design tokens** — Define `--color-primary`, `--color-primary-hover`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-error`, `--color-success`, `--color-shadow`, `--spacing-sm/md/lg/xl`, `--radius-sm/md` in `App.module.css` `:root` block. All modules reference these tokens, never hard-coded hex values. This follows the project's CSS instructions.

**CSS Modules for every component** — Every component gets its own `ComponentName.module.css` file. No inline `style={{}}` objects remain except for truly dynamic values (e.g., a computed width). This ensures styles are co-located, tree-shaken, and don't leak.

**kebab-case class names throughout** — Rename `.bookCard` → `.book-card`, `.bookTitle` → `.book-title`, `.bookAuthor` → `.book-author`, `.bookGrid` → `.book-grid`, `.simpleBtn` → `.simple-btn`, `.heartBtn` → `.heart-btn` etc. Access via `styles['book-card']` in JSX. This aligns with the CSS instructions that mandate kebab-case.

**NavLink for active route highlighting** — Replace the current `window.location.pathname` check in Header with React Router's `<NavLink>` component, which provides an `isActive` prop for proper SPA-aware active-link styling.

**Mobile-first responsive grid** — The book grid defaults to single-column layout and expands via `min-width` media queries at 768px and 1024px breakpoints.

**Remove conflicting global CSS** — `index.css` currently has dark-mode defaults that fight with `App.module.css` (light theme). Strip it down to a minimal CSS reset. Delete `App.css` (unused boilerplate from Vite scaffold).

**Favorites page gets card layout** — Instead of a bare `<ul>`, favorites will reuse the same card visual pattern as the book list for visual consistency.

## Implementation Order

### Step 1: Establish design tokens and clean global CSS

*   `**frontend/src/styles/App.module.css**` — Add `:root` block with all CSS custom properties (colors, spacing, radii, shadows). Remove the bare `body`, `h2`, `form`, `ul`, `input`, `button` selectors and convert them into scoped utility classes (`.page-container`, `.form-card`, `.section-heading`).
*   `**frontend/src/index.css**` — Replace Vite boilerplate with minimal reset: `box-sizing: border-box`, `margin: 0`, light background, system font stack, no dark-mode overrides.
*   `**frontend/src/App.css**` — Delete this file entirely (contains unused `.logo`, `.card`, `.read-the-docs` from Vite scaffold).

### Step 2: Create Header CSS Module and refactor Header component

*   **Create** `**frontend/src/styles/Header.module.css**` — Classes: `.header`, `.header-brand`, `.header-nav`, `.nav-link`, `.nav-link-active`, `.header-user`, `.logout-btn`. Use design tokens for colors and spacing. Fixed position, flex layout.
*   `**frontend/src/components/Header.jsx**` — Remove all inline `style={{}}`. Import `styles` from `Header.module.css`. Replace `<a>` tags with `<NavLink>` from `react-router-dom` for active-link styling. Apply CSS Module classes.

### Step 3: Create Welcome CSS Module and refactor Welcome component

*   **Create** `**frontend/src/styles/Welcome.module.css**` — Classes: `.welcome-container`, `.welcome-title`, `.welcome-subtitle`, `.welcome-actions`, `.btn-primary`, `.btn-outline`. Centered layout, spacing, responsive text sizing.
*   `**frontend/src/components/Welcome.jsx**` — Remove all inline styles and `onMouseOver/onMouseOut` handlers (use CSS `:hover` instead). Import and apply Welcome CSS Module classes.

### Step 4: Create auth form CSS Modules and refactor Login & Register

*   **Create** `**frontend/src/styles/Login.module.css**` — Classes: `.form-card`, `.form-title`, `.form-input`, `.form-btn`, `.error-message`. Card layout with shadow, spacing, rounded corners.
*   **Create** `**frontend/src/styles/Register.module.css**` — Classes: `.form-card`, `.form-title`, `.form-input`, `.form-btn`, `.error-message`, `.success-message`. Same pattern as Login for visual consistency.
*   `**frontend/src/components/Login.jsx**` — Remove inline error style. Import Login CSS Module. Apply form classes to `<form>`, `<input>`, `<button>`, error `<div>`.
*   `**frontend/src/components/Register.jsx**` — Same treatment. Import Register CSS Module. Apply classes.

### Step 5: Refactor BookList CSS Module (kebab-case, responsive, no `!important`)

*   `**frontend/src/styles/BookList.module.css**` — Rename all camelCase classes to kebab-case. Remove duplicate `.favoriteHeart` declaration. Remove all `!important` declarations on `.heart-btn` focus states (flatten specificity instead). Add mobile-first breakpoints for `.book-grid`: 1 column default → `min-width: 768px` auto-fill → `min-width: 1024px` wider minmax. Replace hard-coded colors with custom properties.
*   `**frontend/src/components/BookList.jsx**` — Update all `styles.bookGrid` → `styles['book-grid']`, `styles.bookCard` → `styles['book-card']`, `styles.bookTitle` → `styles['book-title']`, `styles.bookAuthor` → `styles['book-author']`. Remove inline style objects from the empty-state div and use a CSS class instead.

### Step 6: Refactor ReadingListDropdown CSS Module

*   `**frontend/src/styles/ReadingListDropdown.module.css**` — Replace `#20b2aa` / `#178d8d` / `#e25555` with `var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-favorite)` tokens.

### Step 7: Create Favorites CSS Module and refactor Favorites component

*   **Create** `**frontend/src/styles/Favorites.module.css**` — Classes: `.favorites-container`, `.favorites-grid`, `.favorite-card`, `.favorite-title`, `.favorite-author`, `.empty-state`, `.empty-state-link`. Card grid layout matching the book list pattern (visual consistency).
*   `**frontend/src/components/Favorites.jsx**` — Replace `<ul>/<li>` with a card grid. Remove all inline styles. Import Favorites CSS Module. Add CSS class for the empty-state block.

### Step 8: Update App.jsx layout wrapper

*   `**frontend/src/App.jsx**` — Remove `import "./styles/App.module.css"` (side-effect import) → change to `import styles from "./styles/App.module.css"`. Remove `import "./App.css"`. Wrap `<Routes>` in a `<main className={styles['page-container']}>` for consistent page padding and max-width.

### Step 9: Verify and test

*   Run `npm run build:frontend` to confirm no broken imports or class references.
*   Run `npm run build:frontend && npm run test:frontend` to validate E2E tests still pass.
*   Visually verify each page: Welcome, Login, Register, Books, Favorites.

## Testing Strategy

1.  **Build validation** — `npm run build:frontend` must succeed with zero errors.
2.  **E2E tests** — `npm run build:frontend && npm run test:frontend` — existing Cypress specs in `frontend/cypress/e2e/book_favorites.cy.js` exercise login, book listing, and favorites flows. These must continue to pass. Key selectors to preserve: `#login`, `#register`, `#logout`, `#books-link`, `#favorites-link`.
3.  **Manual visual review** — Each page (Welcome, Login, Register, Books, Favorites) should be checked for:
    *   Consistent color palette (teal primary, proper hover states)
    *   Card-based layout for books and favorites
    *   Responsive behavior at 320px, 768px, and 1024px+ widths
    *   Fixed header with proper nav highlighting
4.  **Backend tests** — `npm run test:backend` as a sanity check (no backend changes planned, but confirms nothing was inadvertently broken).

## Risks & Edge Cases

| Risk | Mitigation |
| --- | --- |
| **Cypress selectors break** | Preserve all existing `id` attributes (`#login`, `#register`, `#logout`, `#books-link`, `#favorites-link`). Do not change element hierarchy that Cypress relies on. |
| **CSS specificity regressions** | Removing `!important` from BookList may cause focus-ring styles to resurface. Test `:focus` and `:active` states on heart button after removal. Use `:focus-visible` for accessibility-compliant focus rings. |
| **Dark-mode conflict in index.css** | The current `index.css` has `prefers-color-scheme` media queries. Removing them keeps the app light-only. If dark mode is desired later, it should be implemented as a deliberate feature, not a side effect of Vite defaults. |
| **CSS Module bracket access (**`**styles['kebab-case']**`**)** | Some developers prefer dot access. kebab-case is mandated by project instructions, so bracket notation is the cost. Consistent usage across all components avoids confusion. |
| **Inline styles removed from Welcome hover** | JavaScript `onMouseOver/onMouseOut` handlers currently handle hover state. Replacing with CSS `:hover` is cleaner and more reliable but requires verifying the button is not dynamically styled elsewhere. |
| **Missing fonts or icon library** | Current design uses no icon library beyond inline SVGs. No new dependencies are needed. The system font stack in `index.css` is sufficient. |