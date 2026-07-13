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
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
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
