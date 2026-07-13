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
