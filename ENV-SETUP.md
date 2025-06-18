# Environment Setup Guide

This document provides instructions for setting up the environment variables required for the Aegis Whistle Platform.

## Required Environment Variables

The following environment variables are required for the application to function properly:

### Supabase Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### VAPI Configuration

| Variable | Description | Example | Location |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Your VAPI Assistant ID | `asst_xxxxxxxxxxxxxxxx` | Client-side |
| `VAPI_API_KEY` | Your VAPI API key | `vapi_live_xxxxxxxxxxxxxxxx` | **Server-side only** |
| `VAPI_SHARE_KEY` | Your VAPI Share key | `share_xxxxxxxxxxxxxxxx` | **Server-side only** |

## Optional Environment Variables

These variables are optional but may be required for certain features:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `POSTGRES_URL` | Direct PostgreSQL connection URL | `postgresql://postgres:password@localhost:5432/postgres` |

## Setting Up Environment Variables

### Local Development

1. Create a `.env.local` file in the root directory of the project
2. Add the required environment variables to the file:

\`\`\`
# Client-side variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-vapi-assistant-id

# Server-side only variables (secure)
VAPI_API_KEY=your-vapi-api-key
VAPI_SHARE_KEY=your-vapi-share-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

3. Restart your development server

### Production Deployment

When deploying to production, add these environment variables to your hosting platform:

#### Vercel

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add each required variable
4. **Important**: Mark VAPI_API_KEY and VAPI_SHARE_KEY as server-side only
5. Redeploy your application

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never expose VAPI_API_KEY in client-side code** - This key provides full access to your VAPI account
2. **Use server actions** for all VAPI operations that require the API key
3. **Only NEXT_PUBLIC_ variables** are safe for client-side use
4. **Regularly rotate API keys** for security

### Safe vs Unsafe Variables

**✅ Safe for client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

**❌ Server-side only (sensitive):**
- `VAPI_API_KEY`
- `VAPI_SHARE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Common Issues

1. **Quotes in Environment Variables**: Make sure your environment variables don't have quotes around them.

2. **Missing Variables**: If you see errors about missing environment variables, check that all required variables are set.

3. **VAPI Connection Issues**: Ensure VAPI_API_KEY is set server-side only and not exposed to client.

4. **Connection Issues**: If the application can't connect to services, verify that your credentials are correct.

### Validation

The application includes a validation script to check your environment variables:

\`\`\`bash
node scripts/validate-env.js
\`\`\`

This script will check if all required environment variables are set and properly formatted.

## Need Help?

If you're still having issues, please contact the development team for assistance.
