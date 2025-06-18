#!/usr/bin/env node

// Import the environment validator with correct path
const path = require("path")
const { validateEnvironment, getEnvVarStatusReport } = require(path.join(__dirname, "../lib/env-validator.ts"))

console.log("\n🔍 Validating environment variables for build...\n")

// Run validation and exit with error code if validation fails
const isValid = validateEnvironment(false)

if (!isValid) {
  console.error("\n❌ Environment validation failed!")
  console.error("Please check your .env.local file and ensure all required variables are set correctly.")
  console.error("You can continue with the build, but the application may not function correctly.\n")

  // Ask if user wants to continue
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.question("Do you want to continue with the build anyway? (y/N): ", (answer) => {
    if (answer.toLowerCase() !== "y") {
      console.log("Build cancelled. Please fix the environment variables and try again.")
      process.exit(1)
    } else {
      console.log("Continuing with build despite environment validation failures...")
      readline.close()
    }
  })
} else {
  console.log("✅ All environment variables are properly configured!")
  process.exit(0)
}
