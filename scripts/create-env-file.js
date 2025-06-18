const fs = require("fs")
const path = require("path")

console.log("🔧 Creating .env.local file...")

const envContent = `# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# Supabase Configuration (already configured)
SUPABASE_URL=${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}

# Database Configuration (already configured)
POSTGRES_URL=${process.env.POSTGRES_URL || ""}
POSTGRES_PRISMA_URL=${process.env.POSTGRES_PRISMA_URL || ""}
`

const envPath = path.join(process.cwd(), ".env.local")

try {
  fs.writeFileSync(envPath, envContent)
  console.log("✅ Created .env.local file successfully!")
  console.log("")
  console.log("📝 Next steps:")
  console.log("1. Open .env.local file")
  console.log('2. Replace "your_vapi_api_key_here" with your actual VAPI API key')
  console.log("3. Get your API key from: https://dashboard.vapi.ai")
  console.log("4. Run: node scripts/validate-vapi-setup.js")
  console.log("")
  console.log("🔑 Your VAPI credentials:")
  console.log("   Assistant ID: d63127d5-8ec7-4ed7-949a-1942ee4a3917")
  console.log("   Share Key: 5d2ff1e9-46b9-4b45-8369-e6f0c65cb063")
  console.log("   API Key: [You need to add this]")
} catch (error) {
  console.error("❌ Error creating .env.local file:", error.message)
}
