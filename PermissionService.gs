// File: PermissionService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const PermissionService = {
  // 輔助函式：將各種可能格式（JS Date 物件或字串）轉為統一的 YYYY-MM-DD
  formatDateString: function(val) {
    if (!val) return "";
    if (val instanceof Date) {
      return Utilities.formatDate(val, Config.TIME_ZONE, "yyyy-MM-dd");
    }
    const str = String(val).trim();
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    try {
      const d = new Date(str.replace(/\//g, "-"));
      if (!isNaN(d.getTime())) {
        return Utilities.formatDate(d, Config.TIME_ZONE, "yyyy-MM-dd");
      }
    } catch (e) {
      // 轉換失敗則回傳空字串，觸發上層警示
    }
    return "";
  },

  // 取得當前使用者有效的 Scopes (檢查 active 與有效效期)
  getActiveScopes: function(userEmail) {
    const scopes = UserService.getUserScopes(userEmail);
    const todayStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd");
    const allClasses = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);

    return scopes.filter(function(scope) {
      // 1. active 判斷需兼容 boolean true / "TRUE" / "true" / "True"
      const isActive = scope.active === true || String(scope.active).toUpperCase() === "TRUE" || String(scope.active).toLowerCase() === "true";
      if (!isActive) return false;

      // 2. scope_type 全部正規化為大寫
      const scopeType = String(scope.scope_type || "").trim().toUpperCase();

      // 3. CLASS scope 的 scope_value 必須比對 classes.class_id，不得比對 class_name
      if (scopeType === "CLASS") {
        const val = String(scope.scope_value || "").trim();
        const isClassName = allClasses.some(c => String(c.class_name).trim() === val);
        if (isClassName) {
          // 若填寫成班級名稱而非 ID，此 scope 視為無效
          console.warn("Scope ID " + scope.scope_id + " uses class_name instead of class_id.");
          return false;
        }
      }

      // 4. 檢驗效期起日 (effective_from 空白時視為立即生效)
      if (scope.effective_from) {
        const fromStr = PermissionService.formatDateString(scope.effective_from);
        if (fromStr && fromStr.localeCompare(todayStr) > 0) return false;
      }

      // 5. 檢驗效期迄日 (effective_to 空白時視為永久有效)
      if (scope.effective_to) {
        const toStr = PermissionService.formatDateString(scope.effective_to);
        if (toStr && toStr.localeCompare(todayStr) < 0) return false;
      }

      // 回填正規化大寫類型，使後續比較無痛
      scope.scope_type = scopeType;
      return true;
    });
  },

  // 驗證當前登入者是否可存取特定班級
  validateClassAccess: function(classId) {
    const user = AuthService.getCurrentUser();
    const scopes = this.getActiveScopes(user.email);

    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];
      const scopeType = scope.scope_type;
      if (scopeType === "ALL_CLASSES") {
        return true;
      }
      if (scopeType === "CLASS" && String(scope.scope_value).trim() === String(classId).trim()) {
        return true;
      }
      if (scopeType === "GRADE") {
        const classObj = DataRepository.selectOne(Config.SHEET_NAMES.CLASSES, { class_id: classId });
        if (classObj && String(classObj.grade) === String(scope.scope_value)) {
          return true;
        }
      }
    }

    // 寫入拒絕日誌
    DataRepository.insertAccessLog(user.email, "READ", "CLASSES", "", classId, "FAILED_UNAUTHORIZED", "Class access rejected.");
    throw new Error("PERMISSION_DENIED: 權限錯誤，您無權存取此班級資料。");
  },

  // 驗證當前登入者是否可存取特定學生
  validateStudentAccess: function(studentId) {
    const user = AuthService.getCurrentUser();
    const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: studentId });
    if (!student) {
      throw new Error("NOT_FOUND: 找不到該學生資料。");
    }

    const scopes = this.getActiveScopes(user.email);
    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];
      const scopeType = scope.scope_type;
      if (scopeType === "ALL_CLASSES") {
        return true;
      }
      if (scopeType === "CLASS" && String(scope.scope_value).trim() === String(student.class_id).trim()) {
        return true;
      }
      if (scopeType === "STUDENT" && String(scope.scope_value).trim() === String(studentId).trim()) {
        return true;
      }
      if (scopeType === "GRADE") {
        const classObj = DataRepository.selectOne(Config.SHEET_NAMES.CLASSES, { class_id: student.class_id });
        if (classObj && String(classObj.grade) === String(scope.scope_value)) {
          return true;
        }
      }
    }

    // 寫入拒絕日誌
    DataRepository.insertAccessLog(user.email, "READ", "STUDENTS", studentId, student.class_id, "FAILED_UNAUTHORIZED", "Student access rejected.");
    throw new Error("PERMISSION_DENIED: 權限錯誤，您無權存取該生隱私資料。");
  },

  // 獲取當前登入者可存取的所有班級 ID 清單 (僅回傳活躍/ACTIVE的班級)
  getAccessibleClassIds: function() {
    const user = AuthService.getCurrentUser();
    const classes = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
    const activeClasses = classes.filter(c => c.status === "ACTIVE" || String(c.status).toUpperCase() === "ACTIVE");

    const scopes = this.getActiveScopes(user.email);
    const accessibleIds = [];

    for (let i = 0; i < activeClasses.length; i++) {
      const c = activeClasses[i];
      let hasAccess = false;
      for (let j = 0; j < scopes.length; j++) {
        const s = scopes[j];
        const scopeType = s.scope_type;
        if (scopeType === "ALL_CLASSES") {
          hasAccess = true;
          break;
        }
        if (scopeType === "CLASS" && String(s.scope_value).trim() === String(c.class_id).trim()) {
          hasAccess = true;
          break;
        }
        if (scopeType === "GRADE" && String(s.scope_value) === String(c.grade)) {
          hasAccess = true;
          break;
        }
      }
      if (hasAccess) {
        accessibleIds.push(c.class_id);
      }
    }
    return accessibleIds;
  }
};

// 全域診斷函式：debugCurrentUserClassAccess()
function debugCurrentUserClassAccess() {
  const warnings = [];
  let sessionEmail = "";
  let normalizedEmail = "";
  let userFound = false;
  let userRole = "";
  let userActive = false;
  let activeScopeCount = 0;
  const scopesList = [];
  const matchedClassesList = [];

  try {
    sessionEmail = Session.getActiveUser().getEmail();
    if (!sessionEmail) {
      warnings.push("Session.getActiveUser().getEmail() 傳回空值。請確認是否已授權腳本執行。");
    } else {
      normalizedEmail = sessionEmail.trim().toLowerCase();
    }
  } catch (e) {
    warnings.push("無法讀取 Session Email: " + e.message);
  }

  let user = null;
  if (normalizedEmail) {
    try {
      user = UserService.getUserByEmail(normalizedEmail);
      if (user) {
        userFound = true;
        userRole = user.role || "";
        userActive = user.active === true || String(user.active).toUpperCase() === "TRUE" || String(user.active).toLowerCase() === "true";
      } else {
        warnings.push("登入信箱 '" + normalizedEmail + "' 尚未登記在 users 資料表中。");
      }
    } catch (e) {
      warnings.push("讀取使用者資料時發生例外：" + e.message);
    }
  }

  let activeScopes = [];
  if (userFound) {
    try {
      const allScopes = UserService.getUserScopes(normalizedEmail);
      const todayStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd");
      const allClasses = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);

      activeScopes = allScopes.filter(function(scope) {
        const isActive = scope.active === true || String(scope.active).toUpperCase() === "TRUE" || String(scope.active).toLowerCase() === "true";

        const typeStr = String(scope.scope_type || "");
        if (typeStr !== typeStr.toUpperCase()) {
          warnings.push("Scope ID " + scope.scope_id + " 的 scope_type 非大寫字元: '" + typeStr + "'");
        }
        const scopeType = typeStr.toUpperCase();

        if (scopeType === "CLASS" && scope.scope_value) {
          const val = String(scope.scope_value).trim();
          const nameMatch = allClasses.find(c => String(c.class_name).trim() === val);
          if (nameMatch) {
            warnings.push("Scope ID " + scope.scope_id + " 的 scope_value 使用了班級名稱 '" + val + "' 而非 class_id，此範疇將被拒絕。");
          }
        }

        let fromOk = true;
        let toOk = true;

        if (scope.effective_from) {
          const fromStr = PermissionService.formatDateString(scope.effective_from);
          if (!fromStr) {
            warnings.push("Scope ID " + scope.scope_id + " 生效起日格式無效: " + scope.effective_from);
          } else if (fromStr.localeCompare(todayStr) > 0) {
            fromOk = false;
          }
        }

        if (scope.effective_to) {
          const toStr = PermissionService.formatDateString(scope.effective_to);
          if (!toStr) {
            warnings.push("Scope ID " + scope.scope_id + " 生效迄日格式無效: " + scope.effective_to);
          } else if (toStr.localeCompare(todayStr) < 0) {
            toOk = false;
          }
        }

        const isEffective = fromOk && toOk;
        scopesList.push({
          scopeType: scopeType,
          scopeValue: scope.scope_value,
          active: isActive,
          effective: isEffective
        });

        return isActive && isEffective;
      });

      activeScopeCount = activeScopes.length;
    } catch (e) {
      warnings.push("查核 scopes 時發生例外：" + e.message);
    }
  }

  let matchedClassCount = 0;
  if (userFound && userActive) {
    try {
      const classes = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
      const activeClasses = classes.filter(c => c.status === "ACTIVE" || String(c.status).toUpperCase() === "ACTIVE");

      for (let i = 0; i < activeClasses.length; i++) {
        const c = activeClasses[i];
        let hasAccess = false;
        for (let j = 0; j < activeScopes.length; j++) {
          const s = activeScopes[j];
          const scopeType = String(s.scope_type).toUpperCase();
          if (scopeType === "ALL_CLASSES") {
            hasAccess = true;
            break;
          }
          if (scopeType === "CLASS" && String(s.scope_value).trim() === String(c.class_id).trim()) {
            hasAccess = true;
            break;
          }
          if (scopeType === "GRADE" && String(s.scope_value) === String(c.grade)) {
            hasAccess = true;
            break;
          }
        }
        if (hasAccess) {
          matchedClassesList.push({
            classId: c.class_id,
            className: c.class_name,
            status: c.status
          });
        }
      }
      matchedClassCount = matchedClassesList.length;
      if (matchedClassCount === 0) {
        warnings.push("當前活躍之有效 scopes 對應不到任何一個 active classes。");
      }
    } catch (e) {
      warnings.push("匹配班級時發生例外：" + e.message);
    }
  }

  return {
    sessionEmail: sessionEmail,
    normalizedEmail: normalizedEmail,
    userFound: userFound,
    userRole: userRole,
    userActive: userActive,
    activeScopeCount: activeScopeCount,
    scopes: scopesList,
    matchedClassCount: matchedClassCount,
    matchedClasses: matchedClassesList,
    warnings: warnings
  };
}
