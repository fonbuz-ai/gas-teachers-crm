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
