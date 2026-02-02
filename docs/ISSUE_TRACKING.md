# ISSUE TRACKING - Scheme Mapping System

This file tracks the implementation status of features defined in the PRD (`docs/prd.md`).

## 1. COMPLETED TASKS ✅
- **Authentication (3.1)**: JWT-based login/logout implemented with HTTP-only cookies.
- **User Management (PRD 4.75)**: Implemented management interface for system administrators with role-based badges and audit logging. Refactored to use `react-hook-form` and `zod` for consistent validation. User deletion is restricted to 'Viewer' accounts only, with self-deletion and admin-deletion disabled for security.
- **Bulk User Deletion**: Added functionality for admins to delete all 'Viewer' accounts in a single action, complete with audit logging and confirmation dialogs.
- **Departments Module (3.3)**: Listing of 95 departments with pagination (25/page) and debounced search.
- **Scheme Management (3.4)**: Strict 8-column table with search, department filtering, and server-side Excel export for handling large datasets.
- **Category Management (3.5)**: API and UI for managing budget categories (Child, Gender, Green) and their parts.
- **Scheme → Category Mapping (3.6)**: Interface to map schemes to multiple categories with part selection.
- **Mapping Progress (3.2)**: Dashboard shows mapping progress and recent activity.
- **Dashboard Budget Overview (3.2)**: Integrated real-time budget sums and utilization progress bars.
- **Department Detail View (3.3)**: Dedicated detail pages for departments with scheme-wise financial breakdown.
- **Audit Log UI (3.2, 9.280)**: Full activity log interface with filtering and user attribution.
- **Dashboard Visualization (PRD 3.2)**: Added interactive Bar and Pie charts using `recharts` for budget vs expenditure analysis by department and category.
- **Enhanced Mapping & Category Insights**: 
    - Implemented real-time category filtering and searching on the Mapping page.
    - Added "Category Detail Modal" to browse all schemes within a category with internal searching.
    - Displaying assigned category badges directly on scheme cards for immediate visibility.
    - Added "View Schemes" functionality to the Category management page.
- **Role-Based Access Control (RBAC)**: Implemented a robust RBAC system with 'ADMIN' and 'VIEWER' roles. Admin-only actions and navigation are hidden from viewers, and all administrative API routes are protected server-side.
- **Enhanced Category Insights**: Upgraded the Categories module with a paginated "View Schemes" detail modal, including search functionality and i18n support.
- **Bilingual Support (PRD 2.22, 7.172, 9.282)**: Full localization for Hindi/English across all modules (Dashboard, Departments, Schemes, Categories, Mappings, Audit Logs, Login).
- **System Settings (PRD 4.75)**: Global configuration for fiscal year selection, system-wide constants, and maintenance mode. Fully implemented with localized system names and integrated into audit logs.
- **Enhanced Dashboard UI (PRD 7.187)**: Simplified the global footer to show only the copyright and "System Live" status, ensuring a cleaner look across the project.
- **Mobile UI Optimization (PRD 7.169)**: Implemented responsive "Stacked Card View" for all major data tables (Schemes, Departments, Audit Logs, Categories) to ensure usability on mobile devices.
- **Bulk Import/Export (Schemes)**: Replaced the "Add Scheme" button with a comprehensive "Bulk Import/Export" feature. 
    - Implemented a responsive modal with options to Import/Export schemes.
    - Provided a downloadable 8-column CSV template for data preparation.
    - Built a robust CSV import flow with validation for mandatory columns, data types, and department selection.
    - Implemented server-side CSV export in the required 8-column format.
    - Integrated with RTK Query and added full bilingual (EN/HI) translation support.
- **Recent Refinements**: 
  - **User Management**: Restricted user deletion to 'Viewer' accounts only and implemented a "Delete All Viewers" bulk action. Self-deletion and admin-account deletion are strictly prohibited at both the UI and API levels.
  - **Scheme Data Management**: Migrated from manual "Add Scheme" entry to a high-efficiency bulk import/export system to streamline data entry for large datasets.
  - **RBAC & API Security**: Secured all administrative endpoints and implemented navigation filtering based on user roles.
  - **Pagination & Search**: Added paginated scheme listings in the Category detail view.
  - **Mapping Filter Refinement**: Replaced category filters with department-based filtering on the mapping page and implemented dynamic scheme fetching.
   - **UI Simplification**: Removed the bulk export button from the Schemes page to streamline the interface.
   - **Single Scheme Export**: Implemented individual scheme export functionality with indigo branding and bilingual toast notifications.
   - **Bug Fixes**: Resolved critical linter errors by correctly exporting and importing `useGetMeQuery` across dashboard pages.
  - Fixed stale dashboard translation keys, localized audit log action labels, and resolved fatal Turbopack errors by disabling `reactCompiler` and migrating `middleware.ts` to `proxy.ts` per Next.js 16 conventions.
- **Code Cleanup & Bug Fixes**: 
  - Fixed `(prisma.auditLog as any)` and `(prisma.setting as any)` casts across all API routes (`settings`, `stats`, `audit-logs`, `categories`, `departments`, `schemes`, `mappings`).
  - Fixed missing `useGetMeQuery` exports and imports in `DepartmentsPage`, `SchemesPage`, and `CategoriesPage`.
  - Fixed session type error in `users` API route by correctly accessing `session.id`.
  - Removed unused imports and variables in `Dashboard` page.
  - Replaced hardcoded JWT secret with environment variable in `auth.ts`.
  - Removed debug console logs from `proxy.ts`.
  - Cleaned up mock data in dashboard `stats` API to use real budget sums from categories.
  - Verified and preserved obsolete files as per project requirements.
- **Server-side Excel Export (PRD 6.158)**: Migrated Excel generation to the server for Schemes and Audit Logs modules to support high-volume data exports efficiently.
- **Mock Data Seeding**: Populated the entire system with comprehensive mock data from `docs/mock-data.json`. Updated `prisma/seed.js` with robust relational mapping and idempotent `upsert` logic to ensure a consistent development environment.
- **Type Safety & Error Prevention**: Implemented `Number()` wrapping and null-safety checks across all `.toFixed()` operations in the dashboard, schemes, and department views to prevent runtime `TypeError`s.
- **Tech Stack Setup (2.0)**: Next.js 14, Tailwind, Prisma, PostgreSQL, Redux Toolkit, and RTK Query integrated.

- **UI/UX Responsiveness & Dark Mode (PRD 7.169)**: Fixed multiple responsiveness issues across all breakpoints (mobile, tablet, desktop). Elements like boxes, labels, text, and buttons are now properly aligned and contained. Fixed dark-mode hover contrast issues where item backgrounds would turn white, making text unreadable.
- **Global Branding & Logo Replacement**: Replaced all company logos with the official `logo.jpeg`. Updated the login page, sidebar, and mobile navigation with the new branding. Integrated the logo into the site metadata as the favicon/icon for a consistent professional look.

---

## 2. REMAINING TASKS ⏳

---

## 3. DEVELOPMENT BLOG 📝

### 2026-01-24: Login Page & Middleware Fixes
- **Login Page Restoration**: Fixed the login page by restoring its styling and functionality. Added modern Tailwind UI with Lucide icons and improved the redirect logic using `next-intl`'s router.
- **Middleware Standardization**: Restored `src/middleware.ts` from the non-standard `src/proxy.ts` location, ensuring Next.js correctly identifies and executes the auth/i18n middleware.
- **CSS Architecture**: Corrected the location of `globals.css` by moving it to `src/app/globals.css` and updating the root layout imports to ensure styles are loaded globally.
- **Security Update**: Updated the database seed script to properly hash the default admin password using `bcryptjs`, fixing the "Invalid email or password" error caused by plain-text password comparison.
- **Infinite Reload Fix**: Resolved an infinite redirect loop in the middleware by ensuring invalid sessions are cleared and by respecting `next-intl`'s internal redirects before applying custom auth logic. Refined path matching to handle trailing slashes and locale prefixes more accurately.
- **Middleware Refactoring**: Fixed a `SyntaxError` caused by duplicate variable declarations and renamed `middleware.ts` to `proxy.ts` to comply with the environment's deprecated middleware convention.
- **Import Resolution**: Fixed a `Cannot find module '@/lib/auth'` linter error in `proxy.ts` by switching to relative imports, ensuring compatibility with the Edge Runtime.
- **Redirect Loop & Panic Fix**: Stabilized the middleware/proxy logic with improved path detection and added debug logging to track authentication flow. This prevents infinite reload loops and potential Turbopack panics during route resolution.
- **Login Loop Final Fix**: Configured session cookies with `path: '/'` and relaxed `secure` constraints to ensure persistent authentication on local/HTTP environments. This resolves the issue where the admin user was repeatedly redirected to login.
- **Code Cleanup**: Removed unused authentication functions (`login`, `logout`, `updateSession`) from `src/lib/auth.ts` to reduce technical debt.
- **UI Diagnostics**: Fixed Tailwind CSS class warnings in `Charts.tsx` by replacing arbitrary height values with standard scale classes (`h-75`).

### 2026-01-24: System Stability, Visualization & Refinement
- **Turbopack Fixes**: Resolved a fatal Turbopack panic by disabling the `reactCompiler` in `next.config.ts`.
- **Middleware Migration**: Migrated `src/middleware.ts` to `src/proxy.ts` to align with Next.js 16's new file convention and resolved deprecation warnings.
- **Dependency Cleanup**: Updated `package.json` to remove obsolete `--webpack` flags from the dev script, ensuring full compatibility with the Turbopack engine.
- **Dashboard Visualization**: Integrated `recharts` to provide interactive data visualization. Added a Bar Chart for Top Departments (Budget vs Spent) and a Pie Chart for Budget Distribution by Category. Updated the `dashboard/stats` API to provide aggregated data for these charts.
- **Server-side Excel Export**: Implemented server-side Excel generation for the Schemes and Audit Logs modules using the `xlsx` library. This move from client-side to server-side improves performance and ensures consistent behavior across different browsers and devices when handling large datasets.
- **Form Validation & UI Refinement**: Refactored Users, Schemes, Departments, and Categories modules to use `react-hook-form` and `zod` for consistent client-side validation. Improved the Mappings page's mobile responsiveness and added structured Fiscal Year selection in System Settings.
- **Comprehensive Code Cleanup**: 
  - Audited all API routes to remove redundant `(prisma as any)` casts, improving type safety.
  - Fixed a critical session type error in the Users management API.
  - Secured the JWT authentication flow by moving the secret key to environment variables.
  - Removed debug logs and unused imports across the dashboard and middleware.
  - Replaced mock budget distribution data with real real-time calculations from category mappings.
  - Maintained project integrity by preserving legacy files required for future reference.

### 2026-01-29: User Management & Scheme Access Refinement
- **Cascading Deletion Fix**: Resolved the "Failed to delete viewers" error by adding `onDelete: Cascade` to the `AuditLog` relation in the Prisma schema. This ensures user records can be deleted without violating foreign key constraints in the audit logs.
- **Enhanced Admin Permissions**: Updated user deletion logic to allow administrators to delete any account (including other admins) except their own. Removed the 'VIEWER'-only restriction for deletion.
- **Restricted Scheme Creation**: Removed the "Add Scheme" functionality for non-admin users. 
    - Hidden the "Add Scheme" button on the Schemes page for 'VIEWER' accounts.
    - Restricted access to the scheme creation dialog.
    - Removed selection checkboxes and bulk actions for viewers to simplify the read-only interface.
- **Backend Role Enforcement**: Secured the `DELETE /api/users` and `DELETE /api/users/bulk` routes with server-side admin role validation, replacing legacy role-specific checks with broad administrator privileges.

### 2026-01-27: RBAC, Security & Category Enhancements
- **Role-Based Access Control (RBAC)**: Implemented a comprehensive RBAC system. 
  - Created `/api/auth/me` to fetch current user profile and role.
  - Added `isAdmin` flag to `DashboardLayout` for navigation filtering.
  - Restricted UI elements (Add/Edit/Delete/Bulk buttons) in Departments, Schemes, Categories, and Mappings pages for non-admin users.
  - Secured all administrative API routes with server-side role validation.
- **Category Management Upgrade**: 
  - Implemented pagination and search in `CategoryDetailModal` for managing large sets of schemes within a category.
  - Added full i18n support for pagination controls in both English and Hindi.
- **Bug Fixes & Stability**:
  - Fixed a critical linter error where `useGetMeQuery` was not exported from the RTK Query API service.
  - Corrected imports in `DepartmentsPage`, `SchemesPage`, and `CategoriesPage`.
  - Updated `prd.md` and `ISSUE_TRACKING.md` to reflect these changes.

### 2026-01-26: Global Branding, Responsiveness & Dark Mode Fixes
- **Global Logo Replacement**: Systematically replaced all instances of placeholder logos and old branding with the official `logo.jpeg`. Optimized sizing for different layouts: 120x120 for login, 40x40 for sidebar, 36x36 for mobile nav, and 48x48 for the footer.
- **Metadata Branding**: Integrated the new logo into the Next.js metadata system (`icons`) in the root layout to ensure the brand identity is consistent in browser tabs and bookmarks.
- **Responsive Layout Overhaul**: Fixed overflowing elements, misaligned buttons, and container issues across all pages. Implemented `flex-col` for mobile footers and full-width buttons for smaller screens.
- **Dark Mode Accessibility**: Resolved critical readability issues in dark mode by adding `dark:hover:bg-slate-800/50` and high-contrast text classes to interactive items in the Departments and Schemes modules.
- **Documentation**: Updated `ISSUE_TRACKING.md` and `docs/prd.md` to reflect the latest UI/UX and branding improvements.

### 2026-01-26: Department Management & UI Stability
- **Department Edit/Delete**: Implemented the ability to rename and delete departments. This included updating the API routes (`PUT`/`DELETE`), adding RTK Query mutations, and enhancing the `DepartmentDialog`.
- **UI Components**: Installed and configured `alert-dialog` via shadcn CLI for secure delete confirmations.
- **Notification System**: Integrated `sonner` for system-wide toast notifications. Resolved build errors by correctly importing `Toaster` in the root [layout.tsx](file:///c:/Users/Varsha Malik/OneDrive/Pictures/financialAPP/src/app/%5Blocale%5D/layout.tsx).
- **Data Integrity**: Added a check to prevent deletion of departments that have existing schemes associated with them.
- **Documentation**: Updated `docs/prd.md` and `ISSUE_TRACKING.md` to reflect the newly added department management and notification features.

### 2026-01-27: Single Scheme Export & Translation Fixes
- **Single Scheme Export**: Implemented the ability to export individual schemes directly from the list views.
  - Extended `/api/schemes/export` to support an optional `schemeId` query parameter.
  - Added "Download" buttons with indigo branding to Schemes page (desktop/mobile) and Category Detail modal.
  - Implemented unique file naming using the scheme code (e.g., `Scheme_CODE_DATE.xlsx`).
- **Translation Fix**: Resolved a console error where `Departments.exportSuccess` and `Departments.exportError` keys were missing in the English and Hindi locale files.
- **Documentation**: Updated `docs/prd.md` and `ISSUE_TRACKING.md` to reflect the single scheme export feature.

### 2026-01-27: Mapping Refinement & UI Simplification
- **Mapping Refinement**: Replaced the category-based scheme filter on the Mapping page with a department-based filter using `useGetDepartmentsQuery`.
- **Schemes Page**: Removed the bulk "Export Excel" button while preserving individual scheme export functionality.
- **Viewer Role Optimization**:
    - Removed **Mapping** from the navigation sidebar for viewers.
    - Hidden **Edit** and **Delete** buttons from the Schemes page (desktop and mobile) for viewers.
    - Removed **Quick Actions** and **Recent Administrative Activity** cards from the Dashboard for viewers.
    - Added a fallback "Unauthorized Access" view for the Mapping page to secure direct URL navigation.
- **Localization**: Added `allDepartments` and `filterByDepartment` translation keys to both English and Hindi locale files for the new Mapping page filter.

### 2026-01-26: Database Seeding & Data Integration
- **Mock Data Seeding**: Updated `prisma/seed.js` to automatically populate the database from `docs/mock-data.json`. Implemented complex relational mapping for Users, Departments, Categories, Category Parts, and Schemes.
- **Robust Seeding Logic**: Replaced standard `upsert` with a conditional `findFirst`/`update`/`create` pattern for Category Parts to handle unique constraint requirements in Prisma. This ensures the seeding script is idempotent and can be re-run without errors.
- **Dashboard Integration**: Verified that the seeded mock data correctly populates the dashboard statistics and charts via the `api/dashboard/stats` endpoint, providing a fully functional demo environment.
- **Runtime Error Fix**: Resolved a critical `TypeError` in the Schemes module where `.toFixed()` was called on potentially null/undefined budget fields. Added safety checks across all data tables.
- **Department Detail Enhancement**: Expanded the department-wise scheme table to include all 8 strict columns (Allotment, % Actual, Prov Exp) and added missing localized translations.
- **PRD Synchronization**: Updated `docs/prd.md` to reflect the latest system modules, data seeding strategies, and recent technical refinements.

### 2026-01-25: System Settings & UI Refinements
- **System Settings**: Implemented system settings page with support for fiscal year configuration and system name localization. Added `Setting` model to Prisma schema and created corresponding API endpoints.
- **Mobile UI Optimization**: Completed card-based views for Departments, Schemes, Audit Logs, and Categories for better mobile experience.
- **Dependency Management**: Integrated `@radix-ui/react-switch` for system settings UI.

### 2026-01-24: Internationalization & Dashboard Enhancements
- **Build & Dependency Fixes**: Resolved Next.js 15+ dynamic route errors by awaiting `params`. Installed `bcryptjs` and secured the login route with proper password hashing. Fixed authentication utility imports across API routes.
- **Full Application Localization**: Completed the localization process for all dashboard modules. Added translation namespaces for `AuditLogs`, `DeptDetails`, `Mappings`, and `Dashboard`. Integrated `next-intl` hooks and locale-aware routing using `@/i18n/routing`.
- **Mobile Responsive Data Views**: Implemented "Stacked Card View" for Departments and Audit Logs tables, complementing the earlier implementation for Schemes. This ensures a seamless user experience on smaller screens where wide tables would otherwise break the layout.
- **Dynamic Translation Mapping**: Developed a robust mapping function for dashboard statistics to dynamically translate API-provided metric names into localized strings.
- **Fixed Dashboard Metrics**: Added real-time budget aggregation logic using Prisma's `_sum` function. This provides accurate total budget and expenditure totals on the dashboard.
- **Enhanced UI Components**: Added the `Progress` component via shadcn/ui to visualize budget utilization percentages.
- **Refined Department Details**: Built a dedicated dynamic route for department detail views, allowing users to see granular scheme-level data for each department.
- **User Management Implementation**: Added comprehensive User Management module with API routes and UI. Integrated with Audit Logs to track user creation, updates, and deletions.
- **Linter Cleanup**: Resolved multiple Tailwind 4 diagnostic warnings by replacing arbitrary values with standard utility classes.

### 2026-01-26: Category Management & Visual Overhaul
- **Category Management & System-wide Refinements**: Implemented full CRUD for budget categories, added icon/photo support, and renamed "Parts" to "Sub Categories".
- **Visual Identity Refresh**: Overhauled the entire application theme with a modern **Green-Blue Gradient** palette. Updated `globals.css` with a custom `oklch` color system and applied dynamic gradients to the dashboard sidebar, headers, and navigation elements for a professional financial aesthetic.
- **Global Branding & UI**: Renamed the system to **"Scheme Mapping System"** globally. Improved dark theme hover visibility for better accessibility. Added a stylish, glassmorphism-style footer to the dashboard layout with full localization support.
- **Linter & Type Safety**: Resolved critical Prisma-related linter errors in category API routes using strategic type casting and ensured full compliance with TypeScript 5 standards.
- **Documentation**: Updated `docs/prd.md` and `ISSUE_TRACKING.md` to reflect category management enhancements and UI refinements.
- **UI Consistency**: Integrated `AlertDialog` for category deletions and ensured action buttons are available in both desktop and mobile views.

### 2026-01-26: UI/UX Responsiveness & Dark Mode Fixes
- **Dark Mode Optimization**: Resolved high-contrast visibility issues where hover backgrounds turned white. Applied consistent `dark:hover:bg-slate-800/50` and `dark:text-slate-100` classes across all interactive elements in Departments, Schemes, Categories, and Dashboard modules.
- **Global Responsiveness Overhaul**:
  - **Layout**: Fixed header and footer alignment issues across all breakpoints.
  - **Branding**: Replaced all placeholder icons with the official company logo (`logo.jpeg`) across Login, Sidebar, Header, and Footer modules.
  - **Dashboard**: Optimized stat cards grid (1 col mobile, 2 col tablet, 4 col desktop) and converted recent activity items to a vertical layout on mobile to prevent overflow.
  - **Tables & Pagination**: Standardized table headers with full-width action buttons on mobile. Refactored pagination to a stacked layout on smaller screens.
  - **Dialogs & Forms**: Updated all CRUD dialogs (Department, Scheme, Category, User) to be mobile-friendly. Footers now use a `flex-col` layout with full-width buttons on mobile, ensuring no elements go outside their containers.
- **Consistency Audit**: Verified all core pages (Audit Logs, Users, Settings) for consistent responsive behavior and dark-mode accessibility.

---

## 4. BUG TRACKING / TECHNICAL DEBT
- [x] **Dark Mode Hover Contrast**: Fixed unreadable text in dark mode due to white hover backgrounds.
- [x] **Mobile Overflow**: Resolved overflow and alignment issues in headers, stat cards, and dialog footers across mobile/tablet breakpoints.
