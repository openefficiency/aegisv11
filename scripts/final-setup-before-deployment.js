#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔧 Final Setup Before Deployment")
console.log("=".repeat(50))

// Ensure all required directories exist
function createRequiredDirectories() {
  console.log("\n📁 Creating required directories...")

  const requiredDirs = ["app/api/vapi", "scripts", "lib", "components", "public/images"]

  requiredDirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`   ✅ Created ${dir}`)
    } else {
      console.log(`   ✅ ${dir} exists`)
    }
  })
}

// Check and update package.json scripts
function updatePackageScripts() {
  console.log("\n📦 Updating package.json scripts...")

  const packagePath = path.join(process.cwd(), "package.json")

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

    const requiredScripts = {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "setup-env": "node scripts/setup-vapi-environment.js",
      "check-deployment": "node scripts/pre-deployment-checklist.js",
      "setup-db": "node scripts/03_test_supabase_connection.js",
    }

    let scriptsUpdated = false

    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    Object.entries(requiredScripts).forEach(([scriptName, scriptCommand]) => {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand
        scriptsUpdated = true
        console.log(`   ✅ Added script: ${scriptName}`)
      }
    })

    if (scriptsUpdated) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
      console.log("   💾 package.json updated")
    } else {
      console.log("   ✅ All scripts already present")
    }
  }
}

// Create .env.example file
function createEnvExample() {
  console.log("\n📄 Creating .env.example...")

  const envExampleContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration  
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host

# VAPI Configuration
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_API_KEY=your_vapi_api_key_here
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063

# Optional: Additional Keys
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_ANON_KEY=your_anon_key
`

  const envExamplePath = path.join(process.cwd(), ".env.example")
  fs.writeFileSync(envExamplePath, envExampleContent)
  console.log("   ✅ .env.example created")
}

// Create deployment guide
function createDeploymentGuide() {
  console.log("\n📖 Creating deployment guide...")

  const deploymentGuide = `# Deployment Guide

## Pre-Deployment Checklist

Run the pre-deployment check:
\`\`\`bash
npm run check-deployment
\`\`\`

## Environment Setup

1. **Set up environment variables:**
\`\`\`bash
npm run setup-env
\`\`\`

2. **Add your VAPI API key to .env.local:**
\`\`\`bash
VAPI_API_KEY=your_actual_vapi_api_key
\`\`\`

3. **Test database connection:**
\`\`\`bash
npm run setup-db
\`\`\`

## Local Testing

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Run development server:**
\`\`\`bash
npm run dev
\`\`\`

3. **Test voice functionality:**
Visit: http://localhost:3000/test-voice

## Vercel Deployment

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy the application**
4. **Test deployed application**

## Environment Variables for Vercel

Copy these from your .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_VAPI_ASSISTANT_ID
- VAPI_API_KEY
- VAPI_SHARE_KEY
- POSTGRES_URL

## Post-Deployment Testing

1. Test voice widget functionality
2. Verify database connections
3. Check VAPI integration
4. Test all dashboard features
5. Verify webhook endpoints

## Troubleshooting

If issues occur:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Check VAPI configuration
`

  const guidePath = path.join(process.cwd(), "DEPLOYMENT_GUIDE.md")
  fs.writeFileSync(guidePath, deploymentGuide)
  console.log("   ✅ DEPLOYMENT_GUIDE.md created")
}

// Main execution
async function runFinalSetup() {
  try {
    createRequiredDirectories()
    updatePackageScripts()
    createEnvExample()
    createDeploymentGuide()

    console.log("\n🎉 Final setup complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Run: npm run check-deployment")
    console.log("2. Address any issues found")
    console.log("3. Test locally with: npm run dev")
    console.log("4. Deploy to Vercel")
  } catch (error) {
    console.error("❌ Error in final setup:", error.message)
    process.exit(1)
  }
}

runFinalSetup()
