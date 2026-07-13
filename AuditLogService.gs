// File: AuditLogService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const AuditLogService = {
  logAccess: function(module, action, userEmail, result, metadata = {}) {
    DataRepository.insertAccessLog(userEmail, action, module, metadata.student_id, metadata.class_id, result, metadata.details);
  }
};
