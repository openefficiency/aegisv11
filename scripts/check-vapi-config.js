const fs = require("fs")
const path = require("path")

console.log("🔍 Checking VAPI Configuration")
console.log("=".repeat(35))

const envPath = path.join(process.cwd(), ".env.local")

if (!fs.existsSync(envPath)) {
  console.log("❌ .env.local file not found")
  console.log("   Run: node scripts/create-env-file.js")
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, "utf8")

// Check VAPI variables
const checks = [
  {
    name: "VAPI_API_KEY",
    required: true,
    placeholder: "your_vapi_api_key_here",
  },
  {
    name: "NEXT_PUBLIC_VAPI_ASSISTANT_ID",
    required: true,
    expected: "d63127d5-8ec7-4ed7-949a-1942ee4a3917",
  },
  {
    name: "VAPI_SHARE_KEY",
    required: true,
    expected: "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063",
  },
]

let allGood = true

console.log("\n📋 Environment Variables:")

checks.forEach((check) => {
  const regex = new RegExp(`^${check.name}=(.+)$`, "m")
  const match = envContent.match(regex)

  if (!match) {
    console.log(`❌ ${check.name}: Missing`)
    allGood = false
  } else {
    const value = match[1].trim()

    if (check.placeholder && value === check.placeholder) {
      console.log(`⚠️  ${check.name}: Still has placeholder value`)
      console.log(`   Please replace "${check.placeholder}" with your actual API key`)
      allGood = false
    } else if (check.expected && value !== check.expected) {
      console.log(`⚠️  ${check.name}: Unexpected value`)
      console.log(`   Expected: ${check.expected}`)
      console.log(`   Found: ${value}`)
      allGood = false
    } else {
      console.log(`✅ ${check.name}: Configured`)
    }
  }
})

if (allGood) {
  console.log("\n🎉 VAPI Configuration Complete!")
  console.log("✅ All environment variables are set correctly")
  console.log("\n🚀 Next steps:")
  console.log("1. Run: npm run dev")
  console.log("2. Test at: http://localhost:3000/test-voice")
  console.log("3. Deploy when ready!")
} else {
  console.log("\n❌ Configuration incomplete")
  console.log("\n🔧 To fix:")
  console.log("1. Open .env.local file")
  console.log("2. Get your VAPI API key from: https://dashboard.vapi.ai")
  console.log('3. Replace "your_vapi_api_key_here" with your actual API key')
  console.log("4. Run this script again to verify")
}
