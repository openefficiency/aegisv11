#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 VAPI Setup Validation")
console.log("=".repeat(30))

async function validateVAPISetup() {
  try {
    // Check environment file
    const envPath = path.join(process.cwd(), ".env.local")

    if (!fs.existsSync(envPath)) {
      console.log("❌ .env.local file not found")
      console.log("   Run: node scripts/setup-vapi-api-key.js")
      return false
    }

    const envContent = fs.readFileSync(envPath, "utf8")

    // Check required VAPI variables
    const requiredVars = {
      VAPI_API_KEY: "Your private VAPI API key",
      NEXT_PUBLIC_VAPI_ASSISTANT_ID: "Your VAPI assistant ID",
      VAPI_SHARE_KEY: "Your VAPI share key",
    }

    console.log("\n📋 Environment Variables Check:")
    let allVarsPresent = true

    Object.entries(requiredVars).forEach(([varName, description]) => {
      const regex = new RegExp(`^${varName}=.+$`, "m")
      const match = envContent.match(regex)

      if (match && !envContent.includes(`${varName}=your_`) && !envContent.includes(`${varName}=`)) {
        console.log(`✅ ${varName}: Set`)
      } else {
        console.log(`❌ ${varName}: Missing or placeholder`)
        console.log(`   Description: ${description}`)
        allVarsPresent = false
      }
    })

    if (!allVarsPresent) {
      console.log("\n🔧 To fix missing variables:")
      console.log("   Run: node scripts/setup-vapi-api-key.js")
      return false
    }

    // Test VAPI connection
    console.log("\n🧪 Testing VAPI Connection...")

    // Extract API key from env content
    const apiKeyMatch = envContent.match(/^VAPI_API_KEY=(.+)$/m)
    const assistantIdMatch = envContent.match(/^NEXT_PUBLIC_VAPI_ASSISTANT_ID=(.+)$/m)

    if (!apiKeyMatch || !assistantIdMatch) {
      console.log("❌ Could not extract VAPI credentials from .env.local")
      return false
    }

    const apiKey = apiKeyMatch[1].trim()
    const assistantId = assistantIdMatch[1].trim()

    const connectionTest = await testVAPIConnection(apiKey, assistantId)

    if (connectionTest) {
      console.log("\n🎉 VAPI Setup Complete!")
      console.log("✅ All environment variables configured")
      console.log("✅ VAPI API connection successful")
      console.log("✅ Ready for deployment")

      console.log("\n🚀 Next Steps:")
      console.log("1. Run: npm run dev")
      console.log("2. Test voice functionality at: http://localhost:3000/test-voice")
      console.log("3. Deploy to Vercel when ready")

      return true
    } else {
      console.log("\n❌ VAPI connection failed")
      console.log("Please check your API key and try again")
      return false
    }
  } catch (error) {
    console.error("❌ Error validating VAPI setup:", error.message)
    return false
  }
}

async function testVAPIConnection(apiKey, assistantId) {
  try {
    console.log("   Connecting to VAPI API...")

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const assistant = await response.json()
      console.log("✅ VAPI API connection successful!")
      console.log(`   Assistant: ${assistant.name || "Unnamed Assistant"}`)
      console.log(`   Model: ${assistant.model?.provider || "Unknown"} ${assistant.model?.model || ""}`)
      return true
    } else {
      console.log("❌ VAPI API connection failed!")
      console.log(`   Status: ${response.status} ${response.statusText}`)

      if (response.status === 401) {
        console.log("   🔍 Invalid API key - please check your credentials")
      } else if (response.status === 404) {
        console.log("   🔍 Assistant not found - please check your Assistant ID")
      } else if (response.status === 403) {
        console.log("   🔍 Access forbidden - please check your API permissions")
      }

      return false
    }
  } catch (error) {
    console.log("❌ Network error testing VAPI connection:", error.message)
    return false
  }
}

// Main execution
validateVAPISetup()
