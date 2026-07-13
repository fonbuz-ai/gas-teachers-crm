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
