// File: FollowUpService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const FollowUpService = {
  listStudentTasks: function(studentId, options = {}) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const tasks = DataRepository.selectWhere(Config.SHEET_NAMES.FOLLOW_UP_TASKS, { student_id: studentId });

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "FOLLOW_UP_TASKS", studentId, student.class_id, "SUCCESS", "Viewed follow up tasks.");

      return tasks;
    });
  }
};
