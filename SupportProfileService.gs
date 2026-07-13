// File: SupportProfileService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const SupportProfileService = {
  getStudentSupportProfile: function(studentId) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const profile = DataRepository.selectOne(Config.SHEET_NAMES.SUPPORT_PROFILES, { student_id: studentId });

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "SUPPORT_PROFILES", studentId, student.class_id, "SUCCESS", "Viewed support profile.");

      return profile || null;
    });
  }
};
