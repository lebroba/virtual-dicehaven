# Virtual Dicehaven Code Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Code Style
- **Imports**: Group imports by: React, libraries, components, utils/hooks, types
- **Components**: Use functional components with TypeScript (React.FC type)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Types**: Use explicit typing with interfaces/types, avoid `any`
- **State Management**: Use React context for global state
- **Error Handling**: Use try/catch for async operations, provide fallbacks
- **Formatting**: 2-space indentation, trailing commas, semicolons required
- **File Structure**: One component per file, group related components in folders
- **CSS**: Use Tailwind utility classes, group related classes

## Tools
- TypeScript for type safety
- shadcn/ui for UI components
- React Router for navigation
- Tailwind CSS for styling