#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const readline = require("readline")

console.log("🔑 VAPI API Key Setup")
console.log("=".repeat(40))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupVAPIKey() {
  try {
    console.log("\n📋 To get your VAPI API Key:")
    console.log("1. Go to https://dashboard.vapi.ai")
    console.log("2. Sign in to your account")
    console.log("3. Navigate to 'API Keys' or 'Settings'")
    console.log("4. Copy your API Key")
    console.log("\n⚠️  Keep your API key secure - never share it publicly!")

    const apiKey = await question("\n🔑 Enter your VAPI API Key: ")

    if (!apiKey || apiKey.trim().length === 0) {
      console.log("❌ No API key provided. Exiting...")
      rl.close()
      return
    }

    // Basic validation
    if (apiKey.length < 20) {
      console.log("⚠️  Warning: API key seems too short. Please verify it's correct.")
    }

    // Update .env.local file
    const envPath = path.join(process.cwd(), ".env.local")
    let envContent = ""

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8")
      console.log("📄 Found existing .env.local file")
    } else {
      console.log("📄 Creating new .env.local file")
    }

    // Update or add VAPI_API_KEY
    const apiKeyRegex = /^VAPI_API_KEY=.*$/m
    const newApiKeyLine = `VAPI_API_KEY=${apiKey.trim()}`

    if (apiKeyRegex.test(envContent)) {
      envContent = envContent.replace(apiKeyRegex, newApiKeyLine)
      console.log("✅ Updated VAPI_API_KEY in .env.local")
    } else {
      envContent += `\n${newApiKeyLine}`
      console.log("➕ Added VAPI_API_KEY to .env.local")
    }

    // Ensure other VAPI variables are present
    const vapiVars = {
      NEXT_PUBLIC_VAPI_ASSISTANT_ID: "d63127d5-8ec7-4ed7-949a-1942ee4a3917",
      VAPI_SHARE_KEY: "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063",
    }

    Object.entries(vapiVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, "m")
      const newLine = `${key}=${value}`

      if (!regex.test(envContent)) {
        envContent += `\n${newLine}`
        console.log(`➕ Added ${key}`)
      }
    })

    // Write the updated content
    fs.writeFileSync(envPath, envContent.trim() + "\n")
    console.log("💾 Environment file updated successfully!")

    // Test the API key
    console.log("\n🧪 Testing VAPI API Key...")
    await testVAPIConnection(apiKey.trim())

    rl.close()
  } catch (error) {
    console.error("❌ Error setting up VAPI API key:", error.message)
    rl.close()
    process.exit(1)
  }
}

async function testVAPIConnection(apiKey) {
  try {
    const assistantId = "d63127d5-8ec7-4ed7-949a-1942ee4a3917"

    console.log("   Connecting to VAPI API...")

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const assistant = await response.json()
      console.log("✅ VAPI API Key is valid!")
      console.log(`   Assistant Name: ${assistant.name || "Unnamed Assistant"}`)
      console.log(`   Assistant ID: ${assistantId}`)
      return true
    } else {
      console.log("❌ VAPI API Key test failed!")
      console.log(`   Status: ${response.status} ${response.statusText}`)

      if (response.status === 401) {
        console.log("   🔍 This usually means the API key is invalid")
      } else if (response.status === 404) {
        console.log("   🔍 Assistant not found - check your Assistant ID")
      }

      return false
    }
  } catch (error) {
    console.log("❌ Error testing VAPI connection:", error.message)
    return false
  }
}

// Main execution
console.log("Starting VAPI API Key setup...")
setupVAPIKey()
