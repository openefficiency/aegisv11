#!/usr/bin/env node

// Simple environment validator for build process
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_VAPI_ASSISTANT_ID"]

const serverEnvVars = ["VAPI_API_KEY", "VAPI_SHARE_KEY"]

console.log("\n🔍 Validating environment variables for build...\n")

let hasErrors = false
const missing = []

// Check required client-side variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    missing.push(varName)
    hasErrors = true
  }
})

// Check server-side variables (optional for build)
serverEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.log(`⚠️  Optional server variable missing: ${varName}`)
  }
})

if (hasErrors) {
  console.error("❌ Missing required environment variables:")
  missing.forEach((varName) => {
    console.error(`  - ${varName}`)
  })
  console.error("\nPlease check your .env.local file and ensure all required variables are set.")

  // For build process, we'll continue but warn
  console.log("\n⚠️  Continuing with build, but application may not function correctly without these variables.")
} else {
  console.log("✅ All required environment variables are present!")
}

console.log("\n✅ Build validation complete.")
process.exit(0)
