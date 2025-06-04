// Create demo users without department requirement
import { UserManager } from "../lib/user-management.js"

async function createDemoUsers() {
  console.log("🚀 Creating demo users without department...")

  try {
    const result = await UserManager.createDemoUsers()

    if (result.success) {
      console.log(`✅ Successfully created ${result.created} demo users`)
    } else {
      console.error(`❌ Failed to create some users: ${result.error}`)
      console.log(`✅ Successfully created ${result.created} users`)
    }

    // Fetch and display all users
    console.log("\n📋 Current users in database:")
    const usersResult = await UserManager.getAllUsers()

    if (usersResult.success && usersResult.data) {
      usersResult.data.forEach((user) => {
        console.log(
          `- ${user.email} (${user.role}) - ${user.first_name} ${user.last_name} - Department: ${user.department || "None"}`,
        )
      })
    }
  } catch (error) {
    console.error("❌ Error creating demo users:", error)
  }
}

// Run the function
createDemoUsers()
