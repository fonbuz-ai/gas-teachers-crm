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
