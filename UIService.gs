// File: UIService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const UIService = {
  // 開啟導師工作台 (大型模態對話框)
  openTeacherWorkspace: function() {
    const html = HtmlService.createTemplateFromFile("Index")
      .evaluate()
      .setTitle("ClassCare 班級轉銜與學生理解工作台")
      .setWidth(1100)
      .setHeight(760);
    SpreadsheetApp.getUi().showModalDialog(html, "導師工作台");
  },

  // 開啟系統管理側邊欄 (原 openSidebar 重命名)
  openSystemSidebar: function() {
    const html = HtmlService.createHtmlOutputFromFile("AdminView")
      .setTitle("ClassCare 系統管理");
    SpreadsheetApp.getUi().showSidebar(html);
  },

  // 開啟設定精靈
  openSetupWizard: function() {
    const html = HtmlService.createHtmlOutputFromFile("Index") // 可簡化
      .setWidth(500)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, "啟動設定精靈");
  },

  // 開啟匯入中心
  openImportCenter: function() {
    const html = HtmlService.createHtmlOutputFromFile("ImportCenter")
      .setWidth(900)
      .setHeight(650);
    SpreadsheetApp.getUi().showModalDialog(html, "匯入中心");
  },

  // 開啟預檢與匯入對話框
  openPrecheckDialog: function() {
    const html = HtmlService.createHtmlOutputFromFile("PrecheckDialog")
      .setWidth(950)
      .setHeight(680);
    SpreadsheetApp.getUi().showModalDialog(html, "學生名冊匯入中心 MVP");
  },

  // 開啟系統狀態校對對話框 (新增實作)
  openSystemStatus: function() {
    const html = HtmlService.createTemplateFromFile("SystemStatus")
      .evaluate()
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
