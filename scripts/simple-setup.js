const fs = require("fs")
const path = require("path")

console.log("🔧 VAPI Environment Setup with Real Credentials")
console.log("=".repeat(50))

try {
  // Create .env.local file with your actual VAPI credentials
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vnjfnlnwfhnwzcfkdrsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuamZubG53Zmhud3pjZmtkcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Hs8eiQJBiga6TgmkBgNjKLCnWqjhz_Qs8kJGHGHGHGH
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
POSTGRES_URL=your_postgres_url_here

# VAPI Configuration - REAL CREDENTIALS
VAPI_API_KEY=fac3d79f-ac5c-4548-9581-be2a06fcdca1
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
NEXT_PUBLIC_VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

  fs.writeFileSync(".env.local", envContent)
  console.log("✅ Created .env.local with REAL VAPI credentials")

  // Create directories
  const dirs = ["public/images", "public/images/team"]
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Created ${dir}`)
    }
  })

  console.log("\n🎉 Setup complete with REAL VAPI credentials!")
  console.log("\n📝 VAPI Configuration:")
  console.log("✅ API Key: fac3d79f-ac5c-4548-9581-be2a06fcdca1")
  console.log("✅ Assistant ID: d63127d5-8ec7-4ed7-949a-1942ee4a3917")
  console.log("✅ Share Key: 5d2ff1e9-46b9-4b45-8369-e6f0c65cb063")
  console.log("\n🔗 VAPI URL:")
  console.log(
    "https://vapi.ai/?demo=true&shareKey=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063&assistantId=d63127d5-8ec7-4ed7-949a-1942ee4a3917",
  )

  console.log("\n📝 Next steps:")
  console.log("1. Run: npm install")
  console.log("2. Run: npm run dev")
  console.log("3. Test VAPI integration at http://localhost:3000")
} catch (error) {
  console.error("❌ Setup failed:", error.message)
  process.exit(1)
}
