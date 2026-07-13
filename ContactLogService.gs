// File: ContactLogService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ContactLogService = {
  listStudentContactLogs: function(studentId, options = {}) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const logs = DataRepository.selectWhere(Config.SHEET_NAMES.CONTACT_LOGS, { student_id: studentId });

      // 排序: 新的在前
      logs.sort(function(a, b) {
        return String(b.contact_date).localeCompare(String(a.contact_date));
      });

      // 限制筆數
      const limit = options.limit || 20;
      const sliced = logs.slice(0, limit);

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "CONTACT_LOGS", studentId, student.class_id, "SUCCESS", "Viewed contact logs.");

      return sliced;
    });
  }
};
