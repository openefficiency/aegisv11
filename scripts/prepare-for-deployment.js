#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Preparing for deployment...")
console.log("=".repeat(50))

async function main() {
  try {
    // Step 1: Setup environment
    console.log("\n1️⃣ Setting up environment...")
    execSync("node scripts/setup-complete-environment.js", { stdio: "inherit" })

    // Step 2: Install dependencies
    console.log("\n2️⃣ Installing dependencies...")
    try {
      execSync("npm install", { stdio: "inherit" })
      console.log("✅ Dependencies installed")
    } catch (error) {
      console.log("⚠️ npm install failed, trying with --legacy-peer-deps")
      execSync("npm install --legacy-peer-deps", { stdio: "inherit" })
    }

    // Step 3: Run deployment check
    console.log("\n3️⃣ Running deployment check...")
    try {
      execSync("node scripts/final-deployment-check.js", { stdio: "inherit" })
    } catch (error) {
      console.log("⚠️ Some checks failed, but continuing...")
    }

    // Step 4: Test build
    console.log("\n4️⃣ Testing build...")
    try {
      execSync("npm run build", { stdio: "inherit" })
      console.log("✅ Build successful!")
    } catch (error) {
      console.log("❌ Build failed. Please check the errors above.")
      throw error
    }

    console.log("\n🎉 DEPLOYMENT PREPARATION COMPLETE!")
    console.log("\n📋 Final steps:")
    console.log("1. Update .env.local with your actual API keys")
    console.log('2. Push to GitHub: git add . && git commit -m "Ready for deployment" && git push')
    console.log("3. Deploy to Vercel")
    console.log("4. Set environment variables in Vercel dashboard")
  } catch (error) {
    console.error("\n❌ Deployment preparation failed:", error.message)
    process.exit(1)
  }
}

main()
