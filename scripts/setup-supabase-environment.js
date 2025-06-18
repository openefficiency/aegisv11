const fs = require("fs")

console.log("🔧 Setting up Supabase Environment with Real Credentials")
console.log("=".repeat(60))

try {
  // Create .env.local file with your actual Supabase credentials
  const envContent = `# Supabase Configuration - REAL CREDENTIALS
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3Mjg3NCwiZXhwIjoyMDUwNTQ4ODc0fQ.SERVICE_ROLE_KEY_HERE
SUPABASE_JWT_SECRET=OXiiRK1ZmZlyFMPowMhMOh1tjrzM2yH2cMugkf79I4JMp3gi1lxguKehbvlImiAV8hzCaRsnglYv+zU5rgiFXA==

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

  fs.writeFileSync(".env.local", envContent)
  console.log("✅ Created .env.local with REAL Supabase credentials")

  console.log("\n🎉 Supabase Environment Setup Complete!")
  console.log("\n📝 Database Configuration:")
  console.log("✅ Project ID: vnjfnlnwfhnwzcfkdrsw")
  console.log("✅ URL: https://vnjfnlnwfhnwzcfkdrsw.supabase.co")
  console.log("✅ Direct Connection: Configured")
  console.log("✅ Transaction Pooler: Configured")
  console.log("✅ Session Pooler: Configured")
  console.log("✅ JWT Secret: Configured")

  console.log("\n📝 VAPI Configuration:")
  console.log("✅ API Key: fac3d79f-ac5c-4548-9581-be2a06fcdca1")
  console.log("✅ Assistant ID: d63127d5-8ec7-4ed7-949a-1942ee4a3917")
  console.log("✅ Share Key: 5d2ff1e9-46b9-4b45-8369-e6f0c65cb063")

  console.log("\n📝 Next steps:")
  console.log("1. Get your Supabase Service Role Key from the dashboard")
  console.log("2. Replace SERVICE_ROLE_KEY_HERE in .env.local")
  console.log("3. Run: node scripts/test-database-connection.js")
  console.log("4. Run the SQL scripts in Supabase SQL Editor")
} catch (error) {
  console.error("❌ Setup failed:", error.message)
  process.exit(1)
}
