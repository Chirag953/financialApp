# Grant-001 Management System - PRD

## 1. PROJECT OVERVIEW
**Project Name:** Grant-001 Management System  
**Deployment Target:** Localhost (Dev Environment)  
**Objective:** A centralized system to manage budget allocations, expenditures, and scheme-category mappings for 95 Government Departments.

---

## 2. TECH STACK (Enhanced)
| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **State Management** | Redux Toolkit (with RTK Query) |
| **Auth** | JWT Authentication |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Validation** | Zod (Schema Validation) |
| **API** | REST using Next.js API Routes |
| **Localization** | next-intl (Bilingual UI: Hindi/English) |
| **Linting** | ESLint + Prettier |

---

## 3. SYSTEM MODULES & FEATURES

### 3.1 Authentication (JWT)
- Email + Password login.
- JWT issued on successful login.
- Tokens stored via HTTP-only cookie.

### 3.2 Dashboard (Admin)
- **Summary Statistics:** Total Departments (95), Schemes, Categories, and Mappings.
- **Budget Overview:** `sum(total_budget_provision)`, `sum(expenditure)`, with visual progress bars.
- **Audit Log Overview:** Recent administrative changes.

### 3.3 Departments Module
- List of 95 departments with pagination (25 rows/page).
- **Instant Search**: Debounced search by department name.
- **Edit/Delete Support**: Authorized administrators can rename departments (English/Hindi) or delete departments (prevented if schemes are linked).
- **Department Detail View**: Dedicated detail page showing department summary (Total Budget, Allotment, Expenditure, Utilization %) and a comprehensive table of all schemes under that department with 8-column detail.

### 3.4 Scheme Management (Strict 8 Columns)
| Column | Description |
| :--- | :--- |
| 1. Scheme Code | 13-digit unique numeric |
| 2. Scheme Name | Text |
| 3. Total Budget Provision | Number (Decimal) |
| 4. Progressive Allotment | Number (Decimal) |
| 5. Actual Progressive Expenditure | Number (upto Dec) |
| 6. % Budget/Expenditure | Computed: (Expenditure / Provision) * 100 |
| 7. % Actual/Expenditure | Computed: (Expenditure / Allotment) * 100 |
| 8. Provisional Exp. Current Month | Number (Decimal) |

- **Export Feature:** Download current table view as Excel/CSV.
- **Filtering:** Multi-category filtering and debounced search.
- **Edit/Delete Support**: Authorized administrators can rename schemes or update their budget figures. Schemes with existing category mappings are protected from deletion.

---

### 3.5 Category Management
- Built-in: Child Budget, Gender Budget (Sub Categories A/B/C), Green Budget.
- Admin can manage categories, toggle `has_parts` support (Sub Categories), and add icons/photos for visual identification.
- **Edit/Delete Support**: Authorized administrators can rename categories or delete categories (prevented if schemes are mapped).

### 3.6 Scheme → Category Mapping
- Map schemes to multiple categories.
- Support for selecting "Sub Categories" for categories like Gender Budget.

---

## 4. PROJECT STRUCTURE (Next.js App Router)
```text
src/
├── app/                # App Router (auth, dashboard, api)
│   ├── [locale]/       # Bilingual route handling (Hindi/English)
│   ├── (auth)/         # Login page
│   ├── (dashboard)/    # Layout, Departments, Schemes, Categories, Mapping, Users, Settings
│   └── api/            # REST API routes (with Zod validation)
├── components/         # Shared components
│   ├── ui/             # shadcn/ui components (installed via CLI)
│   ├── layouts/        # Dashboard/Auth layout components
│   ├── schemes/        # Scheme-specific complex components
│   └── shared/         # Custom reusable components (Skeleton loaders, etc.)
├── lib/                # Prisma client, auth helpers, Zod schemas, utils
83→├── store/              # Redux Toolkit (RTK Query services, store)
84→├── types/              # TypeScript interfaces
85→└── proxy.ts            # Auth & Locale protection (Next.js 16/custom)
86→``````

## 6. DATA & SEEDING
- **Mock Data**: A comprehensive `mock-data.json` file in the `docs/` folder contains realistic data for 95 departments, budget categories, and multiple schemes per department.
- **Seeding Script**: An idempotent `prisma/seed.js` script is provided to populate the database with mock data, ensuring a consistent development and demo environment.
- **Data Integrity**: Relational mapping is maintained between Departments and Schemes, and between Schemes and Budget Categories/Parts.

---

## 7. RECENT REFINEMENTS (2026-01-26)
- **Enhanced Visualization**: Department Detail view now mirrors the strict 8-column layout of the Schemes module for consistent data reporting.
- **Notification System**: Integrated `sonner` for rich, accessible toast notifications across all administrative modules.
- **Department Management**: Added functionality to edit (rename) and delete departments. Includes server-side validation, audit logging, and delete-protection for departments with active schemes.
- **Scheme Management**: Implemented edit and delete functionality for schemes. Includes real-time percentage recalculation, audit logging, and delete-protection for mapped schemes.
- **Category Management**: Enhanced category module with Edit/Delete support and custom icons/photos. Renamed "Parts" to "Sub Categories" system-wide for better clarity.
- **Global Responsiveness & Dark Mode Fix**: Completed a comprehensive UI/UX overhaul to ensure full responsiveness across all breakpoints (mobile, tablet, desktop). Fixed critical dark-mode accessibility issues by standardizing hover states and high-contrast text colors.
- **Mobile-First Actions**: Added action buttons (Edit/Delete) to both desktop table and mobile card views for departments, schemes, and categories. Updated all dialogs/forms to be mobile-friendly with stacked layouts on small screens.

---

## 8. DATA MODEL (Prisma - Enhanced)
```prisma
model Department {
  id      String   @id @default(uuid())
  name    String   @unique
  schemes Scheme[]
}

model Scheme {
  id                                    String    @id @default(uuid())
  scheme_code                           String    @unique @db.VarChar(13)
  scheme_name                           String
  total_budget_provision               Decimal   @db.Decimal(15, 2)
  progressive_allotment                Decimal   @db.Decimal(15, 2)
  actual_progressive_expenditure       Decimal   @db.Decimal(15, 2)
  pct_budget_expenditure               Decimal   @db.Decimal(5, 2)
  pct_actual_expenditure               Decimal   @db.Decimal(5, 2)
  provisional_expenditure_current_month Decimal   @db.Decimal(15, 2)
  department_id                         String
  department                            Department @relation(fields: [department_id], references: [id])
  mappings                              Mapping[]
}

model Category {
  id        String          @id @default(uuid())
  name      String          @unique
  has_parts Boolean         @default(false)
  parts     CategoryPart[]
  mappings  Mapping[]
}

model CategoryPart {
  id          String   @id @default(uuid())
  category_id String
  category    Category @relation(fields: [category_id], references: [id])
  part_name   String   // A, B, or C
}

model Mapping {
  id          String        @id @default(uuid())
  scheme_id   String
  scheme      Scheme        @relation(fields: [scheme_id], references: [id])
  category_id String
  category    Category      @relation(fields: [category_id], references: [id])
  part_id     String?
  part        CategoryPart? @relation(fields: [part_id], references: [id])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // e.g., "UPDATE_SCHEME", "CREATE_MAPPING"
  details    Json     // Store old/new values
  timestamp  DateTime @default(now())
}
```

---

## 6. API CONTRACT (RTK Query Ready)

### 6.1 Auth & Validation
- **Zod Validation:** All POST/PATCH requests validated via server-side schemas.
- **Login:** POST `/api/auth/login` (HTTP-only cookies).

### 6.2 Data Fetching & Management (RTK Query)
- `useGetDepartmentsQuery`: Fetch paginated departments with debounced search.
- `useAddDepartmentMutation`: Create a new department with bilingual names.
- `useUpdateDepartmentMutation`: Rename existing departments (PUT).
- `useDeleteDepartmentMutation`: Remove departments without linked schemes (DELETE).
- `useGetSchemesQuery`: Fetch schemes with multi-category filtering.
- `useExportSchemesMutation`: Trigger server-side Excel/CSV generation.

---

## 7. UI/UX SPECIFICATION (Mobile-First Responsive)
- **Visual Identity:** Modern **Green-Blue Gradient** theme representing stability and growth.
- **Color System:** Utilizes `oklch` color space for consistent, high-contrast rendering across all devices.
- **Responsive Design Strategy:** Mobile-first approach using Tailwind CSS breakpoints (`sm`, `md`, `lg`, `xl`).
- **Layout Components:**
  - **Sidebar (Left):** Features a vibrant emerald-to-blue gradient header and active states; collapsible on mobile.
  - **Header (Top):** Clean, shadow-enhanced top bar with integrated theme and language switchers.
  - **Main Content:** Soft emerald-tinted background with high-contrast data containers for maximum readability.
- **Component Responsiveness:**
  - **Tables:** Implementation of "Responsive Scroll" or "Stacked Card View" for the strict 8-column scheme table on mobile devices to ensure readability.
  - **Stat Cards:** Grid layout that shifts from 1 column (mobile) to 2 columns (tablet) and 4 columns (desktop).
  - **Footer:** A multi-column, glassmorphism-style footer with system branding, versioning, support links, and a real-time system status indicator.
  - **Forms/Modals:** Centered and full-width on mobile; fixed width/centered on larger screens.
- **Bilingual Support:** Toggle switch in Header for Hindi/English translation.
- **Visual Feedback:** 
  - **Skeleton Loaders:** Used during data fetching in tables and stat cards.
  - **Toast Notifications:** Feedback on success/error actions.

---

## 8. LIST OF 95 DEPARTMENTS
1. आबकारी विभाग
2. आवास विभाग
3. आयुष विभाग (लघु उधोग एवं निर्यात प्रोत्साहन)
4. ऊर्जा विभाग (खातें और अंकेक्षा)
5. उधोग विभाग (खादी एवं ग्रामोद्योग)
6. उद्योग विभाग (हथकरघा उद्योग)
7. उद्योग विभाग (भारी एवं मध्यम उद्योग)
8. उद्योग विभाग (वृद्धप तथा लेखन सामग्री)
9. ऊर्जा विभाग
10. कृषि विभाग
11. कृषि तथा अन्य सम्बद्ध विभाग (आधनिक एवं रेशम विकास)
12. कृषि तथा अन्य सम्बद्ध विभाग (कृषि)
13. कृषि तथा अन्य सम्बद्ध विभाग (भूमि विकास एवं जल संसाधन)
14. कृषि तथा अन्य सम्बद्ध विभाग (ग्राम्य विकास)
15. कृषि तथा अन्य सम्बद्ध विभाग (पशुपालन)
16. कृषि तथा अन्य सम्बद्ध विभाग (एकीकृण)
17. कृषि तथा अन्य सम्बद्ध विभाग (पशुपालन विकास)
18. कृषि तथा अन्य सम्बद्ध विभाग (मत्स्य)
19. कृषि तथा अन्य सम्बद्ध विभाग (सहकारिता)
20. कार्मिक विभाग (प्रशिक्षण तथा अन्य व्यय)
21. कार्मिक विभाग (लोक सेवा आयोग)
22. स्वास्थ्य तथा रसद विभाग
23. खेल विभाग
24. ग्रन्था विकास विभाग (ग्रन्था)
25. ग्रन्था विकास विभाग (ग्रन्था उद्योग)
26. गृह विभाग (कारागार)
27. गृह विभाग (पुलिस)
28. गृह विभाग (नागरिक सुरक्षा)
29. गृह विभाग (राजनीतिक पेंशन तथा अन्य व्यय)
30. गोपन विभाग(राज्यपाल सचिवालय) निदेशालय तथा अन्य व्यय
31. चिकित्सा विभाग (चिकित्सा, शिक्षा एवं प्रशिक्षण)
32. चिकित्सा विभाग (एलोपैथी चिकित्सा)
33. चिकित्सा विभाग (आयुर्वेदिक एवं यूनानी चिकित्सा)
34. चिकित्सा विभाग (होम्योपैथी चिकित्सा)
35. चिकित्सा विभाग (परिवार कल्याण)
36. चिकित्सा विभाग (सार्वजनिक स्वास्थ्य)
37. प्रेस प्रकाश विभाग
38. नागरिक उड्डयन विभाग
39. भाषा विभाग
40. नियोजन विभाग
41. निर्वाचन विभाग
42. न्याय विभाग
43. परिवहन विभाग
44. पर्यटन विभाग
45. पर्यावरण विभाग
46. प्रशासनिक सुधार विभाग
47. प्रारंभिक शिक्षा विभाग
48. मुस्लिम वक्फ विभाग
49. महिला एवं बाल कल्याण विभाग
50. मत्स्य विभाग (जिला प्रशासन)
51. राजस्व विभाग (देवी विधानियों के सम्बन्ध में राहत)
52. राजस्व विभाग (राजस्व परिषद् तथा अन्य व्यय)
53. राष्ट्रीय एकीकरण विभाग
54. लोक निर्माण विभाग (अभियांत)
55. लोक निर्माण विभाग (भवन)
56. लोक निर्माण विभाग (विशेष क्षेत्र कार्यक्रम)
57. लोक निर्माण विभाग (सचार साधन-नीती)
58. लोक निर्माण विभाग (सचार साधन-सड़कें)
59. लोक निर्माण विभाग (राज्य सम्पत्ति निदेशालय)
60. वन विभाग
61. वित्त विभाग (ऋण सेवा तथा अन्य व्यय)
62. वित्त विभाग (अभिलेखों भत्ते तथा पेंशनें)
63. वित्त विभाग (कोषागार तथा लेखा प्रशासन)
64. वित्त विभाग (राज्य लॉटरी)
65. वित्त विभाग (लेखा परीक्षा, अन्य-व्यय)
66. वित्त विभाग (सामूहिक अभिनंदन)
67. विपत्ति परिषद् सचिवालय
68. विधान सभा सचिवालय
69. व्यावसायिक शिक्षा विभाग
70. विज्ञान एवं प्रौद्योगिकी विभाग
71. उच्च शिक्षा (माध्यमिक शिक्षा)
72. शिक्षा विभाग (माध्यमिक शिक्षा)
73. शिक्षा विभाग (उच्च शिक्षा)
74. शिक्षा विभाग (नेवा राष्ट्र)
75. शिक्षा विभाग(राज्य शैक्षिक अनुसंधान एवं प्रशिक्षण परिषद्)
76. कला विभाग (श्रम कल्याण)
77. श्रम विभाग (समायोजन)
78. सचिवालय प्रशासन विभाग
79. समाज कल्याण विभाग (विकलांग एवं वृद्धा वर्ग कल्याण)
80. समाज कल्याण विभाग(समाज कल्याण एवं अनुसूचित जातियों का कल्याण)
81. समाज कल्याण विभाग (जनजाति कल्याण)
82. सतर्कता विभाग
83. समाज कल्याण विभाग(अनुसूचित जातियों के लिये विशेष पठक योजना)
84. सामान्य प्रशासन विभाग
85. सांस्कृतिक मामलात विभाग
86. सूचना विभाग
87. सैनिक कल्याण विभाग
88. संस्थागत वित्त विभाग (व्यापारकर)
89. संस्थागत वित्त विभाग (मनोरंजन तथा राजोकर)
90. संस्थागत वित्त विभाग (स्टांप एवं पंजीकरण)
91. संस्कृति विभाग
92. स्थानिक निकायों तथा ग्रामीण जलापूर्ति विभाग
93. सिंचाई विभाग (निर्माण कार्य)
94. सिंचाई विभाग (अभिषेचन)
95. अन्य विभाग (Misc)

---

## 9. NON-FUNCTIONAL REQUIREMENTS
- **Responsiveness:** Full compatibility with all screen sizes (Mobile, Tablet, Desktop) using Tailwind CSS.
- **Auditability:** Every administrative change is logged in the `AuditLog` table.
- **Reliability:** Server-side validation via Zod prevents corrupt data entry.
- **Accessibility:** Bilingual support (Hindi/English) for wider government staff usage.
- **Performance:** RTK Query caching reduces unnecessary API calls.
