#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🚀 Final Deployment Readiness Check")
console.log("=".repeat(50))

const allChecksPass = true
const issues = []

// Check 1: Environment Variables
function checkEnvironmentVariables() {
  console.log("\n📋 1. Environment Variables")

  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    console.log("   ❌ .env.local file missing")
    issues.push("Create .env.local file with required variables")
    return false
  }

  const envContent = fs.readFileSync(envPath, "utf8")
  const requiredVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", critical: true },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", critical: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", critical: true },
    { name: "NEXT_PUBLIC_VAPI_ASSISTANT_ID", critical: true },
    { name: "VAPI_API_KEY", critical: true },
    { name: "VAPI_SHARE_KEY", critical: true },
    { name: "POSTGRES_URL", critical: false },
  ]

  let envReady = true
  requiredVars.forEach(({ name, critical }) => {
    const regex = new RegExp(`^${name}=(.+)$`, "m")
    const match = envContent.match(regex)

    if (!match || match[1].includes("your_") || match[1].trim() === "") {
      console.log(`   ${critical ? "❌" : "⚠️"} ${name}: Missing or placeholder`)
      if (critical) {
        envReady = false
        issues.push(`Set ${name} in environment variables`)
      }
    } else {
      console.log(`   ✅ ${name}: Configured`)
    }
  })

  return envReady
}

// Check 2: Critical Files
function checkCriticalFiles() {
  console.log("\n📁 2. Critical Files")

  const criticalFiles = [
    "app/layout.tsx",
    "app/page.tsx",
    "lib/supabase.ts",
    "lib/vapi-client-fixed.ts",
    "components/vapi-voice-widget-enhanced.tsx",
    "app/api/vapi/webhook/route.ts",
    "app/api/vapi/config/route.ts",
    "package.json",
    "next.config.mjs",
    "tailwind.config.ts",
  ]

  let filesReady = true
  criticalFiles.forEach((file) => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file}: Missing`)
      filesReady = false
      issues.push(`Missing critical file: ${file}`)
    }
  })

  return filesReady
}

// Check 3: Package.json Dependencies
function checkDependencies() {
  console.log("\n📦 3. Dependencies")

  const packagePath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(packagePath)) {
    console.log("   ❌ package.json missing")
    issues.push("package.json file is missing")
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  const requiredDeps = ["@supabase/supabase-js", "next", "react", "tailwindcss", "lucide-react"]

  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  let depsReady = true

  requiredDeps.forEach((dep) => {
    if (allDeps[dep]) {
      console.log(`   ✅ ${dep}`)
    } else {
      console.log(`   ❌ ${dep}: Missing`)
      depsReady = false
      issues.push(`Missing dependency: ${dep}`)
    }
  })

  return depsReady
}

// Check 4: VAPI Configuration
function checkVAPIConfig() {
  console.log("\n🎤 4. VAPI Configuration")

  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) {
    console.log("   ❌ Cannot check VAPI config - .env.local missing")
    return false
  }

  const envContent = fs.readFileSync(envPath, "utf8")

  // Check VAPI variables
  const vapiChecks = [
    { name: "VAPI_API_KEY", shouldNotBe: "your_vapi_api_key_here" },
    { name: "VAPI_SHARE_KEY", expected: "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063" },
    { name: "NEXT_PUBLIC_VAPI_ASSISTANT_ID", expected: "d63127d5-8ec7-4ed7-949a-1942ee4a3917" },
  ]

  let vapiReady = true
  vapiChecks.forEach(({ name, expected, shouldNotBe }) => {
    const regex = new RegExp(`^${name}=(.+)$`, "m")
    const match = envContent.match(regex)

    if (!match) {
      console.log(`   ❌ ${name}: Missing`)
      vapiReady = false
      issues.push(`Set ${name} in environment variables`)
    } else {
      const value = match[1].trim()

      if (shouldNotBe && value === shouldNotBe) {
        console.log(`   ❌ ${name}: Still has placeholder value`)
        vapiReady = false
        issues.push(`Replace placeholder value for ${name}`)
      } else if (expected && value !== expected) {
        console.log(`   ⚠️ ${name}: Unexpected value (${value})`)
        console.log(`      Expected: ${expected}`)
        // Don't fail for this, just warn
      } else {
        console.log(`   ✅ ${name}: Configured`)
      }
    }
  })

  return vapiReady
}

// Check 5: Build Test
async function checkBuildReadiness() {
  console.log("\n🔨 5. Build Readiness")

  // Check for common build issues
  const buildChecks = [
    {
      name: "TypeScript config",
      file: "tsconfig.json",
      check: () => fs.existsSync(path.join(process.cwd(), "tsconfig.json")),
    },
    {
      name: "Next.js config",
      file: "next.config.mjs",
      check: () => fs.existsSync(path.join(process.cwd(), "next.config.mjs")),
    },
    {
      name: "Tailwind config",
      file: "tailwind.config.ts",
      check: () => fs.existsSync(path.join(process.cwd(), "tailwind.config.ts")),
    },
  ]

  let buildReady = true
  buildChecks.forEach(({ name, file, check }) => {
    if (check()) {
      console.log(`   ✅ ${name}`)
    } else {
      console.log(`   ❌ ${name}: Missing ${file}`)
      buildReady = false
      issues.push(`Missing ${file}`)
    }
  })

  return buildReady
}

// Check 6: Image Files
function checkImageFiles() {
  console.log("\n🖼️ 6. Image Files")

  const imageFiles = [
    "public/images/aegis-logo.webp",
    "public/images/team/shan.jpeg",
    "public/images/team/sajjad.jpeg",
    "public/images/team/suresh.jpeg",
    "public/images/team/balaji.jpeg",
    "public/images/team/ali.jpeg",
    "public/images/open-efficiency-logo.jpeg",
  ]

  let imagesReady = true
  imageFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.size > 0) {
        console.log(`   ✅ ${file} (${Math.round(stats.size / 1024)}KB)`)
      } else {
        console.log(`   ⚠️ ${file}: Empty file`)
        // Don't fail for empty images, just warn
      }
    } else {
      console.log(`   ❌ ${file}: Missing`)
      imagesReady = false
      issues.push(`Missing image: ${file}`)
    }
  })

  return imagesReady
}

// Generate final report
function generateFinalReport() {
  console.log("\n" + "=".repeat(50))
  console.log("📊 DEPLOYMENT READINESS REPORT")
  console.log("=".repeat(50))

  const envReady = checkEnvironmentVariables()
  const filesReady = checkCriticalFiles()
  const depsReady = checkDependencies()
  const vapiReady = checkVAPIConfig()
  const buildReady = checkBuildReadiness()
  const imagesReady = checkImageFiles()

  const checks = [
    { name: "Environment Variables", status: envReady },
    { name: "Critical Files", status: filesReady },
    { name: "Dependencies", status: depsReady },
    { name: "VAPI Configuration", status: vapiReady },
    { name: "Build Configuration", status: buildReady },
    { name: "Image Files", status: imagesReady },
  ]

  const passedChecks = checks.filter((c) => c.status).length
  const totalChecks = checks.length
  const readinessScore = Math.round((passedChecks / totalChecks) * 100)

  console.log("\n📋 Check Results:")
  checks.forEach((check) => {
    console.log(`${check.status ? "✅" : "❌"} ${check.name}`)
  })

  console.log(`\n🎯 Readiness Score: ${passedChecks}/${totalChecks} (${readinessScore}%)`)

  if (readinessScore === 100) {
    console.log("\n🎉 READY FOR DEPLOYMENT!")
    console.log("✅ All checks passed. You can deploy now.")
    console.log("\n🚀 Deployment Steps:")
    console.log("1. Push code to GitHub")
    console.log("2. Connect repository to Vercel")
    console.log("3. Set environment variables in Vercel")
    console.log("4. Deploy!")
    return true
  } else if (readinessScore >= 80) {
    console.log("\n⚠️ MOSTLY READY")
    console.log("Most checks passed, but address these issues:")
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`))
    return false
  } else {
    console.log("\n🚫 NOT READY FOR DEPLOYMENT")
    console.log("Critical issues need to be resolved:")
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`))
    return false
  }
}

// Main execution
async function main() {
  try {
    const isReady = generateFinalReport()

    if (isReady) {
      console.log("\n✨ Everything looks good! You're ready to deploy.")
      process.exit(0)
    } else {
      console.log("\n🔧 Please fix the issues above before deploying.")
      process.exit(1)
    }
  } catch (error) {
    console.error("\n❌ Error during deployment check:", error.message)
    process.exit(1)
  }
}

main()
