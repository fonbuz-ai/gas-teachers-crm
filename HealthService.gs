// File: HealthService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const HealthService = {
  getTeacherHealthSummary: function(studentId) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const health = DataRepository.selectOne(Config.SHEET_NAMES.HEALTH_ALERTS, { student_id: studentId });

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "HEALTH_ALERTS", studentId, student.class_id, "SUCCESS", "Viewed health summary.");

      if (!health) return null;

      // 遮罩受限附件
      const copy = Object.assign({}, health);
      copy.restricted_document_url = null;
      return copy;
    });
  }
};
