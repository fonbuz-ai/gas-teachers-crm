// File: GuardianService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const GuardianService = {
  getStudentGuardians: function(studentId) {
    return ResponseService.runSecure(function() {
      PermissionService.validateStudentAccess(studentId);
      const user = AuthService.getCurrentUser();

      const guardians = DataRepository.selectWhere(Config.SHEET_NAMES.GUARDIANS, { student_id: studentId });

      // 寫入日誌
      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      DataRepository.insertAccessLog(user.email, "READ", "GUARDIANS", studentId, student.class_id, "SUCCESS", "Viewed guardians.");

      // 遮罩電話
      return guardians.map(function(g) {
        const copy = Object.assign({}, g);
        copy.phone = PrivacyService.maskPhone(g.phone);
        return copy;
      });
    });
  }
};
