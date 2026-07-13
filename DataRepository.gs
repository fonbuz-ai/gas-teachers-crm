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
