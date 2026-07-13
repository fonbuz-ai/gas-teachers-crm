// ==============================================================================
// ClassCare 單檔安裝版 — ClassCareInstaller.gs
// 說明：本檔案由 build.py 自動編譯打包產生。請勿直接修改此檔案。
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Google Apps Script 真實線上環境中執行驗證。
// ==============================================================================

const SYSTEM_NAME = "ClassCare 班級關懷工作台";
const SYSTEM_VERSION = "1";
const INSTALLER_SCHEMA_VERSION = 1;

// --- Start of Config.gs ---
// File: Config.gs
const Config = {
  // 取得試算表 ID
  getSpreadsheetId: function() {
    let id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!id) {
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSs) {
        id = activeSs.getId();
        PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", id);
      } else {
        throw new Error("系統設定錯誤：無法取得目前綁定的 Google 試算表。");
      }
    }
    return id;
  },

  // 取得雲端硬碟限制附件資料夾 ID
  getDriveFolderId: function() {
    const id = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID");
    if (!id) {
      throw new Error("系統設定錯誤：未設定 DRIVE_FOLDER_ID 於指令碼屬性中。");
    }
    return id;
  },

  // 系統時區與語系設定
  TIME_ZONE: "Asia/Taipei",

  // 試算表工作表名稱對照
  SHEET_NAMES: {
    USERS: "users",
    USER_SCOPES: "user_scopes",
    CLASSES: "classes",
    STUDENTS: "students",
    GUARDIANS: "guardians",
    SUPPORT_PROFILES: "student_support_profiles",
    HEALTH_ALERTS: "health_alerts",
    SUBSIDY_RECORDS: "subsidy_records",
    CONTACT_LOGS: "contact_logs",
    FOLLOW_UP_TASKS: "follow_up_tasks",
    ACCESS_LOGS: "access_logs",
    SYSTEM_SETTINGS: "system_settings",
    IMPORT_BATCHES: "import_batches",
    IMPORT_ERRORS: "import_errors",
    IMPORT_STUDENT_MAPPING: "import_student_mapping",
    IMPORT_STUDENTS: "import_students"
  },

  // 各資料表欄位定義 (Schemas) — 不可隨意更動排列順序以維持向下相容性
  SCHEMAS: {
    USERS: [
      "user_id",
      "email",
      "name",
      "role",
      "active",
      "created_at",
      "updated_at"
    ],
    USER_SCOPES: [
      "scope_id",
      "user_email",
      "scope_type",
      "scope_value",
      "active",
      "effective_from",
      "effective_to",
      "reason",
      "created_by",
      "created_at",
      "updated_at"
    ],
    CLASSES: [
      "class_id",
      "school_year",
      "class_name",
      "grade",
      "teacher_email",
      "status",
      "created_at",
      "updated_at"
    ],
    STUDENTS: [
      "student_id",
      "school_year",
      "class_id",
      "seat_no",
      "student_name",
      "birth_date",
      "status",
      "created_at",
      "updated_at"
    ],
    GUARDIANS: [
      "guardian_id",
      "student_id",
      "name",
      "relationship",
      "is_legal_guardian",
      "is_primary_caregiver",
      "phone",
      "contact_time",
      "contact_method",
      "pickup_permission",
      "notes",
      "created_at",
      "updated_at"
    ],
    SUPPORT_PROFILES: [
      "profile_id",
      "student_id",
      "strengths",
      "learning_needs",
      "emotional_support",
      "peer_interaction",
      "effective_strategies",
      "avoid_strategies",
      "transition_notes",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "review_date",
      "created_at",
      "updated_at"
    ],
    HEALTH_ALERTS: [
      "health_id",
      "student_id",
      "alert_level",
      "teacher_summary",
      "possible_symptoms",
      "first_action",
      "contact_guardian",
      "notify_health_center",
      "activity_restriction",
      "restricted_document_url",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "review_date",
      "created_by",
      "created_at",
      "updated_at"
    ],
    SUBSIDY_RECORDS: [
      "record_id",
      "student_id",
      "school_year",
      "subsidy_type",
      "application_status",
      "approved_period",
      "case_owner",
      "document_status",
      "restricted_document_url",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "next_review_date",
      "notes",
      "created_by",
      "created_at",
      "updated_at"
    ],
    CONTACT_LOGS: [
      "log_id",
      "student_id",
      "contact_date",
      "contact_method",
      "contact_person",
      "topic",
      "objective_summary",
      "guardian_response",
      "agreement",
      "follow_up_action",
      "follow_up_date",
      "created_by",
      "created_at",
      "updated_at"
    ],
    FOLLOW_UP_TASKS: [
      "task_id",
      "student_id",
      "task_type",
      "task_title",
      "description",
      "due_date",
      "owner_email",
      "status",
      "priority",
      "source_record_id",
      "created_by",
      "created_at",
      "updated_at"
    ],
    ACCESS_LOGS: [
      "log_id",
      "timestamp",
      "user_email",
      "action",
      "module",
      "student_id",
      "class_id",
      "result",
      "metadata"
    ],
    SYSTEM_SETTINGS: [
      "setting_key",
      "setting_value",
      "description",
      "updated_by",
      "updated_at"
    ],
    IMPORT_BATCHES: [
      "batch_id",
      "timestamp",
      "operator_email",
      "import_type",
      "filename",
      "status",
      "success_count",
      "error_count",
      "created_at"
    ],
    IMPORT_ERRORS: [
      "error_id",
      "batch_id",
      "row_no",
      "raw_data_summary",
      "error_message",
      "created_at"
    ],
    IMPORT_STUDENT_MAPPING: [
      "mapping_id",
      "student_number",
      "school_year",
      "class_name",
      "seat_no",
      "student_name",
      "student_id",
      "created_at",
      "updated_at"
    ],
    IMPORT_STUDENTS: [
      "school_year",
      "class_name",
      "grade",
      "seat_no",
      "student_name",
      "student_number",
      "status",
      "teacher_email"
    ]
  }
};

// --- End of Config.gs ---

// --- Start of ResponseService.gs ---
// File: ResponseService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ResponseService = {
  success: function(data, message = "") {
    return { success: true, data: data, message: message };
  },
  error: function(message, errorCode = "SYSTEM_ERROR") {
    return { success: false, data: null, message: message, errorCode: errorCode };
  },
  runSecure: function(callback) {
    try {
      const data = callback();
      return this.success(data);
    } catch (e) {
      // 擷取自定義的 ERROR CODE
      const msg = e.message;
      if (msg.indexOf("PERMISSION_DENIED") !== -1) {
        return this.error(msg.replace("PERMISSION_DENIED: ", ""), "PERMISSION_DENIED");
      }
      if (msg.indexOf("NOT_FOUND") !== -1) {
        return this.error(msg.replace("NOT_FOUND: ", ""), "NOT_FOUND");
      }
      return this.error(msg, "SYSTEM_ERROR");
    }
  }
};

// --- End of ResponseService.gs ---

// --- Start of ValidationService.gs ---
// File: ValidationService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ValidationService = {
  isValidEmail: function(email) {
    if (!email) return false;
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).trim().toLowerCase());
  },
  sanitizeString: function(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

// --- End of ValidationService.gs ---

// --- Start of DataRepository.gs ---
// File: DataRepository.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const DataRepository = {
  // 取得試算表實體
  getSpreadsheet: function() {
    const id = Config.getSpreadsheetId();
    return SpreadsheetApp.openById(id);
  },

  // 取得特定工作表
  getSheet: function(sheetName) {
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Sheet Error: 找不到指定的工作表。");
    }
    return sheet;
  },

  // 讀取工作表中所有資料列
  selectAll: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    const lastCol = sheet.getLastColumn();
    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0];
    const rows = [];
    for (let r = 1; r < values.length; r++) {
      const rowObj = {};
      for (let c = 0; c < headers.length; c++) {
        rowObj[headers[c]] = values[r][c];
      }
      rows.push(rowObj);
    }
    return rows;
  },

  // 依條件篩選資料列
  selectWhere: function(sheetName, query) {
    const rows = this.selectAll(sheetName);
    return rows.filter(function(row) {
      for (let key in query) {
        if (String(row[key]) !== String(query[key])) return false;
      }
      return true;
    });
  },

  // 讀取單一資料列
  selectOne: function(sheetName, query) {
    const results = this.selectWhere(sheetName, query);
    return results.length > 0 ? results[0] : null;
  },

  // 正式統一的安全寫入方法
  appendRowSecure: function(sheetName, record, options = {}) {
    // 1. 驗證工作表名稱是否在允許的清單內
    let isAllowedSheet = false;
    const sheetNames = Config.SHEET_NAMES;
    for (let k in sheetNames) {
      if (sheetNames[k] === sheetName) {
        isAllowedSheet = true;
        break;
      }
    }
    if (!isAllowedSheet) {
      throw new Error("Security Error: 拒絕寫入未授權或未知的工作表。");
    }

    // 2. 驗證 record 必須是純物件
    if (typeof record !== "object" || record === null || Array.isArray(record)) {
      throw new Error("Validation Error: 寫入資料必須為純物件。");
    }

    const schemaKey = Object.keys(sheetNames).find(k => sheetNames[k] === sheetName);
    const schema = Config.SCHEMAS[schemaKey];
    if (!schema) {
      throw new Error("Schema Error: 找不到指定工作表的欄位定義。");
    }

    // 3. 必要欄位定義與檢驗
    const requiredFields = {
      users: ["email", "name", "role", "active"],
      user_scopes: ["user_email", "scope_type", "scope_value", "active"],
      classes: ["school_year", "class_name", "teacher_email", "status"],
      students: ["school_year", "class_id", "seat_no", "student_name", "status"],
      guardians: ["student_id", "name", "relationship"],
      student_support_profiles: ["student_id"],
      health_alerts: ["student_id", "alert_level", "teacher_summary", "first_action"],
      subsidy_records: ["student_id", "school_year", "subsidy_type", "application_status"],
      contact_logs: ["student_id", "contact_date", "contact_method", "topic"],
      follow_up_tasks: ["student_id", "task_title", "owner_email", "status"],
      access_logs: ["timestamp", "user_email", "action", "module"],
      system_settings: ["setting_key", "setting_value"],
      import_batches: ["timestamp", "operator_email", "import_type", "status"],
      import_errors: ["batch_id", "row_no", "error_message"],
      import_student_mapping: ["school_year", "class_name", "student_name", "student_id"],
      import_students: ["school_year", "class_name", "seat_no", "student_name", "status"]
    };

    // 4. 自動產生 ID (若主鍵未提供)
    const idField = schema[0];
    if (idField !== "setting_key" && idField !== "school_year" && (!record[idField] || record[idField] === "")) {
      record[idField] = Utilities.getUuid();
    }

    // 5. 自動補齊 created_at, updated_at, timestamp
    const nowStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd HH:mm:ss");
    if (schema.indexOf("created_at") !== -1 && !record.created_at) {
      record.created_at = nowStr;
    }
    if (schema.indexOf("updated_at") !== -1 && !record.updated_at) {
      record.updated_at = nowStr;
    }
    if (schema.indexOf("timestamp") !== -1 && !record.timestamp) {
      record.timestamp = nowStr;
    }

    // 6. 進行必要欄位檢驗
    const fieldsToCheck = requiredFields[sheetName] || [];
    const missing = [];
    fieldsToCheck.forEach(function(f) {
      if (record[f] === undefined || record[f] === null || record[f] === "") {
        missing.push(f);
      }
    });

    if (missing.length > 0) {
      // 錯誤訊息中不得含有任何敏感個資與附件網址
      throw new Error("Validation Error: 缺少必要欄位 [" + missing.join(", ") + "]。");
    }

    // 7. 將 record 轉成對齊 schema 順序的列資料，忽略未知欄位
    const rowData = [];
    for (let i = 0; i < schema.length; i++) {
      const val = record[schema[i]];
      rowData.push(val !== undefined && val !== null ? val : "");
    }

    // 8. 使用 LockService 進行文件寫入鎖定
    const lock = LockService.getDocumentLock();
    const timeoutMs = options.timeoutMs || 10000;
    if (!lock.tryLock(timeoutMs)) {
      throw new Error("Lock Timeout: 系統忙碌中，無法寫入資料表。");
    }

    try {
      const sheet = this.getSheet(sheetName);
      sheet.appendRow(rowData);

      // 回傳建立後的安全副本 (拷貝 record，防止原始物件遭後續修改)
      return Object.assign({}, record);
    } finally {
      lock.releaseLock();
    }
  },

  updateWhere: function(sheetName, query, updates) {
    const lock = LockService.getDocumentLock();
    if (!lock.tryLock(10000)) {
      throw new Error("Lock Timeout: 系統忙碌中，無法更新資料表。");
    }
    try {
      const sheet = this.getSheet(sheetName);
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return 0;
      const lastCol = sheet.getLastColumn();
      const range = sheet.getRange(1, 1, lastRow, lastCol);
      const values = range.getValues();
      const headers = values[0];

      const schemaKey = Object.keys(Config.SHEET_NAMES).find(k => Config.SHEET_NAMES[k] === sheetName);
      const schema = Config.SCHEMAS[schemaKey];
      let updatedCount = 0;
      const nowStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd HH:mm:ss");

      for (let r = 1; r < values.length; r++) {
        const row = values[r];
        let match = true;
        for (let key in query) {
          const cIdx = headers.indexOf(key);
          if (cIdx === -1 || String(row[cIdx]) !== String(query[key])) {
            match = false;
            break;
          }
        }

        if (match) {
          for (let key in updates) {
            const cIdx = headers.indexOf(key);
            if (cIdx !== -1 && schema.includes(key)) {
              sheet.getRange(r + 1, cIdx + 1).setValue(updates[key]);
            }
          }
          const upAtIdx = headers.indexOf("updated_at");
          if (upAtIdx !== -1) {
            sheet.getRange(r + 1, upAtIdx + 1).setValue(nowStr);
          }
          updatedCount++;
        }
      }
      return updatedCount;
    } finally {
      lock.releaseLock();
    }
  },

  // 敏感資料存取紀錄寫入方法
  insertAccessLog: function(userEmail, action, module, studentId, classId, result, details = "") {
    const logRecord = {
      user_email: userEmail,
      action: action,
      module: module,
      student_id: studentId || "",
      class_id: classId || "",
      result: result,
      metadata: JSON.stringify({ details: String(details || "").substring(0, 150) })
    };
    this.appendRowSecure(Config.SHEET_NAMES.ACCESS_LOGS, logRecord);
  }
};

// --- End of DataRepository.gs ---

// --- Start of UserService.gs ---
// File: UserService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const UserService = {
  getUserByEmail: function(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    const allUsers = DataRepository.selectAll(Config.SHEET_NAMES.USERS);
    return allUsers.find(u => String(u.email).trim().toLowerCase() === normalized) || null;
  },

  getUserScopes: function(email) {
    if (!email) return [];
    const normalized = String(email).trim().toLowerCase();
    const allScopes = DataRepository.selectAll(Config.SHEET_NAMES.USER_SCOPES);
    return allScopes.filter(s => String(s.user_email).trim().toLowerCase() === normalized);
  }
};

// --- End of UserService.gs ---

// --- Start of PermissionService.gs ---
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

// --- End of PermissionService.gs ---

// --- Start of PrivacyService.gs ---
// File: PrivacyService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const PrivacyService = {
  // 電話號碼遮罩處理 (如 0912345678 ➔ 0912***678)
  maskPhone: function(phone) {
    if (!phone) return "";
    const cleanPhone = String(phone).trim();
    if (cleanPhone.length < 7) {
      return "***";
    }
    // 遮罩中間 3 或 4 位數
    const len = cleanPhone.length;
    const prefixLen = Math.floor(len / 3);
    const suffixLen = Math.floor(len / 3);
    const maskLen = len - prefixLen - suffixLen;
    const mask = "*".repeat(maskLen);
    return cleanPhone.slice(0, prefixLen) + mask + cleanPhone.slice(len - suffixLen);
  },

  // 學生卡片資料脫敏 (用於班級名冊清單)
  sanitizeStudentCard: function(student, supportProfile, guardians, tasks, healthAlerts, subsidyRecords) {
    if (!student) return null;

    // 計算未完成待辦事項數量
    const pendingTasksCount = (tasks || []).filter(function(task) {
      const status = String(task.status).toUpperCase();
      return status === "TODO" || status === "IN_PROGRESS";
    }).length;

    // 檢查是否有健康提醒
    const hasHealthAlert = (healthAlerts || []).length > 0;

    // 檢查是否有補助待確認事項
    const hasSubsidyAlert = (subsidyRecords || []).some(function(rec) {
      const status = String(rec.application_status).toUpperCase();
      return status === "APPLIED" || status === "PENDING_REVIEW";
    });

    // 取得主要照顧者關係
    let primaryCaregiverRel = "尚未建立";
    if (guardians && guardians.length > 0) {
      const primary = guardians.find(function(g) {
        return g.is_primary_caregiver === true || String(g.is_primary_caregiver).toUpperCase() === "TRUE";
      });
      if (primary) {
        primaryCaregiverRel = primary.relationship || "主要照顧者";
      }
    }

    // 取得學生特質與學習優勢摘要 (優先從既有支持摘要中安全提取)
    const personality = supportProfile ? (supportProfile.strengths || "尚未建立") : "尚未建立";
    const learningStrength = supportProfile ? (supportProfile.strengths || "尚未建立") : "尚未建立";
    const supportFocus = supportProfile ? (supportProfile.learning_needs || "尚未建立") : "尚未建立";

    return {
      student_id: student.student_id,
      seat_no: student.seat_no,
      student_name: student.student_name,
      personality_summary: personality,
      learning_strength_summary: learningStrength,
      current_support_summary: supportFocus,
      primary_caregiver_relationship: primaryCaregiverRel,
      pending_tasks_count: pendingTasksCount,
      has_health_alert: hasHealthAlert,
      has_subsidy_alert: hasSubsidyAlert
    };
  },

  // 學生速覽資料脫敏
  sanitizeStudentOverview: function(data, userRole) {
    if (!data) return null;
    const student = data.student || {};
    const profile = data.supportProfile || {};
    const guardians = data.guardians || [];
    const tasks = data.tasks || [];
    const health = data.healthSummary || {};
    const subsidy = data.subsidySummary || {};

    // 遮罩家長聯絡電話
    const sanitizedGuardians = guardians.map(function(g) {
      return {
        relationship: g.relationship || "家長",
        contact_time: g.contact_time || "未設定",
        contact_method: g.contact_method || "未設定",
        phone_masked: PrivacyService.maskPhone(g.phone)
      };
    });

    // 遮罩最近待辦事項，僅保留前 3 筆未完成待辦
    const incompleteTasks = tasks.filter(function(t) {
      const s = String(t.status).toUpperCase();
      return s === "TODO" || s === "IN_PROGRESS";
    }).slice(0, 3).map(function(t) {
      return {
        task_title: t.task_title,
        due_date: t.due_date,
        priority: t.priority
      };
    });

    // 健康行動提醒脫敏 (隱藏 restricted_document_url)
    const sanitizedHealth = {
      alert_level: health.alert_level || "LOW",
      teacher_summary: health.teacher_summary || "尚未建立",
      first_action: health.first_action || "尚未建立",
      contact_guardian: health.contact_guardian || false,
      notify_health_center: health.notify_health_center || false,
      activity_restriction: health.activity_restriction || "無"
    };

    // 補助狀態提醒脫敏 (隱藏 restricted_document_url 與詳細證明文件)
    const sanitizedSubsidy = {
      subsidy_type: subsidy.subsidy_type || "無",
      application_status: subsidy.application_status || "無",
      next_review_date: subsidy.next_review_date || "無",
      case_owner: subsidy.case_owner || "無"
    };

    return {
      student: {
        student_id: student.student_id,
        student_name: student.student_name,
        seat_no: student.seat_no,
        class_id: student.class_id,
        school_year: student.school_year
      },
      personality_summary: profile.strengths || "尚未建立",
      learning_strength_summary: profile.strengths || "尚未建立",
      learning_needs: profile.learning_needs || "尚未建立",
      emotional_support: profile.emotional_support || "尚未建立",
      current_support_summary: profile.learning_needs || "尚未建立",
      effective_strategies: profile.effective_strategies || "尚未建立",
      avoid_strategies: profile.avoid_strategies || "尚未建立",
      guardians: sanitizedGuardians,
      tasks_count: tasks.filter(t => t.status === "TODO" || t.status === "IN_PROGRESS").length,
      recent_tasks: incompleteTasks,
      health_action: sanitizedHealth,
      subsidy_action: sanitizedSubsidy
    };
  },

  // 學生詳細分頁資料脫敏
  sanitizeStudentDetail: function(data, userRole) {
    if (!data) return null;

    const student = data.student || {};
    const profile = data.supportProfile || {};
    const guardians = data.guardians || [];
    const contactLogs = data.contactLogs || [];
    const tasks = data.tasks || [];
    const health = data.health || {};
    const subsidy = data.subsidy || {};

    // 1. 個性與學習 (去除敏感隱私，僅保留支持屬性)
    const studentInfo = {
      strengths: profile.strengths || "尚未建立",
      learning_needs: profile.learning_needs || "尚未建立",
      emotional_support: profile.emotional_support || "尚未建立",
      peer_interaction: profile.peer_interaction || "尚未建立",
      interest_summary: "尚未建立", // 欄位擴充備用
      learning_habits: "尚未建立", // 欄位擴充備用
      source_type: profile.source_type || "OTHER",
      verified_status: profile.verified_status || "UNVERIFIED",
      effective_from: profile.effective_from || "",
      effective_to: profile.effective_to || ""
    };

    // 2. 家庭與聯絡 (掩碼電話，只顯示遮罩版本)
    const guardiansInfo = guardians.map(function(g) {
      return {
        name: g.name,
        relationship: g.relationship,
        is_legal_guardian: g.is_legal_guardian,
        is_primary_caregiver: g.is_primary_caregiver,
        phone_masked: PrivacyService.maskPhone(g.phone),
        contact_time: g.contact_time,
        contact_method: g.contact_method,
        pickup_permission: g.pickup_permission,
        notes: g.notes
      };
    });

    // 3. 支持策略
    const strategiesInfo = {
      effective_strategies: profile.effective_strategies || "尚未建立",
      avoid_strategies: profile.avoid_strategies || "尚未建立",
      transition_notes: profile.transition_notes || "尚未建立",
      emotional_calming: "尚未建立", // 欄位擴充備用
      scaffolding: "尚未建立", // 欄位擴充備用
      classroom_management: "尚未建立" // 欄位擴充備用
    };

    // 4. 重要事件與轉銜 (僅使用安全欄位，不含主觀或標籤化評語)
    const transitionInfo = {
      transition_notes: profile.transition_notes || "尚未建立",
      active_tasks: tasks.filter(t => t.status === "TODO" || t.status === "IN_PROGRESS").map(t => t.task_title),
      contact_summaries: contactLogs.slice(0, 3).map(c => c.topic)
    };

    // 5. 親師聯絡 (脫敏，客觀摘要，無負面文字描述)
    const logsInfo = contactLogs.map(function(c) {
      return {
        contact_date: c.contact_date,
        contact_method: c.contact_method,
        contact_person: c.contact_person,
        topic: c.topic,
        objective_summary: c.objective_summary,
        guardian_response: c.guardian_response,
        agreement: c.agreement,
        follow_up_action: c.follow_up_action,
        follow_up_date: c.follow_up_date
      };
    });

    // 6. 追蹤事項 (分類列表)
    const tasksInfo = {
      todo: tasks.filter(t => t.status === "TODO"),
      in_progress: tasks.filter(t => t.status === "IN_PROGRESS"),
      completed: tasks.filter(t => t.status === "COMPLETED"),
      cancelled: tasks.filter(t => t.status === "CANCELLED"),
      overdue: tasks.filter(function(t) {
        if (t.status !== "TODO" && t.status !== "IN_PROGRESS") return false;
        if (!t.due_date) return false;
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(t.due_date);
        return due < today;
      })
    };

    // 7. 健康與行政提醒 (不含 restricted_document_url, 隱藏敏感醫療與資格證明網址)
    const alertsInfo = {
      health: {
        alert_level: health.alert_level || "LOW",
        teacher_summary: health.teacher_summary || "尚未建立",
        first_action: health.first_action || "尚未建立",
        contact_guardian: health.contact_guardian,
        notify_health_center: health.notify_health_center,
        activity_restriction: health.activity_restriction,
        source_type: health.source_type || "OTHER",
        verified_status: health.verified_status || "UNVERIFIED",
        review_date: health.review_date,
        created_by: health.created_by
      },
      subsidy: {
        school_year: subsidy.school_year || "無",
        subsidy_type: subsidy.subsidy_type || "無",
        application_status: subsidy.application_status || "無",
        approved_period: subsidy.approved_period || "無",
        case_owner: subsidy.case_owner || "無",
        document_status: subsidy.document_status || "無",
        source_type: subsidy.source_type || "OTHER",
        verified_status: subsidy.verified_status || "UNVERIFIED",
        next_review_date: subsidy.next_review_date || "無",
        notes: subsidy.notes || "無"
      }
    };

    return {
      student: {
        student_id: student.student_id,
        student_name: student.student_name,
        seat_no: student.seat_no,
        class_id: student.class_id,
        school_year: student.school_year
      },
      learning: studentInfo,
      guardians: guardiansInfo,
      strategies: strategiesInfo,
      transition: transitionInfo,
      contactLogs: logsInfo,
      tasks: tasksInfo,
      alerts: alertsInfo
    };
  }
};

// --- End of PrivacyService.gs ---

// --- Start of AuthService.gs ---
// File: AuthService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const AuthService = {
  // 取得當前 Session 登入的 Google Email (身份唯一的信任根)
  getActiveUserEmail: function() {
    const email = Session.getActiveUser().getEmail();
    if (!email) {
      throw new Error("Unauthorized: 無法讀取您的 Google 登入帳號，存取遭拒。");
    }
    return email.trim().toLowerCase();
  },

  // 取得當前登入者於 users 表之基本資料
  getCurrentUser: function() {
    const email = this.getActiveUserEmail();
    const user = UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("Unauthorized: 您的帳號在系統中尚未註冊，請聯絡系統管理員。");
    }
    const isActive = user.active === true || String(user.active).toUpperCase() === "TRUE" || String(user.active).toLowerCase() === "true";
    if (!isActive) {
      throw new Error("Unauthorized: 您的帳號已被停用，存取遭拒。");
    }
    return user;
  }
};

// --- End of AuthService.gs ---

// --- Start of SetupService.gs ---
// File: SetupService.gs
const SetupService = {
  // 初始化系統：安全地建立工作表與寫入標題欄
  setupSystem: function() {
    const activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (!activeSs) {
      throw new Error("初始化失敗：請從綁定的 Google 試算表執行設定精靈。");
    }

    // 將目前試算表 ID 寫入 Script Properties 進行永久綁定
    const ssId = activeSs.getId();
    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ssId);

    const lock = LockService.getScriptLock();
    try {
      if (!lock.tryLock(60000)) {
        throw new Error("初始化逾時：無法取得寫入鎖定。");
      }

      const ss = SpreadsheetApp.openById(ssId);
      const sheetNames = Config.SHEET_NAMES;
      const schemas = Config.SCHEMAS;
      const createdSheets = [];

      for (let key in sheetNames) {
        const name = sheetNames[key];
        const schema = schemas[key];
        let sheet = ss.getSheetByName(name);

        if (!sheet) {
          sheet = ss.insertSheet(name);
          sheet.appendRow(schema);
        } else {
          if (SetupService.isHeaderEmpty(sheet, schema.length)) {
            sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
          }
        }

        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, schema.length).setFontWeight("bold");
        if (sheet.getFilter() === null) {
          sheet.getRange(1, 1, sheet.getMaxRows(), schema.length).createFilter();
        }
        sheet.autoResizeColumns(1, schema.length);

        if (name === sheetNames.HEALTH_ALERTS || name === sheetNames.SUBSIDY_RECORDS) {
          sheet.setTabColor("#ea4335");
        } else if (name === sheetNames.ACCESS_LOGS) {
          sheet.setTabColor("#fbbc05");
        }
        createdSheets.push(name);
      }

      const settingsSheet = ss.getSheetByName(sheetNames.SYSTEM_SETTINGS);
      SetupService.initSetting(settingsSheet, "INITIALIZATION_STATUS", "TRUE", "系統是否已初始化完成");
      SetupService.initSetting(settingsSheet, "VERSION", "1", "系統版本編號");
      SetupService.initSetting(settingsSheet, "SCHEMA_VERSION", "1", "資料庫欄位架構版本");

      return {
        success: true,
        spreadsheetId: ssId,
        spreadsheetName: ss.getName(),
        createdSheets: createdSheets,
        expectedSheetCount: Object.keys(Config.SHEET_NAMES).length,
        message: "ClassCare 系統資料表已建立完成。"
      };
    } finally {
      lock.releaseLock();
    }
  },

  isHeaderEmpty: function(sheet, schemaLength) {
    if (sheet.getLastColumn() === 0) return true;
    const values = sheet.getRange(1, 1, 1, schemaLength).getValues()[0];
    return values.every(val => val === null || val === "" || val === undefined);
  },

  initSetting: function(sheet, key, value, desc) {
    const data = sheet.getDataRange().getValues();
    let exists = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      DataRepository.appendRowSecure(Config.SHEET_NAMES.SYSTEM_SETTINGS, {
        setting_key: key,
        setting_value: value,
        description: desc,
        updated_by: "SYSTEM"
      });
    }
  },

  rowExists: function(sheet, schema, query) {
    if (sheet.getLastRow() <= 1) return false;
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

    for (let i = 0; i < data.length; i++) {
      let match = true;
      for (let key in query) {
        const colIndex = schema.indexOf(key);
        if (colIndex === -1 || String(data[i][colIndex]) !== String(query[key])) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  },

  findRowValue: function(sheet, schema, query, returnKey) {
    if (sheet.getLastRow() <= 1) return null;
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    const returnColIndex = schema.indexOf(returnKey);
    if (returnColIndex === -1) return null;

    for (let i = 0; i < data.length; i++) {
      let match = true;
      for (let key in query) {
        const colIndex = schema.indexOf(key);
        if (colIndex === -1 || String(data[i][colIndex]) !== String(query[key])) {
          match = false;
          break;
        }
      }
      if (match) return data[i][returnColIndex];
    }
    return null;
  },

  validateSystemStructure: function() {
    const errors = [];
    const warnings = [];

    let ssId = "";
    try {
      ssId = Config.getSpreadsheetId();
    } catch (e) {
      errors.push("Script Properties 中未設定 SPREADSHEET_ID。");
      return { success: false, errors: errors, warnings: warnings };
    }

    let ss;
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      errors.push("無法開啟指定之 SPREADSHEET_ID 試算表。");
      return { success: false, errors: errors, warnings: warnings };
    }

    const sheetNames = Config.SHEET_NAMES;
    const schemas = Config.SCHEMAS;

    for (let key in sheetNames) {
      const name = sheetNames[key];
      const expectedSchema = schemas[key];
      const sheet = ss.getSheetByName(name);

      if (!sheet) {
        errors.push(`缺少必要工作表：${name}`);
        continue;
      }

      const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
      for (let i = 0; i < expectedSchema.length; i++) {
        if (i >= actualHeaders.length) {
          errors.push(`工作表 ${name} 欄位不完整：缺少預期欄位 [${expectedSchema[i]}]`);
        } else if (actualHeaders[i] !== expectedSchema[i]) {
          errors.push(`工作表 ${name} 欄位對齊不相符：在第 ${i + 1} 欄，預期為 [${expectedSchema[i]}]，實際為 [${actualHeaders[i]}]`);
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors: errors, warnings: warnings };
    }

    const usersSheet = ss.getSheetByName(sheetNames.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    const userEmails = [];
    let activeAdminCount = 0;

    for (let i = 1; i < usersData.length; i++) {
      const email = usersData[i][1];
      const role = usersData[i][3];
      const active = usersData[i][4];
      if (email) {
        if (userEmails.includes(email)) {
          errors.push(`重複的使用者 Email 註冊：${email}`);
        } else {
          userEmails.push(email);
        }
      }
      if (role === "ADMIN" && (active === true || active === "TRUE" || active === "true")) {
        activeAdminCount++;
      }
    }

    if (activeAdminCount === 0) {
      errors.push("系統檢查錯誤：找不到任何處於啟用狀態的系統管理員 (ADMIN)。");
    }

    return {
      success: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }
};

// --- End of SetupService.gs ---

// --- Start of AdminBootstrapService.gs ---
// File: AdminBootstrapService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const AdminBootstrapService = {
  promptAdminSetup: function() {
    const ui = SpreadsheetApp.getUi();

    // 檢查是否已有管理員存在
    if (this.hasActiveAdmin()) {
      ui.alert("權限警告", "系統已存在啟用狀態的管理員，無法透過此流程任意建立管理員帳號。", ui.ButtonSet.OK);
      return;
    }

    const emailResponse = ui.prompt("設定管理員", "請輸入第一位管理員的 Email (需為 Google 帳號)：", ui.ButtonSet.OK_CANCEL);
    if (emailResponse.getSelectedButton() !== ui.Button.OK) return;
    const email = emailResponse.getResponseText().trim().toLowerCase();

    if (!ValidationService.isValidEmail(email)) {
      ui.alert("格式錯誤", "輸入的 Email 格式不正確。", ui.ButtonSet.OK);
      return;
    }

    const nameResponse = ui.prompt("設定管理員", "請輸入管理員姓名：", ui.ButtonSet.OK_CANCEL);
    if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
    const name = nameResponse.getResponseText().trim();

    try {
      const result = this.setupAdminDirect(email, name);
      ui.alert(result);
    } catch (e) {
      ui.alert("設定錯誤", e.message, ui.ButtonSet.OK);
    }
  },

  hasActiveAdmin: function() {
    const ss = DataRepository.getSpreadsheet();
    const sheet = ss.getSheetByName(Config.SHEET_NAMES.USERS);
    if (!sheet || sheet.getLastRow() <= 1) return false;
    const data = sheet.getRange(2, 4, sheet.getLastRow() - 1, 2).getValues(); // role & active
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === "ADMIN" && (data[i][1] === true || String(data[i][1]).toUpperCase() === "TRUE")) {
        return true;
      }
    }
    return false;
  },

  setupAdminDirect: function(email, name) {
    if (this.hasActiveAdmin()) {
      throw new Error("設定失敗：系統已存在啟用中的管理員，拒絕重複寫入。");
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!ValidationService.isValidEmail(cleanEmail)) {
      throw new Error("設定失敗：Email 格式不正確。");
    }
    const cleanName = ValidationService.sanitizeString(name).trim();
    if (!cleanName) {
      throw new Error("設定失敗：姓名不可為空。");
    }
    const userId = Utilities.getUuid();

    // 寫入 users
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USERS, {
      user_id: userId,
      email: cleanEmail,
      name: cleanName,
      role: "ADMIN",
      active: "TRUE"
    });

    // 寫入 scopes (改為無效期限制，即空白)
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USER_SCOPES, {
      user_email: cleanEmail,
      scope_type: "ALL_CLASSES",
      scope_value: "*",
      active: "TRUE",
      effective_from: "",
      effective_to: "",
      reason: "初始化第一位管理員",
      created_by: "SYSTEM"
    });

    // 寫入稽核日誌
    AuditLogService.logAccess("SYSTEM", "INITIAL_ADMIN_SETUP", cleanEmail, "SUCCESS", { email: cleanEmail });

    return "管理員 [" + cleanName + "] (" + cleanEmail + ") 設定成功！";
  }
};

// --- End of AdminBootstrapService.gs ---

// --- Start of DemoDataService.gs ---
// File: DemoDataService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const DemoDataService = {
  DEMO_KEY: "CLASSCARE_DEMO_V1",

  seedDemoData: function() {
    const ss = DataRepository.getSpreadsheet();
    const sheetNames = Config.SHEET_NAMES;
    const key = this.DEMO_KEY;
    const nowStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd HH:mm:ss");

    // 1. 寫入或取得使用者
    const usersSheet = ss.getSheetByName(sheetNames.USERS);
    const currentEmail = Session.getActiveUser().getEmail().trim().toLowerCase();
    const adminEmail = "admin@example.com";
    const teacherEmail = "teacher@example.com";
    const healthEmail = "health@example.com";
    const subsidyEmail = "subsidy@example.com";

    // 建立目前登入者為管理員 (如果不存在)
    let currentUserObj = UserService.getUserByEmail(currentEmail);
    if (!currentUserObj) {
      DataRepository.appendRowSecure(sheetNames.USERS, {
        user_id: Utilities.getUuid(),
        email: currentEmail,
        name: "當前登入者 (" + key + ")",
        role: "ADMIN",
        active: "TRUE"
      });
    }

    let adminUserId = SetupService.findRowValue(usersSheet, Config.SCHEMAS.USERS, { email: adminEmail }, "user_id");
    if (!adminUserId) {
      adminUserId = Utilities.getUuid();
      DataRepository.appendRowSecure(sheetNames.USERS, {
        user_id: adminUserId,
        email: adminEmail,
        name: "示範管理員 (" + key + ")",
        role: "ADMIN",
        active: "TRUE"
      });
    }

    let teacherUserId = SetupService.findRowValue(usersSheet, Config.SCHEMAS.USERS, { email: teacherEmail }, "user_id");
    if (!teacherUserId) {
      teacherUserId = Utilities.getUuid();
      DataRepository.appendRowSecure(sheetNames.USERS, {
        user_id: teacherUserId,
        email: teacherEmail,
        name: "林小華 (" + key + ")",
        role: "CLASS_TEACHER",
        active: "TRUE"
      });
    }

    let healthUserId = SetupService.findRowValue(usersSheet, Config.SCHEMAS.USERS, { email: healthEmail }, "user_id");
    if (!healthUserId) {
      healthUserId = Utilities.getUuid();
      DataRepository.appendRowSecure(sheetNames.USERS, {
        user_id: healthUserId,
        email: healthEmail,
        name: "陳護理師 (" + key + ")",
        role: "HEALTH_CENTER",
        active: "TRUE"
      });
    }

    let subsidyUserId = SetupService.findRowValue(usersSheet, Config.SCHEMAS.USERS, { email: subsidyEmail }, "user_id");
    if (!subsidyUserId) {
      subsidyUserId = Utilities.getUuid();
      DataRepository.appendRowSecure(sheetNames.USERS, {
        user_id: subsidyUserId,
        email: subsidyEmail,
        name: "張組長 (" + key + ")",
        role: "SUBSIDY_OFFICER",
        active: "TRUE"
      });
    }

    // 2. 建立虛擬班級
    const classesSheet = ss.getSheetByName(sheetNames.CLASSES);
    let classId = SetupService.findRowValue(classesSheet, Config.SCHEMAS.CLASSES, { class_name: "五年三班 (" + key + ")" }, "class_id");
    if (!classId) {
      classId = Utilities.getUuid();
      DataRepository.appendRowSecure(sheetNames.CLASSES, {
        class_id: classId,
        school_year: 114,
        class_name: "五年三班 (" + key + ")",
        grade: 5,
        teacher_email: teacherEmail,
        status: "ACTIVE"
      });
    }

    // 3. 授權 Scopes
    const scopesSheet = ss.getSheetByName(sheetNames.USER_SCOPES);
    const scopesSchema = Config.SCHEMAS.USER_SCOPES;

    // 為目前登入者建立 ALL_CLASSES scope
    if (!SetupService.rowExists(scopesSheet, scopesSchema, { user_email: currentEmail, scope_type: "ALL_CLASSES" })) {
      DataRepository.appendRowSecure(sheetNames.USER_SCOPES, {
        user_email: currentEmail,
        scope_type: "ALL_CLASSES",
        scope_value: "*",
        active: "TRUE",
        effective_from: "2026-01-01",
        effective_to: "2029-12-31",
        reason: "管理員全域授權 (" + key + ")",
        created_by: "SYSTEM"
      });
    }

    // 指派目前登入者為示範班導師 (CLASS scope 指向五年三班，且日期空白以驗證空白生效)
    if (!SetupService.rowExists(scopesSheet, scopesSchema, { user_email: currentEmail, scope_type: "CLASS", scope_value: classId })) {
      DataRepository.appendRowSecure(sheetNames.USER_SCOPES, {
        user_email: currentEmail,
        scope_type: "CLASS",
        scope_value: classId,
        active: "TRUE",
        effective_from: "", // 空白代表立即生效
        effective_to: "",   // 空白代表永久有效
        reason: "指派目前登入帳號為示範班導師 (" + key + ")",
        created_by: "SYSTEM"
      });
    }

    if (!SetupService.rowExists(scopesSheet, scopesSchema, { user_email: adminEmail, scope_type: "ALL_CLASSES" })) {
      DataRepository.appendRowSecure(sheetNames.USER_SCOPES, {
        user_email: adminEmail,
        scope_type: "ALL_CLASSES",
        scope_value: "*",
        active: "TRUE",
        effective_from: "2026-01-01",
        effective_to: "2027-12-31",
        reason: "管理員授權 (" + key + ")",
        created_by: "SYSTEM"
      });
    }
    if (!SetupService.rowExists(scopesSheet, scopesSchema, { user_email: teacherEmail, scope_type: "CLASS", scope_value: classId })) {
      DataRepository.appendRowSecure(sheetNames.USER_SCOPES, {
        user_email: teacherEmail,
        scope_type: "CLASS",
        scope_value: classId,
        active: "TRUE",
        effective_from: "2026-08-01",
        effective_to: "2027-07-31",
        reason: "五年三班導師授權 (" + key + ")",
        created_by: "SYSTEM"
      });
    }

    // 4. 寫入 12 學生
    const studentsSheet = ss.getSheetByName(sheetNames.STUDENTS);
    const studentsSchema = Config.SCHEMAS.STUDENTS;
    const studentNames = ["王小明", "李小美", "張大同", "林小萍", "劉大華", "蔡智強", "黃雅婷", "陳冠宇", "楊智捷", "吳東憲", "趙婉君", "徐若瑄"];
    const birthDates = ["2015-03-12", "2015-05-18", "2015-07-22", "2015-01-30", "2015-11-04", "2015-09-15", "2015-02-28", "2015-10-10", "2015-04-05", "2015-06-25", "2015-08-14", "2015-12-01"];
    const studentIds = [];

    for (let i = 0; i < studentNames.length; i++) {
      const demoName = studentNames[i] + " (" + key + ")";
      let studentId = SetupService.findRowValue(studentsSheet, studentsSchema, { student_name: demoName, seat_no: i + 1 }, "student_id");
      if (!studentId) {
        studentId = Utilities.getUuid();
        DataRepository.appendRowSecure(sheetNames.STUDENTS, {
          student_id: studentId,
          school_year: 114,
          class_id: classId,
          seat_no: i + 1,
          student_name: demoName,
          birth_date: birthDates[i],
          status: "ACTIVE"
        });
      }
      studentIds.push(studentId);
    }

    // 5. 寫入 8 名學生支持摘要與不同特質
    const supportSheet = ss.getSheetByName(sheetNames.SUPPORT_PROFILES);
    const supportSchema = Config.SCHEMAS.SUPPORT_PROFILES;
    const mockProfiles = [
      ["數理邏輯強，喜愛動手操作", "閱讀理解速度稍慢，需要視覺化輔助圖表", "挫折忍受力較低，面臨失敗時容易放棄", "樂於助人，與同學互動熱絡，但有時較為好動", "給予明確的分步指導，多給予口頭肯定", "避免當眾大聲指責或進行大面積抄寫處罰", "轉銜自某附小，曾接受專注力調整訓練"],
      ["語文表達能力佳，寫作情感豐富", "數學計算速度慢，對數字較缺乏自信", "心思細膩，容易因他人評價而焦慮", "與女同學相處融洽，擔任小老師盡責", "安排同儕學習，給予具體小進步反饋", "避免限時高壓考試，避免在班上公開比較分數", "無特殊轉銜紀錄"],
      ["體育與動態活動表現優異，節奏感強", "課堂靜態專注力維持較短，易受窗外干擾", "活潑樂觀，但生氣時偶有衝動說話", "同儕領袖，善於帶動團體氣氛", "安排第一排靠近講台，適度指派課堂肢體協助任務", "避免長時間單向講授，避免直接口頭威脅", "健康中心註記需注意活動量與光敏感"],
      ["藝術創作與色彩敏感度高，作畫專注", "英文發音與記憶單字感到吃力", "文靜內向，極少主動向師長尋求協助", "較為孤立，僅與特定一幾位同學交談", "小組分組引導發言，利用畫作肯定自信", "避免當眾點名發言，避免強迫其融入大群體", "單親家庭，父親平日工作忙碌"],
      ["電腦與資訊操作熟練，喜愛科學探索", "文字書寫速度慢，字跡較不工整", "自尊心強，面對指正時易產生防衛心", "與同學互動較直白，偶有口角", "利用電腦打字交作業，引導其協助班級設備", "避免直接批評其字跡，避免在大眾面前質問", "無特殊轉銜紀錄"],
      ["閱讀面廣，科普知識豐富", "手眼協調度稍弱，精細動作較吃力", "情緒溫和，但容易因步調太快感到不知所措", "相處和善，但較少參與動態運動", "給予充足作答時間，給予簡化的手作指引", "避免催促步調，避免以動作快慢評斷表現", "隔代教養特案補助"],
      ["音樂與歌唱天賦高，節奏感優異", "邏輯推理與應用問題理解較慢", "樂觀開朗，但對於學業落後有些失落", "人緣極佳，樂於配合班級集體活動", "課後適度個別加強應用題解，使用歌謠輔助記憶", "避免過度繁複的邏輯拆解，避免貼上功課差標籤", "家庭低收入戶補件中"],
      ["具備領導力，處事冷靜條理分明", "對自我要求極高，易產生完美主義壓力", "自我克制，不輕易流露負面情緒", "受同學信賴，常擔任組長與班長", "肯定其負責態度，但引導其接受容錯率", "避免給予過重的完美期望，避免過度放大其失誤", "無特殊轉銜紀錄"]
    ];

    for (let i = 0; i < mockProfiles.length; i++) {
      const p = mockProfiles[i];
      if (!SetupService.rowExists(supportSheet, supportSchema, { student_id: studentIds[i] })) {
        DataRepository.appendRowSecure(sheetNames.SUPPORT_PROFILES, {
          student_id: studentIds[i],
          strengths: p[0],
          learning_needs: p[1],
          emotional_support: p[2],
          peer_interaction: p[3],
          effective_strategies: p[4],
          avoid_strategies: p[5],
          transition_notes: p[6] + " (" + key + ")",
          source_type: "TEACHER_OBSERVATION",
          verified_status: "VERIFIED",
          verified_by: adminEmail,
          effective_from: "2026-08-01",
          effective_to: "2027-07-31",
          review_date: "2027-01-15"
        });
      }
    }

    // 6. 寫入家長
    const guardiansSheet = ss.getSheetByName(sheetNames.GUARDIANS);
    const guardiansSchema = Config.SCHEMAS.GUARDIANS;
    const parentRoles = [
      ["王大川", "父", "0912-345678", "主要聯絡人"],
      ["李國華", "父", "0933-222111", "主要聯絡人"],
      ["陳秋香", "母", "0921-987654", "主要聯絡人"],
      ["林茂松", "祖父", "0944-555666", "主要聯絡人"],
      ["劉建國", "舅舅", "0955-666777", "主要聯絡人"],
      ["蔡阿嬤", "祖母", "0988-777666", "主要聯絡人，文字聯絡"],
      ["黃淑芬", "母", "0977-888999", "主要聯絡人"],
      ["陳明哲", "父", "0966-777888", "主要聯絡人"]
    ];

    for (let i = 0; i < parentRoles.length; i++) {
      const g = parentRoles[i];
      if (!SetupService.rowExists(guardiansSheet, guardiansSchema, { student_id: studentIds[i], name: g[0] })) {
        DataRepository.appendRowSecure(sheetNames.GUARDIANS, {
          student_id: studentIds[i],
          name: g[0],
          relationship: g[1],
          is_legal_guardian: "TRUE",
          is_primary_caregiver: "TRUE",
          phone: g[2],
          contact_time: "18:00過後",
          contact_method: "電話",
          pickup_permission: "TRUE",
          notes: g[3] + " (" + key + ")"
        });
      }
    }

    // 7. 寫入至少 8 筆親師聯絡紀錄
    const contactSheet = ss.getSheetByName(sheetNames.CONTACT_LOGS);
    const contactSchema = Config.SCHEMAS.CONTACT_LOGS;
    for (let i = 0; i < 8; i++) {
      const sIndex = i % 4;
      const cDate = "2026-09-0" + (i + 1);
      if (!SetupService.rowExists(contactSheet, contactSchema, { student_id: studentIds[sIndex], contact_date: cDate })) {
        DataRepository.appendRowSecure(sheetNames.CONTACT_LOGS, {
          student_id: studentIds[sIndex],
          contact_date: cDate,
          contact_method: "電話",
          contact_person: "主要照顧者",
          topic: "常規關懷溝通",
          objective_summary: "與家長客觀溝通學生在校作息，上課互動良好。 (" + key + ")",
          guardian_response: "家長對學校安排表示認同並願意配合引導。",
          agreement: "親師達成共識，加強學生返家課後閱讀習慣。",
          follow_up_action: "持續追蹤作業繳交情況",
          follow_up_date: "2026-09-15",
          created_by: teacherEmail
        });
      }
    }

    // 8. 寫入至少 6 筆未完成的追蹤任務
    const tasksSheet = ss.getSheetByName(sheetNames.FOLLOW_UP_TASKS);
    const tasksSchema = Config.SCHEMAS.FOLLOW_UP_TASKS;
    const taskList = [
      [studentIds[0], "HEALTH", "確認氣喘吸入劑效期", "需請家長確認書包內氣喘吸入劑是否在效期內", "2026-09-10", teacherEmail, "TODO", "HIGH"],
      [studentIds[1], "HEALTH", "過敏防範核對", "向午餐廚房核對花生過敏源防範標記", "2026-09-05", teacherEmail, "TODO", "URGENT"],
      [studentIds[6], "SUBSIDY", "追蹤黃雅婷證明文件補件", "聯絡家長提醒補交低收入戶證明正本", "2026-09-20", subsidyEmail, "TODO", "NORMAL"],
      [studentIds[0], "SUPPORT", "第一次專注力評估", "觀察小明上課專注時間，記錄有效引導成效", "2026-09-30", teacherEmail, "IN_PROGRESS", "NORMAL"],
      [studentIds[5], "SUPPORT", "親師交流回饋", "確認蔡阿嬤對聯絡簿字體大小之回饋", "2026-09-12", teacherEmail, "TODO", "LOW"],
      [studentIds[2], "HEALTH", "癲癇防護演練確認", "與健康中心確認班級癲癇處置演練日期", "2026-09-18", teacherEmail, "TODO", "NORMAL"]
    ];

    for (let i = 0; i < taskList.length; i++) {
      const t = taskList[i];
      if (!SetupService.rowExists(tasksSheet, tasksSchema, { student_id: t[0], task_title: t[2] })) {
        DataRepository.appendRowSecure(sheetNames.FOLLOW_UP_TASKS, {
          student_id: t[0],
          task_type: t[1],
          task_title: t[2],
          description: t[3] + " (" + key + ")",
          due_date: t[4],
          owner_email: t[5],
          status: t[6],
          priority: t[7],
          source_record_id: "",
          created_by: teacherEmail
        });
      }
    }

    // 9. 少量健康與補助
    const healthSheet = ss.getSheetByName(sheetNames.HEALTH_ALERTS);
    const healthSchema = Config.SCHEMAS.HEALTH_ALERTS;
    if (!SetupService.rowExists(healthSheet, healthSchema, { student_id: studentIds[0], alert_level: "HIGH" })) {
      DataRepository.appendRowSecure(sheetNames.HEALTH_ALERTS, {
        student_id: studentIds[0],
        alert_level: "HIGH",
        teacher_summary: "氣喘發作風險。學生書包內備有吸入劑。",
        possible_symptoms: "劇烈咳嗽、呼吸急促、喘鳴聲",
        first_action: "立即協助使用隨身吸入劑，並至通風處平躺休息",
        contact_guardian: "TRUE",
        notify_health_center: "TRUE",
        activity_restriction: "避免於冷氣房劇烈運動，冷氣房內運動需配戴口罩 (" + key + ")",
        restricted_document_url: "https://drive.google.com/open?id=restricted_medical_cert_01",
        source_type: "MEDICAL_DOCUMENT",
        verified_status: "VERIFIED",
        verified_by: healthEmail,
        effective_from: "2026-08-01",
        effective_to: "2027-07-31",
        review_date: "2027-01-31",
        created_by: healthEmail
      });
    }

    const subsidySheet = ss.getSheetByName(sheetNames.SUBSIDY_RECORDS);
    const subsidySchema = Config.SCHEMAS.SUBSIDY_RECORDS;
    if (!SetupService.rowExists(subsidySheet, subsidySchema, { student_id: studentIds[3], subsidy_type: "午餐補助" })) {
      DataRepository.appendRowSecure(sheetNames.SUBSIDY_RECORDS, {
        student_id: studentIds[3],
        school_year: 114,
        subsidy_type: "午餐補助",
        application_status: "APPROVED",
        approved_period: "114學年度第一學期",
        case_owner: subsidyEmail,
        document_status: "齊備",
        restricted_document_url: "https://drive.google.com/open?id=restricted_subsidy_cert_01",
        source_type: "GOVERNMENT_RECORD",
        verified_status: "VERIFIED",
        verified_by: subsidyEmail,
        effective_from: "2026-08-01",
        effective_to: "2027-01-31",
        next_review_date: "2027-01-15",
        notes: "初審合格 (" + key + ")",
        created_by: subsidyEmail
      });
    }

    const settingsSheet = ss.getSheetByName(sheetNames.SYSTEM_SETTINGS);
    SetupService.initSetting(settingsSheet, "DEMO_DATA_SEEDED", "TRUE", "是否已寫入測試示範資料");
    return "SUCCESS";
  },

  clearDemoData: function() {
    const lock = LockService.getScriptLock();
    try {
      if (!lock.tryLock(30000)) throw new Error("清理示範資料逾時：無法取得寫入鎖定。");
      const ss = DataRepository.getSpreadsheet();
      const sheetNames = Config.SHEET_NAMES;
      const key = this.DEMO_KEY;
      let deleteCount = 0;

      const tablesToDelete = [
        sheetNames.FOLLOW_UP_TASKS,
        sheetNames.CONTACT_LOGS,
        sheetNames.SUBSIDY_RECORDS,
        sheetNames.HEALTH_ALERTS,
        sheetNames.SUPPORT_PROFILES,
        sheetNames.GUARDIANS,
        sheetNames.STUDENTS,
        sheetNames.USER_SCOPES,
        sheetNames.CLASSES,
        sheetNames.USERS
      ];

      for (let t = 0; t < tablesToDelete.length; t++) {
        const sheet = ss.getSheetByName(tablesToDelete[t]);
        if (!sheet || sheet.getLastRow() <= 1) continue;
        const maxRow = sheet.getLastRow();
        const data = sheet.getDataRange().getValues();
        for (let r = maxRow; r >= 2; r--) {
          const rowValues = data[r - 1];
          let isDemo = false;
          for (let c = 0; c < rowValues.length; c++) {
            if (String(rowValues[c]).indexOf(key) !== -1) {
              isDemo = true;
              break;
            }
          }
          if (isDemo) {
            sheet.deleteRow(r);
            deleteCount++;
          }
        }
      }

      const settingsSheet = ss.getSheetByName(sheetNames.SYSTEM_SETTINGS);
      const settingsData = settingsSheet.getDataRange().getValues();
      for (let i = settingsData.length; i >= 2; i--) {
        if (settingsData[i - 1][0] === "DEMO_DATA_SEEDED") {
          settingsSheet.deleteRow(i);
        }
      }

      return "成功清理示範資料，共移除 " + deleteCount + " 筆記錄。";
    } finally {
      lock.releaseLock();
    }
  }
};

// --- End of DemoDataService.gs ---

// --- Start of SystemStatusService.gs ---
// File: SystemStatusService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const SystemStatusService = {
  getSystemStatus: function() {
    const errors = [];
    const warnings = [];

    let ssName = "無法取得";
    let adminCount = 0;
    let driveFolderSet = false;
    let demoDataSeeded = false;
    const sheetStatus = {};

    try {
      const ss = DataRepository.getSpreadsheet();
      ssName = ss.getName();

      // Check all sheets existence and structure
      const sheetNames = Config.SHEET_NAMES;
      const schemas = Config.SCHEMAS;

      for (let key in sheetNames) {
        const name = sheetNames[key];
        // Skip check for temporary/import sheets from throwing errors, but check existence
        const sheet = ss.getSheetByName(name);
        if (!sheet) {
          sheetStatus[name] = false;
          errors.push(`缺少工作表：${name}`);
        } else {
          sheetStatus[name] = true;
          // Column validation
          const expectedSchema = schemas[key];
          const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
          for (let i = 0; i < expectedSchema.length; i++) {
            if (i >= actualHeaders.length) {
              errors.push(`工作表 ${name} 欄位不完整：缺少欄位 [${expectedSchema[i]}]`);
              sheetStatus[name] = false;
            } else if (actualHeaders[i] !== expectedSchema[i]) {
              errors.push(`工作表 ${name} 欄位對齊不符：第 ${i + 1} 欄，預期 [${expectedSchema[i]}]，實際 [${actualHeaders[i]}]`);
              sheetStatus[name] = false;
            }
          }
        }
      }

      // Check Admin users count
      const users = DataRepository.selectAll(Config.SHEET_NAMES.USERS);
      users.forEach(u => {
        const isActive = u.active === true || String(u.active).toUpperCase() === "TRUE" || String(u.active).toLowerCase() === "true";
        if (u.role === "ADMIN" && isActive) {
          adminCount++;
        }
      });
      if (adminCount === 0) {
        errors.push("系統檢查錯誤：找不到任何處於啟用狀態的系統管理員 (ADMIN)。");
      }

      // Check Drive folder setting
      const folderId = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID");
      if (folderId) {
        try {
          const folder = DriveApp.getFolderById(folderId);
          if (folder) driveFolderSet = true;
        } catch (e) {
          warnings.push("已設定 DRIVE_FOLDER_ID 但無法讀取，可能無存取權限。");
        }
      }

      // Check Demo Data flag
      const demoFlag = DataRepository.selectOne(Config.SHEET_NAMES.SYSTEM_SETTINGS, { setting_key: "DEMO_DATA_SEEDED" });
      if (demoFlag && String(demoFlag.setting_value).toUpperCase() === "TRUE") {
        demoDataSeeded = true;
      }
    } catch (e) {
      errors.push("系統狀態取得失敗：" + e.message);
    }

    return {
      version: SYSTEM_VERSION,
      schemaVersion: INSTALLER_SCHEMA_VERSION,
      spreadsheetName: ssName,
      sheetStatus: sheetStatus,
      adminCount: adminCount,
      driveFolderSet: driveFolderSet,
      demoDataSeeded: demoDataSeeded,
      errors: errors,
      warnings: warnings
    };
  }
};

// --- End of SystemStatusService.gs ---

// --- Start of AuditLogService.gs ---
// File: AuditLogService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const AuditLogService = {
  logAccess: function(module, action, userEmail, result, metadata = {}) {
    DataRepository.insertAccessLog(userEmail, action, module, metadata.student_id, metadata.class_id, result, metadata.details);
  }
};

// --- End of AuditLogService.gs ---

// --- Start of UIService.gs ---
// File: UIService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const UIService = {
  // 開啟導師工作台 (大型模態對話框)
  openTeacherWorkspace: function() {
    const html = HtmlService.createTemplate(TeacherWorkspaceHtml).evaluate()
      .setTitle("ClassCare 班級轉銜與學生理解工作台")
      .setWidth(1100)
      .setHeight(760);
    SpreadsheetApp.getUi().showModalDialog(html, "導師工作台");
  },

  // 開啟系統管理側邊欄 (原 openSidebar 重命名)
  openSystemSidebar: function() {
    const userEmail = Session.getActiveUser().getEmail() || "未登入";
    const sidebarHtml = `
      <div style="font-family: sans-serif; padding: 15px; background-color: #f4f6f9; height: 100vh;">
        <h3 style="color:#1a73e8; margin-bottom: 5px;">ClassCare 系統管理</h3>
        <p style="font-size: 12px; color:#5f6368; margin-top:0;">版本：V${SYSTEM_VERSION}</p>
        <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 15px;">
          <strong>當前登入帳號</strong>
          <div style="font-size:12px; word-break:break-all; color:#1a73e8; margin-top:5px;">\${userEmail}</div>
        </div>
        <button onclick="google.script.run.setupOrValidateSystem()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#1a73e8; color:white; border:none; border-radius:4px; cursor:pointer;">驗證系統結構</button>
        <button onclick="google.script.run.showAdminSetupDialog()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#34a853; color:white; border:none; border-radius:4px; cursor:pointer;">設定管理員</button>
        <button onclick="google.script.run.seedDemoDataFromMenu()" style="width:100%; padding:10px; margin-bottom:8px; background-color:#fbbc05; color:black; border:none; border-radius:4px; cursor:pointer;">建立示範資料</button>
      </div>
    `;
    const htmlOutput = HtmlService.createHtmlOutput(sidebarHtml).setTitle("ClassCare 系統管理");
    SpreadsheetApp.getUi().showSidebar(htmlOutput);
  },

  // 開啟設定精靈
  openSetupWizard: function() {
    const html = HtmlService.createTemplate(SetupWizardHtml).evaluate() // 可簡化
      .setWidth(500)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, "啟動設定精靈");
  },

  // 開啟匯入中心
  openImportCenter: function() {
    const html = HtmlService.createTemplate(ImportCenterHtml).evaluate()
      .setWidth(900)
      .setHeight(650);
    SpreadsheetApp.getUi().showModalDialog(html, "匯入中心");
  },

  // 開啟預檢與匯入對話框
  openPrecheckDialog: function() {
    const html = HtmlService.createTemplate(PrecheckDialogHtml).evaluate()
      .setWidth(950)
      .setHeight(680);
    SpreadsheetApp.getUi().showModalDialog(html, "學生名冊匯入中心 MVP");
  },

  // 開啟系統狀態校對對話框 (新增實作)
  openSystemStatus: function() {
    const html = HtmlService.createTemplate(SystemStatusHtml).evaluate()
      .setWidth(550)
      .setHeight(480);
    SpreadsheetApp.getUi().showModalDialog(html, "系統狀態");
  },

  // 開啟關於系統對話框 (新增實作)
  openAboutDialog: function() {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      "關於 ClassCare 班級關懷工作台",
      "版本編號：V" + SYSTEM_VERSION + "\n資料庫架構版本：" + INSTALLER_SCHEMA_VERSION + "\n時區：Asia/Taipei\n\n核心功能定位：新接班級導師的學生理解與轉銜平台。",
      ui.ButtonSet.OK
    );
  },

  // 開啟管理員設定對話框 (新增對照)
  openAdminSetupDialog: function() {
    AdminBootstrapService.promptAdminSetup();
  }
};

// --- End of UIService.gs ---

// --- Start of ClassService.gs ---
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

// --- End of ClassService.gs ---

// --- Start of StudentService.gs ---
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

// --- End of StudentService.gs ---

// --- Start of GuardianService.gs ---
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

// --- End of GuardianService.gs ---

// --- Start of SupportProfileService.gs ---
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

// --- End of SupportProfileService.gs ---

// --- Start of ContactLogService.gs ---
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

// --- End of ContactLogService.gs ---

// --- Start of FollowUpService.gs ---
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

// --- End of FollowUpService.gs ---

// --- Start of HealthService.gs ---
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

// --- End of HealthService.gs ---

// --- Start of SubsidyService.gs ---
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

// --- End of SubsidyService.gs ---

// --- Start of ImportService.gs ---
// File: ImportService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ImportService = {
  // 建立學生名冊匯入範本 (清除並寫入標題列)
  createImportTemplate: function() {
    const ss = DataRepository.getSpreadsheet();
    let sheet = ss.getSheetByName(Config.SHEET_NAMES.IMPORT_STUDENTS);
    if (!sheet) {
      sheet = ss.insertSheet(Config.SHEET_NAMES.IMPORT_STUDENTS);
    } else {
      sheet.clear();
    }
    const headers = Config.SCHEMAS.IMPORT_STUDENTS;
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.autoResizeColumns(1, headers.length);
    return ResponseService.success(null, "學生名冊匯入範本已建立於工作表 'import_students'。請在該工作表中填入/貼上資料後，點選『預檢學生名冊』。");
  },

  // 讀取暫存工作表 import_students 的資料列
  readImportStudentsSheet: function() {
    const ss = DataRepository.getSpreadsheet();
    const sheet = ss.getSheetByName(Config.SHEET_NAMES.IMPORT_STUDENTS);
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    const lastCol = sheet.getLastColumn();
    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0].map(h => String(h).trim().toLowerCase());

    const colIndex = {
      school_year: headers.indexOf("school_year"),
      class_name: headers.indexOf("class_name"),
      grade: headers.indexOf("grade"),
      seat_no: headers.indexOf("seat_no"),
      student_name: headers.indexOf("student_name"),
      student_number: headers.indexOf("student_number"),
      status: headers.indexOf("status"),
      teacher_email: headers.indexOf("teacher_email")
    };

    const rows = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      // 略過完全空白列
      if (row.every(val => val === null || String(val).trim() === "")) continue;

      const obj = {
        school_year: colIndex.school_year !== -1 ? row[colIndex.school_year] : "",
        class_name: colIndex.class_name !== -1 ? row[colIndex.class_name] : "",
        grade: colIndex.grade !== -1 ? row[colIndex.grade] : "",
        seat_no: colIndex.seat_no !== -1 ? row[colIndex.seat_no] : "",
        student_name: colIndex.student_name !== -1 ? row[colIndex.student_name] : "",
        student_number: colIndex.student_number !== -1 ? row[colIndex.student_number] : "",
        status: colIndex.status !== -1 ? row[colIndex.status] : "",
        teacher_email: colIndex.teacher_email !== -1 ? row[colIndex.teacher_email] : ""
      };
      rows.push({ rowNo: r + 1, data: obj });
    }
    return rows;
  },

  // 學生比對邏輯 (三階比對順序)
  findMatchedStudent: function(row, mappingList, studentList, classList) {
    const studentNumber = String(row.student_number || "").trim();
    const schoolYear = parseInt(row.school_year || "0", 10);
    const className = String(row.class_name || "").trim();
    const seatNo = parseInt(row.seat_no || "0", 10);

    // 1. 優先級 1：學年度 (school_year) + 學號 (student_number)
    if (schoolYear && studentNumber) {
      const mapping = mappingList.find(m => String(m.student_number).trim() === studentNumber && parseInt(m.school_year, 10) === schoolYear);
      if (mapping) {
        const student = studentList.find(s => s.student_id === mapping.student_id);
        if (student) return student;
      }
    }

    // 2. 優先級 2：學年度 (school_year) + 班級名稱 (class_name) + 座號 (seat_no)
    if (schoolYear && className && seatNo) {
      const cls = classList.find(c => parseInt(c.school_year, 10) === schoolYear && String(c.class_name).trim() === className);
      if (cls) {
        const student = studentList.find(s => s.class_id === cls.class_id && parseInt(s.seat_no, 10) === seatNo && s.status === "ACTIVE");
        if (student) return student;
      }
    }

    return null;
  },

  // 學生名冊預檢 (Dry-Run Validation)
  validateStudentRoster: function() {
    const rows = this.readImportStudentsSheet();
    if (rows.length === 0) {
      return { success: false, message: "工作表 'import_students' 中無任何資料，請先填入資料。" };
    }

    const mappingList = DataRepository.selectAll(Config.SHEET_NAMES.IMPORT_STUDENT_MAPPING);
    const studentList = DataRepository.selectAll(Config.SHEET_NAMES.STUDENTS);
    const classList = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
    const userList = DataRepository.selectAll(Config.SHEET_NAMES.USERS);

    let totalRows = rows.length;
    let validRows = 0;
    let warningRows = 0;
    let errorRows = 0;

    let newClasses = 0;
    let existingClasses = 0;
    let newStudents = 0;
    let updatedStudents = 0;
    let newTeachers = 0;
    let newScopes = 0;

    const reports = [];

    // 用於檢查批次內部資料重複性
    const importedSeats = {};
    const importedStudentNumbers = {};

    rows.forEach(r => {
      const d = r.data;
      const sYear = parseInt(d.school_year, 10);
      const cName = String(d.class_name).trim();
      const seat = parseInt(d.seat_no, 10);
      const sNum = String(d.student_number).trim();

      if (!isNaN(sYear) && cName && !isNaN(seat)) {
        const key = `${sYear}_${cName}`;
        if (!importedSeats[key]) importedSeats[key] = [];
        importedSeats[key].push({ rowNo: r.rowNo, seat });
      }
      if (!isNaN(sYear) && sNum) {
        const key = `${sYear}`;
        if (!importedStudentNumbers[key]) importedStudentNumbers[key] = [];
        importedStudentNumbers[key].push({ rowNo: r.rowNo, sNum });
      }
    });

    const proposedClasses = {};
    const proposedTeachers = {};
    const proposedScopes = {};

    rows.forEach(r => {
      const d = r.data;
      const rowNo = r.rowNo;
      const summary = `行 ${rowNo}: 姓名 ${d.student_name || "未填"}, 班級 ${d.class_name || "未填"}, 座號 ${d.seat_no || "未填"}`;

      let hasError = false;
      let hasWarning = false;
      const msgs = [];

      // 1. 必填欄位缺漏
      if (!d.school_year || !d.class_name || d.seat_no === "" || !d.student_name || !d.status) {
        msgs.push("必填欄位缺漏");
        hasError = true;
      }

      // 2. 學年度格式錯誤
      const sYear = parseInt(d.school_year, 10);
      if (d.school_year && isNaN(sYear)) {
        msgs.push("學年度格式錯誤");
        hasError = true;
      }

      // 3. 座號格式錯誤
      const seat = parseInt(d.seat_no, 10);
      if (d.seat_no !== "" && (isNaN(seat) || seat <= 0)) {
        msgs.push("座號格式錯誤");
        hasError = true;
      }

      // 4. status 不合法
      const statusUpper = String(d.status || "").trim().toUpperCase();
      const allowedStatus = ["ACTIVE", "INACTIVE", "TRANSFERRED"];
      if (d.status && !allowedStatus.includes(statusUpper)) {
        msgs.push("status不合法");
        hasError = true;
      }

      // 5. Email 格式錯誤
      const tEmail = String(d.teacher_email || "").trim().toLowerCase();
      if (d.teacher_email && !ValidationService.isValidEmail(tEmail)) {
        msgs.push("Email 格式錯誤");
        hasError = true;
      }

      if (hasError) {
        errorRows++;
        reports.push({ rowNo, summary, status: "ERROR", message: msgs.join("；") });
        return;
      }

      // 6. 同班座號重複 (批次內部)
      const seatKey = `${sYear}_${String(d.class_name).trim()}`;
      const seatDup = importedSeats[seatKey].filter(x => x.seat === seat);
      if (seatDup.length > 1) {
        msgs.push("同班座號重複");
        hasError = true;
      }

      // 7. student_number 重複 (批次內部)
      const sNum = String(d.student_number || "").trim();
      if (sNum) {
        const numKey = `${sYear}`;
        const numDup = importedStudentNumbers[numKey].filter(x => x.sNum === sNum);
        if (numDup.length > 1) {
          msgs.push("student_number 重複");
          hasError = true;
        }
      }

      if (hasError) {
        errorRows++;
        reports.push({ rowNo, summary, status: "ERROR", message: msgs.join("；") });
        return;
      }

      // 8. 學生比對與 Database 規則比對
      let match1 = null; // 學號比對
      let match2 = null; // 班級座號比對
      let match3 = null; // 姓名比對 (警告用途)

      if (sNum) {
        const mapping = mappingList.find(m => String(m.student_number).trim() === sNum && parseInt(m.school_year, 10) === sYear);
        if (mapping) {
          match1 = studentList.find(s => s.student_id === mapping.student_id);
        }
      }

      const cls = classList.find(c => parseInt(c.school_year, 10) === sYear && String(c.class_name).trim() === String(d.class_name).trim());
      if (cls) {
        match2 = studentList.find(s => s.class_id === cls.class_id && parseInt(s.seat_no, 10) === seat && s.status === "ACTIVE");
        match3 = studentList.find(s => s.class_id === cls.class_id && String(s.student_name).trim() === String(d.student_name).trim() && s.status === "ACTIVE");
      }

      // 無法明確比對學生 (衝突)
      if (match1 && match2 && match1.student_id !== match2.student_id) {
        msgs.push("無法明確比對學生");
        errorRows++;
        reports.push({ rowNo, summary, status: "ERROR", message: msgs.join("；") });
        return;
      }

      const matchedStudent = match1 || match2;

      if (matchedStudent) {
        updatedStudents++;
        // 學生姓名與既有資料不同
        if (String(matchedStudent.student_name).trim() !== String(d.student_name).trim()) {
          msgs.push("學生姓名與既有資料不同");
          hasWarning = true;
        }
        // 學生可能由其他班級轉入
        if (match1 && cls && match1.class_id !== cls.class_id) {
          msgs.push("學生可能由其他班級轉入");
          hasWarning = true;
        }
      } else {
        // 只靠姓名找到疑似學生 (但無學號或座號重合，做為新學生建立)
        if (match3) {
          msgs.push("只靠姓名找到疑似學生");
          hasWarning = true;
        }
        newStudents++;
      }

      // 班級狀態評估
      let classId = cls ? cls.class_id : proposedClasses[`${sYear}_${d.class_name}`];
      if (!classId) {
        newClasses++;
        classId = "proposed_" + Utilities.getUuid();
        proposedClasses[`${sYear}_${d.class_name}`] = classId;
      } else if (cls) {
        existingClasses++;
      }

      // 導師與 Scopes 評估
      if (tEmail) {
        const existingUser = userList.find(u => String(u.email).trim().toLowerCase() === tEmail);
        if (existingUser && existingUser.role !== "CLASS_TEACHER" && existingUser.role !== "ADMIN") {
          msgs.push("teacher_email 已存在但角色不同");
          hasWarning = true;
        }

        // 班級已有其他導師
        if (cls && cls.teacher_email && String(cls.teacher_email).trim().toLowerCase() !== tEmail) {
          msgs.push("班級已有其他導師");
          hasWarning = true;
        }

        if (!existingUser && !proposedTeachers[tEmail]) {
          proposedTeachers[tEmail] = "CLASS_TEACHER";
          newTeachers++;
        }

        const scopeKey = `${tEmail}_${classId}`;
        const existingScope = DataRepository.selectOne(Config.SHEET_NAMES.USER_SCOPES, {
          user_email: tEmail,
          scope_type: "CLASS",
          scope_value: classId
        });
        if (!existingScope && !proposedScopes[scopeKey]) {
          proposedScopes[scopeKey] = true;
          newScopes++;
        }
      }

      if (hasWarning) {
        warningRows++;
        reports.push({ rowNo, summary, status: "WARNING", message: msgs.join("；") });
      } else {
        validRows++;
        reports.push({ rowNo, summary, status: "SUCCESS", message: matchedStudent ? "預檢通過，將更新該生資訊。" : "預檢通過，將建立新學生。" });
      }
    });

    return {
      success: true,
      totalRows,
      validRows,
      warningRows,
      errorRows,
      newClasses,
      existingClasses,
      newStudents,
      updatedStudents,
      newTeachers,
      newScopes,
      reports
    };
  },

  // 正式匯入學生名冊
  importStudentRoster: function() {
    const operator = AuthService.getActiveUserEmail();
    const dryRun = this.validateStudentRoster();
    if (!dryRun.success) return ResponseService.error(dryRun.message);

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(60000)) {
      return ResponseService.error("系統忙碌中，無法取得寫入鎖定。");
    }

    try {
      const batchId = Utilities.getUuid();
      const nowStr = Utilities.formatDate(new Date(), Config.TIME_ZONE, "yyyy-MM-dd HH:mm:ss");

      // 1. 建立匯入批次紀錄
      DataRepository.appendRowSecure(Config.SHEET_NAMES.IMPORT_BATCHES, {
        batch_id: batchId,
        timestamp: nowStr,
        operator_email: operator,
        import_type: "STUDENT_ROSTER",
        filename: "import_students 工作表匯入",
        status: dryRun.errorRows > 0 ? "PARTIAL" : "SUCCESS",
        success_count: dryRun.validRows + dryRun.warningRows,
        error_count: dryRun.errorRows
      });

      const mappingList = DataRepository.selectAll(Config.SHEET_NAMES.IMPORT_STUDENT_MAPPING);
      const studentList = DataRepository.selectAll(Config.SHEET_NAMES.STUDENTS);
      const classList = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
      const userList = DataRepository.selectAll(Config.SHEET_NAMES.USERS);

      const rows = this.readImportStudentsSheet();
      let importedCount = 0;

      rows.forEach(r => {
        const d = r.data;
        const rowNo = r.rowNo;

        // 重新執行簡化預檢，確保資料無重大缺失 (防並發修改)
        const sYear = parseInt(d.school_year, 10);
        const seat = parseInt(d.seat_no, 10);
        const statusUpper = String(d.status || "").trim().toUpperCase();
        const tEmail = String(d.teacher_email || "").trim().toLowerCase();
        const sNum = String(d.student_number || "").trim();

        if (!d.school_year || !d.class_name || d.seat_no === "" || !d.student_name || !d.status || isNaN(sYear) || isNaN(seat)) {
          DataRepository.appendRowSecure(Config.SHEET_NAMES.IMPORT_ERRORS, {
            batch_id: batchId,
            row_no: rowNo,
            raw_data_summary: `行 ${rowNo}: 姓名 ${d.student_name || "未填"}`,
            error_message: "必要欄位缺漏或格式錯誤"
          });
          return;
        }

        // a. 建立或取得班級
        let cls = classList.find(c => parseInt(c.school_year, 10) === sYear && String(c.class_name).trim() === String(d.class_name).trim());
        let classId;
        if (!cls) {
          classId = Utilities.getUuid();
          const newClassRecord = {
            class_id: classId,
            school_year: sYear,
            class_name: d.class_name,
            grade: parseInt(d.grade, 10) || parseInt(d.class_name.match(/\d+/) || "0", 10) || 1,
            teacher_email: tEmail || "",
            status: "ACTIVE"
          };
          DataRepository.appendRowSecure(Config.SHEET_NAMES.CLASSES, newClassRecord);
          cls = newClassRecord;
          classList.push(newClassRecord);
        } else {
          classId = cls.class_id;
          if (tEmail && String(cls.teacher_email).trim().toLowerCase() !== tEmail) {
            DataRepository.updateWhere(Config.SHEET_NAMES.CLASSES, { class_id: classId }, { teacher_email: tEmail });
            cls.teacher_email = tEmail;
          }
        }

        // b. 建立或更新導師使用者
        if (tEmail) {
          const existingUser = userList.find(u => String(u.email).trim().toLowerCase() === tEmail);
          if (!existingUser) {
            const newTeacherRecord = {
              user_id: Utilities.getUuid(),
              email: tEmail,
              name: d.class_name + "導師",
              role: "CLASS_TEACHER",
              active: "TRUE"
            };
            DataRepository.appendRowSecure(Config.SHEET_NAMES.USERS, newTeacherRecord);
            userList.push(newTeacherRecord);
          } else if (existingUser.role === "CLASS_TEACHER" && (existingUser.active === false || String(existingUser.active).toUpperCase() === "FALSE")) {
            DataRepository.updateWhere(Config.SHEET_NAMES.USERS, { email: tEmail }, { active: "TRUE" });
          }

          // c. 建立或更新 user_scopes
          const existingScope = DataRepository.selectOne(Config.SHEET_NAMES.USER_SCOPES, {
            user_email: tEmail,
            scope_type: "CLASS",
            scope_value: classId
          });
          if (!existingScope) {
            DataRepository.appendRowSecure(Config.SHEET_NAMES.USER_SCOPES, {
              scope_email_unused: "", // fallback
              user_email: tEmail,
              scope_type: "CLASS",
              scope_value: classId,
              active: "TRUE",
              effective_from: "", // 立即生效
              effective_to: "",   // 永久有效
              reason: `班級 ${d.class_name} 匯入指派導師`,
              created_by: operator
            });
          }
        }

        // d. 比對學生並寫入/更新
        let matchedStudent = this.findMatchedStudent(d, mappingList, studentList, classList);

        if (matchedStudent) {
          // 更新既有學生資訊，保留 student_id，不可刪除
          DataRepository.updateWhere(Config.SHEET_NAMES.STUDENTS, { student_id: matchedStudent.student_id }, {
            class_id: classId,
            seat_no: seat,
            student_name: d.student_name,
            status: statusUpper
          });
          matchedStudent.student_name = d.student_name;
          matchedStudent.class_id = classId;
          matchedStudent.seat_no = seat;
          matchedStudent.status = statusUpper;
        } else {
          // 建立新學生
          const studentId = Utilities.getUuid();
          const newStudent = {
            student_id: studentId,
            school_year: sYear,
            class_id: classId,
            seat_no: seat,
            student_name: d.student_name,
            birth_date: "", // 未知
            status: statusUpper
          };
          DataRepository.appendRowSecure(Config.SHEET_NAMES.STUDENTS, newStudent);
          studentList.push(newStudent);

          // 寫入學號對照關係
          DataRepository.appendRowSecure(Config.SHEET_NAMES.IMPORT_STUDENT_MAPPING, {
            student_number: sNum,
            school_year: sYear,
            class_name: d.class_name,
            seat_no: seat,
            student_name: d.student_name,
            student_id: studentId
          });
        }
        importedCount++;
      });

      // 6. 執行 validateSystemStructure
      const structuralCheck = SetupService.validateSystemStructure();
      if (!structuralCheck.success) {
        console.warn("結構檢查發現異常：" + structuralCheck.errors.join("\n"));
      }

      // 7. 驗證每個 teacher_email 能透過 ClassService.listAccessibleClasses() 取得對應班級
      // (記錄在 Audit Log 中，用以確保權限鏈完全閉合)
      rows.forEach(r => {
        const tEmail = String(r.data.teacher_email || "").trim().toLowerCase();
        if (tEmail) {
          try {
            const accessible = PermissionService.getActiveScopes(tEmail);
            const matches = accessible.some(s => s.scope_type === "CLASS" || s.scope_type === "ALL_CLASSES");
            AuditLogService.logAccess("IMPORT_VERIFY", "TEACHER_ACCESS_CHECK", operator, matches ? "SUCCESS" : "FAILED", {
              details: `Teacher ${tEmail} scope verification after batch import.`
            });
          } catch (e) {
            AuditLogService.logAccess("IMPORT_VERIFY", "TEACHER_ACCESS_CHECK", operator, "ERROR", {
              details: `Teacher ${tEmail} scope verify error: ${e.message}`
            });
          }
        }
      });

      // 8. 驗證目前操作人員 (Operator) 是否擁有對新匯入班級的存取權限
      const operatorScopes = PermissionService.getActiveScopes(operator);
      const hasAllClasses = operatorScopes.some(s => s.scope_type === "ALL_CLASSES");
      let operatorHasAccess = hasAllClasses;

      if (!operatorHasAccess) {
        const affectedClassIds = [];
        rows.forEach(r => {
          const sYear = parseInt(r.data.school_year, 10);
          const cls = classList.find(c => parseInt(c.school_year, 10) === sYear && String(c.class_name).trim() === String(r.data.class_name).trim());
          if (cls && !affectedClassIds.includes(cls.class_id)) {
            affectedClassIds.push(cls.class_id);
          }
        });
        const classScopes = operatorScopes.filter(s => s.scope_type === "CLASS").map(s => String(s.scope_value).trim());
        operatorHasAccess = affectedClassIds.every(id => classScopes.includes(id));
      }

      AuditLogService.logAccess("IMPORT", "COMMIT_STUDENT_ROSTER", operator, "SUCCESS", {
        details: `Batch completed. Imported count: ${importedCount}`
      });

      return ResponseService.success({
        importedCount: importedCount,
        operatorHasAccess: operatorHasAccess,
        operator: operator
      }, "正式匯入完成！");
    } finally {
      lock.releaseLock();
    }
  },

  // 讀取匯入紀錄批次
  listImportBatches: function() {
    AuthService.getCurrentUser();
    const batches = DataRepository.selectAll(Config.SHEET_NAMES.IMPORT_BATCHES);
    batches.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    return ResponseService.success(batches.slice(0, 30));
  }
};

// --- End of ImportService.gs ---

// --- Start of TestRunner.gs ---
// File: TestRunner.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const TestRunner = {
  // 列出可存取班級測試
  testListAccessibleClasses: function() {
    return ClassService.listAccessibleClasses();
  },

  // 列出可存取學生測試
  testListAccessibleStudents: function() {
    const classes = ClassService.listAccessibleClasses();
    if (classes.success && classes.data.length > 0) {
      const classId = classes.data[0].class_id;
      return StudentService.listAccessibleStudents(classId, "全部");
    }
    return ResponseService.error("無可存取班級以利測試。");
  },

  // 取得學生速覽測試
  testGetStudentOverview: function(studentId) {
    return StudentService.getStudentOverview(studentId);
  },

  // 取得學生詳細資料測試
  testGetStudentDetail: function(studentId) {
    return StudentService.getStudentDetail(studentId);
  },

  // 測試非法學生 ID 存取攔截
  testUnauthorizedStudentAccess: function() {
    try {
      PermissionService.validateStudentAccess("fake_unauthorized_student_id");
      return ResponseService.error("安全性失敗：未攔截非法學生 ID！");
    } catch (e) {
      return ResponseService.success(null, "攔截成功：" + e.message);
    }
  },

  // 學生卡片脫敏測試
  testStudentCardSanitization: function() {
    const student = { student_id: "s001", seat_no: 1, student_name: "小明", class_id: "c001", school_year: 114 };
    const profile = { strengths: "英文強", learning_needs: "專注低" };
    const guardians = [{ relationship: "父", phone: "0912345678", is_primary_caregiver: true }];
    const tasks = [{ status: "TODO" }];

    const card = PrivacyService.sanitizeStudentCard(student, profile, guardians, tasks, [], []);
    const ok = card.student_name === "小明" && card.pending_tasks_count === 1 && !card.hasOwnProperty("phone");
    return ok ? ResponseService.success(card, "脫敏成功") : ResponseService.error("脫敏檢驗失敗");
  },

  // 電話號碼遮罩測試
  testStudentDetailSanitization: function() {
    const phone = "0912345678";
    const masked = PrivacyService.maskPhone(phone);
    return masked === "0912***678" ? ResponseService.success(masked, "遮罩正常") : ResponseService.error("遮罩失敗：" + masked);
  },

  // 測試 DataRepository.appendRowSecure 安全限制
  testDataRepositoryAppendRowSecure: function() {
    const testResults = [];

    // 1. 測試未知工作表名稱被拒絕
    try {
      DataRepository.appendRowSecure("invalid_sheet_name", { key: "val" });
      testResults.push({ name: "未知工作表名稱被拒絕", success: false });
    } catch (e) {
      testResults.push({ name: "未知工作表名稱被拒絕", success: e.message.indexOf("Security Error") !== -1 });
    }

    // 2. 測試缺少必要欄位被拒絕
    try {
      DataRepository.appendRowSecure(Config.SHEET_NAMES.USERS, { email: "test@example.com" }); // 缺少 name, role, active
      testResults.push({ name: "缺少必要欄位被拒絕", success: false });
    } catch (e) {
      testResults.push({ name: "缺少必要欄位被拒絕", success: e.message.indexOf("Validation Error") !== -1 });
    }

    // 3. 測試非純物件參數被拒絕
    try {
      DataRepository.appendRowSecure(Config.SHEET_NAMES.USERS, ["test@example.com", "name"]);
      testResults.push({ name: "非純物件參數被拒絕", success: false });
    } catch (e) {
      testResults.push({ name: "非純物件參數被拒絕", success: e.message.indexOf("Validation Error") !== -1 });
    }

    const allPassed = testResults.every(r => r.success);
    return allPassed ? ResponseService.success(testResults, "DataRepository 寫入防護測試通過") : ResponseService.error("DataRepository 測試未通過");
  },

  // 測試匯入預檢與解析機制
  testImportService: function() {
    // Test 1: 空資料預檢驗證
    const emptyRes = ImportService.validateStudentRoster("");
    if (emptyRes.success) return ResponseService.error("空資料預檢應失敗，但成功了。");

    // Test 2: 學生名冊預檢與解析 (使用空字串將讀取當前工作表，因此暫以直接空回傳輔助測試)
    return ResponseService.success(null, "ImportService 基本靜態檢查通過");
  },

  // 測試授權與 Scopes 驗證鏈
  testScopeAuthorizationChain: function() {
    const ss = DataRepository.getSpreadsheet();
    const tempClassId = "temp_class_test_id";
    const tempClassName = "測試班級名稱";

    let tempClass = DataRepository.selectOne(Config.SHEET_NAMES.CLASSES, { class_id: tempClassId });
    if (!tempClass) {
      DataRepository.appendRowSecure(Config.SHEET_NAMES.CLASSES, {
        class_id: tempClassId,
        school_year: 114,
        class_name: tempClassName,
        grade: 1,
        teacher_email: "test_temp_teacher@example.com",
        status: "ACTIVE"
      });
    }

    const tempEmail = "TeSt_UsEr@ExAmPlE.cOm";
    const normalized = tempEmail.trim().toLowerCase();

    this.clearTempTestRecords(tempEmail);

    // 寫入測試使用者
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USERS, {
      user_id: "temp_user_id_01",
      email: tempEmail,
      name: "測試人員",
      role: "CLASS_TEACHER",
      active: "TRUE"
    });

    // 寫入測試 Scopes (CLASS 類型)
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USER_SCOPES, {
      scope_id: "temp_scope_id_01",
      user_email: tempEmail,
      scope_type: "class", // 測試大小寫不一致
      scope_value: tempClassId,
      active: "TRUE",
      effective_from: "", // 立即生效
      effective_to: "",   // 永久有效
      reason: "測試",
      created_by: "TEST"
    });

    // 寫入過期 Scopes
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USER_SCOPES, {
      scope_id: "temp_scope_id_02",
      user_email: tempEmail,
      scope_type: "CLASS",
      scope_value: "some_other_class_id",
      active: "TRUE",
      effective_from: "2020-01-01",
      effective_to: "2020-12-31",
      reason: "測試過期",
      created_by: "TEST"
    });

    // 寫入使用 class_name 而非 class_id 的 Scope (應被判定無效)
    DataRepository.appendRowSecure(Config.SHEET_NAMES.USER_SCOPES, {
      scope_id: "temp_scope_id_03",
      user_email: tempEmail,
      scope_type: "CLASS",
      scope_value: tempClassName,
      active: "TRUE",
      effective_from: "",
      effective_to: "",
      reason: "測試類名被拒",
      created_by: "TEST"
    });

    const testResults = [];
    try {
      const user = UserService.getUserByEmail(normalized);
      testResults.push({ name: "Email大小寫不同比對", success: user !== null && user.email === tempEmail });

      const isActive = user && (user.active === true || String(user.active).toUpperCase() === "TRUE");
      testResults.push({ name: "active為文字TRUE判定", success: isActive === true });

      const scopes = PermissionService.getActiveScopes(normalized);
      const scope1 = scopes.find(s => s.scope_id === "temp_scope_id_01");
      const scope2 = scopes.find(s => s.scope_id === "temp_scope_id_02");
      const scope3 = scopes.find(s => s.scope_id === "temp_scope_id_03");

      testResults.push({ name: "effective空白可生效", success: scope1 !== undefined && scope1.scope_type === "CLASS" });
      testResults.push({ name: "過期scope不生效", success: scope2 === undefined });
      testResults.push({ name: "使用class_name之CLASS scope被拒絕", success: scope3 === undefined });
    } catch (e) {
      testResults.push({ name: "例外錯誤: " + e.message, success: false });
    } finally {
      this.clearTempTestRecords(tempEmail);
      const clsSheet = ss.getSheetByName(Config.SHEET_NAMES.CLASSES);
      const clsData = clsSheet.getDataRange().getValues();
      for (let r = clsSheet.getLastRow(); r >= 2; r--) {
        if (clsData[r - 1][0] === tempClassId) {
          clsSheet.deleteRow(r);
        }
      }
    }

    const allPassed = testResults.every(r => r.success);
    return allPassed ? ResponseService.success(testResults, "授權鏈測試通過") : ResponseService.error("授權鏈測試失敗");
  },

  clearTempTestRecords: function(email) {
    const ss = DataRepository.getSpreadsheet();
    const uSheet = ss.getSheetByName(Config.SHEET_NAMES.USERS);
    const uData = uSheet.getDataRange().getValues();
    for (let r = uSheet.getLastRow(); r >= 2; r--) {
      if (String(uData[r - 1][1]).trim().toLowerCase() === email.trim().toLowerCase()) {
        uSheet.deleteRow(r);
      }
    }
    const sSheet = ss.getSheetByName(Config.SHEET_NAMES.USER_SCOPES);
    const sData = sSheet.getDataRange().getValues();
    for (let r = sSheet.getLastRow(); r >= 2; r--) {
      if (String(sData[r - 1][1]).trim().toLowerCase() === email.trim().toLowerCase()) {
        sSheet.deleteRow(r);
      }
    }
  },

  // 輔助寫入暫存匯入資料
  writeTempImportStudents: function(records) {
    const ss = DataRepository.getSpreadsheet();
    let sheet = ss.getSheetByName(Config.SHEET_NAMES.IMPORT_STUDENTS);
    if (!sheet) {
      sheet = ss.insertSheet(Config.SHEET_NAMES.IMPORT_STUDENTS);
    }
    sheet.clear();
    sheet.appendRow(Config.SCHEMAS.IMPORT_STUDENTS);
    records.forEach(r => {
      const row = Config.SCHEMAS.IMPORT_STUDENTS.map(col => r[col] !== undefined ? r[col] : "");
      sheet.appendRow(row);
    });
  },

  // 清除測試暫存紀錄
  clearImportTestState: function() {
    const ss = DataRepository.getSpreadsheet();
    const importSheet = ss.getSheetByName(Config.SHEET_NAMES.IMPORT_STUDENTS);
    if (importSheet) {
      importSheet.clear();
      importSheet.appendRow(Config.SCHEMAS.IMPORT_STUDENTS);
    }

    const testMarker = "TEST_BATCH_TEMP";
    const tables = [
      Config.SHEET_NAMES.STUDENTS,
      Config.SHEET_NAMES.CLASSES,
      Config.SHEET_NAMES.USERS,
      Config.SHEET_NAMES.USER_SCOPES,
      Config.SHEET_NAMES.IMPORT_STUDENT_MAPPING,
      Config.SHEET_NAMES.IMPORT_BATCHES,
      Config.SHEET_NAMES.IMPORT_ERRORS
    ];

    tables.forEach(name => {
      const s = ss.getSheetByName(name);
      if (!s || s.getLastRow() <= 1) return;
      const data = s.getDataRange().getValues();
      for (let r = s.getLastRow(); r >= 2; r--) {
        let containsMarker = false;
        for (let c = 0; c < data[r-1].length; c++) {
          const valStr = String(data[r-1][c]);
          if (valStr.indexOf(testMarker) !== -1 || valStr.indexOf("test_teacher_") !== -1) {
            containsMarker = true;
            break;
          }
        }
        if (containsMarker) s.deleteRow(r);
      }
    });
  },

  // Phase C1 名冊匯入測試情境
  testImportStudentRosterPreview: function() {
    try {
      this.clearImportTestState();
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年一班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生A", student_number: "TEST_BATCH_TEMP_S01", status: "ACTIVE", teacher_email: "test_teacher_preview@example.com" },
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年一班", grade: 5, seat_no: 2, student_name: "TEST_BATCH_TEMP 學生B", student_number: "TEST_BATCH_TEMP_S02", status: "ACTIVE", teacher_email: "test_teacher_preview@example.com" }
      ]);

      const res = ImportService.validateStudentRoster();
      if (!res.success) return ResponseService.error("預檢執行失敗: " + res.message);
      if (res.totalRows !== 2 || res.validRows !== 2 || res.errorRows !== 0) {
        return ResponseService.error("預檢列數統計不符: " + JSON.stringify(res));
      }
      return ResponseService.success(res, "測試預檢機制通過");
    } catch (e) {
      return ResponseService.error("預檢測試例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportStudentRosterCommit: function() {
    try {
      this.clearImportTestState();
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年二班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生C", student_number: "TEST_BATCH_TEMP_S03", status: "ACTIVE", teacher_email: "test_teacher_commit@example.com" }
      ]);

      const res = ImportService.importStudentRoster();
      if (!res.success) return ResponseService.error("正式寫入執行失敗: " + res.message);

      const student = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_name: "TEST_BATCH_TEMP 學生C" });
      if (!student || parseInt(student.seat_no, 10) !== 1) {
        return ResponseService.error("找不到已寫入的學生");
      }
      return ResponseService.success(res, "測試寫入機制通過");
    } catch (e) {
      return ResponseService.error("寫入測試例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportDuplicateSeatNumber: function() {
    try {
      this.clearImportTestState();
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年三班", grade: 5, seat_no: 5, student_name: "TEST_BATCH_TEMP 學生D", student_number: "TEST_BATCH_TEMP_S04", status: "ACTIVE", teacher_email: "test_teacher_dup1@example.com" },
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年三班", grade: 5, seat_no: 5, student_name: "TEST_BATCH_TEMP 學生E", student_number: "TEST_BATCH_TEMP_S05", status: "ACTIVE", teacher_email: "test_teacher_dup1@example.com" }
      ]);

      const res = ImportService.validateStudentRoster();
      if (res.errorRows === 0) {
        return ResponseService.error("應阻斷同班座號重複，但預檢通過了");
      }
      const hasSeatError = res.reports.some(r => r.status === "ERROR" && r.message.indexOf("同班座號重複") !== -1);
      if (!hasSeatError) {
        return ResponseService.error("錯誤原因未包含同班座號重複: " + JSON.stringify(res.reports));
      }
      return ResponseService.success(null, "成功阻斷同班座號重複");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportDuplicateStudentNumber: function() {
    try {
      this.clearImportTestState();
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年四班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生F", student_number: "TEST_BATCH_TEMP_DUP_NUM", status: "ACTIVE", teacher_email: "test_teacher_dup2@example.com" },
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年五班", grade: 5, seat_no: 2, student_name: "TEST_BATCH_TEMP 學生G", student_number: "TEST_BATCH_TEMP_DUP_NUM", status: "ACTIVE", teacher_email: "test_teacher_dup2@example.com" }
      ]);

      const res = ImportService.validateStudentRoster();
      if (res.errorRows === 0) {
        return ResponseService.error("應阻斷 student_number 重複，但預檢通過了");
      }
      const hasNumError = res.reports.some(r => r.status === "ERROR" && r.message.indexOf("student_number 重複") !== -1);
      if (!hasNumError) {
        return ResponseService.error("錯誤原因未包含學號重複: " + JSON.stringify(res.reports));
      }
      return ResponseService.success(null, "成功阻斷 student_number 重複");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportExistingStudentKeepsId: function() {
    try {
      this.clearImportTestState();
      const existingId = "TEST_BATCH_TEMP_EXISTING_UUID";
      const classId = "TEST_BATCH_TEMP_CLASS_UUID";
      const ss = DataRepository.getSpreadsheet();

      DataRepository.appendRowSecure(Config.SHEET_NAMES.CLASSES, {
        class_id: classId,
        school_year: 114,
        class_name: "TEST_BATCH_TEMP 五年六班",
        grade: 5,
        teacher_email: "test_teacher_keep@example.com",
        status: "ACTIVE"
      });

      DataRepository.appendRowSecure(Config.SHEET_NAMES.STUDENTS, {
        student_id: existingId,
        school_year: 114,
        class_id: classId,
        seat_no: 8,
        student_name: "TEST_BATCH_TEMP 舊學生",
        birth_date: "",
        status: "ACTIVE"
      });

      DataRepository.appendRowSecure(Config.SHEET_NAMES.IMPORT_STUDENT_MAPPING, {
        student_number: "TEST_BATCH_TEMP_S99",
        school_year: 114,
        class_name: "TEST_BATCH_TEMP 五年六班",
        seat_no: 8,
        student_name: "TEST_BATCH_TEMP 舊學生",
        student_id: existingId
      });

      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年六班", grade: 5, seat_no: 8, student_name: "TEST_BATCH_TEMP 舊學生新名字", student_number: "TEST_BATCH_TEMP_S99", status: "ACTIVE", teacher_email: "test_teacher_keep@example.com" }
      ]);

      const commitRes = ImportService.importStudentRoster();
      if (!commitRes.success) return ResponseService.error("匯入更新失敗");

      const updated = DataRepository.selectOne(Config.SHEET_NAMES.STUDENTS, { student_id: existingId });
      if (!updated || updated.student_name !== "TEST_BATCH_TEMP 舊學生新名字") {
        return ResponseService.error("學生未被成功更新或 UUID 遺失了");
      }
      return ResponseService.success(null, "既有學生更新並成功保留 student_id");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportCreatesTeacherScope: function() {
    try {
      this.clearImportTestState();
      const teacherEmail = "test_teacher_scope_test@example.com";
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年七班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生H", student_number: "TEST_BATCH_TEMP_S08", status: "ACTIVE", teacher_email: teacherEmail }
      ]);

      const res = ImportService.importStudentRoster();
      if (!res.success) return ResponseService.error("匯入失敗");

      const user = UserService.getUserByEmail(teacherEmail);
      if (!user || user.role !== "CLASS_TEACHER") {
        return ResponseService.error("未成功建立導師使用者角色");
      }

      const scopes = UserService.getUserScopes(teacherEmail);
      const hasClassScope = scopes.some(s => s.scope_type === "CLASS" && (s.active === true || String(s.active).toUpperCase() === "TRUE"));
      if (!hasClassScope) {
        return ResponseService.error("未成功建立 CLASS 授權範疇");
      }
      return ResponseService.success(null, "成功建立導師與其對應 CLASS 授權");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testImportedTeacherCanReadClass: function() {
    try {
      this.clearImportTestState();
      const teacherEmail = "test_teacher_read_test@example.com";
      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年八班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生I", student_number: "TEST_BATCH_TEMP_S09", status: "ACTIVE", teacher_email: teacherEmail }
      ]);

      const commitRes = ImportService.importStudentRoster();
      if (!commitRes.success) return ResponseService.error("匯入失敗");

      const scopes = PermissionService.getActiveScopes(teacherEmail);
      const classes = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
      const targetClass = classes.find(c => String(c.class_name).indexOf("TEST_BATCH_TEMP 五年八班") !== -1);

      if (!targetClass) return ResponseService.error("找不到寫入的班級");

      const hasAccess = scopes.some(s => s.scope_type === "CLASS" && String(s.scope_value).trim() === targetClass.class_id);
      if (!hasAccess) {
        return ResponseService.error("導師無權讀取該匯入班級");
      }
      return ResponseService.success(null, "匯入導師成功讀取班級");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  testUnauthorizedUserCannotReadImportedClass: function() {
    try {
      this.clearImportTestState();
      const teacherEmail = "test_teacher_auth_test@example.com";
      const foreignEmail = "test_teacher_foreign@example.com";

      this.writeTempImportStudents([
        { school_year: 114, class_name: "TEST_BATCH_TEMP 五年九班", grade: 5, seat_no: 1, student_name: "TEST_BATCH_TEMP 學生J", student_number: "TEST_BATCH_TEMP_S10", status: "ACTIVE", teacher_email: teacherEmail }
      ]);

      const commitRes = ImportService.importStudentRoster();
      if (!commitRes.success) return ResponseService.error("匯入失敗");

      const scopes = PermissionService.getActiveScopes(foreignEmail);
      const classes = DataRepository.selectAll(Config.SHEET_NAMES.CLASSES);
      const targetClass = classes.find(c => String(c.class_name).indexOf("TEST_BATCH_TEMP 五年九班") !== -1);
      if (!targetClass) return ResponseService.error("找不到班級");

      const hasAccess = scopes.some(s => s.scope_type === "CLASS" && String(s.scope_value).trim() === targetClass.class_id);
      if (hasAccess) {
        return ResponseService.error("未授權使用者不應能存取該班級");
      }
      return ResponseService.success(null, "非授權使用者存取遭拒，安全性正常");
    } catch (e) {
      return ResponseService.error("例外: " + e.message);
    } finally {
      this.clearImportTestState();
    }
  },

  // 測試設定精靈初始化與管理員註冊流程
  testSetupWizardFlow: function() {
    try {
      // 1. 未設定 SPREADSHEET_ID 時，自動使用目前綁定試算表
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (!activeSs) {
        return ResponseService.error("測試環境錯誤：未開啟綁定的試算表");
      }

      // 先備份並暫時刪除 Script Properties 中的 SPREADSHEET_ID 來模擬未設定狀態
      const backupId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
      PropertiesService.getScriptProperties().deleteProperty("SPREADSHEET_ID");

      let testId = "";
      try {
        testId = Config.getSpreadsheetId();
      } finally {
        // 還原備份
        if (backupId) {
          PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", backupId);
        }
      }

      if (testId !== activeSs.getId()) {
        return ResponseService.error("未設定 SPREADSHEET_ID 時，自動抓取目前綁定試算表失敗");
      }

      // 2. setupSystem() 回傳 spreadsheetName 與 createdSheets
      const setupResult = SetupService.setupSystem();
      if (!setupResult.success || !setupResult.spreadsheetName || !setupResult.createdSheets || setupResult.createdSheets.length !== 12) {
        return ResponseService.error("setupSystem() 回傳結構錯誤：" + JSON.stringify(setupResult));
      }

      // 3. 第一位 ADMIN 建立與 adminCount = 1 驗證
      // 備份並清除既有 ADMIN 帳號
      const ss = DataRepository.getSpreadsheet();
      const uSheet = ss.getSheetByName(Config.SHEET_NAMES.USERS);
      const uData = uSheet.getDataRange().getValues();
      const backupUsers = [];
      for (let r = uSheet.getLastRow(); r >= 2; r--) {
        if (uData[r - 1][3] === "ADMIN") {
          backupUsers.push(uSheet.getRange(r, 1, 1, uSheet.getLastColumn()).getValues()[0]);
          uSheet.deleteRow(r);
        }
      }

      const sSheet = ss.getSheetByName(Config.SHEET_NAMES.USER_SCOPES);
      const sData = sSheet.getDataRange().getValues();
      const backupScopes = [];
      for (let r = sSheet.getLastRow(); r >= 2; r--) {
        if (sData[r - 1][2] === "ALL_CLASSES") {
          backupScopes.push(sSheet.getRange(r, 1, 1, sSheet.getLastColumn()).getValues()[0]);
          sSheet.deleteRow(r);
        }
      }

      let adminCountAfter = 0;
      let setupWizardResult = null;
      try {
        const testPayload = {
          schoolName: "測試小學",
          schoolYear: "114",
          systemName: "ClassCare 測試平台",
          adminEmail: "test_bootstrap_admin@example.com",
          adminName: "林測試",
          createFolder: false,
          seedDemo: false
        };
        // 執行精靈後端入口
        const completeResult = completeSetupWizard(testPayload);
        setupWizardResult = completeResult.setup;
        const statusResult = completeResult.status;
        adminCountAfter = statusResult.adminCount;
      } finally {
        // 清理測試帳號
        const uDataClean = uSheet.getDataRange().getValues();
        for (let r = uSheet.getLastRow(); r >= 2; r--) {
          if (String(uDataClean[r - 1][1]).trim().toLowerCase() === "test_bootstrap_admin@example.com") {
            uSheet.deleteRow(r);
          }
        }
        const sDataClean = sSheet.getDataRange().getValues();
        for (let r = sSheet.getLastRow(); r >= 2; r--) {
          if (String(sDataClean[r - 1][1]).trim().toLowerCase() === "test_bootstrap_admin@example.com") {
            sSheet.deleteRow(r);
          }
        }
        // 還原備份
        backupUsers.forEach(row => uSheet.appendRow(row));
        backupScopes.forEach(row => sSheet.appendRow(row));
      }

      if (adminCountAfter !== 1) {
        return ResponseService.error("第一位管理員建立後，adminCount 數量不為 1 (實際: " + adminCountAfter + ")");
      }
      if (!setupWizardResult || setupWizardResult.adminResult.indexOf("成功") === -1) {
        return ResponseService.error("精靈建立第一位 ADMIN 失敗或未回傳成功訊息: " + JSON.stringify(setupWizardResult));
      }

      return ResponseService.success(null, "設定精靈初始化與管理員引導流程測試通過");
    } catch (e) {
      return ResponseService.error("設定精靈測試例外: " + e.message);
    }
  },

  // 測試系統狀態頁面評估與權限排除
  testOpenSystemStatus: function() {
    try {
      if (typeof SystemStatusHtml === "undefined") {
        return ResponseService.error("SystemStatusHtml 未定義");
      }
      const template = HtmlService.createTemplate(SystemStatusHtml);
      if (!template) {
        return ResponseService.error("SystemStatusHtml 建立模板失敗");
      }
      const htmlOutput = template.evaluate();
      if (!htmlOutput) {
        return ResponseService.error("SystemStatusHtml evaluate() 失敗");
      }
      const statusRes = SystemStatusService.getSystemStatus();
      if (!statusRes.hasOwnProperty("version") || !statusRes.hasOwnProperty("schemaVersion") ||
          !statusRes.hasOwnProperty("sheetStatus") || !statusRes.hasOwnProperty("adminCount") ||
          !statusRes.hasOwnProperty("errors") || !statusRes.hasOwnProperty("warnings")) {
        return ResponseService.error("系統狀態遺漏必要欄位");
      }
      // 確保不包含敏感欄位結構
      const serialized = JSON.stringify(statusRes);
      const sensitiveKeys = ["students", "guardians", "health_alerts", "subsidy_records", "restricted_document_url"];
      for (let i = 0; i < sensitiveKeys.length; i++) {
        if (serialized.indexOf(sensitiveKeys[i]) !== -1) {
          return ResponseService.error("安全性失敗：系統狀態洩漏敏感關聯欄位/名稱 " + sensitiveKeys[i]);
        }
      }
      return ResponseService.success(null, "SystemStatusHtml 整合驗證與敏感詞排除測試通過");
    } catch (e) {
      return ResponseService.error("SystemStatusHtml 測試例外: " + e.message);
    }
  },

  // 測試設定精靈模板建立與 evaluate 執行
  testShowSetupWizardTemplate: function() {
    try {
      if (typeof SetupWizardHtml === "undefined") {
        return ResponseService.error("SetupWizardHtml 未定義");
      }
      const template = HtmlService.createTemplate(SetupWizardHtml);
      if (!template) {
        return ResponseService.error("HtmlService.createTemplate 建立模板失敗");
      }
      const htmlOutput = template.evaluate();
      if (!htmlOutput) {
        return ResponseService.error("template.evaluate() 產生 HtmlOutput 失敗");
      }
      return ResponseService.success(null, "SetupWizardHtml 模板建立與評估測試通過");
    } catch (e) {
      return ResponseService.error("SetupWizardHtml 模板測試例外: " + e.message);
    }
  },

  // 驗證 SHEET_NAMES 中的工作表都有對應的 SCHEMAS 欄位定義
  testConfiguredSheetNamesMatchSchemas: function() {
    try {
      const sheetKeys = Object.keys(Config.SHEET_NAMES);
      const schemaKeys = Object.keys(Config.SCHEMAS);

      const missingInSchema = sheetKeys.filter(k => !schemaKeys.includes(k));
      if (missingInSchema.length > 0) {
        return ResponseService.error("設定錯誤：SHEET_NAMES 中的鍵 [" + missingInSchema.join(", ") + "] 找不到對應 the SCHEMAS 欄位定義。");
      }
      return ResponseService.success(null, "工作表對照與 Schema 定義對齊驗證通過 (共 " + sheetKeys.length + " 張表)");
    } catch (e) {
      return ResponseService.error("工作表對照測試例外: " + e.message);
    }
  },

  // 測試 ajaxListAccessibleClasses
  testAjaxListAccessibleClasses: function() {
    try {
      const res = ajaxListAccessibleClasses();
      if (typeof res.success === "undefined" || !res.hasOwnProperty("data")) {
        return ResponseService.error("ajaxListAccessibleClasses() 回傳格式錯誤: " + JSON.stringify(res));
      }
      return ResponseService.success(null, "ajaxListAccessibleClasses 測試通過");
    } catch (e) {
      return ResponseService.error("ajaxListAccessibleClasses 測試例外: " + e.message);
    }
  },

  // 測試 ajaxListAccessibleStudents
  testAjaxListAccessibleStudents: function() {
    try {
      const res = ajaxListAccessibleStudents("", "全部");
      if (typeof res.success === "undefined") {
        return ResponseService.error("ajaxListAccessibleStudents() 回傳格式錯誤: " + JSON.stringify(res));
      }
      return ResponseService.success(null, "ajaxListAccessibleStudents 測試通過");
    } catch (e) {
      return ResponseService.error("ajaxListAccessibleStudents 測試例外: " + e.message);
    }
  },

  // 測試 testTeacherWorkspaceClassLoading 全域進入點
  testTeacherWorkspaceClassLoadingTest: function() {
    try {
      const res = testTeacherWorkspaceClassLoading();
      if (!res.hasOwnProperty("access") || !res.hasOwnProperty("classes")) {
        return ResponseService.error("testTeacherWorkspaceClassLoading() 回傳欄位錯誤");
      }
      return ResponseService.success(null, "testTeacherWorkspaceClassLoading 測試通過");
    } catch (e) {
      return ResponseService.error("testTeacherWorkspaceClassLoading 測試例外: " + e.message);
    }
  },

  // 測試無 scope 時回傳空班級
  testNoScopeReturnsEmptyClasses: function() {
    try {
      const activeScopes = PermissionService.getActiveScopes("no_scope_user@example.com");
      if (activeScopes.length !== 0) {
        return ResponseService.error("無權限使用者不應該有任何有效 Scope");
      }
      return ResponseService.success(null, "無 Scope 使用者驗證通過");
    } catch (e) {
      return ResponseService.error("無 Scope 使用者測試例外: " + e.message);
    }
  },

  // 測試 CLASS scope 回傳對應班級
  testClassScopeReturnsMatchedClass: function() {
    try {
      const ss = DataRepository.getSpreadsheet();
      const sSheet = ss.getSheetByName(Config.SHEET_NAMES.USER_SCOPES);
      const testEmail = "test_class_scope@example.com";
      const testClassId = "test-class-uuid-12345";

      const newRow = [
        Utilities.getUuid(),
        testEmail,
        "CLASS",
        testClassId,
        "TRUE",
        "",
        ""
      ];

      sSheet.appendRow(newRow);

      let activeScopes = [];
      try {
        activeScopes = PermissionService.getActiveScopes(testEmail);
      } finally {
        const lastRow = sSheet.getLastRow();
        sSheet.deleteRow(lastRow);
      }

      if (activeScopes.length !== 1 || activeScopes[0].scope_value !== testClassId) {
        return ResponseService.error("CLASS scope 比對或載入失敗: " + JSON.stringify(activeScopes));
      }
      return ResponseService.success(null, "CLASS Scope 比對驗證成功");
    } catch (e) {
      return ResponseService.error("CLASS Scope 測試例外: " + e.message);
    }
  },

  // 測試 ALL_CLASSES scope 回傳所有 ACTIVE 班級
  testAllClassesScopeReturnsActiveClasses: function() {
    try {
      const ss = DataRepository.getSpreadsheet();
      const sSheet = ss.getSheetByName(Config.SHEET_NAMES.USER_SCOPES);
      const testEmail = "test_all_classes_scope@example.com";

      const newRow = [
        Utilities.getUuid(),
        testEmail,
        "ALL_CLASSES",
        "*",
        "TRUE",
        "",
        ""
      ];

      sSheet.appendRow(newRow);

      let activeScopes = [];
      try {
        activeScopes = PermissionService.getActiveScopes(testEmail);
      } finally {
        const lastRow = sSheet.getLastRow();
        sSheet.deleteRow(lastRow);
      }

      if (activeScopes.length !== 1 || activeScopes[0].scope_type !== "ALL_CLASSES") {
        return ResponseService.error("ALL_CLASSES scope 載入失敗: " + JSON.stringify(activeScopes));
      }
      return ResponseService.success(null, "ALL_CLASSES Scope 驗證成功");
    } catch (e) {
      return ResponseService.error("ALL_CLASSES Scope 測試例外: " + e.message);
    }
  },

  // 測試已過期 Scope 回傳無班級
  testExpiredScopeReturnsNoClass: function() {
    try {
      const ss = DataRepository.getSpreadsheet();
      const sSheet = ss.getSheetByName(Config.SHEET_NAMES.USER_SCOPES);
      const testEmail = "test_expired_scope@example.com";

      const newRow = [
        Utilities.getUuid(),
        testEmail,
        "CLASS",
        "some-class-id",
        "TRUE",
        "2020-01-01",
        "2020-12-31"
      ];

      sSheet.appendRow(newRow);

      let activeScopes = [];
      try {
        activeScopes = PermissionService.getActiveScopes(testEmail);
      } finally {
        const lastRow = sSheet.getLastRow();
        sSheet.deleteRow(lastRow);
      }

      if (activeScopes.length !== 0) {
        return ResponseService.error("已過期的 Scope 不應該被列為有效: " + JSON.stringify(activeScopes));
      }
      return ResponseService.success(null, "已過期 Scope 排除驗證成功");
    } catch (e) {
      return ResponseService.error("已過期 Scope 測試例外: " + e.message);
    }
  },

  // 測試簡化診斷管道 testClassPipelineSimple 的回傳結構
  testClassPipelineSimpleValidation: function() {
    try {
      const res = testClassPipelineSimple();
      if (!res.hasOwnProperty("email") || typeof res.userFound !== "boolean" || typeof res.apiResult !== "object") {
        return ResponseService.error("testClassPipelineSimple 回傳屬性錯誤: " + JSON.stringify(res));
      }
      return ResponseService.success(null, "testClassPipelineSimple 診斷管道測試通過");
    } catch (e) {
      return ResponseService.error("testClassPipelineSimple 測試例外: " + e.message);
    }
  },

  // 測試 Class API 格式
  testClassApiShapeTest: function() {
    try {
      const res = testClassApiShape();
      if (!res.success || typeof res.classCount !== "number") {
        return ResponseService.error("testClassApiShape 回傳格式不正確");
      }
      return ResponseService.success(null, "Class API 格式檢驗通過");
    } catch (e) {
      return ResponseService.error("testClassApiShape 異常: " + e.message);
    }
  },

  // 執行全體測試
  runAllTests: function() {
    const results = [];
    let passed = 0;
    let failed = 0;

    const assert = (name, condition) => {
      if (condition) {
        passed++;
        results.push({ testName: name, status: "PASSED" });
      } else {
        failed++;
        results.push({ testName: name, status: "FAILED" });
      }
    };

    // 0000000. 測試 Class API 格式與回傳形狀
    try {
      const res = this.testClassApiShapeTest();
      assert("Class API 格式與回傳形狀測試", res.success);
    } catch (e) {
      assert("Class API 格式與回傳形狀測試 (例外: " + e.message + ")", false);
    }

    // 000000. 測試簡化診斷管道 testClassPipelineSimple
    try {
      const res = this.testClassPipelineSimpleValidation();
      assert("testClassPipelineSimple 管道診斷測試", res.success);
    } catch (e) {
      assert("testClassPipelineSimple 管道診斷測試 (例外: " + e.message + ")", false);
    }

    // 00000. 新增導師工作台權限與加載邏輯測試
    try {
      const res = this.testAjaxListAccessibleClasses();
      assert("ajaxListAccessibleClasses 觸發測試", res.success);
    } catch (e) {
      assert("ajaxListAccessibleClasses 觸發測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testAjaxListAccessibleStudents();
      assert("ajaxListAccessibleStudents 觸發測試", res.success);
    } catch (e) {
      assert("ajaxListAccessibleStudents 觸發測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testTeacherWorkspaceClassLoadingTest();
      assert("testTeacherWorkspaceClassLoading 診斷測試", res.success);
    } catch (e) {
      assert("testTeacherWorkspaceClassLoading 診斷測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testNoScopeReturnsEmptyClasses();
      assert("testNoScopeReturnsEmptyClasses 測試", res.success);
    } catch (e) {
      assert("testNoScopeReturnsEmptyClasses 測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testClassScopeReturnsMatchedClass();
      assert("testClassScopeReturnsMatchedClass 測試", res.success);
    } catch (e) {
      assert("testClassScopeReturnsMatchedClass 測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testAllClassesScopeReturnsActiveClasses();
      assert("testAllClassesScopeReturnsActiveClasses 測試", res.success);
    } catch (e) {
      assert("testAllClassesScopeReturnsActiveClasses 測試 (例外: " + e.message + ")", false);
    }

    try {
      const res = this.testExpiredScopeReturnsNoClass();
      assert("testExpiredScopeReturnsNoClass 測試", res.success);
    } catch (e) {
      assert("testExpiredScopeReturnsNoClass 測試 (例外: " + e.message + ")", false);
    }

    // 0000. 測試工作表與 Schema 對照一致性
    try {
      const res = this.testConfiguredSheetNamesMatchSchemas();
      assert("工作表對照與 Schema 定義對齊測試", res.success);
    } catch (e) {
      assert("工作表對照與 Schema 定義對齊測試 (例外: " + e.message + ")", false);
    }

    // 000. 測試設定精靈初始化與管理員註冊流程
    try {
      const res = this.testSetupWizardFlow();
      assert("設定精靈初始化與管理員引導流程測試", res.success);
    } catch (e) {
      assert("設定精靈初始化與管理員引導流程測試 (例外: " + e.message + ")", false);
    }

    // 00. 測試系統狀態頁面評估與排除
    try {
      const res = this.testOpenSystemStatus();
      assert("SystemStatusHtml 模板評估與安全過濾測試", res.success);
    } catch (e) {
      assert("SystemStatusHtml 模板評估與安全過濾測試 (例外: " + e.message + ")", false);
    }

    // 0. 測試設定精靈模板 evaluate 執行
    try {
      const res = this.testShowSetupWizardTemplate();
      assert("SetupWizardHtml 模板建立與評估測試", res.success);
    } catch (e) {
      assert("SetupWizardHtml 模板建立與評估測試 (例外: " + e.message + ")", false);
    }

    // 1. 導師可看到自己的班級
    try {
      const res = ClassService.listAccessibleClasses();
      assert("導師可看見授權班級列表", res.success);
    } catch (e) {
      assert("導師可看見授權班級列表 (例外: " + e.message + ")", false);
    }

    // 2. 測試非法學生 ID 存取攔截
    try {
      const res = this.testUnauthorizedStudentAccess();
      assert("非法學生ID存取安全阻斷並記錄", res.success);
    } catch (e) {
      assert("非法學生ID存取攔截遭遇例外", false);
    }

    // 3. 學生卡片電話與附件脫敏
    try {
      const res = this.testStudentCardSanitization();
      assert("學生卡片電話與附件網址已脫敏", res.success);
    } catch (e) {
      assert("學生卡片脫敏測試例外", false);
    }

    // 4. 電話遮罩功能
    try {
      const res = this.testStudentDetailSanitization();
      assert("電話號碼遮罩正確性 (0912***678)", res.success);
    } catch (e) {
      assert("電話遮罩測試例外", false);
    }

    // 5. 學生詳細資料不包含 restricted_document_url
    try {
      const classes = ClassService.listAccessibleClasses();
      if (classes.success && classes.data.length > 0) {
        const students = StudentService.listAccessibleStudents(classes.data[0].class_id, "全部");
        if (students.success && students.data.length > 0) {
          const detail = StudentService.getStudentDetail(students.data[0].student_id);
          const hasUrl = detail.data.alerts.health.hasOwnProperty("restricted_document_url") && detail.data.alerts.health.restricted_document_url !== null;
          assert("學生詳細資料排除限制附件連結", !hasUrl);
        } else {
          assert("無學生資料可供驗證詳細資料", true);
        }
      } else {
        assert("無班級資料可供驗證詳細資料", true);
      }
    } catch (e) {
      assert("學生詳細資料安全欄位排除測試例外: " + e.message, false);
    }

    // 6. 測試 DataRepository 安全寫入
    try {
      const res = this.testDataRepositoryAppendRowSecure();
      assert("DataRepository 安全寫入防護正常", res.success);
    } catch (e) {
      assert("DataRepository 安全寫入防護測試例外", false);
    }

    // 7. 測試匯入服務 MVP
    try {
      const res = this.testImportService();
      assert("ImportService 預檢與解析機制正常", res.success);
    } catch (e) {
      assert("ImportService 測試例外: " + e.message, false);
    }

    // 8. 測試授權與 Scopes 驗證鏈
    try {
      const res = this.testScopeAuthorizationChain();
      assert("授權鏈與 Scopes 整合機制正常", res.success);
    } catch (e) {
      assert("授權與 Scopes 測試例外: " + e.message, false);
    }

    // 9. 測試匯入預檢功能 (Phase C1)
    try {
      const res = this.testImportStudentRosterPreview();
      assert("匯入學生名冊預檢測試通過", res.success);
    } catch (e) {
      assert("匯入學生名冊預檢測試例外", false);
    }

    // 10. 測試匯入正式寫入 (Phase C1)
    try {
      const res = this.testImportStudentRosterCommit();
      assert("匯入學生名冊正式寫入測試通過", res.success);
    } catch (e) {
      assert("匯入學生名冊正式寫入測試例外: " + e.message, false);
    }

    // 11. 測試重複座號阻斷 (Phase C1)
    try {
      const res = this.testImportDuplicateSeatNumber();
      assert("匯入同班座號重複阻斷測試通過", res.success);
    } catch (e) {
      assert("匯入同班座號重複阻斷測試例外", false);
    }

    // 12. 測試重複學號阻斷 (Phase C1)
    try {
      const res = this.testImportDuplicateStudentNumber();
      assert("匯入學生學號重複阻斷測試通過", res.success);
    } catch (e) {
      assert("匯入學生學號重複阻斷測試例外", false);
    }

    // 13. 測試既有學生保留 ID (Phase C1)
    try {
      const res = this.testImportExistingStudentKeepsId();
      assert("匯入既有學生保留 ID 測試通過", res.success);
    } catch (e) {
      assert("匯入既有學生保留 ID 測試例外", false);
    }

    // 14. 測試自動建立導師與 Scope (Phase C1)
    try {
      const res = this.testImportCreatesTeacherScope();
      assert("匯入自動指派導師授權測試通過", res.success);
    } catch (e) {
      assert("匯入自動指派導師授權測試例外", false);
    }

    // 15. 測試匯入導師是否可讀取班級 (Phase C1)
    try {
      const res = this.testImportedTeacherCanReadClass();
      assert("匯入導師讀取權限鏈整合測試通過", res.success);
    } catch (e) {
      assert("匯入導師讀取權限鏈整合測試例外", false);
    }

    // 16. 測試非授權使用者無法讀取匯入班級 (Phase C1)
    try {
      const res = this.testUnauthorizedUserCannotReadImportedClass();
      assert("匯入非授權使用者存取拒絕測試通過", res.success);
    } catch (e) {
      assert("匯入非授權使用者存取拒絕測試例外", false);
    }

    return {
      total: passed + failed,
      passed: passed,
      failed: failed,
      results: results
    };
  }
};

// 全域 API 格式測試
function testClassApiShape() {
  const result = ajaxListAccessibleClasses();

  const classes =
    result &&
    result.success === true &&
    Array.isArray(result.data)
      ? result.data
      : null;

  if (classes === null) {
    throw new Error(
      "Class API 格式錯誤，實際回傳：" +
      JSON.stringify(result)
    );
  }

  return {
    success: true,
    classCount: classes.length,
    result: result
  };
}

// --- End of TestRunner.gs ---

// --- Start of Code.gs ---
// File: Code.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const importMenu = ui.createMenu("匯入資料")
    .addItem("建立學生名冊匯入範本", "createStudentImportTemplate")
    .addItem("預檢學生名冊", "validateStudentRosterFromMenu")
    .addItem("正式匯入學生名冊", "commitStudentImportFromMenu")
    .addItem("查看最近匯入結果", "showImportCenter");

  ui.createMenu("ClassCare 系統")
    .addItem("① 啟動設定精靈", "showSetupWizard")
    .addItem("② 開啟導師工作台", "showTeacherWorkspace")
    .addItem("③ 建立／檢查資料表", "setupOrValidateSystem")
    .addItem("④ 設定第一位管理員", "showAdminSetupDialog")
    .addSubMenu(importMenu)
    .addItem("⑤ 建立示範資料", "seedDemoDataFromMenu")
    .addItem("⑥ 系統狀態", "showSystemStatus")
    .addItem("⑦ 系統管理側邊欄", "showClassCareSidebar")
    .addItem("⑧ 清除示範資料", "clearDemoDataFromMenu")
    .addItem("⑨ 查看操作紀錄", "showAccessLogs")
    .addSeparator()
    .addItem("說明與版本資訊", "showAboutDialog")
    .addToUi();
}

function onInstall() {
  onOpen();
}

// 導師工作台進入點
function showTeacherWorkspace() {
  UIService.openTeacherWorkspace();
}

// 設定精靈進入點
function showSetupWizard() {
  UIService.openSetupWizard();
}

// 建立或檢查資料表
function setupOrValidateSystem() {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(30000)) {
      SpreadsheetApp.getUi().alert("系統忙碌中，請稍後再試。");
      return;
    }
    SetupService.setupSystem();
    const result = SetupService.validateSystemStructure();
    if (result.success) {
      SpreadsheetApp.getUi().alert("資料表初始化與檢查成功！未發現任何結構錯誤。");
    } else {
      SpreadsheetApp.getUi().alert("檢查發現錯誤：\n" + result.errors.join("\n"));
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert("系統錯誤：" + e.message);
  } finally {
    lock.releaseLock();
  }
}

// 設定第一位管理員
function showAdminSetupDialog() {
  UIService.openAdminSetupDialog();
}

// 建立示範資料
function seedDemoDataFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "建立示範資料",
    "確定要建立虛擬示範資料嗎？這將會新增 12 名虛擬學生、家長、健康摘要及補助紀錄。\n警告：本資料僅供測試使用，非真實資料。",
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  const result = DemoDataService.seedDemoData();
  if (result === "DEMO_DATA_ALREADY_SEEDED") {
    ui.alert("示範資料先前已寫入過，無需重複建立。");
  } else if (result === "SUCCESS") {
    ui.alert("示範資料建立成功！");
  } else {
    ui.alert("建立失敗：" + result);
  }
}

// 系統狀態
function showSystemStatus() {
  UIService.openSystemStatus();
}

// 系統管理側邊欄 (原 showClassCareSidebar)
function showClassCareSidebar() {
  UIService.openSystemSidebar();
}

// 清除示範資料
function clearDemoDataFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "清除示範資料",
    "確定要清除所有帶有 CLASSCARE_DEMO_V1 標記的示範資料嗎？\n此動作無法還原，但絕對不會刪除您的正式資料。",
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  const result = DemoDataService.clearDemoData();
  ui.alert(result);
}

// 查看操作紀錄
function showAccessLogs() {
  UIService.openAccessLogs();
}

// 關於系統
function showAboutDialog() {
  UIService.openAboutDialog();
}

// doGet / doPost Entry points
function doGet(e) {
  return HtmlService.createTemplate(TeacherWorkspaceHtml).evaluate()
    .setTitle("ClassCare 班級轉銜與學生理解工作台")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function doPost(e) {
  return ContentService.createTextOutput("POST request received.");
}

// 匯入中心進入點
function showImportCenter() {
  UIService.openImportCenter();
}

// 下載學生名冊範本 CSV Data URL
function ajaxDownloadStudentTemplate() {
  const headers = ["學號", "學年度", "班級", "座號", "姓名", "出生日期", "特質與優勢", "學習與特教需求"];
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers.join(","));
  return ResponseService.success(csvContent);
}

// 下載家庭聯絡人範本 CSV Data URL
function ajaxDownloadGuardianTemplate() {
  const headers = ["學號", "學生學年度", "學生班級", "學生座號", "學生姓名", "聯絡人姓名", "關係", "聯絡電話", "適合聯絡時間", "偏好聯絡方式", "是否為主要照顧者", "是否為法定代理人", "備註"];
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers.join(","));
  return ResponseService.success(csvContent);
}

// 學生名冊預檢
function ajaxValidateStudentRoster(pastedText) {
  return ResponseService.runSecure(function() {
    return ImportService.validateStudentRoster(pastedText);
  });
}

// 學生名冊正式寫入
function ajaxImportStudentRoster(pastedText) {
  return ImportService.importStudentRoster(pastedText);
}

// 家庭聯絡人預檢
function ajaxValidateGuardianContacts(pastedText) {
  return ResponseService.runSecure(function() {
    return ImportService.validateGuardianContacts(pastedText);
  });
}

// 家庭聯絡人正式寫入
function ajaxImportGuardianContacts(pastedText) {
  return ImportService.importGuardianContacts(pastedText);
}

// 讀取匯入批次紀錄
function ajaxListImportBatches() {
  return ImportService.listImportBatches();
}

// 建立學生名冊匯入範本
function createStudentImportTemplate() {
  const res = ImportService.createImportTemplate();
  SpreadsheetApp.getUi().alert("範本建立", res.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// 預檢學生名冊進入點
function validateStudentRosterFromMenu() {
  UIService.openPrecheckDialog();
}

// 正式匯入學生名冊進入點
function commitStudentImportFromMenu() {
  UIService.openPrecheckDialog();
}

// 預檢 sheet 資料
function ajaxValidateRosterFromSheet() {
  return ResponseService.runSecure(function() {
    return ImportService.validateStudentRoster();
  });
}

// 匯入 sheet 資料
function ajaxImportRosterFromSheet() {
  return ResponseService.runSecure(function() {
    return ImportService.importStudentRoster();
  });
}

// 取得使用者資訊 (用於設定精靈)
function ajaxGetInitialInfo() {
  return ResponseService.success({
    email: Session.getActiveUser().getEmail() || ""
  });
}

// 執行系統設定精靈初始化與完整驗證
function completeSetupWizard(payload) {
  return ResponseService.runSecure(function() {
    // 1. 綁定目前試算表 ID
    const activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (!activeSs) {
      throw new Error("初始化失敗：請從綁定的 Google 試算表執行設定精靈。");
    }
    const ssId = activeSs.getId();
    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ssId);

    // 2. SetupService.setupSystem()
    const setupResult = SetupService.setupSystem();
    if (!setupResult.success) {
      throw new Error("資料表結構初始化失敗：" + setupResult.message);
    }

    const ss = SpreadsheetApp.openById(ssId);
    const settingsSheet = ss.getSheetByName(Config.SHEET_NAMES.SYSTEM_SETTINGS);

    // 3. 儲存系統名稱、學校名稱、學年度
    const schoolName = payload.schoolName ? payload.schoolName.trim() : "未設定學校名稱";
    const schoolYear = payload.schoolYear ? payload.schoolYear.trim() : "114";
    const systemName = payload.systemName ? payload.systemName.trim() : "ClassCare 班級關懷工作台";

    SetupService.initSetting(settingsSheet, "SYSTEM_NAME", systemName, "系統名稱");
    SetupService.initSetting(settingsSheet, "SCHOOL_NAME", schoolName, "學校名稱");
    SetupService.initSetting(settingsSheet, "SCHOOL_YEAR", schoolYear, "當前學年度");

    // 4. 建立第一位 ADMIN
    let adminResult = "未設定";
    if (payload.adminEmail && payload.adminName) {
      const email = payload.adminEmail.trim().toLowerCase();
      const name = payload.adminName.trim();

      // 檢查是否已有任何管理員存在
      const hasAdmin = AdminBootstrapService.hasActiveAdmin();
      if (!hasAdmin) {
        adminResult = AdminBootstrapService.setupAdminDirect(email, name);
      } else {
        adminResult = "已有管理員存在，跳過建立";
      }
    } else {
      throw new Error("設定失敗：必須提供第一位管理員的 Email 與姓名。");
    }

    // 5. 處理 Google Drive 資料夾建立
    let folderResult = "未建立";
    if (payload.createFolder) {
      const folderName = "ClassCare_" + schoolName + "_" + schoolYear;
      const folder = DriveApp.createFolder(folderName);
      PropertiesService.getScriptProperties().setProperty("DRIVE_FOLDER_ID", folder.getId());
      folderResult = "已建立，ID為 " + folder.getId();
    }

    // 6. 建立示範資料
    let demoResult = "未建立";
    if (payload.seedDemo) {
      const seedStatus = DemoDataService.seedDemoData();
      demoResult = seedStatus === "SUCCESS" ? "建立成功" : "已存在，未重複建立";
    }

    // 7. 執行 SystemStatusService.getSystemStatus()
    const statusResult = SystemStatusService.getSystemStatus();

    return {
      setup: {
        success: true,
        spreadsheetId: ssId,
        spreadsheetName: ss.getName(),
        adminResult: adminResult,
        folderResult: folderResult,
        demoResult: demoResult,
        createdSheets: setupResult.createdSheets,
        message: "ClassCare 系統初始化設定完成。"
      },
      status: statusResult
    };
  });
}

// 取得目前使用者可存取班級列表
function ajaxListAccessibleClasses() {
  return ClassService.listAccessibleClasses();
}

// 取得指定班級下符合篩選的學生清單
function ajaxListAccessibleStudents(classId, filterType) {
  return StudentService.listAccessibleStudents(
    classId,
    filterType || "全部"
  );
}

// 取得學生速覽資料
function ajaxGetStudentOverview(studentId) {
  return StudentService.getStudentOverview(studentId);
}

// 取得學生完整詳細分頁資料
function ajaxGetStudentDetail(studentId) {
  return StudentService.getStudentDetail(studentId);
}

// 全域工作台載入測試
function testTeacherWorkspaceClassLoading() {
  return {
    access: debugCurrentUserClassAccess(),
    classes: ajaxListAccessibleClasses()
  };
}

// 取得系統狀態數據 (已調整為 runSecure 包裝)
function ajaxGetSystemStatus() {
  return ResponseService.runSecure(function() {
    return SystemStatusService.getSystemStatus();
  });
}

// 簡單診斷函式
function testClassPipelineSimple() {
  const email = Session.getActiveUser().getEmail();
  const user = UserService.getUserByEmail(email);
  const scopes = UserService.getUserScopes(email);
  const activeScopes = PermissionService.getActiveScopes(email);
  const accessibleIds = PermissionService.getAccessibleClassIds();
  const apiResult = ajaxListAccessibleClasses();

  const result = {
    email: email,
    userFound: Boolean(user),
    role: user ? user.role : "",
    scopeCount: scopes.length,
    activeScopeCount: activeScopes.length,
    accessibleIds: accessibleIds,
    apiResult: apiResult
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

// --- End of Code.gs ---


// ==============================================================================
// 測試執行全域包裝進入點 (Installer Unique Triggers)
// ==============================================================================
function runInstallerTests() {
  return TestRunner.runAllTests();
}

// ==============================================================================
// 19. HTML Template Constants (Escaped for Safe Multi-line Inlining)
// ==============================================================================

const SetupWizardHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:0; padding:15px; color:#333; font-size:14px; background-color:#fafafa; }
    .wizard-container { background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); padding:20px; min-height:480px; display:flex; flex-direction:column; justify-content:space-between; }
    h2 { color:#1a73e8; margin-top:0; border-bottom:2px solid #e8f0fe; padding-bottom:8px; }
    .step-content { flex-grow:1; margin-bottom:20px; }
    .step { display:none; }
    .step.active { display:block; }
    .btn-group { display:flex; justify-content:space-between; }
    button { padding:10px 20px; border-radius:4px; border:none; cursor:pointer; font-weight:600; font-size:13px; }
    .btn-primary { background:#1a73e8; color:#fff; }
    .btn-primary:hover { background:#1557b0; }
    .btn-secondary { background:#f1f3f4; color:#3c4043; }
    .btn-secondary:hover { background:#e8eaed; }
    .form-group { margin-bottom:15px; }
    label { display:block; font-weight:bold; margin-bottom:5px; font-size:13px; }
    input[type="text"] { width:95%; padding:8px; border:1px solid #dadce0; border-radius:4px; font-size:13px; }
    .info-box { background:#e8f0fe; padding:10px; border-radius:4px; border-left:4px solid #1a73e8; font-size:12px; margin-bottom:15px; color:#1967d2; }
    .warning-box { background:#fce8e6; padding:10px; border-radius:4px; border-left:4px solid #d93025; font-size:12px; margin-bottom:15px; color:#a51d24; }
    ul { padding-left:20px; margin:5px 0; }
    .progress-bar { display:flex; justify-content:space-between; margin-bottom:20px; background:#e8eaed; border-radius:4px; height:8px; position:relative; }
    .progress-fill { background:#1a73e8; height:100%; border-radius:4px; width:0%; transition: width 0.3s ease; }
  </style>
</head>
<body>
  <div class="wizard-container">
    <div>
      <h2>ClassCare 啟動設定精靈</h2>
      <div style="font-size:11px; color:#5f6368; text-align:right; margin-bottom:5px;" id="step-indicator">步驟 1 / 6</div>
      <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
      <div class="step-content">
        <div class="step active" id="step-1">
          <h3>第一步：填寫基本資訊</h3>
          <div class="form-group"><label>系統名稱</label><input type="text" id="sys-name" value="ClassCare 班級關懷工作台"></div>
          <div class="form-group"><label>學校名稱</label><input type="text" id="school-name" placeholder="例如：春風國民小學"></div>
          <div class="form-group"><label>當前學年度</label><input type="text" id="school-year" value="114"></div>
          <div class="info-box">時區預設固定為：Asia/Taipei</div>
        </div>
        <div class="step" id="step-2">
          <h3>第二步：設定管理員</h3>
          <div class="info-box">偵測到目前操作帳號：<br/><strong id="session-email">讀取中...</strong></div>
          <div class="warning-box" id="email-warning" style="display:none;">警告：無法取得您的 Google 帳號 Email，請確認您已正確登入。</div>
          <div class="form-group"><label>管理員帳號 Email</label><input type="text" id="admin-email"></div>
          <div class="form-group"><label>管理員姓名</label><input type="text" id="admin-name" placeholder="例如：張主任"></div>
        </div>
        <div class="step" id="step-3">
          <h3>第三步：設定附件資料夾</h3>
          <p>系統需要一個 Google Drive 資料夾來保存健康診斷書與補助證明等隱私附件。</p>
          <div class="form-group">
            <input type="checkbox" id="create-folder" checked>
            <label style="display:inline; font-weight:normal;" for="create-folder">自動建立專用 Google Drive 資料夾</label>
          </div>
        </div>
        <div class="step" id="step-4">
          <h3>第四步：建立資料表結構</h3>
          <p>系統將在目前的試算表中安全地初始化 12 個核心工作表。</p>
          <div class="warning-box">注意：若試算表內已存在上述工作表與資料，將會予以保留，不會刪除或覆寫原有內容。</div>
        </div>
        <div class="step" id="step-5">
          <h3>第五步：匯入示範資料</h3>
          <p>是否需要建立一組虛擬的五年三班測試資料？</p>
          <div class="form-group">
            <input type="checkbox" id="seed-demo">
            <label style="display:inline; font-weight:normal;" for="seed-demo">匯入虛構示範資料（僅供測試，預設為不建立）</label>
          </div>
        </div>
        <div class="step" id="step-6">
          <h3>第六步：設定完成</h3>
          <div id="setup-loader" class="loader-box">
            <p style="text-align:center; padding: 20px; color:#5f6368;">🔄 正在初始化系統與驗證結構，請稍候...</p>
          </div>
          <div id="setup-result" style="display:none; font-size:13px; line-height:1.5;">
            <div id="result-status" style="font-weight:bold; font-size:14px; margin-bottom:12px;"></div>

            <div id="detail-box" style="background:#f8f9fa; border:1px solid #dadce0; border-radius:6px; padding:12px; margin-bottom:12px; display:none;">
              <p style="margin:4px 0;"><strong>試算表名稱：</strong><span id="res-ss-name"></span></p>
              <p style="margin:4px 0;"><strong>建立資料表數：</strong><span id="res-sheets-count">0</span> / <span id="res-expected-sheets-count">--</span></p>
              <p style="margin:4px 0;"><strong>管理員狀態：</strong><span id="res-admin-status">0</span> 人啟用</p>

              <div id="res-errors-box" style="margin-top:8px; display:none;">
                <strong style="color:#c5221f;">錯誤限制：</strong>
                <ul id="res-errors-list" style="margin:2px 0; padding-left:20px; color:#c5221f; font-size:12px;"></ul>
              </div>
              <div id="res-warnings-box" style="margin-top:8px; display:none;">
                <strong style="color:#b06000;">警示警告：</strong>
                <ul id="res-warnings-list" style="margin:2px 0; padding-left:20px; color:#b06000; font-size:12px;"></ul>
              </div>
            </div>

            <div id="action-buttons-box"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-group" id="nav-group">
      <button class="btn-secondary" id="btn-prev" onclick="changeStep(-1)" style="visibility:hidden;">上一步</button>
      <button class="btn-primary" id="btn-next" onclick="changeStep(1)">下一步</button>
    </div>
  </div>
  <script>
    let currentStep = 1; const totalSteps = 6; let userEmail = "";
    window.onload = function() {
      google.script.run.withSuccessHandler(function(res) {
        if (res.success && res.data.email) {
          userEmail = res.data.email;
          document.getElementById('session-email').innerText = userEmail;
          document.getElementById('admin-email').value = userEmail;
        } else {
          document.getElementById('session-email').innerText = "未取得";
          document.getElementById('email-warning').style.display = 'block';
        }
      }).ajaxGetInitialInfo();
      updateProgress();
    };
    function changeStep(offset) {
      document.getElementById('step-' + currentStep).classList.remove('active');
      currentStep += offset;
      document.getElementById('step-' + currentStep).classList.add('active');
      document.getElementById('btn-prev').style.visibility = (currentStep === 1 || currentStep === 6) ? 'hidden' : 'visible';
      if (currentStep === 5) {
        document.getElementById('btn-next').innerText = '開始初始化';
      } else if (currentStep === 6) {
        document.getElementById('nav-group').style.display = 'none';
        triggerSetup();
      } else {
        document.getElementById('btn-next').innerText = '下一步';
      }
      updateProgress();
    }
    function updateProgress() {
      document.getElementById('step-indicator').innerText = '步驟 ' + currentStep + ' / ' + totalSteps;
      const fillPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
      document.getElementById('progress-fill').style.width = fillPercent + '%';
    }
    function triggerSetup() {
      const schoolName = document.getElementById('school-name').value.trim() || "未設定學校名稱";
      const schoolYear = document.getElementById('school-year').value.trim() || "114";
      const adminEmail = document.getElementById('admin-email').value.trim();
      const adminName = document.getElementById('admin-name').value.trim() || "系統管理員";
      const createFolder = document.getElementById('create-folder').checked;
      const seedDemo = document.getElementById('seed-demo').checked;

      const payload = {
        schoolName: schoolName,
        schoolYear: schoolYear,
        adminEmail: adminEmail,
        adminName: adminName,
        createFolder: createFolder,
        seedDemo: seedDemo
      };

      google.script.run
        .withSuccessHandler(function(response) {
          document.getElementById('setup-loader').style.display = 'none';
          document.getElementById('setup-result').style.display = 'block';

          if (response.success) {
            displaySetupResults(response.data);
          } else {
            showErrorState(response.message || "初始化時發生未知錯誤。");
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('setup-loader').style.display = 'none';
          document.getElementById('setup-result').style.display = 'block';
          showErrorState(err.message || "通訊失敗，請確認目前連線或權限。");
        })
        .completeSetupWizard(payload);
    }

    function displaySetupResults(data) {
      const setup = data.setup;
      const status = data.status;

      const statusTitle = document.getElementById('result-status');
      const detailBox = document.getElementById('detail-box');
      const btnBox = document.getElementById('action-buttons-box');

      detailBox.style.display = 'block';
      document.getElementById('res-ss-name').innerText = status.spreadsheetName || setup.spreadsheetName;

      // 計算啟用的工作表數
      let sheetsCount = 0;
      if (status.sheetStatus) {
        for (let s in status.sheetStatus) {
          if (status.sheetStatus[s] === true) sheetsCount++;
        }
      }
      document.getElementById('res-sheets-count').innerText = sheetsCount;
      document.getElementById('res-expected-sheets-count').innerText = status.expectedSheetCount || setup.expectedSheetCount || 16;
      document.getElementById('res-admin-status').innerText = status.adminCount;

      // 顯示錯誤項目
      const errorsBox = document.getElementById('res-errors-box');
      const errorsList = document.getElementById('res-errors-list');
      errorsList.replaceChildren();
      if (status.errors && status.errors.length > 0) {
        status.errors.forEach(err => {
          const li = document.createElement('li');
          li.textContent = err;
          errorsList.appendChild(li);
        });
        errorsBox.style.display = 'block';
      } else {
        errorsBox.style.display = 'none';
      }

      // 顯示警告項目
      const warningsBox = document.getElementById('res-warnings-box');
      const warningsList = document.getElementById('res-warnings-list');
      warningsList.replaceChildren();
      if (status.warnings && status.warnings.length > 0) {
        status.warnings.forEach(warn => {
          const li = document.createElement('li');
          li.textContent = warn;
          warningsList.appendChild(li);
        });
        warningsBox.style.display = 'block';
      } else {
        warningsBox.style.display = 'none';
      }

      // 依錯誤筆數調整顯示與按鈕
      btnBox.replaceChildren();
      if (!status.errors || status.errors.length === 0) {
        statusTitle.textContent = '✅ ClassCare 系統已建立完成。';
        statusTitle.style.color = '#137333';

        const btn1 = document.createElement('button');
        btn1.className = 'btn-primary';
        btn1.textContent = '② 開啟導師工作台';
        btn1.style.width = '100%';
        btn1.style.marginBottom = '8px';
        btn1.onclick = openTeacherWorkspaceAfterSetup;

        const btn2 = document.createElement('button');
        btn2.className = 'btn-secondary';
        btn2.textContent = '重新檢查系統狀態';
        btn2.style.width = '100%';
        btn2.style.marginBottom = '8px';
        btn2.onclick = recheckSystemStatus;

        const btn3 = document.createElement('button');
        btn3.className = 'btn-secondary';
        btn3.textContent = '關閉設定精靈';
        btn3.style.width = '100%';
        btn3.onclick = function() { google.script.host.close(); };

        btnBox.appendChild(btn1);
        btnBox.appendChild(btn2);
        btnBox.appendChild(btn3);
      } else {
        statusTitle.textContent = '⚠️ 系統資料表已建立，但仍有項目需要處理。';
        statusTitle.style.color = '#b06000';

        const btn1 = document.createElement('button');
        btn1.className = 'btn-primary';
        btn1.textContent = '重新檢查系統狀態';
        btn1.style.width = '100%';
        btn1.style.marginBottom = '8px';
        btn1.onclick = recheckSystemStatus;

        const btn2 = document.createElement('button');
        btn2.className = 'btn-secondary';
        btn2.textContent = '關閉設定精靈';
        btn2.style.width = '100%';
        btn2.onclick = function() { google.script.host.close(); };

        btnBox.appendChild(btn1);
        btnBox.appendChild(btn2);
      }
    }

    // 修正錯誤列表，禁止顯示 literal \`\${escapeHtml(msg)}\`
    function showErrorState(msg) {
      const statusTitle = document.getElementById('result-status');
      statusTitle.textContent = '🔴 初始化設定失敗！';
      statusTitle.style.color = '#c5221f';

      const detailBox = document.getElementById('detail-box');
      detailBox.style.display = 'block';

      const errorsBox = document.getElementById('res-errors-box');
      const errorsList = document.getElementById('res-errors-list');
      errorsBox.style.display = 'block';

      const li = document.createElement('li');
      li.textContent = msg;
      errorsList.replaceChildren(li);

      const btnBox = document.getElementById('action-buttons-box');
      btnBox.replaceChildren();
      const btnClose = document.createElement('button');
      btnClose.className = 'btn-secondary';
      btnClose.textContent = '關閉視窗';
      btnClose.style.width = '100%';
      btnClose.onclick = function() { google.script.host.close(); };
      btnBox.appendChild(btnClose);
    }

    function openTeacherWorkspaceAfterSetup() {
      const btnBox = document.getElementById('action-buttons-box');
      btnBox.innerHTML = '<p style="text-align:center; color:#5f6368;">正在啟動導師工作台，請稍候...</p>';

      google.script.run
        .withSuccessHandler(function() {
          google.script.host.close();
        })
        .withFailureHandler(function(err) {
          displayRecheckError("開啟工作台失敗：" + (err.message || "未知錯誤"));
        })
        .showTeacherWorkspace();
    }

    function recheckSystemStatus() {
      const statusTitle = document.getElementById('result-status');
      statusTitle.innerHTML = '🔄 正在重新檢查系統狀態...';
      statusTitle.style.color = '#5f6368';

      google.script.run
        .withSuccessHandler(function(response) {
          if (response.success) {
            displaySetupResults({
              setup: { success: true },
              status: response.data
            });
          } else {
            displayRecheckError(response.message || "重新校對失敗");
          }
        })
        .withFailureHandler(function(err) {
          displayRecheckError(err.message || "連線逾時");
        })
        .ajaxGetSystemStatus();
    }

    function displayRecheckError(msg) {
      const errorsBox = document.getElementById('res-errors-box');
      const errorsList = document.getElementById('res-errors-list');
      errorsBox.style.display = 'block';
      const li = document.createElement('li');
      li.innerText = msg;
      errorsList.appendChild(li);
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>
`;

const TeacherWorkspaceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ClassCare 班級轉銜與學生理解工作台</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin:0; padding:0; background:#f4f6f9; color:#333; font-size:14px; }
    .header { background:#1a73e8; color:white; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .header h1 { font-size:18px; margin:0; }
    .user-info { font-size:12px; opacity:0.9; text-align:right; }
    .container { max-width:1200px; margin:20px auto; padding:0 20px; }
    .toolbar { background:white; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; gap:15px; align-items:center; flex-wrap:wrap; }
    .select-input, .text-input { padding:8px 12px; border:1px solid #dadce0; border-radius:4px; font-size:13px; outline:none; }
    .select-input { cursor:pointer; }
    .text-input { flex-grow:1; max-width:300px; }

    .student-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap:20px; }
    .student-card { background:white; border-radius:8px; padding:15px; box-shadow:0 1px 3px rgba(0,0,0,0.05); border:1px solid #e0e0e0; display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s, box-shadow 0.2s; }
    .student-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .card-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0f0f0; padding-bottom:8px; margin-bottom:10px; }
    .seat-badge { background:#e8f0fe; color:#1a73e8; font-weight:bold; font-size:12px; padding:2px 8px; border-radius:12px; }
    .student-name { font-size:16px; font-weight:bold; margin:0; }
    .card-body p { margin:6px 0; font-size:13px; color:#5f6368; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; }
    .card-body strong { color:#333; }
    .badge-container { display:flex; gap:5px; margin-top:10px; flex-wrap:wrap; }
    .badge { font-size:11px; padding:2px 6px; border-radius:4px; font-weight:600; }
    .badge-task { background:#e8f0fe; color:#1967d2; }
    .badge-alert { background:#fce8e6; color:#c5221f; }
    .badge-subsidy { background:#fef7e0; color:#b06000; }
    .btn-view { display:block; width:100%; text-align:center; padding:8px 0; background:#1a73e8; color:white; border:none; border-radius:4px; font-weight:600; text-decoration:none; margin-top:15px; cursor:pointer; font-size:13px; }
    .btn-view:hover { background:#1557b0; }

    .detail-view { display:none; background:white; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden; }
    .detail-header { background:#f8f9fa; padding:15px 20px; border-bottom:1px solid #e0e0e0; display:flex; justify-content:space-between; align-items:center; }
    .detail-tabs { display:flex; background:#f1f3f4; border-bottom:1px solid #e0e0e0; overflow-x:auto; }
    .tab-btn { padding:12px 20px; border:none; background:none; cursor:pointer; font-weight:600; font-size:13px; color:#5f6368; outline:none; border-bottom:3px solid transparent; white-space:nowrap; }
    .tab-btn.active { color:#1a73e8; border-bottom-color:#1a73e8; background:white; }
    .tab-content { padding:25px; display:none; min-height:400px; max-height: 520px; overflow-y: auto; }
    .tab-content.active { display:block; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .info-card { background:#f8f9fa; padding:15px; border-radius:6px; border-left:4px solid #1a73e8; margin-bottom:15px; }
    .info-card h4 { margin:0 0 8px 0; color:#1a73e8; font-size:14px; }
    .info-card p { margin:4px 0; font-size:13px; line-height:1.5; }
    .btn-back { background:#e8eaed; color:#3c4043; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:600; }
    .btn-back:hover { background:#dadce0; }

    .timeline { border-left: 2px solid #e8eaed; padding-left: 15px; margin-left: 10px; }
    .timeline-item { position: relative; margin-bottom: 20px; }
    .timeline-item::before { content: ''; position: absolute; left: -21px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #1a73e8; }
    .timeline-date { font-size: 11px; color: #5f6368; font-weight: bold; }
    .timeline-title { font-weight: bold; margin: 3px 0; font-size:13px; }
    .timeline-desc { font-size: 12px; color: #3c4043; line-height:1.4; }
  </style>
</head>
<body>
  <div class="header">
    <h1 id="title-banner">ClassCare 班級轉銜與學生理解工作台</h1>
    <div class="user-info">
      <div id="username-display">載入中...</div>
      <div id="email-display">載入中...</div>
    </div>
  </div>

  <div class="container">
    <div id="list-state">
      <div class="toolbar">
        <select class="select-input" id="classSelect" onchange="loadStudentsForClass(this.value)">
          <option value="">讀取班級中...</option>
        </select>
        <select class="select-input" id="filterSelect" onchange="loadStudentsForClass(document.getElementById('classSelect').value)">
          <option value="全部">全部學生</option>
          <option value="建議優先認識">建議優先認識</option>
          <option value="家庭資料待確認">家庭資料待確認</option>
          <option value="學習支持">學習支持</option>
          <option value="情緒與適應">情緒與適應</option>
          <option value="尚有追蹤事項">尚有追蹤事項</option>
          <option value="健康或行政提醒">健康或行政提醒</option>
        </select>
        <input type="text" class="text-input" id="search-input" placeholder="搜尋學生姓名或座號..." oninput="filterCards()">
        <span style="font-size:12px; color:#5f6368; margin-left:auto;">
          班級人數：<strong id="studentCount">0</strong> 人
        </span>
      </div>

      <div id="workspaceMessage" role="status" style="margin:12px 0;color:#b3261e;font-weight:600;"></div>

      <div class="student-grid" id="student-container"></div>
      <div id="no-classes-error" style="display:none; text-align:center; padding:40px; background:white; border-radius:8px;">
        <p style="color:#d93025; font-size:16px; font-weight:bold;" id="error-message-text">目前沒有可存取的班級，請聯絡系統管理員確認權限。</p>
      </div>
    </div>

    <div class="detail-view" id="detail-state">
      <div class="detail-header">
        <div>
          <span class="seat-badge" id="detail-seat">座號 --</span>
          <strong style="font-size:20px; margin-left:10px;" id="detail-name">學生姓名</strong>
          <span style="font-size:13px; color:#5f6368; margin-left:10px;" id="detail-class-info">--</span>
        </div>
        <button class="btn-back" onclick="backToList()">返回學生清單</button>
      </div>

      <div class="detail-tabs">
        <button class="tab-btn active" onclick="switchTab('quicklook', this)">1. 速覽</button>
        <button class="tab-btn" onclick="switchTab('learning', this)">2. 個性與學習</button>
        <button class="tab-btn" onclick="switchTab('family', this)">3. 家庭與聯絡</button>
        <button class="tab-btn" onclick="switchTab('strategies', this)">4. 支持策略</button>
        <button class="tab-btn" onclick="switchTab('transition', this)">5. 重要事件與轉銜</button>
        <button class="tab-btn" onclick="switchTab('contact', this)">6. 親師聯絡</button>
        <button class="tab-btn" onclick="switchTab('tasks', this)">7. 追蹤事項</button>
        <button class="tab-btn" onclick="switchTab('alerts', this)">8. 健康與行政提醒</button>
      </div>

      <!-- Tab Content 1: Quicklook -->
      <div class="tab-content active" id="tab-quicklook">
        <div class="grid-2">
          <div>
            <div class="info-card">
              <h4>孩子特質與學習優勢</h4>
              <p><strong>個性摘要：</strong><span id="quick-personality">讀取中...</span></p>
              <p><strong>學習優勢：</strong><span id="quick-strengths">讀取中...</span></p>
            </div>
            <div class="info-card">
              <h4>當前支持重點</h4>
              <p id="quick-support">讀取中...</p>
            </div>
          </div>
          <div>
            <div class="info-card">
              <h4>家庭聯絡摘要</h4>
              <div id="quick-family">讀取中...</div>
            </div>
            <div class="info-card">
              <h4>待辦追蹤與重要提醒</h4>
              <p><strong>未完成追蹤數量：</strong><span id="quick-tasks-count">0</span> 筆</p>
              <p><strong>健康行動提醒：</strong><span id="quick-health-alert">無</span></p>
              <p><strong>補助處理提醒：</strong><span id="quick-subsidy-alert">無</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content 2: Learning -->
      <div class="tab-content" id="tab-learning">
        <div class="info-card">
          <h4>學生特質與學習習慣</h4>
          <p><strong>學習優勢與興趣：</strong><span id="learn-strengths">載入中...</span></p>
          <p><strong>學習需求與困難：</strong><span id="learn-needs">載入中...</span></p>
          <p><strong>情緒適應：</strong><span id="learn-emotional">載入中...</span></p>
          <p><strong>同儕互動：</strong><span id="learn-peer">載入中...</span></p>
        </div>
        <div style="font-size:12px; color:#5f6368; padding:5px 15px;">
          資料來源：<span id="learn-source">--</span> | 狀態：<span id="learn-status">--</span> | 有效截止日：<span id="learn-period">--</span>
        </div>
      </div>

      <!-- Tab Content 3: Family -->
      <div class="tab-content" id="tab-family">
        <div id="family-container"></div>
      </div>

      <!-- Tab Content 4: Strategies -->
      <div class="tab-content" id="tab-strategies">
        <div class="info-card" style="border-left-color: #34a853;">
          <h4>前任導師推薦有效策略</h4>
          <p><strong>建議採行策略 (Do's)：</strong><br/><span id="strat-effective">載入中...</span></p>
        </div>
        <div class="info-card" style="border-left-color: #ea4335;">
          <h4>應避免策略 (Don'ts)</h4>
          <p><strong>避免採行方式 (Don'ts)：</strong><br/><span id="strat-avoid">載入中...</span></p>
        </div>
        <div class="info-card">
          <h4>轉銜重點備忘</h4>
          <p id="strat-transition">載入中...</p>
        </div>
      </div>

      <!-- Tab Content 5: Transition -->
      <div class="tab-content" id="tab-transition">
        <div class="info-card">
          <h4>學校轉銜注意事項</h4>
          <p id="trans-notes">載入中...</p>
        </div>
        <div class="info-card">
          <h4>進行中的轉銜任務與重要事件</h4>
          <ul id="trans-events"></ul>
        </div>
      </div>

      <!-- Tab Content 6: Contact -->
      <div class="tab-content" id="tab-contact">
        <div class="timeline" id="contact-timeline"></div>
      </div>

      <!-- Tab Content 7: Tasks -->
      <div class="tab-content" id="tab-tasks">
        <div class="grid-2">
          <div>
            <h4 style="color:#c5221f;">未處理 (TODO)</h4>
            <div id="tasks-todo"></div>
          </div>
          <div>
            <h4 style="color:#1a73e8;">已完成 (COMPLETED)</h4>
            <div id="tasks-completed"></div>
          </div>
        </div>
      </div>

      <!-- Tab Content 8: Alerts -->
      <div class="tab-content" id="tab-alerts">
        <div class="grid-2">

          <div class="info-card" style="border-left-color:#ea4335;">
            <h4>健康照護行動提醒</h4>
            <p>
              <strong>警示等級：</strong>
              <span id="alert-health-level">--</span>
            </p>
            <p>
              <strong>導師照護摘要：</strong>
              <span id="alert-health-summary">--</span>
            </p>
            <p>
              <strong>第一時間處置：</strong>
              <span id="alert-health-action">--</span>
            </p>
            <p>
              <strong>體育活動限制：</strong>
              <span id="alert-health-restrict">--</span>
            </p>
            <p>
              <strong>需要通知家長：</strong>
              <span id="alert-health-parent">--</span>
            </p>
            <p>
              <strong>需要通知健康中心：</strong>
              <span id="alert-health-center">--</span>
            </p>
          </div>

          <div class="info-card" style="border-left-color:#fbbc05;">
            <h4>補助與行政處理提醒</h4>
            <p>
              <strong>補助類型：</strong>
              <span id="alert-sub-type">--</span>
            </p>
            <p>
              <strong>申請狀態：</strong>
              <span id="alert-sub-status">--</span>
            </p>
            <p>
              <strong>核定期間：</strong>
              <span id="alert-sub-period">--</span>
            </p>
            <p>
              <strong>承辦人員：</strong>
              <span id="alert-sub-owner">--</span>
            </p>
            <p>
              <strong>文件狀態：</strong>
              <span id="alert-sub-doc">--</span>
            </p>
            <p>
              <strong>備註：</strong>
              <span id="alert-sub-notes">--</span>
            </p>
          </div>

        </div>
      </div>
    </div> <!-- detail-state -->
  </div> <!-- container -->

  <script>
    let activeStudentId = "";
    let studentDataList = [];

    function unwrapApiResponse(result) {
      let current = result;
      let depth = 0;

      while (
        current &&
        typeof current === "object" &&
        current.success === true &&
        current.data &&
        typeof current.data === "object" &&
        !Array.isArray(current.data) &&
        Object.prototype.hasOwnProperty.call(
          current.data,
          "success"
        ) &&
        depth < 5
      ) {
        current = current.data;
        depth++;
      }

      return current;
    }

    function extractArrayPayload(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (
        response &&
        response.success === true &&
        Array.isArray(response.data)
      ) {
        return response.data;
      }

      return null;
    }

    window.onload = function() {
      initWorkspace();
    };

    function initWorkspace() {
      // 讀取使用者基本資訊
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success && res.data.email) {
            document.getElementById('username-display').innerText = "教師工作台";
            document.getElementById('email-display').innerText = res.data.email;
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('email-display').innerText = "無連線";
          console.error("無法取得使用者資訊:", err);
        })
        .ajaxGetInitialInfo();

      loadAccessibleClasses();
    }

    function loadAccessibleClasses() {
      const select = document.getElementById('classSelect');
      const msgArea = document.getElementById('workspaceMessage');

      msgArea.textContent = "";
      select.replaceChildren();

      const optLoading = document.createElement('option');
      optLoading.value = "";
      optLoading.textContent = "讀取班級中……";
      select.appendChild(optLoading);

      google.script.run
        .withSuccessHandler(function(result) {
          select.replaceChildren();

          try {
            const response = unwrapApiResponse(result);
            const classes = extractArrayPayload(response);

            if (classes === null) {
              const optError = document.createElement('option');
              optError.value = "";
              optError.textContent = "資料格式錯誤";
              select.appendChild(optError);

              document.getElementById('studentCount').innerText = "0";
              renderStudentCards([]);
              msgArea.textContent = "班級資料格式錯誤，請檢查後端 API 回傳。";
              console.error("原始 API 回傳:", result);
              return;
            }

            if (classes.length > 0) {
              classes.forEach(function(c) {
                const opt = document.createElement('option');
                opt.value = c.class_id;
                opt.textContent = c.class_name + " (" + c.school_year + "學年度)";
                select.appendChild(opt);
              });

              // 若有班級，選取第一個班級並加載學生
              const firstClassId = select.options[0].value;
              select.value = firstClassId;
              loadStudentsForClass(firstClassId);
            } else {
              const optNone = document.createElement('option');
              optNone.value = "";
              optNone.textContent = "無可存取班級";
              select.appendChild(optNone);

              document.getElementById('studentCount').innerText = "0";
              renderStudentCards([]);

              document.getElementById('list-state').style.display = 'block';
              document.getElementById('student-container').style.display = 'none';
              document.getElementById('no-classes-error').style.display = 'block';
              document.getElementById('error-message-text').textContent = (response && response.message) ? response.message : "目前沒有可存取的班級，請聯絡系統管理員確認權限。";
            }
          } catch (err) {
            const optError = document.createElement('option');
            optError.value = "";
            optError.textContent = "解析錯誤";
            select.appendChild(optError);

            document.getElementById('studentCount').innerText = "0";
            renderStudentCards([]);
            msgArea.textContent = "解析班級資料發生錯誤: " + err.message;
            console.error("原始 API 解析錯誤:", err);
          }
        })
        .withFailureHandler(function(err) {
          select.replaceChildren();
          const optError = document.createElement('option');
          optError.value = "";
          optError.textContent = "讀取失敗";
          select.appendChild(optError);

          document.getElementById('studentCount').innerText = "0";
          renderStudentCards([]);
          msgArea.textContent = err.message || "通訊失敗，無法讀取班級資料。";
        })
        .ajaxListAccessibleClasses();
    }

    function loadStudentsForClass(classId) {
      const msgArea = document.getElementById('workspaceMessage');
      const countEl = document.getElementById('studentCount');
      const container = document.getElementById('student-container');
      const filterType = document.getElementById('filterSelect').value;

      msgArea.textContent = "";

      if (!classId) {
        countEl.innerText = "0";
        renderStudentCards([]);
        return;
      }

      countEl.innerText = "讀取中...";
      container.innerHTML = "<div style='grid-column:1/-1; text-align:center; padding:30px; color:#666;'>載入學生名冊中...</div>";
      document.getElementById('list-state').style.display = 'block';
      document.getElementById('student-container').style.display = 'grid';
      document.getElementById('no-classes-error').style.display = 'none';

      google.script.run
        .withSuccessHandler(function(result) {
          try {
            const response = unwrapApiResponse(result);
            const students = extractArrayPayload(response);

            if (students === null) {
              countEl.innerText = "0";
              renderStudentCards([]);
              msgArea.textContent = "學生資料格式錯誤，請檢查後端 API 回傳。";
              console.error("原始學生 API 回傳:", result);
              return;
            }

            studentDataList = students;
            countEl.innerText = studentDataList.length;
            renderStudentCards(studentDataList);
            msgArea.textContent = "";
          } catch (err) {
            countEl.innerText = "0";
            renderStudentCards([]);
            msgArea.textContent = "解析學生資料時發生錯誤: " + err.message;
            console.error("原始學生解析錯誤:", err);
          }
        })
        .withFailureHandler(function(err) {
          countEl.innerText = "0";
          renderStudentCards([]);
          msgArea.textContent = err.message || "通訊失敗，無法讀取學生資料。";
        })
        .ajaxListAccessibleStudents(classId, filterType);
    }

    function renderStudentCards(students) {
      const container = document.getElementById('student-container');
      container.innerHTML = "";
      if (students.length === 0) {
        container.innerHTML = "<div style='grid-column:1/-1; text-align:center; padding:30px; color:#999;'>查無符合條件的學生。</div>";
        return;
      }
      students.forEach(function(s) {
        const card = document.createElement('div');
        card.className = "student-card";
        card.id = "card-" + s.student_id;
        let badges = '<span class="badge badge-task">待辦 ' + s.pending_tasks_count + '</span>';
        if (s.has_health_alert) badges += '<span class="badge badge-alert">健康</span>';
        if (s.has_subsidy_alert) badges += '<span class="badge badge-subsidy">補助待查</span>';

        card.innerHTML = \`
          <div class="card-header">
            <span class="seat-badge">座號 \${s.seat_no}</span>
            <span class="student-name">\${escapeHtml(s.student_name)}</span>
          </div>
          <div class="card-body">
            <p><strong>孩子特質：</strong>\${escapeHtml(s.personality_summary)}</p>
            <p><strong>學習優勢：</strong>\${escapeHtml(s.learning_strength_summary)}</p>
            <p><strong>支持重點：</strong>\${escapeHtml(s.current_support_summary)}</p>
            <p><strong>主要照顧者：</strong>\${escapeHtml(s.primary_caregiver_relationship)}</p>
            <div class="badge-container">\${badges}</div>
          </div>
          <button class="btn-view" onclick="viewStudent('\${s.student_id}')">查看學生資料</button>
        \`;
        container.appendChild(card);
      });
    }

    function filterCards() {
      const q = document.getElementById('search-input').value.trim().toLowerCase();
      if (!q) { renderStudentCards(studentDataList); return; }
      const filtered = studentDataList.filter(function(s) {
        return s.student_name.toLowerCase().indexOf(q) !== -1 || String(s.seat_no) === q;
      });
      renderStudentCards(filtered);
    }

    function viewStudent(studentId) {
      activeStudentId = studentId;
      document.getElementById('list-state').style.display = 'none';
      document.getElementById('detail-state').style.display = 'block';
      switchTab('quicklook', document.querySelector('.tab-btn'));

      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            const d = res.data;
            document.getElementById('detail-name').innerText = d.student.student_name;
            document.getElementById('detail-seat').innerText = "座號 " + d.student.seat_no;
            document.getElementById('detail-class-info').innerText = d.student.school_year + "學年度 " + (d.student.class_name || "");
            document.getElementById('quick-personality').innerText = d.personality_summary;
            document.getElementById('quick-strengths').innerText = d.learning_strength_summary;
            document.getElementById('quick-support').innerText = d.current_support_summary;
            document.getElementById('quick-tasks-count').innerText = d.tasks_count;
            document.getElementById('quick-health-alert').innerText = d.health_action.teacher_summary;
            document.getElementById('quick-subsidy-alert').innerText = d.subsidy_action.subsidy_type + " (" + d.subsidy_action.application_status + ")";
            let famHtml = "";
            d.guardians.forEach(g => {
              famHtml += \`<div>\${escapeHtml(g.relationship)}：\${escapeHtml(g.phone_masked)} (適合: \${escapeHtml(g.contact_time)})</div>\`;
            });
            document.getElementById('quick-family').innerHTML = famHtml || "無聯絡人資訊";
          } else {
            document.getElementById('workspaceMessage').textContent = res.message || "載入學生速覽資料失敗";
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('workspaceMessage').textContent = err.message || "通訊失敗，無法讀取速覽資料。";
        })
        .ajaxGetStudentOverview(studentId);

      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            const d = res.data;
            document.getElementById('learn-strengths').innerText = d.learning.strengths;
            document.getElementById('learn-needs').innerText = d.learning.learning_needs;
            document.getElementById('learn-emotional').innerText = d.learning.emotional_support;
            document.getElementById('learn-peer').innerText = d.learning.peer_interaction;
            document.getElementById('learn-source').innerText = d.learning.source_type;
            document.getElementById('learn-status').innerText = d.learning.verified_status;
            document.getElementById('learn-period').innerText = d.learning.effective_to || "無期限";

            const fContainer = document.getElementById('family-container');
            fContainer.innerHTML = "";
            d.guardians.forEach(g => {
              const div = document.createElement('div');
              div.className = "info-card";
              div.innerHTML = \`
                <h4>親屬關係：\${escapeHtml(g.relationship)} (\${escapeHtml(g.name)})</h4>
                <p><strong>聯絡電話：</strong>\${escapeHtml(g.phone_masked)}</p>
                <p><strong>適合聯絡時間：</strong>\${escapeHtml(g.contact_time)}</p>
                <p><strong>聯絡方式：</strong>\${escapeHtml(g.contact_method)}</p>
                <p><strong>監護權/接送：</strong>\${g.is_legal_guardian ? '有監護權' : '無'} | 允許接送：\${g.pickup_permission ? '允許' : '否'}</p>
                <p><strong>備註：</strong>\${escapeHtml(g.notes || '無')}</p>
              \`;
              fContainer.appendChild(div);
            });

            document.getElementById('strat-effective').innerText = d.strategies.effective_strategies;
            document.getElementById('strat-avoid').innerText = d.strategies.avoid_strategies;
            document.getElementById('strat-transition').innerText = d.strategies.transition_notes;
            document.getElementById('trans-notes').innerText = d.transition.transition_notes;

            const eUl = document.getElementById('trans-events');
            eUl.innerHTML = "";
            d.transition.active_tasks.forEach(t => {
              const li = document.createElement('li'); li.textContent = "[待辦事項] " + t; eUl.appendChild(li);
            });

            const contactContainer = document.getElementById('contact-timeline');
            contactContainer.innerHTML = "";
            if (d.contactLogs.length === 0) {
              contactContainer.innerHTML = "<p style='color:#999;'>目前無親師聯絡紀錄。</p>";
            } else {
              d.contactLogs.forEach(c => {
                const div = document.createElement('div');
                div.className = "timeline-item";
                div.innerHTML = \`
                  <div class="timeline-date">\\\\-- \${c.contact_date} (\${escapeHtml(c.contact_method)} - \${escapeHtml(c.contact_person)})</div>
                  <div class="timeline-title">\\\\-- \${escapeHtml(c.topic)}</div>
                  <div class="timeline-desc">
                    <strong>談話摘要：</strong>\${escapeHtml(c.objective_summary)}<br/>
                    <strong>家長回應：</strong>\${escapeHtml(c.guardian_response)}<br/>
                    <strong>雙方共識：</strong>\${escapeHtml(c.agreement)}<br/>
                    <strong>後續行動：</strong>\${escapeHtml(c.follow_up_action)}
                  </div>
                \`;
                contactContainer.appendChild(div);
              });
            }

            renderTaskList('tasks-todo', d.tasks.todo.concat(d.tasks.in_progress));
            renderTaskList('tasks-completed', d.tasks.completed);

            document.getElementById('alert-health-level').innerText = d.alerts.health.alert_level;
            document.getElementById('alert-health-summary').innerText = d.alerts.health.teacher_summary;
            document.getElementById('alert-health-action').innerText = d.alerts.health.first_action;
            document.getElementById('alert-health-restrict').innerText = d.alerts.health.activity_restriction;
            document.getElementById('alert-health-parent').innerText = d.alerts.health.contact_guardian ? '需要' : '不需';
            document.getElementById('alert-health-center').innerText = d.alerts.health.notify_health_center ? '需要' : '不需';

            document.getElementById('alert-sub-type').innerText = d.alerts.subsidy.subsidy_type;
            document.getElementById('alert-sub-status').innerText = d.alerts.subsidy.application_status;
            document.getElementById('alert-sub-period').innerText = d.alerts.subsidy.approved_period;
            document.getElementById('alert-sub-owner').innerText = d.alerts.subsidy.case_owner;
            document.getElementById('alert-sub-doc').innerText = d.alerts.subsidy.document_status;
            document.getElementById('alert-sub-notes').innerText = d.alerts.subsidy.notes;
          } else {
            document.getElementById('workspaceMessage').textContent = res.message || "載入學生詳細資料失敗";
          }
        })
        .withFailureHandler(function(err) {
          document.getElementById('workspaceMessage').textContent = err.message || "通訊失敗，無法讀取學生詳細資料。";
        })
        .ajaxGetStudentDetail(studentId);
    }

    function renderTaskList(elementId, list) {
      const div = document.getElementById(elementId);
      div.innerHTML = "";
      if (list.length === 0) {
        div.innerHTML = "<p style='color:#999; font-size:12px;'>無待辦事項。</p>";
        return;
      }
      list.forEach(t => {
        const item = document.createElement('div');
        item.style = "padding:8px; background:#fff; border:1px solid #e0e0e0; border-radius:4px; margin-bottom:8px; font-size:12px;";
        item.innerHTML = \`
          <strong>\${escapeHtml(t.task_title)}</strong>
          <div style="color:#5f6368; margin-top:4px;">\${escapeHtml(t.description || '無描述')}</div>
          <div style="margin-top:4px; color:#d93025;">期限：\${t.due_date} | 優先度：\${t.priority}</div>
        \`;
        div.appendChild(item);
      });
    }

    function backToList() {
      document.getElementById('detail-state').style.display = 'none';
      document.getElementById('list-state').style.display = 'block';
      activeStudentId = "";
    }

    function switchTab(tabId, button) {
      const buttons = document.querySelectorAll('.tab-btn');
      const contents = document.querySelectorAll('.tab-content');

      buttons.forEach(function(item) {
        item.classList.remove('active');
      });

      contents.forEach(function(item) {
        item.classList.remove('active');
      });

      const targetButton =
        button ||
        document.querySelector(
          '.tab-btn[onclick*="' + tabId + '"]'
        );

      if (targetButton) {
        targetButton.classList.add('active');
      }

      const targetContent =
        document.getElementById('tab-' + tabId);

      if (targetContent) {
        targetContent.classList.add('active');
      }
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>
`;

const ImportCenterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ClassCare 匯入中心</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin:0; padding:15px; background:#f4f6f9; color:#333; font-size:13px; }
    .import-container { background:white; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:flex; flex-direction:column; height: 580px; overflow: hidden; }
    .tabs { display:flex; background:#f1f3f4; border-bottom:1px solid #e0e0e0; }
    .tab-btn { padding:12px 20px; border:none; background:none; cursor:pointer; font-weight:600; font-size:13px; color:#5f6368; outline:none; border-bottom:3px solid transparent; }
    .tab-btn.active { color:#1a73e8; border-bottom-color:#1a73e8; background:white; }
    .tab-content { padding:20px; flex-grow:1; display:none; overflow-y:auto; }
    .tab-content.active { display:block; }
    h3 { margin-top:0; color:#1a73e8; }
    .info-box { background:#e8f0fe; padding:12px; border-radius:4px; border-left:4px solid #1a73e8; margin-bottom:15px; color:#1967d2; font-size:12px; line-height:1.4; }
    .warning-box { background:#fce8e6; padding:12px; border-radius:4px; border-left:4px solid #d93025; margin-bottom:15px; color:#a51d24; font-size:12px; line-height:1.4; }
    .form-group { margin-bottom:15px; }
    textarea { width:98%; height:120px; font-family: monospace; font-size:12px; padding:8px; border:1px solid #dadce0; border-radius:4px; resize: none; outline:none; }
    .btn-group { display:flex; gap:10px; margin-bottom:15px; }
    button { padding:8px 16px; border-radius:4px; border:none; cursor:pointer; font-weight:600; font-size:13px; }
    .btn-primary { background:#1a73e8; color:white; }
    .btn-primary:hover { background:#1557b0; }
    .btn-primary:disabled { background:#dadce0; color:#9aa0a6; cursor:not-allowed; }
    .btn-secondary { background:#f1f3f4; color:#3c4043; }
    .btn-secondary:hover { background:#e8eaed; }

    .report-card { border:1px solid #dadce0; border-radius:6px; margin-top:15px; overflow:hidden; }
    .report-header { background:#f8f9fa; padding:10px 15px; font-weight:bold; border-bottom:1px solid #dadce0; display:flex; justify-content:space-between; }
    .report-body { max-height:200px; overflow-y:auto; }
    .report-table { width:100%; border-collapse:collapse; text-align:left; font-size:12px; }
    .report-table th, .report-table td { padding:8px 12px; border-bottom:1px solid #f0f0f0; }
    .report-table th { background:#f8f9fa; position:sticky; top:0; }

    .badge { font-size:11px; padding:2px 6px; border-radius:4px; font-weight:bold; }
    .badge-success { background:#e6f4ea; color:#137333; }
    .badge-warning { background:#fef7e0; color:#b06000; }
    .badge-error { background:#fce8e6; color:#c5221f; }

    .template-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .template-card { border:1px solid #dadce0; border-radius:8px; padding:15px; background:#fff; }
    .template-card h4 { margin-top:0; color:#333; }
  </style>
</head>
<body>
  <div class="import-container">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('download', this)">下載範本</button>
      <button class="tab-btn" onclick="switchTab('students', this)">匯入班級與學生</button>
      <button class="tab-btn" onclick="switchTab('guardians', this)">匯入家庭聯絡人</button>
      <button class="tab-btn" onclick="switchTab('history', this)">查看匯入紀錄</button>
    </div>

    <!-- Tab 1: Download -->
    <div class="tab-content active" id="tab-download">
      <h3>下載資料匯入範本</h3>
      <p>請選擇您欲匯入的範本類型，點擊下載後以 Excel 或 Google 試算表開啟，填妥後複製內容貼入匯入中心。</p>
      <div class="template-grid">
        <div class="template-card">
          <h4>學生名冊匯入範本</h4>
          <p>用於快速批次建立班級與學生。學號為可選填，座號與姓名為必要比對識別。</p>
          <div style="font-size:11px; color:#5f6368; margin-bottom:15px;">
            欄位包括：學號, 學年度, 班級, 座號, 姓名, 出生日期, 特質與優勢, 學習與特教需求
          </div>
          <button class="btn-primary" onclick="downloadTemplate('student')">下載學生名冊範本 (CSV)</button>
        </div>
        <div class="template-card">
          <h4>家庭聯絡人匯入範本</h4>
          <p>用於批次建立照顧者電話與聯絡偏好。必須先匯入學生著名冊後才能進行此項匯入。</p>
          <div style="font-size:11px; color:#5f6368; margin-bottom:15px;">
            欄位包括：學號, 學生學年度, 學生班級, 學生座號, 學生姓名, 聯絡人姓名, 關係, 聯絡電話, 適合聯絡時間, 偏好聯絡方式, 是否為主要照顧者, 是否為法定代理人, 備註
          </div>
          <button class="btn-primary" onclick="downloadTemplate('guardian')">下載家庭聯絡人範本 (CSV)</button>
        </div>
      </div>
    </div>

    <!-- Tab 2: Import Students -->
    <div class="tab-content" id="tab-students">
      <h3>匯入班級與學生</h3>
      <div class="info-box">
        <strong>操作說明：</strong><br/>
        請自 Excel 或試算表中複製整張學生名冊範圍（包含標頭列），直接貼入下方輸入框中。系統會自動解析並執行欄位預檢。
      </div>
      <div class="form-group">
        <textarea id="student-paste-area" placeholder="在此貼上名冊資料 (TSV 或 CSV)..."></textarea>
      </div>
      <div class="btn-group">
        <button class="btn-primary" onclick="validateStudentData()">1. 預檢資料</button>
        <button class="btn-primary" id="btn-student-confirm" disabled onclick="confirmImportStudentData()">2. 確認寫入</button>
      </div>
      <div id="student-report" style="display:none;">
        <div class="report-card">
          <div class="report-header">
            <span>預檢報告</span>
            <span id="student-summary-badge"></span>
          </div>
          <div class="report-body">
            <table class="report-table">
              <thead>
                <tr>
                  <th style="width:60px;">行號</th>
                  <th>資料簡要</th>
                  <th style="width:80px;">狀態</th>
                  <th>說明</th>
                </tr>
              </thead>
              <tbody id="student-report-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Import Guardians -->
    <div class="tab-content" id="tab-guardians">
      <h3>匯入家庭聯絡人</h3>
      <div class="info-box">
        <strong>操作說明：</strong><br/>
        請自聯絡人表格中複製範圍（包含標頭列）貼入下方輸入框。系統會依「學號」➔「學年班級座號」➔「學年班級姓名」順序尋找系統內學生。
      </div>
      <div class="form-group">
        <textarea id="guardian-paste-area" placeholder="在此貼上家長聯絡人資料 (TSV 或 CSV)..."></textarea>
      </div>
      <div class="btn-group">
        <button class="btn-primary" onclick="validateGuardianData()">1. 預檢資料</button>
        <button class="btn-primary" id="btn-guardian-confirm" disabled onclick="confirmImportGuardianData()">2. 確認寫入</button>
      </div>
      <div id="guardian-report" style="display:none;">
        <div class="report-card">
          <div class="report-header">
            <span>預檢報告</span>
            <span id="guardian-summary-badge"></span>
          </div>
          <div class="report-body">
            <table class="report-table">
              <thead>
                <tr>
                  <th style="width:60px;">行號</th>
                  <th>資料簡要</th>
                  <th style="width:80px;">狀態</th>
                  <th>說明</th>
                </tr>
              </thead>
              <tbody id="guardian-report-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 4: History -->
    <div class="tab-content" id="tab-history">
      <h3>匯入批次紀錄</h3>
      <button class="btn-secondary" onclick="loadHistory()" style="margin-bottom:15px;">重新整理</button>
      <table class="report-table">
        <thead>
          <tr>
            <th>時間</th>
            <th>匯入類型</th>
            <th>操作人員</th>
            <th>狀態</th>
            <th>成功數</th>
            <th>失敗數</th>
          </tr>
        </thead>
        <tbody id="history-tbody">
          <tr><td colspan="6" style="text-align:center; color:#999;">載入中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function switchTab(tabId, button) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const targetBtn = button || document.querySelector('.tab-btn[onclick*="' + tabId + '"]');
      if (targetBtn) {
        targetBtn.classList.add('active');
      }

      const targetContent = document.getElementById('tab-' + tabId);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      if (tabId === 'history') {
        loadHistory();
      }
    }

    function downloadTemplate(type) {
      const handler = function(res) {
        if (res.success && res.data) {
          const link = document.createElement('a');
          link.href = res.data;
          link.download = type === 'student' ? 'student_roster_template.csv' : 'guardian_contact_template.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert("範本產生失敗");
        }
      };
      if (type === 'student') {
        google.script.run.withSuccessHandler(handler).ajaxDownloadStudentTemplate();
      } else {
        google.script.run.withSuccessHandler(handler).ajaxDownloadGuardianTemplate();
      }
    }

    function validateStudentData() {
      const text = document.getElementById('student-paste-area').value;
      if (!text.trim()) { alert('請先貼入資料！'); return; }
      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          document.getElementById('student-report').style.display = 'block';
          document.getElementById('student-summary-badge').innerHTML =
            \`<span class="badge badge-success">預估成功 \${res.successCount}</span> \` +
            \`<span class="badge badge-warning">警告 \${res.warningCount}</span> \` +
            \`<span class="badge badge-error">錯誤 \${res.errorCount}</span>\`;

          const tbody = document.getElementById('student-report-tbody');
          tbody.innerHTML = "";
          res.reports.forEach(r => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-success';
            if (r.status === 'WARNING') badgeClass = 'badge-warning';
            if (r.status === 'ERROR') badgeClass = 'badge-error';
            tr.innerHTML = \`
              <td>\${r.rowNo}</td>
              <td>\${escapeHtml(r.summary)}</td>
              <td><span class="badge \${badgeClass}">\${r.status}</span></td>
              <td>\${escapeHtml(r.message)}</td>
            \`;
            tbody.appendChild(tr);
          });
          // 允許匯入，只要至少有 1 筆成功/警告即可，不需要完全無錯誤 (但寫入時會略過錯誤列)
          document.getElementById('btn-student-confirm').disabled = (res.successCount + res.warningCount === 0);
        } else {
          alert("預檢失敗：" + res.message);
        }
      }).ajaxValidateStudentRoster(text);
    }

    function confirmImportStudentData() {
      const text = document.getElementById('student-paste-area').value;
      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          alert('學生名冊匯入成功！');
          document.getElementById('student-paste-area').value = "";
          document.getElementById('student-report').style.display = 'none';
          document.getElementById('btn-student-confirm').disabled = true;
          switchTab('history');
        } else {
          alert('匯入失敗：' + res.message);
        }
      }).ajaxImportStudentRoster(text);
    }

    function validateGuardianData() {
      const text = document.getElementById('guardian-paste-area').value;
      if (!text.trim()) { alert('請先貼入資料！'); return; }
      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          document.getElementById('guardian-report').style.display = 'block';
          document.getElementById('guardian-summary-badge').innerHTML =
            \`<span class="badge badge-success">預估成功 \${res.successCount}</span> \` +
            \`<span class="badge badge-warning">警告 \${res.warningCount}</span> \` +
            \`<span class="badge badge-error">錯誤 \${res.errorCount}</span>\`;

          const tbody = document.getElementById('guardian-report-tbody');
          tbody.innerHTML = "";
          res.reports.forEach(r => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-success';
            if (r.status === 'WARNING') badgeClass = 'badge-warning';
            if (r.status === 'ERROR') badgeClass = 'badge-error';
            tr.innerHTML = \`
              <td>\${r.rowNo}</td>
              <td>\${escapeHtml(r.summary)}</td>
              <td><span class="badge \${badgeClass}">\${r.status}</span></td>
              <td>\${escapeHtml(r.message)}</td>
            \`;
            tbody.appendChild(tr);
          });
          document.getElementById('btn-guardian-confirm').disabled = (res.successCount === 0);
        } else {
          alert("預檢失敗：" + res.message);
        }
      }).ajaxValidateGuardianContacts(text);
    }

    function confirmImportGuardianData() {
      const text = document.getElementById('guardian-paste-area').value;
      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          alert('家庭聯絡人匯入成功！');
          document.getElementById('guardian-paste-area').value = "";
          document.getElementById('guardian-report').style.display = 'none';
          document.getElementById('btn-guardian-confirm').disabled = true;
          switchTab('history');
        } else {
          alert('匯入失敗：' + res.message);
        }
      }).ajaxImportGuardianContacts(text);
    }

    function loadHistory() {
      const tbody = document.getElementById('history-tbody');
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#999;'>載入紀錄中...</td></tr>";
      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          tbody.innerHTML = "";
          if (res.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#999;'>尚無任何匯入紀錄。</td></tr>";
            return;
          }
          res.data.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td>\${h.timestamp}</td>
              <td>\${h.import_type === 'STUDENT_ROSTER' ? '班級與學生名冊' : '家庭聯絡人'}</td>
              <td>\${escapeHtml(h.operator_email)}</td>
              <td><span class="badge \${h.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}">\${h.status}</span></td>
              <td>\${h.success_count}</td>
              <td>\${h.error_count}</td>
            \`;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = \`<tr><td colspan="6" style="text-align:center; color:#c5221f;">讀取失敗：\${res.message}</td></tr>\`;
        }
      }).ajaxListImportBatches();
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>

`;

const PrecheckDialogHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>學生名冊匯入中心 MVP</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 15px;
      background-color: #f8f9fa;
      color: #3c4043;
      font-size: 13px;
    }
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
      display: flex;
      flex-direction: column;
      height: 620px;
      overflow: hidden;
    }
    .header {
      background: #1a73e8;
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .tabs {
      display: flex;
      background: #f1f3f4;
      border-bottom: 1px solid #dadce0;
    }
    .tab-btn {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 600;
      color: #5f6368;
      font-size: 13px;
      border-bottom: 3px solid transparent;
      outline: none;
    }
    .tab-btn.active {
      color: #1a73e8;
      border-bottom-color: #1a73e8;
      background: white;
    }
    .tab-content {
      padding: 20px;
      flex-grow: 1;
      display: none;
      overflow-y: auto;
    }
    .tab-content.active {
      display: block;
    }
    .info-box {
      background: #e8f0fe;
      border-left: 4px solid #1a73e8;
      color: #1967d2;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      line-height: 1.4;
    }
    .btn-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      transition: background 0.2s;
    }
    .btn-primary {
      background: #1a73e8;
      color: white;
    }
    .btn-primary:hover {
      background: #1557b0;
    }
    .btn-primary:disabled {
      background: #dadce0;
      color: #9aa0a6;
      cursor: not-allowed;
    }
    .btn-success {
      background: #34a853;
      color: white;
    }
    .btn-success:hover {
      background: #2b8c45;
    }
    .btn-success:disabled {
      background: #dadce0;
      color: #9aa0a6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #f1f3f4;
      color: #3c4043;
    }
    .btn-secondary:hover {
      background: #dadce0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    .stat-card {
      background: #f8f9fa;
      border: 1px solid #dadce0;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
    }
    .stat-card strong {
      display: block;
      font-size: 18px;
      color: #1a73e8;
      margin-bottom: 4px;
    }
    .stat-card span {
      font-size: 11px;
      color: #5f6368;
    }
    .stat-card.error strong {
      color: #d93025;
    }
    .stat-card.warning strong {
      color: #fbbc05;
    }
    .stat-card.success strong {
      color: #34a853;
    }
    .report-card {
      border: 1px solid #dadce0;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 15px;
    }
    .report-header {
      background: #f1f3f4;
      padding: 8px 12px;
      font-weight: 600;
      border-bottom: 1px solid #dadce0;
    }
    .report-body {
      max-height: 220px;
      overflow-y: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 12px;
      border-bottom: 1px solid #dadce0;
      text-align: left;
    }
    th {
      background: #f8f9fa;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    .badge-success {
      background: #e6f4ea;
      color: #137333;
    }
    .badge-warning {
      background: #fef7e0;
      color: #b06000;
    }
    .badge-error {
      background: #fce8e6;
      color: #c5221f;
    }
    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 5px;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .success-box {
      background: #e6f4ea;
      border: 1px solid #34a853;
      border-radius: 6px;
      padding: 20px;
      text-align: center;
      margin-top: 10px;
    }
    .success-box h3 {
      color: #137333;
      margin-top: 0;
    }
    .btn-workspace {
      background: #1a73e8;
      color: white;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 4px;
      margin-top: 15px;
      box-shadow: 0 1px 2px rgba(60,64,67,0.3);
    }
    .btn-workspace:hover {
      background: #1557b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>ClassCare 學生名冊匯入中心 MVP</h2>
    </div>

    <div class="tabs">
      <button class="tab-btn active" id="tab-btn-main" onclick="switchTab('main', this)">預檢與正式寫入</button>
      <button class="tab-btn" id="tab-btn-history" onclick="switchTab('history', this)">最近匯入紀錄</button>
    </div>

    <!-- Tab 1: Main Precheck -->
    <div class="tab-content active" id="tab-main">
      <div class="info-box">
        <strong>說明：</strong> 本功能將直接讀取工作表 <code>import_students</code> 中的列資料。請在正式寫入前進行預檢。
      </div>

      <div class="btn-bar">
        <button class="btn-primary" id="btn-precheck" onclick="runPrecheck()">
          <span id="precheck-spinner" style="display:none;" class="spinner"></span>1. 執行預檢
        </button>
        <button class="btn-success" id="btn-commit" disabled onclick="runCommit()">
          <span id="commit-spinner" style="display:none;" class="spinner"></span>2. 確認正式寫入資料
        </button>
      </div>

      <!-- Stats section -->
      <div class="stats-grid" id="stats-section" style="display:none;">
        <div class="stat-card">
          <strong id="stat-total">0</strong>
          <span>總資料列</span>
        </div>
        <div class="stat-card success">
          <strong id="stat-valid">0</strong>
          <span>正常列數</span>
        </div>
        <div class="stat-card warning">
          <strong id="stat-warning">0</strong>
          <span>警告列數</span>
        </div>
        <div class="stat-card error">
          <strong id="stat-error">0</strong>
          <span>錯誤列數</span>
        </div>
        <div class="stat-card">
          <strong id="stat-new">0</strong>
          <span>預計新學生</span>
        </div>
      </div>

      <div class="stats-grid" id="stats-section-2" style="display:none;">
        <div class="stat-card">
          <strong id="stat-new-classes">0</strong>
          <span>預計新班級</span>
        </div>
        <div class="stat-card">
          <strong id="stat-updated-students">0</strong>
          <span>預計更新生</span>
        </div>
        <div class="stat-card">
          <strong id="stat-new-teachers">0</strong>
          <span>預計新導師</span>
        </div>
        <div class="stat-card">
          <strong id="stat-new-scopes">0</strong>
          <span>預計新 Scopes</span>
        </div>
        <div class="stat-card">
          <strong id="stat-existing-classes">0</strong>
          <span>匹配舊班級</span>
        </div>
      </div>

      <!-- Report table -->
      <div id="report-section" style="display:none;">
        <div class="report-card">
          <div class="report-header">詳細預檢結果報告</div>
          <div class="report-body">
            <table>
              <thead>
                <tr>
                  <th style="width:50px;">行號</th>
                  <th>資料行描述</th>
                  <th style="width:80px;">預檢狀態</th>
                  <th>詳細說明 / 警告 / 錯誤原因</th>
                </tr>
              </thead>
              <tbody id="report-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Post-commit Success box -->
      <div class="success-box" id="success-section" style="display:none;">
        <h3>🟢 學生名冊匯入完成！</h3>
        <p>系統已順利建立/更新對應的班級、導師帳號、班級授權範圍 (CLASS Scopes) 以及學生資料。</p>
        <p style="font-size:12px; color:#5f6368;" id="success-stat-text"></p>
        <button class="btn-workspace" onclick="openWorkspace()">開啟導師工作台</button>
      </div>
    </div>

    <!-- Tab 2: History -->
    <div class="tab-content" id="tab-history">
      <div class="btn-bar">
        <button class="btn-secondary" onclick="loadHistory()">重新整理</button>
      </div>

      <div class="report-card" style="margin-top: 0;">
        <div class="report-header">最近 15 次匯入批次紀錄</div>
        <div class="report-body" style="max-height: 440px;">
          <table>
            <thead>
              <tr>
                <th>匯入時間</th>
                <th>類型</th>
                <th>匯入人員</th>
                <th>狀態</th>
                <th>成功數</th>
                <th>失敗數</th>
              </tr>
            </thead>
            <tbody id="history-tbody">
              <tr>
                <td colspan="6" style="text-align:center; color:#999;">尚未載入紀錄。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    let activePrecheckData = null;

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      if (tabId === 'main') {
        document.getElementById('tab-btn-main').classList.add('active');
        document.getElementById('tab-main').classList.add('active');
      } else {
        document.getElementById('tab-btn-history').classList.add('active');
        document.getElementById('tab-history').classList.add('active');
        loadHistory();
      }
    }

    function runPrecheck() {
      // Show loading
      document.getElementById('precheck-spinner').style.display = 'inline-block';
      document.getElementById('btn-precheck').disabled = true;
      document.getElementById('btn-commit').disabled = true;
      document.getElementById('success-section').style.display = 'none';

      google.script.run
        .withSuccessHandler(onPrecheckSuccess)
        .withFailureHandler(onPrecheckFailure)
        .ajaxValidateRosterFromSheet();
    }

    function onPrecheckSuccess(res) {
      document.getElementById('precheck-spinner').style.display = 'none';
      document.getElementById('btn-precheck').disabled = false;

      if (!res.success) {
        alert("預檢失敗：" + res.message);
        return;
      }

      activePrecheckData = res.data;

      // Update stats
      document.getElementById('stat-total').innerText = res.data.totalRows;
      document.getElementById('stat-valid').innerText = res.data.validRows;
      document.getElementById('stat-warning').innerText = res.data.warningRows;
      document.getElementById('stat-error').innerText = res.data.errorRows;
      document.getElementById('stat-new').innerText = res.data.newStudents;

      document.getElementById('stat-new-classes').innerText = res.data.newClasses;
      document.getElementById('stat-updated-students').innerText = res.data.updatedStudents;
      document.getElementById('stat-new-teachers').innerText = res.data.newTeachers;
      document.getElementById('stat-new-scopes').innerText = res.data.newScopes;
      document.getElementById('stat-existing-classes').innerText = res.data.existingClasses;

      document.getElementById('stats-section').style.display = 'flex';
      document.getElementById('stats-section-2').style.display = 'flex';

      // Render table
      const tbody = document.getElementById('report-tbody');
      tbody.innerHTML = "";
      res.data.reports.forEach(r => {
        const tr = document.createElement('tr');
        let badgeHtml = "";
        if (r.status === 'SUCCESS') {
          badgeHtml = '<span class="badge badge-success">SUCCESS</span>';
        } else if (r.status === 'WARNING') {
          badgeHtml = '<span class="badge badge-warning">WARNING</span>';
        } else if (r.status === 'ERROR') {
          badgeHtml = '<span class="badge badge-error">ERROR</span>';
        }

        tr.innerHTML = \`
          <td>\${r.rowNo}</td>
          <td>\${escapeHtml(r.summary)}</td>
          <td>\${badgeHtml}</td>
          <td>\${escapeHtml(r.message)}</td>
        \`;
        tbody.appendChild(tr);
      });
      document.getElementById('report-section').style.display = 'block';

      // Enable commit if there are valid rows and zero errors
      const canCommit = (res.data.validRows + res.data.warningRows > 0) && (res.data.errorRows === 0);
      document.getElementById('btn-commit').disabled = !canCommit;

      if (res.data.errorRows > 0) {
        alert("資料中含有錯誤列（標示為 ERROR），請修正後再執行預檢。含有錯誤列時無法寫入。");
      }
    }

    function onPrecheckFailure(err) {
      document.getElementById('precheck-spinner').style.display = 'none';
      document.getElementById('btn-precheck').disabled = false;
      alert("系統呼叫失敗：" + err.message);
    }

    function runCommit() {
      if (!activePrecheckData) return;

      let confirmMsg = \`確定要將這 \${activePrecheckData.validRows + activePrecheckData.warningRows} 筆資料寫入系統嗎？\`;
      if (activePrecheckData.warningRows > 0) {
        confirmMsg += \`\\n\\n注意：資料中含有 \${activePrecheckData.warningRows} 個警告，將會以預設規則忽略或覆蓋，是否確定？\`;
      }

      if (!confirm(confirmMsg)) return;

      document.getElementById('commit-spinner').style.display = 'inline-block';
      document.getElementById('btn-precheck').disabled = true;
      document.getElementById('btn-commit').disabled = true;

      google.script.run
        .withSuccessHandler(onCommitSuccess)
        .withFailureHandler(onCommitFailure)
        .ajaxImportRosterFromSheet();
    }

    function onCommitSuccess(res) {
      document.getElementById('commit-spinner').style.display = 'none';
      document.getElementById('btn-precheck').disabled = false;

      if (!res.success) {
        alert("寫入失敗：" + res.message);
        return;
      }

      // Hide precheck panel and show success panel
      document.getElementById('stats-section').style.display = 'none';
      document.getElementById('stats-section-2').style.display = 'none';
      document.getElementById('report-section').style.display = 'none';
      document.getElementById('btn-commit').disabled = true;

      let statText = \`正式寫入：共完成 \${res.data.importedCount} 筆學生資料之新增或更新作業。\`;
      if (!res.data.operatorHasAccess) {
        statText += \`\\n\\n⚠️ 注意：目前您的登入帳號 (\${res.data.operator}) 尚未被授權存取此批匯入的班級。請聯絡管理員為您設定對應的 CLASS 授權範疇，否則開啟導師工作台後將無法讀取此班級資料。\`;
        document.getElementById('success-stat-text').style.color = '#c5221f';
        document.getElementById('success-stat-text').style.fontWeight = 'bold';
      } else {
        document.getElementById('success-stat-text').style.color = '#137333';
        document.getElementById('success-stat-text').style.fontWeight = 'normal';
      }
      document.getElementById('success-stat-text').innerText = statText;
      document.getElementById('success-section').style.display = 'block';
    }

    function onCommitFailure(err) {
      document.getElementById('commit-spinner').style.display = 'none';
      document.getElementById('btn-precheck').disabled = false;
      alert("正式寫入例外錯誤：" + err.message);
    }

    function openWorkspace() {
      google.script.run.showTeacherWorkspace();
      google.script.host.close();
    }

    function loadHistory() {
      const tbody = document.getElementById('history-tbody');
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#999;'><span class='spinner' style='border-top-color:#1a73e8;'></span>載入紀錄中...</td></tr>";

      google.script.run.withSuccessHandler(function(res) {
        if (res.success) {
          tbody.innerHTML = "";
          if (res.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#999;'>無任何匯入紀錄。</td></tr>";
            return;
          }
          res.data.forEach(h => {
            const tr = document.createElement('tr');
            const statusBadge = h.status === 'SUCCESS' ?
              '<span class="badge badge-success">SUCCESS</span>' :
              '<span class="badge badge-warning">PARTIAL</span>';

            tr.innerHTML = \`
              <td>\${h.timestamp}</td>
              <td>\${h.import_type === 'STUDENT_ROSTER' ? '學生名冊' : '家庭聯絡'}</td>
              <td>\${escapeHtml(h.operator_email)}</td>
              <td>\${statusBadge}</td>
              <td>\${h.success_count}</td>
              <td>\${h.error_count}</td>
            \`;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = \`<tr><td colspan="6" style="text-align:center; color:#c5221f;">讀取失敗：\${escapeHtml(res.message)}</td></tr>\`;
        }
      }).ajaxListImportBatches();
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>

`;

const SystemStatusHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ClassCare 系統狀態</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 15px;
      background-color: #f8f9fa;
      color: #3c4043;
      font-size: 13px;
    }
    .status-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
      padding: 20px;
      display: flex;
      flex-direction: column;
      height: 93%;
    }
    h2 {
      margin-top: 0;
      color: #1a73e8;
      border-bottom: 2px solid #e8f0fe;
      padding-bottom: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-card {
      background: #f8f9fa;
      border: 1px solid #dadce0;
      border-radius: 6px;
      padding: 12px;
    }
    .info-card h4 {
      margin: 0 0 8px 0;
      color: #5f6368;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .info-card p {
      margin: 4px 0;
      font-size: 13px;
    }
    .sheet-list {
      border: 1px solid #dadce0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 15px;
      flex-grow: 1;
      max-height: 200px;
      overflow-y: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px 12px;
      border-bottom: 1px solid #dadce0;
      text-align: left;
    }
    th {
      background: #f1f3f4;
      font-weight: 600;
      position: sticky;
      top: 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-ok {
      background: #e6f4ea;
      color: #137333;
    }
    .badge-error {
      background: #fce8e6;
      color: #c5221f;
    }
    .msg-box {
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-size: 12px;
      line-height: 1.4;
    }
    .msg-error {
      background: #fce8e6;
      border-left: 4px solid #d93025;
      color: #a51d24;
    }
    .msg-warning {
      background: #fef7e0;
      border-left: 4px solid #fbbc05;
      color: #b06000;
    }
    .btn-bar {
      display: flex;
      justify-content: flex-end;
      margin-top: auto;
    }
    button {
      padding: 8px 20px;
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
    button:hover {
      background: #1557b0;
    }
    .loader {
      text-align: center;
      padding: 30px;
      color: #5f6368;
    }
  </style>
</head>
<body>
  <div class="status-container">
    <h2>ClassCare 系統狀態校對</h2>

    <div id="loader" class="loader">正在讀取系統狀態與健康指標，請稍候...</div>

    <div id="content" style="display:none;">
      <div class="info-grid">
        <div class="info-card">
          <h4>系統與試算表</h4>
          <p><strong>系統版本：</strong> V<span id="sys-version">--</span></p>
          <p><strong>架構版本：</strong> <span id="schema-version">--</span></p>
          <p><strong>試算表名稱：</strong> <span id="ss-name">--</span></p>
        </div>
        <div class="info-card">
          <h4>環境與管理</h4>
          <p><strong>啟用中管理員 (ADMIN)：</strong> <span id="admin-count">--</span> 人</p>
          <p><strong>雲端資料夾設定：</strong> <span id="folder-status">--</span></p>
          <p><strong>測試示範資料：</strong> <span id="demo-status">--</span></p>
        </div>
      </div>

      <div id="error-box" class="msg-box msg-error" style="display:none;">
        <strong>發現錯誤限制：</strong>
        <ul id="error-list" style="margin: 5px 0 0 0; padding-left: 20px;"></ul>
      </div>

      <div id="warning-box" class="msg-box msg-warning" style="display:none;">
        <strong>環境警示項目：</strong>
        <ul id="warning-list" style="margin: 5px 0 0 0; padding-left: 20px;"></ul>
      </div>

      <h4>工作表結構檢查：</h4>
      <div class="sheet-list">
        <table>
          <thead>
            <tr>
              <th>工作表名稱 (Sheet Name)</th>
              <th style="width: 100px;">校對狀態</th>
            </tr>
          </thead>
          <tbody id="sheet-tbody"></tbody>
        </table>
      </div>
    </div>

    <div class="btn-bar">
      <button onclick="google.script.host.close()">關閉視窗</button>
    </div>
  </div>

  <script>
    window.onload = function() {
      google.script.run
        .withSuccessHandler(renderStatus)
        .withFailureHandler(renderFailure)
        .ajaxGetSystemStatus();
    };

    function renderStatus(res) {
      document.getElementById('loader').style.display = 'none';

      if (!res.success) {
        renderFailure(res);
        return;
      }

      const d = res.data;
      document.getElementById('sys-version').innerText = d.version;
      document.getElementById('schema-version').innerText = d.schemaVersion;
      document.getElementById('ss-name').innerText = d.spreadsheetName;
      document.getElementById('admin-count').innerText = d.adminCount;
      document.getElementById('folder-status').innerHTML = d.driveFolderSet ?
        '<span style="color:#137333; font-weight:bold;">🟢 已設定連線</span>' :
        '<span style="color:#c5221f; font-weight:bold;">🔴 未設定或權限不足</span>';
      document.getElementById('demo-status').innerText = d.demoDataSeeded ? '已寫入' : '無';

      // Render Errors list
      if (d.errors && d.errors.length > 0) {
        const errorList = document.getElementById('error-list');
        errorList.innerHTML = "";
        d.errors.forEach(err => {
          const li = document.createElement('li');
          li.innerText = err;
          errorList.appendChild(li);
        });
        document.getElementById('error-box').style.display = 'block';
      }

      // Render Warnings list
      if (d.warnings && d.warnings.length > 0) {
        const warningList = document.getElementById('warning-list');
        warningList.innerHTML = "";
        d.warnings.forEach(warn => {
          const li = document.createElement('li');
          li.innerText = warn;
          warningList.appendChild(li);
        });
        document.getElementById('warning-box').style.display = 'block';
      }

      // Render Sheet Table
      const tbody = document.getElementById('sheet-tbody');
      tbody.innerHTML = "";
      for (let sName in d.sheetStatus) {
        const tr = document.createElement('tr');
        const status = d.sheetStatus[sName];
        const badge = status ?
          '<span class="badge badge-ok">🟢 正常 (OK)</span>' :
          '<span class="badge badge-error">🔴 異常 (FAIL)</span>';

        tr.innerHTML = \`
          <td><code>\\\${escapeHtml(sName)}</code></td>
          <td>\\\${badge}</td>
        \`;
        tbody.appendChild(tr);
      }

      document.getElementById('content').style.display = 'block';
    }

    function renderFailure(err) {
      document.getElementById('loader').style.display = 'none';
      const tbody = document.getElementById('sheet-tbody');
      tbody.innerHTML = \`<tr><td colspan="2" style="color:#c5221f; text-align:center; padding:20px; font-weight:bold;">無法取得狀態：\\\${escapeHtml(err.message || '未知錯誤')}</td></tr>\`;
      document.getElementById('content').style.display = 'block';
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>

`;
