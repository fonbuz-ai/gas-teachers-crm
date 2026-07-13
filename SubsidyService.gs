// File: SubsidyService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const SubsidyService = {
  getTeacherSubsidySummary: function(studentId) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const subsidy = DataRepository.selectOne(Config.SHEET_NAMES.SUBSIDY_RECORDS, { student_id: studentId });

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "SUBSIDY_RECORDS", studentId, student.class_id, "SUCCESS", "Viewed subsidy summary.");

      if (!subsidy) return null;

      // 遮罩受限附件
      const copy = Object.assign({}, subsidy);
      copy.restricted_document_url = null;
      return copy;
    });
  }
};
