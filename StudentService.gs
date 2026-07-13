// File: StudentService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const StudentService = {
  // 列出指定班級內當前使用者有權存取的學生卡片清單 (含篩選與脫敏)
  listAccessibleStudents: function(classId, filterType = "全部") {
    return ResponseService.runSecure(function() {
      // 1. 權限校驗
      PermissionService.validateClassAccess(classId);

      // 2. 獲取班級內所有學生
      const allStudents = DataRepository.selectWhere(Config.SHEET_NAMES.STUDENTS, { class_id: classId, status: "ACTIVE" });

      // 排序：1. 座號, 2. 姓名
      allStudents.sort(function(a, b) {
        return Number(a.seat_no || 0) - Number(b.seat_no || 0);
      });

      const cards = [];

      for (let i = 0; i < allStudents.length; i++) {
        const student = allStudents[i];
        const sId = student.student_id;

        // 讀取關聯屬性以供篩選與卡片組裝
        const profile = DataRepository.selectOne(Config.SHEET_NAMES.SUPPORT_PROFILES, { student_id: sId });
        const guardians = DataRepository.selectWhere(Config.SHEET_NAMES.GUARDIANS, { student_id: sId });
        const tasks = DataRepository.selectWhere(Config.SHEET_NAMES.FOLLOW_UP_TASKS, { student_id: sId });
        const health = DataRepository.selectWhere(Config.SHEET_NAMES.HEALTH_ALERTS, { student_id: sId });
        const subsidy = DataRepository.selectWhere(Config.SHEET_NAMES.SUBSIDY_RECORDS, { student_id: sId });

        // 篩選判定
        let match = true;
        const lowerFilter = String(filterType).trim();

        if (lowerFilter === "建議優先認識") {
          // 有高/中警示健康提醒，或學習/情緒上有高度支持需求
          const hasHighHealth = health.some(h => h.alert_level === "HIGH" || h.alert_level === "MEDIUM");
          const hasSupport = profile && (profile.learning_needs || profile.emotional_support);
          match = hasHighHealth || hasSupport;
        } else if (lowerFilter === "家庭資料待確認") {
          // 家長列表為空，或沒有主要照顧者
          const hasPrimary = guardians.some(g => g.is_primary_caregiver === true || String(g.is_primary_caregiver).toUpperCase() === "TRUE");
          match = guardians.length === 0 || !hasPrimary;
        } else if (lowerFilter === "學習支持") {
          match = profile && profile.learning_needs;
        } else if (lowerFilter === "情緒與適應") {
          match = profile && profile.emotional_support;
        } else if (lowerFilter === "尚有追蹤事項") {
          match = tasks.some(t => t.status === "TODO" || t.status === "IN_PROGRESS");
        } else if (lowerFilter === "健康或行政提醒") {
          match = health.length > 0 || subsidy.length > 0;
        }

        if (match) {
          const card = PrivacyService.sanitizeStudentCard(student, profile, guardians, tasks, health, subsidy);
          cards.push(card);
        }
      }

      return cards;
    });
  },

  // 取得單一學生速覽資料 (包含基本、特質、支持、照顧者、待辦及提醒摘要)
  getStudentOverview: function(studentId) {
    return ResponseService.runSecure(function() {
      // 1. 權限校驗
      PermissionService.validateStudentAccess(studentId);

      const user = AuthService.getCurrentUser();
      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      if (!student) {
        throw new Error("NOT_FOUND: 找不到該學生資料。");
      }

      const profile = DataRepository.selectOne(Config.SHEET_NAMES.SUPPORT_PROFILES, { student_id: studentId });
      const guardians = DataRepository.selectWhere(Config.SHEET_NAMES.GUARDIANS, { student_id: studentId });
      const tasks = DataRepository.selectWhere(Config.SHEET_NAMES.FOLLOW_UP_TASKS, { student_id: studentId });
      const health = DataRepository.selectOne(Config.SHEET_NAMES.HEALTH_ALERTS, { student_id: studentId }) || {};
      const subsidy = DataRepository.selectOne(Config.SHEET_NAMES.SUBSIDY_RECORDS, { student_id: studentId }) || {};

      const rawData = {
        student: student,
        supportProfile: profile,
        guardians: guardians,
        tasks: tasks,
        healthSummary: health,
        subsidySummary: subsidy
      };

      // 2. 進行隱私脫敏過濾
      const sanitized = PrivacyService.sanitizeStudentOverview(rawData, user.role);

      // 3. 寫入存取日誌 (稽核留痕)
      DataRepository.insertAccessLog(user.email, "READ", "STUDENT_OVERVIEW", studentId, student.class_id, "SUCCESS", "Viewed student overview.");

      return sanitized;
    });
  },

  // 取得學生詳細分頁資料 (包含所有子模組詳細唯讀欄位)
  getStudentDetail: function(studentId) {
    return ResponseService.runSecure(function() {
      // 1. 權限校驗
      PermissionService.validateStudentAccess(studentId);

      const user = AuthService.getCurrentUser();
      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
      if (!student) {
        throw new Error("NOT_FOUND: 找不到該學生資料。");
      }

      const profile = DataRepository.selectOne(Config.SHEET_NAMES.SUPPORT_PROFILES, { student_id: studentId });
      const guardians = DataRepository.selectWhere(Config.SHEET_NAMES.GUARDIANS, { student_id: studentId });
      const contactLogs = DataRepository.selectWhere(Config.SHEET_NAMES.CONTACT_LOGS, { student_id: studentId });
      const tasks = DataRepository.selectWhere(Config.SHEET_NAMES.FOLLOW_UP_TASKS, { student_id: studentId });
      const health = DataRepository.selectOne(Config.SHEET_NAMES.HEALTH_ALERTS, { student_id: studentId }) || {};
      const subsidy = DataRepository.selectOne(Config.SHEET_NAMES.SUBSIDY_RECORDS, { student_id: studentId }) || {};

      // 聯絡紀錄時間排序
      contactLogs.sort(function(a, b) {
        return String(b.contact_date).localeCompare(String(a.contact_date));
      });

      const rawData = {
        student: student,
        supportProfile: profile,
        guardians: guardians,
        contactLogs: contactLogs,
        tasks: tasks,
        health: health,
        subsidy: subsidy
      };

      // 2. 進行隱私脫敏過濾
      const sanitized = PrivacyService.sanitizeStudentDetail(rawData, user.role);

      // 3. 寫入存取日誌 (稽核留痕)
      DataRepository.insertAccessLog(user.email, "READ", "STUDENT_DETAIL", studentId, student.class_id, "SUCCESS", "Viewed student detailed tabs.");

      return sanitized;
    });
  },

  // 輔助獲取學生基本列
  getStudentById: function(studentId) {
    return DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
  }
};
