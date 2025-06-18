#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🚀 Pre-Deployment Checklist for Aegis Whistle Platform")
console.log("=".repeat(60))

const checklist = []

// Check 1: Environment Variables
function checkEnvironmentVariables() {
  console.log("\n📋 1. Environment Variables Check")

  const envPath = path.join(process.cwd(), ".env.local")
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_VAPI_ASSISTANT_ID",
    "VAPI_API_KEY",
    "VAPI_SHARE_KEY",
    "POSTGRES_URL",
  ]

  const envExists = fs.existsSync(envPath)
  let envContent = ""

  if (envExists) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  const missingVars = []
  const presentVars = []

  requiredVars.forEach((varName) => {
    const regex = new RegExp(`^${varName}=.+$`, "m")
    if (regex.test(envContent) && !envContent.includes(`${varName}=your_`)) {
      presentVars.push(varName)
      console.log(`   ✅ ${varName}`)
    } else {
      missingVars.push(varName)
      console.log(`   ❌ ${varName} - Missing or placeholder`)
    }
  })

  const envComplete = missingVars.length === 0
  checklist.push({
    name: "Environment Variables",
    status: envComplete,
    details: envComplete ? "All required variables set" : `Missing: ${missingVars.join(", ")}`,
  })

  return envComplete
}

// Check 2: Package Dependencies
function checkDependencies() {
  console.log("\n📦 2. Package Dependencies Check")

  const packagePath = path.join(process.cwd(), "package.json")

  if (!fs.existsSync(packagePath)) {
    console.log("   ❌ package.json not found")
    checklist.push({
      name: "Package Dependencies",
      status: false,
      details: "package.json missing",
    })
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  const requiredDeps = ["@supabase/supabase-js", "next", "react", "tailwindcss", "lucide-react"]

  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const missingDeps = requiredDeps.filter((dep) => !allDeps[dep])

  if (missingDeps.length === 0) {
    console.log("   ✅ All required dependencies present")
    checklist.push({
      name: "Package Dependencies",
      status: true,
      details: "All dependencies installed",
    })
    return true
  } else {
    console.log(`   ❌ Missing dependencies: ${missingDeps.join(", ")}`)
    checklist.push({
      name: "Package Dependencies",
      status: false,
      details: `Missing: ${missingDeps.join(", ")}`,
    })
    return false
  }
}

// Check 3: Database Schema Files
function checkDatabaseFiles() {
  console.log("\n🗄️ 3. Database Schema Files Check")

  const requiredFiles = [
    "scripts/01_create_complete_database_schema.sql",
    "scripts/02_populate_dummy_data.sql",
    "scripts/create_enhanced_reports_table.sql",
  ]

  let allFilesExist = true

  requiredFiles.forEach((filePath) => {
    if (fs.existsSync(path.join(process.cwd(), filePath))) {
      console.log(`   ✅ ${filePath}`)
    } else {
      console.log(`   ❌ ${filePath} - Missing`)
      allFilesExist = false
    }
  })

  checklist.push({
    name: "Database Schema Files",
    status: allFilesExist,
    details: allFilesExist ? "All schema files present" : "Some schema files missing",
  })

  return allFilesExist
}

// Check 4: VAPI Configuration
function checkVAPIConfig() {
  console.log("\n🎤 4. VAPI Configuration Check")

  const vapiFiles = [
    "lib/vapi-client.ts",
    "lib/vapi-server-actions.ts",
    "components/vapi-voice-widget.tsx",
    "app/api/vapi/webhook/route.ts",
  ]

  let allVapiFilesExist = true

  vapiFiles.forEach((filePath) => {
    if (fs.existsSync(path.join(process.cwd(), filePath))) {
      console.log(`   ✅ ${filePath}`)
    } else {
      console.log(`   ❌ ${filePath} - Missing`)
      allVapiFilesExist = false
    }
  })

  // Check if VAPI credentials are configured
  const envPath = path.join(process.cwd(), ".env.local")
  let vapiConfigured = false

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    vapiConfigured =
      envContent.includes("VAPI_API_KEY=") &&
      envContent.includes("VAPI_SHARE_KEY=") &&
      envContent.includes("NEXT_PUBLIC_VAPI_ASSISTANT_ID=") &&
      !envContent.includes("your_vapi_api_key_here")
  }

  if (vapiConfigured) {
    console.log("   ✅ VAPI credentials configured")
  } else {
    console.log("   ❌ VAPI credentials not properly configured")
  }

  const vapiReady = allVapiFilesExist && vapiConfigured
  checklist.push({
    name: "VAPI Configuration",
    status: vapiReady,
    details: vapiReady ? "VAPI fully configured" : "VAPI setup incomplete",
  })

  return vapiReady
}

// Check 5: Core Application Files
function checkCoreFiles() {
  console.log("\n🏗️ 5. Core Application Files Check")

  const coreFiles = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/dashboard/admin/page.tsx",
    "app/dashboard/ethics-officer/page.tsx",
    "lib/supabase.ts",
    "components/dashboard-layout.tsx",
  ]

  let allCoreFilesExist = true

  coreFiles.forEach((filePath) => {
    if (fs.existsSync(path.join(process.cwd(), filePath))) {
      console.log(`   ✅ ${filePath}`)
    } else {
      console.log(`   ❌ ${filePath} - Missing`)
      allCoreFilesExist = false
    }
  })

  checklist.push({
    name: "Core Application Files",
    status: allCoreFilesExist,
    details: allCoreFilesExist ? "All core files present" : "Some core files missing",
  })

  return allCoreFilesExist
}

// Check 6: Build Configuration
function checkBuildConfig() {
  console.log("\n⚙️ 6. Build Configuration Check")

  const configFiles = ["next.config.mjs", "tailwind.config.ts", "tsconfig.json"]

  let allConfigFilesExist = true

  configFiles.forEach((filePath) => {
    if (fs.existsSync(path.join(process.cwd(), filePath))) {
      console.log(`   ✅ ${filePath}`)
    } else {
      console.log(`   ❌ ${filePath} - Missing`)
      allConfigFilesExist = false
    }
  })

  checklist.push({
    name: "Build Configuration",
    status: allConfigFilesExist,
    details: allConfigFilesExist ? "All config files present" : "Some config files missing",
  })

  return allConfigFilesExist
}

// Generate deployment summary
function generateDeploymentSummary() {
  console.log("\n" + "=".repeat(60))
  console.log("📊 DEPLOYMENT READINESS SUMMARY")
  console.log("=".repeat(60))

  const passedChecks = checklist.filter((check) => check.status).length
  const totalChecks = checklist.length
  const readinessPercentage = Math.round((passedChecks / totalChecks) * 100)

  checklist.forEach((check) => {
    const status = check.status ? "✅ PASS" : "❌ FAIL"
    console.log(`${status} ${check.name}: ${check.details}`)
  })

  console.log("\n" + "-".repeat(60))
  console.log(`Overall Readiness: ${passedChecks}/${totalChecks} (${readinessPercentage}%)`)

  if (readinessPercentage === 100) {
    console.log("\n🎉 READY FOR DEPLOYMENT!")
    console.log("All checks passed. You can proceed with deployment.")
  } else if (readinessPercentage >= 80) {
    console.log("\n⚠️  MOSTLY READY")
    console.log("Most checks passed. Address remaining issues before deployment.")
  } else {
    console.log("\n🚫 NOT READY FOR DEPLOYMENT")
    console.log("Several critical issues need to be resolved.")
  }

  return readinessPercentage
}

// Generate next steps
function generateNextSteps(readinessPercentage) {
  console.log("\n📝 NEXT STEPS:")

  if (readinessPercentage === 100) {
    console.log("1. Run: npm run build (to test local build)")
    console.log("2. Commit and push your changes to GitHub")
    console.log("3. Deploy to Vercel")
    console.log("4. Set environment variables in Vercel dashboard")
    console.log("5. Test the deployed application")
  } else {
    console.log("1. Address the failed checks above")
    console.log("2. Run this script again to verify fixes")
    console.log("3. Once all checks pass, proceed with deployment")

    const failedChecks = checklist.filter((check) => !check.status)
    if (failedChecks.length > 0) {
      console.log("\n🔧 PRIORITY FIXES:")
      failedChecks.forEach((check, index) => {
        console.log(`${index + 1}. ${check.name}: ${check.details}`)
      })
    }
  }
}

// Main execution
async function runPreDeploymentCheck() {
  try {
    const envReady = checkEnvironmentVariables()
    const depsReady = checkDependencies()
    const dbReady = checkDatabaseFiles()
    const vapiReady = checkVAPIConfig()
    const coreReady = checkCoreFiles()
    const buildReady = checkBuildConfig()

    const readinessPercentage = generateDeploymentSummary()
    generateNextSteps(readinessPercentage)

    process.exit(readinessPercentage === 100 ? 0 : 1)
  } catch (error) {
    console.error("\n❌ Error running pre-deployment check:", error.message)
    process.exit(1)
  }
}

// Run the check
runPreDeploymentCheck()
