export interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  ip: string;
  detail?: string;
}

const auditLog: AuditEntry[] = [];
const MAX_ENTRIES = 1000;

export function logAudit(
  user: string,
  action: string,
  ip: string,
  detail?: string
): AuditEntry {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    user,
    action,
    ip,
    detail,
  };
  auditLog.push(entry);
  if (auditLog.length > MAX_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_ENTRIES);
  }
  return entry;
}

export function getAuditLog(limit = 50): AuditEntry[] {
  return auditLog.slice(-limit).reverse();
}

export function clearAuditLog(): void {
  auditLog.length = 0;
}
