/**
 * Environment Variable Validator
 *
 * This utility helps validate environment variables and provides helpful error messages
 * when variables are missing or improperly formatted.
 */

// Define all required environment variables
export const REQUIRED_ENV_VARS = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    description: "Supabase project URL",
    example: "https://your-project.supabase.co",
    validator: (value: string) => value.startsWith("https://") && value.includes("supabase"),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: "Supabase anonymous key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    validator: (value: string) => value.length > 20,
  },

  // VAPI - Assistant ID is public, API key is server-side only
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: {
    description: "VAPI Assistant ID",
    example: "asst_xxxxxxxxxxxxxxxx",
    validator: (value: string) => value.length > 10,
  },
}

// Server-side only environment variables
export const SERVER_ENV_VARS = {
  VAPI_API_KEY: {
    description: "VAPI API key (server-side only)",
    example: "vapi_live_xxxxxxxxxxxxxxxx",
    validator: (value: string) => value.length > 10,
  },
  VAPI_SHARE_KEY: {
    description: "VAPI Share key (server-side only)",
    example: "share_xxxxxxxxxxxxxxxx",
  },
}

// Optional environment variables
export const OPTIONAL_ENV_VARS = {
  SUPABASE_SERVICE_ROLE_KEY: {
    description: "Supabase service role key (for admin operations)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  POSTGRES_URL: {
    description: "Direct PostgreSQL connection URL",
    example: "postgresql://postgres:password@localhost:5432/postgres",
  },
}

// Clean environment variable by removing quotes
export function cleanEnvVar(value: string | undefined): string | undefined {
  if (!value) return undefined
  // Remove quotes if present (both single and double quotes)
  return value.replace(/^(['"])(.*)\1$/, "$2")
}

// Get environment variable with cleaning
export function getEnvVar(name: string): string | undefined {
  const value = process.env[name]
  return cleanEnvVar(value)
}

// Validate a single environment variable
export function validateEnvVar(name: string, required = true): { valid: boolean; value?: string; message?: string } {
  const value = getEnvVar(name)

  // Check if variable exists
  if (!value) {
    return required
      ? { valid: false, message: `Missing required environment variable: ${name}` }
      : { valid: true, message: `Optional environment variable ${name} not set` }
  }

  // Check if variable has a validator and run it
  const envVarConfig = REQUIRED_ENV_VARS[name as keyof typeof REQUIRED_ENV_VARS]
  if (envVarConfig?.validator && !envVarConfig.validator(value)) {
    return {
      valid: false,
      value,
      message: `Invalid format for ${name}. Expected format: ${envVarConfig.example}`,
    }
  }

  return { valid: true, value }
}

// Validate all required environment variables
export function validateRequiredEnvVars(): {
  valid: boolean
  missing: string[]
  invalid: string[]
  messages: string[]
} {
  const result = {
    valid: true,
    missing: [] as string[],
    invalid: [] as string[],
    messages: [] as string[],
  }

  for (const name of Object.keys(REQUIRED_ENV_VARS)) {
    const validation = validateEnvVar(name, true)

    if (!validation.valid) {
      result.valid = false
      result.messages.push(validation.message || "")

      if (!validation.value) {
        result.missing.push(name)
      } else {
        result.invalid.push(name)
      }
    }
  }

  return result
}

// Get a formatted report of environment variable status
export function getEnvVarStatusReport(): string {
  const validation = validateRequiredEnvVars()

  let report = "Environment Variable Status:\n"

  if (validation.valid) {
    report += "✅ All required environment variables are properly configured.\n"
  } else {
    report += "❌ There are issues with environment variables:\n"

    if (validation.missing.length > 0) {
      report += `\n🔍 Missing variables (${validation.missing.length}):\n`
      validation.missing.forEach((name) => {
        const config = REQUIRED_ENV_VARS[name as keyof typeof REQUIRED_ENV_VARS]
        report += `  - ${name}: ${config.description}\n    Example: ${config.example}\n`
      })
    }

    if (validation.invalid.length > 0) {
      report += `\n⚠️ Invalid variables (${validation.invalid.length}):\n`
      validation.invalid.forEach((name) => {
        const config = REQUIRED_ENV_VARS[name as keyof typeof REQUIRED_ENV_VARS]
        report += `  - ${name}: ${config.description}\n    Example: ${config.example}\n`
      })
    }
  }

  return report
}

// Function to use during build/startup to validate environment
export function validateEnvironment(exitOnFailure = false): boolean {
  const validation = validateRequiredEnvVars()

  if (!validation.valid) {
    console.error("\n" + getEnvVarStatusReport())

    if (exitOnFailure && typeof process !== "undefined") {
      console.error("\n❌ Environment validation failed. Exiting...")
      process.exit(1)
    }

    return false
  }

  console.log("✅ Environment validation successful")
  return true
}
