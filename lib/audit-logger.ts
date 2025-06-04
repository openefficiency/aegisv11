// lib/audit-logger.ts

import { supabase } from "./supabase"

interface AuditLogEntry {
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details?: any
}

class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { user_id, action, entity_type, entity_id, details } = entry

      // Try to insert into database
      const { error } = await supabase.from("audit_logs").insert({
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        timestamp: new Date().toISOString(),
      })

      if (error) {
        console.warn("Failed to write audit log to database:", error)
      }

      // Always log to console as backup
      console.log(`AUDIT: ${action} on ${entity_type}:${entity_id} by ${user_id}`, details)
    } catch (error) {
      // Ensure audit logging never breaks the application
      console.warn("Audit logging failed:", error)
    }
  }

  async logCaseAction(user_id: string, case_id: string, action: string, details?: any): Promise<void> {
    return this.log({
      user_id,
      action,
      entity_type: "case",
      entity_id: case_id,
      details,
    })
  }

  async logRewardTransaction(user_id: string, case_id: string, details: any): Promise<void> {
    return this.log({
      user_id,
      action: "reward_processed",
      entity_type: "reward",
      entity_id: case_id,
      details,
    })
  }
}

export const auditLogger = new AuditLogger()
