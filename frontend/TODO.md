# TODO - Theme/UX unification for GazaBridge (Navbar/Footer + all pages)

## Step 1: Inventory
- [ ] Find all places in `src/pages` and `src/components` that hardcode colors (hex like `#808000`, `emerald`, `teal`, etc.)
- [ ] Find any global styles/theme configuration (Tailwind config, css files, fonts)
- [ ] Identify public vs dashboard/admin layouts (`App.jsx` + `DashboardLayout.jsx` + `HeaderBar/Sidebar`)

## Step 2: Define theme tokens
- [ ] Create centralized theme tokens (either CSS variables or JS constants) for:
  - Olive primary `#808000`
  - Background cream `#F5F3EA` / `#FAF3E8`
  - Accent `#C26100` / `#E07A1B`
  - Text and muted grays
- [ ] Ensure consistency of typography: `DM Sans` and `Instrument Serif`

## Step 3: Apply across UI
- [ ] Update `src/components/*` (non-layout) to use theme tokens
- [x] Update `src/pages/*` to remove conflicting emerald/teal/cyan palettes and replace with olive/cream/orange (started with `Blog.jsx`)

- [ ] Update `components/layout/*` (HeaderBar/Sidebar/DashboardLayout/AdminSidebar) to match theme

## Step 4: Layout & visibility consistency
- [ ] Keep the existing logic in `App.jsx` for showing Navbar/Footer on public pages
- [ ] Ensure Footer exceptions (e.g. `/chat`) remain intact

## Step 5: Build & verify
- [x] Run frontend build (and dev if needed)
- [ ] Fix any import/JSX errors caused by refactors
- [ ] Smoke-test key routes: `/`, `/how-it-works`, `/services`, `/faq`, `/about`, `/mission`, `/blog`, `/blog/:slug`, `/chat`, `/dashboard`


