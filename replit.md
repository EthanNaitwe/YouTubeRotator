# YouTube Auto Viewer Application

## Overview

This is a full-stack YouTube auto viewer application built with React, Node.js, Express, and PostgreSQL. The application allows users to create playlists of YouTube videos, manage multiple YouTube accounts, and automate video viewing with configurable settings. It features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with React plugin and custom aliases

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for JSON parsing and logging
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with structured error handling

### Data Storage
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Serverless connection pooling via @neondatabase/serverless

## Key Components

### Database Schema
- **Videos**: Stores YouTube video information (ID, title, channel, duration, thumbnail)
- **Accounts**: Manages YouTube account credentials and status
- **Viewing Sessions**: Tracks video viewing history and duration
- **Settings**: Application configuration (view duration, account switching, automation preferences)

### Frontend Components
- **Dashboard**: Main application interface combining all features
- **Video Player**: Embedded YouTube player with automation controls
- **Playlist Sidebar**: Video management and URL input for adding new videos
- **Account Manager**: Account credential management interface
- **Automation Controls**: Settings for view duration, account switching, and playlist behavior
- **Statistics Panel**: Analytics dashboard showing viewing metrics

### Backend Services
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **Route Handlers**: RESTful endpoints for CRUD operations on all entities
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Flow

1. **Video Addition**: Users input YouTube URLs → Frontend extracts video ID → Fetches video metadata → Stores in database
2. **Account Management**: Users add account credentials → Stored securely in database → Status tracking for active/ready states
3. **Automation**: User configures settings → Automation engine cycles through videos → Records viewing sessions → Switches accounts based on intervals
4. **Statistics**: Real-time aggregation of viewing data → Display in dashboard analytics

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm and drizzle-zod for type-safe database operations
- **UI Library**: Comprehensive shadcn/ui component set with Radix UI primitives
- **Icons**: Lucide React icons and React Icons for YouTube branding
- **Forms**: React Hook Form with Zod resolvers for validation
- **Dates**: date-fns for date manipulation and formatting

### Development Tools
- **Build**: Vite with TypeScript and React plugins
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Development**: Replit-specific plugins for error handling and cartographer

## Deployment Strategy

### Development
- **Server**: Express server with Vite middleware for HMR
- **Database**: Environment-based DATABASE_URL configuration
- **Build**: Separate client and server TypeScript compilation
- **Assets**: Static file serving with Vite development server

### Production
- **Build Process**: 
  1. Vite builds client to `dist/public`
  2. esbuild bundles server to `dist/index.js`
- **Server**: Node.js serving static files and API routes
- **Database**: Production PostgreSQL via environment configuration

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Type Safety**: Shared schema types between client and server
- **Path Aliases**: Configured for clean imports across the application

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```