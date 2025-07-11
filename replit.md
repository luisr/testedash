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