# Tô Sabendo - Project Dashboard System

## Overview

This is a full-stack React application for managing project dashboards with activity tracking, metrics visualization, and team collaboration features. The application uses a modern tech stack with TypeScript, Express.js backend, React frontend with ShadCN UI components, and PostgreSQL database with Drizzle ORM. The system is branded as "Tô Sabendo" and incorporates BeachPark's visual identity.

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

### January 11, 2025 - Final System Corrections and Apple Theme Implementation
- **User Management Fixed**: Implemented complete deleteUser functionality with proper error handling
- **API Error Handling**: Enhanced error logging and response consistency across all endpoints
- **Apple Theme Completed**: Implemented comprehensive Apple-style design system with proper colors and shadows
- **CRUD Operations Verified**: All Create, Read, Update, Delete operations working correctly for users and projects
- **System Integration**: Connected all modal systems properly with sidebar navigation
- **Production Ready**: System fully operational with comprehensive functionality and Apple-style UI

### January 11, 2025 - Modern Visual Design Implementation
- **Modern Color Scheme**: Implemented modern gradient color palette with soft blues and cyans
- **Glassmorphism Effects**: Added backdrop-filter blur effects and translucent backgrounds throughout
- **Enhanced CSS Specificity**: Added comprehensive CSS overrides to ensure new theme applies correctly
- **KPI Card Modernization**: Updated cards with hover effects, gradients, and improved visual hierarchy
- **Button Enhancements**: Added gradient buttons with hover animations and improved shadows
- **Table Improvements**: Enhanced table styling with glass morphism and modern aesthetics
- **Email Validation**: Fixed duplicate email error handling with proper user feedback
- **Theme Forcing System**: Created multiple CSS files (theme-fix.css, force-theme.css) to forcibly apply modern theme and eliminate yellow/amber colors
- **Dashboard Container Classes**: Applied specific CSS classes to dashboard containers to ensure consistent theme application

### January 11, 2025 - Complete System Rebranding and Super User Integration
- **Complete Rebranding**: Successfully changed system name from "ProjectHub" to "Tô Sabendo" across all components
- **BeachPark Logo Integration**: Integrated BeachPark logo across all key UI components (sidebar, login, projects page)
- **Super User Management**: Implemented comprehensive super user system with database schema and UI components
- **Super User Modal**: Added modal for promoting/demoting super users, accessible only by existing super users
- **Access Control**: Implemented super user access control for consolidated dashboard (Dashboard ID 1)
- **Visual Identity**: Complete BeachPark branding with logo integration maintaining premium Apple-style design
- **Database Integration**: Super user functionality fully integrated with PostgreSQL database
- **User Management**: Luis Ribeiro (luis.ribeiro@beachpark.com.br) established as primary super user

### January 11, 2025 - BeachPark Logo Enhancement and Default Password System
- **Logo Enhancement**: Increased BeachPark logo size across all pages for better brand visibility
- **Logo Integration**: Added BeachPark logo to all page headers (sidebar, login, projects, dashboard, 404)
- **Default Password System**: Implemented 'BeachPark@123' as default password for all new users
- **Mandatory Password Change**: Added system requiring users to change password on first login
- **Password Change Modal**: Created comprehensive password change modal with security validation
- **Database Schema**: Added must_change_password column to users table with proper defaults
- **Authentication Flow**: Enhanced login process to detect and enforce password changes
- **Security Features**: Password validation, current password verification, 8-character minimum requirement

### January 11, 2025 - Final System Fixes and Functional Reports Implementation
- **Project Creation Fixed**: Successfully resolved project creation functionality with proper API endpoint and data validation
- **TypeScript Errors Resolved**: Fixed all TypeScript compilation errors in storage.ts including missing imports (ne from drizzle-orm)
- **Database Constraints Fixed**: Improved user deletion with proper foreign key handling and ownership transfer
- **Reports System Implemented**: Created comprehensive report generation system with downloadable files
- **Report Types**: Implemented project reports, user reports, financial reports, and general executive reports
- **Report Format**: Reports generated in readable text format with proper Brazilian Portuguese formatting
- **Database Migration**: Successfully completed must_change_password column addition to users table
- **Full System Testing**: Confirmed all CRUD operations working correctly including user and project management
- **API Endpoints**: All administrative endpoints operational with proper error handling and validation

### January 11, 2025 - Advanced PDF Reports with Gemini AI Integration
- **PDF Generation System**: Implemented comprehensive PDF report generation using jsPDF and jsPDF-autotable
- **Gemini AI Integration**: Added AI-powered observations and recommendations for all report types
- **Visual Report Design**: Created professional PDF reports with BeachPark branding and structured layouts
- **Report Enhancement**: Added detailed financial analysis, project performance metrics, and executive summaries
- **AI-Powered Insights**: Gemini AI generates intelligent observations about project performance, user management, and financial trends
- **Professional Layout**: Reports include tables, charts, executive summaries, and detailed project breakdowns
- **Multi-language Support**: All reports generated in Portuguese with proper date formatting and currency display
- **API Key Integration**: Secure Gemini API key integration for AI-powered report generation
- **Download System**: Seamless PDF download functionality with proper file naming and browser compatibility

### January 11, 2025 - Major Code Refactoring and Performance Optimization
- **Dashboard Refactoring**: Completely restructured dashboard.tsx from 800+ lines to 34 lines using modern React patterns
- **Authentication Context**: Implemented comprehensive AuthContext for centralized user state management
- **Component Modularization**: Separated concerns into DashboardLayout and DashboardContent components
- **Code Cleanup**: Removed 20+ duplicate migration files, test PDFs, and unused components
- **Error Handling**: Fixed critical filter errors on undefined notifications arrays
- **Performance Optimization**: Reduced component complexity and improved render performance
- **Architecture Improvement**: Implemented proper separation of concerns and removed hardcoded user IDs
- **Simplified Layout**: Created stable, simplified DashboardLayout without problematic dependencies
- **Consolidated Backup**: Merged multiple backup components into single, maintainable solution
- **Ready for Deployment**: System optimized and prepared for external deployment on Replit

### January 11, 2025 - Comprehensive Frontend Visual Redesign and Standardization
- **BeachPark Design System**: Created comprehensive design system with Apple-style premium aesthetics
- **Glass Morphism Effects**: Implemented backdrop-filter blur effects and translucent backgrounds throughout
- **Enhanced Modal System**: Redesigned all modals with improved overlay, content styling, and close buttons
- **Button Standardization**: Updated all buttons with gradient backgrounds, hover effects, and consistent styling
- **Card Component Enhancement**: Applied glass morphism and hover effects to all card components
- **Input Field Improvements**: Enhanced input styling with blur effects, better focus states, and rounded corners
- **Status Badge System**: Created standardized status and priority badges with gradient backgrounds
- **Table Enhancements**: Applied new styling to tables with glass morphism and improved hover states
- **Notification System**: Enhanced toast notifications with proper styling variants
- **Component Library Update**: Updated all UI components (Dialog, Button, Card, Input, Badge) with new design system
- **Color Scheme Consistency**: Implemented consistent blue-to-cyan gradient theme across all components
- **Accessibility Improvements**: Added proper focus states and reduced motion preferences
- **Responsive Design**: Ensured all components work properly on mobile and desktop devices

### January 11, 2025 - Optimized API System and Selective Data Invalidation
- **API Request Fixes**: Corrected all API calls in Dependency Manager and Create Sub Activity Modal
- **Selective Query Invalidation**: Implemented targeted cache invalidation to update only specific tables
- **Performance Optimization**: Eliminated full dashboard reloads in favor of specific component updates
- **Dependency Manager**: Fixed API calls and implemented selective table updates for dependencies
- **Sub Activity Creation**: Fixed API calls and implemented selective table updates for activities
- **Toast Notifications**: Enhanced user feedback with specific update confirmations
- **Query Key Alignment**: Aligned all query keys with existing React Query patterns
- **Accessibility Enhancement**: Added proper DialogDescription components to eliminate warnings

### January 11, 2025 - Complete Elimination of Page Reloads and Performance Optimization
- **Eliminated All Page Reloads**: Removed all instances of `window.location.reload()` from the entire codebase
- **Activity Date Editor**: Fixed hook to use selective invalidation instead of full page reload
- **Dashboard Content**: Replaced reload callbacks with targeted React Query invalidation
- **Activities Panel**: Fixed sub-activity creation to use selective cache invalidation
- **Backup Management**: Replaced restore functionality reload with targeted query invalidation
- **Performance Enhancement**: System now updates only affected components without full dashboard reload
- **User Experience**: Dramatically improved responsiveness with instant updates instead of page reloads
- **Memory Optimization**: Reduced memory usage by avoiding complete component re-initialization
- **Network Efficiency**: Minimized unnecessary API calls by targeting specific data updates