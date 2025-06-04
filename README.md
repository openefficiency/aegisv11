# Aegiswhistle platform

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/0jdY4HxTOer)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform](https://vercel.com/shan-9251s-projects/v0-aegiswhistle-platform)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/0jdY4HxTOer](https://v0.dev/chat/projects/0jdY4HxTOer)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


## Configuration

1. Copy `.env.example` to `.env` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

2. Set the following environment variables locally or in Vercel:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_VAPI_API_KEY`
   - `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

If the Supabase variables are missing in production, API routes will fail.
