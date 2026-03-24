# Implementation: UI Refactor — Clean & Modern Book Favorites Interface

## Branch: feature/ui-refactor-css-modules

## PR Description

Refactors the Book Favorites frontend from inline styles and Vite boilerplate CSS into a cohesive design system using CSS Modules with CSS custom properties. Replaces all inline `style={{}}` objects with scoped CSS Module classes, enforces kebab-case naming, adds mobile-first responsive layouts, and introduces card-based visual consistency across all pages.

---

## Task 1: Establish design tokens and clean global CSS

**Commit message:** `style(frontend): add CSS custom properties and clean global reset`
**Files:** `frontend/src/styles/App.module.css`, `frontend/src/index.css`

### Instructions

- **`frontend/src/index.css`** — Replace the entire Vite boilerplate with a minimal CSS reset:

  ```css
  /* generated-by-copilot: minimal global reset — light theme base */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    color: #213547;
    background-color: #f7f7f7;
    min-width: 320px;
    min-height: 100vh;
  }
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  ```

  Remove all dark-mode `@media (prefers-color-scheme: dark)` rules, the `color-scheme: light dark` declaration, and the Vite dark background (`#242424`). Remove the global `button`, `a`, and `h1` style blocks.

- **`frontend/src/styles/App.module.css`** — Replace the entire file. Add a `:root` block with design tokens, then define scoped utility classes:

  ```css
  /* generated-by-copilot: design tokens and shared layout classes */
  :root {
    --color-primary: #20b2aa;
    --color-primary-hover: #178d8d;
    --color-surface: #ffffff;
    --color-background: #f7f7f7;
    --color-text: #213547;
    --color-text-muted: #555555;
    --color-text-light: #888888;
    --color-error: #dc3545;
    --color-success: #28a745;
    --color-favorite: #e25555;
    --color-shadow: rgba(0, 0, 0, 0.05);
    --color-shadow-hover: rgba(32, 178, 170, 0.15);
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 2.5rem;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 10px;
  }

  .page-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--spacing-xl);
    padding-top: 5rem; /* offset for fixed header */
    width: 100%;
    box-sizing: border-box;
  }
  ```

  Remove all bare element selectors (`body`, `h2`, `form`, `ul`, `input`, `button`) — those were global overrides that leak out of CSS Modules. The `.welcome` class is also removed (it moves to `Welcome.module.css`).

### Acceptance Criteria

- [ ] `index.css` contains no dark-mode rules, no `color-scheme` property, no Vite `#242424` background
- [ ] `index.css` sets `box-sizing: border-box` globally and light-theme body defaults
- [ ] `App.module.css` exports a `:root` block with all `--color-*`, `--spacing-*`, and `--radius-*` tokens
- [ ] `App.module.css` exports a `.page-container` class with max-width and header offset padding
- [ ] `App.module.css` has no bare element selectors (`body`, `h2`, `form`, `ul`, `input`, `button`)
- [ ] All comments start with `generated-by-copilot:`

---

## Task 2: Delete unused Vite boilerplate CSS

**Commit message:** `style(frontend): remove unused App.css Vite boilerplate`
**Files:** `frontend/src/App.css`

### Instructions

- Delete `frontend/src/App.css` entirely. This file contains unused Vite scaffold styles (`.logo`, `.card`, `.read-the-docs`, `#root` styling, `logo-spin` animation) that are never referenced by any component.

### Acceptance Criteria

- [ ] `frontend/src/App.css` no longer exists in the workspace
- [ ] No imports reference `./App.css` anywhere

---

## Task 3: Create Header CSS Module and refactor Header component

**Commit message:** `style(header): replace inline styles with CSS Module`
**Files:** `frontend/src/styles/Header.module.css` (create), `frontend/src/components/Header.jsx`

### Instructions

- **Create `frontend/src/styles/Header.module.css`** with these classes, using design tokens:
  - `.header` — `position: fixed; top: 0; left: 0; width: 100%; z-index: 100; background: var(--color-primary); color: var(--color-surface); min-height: 3.5rem; box-shadow: 0 2px 8px var(--color-shadow); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--spacing-xl); box-sizing: border-box;`
  - `.header-brand` — `font-weight: 700; font-size: 1.3rem; letter-spacing: 1px;`
  - `.header-nav` — `display: flex; align-items: center; gap: var(--spacing-lg);`
  - `.nav-links` — `display: flex; gap: var(--spacing-md);`
  - `.nav-link` — `color: var(--color-surface); text-decoration: none; font-weight: 500; padding: 0.3rem 0.8rem; border-radius: var(--radius-sm); transition: background 0.2s; background: none;`
  - `.nav-link:hover` — `background: rgba(255, 255, 255, 0.18);`
  - `.nav-link-active` — `background: rgba(255, 255, 255, 0.18);`
  - `.header-user` — `color: var(--color-surface); font-weight: 600; white-space: nowrap;`
  - `.logout-btn` — `padding: 0.3rem var(--spacing-md); font-size: 1rem; background: var(--color-surface); color: var(--color-primary); border: none; border-radius: var(--radius-sm); cursor: pointer;`

- **Refactor `frontend/src/components/Header.jsx`**:
  - Add import: `import { NavLink } from "react-router-dom";` (alongside existing `useNavigate`)
  - Add import: `import styles from "../styles/Header.module.css";`
  - Replace the `<header style={{...}}>` with `<header className={styles['header']}>`
  - Replace `<span style={{fontWeight...}}>Book Favorites</span>` with `<span className={styles['header-brand']}>Book Favorites</span>`
  - Wrap the nav + user info `<div>` with `className={styles['header-nav']}`
  - Replace `<a id="books-link" href="/books" onClick={...} style={{...}}>Books</a>` with:
    ```jsx
    <NavLink
      id="books-link"
      to="/books"
      className={({ isActive }) =>
        `${styles["nav-link"]} ${isActive ? styles["nav-link-active"] : ""}`
      }
    >
      Books
    </NavLink>
    ```
  - Replace `<a id="favorites-link" href="/favorites" onClick={...} style={{...}}>Favorites</a>` with:
    ```jsx
    <NavLink
      id="favorites-link"
      to="/favorites"
      className={({ isActive }) =>
        `${styles["nav-link"]} ${isActive ? styles["nav-link-active"] : ""}`
      }
    >
      Favorites
    </NavLink>
    ```
  - Replace user greeting `<span style={{...}}>Hi, {username}</span>` with `<span className={styles['header-user']}>Hi, {username}</span>`
  - Replace `<button id="logout" style={{...}}>` with `<button id="logout" className={styles['logout-btn']}`
  - Remove the `<nav style={{...}}>` inline styles, use `<nav className={styles['nav-links']}>`
  - Remove all remaining inline `style={{}}` objects

### Acceptance Criteria

- [ ] `Header.jsx` has zero inline `style={{}}` attributes
- [ ] `Header.jsx` imports `NavLink` from `react-router-dom` and uses it for Books/Favorites links
- [ ] `Header.jsx` imports and uses `styles` from `Header.module.css`
- [ ] All `id` attributes preserved: `books-link`, `favorites-link`, `logout`
- [ ] `Header.module.css` uses only CSS custom properties for colors and spacing (no hard-coded hex)
- [ ] Active nav link gets visual highlight via `NavLink` `isActive` prop
- [ ] All comments start with `generated-by-copilot:`

---

## Task 4: Create Welcome CSS Module and refactor Welcome component

**Commit message:** `style(welcome): replace inline styles with CSS Module`
**Files:** `frontend/src/styles/Welcome.module.css` (create), `frontend/src/components/Welcome.jsx`

### Instructions

- **Create `frontend/src/styles/Welcome.module.css`** with these classes:
  - `.welcome-container` — `display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; margin-top: 4rem;`
  - `.welcome-title` — `font-size: 2rem; color: var(--color-text); margin-bottom: var(--spacing-md);`
  - `.welcome-subtitle` — `font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: var(--spacing-xl);`
  - `.welcome-actions` — `display: flex; justify-content: center; gap: var(--spacing-lg); margin-top: var(--spacing-2xl);`
  - `.btn-primary` — `background: var(--color-primary); color: var(--color-surface); border: none; border-radius: var(--radius-sm); padding: 0.7rem 2.2rem; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 2px 8px var(--color-shadow-hover); transition: background 0.2s, transform 0.15s; text-decoration: none; display: inline-block;`
  - `.btn-primary:hover` — `background: var(--color-primary-hover);`
  - `.btn-outline` — `background: var(--color-surface); color: var(--color-primary); border: 2px solid var(--color-primary); border-radius: var(--radius-sm); padding: 0.7rem 2.2rem; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 2px 8px var(--color-shadow-hover); transition: background 0.2s, color 0.2s, transform 0.15s; text-decoration: none; display: inline-block;`
  - `.btn-outline:hover` — `background: var(--color-primary); color: var(--color-surface);`

- **Refactor `frontend/src/components/Welcome.jsx`**:
  - Replace `import styles from "../styles/App.module.css"` with `import styles from "../styles/Welcome.module.css"`
  - Replace root `<div className={styles.welcome} style={{...}}>` with `<div className={styles['welcome-container']}>`
  - Replace `<h1>` with `<h1 className={styles['welcome-title']}>`
  - Replace `<p>` with `<p className={styles['welcome-subtitle']}>`
  - Replace `<div style={{display:"flex"...}}>` with `<div className={styles['welcome-actions']}>`
  - Replace both `<Link>` wrapped `<button style={{...}}>` elements:
    - "Create Account": `<Link to="/register"><button className={styles['btn-primary']}>Create Account</button></Link>`
    - "Login": `<Link to="/login"><button className={styles['btn-outline']}>Login</button></Link>`
  - Remove all `onMouseOver`/`onMouseOut` handlers (hover is now CSS `:hover`)
  - Remove all inline `style={{}}` objects from `<Link>` wrappers (use `.btn-primary`/`.btn-outline` for text-decoration)
  - Remove all inline `style={{}}` objects from buttons

### Acceptance Criteria

- [ ] `Welcome.jsx` has zero inline `style={{}}` attributes
- [ ] `Welcome.jsx` has no `onMouseOver` or `onMouseOut` handlers
- [ ] `Welcome.jsx` imports from `Welcome.module.css`, not `App.module.css`
- [ ] `Welcome.module.css` uses CSS custom properties for all colors and spacing
- [ ] Hover states for both buttons are handled purely in CSS
- [ ] "Create Account" and "Login" buttons render and are clickable

---

## Task 5: Create Login CSS Module and refactor Login component

**Commit message:** `style(login): replace inline styles with CSS Module`
**Files:** `frontend/src/styles/Login.module.css` (create), `frontend/src/components/Login.jsx`

### Instructions

- **Create `frontend/src/styles/Login.module.css`** with these classes:
  - `.form-card` — `background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-md); max-width: 400px; margin: var(--spacing-xl) auto; box-shadow: 0 2px 8px var(--color-shadow);`
  - `.form-title` — `color: var(--color-text); margin-top: 4.5rem; text-align: center;`
  - `.form-input` — `display: block; width: 100%; margin: var(--spacing-md) 0; padding: var(--spacing-sm); font-size: 1rem; border: 1px solid #ccc; border-radius: var(--radius-sm); box-sizing: border-box;`
  - `.form-input:focus` — `outline: 2px solid var(--color-primary); border-color: var(--color-primary);`
  - `.form-btn` — `display: block; width: 100%; margin: var(--spacing-md) 0; padding: var(--spacing-sm); font-size: 1rem; background: var(--color-primary); color: var(--color-surface); border: none; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;`
  - `.form-btn:hover` — `background: var(--color-primary-hover);`
  - `.error-message` — `color: var(--color-error); text-align: center; margin: var(--spacing-sm) 0;`

- **Refactor `frontend/src/components/Login.jsx`**:
  - Add import: `import styles from "../styles/Login.module.css";`
  - Replace `<form>` with `<form onSubmit={handleSubmit} className={styles['form-card']}>`
  - Replace `<h2>Login</h2>` with `<h2 className={styles['form-title']}>Login</h2>`
  - Replace `{error && <div style={{ color: "red" }}>{error}</div>}` with `{error && <div className={styles['error-message']}>{error}</div>}`
  - Add `className={styles['form-input']}` to both `<input>` elements
  - Add `className={styles['form-btn']}` to `<button id="login">` (preserve the `id="login"`)

### Acceptance Criteria

- [ ] `Login.jsx` has zero inline `style={{}}` attributes
- [ ] `Login.jsx` imports from `Login.module.css`
- [ ] `button#login` element and `id="login"` preserved
- [ ] Error messages use `.error-message` class styled with `--color-error` token
- [ ] Form inputs have focus styling via CSS

---

## Task 6: Create Register CSS Module and refactor Register component

**Commit message:** `style(register): replace inline styles with CSS Module`
**Files:** `frontend/src/styles/Register.module.css` (create), `frontend/src/components/Register.jsx`

### Instructions

- **Create `frontend/src/styles/Register.module.css`** with these classes (mirroring Login for consistency):
  - `.form-card` — same as Login.module.css `.form-card`
  - `.form-title` — same as Login.module.css `.form-title`
  - `.form-input` — same as Login.module.css `.form-input`
  - `.form-input:focus` — same as Login.module.css `.form-input:focus`
  - `.form-btn` — same as Login.module.css `.form-btn`
  - `.form-btn:hover` — same as Login.module.css `.form-btn:hover`
  - `.error-message` — same as Login.module.css `.error-message`
  - `.success-message` — `color: var(--color-success); text-align: center; margin: var(--spacing-sm) 0;`

- **Refactor `frontend/src/components/Register.jsx`**:
  - Add import: `import styles from "../styles/Register.module.css";`
  - Replace `<form>` with `<form onSubmit={handleSubmit} className={styles['form-card']}>`
  - Replace `<h2>Register</h2>` with `<h2 className={styles['form-title']}>Register</h2>`
  - Replace `{error && <div style={{ color: "red" }}>{error}</div>}` with `{error && <div className={styles['error-message']}>{error}</div>}`
  - Replace `{success && <div style={{ color: "green" }}>{success}</div>}` with `{success && <div className={styles['success-message']}>{success}</div>}`
  - Add `className={styles['form-input']}` to both `<input>` elements
  - Add `className={styles['form-btn']}` to `<button id="register">` (preserve the `id="register"`)

### Acceptance Criteria

- [ ] `Register.jsx` has zero inline `style={{}}` attributes
- [ ] `Register.jsx` imports from `Register.module.css`
- [ ] `button#register` element and `id="register"` preserved
- [ ] Error messages use `--color-error`, success messages use `--color-success`
- [ ] Visual appearance matches Login form for consistency

---

## Task 7: Refactor BookList CSS Module to kebab-case with responsive grid

**Commit message:** `style(booklist): rename classes to kebab-case and add responsive grid`
**Files:** `frontend/src/styles/BookList.module.css`, `frontend/src/components/BookList.jsx`

### Instructions

- **`frontend/src/styles/BookList.module.css`** — Full rewrite:
  - Rename all classes from camelCase to kebab-case:
    - `.bookCardWithHeart` → `.book-card-with-heart`
    - `.favoriteHeart` → `.favorite-heart`
    - `.simpleBtn` → `.simple-btn`
    - `.heartBtn` → `.heart-btn`
    - `.bookGrid` → `.book-grid`
    - `.bookCard` → `.book-card`
    - `.bookTitle` → `.book-title`
    - `.bookAuthor` → `.book-author`
  - Remove the duplicate `.favoriteHeart` declaration (appears twice in current file)
  - Remove all `!important` declarations from `.heart-btn` focus/active states — use flat selectors instead:
    ```css
    /* generated-by-copilot: focus reset without !important */
    .heart-btn:focus,
    .heart-btn:focus-visible,
    .heart-btn:active {
      outline: none;
      box-shadow: none;
      background: none;
      border: none;
    }
    ```
  - Replace hard-coded colors with CSS custom properties:
    - `#fff` → `var(--color-surface)`
    - `#20b2aa` → `var(--color-primary)`
    - `#178d8d` → `var(--color-primary-hover)`
    - `#e25555` / `#e2555540` → `var(--color-favorite)` (and opacity variant where needed)
    - `#555` → `var(--color-text-muted)`
    - `#bbb` → `#bbb` (keep as-is for inactive heart stroke, or use a token if desired)
    - `rgba(0, 0, 0, 0.07)` → `var(--color-shadow)`
    - `rgba(32, 178, 170, 0.15)` → `var(--color-shadow-hover)`
  - Make `.book-grid` mobile-first:
    ```css
    .book-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0;
      width: 100%;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      box-sizing: border-box;
    }
    @media (min-width: 768px) {
      .book-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
    }
    @media (min-width: 1024px) {
      .book-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
    ```
  - Add an `.empty-state` class for the no-books fallback block:
    ```css
    .empty-state {
      background: var(--color-surface);
      padding: var(--spacing-xl);
      border-radius: var(--radius-md);
      max-width: 400px;
      margin: var(--spacing-xl) auto;
      box-shadow: 0 2px 8px var(--color-shadow);
      text-align: center;
      color: var(--color-text-light);
    }
    ```

- **`frontend/src/components/BookList.jsx`** — Update all class references:
  - `styles.bookGrid` → `styles['book-grid']`
  - `styles.bookCard` → `styles['book-card']`
  - `styles.bookTitle` → `styles['book-title']`
  - `styles.bookAuthor` → `styles['book-author']`
  - Replace the empty-state `<div style={{...}}>` with `<div className={styles['empty-state']}>`
  - Remove all inline `style={{}}` objects

### Acceptance Criteria

- [ ] `BookList.module.css` uses only kebab-case class names
- [ ] No duplicate `.favorite-heart` declarations
- [ ] Zero `!important` declarations in the file
- [ ] `.book-grid` uses mobile-first layout: 1 column default, auto-fill at 768px, wider at 1024px
- [ ] All hard-coded hex colors replaced with CSS custom properties
- [ ] `BookList.jsx` uses bracket notation for all kebab-case class references
- [ ] `BookList.jsx` has zero inline `style={{}}` attributes

---

## Task 8: Refactor ReadingListDropdown CSS Module to use design tokens

**Commit message:** `style(dropdown): replace hard-coded colors with design tokens`
**Files:** `frontend/src/styles/ReadingListDropdown.module.css`

### Instructions

- **`frontend/src/styles/ReadingListDropdown.module.css`** — Replace hard-coded colors:
  - `#e2555540` → use `var(--color-favorite)` with an adjusted filter (keep the `40` opacity inline since CSS custom properties don't natively support alpha modification, or keep as-is)
  - `#20b2aa` → `var(--color-primary)` in `.action-btn`
  - `#178d8d` → `var(--color-primary-hover)` in `.action-btn:hover`
  - `#e25555` fill/stroke values are in JSX (inline SVG), not CSS — leave them or note they could be tokenized later

### Acceptance Criteria

- [ ] `.action-btn` background uses `var(--color-primary)`
- [ ] `.action-btn:hover` background uses `var(--color-primary-hover)`
- [ ] No remaining `#20b2aa` or `#178d8d` hex values in the CSS file
- [ ] Existing class names preserved (already kebab-case)
- [ ] `ReadingListDropdown.jsx` requires no changes

---

## Task 9: Create Favorites CSS Module and refactor Favorites component

**Commit message:** `style(favorites): replace list with card grid layout`
**Files:** `frontend/src/styles/Favorites.module.css` (create), `frontend/src/components/Favorites.jsx`

### Instructions

- **Create `frontend/src/styles/Favorites.module.css`** with these classes:
  - `.favorites-container` — `max-width: 1400px; margin: 0 auto; width: 100%;`
  - `.favorites-title` — `color: var(--color-text); margin-top: 4.5rem; text-align: center;`
  - `.favorites-grid` — same grid pattern as BookList: `display: grid; grid-template-columns: 1fr; gap: var(--spacing-xl);` with `@media (min-width: 768px)` breakpoint for `repeat(auto-fill, minmax(260px, 1fr))`
  - `.favorite-card` — `background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: 0 2px 8px var(--color-shadow); padding: var(--spacing-lg) var(--spacing-md); display: flex; flex-direction: column; align-items: flex-start; min-height: 100px; transition: box-shadow 0.2s;`
  - `.favorite-card:hover` — `box-shadow: 0 4px 16px var(--color-shadow-hover);`
  - `.favorite-title` — `font-size: 1.1rem; font-weight: 600; margin-bottom: var(--spacing-sm); color: var(--color-primary);`
  - `.favorite-author` — `font-size: 0.98rem; color: var(--color-text-muted);`
  - `.empty-state` — same as BookList empty-state pattern
  - `.empty-state-link` — `color: var(--color-primary); text-decoration: underline;`

- **Refactor `frontend/src/components/Favorites.jsx`**:
  - Add import: `import styles from "../styles/Favorites.module.css";`
  - Replace root `<div>` with `<div className={styles['favorites-container']}>`
  - Replace `<h2>My Favorite Books</h2>` with `<h2 className={styles['favorites-title']}>My Favorite Books</h2>`
  - Replace `<div style={{...}}>` empty state block with `<div className={styles['empty-state']}>`
  - Replace the `<a href="/books" onClick={...}>book list</a>` with a `<Link>` or keep the `onClick` pattern but apply `className={styles['empty-state-link']}`
  - Replace `<ul>` + `<li>` list with a card grid:
    ```jsx
    <div className={styles["favorites-grid"]}>
      {favorites.map((book) => (
        <div className={styles["favorite-card"]} key={book.id}>
          <div className={styles["favorite-title"]}>{book.title}</div>
          <div className={styles["favorite-author"]}>by {book.author}</div>
        </div>
      ))}
    </div>
    ```
  - Remove all inline `style={{}}` objects

### Acceptance Criteria

- [ ] `Favorites.jsx` has zero inline `style={{}}` attributes
- [ ] Favorites renders as a responsive card grid, not a `<ul>/<li>` list
- [ ] `Favorites.module.css` uses CSS custom properties for all colors/spacing
- [ ] Empty state has styled card appearance with link to books page
- [ ] Visual card pattern is consistent with BookList cards
- [ ] Loading and error states remain functional

---

## Task 10: Update App.jsx layout wrapper and remove stale imports

**Commit message:** `refactor(app): add page-container layout and remove stale imports`
**Files:** `frontend/src/App.jsx`

### Instructions

- **`frontend/src/App.jsx`**:
  - Remove `import "./styles/App.module.css"` (side-effect import)
  - Add `import styles from "./styles/App.module.css"` (named import for `page-container` class)
  - Remove `import "./App.css"` if it wasn't already removed — the file was deleted in Task 2
  - Wrap `<Routes>` in `<main className={styles['page-container']}>`:
    ```jsx
    function App() {
      return (
        <Provider store={store}>
          <Router>
            <Header />
            <main className={styles["page-container"]}>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </Router>
        </Provider>
      );
    }
    ```

### Acceptance Criteria

- [ ] `App.jsx` imports `styles` from `App.module.css` as a named default import
- [ ] `App.jsx` does not import `./App.css`
- [ ] `<Routes>` is wrapped in `<main className={styles['page-container']}>`
- [ ] All existing routes and components preserved

---

## Task 11: Build validation

**Commit message:** `chore(frontend): verify build succeeds after UI refactor`
**Files:** none (verification only)

### Instructions

- Run `npm run build:frontend` from the workspace root
- Fix any import errors, missing class references, or build failures

### Acceptance Criteria

- [ ] `npm run build:frontend` exits with code 0
- [ ] No warnings about missing CSS Module imports

---

## Task 12: Run E2E tests

**Commit message:** `test(e2e): verify E2E tests pass after UI refactor`
**Files:** none (verification only)

### Instructions

- Run `npm run build:frontend && npm run test:frontend` from the workspace root
- Verify all three Cypress specs pass:
  1. "should allow a new user to register and login"
  2. "should show books and allow adding to favorites"
  3. "should logout and protect routes"
- If tests fail due to selector changes, verify that all critical `id` attributes are preserved: `#login`, `#register`, `#logout`, `#books-link`, `#favorites-link`

### Acceptance Criteria

- [ ] All E2E tests pass
- [ ] No Cypress selector regressions
- [ ] `#login`, `#register`, `#logout`, `#books-link`, `#favorites-link` IDs intact

---

## Task 13: Run backend tests as sanity check

**Commit message:** `test(backend): confirm no backend regressions`
**Files:** none (verification only)

### Instructions

- Run `npm run test:backend` from the workspace root
- Confirm all backend tests pass (no backend files were changed, this is a sanity check)

### Acceptance Criteria

- [ ] `npm run test:backend` exits with code 0
- [ ] All backend test suites pass
