// File: ClassService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ClassService = {
  // 列出當前使用者有權存取的所有班級資料
  listAccessibleClasses: function() {
    return ResponseService.runSecure(function() {
      AuthService.getCurrentUser();

      const allowedIds = PermissionService.getAccessibleClassIds();

      if (allowedIds.length === 0) {
        return [];
      }

      const allowedIdSet = {};
      allowedIds.forEach(function(id) {
        allowedIdSet[String(id).trim()] = true;
      });

      const allClasses = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);

      return allClasses
        .filter(function(classItem) {
          const isActive = String(classItem.status || "").trim().toUpperCase() === "ACTIVE";

          return (
            isActive &&
            allowedIdSet[String(classItem.class_id || "").trim()] === true
          );
        })
        .map(function(classItem) {
          return {
            class_id: classItem.class_id,
            school_year: classItem.school_year,
            class_name: classItem.class_name,
            grade: classItem.grade,
            teacher_email: classItem.teacher_email,
            status: classItem.status
          };
        });
    });
  }
};
