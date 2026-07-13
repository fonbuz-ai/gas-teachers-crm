# ClassCare 班級關懷工作台 — 資料庫模型 (Data Model)

本系統使用單一 Google Spreadsheet 作為關聯式資料庫。所有工作表均在初始化階段由 `SetupService.setupSystem()` 自動建立。

> [!NOTE]
> **當前狀態**：此資料模型已編寫文件（`DOCUMENTED`），對應的初始化與驗證服務程式碼已實作完成（`IMPLEMENTED`）。
> 本資料庫模型已完整適配 **「班級轉銜與學生理解工作台」** 之資料最小化脫敏原則，機密 Drive 網址不對導師端 API 回傳，家長電話號碼在服務層輸出時會進行遮罩掩碼。

---

## 1. 全域格式規範
*   **ID 格式**：所有資料表主鍵（Primary Key）除設定金鑰外，均使用 **UUID (v4)** 格式，由 `Utilities.getUuid()` 生成。不使用身分證字號或流水號。
*   **日期格式**：所有時間標籤統一採用 `Asia/Taipei` 時區之 `YYYY-MM-DD HH:mm:ss` 字串格式。
*   **狀態表示**：一律使用大寫英文列舉。

---

## 2. 授權範圍設計評估：`user_scopes`
本系統使用獨立的 **`user_scopes`** 工作表，以進行細緻且具擴充性的權限範圍管理。可支援以「班級 (CLASS)」、「年級 (GRADE)」、「學生 (STUDENT)」或「全校 (ALL_CLASSES)」為單位的資料存取範圍，防範權限篡改，並引入效期與審查追蹤欄位。

---

## 3. 工作表欄位結構 (Worksheets Structure)

### 1. `users` (使用者帳號表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `user_id` | String (UUID) | 主鍵 |
| `email` | String | 登入 Google 帳號 (唯一值，身份驗證基準) |
| `name` | String | 使用者姓名 |
| `role` | String | 角色名稱 (`ADMIN`, `DIRECTOR`, `CLASS_TEACHER`, `HEALTH_CENTER`, `COUNSELOR`, `SUBSIDY_OFFICER`, `READ_ONLY`) |
| `active` | Boolean | 啟用狀態 (`TRUE` / `FALSE`) |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 2. `user_scopes` (使用者授權範圍表 — 核心授權)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `scope_id` | String (UUID) | 主鍵 |
| `user_email` | String | 外鍵 (對照 `users.email`) |
| `scope_type` | String | 授權範圍類型 (`ALL_CLASSES`, `GRADE`, `CLASS`, `STUDENT`) |
| `scope_value` | String | 授權標的值（`scope_type` 為 `CLASS` 時填入 `class_id`；為 `GRADE` 時填入年級數字如 `5`；為 `STUDENT` 時填入 `student_id`；為 `ALL_CLASSES` 時填入 `*`） |
| `active` | Boolean | 是否啟用 (`TRUE` / `FALSE`) |
| `effective_from`| Date | 授權效期起日 |
| `effective_to` | Date | 授權效期迄日 |
| `reason` | String | 授權原因與備註 |
| `created_by` | String | 授權建立者 Email |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 3. `classes` (班級表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `class_id` | String (UUID) | 主鍵 |
| `school_year` | Number | 學年度 (例如 `114`) |
| `class_name` | String | 班級名稱 (例如 `五年三班`) |
| `grade` | Number | 年級 (例如 `5`) |
| `teacher_email` | String | 導師 Email |
| `status` | String | 班級狀態 (`ACTIVE` / `ARCHIVED`) |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 4. `students` (學生基本資料表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `student_id` | String (UUID) | 主鍵 (不得使用身分證字號) |
| `school_year` | Number | 當前學年度 |
| `class_id` | String (UUID) | 外鍵 (對照 `classes.class_id`) |
| `seat_no` | Number | 座號 |
| `student_name` | String | 學生姓名 |
| `birth_date` | Date (YYYY-MM-DD) | 出生年月日 |
| `status` | String | 狀態 (`ACTIVE` / `ARCHIVED`) |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 5. `guardians` (家長與主要照顧者表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `guardian_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `name` | String | 家長姓名 |
| `relationship` | String | 關係 (如 `父`, `母`, `祖母`) |
| `is_legal_guardian`| Boolean | 是否為法定代理人 (`TRUE` / `FALSE`) |
| `is_primary_caregiver`| Boolean | 是否為主要照顧者 (`TRUE` / `FALSE`) |
| `phone` | String | 聯絡電話 |
| `contact_time` | String | 適合聯絡時間 |
| `contact_method` | String | 偏好聯絡方式 (如 `電話`, `LINE`, `聯絡簿`) |
| `pickup_permission`| Boolean | 是否有接送權限 (`TRUE` / `FALSE`) |
| `notes` | String | 備註 (無負面評語) |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 6. `student_support_profiles` (學生支持與學習引導摘要表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `profile_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `strengths` | String | 優勢能力與特質 |
| `learning_needs` | String | 學習與特教需求 |
| `emotional_support`| String | 情緒行為支持方針 |
| `peer_interaction` | String | 同儕互動與人際支持 |
| `effective_strategies`| String| 有效的引導策略 (推薦作法) |
| `avoid_strategies` | String | 應避免的互動模式 (地雷區) |
| `transition_notes` | String | 轉銜注意事項 |
| `source_type` | String | 資料來源類型（列舉：`PARENT_REPORT`, `TEACHER_OBSERVATION`, `HEALTH_CENTER`, `COUNSELING_OFFICE`, `SCHOOL_RECORD`, `GOVERNMENT_RECORD`, `MEDICAL_DOCUMENT`, `OTHER`） |
| `verified_status` | String | 審核狀態（列舉：`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`） |
| `verified_by` | String | 審核人員 Email |
| `verified_at` | DateTime | 審核時間 |
| `effective_from` | Date | 時效啟始日 |
| `effective_to` | Date | 時效截止日 |
| `review_date` | Date | 預計定期評估日期 |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 7. `health_alerts` (健康行動提醒表 — 敏感)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `health_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `alert_level` | String | 提醒等級 (`LOW`, `MEDIUM`, `HIGH`) |
| `teacher_summary` | String | **導師行動摘要** (例如：氣喘，書包內備有吸入劑) |
| `possible_symptoms`| String | 可能發作症狀 |
| `first_action` | String | 發作時第一時間處置步驟 |
| `contact_guardian` | Boolean | 發作時是否立即通知家長 (`TRUE` / `FALSE`) |
| `notify_health_center`| Boolean | 是否通知健康中心 (`TRUE` / `FALSE`) |
| `activity_restriction`| String| 體育課或體能活動限制 |
| `restricted_document_url`| String| 限管文件雲端連結 (限 HEALTH_CENTER / ADMIN 存取) |
| `source_type` | String | 資料來源類型（列舉：`PARENT_REPORT`, `TEACHER_OBSERVATION`, `HEALTH_CENTER`, `COUNSELING_OFFICE`, `SCHOOL_RECORD`, `GOVERNMENT_RECORD`, `MEDICAL_DOCUMENT`, `OTHER`） |
| `verified_status` | String | 審核狀態（列舉：`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`） |
| `verified_by` | String | 審核者 Email (健康中心) |
| `verified_at` | DateTime | 審核時間 |
| `effective_from` | Date | 效期啟始日 |
| `effective_to` | Date | 效期截止日 |
| `review_date` | Date | 定期審核日期 |
| `created_by` | String | 建立者 Email |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 8. `subsidy_records` (補助申請紀錄表 — 敏感)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `record_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `school_year` | Number | 申請學年度 |
| `subsidy_type` | String | 補助項目 (例如：午餐補助、書籍費減免) |
| `application_status`| String | 辦理狀態 (`APPLIED`, `APPROVED`, `REJECTED`) |
| `approved_period` | String | 核定期間 |
| `case_owner` | String | 案件承辦人員 Email |
| `document_status` | String | 證明文件齊備狀態 |
| `restricted_document_url`| String| 限管資格文件連結 (限 SUBSIDY_OFFICER / ADMIN 存取) |
| `source_type` | String | 資料來源類型（列舉：`PARENT_REPORT`, `TEACHER_OBSERVATION`, `HEALTH_CENTER`, `COUNSELING_OFFICE`, `SCHOOL_RECORD`, `GOVERNMENT_RECORD`, `MEDICAL_DOCUMENT`, `OTHER`） |
| `verified_status` | String | 審核狀態（列舉：`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`） |
| `verified_by` | String | 審核者 Email (補助承辦) |
| `verified_at` | DateTime | 審核時間 |
| `effective_from` | Date | 效期啟始日 |
| `effective_to` | Date | 效期截止日 |
| `next_review_date` | Date | 下次審查日期 |
| `notes` | String | 備註說明 |
| `created_by` | String | 建立者 Email |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 9. `contact_logs` (親師聯絡紀錄表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `log_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `contact_date` | Date | 聯絡日期 |
| `contact_method` | String | 聯絡方式 (如 `電話`, `家庭訪問`, `面談`) |
| `contact_person` | String | 聯絡家長對象姓名 |
| `topic` | String | 主題摘要 |
| `objective_summary`| String | 客觀談話內容摘要 (無負面文字描述) |
| `guardian_response`| String | 家長回饋與態度摘要 |
| `agreement` | String | 達成的親師共識 |
| `follow_up_action` | String | 導師/學校後續行動 |
| `follow_up_date` | Date | 預計追蹤日期 |
| `created_by` | String | 建立者 Email |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 10. `follow_up_tasks` (待辦與追蹤事項表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `task_id` | String (UUID) | 主鍵 |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`) |
| `task_type` | String | 類型 (`SUPPORT`, `HEALTH`, `SUBSIDY`, `CONTACT`) |
| `task_title` | String | 任務標題 |
| `description` | String | 詳細待辦內容 |
| `due_date` | Date | 截止日期 |
| `owner_email` | String | 負責人 Email |
| `status` | String | 狀態 (`TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| `priority` | String | 優先度 (`LOW`, `NORMAL`, `HIGH`, `URGENT`) |
| `source_record_id` | String (UUID) | 觸發來源的關聯 ID (如對照 `contact_logs.log_id`) |
| `created_by` | String | 建立者 Email |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 11. `access_logs` (存取稽核紀錄表 — 敏感)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `log_id` | String (UUID) | 主鍵 |
| `timestamp` | DateTime | 記錄時間 |
| `user_email` | String | 存取人員 Email (以伺服器 Session 為主) |
| `action` | String | 操作動作 (`READ`, `CREATE`, `UPDATE`, `DELETE`) |
| `module` | String | 操作模組 (`HEALTH_ALERTS`, `SUBSIDY_RECORDS`, `GUARDIANS`) |
| `student_id` | String (UUID) | 外鍵 (對照 `students.student_id`，若無則空) |
| `class_id` | String (UUID) | 外鍵 (對照 `classes.class_id`，若無則空) |
| `result` | String | 操作結果 (`SUCCESS` / `FAILED_UNAUTHORIZED`) |
| `metadata` | String | 額外日誌，儲存 JSON 格式中繼資料。**嚴禁儲存任何敏感值**（如電話、真實疾病名、補助金額）。 |

### 13. `import_batches` (匯入批次紀錄表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `batch_id` | String (UUID) | 主鍵 |
| `timestamp` | DateTime | 記錄時間 (`imported_at`) |
| `operator_email` | String | 操作人員 Email (`imported_by`) |
| `import_type` | String | 匯入類型 (`STUDENT_ROSTER` / `GUARDIAN_CONTACTS`) |
| `filename` | String | 來源名稱或工作表名稱 |
| `status` | String | 匯入狀態 (`SUCCESS` / `PARTIAL` / `FAILED`) |
| `success_count` | Number | 成功筆數 (`success_rows`) |
| `error_count` | Number | 錯誤筆數 (`error_rows`) |
| `created_at` | DateTime | 建立時間 |

### 14. `import_errors` (匯入錯誤明細表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `error_id` | String (UUID) | 主鍵 |
| `batch_id` | String (UUID) | 關聯批次 ID |
| `row_no` | Number | 原始資料行號 |
| `raw_data_summary`| String | 原始資料簡要識別 (例如：姓名+座號，不保存完整敏感個資如身分證號或疾病) |
| `error_message` | String | 錯誤原因說明 |
| `created_at` | DateTime | 建立時間 |

### 15. `import_student_mapping` (學生匯入對照表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `mapping_id` | String (UUID) | 主鍵 |
| `student_number` | String | 外部學號 (唯一值識別，選填) |
| `school_year` | Number | 學年度 |
| `class_name` | String | 班級名稱 (如五年三班) |
| `seat_no` | Number | 座號 |
| `student_name` | String | 學生姓名 |
| `student_id` | String (UUID) | 對應的系統內部唯一 student_id (外鍵對照 `students.student_id`) |
| `created_at` | DateTime | 建立時間 |
| `updated_at` | DateTime | 最後更新時間 |

### 16. `import_students` (學生名冊匯入暫存表)
| 欄位名 | 類型 | 說明 |
| :--- | :--- | :--- |
| `school_year` | Number | 學年度 (必填，如 114) |
| `class_name` | String | 班級名稱 (必填，如五年三班) |
| `grade` | Number | 年級 (如 5) |
| `seat_no` | Number | 座號 (必填，如 12) |
| `student_name` | String | 學生姓名 (必填) |
| `student_number` | String | 學號 (選填，用於對照) |
| `status` | String | 在學狀態 (必填，限 `ACTIVE`, `INACTIVE`, `TRANSFERRED`) |
| `teacher_email` | String | 班級導師信箱 (選填，自動與使用者與 Scopes 連動) |

---

## 4. 資料庫版本與移轉原則 (Schema Migration Principles)

### 4.1 `SCHEMA_VERSION` 定義
*   本資料庫之版本控管以 `system_settings` 中的 `SCHEMA_VERSION` 設定值為依據（初始值為 `1.0`）。
*   此設定值代表當前試算表各工作表之欄位配置架構。

### 4.2 資料庫架構擴充與相容性原則
1.  **向下相容 (Backward Compatibility)**：
    *   新增欄位必須一律**附加於工作表欄位之最後方**。
    *   後端 `DataRepository.gs` 欄位索引機制會動態查核目前最右側欄位，避免硬編碼列索引。
    *   **嚴禁在未執行遷移指令前刪除、修改、重新編排現有欄位**。
2.  **升級遷移 (Upgrade Migration)**：
    *   當涉及重大變更時，必須在 `SetupService.gs` 中實作對應的升級補丁（例如 `SetupService.migrateToVersion1_1()`）。
    *   該補丁必須使用 `LockService` 獨佔鎖定试算表。
    *   若遇必填欄位新增，必須指定安全的預設值，不得導致現有資料庫查詢崩潰。
    *   任何破壞性的變更皆必須在 `MigrationService.gs` (規劃中) 中提供回滾 (Rollback) 機制。
