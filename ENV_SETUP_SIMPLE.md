# 🚀 Simple Environment Setup Guide

## Required Environment Variables

### 🔒 Server-Side Variables (Secure)
\`\`\`env
# VAPI Configuration (Server-side only)
VAPI_API_KEY=fac3d79f-ac5c-4548-9581-be2a06fcdca1
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# Supabase Configuration (Server-side)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
\`\`\`

### 🌐 Client-Side Variables (Public)
\`\`\`env
# VAPI Public Configuration
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917

# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## 🔧 Setup Steps

### 1. **Local Development**
Create `.env.local` file:
\`\`\`env
# Server-side VAPI (secure)
VAPI_API_KEY=fac3d79f-ac5c-4548-9581-be2a06fcdca1
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# Client-side VAPI (public)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917

# Add your Supabase credentials here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 2. **Vercel Deployment**
Add these environment variables in Vercel dashboard:
- `VAPI_API_KEY` = `fac3d79f-ac5c-4548-9581-be2a06fcdca1`
- `VAPI_SHARE_KEY` = `5d2ff1e9-46b9-4b45-8369-e6f0c65cb063`
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID` = `d63127d5-8ec7-4ed7-949a-1942ee4a3917`

### 3. **Test the Setup**
\`\`\`bash
npm run dev
\`\`\`

Visit: `http://localhost:3000/api/vapi/reports` to test VAPI connection.

## ✅ Security Features
- ✅ VAPI API keys are server-side only
- ✅ No sensitive data exposed to client
- ✅ Secure webhook processing
- ✅ Real-time voice report integration

## 🎤 VAPI Integration Features
- **Real-time voice reports** processing
- **Automatic case creation** from transcripts
- **Live dashboard** updates
- **Secure server-side** API operations

## Step 1: Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw)
2. Click on **Settings** → **API**
3. Copy these two keys:
   - **anon key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Get Your VAPI Keys

1. Go to your VAPI Dashboard
2. Get your **API Key** (keep this secure - server-side only!)
3. Get your **Assistant ID** (safe for client-side)
4. Get your **Share Key** (server-side only)

## Step 3: Update Your .env.local File

Create or update `.env.local` in your project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY_HERE

# VAPI Configuration (secure server-side)
VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
VAPI_SHARE_KEY=YOUR_VAPI_SHARE_KEY_HERE
NEXT_PUBLIC_VAPI_ASSISTANT_ID=YOUR_ASSISTANT_ID_HERE

# Database URLs (for reference)
POSTGRES_URL=postgresql://postgres:StartNew2025!@db.vnjfnlnwfhnwzcfkdrsw.supabase.co:5432/postgres
\`\`\`

## Step 4: Run Database Setup

1. **Create Tables**: Run the SQL script in Supabase SQL Editor
2. **Add Sample Data**: Run the data population script
3. **Test Connection**: Run the connection test script

## Step 5: Test the Application

1. Start your development server: `npm run dev`
2. Visit the ethics officer dashboard
3. Try making a test report
4. Verify VAPI integration works

## 🔒 Security Notes

- **VAPI_API_KEY** is server-side only - never expose in client code
- **VAPI_SHARE_KEY** is server-side only - never expose in client code
- Only **NEXT_PUBLIC_** variables are safe for client-side use
- VAPI operations now use secure server actions

## Troubleshooting

- **Connection Issues**: Check your anon key is correct
- **Permission Errors**: Make sure RLS policies are set up
- **VAPI Issues**: Verify the API keys are set server-side only
- **Security Errors**: Ensure no sensitive keys are in client code
