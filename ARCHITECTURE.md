# Altitutor Student Portal Architecture

This document outlines the architecture of the Altitutor Student Portal, describing the separation of concerns and code organization.

## Architecture Layers

The application follows a layered architecture to ensure clean separation of concerns:

### 1. UI Layer
- **Location**: `/components`, `/pages`
- **Purpose**: Handles rendering and user interactions
- **Components**:
  - UI components: Reusable interface elements
  - Page components: Next.js page routes that use hooks to interact with services
  - Styles: CSS and Tailwind styles

### 2. Hooks Layer
- **Location**: `/lib/hooks`
- **Purpose**: Provides React hooks that connect UI to services, managing state and side effects
- **Components**:
  - Custom hooks for different domains (students, subjects, classes, auth)
  - Loading, error, and state management

### 3. Service Layer
- **Location**: `/lib/services`
- **Purpose**: Contains business logic and orchestrates operations across repositories
- **Components**:
  - Domain-specific services for students, subjects, classes, auth
  - Error handling and validation
  - Cross-cutting operations

### 4. Repository Layer
- **Location**: `/lib/repositories`
- **Purpose**: Abstracts data access and provides methods for CRUD operations
- **Components**:
  - Data access functions organized by entity
  - Query building and data transformation

### 5. Database Layer
- **Location**: External (Supabase)
- **Purpose**: Stores and retrieves data
- **Components**:
  - PostgreSQL database
  - Supabase Auth

## Data Flow

1. **User Interaction**: UI components handle user inputs
2. **Hook Calls**: UI calls custom hooks to perform operations
3. **Service Calls**: Hooks call service methods
4. **Repository Calls**: Services call repository methods
5. **Database Interaction**: Repositories interact with Supabase
6. **Response**: Data flows back up through the layers

## Key Files and Directories

- `/lib/hooks/useStudent.js`: Hooks for student profile management
- `/lib/hooks/useSubjects.js`: Hooks for subject management
- `/lib/hooks/useClasses.js`: Hooks for class management
- `/lib/hooks/useAuth.js`: Hooks for authentication

- `/lib/services/studentService.js`: Business logic for student operations
- `/lib/services/subjectService.js`: Business logic for subject operations
- `/lib/services/classService.js`: Business logic for class operations
- `/lib/services/authService.js`: Business logic for authentication

- `/lib/repositories/studentRepository.js`: Data access for student entity
- `/lib/repositories/subjectRepository.js`: Data access for subject entity
- `/lib/repositories/classRepository.js`: Data access for class entity

## Best Practices

1. **Keep UI Components Pure**: UI components should focus on rendering and user interaction.
2. **Use Hooks for State Management**: Custom hooks should handle all state management and data fetching.
3. **Business Logic in Services**: All business logic should reside in service classes.
4. **Data Access in Repositories**: All database interactions should be in repository classes.
5. **Follow Consistent Patterns**: Use the same patterns across different features.

## Adding New Features

When adding a new feature:

1. Add data access functions to repositories or create a new repository
2. Add business logic to services or create a new service
3. Create custom hooks to connect UI with services
4. Create UI components and pages using the hooks

## Error Handling

- Repositories: Return `{ data, error }` objects
- Services: Enhance error messages, perform logging, and return consistent result objects
- Hooks: Store errors in state and provide error handling functions
- UI: Display error messages from hooks 