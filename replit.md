# Project Dashboard System

## Overview

This is a full-stack React application for managing project dashboards with activity tracking, metrics visualization, and team collaboration features. The application uses a modern tech stack with TypeScript, Express.js backend, React frontend with ShadCN UI components, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: ShadCN UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: RESTful API with structured route handling
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Database Schema
The system uses a relational database with the following core entities:
- **Users**: User management with roles (user, admin, manager)
- **Dashboards**: Project dashboards with themes and settings
- **Projects**: Project entities linked to dashboards with budget tracking
- **Activities**: Task/activity tracking with status, priority, and metrics
- **Dashboard Shares**: Sharing permissions for collaborative access
- **Activity Logs**: Audit trail for user actions
- **Custom Columns/Charts**: Extensible dashboard customization

## Key Components

### Authentication & Authorization
- Role-based access control (user, admin, manager)
- Email-based user identification
- Dashboard sharing with permission levels

### Dashboard Management
- Multi-dashboard support with customizable themes
- KPI cards showing project metrics (SPI, CPI, completion rates)
- Real-time activity tracking and status updates
- Custom chart and column support for extensibility

### Activity Tracking
- Comprehensive activity management with disciplines and responsibilities
- Status tracking (not_started, in_progress, completed, delayed, cancelled)
- Priority levels (low, medium, high, critical)
- Budget tracking with planned vs actual costs
- Earned value management calculations

### UI/UX Features
- Responsive design with mobile-first approach
- Dark/light theme switching
- Sidebar navigation with collapsible panels
- Modal dialogs for sharing and configuration
- Toast notifications for user feedback
- Data visualization with charts and progress indicators

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Layer**: Express.js routes handle HTTP requests with validation
3. **Business Logic**: Storage layer processes data operations
4. **Database**: Drizzle ORM executes type-safe SQL queries against PostgreSQL
5. **Response**: JSON responses flow back through the API to update UI state

The application uses optimistic updates and caching strategies to provide a smooth user experience while maintaining data consistency.

## External Dependencies

### Database
- **PostgreSQL Database**: Production-ready PostgreSQL database with full schema
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **Connection**: Direct PostgreSQL connection via `postgres` package
- **Status**: ✅ Connected and operational with real data

### UI Framework
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library for data visualization
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool with HMR and optimized production builds
- **ESBuild**: Fast JavaScript bundler for server-side code
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: Development database with Drizzle migrations
- **Environment**: Replit development environment with cartographer plugin

### Production
- **Build Process**: 
  - Frontend: Vite build creates optimized static assets
  - Backend: ESBuild bundles server code for Node.js execution
- **Deployment**: Single-process deployment serving both API and static files
- **Database**: Production PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

The application is designed for seamless deployment on platforms like Replit, Vercel, or traditional hosting providers with minimal configuration requirements.

## Recent Changes: Architecture changes and feature additions

### January 11, 2025 - Integrated Advanced Customization Features
- **Custom Status Integration**: Added custom status creation directly to table settings (gear icon)
- **Custom Chart Integration**: Added custom chart builder to charts section header
- **Custom KPI Integration**: Added custom KPI manager to KPI cards section
- **Database Migration**: Successfully created custom_statuses and custom_kpis tables
- **UI Enhancement**: Moved customization features from separate dashboard to integrated UI components
- **User Experience**: Streamlined customization workflow within existing interface elements

### January 11, 2025 - Comprehensive Date Changes Audit System
- **Date Changes Audit Table**: Created complete audit trail table with user tracking, timestamps, and justifications
- **Mandatory Justification**: All date modifications now require user justification and reason selection
- **Activity Date Editor**: New component for editing dates with integrated audit workflow
- **Date Audit Viewer**: Comprehensive viewer showing complete history of date changes with filtering
- **API Integration**: Full backend support with audit creation, retrieval, and activity update endpoints
- **User Interface**: Seamless integration with existing activity table and dashboard navigation
- **Audit Features**: Change reason categorization, impact descriptions, and approval workflow support

### January 11, 2025 - User and Project Management System
- **User Creation**: Complete user creation modal with role-based permissions (admin, manager, user)
- **Project Creation**: Full project creation system with budget tracking, status management, and manager assignment
- **Permission Levels**: Role-based access control with detailed permission descriptions
- **User Management**: List view of all users with role badges and management actions
- **Project Management**: Project listing with budget progress, status tracking, and timeline visualization
- **API Integration**: Full CRUD operations for users and projects with proper validation
- **UI Components**: Modern modal-based interface with Apple-style design consistency

### January 11, 2025 - Critical System Fixes and Stabilization
- **Date Validation Fixed**: Resolved critical date validation errors across all endpoints (projects, activities, KPIs)
- **KPI Creation Repair**: Fixed KPI creation system with proper database ID generation instead of string IDs
- **Activity Import System**: Fixed activity import with proper date conversion and validation
- **Project Manager Field**: Temporarily removed manager assignment to resolve database schema conflicts
- **Error Handling**: Improved error handling and validation across all API endpoints
- **System Stability**: All core functionality now working reliably without validation errors

### January 11, 2025 - Final Validation and Type Conversion Fixes
- **Numeric Field Conversion**: Fixed validation errors by properly converting numeric fields to strings for database storage
- **Activity Creation**: Resolved frontend-backend communication issues with proper type handling
- **Import System**: Fixed activity import to handle mixed data types correctly
- **KPI System**: Ensured proper type handling for all KPI creation operations
- **Chart Creation**: Verified chart creation works with all configuration options
- **Full System Testing**: Confirmed all major functionality works without validation errors

### January 11, 2025 - System Fixes and Sidebar Enhancement
- **Chart Builder Fixed**: Corrected data structure mapping between frontend and backend for chart creation
- **KPI Validation Fixed**: Resolved numeric field validation issues for KPI creation with proper type handling
- **Sidebar Navigation Enhanced**: Added proper click handlers for Users, Projects, Reports, and Settings sections
- **Modal Integration**: Connected sidebar navigation to existing modal systems for seamless user experience
- **System Stability**: All core functionality now operational including data import, KPI creation, and chart building
- **User Experience**: Improved navigation flow and eliminated broken links in sidebar menu