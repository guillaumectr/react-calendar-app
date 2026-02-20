# React Calendar App - AI Agent Instructions

## Architecture Overview

This is a React 18 + TypeScript calendar application using **Context API for centralized state management**. The architecture follows a component-provider pattern where `CalendarProvider` wraps the entire app (see `App.tsx`) and manages all calendar-related state.

### Key Architectural Pattern: Dual Context/Hook Pattern
**CRITICAL**: The codebase has an **inconsistent state management pattern** that must be understood:
- `context/CalendarContext.tsx` exports both `CalendarProvider` AND a `useCalendar` hook
- `hooks/useCalendar.ts` is a SEPARATE implementation of `useCalendar` with navigation methods
- Components currently import from different sources, causing potential state access issues

When modifying state management:
- The `CalendarContext.tsx` version is the source of truth (includes `events`, `addEvent`, `currentMonth`, `selectedDate`)
- The separate `hooks/useCalendar.ts` adds navigation helpers (`navigateToNextMonth`, `navigateToPreviousMonth`) but re-wraps context access
- Prefer importing `useCalendar` from `context/CalendarContext.tsx` for direct context access

### Data Flow Pattern
```
App.tsx
  └─ <CalendarProvider>  // Manages: currentMonth, selectedDate, events[]
       └─ <Calendar>     // Accesses context via useContext(CalendarContext)
            ├─ <CalendarHeader>   // Props-based (month, onPrevMonth, onNextMonth)
            └─ <CalendarDay>      // Props-based (date, onClick)
```

**State is accessed two ways:**
1. Direct context consumption: `useContext(CalendarContext)` in `Calendar.tsx`
2. Via hooks: `useCalendar()` from either context or hooks file

## Component Conventions

### Props vs Context
- **CalendarHeader** and **CalendarDay** receive props (not context) for reusability
- **Calendar** consumes context directly and passes props down
- All stateful logic lives in `CalendarProvider`

### TypeScript Types
- All types defined in `src/types/index.ts`
- `CalendarEvent`: Represents calendar events with `id`, `title`, `date`, `description?`
- `DateInfo`: Structured date representation (day, month, year) - currently unused in code

## Development Workflow

### Running the App
```bash
npm start          # Starts dev server at localhost:3000
npm run build      # Production build
npm test           # Runs Jest tests (none currently exist)
```

**Built with Create React App (CRA)** - uses `react-scripts` for all build tooling. No custom webpack/babel config.

### TypeScript Configuration
- Strict mode enabled (`tsconfig.json` has `"strict": true`)
- Target ES5 for broad compatibility
- Uses `react-jsx` transform (no need to import React in every file, but this codebase does for consistency)

## Critical Issues to Be Aware Of

### 1. Calendar.tsx Has Undefined References
Lines 7-8 reference `daysInMonth` and `selectDate` from context, but:
- `CalendarContext.tsx` does NOT export `daysInMonth` or `selectDate`
- Only exports: `currentMonth`, `selectedDate`, `events`, `setCurrentMonth`, `setSelectedDate`, `addEvent`
- **This code will not run** - needs fixing before app is functional

### 2. CalendarHeader.tsx Props Mismatch
Component expects `month`, `onPrevMonth`, `onNextMonth` props but `Calendar.tsx` renders it without props (`<CalendarHeader />`).

### 3. Missing Styling
No CSS files exist - all `className` references will have no styles applied.

## Making Changes

### Adding New Features
- New state → Add to `CalendarContext.tsx` provider
- New UI → Create component in `src/components/`, receive props from parent
- Date utilities → Consider adding to `hooks/useCalendar.ts` or creating `utils/date.ts`

### Fixing the Current Issues
1. Add `daysInMonth` calculation to `CalendarContext` or create a separate utility
2. Standardize on one `useCalendar` implementation (recommend context version)
3. Wire up `CalendarHeader` props properly in `Calendar.tsx`
4. Add CSS files for styling (create `src/components/Calendar.css` etc.)

### Testing Strategy
Currently no tests exist. When adding tests:
- Use `react-scripts test` (Jest + React Testing Library pre-configured)
- Wrap components with `<CalendarProvider>` in tests to provide context
- Example: `render(<CalendarProvider><Calendar /></CalendarProvider>)`

## External Dependencies
- **React 18**: Using StrictMode in `index.tsx` (development only)
- **react-scripts 5.0.0**: Build tool abstraction
- No external date libraries (uses native `Date` object)
- No routing, API calls, or external services

## Project-Specific Conventions
- File organization: Group by type (`components/`, `context/`, `hooks/`, `types/`)
- Component naming: PascalCase with `.tsx` extension
- Hook files: `use` prefix with `.ts` extension
- All exports: ES6 default exports
- No prop-types (TypeScript interfaces instead)
