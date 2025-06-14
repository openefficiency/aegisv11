# Aegis Whistleblower Platform

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

A modern whistleblower reporting platform built with Next.js, Supabase, and integrated voice capabilities.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/0jdY4HxTOer)

## Overview

This repository contains the Aegis Whistleblower Platform, a secure and user-friendly application for reporting misconduct and unethical behavior. The platform features:

- 🔒 **Secure reporting** with encrypted data handling
- 🎤 **Voice integration** powered by VAPI for accessibility
- 📊 **Dashboard analytics** for administrators
- 🗺️ **Interactive mapping** for location-based reports
- 👥 **User management** with role-based access control

This repository stays in sync with your deployed chats on [v0.dev](https://v0.dev). Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Voice Integration**: VAPI
- **Maps**: Leaflet with React Leaflet
- **Deployment**: Vercel

## Deployment

Your project is live at:

**[https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform](https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform)**

## Project Structure

```
aegisv11/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard pages
│   ├── login/             # Authentication pages
│   ├── report/            # Report submission pages
│   └── reportOnMap/       # Map-based reporting
├── components/            # Reusable React components
│   └── ui/               # UI component library
├── lib/                  # Utility functions and configurations
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## Continue Development

Continue building your app on:

**[https://v0.dev/chat/projects/0jdY4HxTOer](https://v0.dev/chat/projects/0jdY4HxTOer)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- VAPI account for voice integration

### Local Development

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd aegisv11
   pnpm install
   ```

2. Create a `.env.local` file in the root directory and add your environment variables:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # VAPI Configuration
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The platform uses Supabase for data storage. You'll find SQL scripts in the [`scripts/`](./scripts/) directory to set up the necessary tables:

- [`create_reports_table_v2.sql`](./scripts/create_reports_table_v2.sql) - Creates the reports table
- [`add_users_safe.sql`](./scripts/add_users_safe.sql) - Sets up user management
- [`create-demo-users.js`](./scripts/create-demo-users.js) - Creates demo users for testing

**Important:** If the Supabase variables are missing in production, API routes will fail.

## Contributing

This project is built with [v0.dev](https://v0.dev) and follows modern React/Next.js best practices. When contributing:

1. Make changes through the [v0.dev interface](https://v0.dev/chat/projects/0jdY4HxTOer) when possible
2. Test your changes locally before deployment
3. Ensure all environment variables are properly configured
4. Follow the existing code style and component patterns

## License

This project is private and proprietary. All rights reserved.
