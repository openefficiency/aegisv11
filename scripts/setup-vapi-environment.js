#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔧 Setting up VAPI Environment Variables...")

// Your VAPI credentials
const VAPI_CONFIG = {
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: "d63127d5-8ec7-4ed7-949a-1942ee4a3917",
  VAPI_SHARE_KEY: "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063",
  // VAPI_API_KEY should be set manually for security
}

const envPath = path.join(process.cwd(), ".env.local")

function updateEnvFile() {
  let envContent = ""

  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
    console.log("📄 Found existing .env.local file")
  } else {
    console.log("📄 Creating new .env.local file")
  }

  // Update or add VAPI variables
  Object.entries(VAPI_CONFIG).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, "m")
    const newLine = `${key}=${value}`

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine)
      console.log(`✅ Updated ${key}`)
    } else {
      envContent += `\n${newLine}`
      console.log(`➕ Added ${key}`)
    }
  })

  // Add VAPI_API_KEY placeholder if not exists
  if (!envContent.includes("VAPI_API_KEY=")) {
    envContent += "\n# VAPI_API_KEY=your_vapi_api_key_here"
    console.log("📝 Added VAPI_API_KEY placeholder (set this manually)")
  }

  // Write the updated content
  fs.writeFileSync(envPath, envContent.trim() + "\n")
  console.log("💾 Environment file updated successfully!")
}

function validateVAPISetup() {
  console.log("\n🔍 Validating VAPI Setup...")

  const requiredVars = ["NEXT_PUBLIC_VAPI_ASSISTANT_ID", "VAPI_SHARE_KEY", "VAPI_API_KEY"]

  const envContent = fs.readFileSync(envPath, "utf8")
  const missingVars = []

  requiredVars.forEach((varName) => {
    const regex = new RegExp(`^${varName}=.+$`, "m")
    if (!regex.test(envContent) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName)
    }
  })

  if (missingVars.length === 0) {
    console.log("✅ All VAPI environment variables are configured!")
  } else {
    console.log("⚠️  Missing or incomplete variables:")
    missingVars.forEach((varName) => {
      console.log(`   - ${varName}`)
    })
  }

  return missingVars.length === 0
}

function displayVAPIInfo() {
  console.log("\n📋 VAPI Configuration Summary:")
  console.log(`   Assistant ID: ${VAPI_CONFIG.NEXT_PUBLIC_VAPI_ASSISTANT_ID}`)
  console.log(`   Share Key: ${VAPI_CONFIG.VAPI_SHARE_KEY}`)
  console.log(
    `   Demo URL: https://vapi.ai/?demo=true&shareKey=${VAPI_CONFIG.VAPI_SHARE_KEY}&assistantId=${VAPI_CONFIG.NEXT_PUBLIC_VAPI_ASSISTANT_ID}`,
  )
}

// Main execution
try {
  updateEnvFile()
  const isValid = validateVAPISetup()
  displayVAPIInfo()

  if (!isValid) {
    console.log("\n🔑 Next Steps:")
    console.log("1. Set your VAPI_API_KEY in .env.local")
    console.log("2. Run: npm run dev")
    console.log("3. Test voice functionality at /test-voice")
  } else {
    console.log("\n🚀 VAPI setup complete! You can now:")
    console.log("1. Run: npm run dev")
    console.log("2. Test voice functionality at /test-voice")
    console.log("3. Use voice reports in the dashboard")
  }
} catch (error) {
  console.error("❌ Error setting up VAPI environment:", error.message)
  process.exit(1)
}
