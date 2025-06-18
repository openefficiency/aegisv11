// Update Supabase configuration with new project details
console.log("🔧 Updating Supabase Configuration...")

const newConfig = {
  projectId: "vnjfnlnwfhnwzcfkdrsw",
  url: "https://vnjfnlnwfhnwzcfkdrsw.supabase.co",
  directConnection: "postgresql://postgres:StartNew2025!@db.vnjfnlnwfhnwzcfkdrsw.supabase.co:5432/postgres",
  transactionPooler:
    "postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:StartNew2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
  sessionPooler:
    "postgresql://postgres.vnjfnlnwfhnwzcfkdrsw:StartNew2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
  jwtSecret: "OXiiRK1ZmZlyFMPowMhMOh1tjrzM2yH2cMugkf79I4JMp3gi1lxguKehbvlImiAV8hzCaRsnglYv+zU5rgiFXA==",
  host: "db.vnjfnlnwfhnwzcfkdrsw.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "StartNew2025!",
}

console.log("✅ New Supabase Configuration:")
console.log(`   Project ID: ${newConfig.projectId}`)
console.log(`   URL: ${newConfig.url}`)
console.log(`   Host: ${newConfig.host}`)
console.log(`   Database: ${newConfig.database}`)

console.log("\n📝 Environment Variables to Set:")
console.log(`NEXT_PUBLIC_SUPABASE_URL=${newConfig.url}`)
console.log(`SUPABASE_JWT_SECRET=${newConfig.jwtSecret}`)
console.log(`POSTGRES_URL=${newConfig.directConnection}`)
console.log(`POSTGRES_URL_NON_POOLING=${newConfig.directConnection}`)
console.log(`POSTGRES_PRISMA_URL=${newConfig.transactionPooler}`)
console.log(`POSTGRES_HOST=${newConfig.host}`)
console.log(`POSTGRES_USER=${newConfig.user}`)
console.log(`POSTGRES_PASSWORD=${newConfig.password}`)
console.log(`POSTGRES_DATABASE=${newConfig.database}`)

console.log("\n⚠️  IMPORTANT: You need to get the following from Supabase Dashboard:")
console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY (from Settings > API)")
console.log("   - SUPABASE_SERVICE_ROLE_KEY (from Settings > API)")
console.log("   - SUPABASE_ANON_KEY (same as NEXT_PUBLIC_SUPABASE_ANON_KEY)")

console.log("\n🔗 Supabase Dashboard: https://supabase.com/dashboard/project/vnjfnlnwfhnwzcfkdrsw")
