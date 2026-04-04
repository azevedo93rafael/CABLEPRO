# CablePro - Technical Specification

## 1. Project Overview
- **Name**: CablePro (formerly CableFill Pro)
- **Type**: Web Application (Engineering Tool)
- **Purpose**: A modular engineering suite for electrical project management, calculations, and documentation generation.
- **Core Modules**:
  1. **CableFill**: Calculation of cable tray/conduit filling (occupancy rate).
  2. **Capitolato**: Generation of technical specifications and material books (DOCX export).
  3. **Cabine MT**: Electrical calculation of Medium Voltage cabins (earthing and ventilation).
- **Target Users**: Electrical Engineers, Project Managers, Contractors.

## 2. Tech Stack
- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS 4
- **3D/Graphics**: Three.js (@react-three/fiber), Recharts, html2canvas, jspdf
- **State Management**: React Context (Auth, App, Project, CabineMT)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage), Python (FastAPI/Starlette) for backend processing.
- **Document Generation**: docxtemplater (Frontend), docxtpl (Backend), docx, pizzip
- **Deployment**: Render (with python api backend for specific tasks)

## 3. Module Breakdown

### 3.1. CableFill (Core Calculation)
- **Functionality**:
  - Manage **Structures** (Cable Trays, Conduits) - create, edit, delete, favorites.
  - Manage **Cables** (Power, Data, EVAC, IRAI) - create, edit, delete, favorites.
  - **Project Dashboard**: Add cables to a selected structure, calculate occupancy.
  - **Validation**: Prevents mixed systems (Power/Data) in conduits without separator. Enforces tray separators.
  - **Visualization**: 2D Cross-section, 3D isometric preview (Three.js), Cable list with tags.
  - **Export**: PDF Report (Compliance), CSV (Cables).

### 3.2. Capitolato (Technical Specs)
- **Functionality**:
  - **Element Library**: CRUD for technical elements (title, description, category, image, docs).
  - **Categories**: Power, Lighting, Fire, Data, Trays, Solar, CCTV.
  - **Project Composer**: Select elements from library to form a project.
  - **Metadata**: Form for project title, client, revisions, approvals.
  - **Docx Generation**: Maps selected elements to a Word template using `docxtemplater`.

### 3.3. Cabine MT (Calculations)
- **Sub-modules**:
  1. **Grounding (Aterramento)**:
     - Inputs: Transformer qty/power, Voltage, Fault time, Conductor material.
     - Outputs: Short-circuit current (Icc), Earthing cable section (normalized), Collector busbar section, Equipotential bandella.
     - Norms: CEI EN 60909 / IEC 60364-5-54.
  2. **Ventilation (Ventilazione)**:
     - Inputs: Cabin dimensions, Element types (Transformer, QMT, QGBT), Efficiency.
     - Outputs: Total dissipated heat (W), Airflow required (m³/h), BTU/h.
- **Features**: Save projects to DB.

## 4. Database Schema (Supabase)

### Tables
1. **`User`** (extends auth.users)
   - `id` (uuid, PK)
   - `email` (text)
   - `role` (text: 'admin', 'user')
   - `is_approved` (int: 0/1)
   - `accessible_modules` (text[])

2. **`Project`** (CableFill projects)
   - `id` (uuid)
   - `name` (text)
   - `structure` (jsonb)
   - `projectCables` (jsonb)
   - `userId` (uuid, FK)

3. **`Cable`**
   - `id` (uuid)
   - `name`, `type`, `diameter`, `size`, `weight`
   - `userId` (uuid, FK)

4. **`Structure`**
   - `id` (uuid)
   - `name`, `type`, `width`, `height`, `fillLimit`
   - `userId` (uuid, FK)

### `src/components/ThreeDPreview.tsx`
- Renders a 3D interactive preview of the cable tray using `@react-three/fiber` and `three.js`.
- Allows users to rotate and zoom to visualize the cable arrangement.

### Backend Scripts
- **`api.py`**: Python backend (likely FastAPI/Starlette) for handling specific server-side tasks.
- **`capitolato_generator.py`**: Python utility to generate DOCX files for the Capitolato module (can be used locally or deployed).

## 5. UI/UX Architecture

### Layouts
- **App Entry**: `ModuleSelector` (Choose between CableFill, Capitolato, CabineMT).
- **CableFill Layout**: `MainLayout` with Sidebar (Dashboard, Trays, Conduits, Cables, DB, Users).
- **Capitolato Layout**: Custom full-screen view with sidebar navigation (Dashboard, Editor, Users).
- **CabineMT Layout**: Custom full-screen view with tabs (Grounding, Ventilation).

### Internationalization (i18n)
- Supported languages: `en`, `pt-BR`, `it`.
- Implementation: `constants.ts` contains huge translation objects `TRANSLATIONS`.

### Theming
- **TailwindCSS**: 4.x
- **Dark/Light Mode**: Supported via `AppContext`.
- **Module Themes**: Custom themes per module defined in `config/moduleThemes.ts`.

## 6. Critical Logic & Utilities

### `src/utils/cableUtils.ts`
- `hasMixedSystems()`: Checks if project has both Power and Special systems.
- Occupancy calculations (Area sum).

### `src/utils/cabineMTCalculations.ts`
- `calculateIcc()`: Short circuit current.
- `calculateProtectionConductorSection()`: Adiabatic method (S = I * sqrt(t) / k).
- `roundToNormalizedSection()`: IEC 60228 compliance.

### `src/utils/exportUtils.ts`
- `exportToPDF()`: Uses `jspdf` and `jspdf-autotable`.
- `generateDocx()`: Uses `docxtemplater`.

## 7. Development Guidelines (Future)

### Code Quality
- Use **Spec-Driven Development**: Define types and logic before implementing UI.
- **Tests**: Add unit tests for calculation engines (`cabineMTCalculations.ts`).

### Extensibility
- **Database Views**: Refactor shared material library to be visible to all users (global DB) vs private user data.
- **PDF Generation**: Move more logic to frontend or server-side API (python `api.py` exists).

## 8. Roadmap
- [ ] Refactor `CapitolatoModule` into smaller sub-components.
- [ ] Implement shared global library for materials.
- [ ] Add unit tests for calculation modules.
- [ ] Improve 3D performance in `ThreeDPreview`.
- [ ] Polish mobile responsiveness.