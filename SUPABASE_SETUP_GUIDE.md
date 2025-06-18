# Supabase Setup Guide for Aegis Whistle Platform

## Project Details
- **Project ID**: vnjfnlnwfhnwzcfkdrsw
- **URL**: https://vnjfnlnwfhnwzcfkdrsw.supabase.co
- **Database**: postgres
- **Password**: StartNew2025!

## Step 1: Get API Keys from Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw)
2. Navigate to **Settings** > **API**
3. Copy the following keys:
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Get VAPI Keys

1. Go to your VAPI Dashboard
2. Get your **API Key** (keep secure - server-side only!)
3. Get your **Assistant ID** 
4. Get your **Share Key** (server-side only)

## Step 3: Update Environment Variables

Create or update your `.env.local` file with these values:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_FROM_DASHBOARD
SUPABASE_ANON_KEY=YOUR_ANON_KEY_FROM_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD
SUPABASE_JWT_SECRET=OXiiRK1ZmZlyFMPowMhMOh1tjrzM2yH2cMugkf79I4JMp3gi1lxguKehbvlImiAV8hzCaRsnglYv+zU5rgiFXA==

# PostgreSQL Configuration
POSTGRES_URL=postgresql://postgres:StartNew2025!@db.vnjfnlnwfhnwzcfkdrsw.supabase.co:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:StartNew2025!@db.vnjfnlnwfhnwzcfkdrsw.supabase.co:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:StartNew2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres
POSTGRES_HOST=db.vnjfnlnwfhnwzcfkdrsw.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=StartNew2025!
POSTGRES_DATABASE=postgres

# VAPI Configuration (secure server-side)
VAPI_API_KEY=YOUR_VAPI_API_KEY_HERE
VAPI_SHARE_KEY=YOUR_VAPI_SHARE_KEY_HERE
NEXT_PUBLIC_VAPI_ASSISTANT_ID=YOUR_VAPI_ASSISTANT_ID_HERE
\`\`\`

## Step 4: Database Setup

Run these scripts in order:

1. **Create Database Schema**:
   \`\`\`bash
   # Run the SQL script in Supabase SQL Editor or via psql
   scripts/01_create_complete_database_schema.sql
   \`\`\`

2. **Populate Dummy Data**:
   \`\`\`bash
   # Run the SQL script to add test data
   scripts/02_populate_dummy_data.sql
   \`\`\`

3. **Test Connection**:
   \`\`\`bash
   # Run the Node.js test script
   node scripts/03_test_supabase_connection.js
   \`\`\`

## Step 5: Verification Checklist

### Database Tables Created ✅
- [ ] profiles (users)
- [ ] reports (main reports table)
- [ ] cases (legacy compatibility)
- [ ] vapi_reports (voice reports staging)
- [ ] case_updates
- [ ] interviews
- [ ] investigator_queries
- [ ] audit_trails
- [ ] reward_transactions

### Sample Data Populated ✅
- [ ] 10 user profiles (admin, ethics officers, investigators)
- [ ] 25 reports with different sources (VAPI, Map, Manual)
- [ ] 15 legacy cases
- [ ] 10 VAPI reports with transcripts
- [ ] 30 case updates
- [ ] 20 interviews
- [ ] 15 investigator queries
- [ ] 8 reward transactions
- [ ] 50 audit trail entries

### Application Features ✅
- [ ] VAPI voice reports flow to ethics officer dashboard (via server actions)
- [ ] Map reports with location data
- [ ] Manual reports through forms
- [ ] 10-digit alphanumeric keys for all reports
- [ ] Report source classification (VAPIReport, MapReport, ManualReport)
- [ ] Case assignment and management
- [ ] Reward processing system
- [ ] Audit logging

## Step 6: Testing Each Feature

### 1. Test VAPI Integration (Secure)
- Click the voice assistant button on homepage
- Make a test voice report
- Check if it appears in ethics officer dashboard
- **Note**: VAPI operations now use secure server actions

### 2. Test Map Reporting
- Go to `/reportOnMap`
- Submit a location-based report
- Verify it appears with MapReport classification

### 3. Test Manual Reporting
- Go to `/report`
- Submit a traditional form report
- Verify it appears with ManualReport classification

### 4. Test Ethics Officer Dashboard
- Go to `/dashboard/ethics-officer`
- Verify all report types are visible
- Test case assignment, resolution, and escalation

### 5. Test Database Connectivity
- Check that all CRUD operations work
- Verify data persistence
- Test real-time updates

## Security Notes

### 🔒 Important Security Updates

- **VAPI API keys are now server-side only** for enhanced security
- **Never expose sensitive API keys** in client-side code
- **Use server actions** for all VAPI operations
- **Only NEXT_PUBLIC_ variables** are safe for client-side use

### Safe vs Unsafe Variables

**✅ Safe for client-side:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

**❌ Server-side only:**
- `VAPI_API_KEY`
- `VAPI_SHARE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your ANON_KEY and SERVICE_ROLE_KEY
   - Make sure there are no extra quotes or spaces

2. **"relation does not exist" error**:
   - Run the database schema creation script
   - Check if tables were created successfully

3. **VAPI connection issues**:
   - Verify VAPI_API_KEY is set server-side only
   - Check that server actions are being used for VAPI operations

4. **Security errors**:
   - Ensure no sensitive keys are exposed in client code
   - Use server actions for all sensitive operations

### Support Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw)
- Project Support: Contact your development team

---

**Project**: Aegis Whistle Platform  
**Database**: vnjfnlnwfhnwzcfkdrsw  
**Security**: Enhanced with server-side VAPI operations  
**Last Updated**: January 2025
