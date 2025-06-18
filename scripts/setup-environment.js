#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * This script helps set up the environment variables for the Aegis Whistle Platform.
 * It validates the current environment and provides guidance on missing variables.
 */

const fs = require("fs")
const path = require("path")

// Required environment variables
const REQUIRED_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: {
    description: "Supabase project URL",
    example: "https://your-project.supabase.co",
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: "Supabase anonymous key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: {
    description: "VAPI Assistant ID",
    example: "asst_xxxxxxxxxxxxxxxx",
  },
}

const SERVER_VARS = {
  VAPI_API_KEY: {
    description: "VAPI API key (server-side)",
    example: "vapi_live_xxxxxxxxxxxxxxxx",
  },
  VAPI_SHARE_KEY: {
    description: "VAPI Share key (server-side)",
    example: "share_xxxxxxxxxxxxxxxx",
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: "Supabase service role key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
}

console.log("🔧 Aegis Whistle Platform - Environment Setup\n")

// Check current environment
const missing = []
const present = []

Object.keys(REQUIRED_VARS).forEach((varName) => {
  if (process.env[varName]) {
    present.push(varName)
  } else {
    missing.push(varName)
  }
})

// Report status
if (present.length > 0) {
  console.log("✅ Present variables:")
  present.forEach((varName) => {
    console.log(`  - ${varName}`)
  })
  console.log()
}

if (missing.length > 0) {
  console.log("❌ Missing required variables:")
  missing.forEach((varName) => {
    const config = REQUIRED_VARS[varName]
    console.log(`  - ${varName}`)
    console.log(`    Description: ${config.description}`)
    console.log(`    Example: ${config.example}`)
    console.log()
  })
}

// Check server variables
console.log("🔍 Server-side variables:")
Object.keys(SERVER_VARS).forEach((varName) => {
  const status = process.env[varName] ? "✅" : "⚠️ "
  console.log(`  ${status} ${varName}`)
})

console.log("\n📝 Next steps:")
console.log("1. Create a .env.local file in your project root")
console.log("2. Add the missing environment variables")
console.log("3. Run the application with: npm run dev")
console.log("\nFor detailed setup instructions, see ENV_SETUP_SIMPLE.md")
