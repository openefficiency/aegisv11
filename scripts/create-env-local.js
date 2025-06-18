const fs = require("fs")
const path = require("path")

console.log("🔧 Creating .env.local file with your Supabase credentials...")

const envContent = `# Supabase Configuration - REAL CREDENTIALS
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3Mjg3NCwiZXhwIjoyMDUwNTQ4ODc0fQ.SERVICE_ROLE_KEY_HERE
SUPABASE_JWT_SECRET=OXiiRK1ZmZlyFMPowMhMOh1tjrzM2yH2cMugkf79I4JMp3gi1lxguKehbvlImiAV8hzCaRsnglYv+zU5rgiFXA==
SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH

# Database Connection URLs
POSTGRES_URL=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:StartNew2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres
POSTGRES_PRISMA_URL=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:StartNew2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://postgres:StartNew2025!@db.vnjfnlnwfhnwzcfkdrsw.supabase.co:5432/postgres
POSTGRES_USER=postgres
POSTGRES_HOST=db.vnjfnlnwfhnwzcfkdrsw.supabase.co
POSTGRES_PASSWORD=StartNew2025!
POSTGRES_DATABASE=postgres

# VAPI Configuration - REAL CREDENTIALS
VAPI_API_KEY=fac3d79f-ac5c-4548-9581-be2a06fcdca1
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
NEXT_PUBLIC_VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

try {
  const envPath = path.join(process.cwd(), ".env.local")
  fs.writeFileSync(envPath, envContent)

  console.log("✅ Successfully created .env.local file!")
  console.log("")
  console.log("📝 Configuration Summary:")
  console.log("✅ Supabase Project: vnjfnlnwfhnwzcfkdrsw")
  console.log("✅ Database Password: StartNew2025!")
  console.log("✅ VAPI API Key: fac3d79f-ac5c-4548-9581-be2a06fcdca1")
  console.log("✅ VAPI Assistant: d63127d5-8ec7-4ed7-949a-1942ee4a3917")
  console.log("")
  console.log("🔑 IMPORTANT: You need to get your Supabase Service Role Key")
  console.log("1. Go to: https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw/settings/api")
  console.log("2. Copy the 'service_role' key")
  console.log("3. Replace 'SERVICE_ROLE_KEY_HERE' in .env.local")
  console.log("")
  console.log("📝 Next steps:")
  console.log("1. Update the service role key in .env.local")
  console.log("2. Run: node scripts/test-database-connection.js")
} catch (error) {
  console.error("❌ Error creating .env.local:", error.message)
  process.exit(1)
}
