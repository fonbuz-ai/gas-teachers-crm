// File: Config.gs
const Config = {
  // 取得試算表 ID
  getSpreadsheetId: function() {
    let id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!id) {
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSs) {
        id = activeSs.getId();
        PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", id);
      } else {
        throw new Error("系統設定錯誤：無法取得目前綁定的 Google 試算表。");
      }
    }
    return id;
  },

  // 取得雲端硬碟限制附件資料夾 ID
  getDriveFolderId: function() {
    const id = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID");
    if (!id) {
      throw new Error("系統設定錯誤：未設定 DRIVE_FOLDER_ID 於指令碼屬性中。");
    }
    return id;
  },

  // 系統時區與語系設定
  TIME_ZONE: "Asia/Taipei",

  // 試算表工作表名稱對照
  SHEET_NAMES: {
    USERS: "users",
    USER_SCOPES: "user_scopes",
    CLASSES: "classes",
    STUDENTS: "students",
    GUARDIANS: "guardians",
    SUPPORT_PROFILES: "student_support_profiles",
    HEALTH_ALERTS: "health_alerts",
    SUBSIDY_RECORDS: "subsidy_records",
    CONTACT_LOGS: "contact_logs",
    FOLLOW_UP_TASKS: "follow_up_tasks",
    ACCESS_LOGS: "access_logs",
    SYSTEM_SETTINGS: "system_settings",
    IMPORT_BATCHES: "import_batches",
    IMPORT_ERRORS: "import_errors",
    IMPORT_STUDENT_MAPPING: "import_student_mapping",
    IMPORT_STUDENTS: "import_students"
  },

  // 各資料表欄位定義 (Schemas) — 不可隨意更動排列順序以維持向下相容性
  SCHEMAS: {
    USERS: [
      "user_id",
      "email",
      "name",
      "role",
      "active",
      "created_at",
      "updated_at"
    ],
    USER_SCOPES: [
      "scope_id",
      "user_email",
      "scope_type",
      "scope_value",
      "active",
      "effective_from",
      "effective_to",
      "reason",
      "created_by",
      "created_at",
      "updated_at"
    ],
    CLASSES: [
      "class_id",
      "school_year",
      "class_name",
      "grade",
      "teacher_email",
      "status",
      "created_at",
      "updated_at"
    ],
    STUDENTS: [
      "student_id",
      "school_year",
      "class_id",
      "seat_no",
      "student_name",
      "birth_date",
      "status",
      "created_at",
      "updated_at"
    ],
    GUARDIANS: [
      "guardian_id",
      "student_id",
      "name",
      "relationship",
      "is_legal_guardian",
      "is_primary_caregiver",
      "phone",
      "contact_time",
      "contact_method",
      "pickup_permission",
      "notes",
      "created_at",
      "updated_at"
    ],
    SUPPORT_PROFILES: [
      "profile_id",
      "student_id",
      "strengths",
      "learning_needs",
      "emotional_support",
      "peer_interaction",
      "effective_strategies",
      "avoid_strategies",
      "transition_notes",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "review_date",
      "created_at",
      "updated_at"
    ],
    HEALTH_ALERTS: [
      "health_id",
      "student_id",
      "alert_level",
      "teacher_summary",
      "possible_symptoms",
      "first_action",
      "contact_guardian",
      "notify_health_center",
      "activity_restriction",
      "restricted_document_url",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "review_date",
      "created_by",
      "created_at",
      "updated_at"
    ],
    SUBSIDY_RECORDS: [
      "record_id",
      "student_id",
      "school_year",
      "subsidy_type",
      "application_status",
      "approved_period",
      "case_owner",
      "document_status",
      "restricted_document_url",
      "source_type",
      "verified_status",
      "verified_by",
      "verified_at",
      "effective_from",
      "effective_to",
      "next_review_date",
      "notes",
      "created_by",
      "created_at",
      "updated_at"
    ],
    CONTACT_LOGS: [
      "log_id",
      "student_id",
      "contact_date",
      "contact_method",
      "contact_person",
      "topic",
      "objective_summary",
      "guardian_response",
      "agreement",
      "follow_up_action",
      "follow_up_date",
      "created_by",
      "created_at",
      "updated_at"
    ],
    FOLLOW_UP_TASKS: [
      "task_id",
      "student_id",
      "task_type",
      "task_title",
      "description",
      "due_date",
      "owner_email",
      "status",
      "priority",
      "source_record_id",
      "created_by",
      "created_at",
      "updated_at"
    ],
    ACCESS_LOGS: [
      "log_id",
      "timestamp",
      "user_email",
      "action",
      "module",
      "student_id",
      "class_id",
      "result",
      "metadata"
    ],
    SYSTEM_SETTINGS: [
      "setting_key",
      "setting_value",
      "description",
      "updated_by",
      "updated_at"
    ],
    IMPORT_BATCHES: [
      "batch_id",
      "timestamp",
      "operator_email",
      "import_type",
      "filename",
      "status",
      "success_count",
      "error_count",
      "created_at"
    ],
    IMPORT_ERRORS: [
      "error_id",
      "batch_id",
      "row_no",
      "raw_data_summary",
      "error_message",
      "created_at"
    ],
    IMPORT_STUDENT_MAPPING: [
      "mapping_id",
      "student_number",
      "school_year",
      "class_name",
      "seat_no",
      "student_name",
      "student_id",
      "created_at",
      "updated_at"
    ],
    IMPORT_STUDENTS: [
      "school_year",
      "class_name",
      "grade",
      "seat_no",
      "student_name",
      "student_number",
      "status",
      "teacher_email"
    ]
  }
};
