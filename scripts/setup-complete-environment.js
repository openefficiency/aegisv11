#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔧 Setting up complete environment for deployment...")

// Create .env.local with all required variables
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH

# Database Configuration
POSTGRES_URL=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
POSTGRES_PRISMA_URL=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:your_password@aws-0-us-west-1.pooler.supabase.com:5432/postgres
POSTGRES_USER=postgres.vnjfnlnwfhnwzcfkdrsw
POSTGRES_PASSWORD=your_postgres_password_here
POSTGRES_DATABASE=postgres
POSTGRES_HOST=aws-0-us-west-1.pooler.supabase.com

# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
NEXT_PUBLIC_VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

// Write .env.local file
const envPath = path.join(process.cwd(), ".env.local")
fs.writeFileSync(envPath, envContent)
console.log("✅ Created .env.local file")

// Create directories if they don't exist
const directories = ["public/images", "public/images/team", "app/api/vapi", "lib", "components", "scripts"]

directories.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

console.log("\n🎉 Environment setup complete!")
console.log("\n📋 Next steps:")
console.log("1. Update the placeholder values in .env.local with your actual credentials")
console.log("2. Run: npm install")
console.log("3. Run: node scripts/final-deployment-check.js")
console.log("4. Deploy to Vercel")
