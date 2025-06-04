import { supabase, type Profile } from "./supabase"

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: "admin" | "ethics_officer" | "investigator"
  isActive?: boolean
  department?: string // Optional
}

export class UserManager {
  /**
   * Create a new user profile without requiring department
   */
  static async createUser(userData: CreateUserData): Promise<{ success: boolean; data?: Profile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          is_active: userData.isActive ?? true,
          // Only include department if provided
          ...(userData.department && { department: userData.department }),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Unexpected error creating user:", error)
      return { success: false, error: "Failed to create user" }
    }
  }

  /**
   * Get all users, showing department as optional
   */
  static async getAllUsers(): Promise<{ success: boolean; data?: Profile[]; error?: string }> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Unexpected error fetching users:", error)
      return { success: false, error: "Failed to fetch users" }
    }
  }

  /**
   * Update user profile without requiring department
   */
  static async updateUser(
    userId: string,
    updates: Partial<CreateUserData>,
  ): Promise<{ success: boolean; data?: Profile; error?: string }> {
    try {
      const updateData: any = {}

      if (updates.email) updateData.email = updates.email
      if (updates.firstName) updateData.first_name = updates.firstName
      if (updates.lastName) updateData.last_name = updates.lastName
      if (updates.role) updateData.role = updates.role
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.department !== undefined) updateData.department = updates.department

      const { data, error } = await supabase.from("profiles").update(updateData).eq("id", userId).select().single()

      if (error) {
        console.error("Error updating user:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Unexpected error updating user:", error)
      return { success: false, error: "Failed to update user" }
    }
  }

  /**
   * Create demo users for testing
   */
  static async createDemoUsers(): Promise<{ success: boolean; created: number; error?: string }> {
    const demoUsers: CreateUserData[] = [
      {
        email: "admin@aegiswhistle.com",
        firstName: "System",
        lastName: "Administrator",
        role: "admin",
        isActive: true,
      },
      {
        email: "ethics@aegiswhistle.com",
        firstName: "Ethics",
        lastName: "Officer",
        role: "ethics_officer",
        isActive: true,
      },
      {
        email: "investigator@aegiswhistle.com",
        firstName: "Lead",
        lastName: "Investigator",
        role: "investigator",
        isActive: true,
      },
      {
        email: "john.doe@aegiswhistle.com",
        firstName: "John",
        lastName: "Doe",
        role: "ethics_officer",
        isActive: true,
      },
      {
        email: "jane.smith@aegiswhistle.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "investigator",
        isActive: true,
      },
    ]

    let created = 0
    const errors: string[] = []

    for (const user of demoUsers) {
      const result = await this.createUser(user)
      if (result.success) {
        created++
        console.log(`✅ Created user: ${user.email}`)
      } else {
        errors.push(`Failed to create ${user.email}: ${result.error}`)
        console.warn(`⚠️ Failed to create user: ${user.email} - ${result.error}`)
      }
    }

    if (errors.length > 0) {
      return { success: false, created, error: errors.join("; ") }
    }

    return { success: true, created }
  }
}
