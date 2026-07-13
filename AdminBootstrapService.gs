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
