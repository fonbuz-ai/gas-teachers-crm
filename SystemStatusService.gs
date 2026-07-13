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
