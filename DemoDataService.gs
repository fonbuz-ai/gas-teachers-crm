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
