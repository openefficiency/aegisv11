import { supabase } from "./supabase"

export interface AuditLogEntry {
  user_id: string
  action: string
  entity_type: "case" | "reward" | "assignment" | "query"
  entity_id: string
  details: any
}

export class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Try to insert into database
      await supabase.from("audit_trail").insert({
        ...entry,
        timestamp: new Date().toISOString(),
      })

      // Also log to console for debugging
      console.log(
        `AUDIT: ${entry.action} on ${entry.entity_type}:${entry.entity_id} by ${entry.user_id}`,
        entry.details,
      )
    } catch (error) {
      // Don't let audit logging failures break the application
      console.error("Failed to log audit entry:", error)
    }
  }

  async logCaseAction(userId: string, caseId: string, action: string, details: any = {}): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: "case",
      entity_id: caseId,
      details,
    })
  }

  async logRewardTransaction(userId: string, transactionId: string, details: any = {}): Promise<void> {
    await this.log({
      user_id: userId,
      action: "reward_processed",
      entity_type: "reward",
      entity_id: transactionId,
      details,
    })
  }
}

export const auditLogger = new AuditLogger()
